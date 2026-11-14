// Fonction « annonces » du serveur Supabase de Dropicards (2026-11-14, « go » du porteur pour Vinted ; docs/41, docs/42).
// Elle tourne dans le service « Edge Functions » de Supabase (Coolify), à l'adresse
//   https://api.dropicards.fr/functions/v1/annonces/vinted
// GET ou POST /annonces/vinted : lit les annonces publiques de cartes Pokémon les plus récentes sur Vinted (quelques
// recherches, 96 annonces chacune au plus), garde les annonces Pokémon (cartes, lots, scellé, gradées) et les enregistre
// dans la base (029_annonces.sql). Appelée toutes les 30 minutes par la base (pg_cron) ; le porteur peut aussi l'ouvrir
// dans un navigateur pour voir le diagnostic. Deux passages sont toujours espacés d'au moins 20 minutes (sauf « force »
// avec la clé service_role), pour ne pas solliciter Vinted plus que nécessaire.
// Scraping de Vinted autorisé par le porteur le 2026-11-14 (avis juridique obtenu par lui, CLAUDE.md §4). Règles tenues ici :
//   - seulement des pages publiques (catalogue de recherche), sans compte Vinted, sans contourner de blocage : si Vinted
//     refuse (403, page de vérification), la fonction s'arrête et le dit ;
//   - rythme modéré : 5 recherches par passage, 1,5 s entre deux requêtes, un passage toutes les 30 minutes ;
//   - aucun nom, pseudo ni avatar de vendeur gardé (RGPD) : titre, prix, photo, lien, état seulement.
// Variables (Coolify) : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY, déjà fournies par Supabase au service. Aucune clé à ajouter.
// Testée sous Node (tools/supabase/functions/annonces/test.mjs) avec un faux Vinted et la base locale.

export const VINTED = 'https://www.vinted.fr';
export const QUERIES = ['carte pokemon', 'lot cartes pokemon', 'carte pokemon psa', 'etb pokemon', 'display pokemon'];
const UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
const GAP_MIN = 20, PER_PAGE = 96, PAUSE_MS = 1500, FETCH_MS = 9000, BUDGET_MS = 45000;

const json = (status, body) => new Response(JSON.stringify(body, null, 2), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } });

