# OGsmith — architecture decisions

Format: context → decision → consequences. Newest last.

## ADR-001 — satori + resvg over headless browser rendering

**Context.** The engine must turn a layout into SVG/PNG identically in CI,
Node, and the browser. Puppeteer/Playwright screenshots are the common
approach but depend on a browser binary, system fonts, GPU/AA differences,
and are slow and non-deterministic across platforms.

**Decision.** satori (element tree → SVG via embedded layout engine) +
resvg (SVG → PNG) with bundled fonts. No browser in the render path.

**Consequences.** Deterministic bytes, testable by hash; small runtime;
works in a web worker via wasm. Cost: satori supports a CSS subset
(flexbox, no grid), so templates are designed within that subset.

## ADR-002 — preview displays the engine's SVG, not an HTML replica

**Context.** Studio needs live preview. The tempting shortcut is an HTML/CSS
replica of each template for "fast" preview, with the engine used only at
export. Dual pipelines drift — same rule, two semantics — and preview/export
parity dies (known failure mode; see also CaseLane's sibling principle).

**Decision.** The preview renders the exact SVG string produced by the
engine (blob URL in an `<img>`). Export rasterizes that same SVG.

**Consequences.** Parity by construction; zero drift possible. Cost: preview
latency equals engine latency — mitigated with a web worker + debounce,
which is acceptable (<50 ms typical render).

## ADR-003 — client-only studio, no backend

**Context.** A server would enable saved projects and a render API, but adds
auth, storage, cost, and operational surface — and duplicates what the npm
package already offers programmatically.

**Decision.** Studio is a static SPA. State lives in the URL hash. Uploads
(logo) stay client-side as data URIs.

**Consequences.** Free hosting, zero ops, no privacy surface, instant load.
Also a deliberate portfolio contrast with CaseLane (which demonstrates the
server side). Cost: no persistence beyond the shareable URL — accepted for
V1 and documented in SCOPE.

## ADR-004 — templates as schema-carrying pure functions (registry pattern)

**Context.** Studio needs editing controls per template; hardcoding forms
per template couples the app to every template and makes community templates
impossible.

**Decision.** A template = pure render function + zod schema with UI
metadata. The registry is the single integration point; the studio generates
its form from the schema.

**Consequences.** Adding a template touches zero studio code; custom
templates get the full editor for free. Cost: control types are limited to
the supported metadata vocabulary (text, textarea, select, color, image).

## ADR-005 — npm workspaces monorepo, no build orchestrator

**Context.** Two packages (core, studio) share types and a release flow.
Turborepo/Nx add caching and task graphs — and configuration weight.

**Decision.** Plain npm workspaces; scripts composed in the root package.

**Consequences.** Anyone can read the repo without learning a tool. If the
workspace count grows (CLI, adapters in V2), revisit.

## ADR-006 — bundled OFL fonts, committed to the repo

**Context.** Font loading is the #1 source of render divergence (system
fonts differ per OS; network fonts differ per fetch).

**Decision.** Commit Inter + JetBrains Mono binaries (subset, weights listed
in SCOPE) with their OFL licenses. The engine only ever loads these bytes.

**Consequences.** Same glyphs everywhere, forever; repo grows by ~1 MB —
accepted. License compliance is explicit (OFL permits redistribution with
the license file, which we include).
