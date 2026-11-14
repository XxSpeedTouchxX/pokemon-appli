// Panneau Admin › « Joueurs » et temps passé dans l'app (2026-11-13, porteur : « suivre absolument toutes les personnes
// qui ont un compte et qui jouent régulièrement, avec leurs PK et PA, visible uniquement en mode admin ; et le temps que
// chaque utilisateur passe sur l'appli »). Le serveur est imité (page.route) : jamais le vrai serveur.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const FAKE = 'http://127.0.0.1:59994';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const KEY = 'pkm-collection-v1';
const now = Date.now(), iso = ms => new Date(now - ms).toISOString();
const P = (id, pseudo, email, o) => Object.assign({ id: id, pseudo: pseudo, email: email, role: 'user', status: 'active', created_at: iso(30 * 864e5), grade: 0, pk: 0, pa: 0, pk_earned: 0, premium: false,
  last_seen: null, days_7: 0, days_30: 0, games_7: 0, games_30: 0, secs_today: 0, secs_7: 0, secs_30: 0, secs_total: 0, sessions_7: 0 }, o || {});
const PLAYERS = [
  P('a', 'Admin', 'admin@exemple.fr', { role: 'admin', grade: 5, pk: 120000, pa: 9000, last_seen: iso(30e3), days_7: 7, days_30: 30, secs_today: 1800, secs_7: 25200, secs_30: 90000, secs_total: 200000, sessions_7: 14 }),
  P('b', 'Sacha', 'sacha@exemple.fr', { grade: 2, pk: 8450, pa: 320, pk_earned: 9100, premium: true, last_seen: iso(40 * 60e3), days_7: 5, days_30: 18, games_7: 31, secs_today: 900, secs_7: 7260, secs_30: 30000, secs_total: 45000, sessions_7: 9 }),
  P('c', 'Ondine', 'ondine@exemple.fr', { grade: 1, pk: 1720, pa: 80, pk_earned: 1900, last_seen: iso(2 * 864e5), days_7: 2, days_30: 6, games_7: 4, secs_7: 1500, secs_30: 4000, secs_total: 4000, sessions_7: 2 }),
  P('d', 'Pierre', 'pierre@exemple.fr', { pk: 100, last_seen: iso(12 * 864e5), days_30: 1, secs_30: 300, secs_total: 300 })
];
const make = (UID, EMAIL, role) => {
  const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
  const S = { track: [], players: 0, deny: role !== 'admin' };
  const fake = async route => {
    const req = route.request(), p = new URL(req.url()).pathname;
    const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: j === null ? '' : JSON.stringify(j) });
    if (p === '/rest/v1/rpc/track_time') { S.track.push(JSON.parse(req.postData() || '{}')); return send(200, null); }
    if (p === '/rest/v1/rpc/admin_players') { S.players++; return S.deny ? send(400, { code: 'P0001', message: 'Réservé aux admins' }) : send(200, PLAYERS); }
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Moi', age_range: '25-35', starter: 25, news_optin: false, role: role, status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  };
  return { TOKEN, S, fake, UID, EMAIL, role };
};
const open = async (who) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  await ctx.route(FAKE + '/**', who.fake);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?start=market' + Q, { waitUntil: 'load' }); await page.waitForTimeout(600);
  await page.evaluate(([k, tok, uid, email, role]) => {
    const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
    localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: role }));
  }, [KEY, who.TOKEN, who.UID, who.EMAIL, who.role]);
  await page.goto(E2E + '/?start=market&debug' + Q, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__pkm && window.__pkm.plyView, null, { timeout: 15000 });
  return [ctx, page];
};

// 1. Temps passé : un joueur connecté envoie l'ouverture, puis le temps écoulé quand l'app passe en arrière-plan.
{
  const who = make('u-joueur', 'joueur@exemple.fr', 'user');
  const [ctx, page] = await open(who);
  await page.waitForTimeout(3500);
  ok('ouverture envoyée au serveur (track_time, fresh) : ' + JSON.stringify(who.S.track[0] || null), who.S.track.length >= 1 && who.S.track[0].fresh === true && who.S.track[0].secs === 0);
  await page.waitForTimeout(2200);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(600);
  const last = who.S.track[who.S.track.length - 1] || {};
  ok('app en arrière-plan : temps écoulé envoyé (' + last.secs + ' s)', last.fresh === false && last.secs >= 1 && last.secs <= 6);
  const n = who.S.track.length;
  await page.waitForTimeout(400);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(500);
  ok('retour au premier plan : nouvelle ouverture', who.S.track.length === n + 1 && who.S.track[n].fresh === true && who.S.track[n].secs === 0);
  // Un joueur n'a pas la liste : le serveur la refuse et le panneau Admin ne s'ouvre pas pour lui.
  ok('joueur : aucune demande de la liste des joueurs', who.S.players === 0);
  await ctx.close();
}

