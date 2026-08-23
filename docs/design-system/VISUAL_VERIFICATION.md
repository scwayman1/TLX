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

The CDP result is preserved in `browser-verification.json`. Network observation remained enabled through repeated navigation, lazy lab selection, and a final 1.5-second delayed observation window. It recorded exactly six unique local requests and zero external requests: document, favicon, default JS/CSS, then the separately emitted DesignSystemLab JS/CSS chunks. It recorded zero console warnings, errors, or exceptions.

## Keyboard and modal verification

Real CDP keyboard events verified the narrow drawer at 320px:

- Initial focus entered the labelled `Primary workspace` dialog.
- Main and topbar reported `inert: true` while open.
- Fourteen forward Tab events and one reverse Shift+Tab event remained in the drawer.
- Escape closed the drawer and restored focus to the now-`Open navigation` trigger.
- At 1440px, the production `Active work orders table` measured no horizontal overflow and had no `tabindex`.
- At 320px, the same region measured horizontal overflow, exposed `tabindex="0"`, and was reached by repeated real Tab events from the document.
- With the asset drawer open, both a programmatic direct click of the global-search control and a real Ctrl+K event left exactly one dialog open; search did not stack.

Vitest adds regression coverage for forward/reverse dialog wrap; top-only backdrop/Escape ownership; nested top-close focus transfer; lower-first unmount; underlying-layer inertness/`aria-hidden`; removed-active-element recovery; exact final background restoration; deterministic cleanup; narrow `matchMedia` behavior; blocked direct-click and Ctrl/Cmd+K stacking over asset/mobile/lab dialogs; and overflow-dependent table focusability across resize/content changes. Exact RED/GREEN and sabotage evidence is in `RED_EVIDENCE.md`.

The modal implementation uses one centralized manager. It owns application-background inertness once, hides and inerts every non-top modal layer, transfers focus to the newly exposed top layer, tolerates tested lower-first unmount, and restores captured background inert values only after the final modal exits. Only the top entry owns Escape, backdrop, and focus containment. Both direct-click and Ctrl/Cmd+K command-opening paths check the same manager.

## Reflow and forced colors

CDP exercised 720px and 360px CSS viewports as 200% and 400% equivalent reflow widths for a 1440px reference viewport. Both reported document width equal to viewport width and no page-level horizontal overflow. This is narrow-viewport equivalence evidence, not a claim that browser UI zoom itself was automated.

CDP emulated `forced-colors: active`, captured the result, and found no page-level overflow. Visual inspection found content and region boundaries remained perceivable and status text remained present. This is protocol emulation, not a physical Windows High Contrast session.

## Bundle evidence

Clean production build (`vite v8.2.2`):

```
dist/index.html                             0.63 kB │ gzip:  0.37 kB
dist/assets/DesignSystemLab-CAOZI_Ih.css    9.32 kB │ gzip:  1.95 kB
dist/assets/index-Cgkf91P5.css             37.10 kB │ gzip:  6.63 kB
dist/assets/DesignSystemLab-Y9bNTrda.js    19.46 kB │ gzip:  5.55 kB
dist/assets/index-VUh5R1rD.js             236.06 kB │ gzip: 73.34 kB
```

The explicit Demo control remains available. `DesignSystemLab` is loaded with `React.lazy`; its showcase CSS follows the lazy module. Vite emits separate 19.46 kB JS and 9.32 kB CSS lab chunks, and CDP observes those requests only after the Demo control is selected.

## Token and supply-chain evidence

- `@google/design.md` is exactly pinned to `0.4.0` in package and root lock metadata.
- Lock resolution: `https://registry.npmjs.org/@google/design.md/-/design.md-0.4.0.tgz`.
- Integrity: `sha512-7aNIv6hslxIZ9igXq1abbVu+ue/ft/oFMUrAuhzpVFijGr9v+l0CkkCBQsHozucNiZHIBS43XC6l8gYDZRys9Q==`.
- `DESIGN.md` is normative. One Windows-safe Node script generates DTCG, Tailwind interchange, runtime CSS, and typed runtime manifest without shell redirection.
- Design lint: 0 errors, 0 warnings, 1 informational token summary.
- Drift check: clean.
- Literal audit: 0 violations at threshold 0 across authored `src` CSS and runtime TS/TSX/JS/MJS, with generated tokens and non-runtime tests/setup excluded by explicit provenance.
- The audit detects raw color representations and unambiguous duplicated normative typography declarations; it does not claim repository-wide dimensional tokenization. Justified local geometry is listed in `DESIGN.md` and the governance README.
- Runtime CSS generates font size, weight, line height, letter spacing, label transform, numeric feature settings, and numeric variant settings. The lab’s swatches, spacing, typography contracts, and calculated contrast ratios derive from the generated manifest.

## Visual inspection

- The 320px final capture has no clipped controls or overlap; critical actions remain legible and full-width.
- The component lab loaded successfully from its separate chunk. Generated swatches, typography specimens, and calculated ratios rendered with no clipping in the inspected 1440px view.
- Forced-colors emulation retained visible boundaries and text/status labels without relying on color alone.
- The Operating Ledger direction and existing product hierarchy were preserved; remediation did not broaden workflow behavior or arbitrarily restyle surfaces.

## Explicit limitations

This run is not NVDA or another screen-reader session, a physical touch-device run, browser-UI 200%/400% zoom automation, or a physical Windows High Contrast session. Axe was not added because doing so would expand dependencies/CI beyond this bounded remediation; no axe result is claimed. Chrome remote debugging was bound to the local machine for this synthetic local preview only; the script did not attach to a user browsing profile, traverse external origins, or validate remote-debugging behavior under a more restricted CI/enterprise policy. These remain separate pre-production/manual accessibility and environment gates.
