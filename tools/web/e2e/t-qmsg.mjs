// Messages rapides entre joueurs de « Ma ligue » (2026-11-16, porteur : « ok pour le B », option B de docs/43) :
// 8 messages tout faits sur la carte de dresseur, « Mes messages » (pastille, réponses, réglage), carte de l'expéditeur.
// Le serveur est imité (page.route) : jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ');
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;
const FAKE = 'http://127.0.0.1:59994', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-qm', EMAIL = 'qm@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const ago = m => new Date(Date.now() - m * 60000).toISOString();

const setup = async (S, role) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
    S.calls[fn] = (S.calls[fn] || []).concat([body]);
    const game = (msg) => send(400, { code: 'P0001', message: msg });
    if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (fn === 'pl_state') return send(404, {});
    if (fn === 'season_board') return send(200, { unit: 'pl', season: { n: 1, start: '2026-11-07T23:00:00Z', end: '2027-01-06T23:00:00Z' }, players: 40, ranked: 25,
      top: Array.from({ length: 12 }, (_, i) => ({ id: 'u-' + (i + 1), rank: i + 1, pseudo: 'Dresseur' + (i + 1), grade: 1, pl: 2000 - i * 100, me: false })), me: { id: UID, rank: 14, pl: 150 }, pl_season: 150, pl_total: 150, pk_total: 500, grade: 1 });
    if (fn === 'player_card') return send(200, body.target === UID ? { id: UID, pseudo: 'Sacha', avatar: null, grade: 1, me: true, since: '2026-11', season: { n: 1, rank: 14, pl: 150, players: 40 }, past: [] }
      : { id: body.target, pseudo: body.target === 'u-ond' ? 'Ondine' : 'Dresseur5', avatar: { skin: 's2', hair: 'long', hc: 'roux', bg: 'holo', poke: 25 }, grade: 3, me: false, since: '2026-11', season: { n: 1, rank: 5, pl: 1600, players: 40 }, past: [] });
    if (/^quick_msg_/.test(fn) && S.off32) return send(404, {});
    if (fn === 'quick_msg_state') return send(200, { unread: S.items.filter(x => !x.read).length, left: S.left, off: S.off });
    if (fn === 'quick_msg_send') {
      if (S.left <= 0) return game('Tu as déjà envoyé tes 10 messages rapides aujourd’hui. Reviens demain !');
      S.sent.push(body); S.left--; return send(200, { ok: true, id: 100 + S.sent.length, left: S.left });
    }
    if (fn === 'quick_msg_inbox') return send(200, { off: S.off, unread: S.items.filter(x => !x.read).length, left: S.left, items: S.items.map(x => Object.assign({}, x)) });
    if (fn === 'quick_msg_read') { const n = S.items.filter(x => !x.read).length; S.items.forEach(x => { x.read = true; }); return send(200, { ok: true, read: n }); }
    if (fn === 'quick_msg_reply') {
      const it = S.items.find(x => x.id === body.msg_id);
      if (!it) return game('Message introuvable.');
      if (it.replied) return game('Tu as déjà répondu à ce message.');
      it.replied = body.code; S.left--; return send(200, { ok: true, id: 200, left: S.left });
    }
    if (fn === 'quick_msg_set') { S.off = !body.receive; return send(200, { ok: true, off: S.off }); }
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: role || 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(600);
  await page.evaluate(([tok, uid, email, rl]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1'); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: rl })); }, [TOKEN, UID, EMAIL, role || 'user']);
  return { ctx, page };
};

// A. Joueur : badge, envoi depuis la carte, « Mes messages », réponses, réglage.
{
  const S = { calls: {}, left: 10, off: false, sent: [], items: [
    { id: 1, code: 'bravo', at: ago(2), read: false, from: 'u-ond', pseudo: 'Ondine', avatar: { skin: 's2', hair: 'long', hc: 'roux', bg: 'holo', poke: 25 }, grade: 3, replied: null },
    { id: 2, code: 'tirage', at: ago(65), read: false, from: 'u-7', pseudo: 'Régis', avatar: null, grade: 1, replied: null },
    { id: 3, code: 'safari', at: ago(60 * 30), read: true, from: 'u-7', pseudo: 'Régis', avatar: null, grade: 1, replied: 'gg' }
  ] };
  const { ctx, page } = await setup(S);
  // Onglet Jeux : pastille « 2 » sur la bannière « Ma ligue ».
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.setState({ screen: 'market', stack: [] })); await page.waitForTimeout(1200);
  const ban = page.locator('button.pkm-pg-banner');
  ok('Jeux : pastille « 2 » sur la bannière Ma ligue (' + N(await ban.innerText().catch(() => '')) + ')', (await ban.locator('.pkm-qm-badge').innerText().catch(() => '')) === '2' && /2 nouveaux messages/.test(await ban.getAttribute('aria-label') || ''));
  ok('état lu une seule fois (quick_msg_state)', (S.calls.quick_msg_state || []).length === 1);
  await ban.screenshot({ path: shot('qm-banniere.png') });
  // Ma ligue (ouverte par la bannière) : bouton « Mes messages » dans ma carte.
  await ban.click(); await page.waitForTimeout(2000);
  const ob = page.locator('section.pkm-pg-card button.pkm-qm-open');
  ok('Ma ligue : bouton « Mes messages » avec la pastille 2', (await ob.count()) === 1 && /Mes messages/.test(await ob.innerText()) && (await ob.locator('.pkm-qm-badge').innerText()) === '2');
  // Carte de dresseur d'un autre joueur : 8 messages tout faits.
  await page.locator('ol.pkm-pg-list button', { hasText: 'Dresseur5' }).click(); await page.waitForTimeout(900);
  const PC = page.locator('section.pkm-tc:not(.pkm-qm)');
  const chips = await PC.locator('.pkm-qm-send .pkm-qm-chip').allInnerTexts();
  ok('carte : « Envoyer un message rapide », 8 messages tout faits (' + chips.length + ')', /Envoyer un message rapide/.test(await PC.innerText()) && chips.length === 8 && /👋 Salut !/.test(chips[0]) && /😄 Merci !/.test(chips[7]));
  ok('carte : aucun champ pour écrire', (await PC.locator('textarea, input').count()) === 0);
  ok('carte : règle et « 10 messages restants aujourd’hui »', /10 par jour au plus/.test(N(await PC.innerText())) && /10 messages restants aujourd’hui/.test(N(await PC.innerText())));
  await PC.locator('.pkm-qm-chip', { hasText: 'Bien joué' }).click(); await page.waitForTimeout(600);
  ok('envoi : quick_msg_send (u-5, « bravo »)', S.sent.length === 1 && S.sent[0].target === 'u-5' && S.sent[0].code === 'bravo');
  ok('envoi : message de confirmation', /Message envoyé à Dresseur5 : 👏 Bien joué !/.test(await page.evaluate(() => window.__pkm.st().toast || '')));
  ok('envoi : bulle « envoyé » (jaune, coche) et « 9 messages restants »', (await PC.locator('.pkm-qm-chip.pkm-qm-sent').count()) === 1 && (await PC.locator('.pkm-qm-sent svg.pkm-qm-ok').count()) === 1 && /9 messages restants/.test(N(await PC.innerText())));
  await PC.locator('.pkm-qm-send').scrollIntoViewIfNeeded(); await page.screenshot({ path: shot('qm-carte.png') });
  // Limite du jour atteinte (serveur) : message, bulles grisées.
  S.left = 0;
  await PC.locator('.pkm-qm-chip', { hasText: 'GG' }).click(); await page.waitForTimeout(600);
  ok('11ᵉ message : refus du serveur affiché, bulles grisées, « Reviens demain »', /10 messages rapides/.test(await page.evaluate(() => window.__pkm.st().toast || '')) && (await PC.locator('.pkm-qm-dim').count()) === 8 && /Reviens demain/.test(N(await PC.innerText())));
  S.left = 9;
  await page.locator('section.pkm-tc button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  // Ma propre carte : pas de messages.
  await page.locator('section[aria-label="Classement général"] > button.pkm-pg-me').click(); await page.waitForTimeout(900);
  ok('ma carte : pas de messages rapides', (await page.locator('.pkm-qm-send').count()) === 0);
  await page.locator('section.pkm-tc button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  // « Mes messages ».
  await ob.click(); await page.waitForTimeout(900);
  const QM = page.locator('section.pkm-qm');
  const items = await QM.locator('li.pkm-qm-item').allInnerTexts();
  ok('Mes messages : 3 messages, du plus récent au plus ancien', items.length === 3 && /Ondine/.test(items[0]) && /Bien joué/.test(items[0]) && /Régis/.test(items[1]) && /Bonne chance au tirage/.test(items[1]));
  ok('Mes messages : « il y a 2 min », « il y a 1 h », « hier »', /il y a 2 min/.test(items[0]) && /il y a 1 h/.test(items[1]) && /hier/.test(items[2]));
  ok('Mes messages : 2 « Nouveau » encadrés', (await QM.locator('li.pkm-qm-new').count()) === 2 && (await QM.locator('.pkm-qm-newtag').count()) === 2);
  ok('réponses proposées : Merci, GG, Rendez-vous au top 10 sous « Bien joué »', /😄 Merci !/.test(items[0]) && /💪 GG !/.test(items[0]) && /Rendez-vous au top 10/.test(items[0]));
  ok('déjà répondu : « Tu as répondu « 💪 GG ! » »', /Tu as répondu « 💪 GG ! »/.test(items[2]) && (await QM.locator('li.pkm-qm-item').nth(2).locator('.pkm-qm-replies').count()) === 0);
  ok('ouverture : tout marqué comme lu (quick_msg_read), pastille retirée', (S.calls.quick_msg_read || []).length === 1 && (await page.locator('section.pkm-pg-card .pkm-qm-badge').count()) === 0);
  ok('réglage « Recevoir les messages rapides » activé', (await QM.locator('button.pkm-qm-set[aria-checked="true"]').count()) === 1);
  await page.screenshot({ path: shot('qm-mes-messages.png') });
  // Répondre « Merci ! » à Ondine.
  await QM.locator('li.pkm-qm-item').nth(0).locator('.pkm-qm-chip', { hasText: 'Merci' }).click(); await page.waitForTimeout(600);
  ok('réponse : quick_msg_reply (message 1, « merci »)', (S.calls.quick_msg_reply || []).length === 1 && S.calls.quick_msg_reply[0].msg_id === 1 && S.calls.quick_msg_reply[0].code === 'merci');
  ok('réponse : « Tu as répondu « 😄 Merci ! » », bulles retirées', /Tu as répondu « 😄 Merci ! »/.test(await QM.locator('li.pkm-qm-item').nth(0).innerText()) && (await QM.locator('li.pkm-qm-item').nth(0).locator('.pkm-qm-replies').count()) === 0);
  // Appui sur un message : carte de l'expéditeur, au-dessus.
  await QM.locator('li.pkm-qm-item').nth(0).locator('button.pkm-qm-from').click(); await page.waitForTimeout(900);
  ok('appui sur le message : carte de dresseur d’Ondine, au-dessus de « Mes messages »', (S.calls.player_card || []).slice(-1)[0].target === 'u-ond' && /Ondine/.test(await PC.innerText()) && (await QM.count()) === 1
    && await page.evaluate(() => { const a = document.querySelector('section.pkm-tc:not(.pkm-qm)'), b = document.querySelector('section.pkm-qm'); return !!(a && b && (b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)); }));
  await page.locator('section.pkm-tc:not(.pkm-qm) button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  ok('carte fermée : retour à « Mes messages »', (await PC.count()) === 0 && (await QM.count()) === 1);
  // Couper les messages.
  await QM.locator('button.pkm-qm-set').click(); await page.waitForTimeout(600);
  ok('réglage coupé : quick_msg_set(receive: false), interrupteur éteint', (S.calls.quick_msg_set || []).slice(-1)[0].receive === false && (await QM.locator('button.pkm-qm-set[aria-checked="false"]').count()) === 1 && /Coupés/.test(await QM.locator('button.pkm-qm-set').innerText()));
  await QM.locator('button.pkm-qm-set').click(); await page.waitForTimeout(600);
  ok('réglage réactivé : quick_msg_set(receive: true)', (S.calls.quick_msg_set || []).slice(-1)[0].receive === true && (await QM.locator('button.pkm-qm-set[aria-checked="true"]').count()) === 1);
  await QM.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  ok('« Mes messages » fermé', (await QM.count()) === 0);
  // Petit écran (320 px) : rien ne dépasse.
  await page.setViewportSize({ width: 320, height: 640 }); await ob.click(); await page.waitForTimeout(900);
  const over = await page.evaluate(() => { const q = document.querySelector('section.pkm-qm'); if (!q) return 'absent'; const w = q.getBoundingClientRect().right; return Array.from(q.querySelectorAll('*')).filter(e => e.getBoundingClientRect().right > w + 1).map(e => e.className).slice(0, 3).join(' | '); });
  ok('320 px : rien ne dépasse (' + (over || 'ok') + ')', over === '');
  await page.screenshot({ path: shot('qm-mes-messages-320.png') });
  await ctx.close();
}

// B. Boîte vide, puis serveur sans 032 (joueur, admin).
{
  const S = { calls: {}, left: 10, off: false, sent: [], items: [] };
  const { ctx, page } = await setup(S);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__pkm.setState({ screen: 'market', stack: [] }); }); await page.waitForTimeout(500);
  await page.locator('button.pkm-pg-banner').click(); await page.waitForTimeout(2000);
  await page.locator('section.pkm-pg-card button.pkm-qm-open').click(); await page.waitForTimeout(800);
  ok('boîte vide : « Aucun message pour l’instant »', /Aucun message pour l’instant/.test(await page.locator('section.pkm-qm').innerText()) && (S.calls.quick_msg_read || []).length === 0);
  await page.locator('section.pkm-qm button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  S.off32 = true;
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__pkm.setState({ screen: 'market', stack: [] }); }); await page.waitForTimeout(500);
  await page.locator('button.pkm-pg-banner').click(); await page.waitForTimeout(2000);
  await page.locator('ol.pkm-pg-list button', { hasText: 'Dresseur5' }).click(); await page.waitForTimeout(900);
  ok('sans 032, joueur : carte avec « Les messages rapides arrivent très bientôt »', /arrivent très bientôt/.test(await page.locator('section.pkm-tc').innerText()));
  await page.locator('section.pkm-tc button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  await page.locator('section.pkm-pg-card button.pkm-qm-open').click(); await page.waitForTimeout(800);
  ok('sans 032, joueur : « Mes messages » « bientôt », sans réglage', /arrivent très bientôt/.test(await page.locator('section.pkm-qm').innerText()) && (await page.locator('button.pkm-qm-set').count()) === 0);
  await ctx.close();
}
{
  const S = { calls: {}, left: 10, off: false, sent: [], items: [], off32: true };
  const { ctx, page } = await setup(S, 'admin');
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__pkm.setState({ screen: 'market', stack: [] }); }); await page.waitForTimeout(500);
  await page.locator('button.pkm-pg-banner').click(); await page.waitForTimeout(2000);
  await page.locator('section.pkm-pg-card button.pkm-qm-open').click(); await page.waitForTimeout(800);
  ok('sans 032, admin : fichier install_024_a_032.sql à coller dans Studio', /install_024_a_032\.sql/.test(await page.locator('section.pkm-qm').innerText()));
  await ctx.close();
}
// C. Sans compte : pas de bouton « Mes messages », pas de messages sur les cartes.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(ABORT, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(500);
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); });
  await page.goto(E2E + '/?start=progress&debug', { waitUntil: 'load' }); await page.waitForTimeout(2000);
  ok('sans compte : pas de bouton « Mes messages »', (await page.locator('button.pkm-qm-open').count()) === 0);
  await ctx.close();
}

ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
