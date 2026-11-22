// « Mes messages » et carte de dresseur (2026-11-21, porteur : « supprime tous les messages rapides » ; « dans la carte de
// visite, uniquement le pseudo, le grade, membre depuis, le classement et les PL de la saison actuelle, le classement et
// les PL de la saison passée, et sa vitrine ») : plus de messages rapides (ni sur la carte, ni dans la boîte, ni pour
// répondre) ; « Mes messages » ne garde que les propositions d'échange ; carte de dresseur avec la saison en cours et la
// saison passée. Depuis le 2026-11-21 (porteur) : « Mes messages » s'ouvre par la petite enveloppe de l'en-tête, à droite
// de l'emblème du grade, avec le nombre de propositions non lues ; plus de bouton sous les 4 bulles.
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
    if (fn === 'player_card') return send(200, body.target === UID ? { id: UID, pseudo: 'Sacha', avatar: null, grade: 1, me: true, since: '2026-11', season: { n: S.n || 2, rank: 14, pl: 150, players: 40 }, past: [] }
      : body.target === 'u-ond' ? { id: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3, me: false, since: '2026-09', season: { n: S.n || 2, rank: 9, pl: 900, players: 40 }, past: [] }
        : { id: body.target, pseudo: 'Dresseur5', avatar: { skin: 's2', hair: 'long', hc: 'roux', bg: 'holo', poke: 25 }, grade: 3, me: false, since: '2026-11', season: { n: S.n || 2, rank: 5, pl: 1600, players: 40 },
          past: (S.n || 2) > 1 ? [{ n: 1, rank: 3, pl: 2400, players: 120 }] : [] });
    if (fn === 'player_showcase') return send(200, { me: false, has_for_me: 0, wants_mine: 0, wants: ['base1-2'], items: [] });
    if (fn === 'trade_state') return send(200, { adult: false, age_ok: true, mine: [], demand: {}, supply: {} });
    if (fn === 'trade_matches') return send(200, []);
    if (/^quick_msg_/.test(fn) && S.off32) return send(404, {});
    if (fn === 'quick_msg_state') return send(200, { unread: S.items.filter(x => !x.read && x.kind !== 'quick').length, left: S.left, off: S.off });
    if (fn === 'quick_msg_send') {
      if (S.left <= 0) return game('Tu as déjà envoyé tes 10 messages rapides aujourd’hui. Reviens demain !');
      S.sent.push(body); S.left--; return send(200, { ok: true, id: 100 + S.sent.length, left: S.left });
    }
    // Serveur sans 038 : renvoie encore les anciens messages rapides (l'app les écarte).
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

const CARD = id => ({ sid: 900, card_id: id, lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null });

