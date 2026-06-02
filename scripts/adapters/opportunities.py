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
import os
import re
import time
from datetime import datetime, timezone
from urllib.parse import urlsplit

import requests

from .base import SourceAdapter
from ..schema import Item

CF_API = "https://codeforces.com/api/contest.list"
DEVPOST_API = "https://devpost.com/api/hackathons"
HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
BROWSER_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

# Stage 2b — ScrapeGraphAI (Gemini) scrape sources. Each known site has a fixed
# listing URL here (easy to edit; move to config later if you want per-site URLs).
INTERNSHALA_URL = "https://internshala.com/internships/artificial-intelligence-internship/"
GEMINI_MODEL = "google_genai/gemini-2.5-flash"

# Contests/hackathons/competitions are open events with no job role; they pass
# the SDE/SWE role gate by construction (that gate is for Stage 2b job listings).
EVENT_ROLES = {"contest", "hackathon", "competition", "open-source"}
DEVPOST_MAX_PAGES = 7  # ~58 open hackathons at 9/page

_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(text: str) -> str:
    return html.unescape(_TAG_RE.sub("", text or "")).strip()


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).date().isoformat() if ts else ""


def _eligible(title: str, text: str, role: str, location: str, elig: dict,
              assume_location_ok: bool = False) -> bool:
    """Keep only items matching ALL eligibility rules (config-driven).

    assume_location_ok skips the location test for India-only platforms
    (e.g. Internshala), where every listing is India-based or work-from-home.
    """
    blob = f"{title} {text} {location}".lower()
    for ex in elig.get("exclude") or []:
        if ex.lower() in blob:
            return False
    loc = (location or "").lower()
    accept = [l.lower() for l in (elig.get("locations") or [])] + \
             ["online", "remote", "virtual", "anywhere", "work from home", "wfh", "hybrid"]
    loc_ok = assume_location_ok or (not loc) or any(a in loc for a in accept)
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
    out: list[Item] = []
    try:
        import kaggle  # lazy: authenticates on import from KAGGLE_* env vars
        resp = kaggle.api.competitions_list()
        comps = getattr(resp, "competitions", resp) or []  # newer client wraps the list
        now = time.time()
        for c in comps:
            title = getattr(c, "title", "") or ""
            url = getattr(c, "url", "") or getattr(c, "ref", "") or ""
            category = getattr(c, "category", "") or ""
            reward = getattr(c, "reward", "") or ""
            deadline = getattr(c, "deadline", None)
            ts = deadline.replace(tzinfo=timezone.utc).timestamp() \
                if isinstance(deadline, datetime) else 0.0
            if ts and ts < now:           # skip finished competitions
                continue
            company = getattr(c, "organization_name", None) or "Kaggle"
            raw = f"{title}. Kaggle {category} competition. Reward: {reward}."
            if not url or not _eligible(title, raw, "competition", "Online", elig):
                continue
            out.append(_item("Kaggle", title, url, raw, "ai", "competition",
                             company, url, _iso(ts), ts))
    except Exception as exc:
        print(f"  ! kaggle failed: {exc}")
    return out


# --- Stage 2b: scrape sources via ScrapeGraphAI + Gemini --------------------

_DETAIL_RE = re.compile(r"/internship/detail/[a-z0-9_\-]+")
_INTERNSHALA_PROMPT = (
    "This is an Internshala internships listing page. List every internship card "
    "shown. For each, extract: title (the role), company (organisation name), "
    "apply_by (the 'Apply By' date exactly as written), location (e.g. a city, or "
    "'Work from home'), stipend (exactly as written), and apply_url (the full URL "
    "of that internship's own detail page, copied verbatim from its link). "
    "Do NOT invent, guess, or modify any URL — only copy links that appear on the page."
)


def _gemini_config() -> dict:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY missing from environment (.env)")
    return {
        # model_tokens set high so the whole listing page goes in one call
        # (gemini-2.0-flash has a large context) instead of many chunked calls.
        "llm": {"api_key": key, "model": GEMINI_MODEL, "temperature": 0,
                "model_tokens": 1000000},
        "headless": True,
        "verbose": False,
    }


