
# Deploy Github Pages

> **Platform support (current):** iOS and Android only. Web is not officially supported yet and may be added in future releases.

This repository already includes a docs deployment workflow:

- `.github/workflows/docs-deploy.yml`

It builds the Docusaurus site and deploys `website/build` to GitHub Pages on:

- pushes to `main`
- manual workflow dispatch

## One-Time GitHub Setup

1. Open repository `Settings -> Pages`.
2. Set `Build and deployment` source to `GitHub Actions`.
3. Save settings.

After this, each successful `Docs Deploy` run publishes the docs site.

## Required Repository Configuration

- Public repo, or GitHub plan that supports Pages for your repo visibility.
- Workflow permissions enabled for pages deployment.

Expected workflow permissions for the job:

- `pages: write`
- `id-token: write`

These are already defined in `.github/workflows/docs-deploy.yml`.

## Local Validation Before Merge

From repository root:

```bash
pnpm run docs:install
pnpm run docs:check
pnpm run docs:build
```

## Troubleshooting

- If deployment job fails with permissions errors, re-check `Settings -> Pages` source.
- If build succeeds but content looks stale, verify commit landed on `main`.
- If base path routing breaks, confirm `website/docusaurus.config.js` values for:
  - `url`
  - `baseUrl`
