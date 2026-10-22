import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import { PIN_PATH } from './mapData';

export interface MapPinsProps {
  labelA?: string;
  labelB?: string;
  /** 0..1 (or a MotionValue, e.g. scroll progress): how far apart the two pins are. */
  stretch: number | MotionValue<number>;
  className?: string;
}

const W = 1000, H = 220, AX = 110, BX_MIN = 330, BX_MAX = 890, Y = 140;

/**
 * Two pins joined by a dotted line that stretches as `stretch` grows. Reusable by the Distance chapter
 * (Heet and Tanisha drifting apart). Plain SVG, themed by the design tokens.
 */
export function MapPins({ labelA = 'Heet', labelB = 'Tanisha', stretch, className }: MapPinsProps) {
  const own = useMotionValue(typeof stretch === 'number' ? stretch : 0);
  useEffect(() => { if (typeof stretch === 'number') own.set(stretch); }, [stretch, own]);
  const s = typeof stretch === 'number' ? own : stretch;

  const bx = useTransform(s, [0, 1], [BX_MIN, BX_MAX], { clamp: true });
  const mid = useTransform(bx, (v) => (AX + v) / 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className ?? 'block w-full'} role="img" aria-label={`${labelA} and ${labelB}`}>
      <motion.line
        x1={AX} y1={Y} y2={Y} x2={bx}
        stroke="var(--accent, #c8a45d)" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 16"
      />
      <Pin x={AX} y={Y} label={labelA} />
      <motion.g style={{ x: bx }}>
        <Pin x={0} y={Y} label={labelB} />
      </motion.g>
      <motion.circle cx={mid} cy={Y} r="3" fill="var(--ink-soft, #bbb)" />
    </svg>
  );
}

function Pin({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="16" ry="5" fill="#000" fillOpacity="0.35" />
      <g transform="scale(1.8)">
        <path d={PIN_PATH} fill="#d85b7d" stroke="var(--moon-pearl, #eee8f4)" strokeWidth="2" />
        <circle cy="-24" r="4.5" fill="var(--moon-pearl, #eee8f4)" />
      </g>
      <text y="52" textAnchor="middle" fontFamily="var(--font-script, cursive)" fontSize="44" fill="var(--accent, #c8a45d)">{label}</text>
    </g>
  );
}
