---
version: alpha
name: TelemetryX Operating Ledger
description: Industrial operating precision with calm human accountability for an OPERATE-first fleet command surface.
colors:
  primary: "#185C43"
  primary-hover: "#0F4934"
  primary-soft: "#E4F0E9"
  on-primary: "#FFFFFF"
  brand-ink: "#17231D"
  brand-forest: "#123D2D"
  brand-lime-signal: "#C7F04D"
  canvas: "#F4F1E8"
  surface: "#FFFEFA"
  surface-subtle: "#ECEAE2"
  surface-strong: "#E2E2D9"
  text: "#17231D"
  text-muted: "#4E5B54"
  text-subtle: "#5F6B64"
  border: "#C9CEC8"
  border-strong: "#9DA8A1"
  focus: "#087A58"
  success: "#176443"
  success-soft: "#E3F2E8"
  on-success-soft: "#10462F"
  warning: "#8A4B08"
  warning-soft: "#FFF1D4"
  on-warning-soft: "#603000"
  danger: "#9D2F24"
  danger-soft: "#FCE9E5"
  on-danger-soft: "#6E1F18"
  info: "#245A73"
  info-soft: "#E7F2F5"
  on-info-soft: "#173F52"
  disabled: "#D8DCD7"
  on-disabled: "#58615B"
  overlay: "#0F1B1585"
typography:
  display:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 2rem
    fontWeight: 720
    lineHeight: 1.12
    letterSpacing: -0.025em
  heading-lg:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.015em
  heading-md:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 1.125rem
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 0.9375rem
    fontWeight: 450
    lineHeight: 1.5
  body-sm:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 0.8125rem
    fontWeight: 450
    lineHeight: 1.45
  label:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 0.75rem
    fontWeight: 680
    lineHeight: 1.3
    letterSpacing: 0.055em
  numeric:
    fontFamily: "Segoe UI Variable, Segoe UI, system-ui, sans-serif"
    fontSize: 1.75rem
    fontWeight: 720
    lineHeight: 1
    letterSpacing: -0.03em
    fontFeature: "'tnum', 'lnum'"
  code:
    fontFamily: "Cascadia Mono, SFMono-Regular, Consolas, monospace"
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.4
rounded:
  none: 0px
  xs: 3px
  sm: 5px
  md: 8px
  lg: 12px
  full: 999px
spacing:
  0: 0px
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
components:
  layout-sidebar:
    width: 248px
  layout-topbar:
    height: 64px
  layout-content:
    width: 1440px
  modal-overlay:
    backgroundColor: "{colors.overlay}"
    textColor: "{colors.on-primary}"
  brand-wordmark:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand-ink}"
    typography: "{typography.heading-md}"
  brand-rail:
    backgroundColor: "{colors.brand-forest}"
    textColor: "{colors.on-primary}"
  live-signal:
    backgroundColor: "{colors.brand-lime-signal}"
    textColor: "{colors.brand-ink}"
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.5}"
  panel-subtle:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text}"
  panel-strong:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.brand-ink}"
  metadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
  subtle-metadata:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-subtle}"
  border-sample:
    backgroundColor: "{colors.border}"
    textColor: "{colors.brand-ink}"
  border-strong-sample:
    backgroundColor: "{colors.border-strong}"
    textColor: "{colors.brand-ink}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    height: 36px
    padding: 12px
    typography: "{typography.body-sm}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  selection:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.brand-forest}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand-forest}"
    rounded: "{rounded.sm}"
    height: 36px
  button-disabled:
    backgroundColor: "{colors.disabled}"
    textColor: "{colors.on-disabled}"
  focus-ring:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.on-primary}"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.on-success-soft}"
    rounded: "{rounded.full}"
    typography: "{typography.label}"
  badge-success-strong:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.on-warning-soft}"
    rounded: "{rounded.full}"
  badge-warning-strong:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-primary}"
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.on-danger-soft}"
    rounded: "{rounded.full}"
  badge-danger-strong:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
  badge-info:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.on-info-soft}"
    rounded: "{rounded.full}"
  badge-info-strong:
    backgroundColor: "{colors.info}"
    textColor: "{colors.on-primary}"
  compact-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.xs}"
    height: 32px
  mobile-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: 44px
  square-data-region:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
