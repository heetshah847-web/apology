import type { CaptionCue, PhaseData } from '@/contracts';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Voice lines of the chapter that carry words (empty cues are pauses). */
export const statementCues = (phase: PhaseData): CaptionCue[] => phase.captions.filter((c) => c.text.trim());

/** The statement on screen at track time `t`: the latest cue that has started, plus its reveal progress. */
export function statementAt(cues: CaptionCue[], t: number, phase: PhaseData): { text: string; progress: number } {
  // Script not pasted yet (captions have no text): show the chapter's own line instead of a blank screen.
  if (!cues.length) return { text: phase.subtitle ?? phase.title, progress: clamp((t - phase.start) / ((phase.end - phase.start) * 0.2)) };
  let cue: CaptionCue | undefined;
  for (const c of cues) if (c.start <= t) cue = c;
  if (!cue) return { text: '', progress: 0 };
  // Words finish revealing at 80% of the cue so the last word is readable before it changes.
  return { text: cue.text, progress: clamp((t - cue.start) / Math.max(0.1, (cue.end - cue.start) * 0.8)) };
}
