// LANE-01: placeholder media so every lane can run end-to-end before real assets exist.
//  - gradient JPGs with phase + index drawn on them
//  - silent MP3s for the 3 voice tracks (durations from content/config/story.config.json)
// Safe: never overwrites existing files. Raw copies go to assets-drop/ ONLY if that phase folder is empty;
// served copies always go to public/media/placeholders/ (never touched by Heet's real pipeline).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'content/config/story.config.json'), 'utf8'));

const COUNTS = { queen: 8, friendship: 7, love: 6, distance: 6, apology: 1 };
const HUES = { gold: [43, 38], amber: [28, 22], rose: [345, 330], fog: [210, 225], dawn: [20, 340] };
const W = 900, H = 1200;

const exists = (p) => fs.existsSync(p);
const isEmptyDir = (d) => !exists(d) || fs.readdirSync(d).filter((f) => !f.startsWith('.') && !f.endsWith('.json')).length === 0;

async function makePhoto(file, phase, i, n, theme) {
  const [h1, h2] = HUES[theme] ?? [40, 20];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h1},55%,32%)"/><stop offset="1" stop-color="hsl(${h2},60%,14%)"/></linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="46%" text-anchor="middle" font-family="Georgia,serif" font-size="150" fill="rgba(255,240,220,.9)">${i + 1}</text>
    <text x="50%" y="56%" text-anchor="middle" font-family="Georgia,serif" font-size="46" fill="rgba(255,240,220,.7)">${phase} · placeholder</text>
    <text x="50%" y="62%" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="rgba(255,240,220,.5)">${i + 1} of ${n}</text>
  </svg>`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await sharp(Buffer.from(svg)).jpeg({ quality: 78 }).toFile(file);
}

function ffmpegBin() {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore', shell: process.platform === 'win32' });
  if (probe.status === 0) return 'ffmpeg';
  try { return require('ffmpeg-static'); } catch { return null; }
}

function silentMp3(file, sec) {
  const bin = ffmpegBin();
  if (!bin) { console.warn('  ! no ffmpeg (system or ffmpeg-static); skipping', file); return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const r = spawnSync(bin, ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(sec), '-b:a', '64k', file]);
  if (r.status !== 0) console.warn('  ! ffmpeg failed for', file, String(r.stderr));
}

let made = 0, skipped = 0;
for (const ph of cfg.phases) {
  const n = COUNTS[ph.id] ?? 6;
  const rawDir = path.join(root, 'assets-drop/photos', ph.photos);
  const rawEmpty = isEmptyDir(rawDir);
  for (let i = 0; i < n; i++) {
    const name = `${String(i + 1).padStart(2, '0')}-placeholder.jpg`;
    const served = path.join(root, 'public/media/placeholders', ph.id, name);
    if (exists(served)) { skipped++; } else { await makePhoto(served, ph.id, i, n, ph.theme); made++; }
    if (rawEmpty) {
      const raw = path.join(rawDir, name);
      if (!exists(raw)) { await makePhoto(raw, ph.id, i, n, ph.theme); made++; }
    }
  }
  console.log(`${ph.id}: ${n} placeholders${rawEmpty ? ' (+ raw copies in assets-drop, folder was empty)' : ' (assets-drop has real files, left untouched)'}`);
}

// Voice tracks: if Heet's real file exists in assets-drop/voice, serve a COPY of it (read-only on his file);
// otherwise generate silence of the target length. Existing served files are never overwritten.
for (const t of cfg.tracks) {
  const served = path.join(root, 'public/media/voice', `${t.voice}.mp3`);
  const rawDir = path.join(root, 'assets-drop/voice');
  const realName = exists(rawDir) ? fs.readdirSync(rawDir).find((f) => f.startsWith(t.voice + '.')) : null;
  if (exists(served)) { skipped++; continue; }
  if (realName) { fs.mkdirSync(path.dirname(served), { recursive: true }); fs.copyFileSync(path.join(rawDir, realName), served); console.log(`  ${t.voice}: copied real voice-over`); }
  else { silentMp3(served, t.targetSec); console.log(`  ${t.voice}: silent placeholder (${t.targetSec}s)`); }
  made++;
}

console.log(`placeholders done: ${made} created, ${skipped} already present (nothing overwritten)`);
