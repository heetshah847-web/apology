# 08 — Scroll UI spec: "feel like nesilnoble.com"

**Heet's requirement: the scrolling experience must feel like https://nesilnoble.com.** This doc is binding for every lane that renders UI.

## Where this spec comes from
- **Known (read from the live page's content, Oct 2026):** a sound gate in the header ("Sound off" / "Tap for sound") next to a minimal nav (Work · About · Contact); a hero that frames the visitor as entering someone's mind ("Inside the mind of…", "You've been dreaming in…"); a "Scroll to step inside" invitation shown twice (before and after a transition into the site); a small dimension readout ("0 × 0") in the hero, like a design-tool canvas; design-tool layer labels on objects ("Card / Default"); one big statement per screen ("I build / systems.", "7+ years. / Still curious. Still making."); a short manifesto told line by line; a place card styled like a licence plate ("Based in Bengaluru. KA 01"); then selected-work cards and an italic closing statement.
- **Measured (LANE‑01, Step 0 — done, see `docs/SCROLL-TEARDOWN.md`):** Lenis `{ lerp: 0.085, wheelMultiplier: 0.9 }`; the whole site is ONE fixed stage scrubbed by ONE ScrollTrigger over a 2850vh scroll space (no CSS pins); scenes hold ~1–4.5vh each with ~2.5vh breaths; the "step inside" is a tunnel zoom early on; hero display type 216px desktop / 113px mobile. Frozen in `src/contracts/scroll-feel.ts`. **Where the teardown's measurements differ from the guesses below, the teardown wins** and LANE‑01 updates this file.
- Study only. Never copy the site's code, text, images or fonts.

## The scroll grammar (rules every section follows)
1. **Smooth, weighted scroll.** Lenis with the measured `lerp`/`duration` (measured `lerp: 0.085`, `wheelMultiplier: 0.9`). Native scrollbar stays; no scroll-jacking that blocks her.
2. **One idea per screen.** Each scroll "scene" holds one statement, one photo, or one interaction. Nothing competes.
3. **Pinned, scrubbed scenes.** Scenes pin while their content plays out, driven directly by scroll position (`scrub`), then release. Scrolling backward replays them in reverse, exactly.
4. **Statements, not subtitles.** Narration captions render as **big statement typography**, revealed word by word or line by line as scroll/voice progresses — the way the reference reveals "I build / systems." Small lower-third subtitles are only the reduced-motion / accessibility fallback.
5. **Design-tool framing.** Photos sit inside thin frame outlines with corner handles, a layer label (e.g. `Memory / First call`, `Queen / Portrait 03`) and a live dimension readout. In our version the readout is cartographic: coordinates on the atlas (Ahmedabad is about 23.03° N, 72.57° E), days together, or "km apart" in the Distance chapter.
6. **"Step inside" transitions.** Moving between big parts of the story feels like going *into* something (scale through the map, into a frame), not sliding to the next slide.
7. **Persistent quiet chrome.** A minimal top bar: names on the left, chapter links in the middle (Our story · The question · The date), "Sound off / Tap for sound" on the right. A small "Scroll to step inside" hint appears at the hero and after the map unfolds, then hides once she scrolls.
8. **Restraint.** No generic fade-up on every block, no hover effects on everything. Motion answers scrolling.

## How our story maps onto that grammar
| Our section | Reference pattern it borrows | Scene design |
|---|---|---|
| Header | sound toggle + minimal nav | names · chapter links · "Tap for sound" |
| Hero / gate | "Inside the mind of…" framing + dimension readout | "Inside the story of / Heet & Tanisha" · "You've been living in **Queen Tanisha's Kingdom**" · coordinates readout · "Scroll to step inside" |
| Map unfold | "step inside" transition | the folded map unfolds, then the camera scales *into* the Queen's Court |
| Queen (t0) | one statement per screen | each sentence of her script is one pinned statement; portrait inside a labelled frame behind it |
| Friendship → Love (t1) | statement + object card with layer label | polaroids as framed "layers"; statements reveal word by word |
| Distance → Apology (t2) | sparse manifesto lines | fewer, larger words; frames drift apart; apology lines alone on screen |
| The Question | the reference's bold closing statement | huge statement, the No/Yes interaction below |
| Planner | selected-work cards | option cards in frames with layer labels (`Cuisine / Pasta`) |
| Order confirmed | licence-plate place card | royal receipt with a "plate" like `GJ 01 · FOREVER` |

## Voice sync without losing the feel
The reference is driven by the visitor's own scrolling. Ours adds a voice, so:
- **Default = guided glide:** while the voice plays, the page scrolls itself using the **same Lenis easing**, so it feels like a smooth hand-held scroll, not an autoplay slideshow.
- The moment she touches, wheels or swipes, she is in control (free mode) — scenes scrub exactly like the reference — and "Resume voice" picks up from her position (see `docs/04-TIMING-MATH.md`).

## Step 0 teardown procedure (run by LANE‑01 before Wave 1)
With Playwright (Chromium, desktop 1440×900 and mobile 390×844):
1. Record a video while scrolling the whole page at a steady pace, top to bottom and back up. Save to `assets-drop/references/nesil/scroll-desktop.webm` and `scroll-mobile.webm`.
2. Screenshot every ~50vh of scroll into `assets-drop/references/nesil/frames/`.
3. In the page, log which libraries are present (`window.gsap`, `window.ScrollTrigger`, a Lenis instance, `<script src>` list), and if ScrollTrigger exists, its triggers' `start`, `end`, `pin`, `scrub`.
4. Measure: total page height in vh, which elements become `position: sticky/fixed` and over what scroll range, font families and sizes of statements and body text, header height.
5. Write `docs/SCROLL-TEARDOWN.md`: a numbered list of scenes (scroll range in vh, what pins, what scrubs, what animates), the smooth-scroll settings, the type scale, and 10 "feel" notes. Then update the "To be measured" items in this file.

## Acceptance (checked in LANE‑15 — integration)
Play our site and the reference side by side at 390px and 1440px. The scroll weight, pinning rhythm, statement reveals and framing should feel like the same family. Heet signs off on this comparison.
