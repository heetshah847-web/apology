import { useEffect, useRef, useState, type ReactNode } from 'react';
import { audioDirector } from '@/engine';
import type { CartItem, PlannerStepId } from '@/contracts';
import { usePlannerStore } from '@/state/plannerStore';
import { OptionCard } from './OptionCard';
import { StepTitle } from './StepTitle';
import { planner, type PlannerOptionX } from './types';

const toItem = (stepId: PlannerStepId, o: PlannerOptionX): CartItem => ({ stepId, optionId: o.id, label: o.label });

interface PickStepProps {
  stepId: PlannerStepId;
  onTitleTap?: () => void;
  extra?: ReactNode;
  /** Return true to swallow the selection (custom behaviour). */
  onSelectOption?: (o: PlannerOptionX) => boolean;
}

/** Shared single-pick option grid (cuisine / dessert / heetu / flowers). Tapping a selected card removes it. */
function PickStep({ stepId, onTitleTap, extra, onSelectOption }: PickStepProps) {
  const cfg = planner.steps[stepId];
  const cart = usePlannerStore((s) => s.cart);
  const { replace, clearStep, setVenue } = usePlannerStore.getState();
  const mine = cart.filter((c) => c.stepId === stepId);
  return (
    <div>
      <StepTitle onClick={onTitleTap}>{cfg.title}</StepTitle>
      {extra}
      {mine.length === 0 && <p className="pl-note">Nothing chosen yet. Pick one, Your Majesty.</p>}
      <div aria-hidden className="pl-cols"><span>Item</span><span>Selection</span></div>
      <ul className="pl-list">
        {cfg.options!.map((o) => {
          const item = mine.find((c) => c.optionId === o.id);
          return (
            <OptionCard
              key={o.id} stepId={stepId} option={o}
              selected={!!item} venueId={item?.venueId}
              onSelect={() => {
                if (item) return clearStep(stepId);
                if (onSelectOption?.(o)) return;
                replace(stepId, toItem(stepId, o));
                audioDirector.sfx('pop');
              }}
              onVenue={(venueId) => {
                if (!item) replace(stepId, { ...toItem(stepId, o), venueId });
                else setVenue(stepId, o.id, item.venueId === venueId ? undefined : venueId);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
}

const DICE = ['🎲', '🍝', '🍕', '🧀', '🍜', '🍛'];

export function CuisineStep() {
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(DICE[0]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => { clearInterval(t); clearTimeout(t); }), []);

  const roll = () => {
    const pool = planner.steps.cuisine.options!.filter((o) => o.id !== 'surprise');
    setRolling(true);
    const iv = window.setInterval(() => setFace(DICE[Math.floor(Math.random() * DICE.length)]), 90);
    const to = window.setTimeout(() => {
      clearInterval(iv);
      const o = pool[Math.floor(Math.random() * pool.length)];
      usePlannerStore.getState().replace('cuisine', { ...toItem('cuisine', o), note: 'Chosen by the dice' });
      audioDirector.sfx('pop');
      setRolling(false);
    }, 1000);
    timers.current.push(iv, to);
  };

  return (
    <PickStep
      stepId="cuisine"
      onSelectOption={(o) => { if (o.id !== 'surprise' || rolling) return o.id === 'surprise'; roll(); return true; }}
      extra={rolling && <div role="status" aria-label="Rolling the dice" className="my-3 text-center text-6xl motion-safe:animate-bounce">{face}</div>}
    />
  );
}
export const DessertStep = () => <PickStep stepId="dessert" />;
export const FlowersStep = () => <PickStep stepId="flowers" />;

export function HeetuStep() {
  const taps = useRef(0);
  const allOfThem = () => {
    if (++taps.current < 3) return;
    taps.current = 0;
    const opts = planner.steps.heetu.options!;
    usePlannerStore.getState().replace('heetu', opts.map((o) => ({ ...toItem('heetu', o), note: 'All of them. Obviously.' })));
    audioDirector.sfx('chime');
  };
  return <PickStep stepId="heetu" onTitleTap={allOfThem} />;
}

/** Punishment menu: unlike the other pick steps, any number of penalties can be added (tap again to remove). */
export function PunishStep() {
  const cfg = planner.steps.punish;
  const cart = usePlannerStore((s) => s.cart);
  const mine = cart.filter((c) => c.stepId === 'punish');
  return (
    <div>
      <StepTitle>{cfg.title}</StepTitle>
      <p className="mb-4 mt-0 text-[length:var(--text-ui)]" style={{ color: 'var(--ink-faint)' }}>
        {mine.length ? `${mine.length} chosen. Stack as many as he deserves.` : 'Pick as many as he deserves, Your Majesty.'}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {cfg.options!.map((o) => (
          <OptionCard
            key={o.id} stepId="punish" option={o} layer={`${STEP_LABEL.punish} / ${o.label}`}
            selected={mine.some((c) => c.optionId === o.id)}
            onSelect={() => {
              const { add, remove } = usePlannerStore.getState();
              if (mine.some((c) => c.optionId === o.id)) return remove('punish', o.id);
              add(toItem('punish', o));
              audioDirector.sfx('pop');
            }}
            onVenue={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
