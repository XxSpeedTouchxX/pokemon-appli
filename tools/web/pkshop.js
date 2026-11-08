  // ——— PK shop (2026-10-12, demande du porteur) ———
  // Le 4ᵉ onglet (Territoire) devient « PK shop » : on y dépense ses PK. Premier article : un ticket de participation au
  // tirage au sort d'un booster Pokémon. Territoire reste accessible depuis l'accueil (« Boutiques près de toi »).
  // Le tirage lui-même n'est pas fait par l'app : il demande un règlement, l'identité de l'organisateur et un moyen de
  // contacter le gagnant (serveur, comptes). En attendant, les tickets sont gardés sur l'appareil et l'app l'affiche.
  // Ce module partage la portée des autres : ses noms commencent par SHOP_ ou shop.
  // Prix (2026-10-12, porteur) : ticket 2 000 PK ; lot « Booster 30 ans Pokémon » 15 000 PK (visuel officiel du booster).
  // Le lot s'échange directement (pas de tirage) ; son envoi demande un compte et une adresse : l'app l'enregistre sur
  // l'appareil et l'annonce, sans rien expédier pour l'instant.
  // Nouveau magasin (2026-11-06, porteur ; serveur : tools/supabase/007_admin_boutique.sql puis 008_shop_grades.sql) :
  // - 3 tickets, chacun pour son tirage au sort, le dimanche à 20 h (heure de Paris) : Bronze 500 PK (un booster, 5 à
  //   15 €) toutes les 2 semaines dès le 22 novembre 2026 ; Argent 1 500 PK (un item rare, 20 à 60 €) chaque mois, le
  //   dernier dimanche ; Or 5 000 PK (l'ETB de la série du moment, 60 à 200 €) tous les 2 mois, le dernier dimanche de
  //   novembre, janvier, mars… ; lots du moment susceptibles de changer avec les sorties ;
  // - 3 achats directs : booster de la série du moment 7 500 PK, item rare au choix 25 000 PK, ETB 30 ans 50 000 PK ;
  // - grade demandé (porteur, 2026-11-06) : Recrue et plus → ticket Bronze et booster ; Collectionneur et plus → ticket
  //   Argent et item rare ; Maître Pokémon et plus → ticket Or et ETB. Sinon « Déverrouillé au grade … » et son emblème,
  //   et un appui ouvre la fenêtre « Tu dois d'abord déverrouiller le grade … » ;
  // - 7 jours après la confirmation de l'adresse, pièce d'identité vérifiée avant tout envoi.
  // Les 3 tickets sont réunis dans une seule rubrique ; un appui ouvre la fiche du ticket (lot, valeur, rythme, prochain
  // tirage, à quoi il sert) et l'achat.
  const SHOP_RARE = ['Coffret classeur', 'Poster', 'Coffret thématique', 'Collection', 'Pokébox', 'Mini tin', 'Bundle'];
  const SHOP_ITEMS = [
    { id: 'ticket-bronze', kind: 'ticket', tier: 'bronze', tag: 'BRONZE', name: 'Ticket Bronze', prize: 'Un booster Pokémon', lot: 'un booster Pokémon', value: '5 à 15 €', price: 500, minGrade: 0, cycle: '2w',
      every: 'Toutes les 2 semaines', everyShort: 'toutes les 2 sem.', note: 'Lot du moment : un booster 30 ans. Il peut changer avec les sorties.' },
    { id: 'ticket-argent', kind: 'ticket', tier: 'argent', tag: 'ARGENT', name: 'Ticket Argent', prize: 'Un item rare', lot: 'un item rare', value: '20 à 60 €', price: 1500, minGrade: 2, cycle: '1m',
      every: 'Chaque mois, le dernier dimanche', everyShort: 'chaque mois', note: 'Coffret classeur, poster, coffret thématique, collection, Pokébox, mini tin ou bundle, selon la série du moment.' },
    { id: 'ticket-or', kind: 'ticket', tier: 'or', tag: 'OR', name: 'Ticket Or', prize: 'L’ETB de la série du moment', lot: 'l’ETB de la série du moment', value: '60 à 200 €', price: 5000, minGrade: 4, cycle: '2m',
      every: 'Tous les 2 mois, le dernier dimanche', everyShort: 'tous les 2 mois', note: 'Ultra rare : le Coffret Dresseur d’élite (ETB) de la série du moment.' },
    { id: 'achat-booster', kind: 'lot', name: 'Booster de la série du moment', prize: 'Booster 30 ans, envoyé chez toi', value: 'Valeur : 5 à 15 €', price: 7500, minGrade: 0,
      img: 'img/shop-booster-30-anniversaire.webp', imgAlt: 'Booster du 30ᵉ anniversaire Pokémon',
      note: 'Achat direct, sans tirage.', head: 'Achat direct', headSub: 'Sans tirage : l’article est pour toi. Envoi après vérification de ton identité.' },
    { id: 'achat-rare', kind: 'lot', name: 'Item rare au choix', prize: 'Coffret, classeur… de la série du moment, envoyé chez toi', value: 'Valeur : 20 à 60 €', price: 25000, minGrade: 2,
      img: 'img/products/30th-celebration-binder-collection.webp', imgAlt: 'Coffret classeur 30ᵉ anniversaire Pokémon', wide: true, choices: SHOP_RARE,
      note: 'Tu choisis le type d’item à l’achat ; le modèle dépend de la série du moment.' },
    { id: 'achat-etb-30', kind: 'lot', name: 'ETB 30 ans', prize: 'Coffret Dresseur d’élite 30ᵉ anniversaire, envoyé chez toi', value: 'Valeur : 60 à 200 €', price: 50000, minGrade: 4,
      img: 'img/products/30th-celebration-elite-trainer-box.webp', imgAlt: 'Coffret Dresseur d’élite 30ᵉ anniversaire', wide: true,
      note: 'Achat direct, sans tirage.' },
    // Item « Deluxe » retiré du shop le 2026-11-06 (porteur).
  ];
  // Prochain tirage, même calcul que le serveur (008) ; avec le serveur, ses dates font foi (cloudGame.draws).
  const SHOP_DRAW0 = Date.parse('2026-11-22T19:00:00Z'), SHOP_DRAW_EVERY = 14 * 86400000;
  const shopNextDraw = now => {
    const k = Math.max(0, Math.ceil((now - SHOP_DRAW0) / SHOP_DRAW_EVERY));
    return new Date(SHOP_DRAW0 + k * SHOP_DRAW_EVERY);
  };
  const shopDrawOf = (cyc, now) => {
    if (cyc === '2w') return shopNextDraw(now);
    const n = new Date(now);
    let y = 2026, m = 11;
    if (n.getUTCFullYear() * 12 + n.getUTCMonth() + 1 > y * 12 + m) { y = n.getUTCFullYear(); m = n.getUTCMonth() + 1; }
    for (let k = 0; k < 30; k++) {
      if (cyc === '1m' || ((y * 12 + m) - (2026 * 12 + 11)) % 2 === 0) {
        const last = new Date(Date.UTC(y, m, 0, 19)); // dernier jour du mois m, puis le dimanche d'avant
        last.setUTCDate(last.getUTCDate() - last.getUTCDay());
        if (last.getTime() >= now) return last;
      }
      m++; if (m > 12) { m = 1; y++; }
    }
    return shopNextDraw(now);
  };
  const shopDrawText = d => {
    try { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) + ' à 20 h'; } catch (e) { return ''; }
  };
  const shopProto = Component.prototype;
  // Grade de l'appareil (recopié du serveur) ; un admin déverrouillé (007) passe toujours.
  shopProto.shopGrade = function () {
    const s = this.st();
    if (s.cloudGame && s.cloudGame.unlimited && Cloud.on()) return 5;
    return this.tierOf().i;
  };
  const shopGradeName = i => (PF_GRADES[i] || PF_GRADES[0]).name;
  // Fenêtre « Accès verrouillé » bloquante (2026-11-08, porteur : « l'utilisateur ne doit pas pouvoir faire bouger l'écran
  // de derrière ; il doit d'abord répondre à la fenêtre ») : tant qu'elle est ouverte, aucun geste hors de la fenêtre
  // (défilement, glissement entre pages, retour par le bord) et le fond ne la ferme plus ; seuls ses boutons répondent.
  if (typeof window !== 'undefined' && !window.__pkmLockGuard) {
    window.__pkmLockGuard = true;
    const inWin = t => { const w = document.querySelector('.pkm-lockw'); return !!(w && t && t.nodeType === 1 && w.contains(t)); };
    const scrollsInside = t => { for (let n = t; n && n.nodeType === 1 && !n.classList.contains('pkm-lockw-wrap'); n = n.parentElement) { if (n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) return true; } return false; };
    const guard = e => {
      if (!document.querySelector('.pkm-lockw-wrap')) return;
      const t = e.target;
      if (inWin(t) && (e.type !== 'touchmove' && e.type !== 'wheel' || scrollsInside(t))) return;
      e.stopPropagation();
      if (e.cancelable && (e.type === 'touchmove' || e.type === 'wheel' || !inWin(t))) e.preventDefault();
    };
    ['touchstart', 'touchmove', 'pointerdown', 'pointermove', 'wheel', 'mousedown', 'click'].forEach(k => window.addEventListener(k, guard, { capture: true, passive: false }));
  }
  // Fenêtre « Tu dois d'abord déverrouiller le grade … ».
  shopProto.shopLockOpen = function (it) { this.setState({ shopLock: { g: it.minGrade, kind: it.kind } }); };
  // Fenêtre « Accès verrouillé », pour tout l'app (PK shop, Radar, classeur plein ; 2026-11-07).
  const shopLockText = lk => {
    const g = shopGradeName(lk.g);
    if (lk.kind === 'radar') return 'Tu ne peux pas accéder au Radar tant que tu n’as pas atteint le grade « ' + g + ' ».';
    if (lk.kind === 'binder') return 'Ton classeur est plein : ' + lk.lim + ' ' + lk.what + ' au maximum au grade ' + shopGradeName(lk.cur) + '. Tu dois d’abord déverrouiller le grade ' + g + ' pour en ajouter plus.';
    return 'Tu dois d’abord déverrouiller le grade ' + g + ' pour avoir accès à ' + (lk.kind === 'ticket' ? 'cette loterie.' : 'cet item.');
  };
  // Classeur limité selon le grade (2026-11-07, porteur) : cartes et items scellés comptés à part (exemplaires
  // possédés, ventes déduites) ; illimité dès Maître Pokémon et pour un admin déverrouillé. Un ajout de trop n'est pas
  // enregistré : la fenêtre « Accès verrouillé » s'ouvre. La collection déjà là n'est jamais retirée.
  shopProto.binderCounts = function (s) {
    const c = this.compute(s);
    let cards = 0, sealed = 0;
    this.catalog().forEach(p => { const q = c.stock[p.id] ? c.stock[p.id].qty : 0; if (q > 0) { if (p.type === 'sealed') sealed += q; else cards += q; } });
    return { cards: cards, sealed: sealed };
  };
  shopProto.binderRoom = function (s, pid, qty) {
    const gi = this.shopGrade(), g = PF_GRADES[gi];
    if (!g || !g.cards) return null;
    const p = this.catalog().find(x => x.id === pid);
    if (!p) return null;
    const sealed = p.type === 'sealed', lim = sealed ? g.sealed : g.cards, n = this.binderCounts(s), have = sealed ? n.sealed : n.cards;
    if (have + (qty || 1) <= lim) return null;
    const to = PF_GRADES.findIndex((x, i) => i > gi && (!x.cards || (sealed ? x.sealed : x.cards) >= have + (qty || 1)));
    return { g: to < 0 ? PF_GRADES.length - 1 : to, cur: gi, kind: 'binder', lim: lim, what: sealed ? 'items scellés' : 'cartes' };
  };
  const shopBaseRecord = shopProto.addRecord;
  shopProto.addRecord = function (s, pid, qty, price, where, by) {
    const room = this.binderRoom(s, pid, qty);
    this.__binderBlocked = !!room;
    if (room) {
      setTimeout(() => this.setState({ shopLock: room, toast: null }), 0);
      return { purchases: s.purchases, msg: 'Classeur plein au grade ' + shopGradeName(room.cur), blocked: true };
    }
    return shopBaseRecord.call(this, s, pid, qty, price, where, by);
  };
  // Tickets possédés pour le prochain tirage (tous articles « ticket »), pour la barre sous le solde de PK.
  const shopTickets = s => SHOP_ITEMS.filter(x => x.kind === 'ticket').reduce((n, x) => n + ((s.tickets || {})[x.id] || 0), 0);
  const shopUnit = (it, n) => it.kind === 'ticket' ? (n > 1 ? n + ' tickets pour le prochain tirage' : n + ' ticket pour le prochain tirage') : (n > 1 ? n + ' achats' : n + ' achat');

  shopProto.shopBuy = function (id, choice) {
    const s = this.st(), item = SHOP_ITEMS.find(x => x.id === id), pk = Number(s.pk) || 0;
    if (!item || item.soon || pk < item.price || this.shopGrade() < (item.minGrade || 0) || (item.choices && item.choices.indexOf(choice) < 0)) return;
    const tickets = Object.assign({}, s.tickets || {});
    tickets[id] = (tickets[id] || 0) + 1;
    const left = (pk - item.price).toLocaleString('fr-FR');
    this.setState({ pk: pk - item.price, tickets: tickets, shopAsk: null, shopChoice: null,
      toast: item.kind === 'ticket' ? item.name + ' ajouté · tu en as ' + tickets[id] + ' · il te reste ' + left + ' PK' : null });
    this.flash();
    this.shopDone(id, choice, tickets[id]);
  };
  // ——— Après un achat (2026-11-07, porteur) ———
  // Série du moment, citée dans le message des achats directs (à changer avec les sorties).
  const SHOP_SERIES = '30ᵉ anniversaire';
  // Ticket acheté : le ticket apparaît avec un « +1 ». Trois propositions, à choisir par le porteur (?anitk=1, 2 ou 3) :
  //   1. Envol : le ticket surgit au centre, rebondit, « +1 » monte, puis il s'envole vers le ticket de la fiche ;
  //   2. Tampon : le ticket surgit, un tampon « VALIDÉ » s'abat (secousse), « +1 » rebondit, quelques étincelles, puis il
  //      s'envole vers le ticket de la fiche comme dans la 1 (choix du porteur, par défaut) ;
  //   3. Brillance : le ticket tourne sur lui-même (recto, verso), un reflet le traverse, « +1 » et une gerbe d'étoiles.
  // Choix du porteur (2026-11-07) : le tampon (2), avec l'envol final de la proposition 1. Les autres restent pour essai.
  const SHOP_TKFX = (() => { try { const m = /[?&]anitk=([123])\b/.exec(location.search); return m ? Number(m[1]) : 2; } catch (e) { return 2; } })();
  const shopStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const shopEsc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const shopTicketFx = (it, n) => {
    const v = shopStill() ? 0 : SHOP_TKFX, ov = document.createElement('div');
    ov.className = 'pkm-tkfx pkm-tkfx-v' + v; ov.setAttribute('aria-hidden', 'true');
    let sparks = '';
    if (v >= 2) for (let k = 0; k < 12; k++) sparks += '<i class="pkm-tkfx-sp" style="--a: ' + (k * 30) + 'deg; animation-delay: ' + (v === 2 ? 0.55 : 0.9) + 's"></i>';
    ov.innerHTML = '<div class="pkm-tkfx-box"><span class="pkm-tkfx-tk"><span class="pkm-shop-ticket pkm-shop-ticket-xl pkm-shop-t-' + it.tier + '"><span class="pkm-shop-ticket-in">' + shopEsc(it.tag) + '</span></span>'
      + (v === 3 ? '<i class="pkm-tkfx-shine"></i>' : '') + (v === 2 ? '<b class="pkm-tkfx-stamp">VALIDÉ</b>' : '') + '</span>'
      + '<b class="pkm-tkfx-plus">+1</b>' + sparks + '<span class="pkm-tkfx-cap">' + shopEsc(it.name) + ' · tu en as ' + (n || 1) + '</span></div>';
    document.body.appendChild(ov);
    if (v === 1 || v === 2) {
      // Vers le ticket de la fiche ouverte (ou vers le haut de l'écran) à la fin.
      setTimeout(() => {
        const box = ov.querySelector('.pkm-tkfx-tk'), to = document.querySelector('.pkm-tks-top .pkm-shop-ticket-xl');
        if (!box || !box.animate) return;
        const a = box.getBoundingClientRect(), b = to ? to.getBoundingClientRect() : { left: a.left, top: 40, width: a.width, height: a.height };
        const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
        box.animate([{ transform: 'translate(0, 0) scale(1.7)', opacity: 1 }, { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(0.6)', opacity: 0 }], { duration: 520, easing: 'cubic-bezier(0.55, 0, 0.7, 0.4)', fill: 'forwards' });
      }, v === 2 ? 1600 : 1350);
    }
    setTimeout(() => ov.remove(), v === 0 ? 1600 : 2500);
  };
  // Achat direct : l'article apparaît, confettis et feu d'artifice (comme le Booster PK à 500 PK), et le message du porteur.
  const shopLotText = (it, choice) => {
    const mail = ' Tu vas recevoir très prochainement un e-mail t’indiquant la démarche à suivre pour réceptionner ';
    if (it.id === 'achat-booster') return 'Tu viens d’acheter un booster Pokémon ' + SHOP_SERIES + '.' + mail + 'ton booster directement à ton domicile.';
    if (it.id === 'achat-rare') return 'Tu viens d’acheter un item rare' + (choice ? ' : ' + choice : '') + ' de la série ' + SHOP_SERIES + '.' + mail + 'ton item directement à ton domicile.';
    if (it.id === 'achat-etb-30') return 'Tu viens d’acheter l’ETB ' + SHOP_SERIES + ' (Coffret Dresseur d’élite).' + mail + 'ton ETB directement à ton domicile.';
    return 'Tu viens d’acheter ' + it.name + '.' + mail + 'ton article directement à ton domicile.';
  };
  const shopLotFx = (it, choice) => {
    const ov = document.createElement('div');
    ov.className = 'pkm-lotfx'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Achat confirmé');
    ov.innerHTML = '<div class="pkm-lotfx-card pkm-dark"><span class="pkm-lotfx-glow" aria-hidden="true"></span>'
      + (it.img ? '<img class="pkm-lotfx-img' + (it.wide ? ' pkm-lotfx-wide' : '') + '" src="' + shopEsc(it.img) + '" alt="' + shopEsc(it.imgAlt || it.name) + '">' : '')
      + '<h2>Bravo !</h2><p>' + shopEsc(shopLotText(it, choice)) + '</p><button type="button" class="pkm-lotfx-ok">Super !</button></div>';
    const close = () => {
      const card = ov.querySelector('.pkm-lotfx-card');
      if (card && card.animate && !shopStill()) { card.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(40px) scale(0.96)', opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' }); ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' }); setTimeout(() => ov.remove(), 280); }
      else ov.remove();
    };
    ov.addEventListener('click', e => { if (e.target === ov || (e.target.closest && e.target.closest('.pkm-lotfx-ok'))) close(); });
    document.body.appendChild(ov);
    setTimeout(() => { const b = ov.querySelector('.pkm-lotfx-ok'); if (b) b.focus({ preventScroll: true }); }, 50);
    if (typeof gmParty === 'function') setTimeout(() => gmParty(500), 250);
  };
  shopProto.shopDone = function (id, choice, count) {
    const it = SHOP_ITEMS.find(x => x.id === id);
    if (!it) return;
    if (it.kind === 'ticket') shopTicketFx(it, count); else shopLotFx(it, choice);
    if (typeof this.shopNotify === 'function') this.shopNotify();
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
  // Compte à rebours de la fiche d'un ticket (2026-11-07, porteur : « une sorte de décompte avec le temps restant et la
  // date finale à côté ») : jours, heures, minutes, secondes aux couleurs du ticket, date du tirage, barre du cycle
  // écoulé (2 semaines, 1 mois, 2 mois) et « Dernière ligne droite » le dernier jour. Les chiffres sont mis à jour chaque
  // seconde directement dans la page (pas de nouveau rendu de l'app).
  const SHOP_CYCLE_MS = { '2w': 14 * 86400000, '1m': 30 * 86400000, '2m': 61 * 86400000 };
  const shopCd = end => {
    const ms = Math.max(0, end - Date.now()), d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
    return { ms: ms, d: String(d), h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(sec).padStart(2, '0') };
  };
  let shopCdTimer = null;
  const shopCdTick = () => {
    const box = document.querySelector('.pkm-tks-cd');
    if (!box) { clearInterval(shopCdTimer); shopCdTimer = null; return; }
    const end = Number(box.getAttribute('data-end')), cyc = Number(box.getAttribute('data-cycle')), c = shopCd(end);
    ['d', 'h', 'm', 's'].forEach(k => { const el = box.querySelector('[data-u="' + k + '"]'); if (el && el.textContent !== c[k]) el.textContent = c[k]; });
    const bar = box.querySelector('.pkm-tks-cd-bar i');
    if (bar && cyc) bar.style.width = Math.min(100, Math.max(0, (1 - c.ms / cyc) * 100)).toFixed(2) + '%';
  };
  // Fermeture de la fiche d'un ticket : elle descend et le voile s'efface, puis elle se ferme (comme « Mon Pokédex »).
  let shopSheetClosing = false;
  const shopSheetSlide = done => {
    const sheet = document.querySelector('.pkm-tks-sheet'), scrim = document.querySelector('.pkm-tks-wrap .pkm-pas-scrim');
    let still = false; try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { still = true; }
    if (shopSheetClosing) return;
    if (!sheet || !sheet.animate || still) { done(); return; }
    shopSheetClosing = true;
    sheet.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(105%)' }], { duration: 380, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' });
    if (scrim) scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => { shopSheetClosing = false; done(); }, 360);
  };
  shopProto.vPkShop = function (s) {
    const pk = Number(s.pk) || 0, tickets = s.tickets || {}, cg = s.cloudGame || {}, gi = this.shopGrade();
    const drawOf = it => (cg.draws && cg.draws[it.id] ? new Date(cg.draws[it.id]) : shopDrawOf(it.cycle, Date.now()));
    const emblem = i => 'img/grades/grade-' + (i + 1) + '.svg';
    const lockLabel = it => 'Déverrouillé au grade ' + shopGradeName(it.minGrade);
    const tks = SHOP_ITEMS.filter(it => it.kind === 'ticket');
    const cur = tks.find(it => it.id === s.shopTk);
    // Fiche d'un ticket (appui sur un ticket).
    const sheet = (() => {
      if (!cur) return { open: false };
      const it = cur, n = tickets[it.id] || 0, open = gi >= it.minGrade, can = open && pk >= it.price, ask = can && s.shopAsk === it.id;
      const price = it.price.toLocaleString('fr-FR') + ' PK', drawAt = drawOf(it), draw = shopDrawText(drawAt);
      const end = drawAt.getTime(), cyc = SHOP_CYCLE_MS[it.cycle] || SHOP_CYCLE_MS['2w'], cd = shopCd(end);
      if (!shopCdTimer) shopCdTimer = setInterval(shopCdTick, 1000);
      return {
        cdEnd: String(end), cdCycle: String(cyc), cdD: cd.d, cdH: cd.h, cdM: cd.m, cdS: cd.s, cdCls: 'pkm-tks-cd pkm-tks-cd-' + it.tier,
        cdW: 'width: ' + Math.min(100, Math.max(0, (1 - cd.ms / cyc) * 100)).toFixed(2) + '%', cdDate: 'Tirage le ' + draw,
        cdLast: cd.ms < 86400000, cdAria: 'Temps restant avant le tirage : ' + cd.d + ' jours, ' + Number(cd.h) + ' heures et ' + Number(cd.m) + ' minutes. Tirage le ' + draw + '.',
        open: true, name: it.name, tag: it.tag, ticketCls: 'pkm-shop-ticket pkm-shop-ticket-xl pkm-shop-t-' + it.tier, prize: it.prize, value: it.value,
        every: it.every, draw: draw, price: price, priceN: it.price.toLocaleString('fr-FR'), note: it.note,
        use: 'Ce ticket te donne une chance de gagner ' + it.lot + ' au tirage du ' + draw + '. Plus tu as de tickets, plus tu as de chances. Un ticket ne sert que pour ce tirage ; le gagnant est prévenu par e-mail et reçoit son lot chez lui, après vérification de son identité.',
        owned: n > 0, ownedText: 'Tu as ' + shopUnit(it, n), locked: !open, lockLabel: lockLabel(it), lockImg: emblem(it.minGrade),
        can: can, miss: open && !can, missText: 'Il te manque ' + (it.price - pk).toLocaleString('fr-FR') + ' PK',
        ask: ask, idle: !ask, buyLabel: 'Acheter un ticket · ' + price, confirmText: 'Échanger ' + price + ' contre 1 ' + it.name.toLowerCase() + ' ?',
        buyOpen: () => this.setState({ shopAsk: it.id }), cancel: () => this.setState({ shopAsk: null }), buy: () => this.shopBuy(it.id),
        lock: () => this.shopLockOpen(it), close: () => shopSheetSlide(() => this.setState({ shopTk: null, shopAsk: null }))
      };
    })();
    return {
      pk: pk.toLocaleString('fr-FR'),
      ticketsHead: 'Tickets du tirage au sort', ticketsSub: 'Chaque ticket a son tirage, le dimanche à 20 h. Touche un ticket pour voir son lot et à quoi il sert.',
      tickets: tks.map(it => {
        const n = tickets[it.id] || 0, open = gi >= it.minGrade;
        return {
          name: it.name, tag: it.tag, ticketCls: 'pkm-shop-ticket pkm-shop-t-' + it.tier, price: it.price.toLocaleString('fr-FR') + ' PK', priceN: it.price.toLocaleString('fr-FR'), every: it.everyShort,
          locked: !open, lockName: shopGradeName(it.minGrade), lockImg: emblem(it.minGrade), owned: n > 0, ownedText: '×' + n,
          cls: 'pkm-shop-tk' + (open ? '' : ' pkm-shop-tk-off'), aria: it.name + ', ' + it.price + ' PK, tirage ' + it.everyShort + (open ? '' : ', déverrouillé au grade ' + shopGradeName(it.minGrade)) + '. Voir le ticket',
          pick: () => { this.setState({ shopTk: it.id, shopAsk: null }); requestAnimationFrame(() => requestAnimationFrame(() => { const sh = document.querySelector('.pkm-tks-sheet'); if (sh) sh.scrollTop = 0; })); }
        };
      }),
      sheet: sheet,
      items: SHOP_ITEMS.filter(it => it.kind !== 'ticket').map(it => {
        const n = tickets[it.id] || 0, open = gi >= (it.minGrade || 0), can = open && !it.soon && pk >= it.price, ask = can && s.shopAsk === it.id;
        const price = it.price.toLocaleString('fr-FR') + ' PK';
        const choice = ask && it.choices && it.choices.indexOf(s.shopChoice) >= 0 ? s.shopChoice : '';
        return {
          name: it.name, prize: it.prize, price: price, priceN: it.price.toLocaleString('fr-FR'), note: it.note, value: it.value || '', hasValue: !!it.value,
          hasHead: !!it.head, head: it.head || '', headSub: it.headSub || '', hasHeadSub: !!it.headSub,
          isTicket: false, isDeluxe: false, ticketCls: 'pkm-shop-ticket', tag: 'TICKET',
          hasImg: !!it.img, img: it.img || '', imgAlt: it.imgAlt || '', imgCls: it.wide ? 'pkm-shop-img pkm-shop-img-wide' : 'pkm-shop-img',
          owned: n > 0, ownedText: 'Tu as ' + shopUnit(it, n),
          can: can, cannot: !can && open, locked: !open, lockLabel: lockLabel(it), lockImg: emblem(it.minGrade || 0), lock: () => this.shopLockOpen(it),
          missText: it.soon ? 'Bientôt disponible' : 'Il te manque ' + (it.price - pk).toLocaleString('fr-FR') + ' PK',
          ask: ask, idle: !ask, buyLabel: 'Acheter · ' + price,
          hasChoices: ask && !!it.choices, choices: (it.choices || []).map(c => ({ label: c, on: String(c === choice), cls: 'pkm-shop-choice' + (c === choice ? ' pkm-shop-choice-on' : ''), pick: () => this.setState({ shopChoice: c }) })),
          confirmText: it.choices && !choice ? 'Choisis ton item, puis confirme (' + price + ').' : 'Échanger ' + price + ' contre « ' + it.name + (choice ? ' : ' + choice : '') + ' » ?',
          confirmOff: String(!!it.choices && !choice),
          open: () => this.setState({ shopAsk: it.id, shopChoice: null }), cancel: () => this.setState({ shopAsk: null, shopChoice: null }),
          buy: () => { if (it.choices && !choice) return; this.shopBuy(it.id, choice || undefined); }
        };
      }),
      // Rubriques (2026-11-01, porteur) : « Magasin » (les articles) et « Recharger mes PA » (packs de PA en argent réel).
      ...shopTabs(this, s),
      rules: 'Participation gratuite : les PK se gagnent sans achat et n’ont aucune valeur en euros. Tirages au sort le dimanche à 20 h (Bronze toutes les 2 semaines, Argent chaque mois, Or tous les 2 mois), fait par l’équipe Dropicards selon un règlement publié avant le premier tirage ; le gagnant est prévenu par e-mail. Tickets et achats ouverts 7 jours après la confirmation de ton adresse ; pièce d’identité vérifiée avant tout envoi.',
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
    const lk = s.shopLock;
    r.lockw = lk ? {
      open: true, img: 'img/grades/grade-' + (lk.g + 1) + '.svg', grade: shopGradeName(lk.g), text: shopLockText(lk),
      cond: 'Condition : ' + (this.tiers()[lk.g] || {}).cond + '.',
      close: () => this.setState({ shopLock: null }),
      // Radar (2026-11-07, porteur) : aussi inclus dans l'abonnement Premium, bouton vers l'offre.
      prem: lk.kind === 'radar' && typeof this.premOpen === 'function',
      premText: 'Tu peux aussi l’avoir tout de suite en prenant l’abonnement Premium : le Radar des boutiques y est inclus.',
      premGo: () => { this.setState({ shopLock: null }); this.premOpen(); },
      grades: () => { this.setState({ shopLock: null, shopTk: null }); this.push('grade', { gradeIx: lk.g }); }
    } : { open: false };
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
