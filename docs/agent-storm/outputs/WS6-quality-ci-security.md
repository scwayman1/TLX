# WS6 — Quality, CI, security, and accessibility audit

**Linear:** SCO-21  
**Audit time:** 2026-08-22T08:35:34-07:00  
**Scope:** current checkout at `C:\Users\ScottWayman\Documents\TelemetryX\TLX`; agent-storm contracts, package scripts/configuration, current React/domain source, tests, repository history, ignore rules, GitHub controls, built preview, dependency metadata, and high-confidence secret/live-target patterns.  
**Change boundary:** audit only. No product code was modified.

## Executive verdict

**Main is locally buildable and its existing tests are green, but WS6 acceptance is not met.** Lint, all 16 tests, build, and both full and production-only npm vulnerability audits passed. Five consecutive test runs also passed. However, GitHub has no workflow, branch protection, or ruleset; the preview makes a live request to Google Fonts; no secret scanner or accessibility gate exists; `.gitignore` does not cover common secret files; and browser axe scans found a critical unnamed button plus serious contrast failures across every sampled state.

The repository is a credible demo baseline, not yet a protected/reproducible quality baseline.

> **Audit provenance and reconciliation (2026-08-22):** findings above were captured against commit `8e8b23a`, before PRs #2–#4 merged. Current `main` additionally has `.github/workflows/ci.yml` whose required `quality` check runs install, lint, tests, build, and the production dependency audit on every pull request and push, protected `main` requiring that check and resolved review comments, and 24 passing investigation/domain tests. Statements such as "no workflow exists" and "every check is voluntary" describe the audited `8e8b23a` checkout, not the delivered tree. Findings that remain valid against current `main`: Google Fonts runtime request, `.gitignore` secret-file coverage gaps, absent accessibility/secret-scan/CodeQL gates, and preview external-request E2E enforcement.

## Contract used

The governing storm documents require:

- `npm run lint`, `npm test -- --run`, and `npm run build` before review (`docs/agent-storm/README.md:60-67`; `WORKSTREAMS.md:30-38`).
- Actual command output, test-first behavior, no repository secrets or live targets, and branch-protection-suitable gates (`WORKSTREAMS.md:49-56`).
- Keyboard, reduced-motion, focus, contrast, and responsive verification (`WORKSTREAMS.md:12-19`).
- Synthetic-only behavior, no credentials/customer data, and no production integrations (`README.md:39-47`).
- Deterministic fixtures/reset and CI gates as mitigation for demo reliability risk R-006 (`REGISTERS.md:11-13`).

## Grounded verification results

Commands below were actually run from the repository root. Output is condensed only where noted.

| Check | Actual result | Verdict |
|---|---|---|
| `npm run lint` | `oxlint`; exit 0; no findings printed | Pass |
| `npm test -- --run` | Vitest 4.1.11; **4 files passed, 16 tests passed**; duration 5.47s | Pass |
| `npm run build` | TypeScript build + Vite 8.2.2; 1,806 modules; JS 228.83 kB (70.87 kB gzip), CSS 20.44 kB (5.25 kB gzip); exit 0 | Pass |
| `npm audit --audit-level=high` | `found 0 vulnerabilities`; exit 0 | Pass at audit time |
| `npm audit --omit=dev --audit-level=high` | `found 0 vulnerabilities`; exit 0 | Pass at audit time |
| `npm outdated` | `@types/node` 24.13.3 → 26.2.0; TypeScript 6.0.3 → 7.0.2; exit 1 due outdated packages | Informational; major upgrades should be deliberate |
| Five-loop `npm test -- --run --reporter=dot` | Runs 1–5 all printed `PASS` | No flake observed in this small sample; not proof of absence |
| `git diff --check` | `git diff --check: clean` | Pass for the checkout at execution time |
| `curl --fail --silent --show-error http://127.0.0.1:4173/` | `preview ready: HTTP success` | Built preview served successfully |
| `node --version`; `npm --version` | Node v22.23.2; npm 12.0.2 | Evidence only; versions are not pinned in repo |

### Test inventory and history

Current tests are:

- `src/App.test.tsx`: 5 UI integration tests.
- `src/domain/investigation.test.ts`: 5 domain tests.
- `src/domain/inventory.test.ts`: 3 domain tests.
- `src/domain/work-orders.test.ts`: 3 domain tests.

