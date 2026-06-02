"""Opportunities adapter — Stage 2a (API sources only, no scraping, no LLM).

One function per enabled api_source, each returning eligibility-filtered
`Item`s with kind="opportunity". Reuses the Phase 1 Item schema, store, and
ranker unchanged; only Item.extra gains opportunity fields:
    {deadline, company, role, apply_url, eligible}

Sources (config/sources.yaml -> opportunities.api_sources):
  codeforces - upcoming contests (phase=BEFORE)
  devpost    - open hackathons (unofficial JSON, paginated)
  kaggle     - active competitions (kaggle pkg, auth from KAGGLE_* env vars)
"""
from __future__ import annotations

import html
import re
import time
from datetime import datetime, timezone

import requests

from .base import SourceAdapter
from ..schema import Item

CF_API = "https://codeforces.com/api/contest.list"
DEVPOST_API = "https://devpost.com/api/hackathons"
HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

# Contests/hackathons/competitions are open events with no job role; they pass
# the SDE/SWE role gate by construction (that gate is for Stage 2b job listings).
EVENT_ROLES = {"contest", "hackathon", "competition", "open-source"}
DEVPOST_MAX_PAGES = 7  # ~58 open hackathons at 9/page

_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return html.unescape(_TAG_RE.sub("", text or "")).strip()


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).date().isoformat() if ts else ""


def _eligible(title: str, text: str, role: str, location: str, elig: dict) -> bool:
    """Keep only items matching ALL eligibility rules (config-driven)."""
    blob = f"{title} {text} {location}".lower()
    for ex in elig.get("exclude") or []:
        if ex.lower() in blob:
            return False
    loc = (location or "").lower()
    accept = [l.lower() for l in (elig.get("locations") or [])] + \
             ["online", "remote", "virtual", "anywhere"]
    loc_ok = (not loc) or any(a in loc for a in accept)
    roles = [r.lower() for r in (elig.get("roles") or [])]
    role_ok = role.lower() in EVENT_ROLES or role.lower() in roles
    return loc_ok and role_ok


def _item(source, title, url, raw_text, domain, role, company, apply_url, deadline, ts, tags=None):
    return Item(
        kind="opportunity", source=source, title=title, url=url,
        published_ts=ts or time.time(), fetched_ts=time.time(),
        raw_text=raw_text, domain=domain, tags=tags or [],
        extra={"deadline": deadline, "company": company, "role": role,
               "apply_url": apply_url, "eligible": True},
    )


def _codeforces(elig: dict) -> list[Item]:
    try:
        data = requests.get(CF_API, headers=HEADERS, timeout=30).json()
    except Exception as exc:
        print(f"  ! codeforces failed: {exc}")
        return []
    if data.get("status") != "OK":
        print(f"  ! codeforces status {data.get('status')}")
        return []
    out = []
    for c in data.get("result", []):
        if c.get("phase") != "BEFORE":
            continue
        title = c.get("name", "")
        start = float(c.get("startTimeSeconds") or 0)
        hours = int((c.get("durationSeconds") or 0) // 3600)
        raw = f"Competitive programming contest on Codeforces ({c.get('type','')}). Duration {hours}h."
        url = f"https://codeforces.com/contest/{c.get('id')}"
        if not _eligible(title, raw, "contest", "Online", elig):
            continue
        out.append(_item("Codeforces", title, url, raw, "tech", "contest",
                         "Codeforces", url, _iso(start), start))
    return out


def _devpost(elig: dict) -> list[Item]:
    out, page = [], 1
    while page <= DEVPOST_MAX_PAGES:
        try:
            resp = requests.get(DEVPOST_API, headers=HEADERS,
                                params={"status[]": "open", "page": page}, timeout=30)
            resp.raise_for_status()
            payload = resp.json()
        except Exception as exc:
            print(f"  ! devpost page {page} failed: {exc}")
            break
        hackathons = payload.get("hackathons", [])
        if not hackathons:
            break
        for h in hackathons:
            title = h.get("title", "")
            location = (h.get("displayed_location") or {}).get("location", "")
            themes = [t.get("name", "") for t in h.get("themes", [])]
            dates = h.get("submission_period_dates", "")
            raw = f"{title} — {', '.join(themes)} hackathon. {dates}. " \
                  f"Prize {_strip_html(h.get('prize_amount',''))}."
            url = h.get("url", "")
            if not url or not _eligible(title, raw, "hackathon", location, elig):
                continue
            ts = _parse_devpost_deadline(dates)
            out.append(_item("Devpost", title, url, raw, "tech", "hackathon",
                             h.get("organization_name", ""), url, dates or _iso(ts),
                             ts, tags=themes))
        total = (payload.get("meta") or {}).get("total_count", 0)
        per_page = (payload.get("meta") or {}).get("per_page", 9) or 9
        if page * per_page >= total:
            break
        page += 1
    return out


def _parse_devpost_deadline(dates: str) -> float:
    # "May 05 - Jun 11, 2026" -> ts of the end date "Jun 11, 2026"
    if not dates:
        return 0.0
    end = dates.split(" - ")[-1].strip()
    try:
        return datetime.strptime(end, "%b %d, %Y").replace(tzinfo=timezone.utc).timestamp()
    except ValueError:
        return 0.0


def _kaggle(elig: dict) -> list[Item]:
    try:
        import kaggle  # lazy: authenticates on import from KAGGLE_* env vars
        comps = kaggle.api.competitions_list()
    except Exception as exc:
        print(f"  ! kaggle failed: {exc}")
        return []
    out = []
    for c in comps:
        title = getattr(c, "title", "") or ""
        ref = getattr(c, "ref", "") or ""
        url = f"https://www.kaggle.com/competitions/{ref}" if ref else getattr(c, "url", "")
        category = getattr(c, "category", "") or ""
        reward = getattr(c, "reward", "") or ""
        deadline = getattr(c, "deadline", None)
        ts = deadline.replace(tzinfo=timezone.utc).timestamp() if isinstance(deadline, datetime) else 0.0
        raw = f"{title}. Kaggle {category} competition. Reward: {reward}."
        company = getattr(c, "organizationName", "") or "Kaggle"
        if not url or not _eligible(title, raw, "competition", "Online", elig):
            continue
        out.append(_item("Kaggle", title, url, raw, "ai", "competition",
                         company, url, _iso(ts), ts))
    return out


class OpportunitiesAdapter(SourceAdapter):
    name = "opportunities"
    kind = "opportunity"

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        opp = cfg.get("opportunities") or {}
        elig = opp.get("eligibility") or {}
        sources = opp.get("api_sources") or {}
        items: list[Item] = []
        if sources.get("codeforces"):
            items += _codeforces(elig)
        if sources.get("devpost"):
            items += _devpost(elig)
        if sources.get("kaggle"):
            items += _kaggle(elig)
        return items
