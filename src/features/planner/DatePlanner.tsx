import { PlannerShell } from './PlannerShell';

/** LANE-12: "The Royal Order". Works standalone; the story mounts it once she says yes. */
export function DatePlanner() {
  return (
    <section id="planner" aria-label="Plan our date" className="relative min-h-[100svh]" style={{ background: 'var(--stage)' }}>
      <PlannerShell />
    </section>
  );
}
