# Witnessed RED evidence

Branch baseline: `aae5ffb`
Date: 2026-08-22

Behavior and accessibility work used focused RED → GREEN → REFACTOR. Purely visual changes were not assigned manufactured behavior tests.

## Tracer 1 — lab navigation and unnamed Fleet health control

Command:

`npm test -- --run src/App.test.tsx -t "opens the component lab|names the fleet-health"`

Witnessed RED output (exact summary):

```
❯ src/App.test.tsx (7 tests | 2 failed | 5 skipped) 841ms
× opens the component lab from the explicit demo control 541ms
× names the fleet-health date control for assistive technology 299ms
Test Files  1 failed (1)
Tests  2 failed | 5 skipped (7)
Duration  2.19s
```

Named causes: no `Open design system lab` control/surface existed, and the Fleet health calendar button had an empty accessible name.

## Tracer 2 — mobile navigation semantics and dialog focus containment

Command:

`npm test -- --run src/App.test.tsx -t "exposes mobile navigation|contains command-palette focus"`

Witnessed RED output (exact summary):

```
❯ src/App.test.tsx (9 tests | 2 failed | 7 skipped) 777ms
× exposes mobile navigation state and target semantics 563ms
× contains command-palette focus and restores its trigger 212ms
Test Files  1 failed (1)
Tests  2 failed | 7 skipped (9)
Duration  2.14s
```

Named causes: the menu was only named `Toggle navigation` and exposed no `aria-expanded`/`aria-controls`; Shift+Tab escaped the command dialog to a background link.

## Focused GREEN

Command:

`npm test -- --run src/App.test.tsx -t "opens the component lab|names the fleet-health|exposes mobile navigation|contains command-palette focus"`

Exact result:

```
Test Files  1 passed (1)
Tests  4 passed | 5 skipped (9)
Duration  2.41s
```

Implementation: explicit sidebar lab control; purpose-specific calendar label; expanded/controls mobile menu contract with narrow-screen inertness and scrim; portal-based reusable `ModalDialog` with focus containment, Escape close, background inertness, and focus restoration.

## PR #8 bounded remediation — modal, mobile drawer, and production tables

Tests were added before remediation implementation and run with:

`npm test -- --run src/App.test.tsx`

Witnessed RED summary:

```
❯ src/App.test.tsx (15 tests | 5 failed) 3429ms
× preserves a previously inert closed mobile sidebar after search closes 22ms
× implements the narrow mobile drawer focus, inertness, Escape, scrim, and restoration contract 356ms
× prevents search from stacking over an active asset or mobile drawer 389ms
× prevents search from stacking over the design-lab modal 500ms
× names the production table scroll regions for keyboard users 646ms
Test Files  1 failed (1)
Tests  5 failed | 10 passed (15)
Duration  4.63s
```

Named causes: inert cleanup blindly wrote `false`; mobile navigation was only a visually positioned aside and lacked modal focus/background behavior; the global shortcut opened over active dialogs; production scroll wrappers lacked region names and keyboard access. The new forward/reverse wrap and backdrop-close assertions passed on the baseline shared dialog and therefore did not require a behavior change.

Focused GREEN after the minimal shared-primitive/state changes:

```
Test Files  1 passed (1)
Tests  15 passed (15)
Duration  4.84s
```

Final full-suite gate after clean `npm ci`:

```
Test Files  5 passed (5)
Tests  34 passed (34)
Duration  5.40s
```

## PR #8 final bounded remediation — centralized modal ownership and overflow-dependent tables

Focused tests were authored before implementation and run with:

`npm test -- --run src/design-system/ModalDialog.test.tsx src/design-system/ScrollableRegion.test.tsx src/App.test.tsx`

Witnessed RED summary:

```
❯ src/design-system/ScrollableRegion.test.tsx (0 test)
❯ src/design-system/ModalDialog.test.tsx (5 tests | 5 failed)
❯ src/App.test.tsx (15 tests | 3 failed)
Test Files  3 failed (3)
Tests  8 failed | 12 passed (20)
Duration  5.63s
```

Named causes: no `ScrollableRegion` existed; independent modal cleanup did not inert/hide underlying layers or expose deterministic manager state; focus was not transferred after top close; direct command clicks bypassed the keyboard guard; and production table wrappers were always in the tab order. The first focused run also proved the existing backdrop test had selected an identically named header close button; the corrected test targets `.modal-scrim` explicitly rather than preserving a false failure.

Focused GREEN:

```
Test Files  3 passed (3)
Tests  23 passed (23)
Duration  5.89s
```

Sabotage checks were run against the critical contracts and then reverted:

```
Modal sabotage: forced every modal layer non-inert
Test Files  1 failed (1)
Tests  1 failed | 4 skipped (5)
Failure: underlying modal expected inert true, received false

Table sabotage: removed conditional tabindex
Test Files  1 failed (1)
Tests  1 failed | 2 skipped (3)
Failure: overflowing region expected tabindex="0", received null

Audit sabotage: added one temporary authored CSS line with #fff and font-size: 1.75rem
Design literal audit: 2 violations at threshold 0
Findings: raw color literal; duplicated normative numeric font size
```

Final full-suite gate after clean `npm ci`:

```
Test Files  7 passed (7)
Tests  43 passed (43)
Duration  7.42s
```
