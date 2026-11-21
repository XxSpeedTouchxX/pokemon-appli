// Échanges entre joueurs, étage 1 (2026-11-16, « go » du porteur, docs/45) : vitrine, « Pour trade », « À vendre » au
// prix choisi par le joueur (après « J'ai 18 ans ou plus »), « Je la cherche », interface des échanges dans Le coin des
// dresseurs › Ma vitrine (l'onglet « Échanges » de Ma ligue est retiré le 2026-11-21), vitrine
// sur la carte de dresseur, propositions et accord dans « Mes messages ». Le serveur est imité : jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ');
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;
const FAKE = 'http://127.0.0.1:59993', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-vt', EMAIL = 'vt@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const ago = m => new Date(Date.now() - m * 60000).toISOString();
const wait = ms => new Promise(r => setTimeout(r, ms));

const setup = async (S, role) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
    S.calls[fn] = (S.calls[fn] || []).concat([body]);
    const game = msg => send(400, { code: 'P0001', message: msg });
    if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (fn === 'pl_state') return send(404, {});
    if (fn === 'season_board') return send(200, { unit: 'pl', season: { n: 1, start: '2026-11-07T23:00:00Z', end: '2027-01-06T23:00:00Z' }, players: 40, ranked: 25,
      top: Array.from({ length: 12 }, (_, i) => ({ id: 'u-' + (i + 1), rank: i + 1, pseudo: 'Dresseur' + (i + 1), grade: 1, pl: 2000 - i * 100, me: false })), me: { id: UID, rank: 14, pl: 150 }, pl_season: 150, pl_total: 150, pk_total: 500, grade: 1 });
    if (fn === 'player_card') return send(200, { id: body.target, pseudo: body.target === UID ? 'Sacha' : 'Ondine', avatar: body.target === UID ? null : { skin: 's2', hair: 'long', hc: 'roux', bg: 'holo', poke: 25 }, grade: 3, me: body.target === UID, since: '2026-11', season: { n: 1, rank: 5, pl: 1600, players: 40 }, past: [] });
    if (fn === 'quick_msg_state') return send(200, { unread: S.items.filter(x => !x.read).length, left: S.left, off: false });
    if (fn === 'quick_msg_inbox') return send(200, { off: false, unread: S.items.filter(x => !x.read).length, left: S.left, trade: true, items: S.items.map(x => Object.assign({}, x)) });
    if (fn === 'quick_msg_read') { S.items.forEach(x => { x.read = true; }); return send(200, { ok: true }); }
    if (fn === 'quick_msg_reply') { const it = S.items.find(x => x.id === body.msg_id); it.replied = body.code; S.left--; return send(200, { ok: true, left: S.left }); }
    if (/^(showcase_set|wants_set|trade_)/.test(fn) || fn === 'player_showcase') {
      if (S.off33) return send(404, { code: 'PGRST202', message: 'not found' });
      if (fn === 'trade_state') return send(200, { adult: S.adult, age_ok: S.ageOk, mine: S.vit.map((x, i) => ({ ref: x.ref, sid: 900 + i, deal: !!S.deal[x.ref] })), demand: { [S.ids[0]]: 2 }, supply: { [S.ids[5]]: 1 } });
      if ((fn === 'showcase_set' || fn === 'wants_set') && S.pseudo === null) return send(403, { code: '42501', message: 'Compte suspendu ou sans pseudo.' });
      if (fn === 'showcase_set') {
        if (!S.ageOk && body.items.some(x => x.trade || x.sale)) return game('Les échanges sont ouverts à partir de 15 ans');
        if (body.items.some(x => x.sale) && !S.adult) return game('Confirme d’abord avoir 18 ans ou plus pour vendre une carte');
        S.vit = body.items; S.sets++; return send(200, { ok: true, n: body.items.length });
      }
      if (fn === 'wants_set') { S.wants = body.ids; return send(200, { ok: true, n: body.ids.length }); }
      if (fn === 'trade_adult_confirm') { S.adult = true; return send(200, { ok: true, adult: true }); }
      if (fn === 'trade_card') return send(200, { wanted: 2, offered: 1 });
      if (fn === 'trade_matches') return send(200, [{ id: 'u-ond', pseudo: 'Ondine', avatar: { skin: 's2', hair: 'long', hc: 'roux', bg: 'holo', poke: 25 }, grade: 3, has: 2, wants: 1, has_ids: [S.ids[5]], want_ids: [S.ids[0]] }]);
      if (fn === 'player_showcase') return send(200, body.target === UID ? { me: true, items: [], wants: [] } : { me: false, has_for_me: 1, wants_mine: 1, wants: [S.ids[0], S.ids[6]], items: [
        { sid: 501, card_id: S.ids[5], lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null, deal: false },
        { sid: 502, card_id: S.ids[6], lang: 'FR', cond: 'EX', grade: null, trade: false, sale: true, price_cents: 4000, deal: false },
        { sid: 503, card_id: S.ids[7], lang: 'EN', cond: 'NM', grade: null, trade: true, sale: true, price_cents: 1250, deal: true }] });
      if (fn === 'trade_send') { S.tsend.push(body); S.left--; return send(200, { ok: true, id: 300 + S.tsend.length, left: S.left }); }
      if (fn === 'trade_answer') { const it = S.items.find(x => x.id === body.msg_id); it.replied = body.code; it.deal = body.code === 'deal_yes'; S.left--; return send(200, { ok: true, left: S.left, deal: body.code === 'deal_yes' }); }
    }
    if (p === '/rest/v1/profiles' && req.method() === 'PATCH') { S.patch = body; S.pseudo = body.pseudo; return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' }, body: '' }); }
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: S.pseudo === undefined ? 'Sacha' : S.pseudo, age_range: S.ageOk ? '25-35' : 'u15', starter: 25, role: role || 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
  // Cartes réelles du catalogue : 3 dans mon classeur (0, 1, 2), les autres pour l'autre joueur.
  S.ids = await page.evaluate(() => window.__pkm.catalog().filter(p => p.type !== 'sealed' && p.img).slice(0, 6).map(p => p.id));
  S.ids.push(S.ids[4], S.ids[3]); // cartes 6 et 7 : hors de mon classeur
  await page.evaluate(([tok, uid, email, rl, ids, nick]) => {
    const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0;
    d.purchases = ids.slice(0, 3).map((id, i) => ({ id: 'vt' + i, date: '2026-11-01', seq: i, lines: [{ pid: id, qty: i === 1 ? 2 : 1, lang: 'FR', cond: i === 2 ? 'EX' : 'NM' }], total: null, where: 'Test', by: 'toi' }));
    d.sales = []; d.seq = 10; d.vit = {}; d.wants = []; if (nick) d.trainer = Object.assign({}, d.trainer || {}, { name: nick });
    localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1');
    localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: rl }));
  }, [TOKEN, UID, EMAIL, role || 'user', S.ids, S.nick || '']);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  return { ctx, page };
};
const newS = o => Object.assign({ calls: {}, left: 10, adult: false, ageOk: true, vit: [], wants: [], deal: {}, sets: 0, tsend: [], items: [], ids: [] }, o || {});

