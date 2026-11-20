// Fonction « push » du serveur Supabase de Dropicards (2026-11-20, porteur : « je veux que l'utilisateur reçoive une notif
// sur son téléphone dès lors que les jeux sont de nouveau disponibles », relances après 72 h et 1 semaine ; guide docs/46).
// Elle tourne dans le service « Edge Functions » de Supabase (Coolify), à l'adresse https://api.dropicards.fr/functions/v1/push/…
//   GET  /push/key  : clé publique VAPID que l'app donne au navigateur pour s'abonner (créée au premier appel, puis gardée
//                     dans la base, table push_keys : aucune clé à régler dans Coolify).
//   POST /push/run  : lancé toutes les 5 minutes par la base (pg_cron, 036_notifications_push.sql) ; lit les rappels dus
//                     (push_due : jeux prêts, PA du jour, relances d'absence, heures calmes), les envoie, puis note le
//                     résultat (push_report : adresse refusée effacée). Deux passages à moins de 4 minutes : le 2ᵉ ne fait rien.
//   POST /push/test : joueur connecté ; notification de test vers ses appareils (une toutes les 10 minutes au plus).
// Envoi Web Push écrit ici avec WebCrypto, sans bibliothèque : signature VAPID ES256 (RFC 8292) et chiffrement aes128gcm
// (RFC 8291). Les services des navigateurs (Google, Apple, Mozilla, Microsoft) sont gratuits.
// Variables : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (déjà fournies par Supabase au service).
// Testée sous Node (tools/supabase/functions/push/test.mjs) : vecteur de la RFC 8291, aller-retour, faux services d'envoi et
// base locale. Jamais sur le vrai serveur.

const SUBJECT = 'mailto:contact@dropicards.fr';
const TTL = 12 * 3600;  // un rappel non remis dans les 12 h n'a plus de sens
const BATCH = 25;
const enc = new TextEncoder();
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS } });
const fail = (status, msg) => json(status, { error: msg });

export const b64u = (buf) => {
  let s = '';
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
export const unb64u = (s) => {
  const t = String(s).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(t + '='.repeat((4 - (t.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};

// Paire de clés VAPID : publique en « raw » (65 octets, base64url), privée en JWK (texte JSON).
export async function makeVapidKeys() {
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const j = await crypto.subtle.exportKey('jwk', kp.privateKey);
  return { pub: b64u(pub), priv: JSON.stringify({ kty: j.kty, crv: j.crv, x: j.x, y: j.y, d: j.d }) };
}

// En-tête Authorization VAPID (RFC 8292) pour l'adresse d'envoi donnée.
export async function vapidAuth(endpoint, keys, now = Date.now()) {
  const head = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = b64u(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + TTL, sub: SUBJECT })));
  const key = await crypto.subtle.importKey('jwk', { ...JSON.parse(keys.priv), ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(head + '.' + body)));
  return 'vapid t=' + head + '.' + body + '.' + b64u(sig) + ', k=' + keys.pub;
}

async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8));
}

// Chiffrement aes128gcm d'un message pour un appareil (RFC 8291) ; opts.asKeys et opts.salt seulement pour les tests.
export async function encryptPush(p256dh, authSecret, plaintext, opts = {}) {
  const ua = unb64u(p256dh), auth = unb64u(authSecret);
  const as = opts.asKeys || await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const secret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, secret, concat(enc.encode('WebPush: info\0'), ua, asPub), 32);
  const salt = opts.salt || crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const data = concat(typeof plaintext === 'string' ? enc.encode(plaintext) : plaintext, new Uint8Array([2]));
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, data));
  const rs = 4096;
  return concat(salt, new Uint8Array([(rs >>> 24) & 255, (rs >>> 16) & 255, (rs >>> 8) & 255, rs & 255, asPub.length]), asPub, ct);
}

// Envoi d'une notification à une adresse d'envoi : { ok, gone, status }.
export async function sendPush(sub, payload, keys, fetchImpl = fetch) {
  try {
    const body = await encryptPush(sub.p256dh, sub.auth, JSON.stringify(payload));
    const res = await fetchImpl(sub.endpoint, { method: 'POST', body, headers: {
      Authorization: await vapidAuth(sub.endpoint, keys), TTL: String(TTL), Urgency: 'normal',
      'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream' } });
    return { ok: res.status >= 200 && res.status < 300, gone: res.status === 404 || res.status === 410, status: res.status };
  } catch (e) {
    return { ok: false, gone: false, status: 0 };
  }
}

