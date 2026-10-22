import { createContext, useContext } from 'react';
import type { MotionValue } from 'motion/react';
import type { CaptionCue, NarrationMode, PhaseData, TrackId } from '@/contracts';

export interface TrackContextValue {
  trackId: TrackId;
  duration: number;
  phases: PhaseData[];
  /** Track time in seconds. */
  time: MotionValue<number>;
  /** Track progress 0..1 (time / duration). */
  progress: MotionValue<number>;
  /** Actual scroll progress through the pin 0..1 (differs from `progress` only by drift). */
  scrollProgress: MotionValue<number>;
  /** |scrollProgress − progress| while guided; must stay < 0.02. */
  drift: MotionValue<number>;
  mode: NarrationMode;
  activeCue: CaptionCue | null;
  activeMediaIndex: number;
}

export const TrackContext = createContext<TrackContextValue | null>(null);

export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error('Must be used inside <NarratedTrack>');
  return ctx;
}
