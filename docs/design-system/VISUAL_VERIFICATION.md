# Visual, browser, accessibility, and bundle verification

Verified worktree: PR #8 bounded remediation on `feat/tlx-design-system`
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
| Mission control, forced colors emulated | 1440 × 1100 | 1425 | No | `screenshots/mission-control-forced-colors.png` |

The CDP result is preserved in `browser-verification.json`. Network observation remained enabled through repeated navigation, lazy lab selection, and a final 1.5-second delayed observation window. It recorded exactly five unique local requests and zero external requests: document, default JS, default CSS, then the separately emitted DesignSystemLab JS and CSS chunks. It recorded zero console warnings, errors, or exceptions.

## Keyboard and modal verification

Real CDP keyboard events verified the narrow drawer at 320px:

- Initial focus entered the labelled `Primary workspace` dialog.
- Main and topbar reported `inert: true` while open.
- Fourteen forward Tab events and one reverse Shift+Tab event remained in the drawer.
- Escape closed the drawer and restored focus to the now-`Open navigation` trigger.
- The production `Active work orders table` named region was reached by repeated real Tab events from the document.

Vitest adds regression coverage for forward/reverse dialog wrap, backdrop close, Escape, scrim close, focus restoration, prior-inert restoration, narrow `matchMedia` behavior, blocked Ctrl/Cmd+K stacking over asset/mobile/lab dialogs, and named keyboard-focusable Mission Control and asset table regions. Exact RED/GREEN evidence is in `RED_EVIDENCE.md`.

The modal implementation uses one shared primitive and a minimal stack. Each layer snapshots each background element’s prior inert property and restores that exact value; only the top stack entry handles Escape, backdrop, focus containment, and cleanup. App-level Ctrl/Cmd+K checks the same manager and does not open search over an active modal.

## Reflow and forced colors

CDP exercised 720px and 360px CSS viewports as 200% and 400% equivalent reflow widths for a 1440px reference viewport. Both reported document width equal to viewport width and no page-level horizontal overflow. This is narrow-viewport equivalence evidence, not a claim that browser UI zoom itself was automated.

CDP emulated `forced-colors: active`, captured the result, and found no page-level overflow. Visual inspection found content and region boundaries remained perceivable and status text remained present. This is protocol emulation, not a physical Windows High Contrast session.

## Bundle evidence

Clean production build (`vite v8.2.2`):

```
dist/index.html                             0.63 kB │ gzip:  0.37 kB
dist/assets/DesignSystemLab-1FOKh6pF.css    8.56 kB │ gzip:  1.88 kB
dist/assets/index-C2dn-qia.css             36.28 kB │ gzip:  6.51 kB
dist/assets/DesignSystemLab-o06-JQLS.js    19.40 kB │ gzip:  5.51 kB
dist/assets/index-BoCaDtj5.js             234.35 kB │ gzip: 72.69 kB
```

The explicit Demo control remains available. `DesignSystemLab` is loaded with `React.lazy`; its showcase CSS follows the lazy module. Vite emits separate 19.40 kB JS and 8.56 kB CSS lab chunks, and CDP observes those requests only after the Demo control is selected.

## Token and supply-chain evidence

- `@google/design.md` is exactly pinned to `0.4.0` in package and root lock metadata.
- Lock resolution: `https://registry.npmjs.org/@google/design.md/-/design.md-0.4.0.tgz`.
- Integrity: `sha512-7aNIv6hslxIZ9igXq1abbVu+ue/ft/oFMUrAuhzpVFijGr9v+l0CkkCBQsHozucNiZHIBS43XC6l8gYDZRys9Q==`.
- `DESIGN.md` is normative. One Windows-safe Node script generates DTCG, Tailwind interchange, runtime CSS, and typed runtime manifest without shell redirection.
- Design lint: 0 errors, 0 warnings, 1 informational token summary.
- Drift check: clean.
- Literal audit: 0 raw color violations outside generated token CSS (enforced threshold: 0).
- The lab’s swatch hex values, spacing values, typography contracts, and calculated contrast ratios are derived from the generated runtime manifest; no duplicate lab hex or ratio strings remain.

## Visual inspection

- The 320px final capture has no clipped controls or overlap; critical actions remain legible and full-width.
- The component lab loaded successfully from its separate chunk. Generated swatches and calculated ratios rendered, with no clipping in the inspected 1440px view.
- Forced-colors emulation retained visible boundaries and text/status labels without relying on color alone.
- The Operating Ledger direction and existing product hierarchy were preserved; remediation did not broaden workflow behavior or arbitrarily restyle surfaces.

## Explicit limitations

This run is not NVDA or another screen-reader session, a physical touch-device run, browser-UI 200%/400% zoom automation, or a physical Windows High Contrast session. Axe was not added because doing so would expand dependencies/CI beyond this bounded remediation; no axe result is claimed. Chrome remote debugging was bound to the local machine for this synthetic local preview only; the script did not attach to a user browsing profile, traverse external origins, or validate remote-debugging behavior under a more restricted CI/enterprise policy. These remain separate pre-production/manual accessibility and environment gates.
