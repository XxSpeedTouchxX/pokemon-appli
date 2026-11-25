// « Mes messages » : Reçus et Envoyés, modifier ou supprimer un message (2026-11-25, porteur : « dans l'endroit où on
// envoie les messages, on ait la possibilité de supprimer un message ou bien de le modifier »). Serveur 041 imité :
// jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c, why) => res.push((c ? '✓ ' : '✗ ') + l + (!c && why ? ' — ' + why : '')); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ');
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;
const FAKE = 'http://127.0.0.1:59994', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-me', EMAIL = 'me@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const ago = m => new Date(Date.now() - m * 60000).toISOString();
const snap = (sid, id, o) => Object.assign({ sid: sid, card_id: id, lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null }, o || {});

const setup = async (S, role) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
    S.calls[fn] = (S.calls[fn] || []).concat([body]);
    if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (fn === 'pl_state') return send(404, {});
    if (fn === 'player_card') return send(200, { id: body.target, pseudo: 'Ondine', avatar: null, grade: 3, me: false, since: '2026-11', season: { n: 1, rank: 5, pl: 1600, players: 40 }, past: [] });
    if (fn === 'quick_msg_state') return send(200, { unread: S.inbox.filter(x => !x.read).length, left: 10, off: false, v: S.v });
    if (fn === 'quick_msg_inbox') return send(200, { off: false, unread: S.inbox.filter(x => !x.read).length, left: 10, trade: true, v: S.v, items: S.inbox.map(x => Object.assign({}, x)) });
    if (fn === 'quick_msg_read') { S.inbox.forEach(x => { x.read = true; }); return send(200, { ok: true }); }
    if (fn === 'quick_msg_sent') return S.v < 41 ? send(404, { code: 'PGRST202', message: 'Could not find the function public.quick_msg_sent' }) : send(200, { v: 41, items: S.sent.map(x => Object.assign({}, x)) });
    if (fn === 'trade_state') return send(200, { adult: true, age_ok: true, mine: Object.keys(S.vit).map((ref, i) => ({ ref: ref, sid: 900 + i, deal: false })), demand: {}, supply: {} });
    if (fn === 'showcase_set') return send(200, { ok: true, n: (body.items || []).length });
    if (fn === 'wants_set') return send(200, { ok: true, n: 0 });
    if (fn === 'trade_answer') { const it = S.inbox.find(x => x.id === body.msg_id); it.replied = body.code; it.deal = body.code === 'deal_yes'; return send(200, { ok: true, left: 9, deal: it.deal }); }
    if (fn === 'trade_answer_edit') {
      const it = S.inbox.find(x => x.id === body.msg_id); it.replied = body.code; it.deal = body.code === 'deal_yes'; it.replied_edits_left--;
      const a = S.sent.find(x => x.reply_to === body.msg_id); if (a) { a.code = body.code; a.deal = it.deal; a.edited = true; a.edits_left--; }
      return send(200, { ok: true, deal: it.deal, edits: 5 - it.replied_edits_left });
    }
    if (fn === 'trade_edit') {
      const it = S.sent.find(x => x.id === body.msg_id);
      if (!it || it.answer) return send(400, { code: 'P0001', message: 'Il a déjà répondu : ce message ne peut plus être modifié.' });
      it.kind = body.kind; it.code = body.kind; it.offer = body.kind === 'offer' ? snap(body.offer_sid, S.ids[0]) : null; it.edited = true; it.edits_left--; it.seen = false;
      return send(200, { ok: true, id: it.id, edits: 5 - it.edits_left });
    }
    if (fn === 'trade_delete') {
      const i = S.inbox.findIndex(x => x.id === body.msg_id), j = S.sent.findIndex(x => x.id === body.msg_id);
      if (i >= 0) { S.inbox.splice(i, 1); return send(200, { ok: true, removed: 'me' }); }
      if (j >= 0) { const it = S.sent[j]; S.sent.splice(j, 1); if (it.kind === 'answer') { const pr = S.inbox.find(x => x.id === it.reply_to); if (pr) { pr.replied = null; pr.deal = false; } } return send(200, { ok: true, removed: it.answer ? 'me' : 'both' }); }
      return send(400, { code: 'P0001', message: 'Message introuvable.' });
    }
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '25-35', starter: 25, role: role || 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { window.__pkmSocial = { discord: 'https://discord.gg/essai-dropicards' }; });
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
  S.ids = await page.evaluate(() => window.__pkm.catalog().filter(p => p.type !== 'sealed' && p.img).slice(0, 6).map(p => p.id));
  // Ma carte 0 « Pour trade » dans ma vitrine (pour proposer un échange en modifiant un message).
  S.vit = { [S.ids[0] + '|FR|NM|']: { t: true } };
  await page.evaluate(([tok, uid, email, rl, ids, vit]) => {
    const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0;
    d.purchases = ids.slice(0, 2).map((id, i) => ({ id: 'me' + i, date: '2026-11-01', seq: i, lines: [{ pid: id, qty: 1, lang: 'FR', cond: 'NM' }], total: null, where: 'Test', by: 'toi' }));
    d.sales = []; d.seq = 10; d.vit = vit; d.wants = []; d.vtEver = true;
    localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1');
    localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: rl }));
  }, [TOKEN, UID, EMAIL, role || 'user', S.ids, S.vit]);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  return { ctx, page };
};
const fill = S => {
  const [c0, c1, , , c4, c5] = S.ids;
  S.inbox = [
    { id: 12, code: 'interest', kind: 'interest', at: ago(5), read: false, from: 'u-reg', pseudo: 'Régis', avatar: null, grade: 1, replied: null, deal: false, edited: false, card: snap(901, c1, { trade: false, sale: true, price_cents: 4250 }), offer: null },
    { id: 11, code: 'offer', kind: 'offer', at: ago(30), read: true, from: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3, replied: 'deal_no', replied_edits_left: 5, deal: false, edited: false, card: snap(900, c0), offer: snap(501, c5) },
    { id: 13, code: 'deal_yes', kind: 'answer', at: ago(90), read: true, from: 'u-pie', pseudo: 'Pierre', avatar: null, grade: 1, replied: null, deal: true, edited: true, card: snap(777, c4), offer: snap(900, c0) }
  ];
  S.sent = [
    { id: 21, code: 'interest', kind: 'interest', at: ago(10), to: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3, card: snap(501, c5), offer: null, deal: false, seen: false, edited: false, edits_left: 5, reply_to: null, answer: null },
    { id: 22, code: 'offer', kind: 'offer', at: ago(60), to: 'u-pie', pseudo: 'Pierre', avatar: null, grade: 1, card: snap(777, c4), offer: snap(900, c0), deal: false, seen: true, edited: false, edits_left: 5, reply_to: null, answer: 'deal_no', answer_edited: false },
    { id: 23, code: 'deal_no', kind: 'answer', at: ago(29), to: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3, card: snap(900, c0), offer: snap(501, c5), deal: false, seen: true, edited: false, edits_left: 5, reply_to: 11, answer: null }
  ];
};

