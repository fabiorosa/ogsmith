# OGsmith agent contract

Read `docs/PRODUCT.md`, `docs/SCOPE.md`, `docs/ARCHITECTURE.md`,
`docs/DECISIONS.md`, `docs/UI_SPEC.md`, `docs/BACKLOG.md`, `docs/TESTING.md`,
and `docs/SESSION_STATE.md` before changing the product.

Work on exactly one `BACKLOG.md` ticket at a time. Do not begin the next
milestone before its review gate is satisfied. Update ticket status and
`SESSION_STATE.md` before ending the session.

## Product rules

- OGsmith is a public portfolio product and a real open-source tool, not a
  prototype or a tutorial clone.
- Determinism is the core promise: no template, theme, or raster change ships
  without its snapshot/hash tests updated intentionally.
- There is exactly one rendering path (engine SVG). Never introduce a second
  preview implementation.
- Do not expose or reuse concepts, data, or code from Fabio's private
  commercial projects.
- All code, comments, commits, docs, and UI copy in natural US English.
- House style: no em dashes anywhere (docs, UI copy, commits, repo
  metadata). Use periods, colons, or commas instead.
- Never invent users, testimonials, usage metrics, or benchmarks.

## Authorship rules

- Commits are authored by Fabio Rosa. No AI co-author trailers, no
  AI-generated markers in code, comments, or commit messages.
- Commit messages: Conventional Commits, subject ≤ 50 chars, body only when
  the why is not obvious.

## Engineering rules

- TypeScript strict everywhere; `any` is not an escape hatch.
- Templates are pure functions: no time, randomness, or environment reads.
- Fonts load only from the committed binaries.
- Engine code never imports from the studio; the studio consumes only the
  core public API.
- Material architectural decisions go to `docs/DECISIONS.md` as an ADR.
- Every bug fixed gets a regression test in the same commit.

## Design rules

- Dark premium shell per `docs/UI_SPEC.md` tokens: `#0e0f11` base, one green
  accent `#4cc38a`, cool grays only, tinted shadows.
- Generous spacing; hierarchy through scale and weight, not decoration.
- Complete loading, empty, error, disabled, hover, focus, and active states.
- No emoji in UI, no decorative gradients, no glassmorphism, no fake
  progress indicators, no lorem ipsum, no identical-card grids.
- Body text ≥ 14px; text contrast ≥ 4.5:1 (enforced by test for renders).

## Definition of done

A ticket is complete only when implementation, validation, states, tests,
and documentation are done, the full verify pipeline passes locally, and
`BACKLOG.md` + `SESSION_STATE.md` are updated.
