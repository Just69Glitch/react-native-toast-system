# Contributing

Thanks for your interest in improving `react-native-toast-system`.

## Development Setup

```bash
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

## Workflow Expectations

- keep changes focused and easy to review
- preserve root public API behavior unless the change explicitly proposes a contract update
- use package-root imports in docs/examples (`react-native-toast-system`), not deep internal imports
- keep documentation aligned with actual runtime behavior

## Lint Policy (Current Baseline)

A dedicated ESLint setup is not yet introduced in this repository. For now, `pnpm run lint` intentionally runs the TypeScript static gate (`lint:basic -> typecheck`) so CI still enforces a deterministic baseline while ruleset rollout is deferred.

## Quality Gates

Run before opening a PR:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run pack:dry-run
pnpm run example:validate
pnpm run docs:check
```

## Pull Request Standards

- include a concise problem statement and solution summary
- call out user-visible behavior changes explicitly
- include updated docs and tests when behavior changes
- avoid mixing unrelated refactors in the same PR
- keep compatibility notes clear when changing options/types

## Review Standards

Reviews prioritize:

- correctness and regressions
- API/backward compatibility impact
- test and validation coverage
- clarity of docs and migration notes

## Docs Publish-Footprint Policy

Policy: repository docs are source-of-truth, but only `README.md`, `CHANGELOG.md`, and `LICENSE` are shipped in npm tarballs.

This is intentionally enforced by `pnpm run docs:check` and `pnpm run docs:footprint:check`.

## CI and Release Automation

Phase 8 workflows:

- `.github/workflows/ci.yml`: PR/main validation gates
- `.github/workflows/release-preparation.yml`: manual version-prep PR automation
- `.github/workflows/release-dry-run.yml`: manual safe publish-path dry run
- `.github/workflows/draft-release-notes.yml`: draft GitHub release notes from tags

## Community Paths

- support and usage questions: [SUPPORT.md](./SUPPORT.md)
- security concerns: [SECURITY.md](./SECURITY.md)
- expected release/version behavior: [VERSIONING.md](../docs/maintainers/VERSIONING.md), [RELEASING.md](../docs/maintainers/RELEASING.md)
- participation expectations: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
