# Venue research (LANE-13)

Checked: **2026-10-23**. Method: web search of aggregator listings (EazyDiner, Wanderlog, ThreeBestRated, Swiggy, Pickleheads, Lyfskills, WeddingWire, Wikipedia). No Zomato pages were reachable. Ratings are as shown on those pages on the check date and may be stale.

**Status: all 35 venues are `verified: false`.** Nothing has two independent sources confirming it is open today, so none may be shown to Tanisha until Heet confirms it (or sets `verified: true` after calling or checking Google Maps).

`mapsUrl` values are Google Maps *search* links built from the venue name, not pinned places, so open them and pick the right result. No address was invented: venues without a confirmed address have none, and unknown areas are marked `VERIFY`.

## Option → venues (`src/data/venue-map.json`)

| Option | Venues | Notes |
|---|---|---|
| shopping | Palladium Ahmedabad, Ahmedabad One Mall, Gulmohar Park Mall | Palladium is on SG Highway, Thaltej |
| pickleball | SBR Pickleball by Colosseum, Ballers, Hi5ers, Pickle Play | Ballers' address differs between directories |
| bowling | SHOTT, Fungrito, FunZone (Himalaya Mall) | SHOTT reported temporarily closed; Fungrito has no address |
| pasta | Mocha, Huber & Holly, Cafe De Italiano, Sale & Pepe, The Green Pearl | Green Pearl has only 9 reviews |
| pizza | Pizzaiiolo, Little Italy, The Blue Oven, Huber & Holly | Pizzaiiolo Google 4.8 from ~7.3K ratings (EazyDiner) |
| noodles | Ishaara, CHA, MAD By Tomato's, Banjara | Noodle dishes unconfirmed; all pricey |
| north-indian | Tandoori Shala, Piquant, Birmies, Punjab Grill, Millenium Quality | Tandoor Story and Legends Of Punjab kept in `venues.json` as spare |
| tiramisu | The Chocolate Room, Little Italy, Cacaoté | Only Little Italy's and the Chocolate Room's listings mention tiramisu |
| cheesecake | Moi – The Dessert Studio, Makeba | Only 2 found; both with caveats |
| gelato | Creamoholic, Huber & Holly | Only 2 found |
| waffles | The Pancake Story, Creamoholic, Cafe De Italiano, Huber & Holly | |
| brownie-sundae | Huber & Holly, Creamoholic | Only 2 found |
| fondue | none | **No good match found**: no Ahmedabad restaurant serving cheese fondue turned up |
| choco-fondue | none | **No good match found**: Cacaoté and The Chocolate Room are chocolate cafés but no fondue is listed |
| kulfi | none | **No good match found** near Thaltej/Bodakdev. Farki (Delhi Darwaja), Asharfi Kulfi (Paldi) and BastiRam exist elsewhere in the city |
| surprise | none | Not a venue option |

Flowers are not mapped to venues (Heet asked for flower-type placeholders only). Florists seen, if ever wanted: Ferns N Petals (Thaltej, two conflicting addresses), Bs Flowers (Satellite, 4.9 from 33 ratings).

## Gaps

- Nothing confirmed on the Nirma University (Chharodi / Gota) side. The only nearby hit was Coffee Carnival (SG Highway, Vasant Nagar, Gota, 4.6 from 128 reviews), a coffee shop, not mapped.
- Several venues have a single source, or two sources that are both EazyDiner.
- Dish photos are not venue photos: the option images in `public/media/options/` are illustrations drawn for the planner.

## Next steps for Heet

1. Strike any venue you know is wrong.
2. For each one you vouch for (or confirm on Google Maps), set `verified: true` in `src/data/venues.json`.
3. Run `node scripts/build-venues.mjs` to validate.
