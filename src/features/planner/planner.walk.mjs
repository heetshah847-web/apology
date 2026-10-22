// LANE-12 walkthrough: node src/features/planner/planner.walk.mjs [baseUrl]
// Walks every step at /planner-harness.html, checks persistence and the produced Order, takes screenshots.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

<<<<<<< HEAD
const base = process.argv[2] ?? 'http://localhost:5212';
const url = `${base}/planner-harness.html`;
const out = 'docs/lane12-shots';
=======
const base = process.argv[2] ?? 'http://localhost:5112';
const url = `${base}/planner-harness.html`;
const out = 'docs/shots/lane-12';
>>>>>>> d66ca9a
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

for (const [name, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url);
  const pick = (l) => page.getByRole('button', { name: new RegExp(`${l}.*(Add to the royal cart|In cart)`) }).click();
  const step = (n) => page.getByRole('navigation', { name: 'Planner steps' }).getByRole('button', { name: new RegExp(`^${n}\.`) }).click();

  await page.getByRole('button', { name: /^Choose / }).click();
  await page.getByText('Why choose?').waitFor();
  await page.getByText('Smash Karts battle').first().waitFor();
  await page.screenshot({ path: `${out}/${name}-1-activity.png` });

  await page.getByRole('button', { name: /Next/ }).click();                  // cuisine
  await pick('Pasta');
  await page.screenshot({ path: `${out}/${name}-2-cuisine.png` });
  await page.getByRole('button', { name: /Next/ }).click();                  // dessert
  await pick('Tiramisu');
  await step(4);
  await pick('Current Heetu');
  await step(5);
  await pick('Red roses');
  await step(6);
  await page.getByRole('textbox', { name: 'Your wishes' }).fill('Long drive and no phones');
  await page.getByRole('button', { name: 'Sunset' }).click();
  await step(7);
  await page.getByText('Long drive and no phones').waitFor();
  await page.screenshot({ path: `${out}/${name}-7-review.png`, fullPage: true });

  // back-and-forth editing + refresh persistence
  await step(2);
  await pick('Pizza');
  await page.reload();
  await step(7);
  await page.getByRole('region', { name: 'Cuisine' }).getByText('Pizza', { exact: true }).waitFor();
  assert.equal(await page.getByRole('region', { name: 'Cuisine' }).getByText('Pasta', { exact: true }).count(), 0);

  await step(8);
  await page.getByRole('button', { name: /Confirm order/ }).isDisabled().then((d) => assert.ok(d));
  await page.locator('.rdp-day:not([data-disabled]) button').first().click();
  await page.getByRole('button', { name: 'Sunset', exact: true }).last().click();
  await page.screenshot({ path: `${out}/${name}-8-delivery.png`, fullPage: true });
  await page.getByRole('button', { name: /Confirm order/ }).click();

  const order = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas-planner-v1')).state.order);
  assert.ok(order.items.length >= 8, 'items in order');
  assert.ok(order.items.some((i) => i.bonus), 'bonus item present');
  assert.match(order.delivery.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(order.delivery.slot, 'Sunset');
  assert.ok(order.suggestions.includes('no phones'));
  assert.ok(!Number.isNaN(Date.parse(order.createdAt)));
  const story = await page.evaluate(() => JSON.parse(localStorage.getItem('atlas-story-v1')).state.orderPlaced);
  assert.equal(story, true);
  assert.deepEqual(errors, []);
  console.log(`${name}: ok (${order.items.length} items)`);
  await ctx.close();
}
await browser.close();
