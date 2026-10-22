# LANE‑11 — Chapter: The Apology + The Question
**Wave 2 · parallel**

## Scroll UI rules (from `docs/08-SCROLL-UI-SPEC.md`)
- The voice's words appear as `StatementText` (big statements revealed word by word), one statement per scene — not as small subtitles.
- Photos sit in `FrameOutline` with layer labels like `Apology / …` and a readout.
- Scenes pin and scrub with `useScene`; scrolling back reverses them exactly.
- The Question is the site's closing statement moment: the headline is the biggest type on the site.

## Part A — Apology chapter (inside `NarratedTrack t2`, second chapter of the 43.3s voice), theme `dawn`
`ApologyChapter.tsx` using `useChapter('apology')`. Quietest moment of the site. **1–3 photos** (currently 1: holding hands), slow fades, no Ken Burns. For the final ~40% of `localProgress`, photos fade out and only the captions remain, larger and centred. When the track ends, the background warms one step (first light) and the screen holds 1.5s of silence before the Question rises.

## Part B — The Question (`src/features/question/`)
Implement exactly per `docs/06-DATE-PLANNER-SPEC.md` → "The Question":
- [ ] Headline "Will you be mine again?" (copy from `planner.config.json` → `question`)
- [ ] Runaway **No** (pointer proximity on desktop, touchstart on mobile), never leaves the safe area, never overlaps Yes, shrinks, cycles `noLabels`, becomes Yes after `noMaxAttempts`
- [ ] Growing **Yes**; confirm sheet "Promise?" → "Yes, I'm yours"
- [ ] On confirm: `storyStore.answeredYes = true`, `music.play('yes')`, heart confetti (rose/gold), headline "Then let's plan a date", smooth scroll to planner
- [ ] Keyboard accessible: No stays reachable by Tab (it moves after focus with a playful label)

## Acceptance
- Playwright: 6 No attempts → No becomes Yes; Yes → planner visible
- Apology works with chapter windows from 8s to 30s
