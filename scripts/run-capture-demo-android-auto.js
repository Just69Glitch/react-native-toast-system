"use strict";

const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function wrapperMain(rawArgs) {
  let assetProfile = null;
  const forwardArgs = [];

  for (let index = 0; index < rawArgs.length; index += 1) {
    const value = rawArgs[index];
    if (value === "--") {
      continue;
    }
    if (value === "--asset-profile") {
      const next = rawArgs[index + 1];
      if (!next) {
        console.error("Missing value for --asset-profile");
        process.exit(1);
      }
      assetProfile = next;
      index += 1;
      continue;
    }
    forwardArgs.push(value);
  }

  const scriptPath = path.join(__dirname, "capture-demo-android-auto.ps1");
  const psArgs = ["-ExecutionPolicy", "Bypass", "-File", scriptPath];
  if (assetProfile) {
    psArgs.push("-AssetProfile", assetProfile);
  }
  psArgs.push(...forwardArgs);

  const result = spawnSync("powershell", psArgs, {
    stdio: "inherit",
    shell: false,
  });

  if (typeof result.status === "number") {
    process.exit(result.status);
  }
  if (result.error) {
    console.error(result.error.message);
  }
  process.exit(1);
}

function callbackParseArgs(argv) {
  const options = {
    port: 0,
    output: "",
    timeoutSec: 120,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--port") {
      options.port = Number(argv[index + 1] || 0);
      index += 1;
      continue;
    }
    if (value === "--output") {
      options.output = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--timeout-sec") {
      options.timeoutSec = Number(argv[index + 1] || options.timeoutSec);
      index += 1;
      continue;
    }
  }

  if (!Number.isFinite(options.port) || options.port <= 0) {
    throw new Error("Missing/invalid --port");
  }
  if (!options.output) {
    throw new Error("Missing --output");
  }
  if (!Number.isFinite(options.timeoutSec) || options.timeoutSec <= 0) {
    options.timeoutSec = 120;
  }
  return options;
}

function callbackWriteOutput(pathValue, value) {
  fs.writeFileSync(pathValue, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function callbackMain(rawArgs) {
  let options;
  try {
    options = callbackParseArgs(rawArgs);
  } catch (error) {
    console.error(`[callback-listener] ${error.message}`);
    process.exit(1);
  }

  const startedAt = Date.now();
  const timeoutMs = options.timeoutSec * 1000;
  let settled = false;

  const server = http.createServer((req, res) => {
    if (settled) {
      res.statusCode = 200;
      res.end("already-settled");
      return;
    }

    const reqUrl = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    );
    const status = reqUrl.searchParams.get("status") || "callback";

    settled = true;
    callbackWriteOutput(options.output, {
      status,
      path: reqUrl.pathname,
      rawUrl: req.url || "",
      receivedAtUtc: new Date().toISOString(),
      elapsedMs: Date.now() - startedAt,
    });

    res.statusCode = 200;
    res.end("ok");
    server.close(() => process.exit(0));
  });

  server.listen(options.port, "0.0.0.0", () => {
    // listener ready
  });

  setTimeout(() => {
    if (settled) return;
    settled = true;
    callbackWriteOutput(options.output, {
      status: "timeout",
      receivedAtUtc: new Date().toISOString(),
      elapsedMs: Date.now() - startedAt,
    });
    server.close(() => process.exit(2));
  }, timeoutMs);
}

function splitFail(message) {
  console.error(`[split-markers] ${message}`);
  process.exit(1);
}

function splitParseArgs(argv) {
  const options = {
    input: "",
    outputDir: "",
    baseName: "segment",
    trimMarkers: true,
    gifWidth: 720,
    gifFps: 32,
    webCrf: 23,
    webFps: 32,
    noGif: false,
    minMarkerSec: 0.25,
    minClipSec: 0.5,
    markerPadFrames: 2,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") {
      options.input = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--output-dir") {
      options.outputDir = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--base-name") {
      options.baseName = argv[index + 1] || options.baseName;
      index += 1;
      continue;
    }
    if (value === "--trim-markers") {
      options.trimMarkers = true;
      continue;
    }
    if (value === "--keep-markers") {
      options.trimMarkers = false;
      continue;
    }
    if (value === "--gif-width") {
      options.gifWidth = Number(argv[index + 1] || options.gifWidth);
      index += 1;
      continue;
    }
    if (value === "--gif-fps") {
      options.gifFps = Number(argv[index + 1] || options.gifFps);
      index += 1;
      continue;
    }
    if (value === "--web-crf") {
      options.webCrf = Number(argv[index + 1] || options.webCrf);
      index += 1;
      continue;
    }
    if (value === "--web-fps") {
      options.webFps = Number(argv[index + 1] || options.webFps);
      index += 1;
      continue;
    }
    if (value === "--no-gif") {
      options.noGif = true;
      continue;
    }
    if (value === "--no-poster") {
      // retained for backwards compatibility
      continue;
    }
    if (value === "--min-marker-sec") {
      options.minMarkerSec = Number(argv[index + 1] || options.minMarkerSec);
      index += 1;
      continue;
    }
    if (value === "--min-clip-sec") {
      options.minClipSec = Number(argv[index + 1] || options.minClipSec);
      index += 1;
      continue;
    }
    if (value === "--marker-pad-frames") {
      options.markerPadFrames = Number(
        argv[index + 1] || options.markerPadFrames,
      );
      index += 1;
      continue;
    }
  }

  if (!options.input) splitFail("Missing required --input <path>");
  if (!options.outputDir) splitFail("Missing required --output-dir <path>");
  if (!Number.isFinite(options.gifWidth) || options.gifWidth < 120) {
    options.gifWidth = 720;
  }
  if (!Number.isFinite(options.gifFps) || options.gifFps < 1) {
    options.gifFps = 32;
  }
  if (!Number.isFinite(options.webCrf) || options.webCrf < 0) {
    options.webCrf = 23;
  }
  if (!Number.isFinite(options.webFps) || options.webFps < 1) {
    options.webFps = 32;
  }
  if (!Number.isFinite(options.minMarkerSec) || options.minMarkerSec <= 0) {
    options.minMarkerSec = 0.25;
  }
  if (!Number.isFinite(options.minClipSec) || options.minClipSec <= 0) {
    options.minClipSec = 0.5;
  }
  if (!Number.isFinite(options.markerPadFrames) || options.markerPadFrames < 0) {
    options.markerPadFrames = 2;
  }

  return options;
}