---

## Overview

TelemetryX is an **OPERATE surface first and a MONITOR surface second**. It is an operating ledger for fleet exceptions: a user must quickly scan what is unsafe or blocked, the evidence behind it, current ownership, timing, and the next accountable action. The selected visual direction is **Operating Ledger**: industrial precision with calm human accountability.

The normative values live in the YAML front matter. `npm run design:generate` deterministically produces the DTCG/Tailwind exports, runtime CSS custom properties, and typed runtime manifest; `npm run design:check` fails on any committed drift. Tokens are intentionally layered:

- **Brand tokens** describe the durable identity: `{colors.brand-ink}`, `{colors.brand-forest}`, `{colors.brand-lime-signal}`, and `{colors.primary}`.
- **Semantic tokens** describe meaning independent of a component: `{colors.canvas}`, `{colors.text-muted}`, `{colors.warning}`, `{colors.danger}`, `{colors.focus}`, and their paired containers/on-colors.
- **Component tokens** alias brand or semantic values into a bounded use such as `{components.button-primary}` or `{components.badge-danger}`. Application CSS may add implementation aliases, but must not replace the normative source with unrelated values.

No third-party identity is a visual source. Do not clone Streakline, Claude, Pinterest, Monday.com, ClickUp, or any other product. Original illustration, imagery, or generated assets are only justified when operational meaning cannot be communicated with typography, data, status, and restrained icons. None is required for the current foundation.

## Colors

The canvas is a warm mineral neutral, not pure white. Graphite/forest ink creates calm contrast. Operational green is the sole interaction accent. Amber and red are reserved for actual warning and safety/risk meaning. Lime is a sparse signal for live/system presence; it is never paragraph text and never a generic highlight.

Use semantic pairs, not raw swatches:

- Default page: `{colors.text}` on `{colors.canvas}`.
- Primary surface: `{colors.text}` on `{colors.surface}`.
- Supporting copy: `{colors.text-muted}` on `{colors.surface}` or `{colors.canvas}`.
- Success: `{colors.on-success-soft}` on `{colors.success-soft}`.
- Warning/stale/partial: `{colors.on-warning-soft}` on `{colors.warning-soft}`.
- Danger/safety/error: `{colors.on-danger-soft}` on `{colors.danger-soft}`.
- Information/permission: `{colors.on-info-soft}` on `{colors.info-soft}`.
- Focus: a 2px `{colors.focus}` outline plus 2px offset; do not use shadow alone.

Status always includes text or an accessible label. Never use color alone. Synthetic/demo boundaries use neutral/amber structure and explicit wording rather than a unique “fake data” hue that users must memorize.

## Typography

Use the tested local/system stack in `{typography.body}`. The application must not request runtime fonts. The stack prioritizes Segoe UI Variable on Windows and falls back to Segoe UI and `system-ui`.

- `{typography.display}`: page titles only; avoid marketing scale.
- `{typography.heading-lg}` and `{typography.heading-md}`: clear operational hierarchy.
- `{typography.body}`: primary prose and control labels.
- `{typography.body-sm}`: supporting metadata; never render essential information below 12px.
- `{typography.label}`: short labels/eyebrows; do not set sentences in uppercase.
- `{typography.numeric}`: KPI values using tabular lining numerals.
- `{typography.code}`: stable IDs, correlation IDs, and technical references—not general data.

Financial values include currency and units. Percentages, dates, durations, and meter values use tabular numerals. Right-align comparable numeric columns. Do not abbreviate a number when the abbreviation obscures decision context.

## Layout

The exporter’s alpha schema does not yet model elevation or motion, so these normative TelemetryX extensions are machine-readable here and are copied into the DTCG `$extensions.telemetryx` object by the generator:

