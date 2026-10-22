import type { CaptionCue, PhaseData } from '@/contracts';

export interface Win { start: number; end: number }
export interface QueenMoments {
  moon: Win | null;     // "the moon envied her glow"
  roses: Win | null;    // "the roses surrendered their fragrance"
  freeze: Win | null;   // "time itself paused": everything holds still
  title: Win | null;    // "even gods learned to bow": the Queen Tanisha title card
}

export const FREEZE_SEC = 0.8;
const TITLE_RISE_SEC = 1.0;

const cueWin = (c: CaptionCue | undefined): Win | null => (c ? { start: c.start, end: c.end } : null);

/** Finds the story beats by keyword in the caption text, so a reworded script still lands. */
export function findMoments(phase: PhaseData): QueenMoments {
  const cues = phase.captions;
  const timeCue = cues.find((c) => /\btime\b/i.test(c.text));
  const pauseWord = timeCue?.words?.find((w) => /paus/i.test(w.w)) ?? timeCue?.words?.find((w) => /\btime\b/i.test(w.w));
  const freezeStart = pauseWord?.start ?? timeCue?.start;
  const bowCue = [...cues].reverse().find((c) => /\bbow\b/i.test(c.text)) ?? cues.at(-1);
  const titleStart = bowCue ? bowCue.start + (bowCue.end - bowCue.start) * 0.35 : null;
  return {
    moon: cueWin(cues.find((c) => /\bmoon\b/i.test(c.text))),
    roses: cueWin(cues.find((c) => /\brose/i.test(c.text))),
    freeze: freezeStart === undefined ? null : { start: freezeStart, end: freezeStart + FREEZE_SEC },
    title: titleStart === null ? null : { start: titleStart, end: titleStart + TITLE_RISE_SEC },
  };
}

/** Chapter time with the freeze window cut out, so motion holds still then resumes without a jump. */
export const effectiveTime = (t: number, freeze: Win | null): number =>
  freeze ? t - Math.min(Math.max(t - freeze.start, 0), freeze.end - freeze.start) : t;
