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

## [1.3.0] - 2026-04-07

### Added

- New exported utility types for strict template-aware provider config: `TypedToastHostConfig<TTemplateName>` and `TypedToastProviderProps<TTemplateName>`.
- New exported utility types for strict template-aware host config props: `TypedToastHostProps<TTemplateName>` and `TypedToastViewportProps<TTemplateName>`.
- New exported `TypedToastSystem<TTemplateName>` type for importing and reusing the typed `createToastSystem` return contract.

### Changed

- `createToastSystem` now returns typed `ToastHost` and `ToastViewport` wrappers that keep `config.defaultTemplate` aligned with the same inferred template-name union used by the typed provider/controller APIs.
- `createToastSystem` return shape is runtime-only (provider/host/viewport/controllers/templates); typing helpers are now importable types instead of returned functions.
- Base `ToastProvider` no longer accepts a public `templates` prop; custom template registration is now done through `createToastSystem({ templates })`.
- Base `ToastOptions.template` and host `defaultTemplate` contracts are built-in template only (`compact`, `banner`); custom template names are exposed through typed system helpers.

### Fixed

- Resolved production TypeScript error where custom template names (for example `"blurred"`) were rejected for `defaultHostConfig.defaultTemplate` despite template registration.
- Local host/viewport config typing now stays aligned with custom template names when using `createToastSystem`.
- Docs now include a clearer custom-template workflow centered on `createToastSystem` registration.

## [1.2.4] - 2026-04-06

### Fixed

- Mounted non-default hosts now automatically re-resolve when `ToastProvider.defaultHostConfig` changes at runtime (for example theme/direction toggles), so inherited defaults stay in sync without per-host workarounds.
- Default-host propagation now uses the latest runtime default-host baseline instead of only constructor-time baseline values.

### Changed

- Docs now clarify runtime default-host config propagation behavior in API components and troubleshooting guidance.

## [1.2.3] - 2026-04-06

### Added

- AI/agent reference docs set with canonical root entries (`llms.txt`, `llms-full.txt`) plus focused references for components, patterns, core runtime, providers, utils, and types under `llms/`.
- New docs page `AI_AGENT_GUIDE` (current docs and `version-1.2.0`) with task-based mapping and direct plain-text endpoints for all LLM reference files.
- Static plain-text publishing path for agent references at `website/static/llms/*` so docs users can open raw files directly without docs UI framing.

### Changed

- README now includes a dedicated "AI and Agent References" section and quick links to the LLM reference entry points.
- Docs navigation now includes an "AI and Agents" category and homepage visibility for agent-reference onboarding.
- Versioned docs sidebar (`version-1.2.0`) was synchronized to include the new AI/agent guide page.

## [1.2.2] - 2026-04-05

### Added

- Fast onboarding docs set: quick start (`/quick-start-fast`) plus progressive layers for basic usage, modal support, bottom sheet support, advanced routing, and templates/grouping.
- Demo and positioning docs: host-aware 45-second demo flow doc, approach-based comparison guide, DX improvements plan, and maintainer growth/distribution plan.
- Real-world recipe docs for Expo Router integration, React Navigation modals, bottom sheet integration, promise API flows, global error handling, and form submission UX.
- Runtime DX warnings helper (`src/core/dx-warnings.ts`) with dev-time diagnostics for missing provider/before-mount bridge calls, host auto-creation fallback, and dedupe collisions.
- Test setup guard (`tests/setup.ts`) to keep DX warnings muted in normal test output while allowing opt-in debug visibility.
- Automated Android capture pipeline for the example app with deterministic queue playback, deep-link auto-start, callback/logcat completion signaling, and marker-based clip splitting.
- Capture demo assets and docs media set: 12 generated GIF segments now stored in `docs/assets` and surfaced across demo/getting-started content.

### Changed

- README top section was rewritten for scan-first positioning and now includes a concise quick example, "When should I use this?" guidance, demo flow section, and refreshed quick links.
- Docs navigation/home surface now highlights quick start, onboarding layers, demo flow, recipes, comparison, and maintainer guidance for faster discovery.
- Versioned docs (`website/versioned_docs/version-1.2.0`) and versioned sidebar were synchronized with current docs updates without introducing a new docs version entry.
- Test command defaults now use verbose Vitest output with clearer per-test visibility; release validation uses retry-aware test execution.
- Expo demo README updater now writes markdown-safe image markup and has safer group-id fallback resolution logic.
- Docs website homepage now includes demo clip previews, and getting-started/demo docs now embed real GIF captures instead of placeholder media blocks.
- Auto-capture artifact layout is now flattened per run (`raw/`, `videos/`, `gifs/`, `segments/`, `meta/`) for easier browsing and publishing.
- Docs version dropdown now labels the existing `1.2.0` snapshot as `1.2.x` to represent a minor-line docs channel without creating patch snapshots.
- `scripts/docs-version.js` now blocks patch docs versions by default and requires explicit `--allow-patch` override when a patch snapshot is intentionally needed.

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



