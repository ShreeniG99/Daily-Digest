"""Neural narration for the digest — baked at build time, free.

Uses Microsoft Edge's neural TTS (via the `edge-tts` package) to synthesize a warm
Indian-English voice for each published item, so the app plays real audio instead of
the browser's robotic SpeechSynthesis. One small MP3 per item is written to
web/audio/<id>.mp3 and the item dict gets an `audio` path the frontend can <audio>.

Network call to Microsoft's public Edge TTS endpoint; no key required. Any failure is
non-fatal — the item simply ships without `audio` and the app falls back to browser TTS.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts

# Pleasant Indian-English neural voices: en-IN-NeerjaNeural (f) / en-IN-PrabhatNeural (m).
VOICE = "en-IN-NeerjaNeural"
# Keep narration to roughly a 1–2 minute listen — title + the teaching summary.
MAX_CHARS = 1200


def _narration(d: dict) -> str:
    title = (d.get("title") or "").strip()
    body = (d.get("summary") or d.get("raw_text") or "").strip()
    text = f"{title}. {body}" if title and body else (title or body)
    return text[:MAX_CHARS].strip()


async def _synth(text: str, path: Path) -> None:
    await edge_tts.Communicate(text, VOICE).save(str(path))


def synthesize(items: list[dict], audio_dir: Path) -> int:
    """Write one MP3 per item into audio_dir, setting d['audio'] on success.
    Clears stale MP3s first so the folder only holds today's narration. Returns the
    count synthesized."""
    audio_dir.mkdir(parents=True, exist_ok=True)
    for old in audio_dir.glob("*.mp3"):
        old.unlink()

    made = 0
    for d in items:
        text = _narration(d)
        if not text:
            continue
        path = audio_dir / f"{d['id']}.mp3"
        try:
            asyncio.run(_synth(text, path))
            d["audio"] = f"audio/{d['id']}.mp3"
            made += 1
        except Exception as exc:  # network / voice — ship without audio, never abort
            print(f"  ~ audio failed for {d['id']} ({exc}); browser TTS will be used")
            if path.exists():
                path.unlink()
    return made
