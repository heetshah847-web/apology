import { createRoot } from 'react-dom/client';
import '../../index.css';
import { DatePlanner } from './DatePlanner';

/** Dev/test harness mounting the planner without the story (LANE-12). */
createRoot(document.getElementById('root')!).render(<DatePlanner />);
