import { Button } from '@/design';
import { STEP_ORDER, usePlannerStore } from '@/state/plannerStore';
import { StepTitle } from './StepTitle';
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
        <p style={{ color: 'var(--ink-soft)' }}>
          Your royal cart is empty.{' '}
          <button type="button" className="bg-transparent p-0 underline" style={{ color: 'var(--accent)' }} onClick={() => goTo('activity')}>Start with your vibe</button>.
        </p>
      )}
      <div className="mt-4 grid gap-5">
        {STEP_ORDER.map((sid) => {
          const items = cart.filter((c) => c.stepId === sid);
          if (!items.length) return null;
          return (
            <section key={sid} aria-label={STEP_LABEL[sid]}>
              <header className="mb-2 flex items-center justify-between">
                <h3 className="m-0 text-[length:var(--text-label)] uppercase tracking-widest" style={{ color: 'var(--accent)' }}>{STEP_LABEL[sid]}</h3>
                <button type="button" className="bg-transparent p-0 text-[length:var(--text-label)] underline" style={{ color: 'var(--ink-soft)' }} onClick={() => goTo(sid)}>Edit</button>
              </header>
              <ul className="m-0 grid list-none gap-2 p-0">
                {items.map((c) => (
                  <li key={c.optionId} className="flex items-center justify-between gap-3 rounded-[10px] px-4 py-3" style={{ background: 'var(--stage-deep)', border: '1px solid var(--line)' }}>
                    <span>
                      {c.label}{c.bonus && ' 🎁'}
                      {(c.note || c.venueId) && <small className="block" style={{ color: 'var(--ink-soft)' }}>{[venueById(c.venueId)?.name, c.note].filter(Boolean).join(' · ')}</small>}
                    </span>
                    <button type="button" aria-label={`Remove ${c.label}`} className="bg-transparent p-1 text-lg" style={{ color: 'var(--ink-soft)' }} onClick={() => remove(c.stepId, c.optionId)}>✕</button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {suggestions.trim() && (
          <section aria-label="Wishes">
            <h3 className="m-0 mb-2 text-[length:var(--text-label)] uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Your wishes</h3>
            <p className="m-0 whitespace-pre-wrap rounded-[10px] px-4 py-3" style={{ background: 'var(--stage-deep)', border: '1px solid var(--line)' }}>{suggestions}</p>
          </section>
        )}
      </div>
      <div className="mt-6"><Button variant="royal" onClick={next}>Choose delivery date</Button></div>
    </div>
  );
}
