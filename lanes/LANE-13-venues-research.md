# LANE‑13 — Venue research & recommendation data (Ahmedabad)
**Wave 1 · parallel · no UI**

## Goal
For every cuisine, dessert and flower option in `planner.config.json`, find the best-known / best-reviewed places **near Nirma University (SG Highway, Chharodi/Gota side) or on Sindhu Bhavan Road (Bodakdev/Thaltej)**, plus venues for Shopping, Pickleball and Bowling.

## Rules
- Use web search. Prefer recent sources (last 12 months): Google Maps listings, Zomato/Swiggy/EazyDiner pages, local food blogs. Cross-check each venue in ≥ 2 sources.
- For each venue record: name, area, address, Maps URL, known-for dishes, price for two (if stated), rating source + date, `verified: true` only if 2 sources agree it is open.
- Mark anything uncertain `verified: false` with a note. Never invent addresses or ratings.
- Seeds to check first are in `content/config/venues.seed.json` (unverified, gathered quickly — they may be closed or wrong).
- Max 3 venues per option; at least 1 should be on/near Sindhu Bhavan Road.
- Before writing, **show Heet the shortlist table and ask him to approve** (he knows her taste and the places).

## Output
- `src/data/venues.json` (array of `Venue`) + mapping `optionId → venueIds[]` in `src/data/venue-map.json`
- `docs/VENUE-RESEARCH.md` with sources per venue and the date checked
- `scripts/build-venues.mjs` validates the JSON against contracts

## Acceptance
- Every option has ≥ 1 verified venue or a clear "no good match found" note
