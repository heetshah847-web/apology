# LANE‑10 — Chapter: The Distance — "When destiny tried to be cruel"
**Wave 2 · parallel · chapter component inside `NarratedTrack t2` (first chapter of the 43.3s voice)**

## Creative direction
Theme `fog`, photos desaturated 25%, more negative space. Background: the **Sea of Distance** with `MapPins` (from LANE‑06; local fallback if not merged): two pins start together and drift apart with `localProgress`; the dotted line between them stretches and thins but **never breaks**. **3 photos**, alternating her side / his side, smaller and further apart each time.

**Hand‑off to Apology (same voice):** during `exit`, the stretched line pulses once like a heartbeat and the fog lifts one step toward pre‑dawn violet.

## Scroll UI rules (from `docs/08-SCROLL-UI-SPEC.md`)
- The voice's words appear as `StatementText` (big statements revealed word by word), one statement per scene — not as small subtitles.
- Photos sit in `FrameOutline` with layer labels like `Her side / His side` and a readout.
- Scenes pin and scrub with `useScene`; scrolling back reverses them exactly.

## Tasks
- [x] `DistanceChapter.tsx` using `useChapter('distance')`; split layout (stacked on mobile)
- [x] Optional "x km apart" from config `distanceKm`, fades in at 50%
- [x] Reduced‑motion variant

## Acceptance
- Mood clearly colder than Love; the pulse lands inside the hand‑off window
