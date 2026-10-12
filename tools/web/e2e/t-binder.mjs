// « Mon classeur » de l'accueil : place (entre la valeur et les boutiques), logo, onglets « Mes cartes » (pages de 9,
// visuel, pastille drapeau + cote + état, gradation, exemplaires) et « Mes produits scellés » (vitrine 2 par ligne,
// pages de 4), fiche au toucher, montants masqués, classeur vide ; « Sorties récentes » tout en bas.
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
const panelText = async page => (await page.locator(PANEL + ' > div:has(> button[aria-label*="cotes"]) > span').first().innerText()).replace(/[\u202f\u00a0]/g, ' ');
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
  ok('résumé : ' + await panelText(page), /^6 cartes · .+ € · 1 gradée$/.test(await panelText(page)));
  const cards = await page.$$eval(TILE, bs => bs.map(b => b.getAttribute('aria-label')));
  ok('6 cartes, de la plus chère à la moins chère : ' + cards.map(c => c.split(',')[0]).join(', '), cards.length === 6 && /^Mewtwo ex, gradée PCA 9,5/.test(cards[0]));
  const vals = await page.$$eval(TILE, bs => bs.map(b => b.querySelector('span[style*="bottom: 6%"]').innerText.trim()));
  const num = t => parseFloat(t.replace(/[^\d,]/g, '').replace(',', '.'));
  ok('pastilles : ' + vals.join(' | '), vals.every((v, i) => !i || num(vals[i - 1]) >= num(v)) && /^448 €$/.test(vals[0].replace(/\s/g, ' ').replace(/ +/g, ' ').replace(/ /g, ' ')));
  const pill = await page.locator(TILE).first().evaluate(b => { const p = b.querySelector('span[style*="bottom: 6%"]'), s = p.querySelectorAll(':scope > span'); return [getComputedStyle(s[0]).backgroundImage.slice(0, 40), getComputedStyle(s[2]).backgroundColor, p.scrollWidth <= p.clientWidth]; });
  ok('pastille : drapeau, cote, point vert (Near Mint) : ' + pill.join(' · '), /linear-gradient/.test(pill[0]) && /rgb\(\d+, \d+, \d+\)/.test(pill[1]) && pill[2]);
  ok('note de gradation sur Mewtwo : ' + await page.locator(TILE).first().locator('span', { hasText: 'PCA 9,5' }).count(), (await page.locator(TILE).first().locator('span', { hasText: 'PCA 9,5' }).count()) === 1);
  ok('6 cartes : une seule page, sans flèches', (await page.locator(SEC + ' button[aria-label="Page suivante"]').count()) === 0);
  await page.locator(SEC).evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(800);
  await page.screenshot({ path: shot('binder-cartes.png') });
  // Mes produits scellés
  await tabs.nth(1).click(); await page.waitForTimeout(600);
  ok('onglet scellé choisi', (await tabs.nth(1).getAttribute('aria-selected')) === 'true' && (await page.locator(PANEL).getAttribute('aria-label')) === 'Mes produits scellés');
  ok('résumé scellé : ' + await panelText(page), /^15 produits · .+ €$/.test(await panelText(page)));
  const cols = await page.locator(PANEL + ' > div[style*="grid-template-columns"]').first().evaluate(e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  ok('vitrine 2 par ligne, 4 par page : ' + await page.locator(TILE).count() + ' tuiles', cols === 2 && (await page.locator(TILE).count()) === 4);
  ok('page : ' + await page.locator(SEC + ' [aria-live="polite"]').innerText(), (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 1 sur 2' && (await page.locator(SEC + ' button[aria-label="Page précédente"]').getAttribute('aria-disabled')) === 'true');
  const first = await page.locator(TILE).first().getAttribute('aria-label');
  await page.locator(SEC).evaluate(e => e.scrollIntoView({ block: 'start' })); await page.waitForTimeout(800);
  await page.screenshot({ path: shot('binder-scelle.png') });
  await page.click(SEC + ' button[aria-label="Page suivante"]'); await page.waitForTimeout(400);
  ok('page suivante : ' + await page.locator(SEC + ' [aria-live="polite"]').innerText() + ', ' + await page.locator(TILE).count() + ' tuiles', (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 2 sur 2' && (await page.locator(TILE).first().getAttribute('aria-label')) !== first && (await page.locator(SEC + ' button[aria-label="Page suivante"]').getAttribute('aria-disabled')) === 'true');
  await page.click(SEC + ' button[aria-label="Page précédente"]'); await page.waitForTimeout(400);
  ok('page précédente : retour page 1', (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 1 sur 2');
  ok('quantité affichée (×2, ×3)', (await page.locator(TILE + ' span', { hasText: /^×\d$/ }).count()) >= 2);
  // Montants masqués
  await page.click('button[aria-label*="Masquer"], section[aria-label="Valeur de ma collection"] button[aria-pressed]'); await page.waitForTimeout(400);
  ok('montants masqués : ' + await panelText(page), /•••• €/.test(await panelText(page)) && (await page.$$eval(TILE, bs => bs.every(b => /••••/.test(b.innerText)))));
  await page.click('section[aria-label="Valeur de ma collection"] button[aria-pressed]'); await page.waitForTimeout(300);
  // Fiche
  await tabs.first().click(); await page.waitForTimeout(400);
  await page.locator(TILE).nth(1).click(); await page.waitForTimeout(900);
  ok('un appui ouvre la fiche : ' + (await page.locator('#app h1, #app h2').first().innerText()).slice(0, 40), /Pikachu ex/.test(await page.locator('#app').innerText()) && !(await page.locator(SEC).count()));
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
  ok('11 cartes : ' + await panelText(page), /^12 cartes · .+ € · 1 doublon$/.test(await panelText(page)));
  ok('page 1 : 9 cartes, « Page 1 sur 2 »', (await page.locator(TILE).count()) === 9 && (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 1 sur 2');
  await page.click(SEC + ' button[aria-label="Page suivante"]'); await page.waitForTimeout(400);
  ok('page 2 : 2 cartes', (await page.locator(TILE).count()) === 2 && (await page.locator(SEC + ' [aria-live="polite"]').innerText()) === 'Page 2 sur 2');
  await page.click(SEC + ' button[aria-label="Page précédente"]'); await page.waitForTimeout(400);
  const labels = await page.$$eval(TILE, bs => bs.map(b => b.getAttribute('aria-label')));
  const en = labels.find(l => /, EN, /.test(l)), pl = labels.find(l => /, Joué, /.test(l)), two = labels.find(l => /2 exemplaires/.test(l));
  ok('langue, état et exemplaires repris des ajouts (EN, Joué, ×2)', !!en && !!pl && !!two);
  const dots = await page.$$eval(TILE, bs => bs.map(b => [b.getAttribute('aria-label'), getComputedStyle(b.querySelector('span[style*="bottom: 6%"] > span:last-child')).backgroundColor]));
  const plDot = dots.find(d => /Joué/.test(d[0]))[1], nmDot = dots.find(d => /Near Mint/.test(d[0]))[1];
  ok('point de l’état : Joué ' + plDot + ' ≠ Near Mint ' + nmDot, plDot !== nmDot);
  await page.locator(SEC + ' [role="tab"]').nth(1).click(); await page.waitForTimeout(400);
  ok('aucun produit scellé : message', /Aucun produit scellé dans ton classeur/.test(await page.locator(PANEL).innerText()) && (await page.locator(TILE).count()) === 0);
  await page.screenshot({ path: shot('binder-vide-scelle.png') });
  await ctx.close();
}
ok('aucune erreur JS' + (errors.length ? ' : ' + errors.join(' | ') : ''), errors.length === 0);
await browser.close();
console.log(res.join('\n'));
console.log(res.filter(r => r.startsWith('✓')).length + '/' + res.length);
