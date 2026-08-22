# Decision Log — Discovery Tranche 01

| ID | Decision | Status | Rationale / evidence | Owner | Reconsider when |
|---|---|---|---|---|---|
| D-001 | Primary demo job is exception-to-safe-plan fleet coordination. | Decided for tranche | Existing application and AssetPro evidence connect asset state, maintenance, sourcing feasibility, safety, ownership, and audit; the runnable path currently stops at decision-ready. | Product decision owner | Customer evidence shows a higher-value job or the slice cannot be made coherent. |
| D-002 | Demo uses synthetic data and no production integrations. | Decided | Speed and safety; current repository is explicitly a product foundation. | Technical decision owner | A bounded pilot has approved data, integration, security, and support ownership. |
| D-003 | No real device command is executed or implied. | Decided | Device-command authorization, idempotency, retries, cancellation, audit, and recovery remain discovery contracts. | Product + technical | SCO-7 evidence and a separately approved test envelope are complete. |
| D-004 | Modular monolith is the default evolution path. | Existing decision | Current architecture document favors clear domain/application boundaries before service decomposition. | Head of Development | Scale, ownership, deployment, or reliability evidence supports a service split. |
| D-005 | New behavior follows strict test-first RED-GREEN-REFACTOR. | Decided | Rapid demo iteration must remain safe and reproducible. | Quality owner | User explicitly authorizes a throwaway prototype exception. |
| D-006 | Linear is the commitment/traceability system; repository docs hold durable implementation context. | Decided | Prevent parallel shadow backlogs while keeping agents independent of chat history. | Chief of Staff | Tooling proves unable to maintain cross-links or ownership. |
| D-007 | The fast demo claims decision-ready safe planning, not inventory reservation, repair completion, or verified return to service. | Decided for current demo | WS1, WS2, WS3, WS4, and WS7 independently found that the rendered path ends after a synthetic vendor-availability result and preview-only action-plan control. | Product + demo owner | A tested vertical slice implements and visibly verifies later lifecycle states. |
| D-008 | Primary learning outcome is time from first actionable exception signal to an approved safe response plan. | Proposed pending product-owner approval | It isolates the software-influenceable coordination interval from physical repair and vendor delivery time. | Product owner | Representative users identify a different decision-useful outcome or no credible baseline can be established. |

## Open decisions

| ID | Decision needed | Options | Evidence threshold | Decider |
|---|---|---|---|---|
| OD-001 | Exact target fleet persona for the first validation session | Fleet manager; site supervisor; maintenance coordinator | Named participant/workflow evidence and job frequency/cost | Product owner |
| OD-002 | Which demo outcome is the primary success measure | Time-to-triage; time-to-owner; time-to-safe-plan; handoff count; evidence completeness | Baseline from representative users or explicit learning objective | Product owner |
| OD-003 | Whether lower-privilege AssetPro accounts can be created/used | Use synthetic accounts; defer and label unknown | Explicit user authorization and safe identity boundary | User |
| OD-004 | Whether to merge next demo changes directly or through protected PRs | PR required; temporary rapid branch flow | Current branch protection and demo deadline | Repository owner |
