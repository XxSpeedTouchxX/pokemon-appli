import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// PK, la monnaie de l'app : compteur en haut à droite, bienvenue (100), ni visite du jour ni nouvelle carte (gains
// retirés le 2026-10-12), panneau « Mes PK », compagnons à débloquer avec des PA dans le Pokédex (2026-10-28 : plus de
// choix du compagnon payé en PK), déblocage de Kyogre (3 000 PA) et thème, migration, 360 px.
import { withFont } from './hero.mjs';
const BASE = E2E + '/';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFont(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const KEY = 'pkm-collection-v1';
const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
const edit = async f => { await page.evaluate(([k, src]) => { const d = JSON.parse(localStorage.getItem(k)); (0, eval)('(' + src + ')')(d); localStorage.setItem(k, JSON.stringify(d)); }, [KEY, f.toString()]); };
const counter = page.locator('header button[aria-label^="Mes PK"]');
const cText = async () => (await counter.innerText()).replace(/\s+/g, ' ').trim();

// 1. Premier lancement : 100 PK de bienvenue, « +100 PK », compteur à droite du logo et à gauche de l'avatar.
await page.goto(BASE + '?today=2026-10-08', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('compteur : « ' + await cText() + ' »', await cText() === '100 PK');
ok('« +100 PK » sous le compteur', (await page.locator('header .pkm-gain').innerText()).trim() === '+100 PK');
let d = await saved();
ok('enregistré : pk ' + d.pk + ', jour ' + d.pkDay + ', ' + d.pkSeen.length + ' articles de départ, pkOwn ' + JSON.stringify(d.pkOwn), d.pk === 100 && d.pkDay === '2026-10-08' && d.pkSeen.length >= 10 && d.pkOwn.length === 0);
const geo = async () => page.evaluate(() => {
  const h = document.querySelector('header'), r = e => e.getBoundingClientRect();
  const logo = h.querySelector('img[alt="Dropicards"]'), pk = h.querySelector('button[aria-label^="Mes PK"]'), av = h.querySelector('button[aria-label*="rofil"]') || h.querySelectorAll('button')[1];
  return { logo: [r(logo).left, r(logo).right, r(logo).width], pk: [r(pk).left, r(pk).right, r(pk).height], av: [r(av).left, r(av).right], vw: innerWidth, sw: document.documentElement.scrollWidth };
});
let g = await geo();
// En-tête de l'accueil (2026-10-16) : PK à gauche, logo au centre (plus petit), avatar plus grand à droite.
ok('390 : PK à gauche, logo ' + Math.round(g.logo[2]) + ' px au centre, avatar à droite ; bouton de 44 px', g.pk[0] < 30 && g.pk[1] <= g.logo[0] && g.logo[1] <= g.av[0] && g.av[1] <= g.vw - 10 && g.pk[2] >= 44 && g.logo[2] >= 110 && g.av[1] - g.av[0] >= 56);
await page.screenshot({ path: shot('pk-accueil.png'), clip: { x: 0, y: 0, width: 390, height: 300 } });
// 2. Même jour, lendemain : rien de plus (gain du jour retiré le 2026-10-12).
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(800);
ok('même jour : toujours 100 PK, pas de « + »', await cText() === '100 PK' && (await page.locator('header .pkm-gain').count()) === 0);
await page.goto(BASE + '?today=2026-10-09', { waitUntil: 'load' }); await page.waitForTimeout(800);
ok('lendemain : ' + await cText() + ', sans gain', await cText() === '100 PK' && (await page.locator('header .pkm-gain').count()) === 0);
// 3. Panneau « Mes PK ».
await counter.click(); await page.waitForTimeout(400);
const sheet = page.locator('section[aria-label="Mes PK"]');
const sheetText = (await sheet.innerText()).replace(/\s+/g, ' ');
// Compagnons à thème (2026-10-28) : prix en PA, un appui ouvre le Pokédex.
ok('panneau : solde, jeux, bienvenue, partage (sans +10), 3 compagnons à thème à 3 000 PA', /Ton solde 100 PK/.test(sheetText) && /Jeux booster PK/.test(sheetText) && !/\+10 /.test(sheetText) && /\+100 de bienvenue/.test(sheetText)
  && (await sheet.locator('button[aria-label^="Voir "][aria-label$=" PA"]').count()) === 3 && /Kyogre Compagnon et thème Océan 3 000 PA/.test(sheetText) && /Groudon Compagnon et thème Volcan 3 000 PA/.test(sheetText));
const order = await sheet.locator('ul li span:first-child').allInnerTexts();
ok('gains : ' + order.join(' / '), order.join() === 'Jeux,+100,+300');
ok('panneau : les PK ne s’achètent pas', /ne s’achètent pas et n’ont aucune valeur en euros/.test(sheetText));
ok('panneau : +300 partage, « Mon Pokédex · 152 Pokémon à débloquer avec tes PA »', /\+300 une fois, en partageant/.test(sheetText) && /Mon Pokédex 152 Pokémon à débloquer avec tes PA dans le Pokédex/.test(sheetText) && /Rayquaza Compagnon et thème Ouragan/.test(sheetText) && !/Tous les compagnons/.test(sheetText));
await page.screenshot({ path: shot('pk-panneau.png') });
// 4. Kyogre depuis « Mes PK » : le Pokédex s'ouvre (onglet Jeux) ; sans starter, on le choisit d'abord.
await sheet.locator('button[aria-label^="Voir Kyogre dans le Pokédex"]').click(); await page.waitForTimeout(1200);
const dex = page.locator('section[aria-label="Pokédex"]');
// (l'onglet Jeux a aussi un encadré « Mes PK », sans rôle de dialogue)
const k4 = [await page.locator('section[aria-label="Mes PK"][role="dialog"]').count(), await dex.count(), await page.locator('[role="alertdialog"]').count(), await page.locator('section[aria-label="Choisis ton compagnon"]').count()];
ok('Kyogre : « Mes PK » fermé, onglet Jeux, Pokédex affiché, sans confirmation en PK ni ancien choix du compagnon (' + k4.join(', ') + ')', k4.join() === '0,1,0,0');
const starters = await page.$$eval('[aria-label="Starters"] button', bs => bs.map(b => b.getAttribute('aria-label')));
ok('sans starter : ' + starters.join(' ; '), starters.join() === 'Choisir Bulbizarre comme starter,Choisir Salamèche comme starter,Choisir Carapuce comme starter,Choisir Pikachu comme starter');
await page.click('[aria-label="Starters"] button[aria-label="Choisir Pikachu comme starter"]'); await page.waitForTimeout(500);
// Sous charge, la fiche et l'enregistrement peuvent arriver après 500 ms : on attend jusqu'à 5 s.
for (let k = 0; k < 25 && !((d = await saved()).buddy === 25 && (await page.$$('[aria-label="Route d’évolution"] button.pkm-dex-lock')).length === 1); k++) await page.waitForTimeout(200);
const fiche = page.locator('section[aria-label="Fiche du Pokémon"]'), act = fiche.locator('.pkm-dex-act-btn');
const routeAria = () => page.$$eval('[aria-label="Route d’évolution"] button', bs => bs.map(b => b.getAttribute('aria-label') + (b.classList.contains('pkm-dex-lock') ? ' [verrou]' : '')));
const actText = async () => (await act.innerText()).replace(/\s+/g, ' ').trim();
let route = (await routeAria()).map(t => t.trim());
// Le starter choisi ouvre sa propre fiche (2026-10-28) ; Kyogre se retrouve par « Tous les Pokémon ».
ok('starter Pikachu : evo ' + JSON.stringify(d.evo) + ', buddy ' + d.buddy + ' ; route : ' + route.join(' ; '), d.evo && d.evo.line === 'pika' && d.buddy === 25
  && route.length === 2 && /^Pikachu, Forme de base, Compagnon$/.test(route[0].replace(/\s/g, ' ')) && /^Raichu, .*500 PA \[verrou\]$/.test(route[1].replace(/\s/g, ' ')));
await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'kyogre');
await page.waitForFunction(() => { const b = document.querySelector('[aria-label="Tous les Pokémon"] button'); return b && /Kyogre/.test(b.getAttribute('aria-label') || b.textContent); }, null, { timeout: 5000 }).catch(() => {});
await page.locator('[aria-label="Tous les Pokémon"] button').first().click();
await page.waitForFunction(() => { const f = document.querySelector('section[aria-label="Fiche du Pokémon"]'); return f && /Kyogre/.test(f.textContent); }, null, { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(200);
route = await routeAria();
ok('route de Kyogre : ' + route.join(' ; '), route.length === 1 && /^Kyogre, Forme de base, 3 000 PA \[verrou\]$/.test(route[0].replace(/\s/g, ' ')));
ok('fiche de Kyogre : « ' + await actText() + ' », désactivé', /^Encore 3 000 PA pour le débloquer$/.test((await actText()).replace(/\s/g, ' ')) && (await act.getAttribute('aria-disabled')) === 'true');
await act.dispatchEvent('click'); await page.waitForTimeout(300); // aria-disabled : appui direct sur le bouton, il ne doit rien faire
d = await saved();
ok('sans assez de PA : rien ne change (pa ' + d.pa + ', pkOwn ' + JSON.stringify(d.pkOwn) + ')', (d.pa || 0) === 0 && !d.pkOwn.includes(382) && d.buddy === 25 && d.pk === 100);
await page.screenshot({ path: shot('pk-manque.png') });
// Liste complète « Tous les Pokémon » : 156, dont 4 offerts ; prix en PA selon le stade.
await page.click('.pkm-dex-all'); await page.waitForTimeout(400);
const dexl = page.locator('section[aria-label="Mon Pokédex"]');
const tilesAria = await page.$$eval('[aria-label="Tous les Pokémon"] button', bs => bs.map(b => b.getAttribute('aria-label')));
const locked = tilesAria.filter(a => /à débloquer/.test(a)), free = tilesAria.filter(a => !/à débloquer/.test(a)).map(a => a.split(',')[0]);
const price = n => (tilesAria.find(a => a.startsWith(n + ',')) || '').replace(/.* pour /, '');
ok('152 verrouillés, 4 offerts : ' + free.join(', '), locked.length === 152 && free.join() === 'Bulbizarre,Salamèche,Carapuce,Pikachu' && tilesAria.length === 156);
ok('prix : Herbizarre ' + price('Herbizarre') + ', Florizarre ' + price('Florizarre') + ', Évoli ' + price('Évoli') + ', Mewtwo ' + price('Mewtwo') + ', Latias ' + price('Latias') + ', Kyogre ' + price('Kyogre'),
  price('Herbizarre') === '500 PA' && price('Florizarre') === '1500 PA' && price('Évoli') === '100 PA' && price('Mewtwo') === '2000 PA' && price('Latias') === '2000 PA' && price('Kyogre') === '3000 PA'
  && price('Dracolosse') === '1500 PA' && price('Raichu') === '500 PA' && price('Kabutops') === '500 PA' && price('Ptéra') === '100 PA' && price('Ronflex') === '100 PA');
const dexCount = async () => (await dexl.locator('.pkm-dexl-head > span > span').innerText()).replace(/\s/g, ' ').trim();
ok('compte : « ' + await dexCount() + ' »', await dexCount() === '4 / 156 débloqués · 0 PA');
const nTiles = () => page.locator('[aria-label="Tous les Pokémon"] button').count();
await dexl.locator('button:has-text("À débloquer")').click(); await page.waitForTimeout(200);
const nLock = await nTiles();
await dexl.locator('button:has-text("Débloqués")').click(); await page.waitForTimeout(200);
const nOwn = await nTiles();
await dexl.locator('button:has-text("Légendaires")').click(); await page.waitForTimeout(200);
const legs = await page.$$eval('[aria-label="Tous les Pokémon"] button', bs => bs.map(b => b.getAttribute('aria-label').split(',')[0]));
await dexl.locator('button:has-text("Tous")').first().click(); await page.waitForTimeout(200);
ok('filtres : ' + nLock + ' à débloquer, ' + nOwn + ' débloqués, ' + legs.length + ' légendaires (' + legs.slice(0, 4).join(', ') + '…), ' + await nTiles() + ' en tout',
  nLock === 152 && nOwn === 4 && legs.includes('Mewtwo') && legs.includes('Kyogre') && !legs.includes('Pikachu') && await nTiles() === 156);
await page.screenshot({ path: shot('pk-choix.png') });
// Groudon verrouillé : sa fiche s'ouvre, rien ne change.
await page.fill('input[aria-label="Chercher un Pokémon"]', 'groudon'); await page.waitForTimeout(300);
ok('recherche « groudon » : ' + await nTiles() + ' résultat', await nTiles() === 1);
await page.locator('[aria-label="Tous les Pokémon"] button').first().click(); await page.waitForTimeout(500);
d = await saved();
ok('Groudon verrouillé : liste fermée, « ' + await actText() + ' », compagnon inchangé', (await dexl.count()) === 0 && /^Encore 3 000 PA pour le débloquer$/.test((await actText()).replace(/\s/g, ' ')) && d.buddy === 25 && !d.pkOwn.includes(383)
  && /Groudon/.test(await fiche.locator('h3').innerText()));
// Forme évoluée : il faut d'abord la forme précédente ; la route montre la famille, méga-évolution au bout.
await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'florizarre'); await page.waitForTimeout(300);
await page.locator('[aria-label="Tous les Pokémon"] button').first().click(); await page.waitForTimeout(500);
route = (await routeAria()).map(a => a.replace(/\s/g, ' '));
ok('Florizarre : « ' + await actText() + ' » ; route : ' + route.join(' ; '), await actText() === 'Débloque d’abord Herbizarre'
  && route.join('|') === 'Bulbizarre, Forme de base, Débloqué|Herbizarre, 1ʳᵉ évolution, 500 PA [verrou]|Florizarre, 2ᵉ évolution, 1 500 PA [verrou]|Méga-Florizarre, méga-évolution, 2 500 PA [verrou]');
// 5. Nouvelle carte : plus de gain de PK (2026-10-12).
await page.goto(BASE + '?today=2026-10-09', { waitUntil: 'load' }); await page.waitForTimeout(2500);
// Rappel des PA du jour (2026-10-28) : un message comme les autres, qui doit s'effacer seul (sinon il couvre le bas de
// l'écran et intercepte les appuis, dont « + Ajouter un exemplaire »).
const remind = page.locator('div[role="status"]:has-text("Tes PA du jour t’attendent")');
const remindAt = await remind.count();
await page.waitForTimeout(4500);
ok('rappel « Tes PA du jour t’attendent » : affiché à l’ouverture (' + remindAt + '), effacé seul après 7 s (' + await remind.count() + ' restant)', remindAt === 1 && (await remind.count()) === 0);
// Tant que le rappel reste affiché, les appuis passent par l'événement « click » (sans test de recouvrement) pour
// vérifier la suite du parcours.
const tap = async l => ((await remind.count()) ? l.dispatchEvent('click') : l.click());
await page.fill('input[aria-label="Rechercher dans le catalogue"]', 'dracaufeu'); await page.waitForTimeout(800);
await page.locator('section[aria-label="Recherche dans le catalogue"] button[style*="min-height: 76px"]').nth(1).click(); await page.waitForTimeout(800);
const addOnce = async () => {
  await tap(page.locator('button:has-text("Ajouter")').first()); await page.waitForTimeout(400);
  const save = page.locator('button:has-text("Ajouter à ma collection")').first();
  if (await save.count()) { await tap(save); }
  await page.waitForTimeout(300);
  return (await page.locator('div[role="status"]').allInnerTexts().catch(() => [])).join(' / ').trim();
};
const t1 = await addOnce();
d = await saved();
ok('nouvelle carte : « ' + t1 + ' », solde ' + d.pk + ' (sans gain)', !/PK/.test(t1) && d.pk === 100);
await page.waitForTimeout(3000);
const t2 = await addOnce();
d = await saved();
ok('même carte une 2e fois : « ' + t2 + ' », solde ' + d.pk, !/PK/.test(t2) && d.pk === 100);
await page.click('button[aria-label="Retour"]').catch(() => {}); await page.waitForTimeout(300);
await page.click('button[aria-label="Accueil"]').catch(() => {}); await page.waitForTimeout(400);
ok('compteur : ' + await cText(), await cText() === '100 PK');
// 6. Déblocage avec des PA (2026-10-28) : 3 120 PA, le compagnon de l'accueil ouvre le Pokédex, Kyogre débloqué pour
// 3 000 PA, thème océan, il te reste 120 PA ; les PK ne bougent pas.
await edit(d => { d.pa = 3120; });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
const buddyBtn = page.locator('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon : "]');
ok('compagnon de l’accueil : « ' + await buddyBtn.getAttribute('aria-label') + ' »', (await buddyBtn.getAttribute('aria-label')) === 'Compagnon : Pikachu. Ouvrir le Pokédex');
await buddyBtn.click(); await page.waitForTimeout(1400);
const dexTop = await page.evaluate(() => { const el = document.querySelector('section[aria-label="Pokédex"]'); return el ? Math.round(el.getBoundingClientRect().top) : null; });
ok('le compagnon ouvre Jeux et le Pokédex (haut à ' + dexTop + ' px), sans panneau de choix', dexTop !== null && dexTop >= 0 && dexTop < 300
  && (await dex.count()) === 1 && (await page.locator('section[aria-label="Choisis ton compagnon"]').count()) === 0);
await page.click('.pkm-dex-all'); await page.waitForTimeout(300);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'kyogre');
await page.waitForFunction(() => { const b = document.querySelector('[aria-label="Tous les Pokémon"] button'); return b && /Kyogre/.test(b.getAttribute('aria-label') || b.textContent); }, null, { timeout: 5000 }).catch(() => {});
await page.locator('[aria-label="Tous les Pokémon"] button').first().click();
await page.waitForFunction(() => { const f = document.querySelector('section[aria-label="Fiche du Pokémon"]'); return f && /Kyogre/.test(f.textContent); }, null, { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(200);
ok('fiche de Kyogre : « ' + await actText() + ' »', (await actText()).replace(/\s/g, ' ') === 'Débloquer · 3 000 PA' && (await act.getAttribute('aria-disabled')) === 'false');
await page.screenshot({ path: shot('pk-achat.png') });
await act.click(); await page.waitForTimeout(500);
const toast = (await page.locator('div[role="status"]').innerText()).trim().replace(/\s/g, ' ');
d = await saved();
ok('déblocage : « ' + toast + ' »', /^Kyogre rejoint ton Pokédex · il te reste 120 PA$/.test(toast) && d.pa === 120 && d.pk === 100 && d.pkOwn.includes(382) && d.buddy === 382);
ok('thème océan appliqué', await page.evaluate(() => document.documentElement.classList.contains('pkm-theme-sea')));
ok('compteur : ' + await cText() + ' (PK inchangés)', await cText() === '100 PK');
ok('animation de déblocage affichée', (await page.locator('button.pkm-unl').count()) === 1);
await page.screenshot({ path: shot('pk-unlock.png') });
await page.waitForTimeout(2800); // fin de l'animation de déblocage (3 s)
ok('animation de déblocage terminée', (await page.locator('button.pkm-unl').count()) === 0);
route = (await routeAria()).map(a => a.replace(/\s/g, ' '));
ok('après déblocage : « ' + await actText() + ' », route ' + route.join(' ; '), await actText() === 'C’est ton compagnon' && route.join() === 'Kyogre, Forme de base, Compagnon');
await page.click('nav button[aria-label="Accueil"]'); await page.waitForTimeout(600);
ok('accueil : « ' + await buddyBtn.getAttribute('aria-label') + ' »', (await buddyBtn.getAttribute('aria-label')) === 'Compagnon : Kyogre. Ouvrir le Pokédex');
await page.screenshot({ path: shot('pk-kyogre.png'), clip: { x: 0, y: 0, width: 390, height: 420 } });
await counter.click(); await page.waitForTimeout(400);
const after = await page.$$eval('section[aria-label="Mes PK"] button[aria-label]', bs => bs.map(b => b.getAttribute('aria-label')).filter(a => /Kyogre|Groudon|Rayquaza/.test(a)));
ok('après déblocage, « Mes PK » : ' + after.join(' ; '), after.length === 3 && after[0] === 'Kyogre est ton compagnon' && after.filter(a => /^Voir .* dans le Pokédex : 3\s000 PA$/.test(a)).length === 2);
// « Mon Pokédex » (ex « Tous les compagnons ») ouvre la liste complète.
await page.click('section[aria-label="Mes PK"] button:has-text("Mon Pokédex")'); await page.waitForTimeout(1000);
ok('« Mon Pokédex » : liste ouverte, « ' + (await dexl.count() ? await dexCount() : '—') + ' »', (await dexl.count()) === 1 && await dexCount() === '5 / 156 débloqués · 120 PA');
await dexl.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
await page.click('nav button[aria-label="Accueil"]'); await page.waitForTimeout(600);
// 7. Migration : compagnon à thème choisi avant les PK, gardé ; compagnon payant non débloqué, retiré.
await edit(d => { delete d.pkDay; delete d.pk; delete d.pkOwn; delete d.pkSeen; d.buddy = 383; });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
d = await saved();
ok('ancien choix Groudon gardé : pkOwn ' + JSON.stringify(d.pkOwn) + ', buddy ' + d.buddy + ', ' + d.pk + ' PK', JSON.stringify(d.pkOwn) === '[383]' && d.buddy === 383 && d.pk === 100 && await page.evaluate(() => document.documentElement.classList.contains('pkm-theme-lava')));
await edit(d => { d.buddy = 384; });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
ok('Rayquaza non débloqué : retour à Pikachu', /Pikachu/.test(await page.getAttribute('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]', 'aria-label')) && !(await page.evaluate(() => document.documentElement.className)).includes('pkm-theme-'));
// 7 bis. Migration v2 : un compagnon devenu payant, déjà choisi, reste acquis.
await edit(d => { delete d.pkV; d.buddy = 133; d.pkOwn = (d.pkOwn || []).filter(n => n !== 133); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
d = await saved();
ok('v2 : Évoli déjà choisi reste acquis : pkOwn ' + JSON.stringify(d.pkOwn) + ', buddy ' + d.buddy, d.pkOwn.includes(133) && d.buddy === 133 && d.pkV === 2);
// 7 ter. Partage : +300 PK une fois.
const before = d.pk;
await counter.click(); await page.waitForTimeout(400);
ctx.on('page', p => p.close().catch(() => {}));
await page.click('section[aria-label="Mes PK"] a[aria-label="Partager Dropicards sur WhatsApp"]'); await page.waitForTimeout(600);
d = await saved();
ok('partage WhatsApp : +300 PK (' + before + ' → ' + d.pk + '), « ' + (await page.locator('div[role="status"]').innerText()).trim() + ' »', d.pk === before + 300 && d.pkShared === 'WhatsApp');
await page.screenshot({ path: shot('pk-partage.png') });
await page.click('section[aria-label="Mes PK"] a[aria-label="Partager Dropicards sur X"]'); await page.waitForTimeout(600);
d = await saved();
ok('2e partage : rien de plus, « Merci » affiché', d.pk === before + 300 && /Tes \+300 PK sont reçus/.test(await page.locator('section[aria-label="Mes PK"]').innerText()));
await page.click('section[aria-label="Mes PK"] button[aria-label="Fermer"]'); await page.waitForTimeout(300);
// 8. Grands titres et écrans de détail.
for (const [tab, name] of [['Toutes les séries', 'Toutes les séries'], ['Jeux', 'Jeux'], ['PK shop', 'PK shop']]) {
  await page.click('nav button[aria-label="' + tab + '"]'); await page.waitForTimeout(500);
  ok(name + ' : compteur à droite', (await counter.count()) === 1 && await cText() === '400 PK');
}
await page.click('nav button[aria-label="Accueil"]'); await page.waitForTimeout(400);
// 9. 360 px et 320 px, solde à 4 chiffres.
await edit(d => { d.pk = 12500; });
for (const w of [360, 320]) {
  await page.setViewportSize({ width: w, height: 740 }); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
  g = await geo();
  ok(w + ' : « ' + await cText() + ' », logo ' + Math.round(g.logo[2]) + ' px, sans chevauchement ni défilement', g.pk[1] <= g.logo[0] + 0.5 && g.logo[1] <= g.av[0] + 0.5 && g.av[1] <= w && g.sw <= w && g.logo[2] >= (w === 360 ? 110 : 70));
  await page.screenshot({ path: shot('pk-' + w + '.png'), clip: { x: 0, y: 0, width: w, height: 200 } });
}
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
