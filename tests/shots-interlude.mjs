// Screenshots the three map interludes (between the narrated tracks) at 25/50/75% of their scroll length.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base = process.env.BASE ?? 'http://localhost:4173';
const out = process.argv[2] ?? 'docs/shots/minimal';
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(base); await p.waitForTimeout(1800);
const secs = await p.evaluate(() => [...document.querySelectorAll('section[aria-label]')].filter((s) => !s.dataset.track && s.style.height.endsWith('svh')).map((s) => ({ top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight, n: s.getAttribute('aria-label') })));
console.log(secs.map((s) => `${s.n}@${Math.round(s.top)}+${s.h}`).join(' | '));
let i = 0;
for (const s of secs) for (const f of [0.25, 0.5, 0.75]) {
  await p.evaluate((y) => window.scrollTo(0, y), s.top + f * (s.h - 900)); await p.waitForTimeout(1400);
  await p.screenshot({ path: `${out}/i${i}-${Math.round(f * 100)}.png` });
}
await b.close();
