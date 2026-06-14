"""Papers adapter: arXiv + OpenAlex + Semantic Scholar + Europe PMC.

For each domain in config (papers.domains), arXiv is queried by category and
the other three by the domain's keyword terms. Records are merged and deduped
across sources by DOI (preferred) or normalized title, keeping the version with
the fullest abstract. When a DOI exists the item URL is canonicalized to
https://doi.org/<doi> so the same paper from different sources collapses to one
id (exact dedup, even across runs). Any source that errors is skipped, not fatal.
"""
from __future__ import annotations

import os
import re
import time
from calendar import timegm
from datetime import datetime, timezone

import feedparser
import requests

from .base import SourceAdapter
from ..schema import Item

ARXIV_API = "https://export.arxiv.org/api/query"
OPENALEX_API = "https://api.openalex.org/works"
S2_API = "https://api.semanticscholar.org/graph/v1/paper/search"
EUROPEPMC_API = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"

ARXIV_MAX = 20   # results per domain category query
PAGE = 10        # results per keyword query for the other three sources
_HEADERS = {"User-Agent": "DailyDigest/1.0 (research aggregator; contact via GitHub)"}


def _norm_doi(doi: str | None) -> str:
    if not doi:
        return ""
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", doi.strip(), flags=re.I).lower()


def _norm_title(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (title or "").lower()).strip()


def _date_to_ts(value: str) -> float:
    """Parse an ISO datetime or a YYYY-MM-DD date into a UTC timestamp.
    Date-only values are treated as UTC midnight."""
    if not value:
        return 0.0
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return 0.0
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.timestamp()


def _record(title, abstract, authors, venue, doi, url, ts):
    return {"title": (title or "").strip(), "abstract": (abstract or "").strip(),
            "authors": authors, "venue": venue or "", "doi": _norm_doi(doi),
            "url": url, "ts": ts}


