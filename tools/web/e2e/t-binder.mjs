// « Mon classeur » de l'accueil : place (entre la valeur et les boutiques), logo, onglets « Mes cartes » (pages de 9,
// visuel, pastille drapeau + cote + état, gradation, exemplaires) et « Mes produits scellés » (vitrine en verre, 3 par
// tablette, pages de 9, mêmes pastilles) ; valeur totale en haut de chaque onglet (2026-10-21), sans bulles de tri ;
// fiche en panneau au toucher (fiche.js), montants masqués, classeur vide ; « Sorties récentes » tout en bas.
import { withFonts, withDemoCards, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = E2E + '/?today=2026-10-04';
const SEC = 'section[aria-label="Mon classeur"]', PANEL = SEC + ' [role="tabpanel"]', TILE = PANEL + ' button[aria-label$="Ouvrir la fiche"]';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const mk = async (w = 390, h = 844) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await withFonts(ctx); await ctx.unroute(/openfreemap|tcgdex|pokemontcg/); await ctx.route(/openfreemap|pokemontcg/, r => r.abort()); await withDemoCards(ctx);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  return [ctx, page];
};
// En-tête de l'onglet : « libellé | valeur | détail ».
const panelText = async page => (await page.locator(PANEL + ' .pkm-hk-head > div').first().evaluate(d => [...d.children].map(c => c.innerText.trim()).join(' | '))).replace(/[\u202f\u00a0]/g, ' ');
{
  const [ctx, page] = await mk();
  await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2500);
  const order = await page.$$eval('#app section[aria-label]', ss => ss.map(s => s.getAttribute('aria-label')).filter(l => !/^(Navigation|Recherche dans)/.test(l)));
  ok('ordre de l’accueil : ' + order.join(' > '), order.join('|') === 'Valeur de ma collection|Mon classeur|Boutiques près de toi|Sorties récentes|Prochaines sorties');
  const last = await page.evaluate(() => { const s = document.querySelector('section[aria-label="Prochaines sorties"]'); let n = s.nextElementSibling; const after = []; while (n) { after.push(n.tagName + ':' + (n.getAttribute('aria-label') || n.innerText.slice(0, 30))); n = n.nextElementSibling; } return after; });
  ok('« Prochaines sorties » tout en bas, juste avant la mention de non-affiliation (' + last.join(', ') + ')', last.length === 1 && /non affiliée/.test(await page.locator('section[aria-label="Prochaines sorties"] + p').innerText()));
  ok('titre « Mon classeur »', (await page.locator(SEC + ' h2').innerText()) === 'Mon classeur');
  const logo = page.locator(SEC + ' img[src="img/brand/classeur.svg"]');
  const lb = await logo.boundingBox(), sb = await page.locator(SEC + ' > div').boundingBox();
  ok('logo du classeur chargé et centré', await logo.evaluate(i => i.complete && i.naturalWidth > 0) && Math.abs((lb.x + lb.width / 2) - (sb.x + sb.width / 2)) < 1.5);
  const tabs = page.locator(SEC + ' [role="tablist"] [role="tab"]');
  ok('2 onglets : ' + (await tabs.allInnerTexts()).join(' | '), (await tabs.allInnerTexts()).join('|') === 'Mes cartes|Mes produits scellés' && (await tabs.first().getAttribute('aria-selected')) === 'true');
  // Mes cartes
  ok('valeur des cartes en haut : ' + await panelText(page), /^Valeur de mes cartes \| [\d ]+,\d\d € \| 6 cartes · 1 gradée$/.test(await panelText(page)));
  const headFont = await page.locator(PANEL + ' .pkm-hk-head .pkm-strict-text').evaluate(e => [getComputedStyle(e).fontFamily, getComputedStyle(e).fontWeight].join(' '));
  ok('valeur écrite comme « Valeur de toute ma collection » (Sora 700, contour) : ' + headFont, /Sora/.test(headFont) && /700/.test(headFont));
  ok('plus de bulles de tri ni de filtre', (await page.locator(SEC + ' [aria-label="Trier le classeur"]').count()) === 0 && (await page.locator(SEC + ' button', { hasText: /^(Filtrer|Cote|Récents|Nom)$/ }).count()) === 0);
  const cards = await page.$$eval(TILE, bs => bs.map(b => b.getAttribute('aria-label')));
  ok('6 cartes, de la plus chère à la moins chère : ' + cards.map(c => c.split(',')[0]).join(', '), cards.length === 6 && /^Mewtwo ex, gradée PCA 9,5/.test(cards[0]));
  const vals = await page.$$eval(TILE, bs => bs.map(b => b.querySelector('span[style*="bottom: 6%"] .pkm-pill2-p').innerText.trim()));
  const num = t => parseFloat(t.replace(/[^\d,]/g, '').replace(',', '.'));
  ok('pastilles : ' + vals.join(' | '), vals.every((v, i) => !i || num(vals[i - 1]) >= num(v)) && /^448 €$/.test(vals[0].replace(/\s/g, ' ').replace(/ +/g, ' ').replace(/ /g, ' ')));
  // Bulle illustrée de l'état à droite du prix (2026-10-31, porteur), au lieu du point de couleur.
  // Sigle blanc de l'état à côté de sa bulle, tout sur une seule ligne (2026-10-31, porteur) ; la cote n'est jamais coupée,
  // même « 12 345 € » sur un écran de 320 px (la taille suit la largeur de la carte).
  const pill = await page.locator(TILE).first().evaluate(b => { const p = b.querySelector('span[style*="bottom: 6%"]'), f = p.querySelector('.pkm-pill2-v > span'), c = p.querySelector('.pkm-pill2-p'), ico = p.querySelector('img.pkm-cond-ico'), ab = p.querySelector('.pkm-cond-ab'); return [getComputedStyle(f).backgroundImage.slice(0, 40), ico ? ico.getAttribute('src') : '', ab ? ab.textContent : '', getComputedStyle(ab).color, c.scrollWidth <= c.clientWidth, Math.round(p.getBoundingClientRect().width) <= Math.round(b.getBoundingClientRect().width), Math.round(p.getBoundingClientRect().height) <= Math.round(parseFloat(getComputedStyle(p).fontSize) * 2)]; });
  ok('pastille : drapeau, cote, bulle et sigle blanc de l’état, une ligne : ' + pill.join(' · '), /linear-gradient/.test(pill[0]) && /^img\/conds\/(mt|nm|ex|gd|pl|po)\.svg$/.test(pill[1]) && /^(M|NM|Ex|GD|PL|PO)$/.test(pill[2]) && pill[3] === 'rgb(255, 255, 255)' && pill[4] && pill[5] && pill[6]);
  const narrow = await page.evaluate(async () => {
    const tile = document.querySelector('section[aria-label="Mon classeur"] .pkm-pill2').parentElement, keep = tile.style.width;
    tile.style.width = '79px'; await new Promise(r => requestAnimationFrame(r));
    const p = tile.querySelector('.pkm-pill2'), sp = p.querySelector('.pkm-pill2-p'), t = sp.textContent; sp.textContent = '12 345 €';
    const fs = parseFloat(getComputedStyle(p).fontSize), r = p.getBoundingClientRect(), out = [Math.round(r.width), Math.round(r.height), sp.scrollWidth <= sp.clientWidth, r.height <= fs * 2];
    sp.textContent = t; tile.style.width = keep; return out;
  });
  ok('carte de 79 px (écran de 320 px), « 12 345 € · NM » : ' + narrow.slice(0, 2).join(' × ') + ' px, une ligne, rien de coupé', narrow[0] <= 79 && narrow[2] && narrow[3]);
  ok('note de gradation sur Mewtwo : ' + await page.locator(TILE).first().locator('span', { hasText: 'PCA 9,5' }).count(), (await page.locator(TILE).first().locator('span', { hasText: 'PCA 9,5' }).count()) === 1);
  ok('6 cartes : une seule page, sans flèches', (await page.locator(SEC + ' button[aria-label="Page suivante"]').count()) === 0);
  await page.locator(SEC).evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(800);
  await page.screenshot({ path: shot('binder-cartes.png') });
  const addBtn = page.locator(PANEL + ' .pkm-hb-add button');
  ok('bouton jaune « Ajouter des cartes » en bas de « Mes cartes »', (await addBtn.innerText()).trim() === 'Ajouter des cartes'
    && await page.locator(PANEL).evaluate(p => p.lastElementChild && p.lastElementChild.classList.contains('pkm-hb-add')));
  // Mes produits scellés
  await tabs.nth(1).click(); await page.waitForTimeout(600);
  ok('onglet scellé choisi', (await tabs.nth(1).getAttribute('aria-selected')) === 'true' && (await page.locator(PANEL).getAttribute('aria-label')) === 'Mes produits scellés');
  ok('valeur du scellé en haut : ' + await panelText(page), /^Valeur de mes produits scellés \| [\d ]+,\d\d € \| 15 produits$/.test(await panelText(page)));
  const vit = page.locator(PANEL + ' .pkm-vit');
  const cols = await vit.evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  ok('vitrine en verre, 3 par tablette : ' + await page.locator(TILE).count() + ' produits', cols === 3 && (await page.locator(TILE).count()) === 6 && (await page.locator(SEC + ' button[aria-label="Page suivante"]').count()) === 0);
  const vpill = await page.locator(TILE).first().evaluate(b => { const p = b.querySelector('.pkm-vit-pill'), s = p.querySelectorAll(':scope > span'); return s.length === 3 && /linear-gradient/.test(getComputedStyle(s[0]).backgroundImage) && /€/.test(s[1].innerText); });
  ok('pastille du scellé identique aux cartes (drapeau, cote, état)', vpill);
  ok('« Tout afficher » aussi sur le scellé', (await page.locator(PANEL + ' .pkm-hk-all').innerText()) === 'Tout afficher');
  ok('bouton jaune « Ajouter des produits scellés » en bas de l’onglet', (await page.locator(PANEL + ' .pkm-hb-add button').innerText()).trim() === 'Ajouter des produits scellés'
    && await page.locator(PANEL).evaluate(p => p.lastElementChild && p.lastElementChild.classList.contains('pkm-hb-add')));
  await page.locator(PANEL + ' .pkm-hb-add button').click(); await page.waitForTimeout(800);
  ok('« Ajouter des produits scellés » ouvre le catalogue du scellé', (await page.locator('[role="tablist"][aria-label="Parcourir le scellé"]').count()) === 1);
  await page.goBack(); await page.waitForTimeout(800);
  if (!(await page.locator(SEC).count())) { await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2000); }
  if ((await tabs.nth(1).getAttribute('aria-selected')) !== 'true') { await tabs.nth(1).click(); await page.waitForTimeout(400); }
  ok('quantité affichée (×2, ×3)', (await page.locator(TILE + ' span', { hasText: /^×\d$/ }).count()) >= 2);
  await page.locator(SEC).evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(800);
  await page.screenshot({ path: shot('binder-scelle.png') });
  // Montants masqués
  await page.click('button[aria-label*="Masquer"], section[aria-label="Valeur de ma collection"] button[aria-pressed]'); await page.waitForTimeout(400);
  ok('montants masqués : ' + await panelText(page), /•••• €/.test(await panelText(page)) && (await page.$$eval(TILE, bs => bs.every(b => /••••/.test(b.innerText)))));
  await page.click('section[aria-label="Valeur de ma collection"] button[aria-pressed]'); await page.waitForTimeout(300);
  // Fiche
  await tabs.first().click(); await page.waitForTimeout(400);
  await page.locator(TILE).nth(1).click(); await page.waitForTimeout(900);
  const FI = 'section.pkm-fi[role="dialog"]';
  ok('un appui ouvre la fiche en panneau : ' + await page.locator(FI).getAttribute('aria-label'), (await page.locator(FI).getAttribute('aria-label')) === 'Pikachu ex' && (await page.locator(SEC).count()) === 1);
  const fiText = (await page.locator(FI).innerText()).replace(/[\u202f\u00a0]/g, ' ');
  ok('fiche : cote, ajout, retirer, prix du marché, Cardmarket, eBay, historique, prix gradés', /99,00 €/.test(fiText) && /Ajouter un exemplaire/.test(fiText)
    && /Retirer de ma collection/.test(fiText) && /Prix du marché/.test(fiText) && /Tendance/.test(fiText) && /Acheter sur Cardmarket/.test(fiText) && /eBay/.test(fiText) && /Historique du prix/.test(fiText) && /Prix gradés/.test(fiText));
  // Retirés le 2026-10-31 (porteur) : « Investi », « Mes exemplaires », « Marquer comme vendu », « Voir la fiche complète ».
  ok('fiche : sans Investi, Mes exemplaires, Marquer comme vendu, Voir la fiche complète', !/Investi|Mes exemplaires|Marquer comme vendu|Voir la fiche complète/.test(fiText));
  ok('fiche : pas de TCGplayer', !/TCGplayer/.test(fiText));
  await page.locator(FI + ' button[aria-expanded]', { hasText: 'Prix par état' }).click(); await page.waitForTimeout(300);
  ok('prix par état : Near Mint, Excellent, Played', /Near Mint[\s\S]*100 %[\s\S]*Excellent[\s\S]*85 %[\s\S]*Played[\s\S]*55 %/.test(await page.locator(FI).innerText()));
  ok('prix par état : bulle de couleur de chaque état', (await page.locator(FI + ' section[aria-label="Prix par état"] img.pkm-fi-cico').evaluateAll(im => im.map(i => i.getAttribute('src').split('/').pop()))).join(',') === 'mt.svg,nm.svg,ex.svg,gd.svg,pl.svg,po.svg');
  await page.locator(FI).evaluate(e => e.scrollTo(0, 0)); await page.waitForTimeout(200);
  await page.screenshot({ path: shot('binder-fiche.png') });
  await page.locator(FI + ' button[aria-label="Fermer"]').click(); await page.waitForTimeout(400);
  ok('« Fermer » ramène au classeur', (await page.locator(FI).count()) === 0 && (await page.locator(SEC).count()) === 1);
  ok('pas de défilement horizontal', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}
