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
import json
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


UNSTOP_API = "https://unstop.com/api/public/opportunity/search-result"


def _iso_dt_to_ts(value: str) -> float:
    try:
        return datetime.fromisoformat(value).timestamp()
    except (ValueError, TypeError):
        return 0.0


def _unstop(elig: dict) -> list[Item]:
    """Unstop via its public JSON API (no scraping, no LLM — fully real data).
    Listed under scrape_sources in config, but the site exposes a clean API."""
    out: list[Item] = []
    now = time.time()
    for opp_type, role in (("internships", "intern"), ("hackathons", "hackathon")):
        try:
            resp = requests.get(UNSTOP_API, params={"opportunity": opp_type, "per_page": 40, "page": 1},
                                headers={"User-Agent": BROWSER_UA, "Accept": "application/json"}, timeout=30)
            resp.raise_for_status()
            rows = (((resp.json() or {}).get("data") or {}).get("data")) or []
        except Exception as exc:
            print(f"  ! unstop {opp_type} failed: {exc}")
            continue
        for it in rows:
            if it.get("regn_open") != 1:          # registration closed
                continue
            url = (it.get("seo_url") or "").strip()
            title = (it.get("title") or "").strip()
            if not url or not title:
                continue
            org = it.get("organisation") or {}
            company = (org.get("name") if isinstance(org, dict) else "") or ""
            locs = it.get("locations") or []
            location = ", ".join(
                f"{l.get('city', '')} {l.get('country', '')}".strip() for l in locs
            ) if locs else "Work from home"
            skills = [s.get("skill_name", "") for s in (it.get("required_skills") or [])]
            ts = _iso_dt_to_ts(it.get("end_date", ""))
            raw = f"{title} at {company}. {location}. Skills: {', '.join(skills)}."
            if not _eligible(title, raw, role, location, elig):
                continue
            out.append(_item("Unstop", title, url, raw, "tech", role, company, url,
                             _iso(ts), ts or now, tags=skills))
    return out


DEVFOLIO_URL = "https://devfolio.co/hackathons"
_NEXT_DATA_RE = re.compile(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.S)


def _walk_hackathons(obj) -> list[dict]:
    """Collect hackathon dicts (name + slug + starts_at) anywhere in the
    embedded __NEXT_DATA__ JSON, robust to layout changes."""
    found = []
    if isinstance(obj, dict):
        if obj.get("name") and obj.get("slug") and obj.get("starts_at"):
            found.append(obj)
        for v in obj.values():
            found += _walk_hackathons(v)
    elif isinstance(obj, list):
        for v in obj:
            found += _walk_hackathons(v)
    return found


def _theme_names(themes) -> list[str]:
    out = []
    for t in themes or []:
        if isinstance(t, dict):
            out.append(t.get("name", ""))
        elif isinstance(t, str):
            out.append(t)
    return [t for t in out if t]


def _devfolio(elig: dict) -> list[Item]:
    """Devfolio via the structured data embedded in its page (__NEXT_DATA__) —
    deterministic, real, no LLM. Devfolio is India-focused, so onsite events
    are treated as India-eligible (location assumed)."""
    try:
        resp = requests.get(DEVFOLIO_URL, headers={"User-Agent": BROWSER_UA}, timeout=30)
        resp.raise_for_status()
        m = _NEXT_DATA_RE.search(resp.text)
        if not m:
            print("  ! devfolio: __NEXT_DATA__ not found (layout changed); skipping")
            return []
        data = json.loads(m.group(1))
    except Exception as exc:
        print(f"  ! devfolio failed: {exc}")
        return []

    now = time.time()
    out, seen = [], set()
    for h in _walk_hackathons(data):
        slug = h.get("slug")
        if not slug or slug in seen:
            continue
        seen.add(slug)
        name = (h.get("name") or "").strip()
        themes = _theme_names(h.get("themes"))
        location = "Online" if h.get("is_online") else "India (onsite)"
        raw = f"{name}. {', '.join(themes)} hackathon on Devfolio. {location}."
        ts = _iso_dt_to_ts(h.get("starts_at", ""))
        if not name or not _eligible(name, raw, "hackathon", location, elig,
                                     assume_location_ok=True):
            continue
        url = f"https://{slug}.devfolio.co"
        out.append(_item("Devfolio", name, url, raw, "tech", "hackathon", "", url,
                         _iso(ts), ts or now, tags=themes))
    return out


