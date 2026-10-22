# LANE‑02 — Design system & reference study
**Wave 1 · parallel · depends on: LANE‑01 contracts only**

## Goal
A distinctive "Dreamlit Atlas" token system + base UI components, grounded in the two references.

## Read
`docs/02-DESIGN-SYSTEM.md`, frontend-design skill.

## Tasks
- [ ] Study the recordings and frames LANE‑01 captured in `assets-drop/references/nesil/` and `docs/SCROLL-TEARDOWN.md` (framing, sound gate, scroll invitation, type scale). **Do not copy code, text or assets.**
- [ ] Open `assets-drop/references/pinterest-map.jpg`. If missing, stop that sub-task and tell Heet: "Save the Pinterest pin image as assets-drop/references/pinterest-map.jpg". If present: extract 6 hex colours, describe the map style, update tokens.
- [ ] Write `docs/REFERENCE-NOTES.md` (10 observations + final palette + why)
- [ ] Run the frontend-design two-pass process: token plan → review against brief → revise
- [ ] `src/design/tokens.css` (CSS variables: colours, phase themes `[data-theme=gold|amber|rose|fog|dawn]`, type scale, spacing, radii, shadows, easing, durations) and Tailwind theme mapping
- [ ] Self-hosted fonts via `@fontsource` (Bodoni Moda, Figtree, Pinyon Script — or revised choices)
- [ ] Textures: subtle paper grain + star dust as tiny inline SVG/noise (no heavy PNGs)
- [ ] Scroll-UI components required by `docs/08-SCROLL-UI-SPEC.md` (match the reference's framing, measured in `docs/SCROLL-TEARDOWN.md`):
  - `StatementText` — very large statement typography that reveals word by word or line by line from a 0..1 value (scroll or voice). This is the main caption display.
  - `FrameOutline` — thin outline around a photo/card with corner handles, a layer label (`Queen / Portrait 03`) and a live readout slot (coordinates, days together, km apart)
  - `TopBar` — names left, chapter links centre, "Sound off / Tap for sound" right; hides on scroll down, shows on scroll up
  - `ScrollHint` — "Scroll to step inside", disappears after the first scroll
  - `PlateCard` — licence-plate style card (used on the receipt)
- [ ] Components in `src/design/ui/`: `Button` (primary/ghost/royal), `Caption` (small lower-third version, used only as the reduced-motion/accessibility fallback for `StatementText`), `PhotoFrame` (cover + focal, Ken Burns prop), `Polaroid`, `Chip`, `Sheet` (bottom sheet), `Toast`, `SoundToggle` (UI only, calls store), `SkipControl`, `ResumeVoice`
- [ ] `/design` dev-only route (or Storybook-lite page) showing every token & component on dark backgrounds, mobile and desktop

## Acceptance
- Screenshots at 390 & 1440 of `/design` saved to `docs/shots/lane-02/`
- AA contrast for captions over photos (with scrim)
- Reduced-motion variants exist for animated components

## Kickoff prompt
> Read CLAUDE.md, docs/02-DESIGN-SYSTEM.md and lanes/LANE-02-design-system.md. Use the frontend-design skill. Stay inside the files this lane owns.
