# CLAUDE.md — Master context (read this first, every session)

You are building **"The Atlas of Us"**: a private, cinematic, voice‑narrated scroll story that Heet ("Heetu") is making for Tanisha ("Queen Tanisha"). It is an apology first, then a question — *"Will you be mine again?"* — and, if she says yes, a playful date‑planner that ends with an "order confirmed" love note.

## Golden rules for every lane
1. **Read before you write:** `CLAUDE.md` → `docs/08-SCROLL-UI-SPEC.md` (+ `docs/SCROLL-TEARDOWN.md` once it exists) → `docs/03-ARCHITECTURE.md` → `docs/07-FILE-OWNERSHIP.md` → your `lanes/LANE-XX-*.md`. Read `docs/04-TIMING-MATH.md` if your lane touches audio, scroll or media timing.
2. **Stay in your lane.** Only create/edit files your lane owns (see `docs/07-FILE-OWNERSHIP.md`). If you need a change in a shared contract (`src/contracts/*`), do NOT edit it — write the request into `docs/CONTRACT-REQUESTS.md` and code against the current contract.
3. **Contracts are frozen** after LANE‑01. Import types from `src/contracts`, never redefine them.
4. **Audio is the clock.** There are **3 voice tracks**, not one per phase: Track 0 = The Queen (23.0s); Track 1 (45.1s) and Track 2 (43.3s) narrate the four chapters Friendship → Love → Distance → Apology. Chapter boundaries inside a track come from `[[chapter:…]]` markers in the scripts. The track's `currentTime` drives scroll, captions, chapter switches and image changes. Never hard‑code durations; read them from `src/data/story.generated.json` (measured by script).
5. **Everything is data‑driven.** Copy, options, venues and timings live in `content/` and `src/data/`, never inline in components.
6. **Placeholders first.** Real photos/voice may not exist yet. Use the placeholder generator (`npm run placeholders`) so every lane can run end‑to‑end today.
7. **Design skill:** use the installed `frontend-design` skill and the animation skills listed in `SKILLS.md`. Follow `docs/02-DESIGN-SYSTEM.md`. No generic AI look.
8. **Quality floor:** mobile‑first (she will most likely open it on a phone), 60fps, `prefers-reduced-motion` respected, keyboard focus visible, no layout shift, works on iOS Safari.
9. **Privacy:** the site must be `noindex`, sit behind a soft passcode gate, and never call third‑party trackers. No remote images; all media is local in `public/media`.
10. **Scroll must feel like https://nesilnoble.com.** Smooth weighted scroll, one idea per screen, pinned scrubbed scenes, big statement typography instead of subtitles, design-tool style frames with layer labels, a quiet header with a "Tap for sound" toggle. The rules are in `docs/08-SCROLL-UI-SPEC.md`; measured values in `docs/SCROLL-TEARDOWN.md` override guesses.
11. **Finish with proof.** At the end of a lane: run `npm run typecheck && npm run build`, take screenshots (Playwright) at 390×844 and 1440×900 if your lane has UI, and tick the acceptance list in your lane file.

## The story in one breath
Tap to unfold a map → **Phase 0 The Queen** (Track 0, 23.0s) → **Track 1 (45.1s) + Track 2 (43.3s)** carrying four chapters: **Friendship** (how two souls became friends) → **Love** (how they became partners) → **The Distance** (destiny tried to be cruel) → **The Apology** (Heet's apology) → **The Question** ("Will you be mine again?", runaway No / growing Yes) → **The Date Planner** (activity, cuisine, dessert, choose your Heetu, flowers, her suggestions, review cart, delivery date) → **Order Confirmed** (love‑note receipt, sent to Heet).

## People & names (use exactly)
- Her: **Tanisha** — addressed as "Queen Tanisha", "Your Majesty".
- Him: **Heet** — nickname **Heetu**.
- City: Ahmedabad (Nirma University area, Sindhu Bhavan Road).

## Tech stack (fixed)
Vite + React 18 + TypeScript, Tailwind CSS, **Motion** (Framer Motion, `motion/react`), **GSAP + ScrollTrigger** (`@gsap/react` `useGSAP`), **Lenis** smooth scroll, **Zustand** (with persist), canvas‑confetti, react‑day‑picker + date‑fns, html‑to‑image. Deployed on Vercel as a static site.
