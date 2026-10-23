import { memo, useEffect, useState } from 'react';

interface RoughPath { d: string; width: number }

/**
 * Hand-inked second coastline: rough.js re-draws each landmass outline as a wobbly pen stroke on top of
 * the clean vector. The generator is imported lazily, so the map paints at once and the sketch fades in.
 */
export const RoughCoast = memo(function RoughCoast({ lands, ink }: { lands: string[]; ink: string }) {
  const [paths, setPaths] = useState<RoughPath[] | null>(null);
  useEffect(() => {
    let live = true;
    import('roughjs/bin/generator').then(({ RoughGenerator }) => {
      if (!live) return;
      const gen = new RoughGenerator();
      const out: RoughPath[] = [];
      lands.forEach((d, i) => {
        const drawable = gen.path(d, { roughness: 1.4, bowing: 1.2, seed: 11 + i * 7, strokeWidth: 1.6, fill: undefined, disableMultiStroke: true });
        for (const p of gen.toPaths(drawable)) if (p.d) out.push({ d: p.d, width: p.strokeWidth });
      });
      setPaths(out);
    }).catch(() => {});
    return () => { live = false; };
  }, [lands]);
  if (!paths) return null;
  return (
    <g fill="none" stroke={ink} strokeOpacity="0.55" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'rough-in 1.2s ease' }}>
      {paths.map((p, i) => <path key={i} d={p.d} strokeWidth={p.width} />)}
    </g>
  );
});

/** Aged-paper speckle: one small noise tile painted once to a canvas, tiled as an SVG pattern (no filters, cheap under zoom). */
export const PaperGrain = memo(function PaperGrain({ uid, w, h }: { uid: string; w: number; h: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(160, 160);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd();
      const light = v > 0.5;
      img.data[i] = light ? 255 : 40; img.data[i + 1] = light ? 245 : 30; img.data[i + 2] = light ? 225 : 50;
      img.data[i + 3] = Math.abs(v - 0.5) > 0.38 ? 40 : 0; // sparse specks only
    }
    ctx.putImageData(img, 0, 0);
    setUrl(c.toDataURL());
  }, []);
  if (!url) return null;
  return (
    <g pointerEvents="none">
      <defs>
        <pattern id={`${uid}-grain`} width="160" height="160" patternUnits="userSpaceOnUse">
          <image href={url} width="160" height="160" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${uid}-grain)`} opacity="0.7" />
    </g>
  );
});
