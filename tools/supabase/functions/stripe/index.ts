// Fonction « stripe » du serveur Supabase de Dropicards (2026-11-07, « go » du porteur ; guide docs/28).
// Elle tourne dans le service « Edge Functions » de Supabase (Coolify), à l'adresse
//   https://api.dropicards.fr/functions/v1/stripe/…
// Trois chemins :
//   POST /stripe/checkout  (joueur connecté) → page de paiement Stripe pour la formule choisie (« month » ou « year »)
//   POST /stripe/portal    (joueur connecté) → page Stripe pour gérer ou arrêter son abonnement
//   POST /stripe/webhook   (Stripe seulement) → message signé de Stripe : abonnement créé, renouvelé, arrêté, payé…
// Les secrets restent dans les variables du serveur (Coolify), jamais dans le dépôt ni dans l'app :
//   STRIPE_SECRET_KEY      clé secrète ou restreinte de Stripe (sk_… ou rk_…)
//   STRIPE_WEBHOOK_SECRET  secret de signature du point de terminaison (whsec_…)
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY : déjà fournis par Supabase au service.
// Facultatif : APP_URL (https://dropicards.fr par défaut), STRIPE_PRICE_MONTH et STRIPE_PRICE_YEAR (sinon les prix sont
// trouvés par leur clé de recherche : dropicards_premium_month et dropicards_premium_year).
// Aucune bibliothèque : l'API de Stripe est appelée directement, la signature est vérifiée avec WebCrypto.
// Le même fichier est testé sous Node (tools/supabase/functions/stripe/test.mjs) avec un faux Stripe et la base locale.

const STRIPE_API = 'https://api.stripe.com/v1';
const LOOKUP = { month: 'dropicards_premium_month', year: 'dropicards_premium_year' };
const TOLERANCE_S = 300;

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const fail = (status, msg) => json(status, { error: msg });

// Paramètres imbriqués de Stripe : { a: { b: 1 }, c: [{ d: 2 }] } → a[b]=1&c[0][d]=2
function formEncode(obj, prefix = '', out = new URLSearchParams()) {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === undefined || v === null) continue;
    const key = prefix ? prefix + '[' + k + ']' : k;
    if (typeof v === 'object') formEncode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

const hex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
// Signature d'un message de Stripe (en-tête Stripe-Signature : t=…,v1=…) : HMAC-SHA256 de « t.corps » avec le secret.
export async function verifySignature(raw, header, secret, nowS = Math.floor(Date.now() / 1000)) {
  if (!header || !secret) return false;
  let t = '';
  const v1 = [];
  for (const part of String(header).split(',')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === 't') t = v; else if (k === 'v1') v1.push(v);
  }
  if (!/^\d+$/.test(t) || !v1.length || Math.abs(nowS - Number(t)) > TOLERANCE_S) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, enc.encode(t + '.' + raw)));
  return v1.some(s => sameText(s, expected));
}

// Fin de la période payée : sur l'abonnement (anciennes versions de l'API) ou sur sa ligne (versions récentes).
const periodEnd = sub => sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end) || null;
function planOf(price) {
  if (!price) return null;
  if (price.lookup_key === LOOKUP.year) return 'year';
  if (price.lookup_key === LOOKUP.month) return 'month';
  const iv = price.recurring && price.recurring.interval;
  return iv === 'year' ? 'year' : iv === 'month' ? 'month' : null;
}
const iso = s => (s ? new Date(Number(s) * 1000).toISOString() : null);