function splitRunTool(tool, args, allowFailure = false) {
  const result = spawnSync(tool, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error && !allowFailure) {
    splitFail(`${tool} spawn error: ${result.error.message}`);
  }
  if (!allowFailure && result.status !== 0) {
    const errorText = [result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    splitFail(`${tool} failed (${args.join(" ")}): ${errorText || "unknown error"}`);
  }
  return result;
}

function splitEnsureTool(tool) {
  const result = splitRunTool(tool, ["-version"], true);
  if (result.error) {
    splitFail(`${tool} unavailable (${result.error.message})`);
  }
  if (result.status !== 0) {
    splitFail(`${tool} not found in PATH or failed to execute`);
  }
}

function splitEnsureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function splitParseDurationSeconds(inputPath) {
  const result = splitRunTool("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    inputPath,
  ]);
  const value = Number((result.stdout || "").trim());
  if (!Number.isFinite(value) || value <= 0) {
    splitFail("Could not determine input duration with ffprobe");
  }
  return value;
}

function splitParseSignalStats(statsText) {
  const lines = statsText.split(/\r?\n/);
  const frames = [];
  let current = null;

  function pushCurrent() {
    if (!current) return;
    if (
      typeof current.pts === "number" &&
      Number.isFinite(current.y) &&
      Number.isFinite(current.u) &&
      Number.isFinite(current.v)
    ) {
      frames.push(current);
    }
    current = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const frameMatch = trimmed.match(
      /frame:\d+\s+pts:[^\s]+\s+pts_time:([0-9.]+)/,
    );
    if (frameMatch) {
      pushCurrent();
      current = { pts: Number(frameMatch[1]), y: NaN, u: NaN, v: NaN };
      continue;
    }
    if (!current) continue;

    const yMatch = trimmed.match(/lavfi\.signalstats\.YAVG=([0-9.]+)/);
    if (yMatch) {
      current.y = Number(yMatch[1]);
      continue;
    }
    const uMatch = trimmed.match(/lavfi\.signalstats\.UAVG=([0-9.]+)/);
    if (uMatch) {
      current.u = Number(uMatch[1]);
      continue;
    }
    const vMatch = trimmed.match(/lavfi\.signalstats\.VAVG=([0-9.]+)/);
    if (vMatch) {
      current.v = Number(vMatch[1]);
      continue;
    }
  }

  pushCurrent();
  return frames;
}

function splitClassifyFrame(frame, strict = true) {
  const y = frame.y;
  const u = frame.u;
  const v = frame.v;

  const isRed = strict
    ? v >= 205 && u <= 118 && y >= 35 && y <= 125
    : v >= 175 && u <= 140 && y >= 20 && y <= 190;
  if (isRed) return "red";

  const isGreen = strict
    ? y >= 120 && u <= 82 && v <= 90
    : y >= 70 && u <= 125 && v <= 130;
  if (isGreen) return "green";

  return null;
}

