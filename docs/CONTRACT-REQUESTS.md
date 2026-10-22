# Contract change requests
Lanes: do NOT edit `src/contracts/*`. Append requests here (lane · what · why). LANE-15 resolves them.

## LANE-05 · scroll engine
- **Barrel swap (LANE-15):** in `src/engine/index.ts` point `SmoothScroll`, `NarratedTrack`, `useChapter` at `./scroll/SmoothScroll`, `./scroll/NarratedTrack`, `./scroll/useChapter`. Also export `useScene`, `StepInside`, `useSmoothScroll`, `useTrack` from `./scroll/*` for chapter/planner lanes.
- **Demo route (LANE-15):** the demo lives at `src/engine/scroll/demo/engine-demo.html` (dev: `/src/engine/scroll/demo/engine-demo.html?debug=1`). Mount `EngineDemo` at `/engine-demo` if wanted in the app.
- **Test runner (LANE-01/15):** no test runner is installed. `timing.test.ts` runs with `node --experimental-strip-types src/engine/scroll/timing.test.ts`; wire into `npm test` or move to Vitest.
- **Design system (LANE-02):** `ResumeVoice`, `SkipControl`, mini-map and cue stepper are minimal local versions in `src/engine/scroll/TrackUI.tsx`; swap for design-system components when they exist.
- **Hand-off glide:** uses `SCROLL_TO_DURATION` (1.6s, measured) rather than the 1.2s in 04-TIMING-MATH §2; the measured value wins per CLAUDE.md rule 10.
