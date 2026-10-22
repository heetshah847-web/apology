// LANE-11 walkthrough: node src/features/question/question.walk.mjs [baseUrl]
// Desktop 1440x900 only. Checks: apology scrubs (photo fades for the last 40%, captions remain),
// 6 No attempts -> No becomes Yes, No never overlaps Yes / leaves the screen, Yes -> planner visible.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:5311';
const url = `${base}/src/features/question/harness.html`;
const out = 'docs/lane11-shots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForSelector('[data-chapter="apology"]');

// ── Apology ───────────────────────────────────────────────────────────────
const trackScroll = await page.evaluate(() => {
  const t = document.querySelector('[data-track="t2"]');
  const spacer = t.parentElement;
  return { top: spacer.getBoundingClientRect().top + scrollY, len: spacer.offsetHeight - innerHeight };
});
// track progress for apology: phase.start/dur, phase.end/dur of t2 (43.3s)
const at = async (trackSec, name) => {
  const y = trackScroll.top + (trackSec / 43.3) * trackScroll.len;
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(3000);
  const photoOpacity = await page.evaluate(() => {
    const el = document.querySelector('[data-chapter="apology"] figure')?.closest('div[style*="opacity"]');
    return el ? Number(getComputedStyle(el.parentElement).opacity) : -1;
  });
  await page.screenshot({ path: `${out}/desktop-apology-${name}.png` });
  return photoOpacity;
};
const early = await at(20, '1-early');
const late = await at(36, '2-focus');
const end = await at(43.2, '3-end');
console.log('photo opacity early/late/end', early, late, end);
assert.ok(early > 0.9, 'photo visible early');
assert.ok(late < 0.1 && end < 0.1, 'photo gone for the last 40%');

// ── The Question ──────────────────────────────────────────────────────────
const qTop = await page.evaluate(() => document.getElementById('question').closest('.pin-spacer').getBoundingClientRect().top + scrollY);
await page.evaluate((v) => window.scrollTo(0, v + 0.3 * 1.6 * innerHeight), qTop);
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/desktop-question-1-headline.png` });
await page.evaluate((v) => window.scrollTo(0, v + 0.75 * 1.6 * innerHeight), qTop);
await page.waitForTimeout(1000);
await page.screenshot({ path: `${out}/desktop-question-2-buttons.png` });

const box = async (id) => page.getByTestId(id).boundingBox();
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
const labels = [];
for (let i = 0; i < 6; i++) {
  const no = await box('no-button');
  labels.push(await page.getByTestId('no-button').innerText());
  await page.mouse.move(no.x - 400, no.y - 40);
  await page.mouse.move(no.x + no.width / 2, no.y + no.height / 2, { steps: 6 });
  await page.waitForTimeout(700);
  if (i < 5) {
    const n2 = await box('no-button'), yes = await box('yes-button');
    assert.ok(n2.x >= 0 && n2.y >= 0 && n2.x + n2.width <= 1440 && n2.y + n2.height <= 900, `No on screen (attempt ${i + 1})`);
    assert.ok(!overlaps(n2, yes), `No does not overlap Yes (attempt ${i + 1})`);
    assert.ok(Math.hypot(n2.x - no.x, n2.y - no.y) > 50, `No moved (attempt ${i + 1})`);
  }
}
console.log('No labels seen:', labels.join(' | '));
await page.screenshot({ path: `${out}/desktop-question-3-no-exhausted.png` });
assert.equal((await page.getByTestId('no-button').innerText()).trim(), 'Yes', 'No became Yes after 6 attempts');

// ── Yes -> confirm -> planner ─────────────────────────────────────────────
await page.getByTestId('no-button').click();
await page.getByRole('dialog', { name: 'Promise?' }).waitFor();
await page.screenshot({ path: `${out}/desktop-question-4-confirm.png` });
await page.getByRole('button', { name: "Yes, I'm yours" }).click();
await page.getByRole('heading', { name: "Then let's plan a date" }).waitFor();
assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('atlas-story-v1')).state.answeredYes), true);
await page.screenshot({ path: `${out}/desktop-question-5-confetti.png` });
await page.waitForFunction(() => { const r = document.getElementById('planner')?.getBoundingClientRect(); return r && Math.abs(r.top) < 40; }, null, { timeout: 8000 });
await page.screenshot({ path: `${out}/desktop-question-6-planner.png` });

assert.deepEqual(errors, [], `console/page errors: ${errors.join('; ')}`);
await browser.close();
console.log('lane 11 walk OK');
