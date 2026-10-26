// Scan rapide (2026-10-25, porteur) : une fausse caméra filme la carte de test (Zekrom TG05/TG30) ; la carte doit être
// reconnue vite (objectif 1,5 s, mesuré ici sur la machine de test), sa fiche s'ouvrir directement avec la carte, sa
// valeur Cardmarket, les 6 états illustrés et « Ajouter à ma collection », puis l'ajout arriver dans le classeur.
import { writeFileSync, readFileSync } from 'node:fs';
import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
// 1. Vidéo de la fausse caméra : la photo de test réduite au centre d'une image portrait 720 × 1280, en MJPEG.
const OUT = ROOT + 'tools/web/e2e/out/', CAM = OUT + 'scan-cam.mjpeg';
{
  const b = await launch(), p = await b.newPage();
  const jpg = await p.evaluate(async src => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = 720; c.height = 1280;
    const g = c.getContext('2d'); g.fillStyle = '#5A4A3A'; g.fillRect(0, 0, 720, 1280);
    const w = 470, h = w * img.naturalHeight / img.naturalWidth; g.drawImage(img, (720 - w) / 2, (1280 - h) / 2 - 85, w, h);
    return c.toDataURL('image/jpeg', 0.92).split(',')[1];
  }, 'data:image/jpeg;base64,' + readFileSync(ROOT + 'tools/web/e2e/files/photo-tg05.jpg').toString('base64'));
  const frame = Buffer.from(jpg, 'base64');
  writeFileSync(CAM, Buffer.concat(Array.from({ length: 10 }, () => frame)));
  await b.close();
}
// 2. L'app avec cette caméra.
const exe = process.env.CHROMIUM || undefined;
const browser = await chromium.launch({ executablePath: exe, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture=' + CAM] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: ['camera'] });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?start=scan&today=2026-10-04', { waitUntil: 'load' });
// Temps : de la caméra prête (lecture en cours) jusqu'à la fiche de la carte.
let tLive = 0;
const t0 = Date.now();
while (Date.now() - t0 < 90000) {
  const st = await page.evaluate(() => ({ sheet: !!document.querySelector('section[aria-label="Résultat du scan"]'), txt: document.body.innerText }));
  if (!tLive && !/Préparation de la lecture|Ouverture de la caméra/.test(st.txt) && /Place la carte dans le cadre/.test(st.txt)) tLive = Date.now();
  if (st.sheet) break;
  await page.waitForTimeout(40);
}
const tRes = Date.now(), sheet = page.locator('section[aria-label="Résultat du scan"]');
const ms = tLive ? tRes - tLive : -1;
ok('carte reconnue en ' + ms + ' ms après le démarrage de la lecture (objectif 1 500 ms sur téléphone)', (await sheet.count()) === 1 && ms > 0 && ms <= 1500);
const txt = (await sheet.innerText()).replace(/\s+/g, ' ');
ok('fiche directe : ' + txt.slice(0, 90) + '…', /Zekrom/.test(txt) && /TG05/.test(txt) && (await page.locator('section[aria-label="C’est laquelle ?"]').count()) === 0);
ok('carte affichée en grand', await sheet.locator('.pkm-scan-card img').evaluate(i => i.getBoundingClientRect().width >= 150));
ok('valeur Cardmarket affichée', /Valeur Cardmarket/.test(txt) && /€|Pas encore de cote/.test(txt));
const conds = sheet.locator('[aria-label="État"] button');
ok('6 états illustrés : ' + (await conds.allInnerTexts()).map(t => t.split('\n')[0]).join(', '), (await conds.count()) === 6 && (await conds.locator('img').count()) === 6);
const val = async () => (await sheet.locator('section[aria-label="Valeur de la carte"]').innerText()).replace(/\s+/g, ' ');
const vNM = await val(); await conds.nth(0).click(); await page.waitForTimeout(150); const vMT = await val();
ok('la valeur suit l’état (Near Mint → Mint) : ' + vMT, vMT !== vNM && /Mint · 115 %/.test(vMT));
await page.screenshot({ path: shot('scan-fiche.png') });
await sheet.locator('button:has-text("Ajouter à ma collection")').click(); await page.waitForTimeout(700);
const saved = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); const l = d.purchases.slice(-1)[0].lines[0]; return { pid: l.pid, cond: l.cond }; });
ok('ajout enregistré : ' + saved.pid + ' · ' + saved.cond, /tg05/i.test(saved.pid) && saved.cond === 'MT');
ok('retour à la caméra pour la carte suivante', (await page.locator('section[aria-label="Résultat du scan"]').count()) === 0);
await page.goto(E2E + '/?start=home&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('la carte scannée est dans « Mon classeur »', (await page.locator('section[aria-label="Mon classeur"] button[aria-label^="Zekrom"]').count()) > 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
