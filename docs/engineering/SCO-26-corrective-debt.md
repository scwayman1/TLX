# SCO-26 corrective-debt engineering note — decision plan reimplementation

**Scope:** bounded synthetic safe-response decision plan (SCO-26) and the structural debt it exposed.
**Baseline:** `main` at `aae5ffb`. **Reference implementation under review:** PR #6 (`feat/sco-26-decision-plan`, head `d14e9bf`, draft — left untouched).
**Status labels:** everything below describes synthetic demo behavior only. Nothing here is production authentication, authorization, RBAC, tenant enforcement, a durable audit store, or a live integration.

## 1. Disposition decision: reimplement, salvaging PR #6's tests and contract ideas

**Decision:** Reimplement the decision-plan slice cleanly from the `main` baseline on a new branch. Salvage PR #6's validated *contract ideas* (two options, typed error codes, frozen approver policy, deterministic clock/IDs, fail-closed payload comparison) and its *adversarial test cases* as inputs, but do not cherry-pick its commits. PR #6 remains a draft for human disposition; the recommendation is to close it in favor of the corrected PR.

**Why not salvage the commits:** three independent fail-closed reviews found defects that are ordering and trust-boundary problems, not typos. The replay short-circuit sits *before* validation; the audit ledger lives inside caller-mutable plan state; the identity model is contradictory at the product level (Dana Foster displayed, `user-scott` enforced); the ID scheme leans on `encodeURIComponent` over an unconstrained key domain; and the timeline integration is non-idempotent and truncating. Patching those in place is how cycles 1 and 2 already failed. A clean module with the validation pipeline in the right order is smaller than a third patch layer.

**Why not defer:** the product decision (WS7 § 10, D-008/D-009 intent) approved this exact bounded slice, the baseline is green, and every blocker is closable with local, testable contracts. No blocker requires production architecture.

## 2. Root causes (not symptoms) behind the PR #6 blocker classes

