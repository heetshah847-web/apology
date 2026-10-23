// Full guided journey on the production build: map -> t0 -> t1 -> t2 (real audio clock) -> 1.5s hold -> Question -> Yes -> planner.
// Run: npm run build && npx vite preview --port 4173 & BASE=http://localhost:4173 node tests/e2e-journey.mjs [WxH] [ios|android]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const W = process.argv[2] ?? '1440x900'; const [w, h] = W.split('x').map(Number);
const mobile = process.argv[3]; const UA = { ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', android: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' }[mobile];
mkdirSync('docs/shots/walk', { recursive: true });
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: w, height: h }, ...(mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2, userAgent: UA } : {}) });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text().slice(0,140)));
await p.goto((process.env.BASE ?? 'http://localhost:4173') + '/?debug=1'); await p.waitForTimeout(1500);
await p.getByRole('button', { name: /Tap to unfold/ }).first().click();
await p.waitForTimeout(4500);
const T0 = Date.now(); const sec = () => ((Date.now() - T0) / 1000).toFixed(1);
// enter t0 programmatically (no wheel: wheel/touch input hands guided mode to free)
await p.evaluate(() => { const el = document.querySelector('[data-track=t0]'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 4); });
let last = '', shot = 0, doneAt = {};
for (let i = 0; i < 700; i++) {
  await p.waitForTimeout(500);
  const s = await p.evaluate(() => {
    const out = {};
    for (const e of document.querySelectorAll('[data-track]')) out[e.dataset.track] = e.dataset.mode + '/' + e.dataset.theme;
    const q = document.querySelector('[data-testid=yes-button]');
    const qr = q?.getBoundingClientRect();
    return { y: Math.round(scrollY), tr: out, qVisible: !!qr && qr.top < innerHeight && qr.bottom > 0, ov: [...document.querySelectorAll('[data-testid=debug-overlay]')].map(e => e.innerText.match(/t ([\d.]+)\/[\d.]+s/)?.[1] + '|d' + e.dataset.drift).join(' ') };
  });
  // between tracks she scrolls through the interlude by hand; stop as soon as the next track starts guided
  const names = ['t0','t1','t2'];
  for (let n = 0; n < 2; n++) if (s.tr[names[n]]?.startsWith('done') && s.tr[names[n+1]]?.startsWith('idle')) { if (mobile) await p.evaluate(() => scrollBy(0, 220)); else { await p.mouse.move(w/2, h/2); await p.mouse.wheel(0, 220); } }
  const key = JSON.stringify(s.tr);
  if (key !== last) { console.log(sec() + 's', key, 'y=' + s.y, s.ov); last = key; }
  for (const [k, v] of Object.entries(s.tr)) if (v.startsWith('done') && !doneAt[k]) { doneAt[k] = sec(); }
  if (s.tr.t2?.startsWith('done')) {
    const t = Date.now(); const y0 = await p.evaluate(() => Math.round(scrollY)); let moved = null, ymax = y0;
    for (let k = 0; k < 120; k++) { await p.waitForTimeout(100); const y1 = await p.evaluate(() => Math.round(scrollY)); ymax = Math.max(ymax, y1); if (moved === null && Math.abs(y1 - y0) > 3) moved = Date.now() - t; }
    console.log(sec() + 's after voice end: scroll started after', moved, 'ms; y0=' + y0, 'yEnd=' + ymax, 'innerHeight=' + h);
    await p.screenshot({ path: 'docs/shots/walk/' + W + '-after-hold.png' });
    // keep scrolling by hand until the Yes button is alive, then Yes -> Promise -> planner (lazy chunk)
    for (let k = 0; k < 60; k++) { await p.evaluate(() => scrollBy(0, 120)); await p.waitForTimeout(150); if (await p.evaluate(() => { const e = document.querySelector('[data-testid=yes-button]'); const r = e?.getBoundingClientRect(); return !!r && r.top > 0 && r.bottom < innerHeight && !e.closest('[inert]'); })) break; }
    await p.screenshot({ path: 'docs/shots/walk/' + W + (mobile ? 'm' : '') + '-question-alive.png' });
    await p.getByTestId('yes-button').click();
    await p.getByRole('button', { name: /Yes, I'm yours/ }).click();
    const tp = Date.now(); await p.locator('#planner').waitFor({ timeout: 8000 });
    console.log('planner mounted', Date.now() - tp, 'ms after confirm');
    await p.waitForTimeout(3500); await p.screenshot({ path: 'docs/shots/walk/' + W + (mobile ? 'm' : '') + '-planner.png' });
    console.log('planner top =', await p.evaluate(() => Math.round(document.querySelector('#planner').getBoundingClientRect().top)));
    break;
  }
  if (i % 40 === 0) await p.screenshot({ path: `docs/shots/walk/${W}${mobile ? 'm' : ''}-${String(shot++).padStart(2, '0')}.png` });
  if (s.qVisible) { console.log(sec() + 's QUESTION visible y=' + s.y, 'done times', JSON.stringify(doneAt)); await p.waitForTimeout(1500); await p.screenshot({ path: `docs/shots/walk/${W}${mobile ? 'm' : ''}-question.png` }); break; }
}
console.log('errors', errs.filter(e => !/Outdated Optimize/.test(e)));
await b.close();
