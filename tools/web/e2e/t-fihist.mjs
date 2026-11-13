// Fiche d'une carte (2026-10-31, porteur, d'après sa photo et sa vidéo) :
// - « Historique du prix » : archive quotidienne Dropicards de la cote (web/data/hist), valeur, variation sur la période,
//   axe des montants, dates, ligne pointillée du prix d'achat, périodes 1S, 1M, 6M, 1A, MAX (MAX par défaut ; « 3M » retiré le 2026-11-13) ;
//   repli sur les moyennes Cardmarket si l'archive manque ;
// - « Prix gradés » (cartes cotées 5 € et plus, 2026-11-01) : logos PCA, CCC, PSA ; notes 10 à 6 en nuances (10 or, 9,5 vert très foncé … 6 jaune-orangé), sans
//   9,5 chez PSA, 10 Black Label et 10 Gold Label chez CCC (2026-11-01) ; estimations signalées ; jamais pour le scellé ;
// - changement de période : la courbe glisse de l'ancienne forme à la nouvelle (2026-11-01).
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
  // En-tête : « PA » de la même couleur que « PK » (il était violet, puis sombre sur fond sombre, puis gris clair).
  const units = await page.evaluate(() => [...document.querySelectorAll('span')].filter(s => /^(PK|PA)$/.test(s.textContent) && s.offsetParent).slice(0, 2).map(s => s.textContent + ':' + getComputedStyle(s).color));
  // Depuis le 2026-11-01 (porteur) : « PK » et « PA » en blanc.
  ok('en-tête : ' + units.join(' · '), units.length === 2 && units.every(u => u.split(':')[1] === 'rgb(255, 255, 255)'));
  await page.evaluate(id => window.__pkm.fiOpen(id), ID); await page.waitForTimeout(1500);
  const FI = page.locator('section.pkm-fi'), H = FI.locator('section[aria-label="Historique du prix"]'), G = FI.locator('section[aria-label="Prix gradés"]');
  const cote = N(await FI.locator('.pkm-fi-cote').innerText());
  ok('historique : la section est là', (await H.count()) === 1);
  const per = H.locator('.pkm-fh-per button');
  ok('périodes ' + (await per.allInnerTexts()).join(' '), (await per.allInnerTexts()).join(',') === '1S,1M,6M,1A,MAX' && (await per.nth(4).getAttribute('aria-pressed')) === 'true' && (await per.nth(1).getAttribute('aria-label')).startsWith('1 mois'));
  const v = N(await H.locator('.pkm-fi-big').innerText()), chg = N(await H.locator('.pkm-fh-chg').innerText());
  ok('valeur « ' + v + ' » = cote de la fiche', v === cote);
  ok('variation « ' + chg + ' »', /^[+−][\d ]+,\d\d € \([+−][\d,]+ %\) · max$/.test(chg));
  const yl = (await H.locator('.pkm-fh-y span').allInnerTexts()).map(N);
  ok('axe des montants : ' + yl.join(' | '), yl.length >= 3 && yl.every(t => /^[\d ]+(,\d+)? €$/.test(t)));
  const xl = (await H.locator('.pkm-fh-x span').allInnerTexts()).map(N);
  ok('dates : ' + xl.join(' | '), xl[0] === '3 oct.' && /^\d+(er)? (oct|nov|déc)\.$/.test(xl[xl.length - 1]));
  ok('prix d’achat : « ' + N(await H.locator('.pkm-fh-buyl').innerText()) + ' » en pointillés', N(await H.locator('.pkm-fh-buyl').innerText()) === '🛒 375,00 €' && (await H.locator('path.pkm-fh-buy').count()) === 1);
  ok('courbe lissée', /C/.test(await H.locator('path.pkm-fh-line').getAttribute('d')));
  ok('source et début de l’archive', /archivée chaque jour par Dropicards/.test(await H.innerText()) && /depuis le 3 oct\. 2026/.test(await H.innerText()));
  await H.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('fihist-1.png') });
  const before = await H.locator('path.pkm-fh-line').getAttribute('d');
  await per.nth(0).click(); await page.waitForTimeout(120);
  const mid = await H.locator('path.pkm-fh-line').getAttribute('d');
  await page.waitForTimeout(900);
  const after = await H.locator('path.pkm-fh-line').getAttribute('d');
  ok('transition : la courbe glisse (tracé intermédiaire, puis tracé lissé exact)', /^M0\.0 [\d.]+ L/.test(mid) && mid.split(' L').length === 72 && mid !== before && mid !== after && /C/.test(after));
  const c1 = N(await H.locator('.pkm-fh-chg').innerText()), x1 = (await H.locator('.pkm-fh-x span').allInnerTexts()).map(N);
  ok('1S : « ' + c1 + ' », dates ' + x1.join(' | '), / · 1 semaine$/.test(c1) && (await per.nth(0).getAttribute('aria-pressed')) === 'true' && x1[0] !== '3 oct.');
  // Toutes les périodes se choisissent (2026-11-13, porteur : « 6M et 1A apparaissent en gris, il faudrait qu'elles soient
  // fonctionnelles ») : une période plus longue que l'archive garde sa longueur, la partie sans cote est hachurée.
  const idx = await page.evaluate(() => fetch('data/hist/index.json').then(r => r.json()));
  const span = Math.round((Date.parse(idx.days[idx.days.length - 1]) - Date.parse(idx.days[0])) / 86400000);
  const off = await per.evaluateAll(bs => bs.filter(b => b.getAttribute('aria-disabled') === 'true' || b.disabled).map(b => b.textContent));
  ok('aucune période grisée (' + (off.join(', ') || 'aucune') + ', archive de ' + (span + 1) + ' jours)', !off.length);
  for (const [lab, days] of [['6M', 182], ['1A', 365]]) {
    await per.filter({ hasText: lab }).click(); await page.waitForTimeout(900);
    const pressed = await per.filter({ hasText: lab }).getAttribute('aria-pressed');
    const c = N(await H.locator('.pkm-fh-chg').innerText()), gap = H.locator('.pkm-fh-gap');
    const gw = (await gap.count()) ? await gap.evaluate(e => e.getBoundingClientRect().width / e.parentElement.getBoundingClientRect().width) : 0;
    const want = days - 1 > span;
    const lineX = await H.locator('path.pkm-fh-line').getAttribute('d');
    ok(lab + ' : choisie, « ' + c + ' », partie hachurée ' + Math.round(gw * 100) + ' %', pressed === 'true' && (want ? gw > 0.3 && / · depuis le 3 oct\.$/.test(c) && /aucune source ouverte/i.test(await H.innerText()) && !/^M0\.0 /.test(lineX) : gw === 0));
    if (lab === '1A') await page.screenshot({ path: shot('fihist-2.png') });
  }
  // Lecture au doigt : trait, point et bulle « prix · date » à l'endroit touché.
  const box = H.locator('.pkm-fh-box'), bb = await box.boundingBox();
  await per.filter({ hasText: 'MAX' }).click(); await page.waitForTimeout(900);
  await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.5); await page.waitForTimeout(150);
  await page.mouse.down(); await page.mouse.move(bb.x + bb.width - 1, bb.y + bb.height * 0.5, { steps: 4 }); await page.waitForTimeout(150);
  const tipEnd = N(await H.locator('.pkm-fh-tip').innerText()), big = N(await H.locator('.pkm-fi-big').innerText());
  ok('lecture au doigt (fin de courbe) : « ' + tipEnd + ' » = dernière cote ' + big, tipEnd.startsWith(big) && /\d{4}$/.test(tipEnd) && await H.locator('.pkm-fh-scrub.pkm-fh-on').count() === 1);
  await page.mouse.move(bb.x + 1, bb.y + bb.height * 0.5, { steps: 4 }); await page.waitForTimeout(150);
  const tipStart = N(await H.locator('.pkm-fh-tip').innerText());
  ok('lecture au doigt (début) : « ' + tipStart + ' » (3 oct. 2026)', /€ ?3 oct\. 2026$/.test(tipStart));
  await page.screenshot({ path: shot('fihist-scrub.png') });
  await page.mouse.up(); await page.waitForTimeout(1900);
  ok('la bulle s’efface après le doigt levé', (await H.locator('.pkm-fh-scrub.pkm-fh-on').count()) === 0);
  // Prix gradés
  ok('prix gradés : la section est là', (await G.count()) === 1);
  const co = await G.locator('.pkm-fg-name img').evaluateAll(im => im.map(i => i.alt));
  ok('entreprises : ' + co.join(', '), co.join(',') === 'PCA,CCC,PSA');
  const grades = await G.locator('.pkm-fg-co').evaluateAll(cs => cs.map(c => [...c.querySelectorAll('.pkm-fg-pill')].map(p => p.querySelector('b').textContent + (p.querySelector('i') ? ' ' + p.querySelector('i').textContent : '')).join(' | ')));
  ok('notes : ' + grades.join(' / '), grades[0] === '10 | 9,5 | 9 | 8 | 7 | 6' && grades[1] === '10 Black Label | 10 Gold Label | 10 | 9,5 | 9 | 8 | 7 | 6' && grades[2] === '10 | 9 | 8 | 7 | 6');
  const logos = await G.locator('img.pkm-fg-logo').evaluateAll(im => im.map(i => i.getAttribute('src').split('/').pop() + ':' + (i.naturalWidth > 0)));
  ok('logos : ' + logos.join(', '), logos.join(',') === 'pca.png:true,ccc.svg:true,psa-color.png:true');
  const k = Number(cote.replace(/[^\d,]/g, '').replace(',', '.')), psa10 = N(await G.locator('.pkm-fg-co').nth(2).locator('.pkm-fg-v').first().innerText());
  const want = '≈ ' + (Math.round(k * 3.5 * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/[\u202f\u00a0]/g, ' ') + ' €';
  ok('PSA 10 « ' + psa10 + ' » = cote × 3,5 (' + want + ')', psa10 === want);
  ok('chaque note est une estimation signalée', (await G.locator('.pkm-fg-est').count()) === 19 && /aucune vente réelle/.test(await G.innerText()));
  const col = async sel => G.locator(sel).first().evaluate(e => { const c = getComputedStyle(e); return c.backgroundImage !== 'none' ? 'dégradé' : c.backgroundColor; });
  const cols = [await col('.pkm-fg-g10'), await col('.pkm-fg-g95'), await col('.pkm-fg-g9'), await col('.pkm-fg-g8'), await col('.pkm-fg-g7'), await col('.pkm-fg-g6'), await col('.pkm-fg-black'), await col('.pkm-fg-gold')];
  ok('nuances : ' + cols.join(' · '), cols.join('|') === 'dégradé|rgb(15, 77, 42)|rgb(21, 128, 61)|rgb(34, 197, 94)|rgb(163, 230, 53)|rgb(251, 168, 31)|rgb(5, 5, 5)|dégradé');
  await G.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('fihist-3.png') });
  await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
  // Carte cotée moins de 5 € : pas de prix gradés (2026-11-01, porteur).
  await page.evaluate(() => window.__pkm.fiOpen('sv08-001')); await page.waitForTimeout(1000);
  const low = Number(N(await FI.locator('.pkm-fi-cote').innerText()).replace(/[^\d,]/g, '').replace(',', '.'));
  ok('carte à ' + low + ' € : pas de prix gradés', low > 0 && low < 5 && (await G.count()) === 0 && (await H.count()) === 1);
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
