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
      note: 'Échange direct, sans tirage. L’envoi se fera quand les comptes Dropicards existeront : ton lot est gardé sur cet appareil d’ici là.', perk: 'shopBooster' },
    // Item « Deluxe » (2026-10-28, porteur) : réservé au Grand maître mondial Pokémon ; article et prix à définir.
    { id: 'item-deluxe', kind: 'deluxe', name: 'Item Deluxe', prize: 'Un article d’exception, bientôt', price: 0, soon: true,
      note: 'Article et prix annoncés ici prochainement.', perk: 'deluxe' }
  ];
  // Grade demandé par chaque article (2026-10-28, porteur ; profile.js) : ticket dès Collectionneur, booster dès
  // Dresseur Pokémon, item Deluxe au Grand maître mondial Pokémon.
  SHOP_ITEMS[0].perk = 'ticket';
  const shopProto = Component.prototype;
  // Tickets possédés (tous articles « ticket »), pour la barre sous le solde de PK.
  const shopTickets = s => SHOP_ITEMS.filter(x => x.kind === 'ticket').reduce((n, x) => n + ((s.tickets || {})[x.id] || 0), 0);
  const shopUnit = (it, n) => it.kind === 'ticket' ? (n > 1 ? n + ' tickets' : n + ' ticket') : (n > 1 ? n + ' lots' : n + ' lot');

  shopProto.shopBuy = function (id) {
    const s = this.st(), item = SHOP_ITEMS.find(x => x.id === id), pk = Number(s.pk) || 0;
    if (!item || item.soon || pk < item.price || !this.perks()[item.perk]) return;
    const tickets = Object.assign({}, s.tickets || {});
    tickets[id] = (tickets[id] || 0) + 1;
    const left = (pk - item.price).toLocaleString('fr-FR');
    this.setState({ pk: pk - item.price, tickets: tickets, shopAsk: null,
      toast: (item.kind === 'ticket' ? 'Ticket ajouté · tu en as ' + tickets[id] : item.name + ' · échange enregistré') + ' · il te reste ' + left + ' PK' });
    this.flash();
  };
  // Recharger mes PA (2026-11-01, demande du porteur : « une boutique de PA avec 4 tarifs », dans le PK shop, rubrique
  // « Recharger mes PA » à côté de « Magasin », comme la maquette docs/20). Prix TTC fixés par le porteur le
  // 2026-11-01 au soir : 500 PA 4,99 €, 1 500 PA 9,99 €, 3 000 PA 15,99 € (le plus populaire), 5 000 PA 19,99 €.
  // Bonus affiché : PA en plus face au prix du pack de 500 PA (100 PA par euro), arrondi.
  // 1ʳᵉ recharge doublée : toujours à valider. Le paiement n'est pas encore branché (il faut les comptes Dropicards, le
  // serveur et Stripe, docs/20) : le récapitulatif le dit, rien n'est débité ni crédité.
  const SHOP_PA_BASE = 500 / 4.99;
  const SHOP_PA_PACKS = [
    { pa: 500, cents: 499, drops: 1 },
    { pa: 1500, cents: 999, drops: 2 },
    { pa: 3000, cents: 1599, drops: 3, tag: 'Le plus populaire' },
    { pa: 5000, cents: 1999, drops: 4, tag: 'Meilleure valeur', best: true }
  ].map(k => Object.assign(k, { eur: (k.cents / 100).toFixed(2).replace('.', ',') + ' €', bonus: Math.max(0, Math.round((k.pa / (SHOP_PA_BASE * k.cents / 100) - 1) * 100)) }));
  const shopNum = n => Number(n).toLocaleString('fr-FR').replace(/\s/g, '\u00a0');
  const shopTabs = (self, s) => {
    const onPa = s.shopTab === 'pa', pa = Number(s.pa) || 0, first = !s.paBought;
    const ask = SHOP_PA_PACKS[s.shopPaAsk];
    const tot = DEX_DATA.reduce((t, e) => t + (dexPrice(e.n) || 0), 0);
    return {
      isStore: !onPa, isPa: onPa, storeOn: String(!onPa), paOn: String(onPa),
      storeCls: 'pkm-shop-tab' + (onPa ? '' : ' pkm-shop-tab-on'), paCls: 'pkm-shop-tab' + (onPa ? ' pkm-shop-tab-on' : ''),
      goStore: () => self.setState({ shopTab: 'store', shopPaAsk: null }), goPa: () => self.setState({ shopTab: 'pa', shopAsk: null }),
      paLogo: paStill() ? 'img/brand/pa.svg' : 'img/brand/pa-anim.svg', paBal: shopNum(pa), paTotal: shopNum(tot),
      packs: SHOP_PA_PACKS.map((k, i) => ({
        qty: shopNum(k.pa), price: k.eur, bonus: k.bonus ? '+' + k.bonus + ' % offerts' : 'Prix de base', bonusCls: 'pkm-pas-bonus' + (k.bonus ? '' : ' pkm-pas-none'),
        hasTag: !!k.tag, tag: k.tag || '', tagCls: 'pkm-pas-tag' + (k.best ? ' pkm-pas-tag-g' : ''),
        cls: 'pkm-pas-pack pkm-pas-p' + i + (k.tag && !k.best ? ' pkm-pas-hot' : ''), aria: shopNum(k.pa) + ' PA pour ' + k.eur + (k.bonus ? ', dont ' + k.bonus + ' % offerts' : ''),
        drops: Array.from({ length: k.drops }, (_, j) => ({ cls: 'pkm-pas-drop' + (j % 2 ? ' pkm-pas-drop-b' : '') })),
        pick: () => self.setState({ shopPaAsk: i })
      })),
      ask: ask ? {
        open: true, qty: shopNum(ask.pa), bonus: ask.bonus ? 'dont ' + shopNum(Math.round(ask.pa * ask.bonus / (100 + ask.bonus) / 10) * 10) + ' PA offerts (+' + ask.bonus + ' %)' : 'Prix de base',
        first: first ? '+ ' + shopNum(ask.pa) + ' PA' : 'déjà utilisée', get: shopNum(ask.pa * (first ? 2 : 1)) + ' PA', after: shopNum(pa + ask.pa * (first ? 2 : 1)) + ' PA', price: ask.eur,
        soon: 'Le paiement n’est pas encore ouvert : il arrivera avec les comptes Dropicards. Rien n’est débité.', payLabel: 'Payer ' + ask.eur + ' · bientôt',
        close: () => self.setState({ shopPaAsk: null })
      } : { open: false }
    };
  };
  shopProto.vPkShop = function (s) {
    const pk = Number(s.pk) || 0, tickets = s.tickets || {};
    return {
      pk: pk.toLocaleString('fr-FR'),
      items: SHOP_ITEMS.map(it => {
        const n = tickets[it.id] || 0, open = !!this.perks()[it.perk], can = open && !it.soon && pk >= it.price, ask = can && s.shopAsk === it.id;
        const price = it.soon ? 'Prix à venir' : it.price.toLocaleString('fr-FR') + ' PK', g = this.tiers().find(t => t[it.perk]);
        return {
          name: it.name, prize: it.prize, price: price, note: it.note,
          isTicket: it.kind === 'ticket', isDeluxe: it.kind === 'deluxe', hasImg: !!it.img, img: it.img || '', imgAlt: it.imgAlt || '',
          owned: n > 0, ownedText: 'Tu as ' + shopUnit(it, n),
          can: can, cannot: !can,
          missText: !open ? '🔒 Réservé au grade ' + (g ? g.name + ' (' + g.cond + ')' : '') : it.soon ? 'Bientôt disponible' : 'Il te manque ' + (it.price - pk).toLocaleString('fr-FR') + ' PK',
          ask: ask, idle: !ask, buyLabel: (it.kind === 'ticket' ? 'Acheter un ticket · ' : 'Échanger · ') + price,
          confirmText: 'Échanger ' + price + ' contre ' + (it.kind === 'ticket' ? '1 ticket' : 'le lot « ' + it.name + ' »') + ' ?',
          open: () => this.setState({ shopAsk: it.id }), cancel: () => this.setState({ shopAsk: null }), buy: () => this.shopBuy(it.id)
        };
      }),
      // Rubriques (2026-11-01, porteur) : « Magasin » (les articles) et « Recharger mes PA » (packs de PA en argent réel).
      ...shopTabs(this, s),
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
