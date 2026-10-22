# Contract change requests
Lanes: do NOT edit `src/contracts/*`. Append requests here (lane · what · why). LANE-15 resolves them.

- **LANE-12 · barrel swap + `/planner` route**: `src/features/index.ts` should export `DatePlanner` from `./planner/DatePlanner` (real component, same name) instead of `DatePlanner.stub`. For the standalone `/planner` route, `src/main.tsx` (or App) should render `<DatePlanner />` alone when `location.pathname === '/planner'`. Planner hands the order to LANE-14 via `usePlannerStore.getState().order` (also sets `storyStore.orderPlaced`). Lane 12 tested through `src/features/planner/harness.tsx` (needs a root html page to mount, not shipped).

## LANE-04 · audio & captions
1. **`CaptionCue.needsReview?: boolean`** — `story.generated.json` already emits it on cues whose text did not come from Heet's script (Whisper transcript or empty). Lets the UI/QA flag them. Harmless if ignored.
2. **`package.json` scripts (LANE-01 owns the file)** — wired locally, please keep when merging:
   `media:audio` → `bash scripts/prepare-audio.sh`; `media:captions` → `python scripts/make-captions.py && node scripts/align-script.mjs`; `media:story` → `node scripts/build-story.mjs`; new `test:audio` → `node --experimental-strip-types src/engine/audio/captions.test.ts && node scripts/align-script.test.mjs`.
3. **LANE-15 barrel swap** — in `src/engine/index.ts` change `./audio/AudioDirector.stub` to `./audio/AudioDirector`. `AudioDirector.ts` still reads track data through `../storyData.stub` (typed view of `story.generated.json`).
4. **Unmatched `at` in `meta.json`** — `at` values must be seconds in the *track*, not the chapter (build-story passes them through unchanged).

## LANE-05 · scroll engine
- **Barrel swap (LANE-15):** in `src/engine/index.ts` point `SmoothScroll`, `NarratedTrack`, `useChapter` at `./scroll/SmoothScroll`, `./scroll/NarratedTrack`, `./scroll/useChapter`. Also export `useScene`, `StepInside`, `useSmoothScroll`, `useTrack` from `./scroll/*` for chapter/planner lanes.
- **Demo route (LANE-15):** the demo lives at `src/engine/scroll/demo/engine-demo.html` (dev: `/src/engine/scroll/demo/engine-demo.html?debug=1`). Mount `EngineDemo` at `/engine-demo` if wanted in the app.
- **Test runner (LANE-01/15):** no test runner is installed. `timing.test.ts` runs with `node --experimental-strip-types src/engine/scroll/timing.test.ts`; wire into `npm test` or move to Vitest.
- **Design system (LANE-02):** `ResumeVoice`, `SkipControl`, mini-map and cue stepper are minimal local versions in `src/engine/scroll/TrackUI.tsx`; swap for design-system components when they exist.
- **Hand-off glide:** uses `SCROLL_TO_DURATION` (1.6s, measured) rather than the 1.2s in 04-TIMING-MATH §2; the measured value wins per CLAUDE.md rule 10.
