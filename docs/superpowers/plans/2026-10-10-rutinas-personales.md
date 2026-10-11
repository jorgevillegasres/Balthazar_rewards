# Rutinas personales — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Execute in this session with independent specification and code reviews, without asking for another implementation approval.

**Goal:** Publish lightweight weekly routines, a finite observation exercise and a selectable rewards catalog while preserving existing data and economy.

**Architecture:** Optional collections in the private JSON state; domain commands validated before authenticated CAS persistence. Pure calendar selectors produce today/week views without task generation. UI installation previews invoke bounded atomic commands, never background jobs.

**Tech Stack:** Next 16, React 19, TypeScript, Zod, existing Supabase state repository, node:test.

## Task 1 — Implement and test the complete vertical feature

Files: create `lib/routines.ts`, `lib/personal-catalog.ts`, `app/components/Routines.tsx`, `tests/routines.test.mjs`. Modify `app/lib/domain.ts`, `lib/backup.ts`, `lib/state-repository.ts`, `lib/assistant.ts`, `lib/voice.ts`, `app/components/Quest.tsx`, `app/components/Rewards.tsx`, `app/globals.css` (or actual existing stylesheet), `package.json`, `README.md`.

- [x] Write domain tests first using the public `apply`, `fresh` and date selectors. Run `node --experimental-strip-types --test tests/routines.test.mjs` and observe failing assertions before implementing commands.
- [x] Implement optional `routines`, `routineEntries`, and installed package markers. Routine shape: id, title, description, area, projectId, weekdays (JS weekday 0..6), startDate, endDate optional, minutes, briefMinutes, status active/paused. Entry shape: routineId, date, status completed/skipped, mode normal/brief, title, minutes, at. Strict dates, max 100 routines, nonempty distinct days, 1..120 minutes, brief <= normal, valid existing references, unique routine-date. Retain 366 dates including today using local-calendar arithmetic.
- [x] Add commands `routine`, `routineStatus`, `routineEntry`, `routinePack`, `rewardPack`. Entries may be changed/cleared only for local today; require scheduled active routine for creation. Clear an existing entry even after pausing/editing. Packages use server-defined templates and selected keys, reject duplicates/invalid keys, install selected templates once per persistent marker. No points or XP changes, tasks untouched.
- [x] Test calendar boundaries/timezone, finite end date, pause, omission/no carryover, correction, duplicate command retries, invalid dates/references/limits, snapshot preservation and unmodified economy. Add tests for atomic package selection and duplicate rewards.
- [x] Extend backup schema/relationships with legacy defaults and empty-restore guard. Test old/new backups and malformed collections. Ensure area rename propagates routines and missing old collections remain harmless.
- [x] Implement daily card and manager in `Routines.tsx` using existing Act and design tokens. Today exposes daily actions and Manage routines; manager has create/edit/status, weekly totals, last 366-day entries with pagination, package previews with selectable actions. Description shows neutral prompts; no personal reflection input. Explain separate constancy/no XP and history retention.
- [x] Add rewards preview selection to `Rewards.tsx` with atomic `rewardPack`, preserving old names. Catalog costs: coffee150, gaming250, anime400, restaurant800, book1200, creative600, massage1800, daytrip3000, workspace5000, weekend8000. Match names from prior proposal and avoid gating everyday rest as a reward.
- [x] Bound today's routine context to at most20 records for day assistance and voice, excluding private reflection content, identity and economy. Explicit instructions: recommendations only, no routine mutations through AI tools and no moral judgments/diagnoses.
- [x] Register tests in npm test, update README. Run test suite and TypeScript; report exact results and commit only intended files.

## Task 2 — Independent review, integration QA and publish

- [x] Specification reviewer verifies the approved spec and additional packages; implementer fixes missing behavior. Then separate quality reviewer verifies correctness, validation, CAS/backup and UI interactions.
- [x] Run production build: `node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run build`; expect all tests and build exit0.
- [x] Use a temporary local QA fixture with fake authenticated state/transport and real components to exercise package selection, completion/brief/skip/correction and weekly totals on mobile and desktop. Remove fixture before final build. Do not modify user data for QA.
- [x] Commit verified app changes, fast-forward main and push existing GitHub remote (publication already authorized). Verify Render live commit via MCP and public health/authentication endpoints. No secrets retrieved or printed.
- [x] Mark plan completion with exact evidence and tell user how to install optional packages in their session. Real voice/provider tests remain outside simulated QA.
