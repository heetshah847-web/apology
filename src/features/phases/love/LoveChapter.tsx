import { useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react';
import type { MediaItem } from '@/contracts';
import { useChapter } from '@/engine';
import { FrameOutline, PhotoFrame, StatementText } from '@/design';
import { statementAt, statementCues } from '../friendship/statements';

type LoveMedia = MediaItem & { overlay?: string; label?: string; width?: number; height?: number };

/** A thin rose thread that draws itself across the foot of the screen as the chapter plays. */
function RoseThread({ progress }: { progress: ReturnType<typeof useChapter>['localProgress'] }) {
  const draw = useTransform(progress, [0, 1], [0, 1]);
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-x-[6vw] bottom-[5vh] h-10 w-[88vw]" viewBox="0 0 880 40" preserveAspectRatio="none" fill="none">
      <motion.path
        d="M0 22 C 110 2, 190 40, 300 20 S 480 4, 580 22 S 760 38, 880 14"
        stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke"
        style={{ pathLength: draw, opacity: 0.75 }}
      />
    </svg>
  );
}

/** Chapter 2 of track t1: "How we became partners". Theme rose. One photo at a time, never cropped. */
export function LoveChapter() {
  const { phase, isActive, enter, exit, localProgress, localTime, activeMediaIndex } = useChapter('love');
  const reduce = useReducedMotion();
  const cues = statementCues(phase);
  const [stmt, setStmt] = useState(() => statementAt(cues, phase.start, phase));
  useMotionValueEvent(localTime, 'change', (t) => {
    const next = statementAt(cues, phase.start + t, phase);
    setStmt((p) => (p.text === next.text && Math.abs(p.progress - next.progress) < 0.04 ? p : next));
  });

  if (!isActive) return null;
  const fade = Math.min(enter, 1 - exit);
  const media = phase.media as LoveMedia[];
  const current = media[activeMediaIndex];

  return (
    <div data-chapter="love" className="absolute inset-0 flex flex-col px-[6vw] pb-[10vh] pt-[12vh]" style={{ opacity: fade }}>
      {/* the heart-glow arrives from Friendship and stays as the room's rose light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: Math.min(1, enter * 1.2), background: 'radial-gradient(70% 60% at 68% 50%, color-mix(in oklab, var(--glow) 22%, transparent), transparent 70%)' }}
      />
      <div className="relative grid min-h-0 flex-1 grid-cols-1 items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-[5vw]">
        <div>
          <p className="mb-4 text-[var(--text-label)] uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>{phase.mapTerritory} / {phase.title}</p>
          <StatementText text={stmt.text} progress={reduce ? 1 : stmt.progress} size="small" className="text-left!" />
        </div>

        <div className="flex flex-col items-center justify-center [--stage-h:40vh] md:[--stage-h:54vh]">
          <div className="relative flex w-full items-center justify-center" style={{ height: 'var(--stage-h)' }}>
            {media.map((m, i) => {
              const ratio = (m.width ?? 4) / (m.height ?? 3);
              return (
                <div
                  key={m.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ opacity: i === activeMediaIndex ? 1 : 0, transition: 'opacity 0.9s ease' }}
                  aria-hidden={i !== activeMediaIndex}
                >
                  <FrameOutline
                    label={m.label ?? 'Us / Photo'}
                    readout={`${String(i + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`}
                    style={{ width: `min(100%, calc(var(--stage-h) * ${ratio}))` }}
                  >
                    <div className="relative w-full" style={{ aspectRatio: `${ratio}` }}>
                      <PhotoFrame src={m.src} alt={m.alt} focal={m.focal} className="absolute! inset-0" />
                    </div>
                  </FrameOutline>
                </div>
              );
            })}
          </div>
          {/* at most one overlay line, opposite side to the statement, only for photos that have one */}
          <p
            key={current?.id}
            aria-live="polite"
            className="mt-12 min-h-[3.2em] max-w-[34ch] text-center italic"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.05rem, 1.5vw, 1.4rem)', color: 'var(--ink-soft)', opacity: current?.overlay ? 1 : 0, transition: 'opacity 0.8s ease' }}
          >
            {current?.overlay ?? ''}
          </p>
        </div>
      </div>
      <RoseThread progress={localProgress} />
    </div>
  );
}
