# 02 — Design system: "Dreamlit Atlas"

## References (study, never copy code or assets)
The scroll behaviour itself is specified in `docs/08-SCROLL-UI-SPEC.md`.

1. **https://nesilnoble.com/** — Heet loves its framing. What to learn from it:
   - A sound gate up front ("Sound off / Tap for sound") → our map‑unfold tap.
   - "Scroll to step inside" invitation and the feeling of entering a dream.
   - Big, confident statement typography with a lot of breathing room; one idea per screen.
   - Dusky violet mood (its theme colour is `#545388`).
   - LANE‑01 records and measures it (Step 0 → `docs/SCROLL-TEARDOWN.md`); LANE‑02 turns that into tokens and components and writes observations into `docs/REFERENCE-NOTES.md`.
2. **Pinterest pin (colour + map theme)** — https://in.pinterest.com/pin/1131740581402327110/ — Pinterest blocks automated access, so **Heet saves the pin image as `assets-drop/references/pinterest-map.jpg`**. LANE‑02 must open that image, extract a 6‑colour palette (dominant + accents, hex), describe the map style (line work, texture, labels, iconography), and **override** the fallback palette below if it differs. Record the result in `docs/REFERENCE-NOTES.md`.

## Fallback palette (used until the Pinterest palette is extracted)
| Token | Hex | Role |
|---|---|---|
| `--night-ink` | `#1E1A3A` | base background (deep dream night) |
| `--dusk-violet` | `#545388` | surfaces, map sea, gradients |
| `--moon-pearl` | `#EEE8F4` | primary text on dark |
| `--royal-gold` | `#C8A45D` | map ink lines, crowns, Phase 0 accent |
| `--rose-quartz` | `#E7A6B8` | love moments, Yes button |
| `--sea-fog` | `#7FA3B8` | Phase 3 distance (cold) |

**Phase light temperature** (a tint layer over photos + background gradient): Queen = gold glow · Friendship = warm amber · Love = rose · Distance = cold sea‑fog, desaturate photos 25% · Apology = pre‑dawn violet → first light at the Question.

## Typography (LANE‑02 may refine after references)
- **Display:** Bodoni Moda (regal high‑contrast serif) — headlines and the Question, set large; let the type itself be the visual.
- **Body / captions:** Figtree — calm, legible at small sizes on phones. Captions 18–22px mobile, 24–30px desktop, max 32ch per line, 2 lines max.
- **Map labels only:** Pinyon Script — sparingly, territory names on the map.
- Self‑host via `@fontsource/*` (no Google Fonts CDN), `font-display: swap`.
- Avoid: all‑caps eyebrow labels, single‑word colour accents in headlines, `→` on every button.

## Layout ideas
```
MAP (full-bleed)                 NARRATED PHASE (pinned)
+--------------------------+     +--------------------------+
|  ~ Queen's Court (crown) |     |   [ photo, Ken Burns ]   |
|      \..                 |     |                          |
|  Valley of Friendship    |     |                          |
|        ...\              |     |  caption line one        |
|  Garden of Love  ~sea~   |     |  caption line two        |
|  ...  Bridge of Forgive  |     |  ▸ sound  ▸ resume  ▸ ⏭  |
+--------------------------+     +--------------------------+
```
- Map interludes play only **between voice tracks** (before Queen, Friendship, Distance). Inside a track, chapter changes show on a small mini‑map in the corner.
- Map territories: **Queen's Court** (Ph0), **Valley of Friendship** (Ph1), **Garden of Love** (Ph2), **Sea of Distance** (Ph3), **Bridge of Forgiveness** (Ph4), **The Date Bazaar** (Planner).
- Narration appears as **big statement typography** (`StatementText`), one statement per scene, per `docs/08-SCROLL-UI-SPEC.md`. Small lower‑third captions are only the reduced‑motion fallback. Use a soft scrim behind text over photos for WCAG AA contrast.
- Photos and cards sit in design‑tool style `FrameOutline`s with layer labels and readouts.
- Photos: never stretched; use `object-fit: cover` with per‑photo focal point from the manifest.

## Motion principles
- **One memorable moment per section**, not effects everywhere. The map unfold is the signature moment of the whole site.
- Photo transitions: 0.6–0.9s crossfades with slow Ken Burns (scale 1 → 1.08). Phase 3 uses slow drift apart; Phase 4 uses almost no motion.
- Easing: `cubic-bezier(.22,1,.36,1)` for entrances; `linear` for anything scrubbed by audio/scroll.
- `prefers-reduced-motion`: no auto‑scroll, no Ken Burns, crossfades only, tap to advance.

## Voice of UI microcopy
Sentence case, short, playful in Planner ("Choose your Heetu", "Add to the royal cart"). Buttons say exactly what happens. Errors are clear and kind, never vague.
