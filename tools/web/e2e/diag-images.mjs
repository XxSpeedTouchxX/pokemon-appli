// Diagnostic (lancé à la main dans GitHub Actions, workflow images-check.yml) : la démo servie localement, avec les
// VRAIS visuels du CDN TCGdex (rien n'est intercepté), dans Chromium et WebKit (moteur de Safari) en format iPhone.
// Affiche, pour le classeur et une extension, combien de visuels chargent et lesquels tombent sur la carte dessinée.
import { chromium, webkit } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
const WEB = fileURLToPath(new URL('../../../web/', import.meta.url));
const server = await serve(WEB, 8799);
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]]) {
  const b = await type.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: name === 'chromium', hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const page = await ctx.newPage();
  const failed = [];
  page.on('requestfailed', r => { if (/tcgdex|pokemontcg/.test(r.url())) failed.push(r.url() + ' ' + (r.failure() || {}).errorText); });
  page.on('response', r => { if (/tcgdex/.test(r.url()) && r.status() >= 400) failed.push(r.url() + ' HTTP ' + r.status()); });
  page.on('pageerror', e => console.log(name, 'pageerror', e.message));
  const report = async label => {
    await page.waitForTimeout(6000);
    const imgs = await page.$$eval('#app img', is => is.filter(i => i.getBoundingClientRect().height > 40).map(i => ({ src: (i.currentSrc || i.src).slice(0, 90), ok: i.complete && i.naturalWidth > 0, drawn: /^data:|blob:/.test(i.currentSrc || i.src) })));
    const cards = imgs.filter(i => /tcgdex|pokemontcg|^data:/.test(i.src));
    console.log(`\n[${name}] ${label} : ${cards.length} visuels de cartes, ${cards.filter(i => i.ok && !i.drawn).length} chargés, ${cards.filter(i => i.drawn).length} dessinés, ${cards.filter(i => !i.ok).length} non chargés`);
    cards.slice(0, 6).forEach(i => console.log('   ', i.ok ? 'OK ' : 'KO ', i.drawn ? '(dessin)' : '', i.src));
  };
  await page.goto('http://127.0.0.1:8799/?today=2026-10-22&debug', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector('section[aria-label="Mon classeur"]').scrollIntoView());
  await report('classeur (démo)');
  await page.evaluate(() => window.__pkm.push('set', { setId: 'sv08', setFilter: 'all' }));
  await report('extension sv08');
  await page.evaluate(() => window.__pkm.push('set', { setId: '30th', setFilter: 'all' }));
  await report('extension 30th');
  console.log(`[${name}] échecs réseau :`, failed.length, failed.slice(0, 8));
  await b.close();
}
server.close();
