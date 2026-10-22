import type { PhaseId } from '@/contracts';

/** Every named place on the atlas. `bazaar` is the Date Planner territory (not a story phase). */
export type TerritoryId = PhaseId | 'bazaar';
export type Orientation = 'landscape' | 'portrait';

/** The journey, in order. Segment k joins ROUTE[k] → ROUTE[k+1]; `drawn` runs 0..SEGMENTS. */
export const ROUTE: TerritoryId[] = ['queen', 'friendship', 'love', 'distance', 'apology', 'bazaar'];
export const SEGMENTS = ROUTE.length - 1;
export const BAZAAR_NAME = 'The Date Bazaar';

/** Number of folds in the folded map (docs: 4–6 panels). */
export const PANELS = 4;

export interface Spot { x: number; y: number; r: number; /** label offset from the default spot (below the land) */ label?: { dx: number; dy: number } }
interface Land { x: number; y: number; rx: number; ry: number; seed: number }

export interface MapGeometry {
  w: number;
  h: number;
  spots: Record<TerritoryId, Spot>;
  lands: Land[];
  compass: { x: number; y: number; s: number };
  labelSize: number;
  pinScale: number;
  /** Camera zoom used when "standing inside" a territory. */
  zoomIn: number;
}

export const GEOMETRY: Record<Orientation, MapGeometry> = {
  landscape: {
    w: 1600, h: 1000,
    spots: {
      queen: { x: 270, y: 270, r: 150 },
      friendship: { x: 610, y: 570, r: 170 },
      love: { x: 1010, y: 330, r: 185 },
      distance: { x: 1090, y: 660, r: 150, label: { dx: 0, dy: 95 } },
      apology: { x: 1240, y: 850, r: 85, label: { dx: -40, dy: 40 } },
      bazaar: { x: 1450, y: 790, r: 125, label: { dx: 0, dy: -150 } },
    },
    lands: [
      { x: 270, y: 270, rx: 170, ry: 140, seed: 11 },
      { x: 610, y: 570, rx: 190, ry: 150, seed: 23 },
      { x: 1010, y: 330, rx: 205, ry: 165, seed: 37 },
      { x: 1240, y: 850, rx: 95, ry: 70, seed: 41 },
      { x: 1450, y: 790, rx: 140, ry: 110, seed: 53 },
      { x: 130, y: 640, rx: 70, ry: 50, seed: 61 },
      { x: 780, y: 130, rx: 80, ry: 52, seed: 67 },
      { x: 420, y: 860, rx: 95, ry: 60, seed: 71 },
    ],
    compass: { x: 170, y: 830, s: 1 },
    labelSize: 40,
    pinScale: 1.5,
    zoomIn: 2.5,
  },
  portrait: {
    w: 800, h: 1200,
    spots: {
      queen: { x: 235, y: 195, r: 120 },
      friendship: { x: 565, y: 385, r: 125 },
      love: { x: 235, y: 610, r: 135 },
      distance: { x: 540, y: 810, r: 110, label: { dx: 0, dy: 80 } },
      apology: { x: 215, y: 975, r: 62 },
      bazaar: { x: 590, y: 1020, r: 90 },
    },
    lands: [
      { x: 235, y: 195, rx: 135, ry: 105, seed: 11 },
      { x: 565, y: 385, rx: 140, ry: 110, seed: 23 },
      { x: 235, y: 610, rx: 150, ry: 120, seed: 37 },
      { x: 215, y: 975, rx: 75, ry: 55, seed: 41 },
      { x: 590, y: 1020, rx: 105, ry: 78, seed: 53 },
      { x: 90, y: 820, rx: 55, ry: 40, seed: 61 },
      { x: 710, y: 600, rx: 50, ry: 65, seed: 67 },
    ],
    compass: { x: 680, y: 130, s: 0.8 },
    labelSize: 40,
    pinScale: 1.2,
    zoomIn: 2.2,
  },
};

// ── geometry helpers ───────────────────────────────────────────────────────
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const f = (n: number) => Math.round(n * 10) / 10;

