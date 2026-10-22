import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ManifestItem } from './types';

interface PictureProps {
  item: ManifestItem;
  sizes?: string;          // e.g. "(min-width: 1024px) 50vw, 100vw"; defaults to full width
  priority?: boolean;      // eager + high fetch priority for the first screen
  fit?: 'cover' | 'contain';
  className?: string;
  style?: CSSProperties;
}

/** AVIF/WebP srcset with blur-up. Reserves space via aspect-ratio so nothing shifts. */
export function Picture({ item, sizes = '100vw', priority, fit = 'cover', className, style }: PictureProps) {
  const [loaded, setLoaded] = useState(false);
  const [fx, fy] = item.focal ?? [0.5, 0.5];
  return (
    <span
      className={className}
      style={{
        display: 'block', position: 'relative', overflow: 'hidden',
        aspectRatio: `${item.width} / ${item.height}`,
        backgroundImage: item.blur ? `url(${item.blur})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center',
        ...style,
      }}
    >
      <picture>
        {item.avifSrcSet && <source type="image/avif" srcSet={item.avifSrcSet} sizes={sizes} />}
        {item.srcSet && <source type="image/webp" srcSet={item.srcSet} sizes={sizes} />}
        <img
          src={item.src} alt={item.alt} width={item.width} height={item.height}
          loading={priority ? 'eager' : 'lazy'} decoding="async" fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: fit, objectPosition: `${fx * 100}% ${fy * 100}%`,
            opacity: loaded || !item.blur ? 1 : 0, transition: 'opacity .4s ease',
          }}
        />
      </picture>
    </span>
  );
}
