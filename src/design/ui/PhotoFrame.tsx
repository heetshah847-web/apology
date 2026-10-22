import { motion, useReducedMotion } from 'motion/react';
import { clsx } from 'clsx';

export interface PhotoFrameProps {
  src: string; alt: string;
  /** 0..1 focal point → object-position */
  focal?: [number, number];
  /** Ken Burns 1 → 1.08 over `duration` seconds (disabled with reduced motion) */
  kenBurns?: boolean; duration?: number;
  className?: string;
}

/** object-fit: cover photo with a focal point; never stretched. */
export function PhotoFrame({ src, alt, focal = [0.5, 0.5], kenBurns = false, duration = 3, className }: PhotoFrameProps) {
  const reduce = useReducedMotion();
  return (
    <div className={clsx('relative overflow-hidden', className)} style={{ background: 'var(--stage-deep)' }}>
      <motion.img
        key={src} src={src} alt={alt} draggable={false}
        initial={{ scale: 1 }} animate={{ scale: kenBurns && !reduce ? 1.08 : 1 }}
        transition={{ duration, ease: 'linear' }}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: `${focal[0] * 100}% ${focal[1] * 100}%`, filter: 'var(--photo-filter)' }}
      />
    </div>
  );
}
