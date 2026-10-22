import { useMemo, useRef } from 'react';
import { easeInOut, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { PhaseId } from '@/contracts';
import { SCENE_PIN_VH, SCROLL_VH_PER_SEC } from '@/contracts/scroll-feel';
import { audioDirector, getPhase } from '@/engine';
import { AtlasMap, territoryName, type MapCamera } from './AtlasMap';
import { GEOMETRY, SEGMENTS, routeIndex } from './mapData';
import { useOrientation } from './useOrientation';

/** The territory the camera leaves from (the map the reader just walked), or the whole atlas for the first interlude. */
const PREVIOUS: Partial<Record<PhaseId, PhaseId>> = { friendship: 'queen', distance: 'love' };

/**
 * ~3s of scroll between voice tracks: the camera travels from the previous territory to the next, the trail inks
 * the segment between them, a pin drops, and the territory's name fades in. Scrubbed by scroll, so it reverses exactly.
 */
export function AtlasInterlude({ to }: { to: PhaseId }) {
  const reduced = !!useReducedMotion();
  const o = useOrientation();
  const g = GEOMETRY[o];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useMotionValue(reduced ? 1 : 0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => { if (!reduced) p.set(v); });

  const phase = getPhase(to);
  const dest = g.spots[to];
  const from = PREVIOUS[to] ? g.spots[PREVIOUS[to]!] : null;
  const idx = routeIndex(to);
  const first = from === null; // before the Queen: step from the whole atlas into her court

  const cx = useTransform(p, [0, 1], [from ? from.x : g.w / 2, dest.x], { ease: easeInOut });
  const cy = useTransform(p, [0, 1], [from ? from.y : g.h / 2, dest.y], { ease: easeInOut });
  // travelling between two territories pulls back in the middle so the journey reads as distance covered
  const zoom = useTransform(p, first ? [0, 1] : [0, 0.5, 1], first ? [1, g.zoomIn] : [g.zoomIn, g.zoomIn * 0.55, g.zoomIn], { ease: easeInOut });
  const cam = useMemo<MapCamera>(() => ({ cx, cy, zoom }), [cx, cy, zoom]);

  // 0..5 trail. First interlude: the opening's whole trail rewinds to the Queen. Others: ink the segment into this territory.
  const drawn = useTransform(p, first ? [0, 0.7] : [0.15, 0.75], first ? [SEGMENTS, 0] : [idx - 1, idx], { clamp: true });
  const nameOpacity = useTransform(p, [0.68, 0.9], [0, 1]);
  const nameY = useTransform(p, [0.68, 0.9], [16, 0]);

  const pinned = useRef(false);
  useMotionValueEvent(p, 'change', (v) => {
    if (reduced) return;
    if (v > 0.74 && !pinned.current) { pinned.current = true; audioDirector.sfx('pin'); }
    else if (v < 0.4) pinned.current = false;
  });

  const heightVh = reduced ? 100 : 100 + SCENE_PIN_VH.mapInterludeSec * SCROLL_VH_PER_SEC;

  return (
    <section ref={ref} aria-label={territoryName(to)} style={{ position: 'relative', height: `${heightVh}svh`, background: '#2a2656' }}>
      <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>
        <AtlasMap orientation={o} camera={cam} drawn={drawn} active={to} hideActiveLabel fit="slice" className="absolute inset-0 h-full w-full" title="" />
        {/* soft vignette keeps the territory name readable over the map */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(90% 70% at 50% 45%, transparent 40%, rgba(16,12,36,.65) 100%), linear-gradient(0deg, rgba(16,12,36,.8), transparent 38%)' }} />
        <motion.div
          style={{ opacity: nameOpacity, y: nameY }}
          className="pointer-events-none absolute inset-x-0 bottom-[10svh] px-[var(--gutter,1rem)] text-center"
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-ui,.875rem)', color: 'var(--ink-soft)', marginBottom: '.25rem' }}>
            {phase.subtitle ?? phase.title}
          </p>
          <h2 style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(3rem,1.5rem + 7vw,7.5rem)', lineHeight: 1, color: 'var(--royal-gold,#c8a45d)', textShadow: '0 2px 24px rgba(0,0,0,.6)' }}>
            {territoryName(to)}
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
