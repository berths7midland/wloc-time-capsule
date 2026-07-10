# wloc-time-capsule

This repository is a frozen, self-controlled WLOC snapshot for personal use.

目的很简单：不再让手机代理模块跟随上游 `main` 自动变化。模块脚本、Worker 解析逻辑、图标和配置都固定在本仓库，后续更新必须先人工审计。

## Snapshot

- Source: frozen WLOC upstream snapshot, kept locally as an archive only
- Frozen commit: `eec07a8dc8de6dbaee8eac1fb376e4d03020154a`
- Commit date: `2026-06-27T23:50:28Z`
- Local snapshot date: `2026-07-01`
- Worker domain: `https://wloc.legclub.cyou/`
- Pages backup: `https://wloc-time-capsule.pages.dev/`
- Default repository name: `berths7midland/wloc-time-capsule`

The unmodified upstream archive is kept as `upstream/upstream-source-eec07a8.zip`. Expanded upstream text files are not committed, so this repository does not expose GitHub raw URLs in working-tree text.

## Subscriptions

Use these module URLs from your Cloudflare deployment:

- Surge: `https://wloc.legclub.cyou/modules/wloc.sgmodule`
- Quantumult X: `https://wloc.legclub.cyou/modules/wloc.conf`
- Loon: `https://wloc.legclub.cyou/modules/wloc.lpx`
- Stash: `https://wloc.legclub.cyou/modules/wloc.stoverride`
- Shadowrocket: `https://wloc.legclub.cyou/modules/wloc.module`
- Shadowrocket Pages backup: `https://wloc-time-capsule.pages.dev/modules/wloc.module`
- Shadowrocket GitHub Raw backup: `https://raw.githubusercontent.com/berths7midland/wloc-time-capsule/main/modules/wloc.module`

## Worker

The Worker source lives in `worker/`.

Important files:

- `worker/src/parse.js`: parses Apple Maps / AMap links, follows redirects, extracts coordinates, and converts GCJ-02 to WGS84 when needed.
- `worker/src/index.js`: exposes `/api/parse`.
- `worker/wrangler.worker.jsonc`: Cloudflare Workers config using the existing production service name `wloc-spoofer`.
- `worker/wrangler.jsonc`: Cloudflare Pages config for `wloc-time-capsule`.

Test endpoint:

```text
https://wloc.legclub.cyou/api/parse?u=<encoded map url>&format=json
```

## Deployment

The primary production service is the Cloudflare Worker named `wloc-spoofer`; the custom domain and all runtime assets are served by that Worker. A separate Pages deployment at `https://wloc-time-capsule.pages.dev/` provides an independently hosted backup of the picker, modules, scripts, icon, and parse API.

Run `npm run deploy:all` from `worker/` after `wrangler login` to update both targets. Use `npm run deploy` or `npm run pages:deploy` when only one target needs an update.

The GitHub workflow is manual-only to prevent unauthenticated pushes from creating failed or competing deployments. It requires the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (the `CF_*` aliases are also accepted), serializes releases to both targets, pins Wrangler, and retries transient network failures up to three times.

## Audit Rules

1. Do not point published modules, scripts, icons, or docs to another person's GitHub repository or Worker.
2. Do not auto-sync upstream changes.
3. For every future update, record the upstream commit, changed files, reason, and file hashes.
4. Keep `upstream/` immutable as evidence for this snapshot.
