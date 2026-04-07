---
title: AI Agent Guide
slug: /ai-agent-guide
---

# AI Agent Guide

Use this page to quickly orient AI agents to this repository without scanning every file.

## Where Agent References Live

Canonical entry files at repository root:

- [llms.txt](pathname:///llms/llms.txt) (quick reference)
- [llms-full.txt](pathname:///llms/llms-full.txt) (full repository guide)

Focused references are grouped under:

- [llms/README.md](pathname:///llms/README.md)
- [llms/llms-components.txt](pathname:///llms/llms-components.txt)
- [llms/llms-patterns.txt](pathname:///llms/llms-patterns.txt)
- [llms/llms-core.txt](pathname:///llms/llms-core.txt)
- [llms/llms-providers.txt](pathname:///llms/llms-providers.txt)
- [llms/llms-utils.txt](pathname:///llms/llms-utils.txt)
- [llms/llms-types.txt](pathname:///llms/llms-types.txt)

Plain text links above open directly as raw text files (no docs chrome).

## Recommended Reading Order for Agents

1. Read `llms.txt` first.
2. Read one focused file for the active task area.
3. Read `llms-full.txt` only if broader architecture context is needed.

## Task-to-File Mapping

- Component behavior and props:
  - [llms/llms-components.txt](pathname:///llms/llms-components.txt)
- Common usage patterns and recipes:
  - [llms/llms-patterns.txt](pathname:///llms/llms-patterns.txt)
- Runtime store/bridge internals:
  - [llms/llms-core.txt](pathname:///llms/llms-core.txt)
- Provider/context lifecycle:
  - [llms/llms-providers.txt](pathname:///llms/llms-providers.txt)
- Public utility facade and helper behavior:
  - [llms/llms-utils.txt](pathname:///llms/llms-utils.txt)
- Type contracts and typed helpers:
  - [llms/llms-types.txt](pathname:///llms/llms-types.txt)

## Ground Rules for Agent Changes

- Preserve public API behavior unless explicitly requested.
- Keep host-aware routing semantics intact.
- Prefer docs/example improvements over internal rewrites.
- Keep current docs and versioned docs in sync when docs behavior changes.
- Validate with:
  - `pnpm run typecheck`
  - `pnpm run test`
  - `pnpm run docs:check`
