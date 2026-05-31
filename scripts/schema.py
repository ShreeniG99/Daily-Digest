"""Data model for Daily Digest items.

One `Item` per piece of content (news / video / paper / repo). The `id` is a
stable hash of the normalized URL so re-ingesting the same URL dedups exactly.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode


def normalize_url(url: str) -> str:
    """Canonicalize a URL for dedup: lowercase scheme+host, drop fragment and
    tracking params, strip a trailing slash. Same content -> same string."""
    url = (url or "").strip()
    if not url:
        return ""
    parts = urlsplit(url)
    scheme = parts.scheme.lower()
    netloc = parts.netloc.lower()
    path = parts.path.rstrip("/") or parts.path
    query = urlencode(
        [(k, v) for k, v in parse_qsl(parts.query) if not k.lower().startswith("utm_")]
    )
    return urlunsplit((scheme, netloc, path, query, ""))


@dataclass
class Item:
    id: str = ""          # sha1(normalized_url)[:16]; set in __post_init__
    kind: str = ""        # news | youtube | paper | repo
    source: str = ""
    title: str = ""
    url: str = ""
    author: str = ""
    published_ts: float = 0.0
    fetched_ts: float = 0.0
    raw_text: str = ""    # abstract / transcript / description -> what Claude summarizes
    summary: str = ""     # empty in Phase 1; Claude fills on read
    tags: list[str] = field(default_factory=list)
    domain: str = ""      # ai | fintech | healthtech | agrotech | tech
    score: float = 0.0
    status: str = "new"   # new | read | saved
    extra: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.id and self.url:
            digest = hashlib.sha1(normalize_url(self.url).encode("utf-8")).hexdigest()
            self.id = digest[:16]
