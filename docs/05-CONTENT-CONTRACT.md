# 05 — What Heet provides (and exactly where to put it)

Drop raw files in `assets-drop/`. Any format and size is fine; scripts optimise them. Name files with a number prefix to set order: `01-...jpg`, `02-...jpg`.

## Voice‑overs (required) → `assets-drop/voice/` — **3 files**
| File | Chapters it narrates | Target length | Notes |
|---|---|---|---|
| `vo-0-queen.(mp3|m4a|wav)` ✅ | The Queen | 23.0s | Script already written (`content/scripts/track-0-queen.md`) |
| `vo-1.*` ✅ | Friendship → Love | 45.1s | |
| `vo-2.*` ✅ | Distance → Apology | 43.3s | ends leading into the question |
Want a different split (e.g. vo-1 = Friendship only, vo-2 = Love + Distance + Apology)? Just change `tracks` in `content/config/story.config.json` and move the `[[chapter:]]` markers. Nothing else changes.

Recording tips: quiet room, phone 15–20cm from mouth, no music baked in (music is added separately and ducks under the voice). Leave ~0.5s silence at start and end. A tiny natural pause (~0.4s) where one chapter turns into the next makes the hand‑off feel intentional.

## Scripts (required for captions) → `content/scripts/track-*.md`
Paste the exact words of each voice‑over. Put `[[chapter:friendship]]`, `[[chapter:love]]`, `[[chapter:distance]]`, `[[chapter:apology]]` on their own line where each chapter begins. These lines become captions, so spelling of names matters.

## Photos (required) → `assets-drop/photos/<chapter folder>/`
Status: see `docs/MEDIA-STATUS.md`. Pick the strongest; quality beats quantity at this pace. Extra photos are fine — the pipeline uses the first N (by filename order) and lists the rest as unused.
| Folder | Recommended count | What |
|---|---|---|
| `phase-0-queen/` | 9–10 | her best portraits, solo |
| `phase-1-friendship/` | 7 ✅ | early friendship era |
| `phase-2-love/` | 6 ✅ | as a couple |
| `phase-3-distance/` | 3 | calls, screenshots, separate places, missing each other |
| `phase-4-apology/` | 1 (2–3 ideal) | the photos that matter most |
| `heetu-versions/` | 5 | one photo per Heetu version: `11th.jpg`, `1st-sem.jpg`, `march.jpg`, `bestfriend.jpg`, `current.jpg` |
Optional per‑photo extras in `assets-drop/photos/<folder>/meta.json`: `{ "03-beach.jpg": { "overlay": "you, me and the sea", "focal": [0.5, 0.3], "alt": "..." } }`

## Videos (optional) → `assets-drop/videos/`
5–20s clips. They play **muted** inside narrated phases (the voice is the soundtrack). Name with the phase: `phase-1-friendship-02-dance.mp4`.

## Music & sound (optional but recommended) → `assets-drop/music/`, `assets-drop/sfx/`
- `bed.mp3` — soft instrumental for the whole story (ducked under voice)
- `yes.mp3` — the song that plays when she says yes
- `planner.mp3` — light, playful loop for the planner
- SFX: `unfold.mp3` (paper), `pin.mp3`, `chime.mp3`, `pop.mp3` — royalty‑free sources only (e.g. Pixabay audio)

## References → `assets-drop/references/`
- `pinterest-map.jpg` — **save the Pinterest pin image here** (needed for the colour palette and map style).
- Any other screenshots you like.

## Personal details → `content/config/*.json`
- `story.config.json`: names, passcode question + answer.
- `planner.config.json`: Heet's WhatsApp number (with country code, e.g. 9198xxxxxxxx), delivery date range, Heetu version descriptions, optional Web3Forms key.
