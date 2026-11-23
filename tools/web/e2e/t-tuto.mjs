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
    // Jeux à PK : le titre « Jeux » et le dessin du booster entiers dans le cadre.
    const bst = document.querySelector('section[aria-label="Booster PK"]'), pack = bst && bst.children[1] && bst.children[1].getBoundingClientRect();
    const h1 = [...document.querySelectorAll('h1.pkm-hb-title')].find(e => e.getBoundingClientRect().height > 0), rg = document.createRange();
    if (h1) rg.selectNodeContents(h1);
    const ht = h1 && rg.getBoundingClientRect(), inF = r => r.top >= f.top - 1 && r.bottom <= f.bottom + 1 && r.left >= f.left - 1 && r.right <= f.right + 1;
    const jeuxIn = pack && pack.height > 0 && ht ? (inF(pack) ? '' : 'booster ') + (ht.left >= f.left + 2 && ht.bottom <= f.bottom && ht.top + 6 >= f.top ? '' : 'titre') || 'ok' : null;
    // Pokédex : onglets en haut, « Pokédex » entouré du second anneau, cadre sous les onglets.
    const r2el = document.querySelector('.pkm-tt-ring2'), r2 = r2el && getComputedStyle(r2el).display !== 'none' ? r2el.getBoundingClientRect() : null;
    const gtab = document.querySelector('main .pkm-gm-tabs [aria-selected="true"]'), gt = gtab && gtab.getBoundingClientRect(), gbar = document.querySelector('main .pkm-gm-tabs');
    const tab2 = r2 && gt ? { name: gtab.textContent.trim(), off: Math.round(Math.hypot(r2.left + r2.width / 2 - gt.left - gt.width / 2, r2.top + r2.height / 2 - gt.top - gt.height / 2)), around: r2.top <= gt.top && r2.bottom >= gt.bottom, below: Math.round(f.top - r2.bottom), seen: gt.top >= 0 } : null;
    const snd = document.querySelector('.pkm-tt-snd');
    return { tab2: tab2, jeuxIn: jeuxIn, ringOff: ringOff, ringHit: ringHit, titleIn: titleIn, sndHidden: !!(snd && snd.hidden && getComputedStyle(snd).visibility === 'hidden'), rad: parseFloat(getComputedStyle(document.querySelector('.pkm-tt-frame')).borderTopLeftRadius), paGap: paGap, prev: !document.querySelector('.pkm-tt-prev').hidden, t: document.querySelector('.pkm-tt-full').textContent, overlap: Math.round(overlap), fh: Math.round(f.height), fw: Math.round(f.width), clip: clip, radar: radar, off: off, top: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-top'),
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
ok('jeux à PK juste après (' + steps[6].nav + ') : titre « Jeux » et booster entiers dans le cadre (' + steps[6].jeuxIn + ')', steps[6].nav === 'Jeux' && /Ici, tu retrouveras les jeux à PK : ils te permettent de gagner des PK chaque jour/.test(steps[6].t) && /Booster PK/.test(steps[6].t) && /d’autres jeux t’attendent plus bas dans la page/.test(steps[6].t) && steps[6].jeuxIn === 'ok');
ok('Pokédex en 3 étapes (Pokédex, PA, arbre d’évolution), bulle en bas (2026-11-23), sans étiquette « Nouveau » (retirée le 2026-10-31)', steps.every(x => !x.fresh) && [7, 8, 9].every(i => !steps[i].top && steps[i].nav === 'Jeux') && /Voici ton Pokédex : tu pourras y voir ton compagnon/.test(steps[7].t) && /points d’Aura/.test(steps[8].t) && /arbre d’évolution/.test(steps[9].t) && !steps.some(x => /Tous les Pokémon|Sa fiche/.test(x.t)));
ok('anneau de l’onglet centré sur son icône (' + steps.map(x => x.ringOff).filter(v => v !== null).join(',') + ')', steps.filter(x => x.ringOff !== null).length >= 8 && steps.every(x => x.ringOff === null || x.ringOff <= 1));
// 2026-11-23 (porteur) : jeux à PK et Pokédex avec l'anneau de la manette toujours visible, onglets « Jeux à PK » /
// « Pokédex » visibles en haut du Pokédex, « Pokédex » entouré, cadre dessous.
ok('jeux à PK et Pokédex : anneau de la manette toujours affiché (' + [6, 7, 8, 9].map(i => steps[i].ringOff).join(',') + ')', [6, 7, 8, 9].every(i => steps[i].ringOff !== null && steps[i].ringOff <= 1));
ok('Pokédex : onglet « Pokédex » visible en haut, entouré, au-dessus du cadre (' + JSON.stringify([7, 8, 9].map(i => steps[i].tab2)) + ')', [7, 8, 9].every(i => { const t = steps[i].tab2; return t && t.name === 'Pokédex' && t.off <= 1 && t.around && t.below >= 6 && t.seen; }) && [0, 1, 2, 3, 4, 5, 6, 10, 11, 12].every(i => !steps[i].tab2));
ok('cadre jamais sur l’anneau (' + steps.map(x => x.ringHit).join(',') + ')', steps.every(x => x.ringHit === 0));
ok('bouton « Étape précédente » caché à la 1re étape, visible ensuite', !steps[0].prev && steps.slice(1).every(x => x.prev));
ok('cadre du solde de PK sans mordre sur le solde de PA (' + steps[11].paGap + ' px) et ovale comme celui des PA (' + steps[11].rad + ' / ' + steps[10].rad + ' px)', steps[11].paGap >= 0 && steps[11].rad >= 20 && steps[10].rad >= 20);
ok('solde de PA, puis solde de PK : « ' + steps[11].t + ' »', /récupérer tes PA/.test(steps[10].t) && /tes PK : ils te serviront à acheter des items/.test(steps[11].t));
ok('PK shop (cadre ' + steps[12].fw + ' × ' + steps[12].fh + ', écart au centre de l’icône ' + steps[12].off + ' px)', /Dans l’onglet PK shop, tu pourras acheter plein d’items grâce à tes PK et PA gagnés/.test(steps[12].t) && steps[12].nav === 'Accueil' && steps[12].fw <= 60 && steps[12].fh <= 60 && steps[12].off <= 2);
ok('fin : « tu pourras me trouver ici »', /tu pourras me trouver ici/.test(steps[13].t));
ok('voix coupée : aucun son joué, bouton du son caché (' + await page.evaluate(() => window.__snd) + ' son)', steps.every(x => x.sndHidden) && (await page.evaluate(() => window.__snd)) === 0);
ok('valeur entière dans le cadre (' + steps[0].clip + ' px coupés) ; radar sans ses petites lignes (' + steps[3].radar + ')', steps[0].clip <= 2 && steps[3].radar === 'ok');
ok('booster seulement dans l’étape des jeux à PK, pièce jamais', steps.every((x, i) => i === 6 || !/booster|pièce|mini-jeux/i.test(x.t)) && !/pièce/i.test(steps[6].t));
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
// Petit écran d'iPhone dans Safari (390 × 664, 2026-11-23, porteur : « les PA ne sont pas bien encadrés », « fais en sorte
// de bien voir l'arbre ») : PA dans un cadre large, appareil entier sous les onglets ; arbre de Salamèche (le plus haut,
// avec ses 2 méga-évolutions) presque à sa taille, bulle en haut, onglets et anneau de la manette visibles.
const ctx3 = await browser.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 1 });
await ctx3.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const p3 = await ctx3.newPage(); p3.on('pageerror', e => errors.push(e.message));
await p3.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await p3.waitForTimeout(1200);
await p3.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').click(); await p3.waitForTimeout(400);
await p3.locator('section[aria-label="Choisis ton starter"] button[aria-label="Choisir Salamèche"]').click(); await p3.waitForTimeout(1600);
const geo3 = async () => p3.evaluate(() => {
  const R = e => e && e.getBoundingClientRect(), f = R(document.querySelector('.pkm-tt-frame')), b = R(document.querySelector('.pkm-tuto-bubble'));
  const r2el = document.querySelector('.pkm-tt-ring2'), r2 = r2el && getComputedStyle(r2el).display !== 'none' ? R(r2el) : null;
  const ringEl = document.querySelector('.pkm-tt-ring'), ring = ringEl && getComputedStyle(ringEl).display !== 'none' ? R(ringEl) : null;
  const gt = R(document.querySelector('main .pkm-gm-tabs [aria-selected="true"]')), lcd = R(document.querySelector('.pkm-dex-lcd-r')), dev = R(document.querySelector('.pkm-dex-device'));
  const tree = document.querySelector('[aria-label="Route d’évolution"]'), tr = R(tree), k = tree ? tr.height / tree.offsetHeight : 0;
  const bar = R(document.querySelector('main .pkm-gm-tabs'));
  return { t: document.querySelector('.pkm-tt-full').textContent.slice(0, 80), top: document.querySelector('.pkm-tuto-bubble').classList.contains('pkm-tt-top'),
    ring: !!ring, tab2: !!(r2 && gt && r2.top <= gt.top && r2.bottom >= gt.bottom && gt.top >= 0), over: Math.round(Math.max(0, Math.min(f.bottom, b.bottom) - Math.max(f.top, b.top))),
    lcdM: lcd ? Math.round(Math.min(lcd.left - f.left, f.right - lcd.right, lcd.top - f.top, f.bottom - lcd.bottom)) : null, devUnder: dev && bar ? Math.round(dev.top - bar.bottom) : null,
    treeIn: tr ? tr.top >= f.top - 1 && tr.bottom <= f.bottom + 1 : null, k: Math.round(k * 100) / 100, r2f: r2 ? Math.round(f.top - r2.bottom) : null };
});
const g3 = {};
for (let k = 0; k < 10; k++) {
  await p3.locator('.pkm-tt-next').click(); await p3.waitForTimeout(80); await p3.locator('.pkm-tt-next').click().catch(() => {}); await p3.waitForTimeout(1500);
  const g = await geo3();
  if (/points d’Aura/.test(g.t)) g3.pa = g;
  if (/arbre d’évolution/.test(g.t)) { g3.tree = g; await p3.screenshot({ path: shot('tuto-arbre-petit-ecran.png') }); break; }
}
ok('petit écran, PA : cadre large autour de l’écran des PA (' + (g3.pa && g3.pa.lcdM) + ' px), appareil entier sous les onglets (' + (g3.pa && g3.pa.devUnder) + ' px), « Pokédex » entouré, anneau de la manette', !!g3.pa && g3.pa.lcdM >= 8 && g3.pa.devUnder >= 0 && g3.pa.tab2 && g3.pa.ring && g3.pa.over === 0);
ok('petit écran, arbre : presque à sa taille (×' + (g3.tree && g3.tree.k) + '), entier dans le cadre, bulle en haut, onglets et anneau visibles (' + JSON.stringify(g3.tree) + ')', !!g3.tree && g3.tree.k >= 0.7 && g3.tree.treeIn && g3.tree.top && g3.tree.tab2 && g3.tree.ring && g3.tree.over === 0 && g3.tree.r2f >= 6);
await ctx3.close();
// Didacticiel revu avec un compagnon qui n'évolue pas (2026-11-23, porteur : « on n'arrive toujours pas à voir l'arbre ») :
// Kyogre seul n'a pas d'arbre ; l'étape de l'arbre montre celui de la mascotte (Salamèche → Dracaufeu), le Pokédex
// montre Kyogre aux autres étapes, et Kyogre revient à la fin.
const ctx4 = await browser.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 1 });
await ctx4.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const p4 = await ctx4.newPage(); p4.on('pageerror', e => errors.push(e.message));
await p4.goto(E2E + '/?today=2026-10-04', { waitUntil: 'load' }); await p4.waitForTimeout(800);
await p4.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.evo = { line: 'sala', stage: 0 }; d.buddy = 382; d.pkOwn = [4, 382]; d.pa = 600; localStorage.setItem(k, JSON.stringify(d)); });
await p4.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await p4.waitForTimeout(1200);
if (await p4.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').count()) { await p4.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').click(); await p4.waitForTimeout(400); }
if (await p4.locator('section[aria-label="Choisis ton starter"] button[aria-label="Choisir Salamèche"]').count()) await p4.locator('section[aria-label="Choisis ton starter"] button[aria-label="Choisir Salamèche"]').click();
await p4.locator('section.pkm-tuto-bubble').waitFor({ timeout: 4000 }); await p4.waitForTimeout(1500);
const route4 = () => p4.evaluate(() => [...document.querySelectorAll('[aria-label="Route d’évolution"] .pkm-dex-node')].map(n => n.textContent.trim().split(/\s/)[0]));
const g4 = {};
for (let k = 0; k < 14; k++) {
  await p4.locator('.pkm-tt-next').click(); await p4.waitForTimeout(80); await p4.locator('.pkm-tt-next').click().catch(() => {}); await p4.waitForTimeout(1500);
  const t = await p4.evaluate(() => (document.querySelector('.pkm-tt-full') || {}).textContent || '');
  if (/Voici ton Pokédex/.test(t)) g4.dev = await route4();
  if (/arbre d’évolution/.test(t)) { g4.tree = await route4(); g4.in = await p4.evaluate(() => { const f = document.querySelector('.pkm-tt-frame').getBoundingClientRect(), r = document.querySelector('[aria-label="Route d’évolution"]').getBoundingClientRect(); return r.top >= f.top - 1 && r.bottom <= f.bottom + 1; }); await p4.screenshot({ path: shot('tuto-arbre-compagnon-sans-evolution.png') }); break; }
}
ok('compagnon sans évolution (Kyogre) : Pokédex sur Kyogre (' + g4.dev + '), arbre de la mascotte (' + g4.tree + ') entier dans le cadre', !!g4.dev && g4.dev.length === 1 && /^Kyogre/.test(g4.dev[0]) && !!g4.tree && g4.tree.length >= 3 && g4.tree.some(n => /^Dracaufeu/.test(n)) && g4.in);
await p4.locator('.pkm-tt-skip').click().catch(() => {}); await p4.waitForTimeout(900);
await p4.evaluate(() => { const b = document.querySelector('main .pkm-gm-tabs [role="tab"]:last-child, main .pkm-gm-tabs button:last-child'); if (b) b.click(); }); await p4.waitForTimeout(600);
const after4 = await route4();
ok('après le didacticiel, le Pokédex revient sur Kyogre (' + after4 + ')', after4.length === 1 && /^Kyogre/.test(after4[0]));
await ctx4.close();
// Défilement comme sur iPhone (2026-11-23, porteur : « le didacticiel reste en haut de la page et ne descend pas sur
// l'arbre ») : dans Safari, la position d'un défilement « en douceur » ne change qu'à la fin et un nouvel appel annule
// celui en cours ; l'étape de l'arbre doit quand même amener l'arbre à l'écran, dans son cadre.
const ctx5 = await browser.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 1 });
await ctx5.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
await ctx5.addInitScript(() => {
  const anim = (el, to) => { clearTimeout(el.__wk); el.__wk = setTimeout(() => { el.scrollTop = to; }, 350); };
  const sb = Element.prototype.scrollBy, sto = Element.prototype.scrollTo;
  Element.prototype.scrollBy = function (a, b) { if (a && typeof a === 'object' && a.behavior === 'smooth') return anim(this, this.scrollTop + (a.top || 0)); return sb.call(this, a, b); };
  Element.prototype.scrollTo = function (a, b) { if (a && typeof a === 'object' && a.behavior === 'smooth') return anim(this, a.top != null ? a.top : this.scrollTop); return sto.call(this, a, b); };
});
const p5 = await ctx5.newPage(); p5.on('pageerror', e => errors.push(e.message));
await p5.goto(E2E + '/?tuto=1&today=2026-10-04', { waitUntil: 'load' }); await p5.waitForTimeout(1200);
await p5.locator('section[role="dialog"][aria-label="Didacticiel"] button:has-text("Oui")').click(); await p5.waitForTimeout(400);
await p5.locator('section[aria-label="Choisis ton starter"] button[aria-label="Choisir Salamèche"]').click(); await p5.waitForTimeout(1600);
let g5 = null;
for (let k = 0; k < 14; k++) {
  await p5.locator('.pkm-tt-next').click(); await p5.waitForTimeout(80); await p5.locator('.pkm-tt-next').click().catch(() => {}); await p5.waitForTimeout(2000);
  const g = await p5.evaluate(() => {
    const t = (document.querySelector('.pkm-tt-full') || {}).textContent || '';
    const f = document.querySelector('.pkm-tt-frame').getBoundingClientRect(), tree = document.querySelector('[aria-label="Route d’évolution"]');
    const r = tree && tree.getBoundingClientRect(), m = document.querySelector('main');
    return { t: t.slice(0, 40), st: m ? Math.round(m.scrollTop) : 0, onScreen: !!r && r.top >= 0 && r.bottom <= innerHeight, inFrame: !!r && r.top >= f.top - 1 && r.bottom <= f.bottom + 1 };
  });
  if (/arbre d’évolution/.test(g.t)) { g5 = g; await p5.screenshot({ path: shot('tuto-arbre-defilement-iphone.png') }); break; }
}
ok('défilement comme sur iPhone : la page descend jusqu’à l’arbre, entier à l’écran et dans le cadre (' + JSON.stringify(g5) + ')', !!g5 && g5.st > 200 && g5.onScreen && g5.inFrame);
await ctx5.close();
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
