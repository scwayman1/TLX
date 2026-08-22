# WS7 — Demo Narrative, Validation, Decision Gate, and Storm Handoff

**Linear context:** SCO-15, SCO-16, SCO-17  
**Decision experience:** Discovery Tranche 01 — exception-to-resolution fleet coordination  
**Primary audience:** product decision owner, fleet/operations representative, technical/safety owner  
**Run time:** 5–7 minutes, plus 10–15 minutes for validation and the decision gate

## 1. What this experience is for

This is not a feature tour and not a production-readiness review. It is a short decision-making experience built around one question:

> Does a co-piloted, evidence-grounded investigation help a fleet operator move a safety-critical asset exception toward a safer, faster, more auditable decision?

The current runnable slice starts with trailer `TRL-443`, whose failed brake assembly blocks a scheduled deployment. It shows grounded internal evidence, separates facts from confidence-labeled interpretation, requires a named human to approve a synthetic vendor-availability lookup, exposes the result, and preserves an inspectable operating timeline.

The runnable slice **stops at “Prepare action plan.”** It does not reserve inventory, purchase a part, assign work, complete a repair, return the asset to service, or measure a real operational improvement. Those are decision and implementation gaps, not capabilities to imply during the demo.

## 2. Evidence basis and confidence

| Basis | What it supports | Confidence / limit |
|---|---|---|
| `docs/agent-storm/README.md` | Demo promise, synthetic-only boundary, no real device command, durable handoff expectation | Decided tranche contract |
| `docs/agent-storm/WORKSTREAMS.md` | WS7 acceptance path: setup → trigger → investigation → response → resolution → measurable outcome | Decided workstream contract |
| `docs/agent-storm/DECISION-LOG.md` | Exception-to-resolution job; synthetic data; no device command; primary outcome approved (D-008); persona selection still open | Decided direction plus open decisions |
| `docs/agent-storm/REGISTERS.md` | Risks, assumptions, dependencies, and unresolved evidence needs | Current risk register; customer value remains a hypothesis |
| `docs/PRODUCT_SCOPE.md` and `docs/ARCHITECTURE.md` | Operating loop, implemented investigation behavior, explicit production gaps, modular-monolith evolution | Repository product/technical contract |
| `docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md` | Legacy evidence for asset state, maintenance, inventory, roles, context, audit/safety needs | Observed at AcgAdmin ceiling; lower-role enforcement unproven |
| `docs/evidence/AP-ENV-PHX-redacted-safety-checkpoint.md` and `AP-ENV-KENCO-redacted-safety-checkpoint.md` | Why live/customer-derived environments remain out of bounds | Read-only, redacted safety checkpoints |
| `docs/evidence/GemOne-public-product-technical-market-assessment.md` | Competitive relevance of telemetry-to-action and explicit command/API/freshness contracts | Public-source assessment; private capability and customer outcomes unknown |
| `docs/agent-storm/outputs/WS1-product-jtbd.md` | Narrows the honest job to exception-to-safe-plan, proposes time-to-approved-safe-plan, participant criteria, and evidence thresholds | Recommendation approved by product owner (D-008); no customer evidence yet |
| `docs/agent-storm/outputs/WS3-domain-data-audit.md` | Confirms current in-memory guards and identifies reservation, return-to-service, tenant, audit, and effective-time contract gaps | Safe-boundary analysis; future contracts are proposals, not implemented behavior |
| `docs/agent-storm/outputs/WS4-frontend-vertical-slice.md` | Proposes a TDD decision-plan/work-order/simulation-only reservation tracer and explicit reset | Reconnaissance brief only; no proposed behavior is present in the current product |
| `src/App.tsx`, `src/domain/investigation.ts`, and tests | Exact runnable path, copy, state transitions, synthetic lookup output, and reset behavior | Directly inspected and executed in the current repository |

**Current evidence judgment:** the interaction is strong enough to test comprehension, trust, decision usefulness, and workflow fit. WS1 recommended **time from first actionable signal to an approved safe response plan** as the primary software-influenceable outcome, and the product owner has approved it (DECISION-LOG D-008). No baseline exists yet; establishing one is part of validation. The evidence is **not** strong enough to claim customer value, saved time, reduced downtime, role correctness, integration readiness, or production safety.

## 3. Run card

### Start

From the repository root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use a desktop viewport at normal zoom for the primary rehearsal. Keep this document open separately.

