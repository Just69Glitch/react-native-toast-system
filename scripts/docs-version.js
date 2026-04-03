#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const WEBSITE_DIR = path.resolve(process.cwd(), "website");
const VERSIONS_FILE = path.join(WEBSITE_DIR, "versions.json");

function readVersions() {
  if (!fs.existsSync(VERSIONS_FILE)) {
    return [];
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(VERSIONS_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function printUsage() {
  console.log("Usage:");
  console.log("  pnpm run docs:version -- <version>");
  console.log("  pnpm run docs:version -- --list");
  console.log("");
  console.log("Examples:");
  console.log("  pnpm run docs:version -- 1.1.0");
  console.log("  pnpm run docs:version -- 1.2.0-beta.1");
}

const args = process.argv.slice(2);
if (args.includes("--list")) {
  const versions = readVersions();
  if (versions.length === 0) {
    console.log("No published docs versions yet.");
  } else {
    console.log(`Published docs versions: ${versions.join(", ")}`);
  }
  process.exit(0);
}

const version = args[0];
if (!version) {
  printUsage();
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(
    `Invalid version "${version}". Use semver-like values such as 1.1.0 or 1.2.0-beta.1.`
  );
  process.exit(1);
}

const existingVersions = readVersions();
if (existingVersions.includes(version)) {
  console.error(`Docs version "${version}" already exists in website/versions.json.`);
  process.exit(1);
}

const result = spawnSync(
  "pnpm",
  ["--dir", "website", "exec", "docusaurus", "docs:version", version],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("");
console.log(`Docs version ${version} created successfully.`);
console.log("Next steps:");
console.log("1. Update current docs in ./docs for the next release cycle.");
console.log("2. Run `pnpm run docs:build` to validate site output.");
console.log("3. Commit versioned docs + sidebars + versions.json.");
