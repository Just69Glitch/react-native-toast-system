# Releasing Guide (Pre-Publish Automation Baseline)

Phase 8 introduces CI and release preparation automation, but does not perform live npm publish.

## Workflows

- `ci.yml`: validates PRs and `main` with lint/typecheck/test/build/pack/example/docs gates.
- `release-preparation.yml`: manual workflow that prepares a release PR by bumping version and adding changelog heading placeholders.
- `release-dry-run.yml`: manual workflow that runs full gates and `pnpm publish --dry-run` only.
- `draft-release-notes.yml`: creates draft GitHub releases from version tags (`v*.*.*`) with generated release notes.

## Release Preparation Checklist

1. Ensure CI is green (`ci.yml`).
2. Run `release-preparation.yml` with target SemVer version.
3. Review generated release PR:
   - confirm `package.json` version bump
   - replace changelog placeholder date (`YYYY-MM-DD`)
   - finalize release notes under new version heading
4. Merge release PR after review.
5. Create/push version tag (`vX.Y.Z`) once release commit is on `main`.
6. Review generated draft release notes from `draft-release-notes.yml`.

## Local Validation Commands

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run pack:dry-run
pnpm run example:validate
pnpm run docs:check
```

## NPM Publish Safety (This Phase)

- `release-dry-run.yml` validates publishability with `pnpm publish --dry-run`.
- No workflow in this phase performs live `npm publish`.
- Live publish enablement is deferred to Phase 9.

## Secrets and Permissions

Current Phase 8 workflows rely on `GITHUB_TOKEN` only.

Future live publish (Phase 9) will require an npm token secret (for example `NPM_TOKEN`) and explicit publish guards.

## Packaging and Docs Footprint

Policy decision remains: `docs/` is repo-only and is not shipped in npm tarballs.

Shipped docs/policy files in package tarball:

- `README.md`
- `CHANGELOG.md`
- `LICENSE`

Enforced via `scripts/check-docs.js` (`docs:check` and `docs:footprint:check`).

## Related Maintainer Docs

- GitHub Pages docs deployment: `docs/maintainers/DEPLOY_GITHUB_PAGES.md`
- Expo demo publishing and QR flow: `docs/maintainers/EXPO_DEMO_PUBLISHING.md`
