import confetti from 'canvas-confetti';

const COLORS = ['#e7a6b8', '#f0b6c6', '#c8a45d', '#e8cf94'];

/** Heart confetti in rose and gold; skipped under prefers-reduced-motion. */
export function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heart = confetti.shapeFromPath({ path: 'M167 72c19-38 37-56 75-56 42 0 76 33 75 76 0 76-76 151-148 227C95 243 20 168 20 92c0-43 33-76 75-76 39 0 57 18 72 56z' });
  const burst = (x: number, angle: number) => confetti({
    particleCount: 38, angle, spread: 62, startVelocity: 55, origin: { x, y: 0.75 },
    shapes: [heart], colors: COLORS, scalar: 2.2, ticks: 220, gravity: 0.9, flat: true,
  });
  burst(0.1, 60);
  burst(0.9, 120);
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { x: 0.5, y: 0.5 }, shapes: [heart], colors: COLORS, scalar: 2, ticks: 260, flat: true }), 350);
}
