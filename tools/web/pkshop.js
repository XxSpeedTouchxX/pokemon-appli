  // ——— PK shop (2026-10-12, demande du porteur) ———
  // Le 4ᵉ onglet (Territoire) devient « PK shop » : on y dépense ses PK. Premier article : un ticket de participation au
  // tirage au sort d'un booster Pokémon. Territoire reste accessible depuis l'accueil (« Boutiques près de toi »).
  // Le tirage lui-même n'est pas fait par l'app : il demande un règlement, l'identité de l'organisateur et un moyen de
  // contacter le gagnant (serveur, comptes). En attendant, les tickets sont gardés sur l'appareil et l'app l'affiche.
  // Ce module partage la portée des autres : ses noms commencent par SHOP_ ou shop.
  // Prix (2026-10-12, porteur) : ticket 2 000 PK ; lot « Booster 30 ans Pokémon » 15 000 PK (visuel officiel du booster).
  // Le lot s'échange directement (pas de tirage) ; son envoi demande un compte et une adresse : l'app l'enregistre sur
  // l'appareil et l'annonce, sans rien expédier pour l'instant.
  const SHOP_TICKET_PRICE = 2000;
  const SHOP_DRAW = 'Prochain tirage : date annoncée ici avec le règlement du jeu. Un ticket = une chance ; plus tu en as, plus tu as de chances.';
  const SHOP_ITEMS = [
    { id: 'ticket-booster', kind: 'ticket', name: 'Ticket · tirage au sort', prize: '1 booster Pokémon à gagner', price: SHOP_TICKET_PRICE, note: SHOP_DRAW },
    { id: 'lot-booster-30', kind: 'lot', name: 'Booster 30 ans Pokémon', prize: 'Le booster, à recevoir chez toi', price: 15000,
      img: 'img/shop-booster-30-anniversaire.webp', imgAlt: 'Booster du 30ᵉ anniversaire Pokémon',
      note: 'Échange direct, sans tirage. L’envoi se fera quand les comptes Dropicards existeront : ton lot est gardé sur cet appareil d’ici là.' }
  ];
  const shopProto = Component.prototype;
  // Tickets possédés (tous articles « ticket »), pour la barre sous le solde de PK.
  const shopTickets = s => SHOP_ITEMS.filter(x => x.kind === 'ticket').reduce((n, x) => n + ((s.tickets || {})[x.id] || 0), 0);
  const shopUnit = (it, n) => it.kind === 'ticket' ? (n > 1 ? n + ' tickets' : n + ' ticket') : (n > 1 ? n + ' lots' : n + ' lot');

  shopProto.shopBuy = function (id) {
    const s = this.st(), item = SHOP_ITEMS.find(x => x.id === id), pk = Number(s.pk) || 0;
    if (!item || pk < item.price) return;
    const tickets = Object.assign({}, s.tickets || {});
    tickets[id] = (tickets[id] || 0) + 1;
    const left = (pk - item.price).toLocaleString('fr-FR');
    this.setState({ pk: pk - item.price, tickets: tickets, shopAsk: null,
      toast: (item.kind === 'ticket' ? 'Ticket ajouté · tu en as ' + tickets[id] : item.name + ' · échange enregistré') + ' · il te reste ' + left + ' PK' });
    this.flash();
  };
  shopProto.vPkShop = function (s) {
    const pk = Number(s.pk) || 0, tickets = s.tickets || {};
    return {
      pk: pk.toLocaleString('fr-FR'),
      items: SHOP_ITEMS.map(it => {
        const n = tickets[it.id] || 0, can = pk >= it.price, ask = s.shopAsk === it.id, price = it.price.toLocaleString('fr-FR') + ' PK';
        return {
          name: it.name, prize: it.prize, price: price, note: it.note,
          isTicket: !it.img, hasImg: !!it.img, img: it.img || '', imgAlt: it.imgAlt || '',
          owned: n > 0, ownedText: 'Tu as ' + shopUnit(it, n),
          can: can, cannot: !can, missText: 'Il te manque ' + (it.price - pk).toLocaleString('fr-FR') + ' PK',
          ask: ask, idle: !ask, buyLabel: (it.kind === 'ticket' ? 'Acheter un ticket · ' : 'Échanger · ') + price,
          confirmText: 'Échanger ' + price + ' contre ' + (it.kind === 'ticket' ? '1 ticket' : 'le lot « ' + it.name + ' »') + ' ?',
          open: () => this.setState({ shopAsk: it.id }), cancel: () => this.setState({ shopAsk: null }), buy: () => this.shopBuy(it.id)
        };
      }),
      rules: 'Participation gratuite : les PK se gagnent sans achat et n’ont aucune valeur en euros. Le tirage sera fait par Dropicards selon un règlement publié avant le tirage. Tes tickets et tes lots sont gardés sur cet appareil, avec ta collection.',
      earn: () => this.tab('market'), openRules: () => this.legalOpen('pk')
    };
  };
  // Barre des tickets sous le compteur de PK (seulement si on en a) ; elle ouvre le PK shop.
  const shopBasePk = shopProto.pkView;
  shopProto.pkView = function (s) {
    const v = shopBasePk.call(this, s), n = shopTickets(s);
    // Avec des tickets, le compteur se resserre et la barre se place juste dessous (sans cacher le sous-titre).
    return Object.assign(v, { wrapCls: n > 0 ? 'pkm-pk-tk' : '', hasTickets: n > 0, tickets: n > 1 ? n + ' tickets' : n + ' ticket',
      ticketsAria: 'Mes tickets du tirage au sort : ' + n + '. Ouvrir le PK shop', openShop: () => this.tab('pkshop') });
  };

  // Onglet : écran « pkshop » ; le bouton Territoire de la barre du bas l'ouvre et s'allume dessus.
  const shopBaseRender = shopProto.renderVals;
  shopProto.renderVals = function () {
    const s = this.st(), r = shopBaseRender.call(this), ui = r.ui;
    ui.isPkShop = s.screen === 'pkshop';
    r.pks = ui.isPkShop ? this.vPkShop(s) : { items: [] }; // « shop » est déjà la fiche d'une boutique
    if (ui.isPkShop) Object.assign(ui, { title: 'PK shop', subtitle: 'Dépense tes PK', hasSubtitle: true, hasSubRow: false, headerHome: false, headerBig: true, headerDetail: false });
    // Territoire n'est plus un onglet : écran de détail ouvert depuis l'accueil, avec Retour.
    if (ui.isTerritory) Object.assign(ui, { headerBig: false, headerDetail: true });
    r.tabShop = () => this.tab('pkshop');
    return r;
  };
  const shopBaseSection = shopProto.section;
  shopProto.section = function (s) {
    if (s.screen === 'pkshop') return 'territory';
    const sec = shopBaseSection.call(this, s);
    return sec === 'territory' ? 'home' : sec;
  };
  const shopBaseParent = shopProto.parentOf;
  shopProto.parentOf = function (sc) { return sc === 'territory' ? 'home' : sc === 'pkshop' ? 'home' : shopBaseParent.call(this, sc); };
