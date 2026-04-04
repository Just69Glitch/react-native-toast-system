const fs = require("fs");

const README_PATH = "README.md";
const APP_CONFIG_PATH = "example/app.json";
const UPDATE_JSON_PATH = "example/eas-update.json";

const START_MARKER = "<!-- expo-demo:start -->";
const END_MARKER = "<!-- expo-demo:end -->";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function resolveGroupId(rawJson) {
  const groupMatch = rawJson.match(/"group"\s*:\s*"([0-9a-f-]{36})"/i);
  if (groupMatch) return groupMatch[1];

  const groupIdMatch = rawJson.match(/"groupId"\s*:\s*"([0-9a-f-]{36})"/i);
  if (groupIdMatch) return groupIdMatch[1];

  throw new Error("Could not resolve update group ID from eas-update.json");
}

function buildDemoBlock(deepLink) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(deepLink)}`;
  return [
    START_MARKER,
    "        <img",
    `          src="${qrUrl}"`,
    '          alt="Expo Demo QR"',
    '          width="160"',
    "        />",
    "      </p>",
    "      <p>",
    "        <code>",
    `          ${deepLink}`,
    `        ${END_MARKER}`,
  ].join("\n");
}

function main() {
  const appConfig = readJson(APP_CONFIG_PATH);
  const projectId = appConfig?.expo?.extra?.eas?.projectId;

  if (!projectId) {
    throw new Error("Missing expo.extra.eas.projectId in example/app.json");
  }

  const updateRaw = fs.readFileSync(UPDATE_JSON_PATH, "utf8");
  const groupId = resolveGroupId(updateRaw);
  const deepLink = `exp://u.expo.dev/${projectId}/group/${groupId}`;

  const readme = fs.readFileSync(README_PATH, "utf8");
  const block = buildDemoBlock(deepLink);

  if (!readme.includes(START_MARKER) || !readme.includes(END_MARKER)) {
    throw new Error("README markers for Expo demo block are missing.");
  }

  const nextReadme = readme.replace(
    /<!-- expo-demo:start -->[\s\S]*?<!-- expo-demo:end -->/,
    block,
  );

  fs.writeFileSync(README_PATH, nextReadme, "utf8");
  process.stdout.write(`Updated README Expo demo QR for group ${groupId}\n`);
}

main();
