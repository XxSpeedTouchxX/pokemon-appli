  // ——— Vitrine, « Pour trade », « À vendre » et « Je cherche » : étage 1 des échanges entre joueurs (2026-11-16, « go »
  // du porteur, docs/45-proposition-vitrine-pour-trade.md, décisions V1 à V6 par défaut) ———
  // Le porteur ajoute : « laisse le choix à l'utilisateur de mettre son prix de vente : soit il vend au prix qu'il
  // indique, soit il propose un trade ».
  //   - Fiche d'une carte de mon classeur : « Dans ma vitrine », « Pour trade », « À vendre » (prix choisi par le joueur,
  //     après « J'ai 18 ans ou plus »), pour chaque exemplaire (langue, état, note). Carte que je n'ai pas : « ♡ Je la
  //     cherche ». La vitrine (30 cartes) et la liste (50 cartes) restent sur l'appareil et partent au serveur
  //     (033_vitrine.sql : showcase_set, wants_set) ; une carte retirée du classeur sort de la vitrine.
  //   - Ma ligue › onglet « Échanges » : mes cartes Pour trade ou à vendre, « Je cherche », échanges possibles.
  //   - Carte de dresseur : sa vitrine (étiquettes POUR TRADE et À VENDRE avec le prix), ce qu'il cherche, ce qui colle
  //     avec moi ; un appui sur une carte : « Je suis intéressé » ou « Je te propose une de mes cartes » (trade_send).
  //   - « Mes messages » : propositions avec les cartes, réponses « Ça m'intéresse » (accord), « Non merci », « Plus
  //     disponible » (trade_answer). Jamais de texte libre, jamais de paiement : pour s'organiser, étage 2 (plus tard).
  // Serveur sans 033 : un admin voit le fichier à installer, un joueur « bientôt ».
  const VT_MAX = 30, WANT_MAX = 50, VT_TTL = 60000;
  const VT_FILE = 'tools/supabase/install_024_a_033.sql';
  const vtOnline = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn();
  const vtAdmin = () => typeof Cloud !== 'undefined' && Cloud.on() && Cloud.isAdmin && Cloud.isAdmin();
  const vtRef = (pid, g) => pid + '|' + (g.lang || 'FR') + '|' + (g.cond || 'NM') + '|' + (g.gr || '');
  const vtParse = ref => { const a = String(ref).split('|'); return { pid: a[0], lang: a[1] || 'FR', cond: a[2] || 'NM', gr: a[3] || '' }; };
  const vtPriceTxt = cents => (Number(cents) / 100).toLocaleString('fr-FR', { minimumFractionDigits: Number(cents) % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';
  const vtOld = () => (vtAdmin() ? 'Aperçu admin : les échanges ne sont pas encore installés sur le serveur. Colle ' + VT_FILE + ' dans Studio (SQL Editor › Run).' : 'Les échanges entre joueurs arrivent très bientôt.');
  const vtErrText = e => (e && e.code === 'network' ? 'Pas de réseau : réessaie dans un instant.' : e && e.code === 'not_installed' ? vtOld() : (e && e.message) || 'Une erreur est survenue. Réessaie dans un instant.');
  const vtProto = Component.prototype;

  // Exemplaires restants d'une carte, par langue, état et note (comme la fiche).
  const vtGroups = (s, pid) => {
    const g = new Map();
    (valLeft(s)[pid] || []).filter(c => c.left > 0).forEach(c => {
      const k = (c.lang || 'FR') + '|' + (c.cond || 'NM') + '|' + (gradeOf(c.gr) ? c.gr : '');
      g.set(k, (g.get(k) || 0) + c.left);
    });
    return [...g.entries()].map(([k, qty]) => { const [lang, cond, gr] = k.split('|'); return { lang: lang, cond: cond, gr: gr, qty: qty }; }).sort((a, b) => b.qty - a.qty);
  };
  // Carte vue dans une vitrine, un message ou une liste : visuel, nom, état, cote de l'exemplaire.
  vtProto.vtCard = function (id, lang, cond, gr) {
    let p = null;
    try { p = typeof TCG !== 'undefined' && TCG.item ? TCG.item(id) : null; } catch (e) { p = null; }
    if (!p) p = this.catalog().find(q => q.id === id) || null; // cartes de la démo
    const k = p ? this.cote(p) : null, G = gr ? gradeOf(gr) : null;
    const coef = this.valOn() ? (G ? valCoefG(lang || 'FR', cond || 'NM', gr) : valCoef(lang || 'FR', cond || 'NM')) : 1;
    const name = p ? p.name : 'Carte', img = p && p.img ? p.img : '';
    return { id: id, name: name, img: img, fallback: (p && p.fallback) || '', hasImg: !!img, noImg: !img, sub: p ? [p.setName, p.numShort].filter(Boolean).join(' · ') : '',
      cond: G ? gradeName(G) : (HOME_COND_AB[cond] || cond || 'NM'), condLong: G ? gradeName(G) + ' · ' + (lang || 'FR') : (cond === 'MT' ? 'Mint' : copyLabel({ type: 'card' }, cond || 'NM')) + ' · ' + (lang || 'FR'),
      value: k !== null && k !== undefined ? '≈ ' + this.coteTxt(k * coef) : '—', valueNum: k !== null && k !== undefined ? k * coef : null };
  };

  // ——— Données ———
  // Liste envoyée au serveur : les exemplaires de la vitrine encore dans le classeur (les autres en sortent).
  vtProto.vtItems = function (s) {
    const vit = s.vit || {}, out = [], keep = {};
    Object.keys(vit).forEach(ref => {
      const r = vtParse(ref), v = vit[ref] || {};
      if (!vtGroups(s, r.pid).some(g => g.lang === r.lang && g.cond === r.cond && g.gr === r.gr)) return;
      keep[ref] = v;
      out.push({ ref: ref, card_id: r.pid, lang: r.lang, cond: r.cond, grade: r.gr || null, trade: !!v.t, sale: !!v.s, price: v.s ? v.p : null, deal_off: !!v.off });
    });
    return { items: out.slice(0, VT_MAX), keep: keep };
  };
  vtProto.vtSync = function () { clearTimeout(this.__vtT); this.__vtT = setTimeout(() => this.vtPush(), 500); };
  // Pseudo sur le serveur (2026-11-16, porteur : « Compte suspendu ou sans pseudo » en mettant une carte en vitrine) :
  // un compte créé dans Studio n'a pas de pseudo ; on y met celui du dresseur de l'appareil (sinon « Dresseur » et
  // 4 chiffres), une fois par session. Un compte vraiment suspendu reste refusé par le serveur.
  vtProto.vtEnsurePseudo = function (force) {
    if (!vtOnline()) return Promise.resolve(false);
    if (this.__vtPseudo && !force) return this.__vtPseudo;
    this.__vtPseudo = Cloud.profile().then(pr => {
      if (!pr) return false;
      if (pr.status === 'suspended') return 'suspended';
      if (pr.pseudo) return true;
      const t = this.st().trainer || {}, nick = String(t.name || '').replace(/\s+/g, ' ').trim().slice(0, 24);
      const p = nick.length >= 2 ? nick : 'Dresseur ' + String(1000 + Math.floor(Math.random() * 9000));
      return Cloud.setPseudo(p).then(() => true, () => false);
    }, () => false);
    return this.__vtPseudo;
  };
  const vtNoPseudo = e => !!(e && /sans pseudo|suspendu/i.test(e.message || ''));
  vtProto.vtPush = function (retry) {
    if (!vtOnline()) return Promise.resolve(null);
    return this.vtEnsurePseudo(!!retry).then(ok => {
      const s = this.st(), r = this.vtItems(s), body = JSON.stringify(r.items), wants = (s.wants || []).slice(0, WANT_MAX), wb = JSON.stringify(wants);
      if (Object.keys(r.keep).length !== Object.keys(s.vit || {}).length) this.setState({ vit: r.keep });
      const jobs = [];
      if (body !== this.__vtSentV) jobs.push(Cloud.rpc('showcase_set', { items: r.items }).then(() => {
        this.__vtSentV = body;
        // Accords annulés envoyés : la marque « off » n'a plus lieu d'être.
        const vit = Object.assign({}, this.st().vit || {}); let ch = false;
        Object.keys(vit).forEach(k => { if (vit[k] && vit[k].off) { vit[k] = Object.assign({}, vit[k]); delete vit[k].off; ch = true; } });
        if (ch) { this.__vtSentV = JSON.stringify(this.vtItems(Object.assign({}, this.st(), { vit: vit })).items); this.setState({ vit: vit }); }
      }));
      if (wb !== this.__vtSentW) jobs.push(Cloud.rpc('wants_set', { ids: wants }).then(() => { this.__vtSentW = wb; }));
      if (!jobs.length) return null;
      return Promise.all(jobs).then(() => { this.setState({ vtErr: '' }); return this.vtLoadState(true); }, e => {
        // Pseudo manquant : remis, puis un seul nouvel essai ; jamais le message brut du serveur à l'écran.
        if (vtNoPseudo(e) && !retry && ok !== 'suspended') return this.vtPush(true);
        this.setState({ vtErr: e && e.code === 'not_installed' ? 'old' : e && e.code === 'network' ? 'net' : vtNoPseudo(e) ? 'pseudo' : 'err' });
        if (vtNoPseudo(e)) {
          if (ok === 'suspended' && !this.__vtSuspTold) { this.__vtSuspTold = true; this.setState({ toast: 'Ton compte est suspendu : ta vitrine reste sur ton téléphone.' }); this.flash(); }
          return null;
        }
        if (e && e.code !== 'network' && e.code !== 'not_installed') { this.setState({ toast: vtErrText(e) }); this.flash(); }
        return null;
      });
    });
  };
  // Mon état (serveur) : majeur déclaré, âge, numéros et accords de mes cartes, demande et offre.
  vtProto.vtLoadState = function (force) {
    const s = this.st();
    if (!vtOnline() || this.__vtStBusy) return Promise.resolve(null);
    if (!force && s.vtSt && Date.now() - (s.vtSt.at || 0) < VT_TTL) return Promise.resolve(s.vtSt);
    this.__vtStBusy = true;
    return Cloud.rpc('trade_state', {}).then(d => {
      this.__vtStBusy = false;
      const mine = {};
      (d && Array.isArray(d.mine) ? d.mine : []).forEach(m => { mine[m.ref] = { sid: m.sid, deal: !!m.deal }; });
      const st = { at: Date.now(), adult: !!(d && d.adult), ageOk: !(d && d.age_ok === false), mine: mine, demand: (d && d.demand) || {}, supply: (d && d.supply) || {} };
      this.setState(Object.assign({ vtSt: st, vtErr: '' }, st.adult && !this.st().tradeAdult ? { tradeAdult: true } : {}));
      return st;
    }, e => {
      this.__vtStBusy = false;
      this.setState({ vtSt: Object.assign({}, this.st().vtSt || {}, { at: Date.now() }), vtErr: e && e.code === 'not_installed' ? 'old' : e && e.code === 'network' ? 'net' : 'err' });
      return null;
    });
  };
  vtProto.vtLoadMatches = function (force) {
    const s = this.st();
    if (!vtOnline() || (s.vtMatches && s.vtMatches.busy)) return;
    if (!force && s.vtMatches && Date.now() - (s.vtMatches.at || 0) < VT_TTL) return;
    this.setState({ vtMatches: Object.assign({}, s.vtMatches || {}, { busy: true }) });
    Cloud.rpc('trade_matches', { lim: 30 }).then(d => this.setState({ vtMatches: { at: Date.now(), busy: false, list: Array.isArray(d) ? d : [], err: '' } }),
      e => this.setState({ vtMatches: { at: Date.now(), busy: false, list: [], err: e && e.code === 'not_installed' ? 'old' : e && e.code === 'network' ? 'net' : 'err' } }));
  };
  // Une carte (fiche) : joueurs qui la cherchent, joueurs qui l'ont pour trade ou à vendre.
  vtProto.vtCardStat = function (id) {
    const c = (this.__vtCard = this.__vtCard || {}), x = c[id];
    if (x && (x.busy || Date.now() - x.at < VT_TTL)) return x;
    if (!vtOnline()) return null;
    c[id] = { busy: true, at: Date.now() };
    Cloud.rpc('trade_card', { card_id: id }).then(d => { c[id] = { at: Date.now(), wanted: Number(d && d.wanted) || 0, offered: Number(d && d.offered) || 0 }; this.setState({ vtTick: Date.now() }); },
      () => { c[id] = { at: Date.now(), err: true }; });
    return c[id];
  };

  // ——— Animation « carte qui entre dans ma vitrine » (2026-11-16, porteur : à la place du message du bas) ———
  // La carte apparaît, reçoit son étiquette (POUR TRADE, À VENDRE · prix), puis descend dans une vitrine en verre qui
  // s'illumine. 2,6 s ; rien ne bloque l'écran (calque sans toucher) ; mouvement réduit : simple fondu (vitrine.css).
  const VT_FX_MS = 2600;
  const VT_CASE = '<svg viewBox="0 0 160 120" aria-hidden="true"><defs><linearGradient id="pkmVtG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BFE8FF" stop-opacity=".55"/><stop offset=".5" stop-color="#8FC9F0" stop-opacity=".18"/><stop offset="1" stop-color="#D8F1FF" stop-opacity=".45"/></linearGradient><linearGradient id="pkmVtW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE680"/><stop offset="1" stop-color="#C99A12"/></linearGradient></defs>'
    + '<rect x="8" y="98" width="144" height="16" rx="4" fill="url(#pkmVtW)" stroke="#0B1120" stroke-width="3"/>'
    + '<rect x="16" y="8" width="128" height="92" rx="8" fill="url(#pkmVtG)" stroke="#E8F6FF" stroke-width="3"/>'
    + '<path d="M30 16 L54 16 L26 74 L22 74 Z" fill="#fff" opacity=".35"/><path d="M62 16 L70 16 L44 70 L40 70 Z" fill="#fff" opacity=".22"/>'
    + '<rect x="16" y="66" width="128" height="5" fill="#E8F6FF" opacity=".75"/><rect x="14" y="4" width="132" height="8" rx="4" fill="url(#pkmVtW)" stroke="#0B1120" stroke-width="2.5"/></svg>';
  vtProto.vtFx = function (ref, kind, price) {
    if (typeof document === 'undefined') return;
    const r = vtParse(ref), c = this.vtCard(r.pid, r.lang, r.cond, r.gr);
    const host = document.getElementById('app') || document.body, old = document.querySelector('.pkm-vfx');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'pkm-vfx pkm-vfx-' + kind;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    const what = kind === 'trade' ? 'Pour trade dans ta vitrine' : kind === 'sale' ? 'En vente à ' + price : 'Dans ta vitrine';
    el.setAttribute('aria-label', c.name + ' : ' + what);
    const tag = kind === 'trade' ? '<em class="pkm-vt-badge pkm-vfx-tag">⇄ POUR TRADE</em>' : kind === 'sale' ? '<em class="pkm-vt-badge pkm-vt-badge-sale pkm-vfx-tag"></em>' : '';
    const sparks = Array.from({ length: 10 }, (_, i) => '<i style="--a: ' + i * 36 + 'deg"></i>').join('');
    el.innerHTML = '<div class="pkm-vfx-veil"></div><div class="pkm-vfx-stage">'
      + '<div class="pkm-vfx-case">' + VT_CASE + '<div class="pkm-vfx-sparks" aria-hidden="true">' + sparks + '</div></div>'
      + '<div class="pkm-vfx-card" aria-hidden="true">' + (c.hasImg ? '<img alt="">' : '<span class="pkm-vt-noimg"></span>') + tag + '</div>'
      + '<p class="pkm-vfx-what"></p></div>';
    if (kind === 'sale') el.querySelector('.pkm-vfx-tag').textContent = 'À VENDRE · ' + price;
    if (c.hasImg) {
      const im = el.querySelector('.pkm-vfx-card img');
      im.onerror = () => { if (c.fallback && im.src.indexOf(c.fallback) < 0 && !/^drawn:/.test(c.fallback)) im.src = c.fallback; };
      im.src = c.img;
    } else el.querySelector('.pkm-vfx-card .pkm-vt-noimg').textContent = c.name;
    el.querySelector('.pkm-vfx-what').textContent = what;
    host.appendChild(el);
    setTimeout(() => el.remove(), VT_FX_MS);
  };

  // ——— Actions de la fiche ———
  vtProto.vtSet = function (vit) { this.setState({ vit: vit, vtEver: true }); this.vtSync(); };
  vtProto.vtToggle = function (ref, what) {
    const s = this.st(), vit = Object.assign({}, s.vit || {}), v = vit[ref] ? Object.assign({}, vit[ref]) : null;
    const full = !v && Object.keys(vit).length >= VT_MAX;
    if (full) { this.setState({ toast: 'Ta vitrine peut montrer 30 cartes au plus : retire une carte avant d’en ajouter une.' }); this.flash(); return; }
    if (what === 'show') {
      if (v) delete vit[ref]; else vit[ref] = {};
      this.vtSet(vit);
      if (!v) this.vtFx(ref, 'show');
      return;
    }
    if (s.vtSt && s.vtSt.ageOk === false) { this.setState({ toast: 'Les échanges sont ouverts à partir de 15 ans.' }); this.flash(); return; }
    const w = v || {};
    if (what === 'trade') { w.t = !w.t; vit[ref] = w; this.vtSet(vit); if (w.t) this.vtFx(ref, 'trade'); return; }
    if (what === 'sale') {
      if (w.s) { delete w.s; delete w.p; vit[ref] = w; this.vtSet(vit); this.setState({ vtPriceRef: null }); return; }
      if (!s.tradeAdult) { this.setState({ vtAdultAsk: ref, vtPriceRef: null }); return; }
      this.vtPriceOpen(ref);
    }
  };
  vtProto.vtPriceOpen = function (ref) {
    const s = this.st(), r = vtParse(ref), c = this.vtCard(r.pid, r.lang, r.cond, r.gr), v = (s.vit || {})[ref];
    const def = v && v.s ? v.p : c.valueNum ? Math.max(1, Math.round(c.valueNum)) : '';
    this.setState({ vtPriceRef: ref, vtPriceIn: def === '' ? '' : String(def).replace('.', ','), vtAdultAsk: null });
  };
  vtProto.vtAdultYes = function () {
    const ref = this.st().vtAdultAsk;
    if (!vtOnline()) { this.setState({ toast: 'Connecte-toi à ton compte Dropicards pour vendre une carte.' }); this.flash(); return; }
    Cloud.rpc('trade_adult_confirm', {}).then(() => { this.setState({ tradeAdult: true, vtAdultAsk: null }); if (ref) this.vtPriceOpen(ref); },
      e => { this.setState({ vtAdultAsk: null, toast: vtErrText(e) }); this.flash(); });
  };
  vtProto.vtSavePrice = function () {
    const s = this.st(), ref = s.vtPriceRef;
    if (!ref) return;
    const n = Number(String(s.vtPriceIn || '').replace(/\s|€/g, '').replace(',', '.'));
    if (!(n >= 1 && n <= 100000)) { this.setState({ toast: 'Prix de vente : de 1 € à 100 000 €.' }); this.flash(); return; }
    const p = Math.round(n * 100) / 100, vit = Object.assign({}, s.vit || {});
    if (!vit[ref] && Object.keys(vit).length >= VT_MAX) { this.setState({ toast: 'Ta vitrine peut montrer 30 cartes au plus.' }); this.flash(); return; }
    vit[ref] = Object.assign({}, vit[ref] || {}, { s: true, p: p });
    this.setState({ vtPriceRef: null });
    this.vtSet(vit);
    this.vtFx(ref, 'sale', vtPriceTxt(Math.round(p * 100)));
  };
  vtProto.vtUndeal = function (ref) {
    const vit = Object.assign({}, this.st().vit || {});
    if (!vit[ref]) return;
    vit[ref] = Object.assign({}, vit[ref], { off: true });
    const st = this.st().vtSt;
    if (st && st.mine && st.mine[ref]) this.setState({ vtSt: Object.assign({}, st, { mine: Object.assign({}, st.mine, { [ref]: Object.assign({}, st.mine[ref], { deal: false }) }) }) });
    this.vtSet(vit);
  };
  vtProto.vtWant = function (id) {
    const w = (this.st().wants || []).slice(), i = w.indexOf(id);
    if (i >= 0) w.splice(i, 1);
    else if (w.length >= WANT_MAX) { this.setState({ toast: 'Ta liste « Je cherche » peut contenir 50 cartes au plus.' }); this.flash(); return; }
    else w.unshift(id);
    this.setState({ wants: w, vtEver: true, toast: i >= 0 ? 'Retirée de « Je cherche »' : 'Ajoutée à « Je cherche » : tu verras qui l’a pour trade ou à vendre' });
    this.flash();
    this.vtSync();
  };

  // ——— Fiche d'une carte ———
  const VT_SW = on => 'pkm-nt-sw' + (on ? ' pkm-nt-on' : '');
  vtProto.vVitFiche = function (s) {
    const off = { show: false, groups: [], wantShow: false };
    const p = this.catalog().find(q => q.id === s.fiId);
    if (!p || p.type === 'sealed' || !vtOnline()) return off;
    const groups = vtGroups(s, p.id), st = s.vtSt || {}, vit = s.vit || {}, ageOk = st.ageOk !== false, stat = this.vtCardStat(p.id);
    if (!groups.length) {
      const on = (s.wants || []).indexOf(p.id) >= 0, n = stat && stat.offered ? stat.offered : 0;
      return { show: false, groups: [], wantShow: true, wantOn: on ? 'true' : 'false', wantCls: 'pkm-vt-want' + (on ? ' pkm-vt-want-on' : ''),
        wantLabel: on ? '♥ Dans « Je cherche »' : '♡ Je la cherche', wantToggle: () => this.vtWant(p.id),
        wantSub: n ? n + ' joueur' + (n > 1 ? 's l’ont' : ' l’a') + ' pour trade ou à vendre' : 'Ajoute-la à ta liste : tu verras qui l’a pour trade ou à vendre.' };
    }
    const many = groups.length > 1;
    const list = groups.map(g => {
      const ref = vtRef(p.id, g), v = vit[ref], c = this.vtCard(p.id, g.lang, g.cond, g.gr), mine = (st.mine || {})[ref];
      const deal = !!(mine && mine.deal && !(v && v.off)), priceOpen = s.vtPriceRef === ref, adultAsk = s.vtAdultAsk === ref;
      return {
        label: c.condLong + (g.qty > 1 ? ' · ×' + g.qty : ''), hasLabel: many || !!g.gr,
        show: { on: v ? 'true' : 'false', cls: VT_SW(!!v), toggle: () => this.vtToggle(ref, 'show') },
        trade: { on: v && v.t ? 'true' : 'false', cls: VT_SW(!!(v && v.t)), toggle: () => this.vtToggle(ref, 'trade') },
        sale: { on: v && v.s ? 'true' : 'false', cls: VT_SW(!!(v && v.s)) + (v && v.s ? ' pkm-vt-sw-sale' : ''), toggle: () => this.vtToggle(ref, 'sale'),
          sub: v && v.s ? 'Prix demandé : ' + vtPriceTxt(Math.round(v.p * 100)) + ' · cote ' + c.value : 'Au prix que tu choisis (18 ans et plus)' },
        canTrade: ageOk, editPrice: () => this.vtPriceOpen(ref), hasEdit: !!(v && v.s) && !priceOpen,
        priceOpen: priceOpen, priceIn: s.vtPriceIn || '', onPrice: e => this.setState({ vtPriceIn: String((e && e.target && e.target.value) || '').slice(0, 12) }),
        priceSave: () => this.vtSavePrice(), priceCancel: () => this.setState({ vtPriceRef: null }), priceHint: 'Cote Dropicards de cet exemplaire : ' + c.value,
        adultAsk: adultAsk, adultYes: () => this.vtAdultYes(), adultNo: () => this.setState({ vtAdultAsk: null }),
        deal: deal, undeal: () => this.vtUndeal(ref)
      };
    });
    const n = st.demand && st.demand[p.id] ? Number(st.demand[p.id]) : stat && stat.wanted ? stat.wanted : 0;
    const note = s.vtErr === 'old' ? vtOld() : !ageOk ? 'Les échanges sont ouverts à partir de 15 ans : tu peux montrer ta carte dans ta vitrine.' : '';
    return { show: true, groups: list, wantShow: false, demand: n ? '🔎 ' + n + ' joueur' + (n > 1 ? 's cherchent' : ' cherche') + ' cette carte' : '', hasDemand: n > 0,
      note: note, hasNote: !!note, foot: 'Dropicards ne vend rien et ne prend aucun paiement : l’échange ou la vente se fait entre joueurs.' };
  };
  const vtBaseFi = vtProto.fiView;
  vtProto.fiView = function (s) { const r = vtBaseFi.call(this, s); r.vt = r.open ? this.vVitFiche(s) : { show: false, groups: [], wantShow: false }; return r; };

  // ——— Ma ligue › onglet « Échanges » ———
  const vtBaseProg = vtProto.vProgress;
  vtProto.vProgress = function (s) {
    const r = vtBaseProg.call(this, s), tab = s.pgTab === 'trade' ? 'trade' : s.pgTab === 'earn' ? 'earn' : 'board';
    r.tabs = [['board', 'Classement et récompenses'], ['earn', 'Mes missions'], ['trade', 'Échanges']].map(([k, label]) => ({ label: label, on: tab === k,
      cls: 'pkm-pg-tab' + (tab === k ? ' pkm-pg-tab-on' : ''), pick: () => this.progTab(k) }));
    r.isTrade = tab === 'trade';
    if (r.isTrade) { r.isBoard = false; r.isEarn = false; }
    return r;
  };
  const vtBaseTab = vtProto.progTab;
  vtProto.progTab = function (t) { vtBaseTab.call(this, t); if (t === 'trade') this.vtTabLoad(true); };
  vtProto.vtTabLoad = function (force) { this.vtPush(); this.vtLoadState(force); this.vtLoadMatches(force); };
  const vtBaseSt = vtProto.st;
  vtProto.st = function () {
    const d = vtBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.pgTab) && p.start === 'progress' && p.pgtab === 'trade') d.pgTab = 'trade';
    return d;
  };
  vtProto.vTradeTab = function (s) {
    const st = s.vtSt || {}, vit = s.vit || {}, online = vtOnline(), m = s.vtMatches || {};
    const mine = Object.keys(vit).filter(ref => vit[ref] && (vit[ref].t || vit[ref].s)).map(ref => {
      const r = vtParse(ref), v = vit[ref], c = this.vtCard(r.pid, r.lang, r.cond, r.gr), dm = st.demand && st.demand[r.pid] ? Number(st.demand[r.pid]) : 0;
      const deal = !!(st.mine && st.mine[ref] && st.mine[ref].deal && !v.off);
      return Object.assign({}, c, { trade: !!v.t && !deal, sale: !!v.s && !deal, deal: deal, price: v.s ? vtPriceTxt(Math.round(v.p * 100)) : '',
        demand: dm ? dm + ' le cherche' + (dm > 1 ? 'nt' : '') : '', hasDemand: dm > 0, open: () => this.fiOpen(r.pid, { from: 'binder' }), aria: c.name + ', ' + c.condLong + '. Ouvrir la fiche' });
    });
    const wants = (s.wants || []).map(id => {
      const c = this.vtCard(id, 'FR', 'NM', ''), n = st.supply && st.supply[id] ? Number(st.supply[id]) : 0;
      return Object.assign({}, c, { have: n ? n + (n > 1 ? ' l’ont' : ' l’a') : '', hasHave: n > 0, open: () => this.fiOpen(id), aria: c.name + (n ? ', ' + n + ' joueur(s) l’ont' : '') + '. Ouvrir la fiche' });
    });
    const T = this.tiers();
    const matches = (Array.isArray(m.list) ? m.list : []).map(x => {
      const g = T[Math.max(0, Math.min(T.length - 1, Number(x.grade) || 0))], ava = typeof avMini === 'function' ? avMini(x.avatar) : null;
      const has = Number(x.has) || 0, wn = Number(x.wants) || 0;
      const text = [has ? 'a ' + has + ' carte' + (has > 1 ? 's' : '') + ' que tu cherches' : '', wn ? 'cherche ' + wn + ' de tes cartes' : ''].filter(Boolean).join(' · ');
      return { pseudo: x.pseudo || '—', text: text, n: String(has + wn), gImg: g.sym, hasAva: !!ava, noAva: !ava,
        ava: ava || { bg: '', char: '', poke: {}, pokeStyle: '', hasPoke: false, acc: {}, accStyle: '', hasAcc: false },
        open: () => this.pcOpen({ id: x.id, pseudo: x.pseudo, grade: x.grade, avatar: x.avatar || null }, 'PL', 0), aria: (x.pseudo || '—') + ' ' + text + '. Voir sa vitrine' };
    });
    const err = s.vtErr === 'old' || m.err === 'old' ? vtOld() : !online ? 'Connecte-toi à ton compte Dropicards pour échanger avec les joueurs de ta ligue.' : m.err === 'net' ? 'Pas de réseau : les échanges possibles s’afficheront dès que tu seras connecté.' : '';
    return {
      show: true, msg: err, hasMsg: !!err,
      vitCount: Object.keys(vit).length + ' / ' + VT_MAX,
      mine: mine, hasMine: mine.length > 0, noMine: !mine.length, mineEmpty: 'Ouvre une carte de ton classeur et active « Pour trade » ou « À vendre » : elle apparaît ici et dans ta vitrine.',
      wants: wants, hasWants: wants.length > 0, noWants: !wants.length, wantCount: wants.length + ' / ' + WANT_MAX, wantsEmpty: 'Dans la fiche d’une carte que tu n’as pas, touche « ♡ Je la cherche ».',
      matches: matches, hasMatches: matches.length > 0, noMatches: !matches.length && online && s.vtErr !== 'old' && m.err !== 'old',
      matchesEmpty: m.busy ? 'Recherche des échanges possibles…' : 'Pas encore d’échange possible : plus il y a de cartes Pour trade et de « Je cherche », plus il y en aura.',
      refresh: () => this.vtTabLoad(true),
      rules: 'Dropicards n’est pas une plateforme de vente : il montre qui veut échanger ou vendre quoi. Pas de texte libre, pas de paiement dans l’app ; la vente ou l’échange se fait entre joueurs, sous leur responsabilité.'
    };
  };

  // ——— Carte de dresseur : sa vitrine ———
  const vtBasePc = vtProto.pcOpen;
  vtProto.pcOpen = function (e, unit, pts) {
    vtBasePc.call(this, e, unit, pts);
    const id = e && e.id;
    this.setState({ pcVit: id ? { id: id, busy: vtOnline(), data: null, err: '' } : null, tcs: null });
    if (!id || !vtOnline()) return;
    if (!this.st().vtSt) this.vtLoadState(false);
    Cloud.rpc('player_showcase', { target: id }).then(d => { const c = this.st().pcVit; if (c && c.id === id) this.setState({ pcVit: Object.assign({}, c, { busy: false, data: d || null }) }); },
      err => { const c = this.st().pcVit; if (c && c.id === id) this.setState({ pcVit: Object.assign({}, c, { busy: false, err: err && err.code === 'not_installed' ? 'old' : err && err.code === 'network' ? 'net' : /plus dans la ligue/.test((err && err.message) || '') ? 'gone' : 'err' }) }); });
  };
  vtProto.vPcVit = function (s) {
    const c = s.pcVit, sd = s.pcCard && s.pcCard.seed;
    if (!c || !sd || c.id !== sd.id || c.err === 'gone') return { show: false, items: [], wants: [] };
    const d = c.data || {}, me = !!sd.me, myWants = s.wants || [];
    const owned = id => vtGroups(s, id).length > 0;
    const items = (Array.isArray(d.items) ? d.items : []).map(x => {
      const cd = this.vtCard(x.card_id, x.lang, x.cond, x.grade), avail = (x.trade || x.sale) && !x.deal, wanted = !me && myWants.indexOf(x.card_id) >= 0;
      return Object.assign({}, cd, { trade: !!x.trade && !x.deal, sale: !!x.sale && !x.deal, deal: !!x.deal, price: x.sale ? vtPriceTxt(x.price_cents) : '',
        wanted: wanted && avail, cls: 'pkm-vt-cd' + (wanted && avail ? ' pkm-vt-cd-want' : '') + (x.deal ? ' pkm-vt-cd-deal' : ''),
        open: () => (me ? this.fiOpen(x.card_id, { from: 'binder' }) : this.setState({ tcs: { owner: { id: sd.id, pseudo: sd.pseudo }, it: x, pick: null } })),
        aria: cd.name + ', ' + cd.condLong + (x.trade ? ', pour trade' : '') + (x.sale ? ', à vendre ' + vtPriceTxt(x.price_cents) : '') + (x.deal ? ', échange en cours' : '') });
    });
    const wants = (Array.isArray(d.wants) ? d.wants : []).slice(0, 12).map(id => Object.assign({}, this.vtCard(id, 'FR', 'NM', ''), { have: !me && owned(id), cls: 'pkm-vt-mini' + (!me && owned(id) ? ' pkm-vt-mini-have' : '') }));
    const hf = Number(d.has_for_me) || 0, wm = Number(d.wants_mine) || 0;
    const match = !me && (hf || wm) ? [hf ? 'Il a ' + hf + ' carte' + (hf > 1 ? 's' : '') + ' que tu cherches' : '', wm ? 'il cherche ' + wm + ' de tes cartes' : ''].filter(Boolean).join(' et ') : '';
    const note = c.busy ? 'Chargement de la vitrine…' : c.err === 'old' ? vtOld() : c.err === 'net' ? 'Pas de réseau : la vitrine s’affichera une fois connecté.' : c.err ? 'La vitrine n’est pas disponible pour le moment.' : '';
    return { show: true, isMe: me, title: me ? 'Ma vitrine' : 'Sa vitrine', count: items.length ? items.length + ' carte' + (items.length > 1 ? 's' : '') : '',
      items: items, hasItems: items.length > 0, empty: !c.busy && !c.err && !items.length, emptyText: me ? 'Ta vitrine est vide : ouvre une carte de ton classeur et active « Dans ma vitrine ».' : 'Pas encore de carte dans sa vitrine.',
      wants: wants, hasWants: wants.length > 0, wantsTitle: me ? 'Je cherche' : 'Il cherche', wantsCount: (Array.isArray(d.wants) ? d.wants.length : 0) + ' carte' + ((Array.isArray(d.wants) ? d.wants.length : 0) > 1 ? 's' : ''),
      match: match, hasMatch: !!match, note: note, hasNote: !!note };
  };
  const vtBaseCard = vtProto.vPlayerCard;
  vtProto.vPlayerCard = function (s) { const r = vtBaseCard.call(this, s); r.vit = r.open ? this.vPcVit(s) : { show: false, items: [], wants: [] }; return r; };

  // ——— Fiche d'une carte d'un autre joueur : « Je suis intéressé », « Je te propose une de mes cartes » ———
  vtProto.vtMyTrade = function (s) {
    const st = s.vtSt || {}, vit = s.vit || {};
    return Object.keys(vit).filter(ref => vit[ref] && vit[ref].t && st.mine && st.mine[ref] && !st.mine[ref].deal).map(ref => {
      const r = vtParse(ref); return Object.assign({ ref: ref, sid: st.mine[ref].sid }, this.vtCard(r.pid, r.lang, r.cond, r.gr));
    });
  };
  vtProto.vtSend = function (kind) {
    const t = this.st().tcs;
    if (!t || t.busy) return;
    if (!vtOnline()) { this.setState({ toast: 'Connecte-toi à ton compte Dropicards.' }); this.flash(); return; }
    const offer = kind === 'offer' ? this.vtMyTrade(this.st()).find(x => x.sid === t.pick) : null;
    if (kind === 'offer' && !offer) { this.setState({ toast: 'Choisis une de tes cartes Pour trade.' }); this.flash(); return; }
    this.setState({ tcs: Object.assign({}, t, { busy: true }) });
    Cloud.rpc('trade_send', { target: t.owner.id, kind: kind, card_sid: t.it.sid, offer_sid: offer ? offer.sid : null }).then(r => {
      const q = this.st().qmState;
      this.setState(Object.assign({ tcs: null, toast: (kind === 'offer' ? 'Proposition envoyée à ' : 'Message envoyé à ') + t.owner.pseudo + ' : réponse dans « Mes messages »' },
        q && r && r.left != null ? { qmState: Object.assign({}, q, { left: Number(r.left), at: Date.now() }) } : {}));
      this.flash();
    }, e => { const c = this.st().tcs; if (c) this.setState({ tcs: Object.assign({}, c, { busy: false }) }); this.setState({ toast: vtErrText(e) }); this.flash(); });
  };
  vtProto.vTradeSheet = function (s) {
    const t = s.tcs;
    if (!t || !t.it || !s.pcCard) return { open: false, offers: [] };
    const x = t.it, c = this.vtCard(x.card_id, x.lang, x.cond, x.grade), st = s.vtSt || {}, ageOk = st.ageOk !== false;
    const avail = (x.trade || x.sale) && !x.deal, mineT = x.trade && avail ? this.vtMyTrade(s) : [];
    const pick = mineT.find(o => o.sid === t.pick);
    const price = x.sale ? vtPriceTxt(x.price_cents) : '';
    return {
      open: true, close: () => this.setState({ tcs: null }), aria: c.name + ' de ' + t.owner.pseudo,
      title: 'Carte de ' + t.owner.pseudo, card: c, trade: !!x.trade && avail, sale: !!x.sale && avail, deal: !!x.deal, price: price,
      priceNote: x.sale ? 'Prix demandé par ' + t.owner.pseudo + ' : ' + price + ' · cote Dropicards ' + c.value : 'Cote Dropicards ' + c.value,
      canAct: avail && ageOk && !t.busy, busy: !!t.busy,
      interest: () => this.vtSend('interest'), interestLabel: x.sale && !x.trade ? '👋 Je suis intéressé (' + price + ')' : '👋 Je suis intéressé',
      canOffer: avail && ageOk && !!x.trade, hasOffers: mineT.length > 0,
      offers: mineT.map(o => Object.assign({}, o, { on: o.sid === t.pick ? 'true' : 'false', cls: 'pkm-vt-pick' + (o.sid === t.pick ? ' pkm-vt-pick-on' : ''), pick: () => this.setState({ tcs: Object.assign({}, this.st().tcs, { pick: o.sid }) }),
        aria: 'Proposer ' + o.name + ' (' + o.condLong + ')' })),
      lacksOffers: avail && ageOk && !!x.trade && !mineT.length, offer: () => this.vtSend('offer'), offerLabel: pick ? '⇄ Proposer ma carte ' + pick.name : 'Choisis une de tes cartes ci-dessus', offerOff: !pick || !!t.busy,
      noOffers: 'Mets d’abord une de tes cartes « Pour trade » (fiche d’une carte de ton classeur) pour la proposer en échange.',
      note: x.deal ? 'Échange ou vente en cours avec un autre joueur.' : !ageOk ? 'Les échanges sont ouverts à partir de 15 ans.' : !avail ? 'Cette carte est seulement montrée dans sa vitrine.' : 'Seulement des messages tout faits, avec les cartes. Dropicards ne prend aucun paiement : la vente ou l’échange se fait entre joueurs.'
    };
  };

  // ——— « Mes messages » : propositions avec les cartes ———
  const VT_CODES = { interest: '👋 Je suis intéressé par ta carte', offer: '⇄ Je te propose un échange', deal_yes: '👍 Ça m’intéresse', deal_no: '🙅 Non merci', gone: 'Plus disponible' };
  vtProto.qmTradeAnswer = function (it, code) {
    const box = this.st().qmBox;
    if (!box || this.st().qmReplyBusy) return;
    this.setState({ qmReplyBusy: it.id + ':' + code });
    Cloud.rpc('trade_answer', { msg_id: it.id, code: code }).then(r => {
      const b = this.st().qmBox || box, deal = !!(r && r.deal);
      this.setState({ qmReplyBusy: '', qmBox: Object.assign({}, b, { items: (b.items || []).map(m => (m.id === it.id ? Object.assign({}, m, { replied: code, deal: deal }) : m)) }),
        toast: deal ? '🤝 D’accord avec ' + (it.pseudo || 'ce joueur') + ' : vos cartes sont marquées « d’accord »' : 'Réponse envoyée à ' + (it.pseudo || 'ce joueur') });
      this.flash();
      if (deal) this.vtLoadState(true);
    }, e => { this.setState({ qmReplyBusy: '', toast: vtErrText(e) }); this.flash(); });
  };
  const vtBaseBox = vtProto.vQmBox;
  vtProto.vQmBox = function (s) {
    const r = vtBaseBox.call(this, s), raw = s.qmBox && Array.isArray(s.qmBox.items) ? s.qmBox.items : [], rb = s.qmReplyBusy || '';
    (r.items || []).forEach((v, i) => {
      const it = raw[i];
      v.isTrade = false; v.tcards = []; v.hasDeal = false; v.swapCls = 'pkm-qm-swap'; v.dealText = ''; v.dealNote = '';
      if (!it || !/^(interest|offer|answer)$/.test(it.kind || '')) return;
      const snap = x => (x ? Object.assign(this.vtCard(x.card_id, x.lang, x.cond, x.grade), { tag: x.sale && !x.trade ? 'À vendre · ' + vtPriceTxt(x.price_cents) : x.trade ? 'Pour trade' : '' }) : null);
      const card = snap(it.card), offer = snap(it.offer), ans = it.kind === 'answer';
      // Proposition reçue : « card » = ma carte, « offer » = la sienne. Réponse reçue : « card » = la sienne, « offer » = la mienne.
      const theirs = ans ? card : offer, mine = ans ? offer : card;
      v.isTrade = true;
      v.text = ans ? 'Réponse à ta proposition : ' + (VT_CODES[it.code] || '') : it.kind === 'interest' ? VT_CODES.interest + (it.card && it.card.sale && !it.card.trade ? ' (à vendre ' + vtPriceTxt(it.card.price_cents) + ')' : '') : VT_CODES.offer;
      v.tcards = [theirs ? Object.assign({ who: ans ? 'Sa carte' : 'Sa carte proposée' }, theirs) : null, mine ? Object.assign({ who: ans ? 'Ta carte' : 'Ta carte' }, mine) : null].filter(Boolean)
        .map(cd => Object.assign(cd, { sub2: [cd.cond, cd.value, cd.tag].filter(Boolean).join(' · ') }));
      v.swapCls = 'pkm-qm-swap' + (v.tcards.length > 1 ? ' pkm-qm-swap2' : '');
      // Une réponse reçue se répond par un message rapide (base de qmsg.js) ; une proposition, par ses 3 boutons.
      if (!ans) {
        const done = !!it.replied;
        v.replies = done ? [] : ['deal_yes', 'deal_no', 'gone'].map(code => ({ label: VT_CODES[code], aria: VT_CODES[code] + ' : répondre à ' + (it.pseudo || 'ce joueur'),
          cls: 'pkm-qm-chip pkm-qm-chip-s' + (code === 'deal_yes' ? ' pkm-qm-chip-yes' : '') + (rb === it.id + ':' + code ? ' pkm-qm-busy' : ''), pick: () => this.qmTradeAnswer(it, code) }));
        v.hasReplies = !done;
        v.replied = done ? 'Tu as répondu « ' + (VT_CODES[it.replied] || it.replied) + ' »' : ''; v.hasReplied = done;
      }
      const sale = !!(it.card && it.card.sale && !it.offer);
      v.hasDeal = !!it.deal;
      v.dealText = (sale ? 'Vente d’accord avec ' : 'Échange d’accord avec ') + (it.pseudo || 'ce joueur');
      v.dealNote = 'Vos cartes sont marquées « d’accord » dans vos vitrines. Pour vous organiser (envoi, rendez-vous), il faudra l’étage 2 : bientôt.';
    });
    return r;
  };

  // ——— Rendu ———
  const vtBaseRender = vtProto.renderVals;
  vtProto.renderVals = function () {
    const s = this.st(), r = vtBaseRender.call(this);
    r.tdx = r.pg && r.pg.isTrade ? this.vTradeTab(s) : { show: false, mine: [], wants: [], matches: [] };
    if (r.pg && r.pg.isTrade && r.ui) { r.ui.subtitle = r.pg.seasonLabel + ' · Échanges'; if (!this.__vtTabOnce) { this.__vtTabOnce = true; setTimeout(() => this.vtTabLoad(false), 0); } }
    else this.__vtTabOnce = false;
    r.tcs = this.vTradeSheet(s);
    // Vitrine envoyée au démarrage, puis à chaque changement du classeur (une carte vendue ou retirée en sort).
    if (vtOnline() && (s.vtEver || Object.keys(s.vit || {}).length || (s.wants || []).length)) {
      if (!this.__vtBoot) { this.__vtBoot = true; setTimeout(() => this.vtPush().then(st => { if (!st) this.vtLoadState(false); }), 900); }
      else if (this.__vtP !== s.purchases || this.__vtS !== s.sales) this.vtSync();
      this.__vtP = s.purchases; this.__vtS = s.sales;
    }
    return r;
  };
