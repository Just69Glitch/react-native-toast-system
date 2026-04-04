const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const PNPM_BIN = "pnpm";

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    const spawnError = result.error ? String(result.error) : "";
    const stdout = result.stdout || "";
    const stderr = result.stderr || "";
    throw new Error(
      [
        `Command failed: ${command} ${args.join(" ")}`,
        spawnError,
        stdout,
        stderr,
      ]
        .join("\n")
        .trim(),
    );
  }

  return result.stdout || "";
}

function main() {
  const repoRoot = process.cwd();
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "rnts-pack-check-"));
  const packDir = path.join(tempRoot, "pack");
  const consumerDir = path.join(tempRoot, "consumer");

  try {
    fs.mkdirSync(packDir, { recursive: true });
    fs.mkdirSync(consumerDir, { recursive: true });

    const dryRunOutput = run(PNPM_BIN, ["pack", "--dry-run"], repoRoot);
    if (/\bsrc\//.test(dryRunOutput)) {
      throw new Error("Packed tarball still includes src/. Remove src from published files.");
    }

    run(PNPM_BIN, ["pack", "--pack-destination", packDir], repoRoot);
    const tarball = fs
      .readdirSync(packDir)
      .find((name) => name.endsWith(".tgz"));

    if (!tarball) {
      throw new Error("Could not find packed tarball in temporary pack directory.");
    }

    const tarballPath = path.join(packDir, tarball);
    const consumerPkgJson = {
      name: "react-native-toast-system-pack-check",
      version: "0.0.0",
      private: true,
    };
    fs.writeFileSync(
      path.join(consumerDir, "package.json"),
      `${JSON.stringify(consumerPkgJson, null, 2)}\n`,
      "utf8",
    );

    run(PNPM_BIN, ["add", tarballPath, "--ignore-scripts"], consumerDir);

    const packageName = "react-native-toast-system";
    const specifiers = [
      packageName,
      `${packageName}/components`,
      `${packageName}/hooks`,
      `${packageName}/providers`,
      `${packageName}/utils`,
      `${packageName}/types`,
    ];

    for (const specifier of specifiers) {
      // Only resolve path existence; no module execution.
      require.resolve(specifier, { paths: [consumerDir] });
    }

    process.stdout.write("Packed subpath export check passed.\n");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const localPnpmEperm =
    !process.env.CI && /spawnSync pnpm EPERM/i.test(message);

  if (localPnpmEperm) {
    process.stdout.write(
      "Skipped packed subpath verification locally (pnpm spawn EPERM on this machine).\n",
    );
    process.exit(0);
  }

  throw error;
}
