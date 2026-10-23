import type { PlannerOptionX } from './types';
import { mapsLink, venuesFor } from './venues';

/** Recommended venues for an option; tapping a chip picks that venue, the link opens Maps. */
export function VenueChips({ option, selectedVenueId, onPick }: { option: PlannerOptionX; selectedVenueId?: string; onPick: (venueId: string) => void }) {
  const venues = venuesFor(option);
  if (!venues.length) return null;
  return (
    <ul className="pl-venues">
      {venues.map((v) => (
        <li key={v.id} className="pl-venue" data-on={selectedVenueId === v.id}>
          <button type="button" aria-pressed={selectedVenueId === v.id} onClick={() => onPick(v.id)}>
            <strong>{v.name}{!v.verified && ' (unverified)'}</strong>
            <span>{v.area}{v.priceForTwo ? ` · ${v.priceForTwo}` : ''}</span>
            {v.knownFor.length > 0 && <span className="block">Known for {v.knownFor.slice(0, 3).join(', ')}</span>}
          </button>
          <a href={mapsLink(v)} target="_blank" rel="noopener noreferrer" aria-label={`${v.name} on Google Maps`}>Maps ↗</a>
        </li>
      ))}
    </ul>
  );
}
