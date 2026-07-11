import { spawnSync } from "node:child_process";

const result = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
  encoding: "utf8",
});

if (result.error || result.status !== 0) {
  console.error(result.error?.message || result.stderr || "Unable to inspect git status.");
  process.exit(1);
}

if (result.stdout.trim()) {
  console.error("Refusing to deploy from a dirty worktree:\n" + result.stdout.trimEnd());
  process.exit(1);
}

console.log("Git worktree is clean.");