def _internshala_real_links(url: str) -> set[str]:
    """The set of real internship-detail URLs actually present in the page HTML.
    Used as ground truth so no LLM-invented apply link can survive."""
    resp = requests.get(url, headers={"User-Agent": BROWSER_UA}, timeout=30)
    resp.raise_for_status()
    return {f"https://internshala.com{p}" for p in _DETAIL_RE.findall(resp.text)}


def _norm_internshala_url(u: str) -> str:
    u = (u or "").strip()
    if not u:
        return ""
    if u.startswith("/"):
        u = "https://internshala.com" + u
    parts = urlsplit(u)
    if "internshala.com" not in parts.netloc.lower():
        return ""
    return f"https://internshala.com{parts.path.rstrip('/')}"


def _coerce_listings(result) -> list[dict]:
    if result is None:
        return []
    if hasattr(result, "internships"):
        result = result.internships
    elif isinstance(result, dict):
        result = result.get("internships") or result.get("content") or []
    rows = result if isinstance(result, list) else []
    out = []
    for x in rows:
        if hasattr(x, "model_dump"):
            out.append(x.model_dump())
        elif isinstance(x, dict):
            out.append(x)
    return out


def _internshala(elig: dict) -> list[Item]:
    try:
        real_links = _internshala_real_links(INTERNSHALA_URL)
    except Exception as exc:
        print(f"  ! internshala page fetch failed: {exc}")
        return []
    if not real_links:
        print("  ! internshala: no detail links in page (blocked or layout changed); skipping")
        return []

    try:
        from pydantic import BaseModel, Field
        from scrapegraphai.graphs import SmartScraperGraph

        class _Listing(BaseModel):
            title: str = ""
            company: str = ""
            apply_by: str = ""
            location: str = ""
            stipend: str = ""
            apply_url: str = ""

        class _Listings(BaseModel):
            internships: list[_Listing] = Field(default_factory=list)

        graph = SmartScraperGraph(prompt=_INTERNSHALA_PROMPT, source=INTERNSHALA_URL,
                                  config=_gemini_config(), schema=_Listings)
        result = graph.run()
    except Exception as exc:
        print(f"  ! internshala scrape failed: {exc}")
        return []

    listings = _coerce_listings(result)
    items, verified, dropped = [], 0, 0
    for row in listings:
        apply_url = _norm_internshala_url(row.get("apply_url", ""))
        if apply_url not in real_links:
            dropped += 1
            continue
        title = (row.get("title") or "").strip()
        company = (row.get("company") or "").strip()
        location = (row.get("location") or "").strip()
        deadline = (row.get("apply_by") or "").strip()
        stipend = (row.get("stipend") or "").strip()
        raw = f"{title} at {company}. {location}. Stipend {stipend}. Apply by {deadline}."
        if not title or not _eligible(title, raw, "intern", location, elig,
                                      assume_location_ok=True):
            continue
        verified += 1
        items.append(_item("Internshala", title, apply_url, raw, "tech", "intern",
                           company, apply_url, deadline, time.time()))
    print(f"  internshala: extracted {len(listings)}, verified-real {verified}, "
          f"dropped-unverified {dropped}")
    return items


class OpportunitiesAdapter(SourceAdapter):
    name = "opportunities"
    kind = "opportunity"

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        opp = cfg.get("opportunities") or {}
        elig = opp.get("eligibility") or {}
        sources = opp.get("api_sources") or {}
        scrape = opp.get("scrape_sources") or {}
        items: list[Item] = []
        if sources.get("codeforces"):
            items += _codeforces(elig)
        if sources.get("devpost"):
            items += _devpost(elig)
        if sources.get("kaggle"):
            items += _kaggle(elig)
        if scrape.get("internshala"):
            items += _internshala(elig)
        return items
