import { useMotionValue, type MotionValue } from 'motion/react';
import { useEffect } from 'react';

/** Accepts a number or a MotionValue (scroll / voice) and always returns a MotionValue<number>. */
export function useProgress(p: MotionValue<number> | number): MotionValue<number> {
  const local = useMotionValue(typeof p === 'number' ? p : 0);
  useEffect(() => { if (typeof p === 'number') local.set(p); }, [p, local]);
  return typeof p === 'number' ? local : p;
}
