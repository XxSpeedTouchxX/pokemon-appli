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
  // Tranches d'âge (en France, avant 15 ans, ce qui repose sur le consentement demande l'accord d'un parent).
  // Quatre tranches (2026-10-30, porteur).
  const ST_AGES = [['u15', 'Moins de 15 ans'], ['15-25', 'Entre 15 et 25 ans'], ['25-35', 'Entre 25 et 35 ans'], ['35+', '35 ans et plus']];
  const ST_STARTER_TXT = {
    bulbi: 'Calme et fidèle, il porte sur son dos une graine qui grandit avec lui. Parfait pour une aventure tout en douceur.',
    sala: 'Courageux et plein d’énergie : la flamme au bout de sa queue montre sa force et son humeur.',
    cara: 'Malin et joueur, il se protège dans sa carapace et ne lâche jamais rien.',
    pika: 'Vif et curieux, il garde de l’électricité dans ses joues. Le compagnon le plus célèbre de tous !'
  };
  // Bulle d'un starter choisi et fiche : couleur de son type (--st) ; texte sombre sur les couleurs claires.
  const stStarterColor = n => DEX_TYPE[DEX[n].types[0]] || '#2E6BD8';
  const stStarterStyle = (n, on) => '--st: ' + stStarterColor(n) + (on ? '; color: ' + (dexLight(stStarterColor(n)) ? '#0B1120' : '#FFFFFF') : '');
  const stStarterIdx = line => PA_STARTERS.findIndex(x => x[0] === line);
  // Nouvelle description : le Pokémon arrive du côté de celui touché en grandissant, le texte glisse et apparaît.
  const stFocusSwap = (el, dir) => {
    const img = el.querySelector('.pkm-onb-focus-show img'), id = el.querySelector('.pkm-onb-focus-id');
    if (!el.animate) return;
    el.animate([{ transform: 'scale(0.97)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)' });
    if (img) img.animate([{ opacity: 0, transform: 'translateX(' + dir * 40 + 'px) scale(0.55)' }, { opacity: 1, transform: 'none' }], { duration: 440, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.25)' });
    if (id) id.animate([{ opacity: 0, transform: 'translateX(' + dir * 30 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 70, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'backwards' });
  };
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
    // Accueil en trois pages (2026-10-30, porteur) : 1. présentation et « Créer mon compte » ; 2. e-mail et mot de passe,
    // « Suivant » ; 3. âge, pseudo de dresseur et choix du compagnon de voyage parmi les quatre starters (un appui le met
    // en avant avec une brève description et « Choisir … comme compagnon ») ; ce starter fait ensuite le didacticiel.
    // Retour possible à tout moment (flèche, points), transitions glissées comme entre les pages de l'app.
    // Les comptes Dropicards n'existent pas encore côté serveur (docs/17, en attente de « go ») : l'adresse, l'âge, le
    // choix des nouveautés et le pseudo sont gardés sur l'appareil (account, trainer) ; le mot de passe ne reste qu'en
    // mémoire le temps des pages et n'est jamais enregistré par l'app (le trousseau du téléphone peut le garder).
    const s = x.s, acc = s.account && s.account.email ? s.account : null, tr = s.trainer || {}, page = s.onb || 1;
    const ST_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const go = n => this.setState({ onb: n, obErr: '' });
    // Compte déjà créé (accueil revu depuis Mon profil, 2026-10-30, porteur) : les trois pages restent accessibles,
    // préremplies ; « Passer » ramène à l'app à tout moment.
    r.cta = acc ? 'Continuer' : 'Créer mon compte';
    r.next1 = () => go(2);
    r.canSkip = !!acc;
    r.canBack = page > 1;
    r.back = () => go(Math.max(1, page - 1));
    r.dots = [1, 2, 3].map(n => ({
      cls: 'pkm-onb-dot' + (n === page ? ' pkm-onb-dot-on' : n < page ? ' pkm-onb-dot-done' : ''), cur: n === page ? 'step' : 'false',
      off: n > page ? 'true' : 'false', label: ['Présentation', 'Compte', 'Profil de dresseur'][n - 1] + ' (page ' + n + ' sur 3)',
      go: () => { if (n < page) go(n); }
    }));
    const err = s.obErr || '';
    r.acc = {
      email: s.obEmail !== undefined ? s.obEmail : (tr.email || (acc && acc.email) || ''), pwd: s.obPwd || '', news: s.obNews !== undefined ? !!s.obNews : !!(acc && acc.news),
      title: acc ? 'Ton compte Dropicards' : 'Crée ton compte Dropicards',
      lead: acc ? 'Ton compte est déjà créé sur ce téléphone : vérifie ton adresse, puis « Suivant ».' : 'Pour retrouver ta collection et te connecter chaque jour.',
      pwHold: acc ? 'Déjà choisi (facultatif)' : '12 caractères au moins',
      pwHint: acc ? 'Laisse vide pour garder ton mot de passe actuel.' : '12 caractères au moins. Ton téléphone peut en créer un et l’enregistrer pour toi.',
      shown: s.obShow ? 'true' : 'false', pwType: s.obShow ? 'text' : 'password', eye: s.obShow ? 'Masquer' : 'Afficher',
      emailBad: /e-mail/.test(err) ? 'true' : 'false', pwdBad: /mot de passe/.test(err) ? 'true' : 'false',
      err: err, hasErr: !!err && page === 2,
      note: 'Ton adresse sert à te connecter et, seulement si tu le coches, à recevoir nos nouveautés. Tu peux te désinscrire à tout moment.',
      onEmail: e => this.setState({ obEmail: String(e.target.value || '').trim() }),
      onPwd: e => this.setState({ obPwd: String(e.target.value || '') }),
      onNews: e => this.setState({ obNews: !!e.target.checked }),
      toggle: () => this.setState({ obShow: !this.st().obShow }),
      submit: e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        const email = String(f && f.email ? f.email.value : t.obEmail || '').trim().toLowerCase(), pwd = String(f && f.password ? f.password.value : t.obPwd || '');
        const news = f && f.news ? !!f.news.checked : t.obNews !== undefined ? !!t.obNews : !!(acc && acc.news);
        if (!ST_MAIL.test(email)) { this.setState({ obEmail: email, obErr: 'Adresse e-mail invalide : vérifie-la (exemple : sacha@exemple.fr).' }); return; }
        if (pwd.length < 12 && !(acc && !pwd)) { this.setState({ obEmail: email, obPwd: '', obErr: 'Ton mot de passe doit faire au moins 12 caractères.' }); return; }
        // Le mot de passe reste en mémoire (jamais enregistré) pour pouvoir revenir à cette page.
        this.setState({ obEmail: email, obPwd: pwd, obNews: news, obErr: '', onb: 3 });
      }
    };
    const still = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e2) { return false; } })();
    // Compte déjà créé : âge et starter actuels préremplis (une tranche d'âge d'avant 4 tranches reste à choisir).
    const accAge = acc && ST_AGES.some(a => a[0] === acc.age) ? acc.age : '', curLine = acc && s.evo && PA_LINES[s.evo.line] ? s.evo.line : '';
    const age = s.obAge || accAge, kid = age === 'u15', sel = s.obStarter || curLine, selN = sel ? PA_LINES[sel][0] : 0, E = selN ? DEX[selN] : null;
    const name = E ? E.name : '';
    r.p3 = {
      ages: ST_AGES.map(([k, label]) => ({ label: label, on: age === k ? 'true' : 'false', cls: 'pkm-onb-chip' + (age === k ? ' pkm-onb-chip-on' : ''), pick: () => this.setState({ obAge: k, obErr: '' }) })),
      kid: kid, nick: s.obNick !== undefined ? s.obNick : (tr.name || ''), nickBad: /pseudo/.test(err) ? 'true' : 'false',
      onNick: e => this.setState({ obNick: String(e.target.value || '').slice(0, 24) }),
      starters: PA_STARTERS.map(([line, n]) => ({
        name: DEX[n].name, img: 'img/pokemon/' + n + (still ? '.png' : '.gif'), h: still ? '72px' : Math.round(56 * Math.min(1.25, DEX[n].gif[1] / 44)) + 'px',
        on: sel === line ? 'true' : 'false', aria: 'Découvrir ' + DEX[n].name, cls: 'pkm-onb-st' + (sel === line ? ' pkm-onb-st-on' : ''),
        style: stStarterStyle(n, sel === line),
        pick: () => {
          const prev = this.st().obStarter || curLine, was = document.querySelector('.pkm-onb-focus');
          if (prev !== line) this.setState({ obStarter: line, obErr: '' });
          // Fiche déjà ouverte : la description d'avant laisse place à la nouvelle, qui glisse depuis le côté du Pokémon touché.
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const el = document.querySelector('.pkm-onb-focus');
            if (el && el === was && prev && prev !== line && !still) stFocusSwap(el, stStarterIdx(line) > stStarterIdx(prev) ? 1 : -1);
            if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
          }));
        }
      })),
      hasSel: !!E, noSel: !E, selKey: 'st-' + sel, selName: name, selImg: E ? 'img/pokemon/' + selN + (still ? '.png' : '.gif') : '',
      selH: E && !still ? Math.round(96 * Math.min(1.2, E.gif[1] / 46)) + 'px' : '104px',
      selTypes: E ? E.types.map(t => ({ t: t, style: 'background: ' + (DEX_TYPE[t] || '#5A6B8C') + '; color: ' + (dexLight(DEX_TYPE[t] || '#5A6B8C') ? '#0B1120' : '#FFFFFF') })) : [],
      lead: acc ? 'Ton âge, ton pseudo et ton compagnon de voyage.' : 'Dernière étape avant l’aventure !',
      selDesc: ST_STARTER_TXT[sel] || '', go: 'Choisir ' + name + ' comme compagnon', selStyle: selN ? stStarterStyle(selN, false) : '',
      err: err, hasErr: !!err && page === 3,
      submit: e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        const nick = String(f && f.nickname ? f.nickname.value : t.obNick || '').replace(/\s+/g, ' ').trim().slice(0, 24);
        const obAge = t.obAge || accAge, obStarter = t.obStarter || curLine;
        if (!obAge) { this.setState({ obNick: nick, obErr: 'Indique ton âge.' }); return; }
        if (nick.length < 2) { this.setState({ obNick: nick, obErr: 'Choisis un pseudo de 2 à 24 caractères.' }); return; }
        if (!obStarter || !PA_LINES[obStarter]) { this.setState({ obNick: nick, obErr: 'Choisis ton compagnon de voyage.' }); return; }
        const line = obStarter, under = obAge === 'u15';
        // Le starter remercie au milieu de l'écran (calque de tuto.js), puis présente l'app : le didacticiel commence.
        const sec = document.querySelector('section[aria-label^="Bienvenue"]');
        // Même starter qu'avant : son évolution et le compagnon actuel sont gardés.
        this.tutoThanks(line, sec, line === curLine);
        this.setState({
          account: { email: t.obEmail || (acc && acc.email), news: (t.obNews !== undefined ? !!t.obNews : !!(acc && acc.news)) && !under, age: obAge, at: (acc && acc.at) || realToday(), server: false },
          trainer: Object.assign({}, t.trainer || {}, { email: t.obEmail || (acc && acc.email), name: nick }),
          obEmail: undefined, obPwd: '', obShow: false, obNews: undefined, obNick: undefined, obAge: '', obStarter: '', obErr: ''
        });
        setTimeout(() => this.finishOnb(false), 320);
      }
    };
    return r;
  };

  // Transition entre les pages de l'accueil (2026-10-30, porteur : « les mêmes transitions que l'app ») : la nouvelle
  // page glisse depuis la droite en avançant, depuis la gauche en revenant (courbe d'iOS, comme nav.js), en pixels.
  let stOnbPage = 0;
  const stOnbSlide = (from, to) => {
    const sec = document.querySelector('section[aria-label^="Bienvenue"]');
    if (sec) sec.scrollTop = 0;
    const el = sec && sec.querySelector('.pkm-onb-page');
    if (!el || !el.animate) return;
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) { /* rien */ }
    const w = el.getBoundingClientRect().width || 360, fwd = to > from;
    el.animate([{ transform: 'translateX(' + Math.round(fwd ? w : -0.3 * w) + 'px)', opacity: fwd ? 1 : 0.4 }, { transform: 'none', opacity: 1 }],
      { duration: 420, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' });
  };
  const stBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = stBaseRender.call(this), p = this.st().onb || 0;
    if (p !== stOnbPage) {
      const from = stOnbPage;
      stOnbPage = p;
      if (p > 0 && from > 0) requestAnimationFrame(() => requestAnimationFrame(() => stOnbSlide(from, p)));
    }
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
