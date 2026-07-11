import { getAsset } from "./assets.generated.js";
import { getPageHtml } from "./page.js";
import { parseCoords, gcj02ToWgs84, round6 } from "./parse.js";

const API_CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "cache-control": "no-store",
};

function text(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...headers,
    },
  });
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function assetResponse(asset, cacheControl) {
  return new Response(asset.body, {
    headers: {
      "content-type": asset.contentType,
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
    },
  });
}

function preflight() {
  return new Response(null, { status: 204, headers: API_CORS });
}

function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405, { ...API_CORS, allow: "GET, OPTIONS" });
}

async function handleParse(request, url) {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "GET") return methodNotAllowed();
  const raw = url.searchParams.get("u") || "";
  const cs = (url.searchParams.get("cs") || "").toLowerCase();
  const fmt = (url.searchParams.get("format") || "").toLowerCase();
  if (raw.length > 2048) return json({ error: "Map input is too long" }, 413, API_CORS);

  try {
    let { lat, lon, name, src } = await parseCoords(raw);
    const needConv = cs === "gcj" || (cs !== "none" && (src === "amap" || src === "apple"));
    if (needConv) ({ lat, lon } = gcj02ToWgs84(lat, lon));
    lat = round6(lat);
    lon = round6(lon);
    name = name || "";
    if (fmt === "json") return json({ lat, lon, name }, 200, API_CORS);
    return text(`lat=${lat}&lon=${lon}`, 200, API_CORS);
  } catch (e) {
    return json({ error: String(e && e.message ? e.message : e) }, 422, API_CORS);
  }
}

function handleSettingsFallback(request) {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "GET") return methodNotAllowed();
  return json(
    { success: false, error: "The local proxy module did not intercept this request." },
    409,
    API_CORS,
  );
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/") {
    const nonce = crypto.randomUUID().replaceAll("-", "");
    return new Response(getPageHtml(nonce), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-security-policy": `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.basemaps.cartocdn.com https://*.is.autonavi.com; connect-src 'self' https://wloc.legclub.cyou https://nominatim.openstreetmap.org; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
      },
    });
  }

  if (path === "/api/parse") return handleParse(request, url);
  if (path === "/wloc-settings/save") return handleSettingsFallback(request);

  if (path === "/wloc.jpg") {
    const asset = getAsset(path);
    if (!asset) return text("404 Not Found", 404);
    return assetResponse(asset, "public, max-age=86400");
  }

  if (path.startsWith("/dist/") || path.startsWith("/modules/") || path.startsWith("/vendor/")) {
    const asset = getAsset(path);
    if (!asset) return text("404 Not Found", 404);
    return assetResponse(
      asset,
      path.startsWith("/modules/") ? "public, max-age=300" : "public, max-age=86400",
    );
  }

  return text("404 Not Found", 404);
}

export default {
  fetch: handleRequest,
};
