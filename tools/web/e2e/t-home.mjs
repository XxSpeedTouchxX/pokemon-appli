import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// Nouvel accueil : ordre des blocs, blocs retirés (dont la liste « Ma collection »), recherche, ajout visible dans le classeur, vide.
const BASE = E2E + '/';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const mk = async (w = 390, h = 844) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
  return page;
};
const page = await mk();
await page.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(2500);
// 1. Ordre des blocs et retraits.
const order = await page.$$eval('main section[aria-label], main > button, main > div > button', els => els.map(e => e.getAttribute('aria-label') || (e.textContent.includes('Marge réalisée') ? 'Marge' : '')).filter(Boolean));
// Depuis le 2026-10-07 : « Mon classeur » après la valeur ; depuis le 2026-10-12 : « Sorties récentes » puis
// « Prochaines sorties » tout en bas.
const want = ['Recherche dans le catalogue', 'Valeur de ma collection', 'Mon classeur', 'Boutiques près de toi', 'Marge', 'Sorties récentes', 'Prochaines sorties'];
const idx = want.map(l => order.indexOf(l));
ok('ordre : ' + order.join(' › '), idx.every((v, i) => v >= 0 && (i === 0 || v > idx[i - 1])) && order[order.length - 1] === 'Prochaines sorties');
const text = await page.locator('main').innerText();
for (const gone of ['Palier Rare', 'Arrivage près de toi', 'Mouvements sur ta collection', 'Mes plus belles pièces', 'Derniers ajouts', 'Plus forte hausse'])
  ok('retiré : ' + gone, !text.includes(gone));
