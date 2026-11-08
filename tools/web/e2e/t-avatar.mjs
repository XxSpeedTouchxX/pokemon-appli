// « Mon avatar » (2026-11-08, porteur, d'après sa vidéo) : photo retirée de Mon profil ; éditeur avec aperçu, Aléatoire,
// 5 rubriques (Préféré, Visage, Cheveux, Style, Décor), styles PRO (Premium ou PA), choix du Pokémon parmi ceux
// débloqués, placement et taille, enregistrement : l'avatar remplace l'illustration dans l'en-tête.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?start=profile&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('Mon profil : plus de choix de photo dans la photothèque', (await page.locator('#pkm-pf-photo').count()) === 0 && (await page.locator('button:has-text("Retirer ma photo")').count()) === 0);
const bubble = page.locator('button.pkm-pf-photo');
ok('Mon profil : la bulle de l’avatar ouvre « Modifier mon avatar »', (await bubble.getAttribute('aria-label')) === 'Modifier mon avatar');
await bubble.click(); await page.waitForTimeout(900);
ok('écran « Mon avatar » : aperçu et 5 rubriques', (await page.locator('.pkm-av-prev').count()) === 1 && (await page.locator('.pkm-av-tab').allInnerTexts()).join('|') === 'Préféré|Visage|Cheveux|Style|Décor');
ok('Préféré : Pokémon préféré, coup de cœur PRO, placement (6) et taille', (await page.locator('.pkm-av-slot').count()) === 2 && (await page.locator('.pkm-av-chips button').count()) === 6 && (await page.locator('input.pkm-av-range').count()) === 1);
await page.screenshot({ path: shot('avatar-prefere.png') });
// Placement et taille.
await page.locator('.pkm-av-chips button:has-text("Sur l’épaule")').click(); await page.waitForTimeout(200);
await page.locator('input.pkm-av-range').evaluate(e => { e.value = '130'; e.dispatchEvent(new Event('input', { bubbles: true })); }); await page.waitForTimeout(200);
ok('placement « Sur l’épaule » et taille 130 %', /130 %/.test(await page.locator('.pkm-av-size').innerText()) && (await page.locator('.pkm-av-chips button[aria-pressed="true"]').innerText()) === 'Sur l’épaule');
// Choix du Pokémon : seulement les Pokémon débloqués.
await page.locator('button.pkm-av-btn:has-text("Changer de Pokémon")').click(); await page.waitForTimeout(700);
const nPk = await page.locator('.pkm-av-pk').count(), nOwn = await page.evaluate(() => { const s = window.__pkm.st(); return (s.pkOwn || []).length; });
ok('choix du Pokémon : ' + nPk + ' Pokémon débloqués proposés', nPk > 0 && nPk <= 171);
await page.screenshot({ path: shot('avatar-choix-pokemon.png') });
await page.locator('.pkm-av-pk').nth(Math.min(1, nPk - 1)).click(); await page.waitForTimeout(500);
// Visage, Cheveux, Style, Décor.
for (const [tab, name] of [['Visage', 'visage'], ['Cheveux', 'cheveux'], ['Style', 'style'], ['Décor', 'decor']]) {
  await page.locator('.pkm-av-tab:has-text("' + tab + '")').click(); await page.waitForTimeout(400);
  await page.screenshot({ path: shot('avatar-' + name + '.png') });
}
ok('Décor : 11 fonds, dont 4 PRO avec leur prix en PA', (await page.locator('section[aria-label="Décor"] .pkm-av-opt').count()) === 11 && (await page.locator('section[aria-label="Décor"] .pkm-av-pro').count()) === 4 && /150 PA/.test(await page.locator('section[aria-label="Décor"] .pkm-av-pro').first().innerText()));
// Style PRO essayé puis enregistrement : fenêtre de déblocage.
await page.locator('section[aria-label="Décor"] button[aria-label^="Holo"]').evaluate(e => e.click()); // le bouton « Enregistrer » collé en bas couvre la dernière ligne pour Playwright await page.waitForTimeout(300);
ok('style PRO essayé : bandeau « Essai »', /Essai : 1 style PRO/.test(await page.locator('.pkm-av-trial').innerText()));
await page.locator('button.pkm-av-savebtn').click(); await page.waitForTimeout(700);
const lk = page.locator('section.pkm-av-locksh');
ok('enregistrer : fenêtre « Holo » (PA ou Premium)', (await lk.count()) === 1 && /Holo/.test(await lk.innerText()) && /Débloquer pour 150 PA/.test(await lk.innerText()) && /Tout ouvrir avec Premium/.test(await lk.innerText()));
await page.screenshot({ path: shot('avatar-pro.png') });
// Assez de PA (sur l'appareil) : déblocage.
await page.evaluate(() => window.__pkm.setState({ pa: 500 })); await page.waitForTimeout(200);
await lk.locator('button.pkm-av-buy').click(); await page.waitForTimeout(700);
ok('Holo débloqué pour 150 PA (500 → 350)', await page.evaluate(() => { const s = window.__pkm.st(); return s.pa === 350 && (s.avOwned || []).indexOf('bg:holo') >= 0; }));
await page.waitForTimeout(500);
await page.locator('button.pkm-av-savebtn').click(); await page.waitForTimeout(1500);
const saved = await page.evaluate(() => { const s = window.__pkm.st(); return { cfg: s.avatarCfg, png: (s.avatarPng || '').slice(0, 23), screen: s.screen }; });
ok('avatar enregistré (image JPEG) et retour à Mon profil', saved.cfg && saved.cfg.bg === 'holo' && saved.cfg.pos === 'shoulder' && saved.png === 'data:image/jpeg;base64,' && saved.screen === 'profile');
ok('en-tête et profil : l’avatar remplace l’illustration', (await page.locator('button.pkm-pf-photo img').first().getAttribute('src')).startsWith('data:image/jpeg'));
await page.screenshot({ path: shot('avatar-profil.png') });
// Premium : tous les styles PRO ouverts.
await page.evaluate(() => window.__pkm.avOpen()); await page.waitForTimeout(800);
await page.evaluate(() => { window.__pkm.premOn = () => true; window.__pkm.setState({ avTab: 'hair' }); }); await page.waitForTimeout(400);
ok('Premium : coiffures PRO ouvertes (badge vert)', (await page.locator('section[aria-label="Cheveux"] .pkm-av-pro-ok').count()) >= 4);
// Aléatoire.
const before = await page.evaluate(() => JSON.stringify(window.__pkm.st().avDraft));
await page.locator('.pkm-av-side-b:has-text("Aléatoire")').click(); await page.waitForTimeout(300);
ok('« Aléatoire » change l’avatar', before !== await page.evaluate(() => JSON.stringify(window.__pkm.st().avDraft)));
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