// A. Fiche d'une carte de mon classeur : vitrine, Pour trade, À vendre au prix du joueur ; Je la cherche.
{
  const S = newS();
  const { ctx, page } = await setup(S);
  const [c0, c1, , , , c5] = S.ids;
  await page.evaluate(id => window.__pkm.fiOpen(id, { from: 'binder' }), c0); await page.waitForTimeout(1200);
  const V = page.locator('section.pkm-fi .pkm-vt');
  ok('fiche : bloc « Ma vitrine · échanges »', (await V.count()) === 1 && /Ma vitrine · échanges/.test(await V.innerText()));
  ok('fiche : 3 interrupteurs (vitrine, Pour trade, À vendre)', (await V.locator('[role="switch"]').count()) === 3 && /Dans ma vitrine/.test(await V.innerText()) && /Pour trade/.test(await V.innerText()) && /À vendre/.test(await V.innerText()));
  ok('fiche : « 2 joueurs cherchent cette carte »', /2 joueurs cherchent cette carte/.test(N(await V.innerText())));
  ok('fiche : « Dropicards ne vend rien »', /Dropicards ne vend rien et ne prend aucun paiement/.test(N(await V.innerText())));
  await V.locator('[role="switch"]', { hasText: 'Dans ma vitrine' }).click(); await page.waitForTimeout(1400);
  ok('vitrine : la carte entre dans une vitrine de magasin (store, enseigne « MA VITRINE », vitre, 3 présentoirs, spot, « Dans ta vitrine », « 1 / 30 »)', await page.evaluate(() => { const e = document.querySelector('.pkm-vfx'); return !!e && /Dans ta vitrine/.test(e.textContent) && /1 \/ 30 dans ta vitrine/.test(e.textContent) && !!e.querySelector('.pkm-vfx-front .pkm-vfx-awning') && /MA VITRINE/.test(e.querySelector('.pkm-vfx-sign').textContent) && !!e.querySelector('.pkm-vfx-hole .pkm-vfx-glass') && e.querySelectorAll('.pkm-vfx-back .pkm-vfx-stand').length === 3 && !!e.querySelector('.pkm-vfx-cone') && !!e.querySelector('.pkm-vfx-card .pkm-vfx-tag'); }));
  ok('vitrine : la carte passe derrière la vitre (devant au début, derrière à la fin)', await page.evaluate(() => { const c = document.querySelector('.pkm-vfx-card'), f = document.querySelector('.pkm-vfx-front'); if (!c || !f) return false; const A = c.getAnimations()[0], z = t => { A.pause(); A.currentTime = t; return Number(getComputedStyle(c).zIndex); }; const zf = Number(getComputedStyle(f).zIndex), r = z(400) > zf && z(3000) < zf; A.currentTime = 0; A.play(); return r; }));
  ok('vitrine : animation de 3,6 s', await page.evaluate(() => { const c = document.querySelector('.pkm-vfx-card'); return !!c && c.getAnimations().some(a => a.effect && a.effect.getTiming().duration === 3600); }));
  ok('vitrine : envoyée au serveur (showcase_set, 1 carte, ni trade ni vente)', S.vit.length === 1 && S.vit[0].card_id === c0 && !S.vit[0].trade && !S.vit[0].sale && S.vit[0].lang === 'FR' && S.vit[0].cond === 'NM');
  await V.locator('[role="switch"]', { hasText: 'Pour trade' }).click(); await page.waitForTimeout(1400);
  ok('Pour trade : envoyé (trade = vrai)', S.vit.length === 1 && S.vit[0].trade === true);
  ok('Pour trade : animation avec l’étiquette « ⇄ POUR TRADE »', await page.evaluate(() => { const e = document.querySelector('.pkm-vfx'); return !!e && /POUR TRADE/.test(e.textContent) && /Pour trade dans ta vitrine/.test(e.textContent); }));
  ok('Pour trade : interrupteur coché', (await V.locator('[role="switch"]', { hasText: 'Pour trade' }).getAttribute('aria-checked')) === 'true');
  // À vendre : d'abord « J'ai 18 ans ou plus ».
  await V.locator('[role="switch"]', { hasText: 'À vendre' }).click(); await page.waitForTimeout(500);
  ok('À vendre : question « 18 ans ou plus » d’abord', /réservée aux 18 ans et plus/.test(N(await V.innerText())) && (await V.locator('input').count()) === 0);
  await V.locator('button', { hasText: 'J’ai 18 ans ou plus' }).click(); await page.waitForTimeout(800);
  ok('18 ans : trade_adult_confirm appelé', (S.calls.trade_adult_confirm || []).length === 1);
  const inp = V.locator('.pkm-vt-price input');
  ok('prix : champ ouvert, prérempli avec la cote (' + (await inp.inputValue().catch(() => '?')) + ')', (await inp.count()) === 1 && /^\d+$/.test(await inp.inputValue()));
  ok('prix : cote Dropicards rappelée', /Cote Dropicards de cet exemplaire/.test(N(await V.innerText())));
  await V.screenshot({ path: shot('vitrine-prix.png') });
  await inp.fill('0'); await V.locator('button', { hasText: 'Valider le prix' }).click(); await page.waitForTimeout(300);
  ok('prix refusé sous 1 €', /de 1 € à 100 000 €/.test(await page.evaluate(() => window.__pkm.st().toast || '')));
  await inp.fill('42,50'); await V.locator('button', { hasText: 'Valider le prix' }).click(); await page.waitForTimeout(1500);
  ok('prix : envoyé (sale = vrai, 42,5 €, trade gardé)', S.vit.length === 1 && S.vit[0].sale === true && S.vit[0].price === 42.5 && S.vit[0].trade === true);
  ok('prix : animation « À VENDRE · 42,50 € » (sur la carte et sur l’étiquette du présentoir) et « En vente à 42,50 € »', await page.evaluate(() => { const e = document.querySelector('.pkm-vfx'); return !!e && /À VENDRE · 42,50 €/.test(e.querySelector('.pkm-vfx-tag').textContent) && /À VENDRE · 42,50 €/.test(e.querySelector('.pkm-vfx-label').textContent) && /En vente à 42,50 €/.test(e.textContent); }));
  ok('prix : « Prix demandé : 42,50 € » sous l’interrupteur', /Prix demandé : 42,50 €/.test(N(await V.innerText())) && (await V.locator('button', { hasText: 'Modifier mon prix de vente' }).count()) === 1);
  ok('fiche : aucun champ de texte libre (seulement le prix)', (await page.locator('section.pkm-fi textarea').count()) === 0 && (await V.locator('input').count()) === 0);
  await page.locator('section.pkm-fi').screenshot({ path: shot('vitrine-fiche.png') });
  // Exemplaires : la carte 1 a 2 exemplaires FR NM (un seul groupe).
  await page.evaluate(() => window.__pkm.setState({ fiId: null })); await page.waitForTimeout(300);
  await page.evaluate(id => window.__pkm.fiOpen(id, { from: 'binder' }), c1); await page.waitForTimeout(900);
  ok('carte ×2 : un seul groupe', (await page.locator('section.pkm-fi .pkm-vt [role="switch"]', { hasText: 'Dans ma vitrine' }).count()) === 1);
  // Carte que je n'ai pas : « ♡ Je la cherche ».
  await page.evaluate(() => window.__pkm.setState({ fiId: null })); await page.waitForTimeout(300);
  await page.evaluate(id => window.__pkm.fiOpen(id), c5); await page.waitForTimeout(1200);
  const W = page.locator('section.pkm-fi .pkm-vt-wantbox');
  ok('carte que je n’ai pas : « ♡ Je la cherche » et « 1 joueur l’a »', (await W.count()) === 1 && /♡ Je la cherche/.test(await W.innerText()) && /1 joueur l’a pour trade ou à vendre/.test(N(await W.innerText())));
  ok('carte que je n’ai pas : pas d’interrupteur de vitrine', (await page.locator('section.pkm-fi .pkm-vt [role="switch"]').count()) === 0);
  await W.locator('button').click(); await page.waitForTimeout(1400);
  ok('Je la cherche : wants_set [carte]', JSON.stringify(S.wants) === JSON.stringify([c5]) && (await W.locator('button').getAttribute('aria-pressed')) === 'true');
  await page.evaluate(() => window.__pkm.setState({ fiId: null })); await page.waitForTimeout(300);
  // Garde sur l'appareil.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'));
  ok('vitrine et « Je cherche » gardées sur l’appareil', saved.vit && Object.keys(saved.vit).length === 1 && Array.isArray(saved.wants) && saved.wants[0] === c5 && saved.tradeAdult === true);

  // B. Le coin des dresseurs › Ma vitrine (2026-11-21 : l'onglet « Échanges » de Ma ligue est retiré, son interface reste ici).
  await page.evaluate(() => window.__pkm.coinGo('lig')); await page.waitForTimeout(1800);
  const tabs = await page.locator('.pkm-pg-tabs [role="tab"]').allInnerTexts();
  ok('Ma ligue : 2 onglets, plus d’« Échanges » (' + tabs.join(' | ') + ')', tabs.length === 2 && !tabs.some(t => /Échanges/.test(t)));
  await page.locator('.pkm-coin-tabs [role="tab"]', { hasText: 'Ma vitrine' }).click(); await page.waitForTimeout(1600);
  const T = page.locator('section.pkm-vt-tab');
  const tt = N(await T.innerText().catch(() => ''));
  ok('Échanges : mes cartes Pour trade et à vendre (1 carte, POUR TRADE et À VENDRE · 42,50 €)', (await T.locator('.pkm-vt-sec').first().locator('.pkm-vt-cd').count()) === 1 && /⇄ POUR TRADE/.test(tt) && /À VENDRE · 42,50 €/.test(tt));
  ok('Échanges : « 2 le cherchent » sur ma carte', /2 le cherchent/.test(tt));
  ok('Échanges : Je cherche (1 / 50) avec « 1 l’a »', /1 \/ 50/.test(tt) && /1 l’a/.test(tt));
  ok('Échanges : échange possible avec Ondine', (await T.locator('.pkm-vt-match').count()) === 1 && /Ondine/.test(tt) && /a 2 cartes que tu cherches · cherche 1 de tes cartes/.test(tt));
  ok('Échanges : rappel « pas une plateforme de vente »', /Dropicards n’est pas une plateforme de vente/.test(tt));
  ok('Échanges : trade_matches appelé', (S.calls.trade_matches || []).length >= 1);
  await page.screenshot({ path: shot('vitrine-onglet.png') });

  // C. Carte de dresseur d'Ondine : sa vitrine.
  await T.locator('.pkm-vt-match').click(); await page.waitForTimeout(1400);
  const PC = page.locator('section.pkm-tc:not(.pkm-qm):not(.pkm-vt-sheet)');
  const pct = N(await PC.innerText().catch(() => ''));
  ok('carte de dresseur : « Sa vitrine », 3 cartes', /Sa vitrine/.test(pct) && (await PC.locator('.pkm-vt-pc .pkm-vt-grid li').count()) === 3);
  ok('carte de dresseur : étiquettes POUR TRADE et À VENDRE · 40 €', /⇄ POUR TRADE/.test(pct) && /À VENDRE · 40 €/.test(pct));
  ok('carte de dresseur : carte réservée (accord en cours)', /RÉSERVÉE/.test(pct));
  ok('carte de dresseur : « Tu la cherches » sur la carte de ma liste', (await PC.locator('.pkm-vt-cd-want').count()) === 1 && /Tu la cherches/.test(pct));
  ok('carte de dresseur : bandeau « Il a 1 carte que tu cherches et il cherche 1 de tes cartes »', /Il a 1 carte que tu cherches et il cherche 1 de tes cartes/.test(pct));
  ok('carte de dresseur : « Il cherche » avec « Tu l’as »', /Il cherche/.test(pct) && (await PC.locator('.pkm-vt-mini-have').count()) === 1);
  await PC.locator('.pkm-vt-pc').screenshot({ path: shot('vitrine-dresseur.png') });

  // D. Appui sur une carte Pour trade : proposer une de mes cartes.
  await PC.locator('.pkm-vt-pc .pkm-vt-grid li').nth(0).locator('button').click(); await page.waitForTimeout(700);
  const TS = page.locator('section.pkm-vt-sheet');
  const tst = N(await TS.innerText().catch(() => ''));
  ok('fenêtre : « Carte de Ondine », Pour trade, cote Dropicards', (await TS.count()) === 1 && /Carte de Ondine/.test(tst) && /POUR TRADE/.test(tst) && /Cote Dropicards/.test(tst));
  ok('fenêtre : « Je suis intéressé » et ma carte Pour trade à proposer', /Je suis intéressé/.test(tst) && (await TS.locator('.pkm-vt-pick').count()) === 1);
  ok('fenêtre : aucun champ pour écrire', (await TS.locator('textarea, input').count()) === 0);
  ok('fenêtre : « Proposer » grisé avant le choix', (await TS.locator('button', { hasText: 'Choisis une de tes cartes' }).isDisabled()));
  await TS.locator('.pkm-vt-pick').click(); await page.waitForTimeout(300);
  ok('fenêtre : carte choisie (aria-pressed)', (await TS.locator('.pkm-vt-pick').getAttribute('aria-pressed')) === 'true');
  await TS.screenshot({ path: shot('vitrine-proposer.png') });
  await TS.locator('button', { hasText: 'Proposer ma carte' }).click(); await page.waitForTimeout(800);
  ok('proposition : trade_send (offer, carte 501 contre ma carte 900)', S.tsend.length === 1 && S.tsend[0].kind === 'offer' && S.tsend[0].card_sid === 501 && S.tsend[0].offer_sid === 900 && S.tsend[0].target === 'u-ond');
  ok('proposition : fenêtre fermée et message', (await TS.count()) === 0 && /Proposition envoyée à Ondine/.test(await page.evaluate(() => window.__pkm.st().toast || '')));
  // Carte à vendre : « Je suis intéressé (40 €) ».
  await PC.locator('.pkm-vt-pc .pkm-vt-grid li').nth(1).locator('button').click(); await page.waitForTimeout(700);
  const tst2 = N(await TS.innerText().catch(() => ''));
  ok('carte à vendre : prix demandé à côté de la cote Dropicards', /Prix demandé par Ondine : 40 € · cote Dropicards/.test(tst2));
  ok('carte à vendre : pas de proposition d’échange', (await TS.locator('.pkm-vt-offer').count()) === 0);
  await TS.locator('button', { hasText: 'Je suis intéressé (40 €)' }).click(); await page.waitForTimeout(800);
  ok('intéressé : trade_send (interest, carte 502)', S.tsend.length === 2 && S.tsend[1].kind === 'interest' && S.tsend[1].card_sid === 502 && !S.tsend[1].offer_sid);
  // Carte réservée : rien à faire.
  await PC.locator('.pkm-vt-pc .pkm-vt-grid li').nth(2).locator('button').click(); await page.waitForTimeout(600);
  ok('carte réservée : ni intéressé ni proposition', /en cours avec un autre joueur/.test(N(await TS.innerText())) && (await TS.locator('button', { hasText: 'Je suis intéressé' }).count()) === 0);
  await TS.locator('button[aria-label="Fermer"]').first().click(); await page.waitForTimeout(500);

  // E. Carte retirée du classeur : elle sort de la vitrine.
  await page.evaluate(() => window.__pkm.setState({ pcCard: null, screen: 'home', stack: [] })); await page.waitForTimeout(500);
  const before = S.sets;
  await page.evaluate(() => { const s = window.__pkm.st(); window.__pkm.setState({ purchases: s.purchases.slice(1) }); }); await page.waitForTimeout(1800);
  ok('carte retirée du classeur : sortie de la vitrine (showcase_set vide)', S.sets > before && S.vit.length === 0 && Object.keys(await page.evaluate(() => window.__pkm.st().vit || {})).length === 0);
  await ctx.close();
}

