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
