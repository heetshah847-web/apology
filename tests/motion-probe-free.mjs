// Free-scroll probe: wheel through the whole page (no unlock, no audio) and record frame times, jumps and reversals.
import { chromium } from 'playwright';
const base = process.env.BASE ?? 'http://localhost:4173';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(base); await p.waitForTimeout(1800);
await p.evaluate(() => { window.__f = []; let last = performance.now(), ly = scrollY; const tick = (t) => { window.__f.push([Math.round(t - last), Math.round(scrollY - ly), Math.round(scrollY)]); last = t; ly = scrollY; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
await p.mouse.move(720, 450);
const total = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 100) { await p.mouse.wheel(0, 100); await p.waitForTimeout(16); }
await p.waitForTimeout(1500);
const f = await p.evaluate(() => window.__f.slice(10));
const dt = f.map((x) => x[0]).sort((a, c) => a - c);
console.log('page height', total, 'frames', f.length, 'median', dt[dt.length >> 1], 'p95', dt[Math.floor(dt.length * 0.95)], 'max', dt.at(-1));
const rev = f.filter((x) => x[1] < -2); console.log('backwards frames', rev.length, rev.slice(0, 6).map((x) => `${x[1]}@${x[2]}`).join(' '));
const big = f.filter((x) => Math.abs(x[1]) > 80); console.log('jumps >80px/frame', big.length, big.slice(0, 8).map((x) => `${x[1]}@${x[2]}`).join(' '));
await b.close();
