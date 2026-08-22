# WS5 — Backend and Integration Readiness

**Workstream:** WS5 — Backend and integration readiness  
**Linear:** SCO-20; related SCO-7, SCO-10, SCO-11  
**Assessment date:** 2026-08-22  
**Decision posture:** **NOT READY for a production pilot. READY only for a synthetic, non-integrated demo.**  
**Scope:** Application-service, persistence, job, integration, reporting/metric, and device-command boundaries needed for a bounded pilot. No product code or external system was changed.

## 1. Executive decision

TelemetryX has a useful domain prototype, not a deployable backend. The repository contains pure in-memory TypeScript state machines for investigations, work-order transitions, inventory issuance, actor-attributed audit entries, and one idempotency example. It has no server-side identity or authorization, tenant isolation, durable persistence, integration adapters, job runtime, reconciliation, production audit store, observability, privacy controls, or operational ownership. The architecture already chooses a modular monolith as the default next step; the evidence does not justify service decomposition.[ARCH][SCOPE][CODE]

A **bounded read-only pilot** may be considered only after Gates G0–G9 below have named owners and passing evidence. Any pilot that writes to a system of record, sends an external communication, or executes a device command additionally requires G10–G12. **Device commands remain prohibited** until the separate SCO-7 safety contract and an explicitly approved test envelope are complete.[DEC][SCO-7]

This assessment does **not** infer AssetPro or GemOne private APIs. AssetPro evidence establishes visible integration names and operational surfaces, not contracts. GemOne publicly claims integrations, but no reviewed public endpoint catalog, authentication/scopes, schema, rate limits, webhook, sandbox, idempotency, or version policy was found.[AP-DEMO §AP-EVID-INT-001][GEM §API boundary]

## 2. Evidence and confidence

| Claim | Label | Evidence / limitation |
|---|---|---|
| Current application is React/TypeScript with local typed synthetic fixtures and pure domain state machines. | Fact | `docs/ARCHITECTURE.md`; `src/domain/*` |
| Inventory issue demonstrates positive-integer validation, stock guard, cents-based cost, actor audit data, and duplicate-key no-op in memory. | Fact, demo-only | `src/domain/inventory.ts`; tests do not prove database concurrency, tenant scope, key ownership, or durable replay. |
| Work-order start/completion guards and actor-attributed before/after audit entries exist in memory. | Fact, demo-only | `src/domain/work-orders.ts`; not durable, signed, immutable, authorized, or concurrency-safe. |
| Investigation tool execution requires a preceding in-memory approval state. | Fact, demo-only | `src/domain/investigation.ts`; there is no server enforcement, policy engine, approval expiry, separation of duties, or durable execution record. |
| AssetPro exposes company/site context, broad AcgAdmin access, API-token UI, named integration settings, data-management states, reports, and command-capable controls. | Observed in demo environment | `docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md`; lower-role runtime enforcement and private contracts remain unknown. |
| PHX/Kenco contain customer-derived or operational indicators and are not acceptable discovery targets without narrower authorization/read-only identity. | Observed safety disposition | Redacted PHX/Kenco checkpoints; no data or contract inference is made from them. |
| GemOne has a documented bidirectional device/cloud path and public integration claims, but northbound API mechanics and cloud assurance remain unknown. | Documented public evidence / unknown contract | `docs/evidence/GemOne-public-product-technical-market-assessment.md`. |
| Modular monolith is the preferred evolution path. | Existing decision | `docs/ARCHITECTURE.md`; `docs/agent-storm/DECISION-LOG.md` D-004. |

**Confidence:** High on current repository gaps and the prohibition on production/device actions; medium on proposed modular boundaries; low on external contract mechanics, metric formulas, real freshness, and legacy integration ownership because those require provider/customer diligence.

## 3. Bounded modular-monolith proposal

### 3.1 Deployment shape

**Proposed, not implemented:** one versioned application deployment, one PostgreSQL cluster with schema/module ownership, one durable job/queue runtime, object storage for evidence files, and explicit in-process application interfaces. Modules may publish committed domain events through a transactional outbox. They must not access another module's tables directly. Split a module into a service only after measured scale, availability, deployment cadence, regulatory isolation, or team-ownership evidence justifies it.

```text
Web client
   |
   v
HTTP API / application boundary
   |
   +-- Identity, Tenant & Entitlements
   +-- Asset Registry & Source Mappings
   +-- Telemetry Ingestion & Data Quality
   +-- Investigations & Human Decisions
   +-- Maintenance / Work Orders
   +-- Parts & Inventory
   +-- Integration Hub / Adapters
   +-- Device Command Safety Envelope (disabled by default)
   +-- Reporting & Metric Definitions
   +-- Audit, Evidence & Compliance
   +-- Support / Operations
             |
             +-- PostgreSQL + transactional outbox
             +-- durable queue + workers
             +-- object storage (scanned, hashed, retained)
             +-- adapter ports to approved external systems
```

