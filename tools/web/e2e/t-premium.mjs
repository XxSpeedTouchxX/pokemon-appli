// Abonnement Premium (2026-11-06, demande du porteur ; docs/27) : bannière dans le PK shop et dans Mon profil, écran de
// l'offre (7 avantages, Annuel 69,90 € choisi par défaut, Semestriel 39,90 €, Trimestriel 24,90 €, Mensuel 9,90 €), règles de renouvellement et d'arrêt,
// paiement par Stripe (sans compte connecté : message de connexion ; le parcours payé est dans t-premium-pay.mjs).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?start=market', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('nav button[aria-label="PK shop"]'); await page.waitForTimeout(800);
const banner = page.locator('button[aria-label="Découvrir Dropicards Premium"]');
ok('PK shop : bannière « Dropicards Premium » (sans « Dès 4,16 € par mois »), couronne dessinée', (await banner.count()) === 1 && !/4,16/.test(await banner.innerText()) && (await banner.locator('svg.pkm-prem-crown-svg').count()) === 1);
await banner.click(); await page.waitForTimeout(600);
const sh = page.locator('section[aria-label="Dropicards Premium"]');
const t = await sh.innerText();
ok('icônes animées : scanner, classeur, radar, goutte des PA « 2XP », graphique', (await sh.locator('svg.pkm-prem-scan').count()) === 1 && (await sh.locator('svg.pkm-prem-bind').count()) === 1 && (await sh.locator('.pkm-prem-radar').count()) === 1
  && (await sh.locator('.pkm-prem-xp-tag').first().innerText()) === '2XP' && (await sh.locator('.pkm-prem-xp img[src="img/brand/pa.svg"]').count()) === 1 && (await sh.locator('svg.pkm-prem-hist').count()) === 1
  && (await sh.locator('.pkm-prem-bind-card').evaluate(e => getComputedStyle(e).animationName)) === 'pkmPremCard');
