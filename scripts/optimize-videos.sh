#!/usr/bin/env bash
# LANE-03: assets-drop/videos/*.{mp4,mov,webm} -> public/media/videos/<name>.mp4 (+ poster .webp at 1s)
# H.264, crf 26, max 1080p, no audio, faststart. Skips up-to-date outputs. Warns above 8 MB.
set -euo pipefail
cd "$(dirname "$0")/.."

IN=assets-drop/videos
OUT=public/media/videos
FF=ffmpeg
command -v ffmpeg >/dev/null 2>&1 || FF="$(node -e "console.log(require('ffmpeg-static'))" 2>/dev/null || true)"
if [ -z "$FF" ] || { [ "$FF" != ffmpeg ] && [ ! -x "$FF" ]; }; then echo "videos: no ffmpeg (system or ffmpeg-static) - skipping"; exit 0; fi

shopt -s nullglob nocaseglob
files=("$IN"/*.mp4 "$IN"/*.mov "$IN"/*.m4v "$IN"/*.webm)
if [ ${#files[@]} -eq 0 ]; then echo "videos: none in $IN (nothing to do)"; exit 0; fi
mkdir -p "$OUT"

for f in "${files[@]}"; do
  name="$(basename "${f%.*}" | tr '[:upper:] _' '[:lower:]--')"
  mp4="$OUT/$name.mp4"; poster="$OUT/$name.webp"
  if [ -f "$mp4" ] && [ -f "$poster" ] && [ "$mp4" -nt "$f" ]; then echo "videos: $name unchanged"; continue; fi
  "$FF" -y -loglevel error -i "$f" -an -vf "scale='min(1080,iw)':-2,format=yuv420p" \
    -c:v libx264 -crf 26 -preset slow -movflags +faststart "$mp4"
  "$FF" -y -loglevel error -ss 1 -i "$mp4" -frames:v 1 "$poster" 2>/dev/null || "$FF" -y -loglevel error -i "$mp4" -frames:v 1 "$poster"
  size=$(wc -c < "$mp4")
  echo "videos: $name -> $((size / 1024)) KB"
  [ "$size" -gt 8388608 ] && echo "  ! WARNING: $name is larger than 8 MB; trim it or raise -crf"
done