### 3.2 Module boundaries and ownership

| Module | Owns | May depend on | Must not own / bypass |
|---|---|---|---|
| Identity, Tenant & Entitlements | tenant, site/context, principal mapping, roles, permissions, service/product entitlements, approval policy | enterprise IdP claims | Business records; client-supplied tenant authority; UI-only authorization |
| Asset Registry & Source Mappings | stable internal asset ID, lifecycle, site assignment, external source mappings, device association history | identity/context | External IDs as primary keys; raw command execution |
| Telemetry & Data Quality | immutable raw envelopes, normalized observations, source/effective/received times, quality flags, freshness state, correction lineage | asset mappings, adapters | Silent overwrite; metric definitions; command state |
| Investigations & Decisions | question, evidence references, facts/inferences, recommendations, approval/rejection, decision timeline | asset, telemetry, maintenance, inventory | Direct external tool execution; unverifiable copied evidence |
| Maintenance | requests, work orders, tasks, status transitions, approvals, labor/cost links, return-to-service evidence | assets, inventory application API | Inventory table writes; command execution; completion without invariants |
| Parts & Inventory | catalog, location balance, reservation, issue/return/adjustment ledger, valuation | maintenance references, tenant/context | Mutable balance without ledger; floating-point money; cross-tenant reservation |
| Integration Hub | connection metadata (never secrets), adapter configuration, cursors, inbox/outbox, mapping errors, retries, DLQ, reconciliation runs | all modules through ports/events | Canonical business ownership; provider-specific fields leaking into core contracts |
| Device Command Safety Envelope | command intent, target snapshot, impact preview, approval, dispatch attempt, provider receipt, cancellation/recovery state | identity, assets, adapters, audit | Device transport secrets in domain records; autonomous dispatch; unbounded retry |
| Reporting & Metrics | versioned metric definitions, materializations, report jobs, recipient governance | canonical events/read models | Hidden formulas; report send without recipient authorization/consent |
| Audit, Evidence & Compliance | append-only audit envelope, evidence metadata/hash, retention/legal hold, access record | all modules | Business transaction orchestration; plaintext secrets; mutable audit history |
| Support / Operations | integration ownership, runbooks, incidents, replay/reconcile approvals, customer-visible status linkage | audit and integration status | Product backlog duplication by default; unrestricted data browsing |

### 3.3 Required cross-module rules

1. Every request carries a **server-derived** `principal_id`, `tenant_id`, allowed `site_ids`, permission set, authentication assurance, correlation ID, and request time. Client fields never establish authorization.
2. Every business row carries `tenant_id`; site-scoped rows also carry `site_id`. Repository queries require context and deny missing scope.
3. Stable internal IDs are canonical; `(source_system, external_id, tenant_id)` mappings are versioned and unique.
4. Mutations use optimistic concurrency (`expected_version`) or an equivalent row lock where contention is expected.
5. Business mutation + audit entry + outbox event commit in one database transaction.
6. Consumers use a durable inbox/deduplication key. Delivery is at least once; handlers must be idempotent.
7. Raw source observations are preserved; normalization and correction append lineage rather than rewriting history invisibly.
8. All timestamps are UTC instants plus source timezone/offset when relevant. `effective_at`, `observed_at`, `received_at`, `processed_at`, and `recorded_at` are distinct.
9. Consequential actions require policy evaluation, explicit human approval, an immutable intent snapshot, and an audit record.
10. Demo, test, and production identities, storage, queues, keys, targets, and visual labels are separated.

## 4. Proposed API sketches — not observed external APIs

These are **TelemetryX internal application API sketches only**. They are not claims about AssetPro, GemOne, Peplink, EBis, TMA, BMS, BYD, or SmartFleet.

### 4.1 Common context and response

```http
Authorization: Bearer <OIDC access token>
Idempotency-Key: <tenant-scoped opaque key>       # required for mutation retries
If-Match: "<aggregate version>"                  # required where lost updates matter
X-Correlation-ID: <caller-generated UUID>         # server creates one if absent
```

```json
{
  "data": {},
  "meta": {
    "correlationId": "...",
    "resourceVersion": 7,
    "sourceStatus": "fresh|stale|partial|unavailable",
    "asOf": "2026-08-22T20:00:00Z"
  }
}
```

### 4.2 Read path

```http
GET /v1/assets/{assetId}/operating-picture?asOf=<instant>
GET /v1/investigations/{investigationId}
GET /v1/work-orders/{workOrderId}
GET /v1/parts/{partId}/availability?siteId=<siteId>
GET /v1/integrations/{connectionId}/health
GET /v1/metrics/{metricKey}?siteId=<siteId>&windowStart=<instant>&windowEnd=<instant>
```

