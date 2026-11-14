// Fil « Annonces » (2026-11-14, « go » du porteur pour Vinted ; docs/41, docs/42). Le serveur est imité (page.route) :
// jamais le vrai serveur ni Vinted. Sans le script 029 : rubrique de l'accueil cachée, aucune erreur. Avec des annonces :
// rubrique « Annonces du moment », écran complet (recherche sans accents, types, tri), liens vers Vinted, aucun vendeur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const FAKE = 'http://127.0.0.1:59991';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const KEY = 'pkm-collection-v1', UID = 'u-an', EMAIL = 'dresseur@exemple.fr';
const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const now = Date.now(), iso = ms => new Date(now - ms).toISOString();
const L = (id, title, price, kind, extra) => Object.assign({ id: id, source: 'vinted', ext_id: String(9000 + id), title: title, price: price, total_price: Math.round(price * 1.07 * 100) / 100, currency: 'EUR',
  photo: 'https://images1.vinted.net/t/' + id + '.jpg', url: 'https://www.vinted.fr/items/' + (9000 + id), cond: 'Très bon état', is_lot: kind === 'lot', lot_count: null, kind: kind,
  first_seen: iso(id * 60e3), last_seen: iso(60e3) }, extra || {});
const ROWS = [
  L(1, 'Dracaufeu ex illustration spéciale', 120, 'card'), L(2, 'Lot 100 cartes Pokémon', 25, 'lot', { lot_count: 100 }), L(3, 'Lugia PSA 9', 210, 'graded'),
  L(4, 'ETB Évolutions Prismatiques scellée', 65, 'sealed'), L(5, 'Pikachu promo', 4.5, 'card'), L(6, 'Lot cartes anciennes', 40, 'lot'),
  L(7, 'Mew ex alt 30 ans', 90, 'card'), L(8, 'Display Flammes Obsidiennes', 180, 'sealed'), L(9, 'Évoli carte', 2, 'card'),
  L(10, 'Dracaufeu GX shiny', 75, 'card'), L(11, 'Ronflex holo', 8, 'card'), L(12, 'Lot 20 cartes rares', 30, 'lot', { lot_count: 20 })
];
const S = { mode: 'missing', listCalls: 0 };
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname;
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  if (p === '/rest/v1/listings') {
    S.listCalls++;
    if (S.mode === 'missing') return send(404, { code: 'PGRST205', message: 'Could not find the table public.listings in the schema cache' });
    return send(200, ROWS);
  }
  if (p === '/rest/v1/rpc/listings_status') return S.mode === 'missing' ? send(404, { code: 'PGRST202' }) : send(200, { vinted: { active: 12, last_ok: iso(10 * 60e3), last_run: { ok: true } }, ebay: { active: 0 } });
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '25-35', starter: 25, news_optin: false, role: 'user', status: 'active' }]);
  return send(404, {});
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|vinted\.net/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
await page.evaluate(([k, tok, uid, email]) => {
  const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
  localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user' }));
}, [KEY, TOKEN, UID, EMAIL]);

// 1. Script 029 pas installé : rien à l'accueil, aucune erreur.
await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' });
await page.waitForFunction(() => window.__pkm && window.__pkmAn, null, { timeout: 15000 });
await page.waitForTimeout(1500);
ok('029 absent : fil demandé au serveur, rubrique de l’accueil cachée', S.listCalls >= 1 && (await page.locator('section.pkm-anh').count()) === 0);
ok('029 absent : message clair gardé pour l’écran', /pas encore en place/.test(await page.evaluate(() => window.__pkmAn.err)));

