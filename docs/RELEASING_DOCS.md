---
title: Releasing Docs
slug: /releasing-docs
---


# Releasing Docs

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

This project uses Docusaurus versioned docs hosted on GitHub Pages.

## Quick Commands

- List existing published docs versions:

```bash
pnpm run docs:version -- --list
```

- Create a new docs version snapshot:

```bash
pnpm run docs:version -- 1.1.0
```

- Build docs locally:

```bash
pnpm run docs:build
```

- Serve built docs locally:

```bash
pnpm run docs:serve
```

## Recommended Release Flow

1. Finish library changes and docs updates in `./docs`.
2. Snapshot docs for the release:

```bash
pnpm run docs:version -- <x.y.z>
```

3. Verify docs output:

```bash
pnpm run docs:build
```

4. Commit docs version artifacts:
   - `website/versioned_docs/`
   - `website/versioned_sidebars/`
   - `website/versions.json`
   - any updated docs/config files
5. Push to `main` and let GitHub Pages deployment run.

## Notes

- `./docs` remains the editable "Next" docs stream.
- `website/versioned_docs/version-<x.y.z>/` is immutable release content.
- Keep docs build green in CI before merging.
