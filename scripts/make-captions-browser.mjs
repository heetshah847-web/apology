// Whisper word timestamps WITHOUT native Python/DLL code (for machines where Windows Application Control
// blocks faster-whisper / openai-whisper). Runs transformers.js (ONNX Runtime WASM) inside Playwright's Chromium.
// Output is identical to scripts/make-captions.py: content/captions/<voice>.words.json
//
// Usage: node scripts/make-captions-browser.mjs [--model Xenova/whisper-small.en] [--lang english] [--force]
// Needs internet once (library from jsDelivr, model from huggingface.co, cached in node_modules/.cache/whisper-profile).
// Audio never leaves this computer: only the model is downloaded.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const MODEL = arg('--model', 'Xenova/whisper-small.en');
const LANG = arg('--lang', MODEL.endsWith('.en') ? null : 'english');
const FORCE = argv.includes('--force');
const LIB = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.0';

const cfg = JSON.parse(fs.readFileSync(path.join(root, 'content/config/story.config.json'), 'utf8'));
const outDir = path.join(root, 'content/captions');
fs.mkdirSync(outDir, { recursive: true });

function findAudio(voice) {
  const cands = [path.join(root, 'public/media/voice', voice + '.mp3')];
  const raw = path.join(root, 'assets-drop/voice');
  if (fs.existsSync(raw)) for (const f of fs.readdirSync(raw)) if (f.startsWith(voice + '.')) cands.push(path.join(raw, f));
  return cands.find((p) => fs.existsSync(p));
}

function ffmpegBin() {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore', shell: process.platform === 'win32' });
  return probe.status === 0 ? 'ffmpeg' : require('ffmpeg-static');
}

/** mp3 -> mono 16 kHz float32 PCM (what Whisper wants) */
function decode16k(file) {
  const r = spawnSync(ffmpegBin(), ['-v', 'error', '-i', file, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + r.stderr);
  return r.stdout;
}

const jobs = cfg.tracks.map((t) => ({ t, audio: findAudio(t.voice), out: path.join(outDir, t.voice + '.words.json') }));
const todo = jobs.filter(({ t, audio, out }) => {
  if (!audio) { console.log(`! ${t.id}: no audio for ${t.voice}`); return false; }
  if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(audio).mtimeMs) { console.log(`= ${t.id}: ${path.basename(out)} is up to date (use --force to redo)`); return false; }
  return true;
});
if (!todo.length) process.exit(0);

const profile = path.join(root, 'node_modules/.cache/whisper-profile');
const ctx = await chromium.launchPersistentContext(profile, { headless: true, args: ['--disable-http2'] });
const page = ctx.pages()[0] ?? (await ctx.newPage());
page.on('console', (m) => { const x = m.text(); if (/error|fail/i.test(x)) console.log('  [browser]', x.slice(0, 200)); });
page.on('requestfailed', (r) => console.log('  [net] failed:', r.url().slice(0, 140), r.failure()?.errorText));
await page.goto('about:blank');

console.log(`loading ${MODEL} (first run downloads the model; this can take a few minutes)…`);
let lastPct = -1;
await page.exposeFunction('__progress', (p) => { const n = Math.floor(p / 10) * 10; if (n !== lastPct) { lastPct = n; process.stdout.write(`  model download ${n}%\r`); } });
// Large model files sometimes drop mid-download on flaky links; finished files stay cached, so just retry.
for (let attempt = 1; ; attempt++) {
  try {
    await page.evaluate(async ({ LIB, MODEL }) => {
      const { pipeline, env } = await import(LIB);
      env.allowLocalModels = false;
      window.__asr = await pipeline('automatic-speech-recognition', MODEL, {
        dtype: 'q8', device: 'wasm',
        progress_callback: (d) => { if (d.status === 'progress' && d.progress != null) window.__progress(d.progress); },
      });
    }, { LIB, MODEL });
    break;
  } catch (e) {
    if (attempt >= 8) throw e;
    console.log(`\n  download hiccup (${String(e.message).split('\n')[0]}); retry ${attempt}/7 (finished files stay cached)…`);
  }
}
console.log('\nmodel ready');

for (const { t, audio, out } of todo) {
  const pcm = decode16k(audio);
  const b64 = Buffer.from(pcm).toString('base64');
  console.log(`transcribing ${t.id} (${path.basename(audio)}, ${(pcm.length / 4 / 16000).toFixed(1)}s)…`);
  const chunks = await page.evaluate(async ({ b64, LANG }) => {
    const bin = atob(b64); const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const audio = new Float32Array(u8.buffer);
    const opts = { return_timestamps: 'word', chunk_length_s: 30, stride_length_s: 5 };
    if (LANG) { opts.language = LANG; opts.task = 'transcribe'; }
    const res = await window.__asr(audio, opts);
    return res.chunks.map((c) => ({ w: c.text.trim(), start: c.timestamp[0], end: c.timestamp[1] }));
  }, { b64, LANG });
  const words = chunks.filter((c) => c.w && c.start != null).map((c) => ({ w: c.w, start: Math.round(c.start * 1000) / 1000, end: Math.round((c.end ?? c.start) * 1000) / 1000 }));
  fs.writeFileSync(out, JSON.stringify({ track: t.id, voice: t.voice, language: 'en', model: MODEL, words }, null, 1));
  console.log(`+ ${t.id}: ${words.length} words -> ${path.relative(root, out)}`);
}
await ctx.close();
