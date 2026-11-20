// Tests de la fonction « push » (index.ts) sous Node, sans réseau : vecteur officiel de la RFC 8291, aller-retour
// chiffrement / déchiffrement, signature VAPID, puis faux services d'envoi (Google, Apple) et la vraie base de test locale
// (PostgreSQL avec 001 à 036, voir tools/supabase/README.md). Jamais sur le vrai serveur ni vers un vrai téléphone.
//   node tools/supabase/functions/push/test.mjs        (PGPORT=5499, PGDB=t7 par défaut)
import { execFileSync } from 'node:child_process';
import { makeHandler, encryptPush, vapidAuth, makeVapidKeys, b64u, unb64u } from './index.ts';

const PORT = process.env.PGPORT || '5499', DB = process.env.PGDB || 't7';
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l);
const sql = (q, role) => execFileSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', '/tmp', '-p', PORT, '-d', DB, '-tAq', '-v', 'ON_ERROR_STOP=1',
  '-c', (role ? 'set role ' + role + '; ' : '') + q], { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const lit = v => v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : typeof v === 'object' ? "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb" : "'" + String(v).replace(/'/g, "''") + "'";
const enc = new TextEncoder(), dec = new TextDecoder();

// 1. Vecteur de la RFC 8291 (annexe A) : le message chiffré doit être identique, octet pour octet.
{
  const V = {
    asPriv: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
    asPub: 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
    uaPub: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
    auth: 'BTBZMqHH6r4Tts7J_aSIgg', salt: 'DGv6ra1nlYgDCS1FRnbzlw',
    out: 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN'
  };
  const p = unb64u(V.asPub);
  const priv = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: b64u(p.slice(1, 33)), y: b64u(p.slice(33)), d: V.asPriv, ext: true }, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const pub = await crypto.subtle.importKey('raw', p, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
  const out = await encryptPush(V.uaPub, V.auth, 'When I grow up, I want to be a watermelon', { asKeys: { privateKey: priv, publicKey: pub }, salt: unb64u(V.salt) });
  ok('chiffrement identique au vecteur de la RFC 8291', b64u(out) === V.out);
}

// Un faux appareil : ses clés, et le déchiffrement d'un message reçu (côté téléphone, RFC 8291).
async function device() {
  const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const pub = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  const hkdf = async (salt, ikm, info, len) => new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info },
    await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), len * 8));
  return {
    p256dh: b64u(pub), auth: b64u(auth),
    async open(body) {
      const b = new Uint8Array(body), salt = b.slice(0, 16), idlen = b[20], asPub = b.slice(21, 21 + idlen), ct = b.slice(21 + idlen);
      const asKey = await crypto.subtle.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
      const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: asKey }, kp.privateKey, 256));
      const info = new Uint8Array([...enc.encode('WebPush: info\0'), ...pub, ...asPub]);
      const ikm = await hkdf(auth, secret, info, 32);
      const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16), nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
      const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), ct));
      return dec.decode(plain.slice(0, plain.lastIndexOf(2)));
    }
  };
}

// 2. Aller-retour avec un vrai couple de clés.
{
  const d = await device();
  const msg = JSON.stringify({ t: 'Booster PK prêt', b: 'Ton Booster PK gratuit peut être ouvert', u: './#marche', g: 'pkm-booster' });
  ok('aller-retour : le téléphone lit le message (accents compris)', await d.open(await encryptPush(d.p256dh, d.auth, msg)) === msg);
  const a = b64u(await encryptPush(d.p256dh, d.auth, msg)), b = b64u(await encryptPush(d.p256dh, d.auth, msg));
  ok('deux envois du même message : chiffrés différemment (sel et clé à usage unique)', a !== b);
}

