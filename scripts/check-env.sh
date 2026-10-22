#!/usr/bin/env bash
# READ-ONLY environment check. Installs nothing.
check () { # label, command, [version flag]
  if command -v "$2" >/dev/null 2>&1; then
    v=$("$2" ${3:---version} 2>&1 | head -n1); echo "✅ $1: $v"
  else echo "❌ $1: missing"; fi
}
echo "== System tools =="
check "Node.js" node -v
check "npm" npm -v
check "git" git
check "ffmpeg" ffmpeg -version
check "ffprobe" ffprobe -version
check "python3" python3
check "pip" pip3
echo "== Captions =="
if command -v whisper >/dev/null 2>&1; then echo "✅ whisper: installed"; else echo "❌ whisper: missing (optional, see SKILLS.md Group B)"; fi
echo "== Optional =="
check "vercel CLI" vercel
echo "== Node version gate =="
if command -v node >/dev/null 2>&1; then
  major=$(node -v | sed 's/v\([0-9]*\).*/\1/'); [ "$major" -ge 20 ] && echo "✅ Node >= 20" || echo "⚠️ Node < 20, upgrade needed"
fi
echo "== Claude skills folders =="
ls -1 ~/.claude/skills 2>/dev/null | sed 's/^/  user skill: /' || true
ls -1 .claude/skills 2>/dev/null | sed 's/^/  project skill: /' || true
echo "(Check plugins inside Claude Code with /plugin)"
echo "== Assets present =="
for d in assets-drop/voice assets-drop/music assets-drop/videos assets-drop/references assets-drop/photos/*; do
  [ -d "$d" ] && printf "  %-42s %s files\n" "$d" "$(find "$d" -type f ! -name 'README*' ! -name '.gitkeep' | wc -l | tr -d ' ')"
done
