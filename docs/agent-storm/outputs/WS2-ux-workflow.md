# WS2 — UX, workflow, and demo interaction contract

**Workstream:** WS2 — UX, workflow, and design system  
**Linear context:** SCO-19, SCO-15, SCO-21  
**Reviewed:** 2026-08-22  
**Primary user:** fleet manager / operational supervisor  
**Primary job:** move an ambiguous asset exception from signal to verified resolution without losing context, ownership, safety boundaries, or evidence.  
**Demo boundary:** synthetic data and adapters only; no production integration, purchase, report send, or device command.

## Executive finding

The current product has a strong **signal → grounded investigation → human approval → visible synthetic lookup result** spine. That spine is coherent, legible, safety-aware, and covered by interaction/domain tests. It does **not yet prove exception-to-resolution**: `Prepare action plan` ends in a transient preview toast; investigation state is not connected to the existing work-order or inventory domain state machines; no required part is reserved; no repair/verification step exists; and the asset never returns to service.

The highest-value design move is therefore not broader visual polish. It is to connect one auditable vertical slice:

> **TRL-443 safety exception → evidence review → approved vendor lookup → accountable response decision → work order + explicit external-part hold → repair evidence → human return-to-service verification.**

Everything not advancing that job should be removed from the rehearsal path, made visibly noninteractive, or deferred.

## Evidence posture and verification status

### Verified in repository/runtime gates

- The mission-control priority card identifies TRL-443, names Dana Foster as decision owner, and offers `Review asset` and `Investigate with agent` (`src/App.tsx:96-115`).
- The investigation separates facts from confidence-labeled interpretation, exposes source/freshness cards, requires approval before the synthetic vendor adapter can run, and records timeline events (`src/App.tsx:119-127`; `src/domain/investigation.ts:44-74`).
- Approval, rejection, and execution guards are covered by tests (`src/App.test.tsx:33-41`; `src/domain/investigation.test.ts:15-51`).
- The inventory screen explicitly says `External quote pending` and does not claim the unavailable BA-14TL assembly is internally reserved (`src/App.tsx:143-149`; `src/App.test.tsx:43-48`).
- Work-order transitions and inventory issue transactions have actor-attributed audit behavior in pure domain modules, but are not connected to the UI (`src/domain/work-orders.ts:18-47`; `src/domain/inventory.ts:26-60`).
- Focus-visible and reduced-motion foundations exist (`src/index.css:2-3`).
- Verification run on 2026-08-22: `npm run lint` passed; `npm test -- --run` passed (4 files, 16 tests); `npm run build` passed (1,806 modules transformed).

### Simulated or preview-only behavior

- All product records, telemetry, vendor output, workspace status, ownership, dates, counts, and audit events are synthetic fixtures.
- The vendor lookup is a synthetic adapter. `Run approved tool` injects a fixed string; it does not contact a vendor (`src/App.tsx:119-126`).
- `Prepare action plan`, workbench, exports, create actions, recommendation review, reports, asset work-order creation, and investigation steering only emit `Simulated preview` toasts; they do not create or mutate domain records (`src/App.tsx:49,81,98,112,126,132,150,152`).
- Current work-order and inventory domain mutations are verified unit behavior, not verified screen behavior.
- The banner correctly says actions are simulated and no production systems are connected (`src/App.tsx:85-87`).

### Not verified in this review

- A live visual, keyboard, screen-reader, zoom, axe, browser-matrix, or physical-device pass. Browser automation was blocked by Chrome's user-controlled `Allow remote debugging` prompt; this review did not bypass or accept that permission.
- Runtime behavior at 320/375/768/1024/1440 px, 200%/400% zoom, high contrast, or forced colors.
- Contrast below is a static token calculation, not a full rendered-page audit.

## 1. End-to-end workflow map

