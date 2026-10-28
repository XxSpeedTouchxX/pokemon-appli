// Grades (2026-10-28, porteur) : conditions (PK gagnés, compagnons, méga-évolutions) et avantages appliqués sur
// l'appareil : jeu de la pièce fermé à la Recrue, délais du Booster et de la pièce, scans par jour, ticket, booster et
// item Deluxe du PK shop, carte de France du Radar ; méga-évolutions débloquées avec des PA dans le Pokédex (route d’évolution et fiche). Le vrai grade est
// gardé (E2E_GRADE=0) : l'état est préparé dans le stockage de l'appareil.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const KEY = 'pkm-collection-v1', DAY = '2026-11-02';
const go = async q => { await page.goto(E2E + '/?today=' + DAY + (q ? '&' + q : ''), { waitUntil: 'load' }); await page.waitForTimeout(1200); };
const seed = async patch => {
  await page.evaluate(([k, p]) => { const d = JSON.parse(localStorage.getItem(k) || '{}'); Object.assign(d, p); localStorage.setItem(k, JSON.stringify(d)); }, [KEY, patch]);
};
const text = async sel => (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ');
// Les 151 de Kanto et les 5 légendaires, sans les 4 offerts : de quoi débloquer N compagnons.
const PAID = Array.from({ length: 151 }, (_, i) => i + 1).filter(n => [1, 4, 7, 25].indexOf(n) < 0).concat([380, 381, 382, 383, 384]);

// 1. Recrue (premier lancement)
await go('start=market'); await seed({ tuto: 'done', onb: 0 }); await go('start=market');
const coin = await text('section[aria-label="Pile ou face"]');
ok('Recrue : pièce fermée (« ' + coin.slice(-110) + ' »)', /Au grade Chasseur/.test(coin) && /se débloque au grade Chasseur/.test(coin));
ok('Recrue : un booster toutes les 24 h', /1 offert toutes les 24 h/.test(await text('section[aria-label="Booster PK"]')));
await page.screenshot({ path: shot('grades-recrue-jeux.png'), fullPage: true });
const toShop = async () => { await go('start=market'); await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700); };
await toShop();
const shop = await text('main');
ok('Recrue : ticket réservé au Collectionneur', /Réservé au grade Collectionneur \(5[   ]000 PK gagnés \+ 15 compagnons débloqués\)/.test(shop));
ok('Recrue : booster réservé au Dresseur Pokémon', /Réservé au grade Dresseur Pokémon/.test(shop));
ok('item Deluxe réservé au Grand maître mondial Pokémon', (await page.locator('section[aria-label="Item Deluxe"]').count()) === 1 && /Réservé au grade Grand maître mondial Pokémon/.test(shop));
await page.screenshot({ path: shot('grades-recrue-shop.png'), fullPage: true });
await go('start=radar');
ok('Recrue : la carte de France ouvre la fiche du grade Maître Pokémon', (await page.locator('section[aria-label="Grade Maître Pokémon"]').count()) === 1 && (await page.locator('#pkm-radar-map').count()) === 0);
const gs = await text('main');
ok('fiche du grade : conditions et avantages du porteur', /20[   ]000 PK gagnés \+ 100 compagnons débloqués \+ 1 méga-évolution débloquée/.test(gs) && /100 scans disponibles par jour/.test(gs) && /Booster PK toutes les 6 h/.test(gs) && /Radar des boutiques Pokémon de France/.test(gs) && /Pokédex d’évolution/.test(gs));
await page.screenshot({ path: shot('grades-fiche-maitre.png'), fullPage: true });
await seed({ scanDay: DAY, scanN: 5 });
await go('start=scan');
ok('Recrue : 5 scans par jour, épuisés', /Tes 5 scans du jour sont utilisés\. Reviens demain, ou passe Chasseur pour 10 par jour/.test(await text('body')));

