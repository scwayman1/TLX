# Visual and browser verification

Verified implementation commit: `aa1946e`
Browser: Chrome 151.0.7922.170, headless production preview
Preview origin: `http://127.0.0.1:4173/`
Date: 2026-08-22

## Exact viewport results

| Surface | Viewport | Document width | Horizontal overflow | Screenshot |
| --- | ---: | ---: | --- | --- |
| Mission control | 320 × 900 | 320 | No | `screenshots/mission-control-320-exact.png` |
| Mission control | 760 × 1000 | 760 | No | `screenshots/mission-control-760-exact.png` |
| Mission control | 1100 × 900 | 1085 (scrollbar excluded) | No | `screenshots/mission-control-1100-exact.png` |
| Mission control | 1440 × 1100 | 1425 (scrollbar excluded) | No | `screenshots/mission-control-1440-exact.png` |
| Design system lab | 1440 × 1100 | 1425 | No | `screenshots/design-system-lab-1440.png` |
| Investigation / approval | 1440 × 1100 | 1425 | No | `screenshots/investigation-1440.png` |

The CDP verification result is preserved in `../browser-verification.json`. It observed **0 external requests**, **0 console warnings/errors/exceptions**, and no page-level horizontal overflow in the sampled states. The three unique production requests were the local document, local CSS, and local JavaScript bundle.

## Inspection findings and refinement

- Desktop 1440: the priority queue is the dominant command region; metrics are a compact instrument strip; Fleet health is secondary. No clipping or overlap was observed.
- 1100: metrics become a 2 × 2 strip and the priority queue occupies the main content width. This preserves signal hierarchy without a generic card grid.
- 760: actions meet touch sizing, metrics remain a compact 2 × 2 strip, and the safety-critical action stack is full width.
- Initial 320 capture exposed a clipped two-button header and placed four stacked metrics before the exception. Refinement stacked header actions, moved the priority region ahead of metrics at the narrow gate, and kept `View all` unbroken. The final exact capture has no horizontal overflow or clipped controls.
- Investigation: facts and interpretation have distinct rails; approval is amber and explicit; evidence/source/time is readable at 12px or above; the persistent synthetic banner remains visible.
- Component lab: the fixture boundary, swatches/contrast values, type scale, actions/forms, badges, data, evidence, shared states, dialog, and motion are visually coherent with the production app.

## Accessibility evidence in this branch

- Four focused behavior/semantics tests have witnessed RED/GREEN evidence (`RED_EVIDENCE.md`).
- Dialogs use a shared portal primitive with labelled modal semantics, background inertness, focus containment, Escape close, and trigger focus restoration.
- Mobile navigation exposes state/target semantics and is inert when closed at the narrow breakpoint.
- The previously unnamed Fleet health calendar control now has a task-specific accessible name.
- Focus, 44px narrow controls, status text, reduced motion, forced-colors boundaries, skip navigation, and accurate main/nav/header landmarks are implemented.
- `DESIGN.md` lint reports 0 warnings and 0 errors across declared component contrast pairs; displayed swatch ratios were calculated from the normative hex values.

## Limitations / remaining manual gate

Headless browser inspection is not NVDA, physical touch-device, 200%/400% zoom, Windows High Contrast, or a full axe scan. Those remain explicit pre-production accessibility verification debt. This branch does not claim broad product accessibility certification. It fixes the critical/serious defects directly exposed by the migrated surfaces and adds regression coverage for material semantics.
