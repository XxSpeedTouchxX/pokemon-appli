  // ——— Annonces en cours (2026-11-14, « go » du porteur pour Vinted ; docs/41, guide docs/42) ———
  // Rubrique de l'accueil « Annonces du moment » (sous la pré-gradation) et écran complet « Annonces » : cartes, lots,
  // cartes gradées et produits scellés Pokémon en vente sur Vinted, repris toutes les 30 minutes par la fonction du
  // serveur « annonces » (tools/supabase/functions/annonces, table listings de 029_annonces.sql). Lecture seule, avec la
  // clé publique « anon » : aucune connexion nécessaire, aucune donnée de vendeur (pas de pseudo ni d'avatar).
  // Toujours étiqueté « prix demandé » : une annonce ne compte jamais dans la cote (principe 3). « Voir l'annonce » ouvre
  // Vinted ; Dropicards ne vend rien. Tant que 029 n'est pas installé, la rubrique de l'accueil reste cachée.
  // Ce module partage la portée des autres : ses noms commencent par AN / an.
  const AN = { rows: [], at: 0, tried: 0, busy: false, err: '', missing: false, status: null };
  const AN_PAGE = 30, AN_MAX = 400, AN_FRESH = 5 * 60e3, AN_RETRY = 60e3;
  const AN_KINDS = [['all', 'Tout'], ['card', 'Cartes'], ['lot', 'Lots'], ['graded', 'Gradées'], ['sealed', 'Scellé']];
  const AN_SORTS = [['new', 'Plus récentes'], ['up', 'Prix croissant'], ['down', 'Prix décroissant']];
  const AN_SRC = { vinted: 'Vinted', ebay: 'eBay', dropicards: 'Dropicards' };
  const anProto = Component.prototype;
  const anEur = n => (Math.round(Number(n) * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
  const anAgo = iso => {
    const t = Date.parse(iso || ''); if (!t) return '';
    const m = Math.max(0, Math.round((Date.now() - t) / 60e3));
    if (m < 1) return 'à l’instant'; if (m < 60) return 'il y a ' + m + ' min';
    const h = Math.round(m / 60); if (h < 24) return 'il y a ' + h + ' h';
    const d = Math.round(h / 24); return d === 1 ? 'hier' : 'il y a ' + d + ' jours';
  };
  const anFold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Chargement : les 400 annonces actives les plus récentes et l'état du fil ; relu au plus toutes les 5 minutes.
  AN.load = function (inst, force) {
    const now = Date.now();
    if (AN.busy || typeof Cloud === 'undefined' || !Cloud.on()) return;
    if (!force && ((AN.at && now - AN.at < AN_FRESH) || (AN.tried && now - AN.tried < AN_RETRY))) return;
    AN.busy = true; AN.tried = now;
    const cols = 'id,source,ext_id,title,price,total_price,currency,photo,url,cond,is_lot,lot_count,kind,first_seen,last_seen';
    Promise.all([
      Cloud.req('/rest/v1/listings?select=' + cols + '&order=first_seen.desc,id.desc&limit=' + AN_MAX),
      Cloud.req('/rest/v1/rpc/listings_status', { method: 'POST', body: {} }).catch(() => null)
    ]).then(([rows, st]) => {
      AN.rows = Array.isArray(rows) ? rows : []; AN.status = st; AN.at = Date.now(); AN.err = ''; AN.missing = false;
    }).catch(e => {
      AN.missing = !!(e && (e.code === 'not_installed' || e.status === 404));
      AN.err = AN.missing ? 'Le fil des annonces n’est pas encore en place sur le serveur de Dropicards.' : (e && e.message) || 'Impossible de charger les annonces.';
    }).finally(() => {
      AN.busy = false;
      try { inst.setState({ anTick: Date.now() }); } catch (e) { /* écran fermé */ }
    });
  };

  const anItem = (row, inst) => {
    const kind = row.kind || (row.is_lot ? 'lot' : 'card');
    const tag = kind === 'lot' ? (row.lot_count ? 'Lot · ' + row.lot_count + ' cartes' : 'Lot') : kind === 'graded' ? 'Gradée' : kind === 'sealed' ? 'Scellé' : '';
    const total = row.total_price && Number(row.total_price) > Number(row.price) ? anEur(row.total_price) + ' avec la protection acheteur' : '';
    return {
      key: row.source + '-' + row.ext_id, title: row.title, price: anEur(row.price), total: total, hasTotal: !!total,
      img: row.photo || '', hasImg: !!row.photo, src: AN_SRC[row.source] || row.source, srcCls: 'pkm-anl-src pkm-anl-src-' + row.source,
      tag: tag, hasTag: !!tag, cond: row.cond || '', hasCond: !!row.cond, when: anAgo(row.first_seen), href: row.url,
      aria: 'Voir l’annonce ' + row.title + ' sur ' + (AN_SRC[row.source] || row.source) + ' (nouvelle page)'
    };
  };

  // Filtres de l'écran : recherche (sans accents), type, tri.
  anProto.anList = function (s) {
    const q = anFold(s.anQ || '').trim(), kind = s.anKind || 'all', sort = s.anSort || 'new';
    let list = AN.rows.filter(r => (kind === 'all' || (r.kind || (r.is_lot ? 'lot' : 'card')) === kind) && (!q || q.split(/\s+/).every(w => anFold(r.title).indexOf(w) >= 0)));
    if (sort === 'up') list = list.slice().sort((a, b) => a.price - b.price);
    else if (sort === 'down') list = list.slice().sort((a, b) => b.price - a.price);
    return list;
  };

  anProto.anOpen = function () {
    this.push('annonces');
    this.setState({ anShow: AN_PAGE });
    AN.load(this, !AN.at);
  };

  anProto.vAnHome = function () {
    const rows = AN.rows.slice(0, 8);
    return {
      show: rows.length > 0, n: AN.rows.length, items: rows.map(r => anItem(r, this)),
      sub: 'Cartes Pokémon en vente sur Vinted · prix demandés', open: () => this.anOpen(),
      btn: 'Voir toutes les annonces (' + AN.rows.length + ')'
    };
  };

  anProto.vAnnonces = function (s) {
    const list = this.anList(s), shown = Math.min(list.length, s.anShow || AN_PAGE);
    const st = AN.status && AN.status.vinted, kind = s.anKind || 'all', sort = s.anSort || 'new';
    const upd = st && st.last_ok ? 'Mis à jour ' + anAgo(st.last_ok) : '';
    let empty = '';
    if (!AN.rows.length) empty = AN.busy || (!AN.at && !AN.err) ? 'Chargement des annonces…' : AN.err || 'Aucune annonce pour le moment : le fil se remplit toutes les 30 minutes.';
    else if (!list.length) empty = 'Aucune annonce ne correspond à ta recherche.';
    return {
      q: s.anQ || '', onQ: e => this.setState({ anQ: e && e.target ? e.target.value : '', anShow: AN_PAGE }),
      kinds: AN_KINDS.map(([k, label]) => ({ label: label, cls: 'pkm-anl-chip' + (k === kind ? ' pkm-anl-chip-on' : ''), pressed: k === kind ? 'true' : 'false', go: () => this.setState({ anKind: k, anShow: AN_PAGE }) })),
      sorts: AN_SORTS.map(([k, label]) => ({ label: label, cls: 'pkm-anl-sort' + (k === sort ? ' pkm-anl-sort-on' : ''), pressed: k === sort ? 'true' : 'false', go: () => this.setState({ anSort: k, anShow: AN_PAGE }) })),
      count: list.length ? list.length + (list.length > 1 ? ' annonces' : ' annonce') + (upd ? ' · ' + upd.toLowerCase() : '') : '',
      hasCount: list.length > 0, items: list.slice(0, shown).map(r => anItem(r, this)),
      empty: empty, isEmpty: !!empty, more: shown < list.length, showMore: () => this.setState({ anShow: shown + AN_PAGE }),
      moreLabel: 'Afficher plus (' + (list.length - shown) + ')',
      retry: !!AN.err && !AN.busy, doRetry: () => AN.load(this, true)
    };
  };

  const anBaseRender = anProto.renderVals;
  anProto.renderVals = function () {
    const s = this.st(), r = anBaseRender.call(this), ui = r.ui;
    ui.isAnnonces = s.screen === 'annonces';
    if (s.screen === 'home' || ui.isAnnonces) AN.load(this);
    r.anh = this.vAnHome();
    if (ui.isAnnonces) {
      r.anl = this.vAnnonces(s);
      Object.assign(ui, { title: 'Annonces', subtitle: 'Vinted · prix demandés, mis à jour toutes les 30 min', hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
    } else r.anl = { kinds: [], sorts: [], items: [] };
    return r;
  };
  const anBaseParent = anProto.parentOf;
  anProto.parentOf = function (sc) { return sc === 'annonces' ? 'home' : anBaseParent.call(this, sc); };
  // Lien direct : ?start=annonces (tests).
  const anBaseSt = anProto.st;
  anProto.st = function () {
    const d = anBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'annonces') { d.screen = 'annonces'; d.stack = ['home']; }
    return d;
  };
  try { if (/[?&]debug\b/.test(location.search)) window.__pkmAn = AN; } catch (e) { /* adresse sans paramètres */ }
