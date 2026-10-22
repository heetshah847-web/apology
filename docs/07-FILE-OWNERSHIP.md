# 07 — File ownership (prevents merge conflicts between parallel lanes)

A lane may **only** create/modify paths it owns. Read anything. Shared contract changes go to `docs/CONTRACT-REQUESTS.md`.

| Lane | Owns |
|---|---|
| 01 Foundation | `package.json`, configs (`vite`, `tsconfig`, `tailwind`, `eslint`, `vercel.json`, `.gitignore`), `index.html`, `src/main.tsx`, `src/App.tsx` (skeleton), `src/contracts/**`, `src/state/storyStore.ts`, all `*.stub.ts(x)` files, `scripts/make-placeholders.mjs`, `docs/CONTRACT-REQUESTS.md`, `docs/SCROLL-TEARDOWN.md`, `src/contracts/scroll-feel.ts`, `assets-drop/references/nesil/**` (Step 0) |
| 02 Design system | `src/design/**`, `docs/REFERENCE-NOTES.md`, `src/index.css` |
| 03 Media pipeline | `scripts/optimize-images.mjs`, `scripts/optimize-videos.sh`, `scripts/build-manifest.mjs`, `src/data/media.manifest.json`, `src/engine/media/**` |
| 04 Audio & captions | `src/engine/audio/**`, `scripts/prepare-audio.sh`, `scripts/make-captions.py`, `scripts/align-script.mjs`, `scripts/build-story.mjs`, `content/captions/**`, `src/data/story.generated.json` |
| 05 Scroll engine | `src/engine/scroll/**` |
| 06 Gate & map | `src/features/gate/**`, `src/features/map/**` |
| 07 Queen | `src/features/phases/queen/**` |
| 08 Friendship | `src/features/phases/friendship/**` |
| 09 Love | `src/features/phases/love/**` |
| 10 Distance | `src/features/phases/distance/**` |
| 11 Apology & Question | `src/features/phases/apology/**`, `src/features/question/**` |
| 12 Planner | `src/features/planner/**`, `src/state/plannerStore.ts`, `src/data/planner.json` |
| 13 Venues | `src/data/venues.json`, `docs/VENUE-RESEARCH.md`, `scripts/build-venues.mjs` |
| 14 Order | `src/features/order/**` |
| 15 Integration & deploy | `src/App.tsx` (final wiring), `tests/**`, `docs/QA-REPORT.md`, replacing stubs imports, deploy config tweaks |

`content/**` is owned by **Heet**. Lanes may only read it (LANE‑13 may append to `venues.seed.json` after asking).
