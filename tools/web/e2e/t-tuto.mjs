// Didacticiel v3 (2026-10-28) : question à la première installation, choix du starter ; visite en 12 étapes où l'on
// avance en touchant « Suivant » (rien n'avance seul) ; chaque partie encadrée sans être cachée par la bulle ; la place
// du compagnon reste vide jusqu'à la fin, où le starter y saute ; Pokédex présenté en détail (bulle en haut).
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1200);
const ask = page.locator('section[role="dialog"][aria-label="Didacticiel"]');
ok('question : « Veux-tu suivre le didacticiel ? »', (await ask.count()) === 1 && /Veux-tu suivre le didacticiel/.test(await ask.innerText()));
await ask.locator('button:has-text("Oui")').click(); await page.waitForTimeout(400);
const pick = page.locator('section[aria-label="Choisis ton starter"]');
ok('starters : ' + (await pick.locator('button').allInnerTexts()).join(', '), (await pick.locator('button').allInnerTexts()).join(',') === 'Bulbizarre,Salamèche,Carapuce,Pikachu');
await pick.locator('button[aria-label="Choisir Salamèche"]').click();
const bubble = page.locator('section.pkm-tuto-bubble');
await bubble.waitFor({ timeout: 3000 });
await page.waitForTimeout(700);
const talk = await page.evaluate(async () => {
  const seen = { open: 0, closed: 0, partial: false };
  for (let k = 0; k < 30; k++) {
    const m = document.querySelector('.pkm-tt-mon'), t = document.querySelector('.pkm-tt-typed'), f = document.querySelector('.pkm-tt-full');
    if (m.classList.contains('pkm-tt-talk')) seen.open++; else seen.closed++;
    if (t.textContent.length > 0 && t.textContent.length < f.textContent.length) seen.partial = true;
    await new Promise(r => setTimeout(r, 40));
  }
  seen.src = document.querySelector('.pkm-tt-m1').getAttribute('src');
  seen.slot = getComputedStyle(document.querySelector('button[aria-label^="Compagnon : "] img')).visibility;
  return seen;
});
ok('texte qui s’écrit, bouche qui bouge (' + JSON.stringify(talk) + ')', talk.partial && talk.open > 0 && talk.closed > 0 && /talk\/4-1\.png$/.test(talk.src));
ok('place du compagnon vide pendant la visite', talk.slot === 'hidden');
// Rien n'avance seul.
const t0 = (await page.locator('.pkm-tt-full').textContent()).trim();
await page.waitForTimeout(7000);
ok('pas d’avance automatique (7 s)', (await page.locator('.pkm-tt-full').textContent()).trim() === t0);
await page.screenshot({ path: shot('tuto-01.png') });
const steps = [];
for (let k = 0; k < 14; k++) {
  if (!(await bubble.count())) break;
  await page.waitForTimeout(1400);
  const info = await page.evaluate(() => {
    if (!document.querySelector('.pkm-tt-frame') || document.querySelector('.pkm-tt-out')) return null;
    const f = document.querySelector('.pkm-tt-frame').getBoundingClientRect(), b = document.querySelector('.pkm-tuto-bubble').getBoundingClientRect();
    const overlap = Math.max(0, Math.min(f.bottom, b.bottom) - Math.max(f.top, b.top));
    return { t: document.querySelector('.pkm-tt-full').textContent, overlap: Math.round(overlap), fh: Math.round(f.height), top: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-top'),
      fresh: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-fresh'), nav: [...document.querySelectorAll('nav button[aria-current="page"]')].map(b => b.getAttribute('aria-label')).join('') };
  });
  if (!info) break;
  steps.push(info);
  await page.screenshot({ path: shot('tuto-' + String(k + 2).padStart(2, '0') + '.png') });
  await page.locator('.pkm-tt-next').click(); await page.waitForTimeout(80);
  await page.locator('.pkm-tt-next').click().catch(() => {}); // la 1re touche termine la phrase, la 2e avance
}
ok(steps.length + ' étapes', steps.length === 12);
ok('cadre jamais sous la bulle (' + steps.map(x => x.overlap).join(',') + ')', steps.every(x => x.overlap <= 2 && x.fh > 20));
ok('valeur, classeur, scan, radar, séries', /valeur/.test(steps[0].t) && /classeur/.test(steps[1].t) && /scanne/.test(steps[2].t) && /radar/.test(steps[3].t) && /séries/.test(steps[4].t));
ok('Pokédex en 4 étapes, bulle en haut, « Nouveau »', [5, 6, 7, 8].every(i => steps[i].top && steps[i].fresh && steps[i].nav === 'Jeux') && /Pokédex/.test(steps[5].t) && /Tous les Pokémon/.test(steps[6].t) && /évolution/.test(steps[7].t) && /fiche/.test(steps[8].t));
ok('PA à récupérer, puis PK shop annoncé sans le présenter', /récupérer tes PA/.test(steps[9].t) && /PK shop/.test(steps[10].t) && steps[10].nav === 'Accueil');
ok('fin : « tu pourras me trouver ici »', /tu pourras me trouver ici/.test(steps[11].t));
ok('plus de booster ni de pièce présentés', !steps.some(x => /booster|pièce|mini-jeux/i.test(x.t)));
await page.waitForTimeout(1400);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { tuto: d.tuto, evo: d.evo, buddy: d.buddy }; });
const slot = await page.evaluate(() => getComputedStyle(document.querySelector('button[aria-label^="Compagnon : "] img')).visibility);
ok('Salamèche de retour à sa place ; didacticiel vu', st.tuto === 'done' && st.evo && st.evo.line === 'sala' && st.buddy === 4 && slot === 'visible' && (await page.locator('.pkm-tuto-host').count()) === 0);
await page.screenshot({ path: shot('tuto-14-fin.png') });
// Revoir : pas de nouveau choix ; « Passer ».
await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); d.evo = { line: 'sala', stage: 1 }; d.buddy = 5; d.pkOwn = (d.pkOwn || []).concat([5]); localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); });
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').click(); await page.waitForTimeout(900);
ok('revoir : visite directe, sans choix du starter', (await page.locator('section[aria-label="Choisis ton starter"]').count()) === 0 && (await bubble.count()) === 1);
await page.locator('.pkm-tt-skip').click();
await page.waitForFunction(() => !document.querySelector('section.pkm-tuto-bubble') && JSON.parse(localStorage.getItem('pkm-collection-v1')).tuto === 'done', null, { timeout: 5000 }).catch(() => {});
const st2 = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { evo: d.evo, buddy: d.buddy, tuto: d.tuto }; });
ok('« Passer » arrête ; évolution gardée (' + JSON.stringify(st2) + ')', st2.evo.stage === 1 && st2.buddy === 5 && st2.tuto === 'done' && (await bubble.count()) === 0);
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1000);
await page.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Non merci")').click(); await page.waitForTimeout(300);
ok('« Non merci » ferme la question', (await page.locator('section[role="dialog"][aria-label="Didacticiel"]').count()) === 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
