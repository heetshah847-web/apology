// LANE-09 walkthrough: node src/features/phases/love/love.walk.mjs [baseUrl]
// Scrolls track t1 through the Love chapter, screenshots at 1440x900, 1366x768 and 390x844, checks overlays, reduced motion.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:5109';
const url = `${base}/src/features/phases/love/demo/index.html`;
const out = 'docs/shots/lane-09';
mkdirSync(out, { recursive: true });
const story = JSON.parse(readFileSync('src/data/story.generated.json', 'utf8'));
const love = story.phases.find((p) => p.id === 'love');
const dur = story.tracks.find((t) => t.id === 't1').audio.durationSec;
const errors = [];
const browser = await chromium.launch();

async function run(name, viewport, reducedMotion = 'no-preference') {
  const ctx = await browser.newContext({ viewport, reducedMotion });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url);
  await page.waitForTimeout(800);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const at = async (sec, tag) => {
    await page.evaluate((y) => window.scrollTo(0, y), (sec / dur) * total);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${name}-${tag}.png` });
    return page.evaluate(() => ({
      overlays: document.querySelectorAll('[data-overlay-line]').length,
      chapter: !!document.querySelector('[data-chapter="love"]'),
    }));
  };
  const d = love.end - love.start;
  const r0 = await at(love.start + 0.5, 'title');
  assert.ok(r0.chapter, 'love chapter mounted');
  const n = love.media.length;
  for (let i = 0; i < n; i++) {
    const sec = love.start + 1.6 + ((d - 2.2) * (i + 0.5)) / n;
    const r = await at(sec, `photo-${i + 1}`);
    assert.ok(r.overlays <= 1, `at most 1 overlay (got ${r.overlays})`);
    // overlay must not overlap the statement area or the photo frame
    const boxes = await page.evaluate(() => {
      const o = document.querySelector('[data-overlay-line]')?.getBoundingClientRect();
      const f = document.querySelector('[data-chapter="love"] figure')?.getBoundingClientRect();
      return o && f ? { oTop: o.top, fBottom: f.bottom + 40, right: o.right, vw: innerWidth, left: o.left } : null;
    });
    if (boxes) { assert.ok(boxes.oTop >= boxes.fBottom - 4, `overlay clear of frame (${name} #${i + 1})`); assert.ok(boxes.left >= 0 && boxes.right <= boxes.vw, 'overlay inside viewport'); }
  }
  // scrubbing back reverses: return to photo 1 and expect its overlay again
  const back = await at(love.start + 1.6 + ((d - 2.2) * 0.5) / n, 'back');
  assert.equal(back.overlays, 1);
  await ctx.close();
}

await run('1440x900', { width: 1440, height: 900 });
await run('1366x768', { width: 1366, height: 768 });
await run('390x844', { width: 390, height: 844 });
await run('reduced-1440x900', { width: 1440, height: 900 }, 'reduce');
await browser.close();
assert.deepEqual(errors, [], `console/page errors: ${errors.join(' | ')}`);
console.log('love walk OK');
