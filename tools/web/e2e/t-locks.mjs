// Demandes du porteur du 2026-11-07 : Radar réservé au grade Maître Pokémon (badge rouge « Déverrouillé au grade … »
// avec cadenas, fenêtre « Tu ne peux pas accéder au Radar… », bouton « Découvrir Premium »), nouvelles conditions des
// grades, Pokédex sur 171 (méga-évolutions comprises), « Nouveau thème » qui ne cache plus le numéro, liste « Mon
// Pokédex » qui monte du bas et redescend à la fermeture, scanner animé dans la barre, compte à rebours des tickets,
// confettis (200 PK) et feu d'artifice (500 PK) au Booster PK.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
// Tirage toujours au plus haut : le Booster PK donne 500 PK (feu d'artifice).
await ctx.addInitScript(() => { const g = crypto.getRandomValues.bind(crypto); crypto.getRandomValues = a => { if (a instanceof Uint32Array && a.length === 1 && window.__hiRand) { a[0] = 4294967000; return a; } return g(a); }; });
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
// 1. Radar verrouillé au grade Recrue.
const card = page.locator('section[aria-label="Boutiques près de toi"] button').first();
ok('accueil : badge « Déverrouillé au grade Maître Pokémon » avec cadenas', /Déverrouillé au grade Maître Pokémon/.test(await card.innerText()) && (await card.locator('.pkm-lock-pad').count()) === 1);
await card.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('locks-radar-badge.png') });
await page.evaluate(() => window.__pkm.openRadar()); await page.waitForTimeout(500);
const lw = page.locator('section[aria-label="Grade requis"]');
const lwt = await lw.innerText().catch(() => '');
ok('fenêtre : « Tu ne peux pas accéder au Radar tant que tu n’as pas atteint le grade « Maître Pokémon » »', /Tu ne peux pas accéder au Radar tant que tu n’as pas atteint le grade « Maître Pokémon »/.test(lwt));
ok('fenêtre : Premium proposé, bouton « Découvrir Premium »', /abonnement Premium/.test(lwt) && (await lw.locator('button:has-text("Découvrir Premium")').count()) === 1);
ok('fenêtre : condition 30 000 PK + 100 compagnons + 5 méga-évolutions', /30\s000 PK gagnés \+ 100 compagnons débloqués \+ 5 méga-évolutions débloquées/.test(lwt.replace(/[  ]/g, ' ')));
await page.screenshot({ path: shot('locks-radar-fenetre.png') });
await lw.locator('button:has-text("Découvrir Premium")').click(); await page.waitForTimeout(800);
ok('« Découvrir Premium » ouvre l’offre Premium', (await page.locator('section[aria-label="Dropicards Premium"]').count()) === 1 && (await lw.count()) === 0);
// 2. Grades.
const tiers = await page.evaluate(() => window.__pkm.tiers().map(t => t.cond));
ok('conditions des grades : ' + tiers.slice(2).join(' | '), /7.500 PK gagnés \+ 30 compagnons/.test(tiers[2]) && /15.000 PK gagnés \+ 50 compagnons/.test(tiers[3]) && /30.000 PK gagnés \+ 100 compagnons débloqués \+ 5 méga-évolutions débloquées/.test(tiers[4]) && /100.000 PK gagnés \+ tout le Pokédex débloqué \(171 Pokémon\)/.test(tiers[5]));
// 3. Barre du bas : scanner animé.
ok('bouton du scan : scanner animé (laser) à la place de l’appareil photo', (await page.locator('button[aria-label="Scanner une carte ou un produit"] svg.pkm-navscan .pkm-prem-scan-laser').count()) === 1);
// 4. Pokédex : 171, liste qui monte, Nouveau thème sous le prix, fermeture glissée.
await page.goto(E2E + '/?start=market&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('button[aria-label="Choisir Carapuce comme starter"]'); await page.waitForTimeout(600);
ok('Pokédex : compteur sur 171', / \/ 171/.test(await page.locator('section[aria-label="Pokédex"]').innerText()));
ok('plus de « Gratuit, sans achat… » dans Jeux', !/Gratuit, sans achat/.test(await page.locator('body').innerText()));
await page.click('.pkm-dex-all'); await page.waitForTimeout(150);
const midT = await page.evaluate(() => getComputedStyle(document.querySelector('.pkm-dexl')).transform);
ok('« Mon Pokédex » arrive du bas (en cours : ' + midT + ')', midT !== 'none' && midT !== 'matrix(1, 0, 0, 1, 0, 0)');
await page.waitForTimeout(600);
ok('liste : « débloqués » sur 171', / \/ 171 débloqués/.test(await page.locator('section[aria-label="Mon Pokédex"]').innerText()));
ok('liste : les 15 méga-évolutions incluses (171 cases)', (await page.locator('[aria-label="Tous les Pokémon"] > button').count()) === 171);
const ky = page.locator('[aria-label="Tous les Pokémon"] > button[aria-label^="Kyogre"]');
await ky.scrollIntoViewIfNeeded();
const over = await ky.evaluate(b => { const n = b.querySelector('.pkm-dexl-no').getBoundingClientRect(), t = b.querySelector('.pkm-dex-newtheme').getBoundingClientRect(), p = b.querySelector('.pkm-dexl-price, .pkm-dexl-st').getBoundingClientRect(), r = b.getBoundingClientRect();
  return { hit: !(t.right <= n.left || t.left >= n.right || t.bottom <= n.top || t.top >= n.bottom), below: t.top >= p.bottom - 1, inside: t.bottom <= r.bottom + 0.5 }; });
ok('Kyogre : « Nouveau thème » sous le prix, ne cache plus le numéro ' + JSON.stringify(over), !over.hit && over.below && over.inside);
await page.screenshot({ path: shot('locks-dex-liste.png') });
await page.click('section[aria-label="Mon Pokédex"] button[aria-label="Fermer"]'); await page.waitForTimeout(150);
ok('fermeture : la liste descend avant de se fermer', (await page.locator('section[aria-label="Mon Pokédex"]').count()) === 1);
await page.waitForTimeout(600);
ok('fermeture : liste fermée', (await page.locator('section[aria-label="Mon Pokédex"]').count()) === 0);
// 5. Booster : 500 PK, confettis et feu d'artifice.
await page.evaluate(() => { window.__hiRand = true; });
await page.locator('section[aria-label="Booster PK"] button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(2600);
ok('booster à 500 PK : confettis et feu d’artifice', (await page.locator('.pkm-party .pkm-party-c').count()) > 50 && (await page.locator('.pkm-party .pkm-fw').count()) >= 5);
await page.screenshot({ path: shot('locks-booster-500.png') });
await page.evaluate(() => { window.__hiRand = false; });
// 6. Ticket : compte à rebours.
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(900);
await page.locator('button[aria-label^="Ticket Bronze"]').first().click(); await page.waitForTimeout(600);
const cd = page.locator('.pkm-tks-cd');
const s1 = await cd.locator('[data-u="s"]').innerText().catch(() => '');
ok('fiche du ticket : compte à rebours (jours, heures, min, s) et date du tirage', (await cd.count()) === 1 && /jours/.test(await cd.innerText()) && /Tirage le dimanche/.test(await cd.innerText()));
await page.waitForFunction(v => { const e = document.querySelector('.pkm-tks-cd [data-u="s"]'); return e && e.textContent !== v; }, s1, { timeout: 5000 }).catch(() => {});
const s2 = await cd.locator('[data-u="s"]').innerText().catch(() => '');
ok('les secondes défilent (' + s1 + ' → ' + s2 + ')', s1 !== s2);
await page.screenshot({ path: shot('locks-ticket-decompte.png') });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
