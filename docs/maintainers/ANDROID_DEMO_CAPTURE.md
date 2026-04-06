# Android Demo Capture (Automated ADB)

Use this guide for the single supported capture flow: automated queue capture via `/capture-demo`.

## Prerequisites

1. `adb` is installed and in `PATH`.
2. Expo demo app is running on the target device:

```bash
pnpm run example:android
```

3. `ffmpeg` is installed (required for web mp4/gif conversion and segment splitting).

## Run Automated Capture

Default:

```bash
pnpm run demo:capture:android:auto -- -RecordSec 95
```

The queue is fixed to 12 preview segments (constant order), including RTL Arabic and light-theme previews.

## Common Flags

- `-DeviceId <id>`: choose a specific device instead of interactive picker.
- `-RecordSec <sec>`: max recording watchdog window.
- `-RecordFps <fps>`: request `adb screenrecord` FPS when `--fps` is supported by the device build.
- `-WebFps <fps>`: force transcode FPS for web mp4 and segment mp4 outputs.
- `-GifFps <fps>`: GIF FPS (`32` by default).
- `-GifWidth <px>`: GIF width (`720` by default).
- `-MarkerPadFrames <n>`: trim padding around red/green markers during split.
- `-CaptureRoute` and `-CaptureQuery`: override route/query (defaults target `/capture-demo?autoStart=1`).
- `-DeepLinkUrl` or `-ExpoDevUrl`: explicit deep-link target overrides.

Example (high-fps):

```bash
pnpm run demo:capture:android:auto -- -RecordSec 95 -RecordFps 60 -WebFps 60 -GifFps 32
```

## Output Structure

- `artifacts/demo-capture-auto/<run-id>/raw/*.raw.mp4`
- `artifacts/demo-capture-auto/<run-id>/videos/*.web.mp4`
- `artifacts/demo-capture-auto/<run-id>/gifs/*.gif`
- `artifacts/demo-capture-auto/<run-id>/segments/videos/*.mp4`
- `artifacts/demo-capture-auto/<run-id>/segments/gifs/*.gif`
- `artifacts/demo-capture-auto/<run-id>/segments/meta/manifest.json`
- `artifacts/demo-capture-auto/<run-id>/meta/capture.txt`

## Notes

- If marker splitting fails, raw and converted outputs are still preserved.
- If device `screenrecord` does not support `--fps`, raw FPS cannot be forced; `WebFps` still applies to converted outputs.
