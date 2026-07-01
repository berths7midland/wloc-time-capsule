# wloc-time-capsule

This repository is a frozen, self-controlled snapshot of `Yu9191/wloc` for personal use.

目的很简单：不再让手机代理模块跟随上游 `main` 自动变化。模块脚本、Worker 解析逻辑、图标和配置都固定在本仓库，后续更新必须先人工审计。

## Snapshot

- Upstream: `https://github.com/Yu9191/wloc`
- Frozen commit: `eec07a8dc8de6dbaee8eac1fb376e4d03020154a`
- Commit date: `2026-06-27T23:50:28Z`
- Local snapshot date: `2026-07-01`
- Worker domain: `https://wloc.legclub.cyou/`
- Default repository name: `berths7midland/wloc-time-capsule`

The unmodified upstream archive is kept as `upstream/Yu9191-wloc-eec07a8.zip`. Expanded upstream text files are not committed, so this repository does not expose GitHub raw URLs in working-tree text.

## Subscriptions

Use these module URLs from your Cloudflare Worker:

- Surge: `https://wloc.legclub.cyou/modules/wloc.sgmodule`
- Quantumult X: `https://wloc.legclub.cyou/modules/wloc.conf`
- Loon: `https://wloc.legclub.cyou/modules/wloc.lpx`
- Stash: `https://wloc.legclub.cyou/modules/wloc.stoverride`
- Shadowrocket: `https://wloc.legclub.cyou/modules/wloc.module`

## Worker

The Worker source lives in `worker/`.

Important files:

- `worker/src/parse.js`: parses Apple Maps / AMap links, follows redirects, extracts coordinates, and converts GCJ-02 to WGS84 when needed.
- `worker/src/index.js`: exposes `/api/parse`.
- `worker/wrangler.jsonc`: Cloudflare Workers config using the name `wloc-time-capsule`.

Test endpoint:

```text
https://wloc.legclub.cyou/api/parse?u=<encoded map url>&format=json
```

## Audit Rules

1. Do not use the GitHub raw CDN in published modules, scripts, icons, or docs.
2. Do not auto-sync upstream changes.
3. For every future update, record the upstream commit, changed files, reason, and file hashes.
4. Keep `upstream/` immutable as evidence for this snapshot.

