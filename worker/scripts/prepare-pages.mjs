import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = resolve(here, "..");
const repoRoot = resolve(workerRoot, "..");
const out = join(workerRoot, "dist");
const generatedAssetModule = join(workerRoot, "src", "assets.generated.js");

const contentTypes = new Map([
  [".conf", "text/plain; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".js", "application/javascript; charset=utf-8"],
  [".lpx", "text/plain; charset=utf-8"],
  [".module", "text/plain; charset=utf-8"],
  [".sgmodule", "text/plain; charset=utf-8"],
  [".stoverride", "text/yaml; charset=utf-8"],
]);

function contentTypeFor(path) {
  const suffix = [...contentTypes.keys()].find((ext) => path.endsWith(ext));
  return contentTypes.get(suffix) || "application/octet-stream";
}

async function collectAssets() {
  const assets = {};
  for (const dir of ["modules", "dist"]) {
    for (const entry of await readdir(join(repoRoot, dir), { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const publicPath = `/${dir}/${entry.name}`;
      const bytes = await readFile(join(repoRoot, dir, entry.name));
      assets[publicPath] = {
        contentType: contentTypeFor(publicPath),
        base64: bytes.toString("base64"),
      };
    }
  }
  const iconBytes = await readFile(join(repoRoot, "wloc.jpg"));
  assets["/wloc.jpg"] = {
    contentType: "image/jpeg",
    base64: iconBytes.toString("base64"),
  };
  return assets;
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await cp(join(repoRoot, "modules"), join(out, "modules"), { recursive: true });
await cp(join(repoRoot, "dist"), join(out, "dist"), { recursive: true });
await cp(join(repoRoot, "wloc.jpg"), join(out, "wloc.jpg"));
await writeFile(
  join(out, "_routes.json"),
  `${JSON.stringify({
    version: 1,
    include: ["/*"],
    exclude: ["/modules/*", "/dist/*", "/wloc.jpg"],
  })}\n`,
);
await writeFile(
  generatedAssetModule,
  `const ASSETS = ${JSON.stringify(await collectAssets())};\n\n` +
    `export function getAsset(path) {\n` +
    `  const asset = ASSETS[path];\n` +
    `  if (!asset) return null;\n` +
    `  const binary = atob(asset.base64);\n` +
    `  const body = Uint8Array.from(binary, (char) => char.charCodeAt(0));\n` +
    `  return { contentType: asset.contentType, body };\n` +
    `}\n`,
);

console.log(`Prepared Cloudflare Pages assets in ${out}`);
console.log(`Prepared Cloudflare Worker assets in ${generatedAssetModule}`);
