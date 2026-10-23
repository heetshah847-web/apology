# SKILLS-STATUS — polish pass (2026-10-23)

Scope: project-level (`heet-tanisha-story/.claude/skills`, locked in `skills-lock.json`). Nothing global.

| Item | Status | Version / source | Command used | Licence |
|---|---|---|---|---|
| frontend-design | ✅ already available | Anthropic official plugin | n/a | Apache-2.0 |
| gsap-web | ✅ installed | iart-ai/web-animation-skills | `npx skills add iart-ai/web-animation-skills --skill gsap-web --skill 60fps-animation --skill accessible-animation --skill micro-interaction --agent claude-code -y` | MIT |
| 60fps-animation | ✅ installed | same | same | MIT |
| accessible-animation | ✅ installed | same | same | MIT |
| micro-interaction | ✅ installed | same | same | MIT |
| motion-design | ✅ installed | lottiefiles/motion-design-skill | `npx -y skills add lottiefiles/motion-design-skill --skill motion-design --agent claude-code -y` | MIT |
| map-animation | ✅ installed | iart-ai/map-animation-skills | `npx skills add iart-ai/map-animation-skills --agent claude-code -y` | MIT |
| roughjs | ✅ installed | 4.6.6 (npm) | `npm i roughjs` | MIT |
| Playwright MCP | ⏳ awaiting approval | microsoft/playwright-mcp | `claude mcp add playwright -- npx @playwright/mcp@latest` | Apache-2.0 |
| lottie-react | ⏳ only if a scene needs it (ask first) | npm | `npm i lottie-react` | MIT |
| Custom canvas starfield | planned (Phase 2, written in-repo) | n/a | n/a | n/a |

## Skipped on purpose
- Schoepplake/framer-motion-skill, devmartinese/awwwards-animations-skill: no licence.
- React Bits: licence unclear. tsparticles, three / @react-three/fiber: declined by Heet.

## Review notes
Skill scripts (`seek-shot.sh`, `probe-mp4.sh`, `contact-sheet.sh`, `img-to-ascii.mjs`) were read: no network calls, none are run by us. map-animation is Remotion/After Effects oriented and is used for ideas only.

## Restart
Restart Claude Code (`/exit`, then `claude`) so the new project skills load.
