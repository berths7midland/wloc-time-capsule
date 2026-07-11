# WLOC Security Review

Review date: 2026-07-10

Upstream reviewed: `Yu9191/wloc` at commit `eec07a8dc8de6dbaee8eac1fb376e4d03020154a`. The upstream `main` branch still pointed to that commit when this review was performed.

## Findings and mitigations

1. Upstream modules followed mutable `main` URLs for scripts, icons, and the module itself. Published modules in this repository only reference account-owned GitHub and Cloudflare endpoints.
2. The picker loaded executable Leaflet assets from `unpkg.com`. Leaflet 1.9.4 is now pinned under `vendor/leaflet/` and served by the account-owned Worker and Pages deployments.
3. The parse API followed arbitrary user-supplied URLs and redirects. Fetches are now restricted to HTTPS Apple Maps and AMap hosts, redirect targets are revalidated, invalid coordinate ranges are rejected, and response bodies are limited to 128 KiB.
4. Upstream shortcut links were controlled outside this repository. They were removed from all published modules.
5. The Shadowrocket scripts operate on intercepted Apple location responses and device-local persistent storage. The reviewed scripts do not use `eval`, dynamic code loading, WebSockets, or unknown telemetry endpoints.
6. Coordinate save/query/clear requests now use `https://wloc.legclub.cyou/wloc-settings/save`. If the proxy module does not intercept the request, the account-owned Worker returns a non-persisting `409` response instead of forwarding coordinates to Apple.
7. The parse API accepts only GET/OPTIONS, limits input to 2 KiB, applies a 5-second outbound timeout, and returns correct CORS preflight responses.
8. The picker defaults to an offline grid. Third-party map tiles are requested only after the user explicitly selects an online layer. Inline event handlers were removed and each page response uses a CSP script nonce.
9. Local and GitHub deployments share a mandatory clean-worktree, test, link-audit, and SHA-256 manifest gate.

## Remaining external data services

The picker can use third-party map tiles after the user selects an online layer, and Nominatim after the user submits a search. These are image/data services, not executable script sources. Those actions can disclose the requested area or search term to the selected provider. The default page load and the Shadowrocket runtime scripts do not depend on those services.

## Release policy

- Do not automatically merge or sync upstream changes.
- Review diffs against the frozen upstream commit before copying any update.
- Run `npm run verify`, a Worker dry run, and live endpoint checks before release.
- Deploy the same audited tree to GitHub, `wloc.legclub.cyou`, and `wloc-time-capsule.pages.dev`.
