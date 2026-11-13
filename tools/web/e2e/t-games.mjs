// 2026-10-11 : onglet Jeux (booster PK, pile ou face, délais gardés), Admin dans les Réglages, fiche d'une carte
// (lien eBay ventes réussies), logo de série repris de ptcg-assets quand TCGdex n'en a pas.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));

await page.goto(E2E + '/?start=market&debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('onglet « Jeux » dans la barre du bas', (await page.locator('nav button[aria-label="Jeux"]').count()) === 1);
const boost = page.locator('section[aria-label="Booster PK"]'), coin = page.locator('section[aria-label="Pile ou face"]');
ok('booster et pile ou face affichés', (await boost.count()) === 1 && (await coin.count()) === 1);
const solde = await page.locator('section[aria-label="Mes PK"]').innerText();
ok('« Ton solde » sans « Pour le PK shop »', /Ton solde/.test(solde) && !/Pour le/.test(solde));
const odds = (await boost.textContent()).replace(/[\u202f\u00a0]/g, ' ');
ok('flèche sur « Contenu possible et chances »', (await boost.locator('summary .pkm-gm-chev svg').count()) === 1);
ok('taux affichés (30 PK 40 %, 50 PK 30 % … 500 PK 5 %)', /500 PK/.test(odds) && /5 %/.test(odds) && /40 %/.test(odds) && /30 %/.test(odds) && !/50 %/.test(odds) && !/1 000 PK/.test(odds));
ok('pile ou face : nouvelle description', /Lance la pièce : si tu obtiens la face PK, tu gagnes 50 PK ; si tu obtiens l’autre face, tu n’obtiens rien\./.test(await coin.innerText()));
ok('plus de « Gratuit, sans achat… » sous le Pokédex', !/Gratuit, sans achat/.test(await page.locator('body').innerText()));
const pk0 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
await boost.locator('button:has-text("Ouvrir mon booster")').click(); await page.waitForTimeout(1300);
await page.screenshot({ path: shot('games-scissors.png') });
await page.waitForTimeout(1100);
// Gain des PK comme les PA du jour (2026-11-13, porteur) : les gemmes volent jusqu'au solde, qui monte à chaque gemme.
const fly = await page.evaluate(() => [...document.querySelectorAll('.pkm-pafly-drop')].map(d => d.getAttribute('src')));
ok('booster : gemmes des PK qui volent jusqu’au solde (' + fly.length + ')', fly.length >= 8 && fly.every(f => f === 'img/brand/pk.svg'));
await page.screenshot({ path: shot('games-pkfly.png') });
// Un autre mouvement du solde pendant le vol des gemmes (achat au PK shop…) n'est jamais effacé par la fin du vol.
await page.evaluate(() => window.__pkm.setState({ pk: window.__pkm.st().pk + 1000 }));
await page.waitForTimeout(2600);
const pk1 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('booster ouvert : PK crédités, sans effacer les +1 000 PK reçus pendant le vol (' + pk0 + ' → ' + pk1 + ')', [30, 50, 100, 200, 500].indexOf(pk1 - pk0 - 1000) >= 0);
// Grade forcé à Grand maître (helpers.mjs) : booster et pièce toutes les 4 h (2026-10-28).
ok('booster suivant dans 4 h', /Tu dois attendre [34] h \d* ?(min )?pour rejouer|Tu dois attendre [34] h pour rejouer/.test(await boost.innerText()));
await page.screenshot({ path: shot('games-booster.png') });
await coin.locator('button:has-text("Lancer la pièce")').click(); await page.waitForTimeout(6200); // pièce, puis gemmes qui volent si gagné
const pk2 = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').pk);
ok('pièce lancée : 0 ou 50 PK (' + (pk2 - pk1) + ')', pk2 - pk1 === 0 || pk2 - pk1 === 50);
ok('lancer suivant dans 4 h', /Tu dois attendre [34] h \d* ?(min )?pour rejouer|Tu dois attendre [34] h pour rejouer/.test(await coin.innerText()));
await page.screenshot({ path: shot('games-coin.png') });
// Roulette retirée (2026-10-25) : Pokédex avec les PA (points d'Aura) ; déblocage des Pokémon en PA (2026-10-28).
ok('roulette retirée', (await page.locator('section[aria-label="Roulette"]').count()) === 0);
// Deux rubriques (2026-11-10, porteur) : « Jeux à PK » (Booster PK, pile ou face) et « Pokédex ».
ok('rubriques « Jeux à PK » (ouverte) et « Pokédex » ; le Pokédex n’est pas sous les jeux', (await page.locator('[role=tablist][aria-label="Jeux"] button[aria-selected="true"]').innerText()).trim() === 'Jeux à PK' && (await page.locator('section[aria-label="Pokédex"]').count()) === 0 && (await page.locator('section[aria-label="Booster PK"]').count()) === 1);
await page.click('[role=tablist][aria-label="Jeux"] button:has-text("Pokédex")'); await page.waitForTimeout(400);
ok('rubrique « Pokédex » : le Pokédex, sans les jeux à PK', (await page.locator('section[aria-label="Pokédex"]').count()) === 1 && (await page.locator('section[aria-label="Booster PK"], section[aria-label="Pile ou face"]').count()) === 0);
const evo = page.locator('section[aria-label="Pokédex"]');
ok('Pokédex : 4 starters (' + (await evo.locator('[aria-label="Starters"] button').allInnerTexts()).join(', ') + ')', (await evo.locator('[aria-label="Starters"] button').allInnerTexts()).join(',') === 'Bulbizarre,Salamèche,Carapuce,Pikachu');
// Toucher direct (le message du gain de la pièce peut couvrir le bas de l'écran), puis attente de la sauvegarde.
await evo.locator('button[aria-label="Choisir Carapuce comme starter"]').evaluate(e => e.click());
await page.waitForFunction(() => (JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').evo || {}).line === 'cara', null, { timeout: 4000 }).catch(() => null);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { evo: d.evo, buddy: d.buddy, own: d.pkOwn || [] }; });
ok('Pokédex : Carapuce choisi, débloqué et devenu le compagnon', st.evo && st.evo.line === 'cara' && st.evo.stage === 0 && st.buddy === 7 && st.own.indexOf(7) >= 0);
// Route d'évolution de la famille : Carapuce, Carabaffe, Tortank, puis Méga-Tortank au bout de la ligne.
const route = evo.locator('[aria-label="Route d’évolution"]'), act = evo.locator('section[aria-label="Fiche du Pokémon"] button.pkm-dex-act-btn');
const nodes = await route.locator('button').evaluateAll(b => b.map(x => x.getAttribute('aria-label')));
ok('Pokédex : route de la famille avec la méga au bout (' + nodes.join(' · ') + ')', nodes.length === 4 && /^Carapuce, /.test(nodes[0]) && /^Carabaffe, 1ʳᵉ évolution, 50 PA$/.test(nodes[1]) && /^Tortank, 2ᵉ évolution, 200 PA$/.test(nodes[2]) && /méga-évolution, 500 PA$/.test(nodes[3]));
ok('Pokédex : Carabaffe, Tortank et la méga en silhouette (verrouillés)', (await route.locator('.pkm-dex-lock').count()) === 3);
ok('Pokédex : fiche de Carapuce sans « C’est ton compagnon » (retiré le 2026-10-31)', (await act.count()) === 0);
ok('Pokédex : anciens boutons et listes retirés', (await evo.locator('[aria-label="Actions du Pokédex"], [aria-label="Lignée de ton Pokémon"], [role="group"][aria-label="Méga-évolutions"]').count()) === 0);
await route.locator('button[aria-label^="Tortank,"]').click(); await page.waitForTimeout(300);
ok('Pokédex : Tortank demande d’abord Carabaffe', /^Débloque d’abord Carabaffe$/.test((await act.innerText()).trim()));
await route.locator('button[aria-label^="Carabaffe,"]').click(); await page.waitForTimeout(300);
ok('Pokédex : bouton bloqué sans assez de PA (' + (await act.innerText()).trim() + ')', /^Encore 50 PA pour le débloquer$/.test((await act.innerText()).trim()) && (await act.getAttribute('aria-disabled')) === 'true');
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pa = 520; localStorage.setItem(k, JSON.stringify(d)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200); await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(600); await page.click('[role=tablist][aria-label="Jeux"] button:has-text("Pokédex")'); await page.waitForTimeout(300);
await route.locator('button[aria-label^="Carabaffe,"]').click(); await page.waitForTimeout(300);
ok('Pokédex : « Faire évoluer · 50 PA » sur Carabaffe', /^Faire évoluer · 50 PA$/.test((await act.innerText()).trim()));
await act.click(); await page.waitForTimeout(8500); // évolution de 8,2 s (2026-11-01)
const st2 = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { evo: d.evo, buddy: d.buddy, pa: d.pa, own: d.pkOwn }; });
ok('Pokédex : Carabaffe pour 50 PA (' + st2.pa + ' PA restants), nouveau compagnon', st2.evo.stage === 1 && st2.buddy === 8 && st2.pa === 470 && st2.own.indexOf(8) >= 0 && (await route.locator('.pkm-dex-lock').count()) === 2);
ok('Pokédex : Carabaffe sans bouton (compagnon), Tortank à 200 PA', (await act.count()) === 0 && /^Tortank, 2ᵉ évolution, 200 PA$/.test(await route.locator('button[aria-label^="Tortank,"]').getAttribute('aria-label')));
await evo.screenshot({ path: shot('games-evolution.png') });
// PA dans l'en-tête, à la place des tickets ; PA du jour à récupérer (pastille « 1 » (« ! » jusqu’au 2026-10-29)), plus crédités à l'ouverture.
const paPill = page.locator('header button[aria-label^="Mes points d’Aura"]').first();
ok('en-tête : PA sous le solde de PK', /470\s*PA/.test(await paPill.innerText()));
ok('en-tête : PA du jour à récupérer (« 1 »)', (await paPill.locator('.pkm-pa-dot').count()) === 1 && /PA à récupérer/.test(await paPill.getAttribute('aria-label')));
// PK shop (2026-10-12) : 4ᵉ onglet, ticket du tirage au sort. Au grade Recrue pour voir les verrous (2026-11-06).
await page.evaluate(() => localStorage.setItem('pkm-grade-force', '1'));
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
// PK shop par grades (2026-11-06, porteur) : les 3 tickets dans une rubrique (Bronze 500, toutes les 2 semaines ;
// Argent 1 500, chaque mois ; Or 5 000, tous les 2 mois), fiche du ticket au toucher ; achats directs booster 7 500,
// item rare 25 000 (Collectionneur), ETB 30 ans 50 000 (Maître Pokémon) ; « Déverrouillé au grade … » et fenêtre.
const tks = page.locator('section[aria-label="Tickets du tirage au sort"]');
const tkTxt = (await tks.innerText()).replace(/[\u202f\u00a0]/g, ' ');
ok('3 tickets dans une seule rubrique : Bronze 500, Argent 1 500, Or 5 000 PK', (await tks.locator('.pkm-shop-tk').count()) === 3 && ['500PK', '1500PK', '5000PK'].every(t => tkTxt.replace(/\s/g, '').includes(t)) && (tkTxt.match(/chaque mois/g) || []).length === 3);
const orF = await tks.locator('.pkm-shop-tk').nth(2).locator('.pkm-shop-ticket').evaluate(e => getComputedStyle(e).filter);
ok('ticket Or verrouillé, toujours dans sa couleur (filtre : ' + orF + ')', orF === 'none');
ok('Recrue : Argent et Or « Collectionneur » et « Maître Pokémon » avec leur emblème', /Collectionneur/.test(tkTxt) && /Maître Pokémon/.test(tkTxt) && (await tks.locator('img[src="img/grades/grade-3.svg"]').count()) === 1 && (await tks.locator('img[src="img/grades/grade-5.svg"]').count()) === 1);
const lot = page.locator('section[aria-label="ETB 30 ans"]');
const shopTxt = (await page.locator('main').innerText()).replace(/[\u202f\u00a0]/g, ' ');
ok('achats directs : booster 7 500, item rare 25 000, ETB 30 ans 50 000 PK, avec visuels', ['7500PK', '25000PK', '50000PK'].every(t => shopTxt.replace(/\s/g, '').includes(t)) && (await lot.locator('img[src="img/products/30th-celebration-elite-trainer-box.webp"]').count()) === 1);
ok('Recrue : ETB « Déverrouillé au grade Maître Pokémon »', /Déverrouillé au grade Maître Pokémon/.test(await lot.innerText()));
await lot.locator('button:has-text("Déverrouillé au grade")').click(); await page.waitForTimeout(500);
const lw = page.locator('section[aria-label="Grade requis"]');
ok('fenêtre « Tu dois d’abord déverrouiller le grade Maître Pokémon pour avoir accès à cet item »', /Tu dois d’abord déverrouiller le grade Maître Pokémon pour avoir accès à cet item/.test(await lw.innerText()));
await page.screenshot({ path: shot('pkshop-verrou.png') });
await lw.locator('button:has-text("Compris")').click(); await page.waitForTimeout(300);
await tks.locator('.pkm-shop-tk').nth(1).click(); await page.waitForTimeout(500);
const sheet = page.locator('section[aria-label="Ticket Argent"]');
ok('fiche du ticket Argent : carte AR, 1 lot, chaque mois le 1er à 20 h, prochain tirage, à quoi il sert', /Une carte AR/.test(await sheet.innerText()) && /1 carte ce mois-ci/.test(await sheet.innerText()) && /Chaque mois, le 1er à 20 h/.test(await sheet.innerText()) && /Tirage le [a-z]+ 1 [a-zéû]+ à 20 h/.test(await sheet.innerText()) && /À quoi sert ce ticket/.test(await sheet.innerText()));
await sheet.locator('button:has-text("Déverrouillé au grade")').click(); await page.waitForTimeout(500);
ok('ticket verrouillé : « pour avoir accès à cette loterie »', /grade Collectionneur pour avoir accès à cette loterie/.test(await lw.innerText()));
await lw.locator('button:has-text("Compris")').click(); await sheet.locator('button:has-text("Fermer")').last().click(); await page.waitForTimeout(300);
ok('en-tête : plus de barre de tickets, les PA à la place (2026-10-25)', (await page.locator('header button[aria-label^="Mes tickets"]').count()) === 0 && (await page.locator('header button[aria-label^="Mes points d’Aura"]').count()) >= 1);
// Prochain tirage : le 1er du mois à 20 h, heure de Paris (clé des cartes chargées sur l'appareil).
const drawKey = (() => {
  const hourAt = t => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).format(new Date(t)));
  const at = (y, m) => [1, 2].map(o => Date.UTC(y, m - 1, 1, 20 - o)).find(t => hourAt(t) === 20);
  const p = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: 'numeric' }).formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
  let y = +p.year, m = +p.month; if (Date.now() >= at(y, m)) { m++; if (m > 12) { m = 1; y++; } }
  return new Date(at(y, m)).toISOString();
})();
await page.evaluate(([k0, key]) => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pk = 700; d.shopPrizes = { [key]: { 'ticket-bronze': [{ id: 'sv03.5-199', name: 'Dracaufeu-ex', info: '151 · 199/165', img: '' }] } }; localStorage.setItem(k, JSON.stringify(d)); }, ['', drawKey]);
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(700);
await tks.locator('.pkm-shop-tk').nth(0).click(); await page.waitForTimeout(400);
const ticket = page.locator('section[aria-label="Ticket Bronze"]');
await ticket.locator('button:has-text("Acheter un ticket")').click(); await ticket.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(500);
const sd = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'));
ok('ticket Bronze acheté depuis sa fiche (Recrue) : 1 ticket, 200 PK', sd.pk === 200 && sd.tickets && sd.tickets['ticket-bronze'] === 1 && /Ticket déjà acheté/.test(await ticket.innerText()));
await ticket.locator('button:has-text("Fermer")').last().click(); await page.waitForTimeout(300);
await page.evaluate(() => localStorage.setItem('pkm-grade-force', '6'));
ok("PK shop : ticket Bronze « Acheté », sans barre « N tickets » ni solde de PK (2026-11-09)", /Acheté/.test(await page.locator('.pkm-shop-tkrow .pkm-shop-tk').first().innerText()) && (await page.locator('p[aria-label="Mes tickets du tirage au sort"]').count()) === 0 && (await page.locator('section[aria-label="Mon solde de PK"]').count()) === 0);
await page.screenshot({ path: shot('pkshop.png') });
await page.goto(E2E + '/?start=market', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('délais gardés après rechargement', /Tu dois attendre/.test(await boost.innerText()) && /Tu dois attendre/.test(await coin.innerText()));

await page.goto(E2E + '/?start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button:has-text("Mode Admin · paramétrage")'); await page.waitForTimeout(300);
ok('Admin depuis les Réglages : code demandé', (await page.locator('section[aria-label="Code Admin"]').count()) === 1);

await page.goto(E2E + '/?start=set&setId=2013bw', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const logo = await page.locator('main img[src="img/logo-mcdonalds.webp"]').count();
ok('McDonald’s 2013 : logo McDonald’s (absent de TCGdex)', logo >= 1);
await page.locator('main button[aria-label*="n°"]').first().click(); await page.waitForTimeout(800);
const ebay = await page.locator('section.pkm-fi a.pkm-fi-ebay').getAttribute('href');
ok('fiche : lien eBay ventes réussies', /ebay\.fr\/sch\/.*LH_Sold=1&LH_Complete=1/.test(ebay || ''));
await page.screenshot({ path: shot('games-item-ebay.png'), fullPage: false });

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
