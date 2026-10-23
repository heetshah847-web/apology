import { motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import type { CaptionCue, MediaItem } from '@/contracts';
import { FrameOutline, PhotoFrame, StatementText } from '@/design';
import { useChapter } from '@/engine/scroll/useChapter';
import { useTrack } from '@/engine/scroll/context';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** Last 40% of the chapter: photos fade out, captions grow and centre. */
const FOCUS_FROM = 0.6;
const FADE = 0.3; // seconds of cross-fade between statements

interface CueProps { cue: CaptionCue; until: number; last: boolean; time: MotionValue<number> }

/** One statement per scene: it owns the screen from its start until the next cue begins. */
function CueStatement({ cue, until, last, time }: CueProps) {
  const opacity = useTransform(time, (t) => {
    const fadeIn = clamp((t - (cue.start - FADE * 0.5)) / FADE);
    const fadeOut = last ? 1 : clamp((until - t) / FADE);
    return Math.min(fadeIn, fadeOut);
  });
  // Words land well before the cue ends so the whole line is readable while it is still on screen.
  const reveal = useTransform(time, (t) => clamp((t - cue.start) / Math.max(0.35, (cue.end - cue.start) * 0.75)));
  const longest = Math.max(...cue.text.split(/\s+/).map((w) => w.length));
  const size = cue.text.length > 44 || longest > 11 ? 'small' : 'statement';
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity }}>
      <StatementText text={cue.text} progress={reveal} size={size} className="max-w-[16ch] md:max-w-[22ch]" />
    </motion.div>
  );
}

/**
 * The Apology — quietest moment of the site. Statements alone on screen, one photo in a labelled frame
 * that dissolves for the final 40% so only the words remain, then the stage warms to first light.
 */
export function ApologyChapter() {
  const c = useChapter('apology');
  const { time } = useTrack();
  const reduce = useReducedMotion();
  const { phase, localProgress } = c;
  const cues = phase.captions;

  const photoOpacity = useTransform(localProgress, [FOCUS_FROM - 0.12, FOCUS_FROM + 0.08], [1, 0]);
  const focus = useTransform(localProgress, [FOCUS_FROM - 0.1, FOCUS_FROM + 0.12], [0, 1]); // moves while the photo dissolves, not after
  // the words sit right of the photo, then glide to the centre of the screen once the photo has gone (no scaling: long words must not collide)
  const captionLeft = useTransform(focus, [0, 1], ['36vw', '10vw']);
  const captionRight = useTransform(focus, [0, 1], ['6vw', '10vw']);
  const warmth = useTransform(localProgress, [0.9, 1], [0, 1]);
  // Last chapter of the last track: it fades in, but never out, so the final line holds until The Question rises.
  const frameOpacity = c.enter;

  return (
    <div data-chapter="apology" className="absolute inset-0" style={{ opacity: frameOpacity, pointerEvents: 'none' }}>
      {/* first light: the background warms one step when the voice finishes */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ opacity: warmth, background: 'radial-gradient(90% 70% at 50% 85%, color-mix(in oklab, var(--glow) 34%, transparent), transparent 70%)' }}
      />

      <motion.div className="absolute left-[6vw] top-1/2 hidden w-[24vw] max-w-[360px] -translate-y-1/2 md:block" style={{ opacity: reduce ? 1 : photoOpacity }}>
        {phase.media.map((m: MediaItem, i) => (
          <div
            key={m.id}
            className={i === 0 ? 'relative' : 'absolute inset-0'}
            style={{ opacity: i === c.activeMediaIndex ? 1 : 0, transition: 'opacity 1.4s ease' }}
          >
            <FrameOutline label={(m as MediaItem & { label?: string }).label ?? 'Apology / Photo'}>
              <PhotoFrame src={m.src} alt={m.alt} focal={m.focal} className="aspect-[3/4] w-full" />
            </FrameOutline>
          </div>
        ))}
      </motion.div>

      <motion.div className="absolute inset-y-0" style={{ left: captionLeft, right: captionRight }}>
        {cues.map((cue, i) => (
          <CueStatement
            key={`${cue.start}-${i}`}
            cue={cue}
            until={cues[i + 1]?.start ?? Infinity}
            last={i === cues.length - 1}
            time={time}
          />
        ))}
      </motion.div>
    </div>
  );
}
