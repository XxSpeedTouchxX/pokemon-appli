// Didacticiel (2026-10-25 ; refait le 2026-10-28) : question à la première installation, choix du starter (qui devient
// le compagnon et le Pokémon du Pokédex), visite en 9 étapes : chaque partie encadrée, le starter qui parle (bouche
// ouverte et fermée en alternance, texte qui s'écrit), fin sur la place du compagnon où le starter saute.
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
const t0 = Date.now();
await pick.locator('button[aria-label="Choisir Salamèche"]').click();
const bubble = page.locator('section.pkm-tuto-bubble');
await bubble.waitFor({ timeout: 3000 });
// Pendant l'écriture : texte partiel, bouche qui s'ouvre au moins une fois, mascotte Salamèche.
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
  return seen;
});
ok('texte qui s’écrit, bouche qui s’ouvre et se ferme (' + JSON.stringify(talk) + ')', talk.partial && talk.open > 0 && talk.closed > 0 && /talk\/4-1\.png$/.test(talk.src));
await page.screenshot({ path: shot('tuto-1-parle.png') });
const steps = []; let last = '';
while (Date.now() - t0 < 70000) {
  if (!(await bubble.count())) break;
  const t = (await page.locator('.pkm-tt-full').textContent().catch(() => '')).trim();
  if (t && t !== last) {
    last = t;
    await page.waitForTimeout(900);
    const fr = await page.evaluate(() => {
      const f = document.querySelector('.pkm-tt-frame'), r = f && f.getBoundingClientRect();
      return { w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0, nav: [...document.querySelectorAll('nav button[aria-current="page"]')].map(b => b.getAttribute('aria-label')).join('') };
    });
    steps.push({ t: t, fr: fr });
    const n = steps.length;
    if ([2, 3, 6, 7, 8, 9].indexOf(n) >= 0) await page.screenshot({ path: shot('tuto-' + (n + 1) + '-etape.png') });
  }
  await page.waitForTimeout(120);
}
const dur = Date.now() - t0;
ok(steps.length + ' étapes en ' + Math.round(dur / 1000) + ' s', steps.length === 9 && dur <= 70000);
ok('chaque étape encadre ce dont elle parle', steps.every(x => x.fr.w > 30 && x.fr.h > 30));
ok('valeur, classeur, scan, radar, séries, jeux, shop, Pokédex', /valeur/.test(steps[0].t) && /classeur/.test(steps[1].t) && /scanne/.test(steps[2].t) && /radar/.test(steps[3].t) && /séries/.test(steps[4].t) && /PK/.test(steps[5].t) && /shop/.test(steps[6].t) && /Pokédex/.test(steps[7].t));
ok('onglets ouverts : séries, Jeux, PK shop', steps[4].fr.nav === 'Toutes les séries' && steps[5].fr.nav === 'Jeux' && steps[6].fr.nav === 'PK shop');
ok('fin : « Maintenant que tu connais toute l’appli, tu pourras me trouver ici ! »', /Maintenant que tu connais toute l’appli, tu pourras me trouver ici/.test(steps[8].t));
await page.waitForTimeout(1200);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { tuto: d.tuto, evo: d.evo, buddy: d.buddy }; });
ok('Salamèche : starter, compagnon et Pokédex ; didacticiel vu ; calque retiré', st.tuto === 'done' && st.evo && st.evo.line === 'sala' && st.buddy === 4 && (await page.locator('.pkm-tuto-host').count()) === 0);
await page.screenshot({ path: shot('tuto-11-fin.png') });
// Revoir le didacticiel avec un Pokémon déjà évolué : pas de nouveau choix, évolution gardée ; « Suivant » et « Passer ».
await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); d.evo = { line: 'sala', stage: 1 }; d.buddy = 5; d.pkOwn = (d.pkOwn || []).concat([5]); localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); });
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').click(); await page.waitForTimeout(900);
ok('revoir : visite directe, sans choix du starter', (await page.locator('section[aria-label="Choisis ton starter"]').count()) === 0 && (await bubble.count()) === 1);
await page.locator('.pkm-tt-next').click(); await page.waitForTimeout(100);
const full = await page.evaluate(() => document.querySelector('.pkm-tt-typed').textContent === document.querySelector('.pkm-tt-full').textContent);
ok('« Suivant » termine d’abord la phrase', full);
await page.locator('.pkm-tt-skip').click(); await page.waitForTimeout(400);
const st2 = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { evo: d.evo, buddy: d.buddy, tuto: d.tuto }; });
ok('« Passer » arrête ; évolution gardée (' + JSON.stringify(st2) + ')', st2.evo.stage === 1 && st2.buddy === 5 && st2.tuto === 'done' && (await bubble.count()) === 0);
// « Non merci ».
await page.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1000);
await page.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Non merci")').click(); await page.waitForTimeout(300);
ok('« Non merci » ferme la question', (await page.locator('section[role="dialog"][aria-label="Didacticiel"]').count()) === 0);
await page.goto(E2E + '/?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(800);
ok('plus de question ensuite', (await page.locator('section[role="dialog"][aria-label="Didacticiel"]').count()) === 0);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
