# Consuming and extending the TelemetryX design system

The system has five generated/synchronized layers:

1. `/DESIGN.md` — normative tokens, rationale, and usage rules.
2. `/design-tokens/tokens.json` — generated W3C DTCG interchange.
3. `/design-tokens/tailwind-v4.css` — generated Tailwind v4-style `@theme` interchange; the app does not use Tailwind.
4. `/src/design-system/tokens.css` — generated runtime CSS custom properties with TelemetryX semantic names.
5. `/src/design-system/tokens.generated.ts` — generated typed/runtime manifest consumed by the component lab.

Run `npm run design:lint` after changing `DESIGN.md`, then `npm run design:generate` and `npm run design:check`. Commit all four generated artifacts. `npm run design:audit` enforces a zero raw-color-literal threshold outside generated token CSS. The exactly pinned `@google/design.md` 0.4.0 package is a development dependency and is not shipped in the application bundle.

## Use in React and CSS

- Start with semantic variables (`--ds-color-text-muted`, `--ds-color-danger-soft`, `--ds-space-4`), not palette values.
- Reuse the existing button, badge, panel, field, table, banner, and `ModalDialog` anatomy before creating a variant.
- Keep domain state and product truth in React/domain code; CSS only expresses visual state.
- Inspect changes in the in-app Design system lab using the explicit sidebar demo control. Fixtures are synthetic and are not product claims.

## When to add a token

Add a token when a value represents a repeated decision role, a stable system property, or a cross-artifact contract. Examples: focus color, compact control height, danger container, or spatial transition duration.

Do not add a token to preserve a one-off visual adjustment. First fix composition, use the existing scale, or document why the geometry cannot conform. A repeated one-off is evidence of a missing pattern; a single exception is not automatically a token.

## Semantic naming

Name what the value does, not what it looks like: `danger-soft`, `surface-subtle`, `text-muted`, `control-height`. Brand names are limited to identity-bearing values. Component names alias semantic roles and must not become alternate palettes.

Never encode status as `red`/`yellow`/`green`; users and nonvisual consumers need the semantic meaning. Every status also has explicit text.

## Accessibility gates

Every touched workflow must verify:

- WCAG AA text/control contrast and a visible focus indicator.
- Native control and landmark semantics with task-specific accessible names.
- Logical keyboard order; dialog focus containment, Escape behavior where safe, and focus restoration.
- 44px mobile hit targets, reflow at 320/760/1100, and no page-level horizontal overflow.
- Color-independent status, synthetic, safety, error, stale, and partial meaning.
- Reduced-motion support and readable metadata (12px minimum for operational information).

Automated tests prove material semantics and behavior. DESIGN.md lint proves token references and declared component contrast. Browser inspection and screenshots prove composition and responsive rendering; none of these gates substitutes for the others.

## Design review checklist

- Is this an OPERATE surface first, and is the signal/owner/next action dominant?
- Does it preserve facts, interpretation, approval, and execution as distinct states?
- Is synthetic/demo truth repeated at consequential points of action?
- Is a new card, icon, color, radius, or shadow carrying meaning—or compensating for weak hierarchy?
- Does the component behave in loading, empty, error, stale, partial, permission, success, and disabled states where material?
- Does it work at 320/760/1100, keyboard-only, reduced motion, and zoom/reflow?
- Are token, component-lab, test, documentation, and generated-export changes synchronized?

## Governance and review authority

A normative token change requires design-system review because it affects future surfaces and exports. A new component primitive requires a demonstrated repeated problem, documented anatomy/states, keyboard and screen-reader behavior, responsive rules, and a component-lab example. Product-specific composition can be reviewed within its workflow as long as it uses existing contracts.

Avoid one-off styles by searching existing semantic variables and component anatomy first. When extending, add the smallest coherent layer and migrate existing duplicate use in the same reviewable change.

## Cross-artifact guidance

Future email, deck, and report work should consume DTCG or Tailwind-style semantic values as interchange, preserve the Operating Ledger hierarchy, use the system font strategy or an explicitly approved embedded asset, and retain synthetic/safety qualifiers. Do not copy application layout CSS into non-app artifacts. Translate hierarchy, typography, semantic color, spacing rhythm, data formatting, and truth boundaries to the target medium.

This branch intentionally creates no unrelated email, deck, or report assets.
