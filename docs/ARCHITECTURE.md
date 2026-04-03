---
title: Architecture
slug: /core-concepts
---

# Architecture Guide

## Conceptual Model

`react-native-toast-system` is a provider-owned runtime with host-based rendering.

- `ToastProvider`: lifecycle owner for state, templates, and global bridge binding
- toast store/controller layer: receives commands, resolves host config, updates toast state
- `ToastHost` / `ToastViewport`: render layer for a single host stack
- `toast` and `useToast`: command entrypoints into the same runtime

## Mental Model

Think in this order when designing toast behavior:

1. choose host (`root`, `modal-host`, `sheet-host`, nested host IDs)
2. choose identity behavior (`id` / `dedupeKey`)
3. choose flow behavior (`groupId` / `groupBehavior`)
4. choose ordering behavior (`priority`, host `priorityMode`)

This keeps host isolation, flow updates, and ordering predictable.

## Lifecycle: Provider -> Command -> Render -> Dismiss

1. Provider mounts and binds a runtime bridge for global `toast`.
2. App issues command via `toast` or `useToast(hostId?)`.
3. Store resolves host, dedupe/group/priority rules, and inserts or updates toast records.
4. Matching host stack re-renders and animates toast item lifecycle.
5. Dismiss/update flows feed back through the same controller/store path.
6. Provider unmount unbinds the global bridge for safety.

## Event, State, and Render Separation

- Event/command layer:
  - `toast`, `useToast`, controller methods (`show`, `update`, `dismiss`, `promise`)
- State layer:
  - host-scoped toast records, config resolution, stack ordering
- Render layer:
  - host viewport rendering, gesture + animation + keyboard-aware visual behavior

This separation keeps API ergonomics stable while preserving flexibility in host rendering behavior.

## Provider and Host Boundaries

- One provider controls one runtime subtree.
- Hosts are identified by `hostId` and can coexist (`root`, `modal`, `sheet`, nested IDs).
- `ToastViewport` is an alias of `ToastHost` used as ergonomic default naming.
- Runtime isolation should use nested providers only when isolation is intentional.

## Host Isolation and Routing Rules

- Global `toast.*` defaults to provider `defaultHostId` unless you call `toast.host("...")`.
- `useToast(hostId?)` returns a host-bound controller.
- Host IDs are exact string keys; mismatches silently route nowhere if the target host is not mounted.

## Grouping vs Dedupe vs Priority

These are separate concerns:

- dedupe (`id`, `dedupeKey`, `dedupeMode`): identity resolution
- grouping (`groupId`, `groupBehavior`): flow/channel evolution
- priority (`priority`, host `priorityMode`): ordering significance

Use all three deliberately in async workflows: dedupe for idempotency, grouping for flow updates, priority for prominence.

## Integration Playbook Mapping

Use these architecture patterns by scenario:

- standard app flow:
  - one provider + one root viewport
- modal-specific UX:
  - modal-local host (`hostId="modal-host"`) inside modal surface boundary
- sheet/container UX:
  - container-local host (`hostId="sheet-host"`) inside that container
- navigation persistence:
  - mount root host above transient route content
- keyboard-heavy bottom actions:
  - enable `keyboardAvoidance` and tune `keyboardOffset`
- gesture-heavy stacks:
  - verify gesture config thresholds and pause behavior

See [Advanced Recipes](./ADVANCED_RECIPES.md) for copy-paste scenarios.

## Global API vs Hook API

- `toast` is best for:
  - non-component call sites
  - centralized event handlers
  - explicit host routing with `toast.host("...")`
- `useToast(hostId?)` is best for:
  - component-scoped interactions
  - feature-local controller ergonomics

Both route through the same provider runtime and host resolution logic.

## Public API vs Internal Modules

Supported API surface is package root only:

```ts
import { ToastProvider, ToastViewport, toast, useToast } from "react-native-toast-system";
```

Do not depend on internal folder paths (`src/core/*`, `src/components/*`, etc.). Internal modules are implementation details and may change without semver guarantees.

## Compatibility Guidance

- Compatibility target: modern React Native + peer dependency alignment from `package.json`.
- Expo compatibility: supported through standalone demo workspace and equivalent consumer setup.
- Recommended rollout order:
  1. provider + root host
  2. simple show/dismiss flows
  3. host-targeted modal/sheet flows
  4. promise/template customization

## Runtime Behavior Without Provider

When no active provider is mounted, global `toast` calls remain safe:

- `show/success/error/...` return fallback IDs
- `update/dismiss/isVisible` return no-op values (`false` / `0` / `void`)

This avoids crashes during startup/unmount windows but also means no visible toasts until provider is mounted.

## Performance Characteristics

- Operations are host-scoped and lightweight (`show` append, `update/dismiss` scan host stack).
- Host stack growth is bounded by `maxStackSize`.
- Host unmount unregisters host state and timer resources.
- Interaction pauses (`pauseOnPress`, `pauseOnDrag`) prevent auto-dismiss races during user interaction.

## Validation Boundaries

Current repository confidence comes from:

- automated checks: `typecheck`, `build`, `test`, `example:validate`
- scenario-driven manual protocols for cross-surface behavior
- explicit known limitations documented in [Troubleshooting](./TROUBLESHOOTING.md)
