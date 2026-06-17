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
PUBLISHED = {"news": 10, "paper": 6, "youtube": 6, "repo": 6, "opportunity": 6}
ARCHIVE_DAYS = 7
WEEK_HIGHLIGHTS = 24
GEMINI_MODEL = "gemini-2.5-flash"
SUMMARY_BATCH = 6  # items per Gemini summarization call (small = reliable, no truncation)

# GSoC priority — guarantee these surface even when keyword-heavy items outscore them.
GSOC_ORGS = {"incf", "deepchem", "scikit-learn", "mlpack", "nilearn", "dipy"}
# Explicitly named must-include orgs: their single top repo is pinned every day.
MUST_ORGS = ("incf", "deepchem")
GSOC_KEYWORDS = ("gsoc", "google summer of code")
# Extra guaranteed slots for *other* GSoC-priority items per kind, on top of the
# pinned MUST_ORGS; the remaining slots go to the top-scored candidates.
PRIORITY_MIN = {"repo": 1, "news": 1}

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
    # Opportunities carry an apply link / deadline / company the card surfaces.
    if item.kind == "opportunity" and item.extra:
        extra = {k: item.extra.get(k) for k in ("deadline", "company", "role", "apply_url")
                 if item.extra.get(k)}
        if extra:
            d["extra"] = extra
    return d


def _is_priority(d: dict) -> bool:
    """GSoC-priority: owned by a configured GSoC org, or GSoC mentioned in the text."""
    if (d.get("author") or "").lower() in GSOC_ORGS:
        return True
    blob = f"{d.get('title', '')} {d.get('raw_text', '')}".lower()
    return any(k in blob for k in GSOC_KEYWORDS)


def select_today() -> list[dict]:
    """Top-N ranked published items per kind, image-attached, score desc overall.

    Items dated in the future (embargo/placeholder dates some sources carry) are
    skipped. For kinds in PRIORITY_MIN, a few slots are reserved for GSoC-priority
    items so INCF/DeepChem (and GSoC news) reliably appear even when keyword-heavy
    items outscore them; remaining slots go to the highest-scored candidates."""
    future = time.time() + 86400
    picked: list[dict] = []
    for kind, n in PUBLISHED.items():
        # Wide pool so a named-org item (e.g. deepchem) that scores modestly is still
        # a candidate to pin.
        cands = [_to_dict(it) for it in store.get_ranked(kind, limit=max(n * 5, 100))
                 if it.published_ts <= future]
        chosen: list[dict] = []
        seen: set[str] = set()

        def take(d: dict) -> None:
            if d["id"] not in seen and len(chosen) < n:
                chosen.append(d)
                seen.add(d["id"])

        # 1. pin the top repo from each explicitly-named org (INCF, DeepChem)
        if kind == "repo":
            for org in MUST_ORGS:
                top = next((d for d in cands if (d.get("author") or "").lower() == org), None)
                if top:
                    take(top)
        # 2. a few more GSoC-priority items (not already pinned above)
        extra_prio = [c for c in cands if _is_priority(c) and c["id"] not in seen]
        for d in extra_prio[:PRIORITY_MIN.get(kind, 0)]:
            take(d)
        # 3. fill remaining slots by score
        for d in cands:
            take(d)
        picked.extend(chosen)
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
SUMMARY_INSTR = (
    "For each item write a teaching summary for the reader: 90-150 words, plain "
    "English, like a calm study partner explaining it — what it is, why it matters, "
    "and one thing they could try or take away. No hype, sentence case, address them "
    "as 'you'. Also give a one-line 'why' (<=15 words) on why it matters to them. "
    "Return ONLY a JSON object mapping each id to "
    '{"summary": "...", "why": "..."}, with an entry for every id.'
)


