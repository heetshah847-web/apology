// LANE-04: story.config.json + media manifest + captions + MEASURED durations -> src/data/story.generated.json
// Re-runs the alignment itself (scripts/align-script.mjs), so it is never stale. Fails if the result breaks the StoryData contract.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, alignTrack, loadTrackInputs } from './align-script.mjs';

const OUT = path.join(root, 'src/data/story.generated.json');
const MANIFEST = path.join(root, 'src/data/media.manifest.json');
const readJson = (p, fb) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fb; } };
const slug = (f) => path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const THEMES = ['gold', 'amber', 'rose', 'fog', 'dawn'];
const EPS = 0.011;

/** Small runtime check of the StoryData contract (src/contracts/index.ts). Returns a list of problems. */
export function validateStory(s) {
  const errs = [];
  const bad = (m) => errs.push(m);
  const num = (v) => typeof v === 'number' && Number.isFinite(v);
  for (const k of ['herName', 'herTitle', 'hisName', 'hisNickname', 'siteTitle']) if (!s.meta?.[k]) bad(`meta.${k} missing`);
  if (!Array.isArray(s.tracks) || !s.tracks.length) bad('no tracks');
  if (!Array.isArray(s.phases) || !s.phases.length) bad('no phases');
  const ids = new Set();
  for (const t of s.tracks ?? []) {
    if (!['t0', 't1', 't2'].includes(t.id)) bad(`track id ${t.id}`);
    if (!t.audio?.src || !(t.audio?.durationSec > 0)) bad(`${t.id}: audio.src / durationSec`);
    const mine = (s.phases ?? []).filter((p) => p.trackId === t.id).sort((a, b) => a.start - b.start);
    if (mine.map((p) => p.id).join() !== (t.chapters ?? []).join()) bad(`${t.id}: chapters ${t.chapters} != phases ${mine.map((p) => p.id)}`);
    if (mine.length && Math.abs(mine[0].start) > EPS) bad(`${t.id}: first chapter must start at 0`);
    if (mine.length && Math.abs(mine[mine.length - 1].end - t.audio.durationSec) > EPS) bad(`${t.id}: last chapter must end at ${t.audio.durationSec}`);
    mine.slice(1).forEach((p, i) => { if (Math.abs(p.start - mine[i].end) > EPS) bad(`${t.id}: gap/overlap between ${mine[i].id} and ${p.id}`); });
  }
  for (const p of s.phases ?? []) {
    const w = `phase ${p.id}`;
    if (ids.has(p.id)) bad(`${w}: duplicate`);
    ids.add(p.id);
    if (!num(p.order) || !p.title || !p.mapTerritory) bad(`${w}: order/title/mapTerritory`);
    if (!THEMES.includes(p.theme)) bad(`${w}: theme ${p.theme}`);
    if (!num(p.start) || !num(p.end) || p.end <= p.start) bad(`${w}: start/end`);
    let prevEnd = -1;
    (p.captions ?? []).forEach((c, i) => {
      const cw = `${w} cue ${i}`;
      if (!num(c.start) || !num(c.end) || c.end <= c.start) return bad(`${cw}: start/end`);
      if (typeof c.text !== 'string') bad(`${cw}: text`);
      if (c.start < p.start - EPS || c.end > p.end + EPS) bad(`${cw}: outside chapter [${p.start}, ${p.end}]`);
      if (c.start < prevEnd - EPS) bad(`${cw}: overlaps previous cue`);
      prevEnd = c.end;
      let pw = c.start - EPS;
      for (const x of c.words ?? []) {
        if (!x.w || !num(x.start) || !num(x.end) || x.end < x.start || x.start < pw - EPS) { bad(`${cw}: word timing "${x.w}"`); break; }
        pw = x.start;
      }
    });
    const mids = new Set();
    for (const m of p.media ?? []) {
      if (mids.has(m.id)) bad(`${w}: duplicate media ${m.id}`);
      mids.add(m.id);
      if (!m.id || !['image', 'video'].includes(m.kind) || !m.src || !(m.width > 0) || !(m.height > 0) || typeof m.alt !== 'string') bad(`${w}: media ${m.id} incomplete`);
      if (m.at !== undefined && !num(m.at)) bad(`${w}: media ${m.id} at`);
    }
  }
  return errs;
}

async function main() {
  const cfg = readJson(path.join(root, 'content/config/story.config.json'));
  const prev = readJson(OUT, { phases: [] });
  const manifest = readJson(MANIFEST, null);
  if (!manifest) console.warn('  ! src/data/media.manifest.json missing (run npm run media:images) — keeping media from the previous story file');

  const tracks = [], aligned = {};
  for (const t of cfg.tracks) {
    const inp = await loadTrackInputs(t, cfg);
    if (Math.abs(inp.duration - t.targetSec) > 0.5) console.warn(`  ! ${t.id}: measured ${inp.duration}s differs from targetSec ${t.targetSec}s in story.config.json`);
    aligned[t.id] = alignTrack(inp);
    tracks.push({ id: t.id, audio: { src: `/media/voice/${t.voice}.mp3`, durationSec: inp.duration }, chapters: t.chapters });
  }

  const phases = [...cfg.phases].sort((a, b) => a.order - b.order).map((ph) => {
    const al = aligned[ph.trackId];
    const range = al.chapters.find((c) => c.id === ph.id);
    const last = al.chapters[al.chapters.length - 1].id === ph.id;
    const captions = al.cues.filter((c) => c.start >= range.start - 0.01 && (c.start < range.end - 0.01 || (last && c.start <= range.end)));
    const anchors = Object.fromEntries(Object.entries(al.photoAnchors).map(([f, at]) => [slug(f), at]));
    const items = manifest ? (manifest.phases?.[ph.id] ?? []) : (prev.phases.find((p) => p.id === ph.id)?.media ?? []);
    const media = items.map((m) => {
      const key = Object.keys(anchors).find((k) => m.id === `${ph.id}-${k}` || m.id.endsWith(`-${k}`));
      return key ? { ...m, at: anchors[key] } : m;
    });
    return {
      id: ph.id, order: ph.order, trackId: ph.trackId, title: ph.title, ...(ph.subtitle && { subtitle: ph.subtitle }),
      mapTerritory: ph.mapTerritory, start: range.start, end: range.end, theme: ph.theme, captions, media,
    };
  });

  const story = { meta: cfg.meta, tracks, phases };
  const errs = validateStory(story);
  if (errs.length) { console.error(`story is invalid:\n  - ${errs.join('\n  - ')}`); process.exit(1); }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(story, null, 2) + '\n');
  console.log(`story: ${path.relative(root, OUT)}`);
  for (const t of tracks) {
    const al = aligned[t.id];
    console.log(`  ${t.id} ${String(t.audio.durationSec).padStart(5)}s  captions from ${al.source}${al.needsReview ? ' (NEEDS REVIEW)' : ''}`);
    al.warnings.forEach((w) => console.warn(`    ! ${w}`));
  }
  for (const p of phases) {
    const secs = p.end - p.start, want = Math.round(secs / 2.8), have = p.media.filter((m) => m.kind === 'image' && !m.placeholder).length;
    console.log(`  ${p.id.padEnd(10)} ${p.start.toFixed(2).padStart(6)}–${p.end.toFixed(2).padStart(6)}s  ${String(p.captions.length).padStart(2)} cues  ${have} photos / ~${want} recommended`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
