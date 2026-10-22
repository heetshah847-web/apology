# 06 — "The Royal Order": the date planner after she says yes

All options and copy live in `content/config/planner.config.json`; venue data in `src/data/venues.json`. Never hard‑code.

## The Question (LANE‑11) → entry to planner
- Headline: **"Will you be mine again?"** (Bodoni Moda, huge, centered).
- **No button** ("scrolling No"): on pointer approach (desktop) or touchstart (mobile) it slides away to a random free spot inside the safe area, never off‑screen, never under the Yes. Each attempt: No shrinks 8%, its label cycles through `noLabels` (e.g. "No", "Are you sure?", "Think again, Your Majesty", "The moon disagrees", "Error 404: No not found"). Yes grows 10% each attempt. After `noMaxAttempts` (6) the No turns into a second Yes.
- **Yes button** opens a confirm sheet: "Promise?" → **Yes, I'm yours** (confirm). Then: music `yes.mp3`, heart confetti, headline "Then let's plan a date" and smooth scroll into the planner.

## Planner shell (LANE‑12)
- Layout: a royal "menu & cart". Mobile: one step per screen with a sticky bottom cart bar ("3 items in your royal cart"). Desktop: steps left, cart right.
- **Free navigation:** a step rail (chips) at top lets her jump to any step; swipe left/right on mobile; Back/Next buttons. Every choice is editable at any time; the cart updates live. State persists in localStorage.
- Each step has a playful title, options as cards (image or emoji, label, one line, venue suggestion chips), and "Add to the royal cart" feedback (pop SFX + item flies to cart).

## Steps (in order)
1. **activity — "Choose your vibe"**: a single **shape‑shifting button** whose label cycles Shopping → Pickleball → Bowling every 700ms (she "can't choose"). Whatever moment she taps: toast "Why choose? All three are yours, Your Majesty" → all three are added, then a bonus card animates in: **"FREE: Smash Karts battle (Heet vs Tanisha) — added to cart"** with a "Loser buys dessert" note. (Behaviour is configurable: `activity.mode = "all" | "landOn"`.)
2. **cuisine — "What's the Queen craving?"**: Pasta, Pizza, Cheese fondue, Noodles / Pan‑Asian, North Indian, Surprise me. Each card shows 1–3 recommended venues (from `venues.json`, near Nirma University / Sindhu Bhavan Road) with area, known‑for, price for two and a Maps link.
3. **dessert — "Something sweet"**: e.g. Tiramisu, Cheesecake, Gelato, Waffles, Brownie sundae, Chocolate fondue, Kulfi — each with venue suggestions.
4. **heetu — "Choose your man"**: 11th Heetu (with unlimited romance), 1st Sem Heetu, March Heetu, Bestfriend Heetu (but romantic and yours only), Current Heetu. Photo from `heetu-versions/`, a funny "spec sheet" (e.g. "Romance: unlimited · Patience: loading…"), editable in config. She may pick one (or "all of them" Easter egg after 3 taps on the title).
5. **flowers — "Your flowers"**: Red roses, Pink roses, Tulips, Sunflowers, Lilies, Orchids, Baby's breath, Mixed bouquet — each with a one‑line meaning and florist suggestions near SBR.
6. **suggestions — "Your wish, my command"**: free textarea (her ideas, places, anything) + quick chips ("Long drive", "Sunset", "Just talk").
7. **review — "Your royal cart"**: grouped list, edit/remove per item, jump back to any step.
8. **delivery — "Choose your delivery date"**: date picker limited to `delivery.minDaysFromToday` … `delivery.maxDaysFromToday`, plus time slots (Brunch, Evening, Sunset, Night). Then **Confirm order**.

## Order confirmed (LANE‑14)
- Royal decree/receipt card: order number (e.g. `#TANISHA‑FOREVER‑001`), items, date & slot, her suggestions, signature "Yours, Heetu".
- Copy: "Order confirmed with all my love. Delivery guaranteed — by hand, with flowers, on time."
- Actions: **Send to Heetu** (WhatsApp pre‑filled), **Save receipt** (PNG), **Edit order** (back to review).
- Celebration: heart confetti + `chime`, then gentle final screen: a closing line + small photo collage.
