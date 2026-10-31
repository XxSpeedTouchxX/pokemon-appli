  // ——— Fiche d'une carte ou d'un produit scellé (2026-10-21, vidéos du porteur) ———
  // Panneau qui monte du bas, ouvert depuis « Mon classeur » (cartes et scellé) et le catalogue du scellé :
  // grand visuel, nom, numéro et logo de l'extension, cote Cardmarket ; ajouter, vendre ou retirer ; prix du marché
  // Cardmarket (tendance, moyennes 7 et 30 jours, veille, plus bas demandé) ; acheter sur Cardmarket, ventes réussies
  // eBay (lien) ; historique du prix ; prix selon l'état ; prix gradés estimés (2026-10-31).
  // Retirés le 2026-10-31 (porteur) : investi et plus-value, « Mes exemplaires », « Marquer comme vendu », « Voir la fiche
  // complète ». Pas de ventes réelles de cartes gradées, de population PSA ni de dernière vente eBay : aucune source ouverte.
  // Les calculs viennent de la fiche complète (vItem) ; ce module ne fait que les présenter.
  // Ce module partage la portée des autres : ses noms commencent par FI_ ou fi.
  const fiProto = Component.prototype;
  // Périodes de l'historique (2026-10-31, photo du porteur) : 1S, 1M, 3M, 6M, 1A, MAX (MAX par défaut).
  const FI_PER = [['1S', 7, '1 semaine'], ['1M', 30, '1 mois'], ['3M', 91, '3 mois'], ['6M', 182, '6 mois'], ['1A', 365, '1 an'], ['MAX', 0, 'max']];
  const FI_W = 300, FI_H = 120;

  // Ouvrir la fiche : l'article rejoint le catalogue de l'app s'il n'y est pas (comme openTcg).
  fiProto.fiOpen = function (id) {
    const ex = this.st().extra || [], p = this.catalog().find(q => q.id === id);
    this.setState(Object.assign({ fiId: id, fiPer: 'MAX', fiCond: false, fiZoom: false, fiEtat: null }, p ? {} : { extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) }));
  };
  fiProto.fiClose = function () { this.setState({ fiId: null, fiZoom: false, fiEtat: null }); };

  // État de ma carte (2026-10-31, porteur : « si par erreur l'utilisateur avait mis Near Mint alors que c'est une Mint,
  // il peut modifier l'état de sa carte à tout moment ») : les exemplaires de cette langue et de cet état passent au
  // nouvel état ; la valeur (cote × coefficient de l'état) et la collection suivent. « Annuler » dans le message.
  fiProto.fiSetCond = function (pid, lang, from, to) {
    const s = this.st(), p = this.catalog().find(q => q.id === pid);
    if (!p || from === to) { this.setState({ fiEtat: null }); return; }
    const purchases = (s.purchases || []).map(a => {
      let hit = false;
      const lines = (a.lines || []).map(l => {
        if (l.pid !== pid || (l.lang || 'FR') !== lang || (l.cond || copyDef(p)) !== from) return l;
        hit = true;
        return Object.assign({}, l, { cond: to });
      });
      return hit ? Object.assign({}, a, { lines: lines }) : a;
    });
    const msg = 'État modifié : ' + copyLabel(p, to) + ' · collection à ' + this.eur(this.snap(s, { purchases: purchases }).total);
    this.setState({ purchases: purchases, fiEtat: null, toast: msg, edUndo: { msg: msg, purchases: s.purchases } });
    if (this._tt) clearTimeout(this._tt);
    this._tt = setTimeout(() => { this._tt = null; this.setState({ toast: null, edUndo: null }); }, ED_UNDO_MS);
  };
  // Exemplaires restants d'une carte, par langue et état (ventes déduites), du plus nombreux au moins nombreux.
  const fiGroups = (s, p) => {
    const g = new Map();
    (valLeft(s)[p.id] || []).filter(c => c.left > 0).forEach(c => {
      const k = (c.lang || 'FR') + '|' + (c.cond || copyDef(p));
      g.set(k, (g.get(k) || 0) + c.left);
    });
    return [...g.entries()].map(([k, qty]) => { const [lang, cond] = k.split('|'); return { key: k, lang: lang, cond: cond, qty: qty }; })
      .sort((a, b) => b.qty - a.qty);
  };

  // Contexte de la dernière fiche calculée : la fiche du panneau reprend les mêmes calculs pour son article.
  let fiX = null;
  const fiBaseItem = fiProto.vItem;
  fiProto.vItem = function (x) {
    fiX = x;
    const r = fiBaseItem.call(this, x), m = r && /^×(\d+) dans ta collection$/.exec(r.ownedBadge || '');
    // Page complète d'une carte : « Déjà possédée ×2 », comme la fiche du classeur (2026-10-31, porteur).
    if (m) { const p = x.P && x.P[x.s.itemId]; r.ownedBadge = (p && p.type === 'sealed' ? 'Déjà possédé ×' : 'Déjà possédée ×') + m[1]; }
    return r;
  };

  // ——— Historique du prix (2026-10-31, porteur : « une variation de prix de la carte depuis sa sortie », d'après sa photo) ———
  // Aucune source ouverte ne donne l'historique depuis la sortie : Dropicards archive chaque jour la cote de chaque carte
  // depuis le 3 octobre 2026 (web/data/hist, tools/tcgdex/history.py), une fiche par extension, chargée à l'ouverture.
  const FI_HIST = {};
  const fiFile = sid => 'data/hist/' + String(sid).replace(/[^A-Za-z0-9._-]/g, '_') + '.json';
  fiProto.fiHistDoc = function (sid) {
    if (FI_HIST[sid]) return FI_HIST[sid];
    FI_HIST[sid] = { state: 'load' };
    const done = doc => {
      FI_HIST[sid] = doc && Array.isArray(doc.days) && doc.c ? { state: 'ok', doc: doc } : { state: 'none' };
      if (this.st().fiId) this.setState({ fiHistTick: (this.st().fiHistTick || 0) + 1 });
    };
    try { fetch(fiFile(sid)).then(r => (r.ok ? r.json() : null)).catch(() => null).then(done); } catch (e) { done(null); }
    return FI_HIST[sid];
  };
  const fiAgo = (d, n) => new Date(Date.parse(d) - n * 86400000).toISOString().slice(0, 10);
  // Points quotidiens { d, v } de la cote (Near Mint), du plus ancien au plus récent, et leur source.
  fiProto.fiPoints = function (p, x, k) {
    const demo = x.hist[p.id], days = SEALED.doc && SEALED.doc.days;
    if (Array.isArray(demo) && demo.length > 1 && k) {
      const n = demo.length;
      return { pts: demo.map((v, i) => ({ d: this.histDate(i, n), v: v })), src: 'Cote archivée chaque jour (démo)' };
    }
    if (p.real && Array.isArray(p.hist) && Array.isArray(days)) {
      const pts = days.map((d, i) => ({ d: d, v: p.hist[i] })).filter(q => typeof q.v === 'number' && q.v > 0);
      if (pts.length > 1) return { pts: pts, src: 'Tendance Cardmarket archivée chaque jour par Dropicards', since: pts[0].d };
    }
    if (!p.tcg) return { pts: [] };
    if (p.set) {
      const h = this.fiHistDoc(p.set);
      if (h.state === 'load') return { loading: true, pts: [] };
      const arr = h.state === 'ok' && h.doc.c[p.id];
      if (Array.isArray(arr)) {
        const pts = h.doc.days.map((d, i) => ({ d: d, v: typeof arr[i] === 'number' ? arr[i] / 100 : null })).filter(q => q.v > 0);
        // Cote du jour, si l'archive n'a pas encore le jour du catalogue chargé.
        const cat = TCG.doc && String(TCG.doc.generated || '').slice(0, 10);
        if (k && /^\d{4}-\d{2}-\d{2}$/.test(cat || '') && (!pts.length || pts[pts.length - 1].d < cat)) pts.push({ d: cat, v: k });
        if (pts.length > 1) return { pts: pts, src: 'Cote Cardmarket archivée chaque jour par Dropicards', since: h.doc.days[0] };
      }
    }
    // Repli : les moyennes Cardmarket (30 jours, 7 jours, veille) puis la cote du jour.
    if (!k) return { pts: [] };
    const V = HomeCore.points(p, k, null, null, null, TODAY);
    return { pts: [30, 7, 1, 0].map((a, i) => ({ d: fiAgo(TODAY, a), v: V[i] })), src: 'Moyennes Cardmarket : 30 jours, 7 jours, veille, puis cote du jour' };
  };
  const fiDay = d => { const t = new Date(Date.parse(d)); return (t.getUTCDate() === 1 ? '1er' : t.getUTCDate()) + ' ' + ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][t.getUTCMonth()]; };
  const fiMoney = v => (v >= 100 ? Math.round(v).toLocaleString('fr-FR') : (Math.round(v * 100) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })) + ' €';
  // Courbe lissée sans dépassement (monotone, Fritsch-Carlson) passant par chaque point : pentes, tracé et échantillons.
  const fiSlopes = P => {
    const n = P.length, dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = P[i + 1][0] - P[i][0] || 1e-6; m[i] = (P[i + 1][1] - P[i][1]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    return { dx: dx, t: t };
  };
  const fiSmooth = P => {
    const n = P.length;
    if (n < 3) return 'M' + P.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
    const { dx, t } = fiSlopes(P);
    let d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1);
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      d += ' C' + (P[i][0] + h).toFixed(1) + ' ' + (P[i][1] + t[i] * h).toFixed(1) + ' ' + (P[i + 1][0] - h).toFixed(1) + ' ' + (P[i + 1][1] - t[i + 1] * h).toFixed(1) + ' ' + P[i + 1][0].toFixed(1) + ' ' + P[i + 1][1].toFixed(1);
    }
    return d;
  };
  // Hauteur de la courbe lissée en FI_N abscisses régulières (0 → FI_W) : base du glissement d'une période à l'autre.
  const FI_N = 72;
  const fiSample = P => {
    const n = P.length, sl = n > 2 ? fiSlopes(P) : null, out = [];
    for (let i = 0, j = 0; i < FI_N; i++) {
      const xx = i / (FI_N - 1) * FI_W;
      while (j < n - 2 && P[j + 1][0] < xx) j++;
      const a = P[j], b = P[Math.min(j + 1, n - 1)], h = b[0] - a[0], u = h > 0 ? Math.max(0, Math.min(1, (xx - a[0]) / h)) : 0;
      if (!sl) { out.push(a[1] + (b[1] - a[1]) * u); continue; }
      const u2 = u * u, u3 = u2 * u;
      out.push((2 * u3 - 3 * u2 + 1) * a[1] + (u3 - 2 * u2 + u) * h * sl.t[j] + (-2 * u3 + 3 * u2) * b[1] + (u3 - u2) * h * sl.t[j + 1]);
    }
    return out;
  };
  // Périodes pas encore couvertes : « 1M dès le 1 nov., 3M dès le 1 janv. 2027 … » (archive), sinon simple mention.
  const fiSoon = (miss, start, since) => {
    if (!miss.length) return '';
    if (!since) return miss.map(q => q[0]).join(', ') + ' : pas encore assez d’historique pour cette carte.';
    const y0 = since.slice(0, 4);
    const when = q => { const d = fiAgo(start, -(q[1] - 1)); return q[0] + ' dès le ' + fiDay(d) + (d.slice(0, 4) !== y0 ? ' ' + d.slice(0, 4) : ''); };
    return 'Archive Dropicards depuis le ' + fiDay(since) + ' ' + y0 + ' : ' + miss.map(when).join(', ') + '.';
  };
  // Historique façon photo : valeur, variation sur la période, axe des montants, dates, ligne du prix d'achat.
  // f : coefficient de l'état des exemplaires possédés (la courbe suit alors la valeur affichée en haut de la fiche).
  fiProto.fiHistory = function (p, x, k, per, f, buy) {
    const H = this.fiPoints(p, x, k);
    if (H.loading) return { has: true, loading: true, periods: [] };
    if (H.pts.length < 2) return { has: false, periods: [] };
    // Périodes couvertes (2026-11-01, porteur : « des fois le prix ne bouge pas entre 1M et 6M ») : tant que l'historique
    // ne couvre pas toute la période (archive commencée le 3 octobre 2026), elle est grisée avec sa date d'arrivée ;
    // sinon 1M, 3M, 6M et 1A montreraient tous le même historique que MAX. Une période grisée choisie revient à MAX.
    const start = H.pts[0].d, endD = H.pts[H.pts.length - 1].d, span = Math.round((Date.parse(endD) - Date.parse(start)) / 86400000);
    const covered = q => !q[1] || q[1] - 1 <= span;
    const P = FI_PER.find(q => q[0] === per && covered(q)) || FI_PER[FI_PER.length - 1];
    per = P[0];
    const end = endD, cut = P[1] ? fiAgo(end, P[1]) : '';
    let pts = H.pts.filter(q => !cut || q.d >= cut);
    if (pts.length < 2) pts = H.pts.slice(-2);
    const V = pts.map(q => q.v * f), first = V[0], last = V[V.length - 1], d = last - first, pct = first > 0 ? d / first * 100 : 0;
    const showBuy = buy > 0, T = HomeCore.ticks(Math.min(...V, showBuy ? buy : Infinity), Math.max(...V, showBuy ? buy : -Infinity));
    const lo = T[0], hi = T[T.length - 1], y = v => FI_H - (v - lo) / (hi - lo || 1) * FI_H;
    const t0 = Date.parse(pts[0].d), t1 = Date.parse(end), X = d2 => (t1 > t0 ? (Date.parse(d2) - t0) / (t1 - t0) : 1) * FI_W;
    const XY = pts.map((q, i) => [X(q.d), y(V[i])]), line = fiSmooth(XY), col = x.col(d);
    const key = p.id + '|' + per + '|' + line + '|' + buy;
    const mid = pts[Math.floor((pts.length - 1) / 2)].d;
    const xl = [[pts[0].d, 0], [mid, X(mid) / FI_W * 100], [end, 100]].filter((q, i, all) => i !== 1 || (q[1] > 22 && q[1] < 78 && q[0] !== all[0][0]));
    const label = x.mask(this.signed(d)) + ' (' + this.chg(pct) + ') · ' + P[2];
    return {
      has: true, loading: false, ready: true, line: line, area: line + ' L' + FI_W + ' ' + FI_H + ' L0 ' + FI_H + ' Z', color: col,
      fx: { id: p.id, key: key, line: line, samp: fiSample(XY), buyY: showBuy ? y(buy) : null },
      value: x.mask(this.eur(last)), change: label, w: FI_W, h: FI_H,
      dotX: (XY[XY.length - 1][0] / FI_W * 100).toFixed(2) + '%', dotY: (XY[XY.length - 1][1] / FI_H * 100).toFixed(2) + '%',
      yl: T.map(t => ({ label: x.s.masked ? '•••' : fiMoney(t), top: (y(t) / FI_H * 100).toFixed(2) + '%' })),
      grid: T.map(t => ({ d: 'M0 ' + y(t).toFixed(1) + ' H' + FI_W })),
      xl: xl.map(([dd, left], i, all) => ({ label: fiDay(dd), left: left.toFixed(1) + '%', tx: i === 0 ? 'none' : i === all.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' })),
      hasBuy: showBuy, buyD: showBuy ? 'M0 ' + y(buy).toFixed(1) + ' H' + FI_W : '', buyTop: showBuy ? (y(buy) / FI_H * 100).toFixed(2) + '%' : '0%',
      buyLabel: showBuy ? '🛒 ' + x.mask(this.eur(buy)) : '',
      aria: 'Historique du prix, ' + P[2] + ' : de ' + x.mask(this.eur(first)) + ' à ' + x.mask(this.eur(last)),
      source: H.src + (f !== 1 ? ' · selon l’état de ta carte' : ''),
      since: fiSoon(FI_PER.filter(q => !covered(q)), start, H.since),
      periods: FI_PER.map(q => {
        const [v, , lab] = q, ok = covered(q), on = per === v;
        return Object.assign({ label: v, aria: lab + (ok ? '' : ', pas encore assez d’historique'), on: on, dis: !ok,
          cls: ok ? '' : 'pkm-fh-off', pick: () => { if (ok) this.setState({ fiPer: v }); } }, this.chip(on));
      })
    };
  };

  // ——— Prix gradés (2026-10-31, porteur : « les côtes avec les entreprises de gradation selon chaque état », d'après sa
  // vidéo ; PCA, CCC et PSA uniquement) ———
  // Aucune source ouverte des ventes de cartes gradées : chaque note est une estimation Dropicards, cote Cardmarket
  // (Near Mint) × coefficient de la note, signalée « ≈ … · estimation ». Coefficients proposés, à valider par le porteur.
  // 2026-11-01 (porteur) : logo de chaque entreprise ; notes 10 à 6, une nuance par note (10 or, 9,5 vert très foncé,
  // 9 vert foncé, 8 vert, 7 vert-jaune, 6 jaune-orangé) ; chez CCC, 10 Black Label (note parfaite) et 10 Gold Label
  // (« Pristine », une imperfection), en plus du 10. PSA n'a pas de 9,5. Notes 8,5 retirées. Logo PSA rouge et bleu
  // (Wikipédia, 2026-11-01).
  const FI_GRADERS = [
    ['PCA', 'img/grading/pca.png', [['10', 2.6], ['9.5', 1.9], ['9', 1.45], ['8', 1.12], ['7', 0.85], ['6', 0.7]]],
    ['CCC', 'img/grading/ccc.svg', [['10', 6, 'Black Label'], ['10', 4, 'Gold Label'], ['10', 2.8], ['9.5', 2.0], ['9', 1.5], ['8', 1.15], ['7', 0.9], ['6', 0.72]]],
    ['PSA', 'img/grading/psa-color.png', [['10', 3.5], ['9', 1.6], ['8', 1.2], ['7', 0.9], ['6', 0.75]]]
  ];
  const FI_GRADE_CLS = { '10': 'g10', '9.5': 'g95', '9': 'g9', '8': 'g8', '7': 'g7', '6': 'g6', 'Black Label': 'black', 'Gold Label': 'gold' };
  fiProto.fiGraded = function (p, x, k) {
    if (p.type === 'sealed' || !(k > 0)) return { has: false, companies: [] };
    return {
      has: true,
      companies: FI_GRADERS.map(([name, logo, grades]) => ({
        name: name, mark: logo, nameCls: 'pkm-fg-name pkm-fg-name-' + name.toLowerCase(), aria: 'Prix estimés ' + name,
        grades: grades.map(([g, c, lab]) => {
          const t = g.replace('.', ','), v = x.mask(this.eur(k * c));
          return { g: t, label: lab || '', hasLabel: !!lab, value: '≈ ' + v, cls: 'pkm-fg-pill pkm-fg-' + FI_GRADE_CLS[lab || g],
            aria: name + ' ' + t + (lab ? ' ' + lab : '') + ' : environ ' + v + ', estimation' };
        })
      })),
      note: '≈ valeur estimée (modèle Dropicards : cote Cardmarket Near Mint × coefficient de la note) — aucune vente réelle enregistrée pour ces notes. Sous 10 €, une gradation coûte souvent plus que la carte.'
    };
  };

  fiProto.fiView = function (s) {
    const off = { open: false };
    if (!s.fiId || !fiX) return off;
    const x = Object.assign({}, fiX, { s: Object.assign({}, fiX.s, { itemId: s.fiId }) });
    const p = x.P[s.fiId];
    if (!p) return off;
    const it = fiBaseItem.call(this, x), st = x.c.stock[p.id] || { qty: 0, unk: 0, cost: 0 }, k = this.cote(p);
    const sealed = p.type === 'sealed', owned = st.qty > 0, eur = v => x.mask(this.eur(v));
    const tset = TCG.doc && p.set && TCG.doc.sets[p.set], setL = tset ? setLogo(p.set, tset[3]) : (sealed && it.logo && !it.sealedArt ? it.logo : '');
    const day = (p.real && SEALED.doc && /^\d{4}-\d{2}-\d{2}/.test(SEALED.doc.prices || '')) ? SEALED.doc.prices.slice(0, 10) : (p.upd || '');
    // Prix du marché : Cardmarket seulement (décision du porteur, 2026-10-18).
    const rows = [
      ['cm', 'Tendance', 'calculé'], ['avg7', 'Moyenne 7 jours', 'vendu'], ['avg30', 'Moyenne 30 jours', 'vendu'],
      ['avg1', 'Moyenne de la veille', 'vendu'], ['low', 'Plus bas en vente', 'demandé']
    ].filter(r => typeof p[r[0]] === 'number' && p[r[0]] > 0).map((r, i) => ({
      label: r[1], tag: r[2], value: this.eur(p[r[0]]), border: x.line(i),
      tagBg: r[2] === 'demandé' ? 'rgba(245, 177, 76, 0.16)' : r[2] === 'vendu' ? 'rgba(61, 220, 132, 0.14)' : 'rgba(168, 182, 255, 0.14)',
      tagFg: r[2] === 'demandé' ? 'var(--pkm-orange)' : r[2] === 'vendu' ? 'var(--pkm-up)' : 'var(--pkm-link)'
    }));
    // Prix selon l'état : cote × coefficient d'estimation (value.js), exemplaire FR ou EN.
    // Bulle illustrée de chaque état à côté de son nom (2026-10-31, porteur) ; le scellé garde ses deux états en texte.
    const conds = copyConds(p).map(([c, label]) => ({ label: label, value: k ? eur(k * (VAL_COND[c] || 1)) : '—',
      hasIcon: !sealed, icon: sealed ? '' : 'img/conds/' + c.toLowerCase() + '.svg' }));
    const q = encodeURIComponent(p.name + (sealed || !p.numShort ? '' : ' ' + String(p.numShort).split('/')[0]));
    const last = (it.copies || [])[0];
    // Carte possédée : le prix affiché est celui de ses exemplaires, selon leur état (comme la pastille du classeur) ;
    // chaque état possédé a sa bulle, qui s'ouvre sur les 6 états pour le corriger (2026-10-31, porteur).
    const mine = owned && !sealed && k !== null ? x.val(p) : null, adj = mine !== null && Math.abs(mine - k) > 0.004;
    const groups = owned && !sealed ? fiGroups(s, p) : [];
    const etats = groups.map(g => {
      const coef = this.valOn() ? valCoef(g.lang, g.cond) : 1, label = copyLabel(p, g.cond), value = k !== null ? this.eur(k * coef) : '—', on = s.fiEtat === g.key;
      return { icon: 'img/conds/' + g.cond.toLowerCase() + '.svg', label: label, ab: HOME_COND_AB[g.cond] || '', value: value, open: on,
        sub: (groups.length > 1 || g.qty > 1 ? '×' + g.qty + ' · ' : '') + g.lang + ' · ' + Math.round(coef * 100) + ' % de la cote',
        cls: 'pkm-fi-etat' + (on ? ' pkm-fi-etat-on' : ''), aria: 'État de ta carte : ' + label + ', ' + value + '. Modifier l’état',
        toggle: () => this.setState({ fiEtat: on ? null : g.key }) };
    });
    // Courbe : valeur de mes exemplaires (selon leur état) ; ligne du prix d'achat moyen s'il est connu.
    const per = FI_PER.some(q => q[0] === s.fiPer) ? s.fiPer : 'MAX', known = st.qty - st.unk;
    const hist = this.fiHistory(p, x, k, per, adj ? mine / k : 1, owned && known > 0 && st.cost > 0 ? st.cost / known : 0);
    const eg = groups.find(g => g.key === s.fiEtat);
    const etatPick = eg ? {
      open: true, title: 'Quel est l’état de ' + (eg.qty > 1 ? 'tes ' + eg.qty + ' exemplaires' : 'ta carte') + ' ?',
      note: 'La valeur suit l’état : cote Cardmarket (Near Mint) × pourcentage.',
      list: copyConds(p).map(c => Object.assign(copyChip(this, p, c, c[0] === eg.cond, () => this.fiSetCond(p.id, eg.lang, eg.cond, c[0])),
        k !== null ? { pct: this.eur(k * (this.valOn() ? valCoef(eg.lang, c[0]) : 1)) } : {}))
    } : { open: false, list: [] };
    return {
      open: true, close: () => this.fiClose(), isCard: !sealed, isSealed: sealed,
      title: p.name, num: sealed ? (it.sub || '').split(' · ')[0] : (p.numShort ? p.numShort : ''),
      setLogo: setL, hasSetLogo: !!setL, setName: p.setName || '',
      img: it.img, srcset: it.srcset || '', fallback: it.fallback || '', photo: it.photo, hasPhoto: !!it.hasPhoto, sealedArt: !!it.sealedArt,
      logo: it.logo, bg: it.bg, zoom: () => this.setState({ fiZoom: true }), zoomLabel: it.zoomLabel,
      // Agrandissement du visuel (même écran que la fiche complète).
      big: { img: it.zoomImg || it.img || it.photo || '', name: p.name, sub: it.sub, label: (sealed ? 'Photo de ' : 'Carte ') + p.name + ' en grand',
        credit: (it.zoomCredit || '') + (it.zoomVersion ? ' · version ' + it.zoomVersion : ''), fallback: it.fallbackHi || '', close: () => this.setState({ fiZoom: false }) },
      rarity: sealed ? '' : (p.rarity || ''), hasRarity: !sealed && !!p.rarity,
      cote: mine !== null ? this.eur(mine) : k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur(p.low) : 'Pas encore de cote'),
      coteSrc: adj ? 'Selon l’état · ' + this.eur(k) + ' en Near Mint (Cardmarket)' : k !== null ? 'Cardmarket' : (typeof p.low === 'number' ? 'Prix demandé' : ''), flag: this.flag(p.lang || 'FR'),
      // « Déjà possédée ×2 » (2026-10-31, porteur) à la place de « ×2 dans ta collection ».
      owned: owned, ownedText: owned ? (sealed ? 'Déjà possédé ×' : 'Déjà possédée ×') + st.qty : '',
      etats: etats, hasEtats: etats.length > 0, etatPick: etatPick,
      addLabel: sealed ? 'Ajouter à mes produits scellés' : (owned ? 'Ajouter un exemplaire' : 'Ajouter à ma collection'),
      add: () => this.openSheet('buy', p.id), canAdd: !p.release,
      remove: () => { if (last && last.edit) last.edit(); }, canRemove: owned && !!(last && last.edit),
      rows: rows, hasRows: rows.length > 0, marketDate: day ? 'Mis à jour le ' + this.d2(day) : '',
      cmUrl: 'https://www.cardmarket.com/fr/Pokemon/Products/Search?searchString=' + q,
      ebayUrl: it.ebayUrl || 'https://www.ebay.fr/sch/i.html?_nkw=' + q + '&LH_Sold=1&LH_Complete=1',
      hist: hist,
      conds: conds, condOpen: !!s.fiCond, toggleCond: () => this.setState({ fiCond: !s.fiCond }),
      condNote: 'Estimation Dropicards : cote × coefficient de l’état (les cotes Cardmarket sont celles d’un exemplaire ' + (sealed ? 'scellé d’origine' : 'Near Mint') + ').',
      graded: this.fiGraded(p, x, k)
    };
  };

  // Changement de période de l'historique (2026-11-01, porteur : « la transition entre graph doit être plus
  // satisfaisante, là c'est trop direct ») : la courbe et son aire glissent de l'ancienne forme à la nouvelle (650 ms,
  // FI_N points), la ligne du prix d'achat et le point du jour suivent, l'axe, les dates et la variation réapparaissent
  // en fondu ; le tracé exact est posé à la fin. Rien ne bouge si l'utilisateur limite les animations.
  const fiAnim = { id: '', key: '', samp: null, buyY: null, cur: null, raf: 0 };
  const fiStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const fiEase = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const fiMorph = fx => {
    const same = fiAnim.id === fx.id, from = fiAnim.cur || fiAnim.samp, fromBuy = fiAnim.buyY;
    Object.assign(fiAnim, { id: fx.id, key: fx.key, samp: fx.samp, buyY: fx.buyY });
    cancelAnimationFrame(fiAnim.raf);
    const box = document.querySelector('.pkm-fh'), line = box && box.querySelector('.pkm-fh-line'), area = box && box.querySelector('.pkm-fh-area');
    if (!same || !from || !line || !area || fiStill()) { fiAnim.cur = null; return; }
    const buy = box.querySelector('.pkm-fh-buy'), close = ' L' + FI_W + ' ' + FI_H + ' L0 ' + FI_H + ' Z', t0 = performance.now();
    const b0 = fromBuy === null ? fx.buyY : fromBuy;
    const step = now => {
      const k = Math.min(1, (now - t0) / 650), e = fiEase(k);
      if (k >= 1) {
        fiAnim.cur = null; line.setAttribute('d', fx.line); area.setAttribute('d', fx.line + close);
        if (buy && fx.buyY !== null) buy.setAttribute('d', 'M0 ' + fx.buyY.toFixed(1) + ' H' + FI_W);
        return;
      }
      const P = from.map((v, i) => v + (fx.samp[i] - v) * e);
      const d = 'M' + P.map((v, i) => (i / (FI_N - 1) * FI_W).toFixed(1) + ' ' + v.toFixed(1)).join(' L');
      fiAnim.cur = P; line.setAttribute('d', d); area.setAttribute('d', d + close);
      if (buy && fx.buyY !== null) buy.setAttribute('d', 'M0 ' + (b0 + (fx.buyY - b0) * e).toFixed(1) + ' H' + FI_W);
      fiAnim.raf = requestAnimationFrame(step);
    };
    step(t0);
    box.querySelectorAll('.pkm-fh-y, .pkm-fh-grid, .pkm-fh-x').forEach(el => { if (el.animate) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 480, easing: 'ease-out' }); });
    box.querySelectorAll('.pkm-fh-top').forEach(el => { if (el.animate) el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }); });
  };

  const fiBaseRender = fiProto.renderVals;
  fiProto.renderVals = function () {
    const r = fiBaseRender.call(this);
    const s = this.st();
    r.fi = this.fiView(s);
    // La courbe affichée change (autre période, autre état, archive arrivée) → glissement, après la mise à jour de la page.
    const fx = r.fi.open && r.fi.hist && r.fi.hist.fx;
    if (fx && fx.key !== fiAnim.key) queueMicrotask(() => fiMorph(fx));
    else if (!r.fi.open) { fiAnim.id = ''; fiAnim.key = ''; }
    if (r.fi.open && s.fiZoom && r.fi.big.img) { r.ui.zoomOpen = true; r.zoom = r.fi.big; }
    return r;
  };

  // Ajout d'un article (2026-10-21 pour le scellé, 2026-10-22 pour les cartes, demandes du porteur) : seul l'article
  // choisi, centré et agrandi, sans onglet « Vente » ni prix payé ; restent la langue, la quantité, l'état (cartes
  // seulement : Mint à Poor) et la valeur Cardmarket ajoutée, qui suit l'état et la langue.
  const fiBaseSheet = fiProto.vSheet;
  fiProto.vSheet = function (x) {
    const sh = fiBaseSheet.call(this, x), f = x.s.f || {}, p = x.P[f.pid];
    const simple = !!(sh.isBuy && p);
    Object.assign(sh, { showKind: !simple, hideKind: simple, showPrice: !simple, showCond: !(simple && p.type === 'sealed') });
    sh.artCls = simple ? 'pkm-art-one' : '';
    sh.hasCondNote = false;
    if (simple) {
      sh.products = (sh.products || []).filter(po => po.sel);
      sh.hasPriceHint = false;
      sh.lines = (sh.lines || []).filter(l => !/Plus-value/.test(l.label));
      // Valeur selon l'état et la langue choisis (2026-10-22, demande du porteur) : cote Cardmarket (Near Mint) × coefficient,
      // comme dans la valeur de la collection ; cote brute si Réglages › « Selon l'état et la langue » est désactivé.
      const sealed = p.type === 'sealed', lang = f.lang || 'FR', cond = copyCode(p, f.cond), raw = this.rawVal(p, x.s.valuation);
      const coef = this.valOn() ? valCoef(lang, cond) : 1, unit = raw ? raw * coef : 0, add = unit * (f.qty || 1);
      const pct = Math.round(coef * 100) + ' %', tag = coef !== 1 ? ' (' + (sealed ? lang : copyLabel(p, cond) + (lang === 'JP' ? ', JP' : '')) + ', ' + pct + ')' : '';
      if (raw) {
        sh.big = this.signed(add);
        sh.products.forEach(po => { po.right = (String(po.right).match(/^×\d+ · /) || [''])[0] + this.eur(unit); });
      }
      sh.lines.forEach(l => {
        if (/^Cote Dropicards unitaire/.test(l.label)) { l.label = 'Valeur Cardmarket à l’unité' + tag; if (raw) l.value = this.eur(unit); }
        else if (l.label === 'Collection' && raw) l.value = this.eur(x.total) + ' → ' + this.eur(x.total + add);
      });
      if (!sealed) {
        sh.hasCondNote = true;
        sh.condNote = copyLabel(p, cond) + ' · ' + Math.round(VAL_COND[cond] * 100) + ' % de la cote Near Mint. ' + COPY.notes[cond];
      }
    }
    return sh;
  };