| Step | User intent | Required interaction and visible proof | Consequential boundary | Current state |
|---|---|---|---|---|
| 0. Reset | Begin a deterministic rehearsal | `Reset demo` restores the same asset, timestamps/freshness posture, owner, work order, reservation, audit sequence, and focus target | Must affect synthetic local state only | **Missing**; refresh resets most React state, but generated event IDs/timestamps are nondeterministic |
| 1. Detect | Know what needs attention and why now | Mission control shows one safety-critical exception, affected deployment, current asset safety state, owner, due time, and data freshness | No action yet | **Present**; freshness/metric provenance incomplete |
| 2. Triage | Confirm the exception is real and scoped | Open TRL-443 context without losing the queue; show inspection defect, repeat history, operational constraint, internal stock result, source, observed time, and stale/partial flags | Read-only | **Mostly present** in investigation; asset drawer is a parallel context surface rather than integrated evidence |
| 3. Interpret | Distinguish fact from reasoning | Facts, interpretations, confidence, rationale, and an editable/redirectable operating question | Agent advice is non-binding | **Present visually**; steering control is preview-only |
| 4. Approve enrichment | Decide whether external data may be requested | Review tool, purpose, exact shared input, simulation label, expected output, and audit effect; approve or reject | Explicit human approval; no purchase or device command | **Present** for approval/rejection; permission-denied and failure paths absent |
| 5. Enrich | See progress and provenance of the approved lookup | Running state, adapter identity, start time, timeout/cancel/failure behavior, result freshness, and fixed synthetic label | Only approved payload may run | **Partial**; Approved jumps to fixed Completed on click; no running/error/timeout state |
| 6. Decide response | Choose the safest operational response | Compare **expedite part** vs **reschedule deployment**, with safety, availability, ETA, cost, owner, and assumptions; require a named decision and rationale | Human selects plan; no automatic purchase | **Missing**; recommendation exists but `Prepare action plan` is a dead end |
| 7. Coordinate | Create linked maintenance and parts commitments | In one confirmation, create/advance WO-24091 and place a clearly typed **synthetic external vendor hold** for BA-14TL; show owner, due time, hold expiry, cost, and audit preview | Confirmation required; never describe external hold as internal stock; no real purchase | **Missing**; separate domain modules are not wired and current inventory fixture concerns another part/work order |
| 8. Execute | Track the safe repair | Work order moves through Waiting parts → Ready → In progress; required tasks and evidence are visible; asset remains Out of service | Technician/authorized actor transitions only | **Domain rules partial, UI missing** |
| 9. Verify | Confirm readiness rather than infer it | Repair task complete, post-repair inspection/evidence attached, unresolved blockers zero, verifier named; `Verify return to service` requires confirmation | Human verification; no device command | **Missing** |
| 10. Resolve | Understand outcome and audit history | Asset Available, exception resolved, deployment impact, elapsed time, final part disposition/cost, owner, and full linked timeline are visible | Final state must be auditable and reversible only through a new event | **Missing** |

### Required happy-path interaction contract

1. On reset, focus lands on `Mission control`; TRL-443 is `Out of service`, no internal BA-14TL stock exists, WO-24091 is awaiting response, and no vendor hold exists.
2. `Investigate with agent` opens a page (not a modal) and preserves a reliable `Mission control` return path.
3. Internal evidence loads before any external action. Facts and interpretations are never merged visually or semantically.
4. A proposed lookup is inert until the user approves it. The approval control states that the adapter and its result are simulated.
5. Approval records actor, purpose, and payload summary. It does **not** imply tool completion.
6. Running the approved lookup exposes progress before completion and appends a visible audit event.
7. The completed result produces two response options. The recommended option may be emphasized, but neither option is preselected or auto-executed.
8. Selecting `Expedite and repair` opens an impact review: vendor hold (not purchase), quoted cost, delivery ETA, hold expiry, linked work order, owner, and asset safety state.
9. Confirming creates one coherent synthetic plan: WO-24091 becomes `Waiting parts`; BA-14TL becomes `External hold · reserved until <time>`; TRL-443 remains `Out of service`; all changes share one correlation ID and appear in the operating timeline.
10. Demo controls advance delivery and repair deterministically. They must be labeled `Simulate delivery` / `Simulate repair evidence`, not presented as live operational actions.
11. `Verify return to service` remains disabled until required repair and inspection evidence are complete. The confirmation names the verifier and explicitly says no device command will be issued.
12. Success shows the resolved exception, changed asset/work-order/reservation states, owner, elapsed synthetic resolution time, and audit trail. It offers `Back to mission control`, where the priority item is resolved rather than silently disappearing.
13. At every step, `Reset demo` returns to step 1 without network traffic or persistent external effects.

### Alternate-path contract

