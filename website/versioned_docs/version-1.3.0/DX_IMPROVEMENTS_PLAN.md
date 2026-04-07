---
title: DX Improvements Plan
slug: /dx-improvements
---


# DX Improvements Plan

This plan focuses on guardrails and clarity without changing core architecture or public API shape.

## Priority Summary

| Priority | Item | Status |
| --- | --- | --- |
| P0 | Actionable dev warnings for missing provider / before-mount calls | implemented |
| P0 | Actionable dev warning for host auto-fallback creation | implemented |
| P1 | Actionable dev warning when dedupe identity collides | implemented |
| P1 | Document API naming guidance and preferred usage patterns | proposed |
| P2 | Add explicit preset guidance for `success`/`error`/`loading`/`promise` | implemented (docs), proposed (runtime tuning) |

## Runtime Warning Strategy

| Scenario | Warning strategy | Action in message | Status |
| --- | --- | --- | --- |
| Missing provider | Warn once per method in dev when bridge was previously mounted but is currently unavailable. | Mount `<ToastProvider>` at app root and avoid conditional unmounts. | implemented |
| Toast triggered before mount | Warn once per method in dev when no bridge has ever been mounted yet. | Delay toast calls until after first render/mount lifecycle. | implemented |
| Missing host fallback | Warn once per missing `hostId` in dev when store auto-creates host state without a mounted renderer. | Mount `<ToastHost hostId="..."/>` or `<ToastViewport hostId="..."/>` in target surface. | implemented |
| Duplicate toast dedupe | Warn once per dedupe identity/mode in dev when a dedupe collision is detected. | Confirm `dedupeKey`/`id` intent and selected `dedupeMode`. | implemented |

## API Clarity and Naming Consistency

| Recommendation | Impact | Effort | Status |
| --- | --- | --- | --- |
| Prefer `toast.host("...")` for imperative cross-surface calls and `useToast(hostId)` for component-local flows. | High | Low | proposed |
| Add a short naming note: treat `ToastViewport` as the default host renderer alias, `ToastHost` for explicit `hostId`. | Medium | Low | proposed |
| Add a docs glossary for `dedupe` vs `grouping` vs `priority` with one-line examples. | High | Medium | proposed |
| Add a migration note for teams moving from single-root toast libraries. | Medium | Medium | proposed |

## Default Behavior and Preset Guidance

### Current sensible defaults (no breaking changes)

| API | Current baseline |
| --- | --- |
| `toast.success(...)` | Variant `success`, host duration defaults apply unless overridden. |
| `toast.error(...)` | Variant `error`, host duration defaults apply unless overridden. |
| `toast.loading(...)` | Persistent loading toast (`persistent: true`, `duration: "persistent"`). |
| `toast.promise(...)` | Loading first, then auto-update to success/error with fallback durations (`3000` success, `4500` error) when not supplied. |

### Proposed runtime tuning (non-breaking)

| Proposal | Rationale | Status |
| --- | --- | --- |
| Add optional host-level variant duration defaults for `success` and `error` in docs presets examples. | Make common flows feel consistent without per-call repetition. | proposed |
| Add optional docs preset for standard promise flow group behavior (`update-in-group`). | Reduces duplicate async toasts in retry-heavy screens. | proposed |

## Minimal implementation patch list

- Added dev-only warning utility for one-time actionable warnings.
- Added bridge-state-aware warnings to global `toast` methods.
- Added host auto-fallback warning when unknown host IDs are used without mounted host renderers.
- Added dedupe collision warning to make dedupe behavior explicit during integration.

## Non-breaking guarantee

- No API signatures changed.
- No architecture rewrite performed.
- Runtime changes are warning-only guardrails in dev environments.
