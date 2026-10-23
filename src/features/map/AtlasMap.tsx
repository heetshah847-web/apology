import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import type { PhaseId } from '@/contracts';
import { getPhase } from '@/engine';
import {
  BAZAAR_NAME, BRIDGE_PATH, CROWN_PATH, GEOMETRY, GLYPH_PATHS, HEART_PATH, PIN_PATH, ROUTE, SHIP_PATH,
  blobPath, routeSegments, scatterGlyphs, type Orientation, type TerritoryId,
} from './mapData';
import { PaperGrain, RoughCoast } from './RoughCoast';

/** Ink + paper colours come from the design tokens, with fallbacks so the map also renders standalone. */
const INK = 'var(--royal-gold, #c8a45d)';
const PEARL = 'var(--moon-pearl, #eee8f4)';
const ROSE = 'var(--rose-quartz, #e7a6b8)';

export interface MapCamera {
  cx: MotionValue<number>;
  cy: MotionValue<number>;
  /** 1 = whole map, 2.5 = standing inside one territory. */
  zoom: MotionValue<number>;
}

export interface AtlasMapProps {
  orientation: Orientation;
  /** `base` = paper, sea, land, symbols. `overlay` = labels, trail, pins. `all` = both. */
  layer?: 'all' | 'base' | 'overlay';
  /** 0..5: how much of the route is inked. Defaults to nothing drawn. */
  drawn?: MotionValue<number>;
  camera?: MapCamera;
  /** Render only a rectangle of the map (used by the folded panels). */
  slice?: { x: number; y: number; w: number; h: number };
  /** Territory that glows (mini-map / interludes). */
  active?: TerritoryId | null;
  showLabels?: boolean;
  /** Skip the in-map label of the active territory (a large HTML title replaces it). */
  hideActiveLabel?: boolean;
  /** `slice` fills the box (full-bleed interlude); `meet` always shows the whole viewBox. */
  fit?: 'meet' | 'slice';
  className?: string;
  title?: string;
}

export const territoryName = (id: TerritoryId): string => (id === 'bazaar' ? BAZAAR_NAME : getPhase(id as PhaseId).mapTerritory);

