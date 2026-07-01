import { Hono } from "hono/tiny";
import { getPageHtml } from "./page.js";
import { parseCoords, gcj02ToWgs84, round6 } from "./parse.js";
import { BINARY_ASSETS, TEXT_ASSETS } from "./static-assets.js";

const app = new Hono();

app.get("/", (c) => {
  return c.html(getPageHtml());
});

const TEXT_TYPES = {
  ".conf": "text/plain; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".lpx": "text/plain; charset=utf-8",
  ".module": "text/plain; charset=utf-8",
  ".sgmodule": "text/plain; charset=utf-8",
  ".stoverride": "text/yaml; charset=utf-8",
};

function contentType(path) {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? TEXT_TYPES[path.slice(dot)] || "text/plain; charset=utf-8" : "text/plain; charset=utf-8";
}

function base64ToBytes(base64) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

app.get("/modules/:name", (c) => {
  const assetPath = "/modules/" + c.req.param("name");
  const body = TEXT_ASSETS[assetPath];
  if (body == null) return c.notFound();
  return c.body(body, 200, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300",
    "Content-Type": contentType(assetPath),
  });
});

app.get("/dist/:name", (c) => {
  const assetPath = "/dist/" + c.req.param("name");
  const body = TEXT_ASSETS[assetPath];
  if (body == null) return c.notFound();
  return c.body(body, 200, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300",
    "Content-Type": contentType(assetPath),
  });
});

app.get("/wloc.jpg", () => {
  return new Response(base64ToBytes(BINARY_ASSETS["/wloc.jpg"]), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/jpeg",
    },
  });
});

// 地图链接解析: 供快捷指令调用。
// GET /api/parse?u=<链接>&format=json&cs=<gcj|none>
//   返回 {lat, lon, name}; 高德/苹果地图(中国大陆均为 GCJ-02)自动转 WGS84; 境外坐标自动跳过(out_of_china)。cs=none 可强制不转换。
//   不带 format=json 时返回纯文本 "lat=..&lon=.." 片段。
app.get("/api/parse", async (c) => {
  const raw = c.req.query("u") || "";
  const cs = (c.req.query("cs") || "").toLowerCase();
  const fmt = (c.req.query("format") || "").toLowerCase();
  try {
    let { lat, lon, name, src } = await parseCoords(raw);
    const needConv = cs === "gcj" || (cs !== "none" && (src === "amap" || src === "apple"));
    if (needConv) ({ lat, lon } = gcj02ToWgs84(lat, lon));
    lat = round6(lat);
    lon = round6(lon);
    name = name || "";
    c.header("Access-Control-Allow-Origin", "*");
    if (fmt === "json") return c.json({ lat, lon, name });
    return c.text(`lat=${lat}&lon=${lon}`);
  } catch (e) {
    c.header("Access-Control-Allow-Origin", "*");
    return c.json({ error: String(e && e.message ? e.message : e) }, 422);
  }
});

app.onError((e, c) => {
  console.error(`${e}`);
  return c.text(`${e}`, 500);
});

export default app;