- **Reject lookup:** record actor + reason, show `No external tool ran`, then offer `Use internal evidence` and `Re-propose lookup`; rejection must not trap the user.
- **Lookup failure/timeout:** preserve approval and attempt history, show no result as fact, and offer retry or internal-evidence path.
- **Choose reschedule:** create an accountable schedule-change plan while preserving the out-of-service state and maintenance requirement.
- **Permission denied:** explain missing permission and identify the accountable role/request path; do not hide the action without explanation.
- **Reservation failure/expiry:** do not advance the work order as if the part were secured; return to the response decision with prior context intact.
- **Verification failure:** keep the asset out of service, append evidence and owner, and reopen corrective work.

## 2. Composite state contract and invariants

### Canonical linked states

| Entity | Required states for this slice | Current implementation |
|---|---|---|
| Exception / investigation | New → Interpreting → Waiting approval → Enriching → Ready for decision → Coordinating → Verification required → Resolved; plus Rejected, Failed, Permission denied | Interpreting, Waiting approval, Enriching, Ready for decision only |
| Tool run | Proposed → Approved → Running → Completed; or Rejected / Failed / Timed out / Cancelled | Proposed, Approved, Rejected, Completed; no Running/failure states |
| Asset safety | Out of service → Repair in progress → Verification required → Available; failed verification returns to Out of service | Static fixture only |
| Work order | Draft/Open → Waiting parts → Ready → In progress → Verification required → Completed; blocked/failed paths retain owner/reason | Pure module has Open, In progress, Waiting parts, Completed; UI is static and disconnected |
| Part commitment | Unavailable → External hold pending → External hold confirmed → Received/issued; or Failed / Expired / Released | UI says External quote pending; inventory module issues a different in-stock part and has no reservation lifecycle |
| Audit timeline | Intent → grounding → interpretation → approval/rejection → attempt/result → decision → work-order change → part change → verification → resolution | Investigation events through tool completion only |

### Invariants (must be enforced and shown)

1. **Safety first:** TRL-443 cannot become Available while repair or verification requirements are incomplete.
2. **No false inventory claim:** zero internal BA-14TL stock can never render as `Reserved`; a vendor hold must be named and modeled separately.
3. **Human authority:** an agent may recommend or prepare, but a named human chooses the response, approves external enrichment, and verifies return to service.
4. **Approval is not execution:** Proposed, Approved, Running, and Completed are distinct states.
5. **Atomic coordination:** the linked work-order and part-hold update either succeeds as one synthetic operation or visibly fails without partial success.
6. **Auditability:** every consequential transition records entity, actor, before, after, effective time, source/correlation ID, and reason where required.
7. **Provenance:** facts show source and observed time; interpretations show confidence and rationale; stale/partial evidence cannot silently become a fact.
8. **Simulation truth:** every simulated adapter/result/control is labeled at the point of action, not only in the global banner.
9. **No device command:** return-to-service changes the application record only and explicitly does not command hardware.
10. **Recoverability:** rejection, failure, permission denial, expiry, and failed verification preserve prior evidence and provide a next action.

## 3. Material shared UI-state contract

This contract applies first to the priority queue, investigation evidence, vendor lookup, coordination confirmation, and resolution summary—not to every decorative dashboard card.

| State | Trigger | Required visible/accessible treatment | Recovery / allowed action | Verification requirement |
|---|---|---|---|---|
| Loading | Data or synthetic transition not yet available | Stable skeleton or progress label naming what is loading; `aria-busy`; preserve heading and layout; no false zero/empty content | Cancel if meaningful; timeout path | Test loading is not announced/rendered as empty |
| Empty | Successful load with zero records | Explain what is absent, current filters/context, and whether it blocks the job | Clear filter, change context, or create only when authorized | Test zero records after completed load |
| Error | Load/transition failed | Plain-language failure, affected entity/action, whether anything changed, and audit/reference ID | Retry or safe alternate path | Test no success state or partial mutation leaks through |
| Stale | Evidence exceeds its defined freshness threshold | Timestamp + `Stale` badge adjacent to the value; explain decision impact | Refresh or continue with explicit acknowledgement | Test stale data is never described as current |
| Partial | Some sources/linked mutations unavailable | Name available vs missing sources; reduce confidence; block only the transitions whose invariants cannot be met | Retry missing source or choose bounded path | Test partial state survives navigation and is in audit context |
| Permission denied | Actor lacks view/action entitlement | Keep context; explain unavailable action and needed role/owner without exposing restricted data | Request/access handoff or back | Keyboard focus moves to the message; direct-route behavior tested |
| Approval required | Consequential external lookup/plan pending | Purpose, exact shared input/impact, simulation status, actor expectation, approve/reject | Approve or reject with reason | Tool/plan cannot execute before approval |
| Running | Approved operation underway | Persistent progress/status region; actor, started time, cancel/timeout semantics | Cancel only if safe; no duplicate execution | Retry/idempotency and screen-reader announcement tested |
| Success | One transition completed | State change, linked entities, actor, time, simulation label, and next job action | Continue to the next workflow step; undo only via defined event | Success must be persistent, not toast-only |

