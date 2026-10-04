  // ——— Produits scellés : vraies photos ———
  // Les produits scellés s'affichent avec leur photo officielle quand on l'a (dossier web/img/products/),
  // sur une carte blanche arrondie ; sinon avec le logo de l'extension, comme dans la maquette.
  // Photos des produits de la démo (en attendant le catalogue scellé, lot B2).
  const DEMO_PHOTOS = { p2: 'img/products/etb-30e-anniversaire.webp' };

  const baseSealedCatalog = proto.catalog;
  proto.catalog = function () {
    const list = baseSealedCatalog.call(this);
    list.forEach(p => { if (p.type === 'sealed' && !p.photo && DEMO_PHOTOS[p.id]) p.photo = DEMO_PHOTOS[p.id]; });
    return list;
  };
  const baseSealedLook = proto.look;
  proto.look = function (p) {
    const l = baseSealedLook.call(this, p), photo = p.type === 'sealed' && p.photo ? p.photo : '';
    return Object.assign(l, { photo: photo, hasPhoto: !!photo, sealedArt: l.isSealed && !photo });
  };
  // Fiche d'un produit avec photo : la photo s'agrandit comme une carte.
  const baseSealedItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseSealedItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    if (it.hasPhoto) {
      it.zoomImg = it.photo;
      it.fallbackHi = '';
      it.zoomLabel = 'Agrandir la photo : ' + p.name;
      it.zoomCredit = 'Visuel officiel du produit';
      it.zoomVersion = '';
    }
    return it;
  };
  const baseSealedRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseSealedRender.call(this), s = this.st();
    if (r.it.hasPhoto && s.zoom && s.zoom === s.itemId && r.ui.isItem) r.ui.zoomOpen = true;
    return r;
  };
