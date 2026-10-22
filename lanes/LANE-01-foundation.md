# LANE‑01 — Foundation, contracts & stubs  ⛔ RUN FIRST, ALONE
**Wave 0 · blocks every other lane · ~1 session**

## Goal
Create the project skeleton, frozen contracts and working **stubs** so every other lane can run in parallel and see a working page today.

## Read
`CLAUDE.md`, `docs/03-ARCHITECTURE.md`, `docs/04-TIMING-MATH.md`, `docs/07-FILE-OWNERSHIP.md`

## Step 0 — Reference scroll teardown (do this first)
- [ ] Follow `docs/08-SCROLL-UI-SPEC.md` → "Step 0 teardown procedure" with Playwright (ask before installing it): record scroll videos, frame screenshots, detect libraries and ScrollTrigger settings, measure pins, sticky elements and type scale
- [ ] Write `docs/SCROLL-TEARDOWN.md` and update the "To be measured" items in `docs/08-SCROLL-UI-SPEC.md`
- [ ] Put the measured smooth-scroll settings into `src/contracts/scroll-feel.ts` as frozen constants (`LENIS_OPTIONS`, `STATEMENT_TYPE_SCALE`, `SCENE_PIN_VH` defaults) so every lane uses the same feel
- [ ] Show Heet a 5-line summary of the scroll "feel" before continuing

## Tasks
- [ ] `git init`, `.gitignore` (node_modules, dist, `assets-drop/**` except `README*`/`.gitkeep`, `.vercel`)
- [ ] Vite + React 18 + TS (strict) + Tailwind v4 (`@tailwindcss/vite`), path alias `@/` → `src/`
- [ ] Install Group E packages from `SKILLS.md` (ask first)
- [ ] `src/contracts/index.ts` exactly as in `docs/03-ARCHITECTURE.md` (you may add JSDoc; do not rename)
- [ ] `src/state/storyStore.ts` (Zustand) with the fields listed in architecture
- [ ] **Stubs** with the final interfaces, clearly named `*.stub.ts(x)`:
  - `src/engine/audio/AudioDirector.stub.ts` — silent clock using `performance.now()`
  - `src/engine/scroll/NarratedTrack.stub.tsx` + `useChapter.stub.ts` — pinned section of height `D×12vh` per track, computes progress from scroll (free mode only), splits chapters by config `weight`
  - `src/engine/scroll/SmoothScroll.stub.tsx` — passthrough
  - `src/features/gate/PasscodeGate.stub.tsx`, `src/features/map/AtlasInterlude.stub.tsx`, `MapOpening.stub.tsx`
  - One stub per phase/feature component listed in `App.tsx`
  - `src/engine/index.ts` barrel that re-exports either the real module (if present) or the stub — lanes replace the export line only in LANE‑15
- [ ] `src/data/story.generated.json` **sample** built from `content/config/story.config.json` with placeholder track durations (t0 22.99s, t1 45.09s, t2 43.31s — real files exist, use them), equal chapter splits and placeholder media
- [ ] `scripts/make-placeholders.mjs`: for each phase generate N gradient JPGs with the phase number and index drawn on them (use `sharp` + SVG), and silent MP3s for the 3 tracks (25s, 22s, 23s) with ffmpeg (`anullsrc`). Output into `assets-drop/` **only if the folder is empty** (never overwrite Heet's real files)
- [ ] npm scripts from architecture (`dev, build, preview, typecheck, lint, placeholders, media:*, media, test:e2e, shots`) — non-owned ones may print "implemented by LANE‑XX"
- [ ] `App.tsx` skeleton composing all stubs in the documented order
- [ ] `vercel.json` with `X-Robots-Tag: noindex, nofollow` and cache headers for `/media/*`; `<meta name="robots" content="noindex">` in `index.html`
- [ ] Create empty `docs/CONTRACT-REQUESTS.md`
- [ ] First commit on `main`, tag `foundation`

## Acceptance
- `docs/SCROLL-TEARDOWN.md` exists with measured numbers and recordings
- `npm run dev` shows the whole stubbed journey top to bottom; `npm run typecheck && npm run build` pass
- Contracts compile; stubs satisfy them
- `npm run placeholders` creates media without touching existing files

## Kickoff prompt
> Read CLAUDE.md and lanes/LANE-01-foundation.md. Execute this lane fully. Ask before installing packages. Commit at the end with tag `foundation`.
