import type { PhaseId } from '@/contracts';
import { getPhase } from '@/engine';

/** Stub for the 3s map interlude between tracks. */
export function AtlasInterlude({ to }: { to: PhaseId }) {
  return (
    <section className="flex h-[60svh] items-center justify-center bg-stone-800 text-stone-200">
      <p className="text-sm uppercase tracking-[0.3em]">map interlude → {getPhase(to).mapTerritory}</p>
    </section>
  );
}