Transient toasts may supplement these states, but must never be the only proof of a consequential result.

## 4. Highest-impact UX changes (ordered)

| Priority | Recommendation | Why it advances the primary job | Acceptance signal |
|---:|---|---|---|
| P0 | Replace the `Prepare action plan` toast with a real synthetic decision-and-coordination step wired to linked investigation, work-order, part-hold, asset, and audit state | Closes the largest gap between investigation and resolution | One click path reaches a persistent coordinated plan; no dead end |
| P0 | Add repair evidence and human `Verify return to service` gate | Makes “resolution” verified rather than inferred from a vendor result | Asset cannot become Available before required evidence and confirmation |
| P0 | Model external vendor hold separately from internal inventory reservation | Preserves truth while satisfying the parts-coordination job | UI never calls BA-14TL internally reserved; hold source/expiry is visible |
| P0 | Add deterministic `Reset demo` and a persistent success summary | Makes the 5–7 minute demo rehearsable and honest | Reset restores fixture/state/focus; resolved item is visibly reconciled on mission control |
| P1 | Add Running, Failed/Timed out, Permission denied, Stale, and Partial states only on the critical slice | Meets SCO-19/SCO-21 without broad framework work | Each material state has one interaction test and a recoverable next action |
| P1 | Make point-of-action simulation labels explicit (`Run simulated lookup`, `Place simulated vendor hold`, `Simulate delivery`) | Prevents audience inference that production integrations exist | Labels remain visible in confirmations, results, and audit events |
| P1 | Convert the investigation composer from a fake input into either a bounded working redirect action or remove it from the demo | Eliminates a prominent dead-end control and maintains trust | Every visible primary-path control changes state or is clearly disabled/explained |
| P1 | Keep one named owner visible in page header, decision card, work order, and resolution timeline | Reduces handoff ambiguity across the whole job | Dana Foster/actual fixture owner is never lost between steps |
| P2 | Suppress or demote unrelated preview controls during rehearsal mode | Focuses executive attention on the job rather than feature breadth | Demo path has one dominant next action per screen |
| P2 | Increase operational text sizes and strengthen low-contrast muted tokens | Improves scanability under projection, zoom, and stress | No essential content below 12 px; WCAG contrast audit passes |

## 5. Accessibility and responsive risk review

### What is already worth preserving

- Native buttons are used for navigation/actions; current page uses `aria-current`.
- The global search and asset drawer use dialog semantics and labels.
- The asset drawer moves focus to Close and attempts to restore prior focus on unmount.
- The toast is a polite status region.
- Tables have semantic headers, status badges contain text, and reduced-motion CSS exists.
- Tables are wrapped in horizontal overflow rather than forcing page overflow.

These are static code findings, not a completed assistive-technology audit.

### Material risks

