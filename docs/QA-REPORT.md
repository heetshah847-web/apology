# QA report (pre-deploy pass)

Branch `polish/integration`. Tested on a production build (`vite build` + `vite preview`) with Playwright/Chromium. Scripts: `tests/e2e-journey.mjs`, `tests/quality-check.mjs`.

## Verified
| Check | Result |
|---|---|
| Guided journey, real audio clock, desktop 1440x900 | map -> t0 (23.01s) -> t1 (45.11s) -> t2 (43.34s) each ends `done`; scroll drift <= 0.0002 of track length throughout |
| Chapter transitions | theme switches at the measured boundaries: Friendship->Love at t1 23.85s (`rose`), Distance->Apology at t2 15.23s (`dawn`) |
| Between-track interludes | scrolling through the map interlude starts the next track in guided mode |
| Silence hold (new) | after the t2 voice ends the screen holds **1517 ms** (target 1500), then glides onto The Question |
| Question -> Yes -> Promise -> planner | planner mounts 96-178 ms after confirm (lazy chunk, pre-warmed on idle) |
| Phone viewports (Chromium emulation, touch, mobile UA) | 390x844 (iPhone UA) and 412x915 (Pixel UA): same full journey passes, same drift, hold 1.1-1.5 s (measurement is +-0.5 s; desktop precise run = 1517 ms) |
| Console/page errors | none on any run |
| Reduced motion | loads without errors, no pinned sections, caption stepper present |
| Contrast (tokens) | pearl on stage 13.1:1, gold 6.7:1, rose 7.9:1, receipt ink 12.8:1, receipt soft text 4.85:1 (all >= AA) |
| Accessibility basics | `lang`, title, one `h1`, `main` landmark, no images without `alt`, no unnamed controls, visible focus ring (2px outline) |

## Fixed in this pass
- `NarratedTrack.tsx`: 1.5 s silence hold after the *final* track's voice ends, then a glide to The Question (was: stayed on the last line forever until she scrolled). Skip and any user input cancel/bypass it. Other tracks and all timing logic unchanged.
- `TheQuestion.tsx`: the invisible Yes/No were in the Tab order from the first screen; now `inert` until the scene is alive.
- `App.tsx`: `<main>` landmark; planner and receipt lazy-loaded (first-load JS 695 KB -> 583 KB, gzip 199 KB). `features/index.ts` no longer re-exports them.
- `TrackUI.tsx` / `NarratedTrack.tsx`: chapter mini-map no longer clips off the left edge on 360-390 px phones (wraps to two right-aligned rows).
- `src/engine/scroll/timing.ts` was Windows-1252 and broke `vite build` (already fixed upstream on this branch).

## Performance (gate + map, throttled 1.6 Mbps / 150 ms RTT)
- Desktop (2x CPU slowdown): FCP/LCP **1.9 s** (target < 2.5 s: pass), CLS 0.018.
- Phone (4x CPU slowdown, Lighthouse-style worst case): FCP/LCP **2.7 s**, CLS 0.032. **Misses 2.5 s by ~0.2 s under this pessimistic emulation.** The bottleneck is JS parse/execute (583 KB), not the network. A real mid-range phone is usually faster than 4x; verify on a real device.

## NOT verified / limitations
- **No real iPhone Safari or Android device and no WebKit engine here.** iOS-specific behaviour is unverified: audio unlock inside the tap, `100svh` toolbar behaviour, receipt PNG via html-to-image (Safari quirks), WhatsApp deep link, haptics.
- No Lighthouse/axe installed (not installed without permission): accessibility was checked with scripted rules above, not a full axe audit. Screen-reader pass not done.
- Side-by-side scroll-feel check against nesilnoble.com not done (needs Heet's eyes). Measured here: pin/scrub drift is ~0, hand-offs glide at the measured 1.6 s.
- Love/Friendship/Distance/Apology captions come from Whisper, not Heet's script (see below).
