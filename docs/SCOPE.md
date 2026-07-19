# OGsmith V1 scope

## In scope (V1 portfolio release)

### Engine (`packages/core`, npm package `ogsmith`)

- `render()` and `renderPng()` public API, TypeScript strict, typed props.
- 4 built-in templates (each with feed-tested typography and complete theme
  support):
  1. **blog-post**: OG image for an article (1200×630).
  2. **product-launch**: OG image for a product/landing page (1200×630).
  3. **release-banner**: version/release announcement card (1600×900).
  4. **quote-card**: statement/quote card for social posts (1080×1080).
- 4 built-in themes, each a full token set, AA-contrast-verified:
  `graphite` (dark), `paper` (light), `midnight` (dark blue-black),
  `sand` (warm light).
- Bundled OFL fonts: Inter (400/500/600/800) plus JetBrains Mono (400/700),
  licenses committed.
- Custom template escape hatch (`defineTemplate`) with zod schema.
- Published to npm with README and handwritten API docs.

### Studio (`apps/studio`)

- Template gallery, editor with schema-generated controls, live preview,
  export PNG / copy SVG.
- Theme picker, custom accent color (with automatic AA contrast guard).
- Logo upload (client-side only, embedded as data URI).
- Shareable URL (state in hash fragment).
- Empty/loading/error states complete; keyboard accessible; responsive.
- Static deploy (GitHub Pages) with CI pipeline.

### Quality bar

- Vitest: engine unit tests, SVG snapshots, PNG pixel-hash determinism tests.
- Playwright: one smoke flow (open studio, edit title, export PNG).
- GitHub Actions: lint, typecheck, test, build on every push; deploy on main.
- Zero `any`, zero eslint-disable without a written reason.

## Out of scope (V1)

- AI generation of any kind.
- Social posting, scheduling, or API integrations.
- Accounts, persistence, server rendering service, telemetry.
- Free-form canvas editing (position/resize by hand).
- Batch/CLI generation (V2 candidate: `ogsmith` CLI).
- Animated or video output.
- i18n of the studio UI (English only).

## V2 candidates (documented, not promised)

- CLI: `npx ogsmith render blog-post --title "..." -o og.png`.
- Framework adapters (Next.js route helper, Astro integration).
- Template marketplace/community gallery.
