import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const manifestPath = resolve(repoRoot, "HASHES.sha256");
const mode = process.argv[2];

function releaseFiles() {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: repoRoot, encoding: "utf8" },
  );
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || "Unable to list release files.");
  return result.stdout
    .split("\0")
    .filter(Boolean)
    .filter((path) => path !== "HASHES.sha256")
    .filter((path) => existsSync(resolve(repoRoot, path)))
    .sort();
}

async function hashes() {
  const rows = [];
  for (const path of releaseFiles()) {
    const bytes = await readFile(resolve(repoRoot, path));
    rows.push([createHash("sha256").update(bytes).digest("hex"), path]);
  }
  return rows;
}

if (mode === "generate") {
  const rows = await hashes();
  await writeFile(manifestPath, rows.map(([hash, path]) => `${hash}  ${path}`).join("\n") + "\n");
  console.log(`Wrote ${rows.length} hashes to HASHES.sha256.`);
} else if (mode === "verify") {
  const expectedText = await readFile(manifestPath, "utf8");
  const expected = new Map(
    expectedText.trim().split(/\r?\n/u).filter(Boolean).map((line) => {
      const match = line.match(/^([0-9a-f]{64})  (.+)$/u);
      if (!match) throw new Error(`Invalid HASHES.sha256 line: ${line}`);
      return [match[2], match[1]];
    }),
  );
  const actual = await hashes();
  const errors = [];
  for (const [hash, path] of actual) {
    if (!expected.has(path)) errors.push(`Missing manifest entry: ${path}`);
    else if (expected.get(path) !== hash) errors.push(`Hash mismatch: ${path}`);
    expected.delete(path);
  }
  for (const path of expected.keys()) errors.push(`Stale manifest entry: ${path}`);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
  console.log(`Verified ${actual.length} release hashes.`);
} else {
  console.error("Usage: node scripts/hashes.mjs <generate|verify>");
  process.exit(2);
}
