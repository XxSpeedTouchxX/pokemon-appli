import { launch, BASE as E2E, shot } from './helpers.mjs';
// Radar de l'accueil simplifié (2026-10-11, demande du porteur) : bandeau vert comme « Radar des boutiques » de
// Territoire ; sans position, il l'active ; avec position, nombre de boutiques à 5 km, les 3 plus proches (nom, ville,
// distance, indice) qui ouvrent leur fiche ; le bandeau ouvre le Radar plein écran ; aucun badge partenaire.
import { withFont } from './hero.mjs';
const BASE = E2E + '/?today=2026-10-04';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const SEC = 'section[aria-label="Boutiques près de toi"]';
const mk = async (opts = {}) => {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }, opts)); await withFont(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  return page;
};
// 1. Sans position.
let page = await mk();
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2000);
const main = page.locator(SEC + ' button[aria-label="Radar des boutiques : activer ma position"]');
ok('sans position : bandeau « activer ma position »', (await main.count()) === 1);
ok('mention de confidentialité', /ni enregistrée ni envoyée/.test(await page.locator(SEC).innerText()));
await page.locator(SEC).scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('homeradar-1-sans-position.png') });
// 2. Position accordée (Paris).
page = await mk({ geolocation: { latitude: 48.8566, longitude: 2.3522 }, permissions: ['geolocation'] });
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2000);
await page.locator(SEC + ' button[aria-label^="Radar des boutiques"]').click().catch(() => {});
await page.waitForSelector(SEC + ' button[aria-label="Ouvrir le Radar des boutiques"]', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(1500);
const txt = await page.locator(SEC).innerText();
ok('avec position : « N boutiques à moins de 20 km »', /\d+ boutiques? à moins de 20 km/.test(txt));
const rows = page.locator(SEC + ' button[aria-label$="Ouvrir la fiche"]');
ok('3 boutiques les plus proches : ' + await rows.count(), (await rows.count()) === 3);
ok('logo ou pictogramme en face de chaque boutique', (await rows.evaluateAll(l => l.filter(b => b.querySelector('span[aria-hidden="true"] img, span[aria-hidden="true"] svg')).length)) === 3);
ok('ligne : nom, ville, distance, indice en %', /chance estimée \d+ %/.test(await rows.first().getAttribute('aria-label')) && /\d+\s?%/.test(await rows.first().innerText()));
ok('aucun badge partenaire', !/[Pp]artenaire/.test(txt));
await page.locator(SEC).scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('homeradar-2-proches.png') });
await rows.first().click(); await page.waitForTimeout(600);
ok('une ligne ouvre la fiche de la boutique', (await page.locator('a:has-text("Itinéraire"), button:has-text("Itinéraire")').count()) > 0);
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(600);
await page.click(SEC + ' button[aria-label="Ouvrir le Radar des boutiques"]'); await page.waitForTimeout(800);
ok('le bandeau ouvre le Radar plein écran', (await page.locator('[aria-label*="Radar"]').count()) > 0 && (await page.locator(SEC).count()) === 0);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