// ── static base layer ──────────────────────────────────────────────────────
const Base = memo(function Base({ orientation, uid, rough }: { orientation: Orientation; uid: string; rough: boolean }) {
  const g = GEOMETRY[orientation];
  const lands = useMemo(() => g.lands.map((l) => blobPath(l)), [g]);
  const glyphs = useMemo(() => scatterGlyphs(orientation), [orientation]);
  const cs = g.compass;
  const ap = g.spots.apology, bz = g.spots.bazaar;
  const bx = (ap.x + bz.x) / 2, by = (ap.y + bz.y) / 2;

  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-sea`} cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor="#6361a1" />
          <stop offset="0.6" stopColor="#47467f" />
          <stop offset="1" stopColor="#2a2656" />
        </radialGradient>
        <linearGradient id={`${uid}-land`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9cde4" />
          <stop offset="1" stopColor="#b9a9cf" />
        </linearGradient>
        <pattern id={`${uid}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={INK} strokeOpacity="0.18" strokeWidth="1.2" />
        </pattern>
      </defs>

      <rect width={g.w} height={g.h} fill={`url(#${uid}-sea)`} />

      {/* graticule */}
      <g stroke={PEARL} strokeOpacity="0.12" strokeWidth="1" strokeDasharray="2 8" fill="none">
        {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={(g.w / 8) * (i + 1)} y1="0" x2={(g.w / 8) * (i + 1)} y2={g.h} />)}
        {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="0" y1={(g.h / 6) * (i + 1)} x2={g.w} y2={(g.h / 6) * (i + 1)} />)}
      </g>

      {/* shallows: a wider, paler halo around every landmass */}
      <g fill="#8b88c4" fillOpacity="0.22">
        {lands.map((d, i) => <path key={i} d={d} transform={`translate(${g.lands[i].x} ${g.lands[i].y}) scale(1.16) translate(${-g.lands[i].x} ${-g.lands[i].y})`} />)}
      </g>

      {/* coast ink: stroke first, fill on top, so overlapping lands read as one coastline */}
      <g stroke={INK} strokeWidth="7" strokeLinejoin="round">
        {lands.map((d, i) => <path key={i} d={d} fill={INK} />)}
      </g>
      <g>
        {lands.map((d, i) => <path key={i} d={d} fill={`url(#${uid}-land)`} />)}
        {lands.map((d, i) => <path key={`h${i}`} d={d} fill={`url(#${uid}-hatch)`} />)}
      </g>
      {rough && <RoughCoast lands={lands} ink={INK} />}
      <PaperGrain uid={uid} w={g.w} h={g.h} />

      {/* symbols */}
      <g fill="none" stroke={INK} strokeOpacity="0.75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {glyphs.map((gl, i) => (
          <path
            key={i}
            d={GLYPH_PATHS[gl.kind]}
            transform={`translate(${gl.x} ${gl.y}) scale(${gl.s})`}
            stroke={gl.kind === 'wave' ? PEARL : gl.kind === 'flower' ? '#b5547a' : '#7a5f9c'}
            strokeOpacity={gl.kind === 'wave' ? 0.3 : 0.85}
          />
        ))}
      </g>

      {/* crown over the Queen's Court, heart over the Garden of Love */}
      <g transform={`translate(${g.spots.queen.x} ${g.spots.queen.y}) scale(${g.pinScale * 1.1})`} fill={INK} stroke="#7a5f9c" strokeWidth="1.5" strokeLinejoin="round">
        <path d={CROWN_PATH} />
      </g>
      <g transform={`translate(${g.spots.love.x} ${g.spots.love.y}) scale(${g.pinScale})`} fill={ROSE} stroke="#b5547a" strokeWidth="1.5">
        <path d={HEART_PATH} />
      </g>

      {/* the ship drifting on the Sea of Distance */}
      <g transform={`translate(${g.spots.distance.x + g.spots.distance.r * 0.55} ${g.spots.distance.y - g.spots.distance.r * 0.35}) scale(${g.pinScale * 0.85})`} fill={PEARL} fillOpacity="0.85" stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
        <path d={SHIP_PATH} />
      </g>

      {/* the Bridge of Forgiveness between the two small shores */}
      <g transform={`translate(${bx} ${by - 8}) scale(${orientation === 'landscape' ? 1.3 : 1})`} fill="none" stroke="#2a2656" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d={BRIDGE_PATH} />
      </g>
      <g transform={`translate(${bx} ${by - 8}) scale(${orientation === 'landscape' ? 1.3 : 1})`} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d={BRIDGE_PATH} />
      </g>

      {/* compass rose */}
      <g transform={`translate(${cs.x} ${cs.y}) scale(${cs.s})`} stroke={INK} strokeLinejoin="round">
        <circle r="78" fill="none" strokeWidth="2" strokeOpacity="0.7" />
        <circle r="64" fill="none" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 6" />
        <path d="M0 -92L14 -14L92 0L14 14L0 92L-14 14L-92 0L-14 -14Z" fill={PEARL} fillOpacity="0.9" strokeWidth="2" />
        <path d="M0 -92L14 -14L0 0Z M92 0L14 14L0 0Z M0 92L-14 14L0 0Z M-92 0L-14 -14L0 0Z" fill={INK} strokeWidth="0" />
        <path d="M0 -60L40 -40L60 0L40 40L0 60L-40 40L-60 0L-40 -40Z" fill="none" strokeWidth="1.2" strokeOpacity="0.6" transform="rotate(22.5)" />
        <text y="-106" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="26" fill={INK} stroke="none">N</text>
      </g>

      {/* paper border */}
      <rect x="18" y="18" width={g.w - 36} height={g.h - 36} fill="none" stroke={INK} strokeWidth="3" />
      <rect x="32" y="32" width={g.w - 64} height={g.h - 64} fill="none" stroke={INK} strokeWidth="1.2" strokeOpacity="0.7" />
    </g>
  );
});

// ── route segment, pin and label (overlay layer) ───────────────────────────
function Segment({ d, k, drawn, width }: { d: string; k: number; drawn: MotionValue<number>; width: number }) {
  const len = useTransform(drawn, (v) => Math.min(1, Math.max(0, v - k)));
  return (
    <motion.path
      d={d} fill="none" stroke={INK} strokeWidth={width} strokeLinecap="round"
      style={{ pathLength: len, filter: 'drop-shadow(0 0 6px rgba(200,164,93,0.8))' }}
    />
  );
}

