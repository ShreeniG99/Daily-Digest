"""Daily Digest — FastAPI backend.

Endpoints
---------
GET  /api/items          Return items.json (built by scripts/export.py)
GET  /api/events         SSE stream — browser subscribes, gets notified on ingest
POST /api/webhook        Triggered by scripts.run after ingest; fires SSE event
POST /api/mark/{id}      Mark item read/saved in the DB
GET  /api/health         Liveness probe

Run locally:
    uvicorn app.backend.main:app --reload --port 8000
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Ensure project root is on the path so scripts.store is importable.
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from scripts.store import init_db, mark, get_ranked  # noqa: E402

ITEMS_JSON = ROOT / "app" / "frontend" / "public" / "items.json"
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "localdev")

app = FastAPI(title="Daily Digest API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SSE broadcast ----------------------------------------------------------
_clients: set[asyncio.Queue] = set()


async def _broadcast(event: dict) -> None:
    dead = set()
    for q in list(_clients):
        try:
            q.put_nowait(event)
        except asyncio.QueueFull:
            dead.add(q)
    _clients.difference_update(dead)


# --- Routes -----------------------------------------------------------------

@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/health")
def health():
    return {"ok": True, "ts": time.time()}


@app.get("/api/items")
def items():
    if not ITEMS_JSON.exists():
        return {"generated_at": None, "count": 0, "items": []}
    return json.loads(ITEMS_JSON.read_text(encoding="utf-8"))


@app.get("/api/events")
async def events():
    """SSE stream. Each connected browser tab gets a notification when /webhook fires."""
    queue: asyncio.Queue = asyncio.Queue(maxsize=10)
    _clients.add(queue)

    async def stream():
        try:
            # Heartbeat every 30 s to keep the connection alive through proxies.
            while True:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=30)
                    yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            _clients.discard(queue)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/webhook")
async def webhook(secret: str = ""):
    if secret != WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="bad secret")

    # Reload the items count from the freshly written JSON.
    count = 0
    if ITEMS_JSON.exists():
        try:
            count = json.loads(ITEMS_JSON.read_text())["count"]
        except Exception:
            pass

    event = {
        "type": "digest_ready",
        "title": "Daily Digest is ready",
        "body": f"{count} items ranked and waiting for you",
        "ts": time.time(),
    }
    await _broadcast(event)
    return {"broadcast_to": len(_clients), "count": count}


class MarkBody(BaseModel):
    status: str = "read"


@app.post("/api/mark/{item_id}")
def mark_item(item_id: str, body: MarkBody):
    allowed = {"read", "saved", "new"}
    if body.status not in allowed:
        raise HTTPException(400, f"status must be one of {allowed}")
    mark(item_id, body.status)
    return {"ok": True}