// 2. Annonces en place : rubrique « Annonces du moment ».
S.mode = 'ok';
await page.evaluate(() => { window.__pkmAn.tried = 0; window.__pkm.setState({ anTick: Date.now() }); });
await page.waitForSelector('section.pkm-anh', { timeout: 8000 });
const home = page.locator('section.pkm-anh');
let t = N(await home.innerText());
ok('accueil : « Annonces du moment », 8 annonces, « Voir toutes les annonces (12) »', /Annonces du moment/.test(t) && (await home.locator('.pkm-anh-card').count()) === 8 && /Voir toutes les annonces \(12\)/.test(t));
ok('accueil : la plus récente en premier, prix en euros, badge Vinted', /^Dracaufeu ex illustration spéciale/.test(N(await home.locator('.pkm-anh-card').first().innerText()).replace(/^Vinted /, '')) && /120 €/.test(t) && /Vinted/.test(t));
const href = await home.locator('.pkm-anh-card').first().getAttribute('href'), tgt = await home.locator('.pkm-anh-card').first().getAttribute('target');
ok('accueil : chaque annonce ouvre Vinted dans une nouvelle page', href === 'https://www.vinted.fr/items/9001' && tgt === '_blank');
ok('rubrique placée sous la pré-gradation', await page.evaluate(() => { const a = document.querySelector('section.pkm-pgh'), b = document.querySelector('section.pkm-anh'); return !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
await home.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('annonces-accueil.png') });

// 3. Écran complet.
await home.locator('.pkm-anh-btn').click(); await page.waitForTimeout(700);
const scr = page.locator('.pkm-anl');
t = N(await scr.innerText());
ok('écran « Annonces » : 12 annonces, mises à jour il y a 10 min', (await scr.count()) === 1 && (await scr.locator('.pkm-anl-card').count()) === 12 && /12 annonces · mis à jour il y a 10 min/.test(t));
ok('titre de l’écran et retour vers l’accueil', /Annonces/.test(N(await page.locator('header').first().innerText())) && await page.evaluate(() => window.__pkm.parentOf('annonces') === 'home'));
ok('carte : prix demandé, total avec protection acheteur, état, « Voir l’annonce »', /120 €/.test(t) && /128,40 € avec la protection acheteur/.test(t) && /Très bon état/.test(t) && (await scr.locator('a.pkm-anl-go').count()) === 12);
ok('badges : « Lot · 100 cartes », « Gradée », « Scellé »', /Lot · 100 cartes/.test(t) && /Gradée/.test(t) && /Scellé/.test(t));
ok('mention : prix demandés, pas dans la cote, pas affilié à Vinted', /ne comptent pas dans la cote/.test(t) && /n’est pas affilié à Vinted/.test(t));
await page.screenshot({ path: shot('annonces-ecran.png') });
await scr.locator('.pkm-anl-chip', { hasText: 'Lots' }).click(); await page.waitForTimeout(300);
ok('filtre « Lots » : 3 lots', (await scr.locator('.pkm-anl-card').count()) === 3 && /3 annonces/.test(N(await scr.innerText())));
await scr.locator('.pkm-anl-chip', { hasText: 'Scellé' }).click(); await page.waitForTimeout(300);
ok('filtre « Scellé » : ETB et display', (await scr.locator('.pkm-anl-card').count()) === 2);
await scr.locator('.pkm-anl-chip', { hasText: 'Tout' }).click();
await scr.locator('input[type=search]').fill('dracaufeu'); await page.waitForTimeout(300);
ok('recherche « dracaufeu » : 2 annonces', (await scr.locator('.pkm-anl-card').count()) === 2);
await scr.locator('input[type=search]').fill('evolutions'); await page.waitForTimeout(300);
ok('recherche sans accents : « evolutions » trouve « Évolutions »', (await scr.locator('.pkm-anl-card').count()) === 1);
await scr.locator('input[type=search]').fill(''); await page.waitForTimeout(200);
await scr.locator('.pkm-anl-sort', { hasText: 'Prix croissant' }).click(); await page.waitForTimeout(300);
ok('tri « Prix croissant » : Évoli à 2 € en tête', /^Évoli carte/.test(N(await scr.locator('.pkm-anl-t').first().innerText())));
await scr.locator('.pkm-anl-sort', { hasText: 'Prix décroissant' }).click(); await page.waitForTimeout(300);
ok('tri « Prix décroissant » : Lugia PSA 9 à 210 € en tête', /^Lugia PSA 9/.test(N(await scr.locator('.pkm-anl-t').first().innerText())));
await scr.locator('input[type=search]').fill('zzz introuvable'); await page.waitForTimeout(300);
ok('aucun résultat : message', /Aucune annonce ne correspond/.test(N(await scr.innerText())));
ok('aucune donnée de vendeur dans la page', !/vendeur|login|quelquun/i.test(await page.evaluate(() => JSON.stringify(window.__pkmAn.rows))));
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log('ERREURS : ' + errors.join(' | '));

console.log(res.join('\n'));
await browser.close();
