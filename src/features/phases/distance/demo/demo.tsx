import { createRoot } from 'react-dom/client';
import '@/index.css';
import { SmoothScroll } from '@/engine/scroll/SmoothScroll';
import { NarratedTrack } from '@/engine/scroll/NarratedTrack';
import { useStoryStore } from '@/state/storyStore';
import { DistanceChapter } from '../DistanceChapter';

/** Lane 10 harness: /src/features/phases/distance/demo/index.html (distance chapter alone inside track t2). */
function Demo() {
  const unlocked = useStoryStore((s) => s.unlocked);
  const setUnlocked = useStoryStore((s) => s.setUnlocked);
  return (
    <SmoothScroll>
      <section style={{ minHeight: '100svh', display: 'grid', placeContent: 'center', gap: 16, textAlign: 'center', background: 'var(--stage-deep)', color: 'var(--ink)' }}>
        {!unlocked && <button type="button" onClick={() => setUnlocked(true)} style={{ minHeight: 44, padding: '10px 20px' }}>Unlock</button>}
        <p style={{ margin: 0 }}>Scroll down</p>
      </section>
      <NarratedTrack trackId="t2"><DistanceChapter /></NarratedTrack>
      <section style={{ minHeight: '100svh', background: 'var(--stage-deep)' }} />
    </SmoothScroll>
  );
}
createRoot(document.getElementById('root')!).render(<Demo />);
