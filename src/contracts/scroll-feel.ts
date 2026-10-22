/**
 * Frozen "feel" constants measured from the reference site (docs/SCROLL-TEARDOWN.md).
 * Every lane imports from here; never hard-code scroll feel elsewhere.
 */

/** Measured: new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 }), driven by gsap.ticker. */
export const LENIS_OPTIONS = {
  lerp: 0.085,
  wheelMultiplier: 0.9,
  smoothWheel: true,
} as const;

/** Measured: programmatic jumps use lenis.scrollTo(y, { duration: 1.6 }). */
export const SCROLL_TO_DURATION = 1.6;

/** Measured easings used by the reference timeline. */
export const EASINGS = {
  enter: 'power3.out',
  exit: 'power2.in',
  breathe: 'sine.inOut',
} as const;

/** Scroll length per second of narration (see docs/04-TIMING-MATH.md). */
export const SCROLL_VH_PER_SEC = 12;

/** Default pinned-scene lengths in vh (reference: ~3vh per word-beat, ~1–1.5vh per manifesto line, ~2.5vh breath). */
export const SCENE_PIN_VH = {
  statement: 100,
  shortBeat: 45,
  manifestoLine: 60,
  breath: 100,
  mapInterludeSec: 3,
} as const;

/**
 * Statement type scale, desktop / mobile (reference px, converted to fluid clamp()).
 * Hero 216px/113px; sub-display 52px/25px; UI labels 14–20px.
 */
export const STATEMENT_TYPE_SCALE = {
  hero:    { desktopPx: 216, mobilePx: 113, lineHeight: 0.86, letterSpacingEm: -0.01 },
  display: { desktopPx: 52,  mobilePx: 25,  lineHeight: 1,    letterSpacingEm: 0.02 },
  accent:  { desktopPx: 21,  mobilePx: 21,  lineHeight: 1.05, letterSpacingEm: 0.01 },
  ui:      { desktopPx: 16,  mobilePx: 14,  lineHeight: 1.2,  letterSpacingEm: 0.04 },
} as const;

/** Chrome sizes measured on the reference. */
export const HEADER_HEIGHT_PX = { desktop: 95, mobile: 76 } as const;

/** Reference total: 28.5 viewports for ~12 ideas (~2.3 vh per idea). */
export const REFERENCE_PAGE_VH = 28.5;
