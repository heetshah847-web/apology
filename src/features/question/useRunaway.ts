import { useCallback, useRef, useState, type RefObject } from 'react';

export interface RunawayPos { x: number; y: number }

export const PAD = 24;
export const HEADER = 100;
const THROTTLE_MS = 400;
const MIN_FROM_POINTER = 200;

type Box = { left: number; right: number; top: number; bottom: number };
const grow = (r: Box, m: number): Box => ({ left: r.left - m, right: r.right + m, top: r.top - m, bottom: r.bottom + m });
const hit = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/**
 * Picks a free spot for the No button inside the safe area of `arena`: never off-screen, never under
 * an `avoid` element (the first is Yes, which is about to grow; then the headline), and away from the
 * pointer. Returns arena-relative coordinates.
 */
export function useRunaway(arena: RefObject<HTMLElement | null>, noBtn: RefObject<HTMLElement | null>, avoid: RefObject<HTMLElement | null>[]) {
  const [pos, setPos] = useState<RunawayPos | null>(null);
  const lastRun = useRef(0);

  const run = useCallback((pointer?: { x: number; y: number }, yesGrowth = 1.1): boolean => {
    const now = performance.now();
    if (now - lastRun.current < THROTTLE_MS) return false;
    const a = arena.current?.getBoundingClientRect();
    const n = noBtn.current?.getBoundingClientRect();
    if (!a || !n) return false;
    lastRun.current = now;

    const zone: Box = {
      left: Math.max(a.left, 0) + PAD, right: Math.min(a.right, innerWidth) - PAD,
      top: Math.max(a.top, 0) + HEADER, bottom: Math.min(a.bottom, innerHeight) - PAD,
    };
    const blocked = avoid.flatMap((r, i) => {
      const b = r.current?.getBoundingClientRect();
      if (!b) return [];
      const extra = i === 0 ? (Math.max(b.width, b.height) * (yesGrowth - 1)) / 2 + 28 : 16;
      return [grow(b, extra)];
    });
    const w = n.width, h = n.height;
    const from = pointer ?? { x: n.left + w / 2, y: n.top + h / 2 };

    let best: RunawayPos | null = null;
    let bestScore = -1;
    for (let i = 0; i < 80; i++) {
      const left = zone.left + Math.random() * Math.max(0, zone.right - zone.left - w);
      const top = zone.top + Math.random() * Math.max(0, zone.bottom - zone.top - h);
      const box = { left, top, right: left + w, bottom: top + h };
      if (blocked.some((b) => hit(box, b))) continue;
      const d = Math.hypot(left + w / 2 - from.x, top + h / 2 - from.y);
      if (d >= MIN_FROM_POINTER) { best = { x: left - a.left, y: top - a.top }; break; }
      if (d > bestScore) { bestScore = d; best = { x: left - a.left, y: top - a.top }; }
    }
    if (best) setPos(best);
    return true;
  }, [arena, noBtn, avoid]);

  const reset = useCallback(() => setPos(null), []);
  return { pos, run, reset, setPos };
}
