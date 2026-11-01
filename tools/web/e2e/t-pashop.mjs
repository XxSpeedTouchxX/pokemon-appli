// PK shop › « Recharger mes PA » (2026-11-01, porteur) : rubriques « Magasin » et « Recharger mes PA » en haut, 4 packs de
// PA, récapitulatif ; paiement pas encore ouvert (rien n'est débité ni crédité).
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
const tabs = page.locator('[role="tablist"][aria-label="PK shop"] [role="tab"]');
ok('rubriques : ' + (await tabs.allInnerTexts()).join(' / '), (await tabs.allInnerTexts()).join('|') === 'Magasin|Recharger mes PA' && (await tabs.first().getAttribute('aria-selected')) === 'true');
ok('Magasin : les articles (ticket) affichés', (await page.locator('section.pkm-shop-item').count()) >= 1);
await tabs.nth(1).click(); await page.waitForTimeout(400);
const sec = page.locator('section[aria-label="Recharger mes PA"]');
ok('Recharger mes PA ouvert, Magasin caché', (await sec.count()) === 1 && (await page.locator('section.pkm-shop-item').count()) === 0 && (await tabs.nth(1).getAttribute('aria-selected')) === 'true');
const packs = (await sec.locator('.pkm-pas-pack').evaluateAll(b => b.map(x => x.getAttribute('aria-label'))));
ok('4 packs : ' + packs.join(' ; '), packs.length === 4 && /^500 PA pour 1,99 €$/.test(N(packs[0])) && /^8 000 PA pour 19,99 €, dont 60 % offerts$/.test(N(packs[3])));
ok('solde : ' + N(await sec.locator('.pkm-pas-bal b').innerText()), N(await sec.locator('.pkm-pas-bal b').innerText()) === '120 PA');
// Effet brillant (2026-11-01, porteur) : un reflet par pack, qui repasse toutes les 2,6 s, gouttes qui flottent.
const fx = await sec.evaluate(el => [...el.querySelectorAll('.pkm-pas-shine')].map(x => { const c = getComputedStyle(x, '::before'); return c.animationName + ' ' + c.animationDuration + ' ' + c.animationIterationCount; }));
ok('reflet sur les 4 packs : ' + fx[0], fx.length === 4 && fx.every(t => t === 'pkmPasShine 2.6s infinite'));
await page.waitForTimeout(900); await sec.screenshot({ path: shot('pashop.png') });
await page.screenshot({ path: shot('pashop-page.png') });
await sec.locator('.pkm-pas-pack').nth(2).click(); await page.waitForTimeout(400);
const dlg = page.locator('section[aria-label="Ton achat de PA"]');
const lines = N(await dlg.locator('.pkm-pas-lines').innerText());
ok('récapitulatif : ' + lines, /Tu recevras 7 000 PA/.test(lines) && /Ton solde après l’achat 7 120 PA/.test(lines) && /Total TTC 9,99 €/.test(lines));
ok('paiement pas encore ouvert, bouton désactivé', /pas encore ouvert/.test(await dlg.innerText()) && (await dlg.locator('.pkm-pas-pay').isDisabled()));
await page.screenshot({ path: shot('pashop-recap.png') });
await dlg.locator('button:has-text("Fermer")').click(); await page.waitForTimeout(300);
ok('fermé, rien de crédité', (await dlg.count()) === 0 && (await page.evaluate(() => window.__pkm.st().pa)) === 120);
// Pokédex › Tous les Pokémon : logo des PA à côté du prix.
await page.evaluate(() => { window.__pkm.tab('market'); window.__pkm.setState({ dexList: true }); }); await page.waitForTimeout(900);
const herb = page.locator('[aria-label="Tous les Pokémon"] button[aria-label^="Herbizarre,"]');
ok('Tous les Pokémon : « ' + N(await herb.locator('.pkm-dexl-price').innerText().catch(() => '')) + ' » avec le logo des PA', N(await herb.locator('.pkm-dexl-price').innerText()) === '50 PA' && /pa\.svg$/.test(await herb.locator('.pkm-dexl-price img').getAttribute('src')));
await page.locator('[aria-label="Tous les Pokémon"]').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('dex-liste-prix.png') });
ok('pas de défilement horizontal', (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
