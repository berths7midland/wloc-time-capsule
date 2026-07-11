import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const forbidden = [
  /Yu9191/iu,
  /wloc-pages\.pages\.dev/iu,
  /icloud\.com\/shortcuts/iu,
  /unpkg\.com/iu,
];
const allowedModuleHosts = new Set([
  "github.com",
  "raw.githubusercontent.com",
  "wloc-time-capsule.pages.dev",
  "wloc.legclub.cyou",
]);
const allowedPageHosts = new Set([
  "nominatim.openstreetmap.org",
  "server.arcgisonline.com",
  "wloc.legclub.cyou",
]);
const allowedPageSuffixes = [
  ".basemaps.cartocdn.com",
  ".is.autonavi.com",
  ".tile.openstreetmap.org",
];

async function filesUnder(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const targets = [
  ...await filesUnder(join(repoRoot, "modules")),
  ...await filesUnder(join(repoRoot, "dist")),
  ...await filesUnder(join(repoRoot, "worker", "src")),
  ...await filesUnder(join(repoRoot, "worker", "functions")),
  join(repoRoot, ".github", "workflows", "deploy-cloudflare.yml"),
  join(repoRoot, "worker", "package.json"),
  join(repoRoot, "worker", "wrangler.jsonc"),
  join(repoRoot, "worker", "wrangler.worker.jsonc"),
];
const moduleRoot = join(repoRoot, "modules");
const pagePath = join(repoRoot, "worker", "src", "page.js");

const errors = [];
for (const path of targets) {
  const content = await readFile(path, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(content)) errors.push(`${path}: forbidden link matched ${pattern}`);
  }
  if (path.startsWith(join(repoRoot, "worker", "src")) && path !== join(repoRoot, "worker", "src", "assets.generated.js")) {
    for (const pattern of [/\beval\s*\(/u, /\bnew\s+Function\s*\(/u, /\bimportScripts\s*\(/u]) {
      if (pattern.test(content)) errors.push(`${path}: dynamic code execution matched ${pattern}`);
    }
  }
  if (path === pagePath) {
    for (const match of content.matchAll(/https:\/\/[^\s"']+/gu)) {
      let url;
      try {
        url = new URL(match[0].replace(/[),.;]+$/u, "").replaceAll("{s}", "a"));
      } catch {
        errors.push(`${path}: invalid picker URL: ${match[0]}`);
        continue;
      }
      const allowed = allowedPageHosts.has(url.hostname) || allowedPageSuffixes.some((suffix) => url.hostname.endsWith(suffix));
      if (!allowed) errors.push(`${path}: picker URL host is not approved: ${url.hostname}`);
    }
  }
  if (!path.startsWith(moduleRoot)) continue;
  for (const match of content.matchAll(/https:\/\/[^\s"']+/gu)) {
    let url;
    try {
      url = new URL(match[0].replace(/[),.;]+$/u, ""));
    } catch {
      continue;
    }
    if (!allowedModuleHosts.has(url.hostname)) {
      errors.push(`${path}: module URL host is not account-owned: ${url.hostname}`);
    } else if ((url.hostname === "github.com" || url.hostname === "raw.githubusercontent.com") && !url.pathname.startsWith("/berths7midland/")) {
      errors.push(`${path}: GitHub URL is not under berths7midland: ${url}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Audited ${targets.length} deployable files: no forbidden or non-owned module links found.`);
}
