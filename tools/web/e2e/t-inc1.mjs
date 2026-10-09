import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// Incrément 1 : photo du scan, pastilles « % » sur une ligne, replis photo → logo → plaque, graisse 800.
const browser = await launch();
const stub = (w, h, c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`;
const results = [];
const ok = (label, cond) => { results.push((cond ? '✓ ' : '✗ ') + label); };
const newCtx = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.route('https://assets.tcgdex.net/**', r => {
    const u = r.request().url();
    if (opts.blockLogos && /logo/.test(u)) return r.abort();
    r.fulfill({ contentType: 'image/svg+xml', body: /logo/.test(u) ? stub(300, 120, '#F5C542') : stub(600, 825, '#8EC5FC') });
  });
  await ctx.route('https://images.pokemontcg.io/**', r => r.fulfill({ contentType: 'image/svg+xml', body: stub(734, 1024, '#C9A3FF') }));
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
  if (opts.blockPhotos) await ctx.route('**/img/products/**', r => r.abort());
  if (opts.blockLocalLogos) await ctx.route(/\/img\/logo-[\w-]+\.webp$/, r => r.abort());
  return ctx;
};
const errors = [];
const watch = (page, tag) => { page.on('pageerror', e => errors.push(tag + ' : ' + e.message)); };
// Images cassées visibles (chargées sans contenu).
const broken = page => page.evaluate(() => [...document.querySelectorAll('#app img')].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('loading') !== 'lazy' || (i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().top < innerHeight)).map(i => (i.getAttribute('src') || '(vide)').slice(0, 70)));

// 1. Scan réel, onglet Scellé : chaque produit de la liste a un visuel chargé (photos officielles).
{
  const ctx = await newCtx(), page = await ctx.newPage(); watch(page, 'scan');
  await page.goto(E2E + '/#scan', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.click('button:has-text("Scellé")');
  await page.waitForSelector('[aria-label="Produits scellés"] img');
  await page.waitForTimeout(800);
  const flat = await page.evaluate(() => [...document.querySelectorAll('[aria-label="Produits scellés"] img')].filter(i => i.getBoundingClientRect().top < innerHeight)
    .map(i => ({ src: (i.getAttribute('src') || '').slice(0, 60), w: i.naturalWidth, done: i.complete })));
  ok('scan scellé : ' + flat.length + ' visuels visibles, tous chargés', flat.length >= 4 && flat.every(x => x.done && x.w > 0));
  ok('scan scellé : photos officielles affichées (' + flat.filter(x => /img\/products\//.test(x.src)).length + ')', flat.filter(x => /img\/products\//.test(x.src)).length >= 4);
  ok('scan scellé : aucune source « () => »', flat.every(x => !/=>|function/.test(x.src)));
  await ctx.close();
}

// 2. Territoire : pastilles sur une seule ligne, espace insécable avant « % ».
for (const [w, h] of [[390, 844], [360, 740]]) {
  const ctx = await newCtx(); const page = await ctx.newPage(); watch(page, 'territoire');
  await page.setViewportSize({ width: w, height: h });
  await page.goto(E2E + '/#territoire', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.click('button:has-text("Démo · boutiques partenaires fictives")'); await page.waitForTimeout(300);
  const pins = await page.evaluate(() => [...document.querySelectorAll('section[aria-label="Carte des magasins"] button > span')].map(s => {
    const r = document.createRange(); r.selectNodeContents(s);
    return { text: s.textContent, lines: r.getClientRects().length, h: s.getBoundingClientRect().height, nbsp: s.textContent.includes(' %') };
  }));
  ok(w + ' px : ' + pins.length + ' pastilles, toutes sur une ligne', pins.length > 0 && pins.every(p => p.lines === 1 && p.h <= 22.5));
  ok(w + ' px : espace insécable avant %', pins.every(p => p.nbsp));
  if (w === 390) await page.locator('section[aria-label="Carte des magasins"]').screenshot({ path: shot('inc1-pastilles.png') });
  await ctx.close();
}

// 3. Replis : photos bloquées → logo de l'extension ; logos bloqués aussi → plaque dessinée.
for (const [label, opts] of [['photos bloquées', { blockPhotos: true }], ['photos et logos bloqués', { blockPhotos: true, blockLogos: true, blockLocalLogos: true }]]) {
  const ctx = await newCtx(opts); const page = await ctx.newPage(); watch(page, label);
  await page.goto(E2E + '/#scelle', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const tiles = await page.evaluate(() => [...document.querySelectorAll('#app main button[aria-label] img')].filter(i => i.getBoundingClientRect().top < innerHeight).slice(0, 8).map(i => ({ src: (i.getAttribute('src') || '').slice(0, 40), w: i.naturalWidth, done: i.complete })));
  const b = await broken(page);
  ok(label + ' : grille sans image cassée (' + b.length + ')', b.length === 0);
  if (opts.blockLogos) ok(label + ' : plaques dessinées affichées', tiles.some(t => t.src.startsWith('data:image/svg+xml')));
  else ok(label + ' : logos affichés à la place des photos', tiles.some(t => /logo/.test(t.src)) && tiles.every(t => !/img\/products/.test(t.src)));
  await page.screenshot({ path: shot('inc1-repli-' + (opts.blockLogos ? 'plaques' : 'logos') + '.png') });
  // Accueil, Collection, Marché, fiche ETB : aucune image cassée non plus.
  for (const url of ['', '?start=collection', '?start=market', '?start=item&itemId=p2', '#scan']) {
    await page.goto(E2E + '/' + url, { waitUntil: 'load' });
    await page.waitForTimeout(900);
    if (url === '#scan') { await page.click('button:has-text("Scellé")'); await page.waitForTimeout(300); }
    const bb = await broken(page);
    ok(label + ' · ' + (url || 'accueil') + ' : aucune image cassée' + (bb.length ? ' ' + JSON.stringify(bb) : ''), bb.length === 0);
  }
  await ctx.close();
}

// 4. Police : graisse 800 demandée.
{
  const ctx = await newCtx(); const page = await ctx.newPage();
  await page.goto(E2E + '/', { waitUntil: 'load' });
  // Polices hébergées avec l'app depuis le 2026-10-09 : la graisse 800 doit avoir son fichier local.
  const css = await page.evaluate(() => [...document.querySelectorAll('style')].map(s => s.textContent).join('\n'));
  ok('graisse 800 servie en local', /font-family:\s*'Plus Jakarta Sans'[^}]*font-weight:\s*800[^}]*url\(fonts\//.test(css) || /plus-jakarta-sans[^)]*800/.test(css));
  await ctx.close();
}
console.log(results.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'Aucune erreur JS');
await browser.close();
