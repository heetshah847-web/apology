/** A small canvas starfield that blooms behind the "Yes": ~160 twinkling stars, drifting up, then fading away. No dependencies. */
export function starfield(durationMs = 7000) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '40' });
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const colours = ['#f1c9cf', '#e9a9b6', '#f8e2e4', '#d9a3ad'];
  const stars = Array.from({ length: 160 }, () => ({
    x: Math.random() * w, y: Math.random() * h, r: 0.6 + Math.random() * 1.8,
    tw: Math.random() * Math.PI * 2, sp: 0.8 + Math.random() * 1.6, rise: 6 + Math.random() * 18,
    c: colours[Math.floor(Math.random() * colours.length)],
  }));

  const t0 = performance.now();
  const frame = (now: number) => {
    const t = now - t0;
    if (t > durationMs) { canvas.remove(); return; }
    const k = Math.min(1, t / 1200) * Math.min(1, (durationMs - t) / 1800); // fade in, hold, fade out
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const y = (((s.y - (s.rise * t) / 1000) % h) + h) % h;
      const a = k * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw + (t / 1000) * s.sp * 2)));
      ctx.globalAlpha = a;
      ctx.fillStyle = s.c;
      ctx.shadowColor = s.c; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
