// Accueil en 3 pages : glisser (2026-11-06, demande du porteur). Vers la gauche : page suivante si la page est
// complète, sinon rebond et ce qui manque ; vers la droite : page précédente. Doigt (écran tactile imité par Chrome)
// et souris. Page 3 : la création du compte reste un appui sur « Choisir … comme compagnon ».
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const cdp = await ctx.newCDPSession(page);
// Glissement au doigt : de x1 à x2, à mi-hauteur de l'écran (hors des champs).
const swipe = async (x1, x2, y = 150) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y: y }] });
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 6, y: y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(650);
};
const left = () => swipe(330, 90), right = () => swipe(60, 300);
await page.goto(E2E + '/?first=1', { waitUntil: 'load' });
await page.waitForSelector('button:has-text("Créer mon compte")', { timeout: 15000 }); await page.waitForTimeout(800);
const form = page.locator('form[aria-label="Crée ton compte Dropicards"]'), f3 = page.locator('form[aria-label="Ton profil de dresseur"]');
await left();
ok('page 1 → glisser à gauche → page 2 (compte)', (await form.count()) === 1);
await left();
ok('page 2 vide : on reste, « entre ton adresse e-mail »', (await form.count()) === 1 && /entre ton adresse e-mail/.test(await page.locator('.pkm-acc-err').innerText()));
await page.screenshot({ path: shot('swipe-2-vide.png') });
await form.locator('input[name=email]').fill('sacha@exemple.fr');
await left();
ok('page 2 sans mot de passe : on reste, « choisis ton mot de passe »', (await form.count()) === 1 && /choisis ton mot de passe/.test(await page.locator('.pkm-acc-err').innerText()));
await form.locator('input[name=password]').fill('un-mot-de-passe-solide');
await left();
ok('page 2 complète → glisser à gauche → page 3 (profil)', (await f3.count()) === 1);
await right();
ok('page 3 → glisser à droite → page 2, saisies gardées', (await form.count()) === 1 && (await form.locator('input[name=email]').inputValue()) === 'sacha@exemple.fr');
await left();
await left();
ok('page 3 incomplète : on reste, « il manque ton âge »', (await f3.count()) === 1 && /Il manque ton âge/.test(await page.locator('.pkm-acc-err').innerText()));
await f3.locator('button:has-text("Entre 15 et 25 ans")').click();
await f3.locator('input[name=nickname]').fill('Sacha');
await f3.locator('button[aria-label="Découvrir Pikachu"]').click(); await page.waitForTimeout(500);
await left();
ok('page 3 complète : pas de compte créé au glissement, « touche … pour créer ton compte »', (await f3.count()) === 1 && /touche « Choisir Pikachu comme compagnon »/.test(await page.locator('.pkm-acc-err').innerText()));
await page.screenshot({ path: shot('swipe-3.png') });
// Geste vertical (défilement) : rien ne change.
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 160, y: 300 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(500);
ok('défilement vertical : on reste sur la page 3', (await f3.count()) === 1);
// Souris (ordinateur) : glisser à droite deux fois → page 1.
await right(); await right();
ok('glisser à droite deux fois : retour à la page 1', (await page.locator('button:has-text("Créer mon compte")').count()) === 1);
// Souris (ordinateur, sans écran tactile) : glisser à gauche sur la page 1 → page 2.
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx2.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.goto(E2E + '/?first=1', { waitUntil: 'load' });
await p2.waitForSelector('button:has-text("Créer mon compte")', { timeout: 15000 }); await p2.waitForTimeout(800);
await p2.mouse.move(330, 40); await p2.mouse.down(); await p2.mouse.move(200, 40); await p2.mouse.move(80, 40); await p2.mouse.up(); await p2.waitForTimeout(650);
ok('souris : glisser à gauche → page 2', (await p2.locator('form[aria-label="Crée ton compte Dropicards"]').count()) === 1);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
