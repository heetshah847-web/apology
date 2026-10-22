import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, useInView, useMotionValue, useReducedMotion } from 'motion/react';
import planner from '@/data/planner.json';
import { audioDirector } from '@/engine';
import { Button, Sheet, StatementText } from '@/design';
import { useStoryStore } from '@/state/storyStore';
import { heartConfetti } from './hearts';
import { pickSpot } from './runaway';

const q = planner.question;
const NO_SHRINK = 0.92;   // No loses 8% per attempt
const YES_GROW = 1.1;     // Yes gains 10% per attempt
const PROXIMITY = 120;    // px: pointer this close makes No bolt
const COOLDOWN = 380;     // ms between bolts so one swipe is one attempt

/** Wait for the planner to mount (it only renders once answeredYes), then glide to it. */
function scrollToPlanner() {
  const t0 = performance.now();
  const go = () => {
    const el = document.getElementById('planner');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (performance.now() - t0 < 4000) requestAnimationFrame(go);
  };
  go();
}

/** The closing statement of the story: "Will you be mine again?" with a runaway No and a growing Yes. */
export function TheQuestion() {
  const reduce = useReducedMotion();
  const answeredYes = useStoryStore((s) => s.answeredYes);
  const setAnsweredYes = useStoryStore((s) => s.setAnsweredYes);
  const attempts = useStoryStore((s) => s.noAttempts);
  const incNo = useStoryStore((s) => s.incNoAttempts);
  const converted = attempts >= q.noMaxAttempts;

  const section = useRef<HTMLElement>(null);
  const arena = useRef<HTMLDivElement>(null);
  const yesWrap = useRef<HTMLSpanElement>(null);
  const noWrap = useRef<HTMLSpanElement>(null);
  const slot = useRef<HTMLSpanElement>(null);
  const lastBolt = useRef(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null); // null until measured; rests in its slot
  const [moved, setMoved] = useState(false);
  const [sheet, setSheet] = useState(false);

  // headline reveal when the section scrolls into view
  const inView = useInView(section, { amount: 0.4, once: true });
  const reveal = useMotionValue(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(reveal, 1, { duration: reduce ? 0 : 1.8, ease: 'easeOut' });
    return () => c.stop();
  }, [inView, reduce, reveal]);
  useEffect(() => { if (answeredYes) reveal.set(1); }, [answeredYes, reveal]);

  const rel = (r: DOMRect) => {
    const a = arena.current!.getBoundingClientRect();
    return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height };
  };

  // rest in the slot (before the first bolt / once converted); clamp inside the arena after resize
  useLayoutEffect(() => {
    const place = () => {
      if (!arena.current || !noWrap.current) return;
      if ((converted || !moved) && slot.current) {
        const b = rel(slot.current.getBoundingClientRect());
        setPos({ x: b.x, y: b.y });
        return;
      }
      const a = arena.current.getBoundingClientRect();
      const n = noWrap.current.getBoundingClientRect();
      setPos((p) => p && { x: Math.min(Math.max(p.x, 8), Math.max(8, a.width - n.width - 8)), y: Math.min(Math.max(p.y, 8), Math.max(8, a.height - n.height - 8)) });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [converted, moved, answeredYes, attempts]);

  const bolt = useCallback(() => {
    if (converted || !arena.current || !noWrap.current || !yesWrap.current) return;
    const now = performance.now();
    if (now - lastBolt.current < COOLDOWN) return;
    lastBolt.current = now;
    const a = arena.current.getBoundingClientRect();
    const n = noWrap.current.getBoundingClientRect();
    const y = rel(yesWrap.current.getBoundingClientRect());
    const k = YES_GROW * YES_GROW; // keep clear of Yes at its next size, with margin
    const yesNext = { x: y.x - (y.w * (k - 1)) / 2, y: y.y - (y.h * (k - 1)) / 2, w: y.w * k, h: y.h * k };
    const cur = rel(n);
    // n is the unscaled layout box of the wrapper, so size it by the shrink it is about to get
    setPos(pickSpot({ w: a.width, h: a.height }, { w: Math.min(a.width - 24, n.width * 1.6), h: n.height * 1.25 }, yesNext, cur));
    setMoved(true);
    incNo();
  }, [converted, incNo]);

  // desktop: pointer proximity
  useEffect(() => {
    if (converted || answeredYes) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !noWrap.current) return;
      const r = noWrap.current.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < PROXIMITY) bolt();
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [converted, answeredYes, bolt]);

  const confirm = () => {
    setSheet(false);
    setAnsweredYes(true);
    audioDirector.music.play('yes');
    heartConfetti();
    window.setTimeout(scrollToPlanner, reduce ? 0 : 1400);
  };

  const noLabel = converted ? q.yesLabel : q.noLabels[Math.min(attempts, q.noLabels.length - 1)];
  const yesScale = Math.pow(YES_GROW, Math.min(attempts, q.noMaxAttempts));
  const noScale = converted ? 1 : Math.pow(NO_SHRINK, attempts);
  const noDone = converted || answeredYes;

  return (
    <section
      ref={section} id="question" data-theme="rose" aria-labelledby="question-h"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-[6vw] py-[8vh]"
      style={{ background: 'radial-gradient(90% 70% at 50% 100%, color-mix(in oklab, var(--glow) 22%, transparent), transparent 70%), var(--stage)', color: 'var(--ink)' }}
    >
      <p className="mb-5 text-[length:var(--text-label)] uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Bridge of Forgiveness / The Question</p>
      <h2 id="question-h" className="m-0 w-full">
        <StatementText
          as="span" size="hero" progress={reduce ? 1 : reveal}
          text={answeredYes ? q.afterYes : q.headline}
          className="block text-[length:clamp(3rem,1.2rem+6.2vw,8.5rem)] leading-[0.98]"
        />
      </h2>

      <div ref={arena} className="relative mt-[4vh] h-[min(36vh,16rem)] md:h-[min(28vh,14rem)] w-full max-w-[56rem]">
        <div className="absolute inset-0 flex items-center justify-center gap-[4.5rem]">
          <span ref={yesWrap} className="inline-block" style={{ transform: `scale(${yesScale})`, transition: reduce ? 'none' : 'transform .5s var(--ease-enter)' }}>
            <Button variant="royal" size="lg" disabled={answeredYes} onClick={() => setSheet(true)} data-testid="yes">
              {answeredYes ? '✓ ' : ''}{q.yesLabel}
            </Button>
          </span>
          {/* the No's resting place; keeps layout so the pair stays centred */}
          {!answeredYes && <span ref={slot} aria-hidden className="inline-block h-[3.5rem] w-[11rem]" />}
        </div>
        {!answeredYes && (
          <span
            ref={noWrap} className="absolute left-0 top-0 inline-block"
            style={{
              transform: `translate(${pos?.x ?? 0}px, ${pos?.y ?? 0}px) scale(${noScale})`, transformOrigin: 'top left',
              transition: reduce ? 'none' : 'transform .45s var(--ease-enter)',
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            <Button
              variant={converted ? 'royal' : 'ghost'} size="lg" data-testid="no" data-converted={converted || undefined}
              className="max-w-[calc(100vw-12vw-1rem)] text-center leading-tight" style={{ touchAction: 'manipulation' }}
              onPointerDown={(e) => { if (!noDone && e.pointerType === 'touch') { e.preventDefault(); bolt(); } }}
              onFocus={() => { if (!noDone) bolt(); }}
              onClick={() => (converted ? setSheet(true) : bolt())}
            >
              {noLabel}
            </Button>
          </span>
        )}
      </div>
      <p className="sr-only" role="status">{answeredYes ? q.afterYes : ''}</p>

      <Sheet open={sheet} onClose={() => setSheet(false)} title={q.confirmPrompt}>
        <div className="flex justify-center pt-2">
          <Button variant="royal" size="lg" autoFocus onClick={confirm} data-testid="confirm">{q.confirmYes}</Button>
        </div>
      </Sheet>
    </section>
  );
}
