# 04 — Timing math: syncing scroll, photos and captions to the voice‑over

**Principle: the voice‑over is the master clock.** Durations are measured from the actual audio files with ffprobe by `scripts/build-story.mjs`. Nothing is hard‑coded; if Heet replaces a voice file, run `npm run media` and everything re‑fits.

## 0. Tracks and chapters (read first)
| Track | File | Length | Chapters (default) |
|---|---|---|---|
| t0 | `vo-0-queen` | 22.99s | queen |
| t1 | `vo-1` | 45.09s | friendship → love |
| t2 | `vo-2` | 43.31s | distance → apology |
Durations measured from Heet's ElevenLabs files. Spoken phrases (from pauses) are listed in `content/captions/*.phrases.txt` / `queen.timing.txt`: **each spoken phrase = one statement scene**. One pinned `NarratedTrack` per track; the math below applies **per track** (D = track duration). Chapters are time ranges inside it.

**Chapter boundaries** come from `[[chapter:<id>]]` markers in `content/scripts/track-*.md`. LANE‑04 maps the first word after each marker to its Whisper timestamp:
```
chapter.start = time of first word after its marker   (first chapter: 0)
chapter.end   = next chapter.start                    (last chapter: D)
```
Fallback without markers or Whisper: split by `weight` in config (default equal), e.g. t1 D=45.09s → friendship 0–22.5s, love 22.5–45.09s. Better fallback: snap the split to the nearest long pause (t1 candidates 16.5–17.3s or 26.3–27.1s; t2 candidates 14.3–15.2s or 29.4–30.1s).

**Local values for chapter components** (`useChapter`):
```
localTime     = clamp(t − start, 0, end − start)
localProgress = localTime / (end − start)
isActive      = start ≤ t < end
enter = clamp((t − start) / 0.6, 0, 1)      exit = clamp((t − (end − 0.6)) / 0.6, 0, 1)
```
The 1.2s inline hand‑off = 0.6s exit of chapter A overlapping 0.6s enter of chapter B (crossfade + theme colour tween). The voice never pauses for it. The 3s **map interlude** happens only between tracks.

## Symbols
- `D` = measured VO duration of the phase (s)
- `N` = number of media items in the phase
- `S` = `SCROLL_VH_PER_SEC` (constant in `src/engine/scroll/timing.ts`, default **12**)
- `L` = scroll length of the pinned phase section
- `t` = current narration time (s), `p` = progress `t / D` (0..1)

## 1. Section length
`L = D × S` (in vh), D = track duration. Real values: t0 Queen 22.99s → **276vh**; t1 45.09s → **541vh**; t2 43.31s → **520vh**. The section is pinned (GSAP ScrollTrigger `pin: true, end: '+=' + L + 'vh'`). S is tuned so that manual scrolling at a relaxed phone‑swipe pace takes roughly as long as the voice.

## 2. Guided mode (audio drives scroll)
On each animation frame while the VO plays:
```
p = audio.currentTime / D
targetY = sectionStartY + p × Lpx
lenis.scrollTo(targetY, { immediate: true })   // or lerp 0.15 for softness
progressMotionValue.set(p); timeMotionValue.set(t)
```
Start guided mode when the section top reaches the viewport top (ScrollTrigger `onEnter`) **and** sound is unlocked. On `ended` → mode `done`, music bed un‑ducks, auto‑glide (1.2s) to the next map interlude (after t0 and t1) or to the Question (after t2).

## 3. Free mode (she scrolls herself)
Detect user input during guided mode (`wheel`, `touchstart`, `keydown`, Lenis `virtual-scroll` with a user flag). Then: pause VO, mode `free`, and derive time from scroll:
```
p = clamp((scrollY − sectionStartY) / Lpx, 0, 1);  t = p × D
```
Captions and photos still follow `t` (silently). "Resume voice" → `audio.seek(t); audio.play(); mode = 'guided'`. Scrolling past the end marks the phase `done`.

## 4. Photo schedule
Schedules are computed **per chapter** using the chapter's own window (replace D with `end − start` and t with `localTime`). If items have explicit `at` (track seconds) use them. Otherwise distribute evenly:
```
slot = D / N
show_i = i × slot,  hide_i = (i + 1) × slot
crossfade = min(0.8, slot × 0.25)
kenBurns: scale 1 → 1.08 across [show_i, hide_i]
activeMediaIndex = floor(t / slot)
```
**Recommended photo count:** `N ≈ round(chapterSeconds / 2.8)` → Queen 23s ≈ 8 (have 8 ✅, anchored to phrases); t1 45s ≈ 16 (have 13; fine since two are multi-photo collages); t2 43s ≈ 15 (have 7 → the Distance chapter leans on the map, pins and statements, so ~10 is enough). Fewer, bigger moments beat many rushed ones. Under 2.0s per photo feels rushed; over 5s feels static (add Ken Burns or a pair layout).

Optional caption‑anchored photos: in a script, write `[[photo:filename]]` before a line; LANE‑04 converts the line's start time into that photo's `at`.

## 5. Captions
Active cue = cue where `start ≤ t < end`. If word timings exist, highlight words as spoken (opacity 0.45 → 1). Caption text always comes from Heet's script (`content/scripts/*.md`), timings from Whisper. Alignment (LANE‑04 `align-script.mjs`): normalise both texts (lowercase, strip punctuation), walk the Whisper word list greedily to map each script word to a timestamp; split cues at sentence ends or every ≤ 12 words / ≤ 4.5s.

Fallback without Whisper: `content/captions/<phase>.timing.txt` lines like `00:03.2 | The moon envied her glow,`.

## 6. Map interludes
Fixed 3s each (not narrated): path draw `strokeDashoffset` 1 → 0, camera transform from territory A to B. Music bed plays at full volume, ducked to 20% during VO.

## 7. Edge cases
- **Autoplay:** iOS needs a gesture. The map "Tap to unfold" calls `audio.unlock()` (plays & pauses a silent buffer on every `<audio>` element). If sound is off, guided mode still runs on a silent clock (`performance.now()`) at 1×, so the story still flows.
- **Tab hidden:** pause VO and guided scroll on `visibilitychange`.
- **Reduced motion:** no guided scroll; a "Next" button advances cue by cue; VO can still play.
- **Resize/orientation:** recompute `Lpx` with `ScrollTrigger.refresh()`.
- **Drift check:** E2E test asserts `|scrollProgress − audioProgress| < 0.02` during guided playback.
