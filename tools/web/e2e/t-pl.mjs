// Points de loyauté (2026-11-14, « go » du porteur, docs/38) : « Ma ligue » (ex-« Ma progression ») en 2 onglets, classement en PL,
// onglet « Mes missions » (ex-« Gagner des PL ») (parrainage avec lien et QR code, réseaux sur l'honneur, séries de jours, capture d'un partage),
// code d'un lien ?parrain=CODE appliqué à la connexion, Admin › « Défis à valider ».
// Le serveur est imité (page.route) : jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ');
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;

// A. Sans serveur : 2 onglets, nouvelle grille des lots, « Mes missions » demande la connexion.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(ABORT, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?start=progress&debug', { waitUntil: 'load' }); await page.waitForTimeout(2600);
  // Mini-tuto de « Ma ligue » à la première ouverture : 5 étapes, le starter parle, cadre sur chaque partie.
  const bub = page.locator('section.pkm-tuto-bubble[aria-label="Explication de Ma ligue"]');
  ok('première ouverture : mini-tuto de Ma ligue', (await bub.count()) === 1);
  const steps = [];
  for (let i = 0; i < 6 && (await bub.count()); i++) {
    steps.push(N(await bub.locator('.pkm-tt-full').innerText()));
    if (i === 3) await page.screenshot({ path: shot('ligue-tuto-missions.png') });
    if (i === 4) { steps.push('onglet:' + await page.locator('.pkm-pg-tab-on').innerText()); await page.screenshot({ path: shot('ligue-tuto-fin.png') }); }
    await bub.locator('.pkm-tt-next').click(); await page.waitForTimeout(150);
    if (await bub.count()) await bub.locator('.pkm-tt-next').click(); // la phrase en cours s'écrit d'un coup, puis étape suivante
    await page.waitForTimeout(900);
  }
  ok('étape 1 : un championnat chaque saison', /championnat/.test(steps[0] || '') && /60 jours/.test(steps[0] || ''));
  ok('étape 2 : la place au classement et les PL', /classement/.test(steps[1] || '') && /PL/.test(steps[1] || ''));
  ok('étape 3 : les lots des 10 premiers', /10 premiers/.test(steps[2] || ''));
  ok('étape 4 : monter avec les missions de « Mes missions »', /onglet « Mes missions »/.test(steps[3] || ''));
  ok('étape 5 : l’onglet « Mes missions » s’ouvre, les missions sont présentées', /Mes missions/.test(steps[5] || '') && /Parraine tes amis/.test(steps[4] || ''));
  const lt = await page.evaluate(() => window.__pkm.st().ligueTuto);
  ok('« Terminer » : mini-tuto fermé et noté comme vu', lt === 'done' && (await bub.count()) === 0 && (await page.locator('.pkm-tuto-host').count()) === 0);
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(2200);
  ok('seconde ouverture : plus de mini-tuto', (await bub.count()) === 0);
  await page.locator('.pkm-pg-tabs button').nth(0).click(); await page.waitForTimeout(400);
  ok('bas du classement : « Revoir l’explication de la ligue »', (await page.locator('button.pkm-pg-replay').count()) === 1);
  const tabs = await page.locator('.pkm-pg-tabs button').allInnerTexts();
  ok('2 onglets : « Classement et récompenses » et « Mes missions »', tabs.length === 2 && /Classement et récompenses/.test(tabs[0]) && /Mes missions/.test(tabs[1]));
  ok('onglet du classement ouvert d’abord', (await page.locator('.pkm-pg-tab-on').innerText()) === tabs[0] && (await page.locator('section.pkm-pg-card').count()) === 1);
  const rw = N(await page.locator('section[aria-label="Lots de la saison"]').innerText());
  ok('lots : ETB, coffret, 2 boosters, Premium ou ticket Or / Argent / Bronze', /1ʳᵉ place Un ETB du moment/.test(rw) && /2ᵉ place Un coffret du moment/.test(rw) && /3ᵉ place 2 boosters du moment/.test(rw)
    && /4ᵉ et 5ᵉ place 1 mois de Premium ou 1 ticket Or/.test(rw) && /6ᵉ et 7ᵉ place 1 mois de Premium ou 1 ticket Argent/.test(rw) && /8ᵉ à 10ᵉ place 1 mois de Premium ou 1 ticket Bronze/.test(rw) && /au moins 50 joueurs/.test(rw));
  await page.locator('.pkm-pg-tabs button').nth(1).click(); await page.waitForTimeout(500);
  ok('« Mes missions » sans compte : invitation à se connecter, classement caché', /Connecte-toi à ton compte Dropicards pour gagner des Points de loyauté/.test(await page.locator('.pkm-ple-msg').innerText()) && (await page.locator('section.pkm-pg-card').count()) === 0);
  ok('en-tête : « Ma ligue · Mes missions »', /Ma ligue/.test(await page.locator('header').first().innerText()) && /Mes missions/.test(await page.locator('header').first().innerText()));
  await ctx.close();
}

