# OGsmith session state

## Current status

All V1 milestones (M0 through M4) are implemented and green locally:

- Engine: 4 templates × 4 themes, SVG snapshots, PNG sha256 hashes,
  native/wasm byte parity proven by test. 77 core tests passing.
- Studio: gallery, schema-generated editor, worker rendering, theme picker
  with AA accent guard, PNG/SVG export, shareable hash URLs. 8 component
  tests plus 1 Playwright smoke passing.
- Docs: root README with screenshots, engine README with API docs.
- `npm publish --dry-run` clean (41 files, LICENSE and OFL texts included).

## Blocked on external action (Fabio)

1. **GitHub Actions is disabled account-wide**: every run ends in
   `startup_failure` with no logs, in this repo and in caselane (its CI has
   never run). Open https://github.com/fabiorosa/ogsmith/actions and follow
   the banner (usually billing verification in Settings, then Billing).
   Once unlocked: re-run the `verify` workflow, then the `deploy` workflow
   publishes the studio to GitHub Pages.
2. **GitHub Pages**: after the first successful deploy run, confirm
   Settings, then Pages shows the site at
   https://fabiorosa.github.io/ogsmith/.
3. **npm publish** (optional, when ready): `npm login` as the owner, then
   `npm publish` inside `packages/core`. Dry-run is already verified.

## Next steps after unblock

- Re-run CI, confirm the verify and e2e jobs are green on Linux.
- Add the live demo link to the root README once Pages is up.
- Consider tagging `core-v0.1.0` and publishing to npm.

## Standing rules

- No AI co-author trailers or markers anywhere.
- No em dashes in public-facing text.
- One rendering path; hash tests update only with intent.
