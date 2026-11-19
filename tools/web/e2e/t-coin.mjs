// « Le coin des dresseurs » (2026-11-18, porteur) : 5ᵉ onglet entre « Toutes les séries » et le scan ; « Ma vitrine »
// (interface Échanges de Ma ligue + recherche des dresseurs, 034) ; « Le calendrier TCG » (2026-11-19 : la frise seule,
// en plein écran, avec les logos des extensions ; un appui sur une sortie ouvre sa fiche, un appui sur un logo l'enfonce,
// zoome dessus puis ouvre les items de l'extension). Le serveur est imité : jamais le vrai serveur.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c, why) => res.push((c ? '✓ ' : '✗ ') + l + (!c && why ? ' — ' + why : '')); const errors = [];
const N = t => String(t || '').replace(/\s+/g, ' ');
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex|pokepedia|pokebeach|pokemon-card/;
const FAKE = 'http://127.0.0.1:59992', Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const UID = 'u-coin', EMAIL = 'coin@exemple.fr', TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const PLAYERS = [
  { id: 'u-ond', pseudo: 'Ondine', avatar: { skin: 's2', hair: 'long', hc: 'roux', bg: 'holo', poke: 25 }, grade: 3, cards: 5, trade: 2, sale: 1 },
  { id: 'u-pie', pseudo: 'Pierre28', avatar: null, grade: 1, cards: 2, trade: 0, sale: 0 }
];