### Known-good initial state

Before inviting the audience, confirm all five conditions:

- Mission control heading is visible.
- The banner reads: `Synthetic demonstration data · Actions are simulated · No production systems connected`.
- The priority queue shows `TRL-443 · Phoenix Yard` and `Brake failure is blocking field deployment`.
- `Investigate with agent` is available.
- No investigation or tool-result state from a prior run is visible.

### Critical click path

1. Mission control → `Investigate with agent`.
2. Review facts, interpretations, recommendation, grounding rail, and operating memory.
3. Review proposed `Preferred vendor availability` lookup.
4. Click `Approve lookup`.
5. Click `Run approved tool`.
6. Review `Visible tool result` and `Ready for decision`.
7. Click `Prepare action plan` only if useful to show the explicit stop boundary; the resulting toast is a simulated preview and creates nothing.

## 4. Five-to-seven-minute demo narrative

Use the script as a decision story. Do not browse unrelated modules unless answering a question after the gate.

| Time | Beat and operator action | Suggested narration | Audience takeaway | Truth label |
|---:|---|---|---|---|
| 0:00–0:40 | **Setup.** Stay on Mission control and point to the persistent synthetic banner. | “You are the fleet leader responsible for tomorrow’s deployment. TelemetryX has prioritized only work needing a person. Everything here is synthetic; no production systems or device commands are connected.” | The experience is bounded, decision-led, and safe to inspect. | **Implemented demo behavior.** Synthetic fixtures only. |
| 0:40–1:20 | **Trigger.** Focus on the `TRL-443` safety-critical card, decision owner, due time, and active work order. Do not click other KPIs. | “A failed left brake assembly has taken TRL-443 out of service and threatens tomorrow’s mobilization. Dana Foster is visibly accountable for the decision.” | The signal is converted into a prioritized operating exception with an owner and operational consequence. | **Implemented presentation.** Priority, owner, deadline, and schedule consequence are fixture data—not live calculations or enforced assignments. |
| 1:20–2:45 | **Investigation.** Click `Investigate with agent`. Walk left-to-right through the operating question, facts, confidence-labeled interpretations, recommendation, four grounding cards, and timeline. | “The investigation begins with an operating question, not a chat prompt. Facts remain distinct from interpretation. Each evidence item shows source and observation time. The recommendation identifies the next uncertainty: external availability.” | The operator can inspect why the recommendation exists rather than accept a black-box answer. | **Implemented state and UI.** Evidence is deterministic fixture data; no source system retrieval, freshness validation, conflict handling, or durable audit store exists. |
| 2:45–3:40 | **Response boundary.** Read the proposed tool’s purpose and input. Pause before approval. Click `Approve lookup`. | “The agent can propose external enrichment, but it cannot run it. A person reviews the purpose and shared input and explicitly approves. The approval is actor-attributed in the operating memory.” | Consequential or externally connected actions should be gated by explicit human intent and inspectable scope. | **Implemented in-memory state machine.** Approval is not authenticated, authorized, policy-enforced, signed, or durable. Actor `user-scott` is synthetic. |
| 3:40–4:25 | **Visible result.** Click `Run approved tool`. Point to the completed status and synthetic adapter result. | “Only after approval does the synthetic adapter return one available assembly, delivery tomorrow at 10:30 AM, quoted at $1,840. The result is visible rather than silently folded into a recommendation.” | The user sees what ran, what came back, and who approved it before deciding what to do. | **Implemented simulation.** No vendor was contacted; availability, delivery, and price are hard-coded. No reservation, quote validity, procurement, reconciliation, retry, or failure behavior exists. |
| 4:25–5:25 | **Resolution boundary.** Point to `Ready for decision`; optionally click `Prepare action plan` and read the toast. | “TelemetryX has reduced the uncertainty enough to prepare options, but it has not purchased, assigned, repaired, or returned anything to service. The next product slice must make expedite-versus-reschedule explicit, name the decider, capture rationale, and link the approved plan to work order and inventory state.” | The demo reaches a **decision-ready** state, not operational resolution. The missing step is visible and testable. | **Implemented stop boundary.** The action-plan button only previews a toast; it creates no record. |
| 5:25–6:20 | **Measurable outcome and ask.** Return verbally to the original question; do not claim improvement. | “Today we can measure whether a participant identifies the risk, evidence, uncertainty, owner, and safe next step without coaching. We cannot yet claim reduced downtime or faster resolution. We are asking whether to validate this workflow with representative operators and build only the decision-plan bridge needed for that test.” | Success is a learning decision with observable criteria, not an invented ROI claim. | **Proposed validation gate.** Baselines and primary business outcome remain open. |
| 6:20–7:00 | **Close.** Show the grounding/timeline once more and ask the gate question. | “Would you advance this as the right job and interaction to test, revise it around a different owner/outcome, or stop because the workflow is not valuable enough?” | The audience makes a specific next-investment decision. | **Decision request.** Product owner decides; technical/safety owner can veto unsafe scope. |

