// LANE-04: align Heet's scripts to the voice-over -> CaptionCue[] per track, chapter ranges, photo anchors.
//
// Timing sources (best first): Whisper words (content/captions/<voice>.words.json) -> measured phrases
// (content/captions/<voice>.phrases.txt | queen.timing.txt) -> even spread.
// Text sources (best first): Heet's script between ---SCRIPT--- / ---END--- -> text in the phrases file ->
// Whisper transcript (cues flagged needsReview) -> empty text (needsReview).
// Pure functions are exported for tests (scripts/align-script.test.mjs); the CLI writes content/captions/<track>.cues.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const LIMITS = { maxWords: 12, maxSec: 4.5, pause: 0.25 };

// ───────────────────────── script parsing ─────────────────────────
export const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const SENTENCE_END = /[.?!…]["'”’)\]]*$/;
const CLAUSE_END = /[,;:—–]["'”’)\]]*$/;

/**
 * Script markdown -> flat word list + marker positions.
 * Markers: [[chapter:id]], [[photo:file.jpg]] (position = index of the next word). "(paste …)" placeholders are ignored.
 */
export function parseScript(md) {
  const m = md.match(/---SCRIPT---([\s\S]*?)---END---/);
  const body = m ? m[1] : md;
  const words = [];
  const chapterMarks = [];
  const photoMarks = [];
  for (const line of body.split(/\r?\n/)) {
    for (const part of line.split(/(\[\[(?:chapter|photo):[^\]]+\]\])/)) {
      const mk = part.match(/^\[\[(chapter|photo):([^\]]+)\]\]$/);
      if (mk) {
        (mk[1] === 'chapter' ? chapterMarks : photoMarks).push(
          mk[1] === 'chapter' ? { id: mk[2].trim(), wordIndex: words.length } : { file: mk[2].trim(), wordIndex: words.length },
        );
        continue;
      }
      const text = part.replace(/\([^)]*paste[^)]*\)/gi, ' ').replace(/[*_`#>]/g, ' ');
      for (const w of text.split(/\s+/)) if (norm(w)) words.push({ text: w, norm: norm(w) });
    }
  }
  const real = words.length >= 3;
  return { words: real ? words : [], chapterMarks, photoMarks, isPlaceholder: !real };
}

/** Clause groups (arrays of word indices) split at , ; : . ? ! and at chapter markers. */
export function clausesOf(words, chapterMarks = []) {
  const breaks = new Set(chapterMarks.map((c) => c.wordIndex));
  const out = [];
  let cur = [];
  words.forEach((w, i) => {
    if (breaks.has(i) && cur.length) { out.push(cur); cur = []; }
    cur.push(i);
    if (SENTENCE_END.test(w.text) || CLAUSE_END.test(w.text)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
}

// ───────────────────────── timing inputs ─────────────────────────
const toSec = (m, s) => Number(m) * 60 + Number(s);

/** `00:03.2-00:07.1 | text` or `00:03.2 | text` lines (# comments ignored). */
export function parsePhrases(txt, duration) {
  const rows = [];
  for (const line of txt.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.trim().match(/^(\d+):(\d+(?:\.\d+)?)(?:\s*-\s*(\d+):(\d+(?:\.\d+)?))?\s*(?:\|\s*(.*))?$/);
    if (!m) continue;
    rows.push({ start: toSec(m[1], m[2]), end: m[3] !== undefined ? toSec(m[3], m[4]) : null, text: (m[5] ?? '').trim() });
  }
  rows.forEach((p, i) => {
    if (p.end === null) p.end = Math.max(p.start + 0.1, (rows[i + 1]?.start ?? duration) - 0.05);
  });
  return rows.sort((a, b) => a.start - b.start);
}

/** Speech runs from word timings (a gap >= minGap starts a new phrase). */
export function phrasesFromWords(words, minGap = LIMITS.pause) {
  const out = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && w.start - last.end < minGap) last.end = w.end;
    else out.push({ start: w.start, end: w.end, text: '' });
  }
  return out;
}

/** Pauses between phrases, longest first. */
export const gapsOf = (phrases) =>
  phrases.slice(1).map((p, i) => ({ start: phrases[i].end, end: p.start, len: p.start - phrases[i].end })).sort((a, b) => b.len - a.len);

// ───────────────────────── word timings ─────────────────────────
const sameWord = (a, b) => a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)));

/** Greedy walk of the Whisper words; unmatched script words are interpolated between matched neighbours. */
export function alignToWhisper(scriptWords, whisper, look = 8) {
  const wn = whisper.map((w) => norm(w.w));
  const hit = new Array(scriptWords.length).fill(-1);
  let j = 0;
  scriptWords.forEach((sw, i) => {
    for (let k = j; k < Math.min(wn.length, j + look); k++) {
      if (sameWord(sw.norm, wn[k])) { hit[i] = k; j = k + 1; break; }
    }
  });
  const times = scriptWords.map((_, i) => (hit[i] >= 0 ? { start: whisper[hit[i]].start, end: whisper[hit[i]].end } : null));
  const matched = hit.filter((h) => h >= 0).length;
  const spanStart = whisper[0]?.start ?? 0;
  const spanEnd = whisper[whisper.length - 1]?.end ?? 0;
  if (!matched) return { times: spread(scriptWords, 0, scriptWords.length, spanStart, spanEnd), matched: 0 };
  let i = 0;
  while (i < times.length) {
    if (times[i]) { i++; continue; }
    let k = i;
    while (k < times.length && !times[k]) k++;
    const from = i > 0 ? times[i - 1].end : spanStart;
    const to = k < times.length ? times[k].start : spanEnd;
    const filled = spread(scriptWords, i, k, from, Math.max(to, from + 0.12 * (k - i)));
    filled.forEach((t, n) => { times[i + n] = t; });
    i = k;
  }
  return { times, matched };
}

/** Spread words [a,b) over [from,to] proportionally to their length. */
function spread(words, a, b, from, to) {
  const lens = words.slice(a, b).map((w) => w.norm.length + 1);
  const total = lens.reduce((x, y) => x + y, 0) || 1;
  let acc = 0;
  return lens.map((l) => {
    const s = from + ((to - from) * acc) / total;
    acc += l;
    return { start: s, end: from + ((to - from) * acc) / total };
  });
}

/** No Whisper: place clauses into the measured phrases (1:1 if counts match, else by speech-time). */
export function mapToPhrases(words, clauses, phrases) {
  const times = new Array(words.length);
  if (clauses.length === phrases.length) {
    clauses.forEach((idx, c) => {
      const t = spread(idx.map((i) => words[i]), 0, idx.length, phrases[c].start, phrases[c].end);
      idx.forEach((wi, n) => { times[wi] = t[n]; });
    });
    return times;
  }
  const lens = words.map((w) => w.norm.length + 1);
  const total = lens.reduce((x, y) => x + y, 0) || 1;
  const speech = phrases.reduce((s, p) => s + (p.end - p.start), 0);
  const real = (s, endSide) => {
    let acc = 0;
    for (const p of phrases) {
      const len = p.end - p.start;
      if (endSide ? s <= acc + len + 1e-9 : s < acc + len) return p.start + clamp(s - acc, 0, len);
      acc += len;
    }
    return phrases[phrases.length - 1].end;
  };
  let acc = 0;
  words.forEach((_, i) => {
    const s0 = (acc / total) * speech;
    acc += lens[i];
    times[i] = { start: real(s0, false), end: real((acc / total) * speech, true) };
  });
  return times;
}

/** Force start < end, monotonic, inside [0, duration]. */
export function tidy(times, duration) {
  let prev = 0;
  return times.map((t) => {
    const start = clamp(Math.max(t.start, prev), 0, duration);
    const end = clamp(Math.max(t.end, start + 0.04), 0, duration);
    prev = start;
    return { start: r3(start), end: r3(end) };
  });
}

// ───────────────────────── chapters ─────────────────────────
/**
 * Fallback chapter split: for each boundary pick the long pause nearest to the weighted ideal time;
 * the chapter starts where speech resumes. (docs/04-TIMING-MATH.md §0)
 */
export function splitByPauses(ids, weights, duration, gaps) {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const starts = [0];
  let cum = 0;
  for (let n = 1; n < ids.length; n++) {
    cum += weights[n - 1];
    const ideal = (cum / total) * duration;
    const min = starts[starts.length - 1] + 1;
    const usable = (floor) => gaps.filter((g) => g.len >= floor && g.end > min && g.end < duration - 1);
    const pool = usable(0.7).length ? usable(0.7) : usable(0.4);
    const pick = pool.sort((a, b) => Math.abs(a.end - ideal) - Math.abs(b.end - ideal))[0];
    starts.push(pick ? pick.end : ideal);
  }
  return ids.map((id, n) => ({ id, start: r2(starts[n]), end: r2(n + 1 < ids.length ? starts[n + 1] : duration) }));
}

// ───────────────────────── cues ─────────────────────────
function phraseIndexer(phrases) {
  return (w) => {
    if (!phrases.length) return -1;
    const mid = (w.start + w.end) / 2;
    let best = 0, bestD = Infinity;
    phrases.forEach((p, i) => {
      const d = mid < p.start ? p.start - mid : mid > p.end ? mid - p.end : 0;
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  };
}

/**
 * Words -> cues. Hard breaks: sentence end, speech pause, phrase change, chapter start.
 * Then any cue over maxWords / maxSec is split at its last comma, else in the middle.
 */
export function buildCues(words, { phrases = [], chapterStarts = [], limits = LIMITS, needsReview = false } = {}) {
  if (!words.length) return [];
  const phraseOf = phraseIndexer(phrases);
  const pIdx = words.map(phraseOf);
  const chapterBreak = new Set();
  chapterStarts.forEach((t) => {
    const i = words.findIndex((w) => w.start >= t - 0.05);
    if (i > 0) chapterBreak.add(i);
  });
  const segs = [];
  let a = 0;
  for (let i = 1; i <= words.length; i++) {
    const hard = i === words.length
      || chapterBreak.has(i)
      || SENTENCE_END.test(words[i - 1].w)
      || words[i].start - words[i - 1].end >= limits.pause
      || (phrases.length > 0 && pIdx[i] !== pIdx[i - 1]);
    if (hard) { segs.push([a, i]); a = i; }
  }
  const split = ([s, e]) => {
    const n = e - s;
    const dur = words[e - 1].end - words[s].start;
    if (n <= limits.maxWords && dur <= limits.maxSec) return [[s, e]];
    let cut = -1;
    for (let i = e - 2; i >= s + 2; i--) if (CLAUSE_END.test(words[i].w) && e - (i + 1) >= 2) { cut = i + 1; break; }
    if (cut < 0) cut = s + Math.ceil(n / 2);
    return [...split([s, cut]), ...split([cut, e])];
  };
  return segs.flatMap(split).map(([s, e]) => {
    let start = words[s].start;
    let end = words[e - 1].end;
    if (phrases.length) {
      const p0 = phrases[pIdx[s]];
      const p1 = phrases[pIdx[e - 1]];
      if (s === 0 || pIdx[s - 1] !== pIdx[s]) start = p0.start;
      if (e === words.length || pIdx[e] !== pIdx[e - 1]) end = p1.end;
    }
    const ws = words.slice(s, e).map((w) => ({ w: w.w, start: r2(w.start), end: r2(w.end) }));
    return { start: r2(start), end: r2(Math.max(end, start + 0.1)), text: ws.map((w) => w.w).join(' '), words: ws, ...(needsReview && { needsReview: true }) };
  });
}

// ───────────────────────── one track ─────────────────────────
/**
 * @param {object} i { trackId, chapters: string[], weights?: number[], duration, scriptMd?, phrasesTxt?, whisper?: {w,start,end}[] }
 */
export function alignTrack({ trackId, chapters, weights, duration, scriptMd = '', phrasesTxt = '', whisper = [] }) {
  const warnings = [];
  const script = parseScript(scriptMd);
  const phrases0 = phrasesTxt ? parsePhrases(phrasesTxt, duration) : [];
  const phraseTexts = phrases0.length && phrases0.every((p) => p.text);

  // 1. text
  let words, source, needsReview = false;
  let chapterMarks = [], photoMarks = [];
  if (!script.isPlaceholder) {
    words = script.words; chapterMarks = script.chapterMarks; photoMarks = script.photoMarks; source = 'script';
  } else if (phraseTexts) {
    const sp = parseScript(phrases0.map((p) => p.text).join('\n'));
    words = sp.words; source = 'phrases-text';
  } else if (whisper.length) {
    words = whisper.map((w) => ({ text: w.w.trim(), norm: norm(w.w) })).filter((w) => w.norm); source = 'whisper'; needsReview = true;
    warnings.push(`${trackId}: script is still a placeholder — captions use the Whisper transcript (needsReview). Paste Heet's text into the track script.`);
  } else {
    words = []; source = 'none'; needsReview = true;
    warnings.push(`${trackId}: no script text and no Whisper words — captions are empty (needsReview). Paste the script or run media:captions.`);
  }

  // 2. timings
  let cues, timeline = [];
  if (words.length) {
    let times;
    if (whisper.length) {
      const wh = source === 'whisper' ? { times: whisper.map((w) => ({ start: w.start, end: w.end })), matched: whisper.length } : alignToWhisper(words, whisper);
      times = wh.times;
      if (source !== 'whisper' && wh.matched < words.length * 0.6)
        warnings.push(`${trackId}: only ${wh.matched}/${words.length} script words matched Whisper — check that the script is the exact spoken text.`);
    } else if (phrases0.length) {
      times = mapToPhrases(words, clausesOf(words, chapterMarks), phrases0);
    } else {
      times = spread(words, 0, words.length, 0, duration);
      warnings.push(`${trackId}: no Whisper words or phrase file — word times are spread evenly (drift likely).`);
    }
    timeline = tidy(times, duration).map((t, i) => ({ w: words[i].text, ...t }));
  } else if (phrases0.length) {
    timeline = [];
  }

  // 3. chapters
  const gaps = gapsOf(phrases0.length ? phrases0 : phrasesFromWords(whisper.length ? whisper : timeline));
  const wts = weights ?? chapters.map(() => 1);
  let ranges;
  const byId = new Map(chapterMarks.map((c) => [c.id, c]));
  if (chapters.length === 1) {
    ranges = [{ id: chapters[0], start: 0, end: r2(duration) }];
  } else if (source === 'script' && chapters.every((id) => byId.has(id)) && chapters.every((id, n) => n === 0 || byId.get(id).wordIndex > byId.get(chapters[n - 1]).wordIndex) && timeline.length) {
    const st = chapters.map((id, n) => (n === 0 ? 0 : timeline[Math.min(byId.get(id).wordIndex, timeline.length - 1)].start));
    ranges = chapters.map((id, n) => ({ id, start: r2(st[n]), end: r2(n + 1 < chapters.length ? st[n + 1] : duration) }));
  } else {
    ranges = splitByPauses(chapters, wts, duration, gaps);
    if (chapters.length > 1) {
      needsReview = needsReview || source !== 'script';
      warnings.push(`${trackId}: no usable [[chapter:…]] markers — chapters split at the longest pauses (${ranges.slice(1).map((r) => r.start.toFixed(2) + 's').join(', ')}).`);
    }
  }

  // 4. cues
  if (timeline.length) {
    cues = buildCues(timeline, { phrases: phrases0, chapterStarts: ranges.slice(1).map((r) => r.start), needsReview });
  } else {
    const base = phrases0.length ? phrases0 : phrasesFromWords(whisper);
    const cutAt = ranges.slice(1).map((r) => r.start);
    cues = base.map((p) => ({ start: r2(p.start), end: r2(p.end), text: p.text, needsReview: true }));
    // keep every cue inside one chapter
    cues = cues.flatMap((c) => {
      const cut = cutAt.find((t) => t > c.start + 0.05 && t < c.end - 0.05);
      return cut ? [{ ...c, end: r2(cut) }, { ...c, start: r2(cut) }] : [c];
    });
  }

  // 5. photo anchors
  const photoAnchors = {};
  for (const p of photoMarks) {
    if (p.wordIndex < timeline.length) photoAnchors[p.file] = r2(timeline[p.wordIndex].start);
    else warnings.push(`${trackId}: [[photo:${p.file}]] is after the last spoken word — ignored.`);
  }

  return { trackId, duration: r2(duration), source, needsReview, chapters: ranges, cues, photoAnchors, warnings };
}

// ───────────────────────── CLI ─────────────────────────
const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
const readJson = (p, fb) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fb; } };

