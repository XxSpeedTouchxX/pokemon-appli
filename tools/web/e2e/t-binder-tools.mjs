// D1 : classeur — tri (cote, récents, nom), filtres (langue, état, rareté, extension), glisser pour changer de page.
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
process.on('uncaughtException', e => { console.log(res.join('\n')); console.log('✗ ERREUR', e.message.split('\n')[0]); process.exit(1); });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const SEC = 'section[aria-label="Mon classeur"]', TILE = SEC + ' [role="tabpanel"] button[aria-label$="Ouvrir la fiche"]';
const names = async () => (await page.locator(TILE).evaluateAll(b => b.map(x => x.getAttribute('aria-label').split(',')[0])));
await page.goto(E2E + '/?today=2026-10-09', { waitUntil: 'load' }); await page.waitForTimeout(1800);
await page.locator(SEC).scrollIntoViewIfNeeded();
const byValue = await names();
ok('tri par cote par défaut (' + byValue.length + ' cartes)', byValue.length === 6 && (await page.locator(SEC + ' [aria-label="Trier le classeur"] button[aria-pressed="true"]').innerText()) === 'Cote');
await page.locator(SEC + ' [aria-label="Trier le classeur"] button:has-text("Nom")').click(); await page.waitForTimeout(200);
const byName = await names();
ok('tri par nom : ' + byName.join(', '), byName.join('|') === byName.slice().sort((a, b) => a.localeCompare(b, 'fr')).join('|'));
await page.locator(SEC + ' [aria-label="Trier le classeur"] button:has-text("Récents")').click(); await page.waitForTimeout(200);
ok('tri récents : Pikachu ex (02/10) en premier', (await names())[0] === 'Pikachu ex');
await page.locator(SEC + ' button:has-text("Filtrer")').click(); await page.waitForTimeout(250);
const fg = page.locator(SEC + ' [aria-label="Filtres du classeur"]');
ok('panneau des filtres ouvert', (await fg.count()) === 1);
await fg.locator('[aria-label="Rareté"] button:has-text("Ultra rares")').click(); await page.waitForTimeout(250);
const ur = await names();
ok('filtre ultra rares et gradées : ' + ur.length, ur.length > 0 && ur.length <= 6);
ok('note « sur 6 · filtre actif » et bouton « Filtres (1) »', /sur 6 · filtre actif/.test(await page.locator(SEC).innerText()) && (await page.locator(SEC + ' button:has-text("Filtres (1)")').count()) === 1);
await fg.locator('[aria-label="Langue"] button:has-text("JP")').click(); await page.waitForTimeout(250);
ok('aucun résultat : message', /Aucun article ne correspond à ces filtres/.test(await page.locator(SEC).innerText()));
await page.screenshot({ path: shot('binder-filters.png') });
await fg.locator('button:has-text("Tout afficher")').click(); await page.waitForTimeout(250);
ok('« Tout afficher » : 6 cartes', (await names()).length === 6);
// Scellé : 15 produits, 4 par page ; glisser vers la gauche → page 2.
await page.locator(SEC + ' [role="tab"]:has-text("Mes produits scellés")').click(); await page.waitForTimeout(300);
const pageLbl = () => page.locator(SEC).innerText().then(t => (t.match(/Page \d+ sur \d+/) || [''])[0]);
const nP = +((await pageLbl()).split(' sur ')[1] || 0);
ok('scellé : ' + await pageLbl(), /Page 1 sur/.test(await pageLbl()) && nP >= 2);
const grid = page.locator(SEC + ' [role="tabpanel"] div[style*="repeat(2"]').first();
const box = await grid.boundingBox();
const swipe = async (x0, x1) => {
  await page.evaluate(([sel, a, b, y]) => {
    const el = document.querySelector(sel), t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { touches: [t(a)], changedTouches: [t(a)], bubbles: true }));
    el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(b)], bubbles: true }));
  }, [SEC + ' [role="tabpanel"] div[style*="repeat(2"]', x0, x1, box.y + 40]);
  await page.waitForTimeout(250);
};
await swipe(box.x + 300, box.x + 60);
ok('glisser à gauche : ' + await pageLbl(), /Page 2 sur/.test(await pageLbl()));
await swipe(box.x + 60, box.x + 300);
ok('glisser à droite : ' + await pageLbl(), /Page 1 sur/.test(await pageLbl()));
await swipe(box.x + 100, box.x + 120);
ok('petit geste ignoré', /Page 1 sur/.test(await pageLbl()));
if (!(await page.locator(SEC + ' [aria-label="Filtres du classeur"]').count())) { await page.locator(SEC + ' button:has-text("Filtrer")').click(); await page.waitForTimeout(200); }
ok('scellé : états du scellé proposés', /Scellé d’origine/.test(await page.locator(SEC + ' [aria-label="Filtres du classeur"]').innerText()) && (await page.locator(SEC + ' [aria-label="Rareté"]').count()) === 0);
const ext = page.locator(SEC + ' select[aria-label="Extension"]');
if (await ext.count()) {
  const opt = await ext.evaluate(s => s.options[1] && s.options[1].value);
  await ext.selectOption(opt); await page.waitForTimeout(250);
  ok('filtre extension « ' + opt + ' »', /filtre actif/.test(await page.locator(SEC).innerText()));
} else ok('filtre extension (une seule extension)', true);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
