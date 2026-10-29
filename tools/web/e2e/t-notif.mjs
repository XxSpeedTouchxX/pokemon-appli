// Notifications (2026-10-29, demande du porteur) : pastille « 1 » sur le solde de PA quand les PA du jour attendent ;
// Mon profil › « Notifications » : quatre interrupteurs (PA, Booster PK, pièce, sorties et boutiques), cochés par
// défaut, enregistrés ; rappels calculés sur l'appareil, une notification du téléphone par rappel (si autorisée) et le
// nombre de rappels sur l'icône de l'app. Notifications et pastille de l'icône espionnées (aucune vraie notification).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const KEY = 'pkm-collection-v1';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx.addInitScript(() => {
  window.__nt = { shown: [], badge: [] };
  class FakeN { constructor(t, o) { window.__nt.shown.push(t + ' | ' + (o && o.body)); } }
  FakeN.permission = 'granted'; FakeN.requestPermission = () => Promise.resolve('granted');
  window.Notification = FakeN;
  try { Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true }); } catch (e) { /* rien */ }
  navigator.setAppBadge = n => { window.__nt.badge.push(n); return Promise.resolve(); };
  navigator.clearAppBadge = () => { window.__nt.badge.push(0); return Promise.resolve(); };
});
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const BASE = E2E + '/?today=2026-11-02&debug';
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1200);
// PA du jour en attente (dernier jour récupéré : la veille) ; booster ouvert il y a 2 jours ; pièce lancée à l'instant.
await page.evaluate(k => {
  const d = JSON.parse(localStorage.getItem(k) || '{}');
  d.tuto = 'done'; d.paDay = '2026-11-01'; d.paStreak = 1; delete d.notif; delete d.notifDone;
  d.games = { boosterAt: new Date(Date.now() - 2 * 86400000).toISOString(), coinAt: new Date().toISOString() };
  localStorage.setItem(k, JSON.stringify(d));
}, KEY);
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const dot = page.locator('header .pkm-pa-dot').first();
ok('pastille « ' + (await dot.textContent().catch(() => '')).trim() + ' » sur le solde de PA', (await dot.count()) >= 1 && (await dot.textContent()).trim() === '1');
const dotStyle = await dot.evaluate(e => { const c = getComputedStyle(e); return c.color + ' / ' + c.backgroundColor; });
ok('pastille rouge, chiffre blanc (' + dotStyle + ')', dotStyle === 'rgb(255, 255, 255) / rgb(194, 24, 7)');
// Rappels : PA et booster prêts (pièce pas encore) → deux notifications, pastille 2 sur l'icône.
await page.waitForFunction(() => window.__nt.shown.length >= 2, null, { timeout: 6000 }).catch(() => {});
const nt1 = await page.evaluate(() => JSON.parse(JSON.stringify(window.__nt)));
ok('notifications : ' + nt1.shown.join(' ; '), nt1.shown.length === 2 && /PA du jour/.test(nt1.shown.join()) && /Booster PK prêt/.test(nt1.shown.join()) && !/Pièce/.test(nt1.shown.join()));
ok('pastille de l’icône de l’app : ' + nt1.badge.join(','), nt1.badge[nt1.badge.length - 1] === 2);
// Une seule fois par rappel : rien de plus au tick suivant.
await page.evaluate(() => window.__pkm.notifTick()); await page.waitForTimeout(200);
ok('pas de doublon au rappel suivant', (await page.evaluate(() => window.__nt.shown.length)) === 2);
// Mon profil › Notifications.
await page.click('header button[aria-label^="Ouvrir mon profil"], header .pkm-hh-me'); await page.waitForTimeout(900);
const sec = page.locator('section[aria-label="Notifications"]');
await sec.scrollIntoViewIfNeeded();
const sw = sec.locator('button[role="switch"]');
const labels = (await sw.allInnerTexts()).map(t => t.split('\n')[0]);
const checked = await sw.evaluateAll(bs => bs.map(b => b.getAttribute('aria-checked')).join(','));
ok('rubrique Notifications : ' + labels.join(' / ') + ' (' + checked + ')', labels.length === 4 && /PA du jour/.test(labels[0]) && /Booster PK/.test(labels[1]) && /Pièce/.test(labels[2]) && /Sorties/.test(labels[3]) && checked === 'true,true,true,true');
ok('état : « ' + (await sec.innerText()).split('\n').find(l => /autorisées|bloquées|Autorise/.test(l)) + ' »', /Notifications du téléphone autorisées/.test(await sec.innerText()) && /compte Dropicards/.test(await sec.innerText()));
await sec.screenshot({ path: shot('notif-profil.png') });
// Décocher les PA : enregistré, plus de rappel de PA.
await sw.nth(0).click(); await page.waitForTimeout(300);
ok('PA décoché : ' + await sw.nth(0).getAttribute('aria-checked'), (await sw.nth(0).getAttribute('aria-checked')) === 'false');
const due = await page.evaluate(() => window.__pkm.notifDue(window.__pkm.st()).map(d => d.key).join(','));
ok('rappels encore prêts : ' + due, due === 'booster');
await page.waitForTimeout(1500);
await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(1500);
const st = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).notif, KEY);
ok('choix gardé après rechargement (' + JSON.stringify(st) + ')', st && st.pa === false);
// Mise en page : pas de défilement horizontal, interrupteurs assez grands.
await page.click('header .pkm-hh-me'); await page.waitForTimeout(900);
const lay = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - document.documentElement.clientWidth, h: [...document.querySelectorAll('section[aria-label="Notifications"] button[role="switch"]')].map(b => Math.round(b.getBoundingClientRect().height)) }));
ok('pas de défilement horizontal (' + lay.over + ' px), lignes de ' + lay.h.join(', ') + ' px', lay.over <= 0 && lay.h.every(h => h >= 44));
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
