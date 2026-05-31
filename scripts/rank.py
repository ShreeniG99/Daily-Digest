"""Deterministic relevance scoring.

    score = 3*tier1_hits + 1*tier2_hits - 2*tier3_hits + recency + source_priority

  - keyword hits: count of distinct tier keywords found in title+raw_text.
    Matching is whole-word and case-insensitive so short keywords like "AI" or
    "React" don't match inside unrelated words ("available", "reactor").
  - recency: exp(-age_days / 7)  -> ~1.0 today, ~0.37 a week old.
  - source_priority: optional per-source bump from config (default 0).

Phase 1 keeps this simple; fuzzy dedup / embeddings are Phase 2.
"""
from __future__ import annotations

import math
import re
import time
from functools import lru_cache

from .schema import Item


@lru_cache(maxsize=512)
def _kw_pattern(keyword: str) -> re.Pattern:
    # \b is loose around non-word chars (e.g. "full-stack", "q-fin"); anchor on
    # the keyword's own edges instead so multi-token keywords still match.
    return re.compile(r"(?<!\w)" + re.escape(keyword.lower()) + r"(?!\w)")


def _hits(text: str, keywords: list[str]) -> int:
    return sum(1 for kw in keywords if _kw_pattern(kw).search(text))


def _recency(published_ts: float, now: float) -> float:
    if not published_ts:
        return 0.0
    age_days = max(0.0, (now - published_ts) / 86400.0)
    return math.exp(-age_days / 7.0)


def score_item(item: Item, cfg: dict, now: float | None = None) -> float:
    """Compute, set on the item, and return its relevance score."""
    now = time.time() if now is None else now
    tiers = cfg.get("keyword_tiers", {})
    text = f"{item.title}\n{item.raw_text}".lower()

    t1 = _hits(text, tiers.get("tier1", []))
    t2 = _hits(text, tiers.get("tier2", []))
    t3 = _hits(text, tiers.get("tier3", []))

    priority = cfg.get("source_priority", {}).get(item.source, 0)

    item.score = 3 * t1 + 1 * t2 - 2 * t3 + _recency(item.published_ts, now) + priority
    return item.score