Read responses must expose source/effective time, freshness, quality flags, missing contributors, and lineage references where a decision could be affected.

### 4.3 Mutation path

```http
POST /v1/investigations
POST /v1/investigations/{id}/tool-proposals
POST /v1/tool-proposals/{id}/approvals
POST /v1/work-orders/{id}/transitions
POST /v1/inventory/reservations
POST /v1/inventory/issues
POST /v1/integrations/{id}/reconciliation-runs
```

```json
{
  "commandId": "cmd_...",
  "expectedVersion": 6,
  "reason": "operator-entered purpose",
  "input": {},
  "approvalId": "approval_..."
}
```

Mutation semantics:

- First successful use of an idempotency key persists request hash and result in the same transaction.
- Same key + same canonical request returns the original status/result.
- Same key + different request returns `409 IDEMPOTENCY_KEY_REUSED`.
- Failed authorization is not cached as a successful idempotent result.
- Version conflict returns `409 VERSION_CONFLICT` with no partial mutation.
- Validation errors are stable machine-readable codes; logs do not contain sensitive payloads.

### 4.4 Device-command path — proposed and disabled

```http
POST /v1/device-command-intents             # creates intent only
POST /v1/device-command-intents/{id}/approve
POST /v1/device-command-intents/{id}/cancel
GET  /v1/device-command-intents/{id}
```

No generic `execute` endpoint should be exposed to the web client. An approved intent is dispatched only by a worker after re-authorizing the actor/approver policy, target, expiry, environment, and provider connection. A pilot feature flag and per-command allowlist default to off.

## 5. Proposed event sketches — internal contracts

Events are committed through the outbox and versioned. They describe facts that have happened; they are not commands.

```json
{
  "eventId": "evt_...",
  "eventType": "inventory.reservation.created.v1",
  "aggregateType": "inventory_reservation",
  "aggregateId": "res_...",
  "aggregateVersion": 1,
  "tenantId": "ten_...",
  "siteId": "site_...",
  "actor": {"type": "user|service", "id": "..."},
  "correlationId": "...",
  "causationId": "cmd_...",
  "occurredAt": "...",
  "recordedAt": "...",
  "data": {},
  "schemaVersion": 1,
  "classification": "internal"
}
```

Initial event vocabulary:

- `source.observation.received.v1`
- `source.observation.rejected.v1`
- `asset.source-mapping.changed.v1`
- `telemetry.freshness.changed.v1`
- `investigation.created.v1`
- `investigation.tool-proposed.v1`
- `investigation.tool-approved.v1`
- `investigation.tool-rejected.v1`
- `work-order.transitioned.v1`
- `inventory.reservation.created.v1`
- `inventory.part-issued.v1`
- `integration.import.completed.v1`
- `integration.reconciliation.completed.v1`
- `metric.materialization.completed.v1`
- `device-command.intent-created.v1`
- `device-command.approved.v1`
- `device-command.dispatch-accepted.v1`
- `device-command.outcome-observed.v1`

Do not publish sensitive evidence bodies, tokens, contact data, or device secrets in events. Publish identifiers and minimum necessary metadata; authorized consumers retrieve details through application APIs.

## 6. Data lineage, effective time, and freshness

### 6.1 Canonical lineage

```text
External provider / manual entry / internal transaction
  -> immutable ingestion envelope (source ID, payload hash, received_at)
  -> schema validation + tenant/asset mapping
  -> normalized observation (observed_at/effective_at + quality flags)
  -> canonical domain state or append-only ledger
  -> versioned metric definition/materialization
  -> API/report/investigation evidence reference
  -> actor-attributed decision/action/audit event
```

Every displayed fact or metric used in prioritization must be traceable to: tenant, internal entity, source system, external source ID where permitted, raw-envelope hash, transform/schema version, source time, receive time, processing time, correction/supersession chain, and last reconciliation run.

### 6.2 Freshness contract

**Proposed contract; numeric SLAs are decision gates, not guessed values.**

| State | Required semantics | Product behavior |
|---|---|---|
| Fresh | `now - freshness_basis <= approved threshold`; all required contributors present | Normal display; show as-of time for consequential decisions |
| Stale | Threshold exceeded but last valid value exists | Show last value with stale badge and age; block automation if policy requires |
| Partial | One or more required contributors missing/late/rejected | Show contributors and omissions; do not present a complete metric |
| Conflicting | Sources disagree beyond approved tolerance | Preserve both, identify authority rule, route to reconciliation |
| Unavailable | No valid value or source unreachable | No synthetic zero; explain retry/support path |
| Corrected | Prior observation superseded | Preserve old and new values, reason, actor/source, and recalculation status |

