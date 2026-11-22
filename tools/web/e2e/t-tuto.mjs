// Didacticiel v3 (2026-10-28, retouché le 2026-10-29) : question à la première installation, choix du starter ; visite
// en 12 étapes (2026-10-30 : textes du porteur, PA dans le Pokédex et solde des PK ajoutés, « Tous les Pokémon » retiré) où l'on
// avance en touchant « Suivant » (rien n'avance seul) ; chaque partie encadrée sans être cachée par la bulle ; la place
// du compagnon reste vide jusqu'à la fin, où le starter y saute ; Pokédex présenté en détail (bulle en haut).
// 2026-11-22 (porteur) : 14 étapes (« Le coin des dresseurs » et ses 4 rubriques, puis les jeux à PK, après les
// séries) ; voix coupée (aucun son joué, bouton du son caché) ; anneau de l'onglet centré sur son icône ; cadre du
// solde de PK ovale ; « Mon classeur » dans son cadre ; cadres jamais sur l'anneau ; « PK et PA gagnés » ; fin sans
// message « À toi de jouer ».
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
// Sons : chaque oscillateur ou voix créé est compté (le didacticiel de départ n'en joue plus aucun).
await ctx.addInitScript(() => {
  window.__snd = 0;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) { const o = AC.prototype.createOscillator; AC.prototype.createOscillator = function () { window.__snd++; return o.apply(this, arguments); }; }
  try { if (window.speechSynthesis) { const sp = window.speechSynthesis.speak.bind(window.speechSynthesis); window.speechSynthesis.speak = u => { window.__snd++; return sp(u); }; } } catch (e) { /* rien */ }
});
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
for (let k = 0; k < 18; k++) {
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
    const paBar = document.querySelector('header .pkm-pa-bar'), paGap = paBar ? Math.round(paBar.getBoundingClientRect().top - f.bottom) : null;
    // Anneau de l'onglet : centré sur l'icône visible du bouton, jamais sous le cadre.
    const ringEl = document.querySelector('.pkm-tt-ring'), ring = ringEl && getComputedStyle(ringEl).display !== 'none' ? ringEl.getBoundingClientRect() : null;
    const cur = document.querySelector('nav[aria-label="Navigation principale"] > button[aria-current="page"]');
    const ic = cur && [...cur.querySelectorAll('svg, img')].map(e => e.getBoundingClientRect()).find(r => r.width > 0);
    const ringOff = ring && ic ? Math.round(Math.hypot(ring.left + ring.width / 2 - ic.left - ic.width / 2, ring.top + ring.height / 2 - ic.top - ic.height / 2)) : null;
    const ringHit = ring ? Math.round(Math.max(0, Math.min(f.right, ring.right) - Math.max(f.left, ring.left)) * Math.max(0, Math.min(f.bottom, ring.bottom) - Math.max(f.top, ring.top))) : 0;
    const k6 = document.querySelector('section[aria-label="Mon classeur"] > div'), k6r = k6 && k6.getBoundingClientRect();
    const titleIn = k6r ? k6r.top >= f.top - 1 && k6r.bottom <= f.bottom + 1 : null;
    const snd = document.querySelector('.pkm-tt-snd');
    return { ringOff: ringOff, ringHit: ringHit, titleIn: titleIn, sndHidden: !!(snd && snd.hidden && getComputedStyle(snd).visibility === 'hidden'), rad: parseFloat(getComputedStyle(document.querySelector('.pkm-tt-frame')).borderTopLeftRadius), paGap: paGap, prev: !document.querySelector('.pkm-tt-prev').hidden, t: document.querySelector('.pkm-tt-full').textContent, overlap: Math.round(overlap), fh: Math.round(f.height), fw: Math.round(f.width), clip: clip, radar: radar, off: off, top: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-top'),
      fresh: /Nouveau/.test(document.querySelector('.pkm-tuto-bubble').innerText), nav: [...document.querySelectorAll('nav button[aria-current="page"]')].map(b => b.getAttribute('aria-label')).join('') };
  });
  if (!info) break;
  steps.push(info);
  await page.screenshot({ path: shot('tuto-' + String(k + 2).padStart(2, '0') + '.png') });
  await page.locator('.pkm-tt-next').click(); await page.waitForTimeout(80);
  await page.locator('.pkm-tt-next').click().catch(() => {}); // la 1re touche termine la phrase, la 2e avance
}
ok(steps.length + ' étapes', steps.length === 14);
ok('cadre jamais sous la bulle (' + steps.map(x => x.overlap).join(',') + ')', steps.every(x => x.overlap <= 2 && x.fh > 20));
ok('valeur, classeur, scan, radar, séries', /valeur/.test(steps[0].t) && /Ici, tu pourras trouver ton classeur/.test(steps[1].t) && /Scan Dropicards/.test(steps[2].t) && /radar des boutiques/.test(steps[3].t) && /toutes les séries et leurs extensions/.test(steps[4].t));
ok('« Mon classeur » entier dans son cadre', steps[1].titleIn === true);
ok('coin des dresseurs : 4 rubriques, onglet du coin (' + steps[5].nav + ')', steps[5].nav === 'Le coin des dresseurs' && /4 rubriques/.test(steps[5].t) && ['Ma ligue :', 'Ma vitrine :', 'Parrainer un ami :', 'Calendrier JCC :'].every(w => steps[5].t.indexOf(w) >= 0) && /points de loyauté/.test(steps[5].t));
ok('jeux à PK juste après (' + steps[6].nav + ')', steps[6].nav === 'Jeux' && /jeux à PK : des jeux quotidiens qui te feront gagner des PK/.test(steps[6].t));
ok('Pokédex en 3 étapes (Pokédex, PA, arbre d’évolution), bulle en haut, sans étiquette « Nouveau » (retirée le 2026-10-31)', steps.every(x => !x.fresh) && [7, 8, 9].every(i => steps[i].top && steps[i].nav === 'Jeux') && /Voici ton Pokédex : tu pourras y voir ton compagnon/.test(steps[7].t) && /points d’Aura/.test(steps[8].t) && /arbre d’évolution/.test(steps[9].t) && !steps.some(x => /Tous les Pokémon|Sa fiche/.test(x.t)));
ok('anneau de l’onglet centré sur son icône (' + steps.map(x => x.ringOff).filter(v => v !== null).join(',') + ')', steps.filter(x => x.ringOff !== null).length >= 8 && steps.every(x => x.ringOff === null || x.ringOff <= 1));
ok('cadre jamais sur l’anneau (' + steps.map(x => x.ringHit).join(',') + ')', steps.every(x => x.ringHit === 0));
ok('bouton « Étape précédente » caché à la 1re étape, visible ensuite', !steps[0].prev && steps.slice(1).every(x => x.prev));
ok('cadre du solde de PK sans mordre sur le solde de PA (' + steps[11].paGap + ' px) et ovale comme celui des PA (' + steps[11].rad + ' / ' + steps[10].rad + ' px)', steps[11].paGap >= 0 && steps[11].rad >= 20 && steps[10].rad >= 20);
ok('solde de PA, puis solde de PK : « ' + steps[11].t + ' »', /récupérer tes PA/.test(steps[10].t) && /tes PK : ils te serviront à acheter des items/.test(steps[11].t));
ok('PK shop (cadre ' + steps[12].fw + ' × ' + steps[12].fh + ', écart au centre de l’icône ' + steps[12].off + ' px)', /Dans l’onglet PK shop, tu pourras acheter plein d’items grâce à tes PK et PA gagnés/.test(steps[12].t) && steps[12].nav === 'Accueil' && steps[12].fw <= 60 && steps[12].fh <= 60 && steps[12].off <= 2);
ok('fin : « tu pourras me trouver ici »', /tu pourras me trouver ici/.test(steps[13].t));
ok('voix coupée : aucun son joué, bouton du son caché (' + await page.evaluate(() => window.__snd) + ' son)', steps.every(x => x.sndHidden) && (await page.evaluate(() => window.__snd)) === 0);
ok('valeur entière dans le cadre (' + steps[0].clip + ' px coupés) ; radar sans ses petites lignes (' + steps[3].radar + ')', steps[0].clip <= 2 && steps[3].radar === 'ok');
ok('plus de booster ni de pièce présentés', !steps.some(x => /booster|pièce|mini-jeux/i.test(x.t)));
await page.waitForTimeout(1400);
const st = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1')); return { tuto: d.tuto, evo: d.evo, buddy: d.buddy }; });
const slot = await page.evaluate(() => getComputedStyle(document.querySelector('button[aria-label^="Compagnon : "] img')).visibility);
const endToast = await page.evaluate(() => document.body.innerText.indexOf('À toi de jouer') >= 0);
ok('fin sans message « À toi de jouer »', !endToast);
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
// Petit écran (iPhone SE) : le montant de la valeur n'est pas caché par la bulle ; changement d'onglet en « iris ».
const ctx2 = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 });
await ctx2.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await p2.waitForTimeout(1200);
await p2.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').click(); await p2.waitForTimeout(400);
await p2.locator('section[aria-label="Choisis ton starter"] button[aria-label="Choisir Pikachu"]').click(); await p2.waitForTimeout(2200);
const cut = await p2.evaluate(() => { const n = document.querySelector('section[aria-label="Valeur de ma collection"] .pkm-strict-text').getBoundingClientRect(), b = document.querySelector('.pkm-tuto-bubble').getBoundingClientRect(), f = document.querySelector('.pkm-tt-frame').getBoundingClientRect();
  return { hidden: Math.round(Math.max(0, Math.min(n.bottom, b.bottom) - Math.max(n.top, b.top))), inFrame: n.top >= f.top - 1 && n.bottom <= f.bottom + 1 }; });
