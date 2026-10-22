# QA report (LANE-15, integration pass)

## Merged
Lanes 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 (+ "punish" step), 13, 14 are integrated on `main`. All `*.stub.*` files are deleted except `storyData.stub.ts` (typed view of `story.generated.json`) and `chrome/SoundToggle.stub.tsx` (no lane owns a final one; it is wired to `audioDirector`).

## Verified
- `npm run typecheck && npm run build` pass.
- `tests/e2e-back-half.mjs` on the real App at 1440x900, 1366x768, 390x844: planner (with the punishment item) -> Confirm order -> receipt shows order number, items, "His punishment". Screenshots: `docs/shots/final/`.
- Lane-level walks (order, question, love, planner) passed in their own worktrees.

## Fixed during integration
- `src/engine/scroll/timing.ts` was saved as Windows-1252 (a "x" sign in a comment); Vite refused to build. Re-encoded as UTF-8.
- `main` and `base/wave1` had unrelated histories with identical content; joined with main's newer audio/caption files kept.

## NOT verified (needs a human / real device)
- Full voice-driven journey (map -> queen -> t1 -> t2 -> question) with real audio, guided/free switching and caption sync.
- Real photos: only placeholders were used. Love chapter captions are empty in `story.generated.json` (`needsReview`); overlay lines exist for 4 of 6 Love photos.
- iPhone Safari and Android (receipt PNG, sound unlock, WhatsApp send). Receipt PNG verified in Chromium only.
- Apology -> Question 1.5s silence hold is not implemented.
- `VITE_WHATSAPP_NUMBER` must be set in `.env.local` and on Vercel.
- Performance (LCP), accessibility audit, side-by-side feel check against the reference, Heet's sign-off.
- Deploy: not done. Ask Heet before `vercel login`/deploy; preview first.

## Contract changes applied
- `PlannerStepId` gained `'punish'` (user request).
- Still open in `docs/CONTRACT-REQUESTS.md`: `MediaItem.label/blur`, `CaptionCue.needsReview`, `/planner` route.
