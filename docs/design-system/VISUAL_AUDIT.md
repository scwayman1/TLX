# TelemetryX visual audit — pre-implementation

Date: 2026-08-22
Branch baseline: `aae5ffb`
Primary archetype: **OPERATE**, with **MONITOR** secondary.

## What the interface already gets right

- The application is an operating shell, not a marketing site: persistent navigation, an exception queue, tables, evidence, ownership, and approval boundaries are already present.
- The warm off-white canvas and forest cue give TLX an early industrial identity worth evolving.
- Mission control leads with an exception and an accountable owner. The investigation keeps facts, interpretation, source, approval, and synthetic output visibly separate.
- Native controls, status text, table headers, a synthetic-data banner, and reduced-motion foundations provide a credible base.

## Compositional problems (not token problems)

1. **Four equal KPI cards dominate before the exception.** This makes Mission control read like a generic SaaS dashboard. The decision queue should be the visual anchor; metrics should support it.
2. **Too many cards share equal treatment.** White rounded containers, similar padding, and equal elevation flatten the hierarchy between safety-critical work, supporting metrics, evidence, and optional agent content.
3. **Priority actions are visually split.** Review and investigate compete more than they should. Investigation is the dominant next action; review is supporting context.
4. **Investigation density becomes microscopic.** Essential source, rationale, timeline, and tool metadata use 8–11px text. Dense is useful; tiny is not.
5. **Secondary domain pages use a generic stat strip plus two-card grid.** It is broad product scaffolding, not the critical design target; this branch should unify it without implying new capability.
6. **Mobile navigation is only moved off-canvas.** Closed controls remain mounted and likely focusable; there is no scrim/dismiss relationship.
7. **Dialogs are shaped like dialogs but not complete interaction systems.** Focus is not contained, background content remains available, and the command palette does not reliably restore focus.
8. **The design language overuses icons as decoration.** KPI corner icons and repeated agent symbols compete with the values and status labels.

## Token/system problems

1. Colors, spacing, radii, type sizes, and shadows are distributed as magic values across three CSS files.
2. Existing custom properties mix brand and surface roles (`--green`, `--soft`) and do not distinguish brand, semantic, or component tokens.
3. Muted text values fail WCAG AA in several known combinations; evidence metadata and table supporting text are affected.
4. Typography depends on a runtime Google Fonts request. This weakens offline reliability and creates an unapproved external request.
5. Radius and elevation are too generous/inconsistent for industrial operating precision.
6. Button, field, badge, table, focus, motion, and density rules are patterns but not documented contracts.
7. No portable token output exists for future app, email, report, or deck consumers.

## Baseline slop score

**6/10.** The product structure is credible, but compositional sameness, generic KPI prominence, tiny metadata, repeated card anatomy, icon garnish, and uncodified magic values make the UI feel more template-derived than operationally authored. Recoloring alone would not fix it.

## Migration priorities

1. Reweight Mission control around the priority queue and safety context.
2. Establish semantic tokens and production-safe typography before component styling.
3. Make compact density legible: minimum 12px metadata, strong tabular numerals, predictable rows.
4. Convert buttons, badges, fields, banners, panels, tables, and dialogs into bounded system patterns.
5. Complete directly exposed keyboard, naming, focus, responsive, and synthetic-state boundaries.
6. Add a synthetic-fixture component lab so future changes can be inspected without inventing product behavior.
