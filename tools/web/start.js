  // ——— Première visite et alertes (2026-10-11) ———
  // Première visite : collection vide et accueil guidé ouvert tout seul (build.mjs) ; la collection de démo
  // seulement sur choix (« Essayer avec la collection de démo »).
  // Alertes : « Me prévenir » (Sorties) et les alertes de boutique enregistraient seulement un choix, sans jamais
  // prévenir. Désormais, à chaque ouverture de l'app : un encadré « Tes alertes » sur l'accueil (et une notification
  // du téléphone si l'utilisateur l'a autorisée) quand un produit suivi sort, et la veille ou le jour d'une sortie
  // pour les boutiques suivies. Aucune information de stock : un rappel, rien de plus. Chaque alerte n'est montrée
  // qu'une fois (« alertsDone », enregistré avec la collection).
  const ST_DAY = 86400000;
  const stDays = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / ST_DAY);

  // Lugia de la Collection Classique : visuel de la carte d'origine (Aquapolis 149/147, voir CLASSIC_30) ; repli sur le
  // Lugia de Neo Genesis si le catalogue ne l'a pas.
  const ST_FAN = [['base1-4'], ['30th-c-029', 'neo1-9'], ['30th-152']];
  const stBaseOnb = proto.vOnb;
  proto.vOnb = function (x) {
    const r = stBaseOnb.call(this, x), s = x.s;
    r.canDemo = !(s.purchases || []).length && !(s.sales || []).length;
    // Premier écran (2026-10-14, porteur) : Dracaufeu du Set de Base (1re édition) à gauche, Lugia réimprimé de la
    // Collection Classique du 30ᵉ anniversaire au milieu, Mew-ex illustration spéciale (30ᵉ anniversaire) à droite.
    if (TCG.status === 'ready' && r.fan && r.fan.length === 3) {
      ST_FAN.forEach((ids, i) => {
        const id = ids.find(k => TCG.byId[k] && TCG.item(k).imgLang);
        if (id) { const it = TCG.item(id); r.fan[i].img = it.imgHi || it.img; }
        // Cartes entières (100 × 140), en éventail.
        Object.assign(r.fan[i], [{ left: '8px', top: '30px', rot: '-12deg' }, { left: '81px', top: '6px', rot: '0deg' }, { left: '154px', top: '30px', rot: '12deg' }][i]);
      });
    }
    r.tryDemo = () => this.setState({ purchases: this.purchasesSeed('full'), sales: this.salesSeed('full'), onb: 2, firstRun: false, toast: 'Collection de démo chargée · « Vider ma collection » dans les Réglages pour repartir de zéro' });
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
    stNotify(due);
    r.al = { show: due.length > 0, items: due.map(a => Object.assign({}, a, { ok: () => this.alertsSeen([a.key]) })), okAll: () => this.alertsSeen(due.map(a => a.key)), count: due.length > 1 ? due.length + ' alertes' : '1 alerte' };
    return r;
  };
