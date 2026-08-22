# Discovery Tranche 01 — Agent Storm Handoff

## Mission

Produce a fast, evidence-backed TelemetryX demo that proves one coherent fleet-management job and leaves durable product, technical, design, quality, and decision artifacts for the next team.

## Demo promise

A fleet manager can identify a high-priority asset exception, inspect grounded evidence and confidence-labeled interpretation, review ownership and operating history, explicitly approve or reject a scoped synthetic vendor-availability lookup, and reach a decision-ready safe response plan without issuing a real command or implying that inventory, repair, or return to service has occurred.

## Target user and outcome

- **Primary user:** fleet manager or operational supervisor responsible for fleet availability and safe return to service.
- **Job:** move an ambiguous asset exception from signal to an approved safe response plan without losing context, ownership, safety boundaries, or evidence.
- **Desired outcome:** reduce time and coordination loss from first actionable signal to an approved, evidence-grounded safe response plan.
- **Tranche success:** the demo is rehearsable end to end; claims trace to evidence; automated gates pass; known simulation and production gaps are explicit; a separate team can continue without hidden chat context.

## Authoritative inputs

1. `docs/PRODUCT_SCOPE.md`
2. `docs/ARCHITECTURE.md`
3. `docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md`
4. `docs/evidence/AP-ENV-PHX-redacted-safety-checkpoint.md`
5. `docs/evidence/AP-ENV-KENCO-redacted-safety-checkpoint.md`
6. `docs/evidence/GemOne-public-product-technical-market-assessment.md`
7. Linear project: [Discovery Tranche 01 — Fleet Mission Control Demo](https://linear.app/telemetry-x/project/discovery-tranche-01-fleet-mission-control-demo-4462b046f6f7)
8. Primary Linear issues: SCO-14 through SCO-21.

## Epistemic rules

- **Fact:** directly observed or corroborated; cite the evidence.
- **Interpretation:** reasoned meaning derived from facts; label it.
- **Hypothesis:** testable belief with a next evidence action.
- **Decision:** approved direction with owner, date, rationale, and reconsideration trigger.
- **Unknown:** unresolved material question; never smooth it over.

No agent may present synthetic demo behavior as production capability or infer customer demand from legacy feature presence.

## Safety and scope boundaries

- Synthetic/demo data only.
- No credentials or customer data in source, logs, screenshots, fixtures, or issues.
- No production integrations, private infrastructure scans, or authentication changes.
- No real device commands, scheduled report sends, billing actions, or external communications.
- PHX and Kenco are **STOP-REQUIRED**. Their sessions were closed after the bounded safety checkpoint; no agent may authenticate, browse, capture, or inspect them again unless the tenant/data owner separately authorizes a narrowly written scope and preferably provides a true read-only account.
- Consequential actions require explicit human approval and an audit record.
- Build vertical slices; do not broaden the application to appear comprehensive.

## Execution order

1. Product brief and demo success contract — SCO-14.
2. Entitlement/context boundary — SCO-18, linked to SCO-6.
3. Vertical-slice behavior and design contract — SCO-19.
4. Quality and safety gates — SCO-21.
5. Demo narrative and rehearsal — SCO-15.
6. Technical/data/agentic readiness — SCO-20.
7. Customer/operator validation loop — SCO-16.
8. Final handoff reconciliation — SCO-17.

## Branch and merge strategy

- One issue per branch using the Linear-generated branch name.
- Agents that write code use isolated git worktrees.
- Tests must be written and observed failing before new production behavior is implemented.
- Each branch must pass `npm run lint`, `npm test -- --run`, and `npm run build` before review.
- Merge the smallest dependency-first vertical slices; do not batch unrelated work.
- Reconcile conflicting recommendations in the decision log before implementation.

## Required output from every workstream

- Outcome delivered.
- Evidence used and confidence.
- Files changed or created.
- Tests/verification run with actual results.
- Decisions made and decision authority.
- Risks, assumptions, dependencies, and open questions changed.
- Exact handoff to the next workstream.

See `WORKSTREAMS.md`, `DECISION-LOG.md`, and `REGISTERS.md`.