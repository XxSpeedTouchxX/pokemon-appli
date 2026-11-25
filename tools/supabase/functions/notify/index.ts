// Fonction « notify » du serveur Supabase de Dropicards (2026-11-07, demande du porteur ; guide docs/30).
// Elle tourne dans le service « Edge Functions » de Supabase (Coolify), à l'adresse
//   https://api.dropicards.fr/functions/v1/notify/shop
// POST /notify/shop (joueur connecté) : envoie à l'adresse de Dropicards un e-mail avec les achats du PK shop pas encore
// signalés (tickets Bronze, Argent, Or et achats directs), lus dans la base (012_shop_notices.sql) ; l'app l'appelle
// juste après chaque achat. Un achat n'est signalé qu'une fois ; un envoi raté repart au prochain appel. Elle ne fait
// confiance qu'à la base : l'app ne fait que la réveiller.
// Depuis le 2026-11-25 (porteur) : chaque ACHAT DIRECT (booster, item rare, ETB) vaut aussi au JOUEUR un e-mail de
// félicitations, à l'adresse de son compte : le lot avec son visuel, et une fiche à renvoyer à Dropicards (nom, prénom,
// adresse, code postal, ville, adresse e-mail, téléphone) ; « Répondre » écrit à NOTIFY_TO. Liste lue dans la base
// (043_mail_joueur_lot.sql) : un e-mail par achat, jamais pour un ticket ; sans 043, seul l'e-mail à Dropicards part.
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
      ['À faire', 'recevoir son adresse de livraison (le joueur reçoit un e-mail de félicitations avec une fiche à renvoyer ici, référence ' + refOf(p) + ') et vérifier son identité'],
      ['Acheté le', when(p.bought_at)], ['Compte', p.user_id], ['Référence', p.id]];
  return lines;
}

// ——— E-mail de félicitations au joueur (043, 2026-11-25) ———
const SITE = 'https://dropicards.fr';
// Lots tels que le joueur les voit. À changer avec la série du moment, comme l'app (SHOP_BOOSTER_SERIES et SHOP_SERIES
// dans tools/web/pkshop.js). Visuels en PNG (lus par tous les logiciels d'e-mail), publiés sur dropicards.fr/email/lots/.
const LOTS = {
  'achat-booster': { name: 'Booster Pokémon Règne Delta', short: 'ton booster Règne Delta', line: 'Booster de la série du moment, avec Méga-Rayquaza', img: 'booster-regne-delta.png', w: 88, h: 160 },
  'achat-rare': { name: 'Item rare au choix', short: 'ton item rare', line: 'De la série 30ᵉ anniversaire', img: 'item-rare-30-ans.png', w: 240, h: 135 },
  'achat-etb-30': { name: 'ETB 30ᵉ anniversaire', short: 'ton ETB 30 ans', line: 'Coffret Dresseur d’élite 30ᵉ anniversaire', img: 'etb-30-ans.png', w: 240, h: 135 }
};
// Référence courte, la même dans l'e-mail du joueur et dans celui de Dropicards (DC- et les 8 premiers caractères).
export const refOf = p => 'DC-' + String(p.id || '').replace(/-/g, '').slice(0, 8).toUpperCase();
const FIELDS = ['Nom', 'Prénom', 'Adresse', 'Code postal', 'Ville', 'Adresse e-mail', 'Numéro de téléphone'];
const pk = n => Number(n || 0).toLocaleString('fr-FR').replace(/\s/g, '\u00a0');

