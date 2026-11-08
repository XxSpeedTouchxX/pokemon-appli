// « Ma progression » (2026-11-08, porteur) : bannière dans Jeux, saison et temps restant, carte du joueur (avatar,
// pseudo, emblème, PK de la saison et au total, place), podium du top 3, classement avec grades, ma ligne hors du
// top, lots de la saison. Le classement du serveur (season_board, 013_saisons.sql) est imité.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => window.__pkm.tab('market')); await page.waitForTimeout(700);
const ban = page.locator('button.pkm-pg-banner');
ok('Jeux : bannière « Ma progression · Saison 1 »', (await ban.count()) === 1 && /Ma progression/.test(await ban.innerText()) && /Saison 1/.test(await ban.innerText()));
ok('Pokédex : « Progression du Pokédex » (plus de doublon « Ma progression »)', (await page.locator('section[aria-label="Progression du Pokédex"]').count()) <= 1 && (await page.locator('section[aria-label="Ma progression"]').count()) === 0);
await ban.click(); await page.waitForTimeout(60);
const tIn = await page.evaluate(() => getComputedStyle(document.querySelector('#app main')).transform);
ok('ouverture : la page arrive de la droite (' + tIn + ')', /^matrix\(1, 0, 0, 1, [1-9]/.test(tIn));
ok('ouverture : saison, carte, classement et lots arrivent l’un après l’autre', await page.evaluate(() => ['.pkm-pg-season', '.pkm-pg-card', '.pkm-pg-board', '.pkm-pg-rewards'].map(q => parseFloat(getComputedStyle(document.querySelector(q)).animationDelay)).every((d, i, a) => d > 0 && (i === 0 || d > a[i - 1]))));
await page.screenshot({ path: shot('progress-entree.png') });
await page.waitForTimeout(700);
ok('page « Ma progression » ouverte', /Ma progression/.test(await page.locator('header').first().innerText().catch(() => '')) || (await page.locator('section.pkm-pg-card').count()) === 1);
const season = await page.locator('section.pkm-pg-season').innerText();
ok('saison : « Saison 1 », temps restant, 8 novembre au 6 janvier (' + season.replace(/\s+/g, ' ') + ')', /Saison 1/.test(season) && /Se termine dans \d+ j/.test(season) && /8 novembre au 6 janvier 2027/.test(season));
ok('sans serveur : carte sans place, invitation à se connecter', /Connecte-toi pour voir ta place/.test(await page.locator('section.pkm-pg-card').innerText()));
// Classement du serveur imité : 40 joueurs, moi 34ᵉ.
await page.evaluate(() => {
  const top = Array.from({ length: 30 }, (_, i) => ({ rank: i + 1, pseudo: ['SachaDuBourg', 'Ondine', 'PierreRoc', 'Flora', 'Régis'][i] || 'Dresseur' + (i + 1), grade: Math.max(0, 5 - Math.floor(i / 6)), pk: 52000 - i * 1500, me: false }));
  top[0].avatar = { skin: 's2', face: 'ovale', eyes: 'grands', hair: 'long', hc: 'roux', outfit: 'cape', bg: 'holo', pos: 'right', size: 100, poke: 25 };
  top[4].avatar = { skin: 's7', hair: 'pics', hc: 'noir', outfit: 'maillot', bg: 'nuit', pos: 'left', poke: 6 };
  window.__pkm.setState({ progBoard: { season: { n: 1, start: '2026-11-07T23:00:00Z', end: '2027-01-06T23:00:00Z' }, players: 40, top: top, me: { rank: 34, pk: 4200 }, pk_total: 12850, grade: 2 }, progAt: Date.now() });
});
await page.waitForTimeout(400);
const card = await page.locator('section.pkm-pg-card').innerText();
ok('carte : place #34 sur 40 joueurs, PK de la saison 4 200, au total 12 850', /#34/.test(card) && /sur 40 joueurs/.test(card) && /4\s200/.test(card) && /12\s850/.test(card));
ok('carte : emblème du grade Collectionneur et avatar', /Collectionneur/.test(card) && (await page.locator('section.pkm-pg-card img.pkm-pg-ava-g').count()) === 1);
ok('carte : « Encore 4 places pour le top 30 »', /Encore 4 places pour le top 30/.test(card));
await page.screenshot({ path: shot('progress-carte.png') });
const pods = await page.locator('.pkm-pg-pod').evaluateAll(ps => ps.map(p => p.className + '|' + p.querySelector('.pkm-pg-ppseudo').textContent));
ok('podium : 2ᵉ à gauche, 1ᵉʳ au centre (coupe), 3ᵉ à droite', pods.length === 3 && /pod-2/.test(pods[0]) && /pod-1\b/.test(pods[1]) && /SachaDuBourg/.test(pods[1]) && /pod-3/.test(pods[2]));
ok('podium : coupe et médailles dessinées', (await page.locator('.pkm-pg-pod img.pkm-pg-medal[src="img/rank/1.svg"]').count()) === 1 && (await page.locator('.pkm-pg-pod img.pkm-pg-medal[src="img/rank/3.svg"]').count()) === 1);
ok('avatars des joueurs : podium (1ᵉʳ) et liste (5ᵉ), emblème sinon', (await page.locator('.pkm-pg-pod-1 .pkm-pg-ava-pod').count()) === 1 && (await page.locator('ol.pkm-pg-list > li').nth(1).locator('.pkm-pg-ava-m').count()) === 1 && (await page.locator('ol.pkm-pg-list > li').nth(0).locator('.pkm-pg-ava-m').count()) === 0);
ok('classement : 4ᵉ à 30ᵉ avec le grade à côté du pseudo', (await page.locator('ol.pkm-pg-list > li').count()) === 27 && /Flora/.test(await page.locator('ol.pkm-pg-list > li').first().innerText()));
ok('ma ligne en bas (34ᵉ), en jaune', (await page.locator('section[aria-label="Classement général"] > .pkm-pg-me').count()) === 1 && /34/.test(await page.locator('section[aria-label="Classement général"] > .pkm-pg-me').innerText()));
await page.locator('section[aria-label="Classement général"]').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('progress-podium.png') });
const rw = await page.locator('section[aria-label="Lots de la saison"]').innerText();
ok('lots : top 10 (à définir), Premium de la 11ᵉ à la 30ᵉ place', /1ʳᵉ à 3ᵉ place/.test(rw) && /4ᵉ à 10ᵉ place/.test(rw) && /11ᵉ à 30ᵉ place/.test(rw) && /Premium offert/.test(rw) && /à définir/.test(rw));
await page.locator('section[aria-label="Lots de la saison"]').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('progress-lots.png') });
// Dans le top 10 : ma ligne dans la liste, message du lot.
await page.evaluate(() => { const b = window.__pkm.st().progBoard; b.top[6].me = true; b.me = { rank: 7, pk: b.top[6].pk }; window.__pkm.setState({ progBoard: Object.assign({}, b) }); });
await page.waitForTimeout(300);
ok('7ᵉ : « Dans le top 10 », ligne surlignée dans la liste, pas de ligne en plus', /Dans le top 10/.test(await page.locator('section.pkm-pg-card').innerText()) && (await page.locator('ol.pkm-pg-list > li.pkm-pg-me').count()) === 1 && (await page.locator('section[aria-label="Classement général"] > .pkm-pg-me').count()) === 0);
// Retour vers Jeux.
await page.evaluate(() => window.__pkm.pop()); await page.waitForTimeout(700);
ok('retour : onglet Jeux', (await page.locator('button.pkm-pg-banner').count()) === 1);
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