const setup = async (S, o) => {
  o = o || {};
  const ctx = await browser.newContext({ viewport: { width: o.w || 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(ABORT, r => r.abort());
  await ctx.route(FAKE + '/**', route => {
    const req = route.request(), p = new URL(req.url()).pathname, send = (st, j) => route.fulfill({ status: st, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
    const fn = p.replace('/rest/v1/rpc/', ''), body = JSON.parse(req.postData() || '{}');
    S.calls[fn] = (S.calls[fn] || []).concat([body]);
    if (fn === 'game_state') return send(200, { pk: 500, pa: 0, pk_earned: 500, unlocked: [], today: new Date().toISOString().slice(0, 10) });
    if (fn === 'player_search') {
      if (S.off34) return send(404, { code: 'PGRST202', message: 'not found' });
      const q = String(body.q || '').toLowerCase();
      return send(200, q ? PLAYERS.filter(x => x.pseudo.toLowerCase().indexOf(q) >= 0) : PLAYERS.filter(x => x.cards > 0));
    }
    if (fn === 'player_card') return send(200, { id: body.target, pseudo: body.target === UID ? 'Sacha' : 'Ondine', avatar: null, grade: 3, me: body.target === UID, since: '2026-11', season: { n: 1, rank: 4, pl: 1200, players: 40 }, past: [] });
    if (fn === 'player_showcase') return send(200, body.target === UID ? { me: true, items: [], wants: [] } : { me: false, has_for_me: 0, wants_mine: 0, wants: [], items: [
      { sid: 501, card_id: S.ids[0], lang: 'FR', cond: 'NM', grade: null, trade: true, sale: false, price_cents: null, deal: false }] });
    if (fn === 'trade_state') return send(200, { adult: false, age_ok: true, mine: [], demand: {}, supply: {} });
    if (fn === 'trade_matches') return send(200, []);
    if (fn === 'showcase_set' || fn === 'wants_set') return send(200, null);
    if (fn === 'quick_msg_state') return send(200, { unread: 0, left: 10, off: false });
    if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Sacha', age_range: '25-35', starter: 25, role: o.role || 'user', status: 'active' }]);
    if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
    return send(404, {});
  });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  const extra = (o.q || '') + Q;
  await page.goto(E2E + '/?debug' + extra, { waitUntil: 'load' }); await page.waitForTimeout(800);
  S.ids = await page.evaluate(() => window.__pkm.catalog().filter(p => p.type !== 'sealed' && p.img).slice(0, 3).map(p => p.id));
  await page.evaluate(([tok, uid, email, rl]) => {
    const d = JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; d.vit = {}; d.wants = [];
    localStorage.setItem('pkm-collection-v1', JSON.stringify(d)); localStorage.setItem('pkm-pky-asked', '1');
    localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: rl }));
  }, [TOKEN, UID, EMAIL, o.role || 'user']);
  await page.goto(E2E + '/?debug' + extra, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  return { ctx, page };
};
const newS = o => Object.assign({ calls: {}, ids: [] }, o || {});
const NAV = 'nav[aria-label="Navigation principale"]';

// A. Barre du bas : 6 colonnes, l'onglet entre « Toutes les séries » et le scan (donc avant « Jeux »).
{
  const S = newS();
  const { ctx, page } = await setup(S);
  const labels = await page.locator(NAV + ' > button').evaluateAll(b => b.map(x => x.getAttribute('aria-label')));
  ok('barre : 6 boutons, « Le coin des dresseurs » après « Toutes les séries » et avant le scan et « Jeux » (' + labels.join(' | ') + ')',
    labels.length === 6 && labels[1] === 'Toutes les séries' && labels[2] === 'Le coin des dresseurs' && /Scanner/.test(labels[3]));
  const vis = await page.locator(NAV + ' .pkm-coin-ico').evaluateAll(a => a.map(s => getComputedStyle(s).display !== 'none'));
  ok('logo par défaut : « Dresseurs » (1 sur 4 visible)', vis.length === 4 && vis[0] && vis.filter(Boolean).length === 1);
  const fits = await page.locator(NAV + ' > button').evaluateAll(b => b.every(x => { const r = x.getBoundingClientRect(); return r.width > 30 && r.right <= window.innerWidth; }));
  ok('barre : tous les boutons dans l’écran', fits);
  // Disposition (2026-11-19) : 2 icônes à gauche, scan au centre au-dessus de la barre et « Le coin des dresseurs » juste
  // en dessous (même axe), 2 icônes à droite ; forme « Dôme » par défaut.
  const geo = await page.evaluate(() => { const n = document.querySelector('nav[aria-label="Navigation principale"]'), b = e => n.querySelector(`button[aria-label${e}]`), r = e => b(e).getBoundingClientRect(), nr = n.getBoundingClientRect();
    const ico = e => { const v = [...b(e).querySelectorAll(':scope > svg')].find(x => getComputedStyle(x).display !== 'none'); return v.getBoundingClientRect(); };
    const c = x => x.left + x.width / 2, sc = r('^="Scanner"'), co = r('="Le coin des dresseurs"'), se = r('="Toutes les séries"'), je = r('="Jeux"'), ac = r('="Accueil"'), pk = r('="PK shop"');
    const icons = ['="Accueil"', '="Toutes les séries"', '="Le coin des dresseurs"', '="Jeux"', '="PK shop"'].map(ico), mids = icons.map(x => x.top + x.height / 2), sizes = icons.map((x, i) => i === 3 ? x.height - 2 : x.height);
    const dome = n.querySelector('.pkm-navdeco .pkm-nds.pkm-nd-1');
    return { mid: Math.abs(c(sc) - (nr.left + nr.width / 2)), axis: Math.abs(c(sc) - c(co)), below: icons[2].top >= sc.bottom + 2, raised: nr.top - sc.top, inBar: sc.bottom > nr.top + 4,
      line: Math.max(...mids) - Math.min(...mids), size: Math.max(...sizes) - Math.min(...sizes), ico: sizes[0], bottom: innerHeight - nr.bottom,
      order: ac.right <= se.left + 1 && se.right <= co.left + 1 && co.right <= je.left + 1 && je.right <= pk.left + 1, dome: !!dome && getComputedStyle(dome).display === 'block', vis: document.documentElement.dataset.navvis }; });
  ok('barre : scan au centre (' + geo.mid.toFixed(1) + ' px), « Le coin des dresseurs » juste en dessous et sur le même axe (' + geo.axis.toFixed(1) + ' px)', geo.mid < 2 && geo.axis < 2 && geo.below);
  ok('barre : Accueil, Toutes les séries | scan | Jeux, PK shop', geo.order);
  ok('barre : les 5 petites icônes sur la même ligne (écart ' + geo.line.toFixed(1) + ' px) et de la même taille (' + geo.ico + ' px)', geo.line < 1 && geo.size < 1 && geo.ico === 25);
  ok('barre : scan plus haut que la barre (' + geo.raised.toFixed(0) + ' px) mais toujours posé dessus ; barre à ' + geo.bottom.toFixed(0) + ' px du bas', geo.raised >= 38 && geo.inBar && Math.round(geo.bottom) === 8);
  ok('barre : forme « Dôme » par défaut (?navvis=1)', geo.vis === '1' && geo.dome);
  await page.click(NAV + ' button[aria-label="Le coin des dresseurs"]'); await page.waitForTimeout(900);
  const tabSt = [await page.evaluate(() => window.__pkm.st().screen), await page.locator(NAV + ' button[aria-label="Le coin des dresseurs"]').getAttribute('aria-current'), N(await page.locator('h1, h2').first().innerText())];
  ok('onglet : écran « Le coin des dresseurs » ouvert, bouton allumé (' + tabSt.join(' | ') + ')', tabSt[0] === 'coin' && tabSt[1] === 'page' && /Le coin des dresseurs/.test(tabSt[2]));
  const tabs = await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button').allInnerTexts();
  ok('2 sous-rubriques : « Ma vitrine » et « Le calendrier TCG »', tabs.length === 2 && /Ma vitrine/.test(tabs[0]) && /calendrier TCG/.test(tabs[1]));

  // B. Ma vitrine : même interface que l'onglet Échanges, recherche, vitrines des dresseurs.
  ok('Ma vitrine : sections « Mes cartes Pour trade et à vendre », « Je cherche », « Échanges possibles » (interface Échanges)',
    (await page.locator('section[aria-label="Mes cartes Pour trade et à vendre"]').count()) === 1 && (await page.locator('section[aria-label="Je cherche"]').count()) === 1
    && (await page.locator('section[aria-label="Échanges possibles"]').count()) === 1);
  ok('vitrines des dresseurs : chargées sans recherche (player_search vide)', (S.calls.player_search || []).some(b => b.q === '')
    && /Ondine/.test(await page.locator('section[aria-label="Vitrines des dresseurs"]').innerText()));
  await page.fill('input[aria-label="Pseudo du dresseur"]', 'ond'); await page.waitForTimeout(900);
  ok('recherche : serveur interrogé avec « ond »', (S.calls.player_search || []).some(b => b.q === 'ond'));
  const found = N(await page.locator('section[aria-label="Rechercher un dresseur"]').innerText());
  ok('recherche : « 1 dresseur trouvé », Ondine, 5 cartes, 2 Pour trade, 1 à vendre (' + found.slice(0, 120) + ')', /1 dresseur trouvé/.test(found) && /Ondine/.test(found) && /5 cartes en vitrine/.test(found) && /2 Pour trade/.test(found) && /1 à vendre/.test(found));
  await page.screenshot({ path: shot('coin-vitrine.png') });
  await page.locator('section[aria-label="Rechercher un dresseur"] button.pkm-coin-row').first().click(); await page.waitForTimeout(1200);
  const card = N(await page.locator('body').innerText());
  ok('un dresseur trouvé ouvre sa carte de dresseur avec « Sa vitrine »', (S.calls.player_showcase || []).some(b => b.target === 'u-ond') && /Sa vitrine/.test(card));
  await page.screenshot({ path: shot('coin-carte-dresseur.png') });
  await page.evaluate(() => window.__pkm.setState({ pcCard: null, pcVit: null })); await page.waitForTimeout(300);
  await page.fill('input[aria-label="Pseudo du dresseur"]', 'zzz'); await page.waitForTimeout(900);
  ok('recherche sans résultat : « Aucun dresseur ne s’appelle »', /Aucun dresseur ne s’appelle « zzz »/.test(await page.locator('section[aria-label="Rechercher un dresseur"]').innerText()));
  await page.click('button[aria-label="Effacer la recherche"]'); await page.waitForTimeout(300);
  ok('effacer : champ vide, plus de résultats', (await page.inputValue('input[aria-label="Pseudo du dresseur"]')) === '' && (await page.locator('section[aria-label="Rechercher un dresseur"] .pkm-coin-row').count()) === 0);
  await page.click('button.pkm-coin-mine'); await page.waitForTimeout(1000);
  ok('« Voir ma vitrine » : ma carte de dresseur, « Ma vitrine »', (S.calls.player_showcase || []).some(b => b.target === UID) && /Ma vitrine/.test(N(await page.locator('body').innerText())));
  await page.evaluate(() => window.__pkm.setState({ pcCard: null, pcVit: null })); await page.waitForTimeout(300);

  // C. Le calendrier TCG : la frise seule, en plein écran (2026-11-19, porteur : « je veux juste la chronologie qui prenne
  // tout l'écran »), une fiche au toucher d'une sortie, l'appui puis le zoom et les items d'une extension.
  await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button').nth(1).click(); await page.waitForTimeout(1500);
  const hero = page.locator('section[aria-label="Frise du JCC Pokémon"]');
  ok('frise : mois et repère « Aujourd’hui »', (await hero.count()) === 1 && (await page.locator('.pkm-cal-m').count()) > 12
    && (await page.locator('.pkm-cal-m-now .pkm-cal-now').count()) === 1);
  const full = await page.evaluate(() => {
    const m = document.querySelector('main'), h = document.querySelector('section[aria-label="Frise du JCC Pokémon"]').getBoundingClientRect();
    const sc = document.querySelector('button[aria-label^="Scanner"]').getBoundingClientRect();
    return { ratio: h.height / innerHeight, bottom: h.bottom, dome: sc.top, scroll: m.scrollHeight - m.clientHeight,
      gone: ['Les blocs du JCC', 'Sorties et annonces', 'News Pokémon', 'Légende de la frise'].filter(l => document.querySelector('section[aria-label="' + l + '"]')),
      list: document.querySelectorAll('main .pkm-cal-item').length };
  });
  ok('la frise remplit l’écran (' + Math.round(full.ratio * 100) + ' %), jusqu’au-dessus du scan, rien ne défile', full.ratio > 0.55 && full.bottom <= full.dome && full.dome - full.bottom < 30 && full.scroll <= 1, JSON.stringify(full));
  ok('plus rien sous la frise : blocs, liste des sorties, légende et News retirés', full.gone.length === 0 && full.list === 0, JSON.stringify(full));
  const fz = await page.evaluate(() => {
    const logos = [...document.querySelectorAll('.pkm-cal-dot-logo')];
    const now = document.querySelector('.pkm-cal-m-now'), ax = now.querySelector('.pkm-cal-axis').getBoundingClientRect(), tr = now.querySelector('.pkm-cal-track').getBoundingClientRect();
    return { logos: logos.length, imgs: logos.filter(b => b.querySelector('.pkm-cal-dlogo img')).length, tile: logos.length ? logos[0].getBoundingClientRect().width : 0,
      aria: logos.map(b => b.getAttribute('aria-label')), up: document.querySelectorAll('.pkm-cal-dots-up.pkm-cal-dots-on').length,
      down: document.querySelectorAll('.pkm-cal-dots-down.pkm-cal-dots-on').length, axisAbove: ax.bottom <= tr.top,
      chips: [...document.querySelectorAll('.pkm-cal-dot:not(.pkm-cal-dot-logo)')].map(b => b.textContent.trim()) };
  });
  ok('frise : le logo de chaque extension du catalogue (' + fz.logos + '), Règne Delta compris, en grand (' + Math.round(fz.tile) + ' px)', fz.logos >= 10 && fz.imgs === fz.logos && fz.tile >= 96 && fz.aria.some(a => /^Règne Delta,.*Voir les items/.test(a)), JSON.stringify(fz.aria));
  ok('frise : sorties sans extension au catalogue gardées en sigle (Japon, rumeurs)', fz.chips.indexOf('M7') >= 0 && fz.chips.indexOf('ex★') >= 0, fz.chips.join(','));
  ok('frise : mois en haut, sorties en alternance au-dessus et au-dessous de la ligne', fz.axisAbove && fz.up >= 5 && fz.down >= 5, JSON.stringify(fz));
  const room = await page.evaluate(() => Math.min(...[...document.querySelectorAll('.pkm-cal-dots-on')].map(d => { const r = d.getBoundingClientRect(), pl = d.parentElement.getBoundingClientRect(); return Math.min(r.top - pl.top, pl.bottom - r.bottom); })));
  ok('frise : logos et sigles tiennent dans la hauteur (marge ' + Math.round(room) + ' px)', room >= 0);
  await page.screenshot({ path: shot('coin-calendrier.png') });

  // Fiche d'une prochaine sortie : ce que montrait la liste retirée (date, nom, statut, type, sigle, cartes vedettes, explication, source).
  const sheet = page.locator('section.pkm-cal-sheet[role="dialog"]');
  await page.locator('.pkm-cal-dot:not(.pkm-cal-dot-logo)', { hasText: /^M7$/ }).first().evaluate(b => b.click()); await page.waitForTimeout(700);
  const m7 = (await sheet.count()) === 1 ? N(await sheet.innerText()) : '';
  ok('appui sur « M7 » : sa fiche monte du bas (Aura Seeker, Annonce Japon, date, source)', /Prochaine sortie/.test(m7) && /Aura Seeker/.test(m7) && /Annonce Japon/.test(m7)
    && (await sheet.locator('.pkm-cal-when').count()) === 1 && (await sheet.locator('.pkm-cal-src').count()) === 1, m7.slice(0, 300));
  const cover = await page.evaluate(() => { const s = document.querySelector('.pkm-cal-sheet').getBoundingClientRect(), n = document.querySelector('nav[aria-label="Navigation principale"]').getBoundingClientRect(); const e = document.elementFromPoint(innerWidth / 2, n.top + 20); return { bottom: Math.round(s.bottom), sheet: !!(e && e.closest('.pkm-cal-sheet')) }; });
  ok('la fiche passe au-dessus de la barre du bas', cover.sheet && cover.bottom >= 840, JSON.stringify(cover));
  await page.screenshot({ path: shot('coin-calendrier-fiche.png') });
  await sheet.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(800);
  ok('« Fermer » : la fiche redescend et disparaît', (await sheet.count()) === 0 && (await page.evaluate(() => window.__pkm.st().calSel)) == null);
  await page.locator('.pkm-cal-dot:not(.pkm-cal-dot-logo)', { hasText: /^ex★$/ }).last().evaluate(b => b.click()); await page.waitForTimeout(700);
  const exs = (await sheet.count()) === 1 ? N(await sheet.innerText()) : '';
  ok('appui sur « ex★ » : Entei, Raikou, Suicune, rumeur, estimation', /Entei, Raikou, Suicune/.test(exs) && /Rumeur/.test(exs) && /Estimation/.test(exs), exs.slice(0, 300));
  await page.locator('button.pkm-cal-ov-bg').click({ position: { x: 20, y: 20 } }); await page.waitForTimeout(800);
  ok('appui hors de la fiche : elle se ferme', (await sheet.count()) === 0);

  // Appui marqué sur le logo, puis zoom sur l'extension, puis ses items.
  await page.evaluate(() => { const w = document.querySelector('.pkm-cal-strip'); w.style.scrollBehavior = 'auto'; w.scrollLeft = 140; w.style.scrollBehavior = ''; });
  const x0 = await page.evaluate(() => document.querySelector('.pkm-cal-strip').scrollLeft);
  await page.locator('.pkm-cal-dot-logo[aria-label^="Règne Delta"]').evaluate(b => b.click()); await page.waitForTimeout(110);
  const press = await page.evaluate(() => { const b = document.querySelector('.pkm-cal-dot-logo[aria-label^="Règne Delta"]'), t = getComputedStyle(b).transform; const k = t && t !== 'none' ? +t.split('(')[1].split(',')[0] : 1; return { k: k, glow: /255, 214, 10/.test(getComputedStyle(b).boxShadow), zoom: !!document.querySelector('.pkm-calz') }; });
  ok('appui sur le logo : il s’enfonce et s’allume avant le zoom (×' + press.k.toFixed(2) + ')', press.k < 0.97 && press.glow && !press.zoom, JSON.stringify(press));
  await page.waitForTimeout(800);
  const mid = await page.evaluate(() => { const z = document.querySelector('.pkm-calz'), l = z && z.querySelector('.pkm-calz-logo').getBoundingClientRect(); return { on: !!z, w: l ? l.width : 0, cx: l ? l.left + l.width / 2 : 0, t: z ? z.innerText : '' }; });
  ok('puis zoom au centre de l’écran (' + Math.round(mid.w) + ' px)', mid.on && mid.w > 200 && Math.abs(mid.cx - 195) < 4 && /Règne Delta/.test(mid.t) && /Items de l’extension/i.test(mid.t), JSON.stringify(mid));
  await page.screenshot({ path: shot('coin-calendrier-zoom.png') });
  await page.waitForTimeout(1100);
  const after = await page.evaluate(() => { const s = window.__pkm.st(); return { screen: s.screen, setId: s.setId, f: s.setFilter, over: !!document.querySelector('.pkm-calz'), items: [...document.querySelectorAll('button')].some(b => /^Items \(\d+\)$/.test(b.textContent.trim())) }; });
  ok('puis l’extension s’ouvre sur ses items (onglet « Items »), le zoom disparaît', after.screen === 'set' && after.setId === 'me06' && after.f === 'items' && after.items && !after.over, JSON.stringify(after));
  await page.screenshot({ path: shot('coin-calendrier-items.png') });
  await page.evaluate(() => window.__pkm.pop()); await page.waitForTimeout(1200);
  const x1 = await page.evaluate(() => { const w = document.querySelector('.pkm-cal-strip'); return w ? w.scrollLeft : -1; });
  ok('retour : la frise reprend là où elle était (' + Math.round(x0) + ' → ' + Math.round(x1) + ')', await page.evaluate(() => window.__pkm.st().screen) === 'coin' && Math.abs(x1 - x0) <= 2);
  await ctx.close();
}

// D. Petit écran (320 px) : pas de débordement ; logo 3 avec ?coinvis=3 ; serveur sans 034 (admin).
{
  const S = newS({ off34: true });
  const { ctx, page } = await setup(S, { w: 320, q: '&coinvis=3&navvis=3', role: 'admin' });
  const nv = await page.evaluate(() => { const shown = [...document.querySelectorAll('.pkm-navdeco .pkm-nds')].filter(e => getComputedStyle(e).display === 'block').map(e => e.getAttribute('class')); const sc = document.querySelector('button[aria-label^="Scanner"]'), co = document.querySelector('button[aria-label="Le coin des dresseurs"]').getBoundingClientRect(); return { shown, rad: parseFloat(getComputedStyle(sc).borderTopLeftRadius), fits: co.left >= 0 && co.right <= innerWidth && sc.getBoundingClientRect().right <= innerWidth }; });
  ok('?navvis=3 : forme « Socle » seule, scan en carré arrondi, tout dans l’écran à 320 px', nv.shown.length === 1 && /pkm-nd-3/.test(nv.shown[0]) && nv.rad < 25 && nv.fits);
  const vis = await page.locator(NAV + ' .pkm-coin-ico').evaluateAll(a => a.map(s => getComputedStyle(s).display !== 'none'));
  ok('?coinvis=3 : logo « Bulle » seul visible', vis[2] && vis.filter(Boolean).length === 1);
  await page.click(NAV + ' button[aria-label="Le coin des dresseurs"]'); await page.waitForTimeout(1200);
  const over = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollWidth - m.clientWidth : 99; });
  ok('320 px : aucun débordement horizontal (' + over + ')', over <= 1);
  ok('serveur sans 034 : l’admin voit le fichier à installer', /install_024_a_034\.sql/.test(await page.locator('section[aria-label="Vitrines des dresseurs"]').innerText()));
  await page.screenshot({ path: shot('coin-320.png') });
  await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button').nth(1).click(); await page.waitForTimeout(1500);
  const over2 = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollWidth - m.clientWidth : 99; });
  ok('calendrier à 320 px : aucun débordement horizontal (' + over2 + ')', over2 <= 1);
  await page.screenshot({ path: shot('coin-calendrier-320.png') });
  await ctx.close();
}

await browser.close();
ok('aucune erreur de page (' + errors.slice(0, 3).join(' | ') + ')', errors.length === 0);
console.log(res.join('\n'));
const bad = res.filter(r => r.startsWith('✗')).length;
console.log(bad ? bad + ' échec(s)' : 'OK : ' + res.length + ' vérifications');
process.exit(bad ? 1 : 0);
