import { getAsset } from "./assets.generated.js";
import { getPageHtml } from "./page.js";
import { parseCoords, gcj02ToWgs84, round6 } from "./parse.js";

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
    },
  });
}

async function handleParse(url) {
  const raw = url.searchParams.get("u") || "";
  const cs = (url.searchParams.get("cs") || "").toLowerCase();
  const fmt = (url.searchParams.get("format") || "").toLowerCase();
  const cors = { "access-control-allow-origin": "*" };

  try {
    let { lat, lon, name, src } = await parseCoords(raw);
    const needConv = cs === "gcj" || (cs !== "none" && (src === "amap" || src === "apple"));
    if (needConv) ({ lat, lon } = gcj02ToWgs84(lat, lon));
    lat = round6(lat);
    lon = round6(lon);
    name = name || "";
    if (fmt === "json") return json({ lat, lon, name }, 200, cors);
    return text(`lat=${lat}&lon=${lon}`, 200, cors);
  } catch (e) {
    return json({ error: String(e && e.message ? e.message : e) }, 422, cors);
  }
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/") {
    return new Response(getPageHtml(), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (path === "/api/parse") return handleParse(url);

  if (path === "/wloc.jpg") {
    const asset = getAsset(path);
    if (!asset) return text("404 Not Found", 404);
    return assetResponse(asset, "public, max-age=86400");
  }

  if (path.startsWith("/dist/") || path.startsWith("/modules/")) {
    const asset = getAsset(path);
    if (!asset) return text("404 Not Found", 404);
    return assetResponse(
      asset,
      path.startsWith("/dist/") ? "public, max-age=86400" : "public, max-age=300",
    );
  }

  return text("404 Not Found", 404);
}

export default {
  fetch: handleRequest,
};
