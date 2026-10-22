import type { MediaItem } from '../../contracts';

/** MediaItem as emitted by scripts/build-manifest.mjs (contract fields + pipeline extras). */
export type ManifestItem = MediaItem & {
  avifSrcSet?: string;
  blur?: string;      // 16px base64 WebP for blur-up
  label?: string;     // design-tool frame label from meta.json
  placeholder?: boolean;
};
export type MediaPhaseKey = 'queen' | 'friendship' | 'love' | 'distance' | 'apology' | 'heetu-versions';
