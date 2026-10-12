import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// PK, la monnaie de l'app : compteur en haut à droite, bienvenue (100), visite du jour (+10), nouvelle carte (+10, une
// fois), panneau « Mes PK », compagnons verrouillés (500 PK), achat de Kyogre et thème, migration, 360 px.
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
ok('390 : logo à gauche ' + Math.round(g.logo[2]) + ' px, puis PK, puis avatar ; bouton de 44 px', g.logo[0] < 30 && g.logo[1] <= g.pk[0] && g.pk[1] <= g.av[0] && g.av[1] <= g.vw - 12 && g.pk[2] >= 44 && g.logo[2] >= 180);
await page.screenshot({ path: shot('pk-accueil.png'), clip: { x: 0, y: 0, width: 390, height: 300 } });
// 2. Même jour : rien de plus ; lendemain : +10.
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(800);
ok('même jour : toujours 100 PK, pas de « + »', await cText() === '100 PK' && (await page.locator('header .pkm-gain').count()) === 0);
await page.goto(BASE + '?today=2026-10-09', { waitUntil: 'load' }); await page.waitForTimeout(800);
ok('lendemain : ' + await cText() + ' et « +10 PK »', await cText() === '110 PK' && (await page.locator('header .pkm-gain').innerText()).trim() === '+10 PK');
await page.waitForTimeout(3000);
ok('« +10 PK » disparaît', (await page.locator('header .pkm-gain').count()) === 0);
// 3. Panneau « Mes PK ».
await counter.click(); await page.waitForTimeout(400);
const sheet = page.locator('section[aria-label="Mes PK"]');
const sheetText = (await sheet.innerText()).replace(/\s+/g, ' ');
ok('panneau : solde, 3 façons de gagner, 3 compagnons à 500 PK', /Ton solde 110 PK/.test(sheetText) && /\+10 par nouvelle carte/.test(sheetText) && /\+10 par jour/.test(sheetText) && /\+100 de bienvenue/.test(sheetText)
  && (await sheet.locator('button[aria-label^="Débloquer"]').count()) === 3 && /Kyogre Compagnon et thème Océan/.test(sheetText) && /Groudon Compagnon et thème Volcan/.test(sheetText));
const order = await sheet.locator('ul li span:first-child').allInnerTexts();
ok('gains dans l’ordre croissant : ' + order.join(' / '), order.join() === '+10,+10,+100,+300');
ok('panneau : les PK ne s’achètent pas', /ne s’achètent pas et n’ont aucune valeur en euros/.test(sheetText));
ok('panneau : +300 partage, « Tous les compagnons · 152 compagnons à débloquer »', /\+300 une fois, en partageant/.test(sheetText) && /Tous les compagnons 152 compagnons à débloquer, de 50 à 500 PK/.test(sheetText) && /Rayquaza Compagnon et thème Ouragan/.test(sheetText));
await page.screenshot({ path: shot('pk-panneau.png') });
// 4. Débloquer Kyogre sans assez de PK : le panneau de choix s'ouvre sur la confirmation, « Il te manque 390 PK ».
await sheet.locator('button[aria-label="Débloquer Kyogre pour 500 PK"]').click(); await page.waitForTimeout(400);
const ask = page.locator('[role="alertdialog"]');
ok('confirmation : « ' + (await ask.innerText()).replace(/\s+/g, ' ').slice(0, 120) + ' »', /Il te manque 390 PK/.test(await ask.innerText()) && (await ask.locator('button:has-text("Débloquer pour")').count()) === 0);
await page.screenshot({ path: shot('pk-manque.png') });
await ask.locator('button:has-text("Annuler")').click(); await page.waitForTimeout(300);
ok('« Annuler » ferme la confirmation', (await ask.count()) === 0 && (await page.locator('section[aria-label="Choisis ton compagnon"]').count()) === 1);
const tiles = page.locator('[aria-label="Compagnons"] button');
const tilesAria = await page.$$eval('[aria-label="Compagnons"] button', bs => bs.map(b => b.getAttribute('aria-label')));
const locked = tilesAria.filter(a => /à débloquer/.test(a)), free = tilesAria.filter(a => !/à débloquer/.test(a)).map(a => a.split(',')[0]);
const price = n => (tilesAria.find(a => a.startsWith(n + ',')) || '').replace(/.* pour /, '');
ok('152 verrouillés, 4 offerts : ' + free.join(', '), locked.length === 152 && free.join() === 'Bulbizarre,Salamèche,Carapuce,Pikachu' && (await tiles.count()) === 156);
ok('prix : Herbizarre ' + price('Herbizarre') + ', Florizarre ' + price('Florizarre') + ', Évoli ' + price('Évoli') + ', Mewtwo ' + price('Mewtwo') + ', Latias ' + price('Latias') + ', Kyogre ' + price('Kyogre'),
  price('Herbizarre') === '100 PK' && price('Florizarre') === '200 PK' && price('Évoli') === '50 PK' && price('Mewtwo') === '400 PK' && price('Latias') === '400 PK' && price('Kyogre') === '500 PK' && price('Dracolosse') === '200 PK' && price('Raichu') === '100 PK' && price('Kabutops') === '100 PK' && price('Ptéra') === '100 PK' && price('Ronflex') === '200 PK');
