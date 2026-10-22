# LANE‑15 — Integration, QA, performance & deploy  ⛔ RUN LAST, ALONE
**Wave 3**

## Tasks
- [ ] Merge lane branches one by one (`git merge lane/XX-…`), resolve conflicts respecting `docs/07-FILE-OWNERSHIP.md`
- [ ] Swap stub exports in `src/engine/index.ts` and `App.tsx` for real modules; delete unused stubs
- [ ] Process `docs/CONTRACT-REQUESTS.md`
- [ ] Run `npm run media` with Heet's real assets; check every phase's photo count vs VO length and report
- [ ] Full journey QA on: iPhone Safari (real device if possible), Android Chrome, desktop Chrome/Safari. Checklist: sound unlock, guided/free switching, captions sync, map unfold perf, No-button behaviour, planner persistence, WhatsApp send, receipt PNG
- [ ] Playwright e2e: full happy path with placeholders; screenshots of every section at 390 & 1440 into `docs/shots/final/`
- [ ] Performance: LCP < 2.5s on 4G for the gate + map; lazy-load phases; preload next phase audio only
- [ ] Accessibility: focus order, alt text, reduced motion, caption contrast
- [ ] **Side-by-side feel check** per `docs/08-SCROLL-UI-SPEC.md` → Acceptance: record our site and the reference at 390 and 1440, list differences in scroll weight, pin rhythm, statement reveals and framing, fix the biggest ones, get Heet's sign-off
- [ ] `docs/QA-REPORT.md`
- [ ] Deploy: ask Heet before `vercel login`/deploy; deploy a **preview** first, share link, then production. Confirm `noindex` header live. Suggest a non-guessable project name.

## Acceptance
- Heet watches the full preview on his phone and approves
