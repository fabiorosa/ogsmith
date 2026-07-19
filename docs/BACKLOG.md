# OGsmith executable backlog

One ticket at a time. A milestone's review gate must pass before the next
milestone starts. Status: `todo`, `doing`, `done`.

## M0: Foundation

| ID  | Ticket | Status |
| --- | ------ | ------ |
| M0-1 | Monorepo scaffold: npm workspaces, TS strict configs, ESLint, Vitest wiring, root scripts | done |
| M0-2 | CI: verify workflow (lint, typecheck, test, build) green on empty packages | done |
| M0-3 | Fonts: commit Inter + JetBrains Mono subsets with OFL licenses; font loader with byte cache | done |

**Gate M0:** CI green; `npm test` runs in both packages; fonts load in a
node script.

## M1: Engine core

| ID  | Ticket | Status |
| --- | ------ | ------ |
| M1-1 | Theme system: token contract, 4 themes, contrast utility plus tests | done |
| M1-2 | `defineTemplate`, registry, zod schema with UI metadata vocabulary | done |
| M1-3 | `render()` via satori: element-tree helpers, font wiring, SVG output | done |
| M1-4 | Template 1: `blog-post` (1200×630) with SVG snapshots across 4 themes | done |
| M1-5 | `renderPng()` native (resvg-js) plus PNG hash determinism tests | done |
| M1-6 | wasm raster entry plus parity test (wasm hash equals native hash) | done |

**Gate M1:** blog-post renders identical bytes native/wasm in CI; contrast
tests pass on all 4 themes.

## M2: Template suite

| ID  | Ticket | Status |
| --- | ------ | ------ |
| M2-1 | Template 2: `product-launch` (1200×630) with tests | done |
| M2-2 | Template 3: `release-banner` (1600×900) with tests | done |
| M2-3 | Template 4: `quote-card` (1080×1080) with tests | done |
| M2-4 | Logo/image prop support (data URI), scaling rules, tests | done |

**Gate M2:** full (4 templates × 4 themes) snapshot and PNG matrix green;
each template's sample render reviewed against UI_SPEC art direction.

## M3: Studio

| ID  | Ticket | Status |
| --- | ------ | ------ |
| M3-1 | App shell: tokens, layout, topbar, panel/stage split, responsive sheet | todo |
| M3-2 | Engine web worker: boot, debounced render, loading/error states | todo |
| M3-3 | Schema-to-form generation (all control types), field validation UX | todo |
| M3-4 | Canvas stage: zoom, dimension readout, render glow, error panel | todo |
| M3-5 | Template gallery with live sample renders | todo |
| M3-6 | Theme picker plus custom accent with AA guard | todo |
| M3-7 | Export: PNG download, copy SVG, button state machine | todo |
| M3-8 | Shareable URL state (hash encode/decode, invalid-hash handling) | todo |
| M3-9 | Studio component tests plus Playwright smoke | todo |

**Gate M3:** smoke test green in CI; UI_SPEC pre-flight checklist passes
(spacing, states, hierarchy, no emoji, single accent).

## M4: Release

| ID  | Ticket | Status |
| --- | ------ | ------ |
| M4-1 | Core README (product-grade), handwritten API docs, usage examples | todo |
| M4-2 | Repo README with live demo link, screenshots, architecture summary | todo |
| M4-3 | GitHub Pages deploy workflow plus custom 404-to-app redirect | todo |
| M4-4 | npm publish dry-run, package.json metadata, provenance, `core-v0.1.0` | todo |
| M4-5 | Final pass: DECISIONS.md up to date, SESSION_STATE clean, license files | todo |

**Gate M4 (definition of done):** studio live on Pages; `npm i ogsmith`
works in a fresh project; CI fully green; docs complete.