### Short close (if time is cut to five minutes)

Skip the optional `Prepare action plan` click and say:

> “The verified demo ends at decision-ready. The next investment is not more dashboard breadth; it is representative validation plus a bounded, auditable bridge from approved option to work order/inventory plan.”

## 5. Simulated versus production-ready behavior

### Runnable today (synthetic demonstration)

- Persistent synthetic/no-production banner.
- Deterministic mission-control exception and named decision owner.
- Asset-risk investigation with sourced, timestamped fixture evidence.
- Explicit fact versus interpretation presentation with confidence/rationale.
- Proposed external tool request with purpose and input summary.
- Approval/rejection state transitions and actor-attributed in-memory timeline.
- Prevention of tool execution before approval in the domain state machine.
- Visible, hard-coded synthetic vendor result after approval.
- Browser reload/reset to the initial deterministic path.
- Pure domain rules and tests for audited work-order transitions and idempotent inventory issuance, although those rules are not wired into this demo path.

### Not production-ready and not to be implied

- No production identity, SSO, MFA, tenant isolation, server-side RBAC, or row-level authorization.
- No role/context enforcement proof for fleet manager, site supervisor, or maintenance coordinator; AcgAdmin observations do not establish lower-role behavior.
- No live telemetry, inspections, dispatch, parts ledger, vendor, procurement, document, or AssetPro integration.
- No authoritative freshness, stale/partial/conflict/error semantics, lineage reconciliation, or metric formulas.
- No durable database, transaction boundary, signed/immutable audit, retention, backup, or restore.
- No vendor lookup contract, authentication, privacy review, idempotency, timeout, retry, cancellation, quote expiry, or reconciliation.
- No actual inventory reservation for `BA-14TL`; the UI correctly says internal stock is unavailable and an external quote is pending.
- No purchase, work assignment, maintenance completion, verification evidence, or return-to-service transition in the runnable path.
- No real measured reduction in time-to-triage, time-to-owner, time-to-safe-plan, downtime, handoffs, or evidence loss.
- No complete accessibility, browser, load, security, threat-model, penetration, observability, or deployment-readiness evidence.
- No real device command; none should be added or implied without a separately approved safety envelope.

## 6. Rehearsal, reset, and fallback checklist

### Rehearsal checklist — complete before every audience session

- [ ] Pull/checkout the intended revision and record the commit SHA in session notes.
- [ ] Confirm no customer data, credentials, live targets, or identifying screenshots are present.
- [ ] Run `npm run lint` and record pass/fail.
- [ ] Run `npm test -- --run` and record pass/fail plus test count.
- [ ] Run `npm run build` and record pass/fail.
- [ ] Start `npm run dev`; record the local URL.
- [ ] Verify the known-good initial state in Section 3.
- [ ] Rehearse the critical path twice: once approval/completion, once rejection.
- [ ] Confirm the approved path shows `Approved by Scott`, then `Visible tool result`, then `Ready for decision`.
- [ ] Confirm the rejection path states no tool activity occurred and still reaches `Ready for decision`.
- [ ] Confirm `Run approved tool` is unavailable before approval.
- [ ] Confirm `Prepare action plan` only shows a simulated-preview toast and creates no record.
- [ ] Reload the page and confirm prior investigation/tool state is gone.
- [ ] Time the script; target 6:00 with a 60-second buffer.
- [ ] Assign roles: narrator/clicker, note-taker, product decider, and technical/safety veto owner.
- [ ] Prepare the static fallback below and keep this document available offline.

### Deterministic reset

**Preferred reset:** browser reload (`Ctrl+R`) or reopen the local root URL. Current state is component-local and returns to Mission control on reload.

After reset, verify:

- [ ] `Mission control` is visible.
- [ ] `Investigate with agent` is visible.
- [ ] `Visible tool result` is absent.
- [ ] Synthetic banner is visible.

