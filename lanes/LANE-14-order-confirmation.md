# LANE‑14 — Order confirmed, receipt & sending to Heet
**Wave 2 · parallel**

## Tasks
- [ ] `OrderConfirmed.tsx`: royal decree / receipt card (paper texture, gold seal stamp animation on mount), order number `#TANISHA-FOREVER-<3 digits>`, grouped items, venues, date + slot, her suggestions, signature "Yours, Heetu"
- [ ] Include a `PlateCard` (licence-plate style, e.g. `GJ 01 · FOREVER`), echoing the reference's place card
- [ ] Copy from `planner.config.json` → `confirmation`
- [ ] `sendOrder.ts`:
  - WhatsApp: `https://wa.me/<number>?text=<encoded summary>` (number from config) — button "Send to Heetu"
  - Optional Web3Forms POST if `web3formsAccessKey` is set (no other endpoints)
  - Save to localStorage `atlas-order-v1`
- [ ] "Save receipt" → PNG via html-to-image (fonts embedded)
- [ ] "Edit order" → back to planner review
- [ ] Celebration: heart confetti burst + `chime`; then closing screen: closing line from config + small collage from Phase 2 photos + a replay button ("Watch our story again")

## Acceptance
- WhatsApp text is readable (line breaks, emojis OK), under 1500 chars
- Receipt PNG renders correctly on iOS Safari
