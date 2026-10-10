// Captures d'écrans réels de la démo pour la pub TikTok (tools/promo) : 390 × 844 en ×3.
// Lancer : CHROMIUM=/opt/pw-browsers/chromium E2E_BASE=http://localhost:8765 node tools/promo/capture.mjs
import { launch, withFonts, withDemoCards, BASE } from '../web/e2e/helpers.mjs';
import { mkdirSync } from 'node:fs';
const OUT = new URL('./shots/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, geolocation: { latitude: 48.8566, longitude: 2.3522 }, permissions: ['geolocation'] });
await withFonts(ctx); await withDemoCards(ctx);
await ctx.addInitScript(() => { try { sessionStorage.setItem('pkm-intro-seen', '1'); } catch (e) {} });
const p = await ctx.newPage();
const go = async (hash, name, wait = 2500, fn) => {
  await p.goto(BASE + '/?today=2026-10-20&fx=calm&shot=' + name + hash, { waitUntil: 'load' }); await p.waitForTimeout(wait);
  if (fn) await fn();
  await p.screenshot({ path: OUT + name + '.png' }); console.log(name);
};
await go('', 'home', 4000);
// Sorties : la fiche des UPC 30ᵉ Anniversaire (6 novembre) en haut de l'écran.
await go('#sorties', 'sorties', 3000, async () => {
  await p.evaluate(() => { const el = [...document.querySelectorAll('#app *')].find(e => !e.children.length && /Ultra-Premium 30/.test(e.textContent || '')); const card = el && (el.closest('article, section, li, button') || el); if (card) card.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150); document.querySelectorAll('main, #app, .pkm-scroll').forEach(s => { if (s.scrollTop) s.scrollTop -= 150; }); });
  await p.waitForTimeout(800);
});
await go('#radar', 'radar', 5000);
await go('#territoire', 'territoire', 4000);
await go('#series', 'series', 3000);
await b.close();