export function makeHandler(env, fetchImpl = fetch) {
  const E = k => (env(k) || '').trim();
  const APP = (E('APP_URL') || 'https://dropicards.fr').replace(/\/+$/, '');
  const SB = E('SUPABASE_URL').replace(/\/+$/, '');

  async function stripe(method, path, params, idem) {
    const key = E('STRIPE_SECRET_KEY');
    if (!key) throw Object.assign(new Error('Le paiement n’est pas encore configuré sur le serveur.'), { status: 503 });
    const h = { Authorization: 'Bearer ' + key };
    let url = STRIPE_API + path, body;
    if (method === 'GET' && params) url += '?' + formEncode(params).toString();
    else if (params) { body = formEncode(params).toString(); h['Content-Type'] = 'application/x-www-form-urlencoded'; }
    if (idem) h['Idempotency-Key'] = idem;
    const res = await fetchImpl(url, { method, headers: h, body });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Stripe', method, path, res.status, j && j.error && j.error.message);
      throw Object.assign(new Error('Stripe ne répond pas comme prévu. Réessaie dans un instant.'), { status: 502 });
    }
    return j;
  }
  async function rpc(name, args) {
    const k = E('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetchImpl(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const txt = await res.text();
    if (!res.ok) { console.error('rpc', name, res.status, txt); throw Object.assign(new Error('Base de données indisponible.'), { status: 500 }); }
    return txt ? JSON.parse(txt) : null;
  }
  async function premiumRow(uid) {
    const k = E('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetchImpl(SB + '/rest/v1/premium?select=status,period_end&user_id=eq.' + encodeURIComponent(uid), { headers: { apikey: k, Authorization: 'Bearer ' + k } });
    const rows = res.ok ? await res.json() : [];
    return rows && rows[0] || null;
  }
  // Joueur connecté : son jeton est vérifié par le service des comptes de Supabase.
  async function userOf(req) {
    const auth = req.headers.get('authorization') || '';
    if (!/^Bearer\s+\S+$/.test(auth)) return null;
    const res = await fetchImpl(SB + '/auth/v1/user', { headers: { apikey: E('SUPABASE_ANON_KEY'), Authorization: auth } });
    if (!res.ok) return null;
    const u = await res.json().catch(() => null);
    return u && u.id ? u : null;
  }
  async function priceId(plan) {
    const fixed = E(plan === 'year' ? 'STRIPE_PRICE_YEAR' : 'STRIPE_PRICE_MONTH');
    if (fixed) return fixed;
    const j = await stripe('GET', '/prices', { 'lookup_keys': [LOOKUP[plan]], active: 'true', limit: 1 });
    const p = j && j.data && j.data[0];
    if (!p) throw Object.assign(new Error('Cette formule n’existe pas encore dans Stripe.'), { status: 503 });
    return p.id;
  }
  async function customerOf(u) {
    let cust = await rpc('premium_customer', { uid: u.id });
    if (cust) return cust;
    const c = await stripe('POST', '/customers', { email: u.email || undefined, metadata: { user_id: u.id } }, 'dropicards-customer-' + u.id);
    await rpc('premium_set_customer', { uid: u.id, cust: c.id });
    cust = await rpc('premium_customer', { uid: u.id });
    return cust || c.id;
  }

  async function checkout(req) {
    const u = await userOf(req);
    if (!u) return fail(401, 'Connecte-toi à ton compte Dropicards pour devenir Premium.');
    const b = await req.json().catch(() => ({}));
    const plan = b && b.plan === 'month' ? 'month' : b && b.plan === 'year' ? 'year' : '';
    if (!plan) return fail(400, 'Choisis la formule mensuelle ou annuelle.');
    const row = await premiumRow(u.id);
    if (row && ['active', 'trialing', 'past_due'].includes(row.status) && row.period_end && new Date(row.period_end).getTime() > Date.now()) {
      return fail(409, 'Tu es déjà Premium : gère ton abonnement depuis Mon profil.');
    }
    const price = await priceId(plan);
    const cust = await customerOf(u);
    const s = await stripe('POST', '/checkout/sessions', {
      mode: 'subscription',
      customer: cust,
      client_reference_id: u.id,
      line_items: [{ price: price, quantity: 1 }],
      subscription_data: { metadata: { user_id: u.id } },
      metadata: { user_id: u.id, plan: plan },
      success_url: APP + '/?premium=merci',
      cancel_url: APP + '/?premium=annule',
      locale: 'fr',
      custom_text: { submit: { message: 'Renouvellement automatique. Tu peux arrêter ton abonnement à tout moment depuis Mon profil.' } }
    });
    return json(200, { url: s.url });
  }

  async function portal(req) {
    const u = await userOf(req);
    if (!u) return fail(401, 'Connecte-toi à ton compte Dropicards.');
    const cust = await rpc('premium_customer', { uid: u.id });
    if (!cust) return fail(404, 'Aucun abonnement Premium sur ce compte.');
    const s = await stripe('POST', '/billing_portal/sessions', { customer: cust, return_url: APP + '/?premium=retour', locale: 'fr' });
    return json(200, { url: s.url });
  }

  // Suppression du compte (2026-11-07, 011_suppression_compte.sql ; règle d'Apple 5.1.1(v), RGPD) : tout abonnement
  // Stripe du joueur encore en cours est arrêté tout de suite (plus aucun prélèvement), puis le compte est effacé par
  // account_delete (journaux gardés, anonymisés). Les factures déjà payées restent chez Stripe (comptabilité).
  async function deleteAccount(req) {
    const u = await userOf(req);
    if (!u) return fail(401, 'Connecte-toi à ton compte Dropicards pour le supprimer.');
    const cust = await rpc('premium_customer', { uid: u.id });
    if (cust) {
      const list = await stripe('GET', '/subscriptions', { customer: cust, status: 'all', limit: 20 });
      for (const sub of (list && list.data) || []) {
        if (['active', 'trialing', 'past_due', 'unpaid', 'incomplete', 'paused'].includes(sub.status)) {
          await stripe('DELETE', '/subscriptions/' + encodeURIComponent(sub.id), null, 'dropicards-delete-' + sub.id);
        }
      }
    }
    await rpc('account_delete', { uid: u.id });
    return json(200, { deleted: true });
  }

  // Abonnement relu chez Stripe (source de vérité, quel que soit l'ordre d'arrivée des messages), puis rangé.
  async function syncSubscription(subId, hintUid, live) {
    const sub = await stripe('GET', '/subscriptions/' + encodeURIComponent(subId));
    const item = sub.items && sub.items.data && sub.items.data[0];
    const r = await rpc('premium_apply', {
      uid: (sub.metadata && sub.metadata.user_id) || hintUid || null,
      cust: typeof sub.customer === 'string' ? sub.customer : sub.customer && sub.customer.id,
      sub: sub.id,
      plan_id: planOf(item && (item.price || item.plan)),
      sub_status: sub.status,
      ends_at: iso(periodEnd(sub)),
      cancel: !!(sub.cancel_at_period_end || sub.cancel_at),
      live: !!(live || sub.livemode)
    });
    return r && r.user_id || null;
  }
  const subOfInvoice = inv => inv.subscription || (inv.parent && inv.parent.subscription_details && inv.parent.subscription_details.subscription) || null;
  function invoicePlan(inv) {
    const l = inv.lines && inv.lines.data && inv.lines.data[0];
    if (!l) return null;
    const p = l.price || (l.pricing && l.pricing.price_details && { lookup_key: null, id: l.pricing.price_details.price, recurring: null }) || l.plan;
    const fromPrice = planOf(p);
    if (fromPrice) return fromPrice;
    const days = l.period && l.period.end && l.period.start ? (l.period.end - l.period.start) / 86400 : 0;
    return days > 300 ? 'year' : days > 20 ? 'month' : null;
  }

  async function webhook(req) {
    const raw = await req.text();
    const ok = await verifySignature(raw, req.headers.get('stripe-signature'), E('STRIPE_WEBHOOK_SECRET'));
    if (!ok) return fail(400, 'Signature invalide');
    let ev;
    try { ev = JSON.parse(raw); } catch (e) { return fail(400, 'Message illisible'); }
    const o = ev && ev.data && ev.data.object || {};
    let uid = null;
    switch (ev.type) {
      case 'checkout.session.completed':
        if (o.mode === 'subscription' && o.subscription) uid = await syncSubscription(typeof o.subscription === 'string' ? o.subscription : o.subscription.id, o.client_reference_id, ev.livemode);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        uid = await syncSubscription(o.id, null, ev.livemode);
        break;
      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const sid = subOfInvoice(o);
        if (sid) uid = await syncSubscription(typeof sid === 'string' ? sid : sid.id, null, ev.livemode);
        if (o.id && o.amount_paid > 0) {
          const r = await rpc('premium_payment', {
            invoice_id: o.id, cust: typeof o.customer === 'string' ? o.customer : o.customer && o.customer.id,
            amount: o.amount_paid, cur: o.currency || 'eur', plan_id: invoicePlan(o),
            paid: iso((o.status_transitions && o.status_transitions.paid_at) || o.created), live: !!ev.livemode
          });
          uid = uid || (r && r.user_id) || null;
        }
        break;
      }
      case 'invoice.payment_failed': {
        const sid = subOfInvoice(o);
        if (sid) uid = await syncSubscription(typeof sid === 'string' ? sid : sid.id, null, ev.livemode);
        break;
      }
      default:
        break;
    }
    if (ev.id) await rpc('premium_log_event', { ev_id: ev.id, ev_type: ev.type, uid: uid, live: !!ev.livemode });
    return json(200, { received: true });
  }

  return async function handle(req) {
    const path = new URL(req.url).pathname.replace(/\/+$/, '');
    const route = path.slice(path.lastIndexOf('/') + 1);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
    if (req.method !== 'POST') return fail(405, 'Méthode non permise');
    try {
      if (route === 'checkout') return await checkout(req);
      if (route === 'portal') return await portal(req);
      if (route === 'webhook') return await webhook(req);
      if (route === 'delete_account') return await deleteAccount(req);
      return fail(404, 'Chemin inconnu');
    } catch (e) {
      console.error(route, e && e.message);
      return fail(e && e.status || 500, e && e.status ? e.message : 'Erreur du serveur. Réessaie dans un instant.');
    }
  };
}

// Dans Supabase (Deno) : la fonction démarre. Sous Node (tests) : rien ne démarre, makeHandler est importé.
if (typeof Deno !== 'undefined') Deno.serve(makeHandler(k => Deno.env.get(k)));
