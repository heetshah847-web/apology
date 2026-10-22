import { useState } from 'react';
import { useMotionValueEvent, useTransform } from 'motion/react';
import type { ChapterApi, PhaseData, PhaseId } from '@/contracts';
import { getPhase } from '../storyData.stub';
import { useTrack } from './context';
import { activeMediaAt, mediaSchedule } from './timing';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const HANDOFF = 0.6; // seconds; two overlapping halves make the 1.2s hand-off

function snapshot(phase: PhaseData, t: number) {
  const dur = phase.end - phase.start;
  const enter = clamp((t - phase.start) / HANDOFF);
  const exit = clamp((t - (phase.end - HANDOFF)) / HANDOFF);
  const activeCue = phase.captions.find((c) => t >= c.start && t < c.end) ?? null;
  const schedule = mediaSchedule(dur, phase.media.map((m) => ({ at: m.at === undefined ? undefined : m.at - phase.start })));
  return {
    isActive: t >= phase.start && t < phase.end,
    // Quantised to 2% so React state changes ~50 times per hand-off, not per frame.
    enter: Math.round(enter * 50) / 50,
    exit: Math.round(exit * 50) / 50,
    activeCue,
    activeMediaIndex: activeMediaAt(schedule, clamp(t - phase.start, 0, dur)),
  };
}

/** Time-range view of a track for one chapter (docs/04-TIMING-MATH.md §0). */
export function useChapter(id: PhaseId): ChapterApi {
  const { time } = useTrack();
  const phase = getPhase(id);
  const dur = phase.end - phase.start;

  const localTime = useTransform(time, (t) => clamp(t - phase.start, 0, dur));
  const localProgress = useTransform(localTime, (v) => v / dur);

  const [snap, setSnap] = useState(() => snapshot(phase, time.get()));
  useMotionValueEvent(time, 'change', (t) => {
    const next = snapshot(phase, t);
    setSnap((prev) =>
      prev.isActive === next.isActive && prev.enter === next.enter && prev.exit === next.exit &&
      prev.activeCue === next.activeCue && prev.activeMediaIndex === next.activeMediaIndex ? prev : next,
    );
  });

  return { phase, localTime, localProgress, ...snap };
}