If reset fails, stop the dev server, run `npm run dev` again, and reopen the printed URL. Do not improvise fixture changes during an audience session.

### Fallback ladder

1. **Click-path problem, application still visible:** narrate from the current screen and use this document’s exact copy; do not wander to unrelated modules.
2. **Critical interaction failure:** reload once. If it fails again, stop retrying and use the static fallback sequence: Mission-control exception → grounded facts/inferences → proposed approval → synthetic result → explicit decision-ready boundary.
3. **Local server failure:** use the last verified `dist/` only if its build identity matches the rehearsed revision; otherwise use screenshots captured from synthetic data during rehearsal.
4. **Visual/screen-sharing failure:** read the six narrative beats and ask the validation prompts; label this a narrative test, not usability evidence.
5. **Unexpected production/customer data, login wall, credential prompt, external-send control, or device-command surface:** stop immediately. Do not click, capture, or continue. Record the safety stop and revert to the synthetic fallback.

**Evidence downgrade rule:** any fallback that removes participant interaction must be labeled accordingly. A narrated/static walkthrough can test comprehension and desirability reactions, but it cannot support usability or task-completion claims.

## 7. Validation plan and prompts

### Participant and session rule

Recruit the person who actually owns or coordinates ambiguous fleet exceptions. Until evidence resolves OD-001/Q-001, record the participant’s real role and workflow rather than forcing the label “fleet manager.” Do not combine executives and operators into one undifferentiated result.

For each session, record:

- Participant role, context, relevant decision authority, and approximate job frequency.
- Current tools/handoffs and a recent real example, with confidential details excluded.
- Whether the participant completed each comprehension task without coaching.
- Exact quotes or close paraphrases, marked as observed session evidence.
- Severity and owner for every blocker.
- Which outcome measure the participant considers meaningful and how it is baselined today.

### Pre-demo discovery prompts

1. “Tell me about the last time an asset exception threatened a job or shift. What happened from first signal to safe resolution?”
2. “Who owned the decision at each handoff, and where did context get lost?”
3. “Which evidence did you trust, which did you verify, and how did freshness matter?”
4. “What action required approval? Who could approve it, and what record had to remain?”
5. “What was the cost of delay or a wrong decision—in time, availability, safety, or rework?”
6. “Which single elapsed-time or quality measure would tell you this workflow improved?”

### In-demo task prompts (avoid leading the participant)

1. **Trigger:** “What needs attention first, and why?”
2. **Grounding:** “Which statements are facts? Which are interpretations? What would you challenge?”
3. **Trust:** “What source or freshness detail is missing before you would rely on this?”
4. **Approval:** “What do you believe will happen if you approve this lookup? What information leaves the system?”
5. **Result:** “What changed after the lookup? What still has not happened?”
6. **Decision:** “What options would you expect here, who decides, and what rationale/evidence must be recorded?”
7. **Resolution:** “What proof would you require before marking the asset safe to return to service?”

### Post-demo validation prompts

1. “Where did the experience reduce effort or uncertainty, if anywhere?”
2. “Where did it create false confidence or hide operational nuance?”
3. “Would you use this for a real exception? What blocks you?”
4. “Which step belongs to another role or system?”
5. “What should happen when telemetry is stale, partial, conflicting, or unavailable?”
6. “Was the human-approval boundary too early, too late, or incomplete?”
7. “What should be reversible, and how would you recover from a failed or duplicated action?”
8. “Which next slice is necessary for a fair test: explicit decision options, work-order linkage, inventory reservation, return-to-service verification, or something else?”
9. “If we built nothing else, what evidence would make you say stop?”

### Session scorecard

Do not average away role differences. Report counts and quotes by participant role.

| Criterion | Pass signal | Failure signal |
|---|---|---|
| Job recognition | Participant maps the scenario to a frequent, consequential workflow and supplies a real analogue | “This is not my job,” rare edge case, or dashboard-only interest |
| Priority comprehension | Identifies brake safety, unavailable part, deployment risk, and decision owner without coaching | Misreads health/priority or cannot identify ownership |
| Evidence comprehension | Distinguishes facts from interpretations and identifies at least one evidence/freshness question | Treats all agent text as fact or cannot inspect provenance |
| Approval comprehension | Predicts that only a scoped lookup will run and identifies shared input | Believes approval purchases, assigns, contacts a vendor, or issues a device command |
| Boundary comprehension | States that no part is reserved/purchased and no repair/return-to-service occurred | Believes the workflow completed operational work |
| Decision usefulness | Can name the decision options, decider, and missing information | “Ready for decision” feels premature or unactionable |
| Outcome relevance | Names a measurable baseline/outcome worth improving | Only subjective “looks good” feedback |
| Adoption barrier | Barriers are specific and testable | Generic preference with no workflow evidence |

