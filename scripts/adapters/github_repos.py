"""GitHub repos adapter: trending repositories by configured topic.

Uses the GitHub Search API, one query per topic from config/sources.yaml
(github.topics / github.min_stars / github.pushed_within_days):

    q = topic:<topic> stars:>=<min_stars> pushed:><date>   (sort=stars desc)

GITHUB_TOKEN (optional) raises the rate limit when present. Repos are deduped
by html_url via the store; a failed query is skipped, not fatal.
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timezone

import requests

from .base import SourceAdapter
from ..schema import Item

SEARCH_API = "https://api.github.com/search/repositories"
PER_PAGE = 30


def _iso_to_ts(value: str) -> float:
    if not value:
        return 0.0
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


class GitHubReposAdapter(SourceAdapter):
    name = "github_repos"
    kind = "repo"

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        since_ts = state.get("since_ts", 0.0)
        now = time.time()
        gh = cfg.get("github") or {}
        topics = gh.get("topics") or []
        min_stars = gh.get("min_stars", 0)
        within_days = gh.get("pushed_within_days", 30)
        pushed_date = datetime.fromtimestamp(
            now - within_days * 86400, tz=timezone.utc).strftime("%Y-%m-%d")

        headers = {"Accept": "application/vnd.github+json",
                   "User-Agent": "DailyDigest/1.0"}
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"Bearer {token}"

        items: list[Item] = []
        seen: set[str] = set()
        for topic in topics:
            query = f"topic:{topic} stars:>={min_stars} pushed:>{pushed_date}"
            for repo in self._search(query, headers):
                self._add(items, seen, repo, topic, since_ts, now)
        return items

    def _search(self, query: str, headers: dict) -> list[dict]:
        try:
            resp = requests.get(SEARCH_API, headers=headers, params={
                "q": query, "sort": "stars", "order": "desc", "per_page": PER_PAGE},
                timeout=30)
            resp.raise_for_status()
            return resp.json().get("items", [])
        except Exception as exc:
            print(f"  ! github search failed ({query}): {exc}")
            return []

    def _add(self, items, seen, repo, topic, since_ts, now) -> None:
        url = repo.get("html_url", "")
        if not url or url in seen:
            return
        ts = _iso_to_ts(repo.get("pushed_at", ""))
        if ts and ts <= since_ts:
            return
        seen.add(url)
        desc = repo.get("description") or ""
        repo_topics = repo.get("topics") or []
        items.append(Item(
            kind="repo", source="GitHub", title=repo.get("full_name", repo.get("name", "")),
            url=url, author=(repo.get("owner") or {}).get("login", ""),
            published_ts=ts or now, fetched_ts=now,
            raw_text=" ".join([desc] + repo_topics).strip(),
            tags=repo_topics, domain="ai",
            extra={"stars": repo.get("stargazers_count"), "language": repo.get("language"),
                   "forks": repo.get("forks_count"), "matched_topic": topic},
        ))