// A-G. Serveur avec 041.
{
  const S = { calls: {}, v: 41, ids: [], inbox: [], sent: [] };
  const { ctx, page } = await setup(S);
  fill(S);
  await page.evaluate(() => window.__pkm.qmOpen()); await page.waitForTimeout(1200);
  const M = page.locator('section.pkm-qm'), it = M.locator('li.pkm-qm-item'), tabs = M.locator('[role="tab"]');
  ok('onglets « Reçus (1) » et « Envoyés », Reçus choisi', (await tabs.allInnerTexts()).join('|') === 'Reçus (1)|Envoyés' && (await tabs.first().getAttribute('aria-selected')) === 'true');
  ok('Reçus : 3 messages', (await it.count()) === 3);
  const t0 = N(await it.nth(0).innerText()), t1 = N(await it.nth(1).innerText()), t2 = N(await it.nth(2).innerText());
  ok('proposition sans réponse : 3 réponses et « Supprimer » seulement', (await it.nth(0).locator('.pkm-qm-chip').count()) === 3 && (await it.nth(0).locator('.pkm-qm-act').allInnerTexts()).map(N).join('|') === 'Supprimer', t0);
  ok('proposition répondue : « Modifier ma réponse » et « Supprimer »', /Tu as répondu « 🙅 Non merci »/.test(t1) && (await it.nth(1).locator('.pkm-qm-act').allInnerTexts()).map(N).join('|') === 'Modifier ma réponse|Supprimer', t1);
  ok('réponse reçue modifiée : étiquette « Modifié »', (await it.nth(2).locator('.pkm-qm-edtag').count()) === 1 && /Modifié/.test(t2));
  await M.screenshot({ path: shot('messages-recus.png') });

  // C. Changer ma réponse : Non merci → Ça m'intéresse.
  await it.nth(1).locator('.pkm-qm-act', { hasText: 'Modifier ma réponse' }).click(); await page.waitForTimeout(300);
  const ed = it.nth(1).locator('.pkm-qm-ed');
  ok('modifier ma réponse : 3 réponses, « Non merci » cochée', (await ed.locator('.pkm-qm-chip').count()) === 3 && (await ed.locator('.pkm-qm-chip[aria-pressed="true"]').innerText()).indexOf('Non merci') >= 0);
  ok('modifier ma réponse : nombre de modifications restantes', /Encore 5 modifications possibles/.test(N(await ed.innerText())));
  await ed.locator('.pkm-qm-chip', { hasText: 'Ça m’intéresse' }).click(); await page.waitForTimeout(1000);
  ok('trade_answer_edit (11, deal_yes)', (S.calls.trade_answer_edit || []).length === 1 && S.calls.trade_answer_edit[0].msg_id === 11 && S.calls.trade_answer_edit[0].code === 'deal_yes');
  const t1b = N(await it.nth(1).innerText());
  ok('réponse changée : « Tu as répondu « 👍 Ça m’intéresse » » et accord avec Ondine', /Tu as répondu « 👍 Ça m’intéresse »/.test(t1b) && /Échange d’accord avec Ondine/.test(t1b), t1b);
  ok('réponse changée : la vitrine est relue (accord)', (S.calls.trade_state || []).length >= 2);

  // D. Supprimer un message reçu (confirmation).
  await it.nth(2).locator('.pkm-qm-act', { hasText: 'Supprimer' }).click(); await page.waitForTimeout(300);
  const ask = it.nth(2).locator('.pkm-qm-ask');
  ok('supprimer : confirmation « Retirer ce message de ta liste ? Pierre garde le sien. »', /Retirer ce message de ta liste \? Pierre garde le sien\./.test(N(await ask.innerText())));
  await ask.locator('.pkm-qm-cancel').click(); await page.waitForTimeout(250);
  ok('annuler : rien supprimé', !(S.calls.trade_delete || []).length && (await it.count()) === 3);
  await it.nth(2).locator('.pkm-qm-act', { hasText: 'Supprimer' }).click(); await page.waitForTimeout(250);
  await it.nth(2).locator('.pkm-qm-del').click(); await page.waitForTimeout(1000);
  ok('trade_delete (13) puis message retiré', (S.calls.trade_delete || []).length === 1 && S.calls.trade_delete[0].msg_id === 13 && (await it.count()) === 2);

  // E. Envoyés.
  await tabs.nth(1).click(); await page.waitForTimeout(1000);
  ok('Envoyés : quick_msg_sent appelé, onglet choisi', (S.calls.quick_msg_sent || []).length >= 1 && (await tabs.nth(1).getAttribute('aria-selected')) === 'true');
  ok('Envoyés : 3 messages', (await it.count()) === 3);
  const s0 = N(await it.nth(0).innerText()), s1 = N(await it.nth(1).innerText()), s2 = N(await it.nth(2).innerText());
  ok('ma proposition sans réponse : « À Ondine », en attente, pas encore vue', /À Ondine/.test(s0) && /Je suis intéressé par ta carte/.test(s0) && /En attente de sa réponse · pas encore vu/.test(s0), s0);
  ok('ma proposition sans réponse : « Modifier » et « Supprimer »', (await it.nth(0).locator('.pkm-qm-act').allInnerTexts()).map(N).join('|') === 'Modifier|Supprimer');
  ok('ma proposition répondue : sa réponse, « Supprimer » seulement', /Sa réponse : « 🙅 Non merci »/.test(s1) && (await it.nth(1).locator('.pkm-qm-act').allInnerTexts()).map(N).join('|') === 'Supprimer', s1);
  ok('ma réponse envoyée : « Ta réponse : … », « Modifier ma réponse » et « Supprimer »', /Ta réponse : 👍 Ça m’intéresse/.test(s2) && (await it.nth(2).locator('.pkm-qm-act').allInnerTexts()).map(N).join('|') === 'Modifier ma réponse|Supprimer', s2);
  ok('Envoyés : aucune réponse à donner (pas de bulles de réponse)', (await M.locator('.pkm-qm-replies').count()) === 0);
  await M.screenshot({ path: shot('messages-envoyes.png') });

  // F. Modifier ma proposition : « Je te propose une de mes cartes ».
  await it.nth(0).locator('.pkm-qm-act', { hasText: 'Modifier' }).click(); await page.waitForTimeout(300);
  const ed2 = it.nth(0).locator('.pkm-qm-ed');
  ok('modifier : « Je suis intéressé » coché, « Je te propose une de mes cartes » proposé', (await ed2.locator('.pkm-qm-chip').allInnerTexts()).map(N).join('|') === '👋 Je suis intéressé|⇄ Je te propose une de mes cartes'
    && /Je suis intéressé/.test(await ed2.locator('.pkm-qm-chip[aria-pressed="true"]').innerText()));
  await ed2.locator('.pkm-qm-chip', { hasText: 'Je te propose' }).click(); await page.waitForTimeout(300);
  ok('échange choisi : « Enregistrer » grisé tant qu’aucune carte n’est choisie', (await ed2.locator('.pkm-qm-save').isDisabled()) && (await ed2.locator('.pkm-vt-pick').count()) === 1);
  await M.screenshot({ path: shot('messages-modifier.png') });
  await ed2.locator('.pkm-vt-pick').first().click(); await page.waitForTimeout(250);
  ok('carte choisie : « Enregistrer : proposer … »', !(await ed2.locator('.pkm-qm-save').isDisabled()) && /Enregistrer : proposer/.test(await ed2.locator('.pkm-qm-save').innerText()));
  await ed2.locator('.pkm-qm-save').click(); await page.waitForTimeout(1000);
  ok('trade_edit (21, offer, 900)', (S.calls.trade_edit || []).length === 1 && S.calls.trade_edit[0].msg_id === 21 && S.calls.trade_edit[0].kind === 'offer' && S.calls.trade_edit[0].offer_sid === 900);
  const s0b = N(await it.nth(0).innerText());
  ok('message modifié : « Modifié », « Je te propose un échange », 2 cartes', /Modifié/.test(s0b) && /Je te propose un échange/.test(s0b) && (await it.nth(0).locator('.pkm-qm-tcard').count()) === 2, s0b);

  // G. Supprimer ma proposition.
  await it.nth(0).locator('.pkm-qm-act', { hasText: 'Supprimer' }).click(); await page.waitForTimeout(250);
  ok('supprimer ma proposition : « Retirer ta proposition ? Ondine ne la verra plus. »', /Retirer ta proposition \? Ondine ne la verra plus\./.test(N(await it.nth(0).locator('.pkm-qm-ask').innerText())));
  await it.nth(0).locator('.pkm-qm-del').click(); await page.waitForTimeout(1000);
  ok('trade_delete (21) puis 2 messages envoyés', S.calls.trade_delete.length === 2 && S.calls.trade_delete[1].msg_id === 21 && (await it.count()) === 2);
  // Ma réponse retirée : la proposition reçue redevient « sans réponse ».
  await it.nth(1).locator('.pkm-qm-act', { hasText: 'Supprimer' }).click(); await page.waitForTimeout(250);
  ok('supprimer ma réponse : explication (« redevient sans réponse »)', /Retirer ta réponse \? Ondine ne la verra plus/.test(N(await it.nth(1).locator('.pkm-qm-ask').innerText())));
  await it.nth(1).locator('.pkm-qm-del').click(); await page.waitForTimeout(1000);
  await tabs.nth(0).click(); await page.waitForTimeout(800);
  ok('Reçus : la proposition d’Ondine se répond de nouveau', (await it.nth(1).locator('.pkm-qm-chip').count()) === 3);
  ok('aucun champ pour écrire (messages tout faits seulement)', (await M.locator('textarea, input').count()) === 0);
  await ctx.close();
}

// H. Serveur sans 041 : pas de Modifier ni de Supprimer ; Envoyés : l'admin voit le fichier à installer.
{
  const S = { calls: {}, v: 38, ids: [], inbox: [], sent: [] };
  const { ctx, page } = await setup(S, 'admin');
  fill(S);
  await page.evaluate(() => window.__pkm.qmOpen()); await page.waitForTimeout(1200);
  const M = page.locator('section.pkm-qm');
  ok('sans 041 : aucun bouton Modifier ni Supprimer', (await M.locator('.pkm-qm-act').count()) === 0 && (await M.locator('li.pkm-qm-item').count()) === 3);
  await M.locator('[role="tab"]').nth(1).click(); await page.waitForTimeout(900);
  ok('sans 041 : l’admin voit le fichier à installer dans Envoyés', /install_024_a_034\.sql/.test(N(await M.innerText())));
  await ctx.close();
}

await browser.close();
ok('aucune erreur de page (' + errors.slice(0, 3).join(' | ') + ')', errors.length === 0);
console.log(res.join('\n'));
const bad = res.filter(r => r.startsWith('✗')).length;
console.log(bad ? bad + ' échec(s)' : 'OK : ' + res.length + ' vérifications');
process.exit(bad ? 1 : 0);
