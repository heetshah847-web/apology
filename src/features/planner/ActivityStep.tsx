import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button, Toast } from '@/design';
import { audioDirector } from '@/engine';
import type { CartItem } from '@/contracts';
import { usePlannerStore } from '@/state/plannerStore';
import { StepTitle } from './StepTitle';
import { planner } from './types';

const cfg = planner.steps.activity;

export function ActivityStep() {
  const cart = usePlannerStore((s) => s.cart);
  const mine = cart.filter((c) => c.stepId === 'activity');
  const chosen = mine.length > 0;
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (chosen) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % cfg.options.length), cfg.cycleMs);
    return () => clearInterval(t);
  }, [chosen]);

  const choose = () => {
    const picks = cfg.mode === 'all' ? cfg.options : [cfg.options[idx]];
    const items: CartItem[] = picks.map((o) => ({ stepId: 'activity', optionId: o.id, label: o.label }));
    items.push({ stepId: 'activity', optionId: cfg.bonus.id, label: cfg.bonus.label, note: cfg.bonus.note, bonus: true });
    usePlannerStore.getState().replace('activity', items);
    audioDirector.sfx('pop');
    setToast(true);
  };

  const current = cfg.options[idx];
  return (
    <div>
      <StepTitle>{cfg.title}</StepTitle>
      {!chosen && (
        <div className="mt-10 flex justify-center">
          <Button variant="primary" size="lg" onClick={choose} className="min-w-[14rem]" aria-label={`Choose ${current.label}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={current.id} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.13 }}>
                {current.emoji} {current.label}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      )}
      {chosen && (
        <div className="mt-6 grid gap-4">
          <div className="flex flex-wrap gap-3">
            {mine.filter((m) => !m.bonus).map((m) => {
              const o = cfg.options.find((x) => x.id === m.optionId);
              return (
                <motion.span key={m.optionId} layoutId={`fly-activity-${m.optionId}`} className="rounded-full px-5 py-2 text-[length:var(--text-ui)] font-semibold" style={{ background: 'var(--blush)', color: 'var(--ink)' }}>
                  {o?.emoji} {m.label}
                </motion.span>
              );
            })}
          </div>
          {mine.some((m) => m.bonus) && (
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 20 }}>
              <div className="mt-6" style={{ background: 'var(--blush)', padding: '1.25rem 1.5rem', borderTop: '4px solid var(--ink)' }}>
                <p className="pl-label mb-2">Bonus</p>
                <p className="m-0 text-xl" style={{ fontFamily: 'var(--font-display)' }}>{cfg.bonus.emoji} {cfg.bonus.label}: added to cart</p>
                {cfg.bonus.note && <p className="pl-note m-0 mt-1" style={{ color: '#5a5054' }}>{cfg.bonus.note}</p>}
              </div>
            </motion.div>
          )}
          <div><Button variant="ghost" onClick={() => usePlannerStore.getState().clearStep('activity')}>Choose again</Button></div>
        </div>
      )}
      <Toast open={toast} onClose={() => setToast(false)}>{cfg.toast}</Toast>
    </div>
  );
}
