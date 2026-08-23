# TelemetryX design-direction comparison

Decision date: 2026-08-22
Decision scope: one production direction for the OPERATE-first application surface.

## Shared brief

TelemetryX must help a fleet operator answer: where am I, what needs attention, who owns it, what evidence supports it, what safety boundary applies, and what can I do next? The visual language must preserve the existing industrial fleet foundation, disclose synthetic state at global and point-of-action levels, and avoid inherited third-party identities.

Method translated from the supplied video: use a specific brief and bounded references; compare directions; select one; encode it once; iterate in production; use original assets only when they solve a real communication problem; and use motion to explain state rather than decorate output.

References are principle-level only: operating-room legibility, industrial control labeling, fleet maintenance records, and contemporary high-density enterprise tables. No Streakline, Claude, Pinterest, or other third-party visual identity is copied.

## Direction A — Conservative / Field Ledger

- Keep the current layout and most card anatomy.
- Normalize colors to graphite, warm neutral, and operational green.
- Reduce radius and strengthen table typography.
- Lowest migration risk, but leaves the equal-card dashboard composition largely intact.

Best when: schedule risk outweighs the need to establish a distinctive hierarchy.

## Direction B — Strong-fit / Operating Ledger (selected)

- Treat the priority queue as the command center; supporting metrics become a compact instrument strip.
- Use warm mineral canvas, deep graphite/forest ink, one operational green, safety amber/red, and lime only for sparse live/system signals.
- Use crisp borders, restrained 4/8/12px radii, near-flat elevation, and tabular numerals.
- Separate accountable action, evidence, and status through hierarchy rather than decorative cards.
- Use a production-safe UI system stack; motion is short, spatial, and removable.

Best when: fleet operators must scan exceptions, evidence, ownership, safety, and actions quickly while preserving trust.

Why selected: it evolves the repository's existing forest-and-neutral intent, directly fixes compositional hierarchy, and is sufficiently distinctive without introducing a trend or a new brand fiction. It is the clearest expression of “industrial operating precision with calm human accountability.”

## Direction C — Divergent / Signal Rail

- Use a darker persistent navigation rail, denser edge-to-edge data regions, square corners, and sparse high-visibility lime markers.
- Strongest control-room character and fastest at very high density.
- Higher risk of fatigue, harsher executive presentation, and excessive divergence from current light surfaces.

Best when: validated users work continuously in a fixed desktop control room and prioritize maximum density over cross-context calm.

## Decision boundaries

Ship only Direction B. Do not implement themes for A or C. Preserve Direction C as a future research hypothesis, not a hidden alternate theme. No custom illustration or generated imagery is needed for this system foundation; data, ownership, safety, and evidence are the visual content.
