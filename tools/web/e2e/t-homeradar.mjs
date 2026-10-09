import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// Radar de l'accueil : position, balayage, repères nom + ville cliquables dès leur apparition, fiche, animations réduites.
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
const visible = page => page.$$eval(SEC + ' button[aria-label$="Ouvrir la fiche"]', bs => bs.map(b => getComputedStyle(b).visibility === 'visible' && +getComputedStyle(b).opacity > 0.5));
// 1. Sans position.
{
  const page = await mk();
  await page.addInitScript(() => { navigator.geolocation.getCurrentPosition = (ok, ko) => setTimeout(() => ko({ code: 1 }), 300); });
  await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  ok('sans position : « Me localiser » et « Carte de France »', (await page.locator(SEC + ' button:has-text("Me localiser")').count()) === 1 && (await page.locator(SEC + ' button:has-text("Carte de France")').count()) === 1);
  await page.click(SEC + ' button:has-text("Me localiser")'); await page.waitForTimeout(800);
  ok('position refusée : message', /Position refusée/.test(await page.locator(SEC).innerText()));
  await page.context().close();
}
// 2. Position à Lyon, autorisation déjà donnée.
const page = await mk({ geolocation: { latitude: 45.764, longitude: 4.8357 }, permissions: ['geolocation'] });
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(3000);
const status0 = await page.locator(SEC + ' [role="status"]').innerText();
ok('position retrouvée seule : ' + status0, /boutiques à moins de 5 km : lance le scan/.test(status0));
ok('avant le scan : aucun repère', (await page.locator(SEC + ' button[aria-label$="Ouvrir la fiche"]').count()) === 0);
await page.locator(SEC).scrollIntoViewIfNeeded();
await page.click(SEC + ' button:has-text("Scanner les boutiques")'); await page.waitForTimeout(700);
const mid = await visible(page);
ok('pendant le balayage : ' + mid.filter(Boolean).length + ' repères apparus sur ' + mid.length, mid.length >= 5 && mid.some(Boolean) && mid.some(v => !v));
ok('faisceau visible', (await page.locator(SEC + ' div[style*="conic-gradient"]').count()) === 1);
const pinLabel = await page.$$eval(SEC + ' button[aria-label$="Ouvrir la fiche"]', bs => { const b = bs.find(x => getComputedStyle(x).visibility === 'visible'); return b ? [b.getAttribute('aria-label'), b.innerText] : null; });
ok('repère : nom et ville affichés · ' + (pinLabel ? pinLabel[1].replace('\n', ' / ') : '?'), !!pinLabel && pinLabel[1].split('\n').length === 2);
await page.screenshot({ path: shot('homeradar-balayage.png') });
// Appui sur un repère apparu, pendant le balayage.
const name = pinLabel[1].split('\n')[0];
await page.locator(SEC + ' button[aria-label$="Ouvrir la fiche"]', { hasText: name }).first().click(); await page.waitForTimeout(900);
ok('appui pendant le balayage : fiche « ' + name + ' »', (await page.locator('h1').first().innerText()).includes(name) && /pas un stock réel/.test(await page.locator('main').innerText()));
ok('fiche : ville exacte · ' + (await page.locator('main').innerText()).split('\n').find(l => /\(\d{2}\)/.test(l)), /[A-Za-zéè-]+( \d+(er|e))? · [A-Za-zéèô-]+ \(\d{2}\)/.test(await page.locator('main').innerText()));
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(3500);
const after = await visible(page);
ok('retour à l’accueil : ' + after.length + ' repères visibles', after.length >= 5 && after.every(Boolean));
ok('statut après scan : ' + await page.locator(SEC + ' [role="status"]').innerText(), /position à 100 m près/.test(await page.locator(SEC + ' [role="status"]').innerText()));
ok('bouton : ' + await page.locator(SEC + ' button:has-text("Scanner à nouveau")').count(), (await page.locator(SEC + ' button:has-text("Scanner à nouveau")').count()) === 1);
await page.locator(SEC).screenshot({ path: shot('homeradar.png') });
// Repères dans le cadre, sans chevauchement.
const boxes = await page.$$eval(SEC + ' button[aria-label$="Ouvrir la fiche"] > span', ss => ss.map(s => { const r = s.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }));
const frame = await page.locator(SEC + ' div[style*="aspect-ratio: 1 / 1"]').boundingBox();
ok('repères dans le cadre', boxes.every(b => b[0] >= frame.x - 1 && b[2] <= frame.x + frame.width + 1 && b[1] >= frame.y - 1 && b[3] <= frame.y + frame.height + 1));
const overlap = boxes.some((a, i) => boxes.some((b, j) => i < j && a[0] < b[2] - 2 && b[0] < a[2] - 2 && a[1] < b[3] - 2 && b[1] < a[3] - 2));
ok('repères sans chevauchement', !overlap);
ok('pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
await page.context().close();
// 3. Animations réduites : boutiques tout de suite, pas de faisceau.
const p3 = await mk({ geolocation: { latitude: 45.764, longitude: 4.8357 }, permissions: ['geolocation'], reducedMotion: 'reduce', viewport: { width: 360, height: 740 } });
await p3.goto(BASE, { waitUntil: 'load' }); await p3.waitForTimeout(3000);
await p3.click(SEC + ' button:has-text("Scanner les boutiques")'); await p3.waitForTimeout(200);
const v3 = await visible(p3);
ok('animations réduites : ' + v3.length + ' repères tout de suite, sans faisceau', v3.length >= 5 && v3.every(Boolean) && (await p3.locator(SEC + ' div[style*="conic-gradient"]').count()) === 0);
ok('360 : pas de défilement horizontal', !(await p3.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
await p3.context().close();
console.log(res.join('\n')); console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
