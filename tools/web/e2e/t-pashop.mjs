// « Recharger mes PA » (2026-11-01, porteur) : 4 packs de PA, récapitulatif. Depuis le 2026-11-20 (porteur : « qu'elle
// disparaisse complètement de l'onglet PK shop et qu'elle apparaisse quand l'utilisateur clique sur son solde de PA, en haut
// à droite de la description des PA ») : PK shop sans rubriques, bouton en haut à droite de « Mes PA », page à part ; paiement par Stripe depuis le 2026-11-19 (ici, rien n'est payé : parcours complet dans t-pa-pay.mjs).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; d.pa = 120; d.paDay = '2026-10-31'; localStorage.setItem(k, JSON.stringify(d)); });
await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => window.__pkm.tab('pkshop')); await page.waitForTimeout(900);
ok('PK shop : plus de rubriques, plus de « Recharger mes PA »', (await page.locator('[role="tablist"][aria-label="PK shop"]').count()) === 0 && !/Recharger mes PA/.test(await page.locator('main, #app').first().innerText()));
ok('Magasin : les articles (ticket) affichés', (await page.locator('section.pkm-shop-item').count()) >= 1);
// Solde de PA de l'en-tête → « Mes PA » → bouton « Recharger mes PA » en haut à droite.
await page.locator('header button.pkm-pa-head').first().click(); await page.waitForTimeout(700);
const paS = page.locator('section[aria-label="Mes PA"]');
const rb = paS.locator('.pkm-pa-sheet-head button.pkm-pa-recharge');
const pos = await page.evaluate(() => { const h = document.querySelector('section[aria-label="Mes PA"] .pkm-pa-sheet-head'), b = h && h.querySelector('.pkm-pa-recharge'), x = h && h.querySelector('.pkm-pa-sheet-x'), t = h && h.querySelector('h2');
  if (!b) return null; const R = e => e.getBoundingClientRect(), hr = R(h); return { right: (R(b).left + R(b).right) / 2 > hr.left + hr.width / 2, top: Math.abs(R(b).top + R(b).height / 2 - (R(t).top + R(t).height / 2)) < 12, beforeX: R(b).right <= R(x).left }; });
ok('« Mes PA » : bouton « Recharger mes PA » en haut à droite (' + JSON.stringify(pos) + ')', (await rb.count()) === 1 && pos && pos.right && pos.top && pos.beforeX);
ok('« Mes PA » : texte sans « ne s’achètent pas »', /tu peux aussi en recharger/.test(await paS.innerText()) && !/ne s’achètent pas/.test(await paS.innerText()));
await paS.screenshot({ path: shot('pashop-mespa.png') });
await rb.click(); await page.waitForTimeout(600);
const sec = page.locator('section[aria-label="Recharger mes PA"]');
const packs = (await sec.locator('.pkm-pas-pack').evaluateAll(b => b.map(x => x.getAttribute('aria-label'))));
ok('4 packs : ' + packs.join(' ; '), packs.length === 4 && /^500 PA pour 4,99 €$/.test(N(packs[0])) && /^3 000 PA pour 14,99 € : 1 500 PA et 1 500 PA offerts$/.test(N(packs[2])) && /^5 000 PA pour 19,99 € : 2 000 PA et 3 000 PA offerts$/.test(N(packs[3])));
const splits = (await sec.locator('.pkm-pas-split').allInnerTexts()).map(N);
ok('détail des packs : ' + splits.join(' ; ') + ', plus de « % offerts »', splits.join('|') === '1 000 + 500 offerts|1 500 + 1 500 offerts|2 000 + 3 000 offerts' && !/%/.test(N(await sec.innerText())));
ok('solde : ' + N(await sec.locator('.pkm-pas-bal b').innerText()), N(await sec.locator('.pkm-pas-bal b').innerText()) === '120 PA');
// Effet brillant (2026-11-01, porteur) : gouttes qui flottent, étincelle, prix qui pulsent ; le reflet (« voile ») qui
// traversait les packs est retiré à la demande du porteur (même jour : « enlève-moi uniquement l'effet de voile »).
const fx = await sec.evaluate(el => ({ shine: el.querySelectorAll('.pkm-pas-shine').length, drops: [...el.querySelectorAll('.pkm-pas-drop')].filter(x => getComputedStyle(x).animationName !== 'none').length, spark: el.querySelectorAll('.pkm-pas-spark').length }));
ok('plus de reflet sur les packs ; gouttes animées : ' + fx.drops + ', étincelles : ' + fx.spark, fx.shine === 0 && fx.drops >= 4 && fx.spark >= 1);
await page.waitForTimeout(900); await sec.screenshot({ path: shot('pashop.png') });
await page.screenshot({ path: shot('pashop-page.png') });
await sec.locator('.pkm-pas-pack').nth(2).click(); await page.waitForTimeout(400);
const dlg = page.locator('section[aria-label="Ton achat de PA"]');
const lines = N(await dlg.locator('.pkm-pas-lines').innerText());
ok('récapitulatif : ' + lines, /Tu recevras 6 000 PA/.test(lines) && /Ton solde après l’achat 6 120 PA/.test(lines) && /Total TTC 14,99 €/.test(lines));
// Paiement Stripe branché (2026-11-19) : sans serveur (démo hors ligne, comme ici), le récapitulatif reste en lecture
// seule ; le parcours complet avec le serveur imité est dans t-pa-pay.mjs.
ok('sans serveur : paiement indisponible, bouton désactivé, aucune case à cocher', /pas disponible sur cette version/.test(await dlg.innerText()) && (await dlg.locator('.pkm-pas-pay').isDisabled()) && (await dlg.locator('input[type=checkbox]').count()) === 0);
await page.screenshot({ path: shot('pashop-recap.png') });
await dlg.locator('button:has-text("Fermer")').click(); await page.waitForTimeout(800);
ok('fermé, rien de crédité', (await dlg.count()) === 0 && (await page.evaluate(() => window.__pkm.st().pa)) === 120);
await page.locator('.pkm-pas-page button[aria-label="Retour à Mes PA"]').click(); await page.waitForTimeout(600);
ok('flèche : retour à « Mes PA »', (await page.locator('.pkm-pas-page').count()) === 0 && (await page.locator('section[aria-label="Mes PA"]').count()) === 1);
await page.evaluate(() => window.__pkm.setState({ paSheet: false })); await page.waitForTimeout(400);
// Pokédex › Tous les Pokémon : logo des PA à côté du prix.
await page.evaluate(() => { window.__pkm.tab('market'); window.__pkm.setState({ dexList: true }); }); await page.waitForTimeout(900);
const herb = page.locator('[aria-label="Tous les Pokémon"] button[aria-label^="Herbizarre,"]');
ok('Tous les Pokémon : « ' + N(await herb.locator('.pkm-dexl-price').innerText().catch(() => '')) + ' » avec le logo des PA', N(await herb.locator('.pkm-dexl-price').innerText()) === '50 PA' && /pa\.svg$/.test(await herb.locator('.pkm-dexl-price img').getAttribute('src')));
await page.locator('[aria-label="Tous les Pokémon"]').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('dex-liste-prix.png') });
ok('pas de défilement horizontal', (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
