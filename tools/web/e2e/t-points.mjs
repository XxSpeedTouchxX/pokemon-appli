// « Mes points » (2026-11-23, « go » du porteur : une page la plus claire possible pour comprendre comment gagner les PK,
// les PA et les PL) : bandeau de l'accueil (pastille des gains prêts, brille tant que la page n'a jamais été ouverte),
// 3 cartes-onglets, « Aujourd'hui, tu peux encore gagner » (verrous du grade compris), panneaux PK / PA / PL, soldes de
// l'en-tête, « Comment marchent les PL ? » dans Mes missions, règles complètes, retour du téléphone.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug&today=2026-11-23', { waitUntil: 'load' }); await page.waitForTimeout(1500);
// Booster joué il y a 2 h (pas prêt), pièce et Safari jamais joués (prêts au grade de la démo).
const ago = h => new Date(Date.now() - h * 3600e3).toISOString();
await page.evaluate(b => window.__pkm.setState({ gradeUp: null, games: { boosterAt: b } }), ago(2)); await page.waitForTimeout(300);

// 1. Bandeau de l'accueil, juste sous « Valeur de toute ma collection ».
const strip = page.locator('main button.pkm-pts-home');
const order = await page.evaluate(() => { const v = document.querySelector('main section[aria-label="Valeur de ma collection"]'), b = document.querySelector('main button.pkm-pts-home'), c = document.querySelector('main section[aria-label="Mon classeur"]');
  return !!(v && b && c) && !!(v.compareDocumentPosition(b) & 4) && !!(b.compareDocumentPosition(c) & 4); });
const ready = await page.evaluate(() => window.__pkm.ptsReady(window.__pkm.st()));
const stripTxt = N(await strip.innerText());
ok('accueil : bandeau « Comment gagner des points ? » entre la valeur et Mon classeur (' + stripTxt + ')', order && /Comment gagner des points \?/.test(stripTxt) && (await strip.locator('img').count()) === 3);
ok('accueil : pastille rouge = gains prêts (' + ready + ')', ready >= 2 && N(await strip.locator('.pkm-pts-hn').innerText()) === String(ready) && new RegExp(ready + ' gains prêts').test(stripTxt));
ok('accueil : le bandeau brille tant que la page n’a jamais été ouverte', /pkm-pts-home-new/.test(await strip.getAttribute('class')));
await strip.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
await page.screenshot({ path: shot('points-home.png') });

