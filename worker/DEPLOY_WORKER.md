Deploying the proxy Worker (quick guide)

What this Worker does
- Serves files under /dist/* by fetching them from your repository's raw URLs:
  https://raw.githubusercontent.com/berths7midland/wloc-time-capsule/main/dist/<file>
- Caches responses at the Cloudflare edge (max-age=86400) for performance.
- Intended route: wloc.legclub.cyou/dist/*

How to deploy
1) Log in to Cloudflare Dashboard -> Workers -> Create a Worker (or Edit an existing Worker).
2) Replace the default script with the contents of worker/proxy-dist-worker.js (open file in this repo to copy).
3) Save and Deploy.
4) Configure a route (Triggers > Routes) for your domain, e.g.:
   - wloc.legclub.cyou/dist/*  -> this Worker
5) Test in terminal or browser:
   - curl -I https://wloc.legclub.cyou/dist/wloc.js
   - curl -I https://wloc.legclub.cyou/dist/wloc-settings.js
   Expect HTTP 200 and correct Content-Type.

Notes
- This Worker only proxies /dist/* to your repository raw and caches results. It does NOT depend on any third-party services beyond GitHub raw (your own repo). If you later want the Worker to be fully self-contained (no GitHub raw at runtime), we can generate a worker that inlines the dist JS files.
- If you prefer the Worker to serve the select page at '/' too, tell me and I will add that endpoint to this script.

