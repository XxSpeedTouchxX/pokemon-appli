// 2026-11-09 : lots en quantité limitée (« Plus que N ce mois-ci », « Épuisé » et compte à rebours), un achat direct
// par compte et par mois, tirage mensuel d'une carte choisie dans la fiche du ticket, cartes chargées depuis le panneau
// Admin ; 2XP PK offert le premier mois du Premium (avantage affiché). Sur l'appareil (sans serveur).
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);

// A. Calendrier : prochain tirage le 1er du mois suivant à 20 h (heure de Paris).
const cal = await page.evaluate(() => {
  const app = window.__pkm, d = new Date(app.shopDrawAt(app.st()));
  const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  return { p: p, future: d.getTime() > Date.now(), soon: d.getTime() - Date.now() < 32 * 864e5 };
});
ok('prochain tirage : le 1er à 20 h, dans moins d’un mois (' + cal.p + ')', /^1 /.test(cal.p) && /20:00/.test(cal.p) && cal.future && cal.soon);

// B. Achats directs : stock et un achat par mois.
await page.evaluate(() => { window.__pkm.setState({ pk: 100000, shopLots: [], tickets: {} }); window.__pkm.tab('pkshop'); }); await page.waitForTimeout(700);
const boosterCard = page.locator('section.pkm-shop-item[aria-label="Booster de la série du moment"]');
ok('booster : « Plus que 10 ce mois-ci » et 10 points', /Plus que 10 ce mois-ci/.test(N(await boosterCard.innerText())) && (await boosterCard.locator('.pkm-stock-dot-on').count()) === 10);
const etbText = N(await page.locator('section.pkm-shop-item[aria-label="ETB 30 ans"]').innerText());
ok('ETB : « 1 article disponible jusqu’au 1er … » (1 tous les 2 mois)', /1 article disponible jusqu’au 1er (janvier|mars|mai|juillet|septembre|novembre)/.test(etbText));
ok('rubrique : quantités limitées, réassort le 1er à 20 h, 1 achat par mois', /Quantités limitées, réassort le 1er de chaque mois à 20 h ; 1 achat direct par compte et par mois/.test(N(await page.locator('.pkm-shop-head').allInnerTexts().then(a => a.join(' ')))));
await boosterCard.locator('button:has-text("Acheter")').click(); await page.waitForTimeout(300);
await boosterCard.locator('button:has-text("Confirmer")').click(); await page.waitForTimeout(900);
await page.locator('.pkm-lotfx-ok').click().catch(() => {}); await page.waitForTimeout(500);
let t = N(await boosterCard.innerText());
ok('après l’achat : « Plus que 9 ce mois-ci »', /Plus que 9 ce mois-ci/.test(t));
ok('« Tu as déjà fait ton achat du mois », prochain achat le 1er à 20 h, compte à rebours', /Tu as déjà fait ton achat du mois/.test(t) && /Prochain achat possible le 1er \S+ à 20 h/.test(t) && (await boosterCard.locator('.pkm-cdx[data-end]').count()) === 1 && (await boosterCard.locator('button:has-text("Acheter")').count()) === 0);
const pk1 = await page.evaluate(() => window.__pkm.st().pk);
await page.evaluate(() => window.__pkm.shopBuy('achat-booster'));
ok('2ᵉ achat direct le même mois : refusé, aucun PK débité', (await page.evaluate(() => window.__pkm.st().pk)) === pk1);
// Épuisé : 10 achats ce mois-ci (un mois plus tôt, ils ne comptent plus).
await page.evaluate(() => { const now = Date.now(); window.__pkm.setState({ shopLots: Array.from({ length: 10 }, (_, k) => ({ id: 'achat-booster', at: new Date(now - (k ? 50 : 0) * 864e5 - k * 1000).toISOString() })) }); }); await page.waitForTimeout(400);
ok('achats du mois dernier : plus comptés (Plus que 9)', /Plus que 9 ce mois-ci/.test(N(await boosterCard.innerText())));
await page.evaluate(() => { const now = Date.now(); window.__pkm.setState({ shopLots: Array.from({ length: 10 }, (_, k) => ({ id: 'achat-booster', at: new Date(now - k * 1000).toISOString() })) }); }); await page.waitForTimeout(400);
t = N(await boosterCard.innerText());
ok('10 achats ce mois-ci : « Épuisé », « Retour le 1er … à 20 h », compte à rebours', /Épuisé/i.test(t) && /Retour le 1er \S+ à 20 h/.test(t) && (await boosterCard.locator('.pkm-lotwait-out .pkm-cdx').count()) === 1 && (await boosterCard.locator('.pkm-shop-img-out').count()) === 1);
const c1 = await boosterCard.locator('.pkm-cdx [data-u="s"]').innerText(); await page.waitForTimeout(2300);
const c2 = await boosterCard.locator('.pkm-cdx [data-u="s"]').innerText();
ok('compte à rebours qui avance chaque seconde (' + c1 + ' → ' + c2 + ')', c1 !== c2);
await boosterCard.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('lots-epuise.png') });

