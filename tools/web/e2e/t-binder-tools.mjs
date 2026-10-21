// Classeur (2026-10-21) : tri par cote seulement, plus de bulles « Trier », « Cote », « Récents », « Nom », « Filtrer » ;
// glisser pour changer de page (cartes, pages de 9).
import { readFileSync } from 'node:fs';
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
process.on('uncaughtException', e => { console.log(res.join('\n')); console.log('✗ ERREUR', e.message.split('\n')[0]); process.exit(1); });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const SEC = 'section[aria-label="Mon classeur"]', PANEL = SEC + ' [role="tabpanel"]', TILE = PANEL + ' button[aria-label$="Ouvrir la fiche"]';
const cotes = async () => (await page.locator(TILE).evaluateAll(b => b.map(x => x.querySelector('span[style*="bottom: 6%"], .pkm-vit-pill').innerText.replace(/[^\d,]/g, '').replace(',', '.')))).map(Number);
await page.goto(E2E + '/?today=2026-10-09', { waitUntil: 'load' }); await page.waitForTimeout(1800);
await page.locator(SEC).scrollIntoViewIfNeeded();
const v = await cotes();
ok('cartes de la plus chère à la moins chère : ' + v.join(' > '), v.length === 6 && v.every((x, i) => !i || v[i - 1] >= x));
ok('aucune bulle de tri ni de filtre', (await page.locator(SEC + ' button', { hasText: /^(Trier|Cote|Récents|Nom|Filtrer|Filtres.*)$/ }).count()) === 0 && (await page.locator(SEC + ' [aria-label="Filtres du classeur"]').count()) === 0);
await page.locator(SEC + ' [role="tab"]:has-text("Mes produits scellés")').click(); await page.waitForTimeout(300);
const vs = await cotes();
ok('scellé de la plus chère à la moins chère : ' + vs.join(' > '), vs.length > 1 && vs.every((x, i) => !i || vs[i - 1] >= x));
await page.screenshot({ path: shot('binder-tools.png') });
await ctx.close();
// 11 cartes : glisser à gauche ou à droite change de page.
const doc = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8'));
const rows = doc.cards.filter(r => r[6] > 1).slice(0, 11);
const saved = JSON.stringify({ v: 1, savedAt: new Date().toISOString(), cards: Object.fromEntries(rows.map(r => [r[0], { r: r, f: doc.fields }])),
  purchases: rows.map((r, i) => ({ id: 'n' + i, date: '2026-10-01', seq: i, lines: [{ pid: r[0], qty: 1, lang: 'FR', cond: 'NM' }], total: null, where: 'Test', by: 'toi' })), sales: [], seq: 50 });
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); await withFonts(ctx2);
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.addInitScript(x => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', x); sessionStorage.setItem('seeded', '1'); } }, saved);
await p2.goto(E2E + '/?today=2026-10-09', { waitUntil: 'load' }); await p2.waitForTimeout(2200);
await p2.locator(SEC).scrollIntoViewIfNeeded();
const pageLbl = () => p2.locator(SEC).innerText().then(t => (t.match(/Page \d+ sur \d+/) || [''])[0]);
ok('cartes : ' + await pageLbl(), /Page 1 sur 2/.test(await pageLbl()));
const GRID = PANEL + ' div[style*="repeat(3"]';
const box = await p2.locator(GRID).first().boundingBox();
const swipe = async (x0, x1) => {
  await p2.evaluate(([sel, a, b, y]) => {
    const el = document.querySelector(sel), t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { touches: [t(a)], changedTouches: [t(a)], bubbles: true }));
    el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(b)], bubbles: true }));
  }, [GRID, x0, x1, box.y + 40]);
  await p2.waitForTimeout(250);
};
await swipe(box.x + 300, box.x + 60);
ok('glisser à gauche : ' + await pageLbl(), /Page 2 sur/.test(await pageLbl()));
await swipe(box.x + 60, box.x + 300);
ok('glisser à droite : ' + await pageLbl(), /Page 1 sur/.test(await pageLbl()));
await swipe(box.x + 100, box.x + 120);
ok('petit geste ignoré', /Page 1 sur/.test(await pageLbl()));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
