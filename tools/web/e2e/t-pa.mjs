// PA (points d'Aura, 2026-10-25) : gain une fois par jour, selon les jours d'affilée ; un jour manqué fait reprendre la
// série à +15 PA. Depuis le 2026-10-28 (porteur), les PA ne sont plus crédités à l'ouverture : une pastille « 1 » (« ! » jusqu’au 2026-10-29) sur le
// solde de l'en-tête prévient qu'ils attendent ; un appui ouvre « Tes PA du jour », « Récupérer mes PA » les crédite
// (animation d'envol d'environ 1,6 s). Sans PA à récupérer, le solde ouvre le Pokédex. Dates simulées avec ?today=.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const KEY = 'pkm-collection-v1';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const saved = () => page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k) || '{}'); return { pa: s.pa || 0, streak: s.paStreak || 0, day: s.paDay || '' }; }, KEY);
const pill = page.locator('header button[aria-label^="Mes points d’Aura"]').first();
const dot = pill.locator('.pkm-pa-dot');
const sheet = page.locator('section[aria-label="PA dispo aujourd’hui"]');
// Didacticiel déjà vu (il couvrirait l'en-tête).
await page.goto(E2E + '/?today=2026-10-31', { waitUntil: 'load' }); await page.waitForTimeout(900);
await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d)); }, KEY);
// Un jour : ouverture (rien n'est crédité, pastille « 1 » (« ! » jusqu’au 2026-10-29)), appui sur le solde, « Récupérer mes PA ».
const day = async d => {
  await page.goto(E2E + '/?today=' + d, { waitUntil: 'load' }); await page.waitForTimeout(900);
  const before = await saved(), dotOn = await dot.count() > 0 && await dot.isVisible(), aria = await pill.getAttribute('aria-label');
  await pill.click(); await page.waitForTimeout(400);
  const open = await sheet.isVisible().catch(() => false);
  if (open) { await sheet.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(2400); }
  const after = await saved();
  return { before, dotOn, aria, open, pa: after.pa, streak: after.streak, day: after.day, closed: !(await sheet.isVisible().catch(() => false)), dotAfter: await dot.count() };
};
const a = await day('2026-11-01');
ok('ouverture : rien de crédité, pastille « 1 » (« ! » jusqu’au 2026-10-29) (' + a.before.pa + ' PA)', a.before.pa === 0 && a.dotOn);
ok('en-tête : « 10 PA à récupérer » (' + a.aria + ')', /10 PA à récupérer/.test(a.aria || ''));
ok('appui sur le solde : « PA dispo aujourd’hui »', a.open);
ok('1er jour récupéré : +10 PA (' + a.pa + ', série ' + a.streak + ')', a.pa === 10 && a.streak === 1 && a.day === '2026-11-01');
ok('après récupération : fenêtre fermée, pastille retirée', a.closed && a.dotAfter === 0);
const b = await day('2026-11-02'); ok('2e jour d’affilée : +15 PA (' + b.pa + ')', b.before.pa === 10 && b.dotOn && b.pa === 25 && b.streak === 2);
// Même jour : plus de pastille, le solde ouvre le Pokédex (onglet Jeux).
await page.goto(E2E + '/?today=2026-11-02', { waitUntil: 'load' }); await page.waitForTimeout(900);
const sameAria = await pill.getAttribute('aria-label');
ok('même jour : pas de pastille, rien de plus (' + (await saved()).pa + ')', await dot.count() === 0 && (await saved()).pa === 25 && /Ouvrir le Pokédex/.test(sameAria || ''));
await pill.click(); await page.waitForTimeout(1200);
ok('sans PA à récupérer : le solde ouvre le Pokédex', !(await sheet.isVisible().catch(() => false)) && await page.locator('section[aria-label="Pokédex"]').first().isVisible().catch(() => false));
const c = await day('2026-11-03'); ok('3e jour : +20 PA (' + c.pa + ')', c.pa === 45 && c.streak === 3);
// Un jour sans récupérer (le 4) : la série reprend à +15 PA le 5.
const d = await day('2026-11-05'); ok('un jour manqué : reprise à +15 PA (' + d.pa + ')', d.aria && /15 PA à récupérer/.test(d.aria) && d.pa === 60 && d.streak === 2);
// Ouvrir sans récupérer : rien n'est crédité, les PA attendent le lendemain d'ouverture.
await page.goto(E2E + '/?today=2026-11-06', { waitUntil: 'load' }); await page.waitForTimeout(900);
await pill.click(); await page.waitForTimeout(400);
await page.screenshot({ path: shot('pa-du-jour.png') });
await sheet.locator('xpath=..').locator('button[aria-label="Fermer"]').first().click({ position: { x: 10, y: 10 } }); await page.waitForTimeout(300);
ok('fermer sans récupérer : rien de crédité, pastille gardée', (await saved()).pa === 60 && !(await sheet.isVisible().catch(() => false)) && await dot.count() > 0);
ok('PA dans l’en-tête : ' + (await pill.innerText()).replace(/\s+/g, ' '), /60\s*PA/.test(await pill.innerText()));
await page.screenshot({ path: shot('pa-entete.png'), clip: { x: 0, y: 0, width: 390, height: 120 } });
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
