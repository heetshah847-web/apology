// Pure helpers (no imports at runtime) so they can be unit-tested with plain node.
// The scroll-per-second constant lives in src/contracts/scroll-feel.ts and is passed in.
import type { MediaItem } from '@/contracts';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Scroll length (vh) of a pinned track of duration D seconds: L = D ื S. */
export const sectionLength = (D: number, vhPerSec: number) => D * vhPerSec;

export interface MediaSlot { index: number; show: number; hide: number; crossfade: number }

/**
 * Photo schedule inside a window of D seconds (docs/04-TIMING-MATH.md ยง4).
 * Items with an explicit `at` (relative to the window) keep it; the rest share the gaps evenly.
 */
export function mediaSchedule(D: number, items: Pick<MediaItem, 'at'>[]): MediaSlot[] {
  const n = items.length;
  if (!n || D <= 0) return [];
  const slot = D / n;
  const shows = items.map((m, i) => (m.at !== undefined ? clamp(m.at, 0, D) : i * slot));
  return shows.map((show, i) => {
    const hide = i + 1 < n ? Math.max(show, shows[i + 1]) : D;
    return { index: i, show, hide, crossfade: Math.min(0.8, (hide - show) * 0.25) };
  });
}

/** Index of the media item showing at time t (clamped to the first/last). */
export function activeMediaAt(schedule: MediaSlot[], t: number): number {
  let idx = 0;
  for (const s of schedule) if (t >= s.show) idx = s.index;
  return idx;
}

/** Scroll position -> narration progress 0..1. */
export const progressFromScroll = (scrollY: number, startY: number, lengthPx: number) =>
  lengthPx <= 0 ? 0 : clamp((scrollY - startY) / lengthPx);

/** Narration progress 0..1 -> scroll position. */
export const scrollFromProgress = (p: number, startY: number, lengthPx: number) =>
  startY + clamp(p) * lengthPx;
