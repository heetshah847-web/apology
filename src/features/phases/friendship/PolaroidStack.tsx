import { motion, useReducedMotion } from 'motion/react';
import type { MediaItem } from '@/contracts';
import { FrameOutline, PhotoFrame } from '@/design';

const TILTS = [-4, 3, -6, 5, -2, 6, -5];
const SPRING = { type: 'spring', stiffness: 120, damping: 16, mass: 0.9 } as const;

type Labelled = MediaItem & { label?: string };

function Card({ item, top, n, total }: { item: Labelled; top: boolean; n: number; total: number }) {
  const aspect = item.width / item.height;
  const body = item.kind === 'video'
    ? <video src={item.src} poster={item.poster} muted loop playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" style={{ filter: 'var(--photo-filter)' }} />
    : <div className="absolute inset-0"><PhotoFrame src={item.src} alt={item.alt} focal={item.focal} className="h-full w-full" /></div>;
  const card = (
    <figure className="m-0 p-3 pb-4" style={{ background: '#f6f0e6', color: '#2a2233', boxShadow: 'var(--shadow-lift)', borderRadius: 3, width: `min(40vw, ${40 * aspect}vh, 440px)` }}>
      <div className="relative w-full" style={{ aspectRatio: String(aspect) }}>{body}</div>
      {item.overlay && <figcaption className="mt-2 text-center" style={{ fontFamily: 'var(--font-script)', fontSize: '1.6rem', lineHeight: 1 }}>{item.overlay}</figcaption>}
    </figure>
  );
  if (!top) return card;
  return (
    <FrameOutline label={item.label ?? 'Memory'} readout={<span>{String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>}>
      {card}
    </FrameOutline>
  );
}

/**
 * Photos land one by one (index `active`), earlier ones slide into a small stack.
 * Everything is derived from `active`, so scrolling back replays in reverse.
 */
export function PolaroidStack({ media, active, visible }: { media: MediaItem[]; active: number; visible: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-full w-full" aria-label="Memories">
      {media.map((item, i) => {
        const d = active - i; // 0 = on top, >0 = already in the stack, <0 = not landed yet
        const tilt = TILTS[i % TILTS.length];
        const shown = d >= 0 && d < visible;
        const animate = d < 0
          ? { x: 0, y: '-70vh', rotate: tilt * 3, scale: 1, opacity: 0 }
          : { x: -d * 46, y: d * 18, rotate: tilt - d * 2, scale: 1 - d * 0.05, opacity: shown ? 1 - d * 0.12 : 0 };
        return (
          <div key={item.id} className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)', zIndex: 100 - Math.abs(d), pointerEvents: 'none' }}>
            <motion.div initial={false} animate={animate} transition={reduce ? { duration: 0 } : SPRING}>
              <Card item={item} top={d === 0} n={i + 1} total={media.length} />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
