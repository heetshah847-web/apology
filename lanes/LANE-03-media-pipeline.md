# LANE‑03 — Media pipeline (photos & videos)
**Wave 1 · parallel**

## Goal
Turn whatever Heet drops in `assets-drop/` into fast, responsive, correctly-ordered media + a manifest.

## Tasks
- [x] `scripts/optimize-images.mjs` (sharp): auto-rotate (EXIF), strip metadata (privacy: removes GPS), resize to 800/1200/1600/2400w, output AVIF + WebP, 1 tiny blur placeholder (base64, 16px). Keep order by filename prefix. Skip unchanged files (hash cache).
- [x] Read optional `meta.json` per folder (overlay, focal, alt). If no alt, generate a neutral one ("Tanisha, photo 3 of the Queen chapter").
- [x] Auto focal point: if `focal` missing, use sharp's `attention` strategy to estimate it.
- [ ] `scripts/optimize-videos.sh` (ffmpeg): H.264 MP4 `-crf 26 -preset slow -movflags +faststart`, max 1080p, strip audio (`-an`), plus a poster JPG/WebP at 1s. Target ≤ 8 MB each; warn if larger.
- [x] `scripts/build-manifest.mjs` → `src/data/media.manifest.json`: per phase array of `MediaItem` (contracts), including `heetu-versions`
- [x] `src/engine/media/` helpers: `<Picture>` (AVIF/WebP srcset, sizes, blur-up), `<LoopVideo>` (muted, playsInline, lazy, pauses off-screen), `preloadNext(phaseId, index)`
- [x] Wire into `npm run media:images` / `media:videos`
- [x] Report: counts per phase vs recommended counts from `docs/04-TIMING-MATH.md` (warn if N is far from D/2.8)

## Acceptance
- Running twice is idempotent and fast; placeholders and real photos both work
- Lighthouse: no image larger than needed at 390px viewport
