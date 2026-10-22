import { createContext, useRef } from 'react';
import { useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'motion/react';
import { SCROLL_VH_PER_SEC, type NarratedTrackProps, type TrackId } from '@/contracts';
import { useStoryStore } from '@/state/storyStore';
import { getPhasesOfTrack, getTrack } from '../storyData.stub';

export interface TrackContextValue { trackId: TrackId; duration: number; time: MotionValue<number> }
export const TrackContext = createContext<TrackContextValue | null>(null);

/**
 * Stub: pinned section of height D × SCROLL_VH_PER_SEC vh. Free mode only —
 * track time is derived from scroll position (docs/04-TIMING-MATH.md §3).
 */
export function NarratedTrack({ trackId, children }: NarratedTrackProps) {
  const ref = useRef<HTMLElement>(null);
  const duration = getTrack(trackId).audio.durationSec;
  const setNarration = useStoryStore((s) => s.setNarration);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const time = useTransform(scrollYProgress, (p) => p * duration);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const t = p * duration;
    const phase = getPhasesOfTrack(trackId).find((c) => t >= c.start && t < c.end) ?? null;
    if (p <= 0 || p >= 1) return;
    setNarration({ trackId, phaseId: phase?.id ?? null, mode: 'free', time: t, progress: p });
  });

  return (
    <section ref={ref} data-track={trackId} style={{ height: `${duration * SCROLL_VH_PER_SEC}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <TrackContext.Provider value={{ trackId, duration, time }}>{children}</TrackContext.Provider>
      </div>
    </section>
  );
}
