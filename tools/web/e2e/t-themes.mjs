// Thèmes des compagnons : Kyogre (océan), Groudon (volcan), Rayquaza (vert et blanc) ; retour au jaune ; gardé après
// rechargement ; barre du navigateur ; message ; thème classique inchangé. Captures de chaque thème.
import { withFonts, withDemoCards, unlockPaid, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-04';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await withFonts(ctx); await ctx.unroute(/openfreemap|tcgdex|pokemontcg/); await ctx.route(/openfreemap|pokemontcg/, r => r.abort()); await withDemoCards(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const pick = async name => {
  await page.click('button[aria-label^="Compagnon"]'); await page.waitForTimeout(300);
  await page.fill('input[aria-label="Chercher un Pokémon"]', name); await page.waitForTimeout(250);
  await page.locator('[aria-label="Compagnons"] button').first().click(); await page.waitForTimeout(700);
};
const state = () => page.evaluate(() => ({
  cls: [...document.documentElement.classList].filter(c => c.indexOf('pkm-theme') === 0 || c === 'pkm-classic').join(' '), bar: document.querySelector('meta[name="theme-color"]').content,
  bg: getComputedStyle(document.querySelector('.pkm-root')).backgroundImage, t1: getComputedStyle(document.querySelector('#app main h2')).color
}));
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1000); await unlockPaid(page);
const base = await state();
ok('jaune par défaut (Pikachu) : barre ' + base.bar, base.cls === '' && base.bar === '#FFD60A' && /255, 214, 10/.test(base.bg));
for (const [name, key, bar, color] of [['Kyogre', 'sea', '#0A4893', /10, 72, 147/], ['Groudon', 'lava', '#9E1F18', /158, 31, 24/], ['Rayquaza', 'storm', '#174D48', /23, 77, 72/]]) {
  await pick(name);
  const st = await state(), toast = await page.locator('#app').innerText();
  ok(name + ' : thème ' + st.cls + ', barre ' + st.bar + ', titres ' + st.t1, st.cls === 'pkm-theme-' + key && st.bar === bar && color.test(st.bg));
  ok(name + ' : message « thème »', new RegExp(name + ' t’accompagne · thème ').test(toast));
  await page.screenshot({ path: shot('theme-' + key + '-1.png') });
  await page.evaluate(() => document.querySelector('section[aria-label="Mon classeur"]').scrollIntoView({ block: 'start' })); await page.waitForTimeout(600);
  await page.screenshot({ path: shot('theme-' + key + '-2.png') });
  await page.evaluate(() => document.querySelector('section[aria-label="Boutiques près de toi"]').scrollIntoView({ block: 'start' })); await page.waitForTimeout(500);
  await page.screenshot({ path: shot('theme-' + key + '-3.png') });
  await page.evaluate(() => { const m = document.querySelector('#app main'); m.scrollTop = 0; }); await page.waitForTimeout(300);
}
// Gardé après rechargement, et sur les autres onglets.
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(2000);
ok('après rechargement : ' + (await state()).cls, (await state()).cls === 'pkm-theme-storm');
await page.click('button[aria-label="Toutes les séries"]').catch(() => {}); await page.waitForTimeout(800);
ok('onglet Collection : même thème', (await page.evaluate(() => [...document.documentElement.classList].filter(c => c.indexOf('pkm-theme') === 0 || c === 'pkm-classic').join(' '))) === 'pkm-theme-storm');
await page.screenshot({ path: shot('theme-storm-collection.png') });
await page.click('button[aria-label="Accueil"]').catch(() => {}); await page.waitForTimeout(800);
// Retour au jaune avec un autre compagnon.
await pick('Pikachu');
const back = await state();
ok('Pikachu : retour au jaune', back.cls === '' && back.bar === '#FFD60A' && /255, 214, 10/.test(back.bg));
// Thème classique : pas de thème de compagnon.
await pick('Kyogre');
await page.goto(BASE + '&theme=classic', { waitUntil: 'load' }); await page.waitForTimeout(1500);
const cl = await page.evaluate(() => ({ cls: [...document.documentElement.classList].filter(c => c.indexOf('pkm-theme') === 0 || c === 'pkm-classic').join(' '), bar: document.querySelector('meta[name="theme-color"]').content, bg: getComputedStyle(document.querySelector('.pkm-root')).backgroundImage }));
ok('thème classique : fond inchangé (' + cl.bar + ')', /pkm-classic/.test(cl.cls) && cl.bar === '#0B1120' && !/10, 72, 147/.test(cl.bg));
ok('aucune erreur JS' + (errors.length ? ' : ' + errors.join(' | ') : ''), errors.length === 0);
await browser.close();
console.log(res.join('\n'));
console.log(res.filter(r => r.startsWith('✓')).length + '/' + res.length);
