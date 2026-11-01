// PA chaque jour dès minuit (2026-11-01, porteur, après un essai « toutes les 24 h ») : un jour entier sans les récupérer,
// la série reprend à +15 PA. Heure simulée avec ?now=.
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
// Même jour, 20 h : déjà récupérés → « Prochains PA à minuit ».
await at('2026-11-10T20:00');
ok('même jour : rien à récupérer (' + await pill.getAttribute('aria-label') + ')', !/à récupérer/.test(await pill.getAttribute('aria-label')) && (await pill.locator('.pkm-pa-dot').count()) === 0);
await pill.click(); await page.waitForTimeout(500);
const note = N(await mesPa.locator('.pkm-pa-sheet-note').innerText().catch(() => ''));
ok('Mes PA : « ' + note + ' »', /^Prochains PA à minuit \(dans 4 h 00\) : \+25 PA\. Un jour sans les récupérer : la série reprend à \+15 PA\.$/.test(note));
ok('Mes PA : « Chaque jour dès minuit… »', /Chaque jour dès minuit, touche ton solde de PA/.test(await mesPa.innerText()));
// Le lendemain dès minuit (5 min après) : PA prêts, série gardée (+25), à récupérer avant ce soir minuit.
await at('2026-11-11T00:05');
ok('lendemain 0 h 05 : +25 PA à récupérer', /25 PA à récupérer/.test(await pill.getAttribute('aria-label')));
await pill.click(); await page.waitForTimeout(500);
const keep = N(await claimSheet.locator('.pkm-pa-claim-keep').innerText().catch(() => ''));
ok('« ' + keep + ' »', keep === 'À récupérer avant ce soir minuit (dans 23 h 55) pour garder ta série');
ok('« ' + N(await claimSheet.locator('.pkm-pa-claim-next').innerText()) + ' »', N(await claimSheet.locator('.pkm-pa-claim-next').innerText()) === 'Demain : +30 PA si tu reviens');
await page.screenshot({ path: shot('pa24-claim.png') });
await claimSheet.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(2600);
let s = await saved();
ok('récupérés : 125 PA, série 4, jour gardé (' + s.day + ')', s.pa === 125 && s.streak === 4 && s.day === '2026-11-11');
// Le 12 oublié, le 13 au matin : la série reprend à +15 PA.
await at('2026-11-13T09:00');
ok('un jour sans récupérer : la série reprend à +15 PA (' + await pill.getAttribute('aria-label') + ')', /15 PA à récupérer/.test(await pill.getAttribute('aria-label')));
await pill.click(); await page.waitForTimeout(500);
ok('pas de « À récupérer avant » quand la série reprend', (await claimSheet.locator('.pkm-pa-claim-keep').count()) === 0);
await claimSheet.locator('.pkm-pa-claim-btn').click(); await page.waitForTimeout(2600);
s = await saved(); ok('+15 PA, série 2 (' + s.pa + ')', s.pa === 140 && s.streak === 2);
// Règles des PK et PA.
await page.goto(E2E + '/?now=2026-11-13T09:05&start=settings', { waitUntil: 'load' }); await page.waitForTimeout(900);
// Mode Admin (déjà ouvert sur cet appareil) : +10 000 PA, puis « PA à volonté ».
await seed({ admin: { on: true } });
await page.goto(E2E + '/?now=2026-11-13T09:05&start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.locator('button:has-text("Panneau Admin")').first().click(); await page.waitForTimeout(500);
const panel = page.locator('section[aria-label="Panneau Admin"]');
ok('Admin : bouton « +10 000 PA (Pokédex) »', (await panel.locator('button:has-text("+10 000 PA (Pokédex)")').count()) === 1 && (await panel.locator('button:has-text("+500 PA")').count()) === 0);
await panel.locator('button:has-text("+10 000 PA (Pokédex)")').click(); await page.waitForTimeout(300);
s = await saved(); ok('+10 000 PA d’un coup (' + s.pa + ')', s.pa === 10140);
await panel.locator('button:has-text("PA à volonté")').click(); await page.waitForTimeout(1200);
const freeLabel = N(await panel.locator('button:has-text("PA à volonté")').innerText());
ok('« ' + freeLabel + ' », gardé sur l’appareil', freeLabel === 'PA à volonté : activé (désactiver)' && (await page.evaluate(k => JSON.parse(localStorage.getItem(k)).admin.paFree, KEY)) === true);
await page.screenshot({ path: shot('pa24-admin.png') });
await page.goto(E2E + '/?now=2026-11-13T09:06', { waitUntil: 'load' }); await page.waitForTimeout(900);
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
await page.goto(E2E + '/?now=2026-11-13T09:07', { waitUntil: 'load' }); await page.waitForTimeout(900);
ok('désactivé : plus rien à récupérer avant demain', !/à récupérer/.test(await pill.getAttribute('aria-label')));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
