// « Le coin des dresseurs » (2026-11-18, porteur) : 5ᵉ onglet entre « Toutes les séries » et le scan ; « Ma ligue » en 1ʳᵉ bulle
// (2026-11-21) ; « Ma vitrine »
// (interface Échanges de Ma ligue + recherche des dresseurs, 034) ; « Le calendrier JCC » (2026-11-19 : la frise seule,
// en plein écran, avec les logos des extensions ; un appui sur une sortie ouvre sa fiche, un appui sur un logo l'enfonce,
// zoome dessus puis ouvre la page de l'extension, onglets « Cartes » et « Items »). Le serveur est imité : jamais le vrai serveur.
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
  // Calendrier JCC réservé au DropiPass (2026-11-20) : abonnement simulé (premForced, test seulement).
  await ctx.addInitScript(() => { try { localStorage.setItem('pkm-premium-force', '1'); } catch (e) { /* rien */ } });
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
    if (fn === 'showcase_offers') {
      if (S.off38) return send(404, { code: 'PGRST202', message: 'not found' });
      return send(200, (body.ids || []).indexOf('ex11-111') >= 0 ? [{ sid: 777, card_id: 'ex11-111', lang: 'FR', cond: 'EX', grade: null, trade: false, sale: true, price_cents: 45000, deal: false,
        owner: { id: 'u-ond', pseudo: 'Ondine', avatar: null, grade: 3 } }] : []);
    }
    if (fn === 'trade_send') return send(200, { ok: true, id: 9, left: 9 });
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
// Date figée au 19 novembre 2026 : le compte à rebours et les rappels du calendrier ne dépendent pas du jour du test.
{
  const S = newS();
  const { ctx, page } = await setup(S, { q: '&today=2026-11-19' });
  const labels = await page.locator(NAV + ' > button').evaluateAll(b => b.map(x => x.getAttribute('aria-label')));
  ok('barre : 6 boutons, « Le coin des dresseurs » après « Toutes les séries » et avant le scan et « Jeux » (' + labels.join(' | ') + ')',
    labels.length === 6 && labels[1] === 'Toutes les séries' && labels[2] === 'Le coin des dresseurs' && /Scanner/.test(labels[3]));
  const vis = await page.locator(NAV + ' .pkm-coin-ico').evaluateAll(a => a.map(s => getComputedStyle(s).display !== 'none'));
  ok('logo par défaut : « Dresseurs qui discutent » (n° 11 choisi par le porteur le 2026-11-20, 1 sur 12 visible)', vis.length === 12 && vis[10] && vis.filter(Boolean).length === 1);
  // « Toutes les séries » : la 2 (cartes en éventail, sans marque au milieu), choisie par le porteur le 2026-11-20.
  const ser = await page.locator(NAV + ' .pkm-ser-ico').evaluateAll(a => a.filter(s => getComputedStyle(s).display !== 'none').map(s => s.getAttribute('class') + '|' + s.querySelectorAll('path').length));
  ok('icône « Toutes les séries » par défaut : cartes en éventail sans marque (' + ser.join(', ') + ')', ser.length === 1 && /pkm-ser-ico-2\|0$/.test(ser[0]));
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
  // « Parrainer un ami » (t-parrain.mjs) et « Ma ligue », en 1ʳᵉ position, ajoutés le 2026-11-21 (porteur).
  ok('4 sous-rubriques : « Ma ligue », « Ma vitrine », « Parrainer un ami » et « Calendrier JCC »', tabs.length === 4 && /Ma ligue/.test(tabs[0]) && /Ma vitrine/.test(tabs[1]) && /Parrainer un ami/.test(tabs[2]) && /Calendrier JCC/.test(tabs[3]));
  // Logos en couleur et à la même hauteur (2026-11-21, porteur : « les 4 logos en couleur », « Calendrier JCC » pour
  // descendre son logo, trop haut quand le nom tenait sur 3 lignes).
  const icos = await page.evaluate(() => [...document.querySelectorAll('[aria-label="Le coin des dresseurs"][role="tablist"] button')].map(b => {
    const i = b.querySelector('img.pkm-coin-tab-img'), r = i ? i.getBoundingClientRect() : null, br = b.getBoundingClientRect(), sp = b.querySelector('span');
    return { src: i ? i.getAttribute('src') : '', top: r ? Math.round(r.top - br.top) : -1, ok: !!i && i.complete && i.naturalWidth > 0, lines: sp ? Math.round(sp.scrollHeight / parseFloat(getComputedStyle(sp).lineHeight)) : 0 }; }));
  ok('4 logos en couleur (coupe, petit magasin, cadeau, calendrier), tous chargés (' + icos.map(x => x.src.replace('img/brand/', '')).join(', ') + ')',
    icos.map(x => x.src).join() === 'img/brand/coin-ligue.svg,img/brand/vitrine.svg,img/brand/coin-parrain.svg,img/brand/coin-calendrier.svg' && icos.every(x => x.ok)
    && (await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] svg.pkm-coin-tab-ico').count()) === 0);
  ok('logos à la même hauteur dans les 4 bulles (' + icos.map(x => x.top).join(', ') + ' px)', icos.every(x => x.top === icos[0].top && x.top >= 4 && x.top <= 10));
  ok('« Calendrier JCC » sur 2 lignes au plus', icos[3].lines <= 2);
  ok('ouverture sur « Ma ligue » (classement de la saison)', /Ma ligue/.test(await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button[aria-selected="true"]').innerText()) && (await page.locator('section.pkm-pg-season').count()) === 1);
  await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button', { hasText: 'Ma vitrine' }).click(); await page.waitForTimeout(1200);

  // B. Ma vitrine : même interface que l'onglet Échanges, « Mes messages », une seule recherche « une carte ou un
  // dresseur » (2026-11-21, porteur) ; « Voir ma vitrine » et « Vitrines des dresseurs » retirés.
  ok('Ma vitrine : sections « Mes cartes Pour trade et à vendre », « Je cherche », « Échanges possibles » (interface Échanges)',
    (await page.locator('section[aria-label="Mes cartes Pour trade et à vendre"]').count()) === 1 && (await page.locator('section[aria-label="Je cherche"]').count()) === 1
    && (await page.locator('section[aria-label="Échanges possibles"]').count()) === 1);
  ok('Ma vitrine : plus de « Voir ma vitrine » ni de « Vitrines des dresseurs »', (await page.locator('button.pkm-coin-mine').count()) === 0
    && (await page.locator('section[aria-label="Vitrines des dresseurs"]').count()) === 0 && !(S.calls.player_search || []).some(b => b.q === ''));
  // « Mes messages » : par l'enveloppe de l'en-tête (2026-11-21, porteur : « enlève l'onglet Mes messages juste en dessous des 4 bulles »).
  ok('Ma vitrine : plus de bouton « Mes messages » sous les 4 bulles ; enveloppe dans l’en-tête', (await page.locator('button.pkm-qm-open').count()) === 0 && (await page.locator('button.pkm-hh-mail').count()) === 1);
  ok('bulle « Ma vitrine » : le petit magasin de l’animation de la vitrine', (await page.locator('[role="tablist"] button', { hasText: 'Ma vitrine' }).locator('img[src*="brand/vitrine.svg"]').count()) === 1);
  const IN = 'input[aria-label="Recherche une carte ou un dresseur"]', FS = 'section[aria-label="Rechercher une carte ou un dresseur"]';
  ok('barre « Recherche une carte ou un dresseur… »', (await page.getAttribute(IN, 'placeholder')) === 'Recherche une carte ou un dresseur…');
  // Sans saisie automatique (2026-11-21, porteur) : ni correction, ni majuscule, ni suggestions du navigateur.
  const ia = await page.evaluate(q => { const i = document.querySelector(q); return ['autocomplete', 'autocorrect', 'autocapitalize', 'spellcheck'].map(a => i.getAttribute(a)).join(','); }, IN);
  ok('recherche sans saisie automatique (' + ia + ')', ia === 'off,off,off,false');
  await page.fill(IN, 'ond'); await page.waitForTimeout(900);
  ok('recherche : serveur interrogé avec « ond »', (S.calls.player_search || []).some(b => b.q === 'ond'));
  const found = N(await page.locator(FS).innerText());
  ok('recherche : « 1 dresseur trouvé », Ondine, 5 cartes, 2 Pour trade, 1 à vendre (' + found.slice(0, 120) + ')', /1 dresseur trouvé/i.test(found) && /Ondine/.test(found) && /5 cartes en vitrine/.test(found) && /2 Pour trade/.test(found) && /1 à vendre/.test(found));
  await page.locator(FS + ' button.pkm-coin-row').first().click(); await page.waitForTimeout(1200);
  const card = N(await page.locator('body').innerText());
  ok('un dresseur trouvé ouvre sa carte de dresseur avec « Sa vitrine »', (S.calls.player_showcase || []).some(b => b.target === 'u-ond') && /Sa vitrine/.test(card));
  await page.screenshot({ path: shot('coin-carte-dresseur.png') });
  await page.evaluate(() => window.__pkm.setState({ pcCard: null, pcVit: null })); await page.waitForTimeout(300);
  // Une carte : « Groudon star » trouve Groudon ☆ (ex11-111) et le dresseur qui le propose.
  await page.fill(IN, 'groudon star'); await page.waitForTimeout(1100);
  const sent = (S.calls.showcase_offers || []).slice(-1)[0] || {};
  ok('carte : identifiants du catalogue envoyés au serveur, Groudon ☆ en tête (' + (sent.ids || []).slice(0, 3).join(', ') + ')', Array.isArray(sent.ids) && sent.ids[0] === 'ex11-111');
  const fc = N(await page.locator(FS).innerText());
  ok('carte : « 1 carte proposée », Groudon ☆, À VENDRE · 450 €, par Ondine, sans « Aucun dresseur » (' + fc.slice(0, 160) + ')', /1 carte proposée/i.test(fc) && !/Aucun dresseur/.test(fc) && /Groudon ☆/.test(fc) && /À VENDRE · 450 €/.test(fc) && /Ondine/.test(fc));
  await page.screenshot({ path: shot('coin-recherche-carte.png') });
  await page.locator(FS + ' button.pkm-coin-offer').first().click(); await page.waitForTimeout(900);
  const TS = page.locator('section.pkm-vt-sheet'), tst = N(await TS.innerText().catch(() => ''));
  ok('carte : la fiche d’échange s’ouvre (« Carte de Ondine », « Je suis intéressé (450 €) », rendez-vous Discord annoncé)', (await TS.count()) === 1 && /Carte de Ondine/.test(tst) && /Je suis intéressé \(450 €\)/.test(tst) && /Discord Dropicards/.test(tst));
  ok('carte : lien « Voir la carte de dresseur de Ondine »', (await TS.locator('button', { hasText: 'Voir la carte de dresseur de Ondine' }).count()) === 1);
  await TS.locator('button', { hasText: 'Je suis intéressé (450 €)' }).click(); await page.waitForTimeout(800);
  ok('carte : mise en relation (trade_send : intéressé, exemplaire 777, Ondine)', (S.calls.trade_send || []).length === 1 && S.calls.trade_send[0].kind === 'interest' && S.calls.trade_send[0].card_sid === 777 && S.calls.trade_send[0].target === 'u-ond');
  await page.fill(IN, 'pikachu'); await page.waitForTimeout(1100);
  ok('carte que personne ne propose : « Personne ne propose « pikachu » pour l’instant »', /Personne ne propose « pikachu » pour l’instant/.test(N(await page.locator(FS).innerText())));
  await page.fill(IN, 'zzz'); await page.waitForTimeout(900);
  const fz0 = N(await page.locator(FS).innerText());
  ok('recherche sans résultat : « Aucun dresseur ne s’appelle », aucune partie « cartes »', /Aucun dresseur ne s’appelle « zzz »/.test(fz0) && !/carte proposée|Cartes proposées/.test(fz0));
  await page.click('button[aria-label="Effacer la recherche"]'); await page.waitForTimeout(300);
  ok('effacer : champ vide, plus de résultats', (await page.inputValue(IN)) === '' && (await page.locator(FS + ' .pkm-coin-row, ' + FS + ' .pkm-coin-offer').count()) === 0);

  // C. Le calendrier JCC : la frise seule, en plein écran (2026-11-19, porteur : « je veux juste la chronologie qui prenne
  // tout l'écran »), une fiche au toucher d'une sortie, l'appui puis le zoom et les items d'une extension.
  await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button', { hasText: 'calendrier JCC' }).click(); await page.waitForTimeout(1500);
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
      chips: [...document.querySelectorAll('.pkm-cal-dot:not(.pkm-cal-dot-logo) .pkm-cal-dcode')].map(b => b.textContent.trim()) };
  });
  ok('frise : le logo de chaque extension du catalogue (' + fz.logos + '), Règne Delta compris, en grand (' + Math.round(fz.tile) + ' px)', fz.logos >= 10 && fz.imgs === fz.logos && fz.tile >= 96 && fz.aria.some(a => /^Règne Delta,.*Voir l’extension/.test(a)), JSON.stringify(fz.aria));
  ok('frise : sorties sans extension au catalogue gardées en sigle (Japon, rumeurs)', fz.chips.indexOf('M7') >= 0 && fz.chips.indexOf('ex★') >= 0, fz.chips.join(','));
  ok('frise : mois en haut, sorties en alternance au-dessus et au-dessous de la ligne', fz.axisAbove && fz.up >= 5 && fz.down >= 5, JSON.stringify(fz));
  const room = await page.evaluate(() => Math.min(...[...document.querySelectorAll('.pkm-cal-dots-on')].map(d => { const r = d.getBoundingClientRect(), pl = d.parentElement.getBoundingClientRect(); return Math.min(r.top - pl.top, pl.bottom - r.bottom); })));
  ok('frise : logos et sigles tiennent dans la hauteur (marge ' + Math.round(room) + ' px)', room >= 0);
  const line = await page.evaluate(() => { const tops = [...document.querySelectorAll('.pkm-cal-track')].map(t => t.getBoundingClientRect().top); return { n: tops.length, spread: Math.max(...tops) - Math.min(...tops) }; });
  ok('ligne du temps parfaitement droite (' + line.n + ' mois, écart ' + line.spread.toFixed(2) + ' px)', line.n > 12 && line.spread < 0.01, JSON.stringify(line));
  // Toute l'histoire depuis le Set de Base (2026-11-20, porteur) : la frise commence par sa sortie en France, les vieux mois
  // sans sortie sont de fines tranches (l'année en janvier), et elle s'ouvre toujours sur le mois en cours.
  const hist = await page.evaluate(() => {
    const w = document.querySelector('.pkm-cal-strip'), logos = [...document.querySelectorAll('.pkm-cal-dot-logo')], first = logos[0];
    const firstM = first && first.closest('.pkm-cal-m'), thin = [...document.querySelectorAll('.pkm-cal-m-thin')];
    const now = document.querySelector('.pkm-cal-m-now').getBoundingClientRect(), wr = w.getBoundingClientRect();
    return { first: first ? first.getAttribute('aria-label') : '', firstYear: firstM ? (firstM.querySelector('.pkm-cal-year') || {}).textContent : '', logos: logos.length,
      thin: thin.length, thinW: thin.length ? Math.max(...thin.map(m => m.getBoundingClientRect().width)) : 0,
      jan: [...document.querySelectorAll('.pkm-cal-m-jan .pkm-cal-year')].map(e => e.textContent).slice(0, 3), nowIn: now.left >= wr.left && now.right <= wr.right };
  });
  ok('la frise remonte au Set de Base (« ' + (hist.first || '').split(',').slice(0, 2).join(',') + ' »), ' + hist.logos + ' extensions', /^Set de Base, /.test(hist.first) && /^(1999|2000)$/.test(hist.firstYear) && hist.logos >= 100, JSON.stringify(hist));
  ok('années anciennes resserrées : ' + hist.thin + ' mois sans sortie en fines tranches, années ' + hist.jan.join(', ') + '…', hist.thin > 100 && hist.thinW <= 16.5 && hist.jan.length === 3 && /^(2000|2001)$/.test(hist.jan[0]), JSON.stringify(hist));
  ok('la frise s’ouvre toujours sur le mois en cours', hist.nowIn);
  // Blocs de séries (2026-11-20, porteur) : une bande par série, dans l'ordre, l'étiquette collée à gauche pendant qu'on la parcourt.
  const blocs = await page.evaluate(() => {
    const list = [...document.querySelectorAll('.pkm-cal-bloc')].map(b => ({ name: (b.querySelector('.pkm-cal-bloc-tag b') || {}).textContent || '', n: b.querySelectorAll('.pkm-cal-dot-logo').length,
      now: b.classList.contains('pkm-cal-bloc-now'), names: [...b.querySelectorAll('.pkm-cal-dot-logo')].map(t => t.getAttribute('aria-label').split(',')[0]) }));
    const w = document.querySelector('.pkm-cal-strip'), b = document.querySelector('.pkm-cal-bloc[aria-label="Bloc Écarlate et Violet"]');
    w.style.scrollBehavior = 'auto'; w.scrollLeft = b.offsetLeft - w.offsetLeft + 600;
    const tag = b.querySelector('.pkm-cal-bloc-tag').getBoundingClientRect(), wr = w.getBoundingClientRect();
    return { list: list.map(x => x.name + ':' + x.n), me: list.find(x => x.name === 'Méga-Évolution'), ev: list.find(x => x.name === 'Écarlate et Violet'), nb: list.find(x => x.name === 'Noir & Blanc'),
      stuck: tag.left - wr.left, now: list.filter(x => x.now).map(x => x.name) };
  });
  await page.evaluate(() => window.__pkm.calToday()); await page.waitForTimeout(900);
  ok('blocs de séries : ' + blocs.list.join(' · '), blocs.list.length >= 13 && blocs.list[0] === 'Base:4' && blocs.me && blocs.me.n >= 8 && blocs.me.names.indexOf('Règne Delta') >= 0 && blocs.me.names.indexOf('30ᵉ Anniversaire') >= 0
    && blocs.ev && blocs.ev.names.indexOf('Écarlate et Violet') >= 0 && blocs.ev.names.indexOf('Foudre Noire et Flamme Blanche') >= 0 && blocs.ev.names.indexOf('Méga-Évolution') < 0
    && blocs.nb && blocs.nb.names.indexOf('Explosion Plasma') >= 0 && blocs.nb.names.indexOf('Bienvenue à Kalos') < 0 && blocs.now.join() === 'Méga-Évolution', JSON.stringify(blocs));
  ok('l’étiquette du bloc reste collée à gauche quand on le parcourt (' + Math.round(blocs.stuck) + ' px du bord)', blocs.stuck >= 0 && blocs.stuck < 50, JSON.stringify(blocs.stuck));
  // Ajouts du 2026-11-19 (porteur : « Go ») : compte à rebours, prix de sortie comparé à aujourd'hui, progression.
  const extra = await page.evaluate(() => {
    const m7 = [...document.querySelectorAll('.pkm-cal-dot:not(.pkm-cal-dot-logo)')].find(b => (b.querySelector('.pkm-cal-dcode') || {}).textContent === 'M7');
    const jn = m7 && m7.querySelector('.pkm-cal-jn'), code = m7 && m7.querySelector('.pkm-cal-dcode');
    const a = jn && jn.getBoundingClientRect(), c = code && code.getBoundingClientRect(), d = m7 && m7.getBoundingClientRect();
    const logos = [...document.querySelectorAll('.pkm-cal-dot-logo')];
    return { jn: jn ? jn.textContent : '', inside: !!(a && d && a.left >= d.left - 0.5 && a.right <= d.right + 0.5 && a.top >= d.top - 0.5 && a.bottom <= d.bottom + 0.5),
      clear: !!(a && c && (a.left >= c.right || a.right <= c.left)), n: document.querySelectorAll('.pkm-cal-jn').length,
      deltas: logos.map(b => (b.querySelector('.pkm-cal-delta') || {}).textContent || '').filter(Boolean),
      progs: logos.map(b => (b.querySelector('.pkm-cal-prog') || {}).textContent || '').filter(Boolean), logos: logos.length,
      rd: (document.querySelector('.pkm-cal-dot-logo[aria-label^="Règne Delta"]') || {}).getAttribute ? document.querySelector('.pkm-cal-dot-logo[aria-label^="Règne Delta"]').getAttribute('aria-label') : '' };
  });
  ok('compte à rebours « ' + extra.jn + ' » sur la prochaine sortie datée (M7), dans sa pastille, sans cacher le sigle', extra.jn === 'J-8' && extra.n === 1 && extra.inside && extra.clear, JSON.stringify(extra));
  ok('plus d’écart de prix d’ETB sur les extensions de la frise (retiré le 20 novembre 2026)', extra.deltas.length === 0 && (await page.locator('.pkm-cal-delta').count()) === 0, JSON.stringify(extra.deltas));
  ok('progression de ma collection sur chaque logo (' + extra.progs.slice(0, 2).join(', ') + '…)', extra.progs.length === extra.logos && extra.progs.every(t => /^\d+\/\d+$/.test(t)) && /\d+ cartes? sur \d+ dans ta collection/.test(extra.rd) && !/\b[01] cartes\b/.test(extra.rd), extra.rd);
  await page.screenshot({ path: shot('coin-calendrier.png') });

  // Fiche d'une prochaine sortie : ce que montrait la liste retirée (date, nom, statut, type, sigle, cartes vedettes, explication, source).
  const sheet = page.locator('section.pkm-cal-sheet[role="dialog"]');
  const CHIP = code => page.locator('.pkm-cal-dot:not(.pkm-cal-dot-logo)').filter({ has: page.locator('.pkm-cal-dcode', { hasText: new RegExp('^' + code + '$') }) });
  await CHIP('M7').first().evaluate(b => b.click()); await page.waitForTimeout(700);
  const m7 = (await sheet.count()) === 1 ? N(await sheet.innerText()) : '';
  ok('appui sur « M7 » : sa fiche monte du bas (Aura Seeker, Annonce Japon, date, source)', /Prochaine sortie/.test(m7) && /Aura Seeker/.test(m7) && /Annonce Japon/.test(m7)
    && (await sheet.locator('.pkm-cal-when').count()) === 1 && (await sheet.locator('.pkm-cal-src').count()) === 1, m7.slice(0, 300));
  const cover = await page.evaluate(() => { const s = document.querySelector('.pkm-cal-sheet').getBoundingClientRect(), n = document.querySelector('nav[aria-label="Navigation principale"]').getBoundingClientRect(); const e = document.elementFromPoint(innerWidth / 2, n.top + 20); return { bottom: Math.round(s.bottom), sheet: !!(e && e.closest('.pkm-cal-sheet')) }; });
  ok('la fiche passe au-dessus de la barre du bas', cover.sheet && cover.bottom >= 840, JSON.stringify(cover));
  await page.screenshot({ path: shot('coin-calendrier-fiche.png') });
  await sheet.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(800);
  ok('« Fermer » : la fiche redescend et disparaît', (await sheet.count()) === 0 && (await page.evaluate(() => window.__pkm.st().calSel)) == null);
  await CHIP('ex★').last().evaluate(b => b.click()); await page.waitForTimeout(700);
  const exs = (await sheet.count()) === 1 ? N(await sheet.innerText()) : '';
  ok('appui sur « ex★ » : Entei, Raikou, Suicune, rumeur, estimation', /Entei, Raikou, Suicune/.test(exs) && /Rumeur/.test(exs) && /Estimation/.test(exs), exs.slice(0, 300));
  await page.locator('button.pkm-cal-ov-bg').click({ position: { x: 20, y: 20 } }); await page.waitForTimeout(800);
  ok('appui hors de la fiche : elle se ferme', (await sheet.count()) === 0);

  // « ? » : la fiche « Lire la frise » (statuts, compte à rebours, prix de sortie, progression).
  await page.click('button.pkm-cal-help'); await page.waitForTimeout(700);
  const help = (await sheet.count()) === 1 ? N(await sheet.innerText()) : '';
  ok('« ? » : la fiche « Lire la frise » explique les couleurs et les pastilles', /Lire la frise/.test(help) && /Sortie/.test(help) && /Officiel/.test(help) && /Annonce Japon/.test(help) && /Rumeur/.test(help) && /J-8/.test(help) && /Bloc de série/.test(help) && !/\+21 %/.test(help), help.slice(0, 300));
  await sheet.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(800);
  ok('« Fermer » : la fiche d’aide se referme', (await sheet.count()) === 0 && !(await page.evaluate(() => window.__pkm.st().calHelp)));

  // « Aujourd'hui » : caché tant que le mois en cours est à l'écran, puis ramène la frise sur aujourd'hui.
  const todayBtn = page.locator('button.pkm-cal-todaybtn');
  const vis0 = await todayBtn.evaluate(b => getComputedStyle(b).opacity);
  await page.evaluate(() => { const w = document.querySelector('.pkm-cal-strip'); w.style.scrollBehavior = 'auto'; w.scrollLeft = 0; w.style.scrollBehavior = ''; w.dispatchEvent(new Event('scroll')); }); await page.waitForTimeout(450);
  const vis1 = await todayBtn.evaluate(b => getComputedStyle(b).opacity);
  await todayBtn.click(); await page.waitForTimeout(1100);
  const back = await page.evaluate(() => { const n = document.querySelector('.pkm-cal-m-now').getBoundingClientRect(), w = document.querySelector('.pkm-cal-strip').getBoundingClientRect(); return { cx: n.left + n.width / 2 - (w.left + w.width / 2), away: document.querySelector('.pkm-cal-hero').classList.contains('pkm-cal-away') }; });
  ok('« Aujourd’hui » : caché au départ, visible quand on s’éloigne, ramène la frise sur le mois en cours', +vis0 === 0 && +vis1 === 1 && Math.abs(back.cx) < 40 && !back.away, JSON.stringify({ vis0, vis1, back }));

  // « Préviens-moi » sur une sortie à venir : rappel enregistré, cloche sur le sigle, retiré au second appui.
  await CHIP('M7').first().evaluate(b => b.click()); await page.waitForTimeout(700);
  const remind = sheet.locator('button.pkm-cal-remind');
  ok('fiche d’une sortie à venir : « Préviens-moi » (la veille et le jour même)', (await remind.count()) === 1 && /Préviens-moi/.test(N(await remind.innerText())) && (await remind.getAttribute('aria-pressed')) === 'false');
  await remind.click(); await page.waitForTimeout(300);
  const on = await page.evaluate(() => ({ al: (window.__pkm.st().alerts || {})['cal:m7'], saved: (JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').alerts || {})['cal:m7'] }));
  ok('« Préviens-moi » activé : rappel gardé sur l’appareil', on.al === '2026-11-19' && (await remind.getAttribute('aria-pressed')) === 'true' && /Rappel activé/.test(N(await remind.innerText())), JSON.stringify(on));
  await sheet.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(800);
  ok('cloche sur le sigle M7 de la frise', (await CHIP('M7').first().evaluate(b => b.classList.contains('pkm-cal-dot-bell'))));
  await page.screenshot({ path: shot('coin-calendrier-rappel.png') });

  // Appui marqué sur le logo, puis zoom sur l'extension, puis ses items.
  // Frise décalée de 60 px à gauche du mois en cours (Règne Delta reste à l'écran) : le retour doit retrouver cette place.
  await page.evaluate(() => { const w = document.querySelector('.pkm-cal-strip'), m = document.querySelector('.pkm-cal-m-now'); w.style.scrollBehavior = 'auto'; w.scrollLeft = Math.round(m.offsetLeft - w.clientWidth / 2 + m.clientWidth / 2 - 60); w.style.scrollBehavior = ''; });
  const x0 = await page.evaluate(() => document.querySelector('.pkm-cal-strip').scrollLeft);
  await page.locator('.pkm-cal-dot-logo[aria-label^="Règne Delta"]').evaluate(b => b.click()); await page.waitForTimeout(110);
  const press = await page.evaluate(() => { const b = document.querySelector('.pkm-cal-dot-logo[aria-label^="Règne Delta"]'), t = getComputedStyle(b).transform; const k = t && t !== 'none' ? +t.split('(')[1].split(',')[0] : 1; return { k: k, glow: /255, 214, 10/.test(getComputedStyle(b).boxShadow), zoom: !!document.querySelector('.pkm-calz') }; });
  ok('appui sur le logo : il s’enfonce et s’allume avant le zoom (×' + press.k.toFixed(2) + ')', press.k < 0.97 && press.glow && !press.zoom, JSON.stringify(press));
  await page.waitForTimeout(500);
  const cam = await page.evaluate(() => { const st = document.querySelector('.pkm-cal-strip'), m = st ? getComputedStyle(st).transform : 'none', src = document.querySelector('.pkm-cal-dot-logo[aria-label^="Règne Delta"]'); return { dive: m && m !== 'none' ? +m.split('(')[1].split(',')[0] : 1, tile: !!document.querySelector('.pkm-calz-tile'), logo: !!document.querySelector('.pkm-calz-logo img'), hidden: src ? getComputedStyle(src).visibility : '' }; });
  ok('puis la caméra zoome : toute la frise plonge vers l’extension (×' + cam.dive.toFixed(1) + '), sa tuile redessinée en grand', cam.dive > 1.3 && cam.tile && cam.logo && cam.hidden === 'hidden', JSON.stringify(cam));
  await page.waitForTimeout(560);
  const mid = await page.evaluate(() => { const l = document.querySelector('.pkm-calz-logo'), r = l && l.getBoundingClientRect(), n = document.querySelector('.pkm-calz-name'); return { w: r ? r.width : 0, cx: r ? r.left + r.width / 2 : 0, name: n ? n.textContent : '' }; });
  ok('l’extension arrive au centre du cadre, en grand (' + Math.round(mid.w) + ' px), avec son nom', mid.w > 200 && Math.abs(mid.cx - 195) < 4 && mid.name === 'Règne Delta', JSON.stringify(mid));
  await page.screenshot({ path: shot('coin-calendrier-zoom.png') });
  const enter = await page.evaluate(async () => {
    for (let k = 0; k < 120 && window.__pkm.st().screen !== 'set'; k++) await new Promise(r => setTimeout(r, 15));
    for (let k = 0; k < 20 && !document.querySelector('#app main .pkm-set-logo'); k++) await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const m = document.querySelector('#app main'), t = document.querySelector('#app main .pkm-set-logo'), fly = document.querySelector('.pkm-calz-logo');
    return { screen: window.__pkm.st().screen, anim: m ? m.getAnimations().length : 0, target: t ? getComputedStyle(t).visibility : 'absent', fly: !!fly && fly.getAnimations().length > 0 };
  });
  ok('la page de l’extension se pose sous le zoom, son logo y vole jusqu’à sa place', enter.screen === 'set' && enter.anim >= 1 && enter.target === 'hidden' && enter.fly, JSON.stringify(enter));
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => { const s = window.__pkm.st(), b = [...document.querySelectorAll('button')].map(x => x.textContent.trim()), t = document.querySelector('#app main .pkm-set-logo'); return { screen: s.screen, setId: s.setId, f: s.setFilter, over: !!document.querySelector('.pkm-calz'), logo: t ? getComputedStyle(t).visibility : 'absent', cards: b.some(t => /^Cartes \(\d+\)$/.test(t)), items: b.some(t => /^Items \(\d+\)$/.test(t)) }; });
  ok('puis la page de l’extension est ouverte, onglets « Cartes » et « Items », logo à sa place, plus rien par-dessus', after.screen === 'set' && after.setId === 'me06' && after.f === 'all' && after.cards && after.items && !after.over && after.logo === 'visible', JSON.stringify(after));
  await page.screenshot({ path: shot('coin-calendrier-items.png') });
  await page.evaluate(() => window.__pkm.pop()); await page.waitForTimeout(1200);
  const x1 = await page.evaluate(() => { const w = document.querySelector('.pkm-cal-strip'); return w ? w.scrollLeft : -1; });
  ok('retour : la frise reprend là où elle était (' + Math.round(x0) + ' → ' + Math.round(x1) + ')', await page.evaluate(() => window.__pkm.st().screen) === 'coin' && Math.abs(x1 - x0) <= 2);
  await ctx.close();
}

// D. Petit écran (320 px) : pas de débordement ; logo 3 avec ?coinvis=3 ; serveur sans 034 (admin).
{
  const S = newS({ off34: true, off38: true });
  const { ctx, page } = await setup(S, { w: 320, q: '&coinvis=3&navvis=3', role: 'admin' });
  const nv = await page.evaluate(() => { const shown = [...document.querySelectorAll('.pkm-navdeco .pkm-nds')].filter(e => getComputedStyle(e).display === 'block').map(e => e.getAttribute('class')); const sc = document.querySelector('button[aria-label^="Scanner"]'), co = document.querySelector('button[aria-label="Le coin des dresseurs"]').getBoundingClientRect(); return { shown, rad: parseFloat(getComputedStyle(sc).borderTopLeftRadius), fits: co.left >= 0 && co.right <= innerWidth && sc.getBoundingClientRect().right <= innerWidth }; });
  ok('?navvis=3 : forme « Socle » seule, scan en carré arrondi, tout dans l’écran à 320 px', nv.shown.length === 1 && /pkm-nd-3/.test(nv.shown[0]) && nv.rad < 25 && nv.fits);
  const vis = await page.locator(NAV + ' .pkm-coin-ico').evaluateAll(a => a.map(s => getComputedStyle(s).display !== 'none'));
  ok('?coinvis=3 : logo « Bulle » seul visible', vis[2] && vis.filter(Boolean).length === 1);
  await page.click(NAV + ' button[aria-label="Le coin des dresseurs"]'); await page.waitForTimeout(2000); // entrée en cascade de Ma ligue terminée
  const over = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollWidth - m.clientWidth : 99; });
  const wide = await page.evaluate(() => { const m = document.querySelector('main'), mr = m.getBoundingClientRect(); return [...m.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > mr.right + 1; }).slice(0, 4).map(e => e.tagName + '.' + String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 60)).join(' ; '); });
  ok('320 px, Ma ligue : aucun débordement horizontal (' + over + ')', over <= 1, wide);
  await page.screenshot({ path: shot('coin-ligue-320.png') });
  await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button', { hasText: 'Ma vitrine' }).click(); await page.waitForTimeout(1200);
  const overV = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollWidth - m.clientWidth : 99; });
  ok('320 px, Ma vitrine : aucun débordement horizontal (' + overV + ')', overV <= 1);
  await page.fill('input[aria-label="Recherche une carte ou un dresseur"]', 'dracaufeu'); await page.waitForTimeout(1200);
  const off = N(await page.locator('section[aria-label="Rechercher une carte ou un dresseur"]').innerText());
  ok('serveur sans 034 ni 038 : l’admin voit le fichier à installer (dresseurs et cartes)', (off.match(/install_024_a_034\.sql/g) || []).length === 2, off.slice(0, 200));
  const overS = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollWidth - m.clientWidth : 99; });
  ok('320 px, recherche : aucun débordement horizontal (' + overS + ')', overS <= 1);
  await page.screenshot({ path: shot('coin-320.png') });
  await page.locator('[aria-label="Le coin des dresseurs"][role="tablist"] button', { hasText: 'calendrier JCC' }).click(); await page.waitForTimeout(1500);
  const over2 = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.scrollWidth - m.clientWidth : 99; });
  ok('calendrier à 320 px : aucun débordement horizontal (' + over2 + ')', over2 <= 1);
  await page.screenshot({ path: shot('coin-calendrier-320.png') });
  await ctx.close();
}