| Severity | Risk | Evidence / impact | Required remediation |
|---|---|---|---|
| High | Dialog focus is not trapped and background content is not made inert | Asset drawer and command palette leave the application shell focusable; command palette does not explicitly restore trigger focus (`src/App.tsx:152-154`) | Trap focus, make background inert/`aria-hidden` appropriately, restore trigger focus, test Tab/Shift+Tab/Escape |
| High | Closed mobile navigation remains mounted off-canvas and likely keyboard-focusable | CSS moves `.sidebar` to `left:-260px` but does not hide/inert it; menu button lacks `aria-expanded`/`aria-controls` | Use hidden/inert semantics when closed; add expanded/control relationships and a dismiss path/scrim |
| High | Several text inputs suppress visible focus | `.asset-tools input`, `.command input`, and `.copilot-composer input` set `outline:0`; later/more-specific rules can defeat the global focus-visible rule | Provide explicit high-contrast `:focus-visible` styles on each input/container; regression test |
| High | Essential investigation/evidence/audit text is 8–11 px | Sources, timestamps, timeline actors, interpretations, tool metadata, and controls are below robust projected/mobile reading sizes (`src/investigation.css`) | Use at least 12 px for supporting operational text and 14–16 px for primary body content; verify 200%/400% zoom |
| Medium | Several muted color pairs fail 4.5:1 for normal text in static calculations | `#758178` on white 4.06:1; `#849087` on `#fafbf9` 3.20:1; `#929b95` on white 2.86:1; `#60806f` on `#f5f6f2` 4.02:1 | Replace muted tokens or increase size/weight; run a rendered contrast/axe audit. Banner and semantic badge pairs sampled above 5:1 |
| Medium | Icon-only calendar action has no accessible name | Fleet-health calendar button renders only an icon (`src/App.tsx:110`) | Add purpose-specific `aria-label`; remove if it does not advance the primary job |
| Medium | Toast-only preview feedback disappears after 2.8 seconds | Preview results are transient and cannot be paused/recalled (`src/App.tsx:49,92`) | Use persistent inline state for job outcomes; reserve toast for supplemental confirmation |
| Medium | Responsive layout is defined but not verified | Breakpoints at 1100/900/760 px; investigation rail collapses; tables scroll. No runtime/zoom evidence was completed | Verify 320, 375, 768, 1024, 1440 px; portrait/landscape; 200%/400% zoom; no obscured sticky controls |
| Medium | Mobile priority-card actions may become cramped and investigation header order changes | Two buttons occupy grid column 2; long labels/text can wrap unpredictably | Test long localization/zoom; stack actions full width at narrow widths; keep one primary next action |
| Medium | No skip link or explicit main-content focus strategy | Keyboard users traverse top bar/sidebar on every page state | Add skip link; move focus to new page heading after navigation and to state message after failed action |
| Low | Remote Google font import is a demo dependency | Offline/network failure changes typography and can affect layout | Bundle fonts or verify system-font fallback for the rehearsal backup path |

### Required verification matrix before calling WS2 acceptance complete

- Keyboard-only: nav, investigation, approve, reject/recover, plan confirmation, repair simulation, verification, reset; visible focus at every stop.
- Screen reader: NVDA + Chrome/Edge for headings, dialogs, statuses, tables, state changes, evidence/source association, and audit order.
- Automated: axe on mission control, proposed lookup, completed lookup, coordination confirmation, and resolution states.
- Responsive: 320, 375, 768, 1024, 1440 px; 200% and 400% zoom; table scrolling and sticky controls.
- Preferences: reduced motion, high contrast/forced colors, text spacing.
- Focus: modal trap/return, route/page-heading focus, mobile-nav inertness, no off-screen focus.
- Contrast: rendered text/icons/focus indicators, including muted evidence timestamps and badge states.

## 6. Screen-by-screen 5–7 minute demo storyboard