| # | Blocker class | Root cause |
|---|---|---|
| 1 | Replay integrity bypass | The idempotent-replay check ran first because the audit ledger (`events`) lives in the same caller-mutable object as display state, and "replay" was modeled as *lookup* rather than *revalidated command acceptance*. |
| 2 | Approver contradiction (Dana vs Scott) | Two product identities were never reconciled: fixture copy names Dana Foster "decision owner" while the entire interactive persona (avatar SW, thread turn, `user-scott`, "Approved by Scott") is Scott Wayman. Cycle-2 changed the policy but not the displayed product truth. |
| 3 | Inconsistent synthetic-actor disclosure | Actor display strings are duplicated ad hoc across surfaces instead of derived from one persona fixture, so qualifiers drift. |
| 4 | Misclassified typed errors | Error *codes* existed but the UI had only two message slots (option, rationale), so authorization/integrity failures were forced into the nearest field. |
| 5 | Undefined idempotency-key grammar | The key domain was never specified, so "encode whatever arrives" (`encodeURIComponent`) substituted for validation and imported `URIError` as an escape hatch. |
| 6 | Operating Memory append defects | Integration was modeled as "append the last event" instead of "idempotently reconcile a ledger into a timeline"; per-kind counters made replays mint new IDs. |
| 7 | Tool-run ID collision | ID derived from (investigation, tool name) only — the identity of a *proposal* was conflated with the identity of a *tool*. |
| 8 | Unsafe type escapes | Initial timeline construction wanted sequence-aware IDs but the helper demanded a full state object, so strings were cast instead of constructing typed state. |
| 9 | Documentation overstatement | Docs were written from intent, updated before adversarial verification. (Same class exists on `main`: WS6's reconciliation note claims CI runs the production dependency audit; `.github/workflows/ci.yml` has no audit step.) |

## 3. Contract (the smallest sturdy version)

- **Fixture module** `src/domain/demo-fixture.ts` (neutral; no domain imports): fixed demo clock `DEMO_CLOCK_ISO`, and one synthetic persona (`user-scott`, "Scott Wayman", qualifier "synthetic persona — not authenticated"). A fixture persona is not authentication.
- **Identity coherence:** Scott Wayman is the single active synthetic persona and the required approver for both options. Every decision surface (mission-control card, thread turn, approval box, option cards, recorded panel, timeline) derives name/qualifier from the fixture, and the approver display derives from the frozen policy, not duplicated strings. Dana Foster remains only the WO-24091 repair assignee.
- **Idempotency-key grammar (canonical):** `decision:<workOrderIntentId>:<label>` with `workOrderIntentId = WO-[0-9]{1,10}` and `label = [a-z0-9][a-z0-9-]{0,62}`. ASCII-only by construction; the key's embedded work-order ID must equal the command's `workOrderIntentId`. Violations throw typed `invalid_idempotency_key`. Event ID = `decision-<key>` (injective: fixed prefix over a validated charset; no encoding step exists to throw).
- **`recordDecisionPlan` validation order (fail-closed):** (1) key grammar + key↔work-order consistency → (2) canonical option existence (frozen canon *and* present in plan) → (3) authorization against the frozen `SYNTHETIC_APPROVER_POLICY` (never from plan/event state) → (4) non-empty trimmed rationale → (5) ledger integrity: every prior event ID must be canonical for its key and unique → (6) only then: same key + equal payload = no-op replay; same key + different payload = `idempotency_conflict`; new key whose derived ID collides = `audit_integrity`.
- **Operating Memory integration** `integrateDecisionEvents(investigation, events)`: validates every event (canonical ID, authorized actor, non-empty fields), integrates **all** unintegrated events deterministically in ledger order, is idempotent (timeline entry ID `decision.recorded-<event.id>`; re-integration is a no-op), and fails closed (`audit_integrity`) on an ID collision with different content. Never truncates to the last event.
- **Determinism:** no module-global counters, `Date.now`, `Math.random`, or locale-dependent identity anywhere in the bounded flow. Initial timeline is a typed literal (no casts). Appended timeline IDs derive from typed per-kind sequence in the investigation's own state. Tool-run IDs are `TOOL-<investigationId>-<seq>` where seq counts prior `tool.proposed` events — unique per proposal, identical across identical flows.
- **Errors → UI regions:** `unknown_option` → option region; `rationale_required` → rationale region; `authorization_denied`, `idempotency_conflict`, `audit_integrity`, `invalid_idempotency_key` → a distinct decision-integrity alert region with code-specific text. All regions use `role="alert"` plus `aria-invalid`/`aria-describedby` on the associated control where one exists. Unexpected errors rethrow and fail visibly.
- **Boundaries:** rejection path never renders decision controls; recording renders the explicit "Reservation/purchase not executed · no supplier was contacted" (expedite) / workspace-only (reschedule) statements; `reservationExecuted` stays `false`.

## 4. Invariants and threat cases → acceptance matrix

Every invariant below maps to at least one automated test in `src/domain/decision-plan.test.ts` (D), `src/domain/investigation.test.ts` (I), or `src/App.test.tsx` (U).

| Invariant | Threat case | Test |
|---|---|---|
| Replay is revalidated command acceptance | Forged event ledger + matching command from unauthorized actor | D: forged replay fails `authorization_denied` |
| Replay requires canonical event identity | Event with matching key but non-canonical ID | D: fails `audit_integrity` |
| Option must exist canonically and in plan | Tampered/emptied option list | D: fails `unknown_option` |
| Same key + different payload fails closed | Rationale/option/actor/WO drift under one key | D: `idempotency_conflict` for each field |
| Ledger uniqueness | Duplicate pre-existing event IDs | D: fails `audit_integrity` |
| Key grammar enforced, no untyped escapes | empty / whitespace / malformed / delimiter-confusing / lone-surrogate keys | D: each throws typed `invalid_idempotency_key` (never `URIError`) |
| Injective event IDs | Distinct keys sharing suffixes | D: distinct IDs |
| Authorization from frozen policy only | Options mutated to name another approver | D: tamper test, `authorization_denied` |
| Timeline integration idempotent + complete | Repeated append; two unintegrated decisions | D: no duplicates; both integrated, order deterministic |
| Tool proposal identity | Same tool, different purpose/input in one investigation | I: distinct IDs; identical flows identical IDs |
| Deterministic audit records | Reset/replay, close/reopen, parallel instances | I + U: complete timeline equality |
| No wall clock / randomness in flow | — | I: fixed timestamps; source scan in review |
| Persona/policy/display agreement | Approver display vs recorded actor | U: Scott Wayman + qualifier everywhere; `user-dfoster`/Dana never an approver |
| Distinct accessible error regions | Each `DecisionPlanErrorCode` | U: per-code region/message assertions |
| Rejection is safe terminal | Rejected lookup | U: no decision controls render |
| Unselected/empty submissions fail safely | No option; no rationale | U: accessible errors; nothing recorded |
| Keyboard-only path | — | U: full keyboard decision flow |
| Boundary truth | — | U: no-reservation/no-purchase/no-contact statements visible; no "Reserved" |

## 5. Baseline verification (branch point, before changes)

Recorded 2026-08-23 on `claude/telemetryx-corrective-debt-dhhgbh` = `aae5ffb`:

- `npm ci` — clean install, exit 0
- `npm run lint` — oxlint, exit 0
- `npm test -- --run` — 5 files passed, 24 tests passed
- `npm run build` — tsc -b + vite, 1,806 modules, exit 0
- `npm audit --omit=dev --audit-level=high` — found 0 vulnerabilities
- `git diff --check` — clean

## 6. Complementary debt taken / deferred

**Taken in this change (small, exposed by the corrected flow, testable, reversible):** persona/approver copy derived from one fixture; decision panel isolated in its own module instead of growing `App.tsx`; accessible name for the mission-control calendar icon button; removal of the runtime Google Fonts request (system-font fallback already declared) with a no-external-URL source test; `.gitignore` coverage for env/credential/key files; CI gains the production dependency audit step its documentation already claims.

**Deferred (see PR body follow-up register):** gitleaks/CodeQL/dependency-review/a11y CI jobs, contrast token remediation, dialog focus trapping, App.tsx decomposition beyond the decision panel, coverage thresholds, Node version pinning.
