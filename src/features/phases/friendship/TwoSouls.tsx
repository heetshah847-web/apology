import { useLayoutEffect, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, type MotionValue } from 'motion/react';

const LEFT = 'M20,86 C140,8 250,128 380,70 S470,52 500,60';
const RIGHT = 'M980,34 C850,112 750,6 620,52 S530,68 500,60';
const HEART = 'M0,-14 C-4,-26 -26,-24 -26,-8 C-26,6 -8,14 0,26 C8,14 26,6 26,-8 C26,-24 4,-26 0,-14 Z';

/**
 * Two glowing dots follow doodled lines and meet at the end of the chapter (progress 1).
 * During `exit` they merge into one heart glow, the first light of the Love chapter.
 */
export function TwoSouls({ progress, exit }: { progress: MotionValue<number>; exit: number }) {
  const reduce = useReducedMotion();
  const lp = useRef<SVGPathElement>(null);
  const rp = useRef<SVGPathElement>(null);
  const ax = useMotionValue(20), ay = useMotionValue(86), bx = useMotionValue(980), by = useMotionValue(34);
  const trail = useMotionValue(0);

  const update = (p: number) => {
    const v = reduce ? 1 : Math.min(1, Math.max(0, p));
    const l = lp.current, r = rp.current;
    if (l && r) {
      const a = l.getPointAtLength(v * l.getTotalLength()), b = r.getPointAtLength(v * r.getTotalLength());
      ax.set(a.x); ay.set(a.y); bx.set(b.x); by.set(b.y);
    }
    trail.set(v);
  };
  useLayoutEffect(() => update(progress.get()), [reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  useMotionValueEvent(progress, 'change', update);

  return (
    <svg viewBox="0 0 1000 130" className="mx-auto block w-full max-w-[1000px]" style={{ height: 'clamp(90px, 14vh, 150px)', overflow: 'visible' }} aria-hidden>
      <defs>
        <filter id="soul-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {[LEFT, RIGHT].map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
          <motion.path ref={i ? rp : lp} d={d} fill="none" stroke="var(--glow)" strokeWidth="2.5" strokeLinecap="round" style={{ pathLength: trail, opacity: 1 - exit }} />
        </g>
      ))}
      {[[ax, ay], [bx, by]].map(([x, y], i) => (
        <g key={i} style={{ opacity: 1 - exit }}>
          <motion.circle cx={x} cy={y} r="14" fill="var(--glow)" filter="url(#soul-glow)" />
          <motion.circle cx={x} cy={y} r="6" fill="#fff6e0" />
        </g>
      ))}
      <g transform="translate(500 60)" style={{ opacity: exit }}>
        <path d={HEART} fill="var(--glow)" filter="url(#soul-glow)" transform={`scale(${0.6 + exit * 1.2})`} />
        <path d={HEART} fill="#fff6e0" transform={`scale(${0.2 + exit * 0.45})`} />
      </g>
    </svg>
  );
}
