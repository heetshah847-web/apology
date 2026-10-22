# LANE‑09 — Chapter: Love — "How we became partners"
**Wave 2 · parallel · chapter component inside `NarratedTrack t1` (second chapter of the 45.1s voice)**

## Creative direction
Theme `rose`. Opens with the heart‑glow arriving from Friendship (`enter` 0→1), then a quick title **"Us"** (subtitle from config) for ~1s. Then **6 photos**, each with a lovely overlay line (`overlay` from `meta.json`; else lines from `content/scripts/track-1.md` → `OVERLAY LINES`). At this pace use **one full‑bleed photo at a time** with crossfades; use a diptych only if two portrait photos are next to each other. A thin rose thread draws across the screen with `localProgress`.

The chapter ends the track: on `ended` the engine glides to the map interlude → Distance.

## Scroll UI rules (from `docs/08-SCROLL-UI-SPEC.md`)
- The voice's words appear as `StatementText` (big statements revealed word by word), one statement per scene — not as small subtitles.
- Photos sit in `FrameOutline` with layer labels like `Us / …` and a readout.
- Scenes pin and scrub with `useScene`; scrolling back reverses them exactly.

## Tasks
- [x] `LoveChapter.tsx` using `useChapter('love')`
- [x] Overlay line typography distinct from captions (display serif italic, opposite side to the caption)
- [x] Reduced‑motion variant

## Acceptance
- [x] Overlay lines and captions never overlap at 390px; at most 1 overlay line visible at a time
