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
    target: await a.getAttribute('target'), rel: await a.getAttribute('rel'), text: (await a.innerText()).replace(/\s+/g, ' ').trim() };
};
const v1 = await vintedOf();
ok('carte : « Voir sur Vinted ↗ » (« ' + (v1 && v1.q) + ' »)', !!v1 && v1.ok && v1.q === v1.want && /pokemon/i.test(v1.q) && v1.text === 'Voir sur Vinted ↗');
ok('carte : lien ouvert dans une nouvelle page (target _blank, noopener)', !!v1 && v1.target === '_blank' && /noopener/.test(v1.rel || ''));
ok('carte : adresse encodée (espaces en %20)', !!v1 && /search_text=[^&\s]+&order=newest_first$/.test(v1.href) && /%20/.test(v1.href));
// Bloc « Prix du marché » sur le modèle de PokéItem (2026-11-14, porteur) : une ligne par site avec son logo
// (Dropicards, Cardmarket, eBay, Vinted), confiance de la cote, détail Cardmarket, date, « Signaler une erreur de prix »,
// boutons avec logos ; aucun chiffre pour eBay et Vinted (pas d'accès officiel).
const fm = fi.locator('section.pkm-fm');
await fm.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
const fmRows = await fm.locator('.pkm-fm-row').evaluateAll(els => els.map(e => ({ tag: e.tagName, text: e.innerText.replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim(), href: e.getAttribute('href') || '', logo: (e.querySelector('.pkm-fm-logo img') || {}).getAttribute ? e.querySelector('.pkm-fm-logo img').getAttribute('src') : '' })));
ok('prix du marché : 4 lignes Dropicards, Cardmarket, eBay, Vinted (« ' + fmRows.map(r => r.text).join(' | ') + ' »)', fmRows.length === 4 && /^Dropicards /.test(fmRows[0].text) && /^Cardmarket /.test(fmRows[1].text) && /^eBay /.test(fmRows[2].text) && /^Vinted /.test(fmRows[3].text));
ok('prix du marché : cote Dropicards 99,00 € avec sa confiance', /99,00 €/.test(fmRows[0].text) && /Confiance (bonne|moyenne)|Cote à confirmer/.test(fmRows[0].text) && /Médiane Cardmarket · Near Mint/.test(fmRows[0].text));
ok('prix du marché : Cardmarket en lien vers la carte, tendance et prix', fmRows[1].tag === 'A' && /cardmarket\.com/.test(fmRows[1].href) && /Tendance du marché .*€/.test(fmRows[1].text));
ok('prix du marché : eBay ≈ 108,90 € et Vinted ≈ 89,10 €, marqués « estimation » (cote × 1,10 et × 0,90)', fmRows[2].tag === 'A' && /ebay\.fr/.test(fmRows[2].href) && /^eBay Ventes réussies Estimation ≈ 108,90 € Voir ↗$/.test(fmRows[2].text) && fmRows[3].tag === 'A' && /vinted\.fr/.test(fmRows[3].href) && /^Vinted Annonces récentes Estimation ≈ 89,10 € Voir ↗$/.test(fmRows[3].text));
const estNote = (await fm.locator('.pkm-fm-estnote').innerText()).replace(/\s+/g, ' ').trim();
ok('prix du marché : méthode des estimations expliquée (« ' + estNote.slice(0, 60) + '… »)', /eBay × 1,10, Vinted × 0,90/.test(estNote) && /aucune vente eBay ni annonce Vinted n’est relevée/.test(estNote));
const logos = await fm.locator('img').evaluateAll(els => els.map(e => ({ src: e.getAttribute('src'), w: e.naturalWidth })));
ok('prix du marché : logos chargés (' + logos.map(l => l.src.split('/').pop() + ' ' + l.w).join(', ') + ')', ['cardmarket.svg', 'ebay.svg', 'vinted.svg', 'icon-192.png'].every(n => logos.some(l => l.src.split('?')[0].endsWith(n) && l.w > 0)) && logos.every(l => l.w > 0));
ok('prix du marché : logo de chaque ligne (' + fmRows.map(r => r.logo.split('/').pop()).join(', ') + ')', /icon-192\.png(\?v=\w+)?$/.test(fmRows[0].logo) && /cardmarket\.svg$/.test(fmRows[1].logo) && /ebay\.svg$/.test(fmRows[2].logo) && /vinted\.svg$/.test(fmRows[3].logo));
const cells = (await fm.locator('.pkm-fm-cell').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
ok('prix du marché : détail Cardmarket sans la tendance (« ' + cells.join(' | ') + ' »)', cells.length >= 1 && cells.every(c => /€/.test(c)) && !cells.some(c => /^Tendance/.test(c)) && /Détail Cardmarket/.test(await fm.locator('.pkm-fm-dh').innerText()));
ok('prix du marché : pas de date pour une carte de démo (aucune source datée)', (await fm.locator('.pkm-fm-date').count()) === 0);
const rep = await fm.locator('a.pkm-fm-report').getAttribute('href');
ok('prix du marché : « Signaler une erreur de prix » (e-mail prérempli)', /^mailto:contact@dropicards\.fr\?subject=/.test(rep) && /Pikachu/.test(decodeURIComponent(rep)) && /99,00/.test(decodeURIComponent(rep)));
const btns = await fm.locator('a.pkm-fi-buy, a.pkm-fi-ebay, a.pkm-fi-vinted').evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + (e.querySelector('img') || { getAttribute: () => '' }).getAttribute('src').split('/').pop() + ']'));
ok('prix du marché : 3 boutons avec logos (« ' + btns.join(' | ') + ' »)', btns.length === 3 && /^Acheter sur Cardmarket ↗ \[cardmarket\.svg\]$/.test(btns[0]) && /^Voir sur eBay ↗ \[ebay\.svg\]$/.test(btns[1]) && /^Voir sur Vinted ↗ \[vinted\.svg\]$/.test(btns[2]));
const over = await fm.evaluate(sec => { const r = sec.getBoundingClientRect(); return [...sec.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.right > r.right + 0.5 || b.left < r.left - 0.5); }).map(e => e.className).slice(0, 4); });
ok('prix du marché : rien ne dépasse du bloc (' + (over.join(', ') || 'rien') + ')', over.length === 0);
const geo = await fm.locator('a.pkm-fi-buy, a.pkm-fi-ebay, a.pkm-fi-vinted').evaluateAll(els => els.map(e => { const b = e.getBoundingClientRect(), l = e.querySelector('.pkm-fm-blogo').getBoundingClientRect(), a = e.querySelector('.pkm-fm-ar').getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), lx: Math.round(l.left), ax: Math.round(a.right) }; }));
ok('boutons les uns sous les autres, même taille, logos et flèches alignés (' + geo.map(g => g.w + '×' + g.h).join(', ') + ')', geo.length === 3 && geo[0].y < geo[1].y && geo[1].y < geo[2].y && geo.every(g => g.x === geo[0].x && g.w === geo[0].w && g.h === geo[0].h && g.lx === geo[0].lx && g.ax === geo[0].ax) && geo[0].h <= 44);
await fm.screenshot({ path: shot('fiche-marche.png') });
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
const fm3 = fi.locator('section.pkm-fm');
const fmDate = (await fm3.locator('.pkm-fm-date').innerText().catch(() => '')).trim();
ok('carte d’une extension : « ' + fmDate + ' »', /^Dernière mise à jour : \d{2}\/\d{2}(\/\d{4})?$/.test(fmDate));
const r3 = (await fm3.locator('.pkm-fm-row').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
ok('carte d’une extension : 4 lignes et cote Dropicards (« ' + r3[0] + ' »)', r3.length === 4 && /^Dropicards .*(Confiance|à confirmer|Pas encore)/.test(r3[0]));
await fm3.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); await fm3.screenshot({ path: shot('fiche-marche-serie.png') });
await fm3.locator('.pkm-fm-btns').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
await page.screenshot({ path: shot('fiche-marche-boutons.png') });
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
