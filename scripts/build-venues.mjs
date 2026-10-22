// LANE-13: validates src/data/venues.json and src/data/venue-map.json against the Venue contract
// and the option ids in content/config/planner.config.json. Exits 1 on any error.
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const venues = read('src/data/venues.json');
const map = read('src/data/venue-map.json');
const planner = read('content/config/planner.config.json');

const errors = [];
const str = (v) => typeof v === 'string' && v.length > 0;
const optional = ['address', 'mapsUrl', 'priceForTwo', 'notes'];

const ids = new Set();
for (const [i, v] of venues.entries()) {
  const at = `venues[${i}] (${v?.id ?? '?'})`;
  if (!str(v.id)) errors.push(`${at}: id must be a non-empty string`);
  if (ids.has(v.id)) errors.push(`${at}: duplicate id`);
  ids.add(v.id);
  for (const k of ['name', 'area']) if (!str(v[k])) errors.push(`${at}: ${k} must be a non-empty string`);
  for (const k of optional) if (k in v && !str(v[k])) errors.push(`${at}: ${k} must be a non-empty string if present`);
  if (!Array.isArray(v.knownFor) || !v.knownFor.every(str)) errors.push(`${at}: knownFor must be string[]`);
  if (typeof v.verified !== 'boolean') errors.push(`${at}: verified must be boolean`);
  if (!Array.isArray(v.sources) || v.sources.length === 0 || !v.sources.every(str)) errors.push(`${at}: sources must be a non-empty string[]`);
  if (v.verified && (v.sources?.length ?? 0) < 2) errors.push(`${at}: verified needs at least 2 sources`);
  const known = new Set(['id', 'name', 'area', 'knownFor', 'verified', 'sources', ...optional]);
  for (const k of Object.keys(v)) if (!known.has(k)) errors.push(`${at}: unknown field "${k}"`);
}

const optionIds = new Set();
for (const step of ['activity', 'cuisine', 'dessert']) for (const o of planner.steps[step].options) optionIds.add(o.id);

for (const [opt, list] of Object.entries(map)) {
  if (!optionIds.has(opt)) errors.push(`venue-map: "${opt}" is not an option in planner.config.json`);
  if (!Array.isArray(list)) { errors.push(`venue-map: "${opt}" must be an array`); continue; }
  if (list.length > 5) errors.push(`venue-map: "${opt}" has ${list.length} venues (max 5)`);
  for (const id of list) if (!ids.has(id)) errors.push(`venue-map: "${opt}" references unknown venue "${id}"`);
}
for (const opt of optionIds) if (!(opt in map)) errors.push(`venue-map: option "${opt}" is missing (use [] for no match)`);

const used = new Set(Object.values(map).flat());
for (const id of ids) if (!used.has(id)) console.warn(`warn: venue "${id}" is not mapped to any option`);

const empty = [...optionIds].filter((o) => map[o]?.length === 0);
if (empty.length) console.log(`no match found for: ${empty.join(', ')}`);
const unverified = venues.filter((v) => !v.verified).length;
console.log(`${venues.length} venues (${unverified} unverified), ${Object.keys(map).length} options mapped`);

if (errors.length) {
  console.error(errors.map((e) => `error: ${e}`).join('\n'));
  process.exit(1);
}
console.log('venues OK');
