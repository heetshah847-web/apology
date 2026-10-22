# LANE‑04 — Audio engine, captions & story build
**Wave 1 · parallel**

## Goal
Implement the real `AudioDirector` and the scripts that measure voice-overs and produce timed captions from Heet's scripts.

## Read
`docs/04-TIMING-MATH.md` (all), contracts `AudioDirector`, `CaptionCue`.

## Tasks
- [ ] Read `tracks` from `story.config.json` (3 tracks: t0 queen, t1, t2) — a track narrates one or more chapters
- [ ] `scripts/prepare-audio.sh`: for each `assets-drop/voice/vo-*.*` → loudness normalise (`loudnorm=I=-16:TP=-1.5:LRA=11`), mono, 44.1k, MP3 128k → `public/media/voice/`. Music/SFX → `public/media/music|sfx/` (music at -20 LUFS).
- [ ] Measure durations with `ffprobe` (to 0.01s)
- [ ] `scripts/make-captions.py`: run Whisper (`--word_timestamps True`, model `small`, language `en`; if the VO is Hindi/Gujarati/Hinglish set accordingly and ask Heet) → `content/captions/<phase>.words.json`
- [ ] `scripts/align-script.mjs`: align script text (`content/scripts/track-*.md`, between the `---SCRIPT---` markers); turn `[[chapter:<id>]]` markers into chapter `start/end` per `docs/04-TIMING-MATH.md` §0 (fallback: config `weight` split); assign each cue to the chapter it starts in to Whisper words → `CaptionCue[]` with words, split rules from timing doc; support `[[photo:filename]]` anchors → media `at`
- [ ] Real files already exist (see `docs/MEDIA-STATUS.md`). `content/captions/queen.timing.txt` is a measured, verified phrase timing — use it as ground truth for t0 and only refine word timings with Whisper.
- [ ] `content/captions/vo-1.phrases.txt` / `vo-2.phrases.txt` hold measured phrase times; snap Whisper cue boundaries to them (each phrase = one StatementText scene)
- [ ] If a track's script is still the placeholder text, use the Whisper transcript as caption text, mark cues `needsReview: true`, split chapters at the longest pause, and tell Heet
- [ ] Fallback: parse `content/captions/<phase>.timing.txt` if Whisper unavailable
- [ ] `scripts/build-story.mjs`: merge `story.config.json` + media manifest + captions + durations → `src/data/story.generated.json` (validate against contracts with a small runtime check)
- [ ] `src/engine/audio/AudioDirector.ts`: one `HTMLAudioElement` per **track** (3 total) (preload `metadata`, next phase `auto`), `unlock()` inside gesture, music bed with ducking (bed 100% → 20% over 400ms when VO plays), SFX pool, `on('time')` at rAF rate, silent-clock fallback when muted/blocked, pause on `visibilitychange`
- [ ] `src/engine/audio/captions.ts`: `getActiveCue(cues, t)`, `getWordProgress(cue, t)` (binary search)
- [ ] Unit tests for alignment & active cue lookup

## Acceptance
- `npm run media:audio && npm run media:captions && npm run media:story` produces a valid story file from placeholders and from real files
- Captions never drift more than 150ms from speech in a manual check of Phase 0
