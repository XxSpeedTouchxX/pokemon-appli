// K1 : animation d’entrée, complète à chaque démarrage (2026-10-11) ; booster d’abord figé pendant le chargement, puis ouverture de 3,7 s (2026-11-27) ; un appui la passe ; version éclair ;
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
// Booster figé au lancement (2026-11-27, porteur) : d'abord pi-hold (le booster seul, immobile), puis pi-full (l'ouverture,
// 4,3 s) quand l'app a chargé son catalogue, 2 s d'attente au plus. Les moments et l'état sont relevés dans la page.
await ctx.addInitScript(() => {
  const ev = window.__introEv = {};
  const rect = () => { const pk = document.querySelector('#pkm-intro .pi-pack'); const r = pk && pk.getBoundingClientRect(); return r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width)] : null; };
  new MutationObserver(() => {
    const el = document.getElementById('pkm-intro'); if (!el) return;
    const c = el.className;
    if (c === 'pi-hold' && !ev.hold) {
      ev.hold = performance.now(); ev.holdRect = rect();
      ev.holdVis = [...el.querySelectorAll('svg > *')].filter(e => e.tagName !== 'defs' && getComputedStyle(e).display !== 'none').map(e => e.getAttribute('class') || e.tagName);
    }
    if (c === 'pi-full' && !ev.full) { ev.full = performance.now(); setTimeout(() => { ev.fullRect = rect(); }, 150); setTimeout(() => { const t = el.querySelector('.pi-pack .pi-tab'); ev.tab450 = t ? getComputedStyle(t).transform : ''; }, 450); }
    if (el.style.display === 'none' && !ev.gone) ev.gone = performance.now();
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
});
await page.goto(B + '?intro=1', { waitUntil: 'domcontentloaded' });
const cls0 = await page.evaluate(() => document.getElementById('pkm-intro') && document.getElementById('pkm-intro').className);
ok('complète : affichée (' + cls0 + ')', await has() && (cls0 === 'pi-hold' || cls0 === 'pi-full'));
await page.waitForFunction(gone, null, { timeout: 8000 }).catch(() => {});
const ev = await page.evaluate(() => window.__introEv);
ok('booster seul et figé avant l’ouverture (' + (ev.holdVis || []).join(', ') + ')', JSON.stringify(ev.holdVis) === '["pi-pack"]');
ok('ouverture lancée après ' + Math.round(ev.full - ev.hold) + ' ms d’attente (2 s au plus)', ev.hold > 0 && ev.full > ev.hold && ev.full - ev.hold <= 2300);
ok('booster à la même place avant et pendant l’ouverture (' + JSON.stringify(ev.holdRect) + ' / ' + JSON.stringify(ev.fullRect) + ')', !!ev.holdRect && JSON.stringify(ev.holdRect) === JSON.stringify(ev.fullRect));
const dur = Math.round(ev.gone - ev.full);
// Ouverture avancée de 0,6 s (2026-11-27, porteur : « il reste trop longtemps figé », puis « encore 0,3 s plus tôt ») :
// la languette se soulève dès le départ (déjà levée 0,45 s après), et l'ouverture dure 3,7 s.
ok('languette déjà soulevée 0,45 s après le départ (' + ev.tab450 + ')', !!ev.tab450 && ev.tab450 !== 'none');
ok('ouverture retirée après ' + dur + ' ms (3 400 à 4 000 ms)', !(await has()) && dur >= 3400 && dur <= 4000);

ok('l’app est prête dessous', (await page.locator('header img[alt="Dropicards"]').count()) === 1);
// Appui pour passer.
let t0;
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
