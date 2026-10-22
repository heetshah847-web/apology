import { createRoot } from 'react-dom/client';
import '../../index.css';
import { SmoothScroll } from '@/engine';
import { useStoryStore } from '@/state/storyStore';
import { TheQuestion } from './TheQuestion';

/** Dev/test harness (LANE-11): the Question followed by a stand-in #planner that mounts once answeredYes (as in App.tsx). */
function Page() {
  const answeredYes = useStoryStore((s) => s.answeredYes);
  return (
    <SmoothScroll>
      <TheQuestion />
      {answeredYes && <section id="planner" style={{ minHeight: '100svh', background: 'var(--stage-deep)', color: 'var(--ink)', padding: '20vh 6vw' }}><h2>Planner placeholder</h2></section>}
    </SmoothScroll>
  );
}
useStoryStore.getState().reset();
createRoot(document.getElementById('root')!).render(<Page />);