Freshness basis must be metric/source specific: source observation time for telemetry, committed transaction time for inventory/work orders, and materialization completion plus maximum contributor age for aggregates. Device clock skew, offline buffering, duplicates, out-of-order events, daylight-saving boundaries, and late arrivals require explicit tests.

### 6.3 Metric readiness register (SCO-11)

Observed legacy surfaces name these metrics, but formulas and authoritative lineage were not established. **No production metric may be labeled authoritative until every `TBD` is resolved and versioned.**

| Metric family | Observed surface | Formula | Source entity/event | Window/timezone | Freshness/partial rule | Reconciliation | State |
|---|---|---|---|---|---|---|---|
| Utilization / expected usage | Dashboard, reports, GemOne claims | **TBD**: denominator, idle/seat/travel treatment, availability exclusions | Candidate: sessions/hour meters/assignment; unverified | **TBD** per tenant/site | **TBD** SLA; missing sessions cannot become zero | Compare raw sessions/meters to aggregate; late-event recompute | BLOCKED |
| TCO / cost per hour | Dashboard, maintenance analytics | **TBD**: included costs, allocation, tax/currency, hour basis | Candidate: invoices, labor, parts, lease, energy, meters; unverified | **TBD** accounting period/timezone | Partial if any required cost feed or meter is stale | Ledger-to-source totals and currency checks | BLOCKED |
| Safety score | Safety dashboard | **TBD** weights, thresholds, exposure normalization | Candidate: alarms, impacts, checklist, incidents, settings; unverified | **TBD** | Partial if exposure or configured component missing | Recompute with metric-definition version | BLOCKED |
| Compliance | Dashboard/reports | **TBD** population, due logic, exceptions | Candidate: checklist/certification/inspection submissions; unverified | **TBD** | Distinguish no submissions from compliant | Submission-level tie-out and late correction | BLOCKED |
| Alarms / alerts | Dashboard/reports | **TBD** event dedupe, severity, open/closed counting | Candidate: device alarm events/configuration; unverified | **TBD** | Show source lag and rejected/duplicate counts | Event-count tie-out and lifecycle reconciliation | BLOCKED |
| Maintenance status/cost | Dashboard/analytics | **TBD** due/overdue thresholds and cost recognition | Candidate: work orders, schedules, invoices, meters; unverified | **TBD** | Partial if meter/schedule/cost inputs stale | Work-order/invoice/meter tie-out | BLOCKED |

Metric definition records should include `metric_key`, semantic version, owner, formula expression/specification, allowed dimensions, source contract versions, required contributors, effective-from/to, timezone policy, freshness objective, late-arrival window, correction behavior, validation queries, and approval history.

## 7. Authorization and consequential-action policy

### 7.1 Required checks

Authorization is server-side and evaluated at both request acceptance and worker execution:

- authenticated principal and assurance level (SSO/MFA policy);
- tenant membership and selected company/site context;
- product/service entitlement and granular permission;
- entity scope and data classification;
- command/action type allowlist;
- approval policy, approver eligibility, separation of duties, and approval expiry;
- target asset/device mapping and current lifecycle state;
- environment and connection allowlist;
- reason/purpose and optional change/ticket reference.

The broad AcgAdmin surface and inconsistent legacy role labels are evidence for discovery, not a role model to copy. Lower-role runtime behavior remains unverified.[AP-DEMO §AP-LEG-ROLE-001/002]

### 7.2 Approval integrity

Approval stores the exact action hash, target, impact preview, data snapshot/version, approver, time, policy version, and expiry. Any material input change invalidates approval. Self-approval is denied where separation of duties applies. Revoked access, expired approval, stale target state, or changed provider mapping blocks dispatch.

## 8. Idempotency, transactions, retries, and recovery

### 8.1 Transaction boundaries

| Use case | Atomic boundary |
|---|---|
| Work-order transition | validate state/version + update aggregate + append audit + outbox event |
| Inventory reserve/issue/return | validate balance/version + append inventory ledger + update derived balance + work-order cost link + audit + outbox |
| Investigation approval/rejection | validate proposal/version/policy + persist decision + audit + outbox |
| Integration ingest | persist inbox/dedupe + raw envelope + mapping/validation result; canonical apply may be a second idempotent transaction |
| Device command intent | persist immutable intent + impact snapshot + policy decision + audit; dispatch is never in the HTTP transaction |
| Report schedule/send | persist authorized schedule; each occurrence creates an independently idempotent delivery job and result |

External calls cannot be atomically committed with PostgreSQL. Use intent/outbox, explicit intermediate states, provider receipt identifiers where available, and reconciliation. Never claim exactly-once external execution.

### 8.2 Retry policy