export function makeHandler(env, fetchImpl = fetch) {
  const E = k => (env(k) || '').trim();
  const SB = E('SUPABASE_URL').replace(/\/+$/, '');
  async function rpc(name, args) {
    const k = E('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetchImpl(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify(args || {}) });
    const txt = await res.text();
    if (!res.ok) {
      let msg = 'Base de données indisponible.';
      try { const m = JSON.parse(txt).message; if (m && /10 minutes/.test(m)) msg = m; } catch (e) { /* texte brut */ }
      console.error('rpc', name, res.status, txt);
      throw Object.assign(new Error(msg), { status: /10 minutes/.test(msg) ? 429 : 500 });
    }
    return txt ? JSON.parse(txt) : null;
  }
  async function userOf(req) {
    const auth = req.headers.get('authorization') || '';
    if (!/^Bearer\s+\S+$/.test(auth)) return null;
    const res = await fetchImpl(SB + '/auth/v1/user', { headers: { apikey: E('SUPABASE_ANON_KEY'), Authorization: auth } });
    if (!res.ok) return null;
    const u = await res.json().catch(() => null);
    return u && u.id ? u : null;
  }
  let cached = null;
  async function keys() {
    if (cached) return cached;
    let k = await rpc('push_keys_get', {});
    if (!k || !k.pub) { const fresh = await makeVapidKeys(); k = await rpc('push_keys_init', fresh); }
    cached = k;
    return k;
  }
  async function deliver(rows, payloadOf) {
    const k = await keys(), results = [];
    for (let i = 0; i < rows.length; i += BATCH) {
      const part = rows.slice(i, i + BATCH);
      const done = await Promise.all(part.map(r => sendPush(r, payloadOf(r), k, fetchImpl)));
      done.forEach((d, j) => results.push({ sub: part[j].sub_id, ok: d.ok, gone: d.gone }));
    }
    if (results.length) await rpc('push_report', { results });
    return results;
  }
  async function run() {
    const rid = await rpc('push_run_begin', { gap_sec: 240 });
    if (rid === null || rid === undefined) return json(200, { skipped: true });
    const args = { max_rows: 2000 };
    if (E('PUSH_TEST_NOW')) args.now_at = E('PUSH_TEST_NOW');  // tests seulement, jamais réglée sur le serveur
    const rows = await rpc('push_due', args) || [];
    const res = await deliver(rows, r => ({ t: r.title, b: r.body, u: r.url, g: 'pkm-' + r.kind }));
    const ok = res.filter(r => r.ok).length, gone = res.filter(r => r.gone).length;
    await rpc('push_run_end', { rid, due: rows.length, ok, gone, failed: res.length - ok - gone });
    return json(200, { due: rows.length, ok, gone, failed: res.length - ok - gone });
  }
  async function test(req) {
    const u = await userOf(req);
    if (!u) return fail(401, 'Connecte-toi à ton compte Dropicards.');
    const rows = await rpc('push_test_claim', { uid: u.id }) || [];
    if (!rows.length) return fail(404, 'Aucun appareil enregistré : autorise d’abord les notifications.');
    const res = await deliver(rows, () => ({ t: 'Notifications activées', b: 'Tu seras prévenu ici dès que tes jeux sont prêts.', u: './', g: 'pkm-test' }));
    return json(200, { sent: res.filter(r => r.ok).length, devices: rows.length });
  }
  return async req => {
    try {
      const path = new URL(req.url).pathname.replace(/\/+$/, '');
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
      if (req.method === 'GET' && /\/push\/key$/.test(path)) return json(200, { key: (await keys()).pub });
      if (req.method === 'POST' && /\/push\/run$/.test(path)) return await run();
      if (req.method === 'POST' && /\/push\/test$/.test(path)) return await test(req);
      return fail(404, 'Chemin inconnu');
    } catch (e) {
      return fail(e && e.status ? e.status : 500, (e && e.message) || 'Erreur du serveur.');
    }
  };
}

if (typeof Deno !== 'undefined') Deno.serve(makeHandler(k => Deno.env.get(k)));
