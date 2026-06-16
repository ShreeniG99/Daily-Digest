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

import feedparser
import requests

from .base import SourceAdapter
from ..schema import Item

HN_API = "http://hn.algolia.com/api/v1/search_by_date"
_TAG_RE = re.compile(r"<[^>]+>")
_UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
       "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def _strip_html(text: str) -> str:
    return html.unescape(_TAG_RE.sub("", text or "")).strip()


def _entry_ts(entry) -> float:
    for key in ("published_parsed", "updated_parsed"):
        t = entry.get(key)
        if t:
            return float(timegm(t))  # feedparser times are UTC structs
    return 0.0


def _feed_source(parsed, url: str) -> str:
    title = parsed.feed.get("title") if parsed.feed else None
    return title or urlsplit(url).netloc


def _entry_image(entry) -> str:
    """Best-effort image URL already present in the feed entry — media:thumbnail,
    media:content, or an image enclosure. Returns '' when the feed carries none
    (then the app renders the story as a clean text-only card)."""
    for thumb in entry.get("media_thumbnail") or []:
        if thumb.get("url"):
            return thumb["url"]
    for media in entry.get("media_content") or []:
        url = media.get("url")
        medium = (media.get("medium") or media.get("type") or "")
        if url and ("image" in medium or not medium):
            return url
    for link in entry.get("links") or []:
        if link.get("rel") == "enclosure" and "image" in (link.get("type") or ""):
            if link.get("href"):
                return link["href"]
    return ""


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
            resp = requests.get(url, headers={"User-Agent": _UA}, timeout=20)
            resp.raise_for_status()
            parsed = feedparser.parse(resp.content)
        except Exception as exc:  # network / parse failure on one feed
            print(f"  ! feed failed {url}: {exc}")
            return out
        if parsed.bozo and not parsed.entries:
            print(f"  ! feed unreadable {url}: {parsed.get('bozo_exception')}")
            return out

        source = _feed_source(parsed, url)
        for entry in parsed.entries:
            ts = _entry_ts(entry) or now
            if ts <= since_ts:
                continue
            link = entry.get("link", "")
            if not link:
                continue
            image = _entry_image(entry)
            out.append(Item(
                kind="news", source=source, title=entry.get("title", "").strip(),
                url=link, author=entry.get("author", ""),
                published_ts=ts, fetched_ts=now,
                raw_text=_strip_html(entry.get("summary", "")),
                domain="ai",
                extra={"image": image} if image else {},
            ))
        return out

    def _fetch_hn(self, query: str, since_ts: float, now: float) -> list[Item]:
        out: list[Item] = []
        params = {"query": query, "tags": "story", "hitsPerPage": 50}
        if since_ts:
            params["numericFilters"] = f"created_at_i>{int(since_ts)}"
        try:
            resp = requests.get(HN_API, params=params, timeout=20,
                                headers={"User-Agent": _UA})
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
