  // ——— Pokédex v2 (2026-10-28, demande du porteur) ———
  // Remplace le choix du compagnon et l'ancien jeu d'évolution : chaque Pokémon (les 156 compagnons et les 15
  // méga-évolutions de Kanto) se débloque avec des PA, au prix de son stade (pk.js, pkPriceOf ; méga : PA_MEGA), une
  // fois sa forme précédente débloquée ; un Pokémon débloqué se choisit comme compagnon et apparaît en haut à droite de
  // « Valeur de toute ma collection ».
  // - Route d'évolution (d'après la vidéo Digimon du porteur) : la famille du Pokémon touché, de la forme de base aux
  //   méga-évolutions, au bout de la ligne ; une branche (Évoli, Méga-Dracaufeu X et Y) part en pointillés dessous.
  // - Fiche : n°, catégorie, types, taille, poids, talents, habitat, capture, rareté, évolution, statistiques de base,
  //   puissance et rang, description du Pokédex (tools/sprites/dex.json, DEX_DATA) ; statistiques et description
  //   cachées tant que le Pokémon n'est pas débloqué.
  // - « Tous les Pokémon » : la liste complète (recherche, filtres), un appui ouvre la route et la fiche.
  // État : dexSel (Pokémon touché), dexList (liste ouverte), dexF (filtre), dexQ (recherche) ; non enregistrés.
  // Ce module partage la portée des autres : ses noms commencent par DEX_ ou dex.
  const DEX = {};
  DEX_DATA.forEach(e => { DEX[e.n] = e; });
  const DEX_IDS = HOME_BUDDIES.map(([n]) => n);
  const DEX_NUMS = DEX_IDS.slice().sort((a, b) => a - b);
  const DEX_STATS = ['PV', 'Attaque', 'Défense', 'Atq. Spé.', 'Déf. Spé.', 'Vitesse'];
  const DEX_FORMS = ['Forme de base', '1ʳᵉ évolution', '2ᵉ évolution'];
  const DEX_COLS = ['Base', 'Évolution 1', 'Évolution 2'];
  // Couleurs des types (pastilles) ; le texte passe en sombre sur les couleurs claires.
  const DEX_TYPE = { Plante: '#3FA34D', Poison: '#9B4FC4', Feu: '#E8662F', Eau: '#3D7FD9', Vol: '#7F96E8', Insecte: '#8FAE1B', Normal: '#9A9480',
    Électrik: '#F4C430', Sol: '#D3A84F', Fée: '#EE90C8', Combat: '#C03028', Psy: '#F0507E', Roche: '#B09A3A', Acier: '#8C9CB0',
    Glace: '#6CC9D2', Spectre: '#6A5498', Dragon: '#6A3CEB', Ténèbres: '#5E4A3C' };
  // Texte de la pastille : blanc ou bleu nuit, celui qui contraste le plus avec la couleur du type (WCAG).
  const dexLum = hex => { const v = parseInt(hex.slice(1), 16); return [v >> 16, (v >> 8) & 255, v & 255].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
  const dexLight = hex => { const L = dexLum(hex); return (L + 0.05) / (dexLum('#0B1120') + 0.05) > 1.05 / (L + 0.05); };
  const dexNo = e => '#' + String(e.mega ? e.from : e.n).padStart(3, '0') + (e.mega ? ' Méga' : '');
  const dexStage = n => { let k = 0, e = DEX[n]; while (e && !e.mega && e.from && k < 3) { k++; e = DEX[e.from]; } return k; };
  const dexTotal = e => e.stats.reduce((a, b) => a + b, 0);
  const DEX_RANK = DEX_DATA.slice().sort((a, b) => dexTotal(b) - dexTotal(a)).map(e => e.n);
  const dexOwn = (s, n) => (DEX[n] && DEX[n].mega ? (Array.isArray(s.megas) ? s.megas : []).indexOf(n) >= 0 : pkOwns(s, n));
  const dexPrice = n => (DEX[n] && DEX[n].mega ? PA_MEGA : (PK_SHOP[n] || 0));
  const dexStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const dexSprite = (n, still) => 'img/pokemon/' + n + (still ? '.png' : '.gif');
  const dexNum = n => Number(n).toLocaleString('fr-FR');
  const dexCapture = c => (c >= 190 ? 'Très facile' : c >= 120 ? 'Facile' : c >= 45 ? 'Moyenne' : c >= 25 ? 'Difficile' : 'Très difficile');
  const dexKids = n => DEX_DATA.filter(e => e.from === n);
  const dexProto = Component.prototype;
  // Tailles proportionnelles (2026-10-28, demande du porteur) : dans une famille, chaque Pokémon est dessiné à la
  // hauteur de sa taille réelle (fiche du Pokédex), le plus grand à DEX_PX px ; une méga-évolution est toujours un peu
  // plus grande que sa forme de base (au moins 10 %), même quand le Pokédex leur donne la même taille. Plancher de
  // DEX_PX_MIN px pour qu'un tout petit Pokémon reste visible (Magicarpe à côté de Léviator).
  const DEX_PX = 84, DEX_PX_BIG = 104, DEX_PX_MIN = 20, DEX_CAPW = 140, DEX_CAPW_BIG = 136;
  const dexH = e => (e.mega && DEX[e.from] ? Math.max(e.h, Math.ceil(DEX[e.from].h * 1.1)) : e.h);
  const dexFam = n => DEX_DATA.filter(e => e.fam === DEX[n].fam && (e.mega || DEX_IDS.indexOf(e.n) >= 0));
  const dexFamMax = n => Math.max(...dexFam(n).map(dexH));
  // Largeur du Pokémon pour 1 px de hauteur : GIF animé (cadre serré), ou boîte du Pokémon dans l'image fixe de 96 px
  // (tools/sprites/dex_boxes.py). Un sprite très large (Méga-Roucarnage) réduit toute sa famille d'autant : les
  // proportions restent justes et rien ne déborde de plus d'une colonne.
  const dexAsp = (e, still) => (still ? (e.box[2] - e.box[0]) / Math.max(1, e.box[3] - e.box[1]) : e.gif[0] / Math.max(1, e.gif[1]));
  const dexFamFit = (n, max, top, cap, still) => Math.min(1, ...dexFam(n).map(e => cap / Math.max(1, top * dexH(e) / max * dexAsp(e, still))));
  // Style de l'image : hauteur voulue du Pokémon ; image fixe agrandie d'après sa boîte, pieds et centre recalés
  // (décalage en px par « translate », jamais en %). La fiche ne déborde pas de sa colonne de 128 px (DEX_CAPW_BIG).
  const dexSize = (e, max, top, still, fit) => {
    const p = Math.max(DEX_PX_MIN, Math.round(top * fit * dexH(e) / max));
    if (!still) return 'height: ' + p + 'px';
    const [x0, y0, x1, y1] = e.box, H = Math.round(p * 96 / Math.max(1, y1 - y0));
    return 'height: ' + H + 'px; width: ' + H + 'px; margin-bottom: -' + Math.round((96 - y1) * H / 96) + 'px; translate: ' + Math.round((48 - (x0 + x1) / 2) * H / 96) + 'px 0';
  };
  // Nom court sur la route : « Méga X », « Méga Y » ou « Méga » (le nom complet est dans la fiche).
  const dexShort = e => (e.mega ? 'Méga' + ((/ ([XY])$/.exec(e.name) || [])[1] ? ' ' + / ([XY])$/.exec(e.name)[1] : '') : e.name);

  // ——— Cartes de chaque Pokémon (2026-10-29, proposition 1 validée par le porteur) ———
  // Une carte appartient à un Pokémon quand son nom contient le nom français ou anglais du Pokémon, mot pour mot
  // (« Dracaufeu-ex », « Reshiram et Dracaufeu GX », « Blaine's Charizard ») ; « Méga-… » ou « M-… » devant le nom la
  // range dans la méga-évolution (X ou Y d'après la lettre qui suit, les deux sans lettre : « M-Dracaufeu EX »). Les
  // objets qui portent un nom de Pokémon (Poupée Ronflex, Fossile Dôme Kabuto, Lien Spirituel Dracaufeu) sont écartés,
  // ainsi que Porygon-Z (pas un Porygon). Index construit une fois par catalogue chargé (≈ 0,3 s pour 21 000 cartes).
  const dexNorm = t => fold(t).replace(/[.'’]/g, ' ').replace(/\s*([♀♂])/g, '$1').replace(/\s+/g, ' ').trim();
  const DEX_FIRST = {}, DEX_MEGAS = {};
  DEX_DATA.forEach(e => {
    if (e.mega) { (DEX_MEGAS[e.from] = DEX_MEGAS[e.from] || []).push(e); return; }
    [e.name, e.en].filter(Boolean).map(dexNorm).filter((v, i, a) => a.indexOf(v) === i).forEach(v => {
      const t = v.split(' ');
      (DEX_FIRST[t[0]] = DEX_FIRST[t[0]] || []).push({ n: e.n, t: t });
    });
  });
  Object.keys(DEX_FIRST).forEach(k => DEX_FIRST[k].sort((a, b) => b.t.length - a.t.length));
  const DEX_NOT_AFTER = { 137: 'z' }, DEX_NOT_BEFORE = ['poupee', 'peluche', 'tour', 'dome', 'nautile', 'ambre', 'spirituel', 'doll'];
  const dexMatch = name => {
    const t = dexNorm(name).split(' '), out = [];
    for (let i = 0; i < t.length;) {
      const hit = (DEX_FIRST[t[i]] || []).find(c => c.t.every((w, j) => t[i + j] === w));
      if (!hit) { i++; continue; }
      const after = t[i + hit.t.length] || '', before = i > 0 ? t[i - 1] : '', megas = DEX_MEGAS[hit.n];
      if (DEX_NOT_AFTER[hit.n] === after || DEX_NOT_BEFORE.indexOf(before) >= 0) { i += hit.t.length; continue; }
      if (megas && (before === 'mega' || before === 'm')) {
        const xy = megas.filter(m => dexNorm(m.name).split(' ').pop() === after);
        (xy.length ? xy : megas).forEach(m => out.push(m.n));
      } else out.push(hit.n);
      i += hit.t.length;
    }
    return out.filter((n, k) => out.indexOf(n) === k);
  };
  const DEX_CARDS = { doc: null, by: {} };
  const dexCardIds = n => {
    if (TCG.status !== 'ready') return null;
    if (DEX_CARDS.doc !== TCG.doc) {
      const F = TCG.F, by = {};
      TCG.rows.forEach(x => dexMatch(x.r[F.name]).forEach(k => { (by[k] = by[k] || []).push(x.r[F.id]); }));
      DEX_CARDS.doc = TCG.doc; DEX_CARDS.by = by;
    }
    return DEX_CARDS.by[n] || [];
  };
  // « Ses cartes » de la fiche : les miennes (exemplaires, valeur selon l'état et la langue, comme le classeur), les
  // 3 plus cotées du catalogue (cote Cardmarket régulière), et « Voir ses N cartes » (recherche limitée à ces cartes).
  dexProto.vDexCards = function (s, n) {
    const e = DEX[n], ids = dexCardIds(n), name = e.name;
    const out = { name: name, loading: ids === null, ready: ids !== null, mine: [], hasMine: false, noMine: false, top: [], hasTop: false, all: () => {}, allLabel: '', hasAll: false };
    if (ids === null) { out.note = TCG.status === 'error' ? 'Catalogue des cartes indisponible pour le moment.' : 'Chargement des cartes…'; return out; }
    const c = this.compute(s), F = TCG.F;
    const open = p => (p.tcg ? this.openTcg(p.id) : this.push('item', { itemId: p.id }));
    const mine = this.catalog().filter(p => p.type === 'card' && c.stock[p.id] && c.stock[p.id].qty > 0 && dexMatch(p.name).indexOf(n) >= 0)
      .map(p => ({ p: p, q: c.stock[p.id].qty, v: (this.unitVal(p, s.valuation) || 0) * c.stock[p.id].qty }))
      .sort((a, b) => b.v - a.v);
    const copies = mine.reduce((t, m) => t + m.q, 0), value = mine.reduce((t, m) => t + m.v, 0);
    out.mineTitle = 'Mes cartes de ' + name;
    out.mineText = mine.length ? copies + (copies > 1 ? ' exemplaires' : ' exemplaire') + (mine.length !== copies ? ' · ' + mine.length + ' cartes différentes' : '') : 'Pas encore de carte de ' + name + ' dans ta collection.';
    out.mineValue = mine.length ? this.eur(value) : '';
    out.hasMine = mine.length > 0; out.noMine = !mine.length;
    out.mine = mine.slice(0, 6).map(m => Object.assign(this.look(m.p), { name: m.p.name, qty: '×' + m.q, aria: m.p.name + ', ' + m.q + (m.q > 1 ? ' exemplaires' : ' exemplaire') + ', ' + this.eur(m.v), open: () => open(m.p) }));
    out.more = mine.length > 6 ? '+ ' + (mine.length - 6) + ' autres' : ''; out.hasMore = mine.length > 6;
    const top = ids.map(id => TCG.byId[id]).filter(x => x && coteOf(x.r, F) > 0 && coteSteady(x.r, F)).sort((a, b) => coteOf(b.r, F) - coteOf(a.r, F)).slice(0, 3);
    out.top = top.map((x, i) => {
      const p = TCG.item(x.r[F.id]), k = this.cote(p);
      return Object.assign(this.look(p), { rank: String(i + 1), name: p.name, set: p.setName + ' · ' + p.numLabel, cote: k !== null ? this.eur(k) : '—',
        aria: (i + 1) + 'ᵉ plus chère : ' + p.name + ', ' + p.setName + ', ' + (k !== null ? this.eur(k) : 'sans cote'), open: () => this.openTcg(p.id) });
    });
    out.hasTop = out.top.length > 0;
    out.hasAll = ids.length > 0;
    out.allLabel = 'Voir ses ' + ids.length.toLocaleString('fr-FR') + (ids.length > 1 ? ' cartes' : ' carte');
    out.none = !ids.length; out.noneText = 'Aucune carte de ' + name + ' dans le catalogue pour l’instant.';
    out.all = () => { this.setState({ mq: name, mIds: ids, mIdsQ: name, mfilter: 'trend' }); this.push('search'); };
    return out;
  };

  // Ouvrir le Pokédex (compagnon de l'accueil, « Mes PK », didacticiel) : onglet Jeux, Pokémon choisi, liste au besoin.
  dexProto.dexOpen = function (n, list) {
    const go = () => { const el = document.querySelector('section[aria-label="Pokédex"]'); if (el && !list) el.scrollIntoView({ block: 'start', behavior: dexStill() ? 'auto' : 'smooth' }); };
    const patch = { dexSel: DEX[n] ? n : this.st().buddy, dexList: !!list, megaAsk: null };
    if (this.st().screen !== 'market') { this.tab('market'); this.setState(patch); setTimeout(go, 520); } else { this.setState(patch); setTimeout(go, 60); }
    if (list) dexListKeys(this);
  };
  // Débloquer un Pokémon avec des PA : il devient le compagnon ; évolution animée si sa forme précédente est à toi.
  dexProto.dexUnlock = function (n) {
    const s = this.st(), e = DEX[n], price = dexPrice(n), pa = Number(s.pa) || 0;
    if (!e || s.paFx || dexOwn(s, n) || (e.from && !dexOwn(s, e.from)) || pa < price) return;
    const patch = { pa: pa - price, buddy: n, dexSel: n, megaAsk: null };
    if (e.mega) patch.megas = (Array.isArray(s.megas) ? s.megas : []).concat([n]);
    else patch.pkOwn = (s.pkOwn || []).concat([n]);
    // Lignée du starter : le stade suit (didacticiel, anciens écrans).
    if (s.evo && PA_LINES[s.evo.line] && PA_LINES[s.evo.line].indexOf(n) > s.evo.stage) patch.evo = { line: s.evo.line, stage: PA_LINES[s.evo.line].indexOf(n) };
    this.setState(patch);
    const done = () => { this.setState({ toast: (e.from ? 'Félicitations ! ' + paName(e.from) + (e.mega ? ' méga-évolue en ' : ' a évolué en ') : '') + (e.from ? e.name : e.name + ' rejoint ton Pokédex') + ' · il te reste ' + dexNum(pa - price) + ' PA' }); this.flash(); };
    if (e.from) this.paFxRun(e.from, n, done);
    else { this.pkUnlockShow(n); done(); }
  };
  dexProto.dexChoose = function (n) {
    const s = this.st();
    if (!dexOwn(s, n) || s.buddy === n) return;
    this.setState({ buddy: n, toast: paName(n) + ' t’accompagne' + (HOME_THEMES[n] ? ' · thème ' + HOME_THEMES[n].name : '') });
    this.flash();
  };

  // Route d'évolution de la famille de n : colonnes par stade, méga-évolutions dans la dernière colonne ; la première
  // branche suit la ligne du haut, les autres partent dessous. Mesures en px (nœud de 78 × 134 ; socle à 88 px du haut).
  const DEX_COL = 72, DEX_TOP = 44, DEX_ROW = 148, DEX_PED = 88;
  const dexRoute = n => {
    const fam = DEX[n].fam, nodes = DEX_DATA.filter(e => e.fam === fam && (e.mega || DEX_IDS.indexOf(e.n) >= 0)).map(e => ({ e: e, n: e.n }));
    const by = {}; nodes.forEach(x => { by[x.n] = x; });
    const depth = x => (x.e.mega ? -1 : dexStage(x.n));
    const maxD = Math.max(0, ...nodes.map(depth));
    nodes.forEach(x => { x.col = x.e.mega ? maxD + 1 : depth(x); });
    let next = 0;
    const place = (x, row) => {
      x.row = row;
      const kids = nodes.filter(k => k.e.from === x.n).sort((a, b) => (a.e.mega || 0) - (b.e.mega || 0) || a.n - b.n);
      kids.forEach((k, i) => place(k, i === 0 ? row : ++next));
    };
    nodes.filter(x => !x.e.from || !by[x.e.from]).sort((a, b) => a.n - b.n).forEach((x, i) => place(x, i === 0 ? 0 : ++next));
    const cols = Math.max(...nodes.map(x => x.col)) + 1, rows = next + 1;
    const cx = c => c * DEX_COL + DEX_COL / 2, ty = r => DEX_TOP + r * DEX_ROW;
    let solid = '', dots = '';
    nodes.forEach(x => {
      const p = by[x.e.from];
      if (!p) return;
      if (p.row === x.row) solid += 'M' + cx(p.col) + ' ' + (ty(x.row) + DEX_PED) + 'H' + cx(x.col);
      else dots += 'M' + cx(p.col) + ' ' + (ty(p.row) + DEX_PED + 12) + 'V' + (ty(x.row) + DEX_PED) + 'H' + (cx(x.col) - 32);
    });
    const hasMega = nodes.some(x => x.e.mega);
    return { nodes: nodes, cols: cols, rows: rows, solid: solid, dots: dots, w: cols * DEX_COL, h: DEX_TOP + rows * DEX_ROW + 4,
      labels: Array.from({ length: cols }, (_, i) => (hasMega && i === cols - 1 ? 'Méga' : DEX_COLS[i] || 'Évolution ' + i)), cx: cx, ty: ty };
  };

  dexProto.vDex = function (s) {
    const still = dexStill(), pa = Number(s.pa) || 0, b = DEX[s.buddy] ? s.buddy : 25;
    const sel = DEX[s.dexSel] ? s.dexSel : b, e = DEX[sel], route = dexRoute(sel), hmax = dexFamMax(sel);
    const fit = dexFamFit(sel, hmax, DEX_PX, DEX_CAPW, still), fitBig = dexFamFit(sel, hmax, DEX_PX_BIG, DEX_CAPW_BIG, still);
    const owned = DEX_IDS.filter(k => dexOwn(s, k)).length;
    const status = x => {
      if (dexOwn(s, x.n)) return s.buddy === x.n ? 'Compagnon' : 'Débloqué';
      return dexPrice(x.n) ? dexNum(dexPrice(x.n)) + ' PA' : 'Offert';
    };
    const can = x => !dexOwn(s, x.n) && (!x.e.from || dexOwn(s, x.e.from)) && pa >= dexPrice(x.n);
    const v = {
      count: owned + ' / ' + DEX_IDS.length, all: () => { this.setState({ dexList: true, dexQ: '', dexF: 'all' }); dexListKeys(this); },
      allLabel: 'Tous les Pokémon',
      routeW: route.w + 'px', routeH: route.h + 'px', routeBox: '0 0 ' + route.w + ' ' + route.h, solid: route.solid || 'M0 0', dots: route.dots || 'M0 0',
      cols: route.labels.map((l, i) => ({ label: l, pos: 'left: ' + (i * DEX_COL + 5) + 'px; width: ' + (DEX_COL - 10) + 'px' })),
      nodes: route.nodes.map(x => {
        const own = dexOwn(s, x.n), on = x.n === sel;
        return {
          img: dexSprite(x.n, still), sz: dexSize(x.e, hmax, DEX_PX, still, fit), name: dexShort(x.e), status: status(x), on: on, tag: on,
          sc: own ? '#9FF5C0' : can(x) ? '#FFE27A' : '#C9D3EA',
          cls: 'pkm-dex-node' + (own ? '' : ' pkm-dex-lock') + (x.row > 0 ? ' pkm-dex-alt' : '') + (s.buddy === x.n ? ' pkm-dex-now' : '') + (on ? ' pkm-dex-on' : '') + (still ? ' pkm-dex-still' : ''),
          pos: 'left: ' + (route.cx(x.col) - DEX_COL / 2) + 'px; top: ' + route.ty(x.row) + 'px',
          aria: x.e.name + ', ' + (x.e.mega ? 'méga-évolution' : DEX_FORMS[Math.min(dexStage(x.n), 2)]) + ', ' + status(x),
          pick: () => this.setState({ dexSel: x.n, megaAsk: null })
        };
      }),
      buddy: { icon: 'img/pokemon/icon/' + b + '.png', name: DEX[b].name, no: dexNo(DEX[b]), types: DEX[b].types.join(' · ') }
    };
    // Fiche du Pokémon touché.
    const own = dexOwn(s, sel), price = dexPrice(sel), from = e.from && DEX[e.from], tot = dexTotal(e), rank = DEX_RANK.indexOf(sel) + 1;
    const stage = e.mega ? 'Méga-évolution' : DEX_FORMS[Math.min(dexStage(sel), 2)];
    const rare = e.leg === 2 ? 'Fabuleux' : e.leg === 1 ? 'Légendaire' : e.mega ? 'Méga-évolution' : HOME_THEMES[sel] ? 'Légendaire · ' + HOME_THEMES[sel].name : 'Commun';
    const kids = dexKids(sel).filter(k => k.mega || DEX_IDS.indexOf(k.n) >= 0);
    const evoText = [].concat(from ? ['Évolue de ' + from.name + (e.how ? ' · ' + e.how : '')] : [],
      kids.map(k => 'Évolue en ' + k.name + (k.how ? ' · ' + k.how : '')));
    let act, actOn = false, actGo = () => {};
    if (own) {
      if (s.buddy === sel) act = 'C’est ton compagnon';
      else { act = 'Choisir comme compagnon'; actOn = true; actGo = () => this.dexChoose(sel); }
    } else if (from && !dexOwn(s, from.n)) act = 'Débloque d’abord ' + from.name;
    else if (pa < price) act = 'Encore ' + dexNum(price - pa) + ' PA pour le débloquer';
    else if (s.paFx) act = 'Évolution en cours…';
    else { act = (from ? (e.mega ? 'Méga-évoluer' : 'Faire évoluer') : 'Débloquer') + ' · ' + dexNum(price) + ' PA'; actOn = true; actGo = () => (e.mega ? this.setState({ megaAsk: sel }) : this.dexUnlock(sel)); }
    v.sel = {
      img: dexSprite(sel, still), sz: dexSize(e, hmax, DEX_PX_BIG, still, fitBig), size: (e.h / 10).toLocaleString('fr-FR') + ' m', cls: 'pkm-dex-big' + (own ? '' : ' pkm-dex-sil'), name: e.name, no: dexNo(e), genus: e.genus, own: own, lock: !own,
      types: e.types.map(t => ({ t: t, style: 'background: ' + (DEX_TYPE[t] || '#5A6B8C') + '; color: ' + (dexLight(DEX_TYPE[t] || '#5A6B8C') ? '#0B1120' : '#FFFFFF') })),
      rows: [
        ['Stade', stage], ['Taille', (e.h / 10).toLocaleString('fr-FR') + ' m'], ['Poids', (e.w / 10).toLocaleString('fr-FR') + ' kg'],
        ['Talents', e.abil.join(', ') || '—'], ['Habitat', e.hab ? e.hab.charAt(0).toUpperCase() + e.hab.slice(1) : '—'],
        ['Capture', e.cap ? dexCapture(e.cap) : '—'], ['Rareté', rare], ['Prix', price ? dexNum(price) + ' PA' : 'Offert']
      ].map(([k, x]) => ({ k: k, v: x })),
      evo: evoText.map(t => ({ t: t })), hasEvo: evoText.length > 0,
      stats: e.stats.map((x, i) => ({ k: DEX_STATS[i], v: x, w: 'width: ' + Math.round(x / 255 * 100) + '%' })),
      total: dexNum(tot), rank: rank + 'ᵉ sur ' + DEX_DATA.length, stars: '★★★★★'.slice(0, Math.max(1, Math.min(5, Math.ceil((DEX_DATA.length - rank + 1) / DEX_DATA.length * 5)))),
      text: e.text, hasText: !!e.text,
      act: act, actOn: actOn, actDis: !actOn, actGo: actGo, actCls: 'pkm-dex-act-btn' + (actOn ? '' : ' pkm-dex-act-off')
    };
    v.sel.cards = this.vDexCards(s, sel);
    // Pokédex dessiné cliquable (2026-10-29, proposition 3 validée par le porteur) : le petit écran de gauche montre le
    // Pokémon touché (silhouette s'il est à débloquer) ; la croix fait défiler sa famille (gauche, droite, dans l'ordre
    // de la route) ou le Pokédex par numéro (haut, bas) ; le bouton vert fait l'action de la fiche (débloquer, faire
    // évoluer, choisir comme compagnon), sinon dit pourquoi elle n'est pas possible.
    const order = route.nodes.slice().sort((a, b) => a.col - b.col || a.row - b.row).map(x => x.n);
    const fi = order.indexOf(sel), ni = DEX_NUMS.indexOf(e.mega ? e.from : sel), L = DEX_NUMS.length;
    v.dexImg = dexSprite(sel, still); v.dexCls = own ? '' : 'pkm-dex-sil'; v.dexName = e.name;
    v.dexSay = 'Pokédex : ' + e.name + ', ' + dexNo(e) + (own ? '' : ', à débloquer');
    v.pad = {
      left: () => this.dexPadGo(order[(fi - 1 + order.length) % order.length]),
      right: () => this.dexPadGo(order[(fi + 1) % order.length]),
      up: () => this.dexPadGo(DEX_NUMS[(ni - 1 + L) % L]),
      down: () => this.dexPadGo(DEX_NUMS[(ni + 1) % L]),
      a: () => { if (actOn) actGo(); else { this.setState({ toast: act }); this.flash(); } },
      aLabel: 'Bouton vert : ' + act
    };
    const ask = DEX[s.megaAsk] && DEX[s.megaAsk].mega ? DEX[s.megaAsk] : null;
    Object.assign(v, { ask: !!ask, askText: ask ? 'Faire méga-évoluer ' + paName(ask.from) + ' en ' + ask.name + ' pour ' + dexNum(PA_MEGA) + ' PA ?' : '',
      askYes: () => ask && this.dexUnlock(ask.n), askNo: () => this.setState({ megaAsk: null }) });
    return v;
  };

  // Croix du Pokédex dessiné : le Pokémon suivant s'affiche sur le petit écran et dans la route et la fiche.
  dexProto.dexPadGo = function (n) { if (DEX[n]) this.setState({ dexSel: n, megaAsk: null }); };

  // « Mon Pokédex » au clavier : focus sur la recherche, Tab reste dans la fenêtre, Échap la ferme, le focus revient
  // au bouton « Tous les Pokémon ».
  const dexListKeys = comp => {
    setTimeout(() => { const q = document.querySelector('input[aria-label="Chercher un Pokémon"]'); if (q) q.focus({ preventScroll: true }); }, 60);
    const back = () => setTimeout(() => { const b = document.querySelector('.pkm-dex-all'); if (b) b.focus({ preventScroll: true }); }, 60);
    const key = ev => {
      if (!comp.st().dexList) { document.removeEventListener('keydown', key); return; }
      if (ev.key === 'Escape') { comp.setState({ dexList: false }); document.removeEventListener('keydown', key); back(); return; }
      if (ev.key !== 'Tab') return;
      const els = [...document.querySelectorAll('section[aria-label="Mon Pokédex"] input, section[aria-label="Mon Pokédex"] button')];
      if (!els.length) return;
      const i = els.indexOf(document.activeElement);
      if (i < 0 || (ev.shiftKey && i === 0) || (!ev.shiftKey && i === els.length - 1)) { ev.preventDefault(); els[ev.shiftKey ? els.length - 1 : 0].focus(); }
    };
    document.addEventListener('keydown', key);
  };
  // Liste complète : recherche par nom ou n°, filtres, grille de 3 ; un appui ouvre la route et la fiche.
  const DEX_FILTERS = [['all', 'Tous'], ['own', 'Débloqués'], ['lock', 'À débloquer'], ['leg', 'Légendaires']];
  dexProto.vDexList = function (s) {
    if (!s.dexList) return { open: false, items: [], filters: [] };
    const f = s.dexF || 'all', q = fold(String(s.dexQ || '').trim()), qn = q.replace(/^(n°|no|#)?\s*0*/, ''), pa = Number(s.pa) || 0;
    const items = DEX_IDS.map(n => DEX[n]).filter(e => {
      const own = dexOwn(s, e.n);
      if (f === 'own' && !own) return false;
      if (f === 'lock' && own) return false;
      if (f === 'leg' && !e.leg) return false;
      return !q || fold(e.name).indexOf(q) >= 0 || (qn !== '' && String(e.n) === qn);
    }).map(e => {
      const own = dexOwn(s, e.n), price = dexPrice(e.n), ok = !own && (!e.from || dexOwn(s, e.from)) && pa >= price;
      return { no: '#' + String(e.n).padStart(3, '0'), name: e.name, img: 'img/pokemon/icon/' + e.n + '.png', imgCls: own ? '' : 'pkm-dex-sil',
        status: own ? (s.buddy === e.n ? 'Compagnon' : 'Débloqué') : price ? dexNum(price) + ' PA' : 'Offert',
        cls: 'pkm-dexl-item' + (own ? ' pkm-dexl-own' : '') + (ok ? ' pkm-dexl-can' : '') + (s.buddy === e.n ? ' pkm-dexl-buddy' : ''),
        aria: e.name + ', n° ' + e.n + ', ' + (own ? 'débloqué' : 'à débloquer pour ' + price + ' PA'),
        go: () => { if (this.st().screen !== 'market') this.tab('market'); this.setState({ dexList: false, dexSel: e.n }); setTimeout(() => { const el = document.querySelector('[aria-label="Route d’évolution"]'); if (el) el.scrollIntoView({ block: 'start', behavior: dexStill() ? 'auto' : 'smooth' }); }, 80); } };
    });
    return {
      open: true, close: () => { this.setState({ dexList: false }); setTimeout(() => { const b = document.querySelector('.pkm-dex-all'); if (b) b.focus({ preventScroll: true }); }, 60); }, q: s.dexQ || '', onQ: ev => this.setState({ dexQ: ev.target.value }),
      count: DEX_IDS.filter(k => dexOwn(s, k)).length + ' / ' + DEX_IDS.length + ' débloqués · ' + dexNum(pa) + ' PA',
      filters: DEX_FILTERS.map(([k, l]) => Object.assign({ label: l, on: f === k, pick: () => this.setState({ dexF: k }) }, this.chip(f === k))),
      items: items, empty: !items.length
    };
  };

  const dexBaseRender = dexProto.renderVals;
  dexProto.renderVals = function () {
    const s = this.st(), r = dexBaseRender.call(this);
    if (r.ui.isGames && s.evo) Object.assign(r.evo, this.vDex(s));
    r.dexl = this.vDexList(s);
    return r;
  };
