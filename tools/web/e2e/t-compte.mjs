// Mon profil et grades (2026-10-16, porteur) : « Grade actuel » (emblème mis en avant, avantages) à la place de « Type
// de collectionneur » ; « Palier » devient « Grade » ; « Information sur les grades » (ex « Paliers et succès ») sans
// succès, grades cliquables vers leur fiche (emblème, condition, avantages) ; conditions par PK gagnés, compagnons et
// méga-évolutions (2026-10-28) ;
// animation de passage de grade.
// Le vrai grade est gardé (pas de grade forcé, voir helpers.mjs).
process.env.E2E_GRADE = '0';
const { withFonts, launch, BASE: E2E, shot } = await import('./helpers.mjs');
const BASE = E2E + '/?today=2026-10-09';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
let page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const KEY = 'pkm-collection-v1';
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('header button[aria-label*="rofil"]'); await page.waitForTimeout(700);
const id = page.locator('section[aria-label="Identité"]');
const lines = (await id.locator('span > span').allInnerTexts()).map(t => t.trim()).filter(Boolean);
ok('identité : ' + lines.join(' | '), /^Grade Recrue · \d+ % vers Chasseur$/.test(lines[1]) && lines[2] === 'Membre depuis octobre 2026');
ok('plus de « Type de collectionneur »', (await page.locator('section[aria-label="Type de collectionneur"]').count()) === 0 && (await page.locator('section[aria-label="Ce qui fixe ton profil"]').count()) === 0);
const gnow = page.locator('section[aria-label="Grade actuel"]');
const gtxt = (await gnow.innerText()).replace(/\s+/g, ' ');
ok('« Grade actuel » : emblème, nom, progression, avantages : « ' + gtxt.slice(0, 120) + ' »', (await gnow.locator('img[src="img/grades/grade-1.svg"]').count()) === 1 && /Recrue/.test(gtxt) && /Encore 1[   ]?400 PK pour Chasseur/.test(gtxt) && (await gnow.locator('li').count()) >= 3);
await page.screenshot({ path: shot('compte-grade.png'), fullPage: true });
await gnow.locator('button:has-text("Information sur les grades")').click(); await page.waitForTimeout(800);
ok('titre « Information sur les grades »', /Information sur les grades/.test(await page.locator('header').innerText()));
ok('succès retirés', (await page.locator('section[aria-label="Succès"]').count()) === 0 && (await page.locator('section[aria-label="Série en cours"]').count()) === 0);
const rows = page.locator('button[aria-label^="Voir le grade"]');
const rtxt = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
ok('6 grades cliquables avec leurs conditions', (await rows.count()) === 6 && /Dès l’inscription/.test(rtxt) && /1[   ]500 PK gagnés/.test(rtxt) && /10[   ]000 PK gagnés \+ 30 compagnons débloqués/.test(rtxt) && /50[   ]000 PK gagnés \+ 151 compagnons débloqués \+ 5 méga-évolutions débloquées/.test(rtxt));
await page.screenshot({ path: shot('grades-liste.png'), fullPage: true });
await page.click('button[aria-label="Voir le grade Maître Pokémon et ses avantages"]'); await page.waitForTimeout(800);
const gs = page.locator('section[aria-label="Grade Maître Pokémon"]');
ok('fiche du grade : emblème, condition, état', (await gs.locator('img[src="img/grades/grade-5.svg"]').count()) === 1 && /20[   ]000 PK gagnés \+ 100 compagnons débloqués \+ 1 méga-évolution débloquée/.test(await gs.innerText()) && /À débloquer/.test(await gs.innerText()));
ok('fiche du grade : avantages listés', (await page.locator('section[aria-label="Avantages du grade"] li').count()) >= 3);
await page.screenshot({ path: shot('grade-fiche.png') });
await page.click('button:has-text("Grade suivant")'); await page.waitForTimeout(500);
ok('grade suivant : Grand maître mondial Pokémon', (await page.locator('section[aria-label="Grade Grand maître mondial Pokémon"]').count()) === 1);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(600);
ok('retour : Information sur les grades', /Information sur les grades/.test(await page.locator('header').innerText()));
// Passage de grade : 1 500 PK gagnés → Chasseur, animation.
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k)); d.pkEarned = 1495; d.gradeSeen = 0; d.games = {}; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.close(); page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE + '&start=market', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(3200);
ok('animation de passage de grade : « Nouveau grade Chasseur »', (await page.locator('.pkm-gu').count()) === 1 && /Chasseur/.test(await page.locator('.pkm-gu-name').innerText()));
await page.screenshot({ path: shot('grade-passage.png') });
await page.waitForTimeout(1500);
await page.click('.pkm-gu-go'); await page.waitForTimeout(400);
const d = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
ok('« Continuer » ferme l’animation ; grade vu : ' + d.gradeSeen + ', PK gagnés : ' + d.pkEarned, (await page.locator('.pkm-gu').count()) === 0 && d.gradeSeen === 1 && d.pkEarned >= 1500);
// Une dépense ne fait pas redescendre.
await page.evaluate(k => { const x = JSON.parse(localStorage.getItem(k)); x.pk = 0; localStorage.setItem(k, JSON.stringify(x)); }, KEY);
await page.close(); page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE + '&start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('solde à 0 : toujours Chasseur', /Chasseur/.test(await page.locator('section[aria-label="Grade actuel"]').innerText()));
ok('360 : pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