| Time | Screen / action | Narration and audience takeaway | Truth label | Backup path |
|---:|---|---|---|---|
| 0:00–0:30 | Reset → Mission control | “One synthetic safety exception threatens tomorrow's deployment. The system names the asset, operational impact, owner, and response window.” Takeaway: prioritize decisions, not dashboard breadth. | Current queue is implemented; all data synthetic | Reload/reset and use the fixed TRL-443 priority card |
| 0:30–1:10 | Open investigation | Show inspection failure, repeat history, schedule constraint, zero internal stock, source, observed time, and fact vs interpretation. Takeaway: evidence and reasoning remain distinguishable. | Implemented synthetic evidence | Read the fixed evidence cards without interacting |
| 1:10–1:50 | Review approval card | Point out adapter, purpose, exact shared input, and “no external tool has run.” Takeaway: agent proposes; human authorizes. | Implemented guard; adapter simulated | Use rejection path to prove no execution, then reset |
| 1:50–2:20 | Approve → run simulated lookup | Show Approved, Running, then Completed; result has vendor, quantity, ETA, quote, source, and synthetic label. Takeaway: approval and execution are separate, inspectable events. | Approval/completion implemented; Running must be added; output fixed/synthetic | Use pre-captured completed state or deterministic demo advance |
| 2:20–3:05 | Compare response options | Compare expedite vs reschedule by safety, availability, time, cost, and confidence; select expedite. Takeaway: the agent supports an accountable decision, not an autonomous purchase. | **To implement** | Show storyboard/static fixture and state contract, not a fake toast |
| 3:05–3:50 | Confirm coordinated plan | Review one impact summary: WO-24091 Waiting parts, external vendor hold with expiry, Dana owner, TRL-443 remains Out of service, no purchase/device command. Confirm. Takeaway: work and parts stay linked and truthful. | **To implement; all simulated** | Navigate to static Work orders and Parts queues while stating they are not linked today |
| 3:50–4:35 | Simulate delivery and repair evidence | Advance deterministic demo controls; show required task and post-repair inspection. Takeaway: execution retains evidence and ownership. | **To implement; simulated transitions** | Use a pre-seeded “verification required” fixture |
| 4:35–5:15 | Verify return to service | Human confirms evidence; explicitly no hardware command is sent. Takeaway: return to service is a human safety gate. | **To implement; application-record change only** | Use a pre-seeded resolution summary |
| 5:15–5:55 | Resolution summary → Mission control | Show asset Available, work order Completed, part fulfilled, elapsed time, owner, correlation/audit timeline, and resolved priority. Takeaway: the outcome is closed-loop and auditable. | **To implement; synthetic outcome** | Show expected-state slide generated from this contract |
| 5:55–6:20 | Limitations / decision ask | State: no production systems, vendor, purchase, device command, auth, or durable audit. Ask audience to approve the workflow for operator validation and implementation hardening. | Factual scope statement | Banner + this document |

### Rehearsal guardrails

- Do not tour Assets, Reports, People, or broad domain cards unless answering a question.
- Do not say “real time,” “reserved,” “purchased,” “sent,” “assigned,” or “returned to service” without the visible state and its simulation/source qualifier.
- If a primary click fails, use the specified pre-seeded state or storyboard; never narrate a toast as completed work.
- Reset immediately before each rehearsal. Preserve a static screenshot/slide for each storyboard row only after the implemented states exist.

## 7. Preserve / improve / combine / replace recommendations

| Disposition | Surface / behavior | Recommendation tied to the primary job |
|---|---|---|
| **Preserve** | Mission-control priority queue | Preserve one-person-attention queue, severity, asset/location, operational impact, named owner, and dual read/investigate entry. It is a strong trigger for the job. |
| **Preserve** | Fact / interpretation separation | Preserve confidence, rationale, source, observed time, and visible grounding; this is the trust core of the investigation. |
| **Preserve** | Human approval/rejection boundary | Preserve explicit purpose/input review, no-run-before-approval guard, rejection reason, actor attribution, and visible result. |
| **Preserve** | Global synthetic banner | Preserve as a baseline safety cue, while adding local labels at each simulated action/result. |
| **Improve** | Priority and evidence freshness | Add source freshness/stale/partial semantics and metric provenance so “now” is never inferred from fixture copy. |
| **Improve** | Tool lifecycle | Add Running, Failed, Timed out, retry/idempotency, and permission states; keep approval separate from completion. |
| **Improve** | Responsive/accessibility foundation | Fix focus trapping/inertness, input focus, mobile-nav semantics, tiny text, contrast, and route focus before decorative refinement. |
| **Combine** | Investigation + asset drawer evidence | Bring the relevant asset safety state, linked inspection, work order, internal stock, owner, and audit context into the investigation; avoid forcing the operator to reconstruct the case across parallel surfaces. |
| **Combine** | Investigation + work-order + part state machines | Use one correlated decision/coordination transaction and one visible timeline. Existing pure modules are ingredients, not an end-to-end experience. |
| **Combine** | Work order and part commitment confirmation | Confirm linked effects together while retaining separate entity states and audit entries. This prevents a work order from implying the part is secured when it is not. |
| **Replace** | `Prepare action plan` and other primary-path toast previews | Replace with persistent, testable workflow states and a dominant next action. Toast-only simulation does not advance the job. |
| **Replace** | Generic domain placeholder pages in the rehearsal | Replace with the linked WO-24091/BA-14TL context or remove from the demo path. Broad queues dilute the exception-to-resolution narrative. |
| **Replace** | Ambiguous `External quote pending` as the final parts state | Replace after the response decision with a typed external-hold lifecycle: pending, confirmed with expiry, received/issued, failed/expired/released. Never map it to internal stock. |
| **Replace** | “Available” as an unguarded static fixture status | Replace with derived availability gated by work completion and human verification, with the transition preserved in audit history. |