function Pin({ x, y, i, drawn, scale }: { x: number; y: number; i: number; drawn: MotionValue<number>; scale: number }) {
  const opacity = useTransform(drawn, (v) => (i === 0 ? 1 : Math.min(1, Math.max(0, (v - (i - 0.25)) / 0.2))));
  const dy = useTransform(drawn, (v) => (i === 0 ? 0 : -60 * (1 - Math.min(1, Math.max(0, (v - (i - 0.25)) / 0.2)))));
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <motion.g style={{ opacity, y: dy }}>
        <ellipse cx="0" cy="2" rx="9" ry="3" fill="#000" fillOpacity="0.35" />
        <path d={PIN_PATH} fill="#d85b7d" stroke={PEARL} strokeWidth="2" />
        <circle cy="-24" r="4.5" fill={PEARL} />
      </motion.g>
    </g>
  );
}

// ── the component ──────────────────────────────────────────────────────────
export function AtlasMap({
  orientation, layer = 'all', drawn, camera, slice, active = null, showLabels = true, hideActiveLabel = false, fit = 'meet', className, title = 'The Atlas of Us',
}: AtlasMapProps) {
  const g = GEOMETRY[orientation];
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const segs = useMemo(() => routeSegments(orientation), [orientation]);
  const none = useMotionValue(0);
  const progress = drawn ?? none;

  const viewBoxFor = () => {
    if (!camera) return slice ? `${slice.x} ${slice.y} ${slice.w} ${slice.h}` : `0 0 ${g.w} ${g.h}`;
    const z = Math.max(1, camera.zoom.get());
    const vw = g.w / z, vh = g.h / z;
    const cx = Math.min(g.w - vw / 2, Math.max(vw / 2, camera.cx.get()));
    const cy = Math.min(g.h - vh / 2, Math.max(vh / 2, camera.cy.get()));
    return `${(cx - vw / 2).toFixed(2)} ${(cy - vh / 2).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`;
  };

  // The camera moves the viewBox directly (no React renders, stays crisp at any zoom).
  useLayoutEffect(() => { svgRef.current?.setAttribute('viewBox', viewBoxFor()); });
  useEffect(() => {
    if (!camera) return;
    const apply = () => svgRef.current?.setAttribute('viewBox', viewBoxFor());
    const off = [camera.cx, camera.cy, camera.zoom].map((mv) => mv.on('change', apply));
    return () => off.forEach((o) => o());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, orientation]);

  const showBase = layer !== 'overlay';
  const showOverlay = layer !== 'base';
  const lw = 8;

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={viewBoxFor()}
      preserveAspectRatio={fit === 'slice' ? 'xMidYMid slice' : 'xMidYMid meet'}
      role="img"
      aria-label={title}
    >
      {showBase && <Base orientation={orientation} uid={uid} rough={!slice && showLabels} />}
      {showOverlay && (
        <g>
          {/* ghost trail: the whole journey, faint and dotted */}
          <g fill="none" stroke={PEARL} strokeOpacity="0.5" strokeWidth="4" strokeDasharray="1 14" strokeLinecap="round">
            {segs.map((d, k) => <path key={k} d={d} />)}
          </g>
          {/* inked trail */}
          {segs.map((d, k) => <Segment key={k} d={d} k={k} drawn={progress} width={lw} />)}

          {active && (
            <circle
              cx={g.spots[active].x} cy={g.spots[active].y} r={g.spots[active].r * 1.25}
              fill="none" stroke={INK} strokeOpacity="0.9" strokeWidth="3" strokeDasharray="4 10"
              style={{ filter: 'drop-shadow(0 0 14px rgba(240,200,120,0.9))' }}
            />
          )}

          {ROUTE.map((id, i) => <Pin key={id} x={g.spots[id].x} y={g.spots[id].y} i={i} drawn={progress} scale={g.pinScale} />)}

          {showLabels && ROUTE.filter((id) => !(hideActiveLabel && id === active)).map((id) => {
            const sp = g.spots[id];
            const lx = sp.x + (sp.label?.dx ?? 0);
            const ly = sp.y + (sp.label ? sp.label.dy : sp.r + g.labelSize * 0.6);
            return (
              <text
                key={id} x={lx} y={ly} textAnchor="middle"
                fontFamily="var(--font-script, 'Pinyon Script', cursive)" fontSize={g.labelSize}
                fill={active === id ? '#fff4d6' : INK}
                stroke="#1e1a3a" strokeWidth="7" paintOrder="stroke" strokeLinejoin="round"
              >
                {territoryName(id)}
              </text>
            );
          })}
        </g>
      )}
    </svg>
  );
}
