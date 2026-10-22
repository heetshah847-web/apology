import type { ButtonHTMLAttributes } from 'react';

export function Chip({ selected, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button" aria-pressed={selected} {...rest}
      className="rounded-full px-4 py-2 text-[length:var(--text-ui)] font-medium transition-colors duration-[var(--dur-base)]"
      style={{ border: '1px solid var(--line)', background: selected ? 'var(--accent)' : 'transparent', color: selected ? 'var(--night-ink)' : 'var(--ink)' }}
    >
      {children}
    </button>
  );
}
