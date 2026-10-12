  // ——— PK shop (2026-10-12, demande du porteur) ———
  // Le 4ᵉ onglet (Territoire) devient « PK shop » : on y dépense ses PK. Premier article : un ticket de participation au
  // tirage au sort d'un booster Pokémon. Territoire reste accessible depuis l'accueil (« Boutiques près de toi »).
  // Le tirage lui-même n'est pas fait par l'app : il demande un règlement, l'identité de l'organisateur et un moyen de
  // contacter le gagnant (serveur, comptes). En attendant, les tickets sont gardés sur l'appareil et l'app l'affiche.
  // Ce module partage la portée des autres : ses noms commencent par SHOP_ ou shop.
  const SHOP_TICKET_PRICE = 500; // PK, valeur par défaut à confirmer par le porteur
  const SHOP_ITEMS = [{ id: 'ticket-booster', name: 'Ticket · tirage au sort', prize: '1 booster Pokémon à gagner', price: SHOP_TICKET_PRICE }];
  const shopProto = Component.prototype;

  shopProto.shopBuy = function (id) {
    const s = this.st(), item = SHOP_ITEMS.find(x => x.id === id), pk = Number(s.pk) || 0;
    if (!item || pk < item.price) return;
    const tickets = Object.assign({}, s.tickets || {});
    tickets[id] = (tickets[id] || 0) + 1;
    this.setState({ pk: pk - item.price, tickets: tickets, shopAsk: null,
      toast: 'Ticket ajouté · tu en as ' + tickets[id] + ' · il te reste ' + (pk - item.price).toLocaleString('fr-FR') + ' PK' });
    this.flash();
  };
  shopProto.vPkShop = function (s) {
    const pk = Number(s.pk) || 0, tickets = s.tickets || {};
    return {
      pk: pk.toLocaleString('fr-FR'),
      items: SHOP_ITEMS.map(it => {
        const n = tickets[it.id] || 0, can = pk >= it.price, ask = s.shopAsk === it.id;
        return {
          name: it.name, prize: it.prize, price: it.price.toLocaleString('fr-FR') + ' PK',
          owned: n > 0, ownedText: n > 1 ? 'Tu as ' + n + ' tickets' : 'Tu as 1 ticket',
          can: can, cannot: !can, missText: 'Il te manque ' + (it.price - pk).toLocaleString('fr-FR') + ' PK',
          ask: ask, idle: !ask, buyLabel: 'Acheter un ticket · ' + it.price.toLocaleString('fr-FR') + ' PK',
          confirmText: 'Échanger ' + it.price.toLocaleString('fr-FR') + ' PK contre 1 ticket ?',
          open: () => this.setState({ shopAsk: it.id }), cancel: () => this.setState({ shopAsk: null }), buy: () => this.shopBuy(it.id)
        };
      }),
      drawText: 'Prochain tirage : date annoncée ici avec le règlement du jeu. Un ticket = une chance ; plus tu en as, plus tu as de chances.',
      rules: 'Participation gratuite : les PK se gagnent sans achat et n’ont aucune valeur en euros. Le tirage sera fait par Dropicards selon un règlement publié avant le tirage. Tes tickets sont gardés sur cet appareil, avec ta collection.',
      earn: () => this.tab('market'), openRules: () => this.legalOpen('pk')
    };
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