def _gemini_json(client, prompt: str):
    """One Gemini call returning parsed JSON, retrying transient 503/429. None on fail."""
    from google.genai import types
    cfg = types.GenerateContentConfig(
        response_mime_type="application/json", temperature=0.4)
    for attempt in range(4):
        try:
            resp = client.models.generate_content(
                model=GEMINI_MODEL, contents=prompt, config=cfg)
            return json.loads(resp.text)
        except Exception as exc:  # network / quota / parse — never abort the build
            transient = any(s in str(exc) for s in ("503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"))
            if transient and attempt < 3:
                wait = 3 * (attempt + 1)
                print(f"  ~ Gemini transient (attempt {attempt + 1}) — retrying in {wait}s")
                time.sleep(wait)
                continue
            print(f"  ~ Gemini call failed ({exc})")
            return None
    return None


def _summarize(client, today: list[dict]) -> int:
    """Set a teaching `summary` and one-line `why` on each item via small batched
    calls (small batches avoid giant-JSON truncation). Returns count summarized."""
    got = 0
    for i in range(0, len(today), SUMMARY_BATCH):
        batch = today[i:i + SUMMARY_BATCH]
        payload = [{"id": d["id"], "kind": d["kind"], "title": d["title"],
                    "text": (d.get("raw_text") or "")[:500]} for d in batch]
        prompt = (f"{OWNER}\n\n{SUMMARY_INSTR}\n\n"
                  f"ITEMS:\n{json.dumps(payload, ensure_ascii=False)}")
        data = _gemini_json(client, prompt) or {}
        for d in batch:
            ent = data.get(d["id"]) or {}
            if ent.get("summary"):
                d["summary"] = ent["summary"].strip()
                got += 1
            if ent.get("why"):
                d["why"] = ent["why"].strip()
    return got


def _daily_todo(client, today: list[dict]) -> str:
    digest = [{"id": d["id"], "title": d["title"]} for d in today]
    prompt = (f"{OWNER}\n\nFrom today's digest titles, return ONLY JSON "
              '{ "todo": "<one consolidated, concrete next-action for the reader '
              'today, 1-2 sentences>" }.\n\n'
              f"DIGEST:\n{json.dumps(digest, ensure_ascii=False)}")
    data = _gemini_json(client, prompt) or {}
    return (data.get("todo") or "").strip()


def enrich(today: list[dict]) -> str:
    """Add a teaching `summary` + one-line `why` to each item (in place) and return a
    single daily to-do. Degrades gracefully if the key is missing or the API fails."""
    import os

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        print("  ~ GEMINI_API_KEY missing — shipping without summaries/why/to-do.")
        return ""
    try:
        from google import genai
    except ImportError as exc:
        print(f"  ~ google-genai not importable ({exc}) — skipping enrichment.")
        return ""

    client = genai.Client(api_key=key)
    got = _summarize(client, today)
    todo = _daily_todo(client, today)
    print(f"  + enriched: {got}/{len(today)} summaries, to-do {'set' if todo else 'empty'}")
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

    # Neural Indian-voice narration (edge-tts) baked from title + summary. Optional:
    # if edge-tts isn't installed or synthesis fails, ship without audio (the app
    # falls back to the browser voice) rather than aborting the whole build.
    try:
        from .audio import synthesize
        n_audio = synthesize(today, WEB / "audio")
        print(f"  + narrated {n_audio}/{len(today)} items (en-IN neural voice)")
    except ImportError as exc:
        print(f"  ~ edge-tts not installed ({exc}) — shipping without narration.")
    except Exception as exc:  # never let audio break the daily build
        print(f"  ~ narration step failed ({exc}) — shipping without audio.")

    archive = merge_archive(load_archive(), today)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ARCHIVE_JSON.write_text(json.dumps(archive, ensure_ascii=False), encoding="utf-8")
    print(f"  archive now holds {len(archive)} items (<= {ARCHIVE_DAYS}d)")

    write_json(ITEMS_JSON, {"generated_ts": now, "todo": todo, "items": today})
    write_json(WEEK_JSON, {"generated_ts": now, "items": week_highlights(archive)})
    print("[publish] done.")


if __name__ == "__main__":
    main()