/** Organic coastline: a noisy ellipse smoothed with a closed Catmull-Rom spline. */
export function blobPath({ x, y, rx, ry, seed }: Land, n = 16, jag = 0.34): string {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 - jag / 2 + rand() * jag;
    pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

/** One cubic per segment of the route, gently bowed so the path reads as a hand-drawn trail. */
export function routeSegments(o: Orientation): string[] {
  const g = GEOMETRY[o];
  const pts = ROUTE.map((id) => g.spots[id]);
  return pts.slice(0, -1).map((p1, k) => {
    const p2 = pts[k + 1];
    const p0 = pts[k - 1] ?? p1;
    const p3 = pts[k + 2] ?? p2;
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const bow = (k % 2 === 0 ? 1 : -1) * 0.16;
    const px = -dy * bow, py = dx * bow;
    const c1x = p1.x + (p2.x - p0.x) / 6 + px, c1y = p1.y + (p2.y - p0.y) / 6 + py;
    const c2x = p2.x - (p3.x - p1.x) / 6 + px, c2y = p2.y - (p3.y - p1.y) / 6 + py;
    return `M${f(p1.x)} ${f(p1.y)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
  });
}

export type GlyphKind = 'tree' | 'peak' | 'flower' | 'tent' | 'wave' | 'tower';
export interface Glyph { kind: GlyphKind; x: number; y: number; s: number }

const GLYPH_COUNTS: Partial<Record<TerritoryId, [GlyphKind, number][]>> = {
  queen: [['peak', 5], ['tower', 2], ['tree', 4]],
  friendship: [['tree', 11], ['peak', 3]],
  love: [['flower', 14], ['tree', 4]],
  apology: [['tree', 2]],
  bazaar: [['tent', 5], ['flower', 2]],
};

/** Deterministic scatter of little map symbols around each territory (never over its label/icon zone). */
export function scatterGlyphs(o: Orientation): Glyph[] {
  const g = GEOMETRY[o];
  const out: Glyph[] = [];
  const unit = o === 'landscape' ? 1 : 0.8;
  (Object.keys(GLYPH_COUNTS) as TerritoryId[]).forEach((id, ti) => {
    const sp = g.spots[id];
    const rand = rng(900 + ti * 31 + (o === 'landscape' ? 0 : 7));
    for (const [kind, count] of GLYPH_COUNTS[id]!) {
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const rr = sp.r * (0.38 + rand() * 0.52);
        const gx = sp.x + Math.cos(a) * rr * 1.1, gy = sp.y + Math.sin(a) * rr * 0.8;
        if (Math.abs(gx - sp.x) < sp.r * 0.3 && Math.abs(gy - sp.y) < sp.r * 0.3) continue; // keep the icon zone clear
        out.push({ kind, x: f(gx), y: f(gy), s: f((0.8 + rand() * 0.5) * unit) });
      }
    }
  });
  // loose waves on open water
  const rand = rng(4242);
  const waveCount = o === 'landscape' ? 26 : 22;
  for (let i = 0; i < waveCount; i++) {
    const x = 60 + rand() * (g.w - 120), y = 60 + rand() * (g.h - 120);
    const onLand = g.lands.some((l) => ((x - l.x) / (l.rx + 30)) ** 2 + ((y - l.y) / (l.ry + 30)) ** 2 < 1);
    if (!onLand) out.push({ kind: 'wave', x: f(x), y: f(y), s: f((0.8 + rand() * 0.6) * unit) });
  }
  return out;
}

export const GLYPH_PATHS: Record<GlyphKind, string> = {
  tree: 'M0 6V0M0 -14C-8 -12 -9 -2 0 0C9 -2 8 -12 0 -14Z',
  peak: 'M-14 8L0 -14L14 8M-6 -3L0 4L6 -3',
  flower: 'M0 0V10M0 -3m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M0 -3m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0',
  tent: 'M-12 8L0 -12L12 8ZM0 -12V-18M0 -18L8 -15L0 -13',
  wave: 'M-16 0Q-10 -7 -4 0T8 0T20 0',
  tower: 'M-8 8V-8H-4V-4H-1V-8H3V-4H6V-8H8V8ZM-1 8V2H3V8',
};

export const CROWN_PATH = 'M-30 14L-34 -16L-16 -2L0 -24L16 -2L34 -16L30 14ZM-30 20H30';
export const HEART_PATH = 'M0 18C-30 -4 -26 -26 -10 -26C-4 -26 0 -20 0 -16C0 -20 4 -26 10 -26C26 -26 30 -4 0 18Z';
export const PIN_PATH = 'M0 0C-11 -14 -13 -26 0 -36C13 -26 11 -14 0 0Z';
export const SHIP_PATH = 'M-22 0H22L14 12H-14ZM0 -4V-34M0 -34L18 -8H0ZM-3 -28L-16 -8H-3Z';
export const BRIDGE_PATH = 'M-70 8C-50 -34 -20 -34 0 8C20 -34 50 -34 70 8M-70 8H70M-50 8V22M-20 8V22M20 8V22M50 8V22';

/** Territory position as a 0..1 pair, used by mini-views. */
export function spotOf(o: Orientation, id: TerritoryId): Spot {
  return GEOMETRY[o].spots[id];
}

export function routeIndex(id: TerritoryId): number {
  return ROUTE.indexOf(id);
}
