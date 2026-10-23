// Motion probe: runs track t0 in guided mode and records frame times and scroll deltas to find jank and jumps.
// Run: BASE=http://localhost:4173 node tests/motion-probe.mjs [WxH] [seconds]
import { chromium } from 'playwright';

const [w, h] = (process.argv[2] ?? '1440x900').split('x').map(Number);
const secs = Number(process.argv[3] ?? 20);
const base = process.env.BASE ?? 'http://localhost:4173';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
await p.goto(base);
await p.waitForTimeout(1500);
await p.getByRole('button', { name: /Tap to unfold/ }).first().click();
await p.waitForTimeout(4500);
await p.evaluate(() => {
  window.__f = [];
  let last = performance.now();
  let ly = scrollY;
  const tick = (t) => {
    window.__f.push([Math.round(t - last), Math.round(scrollY - ly), Math.round(scrollY)]);
    last = t;
    ly = scrollY;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const el = document.querySelector('[data-track=t0]');
  window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 4);
});
await p.waitForTimeout(secs * 1000);
const f = await p.evaluate(() => window.__f.slice(10));
const dt = f.map((x) => x[0]);
const dy = f.map((x) => x[1]);
const sorted = [...dt].sort((a, c) => a - c);
console.log('frames', f.length, 'median ms', sorted[Math.floor(sorted.length / 2)], 'p95', sorted[Math.floor(sorted.length * 0.95)], 'max', sorted.at(-1));
console.log('frames >34ms:', dt.filter((x) => x > 34).length, '>50ms:', dt.filter((x) => x > 50).length);
const exp = dy.reduce((a, c) => a + c, 0) / dy.length;
console.log('mean scroll px/frame', exp.toFixed(2));
const bad = f.filter((x) => Math.abs(x[1]) > Math.max(12, Math.abs(exp) * 4));
console.log('abnormal scroll jumps (>4x mean):', bad.length, bad.slice(0, 8).map((x) => `${x[1]}px@y${x[2]}`).join(' '));
const rev = dy.filter((x) => x < 0).length;
console.log('frames where scroll went backwards:', rev);
await b.close();
