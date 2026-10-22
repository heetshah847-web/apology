import type { ReactNode } from 'react';

export function StepTitle({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <h2 onClick={onClick} className="m-0 mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-statement-sm)', lineHeight: 1.05, letterSpacing: 'var(--tracking-statement)', color: 'var(--ink)' }}>
      {children}
    </h2>
  );
}
