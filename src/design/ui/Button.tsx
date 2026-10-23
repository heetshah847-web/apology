import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'royal';
  size?: 'md' | 'lg';
}

const V = {
  primary: { background: 'var(--night-ink)', color: 'var(--moon-pearl)', border: '1px solid transparent' },
  ghost: { background: 'var(--white)', color: 'var(--ink)', border: '1px solid var(--line)' },
  royal: { background: 'var(--night-ink)', color: 'var(--moon-pearl)', border: '1px solid transparent', boxShadow: 'var(--shadow-soft)' },
} as const;

export function Button({ variant = 'primary', size = 'md', className, style, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.14em] transition-[transform,background-color,box-shadow] duration-[var(--dur-fast)] active:scale-[0.97] disabled:opacity-50', size === 'lg' ? 'px-8 py-4 text-lg' : 'px-5 py-[10px] text-[length:var(--text-ui)]', className)}
      style={{ ...V[variant], ...style }}
    />
  );
}
