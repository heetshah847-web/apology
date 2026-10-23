// Performance (throttled 4G + CPU), accessibility and reduced-motion checks on the production build.
// Run: BASE=http://localhost:4173 node tests/quality-check.mjs
import { chromium } from 'playwright';
const url = (process.env.BASE ?? 'http://localhost:4173') + '/';
const b = await chromium.launch();

// ---------- performance: gate+map on throttled "4G", mid-tier mobile CPU ----------
for (const [name, vp, mobile] of [['mobile 390x844', { width: 390, height: 844 }, true], ['desktop 1440x900', { width: 1440, height: 900 }, false]]) {
  const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: mobile ? 4 : 2 });
  let bytes = 0, reqs = 0; const big = [];
  cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; reqs++; });
  p.on('response', async (r) => { const l = +(r.headers()['content-length'] || 0); if (l > 300000) big.push(`${(l / 1024) | 0}KB ${r.url().split('/').slice(-2).join('/')}`); });
  await p.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(3500);
  const m = await p.evaluate(() => ({ ...window.__m, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime }));
  console.log(`PERF ${name}: FCP ${Math.round(m.fcp)}ms  LCP ${Math.round(m.lcp)}ms  CLS ${m.cls.toFixed(3)}  ${reqs} requests  ${(bytes / 1024) | 0}KB transferred`);
  if (big.length) console.log('   >300KB:', big.join(' | '));
  await ctx.close();
}

// ---------- accessibility ----------
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(url); await p.waitForTimeout(2000);
const a11y = await p.evaluate(() => {
  const out = {};
  out.lang = document.documentElement.lang; out.title = document.title;
  out.noindex = !!document.querySelector('meta[name=robots][content*=noindex]');
  out.imgsNoAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src.split('/').pop());
  const nameOf = (e) => (e.getAttribute('aria-label') || e.innerText || e.title || e.getAttribute('aria-labelledby') || '').trim();
  out.unnamedButtons = [...document.querySelectorAll('button,a[href],[role=button],input,textarea,select')].filter((e) => !nameOf(e) && !e.labels?.length).map((e) => e.outerHTML.slice(0, 90));
  out.h1 = document.querySelectorAll('h1').length;
  out.landmarks = { main: document.querySelectorAll('main,[role=main]').length, nav: document.querySelectorAll('nav,[role=navigation]').length };
  out.focusOutlineRules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } }).filter((r) => /focus-visible/.test(r.selectorText || '')).length;
  return out;
});
console.log('A11Y', JSON.stringify(a11y, null, 1));
// keyboard: tab through the first screen and record what gets focus + whether it has a visible indicator
const seq = [];
for (let i = 0; i < 8; i++) {
  await p.keyboard.press('Tab');
  seq.push(await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'body'; const cs = getComputedStyle(e); return `${e.tagName.toLowerCase()}:"${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 24)}" outline=${cs.outlineStyle}/${cs.outlineWidth} shadow=${cs.boxShadow !== 'none'}`; }));
}
console.log('TAB ORDER', seq);
// contrast of design tokens (text on stage)
const lum = (hex) => { const c = hex.match(/\w\w/g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
console.log('CONTRAST moon-pearl on stage #231d44', cr('eee8f4', '231d44'), '| on stage-deep #17132e', cr('eee8f4', '17132e'), '| gold on stage', cr('c8a45d', '231d44'), '| rose #e7a6b8 on stage', cr('e7a6b8', '231d44'));
console.log('CONTRAST receipt ink #2a2233 on paper #f3ead6', cr('2a2233', 'f3ead6'), '| soft #6d6176 on paper', cr('6d6176', 'f3ead6'));
await ctx.close();

// ---------- reduced motion: page loads, no errors, tracks render without pins ----------
const rctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rp = await rctx.newPage(); const errs = []; rp.on('pageerror', (e) => errs.push(e.message));
await rp.goto(url); await rp.waitForTimeout(2000);
await rp.getByRole('button', { name: /Tap to unfold/ }).first().click(); await rp.waitForTimeout(3000);
console.log('REDUCED-MOTION errors', errs, '| pinned sections:', await rp.evaluate(() => document.querySelectorAll('.pin-spacer').length), '| next/prev stepper buttons:', await rp.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /next|prev/i.test(b.innerText + b.ariaLabel)).length));
await b.close();
