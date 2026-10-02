# Contextual assistant implementation plan

> For agentic workers: execute sequentially with executing-plans; preserve the approved design and existing domain rules.

**Goal:** Add assisted capture, mission guidance and daily orientation using OpenAI API.

**Architecture:** Authenticated server route builds a minimal context, reserves a persistent daily quota and validates structured suggestions. The UI requests explicit consent and applies reviewed proposals through revision-checked domain commands.

**Tech Stack:** Next.js, React, Zod, Supabase PostgreSQL, OpenAI Responses API via native fetch.

## Work sequence

- [ ] Write `tests/assistant.test.mjs` covering minimization, output references, partial time budgets, stale revisions and preserved progress. Run `node --experimental-strip-types --test tests/assistant.test.mjs` and observe failures.
- [ ] Create `lib/assistant.ts` with input/output schemas, bounded contexts and validation. Create `lib/openai.ts` with strict schemas, thirty-second timeout, no retries and `store: false`. Test mocked provider transport with real response parsing and refusal/error handling.
- [ ] Add PostgreSQL quota reservation with authenticated owner RLS, transaction lock, twenty calls per Bogotá day and no delete/update grants. Verify parallel reservations and outsider denial in rollback-only transactions. Save the actual migration version returned by Supabase.
- [ ] Add `app/api/assistant/route.ts`: same-origin and session checks before private data; revision check before quota; missing-key detection before quota; validated structured response with revision. Add the route to session refresh matcher.
- [ ] Extend `Act` with an optional expected revision. Add a narrowly scoped `assistSteps` command that refuses completed tasks and advanced steps. Existing capture/start commands remain authoritative.
- [ ] Create a shared consent/request hook and assistant dialog. Add guided capture, daily orientation and mission buttons. Preserve typography/palette, accessible loading/errors and mobile layouts.
- [ ] Run `npm run build`, private route probes and browser review using a development-only synthetic snapshot and mocked provider responses. No fabricated user data is inserted in production.
- [ ] Document configuration/retention/quota behavior, review diffs, merge verified branch into main, push and verify Render deployment. An actual provider query requires a configured key and owner consent; report any remaining activation requirement accurately.

## Design review

Approved design: `docs/superpowers/specs/2026-10-02-asistente-contextual-design.md`. No autonomous completion, rewards, long-term memory, voice or external integrations are included. Model default is a configurable GPT-5 Mini snapshot, subject to account availability and real-use evaluation.
