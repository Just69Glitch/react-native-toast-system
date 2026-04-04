---
title: Advanced Guides
slug: /advanced-guides
---


# Advanced Guides

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

This guide is split into focused pages for easier scanning during implementation and debugging.

All examples use package-root imports only.

## Recipe Groups

- [Hosts and Surfaces](./ADVANCED_HOSTS_SURFACES.md)
- [Flows and Interactions](./ADVANCED_FLOWS_INTERACTIONS.md)

## Validation Pairing

For integration-heavy recipes, run:

- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run example:validate`
- `pnpm run example:start` and execute the manual checks listed in `example/README.md`
