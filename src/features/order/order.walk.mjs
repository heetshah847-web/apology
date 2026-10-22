// LANE-14 walkthrough: node src/features/order/order.walk.mjs [baseUrl]
// Mounts src/features/order/harness.html, checks the WhatsApp link, PNG export, localStorage, edit flow; screenshots 1440x900.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:5114';
const url = (q = '') => `${base}/src/features/order/harness.html${q}`;
const out = 'docs/shots/lane-14';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

for (const [label, q] of [['short', ''], ['long', '?long=1']]) {
  await page.goto(url(q));
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await page.getByRole('heading', { name: /Order confirmed/ }).waitFor();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${out}/receipt-${label}.png`, fullPage: false });

  await page.getByRole('button', { name: 'Send to Heetu' }).click();
  await page.getByRole('status').filter({ hasText: 'Sent' }).waitFor();
  const wa = await page.evaluate(() => window.__opened[0]);
  assert.match(wa, /^https:\/\/wa\.me\/\d*\?text=/);
  const text = decodeURIComponent(wa.split('?text=')[1]);
  console.log(`[${label}] whatsapp text length`, text.length);
  assert.ok(text.length < 1500, 'summary under 1500 chars');
  assert.ok(text.includes('\n'), 'summary has line breaks');
  if (label === 'short') writeFileSync(`${out}/whatsapp.txt`, text);

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas-order-v1')));
  assert.match(saved.number, /^#TANISHA-FOREVER-\d{3}$/);
  assert.ok(saved.sentAt);
}

// Receipt PNG
await page.goto(url());
await page.getByRole('heading', { name: /Order confirmed/ }).waitFor();
await page.waitForTimeout(1500); // let the seal finish stamping
const [dl] =await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save receipt' }).click()]);
assert.match(dl.suggestedFilename(), /^TANISHA-FOREVER-\d{3}\.png$/);
await dl.saveAs(`${out}/receipt-export.png`);

// closing screen
await page.locator('.order-closing').scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/closing.png` });

// edit order flips the store back
await page.getByRole('button', { name: 'Edit order' }).click();
await page.waitForTimeout(300);
assert.equal(await page.locator('#order').count(), 0, 'receipt unmounted after Edit order');

await browser.close();
assert.deepEqual(errors, [], `console/page errors: ${errors.join(' | ')}`);
console.log('order walk OK');
