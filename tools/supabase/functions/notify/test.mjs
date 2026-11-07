// Tests de la fonction « notify » (index.ts) sous Node, sans réseau : un faux Brevo en mémoire, et la vraie base de
// test locale (PostgreSQL avec 001 à 012, voir tools/supabase/README.md). Jamais sur le vrai serveur ni le vrai Brevo.
//   node tools/supabase/functions/notify/test.mjs        (PGPORT=5499, PGDB=t7 par défaut)
import { execFileSync } from 'node:child_process';
import { makeHandler, buildMail } from './index.ts';

const PORT = process.env.PGPORT || '5499', DB = process.env.PGDB || 't7';
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l);
const sql = (q, role) => execFileSync('runuser', ['-u', 'postgres', '--', 'psql', '-h', '/tmp', '-p', PORT, '-d', DB, '-tAq', '-v', 'ON_ERROR_STOP=1',
  '-c', (role ? 'set role ' + role + '; ' : '') + q], { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
const lit = v => v === null || v === undefined ? 'null' : typeof v === 'boolean' || typeof v === 'number' ? String(v) : Array.isArray(v) ? "array[" + v.map(x => "'" + x + "'").join(',') + "]::uuid[]" : "'" + String(v).replace(/'/g, "''") + "'";
const out = t => t === '' ? null : /^[{[]/.test(t) ? JSON.parse(t) : /^\d+$/.test(t) ? Number(t) : t;

// Rien en attente au départ (achats des tests précédents déjà signalés).
sql("select public.shop_mark_sent((select array_agg((e->>'id')::uuid) from jsonb_array_elements(public.shop_pending(50)) e))", 'service_role');
const email = 'notify-' + process.pid + '@test.fr';
const UID = sql("insert into auth.users (email, email_confirmed_at) values (" + lit(email) + ", now() - interval '8 days') returning id");
sql("update public.profiles set pseudo = 'Ondine' where id = " + lit(UID));
const tokens = { 'tok-ok': { id: UID, email: email } };

const B = { mails: [], down: false };
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
async function fakeFetch(url, init = {}) {
  const u = new URL(url), h = init.headers || {};
  if (u.hostname === 'api.brevo.com') {
    if (h['api-key'] !== 'xkeysib-faux') return reply(401, { message: 'Key not found' });
    if (B.down) return reply(500, { message: 'down' });
    B.mails.push(JSON.parse(init.body)); return reply(201, { messageId: '<m' + B.mails.length + '>' });
  }
  if (u.pathname === '/auth/v1/user') { const t = String(h.Authorization || '').replace(/^Bearer /, ''); return tokens[t] ? reply(200, tokens[t]) : reply(401, { msg: 'bad jwt' }); }
  if (h.Authorization !== 'Bearer service-key') return reply(401, { msg: 'not service' });
  const rpc = u.pathname.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  if (rpc) {
    const a = JSON.parse(init.body || '{}');
    try { return new Response(JSON.stringify(out(sql('select public.' + rpc[1] + '(' + Object.keys(a).map(k => k + ' => ' + lit(a[k])).join(', ') + ')::text', 'service_role')))); }
    catch (e) { return reply(400, { message: String(e.stderr || e.message) }); }
  }
  return reply(404, {});
}
const env = { BREVO_API_KEY: 'xkeysib-faux', SUPABASE_URL: 'http://kong:8000', SUPABASE_ANON_KEY: 'anon-key', SUPABASE_SERVICE_ROLE_KEY: 'service-key' };
const handle = makeHandler(k => env[k], fakeFetch);
const call = (tok) => handle(new Request('http://x/notify/shop', { method: 'POST', headers: tok ? { Authorization: 'Bearer ' + tok } : {}, body: '{}' }));

let r = await call(null);
ok('sans connexion : refusé (401)', r.status === 401);
r = await call('tok-ok'); let j = await r.json();
ok('rien à signaler : aucun e-mail', r.status === 200 && j.sent === 0 && B.mails.length === 0);
// Achat d'un ticket Bronze puis d'un ETB (comme buy_item).
sql("insert into public.tickets (user_id, item, cost_pk, draw_at) values (" + lit(UID) + ", 'ticket-bronze', 500, public._game_next_draw('2w', now()))");
r = await call('tok-ok'); j = await r.json();
const m1 = B.mails[0] || {};
ok('ticket Bronze : un e-mail envoyé à contact@dropicards.fr', r.status === 200 && j.sent === 1 && m1.to && m1.to[0].email === 'contact@dropicards.fr' && m1.sender.email === 'noreply@dropicards.fr');
ok('objet : « [Dropicards] Nouveau Ticket Bronze · Ondine »', m1.subject === '[Dropicards] Nouveau Ticket Bronze · Ondine');
ok('contenu : joueur, e-mail, tirage, nombre de tickets', /Ondine · notify-/.test(m1.textContent) && /Tirage : dimanche/.test(m1.textContent) && /Tickets de ce joueur pour ce tirage : 1/.test(m1.textContent));
r = await call('tok-ok'); j = await r.json();
ok('le même achat ne repart pas', j.sent === 0 && B.mails.length === 1);
sql("insert into public.tickets (user_id, item, cost_pk, choice) values (" + lit(UID) + ", 'achat-etb-30', 50000, null)");
B.down = true;
r = await call('tok-ok');
ok('Brevo en panne : erreur 502, achat gardé', r.status === 502 && sql("select jsonb_array_length(public.shop_pending(50))", 'service_role') === '1');
B.down = false;
r = await call('tok-ok'); j = await r.json();
const m2 = B.mails[1] || {};
ok('au prochain appel : l’achat direct part (« Achat direct : ETB 30 ans »)', j.sent === 1 && /^\[Dropicards\] Achat direct : ETB 30 ans · Ondine$/.test(m2.subject || '') && /adresse de livraison/.test(m2.textContent || ''));
delete env.BREVO_API_KEY;
r = await call('tok-ok');
ok('clé Brevo absente : 503, rien perdu', r.status === 503);
env.BREVO_API_KEY = 'xkeysib-faux';
ok('plusieurs achats : un seul e-mail récapitulatif', buildMail([{ item: 'ticket-or', cost_pk: 5000, pseudo: 'A', id: '1' }, { item: 'achat-booster', cost_pk: 7500, pseudo: 'B', id: '2' }]).subject === '[Dropicards] 2 nouveaux achats au PK shop');
ok('caractères spéciaux échappés dans l’e-mail', /&lt;b&gt;/.test(buildMail([{ item: 'ticket-or', pseudo: '<b>', id: '1' }]).html));
r = await handle(new Request('http://x/notify/autre', { method: 'POST' }));
ok('chemin inconnu : 404', r.status === 404);
console.log(res.join('\n'));
if (res.some(x => x.startsWith('✗'))) process.exit(1);
