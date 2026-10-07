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
    return { fill: fill, archived: archived, points: points, chart: chart };
  })();