// F. « Mes messages » : proposition reçue (cartes, 3 réponses, accord) et réponse reçue.
{
  const S0 = newS();
  const S = newS({ adult: true, items: [] });
  const { ctx, page } = await setup(S);
  const [c0, , , , , c5, c6] = S.ids;
  S.items = [
    { id: 11, code: 'offer', kind: 'offer', at: ago(3), read: false, from: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3, replied: null, deal: false,
      card: { sid: 900, card_id: c0, lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null }, offer: { sid: 501, card_id: c5, lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null } },
    { id: 12, code: 'interest', kind: 'interest', at: ago(40), read: false, from: 'u-7', pseudo: 'Régis', avatar: null, grade: 1, replied: null, deal: false,
      card: { sid: 901, card_id: c0, lang: 'FR', cond: 'NM', grade: null, trade: false, sale: true, price_cents: 4250 }, offer: null },
    { id: 13, code: 'deal_no', kind: 'answer', at: ago(90), read: true, from: 'u-8', pseudo: 'Pierre', avatar: null, grade: 1, replied: null, deal: false,
      card: { sid: 777, card_id: c6, lang: 'FR', cond: 'EX', grade: null, trade: true, sale: false, price_cents: null }, offer: { sid: 900, card_id: c0, lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null } }
  ];
  void S0;
  await page.evaluate(() => window.__pkm.coinGo('lig')); await page.waitForTimeout(1800);
  await page.locator('section.pkm-pg-card button.pkm-qm-open').click(); await page.waitForTimeout(1200);
  const M = page.locator('section.pkm-qm');
  const it = M.locator('li.pkm-qm-item');
  ok('messages : 3 messages', (await it.count()) === 3);
  const t0 = N(await it.nth(0).innerText());
  ok('proposition : « ⇄ Je te propose un échange », sa carte et ma carte', /Je te propose un échange/.test(t0) && (await it.nth(0).locator('.pkm-qm-tcard').count()) === 2 && /Sa carte proposée/i.test(t0) && /Ta carte/i.test(t0));
  ok('proposition : 3 réponses (Ça m’intéresse, Non merci, Plus disponible)', /Ça m’intéresse/.test(t0) && /Non merci/.test(t0) && /Plus disponible/.test(t0) && (await it.nth(0).locator('.pkm-qm-chip').count()) === 3);
  const t1 = N(await it.nth(1).innerText());
  ok('intérêt : « Je suis intéressé par ta carte (à vendre 42,50 €) »', /Je suis intéressé par ta carte \(à vendre 42,50 €\)/.test(t1) && (await it.nth(1).locator('.pkm-qm-tcard').count()) === 1);
  const t2 = N(await it.nth(2).innerText());
  ok('réponse reçue : « Réponse à ta proposition : 🙅 Non merci » et messages rapides pour répondre', /Réponse à ta proposition : 🙅 Non merci/.test(t2) && /Merci/.test(t2) && (await it.nth(2).locator('.pkm-qm-tcard').count()) === 2);
  ok('messages : aucun champ pour écrire', (await M.locator('textarea, input').count()) === 0);
  await it.nth(0).locator('.pkm-qm-chip', { hasText: 'Ça m’intéresse' }).click(); await page.waitForTimeout(900);
  ok('accord : trade_answer (11, deal_yes)', (S.calls.trade_answer || []).length === 1 && S.calls.trade_answer[0].msg_id === 11 && S.calls.trade_answer[0].code === 'deal_yes');
  const t0b = N(await it.nth(0).innerText());
  ok('accord : bandeau « Échange d’accord avec Ondine » et étage 2 annoncé', /Échange d’accord avec Ondine/.test(t0b) && /étage 2/.test(t0b) && /Tu as répondu « 👍 Ça m’intéresse »/.test(t0b));
  ok('accord : quick_msg_reply jamais utilisé pour une proposition', !(S.calls.quick_msg_reply || []).some(x => x.msg_id === 11));
  await M.screenshot({ path: shot('vitrine-messages.png') });
  await it.nth(1).locator('.pkm-qm-chip', { hasText: 'Non merci' }).click(); await page.waitForTimeout(900);
  ok('refus : trade_answer (12, deal_no), sans bandeau d’accord', S.calls.trade_answer.length === 2 && S.calls.trade_answer[1].code === 'deal_no' && (await it.nth(1).locator('.pkm-qm-deal').count()) === 0);
  await ctx.close();
}