## 8. Executive decision gate

### Decision requested

Choose exactly one after reviewing representative session evidence:

- **ADVANCE:** validate/build the smallest decision-plan bridge for this job.
- **REVISE:** retain the learning but change the target owner, trigger, outcome, or interaction before further implementation.
- **STOP:** do not invest in this workflow because job value, trust, safety, or adoption evidence is inadequate.

### Minimum evidence threshold

**ADVANCE** only when all conditions hold:

1. Complete 3–5 representative sessions across at least two organizations or operating contexts; at least two participants must directly own or coordinate the exception workflow and provide a concrete recent example with artifacts or a detailed reconstruction.
2. At least two direct workflow owners recognize the job as recurring or sufficiently high-consequence to merit active management; feature preference alone does not count.
3. At least 80% of participants correctly distinguish facts from interpretations, explain what approval does, and state that no reservation/purchase/repair occurred. For fewer than five completed sessions, report the numerator/denominator and require no critical misconception from a direct workflow owner.
4. The product owner explicitly approves or amends **time from first actionable exception signal to an approved safe response plan** as the primary outcome and records a baseline method. Prefer observed reconstruction of 3–5 recent exceptions; label scenario-based or self-reported baselines as weaker evidence.
5. No unresolved critical safety, authorization, privacy, or misleading-claim finding exists in the proposed next slice.
6. The next slice is bounded to decision-plan continuity; it does not add live integrations or device commands merely to make the demo appear complete.

Choose **REVISE** when the job is valuable but ownership, terminology, trigger, evidence model, approval point, or outcome measure is wrong or ambiguous.

Choose **STOP** when direct workflow owners do not recognize meaningful frequency/consequence, cannot reach a trustworthy decision without a fundamentally different workflow, or the required safety/integration scope is disproportionate to the learning value.

### Required decision record

Record in the decision log and SCO-17:

- Decision: ADVANCE / REVISE / STOP.
- Decider and date.
- Participants by role (no sensitive details).
- Evidence reviewed and confidence.
- Selected primary outcome and baseline method.
- Misconceptions/blockers and severity.
- Approved next slice and explicit exclusions.
- Reconsideration trigger.

## 9. Current WS7 verification record

This WS7 pass ran the current repository without modifying product code.

| Check | Actual result |
|---|---|
| `npm run lint` | Passed, exit code 0 |
| `npm test -- --run` | Passed: 4 test files, 16 tests |
| `npm run build` | Passed: TypeScript + Vite production build; 1,806 modules transformed |
| Browser critical path | Verified proposed state blocks execution; approval exposes run; run exposes visible synthetic result and `Ready for decision` |
| Browser reset | Verified root reload returns to Mission control and removes prior visible tool result |

**Limit:** this is a deterministic technical rehearsal, not customer/operator validation. No audience feedback exists in the inspected storm outputs, and none is fabricated here.

## 10. Findings for the next storm

### What is coherent now

- One safety-critical exception advances every click in the primary path.
- Synthetic status is persistent and the external adapter labels itself synthetic.
- Facts, interpretations, recommendation, approval, result, and operating memory are legible in one workspace.
- The domain rule prevents tool execution before approval.
- Reload provides a reliable demo reset.

### Material narrative/product gaps

1. **“Exception-to-resolution” currently overstates the runnable endpoint.** The UI reaches decision-ready, not resolution or verified return-to-service.
2. **Inventory promise is not fulfilled on this path.** No `BA-14TL` stock exists internally, and the external result is a quote/availability simulation—not a reservation.
3. **The decision itself is missing.** Expedite versus reschedule options, trade-offs, accountable decider, rationale, and approval record are narrative only.
4. **Outcome remains unselected and unbaselined.** OD-002/Q-002 block any improvement claim.
5. **Persona/role remains unverified.** OD-001/Q-001 and the AcgAdmin evidence ceiling prevent role-fit or authorization claims.
6. **Failure-state evidence is thin.** Rejection exists, but stale/partial/conflicting/unavailable evidence and vendor timeout/error/retry are not runnable.
7. **Audit is inspectable but ephemeral.** The timeline is actor-labeled in memory, not authenticated, durable, signed, or policy-enforced.
8. **The proposed reservation language is unresolved.** WS4 proposes a `simulation-only` workspace reservation against one quote, while WS3 warns that supplier hold, internal stock reservation, and part issue are distinct contracts. Do not narrate or implement “reserved” until product/domain owners approve its exact meaning and mandatory no-supplier/no-purchase disclosure.

