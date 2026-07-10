# Provenance

## Source

This time capsule was created from:

- Repository: frozen WLOC upstream snapshot
- Commit: `eec07a8dc8de6dbaee8eac1fb376e4d03020154a`
- Commit message: `docs: 苹果地图(中国大陆 GCJ-02)说明改为也转 WGS84，与 worker 实际行为一致 (#21)`
- Commit time: `2026-06-27T23:50:28Z`
- Commit signature status from GitHub API: `unsigned`

The downloaded upstream zip is stored at:

```text
upstream/upstream-source-eec07a8.zip
```

The expanded upstream tree was intentionally removed from the working tree to avoid publishing upstream raw-file URLs as text. The zip archive remains as the immutable evidence copy.

## Local Changes

Published files in `modules/`, `dist/`, `worker/`, and `wloc.jpg` were copied from the frozen upstream commit and then repointed to `https://wloc.legclub.cyou/`.

Local edits:

- Module script/icon/subscription URLs now point to `https://wloc.legclub.cyou/`, where the production Worker serves modules, scripts, and the icon without relying on GitHub raw at runtime.
- Module selection page URLs now point to `https://wloc.legclub.cyou/`.
- Worker deployments target the existing `wloc-spoofer` production service that owns `wloc.legclub.cyou`.
- The Worker remains the primary runtime target; its generated asset bundle serves the module, scripts, icon, picker, and API.
- The same audited assets are also deployed to the account-owned backup at `https://wloc-time-capsule.pages.dev/` from `worker/dist/`.
- The public parse API only follows HTTPS redirects on approved Apple Maps and AMap hosts, rejects invalid coordinate ranges, and limits remote response bodies to 128 KiB.
- Leaflet 1.9.4 JavaScript, CSS, marker images, and license are pinned under `vendor/leaflet/` and served by the account-owned Worker and Pages deployments instead of loading executable code from `unpkg.com`.
- Upstream shortcut links were removed from published modules because their contents are controlled outside this repository.
- Upstream evidence files under `upstream/` were not edited.
