---
title: Installation
slug: /getting-started/installation
---

# Installation

Install `react-native-toast-system` using your package manager of choice.

## Install the Package

### pnpm

```bash
pnpm add react-native-toast-system
```

### npm

```bash
npm install react-native-toast-system
```

### yarn

```bash
yarn add react-native-toast-system
```

### bun

```bash
bun add react-native-toast-system
```

## Install Peer Dependencies

Install peers if they are not already present in your app.

### pnpm

```bash
pnpm add react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
pnpm add react-native-screens
```

### npm

```bash
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
npm install react-native-screens
```

### yarn

```bash
yarn add react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
yarn add react-native-screens
```

### bun

```bash
bun add react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
bun add react-native-screens
```

`react-native-screens` is optional and mainly relevant when using native surface overlay behaviors.

## Verify Installation

- Package is present in `package.json`.
- App can type-check imports from `react-native-toast-system`.

## Media Placeholders

- Image placeholder: "Install matrix by package manager"
- GIF placeholder: "Add package and run first typecheck"
- Video placeholder: "Peer dependency setup walkthrough"

## Next

- [Runtime Setup](./GETTING_STARTED_RUNTIME_SETUP.md)
- [First Toast](./GETTING_STARTED_FIRST_TOAST.md)
