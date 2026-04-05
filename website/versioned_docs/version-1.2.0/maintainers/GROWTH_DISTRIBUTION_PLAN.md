# Growth and Distribution Plan

> Scope: practical distribution for qualified React Native teams evaluating multi-surface toast behavior (root + modal + sheet), not broad awareness campaigns.

## 1. Technical Content Plan (3 Articles)

### Article 1

- Title: `Why Toasts Break in Modals and Bottom Sheets (and How to Fix It in React Native)`
- Target reader: Senior React Native engineers using React Navigation modals and bottom-sheet flows.
- Outline:
  1. Quick failure demo: root-only toast appears behind modal/sheet.
  2. Why global-only overlays fail in layered surfaces.
  3. Host-aware fix with `toast.host(...)` and `useToast(hostId)`.
  4. Minimal implementation recipe for modal + sheet.
  5. Validation checklist (gesture, keyboard, route transition).
- CTA: `Run the 45-second host-aware demo and copy the modal/sheet recipe from docs.`

### Article 2

- Title: `Shipping Safer Async UX in React Native with Promise Toast Flows`
- Target reader: Product engineers working on API-heavy forms and transactional flows.
- Outline:
  1. Problem: loading/success/error feedback drift across screens.
  2. `toast.promise(...)` baseline with grouped updates.
  3. Prevent duplicate noise with `groupId` and dedupe strategy.
  4. Failure-path handling patterns (reject paths, retries).
  5. Copy-paste form submission and global error recipes.
- CTA: `Adopt the promise + grouping recipe in one high-traffic form and measure retry/error clarity.`

### Article 3

- Title: `Expo Router + React Navigation: A Practical Toast Integration Playbook`
- Target reader: Teams migrating between Expo Router and React Navigation stacks.
- Outline:
  1. Where to mount provider/viewport in each navigation model.
  2. Modal route host placement and common mistakes.
  3. Bottom sheet host placement pattern.
  4. Integration checklist for release readiness.
  5. Troubleshooting map (missing host, before-mount calls, dedupe collisions).
- CTA: `Follow the quick-start + recipe sequence and report any integration blockers in Discussions.`

## 2. Distribution Strategy

### Target communities

- Reddit:
  - `r/reactnative`
  - `r/expojs`
- Discord:
  - Reactiflux (`#react-native`)
  - Expo community channels
- Twitter/X:
  - React Native maintainers, Expo-heavy teams, mobile product engineers
- Optional long-form mirrors:
  - DEV Community (`reactnative`, `expo`)
  - Hashnode React Native publications

### Posting sequence (per release cycle)

1. Publish or refresh the 45-second demo + one core recipe doc.
2. Post long-form article (site/DEV/Hashnode) with concrete code and trade-offs.
3. Post Reddit version (problem-first, no marketing framing, include limitations).
4. Share concise Discord message with request for specific integration feedback.
5. Publish Twitter/X summary thread linking to article + demo + recipe.
6. After 72 hours, post follow-up with answers to the top 3 questions and doc updates.

### Message style by channel

- Reddit:
  - style: engineering postmortem tone
  - format: problem -> reproducible setup -> fix -> trade-offs
  - avoid: broad claims, vanity metrics, "best library" language
- Discord:
  - style: concise and help-seeking
  - format: one-liner context + single link + explicit feedback ask
  - avoid: multi-link dumps
- Twitter/X:
  - style: short practical thread
  - format: 1 problem, 1 fix, 1 demo proof, 1 recipe link
  - avoid: engagement bait

## 3. Platform-Ready Post Drafts

### Reddit draft (`r/reactnative`)

Title:
`If your RN toasts disappear behind modals/sheets, this host-aware setup fixed it for us`

Body:
`We kept seeing toast feedback appear in the wrong layer when actions were triggered inside React Navigation modals and bottom sheets.`

`Root-only setup was fine for simple screens, but once we added nested surfaces, feedback felt disconnected.`

`What worked:`
- `ToastProvider` at app root
- root `ToastViewport` for global events
- local `ToastHost hostId="modal"` / `ToastHost hostId="sheet"` inside those surfaces
- `useToast("modal")` and `useToast("sheet")` for local actions

`We also added promise lifecycle + dedupe grouping for retry-heavy flows, so duplicate taps don't spam toasts.`

`Docs + demo:`
- `45-second flow: root -> modal -> sheet -> dedupe -> promise -> keyboard`
- `copy-paste recipes for Expo Router, React Navigation modals, and bottom-sheet integration`

`If you're running a different modal/sheet stack, I'd love to know where this breaks. I can turn those cases into docs updates.`

### Discord draft (Reactiflux / Expo)

`Hey folks - looking for real-world feedback on a host-aware toast setup for RN layered surfaces.`

`Context: root-only toasts were getting awkward with modal + bottom sheet flows, so we documented a pattern with per-surface hosts + promise/dedupe flows.`

`If you have 5 minutes, can you sanity-check whether this fits your nav/sheet stack?`

`Links:`
- `Demo flow: <demo-link>`
- `Recipes: <recipes-link>`

`Most helpful feedback: where behavior still feels wrong (modal layering, keyboard overlap, retry spam).`

### Twitter/X draft

`React Native toast UX usually breaks when apps move beyond one root screen.`

`We documented a host-aware pattern that keeps feedback in the right layer:`
- `root toast`
- `modal toast`
- `bottom-sheet toast`
- `dedupe + promise lifecycle`
- `keyboard-safe bottom placement`

`Includes a 45s demo + copy-paste recipes for Expo Router, React Navigation modals, and bottom-sheet integration.`

`If your stack differs, reply with your setup and I'll add a tested recipe.`

## 4. Feedback Loop Plan

### How to collect feedback

- GitHub Discussions:
  - create/update one pinned thread: `Integration feedback: modals, sheets, routing`
- GitHub Issues:
  - add `integration-feedback` issue template with required fields:
    - nav stack
    - modal/sheet library
    - expected vs actual toast behavior
    - minimal repro link
- Docs touchpoint:
  - add "Was this recipe enough?" prompt at end of high-traffic recipe pages linking to Discussions thread
- Direct channel capture:
  - summarize Reddit/Discord/X questions into a weekly maintainer note

### What to track (non-vanity)

- Activation signals:
  - number of users who reach quick-start and open at least one recipe page
  - number of users reporting first successful root+modal/sheet integration
- Usage-quality signals:
  - % of support questions resolved by existing recipe docs
  - median time-to-first-corrective-doc-update after reported confusion
- Friction signals:
  - top repeated failure themes (before-mount calls, missing host, wrong hostId routing)
  - docs drop-off points:
    - quick-start -> recipe transition
    - recipe page exits before code example
- Trust signals:
  - number of qualified follow-up conversations (teams with real layered UI constraints)
  - ratio of actionable integration feedback to generic praise

### Operating cadence

- Weekly:
  - review channel feedback
  - tag each item (`docs-gap`, `dx-warning`, `integration-bug`, `not-in-scope`)
  - publish one short changelog-style "what we clarified this week"
- Monthly:
  - refresh top 2 recipes based on real questions
  - retire low-signal distribution channels for the next cycle

### Immediate publish checklist

- Replace placeholders:
  - `<demo-link>`
  - `<recipes-link>`
- Verify links resolve and code snippets run.
- Post in sequence within 3-5 days to keep conversation continuity.

