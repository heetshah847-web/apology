# 01 — Vision & story flow

## Purpose
A private website from Heet to Tanisha. Emotional order: **admire → remember → own the hurt → apologise → ask → celebrate → plan.** It should feel like stepping into a dream‑map of their story, narrated in Heet's chosen voice, with her photos as the light source.

## Experience flow (single page, one long journey)
| # | Section | What she sees | Audio | Approx length |
|---|---|---|---|---|
| G | **Passcode gate** | Dreamy dark screen, one question only she can answer | — | — |
| M | **Map opening** | A folded map; "Tap to unfold" (this tap also unlocks sound, like the reference site's "Tap for sound"). Map unfolds panel by panel, a path draws across 5 territories + the Date Bazaar | ambient music + paper SFX | ~6s |
| 0 | **The Queen** | Her portraits in a regal, slow, luminous sequence; captions of the VO | Track 0 `vo-0-queen` | 23.0s |
| ⇢ | Map interlude | Camera pulls back to the map; path draws to the Valley of Friendship | music bed | ~3s |
| 1 | **Friendship** — "How two souls became friends" | Polaroid‑style memories, playful, warmer light | Track 1 (first chapter) | part of 45.1s |
| 2 | **Love** — "How we became partners" | Photos with lovely overlay lines; rose light | Track 1 (second chapter) | part of 45.1s |
| 3 | **The Distance** — "When destiny tried to be cruel" | Two map pins drifting apart over a sea; colder light | Track 2 (first chapter) | part of 43.3s |
| 4 | **The Apology** — Heet's apology | Quietest section: one photo at a time, then only words | Track 2 (second chapter) | part of 43.3s |
| Q | **The Question** | "Will you be mine again?" — a runaway **No**, a growing **Yes** | music swells on Yes | — |
| P | **Date Planner** ("The Royal Order") | Step‑by‑step cart: activity → cuisine → dessert → choose your Heetu → flowers → her suggestions → review → delivery date | soft music | — |
| C | **Order Confirmed** | Love‑note receipt / royal decree, confetti hearts, sent to Heet | chime | — |

## Voice tracks vs chapters (important)
- **Track 0** `vo-0-queen` (23.0s) → chapter Queen.
- **Track 1** `vo-1` + **Track 2** `vo-2` → 45.1s and 43.3s → chapters Friendship, Love, Distance, Apology. Default split: Track 1 = Friendship → Love, Track 2 = Distance → Apology. The split is pure config (`story.config.json → tracks`), so any mapping works.
- Chapter changes **inside** a track happen while the voice keeps playing: a quick 1.2s inline transition (theme colour shifts, territory name flashes on a mini map corner). The full 3s map interlude only plays **between** tracks, while the voice is silent.
- Each chapter gets roughly 15–30s. One statement per spoken phrase (17 phrases per track).

## Narrated phases behave like this
- When a phase reaches the top of the screen, its voice‑over starts and the page **glides by itself** in sync with the voice (guided mode). Captions show the current line. Photos change on the voice's rhythm.
- If she scrolls or swipes herself, narration pauses and she is in control (free mode). A small "Resume voice" control continues from exactly where she is.
- A persistent sound toggle and a subtle "skip chapter" exist, but are quiet.

## Tone of words on screen
Regal and tender in Phase 0, playful in Friendship, warm in Love, honest and sparse in Distance and Apology, flirty and fun in the Question and Planner. Captions come from Heet's own scripts — never rewrite them. UI microcopy (buttons, steps) may be written by lanes but must follow `docs/02-DESIGN-SYSTEM.md` → Voice.

## Non‑goals
No login, no database, no analytics, no ads, no external image hosts.
