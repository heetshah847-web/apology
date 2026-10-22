import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'royal';
  size?: 'md' | 'lg';
}

const V = {
  primary: { background: 'var(--accent)', color: 'var(--night-ink)', border: '1px solid transparent' },
  ghost: { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)' },
  royal: { background: 'linear-gradient(135deg,#e8cf94,#c8a45d 55%,#a8843f)', color: '#241a05', border: '1px solid #f0dca8', boxShadow: 'var(--shadow-glow)' },
} as const;

export function Button({ variant = 'primary', size = 'md', className, style, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-transform duration-[var(--dur-fast)] active:scale-[0.97] disabled:opacity-50', size === 'lg' ? 'px-8 py-4 text-lg' : 'px-5 py-[10px] text-[length:var(--text-ui)]', className)}
      style={{ ...V[variant], ...style }}
    />
  );
}
