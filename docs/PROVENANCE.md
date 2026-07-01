# Provenance

## Source

This time capsule was created from:

- Repository: `Yu9191/wloc`
- Commit: `eec07a8dc8de6dbaee8eac1fb376e4d03020154a`
- Commit message: `docs: 苹果地图(中国大陆 GCJ-02)说明改为也转 WGS84，与 worker 实际行为一致 (#21)`
- Commit time: `2026-06-27T23:50:28Z`
- Commit signature status from GitHub API: `unsigned`

The downloaded upstream zip is stored at:

```text
upstream/Yu9191-wloc-eec07a8.zip
```

The expanded upstream tree was intentionally removed from the working tree to avoid publishing upstream raw-file URLs as text. The zip archive remains as the immutable evidence copy.

## Local Changes

Published files in `modules/`, `dist/`, `worker/`, and `wloc.jpg` were copied from the frozen upstream commit and then repointed to `https://wloc.legclub.cyou/`.

Local edits:

- Module script/icon/subscription URLs now point to Cloudflare Worker-hosted URLs under `https://wloc.legclub.cyou/`. The GitHub repository is used for source control, not raw file delivery.
- Module selection page URLs now point to `https://wloc.legclub.cyou/`.
- Worker config name changed from `wloc-spoofer` to `wloc-time-capsule`.
- Upstream evidence files under `upstream/` were not edited.

