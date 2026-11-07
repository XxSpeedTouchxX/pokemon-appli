// Abonnement Premium (2026-11-06, demande du porteur ; docs/27) : bannière dans le PK shop et dans Mon profil, écran de
// l'offre (5 avantages, Annuel 49,90 € choisi par défaut, Mensuel 4,90 €), règles de renouvellement et d'arrêt,
// paiement pas encore ouvert (bouton désactivé, rien n'est débité).
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
  && (await sh.locator('.pkm-prem-xp-tag').innerText()) === '2XP' && (await sh.locator('.pkm-prem-xp img[src="img/brand/pa.svg"]').count()) === 1 && (await sh.locator('svg.pkm-prem-hist').count()) === 1
  && (await sh.locator('.pkm-prem-bind-card').evaluate(e => getComputedStyle(e).animationName)) === 'pkmPremCard');
const boxes = await sh.locator('.pkm-prem-ico').evaluateAll(l => l.map(e => Math.round(e.getBoundingClientRect().left)));
ok('5 icônes alignées (' + boxes.join(', ') + ')', boxes.length === 5 && new Set(boxes).size === 1);
ok('double XP sur les PA seulement', /Double XP permanent sur tes PA/.test(await sh.innerText()) && !/PK et tes PA/.test(await sh.innerText()));
const top = await sh.locator('.pkm-prem-crown-xl').evaluate(e => e.getBoundingClientRect().top);
ok('couronne entière, sous le haut de l’écran (' + Math.round(top) + ' px)', top > 0);
ok('5 avantages', ['Scans illimités', 'Cartes et items scellés illimités', 'Radar des boutiques débloqué', 'Double XP permanent', 'Historique des prix complet'].every(x => t.includes(x)));
ok('formules : Annuel 49,90 € par an (choisie, meilleure offre) et Mensuel 4,90 € par mois', /49,90 €/.test(t) && /4,90 €/.test(t) && (await sh.locator('button[role=radio][aria-checked=true]').innerText()).includes('Annuel') && /Meilleure offre/.test(t));
ok('règles : renouvellement automatique, arrêt à tout moment, période commencée due', /Renouvellement automatique chaque année/.test(t) && /arrêter à tout moment/.test(t) && /période déjà commencée reste due/.test(t));
await page.screenshot({ path: shot('premium.png') });
await sh.locator('button[role=radio]:has-text("Mensuel")').click(); await page.waitForTimeout(300);
ok('Mensuel choisi : « Devenir Premium · 4,90 € par mois », « chaque mois »', /Devenir Premium · 4,90 € par mois/.test(await sh.innerText()) && /Renouvellement automatique chaque mois/.test(await sh.innerText()));
ok('paiement pas encore ouvert : bouton désactivé, « Rien n’est débité »', (await sh.locator('button.pkm-prem-cta').isDisabled()) && /Rien n’est débité/.test(await sh.innerText()));
await sh.locator('button[aria-label="Retour au PK shop"]').click(); await page.waitForTimeout(300);
ok('flèche en haut à gauche : retour au PK shop', (await sh.count()) === 0 && (await page.locator('section[aria-label="Tickets du tirage au sort"]').count()) === 1);
await page.goto(E2E + '/?start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('Mon profil : bannière Premium (argentée, cadre or)', (await page.locator('button[aria-label="Découvrir Dropicards Premium"]').evaluate(e => getComputedStyle(e).borderTopColor)) === 'rgb(255, 214, 10)' && (await page.locator('button[aria-label="Découvrir Dropicards Premium"]').count()) === 1);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
