import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const stub = (label, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${w * 0.045}" fill="#8EC5FC"/><text x="${w / 2}" y="${h / 2}" font-size="${w / 9}" text-anchor="middle" font-family="sans-serif">${label}</text></svg>`;
const steps = [], errors = [];
const ok = (k, v) => steps.push((v ? '✓ ' : '✗ ') + k);
async function context(blockPtcg) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route('https://assets.tcgdex.net/**', r => r.fulfill({ contentType: 'image/svg+xml', body: stub('TCGdex', 600, 825) }));
  await ctx.route('https://images.pokemontcg.io/**', r => (blockPtcg ? r.abort() : r.fulfill({ contentType: 'image/svg+xml', body: stub('PTCG HD', 734, 1024) })));
  await ctx.route('https://images.scrydex.com/**', r => r.fulfill({ contentType: 'image/svg+xml', body: stub('Scrydex', 600, 825) }));
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  return page;
}
let page = await context(false);
await page.goto(E2E + '/?start=set&setId=swsh9tg', { waitUntil: 'load' });
await page.waitForSelector('text=Série complète');
const note = await page.locator('main p').first().innerText();
ok('Galerie de Dresseurs : ' + note, /version anglaise/.test(note));
const src = await page.locator('main button[aria-label*=", n° "] img').first().getAttribute('src');
ok('vignette pokemontcg.io (petit visuel) : ' + src, /images\.pokemontcg\.io\/swsh9tg\/TG01\.png$/.test(src));
const srcset = await page.locator('main button[aria-label*=", n° "] img').first().getAttribute('srcset');
ok('pas de grand visuel dans la grille', !srcset);
await page.waitForTimeout(400); await page.screenshot({ path: shot('lotA-grille.png') });
await page.locator('main button[aria-label*=", n° "]').first().click();
await page.waitForSelector('button[aria-label^="Agrandir la carte"]');
const hi = await page.locator('button[aria-label^="Agrandir la carte"] img').getAttribute('src');
ok('fiche HD : ' + hi, /_hires\.png$/.test(hi));
await page.click('button[aria-label^="Agrandir la carte"]');
ok('crédit du zoom : ' + await page.locator('#pkm-zoom span span').last().innerText(), await page.locator('text=pokemontcg.io').count() > 0);
await page.keyboard.press('Escape');
// Cartes dessinées
await page.goto(E2E + '/?start=set&setId=2019sm-fr', { waitUntil: 'load' });
await page.waitForSelector('text=Série complète');
ok('McDonald’s 2019 FR : ' + await page.locator('main p').first().innerText(), await page.locator('text=Dropicards les dessine').count() > 0);
const drawn = await page.locator('main button[aria-label*=", n° "] img').first().getAttribute('src');
ok('vignette dessinée', drawn.startsWith('data:image/svg+xml'));
await page.waitForTimeout(300); await page.screenshot({ path: shot('lotA-dessinees.png') });
await page.locator('main button[aria-label*=", n° "]').first().click();
await page.waitForSelector('button[aria-label^="Agrandir la carte"]');
ok('note de la fiche : ' + await page.locator('main p').first().innerText(), await page.locator('text=carte dessinée').count() > 0);
await page.click('button[aria-label^="Agrandir la carte"]');
await page.waitForTimeout(300); await page.screenshot({ path: shot('lotA-zoom-dessinee.png') });
// Repli quand pokemontcg.io ne répond plus
page = await context(true);
await page.goto(E2E + '/?start=set&setId=sm3.5', { waitUntil: 'load' });
await page.waitForSelector('text=Série complète');
const de = await page.locator('main button[aria-label*=", n° "] img').first().getAttribute('src');
ok('Légendes Brillantes garde le scan TCGdex allemand : ' + de, /assets\.tcgdex\.net\/de\//.test(de));
await page.goto(E2E + '/?start=set&setId=swsh9tg', { waitUntil: 'load' });
await page.waitForSelector('text=Série complète');
await page.waitForTimeout(800);
const after2 = await page.locator('main button[aria-label*=", n° "] img').first().evaluate(i => i.currentSrc || i.src);
ok('repli carte dessinée quand pokemontcg.io tombe : ' + after2.slice(0, 30), after2.startsWith('data:image/svg+xml'));
// Collection enregistrée : taille raisonnable
page = await context(false);
await page.goto(E2E + '/?start=set&setId=2019sm-fr', { waitUntil: 'load' });
await page.waitForSelector('text=Série complète');
await page.locator('main button[aria-label*=", n° "]').first().click();
await page.click('button:has-text("+ Ajouter un exemplaire")'); await page.waitForTimeout(150);
await page.locator('button:has-text("Ajouter à ma collection")').last().click(); await page.waitForTimeout(600);
const saved = await page.evaluate(() => { const t = localStorage.getItem('pkm-collection-v1'); const d = JSON.parse(t); return { size: t.length, cards: Object.keys(d.cards), data: /data:image/.test(t) }; });
ok('enregistrement : ' + saved.size + ' caractères, ' + saved.cards.length + ' carte(s), sans image dessinée', saved.size < 20000 && !saved.data && saved.cards.length === 1);
await page.goto(E2E + '/?start=home', { waitUntil: 'load' });
await page.waitForTimeout(800);
ok('carte dessinée dans le classeur après rechargement', (await page.locator('section[aria-label="Mon classeur"] button[aria-label^="Bulbizarre"]').count()) > 0);
// WebP refusé (2026-10-22) : le visuel TCGdex est redemandé en PNG avant la carte dessinée.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const asked = [];
  await ctx.route('https://assets.tcgdex.net/**', r => { const u = r.request().url(); asked.push(u); return /\.webp$/.test(u) ? r.fulfill({ status: 404, body: '' }) : r.fulfill({ contentType: 'image/svg+xml', body: stub('PNG', 600, 825) }); });
  await ctx.route(/fonts\.g|openfreemap|pokemontcg/, r => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await p.goto(E2E + '/?today=2026-10-04', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  const imgs = await p.$$eval('section[aria-label="Mon classeur"] [role="tabpanel"] button img', is => is.map(i => [i.currentSrc || i.src, i.naturalWidth]));
  const tc = imgs.filter(i => /tcgdex/.test(i[0]));
  ok('WebP refusé : visuels repris en PNG (' + tc.length + ')', tc.length >= 5 && tc.every(i => /\.png$/.test(i[0]) && i[1] > 0) && asked.some(u => /\.png$/.test(u)));
  await ctx.close();
}
console.log(steps.join('\n'));
console.log(errors.length ? 'ERREURS\n' + errors.join('\n') : 'aucune erreur');
await browser.close();
