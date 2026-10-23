import { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import type { MediaItem } from '@/contracts';
import { FrameOutline, PhotoFrame, StatementText } from '@/design';
import { useChapter } from '@/engine';
import { MapPins } from '@/features/map/MapPins';
import config from '../../../../content/config/story.config.json';

const HANDOFF_SEC = 0.6;
const DAWN_VIOLET = '#f3c9cf';
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** distanceKm lives in content/config/story.config.json (null = hide the readout). */
const distanceKm = ((config.phases as { id: string; distanceKm?: number | null }[]).find((p) => p.id === 'distance')?.distanceKm) ?? null;

/** One statement, revealed word by word across its cue (or across `end` seconds of the chapter). */
function Statement({ text, start, end, localTime }: { text: string; start: number; end: number; localTime: MotionValue<number> }) {
  const progress = useTransform(localTime, (t) => clamp((t - start) / Math.max(0.4, (end - start) * 0.8)));
  return <StatementText text={text} progress={progress} size="small" className="mx-auto max-w-[18ch]" />;
}

/** A photo drifts further out and shrinks each time: i = 0 closest, i = n−1 smallest and farthest. */
/** story.generated.json adds `label` and `blur` to each MediaItem (beyond the frozen contract). */
type GeneratedMedia = MediaItem & { label?: string; blur?: string };

function DriftPhoto({ item, i, n, reduce }: { item: GeneratedMedia; i: number; n: number; reduce: boolean }) {
  const t = n > 1 ? i / (n - 1) : 0;
  const side = i % 2 === 0 ? -1 : 1; // her side (left) / his side (right)
  const heightVh = lerp(37, 22, t);
  const offsetVw = lerp(17, 33, t);
  return (
    <motion.div
      key={item.id}
      className="absolute left-1/2 top-1/2"
      initial={reduce ? false : { opacity: 0, x: `${side * (offsetVw - 4)}vw`, y: '-48%' }}
      animate={{ opacity: 1, x: `${side * offsetVw}vw`, y: '-50%' }}
      exit={reduce ? undefined : { opacity: 0, x: `${side * (offsetVw + 3)}vw`, y: '-52%' }}
      transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ translateX: '-50%' }}
    >
      <FrameOutline label={item.label ?? (side < 0 ? 'Her side' : 'His side')} readout={`${item.width} × ${item.height}`}>
        <div
          style={{
            height: `${heightVh}vh`, aspectRatio: `${item.width} / ${item.height}`, maxWidth: '34vw',
            backgroundImage: item.blur ? `url(${item.blur})` : undefined, backgroundSize: 'cover',
          }}
        >
          <PhotoFrame src={item.src} alt={item.alt} focal={item.focal} className="h-full w-full" />
        </div>
      </FrameOutline>
    </motion.div>
  );
}

/** LANE-10 · The Distance — "When destiny tried to be cruel". Fog theme, two pins drifting apart, photos shrinking away. */
export function DistanceChapter() {
  const reduce = !!useReducedMotion();
  const { phase, isActive, enter, exit, activeCue, activeMediaIndex, localProgress, localTime } = useChapter('distance');
  const dur = phase.end - phase.start;
  const h = HANDOFF_SEC / dur;

  const stretch = useTransform(localProgress, [0, 0.9], [0, 1], { clamp: true });
  // Heartbeat: one lub-dub inside the exit window, as the voice hands over to the apology.
  const pulse = useTransform(localProgress, [1 - h, 1 - h * 0.75, 1 - h * 0.55, 1 - h * 0.35, 1 - h * 0.1], [1, 1.1, 1, 1.07, 1], { clamp: true });
  const glow = useTransform(pulse, (p) => `drop-shadow(0 0 ${(p - 1) * 140}px var(--accent))`);
  // The fog lifts one step toward pre-dawn violet during the hand-off.
  const dawn = useTransform(localProgress, [1 - h, 1], [0, 0.5], { clamp: true });
  const kmOpacity = useTransform(localProgress, [0.45, 0.55], [0, 1], { clamp: true });
  const driftX = useTransform(localProgress, [0, 1], ['-4%', '4%']);

  const hasCopy = useMemo(() => phase.captions.some((c) => c.text.trim()), [phase.captions]);
  const cueText = activeCue?.text.trim();
  const statement = hasCopy
    ? (cueText ? { text: cueText, start: activeCue!.start - phase.start, end: activeCue!.end - phase.start } : null)
    : phase.subtitle ? { text: phase.subtitle, start: 0, end: dur * 0.3 } : null; // no script text yet → the chapter's tagline

  const opacity = isActive ? 1 - exit : 0; // first chapter of its track: visible from t=0
  const item = phase.media[activeMediaIndex] as GeneratedMedia | undefined;

  return (
    <div data-chapter="distance" className="absolute inset-0 overflow-hidden" style={{ opacity, pointerEvents: isActive ? 'auto' : 'none', color: 'var(--ink)' }}>
      {/* sea fog */}
      <motion.div
        aria-hidden className="absolute -inset-[10%]"
        style={{
          x: reduce ? 0 : driftX,
          background: 'radial-gradient(60% 45% at 25% 70%, color-mix(in oklab, var(--glow) 22%, transparent), transparent 70%), radial-gradient(55% 40% at 78% 30%, color-mix(in oklab, var(--glow) 14%, transparent), transparent 70%)',
        }}
      />
      <motion.div aria-hidden className="absolute inset-0" style={{ background: DAWN_VIOLET, opacity: reduce ? 0 : dawn, mixBlendMode: 'soft-light' }} />

      <div className="relative z-10 flex h-full flex-col px-[5vw] pb-[6vh] pt-[11vh]">
        <div className="flex h-[20vh] items-center justify-center">
          <AnimatePresence mode="wait">
            {statement && (
              <motion.div
                key={statement.text}
                initial={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.4 }}
              >
                <Statement text={statement.text} start={statement.start} end={statement.end} localTime={localTime} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative mt-14 flex-1">
          <AnimatePresence>{item && <DriftPhoto key={item.id} item={item} i={activeMediaIndex} n={phase.media.length} reduce={reduce} />}</AnimatePresence>
        </div>

        <div className="mx-auto w-full max-w-[820px]">
          <motion.div style={{ scale: reduce ? 1 : pulse, filter: reduce ? undefined : glow, transformOrigin: '50% 60%' }}>
            <MapPins stretch={reduce ? 1 : stretch} labelA="Heetu" labelB="Tanisha" className="block h-auto w-full" />
          </motion.div>
          {distanceKm != null && (
            <motion.p
              className="m-0 mt-2 text-center tabular-nums"
              style={{ opacity: reduce ? 1 : kmOpacity, fontSize: 'var(--text-ui)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}
            >
              {distanceKm.toLocaleString('en-IN')} km apart
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
