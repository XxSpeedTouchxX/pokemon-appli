  // ——— Points de loyauté (PL) (2026-11-14, « go » du porteur ; docs/38, choix par défaut L1 à L8) ———
  // Les PL ne sont pas une monnaie : ils ne s'achètent pas et ne se dépensent pas. Ils classent seulement la saison et ne
  // s'affichent que dans « Ma ligue » (onglet « Mes missions », ex-« Gagner des PL » ; le classement est dans progress.js).
  // Le serveur seul les donne (tools/supabase/028_points_loyaute.sql) ; l'app ne fait que les demander :
  //   - pl_state : gains en attente (séries de jours, filleuls), puis l'état des défis ; relu à l'ouverture de l'app
  //     (au plus toutes les 10 minutes) et à chaque ouverture de « Mes missions » ;
  //   - pl_set_parrain : code d'un lien dropicards.fr/?parrain=CODE, gardé sur l'appareil jusqu'à la connexion ;
  //   - pl_claim_social : TikTok, Instagram, Discord, sur l'honneur (le bouton ouvre le réseau, puis « Valider ») ;
  //   - pl_submit_proof : capture d'écran d'un partage, réduite sur le téléphone (1 080 px, JPEG) avant l'envoi ;
  //   - Admin › « Défis à valider » : admin_pl_proofs, admin_pl_decide (admins déverrouillés seulement).
  // Pas de PL contre un clic sur une pub ni contre un avis sur les stores (interdit par Google et Apple, docs/38).
  // QR code dessiné dans l'app (qrcode-generator, licence MIT, ajouté au paquet), sans service extérieur.
  // Ce module partage la portée des autres : ses noms commencent par PL_ ou pl.
  const plProto = Component.prototype;
  const PL_LINK = 'https://dropicards.fr/?parrain=';
  const PL_LS = 'pkm-parrain';
  const PL_TTL = 10 * 60000;
  // Réseaux de Dropicards (adresses dans SOCIAL_LINKS, profile.js ; « Bientôt » tant qu'elles sont vides).
  const PL_NETS = [
    { id: 'tiktok', title: 'Suivre Dropicards sur TikTok', icon: 'img/social/tiktok.svg' },
    { id: 'instagram', title: 'Suivre Dropicards sur Instagram', icon: 'img/social/instagram.svg' },
    { id: 'discord', title: 'Rejoindre le Discord Dropicards', icon: 'img/social/discord.svg' }
  ];
  const PL_STREAKS = [{ n: 5, pl: 30 }, { n: 15, pl: 100 }, { n: 30, pl: 150 }];
  const PL_SHARE_NETS = [['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['x', 'X'], ['snapchat', 'Snapchat'],
    ['whatsapp', 'WhatsApp'], ['discord', 'Discord'], ['autre', 'Autre']];
  const plNum = n => Number(n || 0).toLocaleString('fr-FR');
  const plOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const plCodeOk = c => /^[A-Z0-9]{4,12}$/.test(c);
  const plSocial = id => { try { return String((SOCIAL_LINKS && SOCIAL_LINKS[id]) || ''); } catch (e) { return ''; } };

  // Lien de parrainage : ?parrain=CODE gardé sur l'appareil (30 jours) jusqu'à la connexion du compte, puis retiré de
  // l'adresse de la page.
  (() => {
    try {
      const u = new URL(location.href), c = (u.searchParams.get('parrain') || '').trim().toUpperCase();
      if (!u.searchParams.has('parrain')) return;
      if (plCodeOk(c)) localStorage.setItem(PL_LS, JSON.stringify({ code: c, at: Date.now() }));
      u.searchParams.delete('parrain');
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) { /* stockage ou adresse indisponibles */ }
  })();
  const plPending = () => { try { const v = JSON.parse(localStorage.getItem(PL_LS) || 'null'); return v && plCodeOk(v.code) && Date.now() - (v.at || 0) < 30 * 86400000 ? v.code : ''; } catch (e) { return ''; } };
  const plForget = () => { try { localStorage.removeItem(PL_LS); } catch (e) { /* stockage indisponible */ } };

  // QR code du lien : chemin SVG d'un carré par module noir (marge de 2 modules).
  const plQrCache = {};
  const plQr = text => {
    if (!text || typeof qrcode !== 'function') return null;
    if (plQrCache[text]) return plQrCache[text];
    const q = qrcode(0, 'M');
    q.addData(text); q.make();
    const n = q.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    return (plQrCache[text] = { d: d, box: '-2 -2 ' + (n + 4) + ' ' + (n + 4), n: n });
  };

  // Capture choisie : réduite à 1 080 px au plus et en JPEG, pour un envoi léger (le serveur refuse au-delà de 700 Ko).
  const plShrink = file => new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type || '')) { rej(new Error('Choisis une image (une capture d’écran).')); return; }
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1080 / Math.max(im.naturalWidth || 1, im.naturalHeight || 1));
      const w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h);
      g.drawImage(im, 0, 0, w, h);
      URL.revokeObjectURL(url);
      let q = 0.72, d = c.toDataURL('image/jpeg', q);
      while (d.length > 600000 && q > 0.3) { q -= 0.12; d = c.toDataURL('image/jpeg', q); }
      if (d.length > 690000) rej(new Error('Image trop lourde : fais une capture d’écran plus simple.')); else res(d);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Image illisible : choisis une capture d’écran.')); };
    im.src = url;
  });

  // Gains reçus : un message (et leur détail dans « Ma ligue »).
  const PL_WHY = {
    streak: g => g.ref + ' jours d’affilée', referral: () => 'un ami de plus parrainé', referral_premium: () => 'ton filleul a pris le Premium',
    share: () => 'partage validé', social: () => 'merci de suivre Dropicards', welcome_ref: () => 'bienvenue'
  };
  // « first » : message déjà prévu (bienvenue d'un filleul), mis devant pour ne pas être effacé.
  plProto.plCelebrate = function (list, first) {
    const sum = list.reduce((a, g) => a + (Number(g.pl) || 0), 0);
    const why = list.length === 1 ? (PL_WHY[list[0].kind] ? PL_WHY[list[0].kind](list[0]) : '') : list.length + ' missions réussies';
    const msg = sum ? '+' + plNum(sum) + ' PL' + (why ? ' · ' + why : '') + ' (Ma ligue)' : '';
    if (!msg && !first) return;
    this.setState({ toast: first && msg ? first + ' · ' + msg : first || msg });
    this.flash();
  };

  // Lecture de l'état (et code de parrainage en attente d'abord).
  let plBusy = null, plAt = 0, plOff = false;
  plProto.plSync = function (force) {
    if (!plOnline() || plOff) return Promise.resolve(null);
    if (plBusy) return plBusy;
    if (!force && plAt && Date.now() - plAt < PL_TTL) return Promise.resolve(this.st().plState || null);
    plAt = Date.now();
    const code = plPending();
    let hello = '';
    const first = code ? Cloud.rpc('pl_set_parrain', { code: code }).then(r => {
      plForget();
      if (r && r.ok) hello = 'Bienvenue ! Tu es parrainé par ' + (r.parrain || 'un ami') + ' : +' + plNum(r.pl) + ' PL';
    }, e => { if (e && e.code === 'game') plForget(); }) : Promise.resolve();
    plBusy = first.then(() => Cloud.rpc('pl_state')).then(st => {
      plBusy = null;
      if (!st || typeof st !== 'object') { if (hello) this.plCelebrate([], hello + ' (Ma ligue)'); return null; }
      this.setState({ plState: st, plErr: '' });
      const nw = Array.isArray(st.new) ? st.new : [];
      if (nw.length || hello) this.plCelebrate(nw, hello);
      return st;
    }, e => {
      plBusy = null;
      if (hello) this.plCelebrate([], hello + ' (Ma ligue)');
      if (e && e.code === 'not_installed') plOff = true;
      this.setState({ plErr: e && e.code === 'not_installed' ? 'off' : e && e.code === 'network' ? 'net' : 'err' });
      return null;
    });
    return plBusy;
  };
  // Ouverture de l'app, connexion, retour au premier plan : après l'état du jeu (et le temps passé, 025).
  const plBaseGc = plProto.gcSync;
  plProto.gcSync = function () {
    const p = plBaseGc.call(this);
    if (plOnline() && !plOff) setTimeout(() => this.plSync(false), 1500);
    return p;
  };

  // Actions de la page « Mes missions ».
  plProto.plAct = function (fn, args, ok) {
    if (!plOnline()) { this.setState({ toast: 'Connecte-toi à ton compte Dropicards (Mon profil).' }); this.flash(); return Promise.resolve(null); }
    if (this.__plAct) return Promise.resolve(null);
    this.__plAct = true;
    this.setState({ plActBusy: fn });
    return Cloud.rpc(fn, args).then(r => {
      this.__plAct = false;
      this.setState({ plActBusy: '' });
      if (ok) ok(r);
      return this.plSync(true);
    }, e => {
      this.__plAct = false;
      this.setState({ plActBusy: '', toast: e && e.code === 'network' ? 'Pas de réseau : réessaie dans un instant.' : e && e.code === 'not_installed' ? 'Les Points de loyauté arrivent très bientôt.' : (e && e.message) || 'Une erreur est survenue.' });
      this.flash();
      return null;
    });
  };
  plProto.plShare = function () {
    const st = this.st().plState, code = st && st.code;
    if (!code) return;
    const url = PL_LINK + code, text = 'Rejoins-moi sur Dropicards, l’app des collectionneurs de cartes Pokémon : la valeur de ta collection, des jeux et des lots. Avec mon lien, tu reçois 50 PL de bienvenue !';
    let shared = false;
    try { if (typeof navigator.share === 'function') { shared = true; navigator.share({ title: 'Dropicards', text: text, url: url }).catch(() => {}); } } catch (e) { shared = false; }
    if (!shared) this.plCopy();
  };
  plProto.plCopy = function () {
    const st = this.st().plState, code = st && st.code;
    if (!code) return;
    const say = t => { this.setState({ toast: t + PL_LINK.replace('https://', '') + code }); this.flash(); };
    const done = () => say('Lien de parrainage copié : '), fail = () => say('Copie impossible ici. Ton lien : ');
    try { navigator.clipboard.writeText(PL_LINK + code).then(done, fail); } catch (e) { fail(); }
  };
  plProto.plNet = function (id) {
    const href = plSocial(id);
    if (!href) return;
    const s = this.st(), opened = Object.assign({}, s.plOpened || {});
    if (!opened[id]) {
      opened[id] = Date.now();
      this.setState({ plOpened: opened });
      try { window.open(href, '_blank', 'noopener'); } catch (e) { /* fenêtre bloquée */ }
      return;
    }
    this.plAct('pl_claim_social', { net: id }, r => { if (r && r.pl) this.plCelebrate([r]); });
  };
  plProto.plPickFile = function () { const el = document.getElementById('pkm-pl-file'); if (el) { el.value = ''; el.click(); } };
  plProto.plOnFile = function (file) {
    this.setState({ plShot: '', plShotErr: '', plShotBusy: true });
    plShrink(file).then(d => this.setState({ plShot: d, plShotBusy: false }), e => this.setState({ plShotErr: e.message, plShotBusy: false }));
  };
  plProto.plSendProof = function () {
    const s = this.st();
    if (!s.plShot) { this.plPickFile(); return; }
    this.plAct('pl_submit_proof', { net: s.plShotNet || 'tiktok', img: s.plShot }, () => {
      this.setState({ plShot: '', plShareOpen: false, toast: 'Capture envoyée : un admin la vérifie, puis tes 100 PL arrivent.' });
      this.flash();
    });
  };

  // Page « Gagner des PL ».
  plProto.vPlEarn = function (s) {
    const st = s.plState && typeof s.plState === 'object' ? s.plState : null, online = plOnline();
    const admin = typeof Cloud !== 'undefined' && Cloud.isAdmin && Cloud.isAdmin();
    let msg = '';
    if (!online) msg = 'Connecte-toi à ton compte Dropicards pour gagner des Points de loyauté.';
    else if (s.plErr === 'off') msg = admin ? 'Aperçu admin : les Points de loyauté ne sont pas encore installés sur le serveur. Colle tools/supabase/install_024_a_028.sql dans Studio (SQL Editor › Run).' : 'Bientôt disponible : les Points de loyauté arrivent très vite.';
    else if (!st && s.plErr === 'net') msg = 'Pas de réseau : les missions s’affichent dès que tu es connecté.';
    else if (!st && s.plErr) msg = 'Les missions ne sont pas disponibles pour le moment.';
    else if (!st) msg = 'Chargement de tes missions…';
    const busy = s.plActBusy || '';
    const code = (st && st.code) || '', link = code ? PL_LINK + code : '', qr = plQr(link);
    const ref = (st && st.referrals) || {}, soc = (st && st.social) || {}, stk = (st && st.streak) || {}, sh = (st && st.share) || {};
    const done = Array.isArray(stk.done) ? stk.done.map(Number) : [], cur = Number(stk.cur) || 0;
    const rows = [];
    PL_NETS.forEach(n => {
      const href = plSocial(n.id), ok = !!soc[n.id], opened = !!(s.plOpened || {})[n.id];
      rows.push({
        icon: n.icon, icoCls: 'pkm-ple-ico pkm-pc-' + n.id, title: n.title, sub: ok ? 'Fait ✓ · merci !' : 'Une seule fois · sur l’honneur', pl: '100',
        hasBar: false, barW: '', cta: ok ? 'Fait' : !href ? 'Bientôt' : opened ? 'Valider' : 'Y aller', off: ok || !href || busy === 'pl_claim_social',
        btnCls: 'pkm-ple-cta' + (ok ? ' pkm-ple-cta-done' : opened ? ' pkm-ple-cta-go' : ''), cls: 'pkm-ple-row' + (ok ? ' pkm-ple-row-done' : ''),
        aria: n.title + ' : ' + (ok ? 'fait' : !href ? 'bientôt disponible' : opened ? 'valider pour recevoir 100 PL' : 'ouvrir, puis valider pour 100 PL'),
        pick: () => this.plNet(n.id)
      });
    });
    PL_STREAKS.forEach(k => {
      const ok = done.includes(k.n), have = Math.min(cur, k.n);
      rows.push({
        icon: 'img/brand/pa.svg', icoCls: 'pkm-ple-ico pkm-ple-ico-streak', title: k.n + ' jours d’affilée', pl: String(k.pl),
        sub: ok ? 'Fait ✓ · revient la saison prochaine' : have + ' / ' + k.n + ' jours · ouvre l’app chaque jour', hasBar: !ok, barW: 'width: ' + Math.round(100 * have / k.n) + '%',
        cta: ok ? 'Fait' : 'Auto', off: true, btnCls: 'pkm-ple-cta' + (ok ? ' pkm-ple-cta-done' : ' pkm-ple-cta-auto'), cls: 'pkm-ple-row' + (ok ? ' pkm-ple-row-done' : ''),
        aria: k.n + ' jours d’affilée : ' + (ok ? 'fait cette saison' : have + ' jours sur ' + k.n + ', ' + k.pl + ' PL donnés automatiquement'), pick: () => {}
      });
    });
    const shSt = sh.status || 'todo', tries = Number(sh.tries) || 0, left = Math.max(0, (Number(sh.max) || 3) - tries);
    const shOk = shSt === 'ok', shWait = shSt === 'pending', shNo = shSt === 'no';
    rows.push({
      icon: 'img/brand/pl.svg', icoCls: 'pkm-ple-ico pkm-ple-ico-share', title: 'Partager Dropicards sur tes réseaux', pl: '100',
      sub: shOk ? 'Fait ✓ · revient la saison prochaine' : shWait ? 'Capture en attente de validation' : shNo ? (left ? 'Capture refusée : envoies-en une autre (' + left + ' essai' + (left > 1 ? 's' : '') + ')' : 'Plus d’essai cette saison') : 'Une fois par saison · capture d’écran comme preuve',
      hasBar: false, barW: '', cta: shOk ? 'Fait' : shWait ? 'En attente' : 'Envoyer', off: shOk || shWait || (shNo && !left),
      btnCls: 'pkm-ple-cta' + (shOk ? ' pkm-ple-cta-done' : shWait ? ' pkm-ple-cta-auto' : ''), cls: 'pkm-ple-row' + (shOk ? ' pkm-ple-row-done' : ''),
      aria: 'Partage : ' + (shOk ? 'fait cette saison' : shWait ? 'en attente de validation' : 'envoyer une capture pour 100 PL'),
      pick: () => this.setState({ plShareOpen: !s.plShareOpen })
    });
    const net = s.plShotNet || 'tiktok';
    return {
      hasMsg: !!msg, msg: msg, ready: !!st,
      season: plNum(st && st.pl_season), total: plNum(st && st.pl_total),
      headAria: 'Mes Points de loyauté : ' + plNum(st && st.pl_season) + ' cette saison, ' + plNum(st && st.pl_total) + ' au total',
      code: code, linkShort: link.replace('https://', ''), hasQr: !!qr, qrPath: qr ? qr.d : '', qrBox: qr ? qr.box : '0 0 1 1',
      share: () => this.plShare(), copy: () => this.plCopy(),
      refCount: plNum(ref.season) + ' / ' + plNum(ref.cap || 20), refPending: plNum(ref.pending), refPrem: plNum(ref.premium),
      hasParrain: !!(st && st.parrain), parrain: (st && st.parrain) || '',
      canCode: !!(st && st.can_set_parrain), codeIn: s.plCodeIn || '',
      onCode: e => this.setState({ plCodeIn: String((e && e.target && e.target.value) || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) }),
      sendCode: () => { const c = (this.st().plCodeIn || '').trim(); if (!plCodeOk(c)) { this.setState({ toast: 'Code de parrainage : 4 à 12 lettres ou chiffres.' }); this.flash(); return; }
        this.plAct('pl_set_parrain', { code: c }, r => { this.setState({ plCodeIn: '', toast: 'Parrainé par ' + ((r && r.parrain) || 'un ami') + ' : +' + plNum(r && r.pl) + ' PL' }); this.flash(); }); },
      codeBusy: busy === 'pl_set_parrain',
      rows: rows,
      shareOpen: !!s.plShareOpen && !shOk && !shWait && !(shNo && !left),
      shareNets: PL_SHARE_NETS.map(([id, name]) => ({ label: name, on: id === net, cls: 'pkm-ple-chip' + (id === net ? ' pkm-ple-chip-on' : ''), pick: () => this.setState({ plShotNet: id }) })),
      pickFile: () => this.plPickFile(), onFile: e => this.plOnFile(e && e.target && e.target.files && e.target.files[0]),
      hasShot: !!s.plShot, shot: s.plShot || '', shotErr: s.plShotErr || '', hasShotErr: !!s.plShotErr, shotBusy: !!s.plShotBusy,
      send: () => this.plSendProof(), sendOff: !s.plShot || busy === 'pl_submit_proof', sendLabel: busy === 'pl_submit_proof' ? 'Envoi…' : 'Envoyer ma capture',
      shareMine: () => this.plShare()
    };
  };

  // ——— Admin › « Défis à valider » : captures de partage en attente ———
  const plpOnline = plOnline;
  plProto.plpLoad = function () {
    if (!plpOnline() || this.__plpBusy) return;
    this.__plpBusy = true;
    Cloud.rpc('admin_pl_proofs').then(rows => {
      this.__plpBusy = false;
      this.setState({ plpRows: Array.isArray(rows) ? rows.filter(r => r && r.id) : [], plpErr: '', plpAt: Date.now() });
    }, e => {
      this.__plpBusy = false;
      this.setState({ plpAt: Date.now(), plpErr: e && e.code === 'not_installed'
        ? 'Les Points de loyauté ne sont pas encore installés sur le serveur : colle tools/supabase/install_024_a_028.sql dans Studio (SQL Editor › Run).'
        : 'Liste indisponible : rouvre le mode Admin avec le mot de passe des admins (' + ((e && e.message) || 'erreur') + ').' });
    });
  };
  plProto.plpDecide = function (id, ok) {
    if (this.__plpDec) return;
    this.__plpDec = true;
    Cloud.rpc('admin_pl_decide', { proof: id, ok: !!ok }).then(() => {
      this.__plpDec = false;
      this.setState({ plpRows: (this.st().plpRows || []).filter(x => x.id !== id), toast: ok ? 'Partage validé : +100 PL pour le joueur' : 'Capture refusée (effacée)' });
      this.flash();
    }, e => { this.__plpDec = false; this.setState({ toast: (e && e.message) || 'Erreur' }); this.flash(); this.plpLoad(); });
  };
  const PL_NET_NAME = Object.fromEntries(PL_SHARE_NETS);
  plProto.plpView = function (s) {
    const online = plpOnline();
    if (online && s.plpRows === undefined && !this.__plpAsked) { this.__plpAsked = true; setTimeout(() => this.plpLoad(), 0); }
    const rows = s.plpRows || [];
    return {
      head: 'Défis à valider', online: online, offline: !online, offlineText: 'Connecte-toi avec ton compte admin pour valider les captures.',
      count: rows.length ? rows.length + ' capture' + (rows.length > 1 ? 's' : '') + ' en attente' : (s.plpAt && !s.plpErr ? 'Aucune capture en attente.' : ''),
      hasErr: !!s.plpErr, err: s.plpErr || '', refresh: () => this.plpLoad(),
      hasList: rows.length > 0,
      list: rows.map(r => ({
        who: r.pseudo || 'Sans pseudo', alt: 'Capture envoyée par ' + (r.pseudo || 'un joueur'), net: PL_NET_NAME[r.net] || r.net, img: r.image || '', hasImg: !!r.image,
        when: r.created_at ? new Date(r.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '',
        big: s.plpZoom === r.id, imgCls: 'pkm-plp-img' + (s.plpZoom === r.id ? ' pkm-plp-img-big' : ''),
        zoom: () => this.setState({ plpZoom: this.st().plpZoom === r.id ? '' : r.id }),
        ok: () => this.plpDecide(r.id, true), no: () => this.plpDecide(r.id, false)
      }))
    };
  };
  const plBaseAdm = plProto.admView;
  plProto.admView = function (s) {
    const r = plBaseAdm.call(this, s);
    // Liste relue à chaque ouverture du panneau Admin.
    if (r.sheet && !this.__plpOpen && this.__plpAsked) setTimeout(() => this.plpLoad(), 0);
    this.__plpOpen = !!r.sheet;
    r.plp = r.sheet ? this.plpView(s) : { list: [] };
    return r;
  };
