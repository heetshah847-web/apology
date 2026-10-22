import { PhotoFrame } from './PhotoFrame';

export interface PolaroidProps { src: string; alt: string; caption?: string; tilt?: number; focal?: [number, number] }

export function Polaroid({ src, alt, caption, tilt = -2, focal }: PolaroidProps) {
  return (
    <figure className="m-0 w-[min(70vw,280px)] p-3 pb-4" style={{ background: '#f6f0e6', color: '#2a2233', transform: `rotate(${tilt}deg)`, boxShadow: 'var(--shadow-lift)', borderRadius: 3 }}>
      <PhotoFrame src={src} alt={alt} focal={focal} className="aspect-[4/5] w-full" />
      {caption && <figcaption className="mt-3 text-center" style={{ fontFamily: 'var(--font-script)', fontSize: '1.6rem', lineHeight: 1 }}>{caption}</figcaption>}
    </figure>
  );
}
