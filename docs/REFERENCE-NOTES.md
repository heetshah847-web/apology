# Reference notes (LANE-02)

Study only; nothing copied. Sources: `docs/SCROLL-TEARDOWN.md` and frames in `assets-drop/references/nesil/frames/`.

> **Pinterest palette: NOT extracted.** `assets-drop/references/pinterest-map.jpg` is missing. Save the pin image there and re-run LANE-02's palette step; until then the fallback palette from `docs/02-DESIGN-SYSTEM.md` is used.

## 10 observations from nesilnoble.com
1. The whole experience is a **rounded window on a black bezel** (≈12px inset, ≈26px radius). Our `.stage` class reproduces it.
2. **Background colour changes per act** (violet → indigo → green). Our equivalent: five phase themes via `data-theme` on the stage.
3. A **grain overlay and sparse star dust** sit over every colour, which makes flat colour feel printed. Ours: `.tex-grain` and `.tex-stars`, inline SVG.
4. Typography mixes **huge condensed display, light high-contrast serif sentences and a tiny UI sans**. We use Bodoni Moda for statements, Figtree for UI, Pinyon Script for map labels only.
5. **Design-tool framing**: a blue selection box with square corner handles and a name tag (cursor "Nesil"). Ours: `FrameOutline` (gold-tinted outline, handles, layer label, readout).
6. A **ruler along the bottom** with section tick labels (Hello · Systems · Beliefs …) doubles as progress. Candidate for a later lane: a map-coordinate ruler.
7. The **sound prompt is a small speech bubble** under the header toggle ("Click for sound"). Ours: `SoundToggle` with equaliser bars.
8. Chrome is constant and tiny: name, a status pill, nav right. Ours: `TopBar` (hides on scroll down, returns on scroll up).
9. A **"Scroll to step inside"** hint is the only instruction on screen. Ours: `ScrollHint`, gone after the first scroll.
10. Statement lines alternate **sentence-case serif** (setup) and **huge shouted words** (punchline). `StatementText` supports `size` so chapters can pair both.

## Palette (fallback, final until Pinterest arrives)
| Token | Hex | Why |
|---|---|---|
| night-ink | #1e1a3a | deep dream night; bezel is darker (#08060f) |
| dusk-violet | #545388 | the reference's theme colour; surfaces and sea |
| moon-pearl | #eee8f4 | text, 14:1 on night-ink |
| royal-gold | #c8a45d | map ink, crowns, Queen accent |
| rose-quartz | #e7a6b8 | love, the Yes button |
| sea-fog | #7fa3b8 | distance; photos desaturated 25% |

Phase stages: gold `#251d3f`, amber `#2f2038`, rose `#3a1d3b`, fog `#1b2740`, dawn `#2a2552`; each has a `--glow` and `--accent`.

## Two-pass design review
- **Pass 1** planned tokens, 5 themes, 8 scroll components.
- **Review against the brief** found: all-caps labels (banned by the design doc), a risk of low contrast for accent text on rose, and photos needing a scrim.
- **Revision:** sentence-case labels only; accent colours lightened per theme; `Caption` and `.scrim-bottom` give a 0.62 scrim; text is always pearl on a dark stage (AA).

## Reduced motion
`StatementText` renders all words visible; `PhotoFrame` skips Ken Burns; global CSS shortens all transitions and animations.

## Showcase
Dev-only page at `/design.html` (not in the production build). Screenshots in `docs/shots/lane-02/`.
