// 2026-10-14 (porteur) : « Mon profil » à la place de « Ton espace », photo de profil choisie dans la photothèque
// (recadrée en 256 px, gardée sur l'appareil, affichée dans l'en-tête), rubrique « Informations du dresseur »,
// plus de badge Admin dans l'en-tête de l'accueil.
import { withFonts, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const KEY = 'pkm-collection-v1';
const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) || '{}'), KEY);
// Petite image PNG 2 × 2 (bleue) pour la photothèque.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGNkYPjPwMDAxMDAwMDAAAAPGgEEXpXgmQAAAABJRU5ErkJggg==', 'base64');

await page.goto(E2E + '/?start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const idt = page.locator('section[aria-label="Identité"]');
ok('titre « Mon profil » (plus « Ton espace »)', /Mon profil/.test(await idt.innerText()) && !/Ton espace/.test(await page.locator('main').innerText()));
ok('bulle : bouton « Choisir une photo de profil dans ma photothèque »', (await idt.locator('button[aria-label="Choisir une photo de profil dans ma photothèque"]').count()) === 1);
await page.setInputFiles('#pkm-pf-photo', { name: 'moi.png', mimeType: 'image/png', buffer: PNG }); await page.waitForTimeout(800);
let d = await saved();
ok('photo recadrée et gardée (' + (d.avatarImg || '').length + ' caractères)', /^data:image\/jpeg;base64,/.test(d.avatarImg || ''));
ok('bulle : « Changer ma photo de profil »', (await idt.locator('button[aria-label="Changer ma photo de profil"]').count()) === 1 && (await idt.locator('img[src^="data:image/jpeg"]').count()) === 1);
const tr = page.locator('section[aria-label="Informations du dresseur"]');
ok('rubrique « Informations du dresseur » : 6 champs', (await tr.count()) === 1 && (await tr.locator('input').count()) === 6);
await tr.locator('input[aria-label="Nom de dresseur"]').fill('Nico');
await tr.locator('input[aria-label="Pokémon préféré"]').fill('Dracaufeu'); await page.waitForTimeout(300);
await page.screenshot({ path: shot('profil.png') });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
d = await saved();
ok('champs gardés après rechargement : ' + JSON.stringify(d.trainer), d.trainer && d.trainer.name === 'Nico' && d.trainer.fav === 'Dracaufeu' && (await tr.locator('input[aria-label="Nom de dresseur"]').inputValue()) === 'Nico');
ok('nom affiché sous « Mon profil »', /Dresseur · Nico/.test(await idt.innerText()));
await page.goto(E2E + '/?start=home', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('en-tête : la photo remplace l’illustration', (await page.locator('header button img[src^="data:image/jpeg"]').count()) === 1);
ok('en-tête : pas de badge Admin', (await page.locator('header button[aria-label="Ouvrir le panneau Admin"]').count()) === 0);
await page.goto(E2E + '/?start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await tr.locator('button:has-text("Retirer ma photo de profil")').click(); await page.waitForTimeout(300);
ok('photo retirée', !(await saved()).avatarImg && (await idt.locator('img[src^="data:image/jpeg"]').count()) === 0);
const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
ok('pas de défilement horizontal', !hs);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
