import { Button } from '@/design';
import { STEP_ORDER, usePlannerStore } from '@/state/plannerStore';
import { StepTitle } from './StepTitle';
import { Thumb, optionFor } from './Thumb';
import { STEP_LABEL, planner } from './types';
import { venueById } from './venues';

export function ReviewStep() {
  const cart = usePlannerStore((s) => s.cart);
  const suggestions = usePlannerStore((s) => s.suggestions);
  const { remove, goTo, next } = usePlannerStore.getState();
  return (
    <div>
      <StepTitle>{planner.steps.review.title}</StepTitle>
      {cart.length === 0 && (
        <p className="pl-note">
          Your royal cart is empty.{' '}
          <button type="button" className="pl-link" onClick={() => goTo('activity')}>Start with your vibe</button>
        </p>
      )}
      <div>
        {STEP_ORDER.map((sid) => {
          const items = cart.filter((c) => c.stepId === sid);
          if (!items.length) return null;
          return (
            <section key={sid} aria-label={STEP_LABEL[sid]} className="pl-sec">
              <header>
                <h3 className="pl-label m-0">{STEP_LABEL[sid]}</h3>
                <button type="button" className="pl-link" onClick={() => goTo(sid)}>Edit</button>
              </header>
              <ul className="pl-list">
                {items.map((c) => (
                  <li key={c.optionId} className="pl-item">
                    <span aria-hidden className="pl-tile"><Thumb option={optionFor(c.stepId, c.optionId)} fallback={c.bonus ? '🎁' : '✦'} /></span>
                    <span className="pl-item-main">
                      {c.label}{c.bonus && ' 🎁'}
                      {(c.note || c.venueId) && <small>{[venueById(c.venueId)?.name, c.note].filter(Boolean).join(' · ')}</small>}
                    </span>
                    <button type="button" aria-label={`Remove ${c.label}`} className="pl-x" onClick={() => remove(c.stepId, c.optionId)}>✕</button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {suggestions.trim() && (
          <section aria-label="Wishes" className="pl-sec">
            <header><h3 className="pl-label m-0">Your wishes</h3></header>
            <p className="pl-wish">{suggestions}</p>
          </section>
        )}
      </div>
      <div className="mt-8"><Button variant="primary" onClick={next}>Choose delivery date</Button></div>
    </div>
  );
}