// H. Compte sans pseudo sur le serveur (admin créé dans Studio) : pseudo du dresseur remis, jamais « Compte suspendu ou sans pseudo ».
{
  const S = newS({ pseudo: null, nick: 'Nico' });
  const { ctx, page } = await setup(S, 'admin');
  await page.evaluate(id => window.__pkm.fiOpen(id, { from: 'binder' }), S.ids[0]); await page.waitForTimeout(1200);
  const V = page.locator('section.pkm-fi .pkm-vt');
  await V.locator('[role="switch"]', { hasText: 'Pour trade' }).click(); await page.waitForTimeout(1800);
  ok('sans pseudo : pseudo du dresseur envoyé au profil (« Nico »)', S.patch && S.patch.pseudo === 'Nico');
  ok('sans pseudo : vitrine enregistrée ensuite (Pour trade)', S.vit.length === 1 && S.vit[0].trade === true);
  const toast = await page.evaluate(() => window.__pkm.st().toast || '');
  ok('sans pseudo : aucun message « Compte suspendu ou sans pseudo » (' + toast + ')', !/suspendu|pseudo/i.test(toast) && !/suspendu|sans pseudo/i.test(await page.locator('body').innerText()));
  ok('sans pseudo : animation de la vitrine jouée', await page.evaluate(() => !!document.querySelector('.pkm-vfx-trade')));
  await ctx.close();
}

