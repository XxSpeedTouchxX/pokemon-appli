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
  // Starter centré sur son corps, pas sur son image (2026-11-01, porteur : « Pikachu est trop à gauche », Salamèche et
  // Carapuce un peu aussi) : la queue élargit l'image d'un côté ; on décale l'image du centre de son cadre jusqu'au
  // centre du corps (dex.json : « gc » pour le GIF, part de la largeur ; « pc » pour l'image fixe de 96 px).
  const stBodyStyle = (n, h, still) => {
    const e = DEX[n], w = still ? h : h * e.gif[0] / Math.max(1, e.gif[1]);
    const dx = still ? (48 - (e.pc || 48)) * h / 96 : (0.5 - (e.gc || 0.5)) * w;
    return 'height: ' + h + 'px; transform: translateX(' + (Math.round(dx * 10) / 10) + 'px)';
  };
  const stStarterStyle = (n, on) => '--st: ' + stStarterColor(n) + (on ? '; color: ' + (dexLight(stStarterColor(n)) ? '#0B1120' : '#FFFFFF') : '');
  const stStarterIdx = line => PA_STARTERS.findIndex(x => x[0] === line);
  // Nouvelle description : le Pokémon arrive du côté de celui touché en grandissant, le texte glisse et apparaît.
  const stFocusSwap = (el, dir) => {
    const img = el.querySelector('.pkm-onb-focus-show img'), id = el.querySelector('.pkm-onb-focus-id');
    if (!el.animate) return;
    el.animate([{ transform: 'scale(0.97)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.2)' });
    // L'image arrive à sa vraie place, centrée sur le corps (stBodyStyle) : avant, l'animation finissait au centre de
    // l'image puis le Pokémon sautait d'un coup (2026-11-01, porteur : « léger décalage pour se replacer au milieu »).
    const base = img && img.style.transform ? img.style.transform : '';
    if (img) img.animate([{ opacity: 0, transform: (base + ' translateX(' + dir * 40 + 'px) scale(0.55)').trim() }, { opacity: 1, transform: base || 'none' }], { duration: 440, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.25)' });
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
    // Comptes sur le serveur (2026-11-06, « go » du porteur, cloud.js) : à la fin de la page 3, le compte est créé sur
    // api.dropicards.fr avec le profil ; page 4 : le code à 6 chiffres reçu par e-mail. Page 2 : aussi « J'ai déjà un
    // compte » (connexion) et « Mot de passe oublié ? » (code par e-mail, nouveau mot de passe). Le mot de passe ne
    // reste qu'en mémoire le temps des pages, jamais enregistré par l'app (le trousseau du téléphone peut le garder).
    // Sans serveur (pas de clé, pas de réseau) : compte gardé sur l'appareil, comme avant (server: false).
    const s = x.s, acc = s.account && s.account.email ? s.account : null, tr = s.trainer || {}, page = s.onb || 1;
    const ST_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const go = n => this.setState({ onb: n, obErr: '', obNote: '' });
    const cloud = Cloud.on(), signed = cloud && Cloud.signedIn(), busy = !!s.obBusy;
    const mode = cloud && (s.obMode === 'login' || s.obMode === 'reset') ? s.obMode : 'signup';
    const fail = (e, more) => this.setState(Object.assign({ obBusy: false, obErr: (e && e.message) || CLOUD_ERR.other, obNote: '' }, more || {}));
    // Après une connexion (2026-11-07, porteur : « qu'il ne me demande pas de rechoisir quel Pokémon je souhaite avoir à
    // chaque fois ») : profil du serveur complet (pseudo, âge, starter) → entrée directe dans l'app, sans la page 3 ni
    // le remerciement du starter ; sur un nouvel appareil, le starter du compte redevient le compagnon et le didacticiel
    // est passé (il reste dans Mon profil). Profil incomplet (ancien compte) : la page 3 préremplie, à compléter.
    const fromProfile = pr => {
      const line = pr && pr.starter ? (PA_STARTERS.find(st => st[1] === pr.starter) || [''])[0] : '';
      const nick = pr && pr.pseudo ? String(pr.pseudo).trim() : '';
      if (line && PA_LINES[line] && nick.length >= 2 && pr.age_range && ST_AGES.some(a => a[0] === pr.age_range)) { enter(pr, line, nick); return; }
      toPage3(pr);
    };
    const enter = (pr, line, nick) => {
      const t = this.st(), ses = Cloud.session(), a = t.account && t.account.email ? t.account : null;
      const email = (ses && ses.email) || t.obEmail || (a && a.email) || '';
      if (!t.evo || !PA_LINES[t.evo.line]) { this.paChoose(line, true); this.setState({ tuto: 'done', tutoStep: -2 }); }
      this.setState({
        account: { email: email, news: !!pr.news_optin && pr.age_range !== 'u15', age: pr.age_range, at: (a && a.at) || realToday(), server: true, uid: ses ? ses.uid : '' },
        trainer: Object.assign({}, t.trainer || {}, { email: email, name: nick }),
        obEmail: undefined, obPwd: '', obShow: false, obNews: undefined, obNick: undefined, obAge: '', obStarter: '', obErr: '', obNote: '',
        obBusy: false, obCode: '', obMode: 'signup', obResetSent: false, obAfter: '', obPending: null, obLocal: false,
        toast: 'Content de te revoir, ' + nick + ' !'
      });
      this.finishOnb(false);
      setTimeout(() => this.gcSync(), 300);
    };
    const toPage3 = pr => {
      const line = pr && pr.starter ? (PA_STARTERS.find(st => st[1] === pr.starter) || [''])[0] : '';
      this.setState({ obBusy: false, obErr: '', obNote: '', obPwd: '', obMode: 'signup', onb: 3,
        obNick: pr && pr.pseudo ? pr.pseudo : undefined, obAge: pr && pr.age_range ? pr.age_range : '', obStarter: line, obNews: pr ? !!pr.news_optin : undefined });
    };
    // Compte déjà créé (accueil revu depuis Mon profil, 2026-10-30, porteur) : les trois pages restent accessibles,
    // préremplies ; « Passer » ramène à l'app à tout moment.
    r.cta = acc ? 'Continuer' : 'Créer mon compte';
    r.next1 = () => go(2);
    r.canSkip = !!acc;
    r.is4 = page === 4;
    r.canBack = page > 1;
    r.back = () => go(page === 4 ? 3 : Math.max(1, page - 1));
    const dp = Math.min(page, 3);
    r.dots = [1, 2, 3].map(n => ({
      cls: 'pkm-onb-dot' + (n === dp ? ' pkm-onb-dot-on' : n < dp ? ' pkm-onb-dot-done' : ''), cur: n === dp ? 'step' : 'false',
      off: n > dp ? 'true' : 'false', label: ['Présentation', 'Compte', 'Profil de dresseur'][n - 1] + ' (page ' + n + ' sur 3)',
      go: () => { if (n < dp) go(n); }
    }));
    const err = s.obErr || '', note = s.obNote || '';
    const needPwd = !(acc && (!cloud || signed));
    const resetSent = mode === 'reset' && !!s.obResetSent;
    const T = {
      signup: [acc ? 'Ton compte Dropicards' : 'Crée ton compte Dropicards', acc ? (signed ? 'Ton compte est enregistré : vérifie ton adresse, puis « Suivant ».' : 'Choisis un mot de passe pour enregistrer ton compte sur Dropicards.') : 'Pour retrouver ta collection et te connecter chaque jour.', 'Suivant'],
      login: ['Connecte-toi', 'Avec l’adresse et le mot de passe de ton compte Dropicards.', 'Me connecter'],
      reset: resetSent ? ['Nouveau mot de passe', 'Entre le code reçu à ' + (s.obEmail || 'ton adresse') + ', puis ton nouveau mot de passe.', 'Changer mon mot de passe'] : ['Mot de passe oublié', 'Entre ton adresse : tu vas recevoir un code par e-mail.', 'Recevoir un code']
    }[mode];
    r.acc = {
      email: s.obEmail !== undefined ? s.obEmail : (tr.email || (acc && acc.email) || ''), pwd: s.obPwd || '', news: s.obNews !== undefined ? !!s.obNews : !!(acc && acc.news),
      title: T[0], lead: T[1], go: busy ? 'Un instant…' : T[2], busy: busy ? 'true' : 'false',
      isSignup: mode === 'signup', isLogin: mode === 'login', isReset: mode === 'reset', showPwd: mode !== 'reset' || resetSent, showCode: resetSent,
      pwLabel: resetSent ? 'Nouveau mot de passe' : 'Mot de passe', pwAuto: mode === 'login' ? 'current-password' : 'new-password', emailAuto: mode === 'login' ? 'username' : 'email',
      pwHold: mode === 'login' ? 'Ton mot de passe' : needPwd ? '12 caractères au moins' : 'Déjà choisi (facultatif)',
      pwHint: mode === 'login' ? '' : needPwd ? '12 caractères au moins. Ton téléphone peut en créer un et l’enregistrer pour toi.' : 'Laisse vide pour garder ton mot de passe actuel.',
      hasHint: mode !== 'login',
      code: s.obCode || '', onCode: e => this.setState({ obCode: String(e.target.value || '').replace(/\D/g, '').slice(0, 6) }),
      shown: s.obShow ? 'true' : 'false', pwType: s.obShow ? 'text' : 'password', eye: s.obShow ? 'Masquer' : 'Afficher',
      emailBad: /e-mail|adresse/i.test(err) ? 'true' : 'false', pwdBad: /mot de passe/.test(err) ? 'true' : 'false',
      err: err, hasErr: !!err && page === 2, notice: note, hasNotice: !!note && !err && page === 2,
      note: 'Ton adresse sert à te connecter et, seulement si tu le coches, à recevoir nos nouveautés. Tu peux te désinscrire à tout moment.',
      // Connexion avec Face ID, Touch ID ou l'empreinte (clés d'accès, cloud.js, 2026-11-06, « go » du porteur).
      pkyOk: cloud && mode === 'login' && Cloud.passkeyOk(), pkyLabel: busy ? 'Un instant…' : 'Face ID / empreinte',
      pkyLogin: async () => {
        if (this.st().obBusy) return;
        this.setState({ obBusy: true, obErr: '' });
        try { await Cloud.passkeyLogin(); fromProfile(await Cloud.profile()); } catch (e2) { fail(e2); }
      },
      links: cloud && !busy, toLogin: () => this.setState({ obMode: 'login', obErr: '', obNote: '' }),
      toSignup: () => this.setState({ obMode: 'signup', obErr: '', obNote: '', obResetSent: false }),
      toReset: () => this.setState({ obMode: 'reset', obErr: '', obNote: '', obResetSent: false, obCode: '' }),
      onEmail: e => this.setState({ obEmail: String(e.target.value || '').trim() }),
      onPwd: e => this.setState({ obPwd: String(e.target.value || '') }),
      onNews: e => this.setState({ obNews: !!e.target.checked }),
      toggle: () => this.setState({ obShow: !this.st().obShow }),
      submit: async e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        if (t.obBusy) return;
        const email = String(f && f.email ? f.email.value : t.obEmail || '').trim().toLowerCase(), pwd = String(f && f.password ? f.password.value : t.obPwd || '');
        if (!ST_MAIL.test(email)) { this.setState({ obEmail: email, obErr: 'Adresse e-mail invalide : vérifie-la (exemple : sacha@exemple.fr).' }); return; }
        if (mode === 'login') {
          if (!pwd) { this.setState({ obEmail: email, obErr: 'Entre ton mot de passe.' }); return; }
          this.setState({ obEmail: email, obBusy: true, obErr: '' });
          try { await Cloud.signIn(email, pwd); fromProfile(await Cloud.profile()); } catch (e2) {
            if (e2.code === 'email_not_confirmed') {
              try { await Cloud.resend(email); } catch (e3) { /* code déjà envoyé */ }
              this.setState({ obBusy: false, obErr: '', obPwd: pwd, obAfter: 'login', obCode: '', onb: 4 });
            } else fail(e2, { obPwd: '' });
          }
          return;
        }
        if (mode === 'reset') {
          if (!resetSent) {
            this.setState({ obEmail: email, obBusy: true, obErr: '' });
            try { await Cloud.recover(email); this.setState({ obBusy: false, obResetSent: true, obCode: '', obNote: 'Code envoyé à ' + email + ' (regarde aussi dans les spams).' }); } catch (e2) { fail(e2); }
            return;
          }
          const code = String(f && f.code ? f.code.value : t.obCode || '').replace(/\D/g, '');
          if (code.length !== 6) { this.setState({ obErr: 'Le code fait 6 chiffres : vérifie l’e-mail reçu.' }); return; }
          if (pwd.length < 12) { this.setState({ obPwd: '', obErr: 'Ton nouveau mot de passe doit faire au moins 12 caractères.' }); return; }
          this.setState({ obBusy: true, obErr: '' });
          try { await Cloud.verify(email, code, 'recovery'); await Cloud.setPassword(pwd); fromProfile(await Cloud.profile()); this.setState({ toast: 'Mot de passe changé : tu es connecté' }); } catch (e2) { fail(e2); }
          return;
        }
        const news = f && f.news ? !!f.news.checked : t.obNews !== undefined ? !!t.obNews : !!(acc && acc.news);
        if (pwd.length < 12 && !(!needPwd && !pwd)) { this.setState({ obEmail: email, obPwd: '', obErr: 'Ton mot de passe doit faire au moins 12 caractères.' }); return; }
        // Le mot de passe reste en mémoire (jamais enregistré) pour pouvoir revenir à cette page.
        this.setState({ obEmail: email, obPwd: pwd, obNews: news, obErr: '', obNote: '', onb: 3 });
      }
    };
    // Fin de l'accueil : le starter remercie au milieu de l'écran (calque de tuto.js), puis présente l'app.
    const done = (t, nick, obAge, line, server) => {
      const under = obAge === 'u15', ses = Cloud.session();
      const sec = document.querySelector('section[aria-label^="Bienvenue"]');
      // Même starter qu'avant : son évolution et le compagnon actuel sont gardés.
      this.tutoThanks(line, sec, line === curLine);
      const email = (server && ses && ses.email) || t.obEmail || (acc && acc.email);
      this.setState({
        account: { email: email, news: (t.obNews !== undefined ? !!t.obNews : !!(acc && acc.news)) && !under, age: obAge, at: (acc && acc.at) || realToday(), server: !!server, uid: server && ses ? ses.uid : '' },
        trainer: Object.assign({}, t.trainer || {}, { email: email, name: nick }),
        obEmail: undefined, obPwd: '', obShow: false, obNews: undefined, obNick: undefined, obAge: '', obStarter: '', obErr: '', obNote: '',
        obBusy: false, obCode: '', obMode: 'signup', obResetSent: false, obAfter: '', obPending: null, obLocal: false
      });
      setTimeout(() => this.finishOnb(false), 320);
      // PK, PA et Pokédex du compte relus sur le serveur (game-cloud.js).
      if (server) setTimeout(() => this.gcSync(), 400);
    };
    // Page 4 : le code à 6 chiffres reçu par e-mail (lien de l'e-mail aussi accepté, cloud.js fromLink).
    r.p4 = {
      email: s.obEmail || '', code: s.obCode || '', busy: busy ? 'true' : 'false', go: busy ? 'Un instant…' : 'Valider mon code',
      err: err, hasErr: !!err && page === 4, notice: note, hasNotice: !!note && !err && page === 4,
      onCode: e => this.setState({ obCode: String(e.target.value || '').replace(/\D/g, '').slice(0, 6) }),
      change: () => this.setState({ onb: 2, obMode: 'signup', obErr: '', obNote: '' }),
      resend: async () => {
        const t = this.st();
        if (t.obBusy) return;
        this.setState({ obBusy: true, obErr: '' });
        try { await Cloud.resend(t.obEmail); this.setState({ obBusy: false, obNote: 'Nouveau code envoyé (regarde aussi dans les spams).' }); } catch (e2) { fail(e2); }
      },
      submit: async e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        if (t.obBusy) return;
        const code = String(f && f.code ? f.code.value : t.obCode || '').replace(/\D/g, '');
        if (code.length !== 6) { this.setState({ obCode: code, obErr: 'Le code fait 6 chiffres : vérifie l’e-mail reçu.' }); return; }
        this.setState({ obBusy: true, obErr: '', obCode: code });
        try {
          await Cloud.verify(t.obEmail, code, 'signup');
          if (t.obAfter === 'login' || !t.obPending) { fromProfile(await Cloud.profile()); return; }
          const P = t.obPending;
          done(t, P.nick, P.age, P.line, true);
          this.setState({ toast: 'Bienvenue ' + P.nick + ' : ton compte Dropicards est créé' });
        } catch (e2) { fail(e2); }
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
        name: DEX[n].name, img: 'img/pokemon/' + n + (still ? '.png' : '.gif'), imgStyle: stBodyStyle(n, still ? 72 : Math.round(56 * Math.min(1.25, DEX[n].gif[1] / 44)), still),
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
      selImgStyle: E ? stBodyStyle(selN, !still ? Math.round(96 * Math.min(1.2, E.gif[1] / 46)) : 104, still) : '',
      selTypes: E ? E.types.map(t => ({ t: t, style: 'background: ' + (DEX_TYPE[t] || '#5A6B8C') + '; color: ' + (dexLight(DEX_TYPE[t] || '#5A6B8C') ? '#0B1120' : '#FFFFFF') })) : [],
      lead: acc ? 'Ton âge, ton pseudo et ton compagnon de voyage.' : 'Dernière étape avant l’aventure !',
      selDesc: ST_STARTER_TXT[sel] || '', go: s.obBusy ? 'Un instant…' : 'Choisir ' + name + ' comme compagnon', selStyle: selN ? stStarterStyle(selN, false) : '',
      err: err, hasErr: !!err && page === 3, errNoSel: !!err && page === 3 && !E, // message visible aussi sans starter choisi (glissement)
      canLocal: !!s.obLocal && page === 3, local: () => {
        const t = this.st(), line = t.obStarter || curLine, nick = String(t.obNick || '').trim();
        if (line && nick.length >= 2 && (t.obAge || accAge)) done(t, nick, t.obAge || accAge, line, false);
      },
      busy: busy ? 'true' : 'false',
      submit: async e => {
        if (e && e.preventDefault) e.preventDefault();
        const f = e && e.target && e.target.elements, t = this.st();
        if (t.obBusy) return;
        const nick = String(f && f.nickname ? f.nickname.value : t.obNick || '').replace(/\s+/g, ' ').trim().slice(0, 24);
        const obAge = t.obAge || accAge, obStarter = t.obStarter || curLine;
        if (!obAge) { this.setState({ obNick: nick, obErr: 'Indique ton âge.' }); return; }
        if (nick.length < 2) { this.setState({ obNick: nick, obErr: 'Choisis un pseudo de 2 à 24 caractères.' }); return; }
        if (!obStarter || !PA_LINES[obStarter]) { this.setState({ obNick: nick, obErr: 'Choisis ton compagnon de voyage.' }); return; }
        const line = obStarter, num = PA_LINES[line][0];
        const news = (t.obNews !== undefined ? !!t.obNews : !!(acc && acc.news)) && obAge !== 'u15';
        if (!Cloud.on()) { done(t, nick, obAge, line, false); return; }
        this.setState({ obNick: nick, obBusy: true, obErr: '', obLocal: false });
        try {
          if (Cloud.signedIn()) {
            await Cloud.saveProfile({ pseudo: nick, age_range: obAge, starter: num, buddy: num, news_optin: news });
            done(t, nick, obAge, line, true);
            return;
          }
          const email = t.obEmail || (acc && acc.email) || '', pwd = t.obPwd || '';
          if (!ST_MAIL.test(email) || pwd.length < 12) { this.setState({ obBusy: false, onb: 2, obMode: 'signup', obErr: 'Choisis ton mot de passe (12 caractères au moins) pour créer ton compte.' }); return; }
          const res = await Cloud.signUp(email, pwd, { pseudo: nick, age_range: obAge, starter: num, news_optin: news });
          if (res.exists) { this.setState({ obBusy: false, onb: 2, obMode: 'login', obPwd: '', obErr: 'Un compte existe déjà avec cette adresse : connecte-toi.' }); return; }
          if (res.session) { done(t, nick, obAge, line, true); return; }
          this.setState({ obBusy: false, onb: 4, obCode: '', obAfter: '', obPending: { nick: nick, age: obAge, line: line }, obNote: 'Code envoyé à ' + email + ' (regarde aussi dans les spams).' });
        } catch (e2) {
          fail(e2, { obLocal: e2.code === 'network' });
        }
      }
    };
    // Glisser (2026-11-06, porteur) : vers la gauche, page suivante si celle-ci est complète (sinon un léger rebond et
    // ce qui manque) ; vers la droite, page précédente. Page 2 : seulement à la création du compte (pas à la connexion,
    // qui demande le serveur) ; page 3 : la création du compte reste un appui sur « Choisir … comme compagnon ».
    stSwipeInstall(this);
    this._obSwipe = dir => {
      const t = this.st();
      if (t.obBusy || !t.onb) return;
      if (dir < 0) { if (page > 1) { r.back(); return true; } return false; }
      if (page === 1) { r.next1(); return true; }
      if (page === 2) {
        const form = document.querySelector('form.pkm-acc'), el = form && form.elements;
        const email = String(el && el.email ? el.email.value : t.obEmail || '').trim(), pwd = String(el && el.password ? el.password.value : t.obPwd || '');
        if (mode !== 'signup') return false;
        if (!ST_MAIL.test(email) || (pwd.length < 12 && !(!needPwd && !pwd))) {
          this.setState({ obEmail: email, obPwd: pwd, obErr: !ST_MAIL.test(email) ? 'Pour passer à la suite, entre ton adresse e-mail.' : 'Pour passer à la suite, choisis ton mot de passe (12 caractères au moins).' });
          return false;
        }
        r.acc.submit(el ? { target: { elements: el } } : null);
        return true;
      }
      if (page === 3) {
        const form = document.querySelector('form[aria-label="Ton profil de dresseur"]'), el = form && form.elements;
        const nick = String(el && el.nickname ? el.nickname.value : t.obNick || '').trim();
        const miss = !(t.obAge || accAge) ? 'ton âge' : nick.length < 2 ? 'ton pseudo' : !(t.obStarter || curLine) ? 'ton compagnon' : '';
        this.setState({ obNick: nick, obErr: miss ? 'Il manque ' + miss + ' : complète la page de haut en bas.' : 'Tout est prêt : touche « ' + r.p3.go + ' » pour créer ton compte.' });
        return false;
      }
      return false;
    };
    return r;
  };
  // Gestes de l'accueil : un glissement horizontal net (au moins 60 px, plus horizontal que vertical, en moins de
  // 0,8 s) sur les pages ; jamais depuis un champ de saisie. Doigt (tactile) ou souris (ordinateur, tests).
  let stSwipeOn = false;
  const stSwipeInstall = self => {
    if (stSwipeOn) return;
    stSwipeOn = true;
    let g = null;
    const inOnb = el => !!(el && el.closest && el.closest('section[aria-label^="Bienvenue"]'));
    const start = (x, y, el) => { g = inOnb(el) && !(el.closest && el.closest('input, textarea, select')) ? { x: x, y: y, t: Date.now() } : null; };
    const end = (x, y) => {
      const a = g; g = null;
      if (!a) return;
      const dx = x - a.x, dy = y - a.y;
      if (Math.abs(dx) < 60 || Math.abs(dx) < 1.5 * Math.abs(dy) || Date.now() - a.t > 800 || !self._obSwipe) return;
      const okSwipe = self._obSwipe(dx < 0 ? 1 : -1);
      if (okSwipe === false) {
        const el = document.querySelector('section[aria-label^="Bienvenue"] .pkm-onb-page');
        try { if (el && el.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.animate([{ transform: 'none' }, { transform: 'translateX(' + (dx < 0 ? -18 : 18) + 'px)' }, { transform: 'none' }], { duration: 320, easing: 'ease-out' }); } catch (e) { /* rien */ }
      }
    };
    document.addEventListener('touchstart', e => { const t = e.touches[0]; if (e.touches.length === 1) start(t.clientX, t.clientY, e.target); else g = null; }, { passive: true });
    document.addEventListener('touchend', e => { const t = e.changedTouches[0]; if (t) end(t.clientX, t.clientY); }, { passive: true });
    document.addEventListener('mousedown', e => start(e.clientX, e.clientY, e.target));
    document.addEventListener('mouseup', e => end(e.clientX, e.clientY));
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

  // Lien d'un e-mail de Dropicards ouvert dans le navigateur (cloud.js) : session gardée, message à la première page.
  let stLinked = Cloud.on() ? Cloud.fromLink() : null;
  // Rôle du compte relu à chaque ouverture (un admin retiré perd aussitôt le mode Admin, admAllowed).
  let stRoleChecked = false;
  // Écran de connexion au lancement (2026-11-07, porteur) : un compte Dropicards déjà créé sur cet appareil mais
  // déconnecté → la page de connexion s'ouvre d'elle-même (adresse préremplie, mot de passe proposé par le trousseau du
  // téléphone, Face ID / empreinte) ; « Passer » garde l'app sans compte. Une fois par ouverture de l'app.
  let stLoginAsked = false;
  const stBaseHome = proto.vHome;
  proto.vHome = function (x) {
    const r = stBaseHome.call(this, x);
    if (!stLoginAsked) {
      stLoginAsked = true;
      const a = x.s.account;
      if (Cloud.on() && !Cloud.signedIn() && a && a.server && a.email && !x.s.onb && x.s.tuto === 'done' && !stLinked)
        setTimeout(() => { const t = this.st(); if (!t.onb && !Cloud.signedIn()) this.setState({ onb: 2, obMode: 'login', obEmail: undefined, obPwd: '', obErr: '', obNote: '' }); }, 0);
    }
    if (!stRoleChecked && Cloud.on() && Cloud.signedIn()) {
      stRoleChecked = true;
      Cloud.profile().then(() => this.setState({ cloudChecked: Date.now() })).catch(() => {});
    }
    if (stLinked) {
      const L = stLinked, a = x.s.account;
      stLinked = null;
      setTimeout(() => this.setState(L.session
        ? Object.assign({ toast: 'Adresse confirmée : ton compte Dropicards est actif' }, a && a.email ? { account: Object.assign({}, a, { server: true, uid: L.session.uid }) } : {})
        : { toast: 'Ce lien n’est plus valable : demande un nouveau code depuis l’app' }), 0);
    }
    if (x.s.screen !== 'home') return r;
    const due = this.alertsDue(x.s);
    // Mon profil › Notifications (notif.js) : « Sorties et boutiques suivies » décoché, l'encadré reste sur l'accueil.
    if (!(x.s.notif && x.s.notif.alerts === false)) stNotify(due);
    r.al = { show: due.length > 0, items: due.map(a => Object.assign({}, a, { ok: () => this.alertsSeen([a.key]) })), okAll: () => this.alertsSeen(due.map(a => a.key)), count: due.length > 1 ? due.length + ' alertes' : '1 alerte' };
    return r;
  };
