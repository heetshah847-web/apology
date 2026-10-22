import type { CaptionCue, PhaseData } from '@/contracts';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export const statementCues = (phase: PhaseData): CaptionCue[] => phase.captions.filter((c) => c.text.trim());

/**
 * The statement on screen at track time `t` (with its word-reveal progress).
 * With a pasted script: the latest started cue. Without one (captions still empty): the chapter's own
 * title, then its subtitle, so the screen is never blank and works for any chapter window.
 */
export function statementAt(cues: CaptionCue[], t: number, phase: PhaseData): { text: string; progress: number } {
  if (!cues.length) {
    const span = Math.max(0.1, phase.end - phase.start);
    const p = clamp((t - phase.start) / span);
    const lines = [phase.title, phase.subtitle].filter((l): l is string => !!l);
    const seg = Math.min(lines.length - 1, Math.floor(p * lines.length));
    const segP = p * lines.length - seg;
    return { text: lines[seg], progress: clamp(segP / 0.5) };
  }
  let cue: CaptionCue | undefined;
  for (const c of cues) if (c.start <= t) cue = c;
  if (!cue) return { text: '', progress: 0 };
  return { text: cue.text, progress: clamp((t - cue.start) / Math.max(0.1, (cue.end - cue.start) * 0.8)) };
}
