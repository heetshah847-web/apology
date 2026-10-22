# Contract change requests
Lanes: do NOT edit `src/contracts/*`. Append requests here (lane · what · why). LANE-15 resolves them.

- **LANE-12 · barrel swap + `/planner` route**: `src/features/index.ts` should export `DatePlanner` from `./planner/DatePlanner` (real component, same name) instead of `DatePlanner.stub`. For the standalone `/planner` route, `src/main.tsx` (or App) should render `<DatePlanner />` alone when `location.pathname === '/planner'`. Planner hands the order to LANE-14 via `usePlannerStore.getState().order` (also sets `storyStore.orderPlaced`). Lane 12 tested through `src/features/planner/harness.tsx` (needs a root html page to mount, not shipped).

## LANE-04 · audio & captions
1. **`CaptionCue.needsReview?: boolean`** — `story.generated.json` already emits it on cues whose text did not come from Heet's script (Whisper transcript or empty). Lets the UI/QA flag them. Harmless if ignored.
2. **`package.json` scripts (LANE-01 owns the file)** — wired locally, please keep when merging:
   `media:audio` → `bash scripts/prepare-audio.sh`; `media:captions` → `python scripts/make-captions.py && node scripts/align-script.mjs`; `media:story` → `node scripts/build-story.mjs`; new `test:audio` → `node --experimental-strip-types src/engine/audio/captions.test.ts && node scripts/align-script.test.mjs`.
3. **LANE-15 barrel swap** — in `src/engine/index.ts` change `./audio/AudioDirector.stub` to `./audio/AudioDirector`. `AudioDirector.ts` still reads track data through `../storyData.stub` (typed view of `story.generated.json`).
4. **Unmatched `at` in `meta.json`** — `at` values must be seconds in the *track*, not the chapter (build-story passes them through unchanged).
## LANE-03 · media pipeline
1. **`package.json` scripts (LANE-01 owns the file)** — `media:images` → `node scripts/optimize-images.mjs && node scripts/build-manifest.mjs`; `media:videos` → `bash scripts/optimize-videos.sh && node scripts/build-manifest.mjs`. Also run `node scripts/build-manifest.mjs` alone after `media:story` if the report should use real chapter times.
2. **Dependencies** — none added. Uses `sharp` and `ffmpeg-static` already in the project.
3. **Barrel (LANE-15)** — `src/engine/media/index.ts` exports `Picture`, `LoopVideo`, `getMedia(phase)`, `preloadNext(phase, index)`. Add `export * from './media'` to `src/engine/index.ts` if chapters should import from the engine barrel.
4. **MediaItem extras** — manifest items carry `avifSrcSet`, `blur`, `label`, `placeholder` beyond the frozen `MediaItem`; typed as `ManifestItem` in `src/engine/media/types.ts`. No contract change needed.
5. **Generated photos** — `public/media/photos/**` (≈7.5 MB, derived from `assets-drop`) is NOT committed by this lane; run `npm run media:images` before deploy (or commit it in LANE-15 if Vercel can't run the script).
6. **Video naming** — clips in `assets-drop/videos` must start with a phase id (`love-cafe.mp4`).
