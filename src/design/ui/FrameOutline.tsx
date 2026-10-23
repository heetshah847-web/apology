import type { CSSProperties, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface FrameOutlineProps {
  children: ReactNode;
  /** Kept for API compatibility; the minimal theme does not draw layer labels. */
  label?: string;
  /** Kept for API compatibility; the minimal theme does not draw readouts. */
  readout?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Minimal photo frame: white mat, hairline border and a soft shadow (replaces the old design-tool outline). */
export function FrameOutline({ children, className, style }: FrameOutlineProps) {
  return (
    <figure className={clsx('relative m-0', className)} style={style}>
      <div className="relative" style={{ background: 'var(--white)', padding: 8, borderRadius: 6, border: '1px solid var(--line)', boxShadow: 'var(--shadow-soft)' }}>
        {children}
      </div>
    </figure>
  );
}