ok('compte : « ' + await page.locator('section[aria-label="Choisis ton compagnon"] > span').innerText() + ' »', (await page.locator('section[aria-label="Choisis ton compagnon"] > span').innerText()) === '156 Pokémon · 4 débloqués, les autres avec tes PK');
ok('solde dans le panneau de choix : ' + (await page.locator('section[aria-label="Choisis ton compagnon"] h2 + span').innerText()).replace(/\s+/g, ' '), /110 ?PK/.test((await page.locator('section[aria-label="Choisis ton compagnon"] h2 + span').innerText()).replace(/\s+/g, ' ')));
await page.fill('input[aria-label="Chercher un Pokémon"]', 'groudon'); await page.waitForTimeout(300);
await tiles.first().click(); await page.waitForTimeout(300);
ok('Groudon verrouillé : confirmation, pas de changement', /Débloquer Groudon/.test(await ask.innerText()) && /Pikachu/.test(await page.evaluate(() => document.title + (document.querySelector('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]') || {}).ariaLabel)));
await page.screenshot({ path: shot('pk-choix.png') });
await page.click('button[aria-label="Fermer"]').catch(() => {}); await page.waitForTimeout(300);
await page.keyboard.press('Escape');
// 5. Nouvelle carte : +10 PK, une seule fois par carte.
await page.goto(BASE + '?today=2026-10-09', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.fill('input[aria-label="Rechercher dans le catalogue"]', 'dracaufeu'); await page.waitForTimeout(800);
await page.locator('section[aria-label="Recherche dans le catalogue"] button[style*="min-height: 76px"]').nth(1).click(); await page.waitForTimeout(800);
const addOnce = async () => {
  await page.locator('button:has-text("Ajouter")').first().click(); await page.waitForTimeout(400);
  const save = page.locator('button:has-text("Ajouter à ma collection")').first();
  if (await save.count()) { await save.click(); }
  await page.waitForTimeout(300);
  return (await page.locator('div[role="status"]').innerText().catch(() => '')).trim();
};
const t1 = await addOnce();
d = await saved();
ok('nouvelle carte : « ' + t1 + ' », solde ' + d.pk, /· \+10 PK$/.test(t1) && d.pk === 120);
await page.waitForTimeout(3000);
const t2 = await addOnce();
d = await saved();
ok('même carte une 2e fois : « ' + t2 + ' », solde ' + d.pk, !/PK/.test(t2) && d.pk === 120);
await page.click('button[aria-label="Retour"]').catch(() => {}); await page.waitForTimeout(300);
await page.click('button[aria-label="Accueil"]').catch(() => {}); await page.waitForTimeout(400);
ok('compteur à jour : ' + await cText(), await cText() === '120 PK');
// 6. Achat : 620 PK, Kyogre débloqué, thème océan, solde 120.
await edit(d => { d.pk = 620; });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
await page.click('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]'); await page.waitForTimeout(400);
await page.fill('input[aria-label="Chercher un Pokémon"]', 'kyogre'); await page.waitForTimeout(300);
await tiles.first().click(); await page.waitForTimeout(300);
ok('confirmation : « Débloquer pour 500 PK »', (await ask.locator('button:has-text("Débloquer pour 500 PK")').count()) === 1);
await page.screenshot({ path: shot('pk-achat.png') });
await ask.locator('button:has-text("Débloquer pour 500 PK")').click(); await page.waitForTimeout(500);
const toast = (await page.locator('div[role="status"]').innerText()).trim();
d = await saved();
ok('achat : « ' + toast + ' »', /^Kyogre débloqué · thème Océan · il te reste 120 PK$/.test(toast) && d.pk === 120 && JSON.stringify(d.pkOwn) === '[382]' && d.buddy === 382);
ok('thème océan appliqué', await page.evaluate(() => document.documentElement.classList.contains('pkm-theme-sea')));
ok('compteur : ' + await cText(), await cText() === '120 PK');
ok('animation de déblocage affichée', (await page.locator('button.pkm-unl').count()) === 1);
await page.screenshot({ path: shot('pk-unlock.png') });
await page.waitForTimeout(1600); // fin de l'animation de déblocage (1,9 s)
ok('animation de déblocage terminée', (await page.locator('button.pkm-unl').count()) === 0);
await page.screenshot({ path: shot('pk-kyogre.png'), clip: { x: 0, y: 0, width: 390, height: 420 } });
await page.click('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]'); await page.waitForTimeout(400);
const after = await page.$$eval('[aria-label="Compagnons"] button', bs => bs.map(b => b.getAttribute('aria-label')).filter(a => /Kyogre|Groudon|Rayquaza/.test(a)));
ok('après achat : ' + after.join(' ; '), after.some(a => /^Kyogre.*débloqué/.test(a)) && after.filter(a => /à débloquer/.test(a)).length === 2 && after.length === 3);
await page.keyboard.press('Escape');
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
for (const [tab, name] of [['Toutes les séries', 'Toutes les séries'], ['Jeux', 'Jeux'], ['Territoire', 'Territoire']]) {
  await page.click('nav button[aria-label="' + tab + '"]'); await page.waitForTimeout(500);
  ok(name + ' : compteur à droite', (await counter.count()) === 1 && await cText() === '400 PK');
}
await page.click('nav button[aria-label="Accueil"]'); await page.waitForTimeout(400);
// 9. 360 px et 320 px, solde à 4 chiffres.
await edit(d => { d.pk = 12500; });
for (const w of [360, 320]) {
  await page.setViewportSize({ width: w, height: 740 }); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
  g = await geo();
  ok(w + ' : « ' + await cText() + ' », logo ' + Math.round(g.logo[2]) + ' px, sans chevauchement ni défilement', g.logo[1] <= g.pk[0] + 0.5 && g.pk[1] <= g.av[0] + 0.5 && g.av[1] <= w && g.sw <= w && g.logo[2] >= (w === 360 ? 150 : 110));
  await page.screenshot({ path: shot('pk-' + w + '.png'), clip: { x: 0, y: 0, width: w, height: 200 } });
}
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
