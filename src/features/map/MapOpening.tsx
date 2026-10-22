import { useEffect, useMemo, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { audioDirector } from '@/engine';
import { useStoryStore } from '@/state/storyStore';
import { AtlasMap } from './AtlasMap';
import { GEOMETRY, PANELS, SEGMENTS, type Orientation } from './mapData';
import { storyConfig } from './storyConfig';
import { useOrientation } from './useOrientation';

type Stage = 'folded' | 'unfolding' | 'drawing' | 'ready';

const EASE = [0.22, 1, 0.36, 1] as const;
const PAPER = 'linear-gradient(160deg, #3b3770, #25214c)';

/** One fold of the map. Panels nest: each hinges on the previous panel's far edge, so the stack opens like a real accordion. */
function Panel({ k, o, open, reduced, onOpened }: { k: number; o: Orientation; open: boolean; reduced: boolean; onOpened: () => void }) {
  const g = GEOMETRY[o];
  const horizontal = o === 'landscape';
  const slice = horizontal
    ? { x: (g.w / PANELS) * k, y: 0, w: g.w / PANELS, h: g.h }
    : { x: 0, y: (g.h / PANELS) * k, w: g.w, h: g.h / PANELS };
  const odd = k % 2 === 1;
  // landscape: +rotateY swings a panel behind its hinge. portrait: rotateX has the opposite sign.
  const fold = (horizontal ? 1 : -1) * (odd ? 180 : -180);
  const rotKey = horizontal ? 'rotateY' : 'rotateX';
  const z = odd ? -2 : 2;
  const last = k === PANELS - 1;
  const delay = 0.1 + (k - 1) * 0.45;

  const size: React.CSSProperties = horizontal
    ? { width: k === 0 ? `${100 / PANELS}%` : '100%', height: '100%' }
    : { height: k === 0 ? `${100 / PANELS}%` : '100%', width: '100%' };
  const place: React.CSSProperties = k === 0
    ? { position: 'relative' }
    : horizontal ? { position: 'absolute', top: 0, left: '100%' } : { position: 'absolute', left: 0, top: '100%' };

  const initial = k === 0 ? false : { [rotKey]: reduced || open ? 0 : fold, z: reduced || open ? 0 : z };
  const to = { [rotKey]: open ? 0 : fold, z: open ? 0 : z };

  return (
    <motion.div
      initial={initial}
      animate={k === 0 ? undefined : to}
      transition={reduced ? { duration: 0 } : { duration: 1.3, delay: open ? delay : 0, ease: EASE }}
      onAnimationComplete={() => { if (last && open) onOpened(); }}
      style={{
        ...size, ...place, transformStyle: 'preserve-3d',
        transformOrigin: horizontal ? 'left center' : 'center top',
        willChange: 'transform',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden', background: PAPER }}>
        <AtlasMap orientation={o} layer="base" slice={slice} className="block h-full w-full" title="" />
        {/* crease shading: darker while folded, a faint seam once flat */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: open ? 0.22 : 0.75 }}
          transition={reduced ? { duration: 0 } : { duration: 1.4, delay: open ? delay : 0 }}
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: horizontal
              ? 'linear-gradient(90deg, rgba(8,6,15,.8), transparent 14%, transparent 86%, rgba(8,6,15,.5))'
              : 'linear-gradient(180deg, rgba(8,6,15,.8), transparent 14%, transparent 86%, rgba(8,6,15,.5))',
          }}
        />
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: horizontal ? 'rotateY(180deg)' : 'rotateX(180deg)', background: 'linear-gradient(160deg,#2c2858,#1c1840)',
          boxShadow: 'inset 0 0 0 3px rgba(200,164,93,.35)',
        }}
      />
      {k < PANELS - 1 && <Panel k={k + 1} o={o} open={open} reduced={reduced} onOpened={onOpened} />}
    </motion.div>
  );
}