// E. Le rappel du calendrier la veille de la sortie (26 novembre) : encadré « Tes alertes » de l'accueil, un appui ouvre la fiche.
{
  const S = newS();
  const { ctx, page } = await setup(S, { q: '&today=2026-11-26' });
  await page.evaluate(() => window.__pkm.setState({ alerts: { 'cal:m7': '2026-11-19' }, screen: 'home' })); await page.waitForTimeout(2500);
  const box = page.locator('section[aria-label="Tes alertes"]');
  const txt = (await box.count()) ? N(await box.innerText()) : '';
  ok('veille de la sortie : « Aura Seeker (Japon) sort demain » dans « Tes alertes »', /Aura Seeker \(Japon\) sort demain/.test(txt) && !/Japon\) sort demain au Japon/.test(txt), txt.slice(0, 200));
  await box.locator('button', { hasText: /sort demain/ }).first().click(); await page.waitForTimeout(1200);
  const st = await page.evaluate(() => { const s = window.__pkm.st(); return { screen: s.screen, tab: s.coinTab, sel: s.calSel }; });
  ok('un appui sur l’alerte ouvre la fiche de la sortie dans le calendrier', st.screen === 'coin' && st.tab === 'cal' && st.sel === 'm7', JSON.stringify(st));
  await ctx.close();
}

await browser.close();
ok('aucune erreur de page (' + errors.slice(0, 3).join(' | ') + ')', errors.length === 0);
console.log(res.join('\n'));
const bad = res.filter(r => r.startsWith('✗')).length;
console.log(bad ? bad + ' échec(s)' : 'OK : ' + res.length + ' vérifications');
process.exit(bad ? 1 : 0);