- Retry only classified transient failures (timeout, connection reset, approved 429/5xx cases).
- Use exponential backoff with jitter, bounded attempts and elapsed time, provider-specific rate limits, and circuit breaking.
- Do not retry validation, authorization, mapping, policy, or permanent provider errors automatically.
- Persist every attempt with sanitized error class, next-attempt time, and correlation identifiers.
- Send exhausted jobs to a quarantined/DLQ state; no silent drop and no infinite retry.
- Manual replay requires permission, reason, impact preview, and audit; replay reuses the original logical idempotency identity.

### 8.3 Reconciliation

Each adapter needs scheduled and on-demand reconciliation by bounded tenant/site/time range. A run records source watermark, counts read/accepted/rejected/duplicate/unmapped, hashes/totals where possible, discrepancies, corrections, owner, and completion state. Reconciliation must not silently overwrite manual corrections or cross tenant boundaries. Unmapped asset/device identities quarantine data until reviewed.

## 9. Device-command safety contract (SCO-7 gate)

### 9.1 Proposed state model — no execution authorized

```text
DRAFT -> PREVIEWED -> PENDING_APPROVAL -> APPROVED -> QUEUED
                                      \-> REJECTED
QUEUED -> DISPATCHING -> PROVIDER_ACCEPTED -> OUTCOME_CONFIRMED
                    \-> DISPATCH_FAILED
PROVIDER_ACCEPTED -> OUTCOME_UNKNOWN -> RECONCILING -> OUTCOME_CONFIRMED | MANUAL_RECOVERY
DRAFT/PREVIEWED/PENDING_APPROVAL/APPROVED/QUEUED -> CANCELLED (when provider semantics permit)
```

Provider acceptance is not device execution. Timeout is not failure. A missing acknowledgement is `OUTCOME_UNKNOWN`, requiring reconciliation before a replacement command can be considered.

### 9.2 Mandatory safeguards

- Per-tenant, per-site, per-device, and per-command allowlist; kill switch default off.
- Named operational owner and 24/7 escalation appropriate to action impact.
- Target snapshot and human-readable impact preview, including reversibility and expected observation.
- Explicit approval; policy for dual control and self-approval.
- Idempotency identity spanning API intent, queue delivery, adapter dispatch, and provider receipt where supported.
- No automatic retry after ambiguous dispatch unless provider contract proves safe deduplication.
- Expiry, bounded queue time, cancellation semantics, and compensating/manual recovery runbook.
- Immutable audit from intent through observed outcome; sanitized transport diagnostics.
- Safe test device/tenant, physical observer, maintenance window, rollback/recovery, and stop criteria.

### 9.3 Unresolved command evidence

Command list, provider contracts, reversibility, acknowledgement semantics, on-device behavior, queue ownership, retry safety, timeout, cancellation, and recovery remain unknown. Visible AssetPro controls and GemOne bidirectional messaging are not sufficient to implement them.[AP-DEMO §AP-EVID-CMD-001][GEM §Public architecture evidence]

## 10. Integration register (SCO-10)

**Rule:** “Observed” below means only that a named configuration/product surface was observed in AP-ENV-DEMO, or that GemOne publicly documented/claimed the capability. It does not establish an enabled connection or private API behavior.

| Integration / source | Evidence | Source → target / direction | Auth class | Cadence & freshness | Retry / reconciliation | Observability | Classification | Accountable owner | Readiness |
|---|---|---|---|---|---|---|---|---|---|
| Peplink | Company edit exposed Peplink OrgID | Unknown | Unknown; OrgID is not an auth contract | Unknown | Unknown | Unknown | Likely asset/location/config; confirm | Unassigned | BLOCKED—contract and use not corroborated |
| EBis | Site integration setting name observed | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unassigned | BLOCKED |
| TMA | Site integration setting name observed | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unassigned | BLOCKED |
| BMS | Site integration setting; GemOne BMS public hardware evidence | Likely battery/device data inbound, but AssetPro flow unknown | Unknown | Unknown | Unknown | Unknown | Device telemetry; potentially operational | Unassigned | BLOCKED |
| BYD | Site product/integration label observed | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Unassigned | BLOCKED |
| SmartFleet | API-token list/create UI and settings observed | Unknown; token UI implies an integration boundary only | Token class visible; scopes/storage/rotation unknown | Refresh-rate setting visible; semantics unknown | Unknown | Data-management Pending/Sent/Events may be relevant but unproven | Likely asset/device/telemetry | Unassigned | BLOCKED—do not create token |
| AssetPro import/migration | Explicit production gap; demo product map provides entities only | Legacy → TelemetryX proposed | Unknown | Unknown | Must support dry run, checkpoint, mapping quarantine, counts/hashes, restart | Proposed import/reconcile dashboards and alerts | May include personal, location, safety, financial data | Unassigned | BLOCKED |
| GemOne Cloud/API | Public integration/API claims; no reviewed public contract artifacts | Claimed multi-provider/business-system bidirectional possibilities; exact flow unknown | Unknown | “Real-time/near real-time” ambiguous; no SLA | Unknown | Unknown | Device/operator/location/safety data possible | Unassigned | BLOCKED—direct diligence required |
| Manual/operator entry | Current prototype/synthetic fixtures | User → TelemetryX | Future OIDC session | Transactional | User correction with audited supersession | Validation/audit metrics | Depends on domain | Product-domain owner | BLOCKED on identity/persistence |
| Reports/notifications | AssetPro scheduled delivery UI observed; current TLX gap | TelemetryX → recipients proposed | User + recipient policy | Scheduled | Idempotent occurrence; bounded delivery retry; bounce/revoke reconciliation | Delivery outcome, suppressions, alerting | May expose sensitive operational/personnel data | Unassigned | BLOCKED—no send in discovery |
| Evidence files | Legacy incident/report upload surfaces; architecture proposes object storage | User/source → object storage → authorized domain reference | OIDC/service identity | Transactional metadata; async scan | Quarantine/retry scan; hash reconciliation | Scan failures, access logs, retention jobs | Potential sensitive/personnel data | Security + domain owner | BLOCKED |

