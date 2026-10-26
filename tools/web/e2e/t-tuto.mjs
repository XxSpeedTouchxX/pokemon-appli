// Didacticiel (2026-10-25) : question à la première installation, choix du starter (qui devient le compagnon et le
// Pokémon du jeu d'évolution), visite des 4 onglets en 7 bulles courtes, 45 s au plus, fin sur les PA.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1200);
const ask = page.locator('section[role="dialog"][aria-label="Didacticiel"]');
ok('question : « Veux-tu suivre le didacticiel ? »', (await ask.count()) === 1 && /Veux-tu suivre le didacticiel/.test(await ask.innerText()));
await page.screenshot({ path: shot('tuto-1-question.png') });
await ask.locator('button:has-text("Oui")').click(); await page.waitForTimeout(400);
const pick = page.locator('section[aria-label="Choisis ton starter"]');
ok('starters : ' + (await pick.locator('button').allInnerTexts()).join(', '), (await pick.locator('button').allInnerTexts()).join(',') === 'Bulbizarre,Salamèche,Carapuce,Pikachu');
await page.screenshot({ path: shot('tuto-2-starter.png') });
const t0 = Date.now();
await pick.locator('button[aria-label="Choisir Bulbizarre"]').click();
const bubble = page.locator('section.pkm-tuto-bubble');
await bubble.waitFor({ timeout: 3000 });
const texts = [], screens = [];
let last = '';
while (Date.now() - t0 < 50000) {
  if (!(await bubble.count())) break;
  const t = (await bubble.locator('.pkm-tuto-text').innerText().catch(() => '')).trim();
  if (t && t !== last) {
    last = t; texts.push(t);
    await page.waitForTimeout(700);
    screens.push(await page.evaluate(() => ({ focus: !!document.querySelector('.pkm-tuto-focus'), nav: [...document.querySelectorAll('nav button[aria-current="page"]')].map(b => b.getAttribute('aria-label')).join('') })));
    if (texts.length === 1) await page.screenshot({ path: shot('tuto-3-portefeuille.png') });
    if (texts.length === 5) await page.screenshot({ path: shot('tuto-4-jeux.png') });
    if (texts.length === 7) await page.screenshot({ path: shot('tuto-5-pa.png') });
  }
  await page.waitForTimeout(150);
}
const dur = Date.now() - t0;
ok('7 bulles en ' + Math.round(dur / 1000) + ' s (45 s au plus)', texts.length === 7 && dur <= 45000);
ok('phrases courtes (' + Math.max(...texts.map(t => t.length)) + ' caractères au plus)', texts.every(t => t.length <= 130));
ok('portefeuille, classeur, radar sur l’accueil', /portefeuille/.test(texts[0]) && /classeur/.test(texts[1]) && /radar/i.test(texts[2]));
ok('séries, jeux et PK, shop', /séries/.test(texts[3]) && /PK/.test(texts[4]) && /shop/.test(texts[5]));
ok('fin sur les PA et leur barème', /PA/.test(texts[6]) && /\+10, \+15, \+20, \+25, puis \+30/.test(texts[6]));
ok('chaque bulle met en avant ce dont elle parle (accueil)', screens.slice(0, 3).every(x => x.focus));
await page.waitForTimeout(900);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { tuto: d.tuto, evo: d.evo, buddy: d.buddy }; });
ok('Bulbizarre : starter, compagnon et jeu d’évolution ; didacticiel vu', st.tuto === 'done' && st.evo && st.evo.line === 'bulbi' && st.buddy === 1);
// « Non merci ».
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1000);
await page.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Non merci")').click(); await page.waitForTimeout(300);
ok('« Non merci » ferme la question', (await page.locator('section[role="dialog"][aria-label="Didacticiel"]').count()) === 0);
await page.goto(E2E + '/?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(800);
ok('plus de question ensuite', (await page.locator('section[role="dialog"][aria-label="Didacticiel"]').count()) === 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
