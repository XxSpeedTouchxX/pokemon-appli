// H1, H4 : informations légales depuis À propos et depuis « Mes PK » ; 4 rubriques ; champs de l'éditeur à compléter.
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button:has-text("Informations légales et confidentialité")'); await page.waitForTimeout(400);
const sh = page.locator('section[aria-label="Informations légales"]');
ok('panneau ouvert : ' + await sh.locator('h2').innerText(), (await sh.locator('h2').innerText()) === 'Mentions légales');
const t1 = await sh.innerText();
ok('mentions : hébergeur, non-affiliation, éditeur à compléter', /Cloudflare, Inc\./.test(t1) && /non affiliée à Nintendo, GAME FREAK ou The Pokémon Company/.test(t1) && /à compléter par l’éditeur/.test(t1));
await page.screenshot({ path: shot('legal-mentions.png') });
for (const [tab, re] of [['Confidentialité', /arrondie à environ 100 m/], ['Conditions', /pas une plateforme de vente/], ['PK et jeux', /ne s’achètent pas, ne se vendent pas/]]) {
  await sh.locator('[aria-label="Rubriques"] button:has-text("' + tab + '")').click(); await page.waitForTimeout(250);
  ok(tab + ' : texte attendu', re.test(await sh.innerText()) && (await sh.locator('h2').innerText()) === tab);
}
await page.screenshot({ path: shot('legal-pk.png') });
await sh.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
ok('fermé', (await sh.count()) === 0);
await page.goto(E2E + '/', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('header button[aria-label^="Mes PK"]'); await page.waitForTimeout(300);
await page.click('section[aria-label="Mes PK"] button:has-text("Règles des PK")'); await page.waitForTimeout(300);
ok('depuis « Mes PK » : PK et jeux', (await page.locator('section[aria-label="Informations légales"] h2').innerText()) === 'PK et jeux');
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