**Required next evidence for every adapter:** business and technical owner; active tenants; purpose/legal basis; source/target/direction; data dictionary; authentication class/scopes/rotation; sandbox; contract/version/deprecation; rate limits; cursor/pagination/webhook ordering; effective-time semantics; freshness SLO; dedupe/idempotency; retry/DLQ; reconciliation; observability; data classification/retention/residency; support SLA; exit/export plan. Never record secrets in this register.

## 11. Observability and operations

### 11.1 Required telemetry

- Structured logs: correlation/causation ID, build identity, module, tenant pseudonymous ID, job/adapter, outcome/error class; no tokens or sensitive payloads.
- Traces: HTTP → application command → database/outbox → worker → adapter, with sampling rules that protect sensitive data.
- Metrics: request latency/error; authorization denies; optimistic conflicts; idempotency hits/conflicts; queue age/depth; retry/DLQ; ingest lag; stale/partial entities; mapping failures; reconciliation discrepancies; report delivery; command states and time-in-state.
- Audit: actor/service, tenant/site, action, target, policy decision, before/after references, reason, timestamps, correlation, result; append-only and access-controlled.
- SLO-backed alerts: API availability/latency, queue age, ingestion freshness, reconciliation failures, audit/outbox publication lag, backup success/restore verification, and any command stuck/unknown state.

### 11.2 Support ownership

Before pilot, every module and integration needs a primary owner, backup owner, severity model, support hours, escalation contact, dashboard, runbook, rollback/disable path, customer-communication authority, and post-incident process. Provider ownership and data-quality ownership must be distinct where appropriate. Current accountable owners for legacy integrations, metric definitions, security, privacy, and device operations are **unassigned**, which is a production blocker.

## 12. Privacy and security minimums

The likely data set includes identity/contact data, operator certification/incidents, location/history, device identifiers, safety events, documents, costs, and support records. Classification and legal basis must be confirmed per field and use.

Required controls:

- enterprise OIDC/SSO and MFA policy; short-lived tokens; no shared AcgAdmin-style identity;
- least-privilege RBAC/ABAC with tenant/site/resource enforcement and negative authorization tests;
- tenant isolation tests at API, query, job, cache, object-storage, export, and observability boundaries;
- secrets manager, scoped service identities, rotation/revocation, and no secrets in code/logs/events;
- encryption in transit and at rest with owned key/backup policy;
- data minimization, purpose limitation, consent where required, retention/deletion/legal-hold rules, and subject/tenant export capability;
- object malware scanning, content type/size limits, hashes, quarantine, signed short-lived access;
- threat model covering IDOR, privilege escalation, cross-tenant jobs, webhook spoof/replay, file upload, supply chain, report exfiltration, command abuse, and agent prompt/tool abuse;
- dependency and secret scanning, patch/vulnerability process, penetration test before consequential production actions;
- vendor/subprocessor, residency, breach-notification, SLA, RPO/RTO, data-exit, and deletion evidence.

GemOne public evidence of TLS/privacy posture does not prove TelemetryX or a proposed integration has these controls; missing public assurance is a diligence gap, not proof of absence.[GEM §Security and privacy boundary]

## 13. Agentic-AI readiness

The current flow usefully distinguishes evidence, facts, confidence-labeled inferences, recommendation, tool proposal, human approval, and synthetic result. For a pilot, additionally require:

