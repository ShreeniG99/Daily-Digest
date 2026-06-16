"""Deterministic image URLs for published items. No network calls, no LLM.

This is consumption-shaping that stays in the app layer: a stable, derivable image
URL per item where one exists, else '' so the frontend renders a clean text-only
card (no blank space, no placeholder).

  youtube -> i.ytimg.com thumbnail derived from the 11-char video id
  repo    -> GitHub OpenGraph social card derived from owner/repo
  news    -> image the feed already carried (captured into extra['image'])
  paper   -> none (arXiv abstracts have no canonical thumbnail) -> text-only
"""
from __future__ import annotations

import re
from urllib.parse import urlsplit

from .schema import Item

# v=<id>, youtu.be/<id>, /embed/<id>, /shorts/<id> — all 11-char ids.
_YT_ID = re.compile(r"(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})")


def _youtube_image(url: str) -> str:
    m = _YT_ID.search(url or "")
    return f"https://i.ytimg.com/vi/{m.group(1)}/hqdefault.jpg" if m else ""


def _repo_image(url: str) -> str:
    parts = urlsplit(url or "")
    if "github.com" not in parts.netloc:
        return ""
    segs = [s for s in parts.path.split("/") if s]
    if len(segs) >= 2:
        return f"https://opengraph.githubassets.com/1/{segs[0]}/{segs[1]}"
    return ""


def image_for(item: Item) -> str:
    """Best-effort image URL for an item, or '' when none exists (text-only card)."""
    extra = item.extra or {}
    if extra.get("image"):
        return extra["image"]
    if item.kind == "youtube":
        return _youtube_image(item.url)
    if item.kind == "repo":
        return _repo_image(item.url)
    return ""
