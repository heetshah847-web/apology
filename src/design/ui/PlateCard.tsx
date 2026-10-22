import { clsx } from 'clsx';

export interface PlateCardProps { region?: string; code: string; caption?: string; className?: string }

/** Licence-plate card, used on the receipt, e.g. region "GJ", code "01 · FOREVER". */
export function PlateCard({ region = 'GJ', code, caption, className }: PlateCardProps) {
  return (
    <div className={clsx('inline-flex flex-col items-center gap-2', className)}>
      <div
        className="flex items-stretch overflow-hidden rounded-[10px]"
        style={{ background: 'var(--moon-pearl)', color: 'var(--night-ink)', border: '3px solid var(--night-ink)', boxShadow: '0 0 0 2px var(--moon-pearl), var(--shadow-lift)' }}
      >
        <span className="flex items-center px-3 text-sm font-bold" style={{ background: 'var(--dusk-violet)', color: 'var(--moon-pearl)' }}>{region}</span>
        <span className="px-5 py-3 text-3xl font-semibold tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{code}</span>
      </div>
      {caption && <span className="text-[length:var(--text-ui)]" style={{ color: 'var(--ink-soft)' }}>{caption}</span>}
    </div>
  );
}
