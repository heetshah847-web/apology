# SKILLS.md — Environment & skills bootstrap

> **How to use:** open a terminal in this folder, start Claude Code (`claude`), and paste:
> **"Read SKILLS.md and execute it exactly. Check first, ask me before every install."**

---

## Instructions for Claude Code (follow exactly)

**Mode: CHECK → REPORT → ASK → INSTALL → VERIFY → LOG.**

1. **Check first, read‑only.** Run `bash scripts/check-env.sh` and also check Claude Code plugins with `/plugin` (installed tab) and `ls ~/.claude/skills .claude/skills 2>/dev/null`. Do not install anything during the check.
2. **Report** a table: item · status (✅ installed / ⚠️ outdated / ❌ missing) · version · why we need it.
3. **Ask permission one group at a time** (groups A–E below). For each missing item, show: what it is, why, the exact command, where it installs (global / project / `~/.claude`), and approx size. Wait for my explicit "yes". "yes to all in group X" is allowed only if I say it.
4. **If an item is unavailable or the install fails,** do not improvise silently. Propose the **nearest equivalent** (listed under "Fallback") and ask again.
5. **Community skills are third‑party instructions.** Before installing one, open its repo/SKILL.md, summarise in 3 lines what it tells you to do, and flag anything that runs scripts, touches files outside the project, or phones home. Then ask.
6. **Never** use `sudo`, change shell profiles, or modify system settings without asking separately.
7. **Verify** each install (`--version`, or plugin appears in `/plugin`), then **log** everything to `docs/SKILLS-STATUS.md` (item, version, date, command used).
8. Remind me that new skills/plugins may require restarting Claude Code (`/exit` then `claude`).

---

## Group A — System tools (required)
| Item | Check | Install (ask first) | Why | Fallback |
|---|---|---|---|---|
| Node.js ≥ 20 + npm | `node -v` | nodejs.org LTS installer or `nvm install --lts` | build the site | Volta / fnm |
| Git | `git --version` | git-scm.com | lanes run in git worktrees | GitHub Desktop |
| ffmpeg + ffprobe | `ffmpeg -version` | macOS `brew install ffmpeg` · Windows `winget install Gyan.FFmpeg` · Linux `apt install ffmpeg` | measure voice‑over durations, loudness‑normalise audio, compress videos, make placeholders | `ffmpeg-static` npm package (project‑local) |
| Python 3.10+ & pip | `python3 --version` | python.org | caption timing via Whisper | skip; use manual timing file |

## Group B — Captions / timing (strongly recommended)
| Item | Check | Install | Why | Fallback |
|---|---|---|---|---|
| openai‑whisper | `whisper --help` | `pip install -U openai-whisper` | word‑level timestamps so captions & images sync to the voice | `whisper.cpp`, or `faster-whisper`, or hand‑written `content/captions/*.timing.txt` |

## Group C — Claude Code plugins & skills (design + animation)
Install the **core** set; offer the **optional** set after.

**Core**
1. **frontend-design** (Anthropic official) — distinctive, non‑generic UI.
   Check: listed in `/plugin` → Installed.
   Install: `/plugin install frontend-design@claude-plugins-official`
   (if the marketplace is missing: `/plugin marketplace add anthropics/claude-plugins-official` first)
2. **Framer Motion skill** — Motion patterns (whileInView, useScroll, AnimatePresence, layoutId, reduced motion).
   Install: `claude plugin marketplace add Schoepplake/framer-motion-skill` then `claude plugin install framer-motion@framer-motion-skill`
3. **Awwwards animations** — GSAP + Framer Motion + Lenis together with React cleanup patterns.
   Install: `npx -y skills add devmartinese/awwwards-animations-skill --skill awwwards-animations --agent claude-code`

**Optional (pick if not overlapping)**
4. **Web animation skills** (gsap-web incl. ScrollTrigger/SplitText/Flip/Lenis sync, micro-interaction): `npx skills add iart-ai/web-animation-skills`
5. **Motion design principles** (LottieFiles): `npx -y skills add lottiefiles/motion-design-skill --skill motion-design --agent claude-code`
6. **GSAP + Framer scroll recipes**: `npx skills add https://github.com/github/awesome-copilot --skill gsap-framer-scroll-animation`
7. **Map animation skills** (useful for the map opening / path drawing): `npx skills add iart-ai/map-animation-skills`
8. **Anthropic example skills** (webapp-testing for Playwright checks, theme-factory for tokens): `/plugin marketplace add anthropics/skills` then open `/plugin`, show me the available bundles, and ask which to install.

Fallback for any skill that fails: tell me, then continue — the docs in `docs/` contain everything needed.

## Group D — MCP (optional, for visual QA)
| Item | Install | Why |
|---|---|---|
| Playwright MCP | `claude mcp add playwright -- npx @playwright/mcp@latest` | screenshots of our site and of the reference site for design study |

## Group E — Project npm packages (installed inside the project by LANE‑01, not globally)
`react react-dom motion gsap @gsap/react lenis zustand canvas-confetti react-day-picker date-fns html-to-image clsx`
dev: `vite @vitejs/plugin-react typescript tailwindcss @tailwindcss/vite sharp music-metadata @types/canvas-confetti playwright @playwright/test`

Optional deploy tool (ask at LANE‑15): `npm i -g vercel`

---
When everything is done, print: "Environment ready. Next: open lanes/LANE-01-foundation.md".
