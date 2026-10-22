import { motion, useTransform, type MotionValue } from 'motion/react';

/** Crown line-drawing that traces itself over the first ~2s, then dissolves into the first portrait. */
export function Crown({ time, reduced }: { time: MotionValue<number>; reduced: boolean }) {
  const draw = useTransform(time, [0.15, 1.9], [0, 1]);
  const opacity = useTransform(time, [1.9, 2.8], [1, 0]);
  const scale = useTransform(time, [1.9, 2.8], [1, 1.08]);
  const glow = useTransform(time, [1.2, 1.9, 2.8], [0, 1, 0]);
  if (reduced) return null;
  return (
    <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 grid place-items-center" style={{ opacity, scale }}>
      <motion.div className="absolute h-1/2 w-1/2 rounded-full" style={{ opacity: glow, background: 'radial-gradient(closest-side, color-mix(in oklab, var(--glow) 38%, transparent), transparent)' }} />
      <svg viewBox="0 0 160 140" className="relative w-[62%]" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M22 108 L12 42 L52 72 L80 24 L108 72 L148 42 L138 108 Z" style={{ pathLength: draw }} />
        <motion.path d="M22 122 H138" style={{ pathLength: draw }} />
        <motion.path d="M30 108 V122 M130 108 V122" style={{ pathLength: draw }} />
        {[[12, 42], [80, 24], [148, 42]].map(([cx, cy]) => (
          <motion.circle key={cx} cx={cx} cy={cy - 6} r="4" style={{ pathLength: draw }} />
        ))}
      </svg>
    </motion.div>
  );
}
