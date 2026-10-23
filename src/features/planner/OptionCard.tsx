import { motion } from 'motion/react';
import type { PlannerStepId } from '@/contracts';
import { VenueChips } from './VenueChips';
import { Thumb } from './Thumb';
import type { PlannerOptionX } from './types';

export interface OptionCardProps {
  stepId: PlannerStepId;
  option: PlannerOptionX;
  /** Kept for API compatibility; the minimal theme draws no layer labels. */
  layer?: string;
  selected: boolean;
  venueId?: string;
  onSelect: () => void;
  onVenue: (venueId: string) => void;
}

/** One row of the cart-style list: photo tile, name, add pill. The tile flies to the cart through a shared layoutId. */
export function OptionCard({ stepId, option, selected, venueId, onSelect, onVenue }: OptionCardProps) {
  const tile = (
    <Thumb option={option}>
      {selected && <span aria-hidden className="pl-tile-check">✓</span>}
    </Thumb>
  );
  return (
    <li className="pl-row">
      <button type="button" onClick={onSelect} aria-pressed={selected} className="pl-row-btn">
        {selected ? (
          <span aria-hidden className="pl-tile">{tile}</span>
        ) : (
          <motion.span aria-hidden layoutId={`fly-${stepId}-${option.id}`} className="pl-tile">{tile}</motion.span>
        )}
        <span>
          <span className="pl-name">{option.label}</span>
          {option.description && <span className="pl-desc">{option.description}</span>}
        </span>
        <span className="pl-pill">{selected ? 'In cart' : 'Add to the royal cart'}</span>
      </button>
      {option.specs && (
        <ul className="pl-specs">
          {option.specs.map((s, i) => <li key={`${i}-${s}`}>{s}</li>)}
        </ul>
      )}
      <VenueChips option={option} selectedVenueId={venueId} onPick={onVenue} />
    </li>
  );
}