// 3. Signature VAPID : vérifiable avec la clé publique, audience = origine du service d'envoi.
{
  const k = await makeVapidKeys();
  const h = await vapidAuth('https://fcm.googleapis.com/fcm/send/abc', k, Date.UTC(2026, 10, 20, 12));
  const m = h.match(/^vapid t=([\w-]+)\.([\w-]+)\.([\w-]+), k=([\w-]+)$/);
  const pub = await crypto.subtle.importKey('raw', unb64u(k.pub), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const good = m && await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pub, unb64u(m[3]), enc.encode(m[1] + '.' + m[2]));
  const claims = m ? JSON.parse(dec.decode(unb64u(m[2]))) : {};
  ok('signature VAPID valide (ES256)', !!good && m[4] === k.pub);
  ok('jeton VAPID : audience ' + claims.aud + ', expiration 12 h, contact', claims.aud === 'https://fcm.googleapis.com' && claims.exp === Date.UTC(2026, 10, 20, 12) / 1000 + 43200 && claims.sub === 'mailto:contact@dropicards.fr');
  ok('clé publique au format attendu par les navigateurs (65 octets)', unb64u(k.pub).length === 65 && unb64u(k.pub)[0] === 4);
}

// 4. La fonction avec la base de test : clés créées et gardées, envoi des rappels dus, adresse refusée effacée, test.
const NOW = '2026-11-20T13:00:00Z';  // 14 h à Paris
sql('delete from public.push_keys; delete from public.push_runs');
const email = 'push-' + process.pid + '@test.fr';
const UID = sql('insert into auth.users (email) values (' + lit(email) + ') returning id');
const dA = await device(), dB = await device();
const subscribe = (endpoint, d) => sql("select set_config('request.jwt.claim.sub', " + lit(UID) + ", false); set role authenticated; select public.push_subscribe(" + [endpoint, d.p256dh, d.auth].map(lit).join(', ') + ')');
subscribe('https://fcm.googleapis.com/fcm/send/push-a-' + process.pid, dA);
subscribe('https://web.push.apple.com/push-b-' + process.pid, dB);
sql("insert into public.ledger (user_id, kind, pk_after, pa_after, at) values (" + lit(UID) + ", 'booster', 0, 0, " + lit(NOW) + "::timestamptz - interval '25 hours')");
sql("update public.wallets set pa_day = '2026-11-20' where user_id = " + lit(UID));  // PA déjà récupérés : seul le booster est dû

const tokens = { 'tok-ok': { id: UID, email } };
const P = { got: [], gone: new Set() };
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const TABLES = new Set(['push_due', 'push_test_claim']);
async function fakeFetch(url, init = {}) {
  const u = new URL(url), h = init.headers || {};
  if (u.hostname === 'fcm.googleapis.com' || u.hostname === 'web.push.apple.com') {
    P.got.push({ url, headers: h, body: init.body });
    return new Response('', { status: P.gone.has(url) ? 410 : 201 });
  }
  if (u.pathname === '/auth/v1/user') { const t = String(h.Authorization || '').replace(/^Bearer /, ''); return tokens[t] ? reply(200, tokens[t]) : reply(401, { msg: 'bad jwt' }); }
  if (h.Authorization !== 'Bearer service-key') return reply(401, { msg: 'not service' });
  const rpc = u.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  if (rpc) {
    const a = JSON.parse(init.body || '{}'), args = Object.keys(a).map(k => k + ' => ' + lit(a[k])).join(', ');
    try {
      const q = TABLES.has(rpc[1]) ? 'select coalesce(json_agg(t), \'[]\')::text from public.' + rpc[1] + '(' + args + ') t' : 'select to_json(public.' + rpc[1] + '(' + args + '))::text';
      return new Response(sql(q, 'service_role'));
    } catch (e) { return reply(400, { message: String(e.stderr || e.message).replace(/^[\s\S]*ERROR:\s*/, '').trim() }); }
  }
  return reply(404, {});
}
const env = { SUPABASE_URL: 'http://kong:8000', SUPABASE_ANON_KEY: 'anon-key', SUPABASE_SERVICE_ROLE_KEY: 'service-key', PUSH_TEST_NOW: NOW };
const H = makeHandler(k => env[k], fakeFetch);
const call = (method, path, token) => H(new Request('https://api.dropicards.fr/functions/v1/push/' + path, { method, headers: token ? { Authorization: 'Bearer ' + token } : {} }));

