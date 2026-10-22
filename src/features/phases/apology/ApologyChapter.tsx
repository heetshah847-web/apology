import { useState } from 'react';
import { useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useChapter } from '@/engine';
import { StatementText, FrameOutline, PhotoFrame } from '@/design';
import { statementAt, statementCues } from './statements';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, v: number) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };

/** Chapter 4 of the story, second chapter of track t2: "I'm sorry". Theme dawn. The quietest moment of the site. */
export function ApologyChapter() {
  const { phase, isActive, enter, exit, localProgress, localTime, activeMediaIndex } = useChapter('apology');
  const reduce = useReducedMotion();
  const cues = statementCues(phase);
  const [stmt, setStmt] = useState(() => statementAt(cues, phase.start, phase));
  const [prog, setProg] = useState(() => localProgress.get());
  useMotionValueEvent(localTime, 'change', (t) => {
    const next = statementAt(cues, phase.start + t, phase);
    setStmt((p) => (p.text === next.text && Math.abs(p.progress - next.progress) < 0.04 ? p : next));
  });
  useMotionValueEvent(localProgress, 'change', (p) => setProg((q) => (Math.abs(p - q) >= 0.01 || p >= 1 || p <= 0 ? p : q)));

  // The last chapter of the track: it must stay on screen once the voice has ended (isActive turns false at t = end).
  const finished = prog >= 0.999;
  if (!isActive && !finished) return null;

  const lead = enter; // last chapter: no fade-out, the Question rises from this screen
  const tail = reduce ? 1 : smooth(0.6, 0.76, prog);          // final ~40%: photos leave, captions grow and centre
  const photoOpacity = reduce ? (prog > 0.6 ? 0 : 1) : 1 - tail;
  const photo = phase.media[Math.min(activeMediaIndex, phase.media.length - 1)];
  const dawn = reduce ? (finished ? 1 : 0) : smooth(0.94, 1, prog); // first light

  return (
    <div data-chapter="apology" data-tail={tail > 0.5 ? 'captions' : 'photos'} className="absolute inset-0 overflow-hidden" style={{ opacity: lead }}>
      <div
        aria-hidden className="absolute inset-0 transition-opacity duration-[1500ms]"
        style={{ opacity: dawn, background: 'radial-gradient(120% 90% at 50% 105%, color-mix(in oklab, var(--glow) 34%, transparent), transparent 70%)' }}
      />
      <div className="absolute inset-0 flex items-center px-[6vw] pb-[7vh] pt-[12vh]">
        <div
          className="grid w-full items-center"
          style={{ gridTemplateColumns: `minmax(0, ${1 + tail * 1.2}fr) minmax(0, ${(1 - tail) * 1}fr)`, gap: `${(1 - tail) * 4}vw` }}
        >
          <div style={{ transform: `scale(${1 + tail * 0.12})` }}>
            <p className="mb-5 text-center text-[length:var(--text-label)] uppercase tracking-[0.3em] md:text-left" style={{ color: 'var(--accent)', opacity: 1 - tail }}>
              {phase.mapTerritory} / {phase.title}
            </p>
            <StatementText text={stmt.text} progress={reduce ? 1 : stmt.progress} size={tail > 0.5 ? 'statement' : 'small'} />
          </div>
          {photo && (
            <div className="hidden justify-self-center md:block" style={{ opacity: photoOpacity, width: `${photoOpacity * 100}%`, maxWidth: 'min(30vw, 42vh)', pointerEvents: 'none' }} aria-hidden={photoOpacity < 0.05}>
              <FrameOutline label={(photo as { label?: string }).label ?? `Apology / ${photo.id}`} readout={`${Math.round(prog * 100)}% of the way back`}>
                <PhotoFrame src={photo.src} alt={photo.alt} focal={photo.focal as [number, number] | undefined} className="aspect-[3/4] w-full" />
              </FrameOutline>
            </div>
          )}
        </div>
      </div>
      {/* narrow screens: the photo sits as a quiet backdrop instead of a second column */}
      {photo && (
        <img src={photo.src} alt="" aria-hidden className="absolute inset-0 -z-0 h-full w-full object-cover md:hidden" style={{ opacity: 0.22 * photoOpacity, filter: 'var(--photo-filter)' }} />
      )}
    </div>
  );
}
