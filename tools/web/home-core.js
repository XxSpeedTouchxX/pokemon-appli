  // ——— Accueil : calculs purs (testés par tools/web/test_home.mjs) ———
  // Tendance de la collection sur 4 points (il y a 30 jours, 7 jours, hier, aujourd'hui).
  const HomeCore = (function () {
    // Valeurs inconnues (null) : reprennent la suivante vers aujourd'hui, pour une courbe plate plutôt qu'inventée.
    const fill = pts => {
      const out = pts.slice();
      for (let i = out.length - 2; i >= 0; i--) if (out[i] === null) out[i] = out[i + 1];
      return out;
    };
    // Valeur archivée « ago » jours avant today : dernier jour archivé à cette date ou avant, sinon null.
    const archived = (days, hist, today, ago) => {
      if (!Array.isArray(days) || !Array.isArray(hist)) return null;
      const limit = Date.parse(today) - ago * 86400000;
      for (let i = Math.min(days.length, hist.length) - 1; i >= 0; i--) {
        if (Date.parse(days[i]) <= limit && typeof hist[i] === 'number' && hist[i] > 0) return hist[i];
      }
      return null;
    };
    // Valeur unitaire d'un article aux 4 dates. u : valeur du jour ; h, k : courbe simulée (30 jours) et cote
    // d'un article de démo ; days, today : archive du scellé (sealed.json) et date du jour.
    //  - démo : sa courbe, lue aux mêmes dates ;
    //  - carte du catalogue (p.tcg) : u × moyenne Cardmarket (30 j, 7 j, 1 j) ÷ tendance Cardmarket (p.cm) ;
    //  - produit scellé réel (p.real) : u × tendance archivée ÷ tendance du jour.
    const points = (p, u, h, k, days, today) => {
      if (h && k) return [h[0], h[22], h[28], h[29]].map(v => v * u / k);
      if (p.tcg && p.cm > 0) return fill([p.avg30, p.avg7, p.avg1].map(a => (typeof a === 'number' && a > 0 ? a / p.cm * u : null)).concat([u]));
      if (p.real && p.cm > 0) return fill([30, 7, 1].map(d => { const v = archived(days, p.hist, today, d); return v ? v / p.cm * u : null; }).concat([u]));
      return [u, u, u, u];
    };
    // Courbe : 4 points à intervalles égaux sur W × H, entre top et bottom ; ligne et aire.
    const chart = (V, W, H, top, bottom) => {
      const lo = Math.min(...V), hi = Math.max(...V);
      const pts = V.map((v, i) => [i * W / (V.length - 1), hi - lo < 0.005 ? (top + bottom) / 2 : bottom - (v - lo) / (hi - lo) * (bottom - top)]);
      const line = 'M' + pts.map(([a, b]) => a.toFixed(1) + ' ' + b.toFixed(1)).join(' L');
      return { line: line, area: line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z' };
    };
    // ——— Courbe filtrable (2026-10-25, porteur) : Aujourd'hui, 1 semaine, 1 mois, depuis le début ———
    const DAY = 86400000;
    const agoOf = (date, today) => Math.round((Date.parse(today) - Date.parse(date)) / DAY);
    // Valeur unitaire « ago » jours avant aujourd'hui. Entre deux points connus (30 j, 7 j, hier, aujourd'hui) : droite
    // qui les relie ; au-delà de 30 jours : la plus ancienne valeur connue (aucune cote plus ancienne n'est disponible).
    // Scellé réel : cote archivée ce jour-là si elle existe. Démo : sa courbe simulée de 30 jours.
    const unitAt = (p, u, h, k, days, today, ago) => {
      if (h && k) return h[Math.max(0, 29 - Math.min(29, ago))] * u / k;
      if (p.real && p.cm > 0) { const v = archived(days, p.hist, today, ago); if (v) return v / p.cm * u; }
      const P = points(p, u, h, k, days, today), A = [30, 7, 1, 0];
      if (ago >= 30) return P[0];
      for (let i = 0; i < 3; i++) {
        if (ago <= A[i] && ago >= A[i + 1]) { const t = (A[i] - ago) / (A[i] - A[i + 1]); return P[i] + (P[i + 1] - P[i]) * t; }
      }
      return u;
    };
    // Quantité possédée à la fin d'un jour donné : ajouts jusqu'à ce jour, moins les ventes.
    const qtyAt = (purchases, sales, pid, date) => {
      const lim = Date.parse(date);
      let q = 0;
      (purchases || []).forEach(a => { if (Date.parse(a.date) <= lim) (a.lines || []).forEach(l => { if (l.pid === pid) q += l.qty || 0; }); });
      (sales || []).forEach(v => { if (v.pid === pid && Date.parse(v.date) <= lim) q -= v.qty || 0; });
      return Math.max(0, q);
    };
    // Nombre de jours affichés : 1, 7, 30, ou depuis le premier ajout (1 jour au moins).
    const span = (range, purchases, today) => {
      if (range === '1d') return 1;
      if (range === '7d') return 7;
      if (range === '30d') return 30;
      const first = (purchases || []).reduce((m, a) => (a.date && (!m || a.date < m) ? a.date : m), '');
      return first ? Math.max(1, agoOf(first, today)) : 30;
    };
    // Jours échantillonnés (ago, du plus ancien à aujourd'hui) : chaque jour jusqu'à 60 jours, sinon 60 points réguliers.
    const samples = n => {
      const step = n <= 60 ? 1 : n / 60, out = [];
      for (let a = n; a > 0; a -= step) out.push(Math.round(a));
      out.push(0);
      return out.filter((a, i) => i === 0 || a !== out[i - 1]);
    };
    // Graduations de l'axe des montants : 3 valeurs rondes (bas, milieu, haut) qui encadrent la courbe.
    const ticks = (lo, hi) => {
      if (!(hi > lo)) { const c = hi || 0, d = Math.max(1, Math.abs(c) * 0.1); lo = c - d; hi = c + d; }
      const raw = (hi - lo) / 2, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
      const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
      const bot = Math.max(0, Math.floor(lo / step) * step);
      return [bot, bot + step, bot + 2 * step].concat(bot + 2 * step < hi ? [bot + 3 * step] : []);
    };
    // Courbe sur W × H : x selon la date (0 = début, 1 = aujourd'hui), y selon les graduations.
    const plot = (S, n, T, W, H) => {
      const lo = T[0], hi = T[T.length - 1];
      const y = v => H - (v - lo) / (hi - lo || 1) * H;
      const pts = S.map(o => [(1 - o.ago / n) * W, y(o.v)]);
      const line = 'M' + pts.map(([a, b]) => a.toFixed(1) + ' ' + b.toFixed(1)).join(' L');
      return { line: line, area: line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z', grid: T.map(t => y(t)) };
    };
    return { fill: fill, archived: archived, points: points, chart: chart, unitAt: unitAt, qtyAt: qtyAt, span: span, samples: samples, ticks: ticks, plot: plot, agoOf: agoOf };
  })();
