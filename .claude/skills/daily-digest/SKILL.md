---
name: Daily Digest
description: The owner's personal AI/tech intelligence digest. Use when they ask for their news, papers, videos, repos, or "today's digest." Reads daily-digest.db (populated by scripts/) and presents ranked items as teaching-style summaries with links, optional tables, and a personalized next-action.
---

# Daily Digest — consumption

Present items from the Daily Digest store to the owner. If the store may be stale, run
`python -m scripts.run <kind>` from the project root first, then read `daily-digest.db`
via scripts/store.py (`get_ranked`).

## Choosing what to show

- **Default (today's digest):** call `get_ranked(status_filter='new')` — only items the
  owner hasn't read yet. After presenting each item, call `store.mark(item.id, 'read')`
  so it never repeats.
- **Re-read request** ("show me that paper again", "what did we cover on Tuesday"):
  search all statuses — do NOT mark as read again.
- **Weekly view** (asked on Sunday, or explicitly "what were the themes this week"):
  pull the last 7 days across all kinds, group by recurring keywords/themes, and write
  a 3–5 bullet trend summary instead of per-item summaries.
- **Kind-specific** ("show me papers", "any good repos?"): filter by kind, still
  respect `status='new'` unless the owner asks to revisit.

### How to mark items read (Python snippet to run via Bash tool)

```python
from scripts.store import mark
mark("<item_id>", "read")
```

Run this for every item you present before ending your turn. If you present 5 items,
run 5 `mark()` calls (batch them into one python -c invocation).

## What a good digest item delivers (success criteria)
1. A bite-sized summary in casual, conversational, teaching style — explain it like a
   sharp friend would, not like a press release.
2. A link. If the source provides one, use it. If not, web-search and supply the best one.
3. A table or comparison ONLY when it genuinely makes the item clearer — and always
   with a one-line plain-language explanation beneath it.
4. One personalized "what you could do with this," tied to the owner profile in
   CLAUDE.md.

An item is done when it has 1, 2, and 4. Add 3 only if it helps. Then stop.

## Weekly trend view format (Sunday / "themes this week")

Instead of per-item summaries, synthesize:
- 3–5 bullet themes (e.g. "Multi-agent RAG dominated papers this week")
- Top 3 items that best represent the week
- One "what to build now" recommendation based on the week's signal

## Operating rules (adapted from Karpathy's four)
- **Think before answering.** If a paper or article is ambiguous, or you're unsure of
  a claim, say so — never fabricate. Surface what the source does not actually establish.
- **Simplicity first.** Teach the simplest accurate version. No filler, no padding,
  no restating the headline as if it were insight.
- **Surgical.** Answer exactly what was asked. If they asked about one topic or one
  kind (news / papers / videos / repos), don't dump the rest. Respect the format requested.
- **Goal-driven.** Meet the success criteria above for each item, then stop. If you
  can't (e.g., no transcript available), state what's missing rather than guessing.

## Opportunities (internships, hackathons, contests, OSS issues)

When the owner asks "any opportunities?", "show me internships", "what contests are open?",
or similar — surface items with `kind="opportunity"`, status `new`, ranked by score.

### Format per opportunity
```
### <emoji> <Title> — <Company/Platform>
Role: <role> | Deadline: <deadline or "open"> | <location>
<1-sentence plain-English description of what it is and why it's relevant>
Apply: <apply_url or url>
```

Emoji guide: 🏢 internship · 🏆 hackathon/contest · 🌱 open-source issue · 🎓 research/GSoC

After presenting opportunities, mark each one `read` just like content items.

### When to trigger deep-rep
If the owner says "research this one", "tailor my resume for X", or runs
`python -m scripts.run check <id>` — hand off to the `/deep-rep` skill.
Never run deep-rep unprompted.

## Domains in scope
AI, technology, fintech, healthtech, agrotech.

## Owner profile
See the "Owner profile" section of CLAUDE.md for interests, keyword tiers, and
internship eligibility — use it to personalize the "what you could do with this" line.
