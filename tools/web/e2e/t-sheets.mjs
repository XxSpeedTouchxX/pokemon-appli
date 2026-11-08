// Demandes du porteur du 2026-11-08 : fenêtres d'infos qui montent du bas et redescendent (comme « Mon Pokédex »),
// règles des PK et PA (petit booster, tickets dans la ligne du PK shop, tableau des grades agrandi avec « Grade
// actuel »), réglage « Sons ».
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => window.__pkm.tab('pkshop')); await page.waitForTimeout(800);
// 1. Règles des PK et PA : montée du bas.
await page.locator('button:has-text("Règles des PK et PA")').first().click(); await page.waitForTimeout(120);
const tUp = await page.evaluate(() => getComputedStyle(document.querySelector('section[aria-label="Informations légales"]')).transform);
ok('règles : la fenêtre monte du bas (en cours : ' + tUp + ')', tUp !== 'none' && tUp !== 'matrix(1, 0, 0, 1, 0, 0)');
await page.waitForTimeout(600);
const rules = page.locator('section[aria-label="Informations légales"]');
ok('règles : petit booster devant « Booster PK » (plus de cadeau)', (await rules.locator('section[aria-label="Booster PK"] h3 .pkm-rules-pack').count()) === 1 && !/🎁/.test(await rules.innerText()));
ok('règles : 3 tickets Bronze, Argent, Or dans la ligne du PK shop', (await rules.locator('.pkm-rules-shop .pkm-shop-t-bronze').count()) === 1 && (await rules.locator('.pkm-rules-shop .pkm-shop-t-argent').count()) === 1 && (await rules.locator('.pkm-rules-shop .pkm-shop-t-or').count()) === 1);
const me = rules.locator('.pkm-rules-me');
ok('règles : « Grade actuel » dans l’encadré jaune du grade', (await me.count()) === 1 && /Grade actuel/i.test(await me.innerText()) && (await rules.locator('.pkm-rules-nowtag').count()) === 1);
const rowH = await rules.locator('.pkm-rules-row:not(.pkm-rules-th)').first().evaluate(e => e.getBoundingClientRect().height);
ok('règles : lignes des grades agrandies (' + Math.round(rowH) + ' px)', rowH >= 52);
await rules.locator('section[aria-label="Délais selon le grade"]').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('sheets-regles-grades.png') });
await rules.locator('section[aria-label="PK shop"]').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('sheets-regles-shop.png') });
// 2. Fermeture glissée vers le bas.
await rules.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(150);
const tDown = await page.evaluate(() => { const e = document.querySelector('section[aria-label="Informations légales"]'); return e ? getComputedStyle(e).transform : 'absent'; });
ok('règles : la fenêtre redescend avant de se fermer (' + tDown + ')', /^matrix\(1, 0, 0, 1, 0, [1-9]/.test(tDown));
await page.waitForTimeout(500);
ok('règles : fermée ensuite', (await rules.count()) === 0);
// 3. Mes PK : voile touché, glissement puis fermeture.
await page.evaluate(() => window.__pkm.setState({ pkSheet: true })); await page.waitForTimeout(700);
await page.locator('button[aria-label="Fermer Mes PK"]').click({ position: { x: 20, y: 20 } }); await page.waitForTimeout(150);
const tPk = await page.evaluate(() => { const e = document.querySelector('section[aria-label="Mes PK"]'); return e ? getComputedStyle(e).transform : 'absent'; });
ok('Mes PK : redescend en touchant le voile (' + tPk + ')', /^matrix\(1, 0, 0, 1, 0, [1-9]/.test(tPk));
await page.waitForTimeout(500);
ok('Mes PK : fermée ensuite', (await page.locator('section[aria-label="Mes PK"]').count()) === 0);
// 4. Réglages › Sons.
await page.goto(E2E + '/?start=settings&debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
const snd = page.locator('section[aria-label="Sons"]');
ok('Réglages : rubrique « Sons » (Activés / Coupés)', (await snd.locator('button:has-text("Activés")').count()) === 1 && (await snd.locator('button:has-text("Coupés")').count()) === 1);
await snd.locator('button:has-text("Coupés")').click(); await page.waitForTimeout(200);
ok('Sons coupés : réglage gardé (même clé que le didacticiel)', await page.evaluate(() => localStorage.getItem('pkm-tuto-sound') === 'off'));
await snd.locator('button:has-text("Activés")').click(); await page.waitForTimeout(200);
ok('Sons rallumés', await page.evaluate(() => localStorage.getItem('pkm-tuto-sound') === 'on'));
// 5. Fiche d'un grade : « Nouveau » en bas, glissement entre les grades.
await page.goto(E2E + '/?start=tiers&debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.evaluate(() => window.__pkm.push('grade', { gradeIx: 3 })); await page.waitForTimeout(900);
const order = await page.locator('section[aria-label="Avantages du grade"] li').evaluateAll(ls => ls.map(l => !!l.querySelector('.pkm-gr-new')));
ok('grade : avantages identiques en haut, « Nouveau » en bas (' + order.map(n => n ? 'N' : '·').join('') + ')', order.some(Boolean) && order.indexOf(true) === order.length - order.filter(Boolean).length);
await page.locator('button:has-text("Grade suivant")').click(); await page.waitForTimeout(140);
const slideF = await page.evaluate(() => { const m = document.querySelector('#app main'); return m ? getComputedStyle(m).transform : ''; });
ok('« Grade suivant » : le grade arrive de la droite (' + slideF + ')', /^matrix\(1, 0, 0, 1, [1-9]/.test(slideF));
await page.screenshot({ path: shot('sheets-grade-glisse.png') });
await page.waitForTimeout(600);
ok('« Grade suivant » : Maître Pokémon affiché', /Maître Pokémon/.test(await page.locator('#app main').innerText()));
await page.locator('button:has-text("Grade précédent")').click(); await page.waitForTimeout(140);
const slideB = await page.evaluate(() => { const m = document.querySelector('#app main'); return m ? getComputedStyle(m).transform : ''; });
ok('« Grade précédent » : le grade revient de la gauche (' + slideB + ')', /^matrix\(1, 0, 0, 1, -[1-9]/.test(slideB));
await page.waitForTimeout(600);
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
