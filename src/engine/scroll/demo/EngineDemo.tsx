import { motion, useTransform } from 'motion/react';
import type { PhaseId } from '@/contracts';
import { useStoryStore } from '@/state/storyStore';
import { NarratedTrack } from '../NarratedTrack';
import { SmoothScroll } from '../SmoothScroll';
import { useChapter } from '../useChapter';

/** Dummy chapter: shows its title, local progress and the active caption, fading by enter/exit. */
function DemoChapter({ id }: { id: PhaseId }) {
  const { phase, isActive, enter, exit, activeCue, localProgress, activeMediaIndex } = useChapter(id);
  const bar = useTransform(localProgress, (p) => `${p * 100}%`);
  const opacity = isActive ? Math.min(enter, 1 - exit) : 0;
  return (
    <div
      data-chapter={id}
      style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', gap: 16, padding: 24, textAlign: 'center', opacity, transition: 'opacity 0.1s linear', pointerEvents: isActive ? 'auto' : 'none' }}
    >
      <p style={{ margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>{phase.title} · photo {activeMediaIndex + 1}</p>
      <h1 style={{ margin: 0, fontSize: 'clamp(28px, 6vw, 64px)', lineHeight: 1 }}>{activeCue?.text ?? '…'}</h1>
      <div style={{ height: 3, width: 'min(320px, 70vw)', margin: '0 auto', background: 'var(--ink-faint)' }}>
        <motion.div style={{ height: '100%', width: bar, background: 'var(--accent)' }} />
      </div>
    </div>
  );
}

export default function EngineDemo() {
  const unlocked = useStoryStore((s) => s.unlocked);
  const setUnlocked = useStoryStore((s) => s.setUnlocked);
  return (
    <SmoothScroll>
      <section style={{ minHeight: '100svh', display: 'grid', placeContent: 'center', gap: 16, textAlign: 'center', padding: 24, background: 'var(--stage-deep, #17122c)', color: 'var(--ink, #f4efe6)' }}>
        <h1 style={{ margin: 0 }}>Engine demo · vo-1</h1>
        <p style={{ margin: 0 }}>{unlocked ? 'Scroll down: the voice will take over.' : 'Tap to unlock, then scroll down. Open with ?debug=1 to see drift.'}</p>
        {!unlocked && <button type="button" onClick={() => setUnlocked(true)} style={{ minHeight: 44, padding: '10px 20px' }}>Unlock</button>}
      </section>
      <NarratedTrack trackId="t1">
        <DemoChapter id="friendship" />
        <DemoChapter id="love" />
      </NarratedTrack>
      <section style={{ minHeight: '100svh', display: 'grid', placeContent: 'center', background: 'var(--stage-deep, #17122c)', color: 'var(--ink, #f4efe6)' }}>
        <h1>End of demo</h1>
      </section>
    </SmoothScroll>
  );
}
