# LANE‑08 — Chapter: Friendship — "How two souls became friends"
**Wave 2 · parallel · chapter component inside `NarratedTrack t1` (first chapter of the 45.1s voice)**

## Read
`docs/04-TIMING-MATH.md` §0 (tracks & chapters). Use `useChapter('friendship')` → `ChapterApi`. Never read the track's audio directly.

## Creative direction (short chapter: one idea, done well)
Theme `amber`. Playful and warm. **7 photos** (incl. the uni seoul photobooth strip, shown whole) dropped on the map paper of the Valley of Friendship, slightly rotated (−6°…6°), each landing with a gentle spring as its slot begins; earlier ones slide into a small stack. Two glowing dots (two souls) travel along a doodled line driven by `localProgress` and meet at 100%.

**Hand‑off to Love (same voice, no pause):** during `exit` (last 0.6s) the two dots merge into a single heart‑shaped glow that becomes the first light of the Love chapter. Coordinate only through the shared `exit`/`enter` values — LANE‑09 renders the Love side.

## Scroll UI rules (from `docs/08-SCROLL-UI-SPEC.md`)
- The voice's words appear as `StatementText` (big statements revealed word by word), one statement per scene — not as small subtitles.
- Photos sit in `FrameOutline` with layer labels like `Memory / …` and a readout.
- Scenes pin and scrub with `useScene`; scrolling back reverses them exactly.

## Tasks
- [ ] `FriendshipChapter.tsx` using `useChapter('friendship')`; render nothing when `!isActive && exit === 1`
- [ ] Polaroid stack (last 3 visible on mobile, 5 desktop); optional handwritten date from `overlay`
- [ ] Two‑souls line (SVG path, `localProgress`)
- [ ] Muted looping video allowed as one polaroid
- [ ] Reduced‑motion variant

## Acceptance
- Works with chapter windows from 8s to 25s (test both) without feeling rushed or empty
- Videos never play with sound; drift check passes
