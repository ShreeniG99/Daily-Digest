"""YouTube adapter: configured channels (newest uploads) + keyword searches.

Uses YouTube Data API v3 (needs YOUTUBE_API_KEY):
  channels.list(forHandle)  -> uploads playlist id
  playlistItems.list        -> newest uploads for each channel
  search.list(q, type=video) -> videos matching each search term

Transcript text (youtube-transcript-api) becomes raw_text; if a transcript is
unavailable the video description is used instead. Sources come from
config/sources.yaml (youtube.channels, youtube.search_terms).
"""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

from .base import SourceAdapter
from ..schema import Item

API = "https://www.googleapis.com/youtube/v3"
MAX_PER_SOURCE = 10  # cap uploads/search hits pulled per channel or term
# User-added subscriptions (managed in-app via the /api/channels function), merged
# with the curated channels in sources.yaml. Kept as JSON so the API can rewrite it
# without disturbing the commented sources.yaml.
USER_CHANNELS = Path(__file__).resolve().parents[2] / "config" / "channels.json"


def _user_channels() -> list[str]:
    try:
        return (json.loads(USER_CHANNELS.read_text(encoding="utf-8")) or {}).get("channels") or []
    except (OSError, json.JSONDecodeError):
        return []


def _iso_to_ts(value: str) -> float:
    if not value:
        return 0.0
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
    except ValueError:
        return 0.0


def _transcript(video_id: str) -> str:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        fetched = YouTubeTranscriptApi().fetch(video_id, languages=["en", "en-US"])
        return " ".join(snippet.text for snippet in fetched).strip()
    except Exception:
        return ""  # transcripts disabled / blocked / none — fall back to description


class YouTubeAdapter(SourceAdapter):
    name = "youtube"
    kind = "youtube"

    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        key = os.environ.get("YOUTUBE_API_KEY")
        if not key:
            raise RuntimeError("YOUTUBE_API_KEY missing from environment (.env)")

        since_ts = state.get("since_ts", 0.0)
        now = time.time()
        yt_cfg = cfg.get("youtube") or {}
        items: list[Item] = []
        seen: set[str] = set()  # video ids within this run

        # Curated channels (sources.yaml) + user-added subscriptions (channels.json),
        # deduped case-insensitively, curated first.
        channels, seen_ch = [], set()
        for handle in list(yt_cfg.get("channels") or []) + _user_channels():
            k = str(handle).strip().lower()
            if k and k not in seen_ch:
                seen_ch.add(k)
                channels.append(handle)

        for handle in channels:
            for vid in self._channel_uploads(key, handle):
                self._add(items, seen, vid, since_ts, now)

        for term in yt_cfg.get("search_terms") or []:
            for vid in self._search(key, term, since_ts):
                self._add(items, seen, vid, since_ts, now)

        return items

    def _get(self, key: str, endpoint: str, params: dict) -> dict:
        params = {**params, "key": key}
        try:
            resp = requests.get(f"{API}/{endpoint}", params=params, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            print(f"  ! youtube {endpoint} failed: {exc}")
            return {}

    def _channel_uploads(self, key: str, handle: str) -> list[dict]:
        data = self._get(key, "channels", {"part": "contentDetails", "forHandle": handle})
        chans = data.get("items") or []
        if not chans:
            print(f"  ! youtube channel not found for handle {handle}")
            return []
        uploads = chans[0]["contentDetails"]["relatedPlaylists"]["uploads"]
        data = self._get(key, "playlistItems", {
            "part": "snippet", "playlistId": uploads, "maxResults": MAX_PER_SOURCE,
        })
        out = []
        for it in data.get("items") or []:
            sn = it.get("snippet", {})
            out.append({
                "video_id": sn.get("resourceId", {}).get("videoId"),
                "title": sn.get("title", ""), "published": sn.get("publishedAt", ""),
                "channel": sn.get("channelTitle", ""), "description": sn.get("description", ""),
            })
        return out

    def _search(self, key: str, term: str, since_ts: float) -> list[dict]:
        params = {"part": "snippet", "q": term, "type": "video",
                  "order": "date", "maxResults": MAX_PER_SOURCE}
        if since_ts:
            params["publishedAfter"] = datetime.fromtimestamp(
                since_ts, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        data = self._get(key, "search", params)
        out = []
        for it in data.get("items") or []:
            sn = it.get("snippet", {})
            out.append({
                "video_id": it.get("id", {}).get("videoId"),
                "title": sn.get("title", ""), "published": sn.get("publishedAt", ""),
                "channel": sn.get("channelTitle", ""), "description": sn.get("description", ""),
            })
        return out

    def _add(self, items, seen, vid, since_ts, now) -> None:
        video_id = vid.get("video_id")
        if not video_id or video_id in seen:
            return
        ts = _iso_to_ts(vid.get("published", ""))
        if ts and ts <= since_ts:
            return
        seen.add(video_id)
        raw = _transcript(video_id) or vid.get("description", "")
        items.append(Item(
            kind="youtube", source=vid.get("channel", ""), title=vid.get("title", ""),
            url=f"https://www.youtube.com/watch?v={video_id}",
            author=vid.get("channel", ""), published_ts=ts or now, fetched_ts=now,
            raw_text=raw, domain="ai",
        ))