ok('petit écran : montant entier, hors de la bulle et dans le cadre (' + JSON.stringify(cut) + ')', cut.hidden === 0 && cut.inFrame);
await p2.screenshot({ path: shot('tuto-petit-ecran.png') });
for (let k = 0; k < 3; k++) { await p2.locator('.pkm-tt-next').click(); await p2.waitForTimeout(80); await p2.locator('.pkm-tt-next').click().catch(() => {}); await p2.waitForTimeout(1300); }
await p2.locator('.pkm-tt-next').click(); await p2.waitForTimeout(80); await p2.locator('.pkm-tt-next').click().catch(() => {}); await p2.waitForTimeout(150);
const iris = await p2.evaluate(() => ({ iris: document.querySelector('.pkm-tt-frame').classList.contains('pkm-tt-iris'), op: getComputedStyle(document.querySelector('.pkm-tt-frame')).opacity }));
await p2.waitForTimeout(1500);
const after = await p2.evaluate(() => ({ iris: document.querySelector('.pkm-tt-frame').classList.contains('pkm-tt-iris'), t: document.querySelector('.pkm-tt-full').textContent }));
ok('radar → séries : le cadre se referme sans flash (' + JSON.stringify(iris) + ') puis se rouvre sur les séries', iris.iris && iris.op === '1' && !after.iris && /séries/.test(after.t));
// Séries : la barre défile lentement de gauche à droite pendant que le compagnon parle.
const sl = [];
for (let k = 0; k < 3; k++) { sl.push(await p2.evaluate(() => document.querySelector('nav[aria-label="Aller à une série"]').scrollLeft)); await p2.waitForTimeout(1500); }
ok('séries : défilement lent ' + sl.join(' → '), sl[2] > sl[1] && sl[1] > sl[0]);
// « Étape précédente » : retour au radar.
await p2.locator('.pkm-tt-prev').click(); await p2.waitForTimeout(1600);
ok('« Étape précédente » ramène au radar', /radar des boutiques/.test(await p2.locator('.pkm-tt-full').textContent()));
await ctx2.close();
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