- approved use case and explicit non-goals; no autonomous device command;
- evaluation set representing stale, partial, conflicting, unavailable, and permission-denied evidence;
- baseline against human/current workflow; acceptance thresholds for factual grounding, citation/lineage, action selection, abstention, and unsafe-action rate;
- prompt/model/tool/version capture and reproducible evaluation;
- retrieval authorization before generation and again before action;
- evidence allowlist, provenance display, uncertainty/abstention, and no synthetic output presented as observed fact;
- prompt-injection and data-exfiltration tests across retrieved content and tool output;
- human approval with exact action/input preview; approval cannot authorize mutated inputs;
- incident/feedback loop, model rollback/disable, cost/latency budgets, and named owner.

Acceptable error and unit economics are currently undefined in SCO-20. Until measured, the agent is advisory only and its recommendations cannot be the sole basis for safety, personnel, financial, or device actions.

## 14. Production gates

### 14.1 Core gates for any bounded pilot

| Gate | Pass evidence | Owner required | Current state |
|---|---|---|---|
| G0 Scope, tenant, and safety envelope | Named pilot tenant/site/users; approved data/actions/non-actions; environment separation; rollback/stop criteria | Product + customer/data owner | BLOCKED |
| G1 Identity and authorization | OIDC/MFA; canonical permissions; server-side tenant/site enforcement; lower-role and cross-tenant negative tests; approval policy | Security + backend | BLOCKED |
| G2 Canonical domain and persistence | Reviewed schema/migrations; stable IDs/mappings; invariants; optimistic concurrency; money/time rules; backup and witnessed restore | Backend + data owner | BLOCKED |
| G3 Audit and evidence integrity | Atomic actor-attributed audit/outbox; append-only controls; evidence hash/access/retention; audit query/export test | Security/compliance + backend | BLOCKED |
| G4 Data lineage and freshness | Source contracts; effective/received/processed times; fresh/stale/partial/conflict semantics; lineage query; skew/late/duplicate tests | Data/product | BLOCKED |
| G5 Integration safety | Adapter contract; scoped credentials; sandbox; rate/retry/DLQ; mapping quarantine; successful bounded reconciliation; disable switch | Integration owner | BLOCKED |
| G6 Transaction/idempotency correctness | Database concurrency tests; tenant-scoped idempotency hash/result; inbox/outbox replay tests; no partial mutation under injected failure | Backend | BLOCKED |
| G7 Observability and support | Build identity, logs/traces/metrics, SLOs/alerts, dashboards, owners/runbooks/on-call, incident drill | SRE/support + module owners | BLOCKED |
| G8 Privacy and security | Classification/legal basis/retention; threat model; secret/dependency scans; tenant isolation; vendor review; security test findings resolved | Security/privacy | BLOCKED |
| G9 Pilot quality and recovery | CI gates; accessibility/browser/load baseline; deploy/rollback; migration dry run; backup restore; reconciliation and support drills | Quality + operations | BLOCKED |

### 14.2 Additional gates by capability

| Gate | Applies when | Pass evidence | Current state |
|---|---|---|---|
| G10 Metric/report authority | Displaying metrics as authoritative or sending reports | Versioned formula/owner/source/window/timezone/freshness; golden-data tie-out; late/correction reconciliation; recipient governance | BLOCKED |
| G11 Agentic assistance | AI recommendation/tool proposal enabled | Approved evaluation and thresholds; grounded lineage; permission/prompt-injection tests; abstention; human oversight; model/tool rollback; cost budget | BLOCKED |
| G12 Consequential/device action | Any external write, report send, or device command | SCO-7 contract; allowlisted sandbox target; dual authorization as required; idempotency/provider acknowledgement proof; ambiguity/recovery drill; kill switch; physical/operational owner | **PROHIBITED / BLOCKED** |

**Gate authority:** Product approves scope/outcomes; customer/data owner approves tenant/data/use; Security/Privacy approve control and processing posture; backend/data/integration owners attest contract tests; Operations accepts support and recovery; product + technical safety owners jointly authorize any consequential-action envelope. No single demo owner can waive G12.

## 15. Pilot gap and next-evidence backlog