const k1 = await (await call('GET', 'key')).json();
const k2 = await (await makeHandler(k => env[k], fakeFetch)(new Request('https://api.dropicards.fr/functions/v1/push/key'))).json();
ok('clé publique créée au premier appel, gardée dans la base (même clé ensuite)', /^[\w-]{87}$/.test(k1.key) && k1.key === k2.key && sql('select count(*) from public.push_keys') === '1');

const r1 = await (await call('POST', 'run')).json();
const mine = P.got.filter(g => /push-[ab]-/.test(g.url));
ok('passage : ' + JSON.stringify(r1), r1.ok >= 2 && mine.length === 2);
const msgA = JSON.parse(await dA.open(mine.find(g => /push-a-/.test(g.url)).body)), msgB = JSON.parse(await dB.open(mine.find(g => /push-b-/.test(g.url)).body));
ok('les 2 appareils lisent « ' + msgA.t + ' » (lien ' + msgA.u + ', étiquette ' + msgA.g + ')', msgA.t === 'Booster PK prêt' && msgB.t === 'Booster PK prêt' && msgA.u === './#marche' && msgA.g === 'pkm-booster');
const hd = mine[0].headers;
ok('en-têtes Web Push : aes128gcm, TTL 12 h, VAPID avec la clé publique', hd['Content-Encoding'] === 'aes128gcm' && hd.TTL === '43200' && hd.Authorization.endsWith(', k=' + k1.key));
ok('Apple reçoit un jeton pour son propre service', /vapid t=/.test(mine.find(g => /web\.push\.apple/.test(g.url)).headers.Authorization)
  && JSON.parse(new TextDecoder().decode(unb64u(mine.find(g => /web\.push\.apple/.test(g.url)).headers.Authorization.split('.')[1]))).aud === 'https://web.push.apple.com');
ok('passage noté (push_runs)', sql('select due >= 2 and ok >= 2 from public.push_runs order by id desc limit 1') === 't');

const r2 = await (await call('POST', 'run')).json();
ok('deuxième passage dans les 4 minutes : rien', r2.skipped === true);

// Nouvelle partie de pièce dans le passé : un 3ᵉ passage (plus tard) envoie ; l'adresse Apple refusée (410) est effacée.
sql("update public.game_grades set coin_h = 8 where i = 0");
sql("insert into public.ledger (user_id, kind, pk_after, pa_after, at) values (" + lit(UID) + ", 'coin', 0, 0, " + lit(NOW) + "::timestamptz - interval '9 hours')");
sql('update public.push_runs set started_at = started_at - interval \'10 minutes\'');
P.gone.add('https://web.push.apple.com/push-b-' + process.pid);
P.got = [];
const r3 = await (await call('POST', 'run')).json();
ok('pièce prête : envoyée (' + JSON.stringify(r3) + ')', P.got.filter(g => /push-a-/.test(g.url)).length === 1 && r3.gone >= 1);
ok('adresse refusée par le service (410) : effacée de la base', sql("select count(*) from public.push_subs where endpoint like '%push-b-" + process.pid + "'") === '0');
sql("update public.game_grades set coin_h = 0 where i = 0");

// Notification de test depuis l'app.
P.got = [];
const t0 = await call('POST', 'test');
ok('test sans connexion : refusé', t0.status === 401);
const t1 = await (await call('POST', 'test', 'tok-ok')).json();
const tmsg = P.got.length ? JSON.parse(await dA.open(P.got[0].body)) : {};
ok('test : « ' + tmsg.t + ' » vers l’appareil restant', t1.sent === 1 && tmsg.t === 'Notifications activées' && tmsg.g === 'pkm-test');
const t2 = await call('POST', 'test', 'tok-ok');
ok('deuxième test dans les 10 minutes : refusé avec un message clair', t2.status === 429 && /10 minutes/.test((await t2.json()).error));
const k404 = await call('GET', 'inconnu');
ok('chemin inconnu : 404', k404.status === 404);

console.log(res.join('\n'));
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
