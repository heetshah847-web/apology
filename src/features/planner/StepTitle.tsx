import type { ReactNode } from 'react';

export function StepTitle({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <h2 onClick={onClick} className="pl-title">{children}</h2>;
}
