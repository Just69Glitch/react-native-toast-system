const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT_DIR = process.cwd();
const PROJECTS = {
  root: ".",
  example: "example",
  website: "website",
};

const rawTargets = process.argv.slice(2);
const targets = rawTargets.length > 0 ? rawTargets : ["root"];

function resolveProjectDir(name) {
  const relativeDir = PROJECTS[name];
  if (!relativeDir) {
    console.error(
      `Unknown project '${name}'. Valid targets: ${Object.keys(PROJECTS).join(", ")}`,
    );
    process.exit(1);
  }
  return path.resolve(ROOT_DIR, relativeDir);
}

function hasPackageJson(dir) {
  return fs.existsSync(path.join(dir, "package.json"));
}

function runInstall(dir, name) {
  console.log(`\n[install] ${name} -> ${dir}`);
  const result = spawnSync("pnpm", ["install"], {
    cwd: dir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(
      `[error] failed to spawn pnpm for ${name}:`,
      result.error.message,
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

for (const name of targets) {
  const dir = resolveProjectDir(name);

  if (!fs.existsSync(dir)) {
    console.log(`[skip] ${name} (directory not found)`);
    continue;
  }

  if (!hasPackageJson(dir)) {
    console.log(`[skip] ${name} (no package.json)`);
    continue;
  }

  runInstall(dir, name);
}
