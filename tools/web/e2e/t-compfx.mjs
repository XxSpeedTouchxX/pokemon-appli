// « Choisir comme compagnon » animé (2026-11-20, porteur : « une petite animation de 2 s qui montre le Pokémon qui est OK
// comme compagnon, propose-moi des choses ») : 4 propositions (?compvis=1 à 4), texte « X t’accompagne » dans
// l'animation, retirée au bout de 2 s ; 4 : vol vers le bouton Accueil de la barre du bas.
import { unlockPaid, launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
for (const v of [1, 2, 3, 4]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  const URL = E2E + '/?today=2026-10-04&debug' + (v === 1 ? '' : '&compvis=' + v);
  await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(1000);
  await page.evaluate(k => { const d = JSON.parse(localStorage.getItem(k) || '{}'); Object.assign(d, { tuto: 'done', onb: 0 }); localStorage.setItem(k, JSON.stringify(d)); }, KEY);
  await unlockPaid(page);
  await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  // Salamèche débloqué (forme de base), compagnon actuel Bulbizarre ; Pokédex ouvert sur Salamèche.
  await page.evaluate(() => window.__pkm.dexOpen(1)); await page.waitForTimeout(1400);
  await page.click('[aria-label="Starters"] button[aria-label="Choisir Bulbizarre comme starter"]'); await page.waitForTimeout(700);
  await page.evaluate(() => { const p = window.__pkm, s = p.st(); p.setState({ pkOwn: Array.from(new Set((s.pkOwn || []).concat([4]))) }); });
  await page.evaluate(() => window.__pkm.dexOpen(4)); await page.waitForTimeout(1400);
  const act = page.locator('section[aria-label="Fiche du Pokémon"] .pkm-dex-act-btn');
  ok('v' + v + ' : bouton « ' + (await act.innerText().catch(() => '?')) + ' »', (await act.count()) === 1 && (await act.innerText()) === 'Choisir comme compagnon');
  await act.click();
  await page.waitForTimeout(80);
  const fx = page.locator('.pkm-cmp');
  ok('v' + v + ' : animation ouverte (' + (await fx.getAttribute('class')) + ')', (await fx.count()) === 1 && new RegExp('pkm-cmp-v' + v).test(await fx.getAttribute('class')));
  const txt = (await fx.innerText()).replace(/\s+/g, ' ').trim();
  ok('v' + v + ' : texte « ' + txt + ' »', /Salamèche t’accompagne !/.test(txt));
  const after = await page.evaluate(() => ({ buddy: window.__pkm.st().buddy, toast: window.__pkm.st().toast || '' }));
  ok('v' + v + ' : compagnon enregistré, pas de message « t’accompagne » en bas (' + JSON.stringify(after) + ')', after.buddy === 4 && !/Salamèche/.test(after.toast));
  const img = fx.locator('.pkm-cmp-img img');
  await page.waitForTimeout(700);
  ok('v' + v + ' : Salamèche affiché (' + (await img.getAttribute('src')) + ')', /img\/pokemon\/4\.png$/.test(await img.getAttribute('src')) && await img.evaluate(i => i.complete && i.naturalWidth > 0));
  await page.screenshot({ path: shot('compfx-v' + v + '.png') });
  if (v === 4) {
    const fly = await page.evaluate(() => { const st = document.querySelector('.pkm-cmp-stage'), hb = document.querySelector('nav[aria-label="Navigation principale"] button[aria-label="Accueil"]'); return { fx: st.style.getPropertyValue('--fx'), fy: st.style.getPropertyValue('--fy'), home: hb && hb.classList.contains('pkm-cmp-home') }; });
    ok('v4 : vol mesuré vers le bouton Accueil (' + JSON.stringify(fly) + ')', /px$/.test(fly.fx) && parseInt(fly.fy, 10) > 150 && fly.home);
  }
  await page.waitForTimeout(1500);
  ok('v' + v + ' : animation retirée après 2 s', (await page.locator('.pkm-cmp').count()) === 0);
  await ctx.close();
}
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
if (res.some(r => r.startsWith('✗')) || errors.length) process.exitCode = 1;