`git log -- ...test...` showed tests introduced or changed in commits `fd28160`, `32e09c1`, `7096e04`, `ce12a66`, and `8e8b23a`. This establishes test history, **not** witnessed RED-GREEN evidence: commit history alone does not prove that each new behavior's test was observed failing before implementation.

No coverage script, coverage provider/configuration, minimum threshold, E2E suite, visual-regression suite, or accessibility test dependency is present in `package.json`/`vite.config.ts`.

## CI and repository-control findings

GitHub API calls were run against `scwayman1/TLX`:

- Repository is public, active, and defaults to `main`.
- `GET /branches/main/protection` returned HTTP 404: **Branch not protected**.
- `GET /rulesets` returned `[]`.
- `GET /actions/workflows` returned `total_count: 0`.
- The checkout has no tracked `.github` workflow files.

Therefore every current check is voluntary and local. A contributor can merge/push without lint, tests, build, audit, accessibility, secret-scan, review, or linear-history enforcement.

### Recommended required CI checks

Use a pinned Node 22.x environment and `npm ci`; cache npm's download cache, not `node_modules`. Give workflows read-only permissions by default.

1. **`quality / lint-type-build`**
   - `npm ci`
   - `npm run lint`
   - `npx tsc -b --pretty false` (or retain typecheck inside build)
   - `npm run build`
2. **`quality / unit`**
   - `npm ci`
   - `npm test -- --run`
   - add coverage and enforce an initial ratcheting threshold, especially branches in domain transitions; do not invent a high threshold before measuring baseline.
3. **`quality / e2e-accessibility`**
   - Playwright browser test against the production build.
   - Run `@axe-core/playwright` on mission control, investigation proposed/approved/rejected/completed, assets, drawer, command palette, and mobile navigation.
   - Include keyboard-only flows, focus trap/restore, reduced-motion emulation, 320 px viewport, and offline/no-external-request assertion.
4. **`security / dependency-review`**
   - `npm audit --audit-level=high` and `npm audit --omit=dev --audit-level=high` on scheduled/default-branch runs.
   - GitHub dependency review on PRs; Dependabot weekly updates grouped by ecosystem.
5. **`security / secrets`**
   - Gitleaks with a committed config/baseline and full-history scan on initial adoption; PR scans thereafter.
   - Enable GitHub secret scanning and push protection for this public repository.
6. **`security / codeql`**
   - JavaScript/TypeScript CodeQL on PR/default branch; keep workflow permissions minimal.

### Recommended branch/ruleset gates

For `main`:

- Require pull requests; at least one approval; dismiss stale approvals after new commits.
- Require conversation resolution and the five named checks above.
- Require branch to be up to date or use merge queue; cancel superseded CI runs.
- Block force pushes and deletion; restrict bypass to an audited emergency role.
- Require linear history and one issue/branch as the storm contract specifies.
- Do not allow required checks to run with write tokens on untrusted PR code.

## Security, secrets, and live-target scan

### What was scanned

A read-only Python regex scan traversed 33 repository text files while excluding `.git`, `node_modules`, and `dist`. It checked current files for private-key headers, AWS access-key IDs, GitHub token formats, OpenAI-style keys, JWTs, and quoted credential assignments. It also scanned `git log -p --all --no-ext-diff --no-textconv` for the high-confidence token formats. A source-only scan checked dangerous DOM/eval, browser storage/cookies, and runtime network APIs.

### Results

- **No high-confidence current secret hit.**
- **No high-confidence reachable-history secret hit.**
- **No suspicious secret/credential filename found.**
- `git ls-files` found no tracked `.github` files and no tracked env/secret-like filenames.
- `command -v gitleaks` and `command -v trufflehog` returned no path, so neither specialist scanner was run. The regex result must not be treated as equivalent to Gitleaks/TruffleHog entropy/rule coverage.
- No `dangerouslySetInnerHTML`, `.innerHTML`, `eval`, `Function`, browser storage/cookie, `fetch`, XHR, WebSocket, or axios usage was found in current source.
- `npm audit` reported zero vulnerabilities in both full and production-only dependency sets at audit time.

### Blocking live-target finding

`src/index.css:1` imports:

`https://fonts.googleapis.com/css2?family=DM+Sans...&family=Manrope...`

The built preview's browser resource timeline confirmed a runtime request to that URL. This is a real external target and hidden network dependency. It violates WS6's literal “no ... live targets” acceptance and can make an offline/restricted-network demo visually inconsistent. The additional `cdnjs.cloudflare.com` request in the audit browser was instrumentation used to inject axe and is not application source.