/** The cover of the folded map (fades as it opens). */
function Cover({ visible, wide }: { visible: boolean; wide: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[6%] text-center"
      style={{ background: PAPER, boxShadow: 'inset 0 0 0 4px rgba(200,164,93,.7), inset 0 0 0 9px rgba(200,164,93,.25)', pointerEvents: 'none' }}
    >
      <svg viewBox="-40 -30 80 60" className={wide ? 'w-[14%]' : 'w-[28%]'} fill="var(--royal-gold,#c8a45d)" aria-hidden>
        <path d="M-30 14L-34 -16L-16 -2L0 -24L16 -2L34 -16L30 14ZM-30 20H30" />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: wide ? 'clamp(.9rem,2.1vw,1.9rem)' : 'clamp(.9rem,5.5vw,1.5rem)', lineHeight: 1.05, color: 'var(--royal-gold,#c8a45d)', padding: '0 8%' }}>
        {storyConfig.meta.siteTitle}
      </span>
    </motion.div>
  );
}

export function MapOpening() {
  const reduced = !!useReducedMotion();
  const o = useOrientation();
  const g = GEOMETRY[o];
  const horizontal = o === 'landscape';
  const [stage, setStage] = useState<Stage>('folded');
  const drawn = useMotionValue(0);
  const setSoundOn = useStoryStore((s) => s.setSoundOn);
  const setUnlocked = useStoryStore((s) => s.setUnlocked);
  const { hero, mapIntro } = storyConfig;
  const open = stage !== 'folded';

  // The opening is the top of the page: start there and hold still until the map is open.
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const el = document.documentElement;
    el.style.overflow = stage === 'ready' ? '' : 'hidden';
    return () => { el.style.overflow = ''; };
  }, [stage]);

  const tap = () => {
    if (stage !== 'folded') return;
    // Must run inside the tap (iOS Safari only unlocks audio from a user gesture).
    const unlocked = audioDirector.unlock();
    unlocked.then(() => audioDirector.sfx('unfold')).catch(() => {});
    setSoundOn(true);
    setUnlocked(true);
    setStage('unfolding');
    if (reduced) { drawn.set(SEGMENTS); window.setTimeout(() => setStage('ready'), 450); }
  };

  const onOpened = () => {
    if (reduced) return;
    setStage((s) => (s === 'unfolding' ? 'drawing' : s));
  };

  useEffect(() => {
    if (stage !== 'drawing') return;
    const c = animate(drawn, SEGMENTS, { duration: 3.4, ease: 'easeInOut', delay: 0.5, onComplete: () => setStage('ready') });
    return () => c.stop();
  }, [stage, drawn]);

  const ratio = g.w / g.h;
  const packetShift = ((PANELS - 1) / (2 * PANELS)) * 100; // % of the map box that centres the closed packet
  const rootStyle = useMemo<React.CSSProperties>(() => ({
    position: 'relative', width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: `${ratio}`, transformStyle: 'preserve-3d',
  }), [ratio]);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      style={{
        height: '100svh',
        background: 'radial-gradient(120% 90% at 50% 20%, #2f2a5c 0%, var(--night-ink,#1e1a3a) 55%, #120f26 100%)',
        color: 'var(--ink,#eee8f4)',
        paddingTop: 'var(--header-h, 76px)',
      }}
      aria-label={storyConfig.meta.siteTitle}
    >
      <StarDust reduced={reduced} />

      <header className="relative z-10 px-[var(--gutter,1rem)] text-center">
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1rem,.8rem + 1vw,1.6rem)', color: 'var(--ink-soft)' }}>{hero.kicker}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 1rem + 5.2vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.015em', margin: '.1em 0 .2em' }}>{hero.names}</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(.95rem,.8rem + .5vw,1.35rem)', color: 'var(--ink-soft)', maxWidth: '34ch', margin: '0 auto' }}>{hero.line}</p>
      </header>

      {/* map stage */}
      <div className="relative z-10 min-h-0 flex-1" style={{ containerType: 'size', padding: '.9rem 0' }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '2200px', perspectiveOrigin: '50% 40%' }}>
          <motion.div
            initial={false}
            animate={horizontal ? { x: open ? '0%' : `${packetShift}%` } : { y: open ? '0%' : `${packetShift}%` }}
            transition={reduced ? { duration: 0 } : { duration: 2.6, ease: EASE }}
            style={{ ...rootStyle, filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.55))' }}
          >
            <Panel k={0} o={o} open={open} reduced={reduced} onOpened={onOpened} />
            {/* cover sits on the folded packet only */}
            <div className="absolute left-0 top-0" style={{ width: horizontal ? `${100 / PANELS}%` : '100%', height: horizontal ? '100%' : `${100 / PANELS}%`, pointerEvents: 'none', transform: 'translateZ(3px)' }}>
              <Cover visible={!open} wide={horizontal} />
            </div>
            {/* trail, pins and territory names appear once the map lies flat */}
            <motion.div
              initial={false}
              animate={{ opacity: stage === 'drawing' || stage === 'ready' ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.8 }}
              className="absolute inset-0"
              style={{ pointerEvents: 'none', transform: 'translateZ(1px)' }}
            >
              <AtlasMap orientation={o} layer="overlay" drawn={drawn} className="block h-full w-full" title="" />
            </motion.div>
            {/* the tap target is the packet itself */}
            {stage === 'folded' && (
              <button
                type="button"
                onClick={tap}
                aria-label={mapIntro.tapLabel}
                className="absolute left-0 top-0 cursor-pointer rounded-[4px]"
                style={{ width: horizontal ? `${100 / PANELS}%` : '100%', height: horizontal ? '100%' : `${100 / PANELS}%`, background: 'transparent', border: 0 }}
              />
            )}
          </motion.div>
        </div>
      </div>

      <footer className="relative z-10 flex flex-col items-center gap-3 px-[var(--gutter,1rem)] pb-6 text-center" style={{ minHeight: '5.5rem' }}>
        {stage === 'folded' ? (
          <button
            type="button"
            onClick={tap}
            className="rounded-full px-6 py-3"
            style={{ border: '1px solid var(--line)', background: 'color-mix(in oklab, var(--moon-pearl,#eee8f4) 8%, transparent)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-ui,.875rem)', backdropFilter: 'blur(6px)' }}
          >
            {mapIntro.tapLabel}
          </button>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: stage === 'ready' ? 1 : 0, y: stage === 'ready' ? 0 : 8 }}
            transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
            style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.05rem,.9rem + .6vw,1.5rem)', color: 'var(--ink)' }}
          >
            {mapIntro.afterUnfold}
            <ScrollTick reduced={reduced} />
          </motion.p>
        )}
        <Readout text={hero.readout} />
      </footer>
    </section>
  );
}

