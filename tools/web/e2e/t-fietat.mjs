// Fiche d'une carte du classeur (2026-10-31, porteur) : « Déjà possédée ×N » à la place de « ×N dans ta collection » ;
// l'état de la carte avec sa bulle de couleur, modifiable à tout moment (Near Mint → Mint par erreur de saisie) ; le prix
// de la fiche et la pastille du classeur suivent l'état (cote Cardmarket × coefficient) ; enregistré sur l'appareil ;
// « Annuler » rend l'état d'avant. Lien « Voir sur Vinted ↗ » (2026-11-14) : carte, scellé, carte d'une extension.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const URL = E2E + '/?today=2026-10-31';
await page.goto(URL + '&debug', { waitUntil: 'load' }); await page.waitForTimeout(2000);
await page.evaluate(() => window.__pkm.resetCollection('demo')); await page.waitForTimeout(1200);
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(3000);
const SEC = 'section[aria-label="Mon classeur"]', TILE = SEC + ' button[aria-label^="Pikachu ex,"]';
const pill = async () => (await page.locator(TILE + ' .pkm-pill2').innerText()).replace(/\s+/g, ' ').trim();
const p0 = await pill();
ok('classeur : Pikachu ex « ' + p0 + ' »', /^99,00 € NM$/.test(p0.replace(/[  ]/g, ' ')));
await page.locator(TILE).click(); await page.waitForTimeout(800);
const fi = page.locator('section.pkm-fi');
const price = async () => (await fi.locator('.pkm-fi-price').innerText()).replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
const t0 = await price();
ok('fiche : « ' + t0 + ' »', /^99,00 € Prix du marché en Near Mint · Cardmarket Déjà possédée ×1$/.test(t0) && !/dans ta collection/.test(await fi.innerText()));
const chip = fi.locator('.pkm-fi-etat').first();
const c0 = (await chip.innerText()).replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
ok('état : bulle Near Mint et sa valeur (« ' + c0 + ' »)', /Near Mint NM/.test(c0) && /99,00 €/.test(c0) && /nm\.svg$/.test(await chip.locator('img').getAttribute('src')));
await page.screenshot({ path: shot('fietat-1.png') });
await chip.click(); await page.waitForTimeout(400);
const grid = fi.locator('.pkm-fi-etat-grid button');
const names = (await grid.allInnerTexts()).map(t => t.replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim());
ok('6 états avec leur valeur : ' + names.join(' | '), names.length === 6 && /^Mint 113,85 €$/.test(names[0]) && /^Poor 29,70 €$/.test(names[5]) && (await fi.locator('.pkm-fi-etat-grid button[aria-pressed="true"]').innerText()).includes('Near Mint'));
await page.screenshot({ path: shot('fietat-2.png') });
await fi.locator('.pkm-fi-etat-grid button[aria-label^="Mint"]').click(); await page.waitForTimeout(500);
const t1 = await price();
ok('Mint : le prix suit (« ' + t1 + ' »)', /^113,85 € Selon l’état · 99,00 € en Near Mint \(Cardmarket\) Déjà possédée ×1$/.test(t1) && (await fi.locator('.pkm-fi-etat-pick').count()) === 0);
ok('bulle Mint', /mt\.svg$/.test(await fi.locator('.pkm-fi-etat img').first().getAttribute('src')) && /Mint M/.test(await fi.locator('.pkm-fi-etat').first().innerText()));
ok('message « État modifié : Mint » avec « Annuler »', /État modifié : Mint/.test(await page.locator('div[role="status"]').first().innerText()) && /Annuler/.test(await page.locator('div[role="status"]').first().innerText()));
await page.screenshot({ path: shot('fietat-3.png') });
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(500);
ok('classeur : « ' + await pill() + ' »', /^113,85 € M$/.test((await pill()).replace(/[  ]/g, ' ')));
await page.waitForTimeout(1200);
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(3000);
const saved = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return d.purchases.flatMap(a => a.lines).map(l => l.cond).filter(Boolean); });
ok('gardé après rechargement : « ' + await pill() + ' »', /^113,85 € M$/.test((await pill()).replace(/[  ]/g, ' ')) && saved.indexOf('MT') >= 0);
// Annuler : retour à Near Mint.
await page.locator(TILE).click(); await page.waitForTimeout(600);
await fi.locator('.pkm-fi-etat').first().click(); await page.waitForTimeout(300);
await fi.locator('.pkm-fi-etat-grid button[aria-label^="Near Mint"]').click(); await page.waitForTimeout(400);
ok('retour à Near Mint : « ' + await price() + ' »', /^99,00 € Prix du marché en Near Mint · Cardmarket Déjà possédée ×1$/.test(await price()));
await page.locator('div[role="status"] button:has-text("Annuler")').click(); await page.waitForTimeout(400);
ok('« Annuler » rend Mint : « ' + await price() + ' »', /^113,85 €/.test(await price()));
// « Voir sur Vinted ↗ » (2026-11-14, porteur) : sous Cardmarket et eBay, même recherche qu'eBay (avec « pokemon » si
// le mot manque), annonces les plus récentes d'abord, ouvert dans une nouvelle page (sur Android : le navigateur).
const vintedOf = async () => {
  const a = fi.locator('a.pkm-fi-vinted'), e = fi.locator('a.pkm-fi-ebay');
  if (!(await a.count())) return null;
  const href = await a.getAttribute('href'), ebay = new globalThis.URL(await e.getAttribute('href')).searchParams.get('_nkw') || '';
  const u = new globalThis.URL(href), want = /pok[eé]mon/i.test(ebay) ? ebay : (ebay + ' pokemon').trim();
  return { href: href, q: u.searchParams.get('search_text'), want: want, ok: u.origin + u.pathname === 'https://www.vinted.fr/catalog' && u.searchParams.get('order') === 'newest_first',
    target: await a.getAttribute('target'), rel: await a.getAttribute('rel'), text: (await a.innerText()).trim() };
};
const v1 = await vintedOf();
ok('carte : « Voir sur Vinted ↗ » (« ' + (v1 && v1.q) + ' »)', !!v1 && v1.ok && v1.q === v1.want && /pokemon/i.test(v1.q) && v1.text === 'Voir sur Vinted ↗');
ok('carte : lien ouvert dans une nouvelle page (target _blank, noopener)', !!v1 && v1.target === '_blank' && /noopener/.test(v1.rel || ''));
ok('carte : adresse encodée (espaces en %20)', !!v1 && /search_text=[^&\s]+&order=newest_first$/.test(v1.href) && /%20/.test(v1.href));
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
// Produit scellé : la recherche est son nom.
await page.goto(URL + '&debug', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const sid = await page.evaluate(() => { const c = window.__pkm.catalog().find(p => p.kind === 'sealed' || p.sealed || /ETB|Display|Coffret/i.test(p.name)); return c ? c.id : null; });
await page.evaluate(id => window.__pkm.fiOpen(id), sid); await page.waitForTimeout(800);
const v2 = await vintedOf(), sname = await page.evaluate(id => (window.__pkm.catalog().find(p => p.id === id) || {}).name || '', sid);
ok('scellé (' + sname + ') : « Voir sur Vinted ↗ » avec son nom (« ' + (v2 && v2.q) + ' »)', !!sid && !!v2 && v2.ok && v2.q === (/pok[eé]mon/i.test(sname) ? sname : sname + ' pokemon') && v2.target === '_blank');
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click().catch(() => {}); await page.waitForTimeout(300);
// Carte du catalogue (extension) : même recherche qu'eBay (nom anglais et numéro).
await page.goto(URL + '&debug&start=set&setId=sv08', { waitUntil: 'load' }); await page.waitForTimeout(3000);
await page.locator('main button[aria-label]').filter({ hasText: /€|cote/i }).first().click().catch(() => {}); await page.waitForTimeout(900);
const v3 = await vintedOf();
ok('carte d’une extension : même recherche qu’eBay (« ' + (v3 && v3.q) + ' »)', !!v3 && v3.ok && v3.q === v3.want && /\d/.test(v3.q));
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