export async function measureVoice(voice, fallback) {
  const { parseFile } = await import('music-metadata');
  for (const f of [path.join(root, 'public/media/voice', `${voice}.mp3`)]) {
    if (fs.existsSync(f)) { const m = await parseFile(f, { duration: true }); if (m.format.duration) return r2(m.format.duration); }
  }
  return fallback;
}

/** Inputs for a track from the repo (config entry -> files). */
export async function loadTrackInputs(t, cfg) {
  const caps = path.join(root, 'content/captions');
  const phraseFiles = [`${t.voice}.phrases.txt`, `${t.voice}.timing.txt`, `${t.voice.replace(/^vo-\d+-?/, '')}.timing.txt`, `${t.chapters[0]}.timing.txt`];
  const phrasesTxt = phraseFiles.map((f) => readIf(path.join(caps, f))).find(Boolean) ?? '';
  const whisper = readJson(path.join(caps, `${t.voice}.words.json`), { words: [] }).words ?? [];
  const weights = t.chapters.map((id) => cfg.phases.find((p) => p.id === id)?.weight ?? 1);
  const duration = await measureVoice(t.voice, t.targetSec);
  return { trackId: t.id, chapters: t.chapters, weights, duration, scriptMd: readIf(path.join(root, t.script)), phrasesTxt, whisper };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cfg = readJson(path.join(root, 'content/config/story.config.json'), { tracks: [], phases: [] });
  for (const t of cfg.tracks) {
    const res = alignTrack(await loadTrackInputs(t, cfg));
    fs.mkdirSync(path.join(root, 'content/captions'), { recursive: true });
    fs.writeFileSync(path.join(root, 'content/captions', `${t.id}.cues.json`), JSON.stringify(res, null, 2));
    console.log(`${t.id}: ${res.cues.length} cues · text from ${res.source}${res.needsReview ? ' · NEEDS REVIEW' : ''} · ` +
      res.chapters.map((c) => `${c.id} ${c.start}–${c.end}s`).join(' | '));
    res.warnings.forEach((w) => console.warn(`  ! ${w}`));
  }
}