// C. Tickets : carte choisie dans la fiche.
await page.evaluate(() => window.__pkm.setState({ shopLots: [] }));
const tiles = page.locator('.pkm-shop-tkrow .pkm-shop-tk');
ok('tickets : étoiles de rareté (2 argentées, 1 dorée, 2 dorées)', (await tiles.nth(0).locator('.pkm-shop-stars-silver svg').count()) === 2 && (await tiles.nth(1).locator('.pkm-shop-stars-gold svg').count()) === 1 && (await tiles.nth(2).locator('.pkm-shop-stars-gold svg').count()) === 2);
await tiles.first().click(); await page.waitForTimeout(800);
let sheet = page.locator('.pkm-tks-sheet');
t = N(await sheet.innerText());
ok('fiche Bronze : « Une carte ultra rare », « 1 carte ce mois-ci », « Chaque mois, le 1er à 20 h »', /Une carte ultra rare/.test(t) && /1 carte ce mois-ci/.test(t) && /Chaque mois, le 1er à 20 h/.test(t));
ok('sans cartes annoncées : message, pas d’achat', /arrivent très bientôt/.test(t) && (await sheet.locator('button:has-text("Acheter un ticket")').count()) === 0);
await sheet.locator('button:has-text("Fermer")').last().click(); await page.waitForTimeout(800);
// Cartes chargées (comme le panneau Admin le ferait sur l'appareil).
await page.evaluate(() => {
  const app = window.__pkm, key = new Date(app.shopDrawAt(app.st())).toISOString();
  app.setState({ shopPrizes: { [key]: { 'ticket-bronze': [{ id: 'sv03.5-199', name: 'Dracaufeu-ex', info: '151 · 199/165 · Ultra Rare', img: '' }, { id: 'sv03.5-200', name: 'Mew-ex', info: '151 · 200/165 · Ultra Rare', img: '' }] } } });
});
await tiles.first().click(); await page.waitForTimeout(800);
sheet = page.locator('.pkm-tks-sheet');
ok('2 cartes à choisir', (await sheet.locator('.pkm-tkc').count()) === 2 && /Choisis ta carte/.test(N(await sheet.innerText())));
ok('pas de carte choisie : « Choisis d’abord ta carte »', (await sheet.locator('button:has-text("Choisis d’abord ta carte")').count()) === 1);
await sheet.locator('.pkm-tkc').nth(1).click(); await page.waitForTimeout(300);
ok('carte touchée : sélectionnée', (await sheet.locator('.pkm-tkc').nth(1).getAttribute('aria-pressed')) === 'true');
await sheet.locator('button:has-text("Acheter un ticket")').click(); await page.waitForTimeout(300);
ok('confirmation : « … pour « Mew-ex » ? »', /pour « Mew-ex » \?/.test(N(await sheet.innerText())));
await sheet.locator('.pkm-tks-two button:has-text("Confirmer")').click(); await page.waitForTimeout(2800);
const st = await page.evaluate(() => { const app = window.__pkm, s = app.st(); return { n: (s.tickets || {})['ticket-bronze'], mine: app.shopMine(s, 'ticket-bronze') }; });
ok('ticket acheté pour Mew-ex', st.n === 1 && st.mine['sv03.5-200'] === 1);
sheet = page.locator('.pkm-tks-sheet');
ok('fiche : « Ton choix » sur Mew-ex', /Ton choix/.test(N(await sheet.locator('.pkm-tkc').nth(1).innerText())));
t = N(await sheet.innerText());
ok('un ticket par mois : « Ticket déjà acheté », prochain ticket le 1er à 20 h, compte à rebours, plus de bouton d’achat', /Ticket déjà acheté/.test(t) && /Prochain ticket disponible le 1er \S+ à 20 h/.test(t) && (await sheet.locator('.pkm-lotwait-ok .pkm-cdx').count()) === 1 && (await sheet.locator('button:has-text("Acheter un ticket")').count()) === 0);
const pkT = await page.evaluate(() => window.__pkm.st().pk);
await page.evaluate(() => window.__pkm.shopBuy('ticket-bronze', 'sv03.5-199'));
ok('2ᵉ ticket Bronze le même mois : refusé, aucun PK débité', (await page.evaluate(() => window.__pkm.st().pk)) === pkT);
ok('les tickets ne comptent pas comme l’achat direct du mois', (await page.evaluate(() => window.__pkm.shopMonthBuy(window.__pkm.st()))) === null);
await page.screenshot({ path: shot('lots-ticket.png') });
await sheet.locator('button:has-text("Fermer")').last().click(); await page.waitForTimeout(800);

