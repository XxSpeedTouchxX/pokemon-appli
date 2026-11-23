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
  const plRemember = c => { try { if (plCodeOk(c)) localStorage.setItem(PL_LS, JSON.stringify({ code: c, at: Date.now() })); } catch (e) { /* stockage indisponible */ } };
  // Parrainage fiabilisé (2026-11-21, porteur : « que tous les liens de parrainage soient fonctionnels, que les
  // redirections se fassent correctement, que les personnes reçoivent bien le gain ») :
  //   - le code du lien est montré sur le premier écran (« Sacha t'invite », pseudo lu par pl_invite sans compte, 037)
  //     et prérempli dans la page d'inscription, où il peut aussi être tapé à la main (lien ouvert dans TikTok ou
  //     Instagram, app ajoutée à l'écran d'accueil de l'iPhone : leur mémoire n'est pas celle de Safari) ;
  //   - il part avec l'inscription (data.parrain) : le serveur relie le filleul et donne ses 50 PL tout de suite (037) ;
  //     sinon (serveur sans 037) pl_set_parrain à la première connexion, comme avant ;
  //   - lien ouvert par un compte qui ne peut plus être parrainé (le sien, compte de plus de 14 jours, déjà parrainé) :
  //     un message clair et la page « Parrainer un ami » du coin des dresseurs, au lieu de rien ;
  //   - 200 PL du parrain montrés avec l'animation même s'ils sont arrivés en son absence (pl_state « new », 037) ;
  //   - pas d'animation des PL par-dessus l'accueil ou le didacticiel : elle attend qu'ils soient finis.
  plProto.plRefCode = () => plPending();
  plProto.plRemember = c => plRemember(String(c || '').toUpperCase());
  // Invitation du premier écran : code en attente et pseudo de son propriétaire (lu une fois par code).
  let plInvAsk = '';
  plProto.plInvite = function () {
    const code = plPending();
    if (!code) return null;
    const inv = this.st().plInv;
    if (inv && inv.code === code) return inv;
    if (plInvAsk !== code && typeof Cloud !== 'undefined' && Cloud.on() && typeof Cloud.rpcPublic === 'function') {
      plInvAsk = code;
      Cloud.rpcPublic('pl_invite', { code: code }).then(r => this.setState({ plInv: { code: code, pseudo: (r && r.pseudo) || '', bad: !r } }),
        () => this.setState({ plInv: { code: code, pseudo: '', bad: false } }));
    }
    return { code: code, pseudo: '', bad: false };
  };

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
    streak: g => g.ref + ' jours d’affilée',
    referral: g => (g.note && /^Filleul : /.test(g.note) ? g.note.replace(/^Filleul : /, 'ton filleul ') + ' a rempli les conditions' : 'un ami de plus parrainé'),
    referral_premium: () => 'ton filleul a pris le DropiPass',
    share: () => 'partage validé', social: () => 'merci de suivre Dropicards',
    welcome_ref: g => (g.note && /^Bienvenue, /.test(g.note) ? 'bienvenue, tu es ' + g.note.replace(/^Bienvenue, /, '') : 'bienvenue')
  };
  // Mission qui a rapporté des PL, écrite sous « +N PL » (2026-11-22, porteur : « qu'il y ait marqué dessous la mission
  // correspondante, pour que l'utilisateur sache pourquoi il en a gagné ») : même nom que dans « Mes missions ».
  const plEsc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const plMission = g => {
    const k = g && g.kind, note = String((g && g.note) || ''), ref = String((g && g.ref) || '');
    if (k === 'streak') return { k: 'Mission réussie', t: ref + ' jours d’affilée', d: 'tu as ouvert Dropicards ' + ref + ' jours de suite' };
    if (k === 'social') { const n = PL_NETS.find(x => x.id === ref); return { k: 'Mission réussie', t: n ? n.title : 'Suivre Dropicards', d: 'merci de nous suivre !' }; }
    if (k === 'share') {
      const net = note.replace(/^Partage sur /, ''), lab = (PL_SHARE_NETS.find(x => x[0] === net) || [net, net])[1];
      return { k: 'Mission réussie', t: 'Partager Dropicards sur tes réseaux', d: lab ? 'partage sur ' + lab + ' validé' : 'partage validé' };
    }
    if (k === 'referral') return { k: 'Mission réussie', t: 'Parrainer un ami', d: /^Filleul : /.test(note) ? note.replace(/^Filleul : /, '') + ' a rempli les conditions' : 'un ami de plus parrainé' };
    if (k === 'referral_premium') return { k: 'Mission réussie', t: 'Parrainer un ami', d: 'ton filleul a pris le DropiPass' };
    if (k === 'welcome_ref') return { k: 'Cadeau de bienvenue', t: 'Bienvenue sur Dropicards', d: /^Bienvenue, /.test(note) ? 'tu es ' + note.replace(/^Bienvenue, /, '') : 'tu as été parrainé' };
    if (k === 'admin') return { k: 'Bonus', t: 'Cadeau de l’équipe Dropicards', d: note };
    return { k: 'Mission réussie', t: 'Mission Dropicards', d: note };
  };
  const plWhyHtml = list => {
    const gs = (list || []).filter(g => g && Number(g.pl) > 0);
    if (!gs.length) return '';
    if (gs.length === 1) {
      const m = plMission(gs[0]);
      return '<div class="pkm-plfx-why"><span class="pkm-plfx-why-k">' + plEsc(m.k) + '</span><b>' + plEsc(m.t) + '</b>' + (m.d ? '<em>' + plEsc(m.d) + '</em>' : '') + '</div>';
    }
    const rows = gs.slice(0, 4).map(g => { const m = plMission(g); return '<li><b>' + plEsc(m.t) + '</b><i>+' + plNum(g.pl) + '</i></li>'; }).join('');
    const more = gs.length > 4 ? '<li class="pkm-plfx-more">+ ' + (gs.length - 4) + (gs.length - 4 > 1 ? ' autres missions' : ' autre mission') + '</li>' : '';
    return '<div class="pkm-plfx-why"><span class="pkm-plfx-why-k">' + gs.length + ' missions réussies</span><ul>' + rows + more + '</ul></div>';
  };
  // Animation des PL gagnés (2026-11-14, porteur : « quand l'utilisateur remporte des PL, une petite animation où l'on
  // voit le nombre de PL gagnés ») : le bouclier-cœur des PL arrive en rebondissant, « +N PL » compte jusqu'au total,
  // des petits boucliers jaillissent, puis la mission réussie s'écrit dessous (2026-11-22) ; tout s'efface seul en 3,8 s
  // (ou au toucher). Sans mouvement si l'appareil le demande (prefers-reduced-motion).
  const plFx = (n, list) => {
    if (!(n > 0) || typeof document === 'undefined') return;
    try {
      const old = document.querySelector('.pkm-plfx');
      if (old) old.remove();
      const ov = document.createElement('div');
      ov.className = 'pkm-plfx'; ov.setAttribute('role', 'status'); ov.setAttribute('aria-live', 'polite');
      let sparks = '';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.3, d = 120 + (i % 3) * 30;
        sparks += '<img src="img/brand/pl.svg" alt="" class="pkm-plfx-spark" style="--x:' + Math.round(Math.cos(a) * d) + 'px;--y:' + Math.round(Math.sin(a) * d) + 'px;--d:' + (i * 30) + 'ms">';
      }
      ov.innerHTML = '<div class="pkm-plfx-box"><span class="pkm-plfx-glow" aria-hidden="true"></span>' + sparks
        + '<img src="img/brand/pl.svg" alt="" class="pkm-plfx-logo"><b class="pkm-plfx-n">+' + plNum(n) + ' PL</b><small>Points de loyauté gagnés</small>' + plWhyHtml(list) + '</div>';
      document.body.appendChild(ov);
      const b = ov.querySelector('.pkm-plfx-n'), t0 = performance.now(), dur = 900;
      const still = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
      if (!still) {
        b.textContent = '+0 PL';
        const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = '+' + plNum(Math.round(n * e)) + ' PL'; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }
      const bye = () => { ov.classList.add('pkm-plfx-out'); setTimeout(() => ov.remove(), 380); };
      ov.addEventListener('click', bye);
      setTimeout(bye, ov.querySelector('.pkm-plfx-why') ? 3800 : 2600);
    } catch (e) { /* animation facultative */ }
  };
  // « first » : message déjà prévu (bienvenue d'un filleul), mis devant pour ne pas être effacé.
  // Accueil (création du compte) ou didacticiel en cours : l'animation attend qu'ils soient finis.
  let plLater = null, plLaterT = null;
  const plBusyUi = s => s.onb > 0 || s.tutoStep >= -1;
  plProto.plCelebrate = function (list, first) {
    if (plBusyUi(this.st())) {
      plLater = plLater ? { list: plLater.list.concat(list), first: plLater.first || first } : { list: list.slice(), first: first };
      if (!plLaterT) plLaterT = setInterval(() => {
        if (plBusyUi(this.st())) return;
        clearInterval(plLaterT); plLaterT = null;
        const l = plLater; plLater = null;
        if (l) setTimeout(() => this.plCelebrate(l.list, l.first), 600);
      }, 1500);
      return;
    }
    const sum = list.reduce((a, g) => a + (Number(g.pl) || 0), 0);
    const why = list.length === 1 ? (PL_WHY[list[0].kind] ? PL_WHY[list[0].kind](list[0]) : '') : list.length + ' missions réussies';
    const msg = sum ? '+' + plNum(sum) + ' PL' + (why ? ' · ' + why : '') + ' (Ma ligue)' : '';
    if (!msg && !first) return;
    plFx(sum, list);
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
    let hello = null, linkErr = '';
    // Code d'un lien (ou tapé à l'inscription) : relié au compte. « already » : déjà fait à l'inscription (037), la
    // bienvenue arrive par la liste « new ». Refus (son propre lien, compte trop ancien…) : expliqué, puis la page
    // « Parrainer un ami ».
    const first = code ? Cloud.rpc('pl_set_parrain', { code: code }).then(r => {
      plForget();
      if (r && r.ok && !r.already) hello = { kind: 'welcome_ref', ref: '', pl: Number(r.pl) || 0, note: 'Bienvenue, parrainé par ' + (r.parrain || 'un ami') };
    }, e => { if (e && e.code === 'game') { plForget(); linkErr = e.message || ''; } }) : Promise.resolve();
    plBusy = first.then(() => Cloud.rpc('pl_state')).then(st => {
      plBusy = null;
      if (linkErr) this.plLinkRefused(linkErr);
      if (!st || typeof st !== 'object') { if (hello) this.plCelebrate([hello]); return null; }
      this.setState({ plState: st, plErr: '' });
      // La bienvenue (hello) n'est montrée qu'une fois, en tête.
      const nw = (Array.isArray(st.new) ? st.new : []).filter(g => !(hello && g && g.kind === 'welcome_ref'));
      const all = hello ? [hello].concat(nw) : nw;
      if (all.length) this.plCelebrate(all);
      return st;
    }, e => {
      plBusy = null;
      if (hello) this.plCelebrate([hello]);
      if (e && e.code === 'not_installed') plOff = true;
      this.setState({ plErr: e && e.code === 'not_installed' ? 'off' : e && e.code === 'network' ? 'net' : 'err' });
      return null;
    });
    return plBusy;
  };
  // Lien de parrainage refusé pour ce compte : explication, puis « Parrainer un ami » (sauf pendant l'accueil ou le
  // didacticiel, où le message attend la fin).
  const PL_LINK_WHY = [
    [/propre parrain/, 'C’est ton propre lien de parrainage : partage-le à tes amis pour gagner des PL !', true],
    [/14 jours/, 'Ce lien de parrainage est réservé aux nouveaux comptes (14 premiers jours). À ton tour : invite tes amis avec ton lien !', true],
    [/déjà un parrain/, 'Tu as déjà un parrain : un seul par compte.', true],
    [/déjà ton filleul/, 'Ce dresseur est déjà ton filleul : vous ne pouvez pas vous parrainer l’un l’autre.', true],
    [/inconnu/, 'Ce code de parrainage n’existe pas : vérifie le lien reçu, ou tape le code de ton ami dans « Parrainer un ami ».', true]
  ];
  plProto.plLinkRefused = function (msg) {
    const m = PL_LINK_WHY.find(x => x[0].test(msg)), text = m ? m[1] : msg;
    const go = () => {
      if (m && m[2] && typeof this.coinGo === 'function') this.coinGo('par');
      this.setState({ toast: text }); this.flash();
    };
    if (!plBusyUi(this.st())) { go(); return; }
    const t = setInterval(() => { if (!plBusyUi(this.st())) { clearInterval(t); setTimeout(go, 600); } }, 1500);
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
    const url = PL_LINK + code, text = 'Rejoins-moi sur Dropicards, l’app des collectionneurs de cartes Pokémon : la valeur de ta collection, des jeux et des lots. Crée ton compte avec mon lien (ou mon code ' + code + ') et reçois 50 PL de bienvenue !';
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
  plProto.plCopyCode = function () {
    const st = this.st().plState, code = st && st.code;
    if (!code) return;
    const say = t => { this.setState({ toast: t }); this.flash(); };
    try { navigator.clipboard.writeText(code).then(() => say('Code copié : ' + code), () => say('Ton code : ' + code)); } catch (e) { say('Ton code : ' + code); }
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
    else if (s.plErr === 'off') msg = admin ? 'Aperçu admin : les Points de loyauté ne sont pas encore installés sur le serveur. Colle tools/supabase/install_024_a_034.sql dans Studio (SQL Editor › Run).' : 'Bientôt disponible : les Points de loyauté arrivent très vite.';
    else if (!st && s.plErr === 'net') msg = 'Pas de réseau : les missions s’affichent dès que tu es connecté.';
    else if (!st && s.plErr) msg = 'Les missions ne sont pas disponibles pour le moment.';
    else if (!st) msg = 'Chargement de tes missions…';
    const busy = s.plActBusy || '';
    const code = (st && st.code) || '', link = code ? PL_LINK + code : '', qr = plQr(link);
    const ref = (st && st.referrals) || {}, soc = (st && st.social) || {}, stk = (st && st.streak) || {}, sh = (st && st.share) || {};
    const done = Array.isArray(stk.done) ? stk.done.map(Number) : [], cur = Number(stk.cur) || 0;
    // Parrainage : sa page est dans « Le coin des dresseurs » (2026-11-21, porteur) ; ici, une ligne qui y mène.
    const rows = [{
      icon: 'img/brand/pl.svg', icoCls: 'pkm-ple-ico pkm-ple-ico-ref', title: 'Parrainer un ami', pl: '200',
      sub: 'Par ami inscrit avec ton lien · dans « Le coin des dresseurs »', hasBar: false, barW: '', cta: 'Y aller', off: false,
      btnCls: 'pkm-ple-cta pkm-ple-cta-go', cls: 'pkm-ple-row', aria: 'Parrainer un ami : 200 PL par ami, ouvrir la page dans Le coin des dresseurs',
      pick: () => { if (typeof this.coinGo === 'function') this.coinGo('par'); }
    }];
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
      // « Comment marchent les PL ? » : la page « Mes points », onglet PL (points.js, 2026-11-23).
      howPl: () => this.ptsOpen('pl'),
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

  // ——— « Parrainer un ami » (Le coin des dresseurs, coin.js) ———
  const plDay = d => { const t = Date.parse(String(d || '') + 'T12:00:00'); return isNaN(t) ? '' : new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
  const PL_FL_STATE = {
    ok: ['200 PL reçus ✓', 'pkm-prf-st pkm-prf-st-ok'], wait: ['En cours', 'pkm-prf-st pkm-prf-st-wait'],
    missed: ['Délai passé', 'pkm-prf-st pkm-prf-st-off'], nocount: ['Sans PL', 'pkm-prf-st pkm-prf-st-off']
  };
  // Étapes d'un filleul (ou les miennes) : adresse validée, jours d'ouverture, date limite.
  const plSteps = p => {
    if (!p || p.verified === undefined) return [];
    const need = Number(p.need) || 3, d = Math.min(need, Number(p.days) || 0), out = [];
    out.push({ label: p.verified ? 'Adresse e-mail validée' : 'Adresse e-mail à valider', cls: 'pkm-prf-ck' + (p.verified ? ' pkm-prf-ck-ok' : '') });
    out.push({ label: 'App ouverte ' + d + ' jour' + (d > 1 ? 's' : '') + ' sur ' + need + (p.until && p.open ? ' · jusqu’au ' + plDay(p.until) : ''), cls: 'pkm-prf-ck' + (d >= need ? ' pkm-prf-ck-ok' : '') });
    return out;
  };
  plProto.plVerifyMail = async function () {
    const ses = typeof Cloud !== 'undefined' && Cloud.session ? Cloud.session() : null;
    if (!ses || !ses.email) return;
    try { await Cloud.resend(ses.email); this.setState({ toast: 'E-mail envoyé à ' + ses.email + ' : touche son bouton (regarde aussi dans les spams).' }); } catch (e) { this.setState({ toast: (e && e.message) || 'Envoi impossible pour le moment.' }); }
    this.flash();
  };
  plProto.vPlRef = function (s) {
    const st = s.plState && typeof s.plState === 'object' ? s.plState : null, online = plOnline();
    const admin = typeof Cloud !== 'undefined' && Cloud.isAdmin && Cloud.isAdmin();
    let msg = '';
    if (!online) msg = 'Connecte-toi à ton compte Dropicards pour parrainer tes amis.';
    else if (s.plErr === 'off') msg = admin ? 'Aperçu admin : le parrainage n’est pas encore installé sur le serveur. Colle tools/supabase/install_024_a_034.sql dans Studio (SQL Editor › Run).' : 'Bientôt disponible : le parrainage arrive très vite.';
    else if (!st && s.plErr === 'net') msg = 'Pas de réseau : ton lien de parrainage s’affiche dès que tu es connecté.';
    else if (!st && s.plErr) msg = 'Le parrainage n’est pas disponible pour le moment.';
    else if (!st) msg = 'Chargement de ton lien de parrainage…';
    const code = (st && st.code) || '', link = code ? PL_LINK + code : '', qr = plQr(link), ref = (st && st.referrals) || {};
    const flRaw = st && Array.isArray(st.filleuls) ? st.filleuls : null;
    const fl = (flRaw || []).map(f => {
      const k = PL_FL_STATE[f.state] || PL_FL_STATE.wait, steps = f.state === 'wait' ? plSteps(f) : [];
      return {
        pseudo: f.pseudo || 'Nouveau dresseur', state: k[0] + (f.premium ? ' · +400 PL DropiPass' : ''), stateCls: k[1],
        when: 'Inscrit le ' + plDay(f.at) + (f.state === 'nocount' ? ' · pas compté (20 amis déjà comptés cette saison, ou 2ᵉ adresse d’un même compte)' : f.state === 'missed' ? ' · 3 jours non atteints dans ses 14 premiers jours' : ''),
        steps: steps, hasSteps: steps.length > 0
      };
    });
    const me = st && st.me_ref && typeof st.me_ref === 'object' ? st.me_ref : null, pp = (st && st.parrain) || '';
    let meText = '';
    if (me && me.done) meText = 'Merci ! Grâce à toi, ' + pp + ' a gagné ses 200 PL.';
    else if (me && me.missed) meText = 'Les 14 premiers jours sont passés : ' + pp + ' n’a pas reçu ses 200 PL cette fois.';
    else if (me) meText = 'Aide ' + pp + ' à gagner 200 PL : valide ton adresse e-mail et ouvre l’app 3 jours différents dans tes 14 premiers jours.';
    const meSteps = me && !me.done && !me.missed ? plSteps(me) : [];
    const canCode = !!(st && st.can_set_parrain), busy = s.plActBusy || '';
    const total = flRaw ? flRaw.length : Number(ref.all || 0);
    return {
      hasMsg: !!msg, msg: msg, ready: !!st,
      code: code, linkShort: link.replace('https://', ''), hasQr: !!qr, qrPath: qr ? qr.d : '', qrBox: qr ? qr.box : '0 0 1 1',
      share: () => this.plShare(), copy: () => this.plCopy(), copyCode: () => this.plCopyCode(),
      refCount: plNum(ref.season) + ' / ' + plNum(ref.cap || 20), refPending: plNum(ref.pending), refPrem: plNum(ref.premium),
      hasMe: !!pp || canCode, hasParrain: !!pp, parrain: pp, hasMeText: !!meText, meText: meText,
      meSteps: meSteps, hasMeSteps: meSteps.length > 0, canVerify: !!(me && !me.verified && !me.done && !me.missed),
      verify: () => this.plVerifyMail(),
      canCode: canCode, codeIn: s.plCodeIn || '',
      onCode: e => this.setState({ plCodeIn: String((e && e.target && e.target.value) || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) }),
      sendCode: () => { const c = (this.st().plCodeIn || '').trim(); if (!plCodeOk(c)) { this.setState({ toast: 'Code de parrainage : 4 à 12 lettres ou chiffres.' }); this.flash(); return; }
        // Serveur avec 037 : la bienvenue arrive avec l'animation (liste « new ») ; avant 037, un message.
        this.plAct('pl_set_parrain', { code: c }, r => {
          const v37 = (this.st().plState || {}).v >= 37;
          this.setState(Object.assign({ plCodeIn: '' }, v37 ? {} : { toast: 'Parrainé par ' + ((r && r.parrain) || 'un ami') + ' : +' + plNum(r && r.pl) + ' PL' }));
          if (!v37) this.flash();
        }); },
      codeBusy: busy === 'pl_set_parrain',
      fl: fl, hasFl: fl.length > 0, noFl: !fl.length,
      flCount: total ? plNum(total) + ' ami' + (total > 1 ? 's' : '') + ' inscrit' + (total > 1 ? 's' : '') : '',
      flEmpty: flRaw ? 'Aucun filleul pour l’instant : partage ton lien ou ton code à tes amis !' : total ? plNum(total) + ' ami' + (total > 1 ? 's' : '') + ' inscrit' + (total > 1 ? 's' : '') + ' avec ton lien.' : 'Aucun filleul pour l’instant : partage ton lien ou ton code à tes amis !'
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
        ? 'Les Points de loyauté ne sont pas encore installés sur le serveur : colle tools/supabase/install_024_a_034.sql dans Studio (SQL Editor › Run).'
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