// 2. Ouverture : 3 cartes, liste du jour, panneau.
await strip.click(); await page.waitForTimeout(700);
const dlg = page.locator('section[aria-label="Mes points"][role="dialog"]');
const cards = await dlg.locator('[role="tab"]').evaluateAll(bs => bs.map(b => b.getAttribute('aria-label')));
ok('« Mes points » ouvert, 3 cartes PK, PA, PL (' + cards.map(c => c.split(' :')[0]).join(' · ') + ')', (await dlg.count()) === 1 && cards.length === 3 && /^Monnaie des jeux \(PK\)/.test(cards[0]) && /^Points d’Aura \(PA\)/.test(cards[1]) && /^Points de loyauté \(PL\)/.test(cards[2]));
const rows = await dlg.locator('.pkm-pts-today .pkm-pts-row').evaluateAll(rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
ok('« Aujourd’hui, tu peux encore gagner » : PA, Booster, pièce, Safari, PL (' + rows.length + ')', rows.length === 5 && /^PA du jour/.test(rows[0]) && /^Booster PK Prêt dans \d+ h/.test(rows[1]) && /^Pile ou face .*Lancer$/.test(rows[2]) && /^Safari éclair .*Jouer$/.test(rows[3]) && /PL/.test(rows[4]));
ok('ouverture sur l’onglet PA quand les PA du jour attendent', (await dlg.locator('[role="tab"][aria-selected="true"]').getAttribute('aria-label')).startsWith('Points d’Aura') && (await dlg.locator('section[aria-label="Mes PA"][role="tabpanel"]').count()) === 1);
ok('page vue : gardée sur l’appareil', await page.evaluate(() => window.__pkm.st().ptsSeen === true));
await page.screenshot({ path: shot('points-open.png') });

// 3. Les 3 onglets.
for (const [i, title, re] of [[0, 'Mes PK', /Booster PK.*Pile ou face.*Safari éclair.*Bienvenue/], [1, 'Mes PA', /Chaque jour dès minuit.*Série de connexion.*Pokédex.*Mon avatar.*Boîte mystère/], [2, 'Mes PL', /Parrainer un ami.*\+200 PL.*TikTok.*jours d’affilée.*Classement de la saison/]]) {
  await dlg.locator('[role="tab"]').nth(i).click(); await page.waitForTimeout(250);
  const p = dlg.locator('section[role="tabpanel"]'), t = N(await p.innerText());
  ok('onglet ' + title + ' : C’est quoi, Comment les gagner, À quoi servent-ils, Bon à savoir', (await p.getAttribute('aria-label')) === title && /C’est quoi \?/.test(t) && /Comment les gagner \?/.test(t) && /À quoi servent-ils \?/.test(t) && /Bon à savoir/.test(t) && re.test(t));
  await p.screenshot({ path: shot('points-' + title.slice(4).toLowerCase() + '.png') });
}
// Logos TikTok, Instagram, Discord (blancs) : sur la couleur du réseau, jamais sur fond blanc (2026-11-24, porteur : « ils ne ressortent pas »).
await dlg.locator('[role="tab"]').nth(2).click(); await page.waitForTimeout(250);
const socBg = await dlg.locator('.pkm-pts-steps li > img.pkm-pts-ico-soc').evaluateAll(l => l.map(i => { const c = getComputedStyle(i); return i.getAttribute('src').replace(/^.*\//, '') + ' ' + c.backgroundColor + ' ' + c.backgroundImage.slice(0, 15); }));
ok('onglet PL : logos TikTok, Instagram, Discord sur la couleur du réseau (' + socBg.join(' | ') + ')', socBg.length === 3
  && /tiktok\.svg rgb\(0, 0, 0\)/.test(socBg[0]) && /instagram\.svg .*linear-gradient/.test(socBg[1]) && /discord\.svg rgb\(88, 101, 242\)/.test(socBg[2]) && !socBg.some(x => /rgb\(255, 255, 255\)/.test(x)));
// La note des PA du jour reste exacte (même texte que l'ancien « Mes PA »).
await dlg.locator('[role="tab"]').nth(1).click(); await page.waitForTimeout(250);
ok('onglet PA : paliers J1 à J7 et note des PA', (await dlg.locator('.pkm-rules-streak > div').count()) === 7 && /Un jour sans les récupérer : retour au palier J3 \(\+40 PA\)/.test(await dlg.locator('.pkm-pa-sheet-note').innerText()));

// 4. Règles complètes, puis fermeture par le voile.
await dlg.locator('button:has-text("Règles complètes des PK et PA")').click(); await page.waitForTimeout(600);
ok('« Règles complètes des PK et PA » : la fiche des règles s’ouvre', (await page.locator('section[aria-label="Mes points"]').count()) === 0 && await page.evaluate(() => window.__pkm.st().legal === 'pk'));
await page.evaluate(() => window.__pkm.setState({ legal: '' })); await page.waitForTimeout(400);
ok('bandeau : ne brille plus une fois la page vue', !/pkm-pts-home-new/.test(await strip.getAttribute('class')));

// 5. Soldes de l'en-tête.
await page.locator('header button[aria-label^="Mes PK"]').click(); await page.waitForTimeout(600);
ok('solde de PK de l’en-tête → « Mes points », onglet PK', (await page.locator('section[aria-label="Mes points"] section[aria-label="Mes PK"]').count()) === 1);
await page.locator('button[aria-label="Fermer Mes points"]').click({ position: { x: 20, y: 20 } }); await page.waitForTimeout(700);
ok('voile touché : la page se ferme', (await page.locator('section[aria-label="Mes points"]').count()) === 0);
await page.locator('header button[aria-label^="Mes points d’Aura"]').click(); await page.waitForTimeout(600);
ok('solde de PA avec des PA à récupérer → « Tes PA du jour » d’abord', await page.evaluate(() => window.__pkm.st().paClaim === true) && (await page.locator('section[aria-label="Mes points"]').count()) === 0);
await page.evaluate(() => window.__pkm.setState({ paClaim: false, paDay: new Date().toISOString().slice(0, 10), paStreak: 1 })); await page.waitForTimeout(300);
await page.locator('header button[aria-label^="Mes points d’Aura"]').click(); await page.waitForTimeout(600);
ok('solde de PA, PA déjà récupérés → « Mes points », onglet PA', (await page.locator('section[aria-label="Mes points"] section[aria-label="Mes PA"]').count()) === 1);
const paRow = N(await page.locator('.pkm-pts-today .pkm-pts-row').first().innerText());
ok('PA du jour récupérés : ligne « Fait » (' + paRow + ')', /Prochains PA à minuit/.test(paRow) && /Fait$/.test(paRow) && await page.locator('.pkm-pts-today .pkm-pts-row').first().locator('button').isDisabled());
// Retour du téléphone : ferme la page.
await page.evaluate(() => window.__pkm.navBack()); await page.waitForTimeout(500);
ok('retour du téléphone : la page se ferme', (await page.locator('section[aria-label="Mes points"]').count()) === 0);

// 6. Un bouton de la liste emmène au bon jeu.
await page.evaluate(() => window.__pkm.ptsOpen('pk')); await page.waitForTimeout(600);
await page.locator('.pkm-pts-today .pkm-pts-row:has-text("Pile ou face") button').click(); await page.waitForTimeout(1300);
const inView = await page.evaluate(() => { const s = document.querySelector('main section[aria-label="Pile ou face"]'); if (!s) return false; const r = s.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
ok('« Lancer » (pièce) : onglet Jeux, carte « Pile ou face » à l’écran', await page.evaluate(() => window.__pkm.st().screen === 'market') && inView);

// 7. Grade Recrue : pièce et Safari fermés, « Voir » ouvre la fiche du grade.
await page.evaluate(() => localStorage.setItem('pkm-grade-force', '1'));
await page.goto(E2E + '/?debug&today=2026-11-23', { waitUntil: 'load' }); await page.waitForTimeout(1300);
await page.evaluate(() => { window.__pkm.setState({ gradeUp: null }); window.__pkm.ptsOpen('pk'); }); await page.waitForTimeout(600);
const lockRows = await page.locator('.pkm-pts-today .pkm-pts-lock').evaluateAll(rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
ok('Recrue : pièce « Dès le grade Chasseur », Safari « Dès le grade Collectionneur » (' + lockRows.join(' | ') + ')', lockRows.length === 2 && /Pile ou face Dès le grade Chasseur/.test(lockRows[0]) && /Safari éclair Dès le grade Collectionneur/.test(lockRows[1]));
const pkTxt = N(await page.locator('section[aria-label="Mes PK"]').innerText());
ok('Recrue : panneau PK, pièce et Safari « Se débloque au grade … »', /Se débloque au grade Chasseur/.test(pkTxt) && /Se débloque au grade Collectionneur/.test(pkTxt) && /(Encore .* pour le grade|Prochain grade :) Chasseur/.test(pkTxt));
await page.locator('.pkm-pts-today .pkm-pts-lock').last().locator('button').click(); await page.waitForTimeout(900);
ok('« Voir » sur le Safari fermé : fiche du grade Collectionneur', await page.evaluate(() => { const s = window.__pkm.st(); return s.screen === 'grade' && s.gradeIx === 2; }));
await page.evaluate(() => localStorage.removeItem('pkm-grade-force'));

// 8. « Ma ligue › Mes missions » : « Comment marchent les PL ? ».
await page.goto(E2E + '/?start=progress&pgtab=earn&debug', { waitUntil: 'load' }); await page.waitForTimeout(2200);
await page.evaluate(() => window.__pkm.setState({ gradeUp: null, tutoStep: -2, ligueTuto: 'done', pgTab: 'earn' })); await page.waitForTimeout(400);
const how = page.locator('button.pkm-ple-how');
ok('Mes missions : bouton « Comment marchent les PL ? »', (await how.count()) === 1 && /Comment marchent les PL \?/.test(await how.innerText()));
await how.click(); await page.waitForTimeout(600);
ok('« Comment marchent les PL ? » → « Mes points », onglet PL', (await page.locator('section[aria-label="Mes points"] section[aria-label="Mes PL"]').count()) === 1);

ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
