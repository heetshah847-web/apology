// Pure caption lookups (no runtime imports) so they can be unit-tested with plain node.
import type { CaptionCue, WordTiming } from '@/contracts';

/** Index of the cue with start <= t < end, or -1 (e.g. during a pause between phrases). Binary search; cues must be sorted. */
export function getActiveCueIndex(cues: readonly CaptionCue[], t: number): number {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (t < cues[mid].start) hi = mid - 1;
    else if (t >= cues[mid].end) lo = mid + 1;
    else return mid;
  }
  return -1;
}

export function getActiveCue(cues: readonly CaptionCue[], t: number): CaptionCue | null {
  const i = getActiveCueIndex(cues, t);
  return i < 0 ? null : cues[i];
}

/** Word timings of a cue; when the cue has none they are spread over its duration by word length. */
export function wordsOf(cue: CaptionCue): WordTiming[] {
  if (cue.words?.length) return cue.words;
  const parts = cue.text.split(/\s+/).filter(Boolean);
  const total = parts.reduce((s, w) => s + w.length + 1, 0) || 1;
  let acc = 0;
  return parts.map((w) => {
    const start = cue.start + ((cue.end - cue.start) * acc) / total;
    acc += w.length + 1;
    return { w, start, end: cue.start + ((cue.end - cue.start) * acc) / total };
  });
}

export interface WordProgress {
  /** Last word whose start <= t (-1 before the first word). */
  index: number;
  /** 0..1 progress through that word. */
  wordProgress: number;
  /** 0..1 progress through the whole cue. */
  cueProgress: number;
}

export function getWordProgress(cue: CaptionCue, t: number): WordProgress {
  const words = wordsOf(cue);
  const cueProgress = cue.end > cue.start ? Math.min(1, Math.max(0, (t - cue.start) / (cue.end - cue.start))) : 1;
  let lo = 0;
  let hi = words.length - 1;
  let index = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (words[mid].start <= t) { index = mid; lo = mid + 1; } else hi = mid - 1;
  }
  if (index < 0) return { index, wordProgress: 0, cueProgress };
  const w = words[index];
  const wordProgress = w.end > w.start ? Math.min(1, Math.max(0, (t - w.start) / (w.end - w.start))) : 1;
  return { index, wordProgress, cueProgress };
}
