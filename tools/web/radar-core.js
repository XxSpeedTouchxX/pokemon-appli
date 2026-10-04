  // ——— Radar : calculs purs (testés par tools/web/test_radar.mjs) ———
  // Indice de chance d'une boutique réelle : une estimation expliquée, jamais un stock. Points ajoutés selon
  // le type de boutique, ce que dit sa fiche OpenStreetMap, le produit recherché et le calendrier des sorties,
  // puis arrondi à 5 % près entre 5 et 90 %.
  const RadarCore = (function () {
    const KINDS = {
      cartes: { label: 'Boutique de cartes', base: 55, spec: true, why: 'le JCC est au cœur de ce type de boutique' },
      jeux: { label: 'Boutique de jeux', base: 45, spec: true, why: 'rayon jeux de cartes habituel dans ce type de boutique' },
      culture: { label: 'Grande surface culturelle', base: 40, spec: false, why: 'rayon JCC fréquent dans ces enseignes' },
      hyper: { label: 'Hypermarché', base: 35, spec: false, why: 'rayon jouets ou cartes, réassorts réguliers mais vite vidés' },
      jouets: { label: 'Magasin de jouets', base: 20, spec: false, why: 'cartes parfois au rayon jeux', chain: 35, chainWhy: 'rayon cartes fréquent dans ces enseignes' },
      jv: { label: 'Jeux vidéo', base: 30, spec: false, why: 'cartes souvent proposées à côté des jeux' },
      bd: { label: 'BD et mangas', base: 15, spec: false, why: 'cartes à collectionner plus rares' },
      collec: { label: 'Objets de collection', base: 15, spec: false, why: 'stock variable, souvent de seconde main' }
    };
    // Produit recherché : points selon le type de boutique (clé « other » pour les autres).
    const PRODUCTS = {
      ETB: { label: 'ETB', why: 'un classique des boutiques spécialisées', pts: { spec: 5, culture: 0, other: -5 } },
      DSP: { label: 'Display', why: 'surtout vendu en boutique spécialisée', pts: { spec: 0, culture: -15, other: -25 } },
      UPC: { label: 'UPC', why: 'produit premium, rare hors boutique spécialisée', pts: { spec: -5, culture: -15, other: -25 } },
      value: { label: 'Objets de valeur', why: 'cartes de valeur surtout en boutique de cartes', pts: { cartes: 10, collec: 5, jeux: -10, other: -30 } }
    };
    const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const day = d => Number(d.slice(8, 10)) + (d.slice(8, 10) === '01' ? 'er' : '') + ' ' + MONTHS[Number(d.slice(5, 7)) - 1];
    const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
    const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n);

    // ctx : { prod: 'all'|'ETB'|'DSP'|'UPC'|'value', today: 'AAAA-MM-JJ', last: {name, date}|null, next: {name, date}|null }
    function chance(store, ctx) {
      const k = KINDS[store.kind] || KINDS.collec, reasons = [];
      const add = (pts, text) => { if (pts) reasons.push({ pts: pts, text: text, sign: signed(pts) }); };
      if (k.chain && store.brand) add(k.chain, 'Enseigne de jouets : ' + k.chainWhy);
      else add(k.base, k.label + ' : ' + k.why);
      if (store.tcg) add(15, 'Sa fiche OpenStreetMap mentionne les cartes à collectionner');
      const pr = PRODUCTS[ctx.prod];
      if (pr) {
        const t = pr.pts, v = t[store.kind] !== undefined ? t[store.kind] : (k.spec && t.spec !== undefined ? t.spec : t.other);
        add(v, pr.label + ' : ' + pr.why);
      }
      if (ctx.last && ctx.today) {
        const n = days(ctx.last.date, ctx.today);
        if (n >= 0 && n < 14) add(10, 'Sortie récente : ' + ctx.last.name + ' le ' + day(ctx.last.date) + ', réassorts fréquents');
        else if (n >= 14 && n < 45) add(5, 'Dernière sortie il y a ' + n + ' jours : ' + ctx.last.name);
        else if (n >= 90) add(-5, 'Pas de nouvelle extension depuis ' + n + ' jours');
      }
      if (ctx.next && ctx.today && k.spec) {
        const n = days(ctx.today, ctx.next.date);
        if (n >= 0 && n <= 14) add(5, 'Précommandes probables : ' + ctx.next.name + ' sort le ' + day(ctx.next.date));
      }
      const raw = reasons.reduce((t, r) => t + r.pts, 0);
      const pct = Math.max(5, Math.min(90, Math.round(raw / 5) * 5));
      return { pct: pct, raw: raw, reasons: reasons, clamped: pct !== Math.round(raw / 5) * 5 };
    }

    // Dernière sortie (au plus tard aujourd'hui) et prochaine sortie, parmi des dates { name, date }.
    function releaseContext(list, today) {
      let last = null, next = null;
      list.forEach(r => {
        if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.date || '')) return;
        if (r.date <= today) { if (!last || r.date > last.date) last = r; }
        else if (!next || r.date < next.date) next = r;
      });
      return { last: last, next: next };
    }

    const rad = d => d * Math.PI / 180;
    function distanceKm(a, b) {
      const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
      return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
    }
    // Cap depuis le centre, en degrés dans le sens des aiguilles d'une montre depuis le nord.
    function bearing(c, p) {
      const dx = (p.lon - c.lon) * Math.cos(rad(c.lat)), dy = p.lat - c.lat;
      return (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
    }
    // Ordre du balayage : le faisceau part du nord et tourne une fois en turnMs ; chaque boutique apparaît
    // quand il passe sur elle.
    function sweepPlan(points, center, turnMs) {
      return points.map(p => {
        const deg = p.lat === center.lat && p.lon === center.lon ? 0 : bearing(center, p);
        return { id: p.id, deg: deg, at: Math.round(deg / 360 * turnMs) };
      }).sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    }
    // Cercle géographique (polygone GeoJSON) de rayon km.
    function circle(c, km, n) {
      const pts = [], steps = n || 72;
      for (let i = 0; i <= steps; i++) {
        const a = 2 * Math.PI * i / steps;
        pts.push([c.lon + km / (111.32 * Math.cos(rad(c.lat))) * Math.sin(a), c.lat + km / 110.57 * Math.cos(a)]);
      }
      return { type: 'Polygon', coordinates: [pts] };
    }
    // Emprise [ouest, sud, est, nord] d'un cercle.
    function circleBounds(c, km) {
      const dLat = km / 110.57, dLon = km / (111.32 * Math.cos(rad(c.lat)));
      return [c.lon - dLon, c.lat - dLat, c.lon + dLon, c.lat + dLat];
    }
    // Résultats : indice décroissant, puis distance, puis nom.
    function rank(rows) {
      return rows.slice().sort((a, b) => b.pct - a.pct || ((a.dist === undefined || a.dist === null ? 1e9 : a.dist) - (b.dist === undefined || b.dist === null ? 1e9 : b.dist)) || String(a.name).localeCompare(String(b.name), 'fr'));
    }
    return { KINDS: KINDS, PRODUCTS: PRODUCTS, chance: chance, releaseContext: releaseContext, distanceKm: distanceKm, bearing: bearing,
      sweepPlan: sweepPlan, circle: circle, circleBounds: circleBounds, rank: rank };
  })();
