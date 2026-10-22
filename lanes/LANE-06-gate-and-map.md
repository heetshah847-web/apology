# LANE‑06 — Passcode gate, map opening & atlas interludes (signature moment)
**Wave 1 · parallel**

## Goal
The first 10 seconds decide everything. A soft passcode, then a folded map she taps to unfold (unlocking sound), revealing "The Atlas of Us".

## Read
`docs/02-DESIGN-SYSTEM.md` (map territories, Pinterest reference), map-animation skill if installed.

## Hero (reference: the "Inside the mind of…" opening of nesilnoble.com)
Before the folded map: "Inside the story of / Heet & Tanisha", "You've been living in Queen Tanisha's Kingdom", a coordinates readout in a `FrameOutline`, `TopBar` with "Tap for sound", and `ScrollHint` "Scroll to step inside". Copy lives in `story.config.json → hero`. After the unfold, the camera uses `StepInside` to go *into* the Queen's Court.

## Tasks
- [ ] `PasscodeGate`: one question from `story.config.json` (`passcode.question`), compare SHA-256 of normalised answer to `passcode.answerSha256`; 3 playful hints; remember success in sessionStorage. (It is a soft gate — say so in a code comment.)
- [ ] `MapOpening`: folded map (4–6 panels) centered on night background with drifting star dust; label "Tap to unfold — sound on". On tap: `audio.unlock()`, `sfx('unfold')`, panels unfold in 3D (`rotateX/rotateY` with perspective, staggered, ~2.5s), then the path draws through territories, then "Scroll to step inside" cue
- [ ] `AtlasMap` as **SVG** (editable, crisp): coastline/terrain shapes, territory labels (script font), crown icon at Queen's Court, dotted path, compass rose, sea texture; styled from the Pinterest palette
- [ ] `AtlasInterlude to={phaseId}`: 3s section, used **only between tracks** (before Queen, before Friendship, before Distance) — camera transform (scale/translate on the SVG group) from previous territory to next, path segment draws, pin drops (`sfx('pin')`), territory name fades in
- [ ] `MiniMap` corner component (export) that LANE‑05 shows during in‑track chapter changes: current territory glows, path segment ticks forward
- [ ] Phase 3 hook: export `MapPins` component the Distance lane can reuse (two pins with a stretchable dotted line) — put it in `src/features/map/MapPins.tsx`
- [ ] Mobile: map fits portrait (separate viewBox for portrait vs landscape)

## Acceptance
- Unfold is smooth at 60fps on mid-range Android (check with CPU throttling 4×)
- Sound actually plays after the unfold tap on iOS Safari
