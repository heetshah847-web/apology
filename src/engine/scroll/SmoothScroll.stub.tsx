import type { ReactNode } from 'react';

/** Passthrough. LANE-05 replaces it with Lenis (LENIS_OPTIONS) driven by gsap.ticker. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
