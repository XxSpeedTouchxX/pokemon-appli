// PA (points d'Aura, 2026-10-25) : gain à l'ouverture, une fois par jour, selon les jours d'affilée ; un jour manqué
// fait reprendre la série à +15 PA. Dates simulées avec ?today=.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const day = async d => { await page.goto(E2E + '/?today=' + d, { waitUntil: 'load' }); await page.waitForTimeout(900); return page.evaluate(() => { const s = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { pa: s.pa, streak: s.paStreak, day: s.paDay }; }); };
const a = await day('2026-11-01'); ok('1er jour : +10 PA (' + a.pa + ')', a.pa === 10 && a.streak === 1);
const b = await day('2026-11-02'); ok('2e jour d’affilée : +15 PA (' + b.pa + ')', b.pa === 25 && b.streak === 2);
const b2 = await day('2026-11-02'); ok('même jour : rien de plus (' + b2.pa + ')', b2.pa === 25);
const c = await day('2026-11-03'); ok('3e jour : +20 PA (' + c.pa + ')', c.pa === 45 && c.streak === 3);
const d = await day('2026-11-05'); ok('un jour manqué : reprise à +15 PA (' + d.pa + ')', d.pa === 60 && d.streak === 2);
ok('PA dans l’en-tête : ' + (await page.locator('header button[aria-label^="Mes points d’Aura"]').first().innerText()).replace(/\s+/g, ' '), /60\s*PA/.test(await page.locator('header button[aria-label^="Mes points d’Aura"]').first().innerText()));
await page.screenshot({ path: shot('pa-entete.png'), clip: { x: 0, y: 0, width: 390, height: 120 } });
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
