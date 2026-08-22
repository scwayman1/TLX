# WS4 Frontend Vertical Slice — Strict TDD Implementation Brief

**Linear:** SCO-19  
**Phase:** reconnaissance and implementation brief only; no product code changed  
**Objective:** make the existing TRL-443 exception flow coherent and demo-ready with the fewest new behaviors and no broad refactor.

## Outcome to implement

Use the existing TRL-443 path as the only tracer:

1. Fleet manager identifies the safety-critical brake exception in Mission control.
2. Fleet manager opens the grounded investigation and sees evidence, freshness, ownership, and the `Out of service` safety boundary.
3. Fleet manager approves and runs the existing **synthetic** vendor lookup.
4. Fleet manager starts the existing `WO-24091` maintenance response.
5. Fleet manager records a **simulation-only reservation** for the quoted BA-14TL assembly; the UI explicitly says no supplier was contacted and no purchase was placed.
6. The same workspace shows work-order status, reservation status, decision owner, safety state, and actor-attributed audit history.
7. Fleet manager resets the demo to the exact initial state.

The slice must stop before repair completion or return to service. Those outcomes are not evidenced and the required repair task remains incomplete.

## Reconnaissance findings

### What already works and should be reused

- `src/App.tsx` already supplies the correct entry point, persistent synthetic-data banner, TRL-443 priority card, investigation workspace, human approval/rejection, visible synthetic tool result, and responsive shell.
- `src/domain/investigation.ts` already enforces `Proposed -> Approved -> Completed` and records actor-attributed timeline events. Execution before approval throws `Human approval required`.
- `src/domain/work-orders.ts` already has immutable work-order state, an audited `START` transition, and a completion guard for incomplete required tasks.
- `src/domain/inventory.ts` already demonstrates immutable, idempotent inventory mutation and audit events, but only for issuing internally stocked `PART-HF320` to `WO-24088`.
- Existing tests cover shell navigation, asset details, keyboard opening/closing, investigation approval gating, work-order start/audit, completion guard, inventory issue/idempotency, and the fact that BA-14TL is not internally reserved.
- Baseline on 2026-08-22: `npm run lint` passed; `npm test -- --run` passed (4 files, 16 tests); `npm run build` passed (1,806 modules transformed).

### Coherence gaps on the critical path

1. **Dead end:** after the vendor lookup, `Prepare action plan` only raises a toast and changes no state.
2. **Split sources of truth:** the work-order table is a static `orders` array while audited operations state exists separately in `src/domain/work-orders.ts`.
3. **No reservation model:** inventory supports issuing internal stock, not recording a synthetic vendor quote reservation. Pretending BA-14TL is internal stock would contradict the investigation evidence and the existing UI test.
4. **No unified resolution view:** owner, asset safety state, work order, reservation, and audit records are not shown together.
5. **No deterministic reset:** local UI state can be dismissed, but there is no one action that restores investigation, work order, inventory/reservation, navigation, selections, filters, and notices.
6. **Freshness is buried:** evidence timestamps render, but the workflow does not call out whether the evidence is current enough for the decision.
7. **The work-order fixture conflicts with the desired transition:** `WO-24091` begins `In progress`, so the existing audited `START` command cannot be demonstrated. The smallest coherent correction is to begin this synthetic demo work order as `Open`, then start it after evidence review.

### State coverage decision

Do not add a generic state playground or fake asynchronous toggles.

- **Permission:** material and already represented by the approval gate; preserve and strengthen it in the end-to-end test.
- **Success:** material; represent started work order and recorded simulation-only reservation.
- **Empty:** material as `No BA-14TL assemblies on hand`; keep it visible.
- **Partial/stale:** material as decision context; label the vendor result as one synthetic quote and show evidence observation time/freshness. Do not imply broad supplier coverage.
- **Loading/error:** not material to a synchronous local fixture. Adding spinners or failure switches would be demo-only scope. Record production network/error handling as a gap instead.

## Smallest code change set

### 1. `src/domain/work-orders.test.ts` then `src/domain/work-orders.ts`

