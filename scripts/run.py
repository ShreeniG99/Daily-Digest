"""CLI entry point.

    python -m scripts.run all|news|youtube|papers|github [--since DAYS]

Runs the selected adapter(s): fetch -> score -> upsert (dedup) -> persist cursor,
then prints a ranked summary table from the store.
"""
from __future__ import annotations

import os
import argparse
import sys
import time
from pathlib import Path

import yaml
from dotenv import load_dotenv

from . import rank, store
from .export import export_items
from .adapters.news_rss import NewsRSSAdapter
from .adapters.youtube import YouTubeAdapter
from .adapters.papers import PapersAdapter
from .adapters.github_repos import GitHubReposAdapter
from .adapters.opportunities import OpportunitiesAdapter
from .adapters.oss_issues import OSSIssuesAdapter

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "config" / "sources.yaml"

# Adapters are registered here as they are built (Phase 1 order: news first).
ADAPTERS = {
    "news": NewsRSSAdapter(),
    "youtube": YouTubeAdapter(),
    "papers": PapersAdapter(),
    "github": GitHubReposAdapter(),
    "opportunities": OpportunitiesAdapter(),
    "oss": OSSIssuesAdapter(),
}
KINDS = ["news", "youtube", "papers", "github", "opportunities", "oss"]


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

    now = time.time()
    new_count, max_ts = 0, cursor
    for item in items:
        rank.score_item(item, cfg)
        if store.upsert_item(item):
            new_count += 1
        # Never advance the cursor past now: some sources carry future
        # (embargo/placeholder) publication dates that would otherwise stall
        # every later run.
        if item.published_ts <= now:
            max_ts = max(max_ts, item.published_ts)

    if max_ts > cursor:
        store.set_cursor(adapter.name, max_ts)

    # Re-score EVERY stored item of this kind (not just the ones fetched now) so
    # ranking changes and recency decay apply uniformly — otherwise items that
    # rotated out of a source keep stale scores forever.
    stored = store.all_items(adapter.kind)
    for it in stored:
        rank.score_item(it, cfg)
    store.set_scores([(it.id, it.score) for it in stored])

    print(f"[{kind}] fetched {len(items)}, new {new_count}, duplicates {len(items) - new_count}")
    # Some adapters share a kind (oss issues are kind=opportunity); show just their
    # own source in the table when they declare a display_source.
    display_source = getattr(adapter, "display_source", None)
    _print_table(store.get_ranked(adapter.kind, limit=30, source=display_source))


def _fmt_ts(ts: float) -> str:
    return time.strftime("%Y-%m-%d", time.localtime(ts)) if ts else "-"


def _print_table(items: list, show_id: bool = False) -> None:
    if not items:
        print("  (no items)")
        return
    if show_id:
        print(f"\n  {'#':>2}  {'ID':<16}  {'SCORE':>6}  {'SOURCE':<14}  TITLE")
        print("  " + "-" * 96)
        for i, it in enumerate(items, 1):
            print(f"  {i:>2}  {it.id:<16}  {it.score:>6.2f}  {(it.source[:13]):<14}  {it.title[:50]}")
        print()
        return
    print(f"\n  {'#':>2}  {'SCORE':>6}  {'DATE':<10}  {'SOURCE':<22}  TITLE")
    print("  " + "-" * 96)
    for i, it in enumerate(items, 1):
        source = (it.source[:21]) if it.source else ""
        title = (it.title[:60]) if it.title else ""
        print(f"  {i:>2}  {it.score:>6.2f}  {_fmt_ts(it.published_ts):<10}  {source:<22}  {title}")
    print()


def cmd_list() -> None:
    """Show ranked opportunities with their ids (for `check`)."""
    _print_table(store.get_ranked("opportunity", limit=50), show_id=True)


def cmd_check(ids: list[str]) -> None:
    """Mark opportunities as picked (status='checked') for deep-rep."""
    if not ids:
        print("usage: python -m scripts.run check <id> [<id> ...]")
        return
    for item_id in ids:
        item = store.get(item_id)
        if item is None:
            print(f"  ? no item with id {item_id}")
            continue
        store.mark(item_id, "checked")
        print(f"  checked {item_id}  {item.title[:60]}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="scripts.run", description="Daily Digest ingestion")
    parser.add_argument("target", choices=["all", "list", "check"] + KINDS,
                        help="adapter(s) to run, or 'list' / 'check <id>...'")
    parser.add_argument("ids", nargs="*", help="item ids (for 'check')")
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

    if args.target == "list":
        cmd_list()
        return
    if args.target == "check":
        cmd_check(args.ids)
        return

    targets = KINDS if args.target == "all" else [args.target]
    for kind in targets:
        run_kind(kind, cfg, args.since)

    # Always refresh the JSON export so the web UI stays current.
    export_items()

    # Optionally notify the local UI via webhook (only if server is running).
    _notify_local()


def _notify_local() -> None:
    """Best-effort POST to the local UI server so it broadcasts a push event.
    Silently skipped if the server isn't running."""
    import urllib.request, urllib.error
    secret = os.environ.get("WEBHOOK_SECRET", "localdev")
    try:
        req = urllib.request.Request(
            f"http://localhost:8000/api/webhook?secret={secret}",
            method="POST")
        urllib.request.urlopen(req, timeout=2)
    except Exception:
        pass  # server not running — that's fine


if __name__ == "__main__":
    main()
