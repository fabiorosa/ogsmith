# OGsmith — product brief

## One-liner

OGsmith is an open-source studio and rendering engine for crafting pixel-perfect
Open Graph images, social cards, and release banners — what you see in the
editor is exactly what ships in the PNG.

## Problem

Every product on the internet needs share images: an OG image for the landing
page, a card for each blog post, a banner for every release announcement.
Today the options are:

- **Design tools (Figma, Canva):** manual, repetitive, easy to drift from the
  brand, and disconnected from the values that change (title, version, date).
- **Code-only generators (`@vercel/og`, satori scripts):** powerful but blind —
  you iterate by re-running code, there is no visual feedback loop, and
  non-developers on the team cannot touch them.
- **Hosted SaaS generators:** closed, paid, template-generic, and the preview
  frequently does not match the exported file.

The gap: a tool with a **real-time visual editor** on top of a
**deterministic rendering engine**, where preview and export are the same
artifact by construction.

## Solution

Two deliverables in one repository:

1. **`ogsmith` (npm package)** — a typed, deterministic SVG→PNG rendering
   engine. A template is a pure function of typed props; the same input always
   produces the same bytes, in Node and in the browser.
2. **OGsmith Studio (web app)** — a premium, client-only editor. Pick a
   template, edit content and theme with live preview, export PNG/SVG in one
   click. No account, no server, no telemetry.

## Who it is for

- Developers and founders shipping products who need share images that look
  designed, without opening a design tool.
- Teams that want share images as code (the engine) with an escape hatch for
  visual people (the studio).

## What makes it different

- **Parity by construction.** The preview IS the render output. The studio
  displays the exact SVG the engine produced; the PNG is a rasterization of
  that same SVG. There is no second rendering path that can drift.
- **Deterministic.** Fonts are bundled, layout is pure, no network at render
  time. Same props → same bytes, verified by tests in CI.
- **Craft-first templates.** A small set of opinionated, typographically
  serious templates — not 400 generic ones.

## Non-goals (V1)

- No AI content generation.
- No posting/scheduling to social networks.
- No accounts, storage, or server-side rendering service.
- No free-form drag-and-drop canvas (templates are parameterized, not blank).
- No animated output (static SVG/PNG only).

## Success criteria (portfolio release)

- Engine published to npm with typed API and documented templates.
- Studio deployed as a static site, usable end-to-end in under a minute.
- CI proves determinism: SVG snapshots + PNG pixel tests on every commit.
- README reads like a product, docs read like a senior engineer wrote them.
