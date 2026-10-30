  // ——— Première visite et alertes (2026-10-11) ———
  // Première visite : collection vide et accueil guidé ouvert tout seul (build.mjs). La collection de démo n'est
  // plus proposée sur le premier écran (2026-10-29, porteur) : Réglages › « Remettre la démo » seulement.
  // Alertes : « Me prévenir » (Sorties) et les alertes de boutique enregistraient seulement un choix, sans jamais
  // prévenir. Désormais, à chaque ouverture de l'app : un encadré « Tes alertes » sur l'accueil (et une notification
  // du téléphone si l'utilisateur l'a autorisée) quand un produit suivi sort, et la veille ou le jour d'une sortie
  // pour les boutiques suivies. Aucune information de stock : un rappel, rien de plus. Chaque alerte n'est montrée
  // qu'une fois (« alertsDone », enregistré avec la collection).
  const ST_DAY = 86400000;
  const stDays = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / ST_DAY);

  // Lugia de la Collection Classique : visuel de la carte d'origine (Aquapolis 149/147, voir CLASSIC_30) ; repli sur le
  // Lugia de Neo Genesis si le catalogue ne l'a pas.
  // Premier écran (2026-10-29, porteur) : cinq cartes en éventail, de gauche à droite : Pikachu-ex « forêt »
  // (Héros Transcendants, illustration spéciale de booota), Dracaufeu du Set de Base (1re édition), Lugia réimprimé
  // de la Collection Classique, Mew-ex et Mewtwo-ex illustrations spéciales du 30ᵉ anniversaire.
  const ST_FAN = [['me02.5-276'], ['base1-4'], ['30th-c-029', 'neo1-9'], ['30th-152'], ['30th-151']];
  // Cartes de 92 × 129 dans un cadre de 320 px : le centre devant, les bords derrière et plus inclinés (l'ordre de la
  // liste fait l'empilement).
  const ST_POS = [
    { i: 0, left: '10px', top: '44px', rot: '-18deg' }, { i: 4, left: '218px', top: '44px', rot: '18deg' },
    { i: 1, left: '58px', top: '18px', rot: '-9deg' }, { i: 3, left: '170px', top: '18px', rot: '9deg' },
    { i: 2, left: '114px', top: '4px', rot: '0deg' }
  ];
  const stBaseOnb = proto.vOnb;
  proto.vOnb = function (x) {
    const r = stBaseOnb.call(this, x);
    if (TCG.status === 'ready' && r.fan) {
      const fan = ST_POS.map(p => {
        const id = ST_FAN[p.i].find(k => TCG.byId[k] && TCG.item(k).imgLang);
        if (!id) return null;
        // Copie gardée dans l'app (web/img/onb/, tools/brand/fetch_onb_cards.py, 2026-10-30) : les visuels du CDN
        // restaient noirs sur le téléphone du porteur ; le CDN reste en secours.
        const it = TCG.item(id);
        return { img: 'img/onb/' + ST_FAN[p.i][0] + '.webp', fallback: it.imgHi || it.img, left: p.left, top: p.top, rot: p.rot };
      });
      if (fan.every(Boolean)) r.fan = fan;
    }
    // Après « Commencer l'aventure ! » (2026-10-30, porteur) : plus de questions sur le profil ; création du compte
    // (e-mail et mot de passe), puis pseudo de dresseur. Les comptes Dropicards n'existent pas encore côté serveur
    // (docs/17, en attente de « go ») : l'adresse, le choix des nouveautés et le pseudo sont gardés sur l'appareil
    // (account, trainer) ; le mot de passe n'est jamais enregistré par l'app (le trousseau du téléphone peut le garder).
    const s = x.s, acc = s.account && s.account.email ? s.account : null, tr = s.trainer || {};
    const ST_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    r.next1 = () => { if (acc) this.finishOnb(false); else this.setState({ onb: 2, obErr: '' }); };
    r.canSkip = !!acc;
    r.dots = [1, 2, 3].map(n => ({ w: n === s.onb ? '22px' : '8px', bg: n <= s.onb ? 'var(--pkm-accent)' : '#2A3A5C' }));
    const err = s.obErr || '';
    r.acc = {
      email: s.obEmail !== undefined ? s.obEmail : (tr.email || ''), pwd: s.obPwd || '', news: !!s.obNews,
      shown: s.obShow ? 'true' : 'false', pwType: s.obShow ? 'text' : 'password', eye: s.obShow ? 'Masquer' : 'Afficher',
      emailBad: /e-mail/.test(err) ? 'true' : 'false', pwdBad: /mot de passe/.test(err) ? 'true' : 'false',
      err: err, hasErr: !!err && s.onb === 2,
      note: 'Ton adresse sert à te connecter et, seulement si tu le coches, à recevoir nos nouveautés. Tu peux te désinscrire à tout moment.',
      onEmail: e => this.setState({ obEmail: String(e.target.value || '').trim() }),
      onPwd: e => this.setState({ obPwd: String(e.target.value || '') }),
      onNews: e => this.setState({ obNews: !!e.target.checked }),
      toggle: () => this.setState({ obShow: !this.st().obShow }),
      submit: e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        const email = String(f && f.email ? f.email.value : t.obEmail || '').trim().toLowerCase(), pwd = String(f && f.password ? f.password.value : t.obPwd || '');
        const news = f && f.news ? !!f.news.checked : !!t.obNews;
        if (!ST_MAIL.test(email)) { this.setState({ obEmail: email, obErr: 'Adresse e-mail invalide : vérifie-la (exemple : sacha@exemple.fr).' }); return; }
        if (pwd.length < 12) { this.setState({ obEmail: email, obPwd: '', obErr: 'Ton mot de passe doit faire au moins 12 caractères.' }); return; }
        this.setState({ account: { email: email, news: news, at: realToday(), server: false }, trainer: Object.assign({}, t.trainer || {}, { email: email }),
          obEmail: undefined, obPwd: '', obShow: false, obNews: false, obErr: '', onb: 3 });
      }
    };
    r.nick = {
      value: s.obNick !== undefined ? s.obNick : (tr.name || ''), bad: /pseudo/.test(err) ? 'true' : 'false', err: err, hasErr: !!err && s.onb === 3,
      onInput: e => this.setState({ obNick: String(e.target.value || '').slice(0, 24) }),
      submit: e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        const name = String(f && f.nickname ? f.nickname.value : t.obNick || '').replace(/\s+/g, ' ').trim().slice(0, 24);
        if (name.length < 2) { this.setState({ obNick: name, obErr: 'Choisis un pseudo de 2 à 24 caractères.' }); return; }
        this.setState({ trainer: Object.assign({}, t.trainer || {}, { name: name }), obNick: undefined, obErr: '', toast: 'Bienvenue, ' + name + ' !' });
        this.finishOnb(false);
      }
    };
    return r;
  };

  // Alertes à montrer maintenant : [{ key, title, text, open }].
  proto.alertsDue = function (s) {
    if (SEALED.status !== 'ready') return [];
    const today = realToday(), done = s.alertsDone || {}, out = [], al = s.alerts || {};
    const all = SEALED.list();
    all.forEach(p => {
      const key = 'rel:' + p.id;
      if (!al[key] || done[key]) return;
      const day = p.release || p.released;
      if (!day || day > today) return;
      out.push({ key: key, title: 'C’est sorti : ' + p.name, text: 'Sortie le ' + this.d2(day) + '. Retrouve les liens directs des enseignes dans Sorties.', open: () => this.openTcg(p.id) });
    });
    const shops = Object.keys(al).filter(k => k.indexOf('osm:') === 0 && al[k]);
    if (shops.length) {
      all.filter(p => p.release && stDays(p.release, today) >= 0 && stDays(p.release, today) <= 1).forEach(p => {
        const key = 'osmday:' + p.id + ':' + p.release;
        if (done[key]) return;
        const when = stDays(p.release, today) === 0 ? 'aujourd’hui' : 'demain';
        out.push({ key: key, title: p.name + ' sort ' + when, text: 'Tu suis ' + shops.length + (shops.length > 1 ? ' boutiques' : ' boutique') + ' : pense à passer les voir. Indice estimé, aucun stock garanti.', open: () => this.openReleases() });
      });
    }
    return out;
  };
  proto.alertsSeen = function (keys) {
    const s = this.st(), done = Object.assign({}, s.alertsDone || {});
    keys.forEach(k => { done[k] = realToday(); });
    this.setState({ alertsDone: done });
  };
  // Notification du téléphone (si autorisée), une seule fois par alerte et par ouverture.
  const stNotified = new Set();
  const stNotify = list => {
    try {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      list.forEach(a => { if (!stNotified.has(a.key)) { stNotified.add(a.key); new Notification(a.title, { body: a.text, icon: 'icons/icon-192.png', tag: a.key }); } });
    } catch (e) { /* notifications indisponibles */ }
  };
  // Autorisation des notifications demandée au moment où l'utilisateur crée une alerte (jamais au lancement).
  const stAsk = () => { try { if (typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission().catch(() => {}); } catch (e) { /* rien */ } };
  const stBaseRelAlert = proto.releaseAlert;
  proto.releaseAlert = function (p) {
    const on = !this.st().alerts['rel:' + p.id];
    stBaseRelAlert.call(this, p);
    if (!on) return;
    stAsk();
    this.setState({ toast: 'Alerte enregistrée : tu seras prévenu à l’ouverture de l’app le jour de la sortie de ' + p.name });
  };
  if (typeof radarProto !== 'undefined') {
    const stBaseShopAlert = radarProto.radarAlert;
    radarProto.radarAlert = function (id) {
      const on = !this.st().alerts['osm:' + id];
      stBaseShopAlert.call(this, id);
      if (!on) return;
      stAsk();
      this.setState({ toast: 'Alerte activée pour cette boutique : rappel la veille et le jour de chaque sortie (suivi du stock en ligne pas encore branché)' });
    };
  }

  const stBaseHome = proto.vHome;
  proto.vHome = function (x) {
    const r = stBaseHome.call(this, x);
    if (x.s.screen !== 'home') return r;
    const due = this.alertsDue(x.s);
    // Mon profil › Notifications (notif.js) : « Sorties et boutiques suivies » décoché, l'encadré reste sur l'accueil.
    if (!(x.s.notif && x.s.notif.alerts === false)) stNotify(due);
    r.al = { show: due.length > 0, items: due.map(a => Object.assign({}, a, { ok: () => this.alertsSeen([a.key]) })), okAll: () => this.alertsSeen(due.map(a => a.key)), count: due.length > 1 ? due.length + ' alertes' : '1 alerte' };
    return r;
  };
