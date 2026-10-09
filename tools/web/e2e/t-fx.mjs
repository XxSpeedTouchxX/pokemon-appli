// K2 : fonds animés selon l'écran et le compagnon, réglage Animés / Calmes / Sans, pause quand caché, mouvements
// réduits ; K3 : micro-animations (ajout, gain de PK, déblocage).
import { withFonts, unlockPaid, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
process.on('uncaughtException', e => { console.log(res.join('\n')); console.log('✗ ERREUR', e.message.split('\n')[0]); process.exit(1); });
const B = E2E + '/?today=2026-10-09&';
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const cls = () => page.evaluate(() => [...document.documentElement.classList].filter(c => c.indexOf('pkm-fx') === 0).sort().join(' '));
const anim = () => page.evaluate(() => getComputedStyle(document.querySelector('#pkm-fx i')).animationName + ' / ' + getComputedStyle(document.querySelector('#pkm-fx'), '::before').animationName);
await page.goto(B, { waitUntil: 'load' }); await page.waitForTimeout(1500);
ok('accueil : décor holo (' + await cls() + ')', (await cls()) === 'pkm-fx-holo pkm-fx-on');
ok('animations : ' + await anim(), /pkmFxSpark/.test(await anim()) && /pkmFxHolo/.test(await anim()));
ok('calque derrière le contenu (z-index −1, sans clic)', await page.evaluate(() => { const f = document.querySelector('#pkm-fx'), st = getComputedStyle(f); return st.zIndex === '-1' && st.pointerEvents === 'none' && st.display === 'block'; }));
const hit = await page.evaluate(() => { const b = document.querySelector('header button[aria-label^="Mes PK"]').getBoundingClientRect(); return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2).closest('button') !== null; });
ok('les boutons restent touchables', hit);
await page.screenshot({ path: shot('fx-home.png') });
await page.goto(B + '#marche', { waitUntil: 'load' }); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
ok('Marché : gemmes (' + await cls() + ')', /pkm-fx-gems/.test(await cls()) && /pkmFxRise/.test(await anim()));
await page.screenshot({ path: shot('fx-market.png') });
await page.goto(B + '#territoire', { waitUntil: 'load' }); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
ok('Territoire : ondes radar', /pkm-fx-radar/.test(await cls()) && /pkmFxWave/.test(await anim()));
await page.goto(B + '#scan', { waitUntil: 'load' }); await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
ok('Scan : aucun décor', (await cls()) === '');
// Thème de compagnon : Rayquaza (orage).
await page.goto(B, { waitUntil: 'load' }); await page.waitForTimeout(800);
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('pkm-collection-v1')); s.buddy = 384; s.pkOwn = (s.pkOwn || []).concat([384]); localStorage.setItem('pkm-collection-v1', JSON.stringify(s)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
ok('Rayquaza : orage (' + await cls() + ')', /pkm-fx-storm/.test(await cls()) && /pkmFxRain/.test(await anim()) && /pkmFxFlash/.test(await anim()));
await page.screenshot({ path: shot('fx-storm.png') });
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('pkm-collection-v1')); s.buddy = 382; s.pkOwn = (s.pkOwn || []).concat([382]); localStorage.setItem('pkm-collection-v1', JSON.stringify(s)); });
await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1000);
ok('Kyogre : bulles', /pkm-fx-bubbles/.test(await cls()));
// Réglages : Calmes, puis Sans.
await page.goto(B + 'start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1000);
const grp = page.locator('[role="group"][aria-label="Fonds animés"] button');
ok('Réglages : 3 choix, « Animés » par défaut', (await grp.count()) === 3 && (await grp.nth(0).getAttribute('aria-pressed')) === 'true');
await grp.nth(1).click(); await page.waitForTimeout(200);
const calmCls = await cls(); await page.waitForTimeout(1500);
ok('Calmes : classe pkm-fx-calm, enregistré (' + calmCls + ')', /pkm-fx-calm/.test(calmCls) && (await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1')).bgFx)) === 'calm');
await grp.nth(2).click(); await page.waitForTimeout(200);
ok('Sans : plus de décor', (await cls()) === '' && (await page.evaluate(() => getComputedStyle(document.querySelector('#pkm-fx')).display)) === 'none');
await grp.nth(0).click(); await page.waitForTimeout(200);
// Pause quand l'app est cachée.
await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
ok('app cachée : pause', await page.evaluate(() => document.documentElement.classList.contains('pkm-fx-paused')));
// Mouvements réduits : décor masqué.
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const p2 = await ctx2.newPage(); await p2.goto(B, { waitUntil: 'load' }); await p2.waitForTimeout(800);
ok('mouvements réduits : décor masqué', (await p2.evaluate(() => getComputedStyle(document.querySelector('#pkm-fx')).display)) === 'none');
await ctx2.close();
// K3 : ajout d'un exemplaire → gerbe de cartes ; gain de PK → pluie de gemmes.
const page3 = await ctx.newPage(); page3.on('pageerror', e => errors.push(e.message));
await page3.goto(B + 'start=item&itemId=p6', { waitUntil: 'load' }); await page3.waitForTimeout(2000);
await page3.evaluate(() => { window.__bursts = []; new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => { if (n.classList && n.classList.contains('pkm-burst')) window.__bursts.push(n.className); }))).observe(document.body, { childList: true }); });
await page3.click('button:has-text("+ Ajouter un exemplaire")'); await page3.waitForTimeout(300);
await page3.click('button:has-text("Enregistrer l’ajout"), button:has-text("Ajouter à ma collection")'); await page3.waitForTimeout(300);
const b1 = await page3.evaluate(() => window.__bursts.slice());
ok('ajout : gerbe de cartes (' + b1.join(', ') + ')', b1.some(c => /pkm-burst-card/.test(c)));
await page3.screenshot({ path: shot('fx-burst.png') });
await page3.waitForTimeout(1700);
ok('gerbe retirée après l’animation', (await page3.locator('.pkm-burst').count()) === 0);
// Gain de PK : article jamais ajouté (pkSeen vidé) → +10 PK → pluie de gemmes depuis le compteur.
await page3.evaluate(() => { const s = JSON.parse(localStorage.getItem('pkm-collection-v1')); s.pkSeen = []; localStorage.setItem('pkm-collection-v1', JSON.stringify(s)); });
await page3.goto(B + 'start=item&itemId=p6&r=2', { waitUntil: 'load' }); await page3.waitForTimeout(2000);
await page3.evaluate(() => { window.__bursts = []; new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => { if (n.classList && n.classList.contains('pkm-burst')) window.__bursts.push(n.className); }))).observe(document.body, { childList: true }); });
await page3.click('button:has-text("+ Ajouter un exemplaire")'); await page3.waitForTimeout(300);
await page3.click('button:has-text("Enregistrer l’ajout"), button:has-text("Ajouter à ma collection")'); await page3.waitForTimeout(300);
const b2 = await page3.evaluate(() => window.__bursts.slice());
ok('+10 PK : pluie de gemmes (' + b2.join(', ') + ')', b2.some(c => /pkm-burst-gem/.test(c)));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