```telemetryx-contracts
{
  "typography": {
    "label-text-transform": "uppercase",
    "numeric-font-variant": "tabular-nums lining-nums"
  },
  "elevation": {
    "level-1": "0 1px 2px rgb(23 35 29 / 0.06)",
    "level-2": "0 8px 24px rgb(23 35 29 / 0.12)",
    "level-3": "0 18px 48px rgb(23 35 29 / 0.18)"
  },
  "motion": {
    "duration-fast": "120ms",
    "duration-spatial": "180ms",
    "ease-out": "cubic-bezier(0.2, 0, 0, 1)"
  }
}
```

Use the 4px spacing scale from `{spacing.1}` through `{spacing.16}`. Prefer `{spacing.3}`, `{spacing.4}`, `{spacing.5}`, `{spacing.6}`, and `{spacing.8}` for component composition. One-off spacing requires a documented geometry reason.

Desktop shell: 64px top bar, 248px navigation rail, and a content region capped around 1440px. Mission control prioritizes the exception queue; supporting metrics form a compact instrument strip rather than a hero or decorative card grid.

Density modes:

- **Operational compact (default):** 36px controls, 44–48px table rows, 12–15px copy.
- **Touch/narrow:** minimum 44px interactive targets, stacked primary actions, full-width critical controls.
- **Executive overview:** increase whitespace and summary scale through composition, not a second theme.

Responsive gates are 320, 760, and 1100px, with verification at each exact width. At 760px and below, navigation is an explicit modal drawer with a scrim; closed navigation is not focusable. At 320px, content reflows without page-level horizontal overflow. Tables may scroll inside a labelled region and must preserve row/column semantics.

## Elevation & Depth

The interface is near-flat. Hierarchy comes from spacing, border strength, surface contrast, and typography before shadow.

- Level 0: canvas and inline regions, no shadow.
- Level 1: panels use a crisp `{colors.border}` border; optional minimal shadow `0 1px 2px rgb(23 35 29 / 0.06)`.
- Level 2: sticky bars/drawers use `0 8px 24px rgb(23 35 29 / 0.12)`.
- Level 3: dialogs use `0 18px 48px rgb(23 35 29 / 0.18)` and an opaque surface.

No glassmorphism. Do not use blur as the primary separator. Never imply clickability through elevation alone.

Motion explains state or spatial relationships. Use 120ms for hover/focus feedback and 180ms for drawer/dialog entrance with a standard ease-out. No looping decoration, confetti, parallax, or animated KPI counts. Under `prefers-reduced-motion: reduce`, transitions and animations resolve effectively immediately without removing state feedback.

## Shapes

Radii are restrained: `{rounded.xs}` for dense controls, `{rounded.sm}` for buttons/fields, `{rounded.md}` for panels, `{rounded.lg}` for dialogs, and `{rounded.full}` only for badges/avatars. Tables and data regions may use `{rounded.none}` where continuity improves scanning.

Borders use `{colors.border}` by default and `{colors.border-strong}` for selected, draggable, or high-emphasis boundaries. Avoid nested rounded rectangles. Never turn every text/value group into a pill.

Iconography uses Lucide already present in the repository. Default icon sizes are 16px in controls, 18px in navigation, and up to 24px for empty states. Icons supplement text; they do not decorate every KPI. Every icon-only button has a task-specific accessible name and a minimum 36px desktop/44px mobile target.

## Components

**Buttons.** Primary actions use `{components.button-primary}` and appear once per decision region. Secondary buttons preserve context or offer lower-consequence alternatives. Danger actions require danger wording and confirmation when irreversible. Loading buttons retain width, announce progress, and prevent duplicate submission. Disabled controls include an explanation when the reason is not obvious.

**Forms.** Labels are visible and programmatically associated. Help/error text is adjacent and linked with `aria-describedby`. Error states use message + icon/text + border, never color alone. Inputs use 36px compact height and 44px on narrow/touch surfaces. Placeholder text is not a label.

**Badges.** Use semantic badge pairs. Badge text describes the state (`Out of service`, `Stale`, `Partial evidence`); do not use unlabeled dots. Keep badges short and sentence case.

**Data tables.** Use native table semantics, explicit headers, stable row identity, tabular numerals, and 44–48px default rows. The first column carries primary identity; secondary metadata stays in the same cell. Sticky headers require a nontransparent background. A horizontally scrolling wrapper receives a label and keyboard access only when scrolling is actually needed.

