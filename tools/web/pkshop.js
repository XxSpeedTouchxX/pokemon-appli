  // ——— PK shop (2026-10-12, demande du porteur) ———
  // Le 4ᵉ onglet (Territoire) devient « PK shop » : on y dépense ses PK. Premier article : un ticket de participation au
  // tirage au sort d'un booster Pokémon. Territoire reste accessible depuis l'accueil (« Boutiques près de toi »).
  // Le tirage lui-même n'est pas fait par l'app : il demande un règlement, l'identité de l'organisateur et un moyen de
  // contacter le gagnant (serveur, comptes). En attendant, les tickets sont gardés sur l'appareil et l'app l'affiche.
  // Ce module partage la portée des autres : ses noms commencent par SHOP_ ou shop.
  // Prix (2026-10-12, porteur) : ticket 2 000 PK ; lot « Booster 30 ans Pokémon » 15 000 PK (visuel officiel du booster).
  // Le lot s'échange directement (pas de tirage) ; son envoi demande un compte et une adresse : l'app l'enregistre sur
  // l'appareil et l'annonce, sans rien expédier pour l'instant.
  // Nouveau magasin (2026-11-06, porteur ; serveur : tools/supabase/007_admin_boutique.sql) :
  // - 3 tickets, chacun pour un tirage au sort toutes les 2 semaines (dimanche 20 h, heure de Paris, dès le 22 novembre
  //   2026) : Bronze 500 PK (un booster, 5 à 15 €), Argent 1 500 PK (un item rare, 20 à 60 €), Or 5 000 PK (l'ETB de
  //   la série du moment, 60 à 200 €) ; lots du moment susceptibles de changer avec les sorties ;
  // - 3 achats directs : booster de la série du moment 7 500 PK, item rare au choix 10 000 PK, ETB 30 ans 15 000 PK ;
  // - plus de grade demandé (le prix suffit) ; toujours 7 jours après la confirmation de l'adresse, pièce d'identité du
  //   gagnant ou de l'acheteur vérifiée avant l'envoi. Les anciens articles (ticket 2 000 PK, lot 15 000 PK) sont retirés.
  const SHOP_RARE = ['Coffret classeur', 'Poster', 'Coffret thématique', 'Collection', 'Pokébox', 'Mini tin', 'Bundle'];
  const SHOP_ITEMS = [
    { id: 'ticket-bronze', kind: 'ticket', tier: 'bronze', tag: 'BRONZE', name: 'Ticket Bronze', prize: 'Tirage d’un booster Pokémon', value: 'Valeur du lot : 5 à 15 €', price: 500,
      note: 'Lot du moment : un booster 30 ans. Il peut changer avec les sorties.', head: 'Tickets du tirage au sort', headSub: 'Un tirage toutes les 2 semaines, pour chaque ticket. Un ticket = une chance : plus tu en as, plus tu as de chances.' },
    { id: 'ticket-argent', kind: 'ticket', tier: 'argent', tag: 'ARGENT', name: 'Ticket Argent', prize: 'Tirage d’un item rare', value: 'Valeur du lot : 20 à 60 €', price: 1500,
      note: 'Coffret classeur, poster, coffret thématique, collection, Pokébox, mini tin ou bundle, selon la série du moment.' },
    { id: 'ticket-or', kind: 'ticket', tier: 'or', tag: 'OR', name: 'Ticket Or', prize: 'Tirage de l’ETB de la série du moment', value: 'Valeur du lot : 60 à 200 €', price: 5000,
      note: 'Ultra rare : le Coffret Dresseur d’élite (ETB) de la série du moment.' },
    { id: 'achat-booster', kind: 'lot', name: 'Booster de la série du moment', prize: 'Booster 30 ans, envoyé chez toi', value: 'Valeur : 5 à 15 €', price: 7500,
      img: 'img/shop-booster-30-anniversaire.webp', imgAlt: 'Booster du 30ᵉ anniversaire Pokémon',
      note: 'Achat direct, sans tirage.', head: 'Achat direct', headSub: 'Sans tirage : l’article est pour toi. Envoi après vérification de ton identité.' },
    { id: 'achat-rare', kind: 'lot', name: 'Item rare au choix', prize: 'Un item rare de la série du moment, envoyé chez toi', value: 'Valeur : 20 à 60 €', price: 10000,
      img: 'img/products/30th-poster-collection.webp', imgAlt: 'Collection poster 30ᵉ anniversaire Pokémon', wide: true, choices: SHOP_RARE,
      note: 'Tu choisis le type d’item à l’achat ; le modèle dépend de la série du moment.' },
    { id: 'achat-etb-30', kind: 'lot', name: 'ETB 30 ans', prize: 'Coffret Dresseur d’élite 30ᵉ anniversaire, envoyé chez toi', value: 'Valeur : 60 à 200 €', price: 15000,
      img: 'img/products/30th-celebration-elite-trainer-box.webp', imgAlt: 'Coffret Dresseur d’élite 30ᵉ anniversaire', wide: true,
      note: 'Achat direct, sans tirage.' },
    // Item « Deluxe » (2026-10-28, porteur) : réservé au Grand maître mondial Pokémon ; article et prix à définir.
    { id: 'item-deluxe', kind: 'deluxe', name: 'Item Deluxe', prize: 'Un article d’exception, bientôt', price: 0, soon: true,
      note: 'Article et prix annoncés ici prochainement.', perk: 'deluxe', head: 'Bientôt' }
  ];
  // Prochain tirage : un dimanche sur deux à 20 h, heure de Paris, à partir du 22 novembre 2026 (même calcul que le serveur).
  const SHOP_DRAW0 = Date.parse('2026-11-22T19:00:00Z'), SHOP_DRAW_EVERY = 14 * 86400000;
  const shopNextDraw = now => {
    const k = Math.max(0, Math.ceil((now - SHOP_DRAW0) / SHOP_DRAW_EVERY));
    return new Date(SHOP_DRAW0 + k * SHOP_DRAW_EVERY);
  };
  const shopDrawText = d => {
    try { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) + ' à 20 h'; } catch (e) { return ''; }
  };
  const shopProto = Component.prototype;
  // Tickets possédés pour le prochain tirage (tous articles « ticket »), pour la barre sous le solde de PK.
  const shopTickets = s => SHOP_ITEMS.filter(x => x.kind === 'ticket').reduce((n, x) => n + ((s.tickets || {})[x.id] || 0), 0);
  const shopUnit = (it, n) => it.kind === 'ticket' ? (n > 1 ? n + ' tickets pour le prochain tirage' : n + ' ticket pour le prochain tirage') : (n > 1 ? n + ' achats' : n + ' achat');

  shopProto.shopBuy = function (id, choice) {
    const s = this.st(), item = SHOP_ITEMS.find(x => x.id === id), pk = Number(s.pk) || 0;
    if (!item || item.soon || pk < item.price || (item.perk && !this.perks()[item.perk]) || (item.choices && item.choices.indexOf(choice) < 0)) return;
    const tickets = Object.assign({}, s.tickets || {});
    tickets[id] = (tickets[id] || 0) + 1;
    const left = (pk - item.price).toLocaleString('fr-FR');
    this.setState({ pk: pk - item.price, tickets: tickets, shopAsk: null, shopChoice: null,
      toast: (item.kind === 'ticket' ? item.name + ' ajouté · tu en as ' + tickets[id] : item.name + (choice ? ' (' + choice + ')' : '') + ' · achat enregistré') + ' · il te reste ' + left + ' PK' });
    this.flash();
  };
  // Recharger mes PA (2026-11-01, demande du porteur : « une boutique de PA avec 4 tarifs », dans le PK shop, rubrique
  // « Recharger mes PA » à côté de « Magasin », comme la maquette docs/20). Prix TTC et détail fixés par le porteur le
  // 2026-11-01 au soir : 500 PA 4,99 € ; 1 500 PA 9,99 € (1 000 + 500 offerts) ; 3 000 PA 14,99 € (1 500 + 1 500
  // offerts, le plus populaire) ; 5 000 PA 19,99 € (2 000 + 3 000 offerts). Le « +X % offerts » est remplacé par ce détail.
  // 1ʳᵉ recharge doublée : toujours à valider. Le paiement n'est pas encore branché (il faut les comptes Dropicards, le
  // serveur et Stripe, docs/20) : le récapitulatif le dit, rien n'est débité ni crédité.
  const SHOP_PA_PACKS = [
    { pa: 500, cents: 499, base: 500, gift: 0, drops: 1 },
    { pa: 1500, cents: 999, base: 1000, gift: 500, drops: 2 },
    { pa: 3000, cents: 1499, base: 1500, gift: 1500, drops: 3, tag: 'Le plus populaire' },
    { pa: 5000, cents: 1999, base: 2000, gift: 3000, drops: 4, tag: 'Meilleure valeur', best: true }
  ].map(k => Object.assign(k, { eur: (k.cents / 100).toFixed(2).replace('.', ',') + ' €' }));
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
        qty: shopNum(k.pa), price: k.eur, hasGift: !!k.gift, noGift: !k.gift, base: shopNum(k.base), gift: '+ ' + shopNum(k.gift) + ' offerts',
        hasTag: !!k.tag, tag: k.tag || '', tagCls: 'pkm-pas-tag' + (k.best ? ' pkm-pas-tag-g' : ''),
        cls: 'pkm-pas-pack pkm-pas-p' + i + (k.tag && !k.best ? ' pkm-pas-hot' : ''), aria: shopNum(k.pa) + ' PA pour ' + k.eur + (k.gift ? ' : ' + shopNum(k.base) + ' PA et ' + shopNum(k.gift) + ' PA offerts' : ''),
        drops: Array.from({ length: k.drops }, (_, j) => ({ cls: 'pkm-pas-drop' + (j % 2 ? ' pkm-pas-drop-b' : '') })),
        pick: () => self.setState({ shopPaAsk: i })
      })),
      ask: ask ? {
        open: true, qty: shopNum(ask.pa), bonus: ask.gift ? shopNum(ask.base) + ' + ' + shopNum(ask.gift) + ' offerts' : 'Prix de base',
        first: first ? '+ ' + shopNum(ask.pa) + ' PA' : 'déjà utilisée', get: shopNum(ask.pa * (first ? 2 : 1)) + ' PA', after: shopNum(pa + ask.pa * (first ? 2 : 1)) + ' PA', price: ask.eur,
        soon: 'Le paiement n’est pas encore ouvert : il arrivera avec les comptes Dropicards. Rien n’est débité.', payLabel: 'Payer ' + ask.eur + ' · bientôt',
        close: () => self.setState({ shopPaAsk: null })
      } : { open: false }
    };
  };
  shopProto.vPkShop = function (s) {
    const pk = Number(s.pk) || 0, tickets = s.tickets || {}, cg = s.cloudGame || {};
    const draw = shopDrawText(cg.nextDraw ? new Date(cg.nextDraw) : shopNextDraw(Date.now()));
    return {
      pk: pk.toLocaleString('fr-FR'),
      items: SHOP_ITEMS.map(it => {
        const n = tickets[it.id] || 0, open = !it.perk || !!this.perks()[it.perk], can = open && !it.soon && pk >= it.price, ask = can && s.shopAsk === it.id;
        const price = it.soon ? 'Prix à venir' : it.price.toLocaleString('fr-FR') + ' PK', g = it.perk ? this.tiers().find(t => t[it.perk]) : null;
        const choice = ask && it.choices && it.choices.indexOf(s.shopChoice) >= 0 ? s.shopChoice : '';
        return {
          name: it.name, prize: it.prize, price: price, note: it.note, value: it.value || '', hasValue: !!it.value,
          hasHead: !!it.head, head: it.head || '', headSub: it.head === 'Tickets du tirage au sort' ? it.headSub + ' Prochain tirage : ' + draw + '.' : it.headSub || '', hasHeadSub: !!it.headSub,
          isTicket: it.kind === 'ticket', isDeluxe: it.kind === 'deluxe', ticketCls: 'pkm-shop-ticket pkm-shop-t-' + (it.tier || 'gold'), tag: it.tag || 'TICKET',
          hasImg: !!it.img, img: it.img || '', imgAlt: it.imgAlt || '', imgCls: it.wide ? 'pkm-shop-img pkm-shop-img-wide' : 'pkm-shop-img',
          owned: n > 0, ownedText: 'Tu as ' + shopUnit(it, n),
          can: can, cannot: !can,
          missText: !open ? '🔒 Réservé au grade ' + (g ? g.name + ' (' + g.cond + ')' : '') : it.soon ? 'Bientôt disponible' : 'Il te manque ' + (it.price - pk).toLocaleString('fr-FR') + ' PK',
          ask: ask, idle: !ask, buyLabel: (it.kind === 'ticket' ? 'Acheter un ticket · ' : 'Acheter · ') + price,
          hasChoices: ask && !!it.choices, choices: (it.choices || []).map(c => ({ label: c, on: String(c === choice), cls: 'pkm-shop-choice' + (c === choice ? ' pkm-shop-choice-on' : ''), pick: () => this.setState({ shopChoice: c }) })),
          confirmText: it.choices && !choice ? 'Choisis ton item, puis confirme (' + price + ').'
            : 'Échanger ' + price + ' contre ' + (it.kind === 'ticket' ? '1 ' + it.name.toLowerCase() + ' (tirage du ' + draw + ')' : '« ' + it.name + (choice ? ' : ' + choice : '') + ' »') + ' ?',
          confirmOff: String(!!it.choices && !choice),
          open: () => this.setState({ shopAsk: it.id, shopChoice: null }), cancel: () => this.setState({ shopAsk: null, shopChoice: null }),
          buy: () => { if (it.choices && !choice) return; this.shopBuy(it.id, choice || undefined); }
        };
      }),
      // Rubriques (2026-11-01, porteur) : « Magasin » (les articles) et « Recharger mes PA » (packs de PA en argent réel).
      ...shopTabs(this, s),
      rules: 'Participation gratuite : les PK se gagnent sans achat et n’ont aucune valeur en euros. Tirage au sort toutes les 2 semaines, le dimanche à 20 h, fait par l’équipe Dropicards selon un règlement publié avant le premier tirage ; le gagnant est prévenu par e-mail. Tickets et achats ouverts 7 jours après la confirmation de ton adresse ; pièce d’identité vérifiée avant tout envoi.',
      openRules: () => this.legalOpen('pk')
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
