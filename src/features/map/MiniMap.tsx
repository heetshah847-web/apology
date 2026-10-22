import { useEffect } from 'react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import type { PhaseId } from '@/contracts';
import { useStoryStore } from '@/state/storyStore';
import { AtlasMap, territoryName } from './AtlasMap';
import { routeIndex } from './mapData';
import { useOrientation } from './useOrientation';

export interface MiniMapProps {
  /** Territory to glow. Defaults to the store's current phase; renders nothing when neither is set. */
  phase?: PhaseId | null;
  /** 0..1 progress through the current chapter: the trail creeps toward the next territory. */
  progress?: number;
  className?: string;
}

/**
 * Corner map shown by the scroll engine (LANE-05) during in-track chapter changes: the current territory glows
 * and the trail ticks forward to it. Pointer-transparent; positions itself bottom-left unless `className` overrides.
 */
export function MiniMap({ phase, progress = 0, className }: MiniMapProps) {
  const fromStore = useStoryStore((s) => s.currentPhase);
  const current = phase === undefined ? fromStore : phase;
  const o = useOrientation();
  const reduced = !!useReducedMotion();
  const drawn = useMotionValue(current ? routeIndex(current) : 0);

  const target = current ? routeIndex(current) + Math.min(0.85, Math.max(0, progress)) * 0.6 : 0;
  useEffect(() => {
    if (reduced) { drawn.set(target); return; }
    const c = animate(drawn, target, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [target, reduced, drawn]);

  if (!current) return null;
  return (
    <div
      className={className ?? 'pointer-events-none fixed bottom-3 left-3 z-40 w-[34vw] max-w-[200px] sm:bottom-5 sm:left-5 sm:w-[18vw]'}
      style={{ aspectRatio: o === 'landscape' ? '16 / 10' : '2 / 3', maxWidth: o === 'landscape' ? 260 : 120, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.5))' }}
      role="img"
      aria-label={`You are in ${territoryName(current)}`}
    >
      <div className="h-full w-full overflow-hidden rounded-[10px]" style={{ border: '1px solid var(--line)' }}>
        <AtlasMap orientation={o} drawn={drawn} active={current} showLabels={false} className="block h-full w-full" title="" />
      </div>
    </div>
  );
}