**Evidence cards.** Show evidence type, source, label, value, and observed time. Facts and interpretation remain separate. Stale or partial evidence displays the state adjacent to the affected value and explains decision impact.

**Safety and synthetic states.** The global synthetic banner remains persistent. Consequential synthetic controls and results repeat the qualifier at point of action. Never imply supplier contact, purchase, assignment, repair, device command, or return to service when those events did not occur. Safety-critical status uses danger styling plus explicit text and supporting context.

**Alerts and shared states.** Loading names the object and uses `aria-busy`; empty names what is absent; error states what failed and whether anything changed; stale includes timestamp; partial names present/missing sources; permission states preserve context and identify the required role/path; success persists near the affected object. Toasts supplement but never replace consequential proof.

**Dialogs, drawers, and command palette.** Use a labelled `role="dialog"`, `aria-modal="true"`, focus containment, Escape dismissal where safe, and focus restoration to the opener. Background interaction is unavailable while open. Destructive dialogs name impact in the title and action. Drawers preserve page context; dialogs interrupt only for a bounded decision.

**KPI/metric treatment.** Metrics are supporting instruments, not decorative statistics. Pair the numeric value with definition, denominator or comparison, and freshness when material. Use `{typography.numeric}` and avoid ornamental icons.

**Responsive shell.** Use accurate `header`, `nav`, `main`, and labelled complementary regions. Provide a skip link. Mobile navigation exposes `aria-expanded` and `aria-controls`, is hidden from interaction when closed, and has a dismissible scrim.

## Do's and Don'ts

### Do

- Lead each screen with location, current signal, and next accountable action.
- Use token references and semantic names; add a token only for a repeated decision role or stable system property.
- Keep facts, interpretations, approvals, and execution results inspectably separate.
- Verify 320/760/1100 widths, keyboard order, zoom/reflow, contrast, dialog focus, reduced motion, console output, and network requests.
- Extend the system through `DESIGN.md`, then regenerate every runtime/export artifact from that source.
- Use the brand/semantic/component distinction in app, email, deck, and report work. Cross-artifact consumers should use exported semantic values and preserve hierarchy; they should not copy component CSS.

### Don't

- Do not create a marketing hero, generic SaaS feature-card grid, glassmorphism, a purple gradient, decorative stats, or icon clutter.
- Do not invent customer data, live capability, production endpoints, or completed operational outcomes.
- Do not add one-off colors, arbitrary spacing, nested pills, or shadows to rescue weak hierarchy.
- Do not use green for every positive-looking element or red for decoration.
- Do not hide loading, empty, error, stale, partial, permission, safety, or synthetic boundaries.
- Do not add a component library while current React/CSS primitives remain sufficient.

Regenerate and validate on Windows from the repository root:

```bash
npm run design:lint
npm run design:generate
npm run design:check
```

The scripts call the exactly pinned `@google/design.md` 0.4.0 package entry point directly because its Windows npm shim can exit successfully without forwarding CLI output. The generator captures the CLI output without shell redirection, then derives TelemetryX runtime names from the same front matter. Commit regenerated outputs with every normative token change.

### Enforced audit scope and local geometry

`npm run design:audit` has a threshold of zero. It scans every authored CSS file under `src` plus runtime `.ts`, `.tsx`, `.js`, and `.mjs` source under `src` for raw color representations. In CSS it also rejects unambiguous duplicate declarations of a single normative typography value. Generated `tokens.css` and `tokens.generated.ts` are excluded by explicit provenance; tests and test setup are excluded because they are non-runtime fixtures. The audit does not claim repository-wide dimensional tokenization.

Local geometry remains intentionally authored when it describes bounded anatomy rather than a reusable design decision. Current justified classes are: 1px hairlines and borders; icon, avatar, meter, focus-outline, and status-dot dimensions; table/panel minimum row anatomy; chart percentages supplied from synthetic runtime data; responsive breakpoints and viewport-relative widths; modal viewport bounds; and the 760px responsive page-title compression whose 1.75rem value coincidentally equals the numeric token. Repetition that escapes these bounded classes is evidence for a new token and must be reviewed rather than silently allow-listed.
