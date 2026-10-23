# POLISH-AUDIT — before any polish (2026-10-23)

Branch: `polish/integration` (local only, nothing pushed). Build: `npm run typecheck` is clean.
Screenshots: `docs/polish-before/{1440x900,1366x768}` (main flow), `-planner` and `-order` variants.
Method: Playwright (project package), dev server, unlocked passcode, sound off, scripted scroll. No code was changed for the audit itself.

## 0. What I found before auditing
The site Heet described as "near-finished" was **not integrated**: `src/features/index.ts` and `src/engine/index.ts` still exported stubs, and the Queen / Friendship / Distance / Order lanes lived only on their own branches. With Heet's approval I integrated them on `polish/integration` (commit `55390b5`, sole author Heet): real chapters + order receipt + venue data swapped in, `.env*` ignored.
**Still a stub: the Love chapter.** `src/features/phases/love/` contains only `LoveChapter.stub.tsx` and no lane branch ever built it.

## 1. Severity list

### Critical (blocks "finished")
| # | Problem | Evidence |
|---|---|---|
| C1 | **Love chapter is a placeholder**: "GARDEN OF LOVE · STUB", plain centred text, `photo 2/6 · 23.85s–45.11s` debug line, and photos shown full-bleed at huge scale (faces cropped, soft). | main-12/13 at 1440 |
| C2 | **Passcode gate is disabled** (console: `answerSha256 is not a SHA-256 hash yet: gate disabled`) and the question reads "(EDIT THIS)". Privacy rule 9 is not met. `content/config` is Heet's file, so I will not touch it. | console, `content/config/story.config.json` |
| C3 | **Pinterest reference missing**, so palette/map style cannot be verified against it. The site currently uses the documented fallback violet/gold palette consistently. | `docs/REFERENCE-NOTES.md` |

### High
| # | Problem | Evidence |
|---|---|---|
| H1 | **Chapter strip collides with the Sound toggle** (top right). Labels like "VALLEY OF FRIENDSHIP · GARDEN OF LOVE" and "SEA OF DISTANCE · BRIDGE OF FORGIVENESS" are clipped under the button. | sheets 2, 3 |
| H2 | **Distance photo is tiny on a wide screen.** The 588×1280 portrait renders about 80×170 CSS px at 1440, leaving large empty areas, and its frame touches the statement above it. Portrait + statement side by side (as Apology does) or a blurred fill is needed. | main-14/15 |
| H3 | **Planner step looks unfinished.** One lone option chip, a large empty panel, a floating cart box and tiny Back/Next. Only step 1 was reached; the other 7 steps still need an interaction pass. | planner-27/28 |
| H4 | **Empty "dead" screens in scroll.** Blank dark screens with only a tiny label appear between map interludes and chapters, and after the Queen statements. One idea per screen means something should be on every screen. | main-03, main-10, main-17 |
| H5 | **Whole-scroll layout-shift score is 9.5–13.5** (load-only CLS is fine at 0.023). Pinned/scrubbed layers are probably counted. Needs a targeted check before polishing; I have not yet identified the source. | `capture.cjs` metrics |

### Medium
| # | Problem |
|---|---|
| M1 | Queen chapter's first portrait frame shows gold line-art on a dark box, not a photo. Confirm this is the intended "crown draws" beat; as a still it reads as a broken image. |
| M2 | Reveal-ahead words are very low contrast (for example "threatening to drown / everything they had once sworn to protect", mid-reveal). Fine as a transient state, but it lingers at slow scroll. Check against AA. |
| M3 | Question buttons are small next to the giant headline (Yes is about 94×62 px). Fine for a mouse, weak as a focal point. |
| M4 | Map hero uses about half the width at 1440 and small label type; the zoom-in later is the strong moment. The unfold is the signature scene and could be stronger. |
| M5 | Console error: React "does not recognize the `%s` prop on a DOM element" (a component passes a camelCase prop to the DOM). |
| M6 | Order screen cannot be reached from the persisted store state (`orderPlaced`) in the full app; it only renders via the lane harness. Needs checking in the real flow. |

### Low / works well
- **Receipt is finished-looking** (paper card, plate `GJ 01 · FOREVER`, wax seal, Send/Save/Edit, polaroid grid, closing line).
- Runaway No: moves away from the mouse inside the safe area, then becomes a second Yes after `noMaxAttempts` (by design). Mouse works.
- Focus ring: 2 px gold outline present on buttons.
- Free vs guided scroll: a wheel input switches to free mode and "Resume voice" appears. Works.
- Performance: 60 fps idle and while wheel-scrolling at both sizes (one first run measured 50 fps in dev mode). No long tasks on repeat runs. No horizontal overflow at either size.
- Reduced motion: page loads and shortens (7200 px). **Not yet visually checked.**

## 2. Checklist against the brief
| Brief item | Status |
|---|---|
| Scroll feel like nesilnoble (weighted scroll, one idea per screen, pinned scenes, word-by-word statements, framed photos with layer labels, quiet top bar) | Mostly there: Lenis, word-by-word statements, `Queen / Portrait 01` labels and readouts exist. Dead screens (H4) and the stub Love chapter break the rhythm. |
| Theme from `pinterest-map.jpg` | **Cannot verify** (C3). Fallback palette is applied consistently. |
| Portrait photos on wide screens | Queen, Apology, Friendship fine. **Distance fails (H2).** Love stub crops faces (C1). |
| Voice sync | Not numerically verified: headless run has no audible audio. Captions follow cues; guided/free switch works. |
| 60 fps, no layout shift, fallback, reduced motion | 60 fps good. Layout shift needs investigation (H5). Reduced motion needs a visual pass. |
| Details: contrast, focus, hover, No button, planner, receipt | See above. |

## 3. Not verified
- 1366×768 was captured and measured (height 18,475 px, no overflow, 60 fps) but I have **not eyeballed every frame** at that size. I expect the same issues as 1440.
- Phone (390×844) not captured (secondary).
- Audio-timed sync, hover states beyond the No button, planner steps 2–8.
