"""Export top-ranked items from daily-digest.db to app/frontend/public/items.json.

Called automatically at the end of every `scripts.run` invocation and by the
GitHub Action. The JSON file is what the React UI reads.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from .store import init_db, get_ranked
from .schema import Item

OUT = Path(__file__).resolve().parent.parent / "app" / "frontend" / "public" / "items.json"
LIMIT = 80


def export_items() -> int:
    init_db()
    items = get_ranked(limit=LIMIT)
    payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(items),
        "items": [_to_dict(it) for it in items],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[export] {len(items)} items -> {OUT.name}")
    return len(items)


def _to_dict(item: Item) -> dict:
    return {
        "id": item.id,
        "kind": item.kind,
        "source": item.source,
        "title": item.title,
        "url": item.url,
        "author": item.author,
        "published_ts": item.published_ts,
        "raw_text": (item.raw_text or "")[:600],
        "score": round(item.score, 2),
        "status": item.status,
        "domain": item.domain,
        "tags": item.tags,
        "extra": item.extra,
    }
