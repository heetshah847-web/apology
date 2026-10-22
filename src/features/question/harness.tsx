import { createRoot } from 'react-dom/client';
import '../../index.css';
import { SmoothScroll } from '@/engine/scroll/SmoothScroll';
import { NarratedTrack } from '@/engine/scroll/NarratedTrack';
import { useStoryStore } from '@/state/storyStore';
import { ApologyChapter } from '../phases/apology/ApologyChapter';
import { DatePlanner } from '../planner/DatePlanner';
import { TheQuestion } from './TheQuestion';

/** Dev/test harness for lane 11: the apology track tail + the question + the planner (no gate, no other chapters). */
function Harness() {
  const answeredYes = useStoryStore((s) => s.answeredYes);
  return (
    <SmoothScroll>
      <NarratedTrack trackId="t2"><ApologyChapter /></NarratedTrack>
      <TheQuestion />
      {answeredYes && <DatePlanner />}
    </SmoothScroll>
  );
}
createRoot(document.getElementById('root')!).render(<Harness />);
