import { PlannerShell } from './PlannerShell';

/** LANE-12: "The Royal Order". Works standalone; the story mounts it once she says yes.
 *  A calm beige page holding the white list panel and the baby-pink cart summary. */
export function DatePlanner() {
  return (
    <section id="planner" data-theme="rose" aria-label="Plan our date" style={{ background: 'var(--beige)' }}>
      <PlannerShell />
    </section>
  );
}
