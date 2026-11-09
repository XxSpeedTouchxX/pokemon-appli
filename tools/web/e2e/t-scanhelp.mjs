// 2026-11-08 : écran du scan : bulle « 5 scans disponibles » (rien avec Premium), consigne sous le cadre (plus
// par-dessus la bulle), bouton « Aide » à la place de la loupe et ses 4 astuces illustrées.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, permissions: ['camera'] });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => { try { localStorage.setItem('pkm-grade-force', '0'); } catch (e) { /* stockage */ } });
await page.goto(E2E + '/?debug&start=scan', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const pill = page.locator('.pkm-scan-left');
ok('bulle du haut : « ' + N(await pill.innerText().catch(() => '')) + ' » avec le logo du scan', /^5 scans disponibles$/.test(N(await pill.innerText().catch(() => ''))) && (await pill.locator('svg').count()) === 1);
ok('plus de bouton « Carte » ni d’onglet Scellé', (await page.locator('button:has-text("Carte")').count()) === 0 && (await page.locator('button:has-text("Scellé")').count()) === 0);
const hint = await page.locator('.pkm-scan-hint').boundingBox(), frame = await page.locator('#pkm-scan-frame').boundingBox(), pb = await pill.boundingBox();
ok('consigne « bien à plat » sous le cadre, la bulle du haut dégagée', !!(hint && frame && pb) && hint.y >= frame.y + frame.height - 1 && pb.y + pb.height <= frame.y);
ok('loupe retirée, bouton « Aide » en bas à droite', (await page.locator('button[aria-label="Rechercher une carte"]').count()) === 0 && /Aide/.test(await page.locator('.pkm-scan-helpbtn').innerText()));
await page.screenshot({ path: shot('scan-ecran.png') });
await page.click('.pkm-scan-helpbtn'); await page.waitForTimeout(700);
const help = page.locator('section[aria-label="Bien scanner une carte"]');
const tips = (await help.locator('.pkm-scanhelp-tip b').allInnerTexts()).map(N);
ok('aide : 4 astuces illustrées (' + tips.join(' · ') + ')', tips.length === 4 && /éclairage/.test(tips[0]) && /reflets/.test(tips[1]) && /cadre/.test(tips[2]) && /stable/.test(tips[3]) && (await help.locator('.pkm-scanhelp-ill svg').count()) === 4);
ok('aide : flash cité', /flash/.test(await help.innerText()));
await page.screenshot({ path: shot('scan-aide.png') });
await help.locator('button:has-text("J’ai compris")').click(); await page.waitForTimeout(800);
ok('« J’ai compris » ferme l’aide', (await help.count()) === 0);
// Premium : scans illimités, la bulle disparaît.
await page.evaluate(() => { const s = window.__pkm.st(); window.__pkm.setState({ cloudGame: Object.assign({}, s.cloudGame || {}, { premium: { on: true } }) }); }); await page.waitForTimeout(400);
ok('Premium : plus de bulle de scans (illimité)', (await page.locator('.pkm-scan-left').count()) === 0);
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
