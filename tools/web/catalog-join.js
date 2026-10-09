  // ——— Catalogue en deux fichiers (A5 ; 2026-10-09) ———
  // data/cards-base.json (partie fixe, gardée par le navigateur) + data/cards-prices.json (prix du jour) → même
  // objet que data/cards.json. Écrits par tools/tcgdex/split_catalog.py ; null s'ils ne vont pas ensemble (empreinte
  // ou nombre de cartes différents) : l'app charge alors cards.json. Testé par tools/web/test_catalog_join.mjs.
  const CatalogJoin = function (base, prices) {
    if (!base || !prices || !base.key || base.key !== prices.base || !Array.isArray(base.cards) || !Array.isArray(prices.prices)
      || base.cards.length !== prices.n || prices.prices.length !== prices.n) return null;
    const sf = base.fields, pf = prices.fields;
    const pick = prices.order.map(f => (sf.indexOf(f) >= 0 ? [0, sf.indexOf(f)] : [1, pf.indexOf(f)]));
    if (pick.some(x => x[1] < 0)) return null;
    const doc = {};
    Object.keys(base).forEach(k => { if (k !== 'key' && k !== 'fields' && k !== 'cards') doc[k] = base[k]; });
    ['generated', 'usdEur', 'usdEurDate', 'usdEurSource', 'stats'].forEach(k => { if (k in prices) doc[k] = prices[k]; });
    doc.fields = prices.order;
    doc.cards = base.cards.map((b, i) => { const p = prices.prices[i]; return pick.map(x => (x[0] ? p : b)[x[1]]); });
    return doc;
  };
