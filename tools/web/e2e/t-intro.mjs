// K1 : animation d'entrée, complète à chaque démarrage (2026-10-11). Complète (?intro=1) puis retirée en moins de 2,3 s ; un appui la passe ; version éclair ;
// animations réduites ; absente pour un navigateur de test ; l'app se charge en dessous pendant ce temps.
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const B = E2E + '/';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
// Visible : l'animation est masquée à la fin (gardée pour être rejouée au retour dans l'app, 2026-10-11).
const gone = () => { const el = document.getElementById('pkm-intro'); return !el || el.style.display === 'none'; };
const has = () => page.evaluate(gone).then(g => !g);
let t0 = Date.now();
await page.goto(B + '?intro=1', { waitUntil: 'domcontentloaded' });
ok('complète : affichée (' + await page.evaluate(() => document.getElementById('pkm-intro') && document.getElementById('pkm-intro').className) + ')', await has() && (await page.evaluate(() => document.getElementById('pkm-intro').className)) === 'pi-full');
await page.waitForFunction(gone, null, { timeout: 4000 }).catch(() => {});
const dur = Date.now() - t0;
ok('retirée après ' + dur + ' ms (≤ 2 300 ms)', !(await has()) && dur <= 2300);
ok('l’app est prête dessous', (await page.locator('header img[alt="Dropicards"]').count()) === 1);
// Appui pour passer.
await page.goto(B + '?intro=1', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(300);
t0 = Date.now(); await page.mouse.click(195, 420);
await page.waitForFunction(gone, null, { timeout: 2000 }).catch(() => {});
ok('appui : passée en ' + (Date.now() - t0) + ' ms', !(await has()) && Date.now() - t0 < 600);
// Version éclair.
t0 = Date.now(); await page.goto(B + '?intro=court', { waitUntil: 'domcontentloaded' });
ok('éclair : classe pi-short', (await page.evaluate(() => document.getElementById('pkm-intro') && document.getElementById('pkm-intro').className)) === 'pi-short');
await page.waitForFunction(gone, null, { timeout: 2000 }).catch(() => {});
ok('éclair : ' + (Date.now() - t0) + ' ms', !(await has()) && Date.now() - t0 < 1000);
// Navigateur de test sans forçage : rien.
await page.goto(B, { waitUntil: 'domcontentloaded' });
ok('navigateur de test : pas d’animation', !(await has()));
// Animations réduites.
const ctx2 = await browser.newContext({ viewport: { width: 360, height: 740 }, reducedMotion: 'reduce' }); await withFonts(ctx2);
const p2 = await ctx2.newPage();
// La version calme ne dure que 0,65 s : la classe est relevée dès qu'elle est posée (machine lente comprise).
await p2.addInitScript(() => {
  new MutationObserver(() => { const el = document.getElementById('pkm-intro'); if (el && el.className && !window.__introCls) window.__introCls = el.className; })
    .observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
});
await p2.goto(B + '?intro=1', { waitUntil: 'domcontentloaded' }); await p2.waitForTimeout(200);
const calmCls = await p2.evaluate(() => window.__introCls || '');
ok('animations réduites : fondu simple (' + calmCls + ')', calmCls === 'pi-calm');
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
