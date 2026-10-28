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
ok('flèche sur « Contenu possible et chances »', (await boost.locator('summary .pkm-gm-chev svg').count()) === 1);
ok('taux affichés (1 000 PK · 1 %)', /1 000 PK/.test(odds) && /1 %/.test(odds) && /60 %/.test(odds));
const pk0 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(1300);
await page.screenshot({ path: shot('games-scissors.png') });
await page.waitForTimeout(1300);
const pk1 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('booster ouvert : PK crédités (' + pk0 + ' → ' + pk1 + ')', [10, 30, 50, 100, 1000].indexOf(pk1 - pk0) >= 0);
// Grade forcé à Grand maître mondial (helpers.mjs) : booster et pièce toutes les 4 h (2026-10-28).
ok('booster suivant dans 4 h', /Prochain booster dans [34] h/.test(await boost.innerText()));
await page.screenshot({ path: shot('games-booster.png') });
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(3400);
const pk2 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('pièce lancée : 0 ou 30 PK (' + (pk2 - pk1) + ')', pk2 - pk1 === 0 || pk2 - pk1 === 30);
ok('lancer suivant dans 4 h', /Prochain lancer dans [34] h/.test(await coin.innerText()));
await page.screenshot({ path: shot('games-coin.png') });
// Roulette retirée (2026-10-25) : jeu d'évolution avec les PA (points d'Aura).
ok('roulette retirée', (await page.locator('section[aria-label="Roulette"]').count()) === 0);
const evo = page.locator('section[aria-label="Pokédex"]');
ok('évolution : 4 starters (' + (await evo.locator('[aria-label="Starters"] button').allInnerTexts()).join(', ') + ')', (await evo.locator('[aria-label="Starters"] button').allInnerTexts()).join(',') === 'Bulbizarre,Salamèche,Carapuce,Pikachu');
await evo.locator('button[aria-label="Choisir Carapuce comme starter"]').click(); await page.waitForTimeout(400);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { evo: d.evo, buddy: d.buddy }; });
ok('évolution : Carapuce choisi, devenu le compagnon', st.evo && st.evo.line === 'cara' && st.evo.stage === 0 && st.buddy === 7);
ok('évolution : Carabaffe et Tortank en silhouette (500 et 1 500 PA)', (await evo.locator('.pkm-evo-lock').count()) === 2 && /500 PA/.test(await evo.innerText()) && /1[\s\u202f\u00a0]500 PA/.test(await evo.innerText()) && !/Carabaffe|Tortank/.test(await evo.locator('[aria-label="Lignée de ton Pokémon"]').innerText()));
ok('évolution : bouton bloqué sans assez de PA', /Encore [\d\s\u202f\u00a0]+ PA pour évoluer/.test(await evo.innerText()));
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pa = 520; localStorage.setItem(k, JSON.stringify(d)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200); await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(600);
await evo.locator('[aria-label="Actions du Pokédex"] button:has-text("Évoluer")').click(); await page.waitForTimeout(3700);
const st2 = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { evo: d.evo, buddy: d.buddy, pa: d.pa, own: d.pkOwn }; });
ok('évolution : Carabaffe pour 500 PA (' + st2.pa + ' PA restants), nouveau compagnon', st2.evo.stage === 1 && st2.buddy === 8 && st2.pa === 20 && st2.own.indexOf(8) >= 0 && (await evo.locator('.pkm-evo-lock').count()) === 1);
await evo.screenshot({ path: shot('games-evolution.png') });
// PA dans l'en-tête, à la place des tickets.
ok('en-tête : PA sous le solde de PK', /20\s*PA/.test(await page.locator('button[aria-label^="Mes points d’Aura"]').first().innerText()));
// PK shop (2026-10-12) : 4ᵉ onglet, ticket du tirage au sort.
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
const ticket = page.locator('section[aria-label="Ticket · tirage au sort"]');
ok('PK shop : ticket à 2 000 PK', (await ticket.count()) === 1 && /2[\s\u202f\u00a0]000 PK/.test(await ticket.innerText()));
const lot = page.locator('section[aria-label="Booster 30 ans Pokémon"]');
ok('PK shop : lot Booster 30 ans à 15 000 PK, avec son visuel', (await lot.count()) === 1 && /15[\s\u202f\u00a0]000 PK/.test(await lot.innerText()) && (await lot.locator('img[src="img/shop-booster-30-anniversaire.webp"]').count()) === 1);
ok('en-tête : plus de barre de tickets, les PA à la place (2026-10-25)', (await page.locator('header button[aria-label^="Mes tickets"]').count()) === 0 && (await page.locator('header button[aria-label^="Mes points d’Aura"]').count()) >= 1);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pk = 2700; localStorage.setItem(k, JSON.stringify(d)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
await ticket.locator('button:has-text("Acheter un ticket")').click(); await ticket.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(500);
const sd = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'));
ok('ticket acheté : 1 ticket, 700 PK', sd.pk === 700 && sd.tickets && sd.tickets['ticket-booster'] === 1 && /Tu as 1 ticket/.test(await ticket.innerText()));
ok('tickets affichés dans le PK shop (« 1 ticket » sous le solde)', /1 ticket/.test(await page.locator('section[aria-label="Mon solde de PK"]').innerText()));
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