// 2. Collectionneur : 5 000 PK gagnés et 15 compagnons (4 offerts + 11 débloqués)
await seed({ pkEarned: 5000, pk: 2500, pkOwn: PAID.slice(0, 11), scanN: 0 });
await go('start=market');
ok('Collectionneur : booster et pièce toutes les 10 h', /1 offert toutes les 10 h/.test(await text('section[aria-label="Booster PK"]')) && /1 lancer toutes les 10 h/.test(await text('section[aria-label="Pile ou face"]')));
await toShop();
ok('Collectionneur : ticket achetable', (await page.locator('section[aria-label="Ticket · tirage au sort"] button:has-text("Acheter un ticket")').count()) === 1);
ok('emblème Collectionneur dans l’en-tête', (await page.locator('header img[src="img/grades/grade-3.svg"]').count()) > 0);

// 3. Méga-évolution avec des PA, dans le Pokédex (2026-10-28) : route d'évolution de la famille, méga au bout
// (Reptincel et Dracaufeu sont déjà dans PAID.slice(0, 11) ; starter Salamèche au dernier stade).
await seed({ pa: 3000, pkOwn: PAID.slice(0, 11), gradeSeen: 2, evo: { line: 'sala', stage: 2 }, buddy: 6 });
await go('start=market');
const dex = page.locator('section[aria-label="Pokédex"]'), route = dex.locator('div[aria-label="Route d’évolution"]');
const megaNodes = route.locator('button[aria-label*="méga-évolution"]');
ok('route de Dracaufeu : 2 méga-évolutions au bout, en silhouette', (await megaNodes.count()) === 2 && (await route.locator('button.pkm-dex-lock[aria-label*="méga-évolution"]').count()) === 2);
await route.locator('button[aria-label^="Méga-Dracaufeu X"]').click(); await page.waitForTimeout(200);
const act = dex.locator('section[aria-label="Fiche du Pokémon"] .pkm-dex-act-btn');
ok('fiche : « ' + (await act.innerText()) + ' »', /Méga-évoluer · 2\s?500 PA/.test(await act.innerText()));
await act.click(); await page.waitForTimeout(200);
const ask = await text('section[aria-label="Fiche du Pokémon"] .pkm-dex-ask');
ok('confirmation : « ' + ask + ' »', /Faire méga-évoluer Dracaufeu en Méga-Dracaufeu X pour 2\s?500 PA/.test(ask));
await dex.locator('section[aria-label="Fiche du Pokémon"] .pkm-dex-yes-btn').click(); await page.waitForTimeout(3800);
const st2 = await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); return { megas: d.megas, buddy: d.buddy, pa: d.pa }; }, KEY);
ok('Méga-Dracaufeu X débloquée et compagnon (' + JSON.stringify(st2) + ')', (st2.megas || []).indexOf(10034) >= 0 && st2.buddy === 10034 && st2.pa === 500);
ok('fiche après méga-évolution : « ' + (await act.innerText()) + ' »', /C’est ton compagnon/.test(await act.innerText()));
await dex.screenshot({ path: shot('grades-mega.png') });
await go('start=home');
ok('compagnon de l’accueil : Méga-Dracaufeu X', (await page.locator('button[aria-label^="Compagnon : Méga-Dracaufeu X"]').count()) === 1);

// 4. Maître Pokémon : 20 000 PK, 100 compagnons, 1 méga-évolution → Radar ouvert, 100 scans
await seed({ pkEarned: 20000, pkOwn: PAID.slice(0, 96) });
await go('start=radar');
ok('Maître Pokémon : carte de France ouverte', (await page.locator('#pkm-radar-map').count()) === 1 && (await page.locator('section[aria-label="Grade Maître Pokémon"]').count()) === 0);
await go('start=market');
ok('Maître Pokémon : booster toutes les 6 h', /1 offert toutes les 6 h/.test(await text('section[aria-label="Booster PK"]')));
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
