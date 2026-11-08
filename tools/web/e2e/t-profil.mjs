// 2026-10-14 (porteur) : « Mon profil » à la place de « Ton espace » ; photo de profil retirée le 2026-11-08 (porteur) :
// la bulle ouvre « Mon avatar » (t-avatar)
// (recadrée en 256 px, gardée sur l'appareil, affichée dans l'en-tête), « Informations du dresseur » (pseudo, e-mail,
// membre depuis, palier),
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
ok('bulle : « Modifier mon avatar » (plus de photothèque)', (await idt.locator('button[aria-label="Modifier mon avatar"]').count()) === 1 && (await page.locator('#pkm-pf-photo').count()) === 0);
// Avatar enregistré (comme dans « Mon avatar ») : il remplace l'illustration.
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); d.avatarPng = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=='; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
let d = await saved();
ok('bulle : l’avatar enregistré à la place de l’illustration', (await idt.locator('img[src^="data:image/jpeg"]').count()) === 1);
const tr = page.locator('section[aria-label="Informations du dresseur"]');
ok('rubrique « Informations du dresseur » : pseudo, e-mail, membre depuis, palier', (await tr.count()) === 1 && (await tr.locator('input').count()) === 2
  && /Membre depuis/.test(await tr.innerText()) && /Grade/.test(await tr.innerText()) && (await tr.locator('img[src^="img/grades/grade-"]').count()) === 1);
await tr.locator('input[aria-label="Pseudo"]').fill('Nico');
await tr.locator('input[aria-label="Adresse e-mail"]').fill('nico@exemple.fr'); await page.waitForTimeout(300);
await page.screenshot({ path: shot('profil.png') });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
d = await saved();
ok('champs gardés après rechargement : ' + JSON.stringify(d.trainer), d.trainer && d.trainer.name === 'Nico' && d.trainer.email === 'nico@exemple.fr' && (await tr.locator('input[aria-label="Pseudo"]').inputValue()) === 'Nico');
ok('pseudo affiché sous « Mon profil »', /@Nico/.test(await idt.innerText()));
await page.goto(E2E + '/?start=home', { waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('en-tête : l’avatar remplace l’illustration', (await page.locator('header button img[src^="data:image/jpeg"]').count()) === 1);
ok('en-tête : pas de badge Admin', (await page.locator('header button[aria-label="Ouvrir le panneau Admin"]').count()) === 0);
ok('plus de bouton « Retirer ma photo »', (await page.locator('button:has-text("Retirer ma photo")').count()) === 0);
const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
ok('pas de défilement horizontal', !hs);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
