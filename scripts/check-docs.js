#!/usr/bin/env node

const fs = require("fs");

const args = new Set(process.argv.slice(2));
const footprintOnly = args.has("--footprint-only");

const requiredDocs = [
  "README.md",
  "docs/API_REFERENCE.md",
  "docs/ARCHITECTURE.md",
  "docs/ADVANCED_RECIPES.md",
  "docs/TROUBLESHOOTING.md",
  "docs/FAQ.md",
  ".github/CONTRIBUTING.md",
  ".github/CODE_OF_CONDUCT.md",
  ".github/SECURITY.md",
  ".github/SUPPORT.md",
  "docs/maintainers/VERSIONING.md",
  "docs/maintainers/RELEASING.md",
];

function fail(message) {
  console.error(`[docs-check] ${message}`);
  process.exit(1);
}

if (!footprintOnly) {
  const missing = requiredDocs.filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    fail(`Missing required documentation files: ${missing.join(", ")}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const publishFiles = Array.isArray(packageJson.files) ? packageJson.files : [];

if (publishFiles.some((entry) => entry === "docs" || entry.startsWith("docs/"))) {
  fail("Docs footprint policy violated: package.json files must not include docs/ entries.");
}

for (const requiredEntry of ["README.md", "CHANGELOG.md", "LICENSE"]) {
  if (!publishFiles.includes(requiredEntry)) {
    fail(`Docs footprint policy violated: package.json files must include ${requiredEntry}.`);
  }
}

if (footprintOnly) {
  console.log("[docs-check] Docs footprint policy check passed.");
} else {
  console.log("[docs-check] Required docs and footprint policy checks passed.");
}
