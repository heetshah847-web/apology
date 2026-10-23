import { useEffect, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, MotionConfig, motion, type PanInfo } from 'motion/react';
import { Button, Sheet } from '@/design';
import type { PlannerStepId } from '@/contracts';
import { STEP_ORDER, usePlannerStore } from '@/state/plannerStore';
import { ActivityStep } from './ActivityStep';
import { CartColumn, CartList } from './CartPanel';
import { CuisineStep, DessertStep, FlowersStep, HeetuStep, PunishStep } from './OptionSteps';
import { DeliveryStep } from './DeliveryStep';
import { ReviewStep } from './ReviewStep';
import { SuggestionsStep } from './SuggestionsStep';
import { STEP_LABEL } from './types';
import './planner.css';

const STEPS: Record<PlannerStepId, ComponentType> = {
  activity: ActivityStep, cuisine: CuisineStep, dessert: DessertStep, heetu: HeetuStep,
  flowers: FlowersStep, punish: PunishStep, suggestions: SuggestionsStep, review: ReviewStep, delivery: DeliveryStep,
};

function useDesktop() {
  const q = '(min-width: 1024px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return m;
}

const SWIPE_PX = 80;

export function PlannerShell() {
  const step = usePlannerStore((s) => s.currentStep);
  const count = usePlannerStore((s) => s.cart.length);
  const { goTo, next, prev } = usePlannerStore.getState();
  const desktop = useDesktop();
  const [cartOpen, setCartOpen] = useState(false);
  const idx = STEP_ORDER.indexOf(step);
  const prevIdx = useRef(idx);
  const dir = idx >= prevIdx.current ? 1 : -1;
  useEffect(() => { prevIdx.current = idx; }, [idx]);
  const Step = STEPS[step];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_PX && Math.abs(info.offset.y) < 60) next();
    else if (info.offset.x > SWIPE_PX && Math.abs(info.offset.y) < 60) prev();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="pl-page">
        <div className="pl-card">
          <div className="pl-main">
            <p className="pl-eyebrow">The Royal Order</p>
            <nav aria-label="Planner steps" className="pl-tabs">
              {STEP_ORDER.map((s, i) => (
                <button key={s} type="button" onClick={() => goTo(s)} aria-current={s === step ? 'step' : undefined} className="pl-tab">
                  {i + 1}. {STEP_LABEL[s]}
                </button>
              ))}
            </nav>

            <div className="min-w-0 overflow-x-clip">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={step} custom={dir}
                  variants={{ enter: (d: number) => ({ opacity: 0, x: 48 * d }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: -48 * d }) }}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  drag="x" dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={onDragEnd}
                >
                  <Step />
                </motion.div>
              </AnimatePresence>

              <div className="pl-foot">
                <Button variant="ghost" onClick={prev} disabled={idx === 0}>← Back</Button>
                <span className="pl-count">{idx + 1} / {STEP_ORDER.length}</span>
                <Button variant="primary" onClick={next} disabled={idx === STEP_ORDER.length - 1}>Next →</Button>
              </div>
            </div>
          </div>

          {desktop && <CartColumn />}
        </div>

        {!desktop && (
          <>
            <button
              type="button" onClick={() => setCartOpen(true)} aria-label="Open royal cart"
              className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between px-[var(--gutter)] py-4 text-left text-[length:var(--text-ui)]"
              style={{ background: 'var(--blush)', borderTop: '3px solid var(--ink)', color: 'var(--ink)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <span>{count === 0 ? 'Your royal cart is empty' : `${count} item${count === 1 ? '' : 's'} in your royal cart`}</span>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em]">View ↑</span>
            </button>
            <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title="Your royal cart">
              <CartList />
              <div className="mt-5 flex gap-3">
                <Button variant="ghost" onClick={() => setCartOpen(false)}>Keep browsing</Button>
                <Button variant="primary" onClick={() => { goTo('review'); setCartOpen(false); }}>Review</Button>
              </div>
            </Sheet>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