- Change only the synthetic `WO-24091` initial status from `In progress` to `Open`.
- Reuse the existing `START` command and audit event; do not add new lifecycle states or commands.
- Keep the incomplete `brake-repair` task and completion guard unchanged.

### 2. `src/domain/inventory.test.ts` then `src/domain/inventory.ts`

Add the smallest explicit reservation contract without changing the existing internal-stock issue behavior:

- `InventoryReservation` with stable ID, part ID, work-order ID, quantity, source label, actor ID, idempotency key, `simulationOnly: true`, and status `Reserved`.
- `InventoryState.reservations` initialized empty.
- `reserveQuotedPart(state, command)` that validates positive integer quantity, is idempotent, appends one reservation and one `inventory.quote_reserved` audit event, and does **not** alter internal balances, add a purchase transaction, or claim external execution.
- The command should require a source/quote label supplied by the already completed lookup. Do not embed networking, timers, procurement, or vendor APIs.

This names the demo behavior honestly: a reservation is recorded in the synthetic workspace against a quote; no supplier-side hold is claimed.

### 3. `src/App.test.tsx` then `src/App.tsx`

- Initialize `OperationsState` and `InventoryState` once from their demo factories at the `App` boundary.
- Replace the static `WO-24091` status displayed on the critical path with the corresponding live operations-state value. The other table rows may remain static.
- Replace the post-tool toast-only action with a compact `Resolution plan` panel in the investigation workspace.
- Before the approved lookup completes, expose neither `Start maintenance response` nor `Record synthetic reservation`.
- After lookup completion, show `WO-24091`, owner Dana Foster, asset state `Out of service`, one-quote/partial-evidence label, and `Start maintenance response`.
- Starting the response calls `transitionWorkOrder(..., 'START', 'user-dfoster')`; display `In progress` and its audit event.
- Only after the work order is in progress, expose `Record synthetic reservation`. It calls `reserveQuotedPart` with a stable idempotency key and displays `Reserved in synthetic workspace`, plus `No supplier contacted · No purchase placed`.
- Render a single chronological audit list by combining the investigation timeline, work-order audit events, and reservation audit events for this displayed workflow. Sorting may use existing event timestamps; no new generic event bus is needed.
- Add a clearly named `Reset synthetic demo` button in the investigation header. Its handler recreates the initial investigation/operations/inventory states and clears transient shell state. Keep it local; no persistence or page reload.
- Preserve the existing rejection path. A rejected lookup must not reveal reservation controls.

Implementation constraint: do not extract a component tree or state-management layer unless a passing test demonstrates an actual need. A small local helper/factory in `App.tsx` is preferable to introducing context, reducers, routing, or a store.

### 4. `src/investigation.css`

- Add only styles needed for the resolution panel, audit list, freshness/partial label, and reset action.
- Reuse existing badge, panel, button, and breakpoint patterns.
- At `<=760px`, keep actions stacked/full-width and avoid horizontal overflow.
- Preserve visible keyboard focus and reduced-motion behavior already provided by the application styles; do not redesign the shell.

### Files not expected to change

- `src/main.tsx`
- `src/domain/investigation.ts` and `src/domain/investigation.test.ts` unless an observed RED test proves an investigation contract is missing
- `src/index.css`
- build/tooling configuration and dependencies

## Strict test-first tracer sequence

Each tracer is one RED -> GREEN cycle. Do not write all tests first. For every RED, confirm the failure is the named missing behavior rather than a selector/type/setup error. After each GREEN, run the focused test again and then the complete relevant test file.

### Tracer 1 — the demo work order can actually be started

**RED** — in `src/domain/work-orders.test.ts`, add one focused test asserting that initial `WO-24091` is `Open`, `START` changes it to `In progress`, and the final audit event is actor-attributed to `user-dfoster`.

```bash
npm test -- --run src/domain/work-orders.test.ts -t "starts the TRL-443 maintenance response"
```

Expected RED: current fixture is `In progress`, so `START` throws `Only open work orders can be started`.

**GREEN** — change only `WO-24091` initial status to `Open`; reuse `transitionWorkOrder` unchanged.

```bash
npm test -- --run src/domain/work-orders.test.ts -t "starts the TRL-443 maintenance response"
npm test -- --run src/domain/work-orders.test.ts
```

