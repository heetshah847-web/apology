import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { motion, useTransform } from 'motion/react';
import { SCENE_PIN_VH } from '@/contracts';
import { useScene } from './useScene';

export interface StepInsideProps {
  /** The element inside `children` to zoom into (map territory, a frame). */
  target: RefObject<HTMLElement | null>;
  children: ReactNode;
  lengthVh?: number;
  className?: string;
}

/**
 * "Step inside": scales the current view into `target` across a pinned scroll range, then fades
 * out so the next section takes over. Scrolling back reverses it exactly.
 */
export function StepInside({ target, children, lengthVh = SCENE_PIN_VH.statement * 1.5, className }: StepInsideProps) {
  const { ref, progress } = useScene<HTMLDivElement>({ lengthVh });
  const [geo, setGeo] = useState({ ox: '50% 50%', scale: 6 });

  useLayoutEffect(() => {
    const measure = () => {
      const host = ref.current;
      const el = target.current;
      if (!host || !el) return;
      const h = host.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const cx = r.left - h.left + r.width / 2;
      const cy = r.top - h.top + r.height / 2;
      const scale = Math.max(h.width / r.width, h.height / r.height);
      setGeo({ ox: `${cx}px ${cy}px`, scale: Number.isFinite(scale) ? scale : 6 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [ref, target]);

  const scale = useTransform(progress, [0, 1], [1, geo.scale], { ease: (t) => t * t * (3 - 2 * t) });
  const opacity = useTransform(progress, [0, 0.85, 1], [1, 1, 0]);

  return (
    <div ref={ref} className={className} style={{ height: '100svh', overflow: 'hidden' }}>
      <motion.div style={{ scale, opacity, transformOrigin: geo.ox, height: '100%', willChange: 'transform' }}>{children}</motion.div>
    </div>
  );
}
