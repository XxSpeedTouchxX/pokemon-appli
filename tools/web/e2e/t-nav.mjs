// J1 : chaque changement d'onglet s'ouvre en haut ; les réglages de chaque page sont gardés ; au retour en arrière,
// la page reprend sa position (2026-10-11).
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-09';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2500);
const top = () => page.evaluate(() => document.querySelector('#app main').scrollTop);
const down = async () => { await page.evaluate(() => { const m = document.querySelector('#app main'); m.scrollTop = 900; }); await page.waitForTimeout(150); return top(); };
const tab = async n => { await page.click('nav[aria-label="Navigation principale"] button[aria-label="' + n + '"]'); await page.waitForTimeout(500); };
// Accueil : onglet « Mes produits scellés » du classeur, puis défilement.
await page.click('section[aria-label="Mon classeur"] [role="tab"]:has-text("Mes produits scellés")'); await page.waitForTimeout(300);
ok('accueil défilé : ' + await down(), (await top()) > 300);
await tab('Toutes les séries');
ok('Toutes les séries : en haut (' + await top() + ')', (await top()) === 0);
const cq = page.locator('input[aria-label="Rechercher une série ou une extension"]');
await cq.fill('pika'); await page.waitForTimeout(300); await down();
await tab('Jeux');
ok('Jeux : en haut', (await top()) === 0);
await tab('PK shop');
ok('PK shop : en haut à l’arrivée', (await top()) === 0); await down();
await tab('Toutes les séries');
ok('retour Toutes les séries : en haut, recherche gardée « ' + await cq.inputValue() + ' »', (await top()) === 0 && (await cq.inputValue()) === 'pika');
await tab('Accueil');
ok('retour Accueil : en haut, onglet scellé gardé', (await top()) === 0 && (await page.getAttribute('section[aria-label="Mon classeur"] [role="tab"]:has-text("Mes produits scellés")', 'aria-selected')) === 'true');
// Profil (avatar) puis retour.
await down();
await page.click('header button[aria-label*="rofil"]'); await page.waitForTimeout(500);
ok('Compte : en haut', (await top()) === 0);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(500);
ok('retour Accueil depuis le Compte : position gardée (' + await top() + ')', (await top()) > 300);
// Retour en arrière (2026-10-11) : la liste des cartes d'une extension reprend là où on l'avait laissée.
await page.goto(E2E + '/?today=2026-10-09&start=set&setId=sv08', { waitUntil: 'load' }); await page.waitForTimeout(2500);
await page.evaluate(() => { document.querySelector('#app main').scrollTop = 1200; }); await page.waitForTimeout(300);
const kept = await top();
await page.evaluate(() => document.elementFromPoint(195, 450).closest('button').click()); await page.waitForTimeout(800);
ok('fiche ouverte en haut', (await top()) === 0);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(900);
ok('retour à l’extension : position gardée (' + kept + ' → ' + await top() + ')', kept > 600 && Math.abs((await top()) - kept) < 8);
const setTitle = await page.locator('header h1').innerText();
await page.evaluate(() => document.elementFromPoint(195, 450).closest('button').click()); await page.waitForTimeout(800);
await page.goBack(); await page.waitForTimeout(900);
ok('bouton Retour du téléphone : revient à l’extension, position gardée', (await page.locator('header h1').innerText()) === setTitle && Math.abs((await top()) - kept) < 8);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
