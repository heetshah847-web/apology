import type { ReactNode } from 'react';

/** Stub: no gate, children render straight away. LANE-06 adds the soft passcode. */
export function PasscodeGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
