# WLOC Security Review

Review date: 2026-07-10

Upstream reviewed: `Yu9191/wloc` at commit `eec07a8dc8de6dbaee8eac1fb376e4d03020154a`. The upstream `main` branch still pointed to that commit when this review was performed.

## Findings and mitigations

1. Upstream modules followed mutable `main` URLs for scripts, icons, and the module itself. Published modules in this repository only reference account-owned GitHub and Cloudflare endpoints.
2. The picker loaded executable Leaflet assets from `unpkg.com`. Leaflet 1.9.4 is now pinned under `vendor/leaflet/` and served by the account-owned Worker and Pages deployments.
3. The parse API followed arbitrary user-supplied URLs and redirects. Fetches are now restricted to HTTPS Apple Maps and AMap hosts, redirect targets are revalidated, invalid coordinate ranges are rejected, and response bodies are limited to 128 KiB.
4. Upstream shortcut links were controlled outside this repository. They were removed from all published modules.
5. The Shadowrocket scripts operate on intercepted Apple location responses and device-local persistent storage. The reviewed scripts do not use `eval`, dynamic code loading, WebSockets, or unknown telemetry endpoints.

## Remaining external data services

The picker uses third-party map tiles and optional OpenStreetMap Nominatim search data. These are image/data services, not executable script sources. Searching or viewing a map can disclose the requested area or search term to those providers. The Shadowrocket module and its two runtime scripts do not depend on those services.

## Release policy

- Do not automatically merge or sync upstream changes.
- Review diffs against the frozen upstream commit before copying any update.
- Run the parser tests, forbidden-link scan, Worker dry run, and live endpoint checks before release.
- Deploy the same audited tree to GitHub, `wloc.legclub.cyou`, and `wloc-time-capsule.pages.dev`.