// D. Panneau Admin › Cartes des tirages (sur l'appareil).
await page.evaluate(() => window.__pkm.setState({ admin: { on: true, hash: 'x', salt: 'y' }, admSheet: true, admPrzTk: 'ticket-argent' })); await page.waitForTimeout(600);
const adm = page.locator('section.pkm-admz');
ok('panneau Admin : rubrique « Cartes des tirages », 2 tirages et 3 tickets', (await adm.count()) === 1 && (await adm.locator('.pkm-admz-row').first().locator('button').count()) === 2 && (await adm.locator('.pkm-admz-row').nth(1).locator('button').count()) === 3);
ok('ticket Argent sans carte : prévenu', /Aucune carte pour ce ticket/.test(N(await adm.innerText())));
await page.waitForFunction(() => { try { return TCG.status === 'ready'; } catch (e) { return true; } }, null, { timeout: 30000 }).catch(() => {});
await adm.locator('input.pkm-admz-q').fill('pikachu'); await adm.locator('input.pkm-admz-q').dispatchEvent('change'); await page.waitForTimeout(800);
const found = await adm.locator('button.pkm-admz-add').count();
ok('recherche « pikachu » dans la rareté AR : ' + found + ' cartes', found > 0 && (await adm.locator('ul.pkm-admz-list').last().innerText()).includes('Illustration rare'));
await adm.locator('button.pkm-admz-add').first().click(); await page.waitForTimeout(500);
const argent = await page.evaluate(() => window.__pkm.shopPrizes(window.__pkm.st(), 'ticket-argent'));
ok('carte ajoutée au prochain tirage Argent', argent.length === 1 && /pikachu/i.test(argent[0].name));
await adm.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('lots-admin.png') });
await adm.locator('button.pkm-admz-x').first().click(); await page.waitForTimeout(400);
ok('carte retirée', (await page.evaluate(() => window.__pkm.shopPrizes(window.__pkm.st(), 'ticket-argent'))).length === 0);

// D2. PK shop : plus de barre « N tickets » sous les onglets ; ticket Bronze marqué « Acheté ».
ok('plus de barre des tickets entre « Magasin » et Premium', (await page.locator('main .pkm-shop-tk .pkm-tk-bar').count()) === 0);
ok('ticket Bronze : « Acheté »', /Acheté/.test(N(await page.locator('.pkm-shop-tkrow .pkm-shop-tk').first().innerText())));
// D3. Scans bonus : compteur à côté des scans du jour ; un appui en ajoute 20 quand ceux du jour sont finis.
await page.evaluate(() => window.__pkm.setState({ admSheet: false, admin: { on: false }, scanBonus: 40, scanDay: new Date().toISOString().slice(0, 10), scanN: 0 }));
await page.goto(E2E + '/?debug&start=scan', { waitUntil: 'load' }); await page.waitForTimeout(1200);
const bonus = page.locator('button.pkm-scan-bonus');
ok('scan : compteur « +40 » à côté des scans disponibles', (await bonus.count()) === 1 && /\+40/.test(await bonus.innerText()));
await bonus.click(); await page.waitForTimeout(300);
ok('scans du jour pas finis : rien n’est pris', (await page.evaluate(() => window.__pkm.st().scanBonus)) === 40);
await page.evaluate(() => window.__pkm.setState({ scanN: 999, scanDay: (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })() })); await page.waitForTimeout(300);
const q0 = await page.evaluate(() => window.__pkm.scanQuota().left);
await bonus.click(); await page.waitForTimeout(400);
const q1 = await page.evaluate(() => ({ left: window.__pkm.scanQuota().left, bonus: window.__pkm.st().scanBonus }));
ok('scans du jour finis : un appui ajoute 20 scans (' + q0 + ' → ' + q1.left + '), compteur à +20', q0 === 0 && q1.left === 20 && q1.bonus === 20 && /\+20/.test(await bonus.innerText()));
await page.screenshot({ path: shot('scan-bonus.png') });
// E. Premium : « 1er mois : 2XP PK offert » dans les avantages.
await page.evaluate(() => window.__pkm.setState({ admSheet: false, admin: { on: false } })); await page.waitForTimeout(300);
await page.evaluate(() => window.__pkm.premOpen()); await page.waitForTimeout(1200);
ok('offre Premium : « 1er mois : 2XP PK offert », « Soutenir Dropicards » avec le cœur dans la main', /1er mois : 2XP PK offert/.test(N(await page.locator('.pkm-prem-perks').innerText())) && /Soutenir Dropicards Pour vous faire gagner de plus en plus de lots/.test(N(await page.locator('.pkm-prem-perks').innerText())) && (await page.locator('svg.pkm-prem-heart').count()) === 1);
ok('prix : 6,90 € par mois, 69,90 € par an', /69,90 €/.test(N(await page.locator('section[aria-label="Dropicards Premium"]').innerText())) && /6,90 €/.test(N(await page.locator('section[aria-label="Dropicards Premium"]').innerText())));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
