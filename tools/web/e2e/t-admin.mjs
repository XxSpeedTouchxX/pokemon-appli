// P1 : mode Admin. 7 appuis sur « Version », code choisi puis confirmé, panneau ; solde, déblocages, prix, profil et
// palier forcés, interrupteurs, date simulée ; sortie ; nouvel accès avec le code (faux puis bon).
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || 'null'));
const panel = page.locator('section[aria-label="Panneau Admin"]');
const tap7 = async () => { const v = page.locator('button[aria-label^="Version "]'); for (let i = 0; i < 7; i++) await v.click({ delay: 10 }); await page.waitForTimeout(300); };
const typeCode = async c => { await page.fill('input[aria-label="Code à 6 chiffres"]', c); await page.click('section[aria-label="Code Admin"] button:has-text("Valider")'); await page.waitForTimeout(250); };
await page.goto(BASE + 'start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('version visible dans À propos', (await page.locator('button[aria-label^="Version "]').count()) === 1);
const v = page.locator('button[aria-label^="Version "]');
for (let i = 0; i < 6; i++) await v.click();
ok('6 appuis : rien', (await page.locator('section[aria-label="Code Admin"]').count()) === 0);
await page.waitForTimeout(3200); await tap7();
ok('7 appuis : « ' + await page.locator('section[aria-label="Code Admin"] h2').innerText() + ' »', /Choisis ton code Admin/.test(await page.locator('section[aria-label="Code Admin"] h2').innerText()));
await typeCode('12345');
ok('5 chiffres refusés', /6 chiffres/.test(await page.locator('section[aria-label="Code Admin"]').innerText()));
await typeCode('246810');
ok('confirmation demandée', /Confirme ton code/.test(await page.locator('section[aria-label="Code Admin"] h2').innerText()));
await typeCode('246810');
ok('panneau ouvert', (await panel.count()) === 1);
await page.waitForTimeout(500);
let d = await saved();
ok('code gardé en empreinte seulement : ' + (d.admin ? d.admin.hash : '?'), !!(d.admin && d.admin.on && d.admin.hash) && !JSON.stringify(d).includes('246810'));
await page.screenshot({ path: shot('admin-panneau.png') });
// Solde et déblocages.
await page.fill('input[aria-label="Nouveau solde de PK"]', '2500'); await panel.locator('button:has-text("Fixer le solde")').click(); await page.waitForTimeout(300);
d = await saved(); ok('solde fixé : ' + d.pk, d.pk === 2500);
await panel.locator('button:has-text("Tout débloquer")').click(); await page.waitForTimeout(300);
d = await saved(); ok('tout débloqué : ' + d.pkOwn.length, d.pkOwn.length === 156);
await panel.locator('button:has-text("Tout reverrouiller")').click(); await page.waitForTimeout(300);
// Prix.
await page.fill('input[aria-label="Chercher un compagnon à mettre à prix"]', 'dracaufeu'); await page.waitForTimeout(300);
await page.fill('input[aria-label="Prix de Dracaufeu en PK"]', '777'); await page.waitForTimeout(300);
d = await saved(); ok('prix fixé : Dracaufeu ' + d.admin.prices[6], d.admin.prices[6] === 777);
// Profil et grade forcés.
await panel.locator('[aria-label="Profil forcé"] button:has-text("Passionné")').click(); await page.waitForTimeout(200);
await panel.locator('[aria-label="Grade forcé"] button').nth(1).click(); await page.waitForTimeout(200);
const tierName = await panel.locator('[aria-label="Grade forcé"] button').nth(1).innerText();
// Interrupteurs.
for (const f of ['Bouton Scan', 'Monnaie PK', 'Animations']) await panel.locator('[aria-label="Fonctions affichées"] button:has-text("' + f + '")').click();
await page.waitForTimeout(300);
await page.screenshot({ path: shot('admin-panneau-2.png') });
await panel.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
await page.goto(BASE + 'start=home', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('pas de badge Admin dans l’en-tête (panneau depuis les Réglages)', (await page.locator('header button[aria-label="Ouvrir le panneau Admin"]').count()) === 0);
ok('compteur PK masqué', (await page.locator('header button[aria-label^="Mes PK"]').count()) === 0);
ok('bouton Scan masqué', (await page.evaluate(() => getComputedStyle(document.querySelector('button[aria-label="Scanner une carte ou un produit"]')).visibility)) === 'hidden');
ok('animations coupées', await page.evaluate(() => document.documentElement.classList.contains('pkm-calm')));
await page.click('section[aria-label="Valeur de ma collection"] button[aria-label^="Compagnon"]'); await page.waitForTimeout(400);
ok('PK masqués : aucun compagnon verrouillé', (await page.locator('[aria-label="Compagnons"] button[aria-label*="à débloquer"]').count()) === 0);
await page.keyboard.press('Escape'); await page.click('button[aria-label="Fermer le choix du compagnon"]').catch(() => {});
await page.goto(BASE + 'start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1000);
const idt = await page.locator('section[aria-label="Identité"]').innerText(), cat = await page.locator('section[aria-label="Grade actuel"]').innerText();
ok('grade forcé « ' + tierName + ' » : ' + idt.replace(/\s+/g, ' ').slice(0, 60), cat.includes(tierName) && idt.includes('Grade ' + tierName));
// Date simulée.
await page.goto(BASE + 'start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1000);
await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); d.admin.today = '2026-12-25'; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
await tap7();
ok('mode actif : 7 appuis ouvrent directement le panneau', (await panel.count()) === 1);
ok('date simulée : ' + await panel.locator('span:has-text("Date")').first().innerText(), /Date simulée : 25\/12\/2026/.test(await panel.innerText()));
// Sortie.
await panel.locator('button:has-text("Quitter le mode Admin")').click(); await page.waitForTimeout(300);
await page.goto(BASE + 'start=home', { waitUntil: 'load' }); await page.waitForTimeout(1000);
ok('sortie : compteur et Scan revenus', (await page.locator('header button[aria-label^="Mes PK"]').count()) === 1
  && (await page.evaluate(() => getComputedStyle(document.querySelector('button[aria-label="Scanner une carte ou un produit"]')).visibility)) === 'visible');
// Nouvel accès : faux code, puis bon code.
await page.goto(BASE + 'start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1000);
await tap7();
ok('nouvel accès : « Code Admin »', /^Code Admin$/.test((await page.locator('section[aria-label="Code Admin"] h2').innerText()).trim()));
await typeCode('111111');
ok('faux code refusé', /Code incorrect/.test(await page.locator('section[aria-label="Code Admin"]').innerText()) && (await panel.count()) === 0);
await typeCode('246810');
ok('bon code : panneau', (await panel.count()) === 1);
ok('360 : panneau sans défilement horizontal', await (async () => { await page.setViewportSize({ width: 360, height: 740 }); await page.waitForTimeout(200); return !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)); })());
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