### Tracer 2 — a quoted part can be reserved without inventing stock or procurement

**RED** — in `src/domain/inventory.test.ts`, add one test using the wished-for `reserveQuotedPart` API. Assert:

- one BA-14TL reservation exists for `WO-24091`;
- `simulationOnly` is `true` and status is `Reserved`;
- internal balances and purchase/issue transactions are unchanged;
- the audit event is `inventory.quote_reserved` and actor-attributed.

```bash
npm test -- --run src/domain/inventory.test.ts -t "records a simulation-only quoted-part reservation"
```

Expected RED: `reserveQuotedPart` and reservation state do not exist.

**GREEN** — add only the types, empty collection, validation, immutable append, and audit event needed by the test.

```bash
npm test -- --run src/domain/inventory.test.ts -t "records a simulation-only quoted-part reservation"
npm test -- --run src/domain/inventory.test.ts
```

### Tracer 3 — reservation retries are safe

**RED** — add a separate inventory test that applies the exact same reservation command twice and expects one reservation and one audit event.

```bash
npm test -- --run src/domain/inventory.test.ts -t "makes quoted-part reservation retries idempotent"
```

Expected RED: the minimal tracer-2 implementation appends twice unless it already copied the issue-command idempotency behavior.

**GREEN** — add the smallest idempotency-key guard. Do not add cancellation, expiration, purchasing, or balance allocation.

```bash
npm test -- --run src/domain/inventory.test.ts -t "makes quoted-part reservation retries idempotent"
npm test -- --run src/domain/inventory.test.ts
```

### Tracer 4 — the clickable path advances response and reservation

**RED** — in `src/App.test.tsx`, use `userEvent` for one end-to-end behavior test:

1. open `Investigate with agent`;
2. verify no start/reserve control exists before approval;
3. approve and run the synthetic lookup;
4. verify owner Dana Foster, `Out of service`, and partial/one-quote wording;
5. start `WO-24091` and observe `In progress` plus the work-order audit label;
6. record the synthetic reservation and observe `Reserved in synthetic workspace`, `No supplier contacted`, and the reservation audit label.

```bash
npm test -- --run src/App.test.tsx -t "moves the TRL-443 exception into an audited response plan"
```

Expected RED: the current flow ends at a toast-only `Prepare action plan`; no live work-order/reservation UI exists.

**GREEN** — wire the two existing/new domain commands into local `App` state and render the minimum resolution/audit UI. Do not redesign unrelated pages.

```bash
npm test -- --run src/App.test.tsx -t "moves the TRL-443 exception into an audited response plan"
npm test -- --run src/App.test.tsx
```

### Tracer 5 — rejection remains a safe terminal branch

**RED** — add one UI test that rejects the proposed lookup and asserts `No tool activity occurred` while start/reservation controls remain absent.

```bash
npm test -- --run src/App.test.tsx -t "does not offer a reservation after the vendor lookup is rejected"
```

Expected RED: the rejection message already passes, but the new implementation may expose controls based only on workspace presence. If the entire test passes immediately, delete or strengthen it until it proves the missing guard before adding production code.

**GREEN** — gate resolution actions strictly on completed tool status, not merely on an investigation existing.

```bash
npm test -- --run src/App.test.tsx -t "does not offer a reservation after the vendor lookup is rejected"
npm test -- --run src/App.test.tsx
```

### Tracer 6 — reset is deterministic

**RED** — add a UI test that completes the tracer, clicks `Reset synthetic demo`, and asserts:

- Mission control is shown;
- `WO-24091` is back to `Open`;
- no reservation/audit success from the prior run remains;
- reopening the investigation starts at `Human approval required`.

```bash
npm test -- --run src/App.test.tsx -t "resets the synthetic exception workflow deterministically"
```

Expected RED: no reset control exists and domain state is not owned at the app boundary.

**GREEN** — recreate all demo factories and clear transient UI state in one named reset handler.

```bash
npm test -- --run src/App.test.tsx -t "resets the synthetic exception workflow deterministically"
npm test -- --run src/App.test.tsx
```

### Tracer 7 — keyboard path remains usable

