/* PKM-App · démo web. Fichier généré par tools/web/build.mjs à partir de
   docs/12-maquette-v5/Main.dc.html : ne pas le modifier à la main. Catalogue réel (web/data/cards.json), collection de démo fictive. */
(function () {
  'use strict';
  // Socle minimal attendu par la logique de la maquette : état local et nouveau rendu à chaque changement.
  class DCLogic {
    constructor(props) { this.props = props || {}; }
    setState(patch) { this.state = Object.assign({}, this.state || {}, patch); if (this.__rerender) this.__rerender(); }
  }

class Component extends DCLogic {
  // Maquette PKM-App v5 : valorisation des cartes et du scellé, scan au centre, paliers,
  // profils automatiques (cartes ultra rares ou valeur), territoire (boutiques et arrivages probables).
  // Prix fictifs. Visuels provisoires (captures fournies), à remplacer par les images TCGdex.
  today() { return '2026-10-03'; }

  img() {
    return {
      k1: '/_blob/37bc09a44f5bc8c723e502debc6f1148', k2: '/_blob/70edfa42ea06daac8ddc62c143d25f58',
      k3: '/_blob/075b3b60f596f25f8a07e2667399010f', k4: '/_blob/276d695a9edcc378e8e3e63611390074',
      k5: '/_blob/5a374ee34ba018235a75bd0aefc814a6', k6: '/_blob/5b3ca72cd083f8bb0802ecc4d2a02da6',
      avatar: '/_blob/311646171335cf6572ef252478402696',
      megaEvo: '/_blob/6be21b5092f26634d5cd76cd3fd41558', delta: '/_blob/8d8ead677cd82b85d9c86b1f6abf8c89',
      anniv: '/_blob/a845cb211885947ddb97947817dc48f0', nuit: '/_blob/138f1067a685c5b16ed6835bad3be434',
      chaos: '/_blob/25dbd3d4d6e274c374b7b802fa6c22a4'
    };
  }

  // cm = tendance Cardmarket (calculé) · low = plus bas Cardmarket (demandé)
  // ebay = ventes réussies eBay sur 30 jours (vendu) · tcp = TCGplayer, marché US converti en € (calculé)
  catalog() {
    const I = this.img();
    // rarity : rareté de démo (la vraie viendra de TCGdex) ; ur = ultra rare ou plus, compte pour le profil.
    const card = (id, name, rarity, o) => Object.assign({ id: id, type: 'card', code: 'CRT', name: name, rarity: rarity, ur: rarity === 'Ultra rare', sub: rarity + ' · FR · Near Mint', img: I[id], logo: '', set: '', lang: 'FR', grade: null, release: null }, o);
    const box = (id, code, name, sub, set, o) => Object.assign({ id: id, type: 'sealed', code: code, name: name, rarity: '', ur: false, sub: sub + ' · FR', img: '', logo: I[set], set: set, lang: 'FR', grade: null, tcp: null, release: null }, o);
    return [
      card('k1', 'Pikachu ex', 'Ultra rare', { cm: 99, low: 92, ebay: 104, tcp: 96.5, avg30: 93, seed: 7 }),
      card('k2', 'Méga-Meganium ex', 'Ultra rare', { cm: 69, low: 64, ebay: 72, tcp: 66, avg30: 71, seed: 19 }),
      card('k3', 'Favianos ex', 'Ultra rare', { cm: 48, low: 44, ebay: 51, tcp: 45.5, avg30: 46, seed: 29 }),
      card('k4', 'Jirachi ex', 'Ultra rare', { cm: 45, low: 41.9, ebay: 47, tcp: 43, avg30: 47.5, seed: 31 }),
      card('k5', 'Pikachu et Zekrom GX', 'Rare', { cm: 49, low: 45, ebay: 52, tcp: 47, avg30: 47, seed: 43 }),
      card('k6', 'Mewtwo ex', 'Ultra rare', { code: 'GRD', sub: 'Ultra rare · gradée PCA 9,5 · FR', grade: 'PCA 9,5', cm: 440, low: 410, ebay: 455, tcp: null, avg30: 425, seed: 47 }),
      box('p1', 'DSP', 'Display Nuit Noire', 'Display 36 boosters', 'nuit', { cm: 179.99, low: 171.5, ebay: 186, avg30: 176, seed: 11 }),
      box('p2', 'ETB', 'ETB 30e Anniversaire', 'Coffret Dresseur d’élite', 'anniv', { cm: 160, low: 149, ebay: 164.5, avg30: 150, seed: 23 }),
      box('p3', 'UPC', 'UPC 30e Anniversaire', 'Ultra Premium Collection', 'anniv', { cm: 419.9, low: 399, ebay: 432, avg30: 401, seed: 37 }),
      box('p4', 'CFT', 'Coffret Collection 30e Anniversaire', 'Coffret collection', 'anniv', { cm: 48, low: 44.5, ebay: 46, avg30: 49, seed: 41 }),
      box('p5', 'DSP', 'Display Chaos Ascendant', 'Display 36 boosters', 'chaos', { cm: 179, low: 168, ebay: 175, avg30: 183, seed: 53 }),
      box('p6', 'BDL', 'Bundle Nuit Noire', 'Bundle 6 boosters', 'nuit', { cm: 34.9, low: 32.5, ebay: 33.5, avg30: 33, seed: 67 }),
      // Hors collection : visibles dans l'onglet Marché.
      box('m1', 'ETB', 'ETB Règne Delta', 'Coffret Dresseur d’élite', 'delta', { cm: null, low: 74.9, ebay: null, avg30: null, seed: 71, release: '2026-11-06' }),
      box('m2', 'DSP', 'Display Méga-Évolution', 'Display 36 boosters', 'megaEvo', { cm: 235, low: 219, ebay: 242, avg30: 248, seed: 59 }),
      box('m3', 'TIN', 'Tin 30e Anniversaire', 'Tin de collection', 'anniv', { cm: 34.99, low: 31.9, ebay: 36, avg30: 31, seed: 61 }),
      box('m4', 'BST', 'Booster 30e Anniversaire', 'Booster à l’unité', 'anniv', { cm: 12, low: 10.9, ebay: 12.5, avg30: 11.5, seed: 73 })
    ];
  }

  // Visuels : image de la carte, ou logo de la série sur un fond propre à la série (scellé).
  setArt(set) {
    const m = { nuit: ['#4B3B91', '#150F33'], anniv: ['#8D6B26', '#261B09'], chaos: ['#8E2B40', '#270A12'], megaEvo: ['#25648F', '#0A1B2B'], delta: ['#23765C', '#0A251C'] };
    const c = m[set] || ['#3A4A75', '#111A2C'];
    return 'radial-gradient(130% 90% at 50% 0%, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 58%), linear-gradient(160deg, ' + c[0] + ', ' + c[1] + ')';
  }
  glyph(code) {
    return {
      DSP: 'M3.5 10.5h17v9.5h-17z M6 10.5V5.5h3.2v5 M10.4 10.5V4h3.2v6.5 M14.8 10.5V5.5H18v5',
      ETB: 'M6 5.5h12v15H6z M6 9h12 M10 7.2h4',
      UPC: 'M3 7h18v12H3z M3 10h18 M10 14.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
      CFT: 'M4 6h16v13H4z M7.5 9h9v7h-9z',
      BDL: 'M4.5 6.5h4.5v12H4.5z M9.75 5h4.5v14h-4.5z M15 6.5h4.5v12H15z M3.5 12.5h17',
      TIN: 'M5 9h14v10.5H5z M4 6h16v3H4z M9.5 13h5',
      BST: 'M7 3.5h10v17H7z M7 6.5h10 M7 17.5h10'
    }[code] || 'M4 6h16v13H4z';
  }
  flag(lang) {
    return lang === 'JP' ? 'radial-gradient(circle, #BC002D 0 30%, #FFFFFF 33%)' : 'linear-gradient(90deg, #0055A4 0 33.3%, #FFFFFF 33.3% 66.6%, #EF4135 66.6%)';
  }
  look(p) {
    const sealed = p.type === 'sealed';
    return {
      isCard: !sealed, isSealed: sealed, plainCard: !sealed && !p.grade, ur: !!p.ur, urBadge: !!p.ur && !p.grade, img: p.img || '', logo: p.logo || '', code: p.code, glyph: this.glyph(p.code),
      bg: sealed ? this.setArt(p.set) : 'radial-gradient(120% 85% at 50% 0%, #2A3B66, #121B30 72%)',
      graded: !!p.grade, grade: p.grade || '', flag: this.flag(p.lang)
    };
  }

  // Paliers selon la valeur de la collection (Cote PKM).
  star(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + k * Math.cos(a)).toFixed(2) + ' ' + (cy + k * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  }
  tiers() {
    return [
      { name: 'Commune', min: 0, color: '#9AA8C3', glow: 'rgba(154, 168, 195, 0.24)', sym: 'M9.4 12a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z' },
      { name: 'Peu commune', min: 500, color: '#5EE0CF', glow: 'rgba(94, 224, 207, 0.24)', sym: 'M12 8.3l3.5 3.7-3.5 3.7-3.5-3.7z' },
      { name: 'Rare', min: 1500, color: '#FFD66B', glow: 'rgba(255, 214, 107, 0.24)', sym: this.star(12, 12.4, 4.2, 1.8) },
      { name: 'Ultra rare', min: 3000, color: '#E8ECFF', glow: 'rgba(232, 236, 255, 0.24)', sym: this.star(9, 12.4, 3, 1.3) + ' ' + this.star(15, 12.4, 3, 1.3) },
      { name: 'Hyper rare', min: 7500, color: '#FFB547', glow: 'rgba(255, 181, 71, 0.26)', sym: this.star(12, 9.9, 2.7, 1.15) + ' ' + this.star(8.9, 14.6, 2.7, 1.15) + ' ' + this.star(15.1, 14.6, 2.7, 1.15) }
    ];
  }
  tierOf(total) {
    const T = this.tiers();
    let i = 0;
    T.forEach((t, k) => { if (total >= t.min) i = k; });
    const cur = T[i], next = T[i + 1] || null;
    const pct = next ? Math.max(0, Math.min(100, (total - cur.min) / (next.min - cur.min) * 100)) : 100;
    return { i: i, cur: cur, next: next, pct: pct, remaining: next ? next.min - total : 0 };
  }

  // Profils : anticipé à l'inscription (2 questions), puis automatique : le plus haut des deux niveaux,
  // nombre de cartes ultra rares (3 = Régulier, 10 = Passionné) ou valeur de la collection (1 000 €, 5 000 €).
  profRules() { return { ur: [3, 10], val: [1000, 5000] }; }
  cats() {
    return {
      novice: { name: 'Novice', color: '#5EE0CF', tint: 'rgba(94, 224, 207, 0.12)', edge: 'rgba(94, 224, 207, 0.34)', icon: 'M12 20.5v-8 M12 12.5C12 9 9.4 6.5 5.5 6.5c0 3.6 2.6 6 6.5 6z M12 14.5c0-3 2.3-5.2 5.6-5.2 0 3.1-2.3 5.2-5.6 5.2z', desc: 'Tu démarres : moins de 3 cartes ultra rares et moins de 1 000 € de collection. Chaque prix est expliqué.' },
      regular: { name: 'Régulier', color: '#A8B6FF', tint: 'rgba(168, 182, 255, 0.12)', edge: 'rgba(168, 182, 255, 0.34)', icon: 'M13 3L5 13.5h6L10 21l8-10.5h-6z', desc: 'Collection installée : au moins 3 cartes ultra rares ou 1 000 € de valeur.' },
      passion: { name: 'Passionné', color: '#FFB547', tint: 'rgba(255, 181, 71, 0.12)', edge: 'rgba(255, 181, 71, 0.34)', icon: 'M4 17.5L3 8l5 4 4-6.5 4 6.5 5-4-1 9.5z M5 20.5h14', desc: 'Grosse collection : au moins 10 cartes ultra rares ou 5 000 € de valeur. Tous les détails.' }
    };
  }
  adapts(cat) {
    return {
      novice: ['Accueil simplifié, avec les premiers pas', 'Chaque prix expliqué en une phrase', 'Récap du dimanche : la valeur de ta collection, sans jargon'],
      regular: ['Hausses et baisses de tes articles sur 7 jours', 'Alerte quand un article bouge de plus de 10 %', 'Récap du dimanche : valeur, mouvements et palier'],
      passion: ['Toutes les sources de prix, en détail', 'Alertes dès 5 % et suivi des cartes gradées', 'Mode avancé proposé : lots, associés, export']
    }[cat];
  }
  questions() {
    return [
      { k: 'q1', q: 'Combien de cartes ultra rares as-tu ?', opts: ['0 à 2', '3 à 9', '10 ou plus'] },
      { k: 'q2', q: 'Valeur estimée de ta collection', opts: ['Moins de 1 000 €', '1 000 à 5 000 €', 'Plus de 5 000 €'] }
    ];
  }
  predict(ans) {
    const lvl = Math.max(ans.q1 || 0, ans.q2 || 0);
    return { lvl: lvl, cat: ['novice', 'regular', 'passion'][lvl] };
  }

  platformKeys() { return ['vinted', 'cardmarket', 'ebay', 'direct']; }
  // Valeurs d'exemple, à vérifier : elles dépendent du statut du vendeur et de chaque plateforme.
  platformsSeed() {
    return {
      vinted: { label: 'Vinted', rate: 0, fixed: 0, port: 1.5 },
      cardmarket: { label: 'Cardmarket', rate: 5, fixed: 0, port: 2 },
      ebay: { label: 'eBay', rate: 11, fixed: 0.35, port: 2 },
      direct: { label: 'Main propre', rate: 0, fixed: 0, port: 0 }
    };
  }
  // total null = prix d'achat non renseigné (ajout par scan sans prix) : exclu de la plus-value.
  purchasesSeed(demo) {
    if (demo === 'novice') {
      return [
        { id: 'b1', date: '2026-09-27', lines: [{ pid: 'k5', qty: 1 }], total: 45, where: 'Boutique', by: 'toi' },
        { id: 'b2', date: '2026-10-01', lines: [{ pid: 'k3', qty: 1 }], total: 40, where: 'Vinted', by: 'toi' },
        { id: 'b3', date: '2026-10-02', lines: [{ pid: 'p6', qty: 1 }], total: 32.9, where: 'Boutique', by: 'toi' }
      ];
    }
    return [
      { id: 'a1', date: '2026-08-22', lines: [{ pid: 'p4', qty: 4 }], total: 119.96, where: 'Boutique', by: 'toi' },
      { id: 'a2', date: '2026-09-05', lines: [{ pid: 'p2', qty: 3 }], total: 179.97, where: 'Boutique', by: 'toi' },
      { id: 'a3', date: '2026-09-08', lines: [{ pid: 'k2', qty: 1, ref: 66 }, { pid: 'k3', qty: 1, ref: 46 }, { pid: 'k4', qty: 1, ref: 44 }, { pid: 'k5', qty: 1, ref: 47 }], total: 162.4, where: 'Vinted', by: 'sam' },
      { id: 'a4', date: '2026-09-12', lines: [{ pid: 'p1', qty: 3 }], total: 486, where: 'Boutique', by: 'toi' },
      { id: 'a5', date: '2026-09-14', lines: [{ pid: 'p3', qty: 2, ref: 420 }, { pid: 'p2', qty: 2, ref: 140 }], total: 784, where: 'Leboncoin', by: 'sam' },
      { id: 'a6', date: '2026-09-20', lines: [{ pid: 'p1', qty: 1 }], total: 175, where: 'Vinted', by: 'sam' },
      { id: 'a7', date: '2026-09-24', lines: [{ pid: 'k6', qty: 1 }], total: 360, where: 'eBay', by: 'sam' },
      { id: 'a8', date: '2026-09-28', lines: [{ pid: 'p5', qty: 2 }], total: 316, where: 'Boutique', by: 'sam' },
      { id: 'a9', date: '2026-10-01', lines: [{ pid: 'p6', qty: 5 }], total: 149.5, where: 'Boutique', by: 'toi' },
      { id: 'a10', date: '2026-10-02', lines: [{ pid: 'k1', qty: 1 }], total: 82, where: 'Cardmarket', by: 'toi' }
    ];
  }
  // price = prix total de la vente ; commission figée à l'enregistrement ; port null = à renseigner.
  salesSeed(demo) {
    if (demo === 'novice') return [];
    return [
      { id: 'v1', date: '2026-09-16', pid: 'p2', qty: 1, price: 158, platform: 'ebay', commission: 17.73, port: 2, by: 'toi' },
      { id: 'v2', date: '2026-09-21', pid: 'p1', qty: 1, price: 189, platform: 'cardmarket', commission: 9.45, port: 2, by: 'toi' },
      { id: 'v3', date: '2026-09-26', pid: 'p4', qty: 2, price: 96, platform: 'vinted', commission: 0, port: 1.5, by: 'toi' },
      { id: 'v4', date: '2026-09-28', pid: 'p1', qty: 1, price: 182, platform: 'vinted', commission: 0, port: 1.5, by: 'sam' },
      { id: 'v5', date: '2026-09-30', pid: 'p3', qty: 1, price: 429, platform: 'cardmarket', commission: 21.45, port: 2, by: 'sam' },
      { id: 'v6', date: '2026-10-02', pid: 'p2', qty: 1, price: 165, platform: 'vinted', commission: 0, port: null, by: 'toi' }
    ];
  }
  formSeed(p) {
    p = p || {};
    return {
      pid: p.formProduct || p.itemId || 'k1',
      price: p.formPrice !== undefined && p.formPrice !== null ? String(p.formPrice) : '',
      qty: 1, platform: p.formPlatform || 'vinted', port: null, commission: null, by: 'toi', editId: null
    };
  }
  scanFormSeed() { return { qty: 1, price: '', lang: 'FR', cond: 0 }; }
  // Territoire : boutiques de démo (noms et données fictifs). partner = boutique partenaire PKM.
  // dist en km, ang = direction sur la carte (degrés). Chaque arrivage : article, probabilité (%), quand, sources.
  stores() {
    const h = (d, t) => ({ date: d, text: t });
    return [
      { id: 's1', name: 'Comptoir des Cartes', kind: 'tcg', partner: true, dist: 1.2, ang: -20, hours: 'Du mardi au samedi, 10 h – 19 h', open: 'Ouvert · ferme à 19 h',
        arrivals: [{ pid: 'p2', prob: 92, when: 'Arrivage annoncé sam. 4 oct. à 10 h', src: ['annonce'] }, { pid: 'm2', prob: 85, when: 'Arrivage annoncé sam. 4 oct. à 10 h', src: ['annonce'] }, { pid: 'p3', prob: 40, when: 'Possible dans le même arrivage', src: ['historique'] }],
        history: [h('2026-09-27', 'ETB 30e Anniversaire ×12, Display Nuit Noire ×4'), h('2026-09-20', 'Coffret Collection 30e Anniversaire ×6'), h('2026-09-13', 'ETB 30e Anniversaire ×10')] },
      { id: 's2', name: 'La Tanière TCG', kind: 'tcg', partner: true, dist: 2.6, ang: 160, hours: 'Du mercredi au dimanche, 11 h – 20 h', open: 'Ouvert · ferme à 20 h',
        arrivals: [{ pid: 'p1', prob: 74, when: 'Réassort probable mar. 7 oct.', src: ['historique', 'signal:6'] }, { pid: 'p2', prob: 66, when: 'Réassort probable mar. 7 oct.', src: ['historique'] }],
        history: [h('2026-09-30', 'Display Nuit Noire ×6'), h('2026-09-23', 'ETB 30e Anniversaire ×8'), h('2026-09-16', 'Display Chaos Ascendant ×3')] },
      { id: 's3', name: 'Ludik & Co', kind: 'games', partner: true, dist: 5.9, ang: 20, hours: 'Du lundi au samedi, 10 h – 19 h 30', open: 'Ouvert · ferme à 19 h 30',
        arrivals: [{ pid: 'm1', prob: 95, when: 'Sortie le jeu. 6 nov. · précommandes ouvertes', src: ['annonce'] }, { pid: 'p5', prob: 52, when: 'Réassort probable la semaine prochaine', src: ['historique'] }],
        history: [h('2026-09-25', 'Display Chaos Ascendant ×4'), h('2026-09-11', 'Tin 30e Anniversaire ×10')] },
      { id: 's4', name: 'Hyper Les Arcades', kind: 'hyper', partner: false, dist: 4.4, ang: 110, hours: 'Du lundi au samedi, 8 h 30 – 21 h', open: 'Ouvert · ferme à 21 h',
        arrivals: [{ pid: 'm4', prob: 70, when: 'Mise en rayon probable mer. 8 oct. au matin', src: ['signal:9', 'historique'] }, { pid: 'p6', prob: 61, when: 'Mise en rayon probable mer. 8 oct. au matin', src: ['signal:9', 'historique'] }, { pid: 'p2', prob: 58, when: 'Mise en rayon probable mer. 8 oct. au matin', src: ['signal:4'] }],
        history: [h('2026-10-01', 'Bundle Nuit Noire, boosters (signalé)'), h('2026-09-24', 'ETB 30e Anniversaire (signalé)')] },
      { id: 's5', name: 'Espace Culture Rive Gauche', kind: 'culture', partner: false, dist: 3.1, ang: -140, hours: 'Du lundi au samedi, 10 h – 19 h', open: 'Ouvert · ferme à 19 h',
        arrivals: [{ pid: 'm1', prob: 78, when: 'Le jour de la sortie, jeu. 6 nov.', src: ['historique'] }, { pid: 'p3', prob: 22, when: 'Rare dans ce magasin', src: ['historique'] }],
        history: [h('2026-09-12', 'Sortie Nuit Noire : ETB et displays (signalé)')] },
      { id: 's6', name: 'Pixel Zone', kind: 'video', partner: false, dist: 2.2, ang: 60, hours: 'Du lundi au samedi, 10 h – 19 h', open: 'Ouvert · ferme à 19 h',
        arrivals: [{ pid: 'm3', prob: 45, when: 'Réassort possible cette semaine', src: ['signal:3'] }, { pid: 'p2', prob: 38, when: 'Réassort incertain', src: ['signal:2'] }],
        history: [h('2026-09-26', 'Tin 30e Anniversaire (signalé)')] },
      { id: 's7', name: 'Jouets du Marché', kind: 'toys', partner: false, dist: 7.3, ang: -160, hours: 'Du mardi au samedi, 9 h 30 – 19 h', open: 'Fermé · ouvre mar. à 9 h 30',
        arrivals: [{ pid: 'p4', prob: 50, when: 'Réassort probable ven. 10 oct.', src: ['historique'] }, { pid: 'p2', prob: 26, when: 'Réassort incertain', src: ['historique'] }],
        history: [h('2026-09-19', 'Coffret Collection 30e Anniversaire (signalé)')] },
      { id: 's8', name: 'Supermarché Le Phare', kind: 'super', partner: false, dist: 1.9, ang: -95, hours: 'Tous les jours, 8 h – 20 h', open: 'Ouvert · ferme à 20 h',
        arrivals: [{ pid: 'm4', prob: 35, when: 'Rayon peu fourni', src: ['signal:3'] }, { pid: 'p6', prob: 20, when: 'Réassort incertain', src: ['signal:1'] }],
        history: [h('2026-09-29', 'Boosters à l’unité (signalé)')] }
    ];
  }
  storeKind(k) {
    return {
      tcg: ['Boutique TCG', 'M8.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 7 18.5V6a1.5 1.5 0 0 1 1.5-1.5z M4.5 7.5v10.5a2 2 0 0 0 2 2'],
      games: ['Boutique de jeux', 'M5 5h14v14H5z M9 9h.01 M15 9h.01 M12 12h.01 M9 15h.01 M15 15h.01'],
      hyper: ['Hypermarché', 'M3 5h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2 M9.5 20.5h.01 M17 20.5h.01'],
      culture: ['Enseigne culturelle', 'M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z M5 16.5a3 3 0 0 1 3-3h11'],
      video: ['Jeux vidéo', 'M6 8h12a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3z M7.5 12.5h3 M9 11v3 M15 12h.01 M17 13.5h.01'],
      toys: ['Magasin de jouets', 'M12 3.5l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z'],
      super: ['Supermarché', 'M5 9h14l-1.5 10.5h-11z M9 9l3-5 3 5']
    }[k] || ['Magasin', 'M4 10h16v10H4z M3 10l2-5h14l2 5'];
  }
  // Probabilité d'arrivage : forte dès 70 %, moyenne dès 40 %.
  probLevel(n) {
    return n >= 70 ? { label: 'Forte', color: '#3DDC84', tint: 'rgba(61, 220, 132, 0.16)' }
      : n >= 40 ? { label: 'Moyenne', color: '#F5B14C', tint: 'rgba(245, 177, 76, 0.16)' }
      : { label: 'Faible', color: '#9AA8C3', tint: 'rgba(154, 168, 195, 0.14)' };
  }
  srcLabel(code) {
    if (code === 'annonce') return 'Annonce du magasin';
    if (code === 'historique') return 'Historique des arrivages';
    const m = /^signal:(\d+)$/.exec(code);
    return m ? m[1] + (m[1] === '1' ? ' signalement' : ' signalements') : code;
  }
  matchProd(p, f) {
    if (f === 'all') return true;
    if (f === 'value') { const k = this.cote(p); return k !== null && k >= 100; }
    return p.code === f;
  }
  scanList(mode) { return mode === 'sealed' ? ['m2', 'p2', 'p3', 'p5', 'p1', 'p6', 'p4'] : ['k1', 'k4', 'k2', 'k5', 'k3', 'k6']; }

  // État courant = valeurs par défaut (issues des props de l'artboard) + état modifié.
  st() {
    const p = this.props || {};
    const yes = x => x === true || x === 'true';
    const screens = ['home', 'collection', 'item', 'scan', 'market', 'territory', 'store', 'profile', 'tiers', 'settings', 'sales', 'sale', 'lots', 'fees', 'team', 'io'];
    const d = {
      screen: screens.indexOf(p.start) >= 0 ? p.start : 'home',
      stack: [], itemId: p.itemId || 'k1', saleId: p.saleId || 'v2', period: '30',
      adv: yes(p.adv), sheet: p.sheet === 'buy' || p.sheet === 'sell' ? p.sheet : null, f: this.formSeed(p),
      demo: p.demo === 'novice' ? 'novice' : 'full',
      purchases: this.purchasesSeed(p.demo), sales: this.salesSeed(p.demo), platforms: this.platformsSeed(),
      lotMethod: 'value', valuation: 'pkm', split: 50, toast: null, hi: null, seq: 100,
      q: '', ftype: 'all', mq: '', mfilter: 'trend', masked: false,
      scanMode: p.scanMode === 'sealed' ? 'sealed' : 'card', scanIdx: 0, scanSheet: yes(p.scanSheet), sf: this.scanFormSeed(), scanned: 0,
      onb: [1, 2, 3].indexOf(Number(p.onb)) >= 0 ? Number(p.onb) : 0,
      answers: { q1: 1, q2: 1 }, declared: null,
      tprod: ['all', 'ETB', 'DSP', 'UPC', 'value'].indexOf(p.tprod) >= 0 ? p.tprod : 'all',
      tprob: ['all', 'mid', 'high'].indexOf(p.tprob) >= 0 ? p.tprob : 'all',
      tradius: '10', storeId: p.storeId || 's1', alerts: {}
    };
    return Object.assign(d, this.state || {});
  }

  // ——— outils ———
  num(x) {
    if (x === null || x === undefined) return NaN;
    if (typeof x === 'number') return x;
    const t = String(x).replace(/[\s  ]/g, '').replace(',', '.');
    return t === '' ? NaN : Number(t);
  }
  r2(n) { return Math.round(n * 100) / 100 + 0; }
  eur(n) { return this.r2(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); }
  eur0(n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; }
  signed(n) { const r = this.r2(n); return (r < 0 ? '−' : '+') + this.eur(Math.abs(r)); }
  minus(n) { return '−' + this.eur(Math.abs(n)); }
  pct(n) { return (Math.round(n * 10) / 10 + 0).toLocaleString('fr-FR') + ' %'; }
  signedPct(n) { const r = Math.round(n); return (r < 0 ? '−' : '+') + Math.abs(r) + ' %'; }
  chg(n) { const r = Math.round(n * 10) / 10 + 0; return (r < 0 ? '−' : '+') + Math.abs(r).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'; }
  d2(d) { return d.slice(8, 10) + '/' + d.slice(5, 7); }
  d3(d) { return d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4); }
  fmtIn(v) { return typeof v === 'number' ? String(v).replace('.', ',') : (v === null || v === undefined ? '' : String(v)); }
  daysAgo(d) { return Math.round((Date.parse(this.today()) - Date.parse(d)) / 86400000); }
  inPeriod(d, period) { return period === 'all' || this.daysAgo(d) < Number(period); }
  histDate(i, n) { return new Date(Date.UTC(2026, 9, 3 - (n - 1 - i))).toISOString().slice(0, 10); }
  feeRule(pf) {
    const rate = this.num(pf.rate) || 0, fixed = this.num(pf.fixed) || 0, parts = [];
    if (rate > 0) parts.push((Math.round(rate * 100) / 100).toLocaleString('fr-FR') + ' %');
    if (fixed > 0) parts.push(this.eur(fixed));
    return parts.length ? parts.join(' + ') : 'sans commission';
  }
  // Puce de filtre (pilule) et choix sélectionnable (anneau pastel).
  chip(on) {
    return { bg: on ? '#26345A' : 'transparent', bc: on ? '#3A4A75' : '#2A3A5C', fg: on ? '#FFFFFF' : '#C9D3EA' };
  }
  choice(on) {
    return { bc: on ? '#A8B6FF' : '#24345C', ring: on ? 'inset 0 0 0 1px #A8B6FF' : 'none', bg: on ? '#1A2645' : '#111A2C', fg: '#F3F6FC' };
  }
  // Courbe : tracé, aire et point final, à l'échelle du cadre W × H.
  spark(pts, W, H, padTop, padBottom) {
    const n = pts.length;
    const mn = Math.min.apply(null, pts), mx = Math.max.apply(null, pts), span = (mx - mn) || 1;
    const step = n > 1 ? (W - 8) / (n - 1) : 0;
    const xs = pts.map((_, i) => 4 + i * step);
    const ys = pts.map(v => padTop + (mx - v) / span * (H - padTop - padBottom));
    const line = xs.map((x, i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + ys[i].toFixed(1)).join(' ');
    return {
      line: line, area: line + ' L' + xs[n - 1].toFixed(1) + ' ' + H + ' L' + xs[0].toFixed(1) + ' ' + H + ' Z',
      xs: xs, ys: ys, step: step, mn: mn, mx: mx, dotX: xs[n - 1].toFixed(1), dotY: ys[n - 1].toFixed(1),
      color: pts[n - 1] < pts[0] ? '#FF6B6B' : '#3DDC84'
    };
  }

  // Cote PKM : médiane des prix « marché » disponibles (tendance Cardmarket, ventes eBay, TCGplayer).
  // Les prix demandés (plus bas Cardmarket) sont affichés mais exclus de la cote.
  cote(p) {
    const xs = [p.cm, p.ebay, p.tcp].filter(x => typeof x === 'number').sort((a, b) => a - b);
    if (!xs.length) return null;
    const m = Math.floor(xs.length / 2);
    return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2;
  }
  unitVal(p, valuation) {
    const v = valuation === 'cm' ? p.cm : valuation === 'low' ? p.low : this.cote(p);
    return typeof v === 'number' ? v : (this.cote(p) || 0);
  }
  // Historique quotidien de la cote (archive maison, déterministe), se terminant à la cote du jour.
  history(p) {
    const end = this.cote(p);
    if (end === null || !(p.avg30 > 0)) return null;
    let x = p.seed;
    const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    const n = 30, pts = [];
    let v = p.avg30 * 0.98;
    for (let i = 0; i < n; i++) {
      const target = p.avg30 + (end - p.avg30) * (i / (n - 1));
      v = v + (target - v) * 0.35 + (rnd() - 0.5) * end * 0.025;
      pts.push(i === n - 1 ? end : Math.round(v * 100) / 100);
    }
    return pts;
  }
  change7(h) { return h ? (h[h.length - 1] - h[h.length - 8]) / h[h.length - 8] * 100 : null; }

  // Répartition du prix d'un lot entre ses lignes.
  allocate(a, method) {
    const total = this.num(a.total) || 0;
    if (a.lines.length === 1) return [total];
    const units = a.lines.reduce((n, l) => n + l.qty, 0);
    const val = a.lines.reduce((n, l) => n + l.qty * (l.ref || 0), 0);
    if (method === 'equal' || !(val > 0)) return a.lines.map(l => total * l.qty / units);
    return a.lines.map(l => total * l.qty * l.ref / val);
  }

  // Rejoue achats et ventes dans l'ordre : collection au coût moyen pondéré (PRU),
  // coût d'achat figé au jour de chaque vente, marge nette par vente.
  // Les articles sans prix d'achat (unk) sont comptés en quantité, jamais dans le PRU.
  compute(s) {
    const byId = {}, stock = {};
    this.catalog().forEach(p => { byId[p.id] = p; stock[p.id] = { qty: 0, cost: 0, unk: 0 }; });
    const ev = [];
    s.purchases.forEach(a => ev.push({ t: 0, date: a.date, seq: a.seq || 0, a: a }));
    s.sales.forEach(v => ev.push({ t: 1, date: v.date, seq: v.seq || 0, v: v }));
    ev.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0) || (x.seq - y.seq) || (x.t - y.t));
    const sales = {}, buys = {};
    ev.forEach(e => {
      if (e.t === 0) {
        const a = e.a, noCost = a.total === null || a.total === undefined || a.total === '';
        const alloc = noCost ? a.lines.map(() => 0) : this.allocate(a, s.lotMethod);
        a.lines.forEach((l, k) => { const st = stock[l.pid]; st.qty += l.qty; st.cost += alloc[k]; if (noCost) st.unk += l.qty; });
        buys[a.id] = noCost ? null : alloc;
      } else {
        const v = e.v, st = stock[v.pid], pf = s.platforms[v.platform] || { port: 0 };
        const known = st.qty - st.unk;
        const pru = known > 0 ? st.cost / known : 0;
        const fromKnown = Math.min(v.qty, Math.max(0, known));
        const fromUnk = Math.min(v.qty - fromKnown, st.unk);
        const cost = pru * fromKnown;
        st.qty = Math.max(0, st.qty - v.qty);
        st.unk = Math.max(0, st.unk - fromUnk);
        st.cost = st.qty - st.unk <= 0 ? 0 : st.cost - cost;
        const missing = v.port === null || v.port === undefined || v.port === '';
        const port = missing ? (this.num(pf.port) || 0) : (this.num(v.port) || 0);
        const commission = this.num(v.commission) || 0;
        const price = this.num(v.price) || 0;
        sales[v.id] = { pru: pru, cost: cost, port: port, missing: missing, commission: commission, price: price, margin: price - commission - port - cost, gross: price - cost, costUnknown: fromUnk > 0 };
      }
    });
    return { byId: byId, stock: stock, sales: sales, buys: buys };
  }

  // Vente en cours de saisie (nouvelle ou modifiée), frais calculés selon la plateforme.
  draftSale(s) {
    const f = s.f, pf = s.platforms[f.platform] || s.platforms.vinted;
    const price = this.num(f.price);
    const old = f.editId ? s.sales.find(x => x.id === f.editId) : null;
    const auto = price > 0 ? price * (this.num(pf.rate) || 0) / 100 + (this.num(pf.fixed) || 0) : 0;
    const typedCom = f.commission !== null && f.commission !== '' && !isNaN(this.num(f.commission));
    const typedPort = f.port !== null && f.port !== '' && !isNaN(this.num(f.port));
    return {
      id: old ? old.id : 'draft', date: old ? old.date : this.today(), seq: old ? (old.seq || 0) : s.seq,
      pid: f.pid, qty: f.qty, price: price > 0 ? price : 0, platform: f.platform,
      commission: this.r2(typedCom ? this.num(f.commission) : auto),
      port: typedPort ? this.num(f.port) : (this.num(pf.port) || 0),
      by: f.by, auto: auto
    };
  }

  // Semaines actives : 0 = semaine en cours (du lundi au dimanche).
  weekIdx(d) {
    const t = Date.parse(this.today()), x = Date.parse(d), day = 86400000;
    const monday = t - ((new Date(t).getUTCDay() + 6) % 7) * day;
    return x >= monday ? 0 : Math.floor((monday - x - 1) / (7 * day)) + 1;
  }
  activeWeeks(s) {
    const w = {};
    s.purchases.forEach(a => { w[this.weekIdx(a.date)] = 1; });
    s.sales.forEach(v => { w[this.weekIdx(v.date)] = 1; });
    return w;
  }
  streakOf(w) {
    let k = w[0] ? 0 : 1, n = 0;
    while (w[k]) { n++; k++; }
    return n;
  }

  // Profil automatique : le plus haut des deux niveaux, recalculé à chaque changement de la collection.
  profileOf(s, c, total) {
    const R = this.profRules(), w = this.activeWeeks(s);
    let ur = 0, units = 0;
    this.catalog().forEach(p => { const q = c.stock[p.id].qty; units += q; if (p.ur) ur += q; });
    const byUr = ur >= R.ur[1] ? 2 : ur >= R.ur[0] ? 1 : 0;
    const byVal = total >= R.val[1] ? 2 : total >= R.val[0] ? 1 : 0;
    const lvl = Math.max(byUr, byVal);
    return { ur: ur, units: units, byUr: byUr, byVal: byVal, lvl: lvl, cat: ['novice', 'regular', 'passion'][lvl], streak: this.streakOf(w), weeks: w };
  }
  // Tant que la collection compte moins de 10 articles, le profil anticipé à l'inscription sert de repère.
  effCat(s, prof) { return prof.units >= 10 || !s.declared ? prof.cat : s.declared; }

  // ——— actions ———
  setF(patch) { const s = this.st(); this.setState({ f: Object.assign({}, s.f, patch) }); }
  setSF(patch) { const s = this.st(); this.setState({ sf: Object.assign({}, s.sf, patch) }); }
  push(screen, extra) {
    const s = this.st();
    this.setState(Object.assign({ screen: screen, stack: (s.stack || []).concat([s.screen]), hi: null }, extra || {}));
  }
  parentOf(sc) {
    return { item: 'collection', store: 'territory', profile: 'home', tiers: 'profile', settings: 'profile', sales: 'profile', sale: 'sales', lots: 'settings', fees: 'settings', team: 'settings', io: 'settings' }[sc] || 'home';
  }
  pop() {
    const s = this.st(), stack = (s.stack || []).slice(), prev = stack.pop();
    this.setState({ screen: prev || this.parentOf(s.screen), stack: stack, hi: null, scanSheet: false });
  }
  tab(screen) { this.setState({ screen: screen, stack: [], hi: null }); }
  section(s) {
    const tabs = ['home', 'collection', 'market', 'territory'];
    if (tabs.indexOf(s.screen) >= 0) return s.screen;
    const st = s.stack || [];
    for (let i = st.length - 1; i >= 0; i--) if (tabs.indexOf(st[i]) >= 0) return st[i];
    let p = this.parentOf(s.screen), guard = 0;
    while (tabs.indexOf(p) < 0 && guard++ < 4) p = this.parentOf(p);
    return p;
  }
  openScan() {
    const s = this.st();
    if (s.screen === 'scan') return;
    this.push('scan', { scanSheet: false, sheet: null });
  }
  scanTarget(s) { const l = this.scanList(s.scanMode); return l[((s.scanIdx % l.length) + l.length) % l.length]; }
  openSheet(kind, pid) {
    const s = this.st(), c = this.compute(s);
    let p = pid || s.itemId;
    if (!c.byId[p] || (kind === 'buy' && c.byId[p].release)) p = 'k1';
    if (kind === 'sell' && !(c.stock[p] && c.stock[p].qty > 0)) {
      const first = this.catalog().find(x => c.stock[x.id].qty > 0);
      p = first ? first.id : p;
    }
    this.setState({ sheet: kind, f: Object.assign(this.formSeed({}), { pid: p }) });
  }
  switchSheet(kind) {
    const s = this.st();
    if (s.sheet === kind) return;
    this.openSheet(kind, s.f.pid);
  }
  editSale() {
    const s = this.st(), v = s.sales.find(x => x.id === s.saleId);
    if (!v) return;
    this.setState({ sheet: 'sell', f: {
      pid: v.pid, price: this.fmtIn(v.price), qty: v.qty, platform: v.platform,
      port: v.port === null || v.port === undefined ? null : this.fmtIn(v.port),
      commission: this.fmtIn(this.r2(v.commission)), by: v.by || 'toi', editId: v.id
    } });
  }
  saveSell() {
    const s = this.st(), f = s.f, d = this.draftSale(s);
    const others = s.sales.filter(x => x.id !== d.id);
    const avail = this.compute(Object.assign({}, s, { sales: others })).stock[f.pid].qty;
    if (!(d.price > 0) || f.qty < 1 || f.qty > avail) return;
    const id = f.editId || ('n' + s.seq);
    const rec = { id: id, date: d.date, seq: d.seq, pid: d.pid, qty: d.qty, price: d.price, platform: d.platform, commission: d.commission, port: d.port, by: d.by };
    const sales = others.concat([rec]);
    const m = this.compute(Object.assign({}, s, { sales: sales })).sales[id].margin;
    const bits = this.changeBits(this.snap(s, {}), this.snap(s, { sales: sales }));
    this.setState({ sales: sales, sheet: null, seq: f.editId ? s.seq : s.seq + 1, f: this.formSeed({}), itemId: d.pid,
      toast: (f.editId ? 'Vente modifiée' : 'Vente enregistrée') + ' · marge nette ' + this.signed(m) + (bits.length ? ' · désormais ' + bits.join(' et ') : '') });
    this.flash();
  }
  // Valeur, palier et profil de la collection pour un jeu d'opérations donné.
  snap(s, patch) {
    const s2 = Object.assign({}, s, patch), c = this.compute(s2);
    const total = this.catalog().reduce((n, p) => n + this.unitVal(p, s.valuation) * c.stock[p.id].qty, 0);
    const prof = this.profileOf(s2, c, total);
    return { total: total, tier: this.tierOf(total), cat: this.effCat(s2, prof) };
  }
  // Le palier et le profil s'adaptent tout seuls : on prévient quand ils changent.
  changeBits(before, after) {
    const bits = [];
    if (after.tier.i !== before.tier.i) bits.push('palier ' + after.tier.cur.name);
    if (after.cat !== before.cat) bits.push('profil ' + this.cats()[after.cat].name);
    return bits;
  }
  addRecord(s, pid, qty, price, where, by) {
    const rec = { id: 'n' + s.seq, date: this.today(), seq: s.seq, lines: [{ pid: pid, qty: qty }], total: price > 0 ? this.r2(price) : null, where: where, by: by };
    const purchases = s.purchases.concat([rec]);
    const before = this.snap(s, {}), after = this.snap(s, { purchases: purchases });
    const name = this.catalog().find(p => p.id === pid).name, bits = this.changeBits(before, after);
    return { purchases: purchases, msg: bits.length ? 'Nouveau ' + bits.join(' et ') + ' ! Collection à ' + this.eur(after.total) : name + ' ajouté · collection à ' + this.eur(after.total) };
  }
  saveBuy() {
    const s = this.st(), f = s.f, price = this.num(f.price);
    if (f.qty < 1) return;
    const r = this.addRecord(s, f.pid, f.qty, price, 'Saisie', f.by);
    this.setState({ purchases: r.purchases, sheet: null, seq: s.seq + 1, f: this.formSeed({}), itemId: f.pid, toast: r.msg });
    this.flash();
  }
  saveScan() {
    const s = this.st(), sf = s.sf, pid = this.scanTarget(s);
    if (sf.qty < 1) return;
    const r = this.addRecord(s, pid, sf.qty, this.num(sf.price), 'Scan', 'toi');
    this.setState({ purchases: r.purchases, scanSheet: false, seq: s.seq + 1, sf: this.scanFormSeed(), scanIdx: s.scanIdx + 1, scanned: s.scanned + 1, itemId: pid, toast: r.msg });
    this.flash();
  }
  say(msg) { this.setState({ toast: msg }); this.flash(); }
  flash() {
    if (this._tt) clearTimeout(this._tt);
    this._tt = setTimeout(() => { this._tt = null; this.setState({ toast: null }); }, 2800);
  }
  setPlat(k, field, value) {
    const s = this.st(), pl = Object.assign({}, s.platforms);
    pl[k] = Object.assign({}, pl[k]);
    pl[k][field] = value;
    this.setState({ platforms: pl });
  }
  toggleAdv() {
    const s = this.st(), advOnly = ['lots', 'fees', 'team', 'io'];
    const patch = { adv: !s.adv };
    if (s.adv && advOnly.indexOf(s.screen) >= 0) { patch.screen = 'settings'; patch.stack = ['profile']; }
    this.setState(patch);
  }
  setAnswer(k, v) { const s = this.st(); this.setState({ answers: Object.assign({}, s.answers, { [k]: v }) }); }
  finishOnb(toScan) {
    const s = this.st(), pr = this.predict(s.answers);
    this.setState({ onb: 0, declared: pr.cat, screen: toScan ? 'scan' : 'home', stack: toScan ? ['home'] : [], scanSheet: false, sheet: null });
  }
  toggleAlert(id) {
    const s = this.st(), on = !s.alerts[id], st = this.stores().find(z => z.id === id);
    this.setState({ alerts: Object.assign({}, s.alerts, { [id]: on }), toast: on ? 'Alerte activée : arrivages chez ' + st.name : 'Alerte désactivée pour ' + st.name });
    this.flash();
  }
  componentWillUnmount() { if (this._tt) clearTimeout(this._tt); }

  // ——— vues ———
  valStamp(v) {
    return ({ pkm: 'Cote PKM : médiane Cardmarket, eBay, TCGplayer', cm: 'Tendance Cardmarket', low: 'Plus bas Cardmarket (prix demandé)' }[v] || 'Cote PKM') + ' · 03/10 à 07:00';
  }
  tierView(x) {
    const t = x.tier;
    return {
      name: t.cur.name, color: t.cur.color, sym: t.cur.sym, glow: t.cur.glow, pct: Math.floor(t.pct) + ' %', barW: t.pct.toFixed(1) + '%',
      next: t.next ? 'Plus que ' + this.eur(t.remaining) + ' pour ' + t.next.name : 'Palier maximal atteint',
      nextColor: t.next ? t.next.color : t.cur.color,
      aria: 'Palier ' + t.cur.name + ', ' + Math.floor(t.pct) + ' % vers le suivant. Voir les paliers'
    };
  }
  thumbs(x, ids) { return ids.map(id => this.look(x.P[id])); }

  vHome(x) {
    const s = x.s, c = x.c;
    // Courbe : collection actuelle, valorisée aux cotes des 30 derniers jours.
    const V = [];
    for (let i = 0; i < 30; i++) {
      let t = 0;
      x.owned.forEach(p => { const h = x.hist[p.id], u = x.val(p), k = this.cote(p); t += c.stock[p.id].qty * (h && k ? h[i] * u / k : u); });
      V.push(t);
    }
    const ch = this.spark(V, 324, 56, 6, 4);
    const mkt24 = V[29] - V[28];
    const latent = x.knownVal - x.cost;
    const movers = x.owned.filter(p => x.ch7[p.id] !== null).sort((a, b) => x.ch7[b.id] - x.ch7[a.id]);
    const up = movers[0] || x.cat[0], down = movers[movers.length - 1] || x.cat[0];
    const mv = (p, label) => Object.assign(this.look(p), {
      label: label, name: p.name, cote: this.eur(x.val(p)), change: this.chg(x.ch7[p.id] || 0), color: x.col(x.ch7[p.id] || 0),
      open: () => this.push('item', { itemId: p.id })
    });
    const best = x.owned.slice().sort((a, b) => x.val(b) * c.stock[b.id].qty - x.val(a) * c.stock[a.id].qty).slice(0, 5).map(p => {
      const q = c.stock[p.id].qty;
      return Object.assign(this.look(p), {
        name: p.name, value: this.eur(x.val(p) * q), hasQty: q > 1, qty: '×' + q,
        label: p.name + ' · ' + this.eur(x.val(p) * q), open: () => this.push('item', { itemId: p.id })
      });
    });
    const adds = s.purchases.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.seq || 0) - (a.seq || 0))).slice(0, 4).map((a, i) => {
      const l0 = a.lines[0], p = x.P[l0.pid], n = a.lines.reduce((k, l) => k + l.qty, 0), isLot = a.lines.length > 1;
      const noCost = a.total === null || a.total === undefined;
      return Object.assign(this.look(p), {
        title: isLot ? 'Lot de ' + n + ' articles' : p.name + (l0.qty > 1 ? ' ×' + l0.qty : ''),
        meta: a.where + ' · ' + this.d2(a.date),
        amount: this.eur(a.lines.reduce((t, l) => t + x.val(x.P[l.pid]) * l.qty, 0)),
        amountLabel: noCost ? 'prix d’achat à compléter' : 'payé ' + this.eur(a.total),
        labelColor: noCost ? '#F5B14C' : '#7D8BA8',
        border: x.line(i), open: () => this.push('item', { itemId: l0.pid })
      });
    });
    const inP = s.sales.filter(v => this.inPeriod(v.date, '30'));
    const margin = inP.reduce((t, v) => t + c.sales[v.id].margin, 0);
    const novice = x.catKey === 'novice';
    // Arrivage le plus probable autour de toi (onglet Territoire).
    let near = null;
    const pool = this.stores().filter(st => st.dist <= 3);
    (pool.length ? pool : this.stores()).forEach(st => st.arrivals.forEach(a => { if (!near || a.prob > near.a.prob || (a.prob === near.a.prob && st.dist < near.st.dist)) near = { st: st, a: a }; }));
    const nl = this.probLevel(near.a.prob);
    const steps = [
      ['Scanne ta première carte', s.scanned > 0],
      ['Regarde d’où vient sa cote (fiche de l’article)', false],
      ['Reviens chaque semaine voir la valeur évoluer', x.prof.streak >= 2]
    ].map((r, i) => ({ n: String(i + 1), label: r[0], done: r[1], color: r[1] ? '#3DDC84' : '#5EE0CF' }));
    return {
      valueBig: x.mask(this.eur(x.total)), mkt24: this.signed(mkt24), mktColor: x.col(mkt24),
      units: (x.nCards + x.nSealed) + ' articles · ' + x.nCards + (x.nCards > 1 ? ' cartes · ' : ' carte · ') + x.nSealed + (x.nSealed > 1 ? ' scellés' : ' scellé'),
      chart: ch, chartLabel: 'Valeur de la collection actuelle aux cotes des 30 derniers jours : de ' + this.eur(V[0]) + ' à ' + this.eur(V[29]),
      latent: x.mask(this.signed(latent)) + (x.cost > 0 ? ' (' + this.signedPct(latent / x.cost * 100) + ')' : ''), latentColor: x.col(latent),
      hasUnk: x.unk > 0, unkNote: x.unk + (x.unk > 1 ? ' articles sans prix d’achat : exclus de la plus-value' : ' article sans prix d’achat : exclu de la plus-value'),
      stamp: this.valStamp(s.valuation),
      tier: this.tierView(x),
      novice: novice, notNovice: !novice, passion: x.catKey === 'passion' && !s.adv, steps: steps,
      up: mv(up, 'Plus forte hausse · 7 j'), down: mv(down, 'Plus forte baisse · 7 j'),
      best: best, adds: adds,
      near: Object.assign(this.look(x.P[near.a.pid]), {
        name: x.P[near.a.pid].name, store: near.st.name + ' · ' + this.km(near.st.dist), when: near.a.when,
        prob: near.a.prob + ' %', level: nl.label, color: nl.color, tint: nl.tint,
        aria: 'Arrivage probable : ' + x.P[near.a.pid].name + ' chez ' + near.st.name + ', ' + near.a.prob + ' %',
        open: () => this.push('store', { storeId: near.st.id })
      }),
      hasMargin: !novice && inP.length > 0, margin: x.mask(this.signed(margin)), marginColor: x.col(margin),
      marginSub: inP.length + (inP.length > 1 ? ' ventes' : ' vente') + ' sur 30 jours, faites ailleurs · frais et port déduits'
    };
  }

  vCollection(x) {
    const s = x.s, c = x.c;
    const typeDefs = [['all', 'Tout'], ['card', 'Cartes'], ['ur', 'Ultra rares'], ['DSP', 'Display'], ['ETB', 'ETB'], ['UPC', 'UPC'], ['CFT', 'Coffret'], ['BDL', 'Bundle']];
    const q = String(s.q || '').trim().toLowerCase();
    const okType = p => s.ftype === 'all' || (s.ftype === 'card' ? p.type === 'card' : s.ftype === 'ur' ? p.ur : p.code === s.ftype);
    const shown = x.owned.filter(p => okType(p) && (!q || (p.name + ' ' + p.sub).toLowerCase().indexOf(q) >= 0))
      .sort((a, b) => x.val(b) * c.stock[b.id].qty - x.val(a) * c.stock[a.id].qty);
    const units = shown.reduce((n, p) => n + c.stock[p.id].qty, 0);
    return {
      q: s.q, onQ: e => this.setState({ q: e.target.value }),
      types: typeDefs.map(([k, label]) => Object.assign({ label: label, on: s.ftype === k, pick: () => this.setState({ ftype: k }) }, this.chip(s.ftype === k))),
      value: x.mask(this.eur(x.total)), cost: x.mask(this.eur(x.cost)), latent: x.mask(this.signed(x.knownVal - x.cost)), latentColor: x.col(x.knownVal - x.cost),
      countText: shown.length + (shown.length > 1 ? ' références · ' : ' référence · ') + units + (units > 1 ? ' articles' : ' article') + ' · triés par valeur',
      list: shown.map(p => {
        const st = c.stock[p.id], ch = x.ch7[p.id];
        return Object.assign(this.look(p), {
          name: p.name, sub: p.sub, qty: '×' + st.qty, value: this.eur(x.val(p) * st.qty), unit: this.eur(x.val(p)) + ' / u',
          change: ch === null ? '—' : this.chg(ch), changeColor: ch === null ? '#9AA8C3' : x.col(ch),
          open: () => this.push('item', { itemId: p.id })
        });
      }),
      empty: shown.length === 0, stamp: this.valStamp(s.valuation)
    };
  }

  vItem(x) {
    const s = x.s, c = x.c;
    const p = x.P[s.itemId] || x.cat[0], st = c.stock[p.id], h = x.hist[p.id], k = this.cote(p), u = x.val(p);
    const owned = st.qty > 0, known = st.qty - st.unk, lat = u * known - st.cost, ch = x.ch7[p.id];
    const it = Object.assign(this.look(p), {
      name: p.name, sub: p.sub, owned: owned,
      ownedBadge: owned ? '×' + st.qty + ' dans ta collection' : 'Pas dans ta collection',
      hasCote: k !== null, noCote: k === null, cote: k !== null ? this.eur(k) : '—',
      change: ch === null ? 'Pas encore de variation' : this.chg(ch) + ' sur 7 jours', changeColor: ch === null ? '#9AA8C3' : x.col(ch),
      release: p.release ? 'Sortie prévue le ' + this.d3(p.release) + '. Pas de cote avant les premières ventes : seul le prix demandé en précommande est connu.' : '',
      hold: owned ? x.mask(this.eur(u * st.qty)) : '', holdLatent: owned && known > 0 ? x.mask(this.signed(lat)) + ' (' + this.signedPct(lat / st.cost * 100) + ')' : (owned ? 'Plus-value : prix d’achat à compléter' : ''),
      holdColor: owned && known > 0 ? x.col(lat) : '#F5B14C',
      pru: known > 0 ? 'Coût moyen ' + this.eur(st.cost / known) + ' / u' : (owned ? 'Coût d’achat inconnu' : ''),
      cantSell: !owned, sellOpacity: owned ? '1' : '0.45'
    });
    // Courbe de la cote (archive maison), survol pour lire un jour.
    if (h) {
      const n = h.length, pc = this.spark(h, 324, 76, 8, 8);
      const hi = s.hi !== null && s.hi !== undefined && s.hi >= 0 && s.hi < n ? s.hi : null;
      const di = hi === null ? n - 1 : hi;
      Object.assign(it, {
        line: pc.line, area: pc.area, chartColor: pc.color, dotX: pc.xs[di].toFixed(1), dotY: pc.ys[di].toFixed(1), hasHi: hi !== null,
        readout: (hi === null ? 'Aujourd’hui' : this.d2(this.histDate(hi, n))) + ' · ' + this.eur(h[di]),
        hits: h.map((_, i) => ({ x: Math.max(0, pc.xs[i] - pc.step / 2).toFixed(1), w: pc.step.toFixed(1), enter: () => this.setState({ hi: i }) })),
        firstDate: this.d2(this.histDate(0, n)), lastDate: this.d2(this.histDate(n - 1, n)),
        rangeText: 'min ' + this.eur(pc.mn) + ' · max ' + this.eur(pc.mx),
        chartLabel: 'Cote PKM archivée sur 30 jours : de ' + this.eur(h[0]) + ' à ' + this.eur(h[n - 1])
      });
    } else {
      Object.assign(it, { line: '', area: '', chartColor: '#9AA8C3', dotX: '0', dotY: '0', hasHi: false, readout: '', hits: [], firstDate: '', lastDate: '', rangeText: '', chartLabel: '' });
    }
    const defs = [
      ['cm', 'Cardmarket', 'Tendance · fichier public du 03/10', 'calculé', '#6C84F2'],
      ['low', 'Cardmarket', p.release ? 'Précommandes · annonces du 03/10' : 'Plus bas · annonces du 03/10', 'demandé', '#6C84F2'],
      ['ebay', 'eBay', 'Ventes réussies · 30 derniers jours', 'vendu', '#F5B14C'],
      ['tcp', 'TCGplayer', 'Marché US, converti en € · via TCGdex', 'calculé', '#5EE0CF']
    ].filter(r => typeof p[r[0]] === 'number');
    it.sources = defs.map((r, i) => ({
      label: r[1], sub: r[2], tag: r[3], dot: r[4], value: this.eur(p[r[0]]), border: x.line(i),
      tagBg: r[3] === 'demandé' ? 'rgba(245, 177, 76, 0.16)' : r[3] === 'vendu' ? 'rgba(61, 220, 132, 0.14)' : 'rgba(168, 182, 255, 0.14)',
      tagFg: r[3] === 'demandé' ? '#F5B14C' : r[3] === 'vendu' ? '#3DDC84' : '#B9C5FF',
      fg: r[0] === 'low' ? '#9AA8C3' : '#F3F6FC', weight: r[0] === 'low' ? '500' : '700'
    }));
    const nM = defs.filter(r => r[0] !== 'low').length;
    it.coteRule = nM === 0 ? 'Pas encore de prix « marché » : la cote apparaîtra après les premières ventes.'
      : (nM === 1 ? 'Cote PKM = le seul prix « marché » disponible.' : nM === 2 ? 'Cote PKM = moyenne des 2 prix « marché » (tendance et vendu).' : 'Cote PKM = médiane des 3 prix « marché » (tendance, vendu, TCGplayer).')
        + (nM ? ' Le prix demandé est affiché, jamais compté.' : '');
    const buys = s.purchases.filter(a => a.lines.some(l => l.pid === p.id))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.seq || 0) - (a.seq || 0)));
    it.copies = buys.map((a, i) => {
      const kk = a.lines.findIndex(l => l.pid === p.id), l = a.lines[kk], al = c.buys[a.id];
      return { meta: this.d2(a.date) + ' · ' + a.where + (s.adv ? ' · ' + x.who[a.by || 'toi'] : ''), amount: al ? l.qty + ' × ' + this.eur(al[kk] / l.qty) : l.qty + ' × prix à compléter', isLot: a.lines.length > 1, border: x.line(i) };
    });
    it.hasCopies = buys.length > 0;
    const sold = s.sales.filter(v => v.pid === p.id);
    it.hasSold = sold.length > 0;
    it.soldText = sold.reduce((n, v) => n + v.qty, 0) + ' vendu' + (sold.reduce((n, v) => n + v.qty, 0) > 1 ? 's' : '') + ' ailleurs · marge nette ' + this.signed(sold.reduce((t, v) => t + c.sales[v.id].margin, 0));
    return it;
  }

  vScan(x) {
    const s = x.s, c = x.c, pid = this.scanTarget(s), p = x.P[pid], k = this.cote(p), sealed = s.scanMode === 'sealed';
    return Object.assign(this.look(p), {
      modeCard: !sealed, modeSealed: sealed,
      cardBg: sealed ? 'transparent' : '#A8B6FF', cardFg: sealed ? '#C9D3EA' : '#0B1120',
      sealedBg: sealed ? '#A8B6FF' : 'transparent', sealedFg: sealed ? '#0B1120' : '#C9D3EA',
      toCard: () => this.setState({ scanMode: 'card', scanIdx: 0, scanSheet: false }),
      toSealed: () => this.setState({ scanMode: 'sealed', scanIdx: 0, scanSheet: false }),
      name: p.name, status: (sealed ? 'Produit détecté · ' : 'Carte détectée · ') + p.name,
      conf: (sealed ? 'Code-barres lu' : 'Reconnue à ' + (93 + p.seed % 7) + ' %') + ' · cote ' + (k !== null ? this.eur(k) : '—'),
      hint: sealed ? 'Vise le code-barres ou la face avant de la boîte' : 'Place la carte dans le cadre, bien à plat',
      torchOn: !!s.torch, torchFg: s.torch ? '#0B1120' : '#FFFFFF', torchBg: s.torch ? '#FFD66B' : 'rgba(8, 13, 26, 0.6)',
      torchLabel: s.torch ? 'Éteindre la lampe' : 'Allumer la lampe', torch: () => this.setState({ torch: !s.torch }),
      glow: s.torch ? 'radial-gradient(60% 45% at 50% 40%, rgba(255, 244, 214, 0.22), rgba(255, 244, 214, 0) 70%)' : 'none',
      next: () => this.setState({ scanIdx: s.scanIdx + 1, scanSheet: false }),
      shutter: () => this.setState({ scanSheet: true, sf: this.scanFormSeed() }),
      close: () => this.pop(),
      manual: () => this.openSheet('buy', pid),
      photo: () => this.say('Démo : import d’une photo de la galerie'),
      count: s.scanned > 0 ? s.scanned + (s.scanned > 1 ? ' articles ajoutés depuis l’ouverture' : ' article ajouté depuis l’ouverture') : 'Scan en continu : enchaîne les cartes'
    });
  }

  vScanResult(x) {
    const s = x.s, c = x.c, pid = this.scanTarget(s), p = x.P[pid], st = c.stock[pid], sf = s.sf, k = this.cote(p);
    const sealed = p.type === 'sealed', price = this.num(sf.price), u = x.val(p), add = u * sf.qty;
    const after = this.tierOf(x.total + add), up = after.i > x.tier.i;
    // Profil après l'ajout (il s'adapte tout seul).
    const C = this.cats(), PR = this.profRules(), urAfter = x.prof.ur + (p.ur ? sf.qty : 0);
    const lvlAfter = Math.max(urAfter >= PR.ur[1] ? 2 : urAfter >= PR.ur[0] ? 1 : 0, x.total + add >= PR.val[1] ? 2 : x.total + add >= PR.val[0] ? 1 : 0);
    const catAfter = this.effCat(s, { units: x.prof.units + sf.qty, cat: ['novice', 'regular', 'passion'][lvlAfter] });
    const urText = p.ur ? x.prof.ur + ' → ' + urAfter + ' cartes ultra rares' : x.prof.ur + (x.prof.ur > 1 ? ' cartes ultra rares' : ' carte ultra rare');
    const conds = sealed ? ['Scellé d’origine', 'Boîte abîmée'] : ['Near Mint', 'Excellent', 'Joué'];
    const srcs = [['Cardmarket', 'tendance', p.cm], ['eBay', 'vendu 30 j', p.ebay], ['TCGplayer', 'converti', p.tcp]]
      .filter(r => typeof r[2] === 'number').map(r => ({ label: r[0], sub: r[1], value: this.eur(r[2]) }));
    return Object.assign(this.look(p), {
      name: p.name, sub: p.sub,
      conf: sealed ? 'Code-barres lu : correspondance exacte' : 'Reconnue à ' + (93 + p.seed % 7) + ' % : vérifie le nom et la série',
      cote: k !== null ? this.eur(k) : '—', srcs: srcs,
      ownedText: st.qty > 0 ? 'Déjà ×' + st.qty + ' dans ta collection' : 'Nouveau dans ta collection',
      ownedBg: st.qty > 0 ? 'rgba(168, 182, 255, 0.14)' : 'rgba(61, 220, 132, 0.14)', ownedFg: st.qty > 0 ? '#B9C5FF' : '#3DDC84',
      langs: ['FR', 'JP', 'EN'].map(l => Object.assign({ label: l, on: sf.lang === l, pick: () => this.setSF({ lang: l }) }, this.chip(sf.lang === l))),
      conds: conds.map((l, i) => Object.assign({ label: l, on: sf.cond === i, pick: () => this.setSF({ cond: i }) }, this.chip(sf.cond === i))),
      qty: String(sf.qty), dec: () => this.setSF({ qty: Math.max(1, sf.qty - 1) }), inc: () => this.setSF({ qty: Math.min(99, sf.qty + 1) }),
      price: sf.price, onPrice: e => this.setSF({ price: e.target.value }),
      priceHint: price > 0 ? 'Plus-value à l’ajout : ' + this.signed(add - price) : 'Facultatif : sert à calculer ta plus-value',
      valueLine: this.eur(x.total) + ' → ' + this.eur(x.total + add),
      tierLine: up ? 'Nouveau palier débloqué : ' + after.cur.name + ' !' : after.cur.name + ' · ' + Math.floor(x.tier.pct) + ' % → ' + Math.floor(after.pct) + ' %',
      tierColor: after.cur.color, tierSym: after.cur.sym,
      profLine: catAfter !== x.catKey ? 'Nouveau profil : ' + C[catAfter].name + ' !' : 'Profil ' + C[catAfter].name + ' · ' + urText,
      profColor: C[catAfter].color, profIcon: C[catAfter].icon,
      save: () => this.saveScan(), saveLabel: sf.qty > 1 ? 'Ajouter ' + sf.qty + ' exemplaires' : 'Ajouter à ma collection',
      wrong: () => this.say('Démo : la recherche manuelle n’est pas branchée'),
      close: () => this.setState({ scanSheet: false })
    });
  }

  vMarket(x) {
    const s = x.s, c = x.c, ch = p => x.ch7[p.id];
    const defs = [['trend', 'Tendances'], ['up', 'Hausses'], ['down', 'Baisses'], ['soon', 'Sorties']];
    const q = String(s.mq || '').trim().toLowerCase();
    let list = x.cat.filter(p => !q || (p.name + ' ' + p.sub).toLowerCase().indexOf(q) >= 0);
    if (s.mfilter === 'soon') list = list.filter(p => p.release);
    else {
      list = list.filter(p => ch(p) !== null);
      if (s.mfilter === 'up') list = list.filter(p => ch(p) > 0).sort((a, b) => ch(b) - ch(a));
      else if (s.mfilter === 'down') list = list.filter(p => ch(p) < 0).sort((a, b) => ch(a) - ch(b));
      else list.sort((a, b) => Math.abs(ch(b)) - Math.abs(ch(a)));
    }
    return {
      q: s.mq, onQ: e => this.setState({ mq: e.target.value }),
      filters: defs.map(([k, label]) => Object.assign({ label: label, on: s.mfilter === k, pick: () => this.setState({ mfilter: k }) }, this.chip(s.mfilter === k))),
      list: list.map((p, i) => {
        const k = this.cote(p), own = c.stock[p.id].qty > 0, v = ch(p);
        return Object.assign(this.look(p), {
          name: p.name, sub: p.sub, border: x.line(i), owned: own,
          cote: k !== null ? this.eur(k) : '~' + this.eur(p.low), coteLabel: k !== null ? 'cote PKM' : 'demandé',
          right: p.release ? 'Sortie le ' + this.d2(p.release) : this.chg(v) + ' · 7 j', rightColor: p.release ? '#F5B14C' : x.col(v),
          open: () => this.push('item', { itemId: p.id })
        });
      }),
      empty: list.length === 0,
      count: list.length + (list.length > 1 ? ' produits' : ' produit') + ' · cote PKM et variation sur 7 jours'
    };
  }

  vProfile(x) {
    const s = x.s, C = x.C, pr = x.prof, cur = C[x.catKey], R = this.profRules(), keys = ['novice', 'regular', 'passion'];
    const lv = keys.indexOf(x.catKey), next = lv < 2 ? keys[lv + 1] : null, nx = next ? C[next] : cur;
    const needUr = next ? Math.max(0, R.ur[lv] - pr.ur) : 0, needVal = next ? Math.max(0, R.val[lv] - x.total) : 0;
    const crit = (label, value, lvl, have, max, tick, scale) => ({
      label: label, value: value, level: C[keys[lvl]].name, levelColor: C[keys[lvl]].color, levelTint: C[keys[lvl]].tint,
      barW: (Math.min(1, have / max) * 100).toFixed(1) + '%', barColor: C[keys[lvl]].color, tick: tick, scale: scale
    });
    const declaredUsed = !!s.declared && pr.units < 10;
    return {
      avatar: this.img().avatar, ring: x.tier.cur.color, tierSym: x.tier.cur.sym, tierColor: x.tier.cur.color,
      since: 'Membre depuis août 2026',
      tierLine: 'Palier ' + x.tier.cur.name + (x.tier.next ? ' · ' + Math.floor(x.tier.pct) + ' % vers ' + x.tier.next.name : ''),
      catName: cur.name, catColor: cur.color, catIcon: cur.icon, catDesc: cur.desc, catTint: cur.tint,
      catSource: declaredUsed ? 'Anticipé à l’inscription · s’ajuste tout seul dès 10 articles' : 'S’adapte tout seul à chaque ajout, scan ou vente',
      steps: keys.map((k, i) => ({ name: C[k].name, bg: i === lv ? C[k].tint : 'transparent', bc: i === lv ? C[k].color : '#2A3A5C', fg: i === lv ? C[k].color : '#7D8BA8', weight: i === lv ? '800' : '600' })),
      anticip: next ? nx.name + ' dès ' + R.ur[lv] + ' cartes ultra rares (encore ' + needUr + ') ou dès ' + this.eur0(R.val[lv]) + ' de collection (encore ' + this.eur(needVal) + ').'
        : 'Tu as le profil le plus complet. Il reste à jour tout seul.',
      nextColor: nx.color, nextTint: nx.tint, nextEdge: nx.edge,
      hasDeclared: !!s.declared,
      declared: s.declared ? 'À l’inscription, on avait anticipé : ' + C[s.declared].name + (s.declared === pr.cat ? '. Ta collection le confirme.' : '. Ta collection montre plutôt : ' + C[pr.cat].name + '.') : '',
      criteria: [
        crit('Cartes ultra rares', pr.ur + (pr.ur > 1 ? ' cartes' : ' carte'), pr.byUr, pr.ur, R.ur[1], (R.ur[0] / R.ur[1] * 100) + '%', ['0', String(R.ur[0]), String(R.ur[1]) + ' et +']),
        crit('Valeur de la collection', this.eur0(x.total), pr.byVal, x.total, R.val[1], (R.val[0] / R.val[1] * 100) + '%', ['0 €', this.eur0(R.val[0]), this.eur0(R.val[1]) + ' et +'])
      ].map((c, i) => Object.assign(c, { border: x.line(i), s0: c.scale[0], s1: c.scale[1], s2: c.scale[2] })),
      adapts: this.adapts(x.catKey).map(t => ({ text: t, color: cur.color })),
      tierName: x.tier.cur.name
    };
  }

  vTiers(x) {
    const s = x.s, T = this.tiers(), t = x.tier, w = x.prof.weeks;
    const ladder = T.map((r, i) => ({
      name: r.name, color: r.color, sym: r.sym, min: i === 0 ? 'Dès le premier article' : 'À partir de ' + this.eur0(r.min),
      state: i < t.i ? 'Atteint' : i === t.i ? (t.next ? 'En cours · ' + Math.floor(t.pct) + ' %' : 'Atteint') : 'À venir',
      stateColor: i < t.i ? '#3DDC84' : i === t.i ? r.color : '#7D8BA8',
      bg: i === t.i ? 'rgba(168, 182, 255, 0.08)' : 'transparent', op: i > t.i ? '0.6' : '1'
    })).reverse().map((r, i) => Object.assign(r, { border: x.line(i) }));
    const weeks = [];
    for (let k = 7; k >= 0; k--) weeks.push({ bg: w[k] ? '#A8B6FF' : '#24345C', h: w[k] ? '34px' : '14px' });
    const graded = x.cat.find(p => p.grade && x.c.stock[p.id].qty > 0);
    const lot = s.purchases.find(a => a.lines.length > 1);
    const ach = [
      ['Premier scan', s.scanned > 0, s.scanned > 0 ? 'Débloqué aujourd’hui' : 'Scanne une carte ou une boîte', s.scanned > 0 ? 1 : 0],
      ['Première carte gradée', !!graded, graded ? graded.name + ' · ' + graded.grade : 'Ajoute une carte gradée', graded ? 1 : 0],
      ['4 semaines d’affilée', x.prof.streak >= 4, 'Série en cours : ' + x.prof.streak, Math.min(1, x.prof.streak / 4)],
      ['Premier lot réparti', !!lot, lot ? 'Lot ' + lot.where + ' du ' + this.d2(lot.date) : 'Enregistre un lot', lot ? 1 : 0],
      ['10 cartes ultra rares', x.prof.ur >= 10, Math.min(x.prof.ur, 10) + ' / 10', Math.min(1, x.prof.ur / 10)],
      ['Collection à 5 000 €', x.total >= 5000, this.eur0(Math.min(x.total, 5000)) + ' / 5 000 €', Math.min(1, x.total / 5000)]
    ].map(a => ({ label: a[0], done: a[1], todo: !a[1], sub: a[2], barW: (a[3] * 100).toFixed(0) + '%', color: a[1] ? '#3DDC84' : '#A8B6FF', bg: a[1] ? 'rgba(61, 220, 132, 0.14)' : 'rgba(168, 182, 255, 0.10)' }));
    return Object.assign(this.tierView(x), {
      value: x.mask(this.eur(x.total)), ladder: ladder, weeks: weeks,
      streak: x.prof.streak + (x.prof.streak > 1 ? ' semaines' : ' semaine'),
      streakSub: 'Une semaine compte dès qu’il y a un ajout, un scan ou une vente.',
      ach: ach, achText: ach.filter(a => a.done).length + ' / ' + ach.length + ' débloqués'
    });
  }

  vSettings(x) {
    const s = x.s, I = this.img(), pk = this.platformKeys();
    const fan = [['k4', '8px', '14px', '-12deg'], ['k1', '60px', '0px', '0deg'], ['k2', '112px', '14px', '12deg']];
    const lotsAll = s.purchases.filter(a => a.lines.length > 1);
    return {
      promoTitle: s.adv ? 'Mode avancé activé' : 'Va plus loin quand tu veux',
      cta: s.adv ? 'Revenir au mode simple' : 'Activer le mode avancé',
      ctaBg: s.adv ? 'transparent' : '#A8B6FF', ctaFg: s.adv ? '#F3F6FC' : '#0B1120',
      fan: fan.map(r => ({ img: I[r[0]], left: r[1], top: r[2], rot: r[3] })),
      valuations: [['pkm', 'Cote PKM'], ['cm', 'Tendance CM'], ['low', 'Plus bas CM']].map(([k, label]) => Object.assign(
        { label: label, on: s.valuation === k, pick: () => this.setState({ valuation: k }) }, this.chip(s.valuation === k))),
      valHelp: {
        pkm: 'Recommandé. Médiane des prix « marché » : tendance Cardmarket, ventes réussies eBay, TCGplayer.',
        cm: 'Prix de tendance calculé par Cardmarket, sans les autres sources.',
        low: 'Annonce la moins chère sur Cardmarket : un prix demandé, souvent plus bas que le prix vendu.'
      }[s.valuation],
      sources: [
        ['Cardmarket', 'Fichier public quotidien · 03/10/2026 à 07:00', '#3DDC84', 'connecté'],
        ['TCGdex', 'Catalogue FR, images et prix TCGplayer', '#3DDC84', 'connecté'],
        ['eBay', 'API officielle, ventes réussies · accès à confirmer', '#F5B14C', 'à vérifier'],
        ['Archive maison', 'Un relevé par jour depuis le 04/09/2026', '#3DDC84', 'actif'],
        ['Vinted, Leboncoin', 'Pas d’API publique, pas de scraping', '#56648A', 'non connectés']
      ].map((r, i) => ({ label: r[0], sub: r[1], dot: r[2], state: r[3], border: x.line(i) })),
      feesList: pk.map((k, i) => { const pf = s.platforms[k]; return { label: pf.label, rule: this.feeRule(pf) + ' · port ' + this.eur(this.num(pf.port) || 0), border: x.line(i) }; }),
      lotsText: lotsAll.length + (lotsAll.length > 1 ? ' lots' : ' lot') + ' · répartition du coût',
      teamText: '2 membres · règle ' + s.split + ' / ' + (100 - s.split)
    };
  }

  vOnb(x) {
    const s = x.s, I = this.img(), C = x.C, pr = this.predict(s.answers), cur = C[pr.cat];
    return {
      is1: s.onb === 1, is2: s.onb === 2, is3: s.onb === 3,
      fan: [['k4', '10px', '26px', '-13deg'], ['k6', '84px', '0px', '0deg'], ['k1', '158px', '26px', '13deg']].map(r => ({ img: I[r[0]], left: r[1], top: r[2], rot: r[3] })),
      questions: this.questions().map(q => ({ q: q.q, opts: q.opts.map((o, v) => Object.assign(
        { label: o, on: s.answers[q.k] === v, pick: () => this.setAnswer(q.k, v) }, this.choice(s.answers[q.k] === v))) })),
      predName: cur.name, predColor: cur.color, predIcon: cur.icon, predDesc: cur.desc, predTint: cur.tint, predEdge: cur.edge,
      predSteps: ['novice', 'regular', 'passion'].map((k, i) => ({ name: C[k].name, bg: i === pr.lvl ? C[k].tint : 'transparent', bc: i === pr.lvl ? C[k].color : '#2A3A5C', fg: i === pr.lvl ? C[k].color : '#7D8BA8' })),
      adapts: this.adapts(pr.cat).map(t => ({ text: t, color: cur.color })),
      dots: [1, 2, 3].map(n => ({ w: n === s.onb ? '22px' : '8px', bg: n <= s.onb ? '#A8B6FF' : '#2A3A5C' })),
      next1: () => this.setState({ onb: 2 }), next2: () => this.setState({ onb: 3 }),
      back: () => this.setState({ onb: Math.max(1, s.onb - 1) }),
      skip: () => this.setState({ onb: 0 }),
      toScan: () => this.finishOnb(true), toHome: () => this.finishOnb(false)
    };
  }

  // Revente et marge : conservé de la v2, devenu secondaire (les ventes se font ailleurs).
  vMarginSide(x) {
    const s = x.s, c = x.c, P = x.P, line = x.line, plat = x.plat, who = x.who, col = x.col;
    const periodLabels = { '7': '7 derniers jours', '30': '30 derniers jours', all: 'depuis le début' };
    const periods = [['7', '7 jours'], ['30', '30 jours'], ['all', 'Tout']].map(([k, label]) => Object.assign(
      { label: label, on: s.period === k, pick: () => this.setState({ period: k }) }, this.chip(s.period === k)));
    const sorted = s.sales.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.seq || 0) - (a.seq || 0)));
    const inP = sorted.filter(v => this.inPeriod(v.date, s.period));
    let ca = 0, cost = 0, com = 0, port = 0, margin = 0;
    inP.forEach(v => { const r = c.sales[v.id]; ca += r.price; cost += r.cost; com += r.commission; port += r.port; margin += r.margin; });
    const fees = com + port;
    const salesV = {
      periodLabel: periodLabels[s.period], count: inP.length + (inP.length > 1 ? ' ventes' : ' vente'), ca: this.eur(ca),
      margin: this.signed(margin), marginColor: col(margin), cost: this.minus(cost), fees: this.minus(fees),
      barCost: Math.max(cost, 0).toFixed(2), barFees: Math.max(fees, 0).toFixed(2), barMargin: Math.max(margin, 0).toFixed(2),
      has: inP.length > 0, none: inP.length === 0,
      list: inP.map((v, i) => {
        const r = c.sales[v.id], p = P[v.pid];
        return Object.assign(this.look(p), { name: p.name, date: this.d2(v.date) + (v.qty > 1 ? ' · ×' + v.qty : ''), platform: plat(v.platform),
          missing: r.missing, margin: this.signed(r.margin), marginColor: col(r.margin), price: 'vendu ' + this.eur(r.price), border: line(i),
          open: () => this.push('sale', { saleId: v.id }) });
      })
    };
    // Détail d'une vente (une vente fictive neutre si la collection n'en a aucune)
    const sv = s.sales.find(v => v.id === s.saleId) || sorted[0] || { id: '_', date: this.today(), pid: x.cat[0].id, qty: 1, platform: 'vinted', by: 'toi' };
    const sr = c.sales[sv.id] || { pru: 0, cost: 0, port: 0, missing: false, commission: 0, price: 0, margin: 0, gross: 0, costUnknown: false };
    const sp = P[sv.pid], sfees = sr.commission + sr.port;
    const sale = Object.assign(this.look(sp), {
      name: sp.name, meta: plat(sv.platform) + ' · ' + (sv.qty > 1 ? sv.qty + ' articles' : '1 article') + ' · ' + this.d3(sv.date),
      margin: this.signed(sr.margin), marginColor: col(sr.margin),
      rateText: sr.price > 0 ? 'soit ' + this.pct(sr.margin / sr.price * 100) + ' du prix de vente' : '',
      missing: sr.missing,
      missingText: 'Port non renseigné : marge estimée avec le port par défaut ' + plat(sv.platform) + ' (' + this.eur(sr.port) + '). « Modifier la vente » pour le corriger.',
      price: this.eur(sr.price), platform: plat(sv.platform),
      feeRule: sr.commission > 0 && sr.price > 0 ? 'soit ' + this.pct(sr.commission / sr.price * 100) + ' du prix' : 'aucune commission',
      portRule: sr.missing ? 'estimé (par défaut)' : 'saisi',
      commission: this.minus(sr.commission), port: this.minus(sr.port), cost: this.minus(sr.cost),
      costRule: sr.costUnknown ? 'prix d’achat inconnu : coût compté à 0' : 'PRU ' + this.eur(sr.pru) + (sv.qty > 1 ? ' × ' + sv.qty : '') + ' au ' + this.d2(sv.date) + ', figé',
      barCost: Math.max(sr.cost, 0).toFixed(2), barFees: Math.max(sfees, 0).toFixed(2), barMargin: Math.max(sr.margin, 0).toFixed(2),
      marginDisplay: sr.margin > 0 ? 'block' : 'none', feesRadius: sr.margin > 0 ? '0' : '0 4px 4px 0',
      insight: sr.gross > 0 ? 'Les frais et le port ont absorbé ' + this.pct(sfees / sr.gross * 100) + ' de ta marge brute (' + this.eur(sr.gross) + ').' : 'Cette vente ne couvre pas son coût d’achat.',
      by: who[sv.by || 'toi'], date: this.d2(sv.date)
    });
    // Lots
    const lotsAll = s.purchases.filter(a => a.lines.length > 1);
    const lot = lotsAll.find(a => a.id === 'a5') || lotsAll[0];
    let lots = { title: 'Aucun lot', meta: '', total: '', count: '', methods: [], methodHelp: '', lines: [], impacts: [] };
    if (lot) {
      const alloc = c.buys[lot.id] || lot.lines.map(() => 0), nArt = lot.lines.reduce((k, l) => k + l.qty, 0), pids = lot.lines.map(l => l.pid);
      const impacts = sorted.filter(v => pids.indexOf(v.pid) >= 0 && v.date >= lot.date).slice(0, 3).map((v, i) => {
        const r = c.sales[v.id], p = P[v.pid];
        return { label: 'Vente ' + p.name + ' · ' + this.d2(v.date), sub: plat(v.platform) + ' · ' + this.eur(r.price), value: this.signed(r.margin), color: col(r.margin), border: line(i) };
      });
      let lat = 0;
      pids.forEach(pid => { const st = c.stock[pid]; lat += x.val(P[pid]) * (st.qty - st.unk) - st.cost; });
      impacts.push({ label: 'Articles encore en collection', sub: 'plus-value latente', value: this.signed(lat), color: col(lat), border: line(impacts.length) });
      lots = {
        title: 'Lot du ' + this.d3(lot.date), meta: lot.where + ' · acheté par ' + who[lot.by || 'toi'],
        total: this.eur(lot.total), count: nArt + ' articles',
        methods: [['value', 'Valeur de marché'], ['equal', 'Parts égales']].map(([k, label]) => Object.assign(
          { label: label, on: s.lotMethod === k, pick: () => this.setState({ lotMethod: k }) }, this.chip(s.lotMethod === k))),
        methodHelp: s.lotMethod === 'equal' ? 'Même coût pour chaque article, quelle que soit sa valeur.' : 'Au prorata de la cote de chaque article au ' + this.d2(lot.date) + ', tirée de l’archive maison.',
        lines: lot.lines.map((l, k) => { const p = P[l.pid]; return Object.assign(this.look(p), { name: p.name, meta: '×' + l.qty + ' · réf. ' + this.eur(l.ref || 0) + ' / u', unitCost: this.eur(alloc[k] / l.qty) + ' / u', total: this.eur(alloc[k]) }); }),
        impacts: impacts
      };
    }
    // Associés
    const toiPart = this.r2(margin * s.split / 100), parts = { toi: toiPart, sam: this.r2(margin) - toiPart };
    const apports = { toi: 0, sam: 0 };
    s.purchases.forEach(a => { apports[a.by || 'toi'] += this.num(a.total) || 0; });
    const team = {
      members: ['toi', 'sam'].map(k => ({
        initial: k === 'toi' ? 'T' : 'S', name: who[k], role: k === 'toi' ? 'Compte principal' : 'Associé·e',
        avatarBg: k === 'toi' ? '#B9C5FF' : '#FFC9A8', shareLabel: (k === 'toi' ? s.split : 100 - s.split) + ' % de la marge nette',
        amount: this.signed(parts[k]), color: col(parts[k]), apport: this.eur(apports[k])
      })),
      rules: [50, 60, 70].map(n => Object.assign({ label: n + ' / ' + (100 - n), on: s.split === n, pick: () => this.setState({ split: n }) }, this.chip(s.split === n))),
      total: 'Marge nette sur ' + periodLabels[s.period] + ' : ' + this.signed(margin)
    };
    // Frais (édition)
    const feesEdit = this.platformKeys().map(k => {
      const pf = s.platforms[k], exFee = 100 * (this.num(pf.rate) || 0) / 100 + (this.num(pf.fixed) || 0);
      return {
        label: pf.label, rate: this.fmtIn(pf.rate), fixed: this.fmtIn(pf.fixed), port: this.fmtIn(pf.port),
        onRate: e => this.setPlat(k, 'rate', e.target.value), onFixed: e => this.setPlat(k, 'fixed', e.target.value), onPort: e => this.setPlat(k, 'port', e.target.value),
        example: 'Exemple : vente à 100,00 € → commission ' + this.eur(exFee) + ', port ' + this.eur(this.num(pf.port) || 0) + '.'
      };
    });
    const io = {
      mapping: [['date', 'Date'], ['article', 'Carte ou produit'], ['prix', 'Prix payé ou vendu'], ['qte', 'Quantité'], ['etat', 'Langue et état']].map(([from, to]) => ({ from: from, to: to })),
      exportInfo: (s.purchases.length + s.sales.length) + ' opérations · ' + x.owned.length + ' références · CSV UTF-8, séparateur ;'
    };
    return { periods: periods, salesV: salesV, sale: sale, sv: sv, lots: lots, team: team, feesEdit: feesEdit, io: io };
  }

  // Saisie : ajout manuel à la collection, ou vente faite ailleurs.
  vSheet(x) {
    const s = x.s, c = x.c, P = x.P, f = s.f, isSell = s.sheet === 'sell', isBuy = !isSell, col = x.col;
    const segOn = on => ({ bg: on ? '#A8B6FF' : 'transparent', fg: on ? '#0B1120' : '#C9D3EA' });
    const sb = segOn(isBuy), ss = segOn(isSell);
    const sh = {
      isSell: isSell, isBuy: isBuy, buyBg: sb.bg, buyFg: sb.fg, sellBg: ss.bg, sellFg: ss.fg,
      toBuy: () => this.switchSheet('buy'), toSell: () => this.switchSheet('sell'),
      qty: String(f.qty), dec: () => this.setF({ qty: Math.max(1, f.qty - 1) }), inc: () => this.setF({ qty: Math.min(99, f.qty + 1) }),
      price: f.price, onPrice: e => this.setF({ price: e.target.value }),
      hasPriceHint: f.qty > 1, priceHint: 'Prix total pour ' + f.qty + ' articles',
      byLabel: isSell ? 'Vendu par' : 'Ajouté par',
      people: ['toi', 'sam'].map(k => Object.assign({ label: x.who[k], sel: f.by === k, pick: () => this.setF({ by: k }) }, this.choice(f.by === k)))
    };
    const tile = (p, right, sel, pick) => { const lk = this.look(p); return Object.assign(lk, this.choice(sel), { art: lk.bg, name: p.name, right: right, sel: sel, pick: pick, label: p.name + ' · ' + right }); };
    if (isSell) {
      const d = this.draftSale(s), others = s.sales.filter(v => v.id !== d.id);
      const cB = this.compute(Object.assign({}, s, { sales: others }));
      const avail = cB.stock[f.pid] ? cB.stock[f.pid].qty : 0;
      const r = this.compute(Object.assign({}, s, { sales: others.concat([d]) })).sales[d.id];
      const pf = s.platforms[f.platform] || s.platforms.vinted;
      const error = !(d.price > 0) ? 'Indique le prix de vente.' : (avail <= 0 ? 'Cet article n’est plus dans ta collection.' : (f.qty > avail ? 'Tu n’en as que ' + avail + '.' : ''));
      Object.assign(sh, {
        title: f.editId ? 'Modifier la vente' : 'J’ai vendu', priceLabel: 'Prix de vente (€)',
        products: x.cat.filter(p => cB.stock[p.id].qty > 0 || p.id === f.pid).map(p => tile(p, '×' + cB.stock[p.id].qty, p.id === f.pid, () => this.setF({ pid: p.id, qty: 1 }))),
        platforms: this.platformKeys().map(k => Object.assign({ label: s.platforms[k].label, sel: f.platform === k, pick: () => this.setF({ platform: k, port: null, commission: null }) }, this.choice(f.platform === k))),
        port: f.port === null ? this.fmtIn(this.num(pf.port) || 0) : f.port, onPort: e => this.setF({ port: e.target.value }),
        portHint: 'Par défaut pour ' + pf.label + ' : ' + this.eur(this.num(pf.port) || 0),
        commission: f.commission === null ? this.fmtIn(this.r2(d.auto)) : f.commission, onCommission: e => this.setF({ commission: e.target.value }),
        commissionHint: 'Règle ' + pf.label + ' : ' + this.feeRule(pf),
        previewTitle: 'Marge nette estimée',
        big: d.price > 0 ? this.signed(r.margin) : '—', bigColor: d.price > 0 ? col(r.margin) : '#9AA8C3',
        lines: [
          { label: 'Commission ' + pf.label, value: this.minus(r.commission) },
          { label: 'Port et emballage', value: this.minus(r.port) },
          { label: 'Coût d’achat (PRU ' + this.eur(r.pru) + (f.qty > 1 ? ' × ' + f.qty : '') + ')', value: this.minus(r.cost) }
        ],
        error: error, hasError: error !== '', disabled: error !== '', saveOpacity: error ? '0.45' : '1',
        saveLabel: f.editId ? 'Enregistrer les modifications' : 'Enregistrer la vente', save: () => this.saveSell()
      });
    } else {
      const pB = P[f.pid] && !P[f.pid].release ? P[f.pid] : x.cat[0], st0 = c.stock[pB.id], price = this.num(f.price), ok = price > 0;
      const u = x.val(pB), add = u * f.qty, after = this.tierOf(x.total + add);
      Object.assign(sh, {
        title: 'Ajouter à ma collection', priceLabel: 'Prix payé (€) · facultatif',
        products: x.cat.filter(p => !p.release).map(p => tile(p, (c.stock[p.id].qty > 0 ? '×' + c.stock[p.id].qty + ' · ' : '') + this.eur(x.val(p)), p.id === pB.id, () => this.setF({ pid: p.id }))),
        platforms: [], port: '', onPort: null, portHint: '', commission: '', onCommission: null, commissionHint: '',
        previewTitle: 'Valeur ajoutée',
        big: this.signed(add), bigColor: '#F3F6FC',
        lines: [
          { label: 'Cote PKM unitaire', value: this.eur(u) },
          { label: 'Plus-value à l’ajout', value: ok ? this.signed(add - price) : 'prix non renseigné' },
          { label: 'Collection', value: this.eur(x.total) + ' → ' + this.eur(x.total + add) },
          { label: 'Palier', value: after.i > x.tier.i ? 'Nouveau : ' + after.cur.name + ' !' : after.cur.name + ' · ' + Math.floor(after.pct) + ' %' }
        ],
        error: '', hasError: false, disabled: false, saveOpacity: '1',
        saveLabel: 'Ajouter à ma collection', save: () => this.saveBuy()
      });
    }
    return sh;
  }

  // ——— territoire ———
  km(n) { return n.toLocaleString('fr-FR') + ' km'; }
  // Boutiques retenues par les filtres, triées par probabilité puis par distance.
  storeRows(s, P) {
    const radius = Number(s.tradius) || 10, minProb = s.tprob === 'high' ? 70 : s.tprob === 'mid' ? 40 : 0;
    return this.stores().map(st => {
      const arr = st.arrivals.filter(a => this.matchProd(P[a.pid], s.tprod)).sort((a, b) => b.prob - a.prob);
      return { st: st, arr: arr, best: arr.length ? arr[0].prob : -1 };
    }).filter(r => r.arr.length && r.st.dist <= radius && r.best >= minProb)
      .sort((a, b) => b.best - a.best || a.st.dist - b.st.dist);
  }
  vTerritory(x) {
    // Carte schématique 358 × 210 : distance à l'échelle racine carrée (les boutiques proches restent lisibles).
    const s = x.s, P = x.P, I = this.img(), cx = 179, cy = 105, sc = d => Math.sqrt(d) * 40;
    const radius = Number(s.tradius) || 10, rows = this.storeRows(s, P);
    const pos = st => { const a = st.ang * Math.PI / 180; return { x: cx + Math.cos(a) * sc(st.dist), y: cy + Math.sin(a) * sc(st.dist) * 0.72 }; };
    const chips = (defs, cur, key) => defs.map(([v, label]) => Object.assign({ label: label, on: cur === v, pick: () => this.setState({ [key]: v }) }, this.chip(cur === v)));
    const partners = rows.filter(r => r.st.partner).length;
    const rel = this.catalog().find(p => p.release);
    const daysTo = rel ? Math.round((Date.parse(rel.release) - Date.parse(this.today())) / 86400000) : 0;
    return {
      prods: chips([['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['value', 'Objets de valeur']], s.tprod, 'tprod'),
      probs: chips([['all', 'Toutes'], ['mid', 'Moyenne et +'], ['high', 'Forte']], s.tprob, 'tprob'),
      radii: chips([['3', '3 km'], ['5', '5 km'], ['10', '10 km']], String(s.tradius), 'tradius'),
      ringRx: sc(radius).toFixed(1), ringRy: (sc(radius) * 0.72).toFixed(1),
      pins: rows.map(r => {
        const lv = this.probLevel(r.best), p = pos(r.st);
        return { left: (p.x - 22).toFixed(1) + 'px', top: (p.y - 22).toFixed(1) + 'px', fill: lv.color, text: r.best + ' %',
          label: r.st.name + ' : probabilité ' + lv.label.toLowerCase() + ', ' + r.best + ' %', open: () => this.push('store', { storeId: r.st.id }) };
      }),
      mapLabel: 'Carte des ' + rows.length + ' magasins retenus autour de toi, dans un rayon de ' + radius + ' km',
      count: rows.length + (rows.length > 1 ? ' magasins' : ' magasin') + ' · ' + partners + (partners > 1 ? ' partenaires PKM' : ' partenaire PKM') + ' · rayon ' + radius + ' km',
      empty: rows.length === 0,
      list: rows.map((r, i) => {
        const lv = this.probLevel(r.best), a0 = r.arr[0], kd = this.storeKind(r.st.kind);
        return {
          name: r.st.name, kind: kd[0], icon: kd[1], dist: this.km(r.st.dist), partner: r.st.partner,
          prob: r.best + ' %', level: lv.label, color: lv.color, tint: lv.tint,
          when: a0.when, src: 'Source : ' + a0.src.map(c => this.srcLabel(c)).join(' · '),
          chips: r.arr.slice(0, 2).map(a => ({ name: P[a.pid].name, prob: a.prob + ' %', color: this.probLevel(a.prob).color })),
          border: x.line(i), open: () => this.push('store', { storeId: r.st.id })
        };
      }),
      release: rel ? {
        logo: I[rel.set], date: 'jeu. ' + this.d2(rel.release), days: 'dans ' + daysTo + ' jours',
        text: 'Règne Delta : ETB, display, bundle', note: 'Précommandes chez 1 partenaire',
        open: () => this.push('item', { itemId: rel.id })
      } : { logo: '', date: '', days: '', text: '', note: '', open: null }
    };
  }
  vStore(x) {
    const s = x.s, P = x.P, all = this.stores(), st = all.find(z => z.id === s.storeId) || all[0], kd = this.storeKind(st.kind);
    const arr = st.arrivals.slice().sort((a, b) => b.prob - a.prob), best = arr[0].prob, lv = this.probLevel(best), on = !!s.alerts[st.id];
    return {
      name: st.name, kind: kd[0], icon: kd[1], dist: this.km(st.dist), partner: st.partner, hours: st.hours, open: st.open,
      prob: best + ' %', level: lv.label, color: lv.color, tint: lv.tint,
      partnerNote: st.partner ? 'Boutique partenaire PKM : elle annonce ses arrivages dans l’app.' : 'Pas encore partenaire : estimation tirée des signalements et de l’historique.',
      arrivals: arr.map((a, i) => {
        const p = P[a.pid], l = this.probLevel(a.prob), kk = this.cote(p);
        return Object.assign(this.look(p), {
          name: p.name, aria: 'Voir la fiche : ' + p.name, when: a.when, prob: a.prob + ' %', level: l.label, color: l.color, tint: l.tint, barW: a.prob + '%',
          srcs: a.src.map(c => ({ label: this.srcLabel(c) })), cote: kk !== null ? 'Cote ' + this.eur(kk) : 'Précommande ~' + this.eur(p.low) + ' (demandé)',
          border: x.line(i), openItem: () => this.push('item', { itemId: p.id })
        });
      }),
      history: st.history.map((hh, i) => ({ date: this.d2(hh.date), text: hh.text, border: x.line(i) })),
      alertOn: on, alertLabel: on ? 'Alerte activée' : 'Me prévenir des arrivages',
      alertBg: on ? 'transparent' : '#A8B6FF', alertFg: on ? '#3DDC84' : '#0B1120', alertBc: on ? 'rgba(61, 220, 132, 0.5)' : '#A8B6FF',
      toggleAlert: () => this.toggleAlert(st.id),
      route: () => this.say('Démo : l’itinéraire s’ouvrirait dans ton application de cartes')
    };
  }

  renderVals() {
    const s = this.st(), c = this.compute(s), cat = this.catalog(), P = c.byId;
    const col = n => (this.r2(n) < 0 ? '#FF6B6B' : '#3DDC84');
    const val = p => this.unitVal(p, s.valuation);
    const hist = {}, ch7 = {};
    cat.forEach(p => { hist[p.id] = this.history(p); ch7[p.id] = this.change7(hist[p.id]); });
    const owned = cat.filter(p => c.stock[p.id].qty > 0);
    let total = 0, cost = 0, knownVal = 0, unk = 0, nCards = 0, nSealed = 0;
    owned.forEach(p => {
      const st = c.stock[p.id], u = val(p);
      total += u * st.qty; knownVal += u * (st.qty - st.unk); cost += st.cost; unk += st.unk;
      if (p.type === 'card') nCards += st.qty; else nSealed += st.qty;
    });
    const tier = this.tierOf(total), prof = this.profileOf(s, c, total), C = this.cats();
    // Profil automatique ; l'anticipé (inscription) sert tant que la collection compte moins de 10 articles.
    const catKey = this.effCat(s, prof);
    const x = {
      s: s, c: c, cat: cat, P: P, col: col, val: val, hist: hist, ch7: ch7, owned: owned, total: total, cost: cost, knownVal: knownVal,
      unk: unk, nCards: nCards, nSealed: nSealed, tier: tier, prof: prof, C: C, catKey: catKey,
      mask: t => (s.masked ? '•••• €' : t), line: i => (i === 0 ? 'none' : '1px solid #1E2B45'),
      plat: k => (s.platforms[k] ? s.platforms[k].label : k), who: { toi: 'Toi', sam: 'Sam' }
    };
    const advOnly = ['lots', 'fees', 'team', 'io'];
    const screen = !s.adv && advOnly.indexOf(s.screen) >= 0 ? 'settings' : s.screen;
    const side = this.vMarginSide(x), item = this.vItem(x);
    const sec = this.section(Object.assign({}, s, { screen: screen }));
    const store = this.vStore(x);
    const titles = { collection: 'Collection', market: 'Marché', territory: 'Territoire', profile: 'Profil', tiers: 'Paliers et succès', settings: 'Réglages', sales: 'Ventes et marge', lots: 'Lots', fees: 'Frais par plateforme', team: 'Associés', io: 'Importer / exporter' };
    let title = titles[screen] || '', subtitle = '';
    if (screen === 'item') { title = item.name; subtitle = item.sub; }
    if (screen === 'sale') { title = 'Vente du ' + side.sale.date; subtitle = side.sale.name; }
    if (screen === 'sales') subtitle = 'Tes ventes faites ailleurs : frais et port déduits';
    if (screen === 'store') { title = store.name; subtitle = store.kind + ' · ' + store.dist; }
    const detail = ['item', 'store', 'profile', 'tiers', 'settings', 'sales', 'sale', 'lots', 'fees', 'team', 'io'].indexOf(screen) >= 0;
    const syncText = ['home', 'collection', 'market', 'item'].indexOf(screen) >= 0 ? 'Cotes mises à jour automatiquement · 3 oct. à 07:00'
      : (['territory', 'store'].indexOf(screen) >= 0 ? 'Estimations mises à jour en continu · 3 oct. à 07:00' : '');
    const tabInfo = k => ({ fg: sec === k ? '#FFFFFF' : '#7D8BA8', dot: sec === k ? '#A8B6FF' : 'transparent', cur: sec === k ? 'page' : 'false' });
    const th = tabInfo('home'), tc = tabInfo('collection'), tm = tabInfo('market'), tt = tabInfo('territory');
    const isScan = screen === 'scan';
    return {
      ui: {
        title: title, subtitle: subtitle, hasSubtitle: subtitle !== '',
        headerHome: screen === 'home', headerBig: ['collection', 'market', 'territory'].indexOf(screen) >= 0, headerDetail: detail,
        hasSubRow: !isScan && (syncText !== '' || s.adv), syncText: syncText,
        adv: s.adv, simple: !s.adv,
        masked: s.masked, maskLabel: s.masked ? 'Afficher les montants' : 'Masquer les montants', eyeSlash: s.masked ? 'M4 4l16 16' : '',
        avatar: this.img().avatar, ring: tier.cur.color, profileLabel: 'Mon profil · palier ' + tier.cur.name,
        isHome: screen === 'home', isCollection: screen === 'collection', isItem: screen === 'item', isMarket: screen === 'market',
        isProfile: screen === 'profile', isTerritory: screen === 'territory', isStore: screen === 'store', isTiers: screen === 'tiers', isSettings: screen === 'settings', isSales: screen === 'sales',
        isSale: screen === 'sale', isLots: screen === 'lots', isFees: screen === 'fees', isTeam: screen === 'team', isIO: screen === 'io',
        isScan: isScan, chrome: !isScan,
        sheetOpen: !!s.sheet, scanSheetOpen: isScan && !!s.scanSheet && !s.sheet, onbOpen: s.onb > 0,
        hasToast: !!s.toast, toast: s.toast || '', toastBottom: isScan ? '150px' : '98px'
      },
      tab: {
        homeFg: th.fg, homeDot: th.dot, homeCur: th.cur, collFg: tc.fg, collDot: tc.dot, collCur: tc.cur,
        mktFg: tm.fg, mktDot: tm.dot, mktCur: tm.cur, terFg: tt.fg, terDot: tt.dot, terCur: tt.cur
      },
      home: this.vHome(x), coll: this.vCollection(x), it: item, scan: this.vScan(x), sr: this.vScanResult(x),
      mk: this.vMarket(x), ter: this.vTerritory(x), store: store, pf: this.vProfile(x), tr: this.vTiers(x), set: this.vSettings(x), ob: this.vOnb(x),
      periods: side.periods, salesV: side.salesV, sale: side.sale, lots: side.lots, team: side.team, feesEdit: side.feesEdit, io: side.io,
      sh: this.vSheet(x),
      goBack: () => this.pop(),
      tabHome: () => this.tab('home'), tabCollection: () => this.tab('collection'), tabMarket: () => this.tab('market'), tabTerritory: () => this.tab('territory'),
      goProfile: () => (s.screen === 'profile' ? null : this.push('profile')),
      openScan: () => this.openScan(),
      closeSheet: () => this.setState({ sheet: null, f: this.formSeed({}) }),
      toggleAdv: () => this.toggleAdv(),
      toggleMask: () => this.setState({ masked: !s.masked }),
      goTiers: () => this.push('tiers'), goSales: () => this.push('sales'), goSettings: () => this.push('settings'),
      goTeam: () => this.push('team'), goLots: () => this.push('lots'), goFees: () => this.push('fees'), goIO: () => this.push('io'),
      addThis: () => this.openSheet('buy', s.itemId),
      notify: () => this.say('Alerte activée : tu seras prévenu à la sortie et aux premières ventes'),
      sellThis: () => this.openSheet('sell', s.itemId),
      newSale: () => this.openSheet('sell'),
      editSale: () => this.editSale(),
      chartLeave: () => this.setState({ hi: null }),
      replayOnb: () => this.setState({ onb: 1 }),
      demoImport: () => this.say('Démo : l’import n’est pas branché dans la maquette'),
      demoExport: () => this.say('Démo : export CSV de ' + (s.purchases.length + s.sales.length) + ' opérations')
    };
  }
}

  // Images servies avec la page.
  const IMG = {"k1":"img/card-pikachu-ex.webp","k2":"img/card-mega-meganium-ex.webp","k3":"img/card-favianos-ex.webp","k4":"img/card-jirachi-ex.webp","k5":"img/card-pikachu-zekrom-gx.webp","k6":"img/card-mewtwo-slab.webp","avatar":"img/avatar-jirachi.webp","megaEvo":"img/logo-mega-evolution.webp","delta":"img/logo-regne-delta.webp","anniv":"img/logo-30-anniversaire.webp","nuit":"img/logo-nuit-noire.webp","chaos":"img/logo-chaos-ascendant.webp"};
  Component.prototype.img = function () { return IMG; };
  // ——— Catalogue complet TCGdex ———
  // web/data/cards.json est reconstruit chaque jour par GitHub Actions (.github/workflows/tcgdex.yml).
  // Les cartes de la maquette restent la collection de démo ; le Marché cherche dans tout le catalogue,
  // et une carte ouverte ou ajoutée rejoint le catalogue de l'app (état « extra »).
  // Images : CDN TCGdex (assets.tcgdex.net), jamais stockées chez nous.
  const TCG = { status: 'loading', doc: null, F: null, rows: [], byId: {}, items: {} };
  const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Raretés comptées comme « ultra rares » pour le profil automatique.
  const UR_RARITY = /ultra|hyper|sp[ée]cial|secr|magnifique|couronne|chromatique/i;
  const NO_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 88"><rect width="63" height="88" rx="4" fill="#1A2645"/><text x="31.5" y="52" font-size="26" text-anchor="middle" fill="#7D8BA8" font-family="sans-serif">?</text></svg>');
  const LIMIT = 40;

  TCG.load = function (doc) {
    const F = {};
    doc.fields.forEach((k, i) => { F[k] = i; });
    TCG.doc = doc; TCG.F = F;
    TCG.rows = doc.cards.map(r => {
      const set = doc.sets[r[F.set]] || [r[F.set], '', '', ''];
      return { r: r, name: fold(r[F.name]), hay: fold([r[F.name], set[0], set[1], r[F.num], r[F.rarity]].join(' ')) };
    });
    TCG.rows.forEach(x => { TCG.byId[x.r[F.id]] = x; });
    TCG.status = 'ready';
  };
  // Carte TCGdex au format des articles de la maquette (mêmes champs de prix : cm, low, ebay, tcp, avg30).
  TCG.item = function (id) {
    if (TCG.items[id]) return TCG.items[id];
    const x = TCG.byId[id];
    if (!x) return null;
    const r = x.r, F = TCG.F, set = TCG.doc.sets[r[F.set]] || [r[F.set], '', '', ''], img = r[F.img];
    const base = img ? (/^https?:/.test(img) ? img : TCG.doc.img + img) : '';
    const rarity = r[F.rarity] || '';
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
    const p = {
      id: id, tcg: true, type: 'card', code: 'CRT', name: r[F.name], rarity: rarity, ur: UR_RARITY.test(rarity),
      sub: [rarity || 'Rareté non renseignée', set[0], 'n° ' + r[F.num]].join(' · '), setName: set[0],
      img: base ? base + '/low.webp' : NO_IMG, imgHi: base ? base + '/high.webp' : NO_IMG, logo: '', set: r[F.set],
      lang: 'FR', grade: null, release: null,
      cm: r[F.cm], low: r[F.low], ebay: null, tcp: r[F.tcp], avg30: r[F.avg30], upd: r[F.upd], seed: seed
    };
    TCG.items[id] = p;
    return p;
  };
  // Recherche sans accents ni casse, tous les mots doivent apparaître (nom, extension, série, numéro, rareté).
  // Ordre : nom exact, puis nom qui commence par la recherche, puis cote décroissante.
  TCG.search = function (q, limit) {
    const words = fold(q).split(/\s+/).filter(Boolean), fq = fold(q).trim(), F = TCG.F;
    if (!words.length) return { total: 0, items: [] };
    const hits = [];
    for (const x of TCG.rows) {
      if (words.every(w => x.hay.indexOf(w) >= 0)) {
        const v = x.r[F.cm] || x.r[F.tcp] || 0;
        hits.push({ x: x, rank: x.name === fq ? 0 : x.name.indexOf(fq) === 0 ? 1 : 2, v: v });
      }
    }
    hits.sort((a, b) => a.rank - b.rank || b.v - a.v);
    return { total: hits.length, items: hits.slice(0, limit).map(h => TCG.item(h.x.r[F.id])) };
  };

  const proto = Component.prototype;
  const baseCatalog = proto.catalog;
  proto.catalog = function () {
    const base = baseCatalog.call(this), extra = (this.state && this.state.extra) || [];
    return extra.length ? base.concat(extra.map(TCG.item).filter(Boolean)) : base;
  };
  // Pas d'historique inventé pour les vraies cartes : la courbe viendra de l'archive quotidienne.
  const baseHistory = proto.history;
  proto.history = function (p) { return p.tcg ? null : baseHistory.call(this, p); };
  proto.openTcg = function (id) {
    const ex = this.st().extra || [];
    this.push('item', { itemId: id, extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) });
  };

  const baseMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseMarket.call(this, x), s = x.s, q = String(s.mq || '').trim();
    if (TCG.status === 'loading') { r.count = q ? 'Chargement du catalogue complet…' : r.count; return r; }
    if (TCG.status === 'error') { r.count = r.count + ' · catalogue complet indisponible'; return r; }
    const total = TCG.rows.length.toLocaleString('fr-FR');
    if (q.length < 2 || s.mfilter === 'soon') { r.count = r.count + ' · cherche parmi ' + total + ' cartes'; return r; }
    const res = TCG.search(q, LIMIT), start = r.list.length;
    r.list = r.list.concat(res.items.map((p, i) => {
      const k = this.cote(p), st = x.c.stock[p.id];
      return Object.assign(this.look(p), {
        name: p.name, sub: p.sub, border: x.line(start + i), owned: !!(st && st.qty > 0),
        cote: k !== null ? this.eur(k) : '—', coteLabel: k !== null ? 'cote PKM' : 'sans prix',
        right: k !== null ? 'cote PKM' : 'sans prix', rightColor: '#9AA8C3',
        open: () => this.openTcg(p.id)
      });
    }));
    r.empty = r.list.length === 0;
    r.count = res.total === 0 ? 'Aucune carte trouvée parmi ' + total
      : (res.total > LIMIT ? LIMIT + ' premières cartes sur ' + res.total.toLocaleString('fr-FR') : res.total + (res.total > 1 ? ' cartes trouvées' : ' carte trouvée')) + ' · catalogue TCGdex';
    return r;
  };

  const baseItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    it.hasChart = it.hasCote && !!x.hist[p.id];
    it.canAdd = it.hasCote || !!p.tcg;
    it.upcoming = it.noCote && !p.tcg;
    if (p.tcg) {
      it.img = p.imgHi;
      const day = p.upd ? ', prix du ' + this.d2(p.upd) : '';
      it.sources.forEach(so => { so.sub = so.sub.replace(' · fichier public du 03/10', ' · via TCGdex' + day).replace(' · annonces du 03/10', ' · via TCGdex' + day); });
      const n = [p.cm, p.tcp].filter(v => typeof v === 'number').length;
      if (n === 2) it.coteRule = 'Cote PKM = moyenne des 2 prix « marché » disponibles (tendance Cardmarket et TCGplayer). Le prix demandé est affiché, jamais compté.';
      if (it.noCote) it.release = 'Pas encore de prix « marché » pour cette carte (Cardmarket et TCGplayer, via TCGdex). Tu peux quand même l’ajouter à ta collection.';
      if (it.hasCote) it.change = 'Courbe après quelques jours d’archivage';
    }
    return it;
  };

  // Fiche « Ajouter » : l'article choisi passe en tête de la liste.
  const baseSheet = proto.vSheet;
  proto.vSheet = function (x) {
    const sh = baseSheet.call(this, x);
    if (sh.isBuy && sh.products) {
      const i = sh.products.findIndex(t => t.sel);
      if (i > 0) sh.products = [sh.products[i]].concat(sh.products.slice(0, i), sh.products.slice(i + 1));
    }
    return sh;
  };

  // Scan : « Ce n'est pas le bon article ? » ouvre la recherche du Marché.
  const baseScanResult = proto.vScanResult;
  proto.vScanResult = function (x) {
    const r = baseScanResult.call(this, x);
    r.wrong = () => { this.setState({ scanSheet: false, screen: 'market', stack: [], hi: null }); };
    return r;
  };
  // Carte du territoire : repères placés en pourcentage pour suivre la largeur de l'écran.
  const vTerritory = Component.prototype.vTerritory;
  Component.prototype.vTerritory = function (x) {
    const r = vTerritory.call(this, x);
    r.pins.forEach(p => {
      const cx = parseFloat(p.left) + 22, cy = parseFloat(p.top) + 22;
      p.left = 'calc(' + (cx / 358 * 100).toFixed(2) + '% - 22px)';
      p.top = 'calc(' + (cy / 210 * 100).toFixed(2) + '% - 22px)';
    });
    return r;
  };
  const render = (function () {
const { createElementVNode: _createElementVNode, createTextVNode: _createTextVNode, openBlock: _openBlock, createElementBlock: _createElementBlock, normalizeStyle: _normalizeStyle, createCommentVNode: _createCommentVNode, toDisplayString: _toDisplayString, renderList: _renderList, Fragment: _Fragment, createStaticVNode: _createStaticVNode } = Vue

const _hoisted_1 = {
  class: "pkm-root",
  style: {"width":"100%","height":"100%","box-sizing":"border-box","position":"relative","overflow":"hidden","display":"flex","flex-direction":"column","background":"#0B1120","color":"#F3F6FC","font-family":"'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif","font-size":"15px","line-height":"1.4"}
}
const _hoisted_2 = {
  key: 0,
  style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1fr) auto minmax(0, 1fr)","align-items":"center","gap":"8px","padding":"14px 16px 8px"}
}
const _hoisted_3 = { style: {"display":"flex","align-items":"center","gap":"8px"} }
const _hoisted_4 = { style: {"width":"30px","height":"30px","border-radius":"10px","background":"#3D63FF","display":"flex","align-items":"center","justify-content":"center","box-shadow":"0 6px 16px rgba(61, 99, 255, 0.35)"} }
const _hoisted_5 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#FFFFFF","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_6 = ["onClick", "aria-label"]
const _hoisted_7 = ["src"]
const _hoisted_8 = {
  key: 1,
  style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","gap":"12px","padding":"18px 16px 8px"}
}
const _hoisted_9 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"32px","line-height":"1.1","font-weight":"700","letter-spacing":"-0.03em"} }
const _hoisted_10 = ["onClick", "aria-label"]
const _hoisted_11 = ["src"]
const _hoisted_12 = {
  key: 2,
  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"14px 16px 8px"}
}
const _hoisted_13 = ["onClick"]
const _hoisted_14 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_15 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_16 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"20px","line-height":"1.2","font-weight":"600","letter-spacing":"-0.02em","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_17 = {
  key: 0,
  style: {"font-size":"13px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"}
}
const _hoisted_18 = {
  key: 3,
  style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","gap":"8px","min-height":"22px","padding":"0 16px 8px","font-size":"12.5px","color":"#7D8BA8"}
}
const _hoisted_19 = {
  key: 0,
  style: {"flex":"none","padding":"3px 10px","border-radius":"999px","background":"rgba(168, 182, 255, 0.14)","color":"#B9C5FF","font-size":"12px","font-weight":"700"}
}
const _hoisted_20 = { style: {"flex":"1","min-height":"0","overflow-y":"auto","scrollbar-width":"none","padding":"4px 16px 118px","box-sizing":"border-box","display":"flex","flex-direction":"column","gap":"14px"} }
const _hoisted_21 = {
  "aria-label": "Valeur de ma collection",
  style: {"flex":"none","padding":"16px 18px 14px","border-radius":"24px","border":"1px solid #24345C","background":"radial-gradient(120% 85% at 100% 0%, rgba(98, 122, 255, 0.26), rgba(98, 122, 255, 0) 62%), #121C33","display":"flex","flex-direction":"column","gap":"6px"}
}
const _hoisted_22 = { style: {"display":"flex","justify-content":"space-between","align-items":"center","gap":"10px"} }
const _hoisted_23 = { style: {"display":"flex","align-items":"center","gap":"2px","font-size":"14px","font-weight":"600","color":"#C9D3EA"} }
const _hoisted_24 = ["onClick", "aria-label", "aria-pressed"]
const _hoisted_25 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_26 = ["d"]
const _hoisted_27 = { style: {"font-family":"'Sora', sans-serif","font-size":"40px","line-height":"1.05","font-weight":"700","letter-spacing":"-0.035em"} }
const _hoisted_28 = { style: {"font-size":"13px","color":"#9AA8C3"} }
const _hoisted_29 = ["aria-label"]
const _hoisted_30 = ["d"]
const _hoisted_31 = ["d"]
const _hoisted_32 = ["cx", "cy"]
const _hoisted_33 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-end","gap":"12px","margin-top":"6px","padding-top":"10px","border-top":"1px solid rgba(255, 255, 255, 0.08)"} }
const _hoisted_34 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_35 = { style: {"flex":"1","min-width":"0","font-size":"11.5px","line-height":"1.35","color":"#7D8BA8","text-align":"right"} }
const _hoisted_36 = {
  key: 0,
  style: {"font-size":"12px","color":"#F5B14C"}
}
const _hoisted_37 = ["onClick", "aria-label"]
const _hoisted_38 = {
  width: "54",
  height: "54",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_39 = ["d"]
const _hoisted_40 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"6px"} }
const _hoisted_41 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_42 = { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"700"} }
const _hoisted_43 = {
  "aria-hidden": "true",
  style: {"display":"block","height":"8px","border-radius":"4px","background":"#24345C","overflow":"hidden"}
}
const _hoisted_44 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_45 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_46 = ["onClick", "aria-label"]
const _hoisted_47 = ["src"]
const _hoisted_48 = ["src"]
const _hoisted_49 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_50 = { style: {"display":"flex","align-items":"center","gap":"6px","font-size":"12px","font-weight":"700","color":"#5EE0CF"} }
const _hoisted_51 = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_52 = { style: {"font-size":"14.5px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_53 = { style: {"font-size":"12.5px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_54 = { style: {"font-size":"12px","color":"#C9D3EA","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_55 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px"} }
const _hoisted_56 = {
  key: 0,
  "aria-label": "Premiers pas",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid rgba(94, 224, 207, 0.34)","background":"radial-gradient(120% 90% at 0% 0%, rgba(94, 224, 207, 0.16), rgba(94, 224, 207, 0) 60%), #111A2C","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_57 = { style: {"flex":"1","font-size":"14px"} }
const _hoisted_58 = {
  key: 0,
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  role: "img",
  "aria-label": "Fait",
  style: {"flex":"none","fill":"none","stroke":"#3DDC84","stroke-width":"2.6","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_59 = ["onClick"]
const _hoisted_60 = {
  key: 1,
  "aria-label": "Suggestion",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"14px 16px","border-radius":"20px","border":"1px solid rgba(255, 181, 71, 0.34)","background":"rgba(255, 181, 71, 0.08)"}
}
const _hoisted_61 = ["onClick"]
const _hoisted_62 = {
  key: 2,
  "aria-label": "Mouvements sur ta collection",
  style: {"flex":"none","display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px"}
}
const _hoisted_63 = ["onClick"]
const _hoisted_64 = { style: {"font-size":"12px","color":"#9AA8C3"} }
const _hoisted_65 = { style: {"display":"flex","align-items":"center","gap":"10px","min-width":"0"} }
const _hoisted_66 = ["src"]
const _hoisted_67 = ["src"]
const _hoisted_68 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_69 = { style: {"font-size":"13.5px","font-weight":"700","line-height":"1.25","display":"-webkit-box","-webkit-line-clamp":"2","-webkit-box-orient":"vertical","overflow":"hidden"} }
const _hoisted_70 = ["onClick"]
const _hoisted_71 = { style: {"font-size":"12px","color":"#9AA8C3"} }
const _hoisted_72 = { style: {"display":"flex","align-items":"center","gap":"10px","min-width":"0"} }
const _hoisted_73 = ["src"]
const _hoisted_74 = ["src"]
const _hoisted_75 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_76 = { style: {"font-size":"13.5px","font-weight":"700","line-height":"1.25","display":"-webkit-box","-webkit-line-clamp":"2","-webkit-box-orient":"vertical","overflow":"hidden"} }
const _hoisted_77 = {
  "aria-label": "Mes plus belles pièces",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_78 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"} }
const _hoisted_79 = ["onClick"]
const _hoisted_80 = { style: {"display":"flex","gap":"10px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px 2px"} }
const _hoisted_81 = ["onClick", "aria-label"]
const _hoisted_82 = ["src"]
const _hoisted_83 = { style: {"position":"absolute","left":"10px","right":"10px","top":"8px","height":"16px","border-radius":"4px","background":"#E9ECF2","color":"#1B2236","font-family":"'Sora', sans-serif","font-size":"9px","font-weight":"700","letter-spacing":"0.04em","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_84 = ["src"]
const _hoisted_85 = ["src"]
const _hoisted_86 = {
  width: "34",
  height: "34",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"42px","top":"80px","fill":"none","stroke":"rgba(255, 255, 255, 0.85)","stroke-width":"1.3","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_87 = ["d"]
const _hoisted_88 = { style: {"position":"absolute","top":"7px","left":"7px","padding":"0 4px","border":"1.2px solid rgba(255, 255, 255, 0.9)","border-radius":"5px","font-family":"'Sora', sans-serif","font-size":"9px","font-weight":"700","color":"#FFFFFF"} }
const _hoisted_89 = {
  key: 3,
  style: {"position":"absolute","left":"7px","top":"7px","display":"flex","align-items":"center","gap":"3px","padding":"2px 7px","border-radius":"999px","background":"rgba(8, 13, 26, 0.8)","border":"1px solid rgba(255, 214, 107, 0.6)","color":"#FFD66B","font-size":"10.5px","font-weight":"800","letter-spacing":"0.04em"}
}
const _hoisted_90 = {
  key: 4,
  style: {"position":"absolute","top":"7px","right":"7px","padding":"1px 7px","border-radius":"999px","background":"rgba(8, 13, 26, 0.72)","font-size":"11.5px","font-weight":"700","color":"#FFFFFF"}
}
const _hoisted_91 = { style: {"position":"absolute","left":"6px","right":"6px","bottom":"6px","display":"flex","align-items":"center","gap":"5px","padding":"5px 7px","border-radius":"10px","background":"rgba(8, 13, 26, 0.86)","color":"#FFFFFF","font-size":"12px","font-weight":"700"} }
const _hoisted_92 = { style: {"flex":"1","min-width":"0","text-align":"left","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_93 = ["onClick"]
const _hoisted_94 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(108, 132, 242, 0.16)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_95 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#B9C5FF","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_96 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_97 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_98 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_99 = {
  "aria-label": "Derniers ajouts",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"}
}
const _hoisted_100 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"} }
const _hoisted_101 = ["onClick"]
const _hoisted_102 = { style: {"border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"} }
const _hoisted_103 = ["onClick"]
const _hoisted_104 = ["src"]
const _hoisted_105 = ["src"]
const _hoisted_106 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_107 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_108 = { style: {"font-size":"12.5px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_109 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end"} }
const _hoisted_110 = { style: {"font-size":"14.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_111 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"52px","padding":"0 16px","border-radius":"999px","border":"1px solid #1E2B45","background":"#111A2C"} }
const _hoisted_112 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#9AA8C3","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_113 = ["value", "onInput"]
const _hoisted_114 = ["onClick"]
const _hoisted_115 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_116 = {
  role: "group",
  "aria-label": "Type d’article",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_117 = ["onClick", "aria-pressed"]
const _hoisted_118 = {
  "aria-label": "Résumé de la collection",
  style: {"flex":"none","display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","padding":"14px 4px","border-radius":"20px","border":"1px solid #1E2B45","background":"#111A2C"}
}
const _hoisted_119 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px"} }
const _hoisted_120 = { style: {"font-family":"'Sora', sans-serif","font-size":"15.5px","font-weight":"700","white-space":"nowrap"} }
const _hoisted_121 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px","border-left":"1px solid #1E2B45","border-right":"1px solid #1E2B45"} }
const _hoisted_122 = { style: {"font-family":"'Sora', sans-serif","font-size":"15.5px","font-weight":"700","white-space":"nowrap"} }
const _hoisted_123 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px"} }
const _hoisted_124 = { style: {"flex":"none","font-size":"12.5px","color":"#7D8BA8"} }
const _hoisted_125 = { style: {"flex":"none","display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px"} }
const _hoisted_126 = ["onClick"]
const _hoisted_127 = ["src"]
const _hoisted_128 = { style: {"position":"absolute","left":"14px","right":"14px","top":"12px","height":"20px","border-radius":"5px","background":"#E9ECF2","color":"#1B2236","font-family":"'Sora', sans-serif","font-size":"10.5px","font-weight":"700","letter-spacing":"0.04em","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_129 = ["src"]
const _hoisted_130 = ["src"]
const _hoisted_131 = {
  width: "44",
  height: "44",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"50%","top":"110px","margin-left":"-22px","fill":"none","stroke":"rgba(255, 255, 255, 0.85)","stroke-width":"1.25","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_132 = ["d"]
const _hoisted_133 = { style: {"position":"absolute","top":"8px","left":"8px","padding":"1px 5px","border":"1.5px solid rgba(255, 255, 255, 0.9)","border-radius":"6px","background":"rgba(11, 17, 32, 0.25)","font-family":"'Sora', sans-serif","font-size":"10px","font-weight":"700","letter-spacing":"0.04em","color":"#FFFFFF"} }
const _hoisted_134 = { style: {"position":"absolute","top":"8px","right":"8px","padding":"2px 8px","border-radius":"999px","background":"rgba(8, 13, 26, 0.7)","font-size":"12px","font-weight":"700","color":"#FFFFFF"} }
const _hoisted_135 = {
  key: 3,
  style: {"position":"absolute","left":"8px","bottom":"8px","display":"flex","align-items":"center","gap":"3px","padding":"2px 7px","border-radius":"999px","background":"rgba(8, 13, 26, 0.8)","border":"1px solid rgba(255, 214, 107, 0.6)","color":"#FFD66B","font-size":"10.5px","font-weight":"800","letter-spacing":"0.04em"}
}
const _hoisted_136 = { style: {"display":"flex","flex-direction":"column","gap":"1px","padding":"0 3px","min-width":"0"} }
const _hoisted_137 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_138 = { style: {"font-size":"12px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_139 = { style: {"display":"flex","align-items":"center","gap":"6px","padding":"0 3px"} }
const _hoisted_140 = { style: {"font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_141 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"6px","padding":"0 3px","font-size":"12px"} }
const _hoisted_142 = { style: {"color":"#9AA8C3","white-space":"nowrap"} }
const _hoisted_143 = {
  key: 0,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"#9AA8C3"}
}
const _hoisted_144 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"6px","font-size":"12px","color":"#7D8BA8"} }
const _hoisted_145 = ["src"]
const _hoisted_146 = ["src", "alt"]
const _hoisted_147 = { style: {"position":"absolute","left":"50%","top":"22px","width":"220px","margin-left":"-110px","height":"30px","border-radius":"8px 8px 0 0","background":"#E9ECF2","color":"#1B2236","display":"flex","align-items":"center","justify-content":"space-between","padding":"0 12px","box-sizing":"border-box","font-family":"'Sora', sans-serif","font-size":"12px","font-weight":"700"} }
const _hoisted_148 = ["src", "alt"]
const _hoisted_149 = ["src", "alt"]
const _hoisted_150 = {
  width: "72",
  height: "72",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"50%","top":"176px","margin-left":"-36px","fill":"none","stroke":"rgba(255, 255, 255, 0.85)","stroke-width":"1.1","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_151 = ["d"]
const _hoisted_152 = { style: {"position":"absolute","top":"14px","left":"14px","padding":"2px 7px","border":"1.5px solid rgba(255, 255, 255, 0.92)","border-radius":"7px","background":"rgba(11, 17, 32, 0.25)","font-family":"'Sora', sans-serif","font-size":"12px","font-weight":"700","letter-spacing":"0.04em","color":"#FFFFFF"} }
const _hoisted_153 = { style: {"position":"absolute","right":"12px","bottom":"12px","display":"flex","align-items":"center","gap":"7px","padding":"5px 11px","border-radius":"999px","background":"rgba(8, 13, 26, 0.72)","font-size":"12.5px","font-weight":"700","color":"#FFFFFF"} }
const _hoisted_154 = {
  "aria-label": "Cote PKM",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #24345C","background":"radial-gradient(120% 90% at 100% 0%, rgba(98, 122, 255, 0.18), rgba(98, 122, 255, 0) 60%), #121C33","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_155 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"10px"} }
const _hoisted_156 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_157 = { style: {"font-family":"'Sora', sans-serif","font-size":"34px","line-height":"1.1","font-weight":"700","letter-spacing":"-0.03em"} }
const _hoisted_158 = {
  key: 0,
  style: {"display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px","font-size":"12.5px","text-align":"right"}
}
const _hoisted_159 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700"} }
const _hoisted_160 = { style: {"color":"#9AA8C3"} }
const _hoisted_161 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px","padding-top":"10px","border-top":"1px solid rgba(255, 255, 255, 0.08)"} }
const _hoisted_162 = { style: {"font-size":"12.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_163 = ["aria-label", "onMouseleave"]
const _hoisted_164 = ["d"]
const _hoisted_165 = ["d"]
const _hoisted_166 = ["x1", "x2"]
const _hoisted_167 = ["cx", "cy"]
const _hoisted_168 = ["x", "width", "onMouseenter", "onClick"]
const _hoisted_169 = { style: {"display":"flex","justify-content":"space-between","gap":"8px","font-size":"11.5px","color":"#7D8BA8"} }
const _hoisted_170 = {
  key: 1,
  style: {"margin":"0","font-size":"13.5px","line-height":"1.5","color":"#F7C77E"}
}
const _hoisted_171 = {
  "aria-label": "Comparatif des prix",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"6px"}
}
const _hoisted_172 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_173 = { style: {"font-size":"14.5px","font-weight":"600"} }
const _hoisted_174 = { style: {"font-size":"12px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_175 = { style: {"margin":"4px 0 0","padding-top":"10px","border-top":"1px solid #1E2B45","font-size":"12.5px","line-height":"1.5","color":"#C9D3EA"} }
const _hoisted_176 = {
  key: 0,
  "aria-label": "Historique d’achat",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"6px"}
}
const _hoisted_177 = { style: {"flex":"1","min-width":"0","font-size":"14px","color":"#C9D3EA"} }
const _hoisted_178 = {
  key: 0,
  style: {"font-size":"11.5px","font-weight":"700","border-radius":"999px","padding":"3px 9px","background":"rgba(168, 182, 255, 0.14)","color":"#B9C5FF"}
}
const _hoisted_179 = { style: {"font-size":"14px","font-variant-numeric":"tabular-nums"} }
const _hoisted_180 = ["onClick"]
const _hoisted_181 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_182 = {
  key: 1,
  style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1.3fr) minmax(0, 1fr)","gap":"10px"}
}
const _hoisted_183 = ["onClick"]
const _hoisted_184 = ["onClick", "disabled"]
const _hoisted_185 = ["onClick"]
const _hoisted_186 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"52px","padding":"0 16px","border-radius":"999px","border":"1px solid #1E2B45","background":"#111A2C"} }
const _hoisted_187 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#9AA8C3","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_188 = ["value", "onInput"]
const _hoisted_189 = {
  role: "group",
  "aria-label": "Filtre du marché",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_190 = ["onClick", "aria-pressed"]
const _hoisted_191 = { style: {"flex":"none","font-size":"12.5px","color":"#7D8BA8"} }
const _hoisted_192 = {
  key: 0,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"#9AA8C3"}
}
const _hoisted_193 = { style: {"flex":"none","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"} }
const _hoisted_194 = ["onClick"]
const _hoisted_195 = ["src"]
const _hoisted_196 = ["src"]
const _hoisted_197 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_198 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_199 = { style: {"display":"flex","align-items":"center","gap":"6px","min-width":"0","font-size":"12px","color":"#9AA8C3"} }
const _hoisted_200 = { style: {"white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_201 = {
  key: 0,
  style: {"flex":"none","padding":"1px 7px","border-radius":"999px","background":"rgba(168, 182, 255, 0.14)","color":"#B9C5FF","font-size":"11px","font-weight":"700"}
}
const _hoisted_202 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"1px"} }
const _hoisted_203 = { style: {"font-size":"15px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_204 = {
  "aria-label": "Identité",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"14px","padding":"16px","border-radius":"24px","border":"1px solid #24345C","background":"radial-gradient(120% 90% at 0% 0%, rgba(98, 122, 255, 0.22), rgba(98, 122, 255, 0) 60%), #121C33"}
}
const _hoisted_205 = { style: {"position":"relative","flex":"none","width":"76px","height":"76px"} }
const _hoisted_206 = ["src"]
const _hoisted_207 = {
  width: "30",
  height: "30",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","right":"-6px","bottom":"-4px","overflow":"visible"}
}
const _hoisted_208 = ["d"]
const _hoisted_209 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_210 = { style: {"font-size":"13px","color":"#9AA8C3"} }
const _hoisted_211 = {
  "aria-label": "Type de collectionneur",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_212 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_213 = ["d"]
const _hoisted_214 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_215 = {
  role: "list",
  "aria-label": "Les trois profils",
  style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"6px"}
}
const _hoisted_216 = { style: {"margin":"0","font-size":"13.5px","line-height":"1.5","color":"#C9D3EA"} }
const _hoisted_217 = { style: {"display":"flex","align-items":"center","gap":"6px","font-size":"12px","color":"#7D8BA8"} }
const _hoisted_218 = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_219 = { style: {"font-size":"13.5px","line-height":"1.45"} }
const _hoisted_220 = {
  key: 0,
  style: {"font-size":"12.5px","line-height":"1.45","color":"#9AA8C3"}
}
const _hoisted_221 = {
  "aria-label": "Ce qui fixe ton profil",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"4px"}
}
const _hoisted_222 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"10px"} }
const _hoisted_223 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_224 = { style: {"font-size":"14px","font-weight":"600"} }
const _hoisted_225 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700"} }
const _hoisted_226 = {
  "aria-hidden": "true",
  style: {"position":"relative","height":"8px","border-radius":"4px","background":"#24345C"}
}
const _hoisted_227 = {
  "aria-hidden": "true",
  style: {"position":"relative","height":"14px","font-size":"11px","color":"#7D8BA8"}
}
const _hoisted_228 = { style: {"position":"absolute","left":"0"} }
const _hoisted_229 = { style: {"position":"absolute","right":"0"} }
const _hoisted_230 = {
  "aria-label": "Ce que ça change pour toi",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_231 = {
  "aria-label": "Raccourcis du profil",
  style: {"flex":"none","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"}
}
const _hoisted_232 = ["onClick"]
const _hoisted_233 = {
  width: "26",
  height: "26",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_234 = ["d"]
const _hoisted_235 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_236 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_237 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_238 = ["onClick"]
const _hoisted_239 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#B9C5FF","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_240 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_241 = ["onClick"]
const _hoisted_242 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#B9C5FF","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_243 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_244 = ["onClick"]
const _hoisted_245 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#B9C5FF","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_246 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_247 = {
  width: "96",
  height: "96",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"overflow":"visible"}
}
const _hoisted_248 = ["d"]
const _hoisted_249 = { style: {"font-size":"14px","color":"#C9D3EA"} }
const _hoisted_250 = {
  "aria-hidden": "true",
  style: {"align-self":"stretch","height":"10px","margin-top":"6px","border-radius":"5px","background":"#24345C","overflow":"hidden"}
}
const _hoisted_251 = { style: {"font-size":"13px","font-weight":"600"} }
const _hoisted_252 = {
  "aria-label": "Les paliers",
  style: {"flex":"none","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"}
}
const _hoisted_253 = {
  width: "34",
  height: "34",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_254 = ["d"]
const _hoisted_255 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_256 = { style: {"font-weight":"700"} }
const _hoisted_257 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_258 = {
  "aria-label": "Série en cours",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_259 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_260 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700","color":"#A8B6FF"} }
const _hoisted_261 = {
  "aria-hidden": "true",
  style: {"display":"flex","align-items":"flex-end","gap":"6px","height":"34px"}
}
const _hoisted_262 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_263 = {
  "aria-label": "Succès",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_264 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_265 = { style: {"font-size":"13px","color":"#9AA8C3"} }
const _hoisted_266 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px"} }
const _hoisted_267 = {
  key: 0,
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#3DDC84","stroke-width":"2.6","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_268 = {
  key: 1,
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#A8B6FF","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_269 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.25"} }
const _hoisted_270 = { style: {"font-size":"12px","color":"#9AA8C3"} }
const _hoisted_271 = {
  "aria-hidden": "true",
  style: {"height":"5px","border-radius":"3px","background":"#24345C","overflow":"hidden"}
}
const _hoisted_272 = {
  "aria-label": "Valorisation",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_273 = {
  role: "group",
  "aria-label": "Indicateur de valorisation",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_274 = ["onClick", "aria-pressed"]
const _hoisted_275 = { style: {"font-size":"12.5px","line-height":"1.45","color":"#9AA8C3"} }
const _hoisted_276 = {
  "aria-label": "Sources de prix",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"4px"}
}
const _hoisted_277 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_278 = { style: {"font-weight":"600"} }
const _hoisted_279 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_280 = { style: {"flex":"none","font-size":"12px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_281 = {
  "aria-label": "Mode avancé",
  style: {"flex":"none","padding":"20px 18px 18px","border-radius":"26px","border":"1px solid #2A3A5C","background":"radial-gradient(110% 80% at 50% 0%, rgba(98, 122, 255, 0.26), rgba(98, 122, 255, 0) 65%), #121C33","display":"flex","flex-direction":"column","align-items":"center","gap":"12px","text-align":"center"}
}
const _hoisted_282 = { style: {"display":"flex","align-items":"center","gap":"6px","padding":"4px 12px","border-radius":"999px","background":"#E8ECFF","color":"#0B1120","font-size":"12px","font-weight":"800","letter-spacing":"0.06em"} }
const _hoisted_283 = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#3D63FF","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_284 = {
  "aria-hidden": "true",
  style: {"position":"relative","width":"194px","height":"110px"}
}
const _hoisted_285 = ["src"]
const _hoisted_286 = { style: {"font-family":"'Sora', sans-serif","font-size":"19px","font-weight":"600","letter-spacing":"-0.01em"} }
const _hoisted_287 = ["onClick", "aria-pressed"]
const _hoisted_288 = {
  "aria-label": "Frais par plateforme",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"6px"}
}
const _hoisted_289 = { style: {"padding":"3px 10px","border-radius":"999px","border":"1px solid #2A3A5C","font-size":"13px","font-weight":"600"} }
const _hoisted_290 = { style: {"font-size":"13px","color":"#9AA8C3","text-align":"right"} }
const _hoisted_291 = ["onClick"]
const _hoisted_292 = {
  "aria-label": "Outils avancés",
  style: {"flex":"none","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"}
}
const _hoisted_293 = ["onClick"]
const _hoisted_294 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(168, 182, 255, 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_295 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#B9C5FF","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_296 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_297 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_298 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_299 = ["onClick"]
const _hoisted_300 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(168, 182, 255, 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_301 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#B9C5FF","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_302 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_303 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_304 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_305 = ["onClick"]
const _hoisted_306 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(168, 182, 255, 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_307 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#B9C5FF","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_308 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_309 = {
  "aria-label": "À propos",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#0F1828","display":"flex","flex-direction":"column","gap":"8px"}
}
const _hoisted_310 = ["onClick"]
const _hoisted_311 = {
  role: "group",
  "aria-label": "Période",
  style: {"flex":"none","display":"flex","gap":"8px"}
}
const _hoisted_312 = ["onClick", "aria-pressed"]
const _hoisted_313 = {
  "aria-label": "Résumé des ventes",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #24345C","background":"radial-gradient(120% 90% at 100% 0%, rgba(98, 122, 255, 0.18), rgba(98, 122, 255, 0) 60%), #121C33","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_314 = { style: {"display":"flex","align-items":"flex-end","justify-content":"space-between","gap":"12px"} }
const _hoisted_315 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_316 = { style: {"font-size":"13px","color":"#C9D3EA"} }
const _hoisted_317 = { style: {"display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px","font-size":"12.5px","color":"#9AA8C3","text-align":"right"} }
const _hoisted_318 = { style: {"color":"#F3F6FC","font-weight":"600"} }
const _hoisted_319 = {
  "aria-hidden": "true",
  style: {"display":"flex","gap":"2px","height":"8px"}
}
const _hoisted_320 = { style: {"display":"flex","flex-wrap":"wrap","gap":"4px 14px","font-size":"12px","color":"#9AA8C3"} }
const _hoisted_321 = { style: {"display":"flex","align-items":"center","gap":"6px"} }
const _hoisted_322 = { style: {"display":"flex","align-items":"center","gap":"6px"} }
const _hoisted_323 = {
  key: 0,
  style: {"flex":"none","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"}
}
const _hoisted_324 = ["onClick"]
const _hoisted_325 = ["src"]
const _hoisted_326 = ["src"]
const _hoisted_327 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_328 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_329 = { style: {"display":"flex","align-items":"center","gap":"6px","flex-wrap":"wrap","font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_330 = { style: {"padding":"1px 8px","border-radius":"999px","border":"1px solid #2A3A5C","color":"#C9D3EA","font-size":"11.5px","font-weight":"600"} }
const _hoisted_331 = {
  key: 0,
  style: {"padding":"1px 8px","border-radius":"999px","background":"rgba(245, 177, 76, 0.16)","color":"#F5B14C","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_332 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"1px"} }
const _hoisted_333 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_334 = {
  key: 1,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"#9AA8C3"}
}
const _hoisted_335 = ["onClick"]
const _hoisted_336 = {
  "aria-label": "Résultat de la vente",
  style: {"flex":"none","padding":"16px","border-radius":"24px","border":"1px solid #24345C","background":"radial-gradient(120% 90% at 100% 0%, rgba(98, 122, 255, 0.2), rgba(98, 122, 255, 0) 60%), #121C33","display":"flex","flex-direction":"column","gap":"14px"}
}
const _hoisted_337 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_338 = ["src"]
const _hoisted_339 = ["src"]
const _hoisted_340 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_341 = { style: {"font-weight":"600"} }
const _hoisted_342 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_343 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_344 = { style: {"font-size":"13px","color":"#9AA8C3"} }
const _hoisted_345 = {
  key: 0,
  style: {"font-size":"13px","line-height":"1.45","color":"#F7C77E","background":"rgba(245, 177, 76, 0.12)","border":"1px solid rgba(245, 177, 76, 0.3)","border-radius":"14px","padding":"10px 12px"}
}
const _hoisted_346 = {
  "aria-label": "Décomposition de la marge",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_347 = { style: {"display":"flex","flex-direction":"column","gap":"11px","font-size":"14px"} }
const _hoisted_348 = { style: {"display":"flex","justify-content":"space-between","gap":"12px"} }
const _hoisted_349 = { style: {"font-variant-numeric":"tabular-nums","font-weight":"600"} }
const _hoisted_350 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_351 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_352 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_353 = { style: {"font-variant-numeric":"tabular-nums","color":"#C9D3EA"} }
const _hoisted_354 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_355 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_356 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_357 = { style: {"font-variant-numeric":"tabular-nums","color":"#C9D3EA"} }
const _hoisted_358 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_359 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_360 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_361 = { style: {"font-variant-numeric":"tabular-nums","color":"#C9D3EA"} }
const _hoisted_362 = { style: {"display":"flex","justify-content":"space-between","gap":"12px","font-weight":"700"} }
const _hoisted_363 = {
  "aria-hidden": "true",
  style: {"display":"flex","gap":"2px","height":"8px","margin-top":"2px"}
}
const _hoisted_364 = { style: {"margin":"0","font-size":"13px","line-height":"1.45","color":"#9AA8C3"} }
const _hoisted_365 = {
  key: 0,
  style: {"flex":"none","display":"flex","justify-content":"space-between","align-items":"center","gap":"12px","min-height":"54px","padding":"0 16px","border-radius":"18px","border":"1px solid #1E2B45","background":"#111A2C","font-size":"14px"}
}
const _hoisted_366 = { style: {"font-weight":"700"} }
const _hoisted_367 = ["onClick"]
const _hoisted_368 = ["onClick"]
const _hoisted_369 = { style: {"flex":"none","width":"66px","height":"46px","border-radius":"11px","background":"linear-gradient(160deg, #23765C, #0A251C)","box-shadow":"inset 0 0 0 1px rgba(255, 255, 255, 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_370 = ["src"]
const _hoisted_371 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_372 = { style: {"font-size":"12px","font-weight":"700","color":"#5EE0CF"} }
const _hoisted_373 = { style: {"font-size":"14px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_374 = { style: {"font-size":"12px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_375 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_376 = {
  role: "group",
  "aria-label": "Produit recherché",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_377 = ["onClick", "aria-pressed"]
const _hoisted_378 = {
  "aria-label": "Carte des magasins",
  style: {"flex":"none","position":"relative","width":"100%","max-width":"100%","aspect-ratio":"358 / 210","border-radius":"22px","overflow":"hidden","border":"1px solid #1E2B45","background":"#0E1729"}
}
const _hoisted_379 = ["aria-label"]
const _hoisted_380 = ["rx", "ry"]
const _hoisted_381 = ["onClick", "aria-label"]
const _hoisted_382 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"} }
const _hoisted_383 = {
  role: "group",
  "aria-label": "Probabilité d’arrivage",
  style: {"display":"flex","align-items":"center","gap":"8px"}
}
const _hoisted_384 = ["onClick", "aria-pressed"]
const _hoisted_385 = {
  role: "group",
  "aria-label": "Rayon autour de toi",
  style: {"display":"flex","align-items":"center","gap":"8px"}
}
const _hoisted_386 = ["onClick", "aria-pressed"]
const _hoisted_387 = { style: {"flex":"none","font-size":"12.5px","color":"#7D8BA8"} }
const _hoisted_388 = {
  key: 0,
  style: {"margin":"0","padding":"20px 0","text-align":"center","font-size":"14px","color":"#9AA8C3"}
}
const _hoisted_389 = { style: {"flex":"none","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","overflow":"hidden","display":"flex","flex-direction":"column"} }
const _hoisted_390 = ["onClick"]
const _hoisted_391 = { style: {"flex":"none","width":"42px","height":"42px","border-radius":"13px","background":"rgba(168, 182, 255, 0.12)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_392 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#B9C5FF","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_393 = ["d"]
const _hoisted_394 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_395 = { style: {"display":"flex","align-items":"center","gap":"6px","flex-wrap":"wrap"} }
const _hoisted_396 = { style: {"font-size":"14.5px","font-weight":"700"} }
const _hoisted_397 = {
  key: 0,
  style: {"padding":"1px 7px","border-radius":"999px","background":"rgba(168, 182, 255, 0.16)","color":"#B9C5FF","font-size":"10.5px","font-weight":"800"}
}
const _hoisted_398 = { style: {"font-size":"12px","color":"#9AA8C3"} }
const _hoisted_399 = { style: {"font-size":"12.5px","color":"#C9D3EA"} }
const _hoisted_400 = { style: {"display":"flex","flex-wrap":"wrap","gap":"5px","margin-top":"2px"} }
const _hoisted_401 = { style: {"font-size":"11.5px","color":"#7D8BA8"} }
const _hoisted_402 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"3px"} }
const _hoisted_403 = {
  "aria-label": "Magasin",
  style: {"flex":"none","padding":"16px","border-radius":"24px","border":"1px solid #24345C","background":"radial-gradient(120% 90% at 100% 0%, rgba(98, 122, 255, 0.2), rgba(98, 122, 255, 0) 60%), #121C33","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_404 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_405 = { style: {"flex":"none","width":"52px","height":"52px","border-radius":"16px","background":"rgba(168, 182, 255, 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_406 = {
  width: "28",
  height: "28",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#B9C5FF","stroke-width":"1.7","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_407 = ["d"]
const _hoisted_408 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_409 = { style: {"font-size":"13px","font-weight":"600","color":"#C9D3EA"} }
const _hoisted_410 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_411 = {
  key: 0,
  style: {"align-self":"flex-start","margin-top":"2px","padding":"1px 8px","border-radius":"999px","background":"rgba(168, 182, 255, 0.16)","color":"#B9C5FF","font-size":"11px","font-weight":"800"}
}
const _hoisted_412 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"3px"} }
const _hoisted_413 = { style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"#9AA8C3"} }
const _hoisted_414 = {
  "aria-label": "Prochains arrivages",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"4px"}
}
const _hoisted_415 = ["onClick", "aria-label"]
const _hoisted_416 = ["src"]
const _hoisted_417 = ["src"]
const _hoisted_418 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"4px"} }
const _hoisted_419 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_420 = { style: {"font-size":"14.5px","font-weight":"700"} }
const _hoisted_421 = { style: {"font-size":"12.5px","color":"#C9D3EA"} }
const _hoisted_422 = {
  "aria-hidden": "true",
  style: {"display":"block","height":"6px","border-radius":"3px","background":"#24345C","overflow":"hidden"}
}
const _hoisted_423 = { style: {"display":"flex","flex-wrap":"wrap","align-items":"center","gap":"5px"} }
const _hoisted_424 = { style: {"font-size":"11.5px","color":"#7D8BA8"} }
const _hoisted_425 = {
  "aria-label": "Historique des arrivages",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"4px"}
}
const _hoisted_426 = { style: {"flex":"none","width":"44px","font-size":"13px","font-weight":"700","font-variant-numeric":"tabular-nums","color":"#9AA8C3"} }
const _hoisted_427 = { style: {"flex":"1","font-size":"13.5px","line-height":"1.4"} }
const _hoisted_428 = { style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1.4fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_429 = ["onClick", "aria-pressed"]
const _hoisted_430 = ["onClick"]
const _hoisted_431 = {
  "aria-label": "Lot",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_432 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_433 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_434 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }
const _hoisted_435 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_436 = { style: {"display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px"} }
const _hoisted_437 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700"} }
const _hoisted_438 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_439 = { style: {"display":"flex","flex-direction":"column","gap":"8px"} }
const _hoisted_440 = {
  role: "group",
  "aria-label": "Méthode de répartition",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_441 = ["onClick", "aria-pressed"]
const _hoisted_442 = { style: {"font-size":"12.5px","line-height":"1.45","color":"#9AA8C3"} }
const _hoisted_443 = ["src"]
const _hoisted_444 = ["src"]
const _hoisted_445 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_446 = { style: {"font-weight":"600","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_447 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_448 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end"} }
const _hoisted_449 = { style: {"font-size":"14.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_450 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_451 = {
  "aria-label": "Effet sur tes marges",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"6px"}
}
const _hoisted_452 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_453 = { style: {"font-size":"14px","font-weight":"600"} }
const _hoisted_454 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_455 = ["aria-label"]
const _hoisted_456 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600"} }
const _hoisted_457 = { style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_458 = { style: {"display":"flex","flex-direction":"column","gap":"5px","font-size":"12px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_459 = ["value", "onInput"]
const _hoisted_460 = { style: {"display":"flex","flex-direction":"column","gap":"5px","font-size":"12px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_461 = ["value", "onInput"]
const _hoisted_462 = { style: {"display":"flex","flex-direction":"column","gap":"5px","font-size":"12px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_463 = ["value", "onInput"]
const _hoisted_464 = { style: {"margin":"0","font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_465 = {
  "aria-label": "Équipe",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"14px"}
}
const _hoisted_466 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_467 = { style: {"font-weight":"600"} }
const _hoisted_468 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_469 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end"} }
const _hoisted_470 = { style: {"font-size":"14.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_471 = {
  "aria-label": "Partage de la marge nette",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_472 = {
  role: "group",
  "aria-label": "Règle de partage",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_473 = ["onClick", "aria-pressed"]
const _hoisted_474 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_475 = { style: {"font-weight":"600"} }
const _hoisted_476 = { style: {"font-size":"12.5px","color":"#9AA8C3"} }
const _hoisted_477 = { style: {"margin":"0","padding-top":"10px","border-top":"1px solid #1E2B45","font-size":"13px","color":"#9AA8C3"} }
const _hoisted_478 = {
  "aria-label": "Importer",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_479 = ["onClick"]
const _hoisted_480 = { style: {"flex":"1","color":"#9AA8C3"} }
const _hoisted_481 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#7D8BA8","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_482 = { style: {"flex":"1","font-weight":"600"} }
const _hoisted_483 = {
  "aria-label": "Exporter",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_484 = ["onClick"]
const _hoisted_485 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_486 = {
  "aria-label": "Navigation principale",
  style: {"position":"absolute","left":"14px","right":"14px","bottom":"14px","z-index":"10","height":"68px","box-sizing":"border-box","display":"grid","grid-template-columns":"repeat(5, minmax(0, 1fr))","align-items":"center","padding":"0 6px","border-radius":"26px","border":"1px solid #1E2B45","background":"rgba(8, 13, 26, 0.92)","backdrop-filter":"blur(14px)","-webkit-backdrop-filter":"blur(14px)","box-shadow":"0 14px 34px rgba(0, 0, 0, 0.5)"}
}
const _hoisted_487 = ["onClick", "aria-current"]
const _hoisted_488 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_489 = ["onClick", "aria-current"]
const _hoisted_490 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_491 = ["onClick"]
const _hoisted_492 = {
  width: "28",
  height: "28",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_493 = ["onClick", "aria-current"]
const _hoisted_494 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_495 = ["onClick", "aria-current"]
const _hoisted_496 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_497 = {
  key: 4,
  "aria-label": "Scanner",
  style: {"position":"absolute","inset":"0","z-index":"15","display":"flex","flex-direction":"column","overflow":"hidden","background":"radial-gradient(90% 60% at 50% 40%, #2B3550 0%, #131A2A 55%, #07090F 100%)"}
}
const _hoisted_498 = { style: {"position":"relative","display":"flex","align-items":"center","justify-content":"space-between","gap":"10px","padding":"16px 16px 0"} }
const _hoisted_499 = ["onClick"]
const _hoisted_500 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_501 = {
  role: "group",
  "aria-label": "Que scannes-tu ?",
  style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"4px","padding":"3px","border-radius":"999px","background":"rgba(8, 13, 26, 0.6)","border":"1px solid rgba(255, 255, 255, 0.14)"}
}
const _hoisted_502 = ["onClick", "aria-pressed"]
const _hoisted_503 = ["onClick", "aria-pressed"]
const _hoisted_504 = ["onClick", "aria-label", "aria-pressed"]
const _hoisted_505 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_506 = { style: {"position":"relative","flex":"1","min-height":"0","display":"flex","flex-direction":"column","align-items":"center","justify-content":"center","gap":"14px"} }
const _hoisted_507 = { style: {"font-size":"13px","color":"#C9D3EA"} }
const _hoisted_508 = { style: {"position":"relative","width":"244px","height":"300px"} }
const _hoisted_509 = ["src", "alt"]
const _hoisted_510 = {
  key: 1,
  style: {"position":"absolute","left":"24px","top":"16px","width":"196px","transform":"rotate(-2deg)","box-shadow":"0 26px 44px rgba(0, 0, 0, 0.6)","border-radius":"8px","overflow":"hidden"}
}
const _hoisted_511 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","height":"28px","padding":"0 10px","background":"#E9ECF2","color":"#1B2236","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700"} }
const _hoisted_512 = ["src", "alt"]
const _hoisted_513 = ["src", "alt"]
const _hoisted_514 = {
  width: "56",
  height: "56",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"72px","top":"122px","fill":"none","stroke":"rgba(255, 255, 255, 0.85)","stroke-width":"1.2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_515 = ["d"]
const _hoisted_516 = {
  role: "status",
  style: {"display":"flex","align-items":"center","gap":"8px","max-width":"340px","padding":"9px 14px","border-radius":"999px","background":"rgba(8, 13, 26, 0.78)","border":"1px solid rgba(61, 220, 132, 0.45)","font-size":"13.5px","font-weight":"600"}
}
const _hoisted_517 = { style: {"white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_518 = { style: {"margin-top":"-6px","font-size":"12.5px","color":"#C9D3EA"} }
const _hoisted_519 = ["onClick"]
const _hoisted_520 = { style: {"position":"relative","display":"flex","flex-direction":"column","align-items":"center","gap":"12px","padding":"0 24px 30px"} }
const _hoisted_521 = { style: {"font-size":"12px","color":"#9AA8C3"} }
const _hoisted_522 = { style: {"align-self":"stretch","display":"grid","grid-template-columns":"1fr auto 1fr","align-items":"center"} }
const _hoisted_523 = ["onClick"]
const _hoisted_524 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_525 = ["onClick"]
const _hoisted_526 = ["onClick"]
const _hoisted_527 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_528 = {
  key: 5,
  style: {"position":"absolute","inset":"0","z-index":"25","display":"flex","flex-direction":"column","background":"rgba(3, 6, 14, 0.55)"}
}
const _hoisted_529 = ["onClick"]
const _hoisted_530 = {
  "aria-label": "Résultat du scan",
  style: {"flex":"none","max-height":"770px","overflow-y":"auto","scrollbar-width":"none","box-sizing":"border-box","background":"#0F1828","border-top":"1px solid #24345C","border-radius":"28px 28px 0 0","padding":"8px 16px 24px","display":"flex","flex-direction":"column","gap":"14px"}
}
const _hoisted_531 = { style: {"flex":"none","display":"flex","gap":"14px","align-items":"flex-start"} }
const _hoisted_532 = ["src"]
const _hoisted_533 = ["src"]
const _hoisted_534 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","align-items":"flex-start","gap":"4px"} }
const _hoisted_535 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"21px","line-height":"1.2","font-weight":"700","letter-spacing":"-0.02em"} }
const _hoisted_536 = { style: {"font-size":"13px","color":"#9AA8C3"} }
const _hoisted_537 = { style: {"font-size":"12px","color":"#7D8BA8"} }
const _hoisted_538 = ["onClick"]
const _hoisted_539 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_540 = {
  "aria-label": "Cote",
  style: {"flex":"none","display":"flex","justify-content":"space-between","align-items":"center","gap":"12px","padding":"14px 16px","border-radius":"20px","border":"1px solid #24345C","background":"radial-gradient(120% 100% at 100% 0%, rgba(98, 122, 255, 0.2), rgba(98, 122, 255, 0) 60%), #121C33"}
}
const _hoisted_541 = { style: {"display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_542 = { style: {"font-family":"'Sora', sans-serif","font-size":"30px","line-height":"1.1","font-weight":"700","letter-spacing":"-0.03em"} }
const _hoisted_543 = { style: {"display":"flex","flex-direction":"column","gap":"3px","min-width":"150px"} }
const _hoisted_544 = { style: {"color":"#9AA8C3"} }
const _hoisted_545 = { style: {"font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_546 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"} }
const _hoisted_547 = {
  role: "group",
  "aria-label": "Langue",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_548 = ["onClick", "aria-pressed"]
const _hoisted_549 = {
  role: "group",
  "aria-label": "État",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_550 = ["onClick", "aria-pressed"]
const _hoisted_551 = { style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1fr) auto","gap":"10px","align-items":"end"} }
const _hoisted_552 = { style: {"display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_553 = ["value", "onInput"]
const _hoisted_554 = { style: {"display":"flex","flex-direction":"column","gap":"6px"} }
const _hoisted_555 = { style: {"display":"flex","align-items":"center","height":"52px","box-sizing":"border-box","border":"1px solid #2A3A5C","border-radius":"16px","background":"#0B1120"} }
const _hoisted_556 = ["onClick"]
const _hoisted_557 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_558 = {
  "aria-live": "polite",
  style: {"min-width":"26px","text-align":"center","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"}
}
const _hoisted_559 = ["onClick"]
const _hoisted_560 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_561 = { style: {"flex":"none","margin-top":"-6px","font-size":"12.5px","color":"#7D8BA8"} }
const _hoisted_562 = {
  "aria-label": "Effet sur ta collection",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"12px 14px","border-radius":"18px","border":"1px solid #1E2B45","background":"#111A2C"}
}
const _hoisted_563 = {
  width: "40",
  height: "40",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_564 = ["d"]
const _hoisted_565 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_566 = { style: {"font-size":"14px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_567 = {
  width: "15",
  height: "15",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_568 = ["d"]
const _hoisted_569 = ["onClick"]
const _hoisted_570 = ["onClick"]
const _hoisted_571 = {
  key: 6,
  style: {"position":"absolute","inset":"0","z-index":"20","display":"flex","flex-direction":"column","background":"rgba(3, 6, 14, 0.62)"}
}
const _hoisted_572 = ["onClick"]
const _hoisted_573 = {
  "aria-label": "Saisie",
  style: {"flex":"none","max-height":"796px","overflow-y":"auto","scrollbar-width":"none","box-sizing":"border-box","background":"#0F1828","border-top":"1px solid #24345C","border-radius":"28px 28px 0 0","padding":"8px 16px 26px","display":"flex","flex-direction":"column","gap":"14px"}
}
const _hoisted_574 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"8px"} }
const _hoisted_575 = {
  role: "group",
  "aria-label": "Type de saisie",
  style: {"flex":"1","display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"4px","padding":"4px","border-radius":"999px","background":"#0B1120","border":"1px solid #1E2B45"}
}
const _hoisted_576 = ["onClick", "aria-pressed"]
const _hoisted_577 = ["onClick", "aria-pressed"]
const _hoisted_578 = ["onClick"]
const _hoisted_579 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_580 = { style: {"flex":"none","margin":"0","font-family":"'Sora', sans-serif","font-size":"22px","font-weight":"700","letter-spacing":"-0.02em"} }
const _hoisted_581 = { style: {"flex":"none","margin":"0","padding":"0","border":"0","min-width":"0"} }
const _hoisted_582 = { style: {"display":"flex","gap":"10px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"2px 16px 4px"} }
const _hoisted_583 = ["onClick", "aria-pressed", "aria-label"]
const _hoisted_584 = ["src"]
const _hoisted_585 = ["src"]
const _hoisted_586 = { style: {"padding":"0 2px","font-size":"12.5px","font-weight":"700","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_587 = { style: {"padding":"0 2px","font-size":"11.5px","color":"#9AA8C3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_588 = { style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1fr) auto","gap":"10px","align-items":"end"} }
const _hoisted_589 = { style: {"display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_590 = ["value", "onInput"]
const _hoisted_591 = { style: {"display":"flex","flex-direction":"column","gap":"6px"} }
const _hoisted_592 = { style: {"display":"flex","align-items":"center","height":"52px","box-sizing":"border-box","border":"1px solid #2A3A5C","border-radius":"16px","background":"#0B1120"} }
const _hoisted_593 = ["onClick"]
const _hoisted_594 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_595 = {
  "aria-live": "polite",
  style: {"min-width":"26px","text-align":"center","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"}
}
const _hoisted_596 = ["onClick"]
const _hoisted_597 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_598 = {
  key: 0,
  style: {"flex":"none","margin-top":"-8px","font-size":"12.5px","color":"#7D8BA8"}
}
const _hoisted_599 = { style: {"flex":"none","margin":"0","padding":"0","border":"0","min-width":"0"} }
const _hoisted_600 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_601 = ["onClick", "aria-pressed"]
const _hoisted_602 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_603 = ["value", "onInput"]
const _hoisted_604 = { style: {"font-weight":"400","font-size":"12.5px","color":"#7D8BA8"} }
const _hoisted_605 = {
  key: 0,
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"#9AA8C3"}
}
const _hoisted_606 = ["value", "onInput"]
const _hoisted_607 = { style: {"font-weight":"400","font-size":"12.5px","color":"#7D8BA8"} }
const _hoisted_608 = {
  key: 2,
  style: {"flex":"none","margin":"0","padding":"0","border":"0","min-width":"0"}
}
const _hoisted_609 = { style: {"padding":"0","margin-bottom":"8px","font-size":"13px","font-weight":"600","color":"#9AA8C3"} }
const _hoisted_610 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_611 = ["onClick", "aria-pressed"]
const _hoisted_612 = ["aria-label"]
const _hoisted_613 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_614 = { style: {"font-size":"13px","font-weight":"600","color":"#C9D3EA"} }
const _hoisted_615 = { style: {"display":"flex","flex-direction":"column","gap":"4px","font-size":"13px","color":"#9AA8C3"} }
const _hoisted_616 = { style: {"color":"#C9D3EA","font-variant-numeric":"tabular-nums","text-align":"right"} }
const _hoisted_617 = {
  key: 0,
  style: {"font-size":"13px","font-weight":"700","color":"#F5B14C"}
}
const _hoisted_618 = ["onClick", "disabled"]
const _hoisted_619 = {
  key: 7,
  "aria-label": "Bienvenue sur PKM",
  style: {"position":"absolute","inset":"0","z-index":"40","display":"flex","flex-direction":"column","overflow-y":"auto","scrollbar-width":"none","background":"radial-gradient(110% 55% at 50% 0%, rgba(98, 122, 255, 0.3), rgba(98, 122, 255, 0) 62%), #0B1120"}
}
const _hoisted_620 = { style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","min-height":"44px","padding":"14px 16px 0"} }
const _hoisted_621 = {
  "aria-hidden": "true",
  style: {"display":"flex","gap":"6px"}
}
const _hoisted_622 = ["onClick"]
const _hoisted_623 = {
  key: 0,
  style: {"flex":"1","display":"flex","flex-direction":"column","gap":"16px","padding":"8px 20px 24px"}
}
const _hoisted_624 = {
  "aria-hidden": "true",
  style: {"position":"relative","align-self":"center","width":"262px","height":"232px"}
}
const _hoisted_625 = ["src"]
const _hoisted_626 = { style: {"display":"flex","flex-direction":"column","gap":"10px","padding":"14px 16px","border-radius":"20px","border":"1px solid #1E2B45","background":"#111A2C"} }
const _hoisted_627 = { style: {"display":"flex","align-items":"center","gap":"12px","font-size":"14px"} }
const _hoisted_628 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#A8B6FF","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_629 = { style: {"display":"flex","align-items":"center","gap":"12px","font-size":"14px"} }
const _hoisted_630 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#A8B6FF","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_631 = { style: {"display":"flex","align-items":"center","gap":"12px","font-size":"14px"} }
const _hoisted_632 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"#A8B6FF","stroke-width":"1.9","stroke-linejoin":"round"}
}
const _hoisted_633 = ["onClick"]
const _hoisted_634 = {
  key: 1,
  style: {"flex":"1","display":"flex","flex-direction":"column","gap":"14px","padding":"8px 16px 24px"}
}
const _hoisted_635 = { style: {"padding":"0","margin-bottom":"8px","font-size":"14px","font-weight":"700"} }
const _hoisted_636 = { style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"6px"} }
const _hoisted_637 = ["onClick", "aria-pressed"]
const _hoisted_638 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_639 = { style: {"flex":"none","width":"42px","height":"42px","border-radius":"14px","background":"rgba(8, 13, 26, 0.5)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_640 = ["d"]
const _hoisted_641 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_642 = {
  role: "list",
  "aria-label": "Les trois profils",
  style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"6px"}
}
const _hoisted_643 = { style: {"display":"grid","grid-template-columns":"auto minmax(0, 1fr)","gap":"10px"} }
const _hoisted_644 = ["onClick"]
const _hoisted_645 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_646 = ["onClick"]
const _hoisted_647 = {
  key: 2,
  style: {"flex":"1","display":"flex","flex-direction":"column","align-items":"stretch","gap":"14px","padding":"8px 20px 24px"}
}
const _hoisted_648 = ["d"]
const _hoisted_649 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px","text-align":"center"} }
const _hoisted_650 = { style: {"margin":"0","font-size":"15px","line-height":"1.5","color":"#C9D3EA","text-align":"center"} }
const _hoisted_651 = {
  "aria-label": "Ce qu’on a préparé pour toi",
  style: {"display":"flex","flex-direction":"column","gap":"10px","padding":"14px 16px","border-radius":"20px","border":"1px solid #1E2B45","background":"#111A2C"}
}
const _hoisted_652 = ["onClick"]
const _hoisted_653 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px","margin-top":"-4px"} }
const _hoisted_654 = ["onClick"]
const _hoisted_655 = ["onClick"]
const _hoisted_656 = { style: {"flex":"none","width":"26px","height":"26px","border-radius":"13px","background":"rgba(61, 220, 132, 0.16)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_657 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"#3DDC84","stroke-width":"2.6","stroke-linecap":"round","stroke-linejoin":"round"}
}

return function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    (_ctx.V.ui.headerHome)
      ? (_openBlock(), _createElementBlock("header", _hoisted_2, [
          _cache[2] || (_cache[2] = _createElementVNode("span", { style: {"justify-self":"start","display":"flex","align-items":"center","gap":"8px","height":"36px","padding":"0 12px","border-radius":"999px","background":"#111A2C","border":"1px solid #1E2B45","font-size":"13px","font-weight":"600","color":"#C9D3EA"} }, [
            _createElementVNode("span", { style: {"flex":"none","width":"18px","height":"12px","border-radius":"2px","background":"linear-gradient(90deg, #0055A4 0 33.3%, #FFFFFF 33.3% 66.6%, #EF4135 66.6%)"} }),
            _createTextVNode("Marché FR")
          ], -1 /* CACHED */)),
          _createElementVNode("span", _hoisted_3, [
            _createElementVNode("span", _hoisted_4, [
              (_openBlock(), _createElementBlock("svg", _hoisted_5, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("path", { d: "M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9" }, null, -1 /* CACHED */)
              ]))]))
            ]),
            _cache[1] || (_cache[1] = _createElementVNode("span", { style: {"font-family":"'Sora', sans-serif","font-size":"21px","font-weight":"700","letter-spacing":"-0.03em"} }, "PKM", -1 /* CACHED */))
          ]),
          _createElementVNode("button", {
            type: "button",
            onClick: _ctx.V.goProfile,
            "aria-label": _ctx.A(_ctx.V.ui.profileLabel),
            style: {"justify-self":"end","width":"44px","height":"44px","padding":"0","border":"0","border-radius":"22px","background":"transparent","cursor":"pointer"}
          }, [
            _createElementVNode("img", {
              src: _ctx.V.ui.avatar,
              alt: "",
              style: _normalizeStyle(`display: block; width: 40px; height: 40px; margin: 2px; box-sizing: border-box; border-radius: 20px; border: 2px solid ${_ctx.V.ui.ring}; object-fit: cover`)
            }, null, 12 /* STYLE, PROPS */, _hoisted_7)
          ], 8 /* PROPS */, _hoisted_6)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.headerBig)
      ? (_openBlock(), _createElementBlock("header", _hoisted_8, [
          _createElementVNode("h1", _hoisted_9, _toDisplayString(_ctx.V.ui.title), 1 /* TEXT */),
          _createElementVNode("button", {
            type: "button",
            onClick: _ctx.V.goProfile,
            "aria-label": _ctx.A(_ctx.V.ui.profileLabel),
            style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"0","border-radius":"22px","background":"transparent","cursor":"pointer"}
          }, [
            _createElementVNode("img", {
              src: _ctx.V.ui.avatar,
              alt: "",
              style: _normalizeStyle(`display: block; width: 40px; height: 40px; margin: 2px; box-sizing: border-box; border-radius: 20px; border: 2px solid ${_ctx.V.ui.ring}; object-fit: cover`)
            }, null, 12 /* STYLE, PROPS */, _hoisted_11)
          ], 8 /* PROPS */, _hoisted_10)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.headerDetail)
      ? (_openBlock(), _createElementBlock("header", _hoisted_12, [
          _createElementVNode("button", {
            type: "button",
            onClick: _ctx.V.goBack,
            "aria-label": "Retour",
            style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid #1E2B45","border-radius":"22px","background":"#111A2C","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
          }, [
            (_openBlock(), _createElementBlock("svg", _hoisted_14, [...(_cache[3] || (_cache[3] = [
              _createElementVNode("path", { d: "M15 5l-7 7 7 7" }, null, -1 /* CACHED */)
            ]))]))
          ], 8 /* PROPS */, _hoisted_13),
          _createElementVNode("div", _hoisted_15, [
            _createElementVNode("h1", _hoisted_16, _toDisplayString(_ctx.V.ui.title), 1 /* TEXT */),
            (_ctx.V.ui.hasSubtitle)
              ? (_openBlock(), _createElementBlock("span", _hoisted_17, _toDisplayString(_ctx.V.ui.subtitle), 1 /* TEXT */))
              : _createCommentVNode("v-if", true)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.hasSubRow)
      ? (_openBlock(), _createElementBlock("div", _hoisted_18, [
          _createElementVNode("span", null, _toDisplayString(_ctx.V.ui.syncText), 1 /* TEXT */),
          (_ctx.V.ui.adv)
            ? (_openBlock(), _createElementBlock("span", _hoisted_19, "Mode avancé"))
            : _createCommentVNode("v-if", true)
        ]))
      : _createCommentVNode("v-if", true),
    _createElementVNode("main", _hoisted_20, [
      (_ctx.V.ui.isHome)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
            _createElementVNode("section", _hoisted_21, [
              _createElementVNode("div", _hoisted_22, [
                _createElementVNode("div", _hoisted_23, [
                  _cache[6] || (_cache[6] = _createTextVNode("Ma collection ", -1 /* CACHED */)),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.toggleMask,
                    "aria-label": _ctx.A(_ctx.V.ui.maskLabel),
                    "aria-pressed": _ctx.A(_ctx.V.ui.masked),
                    style: {"width":"44px","height":"44px","margin":"-10px -6px -10px 0","padding":"0","border":"0","background":"transparent","color":"#9AA8C3","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_25, [
                      _cache[4] || (_cache[4] = _createElementVNode("path", { d: "M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" }, null, -1 /* CACHED */)),
                      _cache[5] || (_cache[5] = _createElementVNode("circle", {
                        cx: "12",
                        cy: "12",
                        r: "2.8"
                      }, null, -1 /* CACHED */)),
                      _createElementVNode("path", {
                        d: _ctx.V.ui.eyeSlash
                      }, null, 8 /* PROPS */, _hoisted_26)
                    ]))
                  ], 8 /* PROPS */, _hoisted_24)
                ]),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-size: 12.5px; font-weight: 700; color: ${_ctx.V.home.mktColor}`)
                }, "Marché " + _toDisplayString(_ctx.V.home.mkt24) + " (24 h)", 5 /* TEXT, STYLE */)
              ]),
              _createElementVNode("div", _hoisted_27, _toDisplayString(_ctx.V.home.valueBig), 1 /* TEXT */),
              _createElementVNode("span", _hoisted_28, _toDisplayString(_ctx.V.home.units), 1 /* TEXT */),
              (_openBlock(), _createElementBlock("svg", {
                width: "100%",
                height: "56",
                viewBox: "0 0 324 56",
                preserveAspectRatio: "none",
                role: "img",
                "aria-label": _ctx.A(_ctx.V.home.chartLabel),
                style: {"display":"block","margin-top":"4px","overflow":"visible"}
              }, [
                _createElementVNode("path", {
                  d: _ctx.V.home.chart.area,
                  style: _normalizeStyle(`fill: ${_ctx.V.home.chart.color}; fill-opacity: 0.12; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_30),
                _createElementVNode("path", {
                  d: _ctx.V.home.chart.line,
                  style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.home.chart.color}; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_31),
                _createElementVNode("circle", {
                  cx: _ctx.V.home.chart.dotX,
                  cy: _ctx.V.home.chart.dotY,
                  r: "4.5",
                  style: _normalizeStyle(`fill: ${_ctx.V.home.chart.color}; stroke: #121C33; stroke-width: 2`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_32)
              ], 8 /* PROPS */, _hoisted_29)),
              _createElementVNode("div", _hoisted_33, [
                _createElementVNode("span", _hoisted_34, [
                  _cache[7] || (_cache[7] = _createElementVNode("span", { style: {"font-size":"12px","color":"#9AA8C3"} }, "Plus-value latente", -1 /* CACHED */)),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${_ctx.V.home.latentColor}`)
                  }, _toDisplayString(_ctx.V.home.latent), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("span", _hoisted_35, _toDisplayString(_ctx.V.home.stamp), 1 /* TEXT */)
              ]),
              (_ctx.V.home.hasUnk)
                ? (_openBlock(), _createElementBlock("span", _hoisted_36, _toDisplayString(_ctx.V.home.unkNote), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.goTiers,
              "aria-label": _ctx.A(_ctx.V.home.tier.aria),
              style: _normalizeStyle(`flex: none; display: flex; align-items: center; gap: 14px; padding: 14px 14px 14px 16px; border: 1px solid #1E2B45; border-radius: 22px; background: radial-gradient(90% 120% at 0% 50%, ${_ctx.V.home.tier.glow}, rgba(0, 0, 0, 0) 60%), #111A2C; color: inherit; font: inherit; text-align: left; cursor: pointer`)
            }, [
              (_openBlock(), _createElementBlock("svg", _hoisted_38, [
                _createElementVNode("path", {
                  d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                  style: _normalizeStyle(`fill: ${_ctx.V.home.tier.color}; fill-opacity: 0.16; stroke: ${_ctx.V.home.tier.color}; stroke-width: 1.1; stroke-linejoin: round`)
                }, null, 4 /* STYLE */),
                _createElementVNode("path", {
                  d: _ctx.V.home.tier.sym,
                  style: _normalizeStyle(`fill: ${_ctx.V.home.tier.color}; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_39)
              ])),
              _createElementVNode("span", _hoisted_40, [
                _createElementVNode("span", _hoisted_41, [
                  _createElementVNode("span", _hoisted_42, "Palier " + _toDisplayString(_ctx.V.home.tier.name), 1 /* TEXT */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-size: 13px; font-weight: 700; color: ${_ctx.V.home.tier.color}`)
                  }, _toDisplayString(_ctx.V.home.tier.pct), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("span", _hoisted_43, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`display: block; width: ${_ctx.V.home.tier.barW}; height: 100%; border-radius: 4px; background: linear-gradient(90deg, ${_ctx.V.home.tier.color}, ${_ctx.V.home.tier.nextColor})`)
                  }, null, 4 /* STYLE */)
                ]),
                _createElementVNode("span", _hoisted_44, _toDisplayString(_ctx.V.home.tier.next), 1 /* TEXT */)
              ]),
              (_openBlock(), _createElementBlock("svg", _hoisted_45, [...(_cache[8] || (_cache[8] = [
                _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
              ]))]))
            ], 12 /* STYLE, PROPS */, _hoisted_37),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.home.near.open,
              "aria-label": _ctx.A(_ctx.V.home.near.aria),
              style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"12px 14px","border":"1px solid #1E2B45","border-radius":"20px","background":"#111A2C","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
            }, [
              _createElementVNode("span", {
                style: _normalizeStyle(`position: relative; flex: none; width: 40px; height: 52px; border-radius: 8px; overflow: hidden; background: ${_ctx.V.home.near.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
              }, [
                (_ctx.V.home.near.isCard)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 0,
                      src: _ctx.V.home.near.img,
                      alt: "",
                      style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                    }, null, 8 /* PROPS */, _hoisted_47))
                  : _createCommentVNode("v-if", true),
                (_ctx.V.home.near.isSealed)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 1,
                      src: _ctx.V.home.near.logo,
                      alt: "",
                      style: {"max-width":"34px","max-height":"24px","object-fit":"contain"}
                    }, null, 8 /* PROPS */, _hoisted_48))
                  : _createCommentVNode("v-if", true)
              ], 4 /* STYLE */),
              _createElementVNode("span", _hoisted_49, [
                _createElementVNode("span", _hoisted_50, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_51, [...(_cache[9] || (_cache[9] = [
                    _createElementVNode("path", { d: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" }, null, -1 /* CACHED */),
                    _createElementVNode("circle", {
                      cx: "12",
                      cy: "10",
                      r: "2.4"
                    }, null, -1 /* CACHED */)
                  ]))])),
                  _cache[10] || (_cache[10] = _createTextVNode("Arrivage près de toi", -1 /* CACHED */))
                ]),
                _createElementVNode("span", _hoisted_52, _toDisplayString(_ctx.V.home.near.name), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_53, _toDisplayString(_ctx.V.home.near.store), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_54, _toDisplayString(_ctx.V.home.near.when), 1 /* TEXT */)
              ]),
              _createElementVNode("span", _hoisted_55, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: ${_ctx.V.home.near.color}`)
                }, _toDisplayString(_ctx.V.home.near.prob), 5 /* TEXT, STYLE */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${_ctx.V.home.near.tint}; color: ${_ctx.V.home.near.color}; font-size: 11px; font-weight: 700`)
                }, _toDisplayString(_ctx.V.home.near.level), 5 /* TEXT, STYLE */)
              ])
            ], 8 /* PROPS */, _hoisted_46),
            (_ctx.V.home.novice)
              ? (_openBlock(), _createElementBlock("section", _hoisted_56, [
                  _cache[12] || (_cache[12] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Premiers pas", -1 /* CACHED */)),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.steps || []), (sp, sp_i) => {
                    return (_openBlock(), _createElementBlock("div", {
                      key: sp_i,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"36px"}
                    }, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`flex: none; width: 28px; height: 28px; box-sizing: border-box; border-radius: 14px; border: 1.5px solid ${sp.color}; color: ${sp.color}; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700`)
                      }, _toDisplayString(sp.n), 5 /* TEXT, STYLE */),
                      _createElementVNode("span", _hoisted_57, _toDisplayString(sp.label), 1 /* TEXT */),
                      (sp.done)
                        ? (_openBlock(), _createElementBlock("svg", _hoisted_58, [...(_cache[11] || (_cache[11] = [
                            _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                          ]))]))
                        : _createCommentVNode("v-if", true)
                    ]))
                  }), 128 /* KEYED_FRAGMENT */)),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.openScan,
                    style: {"height":"48px","margin-top":"2px","border":"0","border-radius":"999px","background":"#5EE0CF","color":"#0B1120","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                  }, "Scanner ma première carte", 8 /* PROPS */, _hoisted_59),
                  _cache[13] || (_cache[13] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#9AA8C3"} }, "La cote PKM, c’est le prix du milieu entre plusieurs sites. Elle évite de surestimer ta collection à cause d’une annonce trop chère.", -1 /* CACHED */))
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.home.passion)
              ? (_openBlock(), _createElementBlock("section", _hoisted_60, [
                  _cache[14] || (_cache[14] = _createElementVNode("span", { style: {"flex":"1","font-size":"13.5px","line-height":"1.45","color":"#F3D9AE"} }, "Profil Passionné : le mode avancé ajoute les lots, les associés et l’export complet.", -1 /* CACHED */)),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.toggleAdv,
                    style: {"flex":"none","height":"44px","padding":"0 16px","border":"0","border-radius":"999px","background":"#FFB547","color":"#0B1120","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                  }, "Activer", 8 /* PROPS */, _hoisted_61)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.home.notNovice)
              ? (_openBlock(), _createElementBlock("section", _hoisted_62, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.home.up.open,
                    style: {"display":"flex","flex-direction":"column","gap":"8px","padding":"12px","border":"1px solid #1E2B45","border-radius":"20px","background":"#111A2C","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                  }, [
                    _createElementVNode("span", _hoisted_64, _toDisplayString(_ctx.V.home.up.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_65, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`position: relative; flex: none; width: 42px; height: 56px; border-radius: 8px; overflow: hidden; background: ${_ctx.V.home.up.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                      }, [
                        (_ctx.V.home.up.isCard)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: _ctx.V.home.up.img,
                              alt: "",
                              style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                            }, null, 8 /* PROPS */, _hoisted_66))
                          : _createCommentVNode("v-if", true),
                        (_ctx.V.home.up.isSealed)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 1,
                              src: _ctx.V.home.up.logo,
                              alt: "",
                              style: {"max-width":"36px","max-height":"26px","object-fit":"contain"}
                            }, null, 8 /* PROPS */, _hoisted_67))
                          : _createCommentVNode("v-if", true)
                      ], 4 /* STYLE */),
                      _createElementVNode("span", _hoisted_68, [
                        _createElementVNode("span", _hoisted_69, _toDisplayString(_ctx.V.home.up.name), 1 /* TEXT */),
                        _createElementVNode("span", {
                          style: _normalizeStyle(`font-size: 13px; font-weight: 700; color: ${_ctx.V.home.up.color}`)
                        }, _toDisplayString(_ctx.V.home.up.change), 5 /* TEXT, STYLE */)
                      ])
                    ])
                  ], 8 /* PROPS */, _hoisted_63),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.home.down.open,
                    style: {"display":"flex","flex-direction":"column","gap":"8px","padding":"12px","border":"1px solid #1E2B45","border-radius":"20px","background":"#111A2C","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                  }, [
                    _createElementVNode("span", _hoisted_71, _toDisplayString(_ctx.V.home.down.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_72, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`position: relative; flex: none; width: 42px; height: 56px; border-radius: 8px; overflow: hidden; background: ${_ctx.V.home.down.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                      }, [
                        (_ctx.V.home.down.isCard)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: _ctx.V.home.down.img,
                              alt: "",
                              style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                            }, null, 8 /* PROPS */, _hoisted_73))
                          : _createCommentVNode("v-if", true),
                        (_ctx.V.home.down.isSealed)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 1,
                              src: _ctx.V.home.down.logo,
                              alt: "",
                              style: {"max-width":"36px","max-height":"26px","object-fit":"contain"}
                            }, null, 8 /* PROPS */, _hoisted_74))
                          : _createCommentVNode("v-if", true)
                      ], 4 /* STYLE */),
                      _createElementVNode("span", _hoisted_75, [
                        _createElementVNode("span", _hoisted_76, _toDisplayString(_ctx.V.home.down.name), 1 /* TEXT */),
                        _createElementVNode("span", {
                          style: _normalizeStyle(`font-size: 13px; font-weight: 700; color: ${_ctx.V.home.down.color}`)
                        }, _toDisplayString(_ctx.V.home.down.change), 5 /* TEXT, STYLE */)
                      ])
                    ])
                  ], 8 /* PROPS */, _hoisted_70)
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", _hoisted_77, [
              _createElementVNode("div", _hoisted_78, [
                _cache[15] || (_cache[15] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Mes plus belles pièces", -1 /* CACHED */)),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.tabCollection,
                  style: {"height":"44px","padding":"0 2px","border":"0","background":"transparent","color":"#B9C5FF","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                }, "Voir tout", 8 /* PROPS */, _hoisted_79)
              ]),
              _createElementVNode("div", _hoisted_80, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.best || []), (bp, bp_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: bp_i,
                    type: "button",
                    onClick: bp.open,
                    "aria-label": _ctx.A(bp.label),
                    style: _normalizeStyle(`position: relative; flex: none; width: 118px; height: 164px; padding: 0; border: 0; border-radius: 16px; overflow: hidden; background: ${bp.bg}; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12); cursor: pointer`)
                  }, [
                    (bp.plainCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: bp.img,
                          alt: "",
                          style: {"position":"absolute","left":"9px","top":"9px","width":"100px","height":"116px","border-radius":"6px 6px 0 0","object-fit":"cover","object-position":"top","-webkit-mask-image":"linear-gradient(180deg, #000 78%, transparent)","mask-image":"linear-gradient(180deg, #000 78%, transparent)"}
                        }, null, 8 /* PROPS */, _hoisted_82))
                      : _createCommentVNode("v-if", true),
                    (bp.graded)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                          _createElementVNode("span", _hoisted_83, _toDisplayString(bp.grade), 1 /* TEXT */),
                          _createElementVNode("img", {
                            src: bp.img,
                            alt: "",
                            style: {"position":"absolute","left":"10px","top":"26px","width":"98px","height":"92px","border-radius":"4px","object-fit":"cover","object-position":"top"}
                          }, null, 8 /* PROPS */, _hoisted_84)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (bp.isSealed)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                          _createElementVNode("img", {
                            src: bp.logo,
                            alt: "",
                            style: {"position":"absolute","left":"12px","right":"12px","top":"26px","width":"94px","height":"48px","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_85),
                          (_openBlock(), _createElementBlock("svg", _hoisted_86, [
                            _createElementVNode("path", {
                              d: bp.glyph
                            }, null, 8 /* PROPS */, _hoisted_87)
                          ])),
                          _createElementVNode("span", _hoisted_88, _toDisplayString(bp.code), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (bp.urBadge)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_89, "★ UR"))
                      : _createCommentVNode("v-if", true),
                    (bp.hasQty)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_90, _toDisplayString(bp.qty), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("span", _hoisted_91, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`flex: none; width: 14px; height: 10px; border-radius: 2px; background: ${bp.flag}`)
                      }, null, 4 /* STYLE */),
                      _createElementVNode("span", _hoisted_92, _toDisplayString(bp.value), 1 /* TEXT */)
                    ])
                  ], 12 /* STYLE, PROPS */, _hoisted_81))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            (_ctx.V.home.hasMargin)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 3,
                  type: "button",
                  onClick: _ctx.V.goSales,
                  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"14px 14px 14px 16px","border":"1px solid #1E2B45","border-radius":"20px","background":"#111A2C","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", _hoisted_94, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_95, [...(_cache[16] || (_cache[16] = [
                      _createElementVNode("path", { d: "M6 3h12v18l-3-2-3 2-3-2-3 2z" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M9 8h6" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M9 12h6" }, null, -1 /* CACHED */)
                    ]))]))
                  ]),
                  _createElementVNode("span", _hoisted_96, [
                    _cache[17] || (_cache[17] = _createElementVNode("span", { style: {"font-size":"13px","color":"#9AA8C3"} }, "Marge réalisée sur tes ventes", -1 /* CACHED */)),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: ${_ctx.V.home.marginColor}`)
                    }, _toDisplayString(_ctx.V.home.margin), 5 /* TEXT, STYLE */),
                    _createElementVNode("span", _hoisted_97, _toDisplayString(_ctx.V.home.marginSub), 1 /* TEXT */)
                  ]),
                  (_openBlock(), _createElementBlock("svg", _hoisted_98, [...(_cache[18] || (_cache[18] = [
                    _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))]))
                ], 8 /* PROPS */, _hoisted_93))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", _hoisted_99, [
              _createElementVNode("div", _hoisted_100, [
                _cache[19] || (_cache[19] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Derniers ajouts", -1 /* CACHED */)),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.openScan,
                  style: {"height":"44px","padding":"0 2px","border":"0","background":"transparent","color":"#B9C5FF","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                }, "Scanner", 8 /* PROPS */, _hoisted_101)
              ]),
              _createElementVNode("div", _hoisted_102, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.adds || []), (ad, ad_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: ad_i,
                    type: "button",
                    onClick: ad.open,
                    style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 70px; padding: 9px 14px; border: 0; border-top: ${ad.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                  }, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: relative; flex: none; width: 38px; height: 50px; border-radius: 7px; overflow: hidden; background: ${ad.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                    }, [
                      (ad.isCard)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 0,
                            src: ad.img,
                            alt: "",
                            style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                          }, null, 8 /* PROPS */, _hoisted_104))
                        : _createCommentVNode("v-if", true),
                      (ad.isSealed)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 1,
                            src: ad.logo,
                            alt: "",
                            style: {"max-width":"32px","max-height":"24px","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_105))
                        : _createCommentVNode("v-if", true)
                    ], 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_106, [
                      _createElementVNode("span", _hoisted_107, _toDisplayString(ad.title), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_108, _toDisplayString(ad.meta), 1 /* TEXT */)
                    ]),
                    _createElementVNode("span", _hoisted_109, [
                      _createElementVNode("span", _hoisted_110, _toDisplayString(ad.amount), 1 /* TEXT */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-size: 12px; color: ${ad.labelColor}`)
                      }, _toDisplayString(ad.amountLabel), 5 /* TEXT, STYLE */)
                    ])
                  ], 12 /* STYLE, PROPS */, _hoisted_103))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _cache[20] || (_cache[20] = _createElementVNode("p", { style: {"margin":"2px 0 0","font-size":"11.5px","line-height":"1.5","color":"#7D8BA8","text-align":"center"} }, "Application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. Maquette : prix fictifs.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isCollection)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
            _createElementVNode("div", _hoisted_111, [
              (_openBlock(), _createElementBlock("svg", _hoisted_112, [...(_cache[21] || (_cache[21] = [
                _createElementVNode("circle", {
                  cx: "11",
                  cy: "11",
                  r: "6.5"
                }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
              ]))])),
              _createElementVNode("input", {
                id: "pkm-champ-1",
                type: "search",
                "aria-label": "Rechercher dans ma collection",
                placeholder: "Rechercher « Pikachu »",
                value: _ctx.V.coll.q,
                onInput: _ctx.V.coll.onQ,
                style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"15px"}
              }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_113),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.openScan,
                "aria-label": "Scanner un article",
                style: {"flex":"none","width":"44px","height":"44px","margin-right":"-10px","padding":"0","border":"0","background":"transparent","color":"#B9C5FF","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_115, [...(_cache[22] || (_cache[22] = [
                  _createElementVNode("path", { d: "M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8 M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8 M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16 M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16 M7 12h10" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_114)
            ]),
            _createElementVNode("div", _hoisted_116, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.coll.types || []), (ty, ty_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: ty_i,
                  type: "button",
                  onClick: ty.pick,
                  "aria-pressed": _ctx.A(ty.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${ty.bc}; background: ${ty.bg}; color: ${ty.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(ty.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_117))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_118, [
              _createElementVNode("div", _hoisted_119, [
                _cache[23] || (_cache[23] = _createElementVNode("span", { style: {"font-size":"12px","color":"#9AA8C3"} }, "Valeur", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_120, _toDisplayString(_ctx.V.coll.value), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_121, [
                _cache[24] || (_cache[24] = _createElementVNode("span", { style: {"font-size":"12px","color":"#9AA8C3"} }, "Coût d’achat", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_122, _toDisplayString(_ctx.V.coll.cost), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_123, [
                _cache[25] || (_cache[25] = _createElementVNode("span", { style: {"font-size":"12px","color":"#9AA8C3"} }, "Plus-value", -1 /* CACHED */)),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 15.5px; font-weight: 700; white-space: nowrap; color: ${_ctx.V.coll.latentColor}`)
                }, _toDisplayString(_ctx.V.coll.latent), 5 /* TEXT, STYLE */)
              ])
            ]),
            _createElementVNode("span", _hoisted_124, _toDisplayString(_ctx.V.coll.countText), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_125, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.coll.list || []), (ci, ci_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: ci_i,
                  type: "button",
                  onClick: ci.open,
                  style: {"display":"flex","flex-direction":"column","gap":"8px","padding":"8px 8px 12px","border":"1px solid #1E2B45","border-radius":"20px","background":"#111A2C","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; display: block; height: 176px; border-radius: 14px; overflow: hidden; background: ${ci.bg}; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1)`)
                  }, [
                    (ci.plainCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: ci.img,
                          alt: "",
                          style: {"position":"absolute","left":"50%","top":"14px","width":"130px","height":"151px","margin-left":"-65px","border-radius":"7px 7px 0 0","object-fit":"cover","object-position":"top","box-shadow":"0 8px 18px rgba(0, 0, 0, 0.4)","-webkit-mask-image":"linear-gradient(180deg, #000 80%, transparent)","mask-image":"linear-gradient(180deg, #000 80%, transparent)"}
                        }, null, 8 /* PROPS */, _hoisted_127))
                      : _createCommentVNode("v-if", true),
                    (ci.graded)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                          _createElementVNode("span", _hoisted_128, _toDisplayString(ci.grade), 1 /* TEXT */),
                          _createElementVNode("img", {
                            src: ci.img,
                            alt: "",
                            style: {"position":"absolute","left":"14px","right":"14px","top":"36px","width":"calc(100% - 28px)","height":"128px","border-radius":"5px","object-fit":"cover","object-position":"top"}
                          }, null, 8 /* PROPS */, _hoisted_129)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (ci.isSealed)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                          _createElementVNode("img", {
                            src: ci.logo,
                            alt: "",
                            style: {"position":"absolute","left":"14px","top":"34px","width":"calc(100% - 28px)","height":"64px","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_130),
                          (_openBlock(), _createElementBlock("svg", _hoisted_131, [
                            _createElementVNode("path", {
                              d: ci.glyph
                            }, null, 8 /* PROPS */, _hoisted_132)
                          ])),
                          _createElementVNode("span", _hoisted_133, _toDisplayString(ci.code), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("span", _hoisted_134, _toDisplayString(ci.qty), 1 /* TEXT */),
                    (ci.ur)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_135, "★ UR"))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_136, [
                    _createElementVNode("span", _hoisted_137, _toDisplayString(ci.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_138, _toDisplayString(ci.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_139, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`flex: none; width: 16px; height: 11px; border-radius: 2px; background: ${ci.flag}`)
                    }, null, 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_140, _toDisplayString(ci.value), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_141, [
                    _createElementVNode("span", _hoisted_142, _toDisplayString(ci.unit), 1 /* TEXT */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-weight: 700; color: ${ci.changeColor}; white-space: nowrap`)
                    }, _toDisplayString(ci.change), 5 /* TEXT, STYLE */)
                  ])
                ], 8 /* PROPS */, _hoisted_126))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            (_ctx.V.coll.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_143, "Rien ne correspond à ta recherche."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("span", _hoisted_144, [
              _cache[26] || (_cache[26] = _createElementVNode("span", { style: {"flex":"none","width":"7px","height":"7px","border-radius":"4px","background":"#3DDC84"} }, null, -1 /* CACHED */)),
              _createTextVNode(_toDisplayString(_ctx.V.coll.stamp), 1 /* TEXT */)
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isItem)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
            _createElementVNode("section", {
              "aria-label": "Visuel",
              style: _normalizeStyle(`flex: none; position: relative; height: 292px; border-radius: 26px; overflow: hidden; background: ${_ctx.V.it.bg}; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
            }, [
              (_ctx.V.it.isCard)
                ? (_openBlock(), _createElementBlock("img", {
                    key: 0,
                    src: _ctx.V.it.img,
                    alt: "",
                    "aria-hidden": "true",
                    style: {"position":"absolute","left":"-40px","top":"-40px","width":"438px","height":"372px","object-fit":"cover","filter":"blur(28px) saturate(1.4)","opacity":"0.5"}
                  }, null, 8 /* PROPS */, _hoisted_145))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.plainCard)
                ? (_openBlock(), _createElementBlock("img", {
                    key: 1,
                    src: _ctx.V.it.img,
                    alt: _ctx.V.it.name,
                    style: {"position":"absolute","left":"50%","top":"26px","width":"214px","height":"248px","margin-left":"-107px","border-radius":"12px 12px 0 0","object-fit":"cover","object-position":"top","box-shadow":"0 18px 40px rgba(0, 0, 0, 0.55)","-webkit-mask-image":"linear-gradient(180deg, #000 84%, transparent)","mask-image":"linear-gradient(180deg, #000 84%, transparent)"}
                  }, null, 8 /* PROPS */, _hoisted_146))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.graded)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                    _createElementVNode("span", _hoisted_147, [
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.name), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.grade), 1 /* TEXT */)
                    ]),
                    _createElementVNode("img", {
                      src: _ctx.V.it.img,
                      alt: _ctx.V.it.name,
                      style: {"position":"absolute","left":"50%","top":"52px","width":"220px","height":"220px","margin-left":"-110px","border-radius":"0 0 8px 8px","object-fit":"cover","object-position":"top","box-shadow":"0 18px 40px rgba(0, 0, 0, 0.55)"}
                    }, null, 8 /* PROPS */, _hoisted_148)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.isSealed)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 3 }, [
                    _createElementVNode("img", {
                      src: _ctx.V.it.logo,
                      alt: _ctx.V.it.name,
                      style: {"position":"absolute","left":"40px","top":"56px","width":"calc(100% - 80px)","height":"104px","object-fit":"contain"}
                    }, null, 8 /* PROPS */, _hoisted_149),
                    (_openBlock(), _createElementBlock("svg", _hoisted_150, [
                      _createElementVNode("path", {
                        d: _ctx.V.it.glyph
                      }, null, 8 /* PROPS */, _hoisted_151)
                    ])),
                    _createElementVNode("span", _hoisted_152, _toDisplayString(_ctx.V.it.code), 1 /* TEXT */)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              _createElementVNode("span", _hoisted_153, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`flex: none; width: 16px; height: 11px; border-radius: 2px; background: ${_ctx.V.it.flag}`)
                }, null, 4 /* STYLE */),
                _createTextVNode(_toDisplayString(_ctx.V.it.ownedBadge), 1 /* TEXT */)
              ])
            ], 4 /* STYLE */),
            _createElementVNode("section", _hoisted_154, [
              _createElementVNode("div", _hoisted_155, [
                _createElementVNode("div", _hoisted_156, [
                  _cache[27] || (_cache[27] = _createElementVNode("span", { style: {"font-size":"13px","color":"#C9D3EA"} }, "Cote PKM · à l’unité", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_157, _toDisplayString(_ctx.V.it.cote), 1 /* TEXT */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-size: 13px; font-weight: 700; color: ${_ctx.V.it.changeColor}`)
                  }, _toDisplayString(_ctx.V.it.change), 5 /* TEXT, STYLE */)
                ]),
                (_ctx.V.it.owned)
                  ? (_openBlock(), _createElementBlock("div", _hoisted_158, [
                      _cache[28] || (_cache[28] = _createElementVNode("span", { style: {"color":"#9AA8C3"} }, "Tes exemplaires", -1 /* CACHED */)),
                      _createElementVNode("span", _hoisted_159, _toDisplayString(_ctx.V.it.hold), 1 /* TEXT */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-weight: 700; color: ${_ctx.V.it.holdColor}`)
                      }, _toDisplayString(_ctx.V.it.holdLatent), 5 /* TEXT, STYLE */),
                      _createElementVNode("span", _hoisted_160, _toDisplayString(_ctx.V.it.pru), 1 /* TEXT */)
                    ]))
                  : _createCommentVNode("v-if", true)
              ]),
              (_ctx.V.it.hasChart)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                    _createElementVNode("div", _hoisted_161, [
                      _cache[29] || (_cache[29] = _createElementVNode("span", { style: {"font-size":"13px","color":"#9AA8C3"} }, "Cote archivée · 30 jours", -1 /* CACHED */)),
                      _createElementVNode("span", _hoisted_162, _toDisplayString(_ctx.V.it.readout), 1 /* TEXT */)
                    ]),
                    (_openBlock(), _createElementBlock("svg", {
                      width: "100%",
                      height: "76",
                      viewBox: "0 0 324 76",
                      preserveAspectRatio: "none",
                      role: "img",
                      "aria-label": _ctx.A(_ctx.V.it.chartLabel),
                      onMouseleave: _ctx.V.chartLeave,
                      style: {"display":"block","overflow":"visible"}
                    }, [
                      _createElementVNode("path", {
                        d: _ctx.V.it.area,
                        style: _normalizeStyle(`fill: ${_ctx.V.it.chartColor}; fill-opacity: 0.12; stroke: none`)
                      }, null, 12 /* STYLE, PROPS */, _hoisted_164),
                      _createElementVNode("path", {
                        d: _ctx.V.it.line,
                        style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.it.chartColor}; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round`)
                      }, null, 12 /* STYLE, PROPS */, _hoisted_165),
                      (_ctx.V.it.hasHi)
                        ? (_openBlock(), _createElementBlock("line", {
                            key: 0,
                            x1: _ctx.V.it.dotX,
                            x2: _ctx.V.it.dotX,
                            y1: "0",
                            y2: "76",
                            style: {"stroke":"#3A4A75","stroke-width":"1"}
                          }, null, 8 /* PROPS */, _hoisted_166))
                        : _createCommentVNode("v-if", true),
                      _createElementVNode("circle", {
                        cx: _ctx.V.it.dotX,
                        cy: _ctx.V.it.dotY,
                        r: "4.5",
                        style: _normalizeStyle(`fill: ${_ctx.V.it.chartColor}; stroke: #121C33; stroke-width: 2`)
                      }, null, 12 /* STYLE, PROPS */, _hoisted_167),
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.it.hits || []), (h, h_i) => {
                        return (_openBlock(), _createElementBlock("rect", {
                          key: h_i,
                          x: h.x,
                          y: "0",
                          width: h.w,
                          height: "76",
                          onMouseenter: h.enter,
                          onClick: h.enter,
                          style: {"fill":"transparent","cursor":"crosshair"}
                        }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_168))
                      }), 128 /* KEYED_FRAGMENT */))
                    ], 40 /* PROPS, NEED_HYDRATION */, _hoisted_163)),
                    _createElementVNode("div", _hoisted_169, [
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.firstDate), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.rangeText), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.lastDate), 1 /* TEXT */)
                    ])
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.noCote)
                ? (_openBlock(), _createElementBlock("p", _hoisted_170, _toDisplayString(_ctx.V.it.release), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_171, [
              _cache[30] || (_cache[30] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Comparatif des prix", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.it.sources || []), (so, so_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: so_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 10px; min-height: 54px; border-top: ${so.border}`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; width: 8px; height: 8px; border-radius: 4px; background: ${so.dot}`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_172, [
                    _createElementVNode("span", _hoisted_173, _toDisplayString(so.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_174, _toDisplayString(so.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; font-size: 11.5px; font-weight: 700; border-radius: 999px; padding: 3px 9px; background: ${so.tagBg}; color: ${so.tagFg}`)
                  }, _toDisplayString(so.tag), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; min-width: 78px; text-align: right; font-size: 14.5px; font-variant-numeric: tabular-nums; font-weight: ${so.weight}; color: ${so.fg}`)
                  }, _toDisplayString(so.value), 5 /* TEXT, STYLE */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */)),
              _createElementVNode("p", _hoisted_175, _toDisplayString(_ctx.V.it.coteRule), 1 /* TEXT */),
              _cache[31] || (_cache[31] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","line-height":"1.45","color":"#7D8BA8"} }, "Vinted et Leboncoin ne sont pas comparés : pas d’API publique, et pas de scraping.", -1 /* CACHED */))
            ]),
            (_ctx.V.it.hasCopies)
              ? (_openBlock(), _createElementBlock("section", _hoisted_176, [
                  _cache[33] || (_cache[33] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Historique d’achat", -1 /* CACHED */)),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.it.copies || []), (cp, cp_i) => {
                    return (_openBlock(), _createElementBlock("div", {
                      key: cp_i,
                      style: _normalizeStyle(`display: flex; align-items: center; gap: 10px; min-height: 48px; border-top: ${cp.border}`)
                    }, [
                      _createElementVNode("span", _hoisted_177, _toDisplayString(cp.meta), 1 /* TEXT */),
                      (cp.isLot)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_178, "lot"))
                        : _createCommentVNode("v-if", true),
                      _createElementVNode("span", _hoisted_179, _toDisplayString(cp.amount), 1 /* TEXT */)
                    ], 4 /* STYLE */))
                  }), 128 /* KEYED_FRAGMENT */)),
                  (_ctx.V.it.hasSold)
                    ? (_openBlock(), _createElementBlock("button", {
                        key: 0,
                        type: "button",
                        onClick: _ctx.V.goSales,
                        style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px","min-height":"48px","padding":"0","border":"0","border-top":"1px solid #1E2B45","background":"transparent","color":"#B9C5FF","font":"inherit","font-size":"13.5px","font-weight":"600","text-align":"left","cursor":"pointer"}
                      }, [
                        _createElementVNode("span", null, _toDisplayString(_ctx.V.it.soldText), 1 /* TEXT */),
                        (_openBlock(), _createElementBlock("svg", _hoisted_181, [...(_cache[32] || (_cache[32] = [
                          _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                        ]))]))
                      ], 8 /* PROPS */, _hoisted_180))
                    : _createCommentVNode("v-if", true)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.it.canAdd)
              ? (_openBlock(), _createElementBlock("div", _hoisted_182, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.addThis,
                    style: {"height":"54px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                  }, "+ Ajouter un exemplaire", 8 /* PROPS */, _hoisted_183),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sellThis,
                    disabled: _ctx.V.it.cantSell,
                    style: _normalizeStyle(`height: 54px; border: 1px solid #2A3A5C; border-radius: 999px; background: transparent; color: #F3F6FC; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; opacity: ${_ctx.V.it.sellOpacity}`)
                  }, "J’ai vendu", 12 /* STYLE, PROPS */, _hoisted_184)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.it.upcoming)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 2,
                  type: "button",
                  onClick: _ctx.V.notify,
                  style: {"flex":"none","height":"54px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                }, "Me prévenir à la sortie", 8 /* PROPS */, _hoisted_185))
              : _createCommentVNode("v-if", true)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isMarket)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 3 }, [
            _createElementVNode("div", _hoisted_186, [
              (_openBlock(), _createElementBlock("svg", _hoisted_187, [...(_cache[34] || (_cache[34] = [
                _createElementVNode("circle", {
                  cx: "11",
                  cy: "11",
                  r: "6.5"
                }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
              ]))])),
              _createElementVNode("input", {
                id: "pkm-champ-2",
                type: "search",
                "aria-label": "Rechercher une carte ou un produit",
                placeholder: "Rechercher « Dracaufeu », « Display »",
                value: _ctx.V.mk.q,
                onInput: _ctx.V.mk.onQ,
                style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"15px"}
              }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_188)
            ]),
            _createElementVNode("div", _hoisted_189, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.filters || []), (mf, mf_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: mf_i,
                  type: "button",
                  onClick: mf.pick,
                  "aria-pressed": _ctx.A(mf.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${mf.bc}; background: ${mf.bg}; color: ${mf.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(mf.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_190))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("span", _hoisted_191, _toDisplayString(_ctx.V.mk.count), 1 /* TEXT */),
            (_ctx.V.mk.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_192, "Aucun produit ne correspond."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_193, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.list || []), (mi, mi_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: mi_i,
                  type: "button",
                  onClick: mi.open,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 10px 14px; border: 0; border-top: ${mi.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; flex: none; width: 42px; height: 56px; border-radius: 8px; overflow: hidden; background: ${mi.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                  }, [
                    (mi.isCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: mi.img,
                          alt: "",
                          loading: "lazy",
                          style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                        }, null, 8 /* PROPS */, _hoisted_195))
                      : _createCommentVNode("v-if", true),
                    (mi.isSealed)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: mi.logo,
                          alt: "",
                          style: {"max-width":"36px","max-height":"26px","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_196))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_197, [
                    _createElementVNode("span", _hoisted_198, _toDisplayString(mi.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_199, [
                      _createElementVNode("span", _hoisted_200, _toDisplayString(mi.sub), 1 /* TEXT */),
                      (mi.owned)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_201, "à toi"))
                        : _createCommentVNode("v-if", true)
                    ])
                  ]),
                  _createElementVNode("span", _hoisted_202, [
                    _createElementVNode("span", _hoisted_203, _toDisplayString(mi.cote), 1 /* TEXT */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-size: 12px; font-weight: 700; color: ${mi.rightColor}`)
                    }, _toDisplayString(mi.right), 5 /* TEXT, STYLE */)
                  ])
                ], 12 /* STYLE, PROPS */, _hoisted_194))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _cache[35] || (_cache[35] = _createElementVNode("section", {
              "aria-label": "D’où viennent les prix",
              style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid #1E2B45","background":"#0F1828","display":"flex","flex-direction":"column","gap":"6px"}
            }, [
              _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "D’où viennent les prix ?"),
              _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#9AA8C3"} }, "Cardmarket (fichier public quotidien), eBay (API officielle, ventes réussies) et TCGplayer via TCGdex. La cote PKM est la médiane de ces prix « marché ». Vinted et Leboncoin ne sont pas connectés : pas d’API publique, pas de scraping. PKM ne vend rien : c’est un outil de suivi de valeur.")
            ], -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isProfile)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 4 }, [
            _createElementVNode("section", _hoisted_204, [
              _createElementVNode("span", _hoisted_205, [
                _createElementVNode("img", {
                  src: _ctx.V.pf.avatar,
                  alt: "",
                  style: _normalizeStyle(`display: block; width: 76px; height: 76px; box-sizing: border-box; border-radius: 38px; border: 3px solid ${_ctx.V.pf.ring}; object-fit: cover`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_206),
                (_openBlock(), _createElementBlock("svg", _hoisted_207, [
                  _createElementVNode("path", {
                    d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                    style: _normalizeStyle(`fill: #121C33; stroke: ${_ctx.V.pf.tierColor}; stroke-width: 1.6; stroke-linejoin: round`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("path", {
                    d: _ctx.V.pf.tierSym,
                    style: _normalizeStyle(`fill: ${_ctx.V.pf.tierColor}; stroke: none`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_208)
                ]))
              ]),
              _createElementVNode("span", _hoisted_209, [
                _cache[36] || (_cache[36] = _createElementVNode("span", { style: {"font-family":"'Sora', sans-serif","font-size":"20px","font-weight":"700","letter-spacing":"-0.02em"} }, "Ton espace", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_210, _toDisplayString(_ctx.V.pf.since), 1 /* TEXT */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-size: 12.5px; font-weight: 700; color: ${_ctx.V.pf.tierColor}`)
                }, _toDisplayString(_ctx.V.pf.tierLine), 5 /* TEXT, STYLE */)
              ])
            ]),
            _createElementVNode("section", _hoisted_211, [
              _createElementVNode("div", _hoisted_212, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`flex: none; width: 50px; height: 50px; border-radius: 16px; background: ${_ctx.V.pf.catTint}; display: flex; align-items: center; justify-content: center`)
                }, [
                  (_openBlock(), _createElementBlock("svg", {
                    width: "28",
                    height: "28",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.pf.catColor}; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round`)
                  }, [
                    _createElementVNode("path", {
                      d: _ctx.V.pf.catIcon
                    }, null, 8 /* PROPS */, _hoisted_213)
                  ], 4 /* STYLE */))
                ], 4 /* STYLE */),
                _createElementVNode("span", _hoisted_214, [
                  _cache[37] || (_cache[37] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"#9AA8C3"} }, "Type de collectionneur", -1 /* CACHED */)),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: ${_ctx.V.pf.catColor}`)
                  }, _toDisplayString(_ctx.V.pf.catName), 5 /* TEXT, STYLE */)
                ])
              ]),
              _createElementVNode("div", _hoisted_215, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.pf.steps || []), (ps, ps_i) => {
                  return (_openBlock(), _createElementBlock("span", {
                    key: ps_i,
                    role: "listitem",
                    style: _normalizeStyle(`height: 34px; border-radius: 999px; border: 1px solid ${ps.bc}; background: ${ps.bg}; color: ${ps.fg}; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: ${ps.weight}`)
                  }, _toDisplayString(ps.name), 5 /* TEXT, STYLE */))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("p", _hoisted_216, _toDisplayString(_ctx.V.pf.catDesc), 1 /* TEXT */),
              _createElementVNode("span", _hoisted_217, [
                (_openBlock(), _createElementBlock("svg", _hoisted_218, [...(_cache[38] || (_cache[38] = [
                  _createElementVNode("path", { d: "M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9 M19.5 4.5V9H15 M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15 M4.5 19.5V15H9" }, null, -1 /* CACHED */)
                ]))])),
                _createTextVNode(_toDisplayString(_ctx.V.pf.catSource), 1 /* TEXT */)
              ]),
              _createElementVNode("div", {
                style: _normalizeStyle(`display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: 16px; background: ${_ctx.V.pf.nextTint}; border: 1px solid ${_ctx.V.pf.nextEdge}`)
              }, [
                (_openBlock(), _createElementBlock("svg", {
                  width: "20",
                  height: "20",
                  viewBox: "0 0 24 24",
                  "aria-hidden": "true",
                  style: _normalizeStyle(`flex: none; margin-top: 1px; fill: none; stroke: ${_ctx.V.pf.nextColor}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round`)
                }, [...(_cache[39] || (_cache[39] = [
                  _createElementVNode("path", { d: "M3.5 17l6-6 4 4 7-7.5" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M15 7.5h5.5V13" }, null, -1 /* CACHED */)
                ]))], 4 /* STYLE */)),
                _createElementVNode("span", _hoisted_219, _toDisplayString(_ctx.V.pf.anticip), 1 /* TEXT */)
              ], 4 /* STYLE */),
              (_ctx.V.pf.hasDeclared)
                ? (_openBlock(), _createElementBlock("span", _hoisted_220, _toDisplayString(_ctx.V.pf.declared), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_221, [
              _cache[40] || (_cache[40] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Ce qui fixe ton profil", -1 /* CACHED */)),
              _cache[41] || (_cache[41] = _createElementVNode("p", { style: {"margin":"0 0 6px","font-size":"12.5px","line-height":"1.45","color":"#9AA8C3"} }, "Le plus haut des deux niveaux compte. Pas de calcul à date fixe : le profil suit ta collection.", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.pf.criteria || []), (cr, cr_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: cr_i,
                  style: _normalizeStyle(`display: flex; flex-direction: column; gap: 8px; padding: 12px 0; border-top: ${cr.border}`)
                }, [
                  _createElementVNode("div", _hoisted_222, [
                    _createElementVNode("span", _hoisted_223, [
                      _createElementVNode("span", _hoisted_224, _toDisplayString(cr.label), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_225, _toDisplayString(cr.value), 1 /* TEXT */)
                    ]),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`flex: none; padding: 3px 10px; border-radius: 999px; background: ${cr.levelTint}; color: ${cr.levelColor}; font-size: 12px; font-weight: 800`)
                    }, _toDisplayString(cr.level), 5 /* TEXT, STYLE */)
                  ]),
                  _createElementVNode("div", _hoisted_226, [
                    _createElementVNode("div", {
                      style: _normalizeStyle(`width: ${cr.barW}; height: 100%; border-radius: 4px; background: ${cr.barColor}`)
                    }, null, 4 /* STYLE */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: absolute; top: -3px; left: ${cr.tick}; width: 2px; height: 14px; margin-left: -1px; background: #C9D3EA`)
                    }, null, 4 /* STYLE */)
                  ]),
                  _createElementVNode("div", _hoisted_227, [
                    _createElementVNode("span", _hoisted_228, _toDisplayString(cr.s0), 1 /* TEXT */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: absolute; left: ${cr.tick}; transform: translateX(-50%)`)
                    }, _toDisplayString(cr.s1), 5 /* TEXT, STYLE */),
                    _createElementVNode("span", _hoisted_229, _toDisplayString(cr.s2), 1 /* TEXT */)
                  ])
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_230, [
              _cache[43] || (_cache[43] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Ce que ça change pour toi", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.pf.adapts || []), (ap, ap_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ap_i,
                  style: {"display":"flex","align-items":"flex-start","gap":"10px","font-size":"14px","line-height":"1.45"}
                }, [
                  (_openBlock(), _createElementBlock("svg", {
                    width: "18",
                    height: "18",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    style: _normalizeStyle(`flex: none; margin-top: 1px; fill: none; stroke: ${ap.color}; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round`)
                  }, [...(_cache[42] || (_cache[42] = [
                    _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                  ]))], 4 /* STYLE */)),
                  _createElementVNode("span", null, _toDisplayString(ap.text), 1 /* TEXT */)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("nav", _hoisted_231, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.goTiers,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_233, [
                  _createElementVNode("path", {
                    d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                    style: _normalizeStyle(`fill: ${_ctx.V.pf.tierColor}; fill-opacity: 0.16; stroke: ${_ctx.V.pf.tierColor}; stroke-width: 1.4; stroke-linejoin: round`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("path", {
                    d: _ctx.V.pf.tierSym,
                    style: _normalizeStyle(`fill: ${_ctx.V.pf.tierColor}; stroke: none`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_234)
                ])),
                _createElementVNode("span", _hoisted_235, [
                  _cache[44] || (_cache[44] = _createElementVNode("span", { style: {"font-weight":"600"} }, "Paliers et succès", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_236, "Palier actuel : " + _toDisplayString(_ctx.V.pf.tierName), 1 /* TEXT */)
                ]),
                (_openBlock(), _createElementBlock("svg", _hoisted_237, [...(_cache[45] || (_cache[45] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_232),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.goSales,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid #1E2B45","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_239, [...(_cache[46] || (_cache[46] = [
                  _createElementVNode("path", { d: "M6 3h12v18l-3-2-3 2-3-2-3 2z" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M9 8h6" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M9 12h6" }, null, -1 /* CACHED */)
                ]))])),
                _cache[48] || (_cache[48] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                  _createElementVNode("span", { style: {"font-weight":"600"} }, "Ventes et marge"),
                  _createElementVNode("span", { style: {"font-size":"12.5px","color":"#9AA8C3"} }, "Tes ventes faites ailleurs, frais déduits")
                ], -1 /* CACHED */)),
                (_openBlock(), _createElementBlock("svg", _hoisted_240, [...(_cache[47] || (_cache[47] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_238),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.goSettings,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid #1E2B45","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_242, [...(_cache[49] || (_cache[49] = [
                  _createStaticVNode("<path d=\"M4 7h9\"></path><path d=\"M17 7h3\"></path><circle cx=\"15\" cy=\"7\" r=\"2\"></circle><path d=\"M4 17h3\"></path><path d=\"M11 17h9\"></path><circle cx=\"9\" cy=\"17\" r=\"2\"></circle>", 6)
                ]))])),
                _cache[51] || (_cache[51] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                  _createElementVNode("span", { style: {"font-weight":"600"} }, "Réglages"),
                  _createElementVNode("span", { style: {"font-size":"12.5px","color":"#9AA8C3"} }, "Cote, sources, mode avancé")
                ], -1 /* CACHED */)),
                (_openBlock(), _createElementBlock("svg", _hoisted_243, [...(_cache[50] || (_cache[50] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_241),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.replayOnb,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid #1E2B45","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_245, [...(_cache[52] || (_cache[52] = [
                  _createElementVNode("path", { d: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M4.5 4.5v4h4" }, null, -1 /* CACHED */)
                ]))])),
                _cache[54] || (_cache[54] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                  _createElementVNode("span", { style: {"font-weight":"600"} }, "Revoir l’accueil"),
                  _createElementVNode("span", { style: {"font-size":"12.5px","color":"#9AA8C3"} }, "Les 2 questions qui anticipent ton profil")
                ], -1 /* CACHED */)),
                (_openBlock(), _createElementBlock("svg", _hoisted_246, [...(_cache[53] || (_cache[53] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_244)
            ]),
            _cache[55] || (_cache[55] = _createElementVNode("p", { style: {"margin":"0","font-size":"11.5px","line-height":"1.5","color":"#7D8BA8","text-align":"center"} }, "Application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isTiers)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 5 }, [
            _createElementVNode("section", {
              "aria-label": "Ton palier",
              style: _normalizeStyle(`flex: none; padding: 20px 16px 16px; border-radius: 26px; border: 1px solid #2A3A5C; background: radial-gradient(100% 75% at 50% 0%, ${_ctx.V.tr.glow}, rgba(0, 0, 0, 0) 66%), #121C33; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center`)
            }, [
              (_openBlock(), _createElementBlock("svg", _hoisted_247, [
                _createElementVNode("path", {
                  d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                  style: _normalizeStyle(`fill: ${_ctx.V.tr.color}; fill-opacity: 0.16; stroke: ${_ctx.V.tr.color}; stroke-width: 0.9; stroke-linejoin: round`)
                }, null, 4 /* STYLE */),
                _createElementVNode("path", {
                  d: _ctx.V.tr.sym,
                  style: _normalizeStyle(`fill: ${_ctx.V.tr.color}; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_248)
              ])),
              _cache[56] || (_cache[56] = _createElementVNode("span", { style: {"font-size":"13px","color":"#9AA8C3"} }, "Ton palier", -1 /* CACHED */)),
              _createElementVNode("span", {
                style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 28px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: ${_ctx.V.tr.color}`)
              }, _toDisplayString(_ctx.V.tr.name), 5 /* TEXT, STYLE */),
              _createElementVNode("span", _hoisted_249, "Collection valorisée à " + _toDisplayString(_ctx.V.tr.value), 1 /* TEXT */),
              _createElementVNode("div", _hoisted_250, [
                _createElementVNode("div", {
                  style: _normalizeStyle(`width: ${_ctx.V.tr.barW}; height: 100%; border-radius: 5px; background: linear-gradient(90deg, ${_ctx.V.tr.color}, ${_ctx.V.tr.nextColor})`)
                }, null, 4 /* STYLE */)
              ]),
              _createElementVNode("span", _hoisted_251, _toDisplayString(_ctx.V.tr.next), 1 /* TEXT */)
            ], 4 /* STYLE */),
            _createElementVNode("section", _hoisted_252, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tr.ladder || []), (ld, ld_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ld_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 62px; padding: 6px 16px; border-top: ${ld.border}; background: ${ld.bg}; opacity: ${ld.op}`)
                }, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_253, [
                    _createElementVNode("path", {
                      d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                      style: _normalizeStyle(`fill: ${ld.color}; fill-opacity: 0.16; stroke: ${ld.color}; stroke-width: 1.3; stroke-linejoin: round`)
                    }, null, 4 /* STYLE */),
                    _createElementVNode("path", {
                      d: ld.sym,
                      style: _normalizeStyle(`fill: ${ld.color}; stroke: none`)
                    }, null, 12 /* STYLE, PROPS */, _hoisted_254)
                  ])),
                  _createElementVNode("span", _hoisted_255, [
                    _createElementVNode("span", _hoisted_256, _toDisplayString(ld.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_257, _toDisplayString(ld.min), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; font-size: 12.5px; font-weight: 700; color: ${ld.stateColor}`)
                  }, _toDisplayString(ld.state), 5 /* TEXT, STYLE */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_258, [
              _createElementVNode("div", _hoisted_259, [
                _cache[57] || (_cache[57] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Série en cours", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_260, _toDisplayString(_ctx.V.tr.streak), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_261, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tr.weeks || []), (wk, wk_i) => {
                  return (_openBlock(), _createElementBlock("span", {
                    key: wk_i,
                    style: _normalizeStyle(`flex: 1; height: ${wk.h}; border-radius: 6px; background: ${wk.bg}`)
                  }, null, 4 /* STYLE */))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _cache[58] || (_cache[58] = _createElementVNode("div", { style: {"display":"flex","justify-content":"space-between","font-size":"11.5px","color":"#7D8BA8"} }, [
                _createElementVNode("span", null, "il y a 7 semaines"),
                _createElementVNode("span", null, "cette semaine")
              ], -1 /* CACHED */)),
              _createElementVNode("span", _hoisted_262, _toDisplayString(_ctx.V.tr.streakSub), 1 /* TEXT */)
            ]),
            _createElementVNode("section", _hoisted_263, [
              _createElementVNode("div", _hoisted_264, [
                _cache[59] || (_cache[59] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"} }, "Succès", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_265, _toDisplayString(_ctx.V.tr.achText), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_266, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tr.ach || []), (ac, ac_i) => {
                  return (_openBlock(), _createElementBlock("div", {
                    key: ac_i,
                    style: {"display":"flex","flex-direction":"column","gap":"8px","padding":"12px","border-radius":"18px","border":"1px solid #1E2B45","background":"#111A2C"}
                  }, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`width: 34px; height: 34px; border-radius: 11px; background: ${ac.bg}; display: flex; align-items: center; justify-content: center`)
                    }, [
                      (ac.done)
                        ? (_openBlock(), _createElementBlock("svg", _hoisted_267, [...(_cache[60] || (_cache[60] = [
                            _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                          ]))]))
                        : _createCommentVNode("v-if", true),
                      (ac.todo)
                        ? (_openBlock(), _createElementBlock("svg", _hoisted_268, [...(_cache[61] || (_cache[61] = [
                            _createElementVNode("path", { d: "M12 7v5l3 2" }, null, -1 /* CACHED */),
                            _createElementVNode("circle", {
                              cx: "12",
                              cy: "12",
                              r: "8"
                            }, null, -1 /* CACHED */)
                          ]))]))
                        : _createCommentVNode("v-if", true)
                    ], 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_269, _toDisplayString(ac.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_270, _toDisplayString(ac.sub), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_271, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`display: block; width: ${ac.barW}; height: 100%; border-radius: 3px; background: ${ac.color}`)
                      }, null, 4 /* STYLE */)
                    ])
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _cache[62] || (_cache[62] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#7D8BA8","text-align":"center"} }, "Pas de quêtes ni de saisons : les paliers suivent seulement la valeur de ta collection, au prix du marché.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSettings)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 6 }, [
            _createElementVNode("section", _hoisted_272, [
              _cache[63] || (_cache[63] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Valoriser ma collection avec", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_273, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.valuations || []), (va, va_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: va_i,
                    type: "button",
                    onClick: va.pick,
                    "aria-pressed": _ctx.A(va.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${va.bc}; background: ${va.bg}; color: ${va.fg}; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(va.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_274))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("span", _hoisted_275, _toDisplayString(_ctx.V.set.valHelp), 1 /* TEXT */)
            ]),
            _createElementVNode("section", _hoisted_276, [
              _cache[64] || (_cache[64] = _createElementVNode("h2", { style: {"margin":"0 0 6px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Sources de prix", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.sources || []), (sc, sc_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: sc_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 54px; border-top: ${sc.border}`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; width: 8px; height: 8px; border-radius: 4px; background: ${sc.dot}`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_277, [
                    _createElementVNode("span", _hoisted_278, _toDisplayString(sc.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_279, _toDisplayString(sc.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_280, _toDisplayString(sc.state), 1 /* TEXT */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_281, [
              _createElementVNode("span", _hoisted_282, [
                (_openBlock(), _createElementBlock("svg", _hoisted_283, [...(_cache[65] || (_cache[65] = [
                  _createElementVNode("path", { d: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5" }, null, -1 /* CACHED */)
                ]))])),
                _cache[66] || (_cache[66] = _createTextVNode("MODE AVANCÉ", -1 /* CACHED */))
              ]),
              _createElementVNode("div", _hoisted_284, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.fan || []), (fn, fn_i) => {
                  return (_openBlock(), _createElementBlock("img", {
                    key: fn_i,
                    src: fn.img,
                    alt: "",
                    style: _normalizeStyle(`position: absolute; top: ${fn.top}; left: ${fn.left}; width: 74px; height: 86px; border-radius: 8px 8px 0 0; object-fit: cover; object-position: top; box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35); transform: rotate(${fn.rot}); -webkit-mask-image: linear-gradient(180deg, #000 80%, transparent); mask-image: linear-gradient(180deg, #000 80%, transparent)`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_285))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("span", _hoisted_286, _toDisplayString(_ctx.V.set.promoTitle), 1 /* TEXT */),
              _cache[67] || (_cache[67] = _createElementVNode("span", { style: {"font-size":"13.5px","line-height":"1.5","color":"#9AA8C3"} }, "Lots, associés, frais par plateforme, import et export. Tu peux revenir au mode simple à tout moment : rien n’est perdu.", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.toggleAdv,
                "aria-pressed": _ctx.A(_ctx.V.ui.adv),
                style: _normalizeStyle(`height: 48px; padding: 0 22px; border: 1px solid #2A3A5C; border-radius: 999px; background: ${_ctx.V.set.ctaBg}; color: ${_ctx.V.set.ctaFg}; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer`)
              }, _toDisplayString(_ctx.V.set.cta), 13 /* TEXT, STYLE, PROPS */, _hoisted_287)
            ]),
            (_ctx.V.ui.adv)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                  _createElementVNode("section", _hoisted_288, [
                    _cache[68] || (_cache[68] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Frais par plateforme", -1 /* CACHED */)),
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.feesList || []), (fl, fl_i) => {
                      return (_openBlock(), _createElementBlock("div", {
                        key: fl_i,
                        style: _normalizeStyle(`display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 46px; border-top: ${fl.border}`)
                      }, [
                        _createElementVNode("span", _hoisted_289, _toDisplayString(fl.label), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_290, _toDisplayString(fl.rule), 1 /* TEXT */)
                      ], 4 /* STYLE */))
                    }), 128 /* KEYED_FRAGMENT */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goFees,
                      style: {"height":"44px","margin-top":"6px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                    }, "Modifier les frais", 8 /* PROPS */, _hoisted_291)
                  ]),
                  _createElementVNode("section", _hoisted_292, [
                    _cache[78] || (_cache[78] = _createElementVNode("h2", { style: {"margin":"0","padding":"16px 16px 6px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Outils avancés", -1 /* CACHED */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goLots,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_294, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_295, [...(_cache[69] || (_cache[69] = [
                          _createElementVNode("path", { d: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5" }, null, -1 /* CACHED */)
                        ]))]))
                      ]),
                      _createElementVNode("span", _hoisted_296, [
                        _cache[70] || (_cache[70] = _createElementVNode("span", { style: {"font-weight":"600"} }, "Lots", -1 /* CACHED */)),
                        _createElementVNode("span", _hoisted_297, _toDisplayString(_ctx.V.set.lotsText), 1 /* TEXT */)
                      ]),
                      (_openBlock(), _createElementBlock("svg", _hoisted_298, [...(_cache[71] || (_cache[71] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_293),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goTeam,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid #1E2B45","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_300, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_301, [...(_cache[72] || (_cache[72] = [
                          _createElementVNode("circle", {
                            cx: "9",
                            cy: "8",
                            r: "3.5"
                          }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M16 4.6a3.5 3.5 0 0 1 0 6.8" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M18 14.3c2.1 0.6 3.5 2.6 3.5 5.7" }, null, -1 /* CACHED */)
                        ]))]))
                      ]),
                      _createElementVNode("span", _hoisted_302, [
                        _cache[73] || (_cache[73] = _createElementVNode("span", { style: {"font-weight":"600"} }, "Associés", -1 /* CACHED */)),
                        _createElementVNode("span", _hoisted_303, _toDisplayString(_ctx.V.set.teamText), 1 /* TEXT */)
                      ]),
                      (_openBlock(), _createElementBlock("svg", _hoisted_304, [...(_cache[74] || (_cache[74] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_299),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goIO,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid #1E2B45","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_306, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_307, [...(_cache[75] || (_cache[75] = [
                          _createElementVNode("path", { d: "M7 4v13" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M3.5 13.5L7 17l3.5-3.5" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M17 20V7" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M13.5 10.5L17 7l3.5 3.5" }, null, -1 /* CACHED */)
                        ]))]))
                      ]),
                      _cache[77] || (_cache[77] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                        _createElementVNode("span", { style: {"font-weight":"600"} }, "Importer / exporter"),
                        _createElementVNode("span", { style: {"font-size":"12.5px","color":"#9AA8C3"} }, "CSV, sans limite")
                      ], -1 /* CACHED */)),
                      (_openBlock(), _createElementBlock("svg", _hoisted_308, [...(_cache[76] || (_cache[76] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_305)
                  ])
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", _hoisted_309, [
              _cache[79] || (_cache[79] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "À propos", -1 /* CACHED */)),
              _cache[80] || (_cache[80] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#9AA8C3"} }, "PKM-App est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. Pokémon et les noms associés sont des marques de leurs propriétaires respectifs.", -1 /* CACHED */)),
              _cache[81] || (_cache[81] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","color":"#7D8BA8"} }, "Maquette v3 · prix fictifs · visuels provisoires", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.replayOnb,
                style: {"height":"44px","margin-top":"4px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
              }, "Revoir l’accueil", 8 /* PROPS */, _hoisted_310)
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSales)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 7 }, [
            _createElementVNode("div", _hoisted_311, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.periods || []), (pr, pr_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: pr_i,
                  type: "button",
                  onClick: pr.pick,
                  "aria-pressed": _ctx.A(pr.on),
                  style: _normalizeStyle(`height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${pr.bc}; background: ${pr.bg}; color: ${pr.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(pr.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_312))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_313, [
              _createElementVNode("div", _hoisted_314, [
                _createElementVNode("div", _hoisted_315, [
                  _createElementVNode("span", _hoisted_316, "Marge nette · " + _toDisplayString(_ctx.V.salesV.periodLabel), 1 /* TEXT */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 30px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; color: ${_ctx.V.salesV.marginColor}`)
                  }, _toDisplayString(_ctx.V.salesV.margin), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("div", _hoisted_317, [
                  _createElementVNode("span", null, _toDisplayString(_ctx.V.salesV.count), 1 /* TEXT */),
                  _createElementVNode("span", null, [
                    _cache[82] || (_cache[82] = _createTextVNode("encaissé ", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_318, _toDisplayString(_ctx.V.salesV.ca), 1 /* TEXT */)
                  ])
                ])
              ]),
              _createElementVNode("div", _hoisted_319, [
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.salesV.barCost} 1 0px; min-width: 3px; background: #34415F; border-radius: 4px 0 0 4px`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.salesV.barFees} 1 0px; min-width: 3px; background: #D5763A`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.salesV.barMargin} 1 0px; min-width: 3px; background: #6C84F2; border-radius: 0 4px 4px 0`)
                }, null, 4 /* STYLE */)
              ]),
              _createElementVNode("div", _hoisted_320, [
                _createElementVNode("span", _hoisted_321, [
                  _cache[83] || (_cache[83] = _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"2px","background":"#34415F","box-shadow":"inset 0 0 0 1px #56648A"} }, null, -1 /* CACHED */)),
                  _createTextVNode("Coût d’achat " + _toDisplayString(_ctx.V.salesV.cost), 1 /* TEXT */)
                ]),
                _createElementVNode("span", _hoisted_322, [
                  _cache[84] || (_cache[84] = _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"2px","background":"#D5763A"} }, null, -1 /* CACHED */)),
                  _createTextVNode("Frais et port " + _toDisplayString(_ctx.V.salesV.fees), 1 /* TEXT */)
                ]),
                _cache[85] || (_cache[85] = _createElementVNode("span", { style: {"display":"flex","align-items":"center","gap":"6px"} }, [
                  _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"2px","background":"#6C84F2"} }),
                  _createTextVNode("Marge nette")
                ], -1 /* CACHED */))
              ])
            ]),
            (_ctx.V.salesV.has)
              ? (_openBlock(), _createElementBlock("div", _hoisted_323, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.salesV.list || []), (sl, sl_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: sl_i,
                      type: "button",
                      onClick: sl.open,
                      style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 12px 14px; border: 0; border-top: ${sl.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                    }, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`position: relative; flex: none; width: 40px; height: 52px; border-radius: 8px; overflow: hidden; background: ${sl.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                      }, [
                        (sl.isCard)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: sl.img,
                              alt: "",
                              style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                            }, null, 8 /* PROPS */, _hoisted_325))
                          : _createCommentVNode("v-if", true),
                        (sl.isSealed)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 1,
                              src: sl.logo,
                              alt: "",
                              style: {"max-width":"34px","max-height":"24px","object-fit":"contain"}
                            }, null, 8 /* PROPS */, _hoisted_326))
                          : _createCommentVNode("v-if", true)
                      ], 4 /* STYLE */),
                      _createElementVNode("span", _hoisted_327, [
                        _createElementVNode("span", _hoisted_328, _toDisplayString(sl.name), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_329, [
                          _createTextVNode(_toDisplayString(sl.date), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_330, _toDisplayString(sl.platform), 1 /* TEXT */),
                          (sl.missing)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_331, "Port à renseigner"))
                            : _createCommentVNode("v-if", true)
                        ])
                      ]),
                      _createElementVNode("span", _hoisted_332, [
                        _createElementVNode("span", {
                          style: _normalizeStyle(`font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; color: ${sl.marginColor}`)
                        }, _toDisplayString(sl.margin), 5 /* TEXT, STYLE */),
                        _createElementVNode("span", _hoisted_333, _toDisplayString(sl.price), 1 /* TEXT */)
                      ])
                    ], 12 /* STYLE, PROPS */, _hoisted_324))
                  }), 128 /* KEYED_FRAGMENT */))
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.salesV.none)
              ? (_openBlock(), _createElementBlock("p", _hoisted_334, "Aucune vente sur cette période."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.newSale,
              style: {"flex":"none","height":"52px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
            }, "Enregistrer une vente faite ailleurs", 8 /* PROPS */, _hoisted_335),
            _cache[86] || (_cache[86] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#7D8BA8"} }, "PKM ne vend rien pour toi. Tu notes ici tes ventes faites sur Vinted, Cardmarket, eBay ou en main propre pour connaître ta marge nette réelle.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSale)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 8 }, [
            _createElementVNode("section", _hoisted_336, [
              _createElementVNode("div", _hoisted_337, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`position: relative; flex: none; width: 46px; height: 60px; border-radius: 9px; overflow: hidden; background: ${_ctx.V.sale.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                }, [
                  (_ctx.V.sale.isCard)
                    ? (_openBlock(), _createElementBlock("img", {
                        key: 0,
                        src: _ctx.V.sale.img,
                        alt: "",
                        style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                      }, null, 8 /* PROPS */, _hoisted_338))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.sale.isSealed)
                    ? (_openBlock(), _createElementBlock("img", {
                        key: 1,
                        src: _ctx.V.sale.logo,
                        alt: "",
                        style: {"max-width":"40px","max-height":"28px","object-fit":"contain"}
                      }, null, 8 /* PROPS */, _hoisted_339))
                    : _createCommentVNode("v-if", true)
                ], 4 /* STYLE */),
                _createElementVNode("span", _hoisted_340, [
                  _createElementVNode("span", _hoisted_341, _toDisplayString(_ctx.V.sale.name), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_342, _toDisplayString(_ctx.V.sale.meta), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("div", _hoisted_343, [
                _cache[87] || (_cache[87] = _createElementVNode("span", { style: {"font-size":"13px","color":"#C9D3EA"} }, "Marge nette", -1 /* CACHED */)),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 42px; line-height: 1.05; font-weight: 700; letter-spacing: -0.035em; color: ${_ctx.V.sale.marginColor}`)
                }, _toDisplayString(_ctx.V.sale.margin), 5 /* TEXT, STYLE */),
                _createElementVNode("span", _hoisted_344, _toDisplayString(_ctx.V.sale.rateText), 1 /* TEXT */)
              ]),
              (_ctx.V.sale.missing)
                ? (_openBlock(), _createElementBlock("div", _hoisted_345, _toDisplayString(_ctx.V.sale.missingText), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_346, [
              _cache[93] || (_cache[93] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Décomposition", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_347, [
                _createElementVNode("div", _hoisted_348, [
                  _cache[88] || (_cache[88] = _createElementVNode("span", null, "Prix de vente", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_349, _toDisplayString(_ctx.V.sale.price), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_350, [
                  _createElementVNode("span", _hoisted_351, [
                    _createElementVNode("span", null, "Commission " + _toDisplayString(_ctx.V.sale.platform), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_352, _toDisplayString(_ctx.V.sale.feeRule), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_353, _toDisplayString(_ctx.V.sale.commission), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_354, [
                  _createElementVNode("span", _hoisted_355, [
                    _cache[89] || (_cache[89] = _createElementVNode("span", null, "Port et emballage à ta charge", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_356, _toDisplayString(_ctx.V.sale.portRule), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_357, _toDisplayString(_ctx.V.sale.port), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_358, [
                  _createElementVNode("span", _hoisted_359, [
                    _cache[90] || (_cache[90] = _createElementVNode("span", null, "Coût d’achat", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_360, _toDisplayString(_ctx.V.sale.costRule), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_361, _toDisplayString(_ctx.V.sale.cost), 1 /* TEXT */)
                ]),
                _cache[92] || (_cache[92] = _createElementVNode("div", { style: {"height":"1px","background":"#1E2B45"} }, null, -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_362, [
                  _cache[91] || (_cache[91] = _createElementVNode("span", null, "Marge nette", -1 /* CACHED */)),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-variant-numeric: tabular-nums; color: ${_ctx.V.sale.marginColor}`)
                  }, _toDisplayString(_ctx.V.sale.margin), 5 /* TEXT, STYLE */)
                ])
              ]),
              _createElementVNode("div", _hoisted_363, [
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.sale.barCost} 1 0px; min-width: 3px; background: #34415F; border-radius: 4px 0 0 4px`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.sale.barFees} 1 0px; min-width: 3px; background: #D5763A; border-radius: ${_ctx.V.sale.feesRadius}`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`display: ${_ctx.V.sale.marginDisplay}; flex: ${_ctx.V.sale.barMargin} 1 0px; min-width: 3px; background: #6C84F2; border-radius: 0 4px 4px 0`)
                }, null, 4 /* STYLE */)
              ]),
              _cache[94] || (_cache[94] = _createStaticVNode("<div style=\"display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;color:#9AA8C3;\"><span style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:8px;height:8px;border-radius:2px;background:#34415F;box-shadow:inset 0 0 0 1px #56648A;\"></span>Coût d’achat</span><span style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:8px;height:8px;border-radius:2px;background:#D5763A;\"></span>Frais et port</span><span style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:8px;height:8px;border-radius:2px;background:#6C84F2;\"></span>Marge nette</span></div>", 1)),
              _createElementVNode("p", _hoisted_364, _toDisplayString(_ctx.V.sale.insight), 1 /* TEXT */)
            ]),
            (_ctx.V.ui.adv)
              ? (_openBlock(), _createElementBlock("div", _hoisted_365, [
                  _cache[95] || (_cache[95] = _createElementVNode("span", { style: {"color":"#9AA8C3"} }, "Vendu par", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_366, _toDisplayString(_ctx.V.sale.by), 1 /* TEXT */)
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.editSale,
              style: {"flex":"none","height":"52px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
            }, "Modifier la vente", 8 /* PROPS */, _hoisted_367)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isTerritory)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 9 }, [
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.ter.release.open,
              style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"12px 14px","border":"1px solid #24345C","border-radius":"20px","background":"radial-gradient(120% 140% at 0% 0%, rgba(35, 118, 92, 0.34), rgba(35, 118, 92, 0) 62%), #121C33","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
            }, [
              _createElementVNode("span", _hoisted_369, [
                _createElementVNode("img", {
                  src: _ctx.V.ter.release.logo,
                  alt: "",
                  style: {"max-width":"58px","max-height":"36px","object-fit":"contain"}
                }, null, 8 /* PROPS */, _hoisted_370)
              ]),
              _createElementVNode("span", _hoisted_371, [
                _createElementVNode("span", _hoisted_372, "Prochaine sortie · " + _toDisplayString(_ctx.V.ter.release.days), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_373, _toDisplayString(_ctx.V.ter.release.text), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_374, _toDisplayString(_ctx.V.ter.release.date) + " · " + _toDisplayString(_ctx.V.ter.release.note), 1 /* TEXT */)
              ]),
              (_openBlock(), _createElementBlock("svg", _hoisted_375, [...(_cache[96] || (_cache[96] = [
                _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
              ]))]))
            ], 8 /* PROPS */, _hoisted_368),
            _createElementVNode("div", _hoisted_376, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.prods || []), (tp, tp_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: tp_i,
                  type: "button",
                  onClick: tp.pick,
                  "aria-pressed": _ctx.A(tp.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${tp.bc}; background: ${tp.bg}; color: ${tp.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(tp.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_377))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_378, [
              (_openBlock(), _createElementBlock("svg", {
                width: "100%",
                height: "100%",
                viewBox: "0 0 358 210",
                role: "img",
                "aria-label": _ctx.A(_ctx.V.ter.mapLabel),
                style: {"position":"absolute","left":"0","top":"0","display":"block"}
              }, [
                _cache[97] || (_cache[97] = _createStaticVNode("<path d=\"M0 168 C 60 154, 112 184, 176 172 S 286 146, 358 164 L358 210 L0 210 Z\" style=\"fill:#11294A;stroke:none;\"></path><path d=\"M262 18 h66 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-66 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12 z\" style=\"fill:#11291F;stroke:none;\"></path><path d=\"M22 22 h54 a10 10 0 0 1 10 10 v22 a10 10 0 0 1 -10 10 h-54 a10 10 0 0 1 -10 -10 v-22 a10 10 0 0 1 10 -10 z\" style=\"fill:#11291F;stroke:none;\"></path><path d=\"M-10 74 L368 100\" style=\"fill:none;stroke:#1B2944;stroke-width:8;stroke-linecap:round;\"></path><path d=\"M-10 132 L368 124\" style=\"fill:none;stroke:#1B2944;stroke-width:6;stroke-linecap:round;\"></path><path d=\"M110 -10 L148 220\" style=\"fill:none;stroke:#1B2944;stroke-width:8;stroke-linecap:round;\"></path><path d=\"M238 -10 C 226 60, 262 120, 244 220\" style=\"fill:none;stroke:#1B2944;stroke-width:6;stroke-linecap:round;\"></path><path d=\"M30 200 L190 20\" style=\"fill:none;stroke:#172339;stroke-width:4;stroke-linecap:round;\"></path>", 8)),
                _createElementVNode("ellipse", {
                  cx: "179",
                  cy: "105",
                  rx: _ctx.V.ter.ringRx,
                  ry: _ctx.V.ter.ringRy,
                  style: {"fill":"rgba(168, 182, 255, 0.06)","stroke":"rgba(168, 182, 255, 0.5)","stroke-width":"1.2","stroke-dasharray":"4 4"}
                }, null, 8 /* PROPS */, _hoisted_380),
                _cache[98] || (_cache[98] = _createElementVNode("circle", {
                  cx: "179",
                  cy: "105",
                  r: "7",
                  class: "pkm-anim",
                  style: {"fill":"rgba(61, 99, 255, 0.45)","transform-box":"fill-box","transform-origin":"center","animation":"pkmPing 2.4s ease-out infinite"}
                }, null, -1 /* CACHED */)),
                _cache[99] || (_cache[99] = _createElementVNode("circle", {
                  cx: "179",
                  cy: "105",
                  r: "6.5",
                  style: {"fill":"#3D63FF","stroke":"#FFFFFF","stroke-width":"2.5"}
                }, null, -1 /* CACHED */))
              ], 8 /* PROPS */, _hoisted_379)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.pins || []), (pn, pn_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: pn_i,
                  type: "button",
                  onClick: pn.open,
                  "aria-label": _ctx.A(pn.label),
                  style: _normalizeStyle(`position: absolute; left: ${pn.left}; top: ${pn.top}; width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`min-width: 42px; height: 22px; box-sizing: border-box; padding: 0 6px; border-radius: 11px; border: 2px solid #0B1120; background: ${pn.fill}; color: #0B1120; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45)`)
                  }, _toDisplayString(pn.text), 5 /* TEXT, STYLE */)
                ], 12 /* STYLE, PROPS */, _hoisted_381))
              }), 128 /* KEYED_FRAGMENT */)),
              _cache[100] || (_cache[100] = _createStaticVNode("<span aria-hidden=\"true\" style=\"position:absolute;left:10px;bottom:9px;display:flex;align-items:center;gap:10px;padding:4px 9px;border-radius:999px;background:rgba(8, 13, 26, 0.8);font-size:11px;font-weight:600;color:#C9D3EA;\"><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:#3DDC84;\"></span>Forte</span><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:#F5B14C;\"></span>Moyenne</span><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:#9AA8C3;\"></span>Faible</span></span><span aria-hidden=\"true\" style=\"position:absolute;right:10px;top:9px;display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:rgba(8, 13, 26, 0.8);font-size:11px;font-weight:600;color:#C9D3EA;\"><span style=\"width:8px;height:8px;border-radius:4px;background:#3D63FF;box-shadow:0 0 0 2px #FFFFFF;\"></span>Toi · échelle non linéaire</span>", 2))
            ]),
            _createElementVNode("div", _hoisted_382, [
              _createElementVNode("div", _hoisted_383, [
                _cache[101] || (_cache[101] = _createElementVNode("span", { style: {"flex":"none","width":"74px","font-size":"12.5px","font-weight":"600","color":"#9AA8C3"} }, "Probabilité", -1 /* CACHED */)),
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.probs || []), (tq, tq_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: tq_i,
                    type: "button",
                    onClick: tq.pick,
                    "aria-pressed": _ctx.A(tq.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${tq.bc}; background: ${tq.bg}; color: ${tq.fg}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(tq.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_384))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("div", _hoisted_385, [
                _cache[102] || (_cache[102] = _createElementVNode("span", { style: {"flex":"none","width":"74px","font-size":"12.5px","font-weight":"600","color":"#9AA8C3"} }, "Rayon", -1 /* CACHED */)),
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.radii || []), (tr2, tr2_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: tr2_i,
                    type: "button",
                    onClick: tr2.pick,
                    "aria-pressed": _ctx.A(tr2.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${tr2.bc}; background: ${tr2.bg}; color: ${tr2.fg}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(tr2.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_386))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _createElementVNode("span", _hoisted_387, _toDisplayString(_ctx.V.ter.count), 1 /* TEXT */),
            (_ctx.V.ter.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_388, "Aucun magasin ne correspond : élargis le rayon ou baisse le seuil de probabilité."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_389, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.list || []), (so2, so2_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: so2_i,
                  type: "button",
                  onClick: so2.open,
                  style: _normalizeStyle(`display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 0; border-top: ${so2.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                }, [
                  _createElementVNode("span", _hoisted_391, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_392, [
                      _createElementVNode("path", {
                        d: so2.icon
                      }, null, 8 /* PROPS */, _hoisted_393)
                    ]))
                  ]),
                  _createElementVNode("span", _hoisted_394, [
                    _createElementVNode("span", _hoisted_395, [
                      _createElementVNode("span", _hoisted_396, _toDisplayString(so2.name), 1 /* TEXT */),
                      (so2.partner)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_397, "★ Partenaire PKM"))
                        : _createCommentVNode("v-if", true)
                    ]),
                    _createElementVNode("span", _hoisted_398, _toDisplayString(so2.kind) + " · " + _toDisplayString(so2.dist), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_399, _toDisplayString(so2.when), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_400, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((so2.chips || []), (ch, ch_i) => {
                        return (_openBlock(), _createElementBlock("span", {
                          key: ch_i,
                          style: {"display":"flex","align-items":"center","gap":"5px","padding":"2px 8px","border-radius":"999px","border":"1px solid #2A3A5C","font-size":"11.5px","font-weight":"600","color":"#C9D3EA"}
                        }, [
                          _createElementVNode("span", {
                            style: _normalizeStyle(`flex: none; width: 7px; height: 7px; border-radius: 4px; background: ${ch.color}`)
                          }, null, 4 /* STYLE */),
                          _createTextVNode(_toDisplayString(ch.name) + " · " + _toDisplayString(ch.prob), 1 /* TEXT */)
                        ]))
                      }), 128 /* KEYED_FRAGMENT */))
                    ]),
                    _createElementVNode("span", _hoisted_401, _toDisplayString(so2.src), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_402, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: ${so2.color}`)
                    }, _toDisplayString(so2.prob), 5 /* TEXT, STYLE */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${so2.tint}; color: ${so2.color}; font-size: 11px; font-weight: 700`)
                    }, _toDisplayString(so2.level), 5 /* TEXT, STYLE */)
                  ])
                ], 12 /* STYLE, PROPS */, _hoisted_390))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _cache[103] || (_cache[103] = _createElementVNode("section", {
              "aria-label": "Comment on estime la probabilité",
              style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid #1E2B45","background":"#0F1828","display":"flex","flex-direction":"column","gap":"6px"}
            }, [
              _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "Comment on estime la probabilité ?"),
              _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#9AA8C3"} }, "Trois sources : l’annonce du magasin (boutiques partenaires PKM), les signalements des collectionneurs et l’historique des arrivages (jour de la semaine, délai après une sortie). C’est une estimation, pas une garantie de stock. Aucune donnée n’est récupérée sur les sites des enseignes.")
            ], -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isStore)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 10 }, [
            _createElementVNode("section", _hoisted_403, [
              _createElementVNode("div", _hoisted_404, [
                _createElementVNode("span", _hoisted_405, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_406, [
                    _createElementVNode("path", {
                      d: _ctx.V.store.icon
                    }, null, 8 /* PROPS */, _hoisted_407)
                  ]))
                ]),
                _createElementVNode("span", _hoisted_408, [
                  _createElementVNode("span", _hoisted_409, _toDisplayString(_ctx.V.store.open), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_410, _toDisplayString(_ctx.V.store.hours), 1 /* TEXT */),
                  (_ctx.V.store.partner)
                    ? (_openBlock(), _createElementBlock("span", _hoisted_411, "★ Partenaire PKM"))
                    : _createCommentVNode("v-if", true)
                ]),
                _createElementVNode("span", _hoisted_412, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: ${_ctx.V.store.color}`)
                  }, _toDisplayString(_ctx.V.store.prob), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${_ctx.V.store.tint}; color: ${_ctx.V.store.color}; font-size: 11.5px; font-weight: 700`)
                  }, _toDisplayString(_ctx.V.store.level), 5 /* TEXT, STYLE */)
                ])
              ]),
              _createElementVNode("p", _hoisted_413, _toDisplayString(_ctx.V.store.partnerNote), 1 /* TEXT */)
            ]),
            _createElementVNode("section", _hoisted_414, [
              _cache[104] || (_cache[104] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Prochains arrivages", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.store.arrivals || []), (ar, ar_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ar_i,
                  style: _normalizeStyle(`display: flex; gap: 12px; padding: 12px 0; border-top: ${ar.border}`)
                }, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: ar.openItem,
                    "aria-label": _ctx.A(ar.aria),
                    style: _normalizeStyle(`position: relative; flex: none; width: 44px; height: 58px; padding: 0; border: 0; border-radius: 8px; overflow: hidden; background: ${ar.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12); cursor: pointer`)
                  }, [
                    (ar.isCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: ar.img,
                          alt: "",
                          style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                        }, null, 8 /* PROPS */, _hoisted_416))
                      : _createCommentVNode("v-if", true),
                    (ar.isSealed)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: ar.logo,
                          alt: "",
                          style: {"max-width":"38px","max-height":"26px","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_417))
                      : _createCommentVNode("v-if", true)
                  ], 12 /* STYLE, PROPS */, _hoisted_415),
                  _createElementVNode("div", _hoisted_418, [
                    _createElementVNode("div", _hoisted_419, [
                      _createElementVNode("span", _hoisted_420, _toDisplayString(ar.name), 1 /* TEXT */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`flex: none; font-size: 14.5px; font-weight: 800; color: ${ar.color}`)
                      }, _toDisplayString(ar.prob), 5 /* TEXT, STYLE */)
                    ]),
                    _createElementVNode("span", _hoisted_421, _toDisplayString(ar.when), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_422, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`display: block; width: ${ar.barW}; height: 100%; border-radius: 3px; background: ${ar.color}`)
                      }, null, 4 /* STYLE */)
                    ]),
                    _createElementVNode("span", _hoisted_423, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${ar.tint}; color: ${ar.color}; font-size: 11px; font-weight: 700`)
                      }, _toDisplayString(ar.level), 5 /* TEXT, STYLE */),
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((ar.srcs || []), (sr2, sr2_i) => {
                        return (_openBlock(), _createElementBlock("span", {
                          key: sr2_i,
                          style: {"padding":"1px 8px","border-radius":"999px","border":"1px solid #2A3A5C","color":"#C9D3EA","font-size":"11px","font-weight":"600"}
                        }, _toDisplayString(sr2.label), 1 /* TEXT */))
                      }), 128 /* KEYED_FRAGMENT */)),
                      _createElementVNode("span", _hoisted_424, _toDisplayString(ar.cote), 1 /* TEXT */)
                    ])
                  ])
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_425, [
              _cache[105] || (_cache[105] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Historique des arrivages", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.store.history || []), (hs, hs_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: hs_i,
                  style: _normalizeStyle(`display: flex; gap: 12px; align-items: baseline; min-height: 40px; padding-top: 8px; border-top: ${hs.border}`)
                }, [
                  _createElementVNode("span", _hoisted_426, _toDisplayString(hs.date), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_427, _toDisplayString(hs.text), 1 /* TEXT */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("div", _hoisted_428, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.store.toggleAlert,
                "aria-pressed": _ctx.A(_ctx.V.store.alertOn),
                style: _normalizeStyle(`height: 54px; border: 1px solid ${_ctx.V.store.alertBc}; border-radius: 999px; background: ${_ctx.V.store.alertBg}; color: ${_ctx.V.store.alertFg}; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer`)
              }, _toDisplayString(_ctx.V.store.alertLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_429),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.store.route,
                style: {"height":"54px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
              }, "Itinéraire", 8 /* PROPS */, _hoisted_430)
            ]),
            _cache[106] || (_cache[106] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","line-height":"1.5","color":"#7D8BA8"} }, "Probabilité estimée, pas une garantie de stock. Magasins et arrivages de démonstration : noms et données fictifs.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isLots)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 11 }, [
            _cache[109] || (_cache[109] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"#9AA8C3"} }, "Un lot, c’est plusieurs articles payés en un seul prix. Ce prix est réparti entre les articles pour calculer leur coût d’achat et ta plus-value.", -1 /* CACHED */)),
            _createElementVNode("section", _hoisted_431, [
              _createElementVNode("div", _hoisted_432, [
                _createElementVNode("div", _hoisted_433, [
                  _createElementVNode("h2", _hoisted_434, _toDisplayString(_ctx.V.lots.title), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_435, _toDisplayString(_ctx.V.lots.meta), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_436, [
                  _createElementVNode("span", _hoisted_437, _toDisplayString(_ctx.V.lots.total), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_438, _toDisplayString(_ctx.V.lots.count), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("div", _hoisted_439, [
                _cache[107] || (_cache[107] = _createElementVNode("span", { style: {"font-size":"13px","color":"#9AA8C3"} }, "Répartir le prix du lot", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_440, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.lots.methods || []), (lm, lm_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: lm_i,
                      type: "button",
                      onClick: lm.pick,
                      "aria-pressed": _ctx.A(lm.on),
                      style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 10px; border-radius: 999px; border: 1px solid ${lm.bc}; background: ${lm.bg}; color: ${lm.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                    }, _toDisplayString(lm.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_441))
                  }), 128 /* KEYED_FRAGMENT */))
                ]),
                _createElementVNode("span", _hoisted_442, _toDisplayString(_ctx.V.lots.methodHelp), 1 /* TEXT */)
              ]),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.lots.lines || []), (ll, ll_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ll_i,
                  style: {"display":"flex","align-items":"center","gap":"12px","min-height":"70px","border-top":"1px solid #1E2B45"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; flex: none; width: 40px; height: 52px; border-radius: 8px; overflow: hidden; background: ${ll.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                  }, [
                    (ll.isCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: ll.img,
                          alt: "",
                          style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                        }, null, 8 /* PROPS */, _hoisted_443))
                      : _createCommentVNode("v-if", true),
                    (ll.isSealed)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: ll.logo,
                          alt: "",
                          style: {"max-width":"34px","max-height":"24px","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_444))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_445, [
                    _createElementVNode("span", _hoisted_446, _toDisplayString(ll.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_447, _toDisplayString(ll.meta), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_448, [
                    _createElementVNode("span", _hoisted_449, _toDisplayString(ll.unitCost), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_450, _toDisplayString(ll.total), 1 /* TEXT */)
                  ])
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_451, [
              _cache[108] || (_cache[108] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Effet sur tes marges", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.lots.impacts || []), (im, im_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: im_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 54px; border-top: ${im.border}`)
                }, [
                  _createElementVNode("span", _hoisted_452, [
                    _createElementVNode("span", _hoisted_453, _toDisplayString(im.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_454, _toDisplayString(im.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-size: 14.5px; font-weight: 700; font-variant-numeric: tabular-nums; color: ${im.color}`)
                  }, _toDisplayString(im.value), 5 /* TEXT, STYLE */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isFees)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 12 }, [
            _cache[113] || (_cache[113] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"#9AA8C3"} }, "Appliqués automatiquement aux ventes que tu notes. Une vente déjà enregistrée garde ses frais : tu peux les corriger vente par vente.", -1 /* CACHED */)),
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.feesEdit || []), (fe, fe_i) => {
              return (_openBlock(), _createElementBlock("section", {
                key: fe_i,
                "aria-label": _ctx.A(fe.label),
                style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid #1E2B45","background":"#111A2C","display":"flex","flex-direction":"column","gap":"10px"}
              }, [
                _createElementVNode("h2", _hoisted_456, _toDisplayString(fe.label), 1 /* TEXT */),
                _createElementVNode("div", _hoisted_457, [
                  _createElementVNode("label", _hoisted_458, [
                    _cache[110] || (_cache[110] = _createTextVNode("Commission (%)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-3",
                      type: "text",
                      inputmode: "decimal",
                      value: fe.rate,
                      onInput: fe.onRate,
                      style: {"height":"46px","width":"100%","box-sizing":"border-box","padding":"0 12px","border":"1px solid #2A3A5C","border-radius":"14px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"15px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_459)
                  ]),
                  _createElementVNode("label", _hoisted_460, [
                    _cache[111] || (_cache[111] = _createTextVNode("Fixe par vente (€)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-4",
                      type: "text",
                      inputmode: "decimal",
                      value: fe.fixed,
                      onInput: fe.onFixed,
                      style: {"height":"46px","width":"100%","box-sizing":"border-box","padding":"0 12px","border":"1px solid #2A3A5C","border-radius":"14px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"15px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_461)
                  ]),
                  _createElementVNode("label", _hoisted_462, [
                    _cache[112] || (_cache[112] = _createTextVNode("Port à ta charge (€)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-5",
                      type: "text",
                      inputmode: "decimal",
                      value: fe.port,
                      onInput: fe.onPort,
                      style: {"height":"46px","width":"100%","box-sizing":"border-box","padding":"0 12px","border":"1px solid #2A3A5C","border-radius":"14px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"15px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_463)
                  ])
                ]),
                _createElementVNode("p", _hoisted_464, _toDisplayString(fe.example), 1 /* TEXT */)
              ], 8 /* PROPS */, _hoisted_455))
            }), 128 /* KEYED_FRAGMENT */)),
            _cache[114] || (_cache[114] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"#F5B14C"} }, "Valeurs d’exemple, à vérifier selon ton statut (particulier ou professionnel) et les conditions de chaque plateforme.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isTeam)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 13 }, [
            _createElementVNode("section", _hoisted_465, [
              _cache[116] || (_cache[116] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Équipe", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.team.members || []), (m, m_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: m_i,
                  style: {"display":"flex","align-items":"center","gap":"12px"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; width: 42px; height: 42px; border-radius: 21px; background: ${m.avatarBg}; color: #0B1120; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-weight: 700`)
                  }, _toDisplayString(m.initial), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", _hoisted_466, [
                    _createElementVNode("span", _hoisted_467, _toDisplayString(m.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_468, _toDisplayString(m.role), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_469, [
                    _cache[115] || (_cache[115] = _createElementVNode("span", { style: {"font-size":"12px","color":"#7D8BA8"} }, "Apports", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_470, _toDisplayString(m.apport), 1 /* TEXT */)
                  ])
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_471, [
              _cache[117] || (_cache[117] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Partage de la marge nette", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_472, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.team.rules || []), (ru, ru_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: ru_i,
                    type: "button",
                    onClick: ru.pick,
                    "aria-pressed": _ctx.A(ru.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 8px; border-radius: 999px; border: 1px solid ${ru.bc}; background: ${ru.bg}; color: ${ru.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(ru.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_473))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.team.members || []), (m, m_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: m_i,
                  style: {"display":"flex","justify-content":"space-between","align-items":"center","gap":"12px","min-height":"42px"}
                }, [
                  _createElementVNode("span", _hoisted_474, [
                    _createElementVNode("span", _hoisted_475, _toDisplayString(m.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_476, _toDisplayString(m.shareLabel), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: ${m.color}`)
                  }, _toDisplayString(m.amount), 5 /* TEXT, STYLE */)
                ]))
              }), 128 /* KEYED_FRAGMENT */)),
              _createElementVNode("p", _hoisted_477, _toDisplayString(_ctx.V.team.total), 1 /* TEXT */)
            ]),
            _cache[118] || (_cache[118] = _createElementVNode("p", { style: {"margin":"0","font-size":"13px","line-height":"1.5","color":"#9AA8C3"} }, "Chaque ajout et chaque vente indique l’associé qui l’a fait. Les apports sont les achats payés par chacun.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isIO)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 14 }, [
            _createElementVNode("section", _hoisted_478, [
              _cache[120] || (_cache[120] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Importer", -1 /* CACHED */)),
              _cache[121] || (_cache[121] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"#9AA8C3"} }, "Un fichier CSV : ton tableur actuel, ou l’export d’une autre app de collection.", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.demoImport,
                style: {"height":"52px","border":"1.5px dashed #3A4A75","border-radius":"16px","background":"#0B1120","color":"#F3F6FC","font":"inherit","font-size":"14.5px","font-weight":"600","cursor":"pointer"}
              }, "Choisir un fichier CSV", 8 /* PROPS */, _hoisted_479),
              _cache[122] || (_cache[122] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "Colonnes reconnues automatiquement", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.io.mapping || []), (mp, mp_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: mp_i,
                  style: {"display":"flex","align-items":"center","gap":"10px","min-height":"40px","border-top":"1px solid #1E2B45","font-size":"13.5px"}
                }, [
                  _createElementVNode("span", _hoisted_480, _toDisplayString(mp.from), 1 /* TEXT */),
                  (_openBlock(), _createElementBlock("svg", _hoisted_481, [...(_cache[119] || (_cache[119] = [
                    _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */),
                    _createElementVNode("path", { d: "M13 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))])),
                  _createElementVNode("span", _hoisted_482, _toDisplayString(mp.to), 1 /* TEXT */)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_483, [
              _cache[123] || (_cache[123] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Exporter", -1 /* CACHED */)),
              _cache[124] || (_cache[124] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"#9AA8C3"} }, "Toute ta collection et ton historique, sans limite : ajouts, ventes, cotes et frais.", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.demoExport,
                style: {"height":"52px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
              }, "Exporter en CSV", 8 /* PROPS */, _hoisted_484),
              _createElementVNode("span", _hoisted_485, _toDisplayString(_ctx.V.io.exportInfo), 1 /* TEXT */)
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true)
    ]),
    _createElementVNode("nav", _hoisted_486, [
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabHome,
        "aria-label": "Accueil",
        "aria-current": _ctx.A(_ctx.V.tab.homeCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.homeFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_488, [...(_cache[125] || (_cache[125] = [
          _createElementVNode("path", { d: "M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.homeDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_487),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabCollection,
        "aria-label": "Collection",
        "aria-current": _ctx.A(_ctx.V.tab.collCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.collFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_490, [...(_cache[126] || (_cache[126] = [
          _createElementVNode("path", { d: "M8.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 7 18.5V6a1.5 1.5 0 0 1 1.5-1.5z" }, null, -1 /* CACHED */),
          _createElementVNode("path", { d: "M4.5 7.5v10.5a2 2 0 0 0 2 2" }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.collDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_489),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.openScan,
        "aria-label": "Scanner une carte ou un produit",
        class: "pkm-anim",
        style: {"justify-self":"center","width":"62px","height":"62px","margin-top":"-30px","padding":"0","border":"4px solid #0B1120","border-radius":"31px","background":"linear-gradient(160deg, #5B7BFF, #3D63FF 60%, #2F4FE0)","color":"#FFFFFF","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer","animation":"pkmPulse 2.6s ease-in-out infinite"}
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_492, [...(_cache[127] || (_cache[127] = [
          _createElementVNode("path", { d: "M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.6-2.2h5.4L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" }, null, -1 /* CACHED */),
          _createElementVNode("circle", {
            cx: "12",
            cy: "12.8",
            r: "3.4"
          }, null, -1 /* CACHED */)
        ]))]))
      ], 8 /* PROPS */, _hoisted_491),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabMarket,
        "aria-label": "Marché",
        "aria-current": _ctx.A(_ctx.V.tab.mktCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.mktFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_494, [...(_cache[128] || (_cache[128] = [
          _createElementVNode("path", { d: "M4 19.5h16" }, null, -1 /* CACHED */),
          _createElementVNode("path", { d: "M5 15.5l4.5-4.5 3.5 3 6-6.5" }, null, -1 /* CACHED */),
          _createElementVNode("path", { d: "M15 7.5h4v4" }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.mktDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_493),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabTerritory,
        "aria-label": "Territoire",
        "aria-current": _ctx.A(_ctx.V.tab.terCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.terFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_496, [...(_cache[129] || (_cache[129] = [
          _createElementVNode("path", { d: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" }, null, -1 /* CACHED */),
          _createElementVNode("circle", {
            cx: "12",
            cy: "10",
            r: "2.4"
          }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.terDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_495)
    ]),
    (_ctx.V.ui.isScan)
      ? (_openBlock(), _createElementBlock("section", _hoisted_497, [
          _cache[138] || (_cache[138] = _createElementVNode("div", {
            "aria-hidden": "true",
            style: {"position":"absolute","inset":"0","background":"repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.025) 0 2px, rgba(255, 255, 255, 0) 2px 9px)"}
          }, null, -1 /* CACHED */)),
          _createElementVNode("div", {
            "aria-hidden": "true",
            style: _normalizeStyle(`position: absolute; inset: 0; background: ${_ctx.V.scan.glow}`)
          }, null, 4 /* STYLE */),
          _createElementVNode("div", _hoisted_498, [
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.scan.close,
              "aria-label": "Fermer le scan",
              style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid rgba(255, 255, 255, 0.14)","border-radius":"22px","background":"rgba(8, 13, 26, 0.6)","color":"#FFFFFF","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
            }, [
              (_openBlock(), _createElementBlock("svg", _hoisted_500, [...(_cache[130] || (_cache[130] = [
                _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
              ]))]))
            ], 8 /* PROPS */, _hoisted_499),
            _createElementVNode("div", _hoisted_501, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.toCard,
                "aria-pressed": _ctx.A(_ctx.V.scan.modeCard),
                style: _normalizeStyle(`height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: ${_ctx.V.scan.cardBg}; color: ${_ctx.V.scan.cardFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
              }, "Carte", 12 /* STYLE, PROPS */, _hoisted_502),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.toSealed,
                "aria-pressed": _ctx.A(_ctx.V.scan.modeSealed),
                style: _normalizeStyle(`height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: ${_ctx.V.scan.sealedBg}; color: ${_ctx.V.scan.sealedFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
              }, "Scellé", 12 /* STYLE, PROPS */, _hoisted_503)
            ]),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.scan.torch,
              "aria-label": _ctx.A(_ctx.V.scan.torchLabel),
              "aria-pressed": _ctx.A(_ctx.V.scan.torchOn),
              style: _normalizeStyle(`flex: none; width: 44px; height: 44px; padding: 0; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 22px; background: ${_ctx.V.scan.torchBg}; color: ${_ctx.V.scan.torchFg}; display: flex; align-items: center; justify-content: center; cursor: pointer`)
            }, [
              (_openBlock(), _createElementBlock("svg", _hoisted_505, [...(_cache[131] || (_cache[131] = [
                _createElementVNode("path", { d: "M13 3L5 13.5h6L10 21l8-10.5h-6z" }, null, -1 /* CACHED */)
              ]))]))
            ], 12 /* STYLE, PROPS */, _hoisted_504)
          ]),
          _createElementVNode("div", _hoisted_506, [
            _createElementVNode("span", _hoisted_507, _toDisplayString(_ctx.V.scan.hint), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_508, [
              (_ctx.V.scan.plainCard)
                ? (_openBlock(), _createElementBlock("img", {
                    key: 0,
                    src: _ctx.V.scan.img,
                    alt: _ctx.V.scan.name,
                    style: {"position":"absolute","left":"22px","top":"18px","width":"200px","height":"232px","border-radius":"10px 10px 0 0","object-fit":"cover","object-position":"top","transform":"rotate(-3deg)","box-shadow":"0 26px 44px rgba(0, 0, 0, 0.6)","-webkit-mask-image":"linear-gradient(180deg, #000 86%, transparent)","mask-image":"linear-gradient(180deg, #000 86%, transparent)"}
                  }, null, 8 /* PROPS */, _hoisted_509))
                : _createCommentVNode("v-if", true),
              (_ctx.V.scan.graded)
                ? (_openBlock(), _createElementBlock("div", _hoisted_510, [
                    _createElementVNode("span", _hoisted_511, [
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.scan.name), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.scan.grade), 1 /* TEXT */)
                    ]),
                    _createElementVNode("img", {
                      src: _ctx.V.scan.img,
                      alt: _ctx.V.scan.name,
                      style: {"display":"block","width":"196px","height":"220px","object-fit":"cover","object-position":"top"}
                    }, null, 8 /* PROPS */, _hoisted_512)
                  ]))
                : _createCommentVNode("v-if", true),
              (_ctx.V.scan.isSealed)
                ? (_openBlock(), _createElementBlock("div", {
                    key: 2,
                    style: _normalizeStyle(`position: absolute; left: 22px; top: 40px; width: 200px; height: 220px; border-radius: 14px; background: ${_ctx.V.scan.bg}; transform: rotate(-2deg); box-shadow: 0 26px 44px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.16)`)
                  }, [
                    _createElementVNode("img", {
                      src: _ctx.V.scan.logo,
                      alt: _ctx.V.scan.name,
                      style: {"position":"absolute","left":"20px","top":"34px","width":"160px","height":"72px","object-fit":"contain"}
                    }, null, 8 /* PROPS */, _hoisted_513),
                    (_openBlock(), _createElementBlock("svg", _hoisted_514, [
                      _createElementVNode("path", {
                        d: _ctx.V.scan.glyph
                      }, null, 8 /* PROPS */, _hoisted_515)
                    ])),
                    _cache[132] || (_cache[132] = _createElementVNode("span", {
                      "aria-hidden": "true",
                      style: {"position":"absolute","left":"50px","bottom":"14px","width":"100px","height":"26px","border-radius":"3px","background":"repeating-linear-gradient(90deg, #FFFFFF 0 2px, rgba(255, 255, 255, 0) 2px 4px, #FFFFFF 4px 5px, rgba(255, 255, 255, 0) 5px 8px)","opacity":"0.85"}
                    }, null, -1 /* CACHED */))
                  ], 4 /* STYLE */))
                : _createCommentVNode("v-if", true),
              _cache[133] || (_cache[133] = _createStaticVNode("<span aria-hidden=\"true\" style=\"position:absolute;left:0;top:0;width:38px;height:38px;box-sizing:border-box;border-left:4px solid #A8B6FF;border-top:4px solid #A8B6FF;border-radius:14px 0 0 0;\"></span><span aria-hidden=\"true\" style=\"position:absolute;right:0;top:0;width:38px;height:38px;box-sizing:border-box;border-right:4px solid #A8B6FF;border-top:4px solid #A8B6FF;border-radius:0 14px 0 0;\"></span><span aria-hidden=\"true\" style=\"position:absolute;left:0;bottom:0;width:38px;height:38px;box-sizing:border-box;border-left:4px solid #A8B6FF;border-bottom:4px solid #A8B6FF;border-radius:0 0 0 14px;\"></span><span aria-hidden=\"true\" style=\"position:absolute;right:0;bottom:0;width:38px;height:38px;box-sizing:border-box;border-right:4px solid #A8B6FF;border-bottom:4px solid #A8B6FF;border-radius:0 0 14px 0;\"></span><span aria-hidden=\"true\" class=\"pkm-anim\" style=\"position:absolute;left:14px;right:14px;top:30px;height:2px;border-radius:1px;background:linear-gradient(90deg, rgba(168, 182, 255, 0), #A8B6FF, rgba(168, 182, 255, 0));box-shadow:0 0 14px #A8B6FF;animation:pkmScan 2.2s ease-in-out infinite alternate;\"></span>", 5))
            ]),
            _createElementVNode("span", _hoisted_516, [
              _cache[134] || (_cache[134] = _createElementVNode("span", { style: {"flex":"none","width":"8px","height":"8px","border-radius":"4px","background":"#3DDC84","box-shadow":"0 0 8px #3DDC84"} }, null, -1 /* CACHED */)),
              _createElementVNode("span", _hoisted_517, _toDisplayString(_ctx.V.scan.status), 1 /* TEXT */)
            ]),
            _createElementVNode("span", _hoisted_518, _toDisplayString(_ctx.V.scan.conf), 1 /* TEXT */),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.scan.next,
              style: {"height":"44px","margin-top":"-8px","padding":"0 14px","border":"0","background":"transparent","color":"#B9C5FF","font":"inherit","font-size":"13.5px","font-weight":"600","text-decoration":"underline","text-underline-offset":"3px","cursor":"pointer"}
            }, "Démo : changer d’article devant l’objectif", 8 /* PROPS */, _hoisted_519)
          ]),
          _createElementVNode("div", _hoisted_520, [
            _createElementVNode("span", _hoisted_521, _toDisplayString(_ctx.V.scan.count), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_522, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.photo,
                "aria-label": "Importer une photo",
                style: {"justify-self":"start","width":"52px","height":"52px","padding":"0","border":"1px solid rgba(255, 255, 255, 0.16)","border-radius":"16px","background":"rgba(8, 13, 26, 0.6)","color":"#FFFFFF","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_524, [...(_cache[135] || (_cache[135] = [
                  _createElementVNode("path", { d: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M4 15.5l4.5-4.5 4 4 2.5-2.5 5 5" }, null, -1 /* CACHED */),
                  _createElementVNode("circle", {
                    cx: "15.5",
                    cy: "9",
                    r: "1.5"
                  }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_523),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.shutter,
                "aria-label": "Analyser l’article détecté",
                style: {"width":"80px","height":"80px","padding":"6px","box-sizing":"border-box","border":"4px solid #FFFFFF","border-radius":"40px","background":"rgba(255, 255, 255, 0.12)","cursor":"pointer"}
              }, [...(_cache[136] || (_cache[136] = [
                _createElementVNode("span", { style: {"display":"block","width":"100%","height":"100%","border-radius":"50%","background":"#FFFFFF"} }, null, -1 /* CACHED */)
              ]))], 8 /* PROPS */, _hoisted_525),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.manual,
                "aria-label": "Ajouter sans scanner",
                style: {"justify-self":"end","width":"52px","height":"52px","padding":"0","border":"1px solid rgba(255, 255, 255, 0.16)","border-radius":"16px","background":"rgba(8, 13, 26, 0.6)","color":"#FFFFFF","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_527, [...(_cache[137] || (_cache[137] = [
                  _createElementVNode("path", { d: "M4 20h4L19 9l-4-4L4 16z" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M13.5 6.5l4 4" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_526)
            ])
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.scanSheetOpen)
      ? (_openBlock(), _createElementBlock("div", _hoisted_528, [
          _createElementVNode("button", {
            type: "button",
            "aria-label": "Revenir au scan",
            onClick: _ctx.V.sr.close,
            style: {"flex":"1 1 auto","min-height":"44px","padding":"0","border":"0","background":"transparent","cursor":"pointer"}
          }, null, 8 /* PROPS */, _hoisted_529),
          _createElementVNode("section", _hoisted_530, [
            _cache[148] || (_cache[148] = _createElementVNode("div", {
              "aria-hidden": "true",
              style: {"flex":"none","align-self":"center","width":"40px","height":"5px","border-radius":"3px","background":"#2A3A5C"}
            }, null, -1 /* CACHED */)),
            _createElementVNode("div", _hoisted_531, [
              _createElementVNode("span", {
                style: _normalizeStyle(`position: relative; flex: none; width: 84px; height: 112px; border-radius: 10px; overflow: hidden; background: ${_ctx.V.sr.bg}; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 22px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
              }, [
                (_ctx.V.sr.isCard)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 0,
                      src: _ctx.V.sr.img,
                      alt: "",
                      style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                    }, null, 8 /* PROPS */, _hoisted_532))
                  : _createCommentVNode("v-if", true),
                (_ctx.V.sr.isSealed)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 1,
                      src: _ctx.V.sr.logo,
                      alt: "",
                      style: {"max-width":"72px","max-height":"44px","object-fit":"contain"}
                    }, null, 8 /* PROPS */, _hoisted_533))
                  : _createCommentVNode("v-if", true)
              ], 4 /* STYLE */),
              _createElementVNode("div", _hoisted_534, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`padding: 2px 9px; border-radius: 999px; background: ${_ctx.V.sr.ownedBg}; color: ${_ctx.V.sr.ownedFg}; font-size: 11.5px; font-weight: 700`)
                }, _toDisplayString(_ctx.V.sr.ownedText), 5 /* TEXT, STYLE */),
                _createElementVNode("h2", _hoisted_535, _toDisplayString(_ctx.V.sr.name), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_536, _toDisplayString(_ctx.V.sr.sub), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_537, _toDisplayString(_ctx.V.sr.conf), 1 /* TEXT */)
              ]),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.sr.close,
                "aria-label": "Fermer",
                style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid #1E2B45","border-radius":"22px","background":"#111A2C","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_539, [...(_cache[139] || (_cache[139] = [
                  _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_538)
            ]),
            _createElementVNode("section", _hoisted_540, [
              _createElementVNode("span", _hoisted_541, [
                _cache[140] || (_cache[140] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"#C9D3EA"} }, "Cote PKM", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_542, _toDisplayString(_ctx.V.sr.cote), 1 /* TEXT */)
              ]),
              _createElementVNode("span", _hoisted_543, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sr.srcs || []), (rs, rs_i) => {
                  return (_openBlock(), _createElementBlock("span", {
                    key: rs_i,
                    style: {"display":"flex","justify-content":"space-between","gap":"10px","font-size":"12px"}
                  }, [
                    _createElementVNode("span", _hoisted_544, _toDisplayString(rs.label) + " · " + _toDisplayString(rs.sub), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_545, _toDisplayString(rs.value), 1 /* TEXT */)
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _createElementVNode("div", _hoisted_546, [
              _cache[141] || (_cache[141] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "Langue", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_547, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sr.langs || []), (lg, lg_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: lg_i,
                    type: "button",
                    onClick: lg.pick,
                    "aria-pressed": _ctx.A(lg.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; border-radius: 999px; border: 1px solid ${lg.bc}; background: ${lg.bg}; color: ${lg.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(lg.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_548))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _cache[142] || (_cache[142] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "État", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_549, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sr.conds || []), (cd, cd_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: cd_i,
                    type: "button",
                    onClick: cd.pick,
                    "aria-pressed": _ctx.A(cd.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${cd.bc}; background: ${cd.bg}; color: ${cd.fg}; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(cd.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_550))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _createElementVNode("div", _hoisted_551, [
              _createElementVNode("label", _hoisted_552, [
                _cache[143] || (_cache[143] = _createTextVNode("Prix payé (€) · facultatif", -1 /* CACHED */)),
                _createElementVNode("input", {
                  id: "pkm-champ-6",
                  type: "text",
                  inputmode: "decimal",
                  placeholder: "0,00",
                  value: _ctx.V.sr.price,
                  onInput: _ctx.V.sr.onPrice,
                  style: {"height":"52px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid #2A3A5C","border-radius":"16px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"19px","font-weight":"600"}
                }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_553)
              ]),
              _createElementVNode("div", _hoisted_554, [
                _cache[146] || (_cache[146] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "Quantité", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_555, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sr.dec,
                    "aria-label": "Diminuer la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_557, [...(_cache[144] || (_cache[144] = [
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_556),
                  _createElementVNode("span", _hoisted_558, _toDisplayString(_ctx.V.sr.qty), 1 /* TEXT */),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sr.inc,
                    "aria-label": "Augmenter la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_560, [...(_cache[145] || (_cache[145] = [
                      _createElementVNode("path", { d: "M12 5v14" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_559)
                ])
              ])
            ]),
            _createElementVNode("span", _hoisted_561, _toDisplayString(_ctx.V.sr.priceHint), 1 /* TEXT */),
            _createElementVNode("section", _hoisted_562, [
              (_openBlock(), _createElementBlock("svg", _hoisted_563, [
                _createElementVNode("path", {
                  d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                  style: _normalizeStyle(`fill: ${_ctx.V.sr.tierColor}; fill-opacity: 0.16; stroke: ${_ctx.V.sr.tierColor}; stroke-width: 1.3; stroke-linejoin: round`)
                }, null, 4 /* STYLE */),
                _createElementVNode("path", {
                  d: _ctx.V.sr.tierSym,
                  style: _normalizeStyle(`fill: ${_ctx.V.sr.tierColor}; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_564)
              ])),
              _createElementVNode("span", _hoisted_565, [
                _cache[147] || (_cache[147] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"#9AA8C3"} }, "Ta collection", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_566, _toDisplayString(_ctx.V.sr.valueLine), 1 /* TEXT */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-size: 12.5px; font-weight: 700; color: ${_ctx.V.sr.tierColor}`)
                }, _toDisplayString(_ctx.V.sr.tierLine), 5 /* TEXT, STYLE */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: ${_ctx.V.sr.profColor}`)
                }, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_567, [
                    _createElementVNode("path", {
                      d: _ctx.V.sr.profIcon
                    }, null, 8 /* PROPS */, _hoisted_568)
                  ])),
                  _createTextVNode(_toDisplayString(_ctx.V.sr.profLine), 1 /* TEXT */)
                ], 4 /* STYLE */)
              ])
            ]),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.sr.save,
              style: {"flex":"none","height":"54px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
            }, _toDisplayString(_ctx.V.sr.saveLabel), 9 /* TEXT, PROPS */, _hoisted_569),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.sr.wrong,
              style: {"flex":"none","height":"44px","margin-top":"-6px","border":"0","background":"transparent","color":"#B9C5FF","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
            }, "Ce n’est pas le bon article ?", 8 /* PROPS */, _hoisted_570)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.sheetOpen)
      ? (_openBlock(), _createElementBlock("div", _hoisted_571, [
          _createElementVNode("button", {
            type: "button",
            "aria-label": "Fermer la saisie",
            onClick: _ctx.V.closeSheet,
            style: {"flex":"1 1 auto","min-height":"44px","padding":"0","border":"0","background":"transparent","cursor":"pointer"}
          }, null, 8 /* PROPS */, _hoisted_572),
          _createElementVNode("section", _hoisted_573, [
            _cache[157] || (_cache[157] = _createElementVNode("div", {
              "aria-hidden": "true",
              style: {"flex":"none","align-self":"center","width":"40px","height":"5px","border-radius":"3px","background":"#2A3A5C"}
            }, null, -1 /* CACHED */)),
            _createElementVNode("div", _hoisted_574, [
              _createElementVNode("div", _hoisted_575, [
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.sh.toBuy,
                  "aria-pressed": _ctx.A(_ctx.V.sh.isBuy),
                  style: _normalizeStyle(`height: 44px; padding: 0 6px; border: 0; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; background: ${_ctx.V.sh.buyBg}; color: ${_ctx.V.sh.buyFg}`)
                }, "Ajout", 12 /* STYLE, PROPS */, _hoisted_576),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.sh.toSell,
                  "aria-pressed": _ctx.A(_ctx.V.sh.isSell),
                  style: _normalizeStyle(`height: 44px; padding: 0 6px; border: 0; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; background: ${_ctx.V.sh.sellBg}; color: ${_ctx.V.sh.sellFg}`)
                }, "Vente", 12 /* STYLE, PROPS */, _hoisted_577)
              ]),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.closeSheet,
                "aria-label": "Fermer",
                style: {"flex":"none","width":"46px","height":"46px","padding":"0","border":"1px solid #1E2B45","border-radius":"23px","background":"#111A2C","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_579, [...(_cache[149] || (_cache[149] = [
                  _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_578)
            ]),
            _createElementVNode("h2", _hoisted_580, _toDisplayString(_ctx.V.sh.title), 1 /* TEXT */),
            _createElementVNode("fieldset", _hoisted_581, [
              _cache[150] || (_cache[150] = _createElementVNode("legend", { style: {"padding":"0","margin-bottom":"8px","font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "Article", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_582, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.products || []), (po, po_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: po_i,
                    type: "button",
                    onClick: po.pick,
                    "aria-pressed": _ctx.A(po.sel),
                    "aria-label": _ctx.A(po.label),
                    style: _normalizeStyle(`flex: none; width: 104px; display: flex; flex-direction: column; gap: 6px; padding: 6px 6px 8px; border-radius: 18px; border: 1px solid ${po.bc}; box-shadow: ${po.ring}; background: ${po.bg}; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                  }, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: relative; display: flex; align-items: center; justify-content: center; height: 78px; border-radius: 12px; overflow: hidden; background: ${po.art}; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12)`)
                    }, [
                      (po.isCard)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 0,
                            src: po.img,
                            alt: "",
                            style: {"position":"relative","width":"58px","height":"68px","margin-top":"10px","border-radius":"4px 4px 0 0","object-fit":"cover","object-position":"top"}
                          }, null, 8 /* PROPS */, _hoisted_584))
                        : _createCommentVNode("v-if", true),
                      (po.isSealed)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 1,
                            src: po.logo,
                            alt: "",
                            style: {"position":"relative","width":"80px","height":"40px","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_585))
                        : _createCommentVNode("v-if", true)
                    ], 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_586, _toDisplayString(po.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_587, _toDisplayString(po.right), 1 /* TEXT */)
                  ], 12 /* STYLE, PROPS */, _hoisted_583))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _createElementVNode("div", _hoisted_588, [
              _createElementVNode("label", _hoisted_589, [
                _createTextVNode(_toDisplayString(_ctx.V.sh.priceLabel), 1 /* TEXT */),
                _createElementVNode("input", {
                  id: "pkm-champ-7",
                  type: "text",
                  inputmode: "decimal",
                  placeholder: "0,00",
                  value: _ctx.V.sh.price,
                  onInput: _ctx.V.sh.onPrice,
                  style: {"height":"52px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid #2A3A5C","border-radius":"16px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"20px","font-weight":"600"}
                }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_590)
              ]),
              _createElementVNode("div", _hoisted_591, [
                _cache[153] || (_cache[153] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "Quantité", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_592, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sh.dec,
                    "aria-label": "Diminuer la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_594, [...(_cache[151] || (_cache[151] = [
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_593),
                  _createElementVNode("span", _hoisted_595, _toDisplayString(_ctx.V.sh.qty), 1 /* TEXT */),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sh.inc,
                    "aria-label": "Augmenter la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_597, [...(_cache[152] || (_cache[152] = [
                      _createElementVNode("path", { d: "M12 5v14" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_596)
                ])
              ])
            ]),
            (_ctx.V.sh.hasPriceHint)
              ? (_openBlock(), _createElementBlock("span", _hoisted_598, _toDisplayString(_ctx.V.sh.priceHint), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            (_ctx.V.sh.isSell)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                  _createElementVNode("fieldset", _hoisted_599, [
                    _cache[154] || (_cache[154] = _createElementVNode("legend", { style: {"padding":"0","margin-bottom":"8px","font-size":"13px","font-weight":"600","color":"#9AA8C3"} }, "Vendu sur", -1 /* CACHED */)),
                    _createElementVNode("div", _hoisted_600, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.platforms || []), (pl, pl_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: pl_i,
                          type: "button",
                          onClick: pl.pick,
                          "aria-pressed": _ctx.A(pl.sel),
                          style: _normalizeStyle(`height: 46px; padding: 0 8px; border-radius: 999px; border: 1px solid ${pl.bc}; box-shadow: ${pl.ring}; background: ${pl.bg}; color: ${pl.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                        }, _toDisplayString(pl.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_601))
                      }), 128 /* KEYED_FRAGMENT */))
                    ])
                  ]),
                  _createElementVNode("label", _hoisted_602, [
                    _cache[155] || (_cache[155] = _createTextVNode("Port et emballage à ta charge (€)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-8",
                      type: "text",
                      inputmode: "decimal",
                      value: _ctx.V.sh.port,
                      onInput: _ctx.V.sh.onPort,
                      style: {"height":"48px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid #2A3A5C","border-radius":"16px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"16px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_603),
                    _createElementVNode("span", _hoisted_604, _toDisplayString(_ctx.V.sh.portHint), 1 /* TEXT */)
                  ]),
                  (_ctx.V.ui.adv)
                    ? (_openBlock(), _createElementBlock("label", _hoisted_605, [
                        _cache[156] || (_cache[156] = _createTextVNode("Commission (€)", -1 /* CACHED */)),
                        _createElementVNode("input", {
                          id: "pkm-champ-9",
                          type: "text",
                          inputmode: "decimal",
                          value: _ctx.V.sh.commission,
                          onInput: _ctx.V.sh.onCommission,
                          style: {"height":"48px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid #2A3A5C","border-radius":"16px","background":"#0B1120","color":"#F3F6FC","font-family":"'Sora', sans-serif","font-size":"16px"}
                        }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_606),
                        _createElementVNode("span", _hoisted_607, _toDisplayString(_ctx.V.sh.commissionHint), 1 /* TEXT */)
                      ]))
                    : _createCommentVNode("v-if", true)
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true),
            (_ctx.V.ui.adv)
              ? (_openBlock(), _createElementBlock("fieldset", _hoisted_608, [
                  _createElementVNode("legend", _hoisted_609, _toDisplayString(_ctx.V.sh.byLabel), 1 /* TEXT */),
                  _createElementVNode("div", _hoisted_610, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.people || []), (pp, pp_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: pp_i,
                        type: "button",
                        onClick: pp.pick,
                        "aria-pressed": _ctx.A(pp.sel),
                        style: _normalizeStyle(`height: 46px; padding: 0 8px; border-radius: 999px; border: 1px solid ${pp.bc}; box-shadow: ${pp.ring}; background: ${pp.bg}; color: ${pp.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                      }, _toDisplayString(pp.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_611))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", {
              "aria-label": _ctx.A(_ctx.V.sh.previewTitle),
              style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid #24345C","background":"radial-gradient(120% 100% at 100% 0%, rgba(98, 122, 255, 0.2), rgba(98, 122, 255, 0) 60%), #121C33","display":"flex","flex-direction":"column","gap":"8px"}
            }, [
              _createElementVNode("div", _hoisted_613, [
                _createElementVNode("span", _hoisted_614, _toDisplayString(_ctx.V.sh.previewTitle), 1 /* TEXT */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.03em; color: ${_ctx.V.sh.bigColor}`)
                }, _toDisplayString(_ctx.V.sh.big), 5 /* TEXT, STYLE */)
              ]),
              _createElementVNode("div", _hoisted_615, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.lines || []), (ln, ln_i) => {
                  return (_openBlock(), _createElementBlock("div", {
                    key: ln_i,
                    style: {"display":"flex","justify-content":"space-between","gap":"12px"}
                  }, [
                    _createElementVNode("span", null, _toDisplayString(ln.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_616, _toDisplayString(ln.value), 1 /* TEXT */)
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              (_ctx.V.sh.hasError)
                ? (_openBlock(), _createElementBlock("div", _hoisted_617, _toDisplayString(_ctx.V.sh.error), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ], 8 /* PROPS */, _hoisted_612),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.sh.save,
              disabled: _ctx.V.sh.disabled,
              style: _normalizeStyle(`flex: none; height: 54px; border: 0; border-radius: 999px; background: #A8B6FF; color: #0B1120; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; opacity: ${_ctx.V.sh.saveOpacity}`)
            }, _toDisplayString(_ctx.V.sh.saveLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_618)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.onbOpen)
      ? (_openBlock(), _createElementBlock("section", _hoisted_619, [
          _createElementVNode("div", _hoisted_620, [
            _createElementVNode("span", _hoisted_621, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.dots || []), (dt, dt_i) => {
                return (_openBlock(), _createElementBlock("span", {
                  key: dt_i,
                  style: _normalizeStyle(`width: ${dt.w}; height: 8px; border-radius: 4px; background: ${dt.bg}`)
                }, null, 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.ob.skip,
              style: {"height":"44px","padding":"0 6px","border":"0","background":"transparent","color":"#9AA8C3","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
            }, "Passer", 8 /* PROPS */, _hoisted_622)
          ]),
          (_ctx.V.ob.is1)
            ? (_openBlock(), _createElementBlock("div", _hoisted_623, [
                _createElementVNode("div", _hoisted_624, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.fan || []), (fc, fc_i) => {
                    return (_openBlock(), _createElementBlock("img", {
                      key: fc_i,
                      src: fc.img,
                      alt: "",
                      style: _normalizeStyle(`position: absolute; left: ${fc.left}; top: ${fc.top}; width: 104px; height: 121px; border-radius: 9px 9px 0 0; object-fit: cover; object-position: top; transform: rotate(${fc.rot}); box-shadow: 0 16px 30px rgba(0, 0, 0, 0.5); -webkit-mask-image: linear-gradient(180deg, #000 80%, transparent); mask-image: linear-gradient(180deg, #000 80%, transparent)`)
                    }, null, 12 /* STYLE, PROPS */, _hoisted_625))
                  }), 128 /* KEYED_FRAGMENT */)),
                  _cache[158] || (_cache[158] = _createElementVNode("span", { style: {"position":"absolute","left":"50%","bottom":"8px","margin-left":"-88px","width":"176px","display":"flex","align-items":"center","justify-content":"center","gap":"8px","padding":"9px 0","border-radius":"999px","background":"rgba(8, 13, 26, 0.88)","border":"1px solid #24345C","font-size":"13px","font-weight":"700"} }, [
                    _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"4px","background":"#3DDC84"} }),
                    _createTextVNode("Cote PKM 99,00 €")
                  ], -1 /* CACHED */))
                ]),
                _cache[165] || (_cache[165] = _createElementVNode("h1", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"28px","line-height":"1.15","font-weight":"700","letter-spacing":"-0.03em","text-align":"center"} }, "La vraie valeur de ta collection Pokémon", -1 /* CACHED */)),
                _cache[166] || (_cache[166] = _createElementVNode("p", { style: {"margin":"0","font-size":"15px","line-height":"1.5","color":"#C9D3EA","text-align":"center"} }, "Scanne tes cartes et ton scellé. PKM compare Cardmarket, eBay et TCGplayer et te donne une cote claire, avec sa source et sa date.", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_626, [
                  _createElementVNode("div", _hoisted_627, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_628, [...(_cache[159] || (_cache[159] = [
                      _createElementVNode("path", { d: "M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.6-2.2h5.4L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" }, null, -1 /* CACHED */),
                      _createElementVNode("circle", {
                        cx: "12",
                        cy: "12.8",
                        r: "3.4"
                      }, null, -1 /* CACHED */)
                    ]))])),
                    _cache[160] || (_cache[160] = _createTextVNode("Scan en 2 secondes, cartes et scellé", -1 /* CACHED */))
                  ]),
                  _createElementVNode("div", _hoisted_629, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_630, [...(_cache[161] || (_cache[161] = [
                      _createElementVNode("path", { d: "M4 19.5h16" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M5 15.5l4.5-4.5 3.5 3 6-6.5" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M15 7.5h4v4" }, null, -1 /* CACHED */)
                    ]))])),
                    _cache[162] || (_cache[162] = _createTextVNode("Prix comparés entre plusieurs sites", -1 /* CACHED */))
                  ]),
                  _createElementVNode("div", _hoisted_631, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_632, [...(_cache[163] || (_cache[163] = [
                      _createElementVNode("path", { d: "M12 2l8.66 5v10L12 22l-8.66-5V7z" }, null, -1 /* CACHED */)
                    ]))])),
                    _cache[164] || (_cache[164] = _createTextVNode("Des paliers selon la valeur de ta collection", -1 /* CACHED */))
                  ])
                ]),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.ob.next1,
                  style: {"height":"54px","margin-top":"4px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
                }, "Commencer", 8 /* PROPS */, _hoisted_633),
                _cache[167] || (_cache[167] = _createElementVNode("p", { style: {"margin":"0","font-size":"11.5px","line-height":"1.5","color":"#7D8BA8","text-align":"center"} }, "Application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.", -1 /* CACHED */))
              ]))
            : _createCommentVNode("v-if", true),
          (_ctx.V.ob.is2)
            ? (_openBlock(), _createElementBlock("div", _hoisted_634, [
                _cache[170] || (_cache[170] = _createElementVNode("h1", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"26px","line-height":"1.15","font-weight":"700","letter-spacing":"-0.03em"} }, "Faisons connaissance", -1 /* CACHED */)),
                _cache[171] || (_cache[171] = _createElementVNode("p", { style: {"margin":"-6px 0 0","font-size":"14px","line-height":"1.5","color":"#9AA8C3"} }, "2 questions pour anticiper ton profil. Ensuite, il s’adapte tout seul à ta collection.", -1 /* CACHED */)),
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.questions || []), (qq, qq_i) => {
                  return (_openBlock(), _createElementBlock("fieldset", {
                    key: qq_i,
                    style: {"margin":"0","padding":"0","border":"0","min-width":"0"}
                  }, [
                    _createElementVNode("legend", _hoisted_635, _toDisplayString(qq.q), 1 /* TEXT */),
                    _createElementVNode("div", _hoisted_636, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((qq.opts || []), (oo, oo_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: oo_i,
                          type: "button",
                          onClick: oo.pick,
                          "aria-pressed": _ctx.A(oo.on),
                          style: _normalizeStyle(`min-height: 48px; padding: 6px 6px; border-radius: 14px; border: 1px solid ${oo.bc}; box-shadow: ${oo.ring}; background: ${oo.bg}; color: ${oo.fg}; font: inherit; font-size: 12.5px; font-weight: 600; line-height: 1.25; cursor: pointer`)
                        }, _toDisplayString(oo.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_637))
                      }), 128 /* KEYED_FRAGMENT */))
                    ])
                  ]))
                }), 128 /* KEYED_FRAGMENT */)),
                _createElementVNode("section", {
                  "aria-label": "Profil anticipé",
                  "aria-live": "polite",
                  style: _normalizeStyle(`display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; border-radius: 20px; border: 1px solid ${_ctx.V.ob.predEdge}; background: ${_ctx.V.ob.predTint}`)
                }, [
                  _createElementVNode("div", _hoisted_638, [
                    _createElementVNode("span", _hoisted_639, [
                      (_openBlock(), _createElementBlock("svg", {
                        width: "24",
                        height: "24",
                        viewBox: "0 0 24 24",
                        "aria-hidden": "true",
                        style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.ob.predColor}; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round`)
                      }, [
                        _createElementVNode("path", {
                          d: _ctx.V.ob.predIcon
                        }, null, 8 /* PROPS */, _hoisted_640)
                      ], 4 /* STYLE */))
                    ]),
                    _createElementVNode("span", _hoisted_641, [
                      _cache[168] || (_cache[168] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"#C9D3EA"} }, "Profil anticipé", -1 /* CACHED */)),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 19px; font-weight: 700; color: ${_ctx.V.ob.predColor}`)
                      }, _toDisplayString(_ctx.V.ob.predName), 5 /* TEXT, STYLE */)
                    ])
                  ]),
                  _createElementVNode("div", _hoisted_642, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.predSteps || []), (pq, pq_i) => {
                      return (_openBlock(), _createElementBlock("span", {
                        key: pq_i,
                        role: "listitem",
                        style: _normalizeStyle(`height: 32px; border-radius: 999px; border: 1px solid ${pq.bc}; background: ${pq.bg}; color: ${pq.fg}; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 700`)
                      }, _toDisplayString(pq.name), 5 /* TEXT, STYLE */))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ], 4 /* STYLE */),
                _createElementVNode("div", _hoisted_643, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.back,
                    "aria-label": "Étape précédente",
                    style: {"width":"54px","height":"54px","padding":"0","border":"1px solid #2A3A5C","border-radius":"27px","background":"transparent","color":"#F3F6FC","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_645, [...(_cache[169] || (_cache[169] = [
                      _createElementVNode("path", { d: "M15 5l-7 7 7 7" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_644),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.next2,
                    style: {"height":"54px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
                  }, "Voir mon profil", 8 /* PROPS */, _hoisted_646)
                ])
              ]))
            : _createCommentVNode("v-if", true),
          (_ctx.V.ob.is3)
            ? (_openBlock(), _createElementBlock("div", _hoisted_647, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`align-self: center; width: 104px; height: 104px; margin-top: 10px; border-radius: 52px; background: ${_ctx.V.ob.predTint}; border: 2px solid ${_ctx.V.ob.predEdge}; display: flex; align-items: center; justify-content: center`)
                }, [
                  (_openBlock(), _createElementBlock("svg", {
                    width: "52",
                    height: "52",
                    viewBox: "0 0 24 24",
                    "aria-hidden": "true",
                    style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.ob.predColor}; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round`)
                  }, [
                    _createElementVNode("path", {
                      d: _ctx.V.ob.predIcon
                    }, null, 8 /* PROPS */, _hoisted_648)
                  ], 4 /* STYLE */))
                ], 4 /* STYLE */),
                _createElementVNode("div", _hoisted_649, [
                  _cache[172] || (_cache[172] = _createElementVNode("span", { style: {"font-size":"14px","color":"#9AA8C3"} }, "Tu es plutôt", -1 /* CACHED */)),
                  _createElementVNode("h1", {
                    style: _normalizeStyle(`margin: 0; font-family: 'Sora', sans-serif; font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; color: ${_ctx.V.ob.predColor}`)
                  }, _toDisplayString(_ctx.V.ob.predName), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("p", _hoisted_650, _toDisplayString(_ctx.V.ob.predDesc), 1 /* TEXT */),
                _createElementVNode("section", _hoisted_651, [
                  _cache[174] || (_cache[174] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"700","color":"#9AA8C3"} }, "Ce qu’on a préparé pour toi", -1 /* CACHED */)),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.adapts || []), (oa, oa_i) => {
                    return (_openBlock(), _createElementBlock("div", {
                      key: oa_i,
                      style: {"display":"flex","align-items":"flex-start","gap":"10px","font-size":"14px","line-height":"1.45"}
                    }, [
                      (_openBlock(), _createElementBlock("svg", {
                        width: "18",
                        height: "18",
                        viewBox: "0 0 24 24",
                        "aria-hidden": "true",
                        style: _normalizeStyle(`flex: none; margin-top: 1px; fill: none; stroke: ${oa.color}; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round`)
                      }, [...(_cache[173] || (_cache[173] = [
                        _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                      ]))], 4 /* STYLE */)),
                      _createElementVNode("span", null, _toDisplayString(oa.text), 1 /* TEXT */)
                    ]))
                  }), 128 /* KEYED_FRAGMENT */))
                ]),
                _cache[175] || (_cache[175] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"#9AA8C3","text-align":"center"} }, "Ensuite, ton profil s’adapte tout seul : il suit le nombre de tes cartes ultra rares et la valeur de ta collection.", -1 /* CACHED */)),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.ob.toScan,
                  style: {"height":"54px","border":"0","border-radius":"999px","background":"#A8B6FF","color":"#0B1120","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
                }, "Scanner ma première carte", 8 /* PROPS */, _hoisted_652),
                _createElementVNode("div", _hoisted_653, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.back,
                    style: {"height":"46px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                  }, "Modifier", 8 /* PROPS */, _hoisted_654),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.toHome,
                    style: {"height":"46px","border":"1px solid #2A3A5C","border-radius":"999px","background":"transparent","color":"#F3F6FC","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                  }, "Aller à l’accueil", 8 /* PROPS */, _hoisted_655)
                ])
              ]))
            : _createCommentVNode("v-if", true)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.hasToast)
      ? (_openBlock(), _createElementBlock("div", {
          key: 8,
          role: "status",
          style: _normalizeStyle(`position: absolute; z-index: 50; left: 16px; right: 16px; bottom: ${_ctx.V.ui.toastBottom}; display: flex; align-items: center; gap: 10px; padding: 13px 14px; border-radius: 18px; border: 1px solid #24345C; background: #16223A; color: #F3F6FC; font-size: 14px; font-weight: 600; box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45)`)
        }, [
          _createElementVNode("span", _hoisted_656, [
            (_openBlock(), _createElementBlock("svg", _hoisted_657, [...(_cache[176] || (_cache[176] = [
              _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
            ]))]))
          ]),
          _createElementVNode("span", null, _toDisplayString(_ctx.V.ui.toast), 1 /* TEXT */)
        ], 4 /* STYLE */))
      : _createCommentVNode("v-if", true)
  ]))
}
  })();
  // Écran de départ : #territoire, #scan… (lien partagé) ou ?start=territory&storeId=s2 (hébergement).
  const HASH = { accueil: { start: 'home' }, collection: { start: 'collection' }, scan: { start: 'scan' }, marche: { start: 'market' },
    territoire: { start: 'territory' }, magasin: { start: 'store' }, profil: { start: 'profile' }, paliers: { start: 'tiers' },
    reglages: { start: 'settings' }, ventes: { start: 'sales' }, bienvenue: { onb: '1' }, novice: { demo: 'novice' } };
  const props = Object.assign({}, HASH[location.hash.slice(1)] || {});
  try {
    const q = new URLSearchParams(location.search);
    ['start', 'demo', 'onb', 'itemId', 'storeId', 'saleId', 'tprod', 'tprob', 'adv'].forEach(k => { if (q.get(k)) props[k] = q.get(k); });
  } catch (e) { /* adresse sans paramètres */ }
  const inst = new Component(props);
  Vue.createApp({
    setup() {
      const V = Vue.shallowRef(inst.renderVals());
      inst.__rerender = () => { V.value = inst.renderVals(); };
      const A = v => (v === true ? 'true' : v === false ? 'false' : v);
      return { V: V, A: A };
    },
    render: render
  }).mount('#app');
  // Catalogue complet : chargé après le premier affichage.
  fetch('data/cards.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(doc => { TCG.load(doc); inst.setState({ tcg: TCG.rows.length }); })
    .catch(() => { TCG.status = 'error'; inst.setState({ tcg: -1 }); });
  // Hors ligne et installation (hébergement uniquement ; refusé dans les pages claude.ai).
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
