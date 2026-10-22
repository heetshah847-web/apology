import { PlannerShell } from './PlannerShell';

<<<<<<< HEAD
/** LANE-12: "The Royal Order". Works standalone; the story mounts it once she says yes. */
export function DatePlanner() {
  return (
    <section id="planner" aria-label="Plan our date" className="relative min-h-[100svh]" style={{ background: 'var(--stage)' }}>
      <PlannerShell />
=======
/** LANE-12: "The Royal Order". Works standalone; the story mounts it once she says yes.
 *  Sits in the Dreamlit Atlas bezel + stage (amber theme = the Date Bazaar's lantern light). */
export function DatePlanner() {
  return (
    <section id="planner" data-theme="amber" aria-label="Plan our date" className="min-h-[100svh] p-2 md:p-4" style={{ background: 'var(--bezel)' }}>
      <div className="stage [overflow:clip] tex-grain tex-stars min-h-[calc(100svh-1rem)] md:min-h-[calc(100svh-2rem)]">
        <div className="relative z-10">
          <PlannerShell />
        </div>
      </div>
>>>>>>> d66ca9a
    </section>
  );
}
