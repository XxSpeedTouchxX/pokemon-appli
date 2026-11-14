// Tests de la fonction « annonces » (index.ts) sous Node, sans réseau : un faux Vinted en mémoire, et la vraie base de
// test locale (PostgreSQL avec mock_supabase.sql et 029_annonces.sql). Jamais sur le vrai serveur ni le vrai Vinted.
//   node tools/supabase/functions/annonces/test.mjs        (PGPORT=5499, PGDB=t29 par défaut)
import { execFileSync } from 'node:child_process';
import { makeHandler, fromVinted, kindOf, lotCount, cookieFrom, QUERIES } from './index.ts';

const PORT = process.env.PGPORT || '5499', DB = process.env.PGDB || 't29';
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l);
const sql = (q, role) => execFileSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', '/tmp', '-p', PORT, '-d', DB, '-tAq', '-v', 'ON_ERROR_STOP=1',
  '-c', (role ? 'set role ' + role + '; ' : '') + q], { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const lit = v => v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : typeof v === 'object' ? "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb" : "'" + String(v).replace(/'/g, "''") + "'";
const out = t => t === '' ? null : /^[{[]/.test(t) ? JSON.parse(t) : /^-?\d+$/.test(t) ? Number(t) : t;

// ——— Tri des annonces (sans réseau ni base) ———
ok('lot : « Lot 50 cartes pokemon » → lot de 50', kindOf('Lot 50 cartes pokemon') === 'lot' && lotCount('Lot 50 cartes pokemon') === 50);
ok('lot : « lot de 12 » → 12 ; « x100 » → 100', lotCount('Cartes Pokémon lot de 12') === 12 && lotCount('pokemon x100 communes') === 100);
ok('gradée : « Dracaufeu PSA 10 »', kindOf('Dracaufeu PSA 10 Pokémon') === 'graded');
ok('scellé : « ETB Évolutions Prismatiques »', kindOf('ETB Évolutions Prismatiques pokemon') === 'sealed' && kindOf('Display 36 boosters Pokémon') === 'sealed');
ok('carte seule : « Mew ex alt 30 ans »', kindOf('Mew ex alt 30 ans') === 'card' && lotCount('Mew ex 151/165') === null);
const base = { id: 7001, title: 'Carte Pokémon Mew ex 151/165', price: { amount: '12.5', currency_code: 'EUR' }, total_item_price: { amount: '13.83', currency_code: 'EUR' }, brand_title: 'Pokémon', status: 'Très bon état', url: 'https://www.vinted.fr/items/7001-mew', photo: { url: 'https://images1.vinted.net/t/big.jpg', thumbnails: [{ type: 'thumb310x430', url: 'https://images1.vinted.net/t/310.jpg' }] }, user: { login: 'vendeur_secret', photo: { url: 'https://images1.vinted.net/u.jpg' } } };
const r1 = fromVinted(base);
ok('annonce Vinted : prix, total, photo moyenne, lien, état', r1 && r1.price === 12.5 && r1.total_price === 13.83 && r1.photo === 'https://images1.vinted.net/t/310.jpg' && r1.url === 'https://www.vinted.fr/items/7001-mew' && r1.cond === 'Très bon état' && r1.kind === 'card');
ok('aucun pseudo ni avatar de vendeur gardé', !JSON.stringify(r1).includes('vendeur_secret') && !JSON.stringify(r1).includes('/u.jpg'));
ok('prix en texte (ancien format) accepté', fromVinted(Object.assign({}, base, { price: '7,90' })).price === 7.9);
ok('lien relatif ou étranger remplacé par le lien Vinted', fromVinted(Object.assign({}, base, { url: '/items/7001' })).url === 'https://www.vinted.fr/items/7001' && fromVinted(Object.assign({}, base, { url: 'https://evil.example/x' })).url === 'https://www.vinted.fr/items/7001');
ok('peluche, t-shirt, jeu Switch écartés', [fromVinted(Object.assign({}, base, { title: 'Peluche Pikachu Pokémon' })), fromVinted(Object.assign({}, base, { title: 'T-shirt Pokémon taille M' })), fromVinted(Object.assign({}, base, { title: 'Pokémon Écarlate jeu Switch' }))].every(x => x === null));
ok('annonce sans rapport avec Pokémon écartée', fromVinted(Object.assign({}, base, { title: 'Carte Yu-Gi-Oh Dragon blanc', brand_title: 'Konami' })) === null);
ok('annonce réservée, prix nul ou id faux écartés', fromVinted(Object.assign({}, base, { is_reserved: true })) === null && fromVinted(Object.assign({}, base, { price: '0' })) === null && fromVinted(Object.assign({}, base, { id: 'abc' })) === null);
const h = new Headers(); h.append('set-cookie', 'anon_id=abc; Path=/'); h.append('set-cookie', 'access_token_web=tok1; Path=/; HttpOnly'); h.append('set-cookie', 'old=deleted; Path=/');
ok('cookies de session repris (sans les cookies effacés)', cookieFrom(h) === 'anon_id=abc; access_token_web=tok1');

// ——— Faux Vinted ———
const V = { mode: 'ok', calls: [], token: 'tok1', expireOnce: false };
const item = (id, title, extra) => Object.assign({ id: id, title: title, price: { amount: '10.0', currency_code: 'EUR' }, total_item_price: { amount: '11.2', currency_code: 'EUR' }, brand_title: 'Pokémon', status: 'Bon état', url: 'https://www.vinted.fr/items/' + id, photo: { url: 'https://images1.vinted.net/' + id + '.jpg' }, user: { login: 'quelquun' } }, extra || {});
const pages = {
  'carte pokemon': [item(1, 'Carte Pokémon Dracaufeu ex'), item(2, 'Peluche Pokémon Évoli'), item(3, 'Carte Pikachu illustration rare pokemon')],
  'lot cartes pokemon': [item(4, 'Lot 100 cartes pokemon'), item(1, 'Carte Pokémon Dracaufeu ex', { price: { amount: '9.0', currency_code: 'EUR' } })],
  'carte pokemon psa': [item(5, 'Lugia PSA 9 Pokémon')],
  'etb pokemon': [item(6, 'ETB Pokémon 151 scellée')],
  'display pokemon': [item(7, 'Display Pokémon Flammes Obsidiennes'), item(8, 'Sac à dos Pokémon')]
};
const reply = (status, body, headers) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}) });
async function fakeFetch(url, init = {}) {
  const u = new URL(url), hd = init.headers || {};
  if (u.hostname === 'www.vinted.fr') {
    V.calls.push(u.pathname + u.search);
    if (V.mode === 'blocked') return reply(403, '<html><script src="https://geo.captcha-delivery.com/x.js"></script></html>', { 'Content-Type': 'text/html' });
    if (u.pathname === '/') { const r = reply(200, '<html>Vinted</html>', { 'Content-Type': 'text/html' }); r.headers.append('set-cookie', 'access_token_web=' + V.token + '; Path=/'); return r; }
    if (u.pathname === '/api/v2/catalog/items') {
      if (!String(hd.Cookie || '').includes('access_token_web=' + V.token)) return reply(401, { code: 100, message: 'invalid token' });
      if (V.expireOnce) { V.expireOnce = false; V.token = 'tok2'; return reply(401, { code: 100 }); }
      if (V.mode === 'blockmid' && u.searchParams.get('search_text') === 'carte pokemon psa') return reply(403, '<html>datadome</html>', { 'Content-Type': 'text/html' });
      return reply(200, { items: pages[u.searchParams.get('search_text')] || [], pagination: { current_page: 1 } });
    }
    return reply(404, {});
  }
  if (V.mode === 'noscript' && /\/rest\/v1\/rpc\//.test(u.pathname)) return reply(404, { code: 'PGRST202', message: 'Could not find the function public.listings_run_begin' });
  if (hd.Authorization !== 'Bearer service-key') return reply(401, { msg: 'not service' });
  const rpc = u.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  if (rpc) {
    const a = JSON.parse(init.body || '{}');
    try { return new Response(JSON.stringify(out(sql('select public.' + rpc[1] + '(' + Object.keys(a).map(k => k + ' => ' + lit(a[k])).join(', ') + ')::text', 'service_role')))); }
    catch (e) { return reply(400, { message: String(e.stderr || e.message) }); }
  }
  return reply(404, {});
}
const env = { SUPABASE_URL: 'http://kong:8000', SUPABASE_SERVICE_ROLE_KEY: 'service-key' };
const handle = makeHandler(k => env[k], fakeFetch, async () => {});
const call = (path, auth) => handle(new Request('http://x/annonces/' + path, { headers: auth ? { Authorization: auth } : {} }));
const force = () => call('vinted?force=1', 'Bearer service-key');

sql('delete from public.listings; delete from public.listing_runs');
let r = await call('vinted'); let j = await r.json();
ok('passage : 5 recherches, annonces Pokémon enregistrées', r.status === 200 && j.ok && j.searches.length === QUERIES.length && j.saved === 7 && j.fetched === 9);
ok('peluche et sac écartés, rien sur les vendeurs en base', sql("select count(*) from public.listings") === '6' && sql("select count(*) from public.listings where title ilike '%peluche%' or title ilike '%sac%'") === '0');
ok('types en base : carte, lot de 100, gradée, scellé', sql("select string_agg(ext_id || ':' || kind || coalesce(':' || lot_count, ''), ',' order by ext_id::int) from public.listings") === '1:card,3:card,4:lot:100,5:graded,6:sealed,7:sealed');
ok('même annonce dans 2 recherches : une seule ligne, dernier prix', sql("select count(*) || ':' || max(price) from public.listings where ext_id = '1'") === '1:9.00');
ok('rythme : une page d’accueil puis 5 recherches', V.calls.length === 6 && V.calls[0] === '/');
ok('passage noté réussi avec son message', sql("select ok::text || ':' || saved || ':' || (detail->>'message') from public.listing_runs order by id desc limit 1") === 'true:7:7 annonces Pokémon enregistrées sur 9 lues.');
V.calls = [];
r = await call('vinted'); j = await r.json();
ok('second appel à moins de 20 minutes : rien demandé à Vinted', j.skipped === true && V.calls.length === 0 && j.etat && j.etat.active === 6);
r = await call('vinted?force=1', 'Bearer anon-key'); j = await r.json();
ok('« force » sans la clé du serveur : ignoré', j.skipped === true && V.calls.length === 0);
r = await call('etat'); j = await r.json();
ok('état du fil lisible', r.status === 200 && j.etat.vinted.active === 6 && j.etat.vinted.last_ok);

// Session expirée en cours de route : une nouvelle session, puis la recherche reprend.
V.expireOnce = true; V.calls = [];
r = await force(); j = await r.json();
ok('session expirée : nouvelle session et recherche reprise', j.ok && j.saved === 7 && V.calls.filter(c => c === '/').length === 2);

// Blocage anti-robot : arrêt net, rien contourné, annonces déjà là gardées.
V.mode = 'blocked'; V.calls = [];
r = await force(); j = await r.json();
ok('Vinted bloque dès l’accueil : arrêt, message clair, une seule requête', j.ok === false && j.blocked === true && /refuse l’accès/.test(j.message) && V.calls.length === 1);
ok('annonces déjà enregistrées gardées', sql("select count(*) from public.listings where active") === '6');
V.mode = 'blockmid'; V.calls = [];
r = await force(); j = await r.json();
ok('blocage en cours de route : arrêt aux recherches suivantes', j.blocked === true && j.searches.length === 3 && /bloqué le serveur en cours de route/.test(j.message) && V.calls.length === 4);
V.mode = 'noscript';
r = await call('vinted'); j = await r.json();
ok('script 029 absent : message pour l’installer (503)', r.status === 503 && /029_annonces\.sql/.test(j.error));
V.mode = 'ok';
r = await call('autre'); ok('chemin inconnu : 404', r.status === 404);

console.log(res.join('\n'));
const ko = res.filter(l => l.startsWith('✗')).length;
console.log(ko ? ko + ' échec(s)' : res.length + ' vérifications réussies');
process.exit(ko ? 1 : 0);
