# WS3 — Domain, data, and audit contract analysis

**Status:** Analysis and safe-boundary handoff; not an approved production specification  
**Scope:** Discovery Tranche 01 synthetic exception-to-resolution demo  
**Linear:** [SCO-18](https://linear.app/telemetry-x/issue/SCO-18/tranche-validate-entitlement-and-context-contract-for-the-demo), [SCO-20](https://linear.app/telemetry-x/issue/SCO-20/readiness-complete-technical-data-security-and-agentic-ai-assessment), related SCO-6 through SCO-13  
**Evidence cut-off:** 2026-08-22

## 1. Executive boundary

The demo may show a synthetic fleet manager moving an asset exception through grounded investigation, a human-approved synthetic enrichment, maintenance coordination, and an inventory decision. It must not claim production identity, tenant isolation, authorization, persistence, integration, metric, audit immutability, or device-command enforcement. The repository explicitly describes a product foundation, not a production asset system (`docs/PRODUCT_SCOPE.md:39-53`), and the tranche decisions prohibit production integrations and real device commands (`docs/agent-storm/DECISION-LOG.md:5-9`).

**Safe now (verified demo behavior):**

- Synthetic records are visibly separated from production and actions are represented as simulated (`src/App.tsx:76-87`).
- Investigations preserve sourced evidence timestamps, confidence-labeled inferences, actor-attributed timeline entries, and proposal/approval/rejection/completion states (`src/domain/investigation.ts:1-38,44-74`).
- A proposed tool cannot execute before a human approval; rejection prevents execution (`src/domain/investigation.test.ts:15-52`).
- Work-order start/completion rules and actor-attributed before/after audit entries exist as pure in-memory state transitions (`src/domain/work-orders.ts:28-47`).
- Part issue is positive-integer, stock-bounded, idempotent within the in-memory transaction list, costed in integer cents, and audit-recorded (`src/domain/inventory.ts:36-60`).
- The 11 focused domain tests pass as of this analysis.

**Unsafe to imply:** server-side denial, role correctness below AcgAdmin, company/site isolation, durable or immutable records, production API semantics, actual vendor availability, real-time telemetry, metric correctness, reservation semantics, return-to-service verification, report delivery, notifications, billing, or device action.

## 2. Evidence posture

| Label | Meaning in this document |
|---|---|
| **Implemented/tested** | Present in repository domain code and exercised by a passing focused test. |
| **Observed** | Seen in the bounded AssetPro evidence environment; not necessarily a TelemetryX requirement. |
| **Decided** | Recorded in the tranche decision log. |
| **Unknown** | Material behavior has not been evidenced. |
| **PROPOSAL** | Candidate future contract for review; not current capability or approved semantics. |

The AssetPro evidence is an AcgAdmin capability ceiling in one company/site context, not proof of lower-role runtime enforcement (`docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md:3-10,61-75`). PHX and Kenco are redacted safety checkpoints only; both were classified STOP-REQUIRED and are not sources for detailed domain semantics (`docs/evidence/AP-ENV-PHX-redacted-safety-checkpoint.md:18-27`; `docs/evidence/AP-ENV-KENCO-redacted-safety-checkpoint.md:21-30`). GemOne provides useful public workflow and device/cloud evidence, but no public canonical schema, API mechanics, current RBAC matrix, freshness SLA, or immutable audit contract was found (`docs/evidence/GemOne-public-product-technical-market-assessment.md:27-51,90-105`).

## 3. Entity and identity map

### 3.1 Current demo facts and safe interpretation

| Entity | Current identity / relationship | Lifecycle actually supported | Boundary or gap |
|---|---|---|---|
| Asset | String fixture key such as `TRL-443`; referenced by investigation and UI work order (`src/App.tsx:12-27`; `src/domain/investigation.ts:27-38`). | UI-only status vocabulary: Available, In service, Due soon, Out of service. | No tenant/site key, external-ID mapping, version, effective-time history, or tested asset transition. Treat IDs as demo-local labels only. |
| Investigation | `Investigation.id`, linked by `assetId` (`src/domain/investigation.ts:27-38`). | Interpreting → Waiting approval → Enriching → Ready for decision; rejection also reaches Ready for decision. | No reopen, cancel, supersede, decision, resolution, concurrency, or persistence semantics. |
| Evidence item | `Evidence.id` inside an investigation; includes label, free-text value/source, `observedAt`, and type (`src/domain/investigation.ts:1-8`). | Constructed fixture only. | Source is display text, not a stable source record; no capture time, effective interval, hash, quality, sensitivity, supersession, or access context. |
| Inference / recommendation | No stable ID; embedded free text and confidence/rationale (`src/domain/investigation.ts:33-36`). | Prepared as fixture. | Cannot independently audit, version, supersede, or tie to exact evidence inputs/model/config. |
| Tool run | `ToolRun.id`; one optional `pendingToolRun` per investigation (`src/domain/investigation.ts:9-19,36`). | Proposed → Approved → Completed, or Proposed → Rejected. | ID is time-derived; no idempotency, expiry, cancellation, failure, timeout, approver entitlement, input/output classification, or immutable approval snapshot. |
| Work order | String ID and required-task list (`src/domain/work-orders.ts:1-6`). UI and domain fixtures overlap on some IDs but are separate state stores. | Open → In progress; any state with all tasks complete can currently receive COMPLETE → Completed. | No asset link in domain type, tenant/site, owner, version, waiting-parts transition, return-to-service gate, or approved transition matrix. |
| Required task | ID unique only within a work order (`src/domain/work-orders.ts:3-6`). | Boolean complete fixture. | No actor, evidence, completion time, reopen, sequence, or task type. |
| Part / stock balance | `partId` indexes global maps (`src/domain/inventory.ts:11-17,26-33`). | Balance decremented on issue. | No inventory location/lot/UOM/currency/valuation/effective time; map is not tenant-scoped. |
| Inventory transaction | No transaction ID; replay identity is `idempotencyKey` across the state transaction array (`src/domain/inventory.ts:3-10,36-50`). | Issue only; negative quantity persisted. | No reservation, release, return, adjustment, reversal, receipt, key scope, request fingerprint, or durable uniqueness. |
| Inventory reservation | Mentioned in the demo promise/workstream acceptance, absent from domain code (`docs/agent-storm/README.md:7-16`; `docs/agent-storm/WORKSTREAMS.md:21-28`). | None. | Critical acceptance gap: an issue transaction is not a reservation. |
| Actor | Free-form `actorId`; synthetic examples include users, agent, and simulator. | Attribution only. | No immutable subject ID, actor type, tenant memberships, role/entitlement snapshot, authentication assurance, delegation, or service principal. |
| Tenant/context | UI displays a synthetic workspace label only (`src/App.tsx:75-87`). | None in domain state or commands. | Company/site/product/service/entitlement are absent; no isolation or direct-route enforcement. |
| Audit event / timeline event | Work-order/inventory `AuditEvent` has entity, action, actor, before/after, occurredAt; investigation `TimelineEvent` has ID/kind/label/actor/time (`src/domain/work-orders.ts:7-15`; `src/domain/investigation.ts:20-26`). | Appended to in-memory arrays. | Two incompatible shapes; no tenant, event ID on generic audit, correlation, causation, command ID, outcome/denial, effective time, source, integrity, retention, or durable append-only enforcement. |

### 3.2 PROPOSAL — canonical identities and relationships

This section is a **PROPOSAL**, not implemented behavior.

1. Every aggregate uses an opaque, stable internal ID (`asset_id`, `investigation_id`, `work_order_id`, `reservation_id`, `actor_id`, `audit_event_id`). Human-readable numbers remain mutable display identifiers.
2. External IDs live in a tenant-scoped mapping: `(tenant_id, source_system, external_entity_type, external_id) -> internal_id`, with uniqueness and mapping-history rules. This follows the architecture rule that external source IDs are mappings, never primary identity (`docs/ARCHITECTURE.md:24-32`).
3. Every business aggregate carries `tenant_id`; site-bound records also carry `site_id`. Cross-site views are authorization-filtered projections, never an alternate ownership model.
4. Work orders reference one primary `asset_id`; investigations may reference one primary asset plus explicit related entities. Reservations reference `work_order_id`, `part_id`, and `inventory_location_id`.
5. Actors are immutable subjects with `actor_type = human | agent | service | simulator`. A display name is not identity. Every command records both initiator and, where applicable, approver/delegator.
6. Evidence, inference, recommendation, approval, tool run, and audit event each receive stable IDs and versions so the exact material used for a decision can be reconstructed.
7. Idempotency uniqueness is scoped to `(tenant_id, command_type, idempotency_key)` and stores a request hash. Reuse with a different payload is rejected, not silently treated as success.

## 4. Lifecycle contracts and invariants

### 4.1 Implemented/tested transitions

| Aggregate | Command | Allowed from | Result | Enforced invariant |
|---|---|---|---|---|
| Investigation tool run | propose | Any investigation state in current code | Investigation Waiting approval; tool Proposed | No guard prevents replacing an existing run. |
| Investigation tool run | approve | Proposed | Investigation Enriching; tool Approved | Proposed run must exist. |
| Investigation tool run | reject | Proposed | Investigation Ready for decision; tool Rejected | Proposed run must exist; reason accepted but not validated. |
| Investigation tool run | execute | Approved | Investigation Ready for decision; tool Completed | Human approval is required by state guard; output is caller-supplied synthetic text. |
| Work order | START | Open | In progress | Only Open may start. |
| Work order | COMPLETE | Any current status if all tasks complete | Completed | All required tasks must be complete; current code does **not** require In progress. |
| Inventory | ISSUE | Existing part with sufficient balance | Balance and work-order cost decremented/incremented; transaction and audit appended | Positive integer quantity, no negative stock, integer-cent arithmetic, duplicate idempotency key returns original state. |

### 4.2 PROPOSAL — safe demo transition boundary

This section is a **PROPOSAL** for the demo contract; it does not assert production enforcement.

- **Investigation:** `Interpreting -> WaitingApproval -> Enriching -> ReadyForDecision -> DecisionRecorded -> Resolved`; alternates: `WaitingApproval -> ReadyForDecision` on rejection, and any nonterminal state -> `Cancelled`. Tool failure returns to `ReadyForDecision` with failure evidence; it never fabricates a successful output.
- **Tool run:** `Proposed -> Approved -> Running -> Succeeded | Failed | TimedOut | Cancelled`; `Proposed -> Rejected | Expired`. Approval binds a frozen purpose, input summary/hash, tool identity/version, impact preview, actor/context snapshot, and expiry. Material input changes require a new proposal and approval.
- **Work order:** `Open -> InProgress -> WaitingParts -> InProgress -> ReadyForVerification -> Completed`; `Open | InProgress | WaitingParts -> Cancelled` with reason. Completion requires prior InProgress/ReadyForVerification, all required tasks complete, required evidence present, no unresolved safety hold, named verifier, and a separate asset return-to-service decision.
- **Reservation:** `Requested -> Held -> Consumed | Released | Expired | Cancelled`. Holding is atomic against available-to-promise at one inventory location. Consumption links an issue transaction; release/expiry restores availability. Reservation is never represented as an issue.
- **Asset service state:** `Available | InService | Restricted | OutOfService | ReturnToServiceReview`. A safety-critical failed inspection may place/retain a hold; only an entitled human verifier may clear it with evidence. Health scores or agent recommendations do not directly change service state.
- **No device-command lifecycle belongs in this demo.** Any command-looking control remains a labeled preview/simulation until SCO-7 proves authorization, preview, idempotency, queue, bounded retry, cancellation, failure, audit, and recovery.

### 4.3 PROPOSAL — cross-aggregate invariants

This section is a **PROPOSAL**.

1. All referenced aggregates share the same `tenant_id`; site crossing requires an explicit entitled scope and is audited.
2. A work order cannot complete while required parts are merely proposed, externally quoted, or held without consumption where consumption is required.
3. Inventory available-to-promise equals on-hand minus active holds; it never becomes negative.
4. Money preserves integer minor units plus ISO currency; cost snapshots preserve quantity, unit price, tax/fees, source, and approval provenance. The current `unitCostCents` is safe only for a single assumed currency.
5. Consequential agent output is advisory. An agent cannot approve its own proposal, clear a safety hold, complete a work order, return an asset to service, issue stock, contact a vendor, purchase, send a report, or execute a device command.
6. Approval and execution actors are separately attributable. Separation-of-duties policy is explicit per action; absence of a rule is not authorization.
7. Aggregate updates and their audit event commit atomically. Failed and denied attempts produce outcome events without mutating business state.
8. Corrections are new events/versions referencing the superseded fact; history is never overwritten.
9. Synthetic and production data cannot share a tenant, connector, queue, credential, or export destination.

## 5. Context and entitlement boundary

### 5.1 Known evidence

AssetPro navigation changes with company/site context, and the evidence suggests role, company, site, service, product assignment, and possible subfeature permissions all influence availability (`docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md:21-35,349-360`). A read-only top-level matrix was observed, but direct-route denial, field/action restrictions, server enforcement, and lower-role runtime behavior remain unknown (`docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md:61-75,379-390`). Role names also conflict between profile and access configuration (`docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md:36-60`). SCO-18/SCO-6 therefore remain evidence gates, not completed authorization design.

### 5.2 Current demo claim matrix

| Surface/action | Current demo posture | Permitted claim |
|---|---|---|
| Navigation and all read surfaces | Available in one synthetic workspace without login/context enforcement. | “Synthetic demo workspace”; never “authorized for this role.” |
| Investigation/tool proposal | Synthetic, local state. | User can inspect a proposed synthetic enrichment before it runs. |
| Tool approval/rejection/run | State-guarded in memory; identity is hard-coded. | Demo enforces proposal-before-run in its local state machine; not production authorization. |
| Work-order/inventory state machines | Tested domain functions, not wired as durable server mutations. | Domain-rule prototypes only. |
| Create/export/report/notification/device actions | Preview/toast or explicitly out of scope. | No record, communication, export, purchase, or command occurred. |

### 5.3 PROPOSAL — authorization context contract

This section is a **PROPOSAL**.

Every application-service query or command receives a server-established context, never caller-trusted IDs:

`subject_id, actor_type, tenant_id, allowed_site_ids, selected_site_id?, role_ids, entitlement_ids, product_ids, service_ids, authentication_assurance, delegation_id?, correlation_id, purpose`

Evaluation order: authenticate subject -> validate active tenant membership -> validate selected site belongs to tenant and actor scope -> verify product/service assignment -> evaluate action entitlement and object/field constraints -> enforce approval/separation policy -> execute transaction -> append audit outcome.

- Hidden navigation is convenience only. Direct URLs and APIs must return a non-revealing denial and must not load restricted data.
- “Unavailable” (product/service not assigned), “forbidden” (insufficient entitlement), “not found in scope,” loading, stale, partial, and error remain distinct states.
- Denials record policy/rule ID and context, but user-facing text must not reveal existence or sensitive attributes of out-of-scope records.
- Until lower-role sessions and server responses are observed under SCO-6, the demo uses synthetic identities and one non-authoritative persona. No legacy role name is adopted as canonical.

## 6. Evidence, provenance, and effective time

### 6.1 Current gap

Current evidence has a source label and `observedAt`, which is enough to make the synthetic story inspectable but not enough to establish lineage, freshness, or truth. UI metrics and statuses are static fixtures with no formula, source event, aggregation window, timezone, quality, or reconciliation contract (`src/App.tsx:16-28,96-115,136-149`). AssetPro similarly exposes metrics and “last seen” fields without verified formulas/freshness, and async loading can temporarily resemble empty state (`docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md:77-88,90-113,349-360`). SCO-11 and SCO-13 remain open evidence work.

### 6.2 PROPOSAL — evidence record

This section is a **PROPOSAL**.

Each evidence record should preserve:

- `evidence_id`, `tenant_id`, `subject_type`, `subject_id`
- `source_system`, stable `source_record_id`, source URI/reference where safe, connector/import/run ID
- `assertion_type`, typed value and unit (not display text only)
- `observed_at` (when the phenomenon was measured)
- `effective_from`, `effective_to?` (business validity interval)
- `captured_at`/`ingested_at`, source timezone/clock quality, and processing version
- `quality_status = valid | suspect | stale | partial | conflicting | unavailable | superseded`
- validation results, sensitivity/classification, content/schema version, and immutable hash where applicable
- supersedes/reference links and access/context snapshot

Time semantics:

- `occurred_at`: when an action/event happened.
- `effective_at` or interval: when a business fact became true.
- `observed_at`: source measurement time.
- `recorded_at`: when TelemetryX durably accepted it.
- `available_at`: when it became queryable/usable for a decision.

Never substitute one timestamp for another. Preserve source time and normalize to UTC; retain site timezone for business-day/window calculations. Future-effective and late-arriving facts do not rewrite prior decisions silently; they trigger reconciliation and, if material, a new recommendation/version.

### 6.3 PROPOSAL — decision grounding and freshness

This section is a **PROPOSAL**.

- A recommendation version stores exact evidence IDs/versions, prompt/policy/model/tool versions (if AI-generated), generated time, confidence rationale, known conflicts, and freshness evaluation.
- Freshness is defined per evidence class, not by a universal “real-time” label. The demo may show fixed synthetic timestamps but must not state an SLA.
- Stale, partial, conflicting, or unavailable safety/stock evidence blocks automatic consequential action and visibly lowers/withholds recommendation confidence. Recovery is refresh, alternate source, or explicit human decision—not silently using the last value.
- Metric cards are illustrative until SCO-11 establishes formula, source entities/events, window, timezone, freshness, stale/partial semantics, and reconciliation. They must not be used as evaluation baselines or audited business totals.

## 7. PROPOSAL — unified audit event contract

This entire section is a **PROPOSAL**. Current arrays are inspectable demo timelines, not immutable audit logs.

Required envelope:

| Field | Requirement |
|---|---|
| Identity/order | `event_id`, tenant-scoped monotonic/stream position where needed, schema version |
| Scope | `tenant_id`, `site_id?`, entity type/ID, aggregate version |
| Action | stable event name, command/request ID, outcome (`succeeded`, `denied`, `rejected`, `failed`, `cancelled`, `timed_out`, `no_op`) |
| Actor | initiator ID/type, approver ID/type where applicable, delegation/service identity, authentication assurance |
| Context | role/entitlement/policy snapshot IDs, purpose, correlation ID, causation ID, idempotency key |
| Time | `occurred_at`, `effective_at?`, `recorded_at` |
| Change | minimal typed before/after or change set, reason code/comment, linked evidence/approval/tool-run IDs |
| Provenance | source system, producer/service version, synthetic flag |
| Integrity/governance | append-only storage, access classification, retention class, integrity/signature/hash metadata, redaction/tombstone reference rather than mutation |

Minimum demo journey event vocabulary:

- `investigation.created`, `investigation.intent_recorded`, `investigation.grounding_completed`, `investigation.interpretation_prepared`
- `tool_run.proposed`, `tool_run.approved`, `tool_run.rejected`, `tool_run.started`, `tool_run.succeeded`, `tool_run.failed`, `tool_run.timed_out`, `tool_run.cancelled`
- `recommendation.prepared`, `decision.recorded`
- `work_order.created`, `work_order.started`, `work_order.waiting_parts`, `work_order.task_completed`, `work_order.ready_for_verification`, `work_order.completed`, `work_order.cancelled`
- `inventory.reservation_requested`, `inventory.reserved`, `inventory.reservation_released`, `inventory.reservation_expired`, `inventory.part_issued`, `inventory.part_returned`, `inventory.adjusted`
- `asset.service_hold_applied`, `asset.return_to_service_approved`
- `authorization.denied`, `data.stale_detected`, `data.conflict_detected`, `reconciliation.completed`

Audit rules:

1. Event names describe facts in past tense; proposals and denials are events even without business-state mutation.
2. Audit persistence is atomic with the accepted state change and cannot be disabled by a caller.
3. Secrets, full sensitive payloads, and unnecessary personal data are not audit content; store references/hashes and governed evidence instead.
4. Corrections append compensating/superseding events. “Delete audit event” is not an application operation.
5. Logs/telemetry and audit serve different purposes. Operational logs may be sampled/expired; audit evidence has explicit retention, access, export, and legal/privacy rules.

## 8. Contradictions and unsafe ambiguities

| ID | Finding | Why it matters | Disposition |
|---|---|---|---|
| C-01 | WS3 acceptance names **inventory reservations**, but code implements immediate part issue only. | Demo promise can overstate coordination and stock guarantees. | Keep reservation language conceptual or implement only after an approved reservation contract; do not rename issue as reserve. |
| C-02 | UI says `WO-24091` is In progress and BA-14TL has no internal stock, while the inventory domain fixture contains unrelated part/work-order IDs. | There is no executable cross-aggregate vertical slice. | Treat UI story and isolated state-machine tests as separate synthetic evidence. |
| C-03 | Work-order UI includes Waiting parts, but domain commands support only START/COMPLETE; COMPLETE can be called from Open if tasks are complete. | State claims and safety gate diverge. | Proposed matrix above; production/pilot blocked until approved and tested. |
| C-04 | Asset status vocabularies differ across TLX UI and legacy telemetry/availability/device states. | “Status” conflates serviceability, connectivity, assignment, and maintenance. | Split service state, connectivity/freshness, assignment, and health projections before migration. |
| C-05 | Tool “Approved” is set by any supplied actor ID and output is caller-supplied text. | Human approval and external result authenticity are demo conventions, not identity/integration controls. | Maintain visible synthetic label; no production claim. |
| C-06 | Tool run has no Running/Failed/TimedOut/Cancelled states and no idempotency/expiry. | A real connector cannot recover safely or explain uncertainty. | Use proposed lifecycle only after WS5/SCO-20 approval. |
| C-07 | Two audit shapes exist and are mutable in-memory arrays. Timeline event IDs use clock + randomness; generic audit has no event ID. | Cannot guarantee uniqueness, ordering, integrity, tenant scope, or replay. | Treat as UI operating memory; adopt a unified durable envelope before pilot. |
| C-08 | `observedAt` is used for evidence, but metrics/statuses have no effective/freshness semantics. | Stale or late data may be presented as current and recommendations cannot be reproduced. | Gate metric/action claims on SCO-11 and proposed temporal contract. |
| C-09 | Legacy role catalogs use inconsistent names and only AcgAdmin has been exercised. | Copying roles would create migration and authorization risk. | Do not map names by similarity; complete SCO-6 evidence and define canonical entitlements. |
| C-10 | Legacy/public evidence shows command-capable device/cloud paths, while the tranche forbids real commands. | A tool proposal UI could be misread as autonomous command readiness. | Synthetic vendor lookup only; no device adapters, command claims, or queued-command simulation beyond clearly labeled concept. |
| C-11 | Current part cost uses cents without currency; vendor result contains a formatted dollar quote. | Cross-source totals could mix currencies/fees/tax and imply purchasing. | Display quote as synthetic evidence only; future money contract requires currency and provenance. |
| C-12 | The demo narrative wants verified resolution/return to service, but current investigation ends Ready for decision and work-order completion does not update asset state. | The end-to-end outcome is not domain-enforced. | Describe resolution as storyboard intent, not implemented lifecycle, until verification/return-to-service contracts exist. |

## 9. Pilot readiness gaps and next evidence actions

| Priority | Gap / blocker | Owner | Next evidence action / exit criterion | Traceability |
|---|---|---|---|---|
| P0 | Tenant/context and lower-role enforcement unknown | Identity/backend + SCO-18 owner | Complete synthetic Company Admin/Site Admin/Supervisor/Maintenance Admin route/action/field/API-denial matrix; record allowed and denied audit attribution; no permission mutation. | SCO-18, SCO-6 |
| P0 | No durable transactional/audit boundary | Backend/data + SCO-20 owner | Approve aggregate boundaries, transaction/outbox strategy, audit envelope, retention/integrity/access controls; demonstrate atomic state + audit and recovery. | SCO-20 |
| P0 | Device-command safety contract unknown | Safety/backend | Produce state model and enforcement evidence for authorization, preview, idempotency, bounded retries, timeout, cancellation, recovery; execute no command in this tranche. | SCO-7 |
| P0 | Reservation and return-to-service lifecycles absent | Maintenance/inventory/product | Decide reservation semantics and work-order/asset verification gates; add executable contract tests before wiring UI. | SCO-8, SCO-20 |
| P1 | Evidence lineage, freshness, conflict, and metric semantics absent | Data/reporting | Define source/event/formula/window/timezone/freshness/reconciliation for utilization, TCO, safety, compliance, alarms, maintenance; test stale/partial/conflict behavior. | SCO-11, SCO-13 |
| P1 | Integration ownership/contracts unverified | Integration/operations | Register Peplink, EBis, TMA, BMS, BYD, SmartFleet owner/source/target/direction/auth class/cadence/retry/reconciliation/observability/classification; no secrets or changes. | SCO-10 |
| P1 | AI/tool evaluation and oversight baseline absent | Product/AI/safety | Define representative test set, acceptable false-positive/negative/error thresholds, abstention behavior, evidence completeness, reviewer disagreement, escalation, and support owner. | SCO-20 |
| P1 | Sensitive operator/incident lifecycle unverified | People/safety/privacy | Use synthetic operator only; classify fields/evidence and define access, notification, retention, suspension, recovery, audit. | SCO-9 |
| P1 | Scheduled-report governance absent | Reporting/security/privacy | Define recipient authorization/consent, external-domain warning, preview, schedule/delivery lifecycle, retry/revocation/retention/audit; no send/export. | SCO-12 |
| P2 | Concurrency, retry, and deterministic identity not tested | Backend/quality | Add contract tests for optimistic concurrency, idempotency payload mismatch, duplicate delivery, ordering, clock handling, and reconciliation. | SCO-20/SCO-21 |
| P2 | Privacy/security/operations/unit economics incomplete | Security/operations/product | Threat model; data classification/minimization/retention; backup/restore/RPO/RTO; SLO/support/runbook; connector/tool cost and human-review burden. | SCO-20 |

**Readiness conclusion:** the workflow is suitable for a rehearsable synthetic learning demo. It is **not ready for a bounded pilot** until the P0 items are evidenced and approved; P1 controls must be resolved for whichever data/actions enter pilot scope. Fixtures and passing pure-function tests demonstrate useful domain-rule direction, not deployment readiness.

## 10. Demo acceptance boundary for downstream workstreams

WS2/WS4/WS7 may rely on these safe statements:

1. The asset, investigation, work-order, part, actor, evidence, tool-run, and audit concepts are coherent for a synthetic story.
2. The existing local investigation flow prevents execution before local approval and visibly records approval/rejection/result.
3. The existing isolated work-order and inventory functions demonstrate selected invariants with passing tests.
4. Every identity, permission, source, metric, quote, status, cost, timestamp, tool result, and audit record in the demo is synthetic unless explicitly cited as external evidence.
5. No real record, reservation, work order, vendor request, purchase, report, notification, billing action, integration write, or device command occurs.
6. Any contract in this document marked **PROPOSAL** requires accountable product/technical approval and tests before implementation or pilot claims.

## 11. Verification performed

- Read all `docs/agent-storm/*`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_SCOPE.md`, all four `docs/evidence/*` artifacts, and all `src/domain/*` state machines/tests.
- Reviewed Linear SCO-18, SCO-20, and SCO-6 through SCO-13 including relations and acceptance criteria.
- Ran `npm test -- --run src/domain/investigation.test.ts src/domain/work-orders.test.ts src/domain/inventory.test.ts`: **3 files passed, 11 tests passed**.
- No product code was modified.
