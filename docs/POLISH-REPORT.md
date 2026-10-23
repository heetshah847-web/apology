# POLISH-REPORT (2026-10-24)

Branch `polish/integration` (local, nothing pushed, nothing deployed). Author: Heet only.
Before shots: `docs/polish-before/*` (integrated, unpolished). After shots: `docs/polish-after/{1440x900,1366x768}`.
Checks: `npm run typecheck` clean, `npm run build` passes. Main bundle 237.6 kB gzip; rough.js is a separate lazy chunk of 8 kB gzip.

## Before and after
| Audit item | Before | After |
|---|---|---|
| Site integration | Barrels exported stubs ("· STUB", "MAP INTERLUDE → …") | Real Queen, Friendship, Distance, Apology, Question, planner and order modules wired in |
| C1 Love chapter | Stub with cropped, zoomed faces | New `LoveChapter`: framed, never-cropped photos at their own ratio, word-by-word statements, overlay lines, rose light, drawing rose thread |
| H1 top strip vs Sound toggle | Clipped under the button | Strip sits left of the toggle (no overlap at either size) |
| H2 Distance photo | About 80×170 px, touching the statement | About 40% larger, clear of the statement at 1440 and 1366 (label gap is tight at 1366×768) |
| H4 dead screens | A full blank screen as each track scrolled in | First chapter of each track visible from t=0, so every screen has content |
| M3 Question buttons | Yes ≈ 94×62 px | Larger on desktop (Yes about 13rem wide) |
| M5 console error | React "does not recognize … prop" | Fixed (`fetchpriority` in `Picture.tsx`) |
| Reduced motion | Queen portrait frame empty | Photo shows; statements and Previous/Next stepper work |
| Decoration | None | rough.js hand-inked coastline on full-bleed maps, paper grain on the map, gold breathing glow behind the Queen, canvas starfield plus heart confetti on "Yes" |

## Verified
- 1440×900 and 1366×768: every scroll section captured and reviewed by eye, plus planner steps 1–8 at 1440.
- No horizontal overflow; load-time layout shift 0.023.
- Runaway No: moves away from the mouse and becomes a second Yes after the configured attempts.
- Focus ring: 2 px gold. Reduced motion: reviewed at 1440.
- Receipt, closing screen and planner reviewed (receipt via lane 14's harness).

## Flag for your own laptop (cannot be proven headless)
1. **Smoothness at 1440×900.** My headless runs measured 44–60 fps there, with the same swing before my changes. 1366×768 held 54–60. Please scroll the hero map and the first interlude.
2. **Layout-shift score over a full scroll reads 7–12.** The shifting elements are the pinned sections switching to fixed, which looks visually continuous. I saw no jumps, but I could not prove it. Watch the pin starts.
3. **Voice sync.** Captions follow the cues, but I could not listen. Check a few lines against the audio, in guided and free modes.
4. **Distance statement** sits very close to the photo label at 1366×768.
5. **Empty stretch** at the end of the Love chapter (rose backdrop, about one screen) before the next map interlude.
6. **Contrast.** Reveal-ahead words are intentionally faint (12% opacity); check they read well in a bright room.
7. **Yes celebration** (starfield plus hearts) was not captured visually.
8. **Map unfold** was not changed beyond grain and sketch; it still starts at about half-width on the hero.

## Needs your input (not mine to change)
- **Passcode gate is disabled**: `content/config/story.config.json` still has the placeholder question and hash. Run `node scripts/hash-answer.mjs "answer"`.
- **Placeholder text in planner data**: "March Heetu" card still says "EDIT: what made March Heetu special" and "EDIT" ×3 (`src/data/planner.json`).
- **`pinterest-map.jpg`** still missing, so the palette is the fallback.
- **Order screen** only verified through the lane harness, not the full app flow.
- **Unrelated uncommitted edit**: someone else added a 1.5 s hold before the last glide in `src/engine/scroll/NarratedTrack.tsx`. I left it uncommitted and untouched. The voice `.mp3` files also show as modified (not by me).

## Files I touched
Created: `src/features/phases/love/LoveChapter.tsx`, `src/features/map/RoughCoast.tsx`, `src/features/question/starfield.ts`, `docs/SKILLS-STATUS.md`, `docs/POLISH-AUDIT.md`, `docs/POLISH-REPORT.md`, screenshot folders.
Edited: `CLAUDE.md` (laptop-first), `.gitignore` (+ `.env*`), `package.json`/`package-lock.json` (+ `roughjs`), `src/features/index.ts` and `src/engine/index.ts` (stubs → real), `src/engine/scroll/NarratedTrack.tsx` (strip position only), `src/engine/media/Picture.tsx`, `src/features/map/AtlasMap.tsx`, `src/features/phases/{queen/QueenChapter,friendship/FriendshipChapter,distance/DistanceChapter}.tsx`, `src/features/question/{TheQuestion.tsx,celebrate.ts}`, `src/design/textures.css`.
Merged from lane branches: queen, friendship, distance, order, venues data (`src/data/venues.json`, `venue-map.json`).
Swept into my commits (lane 03 files that were untracked): `src/engine/media/*`, `src/data/media.manifest.json`, plus comment-only text fixes in `src/engine/scroll/timing.ts`.
Not touched: `content/`, voice files, timing logic.

## Skills
Installed per plan (gsap-web, motion-design, map-animation, roughjs), but I did not invoke the new skills in this session (they load after a Claude Code restart). The work followed the existing code, design tokens and `docs/08-SCROLL-UI-SPEC.md`.
