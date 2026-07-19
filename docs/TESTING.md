# OGsmith — test strategy

## Principles

- Determinism is the product's core claim → it is the most-tested property.
- Tests run headless on Linux CI; no browser needed for engine tests.
- A template or theme cannot ship without its parity and contrast tests.

## Layers

### 1. Engine unit tests (Vitest, `packages/core`)

- Props validation: every template schema rejects invalid input with a
  useful message; boundary cases (max lengths, empty optionals).
- Theme tokens: every theme is complete (no missing token) — structural test
  over the token map.
- Contrast: for every (template, theme) pair, computed text/background
  contrast ≥ 4.5:1 (automated WCAG check over the token roles each template
  uses).

### 2. SVG snapshot tests

- For every (template, theme) with fixed sample props: rendered SVG matches
  the committed snapshot byte-for-byte.
- Snapshot updates require an intentional `--update` run and show up in code
  review as readable SVG diffs.

### 3. PNG determinism tests

- `renderPng` output hashed (sha256) and compared to committed hashes for a
  fixed matrix of (template, theme, size).
- Same test file runs the wasm raster path and asserts **identical hashes**
  to the native path — this is the preview↔export parity proof.

### 4. Studio tests

- Component tests (Vitest + Testing Library): schema→form generation renders
  the right controls; error/empty/loading states appear per UI_SPEC.
- Playwright smoke (CI, chromium only): open studio → pick template → edit
  title → wait for render → export PNG → assert non-empty download and
  expected dimensions.

### 5. Static gates

- `tsc --noEmit` strict across workspaces.
- ESLint (typescript-eslint strict) — no disabled rules without an inline
  reason comment.
- `npm audit --omit=dev` advisory review on release.

## CI pipeline (GitHub Actions)

| Job     | Trigger        | Steps                                        |
| ------- | -------------- | -------------------------------------------- |
| verify  | push, PR       | install → lint → typecheck → engine tests → snapshot/PNG tests → studio build |
| e2e     | PR to main     | Playwright smoke against built studio        |
| deploy  | push to main   | build studio → GitHub Pages                  |
| release | tag `core-v*`  | build core → npm publish (manual approval)   |

## What is deliberately not tested

- Visual "beauty" — enforced by spec review (UI_SPEC), not assertions.
- Cross-browser rendering of the studio chrome beyond chromium smoke —
  the rendered artifact itself is browser-independent by design.
