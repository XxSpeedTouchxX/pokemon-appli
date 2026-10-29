// Didacticiel v3 (2026-10-28, retouché le 2026-10-29) : question à la première installation, choix du starter ; visite
// en 11 étapes (fiche du Pokémon retirée) où l'on
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
    // Valeur : part de la section hors du cadre ; radar : le cadre englobe le titre et la carte, pas les lignes dessous ;
    // PK shop : carré centré sur l'icône.
    const sec = document.querySelector('section[aria-label="Valeur de ma collection"]'), rs = sec && sec.getBoundingClientRect();
    const clip = rs ? Math.round(Math.max(0, f.top - rs.top) + Math.max(0, rs.bottom - f.bottom)) : -1;
    const shop = document.querySelector('section[aria-label="Boutiques près de toi"]'), kids = shop ? [...shop.children] : [];
    const radar = kids.length > 2 ? (kids[1].getBoundingClientRect().bottom <= f.bottom + 1 && kids[2].getBoundingClientRect().bottom > f.bottom + 4 ? 'ok' : 'cadre ' + Math.round(f.bottom)) : '';
    const ico = document.querySelector('nav button[aria-label="PK shop"] svg').getBoundingClientRect();
    const off = Math.round(Math.hypot(f.left + f.width / 2 - ico.left - ico.width / 2, f.top + f.height / 2 - ico.top - ico.height / 2));
    return { t: document.querySelector('.pkm-tt-full').textContent, overlap: Math.round(overlap), fh: Math.round(f.height), fw: Math.round(f.width), clip: clip, radar: radar, off: off, top: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-top'),
      fresh: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-fresh'), nav: [...document.querySelectorAll('nav button[aria-current="page"]')].map(b => b.getAttribute('aria-label')).join('') };
  });
  if (!info) break;
  steps.push(info);
  await page.screenshot({ path: shot('tuto-' + String(k + 2).padStart(2, '0') + '.png') });
  await page.locator('.pkm-tt-next').click(); await page.waitForTimeout(80);
  await page.locator('.pkm-tt-next').click().catch(() => {}); // la 1re touche termine la phrase, la 2e avance
}
ok(steps.length + ' étapes', steps.length === 11);
ok('cadre jamais sous la bulle (' + steps.map(x => x.overlap).join(',') + ')', steps.every(x => x.overlap <= 2 && x.fh > 20));
ok('valeur, classeur, scan, radar, séries', /valeur/.test(steps[0].t) && /classeur/.test(steps[1].t) && /scanne/.test(steps[2].t) && /radar/.test(steps[3].t) && /séries/.test(steps[4].t));
ok('Pokédex en 3 étapes, bulle en haut, « Nouveau », sans la fiche', [5, 6, 7].every(i => steps[i].top && steps[i].fresh && steps[i].nav === 'Jeux') && /Pokédex/.test(steps[5].t) && /Tous les Pokémon/.test(steps[6].t) && /évolution/.test(steps[7].t) && !steps.some(x => /Sa fiche/.test(x.t)));
ok('PA à récupérer, puis PK shop : « ' + steps[9].t + ' » (cadre ' + steps[9].fw + ' × ' + steps[9].fh + ', écart au centre de l’icône ' + steps[9].off + ' px)', /récupérer tes PA/.test(steps[8].t) && /Dans l’onglet PK shop, tu pourras acheter plein d’items grâce à tes PK gagnés/.test(steps[9].t) && steps[9].nav === 'Accueil' && steps[9].fw <= 60 && steps[9].fh <= 60 && steps[9].off <= 2);
ok('fin : « tu pourras me trouver ici »', /tu pourras me trouver ici/.test(steps[10].t));
ok('valeur entière dans le cadre (' + steps[0].clip + ' px coupés) ; radar sans ses petites lignes (' + steps[3].radar + ')', steps[0].clip <= 2 && steps[3].radar === 'ok');
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
