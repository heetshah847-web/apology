import { motion, useTransform, type MotionValue } from 'motion/react';
import type { Win } from './queenMoments';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Faint moon arc glowing behind the portrait for the moon line. */
export function Moon({ time, win }: { time: MotionValue<number>; win: Win | null }) {
  const a = win?.start ?? -10;
  const b = win?.end ?? -9;
  const opacity = useTransform(time, [a - 0.2, a + 0.7, b + 0.4, b + 1.4], [0, 0.85, 0.85, 0]);
  const y = useTransform(time, [a, b + 1.4], [18, -10]);
  if (!win) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-[34%] -top-[14%] z-0 aspect-square w-[78%] rounded-full"
      style={{
        opacity, y,
        border: '2px solid color-mix(in oklab, var(--glow) 80%, white)',
        boxShadow: '0 0 60px 6px color-mix(in oklab, var(--glow) 55%, transparent), inset 0 0 40px color-mix(in oklab, var(--glow) 40%, transparent)',
        WebkitMaskImage: 'linear-gradient(210deg, #000 28%, transparent 62%)',
        maskImage: 'linear-gradient(210deg, #000 28%, transparent 62%)',
      }}
    />
  );
}

const PETALS = Array.from({ length: 14 }, (_, i) => {
  const r = (n: number) => { const s = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return s - Math.floor(s); };
  return { x: 6 + r(1) * 88, size: 12 + r(2) * 14, sway: 3 + r(3) * 6, spin: 120 + r(4) * 240, delay: r(5) * 0.35, hue: r(6) };
});

function Petal({ p, i }: { p: MotionValue<number>; i: number }) {
  const d = PETALS[i];
  const local = useTransform(p, (v) => clamp01((v - d.delay) / (1 - d.delay)));
  const top = useTransform(local, [0, 1], ['-8%', '108%']);
  const left = useTransform(local, (v) => `${d.x + Math.sin(v * Math.PI * 2 + i) * d.sway}%`);
  const rotate = useTransform(local, [0, 1], [0, d.spin]);
  const opacity = useTransform(local, [0, 0.12, 0.85, 1], [0, 0.9, 0.8, 0]);
  return (
    <motion.span
      className="absolute block"
      style={{
        top, left, rotate, opacity, width: d.size, height: d.size * 1.25,
        borderRadius: '100% 0 100% 0',
        background: `linear-gradient(140deg, color-mix(in oklab, #e2748f ${60 + d.hue * 30}%, white), #b3314f)`,
        filter: 'drop-shadow(0 2px 6px rgb(0 0 0 / .35))',
      }}
    />
  );
}

/** A few rose petals that drift down once, scrubbed by chapter time (they reverse when she scrolls back). */
export function Petals({ time, win }: { time: MotionValue<number>; win: Win | null }) {
  const p = useTransform(time, [(win?.start ?? -10) - 0.1, (win?.end ?? -9) + 2.4], [0, 1]);
  if (!win) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {PETALS.map((_, i) => <Petal key={i} p={p} i={i} />)}
    </div>
  );
}

const MOTES = Array.from({ length: 16 }, (_, i) => {
  const r = (n: number) => { const s = Math.sin(i * 39.346 + n * 11.135) * 24634.6345; return s - Math.floor(s); };
  return { x: r(1) * 100, y: 20 + r(2) * 75, size: 2 + r(3) * 3, dur: 14 + r(4) * 12, delay: -r(5) * 20 };
});

/** Very subtle floating light motes; the CSS animation pauses during the "time paused" beat. */
export function Motes({ paused }: { paused: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="queen-mote"
          style={{
            left: `${m.x}%`, top: `${m.y}%`, width: m.size, height: m.size,
            animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      ))}
    </div>
  );
}
