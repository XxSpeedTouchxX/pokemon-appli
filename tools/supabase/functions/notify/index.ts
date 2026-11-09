// Fonction « notify » du serveur Supabase de Dropicards (2026-11-07, demande du porteur ; guide docs/30).
// Elle tourne dans le service « Edge Functions » de Supabase (Coolify), à l'adresse
//   https://api.dropicards.fr/functions/v1/notify/shop
// POST /notify/shop (joueur connecté) : envoie à l'adresse de Dropicards un e-mail avec les achats du PK shop pas encore
// signalés (tickets Bronze, Argent, Or et achats directs), lus dans la base (012_shop_notices.sql) ; l'app l'appelle
// juste après chaque achat. Un achat n'est signalé qu'une fois ; un envoi raté repart au prochain appel. Elle ne fait
// confiance qu'à la base : l'app ne fait que la réveiller.
// Variables (Coolify, service des fonctions) — jamais dans le dépôt ni dans l'app :
//   BREVO_API_KEY   clé d'API Brevo (xkeysib-…), créée dans Brevo › SMTP et API › Clés API
//   NOTIFY_TO       adresse qui reçoit les achats (contact@dropicards.fr par défaut)
//   NOTIFY_FROM     expéditeur vérifié dans Brevo (noreply@dropicards.fr par défaut)
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY : déjà fournis par Supabase au service.
// Testée sous Node (tools/supabase/functions/notify/test.mjs) avec un faux Brevo et la base locale.

const BREVO = 'https://api.brevo.com/v3/smtp/email';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const fail = (status, msg) => json(status, { error: msg });
const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const when = iso => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }); } catch (e) { return String(iso); }
};
const NAMES = { 'ticket-bronze': 'Ticket Bronze', 'ticket-argent': 'Ticket Argent', 'ticket-or': 'Ticket Or', 'achat-booster': 'Booster de la série du moment', 'achat-rare': 'Item rare au choix', 'achat-etb-30': 'ETB 30 ans' };
const nameOf = p => NAMES[p.item] || p.label || p.item;

// Une ligne par achat : ce qu'il faut pour ajouter un ticket au tirage, ou préparer un envoi.
export function describe(p) {
  const who = (p.pseudo ? p.pseudo + ' · ' : '') + (p.email || 'adresse inconnue');
  const lines = p.kind === 'ticket' || /^ticket-/.test(p.item)
    ? [['Achat', nameOf(p) + ' (' + Number(p.cost_pk || 0).toLocaleString('fr-FR') + ' PK)'], ['Joueur', who], ['Tirage', when(p.draw_at)],
      ...(p.choice ? [['Carte choisie', String(p.choice)]] : []),
      ['Tickets de ce joueur pour ce tirage', String(p.count || 1)], ['Acheté le', when(p.bought_at)], ['Compte', p.user_id], ['Référence', p.id]]
    : [['Achat direct', nameOf(p) + (p.choice ? ' : ' + p.choice : '') + ' (' + Number(p.cost_pk || 0).toLocaleString('fr-FR') + ' PK)'], ['Joueur', who],
      ['À faire', 'écrire au joueur pour son adresse de livraison et vérifier son identité'], ['Acheté le', when(p.bought_at)], ['Compte', p.user_id], ['Référence', p.id]];
  return lines;
}
export function buildMail(list) {
  const first = list[0];
  const subject = list.length === 1
    ? '[Dropicards] ' + (/^ticket-/.test(first.item) ? 'Nouveau ' : 'Achat direct : ') + nameOf(first) + (first.choice ? ' (' + first.choice + ')' : '') + ' · ' + (first.pseudo || first.email || 'joueur')
    : '[Dropicards] ' + list.length + ' nouveaux achats au PK shop';
  const blocks = list.map(p => describe(p));
  const html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1120">'
    + '<p>' + (list.length === 1 ? 'Nouvel achat au PK shop :' : list.length + ' nouveaux achats au PK shop :') + '</p>'
    + blocks.map(b => '<table style="border-collapse:collapse;margin:0 0 16px;min-width:320px">' + b.map(([k, v]) =>
      '<tr><td style="padding:4px 12px 4px 0;color:#5A6B8C;vertical-align:top">' + esc(k) + '</td><td style="padding:4px 0;font-weight:bold">' + esc(v) + '</td></tr>').join('') + '</table>').join('')
    + '<p style="color:#5A6B8C;font-size:12px">E-mail automatique de l’app Dropicards. La liste complète d’un tirage reste disponible dans la base (fonction draw_entries).</p></div>';
  const text = blocks.map(b => b.map(([k, v]) => k + ' : ' + v).join('\n')).join('\n\n');
  return { subject, html, text };
}

export function makeHandler(env, fetchImpl = fetch) {
  const E = k => (env(k) || '').trim();
  const SB = E('SUPABASE_URL').replace(/\/+$/, '');
  async function rpc(name, args) {
    const k = E('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetchImpl(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const txt = await res.text();
    if (!res.ok) { console.error('rpc', name, res.status, txt); throw Object.assign(new Error('Base de données indisponible.'), { status: 500 }); }
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
  async function shop(req) {
    const u = await userOf(req);
    if (!u) return fail(401, 'Connecte-toi à ton compte Dropicards.');
    const key = E('BREVO_API_KEY');
    if (!key) return fail(503, 'L’envoi des e-mails n’est pas encore configuré sur le serveur.');
    const list = await rpc('shop_pending', { lim: 20 }) || [];
    if (!list.length) return json(200, { sent: 0 });
    const m = buildMail(list);
    const res = await fetchImpl(BREVO, { method: 'POST', headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({
      sender: { name: 'Dropicards', email: E('NOTIFY_FROM') || 'noreply@dropicards.fr' },
      to: [{ email: E('NOTIFY_TO') || 'contact@dropicards.fr' }],
      subject: m.subject, htmlContent: m.html, textContent: m.text, tags: ['pk-shop']
    }) });
    if (!res.ok) {
      console.error('Brevo', res.status, await res.text().catch(() => ''));
      return fail(502, 'E-mail non envoyé : il repartira au prochain achat.');
    }
    const n = await rpc('shop_mark_sent', { ids: list.map(p => p.id) });
    return json(200, { sent: list.length, marked: n });
  }
  return async req => {
    try {
      const path = new URL(req.url).pathname.replace(/\/+$/, '');
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
      if (req.method === 'POST' && /\/notify\/shop$/.test(path)) return await shop(req);
      return fail(404, 'Chemin inconnu');
    } catch (e) {
      return fail(e && e.status ? e.status : 500, (e && e.message) || 'Erreur du serveur.');
    }
  };
}

if (typeof Deno !== 'undefined') Deno.serve(makeHandler(k => Deno.env.get(k)));
