# OGsmith session state

## Current status

V1 complete and live.

- CI (`verify`): green on Linux, including native/wasm PNG byte parity.
- Studio deployed: https://fabiorosa.github.io/ogsmith/ (GitHub Pages,
  `deploy` workflow on every push to main).
- Engine: 4 templates × 4 themes, snapshot and hash tested. 77 core tests,
  8 studio tests, 1 Playwright smoke.
- `npm publish --dry-run` clean. Actual publish not done yet.

Note: the earlier account-wide `startup_failure` runs were a GitHub Actions
platform outage (confirmed on githubstatus.com), not a configuration issue.

## Remaining (optional, Fabio's call)

1. **npm publish**: `npm login` as the package owner, then `npm publish`
   inside `packages/core`. Tag `core-v0.1.0` afterwards.
2. **Custom domain**: point a CNAME (e.g. ogsmith.fabioux.com) at
   fabiorosa.github.io in the Pages settings.
3. **caselane CI**: its workflow also never ran during the outage; re-run
   it from the Actions tab to get a green badge there too.

## Standing rules

- No AI co-author trailers or markers anywhere.
- No em dashes in public-facing text.
- One rendering path; hash tests update only with intent.
