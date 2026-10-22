import { useEffect, useState } from 'react';
import { useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useChapter } from '@/engine';
import { StatementText } from '@/design';
import { PolaroidStack } from './PolaroidStack';
import { TwoSouls } from './TwoSouls';
import { statementAt, statementCues } from './statements';

/** Last 3 photos stay visible on narrow screens, 5 on desktop. */
function useVisibleCount() {
  const [n, setN] = useState(() => (window.matchMedia('(max-width: 767px)').matches ? 3 : 5));
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setN(mq.matches ? 3 : 5);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return n;
}

/** Chapter 1 of track t1: "How two souls became friends". Theme amber. */
export function FriendshipChapter() {
  const { phase, isActive, enter, exit, localProgress, localTime, activeMediaIndex } = useChapter('friendship');
  const reduce = useReducedMotion();
  const visible = useVisibleCount();
  const cues = statementCues(phase);
  const [stmt, setStmt] = useState(() => statementAt(cues, phase.start, phase));
  useMotionValueEvent(localTime, 'change', (t) => {
    const next = statementAt(cues, phase.start + t, phase);
    setStmt((p) => (p.text === next.text && Math.abs(p.progress - next.progress) < 0.04 ? p : next));
  });

  if (!isActive && exit === 1) return null;
  if (!isActive) return null;
  const fade = Math.min(enter, 1 - exit); // the souls keep glowing through the hand-off; the rest fades
  const index = reduce ? phase.media.length - 1 : activeMediaIndex;

  return (
    <div data-chapter="friendship" className="absolute inset-0 flex flex-col px-[6vw] pb-[7vh] pt-[12vh]">
      <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-6 md:grid-cols-2" style={{ opacity: fade }}>
        <div>
          <p className="mb-4 text-[var(--text-label)] uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>{phase.mapTerritory} / {phase.title}</p>
          <StatementText text={stmt.text} progress={reduce ? 1 : stmt.progress} size="small" />
        </div>
        <div className="relative h-[48vh] md:h-[62vh]">
          <PolaroidStack media={phase.media} active={index} visible={visible} />
        </div>
      </div>
      <TwoSouls progress={localProgress} exit={exit} />
    </div>
  );
}
