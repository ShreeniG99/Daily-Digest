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
import re
import sqlite3
import time
from difflib import SequenceMatcher
from pathlib import Path

from .schema import Item

DB_PATH = Path(__file__).resolve().parent.parent / "daily-digest.db"

_NT_RE = re.compile(r"[^a-z0-9 ]+")
_KEY_TOKEN_RE = re.compile(r"[A-Z][a-zA-Z]{1,}|[\d][.\d]*[\d]|[a-z]+-[a-z]+")
_FUZZY_DAYS = 30        # only compare against items ingested in the last N days
_FUZZY_MIN_WORDS = 5    # skip for very short titles (too many false positives)
_JACCARD_THRESH = 0.55  # word-overlap: catches same-phrasing near-dups
_ENTITY_THRESH = 0.65   # key-token overlap: catches "GPT-5.4 released" vs "GPT-5.4 launched"


def _norm_title(title: str) -> str:
    return _NT_RE.sub(" ", (title or "").lower()).strip()


def _jaccard(a: str, b: str) -> float:
    sa, sb = set(a.split()), set(b.split())
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def _entity_overlap(title_a: str, title_b: str) -> float:
    """Overlap of significant tokens: proper nouns, version numbers, hyphenated terms."""
    ta = {t.lower() for t in _KEY_TOKEN_RE.findall(title_a) if len(t) > 1}
    tb = {t.lower() for t in _KEY_TOKEN_RE.findall(title_b) if len(t) > 1}
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def _is_fuzzy_dup(nt: str, raw_title: str, kind: str, conn: sqlite3.Connection) -> bool:
    """True if a near-duplicate title exists in the DB (last FUZZY_DAYS days).
    Two-stage: high word-overlap OR high entity overlap → same story."""
    if len(nt.split()) < _FUZZY_MIN_WORDS:
        return False
    cutoff = time.time() - _FUZZY_DAYS * 86400
    rows = conn.execute(
        "SELECT norm_title, title FROM items WHERE kind=? AND published_ts>=? AND norm_title!=''",
        (kind, cutoff),
    ).fetchall()
    for row in rows:
        existing_nt = row["norm_title"]
        existing_raw = row["title"] or ""
        if not existing_nt:
            continue
        if (_jaccard(nt, existing_nt) >= _JACCARD_THRESH or
                _entity_overlap(raw_title, existing_raw) >= _ENTITY_THRESH):
            return True
    return False


_COLUMNS = [
    "id", "kind", "source", "title", "url", "author",
    "published_ts", "fetched_ts", "raw_text", "summary",
    "tags", "domain", "score", "status", "extra", "norm_title",
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
                extra        TEXT,   -- JSON object
                norm_title   TEXT DEFAULT ''
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
        # Migrate existing DBs that predate the norm_title column.
        try:
            conn.execute("ALTER TABLE items ADD COLUMN norm_title TEXT DEFAULT ''")
        except sqlite3.OperationalError:
            pass  # column already exists
        # Index on norm_title must come AFTER the column is guaranteed to exist.
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_items_norm_title ON items (kind, norm_title)"
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
    """Insert an item; skip if a duplicate exists by URL hash, normalized title,
    or fuzzy title similarity (same story phrased differently).
    Returns True if a new row was written, False if it was a duplicate."""
    nt = _norm_title(item.title)
    with _connect() as conn:
        # 1. Exact normalized-title dedup (cross-source, same phrasing).
        if nt and conn.execute(
            "SELECT 1 FROM items WHERE kind=? AND norm_title=?", (item.kind, nt)
        ).fetchone():
            return False
        # 2. Fuzzy dedup (same story, slightly different headline).
        if _is_fuzzy_dup(nt, item.title, item.kind, conn):
            return False
        cur = conn.execute(
            f"INSERT OR IGNORE INTO items ({','.join(_COLUMNS)}) "
            f"VALUES ({','.join('?' for _ in _COLUMNS)})",
            (
                item.id, item.kind, item.source, item.title, item.url, item.author,
                item.published_ts, item.fetched_ts, item.raw_text, item.summary,
                json.dumps(item.tags), item.domain, item.score, item.status,
                json.dumps(item.extra), nt,
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
               source: str | None = None,
               status_filter: str | None = None) -> list[Item]:
    """Return the top-`limit` items (optionally filtered by kind, source, and/or
    status), highest score first. Top-K via heapq.nlargest over stored scores."""
    clauses, params = [], []
    if kind:
        clauses.append("kind = ?")
        params.append(kind)
    if source:
        clauses.append("source = ?")
        params.append(source)
    if status_filter:
        clauses.append("status = ?")
        params.append(status_filter)
    where = (" WHERE " + " AND ".join(clauses)) if clauses else ""
    with _connect() as conn:
        rows = conn.execute("SELECT * FROM items" + where, params).fetchall()
    items = [_row_to_item(r) for r in rows]
    return heapq.nlargest(limit, items, key=lambda i: i.score)


def get_recent(days: float = 7, kind: str | None = None) -> list[Item]:
    """All items published within the last `days` days, newest first.
    Used for the weekly trend view."""
    cutoff = time.time() - days * 86400
    clauses, params = ["published_ts >= ?"], [cutoff]
    if kind:
        clauses.append("kind = ?")
        params.append(kind)
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM items WHERE " + " AND ".join(clauses)
            + " ORDER BY published_ts DESC", params).fetchall()
    return [_row_to_item(r) for r in rows]


def get(item_id: str) -> Item | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    return _row_to_item(row) if row else None


def get_by_status(status: str, kind: str | None = None) -> list[Item]:
    """All items with the given status (optionally of one kind)."""
    clauses, params = ["status = ?"], [status]
    if kind:
        clauses.append("kind = ?")
        params.append(kind)
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM items WHERE " + " AND ".join(clauses), params).fetchall()
    return [_row_to_item(r) for r in rows]


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
