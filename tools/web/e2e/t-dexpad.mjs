// Pokédex dessiné, commandes refaites (2026-10-29, porteur : « pas du tout intuitif ») : croix en relief à flèches,
// bouton vert « OK » qui brille quand son action est possible, écran qui glisse dans le sens de la flèche, clavier ;
// première utilisation guidée (doigt animé sur la croix, puis sur « OK », bulle d'explication, « Compris ! »).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const BASE = E2E + '/?today=2026-10-04';
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.evo = { line: 'sala', stage: 0 }; d.buddy = 4; d.pkOwn = [4]; d.pa = 600; delete d.dexTips; localStorage.setItem(k, JSON.stringify(d)); });
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(1200);
await page.locator('.pkm-dex-device').scrollIntoViewIfNeeded();
const lcd = () => page.locator('.pkm-dex-lcd-l').getAttribute('aria-label');
const cross = page.locator('.pkm-dex-cross');
const P = { up: [0.5, 0.15], down: [0.5, 0.85], left: [0.15, 0.5], right: [0.85, 0.5] };
const tap = async k => { await page.locator('.pkm-dex-device').scrollIntoViewIfNeeded(); const b = await cross.boundingBox(); await page.mouse.click(b.x + b.width * P[k][0], b.y + b.height * P[k][1]); await page.waitForTimeout(250); };
// Touches visibles : croix en relief avec 4 flèches, bouton « OK ».
const look = await page.evaluate(() => {
  const c = document.querySelector('.pkm-dex-cross').getBoundingClientRect(), a = document.querySelector('.pkm-dex-k-a');
  return { w: Math.round(c.width), arrows: document.querySelectorAll('.pkm-dex-cross .pkm-dex-k > i > b').length, ok: a.textContent.trim(), aw: Math.round(a.getBoundingClientRect().width), ah: Math.round(a.getBoundingClientRect().height) };
});
ok('croix de ' + look.w + ' px avec ' + look.arrows + ' flèches ; bouton « ' + look.ok + ' » ' + look.aw + ' × ' + look.ah + ' px', look.w >= 44 && look.arrows === 4 && look.ok === 'OK' && look.aw >= 44 && look.ah >= 22);
// Première utilisation : bulle, doigt sur la croix, flèches qui s'allument.
const tip = page.locator('.pkm-dex-tip');
ok('première fois : « ' + (await tip.innerText()).split('\n')[0] + ' », doigt sur la croix', (await tip.count()) === 1 && /Ton Pokédex se pilote/.test(await tip.innerText())
  && (await page.locator('.pkm-dex-hand-cross').count()) === 1 && (await page.locator('.pkm-dex-pad-tip0').count()) === 1);
const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.pkm-dex-k-up > i > b')).animationName);
ok('flèches qui s’allument à tour de rôle (' + anim + ')', anim === 'pkmDexArrow');
await page.screenshot({ path: shot('dexpad-1-croix.png') });
// Un appui à droite : Pokémon suivant de la famille, arrivée par la droite ; le doigt passe sur « OK ».
await tap('right');
const img = await page.evaluate(() => document.querySelector('.pkm-dex-lcd-l img').className);
ok('▶ : ' + await lcd() + ' (écran : ' + img + ')', /Reptincel, #005/.test(await lcd()) && /pkm-lcd-right/.test(img) && /pkm-dex-sil/.test(img));
ok('le doigt passe sur « OK » : « ' + (await tip.innerText()).split('\n')[0] + ' »', (await page.locator('.pkm-dex-hand-a').count()) === 1 && /Le bouton vert/.test(await tip.innerText()));
await page.screenshot({ path: shot('dexpad-2-ok.png') });
// « OK » bondit et brille quand l'évolution est possible (Reptincel, 500 PA sur 600) (2026-10-31).
ok('« OK » animé : ' + await page.locator('.pkm-dex-k-a').getAttribute('aria-label'), /pkm-dex-a-go/.test(await page.locator('.pkm-dex-k-a').getAttribute('class')) && /Faire évoluer · 500 PA/.test(await page.locator('.pkm-dex-k-a').getAttribute('aria-label')));
// ▲ ▼ et clavier.
await tap('down');
ok('▼ : ' + await lcd(), /Dracaufeu, #006/.test(await lcd()));
await page.locator('.pkm-dex-k-left').focus(); await page.keyboard.press('ArrowUp'); await page.waitForTimeout(250);
ok('clavier ↑ : ' + await lcd(), /Reptincel, #005/.test(await lcd()));
await tap('left');
ok('◀ : ' + await lcd(), /Salamèche, #004/.test(await lcd()));
// « Compris ! » termine l'aide ; rien après rechargement.
await page.click('.pkm-dex-tip button'); await page.waitForTimeout(300);
ok('« Compris ! » : aide terminée', (await tip.count()) === 0 && (await page.locator('.pkm-dex-hand').count()) === 0);
await page.waitForTimeout(1500);
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
await page.click('nav button[aria-label="Jeux"]'); await page.waitForTimeout(1200);
ok('pas d’aide après rechargement', (await tip.count()) === 0 && (await page.locator('.pkm-dex-pad-tip0, .pkm-dex-pad-tip1').count()) === 0);
// « OK » quand l'action n'est pas possible : il dit pourquoi.
await page.locator('.pkm-dex-device').scrollIntoViewIfNeeded();
await tap('down'); await tap('down'); // Dracaufeu : Reptincel d'abord
const why = await page.locator('.pkm-dex-k-a').getAttribute('aria-label');
await page.click('.pkm-dex-k-a'); await page.waitForTimeout(300);
ok('« OK » impossible (' + why.replace('Bouton vert OK : ', '') + ') : message', !/pkm-dex-a-on/.test(await page.locator('.pkm-dex-k-a').getAttribute('class')) && (await page.locator('body').innerText()).indexOf(why.replace('Bouton vert OK : ', '')) >= 0);
await page.locator('.pkm-dex-device').screenshot({ path: shot('dexpad-3-appareil.png') });
// Animations coupées si l'utilisateur les limite.
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await ctx2.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const p2 = await ctx2.newPage();
await p2.goto(BASE, { waitUntil: 'load' }); await p2.waitForTimeout(1500);
await p2.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.evo = { line: 'sala', stage: 0 }; d.buddy = 4; localStorage.setItem(k, JSON.stringify(d)); });
await p2.goto(BASE, { waitUntil: 'load' }); await p2.waitForTimeout(1500);
await p2.click('nav button[aria-label="Jeux"]'); await p2.waitForTimeout(1000);
const rm = await p2.evaluate(() => [getComputedStyle(document.querySelector('.pkm-dex-finger')).animationName, getComputedStyle(document.querySelector('.pkm-dex-k-up > i > b')).animationName]);
ok('animations limitées : rien ne bouge (' + rm.join(', ') + ')', rm.every(a => a === 'none'));
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