class PapersAdapter(SourceAdapter):
    name = "papers"
    kind = "paper"

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        since_ts = state.get("since_ts", 0.0)
        now = time.time()
        domains = (cfg.get("papers") or {}).get("domains") or {}
        mailto = os.environ.get("OPENALEX_MAILTO")  # optional polite-pool contact

        candidates: list[dict] = []
        for domain, dcfg in domains.items():
            for cat_record in self._arxiv(dcfg.get("arxiv") or []):
                candidates.append((domain, cat_record))
            for term in dcfg.get("openalex") or []:
                for rec in self._openalex(term, mailto):
                    candidates.append((domain, rec))
                for rec in self._semantic_scholar(term):
                    candidates.append((domain, rec))
                for rec in self._europepmc(term):
                    candidates.append((domain, rec))

        return self._dedup_to_items(candidates, since_ts, now)

    # ---- sources -------------------------------------------------------
    def _arxiv(self, cats: list[str]) -> list[dict]:
        if not cats:
            return []
        query = " OR ".join(f"cat:{c}" for c in cats)
        try:
            resp = requests.get(ARXIV_API, params={
                "search_query": query, "sortBy": "submittedDate",
                "sortOrder": "descending", "max_results": ARXIV_MAX},
                headers=_HEADERS, timeout=30)
            resp.raise_for_status()
            feed = feedparser.parse(resp.content)
        except Exception as exc:
            print(f"  ! arxiv query failed ({query[:40]}...): {exc}")
            return []
        out = []
        for e in feed.entries:
            ts = float(timegm(e.published_parsed)) if e.get("published_parsed") else 0.0
            out.append(_record(
                e.get("title", ""), e.get("summary", ""),
                ", ".join(a.get("name", "") for a in e.get("authors", [])),
                "arXiv", e.get("arxiv_doi"), e.get("link", ""), ts))
        return out

    def _openalex(self, term: str, mailto: str | None) -> list[dict]:
        params = {"search": term, "sort": "publication_date:desc", "per-page": PAGE}
        if mailto:
            params["mailto"] = mailto
        try:
            resp = requests.get(OPENALEX_API, params=params, headers=_HEADERS, timeout=30)
            resp.raise_for_status()
            results = resp.json().get("results", [])
        except Exception as exc:
            print(f"  ! openalex query failed ('{term}'): {exc}")
            return []
        out = []
        for w in results:
            doi = w.get("doi")
            out.append(_record(
                w.get("display_name", ""), _invert_abstract(w.get("abstract_inverted_index")),
                ", ".join(a["author"]["display_name"] for a in w.get("authorships", [])[:8]
                          if a.get("author")),
                (w.get("primary_location") or {}).get("source", {}).get("display_name")
                if w.get("primary_location") else "",
                doi, doi or w.get("id", ""), _date_to_ts(w.get("publication_date", ""))))
        return out

    def _semantic_scholar(self, term: str) -> list[dict]:
        try:
            resp = requests.get(S2_API, params={
                "query": term, "limit": PAGE,
                "fields": "title,abstract,authors,venue,externalIds,publicationDate,url"},
                headers=_HEADERS, timeout=30)
            resp.raise_for_status()
            data = resp.json().get("data", [])
        except Exception as exc:
            print(f"  ! semantic scholar query failed ('{term}'): {exc}")
            return []
        out = []
        for p in data:
            doi = (p.get("externalIds") or {}).get("DOI")
            out.append(_record(
                p.get("title", ""), p.get("abstract", ""),
                ", ".join(a.get("name", "") for a in (p.get("authors") or [])[:8]),
                p.get("venue", ""), doi, p.get("url", ""),
                _date_to_ts(p.get("publicationDate", ""))))
        return out

    def _europepmc(self, term: str) -> list[dict]:
        try:
            resp = requests.get(EUROPEPMC_API, params={
                "query": term, "format": "json", "pageSize": PAGE,
                "resultType": "core", "sort": "P_PDATE_D desc"},
                headers=_HEADERS, timeout=30)
            resp.raise_for_status()
            results = resp.json().get("resultList", {}).get("result", [])
        except Exception as exc:
            print(f"  ! europepmc query failed ('{term}'): {exc}")
            return []
        out = []
        for r in results:
            url = ""
            for link in (r.get("fullTextUrlList", {}) or {}).get("fullTextUrl", []):
                url = link.get("url", "")
                if url:
                    break
            doi = r.get("doi")
            url = url or (f"https://doi.org/{doi}" if doi else
                          f"https://europepmc.org/article/{r.get('source','MED')}/{r.get('id','')}")
            out.append(_record(
                r.get("title", ""), r.get("abstractText", ""), r.get("authorString", ""),
                r.get("journalTitle", ""), doi, url, _date_to_ts(r.get("firstPublicationDate", ""))))
        return out

    # ---- merge ---------------------------------------------------------
    def _dedup_to_items(self, candidates, since_ts, now) -> list[Item]:
        best: dict[str, tuple] = {}
        for domain, rec in candidates:
            # Prefer normalized title as the dedup key: it merges the same paper
            # across sources AND across version DOIs (e.g. Zenodo). Fall back to
            # DOI only when a title is somehow missing.
            norm = _norm_title(rec["title"])
            key = f"title:{norm}" if norm else (f"doi:{rec['doi']}" if rec["doi"] else "")
            if not key:
                continue
            if key not in best or len(rec["abstract"]) > len(best[key][1]["abstract"]):
                best[key] = (domain, rec)

        items = []
        for domain, rec in best.values():
            ts = rec["ts"]
            if ts and ts <= since_ts:
                continue
            url = f"https://doi.org/{rec['doi']}" if rec["doi"] else rec["url"]
            if not url:
                continue
            items.append(Item(
                kind="paper", source=rec["venue"] or "arXiv", title=rec["title"],
                url=url, author=rec["authors"] or "", published_ts=ts or now,
                fetched_ts=now, raw_text=rec["abstract"], domain=domain,
                extra={"venue": rec["venue"], "doi": rec["doi"]}))
        return items


def _invert_abstract(inv: dict | None) -> str:
    if not inv:
        return ""
    positions: dict[int, str] = {}
    for word, idxs in inv.items():
        for i in idxs:
            positions[i] = word
    return " ".join(positions[i] for i in sorted(positions))