// 360 px : onglets et pastilles sans débord.
{
  const [ctx, page] = await mk(360, 740);
  await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2000);
  const tabs = await page.$$eval(SEC + ' [role="tab"]', bs => bs.map(b => b.scrollWidth - b.clientWidth));
  const pills = await page.$$eval(TILE, bs => bs.map(b => { const p = b.querySelector('span[style*="bottom: 6%"]'); return p.scrollWidth - p.clientWidth; }));
  ok('360 : onglets et pastilles sans débord', tabs.every(d => d <= 0) && pills.every(d => d <= 0) && await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}
// Plus de 9 cartes : pages de 9 ; aucun produit scellé : message. Collection enregistrée sur l'appareil.
import { readFileSync } from 'node:fs';
const doc = JSON.parse(readFileSync(ROOT + 'web/data/cards.json', 'utf8'));
const rows = doc.cards.filter(r => r[6] > 1).slice(0, 11);
const saved = (rows, extraLines = []) => JSON.stringify({ v: 1, savedAt: new Date().toISOString(),
  cards: Object.fromEntries(rows.map(r => [r[0], { r: r, f: doc.fields }])),
  purchases: rows.map((r, i) => ({ id: 'n' + i, date: '2026-10-01', seq: i, lines: [{ pid: r[0], qty: i === 0 ? 2 : 1, lang: i === 1 ? 'EN' : 'FR', cond: i === 2 ? 'PL' : 'NM' }], total: null, where: 'Test', by: 'toi' })).concat(extraLines),
  sales: [], seq: 50 });
{
  const [ctx, page] = await mk();
  await page.addInitScript(v => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('pkm-collection-v1', v); sessionStorage.setItem('seeded', '1'); } }, saved(rows));
  await page.goto(BASE, { waitUntil: 'load' }); await page.waitForTimeout(2500);
  ok('11 cartes : ' + await panelText(page), / \| 12 cartes · 1 doublon$/.test(await panelText(page)));
  ok('page 1 : 9 cartes, « Page 1 sur 2 »', (await page.locator(TILE).count()) === 9 && (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 1 sur 2');
  // Tourner la page (2026-10-21) : animation de page, l'écran ne bouge pas, pochettes vides sur la dernière page.
  const NEXT = SEC + ' button[aria-label="Page suivante"]';
  await page.locator(NEXT).scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const y0 = (await page.locator(NEXT).boundingBox()).y, top0 = await page.evaluate(() => document.querySelector('main').scrollTop);
  await page.click(NEXT); await page.waitForTimeout(100);
  const anim = await page.locator(PANEL + ' .pkm-hk-grid').evaluate(g => getComputedStyle(g).animationName);
  await page.waitForTimeout(700);
  const y1 = (await page.locator(NEXT).boundingBox()).y, top1 = await page.evaluate(() => document.querySelector('main').scrollTop);
  ok('page tournée : animation ' + anim + ', écran immobile (' + y0 + ' → ' + y1 + ')', /pkmTurnNext/.test(anim) && Math.abs(y1 - y0) < 1 && top1 === top0);
  ok('page 2 : 2 cartes et 7 pochettes vides', (await page.locator(TILE).count()) === 2 && (await page.locator(PANEL + ' .pkm-hk-pocket').count()) === 7 && (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 2 sur 2');
  // Libellés et points d'état des deux pages (l'ordre suit les cotes du jour).
  const grab = () => page.$$eval(TILE, bs => bs.map(b => [b.getAttribute('aria-label'), (b.querySelector('span[style*="bottom: 6%"] img.pkm-cond-ico') || { getAttribute: () => '' }).getAttribute('src'), (b.querySelector('span[style*="bottom: 6%"] .pkm-cond-ab') || {}).textContent]));
  const page2 = await grab();
  await page.click(SEC + ' button[aria-label="Page précédente"]'); await page.waitForTimeout(400);
  const dots = (await grab()).concat(page2), labels = dots.map(d => d[0]);
  const en = labels.find(l => /, EN, /.test(l)), pl = labels.find(l => /, Played, /.test(l)), two = labels.find(l => /2 exemplaires/.test(l));
  ok('langue, état et exemplaires repris des ajouts (EN, Played, ×2)', !!en && !!pl && !!two);
  const plDot = dots.find(d => /Played/.test(d[0]))[1], nmDot = dots.find(d => /Near Mint/.test(d[0]))[1];
  const plAb = dots.find(d => /Played/.test(d[0]))[2], nmAb = dots.find(d => /Near Mint/.test(d[0]))[2];
  ok('bulle de l’état : Played ' + plDot + ' « ' + plAb + ' », Near Mint ' + nmDot + ' « ' + nmAb + ' »', /pl\.svg$/.test(plDot) && /nm\.svg$/.test(nmDot) && plAb === 'PL' && nmAb === 'NM');
  // « Tout afficher » (vidéo du porteur) : écran plein « Toutes mes cartes », classées par valeur, filtres, fiche au toucher.
  await page.locator(SEC + ' .pkm-hk-all').click(); await page.waitForTimeout(500);
  const HF = 'section.pkm-hf[role="dialog"]';
  const hfSub = (await page.locator(HF + ' .pkm-hf-sub').first().innerText()).replace(/[\u202f\u00a0]/g, ' ');
  ok('« Tout afficher » : « Toutes mes cartes », 11 cartes classées par valeur (' + hfSub + ')', (await page.locator(HF + ' h2').innerText()) === 'Toutes mes cartes'
    && (await page.locator(HF + ' .pkm-hf-tile').count()) === 11 && /^Classés par valeur · 12 cartes · .+ €$/.test(hfSub));
  const hv = (await page.locator(HF + ' .pkm-hf-pill').allInnerTexts()).map(t => Number(t.replace(/[^\d,]/g, '').replace(',', '.')));
  ok('du plus cher au moins cher', hv.every((v, i) => !i || hv[i - 1] >= v));
  ok('filtres : ' + (await page.locator(HF + ' [aria-label="Filtrer mes cartes"] button').allInnerTexts()).join(', '), /^Toutes \(11\)\|Loose \(11\)\|Gradées \(0\)$/.test((await page.locator(HF + ' [aria-label="Filtrer mes cartes"] button').allInnerTexts()).join('|')));
  await page.locator(HF + ' .pkm-hf-tile').first().click(); await page.waitForTimeout(500);
  ok('une carte ouvre sa fiche par-dessus', (await page.locator('section.pkm-fi[role="dialog"]').count()) === 1);
  await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
  await page.locator(HF + ' button[aria-label="Fermer"]').click(); await page.waitForTimeout(300);
  ok('« Fermer » ramène au classeur', (await page.locator(HF).count()) === 0 && (await page.locator(TILE).count()) === 9);
  await page.locator(SEC + ' [role="tab"]').nth(1).click(); await page.waitForTimeout(400);
  ok('aucun produit scellé : message', /Aucun produit scellé dans ton classeur/.test(await page.locator(PANEL).innerText()) && (await page.locator(TILE).count()) === 0);
  await page.screenshot({ path: shot('binder-vide-scelle.png') });
  await ctx.close();
}
ok('aucune erreur JS' + (errors.length ? ' : ' + errors.join(' | ') : ''), errors.length === 0);
await browser.close();
console.log(res.join('\n'));
console.log(res.filter(r => r.startsWith('✓')).length + '/' + res.length);
