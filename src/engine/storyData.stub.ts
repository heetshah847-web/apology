import raw from '@/data/story.generated.json';
import type { PhaseData, PhaseId, StoryData, TrackId, VoiceTrack } from '@/contracts';

/** Typed access to src/data/story.generated.json (LANE-04 regenerates it from real measurements). */
export const story = raw as unknown as StoryData;

export const getTrack = (id: TrackId): VoiceTrack => {
  const t = story.tracks.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown track ${id}`);
  return t;
};

export const getPhase = (id: PhaseId): PhaseData => {
  const p = story.phases.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown phase ${id}`);
  return p;
};

export const getPhasesOfTrack = (id: TrackId): PhaseData[] => story.phases.filter((p) => p.trackId === id);