ok('marge réalisée gardée', text.includes('Marge réalisée sur tes ventes'));
ok('mention de non-affiliation', /non affiliée à Nintendo/.test(text));
// 2. Plus de liste « Ma collection » (2026-10-07) : « Mon classeur » la remplace, la marge réalisée reste.
ok('liste « Ma collection » retirée', (await page.locator('section[aria-label="Liste de ma collection"]').count()) === 0 && !(await page.locator('[aria-label="Ordre de ma collection"]').count()));
// 3. Recherche.
await page.fill('input[aria-label="Rechercher dans le catalogue"]', 'pika'); await page.waitForTimeout(800);
const status = await page.locator('section[aria-label="Recherche dans le catalogue"] [role="status"]').innerText();
const hits = await page.$$eval('section[aria-label="Recherche dans le catalogue"] button[style*="min-height: 76px"]', b => b.map(x => x.innerText.split('\n')[0]));
ok('recherche « pika » : ' + status + ' · ' + hits.slice(0, 3).join(', '), hits.length > 0 && hits.length <= 8 && hits.some(h => /pikachu/i.test(h)));
const more = page.locator('section[aria-label="Recherche dans le catalogue"] button:has-text("résultats dans le Marché")');
ok('« Voir les N résultats »', (await more.count()) === 1);
await page.screenshot({ path: shot('home-recherche.png') });
await page.locator('section[aria-label="Recherche dans le catalogue"] button[style*="min-height: 76px"]').first().click(); await page.waitForTimeout(800);
ok('résultat ouvert : fiche', (await page.locator('section[aria-label="Visuel"]').count()) === 1);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(500);
await more.click(); await page.waitForTimeout(800);
ok('Marché sur la même recherche : ' + await page.inputValue('input[aria-label="Rechercher une carte ou un produit"]'), (await page.inputValue('input[aria-label="Rechercher une carte ou un produit"]')) === 'pika');
// 4. Ajout récent en tête : une carte du catalogue ajoutée apparaît en premier.
await page.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.fill('input[aria-label="Rechercher dans le catalogue"]', 'dracaufeu'); await page.waitForTimeout(800);
const target = (await page.locator('section[aria-label="Recherche dans le catalogue"] button[style*="min-height: 76px"]').nth(1).innerText()).split('\n')[0];
await page.locator('section[aria-label="Recherche dans le catalogue"] button[style*="min-height: 76px"]').nth(1).click(); await page.waitForTimeout(800);
await page.locator('button:has-text("Ajouter")').first().click(); await page.waitForTimeout(500);
const save = page.locator('button:has-text("Ajouter à ma collection")').first();
if (await save.count()) { await save.click(); await page.waitForTimeout(500); }
await page.click('button[aria-label="Accueil"]'); await page.waitForTimeout(600);
await page.click('button[aria-label="Effacer la recherche"]').catch(() => {}); await page.waitForTimeout(300);
// L'article ajouté est dans l'un des deux onglets, sur l'une des pages.
const seen = [];
for (const tab of [0, 1]) {
  await page.locator('section[aria-label="Mon classeur"] [role="tab"]').nth(tab).click(); await page.waitForTimeout(300);
  for (let k = 0; k < 20; k++) {
    seen.push(...await page.$$eval('section[aria-label="Mon classeur"] [role="tabpanel"] button[aria-label$="Ouvrir la fiche"]', bs => bs.map(b => b.getAttribute('aria-label'))));
    const next = page.locator('section[aria-label="Mon classeur"] button[aria-label="Page suivante"]');
    if (!(await next.count()) || (await next.getAttribute('aria-disabled')) === 'true') break;
    await next.click(); await page.waitForTimeout(200);
  }
}
ok('article ajouté visible dans « Mon classeur » : ' + target, seen.some(l => l.startsWith(target + ',')));
ok('pas de défilement horizontal (390)', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
await page.context().close();
// Valeur par type (2026-10-17) : « Cartes » + « Produits scellés » = valeur de toute la collection.
{
  const p3 = await mk(390, 844);
  await p3.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await p3.waitForTimeout(2500);
  const eur = t => Number(String(t).replace(/[^\d,]/g, '').replace(',', '.'));
  const parts = await p3.locator('section[aria-label="Valeur de ma collection par type"] button').allInnerTexts();
  const total = (await p3.locator('main').innerText()).match(/Valeur de toute ma collection\s*\n?\s*([\d\s\u202f\u00a0]+,\d\d\s?€)/);
  const sum = parts.reduce((t, x) => t + eur(x.split('\n')[1]), 0);
  ok('Cartes + Produits scellés = valeur totale : ' + parts.map(x => x.replace(/\n/g, ' ')).join(' + ') + ' = ' + (total ? total[1] : '?'),
    parts.length === 2 && !!total && Math.abs(sum - eur(total[1])) < 0.02);
  await p3.locator('section[aria-label="Valeur de ma collection par type"] button').nth(1).click(); await p3.waitForTimeout(300);
  ok('tuile Produits scellés : ouvre l’onglet du classeur', (await p3.getByRole('tab', { name: 'Mes produits scellés' }).getAttribute('aria-selected')) === 'true');
  await p3.context().close();
}
// 5. Collection vide.
const p2 = await mk(360, 740);
await p2.goto(BASE + '?start=settings', { waitUntil: 'load' }); await p2.waitForTimeout(800);
await p2.click('button:has-text("Vider ma collection")'); await p2.waitForTimeout(500);
await p2.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await p2.waitForTimeout(1500);
ok('vide : « Mon classeur » vide, message', /Aucune carte dans ton classeur/.test(await p2.locator('section[aria-label="Mon classeur"]').innerText()));
ok('pas de défilement horizontal (360)', !(await p2.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
// Classeur vide (2026-10-17) : bouton pour ajouter des cartes, puis des produits scellés.
const addCards = p2.getByRole('button', { name: 'Ajouter des cartes', exact: true });
ok('vide : bouton « Ajouter des cartes »', (await addCards.count()) === 1);
await addCards.scrollIntoViewIfNeeded(); await p2.evaluate(() => document.querySelector('main').scrollBy(0, 160)); await p2.waitForTimeout(300);
await p2.screenshot({ path: shot('home-vide.png') });
await p2.getByRole('tab', { name: 'Mes produits scellés' }).click(); await p2.waitForTimeout(300);
await p2.getByRole('button', { name: 'Ajouter des produits scellés' }).click(); await p2.waitForTimeout(900);
ok('vide : « Ajouter des produits scellés » ouvre le catalogue du scellé', /Produits scellés/.test(await p2.locator('h1').first().innerText()));
await p2.goto(BASE + '?start=settings', { waitUntil: 'load' }); await p2.waitForTimeout(600);
await p2.click('button:has-text("Remettre la démo")'); await p2.waitForTimeout(400);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