**Recommendation:** self-host approved font files or use the system stack, remove the runtime import, and add an E2E test that fails on any non-local request.

### Ignore-policy gap

`git check-ignore -v dist node_modules .env .env.local credentials.json secrets.json` confirmed `dist`, `node_modules`, and `.env.local` are ignored. It produced no ignore match for `.env`, `credentials.json`, or `secrets.json`. `.gitignore` also lacks explicit private-key/certificate patterns.

**Recommendation:** ignore `.env`, `.env.*` with an allowlisted `.env.example`, common credential/secret files, and private keys; pair this with push protection rather than relying on ignore rules. Never add a real credential to test the rule.

### Additional bounded hardening

- Pin Node/npm expectations (`engines`, `.nvmrc`/Volta, or CI setup) to make `npm ci` reproducible.
- Add a basic production security-header contract at deployment (CSP, `X-Content-Type-Options`, frame policy, referrer policy). The static app currently contains no deployment configuration, so header behavior was **not verified**.
- Generate an SBOM/provenance artifact on release if the demo becomes distributable. This is a recommendation, not a current claim.

## Accessibility audit

### Automated execution

The first attempt, `npx --yes @axe-core/cli http://127.0.0.1:4173 --exit`, **failed** before scanning because the transient package could not spawn `chromedriver.exe` (`ENOENT`). That check is not claimed as passing.

A fallback browser scan successfully loaded the built preview, fetched axe-core 4.10.2 as audit instrumentation, and executed `axe.run(document)` on five states. Counts below are affected DOM nodes per rule and are state-specific; do not sum them as unique defects.

| State | Violations observed | Pass rules | Incomplete/manual-review rules |
|---|---|---:|---|
| Mission control | `button-name` critical: 1 node (`.icon-button`); `color-contrast` serious: 22 nodes | 31 | contrast 3 nodes; heading order 6 nodes |
| Investigation / proposed tool | `color-contrast` serious: 25 nodes; `landmark-unique` moderate: 1 node | 32 | contrast 3 nodes |
| Assets | `color-contrast` serious: 23 nodes | 35 | contrast 3 nodes |
| Asset drawer | `color-contrast` serious: 36 nodes; `aria-allowed-role` minor: 1 node (`.drawer`) | 40 | contrast 3 nodes |
| Command palette | `color-contrast` serious: 25 nodes | 40 | contrast 3 nodes |

Representative contrast failures include nav labels, eyebrows, KPI supporting text, table headers/secondary text, locations, investigation metadata/timestamps, drawer metadata, and palette helper/close text. The critical accessible-name failure is the calendar icon button in Fleet health (`src/App.tsx:110`).

### Positive controls present

- Global `:focus-visible` styles exist (`src/index.css:2`).
- A `prefers-reduced-motion: reduce` override exists (`src/index.css:3`).
- CSS contains responsive breakpoints at 1100 px and 760 px (`src/App.css`).
- Toast uses `role="status"` and `aria-live="polite"` (`src/App.tsx:92`).
- Asset drawer focuses its close button and restores prior focus on unmount (`src/App.tsx:152`).
- Command palette has an accessible dialog label and autofocus input; Escape globally closes overlays.

These controls are present in source; only the axe findings above were browser-automated. Reduced-motion behavior, zoom/reflow, screen-reader announcements, and keyboard traversal were not manually certified.

### Material accessibility gaps

- Contrast failures are release-blocking under the WS2 acceptance contract.
- The Fleet health calendar icon has no accessible name.
- There is no automated accessibility dependency or CI gate.
- Dialogs set `aria-modal`, but source shows no focus trap and no background `inert` handling. Drawer focus restore is positive but does not contain Tab focus; the command palette relies on autofocus only.
- The drawer's `aside role="dialog"` triggered `aria-allowed-role`; use an appropriate dialog container/element and verify with axe.
- Investigation introduces a second unlabelled complementary landmark, triggering `landmark-unique`; label complementary regions or use a non-landmark container.
- Heading-order findings require human review; the initial scan marked six nodes incomplete rather than confirmed violations.
- Current UI tests use `fireEvent` and do not exercise real keyboard tab order, focus containment, reduced motion, contrast, responsive layout, or screen-reader naming comprehensively.

## Determinism and quality gaps