// G. Moins de 15 ans : vitrine seulement ; serveur sans 033 : message à l'admin.
{
  const S = newS({ ageOk: false });
  const { ctx, page } = await setup(S);
  await page.evaluate(() => window.__pkm.vtLoadState(true)); await page.waitForTimeout(800);
  await page.evaluate(id => window.__pkm.fiOpen(id, { from: 'binder' }), S.ids[0]); await page.waitForTimeout(1000);
  const V = page.locator('section.pkm-fi .pkm-vt');
  ok('moins de 15 ans : vitrine seulement (1 interrupteur) et explication', (await V.locator('[role="switch"]').count()) === 1 && /ouverts à partir de 15 ans/.test(N(await V.innerText())));
  await ctx.close();
}
{
  const S = newS({ off33: true });
  const { ctx, page } = await setup(S, 'admin');
  await page.evaluate(() => window.__pkm.coinGo('vit')); await page.waitForTimeout(1800);
  ok('sans 033 : l’admin voit le fichier à installer', /install_024_a_034\.sql/.test(N(await page.locator('section.pkm-vt-tab').innerText().catch(() => ''))));
  await ctx.close();
}

await browser.close();
ok('aucune erreur de page (' + errors.slice(0, 3).join(' | ') + ')', errors.length === 0);
console.log(res.join('\n'));
const bad = res.filter(r => r.startsWith('✗')).length;
console.log(bad ? bad + ' échec(s)' : 'OK : ' + res.length + ' vérifications');
process.exit(bad ? 1 : 0);
