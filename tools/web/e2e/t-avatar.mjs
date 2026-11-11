// « Mon avatar » (2026-11-08, porteur ; v2 du 2026-11-10 : 2 lignes, accessoires, shiny, Pokémon à glisser ; v3 du
// 2026-11-10 au soir : bouton « Enregistrer » figé en bas, avatar de départ cheveux noirs en pics sur fond jaune,
// Pokémon d'avatar à part du Pokédex débloqués avec des PA (25, 50, 100, légendaires 300, Kyogre, Groudon, Rayquaza
// 500), shiny au double du prix, plus de coup de cœur, accessoire sur le Pokémon ou sur moi et sans limite de taille,
// cadres animés, avatar dans la bulle du profil et l'en-tête).
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
ok('sans avatar enregistré : l’avatar de départ est déjà dans la bulle du profil', /^data:image\/svg\+xml/.test(await bubble.locator('img').first().getAttribute('src')));
await bubble.click(); await page.waitForTimeout(900);
const st = () => page.evaluate(() => window.__pkm.st());
const d0 = (await st()).avDraft;
ok('avatar de départ : cheveux noirs en pics, fond jaune, sans Pokémon', d0.hair === 'pics' && d0.hc === 'noir' && d0.bg === 'jaune' && d0.poke === 0);
const rowTexts = async l => (await page.locator('[role=tablist][aria-label="' + l + '"] button').allInnerTexts()).map(t => t.trim()).join('|');
ok('2 lignes : « Ton avatar » (Cheveux, Visage, Style, Décor), « Ton Pokémon » (Pokémon, Accessoire, Shiny)', await rowTexts('Ton avatar') === 'Cheveux|Visage|Style|Décor' && await rowTexts('Ton Pokémon') === 'Pokémon|Accessoire|Shiny');
// Bouton « Enregistrer mon avatar » figé en bas, au-dessus de la barre.
const bar = page.locator('.pkm-av-savebar');
const y1 = (await bar.boundingBox()).y;
await page.locator('.pkm-av-panel').evaluate(e => e.scrollIntoView({ block: 'end' })); await page.waitForTimeout(300);
const b2 = await bar.boundingBox();
ok('« Enregistrer mon avatar » figé en bas pendant le défilement (y ' + Math.round(y1) + ' puis ' + Math.round(b2.y) + ')', (await bar.evaluate(e => getComputedStyle(e).position)) === 'fixed' && Math.abs(b2.y - y1) < 1 && b2.y + b2.height < 844);
// Pokémon d'avatar : à débloquer avec des PA, à part du Pokédex.
await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Pokémon")').click(); await page.waitForTimeout(300);
ok('Pokémon : plus de « coup de cœur », bouton « Choisir mon Pokémon »', (await page.locator('text=Coup de cœur').count()) === 0 && (await page.locator('button:has-text("Choisir mon Pokémon")').count()) === 1);
await page.locator('button:has-text("Choisir mon Pokémon")').click(); await page.waitForTimeout(700);
const price = async n => (await page.locator('.pkm-av-pk:has(img[src$="/' + n + '.png"]) small').first().innerText()).trim();
ok('171 Pokémon d’avatar avec leur prix en PA', (await page.locator('.pkm-av-pk').count()) === 171);
ok('prix : Pikachu 25, Raichu 50, Dracaufeu 100, Mewtwo 300, Groudon 500 PA', await price(25) === '25 PA' && await price(26) === '50 PA' && await price(6) === '100 PA' && await price(150) === '300 PA' && await price(383) === '500 PA');
await page.screenshot({ path: shot('avatar-choix-pokemon.png') });
await page.locator('.pkm-av-pk:has(img[src$="/25.png"])').first().click(); await page.waitForTimeout(500);
ok('Pikachu essayé : « Débloquer Pikachu · 25 PA » et sa version shiny à 50 PA', (await page.locator('button.pkm-av-buy:has-text("Débloquer Pikachu · 25 PA")').count()) === 1 && /50 PA/.test(await page.locator('.pkm-av-slot-sh').innerText()));
await page.screenshot({ path: shot('avatar-pokemon.png') });
// Glisser le Pokémon dans l'aperçu.
await page.locator('.pkm-av-top').scrollIntoViewIfNeeded();
const pkb = await page.locator('.pkm-av-pk-main').boundingBox();
await page.mouse.move(pkb.x + pkb.width / 2, pkb.y + pkb.height / 2); await page.mouse.down(); await page.mouse.move(pkb.x - 100, pkb.y - 120, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
const moved = (await st()).avDraft;
ok('Pokémon glissé du doigt : nouvelle place (' + moved.px + ' %, ' + moved.py + ' %)', moved.px != null && moved.px < 60 && moved.py < 60);
// Accessoire : sur moi ou sur le Pokémon, taille sans limite.
await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Accessoire")').click(); await page.waitForTimeout(300);
ok('Accessoire : 7 choix, 4 PRO, « Sur mon Pokémon » ou « Sur moi »', (await page.locator('section[aria-label="Accessoire"] .pkm-av-opt').count()) === 7 && (await page.locator('section[aria-label="Accessoire"] .pkm-av-pro').count()) === 4 && (await page.locator('section[aria-label="Accessoire"] button:has-text("Sur moi")').count()) === 1);
await page.locator('section[aria-label="Accessoire"] button[aria-label^="Casquette"]').click(); await page.waitForTimeout(300);
await page.locator('section[aria-label="Accessoire"] button:has-text("Sur moi")').click(); await page.waitForTimeout(300);
for (let i = 0; i < 12; i++) await page.locator('button[aria-label="Grossir l’accessoire"]').evaluate(e => e.click());
await page.waitForTimeout(300);
let a1 = (await st()).avDraft;
ok('casquette sur moi, grossie au-delà de 500 % (' + a1.asz + ' %)', a1.aon === 'perso' && a1.acc === 'casquette' && a1.asz > 500 && (await page.locator('.pkm-av-prev img.pkm-av-acc').count()) === 1);
await page.locator('.pkm-av-top').scrollIntoViewIfNeeded();
const pb = await page.locator('.pkm-av-prev').boundingBox();
await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await page.mouse.wheel(0, 400); await page.waitForTimeout(400);
const a2 = (await st()).avDraft;
ok('molette (ou pincée) sur l’aperçu : l’accessoire rapetisse (' + a1.asz + ' → ' + a2.asz + ' %)', a2.asz < a1.asz);
await page.screenshot({ path: shot('avatar-accessoire.png') });
// Shiny.
await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Shiny")').click(); await page.waitForTimeout(300);
await page.locator('button[aria-label^="Version shiny"]').click(); await page.waitForTimeout(300);
ok('Shiny choisi : sprite chromatique dans l’aperçu', /img\/pokemon\/shiny\//.test(await page.locator('.pkm-av-pk-main').getAttribute('src')));
// Décor : fonds et cadres animés.
await page.locator('.pkm-av-tab:has-text("Décor")').click(); await page.waitForTimeout(400);
ok('Décor : 11 fonds et 13 cadres animés (11 PRO)', (await page.locator('section[aria-label="Décor"] .pkm-av-opt:not(.pkm-av-fropt)').count()) === 11 && (await page.locator('.pkm-av-fropt').count()) === 13 && (await page.locator('.pkm-av-fropt .pkm-av-pro').count()) === 11);
await page.locator('.pkm-av-fropt[aria-label^="Lave"]').evaluate(e => e.click()); await page.waitForTimeout(400);
ok('cadre « Lave volcanique » autour de l’aperçu', (await page.locator('.pkm-av-frwrap.pkm-fr-lave').count()) === 1);
await page.screenshot({ path: shot('avatar-decor.png') });
ok('essai : 3 éléments à débloquer (cadre, Pikachu, shiny)', /Essai : 3 éléments/.test(await page.locator('.pkm-av-trial').innerText()));
// Enregistrer : chaque élément à débloquer s'ouvre à tour de rôle ; un Pokémon ne s'ouvre pas avec Premium.
await page.evaluate(() => window.__pkm.setState({ pa: 1000 })); await page.waitForTimeout(200);
const lk = page.locator('section.pkm-av-locksh'), seen = [];
for (let i = 0; i < 4; i++) {
  await page.locator('.pkm-av-savebar button.pkm-av-savebtn').click(); await page.waitForTimeout(700);
  if (!(await lk.count())) break;
  const t = await lk.innerText(); seen.push(t);
  if (i === 1) await page.screenshot({ path: shot('avatar-debloquer.png') });
  await lk.locator('button.pkm-av-buy').click(); await page.waitForTimeout(700);
}
const s1 = await st();
ok('fenêtres : cadre (250 PA, Premium possible), Pikachu (25 PA, sans Premium), shiny (50 PA)', seen.length === 3 && /250 PA/.test(seen[0]) && /Tout ouvrir avec Premium/.test(seen[0]) && /Pikachu/.test(seen[1]) && /25 PA/.test(seen[1]) && !/Premium/.test(seen[1]) && /50 PA/.test(seen[2]));
ok('PA débités : 1 000 → 675', s1.pa === 675 && ['frame:lave', 'poke:25', 'shiny:25'].every(x => (s1.avOwned || []).indexOf(x) >= 0));
await page.waitForTimeout(1200);
const saved = await st();
ok('avatar enregistré (image JPEG) et retour à Mon profil', saved.avatarCfg && saved.avatarCfg.frame === 'lave' && saved.avatarCfg.poke === 25 && saved.avatarCfg.shiny === true && /^data:image\/jpeg/.test(saved.avatarPng || '') && saved.screen === 'profile');
ok('bulle du profil : l’avatar et son cadre de lave', (await page.locator('button.pkm-pf-photo.pkm-fr-lave img').first().getAttribute('src')).startsWith('data:image/jpeg'));
await page.screenshot({ path: shot('avatar-profil.png') });
await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(900);
ok('en-tête de l’accueil : l’avatar et son cadre de lave', (await page.locator('button.pkm-hh-me.pkm-fr-lave img').first().getAttribute('src')).startsWith('data:image/jpeg'));
await page.screenshot({ path: shot('avatar-entete.png') });
// Premium : styles PRO ouverts, Pokémon d'avatar toujours à débloquer.
await page.evaluate(() => window.__pkm.avOpen()); await page.waitForTimeout(800);
await page.evaluate(() => { window.__pkm.premOn = () => true; window.__pkm.setState({ avTab: 'hair' }); }); await page.waitForTimeout(400);
ok('Premium : coiffures PRO ouvertes (badge vert)', (await page.locator('section[aria-label="Cheveux"] .pkm-av-pro-ok').count()) >= 4);
await page.evaluate(() => window.__pkm.setState({ avPick: 1 })); await page.waitForTimeout(500);
ok('Premium : les Pokémon d’avatar gardent leur prix (Dracaufeu 100 PA), Pikachu « Débloqué »', await price(6) === '100 PA' && await price(25) === 'Débloqué');
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
