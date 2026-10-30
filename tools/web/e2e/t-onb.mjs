// Premier écran (2026-10-30, demande du porteur) : cinq cartes gardées dans l'app (web/img/onb/), « Commencer
// l'aventure ! » mène à la création du compte (e-mail, mot de passe de 12 caractères au moins, nouveautés décochées),
// puis au pseudo de dresseur ; le mot de passe n'est jamais enregistré ; « Passer » seulement quand le compte existe ;
// Mon profil : « Retour à la page d'accueil », plus de « Ventes et marge ».
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?first=1', { waitUntil: 'load' });
await page.waitForSelector('button:has-text("Commencer l’aventure")', { timeout: 15000 });
await page.waitForTimeout(800);
const fan = await page.evaluate(() => [...document.querySelectorAll('section[aria-label^="Bienvenue"] img')].map(i => [i.getAttribute('src'), i.naturalWidth]));
ok('cinq cartes de l’app : ' + fan.map(f => f[0].replace('img/onb/', '')).join(', '), fan.length === 5 && fan.every(f => /^img\/onb\/.+\.webp$/.test(f[0]) && f[1] > 100));
ok('pas de « Passer » avant le compte', (await page.locator('button:has-text("Passer")').count()) === 0);
await page.screenshot({ path: shot('onb-1.png') });
await page.click('button:has-text("Commencer l’aventure")'); await page.waitForTimeout(400);
const form = page.locator('form[aria-label="Crée ton compte Dropicards"]');
ok('création du compte (sans les questions du profil)', (await form.count()) === 1 && !(await page.locator('body').innerText()).includes('Faisons connaissance'));
await form.locator('input[name=email]').fill('pas-une-adresse');
await form.locator('button[type=submit]').click(); await page.waitForTimeout(250);
ok('adresse invalide refusée', /Adresse e-mail invalide/.test(await page.locator('.pkm-acc-err').innerText()));
await form.locator('input[name=email]').fill('sacha@exemple.fr'); await form.locator('input[name=password]').fill('court');
await form.locator('button[type=submit]').click(); await page.waitForTimeout(250);
ok('mot de passe trop court refusé', /au moins 12 caractères/.test(await page.locator('.pkm-acc-err').innerText()));
ok('nouveautés décochées par défaut', !(await form.locator('input[name=news]').isChecked()));
await form.locator('input[name=password]').fill('un-mot-de-passe-solide');
await page.screenshot({ path: shot('onb-2-compte.png') });
await form.locator('button[type=submit]').click(); await page.waitForTimeout(400);
const nick = page.locator('form[aria-label="Ton pseudo de dresseur"]');
ok('puis le pseudo de dresseur', (await nick.count()) === 1);
await nick.locator('input[name=nickname]').fill('Sacha du Bourg'); await nick.locator('button[type=submit]').click(); await page.waitForTimeout(1500);
const st = await page.evaluate(() => { const t = localStorage.getItem('pkm-collection-v1') || ''; const d = JSON.parse(t || '{}'); return { acc: d.account, tr: d.trainer, pwd: t.includes('solide') }; });
ok('compte et pseudo gardés, mot de passe jamais enregistré (' + JSON.stringify(st.acc) + ')', st.acc && st.acc.email === 'sacha@exemple.fr' && st.acc.news === false && st.tr.name === 'Sacha du Bourg' && st.tr.email === 'sacha@exemple.fr' && !st.pwd);
// Mon profil.
await page.goto(E2E + '/?start=profile', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const prof = await page.locator('main').innerText();
ok('Mon profil : pseudo, « Retour à la page d’accueil », sans « Ventes et marge »', /Sacha du Bourg/.test(prof) && /Retour à la page d’accueil/.test(prof) && !/Ventes et marge/.test(prof));
await page.click('button:has-text("Retour à la page d’accueil")'); await page.waitForTimeout(600);
ok('accueil revu : « Passer » présent, « Commencer l’aventure ! » ramène à l’app', (await page.locator('button:has-text("Passer")').count()) === 1);
await page.click('button:has-text("Commencer l’aventure")'); await page.waitForTimeout(600);
ok('pas de second compte', (await page.locator('form[aria-label="Crée ton compte Dropicards"]').count()) === 0 && (await page.locator('section[aria-label^="Bienvenue"]').count()) === 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
