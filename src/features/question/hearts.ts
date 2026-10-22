import confetti from 'canvas-confetti';

/** Rose + gold heart confetti: two cannons from the lower corners, then a soft burst. Respects prefers-reduced-motion. */
export function heartConfetti() {
  const heart = confetti.shapeFromPath({
    path: 'M167 72c19-38 37-56 75-56 42 0 76 33 76 75 0 76-76 151-151 227C92 242 16 167 16 91c0-42 34-75 76-75 38 0 57 18 75 56z',
  });
  const base = { shapes: [heart], colors: ['#e7a6b8', '#f0b6c6', '#c8a45d', '#e8cf94', '#d9577a'], scalar: 2, ticks: 260, gravity: 0.8, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.85 }, startVelocity: 58 });
  confetti({ ...base, particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.85 }, startVelocity: 58 });
  window.setTimeout(() => confetti({ ...base, particleCount: 80, spread: 140, origin: { x: 0.5, y: 0.35 }, startVelocity: 32 }), 350);
}
