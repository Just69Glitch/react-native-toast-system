# Expo Demo Publishing And QR

This guide describes a free method to share the `example/` app with a scanable QR code for Expo Go.

This repository includes a manual GitHub Action for demo publish:

- `.github/workflows/expo-demo-publish.yml`

## Goal

- host a publicly shareable demo build
- get a stable URL
- show a QR code in `README.md`

## Automated Path (GitHub Action)

Use the `Expo Demo Publish` workflow to run EAS Update from GitHub Actions.

### One-time setup

1. Create an Expo access token.
2. Add repository secret `EXPO_TOKEN` in `Settings -> Secrets and variables -> Actions`.

### Run workflow

1. Open `Actions -> Expo Demo Publish`.
2. Click `Run workflow`.
3. Configure:
   - `branch` (default `demo`)
   - `message` (update message)
   - `platform` (`all`, `android`, or `ios`)
   - `run_example_validation` (`true` to run `example:validate` first)
4. Run the workflow and copy the update URL from logs/output.

## Recommended Free Path (Expo EAS Update)

1. Create or use an Expo account (free plan).
2. Configure the example app identity in `example/app.json` (`slug`, optional `owner`) so it is unique.
3. Sign in from your machine:

```bash
pnpm --dir example dlx eas-cli@latest login
```

4. Publish an update to a demo branch:

```bash
pnpm --dir example dlx eas-cli@latest update --branch demo --message "Demo update"
```

5. Save the URL printed by EAS Update output (this is your shareable demo link).

## Add QR To README

Use the shareable URL from the previous step to create/update a QR image in the repo.

Example using a free QR endpoint:

```text
https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=<ENCODED_SHARE_URL>
```

Recommended flow:

1. Generate the image once.
2. Save it to `website/static/img/demo/expo-qr.png` (or another tracked asset path).
3. Reference it from root `README.md` under an `Expo Demo` section.

## Pre-Publish Validation Checklist

Run before pushing demo updates:

```bash
pnpm run example:validate
pnpm run docs:check
```

Manual checks:

- open the shared URL
- scan QR from another device using Expo Go
- verify key demo screens load (`hosts`, `stress`, `templates`)

## Notes

- The workflow is intentionally manual (`workflow_dispatch`) so maintainers can review before sharing.
- No npm publish is required for demo updates.
