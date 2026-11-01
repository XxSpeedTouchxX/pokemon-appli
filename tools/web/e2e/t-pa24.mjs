// PA toutes les 24 h (2026-11-01, porteur) : les PA reviennent 24 h après la dernière récupération (pas au changement de
// jour) ; une fois prêts, ils attendent 24 h ; passé ce délai, la série reprend à +15 PA. Heure simulée avec ?now=.
// Mode Admin : +10 000 PA d'un coup, « PA à volonté » (les PA se récupèrent à chaque appui sur le solde).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const KEY = 'pkm-collection-v1';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const pill = page.locator('header button[aria-label^="Mes points d’Aura"]').first();
const claimSheet = page.locator('section[aria-label="PA dispo aujourd’hui"]');
const mesPa = page.locator('section[aria-label="Mes PA"]');
const saved = () => page.evaluate(k => { const s = JSON.parse(localStorage.getItem(k) || '{}'); return { pa: s.pa || 0, streak: s.paStreak || 0, at: s.paAt || 0, day: s.paDay || '' }; }, KEY);
const seed = patch => page.evaluate(([k, p]) => { const d = JSON.parse(localStorage.getItem(k) || '{}'); Object.assign(d, p); localStorage.setItem(k, JSON.stringify(d)); }, [KEY, patch]);
const at = iso => page.goto(E2E + '/?now=' + iso, { waitUntil: 'load' }).then(() => page.waitForTimeout(1500));
await at('2026-11-10T20:00');
await seed({ tuto: 'done', onb: 0, pa: 100, paDay: '2026-11-10', paAt: Date.parse('2026-11-10T20:00'), paStreak: 3 });
// Le lendemain matin (12 h après) : un autre jour, mais pas encore 24 h → rien à récupérer.
await at('2026-11-11T08:00');
ok('lendemain 8 h (12 h après) : rien à récupérer (' + await pill.getAttribute('aria-label') + ')', !/à récupérer/.test(await pill.getAttribute('aria-label')) && (await pill.locator('.pkm-pa-dot').count()) === 0);
await pill.click(); await page.waitForTimeout(500);
const note = N(await mesPa.locator('.pkm-pa-sheet-note').innerText().catch(() => ''));
ok('Mes PA : « ' + note + ' »', /^Prochains PA dans 12 h 00 : \+25 PA\. Une fois prêts, tes PA t’attendent 24 h : passé ce délai, la série reprend à \+15 PA\.$/.test(note));
ok('Mes PA : « ' + N(await mesPa.locator('.pkm-cur-what').nth(1).innerText()).slice(0, 60) + '… »', /Toutes les 24 h, touche ton solde de PA/.test(await mesPa.innerText()));
// 24 h et 30 min après : PA prêts, série gardée (+25), à récupérer avant le 12 à 20 h 00.
await at('2026-11-11T20:30');
ok('24 h 30 après : +25 PA à récupérer', /25 PA à récupérer/.test(await pill.getAttribute('aria-label')));
await pill.click(); await page.waitForTimeout(500);
const keep = N(await claimSheet.locator('.pkm-pa-claim-keep').innerText().catch(() => ''));
ok('« ' + keep + ' »', keep === 'À récupérer avant jeudi 12 novembre à 20 h 00 pour garder ta série');
ok('« ' + N(await claimSheet.locator('.pkm-pa-claim-next').innerText()) + ' »', N(await claimSheet.locator('.pkm-pa-claim-next').innerText()) === 'Dans 24 h : +30 PA si tu reviens à temps');
await page.screenshot({ path: shot('pa24-claim.png') });
await claimSheet.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(2600);
let s = await saved();
ok('récupérés : 125 PA, série 4, heure gardée (' + new Date(s.at).toISOString().slice(0, 16) + ')', s.pa === 125 && s.streak === 4 && Math.abs(s.at - Date.parse('2026-11-11T20:30')) < 60000);
// Plus de 48 h après cette récupération (PA pas récupérés dans les 24 h où ils attendaient) : reprise à +15 PA.
await at('2026-11-13T21:00');
ok('49 h après : la série reprend à +15 PA (' + await pill.getAttribute('aria-label') + ')', /15 PA à récupérer/.test(await pill.getAttribute('aria-label')));
await pill.click(); await page.waitForTimeout(500);
ok('pas de « À récupérer avant » quand la série reprend', (await claimSheet.locator('.pkm-pa-claim-keep').count()) === 0);
await claimSheet.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(2600);
s = await saved(); ok('+15 PA, série 2 (' + s.pa + ')', s.pa === 140 && s.streak === 2);
// Règles des PK et PA.
await page.goto(E2E + '/?now=2026-11-13T21:05&start=settings', { waitUntil: 'load' }); await page.waitForTimeout(900);
// Mode Admin (déjà ouvert sur cet appareil) : +10 000 PA, puis « PA à volonté ».
await seed({ admin: { on: true } });
await page.goto(E2E + '/?now=2026-11-13T21:05&start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.locator('button:has-text("Panneau Admin")').first().click(); await page.waitForTimeout(500);
const panel = page.locator('section[aria-label="Panneau Admin"]');
ok('Admin : bouton « +10 000 PA (Pokédex) »', (await panel.locator('button:has-text("+10 000 PA (Pokédex)")').count()) === 1 && (await panel.locator('button:has-text("+500 PA")').count()) === 0);
await panel.locator('button:has-text("+10 000 PA (Pokédex)")').click(); await page.waitForTimeout(300);
s = await saved(); ok('+10 000 PA d’un coup (' + s.pa + ')', s.pa === 10140);
await panel.locator('button:has-text("PA à volonté")').click(); await page.waitForTimeout(1200);
const freeLabel = N(await panel.locator('button:has-text("PA à volonté")').innerText());
ok('« ' + freeLabel + ' », gardé sur l’appareil', freeLabel === 'PA à volonté : activé (désactiver)' && (await page.evaluate(k => JSON.parse(localStorage.getItem(k)).admin.paFree, KEY)) === true);
await page.screenshot({ path: shot('pa24-admin.png') });
await page.goto(E2E + '/?now=2026-11-13T21:06', { waitUntil: 'load' }); await page.waitForTimeout(900);
const gains = [];
for (let i = 0; i < 3; i++) {
  await pill.click(); await page.waitForTimeout(400);
  if (!(await claimSheet.isVisible().catch(() => false))) break;
  await claimSheet.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(2600);
  gains.push((await saved()).pa);
}
ok('PA à volonté : récupérés à chaque appui (' + gains.join(' → ') + ')', gains.length === 3 && gains[0] === 10160 && gains[1] === 10185 && gains[2] === 10215);
// Désactivé : de nouveau toutes les 24 h.
await seed({ admin: { on: true, paFree: false } });
await page.goto(E2E + '/?now=2026-11-13T21:07', { waitUntil: 'load' }); await page.waitForTimeout(900);
ok('désactivé : plus rien à récupérer avant 24 h', !/à récupérer/.test(await pill.getAttribute('aria-label')));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