const boxes = await sh.locator('.pkm-prem-ico').evaluateAll(l => l.map(e => Math.round(e.getBoundingClientRect().left)));
ok('7 icônes alignées (' + boxes.join(', ') + ')', boxes.length === 7 && new Set(boxes).size === 1);
ok('double XP sur les PA seulement', /Double XP permanent sur tes PA/.test(await sh.innerText()) && !/PK et tes PA/.test(await sh.innerText()));
const top = await sh.locator('.pkm-prem-crown-xl').evaluate(e => e.getBoundingClientRect().top);
ok('couronne entière, sous le haut de l’écran (' + Math.round(top) + ' px)', top > 0);
ok('5 avantages', ['Scans illimités', 'Cartes et items scellés illimités', 'Radar des boutiques débloqué', 'Double XP permanent', 'Historique des prix complet'].every(x => t.includes(x)));
ok('formules : Annuel 69,90 € par an (choisie, meilleure offre), Semestriel 39,90 €, Trimestriel 24,90 € et Mensuel 9,90 €', /69,90 €/.test(t) && /39,90 €/.test(t) && /24,90 €/.test(t) && /9,90 €/.test(t) && (await sh.locator('button[role=radio][aria-checked=true]').innerText()).includes('Annuel') && /Meilleure offre/.test(t));
ok('règles : renouvellement automatique, arrêt à tout moment, période commencée due', /Renouvellement automatique chaque année/.test(t) && /arrêter à tout moment/.test(t) && /période déjà commencée reste due/.test(t));
await page.screenshot({ path: shot('premium.png') });
await sh.locator('button[role=radio]:has-text("Mensuel")').click(); await page.waitForTimeout(300);
ok('Mensuel choisi : « Devenir Premium · 9,90 € par mois », « chaque mois »', /Devenir Premium · 9,90 € par mois/.test(await sh.innerText()) && /Renouvellement automatique chaque mois/.test(await sh.innerText()));
ok('paiement sécurisé par Stripe annoncé, bouton actif', !(await sh.locator('button.pkm-prem-cta').isDisabled()) && /Paiement sécurisé par Stripe/.test(await sh.innerText()));
await sh.locator('button.pkm-prem-cta').click(); await page.waitForTimeout(500);
ok('sans serveur (tests) : le paiement explique qu’il n’est pas disponible, rien n’est ouvert', /pas disponible/.test(await sh.locator('.pkm-prem-err').innerText().catch(() => '')) && page.url().startsWith(E2E));
const scroll = await sh.evaluate(e => { const c = getComputedStyle(e); return c.overscrollBehaviorY + ' ' + c.touchAction; });
ok('défilement de l’offre : sans entraîner la page derrière (' + scroll + ')', /contain/.test(scroll) && /pan-y/.test(scroll));
// « 2XP » centré dans sa bulle : mesuré sur les lettres elles-mêmes (pixels sombres), bulle à plat et immobile.
await page.addStyleTag({ content: '.pkm-prem-xp-tag { animation: none !important; transform: none !important; }' }); await page.waitForTimeout(100);
const tagPng = await sh.locator('.pkm-prem-xp-tag').first().screenshot();
const tag = await page.evaluate(async b64 => {
  const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
  const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d'); x.drawImage(bm, 0, 0);
  const d = x.getImageData(0, 0, bm.width, bm.height).data, m = 3; let t = -1, bt = -1, l = 1e9, r = -1;
  for (let y = m; y < bm.height - m; y++) for (let xx = m; xx < bm.width - m; xx++) { const i = (y * bm.width + xx) * 4; if (d[i] < 110 && d[i + 1] < 80) { if (t < 0) t = y; bt = y; l = Math.min(l, xx); r = Math.max(r, xx); } }
  const k = bm.height / 13; return [Math.abs(l - (bm.width - 1 - r)) / 2 / k, Math.abs(t - (bm.height - 1 - bt)) / 2 / k];
}, tagPng.toString('base64'));
ok('« 2XP » centré dans sa bulle (écart ' + tag.map(v => v.toFixed(1)).join(' et ') + ' px)', tag[0] < 0.75 && tag[1] < 0.5);
ok('graphique de l’historique sans flèche jaune', (await sh.locator('.pkm-prem-hist g, .pkm-prem-hist-arrow').count()) === 0);
const mh = await sh.evaluate(e => getComputedStyle(e).maxHeight);
await sh.evaluate(e => { for (let n = e; n; n = n.parentElement) n.scrollTop = 0; e.querySelectorAll('*').forEach(x => { if (x.scrollTop) x.scrollTop = 0; }); }); await page.waitForTimeout(200);
const backTop = await sh.locator('button[aria-label="Retour au PK shop"]').evaluate(e => e.getBoundingClientRect().top);
ok('haut de l’offre dégagé : flèche « précédent » entière (' + Math.round(backTop) + ' px du haut, hauteur ' + mh + ')', backTop >= 40 && /env|px/.test(mh));
await sh.locator('button.pkm-prem-cgv').click(); await page.waitForTimeout(400);
ok('lien « Conditions générales de vente » de l’offre', (await page.locator('section[aria-label="Informations légales"] h2').innerText()) === 'Conditions générales de vente');
await page.locator('section[aria-label="Informations légales"] button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
await page.click('button[aria-label="Découvrir Dropicards Premium"]'); await page.waitForTimeout(700);
await sh.locator('button[aria-label="Retour au PK shop"]').click(); await page.waitForTimeout(150);
const mid = await page.locator('.pkm-prem-sheet').evaluate(e => getComputedStyle(e).transform).catch(() => 'none');
ok('retour animé : l’offre glisse vers la droite (' + mid + ')', /matrix/.test(mid) && mid !== 'none');
await page.waitForTimeout(600);
ok('flèche en haut à gauche : retour au PK shop', (await sh.count()) === 0 && (await page.locator('section[aria-label="Tickets du tirage au sort"]').count()) === 1);
await page.goto(E2E + '/?start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('Mon profil : bannière Premium (argentée, cadre or)', (await page.locator('button[aria-label="Découvrir Dropicards Premium"]').evaluate(e => getComputedStyle(e).borderTopColor)) === 'rgb(255, 214, 10)' && (await page.locator('button[aria-label="Découvrir Dropicards Premium"]').count()) === 1);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
