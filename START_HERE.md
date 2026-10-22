# START HERE — for Heet

## 0. One-time setup (5 minutes)
1. Unzip this folder somewhere simple, e.g. `~/atlas-of-us`.
2. Save the Pinterest pin image as `assets-drop/references/pinterest-map.jpg`.
3. Open a terminal in the folder and run `claude`.
4. Paste: **"Read SKILLS.md and execute it exactly. Check first, ask me before every install."**
5. Restart Claude Code if it installed plugins (`/exit`, then `claude`).

## 1. The lanes (15 total)
| Wave | Lanes | Run how |
|---|---|---|
| **0** | 01 Foundation (starts with the scroll teardown of nesilnoble.com) | alone, first |
| **1** | 02 Design · 03 Media · 04 Audio & captions · 05 Scroll engine · 06 Gate & map · 12 Planner · 13 Venues | all in parallel |
| **2** | 07 Queen · 08 Friendship · 09 Love · 10 Distance · 11 Apology & Question · 14 Order | all in parallel |
| **3** | 15 Integration, QA & deploy | alone, last |

Wave 2 lanes can technically start right after Lane 01 (they use stubs), but starting them after Wave 1 means less rework.

## 2. Running lanes in parallel (one terminal per lane)
After Lane 01 is committed, give every lane its own copy of the code with git worktrees:
```bash
# from the main folder, once per lane
git worktree add ../atlas-lane-02 -b lane/02-design
git worktree add ../atlas-lane-03 -b lane/03-media
# ... and so on
cd ../atlas-lane-02 && claude
```
Then paste the lane prompt (see `prompts/RUN-A-LANE.md`). Lane 15 merges all the branches back.

Note: `assets-drop/` is git-ignored, so copy or symlink it into each worktree: `ln -s ~/atlas-of-us/assets-drop assets-drop`.

## 3. What you still need to give (put files where docs/05-CONTENT-CONTRACT.md says)
- ✅ **3 voice-overs received** and placed: `vo-0-queen` (23.0s, beauty), `vo-1` (45.1s, friendship → love), `vo-2` (43.3s, long distance → apology)
- **2 scripts:** paste the exact words into `content/scripts/track-1.md` and `track-2.md`, keeping the `[[chapter:…]]` lines where each chapter starts (the Queen script is already filled in)
- ✅ **28 photos received** and sorted: Queen 8, Friendship 7, Love 6, Distance 6 (her side only), Apology 1. See `docs/MEDIA-STATUS.md` for what's still worth adding
- **5 Heetu photos**, one per version
- **Optional:** videos, background music (`bed.mp3`, `yes.mp3`, `planner.mp3`), sound effects
- **Config:** your WhatsApp number, the passcode question/answer (`node scripts/hash-answer.mjs "answer"`), March Heetu's description

Until then, everything runs on placeholders (`npm run placeholders`). When real files arrive, run `npm run media` and the site re-fits itself to the new voice lengths.
