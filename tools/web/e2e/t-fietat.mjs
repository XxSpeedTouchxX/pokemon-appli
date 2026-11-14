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
// Bloc « Prix du marché » (2026-11-14, porteur) : drapeau et flèche pour choisir la langue de la carte (français par
// défaut, japonais, anglais) ; 4 lignes Dropicards (estimation = moyenne des 3 plateformes), Cardmarket (toutes langues :
// aucune source ouverte par langue), eBay et Vinted (estimations) ; dessous, seulement « Voir sur Cardmarket / eBay /
// Vinted », liens qui suivent la langue choisie.
const N = t => String(t || '').replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
const fm = fi.locator('section.pkm-fm');
await fm.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
const rowsOf = loc => loc.locator('.pkm-fm-row').evaluateAll(els => els.map(e => ({ tag: e.tagName, text: e.innerText.replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim(), href: e.getAttribute('href') || '', logo: e.querySelector('.pkm-fm-logo img') ? e.querySelector('.pkm-fm-logo img').getAttribute('src') : '' })));
const linksOf = async loc => {
  const g = async c => loc.locator(c).getAttribute('href');
  const cm = await g('a.pkm-fi-buy'), eb = await g('a.pkm-fi-ebay'), vt = await g('a.pkm-fi-vinted');
  return { cm: cm, eb: new globalThis.URL(eb).searchParams.get('_nkw') || '', ebSold: /LH_Sold=1&LH_Complete=1/.test(eb) && /^https:\/\/www\.ebay\.fr\/sch\//.test(eb),
    vt: new globalThis.URL(vt).searchParams.get('search_text') || '', vtOk: /^https:\/\/www\.vinted\.fr\/catalog\?search_text=[^&\s]+&order=newest_first$/.test(vt) };
};
const fmRows = await rowsOf(fm);
ok('prix du marché : 4 lignes Dropicards, Cardmarket, eBay, Vinted (« ' + fmRows.map(r => r.text).join(' | ') + ' »)', fmRows.length === 4 && /^Dropicards /.test(fmRows[0].text) && /^Cardmarket /.test(fmRows[1].text) && /^eBay /.test(fmRows[2].text) && /^Vinted /.test(fmRows[3].text));
const confBand = t => { const m = /(Confiance bonne|Confiance moyenne|Cote à confirmer) · (\d+) %/.exec(N(t)); if (!m) return false; const v = +m[2]; return m[1] === 'Confiance bonne' ? v >= 75 && v <= 100 : m[1] === 'Confiance moyenne' ? v >= 50 && v <= 74 : v >= 10 && v <= 49; };
ok('Dropicards : estimation = moyenne des 3 plateformes (≈ 99,00 €), confiance en %', /Estimation · moyenne des 3 plateformes/.test(fmRows[0].text) && /≈ 99,00 €$/.test(fmRows[0].text) && confBand(fmRows[0].text));
ok('Cardmarket : 99,00 €, écrit « Toutes langues » (aucun prix par langue)', fmRows[1].tag === 'A' && /^Cardmarket Toutes langues 99,00 €$/.test(fmRows[1].text));
ok('eBay ≈ 108,90 € et Vinted ≈ 89,10 €, marqués « Estimation »', /^eBay Ventes réussies Estimation ≈ 108,90 €$/.test(fmRows[2].text) && /^Vinted Annonces en ligne Estimation ≈ 89,10 €$/.test(fmRows[3].text));
ok('détail Cardmarket, note d’explication, date et « Signaler » retirés', await fm.locator('.pkm-fm-detail, .pkm-fm-estnote, .pkm-fm-date, .pkm-fm-report').count() === 0);
const logos = await fm.locator('img').evaluateAll(els => els.map(e => ({ src: e.getAttribute('src'), w: e.naturalWidth })));
ok('logos chargés (' + logos.length + ')', ['cardmarket.svg', 'ebay.svg', 'vinted.svg', 'icon-192.png'].every(n => logos.some(l => l.src.split('?')[0].endsWith(n) && l.w > 0)) && logos.every(l => l.w > 0));
const btns = await fm.locator('a.pkm-fi-buy, a.pkm-fi-ebay, a.pkm-fi-vinted').evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ').trim() + ' [' + e.querySelector('img').getAttribute('src').split('/').pop() + '|' + e.getAttribute('target') + ']'));
ok('dessous : seulement « Voir sur Cardmarket / eBay / Vinted » avec logos (« ' + btns.join(' | ') + ' »)', btns.length === 3 && btns[0] === 'Voir sur Cardmarket ↗ [cardmarket.svg|_blank]' && btns[1] === 'Voir sur eBay ↗ [ebay.svg|_blank]' && btns[2] === 'Voir sur Vinted ↗ [vinted.svg|_blank]');
const geo = await fm.locator('a.pkm-fi-buy, a.pkm-fi-ebay, a.pkm-fi-vinted').evaluateAll(els => els.map(e => { const b = e.getBoundingClientRect(), l = e.querySelector('.pkm-fm-blogo').getBoundingClientRect(), a = e.querySelector('.pkm-fm-ar').getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), lx: Math.round(l.left), ax: Math.round(a.right) }; }));
ok('boutons les uns sous les autres, même taille, alignés', geo.length === 3 && geo[0].y < geo[1].y && geo[1].y < geo[2].y && geo.every(g => g.x === geo[0].x && g.w === geo[0].w && g.h === geo[0].h && g.lx === geo[0].lx && g.ax === geo[0].ax));
// Langue de la carte.
const flagBtn = fm.locator('button.pkm-fm-lang');
ok('drapeau français et flèche à droite de « Prix du marché » (« ' + await flagBtn.getAttribute('aria-label') + ' »)', /français/.test(await flagBtn.getAttribute('aria-label')) && await flagBtn.locator('svg').count() === 1 && !(await fm.locator('.pkm-fm-langs').count()));
const fr = await linksOf(fm);
ok('français : eBay ventes réussies de la carte française (« ' + fr.eb + ' »), Vinted (« ' + fr.vt + ' »), Cardmarket filtré en français', fr.ebSold && /^Pikachu ex /.test(fr.eb) && /\(fr,français,vf\)$/.test(fr.eb) && fr.vtOk && /Pikachu ex/.test(fr.vt) && /pokemon/i.test(fr.vt) && /cardmarket\.com/.test(fr.cm) && (/language=2/.test(fr.cm) || /Search\?searchString=/.test(fr.cm)));
await flagBtn.click(); await page.waitForTimeout(300);
const opts = (await fm.locator('.pkm-fm-langs button').allInnerTexts()).map(N);
ok('menu : 3 drapeaux Français, Japonais, Anglais (' + opts.join(', ') + ')', opts.join(',') === 'Français,Japonais,Anglais' && await fm.locator('.pkm-fm-langs .pkm-fm-lflag').count() === 3);
await fm.locator('.pkm-fm-langs button', { hasText: 'Anglais' }).click(); await page.waitForTimeout(300);
const en = await linksOf(fm), enRows = await rowsOf(fm);
ok('anglais choisi : menu fermé, drapeau anglais', !(await fm.locator('.pkm-fm-langs').count()) && /anglais/.test(await flagBtn.getAttribute('aria-label')));
ok('anglais : liens de la carte anglaise (eBay « ' + en.eb + ' », Vinted « ' + en.vt + ' »)', en.ebSold && /\(anglais,english,eng\)$/.test(en.eb) && /anglaise/.test(en.vt) && (/language=1/.test(en.cm) || /Search\?searchString=/.test(en.cm)) && enRows[1].href === en.cm);
await flagBtn.click(); await page.waitForTimeout(250);
await fm.locator('.pkm-fm-langs button', { hasText: 'Japonais' }).click(); await page.waitForTimeout(300);
const ja = await linksOf(fm);
ok('japonais : recherche Cardmarket par le nom, eBay et Vinted en japonais (« ' + ja.eb + ' »)', /Products\/Search\?searchString=/.test(ja.cm) && /\(japonais,japanese,jap\)$/.test(ja.eb) && /japonaise/.test(ja.vt) && ja.ebSold && ja.vtOk);
await fm.screenshot({ path: shot('fiche-marche.png') });
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
await page.locator(TILE).click(); await page.waitForTimeout(700);
ok('fiche rouverte : de nouveau en français', /français/.test(await fi.locator('section.pkm-fm button.pkm-fm-lang').getAttribute('aria-label')));
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
// Produit scellé : la recherche est son nom.
await page.goto(URL + '&debug', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const sid = await page.evaluate(() => { const c = window.__pkm.catalog().find(p => p.kind === 'sealed' || p.sealed || /ETB|Display|Coffret/i.test(p.name)); return c ? c.id : null; });
await page.evaluate(id => window.__pkm.fiOpen(id), sid); await page.waitForTimeout(800);
const sname = await page.evaluate(id => (window.__pkm.catalog().find(p => p.id === id) || {}).name || '', sid), sl = await linksOf(fi.locator('section.pkm-fm'));
ok('scellé (' + sname + ') : Vinted et eBay avec son nom (« ' + sl.vt + ' »)', !!sid && sl.vtOk && sl.vt === (/pok[eé]mon/i.test(sname) ? sname : sname + ' pokemon') && sl.eb === sname);
await page.locator('section.pkm-fi button[aria-label="Fermer"]').click().catch(() => {}); await page.waitForTimeout(300);
// Carte du catalogue (extension) : date de la cote dans la ligne Cardmarket.
await page.goto(URL + '&debug&start=set&setId=sv08', { waitUntil: 'load' }); await page.waitForTimeout(3000);
await page.locator('main button[aria-label]').filter({ hasText: /€|cote/i }).first().click().catch(() => {}); await page.waitForTimeout(900);
const fm3 = fi.locator('section.pkm-fm'), r3 = await rowsOf(fm3), l3 = await linksOf(fm3);
ok('carte d’une extension : Cardmarket « Toutes langues · au jj/mm » (« ' + (r3[1] || {}).text + ' »)', r3.length === 4 && /^Cardmarket Toutes langues · au \d{2}\/\d{2}/.test((r3[1] || {}).text));
ok('carte d’une extension : Dropicards avec sa confiance en % (« ' + (r3[0] || {}).text + ' »)', /^Dropicards /.test((r3[0] || {}).text) && (confBand(r3[0].text) || /Pas encore de cote/.test(r3[0].text)));
ok('carte d’une extension : liens en français (« ' + l3.eb + ' »)', l3.ebSold && /\(fr,français,vf\)$/.test(l3.eb) && /\d/.test(l3.eb) && l3.vtOk);
await fm3.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); await fm3.screenshot({ path: shot('fiche-marche-serie.png') });
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
