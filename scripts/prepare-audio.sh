#!/usr/bin/env bash
# LANE-04: normalise voice (-16 LUFS) and music (-20 LUFS) into public/media/. Needs ffmpeg (PATH or the ffmpeg-static dev dependency).
#   assets-drop/voice/vo-*.*  -> public/media/voice/<name>.mp3   (mono, 44.1 kHz, 128k)
#   assets-drop/music/*.*     -> public/media/music/<name>.mp3   (stereo, -20 LUFS)
#   assets-drop/sfx/*.*       -> public/media/sfx/<name>.mp3     (stereo, -20 LUFS)
set -euo pipefail
cd "$(dirname "$0")/.."

FFMPEG="$(command -v ffmpeg || true)"
[ -z "$FFMPEG" ] && FFMPEG="$(node -e "process.stdout.write(require('ffmpeg-static')||'')" 2>/dev/null || true)"
if [ -z "$FFMPEG" ] || ! "$FFMPEG" -version >/dev/null 2>&1; then
  echo "! ffmpeg not found. Install it (winget install ffmpeg) or run npm install (ffmpeg-static)." >&2
  exit 1
fi

shopt -s nullglob nocaseglob
encode() { # src dst "filter" channels
  mkdir -p "$(dirname "$2")"
  "$FFMPEG" -hide_banner -loglevel error -y -i "$1" -vn -af "$3" -ac "$4" -ar 44100 -c:a libmp3lame -b:a 128k "$2"
  printf '  %-40s -> %s\n' "$(basename "$1")" "${2#./}"
}

n=0
for f in assets-drop/voice/vo-*.{mp3,wav,m4a,aac,ogg,flac}; do
  encode "$f" "public/media/voice/$(basename "${f%.*}").mp3" "loudnorm=I=-16:TP=-1.5:LRA=11" 1; n=$((n+1))
done
for kind in music sfx; do
  for f in assets-drop/$kind/*.{mp3,wav,m4a,aac,ogg,flac}; do
    encode "$f" "public/media/$kind/$(basename "${f%.*}").mp3" "loudnorm=I=-20:TP=-1.5:LRA=11" 2; n=$((n+1))
  done
done
[ "$n" -eq 0 ] && echo "No audio in assets-drop/ (voice/vo-*, music/, sfx/). Nothing to do."
echo "audio: $n file(s) prepared"
