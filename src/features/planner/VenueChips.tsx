import type { PlannerOptionX } from './types';
import { mapsLink, venuesFor } from './venues';

/** Recommended venues for an option; tapping a chip picks that venue, the link opens Maps. */
export function VenueChips({ option, selectedVenueId, onPick }: { option: PlannerOptionX; selectedVenueId?: string; onPick: (venueId: string) => void }) {
  const venues = venuesFor(option);
  if (!venues.length) return null;
  return (
    <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
      {venues.map((v) => (
        <li key={v.id} className="flex items-stretch overflow-hidden rounded-[10px] text-left text-[length:var(--text-label)]" style={{ border: `1px solid ${selectedVenueId === v.id ? 'var(--accent)' : 'var(--line)'}` }}>
          <button type="button" aria-pressed={selectedVenueId === v.id} onClick={() => onPick(v.id)} className="flex-1 bg-transparent px-3 py-2 text-left" style={{ color: 'var(--ink)' }}>
            <strong className="block text-[length:var(--text-ui)]">{v.name}{!v.verified && ' (unverified)'}</strong>
            <span style={{ color: 'var(--ink-soft)' }}>{v.area}{v.priceForTwo ? ` · ${v.priceForTwo}` : ''}</span>
            {v.knownFor.length > 0 && <span className="block" style={{ color: 'var(--ink-faint)' }}>Known for {v.knownFor.slice(0, 3).join(', ')}</span>}
          </button>
          <a href={mapsLink(v)} target="_blank" rel="noopener noreferrer" aria-label={`${v.name} on Google Maps`} className="flex items-center px-3 no-underline" style={{ borderLeft: '1px solid var(--line)', color: 'var(--accent)' }}>
            Maps ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
