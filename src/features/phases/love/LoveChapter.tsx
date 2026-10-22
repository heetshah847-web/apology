import { AnimatePresence, motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import type { MediaItem } from '@/contracts';
import { FrameOutline, PhotoFrame, StatementText } from '@/design';
import { useChapter } from '@/engine';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const TITLE_SEC = 1.2; // the quick "Us" title before the first photo

/** story.generated.json adds `label` and `blur` to each MediaItem (beyond the frozen contract). */
type GeneratedMedia = MediaItem & { label?: string; blur?: string };

const GLOW = 'radial-gradient(55% 50% at 50% 55%, color-mix(in oklab, var(--glow) 30%, transparent), transparent 70%)';

/** One statement, revealed word by word across its cue. */
function Statement({ text, start, end, localTime }: { text: string; start: number; end: number; localTime: MotionValue<number> }) {
  const progress = useTransform(localTime, (t) => clamp((t - start) / Math.max(0.4, (end - start) * 0.8)));
  return <StatementText text={text} progress={progress} size="small" className="mx-auto max-w-[22ch]" />;
}

/** Chapter 2 of track t1: "How we became partners". Theme rose. */
export function LoveChapter() {
  const reduce = !!useReducedMotion();
  const { phase, isActive, enter, exit, activeCue, activeMediaIndex, localProgress, localTime } = useChapter('love');
  const dur = phase.end - phase.start;

  const titleOpacity = useTransform(localTime, [TITLE_SEC - 0.4, TITLE_SEC + 0.2], [1, 0], { clamp: true });
  const bodyOpacity = useTransform(localTime, [TITLE_SEC - 0.2, TITLE_SEC + 0.5], [0, 1], { clamp: true });
  const thread = useTransform(localProgress, [0, 1], [0, 1], { clamp: true });

  const hasCopy = phase.captions.some((c) => c.text.trim());
  const cueText = activeCue?.text.trim();
  // No script text yet: the overlay lines carry the chapter.
  const statement = hasCopy && cueText ? { text: cueText, start: activeCue!.start - phase.start, end: activeCue!.end - phase.start } : null;

  const opacity = isActive ? Math.min(enter, 1 - exit) : 0;
  const item = phase.media[activeMediaIndex] as GeneratedMedia | undefined;
  if (!isActive) return null;

  return (
    <div data-chapter="love" className="absolute inset-0 overflow-hidden" style={{ opacity, color: 'var(--ink)' }}>
      {/* the heart-glow arriving from Friendship */}
      <div aria-hidden className="absolute inset-0" style={{ background: GLOW, opacity: reduce ? 0.8 : enter }} />

      {/* rose thread drawn across the screen with the chapter */}
      <svg aria-hidden className="absolute inset-x-0 bottom-[1vh] h-[6vh] w-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <motion.path
          d="M0 62 C 120 10, 220 100, 340 55 S 560 5, 680 55 S 880 95, 1000 40"
          fill="none" stroke="var(--accent)" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduce ? 1 : thread, opacity: 0.85 }}
        />
      </svg>

      {/* quick title (skipped with reduced motion) */}
      {!reduce && (
        <motion.div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center" style={{ opacity: titleOpacity }}>
          <h2 className="m-0" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1 }}>{phase.title}</h2>
          {phase.subtitle && <p className="mt-4 text-[length:var(--text-label)] uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>{phase.subtitle}</p>}
        </motion.div>
      )}

      <motion.div className="relative z-10 flex h-full flex-col items-center px-[5vw] pb-[9vh] pt-[11vh]" style={{ opacity: reduce ? 1 : bodyOpacity }}>
        <div className="flex h-[14vh] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {statement && (
              <motion.div key={statement.text} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.4 }}>
                <Statement text={statement.text} start={statement.start} end={statement.end} localTime={localTime} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          <AnimatePresence mode="popLayout">
            {item && (
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-h-full justify-center"
              >
                <FrameOutline label={item.label ?? `Us / ${activeMediaIndex + 1}`} readout={`${activeMediaIndex + 1} / ${phase.media.length}`}>
                  <div
                    style={{
                      aspectRatio: `${item.width} / ${item.height}`, width: `min(78vw, calc(min(46vh, 520px) * ${item.width / item.height}))`,
                      backgroundImage: item.blur ? `url(${item.blur})` : undefined, backgroundSize: 'cover',
                    }}
                  >
                    <PhotoFrame src={item.src} alt={item.alt} focal={item.focal} kenBurns={!reduce} duration={Math.max(3, dur / phase.media.length)} className="h-full w-full" />
                  </div>
                </FrameOutline>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* overlay line: display serif italic, opposite side (bottom) to the statement (top); one at a time */}
        <div className="flex h-[14vh] w-full items-end justify-center">
          <AnimatePresence mode="wait">
            {item?.overlay && (
              <motion.p
                key={item.id}
                data-overlay-line
                initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.25 }}
                className="m-0 max-w-[34ch] text-balance text-center"
                style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.1rem, 2.1vw, 1.75rem)', lineHeight: 1.3, color: 'var(--ink)' }}
              >
                {item.overlay}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
