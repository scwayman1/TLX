# Agent Storm Workstreams

## WS1 — Product, jobs, and customer evidence

**Linear:** SCO-14, SCO-16  
**Mission:** prove that the selected workflow represents a valuable fleet-management job rather than legacy feature mimicry.  
**Inputs:** product scope, AssetPro/GemOne evidence, current demo, interview access if available.  
**Outputs:** `docs/discovery/TRANCHE-01-BRIEF.md`, interview/test guide, evidence synthesis, opportunity scorecard.  
**Acceptance:** target user, job, frequency, current cost/risk, desired outcome, baseline, adoption barriers, success metric, evidence threshold, and decision owner are explicit. No customer evidence is fabricated.  
**Escalate:** no target user, no participant access, conflicting definitions of success, or demo promise unsupported by evidence.

## WS2 — UX, workflow, and design system

**Linear:** SCO-19, SCO-15, SCO-21  
**Mission:** turn the exception-to-resolution job into a coherent, legible, accessible, executive-quality interaction.  
**Inputs:** App surfaces, evidence workflows, design tokens/CSS, product brief.  
**Outputs:** workflow map, state contract, prioritized UX changes, responsive/accessibility review, demo storyboard.  
**Acceptance:** primary path is clickable; loading/empty/error/stale/partial/permission/success states are explicit where material; synthetic status is visible; keyboard, reduced-motion, focus, contrast, and responsive behavior are verified.  
**Escalate:** decorative work without workflow value, unverifiable claims, hidden consequential actions, or material accessibility failures.

## WS3 — Domain, data, and audit contracts

**Linear:** SCO-18, SCO-20; related SCO-6 through SCO-13  
**Mission:** define stable entities, state transitions, invariants, provenance, context, and audit behavior behind the demo.  
**Inputs:** domain state machines, architecture, AssetPro contracts, GemOne technical evidence.  
**Outputs:** entity/event map, contract notes, decision records, readiness assessment.  
**Acceptance:** assets, investigations, work orders, inventory reservations, actors, tenant/context, evidence, and audit events have explicit identity and lifecycle rules; assumptions and unverified enforcement are labeled.  
**Escalate:** ambiguous ownership, missing tenant boundary, unsafe transition, invented API/data semantics, or production readiness inferred from fixtures.

## WS4 — Frontend vertical slice

**Linear:** SCO-19  
**Mission:** implement the smallest end-to-end demo behavior that proves the customer job.  
**Inputs:** WS1 brief, WS2 workflow/state contract, WS3 domain rules, existing React application.  
**Outputs:** tested interaction changes in an isolated worktree and a concise PR.  
**Acceptance:** strict RED-GREEN-REFACTOR; no dead-end controls; deterministic demo reset; all checks pass; no scope expansion beyond the vertical slice.  
**Verification:** `npm run lint`; `npm test -- --run`; `npm run build`.  
**Escalate:** unclear behavior contract, need for production credential/integration, broad refactor, or untestable design.

## WS5 — Backend and integration readiness

**Linear:** SCO-20; related SCO-7, SCO-10, SCO-11  
**Mission:** specify the application-service, persistence, job, integration, and device-command boundaries required for a safe pilot—without building premature services.  
**Inputs:** architecture, domain contracts, AssetPro/GemOne public technical evidence.  
**Outputs:** modular-monolith boundary proposal, API/event sketches clearly labeled as proposed, data lineage, integration register, production-readiness gaps.  
**Acceptance:** authorization context, idempotency, transactions, effective time, freshness, retry/reconciliation, observability, privacy, support ownership, and failure recovery are addressed.  
**Escalate:** private API assumptions, device-command execution, unsupported security claims, or a service split without evidence.

## WS6 — Test, CI, security, and accessibility

**Linear:** SCO-21  
**Mission:** make rapid iteration safe and the demo reliably reproducible.  
**Inputs:** package scripts, tests, repository history, WS2 state/accessibility contract.  
**Outputs:** quality-gap report and bounded changes for CI, regression tests, secret scanning, accessibility checks, and deterministic reset.  
**Acceptance:** actual command output is recorded; new behavior has a witnessed failing test before implementation; repository contains no secrets or live targets; gates are suitable for branch protection.  
**Escalate:** flaky tests, hidden network dependency, secret exposure, destructive seed/reset behavior, or failing build on main.

## WS7 — Demo narrative, validation, and executive decision gate

**Linear:** SCO-15, SCO-16, SCO-17  
**Mission:** convert the product into a short decision-making experience and package all learning for the next storm.  
**Inputs:** working vertical slice, all workstream outputs, risks/decisions/open questions.  
**Outputs:** `docs/demo/TRANCHE-01-DEMO.md`, rehearsal checklist, backup path, audience feedback summary, final decision brief.  
**Acceptance:** 5–7 minute narrative; setup → trigger → investigation → response → resolution → measurable outcome; every action has an audience takeaway; simulated behavior and production gaps are explicit; reset and fallback are verified.  
**Escalate:** demo is a feature tour, claims exceed evidence, critical path is unreliable, or decision requested is unclear.

## Storm integration owner

The integration owner reconciles outputs in this order: product truth → workflow contract → domain contract → implementation → quality evidence → demo decision. Conflicts are written to `DECISION-LOG.md`; they are not silently averaged into code.