function splitEstimateFrameGapSec(frames) {
  const deltas = [];
  for (let index = 1; index < frames.length; index += 1) {
    const delta = frames[index].pts - frames[index - 1].pts;
    if (delta > 0 && delta < 2) {
      deltas.push(delta);
    }
  }
  if (deltas.length === 0) {
    return 0.25;
  }
  deltas.sort((a, b) => a - b);
  return deltas[Math.floor(deltas.length / 2)];
}

function splitBuildColorBlocks(frames, targetColor, options) {
  const {
    classifyStrict = true,
    mergeGapSec = 0.25,
    minDurationSec = 0.25,
    minFrames = 1,
  } = options;
  const blocks = [];
  let current = null;

  for (const frame of frames) {
    const color = splitClassifyFrame(frame, classifyStrict);
    if (color !== targetColor) {
      if (current) {
        const duration = current.end - current.start;
        if (duration >= minDurationSec || current.frameCount >= minFrames) {
          blocks.push(current);
        }
        current = null;
      }
      continue;
    }

    if (!current) {
      current = { color, start: frame.pts, end: frame.pts, frameCount: 1 };
      continue;
    }

    if (frame.pts - current.end <= mergeGapSec) {
      current.end = frame.pts;
      current.frameCount += 1;
    } else {
      const duration = current.end - current.start;
      if (duration >= minDurationSec || current.frameCount >= minFrames) {
        blocks.push(current);
      }
      current = { color, start: frame.pts, end: frame.pts, frameCount: 1 };
    }
  }

  if (current) {
    const duration = current.end - current.start;
    if (duration >= minDurationSec || current.frameCount >= minFrames) {
      blocks.push(current);
    }
  }
  return blocks;
}

function splitToStamp(index) {
  return String(index).padStart(2, "0");
}

function splitExportClipAssets(options) {
  const {
    inputPath,
    startSec,
    endSec,
    outputStem,
    videosDir,
    gifsDir,
    gifWidth,
    gifFps,
    webCrf,
    webFps,
    noGif,
  } = options;

  const clipDurationSec = Math.max(0.05, endSec - startSec);
  const clipPath = path.join(videosDir, `${outputStem}.mp4`);
  splitRunTool("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    inputPath,
    "-ss",
    startSec.toFixed(3),
    "-t",
    clipDurationSec.toFixed(3),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-vf",
    `fps=${webFps}`,
    "-r",
    String(webFps),
    "-crf",
    String(webCrf),
    "-movflags",
    "+faststart",
    "-pix_fmt",
    "yuv420p",
    "-an",
    clipPath,
  ]);

  let gifPath = null;
  if (!noGif) {
    gifPath = path.join(gifsDir, `${outputStem}.gif`);
    const palettePath = path.join(gifsDir, `${outputStem}.palette.png`);
    splitRunTool("ffmpeg", [
      "-y",
      "-v",
      "error",
      "-i",
      clipPath,
      "-vf",
      `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos,palettegen`,
      palettePath,
    ]);
    splitRunTool("ffmpeg", [
      "-y",
      "-v",
      "error",
      "-i",
      clipPath,
      "-i",
      palettePath,
      "-filter_complex",
      `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`,
      gifPath,
    ]);
    if (fs.existsSync(palettePath)) {
      fs.unlinkSync(palettePath);
    }
  }

  return { clipPath, gifPath };
}