// ——— Tri des annonces ———
const POKE = /pok[eé]mon|pokemon|pkmn/i;
// Ce qui n'est pas une carte ni un produit scellé de cartes (peluches, vêtements, jeux vidéo, objets…).
const NOT_TCG = /peluche|doudou|t-?shirt|tee-?shirt|sweat|pull\b|hoodie|casquette|bonnet|chaussette|pyjama|d[ée]guisement|costume|figurine|funko|lego|switch|nintendo|game ?boy|\b3?ds\b|jeu vid[ée]o|wii|poster|affiche|mug|tasse|gourde|sac\b|cartable|trousse|porte-?cl[ée]|lampe|veilleuse|coussin|plaid|drap|housse|montre|bijou|collier|bracelet|livre|manga|bd\b|dvd|blu-?ray|puzzle|tapis|autocollant|sticker|pin'?s|badge|vinyle|coque|chaussure|basket/i;
const SEALED = /\b(etb|display|booster|coffret|pok[eé] ?box|tin\b|mini ?tin|bundle|blister|tripack|tri-pack|scell[ée]|upc|collection premium|bo[iî]te d'?[ée]lite)/i;
const GRADED = /\b(psa|pca|ccc|cgc|bgs|beckett|collect ?aura|grad[ée]e?)\b\s*\d{0,2}/i;
const LOT = /\blots?\b|\b\d{2,5}\s*cartes\b|\bx\s?\d{2,4}\b|\b\d{2,4}\s?x\b|\bbulk\b|\bvrac\b/i;

export function lotCount(title) {
  const t = String(title || '');
  const m = t.match(/\b(\d{1,5})\s*(?:cartes|cards|pcs|pi[eè]ces)\b/i) || t.match(/\blots?\s+(?:de\s+)?(\d{1,5})\b/i) || t.match(/\bx\s?(\d{2,4})\b/i) || t.match(/\b(\d{2,4})\s?x\b/i);
  const n = m ? Number(m[1]) : 0;
  return n >= 2 && n <= 100000 ? n : null;
}

// Nature d'une annonce : « sealed » (produit scellé), « graded » (carte gradée), « lot », « card » (carte seule).
export function kindOf(title) {
  const t = String(title || '');
  if (GRADED.test(t) && !LOT.test(t)) return 'graded';
  if (SEALED.test(t) && !/\bcartes? (?:de|d'|issues?|du)\b/i.test(t)) return 'sealed';
  if (LOT.test(t) || lotCount(t)) return 'lot';
  return 'card';
}

const money = v => {
  if (v === null || v === undefined) return null;
  const raw = typeof v === 'object' ? v.amount : v;
  const n = Number(String(raw).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
};
const cur = v => (v && typeof v === 'object' && /^[A-Z]{3}$/.test(String(v.currency_code || '')) ? v.currency_code : 'EUR');

// Une annonce du catalogue Vinted → ligne de la table listings (ou null si ce n'est pas une annonce Pokémon utile).
export function fromVinted(it) {
  if (!it || typeof it !== 'object') return null;
  const id = String(it.id == null ? '' : it.id);
  const title = String(it.title || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const brand = String(it.brand_title || (it.brand && it.brand.title) || '').trim();
  if (!/^\d{1,20}$/.test(id) || !title) return null;
  if (it.is_visible === false || it.is_closed === true || it.is_reserved === true) return null;
  if (!POKE.test(title + ' ' + brand)) return null;
  if (NOT_TCG.test(title)) return null;
  const price = money(it.price);
  if (price === null || price <= 0) return null;
  const total = money(it.total_item_price);
  const ph = it.photo || (Array.isArray(it.photos) ? it.photos[0] : null) || {};
  const thumbs = Array.isArray(ph.thumbnails) ? ph.thumbnails : [];
  const th = thumbs.find(x => x && /310x430|364x428|428x624/.test(String(x.type || ''))) || null;
  let photo = String((th && th.url) || ph.url || '');
  if (!/^https:\/\//.test(photo)) photo = '';
  let url = String(it.url || '');
  if (/^\//.test(url)) url = VINTED + url;
  if (!/^https:\/\/([a-z0-9-]+\.)*vinted\.[a-z.]+\//i.test(url)) url = VINTED + '/items/' + id;
  const kind = kindOf(title);
  return {
    id: id, title: title, price: price, total_price: total !== null && total >= price ? total : null, currency: cur(it.price),
    photo: photo || null, url: url, brand: brand.slice(0, 80) || null, cond: String(it.status || '').slice(0, 60) || null,
    is_lot: kind === 'lot', lot_count: kind === 'lot' ? lotCount(title) : null, kind: kind
  };
}

// Cookies renvoyés par Vinted (session anonyme du visiteur) → en-tête Cookie.
export function cookieFrom(headers) {
  let list = [];
  try { if (typeof headers.getSetCookie === 'function') list = headers.getSetCookie(); } catch (e) { list = []; }
  if (!list.length) { const one = headers.get('set-cookie'); if (one) list = one.split(/,(?=\s*[A-Za-z0-9_.-]+=)/); }
  const jar = {};
  for (const c of list) { const m = String(c).match(/^\s*([^=;\s]+)=([^;]*)/); if (m && m[2] !== '' && !/^deleted$/i.test(m[2])) jar[m[1]] = m[2]; }
  return Object.keys(jar).map(k => k + '=' + jar[k]).join('; ');
}

export function makeHandler(env, fetchImpl = fetch, sleep = (ms) => new Promise(r => setTimeout(r, ms)), now = () => Date.now()) {
  const E = k => (env(k) || '').trim();
  const SB = E('SUPABASE_URL').replace(/\/+$/, '');
  async function rpc(name, args) {
    const k = E('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetchImpl(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const txt = await res.text();
    if (!res.ok) {
      console.error('rpc', name, res.status, txt);
      const miss = res.status === 404 || /PGRST202|42883|42P01/.test(txt);
      throw Object.assign(new Error(miss ? 'Le script 029_annonces.sql n’est pas encore installé dans la base (Studio › SQL Editor).' : 'Base de données indisponible.'), { status: miss ? 503 : 500 });
    }
    return txt ? JSON.parse(txt) : null;
  }
  async function get(url, headers) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), FETCH_MS);
    try { return await fetchImpl(url, { headers: headers, redirect: 'follow', signal: ctl.signal }); }
    finally { clearTimeout(timer); }
  }
  const BASE_H = { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.6' };
  const blockedPage = (res, txt) => res.status === 403 || res.status === 429 || /datadome|captcha-delivery|geo\.captcha/i.test(txt || '');

  async function session() {
    const res = await get(VINTED + '/', Object.assign({ Accept: 'text/html,application/xhtml+xml' }, BASE_H));
    const txt = await res.text().catch(() => '');
    if (blockedPage(res, txt)) return { blocked: true, status: res.status };
    const cookie = cookieFrom(res.headers);
    return { cookie: cookie, status: res.status, hasToken: /access_token_web=/.test(cookie) };
  }

  async function vinted(req) {
    const t0 = now();
    const u = new URL(req.url);
    const service = (req.headers.get('authorization') || '') === 'Bearer ' + E('SUPABASE_SERVICE_ROLE_KEY') && !!E('SUPABASE_SERVICE_ROLE_KEY');
    const force = service && u.searchParams.get('force') === '1';
    const rid = await rpc('listings_run_begin', { src: 'vinted', gap_min: force ? 0 : GAP_MIN });
    if (rid === null || rid === undefined) {
      const st = await rpc('listings_status', {}).catch(() => null);
      return json(200, { ok: true, skipped: true, message: 'Dernier passage il y a moins de ' + GAP_MIN + ' minutes : rien à faire pour l’instant.', etat: st && st.vinted });
    }
    const out = { ok: false, source: 'vinted', fetched: 0, kept: 0, saved: 0, searches: [], message: '' };
    const end = async () => { await rpc('listings_run_end', { rid: rid, ok: out.ok, fetched: out.fetched, saved: out.saved, detail: { message: out.message, searches: out.searches } }).catch(e => console.error(e)); return json(200, out); };
    try {
      let s = await session();
      if (s.blocked) { out.blocked = true; out.message = 'Vinted refuse l’accès depuis le serveur (code ' + s.status + ', vérification anti-robot). Rien n’a été contourné ; le fil garde les annonces déjà enregistrées.'; return await end(); }
      if (!s.cookie) { out.message = 'Vinted n’a pas ouvert de session visiteur (code ' + s.status + ').'; return await end(); }
      for (let i = 0; i < QUERIES.length; i++) {
        if (now() - t0 > BUDGET_MS) { out.searches.push({ q: QUERIES[i], skipped: 'temps écoulé' }); continue; }
        const q = QUERIES[i];
        const api = VINTED + '/api/v2/catalog/items?' + new URLSearchParams({ search_text: q, order: 'newest_first', per_page: String(PER_PAGE), page: '1' }).toString();
        await sleep(PAUSE_MS);
        let res = await get(api, Object.assign({ Accept: 'application/json, text/plain, */*', Cookie: s.cookie, Referer: VINTED + '/catalog?search_text=' + encodeURIComponent(q) }, BASE_H));
        if (res.status === 401) {
          // Session expirée : une seule nouvelle session, puis on réessaie cette recherche une fois.
          await res.text().catch(() => '');
          s = await session();
          if (s.blocked || !s.cookie) { out.blocked = !!s.blocked; out.searches.push({ q: q, status: 401 }); break; }
          await sleep(PAUSE_MS);
          res = await get(api, Object.assign({ Accept: 'application/json, text/plain, */*', Cookie: s.cookie }, BASE_H));
        }
        const txt = await res.text().catch(() => '');
        if (blockedPage(res, txt)) { out.blocked = true; out.searches.push({ q: q, status: res.status, blocked: true }); break; }
        let j = null;
        try { j = JSON.parse(txt); } catch (e) { j = null; }
        if (!res.ok || !j || !Array.isArray(j.items)) { out.searches.push({ q: q, status: res.status, error: 'réponse inattendue' }); continue; }
        const rows = j.items.map(fromVinted).filter(Boolean);
        out.fetched += j.items.length; out.kept += rows.length;
        const n = rows.length ? Number(await rpc('listings_upsert', { src: 'vinted', items: rows, q: q })) || 0 : 0;
        out.saved += n;
        out.searches.push({ q: q, status: res.status, annonces: j.items.length, gardees: rows.length, enregistrees: n });
      }
      out.ok = out.saved > 0 || (out.fetched > 0 && !out.blocked);
      out.message = out.blocked
        ? 'Vinted a bloqué le serveur en cours de route (anti-robot) : ' + out.saved + ' annonces enregistrées avant le blocage. Rien n’a été contourné.'
        : out.ok ? out.saved + ' annonces Pokémon enregistrées sur ' + out.fetched + ' lues.' : 'Aucune annonce lue : voir le détail des recherches.';
      out.secondes = Math.round((now() - t0) / 100) / 10;
      return await end();
    } catch (e) {
      out.message = (e && e.name === 'AbortError') ? 'Vinted n’a pas répondu à temps.' : (e && e.message) || 'Erreur du serveur.';
      return await end();
    }
  }

  return async req => {
    try {
      const path = new URL(req.url).pathname.replace(/\/+$/, '');
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' } });
      if ((req.method === 'GET' || req.method === 'POST') && /\/annonces\/vinted$/.test(path)) return await vinted(req);
      if (req.method === 'GET' && /\/annonces(\/etat)?$/.test(path)) return json(200, { ok: true, etat: await rpc('listings_status', {}) });
      return json(404, { error: 'Chemin inconnu' });
    } catch (e) {
      return json(e && e.status ? e.status : 500, { ok: false, error: (e && e.message) || 'Erreur du serveur.' });
    }
  };
}

if (typeof Deno !== 'undefined') Deno.serve(makeHandler(k => Deno.env.get(k)));