| Priority | Gap / question | Next evidence action | Suggested owner | Traceability |
|---|---|---|---|---|
| P0 | Persona, tenant, success measure, and allowed pilot actions undefined | Name pilot envelope and decision owner; keep read-only by default | Product/customer | SCO-20; Q-001/Q-002/Q-006 |
| P0 | Tenant/role/service/product/site entitlements unproven | Use authorized synthetic/lower-role accounts; test direct-route/API denies; define canonical permissions | Security/backend | SCO-18/SCO-6; AP-EVID-ROLE-001 |
| P0 | No durable backend or isolation | Schema/transaction design review; build one vertical tracer with cross-tenant/concurrency/failure tests | Backend | G2/G6 |
| P0 | Device command semantics unknown | Obtain provider contract and owner; complete SCO-7 on non-live test target only after separate approval | Device operations/security | SCO-7; AP-EVID-CMD-001 |
| P0 | Named legacy integrations lack contracts/owners | Interview system owners and gather redacted contracts/config docs; do not inspect PHX/Kenco | Integration owner | SCO-10; AP-EVID-INT-001 |
| P0 | Metric formulas/lineage/freshness unknown | Metric-owner workshops plus source-level golden examples and reconciliation proofs | Product/data | SCO-11; AP-EVID-MET-001 |
| P0 | Privacy/security/support posture absent | Data inventory, threat model, vendor review, support/RTO/RPO decision, restore/incident drills | Security/privacy/operations | SCO-20 |
| P1 | Raw ingestion ordering/dedupe/clock behavior unknown | Provider diligence: buffering, sequence IDs, clock sync, webhooks/polling, correction/export | Data/integration | GEM diligence Q4 |
| P1 | Report recipient governance undefined | Define consent, domains, approval, preview, revoke, bounce, retention, audit; use sink mailbox in tests | Product/security | AP-EVID-RPT-001 |
| P1 | AI acceptable error and economics undefined | Create evaluation set/baseline/thresholds; measure cost/latency and human review burden | AI/product | SCO-20 |
| P1 | Data migration and portability unknown | Dry-run import with synthetic/redacted export; mapping/quarantine/count/hash/restart/reconcile evidence | Data/integration | Product scope gap |
| P2 | Service decomposition criteria not measured | Capture load, ownership, deploy, and reliability evidence during modular-monolith pilot | Architecture | D-004 |

## 16. Recommended smallest pilot sequence

1. **Synthetic vertical tracer:** OIDC test identities → tenant-scoped asset read → investigation → approved synthetic vendor lookup → work-order transition → inventory reservation/issue → atomic audit/outbox; inject duplicate, conflict, stale, partial, denied, and worker-failure cases.
2. **Read-only external pilot:** one approved provider/source, one tenant/site, no personnel-sensitive fields unless necessary, no reports or commands; ingest to raw/normalized stores; demonstrate freshness, quarantine, reconciliation, disable, deletion/export, and support runbook.
3. **Controlled internal write:** only after G0–G11, write to a non-production sandbox/system under an approved reversible test, with idempotency and reconciliation evidence.
4. **Device command:** separate program after G12; never an automatic extension of the read-only pilot.

## 17. Decisions and handoff

### Decisions reinforced

- Retain the **modular monolith** default; no service split is justified.
- Keep external providers behind adapters and internal canonical contracts.
- Treat current code as executable domain examples, not production enforcement.
- Default first pilot to **read-only** and synthetic/non-integrated demo to explicitly non-production.
- Keep device commands disabled and prohibited pending SCO-7 plus a separately approved test envelope.
- Treat all metric formulas, private API mechanics, freshness SLAs, legacy integration ownership, and lower-role enforcement as unknown until evidenced.

### Exact handoff

- **WS3/backend:** turn the boundary proposal into reviewed aggregate/schema/transaction contracts and one durable vertical tracer.
- **WS6/security/quality:** convert G1, G6, G8, and G9 into automated and witnessed operational tests.
- **Product/data owners:** resolve metric definitions, acceptable error, pilot outcome, and authoritative/advisory source policy.
- **Integration/device operations:** assign owners and obtain contract-level evidence for one bounded read-only adapter; complete SCO-7 separately.
- **Integration owner:** link this artifact to SCO-20 and keep unresolved items in the shared register/decision log rather than inferring answers.

## References

- `[ARCH]` `docs/ARCHITECTURE.md`
- `[SCOPE]` `docs/PRODUCT_SCOPE.md`
- `[CODE]` `src/domain/investigation.ts`, `src/domain/work-orders.ts`, `src/domain/inventory.ts` and corresponding tests
- `[DEC]` `docs/agent-storm/DECISION-LOG.md`
- `[REG]` `docs/agent-storm/REGISTERS.md`
- `[AP-DEMO]` `docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md`
- `[AP-PHX]` `docs/evidence/AP-ENV-PHX-redacted-safety-checkpoint.md`
- `[AP-KENCO]` `docs/evidence/AP-ENV-KENCO-redacted-safety-checkpoint.md`
- `[GEM]` `docs/evidence/GemOne-public-product-technical-market-assessment.md`
- `[SCO-20]` Linear issue SCO-20, technical/data/security/agentic-AI readiness acceptance criteria
- `[SCO-7]` Linear issue SCO-7, device-command safety contract
- `[SCO-10]` Linear issue SCO-10, legacy integrations and data flows
- `[SCO-11]` Linear issue SCO-11, metric provenance and freshness contracts
