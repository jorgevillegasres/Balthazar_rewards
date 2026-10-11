# Organización de interfaz — Implementation Plan

> **For agentic workers:** Use subagent-driven-development in this session. One implementer owns the full UI change; separate spec and quality reviews follow. Publication is authorized; do not ask another design approval.

**Goal:** Apply the approved organization of the existing personal console, retaining data, AI consent and domain commands.

**Architecture:** Extract AppNavigation and an isolated navigation model from Quest; presentation changes reuse the existing authenticated store and dialogs. Dedicated Projects and Routines views reuse their existing components. Shared controls and tokens are scoped to the personal console.

**Tech Stack:** Next 16, React 19, TypeScript, existing CSS and node:test.

## 1. Complete vertical UI implementation

- [ ] Read approved spec `docs/superpowers/specs/2026-10-10-organizacion-interfaz-design.md`, AGENTS and bundled use-client guide. Baseline commit 7cddc1e.
- [ ] Write navigation model regression tests before model implementation: mobile items exactly Hoy/Misiones/Balta/Rutinas/Más; secondary destinations include all existing screens plus Projects; Projects initializes the project tab without losing detail context. Register tests in npm script.
- [ ] Create `app/components/AppNavigation.tsx` and `lib/navigation.ts`; modify Quest for desktop sidebar, five mobile controls, global Capturar/Balta, accessible More dialog, dedicated Projects and Routines destinations. Preserve focus/modal behavior and reset on owner changes.
- [ ] Refactor Today/ControlCenter/PersonalConsole so priority is shown once before secondary attention/routines; compact clock/date/energy; attention at most three and explicit link to Misiones. Keep every original action, daily progress, goal, close day and resume focus.
- [ ] Refactor Routines with a full page management mode reusing existing editor/history/packages; Hoje summary routes to page. Projects reuses Missions with initialTab Projects; add return to project grid. Misiones Todas label becomes Activas without filter changes.
- [ ] Organize Profile into Resumen/Historial/Configuración; technical activity details collapse; project selector visible during capture and Brain Dump renamed Varias tareas. Purpose links collapse; reward history collapses. Keep all command handlers, error/loading states, support/subtask relationships.
- [ ] Dialog associates title via useId/aria-labelledby. Shared tokens consolidated in source stylesheet; use existing Barlow/DM Sans/IBM Plex fonts, angular controls, consistent minimum44px touch areas, minimum12px auxiliary typography. Avoid global selector collisions and unnecessary animations.
- [ ] Run full tests and production build, inspect final diff. No fixture, private snapshots or secrets committed. Implementation on codex branch, no push until root QA and review.

## 2. Independent reviews and browser QA

- [ ] Spec reviewer inspects actual code against full approved spec; fix omissions. Quality reviewer checks navigation context, private access, responsive CSS, errors, consent and regressions; fix Important/Critical findings.
- [ ] Parent exercises real components with fictitious state and transport in a temporary local route; no production writes. Cover five-item navigation, More, Projects/task/subtask/edit/back, Rutinas, Profile tabs, contextual/global assistant entries and focus restoration. Provider/audio not actually called.
- [ ] Verify screenshots and no overflow at 360/390/768/1440; keyboard/dialog names, long titles, empty/loading states and no clipped footer. Remove fixture before final build.

## 3. Publication

- [ ] Final full production build and git diff --check pass. Commit only intended code/docs, fast-forward main and push authorized GitHub repo.
- [ ] Verify exact runtime commit live in Render and public endpoints health200/private401/origin403. Record evidence and show final screenshot clearly identified as fictitious QA.
