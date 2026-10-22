// LANE-15 e2e (placeholders): question -> planner -> order confirmed, on the real App.
// Run: npx vite --port 5115 & node tests/e2e-back-half.mjs [baseUrl]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:5115';
const out = 'docs/shots/final';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [name, vp] of [['1440', { width: 1440, height: 900 }], ['1366', { width: 1366, height: 768 }], ['390', { width: 390, height: 844 }]]) {
  const page = await (await browser.newContext({ viewport: vp })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('atlas-story-v1', JSON.stringify({ state: { unlocked: true, answeredYes: true, noAttempts: 6, orderPlaced: false }, version: 0 }));
    const d = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
    localStorage.setItem('atlas-planner-v1', JSON.stringify({ state: {
      currentStep: 'delivery', suggestions: 'Sunset drive',
      cart: [{ stepId: 'cuisine', optionId: 'pasta', label: 'Pasta' }, { stepId: 'punish', optionId: 'squats', label: '100 squats' }],
      delivery: { date: d, slot: 'Sunset' }, order: null }, version: 0 }));
  });
  await page.goto(base);
  await page.locator('#planner').waitFor({ timeout: 15000 });
  await page.locator('#planner').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${out}/planner-${name}.png` });
  await page.getByRole('button', { name: /Confirm order/ }).click();
  await page.locator('#order').waitFor();
  await page.locator('#order').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const txt = await page.locator('#order').innerText();
  assert.match(txt, /TANISHA-FOREVER-\d{3}/);
  assert.match(txt, /100 squats/);
  await page.screenshot({ path: `${out}/order-${name}.png` });
  const bad = errors.filter((e) => !/Outdated Optimize Dep/.test(e));
  assert.deepEqual(bad, [], `${name}: ${bad.join(' | ')}`);
  console.log(name, 'ok');
}
await browser.close();
