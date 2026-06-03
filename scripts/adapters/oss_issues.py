"""OSS issues adapter: open `good first issue` / `help wanted` issues in the
owner's stack (Python + LangChain / FastAPI / RAG / ML), via the GitHub Search
API. kind="opportunity", role="open-source", real issue URLs. Reuses the
opportunities eligibility + Item helpers — no new abstractions.
"""
from __future__ import annotations

import os
import time

import requests

from .base import SourceAdapter
from ..schema import Item
from .opportunities import _eligible, _item, _iso_dt_to_ts

SEARCH = "https://api.github.com/search/issues"


class OSSIssuesAdapter(SourceAdapter):
    name = "oss_issues"
    kind = "opportunity"
    display_source = "GitHub Issues"   # run.py shows only these for `run oss`

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        opp = cfg.get("opportunities") or {}
        oss = opp.get("oss_issues") or {}
        elig = opp.get("eligibility") or {}
        labels = oss.get("labels") or ["good first issue"]
        terms = oss.get("query_terms") or [""]
        language = oss.get("language", "python")
        per_page = oss.get("per_page", 20)

        headers = {"User-Agent": "daily-digest", "Accept": "application/vnd.github+json"}
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"Bearer {token}"

        now = time.time()
        items: list[Item] = []
        seen: set[str] = set()
        for label in labels:
            for term in terms:
                query = f'label:"{label}" language:{language} state:open is:issue {term}'.strip()
                items += self._search(query, headers, per_page, elig, seen, now)
        return items

    def _search(self, query, headers, per_page, elig, seen, now) -> list[Item]:
        out = []
        try:
            resp = requests.get(SEARCH, headers=headers, params={
                "q": query, "sort": "updated", "order": "desc", "per_page": per_page}, timeout=30)
            resp.raise_for_status()
            issues = resp.json().get("items", [])
        except Exception as exc:
            print(f"  ! oss issue search failed ({query[:40]}...): {exc}")
            return out
        for it in issues:
            url = it.get("html_url", "")
            if not url or url in seen:
                continue
            seen.add(url)
            repo = it.get("repository_url", "").replace("https://api.github.com/repos/", "")
            title = (it.get("title") or "").strip()
            labels = [l.get("name", "") for l in it.get("labels", [])]
            body = (it.get("body") or "")[:500]
            raw = f"{title} — open-source issue in {repo}. Labels: {', '.join(labels)}. {body}"
            if not title or not _eligible(title, raw, "open-source", "Remote", elig):
                continue
            ts = _iso_dt_to_ts(it.get("updated_at", ""))
            out.append(_item("GitHub Issues", f"{title} ({repo})", url, raw, "tech",
                             "open-source", repo, url, "", ts or now, tags=labels))
        return out
