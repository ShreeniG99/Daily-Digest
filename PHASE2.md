# PHASE2.md — Daily-Digest: Opportunities

Read alongside CLAUDE.md. The same operating rules (Karpathy's four) apply. Build in
the staged order below; do not jump ahead.

## Goal
Discover internships, hackathons, and contests the owner is eligible for, surface them
as a reviewable ranked list, and on request produce a deep-research report + tailored
resume for the few the owner picks.

## Architecture (unchanged from Phase 1)
Reuse the spine exactly: same Item schema, same store, same ranker.
- Discovery = app (new adapters). Adds Item.extra fields, nothing else structural.
- Deep-rep = Claude via a skill (judgment, not code — do NOT build it as a Python module).

## Item.extra for opportunities
`{ deadline: ISO-date, company: str, role: str, apply_url: str, eligible: bool }`
Reuse the existing `status` field: new | checked | done. "checked" = owner picked it
for deep-rep.

## Eligibility filter (keep only items matching ALL)
- location India or remote-India-ok
- no visa sponsorship required (drop US-onsite roles)
- role in {SDE, SWE, AIML, R&D, full-stack, intern}
- relevance score above threshold (Tier-1 keywords from CLAUDE.md)
- experience level intern/new-grad/entry only (jobs/internships only; events exempt).
  Config-driven keep/drop word lists under `opportunities.eligibility.experience`,
  plus auto-detection of numeric/roman levels (SDE-II, Engineer 2 -> drop; level I -> keep)
  and a `drop_years_gte` years-of-experience cutoff.

## Config — add an `opportunities:` block to config/sources.yaml
```yaml
opportunities:
  eligibility:
    locations: [India, Remote]
    roles: [SDE, SWE, AIML, R&D, full-stack, intern]
    exclude: [visa sponsorship, US onsite, senior, "5+ years"]
  api_sources:          # Stage 2a — no scraping, no LLM
    codeforces: true                 # https://codeforces.com/api/contest.list
    devpost: true                    # https://devpost.com/api/hackathons (unofficial JSON — verify it responds)
    kaggle: false                    # set true only after kaggle.json creds are configured
  scrape_sources:       # Stage 2b — ScrapeGraphAI SearchGraph + Gemini
    internshala: true
    unstop: true
    devfolio: true
    codesscafe: true
    mlh: true
    gsoc_orgs: true
    ycombinator: true                # Work at a Startup (login-gated; SearchGraph, not API)
    company_pages: ["Google India careers intern", "Microsoft India careers intern", "Amazon India SDE intern"]
```

## Stage 2a — API sources (BUILD FIRST: no new deps, no LLM)
New file `scripts/adapters/opportunities.py`, one function per enabled api_source, each
returning `list[Item]` with `kind="opportunity"`. Apply the eligibility filter before
returning.
- Codeforces: GET https://codeforces.com/api/contest.list — upcoming contests (phase=BEFORE).
- Devpost: GET https://devpost.com/api/hackathons?status[]=open — open hackathons (JSON).
- Kaggle (only if enabled): active competitions via the kaggle API.
**DoD 2a:** `python -m scripts.run opportunities` prints a ranked, eligibility-filtered
table; rerun adds zero duplicates. STOP and show this before starting 2b.

## Stage 2b — SearchGraph sources (needs scrapegraphai + playwright + Gemini key)
Add deps: scrapegraphai, playwright (then run `playwright install`).
LLM: Gemini free tier — `GEMINI_API_KEY` in `.env`.
For each enabled scrape_source, run a ScrapeGraphAI SearchGraph with a site-targeted
query and an extraction prompt like: "list current internships/hackathons with title,
deadline, eligibility, and apply link." Map results to Items, apply the eligibility filter.
Be polite: low concurrency, cache, respect the high-water cursor. Expect some sites to
block — log the failure and continue; never let one source crash the run.
**DoD 2b:** each enabled scrape_source returns structured, eligibility-filtered Items
without crashing the run; failures are logged, not fatal.

## Stage 2c — checklist -> deep-rep (skill, NOT Python)
1. CLI to mark picks: `python -m scripts.run check <id> [<id> ...]` sets status="checked".
2. Add `profile/resume.md` (the owner's resume) and `profile/profile.yaml`
   (eligibility + target roles + Tier-1 keywords).
   NOTE: `profile/` is gitignored (local-only) — resume.md holds PII (phone/email)
   and the repo is public. deep-rep reads these from disk, so committing isn't needed.
   `reports/` is gitignored too (tailored resumes contain PII).
3. Create `.claude/skills/deep-rep/SKILL.md` instructing Claude: for each checked
   opportunity, produce one report at `reports/<company>-<role>.md` containing:
   (a) company research — latest news, what they are building, gaps the owner could
       plausibly address; (b) a resume tailored to that role, derived from
       profile/resume.md; (c) a fit summary + application checklist.
   Skill operating rules: state assumptions about the role first; no fluff; one report
   per opportunity; the three deliverables above are the definition of done.
**DoD 2c:** marking an opportunity then invoking deep-rep yields one report with all
three parts, grounded in profile/resume.md.

## oss_issues adapter — BUILT (`python -m scripts.run oss`)
GitHub Search API for open `good first issue` / `help wanted` issues in the owner's
stack (Python + LangChain / FastAPI / RAG / ML). kind="opportunity",
extra.role="open-source", real issue URLs; reuses GITHUB_TOKEN. Config-driven under
`opportunities.oss_issues` (labels / query_terms / language / per_page). Shares the
opportunity kind but `run oss` shows only source="GitHub Issues" (adapter
display_source + get_ranked source filter).

## Do NOT build yet
Fuzzy dedup, FAISS semantic rerank, recall/flashcard layer.
