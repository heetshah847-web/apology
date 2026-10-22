import raw from '../../data/media.manifest.json';
import type { ManifestItem, MediaPhaseKey } from './types';

const phases = raw.phases as unknown as Record<MediaPhaseKey, ManifestItem[]>;

export const getMedia = (phase: MediaPhaseKey): ManifestItem[] => phases[phase] ?? [];

/** Warm the browser cache for the photo after `index` (call when photo `index` becomes active). */
export function preloadNext(phase: MediaPhaseKey, index: number, sizes = '100vw'): void {
  const next = getMedia(phase)[index + 1];
  if (!next || next.kind !== 'image' || typeof Image === 'undefined') return;
  const img = new Image();
  img.sizes = sizes;
  if (next.srcSet) img.srcset = next.srcSet;
  img.src = next.src;
}