/** Design-tool style coordinates readout inside a thin frame with corner handles. */
function Readout({ text }: { text: string }) {
  const handle = (pos: React.CSSProperties) => <span aria-hidden style={{ position: 'absolute', width: 6, height: 6, background: 'var(--frame,#e2cf9c)', ...pos }} />;
  return (
    <div className="relative px-4 py-1.5" style={{ border: '1px solid var(--line)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-label,.75rem)', color: 'var(--ink-soft)', letterSpacing: '.04em' }}>
      {handle({ left: -3, top: -3 })}{handle({ right: -3, top: -3 })}{handle({ left: -3, bottom: -3 })}{handle({ right: -3, bottom: -3 })}
      <span style={{ opacity: 0.6 }}>Atlas / Ahmedabad&nbsp;&nbsp;</span>{text}
    </div>
  );
}

function ScrollTick({ reduced }: { reduced: boolean }) {
  return (
    <span aria-hidden className="mx-auto mt-2 block h-8 w-px overflow-hidden" style={{ background: 'var(--line)' }}>
      <motion.span
        className="block h-3 w-px"
        style={{ background: 'var(--accent,#c8a45d)' }}
        animate={reduced ? undefined : { y: [-12, 32] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </span>
  );
}

/** Slowly drifting star dust (CSS only, so it costs nothing on the main thread). */
function StarDust({ reduced }: { reduced: boolean }) {
  const stars = useMemo(() => {
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 42 }, () => ({ x: r() * 100, y: r() * 100, d: 0.8 + r() * 1.8, t: 5 + r() * 9, o: 0.25 + r() * 0.5 }));
  }, []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`, width: s.d, height: s.d, opacity: s.o,
            background: 'var(--moon-pearl,#eee8f4)',
            animation: reduced ? undefined : `atlas-drift ${s.t}s ease-in-out ${-s.t * (i % 5) / 5}s infinite alternate`,
          }}
        />
      ))}
      <style>{`@keyframes atlas-drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(10px,-18px,0)}}`}</style>
    </div>
  );
}
