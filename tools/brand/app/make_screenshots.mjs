// Captures d'écran des fiches App Store et Google Play (2026-11-07, « go » du porteur ; docs/23 §4 travail 4, docs/29).
// La copie de l'app (mobile/www, build DROPI_APP=1) est servie localement et photographiée comme sur un téléphone :
//   - App Store : iPhone 6,9 pouces, 1320 × 2868 (fenêtre 440 × 956, densité 3) ;
//   - Google Play : téléphone, 1080 × 2340 (fenêtre 360 × 780, densité 3).
// Collection de démonstration des tests (mêmes articles que la démo), didacticiel terminé, PA du jour déjà récupérés.
// Les 5 cartes de démo viennent de leurs copies locales ; les autres visuels du CDN TCGdex s'affichent si le réseau
// les laisse passer (sinon, cartes dessinées par l'app : relancer sur une machine connectée pour la version finale).
// Usage : (cd tools/web && DROPI_APP=1 node build.mjs) puis CHROMIUM=… node tools/brand/app/make_screenshots.mjs
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const { chromium } = createRequire(ROOT + 'tools/web/package.json')('playwright-core');
const { serve } = await import(pathToFileURL(ROOT + 'tools/web/e2e/serve.mjs').href);
const WWW = ROOT + 'mobile/www/', OUT = ROOT + 'docs/29-fiches-stores/captures/';
if (!existsSync(WWW + 'app.js')) throw new Error('mobile/www absent : lancer d’abord DROPI_APP=1 node build.mjs dans tools/web');
mkdirSync(OUT, { recursive: true });
const PORT = 8798, BASE = 'http://localhost:' + PORT;
const server = await serve(WWW, PORT);
const DEMO = { 'sv08/238': 'card-pikachu-ex', 'me02.5/272': 'card-mega-meganium-ex', 'sm9/162': 'card-pikachu-zekrom-gx', 'me02.5/288': 'card-favianos-ex', '30th/155': 'card-jirachi-ex' };
const DEVICES = [['iphone-6.9', 440, 956], ['android', 360, 780]];
// Écrans : nom, adresse, action avant la capture.
const SCREENS = [
  ['1-accueil', '/?debug', null],
  ['2-classeur', '/?debug', p => p.evaluate(() => { const h = [...document.querySelectorAll('h2')].find(x => /Mon classeur/.test(x.textContent)); if (h) h.scrollIntoView({ block: 'start' }); })],
  ['3-series', '/?start=sets&debug', null],
  ['4-fiche', '/?start=item&itemId=k1&debug', null],
  ['5-bestiaire', '/?start=market&debug', p => p.evaluate(() => { const s = document.querySelector('section[aria-label="Bestiaire"]'); if (s) s.scrollIntoView({ block: 'start' }); })],
  ['6-pkshop', '/?debug', p => p.evaluate(() => window.__pkm.tab('pkshop'))]
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
let n = 0;
for (const [dev, w, h] of DEVICES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.route(/assets\.tcgdex\.net/, r => {
    const m = r.request().url().match(/\/(sv08\/238|me02\.5\/272|sm9\/162|me02\.5\/288|30th\/155)\//);
    return m ? r.fulfill({ contentType: 'image/webp', body: readFileSync(ROOT + 'web/img/' + DEMO[m[1]] + '.webp') }) : r.continue();
  });
  const page = await ctx.newPage();
  await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'), t = new Date();
    Object.assign(d, { tuto: 'done', onb: 0, pk: 4250, pa: 640, paStreak: 6, paDay: t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0') });
    localStorage.setItem(k, JSON.stringify(d));
  });
  for (const [name, url, act] of SCREENS) {
    await page.goto(BASE + url, { waitUntil: 'load' }); await page.waitForTimeout(2200);
    if (act) { await act(page); await page.waitForTimeout(1200); }
    await page.waitForTimeout(3200); // messages du bas effacés (2,8 s)
    // JPEG qualité 92 (acceptés par Apple et Google) : environ 5 fois plus léger que le PNG dans le dépôt.
    await page.screenshot({ path: OUT + dev + '-' + name + '.jpg', type: 'jpeg', quality: 92 });
    n++;
  }
  await ctx.close();
}
await browser.close(); server.close();
console.log('Captures : ' + n + ' dans docs/29-fiches-stores/captures/');
