// « Mon avatar » (2026-11-08, porteur ; v2 du 2026-11-10 : 2 lignes, accessoires, shiny, Pokémon à glisser ; v3 du
// 2026-11-10 au soir : bouton « Enregistrer » figé en bas, avatar de départ cheveux noirs en pics sur fond jaune,
// Pokémon d'avatar à part du Pokédex débloqués avec des PA (25, 50, 100, légendaires 300, Kyogre, Groudon, Rayquaza
// 500), shiny au double du prix, plus de coup de cœur, accessoire sur le Pokémon ou sur moi et sans limite de taille,
// cadres animés, avatar dans la bulle du profil et l'en-tête ; v4 du 2026-11-11 : écran en 3 parties 45/45/10, grille des
// 171 Pokémon, Premium ouvre tout, taille et rotation libres, « Place » retirée, avatar en rectangle arrondi).
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
// Écran en 3 parties : 45 % figé en haut, 45 % qui défile, 10 % figé en bas.
const lay = await page.evaluate(() => { const r = s => document.querySelector(s).getBoundingClientRect(), m = document.querySelector('.pkm-av-mid');
  return { pos: getComputedStyle(document.querySelector('.pkm-av-full')).position, top: r('.pkm-av-top').height, mid: r('.pkm-av-mid').height, bot: r('.pkm-av-bot').height, scroll: m.scrollHeight > m.clientHeight, h: innerHeight }; });