// 2. Admin déverrouillé : la liste complète, filtres, tri, recherche.
{
  const who = make('u-adm', 'admin@exemple.fr', 'admin');
  const [ctx, page] = await open(who);
  await page.evaluate(() => window.__pkm.setState({ admin: { on: true, hash: 'x', salt: 'y' }, cloudGame: Object.assign({}, window.__pkm.st().cloudGame || {}, { adminUntil: new Date(Date.now() + 864e5).toISOString() }), admSheet: true }));
  await page.waitForTimeout(1500);
  const sec = page.locator('section.pkm-ply');
  const t = N(await sec.innerText());
  ok('section « Joueurs » dans le panneau Admin, lue sur le serveur (admin_players)', (await sec.count()) === 1 && /Joueurs/.test(t) && who.S.players >= 1);
  ok('compteurs : 4 comptes, 2 actifs aujourd’hui, 2 réguliers', /4 comptes/.test(t) && /2 actifs aujourd’hui/.test(t) && /2 réguliers/.test(t));
  const rows = sec.locator('.pkm-ply-row');
  ok('tous les comptes, du plus récemment actif (Admin, Sacha, Ondine, Pierre)', (await rows.count()) === 4 && /Admin/.test(await rows.nth(0).innerText()) && /Sacha/.test(await rows.nth(1).innerText()) && /Pierre/.test(await rows.nth(3).innerText()));
  const sacha = N(await rows.nth(1).innerText());
  ok('Sacha : PK 8 450, PA 320, grade Collectionneur, Premium, régulier', /8 450 PK/.test(sacha) && /320 PA/.test(sacha) && /Collectionneur/.test(sacha) && /Premium/.test(sacha) && /régulier/.test(sacha) && (await rows.nth(1).locator('img[src="img/grades/grade-3.svg"]').count()) === 1);
  ok('Sacha : temps aujourd’hui 15 min, 7 jours 2 h 01, 30 jours 8 h 20, total 12 h 30', /Aujourd’hui 15 min/.test(sacha) && /7 jours 2 h 01/.test(sacha) && /30 jours 8 h 20/.test(sacha) && /Total 12 h 30/.test(sacha));
  ok('Sacha : 5 j / 7, 18 j / 30, 31 parties, 9 ouvertures, vu il y a 40 min', /5 j \/ 7 · 18 j \/ 30/.test(sacha) && /31 parties en 7 j/.test(sacha) && /9 ouvertures en 7 j/.test(sacha) && /Vu il y a 40 min/.test(sacha));
  ok('Admin : « en ligne », temps total « 2 j 7 h »', /en ligne/.test(N(await rows.nth(0).innerText())) && /Total 2 j 7 h/.test(N(await rows.nth(0).innerText())));
  await sec.scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('admin-joueurs.png') });
  await sec.locator('button', { hasText: 'Réguliers' }).click(); await page.waitForTimeout(300);
  ok('filtre « Réguliers » : Admin et Sacha', (await rows.count()) === 2 && /2 sur 4 joueurs/.test(N(await sec.innerText())));
  await sec.locator('button', { hasText: 'Inactifs 7 j' }).click(); await page.waitForTimeout(300);
  ok('filtre « Inactifs 7 j » : Pierre', (await rows.count()) === 1 && /Pierre/.test(await rows.nth(0).innerText()));
  await sec.locator('button', { hasText: 'Tous' }).click(); await page.waitForTimeout(200);
  await sec.locator('button', { hasText: 'Temps 7 j' }).click(); await page.waitForTimeout(300);
  ok('tri « Temps 7 j » : Admin, Sacha, Ondine, Pierre', /Admin/.test(await rows.nth(0).innerText()) && /Ondine/.test(await rows.nth(2).innerText()));
  await sec.locator('button', { hasText: /^PK$/ }).click(); await page.waitForTimeout(300);
  ok('tri « PK » : Admin (120 000), Sacha, Ondine, Pierre', /120 000/.test(N(await rows.nth(0).innerText())) && /Ondine/.test(await rows.nth(2).innerText()));
  await sec.locator('input[type="search"]').fill('ondine'); await page.waitForTimeout(300);
  ok('recherche « ondine » : un seul joueur', (await rows.count()) === 1 && /ondine@exemple\.fr/.test(await rows.nth(0).innerText()));
  // Serveur sans 025 : message clair.
  await page.evaluate(() => window.__pkm.setState({ plyQ: '' }));
  await ctx.route(FAKE + '/rest/v1/rpc/admin_players', r => r.fulfill({ status: 404, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ code: 'PGRST202', message: 'Could not find the function public.admin_players' }) }));
  await sec.locator('button', { hasText: 'Actualiser' }).click(); await page.waitForTimeout(600);
  ok('serveur sans 025 : « colle tools/supabase/install_024_a_028.sql »', /install_024_a_028\.sql/.test(N(await sec.innerText())));
  await ctx.close();
}
ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