**RED** — add one focused interaction test using `userEvent.tab()` and `userEvent.keyboard('{Enter}')` to reach and activate the critical-path actions in order. Assert the same visible state changes; do not test CSS implementation details.

```bash
npm test -- --run src/App.test.tsx -t "supports the resolution actions from the keyboard"
```

Expected RED: any newly introduced non-semantic/click-only control or poor focus order is exposed. If semantic buttons make this pass immediately, no production change is justified; retain accessibility verification as a manual gate rather than manufacturing code.

**GREEN** — use native buttons, explicit accessible names, logical DOM order, and focus placement only where the failing test requires it.

```bash
npm test -- --run src/App.test.tsx -t "supports the resolution actions from the keyboard"
npm test -- --run src/App.test.tsx
```

## Dependency and commit order

1. **Confirm contracts before coding:** WS2 must accept the labels/action order; WS3 must accept the simulation-only quote reservation semantics and audit action. DEP-003 is currently open. Do not silently promote this brief into the missing contract.
2. Domain work-order fixture tracer.
3. Domain reservation + idempotency tracers.
4. UI end-to-end tracer and rejected branch.
5. Deterministic reset.
6. Keyboard/responsive styling and verification.
7. Full quality gates and demo rehearsal.

Keep commits dependency-first and small enough to revert independently. Do not mix unrelated shell cleanup or visual redesign into these changes.

## Non-goals

- No real vendor, AssetPro, telematics, procurement, inventory, or device integration.
- No supplier hold, purchase order, invoice, payment, email, or external communication.
- No real device command or implication that one occurred.
- No repair completion, work-order completion, asset return to service, or safety clearance.
- No authentication, RBAC, tenant enforcement, backend, persistence, routing, global store, event bus, or API layer.
- No generic loading/error/state simulator, demo control panel, broad fixture rewrite, or additional asset/work-order flows.
- No component-library migration, App decomposition campaign, CSS redesign, dependency addition, or unrelated accessibility refactor.
- No claim that a synthetic quote reservation is production-ready or supplier-authoritative.

## Verification commands

Run focused RED/GREEN commands exactly as listed above, preserving console output as TDD evidence. Before handoff, run:

```bash
npm run lint
npm test -- --run
npm run build
```

Then perform a manual 760px-or-narrower rehearsal and keyboard-only rehearsal:

1. Mission control -> TRL-443 investigation.
2. Approval -> synthetic lookup.
3. Start maintenance response -> record synthetic reservation.
4. Confirm owner, `Out of service`, one-quote/partial context, audit entries, and no-purchase disclosure remain visible without horizontal scrolling.
5. Reset and repeat; confirm the initial state is identical.
6. Reject on a fresh run; confirm there is no start/reserve path.

Record actual command results and the witnessed failure reason for each RED in the eventual PR. A test that passes on first execution is not TDD evidence and must not trigger speculative production changes.

## Risks, assumptions, and escalation

- **Contract dependency:** WS1/WS2/WS3 outputs were not present under `docs/agent-storm/outputs` during reconnaissance. This brief therefore proposes, but does not decide, UI wording and quote-reservation semantics.
- **Claim risk:** “Reserved” is easily mistaken for a supplier-side commitment. The visible qualifier `in synthetic workspace` and `No supplier contacted · No purchase placed` is mandatory.
- **Fixture consistency:** changing `WO-24091` to `Open` must update every displayed status source on the critical path; leaving the static dashboard/table at `In progress` is unacceptable.
- **Audit chronology:** the current domain factories use wall-clock/random IDs. Reset state is deterministic in meaning, not byte-for-byte identity. Do not broaden this slice into clock/ID infrastructure unless tests prove it is required.
- **Escalate rather than implement** if contract owners require supplier-authoritative reservation, real procurement, production permissions, a new work-order lifecycle, or a broad application-state refactor.

## Handoff

WS2/WS3 should approve or amend the two proposed contracts: (1) `WO-24091` begins `Open` and is started after evidence review, and (2) BA-14TL reservation is simulation-only workspace state against one synthetic quote, with no supplier or purchase side effect. Once accepted, WS4 can execute the tracers above without widening the slice.
