"""CLI entry point.

    python -m scripts.run all|news|youtube|papers|github [--since DAYS]

Runs the selected adapter(s): fetch -> score -> upsert (dedup) -> persist cursor,
then prints a ranked summary table from the store.
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import yaml
from dotenv import load_dotenv

from . import rank, store
from .adapters.news_rss import NewsRSSAdapter
from .adapters.youtube import YouTubeAdapter

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config" / "sources.yaml"

# Adapters are registered here as they are built (Phase 1 order: news first).
ADAPTERS = {
    "news": NewsRSSAdapter(),
    "youtube": YouTubeAdapter(),
}
KINDS = ["news", "youtube", "papers", "github"]


def load_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as fh:
        return yaml.safe_load(fh) or {}


def run_kind(kind: str, cfg: dict, since_days: float | None) -> None:
    adapter = ADAPTERS.get(kind)
    if adapter is None:
        print(f"[{kind}] adapter not built yet — skipping.")
        return

    cursor = store.get_cursor(adapter.name)
    since_ts = cursor
    if since_days is not None:
        floor = time.time() - since_days * 86400
        since_ts = max(cursor, floor)

    print(f"[{kind}] fetching since {_fmt_ts(since_ts) if since_ts else 'beginning'} ...")
    items = adapter.fetch(cfg, {"since_ts": since_ts})

    new_count, max_ts = 0, cursor
    for item in items:
        rank.score_item(item, cfg)
        if store.upsert_item(item):
            new_count += 1
        max_ts = max(max_ts, item.published_ts)

    if max_ts > cursor:
        store.set_cursor(adapter.name, max_ts)

    print(f"[{kind}] fetched {len(items)}, new {new_count}, duplicates {len(items) - new_count}")
    _print_table(store.get_ranked(kind, limit=30))


def _fmt_ts(ts: float) -> str:
    return time.strftime("%Y-%m-%d", time.localtime(ts)) if ts else "-"


def _print_table(items: list) -> None:
    if not items:
        print("  (no items)")
        return
    print(f"\n  {'#':>2}  {'SCORE':>6}  {'DATE':<10}  {'SOURCE':<22}  TITLE")
    print("  " + "-" * 96)
    for i, it in enumerate(items, 1):
        source = (it.source[:21]) if it.source else ""
        title = (it.title[:60]) if it.title else ""
        print(f"  {i:>2}  {it.score:>6.2f}  {_fmt_ts(it.published_ts):<10}  {source:<22}  {title}")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(prog="scripts.run", description="Daily Digest ingestion")
    parser.add_argument("target", choices=["all"] + KINDS, help="which adapter(s) to run")
    parser.add_argument("--since", type=float, default=None,
                        help="only fetch items from the last N days (overrides stored cursor floor)")
    args = parser.parse_args()

    # Titles/transcripts can contain emoji and non-Latin text; the Windows
    # console defaults to cp1252 and would crash on them. Force UTF-8 output.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    load_dotenv(ROOT / ".env")
    cfg = load_config()
    store.init_db()

    targets = KINDS if args.target == "all" else [args.target]
    for kind in targets:
        run_kind(kind, cfg, args.since)


if __name__ == "__main__":
    main()
