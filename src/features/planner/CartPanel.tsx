import { motion } from 'motion/react';
import { Button } from '@/design';
import { STEP_ORDER, usePlannerStore } from '@/state/plannerStore';
import { Thumb, optionFor } from './Thumb';
import { planner } from './types';

/** The royal cart list. Items share layoutIds with the option tiles, so they fly in. */
export function CartList({ compact }: { compact?: boolean }) {
  const cart = usePlannerStore((s) => s.cart);
  const remove = usePlannerStore.getState().remove;
  if (!cart.length) return <p className="pl-empty m-0">Your royal cart is waiting, Your Majesty.</p>;
  const sorted = [...cart].sort((a, b) => STEP_ORDER.indexOf(a.stepId) - STEP_ORDER.indexOf(b.stepId));
  return (
    <ul className="pl-sum-list">
      {sorted.map((c) => (
        <li key={`${c.stepId}-${c.optionId}`} className="pl-sum-item">
          <motion.span layoutId={`fly-${c.stepId}-${c.optionId}`} aria-hidden className="pl-tile">
            <Thumb option={optionFor(c.stepId, c.optionId)} fallback={c.bonus ? planner.steps.activity.bonus.emoji : '✦'} />
          </motion.span>
          <span className="pl-sum-label">{c.label}</span>
          {!compact && <button type="button" aria-label={`Remove ${c.label}`} className="pl-x" onClick={() => remove(c.stepId, c.optionId)}>✕</button>}
        </li>
      ))}
    </ul>
  );
}

export function CartColumn() {
  const count = usePlannerStore((s) => s.cart.length);
  const step = usePlannerStore((s) => s.currentStep);
  const goTo = usePlannerStore.getState().goTo;
  return (
    <aside aria-label="Royal cart" className="pl-summary">
      <div className="pl-summary-in">
        <div className="pl-rule" />
        <div className="pl-total">
          <h3 className="pl-label m-0">Your royal cart</h3>
          <strong>{count} {count === 1 ? 'item' : 'items'}</strong>
        </div>
        <CartList />
        <div className="pl-btns">
          {step !== 'review' && step !== 'delivery' && <Button variant="primary" onClick={() => goTo('review')} disabled={count === 0}>Review order</Button>}
          {step !== 'delivery' && <Button variant="ghost" onClick={() => goTo('delivery')}>Delivery date</Button>}
        </div>
      </div>
    </aside>
  );
}
