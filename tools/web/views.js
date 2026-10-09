  // ——— Vues au choix et bulle d'infos (2026-10-09, demande du porteur) ———
  // Territoire : Liste, Galerie, Compacte, ou Carte (le Radar en plein écran). Chaque boutique ne montre que l'essentiel
  // (nom, distance, ouverture, chance) ; « + » ouvre une bulle accrochée à la boutique (type, adresse, horaires,
  // itinéraire, appel, site, fiche) ; un appui sur la boutique ouvre sa fiche. Un appui ailleurs ou Échap ferme la bulle.
  // Marché : Liste, Galerie (3 visuels par ligne), Compacte (une ligne par article), Grandes cartes (16:9).
  // Le choix de vue reste dans l'état de l'app (tview, mview) : on le retrouve au retour sur la page.
  // Ce module partage la portée des autres : ses noms commencent par VIEW_ ou view.
  const VIEW_ICONS = {
    list: 'M5 7h14 M5 12h14 M5 17h14', gallery: 'M5 5h6v6H5z M13 5h6v6h-6z M5 13h6v6H5z M13 13h6v6h-6z',
    compact: 'M5 5.5h14 M5 9.5h14 M5 13.5h14 M5 17.5h14', map: 'M9 4L3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5z M9 4v13.5 M15 6.5V20',
    big: 'M4 5h16v10H4z M4 19h11'
  };
  const VIEW_TER = [['list', 'Liste'], ['gallery', 'Galerie'], ['compact', 'Compacte'], ['map', 'Carte plein écran']];
  const VIEW_MARKET = [['list', 'Liste'], ['gallery', 'Galerie'], ['compact', 'Compacte'], ['big', 'Grandes cartes']];
  const viewSwitch = (inst, s, defs, key, menuKey, special) => {
    const cur = defs.some(([k]) => k === s[key]) ? s[key] : 'list', name = defs.find(([k]) => k === cur)[1];
    return {
      cur: cur, icon: VIEW_ICONS[cur], label: name, aria: 'Vue : ' + name + '. Changer de vue', open: !!s[menuKey],
      toggle: () => inst.setState({ [menuKey]: !s[menuKey] }), close: () => inst.setState({ [menuKey]: false }),
      options: defs.map(([k, label]) => Object.assign({
        label: label, icon: VIEW_ICONS[k], on: k === cur,
        pick: () => { if (special && special[k]) { inst.setState({ [menuKey]: false }); special[k](); } else inst.setState({ [key]: k, [menuKey]: false }); }
      }, inst.chip(k === cur)))
    };
  };
  let viewKeys = false;
  const viewEscape = inst => {
    if (viewKeys) return;
    viewKeys = true;
    document.addEventListener('keydown', e => {
      const s = inst.st();
      if (e.key === 'Escape' && (s.tpop || s.tviewMenu || s.mviewMenu)) inst.setState({ tpop: null, tviewMenu: false, mviewMenu: false });
    });
  };

  const viewBaseTer = proto.vTerritoryReal;
  proto.vTerritoryReal = function (s) {
    const r = viewBaseTer.call(this, s);
    viewEscape(this);
    r.vs = viewSwitch(this, s, VIEW_TER, 'tview', 'tviewMenu', { map: () => this.openRadar() });
    const v = r.vs.cur, rows = r.rows || [];
    r.vList = r.hasRows && v === 'list'; r.vGallery = r.hasRows && v === 'gallery'; r.vCompact = r.hasRows && v === 'compact';
    r.popOpen = !!s.tpop && rows.some(w => w.id === s.tpop);
    r.popClose = () => this.setState({ tpop: null });
    rows.forEach((w, i) => {
      const open = s.tpop === w.id;
      w.z = open ? '22' : 'auto';
      // Galerie : bulle alignée sur le bord de la colonne ; liste et compacte : à droite, sous le « + ».
      w.side = v === 'gallery' && i % 2 === 0 ? 'left' : 'right';
      w.arrow = v === 'gallery' ? '18px' : '22px';
      w.more = {
        open: open, turn: open ? '45deg' : '0deg', label: (open ? 'Masquer les détails de ' : 'Plus d’infos sur ') + w.name,
        toggle: () => this.setState({ tpop: open ? null : w.id })
      };
      w.info = open ? this.shopInfo(w.src.st, w.src.c, w.src.d, { why: false }) : null;
      if (w.info) w.info.title = 'Détails : ' + w.name;
    });
    return r;
  };

  const viewBaseMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = viewBaseMarket.call(this, x), s = x.s;
    r.vs = viewSwitch(this, s, VIEW_MARKET, 'mview', 'mviewMenu');
    const v = r.vs.cur, has = !r.empty;
    r.vList = v === 'list'; r.vGallery = has && v === 'gallery'; r.vCompact = has && v === 'compact'; r.vBig = has && v === 'big';
    return r;
  };
