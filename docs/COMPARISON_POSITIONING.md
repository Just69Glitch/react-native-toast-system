---
title: Decision Guide
slug: /comparison
---

# How to Choose a React Native Toast Approach

Use this page to choose the right toast strategy without committing to a package too early.

## At a glance

| Approach | Modal support | Bottom sheet support | Host-aware routing | Dedupe/grouping | Promise support | Setup complexity | Expo compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Host-aware multi-surface (this library)** | Yes (modal host support) | Yes (sheet-local host support) | Yes (`toast.host(...)`, `useToast(hostId)`) | Yes (built-in dedupe and grouping) | Yes (`toast.promise(...)`) | Medium | Yes |
| Single global toaster | Partial/depends | Partial/depends | No explicit host channels | Partial/depends | Partial/depends | Low | Usually yes |
| Native-first imperative toasts | Partial/depends | Partial/depends | No explicit host channels | Partial/depends | Partial/depends | Low to Medium | Depends on runtime and client setup |
| Sonner-style single-Toaster pattern | Depends | Depends | No explicit host channels | Partial/depends | Yes | Low | Usually yes |

## What this means in practice

- If your app has one main surface, a global toaster is often enough.
- If your app uses modals + sheets heavily, host-aware routing removes most placement edge cases.
- If you need strict control over duplicate noise and async lifecycle messaging, built-in dedupe/grouping + promise flows matter.

## 2-minute decision shortcut

- Pick a **host-aware approach** when user actions happen across root, modal, and sheet in the same flow.
- Pick a **single global toaster** when you want the smallest setup and mostly one-surface UX.
- Pick a **native-first imperative approach** when you prioritize platform-native behavior over unified host routing.
- Pick a **Sonner-style single-Toaster approach** when you want that API style and do not need host channels.

## When this library is the better choice

Use `react-native-toast-system` if most of these are true:

- You need independent toast channels for root, modal, and bottom-sheet surfaces.
- You need predictable host-targeted routing instead of implicit global placement.
- You want built-in dedupe/grouping for high-volume async flows.
- You need promise lifecycle support and keyboard-aware behavior in one system.

## When you should use something else

Choose a different approach if this fits better:

- You only need one global toast surface with very low setup overhead.
- You do not need host-aware routing or grouped lifecycle behavior.
- Your team prefers a specific API style and that style matches your app constraints.

## Notes

- Treat `partial` and `depends` as a signal to validate your exact modal/sheet/navigation stack in a quick spike.
- Final selection should be based on your app's UI surface complexity and failure modes.
