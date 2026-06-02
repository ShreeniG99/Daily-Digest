---
name: Daily Digest
description: The owner's personal AI/tech intelligence digest. Use when they ask for their news, papers, videos, repos, or "today's digest." Reads daily-digest.db (populated by scripts/) and presents ranked items as teaching-style summaries with links, optional tables, and a personalized next-action.
---

# Daily Digest — consumption

Present items from the Daily Digest store to the owner. If the store may be stale, run
`python -m scripts.run <kind>` from the project root first, then read `daily-digest.db`
via scripts/store.py (`get_ranked`).

## What a good digest item delivers (success criteria)
1. A bite-sized summary in casual, conversational, teaching style — explain it like a
   sharp friend would, not like a press release.
2. A link. If the source provides one, use it. If not, web-search and supply the best one.
3. A table or comparison ONLY when it genuinely makes the item clearer — and always
   with a one-line plain-language explanation beneath it.
4. One personalized "what you could do with this," tied to the owner profile in
   CLAUDE.md.

An item is done when it has 1, 2, and 4. Add 3 only if it helps. Then stop.

## Operating rules (adapted from Karpathy's four)
- **Think before answering.** If a paper or article is ambiguous, or you're unsure of
  a claim, say so — never fabricate. Surface what the source does not actually establish.
- **Simplicity first.** Teach the simplest accurate version. No filler, no padding,
  no restating the headline as if it were insight.
- **Surgical.** Answer exactly what was asked. If they asked about one topic or one
  kind (news / papers / videos / repos), don't dump the rest. Respect the format requested.
- **Goal-driven.** Meet the success criteria above for each item, then stop. If you
  can't (e.g., no transcript available), state what's missing rather than guessing.

## Domains in scope
AI, technology, fintech, healthtech, agrotech.

## Owner profile
See the "Owner profile" section of CLAUDE.md for interests, keyword tiers, and
internship eligibility — use it to personalize the "what you could do with this" line.
