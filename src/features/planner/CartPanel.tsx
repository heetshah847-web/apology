import { motion } from 'motion/react';
import { STEP_ORDER, usePlannerStore } from '@/state/plannerStore';
import { planner } from './types';

const emojiFor = (stepId: string, optionId: string, bonusEmoji?: string) =>
  planner.steps[stepId as keyof typeof planner.steps]?.options?.find((o) => o.id === optionId)?.emoji ?? bonusEmoji ?? '✦';

/** The royal cart list. Items share layoutIds with the option badges, so they fly in. */
export function CartList({ compact }: { compact?: boolean }) {
  const cart = usePlannerStore((s) => s.cart);
  const remove = usePlannerStore.getState().remove;
  if (!cart.length) return <p className="m-0 text-[length:var(--text-ui)]" style={{ color: 'var(--ink-faint)' }}>Your royal cart is waiting, Your Majesty.</p>;
  const sorted = [...cart].sort((a, b) => STEP_ORDER.indexOf(a.stepId) - STEP_ORDER.indexOf(b.stepId));
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {sorted.map((c) => (
        <li key={`${c.stepId}-${c.optionId}`} className="flex items-center gap-3 text-[length:var(--text-ui)]">
          <motion.span
            layoutId={`fly-${c.stepId}-${c.optionId}`} aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base" style={{ background: 'var(--stage)' }}
          >
            {emojiFor(c.stepId, c.optionId, c.bonus ? planner.steps.activity.bonus.emoji : undefined)}
          </motion.span>
          <span className="flex-1 truncate">{c.label}</span>
          {!compact && <button type="button" aria-label={`Remove ${c.label}`} className="bg-transparent p-1" style={{ color: 'var(--ink-soft)' }} onClick={() => remove(c.stepId, c.optionId)}>✕</button>}
        </li>
      ))}
    </ul>
  );
}

export function CartColumn() {
  const count = usePlannerStore((s) => s.cart.length);
  return (
    <aside aria-label="Royal cart" className="sticky top-6 self-start rounded-[14px] p-5" style={{ background: 'var(--stage-deep)', border: '1px solid var(--line)' }}>
      <h3 className="m-0 mb-3 text-xl" style={{ fontFamily: 'var(--font-display)' }}>Your royal cart <small style={{ color: 'var(--ink-soft)' }}>({count})</small></h3>
      <CartList />
    </aside>
  );
}