ok('écran en 3 parties : haut ' + Math.round(lay.top) + ' px, milieu ' + Math.round(lay.mid) + ' px (défile), bas ' + Math.round(lay.bot) + ' px', lay.pos === 'fixed' && Math.abs(lay.top - lay.h * 0.45) < 4 && lay.mid > lay.h * 0.4 && Math.abs(lay.bot - lay.h * 0.1) < 4 && lay.scroll);
ok('bas de l’écran : seulement « Valider mon avatar »', (await page.locator('.pkm-av-bot button').allInnerTexts()).join('|').trim() === 'Valider mon avatar');
const rowTexts = async l => (await page.locator('[role=tablist][aria-label="' + l + '"] button').allInnerTexts()).map(t => t.trim()).join('|');
ok('rubriques sous l’avatar : Cheveux, Visage, Style, Décor puis Pokémon, Shiny, Accessoire', await rowTexts('Ton avatar') === 'Cheveux|Visage|Style|Décor' && await rowTexts('Ton Pokémon') === 'Pokémon|Shiny|Accessoire');
ok('icône Pokémon : silhouette de Pikachu pleine ; plus de rubrique « Place »', (await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Pokémon") svg.pkm-av-ifill').count()) === 1 && (await page.locator('.pkm-av-full h3:has-text("Place")').count()) === 0);
await page.screenshot({ path: shot('avatar-ecran.png') });
// Pokémon : la grille des 171, en couleur, prix des non débloqués.
await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Pokémon")').click(); await page.waitForTimeout(400);
const price = async n => (await page.locator('.pkm-av-pk:has(img[src$="/' + n + '.png"]) small').first().innerText()).trim();
ok('171 Pokémon dans la rubrique, prix : Pikachu 25, Raichu 50, Dracaufeu 100, Mewtwo 300, Groudon 500 PA', (await page.locator('.pkm-av-pk').count()) === 171 && await price(25) === '25' && await price(26) === '50' && await price(6) === '100' && await price(150) === '300' && await price(383) === '500');
ok('Pokémon en couleur (pas de silhouette noire)', (await page.locator('.pkm-av-pk img').first().evaluate(e => getComputedStyle(e).filter)) === 'none');
await page.screenshot({ path: shot('avatar-pokemon.png') });
await page.locator('.pkm-av-pk:has(img[src$="/25.png"])').first().click(); await page.waitForTimeout(500);
const lk = page.locator('section.pkm-av-locksh');
ok('Pikachu non débloqué : fenêtre « 25 PA » ou « Tout débloquer avec Premium »', (await lk.count()) === 1 && /Pikachu/.test(await lk.innerText()) && /Débloquer pour 25 PA/.test(await lk.innerText()) && /Tout débloquer avec Premium/.test(await lk.innerText()));
await page.screenshot({ path: shot('avatar-debloquer.png') });
await page.evaluate(() => window.__pkm.setState({ pa: 1000 })); await page.waitForTimeout(200);
await lk.locator('button.pkm-av-buy').click(); await page.waitForTimeout(700);
let d = (await st()).avDraft;
ok('Pikachu débloqué (1 000 → 975 PA) et placé au centre de l’avatar', (await st()).pa === 975 && d.poke === 25 && d.px === 50 && d.py === 50);
ok('Pikachu coché « Débloqué » dans la grille', /Débloqué/.test(await price(25)));
// Taille et rotation : boutons, molette (pincée sur téléphone), Maj + molette (rotation).
await page.locator('button[aria-label="Grossir ton Pokémon"]').click(); await page.locator('button[aria-label="Tourner ton Pokémon vers la droite"]').click(); await page.waitForTimeout(300);
d = (await st()).avDraft;
ok('Pokémon grossi (' + d.size + ' %) et tourné (' + d.prot + '°), rotation visible', d.size > 140 && d.prot === 15 && /rotate\(15deg\)/.test(await page.locator('.pkm-av-pk-main').getAttribute('style')));
const pb = await page.locator('.pkm-av-prev').boundingBox();
await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(80); }
await page.keyboard.down('Shift'); await page.mouse.wheel(0, 100); await page.keyboard.up('Shift'); await page.waitForTimeout(300);
const d2 = (await st()).avDraft;
ok('sans limite : ' + d2.size + ' % après la molette ; Maj + molette fait tourner (' + d2.prot + '°)', d2.size > 500 && d2.prot === 30);
await page.locator('button[aria-label="Recentrer ton Pokémon"]').click(); await page.waitForTimeout(300);
const pkb = await page.locator('.pkm-av-pk-main').boundingBox();
await page.mouse.move(pkb.x + pkb.width / 2, pkb.y + pkb.height / 2); await page.mouse.down(); await page.mouse.move(pkb.x + pkb.width / 2 - 60, pkb.y + pkb.height / 2 + 40, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
const d3 = (await st()).avDraft;
ok('Pokémon glissé du doigt (' + d3.px + ' %, ' + d3.py + ' %)', d3.px < 50 && d3.py > 50);
await page.screenshot({ path: shot('avatar-manipuler.png') });
// Shiny : non débloqué → fenêtre, puis choisi.
await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Shiny")').click(); await page.waitForTimeout(300);
await page.locator('button[aria-label^="Version shiny"]').click(); await page.waitForTimeout(400);
ok('shiny non débloqué : fenêtre à 50 PA', (await lk.count()) === 1 && /50 PA/.test(await lk.innerText()));
await lk.locator('button.pkm-av-buy').click(); await page.waitForTimeout(700);
ok('Pikachu shiny débloqué et choisi', (await st()).avDraft.shiny === true && /img\/pokemon\/shiny\//.test(await page.locator('.pkm-av-pk-main').getAttribute('src')));
// Accessoire : sur moi, grossi et tourné.
await page.locator('[role=tablist][aria-label="Ton Pokémon"] button:has-text("Accessoire")').click(); await page.waitForTimeout(300);
await page.locator('section[aria-label="Accessoire"] button[aria-label^="Casquette"]').click(); await page.waitForTimeout(200);
await page.locator('section[aria-label="Accessoire"] button:has-text("Sur moi")').click(); await page.waitForTimeout(200);
await page.locator('button[aria-label="Grossir l’accessoire"]').click(); await page.locator('button[aria-label="Tourner l’accessoire vers la gauche"]').click(); await page.waitForTimeout(300);
const a1 = (await st()).avDraft;
ok('casquette sur moi, grossie (' + a1.asz + ' %) et tournée (' + a1.arot + '°)', a1.acc === 'casquette' && a1.aon === 'perso' && a1.asz > 100 && a1.arot === 345);
await page.screenshot({ path: shot('avatar-accessoire.png') });
// Décor : cadre PRO essayé, puis « Valider mon avatar ».
await page.locator('.pkm-av-tab:has-text("Décor")').click(); await page.waitForTimeout(300);
ok('Décor : 11 fonds et 13 cadres animés', (await page.locator('section[aria-label="Décor"] .pkm-av-opt:not(.pkm-av-fropt)').count()) === 11 && (await page.locator('.pkm-av-fropt').count()) === 13);
await page.locator('.pkm-av-fropt[aria-label^="Lave"]').evaluate(e => e.click()); await page.waitForTimeout(300);
await page.locator('.pkm-av-bot button').click(); await page.waitForTimeout(600);
ok('valider : le cadre PRO se débloque d’abord (250 PA ou Premium)', (await lk.count()) === 1 && /250 PA/.test(await lk.innerText()));
await lk.locator('button.pkm-av-buy').click(); await page.waitForTimeout(600);
await page.locator('.pkm-av-bot button').click(); await page.waitForTimeout(1500);
const saved = await st();
ok('avatar validé : image, accessoire tourné, retour à Mon profil', saved.avatarCfg && saved.avatarCfg.poke === 25 && saved.avatarCfg.shiny === true && saved.avatarCfg.frame === 'lave' && saved.avatarCfg.arot === 345 && /^data:image\/jpeg/.test(saved.avatarPng || '') && saved.screen === 'profile');
const pfImg = page.locator('button.pkm-pf-photo img').first();
ok('Mon profil : avatar en rectangle arrondi (plus de rond), avec son cadre', (await pfImg.getAttribute('src')).startsWith('data:image/jpeg') && (await pfImg.evaluate(e => parseFloat(getComputedStyle(e).borderTopLeftRadius))) <= 22 && (await page.locator('button.pkm-pf-photo.pkm-fr-lave').count()) === 1);
await page.screenshot({ path: shot('avatar-profil.png') });
await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(900);
const hh = page.locator('button.pkm-hh-me img').first();
ok('accueil : avatar en rectangle arrondi dans l’en-tête, avec son cadre', (await hh.getAttribute('src')).startsWith('data:image/jpeg') && (await hh.evaluate(e => parseFloat(getComputedStyle(e).borderTopLeftRadius))) <= 16 && (await page.locator('button.pkm-hh-me.pkm-fr-lave').count()) === 1);
await page.screenshot({ path: shot('avatar-entete.png') });
// Premium : tout le mode avatar est ouvert (Pokémon, shiny, styles, cadres).
await page.evaluate(() => window.__pkm.avOpen()); await page.waitForTimeout(800);
await page.evaluate(() => { window.__pkm.premOn = () => true; window.__pkm.setState({ avTab: 'poke' }); }); await page.waitForTimeout(400);
ok('Premium : les 171 Pokémon débloqués (Groudon, Dracaufeu), pas de prix', /Débloqué/.test(await price(383)) && /Débloqué/.test(await price(6)) && (await page.locator('.pkm-av-price').count()) === 0);
await page.locator('.pkm-av-pk:has(img[src$="/383.png"])').first().click(); await page.waitForTimeout(400);
ok('Premium : Groudon choisi sans fenêtre de déblocage', (await lk.count()) === 0 && (await st()).avDraft.poke === 383);
await page.evaluate(() => window.__pkm.setState({ avTab: 'hair' })); await page.waitForTimeout(300);
ok('Premium : coiffures PRO ouvertes (badge vert)', (await page.locator('section[aria-label="Cheveux"] .pkm-av-pro-ok').count()) >= 4);
// Dessins proposés : ?avdesign=2 (Manga).
const p2 = await ctx.newPage(); await p2.goto(E2E + '/?start=avatar&debug&avdesign=2', { waitUntil: 'load' }); await p2.waitForTimeout(1200);
ok('dessin proposé « Manga » (?avdesign=2) : tête agrandie', /scale\(1\.12\)/.test(decodeURIComponent(await p2.locator('.pkm-av-char').getAttribute('src'))));
await p2.close();
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
