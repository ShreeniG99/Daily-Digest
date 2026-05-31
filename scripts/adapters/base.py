"""Adapter contract: every source adapter fetches Items from its slice of cfg."""
from __future__ import annotations

from abc import ABC, abstractmethod

from ..schema import Item


class SourceAdapter(ABC):
    name: str = ""   # unique cursor key, e.g. "news_rss"
    kind: str = ""   # news | youtube | paper | repo

    @abstractmethod
    def fetch(self, cfg: dict, state: dict) -> list[Item]:
        """Read this adapter's config + a state cursor and return new Items.

        `state` carries `since_ts`: only items published after it should be
        returned. The caller persists the new cursor afterwards.
        """
        raise NotImplementedError