## 8. Acceptance and handoff to implementation/quality workstreams

WS2's workflow/design contract is ready for implementation, but WS2 acceptance is **not complete** until the clickable slice and runtime accessibility/responsive verification exist.

### Smallest implementation slice for WS4

1. Add deterministic demo/reset state holding investigation, TRL-443, WO-24091, BA-14TL external hold, and linked audit events.
2. Replace `Prepare action plan` with option comparison and one confirmation.
3. Apply atomic synthetic coordination changes and persistent success UI.
4. Add deterministic delivery/repair evidence and verification-required states.
5. Gate and complete human return-to-service; reconcile mission-control priority.
6. Add tests first for no execution before approval, no false internal reservation, atomic coordination, no availability before verification, rejection/failure recovery, and reset determinism.

### Quality handoff for WS6 / SCO-21

- Add keyboard interaction tests using `user-event`, not only `fireEvent`.
- Add axe checks and the manual verification matrix above.
- Test modal focus trap/return, mobile-nav inertness, page-heading focus, and persistent state announcements.
- Test 320 px and zoom/overflow behavior; inspect evidence text and action layout.
- Keep `npm run lint`, `npm test -- --run`, and `npm run build` as gates; record actual results.

## 9. Decisions, risks, dependencies, and open questions

### Recommendations requiring product/design authority

- **Recommend** the canonical happy path be `expedite + external vendor hold + repair + verification`, with `reschedule` as the accountable alternate. Product owner must approve this scenario because current evidence proves the workflow need but not customer preference.
- **Recommend** a vendor hold be modeled separately from inventory reservation. Domain/product owner must approve terminology and lifecycle.
- **Recommend** the demo completion metric be “time from exception surfaced to verified return-to-service plan/state,” with safety-gate violations always zero. Product owner must define the baseline/target before making outcome claims.

### Risks and dependencies

- The current fixture says the part is unavailable internally; any requirement to show an **internal** reservation conflicts with verified demo truth.
- Domain state machines exist but use disconnected fixtures (inventory uses PART-HF320/WO-24088); integration requires a deliberately unified synthetic state, not superficial UI wiring.
- Identity, entitlement enforcement, durable audit, production integrations, and immutable timestamps remain production gaps. The demo must not imply otherwise.
- Metric formulas and freshness semantics remain unknown in legacy/public evidence; avoid “real-time” or quantified improvement claims.
- Lower-privilege runtime behavior is unverified; permission-state design is a contract, not evidence of implemented authorization.

### Open questions

1. Who is the accountable decision owner and final return-to-service verifier in the canonical fixture—Dana Foster for both, or separate roles?
2. Is the external commitment a no-cost vendor hold, purchase request draft, or approved purchase-order preview? The demo must choose one and name what does **not** happen.
3. What makes the post-repair inspection sufficient, and which evidence fields are mandatory?
4. What is the vendor-hold expiry and failure behavior?
5. Which timestamps should be fixed relative to reset versus displayed as deterministic offsets?
6. What audience decision closes the demo: approve operator testing, approve this vertical slice for build, or approve pilot diligence?

## Source basis

- `docs/agent-storm/README.md` — mission, demo promise, epistemic and safety rules.
- `docs/agent-storm/WORKSTREAMS.md` — WS2/WS4/WS6/WS7 acceptance and handoff order.
- `docs/PRODUCT_SCOPE.md`; `docs/ARCHITECTURE.md` — operating loop, implemented slice, gaps, integrity rules.
- `docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md` — observed legacy workflows, loading/empty ambiguity, command risk, state-contract evidence plan.
- `docs/evidence/AP-ENV-PHX-redacted-safety-checkpoint.md`; `AP-ENV-KENCO-redacted-safety-checkpoint.md` — read-only safety boundary around customer-derived/device-state environments.
- `docs/evidence/GemOne-public-product-technical-market-assessment.md` — telemetry-to-action interpretation and public gaps in freshness, RBAC, API, and outcome assurance.
- `src/App.tsx`, `src/App.css`, `src/index.css`, `src/investigation.css`; domain modules and tests.
- Linear SCO-19, SCO-15, SCO-21 retrieved 2026-08-22.
