---
title: Troubleshooting
slug: /troubleshooting
---

# Troubleshooting and Known Limitations

Use this document as an operational debugging guide for real app integration issues.

## Troubleshooting Playbook (Symptom -> Cause -> Fix)

### Symptom: Toast does not appear

- Cause:
  - `ToastProvider` is not mounted for the current subtree.
  - No active host (`ToastViewport`/`ToastHost`) exists for target host ID.
  - Call is routed to a host ID that is not currently mounted.
- Fix:
  1. Mount `ToastProvider` above the affected screen.
  2. Mount at least one host (`ToastViewport` for default host).
  3. If using host routing, verify matching host ID is mounted.

### Symptom: Global `toast` calls do nothing

- Cause:
  - Calls happen before provider mount or after provider unmount.
- Fix:
  1. Trigger global calls only while provider subtree is active.
  2. For component-local flows, prefer `useToast()` to align with component lifecycle.

### Symptom: Toast appears in wrong host

- Cause:
  - Missing `hostId` routing (`toast.host("...")` / `useToast("...")`).
  - Duplicate expectations about default host behavior.
- Fix:
  1. Add explicit host routing for non-default stacks.
  2. Confirm host IDs match exactly (`sheet` vs `sheet-host`, etc.).

### Symptom: Toasts render behind modal/sheet/native surface

- Cause:
  - Host placement is outside the visual/native surface where interaction occurs.
  - Overlay behavior is not configured for current surface stack.
- Fix:
  1. Mount a host inside the modal/sheet container.
  2. Use `ToastNativeSurfaceBoundary` where native boundary handling is needed.
  3. For RN Screens overlays, evaluate `useRNScreensOverlay` and `rnScreensOverlayViewStyle`.

### Symptom: Gesture behavior is unstable

- Cause:
  - Host app gesture/reanimated/worklets setup is incomplete.
  - Gesture thresholds are too aggressive for your UX.
- Fix:
  1. Verify peer library setup in host app.
  2. Tune gesture config (`dismissThreshold`, `cancelThreshold`, `velocityThreshold`).
  3. Re-run gesture scenarios in the demo playground.

### Symptom: Bottom toasts overlap keyboard

- Cause:
  - Keyboard avoidance is disabled or offset is too low for device/input mode.
- Fix:
  1. Enable `keyboardAvoidance` on host config or per-toast options.
  2. Tune `keyboardOffset` for your screen layout.
  3. Validate on real target devices and keyboard modes.

### Symptom: Promise toast remains in loading state

- Cause:
  - Promise branch not resolving/rejecting correctly.
  - Errors are swallowed before toast promise handlers run.
- Fix:
  1. Ensure promise settles in all execution paths.
  2. Keep success/error handlers explicit in `toast.promise(...)`.
  3. Add logging around async branch that drives toast lifecycle.

## Expo Demo Startup (Symptom -> Cause -> Fix)

### Symptom: `Cannot find module 'expo'` or missing Expo dependencies

- Cause:
  - Demo dependencies were not installed in `example/`.
- Fix:

```bash
pnpm run example:install
```

### Symptom: Metro startup fails with `spawn EPERM`

- Cause:
  - Restricted/sandboxed execution environment blocks worker process spawning.
- Fix:
  - Run Expo startup in a normal local shell or outside sandbox restrictions.

### Symptom: Expo says port is already in use

- Cause:
  - Another Metro/Expo process is bound to the requested port.
- Fix:
  1. Stop the conflicting process.
  2. Restart on a different port:

```bash
pnpm --dir example run start -- --port 8100
```

### Symptom: Expo startup fails with network/dependency validation fetch errors

- Cause:
  - Offline or restricted network environment during startup checks.
- Fix:
  1. Restore network access for normal startup.
  2. Use offline expectations where needed (`EXPO_OFFLINE=1`).
  3. Confirm dependencies were already installed.

### Symptom: `example:typecheck` fails on demo wiring

- Cause:
  - Stale demo config or missing foundation files.
- Fix:

```bash
pnpm run example:validate
```

## Known Limitations

### Automated UI/device coverage

Automated CI currently validates type/build/tests and demo config/type safety, but does not run full simulator/device UI flows.

### Manual protocol requirement

Integration-heavy scenarios (modal/sheet surfaces, keyboard overlap, navigation persistence, RTL parity) still rely on manual checks listed in `example/README.md`.

### RTL full verification requires app restart

Runtime RTL toggles are useful for spot checks, but full validation requires app-level RTL enablement and restart.

### Platform variance

Gesture/overlay behavior can vary by iOS/Android version, navigation stack, and sheet/modal implementation details in host apps.

## Validation Status

Current confidence status:

- Automated: `pnpm run typecheck`, `pnpm run build`, `pnpm run test`, `pnpm run example:validate`
- Manual protocol-backed: modal host, sheet host, navigation persistence, keyboard overlap, gesture stress, theme checks, RTL restart validation
- Environment waiver notes:
  - constrained sandboxes may require elevated execution due `spawn EPERM`

## Recommended Validation Checklist

- run `pnpm run typecheck`
- run `pnpm run build`
- run `pnpm run test`
- run `pnpm run example:validate`
- run `pnpm run example:start` and verify startup logs
- execute manual protocols for modal, sheet, keyboard, navigation persistence, host targeting, promise flows, theme, and RTL

