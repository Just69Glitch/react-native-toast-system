
# Versioning

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

This project follows Semantic Versioning with practical guidance for current `0.x` maturity.

## SemVer Stance

- `MAJOR`: incompatible API changes
- `MINOR`: backward-compatible features
- `PATCH`: backward-compatible fixes/docs/tooling updates

## Pre-1.0 Compatibility Expectations

Because the package is in `0.x`, some API changes may ship in minor releases when needed.

When this happens, maintainers should:

- document the break clearly in `CHANGELOG.md`
- include migration guidance in release notes
- keep changes as small and predictable as possible

## What Counts as Breaking

Examples include:

- removing or renaming root exports
- changing function signatures or option defaults with behavioral impact
- tightening type contracts in ways that reject previously valid consumer code
- changing peer dependency requirements that force consumer upgrades

## Deprecation Guidance

When feasible, deprecate first, then remove in a later release with explicit changelog notes.