// A. Joueur : carte de dresseur simplifiée, plus de messages rapides, « Mes messages » dans Ma vitrine.
{
  const S = { calls: {}, left: 10, off: false, sent: [], items: [
    { id: 1, code: 'bravo', kind: 'quick', at: ago(1), read: false, from: 'u-7', pseudo: 'Régis', avatar: null, grade: 1, replied: null },
    { id: 2, code: 'interest', kind: 'interest', at: ago(2), read: false, from: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3, replied: null, deal: false, card: CARD('base1-4'), offer: null },
    { id: 3, code: 'deal_yes', kind: 'answer', at: ago(65), read: true, from: 'u-7', pseudo: 'Régis', avatar: null, grade: 1, replied: null, deal: true, card: CARD('base1-2'), offer: CARD('base1-4') }
  ] };
  const { ctx, page } = await setup(S);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.coinGo('vit')); await page.waitForTimeout(1500);
  const vb = page.locator('.pkm-coin-tabs [role="tab"]', { hasText: 'Ma vitrine' }), lb = page.locator('.pkm-coin-tabs [role="tab"]', { hasText: 'Ma ligue' });
  ok('pastille « 1 » (proposition non lue) sur la bulle « Ma vitrine », plus sur « Ma ligue »', (await vb.locator('.pkm-qm-badge').innerText().catch(() => '')) === '1'
    && /1 proposition non lue/.test(await vb.getAttribute('aria-label') || '') && (await lb.locator('.pkm-qm-badge').count()) === 0);
  const mb = page.locator('button.pkm-hh-mail');
  ok('Ma vitrine : plus de bouton « Mes messages » sous les 4 bulles', (await page.locator('button.pkm-qm-open').count()) === 0);
  ok('en-tête : enveloppe avec la pastille « 1 »', (await mb.count()) === 1 && (await mb.locator('.pkm-hh-mail-n').innerText()) === '1'
    && /1 nouvelle proposition d’échange/.test(await mb.getAttribute('aria-label') || ''));
  // À droite de l'emblème du grade, à la même hauteur ; l'emblème reste centré au-dessus du logo.
  const geo = await page.evaluate(() => { const g = document.querySelector('.pkm-hh-gbtn').getBoundingClientRect(), m = document.querySelector('.pkm-hh-mail').getBoundingClientRect(), l = document.querySelector('.pkm-hh-mid > img:last-child').getBoundingClientRect();
    return { gap: Math.round(m.left - g.right), dy: Math.round((m.top + m.height / 2) - (g.top + g.height / 2)), gc: Math.round((g.left + g.width / 2) - (l.left + l.width / 2)), right: Math.round(m.right), avatar: Math.round(document.querySelector('header button[aria-label*="profil" i], .pkm-hh-ava, [aria-label="Mon profil"]') ? document.querySelector('header button[aria-label*="profil" i], .pkm-hh-ava, [aria-label="Mon profil"]').getBoundingClientRect().left : 999) }; });
  ok('enveloppe à droite de l’emblème du grade (≈ 14 px d’écart, 2026-11-22), même hauteur, emblème toujours centré sur le logo (' + JSON.stringify(geo) + ')', geo.gap >= 11 && geo.gap <= 18 && Math.abs(geo.dy) <= 3 && Math.abs(geo.gc) <= 6 && geo.right <= geo.avatar);
  await page.locator('header').first().screenshot({ path: shot('qm-enveloppe-entete.png') }).catch(() => {});
  // Ma ligue : plus de bouton « Mes messages » dans ma carte.
  await lb.click(); await page.waitForTimeout(2000);
  ok('Ma ligue : plus de bouton « Mes messages »', (await page.locator('section.pkm-pg-card button.pkm-qm-open').count()) === 0);
  // Carte de dresseur d'un autre joueur.
  await page.locator('ol.pkm-pg-list button', { hasText: 'Dresseur5' }).click(); await page.waitForTimeout(1200);
  const PC = page.locator('section.pkm-tc:not(.pkm-qm)'), pct = N(await PC.innerText());
  ok('carte : plus de messages rapides (ni « Envoyer un message rapide », ni bulles)', !/message rapide/i.test(pct) && (await PC.locator('.pkm-qm-chip, .pkm-qm-send').count()) === 0 && (await PC.locator('textarea, input').count()) === 0);
  ok('carte : pseudo, grade, « Membre depuis novembre 2026 »', /Dresseur5/.test(pct) && (await PC.locator('.pkm-tc-grade').count()) === 1 && /Membre depuis novembre 2026/.test(pct));
  const now = N(await PC.locator('section[aria-label="Saison en cours"]').innerText());
  ok('carte : saison en cours, classement et PL (' + now + ')', /Saison 2 · en cours/.test(now) && /#5/.test(now) && /sur 40 joueurs/.test(now) && /1 600/.test(now));
  const prev = PC.locator('section[aria-label="Saison passée"]'), pt = N(await prev.innerText());
  ok('carte : saison passée, classement, médaille et PL (' + pt + ')', /Saison 1 · terminée/.test(pt) && /#3/.test(pt) && /sur 120 joueurs/.test(pt) && /2 400/.test(pt) && (await prev.locator('img[src*="rank/3"]').count()) === 1);
  ok('carte : plus de liste des anciennes saisons ni de « Il cherche »', (await PC.locator('section[aria-label="Saisons passées"]').count()) === 0 && !/Il cherche/.test(pct));
  const order = await PC.evaluate(el => ['.pkm-tc-pseudo', '.pkm-tc-grade', '.pkm-tc-since', 'section[aria-label="Saison en cours"]', 'section[aria-label="Saison passée"]', '.pkm-vt-pc'].map(q => { const n = el.querySelector(q); return n ? Math.round(n.getBoundingClientRect().top) : -1; }));
  ok('carte : dans l’ordre pseudo, grade, membre depuis, saison en cours, saison passée, vitrine (' + order.join(' ≤ ') + ')', order.every(v => v >= 0) && order.every((v, i) => !i || v >= order[i - 1]));
  await page.screenshot({ path: shot('carte-dresseur.png') });
  await page.locator('section.pkm-tc button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  // Joueur pas classé la saison passée.
  await page.evaluate(() => window.__pkm.pcOpen({ id: 'u-ond', pseudo: 'Ondine', grade: 3 }, 'PL', 0)); await page.waitForTimeout(900);
  const po = N(await page.locator('section.pkm-tc section[aria-label="Saison passée"]').innerText());
  ok('saison passée sans PL : « — », « pas classé », 0 PL (' + po + ')', /—/.test(po) && /pas classé/.test(po) && / 0$|\b0\b/.test(po));
  await page.locator('section.pkm-tc button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  // « Mes messages » : seulement les propositions d'échange (l'ancien message rapide est écarté).
  await page.evaluate(() => window.__pkm.coinGo('vit')); await page.waitForTimeout(1200);
  await mb.click(); await page.waitForTimeout(900);
  const QM = page.locator('section.pkm-qm');
  const items = await QM.locator('li.pkm-qm-item').allInnerTexts();
  ok('Mes messages : 2 propositions d’échange, l’ancien message rapide écarté', items.length === 2 && /Ondine/.test(items[0]) && /Je suis intéressé/.test(items[0]) && !items.some(t => /Bien joué/.test(t)));
  ok('Mes messages : « Propositions d’échange des dresseurs »', /Propositions d’échange des dresseurs/.test(N(await QM.innerText())));
  ok('proposition : 3 réponses ; réponse reçue : aucune réponse toute faite', (await QM.locator('li.pkm-qm-item').nth(0).locator('.pkm-qm-chip').count()) === 3 && (await QM.locator('li.pkm-qm-item').nth(1).locator('.pkm-qm-chip').count()) === 0);
  ok('accord reçu : rendez-vous sur le Discord (bientôt disponible tant que le lien manque)', /Retrouve Régis sur le Discord Dropicards/.test(items[1]) && /Discord Dropicards bientôt disponible/.test(items[1]));
  ok('ouverture : tout marqué comme lu (quick_msg_read), pastille retirée', (S.calls.quick_msg_read || []).length === 1 && (await mb.locator('.pkm-hh-mail-n').count()) === 0);
  ok('réglage « Recevoir les propositions d’échange »', (await QM.locator('button.pkm-qm-set[aria-checked="true"]', { hasText: 'Recevoir les propositions d’échange' }).count()) === 1);
  ok('aucun envoi ni réponse par message rapide', !(S.calls.quick_msg_send || []).length && !(S.calls.quick_msg_reply || []).length);
  await page.screenshot({ path: shot('qm-mes-messages.png') });
  // Appui sur une proposition : carte de l'expéditeur, au-dessus.
  await QM.locator('li.pkm-qm-item').nth(0).locator('button.pkm-qm-from').click(); await page.waitForTimeout(900);
  ok('appui : carte de dresseur d’Ondine, au-dessus de « Mes messages »', (S.calls.player_card || []).slice(-1)[0].target === 'u-ond' && /Ondine/.test(await PC.innerText()) && (await QM.count()) === 1);
  await page.locator('section.pkm-tc:not(.pkm-qm) button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  await QM.locator('button.pkm-qm-set').click(); await page.waitForTimeout(600);
  ok('réglage coupé : quick_msg_set(receive: false), « Coupées »', (S.calls.quick_msg_set || []).slice(-1)[0].receive === false && /Coupées/.test(await QM.locator('button.pkm-qm-set').innerText()));
  await QM.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  // Petit écran (320 px) : rien ne dépasse.
  await page.setViewportSize({ width: 320, height: 640 }); await page.waitForTimeout(400);
  const g320 = await page.evaluate(() => { const g = document.querySelector('.pkm-hh-gbtn').getBoundingClientRect(), m = document.querySelector('.pkm-hh-mail').getBoundingClientRect();
    const others = [...document.querySelectorAll('header button, header img')].filter(e => !e.closest('.pkm-hh-mail') && !e.closest('.pkm-hh-mid')).map(e => e.getBoundingClientRect()).filter(r => r.width && r.height);
    return { gap: Math.round(m.left - g.right), hit: others.some(r => r.left < m.right && r.right > m.left && r.top < m.bottom && r.bottom > m.top), out: m.right > innerWidth }; });
  ok('320 px : enveloppe à droite de l’emblème, ne touche ni l’avatar ni les soldes (' + JSON.stringify(g320) + ')', g320.gap >= 6 && !g320.hit && !g320.out);
  await page.locator('header').first().screenshot({ path: shot('qm-enveloppe-entete-320.png') }).catch(() => {});
  await mb.click(); await page.waitForTimeout(900);
  const over = await page.evaluate(() => { const q = document.querySelector('section.pkm-qm'); if (!q) return 'absent'; const w = q.getBoundingClientRect().right; return Array.from(q.querySelectorAll('*')).filter(e => e.getBoundingClientRect().right > w + 1).map(e => e.className).slice(0, 3).join(' | '); });
  ok('320 px : rien ne dépasse (' + (over || 'ok') + ')', over === '');
  await ctx.close();
}

// B. Première saison : pas de saison passée ; boîte vide ; serveur sans 032 (joueur, admin).
{
  const S = { calls: {}, left: 10, off: false, sent: [], items: [], n: 1 };
  const { ctx, page } = await setup(S);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.pcOpen({ id: 'u-5', pseudo: 'Dresseur5', grade: 3 }, 'PL', 0)); await page.waitForTimeout(900);
  ok('saison 1 : « Première saison de la ligue : pas encore de saison passée »', /Première saison de la ligue : pas encore de saison passée/.test(N(await page.locator('section.pkm-tc section[aria-label="Saison passée"]').innerText())));
  await page.locator('section.pkm-tc button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  await page.evaluate(() => window.__pkm.tab('home')); await page.waitForTimeout(1200);
  ok('accueil : enveloppe sans pastille (rien de nouveau)', (await page.locator('button.pkm-hh-mail').count()) === 1 && (await page.locator('.pkm-hh-mail-n').count()) === 0);
  await page.locator('button.pkm-hh-mail').click(); await page.waitForTimeout(800);
  ok('boîte vide : « Aucune proposition pour l’instant »', /Aucune proposition pour l’instant/.test(await page.locator('section.pkm-qm').innerText()) && (S.calls.quick_msg_read || []).length === 0);
  await page.locator('section.pkm-qm button[aria-label="Fermer"]').click(); await page.waitForTimeout(700);
  S.off32 = true;
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.coinGo('vit')); await page.waitForTimeout(1500);
  ok('sans 032, joueur : pas d’enveloppe dans l’en-tête', (await page.locator('button.pkm-hh-mail').count()) === 0);
  await ctx.close();
}
{
  const S = { calls: {}, left: 10, off: false, sent: [], items: [], off32: true };
  const { ctx, page } = await setup(S, 'admin');
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.coinGo('vit')); await page.waitForTimeout(1500);
  await page.locator('button.pkm-hh-mail').click(); await page.waitForTimeout(800);
  ok('sans 032, admin : fichier install_024_a_034.sql à coller dans Studio', /install_024_a_034\.sql/.test(await page.locator('section.pkm-qm').innerText()));
  await ctx.close();
}
// C. Sans compte : pas d'enveloppe.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(ABORT, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(500);
  await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); });
  await page.goto(E2E + '/?start=progress&debug', { waitUntil: 'load' }); await page.waitForTimeout(2000);
  await page.evaluate(() => window.__pkm.coinGo('vit')); await page.waitForTimeout(1200);
  ok('sans compte : ni bouton « Mes messages » ni enveloppe', (await page.locator('button.pkm-qm-open').count()) === 0 && (await page.locator('button.pkm-hh-mail').count()) === 0);
  await ctx.close();
}

ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
