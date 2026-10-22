# LANE‑05 — Scroll‑story engine (Lenis + GSAP + Motion)
**Wave 1 · parallel**

## Goal
Implement `SmoothScroll`, `NarratedTrack` and `useChapter(phaseId)` exactly per `docs/04-TIMING-MATH.md` (§0 tracks & chapters, guided / free / done modes). One pinned section per voice track; chapter components inside it are mounted together and shown by time range.

## Feel requirement
Follow `docs/08-SCROLL-UI-SPEC.md` and the numbers in `docs/SCROLL-TEARDOWN.md` / `src/contracts/scroll-feel.ts`. Lenis settings come from there, not from defaults. Scenes inside a track are pinned and scrubbed; scrolling back replays them in reverse. The guided voice glide must use the same easing as her own scrolling, so it never feels like autoplay.

## Tasks
- [x] `useScene({ lengthVh })` helper: pins a scene and returns a 0..1 scrub value (for statements, frames, interactions); used by chapter lanes and the planner
- [x] `StepInside` transition: scales/zooms the current view into a target element (map territory, a frame) across a scroll range, then hands off to the next section
- [x] `SmoothScroll.tsx`: Lenis instance in context, synced with GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t*1000))`; `gsap.ticker.lagSmoothing(0)`); expose `scrollTo`, `stop`, `start`
- [x] `timing.ts`: `SCROLL_VH_PER_SEC`, `sectionLength(D)`, `mediaSchedule(D, items)`, `progressFromScroll`, `scrollFromProgress` (pure, unit-tested)
- [x] `NarratedTrack.tsx` (implements `NarratedTrackProps`): pinned via ScrollTrigger (`useGSAP` for cleanup) for the whole track; provides a context consumed by `useChapter(phaseId)` → `ChapterApi`; tweens `data-theme` colours between chapters during the 1.2s hand‑off; small mini‑map corner shows the current territory; starts guided mode on enter (if unlocked), detects user input → free mode, renders `ResumeVoice` + `SkipControl` UI from design system, exposes `progress`/`time` MotionValues, `activeCue`, `activeMediaIndex`
- [x] On `ended` → glide to next section; skip control → seek to end
- [x] Reduced motion path: no pin-scrub; Next/Prev cue buttons
- [x] Debug overlay (`?debug=1`): t, p, scroll p, drift, mode
- [x] Demo page `/engine-demo`: the real vo-1 track with two dummy chapters, showing the hand‑off

## Acceptance
- [x] Drift `< 0.02` during guided playback in `?debug=1` (measured ~0.0001 at 390x844 and 1440x900)
- Free mode ↔ guided mode switching is smooth on iOS Safari and Android Chrome (test with Playwright mobile emulation + note to test on real phone). Verified in Chromium emulation only; real iOS/Android still to test
