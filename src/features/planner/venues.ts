import seed from '../../../content/config/venues.seed.json';
import type { PlannerOptionX, VenueRec } from './types';

// LANE-13 builds src/data/venues.json; until then fall back to the seed.
const built = import.meta.glob('/src/data/venues.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const pick = (d: unknown): VenueRec[] => (Array.isArray(d) ? d : ((d as { venues?: VenueRec[] } | undefined)?.venues ?? []));
const builtList = pick(Object.values(built)[0]);
const all: VenueRec[] = builtList.length ? builtList : pick(seed);

/** Unverified venues never reach her: they only show in dev builds. */
const visible = all.filter((v) => v.verified || import.meta.env.DEV);

export function venuesFor(option: PlannerOptionX): VenueRec[] {
  return visible
    .filter((v) => option.venueIds?.includes(v.id) || v.forOptions?.includes(option.id))
    .slice(0, 3);
}
export const venueById = (id?: string) => (id ? all.find((v) => v.id === id) : undefined);
export const mapsLink = (v: VenueRec) =>
  v.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.name} ${v.address ?? v.area} Ahmedabad`)}`;
