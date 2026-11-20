// Compteur de places du classeur et emblème touchable (2026-11-20, porteur) :
// « le décompte des cartes que l'on a actuellement par rapport à ce qui est autorisé en fonction de notre grade, à gauche
// du logo classeur pour les cartes et à droite pour les produits scellés » ; « lorsque l'utilisateur clique sur le petit
// grade qui apparaît en haut de Dropicards, qu'il tombe sur l'interface avec la description de son grade ».
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const URL = E2E + '/?today=2026-10-31&debug';
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(2000);
await page.evaluate(() => window.__pkm.resetCollection('demo')); await page.waitForTimeout(1200);
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(3000);
// La démo est au grade Grand maître (classeur illimité) : on la ramène au grade Recrue (36 cartes, 9 produits scellés).
await page.evaluate(() => { localStorage.setItem('pkm-grade-force', '1'); const a = window.__pkm.st().admin; window.__pkm.setState({ pkEarned: 0, pkOwn: [], megas: [], admin: a ? Object.assign({}, a, { tier: -1 }) : a }); }); await page.waitForTimeout(500);
const SEC = page.locator('section[aria-label="Mon classeur"]');
const row = SEC.locator('.pkm-bdc-row');
const cnt = await page.evaluate(() => window.__pkm.binderCounts(window.__pkm.st()));
const grade = await page.evaluate(() => window.__pkm.tierOf().cur.name);
ok('démo : ' + cnt.cards + ' cartes, ' + cnt.sealed + ' produits scellés, grade ' + grade, cnt.cards > 0 && cnt.sealed > 0 && grade === 'Recrue');

// Disposition : compteur des cartes à gauche du logo, des produits scellés à droite, sur la même ligne.
const box = await row.evaluate(r => { const [a, img, b] = r.children; const R = e => e.getBoundingClientRect(); return { a: R(a), img: R(img), b: R(b), tag: img.tagName, ta: a.innerText, tb: b.innerText }; });
ok('cartes à gauche du logo, scellé à droite, même hauteur (' + Math.round(box.a.right) + ' < ' + Math.round(box.img.left) + ', ' + Math.round(box.img.right) + ' < ' + Math.round(box.b.left) + ')',
  box.tag === 'IMG' && box.a.right <= box.img.left + 1 && box.img.right <= box.b.left + 1 && Math.abs((box.a.top + box.a.bottom) / 2 - (box.img.top + box.img.bottom) / 2) < 30);
ok('cartes : « ' + N(box.ta) + ' »', N(box.ta) === 'Cartes ' + cnt.cards + '/36 ' + (36 - cnt.cards) + ' places');
ok('scellé : « ' + N(box.tb) + ' »', N(box.tb) === 'Scellés ' + cnt.sealed + '/9 ' + (cnt.sealed >= 9 ? 'Plein' : (9 - cnt.sealed) + (9 - cnt.sealed > 1 ? ' places' : ' place')));
const lab = await row.locator('button').first().getAttribute('aria-label');
ok('lecteur d’écran : « ' + lab + ' »', new RegExp(cnt.cards + ' cartes sur 36 autorisées au grade Recrue').test(lab));
const w = await row.locator('button').first().locator('i i').evaluate(e => e.style.width);
ok('barre de remplissage (' + w + ')', w === Math.round(cnt.cards / 36 * 100) + '%');
await SEC.screenshot({ path: shot('bindercap-1.png') });

// Presque plein (80 %) : orange ; plein : rouge « Plein ».
const addCards = n => page.evaluate(n => { const p = window.__pkm, s = p.st(), c = p.catalog().find(q => q.type !== 'sealed' && p.compute(s).stock[q.id]);
  p.setState({ purchases: s.purchases.concat([{ id: 'zz-' + n + '-' + s.purchases.length, date: '2026-10-30', where: 'Test', total: null, lines: [{ pid: c.id, qty: n, lang: 'FR', cond: 'NM' }] }]) }); }, n);
await addCards(30 - cnt.cards);
await page.waitForTimeout(500);
ok('30/36 : orange (' + N(await row.locator('button').first().innerText()) + ')', /pkm-bdc-warn/.test(await row.locator('button').first().getAttribute('class')) && /30\/36/.test(await row.locator('button').first().innerText()));
await addCards(6);
await page.waitForTimeout(500);
ok('36/36 : rouge « Plein » (' + N(await row.locator('button').first().innerText()) + ')', /pkm-bdc-full/.test(await row.locator('button').first().getAttribute('class')) && N(await row.locator('button').first().innerText()) === 'Cartes 36/36 Plein');
await SEC.screenshot({ path: shot('bindercap-full.png') });

// Un appui sur un compteur ouvre la fiche du grade actuel.
await row.locator('button').first().click(); await page.waitForTimeout(900);
ok('compteur touché : fiche du grade « ' + await page.evaluate(() => window.__pkm.st().screen + ' / ' + window.__pkm.st().gradeIx) + ' »', (await page.evaluate(() => window.__pkm.st().screen)) === 'grade' && /Ton grade actuel/.test(N(await page.locator('body').innerText())));
await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(600);

// DropiPass : places illimitées.
await page.evaluate(() => { localStorage.setItem('pkm-premium-force', '1'); window.__pkm.setState({}); }); await page.waitForTimeout(500);
ok('DropiPass : « ' + N(await row.locator('button').first().innerText()) + ' » et « ' + N(await row.locator('button').last().innerText()) + ' »', /^Cartes \d+ Illimité$/.test(N(await row.locator('button').first().innerText())) && /^Scellés \d+ Illimité$/.test(N(await row.locator('button').last().innerText())) && /pkm-bdc-unl/.test(await row.locator('button').first().getAttribute('class')));
await page.evaluate(() => { localStorage.removeItem('pkm-premium-force'); window.__pkm.setState({}); }); await page.waitForTimeout(300);

// Emblème du grade de l'en-tête : un appui ouvre la fiche de son grade, sur chaque onglet.
for (const sc of ['home', 'market']) {
  await page.evaluate(sc => window.__pkm.setState({ screen: sc, stack: [] }), sc); await page.waitForTimeout(700);
  const em = page.locator('header button.pkm-hh-gbtn').first();
  const lbl = await em.getAttribute('aria-label').catch(() => '');
  await em.click(); await page.waitForTimeout(900);
  const st = await page.evaluate(() => ({ screen: window.__pkm.st().screen, ix: window.__pkm.st().gradeIx }));
  ok('onglet ' + sc + ' : emblème « ' + lbl + ' » → fiche du grade (' + JSON.stringify(st) + ')', /Mon grade : Recrue/.test(lbl) && st.screen === 'grade' && st.ix === 0 && /Ton grade actuel/.test(N(await page.locator('body').innerText())));
}
await page.screenshot({ path: shot('bindercap-grade.png') });
// La taille de l'emblème et la place du logo ne changent pas.
await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(700);
const eb = await page.locator('header .pkm-hh-gbtn').first().evaluate(e => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
ok('emblème toujours 40 × 40 px (' + eb.join(' × ') + ')', eb[0] === 40 && eb[1] === 40);

console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
if (res.some(r => r.startsWith('✗')) || errors.length) process.exitCode = 1;
