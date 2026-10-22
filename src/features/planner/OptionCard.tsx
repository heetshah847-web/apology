import { useState } from 'react';
import { motion } from 'motion/react';
import type { PlannerStepId } from '@/contracts';
import { FrameOutline } from '@/design';
import { VenueChips } from './VenueChips';
import type { PlannerOptionX } from './types';

export interface OptionCardProps {
  stepId: PlannerStepId;
  option: PlannerOptionX;
  layer: string;
  selected: boolean;
  venueId?: string;
  onSelect: () => void;
  onVenue: (venueId: string) => void;
}

/** Option card inside a design-tool frame. The badge flies to the cart through a shared layoutId. */
export function OptionCard({ stepId, option, layer, selected, venueId, onSelect, onVenue }: OptionCardProps) {
  const [imgOk, setImgOk] = useState(true);
  const hasImage = !!option.image && imgOk;
  return (
    <FrameOutline label={layer} className="mt-10">
      <div className="p-4 text-left" style={{ background: selected ? 'color-mix(in oklab, var(--accent) 14%, var(--stage-deep))' : 'var(--stage-deep)' }}>
        <button type="button" onClick={onSelect} aria-pressed={selected} className="flex w-full items-center gap-4 bg-transparent p-0 text-left" style={{ color: 'var(--ink)' }}>
          {hasImage ? (
            <img src={`/media/${option.image}.jpg`} alt="" loading="lazy" onError={() => setImgOk(false)} className="h-20 w-20 shrink-0 rounded-[10px] object-cover" />
          ) : selected ? (
            <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-2xl" style={{ background: 'var(--accent)', color: 'var(--night-ink)' }}>✓</span>
          ) : (
            <motion.span layoutId={`fly-${stepId}-${option.id}`} className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-3xl" style={{ background: 'var(--stage)' }}>{option.emoji ?? option.label[0]}</motion.span>
          )}
          <span className="flex-1">
            <span className="block text-xl" style={{ fontFamily: 'var(--font-display)' }}>{option.label}</span>
            {option.description && <span className="block text-[length:var(--text-ui)]" style={{ color: 'var(--ink-soft)' }}>{option.description}</span>}
          </span>
          <span className="shrink-0 rounded-full px-3 py-1 text-[length:var(--text-label)] font-semibold" style={{ background: selected ? 'var(--accent)' : 'transparent', color: selected ? 'var(--night-ink)' : 'var(--accent)', border: '1px solid var(--accent)' }}>
            {selected ? 'In cart' : 'Add to the royal cart'}
          </span>
        </button>
        {option.specs && (
          <ul className="m-0 mt-3 list-none p-0 text-[length:var(--text-label)]" style={{ color: 'var(--ink-faint)' }}>
            {option.specs.map((s) => <li key={s}>{s}</li>)}
          </ul>
        )}
        <VenueChips option={option} selectedVenueId={venueId} onPick={onVenue} />
      </div>
    </FrameOutline>
  );
}
