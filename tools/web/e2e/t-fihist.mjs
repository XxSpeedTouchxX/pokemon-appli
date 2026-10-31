// Fiche d'une carte (2026-10-31, porteur, d'après sa photo et sa vidéo) :
// - « Historique du prix » : archive quotidienne Dropicards de la cote (web/data/hist), valeur, variation sur la période,
//   axe des montants, dates, ligne pointillée du prix d'achat, périodes 1S, 1M, 3M, 6M, 1A, MAX (MAX par défaut) ;
//   repli sur les moyennes Cardmarket si l'archive manque ;
// - « Prix gradés » : PCA, CCC, PSA (notes 10 à 8, sans 9,5 chez PSA), estimations signalées ; jamais pour le scellé.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
const ID = 'sv03.5-199', SEALED = 'sp-30th-celebration-booster-bundle';
const open = async (w, h, route) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  if (route) await ctx.route(route, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(2000);
  await page.evaluate(() => window.__pkm.resetCollection('demo')); await page.waitForTimeout(800);
  // Dracaufeu-ex 199/165 (151), acheté 375 € le 5 octobre.
  await page.evaluate(id => { const s = window.__pkm.st(); window.__pkm.setState({ extra: (s.extra || []).concat([id]), purchases: (s.purchases || []).concat([{ id: 'e2e-h', date: '2026-10-05', lines: [{ pid: id, qty: 1, lang: 'FR', cond: 'NM' }], total: 375, where: 'Boutique', by: 'toi' }]) }); }, ID);
  await page.waitForTimeout(800);
  return [ctx, page];
};
{
  const [ctx, page] = await open(390, 844);
  // En-tête : « PA » de la même couleur que « PK » (gris clair ; il était violet, puis sombre sur fond sombre).
  const units = await page.evaluate(() => [...document.querySelectorAll('span')].filter(s => /^(PK|PA)$/.test(s.textContent) && s.offsetParent).slice(0, 2).map(s => s.textContent + ':' + getComputedStyle(s).color));
  ok('en-tête : ' + units.join(' · '), units.length === 2 && units[0].split(':')[1] === units[1].split(':')[1]);
  await page.evaluate(id => window.__pkm.fiOpen(id), ID); await page.waitForTimeout(1500);
  const FI = page.locator('section.pkm-fi'), H = FI.locator('section[aria-label="Historique du prix"]'), G = FI.locator('section[aria-label="Prix gradés"]');
  const cote = N(await FI.locator('.pkm-fi-cote').innerText());
  ok('historique : la section est là', (await H.count()) === 1);
  const per = H.locator('.pkm-fh-per button');
  ok('périodes ' + (await per.allInnerTexts()).join(' '), (await per.allInnerTexts()).join(',') === '1S,1M,3M,6M,1A,MAX' && (await per.nth(5).getAttribute('aria-pressed')) === 'true');
  const v = N(await H.locator('.pkm-fi-big').innerText()), chg = N(await H.locator('.pkm-fh-chg').innerText());
  ok('valeur « ' + v + ' » = cote de la fiche', v === cote);
  ok('variation « ' + chg + ' »', /^[+−][\d ]+,\d\d € \([+−][\d,]+ %\) · max$/.test(chg));
  const yl = (await H.locator('.pkm-fh-y span').allInnerTexts()).map(N);
  ok('axe des montants : ' + yl.join(' | '), yl.length >= 3 && yl.every(t => /^[\d ]+(,\d+)? €$/.test(t)));
  const xl = (await H.locator('.pkm-fh-x span').allInnerTexts()).map(N);
  ok('dates : ' + xl.join(' | '), xl[0] === '3 oct.' && /^\d+ (oct|nov|déc)\.$/.test(xl[xl.length - 1]));
  ok('prix d’achat : « ' + N(await H.locator('.pkm-fh-buyl').innerText()) + ' » en pointillés', N(await H.locator('.pkm-fh-buyl').innerText()) === '🛒 375,00 €' && (await H.locator('path.pkm-fh-buy').count()) === 1);
  ok('courbe lissée', /C/.test(await H.locator('path.pkm-fh-line').getAttribute('d')));
  ok('source et début de l’archive', /archivée chaque jour par Dropicards/.test(await H.innerText()) && /depuis le 3 oct\. 2026/.test(await H.innerText()));
  await H.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('fihist-1.png') });
  await per.nth(0).click(); await page.waitForTimeout(300);
  const c1 = N(await H.locator('.pkm-fh-chg').innerText()), x1 = (await H.locator('.pkm-fh-x span').allInnerTexts()).map(N);
  ok('1S : « ' + c1 + ' », dates ' + x1.join(' | '), / · 1 semaine$/.test(c1) && (await per.nth(0).getAttribute('aria-pressed')) === 'true' && x1[0] !== '3 oct.' && !/depuis le 3 oct/.test(await H.innerText()));
  await page.screenshot({ path: shot('fihist-2.png') });
  // Prix gradés
  ok('prix gradés : la section est là', (await G.count()) === 1);
  const co = (await G.locator('.pkm-fg-name').allInnerTexts()).map(N);
  ok('entreprises : ' + co.join(', '), co.join(',') === 'PCA,CCC,PSA');
  const grades = await G.locator('.pkm-fg-co').evaluateAll(cs => cs.map(c => [...c.querySelectorAll('.pkm-fg-pill')].map(p => p.textContent.trim()).join(' ')));
  ok('notes : ' + grades.join(' / '), grades[0] === '10 9,5 9 8,5 8' && grades[1] === '10 9,5 9 8,5 8' && grades[2] === '10 9 8,5 8');
  const k = Number(cote.replace(/[^\d,]/g, '').replace(',', '.')), psa10 = N(await G.locator('.pkm-fg-co').nth(2).locator('.pkm-fg-v').first().innerText());
  const want = '≈ ' + (Math.round(k * 3.5 * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[  ]/g, ' ') + ' €';
  ok('PSA 10 « ' + psa10 + ' » = cote × 3,5 (' + want + ')', psa10 === want);
  ok('chaque note est une estimation signalée', (await G.locator('.pkm-fg-est').count()) === 14 && /aucune vente réelle/.test(await G.innerText()));
  const pill = await G.locator('.pkm-fg-pill').first().evaluate(e => getComputedStyle(e).backgroundColor);
  ok('note 10 en or (' + pill + ')', pill === 'rgb(245, 197, 24)');
  await G.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('fihist-3.png') });
  await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
  // Scellé : historique, sans prix gradés.
  await page.evaluate(id => window.__pkm.fiOpen(id), SEALED); await page.waitForTimeout(1200);
  ok('scellé : historique sans prix gradés', (await H.count()) === 1 && (await G.count()) === 0 && /Tendance Cardmarket archivée/.test(await H.innerText()));
  await ctx.close();
}
// Archive absente (hors ligne) : repli sur les moyennes Cardmarket ; pas de débord à 360 px.
{
  const [ctx, page] = await open(360, 740, /data\/hist\//);
  await page.evaluate(id => window.__pkm.fiOpen(id), ID); await page.waitForTimeout(1500);
  const H = page.locator('section[aria-label="Historique du prix"]');
  ok('sans archive : moyennes Cardmarket (« ' + N(await H.locator('.pkm-fi-note').first().innerText()) + ' »)', /Moyennes Cardmarket : 30 jours, 7 jours, veille/.test(await H.innerText()));
  const over = await page.locator('section.pkm-fi').evaluate(e => e.scrollWidth - e.clientWidth);
  ok('360 : pas de débord (' + over + ')', over <= 0 && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
