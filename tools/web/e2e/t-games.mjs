// 2026-10-11 : onglet Jeux (booster PK, pile ou face, délais gardés), Admin dans les Réglages, fiche d'une carte
// (lien eBay ventes réussies), logo de série repris de ptcg-assets quand TCGdex n'en a pas.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

await page.goto(E2E + '/?start=market', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('onglet « Jeux » dans la barre du bas', (await page.locator('nav button[aria-label="Jeux"]').count()) === 1);
const boost = page.locator('section[aria-label="Booster PK"]'), coin = page.locator('section[aria-label="Pile ou face"]');
ok('booster et pile ou face affichés', (await boost.count()) === 1 && (await coin.count()) === 1);
const odds = (await boost.textContent()).replace(/[\u202f\u00a0]/g, ' ');
ok('taux affichés (1 000 PK · 1 %)', /1 000 PK/.test(odds) && /1 %/.test(odds) && /60 %/.test(odds));
const pk0 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(1300);
await page.screenshot({ path: shot('games-scissors.png') });
await page.waitForTimeout(1300);
const pk1 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('booster ouvert : PK crédités (' + pk0 + ' → ' + pk1 + ')', [10, 30, 50, 100, 1000].indexOf(pk1 - pk0) >= 0);
ok('booster suivant dans 12 h', /Prochain booster dans 1[12] h/.test(await boost.innerText()));
await page.screenshot({ path: shot('games-booster.png') });
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(3400);
const pk2 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('pièce lancée : 0 ou 30 PK (' + (pk2 - pk1) + ')', pk2 - pk1 === 0 || pk2 - pk1 === 30);
ok('lancer suivant dans 8 h', /Prochain lancer dans [78] h/.test(await coin.innerText()));
await page.screenshot({ path: shot('games-coin.png') });
// Roulette (2026-10-12) : ÷2, ×2, +100, −100 sur le solde, jamais sous 0.
const wheel = page.locator('section[aria-label="Roulette"]');
ok('roulette : 4 secteurs, ni chances ni description', (await wheel.locator('.pkm-gm-wlabel').count()) === 4 && !/%/.test(await wheel.innerText()) && !/Fais tourner la roue :/.test(await wheel.innerText()));
const w0 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
await wheel.locator('button:has-text("Faire tourner la roue")').click(); await page.waitForTimeout(4900);
const w1 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('roulette : solde ' + w0 + ' → ' + w1, [Math.floor(w0 / 2), w0 * 2, w0 + 100, Math.max(0, w0 - 100)].indexOf(w1) >= 0);
ok('roulette : prochain tour dans 24 h', /Prochain tour dans 2[34] h/.test(await wheel.innerText()));
await page.screenshot({ path: shot('games-roulette.png') });
// PK shop (2026-10-12) : 4ᵉ onglet, ticket du tirage au sort.
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
const ticket = page.locator('section[aria-label="Ticket · tirage au sort"]');
ok('PK shop : ticket à 2 000 PK', (await ticket.count()) === 1 && /2[\s\u202f\u00a0]000 PK/.test(await ticket.innerText()));
const lot = page.locator('section[aria-label="Booster 30 ans Pokémon"]');
ok('PK shop : lot Booster 30 ans à 15 000 PK, avec son visuel', (await lot.count()) === 1 && /15[\s\u202f\u00a0]000 PK/.test(await lot.innerText()) && (await lot.locator('img[src="img/shop-booster-30-anniversaire.webp"]').count()) === 1);
ok('sans ticket : pas de barre de tickets', (await page.locator('.pkm-tk-head').count()) === 0);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pk = 2700; localStorage.setItem(k, JSON.stringify(d)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
await ticket.locator('button:has-text("Acheter un ticket")').click(); await ticket.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(500);
const sd = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'));
ok('ticket acheté : 1 ticket, 700 PK', sd.pk === 700 && sd.tickets && sd.tickets['ticket-booster'] === 1 && /Tu as 1 ticket/.test(await ticket.innerText()));
ok('barre « 1 ticket » sous le solde de PK', /1 ticket/.test(await page.locator('.pkm-tk-head').first().innerText()));
await page.screenshot({ path: shot('pkshop.png') });
await page.goto(E2E + '/?start=market', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('délais gardés après rechargement', /Prochain booster/.test(await boost.innerText()) && /Prochain lancer/.test(await coin.innerText()));

await page.goto(E2E + '/?start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button:has-text("Mode Admin · paramétrage")'); await page.waitForTimeout(300);
ok('Admin depuis les Réglages : code demandé', (await page.locator('section[aria-label="Code Admin"]').count()) === 1);

await page.goto(E2E + '/?start=set&setId=2013bw', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const logo = await page.locator('main img[src="img/logo-mcdonalds.webp"]').count();
ok('McDonald’s 2013 : logo McDonald’s (absent de TCGdex)', logo >= 1);
await page.locator('main button[aria-label*="n°"]').first().click(); await page.waitForTimeout(800);
const ebay = await page.locator('a:has-text("eBay · ventes réussies")').getAttribute('href');
ok('fiche : lien eBay ventes réussies', /ebay\.fr\/sch\/.*LH_Sold=1&LH_Complete=1/.test(ebay || ''));
await page.screenshot({ path: shot('games-item-ebay.png'), fullPage: false });

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
