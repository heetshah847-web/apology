import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import type { CaptionCue } from '@/contracts';
import { FrameOutline, StatementText } from '@/design';
import { useChapter } from '@/engine';
import { Picture, getMedia, preloadNext } from '@/engine/media';
import type { ManifestItem } from '@/engine/media';
import { Moon, Motes, Petals } from './Ambience';
import { Crown } from './Crown';
import { effectiveTime, findMoments } from './queenMoments';
import './queen.css';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const pad = (n: number) => String(n).padStart(2, '0');

/** One portrait: crossfades by active index, drifts 1 → 1.06 on the (freeze-aware) clock. */
function Portrait({ item, index, active, from, to, clock, reduced, intro }: {
  item: ManifestItem; index: number; active: boolean; from: number; to: number;
  clock: MotionValue<number>; reduced: boolean; intro: MotionValue<number>;
}) {
  const scale = useTransform(clock, [from, Math.max(to, from + 0.1)], [1, 1.06], { clamp: true });
  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity: index === 0 ? intro : 1 }}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.9, ease: 'easeInOut' }}
      >
        <motion.div className="absolute inset-0" style={{ scale: reduced ? 1 : scale }}>
          <Picture
            item={item}
            sizes="(min-width: 900px) 40vh, 100vw"
            priority={index < 2}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', aspectRatio: 'auto', filter: 'var(--photo-filter)' }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Soft mirrored fill: the current portrait, huge and blurred, behind everything (desktop). */
function BlurFill({ item }: { item: ManifestItem }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={item.id}
        aria-hidden
        className="absolute inset-0 hidden md:block"
        initial={{ opacity: 0 }} animate={{ opacity: 0.32 }} exit={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
        style={{ transform: 'scale(1.25)', filter: 'blur(48px) saturate(1.1)' }}
      >
        <Picture item={item} sizes="30vw" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', aspectRatio: 'auto' }} />
      </motion.div>
    </AnimatePresence>
  );
}

/** One caption cue as big statement type, revealed along the voice. Remounts per cue. */
function Statement({ cue, time }: { cue: CaptionCue; time: MotionValue<number> }) {
  const progress = useTransform(time, (t) => clamp01((t - cue.start) / Math.max(0.3, cue.end - cue.start - 0.3)));
  return <StatementText text={cue.text} progress={progress} size="statement" className="text-left" />;
}

function TitleCard({ text, time, from, to }: { text: string; time: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(time, [from, to], [0, 1], { clamp: true });
  const y = useTransform(time, [from, to], [28, 0], { clamp: true });
  const blur = useTransform(time, [from, to], [10, 0], { clamp: true });
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const tracking = useTransform(time, [from, to + 0.6], ['0.14em', '0.02em'], { clamp: true });
  return (
    <motion.p
      className="m-0 text-left"
      style={{
        opacity, y, filter, letterSpacing: tracking,
        fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
        fontSize: 'clamp(3rem, 2rem + 4.6vw, 8rem)', lineHeight: 1,
        color: 'var(--accent)', textShadow: '0 0 48px color-mix(in oklab, var(--glow) 45%, transparent)',
      }}
    >
      {text}
    </motion.p>
  );
}

/** Phase 0 · The Queen. Lives inside <NarratedTrack trackId="t0">; the voice drives everything. */
export function QueenChapter() {
  const { phase, localTime, enter, activeCue, activeMediaIndex } = useChapter('queen');
  const reduced = !!useReducedMotion();

  const moments = useMemo(() => findMoments(phase), [phase]);
  const photos = useMemo(() => {
    const manifest = getMedia('queen');
    return phase.media.map((m, i) => ({ ...(manifest.find((x) => x.id === m.id) ?? manifest[i] ?? m), at: m.at }) as ManifestItem);
  }, [phase]);

  // Time with the "time itself paused" beat cut out: Ken Burns, petals and motes hold still, then resume.
  const clock = useTransform(localTime, (t) => effectiveTime(t, moments.freeze));
  const intro = useTransform(localTime, [1.2, 2.6], [0, 1], { clamp: true });

  const [frozen, setFrozen] = useState(false);
  useMotionValueEvent(localTime, 'change', (t) => {
    const f = !!moments.freeze && t >= moments.freeze.start && t < moments.freeze.end;
    setFrozen((prev) => (prev === f ? prev : f));
  });

  const held = useRef<CaptionCue | null>(null);
  if (activeCue) held.current = activeCue;
  const cue = held.current ?? phase.captions[0];

  const idx = Math.min(activeMediaIndex, photos.length - 1);
  const current = photos[idx];
  useEffect(() => { preloadNext('queen', idx); }, [idx]);

  const dur = phase.end - phase.start;
  const startOf = (i: number) => (photos[i].at ?? phase.start) - phase.start;
  const endOf = (i: number) => (i + 1 < photos.length ? startOf(i + 1) : dur);

  return (
    <div
      data-chapter="queen"
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: 1, pointerEvents: 'none' }}
    >
      {current && <BlurFill item={current} />}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(70% 60% at 50% 45%, transparent, var(--stage-deep) 110%)' }} />
      {/* the Queen's gold: a slow-breathing glow behind her portrait */}
      <div aria-hidden className={reduced ? 'absolute inset-0' : 'glow-breathe absolute inset-0'} style={{ background: 'radial-gradient(48% 62% at 30% 52%, color-mix(in oklab, var(--royal-gold) 26%, transparent), transparent 72%)' }} />
      {!reduced && <Motes paused={frozen} />}

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[5vh] px-[var(--gutter)] pb-14 pt-16 md:flex-row md:gap-[6vw] md:px-[8vw] md:py-0">
        <FrameOutline
          label={`Queen / Portrait ${pad(idx + 1)}`}
          readout={`${pad(idx + 1)} / ${pad(photos.length)}`}
          className="shrink-0"
        >
          <Moon time={clock} win={moments.moon} />
          <div className="relative z-10 overflow-hidden" style={{ height: 'min(76svh, 54vh + 8vw, 820px)', aspectRatio: '3 / 4', background: 'var(--stage-deep)' }}>
            {photos.map((item, i) => (
              <Portrait
                key={item.id} item={item} index={i} active={i === idx}
                from={startOf(i)} to={endOf(i)} clock={clock} reduced={reduced} intro={intro}
              />
            ))}
            <div aria-hidden className="absolute inset-0" style={{ boxShadow: 'inset 0 0 90px 10px color-mix(in oklab, var(--stage-deep) 70%, transparent)' }} />
            <Crown time={localTime} reduced={reduced} />
          </div>
        </FrameOutline>

        <div className="flex min-h-[40svh] w-full max-w-[44rem] flex-col justify-center gap-[5vh] md:min-h-0 md:flex-1">
          <p className="m-0 text-[length:var(--text-label)] uppercase tracking-[0.28em]" style={{ color: 'var(--accent)' }}>
            {phase.mapTerritory} · {phase.title}
          </p>
          <div className="min-h-[3.4em]" aria-live="polite" style={{ ['--text-statement' as string]: 'clamp(2.25rem, 1rem + 3.5vw, 5rem)' }}>
            {cue && <Statement key={cue.start} cue={cue} time={localTime} />}
          </div>
          {moments.title && (
            <TitleCard text={phase.subtitle ?? 'Queen Tanisha'} time={localTime} from={moments.title.start} to={moments.title.end} />
          )}
        </div>
      </div>

      {!reduced && <Petals time={clock} win={moments.roses} />}
    </div>
  );
}