- There is no explicit demo reset control or reset test. Reload currently reconstructs component state, but the critical reset contract is undocumented and unverified.
- Source uses `Date.now`, `Math.random`, `new Date`, `toLocaleString`, and a 2.8-second timeout. Generated investigation/tool IDs, timeline/audit timestamps, locale rendering, and toast timing are not injected/frozen. This weakens exact replay, snapshot stability, and cross-timezone reproducibility.
- Tests cover the happy navigation path and core domain guards, but not rejected/completed tool UI, empty search, mobile nav, offline operation, reset, locale/timezone, keyboard containment, error/stale/partial/permission states, or all consequential-action boundaries.
- No coverage baseline exists, so “16 passing” does not quantify untested branches.
- `App.tsx` concentrates most surfaces and demo fixtures in one 26 kB file; this increases regression blast radius. Refactoring is not required for WS6, but future behavior should be separated behind tested contracts rather than broadening the monolith.

## Test-first remediation plan (RED → GREEN → REFACTOR)

Every production change below starts with a test that is run and recorded failing on the branch before implementation.

1. **P0 — Accessibility names and contrast**
   - RED: Playwright + axe tests for each sampled state; explicit accessible-name assertion for Fleet health calendar control; contrast failures captured as baseline evidence.
   - GREEN: add the missing name and adjust tokens/styles until axe has zero critical/serious violations on those states.
   - REFACTOR: centralize accessible icon-button and text-color tokens; rerun lint, unit, E2E/axe, and build.
2. **P0 — Offline/live-target contract**
   - RED: production-preview E2E test fails when any request host is not `127.0.0.1`/the app origin.
   - GREEN: remove Google Fonts import and self-host approved assets or use system fonts.
   - REFACTOR: centralize network allowlist and document intentional exceptions (currently none).
3. **P0 — Deterministic reset**
   - RED: E2E flow mutates navigation, filter, drawer, investigation approval/tool state, then reset must restore exact fixture state and focus; initially fails because no reset exists.
   - GREEN: introduce a bounded reset contract and injected/frozen clock/ID source without destructive external effects.
   - REFACTOR: share a fixture factory across UI/domain tests; run in at least two timezones/locales.
4. **P0 — Dialog keyboard behavior**
   - RED: `userEvent.tab`/Playwright tests prove focus must stay inside drawer/palette, Escape closes, and focus returns to opener; background controls must be unavailable while modal.
   - GREEN: implement focus containment/inert semantics and correct dialog/landmark roles.
   - REFACTOR: reusable tested modal primitive.
5. **P1 — State and consequence regression matrix**
   - RED tests for investigation rejection and completed output, no execution before approval, no purchase/assignment side effect, empty/error/stale/partial/permission states, mobile navigation, and search no-results.
   - GREEN smallest behavior/state contract only; no feature expansion.
   - REFACTOR duplicated fixtures/helpers after all tests pass.
6. **P1 — Security/repository controls**
   - RED CI fixture or scanner test demonstrates that a safe fake token pattern is detected and an external target is rejected (never use a real secret).
   - GREEN add Gitleaks, dependency review/audit, CodeQL, hardened ignore rules, and read-only workflow permissions.
   - REFACTOR ratchet scanner baselines to zero unexplained findings.
7. **P1 — Coverage and CI reliability**
   - Measure coverage first, then add a modest threshold that current main can meet; raise it only with new tested behavior.
   - Run tests/build on Windows and one Linux CI runner if the demo must be portable; pin Node 22.
   - Add a scheduled repeat/shard run to detect flakes, recording seeds and artifacts on failure.

## Decision and escalation

- **Escalation required under WS6:** material accessibility failures, a live external target, and an unprotected/failing-open merge path are present.
- **No secret exposure was found by the checks actually run**, but specialist secret scanning remains absent.
- **Recommended merge decision for SCO-21:** do not mark quality/safety acceptance complete until P0 accessibility, offline/live-target, deterministic reset, and required CI/branch gates have witnessed RED-GREEN evidence and pass on a protected PR.

## Handoff

Quality owner should open bounded issues for: (1) CI/ruleset, (2) browser accessibility + keyboard fixes, (3) offline font removal, (4) deterministic reset/clock-ID injection, and (5) secret scanning/ignore hardening. WS4 should implement product-facing remediations test-first; repository owners must enable GitHub protection because code changes alone cannot enforce it.
