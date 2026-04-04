# Changelog

All notable changes to this project are documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/)

## Policy

- Update `## [Unreleased]` as part of each pull request that changes behavior, API, dependencies, or docs.
- Group entries under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Keep entries user-focused and concise.
- Move unreleased entries into a versioned heading during release preparation.

## [Unreleased]

### Added

- _No unreleased entries yet._

## [1.2.1] - 2026-04-04

### Changed

- Clarified maintainer release order so Expo demo README updates happen before npm publish when the npm package page must reflect the latest demo block.

## [1.2.0] - 2026-04-04

### Added

- Subpath exports for `components`, `hooks`, `providers`, `utils`, and `types` to support more granular imports.
- New release validation script (`pack:verify:subpaths`) to verify packed tarballs exclude `src/` and keep subpath exports resolvable.

### Changed

- Package publishing footprint now ships built artifacts/docs/license/changelog without shipping `src/`.
- Example Expo app now uses subpath imports throughout to validate real consumer usage.
- Documentation/README now include subpath import guidance and a platform support note (currently iOS/Android only).

## [0.1.0] - 2026-03-31

### Added

- Initial TypeScript React Native library scaffold for `react-native-toast-system`.
- Public root API surface with provider, host/viewport, global toast facade, hook controller, typed system helpers, and exported type contracts.
- Core package build output for CommonJS, ESM module, and TypeScript declarations via `react-native-builder-bob`.
- Core documentation set (`README`, API reference, architecture guide, advanced recipes, troubleshooting, FAQ).
- Open-source governance assets (`LICENSE`, `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `SUPPORT`, `VERSIONING`, `RELEASING`).
- GitHub community templates (bug report, feature request, pull request template) and issue config links.
- CI/release automation baseline workflows for PR/main validation, release preparation PR, publish dry-run, and draft release notes.

### Changed

- Repository policy now explicitly enforces repo-only `docs/` footprint while shipping `README.md`, `CHANGELOG.md`, and `LICENSE` in npm artifacts.

### Security

- Established private vulnerability disclosure policy path and reporting expectations.

### Notes

- Integration-heavy scenarios (including RTL/device-specific verification) currently include manual-protocol validation paths documented in repository guides.
