# Tranche Registers

## Risks

| ID | Risk | Impact | Mitigation | Owner | Review trigger |
|---|---|---|---|---|---|
| R-001 | Demo becomes a feature tour instead of proving a job. | High | One primary vertical slice; every interaction must advance the user outcome. | Product/UX | New surface proposed. |
| R-002 | Synthetic behavior is mistaken for production readiness. | High | Persistent synthetic label; explicit production-gap panel and narrative. | Product/technical | Demo or documentation claim changes. |
| R-003 | Broad AcgAdmin evidence is mistaken for lower-role enforcement. | High | SCO-18 and SCO-6 remain evidence gates; label unverified permissions. | Product/backend | Permission claim or role-specific UI added. |
| R-004 | Rapid parallel agents create conflicting code or hidden context. | High | Worktrees, one issue per branch, dependency order, durable outputs, neutral reconciliation. | Integration owner | Two workstreams touch the same contract/file. |
| R-005 | Device/action concepts imply unsafe autonomy. | High | No real command; human approval, impact preview, audit, and recovery contract. | Technical/safety | Any executable action is introduced. |
| R-006 | Demo reliability erodes under rapid iteration. | Medium | TDD, deterministic fixtures/reset, CI gates, rehearsal and backup path. | Quality owner | Flake, console error, build failure, or demo reset drift. |
| R-007 | Customer evidence is unavailable and hypotheses harden into facts. | High | Preserve hypotheses and explicit evidence gaps; do not fabricate validation. | Product owner | Tranche closes without representative sessions. |
| R-008 | The SCO-26 decision-plan quote-freshness/expiry text is a static synthetic label, not a live freshness computation; audiences may over-trust it. | Medium | Option cards label evidence as one synthetic quote and require human selection plus rationale; no purchase path exists. | Technical/safety | Quote freshness becomes computed or a second data source appears. |

## Assumptions

| ID | Assumption | Confidence | Validation action | Owner |
|---|---|---|---|---|
| A-001 | Exception-to-resolution is a frequent and costly fleet-management job. | Medium | Representative interviews/usability sessions. | WS1 |
| A-002 | A unified investigation/work-order/inventory timeline reduces handoff loss. | Medium | Compare current workflow and demo task completion/evidence quality. | WS1/WS2 |
| A-003 | Current synthetic fixtures cover the demo path sufficiently. | Medium | Rehearsal and deterministic reset test. | WS4/WS6 |
| A-004 | Existing domain state machines can support the slice without broad refactor. | Medium-high | Code/test audit and one vertical tracer. | WS3/WS4 |
| A-005 | Demo can be useful before production identity/integration work. | High for learning, low for deployment | Explicit simulation boundary and decision-focused audience test. | Integration owner |

## Dependencies

| ID | Dependency | Needed by | Owner | State |
|---|---|---|---|---|
| DEP-001 | Product brief and success contract | All workstreams | WS1 | Open (SCO-14) |
| DEP-002 | Entitlement/context boundary | UX, domain, demo claims | WS3 | Open (SCO-18/SCO-6) |
| DEP-003 | Workflow/state contract | Frontend and demo | WS2 | Open (SCO-19) |
| DEP-004 | Green main quality baseline | All implementation | WS6 | Validation running |
| DEP-005 | Representative user access | Customer validation | User/Product | Open |
| DEP-006 | Agent-storm merge/reconciliation owner | Parallel execution | Chief of Staff/Head of Development | Assigned by tranche operating model |

## Open questions

| ID | Question | Consequence | Next evidence action | Owner |
|---|---|---|---|---|
| Q-001 | Which persona owns the exception from trigger through safe return to service? | Workflow and permissions may be wrong. | Interview/role mapping. | WS1 |
| Q-002 | What baseline outcome should the demo improve? | Success becomes subjective. | Current-workflow measurement or explicit learning target. | WS1 |
| Q-003 | Which signals are authoritative versus advisory? | Unsafe or misleading prioritization. | Data/source/freshness contract. | WS3/WS5 |
| Q-004 | What state transitions require approval or separation of duties? | Audit and authorization gaps. | Entitlement and domain review. | WS3 |
| Q-005 | How should stale, partial, conflicting, or unavailable telemetry alter recommendations? | Trust failure. | UX/data state contract and test scenarios. | WS2/WS3 |
| Q-006 | What integration is required for a bounded pilot, if any? | Premature architecture or blocked pilot. | Readiness assessment. | WS5 |
