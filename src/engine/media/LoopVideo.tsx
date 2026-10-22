import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { ManifestItem } from './types';

interface LoopVideoProps { item: ManifestItem; className?: string; style?: CSSProperties }

/** Muted looping clip that only plays while on screen. Shows the poster under reduced motion. */
export function LoopVideo({ item, className, style }: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause(); }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const [fx, fy] = item.focal ?? [0.5, 0.5];
  return (
    <video
      ref={ref} className={className} muted loop playsInline preload="metadata" poster={item.poster}
      aria-label={item.alt} width={item.width} height={item.height}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx * 100}% ${fy * 100}%`, ...style }}
    >
      <source src={item.src} type="video/mp4" />
    </video>
  );
}
