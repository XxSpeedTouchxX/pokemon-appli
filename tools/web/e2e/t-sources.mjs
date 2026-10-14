// B7 : source et date des cotes (en-têtes, fiche, « i » du classeur) ; A4 : visuels locaux des cartes de démo,
// démarrage hors ligne avec les dernières cotes.
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
await ctx.route(/assets\.tcgdex\.net/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const B = E2E + '/';
const sync = async () => (await page.locator('#app').innerText()).match(/(Hors ligne · )?Cotes[^\n]*|Article de la collection[^\n]*|Cote du[^\n]*/)?.[0] || '';
await page.goto(B, { waitUntil: 'load' }); await page.waitForTimeout(2500);
const all = await page.locator('#app').innerText();
ok('plus de date figée « 3 oct. à 07:00 »', !/3 oct\. à 07:00|03\/10 à 07:00/.test(all));
const s1 = await sync(); ok('en-tête accueil : ' + s1, /^Cotes (du|cartes du) \d\d\/\d\d.* · Cardmarket, via TCGdex/.test(s1));
ok('valeur : méthode et date', /Cote Dropicards : Cardmarket · du \d\d\/\d\d/.test(all));
const bi = page.locator('section[aria-label="Mon classeur"] button[aria-label="Source et date des cotes"]');
ok('bouton « i » du classeur', (await bi.count()) === 1);
await bi.click(); await page.waitForTimeout(300);
const note = page.locator('[role="note"][aria-label="Source et date des cotes"]');
const nt = await note.innerText();
ok('note : TCGdex, date, prix demandé jamais compté, démo', /TCGdex, catalogue du \d\d\/\d\d/.test(nt) && /jamais compté/.test(nt) && /collection de démo : prix d’exemple/.test(nt));
await note.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('src-binder.png') });
await page.locator('section[aria-label="Mon classeur"] [role="tab"]:has-text("Mes produits scellés")').click(); await page.waitForTimeout(250);
ok('onglet scellé : prix Cardmarket du …', /Produits scellés : prix Cardmarket du \d\d\/\d\d/.test(await note.innerText()));
await page.locator('section[aria-label="Mon classeur"] button[aria-label="Masquer la source des cotes"]').click(); await page.waitForTimeout(200);
ok('« i » replie la note', (await note.count()) === 0);
// A4 : TCGdex bloqué → visuel local de la carte de démo.
await page.locator('section[aria-label="Mon classeur"] [role="tab"]:has-text("Mes cartes")').click(); await page.waitForTimeout(1200);
const local = await page.evaluate(() => [...document.querySelectorAll('section[aria-label="Mon classeur"] img')].filter(i => /img\/card-/.test(i.src) && i.naturalWidth > 0).length);
ok('TCGdex coupé : ' + local + ' visuels locaux affichés dans le classeur', local >= 4);
const empty = await page.evaluate(() => [...document.querySelectorAll('section[aria-label="Mon classeur"] img')].filter(i => i.complete && i.naturalWidth === 0).length);
ok('aucune case vide dans le classeur (' + empty + ')', empty === 0);
await page.screenshot({ path: shot('src-a4.png') });
await page.goto(B + '?start=item&itemId=k1', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('fiche démo : ' + await sync(), /Article de la collection de démo · prix d’exemple/.test(await sync()));
const big = await page.evaluate(() => [...document.querySelectorAll('img')].some(i => /card-pikachu-ex/.test(i.src) && i.naturalWidth > 0));
ok('fiche démo : grand visuel local', big);
await page.goto(B + '?start=item&itemId=p2', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('fiche scellé réel : ' + await sync(), /Cote du \d\d\/\d\d · Cardmarket/.test(await sync()));
// Hors ligne : service worker, puis rechargement sans réseau.
await page.goto(B, { waitUntil: 'load' }); await page.waitForTimeout(500);
// En local (http) l'app n'enregistre pas le service worker : le test l'enregistre comme le ferait l'hébergement.
await page.evaluate(() => navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready)); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('service worker actif', await page.evaluate(() => !!navigator.serviceWorker.controller));
const cached = await page.evaluate(async () => { const k = (await caches.keys()).find(n => /^pkm-demo-v\d+$/.test(n)); if (!k) return false; const c = await caches.open(k); return !!(await c.match('data/cards-base.json')) && !!(await c.match('data/cards-prices.json')) && !!(await c.match('data/sealed.json')); });
ok('catalogue et scellé gardés par le service worker', cached);
await ctx.setOffline(true);
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(2500);
const off = await sync();
ok('hors ligne : app ouverte, ' + off, /^Hors ligne · Cotes (du|cartes du) \d\d\/\d\d/.test(off));
await page.screenshot({ path: shot('src-offline.png') });
await page.goto(B + '#extensions', { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(2000);
ok('hors ligne : extensions du catalogue affichées', /\d+ cartes/.test(await page.locator('#app').innerText()));
await ctx.setOffline(false);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
