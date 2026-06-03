"""SQLite persistence for Daily Digest.

Three tables:
  items       - one row per piece of content, keyed by Item.id (dedup is exact).
  fetch_state - per-source cursor (last published_ts seen) for incremental fetch.
  actions     - audit log of status changes (mark read/saved).

The DB lives at the project root as daily-digest.db.
"""
from __future__ import annotations

import heapq
import json
import sqlite3
import time
from pathlib import Path

from .schema import Item

DB_PATH = Path(__file__).resolve().parent.parent / "daily-digest.db"

_COLUMNS = [
    "id", "kind", "source", "title", "url", "author",
    "published_ts", "fetched_ts", "raw_text", "summary",
    "tags", "domain", "score", "status", "extra",
]


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS items (
                id           TEXT PRIMARY KEY,
                kind         TEXT,
                source       TEXT,
                title        TEXT,
                url          TEXT,
                author       TEXT,
                published_ts REAL,
                fetched_ts   REAL,
                raw_text     TEXT,
                summary      TEXT,
                tags         TEXT,   -- JSON array
                domain       TEXT,
                score        REAL,
                status       TEXT,
                extra        TEXT    -- JSON object
            );

            CREATE TABLE IF NOT EXISTS fetch_state (
                source TEXT PRIMARY KEY,
                cursor REAL
            );

            CREATE TABLE IF NOT EXISTS actions (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id TEXT,
                status  TEXT,
                ts      REAL
            );

            CREATE INDEX IF NOT EXISTS idx_items_kind_score
                ON items (kind, score DESC);
            """
        )


def _row_to_item(row: sqlite3.Row) -> Item:
    return Item(
        id=row["id"], kind=row["kind"], source=row["source"], title=row["title"],
        url=row["url"], author=row["author"], published_ts=row["published_ts"],
        fetched_ts=row["fetched_ts"], raw_text=row["raw_text"], summary=row["summary"],
        tags=json.loads(row["tags"] or "[]"), domain=row["domain"],
        score=row["score"], status=row["status"], extra=json.loads(row["extra"] or "{}"),
    )


def upsert_item(item: Item) -> bool:
    """Insert an item, ignoring it if its id already exists (exact dedup).
    Returns True if a new row was written, False if it was a duplicate."""
    with _connect() as conn:
        cur = conn.execute(
            f"INSERT OR IGNORE INTO items ({','.join(_COLUMNS)}) "
            f"VALUES ({','.join('?' for _ in _COLUMNS)})",
            (
                item.id, item.kind, item.source, item.title, item.url, item.author,
                item.published_ts, item.fetched_ts, item.raw_text, item.summary,
                json.dumps(item.tags), item.domain, item.score, item.status,
                json.dumps(item.extra),
            ),
        )
        return cur.rowcount > 0


def all_items(kind: str | None = None) -> list[Item]:
    """Every stored item (optionally of one kind), unranked."""
    with _connect() as conn:
        if kind:
            rows = conn.execute("SELECT * FROM items WHERE kind = ?", (kind,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM items").fetchall()
    return [_row_to_item(r) for r in rows]


def set_scores(pairs: list[tuple[str, float]]) -> None:
    """Bulk-update item scores: pairs of (id, score)."""
    if not pairs:
        return
    with _connect() as conn:
        conn.executemany("UPDATE items SET score = ? WHERE id = ?",
                         [(s, i) for i, s in pairs])


def get_ranked(kind: str | None = None, limit: int = 30,
               source: str | None = None) -> list[Item]:
    """Return the top-`limit` items (optionally filtered by kind and/or source),
    highest score first. Top-K via heapq.nlargest over the stored scores."""
    clauses, params = [], []
    if kind:
        clauses.append("kind = ?")
        params.append(kind)
    if source:
        clauses.append("source = ?")
        params.append(source)
    where = (" WHERE " + " AND ".join(clauses)) if clauses else ""
    with _connect() as conn:
        rows = conn.execute("SELECT * FROM items" + where, params).fetchall()
    items = [_row_to_item(r) for r in rows]
    return heapq.nlargest(limit, items, key=lambda i: i.score)


def mark(item_id: str, status: str) -> None:
    with _connect() as conn:
        conn.execute("UPDATE items SET status = ? WHERE id = ?", (status, item_id))
        conn.execute(
            "INSERT INTO actions (item_id, status, ts) VALUES (?, ?, ?)",
            (item_id, status, time.time()),
        )


def get_cursor(source: str) -> float:
    with _connect() as conn:
        row = conn.execute(
            "SELECT cursor FROM fetch_state WHERE source = ?", (source,)
        ).fetchone()
    return row["cursor"] if row else 0.0


def set_cursor(source: str, ts: float) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO fetch_state (source, cursor) VALUES (?, ?) "
            "ON CONFLICT(source) DO UPDATE SET cursor = excluded.cursor",
            (source, ts),
        )