export function buildPlayerMail(p, contact = 'contact@dropicards.fr') {
  const lot = LOTS[p.item] || { name: p.label || 'Ton lot', short: 'ton lot', line: '' };
  const who = p.pseudo || 'dresseur', ref = refOf(p), cost = Number(p.cost_pk) > 0 ? p.cost_pk : p.price_pk;
  const subject = 'Félicitations ' + who + ' ! ' + lot.short.charAt(0).toUpperCase() + lot.short.slice(1) + ' t’attend 🎉';
  const mailBody = 'Bonjour Dropicards,\r\n\r\nVoici mes coordonnées pour recevoir mon lot : ' + lot.name + (p.choice ? ' (' + p.choice + ')' : '') + ', référence ' + ref + '.\r\n\r\n'
    + FIELDS.map(f => f + ' : ').join('\r\n') + '\r\n\r\nMerci et à bientôt !\r\n' + (p.pseudo || '');
  const mailto = 'mailto:' + contact + '?subject=' + encodeURIComponent('Mes coordonnées pour mon lot ' + ref) + '&body=' + encodeURIComponent(mailBody);
  const F = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const P = (t, s = '') => '<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3A4560;' + s + '">' + t + '</p>';
  const step = (n, t) => '<tr><td width="38" valign="top" style="padding:0 10px 12px 0;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:14px;background:#FFD60A;border:2px solid #0B1120;text-align:center;font-size:14px;font-weight:800;color:#0B1120;">' + n + '</span></td>'
    + '<td valign="top" style="padding:4px 0 12px;font-size:15px;line-height:1.45;color:#0B1120;">' + t + '</td></tr>';
  const field = f => '<tr><td width="42%" style="padding:9px 8px 9px 0;font-size:14px;font-weight:700;color:#0B1120;white-space:nowrap;">' + esc(f) + '&nbsp;:</td>'
    + '<td style="padding:9px 0;border-bottom:1.5px dashed #C9BE96;">&nbsp;</td></tr>';
  const html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(subject) + '</title></head>'
    + '<body style="margin:0;padding:0;background:#F4F1E6;">'
    + '<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F4F1E6;">Envoie-nous ton adresse en répondant à cet e-mail : on s’occupe du reste et ton lot part chez toi.</span>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1E6;"><tr><td align="center" style="padding:24px 12px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid #E6DFC8;">'
    + '<tr><td align="center" style="background:#FFD60A;padding:22px 16px;"><img src="' + SITE + '/img/brand/dropicards-header.png" width="240" alt="Dropicards" style="display:block;width:240px;max-width:80%;height:auto;border:0;"></td></tr>'
    + '<tr><td style="padding:28px 26px 6px;font-family:' + F + ';color:#0B1120;">'
    + '<h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;">Félicitations ' + esc(who) + '&nbsp;! 🎉</h1>'
    + P('Grâce à tes PK, tu viens d’obtenir ce lot au <b>PK shop</b> de Dropicards. Bravo, c’est bien mérité&nbsp;!')
    // Le lot, mis en avant.
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;background:#FFF7D1;border:2px solid #FFD60A;border-radius:16px;"><tr><td align="center" style="padding:20px 16px 18px;font-family:' + F + ';">'
    + (lot.img ? '<img src="' + SITE + '/email/lots/' + lot.img + '" width="' + lot.w + '" height="' + lot.h + '" alt="' + esc(lot.name) + '" style="display:block;margin:0 auto 14px;width:' + lot.w + 'px;height:' + lot.h + 'px;border:0;">' : '')
    + '<div style="font-size:19px;font-weight:800;line-height:1.3;color:#0B1120;">' + esc(lot.name) + '</div>'
    + (lot.line ? '<div style="margin-top:4px;font-size:14px;color:#5A6B8C;">' + esc(lot.line) + '</div>' : '')
    + (p.choice ? '<div style="margin-top:8px;font-size:15px;color:#0B1120;">Ton choix&nbsp;: <b>' + esc(p.choice) + '</b></div>' : '')
    + '<div style="margin-top:12px;"><span style="display:inline-block;padding:6px 14px;background:#0B1120;color:#FFD84D;border-radius:999px;font-size:14px;font-weight:800;">Obtenu avec ' + esc(pk(cost)) + ' PK</span></div>'
    + '<div style="margin-top:10px;font-size:13px;line-height:1.5;color:#5A6B8C;">' + esc(when(p.bought_at)) + '<br>Référence&nbsp;: <b style="color:#0B1120;">' + ref + '</b></div>'
    + '</td></tr></table>'
    // Ce qu'il reste à faire.
    + '<h2 style="margin:0 0 10px;font-size:19px;line-height:1.3;">Plus qu’une étape pour le recevoir 📦</h2>'
    + P('Pour qu’on puisse te l’envoyer chez toi, il nous manque juste tes coordonnées. C’est rapide&nbsp;:')
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;font-family:' + F + ';">'
    + step(1, 'Touche le bouton <b>« Envoyer mes coordonnées »</b> ou <b>réponds simplement à cet e-mail</b>.')
    + step(2, 'Complète la fiche ci-dessous avec tes coordonnées.')
    + step(3, 'Envoie-la à <b>' + esc(contact) + '</b>&nbsp;: on prépare ton colis et on te prévient dès qu’il part.')
    + '</table>'
    // La fiche à remplir.
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:2px dashed #0B1120;border-radius:14px;"><tr><td style="padding:16px 18px 10px;font-family:' + F + ';">'
    + '<div style="margin:0 0 6px;font-size:16px;font-weight:800;color:#0B1120;">📝 Mes coordonnées pour recevoir mon lot</div>'
    + '<div style="margin:0 0 6px;font-size:13px;color:#5A6B8C;">Lot&nbsp;: ' + esc(lot.name) + (p.choice ? ' (' + esc(p.choice) + ')' : '') + ' · Référence&nbsp;: ' + ref + '</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + FIELDS.map(field).join('') + '</table>'
    + '</td></tr></table>'
    + '<p style="margin:0 0 10px;text-align:center;"><a href="' + esc(mailto) + '" style="display:inline-block;padding:14px 24px;background:#FFD60A;color:#0B1120;border:2px solid #0B1120;border-radius:12px;font-size:16px;font-weight:800;text-decoration:none;">Envoyer mes coordonnées ✉️</a></p>'
    + '<p style="margin:0 0 22px;text-align:center;font-size:13px;line-height:1.5;color:#6B7590;">Le bouton ne s’ouvre pas&nbsp;? Réponds à cet e-mail, ou écris à <a href="mailto:' + esc(contact) + '" style="color:#0B1120;font-weight:700;">' + esc(contact) + '</a> en recopiant la fiche.</p>'
    // Rassurer.
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#EEF4FF;border-radius:12px;"><tr><td style="padding:12px 14px;font-family:' + F + ';font-size:13px;line-height:1.5;color:#3A4560;">'
    + '🔒 Tes coordonnées servent uniquement à t’envoyer ton lot. Dropicards ne te demandera jamais ton mot de passe ni tes coordonnées bancaires.</td></tr></table>'
    + P('À très vite sur Dropicards,<br><b style="color:#0B1120;">L’équipe Dropicards</b>', 'margin-bottom:6px;')
    + '</td></tr>'
    + '<tr><td style="padding:12px 26px 26px;font-family:' + F + ';font-size:12px;line-height:1.5;color:#6B7590;">'
    + 'Tu reçois cet e-mail parce que tu as obtenu un lot au PK shop avec ton compte Dropicards (' + esc(p.email || '') + ').<br>'
    + 'Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.'
    + '</td></tr></table></td></tr></table></body></html>';
  const text = 'Félicitations ' + who + ' ! 🎉\n\n'
    + 'Grâce à tes PK, tu viens d’obtenir ce lot au PK shop de Dropicards. Bravo, c’est bien mérité !\n\n'
    + 'Ton lot : ' + lot.name + (p.choice ? ' (' + p.choice + ')' : '') + '\n' + (lot.line ? lot.line + '\n' : '')
    + 'Obtenu avec ' + pk(cost) + ' PK, ' + when(p.bought_at) + '\nRéférence : ' + ref + '\n\n'
    + 'Plus qu’une étape pour le recevoir :\n'
    + '1. Réponds à cet e-mail (ou écris à ' + contact + ').\n2. Complète la fiche ci-dessous avec tes coordonnées.\n'
    + '3. Envoie-la : on prépare ton colis et on te prévient dès qu’il part.\n\n'
    + 'Mes coordonnées pour recevoir mon lot (référence ' + ref + ')\n' + FIELDS.map(f => f + ' : ').join('\n') + '\n\n'
    + 'Tes coordonnées servent uniquement à t’envoyer ton lot. Dropicards ne te demandera jamais ton mot de passe ni tes coordonnées bancaires.\n\n'
    + 'À très vite sur Dropicards,\nL’équipe Dropicards\n\n'
    + 'Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.';
  return { subject, html, text };
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
  // optional : une fonction absente de la base (script pas encore installé, réponse 404) renvoie null au lieu d'une erreur.
  async function rpc(name, args, optional = false) {
    const k = E('SUPABASE_SERVICE_ROLE_KEY');
    const res = await fetchImpl(SB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: k, Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
    const txt = await res.text();
    if (optional && res.status === 404) { console.error('rpc', name, 'absente : installe 043_mail_joueur_lot.sql'); return null; }
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
    const contact = E('NOTIFY_TO') || 'contact@dropicards.fr', sender = { name: 'Dropicards', email: E('NOTIFY_FROM') || 'noreply@dropicards.fr' };
    const brevo = async body => {
      const res = await fetchImpl(BREVO, { method: 'POST', headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) console.error('Brevo', res.status, await res.text().catch(() => ''));
      return res.ok;
    };
    let failed = false, n = 0, players = 0;
    // 1. E-mail à Dropicards : tous les achats pas encore signalés (012).
    const list = await rpc('shop_pending', { lim: 20 }) || [];
    if (list.length) {
      const m = buildMail(list);
      if (await brevo({ sender, to: [{ email: contact }], subject: m.subject, htmlContent: m.html, textContent: m.text, tags: ['pk-shop'] }))
        n = await rpc('shop_mark_sent', { ids: list.map(p => p.id) });
      else failed = true;
    }
    // 2. E-mail de félicitations à chaque joueur qui vient de faire un achat direct (043) ; « Répondre » écrit à Dropicards.
    const mine = await rpc('shop_player_pending', { lim: 20 }, true) || [];
    const done = [];
    for (const p of mine) {
      const m = buildPlayerMail(p, contact);
      if (await brevo({ sender, to: [{ email: p.email }], replyTo: { email: contact, name: 'Dropicards' }, subject: m.subject, htmlContent: m.html, textContent: m.text, tags: ['pk-shop-joueur'] })) done.push(p.id);
      else failed = true;
    }
    if (done.length) players = await rpc('shop_player_mark_sent', { ids: done });
    if (failed) return fail(502, 'E-mail non envoyé : il repartira au prochain achat.');
    return json(200, { sent: list.length, marked: n, players });
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
