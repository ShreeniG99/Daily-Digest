---
name: deep-rep
description: The owner's deep-research + tailored-resume pass for opportunities they picked. Use when they say "deep-rep", "research my picks", "tailor my resume for the checked ones", or after they run `python -m scripts.run check <id>`. For each checked opportunity in daily-digest.db it writes one grounded report to reports/<slug>.md.
---

# deep-rep — research + tailor for the owner's picked opportunities

The owner marks opportunities with `python -m scripts.run check <id>` (status="checked").
For EACH checked opportunity, produce ONE report at `reports/<slug>.md` with the three
parts below. This is judgment work — research and writing, not a script.

## Inputs (read these first)
- Checked items: `from scripts import store; picks = store.get_by_status("checked", "opportunity")`.
  Each `Item` has `title`, `url`, `raw_text`, and `extra` (`role`, `company`, `apply_url`, `deadline`).
- The owner's real resume: `profile/resume.md` — the ONLY source of their experience.
- The owner's targets/eligibility: `profile/profile.yaml` and the Owner profile in CLAUDE.md.

## For each checked opportunity, write reports/<slug>.md
`<slug>` = lowercase, hyphenated company + short role/title (e.g. `google-cloud-rapid-agent-hackathon`).

Start the report by **stating your assumptions about the role** (what it actually is, what
success looks like, the relevant skills) — one short paragraph — then the three parts:

1. **Company / org research.** What they do, what they are building now, and recent moves
   — WEB-SEARCH for this; never fabricate. Link the sources you used. Then name 2-3 concrete
   gaps or needs the owner could plausibly address, tied to their real skills.
2. **Tailored resume.** A resume for THIS role, derived strictly from `profile/resume.md`.
   Reorder and emphasize the relevant projects/skills, rewrite bullets to speak to this
   role, and map the owner's real work to what the role needs. Invent nothing — no new
   projects, employers, numbers, or skills. If something the role wants is genuinely
   missing, say so honestly rather than inventing it.
3. **Fit summary + application checklist.** A 3-4 line honest fit read (strengths, gaps,
   how to position), then a concrete step-by-step checklist to apply (links, what to submit,
   deadline from `extra.deadline` if present, how to stand out).

When a report is finished, mark the item done: `store.mark(<id>, "done")`.

## Operating rules (Karpathy's four)
- **Think first.** State role assumptions before writing. If the opportunity is ambiguous,
  say what you're assuming. Surface what the source does not actually establish.
- **Never fabricate.** Research is grounded in web search (with links); the resume is grounded
  in `profile/resume.md`. If you can't verify something, say so — do not invent it.
- **Simplicity first.** No fluff, no padding, no generic career advice. Specific and useful.
- **Goal-driven.** One report per opportunity. The three parts above are the definition of
  done. Finish them, mark the item "done", then stop.

## Owner context
Rising B.Tech AI & Data Science student, India (India-only, no visa; intern / new-grad /
entry). Strong in RAG / LLM / LangChain / FastAPI / Python / ML. See profile/ for the rest.
