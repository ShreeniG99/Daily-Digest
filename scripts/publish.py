"""Publish step: turn the ranked store into the static artifacts the web app reads.

    python -m scripts.publish

Pipeline (deterministic, except one optional Gemini call for teaching content):
  1. select top-N ranked items per *published* kind (news/paper/youtube/repo only;
     opportunities/OSS stay private and never leave the local DB)
  2. attach a deterministic image URL (scripts.images) where one exists
  3. merge today's items into a rolling 7-day archive (web/data/archive.json)
  4. Gemini (one call): a single daily "to-do" + a 1-line "why it matters" per item;
     omitted gracefully if GEMINI_API_KEY is missing or the call fails
  5. write web/items.json (today) and web/week.json (7-day highlights)

The pipeline (ingestion) stays LLM-free; this build-time enrichment is consumption,
baked into the static artifact — consistent with the CLAUDE.md architecture rule.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

from . import store
from .images import image_for
from .schema import Item

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
DATA_DIR = WEB / "data"
ITEMS_JSON = WEB / "items.json"
WEEK_JSON = WEB / "week.json"
ARCHIVE_JSON = DATA_DIR / "archive.json"

# Published kinds and how many of each to surface in today's digest.
PUBLISHED = {"news": 10, "paper": 6, "youtube": 6, "repo": 6}
ARCHIVE_DAYS = 7
WEEK_HIGHLIGHTS = 24
GEMINI_MODEL = "gemini-2.5-flash"

# Fields that are safe to publish (no status/summary/fetched_ts internal state).
PUBLISH_FIELDS = (
    "id", "kind", "source", "title", "url", "author",
    "published_ts", "raw_text", "tags", "domain", "score",
)

# Short owner context for the teaching voice — mirrors CLAUDE.md.
OWNER = (
    "The reader is a rising 3rd-year B.Tech AI & Data Science student in India "
    "targeting SDE/SWE/AIML/R&D roles. They care about RAG, LLMs, transformers, "
    "GenAI, agents, full-stack and MLOps. Voice: calm study partner, plain and "
    "teaching-first, lightly warm, no hype, sentence case, address them as 'you'."
)


def _to_dict(item: Item) -> dict:
    d = {k: getattr(item, k) for k in PUBLISH_FIELDS}
    img = image_for(item)
    if img:
        d["image"] = img
    return d


def select_today() -> list[dict]:
    """Top-N ranked published items per kind, image-attached, score desc overall.
    Items dated in the future (embargo/placeholder dates some sources carry) are
    skipped so the app never shows a story 'published' years from now."""
    future = time.time() + 86400
    picked: list[dict] = []
    for kind, n in PUBLISHED.items():
        kept = 0
        for item in store.get_ranked(kind, limit=n * 3):
            if item.published_ts > future:
                continue
            picked.append(_to_dict(item))
            kept += 1
            if kept >= n:
                break
    picked.sort(key=lambda d: d.get("score", 0), reverse=True)
    return picked


# ── rolling 7-day archive ───────────────────────────────────────────────────
def load_archive() -> list[dict]:
    if not ARCHIVE_JSON.exists():
        return []
    try:
        return json.loads(ARCHIVE_JSON.read_text(encoding="utf-8")) or []
    except (json.JSONDecodeError, OSError):
        return []


def merge_archive(existing: list[dict], today: list[dict]) -> list[dict]:
    """Add today's items, dedup by id (today wins — fresher score/why), drop
    anything older than ARCHIVE_DAYS."""
    floor = time.time() - ARCHIVE_DAYS * 86400
    by_id: dict[str, dict] = {}
    for d in existing + today:
        if d.get("published_ts", 0) >= floor:
            by_id[d["id"]] = d
    return sorted(by_id.values(), key=lambda d: d.get("published_ts", 0), reverse=True)


def week_highlights(archive: list[dict]) -> list[dict]:
    return sorted(archive, key=lambda d: d.get("score", 0), reverse=True)[:WEEK_HIGHLIGHTS]


# ── Gemini enrichment (optional, graceful) ──────────────────────────────────
def enrich(today: list[dict]) -> str:
    """Return a single daily to-do string and mutate `today` in place to add a
    `why` line per item. Returns '' (and adds no `why`) on any failure."""
    import os

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("  ~ GEMINI_API_KEY missing — skipping to-do / why enrichment.")
        return ""
    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        print(f"  ~ google-genai not importable ({exc}) — skipping enrichment.")
        return ""

    digest = [
        {"id": d["id"], "kind": d["kind"], "title": d["title"],
         "abstract": (d.get("raw_text") or "")[:240]}
        for d in today
    ]
    prompt = (
        f"{OWNER}\n\n"
        "Below is today's ranked digest as JSON. Return ONLY a JSON object:\n"
        '{ "todo": "<one consolidated, concrete next-action for the reader today, '
        '1-2 sentences>", "why": { "<item id>": "<one short line on why this item '
        'matters to you, =15 words, no hype>", ... } }\n'
        "Give a why for every id. Keep the calm teaching voice.\n\n"
        f"DIGEST:\n{json.dumps(digest, ensure_ascii=False)}"
    )
    client = genai.Client(api_key=key)
    cfg = types.GenerateContentConfig(
        response_mime_type="application/json", temperature=0.4)
    data = None
    # gemini-2.5-flash can answer 503 (high demand) / 429 transiently — retry a
    # few times with backoff before giving up and shipping without enrichment.
    for attempt in range(4):
        try:
            resp = client.models.generate_content(
                model=GEMINI_MODEL, contents=prompt, config=cfg)
            data = json.loads(resp.text)
            break
        except Exception as exc:  # network / quota / parse — never abort the build
            transient = any(s in str(exc) for s in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"))
            if transient and attempt < 3:
                wait = 3 * (attempt + 1)
                print(f"  ~ Gemini {('503/429')} (attempt {attempt + 1}) — retrying in {wait}s")
                time.sleep(wait)
                continue
            print(f"  ~ Gemini enrichment failed ({exc}) — publishing without to-do/why.")
            return ""

    why = data.get("why") or {}
    for d in today:
        line = why.get(d["id"])
        if line:
            d["why"] = line.strip()
    todo = (data.get("todo") or "").strip()
    print(f"  + enriched: to-do {'set' if todo else 'empty'}, "
          f"{sum('why' in d for d in today)}/{len(today)} items have a why")
    return todo


# ── write ───────────────────────────────────────────────────────────────────
def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)} ({path.stat().st_size // 1024} KB)")


def main() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")

    store.init_db()
    now = int(time.time())

    today = select_today()
    print(f"[publish] selected {len(today)} items "
          f"({sum('image' in d for d in today)} with images)")

    todo = enrich(today)

    archive = merge_archive(load_archive(), today)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_JSON.write_text(json.dumps(archive, ensure_ascii=False), encoding="utf-8")
    print(f"  archive now holds {len(archive)} items (<= {ARCHIVE_DAYS}d)")

    write_json(ITEMS_JSON, {"generated_ts": now, "todo": todo, "items": today})
    write_json(WEEK_JSON, {"generated_ts": now, "items": week_highlights(archive)})
    print("[publish] done.")


if __name__ == "__main__":
    main()
