import type { MotionValue } from 'motion/react';
import type { ReactNode } from 'react';

export * from './scroll-feel';

export type PhaseId = 'queen' | 'friendship' | 'love' | 'distance' | 'apology';

export interface WordTiming { w: string; start: number; end: number }
export interface CaptionCue { start: number; end: number; text: string; words?: WordTiming[] }

export interface MediaItem {
  id: string; kind: 'image' | 'video';
  src: string; srcSet?: string; poster?: string;
  width: number; height: number; alt: string;
  focal?: [number, number];        // 0..1 focal point for object-position
  at?: number;                      // optional explicit show time (sec) in the VO
  overlay?: string;                 // optional lovely line shown with this photo
}

export type TrackId = 't0' | 't1' | 't2';

/** A chapter = one visual phase. It lives inside a voice track, between two times. */
export interface PhaseData {
  id: PhaseId; order: number; trackId: TrackId;
  title: string; subtitle?: string; mapTerritory: string;
  start: number; end: number;          // seconds within the track (from [[chapter:]] markers, MEASURED)
  captions: CaptionCue[];              // times relative to the TRACK
  media: MediaItem[];                  // `at` relative to the TRACK
  theme: 'gold' | 'amber' | 'rose' | 'fog' | 'dawn';
}

/** A voice track = one audio file that may narrate several chapters. */
export interface VoiceTrack {
  id: TrackId;
  audio: { src: string; durationSec: number };   // MEASURED with ffprobe
  chapters: PhaseId[];                           // in order
}

export interface StoryMeta { herName: string; herTitle: string; hisName: string; hisNickname: string; siteTitle: string }
export interface StoryData { meta: StoryMeta; tracks: VoiceTrack[]; phases: PhaseData[] }

// Narration engine (implemented by LANE-05; LANE-01 ships a working stub)
export type NarrationMode = 'idle' | 'guided' | 'free' | 'done';
export interface NarrationState { trackId: TrackId | null; phaseId: PhaseId | null; mode: NarrationMode; time: number; progress: number }

/** NarratedTrack pins one section for the whole track and mounts chapter components. */
export interface NarratedTrackProps { trackId: TrackId; children: ReactNode }

/** Every chapter component (Queen, Friendship, Love, Distance, Apology) receives this via useChapter(phaseId). */
export interface ChapterApi {
  phase: PhaseData;
  isActive: boolean;                       // track time within [start, end)
  localProgress: MotionValue<number>;      // 0..1 within THIS chapter
  localTime: MotionValue<number>;          // seconds since chapter start
  enter: number; exit: number;             // 0..1 transition amounts for the 1.2s inline hand-off
  activeCue: CaptionCue | null;
  activeMediaIndex: number;                // index into phase.media
}

// Audio director (implemented by LANE-04; LANE-01 ships a stub)
export interface AudioDirector {
  unlock(): Promise<void>;                 // must be called inside a user gesture
  load(trackId: TrackId): void;
  play(trackId: TrackId, fromSec?: number): Promise<void>;
  pause(): void;
  seek(sec: number): void;
  currentTime(): number;
  duration(trackId: TrackId): number;
  setMuted(m: boolean): void;
  music: { play(track: 'bed' | 'yes' | 'planner'): void; duck(on: boolean): void; stop(): void };
  sfx(name: 'unfold' | 'pin' | 'chime' | 'pop'): void;
  on(evt: 'time' | 'ended' | 'play' | 'pause', cb: (trackId: TrackId, t: number) => void): () => void;
}

// Planner (LANE-12)
export type PlannerStepId = 'activity' | 'cuisine' | 'dessert' | 'heetu' | 'flowers' | 'punish' | 'suggestions' | 'review' | 'delivery';
export interface Venue { id: string; name: string; area: string; address?: string; mapsUrl?: string; knownFor: string[]; priceForTwo?: string; verified: boolean; sources: string[]; notes?: string }
export interface PlannerOption { id: string; label: string; description?: string; image?: string; venueIds?: string[]; emoji?: string }
export interface CartItem { stepId: PlannerStepId; optionId: string; label: string; venueId?: string; note?: string; bonus?: boolean }
export interface Order { items: CartItem[]; suggestions: string; delivery: { date: string; slot: string }; createdAt: string }
