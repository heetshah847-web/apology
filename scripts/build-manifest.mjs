// LANE-03: sidecars from optimize-images + meta.json -> src/data/media.manifest.json (per phase MediaItem[]).
// Phases with no real photos fall back to public/media/placeholders so every lane runs end-to-end.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { root, cfg, RAW_PHOTOS, OUT_PHOTOS, OUT_VIDEOS, MANIFEST, VID_EXT, phaseFolders, slug, readJson, listFiles, IMG_EXT } from './media-common.mjs';

const story = readJson(path.join(root, 'src/data/story.generated.json'), { phases: [] });
const pub = (...p) => '/' + p.join('/');
const manifest = { generatedAt: new Date().toISOString(), phases: {}, report: [] };

for (const { folder, id } of phaseFolders()) {
  const meta = readJson(path.join(RAW_PHOTOS, folder, 'meta.json'), {});
  const files = listFiles(path.join(RAW_PHOTOS, folder), IMG_EXT);
  const items = [];

  for (const file of files) {
    const s = slug(file);
    const side = readJson(path.join(OUT_PHOTOS, id, `${s}.json`), null);
    if (!side) { console.warn(`  ! ${id}/${file}: no optimized output; run npm run media:images`); continue; }
    const m = meta[file] ?? {};
    const set = (ext) => side.widths.map((w) => `${pub('media/photos', id, `${s}-${w}.${ext}`)} ${w}w`).join(', ');
    const mid = side.widths.includes(1200) ? 1200 : side.widths[side.widths.length - 1];
    items.push({
      id: `${id}-${s}`, kind: 'image',
      src: pub('media/photos', id, `${s}-${mid}.webp`),
      srcSet: set('webp'), avifSrcSet: set('avif'), blur: side.blur,
      width: side.width, height: side.height,
      alt: m.alt ?? `${id === 'heetu-versions' ? 'Heetu' : 'Tanisha'}, photo ${items.length + 1} of ${files.length}`,
      focal: m.focal ?? side.autoFocal,
      ...(m.at !== undefined && { at: m.at }),
      ...(m.overlay && { overlay: m.overlay }),
      ...(m.label && { label: m.label }),
    });
  }

  if (!items.length && id !== 'heetu-versions') {
    const dir = path.join(root, 'public/media/placeholders', id);
    for (const [i, file] of listFiles(dir, /\.jpe?g$/i).entries()) {
      const { width, height } = await sharp(path.join(dir, file)).metadata();
      items.push({ id: `${id}-placeholder-${i + 1}`, kind: 'image', src: pub('media/placeholders', id, file), width, height, alt: `Placeholder ${i + 1} for the ${id} chapter`, placeholder: true });
    }
  }
  manifest.phases[id] = items;
}

// Videos: public/media/videos/<phase>-*.mp4 (name prefix = phase id) -> appended to that phase.
for (const f of listFiles(OUT_VIDEOS, VID_EXT)) {
  const base = path.parse(f).name;
  const id = Object.keys(manifest.phases).find((p) => base.startsWith(p));
  if (!id) { console.warn(`  ! video ${f}: name must start with a phase id (queen, friendship, love, distance, apology)`); continue; }
  const posterFile = `${base}.webp`;
  manifest.phases[id].push({
    id: `${id}-${base}`, kind: 'video', src: pub('media/videos', f),
    ...(fs.existsSync(path.join(OUT_VIDEOS, posterFile)) && { poster: pub('media/videos', posterFile) }),
    width: 1080, height: 1920, alt: `Clip from the ${id} chapter`,
  });
}

// Report: photo count vs recommended N = round(chapterSeconds / 2.8)
for (const ph of story.phases ?? []) {
  const have = (manifest.phases[ph.id] ?? []).filter((m) => m.kind === 'image' && !m.placeholder).length;
  const want = Math.round((ph.end - ph.start) / 2.8);
  const row = { phase: ph.id, seconds: +(ph.end - ph.start).toFixed(1), have, recommended: want };
  manifest.report.push(row);
  const flag = have === 0 ? '(placeholders)' : have < want * 0.5 || have > want * 1.6 ? '<-- far from recommended' : 'ok';
  console.log(`  ${ph.id.padEnd(11)} ${String(have).padStart(2)} photos / ~${want} recommended (${row.seconds}s)  ${flag}`);
}
console.log(`  heetu-versions: ${manifest.phases['heetu-versions'].length} / 5`);

fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`manifest: ${path.relative(root, MANIFEST)}`);
