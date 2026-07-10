import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const forbidden = [
  /github\.com\/Yu9191/iu,
  /raw\.githubusercontent\.com\/Yu9191/iu,
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
  join(repoRoot, "worker", "src", "page.js"),
];

const errors = [];
for (const path of targets) {
  const content = await readFile(path, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(content)) errors.push(`${path}: forbidden link matched ${pattern}`);
  }
  if (!path.startsWith(join(repoRoot, "modules"))) continue;
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
