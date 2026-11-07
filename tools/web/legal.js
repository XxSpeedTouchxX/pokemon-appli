  // ——— Informations légales (H1, H4 ; 2026-10-09) ———
  // Panneau ouvert depuis Réglages › À propos (« Informations légales ») et depuis « Mes PK » (« Règles des PK ») :
  // mentions légales, confidentialité, conditions d'utilisation, PK et jeux. Les champs de l'éditeur restent
  // « à compléter » : ils dépendent du porteur (nom ou société, adresse, contact) et ne sont jamais inventés.
  // Textes à faire relire avant toute sortie publique (docs/14-verifications-avant-publication.md).
  // Ce module partage la portée des autres : ses noms commencent par LEGAL_ ou legal.
  // Textes (2026-11-07) : tools/web/legal-texts.mjs, une seule source pour ce panneau et les pages publiques de
  // dropicards.fr ; le build les injecte (LEGAL_DATA), en variante site ou app (DROPI_APP).
  const LEGAL_TODO = LEGAL_DATA.todo;
  const LEGAL = LEGAL_DATA.sections;
  const LEGAL_TABS = ['mentions', 'privacy', 'terms', 'reglement', 'help', 'pk'];

  // Les panneaux Mes PK et Mes PA se ferment : les règles s'affichent seules par-dessus l'app.
  proto.legalOpen = function (tab) { this.setState({ legal: LEGAL[tab] ? tab : 'mentions', pkSheet: false, paSheet: false }); };
  const legalBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = legalBaseRender.call(this), s = this.st(), cur = LEGAL[s.legal] ? s.legal : '';
    r.legal = {
      open: !!cur, close: () => this.setState({ legal: '' }),
      title: cur ? LEGAL[cur].label : '',
      // Les règles des PK et PA s'ouvrent seules (depuis Mes PK ou Mes PA), sans les bulles des informations légales.
      tabs: LEGAL_TABS.filter(k => k !== 'pk').map(k => Object.assign({ label: LEGAL[k].label, on: k === cur, pick: () => this.setState({ legal: k }) }, this.chip(k === cur))),
      blocks: cur ? LEGAL[cur].blocks.map(([t, p]) => ({ title: t, text: p, todo: p.indexOf(LEGAL_TODO) >= 0 })) : [],
      openMentions: () => this.legalOpen('mentions'), openPk: () => this.legalOpen('pk'),
      // Mon profil (2026-11-01) : conditions générales d'utilisation et politique de confidentialité ouvertes directement.
      openTerms: () => this.legalOpen('terms'), openPrivacy: () => this.legalOpen('privacy'),
      // Règlement des tirages au sort et assistance (2026-11-07 ; règle d'Apple 5.3, docs/23 §2 point 8).
      openReglement: () => this.legalOpen('reglement'), openHelp: () => this.legalOpen('help'),
      isPk: cur === 'pk', notPk: cur !== 'pk', pk: cur === 'pk' ? this.vRules(s) : { grades: [], odds: [], streak: [], evo: [], shop: [], earn: [], free: [] }
    };
    if (cur === 'pk') r.legal.title = 'Règles des PK et PA';
    return r;
  };
  // ——— Règles des PK et des jeux, en images (2026-10-28, demande du porteur) ———
  // Les mêmes règles que le texte (gardé en bas, dépliable), en cartes : gains, Booster PK (chances en barre), pile ou
  // face, délais selon le grade (ligne du grade actuel en avant), PA et Pokédex, PK shop, « pas un jeu d'argent ».
  // Chiffres lus dans les modules qui les appliquent (profile.js, games.js, pa.js, pkshop.js) : jamais recopiés.
  const legalNum = n => Number(n).toLocaleString('fr-FR');
  const legalEvoRows = () => {
    // « Avec thème » retiré (2026-11-01, porteur) : Kyogre, Groudon et Rayquaza comptent parmi les légendaires.
    const cat = e => (e.mega ? 'Méga' : e.leg ? 'Légendaire' : ['Forme de base', '1ʳᵉ évolution', '2ᵉ évolution'][Math.min(pkStage(e.n), 2)]);
    const rng = {};
    DEX_DATA.forEach(e => { const p = dexPrice(e.n); if (!p) return; const k = cat(e); rng[k] = rng[k] ? [Math.min(rng[k][0], p), Math.max(rng[k][1], p)] : [p, p]; });
    return ['Forme de base', '1ʳᵉ évolution', '2ᵉ évolution', 'Légendaire', 'Méga'].filter(k => rng[k])
      .map(k => ({ label: k, pa: (rng[k][0] === rng[k][1] ? legalNum(rng[k][0]) : legalNum(rng[k][0]) + ' à ' + legalNum(rng[k][1])) + ' PA' }));
  };
  proto.vRules = function (s) {
    const t = this.tierOf ? this.tierOf() : { i: 0 }, gi = t.i || 0, streak = (() => { const n = paPending(s); return n ? n.streak : (Number(s.paStreak) || 0); })();
    return {
      pk: legalNum(Number(s.pk) || 0), pa: legalNum(Number(s.pa) || 0), grade: PF_GRADES[gi].name, emblem: 'img/grades/grade-' + (gi + 1) + '.svg',
      earn: [
        { big: '+100', label: 'Bienvenue', note: 'Une fois, à l’arrivée', icon: 'img/brand/pk.svg' },
        // Pas de PK pour un partage dans l'app (règle d'Apple 3.2.2, native.js).
        ...(DROPI_APP ? [] : [{ big: '+300', label: 'Partage', note: 'Une fois, en partageant l’app', icon: 'img/brand/pk.svg' }]),
        { big: 'Jeux', label: 'Booster et pièce', note: 'Dans l’onglet Jeux', icon: 'img/brand/pk.svg' }
      ],
      odds: GM_TABLE.map(([pk, pct, label, color]) => ({ pk: legalNum(pk) + ' PK', pct: pct + ' %', label: label, w: 'flex: ' + pct + ' 1 0; min-width: 4px', color: color })),
      coinWin: '+' + GM_COIN_WIN + ' PK',
      grades: PF_GRADES.map((g, i) => ({ name: g.name, img: 'img/grades/grade-' + (i + 1) + '.svg', booster: g.boosterH + ' h', coin: g.coinH ? g.coinH + ' h' : '—', scans: legalNum(g.scans),
        cls: 'pkm-rules-row' + (i === gi ? ' pkm-rules-me' : ''), aria: g.name + (i === gi ? ', ton grade' : '') + ' : booster toutes les ' + g.boosterH + ' h, ' + (g.coinH ? 'pièce toutes les ' + g.coinH + ' h' : 'pièce fermée') + ', ' + g.scans + ' scans par jour' })),
      streak: PaCore.GAIN.map((v, i) => ({ day: i === 4 ? 'J5 et +' : 'J' + (i + 1), pa: '+' + v, cls: 'pkm-rules-day' + (Math.min(streak, 5) === i + 1 ? ' pkm-rules-today' : '') + (i < Math.min(streak, 5) ? ' pkm-rules-done' : '') })),
      // Prix fixés Pokémon par Pokémon par le porteur (2026-11-01, PA_PRICES) : fourchette par catégorie, lue dans les prix.
      evo: legalEvoRows(),
      shop: SHOP_ITEMS.map(x => ({ name: x.name, price: x.soon ? 'Bientôt' : legalNum(x.price) + ' PK', grade: x.minGrade ? 'Dès le grade ' + PF_GRADES[x.minGrade].name : '', img: x.img || 'img/brand/pk.svg' })),
      free: [['0 €', 'de mise'], ['0 €', 'à gagner en argent'], ['0 €', 'pour jouer']].map(([a, b]) => ({ big: a, label: b }))
    };
  };
