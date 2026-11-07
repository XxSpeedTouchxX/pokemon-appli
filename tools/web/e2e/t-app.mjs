// App iOS et Android (2026-11-07, « go » du porteur ; docs/23, docs/29) : la copie de l'app (mobile/www, build
// DROPI_APP=1) est servie et parcourue comme sur le téléphone. Vérifie ce qui la distingue du site :
// pas de Premium, de « Recharger mes PA », de mode Admin, de « Démo », de gain pour un partage, ni de nom « Pokédex » ;
// éléments originaux (cristaux d'Aura, emblèmes à la gemme) ; règlement des tirages et « Supprimer mon compte ».
// Lancer : (cd tools/web && DROPI_APP=1 node build.mjs) puis npm run e2e -- app
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { launch, ROOT, shot } from './helpers.mjs';
import { serve } from './serve.mjs';
const WWW = ROOT + 'mobile/www/';
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
if (!existsSync(WWW + 'app.js')) { console.log('✗ mobile/www absent : lancer d’abord DROPI_APP=1 node build.mjs'); process.exit(1); }
const PORT = Number(process.env.E2E_APP_PORT || 8796), BASE = 'http://localhost:' + PORT;
const server = await serve(WWW, PORT);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const N = t => String(t || '').replace(/[\s  ]+/g, ' ').trim();
// « Collection Ultra-Premium » et « Collection Premium … » sont des noms de vrais produits scellés : seul l’abonnement Premium est interdit.
const FORBID = /(?<!Ultra-|Collection )Premium|Recharger mes PA|Pokédex|Pokévolution|Démo|démo|\+300|Stripe/;
const seen = [];
const scan = async label => { const t = N(await page.locator('#app').innerText()); const m = t.match(FORBID); seen.push(label); ok(label + ' : aucun mot interdit' + (m ? ' (trouvé « ' + m[0] + ' »)' : ''), !m); return t; };