MLH_URL = "https://mlh.io/seasons/2026/events"


def _extract_json_objects(text: str, anchor: str) -> list[dict]:
    """Pull out brace-balanced JSON objects that contain `anchor`, from a page
    that embeds data as (html-unescaped) JSON. Robust to surrounding markup."""
    out, pos = [], 0
    while True:
        i = text.find(anchor, pos)
        if i < 0:
            break
        start = text.rfind("{", 0, i)
        depth, end = 0, -1
        for j in range(start, min(start + 4000, len(text))):
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    end = j
                    break
        if start >= 0 and end > 0:
            try:
                out.append(json.loads(text[start:end + 1]))
            except ValueError:
                pass
            pos = end + 1
        else:
            pos = i + len(anchor)
    return out


def _mlh(elig: dict) -> list[Item]:
    """MLH member hackathons. The events page embeds them as JSON (entity-
    encoded). MLH is global, so in-person events outside India are dropped by
    the eligibility check; digital ones are kept."""
    try:
        resp = requests.get(MLH_URL, headers={"User-Agent": BROWSER_UA}, timeout=30)
        resp.raise_for_status()
        text = html.unescape(resp.text)
    except Exception as exc:
        print(f"  ! mlh failed: {exc}")
        return []

    now = time.time()
    out, seen = [], set()
    for ev in _extract_json_objects(text, '"startsAt"'):
        slug = ev.get("slug")
        name = (ev.get("name") or "").strip()
        if not slug or not name or slug in seen:
            continue
        seen.add(slug)
        if (ev.get("status") or "").lower() == "ended":
            continue
        va = ev.get("venueAddress") or {}
        country = (va.get("country") or "").upper()
        blob = f"{ev.get('formatType', '')} {ev.get('location', '')}".lower()
        if "digital" in blob or "online" in blob or not va:
            location = "Online"
        elif country == "IN":
            location = f"{va.get('city', '')}, India"
        else:
            location = f"{va.get('city', '')}, {country}"
        website = ev.get("websiteUrl") or ""
        url = website if website.startswith("http") else \
            "https://events.mlh.io" + (ev.get("url") or f"/events/{slug}")
        ts = _iso_dt_to_ts(ev.get("startsAt", ""))
        raw = f"{name}. MLH hackathon, {ev.get('dateRange', '')}. {location}."
        if not _eligible(name, raw, "hackathon", location, elig):
            continue
        out.append(_item("MLH", name, url, raw, "tech", "hackathon",
                         "Major League Hacking", url, _iso(ts), ts or now))
    return out


GSOC_YEAR = 2026  # edit each year, or move to config
GSOC_API = f"https://summerofcode.withgoogle.com/api/program/{GSOC_YEAR}/organizations/"


def _gsoc(elig: dict) -> list[Item]:
    """Google Summer of Code participating orgs via the public JSON API
    (deterministic, real). GSoC is fully remote and open to India. All orgs
    are returned; the ranker surfaces the AI/ML/dev ones by keyword."""
    try:
        resp = requests.get(GSOC_API, headers={"User-Agent": BROWSER_UA, "Accept": "application/json"},
                            timeout=30)
        resp.raise_for_status()
        orgs = resp.json()
        if isinstance(orgs, dict):
            orgs = orgs.get("organizations") or []
    except Exception as exc:
        print(f"  ! gsoc failed: {exc}")
        return []

    now = time.time()
    out = []
    for o in orgs:
        name = (o.get("name") or "").strip()
        slug = o.get("slug") or ""
        if not name or not slug:
            continue
        tags = (o.get("tech_tags") or []) + (o.get("topic_tags") or [])
        raw = f"{name}. {o.get('tagline', '')}. {o.get('description', '')} " \
              f"Tech: {', '.join(tags)}."
        url = f"https://summerofcode.withgoogle.com/programs/{GSOC_YEAR}/organizations/{slug}"
        if not _eligible(name, raw, "open-source", "Remote", elig):
            continue
        out.append(_item("GSoC", name, url, raw, "tech", "open-source", name, url,
                         "", now, tags=tags))
    return out


