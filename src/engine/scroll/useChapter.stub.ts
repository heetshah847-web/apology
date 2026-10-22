import { useContext, useState } from 'react';
import { useMotionValueEvent, useTransform } from 'motion/react';
import type { ChapterApi, PhaseData, PhaseId } from '@/contracts';
import { getPhase } from '../storyData.stub';
import { TrackContext } from './NarratedTrack.stub';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const HANDOFF = 0.6; // seconds; two overlapping halves make the 1.2s hand-off

function snapshot(phase: PhaseData, t: number) {
  const dur = phase.end - phase.start;
  const enter = clamp((t - phase.start) / HANDOFF);
  const exit = clamp((t - (phase.end - HANDOFF)) / HANDOFF);
  const isActive = t >= phase.start && t < phase.end;
  const activeCue = phase.captions.find((c) => t >= c.start && t < c.end) ?? null;
  const n = phase.media.length;
  const idx = n ? Math.min(n - 1, Math.max(0, Math.floor(((t - phase.start) / dur) * n))) : 0;
  return { isActive, enter: Math.round(enter * 50) / 50, exit: Math.round(exit * 50) / 50, activeCue, activeMediaIndex: idx };
}

/** Stub of the chapter hook; same shape as the real one (LANE-05 replaces the barrel export). */
export function useChapter(id: PhaseId): ChapterApi {
  const track = useContext(TrackContext);
  if (!track) throw new Error('useChapter must be used inside <NarratedTrack>');
  const phase = getPhase(id);
  const dur = phase.end - phase.start;

  const localTime = useTransform(track.time, (t) => clamp(t - phase.start, 0, dur));
  const localProgress = useTransform(localTime, (v) => v / dur);

  const [snap, setSnap] = useState(() => snapshot(phase, track.time.get()));
  useMotionValueEvent(track.time, 'change', (t) => {
    const next = snapshot(phase, t);
    setSnap((prev) =>
      prev.isActive === next.isActive && prev.enter === next.enter && prev.exit === next.exit &&
      prev.activeCue === next.activeCue && prev.activeMediaIndex === next.activeMediaIndex ? prev : next,
    );
  });

  return { phase, localTime, localProgress, ...snap };
}
