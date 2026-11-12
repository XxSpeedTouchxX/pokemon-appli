// Tests de la fonction « stripe » (index.ts) sous Node, sans réseau : un faux Stripe en mémoire, et la vraie base de
// test locale (PostgreSQL avec 001 à 010, voir tools/supabase/README.md). Jamais sur le vrai serveur ni le vrai Stripe.
//   node tools/supabase/functions/stripe/test.mjs        (PGPORT=5499, PGDB=t7 par défaut)
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { makeHandler, verifySignature } from './index.ts';

const R = String(process.pid) + 'r' + Math.floor(Math.random() * 1e6); // identifiants Stripe uniques à chaque passage
const SUB = 'sub_F' + R, INV = 'in_F' + R;
const PORT = process.env.PGPORT || '5499', DB = process.env.PGDB || 't7';
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l);
const sql = (q, role) => execFileSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', '/tmp', '-p', PORT, '-d', DB, '-tAq', '-v', 'ON_ERROR_STOP=1',
  '-c', (role ? 'set role ' + role + '; ' : '') + q], { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const lit = v => v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
const out = t => t === '' ? null : t === 't' ? true : t === 'f' ? false : /^[{[]/.test(t) ? JSON.parse(t) : t;

// Compte de test neuf à chaque passage (gardé ensuite : le journal ne s’efface pas).
const email = 'stripe-' + process.pid + '-' + Math.floor(Math.random() * 1e6) + '@test.fr';
const UID = sql("insert into auth.users (email, email_confirmed_at) values (" + lit(email) + ", now() - interval '8 days') returning id");
const tokens = { 'tok-ok': { id: UID, email: email } };

// ——— Faux Stripe ———
const KEY = 'sk_test_faux', WH = 'whsec_faux_secret';
const S = { n: 0, customers: {}, idem: {}, sessions: [], portal: 0, subs: {}, calls: [] };
const prices = [{ id: 'price_M', lookup_key: 'dropicards_premium_month', recurring: { interval: 'month' } }, { id: 'price_Y', lookup_key: 'dropicards_premium_year', recurring: { interval: 'year' } },
  { id: 'price_Q', lookup_key: 'dropicards_premium_quarter', recurring: { interval: 'month', interval_count: 3 } }, { id: 'price_S', lookup_key: 'dropicards_premium_semester', recurring: { interval: 'month', interval_count: 6 } }];
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
async function fakeFetch(url, init = {}) {
  const u = new URL(url), h = init.headers || {};
  if (u.hostname === 'api.stripe.com') {
    if (h.Authorization !== 'Bearer ' + KEY) return reply(401, { error: { message: 'bad key' } });
    const p = new URLSearchParams(init.body || u.search.slice(1));
    S.calls.push({ method: init.method, path: u.pathname, p });
    if (u.pathname === '/v1/prices') { const k = p.get('lookup_keys[0]'); return reply(200, { data: prices.filter(x => x.lookup_key === k) }); }
    if (u.pathname === '/v1/customers') {
      if (h['Idempotency-Key'] && S.idem[h['Idempotency-Key']]) return reply(200, S.idem[h['Idempotency-Key']]);
      const c = { id: 'cus_F' + R + 'n' + (++S.n), email: p.get('email'), metadata: { user_id: p.get('metadata[user_id]') } };
      S.customers[c.id] = c; if (h['Idempotency-Key']) S.idem[h['Idempotency-Key']] = c; return reply(200, c);
    }
    if (u.pathname === '/v1/checkout/sessions') { S.sessions.push(p); return reply(200, { id: 'cs_F' + S.sessions.length, url: 'https://checkout.stripe.com/c/pay/cs_F' + S.sessions.length }); }
    if (u.pathname === '/v1/billing_portal/sessions') { S.portal++; return reply(200, { url: 'https://billing.stripe.com/p/session/F' + S.portal, customer: p.get('customer') }); }
    const m = u.pathname.match(/^\/v1\/subscriptions\/(sub_\w+)$/);
    if (m && S.subs[m[1]]) return reply(200, S.subs[m[1]]);
    return reply(404, { error: { message: 'inconnu ' + u.pathname } });
  }
  if (u.pathname === '/auth/v1/user') { const t = String(h.Authorization || '').replace(/^Bearer /, ''); return tokens[t] ? reply(200, tokens[t]) : reply(401, { msg: 'bad jwt' }); }
  if (h.Authorization !== 'Bearer service-key') return reply(401, { msg: 'not service' });
  const rpc = u.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  if (rpc) {
    const a = JSON.parse(init.body || '{}');
    try { return new Response(JSON.stringify(out(sql('select public.' + rpc[1] + '(' + Object.keys(a).map(k => k + ' => ' + lit(a[k])).join(', ') + ')::text', 'service_role')))); }
    catch (e) { return reply(400, { message: String(e.stderr || e.message) }); }
  }
  if (u.pathname === '/rest/v1/profiles') {
    const id = u.searchParams.get('id').replace(/^eq\./, '');
    return new Response(sql("select coalesce(json_agg(json_build_object('role', role, 'status', status)), '[]') from public.profiles where id = " + lit(id))); // service_role lit tout dans Supabase ; ici, sans rôle
  }
  if (u.pathname === '/rest/v1/premium') {
    const id = u.searchParams.get('user_id').replace(/^eq\./, '');
    return new Response(sql("select coalesce(json_agg(json_build_object('status', status, 'period_end', period_end)), '[]') from public.premium where user_id = " + lit(id), 'service_role'));
  }
  return reply(404, {});
}
const env = { STRIPE_SECRET_KEY: KEY, STRIPE_WEBHOOK_SECRET: WH, SUPABASE_URL: 'http://kong:8000', SUPABASE_ANON_KEY: 'anon-key', SUPABASE_SERVICE_ROLE_KEY: 'service-key', APP_URL: 'https://dropicards.fr', PREMIUM_OPEN: '' };
const handle = makeHandler(k => env[k], fakeFetch);
const call = async (route, body, token) => {
  const r = await handle(new Request('http://edge/stripe/' + route, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: JSON.stringify(body || {}) }));
  return { status: r.status, j: await r.json() };
};
const sign = (raw, t = Math.floor(Date.now() / 1000), secret = WH) => 't=' + t + ',v1=' + createHmac('sha256', secret).update(t + '.' + raw).digest('hex');
const hook = async (ev, sig) => {
  const raw = JSON.stringify(ev);
  const r = await handle(new Request('http://edge/stripe/webhook', { method: 'POST', headers: { 'Stripe-Signature': sig === undefined ? sign(raw) : sig, 'Content-Type': 'application/json' }, body: raw }));
  return r.status;
};
const row = () => out(sql("select coalesce(row_to_json(p)::text, '') from public.premium p where user_id = " + lit(UID)));
const end = Math.floor(Date.now() / 1000) + 365 * 86400;

// 1. Signature.
const raw0 = '{"id":"evt_x"}';
ok('signature de Stripe correcte : acceptée', await verifySignature(raw0, sign(raw0), WH));
ok('signature avec un autre secret : refusée', !(await verifySignature(raw0, sign(raw0, undefined, 'whsec_autre'), WH)));
ok('message modifié après signature : refusé', !(await verifySignature(raw0 + ' ', sign(raw0), WH)));
ok('message de plus de 5 minutes : refusé (rejeu)', !(await verifySignature(raw0, sign(raw0, Math.floor(Date.now() / 1000) - 600), WH)));

// 2. Page de paiement.
ok('sans être connecté : refusé (401)', (await call('checkout', { plan: 'year' })).status === 401);
ok('faux jeton : refusé (401)', (await call('checkout', { plan: 'year' }, 'tok-faux')).status === 401);
// Achats réservés aux admins (2026-11-12, porteur) tant que PREMIUM_OPEN n'est pas « true ».
const c0 = await call('checkout', { plan: 'year' }, 'tok-ok');
ok('compte joueur, Premium pas encore ouvert : refusé (403, « pas encore ouvert »)', c0.status === 403 && /pas encore ouvert/.test(c0.j.error || ''));
ok('aucune page de paiement créée pour un joueur', !S.sessions.length);
sql("update public.profiles set role = 'admin' where id = " + lit(UID));
const cA = await call('checkout', { plan: 'year' }, 'tok-ok');
ok('compte admin : page de paiement (200)', cA.status === 200 && /^https:\/\/checkout\.stripe\.com\//.test(cA.j.url));
sql("update public.profiles set role = 'user' where id = " + lit(UID));
S.sessions.length = 0;
env.PREMIUM_OPEN = 'true'; // ouvert à tous : la suite des essais
ok('formule inconnue : refusée (400)', (await call('checkout', { plan: 'vie' }, 'tok-ok')).status === 400);
const c1 = await call('checkout', { plan: 'year' }, 'tok-ok');
const s1 = S.sessions[0];
ok('formule annuelle : page de paiement Stripe (' + c1.status + ')', c1.status === 200 && /^https:\/\/checkout\.stripe\.com\//.test(c1.j.url));
ok('paiement : abonnement, prix annuel trouvé par sa clé de recherche, quantité 1', s1 && s1.get('mode') === 'subscription' && s1.get('line_items[0][price]') === 'price_Y' && s1.get('line_items[0][quantity]') === '1');
ok('paiement : compte Dropicards attaché (client_reference_id et abonnement)', s1.get('client_reference_id') === UID && s1.get('subscription_data[metadata][user_id]') === UID);
ok('paiement : retour sur dropicards.fr, page en français', s1.get('success_url') === 'https://dropicards.fr/?premium=merci' && s1.get('cancel_url') === 'https://dropicards.fr/?premium=annule' && s1.get('locale') === 'fr');
const cust = out(sql('select stripe_customer from public.premium where user_id = ' + lit(UID)));
ok('client Stripe créé avec l\'e-mail et rangé dans la base (' + cust + ')', /^cus_F/.test(cust) && S.customers[cust].email === email && s1.get('customer') === cust);
await call('checkout', { plan: 'month' }, 'tok-ok');
ok('deuxième essai (mensuel) : même client Stripe, prix mensuel', Object.keys(S.customers).length === 1 && S.sessions[1].get('customer') === cust && S.sessions[1].get('line_items[0][price]') === 'price_M');
await call('checkout', { plan: 'quarter' }, 'tok-ok');
await call('checkout', { plan: 'semester' }, 'tok-ok');
ok('formules trimestrielle et semestrielle (2026-11-10) : prix trouvés par leur clé de recherche', S.sessions[2].get('line_items[0][price]') === 'price_Q' && S.sessions[3].get('line_items[0][price]') === 'price_S');
ok('pas encore payé : pas Premium', !row().status || row().status === 'none');

// 3. Messages de Stripe.
S.subs[SUB] = { id: SUB, customer: cust, status: 'active', livemode: false, cancel_at_period_end: false, metadata: { user_id: UID }, items: { data: [{ current_period_end: end, price: prices[1] }] } };
ok('message sans signature : refusé (400)', (await hook({ id: 'evt_' + R + '0', type: 'checkout.session.completed', data: { object: {} } }, '')) === 400);
ok('message avec une fausse signature : refusé (400)', (await hook({ id: 'evt_' + R + '0', type: 'checkout.session.completed', data: { object: {} } }, 't=1,v1=00')) === 400);
ok('paiement terminé (checkout.session.completed) : reçu (200)', (await hook({ id: 'evt_' + R + '1', type: 'checkout.session.completed', livemode: false, data: { object: { mode: 'subscription', subscription: SUB, client_reference_id: UID, customer: cust } } })) === 200);
let r = row();
ok('abonné Premium annuel dans la base, jusqu\'à la fin de la période payée', r.status === 'active' && r.plan === 'year' && r.stripe_subscription === SUB && Math.abs(new Date(r.period_end).getTime() / 1000 - end) < 2);
ok('jeu : le compte est Premium (PA doublés)', out(sql("select (public.game_state()->'premium'->>'on') from (select set_config('request.jwt.claim.sub', " + lit(UID) + ", false)) x", 'authenticated')) === 'true');
const inv = { id: 'evt_' + R + '2', type: 'invoice.paid', livemode: false, data: { object: { id: INV, customer: cust, amount_paid: 4990, currency: 'eur', created: Math.floor(Date.now() / 1000), status_transitions: { paid_at: Math.floor(Date.now() / 1000) }, parent: { subscription_details: { subscription: SUB } }, lines: { data: [{ pricing: { price_details: { price: 'price_Y' } }, period: { start: end - 365 * 86400, end: end } }] } } } };
ok('facture payée (invoice.paid, format récent de Stripe) : reçue (200)', (await hook(inv)) === 200);
const pay = out(sql("select row_to_json(p)::text from public.premium_payments p where invoice = " + lit(INV)));
ok('paiement de 49,90 € rangé avec le bon compte et la formule annuelle', pay && pay.user_id === UID && pay.amount_cents === 4990 && pay.currency === 'eur' && pay.plan === 'year');
ok('même message reçu deux fois : 200, un seul paiement', (await hook(inv)) === 200 && out(sql("select count(*)::text from public.premium_payments where invoice = " + lit(INV))) === '1' && out(sql("select count(*)::text from public.stripe_events where id = " + lit('evt_' + R + '2'))) === '1');
ok('déjà Premium : nouvelle page de paiement refusée (409)', (await call('checkout', { plan: 'year' }, 'tok-ok')).status === 409);

// 4. Gérer ou arrêter.
const p1 = await call('portal', {}, 'tok-ok');
ok('Gérer mon abonnement : page Stripe du client (' + p1.status + ')', p1.status === 200 && /^https:\/\/billing\.stripe\.com\//.test(p1.j.url) && S.calls.at(-1).p.get('customer') === cust && S.calls.at(-1).p.get('return_url') === 'https://dropicards.fr/?premium=retour');
ok('Gérer sans être connecté : refusé (401)', (await call('portal', {})).status === 401);
S.subs[SUB].cancel_at_period_end = true;
await hook({ id: 'evt_' + R + '3', type: 'customer.subscription.updated', data: { object: { id: SUB } } });
r = row();
ok('arrêt demandé : noté, Premium gardé jusqu\'à la fin de la période', r.cancel_at_period_end === true && r.status === 'active');
S.subs[SUB].status = 'canceled';
await hook({ id: 'evt_' + R + '4', type: 'customer.subscription.deleted', data: { object: { id: SUB } } });
ok('abonnement terminé : plus Premium', row().status === 'canceled' && out(sql("select (public.game_state()->'premium'->>'on') from (select set_config('request.jwt.claim.sub', " + lit(UID) + ", false)) x", 'authenticated')) === 'false');
ok('message inconnu : accepté sans rien changer (200)', (await hook({ id: 'evt_' + R + '5', type: 'charge.refunded', data: { object: {} } })) === 200 && row().status === 'canceled');
const noKey = makeHandler(k => (k === 'STRIPE_SECRET_KEY' ? '' : env[k]), fakeFetch);
const nk = await noKey(new Request('http://edge/stripe/checkout', { method: 'POST', headers: { Authorization: 'Bearer tok-ok' }, body: '{"plan":"year"}' }));
ok('clé Stripe absente sur le serveur : « pas encore configuré » (503)', nk.status === 503 && /pas encore configuré/.test((await nk.json()).error));
ok('aucune clé secrète dans les réponses ni dans les appels à la base', !JSON.stringify(res).includes(KEY));

console.log(res.join('\n'));
const bad = res.filter(x => x.startsWith('✗')).length;
console.log('stripe : ' + (res.length - bad) + ' ✓, ' + bad + ' ✗');
process.exit(bad ? 1 : 0);