# --- company_pages: FAANG-India roles via official jobs APIs ----------------

AMAZON_JOBS = "https://www.amazon.jobs/en/search.json"


def _target_role(title: str) -> str:
    """Map a job title to one of the owner's target roles, or "" to skip.
    Keyword queries return jobs that merely mention a term in their description
    (e.g. an Account Manager role), so gate on the actual title."""
    t = title.lower()
    if "intern" in t:
        return "intern"
    if any(k in t for k in ("software", "developer", "engineer", "sde", "swe",
                            "full stack", "full-stack")):
        return "SWE"
    if any(k in t for k in ("scientist", "machine learning", "data engineer", "research")):
        return "AIML"
    return ""


def _amazon_jobs(queries: list[str], elig: dict) -> list[Item]:
    """Amazon India roles via the official amazon.jobs search JSON. Real apply
    URLs (job_path); India is enforced on the authoritative country_code, so
    location eligibility is guaranteed."""
    out, seen = [], set()
    now = time.time()
    for q in queries:
        try:
            resp = requests.get(AMAZON_JOBS, headers={"User-Agent": BROWSER_UA, "Accept": "application/json"},
                                params={"base_query": q, "result_limit": 100, "sort": "recent"}, timeout=30)
            resp.raise_for_status()
            jobs = resp.json().get("jobs", [])
        except Exception as exc:
            print(f"  ! amazon.jobs '{q}' failed: {exc}")
            continue
        for j in jobs:
            if j.get("country_code") != "IND":
                continue
            path = j.get("job_path") or ""
            url = f"https://www.amazon.jobs{path}" if path.startswith("/") else ""
            if not url or url in seen:
                continue
            seen.add(url)
            title = (j.get("title") or "").strip()
            role = "intern" if j.get("is_intern") else _target_role(title)
            if not title or not role:        # skip non-target roles (sales, ops, etc.)
                continue
            location = j.get("normalized_location") or "India"
            raw = f"{title} at Amazon. {location}. {j.get('description_short') or ''} " \
                  f"{j.get('basic_qualifications') or ''}"[:1000]
            if not _eligible(title, raw, role, location, elig, assume_location_ok=True):
                continue
            out.append(_item("Amazon Jobs", title, url, raw, "tech", role,
                             "Amazon", url, "", now))
    return out


_COMPANY_FETCHERS = {"amazon": _amazon_jobs}


def _company_pages(cp: dict, elig: dict) -> list[Item]:
    """Dispatch to each enabled company's official jobs API."""
    queries = cp.get("queries") or []
    out = []
    for company in cp.get("companies") or []:
        fetcher = _COMPANY_FETCHERS.get(company)
        if fetcher is None:
            print(f"  ! company_pages: no fetcher wired for '{company}'")
            continue
        out += fetcher(queries, elig)
    return out


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
        if scrape.get("unstop"):
            items += _unstop(elig)
        if scrape.get("devfolio"):
            items += _devfolio(elig)
        if scrape.get("gsoc_orgs"):
            items += _gsoc(elig)
        if scrape.get("mlh"):
            items += _mlh(elig)
        cp = scrape.get("company_pages")
        if isinstance(cp, dict) and cp.get("enabled"):
            items += _company_pages(cp, elig)
        return items
