// LANE-11 walkthrough: node src/features/question/question.walk.mjs [baseUrl]
// Question harness: 6 No attempts -> No becomes Yes; Yes -> confirm -> answeredYes -> planner in view. Apology demo screenshots.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:5111';
const out = 'src/features/question/shots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const track = (page) => {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};

for (const [name, vp] of [['1440x900', { width: 1440, height: 900 }], ['1366x768', { width: 1366, height: 768 }], ['390x844', { width: 390, height: 844 }]]) {
  const mobile = vp.width < 500;
  const ctx = await browser.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile });
  const page = await ctx.newPage();
  track(page);
  await page.goto(`${base}/src/features/question/harness.html`);
  const no = page.getByTestId('no');
  const yes = page.getByTestId('yes');
  await no.waitFor();
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${out}/question-${name}-0.png` });

  const inside = async () => {
    const [n, y, a] = await Promise.all([no.boundingBox(), yes.boundingBox(), page.locator('#question').boundingBox()]);
    assert.ok(n.x >= 0 && n.y >= 0 && n.x + n.width <= vp.width && n.y + n.height <= vp.height, `No on screen ${JSON.stringify(n)}`);
    const overlap = n.x < y.x + y.width && n.x + n.width > y.x && n.y < y.y + y.height && n.y + n.height > y.y;
    assert.ok(!overlap, `No never overlaps Yes ${name} ${JSON.stringify([n, y])}`);
    return n;
  };

  const seen = new Set();
  for (let i = 1; i <= 6; i++) {
    const b = await no.boundingBox();
    if (mobile) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
    else { await page.mouse.move(b.x - 400, b.y); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); }
    await page.waitForTimeout(900);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas-story-v1')).state.noAttempts);
    assert.equal(stored, i, `attempt ${i} counted`);
    if (i < 6) { seen.add(await no.innerText()); await inside(); }
    if (i === 3) await page.screenshot({ path: `${out}/question-${name}-3.png` });
  }
  assert.ok(seen.size >= 3, 'No label cycles');
  assert.equal((await no.innerText()).trim(), 'Yes', 'No became Yes');
  await page.screenshot({ path: `${out}/question-${name}-6.png` });

  // Yes -> confirm sheet -> answeredYes
  await yes.click();
  await page.getByRole('dialog', { name: 'Promise?' }).waitFor();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/question-${name}-sheet.png` });
  await page.getByTestId('confirm').click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('atlas-story-v1')).state.answeredYes === true);
  await page.getByText("Then let's plan a date").first().waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/question-${name}-confetti.png` });
  await page.waitForFunction(() => { const r = document.getElementById('planner')?.getBoundingClientRect(); return !!r && r.top < innerHeight * 0.5; }, null, { timeout: 8000 });
  await ctx.close();
}

// keyboard: Tab reaches No, it moves on focus; Enter on Yes opens the sheet
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  track(page);
  await page.goto(`${base}/src/features/question/harness.html`);
  await page.getByTestId('no').waitFor();
  const before = await page.getByTestId('no').boundingBox();
  await page.keyboard.press('Tab'); // Yes
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')), 'yes');
  await page.keyboard.press('Tab'); // No
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')), 'no');
  await page.waitForTimeout(700);
  const after = await page.getByTestId('no').boundingBox();
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > 40, 'No moved after keyboard focus');
  await page.getByTestId('yes').focus();
  await page.keyboard.press('Enter');
  await page.getByRole('dialog', { name: 'Promise?' }).waitFor();
  await ctx.close();
}

// apology chapter: from 8s to 30s windows -> scroll through track t2 harness
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  track(page);
  await page.goto(`${base}/src/features/phases/apology/demo/index.html`);
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const dur = 43.3;
  for (const [label, t] of [['a', 16], ['b', 22], ['c', 30], ['d', 38], ['e', 43.3]]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.min(total, (t / dur) * total));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/apology-${label}.png` });
    assert.equal(await page.locator('[data-chapter="apology"]').count(), 1, `apology visible at ${t}s`);
  }
  await ctx.close();
}

await browser.close();
assert.deepEqual(errors, [], `console/page errors: ${errors.join(' | ')}`);
console.log('question walk OK');