// Fichiers : rien des jeux vidéo ni du site seulement.
const h = f => createHash('sha256').update(readFileSync(f)).digest('hex');
ok('cristaux d’Aura à la place des sprites (Pikachu, Dracaufeu, mascotte)', ['25.png', '6.gif', 'icon/150.png', 'talk/25-1.png'].every(f => existsSync(WWW + 'img/pokemon/' + f) && h(WWW + 'img/pokemon/' + f) !== h(ROOT + 'web/img/pokemon/' + f)));
ok('emblèmes de grade à la gemme des PK (sans Poké Ball)', [1, 6].every(i => /Gemme|gem|L[\d.]+ [\d.]+ Z" fill="#FFD60A"/.test(readFileSync(WWW + 'img/grades/grade-' + i + '.svg', 'utf8')) && h(WWW + 'img/grades/grade-' + i + '.svg') !== h(ROOT + 'web/img/grades/grade-' + i + '.svg')));
ok('avatar par défaut original (plus l’illustration de Jirachi)', h(WWW + 'img/avatar-jirachi.webp') !== h(ROOT + 'web/img/avatar-jirachi.webp'));
ok('appareil du Bestiaire recoloré (plus de rouge)', !/#E2202F|#3A0A0E/i.test(readFileSync(WWW + 'img/brand/pokedex-device.svg', 'utf8')));
ok('ni service worker, ni pages publiques du site, ni modèles d’e-mail', !existsSync(WWW + 'sw.js') && !existsSync(WWW + 'confidentialite') && !existsSync(WWW + 'email'));
const appJs = readFileSync(WWW + 'app.js', 'utf8');
ok('code de l’app : ni offre Premium, ni Stripe, ni « Pokédex »', !/Devenir Premium|checkout\.stripe|Pokédex/.test(appJs) && /DROPI_APP|Bestiaire/.test(appJs));

// Accueil après l'accueil guidé (collection de démo des tests, grade maximal).
await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; d.pk = 900; localStorage.setItem(k, JSON.stringify(d)); });
await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1800);
await scan('accueil');
const buddy = await page.evaluate(() => [...document.querySelectorAll('img')].map(i => i.getAttribute('src') || '').filter(s => /img\/pokemon\//.test(s)).slice(0, 3));
ok('compagnon de l’accueil : image de img/pokemon (cristal) · ' + buddy.join(', '), buddy.length >= 1);
await page.screenshot({ path: shot('app-accueil.png') });

// Mes PK : pas de gain pour un partage, le partage reste.
await page.click('header button[aria-label^="Mes PK"]'); await page.waitForTimeout(400);
const pkT = N(await page.locator('section[aria-label="Mes PK"]').innerText());
ok('Mes PK : gains sans partage, partage gardé sans récompense', !/\+300/.test(pkT) && /Fais découvrir Dropicards/.test(pkT));
await page.keyboard.press('Escape'); await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);

// PK shop : seulement le Magasin ; règlement des tirages.
await page.evaluate(() => window.__pkm.tab('pkshop')); await page.waitForTimeout(900);
await scan('PK shop');
ok('PK shop : pas de rubriques (Magasin seul), articles affichés', (await page.locator('[role="tablist"][aria-label="PK shop"]').count()) === 0 && (await page.locator('section[aria-label="Recharger mes PA"]').count()) === 0 && (await page.locator('section.pkm-shop-item, .pkm-shop-tk').count()) >= 1);
await page.screenshot({ path: shot('app-pkshop.png') });
await page.locator('button:has-text("Règlement des tirages")').first().click(); await page.waitForTimeout(400);
const reg = page.locator('section[aria-label="Informations légales"]');
const regT = N(await reg.innerText());
ok('règlement des tirages : organisateur, Apple et Google non partenaires, gratuité, lots', /Article 1 · Organisateur/.test(regT) && /Apple Inc\. et Google LLC ne sont ni organisateurs/.test(regT) && /gratuite et sans obligation d’achat/.test(regT) && /Article 7 · Lots/.test(regT));
await reg.screenshot({ path: shot('app-reglement.png') });
await reg.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);

// Jeux et Bestiaire.
await page.goto(BASE + '/?start=market&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await scan('Jeux');
const best = page.locator('section[aria-label="Bestiaire"]');
ok('Bestiaire présent (ex-« Pokédex »)', (await best.count()) >= 1);
if (await best.count()) await best.first().screenshot({ path: shot('app-bestiaire.png') });

// Mon profil : Supprimer mon compte (fenêtre, Annuler), pas de Premium ; Réglages : pas d'Admin.
await page.goto(BASE + '/?start=profile&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await scan('Mon profil');
await page.locator('button.pkm-del-open').click(); await page.waitForTimeout(300);
const del = page.locator('section[aria-label="Supprimer mon compte"]');
ok('« Supprimer mon compte » : confirmation définitive', (await del.count()) === 1 && /définitif/.test(N(await del.innerText())));
await del.screenshot({ path: shot('app-supprimer.png') });
await del.locator('button:has-text("Annuler")').click(); await page.waitForTimeout(300);
ok('Annuler ferme la fenêtre, rien n’est effacé', (await del.count()) === 0 && (await page.evaluate(() => !!localStorage.getItem('pkm-collection-v1'))));
await page.goto(BASE + '/?start=settings&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await scan('Réglages');
const ver = page.locator('button[aria-label^="Version"]');
for (let i = 0; i < 8; i++) await ver.click();
await page.waitForTimeout(400);
ok('7 appuis sur « Version » : ni panneau ni message Admin', (await page.locator('section[aria-label="Panneau Admin"]').count()) === 0 && !/Admin/.test(N(await page.locator('#app').innerText())));

// Territoire : jamais l'encadré des partenaires fictifs.
await page.goto(BASE + '/?start=territory&debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
await scan('Territoire');

ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close(); server.close();
