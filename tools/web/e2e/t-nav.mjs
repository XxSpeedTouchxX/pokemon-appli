// J1 : chaque changement de page s'ouvre en haut ; les réglages de chaque page sont gardés au retour.
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
await tab('Collection');
ok('Collection : en haut (' + await top() + ')', (await top()) === 0);
const cq = page.locator('main input[type="search"]').first();
await cq.fill('pika'); await page.waitForTimeout(300); await down();
await tab('Marché');
ok('Marché : en haut', (await top()) === 0);
const mq = page.locator('input[aria-label="Rechercher une carte ou un produit"]');
await mq.fill('dracaufeu'); await page.waitForTimeout(600); await down();
// Fiche depuis le Marché, puis retour.
await page.locator('main button:has-text("Dracaufeu")').first().click(); await page.waitForTimeout(700);
ok('fiche : en haut', (await top()) === 0);
await down();
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(600);
ok('retour au Marché : en haut, recherche gardée « ' + await mq.inputValue() + ' »', (await top()) === 0 && (await mq.inputValue()) === 'dracaufeu');
await tab('Territoire');
ok('Territoire : en haut à l’arrivée', (await top()) === 0); await down();
await tab('Collection');
ok('retour Collection : en haut, recherche gardée « ' + await cq.inputValue() + ' »', (await top()) === 0 && (await cq.inputValue()) === 'pika');
await tab('Accueil');
ok('retour Accueil : en haut, onglet scellé gardé', (await top()) === 0 && (await page.getAttribute('section[aria-label="Mon classeur"] [role="tab"]:has-text("Mes produits scellés")', 'aria-selected')) === 'true');
// Profil (avatar) puis retour.
await down();
await page.click('header button[aria-label*="rofil"]'); await page.waitForTimeout(500);
ok('Compte : en haut', (await top()) === 0);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(500);
ok('retour Accueil depuis le Compte : en haut', (await top()) === 0);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
