# WLOC Time Capsule

This repository contains a time-capsule and one-click deployment for the WLOC project.

## One-click deploy Cloudflare Worker

Click "Actions" → `deploy-worker` → "Run workflow" to deploy the Cloudflare Worker that will serve `/dist/*` from this repository.

Before running the workflow, add the following repository secrets:

- `CF_API_TOKEN` — A Cloudflare API token with **Workers Scripts:Edit** (and Workers routes if you want to modify routes) permissions. Create it in the Cloudflare Dashboard > My Profile > API Tokens > Create Token.
- `CF_ACCOUNT_ID` — Your Cloudflare Account ID (found in the Cloudflare Dashboard overview for your account).

Workflow file: `.github/workflows/deploy-worker.yml`.

What the workflow does:
- Uploads `worker/worker.js` to Cloudflare as the script name `wloc-dist-proxy` using the Cloudflare API.
- Does NOT change any DNS or Cloudflare Routes. After deployment, you still need to ensure the route `wloc.legclub.cyou/dist/*` (or `wloc.legclub.cyou/*`) is configured in the Cloudflare dashboard to point to the deployed Worker.

Manual steps to bind the Worker to your domain (one-time):
1. Go to Cloudflare Dashboard > Workers > Add route.
2. Select the worker named `wloc-dist-proxy` and set the route to `wloc.legclub.cyou/dist/*` (or `wloc.legclub.cyou/*` if you want the Worker to handle all requests).

After that, the Worker will proxy requests for `/dist/wloc.js` and `/dist/wloc-settings.js` from this repository and cache them at the edge.

## Notes
- This workflow requires you to add the secrets above; I cannot and will not add them for you for security reasons.
- If you prefer a fully self-contained Worker (no runtime calls to GitHub raw), reply and I will produce a Worker script that inlines `dist/wloc.js` and `dist/wloc-settings.js`.
