# LANE‑12 — Date planner: "The Royal Order"
**Wave 1 or 2 · parallel (independent of the story; can be built on its own route `/planner`)**

## Read
`docs/06-DATE-PLANNER-SPEC.md` (all), `content/config/planner.config.json`, contracts `Planner*`, `CartItem`, `Venue`.

## Scroll UI rules
Option cards use `FrameOutline` with layer labels (`Cuisine / Pasta`), like the reference's work cards. Step changes still feel like the same smooth scroll family (`docs/08-SCROLL-UI-SPEC.md`).

## Tasks
- [x] `src/state/plannerStore.ts` (Zustand + persist `atlas-planner-v1`): `currentStep`, `cart: CartItem[]`, `suggestions`, `delivery`, actions `add/replace/remove`, `goTo(step)`, `next/prev`, `reset`
- [x] Copy config → `src/data/planner.json` at build (or import JSON directly) 
- [x] `PlannerShell`: step rail (jump anywhere), swipe on mobile (Motion `drag="x"` with threshold), Back/Next, sticky cart bar (mobile) / cart column (desktop), AnimatePresence step transitions (direction-aware)
- [x] Steps: `ActivityStep` (shape-shifting button + bonus Smash Karts card; respects `activity.mode`), `CuisineStep`, `DessertStep`, `HeetuStep`, `FlowersStep`, `SuggestionsStep`, `ReviewStep`, `DeliveryStep` (react-day-picker, min/max days, slots)
- [x] `VenueChips` showing recommended venues (from `src/data/venues.json`; fall back to `venues.seed.json` if not built) with Maps link
- [x] "Add to the royal cart" micro-interaction: card → cart fly animation (Motion `layoutId`), pop SFX
- [x] On confirm in Delivery → `storyStore.orderPlaced = true` and hand an `Order` object to LANE‑14's `OrderConfirmed` (via store)
- [x] Empty/edge states: nothing selected → gentle prompt; Surprise me → picks a random option with a dice animation

## Acceptance
- Back-and-forth editing keeps state; refresh keeps state
- Works fully at `/planner` without the story
- Playwright test walks all steps and produces a valid `Order`
