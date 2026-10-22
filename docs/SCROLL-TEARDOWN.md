# Scroll teardown — nesilnoble.com (measured Oct 2026 with Playwright/Chromium)
Study only. Recordings: `assets-drop/references/nesil/scroll-desktop.webm`, `scroll-mobile.webm`; frames in `assets-drop/references/nesil/frames/` (one per 0.5 viewport); raw data `teardown.json`.

## How the site is built (measured)
- **Libraries:** GSAP 3.12.5 + ScrollTrigger (self-hosted `/vendor/`), **Lenis** (`html.lenis`). No Three.js.
- **Smooth scroll:** `new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })`; Lenis `scroll` → `ScrollTrigger.update`; driven by `gsap.ticker` (`lenis.raf(t*1000)`). Programmatic jumps use `lenis.scrollTo(y, { duration: 1.6 })`.
- **One stage, one timeline.** The page is a **single fixed full-viewport "frame"** (900px desktop / 844px mobile) layered over an empty `.scroll-space` of **height 2850vh** (page = 28.5 viewports, ~25 650px desktop). Exactly **one ScrollTrigger** exists: `trigger: scroll-space, start: "top top", end: "bottom bottom", scrub: true, pin: false`. Everything (words, scenes, transitions) is a GSAP timeline scrubbed by that one trigger. Nothing is "pinned" in the CSS sense; the stage is simply `position: fixed`.
- **Header:** absolute, 95px desktop / 76px mobile; Big Shoulders 16px, name left, "Sound off / Click for sound" + WORK · ABOUT · CONTACT right.
- **Palette:** body `#000`, text `rgb(244,242,255)`.
- **Easings used in the timeline:** `power3.out` (most), `power2.in`, `sine.inOut`, `power2.out`, `power2.inOut`. Durations 0.3–0.9 (micro) up to 2–3.6 (hero moves).
- **Reduced motion:** `html.rm` hides `.scroll-space`, tunnel, ruler, cursor, hint, grain, dust.
- **Extras:** grain + dust overlays, a custom cursor, a "ruler" (dimension readout), a "tunnel" (the step-inside transition), a one-time "best on bigger screen" notice on mobile.

## Scenes (scroll position in viewport-heights, desktop; mobile identical)
| vh | Scene | Behaviour |
|---|---|---|
| 0–1.3 | Hero "NESIL NOBLE" | huge display type (216px desktop / 113px mobile), "Scroll to step inside" hint |
| 1.3–2.7 | Step-inside transition | stage empty; tunnel/zoom through the hero |
| 2.7–5.4 | "Hi, I'm Nesil." | one statement, revealed word by word (typed) |
| 5.4–8.5 | "Systems." | single huge word held ~3vh |
| 8.5–9.4 | "7+ years." | short beat |
| 9.4–12.6 | Manifesto | 4 lines (`I build…`, `My obsession…`, `I design for inclusion.`, `These days…`), **~1.0–1.5vh each**, words wrapped in zero-width-joined spans for per-word reveal |
| 12.6–15.3 | Breath | empty/atmospheric (ruler, dust) |
| 15.3–16.6 | "That's what I make. / That's what I lead." | two-line statement |
| 16.6–19.3 | "Based in Bengaluru." | licence-plate place card |
| 19.3–23.8 | Selected work | 3 cards stacked (title lines) held ~4.5vh |
| 23.8–25.5 | Closing italic statement | "I care about the details…" |
| 25.6–27.5 | Contact / end | "Get in touch", name again |

## Type scale (measured)
| Role | Desktop | Mobile | Face |
|---|---|---|---|
| Hero display | 216px / lh 185.8px / ls −2.16px | 113px / lh 97px / ls −1.13px | "Mighty Ditey NF" 400 |
| Sub-display | 51.8px / ls 1.04px | 25px | same, 500 |
| Statement kicker (serif accent) | 21px / 22px | 21px | Melodrama 500 |
| UI / labels | 14–19.8px, ls 0.19–0.64px, weight 520–800, UPPERCASE for nav | 13–18px | "Big Shoulders" |
Statements on the scenes are uppercase condensed (Big Shoulders) ~ 12–20vw.

## 10 feel notes
1. Scroll is heavy and floaty: lerp 0.085 with wheel ×0.9 – you feel inertia, never snap.
2. The user is never blocked: native scrollbar, no scroll hijack, no snap points.
3. The whole experience is **one scrubbed timeline**; backwards scroll plays everything in reverse exactly.
4. Almost nothing is on screen at once: one idea per ~3vh of scrolling, then blank space before the next.
5. Words arrive one at a time, tied to scroll, not to time.
6. Long scroll for little content: 28.5 screens for ~12 ideas (≈2.3 screens per idea).
7. Dead zones (≈2.5vh) between acts give the "breath".
8. Big transition (tunnel) happens once, early, as the "step inside" moment.
9. Atmosphere layers (grain, dust, ruler, cursor) are always on but very quiet.
10. Chrome is tiny and constant; content owns the screen.

## What this means for our build
- Our narration tracks are the timeline: t0 276vh, t1 541vh, t2 520vh (12vh/sec), i.e. about the same density as the reference (≈100vh per statement).
- `src/contracts/scroll-feel.ts` freezes the numbers lanes must reuse (Lenis options, type scale, pin defaults).
