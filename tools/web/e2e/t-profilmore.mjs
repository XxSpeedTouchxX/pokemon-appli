// Mon profil (2026-11-01, porteur) : rubrique Communauté (Discord, App Store, TikTok ; « Bientôt » tant que les liens
// n'existent pas), Nous contacter (e-mail prérempli), conditions générales d'utilisation et politique de confidentialité
// tout en bas, puis la version de l'app (non cliquable) et si elle est à jour.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/\s+/g, ' ').replace(/[  ]/g, ' ').trim();
for (const [w, h] of [[390, 844], [360, 740]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?today=2026-10-31&start=profile', { waitUntil: 'load' }); await page.waitForTimeout(2500);
  const C = page.locator('section[aria-label="Communauté"]');
  if (w === 390) {
    const rows = (await C.locator('.pkm-pc-row').allInnerTexts()).map(N);
    ok('Communauté : ' + rows.join(' | '), rows.length === 3 && /Discord/.test(rows[0]) && /App Store/.test(rows[1]) && /TikTok/.test(rows[2]) && rows.every(r => /Bientôt$/.test(r)));
    const icons = await C.locator('img').evaluateAll(im => im.map(i => i.getAttribute('src').split('/').pop() + ':' + (i.naturalWidth > 0)));
    ok('icônes : ' + icons.join(', '), icons.join(',') === 'discord.svg:true,appstore.svg:true,tiktok.svg:true');
    const mail = page.locator('section[aria-label="Nous contacter"] a');
    ok('Nous contacter : ' + await mail.getAttribute('href'), /^mailto:contact@dropicards\.fr\?subject=Dropicards$/.test(await mail.getAttribute('href')) && /contact@dropicards\.fr/.test(await mail.innerText()));
    const ver = page.locator('.pkm-pc-ver');
    await page.waitForTimeout(800);
    const vt = N(await ver.innerText()), sw = await page.evaluate(() => fetch('sw.js', { cache: 'no-store' }).then(r => r.text()));
    const want = 'v' + /pkm-demo-v(\d+)/.exec(sw)[1];
    ok('version : « ' + vt + ' »', vt === 'Dropicards · version ' + want + ' à jour');
    ok('version non cliquable, tout en bas', await ver.evaluate(e => e.tagName === 'P' && !e.closest('a,button') && getComputedStyle(e).cursor !== 'pointer'
      && !e.nextElementSibling));
    const order = await page.evaluate(() => {
      const q = s => document.querySelector(s), y = s => q(s).getBoundingClientRect().top;
      return [y('section[aria-label="Communauté"]'), y('section[aria-label="Nous contacter"]'), y('nav[aria-label="Informations légales"]'), y('.pkm-pc-ver')];
    });
    ok('ordre : Communauté, Nous contacter, conditions, version', order.every((v, i) => !i || v > order[i - 1]));
    await page.locator('section[aria-label="Communauté"]').scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    await page.screenshot({ path: shot('profilmore-1.png') });
    await page.locator('nav[aria-label="Informations légales"] button', { hasText: 'Conditions générales' }).click(); await page.waitForTimeout(500);
    const tabOn = async () => N(await page.locator('[role="group"][aria-label="Rubriques"] button[aria-pressed="true"]').innerText());
    ok('« Conditions générales d’utilisation » ouvre les conditions (' + await tabOn() + ')', await tabOn() === 'Conditions');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollTo(0, 0));
    const closeBtn = page.locator('button[aria-label="Fermer"]').last();
    if (await closeBtn.isVisible().catch(() => false)) { await closeBtn.click(); await page.waitForTimeout(400); }
    await page.locator('nav[aria-label="Informations légales"] button', { hasText: 'Politique de confidentialité' }).click(); await page.waitForTimeout(500);
    ok('« Politique de confidentialité » ouvre la confidentialité (' + await tabOn() + ')', await tabOn() === 'Confidentialité');
  }
  ok(w + ' px : pas de défilement horizontal', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
