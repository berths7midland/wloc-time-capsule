addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

// Proxy worker to serve /dist/* by fetching from your repository raw URLs and caching at Cloudflare edge.
// Deploy this to Cloudflare Workers and route wloc.legclub.cyou/dist/* -> this Worker (or use wloc.legclub.cyou/* if you prefer).

const RAW_BASE = 'https://raw.githubusercontent.com/berths7midland/wloc-time-capsule/main/dist';

async function handleRequest(event) {
  const req = event.request;
  const url = new URL(req.url);

  // Serve dist files from repo raw and cache at edge.
  if (url.pathname.startsWith('/dist/')) {
    const name = url.pathname.replace('/dist/', '');
    if (!name) return new Response('Not found', { status: 404 });

    const cache = caches.default;
    const cacheKey = new Request(req.url);

    // Try edge cache first
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    // Fetch from your repository raw
    const upstreamUrl = `${RAW_BASE}/${encodeURIComponent(name).replace(/%2F/g, '/')}`;
    const upstreamRes = await fetch(upstreamUrl);
    if (!upstreamRes.ok) return new Response('Not found', { status: upstreamRes.status });

    // Clone response body and headers
    const body = await upstreamRes.arrayBuffer();
    const headers = new Headers(upstreamRes.headers);
    // Force correct content-type for JS files
    if (name.endsWith('.js')) headers.set('Content-Type', 'application/javascript; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=86400');

    const res = new Response(body, { status: upstreamRes.status, headers });

    // Cache at edge asynchronously
    event.waitUntil(cache.put(cacheKey, res.clone()).catch(() => {}));

    return res;
  }

  // For all other paths, return 404. Your existing Worker can continue serving the select page at '/'.
  return new Response('Not found', { status: 404 });
}
