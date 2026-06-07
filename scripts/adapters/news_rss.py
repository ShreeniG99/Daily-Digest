"""News adapter: RSS/Atom feeds (incl. Substacks) + Hacker News via Algolia.

Sources come entirely from config:
  news.rss               - blog/news RSS feed URLs
  substacks              - Substack feed URLs (RSS too, listed separately)
  news.hackernews_queries - search terms run against the HN Algolia API

A single bad feed or query is logged and skipped; it never aborts the run.
"""
from __future__ import annotations

import html
import re
import time
from calendar import timegm
from urllib.parse import urlsplit

import email.utils
import xml.etree.ElementTree as ET

import requests

from .base import SourceAdapter
from ..schema import Item

HN_API = "http://hn.algolia.com/api/v1/search_by_date"
_TAG_RE = re.compile(r"<[^>]+>")

# XML namespaces commonly found in Atom feeds
_NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "dc": "http://purl.org/dc/elements/1.1/",
    "content": "http://purl.org/rss/1.0/modules/content/",
}


def _strip_html(text: str) -> str:
    return html.unescape(_TAG_RE.sub("", text or "")).strip()


def _parse_date(date_str: str) -> float:
    if not date_str:
        return 0.0
    date_str = date_str.strip()
    # Try RFC-2822 (RSS)
    try:
        return float(timegm(email.utils.parsedate(date_str)))
    except Exception:
        pass
    # Try ISO-8601 (Atom)
    try:
        import datetime
        date_str = re.sub(r'Z$', '+00:00', date_str)
        return datetime.datetime.fromisoformat(date_str).timestamp()
    except Exception:
        return 0.0


def _text(el, tag: str, ns: str = "") -> str:
    full_tag = f"{{{_NS[ns]}}}{tag}" if ns else tag
    child = el.find(full_tag)
    return (child.text or "").strip() if child is not None else ""


def _parse_rss(root: ET.Element, url: str) -> tuple[str, list[dict]]:
    channel = root.find("channel")
    if channel is None:
        return urlsplit(url).netloc, []
    source = _text(channel, "title") or urlsplit(url).netloc
    entries = []
    for item in channel.findall("item"):
        link = _text(item, "link")
        title = _text(item, "title")
        pub = _text(item, "pubDate") or _text(item, "date", "dc")
        summary = _text(item, "description") or _text(item, "encoded", "content")
        author = _text(item, "author") or _text(item, "creator", "dc")
        entries.append({"title": title, "link": link, "published": pub,
                        "summary": summary, "author": author})
    return source, entries


def _parse_atom(root: ET.Element, url: str) -> tuple[str, list[dict]]:
    source = _text(root, "title", "atom") or urlsplit(url).netloc
    entries = []
    for entry in root.findall(f"{{{_NS['atom']}}}entry"):
        title = _text(entry, "title", "atom")
        link_el = entry.find(f"{{{_NS['atom']}}}link[@rel='alternate']")
        if link_el is None:
            link_el = entry.find(f"{{{_NS['atom']}}}link")
        link = (link_el.get("href", "") if link_el is not None else "")
        pub = _text(entry, "published", "atom") or _text(entry, "updated", "atom")
        summary = _text(entry, "summary", "atom") or _text(entry, "content", "atom")
        author_el = entry.find(f"{{{_NS['atom']}}}author")
        author = _text(author_el, "name", "atom") if author_el is not None else ""
        entries.append({"title": title, "link": link, "published": pub,
                        "summary": summary, "author": author})
    return source, entries


def _parse_feed(xml_text: str, url: str) -> tuple[str, list[dict]]:
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return urlsplit(url).netloc, []
    tag = root.tag
    if "rss" in tag or tag == "rss":
        return _parse_rss(root, url)
    if "feed" in tag.lower() or tag == f"{{{_NS['atom']}}}feed":
        return _parse_atom(root, url)
    # Try both
    if root.find("channel") is not None:
        return _parse_rss(root, url)
    return _parse_atom(root, url)


class NewsRSSAdapter(SourceAdapter):
    name = "news_rss"
    kind = "news"

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        since_ts = state.get("since_ts", 0.0)
        now = time.time()
        items: list[Item] = []

        news_cfg = cfg.get("news") or {}
        feed_urls = list(news_cfg.get("rss") or []) + list(cfg.get("substacks") or [])
        for url in feed_urls:
            items.extend(self._fetch_feed(url, since_ts, now))

        for query in news_cfg.get("hackernews_queries") or []:
            items.extend(self._fetch_hn(query, since_ts, now))

        return items

    def _fetch_feed(self, url: str, since_ts: float, now: float) -> list[Item]:
        out: list[Item] = []
        try:
            resp = requests.get(url, timeout=20, headers={"User-Agent": "daily-digest/1.0"})
            resp.raise_for_status()
            source, entries = _parse_feed(resp.text, url)
        except Exception as exc:
            print(f"  ! feed failed {url}: {exc}")
            return out
        if not entries:
            print(f"  ! feed unreadable or empty {url}")
            return out

        for entry in entries:
            ts = _parse_date(entry.get("published", "")) or now
            if ts <= since_ts:
                continue
            link = entry.get("link", "")
            if not link:
                continue
            out.append(Item(
                kind="news", source=source, title=entry.get("title", "").strip(),
                url=link, author=entry.get("author", ""),
                published_ts=ts, fetched_ts=now,
                raw_text=_strip_html(entry.get("summary", "")),
                domain="ai",
            ))
        return out

    def _fetch_hn(self, query: str, since_ts: float, now: float) -> list[Item]:
        out: list[Item] = []
        params = {"query": query, "tags": "story", "hitsPerPage": 50}
        if since_ts:
            params["numericFilters"] = f"created_at_i>{int(since_ts)}"
        try:
            resp = requests.get(HN_API, params=params, timeout=20)
            resp.raise_for_status()
            hits = resp.json().get("hits", [])
        except Exception as exc:
            print(f"  ! HN query failed '{query}': {exc}")
            return out

        for hit in hits:
            ts = float(hit.get("created_at_i") or 0) or now
            if ts <= since_ts:
                continue
            object_id = hit.get("objectID", "")
            url = hit.get("url") or f"https://news.ycombinator.com/item?id={object_id}"
            out.append(Item(
                kind="news", source="Hacker News",
                title=hit.get("title") or hit.get("story_title") or "", url=url,
                author=hit.get("author", ""), published_ts=ts, fetched_ts=now,
                raw_text=_strip_html(hit.get("story_text") or ""),
                domain="ai",
                extra={"points": hit.get("points"), "num_comments": hit.get("num_comments"),
                       "hn_query": query},
            ))
        return out
