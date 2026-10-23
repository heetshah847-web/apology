// Visual pass: screenshots of the folded map, unfolded map and every chapter at fixed scroll fractions (free mode, no audio).
// Run: BASE=http://localhost:4173 node tests/shots-free.mjs [WxH] [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [w, h] = (process.argv[2] ?? '1440x900').split('x').map(Number);
const out = process.argv[3] ?? 'docs/shots/minimal';
const base = process.env.BASE ?? 'http://localhost:4173';
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const mk = async () => {
  const c = await b.newContext({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  return p;
};

let p = await mk();
await p.goto(base);
await p.waitForTimeout(1800);
await p.screenshot({ path: `${out}/00-folded.png` });
await p.getByRole('button', { name: /Tap to unfold/ }).first().click();
await p.waitForTimeout(5200);
await p.screenshot({ path: `${out}/01-unfolded.png` });
await p.context().close();

// fresh context: never unlocked, so entering a track does not start guided audio
p = await mk();
await p.goto(base);
await p.waitForTimeout(1800);
const tracks = await p.evaluate(() =>
  ['t0', 't1', 't2'].map((id) => {
    const e = document.querySelector(`[data-track=${id}]`);
    const sp = e.parentElement;
    return { id, top: sp.getBoundingClientRect().top + scrollY, len: sp.offsetHeight - innerHeight };
  }),
);
for (const t of tracks) {
  for (const f of [0.04, 0.3, 0.55, 0.8, 0.97]) {
    await p.evaluate(([y]) => window.scrollTo(0, y), [t.top + f * t.len]);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${out}/${t.id}-${String(Math.round(f * 100)).padStart(2, '0')}.png` });
  }
}
const q = await p.evaluate(() => {
  const e = document.querySelector('[data-testid=yes-button]');
  return e ? e.getBoundingClientRect().top + scrollY : 0;
});
for (const d of [-500, 0]) {
  await p.evaluate((y) => window.scrollTo(0, y), q + d - 300);
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${out}/q${d === 0 ? '-alive' : '-in'}.png` });
}
await b.close();
