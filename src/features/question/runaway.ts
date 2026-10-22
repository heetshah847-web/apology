export interface Box { x: number; y: number; w: number; h: number }

/** Random top-left for the No button inside `arena` (all coords arena-relative), clear of `avoid` and far from `from`. */
export function pickSpot(arena: { w: number; h: number }, no: { w: number; h: number }, avoid: Box, from: { x: number; y: number }, pad = 12, rand = Math.random): { x: number; y: number } {
  const maxX = Math.max(pad, arena.w - no.w - pad);
  const maxY = Math.max(pad, arena.h - no.h - pad);
  const hit = (x: number, y: number) =>
    x < avoid.x + avoid.w + 16 && x + no.w + 16 > avoid.x && y < avoid.y + avoid.h + 16 && y + no.h + 16 > avoid.y;
  let best = { x: pad, y: pad };
  let bestD = -1;
  for (let i = 0; i < 60; i++) {
    const x = pad + rand() * (maxX - pad);
    const y = pad + rand() * (maxY - pad);
    if (hit(x, y)) continue;
    const d = Math.hypot(x - from.x, y - from.y);
    if (d > Math.min(arena.w, arena.h) * 0.45) return { x, y };
    if (d > bestD) { bestD = d; best = { x, y }; }
  }
  return best;
}
