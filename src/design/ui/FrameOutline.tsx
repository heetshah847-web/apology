import type { CSSProperties, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface FrameOutlineProps {
  children: ReactNode;
  /** Layer label, e.g. "Queen / Portrait 03" */
  label?: string;
  /** Live readout slot: coordinates, days together, km apart… */
  readout?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const CORNERS = ['-left-[10px] -top-[10px]', '-right-[10px] -top-[10px]', '-left-[10px] -bottom-[10px]', '-right-[10px] -bottom-[10px]'];

/** Design-tool frame: thin outline, corner handles, a layer label tag and a readout slot. */
export function FrameOutline({ children, label, readout, className, style }: FrameOutlineProps) {
  return (
    <figure className={clsx('relative m-0', className)} style={style}>
      <div className="relative" style={{ outline: '1px solid var(--frame)', outlineOffset: 6 }}>
        {children}
        {CORNERS.map((pos) => (
          <span key={pos} aria-hidden className={clsx('absolute h-2 w-2 border', pos)} style={{ borderColor: 'var(--frame)', background: 'var(--stage-deep)' }} />
        ))}
      </div>
      {label && (
        <figcaption
          className="absolute -top-[34px] left-[-6px] rounded-sm px-2 py-[3px] text-[length:var(--text-label)] leading-none"
          style={{ background: 'var(--frame)', color: 'var(--night-ink)', fontWeight: 600 }}
        >
          {label}
        </figcaption>
      )}
      {readout != null && (
        <div className="absolute -bottom-9 right-[-6px] text-[length:var(--text-label)] tabular-nums" style={{ color: 'var(--ink-soft)' }}>
          {readout}
        </div>
      )}
    </figure>
  );
}
