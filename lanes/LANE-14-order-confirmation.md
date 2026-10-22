# LANE‑14 — Order confirmed, receipt & sending to Heet
**Wave 2 · parallel**

## Tasks
- [x] `OrderConfirmed.tsx`: royal decree / receipt card (paper texture, gold seal stamp animation on mount), order number `#TANISHA-FOREVER-<3 digits>`, grouped items, venues, date + slot, her suggestions, signature "Yours, Heetu"
- [x] Include a `PlateCard` (licence-plate style, e.g. `GJ 01 · FOREVER`), echoing the reference's place card
- [x] Copy from `planner.config.json` → `confirmation`
- [x] `sendOrder.ts`:
  - WhatsApp: `https://wa.me/<number>?text=<encoded summary>` (number from config) — button "Send to Heetu"
  - Optional Web3Forms POST if `web3formsAccessKey` is set (no other endpoints)
  - Save to localStorage `atlas-order-v1`
- [x] "Save receipt" → PNG via html-to-image (fonts embedded)
- [x] "Edit order" → back to planner review
- [x] Celebration: heart confetti burst + `chime`; then closing screen: closing line from config + small collage from Phase 2 photos + a replay button ("Watch our story again")

## Acceptance
- WhatsApp text is readable (line breaks, emojis OK), under 1500 chars  ✓ (1399 max, order.walk.mjs)
- Receipt PNG renders correctly on iOS Safari  (verified in Chromium only; iOS uses warm-up render + share sheet, needs a real-device check)