### Recommended smallest next slice if the gate says ADVANCE

Add a synthetic, audited **decision-plan** state—not a production integration. This is narrower than automatically adopting WS4’s proposed reservation tracer and is consistent with WS1’s safe-plan framing. If validation proves a reservation concept is necessary, reconcile WS3/WS4 semantics in the decision log before coding:

- Present two explicit options: expedite quoted part versus reschedule deployment.
- Show operational trade-offs, evidence, confidence, expiry/freshness, and required approver.
- Record selected option, rationale, actor, time, and linked work-order intent.
- If “expedite” is selected, label the result `reservation/purchase not executed` unless a separately specified synthetic reservation state is deliberately added.
- Define acceptance around participant comprehension and decision completeness, not dashboard breadth.
- Keep device commands, live vendors, procurement sends, and customer data out of scope.

## 11. Final storm handoff checklist

### Product truth and validation

- [ ] Link this artifact from SCO-15, SCO-16, and SCO-17.
- [ ] Resolve or carry forward OD-001 (target persona) with evidence.
- [ ] Resolve or carry forward OD-002 (primary outcome) with baseline method.
- [ ] Attach session notes/scorecards; do not replace them with a summary alone.
- [ ] Separate observed behavior, participant report, interpretation, hypothesis, and decision.
- [ ] Record ADVANCE / REVISE / STOP with decider and reconsideration trigger.

### Workflow and design

- [ ] Preserve the six-beat demo path and one-job focus.
- [ ] Keep the persistent synthetic/no-production boundary.
- [ ] Test approval, rejection, result, and reset paths.
- [ ] Specify stale, partial, conflicting, unavailable, permission, and failure states before implementation.
- [ ] Verify keyboard, screen reader, zoom, responsive width, focus, contrast, and reduced motion for the chosen slice.

### Domain, data, and integration

- [ ] Define the decision-plan entity/event contract and ownership.
- [ ] Define asset, investigation, work-order, inventory, actor, tenant/context, evidence, and audit identities across the tracer.
- [ ] Preserve effective time, source, freshness, actor, before/after, and idempotency requirements.
- [ ] Keep proposed APIs/events labeled as proposed until implemented and verified.
- [ ] Do not infer lower-role enforcement from AcgAdmin navigation evidence.
- [ ] Do not use PHX or Kenco beyond their read-only safety checkpoint without new authorization.
- [ ] Do not add real vendor, procurement, report-send, or device-command behavior without a separately approved envelope.

### Quality and release evidence

- [ ] Record exact commit/build identity used for every demo or validation session.
- [ ] Preserve actual lint/test/build outputs with the handoff.
- [ ] Require RED-GREEN-REFACTOR for new product behavior.
- [ ] Add regression coverage for every new decision state and safety boundary.
- [ ] Verify deterministic reset and a static fallback before the next audience session.
- [ ] Scan for secrets/live targets and confirm synthetic fixtures only.

### Reconciliation and ownership

- [ ] Reconcile product truth → workflow → domain → implementation → quality → demo decision in that order.
- [ ] Write conflicts into `docs/agent-storm/DECISION-LOG.md`; do not silently average recommendations.
- [ ] Update `REGISTERS.md` with changed risks, assumptions, dependencies, and open questions.
- [ ] Name the next slice owner, product decider, technical/safety veto owner, and validation note-taker.
- [ ] Preserve explicit production gaps in every demo brief and executive summary.
- [ ] Ensure the next team can run the experience from repository instructions without chat history.

## 12. Exact handoff

The next storm should begin by running this script unchanged, collecting representative validation evidence, and making the ADVANCE / REVISE / STOP decision. If ADVANCE, implement only the synthetic decision-plan bridge described above under an explicit workflow/domain contract and test-first quality gate. Do not broaden the product, imply inventory reservation, or connect production systems to make the story feel more complete.