function splitMain(rawArgs) {
  const options = splitParseArgs(rawArgs);
  const inputPath = path.resolve(options.input);
  const outputDir = path.resolve(options.outputDir);

  if (!fs.existsSync(inputPath)) {
    splitFail(`Input file not found: ${inputPath}`);
  }
  splitEnsureTool("ffmpeg");
  splitEnsureTool("ffprobe");

  splitEnsureDir(outputDir);
  const videosDir = path.join(outputDir, "videos");
  const gifsDir = path.join(outputDir, "gifs");
  const metaDir = path.join(outputDir, "meta");
  splitEnsureDir(videosDir);
  splitEnsureDir(gifsDir);
  splitEnsureDir(metaDir);

  const durationSec = splitParseDurationSeconds(inputPath);
  const statsResult = splitRunTool("ffmpeg", [
    "-y",
    "-v",
    "info",
    "-i",
    inputPath,
    "-vf",
    "signalstats,metadata=print",
    "-f",
    "null",
    "-",
  ]);

  const statsText = `${statsResult.stdout || ""}\n${statsResult.stderr || ""}`;
  const statsLogPath = path.join(metaDir, `signalstats-${Date.now()}.log`);
  fs.writeFileSync(statsLogPath, statsText, "utf8");
  const frames = splitParseSignalStats(statsText);
  if (frames.length === 0) {
    splitFail("No frame signalstats were parsed. Cannot detect color markers.");
  }

  const frameGapSec = splitEstimateFrameGapSec(frames);
  const mergeGapSec = Math.max(0.25, frameGapSec * 2.2);
  const markerPadSec = options.trimMarkers
    ? Math.min(0.55, Math.max(0, frameGapSec * options.markerPadFrames))
    : 0;

  let redBlocks = splitBuildColorBlocks(frames, "red", {
    classifyStrict: true,
    mergeGapSec,
    minDurationSec: options.minMarkerSec,
    minFrames: 1,
  });
  let greenBlocks = splitBuildColorBlocks(frames, "green", {
    classifyStrict: true,
    mergeGapSec,
    minDurationSec: options.minMarkerSec,
    minFrames: 1,
  });

  if (redBlocks.length === 0) {
    redBlocks = splitBuildColorBlocks(frames, "red", {
      classifyStrict: false,
      mergeGapSec,
      minDurationSec: options.minMarkerSec,
      minFrames: 1,
    });
  }
  if (greenBlocks.length === 0) {
    greenBlocks = splitBuildColorBlocks(frames, "green", {
      classifyStrict: false,
      mergeGapSec,
      minDurationSec: options.minMarkerSec,
      minFrames: 1,
    });
  }
  if (redBlocks.length === 0) {
    splitFail("No red marker blocks detected in recording.");
  }

  const firstGreen = greenBlocks.length > 0 ? greenBlocks[0] : null;
  const clips = [];
  for (let index = 0; index < redBlocks.length; index += 1) {
    const currentRed = redBlocks[index];
    const nextRed = redBlocks[index + 1] || null;
    let endBoundary = nextRed ? nextRed.start : durationSec;
    if (!nextRed && firstGreen && firstGreen.start > currentRed.start) {
      endBoundary = Math.min(endBoundary, firstGreen.start);
    }

    const start = options.trimMarkers
      ? currentRed.end + markerPadSec
      : currentRed.start;
    const end = options.trimMarkers ? endBoundary - markerPadSec : endBoundary;
    if (end - start < options.minClipSec) {
      continue;
    }

    const clipIndex = index + 1;
    const clipName = `${splitToStamp(clipIndex)}-${options.baseName}`;
    const assets = splitExportClipAssets({
      inputPath,
      startSec: start,
      endSec: end,
      outputStem: clipName,
      videosDir,
      gifsDir,
      gifWidth: options.gifWidth,
      gifFps: options.gifFps,
      webCrf: options.webCrf,
      webFps: options.webFps,
      noGif: options.noGif,
    });

    clips.push({
      index: clipIndex,
      name: clipName,
      startSec: Number(start.toFixed(3)),
      endSec: Number(end.toFixed(3)),
      durationSec: Number((end - start).toFixed(3)),
      video: assets.clipPath,
      gif: assets.gifPath,
    });
  }

  const manifest = {
    createdAtUtc: new Date().toISOString(),
    input: inputPath,
    outputDir,
    trimMarkers: options.trimMarkers,
    markerPadFrames: options.markerPadFrames,
    markerPadSec: Number(markerPadSec.toFixed(3)),
    webFps: options.webFps,
    durationSec: Number(durationSec.toFixed(3)),
    redBlocks,
    greenBlocks,
    clips,
  };
  const manifestPath = path.join(metaDir, "manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2) + os.EOL,
    "utf8",
  );

  console.log(`[split-markers] Detected red markers: ${redBlocks.length}`);
  console.log(`[split-markers] Detected green markers: ${greenBlocks.length}`);
  console.log(`[split-markers] Frame merge gap: ${mergeGapSec.toFixed(3)}s`);
  console.log(`[split-markers] Marker trim pad: ${markerPadSec.toFixed(3)}s`);
  console.log(`[split-markers] Exported clips: ${clips.length}`);
  console.log(`[split-markers] Manifest: ${manifestPath}`);
}

function main() {
  const rawArgs = process.argv.slice(2);
  const mode = rawArgs[0];

  if (mode === "callback-listener") {
    callbackMain(rawArgs.slice(1));
    return;
  }
  if (mode === "split-markers") {
    splitMain(rawArgs.slice(1));
    return;
  }

  wrapperMain(rawArgs);
}

main();
