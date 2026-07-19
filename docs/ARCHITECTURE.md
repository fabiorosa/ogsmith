# OGsmith technical architecture

## Repository layout

npm workspaces monorepo:

```
ogsmith/
├── packages/
│   └── core/            # npm package `ogsmith`, the rendering engine
│       ├── src/
│       │   ├── engine/      # satori orchestration, font loading, SVG output
│       │   ├── raster/      # SVG to PNG (resvg), node + wasm entry points
│       │   ├── templates/   # built-in templates (pure functions)
│       │   ├── theme/       # theme tokens, color utilities, contrast checks
│       │   └── index.ts     # public API
│       ├── fonts/           # bundled OFL-licensed font binaries (versioned)
│       └── test/
├── apps/
│   └── studio/          # Vite + React SPA (client-only, static deploy)
│       └── src/
│           ├── editor/      # controls panel, template gallery, theme picker
│           ├── preview/     # live SVG preview + zoom/device chrome
│           └── export/      # PNG/SVG download via core wasm raster
├── docs/
└── .github/workflows/
```

## Rendering pipeline (the core idea)

```
TemplateProps (typed, validated)
        │
        ▼
Template fn → element tree (satori-compatible, no React runtime needed)
        │
        ▼
satori + bundled fonts → SVG string        ← single source of truth
        │                        │
        ▼                        ▼
Studio preview:            Export PNG:
render SVG directly        resvg(SVG) → PNG bytes
in the browser             (resvg-js in Node, resvg-wasm in browser)
```

**Parity by construction:** there is exactly one artifact, the SVG produced
by the engine. The studio preview displays that SVG as-is (`<img>` from a
blob URL). The PNG export rasterizes that same SVG. No parallel HTML/CSS
preview implementation exists, so preview and export cannot diverge.

## Determinism rules

- Fonts are bundled in the repo (OFL licenses committed alongside), loaded as
  bytes. No system fonts, no network fetches at render time.
- Templates are pure functions: `(props, theme) → element tree`. No Date.now,
  no randomness, no environment reads inside templates.
- resvg options are pinned (dpi, font settings) and identical in Node/wasm.
- CI runs SVG snapshot tests and PNG pixel-hash tests on Linux; a mismatch
  fails the build.

## Core public API (shape)

```ts
import { render, renderPng, templates } from "ogsmith";

const svg = await render(templates.blogPost, {
  title: "Designing a deterministic render pipeline",
  author: "Fabio Rosa",
  tag: "Engineering",
  theme: "graphite",
});

const png = await renderPng(templates.blogPost, props); // Uint8Array
```

- `render(template, props) → Promise<string>` returns SVG.
- `renderPng(template, props) → Promise<Uint8Array>` returns PNG.
- `templates` is the built-in template registry. Each entry carries a typed
  props schema (zod) used for validation and for generating the studio's
  editor controls.
- Custom templates: users can pass their own template function plus schema.

## Template control metadata

Each template exports a zod schema with per-field UI metadata (label, control
type, max length). The studio generates its form from this schema, so adding
a template requires zero studio changes. Templates self-register through the
registry; the engine and studio never need editing to accept a new one.

## Studio architecture

- Vite + React + TypeScript strict. No backend, no database, no auth,
  no cookies, no analytics. Deployable to GitHub Pages.
- State: single editor store (Zustand) with selected template, props, theme,
  and export settings. URL hash encodes state for shareable links.
- Rendering: engine runs in a web worker (satori + resvg-wasm) so typing in
  the form never blocks the UI; renders are debounced (~120 ms).
- Export: PNG via resvg-wasm in the worker; SVG as direct download.

## Stack summary

| Concern      | Choice                             |
| ------------ | ---------------------------------- |
| Language     | TypeScript strict (all packages)   |
| Layout/SVG   | satori                             |
| Raster       | @resvg/resvg-js (Node), @resvg/resvg-wasm (browser) |
| Validation   | zod                                |
| Studio       | Vite, React, Zustand, Tailwind CSS |
| Tests        | Vitest (+ Playwright smoke on studio) |
| CI           | GitHub Actions                     |
| License      | MIT                                |

## Deliberate contrasts with CaseLane (portfolio breadth)

| CaseLane                    | OGsmith                          |
| --------------------------- | -------------------------------- |
| Next.js server app          | Client-only SPA + npm library    |
| PostgreSQL, migrations      | No database at all               |
| Auth + multi-tenant RBAC    | No accounts, no server           |
| Business workflow domain    | Rendering/graphics engine domain |
