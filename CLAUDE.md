# CLAUDE.md — Daily Digest

## Operating rules (follow every session)
Adapted from Karpathy's four CLAUDE.md principles.

1. **Think before coding.** State assumptions explicitly. If a request is ambiguous,
   present the interpretations and ask — do not guess. Push back when a simpler
   approach exists. Name what's unclear instead of coding through it.
2. **Simplicity first.** Build only what's asked. No abstractions for single-use
   code, no config nobody requested, no speculative error handling. If 200 lines
   could be 50, write 50.
3. **Surgical changes.** Touch only what the task requires. Match existing style.
   Mention unrelated issues; don't fix them unasked. Every changed line must trace
   to the task.
4. **Goal-driven execution.** Before multi-step work, state a brief plan with
   verification steps. Treat "Definition of done" below as the success criteria and
   loop until met. After each step, report what's verified vs. remaining. Surface
   uncertainty instead of declaring success.

## What this is
A personal, single-user pipeline that ingests AI/tech news, YouTube videos, research
papers, and GitHub repos, ranks them against the owner's interests, and stores them
for interactive, teaching-style consumption. Opportunities come in Phase 2.

## Architecture decision — do not violate
- **Ingestion = this app.** Deterministic Python: fetch, normalize, dedup, rank,
  store. No LLM calls in Phase 1.
- **Consumption = Claude, driven by SKILL.md.** Summaries, teaching, insights, and
  (Phase 2) deep-research are done by Claude reading the store — never hardcoded.
- Rule of thumb: deterministic & repeatable -> app; needs context/taste/conversation
  -> Claude.

## Build scope — PHASE 1 ONLY
Build exactly the four adapters below and the shared spine. Do not build anything in
the "Phase 2" section.

## Stack & conventions
- Python 3.11+, one venv. Deps: feedparser, requests, pyyaml, python-dotenv.
- SQLite (stdlib sqlite3), DB at root: signal.db.
- Secrets in .env (python-dotenv). Never commit signal.db or .env (.gitignore them).
- ALL sources live in config/sources.yaml — user-editable. Code reads config; never
  hardcode feeds, channels, or domains.

## Folder layout
```
daily-digest/
  CLAUDE.md
  .claude/skills/signal/SKILL.md
  .env  .gitignore
  config/sources.yaml
  scripts/
    __init__.py  schema.py  store.py  rank.py  run.py
    adapters/
      __init__.py  base.py  news_rss.py  youtube.py  papers.py  github_repos.py
  daily-digest.db
```

## Data model — scripts/schema.py
```python
@dataclass
class Item:
    id: str = ""          # sha1(normalized_url)[:16]; set in __post_init__
    kind: str = ""        # news | youtube | paper | repo
    source: str = ""
    title: str = ""
    url: str = ""
    author: str = ""
    published_ts: float = 0.0
    fetched_ts: float = 0.0
    raw_text: str = ""    # abstract / transcript / description -> what Claude summarizes
    summary: str = ""     # empty in Phase 1; Claude fills on read
    tags: list[str] = field(default_factory=list)
    domain: str = ""      # ai | fintech | healthtech | agrotech | tech
    score: float = 0.0
    status: str = "new"   # new | read | saved
    extra: dict = field(default_factory=dict)
```

## Adapter contract — scripts/adapters/base.py
Abstract `SourceAdapter` with attrs `name`, `kind` and method
`fetch(self, cfg: dict, state: dict) -> list[Item]`. Each adapter reads its slice of
cfg and a `state` cursor (last published_ts seen) and returns only newer items.

## Storage — scripts/store.py
SQLite. Tables: items, fetch_state, actions.
Ops: init_db(), upsert_item(item) [INSERT OR IGNORE on id = exact dedup],
get_ranked(kind=None, limit=30), mark(id, status), get_cursor(source)/set_cursor(source, ts).

## Ranking — scripts/rank.py
score = 3*tier1_hits + 1*tier2_hits - 2*tier3_hits + recency + source_priority
- keyword hits: lowercase scan of tiered keyword sets over title+raw_text.
- recency: exp(-age_days / 7).
- top-K via heapq.nlargest.
Keep it this simple. Fuzzy dedup / clustering / embeddings are Phase 2 — do not add.

## Adapters (build in this order)
1. news_rss — feedparser over config feeds + Hacker News Algolia API
   (http://hn.algolia.com/api/v1/search_by_date?query=...&tags=story).
2. youtube — YouTube Data API v3 (search.list for keywords; channels.list ->
   uploads playlist -> playlistItems for configured channels). Transcripts via
   youtube-transcript-api into raw_text. Needs YOUTUBE_API_KEY in .env.
3. papers — arXiv API + OpenAlex + Semantic Scholar + Europe PMC. Title, abstract
   (->raw_text), authors, venue, link. Dedup across sources by DOI / normalized title.
   Domains: ai, fintech, healthtech, agrotech, tech.
4. github_repos — GitHub Search API (q=stars:>N topic:... pushed:>DATE, sort=stars).
   Optional GITHUB_TOKEN in .env raises rate limit.

## CLI — scripts/run.py
`python -m scripts.run all|news|youtube|papers|github [--since DAYS]`
Runs adapter(s), upserts, prints a ranked summary table.

## Definition of done (success criteria — loop until met)
1. Scaffold + schema + store: init_db creates tables; upsert dedups on rerun.
2. news_rss: `python -m scripts.run news` writes items and prints a ranked table;
   rerun adds zero duplicates. STOP and show this before building the rest.
3. youtube, papers, github_repos: each runs without error, dedups, items appear ranked.
4. sources.yaml fully drives sources (nothing hardcoded).
5. SKILL.md exists and consumption works in Claude Code.

## Owner profile (ranking signal)
- Rising 3rd-year B.Tech AI & Data Science, India. Intern eligibility: India only,
  no visa. Target roles: SDE / SWE / AIML / R&D.
- Tier-1: RAG, LLM, transformers, GenAI, SLM, VLM, SaaS, FastAPI, React, Kafka,
  Docker, Kubernetes, Terraform, LangChain, LangGraph, full-stack.
- Tier-2: general AI, ML, software engineering.
- Tier-3 (down-rank): crypto/web3 hype, no-code-only, AI-marketing fluff.

## Phase 2 — DO NOT BUILD YET
opportunities adapter (Internshala, Devpost, MLH, Kaggle, Devfolio, Unstop,
Codeforces, Codess.cafe, Y Combinator, GSoC orgs, company pages via ScrapeGraphAI);
oss_issues adapter; checklist -> deep-rep flow; optional Gemini enrichment; fuzzy
dedup / FAISS rerank; recall/flashcard layer.
