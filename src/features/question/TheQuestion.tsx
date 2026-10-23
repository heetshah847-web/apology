import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button, StatementText } from '@/design';
import { audioDirector } from '@/engine';
import { useScene } from '@/engine/scroll/useScene';
import { useSmoothScroll } from '@/engine/scroll/SmoothScroll';
import { useStoryStore } from '@/state/storyStore';
import planner from '@/data/planner.json';
import { ConfirmSheet } from './ConfirmSheet';
import { celebrate } from './celebrate';
import { HEADER, PAD, useRunaway } from './useRunaway';

const Q = planner.question;
const NO_SHRINK = 0.92; // -8% per attempt
const YES_GROW = 1.1;   // +10% per attempt
const PROXIMITY = 120;  // px from the No button at which it runs (desktop pointer)
const ACTIVE_FROM = 0.6; // scene progress after which the buttons are alive

/** Two balanced lines so the hero type stays on screen with the buttons below it. */
const twoLines = (t: string) => {
  const w = t.split(' ');
  const k = Math.ceil(w.length / 2);
  return `${w.slice(0, k).join(' ')}
${w.slice(k).join(' ')}`;
};

/** The site's closing statement: the biggest type on the page, a runaway No and a growing Yes. */
export function TheQuestion() {
  const { ref, progress } = useScene<HTMLElement>({ lengthVh: 160 });
  const smooth = useSmoothScroll();
  const answeredYes = useStoryStore((s) => s.answeredYes);
  const attempts = useStoryStore((s) => s.noAttempts);
  const incNo = useStoryStore((s) => s.incNoAttempts);
  const setAnsweredYes = useStoryStore((s) => s.setAnsweredYes);
  const [confirming, setConfirming] = useState(false);
  const [alive, setAlive] = useState(false);
  const [slot, setSlot] = useState<{ w: number; h: number } | null>(null);

  const yesRef = useRef<HTMLSpanElement>(null);
  const noRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const avoid = useMemo(() => [yesRef, headRef], []);
  const { pos, run, reset, setPos } = useRunaway(ref, noRef, avoid);

  const exhausted = attempts >= Q.noMaxAttempts;
  const noScale = exhausted ? 1 : NO_SHRINK ** attempts;
  const yesScale = YES_GROW ** Math.min(attempts, Q.noMaxAttempts);
  const noLabel = exhausted ? Q.yesLabel : Q.noLabels[Math.min(attempts, Q.noLabels.length - 1)];

  // The next label can be wider than the one the spot was picked for: keep the button's visible box inside the safe area.
  useLayoutEffect(() => {
    const el = noRef.current, host = ref.current;
    if (!pos || !el || !host) return;
    const a = host.getBoundingClientRect();
    const vw = el.offsetWidth * noScale, vh = el.offsetHeight * noScale;
    const dx = (el.offsetWidth - vw) / 2, dy = (el.offsetHeight - vh) / 2;
    const zl = Math.max(a.left, 0) + PAD, zr = Math.min(a.right, innerWidth) - PAD;
    const zt = Math.max(a.top, 0) + HEADER, zb = Math.min(a.bottom, innerHeight) - PAD;
    const x = Math.min(Math.max(pos.x, zl - a.left - dx), zr - a.left - dx - vw);
    const y = Math.min(Math.max(pos.y, zt - a.top - dy), zb - a.top - dy - vh);
    if (Math.abs(x - pos.x) > 0.5 || Math.abs(y - pos.y) > 0.5) setPos({ x, y });
  }, [pos, noScale, attempts, ref, setPos]);

  useMotionValueEvent(progress, 'change', (p) => setAlive(p >= ACTIVE_FROM));
  const buttonsOpacity = useTransform(progress, [ACTIVE_FROM - 0.12, ACTIVE_FROM], [0, 1]);
  const headlineProgress = useTransform(progress, [0, 0.4], [0, 1], { clamp: true });

  // One attempt: No flees, shrinks and changes its words; Yes grows. The throttle makes one gesture one attempt.
  const attempt = useCallback((pointer?: { x: number; y: number }) => {
    const { noAttempts } = useStoryStore.getState();
    if (noAttempts >= Q.noMaxAttempts) return;
    const r = noRef.current?.getBoundingClientRect();
    if (r && !pos) setSlot({ w: r.width, h: r.height });
    if (!run(pointer, YES_GROW)) return;
    incNo();
    if (noAttempts + 1 >= Q.noMaxAttempts) reset(); // the No becomes a second Yes, back in its slot
  }, [run, incNo, reset, pos]);

  // Desktop: pointer proximity.
  useEffect(() => {
    if (!alive || answeredYes || exhausted) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = noRef.current?.getBoundingClientRect();
      if (!r) return;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < PROXIMITY) attempt({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [alive, answeredYes, exhausted, attempt]);

  const confirm = () => {
    setConfirming(false);
    setAnsweredYes(true);
    audioDirector.music.play('yes');
    celebrate();
    // The planner mounts on answeredYes: wait for it, refresh the pins, then glide in.
    const t0 = performance.now();
    const go = () => {
      const el = document.getElementById('planner');
      if (!el) { if (performance.now() - t0 < 3000) requestAnimationFrame(go); return; }
      ScrollTrigger.refresh();
      setTimeout(() => smooth.scrollTo(el.getBoundingClientRect().top + window.scrollY), 1400);
    };
    requestAnimationFrame(go);
  };

  return (
    <section
      ref={ref}
      id="question"
      data-theme="dawn"
      aria-label="The question"
      className="relative flex h-[100svh] flex-col items-center justify-center gap-12 overflow-hidden px-[var(--gutter)]"
      style={{ color: 'var(--ink)', background: 'radial-gradient(120% 90% at 50% 80%, color-mix(in oklab, var(--glow) 22%, var(--stage)), var(--stage-deep))' }}
    >
      <div ref={headRef} className="max-w-[94vw]" aria-live="polite">
        <StatementText key={answeredYes ? 'yes' : 'ask'} as="h2" size="hero" text={twoLines(answeredYes ? Q.afterYes : Q.headline)} progress={answeredYes ? 1 : headlineProgress} />
      </div>

      {!answeredYes && (
        <motion.div className="flex items-center justify-center gap-20" style={{ opacity: buttonsOpacity, pointerEvents: alive ? 'auto' : 'none' }} {...(alive ? {} : { inert: '' })}>
          <span ref={yesRef} className="inline-flex" style={{ transform: `scale(${yesScale})`, transition: 'transform .45s var(--ease-enter)' }}>
            <Button variant="royal" size="lg" className="min-w-[10rem] md:min-w-[13rem] md:py-5 md:text-2xl" data-testid="yes-button" onClick={() => setConfirming(true)}>{Q.yesLabel}</Button>
          </span>
          {/* the slot keeps the row stable while No roams */}
          <span className="inline-flex" style={slot && pos ? { width: slot.w, height: slot.h } : undefined}>
            <span
              ref={noRef}
              className="inline-flex"
              style={{
                ...(pos ? { position: 'absolute', left: pos.x, top: pos.y, transition: 'left .5s var(--ease-enter), top .5s var(--ease-enter)' } : null),
                transform: `scale(${noScale})`, transformOrigin: 'center', zIndex: 5,
              }}
            >
              <Button
                variant={exhausted ? 'royal' : 'ghost'} size="lg" className="min-w-[8rem] md:min-w-[10rem] md:py-5 md:text-2xl"
                data-testid="no-button"
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => (exhausted ? setConfirming(true) : attempt())}
                onFocus={(e) => e.currentTarget.matches(':focus-visible') && attempt()}
                onPointerDown={(e) => { if (e.pointerType !== 'mouse' && !exhausted) { e.preventDefault(); attempt({ x: e.clientX, y: e.clientY }); } }}
              >
                {noLabel}
              </Button>
            </span>
          </span>
        </motion.div>
      )}

      <ConfirmSheet open={confirming} prompt={Q.confirmPrompt} confirmLabel={Q.confirmYes} onConfirm={confirm} onClose={() => setConfirming(false)} />
    </section>
  );
}
