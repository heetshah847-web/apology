/** Small lower-third caption. Only the reduced-motion / accessibility fallback for StatementText. */
export function Caption({ text }: { text?: string | null }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-[var(--gutter)] pb-8 pt-24" style={{ background: 'linear-gradient(to top, var(--scrim), transparent)' }}>
      <p aria-live="polite" className="m-0 max-w-[32ch] text-center" style={{ fontSize: 'var(--text-caption)', lineHeight: 1.3, color: 'var(--moon-pearl)', textShadow: '0 1px 12px rgb(0 0 0 / .5)' }}>{text}</p>
    </div>
  );
}