// B. Avec le serveur (imité) : lien de parrainage, état des PL, défis, capture, classement en PL.
{
  const FAKE = 'http://127.0.0.1:59993', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
  const UID = 'u-pl', EMAIL = 'pl@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
  const S = { calls: {}, parrain: null, social: { tiktok: false, instagram: false, discord: false }, share: 'todo', proof: null, pl: 100, newOnce: true };
  const state = () => ({
    season: { n: 1, start: '2026-11-07T23:00:00Z', end: '2027-01-06T23:00:00Z' }, pl_season: S.pl, pl_total: S.pl + 20, code: 'SACHA7',
    referrals: { season: 2, cap: 20, pending: 1, total: 2, premium: 0 }, parrain: S.parrain, can_set_parrain: !S.parrain,
    social: Object.assign({}, S.social), streak: { cur: 3, best: 6, done: [5] }, share: { status: S.share, tries: S.share === 'todo' ? 0 : 1, max: 3 },
    new: S.newOnce ? (S.newOnce = false, [{ kind: 'streak', ref: '5', pl: 30, note: '5 jours d’affilée' }]) : []
  });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: E2E });
  await ctx.addInitScript(() => {
    window.__pkmSocial = { tiktok: 'https://example.invalid/tiktok', instagram: 'https://example.invalid/instagram', discord: '' };
    window.__opened = []; window.open = u => { window.__opened.push(u); return null; };
    navigator.share = d => { window.__shared = d; return Promise.resolve(); };
  });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
    S.calls[fn] = (S.calls[fn] || []).concat([body]);
    if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (fn === 'pl_set_parrain') { S.parrain = 'Ondine'; S.pl += 50; return send(200, { ok: true, parrain: 'Ondine', pl: 50 }); }
    if (fn === 'pl_state') return send(200, state());
    if (fn === 'pl_claim_social') { S.social[body.net] = true; S.pl += 100; return send(200, { kind: 'social', ref: body.net, pl: 100, note: 'Abonné' }); }
    if (fn === 'pl_submit_proof') { S.proof = body; S.share = 'pending'; return send(200, { ok: true, status: 'pending' }); }
    if (fn === 'season_board') return send(200, { unit: 'pl', season: { n: 1, start: '2026-11-07T23:00:00Z', end: '2027-01-06T23:00:00Z' }, players: 40, ranked: 25,
      top: Array.from({ length: 12 }, (_, i) => ({ rank: i + 1, pseudo: 'Dresseur' + (i + 1), grade: 1, pl: 2000 - i * 100, me: false })), me: { rank: 14, pl: S.pl }, pl_season: S.pl, pl_total: S.pl + 20, pk_total: 500, grade: 1 });
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '15-25', starter: 25, role: 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  // Arrivée par un lien de parrainage, avant d'être connecté : le code est gardé, puis retiré de l'adresse.
  await page.goto(E2E + '/?parrain=ond1ne28' + Q, { waitUntil: 'load' }); await page.waitForTimeout(900);
  ok('lien ?parrain= : code gardé sur l’appareil (ONDINE28 → majuscules), retiré de l’adresse',
    JSON.parse(await page.evaluate(() => localStorage.getItem('pkm-parrain')) || '{}').code === 'OND1NE28' && !/parrain=/.test(page.url()));
  await page.evaluate(([tok, uid, email]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1'); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user' })); }, [TOKEN, UID, EMAIL]);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' });
  let toasts = [];
  for (let i = 0; i < 16; i++) { await page.waitForTimeout(250); const t = await page.evaluate(() => window.__pkm && window.__pkm.st().toast); if (t && !toasts.includes(t)) toasts.push(t); }
  ok('connexion : code envoyé au serveur (pl_set_parrain « OND1NE28 »), puis oublié', (S.calls.pl_set_parrain || []).length === 1 && S.calls.pl_set_parrain[0].code === 'OND1NE28' && !(await page.evaluate(() => localStorage.getItem('pkm-parrain'))));
  ok('un seul message : « parrainé par Ondine : +50 PL » et gain de la série (+30 PL) (' + toasts.join(' | ') + ')', toasts.some(t => /parrainé par Ondine : \+50 PL · \+30 PL · 5 jours d’affilée/.test(t)));
  ok('état des PL lu à l’ouverture (pl_state)', (S.calls.pl_state || []).length >= 1);
  ok('les PL ne s’affichent pas sur l’accueil', !/PL de la saison|Points de loyauté/.test(await page.locator('main').innerText()));
  // Onglet « Mes missions ».
  await page.goto(E2E + '/?start=progress&pgtab=earn&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2600);
  const head = N(await page.locator('section.pkm-ple-head').innerText());
  ok('en tête : PL de la saison (150) et total (170 PL gagnés au total), logo des PL', /Mes PL de la saison 150/.test(head) && /170 PL gagnés au total/.test(head) && (await page.locator('section.pkm-ple-head img[src="img/brand/pl.svg"]').count()) === 1);
  const ref = N(await page.locator('section[aria-label="Parrainage"]').innerText());
  ok('parrainage : code SACHA7, lien dropicards.fr/?parrain=SACHA7, 2 / 20 amis, 1 en attente', /SACHA7/.test(ref) && /dropicards\.fr\/\?parrain=SACHA7/.test(ref) && /2 \/ 20 amis comptés cette saison/.test(ref) && /1 en attente/.test(ref));
  ok('parrainage : « Tu as été parrainé par Ondine », plus de champ de code', /Tu as été parrainé par Ondine/.test(ref) && (await page.locator('.pkm-ple-codein').count()) === 0);
  const qr = await page.evaluate(() => { const s = document.querySelector('svg.pkm-ple-qr'), d = s && s.querySelector('path').getAttribute('d'); return s ? { box: s.getAttribute('viewBox'), n: (d.match(/M/g) || []).length } : null; });
  ok('QR code dessiné dans l’app (' + (qr ? qr.n + ' modules, ' + qr.box : 'absent') + ')', !!qr && qr.n > 150 && /^-2 -2 (2[5-9]|3\d) /.test(qr.box));
  await page.locator('section[aria-label="Parrainage"]').screenshot({ path: shot('pl-parrainage.png') });
  await page.locator('section[aria-label="Parrainage"] button', { hasText: 'Partager mon lien' }).click(); await page.waitForTimeout(200);
  const sh = await page.evaluate(() => window.__shared);
  ok('« Partager mon lien » : partage du téléphone avec le lien', !!sh && sh.url === 'https://dropicards.fr/?parrain=SACHA7' && /50 PL de bienvenue/.test(sh.text));
  await page.locator('section[aria-label="Parrainage"] button', { hasText: 'Copier le lien' }).click(); await page.waitForTimeout(300);
  ok('« Copier le lien » : lien dans le presse-papiers', (await page.evaluate(() => navigator.clipboard.readText())) === 'https://dropicards.fr/?parrain=SACHA7');
  // Missions.
  const rows = await page.locator('.pkm-ple-row').allInnerTexts();
  ok('7 défis : 3 réseaux, 3 séries de jours, 1 partage', rows.length === 7);
  ok('Discord sans adresse : « Bientôt », bouton inactif', /Discord/.test(rows[2]) && /Bientôt/.test(rows[2]) && await page.locator('.pkm-ple-row').nth(2).locator('button').isDisabled());
  ok('séries : 5 jours fait ✓, 15 jours « 3 / 15 jours » avec barre, 30 jours « 3 / 30 »', /Fait ✓/.test(rows[3]) && /3 \/ 15 jours/.test(rows[4]) && /3 \/ 30 jours/.test(rows[5]) && (await page.locator('.pkm-ple-row').nth(4).locator('.pkm-ple-bar').count()) === 1);
  const tk = page.locator('.pkm-ple-row').nth(0).locator('button');
  ok('TikTok : « Y aller », +100', /Y aller/.test(await tk.innerText()) && /\+100/.test(rows[0]));
  await tk.click(); await page.waitForTimeout(300);
  ok('TikTok : le réseau s’ouvre, puis « Valider »', (await page.evaluate(() => window.__opened[0])) === 'https://example.invalid/tiktok' && /Valider/.test(await tk.innerText()) && !(S.calls.pl_claim_social || []).length);
  await tk.click(); await page.waitForTimeout(900);
  ok('TikTok validé : demandé au serveur, « Fait », +100 PL', (S.calls.pl_claim_social || []).length === 1 && S.calls.pl_claim_social[0].net === 'tiktok' && /Fait/.test(await tk.innerText()) && /Mes PL de la saison 250/.test(N(await page.locator('section.pkm-ple-head').innerText())));
  // Partage avec capture.
  await page.locator('.pkm-ple-row').nth(6).locator('button').click(); await page.waitForTimeout(300);
  ok('partage : explication, choix du réseau et de la capture', (await page.locator('.pkm-ple-shot').count()) === 1 && (await page.locator('.pkm-ple-chip').count()) === 8 && await page.locator('.pkm-ple-shot button', { hasText: 'Envoyer ma capture' }).isDisabled());
  await page.locator('.pkm-ple-chip', { hasText: 'Instagram' }).click();
  const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 1600; c.height = 2400; const g = c.getContext('2d'); g.fillStyle = '#3366FF'; g.fillRect(0, 0, 1600, 2400); g.fillStyle = '#FFD60A'; g.fillRect(200, 300, 900, 600); return c.toDataURL('image/png').split(',')[1]; });
  await page.locator('#pkm-pl-file').setInputFiles({ name: 'capture.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.waitForTimeout(900);
  ok('capture réduite sur le téléphone et montrée en aperçu', (await page.locator('img.pkm-ple-prev').count()) === 1);
  await page.locator('.pkm-ple-shot').screenshot({ path: shot('pl-capture.png') });
  await page.locator('.pkm-ple-shot button', { hasText: 'Envoyer ma capture' }).click(); await page.waitForTimeout(1000);
  const dims = S.proof ? await page.evaluate(src => new Promise(r => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.src = src; }), S.proof.img) : [0, 0];
  ok('capture envoyée : réseau Instagram, JPEG de 1 080 px au plus (' + dims.join(' × ') + ', ' + Math.round(((S.proof || {}).img || '').length / 1024) + ' Ko)', !!S.proof && S.proof.net === 'instagram' && /^data:image\/jpeg;base64,/.test(S.proof.img) && Math.max(...dims) === 1080 && S.proof.img.length < 600000);
  ok('partage : « En attente » de validation', /En attente/.test(await page.locator('.pkm-ple-row').nth(6).innerText()) && (await page.locator('.pkm-ple-shot').count()) === 0);
  ok('règle : pas de PL contre une pub ni un avis', /Pas de PL contre un clic sur une publicité ni contre un avis sur les stores/.test(await page.locator('section[aria-label="Missions"]').innerText()));
  await page.locator('section[aria-label="Missions"]').screenshot({ path: shot('pl-missions.png') });
  await page.screenshot({ path: shot('pl-gagner.png') });
  // Onglet du classement : en PL.
  await page.locator('.pkm-pg-tabs button').nth(0).click(); await page.waitForTimeout(1200);
  const card = N(await page.locator('section.pkm-pg-card').innerText());
  ok('classement en PL : carte « PL de la saison », 14ᵉ, « Encore 4 places pour le top 10 »', /PL de la saison/.test(card) && /#14/.test(card) && /Encore 4 places pour le top 10/.test(card) && (await page.locator('section.pkm-pg-card img[src="img/brand/pl.svg"]').count()) === 2);
  ok('classement : chaque ligne en PL', /1 700 PL/.test(N(await page.locator('ol.pkm-pg-list').innerText())));
  await page.screenshot({ path: shot('pl-classement.png') });
  await ctx.close();
}

// C. Admin › « Défis à valider » : capture visible, validation demandée au serveur.
{
  const FAKE = 'http://127.0.0.1:59992', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
  const UID = 'u-adm', EMAIL = 'adm@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
  const S = { decide: [], rows: [{ id: 'p1', pseudo: 'Ondine', net: 'tiktok', created_at: new Date().toISOString(), season: 1, image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }] };
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    if (p === '/rest/v1/rpc/admin_pl_proofs') return send(200, S.rows);
    if (p === '/rest/v1/rpc/admin_pl_decide') { const b = JSON.parse(req.postData() || '{}'); S.decide.push(b); S.rows = S.rows.filter(r => r.id !== b.proof); return send(200, { ok: true, status: b.ok ? 'ok' : 'no', pl: b.ok ? 100 : 0 }); }
    if (p === '/rest/v1/rpc/game_state') return send(200, { pk: 0, pa: 0, pk_earned: 0, unlocked: [], unlimited: true, today: new Date().toISOString().slice(0, 10) });
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Admin', age_range: '25-35', starter: 25, role: 'admin', status: 'active' }]);
    if (p === '/rest/v1/rpc/pl_state') return send(404, { code: 'PGRST202' });
    return send(200, []);
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?start=home' + Q, { waitUntil: 'load' }); await page.waitForTimeout(500);
  await page.evaluate(([tok, uid, email]) => { const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1'); localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'admin' })); }, [TOKEN, UID, EMAIL]);
  await page.goto(E2E + '/?debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.setState({ admin: { on: true, hash: 'x', salt: 'y' }, cloudGame: Object.assign({}, window.__pkm.st().cloudGame || {}, { adminUntil: new Date(Date.now() + 864e5).toISOString() }), admSheet: true }));
  await page.waitForTimeout(900);
  const sec = page.locator('section.pkm-plp');
  ok('Admin : rubrique « Défis à valider » avec la capture d’Ondine (TikTok)', (await sec.count()) === 1 && /1 capture en attente/.test(await sec.innerText()) && /Ondine/.test(await sec.innerText()) && /TikTok/.test(await sec.innerText()) && (await sec.locator('img.pkm-plp-img').count()) === 1);
  await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: shot('pl-admin.png') });
  await sec.locator('button.pkm-plp-ok').click(); await page.waitForTimeout(700);
  ok('Admin : « Valider » envoyé au serveur, capture retirée de la liste', S.decide.length === 1 && S.decide[0].proof === 'p1' && S.decide[0].ok === true && (await sec.locator('li').count()) === 0);
  // « Mes missions » pour un admin quand 028 manque : aperçu avec le fichier à installer.
  await page.evaluate(() => window.__pkm.setState({ admSheet: false }));
  await page.goto(E2E + '/?start=progress&pgtab=earn&debug' + Q, { waitUntil: 'load' }); await page.waitForTimeout(2600);
  ok('sans 028, admin : « install_024_a_028.sql » à coller dans Studio', /install_024_a_028\.sql/.test(await page.locator('.pkm-ple-msg').innerText().catch(() => '')));
  await ctx.close();
}

ok('aucune erreur JavaScript', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
process.exit(res.some(l => l.startsWith('✗')) ? 1 : 0);
