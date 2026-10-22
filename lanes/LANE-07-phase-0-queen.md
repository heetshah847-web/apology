# LANE‑07 — Phase 0: The Queen (vo-0-queen, 22.99s, 7 measured phrases)
**Wave 2 · parallel · a chapter component inside `NarratedTrack t0` (uses `useChapter('queen')`; stub until LANE‑05 lands)**

## Goal
A regal, luminous admiration of Queen Tanisha, synced to `vo-0-queen`. Theme `gold`.

## Creative direction
- Opening frame: a crown line-drawing traces itself, then dissolves into her first portrait.
- Portraits are large, slow (Ken Burns 1 → 1.06), with a soft gold bloom and floating light motes (very subtle).
- Script moments to visualise (keyed to caption cues, not hard-coded times): "the moon envied her glow" → a faint moon arc glows behind the photo; "the roses surrendered their fragrance" → a few rose petals drift once; "time itself paused" → motion freezes for ~0.8s (everything still, caption only); "even gods learned to bow" → final portrait, title card **"Queen Tanisha"** in Bodoni Moda, huge.
- Detect those moments by matching keywords in `activeCue.text` (`moon`, `rose`, `time`, `bow`) — robust if the script changes slightly.

## Scroll UI rules (from `docs/08-SCROLL-UI-SPEC.md`)
- The voice's words appear as `StatementText` (big statements revealed word by word), one statement per scene — not as small subtitles.
- Photos sit in `FrameOutline` with layer labels like `Queen / Portrait` and a readout.
- Scenes pin and scrub with `useScene`; scrolling back reverses them exactly.

## Tasks
- [ ] `QueenChapter.tsx` using `useChapter('queen')` (Queen is the only chapter of track t0, so localProgress = track progress)
- [ ] Media layout: single full-bleed portrait (mobile) / portrait + soft mirrored blur fill (desktop)
- [ ] Caption component from design system, lower third
- [ ] Reduced-motion variant

## Acceptance
- With placeholders and real assets, photo changes land on the VO rhythm; title card appears at the final cue
- Screenshots at 3 progress points (0.1, 0.5, 0.95) for 390 and 1440 widths
