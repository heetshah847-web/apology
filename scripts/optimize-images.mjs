// LANE-03: raw photos -> responsive AVIF + WebP, EXIF-rotated, metadata (GPS) stripped, tiny blur placeholder.
// Output: public/media/photos/<phase>/<slug>-<w>.{avif,webp} + <slug>.json (sidecar consumed by build-manifest).
// Idempotent: unchanged inputs (content hash + settings version) are skipped.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { RAW_PHOTOS, OUT_PHOTOS, CACHE_DIR, IMG_EXT, phaseFolders, slug, readJson, listFiles } from './media-common.mjs';

const WIDTHS = [800, 1200, 1600, 2400];
const SETTINGS = 'v1:' + WIDTHS.join(',') + ':avif55e4:webp78';
const cachePath = path.join(CACHE_DIR, 'atlas-images.json');
const cache = readJson(cachePath, {});
const force = process.argv.includes('--force');

const hashFile = (f) => crypto.createHash('sha1').update(fs.readFileSync(f)).update(SETTINGS).digest('hex');

async function focalOf(file) {
  // Crop the longer axis to 60% with sharp's `attention` strategy; the attention point on that axis is the focal point.
  const { data, info } = await sharp(file).rotate().resize({ width: 512, height: 512, fit: 'inside' }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const portrait = h >= w;
  const tw = portrait ? w : Math.round(w * 0.6), th = portrait ? Math.round(h * 0.6) : h;
  const out = await sharp(data).resize(tw, th, { fit: 'cover', position: sharp.strategy.attention }).toBuffer({ resolveWithObject: true });
  const ax = out.info.attentionX ?? 0, ay = out.info.attentionY ?? 0;
  // attentionX/Y = libvips' point of greatest interest (in resized-image pixels)
  const fx = portrait ? 0.5 : ax / w, fy = portrait ? ay / h : 0.5;
  return [+Math.min(0.85, Math.max(0.15, fx)).toFixed(3), +Math.min(0.85, Math.max(0.15, fy)).toFixed(3)];
}

let done = 0, skipped = 0, removed = 0;
for (const { folder, id } of phaseFolders()) {
  const inDir = path.join(RAW_PHOTOS, folder);
  const outDir = path.join(OUT_PHOTOS, id);
  const files = listFiles(inDir, IMG_EXT);
  const meta = readJson(path.join(inDir, 'meta.json'), {});
  fs.mkdirSync(outDir, { recursive: true });
  const keep = new Set();

  for (const [i, file] of files.entries()) {
    const src = path.join(inDir, file);
    const s = slug(file);
    keep.add(`${s}.json`);
    const sidecar = path.join(outDir, `${s}.json`);
    const h = hashFile(src);
    const key = `${id}/${file}`;
    const m = meta[file] ?? {};
    const alt = m.alt ?? `${id === 'heetu-versions' ? 'Heetu' : 'Tanisha'}, photo ${i + 1} of ${files.length} in the ${id.replace('-', ' ')} chapter`;

    let info = readJson(sidecar, null);
    if (info) for (const w of info.widths) for (const e of ['avif', 'webp']) keep.add(`${s}-${w}.${e}`);
    if (!force && cache[key] === h && info) {
      skipped++;
    } else {
      const base = sharp(src).rotate(); // auto-orient from EXIF, then output drops all metadata (no GPS)
      const { width: ow, height: oh } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
      const widths = [...new Set(WIDTHS.map((w) => Math.min(w, ow)))];
      for (const w of widths) {
        const r = base.clone().resize({ width: w, withoutEnlargement: true });
        await r.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(outDir, `${s}-${w}.avif`));
        await r.clone().webp({ quality: 78 }).toFile(path.join(outDir, `${s}-${w}.webp`));
      }
      const blurBuf = await base.clone().resize(16).blur(1).webp({ quality: 40 }).toBuffer();
      info = {
        slug: s, source: file, width: ow, height: oh, widths,
        blur: `data:image/webp;base64,${blurBuf.toString('base64')}`,
        autoFocal: await focalOf(src),
      };
      fs.writeFileSync(sidecar, JSON.stringify(info));
      for (const w of widths) for (const e of ['avif', 'webp']) keep.add(`${s}-${w}.${e}`);
      cache[key] = h;
      done++;
    }
  }

  // Remove outputs whose source photo is gone (keeps public/ in sync).
  for (const f of fs.readdirSync(outDir)) {
    if (!keep.has(f)) { fs.rmSync(path.join(outDir, f)); removed++; }
  }
}

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.writeFileSync(cachePath, JSON.stringify(cache));
console.log(`images: ${done} optimized, ${skipped} unchanged, ${removed} stale files removed`);
