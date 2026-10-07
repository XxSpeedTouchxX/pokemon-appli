/* Dropicards (nom de code PKM-App) · démo web. Fichier généré par tools/web/build.mjs à partir de
   docs/12-maquette-v5/Main.dc.html : ne pas le modifier à la main. Catalogue réel (web/data/cards.json), collection de démo fictive. */
(function () {
  'use strict';
  // Socle minimal attendu par la logique de la maquette : état local et nouveau rendu à chaque changement.
  class DCLogic {
    constructor(props) { this.props = props || {}; }
    setState(patch) {
      this.state = Object.assign({}, this.state || {}, patch);
      if (this.__rerender) this.__rerender();
      if (this.__changed) this.__changed();
    }
  }

class Component extends DCLogic {
  // Maquette Dropicards v5 : valorisation des cartes et du scellé, scan au centre, paliers,
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

  // Paliers selon la valeur de la collection (Cote Dropicards).
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
      { name: 'Commune', min: 0, color: 'var(--pkm-t3)', glow: 'rgba(154, 168, 195, 0.24)', sym: 'M9.4 12a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0z' },
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
      novice: { name: 'Novice', color: 'var(--pkm-teal)', tint: 'rgba(var(--pkm-teal-rgb), 0.12)', edge: 'rgba(var(--pkm-teal-rgb), 0.34)', icon: 'M12 20.5v-8 M12 12.5C12 9 9.4 6.5 5.5 6.5c0 3.6 2.6 6 6.5 6z M12 14.5c0-3 2.3-5.2 5.6-5.2 0 3.1-2.3 5.2-5.6 5.2z', desc: 'Tu démarres : moins de 3 cartes ultra rares et moins de 1 000 € de collection. Chaque prix est expliqué.' },
      regular: { name: 'Régulier', color: 'var(--pkm-regular)', tint: 'rgba(var(--pkm-regular-rgb), 0.12)', edge: 'rgba(var(--pkm-regular-rgb), 0.34)', icon: 'M13 3L5 13.5h6L10 21l8-10.5h-6z', desc: 'Collection installée : au moins 3 cartes ultra rares ou 1 000 € de valeur.' },
      passion: { name: 'Passionné', color: 'var(--pkm-amber)', tint: 'rgba(var(--pkm-amber-rgb), 0.12)', edge: 'rgba(var(--pkm-amber-rgb), 0.34)', icon: 'M4 17.5L3 8l5 4 4-6.5 4 6.5 5-4-1 9.5z M5 20.5h14', desc: 'Grosse collection : au moins 10 cartes ultra rares ou 5 000 € de valeur. Tous les détails.' }
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
  // Territoire : boutiques de démo (noms et données fictifs). partner = boutique partenaire Dropicards.
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
    return n >= 70 ? { label: 'Forte', color: 'var(--pkm-green)', tint: 'rgba(var(--pkm-green-rgb), 0.16)' }
      : n >= 40 ? { label: 'Moyenne', color: 'var(--pkm-orange)', tint: 'rgba(var(--pkm-orange-rgb), 0.16)' }
      : { label: 'Faible', color: 'var(--pkm-gray)', tint: 'rgba(var(--pkm-gray-rgb), 0.14)' };
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
    return { bg: on ? 'var(--pkm-chip-on-bg)' : 'var(--pkm-chip-bg)', bc: on ? 'var(--pkm-chip-on-bc)' : 'var(--pkm-chip-bc)', fg: on ? 'var(--pkm-chip-on-fg)' : 'var(--pkm-chip-fg)' };
  }
  choice(on) {
    return { bc: on ? 'var(--pkm-choice-on-bc)' : 'var(--pkm-choice-bc)', ring: on ? 'inset 0 0 0 1px var(--pkm-choice-on-bc)' : 'none', bg: on ? 'var(--pkm-choice-on-bg)' : 'var(--pkm-choice-bg)', fg: 'var(--pkm-t1)' };
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
      color: pts[n - 1] < pts[0] ? 'var(--pkm-down)' : 'var(--pkm-up)'
    };
  }

  // Cote Dropicards : médiane des prix « marché » disponibles (tendance Cardmarket, ventes eBay, TCGplayer).
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
    return ({ pkm: 'Cote Dropicards : médiane Cardmarket, eBay, TCGplayer', cm: 'Tendance Cardmarket', low: 'Plus bas Cardmarket (prix demandé)' }[v] || 'Cote Dropicards') + ' · 03/10 à 07:00';
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
        labelColor: noCost ? 'var(--pkm-orange)' : 'var(--pkm-t4)',
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
    ].map((r, i) => ({ n: String(i + 1), label: r[0], done: r[1], color: r[1] ? 'var(--pkm-green)' : 'var(--pkm-teal)' }));
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
          name: p.name, sub: this.copySub(p, x.s), qty: '×' + st.qty, value: this.eur(x.val(p) * st.qty), unit: this.eur(x.val(p)) + ' / u',
          change: ch === null ? '—' : this.chg(ch), changeColor: ch === null ? 'var(--pkm-t3)' : x.col(ch),
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
      change: ch === null ? 'Pas encore de variation' : this.chg(ch) + ' sur 7 jours', changeColor: ch === null ? 'var(--pkm-t3)' : x.col(ch),
      release: p.release ? 'Sortie prévue le ' + this.d3(p.release) + '. Pas de cote avant les premières ventes : seul le prix demandé en précommande est connu.' : '',
      hold: owned ? x.mask(this.eur(u * st.qty)) : '', holdLatent: owned && known > 0 ? x.mask(this.signed(lat)) + ' (' + this.signedPct(lat / st.cost * 100) + ')' : (owned ? 'Plus-value : prix d’achat à compléter' : ''),
      holdColor: owned && known > 0 ? x.col(lat) : 'var(--pkm-orange)',
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
        chartLabel: 'Cote Dropicards archivée sur 30 jours : de ' + this.eur(h[0]) + ' à ' + this.eur(h[n - 1])
      });
    } else {
      Object.assign(it, { line: '', area: '', chartColor: 'var(--pkm-t3)', dotX: '0', dotY: '0', hasHi: false, readout: '', hits: [], firstDate: '', lastDate: '', rangeText: '', chartLabel: '' });
    }
    const defs = [
      ['cm', 'Cardmarket', 'Tendance · fichier public du 03/10', 'calculé', 'var(--pkm-iris)'],
      ['low', 'Cardmarket', p.release ? 'Précommandes · annonces du 03/10' : 'Plus bas · annonces du 03/10', 'demandé', 'var(--pkm-iris)'],
      ['ebay', 'eBay', 'Ventes réussies · 30 derniers jours', 'vendu', 'var(--pkm-orange)'],
      ['tcp', 'TCGplayer', 'Marché US, converti en € · via TCGdex', 'calculé', 'var(--pkm-teal)']
    ].filter(r => typeof p[r[0]] === 'number');
    it.sources = defs.map((r, i) => ({
      label: r[1], sub: r[2], tag: r[3], dot: r[4], value: this.eur(p[r[0]]), border: x.line(i),
      tagBg: r[3] === 'demandé' ? 'rgba(var(--pkm-orange-rgb), 0.16)' : r[3] === 'vendu' ? 'rgba(var(--pkm-green-rgb), 0.14)' : 'rgba(var(--pkm-accent-rgb), 0.14)',
      tagFg: r[3] === 'demandé' ? 'var(--pkm-orange)' : r[3] === 'vendu' ? 'var(--pkm-green)' : 'var(--pkm-link)',
      fg: r[0] === 'low' ? 'var(--pkm-t3)' : 'var(--pkm-t1)', weight: r[0] === 'low' ? '500' : '700'
    }));
    const nM = defs.filter(r => r[0] !== 'low').length;
    it.coteRule = nM === 0 ? 'Pas encore de prix « marché » : la cote apparaîtra après les premières ventes.'
      : (nM === 1 ? 'Cote Dropicards = le seul prix « marché » disponible.' : nM === 2 ? 'Cote Dropicards = moyenne des 2 prix « marché » (tendance et vendu).' : 'Cote Dropicards = médiane des 3 prix « marché » (tendance, vendu, TCGplayer).')
        + (nM ? ' Le prix demandé est affiché, jamais compté.' : '');
    const buys = s.purchases.filter(a => a.lines.some(l => l.pid === p.id))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.seq || 0) - (a.seq || 0)));
    it.copies = buys.map((a, i) => {
      const kk = a.lines.findIndex(l => l.pid === p.id), l = a.lines[kk], al = c.buys[a.id];
      return { meta: this.d2(a.date) + ' · ' + a.where + (s.adv ? ' · ' + x.who[a.by || 'toi'] : '') + this.copyMeta(p, l), amount: al ? l.qty + ' × ' + this.eur(al[kk] / l.qty) : l.qty + ' × prix à compléter', isLot: a.lines.length > 1, border: x.line(i) };
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
      cardBg: sealed ? 'transparent' : 'var(--pkm-accent)', cardFg: sealed ? 'var(--pkm-t2)' : 'var(--pkm-on-accent)',
      sealedBg: sealed ? 'var(--pkm-accent)' : 'transparent', sealedFg: sealed ? 'var(--pkm-on-accent)' : 'var(--pkm-t2)',
      toCard: () => this.setState({ scanMode: 'card', scanIdx: 0, scanSheet: false }),
      toSealed: () => this.setState({ scanMode: 'sealed', scanIdx: 0, scanSheet: false }),
      name: p.name, status: (sealed ? 'Produit détecté · ' : 'Carte détectée · ') + p.name,
      conf: (sealed ? 'Code-barres lu' : 'Reconnue à ' + (93 + p.seed % 7) + ' %') + ' · cote ' + (k !== null ? this.eur(k) : '—'),
      hint: sealed ? 'Vise le code-barres ou la face avant de la boîte' : 'Place la carte dans le cadre, bien à plat',
      torchOn: !!s.torch, torchFg: s.torch ? 'var(--pkm-ink)' : 'var(--pkm-white)', torchBg: s.torch ? 'var(--pkm-gold)' : 'rgba(var(--pkm-ink-rgb), 0.6)',
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
      ownedBg: st.qty > 0 ? 'rgba(var(--pkm-accent-rgb), 0.14)' : 'rgba(var(--pkm-green-rgb), 0.14)', ownedFg: st.qty > 0 ? 'var(--pkm-link)' : 'var(--pkm-green)',
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
          cote: k !== null ? this.eur(k) : '~' + this.eur(p.low), coteLabel: k !== null ? 'cote Dropicards' : 'demandé',
          right: p.release ? 'Sortie le ' + this.d2(p.release) : this.chg(v) + ' · 7 j', rightColor: p.release ? 'var(--pkm-orange)' : x.col(v),
          open: () => this.push('item', { itemId: p.id })
        });
      }),
      empty: list.length === 0,
      count: list.length + (list.length > 1 ? ' produits' : ' produit') + ' · cote Dropicards et variation sur 7 jours'
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
      steps: keys.map((k, i) => ({ name: C[k].name, bg: i === lv ? C[k].tint : 'transparent', bc: i === lv ? C[k].color : 'var(--pkm-line-2)', fg: i === lv ? C[k].color : 'var(--pkm-t4)', weight: i === lv ? '800' : '600' })),
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
      stateColor: i < t.i ? 'var(--pkm-green)' : i === t.i ? r.color : 'var(--pkm-t4)',
      bg: i === t.i ? 'rgba(var(--pkm-accent-rgb), 0.08)' : 'transparent', op: i > t.i ? 'var(--pkm-dim)' : '1'
    })).reverse().map((r, i) => Object.assign(r, { border: x.line(i) }));
    const weeks = [];
    for (let k = 7; k >= 0; k--) weeks.push({ bg: w[k] ? 'var(--pkm-accent)' : 'var(--pkm-track)', h: w[k] ? '34px' : '14px' });
    const graded = x.cat.find(p => p.grade && x.c.stock[p.id].qty > 0);
    const lot = s.purchases.find(a => a.lines.length > 1);
    const ach = [
      ['Premier scan', s.scanned > 0, s.scanned > 0 ? 'Débloqué aujourd’hui' : 'Scanne une carte ou une boîte', s.scanned > 0 ? 1 : 0],
      ['Première carte gradée', !!graded, graded ? graded.name + ' · ' + graded.grade : 'Ajoute une carte gradée', graded ? 1 : 0],
      ['4 semaines d’affilée', x.prof.streak >= 4, 'Série en cours : ' + x.prof.streak, Math.min(1, x.prof.streak / 4)],
      ['Premier lot réparti', !!lot, lot ? 'Lot ' + lot.where + ' du ' + this.d2(lot.date) : 'Enregistre un lot', lot ? 1 : 0],
      ['10 cartes ultra rares', x.prof.ur >= 10, Math.min(x.prof.ur, 10) + ' / 10', Math.min(1, x.prof.ur / 10)],
      ['Collection à 5 000 €', x.total >= 5000, this.eur0(Math.min(x.total, 5000)) + ' / 5 000 €', Math.min(1, x.total / 5000)]
    ].map(a => ({ label: a[0], done: a[1], todo: !a[1], sub: a[2], barW: (a[3] * 100).toFixed(0) + '%', color: a[1] ? 'var(--pkm-green)' : 'var(--pkm-accent)', bg: a[1] ? 'rgba(var(--pkm-green-rgb), 0.14)' : 'rgba(var(--pkm-accent-rgb), 0.10)' }));
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
      ctaBg: s.adv ? 'transparent' : 'var(--pkm-accent)', ctaFg: s.adv ? 'var(--pkm-t1)' : 'var(--pkm-on-accent)',
      fan: fan.map(r => ({ img: I[r[0]], left: r[1], top: r[2], rot: r[3] })),
      valuations: [['pkm', 'Cote Dropicards'], ['cm', 'Tendance CM'], ['low', 'Plus bas CM']].map(([k, label]) => Object.assign(
        { label: label, on: s.valuation === k, pick: () => this.setState({ valuation: k }) }, this.chip(s.valuation === k))),
      valHelp: {
        pkm: 'Recommandé. Médiane des prix « marché » : tendance Cardmarket, ventes réussies eBay, TCGplayer.',
        cm: 'Prix de tendance calculé par Cardmarket, sans les autres sources.',
        low: 'Annonce la moins chère sur Cardmarket : un prix demandé, souvent plus bas que le prix vendu.'
      }[s.valuation],
      sources: [
        ['Cardmarket', 'Fichier public quotidien · 03/10/2026 à 07:00', 'var(--pkm-green)', 'connecté'],
        ['TCGdex', 'Catalogue FR, images et prix TCGplayer', 'var(--pkm-green)', 'connecté'],
        ['eBay', 'API officielle, ventes réussies · accès à confirmer', 'var(--pkm-orange)', 'à vérifier'],
        ['Archive maison', 'Un relevé par jour depuis le 04/09/2026', 'var(--pkm-green)', 'actif'],
        ['Vinted, Leboncoin', 'Pas d’API publique, pas de scraping', 'var(--pkm-off)', 'non connectés']
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
      predSteps: ['novice', 'regular', 'passion'].map((k, i) => ({ name: C[k].name, bg: i === pr.lvl ? C[k].tint : 'transparent', bc: i === pr.lvl ? C[k].color : 'var(--pkm-line-2)', fg: i === pr.lvl ? C[k].color : 'var(--pkm-t4)' })),
      adapts: this.adapts(pr.cat).map(t => ({ text: t, color: cur.color })),
      dots: [1, 2, 3].map(n => ({ w: n === s.onb ? '22px' : '8px', bg: n <= s.onb ? 'var(--pkm-accent)' : 'var(--pkm-line-2)' })),
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
        avatarBg: k === 'toi' ? 'var(--pkm-link)' : 'var(--pkm-peach)', shareLabel: (k === 'toi' ? s.split : 100 - s.split) + ' % de la marge nette',
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
    const segOn = on => ({ bg: on ? 'var(--pkm-accent)' : 'transparent', fg: on ? 'var(--pkm-on-accent)' : 'var(--pkm-t2)' });
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
        big: d.price > 0 ? this.signed(r.margin) : '—', bigColor: d.price > 0 ? col(r.margin) : 'var(--pkm-t3)',
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
        big: this.signed(add), bigColor: 'var(--pkm-t1)',
        lines: [
          { label: 'Cote Dropicards unitaire', value: this.eur(u) },
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
      count: rows.length + (rows.length > 1 ? ' magasins' : ' magasin') + ' · ' + partners + (partners > 1 ? ' partenaires Dropicards' : ' partenaire Dropicards') + ' · rayon ' + radius + ' km',
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
      partnerNote: st.partner ? 'Boutique partenaire Dropicards : elle annonce ses arrivages dans l’app.' : 'Pas encore partenaire : estimation tirée des signalements et de l’historique.',
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
      alertBg: on ? 'transparent' : 'var(--pkm-accent)', alertFg: on ? 'var(--pkm-green)' : 'var(--pkm-on-accent)', alertBc: on ? 'rgba(var(--pkm-green-rgb), 0.5)' : 'var(--pkm-accent)',
      toggleAlert: () => this.toggleAlert(st.id),
      route: () => this.say('Démo : l’itinéraire s’ouvrirait dans ton application de cartes')
    };
  }

  renderVals() {
    const s = this.st(), c = this.compute(s), cat = this.catalog(), P = c.byId;
    const col = n => (this.r2(n) < 0 ? 'var(--pkm-down)' : 'var(--pkm-up)');
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
      mask: t => (s.masked ? '•••• €' : t), line: i => (i === 0 ? 'none' : '1px solid var(--pkm-line)'),
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
    const tabInfo = k => ({ fg: sec === k ? 'var(--pkm-nav-on)' : 'var(--pkm-nav-off)', dot: sec === k ? 'var(--pkm-nav-dot)' : 'transparent', cur: sec === k ? 'page' : 'false' });
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
  const IMG = {"k1":"https://assets.tcgdex.net/fr/sv/sv08/238/high.webp","k2":"https://assets.tcgdex.net/fr/me/me02.5/272/high.webp","k3":"https://assets.tcgdex.net/fr/me/me02.5/288/high.webp","k4":"https://assets.tcgdex.net/fr/me/30th/155/high.webp","k5":"https://assets.tcgdex.net/fr/sm/sm9/162/high.webp","k6":"img/card-mewtwo-slab.webp","avatar":"img/avatar-jirachi.webp","megaEvo":"https://assets.tcgdex.net/fr/me/me01/logo.webp","delta":"img/logo-regne-delta.webp","anniv":"img/logo-30-anniversaire.webp","nuit":"https://assets.tcgdex.net/fr/me/me05/logo.webp","chaos":"https://assets.tcgdex.net/fr/me/me04/logo.webp"};
  Component.prototype.img = function () { return IMG; };
  // ——— Catalogue complet TCGdex ———
  // web/data/cards.json est reconstruit chaque jour par GitHub Actions (.github/workflows/tcgdex.yml) :
  // catalogue français, complété par le catalogue anglais (visuels manquants, extensions jamais sorties
  // en français). Les cartes de la maquette restent la collection de démo.
  // - Marché : recherche dans tout le catalogue, et entrée « Toutes les cartes » (extensions, puis grille).
  // - Une carte ouverte ou ajoutée rejoint le catalogue de l'app (état « extra »).
  // - Images : CDN TCGdex (assets.tcgdex.net), jamais stockées chez nous. Vignettes en low.webp
  //   (245 × 337) ; grilles en low ou high.webp selon l'écran (srcset) ; fiche et zoom en high.png
  //   (600 × 825, sans perte), la meilleure qualité que publie TCGdex.
  // - Cartes sans scan TCGdex dans aucune langue : scan anglais pokemontcg.io (chemin « ptcg: », petit visuel
  //   dans les grilles, 734 × 1024 sur la fiche) ; sinon une carte « visuel à venir » dessinée par l'app.
  //   Si une image ne charge plus, data-fallback (« drawn:<id> ») affiche la carte dessinée, créée à la demande.
  const TCG = { status: 'loading', doc: null, F: null, rows: [], byId: {}, bySet: {}, setList: [], items: {}, saved: {}, fan: [] };
  // Sans accents ni casse ; « Pikachu-ex » se trouve aussi avec « pikachu ex ».
  const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-‐–]/g, ' ').toLowerCase();
  // Raretés comptées comme « ultra rares » pour le profil automatique (ultra rare et au-dessus).
  const UR_RARITY = /^(ultra rare|chromatique ultra rare|illustration spéciale rare|magnifique rare|hyper rare|méga hyper rare|couronne|rare secrète)$/i;
  const FLAG_EN = 'linear-gradient(90deg, transparent 42%, #C8102E 42% 58%, transparent 58%), linear-gradient(180deg, #012169 38%, #C8102E 38% 62%, #012169 62%)';
  const LIMIT = 40;
  // Adresses d'images qui n'ont pas chargé (photos et logos) : l'app affiche alors le visuel suivant.
  const BROKEN = new Set();
  // Date du jour réelle (heure locale) pour le scellé, le Radar et les Sorties ; ?today=AAAA-MM-JJ pour les tests.
  // La collection de démo garde sa date fixe (today() de la maquette).
  const realToday = function () {
    try { const t = new URLSearchParams(location.search).get('today'); if (/^\d{4}-\d{2}-\d{2}$/.test(t || '')) return t; } catch (e) { /* adresse sans paramètres */ }
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  // Langue d'un visuel de repli (même dessin officiel, texte dans une autre langue).
  const VERSION = { FR: 'française', EN: 'anglaise', DE: 'allemande', IT: 'italienne', ES: 'espagnole' };
  const PTCG = 'https://images.pokemontcg.io/', ASSETS = 'https://assets.tcgdex.net/';
  // Adresses d'un visuel selon sa source (chemin de cards.json).
  function visual(path) {
    if (!path) return null;
    if (path.indexOf('ptcg:') === 0) {
      // Grilles : le petit visuel seulement (le grand pèse jusqu'à 1 Mo) ; fiche et zoom : le grand.
      const b = PTCG + path.slice(5);
      return { img: b + '.png', hi: b + '_hires.png', srcset: '', lang: 'EN', credit: 'pokemontcg.io · haute définition (734 × 1024)' };
    }
    const b = /^https?:/.test(path) ? path : ((TCG.doc && TCG.doc.img) || ASSETS) + path;
    return { img: b + '/low.webp', hi: b + '/high.png', srcset: b + '/low.webp 245w, ' + b + '/high.webp 600w',
      lang: (/^([a-z]{2})\//.exec(path) || [0, 'fr'])[1].toUpperCase(), credit: 'TCGdex · qualité maximale (PNG 600 × 825)' };
  }
  // Carte dessinée en attendant un scan officiel : nom, extension, numéro et rareté, aux couleurs Dropicards.
  const esc = t => String(t || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const wrap = (t, n) => {
    const lines = [''];
    String(t || '').split(/\s+/).forEach(w => {
      const cur = lines[lines.length - 1];
      if (cur && (cur + ' ' + w).length > n) lines.push(w); else lines[lines.length - 1] = (cur + ' ' + w).trim();
    });
    return lines.slice(0, 2);
  };
  function drawnCard(p) {
    const edge = p.ur ? '#FFD66B' : '#A8B6FF';
    const text = (lines, y, dy, size, attrs) => lines.map((l, i) => '<text x="56" y="' + (y + i * dy) + '" font-size="' + size + '" ' + attrs + '>' + esc(l) + '</text>').join('');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 825" font-family="Helvetica, Arial, sans-serif">'
      + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A3B66"/><stop offset="1" stop-color="#0E1729"/></linearGradient></defs>'
      + '<rect width="600" height="825" rx="28" fill="#0B1120"/>'
      + '<rect x="16" y="16" width="568" height="793" rx="22" fill="url(#g)" stroke="' + edge + '" stroke-opacity="0.55" stroke-width="5"/>'
      + text(wrap(p.name, 16), 104, 54, 46, 'font-weight="700" fill="#F3F6FC"')
      + '<rect x="56" y="230" width="488" height="320" rx="18" fill="#0B1120" fill-opacity="0.55" stroke="' + edge + '" stroke-opacity="0.4" stroke-width="3" stroke-dasharray="14 10"/>'
      + '<text x="300" y="380" text-anchor="middle" font-size="36" font-weight="700" fill="#C9D3EA">Visuel à venir</text>'
      + '<text x="300" y="428" text-anchor="middle" font-size="25" fill="#9AA8C3">scan officiel pas encore publié</text>'
      + text(wrap(p.setName, 28), 618, 40, 30, 'font-weight="700" fill="#F3F6FC"')
      + text(['n° ' + p.numShort + (p.rarity ? ' · ' + p.rarity : '')], 708, 0, 26, 'fill="#9AA8C3"')
      + '<text x="544" y="772" text-anchor="end" font-size="34" font-weight="800" fill="' + edge + '">Dropicards</text></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  const setOf = id => (TCG.doc && TCG.doc.sets[id]) || [id, '', '', '', '', 'fr'];
  // Cote Dropicards d'une ligne du catalogue : la même règle que cote() (Cardmarket et TCGplayer).
  function coteOf(r, F) { const a = r[F.cm], b = r[F.tcp]; return a && b ? (a + b) / 2 : a || b || 0; }

  TCG.load = function (doc) {
    const F = {};
    doc.fields.forEach((k, i) => { F[k] = i; });
    TCG.doc = doc; TCG.F = F; TCG.items = {}; TCG.byId = {}; TCG.bySet = {};
    TCG.rows = doc.cards.map(r => {
      const set = setOf(r[F.set]);
      return { r: r, name: fold(r[F.name]), hay: fold([r[F.name], set[0], set[1], r[F.num], r[F.rarity]].join(' ')) };
    });
    TCG.rows.forEach(x => {
      TCG.byId[x.r[F.id]] = x;
      (TCG.bySet[x.r[F.set]] = TCG.bySet[x.r[F.set]] || []).push(x);
    });
    // Extensions, des plus récentes aux plus anciennes.
    TCG.setList = Object.keys(doc.sets).filter(id => TCG.bySet[id]).map(id => {
      const s = doc.sets[id];
      return { id: id, name: s[0], serie: s[1], date: s[2], logo: s[3], official: s[4] || '', lang: String(s[5] || 'fr').toUpperCase(), n: TCG.bySet[id].length, key: fold([s[0], s[1], id].join(' ')) };
    }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    // Bandeau du Marché : les trois cartes les plus cotées de la dernière extension française.
    const last = TCG.setList.find(e => e.lang === 'FR' && TCG.bySet[e.id].some(x => x.r[F.img]));
    TCG.fan = last ? TCG.bySet[last.id].filter(x => x.r[F.img]).sort((a, b) => coteOf(b.r, F) - coteOf(a.r, F)).slice(0, 3).map(x => x.r[F.id]) : [];
    TCG.status = 'ready';
  };
  // Carte TCGdex au format des articles de la maquette (mêmes champs de prix : cm, low, ebay, tcp, avg30),
  // construite à partir d'une ligne de cards.json (champs F, extension set).
  function buildItem(id, r, F, set) {
    const v = visual(r[F.img] || ''), rarity = r[F.rarity] || '', num = String(r[F.num] || ''), official = set[4] || '';
    const lang = String(set[5] || 'fr').toUpperCase();
    const numShort = num + (official && /^\d+$/.test(num) ? '/' + official : '');
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
    const p = {
      id: id, tcg: true, type: 'card', code: 'CRT', name: r[F.name], rarity: rarity, ur: UR_RARITY.test(rarity),
      num: num, numShort: numShort, numLabel: 'n° ' + numShort,
      sub: [rarity || 'Rareté non renseignée', set[0], 'n° ' + numShort].join(' · ') + (lang === 'EN' ? ' · EN' : ''),
      setName: set[0], set: r[F.set], lang: lang, imgLang: v ? v.lang : '', credit: v ? v.credit : 'Carte dessinée par Dropicards en attendant le scan officiel',
      img: v ? v.img : '', imgHi: v ? v.hi : '', srcset: v ? v.srcset : '',
      fallback: 'drawn:' + id, fallbackHi: 'drawn:' + id,
      logo: '', grade: null, release: null,
      cm: r[F.cm], low: r[F.low], ebay: null, tcp: r[F.tcp], avg30: r[F.avg30], upd: r[F.upd], seed: seed,
      // Moyennes Cardmarket 7 jours et 1 jour (absentes des fichiers plus anciens) : tendance sur l'accueil.
      avg7: typeof r[F.avg7] === 'number' ? r[F.avg7] : null, avg1: typeof r[F.avg1] === 'number' ? r[F.avg1] : null
    };
    if (!v) { p.img = p.imgHi = drawnCard(p); p.fallback = p.fallbackHi = ''; }
    return p;
  }
  const fieldIndex = fields => { const F = {}; fields.forEach((k, i) => { F[k] = i; }); return F; };
  TCG.item = function (id) {
    if (TCG.items[id]) return TCG.items[id];
    const x = TCG.byId[id], sv = TCG.saved[id];
    let p = null;
    if (x) p = buildItem(id, x.r, TCG.F, setOf(x.r[TCG.F.set]));
    else if (sv && sv.r && sv.f) p = buildItem(id, sv.r, fieldIndex(sv.f), sv.set || [sv.r[2], '', '', '', '', 'fr']);
    else return sv || null; // enregistrement d'une version précédente : l'article complet
    TCG.items[id] = p;
    return p;
  };
  // Ligne brute d'une carte, pour l'enregistrer sur l'appareil (quelques centaines d'octets).
  TCG.raw = function (id) {
    const x = TCG.byId[id];
    if (x) return { r: x.r, f: TCG.doc.fields, set: setOf(x.r[TCG.F.set]) };
    const sv = TCG.saved[id];
    return sv && sv.r ? sv : null;
  };
  // Carte dessinée d'une carte, créée seulement quand une image ne charge pas.
  TCG.drawnFor = function (id) { const p = TCG.item(id); return p ? drawnCard(p) : ''; };
  // Recherche sans accents ni casse, tous les mots doivent apparaître (nom, extension, série, numéro, rareté).
  // Ordre : nom exact, puis nom qui commence par la recherche, puis cote décroissante.
  TCG.search = function (q, limit) {
    const words = fold(q).split(/\s+/).filter(Boolean), fq = fold(q).trim(), F = TCG.F;
    if (!words.length) return { total: 0, items: [] };
    const hits = [];
    for (const x of TCG.rows) {
      if (words.every(w => x.hay.indexOf(w) >= 0)) hits.push({ x: x, rank: x.name === fq ? 0 : x.name.indexOf(fq) === 0 ? 1 : 2, v: coteOf(x.r, F) });
    }
    hits.sort((a, b) => a.rank - b.rank || b.v - a.v);
    return { total: hits.length, items: hits.slice(0, limit).map(h => TCG.item(h.x.r[F.id])) };
  };
  // Visuel en qualité maximale : high.png pour les cartes TCGdex (y compris celles de la démo).
  const hiOf = p => p.imgHi || (typeof p.img === 'string' && /\/high\.webp$/.test(p.img) ? p.img.replace(/high\.webp$/, 'high.png') : p.img);
  const logoUrl = path => (path ? (/^https?:/.test(path) ? path : TCG.doc.img + path) + '.webp' : '');

  const proto = Component.prototype;
  const baseCatalog = proto.catalog;
  proto.catalog = function () {
    const base = baseCatalog.call(this), extra = (this.state && this.state.extra) || [];
    return extra.length ? base.concat(extra.map(TCG.item).filter(Boolean)) : base;
  };
  // Pas d'historique inventé pour les vraies cartes : la courbe viendra de l'archive quotidienne.
  const baseHistory = proto.history;
  proto.history = function (p) { return p.tcg ? null : baseHistory.call(this, p); };
  const baseLook = proto.look;
  proto.look = function (p) { return Object.assign(baseLook.call(this, p), { srcset: p.srcset || '', fallback: p.fallback || '' }); };
  const baseFlag = proto.flag;
  proto.flag = function (lang) { return lang === 'EN' ? FLAG_EN : baseFlag.call(this, lang); };
  // « Toutes les cartes » vient du Marché ; une extension, de « Toutes les cartes ».
  const baseParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'sets' ? 'market' : sc === 'set' ? 'sets' : baseParent.call(this, sc); };
  // Liens directs : #extensions ou ?start=set&setId=sv08.
  const baseSt = proto.st;
  proto.st = function () {
    const d = baseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && (p.start === 'sets' || p.start === 'set')) d.screen = p.start;
    if (d.setId === undefined) d.setId = p.setId || '';
    if (d.setFilter === undefined) d.setFilter = 'all';
    if (d.eq === undefined) d.eq = '';
    return d;
  };
  proto.openTcg = function (id) {
    const ex = this.st().extra || [];
    this.push('item', { itemId: id, extra: ex.indexOf(id) >= 0 ? ex : ex.concat([id]) });
  };
  proto.openSets = function () { this.push('sets', { eq: '' }); };
  // Nombre de cartes différentes de chaque extension dans la collection.
  proto.ownedBySet = function (s) {
    const c = this.compute(s), own = {};
    ((this.state && this.state.extra) || []).forEach(id => {
      const p = TCG.item(id), st = c.stock[id];
      if (p && st && st.qty > 0) own[p.set] = (own[p.set] || 0) + 1;
    });
    return own;
  };

  const baseMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseMarket.call(this, x), s = x.s, q = String(s.mq || '').trim();
    r.browse = { show: false, fan: [], sub: '', open: null };
    if (TCG.status === 'loading') { r.count = q ? 'Chargement du catalogue complet…' : r.count; return r; }
    if (TCG.status === 'error') { r.count = r.count + ' · catalogue complet indisponible'; return r; }
    const total = TCG.rows.length.toLocaleString('fr-FR');
    if (!q) {
      r.browse = {
        show: true, sub: total + ' cartes · ' + TCG.setList.length + ' extensions · visuels officiels', open: () => this.openSets(),
        fan: TCG.fan.map((id, i) => ({ img: TCG.item(id).img, fallback: TCG.item(id).fallback, top: ['9px', '2px', '9px'][i], left: ['0px', '17px', '34px'][i], rot: ['-10deg', '0deg', '10deg'][i] }))
      };
    }
    if (q.length < 2 || s.mfilter === 'soon') { r.count = r.count + ' · cherche parmi ' + total + ' cartes'; return r; }
    const res = TCG.search(q, LIMIT), start = r.list.length;
    r.list = r.list.concat(res.items.map((p, i) => {
      const k = this.cote(p), st = x.c.stock[p.id];
      return Object.assign(this.look(p), {
        name: p.name, sub: p.sub, border: x.line(start + i), owned: !!(st && st.qty > 0),
        cote: k !== null ? this.eur(k) : '—', coteLabel: k !== null ? 'cote Dropicards' : 'sans prix',
        right: k !== null ? 'cote Dropicards' : 'sans prix', rightColor: 'var(--pkm-t3)',
        open: () => this.openTcg(p.id)
      });
    }));
    r.empty = r.list.length === 0;
    r.total = start + res.total; // nombre de résultats, cartes au-delà des 40 affichées comprises (recherche de l'accueil)
    r.count = res.total === 0 ? 'Aucune carte trouvée parmi ' + total
      : (res.total > LIMIT ? LIMIT + ' premières cartes sur ' + res.total.toLocaleString('fr-FR') : res.total + (res.total > 1 ? ' cartes trouvées' : ' carte trouvée')) + ' · catalogue TCGdex';
    return r;
  };

  // « Toutes les cartes » : extensions groupées par série, les plus récentes d'abord ; celles jamais
  // sorties en français à la fin.
  proto.vSets = function (s) {
    const res = { q: s.eq || '', onQ: e => this.setState({ eq: e.target.value }), count: '', subtitle: '', empty: false, groups: [] };
    if (TCG.status !== 'ready') {
      res.count = TCG.status === 'error' ? 'Catalogue complet indisponible pour le moment.' : 'Chargement du catalogue…';
      return res;
    }
    const own = this.ownedBySet(s), words = fold(s.eq || '').split(/\s+/).filter(Boolean);
    const list = TCG.setList.filter(e => words.every(w => e.key.indexOf(w) >= 0));
    const groups = [], byName = {};
    list.forEach(e => {
      const en = e.lang === 'EN', name = en ? 'Sans version française' : (e.serie || 'Autres extensions');
      if (!byName[name]) { byName[name] = { name: name, en: en, sets: [] }; groups.push(byName[name]); }
      byName[name].sets.push(e);
    });
    groups.sort((a, b) => a.en - b.en);
    res.groups = groups.map(g => ({
      name: g.name, hasNote: g.en, note: g.en ? 'Cartes en anglais : ces extensions n’ont pas de version française dans le catalogue TCGdex.' : '',
      sets: g.sets.map((e, i) => {
        const k = own[e.id] || 0, cards = e.n + (e.n > 1 ? ' cartes' : ' carte'), logo = logoUrl(e.logo), hasLogo = !!logo && !BROKEN.has(logo);
        return {
          name: e.name, sub: (e.date ? this.d3(e.date) + ' · ' : '') + cards, logo: logo, hasLogo: hasLogo, noLogo: !hasLogo,
          code: e.id.toUpperCase(), owned: k > 0, ownedText: k + ' à toi', border: i === 0 ? 'none' : '1px solid var(--pkm-line)',
          label: e.name + ', ' + cards + (k ? ', ' + k + ' à toi' : ''), open: () => this.push('set', { setId: e.id, setFilter: 'all' })
        };
      })
    }));
    const n = list.reduce((t, e) => t + e.n, 0);
    res.count = list.length + (list.length > 1 ? ' extensions · ' : ' extension · ') + n.toLocaleString('fr-FR') + (n > 1 ? ' cartes' : ' carte');
    res.subtitle = TCG.rows.length.toLocaleString('fr-FR') + ' cartes · ' + TCG.setList.length + ' extensions';
    res.empty = list.length === 0;
    return res;
  };

  // Une extension : toutes ses cartes en grille, visuels officiels.
  const EMPTY_SET = { title: '', subtitle: '', hasLogo: false, logo: '', countText: '', valueText: '', hasNote: false, note: '', filters: [], count: '', empty: false, emptyText: '', cards: [] };
  proto.vSet = function (s) {
    if (TCG.status !== 'ready') {
      return Object.assign({}, EMPTY_SET, { title: 'Extension', count: TCG.status === 'error' ? 'Catalogue complet indisponible pour le moment.' : 'Chargement du catalogue…' });
    }
    const e = TCG.setList.find(z => z.id === s.setId);
    if (!e) return Object.assign({}, EMPTY_SET, { title: 'Extension introuvable', empty: true, emptyText: 'Cette extension n’est pas dans le catalogue.' });
    const c = this.compute(s), F = TCG.F, all = TCG.bySet[e.id].map(x => TCG.item(x.r[F.id]));
    const qty = p => (c.stock[p.id] ? c.stock[p.id].qty : 0), mine = all.filter(p => qty(p) > 0), nUr = all.filter(p => p.ur).length;
    const f = ['all', 'top', 'ur', 'own'].indexOf(s.setFilter) >= 0 ? s.setFilter : 'all';
    const shown = f === 'ur' ? all.filter(p => p.ur) : f === 'own' ? mine
      : f === 'top' ? all.filter(p => this.cote(p) !== null).sort((a, b) => this.cote(b) - this.cote(a)) : all;
    const priced = all.filter(p => this.cote(p) !== null), full = priced.reduce((t, p) => t + this.cote(p), 0);
    const foreign = all.filter(p => p.imgLang && p.imgLang !== p.lang), noImgs = all.filter(p => !p.imgLang).length;
    const versions = foreign.map(p => VERSION[p.imgLang] || p.imgLang).filter((v, i, a) => a.indexOf(v) === i);
    const notes = [];
    if (e.lang === 'EN') notes.push('Cartes en anglais : cette extension n’a pas de version française dans le catalogue TCGdex.');
    if (foreign.length) {
      notes.push(foreign.length + (foreign.length > 1 ? ' visuels viennent de la version ' : ' visuel vient de la version ') + versions.join(', ')
        + ' : même dessin officiel, le scan ' + (e.lang === 'EN' ? 'anglais' : 'français') + ' n’est pas encore disponible.');
    }
    if (noImgs) notes.push(noImgs + (noImgs > 1 ? ' cartes n’ont' : ' carte n’a') + ' pas encore de scan officiel : Dropicards les dessine en attendant.');
    const defs = [['all', 'Toutes · ' + all.length], ['top', 'Les plus chères'], ['ur', 'Ultra rares · ' + nUr], ['own', 'À toi · ' + mine.length]];
    return {
      title: e.name, subtitle: [e.serie, e.date ? this.d3(e.date) : '', e.lang === 'EN' ? 'EN' : ''].filter(Boolean).join(' · '),
      hasLogo: !!e.logo && !BROKEN.has(logoUrl(e.logo)), logo: logoUrl(e.logo),
      countText: all.length + (all.length > 1 ? ' cartes' : ' carte') + (e.official && Number(e.official) !== all.length ? ' · ' + e.official + ' officielles' : ''),
      valueText: priced.length ? 'Série complète ≈ ' + this.eur0(full) + ' (cote Dropicards de ' + priced.length + ' cartes)' : 'Pas encore de prix pour cette extension',
      hasNote: notes.length > 0, note: notes.join(' '),
      filters: defs.map(([k, label]) => Object.assign({ label: label, on: f === k, pick: () => this.setState({ setFilter: k }) }, this.chip(f === k))),
      count: shown.length + (shown.length > 1 ? ' cartes' : ' carte') + (f === 'top' ? ' · par cote décroissante' : ' · par numéro'),
      empty: shown.length === 0, emptyText: f === 'own' ? 'Aucune carte de cette extension dans ta collection.' : 'Aucune carte.',
      cards: shown.map(p => {
        const k = this.cote(p), q = qty(p);
        return {
          img: p.img, srcset: p.srcset, fallback: p.fallback || '', name: p.name, num: p.numShort, owned: q > 0, qty: '×' + q,
          cote: k === null ? '—' : k >= 100 ? this.eur0(k) : this.eur(k), coteColor: k === null ? 'var(--pkm-t4)' : 'var(--pkm-t1)',
          label: p.name + ', ' + p.numLabel + (k !== null ? ', cote ' + this.eur(k) : ', sans prix') + (q ? ', ' + q + ' dans ta collection' : ''),
          open: () => this.openTcg(p.id)
        };
      })
    };
  };

  const baseItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    it.hasChart = it.hasCote && !!x.hist[p.id];
    it.canAdd = it.hasCote || !!p.tcg;
    it.upcoming = it.noCote && !p.tcg;
    // Carte entière en qualité maximale, agrandissable.
    it.zoomImg = hiOf(p);
    it.fallbackHi = p.fallbackHi || '';
    it.zoomCredit = p.tcg ? (p.imgLang ? 'Visuel officiel via ' + p.credit : p.credit) : 'Visuel officiel via TCGdex · qualité maximale (PNG 600 × 825)';
    if (it.plainCard) it.img = it.zoomImg;
    it.zoom = () => this.setState({ zoom: p.id });
    it.zoomLabel = 'Agrandir la carte ' + p.name;
    it.zoomVersion = p.tcg && p.imgLang && p.imgLang !== p.lang ? VERSION[p.imgLang] || p.imgLang : '';
    it.hasImgNote = false;
    it.imgNote = '';
    if (p.tcg) {
      const day = p.upd ? ', prix du ' + this.d2(p.upd) : '';
      it.sources.forEach(so => { so.sub = so.sub.replace(' · fichier public du 03/10', ' · via TCGdex' + day).replace(' · annonces du 03/10', ' · via TCGdex' + day); });
      const n = [p.cm, p.tcp].filter(v => typeof v === 'number').length;
      if (n === 2) it.coteRule = 'Cote Dropicards = moyenne des 2 prix « marché » disponibles (tendance Cardmarket et TCGplayer). Le prix demandé est affiché, jamais compté.';
      if (it.noCote) it.release = 'Pas encore de prix « marché » pour cette carte (Cardmarket et TCGplayer, via TCGdex). Tu peux quand même l’ajouter à ta collection.';
      if (it.hasCote) it.change = 'Courbe après quelques jours d’archivage';
      const notes = [];
      if (p.lang === 'EN') notes.push('Carte en anglais : cette extension n’a pas de version française dans le catalogue TCGdex.');
      if (!p.imgLang) notes.push('Pas encore de scan officiel pour cette carte : Dropicards affiche une carte dessinée en attendant.');
      else if (p.imgLang !== p.lang) notes.push('Visuel de la version ' + (VERSION[p.imgLang] || p.imgLang) + ' (même dessin officiel) : le scan ' + (p.lang === 'EN' ? 'anglais' : 'français') + ' de cette carte n’est pas encore disponible.');
      it.imgNote = notes.join(' ');
      it.hasImgNote = it.imgNote !== '';
    }
    return it;
  };

  // Écrans « Toutes les cartes » et « Extension », zoom de la carte.
  const baseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseRender.call(this), s = this.st(), ui = r.ui;
    ui.isSets = s.screen === 'sets';
    ui.isSet = s.screen === 'set';
    r.exts = ui.isSets ? this.vSets(s) : { q: '', onQ: null, count: '', subtitle: '', empty: false, groups: [] };
    r.cset = ui.isSet ? this.vSet(s) : EMPTY_SET;
    if (ui.isSets || ui.isSet) {
      Object.assign(ui, {
        headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true,
        title: ui.isSets ? 'Toutes les cartes' : r.cset.title, subtitle: ui.isSets ? r.exts.subtitle : r.cset.subtitle,
        syncText: TCG.doc && TCG.doc.generated ? 'Catalogue TCGdex · mis à jour le ' + this.d2(TCG.doc.generated.slice(0, 10)) : 'Catalogue TCGdex'
      });
      ui.hasSubtitle = ui.subtitle !== '';
    }
    ui.zoomOpen = !!s.zoom && s.zoom === s.itemId && ui.isItem && !!r.it.plainCard;
    r.zoom = {
      img: r.it.zoomImg || '', name: r.it.name, sub: r.it.sub, label: 'Carte ' + r.it.name + ' en grand',
      credit: (r.it.zoomCredit || '') + (r.it.zoomVersion ? ' · version ' + r.it.zoomVersion : ''), fallback: r.it.fallbackHi || '',
      close: () => this.setState({ zoom: null })
    };
    return r;
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

  // Réglages : sources de prix telles qu'elles sont branchées dans cette démo.
  const baseSettingsSources = proto.vSettings;
  proto.vSettings = function (x) {
    const r = baseSettingsSources.call(this, x);
    const sub = { Cardmarket: 'Tendance, plus bas et moyenne 30 jours · via TCGdex, chaque jour', TCGdex: 'Catalogue FR (complété en anglais), visuels et prix TCGplayer',
      'Archive maison': 'Un relevé par jour (historique du catalogue) depuis le 03/10/2026' };
    r.sources.forEach(so => { if (sub[so.label]) so.sub = sub[so.label]; });
    return r;
  };
  // ——— Produits scellés : catalogue réel, vraies photos ———
  // web/data/sealed.json (GitHub Actions, chaque jour) : produits sortis en France depuis l'automne 2025 ou
  // annoncés (galerie officielle Pokémon France), avec la cote Cardmarket du jour (guide des prix public).
  // Visuels officiels dans web/img/products/ ; sans visuel (displays…), logo de l'extension sur son fond.
  // - Marché : recherche dans le scellé, prochains produits dans « Sorties », écran « Produits scellés ».
  // - Produits de la démo (p1…m4) : vraie photo et vrai prix quand le produit est au catalogue.
  // - Un produit ouvert ou ajouté rejoint le catalogue de l'app (état « extra », identifiant « sp-… »).
  const SEALED = { status: 'loading', doc: null, F: null, rows: [], byId: {}, items: {} };
  const SP = 'sp-';
  const TYPE_LABEL = { ETB: 'Coffret Dresseur d’élite', UPC: 'Collection Ultra-Premium', DSP: 'Display', BDL: 'Lot de boosters',
    TIN: 'Boîte', BST: 'Booster', DCK: 'Deck', CFT: 'Coffret' };
  const TYPE_FILTERS = [['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['BDL', 'Lots de boosters'], ['TIN', 'Boîtes'], ['CFT', 'Coffrets'], ['DCK', 'Decks'], ['BST', 'Boosters']];
  // Fond (setArt de la maquette) et logo de démo des extensions connues de la maquette.
  const SET_ART = { me05: 'nuit', me04: 'chaos', '30th': 'anniv', me01: 'megaEvo', me06: 'delta' };
  const SET_NAMES = { me06: 'Règne Delta' };
  // Photo de démo gardée si le visuel officiel manque.
  const DEMO_PHOTOS = { p2: 'img/products/etb-30e-anniversaire.webp' };
  const TODAY = realToday(); // sorties « à venir » d'après la date réelle

  SEALED.load = function (doc) {
    const F = {};
    doc.fields.forEach((k, i) => { F[k] = i; });
    SEALED.doc = doc; SEALED.F = F; SEALED.items = {}; SEALED.byId = {};
    SEALED.rows = doc.products.map(r => ({ r: r, hay: fold([r[F.name], TYPE_LABEL[r[F.type]] || '', r[F.type], setLabel(r[F.set])].join(' ')) }));
    SEALED.rows.forEach(x => { SEALED.byId[SP + x.r[F.id]] = x; });
    SEALED.status = 'ready';
  };
  function setLabel(set) {
    if (!set) return '';
    if (SET_NAMES[set]) return SET_NAMES[set];
    return TCG.doc && TCG.doc.sets[set] ? TCG.doc.sets[set][0] : '';
  }
  // Produit du catalogue scellé au format des articles de la maquette (mêmes champs de prix).
  function sealedItem(id, r, F) {
    const set = r[F.set] || '', setName = setLabel(set), code = r[F.type], rel = r[F.release] || '';
    const tset = TCG.doc && TCG.doc.sets[set], logo = SET_ART[set] ? IMG[SET_ART[set]] : (tset && tset[3] ? logoUrl(tset[3]) : '');
    const upcoming = rel > TODAY, trend = r[F.trend], low = r[F.low];
    let seed = 0;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
    return {
      id: id, real: true, type: 'sealed', code: code, name: r[F.name], rarity: '', ur: false,
      sub: [TYPE_LABEL[code] || 'Produit scellé', setName].filter(Boolean).join(' · ') + ' · FR',
      img: '', logo: logo, set: SET_ART[set] || set, setId: set, setName: setName, lang: 'FR', grade: null,
      // Avant la sortie, pas de cote : le prix Cardmarket des précommandes est affiché comme prix demandé.
      cm: upcoming ? null : trend, low: upcoming ? (low || trend) : low, avg30: r[F.avg30], ebay: null, tcp: null, seed: seed,
      release: upcoming ? rel : null, released: rel, releaseText: r[F.releaseText] || '', year: r[F.year],
      photo: r[F.photo] ? 'img/products/' + r[F.id] + '.webp' : '', variants: r[F.variants] || 0,
      // Page Sorties (absents des fichiers plus anciens) : ASIN Amazon, prix de lancement constaté, recherche, sources.
      amazon: r[F.amazon] || '', msrp: r[F.msrp] || null, msrpSource: r[F.msrpSource] || '', q: r[F.q] || '', dateSource: r[F.dateSource] || '',
      // Tendance archivée chaque jour (sealed.json : « days » en en-tête, « hist » alignée) : tendance sur l'accueil.
      hist: Array.isArray(r[F.hist]) ? r[F.hist] : null
    };
  }
  SEALED.item = function (id) {
    if (SEALED.items[id]) return SEALED.items[id];
    const x = SEALED.byId[id], sv = TCG.saved[id];
    let p = null;
    if (x) p = sealedItem(id, x.r, SEALED.F);
    else if (sv && sv.s && sv.f) { const F = {}; sv.f.forEach((k, i) => { F[k] = i; }); p = sealedItem(id, sv.s, F); }
    if (p && x) SEALED.items[id] = p;
    return p;
  };
  // Les identifiants « sp-… » passent par le catalogue scellé (affichage et enregistrement sur l'appareil).
  const tcgItem = TCG.item, tcgRaw = TCG.raw, tcgLoad = TCG.load;
  TCG.item = function (id) { return String(id).indexOf(SP) === 0 ? SEALED.item(id) : tcgItem(id); };
  TCG.raw = function (id) {
    if (String(id).indexOf(SP) !== 0) return tcgRaw(id);
    const x = SEALED.byId[id];
    return x ? { s: x.r, f: SEALED.doc.fields } : (TCG.saved[id] && TCG.saved[id].s ? TCG.saved[id] : null);
  };
  TCG.load = function (doc) { tcgLoad(doc); SEALED.items = {}; }; // logos des extensions désormais connus
  // Produits triés : à venir d'abord, puis du plus récent au plus ancien.
  const relKey = p => p.released || (p.releaseText ? String(p.year) + '-12-31' : String(p.year) + '-06-30');
  SEALED.list = function () { return SEALED.rows.map(x => SEALED.item(SP + x.r[SEALED.F.id])).sort((a, b) => (relKey(a) < relKey(b) ? 1 : relKey(a) > relKey(b) ? -1 : 0)); };
  SEALED.search = function (q) {
    const words = fold(q).split(/\s+/).filter(Boolean);
    return words.length ? SEALED.rows.filter(x => words.every(w => x.hay.indexOf(w) >= 0)).map(x => SEALED.item(SP + x.r[SEALED.F.id])) : [];
  };
  // Plaque dessinée, dernier repli sans photo ni logo : nom de l'extension (sinon du produit) en blanc, sur fond
  // transparent. Elle prend la place du logo, sur le fond de l'extension, avec le symbole et le code du produit.
  const PLAQUES = {};
  function plaque(p) {
    const text = p.setName || p.name || 'Produit scellé';
    if (PLAQUES[text]) return PLAQUES[text];
    const lines = [];
    String(text).split(/\s+/).filter(Boolean).forEach(w => {
      const cur = lines[lines.length - 1];
      if (cur !== undefined && (cur + ' ' + w).length <= 16) lines[lines.length - 1] = cur + ' ' + w; else lines.push(w);
    });
    if (lines.length > 3) { lines.length = 3; lines[2] += '…'; }
    const longest = Math.max.apply(null, lines.map(l => l.length));
    const size = Math.min([38, 30, 24][lines.length - 1], 224 / (longest * 0.62)), dy = size * 1.15, y0 = 60 - (lines.length - 1) * dy / 2 + size * 0.36;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120" font-family="Helvetica, Arial, sans-serif">'
      + lines.map((l, i) => '<text x="120" y="' + (y0 + i * dy).toFixed(1) + '" text-anchor="middle" font-size="' + size.toFixed(1)
        + '" font-weight="800" fill="#FFFFFF" stroke="#000000" stroke-opacity="0.3" stroke-width="3" paint-order="stroke">' + esc(l) + '</text>').join('')
      + '</svg>';
    return (PLAQUES[text] = 'data:image/svg+xml,' + encodeURIComponent(svg));
  }
  SEALED.plaque = plaque;

  // Démo : vraie photo et vrai prix des produits de la maquette présents au catalogue.
  const baseSealedCatalog = proto.catalog;
  proto.catalog = function () {
    const list = baseSealedCatalog.call(this), demo = SEALED.doc ? SEALED.doc.demo || {} : {};
    list.forEach(p => {
      if (p.type !== 'sealed' || p.real) return;
      const real = demo[p.id] ? SEALED.item(SP + demo[p.id]) : null;
      if (real) {
        p.realId = real.id;
        if (real.photo) p.photo = real.photo;
        if (real.release) { p.cm = null; p.low = real.low; } // à venir : précommandes seulement
        else {
          if (p.release) p.release = null; // sorti pour de vrai : plus « à venir » dans la démo
          if (typeof real.cm === 'number') { p.cm = real.cm; p.low = real.low; p.avg30 = real.avg30 || p.avg30; p.ebay = null; }
        }
      }
      if (!p.photo && DEMO_PHOTOS[p.id]) p.photo = DEMO_PHOTOS[p.id];
    });
    return list;
  };
  // Pas d'historique inventé pour les produits réels : la courbe viendra de l'archive quotidienne.
  const baseSealedHistory = proto.history;
  proto.history = function (p) { return p.real ? null : baseSealedHistory.call(this, p); };
  // Visuel d'un produit : sa photo ; sinon (ou si elle ne charge pas) le logo de l'extension sur son fond ; sinon
  // la plaque dessinée.
  const baseSealedLook = proto.look;
  proto.look = function (p) {
    const l = baseSealedLook.call(this, p);
    if (p.type !== 'sealed') return Object.assign(l, { photo: '', hasPhoto: false, sealedArt: false });
    const photo = p.photo && !BROKEN.has(p.photo) ? p.photo : '';
    return Object.assign(l, { photo: photo, hasPhoto: !!photo, sealedArt: !photo, logo: l.logo && !BROKEN.has(l.logo) ? l.logo : plaque(p) });
  };
  const baseSealedParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'sealed' ? 'market' : baseSealedParent.call(this, sc); };
  const baseSealedSt = proto.st;
  proto.st = function () {
    const d = baseSealedSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'sealed') d.screen = 'sealed';
    if (d.sfilter === undefined) d.sfilter = 'all';
    return d;
  };
  proto.openSealedList = function () { this.push('sealed', { sfilter: 'all' }); };
  const pricesDay = () => (SEALED.doc && /^\d{4}-\d{2}-\d{2}/.test(SEALED.doc.prices || '') ? SEALED.doc.prices.slice(0, 10) : '');

  // Fiche d'un produit : photo agrandissable, sources de prix du jour, pas de courbe inventée.
  const baseSealedItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseSealedItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    if (it.hasPhoto) {
      it.zoomImg = it.photo;
      it.fallbackHi = '';
      it.zoomLabel = 'Agrandir la photo : ' + p.name;
      it.zoomCredit = 'Visuel officiel du produit · galerie Pokémon France';
      it.zoomVersion = '';
    }
    const real = p.real ? p : (p.realId ? SEALED.item(p.realId) : null);
    if (real) {
      const day = pricesDay() ? ' du ' + this.d2(pricesDay()) : '';
      it.sources.forEach(so => { so.sub = so.sub.replace(' · fichier public du 03/10', ' · guide des prix public' + day).replace(' · annonces du 03/10', ' · guide des prix' + day); });
      const notes = [];
      if (real.variants > 1) notes.push('Plusieurs versions de ce produit : la cote est la médiane des ' + real.variants + ' versions vendues sur Cardmarket.');
      if (!real.variants) notes.push('Pas encore de prix Cardmarket pour ce produit.');
      if (!real.photo) notes.push('Pas de visuel officiel pour ce produit : Dropicards affiche le logo de l’extension.');
      if (!real.release && real.releaseText) notes.push('Sortie : ' + real.releaseText + ' (galerie officielle Pokémon France).');
      if (p.real) {
        if (it.hasCote) it.change = 'Courbe après quelques jours d’archivage';
        it.imgNote = notes.join(' ');
        it.hasImgNote = it.imgNote !== '';
      }
    }
    return it;
  };

  // Marché : produits scellés trouvés en tête de la recherche, prochaines sorties, entrée « Produits scellés ».
  const baseSealedMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseSealedMarket.call(this, x), s = x.s, q = String(s.mq || '').trim();
    r.sealedBrowse = { show: false, fan: [], sub: '', open: null };
    if (SEALED.status !== 'ready') return r;
    const row = (p, i) => {
      const k = this.cote(p), st = x.c.stock[p.id];
      return Object.assign(this.look(p), {
        name: p.name, sub: p.sub, border: x.line(i), owned: !!(st && st.qty > 0),
        cote: k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur(p.low) : '—'), coteLabel: k !== null ? 'cote Dropicards' : (typeof p.low === 'number' ? 'demandé' : 'sans prix'),
        right: p.release ? 'Sortie le ' + this.d2(p.release) : (k !== null ? 'cote Dropicards' : 'prix à venir'), rightColor: p.release ? 'var(--pkm-orange)' : 'var(--pkm-t3)',
        open: () => this.openTcg(p.id)
      });
    };
    // Produits de la démo rattachés au catalogue (déjà listés sous leur nom de démo) ; produits ouverts ou
    // ajoutés (déjà dans les « Sorties » de la maquette s'ils sont à venir).
    const mapped = new Set(x.cat.filter(p => p.realId).map(p => p.realId));
    const inCat = new Set(x.cat.filter(p => p.real).map(p => p.id));
    if (!q) {
      // Éventail : trois produits avec photo ; une photo qui ne charge pas laisse place au logo, sur le fond de l'extension.
      const all = SEALED.list(), photos = all.filter(p => p.photo).slice(0, 3);
      r.sealedBrowse = {
        show: true, open: () => this.openSealedList(),
        sub: all.length + ' produits · visuels officiels · cote Cardmarket',
        fan: photos.map((p, i) => {
          const l = this.look(p);
          return { photo: l.hasPhoto ? l.photo : l.logo, bg: l.hasPhoto ? 'var(--pkm-photo-mat)' : l.bg, top: ['10px', '4px', '10px'][i], left: ['0px', '16px', '32px'][i], rot: ['-9deg', '0deg', '9deg'][i] };
        })
      };
    }
    if (s.mfilter === 'soon') {
      const soon = SEALED.list().filter(p => p.release && !mapped.has(p.id) && !inCat.has(p.id)).sort((a, b) => (a.release < b.release ? -1 : 1));
      r.list = r.list.concat(soon.map((p, i) => row(p, r.list.length + i)));
      r.empty = r.list.length === 0;
      return r;
    }
    if (q.length < 2) return r;
    const hits = SEALED.search(q).filter(p => !mapped.has(p.id));
    if (hits.length) {
      r.list = hits.map((p, i) => row(p, i)).concat(r.list).map((l, i) => Object.assign(l, { border: x.line(i) }));
      r.empty = false;
      r.count = hits.length + (hits.length > 1 ? ' produits scellés · ' : ' produit scellé · ') + r.count;
      if (typeof r.total === 'number') r.total += hits.length;
    }
    return r;
  };

  // « Toutes les cartes » : le scellé en tête.
  const baseSealedSets = proto.vSets;
  proto.vSets = function (s) {
    const res = baseSealedSets.call(this, s);
    if (SEALED.status !== 'ready' || (s.eq && s.eq.trim())) return res;
    const all = SEALED.list(), top = all.find(p => p.photo), first = top && !BROKEN.has(top.photo) ? top : null;
    res.groups = [{
      name: 'Produits scellés', hasNote: false, note: '',
      sets: [{
        name: 'Produits scellés', sub: all.length + ' produits sortis depuis l’automne 2025 · visuels officiels', logo: first ? first.photo : '', hasLogo: !!first, noLogo: !first,
        code: 'SCELLÉ', owned: false, ownedText: '', border: 'none', label: 'Produits scellés, ' + all.length + ' produits', open: () => this.openSealedList()
      }]
    }].concat(res.groups);
    return res;
  };

  // Écran « Produits scellés » : grille de photos, filtre par type.
  const EMPTY_SEALED = { countText: '', note: '', filters: [], count: '', empty: false, items: [] };
  proto.vSealedList = function (s) {
    if (SEALED.status !== 'ready') return Object.assign({}, EMPTY_SEALED, { count: SEALED.status === 'error' ? 'Catalogue scellé indisponible pour le moment.' : 'Chargement du catalogue scellé…' });
    const c = this.compute(s), all = SEALED.list(), f = TYPE_FILTERS.some(d => d[0] === s.sfilter) ? s.sfilter : 'all';
    const shown = f === 'all' ? all : all.filter(p => p.code === f);
    const withPhoto = all.filter(p => p.photo).length;
    const defs = TYPE_FILTERS.filter(d => d[0] === 'all' || all.some(p => p.code === d[0]));
    return {
      countText: all.length + ' produits · ' + withPhoto + ' visuels officiels',
      note: 'Galerie officielle Pokémon France · cote = tendance Cardmarket' + (pricesDay() ? ' du ' + this.d2(pricesDay()) : '') + ' · produits sortis en France depuis l’automne 2025 ou annoncés.',
      filters: defs.map(([k, label]) => Object.assign({ label: label, on: f === k, pick: () => this.setState({ sfilter: k }) }, this.chip(f === k))),
      count: shown.length + (shown.length > 1 ? ' produits' : ' produit') + ' · du plus récent au plus ancien',
      empty: shown.length === 0,
      items: shown.map(p => this.featureCard(p, c.stock))
    };
  };

  const baseSealedRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseSealedRender.call(this), s = this.st(), ui = r.ui;
    if (r.it.hasPhoto && s.zoom && s.zoom === s.itemId && ui.isItem) ui.zoomOpen = true;
    ui.isSealedList = s.screen === 'sealed';
    r.sl = ui.isSealedList ? this.vSealedList(s) : EMPTY_SEALED;
    if (ui.isSealedList) {
      const day = pricesDay();
      Object.assign(ui, {
        headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true, title: 'Produits scellés',
        subtitle: SEALED.status === 'ready' ? SEALED.rows.length + ' produits · visuels officiels' : '',
        syncText: day ? 'Prix Cardmarket · mis à jour le ' + this.d2(day) : 'Prix Cardmarket'
      });
      ui.hasSubtitle = ui.subtitle !== '';
    }
    return r;
  };
  // ——— Articles mis en avant : ETB, UPC, coffrets et cartes ———
  // - Vignettes des listes : plus larges pour le scellé (wk), cadre doré des cartes ultra rares (ring).
  // - Accueil : carrousel « Sorties du moment » (sorties récentes et à venir).
  // - Collection : le scellé sur toute la largeur de la grille, visuel 16:9.
  // - Marché : carrousel « Scellé à la une », cartes du jeu en vignettes plus grandes.
  // - Fiche d'un produit en photo : visuel 16:9 sur toute la largeur ; « Ajouter » : choix plus large pour le scellé.
  const WIDE = 1.75; // largeur des vignettes du scellé dans les listes (× largeur d'origine)
  const SHORT = { ETB: 'ETB', UPC: 'UPC', DSP: 'Display', BDL: 'Lot de boosters', TIN: 'Boîte', BST: 'Booster', DCK: 'Deck', CFT: 'Coffret' };
  const FEATURE_MAX = 10;
  const baseShowLook = proto.look;
  proto.look = function (p) {
    const l = baseShowLook.call(this, p), sealed = l.isSealed;
    return Object.assign(l, {
      wk: sealed ? WIDE : 1, hk: 1, ring: l.ur && !l.graded ? '1.5px solid var(--pkm-gold)' : 'none',
      col: sealed ? '1 / -1' : 'auto', h: sealed ? 'auto' : '176px', ar: sealed ? '16 / 9' : 'auto'
    });
  };
  // Symbole des decks (la maquette n'en avait pas) : deux cartes décalées.
  const baseShowGlyph = proto.glyph;
  proto.glyph = function (code) { return code === 'DCK' ? 'M8.5 4.5h11v15h-11z M5.5 7.5v13h11' : baseShowGlyph.call(this, code); };

  // Grande carte d'un produit scellé (carrousels) : photo 16:9, sortie, cote ou précommandes.
  proto.featureCard = function (p, stock) {
    const l = this.look(p), k = this.cote(p), soon = !!p.release, q = stock[p.id] ? stock[p.id].qty : 0;
    const recent = !soon && p.released && (Date.parse(TODAY) - Date.parse(p.released)) / 86400000 <= 45;
    const when = soon ? 'Sortie le ' + this.d2(p.release) : (p.released ? 'Sorti le ' + this.d2(p.released) : (p.releaseText || String(p.year || '')));
    return Object.assign(l, {
      name: p.name, sub: [when, SHORT[p.code] || 'Scellé'].filter(Boolean).join(' · '),
      price: k !== null ? this.eur(k) : (typeof p.low === 'number' ? '~' + this.eur0(p.low) : 'Prix à venir'),
      priceLabel: k !== null ? 'cote Dropicards' : (typeof p.low === 'number' ? 'précommandes' : ''),
      priceColor: k !== null ? 'var(--pkm-t1)' : 'var(--pkm-t3)',
      hasTag: soon || recent, tag: soon ? 'À venir' : 'Nouveau', tagBg: soon ? 'var(--pkm-orange)' : 'var(--pkm-green)',
      owned: q > 0, qty: '×' + q,
      label: p.name + ', ' + (when ? when.toLowerCase() : 'date à venir') + (k !== null ? ', cote ' + this.eur(k) : '') + (q ? ', ' + q + ' dans ta collection' : ''),
      open: () => this.openTcg(p.id)
    });
  };
  const EMPTY_FEATURE = { show: false, items: [], all: null, allLabel: '' };
  // Sorties du moment : à venir (la plus proche d'abord), puis sorties des 60 derniers jours.
  SEALED.moment = function () {
    if (SEALED.status !== 'ready') return [];
    const day = Date.parse(TODAY), all = SEALED.list();
    const soon = all.filter(p => p.release).sort((a, b) => (a.release < b.release ? -1 : 1));
    const recent = all.filter(p => !p.release && p.released && (day - Date.parse(p.released)) / 86400000 <= 60);
    return soon.concat(recent).slice(0, FEATURE_MAX);
  };

  const baseShowHome = proto.vHome;
  proto.vHome = function (x) {
    const r = baseShowHome.call(this, x), items = SEALED.moment();
    r.rel = items.length ? { show: true, items: items.map(p => this.featureCard(p, x.c.stock)), all: () => this.openReleases(), allLabel: 'Toutes les sorties' } : EMPTY_FEATURE;
    return r;
  };

  const baseShowMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseShowMarket.call(this, x), q = String(x.s.mq || '').trim();
    r.list.forEach(m => { if (m.isCard) { m.wk = 1.15; m.hk = 1.15; } });
    r.feat = EMPTY_FEATURE;
    if (!q && x.s.mfilter !== 'soon' && SEALED.status === 'ready') {
      const items = SEALED.list().filter(p => p.photo).slice(0, FEATURE_MAX);
      if (items.length) r.feat = { show: true, items: items.map(p => this.featureCard(p, x.c.stock)), all: () => this.openSealedList(), allLabel: 'Tout le scellé' };
    }
    return r;
  };

  const baseShowItem = proto.vItem;
  proto.vItem = function (x) {
    const it = baseShowItem.call(this, x);
    it.visH = it.hasPhoto ? 'auto' : '330px';
    it.visAr = it.hasPhoto ? '16 / 9' : 'auto';
    return it;
  };

  const baseShowSheet = proto.vSheet;
  proto.vSheet = function (x) {
    const sh = baseShowSheet.call(this, x);
    (sh.products || []).forEach(po => { po.wk = po.isSealed ? 1.45 : 1; });
    return sh;
  };
  // ——— Page Sorties ———
  // Nouveautés à venir et sorties des 45 derniers jours, d'après le catalogue scellé (web/data/sealed.json) :
  // date et sa source, prix de lancement constaté et sa source, cote ou précommandes Cardmarket.
  // Liens directs vers les enseignes (Amazon, eBay, Fnac, Cultura, Micromania) : sans affiliation ni pistage,
  // ouverts dans un nouvel onglet. Amazon : la fiche du produit quand son ASIN est connu (c'est là qu'on demande
  // une invitation), sinon sa recherche. Dropicards ne fait aucune demande à la place de l'utilisateur.
  const RECENT_DAYS = 45;
  const enc = t => encodeURIComponent(t).replace(/%20/g, '+');
  const SHOP_LINKS = [
    ['eBay', q => 'https://www.ebay.fr/sch/i.html?_nkw=' + enc(q)],
    ['Fnac', q => 'https://www.fnac.com/SearchResult/ResultList.aspx?Search=' + enc(q)],
    ['Cultura', q => 'https://www.cultura.com/search/results?search_query=' + enc(q)],
    ['Micromania', q => 'https://www.micromania.fr/on/demandware.store/Sites-Micromania-Site/fr_FR/Search-Show?q=' + enc(q)]
  ];
  const daysFrom = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 86400000);
  proto.openReleases = function () { this.push('releases'); };
  proto.releaseAlert = function (p) {
    const s = this.st(), key = 'rel:' + p.id, on = !s.alerts[key];
    this.setState({ alerts: Object.assign({}, s.alerts, { [key]: on }), toast: on ? 'Alerte enregistrée sur cet appareil : ' + p.name : 'Alerte retirée' });
    this.flash();
  };
  // Liens d'un produit : Amazon d'abord (fiche ou recherche), puis les autres enseignes.
  proto.releaseLinks = function (p) {
    const q = p.q || 'pokemon ' + fold(p.name);
    const amazon = p.amazon
      ? { label: 'Amazon · fiche', href: 'https://www.amazon.fr/dp/' + p.amazon, aria: 'Amazon : fiche du produit, pour demander une invitation (nouvel onglet)', main: true }
      : { label: 'Amazon', href: 'https://www.amazon.fr/s?k=' + enc(q), aria: 'Amazon : recherche du produit (nouvel onglet)', main: true };
    return [amazon].concat(SHOP_LINKS.map(([label, url]) => ({ label: label, href: url(q), aria: label + ' : recherche du produit (nouvel onglet)', main: false })))
      .map(l => Object.assign(l, { bg: l.main ? 'var(--pkm-accent)' : 'transparent', fg: l.main ? 'var(--pkm-on-accent)' : 'var(--pkm-t1)', bc: l.main ? 'var(--pkm-accent)' : 'var(--pkm-line-2)' }));
  };
  const EMPTY_RELEASES = { status: '', hasStatus: false, soon: [], hasSoon: false, recent: [], hasRecent: false, amazonNote: '', footer: '' };
  proto.vReleases = function (s) {
    if (SEALED.status !== 'ready') return Object.assign({}, EMPTY_RELEASES, { hasStatus: true, status: SEALED.status === 'error' ? 'Catalogue scellé indisponible pour le moment.' : 'Chargement des sorties…' });
    const c = this.compute(s), all = SEALED.list(), day = pricesDay();
    const soon = all.filter(p => p.release).sort((a, b) => (a.release < b.release ? -1 : a.release > b.release ? 1 : 0));
    const recent = all.filter(p => !p.release && p.released && daysFrom(TODAY, p.released) <= RECENT_DAYS).sort((a, b) => (a.released < b.released ? 1 : -1));
    const card = p => {
      const k = this.cote(p), n = daysFrom(p.released, TODAY), on = !!s.alerts['rel:' + p.id];
      const msrp = p.msrp ? (p.msrp.length > 1 ? this.eur(p.msrp[0]) + ' à ' + this.eur(p.msrp[1]) : this.eur(p.msrp[0])) : '';
      return Object.assign(this.featureCard(p, c.stock), {
        hasTag: true, tag: p.release ? (n <= 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : 'Dans ' + n + ' jours') : 'Sorti le ' + this.d2(p.released),
        tagBg: p.release ? 'var(--pkm-orange)' : 'var(--pkm-green)',
        when: (p.release ? 'Sortie le ' : 'Sorti le ') + this.d3(p.released) + (p.dateSource ? ' · date : ' + p.dateSource : ''),
        type: (TYPE_LABEL[p.code] || 'Produit scellé') + (p.setName ? ' · ' + p.setName : ''),
        hasMsrp: !!msrp, noMsrp: !msrp, msrp: msrp, msrpNote: p.msrpSource ? 'Source : ' + p.msrpSource : '',
        coteLabel: k !== null ? 'Cote Cardmarket' : 'Précommandes Cardmarket',
        cote: k !== null ? this.eur(k) : (typeof p.low === 'number' ? 'dès ' + this.eur(p.low) : 'pas encore de prix'),
        coteNote: 'Guide des prix public' + (day ? ' du ' + this.d2(day) : ''),
        links: this.releaseLinks(p),
        alertOn: on, alertLabel: on ? 'Alerte activée' : 'Me prévenir', alert: () => this.releaseAlert(p),
        alertBg: on ? 'var(--pkm-accent)' : 'transparent', alertFg: on ? 'var(--pkm-on-accent)' : 'var(--pkm-t1)',
        sheetLabel: 'Fiche Dropicards : ' + p.name
      });
    };
    return {
      hasStatus: !soon.length && !recent.length, status: 'Aucune sortie annoncée ni récente dans le catalogue.',
      soon: soon.map(card), hasSoon: soon.length > 0, recent: recent.map(card), hasRecent: recent.length > 0,
      amazonNote: 'Certaines nouveautés se vendent sur invitation chez Amazon. Sur la fiche du produit, appuie sur « Demander une invitation » : '
        + 'si tu es retenu, Amazon t’envoie un e-mail et tu as 72 h pour commander. Dropicards ouvre seulement la fiche : aucune demande automatique (Amazon l’interdit), aucune commission.',
      footer: 'Liens directs vers les enseignes, sans affiliation ni pistage : prix et stocks sur leurs sites. Dates et prix de lancement : source indiquée pour chaque produit ; '
        + 'aucun prix conseillé officiel en euros. Cote : guide des prix public Cardmarket.'
    };
  };

  // Navigation : #sorties ; la page appartient au Marché.
  const baseRelParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'releases' ? 'market' : baseRelParent.call(this, sc); };
  const baseRelSt = proto.st;
  proto.st = function () {
    const d = baseRelSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'releases') d.screen = 'releases';
    return d;
  };
  // Territoire : le bandeau « Prochaine sortie » ouvre la page Sorties.
  const baseRelTerritory = proto.vTerritory;
  proto.vTerritory = function (x) {
    const r = baseRelTerritory.call(this, x);
    if (r.release) r.release.open = () => this.openReleases();
    return r;
  };
  // Marché : entrée vers la page Sorties.
  const baseRelMarket = proto.vMarket;
  proto.vMarket = function (x) {
    const r = baseRelMarket.call(this, x), n = SEALED.status === 'ready' ? SEALED.list().filter(p => p.release).length : 0;
    r.releasesEntry = { show: !String(x.s.mq || '').trim(), open: () => this.openReleases(), sub: n ? n + (n > 1 ? ' produits à venir' : ' produit à venir') + ' · Amazon, eBay, Fnac, Cultura, Micromania' : 'Amazon, eBay, Fnac, Cultura, Micromania' };
    return r;
  };
  const baseRelRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseRelRender.call(this), s = this.st(), ui = r.ui;
    ui.isReleases = s.screen === 'releases';
    r.rl = ui.isReleases ? this.vReleases(s) : EMPTY_RELEASES;
    if (ui.isReleases) {
      Object.assign(ui, { headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true, title: 'Sorties', subtitle: 'Pokémon 30 ans, Règne Delta… · liens directs', syncText: 'Sans affiliation ni pistage' });
      ui.hasSubtitle = true;
    }
    // Fiche d'un produit à venir : « Me prévenir à la sortie » enregistre l'alerte sur l'appareil.
    const p = ui.isItem && TCG.item(s.itemId);
    if (p && p.real && p.release) r.notify = () => this.releaseAlert(p);
    return r;
  };
  // ——— Collection enregistrée sur l'appareil ———
  // Achats, ventes et réglages sont enregistrés dans le navigateur (localStorage) à chaque changement,
  // puis relus à l'ouverture. Rien n'est envoyé en ligne. Les cartes du catalogue citées par la
  // collection sont enregistrées avec elle (ligne brute du catalogue), pour s'afficher avant le
  // chargement du catalogue complet.
  // Les liens de démonstration (#novice, ?demo=…) montrent la démo sans toucher à la collection.
  const SAVE_KEY = 'pkm-collection-v1';
  const SAVED_KEYS = ['purchases', 'sales', 'platforms', 'lotMethod', 'valuation', 'split', 'seq', 'adv', 'masked', 'answers', 'declared', 'alerts', 'buddy'];
  const DEVICE = { enabled: true, ok: null, timer: null };
  const storage = {
    read() { try { const t = window.localStorage.getItem(SAVE_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } },
    write(v) { try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const usedIds = s => {
    const ids = new Set();
    s.purchases.forEach(a => a.lines.forEach(l => ids.add(l.pid)));
    s.sales.forEach(v => ids.add(v.pid));
    return ids;
  };

  // Relit la collection enregistrée (avant le premier affichage). Retourne true si elle existe.
  proto.restoreSaved = function () {
    const saved = storage.read();
    if (!saved || saved.v !== 1 || !Array.isArray(saved.purchases) || !Array.isArray(saved.sales)) return false;
    TCG.saved = saved.cards && typeof saved.cards === 'object' ? saved.cards : {};
    const st = { extra: Object.keys(TCG.saved) };
    SAVED_KEYS.forEach(k => { if (saved[k] !== undefined && saved[k] !== null) st[k] = saved[k]; });
    this.state = Object.assign({}, this.state || {}, st);
    // Par prudence : on écarte ce qui vise un article inconnu (sinon le calcul de la collection échoue).
    const known = new Set(this.catalog().map(p => p.id));
    const purchases = st.purchases.map(a => Object.assign({}, a, { lines: (a.lines || []).filter(l => known.has(l.pid)) })).filter(a => a.lines.length);
    const sales = st.sales.filter(v => known.has(v.pid));
    this.state = Object.assign({}, this.state, { purchases: purchases, sales: sales });
    return true;
  };
  proto.saveNow = function () {
    if (!DEVICE.enabled) return;
    const s = this.st(), ids = usedIds(s), cards = {};
    // Cartes du catalogue citées : leur ligne brute seulement (pas les images dessinées), pour rester léger.
    (s.extra || []).forEach(id => { if (ids.has(id)) { const raw = TCG.raw(id); if (raw) cards[id] = raw; } });
    const out = { v: 1, savedAt: new Date().toISOString(), cards: cards };
    SAVED_KEYS.forEach(k => { out[k] = s[k]; });
    DEVICE.ok = storage.write(out);
  };
  proto.scheduleSave = function () {
    if (!DEVICE.enabled) return;
    clearTimeout(DEVICE.timer);
    DEVICE.timer = setTimeout(() => this.saveNow(), 300);
  };
  proto.resetCollection = function (mode) {
    const ask = mode === 'empty'
      ? 'Vider ta collection ? Tes achats et tes ventes enregistrés sur cet appareil seront supprimés.'
      : 'Remettre la collection de démo ? Tes achats et tes ventes enregistrés sur cet appareil seront remplacés.';
    try { if (!window.confirm(ask)) return; } catch (e) { /* pas de boîte de dialogue : on continue */ }
    this.setState(mode === 'empty'
      ? { purchases: [], sales: [], extra: [], toast: 'Collection vidée : ajoute tes cartes depuis le Marché ou le scan' }
      : { purchases: this.purchasesSeed('full'), sales: this.salesSeed('full'), extra: [], toast: 'Collection de démo remise' });
    this.flash();
  };

  const baseDevSettings = proto.vSettings;
  proto.vSettings = function (x) {
    const r = baseDevSettings.call(this, x), n = x.nCards + x.nSealed;
    r.dev = {
      text: !DEVICE.enabled ? 'Lien de démonstration : cette collection n’est pas enregistrée sur l’appareil.'
        : DEVICE.ok === false ? 'Impossible d’enregistrer sur cet appareil (navigation privée ?) : la collection repart de zéro à chaque ouverture.'
          : 'Enregistrée automatiquement sur cet appareil · ' + n + (n > 1 ? ' articles' : ' article') + '. Rien n’est envoyé en ligne.',
      clear: () => this.resetCollection('empty'), demo: () => this.resetCollection('demo')
    };
    return r;
  };
  const baseColl = proto.vCollection;
  proto.vCollection = function (x) {
    const r = baseColl.call(this, x);
    r.emptyText = x.owned.length === 0 ? 'Ta collection est vide. Ajoute des cartes depuis le Marché (« Toutes les cartes ») ou le scan.' : 'Rien ne correspond à ta recherche.';
    return r;
  };
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
    // Horaires OpenStreetMap (opening_hours), cas courants : « Mo-Sa 10:00-19:00 », plusieurs plages
    // (« 09:00-12:00,14:00-18:00 »), plusieurs règles séparées par « ; », jours fermés (« Su off »), « 24/7 ».
    // Les jours fériés (PH) sont ignorés. Tout le reste (mois, semaines, lever du soleil, commentaires…) : null,
    // l'app affiche alors le texte brut. Semaine : lundi = 0 ; plages en minutes depuis minuit.
    const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const DAY_FR = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
    function dayList(spec) {
      const out = [];
      for (const part of spec.split(',')) {
        const [a, b] = part.split('-').map(d => DAYS.indexOf(d));
        if (a < 0 || (b !== undefined && b < 0)) return null;
        for (let i = a; ; i = (i + 1) % 7) { out.push(i); if (b === undefined || i === b) break; }
      }
      return out;
    }
    function parseHours(text) {
      const t = String(text || '').trim();
      if (!t) return null;
      if (t === '24/7') return { always: true };
      const week = [[], [], [], [], [], [], []];
      for (const rule of t.split(';').map(r => r.trim()).filter(Boolean)) {
        if (/^PH\b/.test(rule)) continue;
        const m = rule.match(/^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:[-,](?:Mo|Tu|We|Th|Fr|Sa|Su))*)?\s*(.*)$/);
        const days = m && m[1] ? dayList(m[1]) : m ? [0, 1, 2, 3, 4, 5, 6] : null;
        if (!days) return null;
        const spec = m[2].trim();
        let ranges = [];
        if (!/^(off|closed)$/i.test(spec)) {
          for (const part of spec.split(',')) {
            const r = part.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
            if (!r || +r[1] > 24 || +r[3] > 48 || +r[2] > 59 || +r[4] > 59) return null;
            const from = +r[1] * 60 + +r[2];
            let to = +r[3] * 60 + +r[4];
            if (to <= from) to += 1440; // jusqu'au lendemain
            ranges.push([from, to]);
          }
        }
        days.forEach(d => { week[d] = ranges; });
      }
      return { week: week };
    }
    const hm = m => { m %= 1440; const h = Math.floor(m / 60), n = m % 60; return h + ' h' + (n ? ' ' + String(n).padStart(2, '0') : ''); };
    // Ouvert ou fermé à une date (Date locale) : { open, label } ; null si les horaires sont inconnus.
    function openState(hours, date) {
      if (!hours) return null;
      if (hours.always) return { open: true, label: 'Ouvert 24 h/24' };
      const d = (date.getDay() + 6) % 7, now = date.getHours() * 60 + date.getMinutes();
      const prev = hours.week[(d + 6) % 7].find(r => r[1] > 1440 && now < r[1] - 1440);
      if (prev) return { open: true, label: 'Ouvert · ferme à ' + hm(prev[1]) };
      const cur = hours.week[d].find(r => now >= r[0] && now < r[1]);
      if (cur) return { open: true, label: 'Ouvert · ferme à ' + hm(cur[1]) };
      const later = hours.week[d].filter(r => r[0] > now).sort((a, b) => a[0] - b[0])[0];
      if (later) return { open: false, label: 'Fermé · ouvre à ' + hm(later[0]) };
      for (let k = 1; k <= 7; k++) {
        const next = hours.week[(d + k) % 7].slice().sort((a, b) => a[0] - b[0])[0];
        if (next) return { open: false, label: 'Fermé · ouvre ' + (k === 1 ? 'demain' : DAY_FR[(d + k) % 7]) + ' à ' + hm(next[0]) };
      }
      return { open: false, label: 'Fermé' };
    }
    // Horaires lisibles en français : « lun.–sam. 10:00–19:00 · dim. fermé ».
    function hoursText(text) {
      return String(text || '').trim()
        .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g, d => DAY_FR[DAYS.indexOf(d)])
        .replace(/\bPH\b/g, 'fériés').replace(/\b(off|closed)\b/gi, 'fermé').replace(/24\/7/, '24 h/24, 7 j/7')
        .replace(/(\d)-(\d)/g, '$1–$2').replace(/\.-/g, '.–').replace(/\s*;\s*/g, ' · ').replace(/,(?=\d)/g, ', ');
    }
    // Repères d'une mini-carte (Territoire, accueil) : nord en haut, distance à l'échelle racine carrée (R au bord du
    // rayon km) ; les meilleures chances d'abord, puis les plus proches ; un repère qui en chevaucherait un autre
    // (boîte w × h) est omis ; max repères au plus. rows : [{ d, deg, c: { pct } }] ; ajoute px, py.
    function pinLayout(rows, km, R, w, h, max) {
      const placed = [];
      return rows.slice().sort((a, b) => b.c.pct - a.c.pct || a.d - b.d).map(x => {
        const a = x.deg * Math.PI / 180, rr = R * Math.sqrt(Math.min(x.d, km) / km);
        return Object.assign({ px: Math.sin(a) * rr, py: -Math.cos(a) * rr }, x);
      }).filter(x => {
        if (placed.some(q => Math.abs(q[0] - x.px) < w && Math.abs(q[1] - x.py) < h)) return false;
        placed.push([x.px, x.py]);
        return true;
      }).slice(0, max);
    }
    return { KINDS: KINDS, PRODUCTS: PRODUCTS, chance: chance, releaseContext: releaseContext, distanceKm: distanceKm, bearing: bearing,
      sweepPlan: sweepPlan, circle: circle, circleBounds: circleBounds, rank: rank, parseHours: parseHours, openState: openState, hoursText: hoursText,
      pinLayout: pinLayout };
  })();
  // ——— Radar : carte de France des boutiques réelles ———
  // Écran plein écran ouvert depuis Territoire (lien direct #radar). Données : web/data/stores.json
  // (OpenStreetMap, chaque semaine) et web/data/geo/ (régions et départements, IGN Admin Express).
  // Fond de carte MapLibre GL + OpenFreeMap (style sombre), chargés seulement à l'ouverture ; sans WebGL,
  // ou au choix, une liste offre les mêmes fonctions.
  // - Secteurs : France › région › département, avec zoom animé et nombre de boutiques par secteur.
  // - « Balayer » : un faisceau radar révèle les boutiques une à une, puis les résultats triés par indice.
  // - « Autour de moi » : position du téléphone, rayon 3, 5 ou 10 km.
  // - Fiche boutique : indice de chance expliqué (« Pourquoi ? »), itinéraire, alerte sur l'appareil.
  // Une vraie boutique n'est jamais présentée comme partenaire Dropicards ni comme ayant annoncé un arrivage.
  const RADAR = { status: 'idle', ready: null, meta: null, stores: [], byId: {}, regions: null, depts: null, region: {}, dept: {},
    nRegion: {}, nDept: {}, map: null, el: null, ml: null, loaded: false, gen: 0, sweepGen: 0, view: '', sel: '', markers: [],
    me: null, gl: null, cache: { key: '', rows: [] } };
  const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark';
  const ML_URL = 'vendor/maplibre/maplibre-gl.mjs', ML_CSS = 'vendor/maplibre/maplibre-gl.css';
  const FRANCE_BOX = [-5.2, 41.3, 9.6, 51.1];
  const TURN = 2600; // durée d'un tour de faisceau (ms)
  const LEVEL_COLOR = ['#9AA8C3', '#F5B14C', '#3DDC84'];
  // Noms courts des régions pour le fil « France › région › département ».
  const REGION_SHORT = { 84: 'Auvergne-Rhône-A.', 27: 'Bourgogne-F.-C.', 93: 'PACA', 75: 'Nouvelle-Aquitaine', 24: 'Centre-Val de L.', 32: 'Hauts-de-France', 52: 'Pays de la Loire' };
  const ATTRIBUTION = '© OpenStreetMap · OpenMapTiles · OpenFreeMap · IGN';
  try { if (/[?&]debug\b/.test(location.search)) window.__pkmRadar = RADAR; } catch (e) { /* adresse sans paramètres */ }
  const reducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const fmt = n => Number(n).toLocaleString('fr-FR');
  const lvlOf = pct => (pct >= 70 ? 2 : pct >= 40 ? 1 : 0);

  // Date du jour (réelle) ; ?today=AAAA-MM-JJ pour les tests.
  RADAR.today = realToday;
  // Calendrier des sorties : extensions françaises (dates des produits scellés, sinon repères connus).
  RADAR.releases = function () {
    const list = [{ name: 'Nuit Noire', date: '2026-07-17' }, { name: '30ᵉ Anniversaire', date: '2026-09-16' }, { name: 'Règne Delta', date: '2026-11-06' }];
    if (SEALED.status === 'ready') {
      SEALED.list().forEach(p => { if (p.released && (p.code === 'ETB' || p.code === 'DSP') && p.setName) list.push({ name: p.setName, date: p.released }); });
    }
    return list;
  };

  RADAR.load = function () {
    if (RADAR.ready) return RADAR.ready;
    RADAR.status = 'loading';
    const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' : ' + r.status); return r.json(); });
    RADAR.ready = Promise.all([get('data/stores.json'), get('data/geo/regions.json'), get('data/geo/departements.json')]).then(([st, rg, dp]) => {
      const f = {};
      st.fields.forEach((k, i) => { f[k] = i; });
      RADAR.meta = { generated: st.generated, count: st.count };
      rg.features.forEach(ft => { RADAR.region[ft.properties.code] = ft.properties; });
      dp.features.forEach(ft => { RADAR.dept[ft.properties.code] = ft.properties; });
      RADAR.regions = rg; RADAR.depts = dp;
      RADAR.stores = st.stores.map(r => {
        const d = RADAR.dept[r[f.dept]] || {};
        return { id: r[f.id], name: r[f.nom], kind: r[f.type], lat: r[f.lat], lon: r[f.lon], dept: r[f.dept], region: d.region || '', city: r[f.ville] || '', brand: r[f.enseigne] || '', tcg: r[f.cartes] || 0,
          // Coordonnées (absentes des fichiers plus anciens) : site, téléphone, horaires OSM, adresse.
          site: r[f.site] || '', tel: r[f.tel] || '', hours: r[f.horaires] || '', address: r[f.adresse] || '' };
      });
      RADAR.stores.forEach(x => {
        RADAR.byId[x.id] = x;
        RADAR.nDept[x.dept] = (RADAR.nDept[x.dept] || 0) + 1;
        RADAR.nRegion[x.region] = (RADAR.nRegion[x.region] || 0) + 1;
      });
      RADAR.status = 'ready';
    }).catch(() => { RADAR.status = 'error'; RADAR.ready = null; });
    return RADAR.ready;
  };
  // Boutiques du secteur affiché (région, département ou rayon autour de moi), avec leur indice.
  RADAR.rows = function (s) {
    if (RADAR.status !== 'ready') return [];
    const km = Number(s.rkm) || 5, at = s.raround;
    const key = [s.rlevel, s.rregion, s.rdept, at ? at.lat + ',' + at.lon : '', km, s.tprod, RADAR.today(), SEALED.status].join('|');
    if (RADAR.cache.key === key) return RADAR.cache.rows;
    const ctx = Object.assign({ prod: s.tprod, today: RADAR.today() }, RadarCore.releaseContext(RADAR.releases(), RADAR.today()));
    let list = [];
    if (s.rlevel === 'around' && at) list = RADAR.stores.filter(x => Math.abs(x.lat - at.lat) < km / 100 && RadarCore.distanceKm(at, x) <= km);
    else if (s.rlevel === 'dept') list = RADAR.stores.filter(x => x.dept === s.rdept);
    else if (s.rlevel === 'region') list = RADAR.stores.filter(x => x.region === s.rregion);
    const rows = RadarCore.rank(list.map(x => {
      const c = RadarCore.chance(x, ctx);
      return { st: x, name: x.name, pct: c.pct, c: c, lvl: lvlOf(c.pct), dist: at ? RadarCore.distanceKm(at, x) : null };
    }));
    RADAR.cache = { key: key, rows: rows };
    return rows;
  };
  const centerOf = s => {
    if (s.rlevel === 'around' && s.raround) return s.raround;
    const p = s.rlevel === 'dept' ? RADAR.dept[s.rdept] : RADAR.region[s.rregion];
    return p ? { lon: p.label[0], lat: p.label[1] } : { lon: 2.6, lat: 46.6 };
  };
  const boxOf = s => {
    if (s.rlevel === 'around' && s.raround) return RadarCore.circleBounds(s.raround, Number(s.rkm) || 5);
    if (s.rlevel === 'dept' && RADAR.dept[s.rdept]) return RADAR.dept[s.rdept].bbox;
    if (s.rlevel === 'region' && RADAR.region[s.rregion]) return RADAR.region[s.rregion].bbox;
    return FRANCE_BOX;
  };

  // ——— Carte (MapLibre), gérée hors de Vue : un conteneur vide que Vue ne touche pas ———
  function webgl() {
    if (RADAR.gl !== null) return RADAR.gl;
    try { const c = document.createElement('canvas'); RADAR.gl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { RADAR.gl = false; }
    return RADAR.gl;
  }
  function addCss() {
    if (document.getElementById('pkm-radar-css')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = ML_CSS;
    document.head.appendChild(link);
    const st = document.createElement('style');
    st.id = 'pkm-radar-css';
    st.textContent = '.pkm-rbadge{min-width:44px;height:30px;padding:0 10px;border-radius:15px;border:1.5px solid rgba(168,182,255,.75);background:rgba(11,17,32,.9);color:#F3F6FC;font:700 12.5px/1 "Plus Jakarta Sans",system-ui,sans-serif;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,.55);cursor:pointer;transition:transform .15s}'
      + '.pkm-rbadge:hover{transform:scale(1.08);border-color:#A8B6FF;background:rgba(38,52,90,.96)}'
      + '.pkm-rbadge b{color:#5EE0CF;font-weight:800;margin-right:5px}'
      + '.pkm-rbadge.sm{min-width:40px;height:26px;padding:0 8px;border-radius:13px;font-size:11.5px}'
      + '.pkm-scanned .pkm-rbadge{opacity:.5}.pkm-scanned .pkm-rbadge:hover{opacity:1}'
      + '.pkm-sweep{position:absolute;left:0;top:0;pointer-events:none;border-radius:50%;z-index:2;transition:opacity .45s}'
      + '.pkm-sweep i{position:absolute;border-radius:50%;border:1px solid rgba(94,224,207,.42);box-sizing:border-box}'
      + '.pkm-sweep .beam{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(94,224,207,0) 0deg,rgba(94,224,207,0) 280deg,rgba(94,224,207,.32) 356deg,rgba(150,255,235,.75) 360deg)}'
      + '.pkm-sweep .ping{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px;border-radius:50%;background:rgba(94,224,207,.6);animation:pkmPing 1.3s ease-out infinite}'
      + '.pkm-sweep .count{position:absolute;left:50%;top:50%;transform:translate(-50%,14px);padding:3px 9px;border-radius:999px;background:rgba(8,13,26,.85);color:#5EE0CF;font:700 12px "Plus Jakarta Sans",sans-serif;white-space:nowrap}'
      + '.pkm-me{width:16px;height:16px;border-radius:50%;background:#3D63FF;border:3px solid #fff;box-shadow:0 0 0 7px rgba(61,99,255,.28)}'
      + '.maplibregl-ctrl-attrib{display:none}';
    document.head.appendChild(st);
  }
  // Style du fond : OpenFreeMap sombre ; s'il ne répond pas, un fond uni (les contours restent).
  function baseStyle() {
    if (RADAR.style) return Promise.resolve(RADAR.style);
    const plain = { version: 8, sources: {}, layers: [{ id: 'fond', type: 'background', paint: { 'background-color': '#0B1120' } }] };
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 5000);
    return fetch(STYLE_URL, ctl ? { signal: ctl.signal } : {}).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(st => { clearTimeout(timer); RADAR.style = st; RADAR.tiles = true; return st; })
      .catch(() => { clearTimeout(timer); RADAR.style = plain; RADAR.tiles = false; return plain; });
  }
  const pad = () => {
    const h = RADAR.el ? RADAR.el.clientHeight : 800;
    return { top: 128, bottom: Math.round(h * 0.42) + 12, left: 18, right: 18 };
  };
  function fit(box, instant) {
    const map = RADAR.map;
    if (!map) return;
    map.fitBounds([[box[0], box[1]], [box[2], box[3]]], { padding: pad(), duration: instant || reducedMotion() ? 0 : 1200, essential: true, maxZoom: 14.5 });
  }

  RADAR.mount = function (inst, el) {
    const gen = ++RADAR.gen;
    RADAR.el = el; RADAR.loaded = false; RADAR.view = ''; RADAR.sel = '';
    if (!webgl()) { inst.setState({ rmap: 'off' }); return; }
    addCss();
    Promise.all([RADAR.load(), RADAR.ml ? Promise.resolve(RADAR.ml) : import(new URL(ML_URL, document.baseURI).href), baseStyle()]).then(([, ml, style]) => {
      if (gen !== RADAR.gen || RADAR.status !== 'ready') return;
      RADAR.ml = ml.default || ml;
      const map = new RADAR.ml.Map({
        container: el, style: style, bounds: [[FRANCE_BOX[0], FRANCE_BOX[1]], [FRANCE_BOX[2], FRANCE_BOX[3]]], fitBoundsOptions: { padding: pad() },
        attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, renderWorldCopies: false,
        // Limites larges : sur un écran haut, des limites serrées imposeraient un zoom minimal trop fort.
        minZoom: 3.4, maxZoom: 17, maxBounds: [[-30, 25], [40, 65]], fadeDuration: 0
      });
      map.touchZoomRotate.disableRotation();
      RADAR.map = map;
      map.on('error', () => { /* tuile manquante : la carte continue */ });
      map.on('load', () => {
        if (gen !== RADAR.gen) return;
        addLayers(map);
        RADAR.loaded = true;
        inst.setState({ rmap: 'on' });
        RADAR.update(inst);
      });
      map.on('click', e => onClick(inst, e));
      map.on('move', placeSweep);
    }).catch(e => {
      if (window.console) console.warn('Radar : carte indisponible, liste seule.', e);
      if (gen === RADAR.gen) inst.setState({ rmap: 'off' });
    });
  };
  RADAR.unmount = function () {
    RADAR.gen++; RADAR.sweepGen++;
    clearMarkers();
    if (RADAR.me) { RADAR.me.remove(); RADAR.me = null; }
    if (RADAR.map) { try { RADAR.map.remove(); } catch (e) { /* déjà retirée */ } }
    RADAR.map = null; RADAR.el = null; RADAR.loaded = false; RADAR.view = ''; RADAR.sweep = null;
  };
  // Après chaque affichage : crée ou retire la carte selon l'écran, puis applique l'état.
  RADAR.sync = function (inst) {
    const s = inst.st(), on = s.screen === 'radar' && !s.rlist, el = document.getElementById('pkm-radar-map');
    if (s.screen === 'radar') {
      // Le fil montre toujours le secteur courant ; la fiche repart du haut quand son contenu change.
      const nav = document.querySelector('nav[aria-label="Secteur"]');
      if (nav) nav.scrollLeft = nav.scrollWidth;
      const key = [s.rlevel, s.rregion, s.rdept, s.rstore, s.rscan === 'done', s.rlist].join('|'), sheet = document.getElementById('pkm-radar-sheet');
      if (sheet && key !== RADAR.sheetKey) { RADAR.sheetKey = key; sheet.scrollTop = 0; }
    }
    if (on && el && RADAR.el !== el) { RADAR.unmount(); RADAR.mount(inst, el); return; }
    if (!on && RADAR.el) { RADAR.unmount(); return; }
    if (on && RADAR.loaded) RADAR.update(inst);
  };

  function addLayers(map) {
    map.addSource('regions', { type: 'geojson', data: RADAR.regions, promoteId: 'code' });
    map.addSource('depts', { type: 'geojson', data: RADAR.depts, promoteId: 'code' });
    map.addSource('stores', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'id' });
    map.addSource('around', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    const dim = ['boolean', ['feature-state', 'dim'], false], sel = ['boolean', ['feature-state', 'sel'], false];
    map.addLayer({ id: 'regions-fill', type: 'fill', source: 'regions', paint: {
      'fill-color': ['case', dim, '#05080F', '#3D63FF'], 'fill-opacity': ['case', dim, 0.62, sel, 0, 0.1] } });
    map.addLayer({ id: 'depts-fill', type: 'fill', source: 'depts', filter: ['==', ['get', 'region'], ''], paint: {
      'fill-color': ['case', dim, '#05080F', '#3D63FF'], 'fill-opacity': ['case', dim, 0.5, sel, 0, 0.08] } });
    map.addLayer({ id: 'depts-line', type: 'line', source: 'depts', filter: ['==', ['get', 'region'], ''], paint: {
      'line-color': ['case', sel, '#A8B6FF', 'rgba(168, 182, 255, 0.45)'], 'line-width': ['case', sel, 2.4, 1] } });
    map.addLayer({ id: 'regions-line', type: 'line', source: 'regions', paint: {
      'line-color': ['case', sel, '#A8B6FF', 'rgba(168, 182, 255, 0.6)'], 'line-width': ['case', sel, 2.6, 1.2] } });
    map.addLayer({ id: 'around-fill', type: 'fill', source: 'around', paint: { 'fill-color': '#5EE0CF', 'fill-opacity': 0.06 } });
    map.addLayer({ id: 'around-line', type: 'line', source: 'around', paint: { 'line-color': '#5EE0CF', 'line-width': 1.6, 'line-dasharray': [2, 2], 'line-opacity': 0.8 } });
    const on = ['boolean', ['feature-state', 'on'], false], pick = ['boolean', ['feature-state', 'sel'], false];
    const col = ['match', ['get', 'lvl'], 2, LEVEL_COLOR[2], 1, LEVEL_COLOR[1], LEVEL_COLOR[0]];
    map.addLayer({ id: 'stores-halo', type: 'circle', source: 'stores', paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 6, 12, 14], 'circle-color': col,
      'circle-opacity': ['case', pick, 0.45, on, 0.18, 0] } });
    // Taille selon le zoom : MapLibre n'accepte le zoom qu'en tête d'expression (sinon la couche est refusée et les
    // points n'apparaissent pas) ; l'état (choisie, révélée, niveau) se décide à chaque palier de zoom.
    const radius = k => ['case', pick, 9, ['!', on], k(2.4, 6), ['match', ['get', 'lvl'], 2, k(4.6, 9), 1, k(3.8, 8), k(2.6, 6.5)]];
    map.addLayer({ id: 'stores-dot', type: 'circle', source: 'stores', paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, radius(a => a), 10, radius(a => a * 1.7), 14, radius((a, b) => b)],
      'circle-color': ['case', on, col, '#5A6B8C'], 'circle-opacity': ['case', on, ['match', ['get', 'lvl'], 0, 0.75, 1], 0.5],
      'circle-stroke-color': ['case', pick, '#FFFFFF', '#0B1120'], 'circle-stroke-width': ['case', pick, 2.5, 1.2] } });
  }
  function onClick(inst, e) {
    const s = inst.st(), map = RADAR.map;
    if (!map) return;
    const box = [[e.point.x - 8, e.point.y - 8], [e.point.x + 8, e.point.y + 8]];
    const st = map.queryRenderedFeatures(box, { layers: ['stores-dot'] })[0];
    // Pendant le balayage, une boutique déjà apparue s'ouvre tout de suite (le balayage se termine).
    if (st && (s.rscan !== 'scanning' || (map.getFeatureState({ source: 'stores', id: st.properties.id }) || {}).on)) { inst.radarStore(st.properties.id); return; }
    if (s.rscan === 'scanning') return;
    if (s.rlevel === 'region' || s.rlevel === 'dept') {
      const d = map.queryRenderedFeatures(e.point, { layers: ['depts-fill'] })[0];
      if (d && d.properties.code !== s.rdept) { inst.radarGo('dept', d.properties.code); return; }
    }
    const r = map.queryRenderedFeatures(e.point, { layers: ['regions-fill'] })[0];
    if (r && (s.rlevel === 'france' || r.properties.code !== s.rregion)) inst.radarGo('region', r.properties.code);
  }
  function clearMarkers() { RADAR.markers.forEach(m => m.remove()); RADAR.markers = []; }
  // Pastilles des secteurs : nombre de boutiques ; un toucher zoome sur le secteur.
  function badges(inst, s) {
    clearMarkers();
    const map = RADAR.map, list = s.rlevel === 'france' ? RADAR.regions.features : s.rlevel === 'region' ? RADAR.depts.features.filter(f => f.properties.region === s.rregion) : [];
    list.forEach(f => {
      const p = f.properties, dept = s.rlevel === 'region', n = (dept ? RADAR.nDept[p.code] : RADAR.nRegion[p.code]) || 0;
      const b = document.createElement('button');
      b.type = 'button'; b.className = dept ? 'pkm-rbadge sm' : 'pkm-rbadge'; b.tabIndex = -1;
      b.setAttribute('aria-hidden', 'true');
      if (dept) { const code = document.createElement('b'); code.textContent = p.code; b.appendChild(code); }
      b.appendChild(document.createTextNode(fmt(n)));
      b.title = p.nom + ' : ' + fmt(n) + ' boutiques';
      b.addEventListener('click', ev => { ev.stopPropagation(); if (inst.st().rscan !== 'scanning') inst.radarGo(dept ? 'dept' : 'region', p.code); });
      RADAR.markers.push(new RADAR.ml.Marker({ element: b, anchor: 'center', offset: p.offset || [0, 0] }).setLngLat(p.label).addTo(map));
    });
  }
  function setStates(source, ids, key, on) { ids.forEach(id => RADAR.map.setFeatureState({ source: source, id: id }, { [key]: on })); }

  // Applique l'état de l'écran à la carte : secteur, boutiques, pastilles, cadrage, boutique choisie.
  RADAR.update = function (inst) {
    const map = RADAR.map, s = inst.st();
    if (!map || !RADAR.loaded) return;
    const at = s.raround, view = [s.rlevel, s.rregion, s.rdept, at ? at.lat + ',' + at.lon : '', s.rkm].join('|');
    const rows = RADAR.rows(s), dataKey = view + '|' + s.tprod;
    if (view !== RADAR.view) {
      const first = RADAR.view === '';
      RADAR.view = view; RADAR.sweepGen++; removeSweep();
      map.removeFeatureState({ source: 'regions' });
      map.removeFeatureState({ source: 'depts' });
      if (s.rlevel === 'region' || s.rlevel === 'dept') {
        setStates('regions', Object.keys(RADAR.region).filter(c => c !== s.rregion), 'dim', true);
        setStates('regions', [s.rregion], 'sel', true);
      }
      if (s.rlevel === 'dept') {
        setStates('depts', RADAR.depts.features.map(f => f.properties.code).filter(c => c !== s.rdept), 'dim', true);
        setStates('depts', [s.rdept], 'sel', true);
      }
      const reg = s.rlevel === 'region' || s.rlevel === 'dept' ? s.rregion : '';
      map.setFilter('depts-fill', ['==', ['get', 'region'], reg]);
      map.setFilter('depts-line', ['==', ['get', 'region'], reg]);
      map.getSource('around').setData(s.rlevel === 'around' && at ? { type: 'Feature', properties: {}, geometry: RadarCore.circle(at, Number(s.rkm) || 5) } : { type: 'FeatureCollection', features: [] });
      if (RADAR.me) { RADAR.me.remove(); RADAR.me = null; }
      if (s.rlevel === 'around' && at) {
        const dot = document.createElement('div');
        dot.className = 'pkm-me';
        RADAR.me = new RADAR.ml.Marker({ element: dot }).setLngLat([at.lon, at.lat]).addTo(map);
      }
      badges(inst, s);
      fit(boxOf(s), first && s.rlevel === 'france');
      RADAR.dataKey = '';
    }
    if (dataKey !== RADAR.dataKey) {
      RADAR.dataKey = dataKey;
      map.getSource('stores').setData({ type: 'FeatureCollection', features: rows.map(r => ({
        type: 'Feature', properties: { id: r.st.id, lvl: r.lvl }, geometry: { type: 'Point', coordinates: [r.st.lon, r.st.lat] } })) });
      map.removeFeatureState({ source: 'stores' });
      RADAR.sel = '';
      if (s.rscan === 'done') setStates('stores', rows.map(r => r.st.id), 'on', true);
    }
    if (RADAR.el) RADAR.el.classList.toggle('pkm-scanned', s.rscan === 'scanning' || s.rscan === 'done');
    if (s.rstore !== RADAR.sel) {
      if (RADAR.sel && RADAR.byId[RADAR.sel]) map.setFeatureState({ source: 'stores', id: RADAR.sel }, { sel: false });
      RADAR.sel = s.rstore || '';
      const st = RADAR.byId[RADAR.sel];
      if (st && rows.some(r => r.st.id === st.id)) {
        map.setFeatureState({ source: 'stores', id: st.id }, { sel: true, on: true });
        // Décalage plutôt que « padding » (qui resterait appliqué aux cadrages suivants).
        const p = pad();
        map.easeTo({ center: [st.lon, st.lat], zoom: Math.max(map.getZoom(), 13), offset: [0, Math.round((p.top - p.bottom) / 2)], duration: reducedMotion() ? 0 : 900 });
      }
    }
  };

  // ——— Balayage radar ———
  function removeSweep() {
    if (RADAR.sweep && RADAR.sweep.el) RADAR.sweep.el.remove();
    RADAR.sweep = null;
  }
  function placeSweep() {
    const sw = RADAR.sweep, map = RADAR.map;
    if (!sw || !map) return;
    const c = map.project([sw.center.lon, sw.center.lat]), e = map.project([sw.edge.lon, sw.edge.lat]);
    const r = Math.max(60, Math.min(900, Math.hypot(e.x - c.x, e.y - c.y)));
    Object.assign(sw.el.style, { width: 2 * r + 'px', height: 2 * r + 'px', transform: 'translate(' + (c.x - r) + 'px, ' + (c.y - r) + 'px)' });
  }
  RADAR.sweepStart = function (inst) {
    const map = RADAR.map, s = inst.st(), rows = RADAR.rows(s);
    if (!map || !RADAR.loaded) { inst.setState({ rscan: 'done', rstore: '' }); return; }
    const gen = ++RADAR.sweepGen, center = centerOf(s), box = boxOf(s);
    removeSweep();
    map.removeFeatureState({ source: 'stores' });
    RADAR.sel = '';
    // Rayon du faisceau : jusqu'au coin le plus éloigné du secteur.
    const corners = [[box[0], box[1]], [box[0], box[3]], [box[2], box[1]], [box[2], box[3]]].map(([lon, lat]) => ({ lon: lon, lat: lat }));
    const edge = corners.reduce((a, b) => (RadarCore.distanceKm(center, b) > RadarCore.distanceKm(center, a) ? b : a));
    const el = document.createElement('div');
    el.className = 'pkm-sweep';
    el.innerHTML = '<i style="inset:0"></i><i style="inset:16.5%"></i><i style="inset:33%"></i><div class="beam"></div><div class="ping"></div><div class="count"></div>';
    RADAR.el.appendChild(el);
    RADAR.sweep = { el: el, center: center, edge: edge };
    placeSweep();
    const beam = el.querySelector('.beam'), count = el.querySelector('.count');
    const plan = RadarCore.sweepPlan(rows.map(r => r.st), center, TURN);
    const finish = () => {
      if (gen !== RADAR.sweepGen) return;
      RADAR.sweepGen++; // arrête le faisceau s'il tourne encore
      setStates('stores', rows.map(r => r.st.id), 'on', true);
      el.style.opacity = '0';
      setTimeout(() => { if (RADAR.sweep && RADAR.sweep.el === el) removeSweep(); }, 500);
      inst.setState({ rscan: 'done' });
    };
    RADAR.finish = finish;
    inst.setState({ rscan: 'scanning', rstore: '', rwhy: false });
    if (reducedMotion() || !plan.length) { count.textContent = fmt(plan.length) + ' boutiques'; finish(); return; }
    const t0 = performance.now();
    let i = 0;
    const frame = now => {
      if (gen !== RADAR.sweepGen || !RADAR.map) return;
      const t = now - t0;
      beam.style.transform = 'rotate(' + Math.min(360, 360 * t / TURN).toFixed(1) + 'deg)';
      while (i < plan.length && plan[i].at <= t) { map.setFeatureState({ source: 'stores', id: plan[i].id }, { on: true }); i++; }
      count.textContent = fmt(i) + (i > 1 ? ' boutiques' : ' boutique');
      if (t < TURN) requestAnimationFrame(frame); else finish();
    };
    requestAnimationFrame(frame);
  };

  // ——— Logique de l'écran ———
  const radarProto = proto;
  radarProto.openRadar = function () {
    this.push('radar', { rlevel: 'france', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: null, rmsg: '' });
  };
  radarProto.radarGo = function (level, code) {
    const s = this.st();
    if (s.rscan === 'scanning') return;
    const base = { rscan: '', rstore: '', rwhy: false, rmsg: '' };
    if (level === 'france') this.setState(Object.assign(base, { rlevel: 'france', rregion: '', rdept: '' }));
    else if (level === 'region') this.setState(Object.assign(base, { rlevel: 'region', rregion: code, rdept: '' }));
    else if (level === 'dept') this.setState(Object.assign(base, { rlevel: 'dept', rregion: (RADAR.dept[code] || {}).region || s.rregion, rdept: code }));
    else if (level === 'around') this.setState(Object.assign(base, { rlevel: 'around' }));
  };
  radarProto.radarScan = function () {
    const s = this.st();
    if (s.rscan === 'scanning' || s.rlevel === 'france') return;
    if (s.rlist || !RADAR.map) this.setState({ rscan: 'done', rstore: '', rwhy: false });
    else RADAR.sweepStart(this);
  };
  radarProto.radarAround = function () {
    const done = (lat, lon) => {
      this.setState({ rlevel: 'around', raround: { lat: Math.round(lat * 1e4) / 1e4, lon: Math.round(lon * 1e4) / 1e4 }, rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, rmsg: '' });
      setTimeout(() => this.radarScan(), reducedMotion() ? 0 : 1300);
    };
    if (!navigator.geolocation) { this.setState({ rmsg: 'Position indisponible sur cet appareil : choisis une région.' }); return; }
    this.setState({ rmsg: 'Recherche de ta position…' });
    navigator.geolocation.getCurrentPosition(p => done(p.coords.latitude, p.coords.longitude),
      () => this.setState({ rmsg: 'Position refusée ou introuvable : choisis une région sur la carte ou dans la liste.' }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  };
  // Fiche d'une boutique ; pendant le balayage, il se termine d'abord (toutes les boutiques apparaissent).
  radarProto.radarStore = function (id) {
    if (this.st().rscan === 'scanning' && RADAR.finish) RADAR.finish();
    this.setState({ rstore: id, rwhy: false });
  };
  radarProto.radarAlert = function (id) {
    const s = this.st(), key = 'osm:' + id, on = !s.alerts[key], st = RADAR.byId[id];
    this.setState({ alerts: Object.assign({}, s.alerts, { [key]: on }), toast: on ? 'Alerte enregistrée pour ' + (st ? st.name : 'cette boutique') : 'Alerte retirée' });
    this.flash();
  };

  const radarParent = radarProto.parentOf;
  radarProto.parentOf = function (sc) { return sc === 'radar' ? 'territory' : radarParent.call(this, sc); };
  const radarSt = radarProto.st;
  radarProto.st = function () {
    const d = radarSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'radar') d.screen = 'radar';
    const defs = { rlevel: 'france', rregion: '', rdept: '', rscan: '', rstore: '', rwhy: false, raround: null, rkm: '5', rlist: false, rmap: '', rmsg: '' };
    Object.keys(defs).forEach(k => { if (d[k] === undefined) d[k] = defs[k]; });
    return d;
  };

  const EMPTY_RADAR = { title: '', subtitle: '' };
  radarProto.vRadar = function (s) {
    const chip = (on, label, pick) => Object.assign({ label: label, on: on, pick: pick }, this.chip(on), { bg2: on ? 'var(--pkm-chip-on-bg)' : 'rgba(var(--pkm-ink-rgb), 0.82)' });
    const ready = RADAR.status === 'ready', listMode = !!s.rlist || s.rmap === 'off', scanning = s.rscan === 'scanning';
    const reg = RADAR.region[s.rregion], dep = RADAR.dept[s.rdept];
    const crumbs = [{ label: 'France', go: () => this.radarGo('france'), current: s.rlevel === 'france' }];
    if (s.rlevel === 'region' || s.rlevel === 'dept') crumbs.push({ label: reg ? (s.rlevel === 'dept' && REGION_SHORT[reg.code] ? REGION_SHORT[reg.code] : reg.court) : '…', go: () => this.radarGo('region', s.rregion), current: s.rlevel === 'region' });
    if (s.rlevel === 'dept') crumbs.push({ label: dep ? dep.nom : '…', go: () => null, current: true });
    if (s.rlevel === 'around') crumbs.push({ label: 'Autour de moi', go: () => null, current: true });
    const r = {
      close: () => this.pop(), loading: RADAR.status === 'loading' || RADAR.status === 'idle', error: RADAR.status === 'error',
      retry: () => { RADAR.status = 'idle'; RADAR.load().then(() => this.setState({ rdata: Date.now() })); },
      crumbs: crumbs.map((c, i) => ({ label: c.label, go: c.go, sep: i > 0, current: c.current ? 'location' : false, color: c.current ? 'var(--pkm-white)' : 'var(--pkm-link)', weight: c.current ? '700' : '600' })),
      canMap: s.rmap !== 'off', listMode: listMode, listLabel: listMode ? 'Carte' : 'Liste',
      toggleList: () => this.setState({ rlist: !s.rlist, rscan: s.rscan === 'scanning' ? '' : s.rscan }),
      prods: [['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['value', 'Objets de valeur']].map(([k, label]) => chip(s.tprod === k, label, () => this.setState({ tprod: k }))),
      sheetMax: listMode ? 'calc(100% - 118px)' : '42%', mapOn: !listMode, showLegend: !listMode && s.rscan === 'done',
      msg: s.rmsg || '', hasMsg: !!s.rmsg, scanning: scanning, attribution: ATTRIBUTION,
      around: () => this.radarAround(), aroundOn: s.rlevel === 'around',
      radii: [['3', '3 km'], ['5', '5 km'], ['10', '10 km']].map(([k, label]) => chip(String(s.rkm) === k, label, () => this.setState({ rkm: k, rscan: '', rstore: '' }))),
      hasRadii: s.rlevel === 'around',
      sectors: [], hasSectors: false, sectorsTitle: '', results: [], hasResults: false, resultsTitle: '',
      canScan: false, scan: () => this.radarScan(), scanLabel: '', hasStore: false, st: null, hint: '', title: '', subtitle: '', empty: false
    };
    if (!ready) {
      r.title = r.error ? 'Boutiques indisponibles' : 'Chargement des boutiques…';
      return Object.assign(r, { notStore: true, noScan: true, scanBg: 'var(--pkm-off-bg)', scanFg: 'var(--pkm-t4)', scanLabel: 'Balayer', hasHint: false });
    }
    const rows = RADAR.rows(s), n = s.rlevel === 'france' ? RADAR.stores.length : rows.length;
    const where = s.rlevel === 'france' ? 'France métropolitaine' : s.rlevel === 'region' ? (reg ? reg.nom : '') : s.rlevel === 'dept' ? (dep ? dep.nom + ' (' + dep.code + ')' : '') : 'Autour de toi · ' + s.rkm + ' km';
    r.title = where;
    r.subtitle = fmt(n) + (n > 1 ? ' boutiques réelles' : ' boutique réelle') + ' · OpenStreetMap' + (RADAR.meta && RADAR.meta.generated ? ' du ' + this.d2(RADAR.meta.generated) : '');
    r.canScan = s.rlevel !== 'france' && n > 0 && !scanning;
    r.scanLabel = scanning ? 'Balayage en cours…' : s.rscan === 'done' ? 'Balayer à nouveau' : s.rlevel === 'region' ? 'Balayer la région' : s.rlevel === 'dept' ? 'Balayer le département' : 'Balayer autour de moi';
    r.empty = s.rlevel !== 'france' && n === 0;
    if (s.rlevel === 'france' || s.rlevel === 'region') {
      const feats = s.rlevel === 'france' ? RADAR.regions.features : RADAR.depts.features.filter(f => f.properties.region === s.rregion);
      r.sectorsTitle = s.rlevel === 'france' ? 'Régions' : 'Départements';
      r.sectors = feats.map(f => f.properties).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')).map((p, i) => {
        const k = (s.rlevel === 'france' ? RADAR.nRegion[p.code] : RADAR.nDept[p.code]) || 0;
        return { name: (s.rlevel === 'region' ? p.code + ' · ' : '') + p.nom, count: fmt(k), border: i ? '1px solid var(--pkm-line)' : 'none',
          label: p.nom + ' : ' + fmt(k) + ' boutiques', open: () => this.radarGo(s.rlevel === 'france' ? 'region' : 'dept', p.code) };
      });
      r.hasSectors = r.sectors.length > 0 && !(s.rscan === 'done' && s.rlevel === 'region');
      r.hint = s.rlevel === 'france' ? 'Touche une région sur la carte ou dans la liste, ou cherche autour de toi.' : 'Choisis un département, ou balaie toute la région.';
    }
    if (s.rlevel === 'around' && !s.raround) r.hint = 'Autorise ta position pour chercher autour de toi.';
    if (s.rscan === 'done' && !s.rstore) {
      const top = rows.slice(0, 40);
      r.results = top.map((x, i) => {
        const lv = this.probLevel(x.pct), k = RadarCore.KINDS[x.st.kind] || RadarCore.KINDS.collec;
        return {
          name: x.st.name, kind: k.label + (x.st.brand && x.st.brand !== x.st.name ? ' · ' + x.st.brand : ''),
          place: [x.st.city, (RADAR.dept[x.st.dept] || {}).nom].filter(Boolean).join(' · ') + (x.dist !== null ? ' · ' + this.km(Math.round(x.dist * 10) / 10) : ''),
          pct: x.pct + ' %', color: lv.color, tint: lv.tint, level: lv.label, border: i ? '1px solid var(--pkm-line)' : 'none',
          label: x.st.name + ', indice ' + x.pct + ' %, ' + lv.label.toLowerCase(), open: () => this.radarStore(x.st.id)
        };
      });
      r.hasResults = r.results.length > 0;
      const strong = rows.filter(x => x.pct >= 70).length, mid = rows.filter(x => x.pct >= 40 && x.pct < 70).length;
      r.resultsTitle = fmt(rows.length) + (rows.length > 1 ? ' boutiques balayées' : ' boutique balayée') + ' · ' + strong + ' forte' + (strong > 1 ? 's' : '') + ', ' + mid + ' moyenne' + (mid > 1 ? 's' : '') + (rows.length > 40 ? ' · les 40 meilleures' : '');
    }
    if (s.rlevel === 'france') r.scanLabel = 'Choisis une région';
    r.noScan = !r.canScan;
    r.scanBg = r.canScan ? 'var(--pkm-accent)' : 'var(--pkm-off-bg)';
    r.scanFg = r.canScan ? 'var(--pkm-on-accent)' : 'var(--pkm-t4)';
    r.hasHint = !!r.hint && !r.hasResults;
    const sel = s.rstore ? rows.find(x => x.st.id === s.rstore) : null;
    if (sel) {
      // Même fiche que celle de Territoire (tools/web/territory.js), avec un retour à la liste.
      r.hasStore = true;
      r.st = Object.assign(this.shopInfo(sel.st, sel.c, sel.dist, { why: !!s.rwhy, toggleWhy: () => this.setState({ rwhy: !s.rwhy }) }),
        { back: () => this.setState({ rstore: '', rwhy: false }) });
    }
    r.notStore = !r.hasStore;
    return r;
  };

  const radarTerritory = radarProto.vTerritory;
  radarProto.vTerritory = function (x) {
    const r = radarTerritory.call(this, x);
    r.radar = () => this.openRadar();
    r.radarSub = (RADAR.status === 'ready' ? fmt(RADAR.stores.length) + ' boutiques réelles' : 'Boutiques réelles') + ' · balaie une zone pour estimer tes chances';
    return r;
  };

  const radarRender = radarProto.renderVals;
  radarProto.renderVals = function () {
    const r = radarRender.call(this), s = this.st(), on = s.screen === 'radar';
    r.ui.isRadar = on;
    if (on) {
      if (RADAR.status === 'idle') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      r.rd = this.vRadar(s);
      r.ui.toastBottom = r.rd.listMode ? '24px' : 'calc(42% + 14px)';
    } else r.rd = EMPTY_RADAR;
    setTimeout(() => RADAR.sync(this), 0);
    return r;
  };
  // ——— Territoire : vraies boutiques autour de toi ———
  // Boutiques réelles (OpenStreetMap, web/data/stores.json, comme le Radar) autour de la position de l'appareil :
  // distance, direction, ouverture (horaires OSM lus par RadarCore), indice de chance expliqué (RadarCore.chance).
  // - Position : sur le bouton « Me localiser », ou retrouvée seule si l'autorisation est déjà donnée. Arrondie
  //   à environ 100 m, gardée en mémoire : jamais enregistrée ni envoyée.
  // - Jamais de badge partenaire ni d'arrivage annoncé sur une vraie boutique : les magasins partenaires de la
  //   maquette restent dans un encadré replié « Démo ».
  // - Fiche d'une boutique (écran « shop ») : chance et « Pourquoi ? », horaires, adresse, itinéraire, site (sinon
  //   celui de l'enseigne), téléphone, alerte, OpenStreetMap. La fiche du Radar utilise le même code (shopInfo).
  const TER_RADII = ['3', '5', '10', '20'];
  const TER_PINS = 12, TER_LIST = 30;
  // Site de l'enseigne, quand la fiche OSM n'en donne pas.
  const BRAND_SITE = {
    'Fnac': 'https://www.fnac.com/', 'Cultura': 'https://www.cultura.com/', 'Espace Culturel E.Leclerc': 'https://www.e.leclerc/',
    'Micromania-Zing': 'https://www.micromania.fr/', 'JouéClub': 'https://www.joueclub.fr/', 'King Jouet': 'https://www.king-jouet.com/',
    'La Grande Récré': 'https://www.lagranderecre.fr/', 'Smyths Toys': 'https://www.smythstoys.com/fr/fr-fr/', 'E.Leclerc': 'https://www.e.leclerc/',
    'Carrefour': 'https://www.carrefour.fr/', 'Auchan': 'https://www.auchan.fr/'
  };
  const roundPos = v => Math.round(v * 1000) / 1000; // ≈ 100 m
  const TER_WAIT = 15000; // demande d'autorisation restée sans réponse
  proto.terLocate = function (silent) {
    if (!navigator.geolocation) { if (!silent) this.setState({ tmsg: 'Position indisponible sur cet appareil : parcours la carte de France.' }); return; }
    if (!silent) this.setState({ tmsg: 'Recherche de ta position…' });
    let done = false;
    const wait = silent ? null : setTimeout(() => { if (!done) this.setState({ tmsg: 'Pas de réponse : autorise la position dans ton navigateur, ou parcours la carte de France.' }); }, TER_WAIT);
    const end = () => { done = true; clearTimeout(wait); };
    navigator.geolocation.getCurrentPosition(
      p => { end(); this.setState({ tpos: { lat: roundPos(p.coords.latitude), lon: roundPos(p.coords.longitude) }, tmsg: '' }); },
      () => { end(); if (!silent) this.setState({ tmsg: 'Position refusée ou introuvable : autorise-la dans les réglages du navigateur, ou parcours la carte de France.' }); },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
  };
  // Autorisation déjà donnée : position retrouvée sans rien demander, une fois par ouverture de l'app.
  let terAuto = false;
  const terAutoLocate = inst => {
    if (terAuto || !navigator.permissions || !navigator.geolocation) return;
    terAuto = true;
    navigator.permissions.query({ name: 'geolocation' }).then(p => { if (p.state === 'granted') inst.terLocate(true); }).catch(() => {});
  };
  const terCtx = prod => Object.assign({ prod: prod, today: realToday() }, RadarCore.releaseContext(RADAR.releases(), realToday()));
  const osmPath = id => ({ n: 'node', w: 'way', r: 'relation' }[id[0]] + '/' + id.slice(1));

  // Fiche d'une vraie boutique (Territoire et Radar) : st = boutique, c = RadarCore.chance, dist en km ou null.
  proto.shopInfo = function (st, c, dist, opts) {
    const s = this.st(), lv = this.probLevel(c.pct), k = RadarCore.KINDS[st.kind] || RadarCore.KINDS.collec, on = !!s.alerts['osm:' + st.id];
    const site = st.site || BRAND_SITE[st.brand] || '', hours = RadarCore.parseHours(st.hours), now = RadarCore.openState(hours, new Date());
    const tel = String(st.tel || '').replace(/[^\d+]/g, ''), why = !!opts.why;
    return {
      name: st.name, kind: k.label + (st.brand && st.brand !== st.name ? ' · ' + st.brand : ''),
      place: [st.city, (RADAR.dept[st.dept] || {}).nom ? RADAR.dept[st.dept].nom + ' (' + st.dept + ')' : ''].filter(Boolean).join(' · ') + (dist !== null ? ' · à ' + this.km(Math.round(dist * 10) / 10) : ''),
      pct: c.pct + ' %', level: lv.label, color: lv.color, tint: lv.tint,
      why: why, whyLabel: why ? 'Masquer le détail' : 'Pourquoi ' + c.pct + ' % ?', toggleWhy: opts.toggleWhy,
      reasons: c.reasons.map(rs => ({ sign: rs.sign, text: rs.text, color: rs.pts > 0 ? 'var(--pkm-green)' : 'var(--pkm-red)' })),
      total: 'Total ' + c.raw + ' points' + (c.clamped ? ', ramené entre 5 et 90 %' : '') + ' · arrondi à 5 % près.',
      route: 'https://www.google.com/maps/dir/?api=1&destination=' + st.lat + ',' + st.lon,
      osm: 'https://www.openstreetmap.org/' + osmPath(st.id),
      report: 'https://www.openstreetmap.org/note/new#map=19/' + st.lat + '/' + st.lon,
      hasSite: !!site, site: site, siteLabel: st.site ? 'Site' : 'Site de l’enseigne',
      siteAria: (st.site ? 'Site de la boutique ' : 'Site de l’enseigne ') + st.name + ' (nouvel onglet)',
      hasTel: tel.length >= 8, tel: 'tel:' + tel, telLabel: 'Appeler', telAria: 'Appeler ' + st.name + ' : ' + st.tel,
      hasHours: !!st.hours, hoursState: now ? now.label : 'Horaires', hoursColor: now ? (now.open ? 'var(--pkm-green)' : 'var(--pkm-t3)') : 'var(--pkm-t2)',
      hoursText: RadarCore.hoursText(st.hours) + (hours ? '' : ' (horaires OpenStreetMap)'),
      hasAddress: !!st.address, address: st.address || '',
      alertOn: on, alertLabel: on ? 'Alerte activée' : 'Activer une alerte', toggleAlert: () => this.radarAlert(st.id),
      alertBg: on ? 'var(--pkm-accent)' : 'transparent', alertFg: on ? 'var(--pkm-on-accent)' : 'var(--pkm-t1)',
      note: 'Indice estimé, pas un stock réel. Boutique réelle (OpenStreetMap) : Dropicards n’a pas d’accord avec elle.'
    };
  };

  // Boutiques réelles autour d'une position, dans le rayon : distance, direction, chance et ouverture.
  const terRows = (s, pos) => {
    const km = Number(s.tkm) || 5, ctx = terCtx(s.tprod), now = new Date(), out = [];
    const dLat = km / 110.57, dLon = km / (111.32 * Math.cos(pos.lat * Math.PI / 180));
    for (const st of RADAR.stores) {
      if (Math.abs(st.lat - pos.lat) > dLat || Math.abs(st.lon - pos.lon) > dLon) continue;
      const d = RadarCore.distanceKm(pos, st);
      if (d > km) continue;
      out.push({ st: st, d: d, c: RadarCore.chance(st, ctx), deg: RadarCore.bearing(pos, st), now: RadarCore.openState(RadarCore.parseHours(st.hours), now) });
    }
    return out.sort(s.tsort === 'chance' ? (a, b) => b.c.pct - a.c.pct || a.d - b.d : (a, b) => a.d - b.d);
  };

  const EMPTY_TX = { hasNext: false, next: null, needPos: false, located: false, loading: false, intro: '', hasMsg: false, msg: '', locate: null, radar: null,
    prods: [], radii: [], sorts: [], rings: [], pins: [], rows: [], hasRows: false, count: '', empty: false, emptyText: '', canWiden: false, widen: null, widenLabel: '',
    demoOpen: false, toggleDemo: null, demoLabel: '' };
  proto.vTerritoryReal = function (s) {
    const pos = s.tpos || s.raround || null;
    const r = Object.assign({}, EMPTY_TX, {
      locate: () => this.terLocate(false), radar: () => this.openRadar(), demoOpen: !!s.tdemo,
      toggleDemo: () => this.setState({ tdemo: !s.tdemo }), demoLabel: s.tdemo ? 'Masquer la démo' : 'Afficher'
    });
    // Prochaine sortie (catalogue scellé) : ouvre la page Sorties.
    const next = SEALED.status === 'ready' ? SEALED.list().filter(p => p.release).sort((a, b) => (a.release < b.release ? -1 : 1))[0] : null;
    if (next) {
      const n = Math.round((Date.parse(next.release) - Date.parse(TODAY)) / 86400000), l = this.look(next);
      const same = SEALED.list().filter(p => p.release === next.release).length;
      r.hasNext = true;
      r.next = Object.assign(l, {
        name: next.name, days: n <= 0 ? 'aujourd’hui' : n === 1 ? 'demain' : 'dans ' + n + ' jours',
        sub: this.d3(next.release) + (same > 1 ? ' · ' + same + ' produits ce jour-là' : '') + ' · liens Amazon, Fnac, Cultura…',
        aria: 'Prochaine sortie : ' + next.name + ', le ' + this.d3(next.release) + '. Ouvrir la page Sorties', open: () => this.openReleases()
      });
    }
    if (!pos) {
      return Object.assign(r, {
        needPos: true, hasMsg: !!s.tmsg, msg: s.tmsg || '',
        intro: 'Active ta position pour voir les vraies boutiques autour de toi (cartes, jeux, jouets, grandes surfaces culturelles), triées par distance, avec leur chance d’avoir du Pokémon.'
      });
    }
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return Object.assign(r, { loading: true });
    }
    const km = Number(s.tkm) || 5, rows = terRows(s, pos), scale = d => 100 * Math.sqrt(Math.min(d, km) / km);
    const chips = (defs, cur, key) => defs.map(([v, label]) => Object.assign({ label: label, on: cur === v, pick: () => this.setState({ [key]: v }) }, this.chip(cur === v)));
    const wider = TER_RADII.find(v => Number(v) > km);
    Object.assign(r, {
      located: true,
      prods: chips([['all', 'Tout'], ['ETB', 'ETB'], ['DSP', 'Display'], ['UPC', 'UPC'], ['value', 'Objets de valeur']], s.tprod, 'tprod'),
      radii: chips(TER_RADII.map(v => [v, v + ' km']), String(km), 'tkm'),
      sorts: chips([['dist', 'Plus proches'], ['chance', 'Meilleure chance']], s.tsort === 'chance' ? 'chance' : 'dist', 'tsort'),
      // Carte : nord en haut, distance à l'échelle racine carrée (les boutiques proches restent lisibles).
      rings: [1, 3, 5, 10, 20].filter(v => v <= km).map(v => ({ r: scale(v).toFixed(1), label: v + ' km', ly: (-scale(v) + 11).toFixed(1) })),
      // Pastilles : les meilleures chances d'abord, sans recouvrement (une pastille qui en cache une autre est omise).
      pins: RadarCore.pinLayout(rows, km, 100, 46, 24, TER_PINS).map(x => {
        return { x: (50 + x.px / 358 * 100).toFixed(2) + '%', y: (50 + x.py / 230 * 100).toFixed(2) + '%', text: x.c.pct + ' %',
          fill: this.probLevel(x.c.pct).color, label: x.st.name + ', ' + this.km(Math.round(x.d * 10) / 10) + ', chance ' + x.c.pct + ' %', open: () => this.push('shop', { shopId: x.st.id, swhy: false }) };
      }),
      rows: rows.slice(0, TER_LIST).map((x, i) => {
        const lv = this.probLevel(x.c.pct), k = RadarCore.KINDS[x.st.kind] || RadarCore.KINDS.collec;
        return {
          name: x.st.name, sub: [x.st.brand && x.st.brand !== x.st.name ? x.st.brand : k.label, x.st.city].filter(Boolean).join(' · '),
          dist: this.km(Math.round(x.d * 10) / 10), hasNow: !!x.now, now: x.now ? x.now.label.split(' · ')[0] : '', nowColor: x.now && x.now.open ? 'var(--pkm-green)' : 'var(--pkm-t3)',
          pct: x.c.pct + ' %', level: lv.label, color: lv.color, tint: lv.tint, border: i === 0 ? 'none' : '1px solid var(--pkm-line)',
          label: x.st.name + ', ' + this.km(Math.round(x.d * 10) / 10) + (x.now ? ', ' + x.now.label : '') + ', chance ' + lv.label.toLowerCase() + ' ' + x.c.pct + ' %',
          open: () => this.push('shop', { shopId: x.st.id, swhy: false })
        };
      }),
      count: rows.length ? rows.length + (rows.length > 1 ? ' boutiques' : ' boutique') + ' à moins de ' + km + ' km' + (rows.length > TER_LIST ? ' · les ' + TER_LIST + ' ' + (s.tsort === 'chance' ? 'meilleures' : 'plus proches') : '') + ' · position à 100 m près' : '',
      hasRows: rows.length > 0, empty: rows.length === 0, emptyText: 'Aucune boutique repérée à moins de ' + km + ' km.',
      canWiden: !!wider && rows.length === 0, widen: wider ? () => this.setState({ tkm: wider }) : null, widenLabel: wider ? 'Élargir à ' + wider + ' km' : ''
    });
    return r;
  };

  // Fiche d'une vraie boutique.
  const EMPTY_SHOP = { found: false };
  proto.vShop = function (s) {
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return EMPTY_SHOP;
    }
    const st = RADAR.byId[s.shopId];
    if (!st) return EMPTY_SHOP;
    const pos = s.tpos || s.raround || null, c = RadarCore.chance(st, terCtx(s.tprod));
    return Object.assign({ found: true }, this.shopInfo(st, c, pos ? RadarCore.distanceKm(pos, st) : null, { why: !!s.swhy, toggleWhy: () => this.setState({ swhy: !s.swhy }) }));
  };

  // Navigation : la fiche d'une boutique vient de Territoire.
  const baseTerParent = proto.parentOf;
  proto.parentOf = function (sc) { return sc === 'shop' ? 'territory' : baseTerParent.call(this, sc); };
  const baseTerSt = proto.st;
  proto.st = function () {
    const d = baseTerSt.call(this), pr = this.props || {};
    if (!(this.state && this.state.screen) && pr.start === 'shop') d.screen = 'shop';
    if (d.tkm === undefined) d.tkm = '5';
    if (d.tsort === undefined) d.tsort = 'dist';
    if (d.shopId === undefined) d.shopId = pr.shopId || '';
    return d;
  };
  const baseTerRender = proto.renderVals;
  proto.renderVals = function () {
    const r = baseTerRender.call(this), s = this.st(), ui = r.ui;
    ui.isShop = s.screen === 'shop';
    r.tx = ui.isTerritory ? this.vTerritoryReal(s) : EMPTY_TX;
    r.bq = ui.isShop ? this.vShop(s) : EMPTY_SHOP;
    if (ui.isTerritory && !s.tpos) setTimeout(() => terAutoLocate(this), 0);
    if (ui.isStore && ui.title) ui.title = 'Démo · ' + ui.title; // magasin partenaire fictif
    if (ui.isShop) {
      Object.assign(ui, { headerHome: false, headerBig: false, headerDetail: true, hasSubRow: true,
        title: r.bq.found ? r.bq.name : 'Boutique', subtitle: r.bq.found ? r.bq.kind : (RADAR.status === 'error' ? 'Boutiques indisponibles pour le moment' : 'Chargement…'),
        syncText: 'Boutique réelle · OpenStreetMap' });
      ui.hasSubtitle = true;
    }
    return r;
  };
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
  const HOME_BUDDIES = [[1,"Bulbizarre"],[2,"Herbizarre"],[3,"Florizarre"],[4,"Salamèche"],[5,"Reptincel"],[6,"Dracaufeu"],[7,"Carapuce"],[8,"Carabaffe"],[9,"Tortank"],[10,"Chenipan"],[11,"Chrysacier"],[12,"Papilusion"],[13,"Aspicot"],[14,"Coconfort"],[15,"Dardargnan"],[16,"Roucool"],[17,"Roucoups"],[18,"Roucarnage"],[19,"Rattata"],[20,"Rattatac"],[21,"Piafabec"],[22,"Rapasdepic"],[23,"Abo"],[24,"Arbok"],[25,"Pikachu"],[26,"Raichu"],[27,"Sabelette"],[28,"Sablaireau"],[29,"Nidoran♀"],[30,"Nidorina"],[31,"Nidoqueen"],[32,"Nidoran♂"],[33,"Nidorino"],[34,"Nidoking"],[35,"Mélofée"],[36,"Mélodelfe"],[37,"Goupix"],[38,"Feunard"],[39,"Rondoudou"],[40,"Grodoudou"],[41,"Nosferapti"],[42,"Nosferalto"],[43,"Mystherbe"],[44,"Ortide"],[45,"Rafflesia"],[46,"Paras"],[47,"Parasect"],[48,"Mimitoss"],[49,"Aéromite"],[50,"Taupiqueur"],[51,"Triopikeur"],[52,"Miaouss"],[53,"Persian"],[54,"Psykokwak"],[55,"Akwakwak"],[56,"Férosinge"],[57,"Colossinge"],[58,"Caninos"],[59,"Arcanin"],[60,"Ptitard"],[61,"Têtarte"],[62,"Tartard"],[63,"Abra"],[64,"Kadabra"],[65,"Alakazam"],[66,"Machoc"],[67,"Machopeur"],[68,"Mackogneur"],[69,"Chétiflor"],[70,"Boustiflor"],[71,"Empiflor"],[72,"Tentacool"],[73,"Tentacruel"],[74,"Racaillou"],[75,"Gravalanch"],[76,"Grolem"],[77,"Ponyta"],[78,"Galopa"],[79,"Ramoloss"],[80,"Flagadoss"],[81,"Magnéti"],[82,"Magnéton"],[83,"Canarticho"],[84,"Doduo"],[85,"Dodrio"],[86,"Otaria"],[87,"Lamantine"],[88,"Tadmorv"],[89,"Grotadmorv"],[90,"Kokiyas"],[91,"Crustabri"],[92,"Fantominus"],[93,"Spectrum"],[94,"Ectoplasma"],[95,"Onix"],[96,"Soporifik"],[97,"Hypnomade"],[98,"Krabby"],[99,"Krabboss"],[100,"Voltorbe"],[101,"Électrode"],[102,"Noeunoeuf"],[103,"Noadkoko"],[104,"Osselait"],[105,"Ossatueur"],[106,"Kicklee"],[107,"Tygnon"],[108,"Excelangue"],[109,"Smogo"],[110,"Smogogo"],[111,"Rhinocorne"],[112,"Rhinoféros"],[113,"Leveinard"],[114,"Saquedeneu"],[115,"Kangourex"],[116,"Hypotrempe"],[117,"Hypocéan"],[118,"Poissirène"],[119,"Poissoroy"],[120,"Stari"],[121,"Staross"],[122,"M. Mime"],[123,"Insécateur"],[124,"Lippoutou"],[125,"Élektek"],[126,"Magmar"],[127,"Scarabrute"],[128,"Tauros"],[129,"Magicarpe"],[130,"Léviator"],[131,"Lokhlass"],[132,"Métamorph"],[133,"Évoli"],[134,"Aquali"],[135,"Voltali"],[136,"Pyroli"],[137,"Porygon"],[138,"Amonita"],[139,"Amonistar"],[140,"Kabuto"],[141,"Kabutops"],[142,"Ptéra"],[143,"Ronflex"],[144,"Artikodin"],[145,"Électhor"],[146,"Sulfura"],[147,"Minidraco"],[148,"Draco"],[149,"Dracolosse"],[150,"Mewtwo"],[151,"Mew"],[380,"Latias"],[381,"Latios"],[382,"Kyogre"],[383,"Groudon"],[384,"Rayquaza"]];
  // ——— Accueil (octobre 2026) ———
  // De haut en bas : recherche dans tout le catalogue, valeur de la collection, Mon classeur, boutiques autour de toi,
  // marge réalisée ; « Premiers pas » et « Suggestion » selon le profil ; Sorties du moment tout en bas. La liste
  // « Ma collection » est retirée (2026-10-07) : « Mon classeur » montre déjà toute la collection.
  // Les calculs de l'accueil ne tournent que sur l'accueil ; les calculs purs sont dans home-core.js (HomeCore).
  // Ce module partage la portée des autres : ses noms commencent par HOME_ ou home.
  const HOME_HITS = 8;
  const HOME_BUDDY = 25; // Pikachu
  const HOME_NAMES = {};
  HOME_BUDDIES.forEach(([n, nom]) => { HOME_NAMES[n] = nom; });
  const homeBaseSt = proto.st;
  proto.st = function () {
    const d = homeBaseSt.call(this);
    if (typeof d.hq !== 'string') d.hq = '';
    if (!HOME_BUDDIES.some(([n]) => n === d.buddy)) d.buddy = HOME_BUDDY;
    if (typeof d.hbq !== 'string') d.hbq = '';
    if (d.hbk !== 'sealed') d.hbk = 'cards';
    if (!(d.hbcp >= 0)) d.hbcp = 0;
    if (!(d.hbsp >= 0)) d.hbsp = 0;
    return d;
  };

  // Recherche : les résultats du Marché (scellé, articles suivis, puis cartes du catalogue), 8 au plus.
  let homeHits = null; // mêmes résultats tant que la requête et les données ne changent pas
  proto.homeSearch = function (x) {
    const s = x.s, q = String(s.hq || '').trim();
    const r = { q: s.hq, onQ: e => this.setState({ hq: e.target.value }), hasQ: !!s.hq, clear: () => this.setState({ hq: '' }),
      open: false, status: '', rows: [], hasRows: false, hasMore: false, moreLabel: '', more: null };
    if (q.length < 2) return r;
    const key = [q, TCG.status, SEALED.status, s.purchases, s.sales, s.extra];
    if (!homeHits || homeHits.key.some((v, i) => v !== key[i])) {
      const mk = this.vMarket(Object.assign({}, x, { s: Object.assign({}, s, { mq: q, mfilter: 'trend' }) }));
      homeHits = { key: key, list: mk.list, total: typeof mk.total === 'number' ? mk.total : mk.list.length };
    }
    const shown = homeHits.list.slice(0, HOME_HITS), total = homeHits.total;
    return Object.assign(r, {
      open: true, rows: shown.map((l, i) => Object.assign({}, l, { border: x.line(i) })), hasRows: shown.length > 0,
      status: TCG.status === 'loading' ? 'Chargement du catalogue complet…'
        : total === 0 ? 'Aucun résultat pour « ' + q + ' »'
        : total.toLocaleString('fr-FR') + (total > 1 ? ' résultats' : ' résultat') + (total > shown.length ? ' · les ' + shown.length + ' premiers' : ''),
      hasMore: total > shown.length, moreLabel: 'Voir les ' + total.toLocaleString('fr-FR') + ' résultats dans le Marché',
      more: () => { this.setState({ mq: q, mfilter: 'trend' }); this.tab('market'); }
    });
  };

  // ——— Mon classeur : les cartes et les produits scellés de la collection, du plus cher au moins cher ———
  // « Mes cartes » reprend l'aperçu de PokéItem montré par le porteur : visuel officiel, pastille avec le drapeau de
  // la langue, la cote et un point de couleur pour l'état ; note de gradation et exemplaires en plus. Pages de 9
  // pochettes (3 × 3), comme un classeur. « Mes produits scellés » : vitrine 2 par ligne, pages de 4. La langue et
  // l'état sont ceux des exemplaires ajoutés (copies.js) ; un ajout sans langue prend celle de l'article.
  const HOME_BINDER = { cards: 9, sealed: 4 };
  const HOME_COND = { NM: 'var(--pkm-up)', EX: 'var(--pkm-amber)', PL: 'var(--pkm-down)', SO: 'var(--pkm-up)', AB: 'var(--pkm-amber)' };
  const homeCopy = (purchases, p) => {
    const g = copiesOf(purchases, p)[0], set = (purchases || []).some(a => (a.lines || []).some(l => l.pid === p.id && l.lang));
    return { lang: set && g ? g.lang : p.lang || 'FR', cond: g ? g.cond : copyConds(p)[0][0] };
  };
  proto.homeBinder = function (x) {
    const s = x.s, tab = s.hbk, key = tab === 'sealed' ? 'hbsp' : 'hbcp';
    const unit = p => x.val(p) || 0, qty = p => x.c.stock[p.id].qty;
    const mine = sealed => x.owned.filter(p => (p.type === 'sealed') === sealed)
      .sort((a, b) => unit(b) - unit(a) || String(a.name).localeCompare(String(b.name), 'fr'));
    const cards = mine(false), sealed = mine(true), list = tab === 'sealed' ? sealed : cards, per = HOME_BINDER[tab];
    const pages = Math.max(1, Math.ceil(list.length / per)), page = Math.min(s[key], pages - 1);
    const sum = l => l.reduce((t, p) => t + unit(p) * qty(p), 0), units = l => l.reduce((t, p) => t + qty(p), 0);
    const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
    // Cote courte sur la pastille : à l'euro près dès 100 €, comme l'aperçu de PokéItem.
    const cote = p => { const v = unit(p); return v ? x.mask(v >= 100 ? this.eur0(v) : this.eur(v)) : '—'; };
    const tile = p => {
      const k = homeCopy(s.purchases, p), q = qty(p), l = this.look(p);
      return Object.assign(l, {
        name: p.name, sub: copyBase(p.sub), flag: this.flag(k.lang), cote: cote(p), condColor: HOME_COND[k.cond] || HOME_COND.NM,
        many: q > 1, qty: '×' + q, bg: l.hasPhoto ? 'var(--pkm-photo-mat)' : l.bg,
        label: p.name + (p.grade ? ', gradée ' + p.grade : '') + ', ' + plural(q, 'exemplaire', 'exemplaires') + ', ' + k.lang + ', '
          + copyLabel(p, k.cond) + ', cote ' + (unit(p) ? x.mask(this.eur(unit(p))) : 'inconnue') + '. Ouvrir la fiche',
        open: () => this.push('item', { itemId: p.id })
      });
    };
    const graded = cards.filter(p => p.grade).length, extra = cards.reduce((t, p) => t + Math.max(0, qty(p) - 1), 0);
    const shown = list.slice(page * per, page * per + per).map(tile);
    return {
      tabs: [['cards', 'Mes cartes'], ['sealed', 'Mes produits scellés']].map(([k, label]) =>
        Object.assign({ label: label, on: tab === k, pick: () => this.setState({ hbk: k }) }, this.chip(tab === k))),
      tabLabel: tab === 'sealed' ? 'Mes produits scellés' : 'Mes cartes',
      cardsTab: tab !== 'sealed' && shown.length > 0, sealedTab: tab === 'sealed' && shown.length > 0,
      cards: tab === 'sealed' ? [] : shown, sealed: tab === 'sealed' ? shown : [],
      summary: tab === 'sealed'
        ? plural(units(sealed), 'produit', 'produits') + ' · ' + x.mask(this.eur(sum(sealed)))
        : [plural(units(cards), 'carte', 'cartes') + ' · ' + x.mask(this.eur(sum(cards)))]
          .concat(graded ? [plural(graded, 'gradée', 'gradées')] : [], extra ? [plural(extra, 'doublon', 'doublons')] : []).join(' · '),
      empty: !list.length,
      emptyText: tab === 'sealed' ? 'Aucun produit scellé dans ton classeur pour l’instant.' : 'Aucune carte dans ton classeur pour l’instant : scanne une carte ou cherche-la dans le catalogue.',
      hasPages: pages > 1, pageLabel: 'Page ' + (page + 1) + ' sur ' + pages,
      prevOff: page === 0, nextOff: page === pages - 1, prevDim: page === 0 ? 0.35 : 1, nextDim: page === pages - 1 ? 0.35 : 1,
      prev: () => { if (page > 0) this.setState({ [key]: page - 1 }); },
      next: () => { if (page < pages - 1) this.setState({ [key]: page + 1 }); }
    };
  };

  // Tendance de la collection : 4 points (il y a 30 jours, 7 jours, hier, aujourd'hui), calculés par HomeCore.points :
  // moyennes Cardmarket pour les cartes, cote archivée chaque jour pour le scellé, courbe simulée pour la démo.
  const HOME_LABELS = ['il y a 30 jours', 'il y a 7 jours', 'hier', 'aujourd’hui'];
  proto.homeTrend = function (x, valueBig) {
    const c = x.c, V = [0, 0, 0, 0], days = SEALED.doc && SEALED.doc.days;
    x.owned.forEach(p => {
      const q = c.stock[p.id].qty;
      HomeCore.points(p, x.val(p), x.hist[p.id], this.cote(p), days, TODAY).forEach((v, i) => { V[i] += q * v; });
    });
    const d7 = V[3] - V[1], pct = V[1] > 0 ? d7 / V[1] * 100 : 0;
    return Object.assign(HomeCore.chart(V, 324, 64, 8, 54), {
      color: x.col(d7),
      delta: 'Sur 7 jours : ' + x.mask(this.signed(d7)) + (V[1] > 0 ? ' (' + this.chg(pct) + ')' : ''),
      source: 'Source : moyennes Cardmarket (cartes), cote archivée chaque jour (scellé)',
      // Police du logo : l'espace fine des milliers (U+202F) n'y a pas de largeur ; espace normale, sans retour à la ligne.
      value: String(valueBig).replace(/[\u202f\u00a0]/g, ' '),
      aria: 'Tendance de ta collection : ' + V.map((v, i) => HOME_LABELS[i] + ' ' + x.mask(this.eur(v))).join(', '),
      fit: Math.max(4, String(valueBig).length * 0.6).toFixed(2)
    });
  };

  // ——— Radar de l'accueil : vraies boutiques à moins de 5 km (OpenStreetMap), balayage, repères nom et ville ———
  // Même position que Territoire (arrondie à 100 m, jamais enregistrée ni envoyée). « Scanner les boutiques » lance le
  // faisceau : chaque boutique apparaît à sa vraie direction et devient cliquable à ce moment-là (animation CSS, sans
  // calcul à chaque image) ; un appui ouvre sa fiche. Animations réduites : boutiques affichées tout de suite.
  // Sans position, un logo radar animé dans l'encadré, au-dessus de « Me localiser », demande la position ; le
  // balayage part dès que les boutiques sont prêtes.
  const HOME_KM = 5, HOME_PINS = 8, HOME_R = 120;
  let homeScanTimer = null, homeNextTimer = null;
  const homeClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  proto.homeSweep = function () {
    if (this.st().hscan === 'run') return;
    clearTimeout(homeScanTimer);
    if (homeStill()) { this.setState({ hscan: 'done' }); return; }
    this.setState({ hscan: 'run' });
    homeScanTimer = setTimeout(() => this.setState({ hscan: 'done' }), TURN + 400);
  };
  proto.homeRadar = function (s) {
    const pos = s.tpos || s.raround || null;
    const r = {
      needPos: false, loading: false, located: false, hasMsg: false, msg: '', locate: () => this.terLocate(false),
      france: () => this.openRadar(), list: () => this.tab('territory'), rings: [], pins: [], sweeping: false, scanned: false,
      scan: null, scanLabel: '', busy: false, status: '', tap: null, tapLabel: ''
    };
    if (!pos) return Object.assign(r, {
      needPos: true, hasMsg: !!s.tmsg, msg: s.tmsg || '',
      tap: () => { this.setState({ hscanNext: true }); this.terLocate(false); },
      tapLabel: 'Radar : me localiser et scanner les boutiques autour de toi'
    });
    if (RADAR.status !== 'ready') {
      if (RADAR.status !== 'loading') RADAR.load().then(() => this.setState({ rdata: Date.now() }));
      return Object.assign(r, { loading: true });
    }
    if (s.hscanNext && !homeNextTimer) homeNextTimer = setTimeout(() => { homeNextTimer = null; this.setState({ hscanNext: false }); this.homeSweep(); }, 60);
    const rows = terRows(Object.assign({}, s, { tkm: String(HOME_KM), tsort: 'dist', tprod: 'all' }), pos);
    const sweeping = s.hscan === 'run', scanned = s.hscan === 'done', scale = d => HOME_R * Math.sqrt(Math.min(d, HOME_KM) / HOME_KM);
    const pins = RadarCore.pinLayout(rows, HOME_KM, HOME_R, 118, 40, HOME_PINS).map(x => {
      const city = x.st.city || ((RADAR.dept[x.st.dept] || {}).nom || ''), d = this.km(Math.round(x.d * 10) / 10);
      return {
        // Étiquettes gardées dans le cadre ; la direction reste celle de la boutique.
        x: homeClamp(50 + x.px / 358 * 100, 21, 79).toFixed(2) + '%', y: homeClamp(50 + x.py / 358 * 100, 7, 93).toFixed(2) + '%',
        name: x.st.name, city: city, fill: this.probLevel(x.c.pct).color, delay: Math.round(x.deg / 360 * TURN) + 'ms',
        label: x.st.name + ', ' + city + ', à ' + d + ', chance ' + x.c.pct + ' %. Ouvrir la fiche',
        open: () => this.push('shop', { shopId: x.st.id, swhy: false })
      };
    });
    const n = rows.length, many = n > 1 ? ' boutiques' : ' boutique';
    return Object.assign(r, {
      located: true, sweeping: sweeping, scanned: scanned, pins: pins, busy: sweeping,
      rings: [1, 3, 5].map(v => ({ r: scale(v).toFixed(1), label: v + ' km', ly: (-scale(v) + 13).toFixed(1) })),
      scanLabel: sweeping ? 'Scan en cours…' : scanned ? 'Scanner à nouveau' : 'Scanner les boutiques',
      scan: () => this.homeSweep(),
      status: !n ? 'Aucune boutique repérée à moins de ' + HOME_KM + ' km : « Voir la liste » permet d’élargir.'
        : !(sweeping || scanned) ? n + many + ' à moins de ' + HOME_KM + ' km : lance le scan pour les voir sur le radar.'
        : n + many + ' à moins de ' + HOME_KM + ' km · ' + (pins.length < n ? 'les ' + pins.length + ' meilleures chances sur le radar · ' : '') + 'position à 100 m près'
    });
  };

  const homeBaseView = proto.vHome;
  proto.vHome = function (x) {
    const r = homeBaseView.call(this, x);
    if (x.s.screen !== 'home') return r;
    r.hs = this.homeSearch(x);
    r.hv = this.homeTrend(x, r.valueBig);
    r.hk = this.homeBinder(x);
    if (!x.s.tpos && !x.s.raround) terAutoLocate(this); // autorisation déjà donnée : position retrouvée sans rien demander
    r.hr = this.homeRadar(x.s);
    return r;
  };

  // ——— Compagnon : un des 151 Pokémon de Kanto, ou Latias, Latios, Kyogre, Groudon, Rayquaza ; animé à côté de la
  // valeur ; choix enregistré sur l'appareil ———
  // Sprites de Pokémon Noir et Blanc (tools/sprites/fetch_sprites.py) : animé (GIF), image fixe si l'utilisateur
  // limite les animations. Le panneau de choix montre des icônes : le Pokémon seul, recadré, agrandi sans flou et
  // centré (tools/sprites/make_icons.py).
  const homeStill = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const homeSprite = (n, still) => 'img/pokemon/' + n + (still ? '.png' : '.gif');
  const homeIcon = n => 'img/pokemon/icon/' + n + '.png';
  const HOME_CREDIT = 'Sprites de Pokémon Noir et Blanc © The Pokémon Company, via PokeAPI. Dropicards est une application indépendante, non affiliée.';
  proto.homeBuddy = function (s) {
    const n = s.buddy, name = HOME_NAMES[n], still = homeStill();
    const r = {
      // Image fixe : cadre de 96 px presque vide, agrandie pour avoir la taille du sprite animé.
      src: homeSprite(n, still), scale: still ? 'scale(1.5)' : 'none', name: name, aria: 'Compagnon : ' + name + '. Changer de compagnon',
      open: () => this.setState({ buddyPick: true, hbq: '' }), close: () => this.setState({ buddyPick: false }),
      picking: !!s.buddyPick, q: s.hbq, onQ: e => this.setState({ hbq: e.target.value }), list: [], count: '', credit: HOME_CREDIT
    };
    if (!r.picking) return r;
    const q = fold(String(s.hbq || '').trim());
    const list = HOME_BUDDIES.filter(([k, nom]) => !q || fold(nom).indexOf(q) >= 0 || String(k) === q.replace(/^0+/, ''));
    r.count = !list.length ? 'Aucun Pokémon ne correspond.' : list.length + ' Pokémon' + (q ? '' : ' disponibles');
    r.list = list.map(([k, nom]) => Object.assign({
      name: nom, src: homeIcon(k), on: k === n, aria: nom + ', n° ' + k + (k === n ? ' (ton compagnon)' : ''),
      pick: () => { this.setState({ buddy: k, buddyPick: false, toast: nom + ' t’accompagne' }); this.flash(); }
    }, this.chip(k === n)));
    return r;
  };
  const HOME_NO_BUDDY = { picking: false, list: [] };
  const homeBaseRender = proto.renderVals;
  proto.renderVals = function () {
    const r = homeBaseRender.call(this), s = this.st();
    r.hb = r.ui.isHome || s.buddyPick ? this.homeBuddy(s) : HOME_NO_BUDDY;
    return r;
  };
  // ——— Scan : calculs purs (testés par tools/web/test_scan.mjs) ———
  // Texte lu par l'OCR en bas (numéro) et en haut (nom) de la carte → cartes du catalogue (cards.json),
  // règle d'arrêt de la lecture continue, cadre de l'écran en pixels de la vidéo, préparation des bandes.
  const ScanCore = (function () {
    // Bandes lues, en fractions du cadre de la carte ; cap : hauteur des majuscules (pour l'agrandissement).
    // Le numéro est en bas à gauche depuis Épée et Bouclier, en bas à droite avant : toute la largeur.
    // Bandes larges en hauteur : la carte n'est jamais parfaitement dans le cadre.
    const BANDS = {
      name: { x0: 0.03, x1: 0.97, y0: 0, y1: 0.125, cap: 0.028, px: 36, min: 0.6, max: 2 },
      num: { x0: 0.02, x1: 0.98, y0: 0.86, y1: 1, cap: 0.0145, px: 36, min: 1, max: 3.5 }
    };
    // Promos : le préfixe imprimé (« SWSH123 », « SVP 045 ») remplace le total.
    const PROMO = { swshp: 'SWSH', smp: 'SM', xyp: 'XY', bwp: 'BW', hgssp: 'HGSS', dpp: 'DP', svp: 'SVP', mep: 'MEP' };
    // Numéros imprimés sur 3 chiffres (« 001/202 ») depuis Épée et Bouclier.
    const PADDED_FROM = '2020-02-07';
    // Confusions de l'OCR : lettre lue dans une suite de chiffres, chiffre lu dans un préfixe (TG, GG, SV…).
    const DIGIT = { O: '0', Q: '0', D: '0', U: '0', I: '1', L: '1', '|': '1', '!': '1', J: '1', Z: '2', S: '5', $: '5', G: '6', B: '8', T: '7' };
    const LETTER = { 0: 'O', 1: 'I', 2: 'Z', 5: 'S', 6: 'G', 7: 'T', 8: 'B' };
    const LANGS = ['FR', 'EN', 'DE', 'IT', 'ES', 'PT'];

    // Sans accents ni casse ni ponctuation ; décorations retirées (★ ◇ δ).
    const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ').trim();
    // Squelette pour comparer des noms lus : sans espaces, chiffres et paires de lettres souvent confondus.
    const skel = t => fold(t).replace(/ /g, '').replace(/rn/g, 'm').replace(/vv/g, 'w')
      .replace(/[015826]/g, c => ({ 0: 'o', 1: 'l', 5: 's', 8: 'b', 2: 'z', 6: 'g' })[c]);
    // Mentions qui accompagnent le nom sans en faire partie pour la comparaison de base.
    const SUFFIX = /(^| )(ex|gx|v|vmax|vstar|v union|break|prime|lv x|legend|star|tera|turbo)$/;
    const base = f => { let b = f.replace(/^(mega|m) /, ''); for (let k = 0; k < 2; k++) b = b.replace(SUFFIX, '').trim(); return b; };

    // Distance d'édition (Levenshtein), deux lignes.
    function lev(a, b) {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      let prev = new Array(b.length + 1), cur = new Array(b.length + 1);
      for (let j = 0; j <= b.length; j++) prev[j] = j;
      for (let i = 1; i <= a.length; i++) {
        cur[0] = i;
        for (let j = 1; j <= b.length; j++) {
          const c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        }
        const t = prev; prev = cur; cur = t;
      }
      return prev[b.length];
    }
    const ratio = (a, b) => (a.length || b.length ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0);
    // Ressemblance d'un nom lu (squelette s, base sb) et d'un nom du catalogue (n.s, n.b) : de 0 à 1.
    const simTo = (s, sb, n) => Math.max(ratio(s, n.s), sb && n.b ? 0.95 * ratio(sb, n.b) : 0);
    const trigrams = s => { const out = new Set(), t = '  ' + s + ' '; for (let i = 0; i + 3 <= t.length; i++) out.add(t.slice(i, i + 3)); return out; };

    // ——— Index du catalogue (une fois, à la première ouverture du scan) ———
    // doc : cards.json ({ fields, cards, sets }). Clés : « préfixe|numéro|total » (123/191, TG05/TG30),
    // promos « SWSH|123 », numéros seuls, totals → extensions, noms (squelettes et trigrammes).
    function index(doc) {
      const F = {};
      doc.fields.forEach((k, i) => { F[k] = i; });
      const rows = doc.cards, sets = doc.sets;
      const add = (m, k, v) => { const l = m.get(k); if (l) { if (l[l.length - 1] !== v) l.push(v); } else m.set(k, [v]); };
      const parts = rows.map(r => /^([A-Z]*)(\d+)$/.exec(String(r[F.num] || '')));
      const sub = new Map(), prefixes = new Set();
      parts.forEach((m, i) => { if (m && m[1]) { add(sub, rows[i][F.set] + '|' + m[1], i); prefixes.add(m[1]); } });
      Object.keys(PROMO).forEach(s => prefixes.add(PROMO[s]));
      const byKey = new Map(), byPromo = new Map(), byNum = new Map(), setsByTotal = new Map(), totals = new Set(), bySet = new Map();
      const names = [], nameAt = new Map(), rowName = new Int32Array(rows.length), tri = new Map();
      // Numéro et total imprimés de chaque carte (« |123 », « |191 », « TG|5 », « TG|30 ») : indices partiels.
      const rowN = new Array(rows.length).fill(''), rowT = new Array(rows.length).fill('');
      rows.forEach((r, i) => {
        const set = r[F.set], m = parts[i], f = fold(r[F.name]);
        let k = nameAt.get(f);
        if (k === undefined) {
          k = names.length; nameAt.set(f, k);
          const n = { f: f, s: skel(f), b: skel(base(f)), rows: [] };
          names.push(n);
          trigrams(n.s).forEach(t => add(tri, t, k));
        }
        rowName[i] = k; names[k].rows.push(i);
        add(bySet, set, i);
        if (!m) return;
        const pre = m[1], n = +m[2];
        add(byNum, pre + '|' + n, i);
        rowN[i] = pre + '|' + n;
        if (PROMO[set]) { add(byPromo, PROMO[set] + '|' + n, i); return; }
        const T = pre ? (sub.get(set + '|' + pre) || []).length : +((sets[set] || [])[4]) || 0;
        if (!T) return;
        rowT[i] = pre + '|' + T;
        add(byKey, pre + '|' + n + '|' + T, i);
        add(setsByTotal, pre + '|' + T, set);
        totals.add(pre + '|' + T);
      });
      const date = {};
      Object.keys(sets).forEach(s => { date[s] = sets[s][2] || ''; });
      return { F: F, rows: rows, sets: sets, date: date, byKey: byKey, byPromo: byPromo, byNum: byNum, setsByTotal: setsByTotal,
        totals: totals, bySet: bySet, names: names, rowName: rowName, rowN: rowN, rowT: rowT, tri: tri, prefixes: prefixes };
    }

    // ——— Lecture du numéro ———
    // Suite de chiffres avec confusions corrigées (O→0, I→1, S→5…) ; null si ce n'est pas un nombre.
    function digits(t) {
      let s = '', subs = 0;
      for (const c of t) {
        if (c >= '0' && c <= '9') s += c;
        else if (DIGIT[c]) { s += DIGIT[c]; subs++; } else return null;
      }
      return s && subs * 2 <= s.length ? { s: s, subs: subs } : null;
    }
    // « TG05 », « T605 » (6 lu pour G), « SWSH123 », « 123 » → { pre, s, subs }.
    function splitPre(tok, known) {
      for (let k = Math.min(4, tok.length - 1); k >= 1; k--) {
        const head = tok.slice(0, k), fixed = head.replace(/[0-9]/g, c => LETTER[c] || c);
        if (!/^[A-Z]+$/.test(fixed) || !known.has(fixed)) continue;
        const d = digits(tok.slice(k));
        if (d) return { pre: fixed, s: d.s, subs: d.subs + [...head].filter((c, i) => c !== fixed[i]).length };
      }
      const d = digits(tok);
      return d ? { pre: '', s: d.s, subs: d.subs } : null;
    }
    // Fin d'un mot avant « / » : le plus long suffixe lisible comme numéro (« HSSPFR238 » → 238, « XTG05 » → TG05).
    const tail = (L, known) => {
      for (let k = Math.min(L.length, 8); k >= 1; k--) { const p = splitPre(L.slice(-k), known); if (p && p.s.length <= 3) return p; }
      return null;
    };
    // Début d'un mot après « / » : le plus long préfixe lisible comme total (« 191★ », « TG30 », « 0912024 » → 091).
    const head = (R, known) => {
      for (let k = Math.min(R.length, 7); k >= 1; k--) { const p = splitPre(R.slice(0, k), known); if (p && p.s.length <= 3) return p; }
      return null;
    };
    const PROMOS = Object.keys(PROMO).map(k => PROMO[k]);
    // Texte de la bande du bas → indices : paires numéro/total, promos, totaux seuls, numéros seuls, langue.
    // L'OCR colle souvent les mots (« GSSPFR123/191 ») : on lit la fin du mot avant la barre et le début après.
    // q : confiance de 0 à 1 (corrections et coupures la font baisser).
    function parseNumber(text, idx) {
      const known = (idx && idx.prefixes) || new Set(['TG', 'GG', 'SV', 'RC', 'H'].concat(PROMOS));
      const out = { pairs: [], promos: [], totals: [], nums: [], lang: null };
      const T = String(text || '').toUpperCase().replace(/[⁄∕／\\]/g, '/').replace(/\s*\/\s*/g, '/');
      const toks = T.split(/[^A-Z0-9/|!$]+/).filter(Boolean);
      const addPair = (a, b, q, from) => {
        if (!a || !b || (b.pre && a.pre && b.pre !== a.pre)) return false;
        const n = +a.s, t = +b.s, pre = a.pre || b.pre;
        if (!(n >= 1 && n <= 999 && t >= 2 && t <= 999)) return false;
        // pad : numéro imprimé sur 3 chiffres (« 045 ») ; inconnu au-delà de 99 et pour les sous-séries.
        out.pairs.push({ pre: pre, n: n, T: t, s: a.s, ts: b.s, q: q * Math.max(0.5, 1 - 0.05 * (a.subs + b.subs)),
          pad: pre || n >= 100 ? null : a.s.length === 3, from: from });
        return true;
      };
      toks.forEach(tok => {
        if (LANGS.indexOf(tok) >= 0) { if (!out.lang) out.lang = tok; return; }
        // Langue collée au numéro (« SSPFR123/191 », « SVPFR045 »).
        const lg = /(FR|EN|DE|IT|ES|PT)(?=[0-9OIL]{2,3}(\/|$))/.exec(tok);
        if (lg && !out.lang) out.lang = lg[1];
        const sl = tok.lastIndexOf('/');
        if (sl >= 0) {
          const L = tok.slice(0, sl), R = tok.slice(sl + 1), a = L ? tail(L, known) : null, b = R ? head(R, known) : null;
          if (a && b) addPair(a, b, 1, 'slash');
          else if (!L && b) out.totals.push({ pre: b.pre, T: +b.s, q: 0.8 });
          return;
        }
        // Promos : « SWSH123 », « SM45 », « SVP FR 045 » (même collé : « GSVPFR045 ») ; « SWH045 » pour SWSH.
        const pm = /([A-Z0-9]*?)([A-Z]{2,6})([0-9OIL]{2,3})$/.exec(tok);
        if (pm) {
          const letters = pm[2].replace(/(FR|EN|DE|IT|ES|PT)$/, ''), d = digits(pm[3]);
          const exact = PROMOS.find(p => letters.slice(-p.length) === p);
          const fuzzy = exact || PROMOS.find(p => p.length === 4 && [3, 4, 5].some(k => letters.length >= k && lev(letters.slice(-k), p) <= 1));
          if (fuzzy && d && +d.s > 0) { out.promos.push({ pre: fuzzy, n: +d.s, s: d.s, q: (exact ? 1 : 0.85) * Math.max(0.5, 1 - 0.05 * d.subs) }); return; }
        }
        const spr = splitPre(tok, known);
        if (spr && spr.pre && PROMOS.indexOf(spr.pre) >= 0 && spr.s.length <= 3 && +spr.s > 0) { out.promos.push({ pre: spr.pre, n: +spr.s, s: spr.s, q: Math.max(0.5, 1 - 0.05 * spr.subs) }); return; }
        // « SVP » ou « MEP » seul : le numéro suit (« SVP EN 045 »).
        const fixed = tok.replace(/[0-9]/g, c => LETTER[c] || c);
        if (/(SVP|MEP)$/.test(fixed)) { out.promoNext = fixed.slice(-3); return; }
        if (out.promoNext) {
          const d = digits(tok);
          if (d && d.s.length === 3 && +d.s > 0) { out.promos.push({ pre: out.promoNext, n: +d.s, s: d.s, q: 0.95 }); out.promoNext = null; return; }
        }
        // Fin du mot en chiffres : « / » perdu ou lu comme 1, 7, I, L (« 1231191 », « 123191 »), pas une année (« ©2024 »).
        const run = ((/[0-9|!LI]+$/.exec(tok) || [''])[0]).replace(/^[|!LI]+/, ''), d = digits(run);
        if (d && d.s.length >= 4 && d.s.length <= 7 && !/^(19|20)\d\d$/.test(d.s)) {
          let found = false;
          for (let p = 1; p <= 3; p++) {
            const mid = run[p], R = run.slice(p + 1), R0 = run.slice(p), a = splitPre(run.slice(0, p), known);
            if ('/|LI!17'.indexOf(mid) >= 0 && R.length >= 2 && R.length <= 3) found = addPair(a, splitPre(R, known), mid === '1' || mid === '7' ? 0.75 : 0.85, 'lost') || found;
            if (R0.length >= 2 && R0.length <= 3) found = addPair(a, splitPre(R0, known), 0.6, 'lost') || found;
          }
          if (found) return;
        }
        // Numéro seul sur 3 chiffres (« 045 ») : indice faible, utile avec le nom.
        if (d && d.s.length === 3 && d.s[0] === '0' && +d.s > 0) out.nums.push({ pre: '', n: +d.s, q: 0.5, pad: true });
      });
      delete out.promoNext;
      // Une même paire lue plusieurs fois : la meilleure confiance.
      const seen = new Map();
      out.pairs.forEach(p => { const k = p.pre + '|' + p.n + '|' + p.T, o = seen.get(k); if (!o || o.q < p.q) seen.set(k, p); });
      out.pairs = [...seen.values()].sort((a, b) => b.q - a.q);
      return out;
    }

    // ——— Lecture du nom ———
    // Mentions en tête de ligne (stade, type de carte) et fin « Évolution de … » retirées ; PV et nombres retirés.
    const LEAD = /^(de base|base|basic|niveau [12]|niveau|stage [12]|stage|dresseur|trainer|supporter|objet|item|stade|stadium|outil pokemon|pokemon tool|outil)( |$)/;
    const TAIL = /(^| )(evolution de|evolue de|evolves from|evolue|evolution)( .*)?$/;
    // Texte de la bande du haut → morceaux de 1 à 6 mots consécutifs à comparer aux noms du catalogue (24 au plus).
    // k : mots du morceau ; K : mots de sa ligne (un morceau plus court que sa ligne est un peu pénalisé,
    // pour préférer « Dracaufeu ex » à « Dracaufeu » quand les deux mots sont lus).
    function parseName(text) {
      const out = new Map();
      String(text || '').split(/\n+/).forEach(line => {
        let f = fold(line).replace(TAIL, '');
        for (let k = 0; k < 2; k++) f = f.replace(LEAD, '');
        const w = f.split(' ').filter(t => t && !/\d/.test(t) && t !== 'pv' && t !== 'hp');
        for (let a = 0; a < w.length; a++) {
          for (let b = a + 1; b <= Math.min(w.length, a + 6); b++) {
            const t = w.slice(a, b).join(' '), o = out.get(t), K = Math.min(w.length, 6);
            if (t.replace(/ /g, '').length >= 3 && (!o || K - (b - a) < o.K - o.k)) out.set(t, { t: t, k: b - a, K: K });
          }
        }
      });
      return [...out.values()].sort((a, b) => b.t.length - a.t.length).slice(0, 24);
    }

    // ——— Rapprochement ———
    // read : { num, name } (texte des deux bandes). Résultat : indices lus et cartes classées (5 au plus).
    // Score : numéro et nom à parts égales ; nom seul plafonné à 0,5 (jamais d'arrêt automatique).
    function match(idx, read) {
      const num = parseNumber(read && read.num, idx);
      const W = parseName(read && read.name).map(w => ({ t: w.t, s: skel(w.t), b: skel(base(w.t)), pen: Math.min(0.12, 0.04 * (w.K - w.k)) }));
      const simName = n => { let best = 0; for (const w of W) best = Math.max(best, simTo(w.s, w.b, n) - w.pen); return Math.max(0, best); };
      const nameEvOf = i => simName(idx.names[idx.rowName[i]]);
      const cand = new Map(), put = (i, ev, pad) => { const c = cand.get(i); if (!c || c.numEv < ev) cand.set(i, { i: i, numEv: ev, pad: pad }); };
      let numText = null;
      num.pairs.forEach(p => {
        const rows = idx.byKey.get(p.pre + '|' + p.n + '|' + p.T);
        if (rows) { rows.forEach(i => put(i, p.q, p.pad)); if (!numText) numText = p.pre + p.s + '/' + p.pre + p.ts; } else if (p.from === 'slash') {
          // Paire lue avec sa barre mais inconnue du catalogue : total et numéro gardés comme indices faibles.
          num.totals.push({ pre: p.pre, T: p.T, q: p.q * 0.5 });
          num.nums.push({ pre: p.pre, n: p.n, q: p.q * 0.5, pad: p.pad });
        }
      });
      num.promos.forEach(p => {
        const rows = idx.byPromo.get(p.pre + '|' + p.n);
        if (rows) { rows.forEach(i => put(i, p.q, null)); if (!numText) numText = p.pre + (p.pre.length === 3 ? ' ' : '') + p.s; }
      });
      if (W.length) {
        num.totals.forEach(t => (idx.setsByTotal.get(t.pre + '|' + t.T) || []).forEach(s => {
          (idx.bySet.get(s) || []).forEach(i => { if (nameEvOf(i) >= 0.6) put(i, 0.55 * t.q, null); });
        }));
        num.nums.forEach(t => (idx.byNum.get(t.pre + '|' + t.n) || []).forEach(i => { if (nameEvOf(i) >= 0.6) put(i, 0.4 * t.q, t.pad); }));
        // Noms proches (trigrammes, puis distance d'édition). Numéro absent ou faible : tous ceux à 0,72 et plus ;
        // numéro sûr : seulement un nom presque exact (utile si le numéro a été mal lu), 6 éditions au plus.
        let maxNum = 0;
        cand.forEach(c => { maxNum = Math.max(maxNum, c.numEv); });
        const votes = new Map(), floor = maxNum < 0.8 ? 0.72 : 0.85;
        W.forEach(w => trigrams(w.s).forEach(t => (idx.tri.get(t) || []).forEach(k => votes.set(k, (votes.get(k) || 0) + 1))));
        [...votes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).forEach(([k]) => {
          const n = idx.names[k];
          if (simName(n) < floor) return;
          const rows = maxNum < 0.8 ? n.rows : n.rows.slice().sort((a, b) => (idx.date[idx.rows[b][idx.F.set]] || '').localeCompare(idx.date[idx.rows[a][idx.F.set]] || '')).slice(0, 6);
          rows.forEach(i => { if (!cand.has(i)) cand.set(i, { i: i, numEv: 0, pad: null }); });
        });
      }
      // Paire lue avec sa barre mais dont une moitié est fausse (« 123/197 » pour 123/191) : une carte retenue par son
      // nom qui a le même numéro (ou le même total) reçoit un indice partiel.
      const readN = new Map(), readT = new Map();
      num.pairs.forEach(p => {
        if (p.from !== 'slash') return;
        readN.set(p.pre + '|' + p.n, Math.max(readN.get(p.pre + '|' + p.n) || 0, p.q));
        readT.set(p.pre + '|' + p.T, Math.max(readT.get(p.pre + '|' + p.T) || 0, p.q));
      });
      if (readN.size) cand.forEach(c => {
        const qn = readN.get(idx.rowN[c.i]), qt = readT.get(idx.rowT[c.i]);
        if (qn) c.numEv = Math.max(c.numEv, 0.6 * qn);
        else if (qt) c.numEv = Math.max(c.numEv, 0.5 * qt);
      });
      const F = idx.F, list = [];
      cand.forEach(c => {
        const r = idx.rows[c.i], set = r[F.set], d = idx.date[set] || '';
        const nameEv = W.length ? nameEvOf(c.i) : 0;
        let score;
        if (c.numEv > 0) {
          const padOk = c.pad === null || c.pad === undefined ? 0 : (c.pad === (d >= PADDED_FROM) ? 0.03 : 0);
          score = 0.5 * c.numEv + 0.5 * nameEv + padOk;
        } else {
          const rec = Math.max(0, Math.min(1, ((+d.slice(0, 4) || 1999) - 1999) / 27));
          score = Math.min(0.5, 0.45 * nameEv + 0.05 * rec);
        }
        list.push({ i: c.i, id: r[F.id], score: Math.round(score * 1000) / 1000, numEv: c.numEv, nameEv: Math.round(nameEv * 1000) / 1000, date: d });
      });
      list.sort((a, b) => b.score - a.score || b.numEv - a.numEv || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      const top = [], ids = new Set();
      for (const c of list) { if (!ids.has(c.id)) { ids.add(c.id); top.push(c); } if (top.length === 5) break; }
      // Moins de 3 cartes et un nom sûr : les autres éditions du même nom, des plus récentes aux plus anciennes.
      if (top.length && top.length < 3 && top[0].nameEv >= 0.7) {
        idx.names[idx.rowName[top[0].i]].rows.map(i => ({ i: i, id: idx.rows[i][F.id], date: idx.date[idx.rows[i][F.set]] || '' }))
          .filter(c => !ids.has(c.id)).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3 - top.length)
          .forEach(c => { ids.add(c.id); top.push({ i: c.i, id: c.id, score: Math.round(top[0].score * 500) / 1000, numEv: 0, nameEv: top[0].nameEv, date: c.date }); });
      }
      // Indices affichés : numéro reconnu, nom de la carte en tête s'il a bien été lu, langue imprimée.
      const name = top.length && top[0].nameEv >= 0.6 ? idx.rows[top[0].i][F.name] : null;
      return { ev: { num: numText, name: name, lang: num.lang }, cands: top };
    }

    // ——— Lecture continue : quand s'arrêter ———
    // frames : résultats successifs (cands), le plus récent en dernier. Les indices s'additionnent sur les
    // 8 dernières lectures (poids 0,8 par lecture d'écart).
    //  - « auto » : carte nettement en tête (numéro et nom), déjà en tête à la lecture précédente ou très sûre ;
    //  - « ask » : après 6 lectures, assez d'indices pour proposer ;
    //  - « wait » : continuer.
    function decide(frames) {
      const last = frames.slice(-8), acc = new Map();
      last.forEach((f, k) => { const w = Math.pow(0.8, last.length - 1 - k); f.forEach(c => acc.set(c.id, (acc.get(c.id) || 0) + c.score * w)); });
      const order = [...acc.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
      const cur = frames[frames.length - 1] || [], top = cur[0], second = cur[1];
      const prev = frames.length > 1 ? frames[frames.length - 2][0] : null;
      if (top && top.score >= 0.85 && top.numEv >= 0.85 && top.nameEv >= 0.7 && (!second || top.score - second.score >= 0.12)
        && ((prev && prev.id === top.id) || top.score >= 0.93)) {
        return { state: 'auto', ids: [top.id].concat(order.filter(id => id !== top.id)).slice(0, 3) };
      }
      if (frames.length >= 6 && order.length && acc.get(order[0]) >= 1.2) return { state: 'ask', ids: order.slice(0, 3) };
      return { state: 'wait', ids: order.slice(0, 3) };
    }

    // ——— Géométrie ———
    // Cadre affiché (r, relatif à la vidéo à l'écran el) → rectangle dans les pixels de la vidéo v,
    // pour une vidéo affichée en « object-fit: cover ».
    function coverMap(el, v, r) {
      const s = Math.max(el.w / v.w, el.h / v.h), ox = (el.w - v.w * s) / 2, oy = (el.h - v.h * s) / 2;
      const x0 = Math.max(0, (r.x - ox) / s), y0 = Math.max(0, (r.y - oy) / s);
      const x1 = Math.min(v.w, (r.x + r.w - ox) / s), y1 = Math.min(v.h, (r.y + r.h - oy) / s);
      return { sx: x0, sy: y0, sw: Math.max(0, x1 - x0), sh: Math.max(0, y1 - y0) };
    }
    // Bande d'une carte (rect : rectangle de la carte dans l'image) et agrandissement pour ~36 px par caractère.
    function bandRect(rect, kind) {
      const b = BANDS[kind], h = rect.sh;
      return { x: rect.sx + rect.sw * b.x0, y: rect.sy + h * b.y0, w: rect.sw * (b.x1 - b.x0), h: h * (b.y1 - b.y0),
        scale: Math.max(b.min, Math.min(b.max, b.px / Math.max(1, b.cap * h))) };
    }

    // ——— Préparation d'une bande ———
    // img : { data (RGBA), width, height }. Niveaux de gris, contraste étiré (1 % – 99 %), inversion si le
    // texte est clair sur fond sombre (plus de 55 % de pixels sombres, seuil d'Otsu) ; opts.invert force le choix.
    function prep(img, opts) {
      const o = opts || {}, n = img.width * img.height, src = img.data, g = new Uint8Array(n), hist = new Uint32Array(256);
      for (let i = 0, j = 0; i < n; i++, j += 4) { const y = (299 * src[j] + 587 * src[j + 1] + 114 * src[j + 2]) / 1000 | 0; g[i] = y; hist[y]++; }
      let lo = 0, hi = 255, c = 0;
      for (; lo < 255 && (c += hist[lo]) < n * 0.01; lo++);
      c = 0;
      for (; hi > 0 && (c += hist[hi]) < n * 0.01; hi--);
      if (hi - lo < 16) { lo = 0; hi = 255; }
      // Seuil d'Otsu.
      let sum = 0, sumB = 0, wB = 0, best = -1, t = 128;
      for (let v = 0; v < 256; v++) sum += v * hist[v];
      for (let v = 0; v < 256; v++) {
        wB += hist[v];
        if (!wB) continue;
        const wF = n - wB;
        if (!wF) break;
        sumB += v * hist[v];
        const mB = sumB / wB, mF = (sum - sumB) / wF, between = wB * wF * (mB - mF) * (mB - mF);
        if (between > best) { best = between; t = v; }
      }
      let darkN = 0;
      for (let v = 0; v <= t; v++) darkN += hist[v];
      const dark = n ? darkN / n : 0, invert = typeof o.invert === 'boolean' ? o.invert : dark > 0.55;
      const out = new Uint8ClampedArray(n * 4), k = 255 / (hi - lo);
      for (let i = 0, j = 0; i < n; i++, j += 4) {
        let v = (g[i] - lo) * k;
        v = v < 0 ? 0 : v > 255 ? 255 : v;
        if (invert) v = 255 - v;
        out[j] = out[j + 1] = out[j + 2] = v; out[j + 3] = 255;
      }
      return { data: out, width: img.width, height: img.height, inverted: invert, dark: Math.round(dark * 100) / 100 };
    }

    return { BANDS: BANDS, fold: fold, skel: skel, lev: lev, index: index, parseNumber: parseNumber, parseName: parseName,
      match: match, decide: decide, coverMap: coverMap, bandRect: bandRect, prep: prep };
  })();
  // ——— Scan : lecture des bandes avec Tesseract.js, chargé à la première ouverture du scan ———
  // Tesseract.js 7 (Apache 2.0), son cœur WebAssembly et le modèle français « best_int » sont servis avec le site
  // (web/vendor/tesseract/7.0.0/, copiés par build.mjs depuis npm). Un seul worker, réutilisé. La lecture se fait
  // sur l'appareil : aucune image n'est envoyée.
  const ScanOcr = (function () {
    const DIR = 'vendor/tesseract/7.0.0/';
    // Test du SIMD de WebAssembly (le même que wasm-feature-detect) : cœur plus rapide s'il est pris en charge.
    const SIMD = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
    // Réglages par bande : numéro (texte épars, chiffres, majuscules et « / »), nom (bloc de texte).
    const PARAMS = {
      num: { tessedit_pageseg_mode: '11', tessedit_char_whitelist: '0123456789/ABCDEFGHIJKLMNOPQRSTUVWXYZ', user_defined_dpi: '300', preserve_interword_spaces: '1' },
      name: { tessedit_pageseg_mode: '6', tessedit_char_whitelist: '', user_defined_dpi: '300', preserve_interword_spaces: '1' }
    };
    const st = { ready: null, worker: null, mode: null, simd: null };
    const url = f => new URL(DIR + f, document.baseURI).href;
    // Taille d'une source d'image (vidéo, image, canevas, ImageBitmap).
    const dims = src => ({ w: src.videoWidth || src.naturalWidth || src.width || 0, h: src.videoHeight || src.naturalHeight || src.height || 0 });
    const script = src => new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = () => ok();
      s.onerror = () => ko(new Error('Chargement impossible : ' + src));
      document.head.appendChild(s);
    });
    const simd = () => { try { return typeof WebAssembly === 'object' && WebAssembly.validate(SIMD); } catch (e) { return false; } };
    // Worker prêt (une seule fois ; nouvel essai possible après un échec). progress(étape, 0 à 1).
    function start(progress) {
      if (st.ready) return st.ready;
      if (st.simd === null) st.simd = simd();
      const logger = m => { if (progress && m && typeof m.progress === 'number') progress(m.status, m.progress); };
      st.ready = (window.Tesseract ? Promise.resolve() : script(url('tesseract.min.js')))
        .then(() => window.Tesseract.createWorker('fra', 1, {
          workerPath: url('worker.min.js'),
          corePath: url(st.simd ? 'tesseract-core-simd-lstm.wasm.js' : 'tesseract-core-lstm.wasm.js'),
          langPath: url('lang'), gzip: true, cachePath: 'dropicards-ocr-fra-7', logger: logger
        }))
        .then(w => { st.worker = w; st.mode = null; return w; })
        .catch(e => { st.ready = null; st.worker = null; throw e; });
      return st.ready;
    }
    // Bande d'une carte découpée dans src (vidéo, image, canevas) ; rect : la carte en pixels de src.
    // Agrandie (~36 px par caractère), préparée (ScanCore.prep), entourée de blanc pour Tesseract. La découpe reste
    // dans l'image (Safari ne dessine rien si le rectangle source déborde) ; le reste de la bande est blanc.
    function band(src, rect, kind, opts) {
      const o = opts || {}, b = ScanCore.bandRect(rect, kind), k = b.scale * (o.zoom || 1), pad = 12, d = dims(src);
      const w = Math.max(8, Math.round(b.w * k)), h = Math.max(8, Math.round(b.h * k));
      const x0 = Math.max(0, b.x), y0 = Math.max(0, b.y), x1 = Math.min(d.w, b.x + b.w), y1 = Math.min(d.h, b.y + b.h);
      const c = document.createElement('canvas');
      c.width = w + 2 * pad; c.height = h + 2 * pad;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, c.width, c.height);
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      if (x1 - x0 >= 1 && y1 - y0 >= 1) g.drawImage(src, x0, y0, x1 - x0, y1 - y0, pad + (x0 - b.x) * k, pad + (y0 - b.y) * k, (x1 - x0) * k, (y1 - y0) * k);
      const p = ScanCore.prep(g.getImageData(pad, pad, w, h), { invert: o.invert });
      g.putImageData(new ImageData(p.data, w, h), pad, pad);
      return { canvas: c, inverted: p.inverted, dark: p.dark };
    }
    async function recognize(kind, canvas, psm) {
      const w = st.worker, mode = kind + (psm || '');
      if (st.mode !== mode) { await w.setParameters(Object.assign({}, PARAMS[kind], psm ? { tessedit_pageseg_mode: psm } : {})); st.mode = mode; }
      const r = await w.recognize(canvas);
      return { text: (r.data && r.data.text) || '', conf: (r.data && r.data.confidence) || 0 };
    }
    // Lecture d'une carte : le numéro, puis le nom. opts.invert : polarité forcée pour le numéro ;
    // opts.fine : seconde lecture du numéro dans l'autre polarité s'il manque ; opts.debug : bandes rendues.
    // Les lectures passent une par une (un seul worker) : la suivante attend la fin de la précédente.
    let queue = Promise.resolve();
    function read(src, rect, opts) {
      const job = queue.then(() => readNow(src, rect, opts));
      queue = job.catch(() => {});
      return job;
    }
    async function readNow(src, rect, opts) {
      const o = opts || {}, t0 = performance.now();
      await start();
      const nb = band(src, rect, 'num', { invert: o.invert });
      let num = await recognize('num', nb.canvas, o.psmNum), alt = null;
      if (o.fine && !/\d\s*\/\s*\d/.test(num.text)) {
        alt = band(src, rect, 'num', { invert: !nb.inverted });
        const r = await recognize('num', alt.canvas, o.psmNum);
        num = { text: num.text + '\n' + r.text, conf: Math.max(num.conf, r.conf) };
      }
      const t1 = performance.now(), nm = band(src, rect, 'name', {});
      const name = await recognize('name', nm.canvas, o.psmName);
      return {
        num: num.text, name: name.text, inverted: nb.inverted,
        ms: { num: Math.round(t1 - t0), name: Math.round(performance.now() - t1) },
        bands: o.debug ? [nb.canvas, alt && alt.canvas, nm.canvas].filter(Boolean) : null
      };
    }
    // Arrêt du worker (mémoire rendue) ; le prochain scan le relance.
    function stop() {
      const w = st.worker;
      st.worker = null; st.ready = null; st.mode = null;
      if (w) w.terminate().catch(() => {});
    }
    return { start: start, read: read, band: band, stop: stop, simd: () => (st.simd === null ? (st.simd = simd()) : st.simd) };
  })();
  // ——— Scan réel : caméra, lecture continue, propositions, ajout (calculs : scan-core.js ; lecture : scan-ocr.js) ———
  // L'écran Scan de la maquette était simulé (article tiré d'une liste de démo, confiance inventée). Ici :
  // - caméra arrière (getUserMedia) ; la vidéo est montée hors de Vue dans #pkm-scan-cam, comme la carte du Radar ;
  // - lecture continue : la zone du cadre est copiée, lue (ScanOcr), rapprochée du catalogue (ScanCore) ; les indices
  //   s'additionnent d'une lecture à l'autre (ScanCore.decide), puis « C'est laquelle ? » propose 3 cartes ;
  // - déclencheur : lecture fine ; « Prendre une photo » et « Importer une photo » : même lecture sur une photo ;
  // - la caméra s'arrête dès qu'on quitte l'écran ou l'app ; aucune image n'est envoyée ni gardée ;
  // - onglet Scellé : recherche parmi les vrais produits (sealed.json n'a pas de code-barres).
  // ?debug=scan affiche les bandes lues, le texte reconnu et les temps (réglages sur téléphone).
  const SCAN = {
    gen: 0, on: false, stream: null, video: null, starting: false, idx: null, frames: [], timer: 0, since: 0,
    miss: 0, inv: false, cool: new Map(), coolMsg: '', hasTorch: false, fine: false, back: null, ev: {}, stopWorker: 0,
    thumb: null, cvLoop: null, cvShot: null, debug: false, inst: null
  };
  try { SCAN.debug = /[?&]debug=scan(&|$)/.test(location.search); } catch (e) { /* adresse sans paramètres */ }
  const SCAN_PANELS = {
    denied: ['Caméra refusée', 'Autorise la caméra pour ce site dans les réglages du navigateur, puis réessaie. Tu peux aussi prendre une photo de la carte.', true],
    nocam: ['Pas de caméra disponible', 'Ce navigateur ne donne pas accès à la caméra (ordinateur, ou navigateur intégré d’une app). Prends une photo de la carte ou importe-la.', false],
    busy: ['Caméra occupée', 'Une autre app utilise la caméra. Ferme-la, puis réessaie.', true],
    error: ['La lecture n’a pas pu démarrer', 'La première fois, l’app télécharge son moteur de lecture (4,7 Mo). Vérifie ta connexion, puis réessaie.', true]
  };

  // Arrêt de la caméra : pistes coupées (le voyant s'éteint), vidéo retirée, lecture arrêtée.
  SCAN.stopCam = function () {
    SCAN.gen++;
    clearTimeout(SCAN.timer); SCAN.timer = 0;
    if (SCAN.stream) SCAN.stream.getTracks().forEach(t => { try { t.stop(); } catch (e) { /* déjà arrêtée */ } });
    SCAN.stream = null; SCAN.starting = false; SCAN.hasTorch = false;
    if (SCAN.video) { try { SCAN.video.srcObject = null; } catch (e) { /* rien */ } SCAN.video.remove(); SCAN.video = null; }
  };
  // La vidéo dans le conteneur affiché (Vue ne touche pas à son contenu).
  SCAN.attach = function () {
    const cam = document.getElementById('pkm-scan-cam');
    if (cam && SCAN.video && SCAN.video.parentNode !== cam) cam.insertBefore(SCAN.video, cam.firstChild);
  };
  // Caméra arrière, puis moteur de lecture et index du catalogue.
  SCAN.startCam = function (inst) {
    const gen = ++SCAN.gen, md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { inst.setState({ scanPhase: 'nocam' }); return; }
    SCAN.starting = true;
    md.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } }).then(stream => {
      if (gen !== SCAN.gen) { stream.getTracks().forEach(t => t.stop()); return; }
      SCAN.stream = stream; SCAN.starting = false; SCAN.back = null;
      if (inst.st().scanTorch) inst.setState({ scanTorch: false });
      const v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.setAttribute('autoplay', '');
      v.muted = true; v.playsInline = true;
      v.style.cssText = 'position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover';
      v.srcObject = stream;
      SCAN.video = v;
      SCAN.attach();
      const play = v.play();
      if (play && play.catch) play.catch(() => {});
      const track = stream.getVideoTracks()[0];
      try {
        const caps = track && track.getCapabilities ? track.getCapabilities() : {};
        SCAN.hasTorch = !!caps.torch;
        if (caps.focusMode && caps.focusMode.indexOf('continuous') >= 0) track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
      } catch (e) { SCAN.hasTorch = false; }
      if (track) track.addEventListener('ended', () => { if (gen === SCAN.gen) { SCAN.stopCam(); SCAN.sync(inst); } });
      SCAN.ready(inst, gen);
    }).catch(e => {
      if (gen !== SCAN.gen) return;
      SCAN.starting = false;
      const n = e && e.name;
      inst.setState({ scanPhase: /NotAllowed|Security|PermissionDenied/.test(n) ? 'denied' : /NotReadable|TrackStart|Abort/.test(n) ? 'busy' : 'nocam' });
    });
  };
  // Index du catalogue complet, construit une fois (le catalogue se charge au démarrage de l'app).
  SCAN.catalog = function () {
    if (SCAN.idx) return Promise.resolve(SCAN.idx);
    return new Promise((ok, ko) => {
      const t0 = Date.now(), wait = () => {
        if (TCG.status === 'ready' && TCG.doc) { SCAN.idx = ScanCore.index(TCG.doc); ok(SCAN.idx); } else if (TCG.status === 'error' || Date.now() - t0 > 30000) ko(new Error('Catalogue indisponible'));
        else setTimeout(wait, 250);
      };
      wait();
    });
  };
  // Moteur de lecture prêt (progression affichée la première fois), puis lecture continue.
  SCAN.ready = function (inst, gen) {
    let last = -5;
    // Au retour dans l'app, la caméra se rallume sans toucher aux propositions affichées.
    if (inst.st().scanPhase === 'idle') inst.setState({ scanPhase: 'loading', scanProg: 0 });
    ScanOcr.start((status, p) => {
      const k = /core/.test(status) ? 0.6 * p : /language|traineddata/.test(status) ? 0.6 + 0.3 * p : /initializ/.test(status) ? 0.9 + 0.1 * p : null;
      if (k === null || gen !== SCAN.gen) return;
      const pct = Math.round(k * 100);
      if (pct >= last + 5) { last = pct; inst.setState({ scanProg: pct }); }
    }).then(() => SCAN.catalog()).then(() => {
      if (gen !== SCAN.gen) return;
      SCAN.frames = []; SCAN.since = Date.now(); SCAN.miss = 0;
      if (inst.st().scanPhase === 'loading') inst.setState({ scanPhase: 'live', scanMsg: '' });
      SCAN.loop(inst, gen);
    }).catch(() => { if (gen === SCAN.gen) { SCAN.stopCam(); inst.setState({ scanPhase: 'error' }); } });
  };

  // Copie de la zone du cadre (en pixels de la vidéo) dans un canevas : la lecture travaille sur cette copie.
  SCAN.grab = function (which) {
    const v = SCAN.video, cam = document.getElementById('pkm-scan-cam'), fr = document.getElementById('pkm-scan-frame');
    if (!v || !cam || !fr || v.readyState < 2 || !v.videoWidth || !v.videoHeight) return null;
    const a = cam.getBoundingClientRect(), b = fr.getBoundingClientRect();
    const m = ScanCore.coverMap({ w: a.width, h: a.height }, { w: v.videoWidth, h: v.videoHeight }, { x: b.left - a.left, y: b.top - a.top, w: b.width, h: b.height });
    if (m.sw < 40 || m.sh < 40) return null;
    const c = SCAN[which] || (SCAN[which] = document.createElement('canvas'));
    c.width = Math.round(m.sw); c.height = Math.round(m.sh);
    c.getContext('2d', { willReadFrequently: true }).drawImage(v, m.sx, m.sy, m.sw, m.sh, 0, 0, c.width, c.height);
    return { canvas: c, rect: { sx: 0, sy: 0, sw: c.width, sh: c.height } };
  };
  // Image à ne pas lire : carte en mouvement, ou grand reflet sur le bas de la carte (là où est le numéro).
  // Le cadre ne bouge jamais à l'écran (hauteur du message d'état réservée) : un écart vient donc de la caméra.
  SCAN.gate = function (shot) {
    const c = shot.canvas, w = 120, h = 24, t = SCAN.thumb || (SCAN.thumb = document.createElement('canvas'));
    t.width = w; t.height = h;
    const g = t.getContext('2d', { willReadFrequently: true });
    g.drawImage(c, 0, c.height * 0.86, c.width, c.height * 0.14, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data, cur = new Uint8Array(w * h);
    let bright = 0, diff = 0;
    for (let i = 0, j = 0; i < w * h; i++, j += 4) { const y = (299 * d[j] + 587 * d[j + 1] + 114 * d[j + 2]) / 1000 | 0; cur[i] = y; if (y >= 250) bright++; }
    const prev = SCAN.prevThumb;
    if (prev) { for (let i = 0; i < cur.length; i++) diff += Math.abs(cur[i] - prev[i]); diff /= cur.length; }
    SCAN.prevThumb = cur;
    if (prev && diff > 32) return 'Tiens le téléphone immobile';
    if (bright / cur.length > 0.25) return 'Reflet sur la carte : incline-la un peu';
    return null;
  };
  // Lecture continue : une lecture à la fois, environ une à deux par seconde ; en pause sous les propositions et la fiche.
  SCAN.loop = function (inst, gen) {
    clearTimeout(SCAN.timer);
    const step = () => {
      if (gen !== SCAN.gen) return;
      const s = inst.st();
      if (s.screen !== 'scan' || s.scanPhase !== 'live' || s.scanSheet || s.sheet || document.hidden || SCAN.fine) { SCAN.timer = setTimeout(step, 400); return; }
      const t0 = Date.now(), shot = SCAN.grab('cvLoop');
      if (!shot) { SCAN.timer = setTimeout(step, 300); return; }
      const hint = SCAN.gate(shot);
      if (hint) { SCAN.say(inst, hint); SCAN.timer = setTimeout(step, 350); return; }
      // Polarité : celle choisie par l'image, puis l'inverse une fois sur deux tant que rien n'est lu.
      const invert = SCAN.miss % 2 === 1 ? !SCAN.inv : undefined;
      ScanOcr.read(shot.canvas, shot.rect, { invert: invert, debug: SCAN.debug }).then(read => {
        if (gen !== SCAN.gen) return;
        if (inst.st().scanPhase === 'live') SCAN.consider(inst, read, false);
        SCAN.timer = setTimeout(step, Math.max(150, 650 - (Date.now() - t0)));
      }).catch(() => { if (gen === SCAN.gen) SCAN.timer = setTimeout(step, 1000); });
    };
    step();
  };
  // Une lecture → indices, puis propositions si une carte domine (ou tout de suite pour une lecture fine).
  SCAN.consider = function (inst, read, fine) {
    const m = ScanCore.match(SCAN.idx, read), now = Date.now();
    if (!fine) { SCAN.inv = read.inverted; SCAN.miss = m.ev.num ? 0 : SCAN.miss + 1; }
    // La carte vue en tête vient d'être ajoutée (ou écartée) : rien à proposer tant qu'elle reste devant la caméra,
    // pendant quelques secondes (ses voisines du même numéro ne prennent pas sa place).
    if (!fine && m.cands.length && SCAN.cool.get(m.cands[0].id) > now) { SCAN.frames = []; SCAN.say(inst, SCAN.coolMsg); return false; }
    const cands = fine ? m.cands : m.cands.filter(c => !(SCAN.cool.get(c.id) > now));
    ['num', 'name', 'lang'].forEach(k => { if (m.ev[k]) SCAN.ev[k] = m.ev[k]; });
    if (SCAN.debug) SCAN.showDebug(read, m);
    SCAN.frames.push(cands);
    if (SCAN.frames.length > 12) SCAN.frames.shift();
    const d = fine ? { state: cands.length ? 'ask' : 'wait', ids: cands.map(c => c.id) } : ScanCore.decide(SCAN.frames);
    if (d.state !== 'wait' && d.ids.length) {
      const ids = d.ids.concat(cands.map(c => c.id).filter(id => d.ids.indexOf(id) < 0)).slice(0, 3);
      SCAN.frames = [];
      try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) { /* pas de vibreur */ }
      inst.setState({ scanPhase: 'pick', scanCands: ids, scanEv: Object.assign({}, SCAN.ev), scanMsg: '' });
      return true;
    }
    const parts = [m.ev.num ? 'n° ' + m.ev.num : '', m.ev.name || ''].filter(Boolean);
    SCAN.say(inst, parts.length ? 'Lu : ' + parts.join(' · ') : now - SCAN.since > 12000 ? 'Toujours rien : rapproche la carte, ou appuie sur le déclencheur' : 'Lecture en cours…');
    return false;
  };
  SCAN.say = function (inst, msg) { if (inst.st().scanMsg !== msg) inst.setState({ scanMsg: msg }); };
  // Déclencheur : lecture fine de l'image en cours (deux polarités pour le numéro), propositions même si la carte
  // ne domine pas encore.
  SCAN.shutter = function (inst) {
    if (SCAN.fine || inst.st().scanPhase !== 'live' || !SCAN.idx) return;
    const shot = SCAN.grab('cvShot');
    if (!shot) return;
    SCAN.fine = true;
    SCAN.say(inst, 'Lecture fine…');
    ScanOcr.read(shot.canvas, shot.rect, { fine: true, debug: SCAN.debug }).then(read => {
      SCAN.fine = false;
      if (inst.st().scanPhase === 'live' && !SCAN.consider(inst, read, true)) SCAN.say(inst, 'Rien de lisible : rapproche la carte, évite les reflets, ou prends une photo');
    }).catch(() => { SCAN.fine = false; });
  };
  // Photo prise ou importée : pas de cadre ; on lit la carte au centre (format 63 × 88), puis toute la photo.
  SCAN.photo = function (inst, file) {
    const s = inst.st();
    if (!file || s.scanPhase === 'photo') return;
    SCAN.back = ['denied', 'nocam', 'busy', 'error'].indexOf(s.scanPhase) >= 0 ? s.scanPhase : 'live';
    inst.setState({ scanPhase: 'photo', scanMsg: 'Lecture de la photo…', scanCands: [], scanPid: null });
    const url = URL.createObjectURL(file), img = new Image();
    const fail = msg => { URL.revokeObjectURL(url); inst.setState({ scanPhase: SCAN.back, scanMsg: msg }); };
    img.onerror = () => fail('Photo illisible : essaie une photo en JPEG');
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight, k = Math.min(W * 0.92 / 0.716, H * 0.92);
      const center = { sx: (W - k * 0.716) / 2, sy: (H - k) / 2, sw: k * 0.716, sh: k };
      Promise.all([ScanOcr.start(), SCAN.catalog()])
        .then(() => ScanOcr.read(img, center, { fine: true, debug: SCAN.debug }))
        .then(a => ScanOcr.read(img, { sx: 0, sy: 0, sw: W, sh: H }, { fine: true }).then(b => ({ num: a.num + '\n' + b.num, name: a.name + '\n' + b.name, inverted: a.inverted, ms: a.ms, bands: a.bands })))
        .then(read => {
          URL.revokeObjectURL(url);
          SCAN.ev = {};
          if (inst.st().scanPhase !== 'photo') return;
          inst.setState({ scanPhase: SCAN.back });
          if (!SCAN.consider(inst, read, true)) inst.setState({ scanMsg: 'Rien de lisible sur la photo : cadre la carte en entier, sans reflet' });
        })
        .catch(() => fail('La lecture n’a pas pu démarrer : vérifie ta connexion'));
    };
    img.src = url;
  };
  SCAN.setTorch = function (inst, on) {
    const t = SCAN.stream && SCAN.stream.getVideoTracks()[0];
    if (!t || !SCAN.hasTorch) return;
    t.applyConstraints({ advanced: [{ torch: on }] }).then(() => inst.setState({ scanTorch: on })).catch(() => {});
  };
  // Mode diagnostic (?debug=scan) : bandes lues, texte reconnu, temps, cartes proposées.
  SCAN.showDebug = function (read, m) {
    const cam = document.getElementById('pkm-scan-cam');
    if (!cam) return;
    let box = document.getElementById('pkm-scan-debug');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pkm-scan-debug';
      box.style.cssText = 'position: absolute; left: 6px; right: 6px; top: 70px; z-index: 2; max-height: 45%; overflow: auto; padding: 6px; border-radius: 8px; background: rgba(0, 0, 0, 0.72); color: #FFFFFF; font: 11px/1.35 monospace; white-space: pre-wrap';
      cam.appendChild(box);
    }
    box.textContent = 'numéro : ' + JSON.stringify(read.num.trim()) + '\nnom : ' + JSON.stringify(read.name.trim()) + '\ntemps : ' + read.ms.num + ' + ' + read.ms.name + ' ms · inversé : ' + read.inverted
      + '\n→ ' + (m.cands.slice(0, 3).map(c => c.id + ' ' + c.score).join(' | ') || 'rien');
    (read.bands || []).forEach(c => { c.style.cssText = 'display: block; max-width: 100%; margin-top: 4px; background: #FFFFFF'; box.appendChild(c); });
  };

  // Après chaque affichage : caméra allumée sur l'écran Scan (onglet Carte, app visible), éteinte ailleurs.
  SCAN.sync = function (inst) {
    SCAN.inst = inst;
    const s = inst.st();
    if (s.screen !== 'scan') {
      if (SCAN.on) {
        SCAN.on = false;
        SCAN.stopCam();
        SCAN.frames = []; SCAN.ev = {};
        // Moteur de lecture libéré deux minutes après la sortie de l'écran.
        clearTimeout(SCAN.stopWorker);
        SCAN.stopWorker = setTimeout(() => { if (!SCAN.on) ScanOcr.stop(); }, 120000);
        if (s.scanPhase !== 'idle' || s.scanPid) inst.setState({ scanPhase: 'idle', scanCands: [], scanPid: null, scanEv: null, scanMsg: '' });
      }
      return;
    }
    if (!SCAN.on) { SCAN.on = true; clearTimeout(SCAN.stopWorker); }
    // Pas de caméra pour l'onglet Scellé, ni sur un panneau (refus, absence…), ni pendant la lecture d'une photo
    // importée depuis un panneau et ses propositions.
    const fromPanel = !!SCAN_PANELS[SCAN.back] && (s.scanPhase === 'photo' || s.scanPhase === 'pick');
    const want = s.scanMode !== 'sealed' && !document.hidden && !SCAN_PANELS[s.scanPhase] && !fromPanel;
    if (want && !SCAN.stream && !SCAN.starting) SCAN.startCam(inst);
    else if (!want && (SCAN.stream || SCAN.starting)) SCAN.stopCam();
    SCAN.attach();
  };
  document.addEventListener('visibilitychange', () => {
    if (!SCAN.inst || !SCAN.on) return;
    if (document.hidden) SCAN.stopCam(); else SCAN.sync(SCAN.inst);
  });
  window.addEventListener('pagehide', () => SCAN.stopCam());

  const scanProto = Component.prototype;
  const baseScanSt = scanProto.st;
  scanProto.st = function () {
    const d = baseScanSt.call(this);
    if (d.scanPhase === undefined) d.scanPhase = 'idle';
    if (d.scanCands === undefined) d.scanCands = [];
    if (d.scanQ === undefined) d.scanQ = '';
    return d;
  };
  // Carte choisie (dans le catalogue de l'app grâce à « extra ») ; sinon l'article de démo de la maquette, pour que
  // la fiche résultat, calculée sur tous les écrans, vise toujours un article connu.
  const baseScanTarget = scanProto.scanTarget;
  scanProto.scanTarget = function (s) {
    const id = s.scanPid;
    return id && (s.extra || []).indexOf(id) >= 0 && TCG.item(id) ? id : baseScanTarget.call(this, s);
  };
  // Choix d'une proposition (ou d'un produit scellé) : fiche résultat, langue préremplie (« EN » lu sur la carte,
  // ou extension sans version française).
  scanProto.scanPick = function (id) {
    const s = this.st(), p = TCG.item(id);
    if (!p) return;
    const extra = (s.extra || []).indexOf(id) >= 0 ? s.extra : (s.extra || []).concat([id]), ev = s.scanEv || {};
    const lang = ev.lang === 'EN' || p.lang === 'EN' ? 'EN' : 'FR';
    this.setState({ extra: extra, scanPid: id, scanSheet: true, sheet: null, sf: Object.assign(this.scanFormSeed(), { lang: lang }) });
  };
  const baseOpenScan = scanProto.openScan;
  scanProto.openScan = function () {
    const was = this.st().screen === 'scan';
    baseOpenScan.call(this);
    if (!was) this.setState({ scanPhase: 'idle', scanCands: [], scanPid: null, scanEv: null, scanMsg: '', scanMode: 'card', scanAdded: 0 });
  };
  // Recherche du Marché, préremplie avec ce qui a été lu.
  scanProto.scanSearch = function (q) {
    this.setState({ mq: q || '', mfilter: 'trend', scanSheet: false });
    this.tab('market');
  };

  const SCAN_OFF = { modeCard: false, modeSealed: false, picking: false, cands: [], sealedRows: [] };
  scanProto.vScan = function (x) {
    const s = x.s;
    if (s.screen !== 'scan') return SCAN_OFF;
    const sealed = s.scanMode === 'sealed', ph = s.scanPhase, panel = SCAN_PANELS[ph], live = ph === 'live';
    const on = 'var(--pkm-accent)', onFg = 'var(--pkm-on-accent)', off = 'transparent', offFg = 'var(--pkm-t2)';
    const clickInput = id => () => { const el = document.getElementById(id); if (el) { el.value = ''; el.click(); } };
    const status = ph === 'idle' ? 'Ouverture de la caméra…'
      : ph === 'loading' ? 'Préparation de la lecture… ' + (s.scanProg || 0) + ' % (une seule fois)'
        : ph === 'photo' ? 'Lecture de la photo…'
          : panel ? s.scanMsg || ''
            : s.scanMsg || 'Lecture en cours…';
    const n = s.scanAdded || 0, ev = s.scanEv || {};
    const r = {
      close: () => this.pop(),
      modeCard: !sealed, modeSealed: sealed,
      cardBg: sealed ? off : on, cardFg: sealed ? offFg : onFg, sealedBg: sealed ? on : off, sealedFg: sealed ? onFg : offFg,
      toCard: () => this.setState({ scanMode: 'card', scanPhase: SCAN_PANELS[ph] ? ph : 'idle', scanCands: [], scanPid: null, scanSheet: false }),
      toSealed: () => this.setState({ scanMode: 'sealed', scanCands: [], scanPid: null, scanSheet: false }),
      hasTorch: !sealed && SCAN.hasTorch && !panel, noTorch: sealed || !SCAN.hasTorch || !!panel,
      torchOn: !!s.scanTorch, torchLabel: s.scanTorch ? 'Éteindre la lampe' : 'Allumer la lampe',
      torchBg: s.scanTorch ? 'var(--pkm-accent)' : 'rgba(var(--pkm-ink-rgb), 0.66)', torchFg: s.scanTorch ? 'var(--pkm-on-accent)' : 'var(--pkm-white)',
      torch: () => SCAN.setTorch(this, !s.scanTorch),
      showFrame: !panel, hasPanel: !!panel, panelTitle: panel ? panel[0] : '', panelText: panel ? panel[1] : '', panelRetry: !!(panel && panel[2]),
      retryCam: () => this.setState({ scanPhase: 'idle', scanMsg: '' }),
      hint: 'Place la carte dans le cadre, bien à plat',
      reading: live || ph === 'photo',
      status: status, hasStatus: !panel || !!s.scanMsg, dot: panel ? 'var(--pkm-orange)' : live ? 'var(--pkm-green)' : 'var(--pkm-t3)',
      count: n > 0 ? n + (n > 1 ? ' articles ajoutés depuis l’ouverture' : ' article ajouté depuis l’ouverture') : 'Lecture sur ton téléphone : aucune image n’est envoyée',
      shutter: () => SCAN.shutter(this), shutterLabel: 'Lecture fine de la carte', shutterOff: !live, shutterOp: live ? '1' : '0.45',
      takePhoto: clickInput('pkm-scan-photo'), importPhoto: clickInput('pkm-scan-file'),
      onFile: e => SCAN.photo(this, e && e.target && e.target.files && e.target.files[0]),
      search: () => this.scanSearch(ev.name || ''),
      // Propositions.
      picking: ph === 'pick' && !s.scanSheet && (s.scanCands || []).length > 0, cands: [],
      evText: [ev.num ? 'n° ' + ev.num : '', ev.name ? '« ' + ev.name + ' »' : ''].filter(Boolean).length
        ? 'Lu sur la carte : ' + [ev.num ? 'n° ' + ev.num : '', ev.name ? '« ' + ev.name + ' »' : ''].filter(Boolean).join(' · ')
        : 'Touche la bonne carte pour l’ajouter.',
      none: () => this.scanSearch(ev.name || ''),
      retry: () => {
        const t = Date.now() + 8000;
        (s.scanCands || []).forEach(id => SCAN.cool.set(id, t));
        SCAN.coolMsg = 'Replace la carte dans le cadre, bien à plat, sans reflet';
        SCAN.frames = []; SCAN.ev = {}; SCAN.since = Date.now();
        this.setState({ scanPhase: SCAN_PANELS[SCAN.back] ? SCAN.back : 'live', scanCands: [], scanEv: null, scanMsg: '' });
      },
      // Onglet Scellé.
      sealedIntro: 'Les produits scellés n’ont pas encore de code-barres dans nos données : cherche le tien, il s’ajoute en deux appuis.',
      sq: s.scanQ, onSq: e => this.setState({ scanQ: e.target.value }), sealedRows: [], sealedCount: ''
    };
    if (r.picking) {
      r.cands = s.scanCands.map(id => TCG.item(id)).filter(Boolean).map((p, i) => {
        const k = this.cote(p), q = x.c.stock[p.id] ? x.c.stock[p.id].qty : 0;
        return {
          name: p.name, sub: [p.setName, p.numLabel].filter(Boolean).join(' · ') + (p.lang === 'EN' ? ' · EN' : ''),
          cote: k !== null && k !== undefined ? 'Cote ' + this.eur(k) : 'Pas encore de cote',
          img: p.img, fallback: p.fallback, best: i === 0, hasOwned: q > 0, owned: 'à toi ×' + q,
          bc: i === 0 ? 'var(--pkm-accent)' : 'var(--pkm-line-2)', bg: i === 0 ? 'rgba(var(--pkm-accent-rgb), 0.1)' : 'transparent',
          aria: p.name + ', ' + [p.setName, p.numLabel].filter(Boolean).join(', ') + (i === 0 ? ', le plus probable' : ''),
          pick: () => this.scanPick(p.id)
        };
      });
    }
    if (sealed) {
      const q = String(s.scanQ || '').trim(), list = SEALED.status !== 'ready' ? [] : q.length >= 2 ? SEALED.search(q) : SEALED.list();
      r.sealedCount = SEALED.status !== 'ready' ? 'Chargement des produits…' : q.length >= 2 ? list.length + (list.length > 1 ? ' produits' : ' produit') + ' pour « ' + q + ' »'
        : list.length + ' produits sortis en France · du plus récent au plus ancien';
      // Visuel : la photo officielle, sinon le logo de l'extension, sinon la plaque dessinée (look, data-broken).
      r.sealedRows = list.slice(0, 40).map(p => {
        const k = this.cote(p), l = this.look(p);
        return { name: p.name, sub: p.sub, pic: l.hasPhoto ? l.photo : l.logo, fit: l.hasPhoto ? 'cover' : 'contain',
          cote: k !== null && k !== undefined ? this.eur(k) : '—', pick: () => this.scanPick(p.id) };
      });
    }
    return r;
  };
  // Fiche résultat : ce qui a été lu, et « Ce n'est pas le bon article ? » revient aux propositions.
  const baseScanSheet = scanProto.vScanResult;
  scanProto.vScanResult = function (x) {
    const r = baseScanSheet.call(this, x), s = x.s;
    if (!s.scanPid || this.scanTarget(s) !== s.scanPid) return r;
    const p = TCG.item(s.scanPid), ev = s.scanEv || {}, parts = [ev.num ? 'n° ' + ev.num : '', ev.name ? '« ' + ev.name + ' »' : ''].filter(Boolean);
    r.conf = p && p.type === 'sealed' ? 'Choisi dans la liste des produits scellés' : parts.length ? 'Lu sur la carte : ' + parts.join(' · ') + ' · vérifie le nom et le numéro' : 'Choisie dans les propositions';
    r.wrong = () => this.setState({ scanSheet: false, scanPid: null, scanPhase: (s.scanCands || []).length ? 'pick' : s.scanPhase });
    return r;
  };
  // Après l'ajout : retour à la caméra pour la carte suivante ; la même carte n'est pas reproposée tout de suite.
  const baseSaveScan = scanProto.saveScan;
  scanProto.saveScan = function () {
    const s = this.st(), pid = s.scanPid && this.scanTarget(s) === s.scanPid ? s.scanPid : null;
    baseSaveScan.call(this);
    if (!pid) return;
    SCAN.cool.set(pid, Date.now() + 8000);
    SCAN.coolMsg = 'Carte ajoutée : place la suivante dans le cadre';
    SCAN.frames = []; SCAN.ev = {}; SCAN.since = Date.now();
    this.setState({ scanPid: null, scanCands: [], scanEv: null, scanMsg: '', scanAdded: (s.scanAdded || 0) + 1,
      scanPhase: s.scanMode === 'sealed' ? s.scanPhase : SCAN_PANELS[SCAN.back] ? SCAN.back : 'live' });
  };
  const baseScanRender = scanProto.renderVals;
  scanProto.renderVals = function () {
    const r = baseScanRender.call(this);
    setTimeout(() => SCAN.sync(this), 0);
    return r;
  };
  // ——— Exemplaires : langue et état de chaque ajout ———
  // La maquette n'enregistrait que l'article et la quantité de chaque ajout (lignes { pid, qty }) : la langue et l'état
  // choisis dans la fiche du scan étaient perdus. Chaque ligne d'achat garde désormais sa langue (FR, JP, EN) et son
  // état (cartes : Near Mint, Excellent, Joué ; scellé : Scellé d'origine, Boîte abîmée), choisis au scan ou dans
  // « Ajout », et enregistrés sur l'appareil avec le reste. Les ajouts plus anciens comptent comme FR et Near Mint (ou
  // Scellé d'origine). La cote ne dépend pas encore de l'état ; à la vente, on ne choisit pas encore l'exemplaire.
  const COPY = {
    langs: ['FR', 'JP', 'EN'],
    conds: { card: [['NM', 'Near Mint'], ['EX', 'Excellent'], ['PL', 'Joué']], sealed: [['SO', 'Scellé d’origine'], ['AB', 'Boîte abîmée']] }
  };
  const copyConds = p => COPY.conds[p && p.type === 'sealed' ? 'sealed' : 'card'];
  const copyCode = (p, i) => { const l = copyConds(p); return (l[i] || l[0])[0]; };
  const copyLabel = (p, code) => { const l = copyConds(p), f = l.find(c => c[0] === code); return (f || l[0])[1]; };
  // Sous-titre d'un article sans sa langue ni son état (« Ultra rare · FR · Near Mint » → « Ultra rare »).
  const copyBase = sub => String(sub || '').replace(/ · (FR|EN|JP)( · (Near Mint|Excellent|Joué))?$/, '');
  // Exemplaires ajoutés d'un article, par langue et état, du groupe le plus nombreux au moins nombreux.
  function copiesOf(purchases, p) {
    const g = new Map();
    (purchases || []).forEach(a => (a.lines || []).forEach(l => {
      if (l.pid !== p.id) return;
      const k = (l.lang || 'FR') + '|' + (l.cond || copyConds(p)[0][0]);
      g.set(k, (g.get(k) || 0) + (l.qty || 0));
    }));
    return [...g.entries()].map(([k, qty]) => { const [lang, cond] = k.split('|'); return { lang: lang, cond: cond, label: copyLabel(p, cond), qty: qty }; })
      .sort((a, b) => b.qty - a.qty);
  }
  const copyProto = Component.prototype;
  // Liste « Ma collection » et grille de la Collection : « FR · Near Mint », ou « FR, EN · 2 états ».
  copyProto.copySub = function (p, s) {
    const g = copiesOf(s.purchases, p);
    if (!g.length) return p.sub;
    const langs = [...new Set(g.map(c => c.lang))], conds = [...new Set(g.map(c => c.cond))];
    return copyBase(p.sub) + ' · ' + langs.join(', ') + ' · ' + (conds.length > 1 ? conds.length + ' états' : g[0].label);
  };
  // Historique d'achat de la fiche : langue et état de la ligne.
  copyProto.copyMeta = function (p, l) { return l ? ' · ' + (l.lang || 'FR') + ' · ' + copyLabel(p, l.cond) : ''; };

  // Enregistrement : la ligne ajoutée reçoit la langue et l'état préparés par saveScan ou saveBuy.
  const baseCopyRecord = copyProto.addRecord;
  copyProto.addRecord = function (s, pid, qty, price, where, by) {
    const r = baseCopyRecord.call(this, s, pid, qty, price, where, by), meta = this.__copy;
    if (meta) {
      const rec = r.purchases[r.purchases.length - 1];
      rec.lines = rec.lines.map(l => (l.pid === pid ? Object.assign({}, l, meta) : l));
    }
    return r;
  };
  const copyItemOf = (inst, id) => inst.catalog().find(q => q.id === id);
  const baseCopySaveScan = copyProto.saveScan;
  copyProto.saveScan = function () {
    const s = this.st(), sf = s.sf || {};
    this.__copy = { lang: sf.lang || 'FR', cond: copyCode(copyItemOf(this, this.scanTarget(s)), sf.cond || 0) };
    try { baseCopySaveScan.call(this); } finally { this.__copy = null; }
  };
  const baseCopySaveBuy = copyProto.saveBuy;
  copyProto.saveBuy = function () {
    const s = this.st(), f = s.f || {};
    this.__copy = { lang: f.lang || 'FR', cond: copyCode(copyItemOf(this, f.pid), f.cond || 0) };
    try { baseCopySaveBuy.call(this); } finally { this.__copy = null; }
  };
  const baseCopySeed = copyProto.formSeed;
  copyProto.formSeed = function (p) { return Object.assign(baseCopySeed.call(this, p), { lang: 'FR', cond: 0 }); };

  // Formulaire « Ajout » : langue et état, comme dans la fiche du scan.
  const baseCopySheet = copyProto.vSheet;
  copyProto.vSheet = function (x) {
    const sh = baseCopySheet.call(this, x), f = x.s.f || {};
    if (!sh.isBuy) return Object.assign(sh, { showCopy: false, copyLangs: [], copyConds: [] });
    const lang = f.lang || 'FR', list = copyConds(x.P[f.pid]), ci = Math.min(f.cond || 0, list.length - 1);
    return Object.assign(sh, {
      showCopy: true,
      copyLangs: COPY.langs.map(l => Object.assign({ label: l, on: lang === l, pick: () => this.setF({ lang: l }) }, this.chip(lang === l))),
      copyConds: list.map((c, i) => Object.assign({ label: c[1], on: ci === i, pick: () => this.setF({ cond: i }) }, this.chip(ci === i)))
    });
  };
  // Fiche : résumé des exemplaires ajoutés ; drapeau de la langue la plus présente.
  const baseCopyItem = copyProto.vItem;
  copyProto.vItem = function (x) {
    const it = baseCopyItem.call(this, x), p = x.P[x.s.itemId] || x.cat[0];
    const g = p ? copiesOf(x.s.purchases, p) : [];
    it.copyText = g.length ? 'Tes ajouts : ' + g.map(c => c.qty + ' × ' + c.lang + ' · ' + c.label).join(', ') : '';
    if (g.length) it.flag = this.flag(g[0].lang);
    return it;
  };
  // Carte du territoire : repères placés en pourcentage pour suivre la largeur de l'écran.
  const vTerritory = Component.prototype.vTerritory;
  Component.prototype.vTerritory = function (x) {
    const r = vTerritory.call(this, x);
    r.pins.forEach(p => {
      const cx = parseFloat(p.left) + 22, cy = parseFloat(p.top) + 22;
      p.text = p.text.replace(' %', ' %');
      p.left = 'calc(' + (cx / 358 * 100).toFixed(2) + '% - 22px)';
      p.top = 'calc(' + (cy / 210 * 100).toFixed(2) + '% - 22px)';
    });
    return r;
  };
  const render = (function () {
const { createElementVNode: _createElementVNode, createTextVNode: _createTextVNode, normalizeStyle: _normalizeStyle, openBlock: _openBlock, createElementBlock: _createElementBlock, createCommentVNode: _createCommentVNode, toDisplayString: _toDisplayString, renderList: _renderList, Fragment: _Fragment, createStaticVNode: _createStaticVNode } = Vue

const _hoisted_1 = {
  class: "pkm-root",
  style: {"width":"100%","height":"100%","box-sizing":"border-box","position":"relative","overflow":"hidden","display":"flex","flex-direction":"column","background":"var(--pkm-app)","color":"var(--pkm-t1)","font-family":"'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif","font-size":"15px","line-height":"1.4"}
}
const _hoisted_2 = {
  key: 0,
  style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1fr) auto minmax(0, 1fr)","align-items":"center","gap":"8px","padding":"14px 16px 8px"}
}
const _hoisted_3 = ["onClick", "aria-label"]
const _hoisted_4 = ["src"]
const _hoisted_5 = {
  key: 1,
  style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","gap":"12px","padding":"18px 16px 8px"}
}
const _hoisted_6 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"32px","line-height":"1.1","font-weight":"700","letter-spacing":"-0.03em"} }
const _hoisted_7 = ["onClick", "aria-label"]
const _hoisted_8 = ["src"]
const _hoisted_9 = {
  key: 2,
  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"14px 16px 8px"}
}
const _hoisted_10 = ["onClick"]
const _hoisted_11 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_12 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_13 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"20px","line-height":"1.2","font-weight":"600","letter-spacing":"-0.02em","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_14 = {
  key: 0,
  style: {"font-size":"13px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"}
}
const _hoisted_15 = {
  key: 3,
  style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","gap":"8px","min-height":"22px","padding":"0 16px 8px","font-size":"12.5px","color":"var(--pkm-t4)"}
}
const _hoisted_16 = {
  key: 0,
  style: {"flex":"none","padding":"3px 10px","border-radius":"999px","background":"rgba(var(--pkm-accent-rgb), 0.14)","color":"var(--pkm-link)","font-size":"12px","font-weight":"700"}
}
const _hoisted_17 = { style: {"flex":"1","min-height":"0","overflow-y":"auto","scrollbar-width":"none","padding":"4px 16px 118px","box-sizing":"border-box","display":"flex","flex-direction":"column","gap":"14px"} }
const _hoisted_18 = {
  "aria-label": "Recherche dans le catalogue",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"}
}
const _hoisted_19 = {
  class: "pkm-dark",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"52px","padding":"0 4px 0 16px","border-radius":"999px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_20 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t3)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_21 = ["value", "onInput"]
const _hoisted_22 = ["onClick"]
const _hoisted_23 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_24 = {
  role: "status",
  style: {"flex":"none","padding":"0 6px","font-size":"12.5px","color":"var(--pkm-t4)"}
}
const _hoisted_25 = {
  key: 0,
  class: "pkm-dark",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_26 = ["onClick"]
const _hoisted_27 = ["src", "data-fallback"]
const _hoisted_28 = ["src"]
const _hoisted_29 = ["src"]
const _hoisted_30 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_31 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_32 = { style: {"display":"flex","align-items":"center","gap":"6px","min-width":"0","font-size":"12px","color":"var(--pkm-t3)"} }
const _hoisted_33 = { style: {"white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_34 = {
  key: 0,
  style: {"flex":"none","padding":"1px 7px","border-radius":"999px","background":"rgba(var(--pkm-accent-rgb), 0.14)","color":"var(--pkm-link)","font-size":"11px","font-weight":"700"}
}
const _hoisted_35 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"1px"} }
const _hoisted_36 = { style: {"font-size":"15px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_37 = ["onClick"]
const _hoisted_38 = {
  class: "pkm-dark",
  "aria-label": "Valeur de ma collection",
  style: {"flex":"none","container-type":"inline-size","padding":"16px 18px 14px","border-radius":"24px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 85% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.26), rgba(var(--pkm-glow-rgb), 0) 62%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
}
const _hoisted_39 = { style: {"display":"flex","align-items":"flex-start","gap":"10px"} }
const _hoisted_40 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_41 = { style: {"display":"flex","align-items":"center","gap":"2px","font-size":"14px","font-weight":"600","color":"var(--pkm-t2)"} }
const _hoisted_42 = ["onClick", "aria-label", "aria-pressed"]
const _hoisted_43 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_44 = ["d"]
const _hoisted_45 = { style: {"font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_46 = ["onClick", "aria-label"]
const _hoisted_47 = ["src"]
const _hoisted_48 = {
  "aria-hidden": "true",
  style: {"position":"absolute","right":"2px","bottom":"2px","width":"26px","height":"26px","border-radius":"13px","background":"var(--pkm-logo)","color":"var(--pkm-ink)","display":"flex","align-items":"center","justify-content":"center"}
}
const _hoisted_49 = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_50 = ["aria-label"]
const _hoisted_51 = ["d"]
const _hoisted_52 = ["d"]
const _hoisted_53 = { style: {"font-size":"11.5px","line-height":"1.35","color":"var(--pkm-t4)"} }
const _hoisted_54 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"12px","margin-top":"4px","padding-top":"10px","border-top":"1px solid rgba(var(--pkm-hl-rgb), 0.08)"} }
const _hoisted_55 = { style: {"font-size":"11.5px","line-height":"1.35","color":"var(--pkm-t4)"} }
const _hoisted_56 = {
  key: 0,
  style: {"font-size":"12px","color":"var(--pkm-orange)"}
}
const _hoisted_57 = {
  "aria-label": "Mon classeur",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_58 = {
  class: "pkm-dark",
  style: {"flex":"none","padding":"14px 14px 12px","border-radius":"24px","border":"1px solid var(--pkm-line-3)","background":"var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_59 = {
  role: "tablist",
  "aria-label": "Mon classeur",
  style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"4px","padding":"4px","border-radius":"999px","border":"1px solid var(--pkm-line-2)"}
}
const _hoisted_60 = ["onClick", "aria-selected"]
const _hoisted_61 = ["aria-label"]
const _hoisted_62 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_63 = {
  key: 0,
  style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"10px"}
}
const _hoisted_64 = ["onClick", "aria-label"]
const _hoisted_65 = ["src", "data-fallback", "srcset"]
const _hoisted_66 = {
  key: 0,
  style: {"position":"absolute","top":"5px","right":"5px","padding":"1px 6px","border-radius":"6px","background":"var(--pkm-white)","color":"var(--pkm-ink)","font-size":"10.5px","font-weight":"800","box-shadow":"0 2px 6px rgba(var(--pkm-shadow-rgb), 0.35)"}
}
const _hoisted_67 = {
  key: 1,
  class: "pkm-dark",
  style: {"position":"absolute","top":"5px","left":"5px","padding":"1px 7px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.82)","border":"1px solid rgba(var(--pkm-accent-rgb), 0.5)","color":"var(--pkm-white)","font-size":"11px","font-weight":"700"}
}
const _hoisted_68 = {
  class: "pkm-dark",
  style: {"position":"absolute","left":"50%","bottom":"6%","transform":"translateX(-50%)","max-width":"92%","box-sizing":"border-box","display":"flex","align-items":"center","gap":"4px","padding":"3px 7px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.86)","color":"var(--pkm-white)","font-size":"11px","font-weight":"700","line-height":"1.2","white-space":"nowrap","box-shadow":"0 2px 6px rgba(var(--pkm-shadow-rgb), 0.4)"}
}
const _hoisted_69 = { style: {"min-width":"0","overflow":"hidden","text-overflow":"ellipsis","font-variant-numeric":"tabular-nums"} }
const _hoisted_70 = {
  key: 1,
  style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px"}
}
const _hoisted_71 = ["onClick", "aria-label"]
const _hoisted_72 = ["src"]
const _hoisted_73 = ["src"]
const _hoisted_74 = {
  key: 2,
  class: "pkm-dark",
  style: {"position":"absolute","top":"5px","left":"5px","padding":"1px 7px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.82)","border":"1px solid rgba(var(--pkm-accent-rgb), 0.5)","color":"var(--pkm-white)","font-size":"11px","font-weight":"700"}
}
const _hoisted_75 = {
  class: "pkm-dark",
  style: {"position":"absolute","left":"50%","bottom":"6%","transform":"translateX(-50%)","max-width":"92%","box-sizing":"border-box","display":"flex","align-items":"center","gap":"4px","padding":"3px 7px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.86)","color":"var(--pkm-white)","font-size":"11px","font-weight":"700","line-height":"1.2","white-space":"nowrap","box-shadow":"0 2px 6px rgba(var(--pkm-shadow-rgb), 0.4)"}
}
const _hoisted_76 = { style: {"min-width":"0","overflow":"hidden","text-overflow":"ellipsis","font-variant-numeric":"tabular-nums"} }
const _hoisted_77 = { style: {"display":"flex","flex-direction":"column","gap":"2px","padding":"8px 10px 10px","min-width":"0"} }
const _hoisted_78 = { style: {"font-size":"13px","font-weight":"700","line-height":"1.3","display":"-webkit-box","-webkit-line-clamp":"2","-webkit-box-orient":"vertical","overflow":"hidden"} }
const _hoisted_79 = { style: {"font-size":"11.5px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_80 = {
  key: 2,
  style: {"margin":"0","padding":"12px 4px","text-align":"center","font-size":"13.5px","line-height":"1.5","color":"var(--pkm-t3)"}
}
const _hoisted_81 = {
  key: 3,
  style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"}
}
const _hoisted_82 = ["onClick", "aria-disabled"]
const _hoisted_83 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_84 = {
  "aria-live": "polite",
  style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t2)"}
}
const _hoisted_85 = ["onClick", "aria-disabled"]
const _hoisted_86 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_87 = {
  "aria-label": "Boutiques près de toi",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_88 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"} }
const _hoisted_89 = ["onClick"]
const _hoisted_90 = {
  key: 0,
  class: "pkm-dark",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line-3)","background":"var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_91 = {
  key: 0,
  role: "status",
  style: {"margin":"0","font-size":"13px","line-height":"1.45","color":"var(--pkm-orange)"}
}
const _hoisted_92 = ["onClick", "aria-label"]
const _hoisted_93 = {
  "aria-hidden": "true",
  style: {"position":"absolute","inset":"0","border-radius":"66px","overflow":"hidden","background":"radial-gradient(closest-side, rgba(var(--pkm-accent-rgb), 0.14), rgba(var(--pkm-accent-rgb), 0)), var(--pkm-field)","box-shadow":"inset 0 0 0 2px rgba(var(--pkm-accent-rgb), 0.7)"}
}
const _hoisted_94 = {
  width: "132",
  height: "132",
  viewBox: "-66 -66 132 132",
  style: {"position":"absolute","left":"0","top":"0","display":"block"}
}
const _hoisted_95 = { style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_96 = ["onClick"]
const _hoisted_97 = ["onClick"]
const _hoisted_98 = {
  key: 1,
  role: "status",
  style: {"margin":"0","padding":"18px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_99 = {
  class: "pkm-dark",
  style: {"position":"relative","width":"100%","aspect-ratio":"1 / 1","border-radius":"24px","overflow":"hidden","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(closest-side, rgba(var(--pkm-accent-rgb), 0.1), rgba(var(--pkm-accent-rgb), 0)), var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_100 = {
  width: "100%",
  height: "100%",
  viewBox: "-179 -179 358 358",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"0","top":"0","display":"block"}
}
const _hoisted_101 = ["r"]
const _hoisted_102 = ["y"]
const _hoisted_103 = {
  key: 0,
  "aria-hidden": "true",
  class: "pkm-anim",
  style: {"position":"absolute","inset":"0","border-radius":"50%","background":"conic-gradient(from -70deg, rgba(var(--pkm-accent-rgb), 0) 0deg, rgba(var(--pkm-accent-rgb), 0.38) 70deg, rgba(var(--pkm-accent-rgb), 0) 70.5deg)","animation":"pkmSpin 2.6s linear 1 both"}
}
const _hoisted_104 = ["onClick", "aria-label"]
const _hoisted_105 = { style: {"font-size":"11.5px","font-weight":"800","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_106 = { style: {"font-size":"10.5px","line-height":"1.25","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_107 = ["onClick", "aria-label"]
const _hoisted_108 = { style: {"font-size":"11.5px","font-weight":"800","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_109 = { style: {"font-size":"10.5px","line-height":"1.25","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_110 = { style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_111 = ["onClick", "aria-disabled"]
const _hoisted_112 = ["onClick"]
const _hoisted_113 = {
  role: "status",
  style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t4)"}
}
const _hoisted_114 = ["onClick"]
const _hoisted_115 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(var(--pkm-iris-rgb), 0.16)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_116 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_117 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_118 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_119 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_120 = {
  key: 1,
  class: "pkm-dark",
  "aria-label": "Premiers pas",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid rgba(var(--pkm-teal-rgb), 0.34)","background":"radial-gradient(120% 90% at 0% 0%, rgba(var(--pkm-teal-rgb), 0.16), rgba(var(--pkm-teal-rgb), 0) 60%), var(--pkm-card)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_121 = { style: {"flex":"1","font-size":"14px"} }
const _hoisted_122 = {
  key: 0,
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  role: "img",
  "aria-label": "Fait",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-green)","stroke-width":"2.6","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_123 = ["onClick"]
const _hoisted_124 = {
  key: 2,
  "aria-label": "Suggestion",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"14px 16px","border-radius":"20px","border":"1px solid rgba(var(--pkm-amber-rgb), 0.34)","background":"rgba(var(--pkm-amber-rgb), 0.08)"}
}
const _hoisted_125 = ["onClick"]
const _hoisted_126 = {
  key: 3,
  "aria-label": "Sorties du moment",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_127 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"} }
const _hoisted_128 = ["onClick"]
const _hoisted_129 = { style: {"display":"flex","gap":"12px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px 4px","scroll-snap-type":"x mandatory","scroll-padding-left":"16px"} }
const _hoisted_130 = ["onClick", "aria-label"]
const _hoisted_131 = ["src"]
const _hoisted_132 = ["src"]
const _hoisted_133 = { style: {"position":"absolute","left":"50%","bottom":"12px","transform":"translateX(-50%)","padding":"1px 6px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.9)","border-radius":"6px","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"} }
const _hoisted_134 = {
  key: 3,
  class: "pkm-dark",
  style: {"position":"absolute","top":"8px","right":"8px","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.85)","color":"var(--pkm-white)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_135 = { style: {"display":"flex","flex-direction":"column","gap":"2px","padding":"10px 12px 12px","min-width":"0"} }
const _hoisted_136 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_137 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_138 = { style: {"display":"flex","align-items":"baseline","justify-content":"space-between","gap":"8px","margin-top":"4px"} }
const _hoisted_139 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_140 = {
  class: "pkm-dark",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"52px","padding":"0 16px","border-radius":"999px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_141 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t3)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_142 = ["value", "onInput"]
const _hoisted_143 = ["onClick"]
const _hoisted_144 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_145 = {
  role: "group",
  "aria-label": "Type d’article",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_146 = ["onClick", "aria-pressed"]
const _hoisted_147 = {
  class: "pkm-dark",
  "aria-label": "Résumé de la collection",
  style: {"flex":"none","display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","padding":"14px 4px","border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_148 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px"} }
const _hoisted_149 = { style: {"font-family":"'Sora', sans-serif","font-size":"15.5px","font-weight":"700","white-space":"nowrap"} }
const _hoisted_150 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px","border-left":"1px solid var(--pkm-line)","border-right":"1px solid var(--pkm-line)"} }
const _hoisted_151 = { style: {"font-family":"'Sora', sans-serif","font-size":"15.5px","font-weight":"700","white-space":"nowrap"} }
const _hoisted_152 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px"} }
const _hoisted_153 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_154 = { style: {"flex":"none","display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","grid-auto-flow":"dense","gap":"10px"} }
const _hoisted_155 = ["onClick"]
const _hoisted_156 = ["src", "data-fallback", "srcset"]
const _hoisted_157 = { style: {"position":"absolute","left":"14px","right":"14px","top":"12px","height":"20px","border-radius":"5px","background":"#E9ECF2","color":"#1B2236","font-family":"'Sora', sans-serif","font-size":"10.5px","font-weight":"700","letter-spacing":"0.04em","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_158 = ["src", "data-fallback"]
const _hoisted_159 = ["src"]
const _hoisted_160 = {
  width: "44",
  height: "44",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"50%","top":"110px","margin-left":"-22px","fill":"none","stroke":"rgba(var(--pkm-hl-rgb), 0.85)","stroke-width":"1.25","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_161 = ["d"]
const _hoisted_162 = {
  class: "pkm-dark",
  style: {"position":"absolute","top":"8px","left":"8px","padding":"1px 5px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.9)","border-radius":"6px","background":"rgba(var(--pkm-app-rgb), 0.25)","font-family":"'Sora', sans-serif","font-size":"10px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"}
}
const _hoisted_163 = ["src"]
const _hoisted_164 = {
  class: "pkm-dark",
  style: {"position":"absolute","top":"8px","right":"8px","padding":"2px 8px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.7)","font-size":"12px","font-weight":"700","color":"var(--pkm-white)"}
}
const _hoisted_165 = {
  key: 4,
  class: "pkm-dark",
  style: {"position":"absolute","left":"8px","bottom":"8px","display":"flex","align-items":"center","gap":"3px","padding":"2px 7px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.8)","border":"1px solid rgba(var(--pkm-gold-rgb), 0.6)","color":"var(--pkm-gold)","font-size":"10.5px","font-weight":"800","letter-spacing":"0.04em"}
}
const _hoisted_166 = { style: {"display":"flex","flex-direction":"column","gap":"1px","padding":"0 3px","min-width":"0"} }
const _hoisted_167 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_168 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_169 = { style: {"display":"flex","align-items":"center","gap":"6px","padding":"0 3px"} }
const _hoisted_170 = { style: {"font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_171 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"6px","padding":"0 3px","font-size":"12px"} }
const _hoisted_172 = { style: {"color":"var(--pkm-t3)","white-space":"nowrap"} }
const _hoisted_173 = {
  key: 0,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_174 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"6px","font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_175 = ["src", "data-fallback"]
const _hoisted_176 = ["onClick", "aria-label"]
const _hoisted_177 = ["src", "data-fallback", "alt"]
const _hoisted_178 = {
  class: "pkm-dark",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"12px","bottom":"12px","width":"32px","height":"32px","border-radius":"16px","background":"rgba(var(--pkm-ink-rgb), 0.72)","display":"flex","align-items":"center","justify-content":"center","color":"var(--pkm-t1)"}
}
const _hoisted_179 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  style: {"fill":"none","stroke":"var(--pkm-white)","stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_180 = { style: {"position":"absolute","left":"50%","top":"22px","width":"220px","margin-left":"-110px","height":"30px","border-radius":"8px 8px 0 0","background":"#E9ECF2","color":"#1B2236","display":"flex","align-items":"center","justify-content":"space-between","padding":"0 12px","box-sizing":"border-box","font-family":"'Sora', sans-serif","font-size":"12px","font-weight":"700"} }
const _hoisted_181 = ["src", "data-fallback", "alt"]
const _hoisted_182 = ["src", "alt"]
const _hoisted_183 = {
  width: "72",
  height: "72",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"50%","top":"176px","margin-left":"-36px","fill":"none","stroke":"rgba(var(--pkm-hl-rgb), 0.85)","stroke-width":"1.1","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_184 = ["d"]
const _hoisted_185 = {
  class: "pkm-dark",
  style: {"position":"absolute","top":"14px","left":"14px","padding":"2px 7px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.92)","border-radius":"7px","background":"rgba(var(--pkm-app-rgb), 0.25)","font-family":"'Sora', sans-serif","font-size":"12px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"}
}
const _hoisted_186 = ["onClick", "aria-label"]
const _hoisted_187 = ["src", "alt"]
const _hoisted_188 = {
  class: "pkm-dark",
  style: {"position":"absolute","right":"12px","bottom":"12px","display":"flex","align-items":"center","gap":"7px","padding":"5px 11px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.72)","font-size":"12.5px","font-weight":"700","color":"var(--pkm-white)"}
}
const _hoisted_189 = {
  key: 0,
  style: {"margin":"-4px 4px 0","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"}
}
const _hoisted_190 = {
  class: "pkm-dark",
  "aria-label": "Cote Dropicards",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.18), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_191 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"10px"} }
const _hoisted_192 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_193 = { style: {"font-family":"'Sora', sans-serif","font-size":"34px","line-height":"1.1","font-weight":"700","letter-spacing":"-0.03em"} }
const _hoisted_194 = {
  key: 0,
  style: {"display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px","font-size":"12.5px","text-align":"right"}
}
const _hoisted_195 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700"} }
const _hoisted_196 = { style: {"color":"var(--pkm-t3)"} }
const _hoisted_197 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px","padding-top":"10px","border-top":"1px solid rgba(var(--pkm-hl-rgb), 0.08)"} }
const _hoisted_198 = { style: {"font-size":"12.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_199 = ["aria-label", "onMouseleave"]
const _hoisted_200 = ["d"]
const _hoisted_201 = ["d"]
const _hoisted_202 = ["x1", "x2"]
const _hoisted_203 = ["cx", "cy"]
const _hoisted_204 = ["x", "width", "onMouseenter", "onClick"]
const _hoisted_205 = { style: {"display":"flex","justify-content":"space-between","gap":"8px","font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_206 = {
  key: 1,
  style: {"margin":"0","font-size":"13.5px","line-height":"1.5","color":"var(--pkm-sand)"}
}
const _hoisted_207 = {
  class: "pkm-dark",
  "aria-label": "Comparatif des prix",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
}
const _hoisted_208 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_209 = { style: {"font-size":"14.5px","font-weight":"600"} }
const _hoisted_210 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_211 = { style: {"margin":"4px 0 0","padding-top":"10px","border-top":"1px solid var(--pkm-line)","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t2)"} }
const _hoisted_212 = {
  key: 1,
  class: "pkm-dark",
  "aria-label": "Historique d’achat",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
}
const _hoisted_213 = { style: {"margin":"0 0 4px","font-size":"13px","line-height":"1.45","color":"var(--pkm-t2)"} }
const _hoisted_214 = { style: {"flex":"1","min-width":"0","font-size":"14px","color":"var(--pkm-t2)"} }
const _hoisted_215 = {
  key: 0,
  style: {"font-size":"11.5px","font-weight":"700","border-radius":"999px","padding":"3px 9px","background":"rgba(var(--pkm-accent-rgb), 0.14)","color":"var(--pkm-link)"}
}
const _hoisted_216 = { style: {"font-size":"14px","font-variant-numeric":"tabular-nums"} }
const _hoisted_217 = ["onClick"]
const _hoisted_218 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_219 = {
  key: 2,
  style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1.3fr) minmax(0, 1fr)","gap":"10px"}
}
const _hoisted_220 = ["onClick"]
const _hoisted_221 = ["onClick", "disabled"]
const _hoisted_222 = ["onClick"]
const _hoisted_223 = {
  class: "pkm-dark",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"52px","padding":"0 16px","border-radius":"999px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_224 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t3)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_225 = ["value", "onInput"]
const _hoisted_226 = {
  key: 0,
  "aria-label": "Scellé à la une",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_227 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"} }
const _hoisted_228 = ["onClick"]
const _hoisted_229 = { style: {"display":"flex","gap":"12px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px 4px","scroll-snap-type":"x mandatory","scroll-padding-left":"16px"} }
const _hoisted_230 = ["onClick", "aria-label"]
const _hoisted_231 = ["src"]
const _hoisted_232 = ["src"]
const _hoisted_233 = { style: {"position":"absolute","left":"50%","bottom":"12px","transform":"translateX(-50%)","padding":"1px 6px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.9)","border-radius":"6px","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"} }
const _hoisted_234 = {
  key: 3,
  class: "pkm-dark",
  style: {"position":"absolute","top":"8px","right":"8px","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.85)","color":"var(--pkm-white)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_235 = { style: {"display":"flex","flex-direction":"column","gap":"2px","padding":"10px 12px 12px","min-width":"0"} }
const _hoisted_236 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_237 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_238 = { style: {"display":"flex","align-items":"baseline","justify-content":"space-between","gap":"8px","margin-top":"4px"} }
const _hoisted_239 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_240 = ["onClick"]
const _hoisted_241 = {
  "aria-hidden": "true",
  style: {"flex":"none","width":"56px","height":"56px","border-radius":"16px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","display":"flex","align-items":"center","justify-content":"center"}
}
const _hoisted_242 = {
  width: "28",
  height: "28",
  viewBox: "0 0 24 24",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_243 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_244 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_245 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_246 = ["onClick"]
const _hoisted_247 = {
  "aria-hidden": "true",
  style: {"position":"relative","flex":"none","width":"70px","height":"58px"}
}
const _hoisted_248 = ["src", "data-fallback"]
const _hoisted_249 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_250 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_251 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_252 = ["onClick"]
const _hoisted_253 = {
  "aria-hidden": "true",
  style: {"position":"relative","flex":"none","width":"70px","height":"58px"}
}
const _hoisted_254 = ["src"]
const _hoisted_255 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_256 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_257 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_258 = {
  role: "group",
  "aria-label": "Filtre du marché",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_259 = ["onClick", "aria-pressed"]
const _hoisted_260 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_261 = {
  key: 4,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_262 = {
  class: "pkm-dark",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_263 = ["onClick"]
const _hoisted_264 = ["src", "data-fallback"]
const _hoisted_265 = ["src"]
const _hoisted_266 = ["src"]
const _hoisted_267 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_268 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_269 = { style: {"display":"flex","align-items":"center","gap":"6px","min-width":"0","font-size":"12px","color":"var(--pkm-t3)"} }
const _hoisted_270 = { style: {"white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_271 = {
  key: 0,
  style: {"flex":"none","padding":"1px 7px","border-radius":"999px","background":"rgba(var(--pkm-accent-rgb), 0.14)","color":"var(--pkm-link)","font-size":"11px","font-weight":"700"}
}
const _hoisted_272 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"1px"} }
const _hoisted_273 = { style: {"font-size":"15px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_274 = {
  class: "pkm-dark",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"52px","padding":"0 16px","border-radius":"999px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_275 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t3)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_276 = ["value", "onInput"]
const _hoisted_277 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_278 = {
  key: 0,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_279 = ["aria-label"]
const _hoisted_280 = { style: {"margin":"4px 2px 0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600","letter-spacing":"-0.01em"} }
const _hoisted_281 = {
  key: 0,
  style: {"margin":"0 2px","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"}
}
const _hoisted_282 = {
  class: "pkm-dark",
  style: {"border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_283 = ["onClick", "aria-label"]
const _hoisted_284 = { style: {"flex":"none","width":"78px","height":"42px","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_285 = ["src"]
const _hoisted_286 = {
  key: 1,
  style: {"padding":"3px 7px","border":"1.5px solid var(--pkm-line-2)","border-radius":"7px","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-t3)"}
}
const _hoisted_287 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_288 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_289 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_290 = {
  key: 0,
  style: {"flex":"none","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-accent-rgb), 0.14)","color":"var(--pkm-link)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_291 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_292 = {
  class: "pkm-dark",
  "aria-label": "Extension",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"14px","padding":"14px 16px","border-radius":"22px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.18), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","color":"var(--pkm-t1)"}
}
const _hoisted_293 = ["src"]
const _hoisted_294 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_295 = { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600"} }
const _hoisted_296 = { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }
const _hoisted_297 = {
  key: 0,
  style: {"margin":"0 2px","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-sand)"}
}
const _hoisted_298 = {
  role: "group",
  "aria-label": "Filtre des cartes",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_299 = ["onClick", "aria-pressed"]
const _hoisted_300 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_301 = {
  key: 1,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_302 = { style: {"flex":"none","display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"16px 10px"} }
const _hoisted_303 = ["onClick", "aria-label"]
const _hoisted_304 = {
  class: "pkm-dark",
  style: {"position":"relative","display":"block","width":"100%","aspect-ratio":"600 / 825","border-radius":"5% / 3.6%","overflow":"hidden","background":"var(--pkm-img-bg)","box-shadow":"0 6px 14px rgba(var(--pkm-shadow-rgb), 0.35), inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.08)","color":"var(--pkm-t1)"}
}
const _hoisted_305 = ["src", "data-fallback", "srcset"]
const _hoisted_306 = {
  key: 0,
  class: "pkm-dark",
  style: {"position":"absolute","top":"5px","right":"5px","padding":"1px 7px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.82)","border":"1px solid rgba(var(--pkm-accent-rgb), 0.5)","color":"var(--pkm-white)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_307 = { style: {"display":"flex","flex-direction":"column","gap":"1px","min-width":"0","padding":"0 2px"} }
const _hoisted_308 = { style: {"font-size":"12.5px","font-weight":"700","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_309 = { style: {"display":"flex","justify-content":"space-between","gap":"4px","font-size":"11.5px","color":"var(--pkm-t3)"} }
const _hoisted_310 = { style: {"min-width":"0","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_311 = {
  class: "pkm-dark",
  "aria-label": "Catalogue scellé",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"4px","padding":"14px 16px","border-radius":"22px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 100% 0%, rgba(var(--pkm-orange-rgb), 0.16), rgba(var(--pkm-orange-rgb), 0) 60%), var(--pkm-card-hi)","color":"var(--pkm-t1)"}
}
const _hoisted_312 = { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600"} }
const _hoisted_313 = { style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_314 = {
  role: "group",
  "aria-label": "Type de produit",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_315 = ["onClick", "aria-pressed"]
const _hoisted_316 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_317 = {
  key: 0,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_318 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"14px"} }
const _hoisted_319 = ["onClick", "aria-label"]
const _hoisted_320 = ["src"]
const _hoisted_321 = ["src"]
const _hoisted_322 = { style: {"position":"absolute","left":"50%","bottom":"12px","transform":"translateX(-50%)","padding":"1px 6px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.9)","border-radius":"6px","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"} }
const _hoisted_323 = {
  key: 3,
  class: "pkm-dark",
  style: {"position":"absolute","top":"8px","right":"8px","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.85)","color":"var(--pkm-white)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_324 = { style: {"display":"flex","flex-direction":"column","gap":"2px","padding":"10px 12px 12px","min-width":"0"} }
const _hoisted_325 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.3","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_326 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_327 = { style: {"display":"flex","align-items":"baseline","justify-content":"space-between","gap":"8px","margin-top":"4px"} }
const _hoisted_328 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_329 = {
  class: "pkm-dark",
  "aria-label": "Invitations Amazon",
  style: {"flex":"none","display":"flex","gap":"12px","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line-3)","background":"var(--pkm-card-hi)","color":"var(--pkm-t1)"}
}
const _hoisted_330 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","margin-top":"1px","fill":"none","stroke":"var(--pkm-link)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_331 = { style: {"display":"flex","flex-direction":"column","gap":"4px"} }
const _hoisted_332 = { style: {"margin":"0","font-size":"13px","line-height":"1.5","color":"var(--pkm-t2)"} }
const _hoisted_333 = {
  key: 0,
  style: {"margin":"0","padding":"16px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_334 = ["aria-label"]
const _hoisted_335 = ["onClick", "aria-label"]
const _hoisted_336 = ["src"]
const _hoisted_337 = ["src"]
const _hoisted_338 = { style: {"position":"absolute","left":"50%","bottom":"14px","transform":"translateX(-50%)","padding":"1px 6px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.9)","border-radius":"6px","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"} }
const _hoisted_339 = {
  key: 2,
  class: "pkm-dark",
  style: {"position":"absolute","top":"10px","right":"10px","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.85)","color":"var(--pkm-white)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_340 = { style: {"display":"flex","flex-direction":"column","gap":"12px","padding":"12px 14px 14px"} }
const _hoisted_341 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_342 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"16.5px","font-weight":"600","line-height":"1.3"} }
const _hoisted_343 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_344 = { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }
const _hoisted_345 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_346 = { style: {"display":"flex","flex-direction":"column","gap":"1px","padding":"9px 10px","border-radius":"14px","border":"1px solid var(--pkm-line)"} }
const _hoisted_347 = { style: {"font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"700"} }
const _hoisted_348 = { style: {"font-size":"11px","line-height":"1.35","color":"var(--pkm-t3)"} }
const _hoisted_349 = {
  key: 1,
  style: {"font-size":"13px","color":"var(--pkm-t2)"}
}
const _hoisted_350 = { style: {"display":"flex","flex-direction":"column","gap":"1px","padding":"9px 10px","border-radius":"14px","border":"1px solid var(--pkm-line)"} }
const _hoisted_351 = { style: {"font-size":"11.5px","color":"var(--pkm-t3)"} }
const _hoisted_352 = { style: {"font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"700"} }
const _hoisted_353 = { style: {"font-size":"11px","line-height":"1.35","color":"var(--pkm-t3)"} }
const _hoisted_354 = {
  role: "group",
  "aria-label": "Chercher ce produit chez une enseigne",
  style: {"display":"flex","flex-wrap":"wrap","gap":"8px"}
}
const _hoisted_355 = ["href", "aria-label"]
const _hoisted_356 = {
  width: "13",
  height: "13",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_357 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_358 = ["onClick"]
const _hoisted_359 = ["onClick", "aria-pressed"]
const _hoisted_360 = ["aria-label"]
const _hoisted_361 = ["onClick", "aria-label"]
const _hoisted_362 = ["src"]
const _hoisted_363 = ["src"]
const _hoisted_364 = { style: {"position":"absolute","left":"50%","bottom":"14px","transform":"translateX(-50%)","padding":"1px 6px","border":"1.5px solid rgba(var(--pkm-hl-rgb), 0.9)","border-radius":"6px","font-family":"'Sora', sans-serif","font-size":"11px","font-weight":"700","letter-spacing":"0.04em","color":"var(--pkm-white)"} }
const _hoisted_365 = {
  key: 2,
  class: "pkm-dark",
  style: {"position":"absolute","top":"10px","right":"10px","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.85)","color":"var(--pkm-white)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_366 = { style: {"display":"flex","flex-direction":"column","gap":"12px","padding":"12px 14px 14px"} }
const _hoisted_367 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_368 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"16.5px","font-weight":"600","line-height":"1.3"} }
const _hoisted_369 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_370 = { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }
const _hoisted_371 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_372 = { style: {"display":"flex","flex-direction":"column","gap":"1px","padding":"9px 10px","border-radius":"14px","border":"1px solid var(--pkm-line)"} }
const _hoisted_373 = { style: {"font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"700"} }
const _hoisted_374 = { style: {"font-size":"11px","line-height":"1.35","color":"var(--pkm-t3)"} }
const _hoisted_375 = {
  key: 1,
  style: {"font-size":"13px","color":"var(--pkm-t2)"}
}
const _hoisted_376 = { style: {"display":"flex","flex-direction":"column","gap":"1px","padding":"9px 10px","border-radius":"14px","border":"1px solid var(--pkm-line)"} }
const _hoisted_377 = { style: {"font-size":"11.5px","color":"var(--pkm-t3)"} }
const _hoisted_378 = { style: {"font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"700"} }
const _hoisted_379 = { style: {"font-size":"11px","line-height":"1.35","color":"var(--pkm-t3)"} }
const _hoisted_380 = {
  role: "group",
  "aria-label": "Chercher ce produit chez une enseigne",
  style: {"display":"flex","flex-wrap":"wrap","gap":"8px"}
}
const _hoisted_381 = ["href", "aria-label"]
const _hoisted_382 = {
  width: "13",
  height: "13",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_383 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_384 = ["onClick"]
const _hoisted_385 = ["onClick", "aria-pressed"]
const _hoisted_386 = { style: {"flex":"none","margin":"0","font-size":"12px","line-height":"1.5","color":"var(--pkm-t4)"} }
const _hoisted_387 = ["aria-label"]
const _hoisted_388 = { style: {"display":"flex","align-items":"flex-start","gap":"12px"} }
const _hoisted_389 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_390 = { style: {"font-size":"14px","font-weight":"600","color":"var(--pkm-t2)"} }
const _hoisted_391 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"4px"} }
const _hoisted_392 = { style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_393 = ["onClick", "aria-expanded"]
const _hoisted_394 = {
  key: 0,
  class: "pkm-dark",
  style: {"display":"flex","flex-direction":"column","gap":"6px","padding":"12px 14px","border-radius":"16px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card-2)","color":"var(--pkm-t1)"}
}
const _hoisted_395 = { style: {"color":"var(--pkm-t2)"} }
const _hoisted_396 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_397 = {
  key: 1,
  style: {"display":"flex","flex-direction":"column","gap":"2px","padding":"11px 14px","border-radius":"16px","border":"1px solid var(--pkm-line)"}
}
const _hoisted_398 = { style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t2)"} }
const _hoisted_399 = {
  key: 2,
  style: {"margin":"0","font-size":"13px","line-height":"1.45","color":"var(--pkm-t2)"}
}
const _hoisted_400 = { style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_401 = ["href"]
const _hoisted_402 = ["onClick", "aria-pressed"]
const _hoisted_403 = ["href", "aria-label"]
const _hoisted_404 = ["href", "aria-label"]
const _hoisted_405 = { style: {"display":"flex","flex-wrap":"wrap","gap":"4px 18px"} }
const _hoisted_406 = ["href"]
const _hoisted_407 = ["href"]
const _hoisted_408 = {
  class: "pkm-dark",
  "aria-label": "Identité",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"14px","padding":"16px","border-radius":"24px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 0% 0%, rgba(var(--pkm-glow-rgb), 0.22), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","color":"var(--pkm-t1)"}
}
const _hoisted_409 = { style: {"position":"relative","flex":"none","width":"76px","height":"76px"} }
const _hoisted_410 = ["src"]
const _hoisted_411 = {
  width: "30",
  height: "30",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"position":"absolute","right":"-6px","bottom":"-4px","overflow":"visible"}
}
const _hoisted_412 = ["d"]
const _hoisted_413 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_414 = { style: {"font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_415 = {
  class: "pkm-dark",
  "aria-label": "Type de collectionneur",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_416 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_417 = ["d"]
const _hoisted_418 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_419 = {
  role: "list",
  "aria-label": "Les trois profils",
  style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"6px"}
}
const _hoisted_420 = { style: {"margin":"0","font-size":"13.5px","line-height":"1.5","color":"var(--pkm-t2)"} }
const _hoisted_421 = { style: {"display":"flex","align-items":"center","gap":"6px","font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_422 = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_423 = { style: {"font-size":"13.5px","line-height":"1.45"} }
const _hoisted_424 = {
  key: 0,
  style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"}
}
const _hoisted_425 = {
  class: "pkm-dark",
  "aria-label": "Ce qui fixe ton profil",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"4px","color":"var(--pkm-t1)"}
}
const _hoisted_426 = { style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"10px"} }
const _hoisted_427 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_428 = { style: {"font-size":"14px","font-weight":"600"} }
const _hoisted_429 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700"} }
const _hoisted_430 = {
  "aria-hidden": "true",
  style: {"position":"relative","height":"8px","border-radius":"4px","background":"var(--pkm-track)"}
}
const _hoisted_431 = {
  "aria-hidden": "true",
  style: {"position":"relative","height":"14px","font-size":"11px","color":"var(--pkm-t4)"}
}
const _hoisted_432 = { style: {"position":"absolute","left":"0"} }
const _hoisted_433 = { style: {"position":"absolute","right":"0"} }
const _hoisted_434 = {
  class: "pkm-dark",
  "aria-label": "Ce que ça change pour toi",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_435 = {
  class: "pkm-dark",
  "aria-label": "Raccourcis du profil",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_436 = ["onClick"]
const _hoisted_437 = {
  width: "26",
  height: "26",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_438 = ["d"]
const _hoisted_439 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_440 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_441 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_442 = ["onClick"]
const _hoisted_443 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_444 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_445 = ["onClick"]
const _hoisted_446 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_447 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_448 = ["onClick"]
const _hoisted_449 = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_450 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_451 = {
  width: "96",
  height: "96",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"overflow":"visible"}
}
const _hoisted_452 = ["d"]
const _hoisted_453 = { style: {"font-size":"14px","color":"var(--pkm-t2)"} }
const _hoisted_454 = {
  "aria-hidden": "true",
  style: {"align-self":"stretch","height":"10px","margin-top":"6px","border-radius":"5px","background":"var(--pkm-track)","overflow":"hidden"}
}
const _hoisted_455 = { style: {"font-size":"13px","font-weight":"600"} }
const _hoisted_456 = {
  class: "pkm-dark",
  "aria-label": "Les paliers",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_457 = {
  width: "34",
  height: "34",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_458 = ["d"]
const _hoisted_459 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_460 = { style: {"font-weight":"700"} }
const _hoisted_461 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_462 = {
  class: "pkm-dark",
  "aria-label": "Série en cours",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_463 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_464 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700","color":"var(--pkm-accent)"} }
const _hoisted_465 = {
  "aria-hidden": "true",
  style: {"display":"flex","align-items":"flex-end","gap":"6px","height":"34px"}
}
const _hoisted_466 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_467 = {
  "aria-label": "Succès",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_468 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_469 = { style: {"font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_470 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px"} }
const _hoisted_471 = {
  key: 0,
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-green)","stroke-width":"2.6","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_472 = {
  key: 1,
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-accent)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_473 = { style: {"font-size":"14px","font-weight":"700","line-height":"1.25"} }
const _hoisted_474 = { style: {"font-size":"12px","color":"var(--pkm-t3)"} }
const _hoisted_475 = {
  "aria-hidden": "true",
  style: {"height":"5px","border-radius":"3px","background":"var(--pkm-track)","overflow":"hidden"}
}
const _hoisted_476 = {
  class: "pkm-dark",
  "aria-label": "Valorisation",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_477 = {
  role: "group",
  "aria-label": "Indicateur de valorisation",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_478 = ["onClick", "aria-pressed"]
const _hoisted_479 = { style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_480 = {
  class: "pkm-dark",
  "aria-label": "Sources de prix",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"4px","color":"var(--pkm-t1)"}
}
const _hoisted_481 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_482 = { style: {"font-weight":"600"} }
const _hoisted_483 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_484 = { style: {"flex":"none","font-size":"12px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_485 = {
  class: "pkm-dark",
  "aria-label": "Mode avancé",
  style: {"flex":"none","padding":"20px 18px 18px","border-radius":"26px","border":"1px solid var(--pkm-line-2)","background":"radial-gradient(110% 80% at 50% 0%, rgba(var(--pkm-glow-rgb), 0.26), rgba(var(--pkm-glow-rgb), 0) 65%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","align-items":"center","gap":"12px","text-align":"center","color":"var(--pkm-t1)"}
}
const _hoisted_486 = { style: {"display":"flex","align-items":"center","gap":"6px","padding":"4px 12px","border-radius":"999px","background":"var(--pkm-pearl)","color":"var(--pkm-ink)","font-size":"12px","font-weight":"800","letter-spacing":"0.06em"} }
const _hoisted_487 = {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-brand)","stroke-width":"2.4","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_488 = {
  "aria-hidden": "true",
  style: {"position":"relative","width":"194px","height":"110px"}
}
const _hoisted_489 = ["src", "data-fallback"]
const _hoisted_490 = { style: {"font-family":"'Sora', sans-serif","font-size":"19px","font-weight":"600","letter-spacing":"-0.01em"} }
const _hoisted_491 = ["onClick", "aria-pressed"]
const _hoisted_492 = {
  class: "pkm-dark",
  "aria-label": "Frais par plateforme",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
}
const _hoisted_493 = { style: {"padding":"3px 10px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","font-size":"13px","font-weight":"600"} }
const _hoisted_494 = { style: {"font-size":"13px","color":"var(--pkm-t3)","text-align":"right"} }
const _hoisted_495 = ["onClick"]
const _hoisted_496 = {
  class: "pkm-dark",
  "aria-label": "Outils avancés",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_497 = ["onClick"]
const _hoisted_498 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(var(--pkm-accent-rgb), 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_499 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_500 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_501 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_502 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_503 = ["onClick"]
const _hoisted_504 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(var(--pkm-accent-rgb), 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_505 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_506 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_507 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_508 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_509 = ["onClick"]
const _hoisted_510 = { style: {"flex":"none","width":"40px","height":"40px","border-radius":"12px","background":"rgba(var(--pkm-accent-rgb), 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_511 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_512 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_513 = {
  class: "pkm-dark",
  "aria-label": "Ma collection sur cet appareil",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_514 = { style: {"margin":"0","font-size":"13px","line-height":"1.5","color":"var(--pkm-t3)"} }
const _hoisted_515 = { style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_516 = ["onClick"]
const _hoisted_517 = ["onClick"]
const _hoisted_518 = {
  class: "pkm-dark",
  "aria-label": "À propos",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card-2)","display":"flex","flex-direction":"column","gap":"8px","color":"var(--pkm-t1)"}
}
const _hoisted_519 = ["onClick"]
const _hoisted_520 = {
  role: "group",
  "aria-label": "Période",
  style: {"flex":"none","display":"flex","gap":"8px"}
}
const _hoisted_521 = ["onClick", "aria-pressed"]
const _hoisted_522 = {
  class: "pkm-dark",
  "aria-label": "Résumé des ventes",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.18), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_523 = { style: {"display":"flex","align-items":"flex-end","justify-content":"space-between","gap":"12px"} }
const _hoisted_524 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_525 = { style: {"font-size":"13px","color":"var(--pkm-t2)"} }
const _hoisted_526 = { style: {"display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px","font-size":"12.5px","color":"var(--pkm-t3)","text-align":"right"} }
const _hoisted_527 = { style: {"color":"var(--pkm-t1)","font-weight":"600"} }
const _hoisted_528 = {
  "aria-hidden": "true",
  style: {"display":"flex","gap":"2px","height":"8px"}
}
const _hoisted_529 = { style: {"display":"flex","flex-wrap":"wrap","gap":"4px 14px","font-size":"12px","color":"var(--pkm-t3)"} }
const _hoisted_530 = { style: {"display":"flex","align-items":"center","gap":"6px"} }
const _hoisted_531 = { style: {"display":"flex","align-items":"center","gap":"6px"} }
const _hoisted_532 = {
  key: 0,
  class: "pkm-dark",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_533 = ["onClick"]
const _hoisted_534 = ["src", "data-fallback"]
const _hoisted_535 = ["src"]
const _hoisted_536 = ["src"]
const _hoisted_537 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_538 = { style: {"font-weight":"600","font-size":"14.5px","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_539 = { style: {"display":"flex","align-items":"center","gap":"6px","flex-wrap":"wrap","font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_540 = { style: {"padding":"1px 8px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","color":"var(--pkm-t2)","font-size":"11.5px","font-weight":"600"} }
const _hoisted_541 = {
  key: 0,
  style: {"padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-orange-rgb), 0.16)","color":"var(--pkm-orange)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_542 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"1px"} }
const _hoisted_543 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_544 = {
  key: 1,
  style: {"margin":"0","padding":"24px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_545 = ["onClick"]
const _hoisted_546 = {
  class: "pkm-dark",
  "aria-label": "Résultat de la vente",
  style: {"flex":"none","padding":"16px","border-radius":"24px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.2), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"14px","color":"var(--pkm-t1)"}
}
const _hoisted_547 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_548 = ["src", "data-fallback"]
const _hoisted_549 = ["src"]
const _hoisted_550 = ["src"]
const _hoisted_551 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_552 = { style: {"font-weight":"600"} }
const _hoisted_553 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_554 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_555 = { style: {"font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_556 = {
  key: 0,
  style: {"font-size":"13px","line-height":"1.45","color":"var(--pkm-sand)","background":"rgba(var(--pkm-orange-rgb), 0.12)","border":"1px solid rgba(var(--pkm-orange-rgb), 0.3)","border-radius":"14px","padding":"10px 12px"}
}
const _hoisted_557 = {
  class: "pkm-dark",
  "aria-label": "Décomposition de la marge",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_558 = { style: {"display":"flex","flex-direction":"column","gap":"11px","font-size":"14px"} }
const _hoisted_559 = { style: {"display":"flex","justify-content":"space-between","gap":"12px"} }
const _hoisted_560 = { style: {"font-variant-numeric":"tabular-nums","font-weight":"600"} }
const _hoisted_561 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_562 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_563 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_564 = { style: {"font-variant-numeric":"tabular-nums","color":"var(--pkm-t2)"} }
const _hoisted_565 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_566 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_567 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_568 = { style: {"font-variant-numeric":"tabular-nums","color":"var(--pkm-t2)"} }
const _hoisted_569 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_570 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_571 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_572 = { style: {"font-variant-numeric":"tabular-nums","color":"var(--pkm-t2)"} }
const _hoisted_573 = { style: {"display":"flex","justify-content":"space-between","gap":"12px","font-weight":"700"} }
const _hoisted_574 = {
  "aria-hidden": "true",
  style: {"display":"flex","gap":"2px","height":"8px","margin-top":"2px"}
}
const _hoisted_575 = { style: {"margin":"0","font-size":"13px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_576 = {
  key: 0,
  class: "pkm-dark",
  style: {"flex":"none","display":"flex","justify-content":"space-between","align-items":"center","gap":"12px","min-height":"54px","padding":"0 16px","border-radius":"18px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","font-size":"14px","color":"var(--pkm-t1)"}
}
const _hoisted_577 = { style: {"font-weight":"700"} }
const _hoisted_578 = ["onClick"]
const _hoisted_579 = ["onClick", "aria-label"]
const _hoisted_580 = ["src"]
const _hoisted_581 = ["src"]
const _hoisted_582 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_583 = { style: {"font-size":"12px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis","color":"var(--pkm-orange)"} }
const _hoisted_584 = { style: {"font-size":"14px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_585 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_586 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_587 = {
  "aria-label": "Boutiques autour de toi",
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_588 = {
  key: 0,
  class: "pkm-dark",
  style: {"display":"flex","flex-direction":"column","gap":"12px","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line-3)","background":"var(--pkm-card-hi)","color":"var(--pkm-t1)"}
}
const _hoisted_589 = { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t2)"} }
const _hoisted_590 = {
  key: 0,
  role: "status",
  style: {"margin":"0","font-size":"13px","line-height":"1.45","color":"var(--pkm-sand)"}
}
const _hoisted_591 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px"} }
const _hoisted_592 = ["onClick"]
const _hoisted_593 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_594 = ["onClick"]
const _hoisted_595 = {
  key: 1,
  role: "status",
  style: {"margin":"0","padding":"16px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_596 = {
  role: "group",
  "aria-label": "Produit recherché",
  style: {"display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_597 = ["onClick", "aria-pressed"]
const _hoisted_598 = { style: {"display":"flex","flex-wrap":"wrap","align-items":"center","gap":"8px"} }
const _hoisted_599 = {
  role: "group",
  "aria-label": "Rayon autour de toi",
  style: {"display":"flex","gap":"6px"}
}
const _hoisted_600 = ["onClick", "aria-pressed"]
const _hoisted_601 = {
  role: "group",
  "aria-label": "Ordre de la liste",
  style: {"display":"flex","gap":"6px"}
}
const _hoisted_602 = ["onClick", "aria-pressed"]
const _hoisted_603 = {
  class: "pkm-dark",
  style: {"position":"relative","width":"100%","aspect-ratio":"358 / 230","border-radius":"22px","overflow":"hidden","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_604 = {
  width: "100%",
  height: "100%",
  viewBox: "-179 -115 358 230",
  "aria-hidden": "true",
  style: {"position":"absolute","left":"0","top":"0","display":"block"}
}
const _hoisted_605 = ["r"]
const _hoisted_606 = ["y"]
const _hoisted_607 = ["onClick", "aria-label"]
const _hoisted_608 = ["onClick"]
const _hoisted_609 = { style: {"font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_610 = {
  key: 0,
  style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"10px","padding":"14px 0"}
}
const _hoisted_611 = { style: {"margin":"0","text-align":"center","font-size":"14px","color":"var(--pkm-t2)"} }
const _hoisted_612 = ["onClick"]
const _hoisted_613 = {
  key: 1,
  class: "pkm-dark",
  style: {"border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_614 = ["onClick", "aria-label"]
const _hoisted_615 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_616 = { style: {"font-size":"14.5px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_617 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_618 = { style: {"display":"flex","align-items":"center","gap":"8px","font-size":"12px"} }
const _hoisted_619 = { style: {"color":"var(--pkm-t2)"} }
const _hoisted_620 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"3px"} }
const _hoisted_621 = ["onClick", "aria-expanded"]
const _hoisted_622 = { style: {"flex":"none","font-size":"13px","font-weight":"700","color":"var(--pkm-link)"} }
const _hoisted_623 = ["onClick"]
const _hoisted_624 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_625 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_626 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_627 = ["onClick"]
const _hoisted_628 = { style: {"flex":"none","width":"66px","height":"46px","border-radius":"11px","background":"linear-gradient(160deg, #23765C, #0A251C)","box-shadow":"inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_629 = ["src"]
const _hoisted_630 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_631 = { style: {"font-size":"12px","font-weight":"700","color":"var(--pkm-teal)"} }
const _hoisted_632 = { style: {"font-size":"14px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_633 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_634 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_635 = {
  role: "group",
  "aria-label": "Produit recherché",
  style: {"flex":"none","display":"flex","gap":"8px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"0 16px"}
}
const _hoisted_636 = ["onClick", "aria-pressed"]
const _hoisted_637 = {
  class: "pkm-dark",
  "aria-label": "Carte des magasins",
  style: {"flex":"none","position":"relative","width":"100%","max-width":"100%","aspect-ratio":"358 / 210","border-radius":"22px","overflow":"hidden","border":"1px solid var(--pkm-line)","background":"#0E1729","color":"var(--pkm-t1)"}
}
const _hoisted_638 = ["aria-label"]
const _hoisted_639 = ["rx", "ry"]
const _hoisted_640 = ["onClick", "aria-label"]
const _hoisted_641 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"} }
const _hoisted_642 = {
  role: "group",
  "aria-label": "Probabilité d’arrivage",
  style: {"display":"flex","align-items":"center","gap":"8px"}
}
const _hoisted_643 = ["onClick", "aria-pressed"]
const _hoisted_644 = {
  role: "group",
  "aria-label": "Rayon autour de toi",
  style: {"display":"flex","align-items":"center","gap":"8px"}
}
const _hoisted_645 = ["onClick", "aria-pressed"]
const _hoisted_646 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_647 = {
  key: 0,
  style: {"margin":"0","padding":"20px 0","text-align":"center","font-size":"14px","color":"var(--pkm-t3)"}
}
const _hoisted_648 = {
  class: "pkm-dark",
  style: {"flex":"none","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_649 = ["onClick"]
const _hoisted_650 = { style: {"flex":"none","width":"42px","height":"42px","border-radius":"13px","background":"rgba(var(--pkm-accent-rgb), 0.12)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_651 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_652 = ["d"]
const _hoisted_653 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_654 = { style: {"display":"flex","align-items":"center","gap":"6px","flex-wrap":"wrap"} }
const _hoisted_655 = { style: {"font-size":"14.5px","font-weight":"700"} }
const _hoisted_656 = {
  key: 0,
  style: {"padding":"1px 7px","border-radius":"999px","background":"rgba(var(--pkm-accent-rgb), 0.16)","color":"var(--pkm-link)","font-size":"10.5px","font-weight":"800"}
}
const _hoisted_657 = { style: {"font-size":"12px","color":"var(--pkm-t3)"} }
const _hoisted_658 = { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }
const _hoisted_659 = { style: {"display":"flex","flex-wrap":"wrap","gap":"5px","margin-top":"2px"} }
const _hoisted_660 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_661 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"3px"} }
const _hoisted_662 = {
  class: "pkm-dark",
  "aria-label": "Magasin",
  style: {"flex":"none","padding":"16px","border-radius":"24px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 90% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.2), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_663 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_664 = { style: {"flex":"none","width":"52px","height":"52px","border-radius":"16px","background":"rgba(var(--pkm-accent-rgb), 0.14)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_665 = {
  width: "28",
  height: "28",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-link)","stroke-width":"1.7","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_666 = ["d"]
const _hoisted_667 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_668 = { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t2)"} }
const _hoisted_669 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_670 = {
  key: 0,
  style: {"align-self":"flex-start","margin-top":"2px","padding":"1px 8px","border-radius":"999px","background":"rgba(var(--pkm-accent-rgb), 0.16)","color":"var(--pkm-link)","font-size":"11px","font-weight":"800"}
}
const _hoisted_671 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"3px"} }
const _hoisted_672 = { style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_673 = {
  class: "pkm-dark",
  "aria-label": "Prochains arrivages",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"4px","color":"var(--pkm-t1)"}
}
const _hoisted_674 = ["onClick", "aria-label"]
const _hoisted_675 = ["src", "data-fallback"]
const _hoisted_676 = ["src"]
const _hoisted_677 = ["src"]
const _hoisted_678 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"4px"} }
const _hoisted_679 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_680 = { style: {"font-size":"14.5px","font-weight":"700"} }
const _hoisted_681 = { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }
const _hoisted_682 = {
  "aria-hidden": "true",
  style: {"display":"block","height":"6px","border-radius":"3px","background":"var(--pkm-track)","overflow":"hidden"}
}
const _hoisted_683 = { style: {"display":"flex","flex-wrap":"wrap","align-items":"center","gap":"5px"} }
const _hoisted_684 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_685 = {
  class: "pkm-dark",
  "aria-label": "Historique des arrivages",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"4px","color":"var(--pkm-t1)"}
}
const _hoisted_686 = { style: {"flex":"none","width":"44px","font-size":"13px","font-weight":"700","font-variant-numeric":"tabular-nums","color":"var(--pkm-t3)"} }
const _hoisted_687 = { style: {"flex":"1","font-size":"13.5px","line-height":"1.4"} }
const _hoisted_688 = { style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1.4fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_689 = ["onClick", "aria-pressed"]
const _hoisted_690 = ["onClick"]
const _hoisted_691 = {
  class: "pkm-dark",
  "aria-label": "Lot",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_692 = { style: {"display":"flex","justify-content":"space-between","align-items":"flex-start","gap":"12px"} }
const _hoisted_693 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_694 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }
const _hoisted_695 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_696 = { style: {"display":"flex","flex-direction":"column","align-items":"flex-end","gap":"2px"} }
const _hoisted_697 = { style: {"font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"700"} }
const _hoisted_698 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_699 = { style: {"display":"flex","flex-direction":"column","gap":"8px"} }
const _hoisted_700 = {
  role: "group",
  "aria-label": "Méthode de répartition",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_701 = ["onClick", "aria-pressed"]
const _hoisted_702 = { style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_703 = ["src", "data-fallback"]
const _hoisted_704 = ["src"]
const _hoisted_705 = ["src"]
const _hoisted_706 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_707 = { style: {"font-weight":"600","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_708 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_709 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end"} }
const _hoisted_710 = { style: {"font-size":"14.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_711 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_712 = {
  class: "pkm-dark",
  "aria-label": "Effet sur tes marges",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
}
const _hoisted_713 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_714 = { style: {"font-size":"14px","font-weight":"600"} }
const _hoisted_715 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_716 = ["aria-label"]
const _hoisted_717 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600"} }
const _hoisted_718 = { style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_719 = { style: {"display":"flex","flex-direction":"column","gap":"5px","font-size":"12px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_720 = ["value", "onInput"]
const _hoisted_721 = { style: {"display":"flex","flex-direction":"column","gap":"5px","font-size":"12px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_722 = ["value", "onInput"]
const _hoisted_723 = { style: {"display":"flex","flex-direction":"column","gap":"5px","font-size":"12px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_724 = ["value", "onInput"]
const _hoisted_725 = { style: {"margin":"0","font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_726 = {
  class: "pkm-dark",
  "aria-label": "Équipe",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"14px","color":"var(--pkm-t1)"}
}
const _hoisted_727 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column"} }
const _hoisted_728 = { style: {"font-weight":"600"} }
const _hoisted_729 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_730 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end"} }
const _hoisted_731 = { style: {"font-size":"14.5px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_732 = {
  class: "pkm-dark",
  "aria-label": "Partage de la marge nette",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_733 = {
  role: "group",
  "aria-label": "Règle de partage",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_734 = ["onClick", "aria-pressed"]
const _hoisted_735 = { style: {"display":"flex","flex-direction":"column"} }
const _hoisted_736 = { style: {"font-weight":"600"} }
const _hoisted_737 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_738 = { style: {"margin":"0","padding-top":"10px","border-top":"1px solid var(--pkm-line)","font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_739 = {
  class: "pkm-dark",
  "aria-label": "Importer",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_740 = ["onClick"]
const _hoisted_741 = { style: {"flex":"1","color":"var(--pkm-t3)"} }
const _hoisted_742 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_743 = { style: {"flex":"1","font-weight":"600"} }
const _hoisted_744 = {
  class: "pkm-dark",
  "aria-label": "Exporter",
  style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"12px","color":"var(--pkm-t1)"}
}
const _hoisted_745 = ["onClick"]
const _hoisted_746 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_747 = {
  class: "pkm-dark",
  "aria-label": "Navigation principale",
  style: {"position":"absolute","left":"14px","right":"14px","bottom":"14px","z-index":"10","height":"68px","box-sizing":"border-box","display":"grid","grid-template-columns":"repeat(5, minmax(0, 1fr))","align-items":"center","padding":"0 6px","border-radius":"26px","border":"1px solid var(--pkm-line)","background":"rgba(var(--pkm-ink-rgb), 0.92)","backdrop-filter":"blur(14px)","-webkit-backdrop-filter":"blur(14px)","box-shadow":"0 14px 34px rgba(var(--pkm-shadow-rgb), 0.5)","color":"var(--pkm-t1)"}
}
const _hoisted_748 = ["onClick", "aria-current"]
const _hoisted_749 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_750 = ["onClick", "aria-current"]
const _hoisted_751 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_752 = ["onClick"]
const _hoisted_753 = {
  width: "28",
  height: "28",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_754 = ["onClick", "aria-current"]
const _hoisted_755 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_756 = ["onClick", "aria-current"]
const _hoisted_757 = {
  width: "25",
  height: "25",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_758 = {
  key: 4,
  class: "pkm-dark",
  "aria-label": "Scanner",
  style: {"position":"absolute","inset":"0","z-index":"15","display":"flex","flex-direction":"column","overflow":"hidden","background":"radial-gradient(90% 60% at 50% 40%, #2B3550 0%, #131A2A 55%, #07090F 100%)","color":"var(--pkm-t1)"}
}
const _hoisted_759 = ["onInput"]
const _hoisted_760 = ["onInput"]
const _hoisted_761 = { style: {"position":"relative","z-index":"2","display":"flex","align-items":"center","justify-content":"space-between","gap":"10px","padding":"16px 16px 0"} }
const _hoisted_762 = ["onClick"]
const _hoisted_763 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_764 = {
  role: "group",
  "aria-label": "Que scannes-tu ?",
  style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"4px","padding":"3px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.66)","border":"1px solid rgba(var(--pkm-hl-rgb), 0.16)"}
}
const _hoisted_765 = ["onClick", "aria-pressed"]
const _hoisted_766 = ["onClick", "aria-pressed"]
const _hoisted_767 = ["onClick", "aria-label", "aria-pressed"]
const _hoisted_768 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_769 = {
  key: 1,
  "aria-hidden": "true",
  style: {"flex":"none","width":"44px","height":"44px"}
}
const _hoisted_770 = { style: {"position":"relative","flex":"1","min-height":"0","display":"flex","flex-direction":"column","align-items":"center","justify-content":"center","gap":"12px","padding":"0 16px"} }
const _hoisted_771 = { style: {"position":"relative","z-index":"2","max-width":"100%","padding":"6px 12px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.7)","color":"var(--pkm-t1)","font-size":"13px","font-weight":"600","text-align":"center"} }
const _hoisted_772 = {
  id: "pkm-scan-frame",
  style: {"position":"relative","flex":"none","height":"min(52dvh, 460px, calc(82vw / 0.716))","aspect-ratio":"63 / 88","border-radius":"18px","box-shadow":"0 0 0 200vmax rgba(var(--pkm-scrim-rgb), 0.5)"}
}
const _hoisted_773 = {
  key: 0,
  "aria-hidden": "true",
  class: "pkm-anim",
  style: {"position":"absolute","left":"8%","right":"8%","top":"4%","height":"2px","border-radius":"1px","background":"linear-gradient(90deg, rgba(var(--pkm-accent-rgb), 0), var(--pkm-accent), rgba(var(--pkm-accent-rgb), 0))","box-shadow":"0 0 14px var(--pkm-accent)","animation":"pkmScanLine 2.2s ease-in-out infinite alternate"}
}
const _hoisted_774 = ["aria-label"]
const _hoisted_775 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","color":"var(--pkm-t1)"} }
const _hoisted_776 = { style: {"margin":"0","font-size":"14px","line-height":"1.45","color":"var(--pkm-t2)"} }
const _hoisted_777 = ["onClick"]
const _hoisted_778 = ["onClick"]
const _hoisted_779 = ["onClick"]
const _hoisted_780 = ["onClick"]
const _hoisted_781 = { style: {"flex":"none","height":"58px","max-width":"100%","display":"flex","align-items":"flex-start","justify-content":"center"} }
const _hoisted_782 = {
  key: 0,
  role: "status",
  "aria-live": "polite",
  style: {"display":"flex","align-items":"center","gap":"8px","max-width":"100%","box-sizing":"border-box","padding":"9px 14px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.8)","border":"1px solid rgba(var(--pkm-hl-rgb), 0.18)","color":"var(--pkm-t1)","font-size":"13.5px","font-weight":"600"}
}
const _hoisted_783 = { style: {"min-width":"0"} }
const _hoisted_784 = {
  key: 0,
  style: {"position":"relative","display":"flex","flex-direction":"column","align-items":"center","gap":"12px","padding":"0 24px 28px"}
}
const _hoisted_785 = { style: {"max-width":"100%","padding":"4px 10px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.6)","color":"var(--pkm-t2)","font-size":"12px","text-align":"center"} }
const _hoisted_786 = { style: {"align-self":"stretch","display":"grid","grid-template-columns":"1fr auto 1fr","align-items":"center"} }
const _hoisted_787 = ["onClick"]
const _hoisted_788 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"1.8","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_789 = ["onClick", "aria-label", "aria-disabled"]
const _hoisted_790 = ["onClick"]
const _hoisted_791 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_792 = {
  key: 1,
  style: {"position":"relative","flex":"1","min-height":"0","display":"flex","flex-direction":"column","gap":"10px","padding":"14px 16px 20px"}
}
const _hoisted_793 = { style: {"flex":"none","margin":"0","padding":"10px 12px","border-radius":"14px","background":"rgba(var(--pkm-ink-rgb), 0.66)","color":"var(--pkm-t2)","font-size":"13px","line-height":"1.45"} }
const _hoisted_794 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"48px","padding":"0 16px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","background":"var(--pkm-card-2)"} }
const _hoisted_795 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t3)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_796 = ["value", "onInput"]
const _hoisted_797 = { style: {"flex":"none","padding":"0 4px","color":"var(--pkm-t1)","font-size":"12.5px","font-weight":"600"} }
const _hoisted_798 = {
  role: "list",
  "aria-label": "Produits scellés",
  style: {"flex":"1 1 auto","min-height":"0","overflow-y":"auto","scrollbar-width":"none","display":"flex","flex-direction":"column","gap":"8px"}
}
const _hoisted_799 = ["onClick"]
const _hoisted_800 = { style: {"flex":"none","width":"96px","height":"54px","border-radius":"10px","overflow":"hidden","background":"var(--pkm-img-bg)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_801 = ["src"]
const _hoisted_802 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_803 = { style: {"font-size":"14.5px","font-weight":"700","line-height":"1.25"} }
const _hoisted_804 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_805 = { style: {"flex":"none","font-size":"14px","font-weight":"700"} }
const _hoisted_806 = {
  key: 2,
  style: {"position":"absolute","inset":"0","z-index":"4","display":"flex","flex-direction":"column","background":"rgba(var(--pkm-scrim-rgb), 0.5)"}
}
const _hoisted_807 = ["onClick"]
const _hoisted_808 = {
  "aria-label": "C’est laquelle ?",
  role: "dialog",
  "aria-modal": "true",
  style: {"flex":"none","max-height":"80%","overflow-y":"auto","scrollbar-width":"none","box-sizing":"border-box","background":"var(--pkm-card-2)","border-top":"1px solid var(--pkm-line-3)","border-radius":"28px 28px 0 0","padding":"8px 16px 22px","display":"flex","flex-direction":"column","gap":"10px"}
}
const _hoisted_809 = { style: {"margin":"0","font-size":"13px","line-height":"1.4","color":"var(--pkm-t3)"} }
const _hoisted_810 = ["onClick", "aria-label"]
const _hoisted_811 = ["src", "data-fallback"]
const _hoisted_812 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","align-items":"flex-start","gap":"3px"} }
const _hoisted_813 = {
  key: 0,
  style: {"padding":"2px 8px","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font-size":"11px","font-weight":"800"}
}
const _hoisted_814 = { style: {"font-size":"15px","font-weight":"700","line-height":"1.25"} }
const _hoisted_815 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_816 = { style: {"font-size":"13px","font-weight":"700","color":"var(--pkm-t2)"} }
const _hoisted_817 = {
  key: 0,
  style: {"flex":"none","align-self":"flex-start","padding":"3px 8px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","color":"var(--pkm-t1)","font-size":"11.5px","font-weight":"700"}
}
const _hoisted_818 = { style: {"flex":"none","display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px","margin-top":"4px"} }
const _hoisted_819 = ["onClick"]
const _hoisted_820 = ["onClick"]
const _hoisted_821 = {
  key: 5,
  style: {"position":"absolute","inset":"0","z-index":"25","display":"flex","flex-direction":"column","background":"rgba(var(--pkm-scrim-rgb), 0.55)"}
}
const _hoisted_822 = ["onClick"]
const _hoisted_823 = {
  class: "pkm-dark",
  "aria-label": "Résultat du scan",
  style: {"flex":"none","max-height":"770px","overflow-y":"auto","scrollbar-width":"none","box-sizing":"border-box","background":"var(--pkm-card-2)","border-top":"1px solid var(--pkm-line-3)","border-radius":"28px 28px 0 0","padding":"8px 16px 24px","display":"flex","flex-direction":"column","gap":"14px","color":"var(--pkm-t1)"}
}
const _hoisted_824 = { style: {"flex":"none","display":"flex","gap":"14px","align-items":"flex-start"} }
const _hoisted_825 = ["src", "data-fallback"]
const _hoisted_826 = ["src"]
const _hoisted_827 = ["src"]
const _hoisted_828 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","align-items":"flex-start","gap":"4px"} }
const _hoisted_829 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"21px","line-height":"1.2","font-weight":"700","letter-spacing":"-0.02em"} }
const _hoisted_830 = { style: {"font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_831 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_832 = ["onClick"]
const _hoisted_833 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_834 = {
  class: "pkm-dark",
  "aria-label": "Cote",
  style: {"flex":"none","display":"flex","justify-content":"space-between","align-items":"center","gap":"12px","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 100% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.2), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","color":"var(--pkm-t1)"}
}
const _hoisted_835 = { style: {"display":"flex","flex-direction":"column","gap":"1px"} }
const _hoisted_836 = { style: {"font-family":"'Sora', sans-serif","font-size":"30px","line-height":"1.1","font-weight":"700","letter-spacing":"-0.03em"} }
const _hoisted_837 = { style: {"display":"flex","flex-direction":"column","gap":"3px","min-width":"150px"} }
const _hoisted_838 = { style: {"color":"var(--pkm-t3)"} }
const _hoisted_839 = { style: {"font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_840 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"} }
const _hoisted_841 = {
  role: "group",
  "aria-label": "Langue",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_842 = ["onClick", "aria-pressed"]
const _hoisted_843 = {
  role: "group",
  "aria-label": "État",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_844 = ["onClick", "aria-pressed"]
const _hoisted_845 = { style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1fr) auto","gap":"10px","align-items":"end"} }
const _hoisted_846 = { style: {"display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_847 = ["value", "onInput"]
const _hoisted_848 = { style: {"display":"flex","flex-direction":"column","gap":"6px"} }
const _hoisted_849 = {
  class: "pkm-dark",
  style: {"display":"flex","align-items":"center","height":"52px","box-sizing":"border-box","border":"1px solid var(--pkm-line-2)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)"}
}
const _hoisted_850 = ["onClick"]
const _hoisted_851 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_852 = {
  "aria-live": "polite",
  style: {"min-width":"26px","text-align":"center","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"}
}
const _hoisted_853 = ["onClick"]
const _hoisted_854 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_855 = { style: {"flex":"none","margin-top":"-6px","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_856 = {
  class: "pkm-dark",
  "aria-label": "Effet sur ta collection",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"12px 14px","border-radius":"18px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_857 = {
  width: "40",
  height: "40",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","overflow":"visible"}
}
const _hoisted_858 = ["d"]
const _hoisted_859 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_860 = { style: {"font-size":"14px","font-weight":"700","font-variant-numeric":"tabular-nums"} }
const _hoisted_861 = {
  width: "15",
  height: "15",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_862 = ["d"]
const _hoisted_863 = ["onClick"]
const _hoisted_864 = ["onClick"]
const _hoisted_865 = {
  key: 6,
  style: {"position":"absolute","inset":"0","z-index":"20","display":"flex","flex-direction":"column","background":"rgba(var(--pkm-scrim-rgb), 0.62)"}
}
const _hoisted_866 = ["onClick"]
const _hoisted_867 = {
  class: "pkm-dark",
  "aria-label": "Saisie",
  style: {"flex":"none","max-height":"796px","overflow-y":"auto","scrollbar-width":"none","box-sizing":"border-box","background":"var(--pkm-card-2)","border-top":"1px solid var(--pkm-line-3)","border-radius":"28px 28px 0 0","padding":"8px 16px 26px","display":"flex","flex-direction":"column","gap":"14px","color":"var(--pkm-t1)"}
}
const _hoisted_868 = { style: {"flex":"none","display":"flex","align-items":"center","gap":"8px"} }
const _hoisted_869 = {
  class: "pkm-dark",
  role: "group",
  "aria-label": "Type de saisie",
  style: {"flex":"1","display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"4px","padding":"4px","border-radius":"999px","background":"var(--pkm-field)","border":"1px solid var(--pkm-line)","color":"var(--pkm-t1)"}
}
const _hoisted_870 = ["onClick", "aria-pressed"]
const _hoisted_871 = ["onClick", "aria-pressed"]
const _hoisted_872 = ["onClick"]
const _hoisted_873 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_874 = { style: {"flex":"none","margin":"0","font-family":"'Sora', sans-serif","font-size":"22px","font-weight":"700","letter-spacing":"-0.02em"} }
const _hoisted_875 = { style: {"flex":"none","margin":"0","padding":"0","border":"0","min-width":"0"} }
const _hoisted_876 = { style: {"display":"flex","gap":"10px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -16px","padding":"2px 16px 4px"} }
const _hoisted_877 = ["onClick", "aria-pressed", "aria-label"]
const _hoisted_878 = ["src", "data-fallback"]
const _hoisted_879 = ["src"]
const _hoisted_880 = ["src"]
const _hoisted_881 = { style: {"padding":"0 2px","font-size":"12.5px","font-weight":"700","line-height":"1.25","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_882 = { style: {"padding":"0 2px","font-size":"11.5px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_883 = {
  key: 0,
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"}
}
const _hoisted_884 = {
  role: "group",
  "aria-label": "Langue de l’exemplaire",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_885 = ["onClick", "aria-pressed"]
const _hoisted_886 = {
  role: "group",
  "aria-label": "État de l’exemplaire",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_887 = ["onClick", "aria-pressed"]
const _hoisted_888 = { style: {"flex":"none","display":"grid","grid-template-columns":"minmax(0, 1fr) auto","gap":"10px","align-items":"end"} }
const _hoisted_889 = { style: {"display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_890 = ["value", "onInput"]
const _hoisted_891 = { style: {"display":"flex","flex-direction":"column","gap":"6px"} }
const _hoisted_892 = {
  class: "pkm-dark",
  style: {"display":"flex","align-items":"center","height":"52px","box-sizing":"border-box","border":"1px solid var(--pkm-line-2)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)"}
}
const _hoisted_893 = ["onClick"]
const _hoisted_894 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_895 = {
  "aria-live": "polite",
  style: {"min-width":"26px","text-align":"center","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"}
}
const _hoisted_896 = ["onClick"]
const _hoisted_897 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_898 = {
  key: 1,
  style: {"flex":"none","margin-top":"-8px","font-size":"12.5px","color":"var(--pkm-t4)"}
}
const _hoisted_899 = { style: {"flex":"none","margin":"0","padding":"0","border":"0","min-width":"0"} }
const _hoisted_900 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_901 = ["onClick", "aria-pressed"]
const _hoisted_902 = { style: {"flex":"none","display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_903 = ["value", "onInput"]
const _hoisted_904 = { style: {"font-weight":"400","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_905 = {
  key: 0,
  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"6px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"}
}
const _hoisted_906 = ["value", "onInput"]
const _hoisted_907 = { style: {"font-weight":"400","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_908 = {
  key: 3,
  style: {"flex":"none","margin":"0","padding":"0","border":"0","min-width":"0"}
}
const _hoisted_909 = { style: {"padding":"0","margin-bottom":"8px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }
const _hoisted_910 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"8px"} }
const _hoisted_911 = ["onClick", "aria-pressed"]
const _hoisted_912 = ["aria-label"]
const _hoisted_913 = { style: {"display":"flex","justify-content":"space-between","align-items":"baseline","gap":"8px"} }
const _hoisted_914 = { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t2)"} }
const _hoisted_915 = { style: {"display":"flex","flex-direction":"column","gap":"4px","font-size":"13px","color":"var(--pkm-t3)"} }
const _hoisted_916 = { style: {"color":"var(--pkm-t2)","font-variant-numeric":"tabular-nums","text-align":"right"} }
const _hoisted_917 = {
  key: 0,
  style: {"font-size":"13px","font-weight":"700","color":"var(--pkm-orange)"}
}
const _hoisted_918 = ["onClick", "disabled"]
const _hoisted_919 = {
  key: 7,
  "aria-label": "Bienvenue sur Dropicards",
  style: {"position":"absolute","inset":"0","z-index":"40","display":"flex","flex-direction":"column","overflow-y":"auto","scrollbar-width":"none","background":"radial-gradient(110% 55% at 50% 0%, rgba(var(--pkm-glow-rgb), 0.3), rgba(var(--pkm-glow-rgb), 0) 62%), var(--pkm-app)"}
}
const _hoisted_920 = { style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","min-height":"44px","padding":"14px 16px 0"} }
const _hoisted_921 = {
  "aria-hidden": "true",
  style: {"display":"flex","gap":"6px"}
}
const _hoisted_922 = ["onClick"]
const _hoisted_923 = {
  key: 0,
  style: {"flex":"1","display":"flex","flex-direction":"column","gap":"16px","padding":"8px 20px 24px"}
}
const _hoisted_924 = {
  "aria-hidden": "true",
  style: {"position":"relative","align-self":"center","width":"262px","height":"232px"}
}
const _hoisted_925 = ["src", "data-fallback"]
const _hoisted_926 = {
  class: "pkm-dark",
  style: {"display":"flex","flex-direction":"column","gap":"10px","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_927 = { style: {"display":"flex","align-items":"center","gap":"12px","font-size":"14px"} }
const _hoisted_928 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-accent)","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_929 = { style: {"display":"flex","align-items":"center","gap":"12px","font-size":"14px"} }
const _hoisted_930 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-accent)","stroke-width":"1.9","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_931 = { style: {"display":"flex","align-items":"center","gap":"12px","font-size":"14px"} }
const _hoisted_932 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-accent)","stroke-width":"1.9","stroke-linejoin":"round"}
}
const _hoisted_933 = ["onClick"]
const _hoisted_934 = {
  key: 1,
  style: {"flex":"1","display":"flex","flex-direction":"column","gap":"14px","padding":"8px 16px 24px"}
}
const _hoisted_935 = { style: {"padding":"0","margin-bottom":"8px","font-size":"14px","font-weight":"700"} }
const _hoisted_936 = { style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"6px"} }
const _hoisted_937 = ["onClick", "aria-pressed"]
const _hoisted_938 = { style: {"display":"flex","align-items":"center","gap":"12px"} }
const _hoisted_939 = {
  class: "pkm-dark",
  style: {"flex":"none","width":"42px","height":"42px","border-radius":"14px","background":"rgba(var(--pkm-ink-rgb), 0.5)","display":"flex","align-items":"center","justify-content":"center","color":"var(--pkm-t1)"}
}
const _hoisted_940 = ["d"]
const _hoisted_941 = { style: {"flex":"1","display":"flex","flex-direction":"column"} }
const _hoisted_942 = {
  role: "list",
  "aria-label": "Les trois profils",
  style: {"display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","gap":"6px"}
}
const _hoisted_943 = { style: {"display":"grid","grid-template-columns":"auto minmax(0, 1fr)","gap":"10px"} }
const _hoisted_944 = ["onClick"]
const _hoisted_945 = {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_946 = ["onClick"]
const _hoisted_947 = {
  key: 2,
  style: {"flex":"1","display":"flex","flex-direction":"column","align-items":"stretch","gap":"14px","padding":"8px 20px 24px"}
}
const _hoisted_948 = ["d"]
const _hoisted_949 = { style: {"display":"flex","flex-direction":"column","align-items":"center","gap":"2px","text-align":"center"} }
const _hoisted_950 = { style: {"margin":"0","font-size":"15px","line-height":"1.5","color":"var(--pkm-t2)","text-align":"center"} }
const _hoisted_951 = {
  class: "pkm-dark",
  "aria-label": "Ce qu’on a préparé pour toi",
  style: {"display":"flex","flex-direction":"column","gap":"10px","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_952 = ["onClick"]
const _hoisted_953 = { style: {"display":"grid","grid-template-columns":"repeat(2, minmax(0, 1fr))","gap":"10px","margin-top":"-4px"} }
const _hoisted_954 = ["onClick"]
const _hoisted_955 = ["onClick"]
const _hoisted_956 = ["aria-label"]
const _hoisted_957 = ["onClick"]
const _hoisted_958 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2.2","stroke-linecap":"round"}
}
const _hoisted_959 = { style: {"flex":"1 1 auto","min-height":"0","width":"100%","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_960 = ["src", "data-fallback", "alt", "onClick"]
const _hoisted_961 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"center","gap":"2px","text-align":"center"} }
const _hoisted_962 = { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600"} }
const _hoisted_963 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_964 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)"} }
const _hoisted_965 = {
  key: 9,
  style: {"position":"absolute","inset":"0","z-index":"30","display":"flex","flex-direction":"column","background":"rgba(var(--pkm-scrim-rgb), 0.62)"}
}
const _hoisted_966 = ["onClick"]
const _hoisted_967 = {
  class: "pkm-dark",
  "aria-label": "Choisis ton compagnon",
  role: "dialog",
  "aria-modal": "true",
  style: {"flex":"none","height":"78%","box-sizing":"border-box","background":"var(--pkm-card-2)","border-top":"1px solid var(--pkm-line-3)","border-radius":"28px 28px 0 0","padding":"8px 16px 18px","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
}
const _hoisted_968 = { style: {"flex":"none","display":"flex","align-items":"center","justify-content":"space-between","gap":"8px"} }
const _hoisted_969 = ["onClick"]
const _hoisted_970 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_971 = {
  class: "pkm-dark",
  style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","height":"48px","padding":"0 16px","border-radius":"999px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
}
const _hoisted_972 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t3)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_973 = ["value", "onInput"]
const _hoisted_974 = { style: {"flex":"none","font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_975 = {
  role: "group",
  "aria-label": "Compagnons",
  style: {"flex":"1 1 auto","min-height":"0","overflow-y":"auto","scrollbar-width":"none","display":"grid","grid-template-columns":"repeat(3, minmax(0, 1fr))","align-content":"start","gap":"8px"}
}
const _hoisted_976 = ["onClick", "aria-pressed", "aria-label"]
const _hoisted_977 = ["src"]
const _hoisted_978 = { style: {"max-width":"100%","font-size":"12.5px","font-weight":"600","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_979 = { style: {"flex":"none","margin":"0","font-size":"11px","line-height":"1.4","color":"var(--pkm-t4)"} }
const _hoisted_980 = {
  key: 10,
  class: "pkm-dark",
  "aria-label": "Radar des boutiques",
  style: {"position":"absolute","inset":"0","z-index":"15","overflow":"hidden","background":"#05080F","color":"var(--pkm-t1)"}
}
const _hoisted_981 = {
  class: "pkm-dark",
  style: {"position":"absolute","left":"0","right":"0","top":"0","z-index":"3","display":"flex","flex-direction":"column","gap":"8px","padding":"14px 14px 10px","background":"linear-gradient(180deg, rgba(var(--pkm-deep-rgb), 0.85), rgba(var(--pkm-deep-rgb), 0))","color":"var(--pkm-t1)"}
}
const _hoisted_982 = { style: {"display":"flex","align-items":"center","gap":"8px"} }
const _hoisted_983 = ["onClick"]
const _hoisted_984 = {
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_985 = {
  class: "pkm-dark",
  "aria-label": "Secteur",
  style: {"flex":"1","min-width":"0","display":"flex","align-items":"center","gap":"0","height":"44px","padding":"0 6px","box-sizing":"border-box","border-radius":"22px","border":"1px solid rgba(var(--pkm-hl-rgb), 0.12)","background":"rgba(var(--pkm-ink-rgb), 0.86)","overflow-x":"auto","scrollbar-width":"none","color":"var(--pkm-t1)"}
}
const _hoisted_986 = {
  key: 0,
  "aria-hidden": "true",
  style: {"flex":"none","color":"var(--pkm-t5)","font-size":"14px"}
}
const _hoisted_987 = ["onClick", "aria-current"]
const _hoisted_988 = ["onClick", "aria-pressed"]
const _hoisted_989 = {
  role: "group",
  "aria-label": "Produit recherché",
  style: {"display":"flex","gap":"6px","overflow-x":"auto","scrollbar-width":"none","margin":"0 -14px","padding":"0 14px"}
}
const _hoisted_990 = ["onClick", "aria-pressed"]
const _hoisted_991 = {
  key: 0,
  class: "pkm-dark",
  "aria-hidden": "true",
  style: {"align-self":"flex-start","display":"flex","align-items":"center","gap":"10px","padding":"4px 10px","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.82)","font-size":"11px","font-weight":"600","color":"var(--pkm-t2)"}
}
const _hoisted_992 = {
  id: "pkm-radar-sheet",
  style: {"flex":"1","min-height":"0","overflow-y":"auto","scrollbar-width":"none","padding":"16px 16px 18px","display":"flex","flex-direction":"column","gap":"12px"}
}
const _hoisted_993 = ["onClick"]
const _hoisted_994 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_995 = ["aria-label"]
const _hoisted_996 = { style: {"display":"flex","align-items":"flex-start","gap":"12px"} }
const _hoisted_997 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"3px"} }
const _hoisted_998 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"19px","font-weight":"600","letter-spacing":"-0.02em"} }
const _hoisted_999 = { style: {"font-size":"13px","color":"var(--pkm-t2)"} }
const _hoisted_1000 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_1001 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"4px"} }
const _hoisted_1002 = { style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }
const _hoisted_1003 = ["onClick", "aria-expanded"]
const _hoisted_1004 = {
  key: 0,
  class: "pkm-dark",
  style: {"display":"flex","flex-direction":"column","gap":"6px","padding":"12px 14px","border-radius":"16px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card-2)","color":"var(--pkm-t1)"}
}
const _hoisted_1005 = { style: {"color":"var(--pkm-t2)"} }
const _hoisted_1006 = { style: {"font-size":"12px","color":"var(--pkm-t4)"} }
const _hoisted_1007 = {
  key: 1,
  style: {"display":"flex","flex-direction":"column","gap":"2px","padding":"11px 14px","border-radius":"16px","border":"1px solid var(--pkm-line)"}
}
const _hoisted_1008 = { style: {"font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t2)"} }
const _hoisted_1009 = {
  key: 2,
  style: {"margin":"0","font-size":"13px","line-height":"1.45","color":"var(--pkm-t2)"}
}
const _hoisted_1010 = { style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_1011 = ["href"]
const _hoisted_1012 = ["onClick", "aria-pressed"]
const _hoisted_1013 = ["href", "aria-label"]
const _hoisted_1014 = ["href", "aria-label"]
const _hoisted_1015 = { style: {"display":"flex","flex-wrap":"wrap","gap":"4px 18px"} }
const _hoisted_1016 = ["href"]
const _hoisted_1017 = ["href"]
const _hoisted_1018 = { style: {"display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_1019 = { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.02em"} }
const _hoisted_1020 = { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }
const _hoisted_1021 = {
  key: 0,
  role: "status",
  style: {"margin":"0","padding":"10px 12px","border-radius":"14px","background":"rgba(var(--pkm-orange-rgb), 0.12)","color":"var(--pkm-sand)","font-size":"13px","line-height":"1.45"}
}
const _hoisted_1022 = ["onClick"]
const _hoisted_1023 = { style: {"display":"grid","grid-template-columns":"minmax(0, 1fr) minmax(0, 1fr)","gap":"10px"} }
const _hoisted_1024 = ["onClick", "disabled"]
const _hoisted_1025 = ["onClick", "aria-pressed"]
const _hoisted_1026 = {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_1027 = {
  key: 2,
  role: "group",
  "aria-label": "Rayon autour de toi",
  style: {"display":"flex","gap":"8px"}
}
const _hoisted_1028 = ["onClick", "aria-pressed"]
const _hoisted_1029 = {
  key: 3,
  style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"}
}
const _hoisted_1030 = {
  key: 4,
  style: {"margin":"0","padding":"8px 0","font-size":"13.5px","color":"var(--pkm-t3)"}
}
const _hoisted_1031 = { style: {"font-size":"12.5px","color":"var(--pkm-t4)"} }
const _hoisted_1032 = {
  class: "pkm-dark",
  style: {"border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_1033 = ["onClick", "aria-label"]
const _hoisted_1034 = { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"2px"} }
const _hoisted_1035 = { style: {"font-size":"14px","font-weight":"700","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_1036 = { style: {"font-size":"12px","color":"var(--pkm-t3)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_1037 = { style: {"font-size":"11.5px","color":"var(--pkm-t4)","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_1038 = { style: {"flex":"none","display":"flex","flex-direction":"column","align-items":"flex-end","gap":"3px"} }
const _hoisted_1039 = { style: {"font-size":"12.5px","font-weight":"700","color":"var(--pkm-t2)"} }
const _hoisted_1040 = {
  class: "pkm-dark",
  style: {"border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","overflow":"hidden","display":"flex","flex-direction":"column","color":"var(--pkm-t1)"}
}
const _hoisted_1041 = ["onClick", "aria-label"]
const _hoisted_1042 = { style: {"flex":"1","min-width":"0","font-size":"14px","font-weight":"600","white-space":"nowrap","overflow":"hidden","text-overflow":"ellipsis"} }
const _hoisted_1043 = { style: {"flex":"none","font-size":"13px","font-weight":"700","font-variant-numeric":"tabular-nums","color":"var(--pkm-teal)"} }
const _hoisted_1044 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"flex":"none","fill":"none","stroke":"var(--pkm-t4)","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"}
}
const _hoisted_1045 = { style: {"margin":"0","font-size":"11px","line-height":"1.45","color":"var(--pkm-t5)"} }
const _hoisted_1046 = { style: {"flex":"none","width":"26px","height":"26px","border-radius":"13px","background":"rgba(var(--pkm-green-rgb), 0.16)","display":"flex","align-items":"center","justify-content":"center"} }
const _hoisted_1047 = {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  style: {"fill":"none","stroke":"var(--pkm-green)","stroke-width":"2.6","stroke-linecap":"round","stroke-linejoin":"round"}
}

return function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    (_ctx.V.ui.headerHome)
      ? (_openBlock(), _createElementBlock("header", _hoisted_2, [
          _cache[0] || (_cache[0] = _createElementVNode("span", {
            class: "pkm-dark",
            style: {"justify-self":"start","display":"flex","align-items":"center","gap":"8px","height":"36px","padding":"0 12px","border-radius":"999px","background":"var(--pkm-card)","border":"1px solid var(--pkm-line)","font-size":"13px","font-weight":"600","color":"var(--pkm-t2)"}
          }, [
            _createElementVNode("span", { style: {"flex":"none","width":"18px","height":"12px","border-radius":"2px","background":"linear-gradient(90deg, #0055A4 0 33.3%, #FFFFFF 33.3% 66.6%, #EF4135 66.6%)"} }),
            _createTextVNode("FR")
          ], -1 /* CACHED */)),
          _cache[1] || (_cache[1] = _createElementVNode("span", { style: {"display":"flex","align-items":"center"} }, [
            _createElementVNode("img", {
              src: "img/brand/dropicards-header.png",
              alt: "Dropicards",
              width: "562",
              height: "76",
              style: {"display":"block","width":"min(196px, calc(100vw - 194px))","height":"auto"}
            })
          ], -1 /* CACHED */)),
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
            }, null, 12 /* STYLE, PROPS */, _hoisted_4)
          ], 8 /* PROPS */, _hoisted_3)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.headerBig)
      ? (_openBlock(), _createElementBlock("header", _hoisted_5, [
          _createElementVNode("h1", _hoisted_6, _toDisplayString(_ctx.V.ui.title), 1 /* TEXT */),
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
            }, null, 12 /* STYLE, PROPS */, _hoisted_8)
          ], 8 /* PROPS */, _hoisted_7)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.headerDetail)
      ? (_openBlock(), _createElementBlock("header", _hoisted_9, [
          _createElementVNode("button", {
            class: "pkm-dark",
            type: "button",
            onClick: _ctx.V.goBack,
            "aria-label": "Retour",
            style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid var(--pkm-line)","border-radius":"22px","background":"var(--pkm-card)","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
          }, [
            (_openBlock(), _createElementBlock("svg", _hoisted_11, [...(_cache[2] || (_cache[2] = [
              _createElementVNode("path", { d: "M15 5l-7 7 7 7" }, null, -1 /* CACHED */)
            ]))]))
          ], 8 /* PROPS */, _hoisted_10),
          _createElementVNode("div", _hoisted_12, [
            _createElementVNode("h1", _hoisted_13, _toDisplayString(_ctx.V.ui.title), 1 /* TEXT */),
            (_ctx.V.ui.hasSubtitle)
              ? (_openBlock(), _createElementBlock("span", _hoisted_14, _toDisplayString(_ctx.V.ui.subtitle), 1 /* TEXT */))
              : _createCommentVNode("v-if", true)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.hasSubRow)
      ? (_openBlock(), _createElementBlock("div", _hoisted_15, [
          _createElementVNode("span", null, _toDisplayString(_ctx.V.ui.syncText), 1 /* TEXT */),
          (_ctx.V.ui.adv)
            ? (_openBlock(), _createElementBlock("span", _hoisted_16, "Mode avancé"))
            : _createCommentVNode("v-if", true)
        ]))
      : _createCommentVNode("v-if", true),
    _createElementVNode("main", _hoisted_17, [
      (_ctx.V.ui.isHome)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
            _createElementVNode("section", _hoisted_18, [
              _createElementVNode("div", _hoisted_19, [
                (_openBlock(), _createElementBlock("svg", _hoisted_20, [...(_cache[3] || (_cache[3] = [
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
                  "aria-label": "Rechercher dans le catalogue",
                  placeholder: "Rechercher une carte, un produit…",
                  value: _ctx.V.home.hs.q,
                  onInput: _ctx.V.home.hs.onQ,
                  style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px"}
                }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_21),
                (_ctx.V.home.hs.hasQ)
                  ? (_openBlock(), _createElementBlock("button", {
                      key: 0,
                      type: "button",
                      onClick: _ctx.V.home.hs.clear,
                      "aria-label": "Effacer la recherche",
                      style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"0","border-radius":"22px","background":"transparent","color":"var(--pkm-t3)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                    }, [
                      (_openBlock(), _createElementBlock("svg", _hoisted_23, [...(_cache[4] || (_cache[4] = [
                        _createElementVNode("path", { d: "M6 6l12 12M18 6L6 18" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_22))
                  : _createCommentVNode("v-if", true)
              ]),
              (_ctx.V.home.hs.open)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                    _createElementVNode("span", _hoisted_24, _toDisplayString(_ctx.V.home.hs.status), 1 /* TEXT */),
                    (_ctx.V.home.hs.hasRows)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_25, [
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.hs.rows || []), (hsr, hsr_i) => {
                            return (_openBlock(), _createElementBlock("button", {
                              key: hsr_i,
                              type: "button",
                              onClick: hsr.open,
                              style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 10px 14px; border: 0; border-top: ${hsr.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                            }, [
                              _createElementVNode("span", {
                                style: _normalizeStyle(`position: relative; flex: none; width: calc(${hsr.wk} * 42px); height: calc(${hsr.hk} * 56px); outline: ${hsr.ring}; outline-offset: -1.5px; border-radius: 8px; overflow: hidden; background: ${hsr.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                              }, [
                                (hsr.isCard)
                                  ? (_openBlock(), _createElementBlock("img", {
                                      key: 0,
                                      src: hsr.img,
                                      "data-fallback": hsr.fallback,
                                      alt: "",
                                      loading: "lazy",
                                      style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                                    }, null, 8 /* PROPS */, _hoisted_27))
                                  : _createCommentVNode("v-if", true),
                                (hsr.sealedArt)
                                  ? (_openBlock(), _createElementBlock("img", {
                                      key: 1,
                                      src: hsr.logo,
                                      "data-broken": "1",
                                      alt: "",
                                      style: {"max-width":"36px","max-height":"26px","object-fit":"contain"}
                                    }, null, 8 /* PROPS */, _hoisted_28))
                                  : _createCommentVNode("v-if", true),
                                (hsr.hasPhoto)
                                  ? (_openBlock(), _createElementBlock("img", {
                                      key: 2,
                                      src: hsr.photo,
                                      "data-broken": "1",
                                      alt: "",
                                      loading: "lazy",
                                      style: {"width":"100%","height":"100%","object-fit":"cover"}
                                    }, null, 8 /* PROPS */, _hoisted_29))
                                  : _createCommentVNode("v-if", true)
                              ], 4 /* STYLE */),
                              _createElementVNode("span", _hoisted_30, [
                                _createElementVNode("span", _hoisted_31, _toDisplayString(hsr.name), 1 /* TEXT */),
                                _createElementVNode("span", _hoisted_32, [
                                  _createElementVNode("span", _hoisted_33, _toDisplayString(hsr.sub), 1 /* TEXT */),
                                  (hsr.owned)
                                    ? (_openBlock(), _createElementBlock("span", _hoisted_34, "à toi"))
                                    : _createCommentVNode("v-if", true)
                                ])
                              ]),
                              _createElementVNode("span", _hoisted_35, [
                                _createElementVNode("span", _hoisted_36, _toDisplayString(hsr.cote), 1 /* TEXT */),
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`font-size: 12px; font-weight: 700; color: ${hsr.rightColor}`)
                                }, _toDisplayString(hsr.right), 5 /* TEXT, STYLE */)
                              ])
                            ], 12 /* STYLE, PROPS */, _hoisted_26))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.home.hs.hasMore)
                      ? (_openBlock(), _createElementBlock("button", {
                          key: 1,
                          type: "button",
                          onClick: _ctx.V.home.hs.more,
                          style: {"flex":"none","height":"44px","padding":"0 6px","border":"0","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"14px","font-weight":"600","text-align":"left","cursor":"pointer"}
                        }, _toDisplayString(_ctx.V.home.hs.moreLabel), 9 /* TEXT, PROPS */, _hoisted_37))
                      : _createCommentVNode("v-if", true)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_38, [
              _createElementVNode("div", _hoisted_39, [
                _createElementVNode("div", _hoisted_40, [
                  _createElementVNode("div", _hoisted_41, [
                    _cache[7] || (_cache[7] = _createTextVNode("Ma collection ", -1 /* CACHED */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.toggleMask,
                      "aria-label": _ctx.A(_ctx.V.ui.maskLabel),
                      "aria-pressed": _ctx.A(_ctx.V.ui.masked),
                      style: {"width":"44px","height":"44px","margin":"-10px -6px -10px 0","padding":"0","border":"0","background":"transparent","color":"var(--pkm-t3)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                    }, [
                      (_openBlock(), _createElementBlock("svg", _hoisted_43, [
                        _cache[5] || (_cache[5] = _createElementVNode("path", { d: "M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" }, null, -1 /* CACHED */)),
                        _cache[6] || (_cache[6] = _createElementVNode("circle", {
                          cx: "12",
                          cy: "12",
                          r: "2.8"
                        }, null, -1 /* CACHED */)),
                        _createElementVNode("path", {
                          d: _ctx.V.ui.eyeSlash
                        }, null, 8 /* PROPS */, _hoisted_44)
                      ]))
                    ], 8 /* PROPS */, _hoisted_42)
                  ]),
                  _createElementVNode("div", {
                    class: "pkm-logo-text",
                    style: _normalizeStyle(`font-family: 'Luckiest Guy', 'Sora', sans-serif; font-size: 36px; font-size: min(46px, calc((100cqw - 112px) / ${_ctx.V.home.hv.fit})); line-height: 1.12; letter-spacing: 0.03em; white-space: nowrap; padding: 0.02em 0.12em 0.1em 0.05em; margin-left: -0.05em; color: var(--pkm-white)`)
                  }, _toDisplayString(_ctx.V.home.hv.value), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", _hoisted_45, _toDisplayString(_ctx.V.home.units), 1 /* TEXT */)
                ]),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.hb.open,
                  "aria-label": _ctx.A(_ctx.V.hb.aria),
                  style: {"flex":"none","position":"relative","width":"96px","height":"96px","margin":"-10px -10px -8px 0","padding":"0","border":"0","border-radius":"24px","background":"radial-gradient(closest-side, rgba(var(--pkm-accent-rgb), 0.24), rgba(var(--pkm-accent-rgb), 0))","cursor":"pointer"}
                }, [
                  _createElementVNode("img", {
                    class: "pkm-buddy",
                    src: _ctx.V.hb.src,
                    alt: "",
                    width: "96",
                    height: "96",
                    style: _normalizeStyle(`display: block; width: 96px; height: 96px; object-fit: contain; image-rendering: pixelated; transform: ${_ctx.V.hb.scale}`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_47),
                  _createElementVNode("span", _hoisted_48, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_49, [...(_cache[8] || (_cache[8] = [
                      _createElementVNode("path", { d: "M4 7h13l-3-3 M20 17H7l3 3" }, null, -1 /* CACHED */)
                    ]))]))
                  ])
                ], 8 /* PROPS */, _hoisted_46)
              ]),
              _createElementVNode("span", {
                style: _normalizeStyle(`margin-top: 2px; font-size: 13px; font-weight: 700; color: ${_ctx.V.home.hv.color}`)
              }, _toDisplayString(_ctx.V.home.hv.delta), 5 /* TEXT, STYLE */),
              (_openBlock(), _createElementBlock("svg", {
                width: "100%",
                height: "64",
                viewBox: "0 0 324 64",
                preserveAspectRatio: "none",
                role: "img",
                "aria-label": _ctx.A(_ctx.V.home.hv.aria),
                style: {"display":"block","overflow":"visible"}
              }, [
                _createElementVNode("path", {
                  d: _ctx.V.home.hv.area,
                  style: _normalizeStyle(`fill: ${_ctx.V.home.hv.color}; fill-opacity: 0.12; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_51),
                _createElementVNode("path", {
                  d: _ctx.V.home.hv.line,
                  style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.home.hv.color}; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_52)
              ], 8 /* PROPS */, _hoisted_50)),
              _cache[10] || (_cache[10] = _createStaticVNode("<div aria-hidden=\"true\" style=\"position:relative;height:15px;font-size:11px;color:var(--pkm-t4);\"><span style=\"position:absolute;left:0;\">30 j</span><span style=\"position:absolute;left:33.33%;transform:translateX(-50%);\">7 j</span><span style=\"position:absolute;left:66.67%;transform:translateX(-50%);\">hier</span><span style=\"position:absolute;right:0;\">aujourd’hui</span></div>", 1)),
              _createElementVNode("span", _hoisted_53, _toDisplayString(_ctx.V.home.hv.source), 1 /* TEXT */),
              _createElementVNode("div", _hoisted_54, [
                _cache[9] || (_cache[9] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "Plus-value latente", -1 /* CACHED */)),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${_ctx.V.home.latentColor}`)
                }, _toDisplayString(_ctx.V.home.latent), 5 /* TEXT, STYLE */)
              ]),
              _createElementVNode("span", _hoisted_55, _toDisplayString(_ctx.V.home.stamp), 1 /* TEXT */),
              (_ctx.V.home.hasUnk)
                ? (_openBlock(), _createElementBlock("span", _hoisted_56, _toDisplayString(_ctx.V.home.unkNote), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_57, [
              _cache[14] || (_cache[14] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Mon classeur", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_58, [
                _cache[13] || (_cache[13] = _createElementVNode("img", {
                  src: "img/brand/classeur.svg",
                  alt: "",
                  width: "132",
                  height: "107",
                  style: {"align-self":"center","display":"block","width":"132px","height":"auto"}
                }, null, -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_59, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.hk.tabs || []), (hkt, hkt_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: hkt_i,
                      type: "button",
                      role: "tab",
                      onClick: hkt.pick,
                      "aria-selected": _ctx.A(hkt.on),
                      style: _normalizeStyle(`min-width: 0; height: 40px; padding: 0 4px; border-radius: 999px; border: 1px solid ${hkt.bc}; background: ${hkt.bg}; color: ${hkt.fg}; font: inherit; font-size: 13.5px; font-size: min(13.5px, 3.55vw); font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; cursor: pointer`)
                    }, _toDisplayString(hkt.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_60))
                  }), 128 /* KEYED_FRAGMENT */))
                ]),
                _createElementVNode("div", {
                  role: "tabpanel",
                  "aria-label": _ctx.A(_ctx.V.home.hk.tabLabel),
                  style: {"display":"flex","flex-direction":"column","gap":"10px"}
                }, [
                  _createElementVNode("span", _hoisted_62, _toDisplayString(_ctx.V.home.hk.summary), 1 /* TEXT */),
                  (_ctx.V.home.hk.cardsTab)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_63, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.hk.cards || []), (hkc, hkc_i) => {
                          return (_openBlock(), _createElementBlock("button", {
                            key: hkc_i,
                            class: "pkm-dark",
                            type: "button",
                            onClick: hkc.open,
                            "aria-label": _ctx.A(hkc.label),
                            style: {"position":"relative","display":"block","width":"100%","aspect-ratio":"600 / 825","padding":"0","border":"0","border-radius":"5% / 3.6%","overflow":"hidden","background":"var(--pkm-img-bg)","box-shadow":"0 6px 14px rgba(var(--pkm-shadow-rgb), 0.35), inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.08)","cursor":"pointer","color":"var(--pkm-t1)"}
                          }, [
                            _createElementVNode("img", {
                              src: hkc.img,
                              "data-fallback": hkc.fallback,
                              srcset: hkc.srcset,
                              sizes: "(max-width: 520px) 30vw, 118px",
                              alt: "",
                              loading: "lazy",
                              decoding: "async",
                              style: {"display":"block","width":"100%","height":"100%","object-fit":"cover"}
                            }, null, 8 /* PROPS */, _hoisted_65),
                            (hkc.graded)
                              ? (_openBlock(), _createElementBlock("span", _hoisted_66, _toDisplayString(hkc.grade), 1 /* TEXT */))
                              : _createCommentVNode("v-if", true),
                            (hkc.many)
                              ? (_openBlock(), _createElementBlock("span", _hoisted_67, _toDisplayString(hkc.qty), 1 /* TEXT */))
                              : _createCommentVNode("v-if", true),
                            _createElementVNode("span", _hoisted_68, [
                              _createElementVNode("span", {
                                style: _normalizeStyle(`flex: none; width: 14px; height: 10px; border-radius: 2px; background: ${hkc.flag}`)
                              }, null, 4 /* STYLE */),
                              _createElementVNode("span", _hoisted_69, _toDisplayString(hkc.cote), 1 /* TEXT */),
                              _createElementVNode("span", {
                                style: _normalizeStyle(`flex: none; width: 7px; height: 7px; border-radius: 4px; background: ${hkc.condColor}`)
                              }, null, 4 /* STYLE */)
                            ])
                          ], 8 /* PROPS */, _hoisted_64))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.home.hk.sealedTab)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_70, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.hk.sealed || []), (hks, hks_i) => {
                          return (_openBlock(), _createElementBlock("button", {
                            key: hks_i,
                            class: "pkm-dark",
                            type: "button",
                            onClick: hks.open,
                            "aria-label": _ctx.A(hks.label),
                            style: {"display":"flex","flex-direction":"column","min-width":"0","padding":"0","border":"1px solid var(--pkm-line-3)","border-radius":"18px","overflow":"hidden","background":"var(--pkm-card)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                          }, [
                            _createElementVNode("span", {
                              style: _normalizeStyle(`position: relative; display: block; width: 100%; aspect-ratio: 4 / 3; background: ${hks.bg}`)
                            }, [
                              (hks.hasPhoto)
                                ? (_openBlock(), _createElementBlock("img", {
                                    key: 0,
                                    src: hks.photo,
                                    "data-broken": "1",
                                    alt: "",
                                    loading: "lazy",
                                    style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"contain"}
                                  }, null, 8 /* PROPS */, _hoisted_72))
                                : _createCommentVNode("v-if", true),
                              (hks.sealedArt)
                                ? (_openBlock(), _createElementBlock("img", {
                                    key: 1,
                                    src: hks.logo,
                                    "data-broken": "1",
                                    alt: "",
                                    loading: "lazy",
                                    style: {"position":"absolute","left":"15%","top":"16%","width":"70%","height":"46%","object-fit":"contain"}
                                  }, null, 8 /* PROPS */, _hoisted_73))
                                : _createCommentVNode("v-if", true),
                              (hks.many)
                                ? (_openBlock(), _createElementBlock("span", _hoisted_74, _toDisplayString(hks.qty), 1 /* TEXT */))
                                : _createCommentVNode("v-if", true),
                              _createElementVNode("span", _hoisted_75, [
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`flex: none; width: 14px; height: 10px; border-radius: 2px; background: ${hks.flag}`)
                                }, null, 4 /* STYLE */),
                                _createElementVNode("span", _hoisted_76, _toDisplayString(hks.cote), 1 /* TEXT */),
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`flex: none; width: 7px; height: 7px; border-radius: 4px; background: ${hks.condColor}`)
                                }, null, 4 /* STYLE */)
                              ])
                            ], 4 /* STYLE */),
                            _createElementVNode("span", _hoisted_77, [
                              _createElementVNode("span", _hoisted_78, _toDisplayString(hks.name), 1 /* TEXT */),
                              _createElementVNode("span", _hoisted_79, _toDisplayString(hks.sub), 1 /* TEXT */)
                            ])
                          ], 8 /* PROPS */, _hoisted_71))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.home.hk.empty)
                    ? (_openBlock(), _createElementBlock("p", _hoisted_80, _toDisplayString(_ctx.V.home.hk.emptyText), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.home.hk.hasPages)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_81, [
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.home.hk.prev,
                          "aria-label": "Page précédente",
                          "aria-disabled": _ctx.A(_ctx.V.home.hk.prevOff),
                          style: _normalizeStyle(`flex: none; width: 44px; height: 44px; padding: 0; border: 1px solid var(--pkm-line-2); border-radius: 22px; background: transparent; color: var(--pkm-t1); display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: ${_ctx.V.home.hk.prevDim}`)
                        }, [
                          (_openBlock(), _createElementBlock("svg", _hoisted_83, [...(_cache[11] || (_cache[11] = [
                            _createElementVNode("path", { d: "M15 6l-6 6 6 6" }, null, -1 /* CACHED */)
                          ]))]))
                        ], 12 /* STYLE, PROPS */, _hoisted_82),
                        _createElementVNode("span", _hoisted_84, _toDisplayString(_ctx.V.home.hk.pageLabel), 1 /* TEXT */),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.home.hk.next,
                          "aria-label": "Page suivante",
                          "aria-disabled": _ctx.A(_ctx.V.home.hk.nextOff),
                          style: _normalizeStyle(`flex: none; width: 44px; height: 44px; padding: 0; border: 1px solid var(--pkm-line-2); border-radius: 22px; background: transparent; color: var(--pkm-t1); display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: ${_ctx.V.home.hk.nextDim}`)
                        }, [
                          (_openBlock(), _createElementBlock("svg", _hoisted_86, [...(_cache[12] || (_cache[12] = [
                            _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                          ]))]))
                        ], 12 /* STYLE, PROPS */, _hoisted_85)
                      ]))
                    : _createCommentVNode("v-if", true)
                ], 8 /* PROPS */, _hoisted_61)
              ])
            ]),
            _createElementVNode("section", _hoisted_87, [
              _createElementVNode("div", _hoisted_88, [
                _cache[15] || (_cache[15] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Boutiques autour de toi", -1 /* CACHED */)),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.home.hr.list,
                  style: {"height":"44px","padding":"0 2px","border":"0","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                }, "Voir la liste", 8 /* PROPS */, _hoisted_89)
              ]),
              (_ctx.V.home.hr.needPos)
                ? (_openBlock(), _createElementBlock("div", _hoisted_90, [
                    _cache[18] || (_cache[18] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t2)"} }, "Active ta position : le radar repère les vraies boutiques autour de toi (cartes, jeux, jouets, grandes surfaces), avec leur nom, leur ville et leur chance d’avoir du Pokémon.", -1 /* CACHED */)),
                    (_ctx.V.home.hr.hasMsg)
                      ? (_openBlock(), _createElementBlock("p", _hoisted_91, _toDisplayString(_ctx.V.home.hr.msg), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.home.hr.tap,
                      "aria-label": _ctx.A(_ctx.V.home.hr.tapLabel),
                      style: {"align-self":"center","position":"relative","width":"132px","height":"132px","margin":"2px 0","padding":"0","border":"0","border-radius":"66px","background":"transparent","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_93, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_94, [...(_cache[16] || (_cache[16] = [
                          _createElementVNode("path", {
                            d: "M-60 0H60 M0 -60V60",
                            style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.25)","stroke-width":"1"}
                          }, null, -1 /* CACHED */),
                          _createElementVNode("circle", {
                            cx: "0",
                            cy: "0",
                            r: "20",
                            style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.45)","stroke-width":"1","stroke-dasharray":"3 4"}
                          }, null, -1 /* CACHED */),
                          _createElementVNode("circle", {
                            cx: "0",
                            cy: "0",
                            r: "40",
                            style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.45)","stroke-width":"1","stroke-dasharray":"3 4"}
                          }, null, -1 /* CACHED */),
                          _createElementVNode("circle", {
                            cx: "0",
                            cy: "0",
                            r: "58",
                            style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.45)","stroke-width":"1","stroke-dasharray":"3 4"}
                          }, null, -1 /* CACHED */)
                        ]))])),
                        _cache[17] || (_cache[17] = _createStaticVNode("<span class=\"pkm-anim\" style=\"position:absolute;inset:0;border-radius:66px;background:conic-gradient(from -70deg, rgba(var(--pkm-accent-rgb), 0) 0deg, rgba(var(--pkm-accent-rgb), 0.55) 70deg, rgba(var(--pkm-accent-rgb), 0) 70.5deg);animation:pkmSpin 2.6s linear infinite;\"></span><span class=\"pkm-anim\" style=\"position:absolute;left:92px;top:27px;width:8px;height:8px;border-radius:4px;background:var(--pkm-accent);animation:pkmBlip 2.6s ease-out -2.31s infinite;\"></span><span class=\"pkm-anim\" style=\"position:absolute;left:88px;top:76px;width:8px;height:8px;border-radius:4px;background:var(--pkm-accent);animation:pkmBlip 2.6s ease-out -1.75s infinite;\"></span><span class=\"pkm-anim\" style=\"position:absolute;left:38px;top:108px;width:8px;height:8px;border-radius:4px;background:var(--pkm-accent);animation:pkmBlip 2.6s ease-out -1.10s infinite;\"></span><span class=\"pkm-anim\" style=\"position:absolute;left:41px;top:50px;width:8px;height:8px;border-radius:4px;background:var(--pkm-accent);animation:pkmBlip 2.6s ease-out -0.43s infinite;\"></span><span style=\"position:absolute;left:60px;top:60px;width:12px;height:12px;border-radius:6px;background:var(--pkm-accent);box-shadow:0 0 0 4px rgba(var(--pkm-accent-rgb), 0.3);\"></span>", 6))
                      ])
                    ], 8 /* PROPS */, _hoisted_92),
                    _createElementVNode("div", _hoisted_95, [
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.home.hr.locate,
                        style: {"height":"48px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"14.5px","font-weight":"700","cursor":"pointer"}
                      }, "Me localiser", 8 /* PROPS */, _hoisted_96),
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.home.hr.france,
                        style: {"height":"48px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14.5px","font-weight":"700","cursor":"pointer"}
                      }, "Carte de France", 8 /* PROPS */, _hoisted_97)
                    ]),
                    _cache[19] || (_cache[19] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","line-height":"1.45","color":"var(--pkm-t4)"} }, "Ta position reste sur ton téléphone : arrondie à 100 m environ, elle n’est ni enregistrée ni envoyée.", -1 /* CACHED */))
                  ]))
                : _createCommentVNode("v-if", true),
              (_ctx.V.home.hr.loading)
                ? (_openBlock(), _createElementBlock("p", _hoisted_98, "Chargement des boutiques…"))
                : _createCommentVNode("v-if", true),
              (_ctx.V.home.hr.located)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                    _createElementVNode("div", _hoisted_99, [
                      (_openBlock(), _createElementBlock("svg", _hoisted_100, [
                        _cache[20] || (_cache[20] = _createElementVNode("path", {
                          d: "M-168 0H168 M0 -168V168",
                          style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.12)","stroke-width":"1"}
                        }, null, -1 /* CACHED */)),
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.hr.rings || []), (hrr, hrr_i) => {
                          return (_openBlock(), _createElementBlock(_Fragment, { key: hrr_i }, [
                            _createElementVNode("circle", {
                              cx: "0",
                              cy: "0",
                              r: hrr.r,
                              style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.4)","stroke-width":"1","stroke-dasharray":"3 4"}
                            }, null, 8 /* PROPS */, _hoisted_101),
                            _createElementVNode("text", {
                              x: "5",
                              y: hrr.ly,
                              style: {"fill":"var(--pkm-t3)","font-size":"10px","font-weight":"600","font-family":"'Plus Jakarta Sans', sans-serif"}
                            }, _toDisplayString(hrr.label), 9 /* TEXT, PROPS */, _hoisted_102)
                          ], 64 /* STABLE_FRAGMENT */))
                        }), 128 /* KEYED_FRAGMENT */))
                      ])),
                      _cache[21] || (_cache[21] = _createElementVNode("span", {
                        "aria-hidden": "true",
                        style: {"position":"absolute","left":"50%","top":"6px","transform":"translateX(-50%)","font-size":"11px","font-weight":"800","color":"var(--pkm-t3)"}
                      }, "N", -1 /* CACHED */)),
                      (_ctx.V.home.hr.sweeping)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_103))
                        : _createCommentVNode("v-if", true),
                      _cache[22] || (_cache[22] = _createElementVNode("span", {
                        "aria-hidden": "true",
                        style: {"position":"absolute","left":"50%","top":"50%","width":"14px","height":"14px","margin":"-7px 0 0 -7px","border-radius":"7px","background":"var(--pkm-accent)","box-shadow":"0 0 0 3px rgba(var(--pkm-accent-rgb), 0.35)"}
                      }, null, -1 /* CACHED */)),
                      (_ctx.V.home.hr.sweeping)
                        ? (_openBlock(true), _createElementBlock(_Fragment, { key: 1 }, _renderList((_ctx.V.home.hr.pins || []), (hrp, hrp_i) => {
                            return (_openBlock(), _createElementBlock("button", {
                              key: hrp_i,
                              type: "button",
                              class: "pkm-anim",
                              onClick: hrp.open,
                              "aria-label": _ctx.A(hrp.label),
                              style: _normalizeStyle(`position: absolute; left: ${hrp.x}; top: ${hrp.y}; transform: translate(-50%, -50%); max-width: 40%; min-height: 44px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; display: flex; align-items: center; cursor: pointer; animation: pkmReveal 0.25s ease-out ${hrp.delay} both`)
                            }, [
                              _createElementVNode("span", {
                                class: "pkm-dark",
                                style: _normalizeStyle(`min-width: 0; display: flex; flex-direction: column; padding: 3px 9px 4px; border-radius: 10px; border: 2px solid ${hrp.fill}; background: var(--pkm-card); box-shadow: 0 4px 10px rgba(var(--pkm-shadow-rgb), 0.45); text-align: left; color: var(--pkm-t1)`)
                              }, [
                                _createElementVNode("span", _hoisted_105, _toDisplayString(hrp.name), 1 /* TEXT */),
                                _createElementVNode("span", _hoisted_106, _toDisplayString(hrp.city), 1 /* TEXT */)
                              ], 4 /* STYLE */)
                            ], 12 /* STYLE, PROPS */, _hoisted_104))
                          }), 128 /* KEYED_FRAGMENT */))
                        : _createCommentVNode("v-if", true),
                      (_ctx.V.home.hr.scanned)
                        ? (_openBlock(true), _createElementBlock(_Fragment, { key: 2 }, _renderList((_ctx.V.home.hr.pins || []), (hrq, hrq_i) => {
                            return (_openBlock(), _createElementBlock("button", {
                              key: hrq_i,
                              type: "button",
                              onClick: hrq.open,
                              "aria-label": _ctx.A(hrq.label),
                              style: _normalizeStyle(`position: absolute; left: ${hrq.x}; top: ${hrq.y}; transform: translate(-50%, -50%); max-width: 40%; min-height: 44px; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; display: flex; align-items: center; cursor: pointer`)
                            }, [
                              _createElementVNode("span", {
                                class: "pkm-dark",
                                style: _normalizeStyle(`min-width: 0; display: flex; flex-direction: column; padding: 3px 9px 4px; border-radius: 10px; border: 2px solid ${hrq.fill}; background: var(--pkm-card); box-shadow: 0 4px 10px rgba(var(--pkm-shadow-rgb), 0.45); text-align: left; color: var(--pkm-t1)`)
                              }, [
                                _createElementVNode("span", _hoisted_108, _toDisplayString(hrq.name), 1 /* TEXT */),
                                _createElementVNode("span", _hoisted_109, _toDisplayString(hrq.city), 1 /* TEXT */)
                              ], 4 /* STYLE */)
                            ], 12 /* STYLE, PROPS */, _hoisted_107))
                          }), 128 /* KEYED_FRAGMENT */))
                        : _createCommentVNode("v-if", true)
                    ]),
                    _createElementVNode("div", _hoisted_110, [
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.home.hr.scan,
                        "aria-disabled": _ctx.A(_ctx.V.home.hr.busy),
                        style: {"height":"48px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"14.5px","font-weight":"700","cursor":"pointer"}
                      }, _toDisplayString(_ctx.V.home.hr.scanLabel), 9 /* TEXT, PROPS */, _hoisted_111),
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.home.hr.france,
                        style: {"height":"48px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14.5px","font-weight":"700","cursor":"pointer"}
                      }, "Carte de France", 8 /* PROPS */, _hoisted_112)
                    ]),
                    _createElementVNode("span", _hoisted_113, _toDisplayString(_ctx.V.home.hr.status), 1 /* TEXT */)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true)
            ]),
            (_ctx.V.home.hasMargin)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 0,
                  class: "pkm-dark",
                  type: "button",
                  onClick: _ctx.V.goSales,
                  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"14px 14px 14px 16px","border":"1px solid var(--pkm-line)","border-radius":"20px","background":"var(--pkm-card)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", _hoisted_115, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_116, [...(_cache[23] || (_cache[23] = [
                      _createElementVNode("path", { d: "M6 3h12v18l-3-2-3 2-3-2-3 2z" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M9 8h6" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M9 12h6" }, null, -1 /* CACHED */)
                    ]))]))
                  ]),
                  _createElementVNode("span", _hoisted_117, [
                    _cache[24] || (_cache[24] = _createElementVNode("span", { style: {"font-size":"13px","color":"var(--pkm-t3)"} }, "Marge réalisée sur tes ventes", -1 /* CACHED */)),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: ${_ctx.V.home.marginColor}`)
                    }, _toDisplayString(_ctx.V.home.margin), 5 /* TEXT, STYLE */),
                    _createElementVNode("span", _hoisted_118, _toDisplayString(_ctx.V.home.marginSub), 1 /* TEXT */)
                  ]),
                  (_openBlock(), _createElementBlock("svg", _hoisted_119, [...(_cache[25] || (_cache[25] = [
                    _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))]))
                ], 8 /* PROPS */, _hoisted_114))
              : _createCommentVNode("v-if", true),
            (_ctx.V.home.novice)
              ? (_openBlock(), _createElementBlock("section", _hoisted_120, [
                  _cache[27] || (_cache[27] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Premiers pas", -1 /* CACHED */)),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.steps || []), (sp, sp_i) => {
                    return (_openBlock(), _createElementBlock("div", {
                      key: sp_i,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"36px"}
                    }, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`flex: none; width: 28px; height: 28px; box-sizing: border-box; border-radius: 14px; border: 1.5px solid ${sp.color}; color: ${sp.color}; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700`)
                      }, _toDisplayString(sp.n), 5 /* TEXT, STYLE */),
                      _createElementVNode("span", _hoisted_121, _toDisplayString(sp.label), 1 /* TEXT */),
                      (sp.done)
                        ? (_openBlock(), _createElementBlock("svg", _hoisted_122, [...(_cache[26] || (_cache[26] = [
                            _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                          ]))]))
                        : _createCommentVNode("v-if", true)
                    ]))
                  }), 128 /* KEYED_FRAGMENT */)),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.openScan,
                    style: {"height":"48px","margin-top":"2px","border":"0","border-radius":"999px","background":"var(--pkm-teal)","color":"var(--pkm-ink)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                  }, "Scanner ma première carte", 8 /* PROPS */, _hoisted_123),
                  _cache[28] || (_cache[28] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t3)"} }, "La cote Dropicards, c’est le prix du milieu entre plusieurs sites. Elle évite de surestimer ta collection à cause d’une annonce trop chère.", -1 /* CACHED */))
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.home.passion)
              ? (_openBlock(), _createElementBlock("section", _hoisted_124, [
                  _cache[29] || (_cache[29] = _createElementVNode("span", { style: {"flex":"1","font-size":"13.5px","line-height":"1.45","color":"var(--pkm-sand-2)"} }, "Profil Passionné : le mode avancé ajoute les lots, les associés et l’export complet.", -1 /* CACHED */)),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.toggleAdv,
                    style: {"flex":"none","height":"44px","padding":"0 16px","border":"0","border-radius":"999px","background":"var(--pkm-amber)","color":"var(--pkm-ink)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                  }, "Activer", 8 /* PROPS */, _hoisted_125)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.home.rel.show)
              ? (_openBlock(), _createElementBlock("section", _hoisted_126, [
                  _createElementVNode("div", _hoisted_127, [
                    _cache[30] || (_cache[30] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Sorties du moment", -1 /* CACHED */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.home.rel.all,
                      style: {"height":"44px","padding":"0 2px","border":"0","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                    }, _toDisplayString(_ctx.V.home.rel.allLabel), 9 /* TEXT, PROPS */, _hoisted_128)
                  ]),
                  _createElementVNode("div", _hoisted_129, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.home.rel.items || []), (fx, fx_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: fx_i,
                        class: "pkm-dark",
                        type: "button",
                        onClick: fx.open,
                        "aria-label": _ctx.A(fx.label),
                        style: {"flex":"none","width":"240px","scroll-snap-align":"start","display":"flex","flex-direction":"column","padding":"0","border":"1px solid var(--pkm-line-3)","border-radius":"20px","overflow":"hidden","background":"var(--pkm-card)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                      }, [
                        _createElementVNode("span", {
                          style: _normalizeStyle(`position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; background: ${fx.bg}`)
                        }, [
                          (fx.hasPhoto)
                            ? (_openBlock(), _createElementBlock("img", {
                                key: 0,
                                src: fx.photo,
                                "data-broken": "1",
                                alt: "",
                                loading: "lazy",
                                style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                              }, null, 8 /* PROPS */, _hoisted_131))
                            : _createCommentVNode("v-if", true),
                          (fx.sealedArt)
                            ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                _createElementVNode("img", {
                                  src: fx.logo,
                                  "data-broken": "1",
                                  alt: "",
                                  loading: "lazy",
                                  style: {"position":"absolute","left":"20%","top":"18%","width":"60%","height":"44%","object-fit":"contain"}
                                }, null, 8 /* PROPS */, _hoisted_132),
                                _createElementVNode("span", _hoisted_133, _toDisplayString(fx.code), 1 /* TEXT */)
                              ], 64 /* STABLE_FRAGMENT */))
                            : _createCommentVNode("v-if", true),
                          (fx.hasTag)
                            ? (_openBlock(), _createElementBlock("span", {
                                key: 2,
                                style: _normalizeStyle(`position: absolute; left: 8px; top: 8px; padding: 2px 8px; border-radius: 999px; background: ${fx.tagBg}; color: var(--pkm-ink); font-size: 11px; font-weight: 800`)
                              }, _toDisplayString(fx.tag), 5 /* TEXT, STYLE */))
                            : _createCommentVNode("v-if", true),
                          (fx.owned)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_134, _toDisplayString(fx.qty), 1 /* TEXT */))
                            : _createCommentVNode("v-if", true)
                        ], 4 /* STYLE */),
                        _createElementVNode("span", _hoisted_135, [
                          _createElementVNode("span", _hoisted_136, _toDisplayString(fx.name), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_137, _toDisplayString(fx.sub), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_138, [
                            _createElementVNode("span", {
                              style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: ${fx.priceColor}`)
                            }, _toDisplayString(fx.price), 5 /* TEXT, STYLE */),
                            _createElementVNode("span", _hoisted_139, _toDisplayString(fx.priceLabel), 1 /* TEXT */)
                          ])
                        ])
                      ], 8 /* PROPS */, _hoisted_130))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ]))
              : _createCommentVNode("v-if", true),
            _cache[31] || (_cache[31] = _createElementVNode("p", { style: {"margin":"2px 0 0","font-size":"11.5px","line-height":"1.5","color":"var(--pkm-t4)","text-align":"center"} }, "Dropicards, application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. Prix réels du marché ; collection de démonstration.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isCollection)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
            _createElementVNode("div", _hoisted_140, [
              (_openBlock(), _createElementBlock("svg", _hoisted_141, [...(_cache[32] || (_cache[32] = [
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
                "aria-label": "Rechercher dans ma collection",
                placeholder: "Rechercher « Pikachu »",
                value: _ctx.V.coll.q,
                onInput: _ctx.V.coll.onQ,
                style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px"}
              }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_142),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.openScan,
                "aria-label": "Scanner un article",
                style: {"flex":"none","width":"44px","height":"44px","margin-right":"-10px","padding":"0","border":"0","background":"transparent","color":"var(--pkm-link)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_144, [...(_cache[33] || (_cache[33] = [
                  _createElementVNode("path", { d: "M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8 M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8 M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16 M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16 M7 12h10" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_143)
            ]),
            _createElementVNode("div", _hoisted_145, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.coll.types || []), (ty, ty_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: ty_i,
                  type: "button",
                  onClick: ty.pick,
                  "aria-pressed": _ctx.A(ty.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${ty.bc}; background: ${ty.bg}; color: ${ty.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(ty.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_146))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_147, [
              _createElementVNode("div", _hoisted_148, [
                _cache[34] || (_cache[34] = _createElementVNode("span", { style: {"font-size":"12px","color":"var(--pkm-t3)"} }, "Valeur", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_149, _toDisplayString(_ctx.V.coll.value), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_150, [
                _cache[35] || (_cache[35] = _createElementVNode("span", { style: {"font-size":"12px","color":"var(--pkm-t3)"} }, "Coût d’achat", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_151, _toDisplayString(_ctx.V.coll.cost), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_152, [
                _cache[36] || (_cache[36] = _createElementVNode("span", { style: {"font-size":"12px","color":"var(--pkm-t3)"} }, "Plus-value", -1 /* CACHED */)),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 15.5px; font-weight: 700; white-space: nowrap; color: ${_ctx.V.coll.latentColor}`)
                }, _toDisplayString(_ctx.V.coll.latent), 5 /* TEXT, STYLE */)
              ])
            ]),
            _createElementVNode("span", _hoisted_153, _toDisplayString(_ctx.V.coll.countText), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_154, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.coll.list || []), (ci, ci_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: ci_i,
                  class: "pkm-dark",
                  type: "button",
                  onClick: ci.open,
                  style: _normalizeStyle(`grid-column: ${ci.col}; display: flex; flex-direction: column; gap: 8px; padding: 8px 8px 12px; border: 1px solid var(--pkm-line); border-radius: 20px; background: var(--pkm-card); color: var(--pkm-t1); font: inherit; text-align: left; cursor: pointer`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; display: block; height: ${ci.h}; aspect-ratio: ${ci.ar}; border-radius: 14px; overflow: hidden; background: ${ci.bg}; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.1)`)
                  }, [
                    (ci.plainCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: ci.img,
                          "data-fallback": ci.fallback,
                          srcset: ci.srcset,
                          sizes: "114px",
                          alt: "",
                          loading: "lazy",
                          style: {"position":"absolute","left":"50%","top":"10px","width":"114px","height":"157px","margin-left":"-57px","border-radius":"5% / 3.6%","object-fit":"cover","box-shadow":"0 8px 18px rgba(var(--pkm-shadow-rgb), 0.45)"}
                        }, null, 8 /* PROPS */, _hoisted_156))
                      : _createCommentVNode("v-if", true),
                    (ci.graded)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                          _createElementVNode("span", _hoisted_157, _toDisplayString(ci.grade), 1 /* TEXT */),
                          _createElementVNode("img", {
                            src: ci.img,
                            "data-fallback": ci.fallback,
                            alt: "",
                            style: {"position":"absolute","left":"14px","right":"14px","top":"36px","width":"calc(100% - 28px)","height":"128px","border-radius":"5px","object-fit":"cover","object-position":"top"}
                          }, null, 8 /* PROPS */, _hoisted_158)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (ci.sealedArt)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                          _createElementVNode("img", {
                            src: ci.logo,
                            "data-broken": "1",
                            alt: "",
                            style: {"position":"absolute","left":"14px","top":"34px","width":"calc(100% - 28px)","height":"64px","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_159),
                          (_openBlock(), _createElementBlock("svg", _hoisted_160, [
                            _createElementVNode("path", {
                              d: ci.glyph
                            }, null, 8 /* PROPS */, _hoisted_161)
                          ])),
                          _createElementVNode("span", _hoisted_162, _toDisplayString(ci.code), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (ci.hasPhoto)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 3,
                          src: ci.photo,
                          "data-broken": "1",
                          alt: "",
                          loading: "lazy",
                          style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                        }, null, 8 /* PROPS */, _hoisted_163))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("span", _hoisted_164, _toDisplayString(ci.qty), 1 /* TEXT */),
                    (ci.ur)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_165, "★ UR"))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_166, [
                    _createElementVNode("span", _hoisted_167, _toDisplayString(ci.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_168, _toDisplayString(ci.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_169, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`flex: none; width: 16px; height: 11px; border-radius: 2px; background: ${ci.flag}`)
                    }, null, 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_170, _toDisplayString(ci.value), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_171, [
                    _createElementVNode("span", _hoisted_172, _toDisplayString(ci.unit), 1 /* TEXT */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-weight: 700; color: ${ci.changeColor}; white-space: nowrap`)
                    }, _toDisplayString(ci.change), 5 /* TEXT, STYLE */)
                  ])
                ], 12 /* STYLE, PROPS */, _hoisted_155))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            (_ctx.V.coll.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_173, _toDisplayString(_ctx.V.coll.emptyText), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("span", _hoisted_174, [
              _cache[37] || (_cache[37] = _createElementVNode("span", { style: {"flex":"none","width":"7px","height":"7px","border-radius":"4px","background":"var(--pkm-green)"} }, null, -1 /* CACHED */)),
              _createTextVNode(_toDisplayString(_ctx.V.coll.stamp), 1 /* TEXT */)
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isItem)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
            _createElementVNode("section", {
              "aria-label": "Visuel",
              style: _normalizeStyle(`flex: none; position: relative; height: ${_ctx.V.it.visH}; aspect-ratio: ${_ctx.V.it.visAr}; border-radius: 26px; overflow: hidden; background: ${_ctx.V.it.bg}; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
            }, [
              (_ctx.V.it.isCard)
                ? (_openBlock(), _createElementBlock("img", {
                    key: 0,
                    src: _ctx.V.it.img,
                    "data-fallback": _ctx.V.it.fallbackHi,
                    alt: "",
                    "aria-hidden": "true",
                    style: {"position":"absolute","left":"-40px","top":"-40px","width":"438px","height":"410px","object-fit":"cover","filter":"blur(28px) saturate(1.4)","opacity":"0.5"}
                  }, null, 8 /* PROPS */, _hoisted_175))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.plainCard)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                    _createElementVNode("button", {
                      class: "pkm-dark",
                      type: "button",
                      onClick: _ctx.V.it.zoom,
                      "aria-label": _ctx.A(_ctx.V.it.zoomLabel),
                      style: {"position":"absolute","left":"50%","top":"14px","width":"196px","height":"270px","margin-left":"-98px","padding":"0","border":"0","border-radius":"4.8% / 3.4%","overflow":"hidden","background":"var(--pkm-img-bg)","box-shadow":"0 18px 40px rgba(var(--pkm-shadow-rgb), 0.55)","cursor":"zoom-in","color":"var(--pkm-t1)"}
                    }, [
                      _createElementVNode("img", {
                        src: _ctx.V.it.img,
                        "data-fallback": _ctx.V.it.fallbackHi,
                        alt: _ctx.V.it.name,
                        style: {"display":"block","width":"100%","height":"100%","object-fit":"cover"}
                      }, null, 8 /* PROPS */, _hoisted_177)
                    ], 8 /* PROPS */, _hoisted_176),
                    _createElementVNode("span", _hoisted_178, [
                      (_openBlock(), _createElementBlock("svg", _hoisted_179, [...(_cache[38] || (_cache[38] = [
                        _createElementVNode("circle", {
                          cx: "10.5",
                          cy: "10.5",
                          r: "6"
                        }, null, -1 /* CACHED */),
                        _createElementVNode("path", { d: "M15 15l5 5 M10.5 8v5 M8 10.5h5" }, null, -1 /* CACHED */)
                      ]))]))
                    ])
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.graded)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                    _createElementVNode("span", _hoisted_180, [
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.name), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.grade), 1 /* TEXT */)
                    ]),
                    _createElementVNode("img", {
                      src: _ctx.V.it.img,
                      "data-fallback": _ctx.V.it.fallbackHi,
                      alt: _ctx.V.it.name,
                      style: {"position":"absolute","left":"50%","top":"52px","width":"220px","height":"220px","margin-left":"-110px","border-radius":"0 0 8px 8px","object-fit":"cover","object-position":"top","box-shadow":"0 18px 40px rgba(var(--pkm-shadow-rgb), 0.55)"}
                    }, null, 8 /* PROPS */, _hoisted_181)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.sealedArt)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 3 }, [
                    _createElementVNode("img", {
                      src: _ctx.V.it.logo,
                      "data-broken": "1",
                      alt: _ctx.V.it.name,
                      style: {"position":"absolute","left":"40px","top":"56px","width":"calc(100% - 80px)","height":"104px","object-fit":"contain"}
                    }, null, 8 /* PROPS */, _hoisted_182),
                    (_openBlock(), _createElementBlock("svg", _hoisted_183, [
                      _createElementVNode("path", {
                        d: _ctx.V.it.glyph
                      }, null, 8 /* PROPS */, _hoisted_184)
                    ])),
                    _createElementVNode("span", _hoisted_185, _toDisplayString(_ctx.V.it.code), 1 /* TEXT */)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.hasPhoto)
                ? (_openBlock(), _createElementBlock("button", {
                    key: 4,
                    type: "button",
                    onClick: _ctx.V.it.zoom,
                    "aria-label": _ctx.A(_ctx.V.it.zoomLabel),
                    style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","padding":"0","border":"0","background":"transparent","cursor":"zoom-in"}
                  }, [
                    _createElementVNode("img", {
                      src: _ctx.V.it.photo,
                      "data-broken": "1",
                      alt: _ctx.V.it.name,
                      style: {"display":"block","width":"100%","height":"100%","object-fit":"cover"}
                    }, null, 8 /* PROPS */, _hoisted_187)
                  ], 8 /* PROPS */, _hoisted_186))
                : _createCommentVNode("v-if", true),
              _createElementVNode("span", _hoisted_188, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`flex: none; width: 16px; height: 11px; border-radius: 2px; background: ${_ctx.V.it.flag}`)
                }, null, 4 /* STYLE */),
                _createTextVNode(_toDisplayString(_ctx.V.it.ownedBadge), 1 /* TEXT */)
              ])
            ], 4 /* STYLE */),
            (_ctx.V.it.hasImgNote)
              ? (_openBlock(), _createElementBlock("p", _hoisted_189, _toDisplayString(_ctx.V.it.imgNote), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", _hoisted_190, [
              _createElementVNode("div", _hoisted_191, [
                _createElementVNode("div", _hoisted_192, [
                  _cache[39] || (_cache[39] = _createElementVNode("span", { style: {"font-size":"13px","color":"var(--pkm-t2)"} }, "Cote Dropicards · à l’unité", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_193, _toDisplayString(_ctx.V.it.cote), 1 /* TEXT */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-size: 13px; font-weight: 700; color: ${_ctx.V.it.changeColor}`)
                  }, _toDisplayString(_ctx.V.it.change), 5 /* TEXT, STYLE */)
                ]),
                (_ctx.V.it.owned)
                  ? (_openBlock(), _createElementBlock("div", _hoisted_194, [
                      _cache[40] || (_cache[40] = _createElementVNode("span", { style: {"color":"var(--pkm-t3)"} }, "Tes exemplaires", -1 /* CACHED */)),
                      _createElementVNode("span", _hoisted_195, _toDisplayString(_ctx.V.it.hold), 1 /* TEXT */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-weight: 700; color: ${_ctx.V.it.holdColor}`)
                      }, _toDisplayString(_ctx.V.it.holdLatent), 5 /* TEXT, STYLE */),
                      _createElementVNode("span", _hoisted_196, _toDisplayString(_ctx.V.it.pru), 1 /* TEXT */)
                    ]))
                  : _createCommentVNode("v-if", true)
              ]),
              (_ctx.V.it.hasChart)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                    _createElementVNode("div", _hoisted_197, [
                      _cache[41] || (_cache[41] = _createElementVNode("span", { style: {"font-size":"13px","color":"var(--pkm-t3)"} }, "Cote archivée · 30 jours", -1 /* CACHED */)),
                      _createElementVNode("span", _hoisted_198, _toDisplayString(_ctx.V.it.readout), 1 /* TEXT */)
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
                      }, null, 12 /* STYLE, PROPS */, _hoisted_200),
                      _createElementVNode("path", {
                        d: _ctx.V.it.line,
                        style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.it.chartColor}; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round`)
                      }, null, 12 /* STYLE, PROPS */, _hoisted_201),
                      (_ctx.V.it.hasHi)
                        ? (_openBlock(), _createElementBlock("line", {
                            key: 0,
                            x1: _ctx.V.it.dotX,
                            x2: _ctx.V.it.dotX,
                            y1: "0",
                            y2: "76",
                            style: {"stroke":"var(--pkm-line-4)","stroke-width":"1"}
                          }, null, 8 /* PROPS */, _hoisted_202))
                        : _createCommentVNode("v-if", true),
                      _createElementVNode("circle", {
                        cx: _ctx.V.it.dotX,
                        cy: _ctx.V.it.dotY,
                        r: "4.5",
                        style: _normalizeStyle(`fill: ${_ctx.V.it.chartColor}; stroke: var(--pkm-card-hi); stroke-width: 2`)
                      }, null, 12 /* STYLE, PROPS */, _hoisted_203),
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
                        }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_204))
                      }), 128 /* KEYED_FRAGMENT */))
                    ], 40 /* PROPS, NEED_HYDRATION */, _hoisted_199)),
                    _createElementVNode("div", _hoisted_205, [
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.firstDate), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.rangeText), 1 /* TEXT */),
                      _createElementVNode("span", null, _toDisplayString(_ctx.V.it.lastDate), 1 /* TEXT */)
                    ])
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.it.noCote)
                ? (_openBlock(), _createElementBlock("p", _hoisted_206, _toDisplayString(_ctx.V.it.release), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_207, [
              _cache[42] || (_cache[42] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Comparatif des prix", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.it.sources || []), (so, so_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: so_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 10px; min-height: 54px; border-top: ${so.border}`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; width: 8px; height: 8px; border-radius: 4px; background: ${so.dot}`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_208, [
                    _createElementVNode("span", _hoisted_209, _toDisplayString(so.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_210, _toDisplayString(so.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; font-size: 11.5px; font-weight: 700; border-radius: 999px; padding: 3px 9px; background: ${so.tagBg}; color: ${so.tagFg}`)
                  }, _toDisplayString(so.tag), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; min-width: 78px; text-align: right; font-size: 14.5px; font-variant-numeric: tabular-nums; font-weight: ${so.weight}; color: ${so.fg}`)
                  }, _toDisplayString(so.value), 5 /* TEXT, STYLE */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */)),
              _createElementVNode("p", _hoisted_211, _toDisplayString(_ctx.V.it.coteRule), 1 /* TEXT */),
              _cache[43] || (_cache[43] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","line-height":"1.45","color":"var(--pkm-t4)"} }, "Vinted et Leboncoin ne sont pas comparés : pas d’API publique, et pas de scraping.", -1 /* CACHED */))
            ]),
            (_ctx.V.it.hasCopies)
              ? (_openBlock(), _createElementBlock("section", _hoisted_212, [
                  _cache[45] || (_cache[45] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Historique d’achat", -1 /* CACHED */)),
                  _createElementVNode("p", _hoisted_213, _toDisplayString(_ctx.V.it.copyText), 1 /* TEXT */),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.it.copies || []), (cp, cp_i) => {
                    return (_openBlock(), _createElementBlock("div", {
                      key: cp_i,
                      style: _normalizeStyle(`display: flex; align-items: center; gap: 10px; min-height: 48px; border-top: ${cp.border}`)
                    }, [
                      _createElementVNode("span", _hoisted_214, _toDisplayString(cp.meta), 1 /* TEXT */),
                      (cp.isLot)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_215, "lot"))
                        : _createCommentVNode("v-if", true),
                      _createElementVNode("span", _hoisted_216, _toDisplayString(cp.amount), 1 /* TEXT */)
                    ], 4 /* STYLE */))
                  }), 128 /* KEYED_FRAGMENT */)),
                  (_ctx.V.it.hasSold)
                    ? (_openBlock(), _createElementBlock("button", {
                        key: 0,
                        type: "button",
                        onClick: _ctx.V.goSales,
                        style: {"display":"flex","align-items":"center","justify-content":"space-between","gap":"8px","min-height":"48px","padding":"0","border":"0","border-top":"1px solid var(--pkm-line)","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"13.5px","font-weight":"600","text-align":"left","cursor":"pointer"}
                      }, [
                        _createElementVNode("span", null, _toDisplayString(_ctx.V.it.soldText), 1 /* TEXT */),
                        (_openBlock(), _createElementBlock("svg", _hoisted_218, [...(_cache[44] || (_cache[44] = [
                          _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                        ]))]))
                      ], 8 /* PROPS */, _hoisted_217))
                    : _createCommentVNode("v-if", true)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.it.canAdd)
              ? (_openBlock(), _createElementBlock("div", _hoisted_219, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.addThis,
                    style: {"height":"54px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                  }, "+ Ajouter un exemplaire", 8 /* PROPS */, _hoisted_220),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sellThis,
                    disabled: _ctx.V.it.cantSell,
                    style: _normalizeStyle(`height: 54px; border: 1px solid var(--pkm-line-2); border-radius: 999px; background: transparent; color: var(--pkm-t1); font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; opacity: ${_ctx.V.it.sellOpacity}`)
                  }, "J’ai vendu", 12 /* STYLE, PROPS */, _hoisted_221)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.it.upcoming)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 3,
                  type: "button",
                  onClick: _ctx.V.notify,
                  style: {"flex":"none","height":"54px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                }, "Me prévenir à la sortie", 8 /* PROPS */, _hoisted_222))
              : _createCommentVNode("v-if", true)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isMarket)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 3 }, [
            _createElementVNode("div", _hoisted_223, [
              (_openBlock(), _createElementBlock("svg", _hoisted_224, [...(_cache[46] || (_cache[46] = [
                _createElementVNode("circle", {
                  cx: "11",
                  cy: "11",
                  r: "6.5"
                }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
              ]))])),
              _createElementVNode("input", {
                id: "pkm-champ-3",
                type: "search",
                "aria-label": "Rechercher une carte ou un produit",
                placeholder: "Rechercher « Dracaufeu », « Display »",
                value: _ctx.V.mk.q,
                onInput: _ctx.V.mk.onQ,
                style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px"}
              }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_225)
            ]),
            (_ctx.V.mk.feat.show)
              ? (_openBlock(), _createElementBlock("section", _hoisted_226, [
                  _createElementVNode("div", _hoisted_227, [
                    _cache[47] || (_cache[47] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Scellé à la une", -1 /* CACHED */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.mk.feat.all,
                      style: {"height":"44px","padding":"0 2px","border":"0","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                    }, _toDisplayString(_ctx.V.mk.feat.allLabel), 9 /* TEXT, PROPS */, _hoisted_228)
                  ]),
                  _createElementVNode("div", _hoisted_229, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.feat.items || []), (fx, fx_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: fx_i,
                        class: "pkm-dark",
                        type: "button",
                        onClick: fx.open,
                        "aria-label": _ctx.A(fx.label),
                        style: {"flex":"none","width":"240px","scroll-snap-align":"start","display":"flex","flex-direction":"column","padding":"0","border":"1px solid var(--pkm-line-3)","border-radius":"20px","overflow":"hidden","background":"var(--pkm-card)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                      }, [
                        _createElementVNode("span", {
                          style: _normalizeStyle(`position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; background: ${fx.bg}`)
                        }, [
                          (fx.hasPhoto)
                            ? (_openBlock(), _createElementBlock("img", {
                                key: 0,
                                src: fx.photo,
                                "data-broken": "1",
                                alt: "",
                                loading: "lazy",
                                style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                              }, null, 8 /* PROPS */, _hoisted_231))
                            : _createCommentVNode("v-if", true),
                          (fx.sealedArt)
                            ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                _createElementVNode("img", {
                                  src: fx.logo,
                                  "data-broken": "1",
                                  alt: "",
                                  loading: "lazy",
                                  style: {"position":"absolute","left":"20%","top":"18%","width":"60%","height":"44%","object-fit":"contain"}
                                }, null, 8 /* PROPS */, _hoisted_232),
                                _createElementVNode("span", _hoisted_233, _toDisplayString(fx.code), 1 /* TEXT */)
                              ], 64 /* STABLE_FRAGMENT */))
                            : _createCommentVNode("v-if", true),
                          (fx.hasTag)
                            ? (_openBlock(), _createElementBlock("span", {
                                key: 2,
                                style: _normalizeStyle(`position: absolute; left: 8px; top: 8px; padding: 2px 8px; border-radius: 999px; background: ${fx.tagBg}; color: var(--pkm-ink); font-size: 11px; font-weight: 800`)
                              }, _toDisplayString(fx.tag), 5 /* TEXT, STYLE */))
                            : _createCommentVNode("v-if", true),
                          (fx.owned)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_234, _toDisplayString(fx.qty), 1 /* TEXT */))
                            : _createCommentVNode("v-if", true)
                        ], 4 /* STYLE */),
                        _createElementVNode("span", _hoisted_235, [
                          _createElementVNode("span", _hoisted_236, _toDisplayString(fx.name), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_237, _toDisplayString(fx.sub), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_238, [
                            _createElementVNode("span", {
                              style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: ${fx.priceColor}`)
                            }, _toDisplayString(fx.price), 5 /* TEXT, STYLE */),
                            _createElementVNode("span", _hoisted_239, _toDisplayString(fx.priceLabel), 1 /* TEXT */)
                          ])
                        ])
                      ], 8 /* PROPS */, _hoisted_230))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.mk.releasesEntry.show)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 1,
                  class: "pkm-dark",
                  type: "button",
                  onClick: _ctx.V.mk.releasesEntry.open,
                  style: {"flex":"none","display":"flex","align-items":"center","gap":"14px","min-height":"76px","padding":"10px 14px 10px 12px","border":"1px solid var(--pkm-line-3)","border-radius":"22px","background":"var(--pkm-card-hi)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", _hoisted_241, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_242, [...(_cache[48] || (_cache[48] = [
                      _createElementVNode("path", { d: "M4 6.5h16v13H4z M4 10.5h16 M8.5 4v4 M15.5 4v4 M8 14h3v3H8z" }, null, -1 /* CACHED */)
                    ]))]))
                  ]),
                  _createElementVNode("span", _hoisted_243, [
                    _cache[49] || (_cache[49] = _createElementVNode("span", { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600","letter-spacing":"-0.01em"} }, "Sorties · Pokémon 30 ans, Règne Delta", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_244, _toDisplayString(_ctx.V.mk.releasesEntry.sub), 1 /* TEXT */)
                  ]),
                  (_openBlock(), _createElementBlock("svg", _hoisted_245, [...(_cache[50] || (_cache[50] = [
                    _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))]))
                ], 8 /* PROPS */, _hoisted_240))
              : _createCommentVNode("v-if", true),
            (_ctx.V.mk.browse.show)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 2,
                  class: "pkm-dark",
                  type: "button",
                  onClick: _ctx.V.mk.browse.open,
                  style: {"flex":"none","display":"flex","align-items":"center","gap":"14px","min-height":"76px","padding":"10px 14px 10px 12px","border":"1px solid var(--pkm-line-3)","border-radius":"22px","background":"radial-gradient(120% 90% at 0% 0%, rgba(var(--pkm-glow-rgb), 0.24), rgba(var(--pkm-glow-rgb), 0) 62%), var(--pkm-card-hi)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", _hoisted_247, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.browse.fan || []), (bf, bf_i) => {
                      return (_openBlock(), _createElementBlock("img", {
                        key: bf_i,
                        src: bf.img,
                        "data-fallback": bf.fallback,
                        alt: "",
                        style: _normalizeStyle(`position: absolute; top: ${bf.top}; left: ${bf.left}; width: 36px; height: 50px; border-radius: 3px; object-fit: cover; box-shadow: 0 4px 10px rgba(var(--pkm-shadow-rgb), 0.5); transform: rotate(${bf.rot})`)
                      }, null, 12 /* STYLE, PROPS */, _hoisted_248))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]),
                  _createElementVNode("span", _hoisted_249, [
                    _cache[51] || (_cache[51] = _createElementVNode("span", { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600","letter-spacing":"-0.01em"} }, "Toutes les cartes", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_250, _toDisplayString(_ctx.V.mk.browse.sub), 1 /* TEXT */)
                  ]),
                  (_openBlock(), _createElementBlock("svg", _hoisted_251, [...(_cache[52] || (_cache[52] = [
                    _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))]))
                ], 8 /* PROPS */, _hoisted_246))
              : _createCommentVNode("v-if", true),
            (_ctx.V.mk.sealedBrowse.show)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 3,
                  class: "pkm-dark",
                  type: "button",
                  onClick: _ctx.V.mk.sealedBrowse.open,
                  style: {"flex":"none","display":"flex","align-items":"center","gap":"14px","min-height":"76px","padding":"10px 14px 10px 12px","border":"1px solid var(--pkm-line-3)","border-radius":"22px","background":"radial-gradient(120% 90% at 0% 0%, rgba(var(--pkm-orange-rgb), 0.18), rgba(var(--pkm-orange-rgb), 0) 62%), var(--pkm-card-hi)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", _hoisted_253, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.sealedBrowse.fan || []), (sf, sf_i) => {
                      return (_openBlock(), _createElementBlock("span", {
                        key: sf_i,
                        style: _normalizeStyle(`position: absolute; top: ${sf.top}; left: ${sf.left}; width: 38px; height: 40px; border-radius: 8px; background: ${sf.bg}; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 4px 10px rgba(var(--pkm-shadow-rgb), 0.5); transform: rotate(${sf.rot})`)
                      }, [
                        _createElementVNode("img", {
                          src: sf.photo,
                          "data-broken": "1",
                          alt: "",
                          style: {"max-width":"90%","max-height":"90%","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_254)
                      ], 4 /* STYLE */))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]),
                  _createElementVNode("span", _hoisted_255, [
                    _cache[53] || (_cache[53] = _createElementVNode("span", { style: {"font-family":"'Sora', sans-serif","font-size":"16px","font-weight":"600","letter-spacing":"-0.01em"} }, "Produits scellés", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_256, _toDisplayString(_ctx.V.mk.sealedBrowse.sub), 1 /* TEXT */)
                  ]),
                  (_openBlock(), _createElementBlock("svg", _hoisted_257, [...(_cache[54] || (_cache[54] = [
                    _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))]))
                ], 8 /* PROPS */, _hoisted_252))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_258, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.filters || []), (mf, mf_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: mf_i,
                  type: "button",
                  onClick: mf.pick,
                  "aria-pressed": _ctx.A(mf.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${mf.bc}; background: ${mf.bg}; color: ${mf.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(mf.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_259))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("span", _hoisted_260, _toDisplayString(_ctx.V.mk.count), 1 /* TEXT */),
            (_ctx.V.mk.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_261, "Aucun produit ne correspond."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_262, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.mk.list || []), (mi, mi_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: mi_i,
                  type: "button",
                  onClick: mi.open,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 10px 14px; border: 0; border-top: ${mi.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; flex: none; width: calc(${mi.wk} * 42px); height: calc(${mi.hk} * 56px); outline: ${mi.ring}; outline-offset: -1.5px; border-radius: 8px; overflow: hidden; background: ${mi.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                  }, [
                    (mi.isCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: mi.img,
                          "data-fallback": mi.fallback,
                          alt: "",
                          loading: "lazy",
                          style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                        }, null, 8 /* PROPS */, _hoisted_264))
                      : _createCommentVNode("v-if", true),
                    (mi.sealedArt)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: mi.logo,
                          "data-broken": "1",
                          alt: "",
                          style: {"max-width":"36px","max-height":"26px","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_265))
                      : _createCommentVNode("v-if", true),
                    (mi.hasPhoto)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 2,
                          src: mi.photo,
                          "data-broken": "1",
                          alt: "",
                          loading: "lazy",
                          style: {"width":"100%","height":"100%","object-fit":"cover"}
                        }, null, 8 /* PROPS */, _hoisted_266))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_267, [
                    _createElementVNode("span", _hoisted_268, _toDisplayString(mi.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_269, [
                      _createElementVNode("span", _hoisted_270, _toDisplayString(mi.sub), 1 /* TEXT */),
                      (mi.owned)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_271, "à toi"))
                        : _createCommentVNode("v-if", true)
                    ])
                  ]),
                  _createElementVNode("span", _hoisted_272, [
                    _createElementVNode("span", _hoisted_273, _toDisplayString(mi.cote), 1 /* TEXT */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`font-size: 12px; font-weight: 700; color: ${mi.rightColor}`)
                    }, _toDisplayString(mi.right), 5 /* TEXT, STYLE */)
                  ])
                ], 12 /* STYLE, PROPS */, _hoisted_263))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _cache[55] || (_cache[55] = _createElementVNode("section", {
              class: "pkm-dark",
              "aria-label": "D’où viennent les prix",
              style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card-2)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
            }, [
              _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "D’où viennent les prix ?"),
              _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Cardmarket (fichier public quotidien), eBay (API officielle, ventes réussies) et TCGplayer via TCGdex. La cote Dropicards est la médiane de ces prix « marché ». Vinted et Leboncoin ne sont pas connectés : pas d’API publique, pas de scraping. Dropicards ne vend rien : c’est un outil de suivi de valeur.")
            ], -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSets)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 4 }, [
            _createElementVNode("div", _hoisted_274, [
              (_openBlock(), _createElementBlock("svg", _hoisted_275, [...(_cache[56] || (_cache[56] = [
                _createElementVNode("circle", {
                  cx: "11",
                  cy: "11",
                  r: "6.5"
                }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
              ]))])),
              _createElementVNode("input", {
                id: "pkm-champ-4",
                type: "search",
                "aria-label": "Rechercher une extension",
                placeholder: "Rechercher une extension",
                value: _ctx.V.exts.q,
                onInput: _ctx.V.exts.onQ,
                style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px"}
              }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_276)
            ]),
            _createElementVNode("span", _hoisted_277, _toDisplayString(_ctx.V.exts.count), 1 /* TEXT */),
            (_ctx.V.exts.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_278, "Aucune extension ne correspond."))
              : _createCommentVNode("v-if", true),
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.exts.groups || []), (eg, eg_i) => {
              return (_openBlock(), _createElementBlock("section", {
                key: eg_i,
                "aria-label": _ctx.A(eg.name),
                style: {"flex":"none","display":"flex","flex-direction":"column","gap":"8px"}
              }, [
                _createElementVNode("h2", _hoisted_280, _toDisplayString(eg.name), 1 /* TEXT */),
                (eg.hasNote)
                  ? (_openBlock(), _createElementBlock("p", _hoisted_281, _toDisplayString(eg.note), 1 /* TEXT */))
                  : _createCommentVNode("v-if", true),
                _createElementVNode("div", _hoisted_282, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((eg.sets || []), (ex, ex_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: ex_i,
                      type: "button",
                      onClick: ex.open,
                      "aria-label": _ctx.A(ex.label),
                      style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 66px; padding: 10px 14px; border: 0; border-top: ${ex.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                    }, [
                      _createElementVNode("span", _hoisted_284, [
                        (ex.hasLogo)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: ex.logo,
                              "data-broken": "1",
                              alt: "",
                              loading: "lazy",
                              style: {"max-width":"78px","max-height":"42px","object-fit":"contain"}
                            }, null, 8 /* PROPS */, _hoisted_285))
                          : _createCommentVNode("v-if", true),
                        (ex.noLogo)
                          ? (_openBlock(), _createElementBlock("span", _hoisted_286, _toDisplayString(ex.code), 1 /* TEXT */))
                          : _createCommentVNode("v-if", true)
                      ]),
                      _createElementVNode("span", _hoisted_287, [
                        _createElementVNode("span", _hoisted_288, _toDisplayString(ex.name), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_289, _toDisplayString(ex.sub), 1 /* TEXT */)
                      ]),
                      (ex.owned)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_290, _toDisplayString(ex.ownedText), 1 /* TEXT */))
                        : _createCommentVNode("v-if", true),
                      (_openBlock(), _createElementBlock("svg", _hoisted_291, [...(_cache[57] || (_cache[57] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 12 /* STYLE, PROPS */, _hoisted_283))
                  }), 128 /* KEYED_FRAGMENT */))
                ])
              ], 8 /* PROPS */, _hoisted_279))
            }), 128 /* KEYED_FRAGMENT */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSet)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 5 }, [
            _createElementVNode("section", _hoisted_292, [
              (_ctx.V.cset.hasLogo)
                ? (_openBlock(), _createElementBlock("img", {
                    key: 0,
                    src: _ctx.V.cset.logo,
                    "data-broken": "1",
                    alt: "",
                    style: {"flex":"none","width":"104px","height":"56px","object-fit":"contain"}
                  }, null, 8 /* PROPS */, _hoisted_293))
                : _createCommentVNode("v-if", true),
              _createElementVNode("span", _hoisted_294, [
                _createElementVNode("span", _hoisted_295, _toDisplayString(_ctx.V.cset.countText), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_296, _toDisplayString(_ctx.V.cset.valueText), 1 /* TEXT */)
              ])
            ]),
            (_ctx.V.cset.hasNote)
              ? (_openBlock(), _createElementBlock("p", _hoisted_297, _toDisplayString(_ctx.V.cset.note), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_298, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.cset.filters || []), (cf, cf_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: cf_i,
                  type: "button",
                  onClick: cf.pick,
                  "aria-pressed": _ctx.A(cf.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${cf.bc}; background: ${cf.bg}; color: ${cf.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(cf.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_299))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("span", _hoisted_300, _toDisplayString(_ctx.V.cset.count), 1 /* TEXT */),
            (_ctx.V.cset.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_301, _toDisplayString(_ctx.V.cset.emptyText), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_302, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.cset.cards || []), (ca, ca_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: ca_i,
                  type: "button",
                  onClick: ca.open,
                  "aria-label": _ctx.A(ca.label),
                  style: {"display":"flex","flex-direction":"column","gap":"6px","min-width":"0","padding":"0","border":"0","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", _hoisted_304, [
                    _createElementVNode("img", {
                      src: ca.img,
                      "data-fallback": ca.fallback,
                      srcset: ca.srcset,
                      sizes: "(max-width: 520px) 30vw, 118px",
                      alt: "",
                      loading: "lazy",
                      decoding: "async",
                      style: {"display":"block","width":"100%","height":"100%","object-fit":"cover"}
                    }, null, 8 /* PROPS */, _hoisted_305),
                    (ca.owned)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_306, _toDisplayString(ca.qty), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true)
                  ]),
                  _createElementVNode("span", _hoisted_307, [
                    _createElementVNode("span", _hoisted_308, _toDisplayString(ca.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_309, [
                      _createElementVNode("span", _hoisted_310, _toDisplayString(ca.num), 1 /* TEXT */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`flex: none; font-weight: 700; font-variant-numeric: tabular-nums; color: ${ca.coteColor}`)
                      }, _toDisplayString(ca.cote), 5 /* TEXT, STYLE */)
                    ])
                  ])
                ], 8 /* PROPS */, _hoisted_303))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSealedList)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 6 }, [
            _createElementVNode("section", _hoisted_311, [
              _createElementVNode("span", _hoisted_312, _toDisplayString(_ctx.V.sl.countText), 1 /* TEXT */),
              _createElementVNode("span", _hoisted_313, _toDisplayString(_ctx.V.sl.note), 1 /* TEXT */)
            ]),
            _createElementVNode("div", _hoisted_314, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sl.filters || []), (sfi, sfi_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: sfi_i,
                  type: "button",
                  onClick: sfi.pick,
                  "aria-pressed": _ctx.A(sfi.on),
                  style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${sfi.bc}; background: ${sfi.bg}; color: ${sfi.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(sfi.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_315))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("span", _hoisted_316, _toDisplayString(_ctx.V.sl.count), 1 /* TEXT */),
            (_ctx.V.sl.empty)
              ? (_openBlock(), _createElementBlock("p", _hoisted_317, "Aucun produit de ce type."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_318, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sl.items || []), (sp, sp_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: sp_i,
                  class: "pkm-dark",
                  type: "button",
                  onClick: sp.open,
                  "aria-label": _ctx.A(sp.label),
                  style: {"width":"100%","display":"flex","flex-direction":"column","padding":"0","border":"1px solid var(--pkm-line-3)","border-radius":"20px","overflow":"hidden","background":"var(--pkm-card)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; background: ${sp.bg}`)
                  }, [
                    (sp.hasPhoto)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: sp.photo,
                          "data-broken": "1",
                          alt: "",
                          loading: "lazy",
                          style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                        }, null, 8 /* PROPS */, _hoisted_320))
                      : _createCommentVNode("v-if", true),
                    (sp.sealedArt)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                          _createElementVNode("img", {
                            src: sp.logo,
                            "data-broken": "1",
                            alt: "",
                            loading: "lazy",
                            style: {"position":"absolute","left":"20%","top":"18%","width":"60%","height":"44%","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_321),
                          _createElementVNode("span", _hoisted_322, _toDisplayString(sp.code), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (sp.hasTag)
                      ? (_openBlock(), _createElementBlock("span", {
                          key: 2,
                          style: _normalizeStyle(`position: absolute; left: 8px; top: 8px; padding: 2px 8px; border-radius: 999px; background: ${sp.tagBg}; color: var(--pkm-ink); font-size: 11px; font-weight: 800`)
                        }, _toDisplayString(sp.tag), 5 /* TEXT, STYLE */))
                      : _createCommentVNode("v-if", true),
                    (sp.owned)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_323, _toDisplayString(sp.qty), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_324, [
                    _createElementVNode("span", _hoisted_325, _toDisplayString(sp.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_326, _toDisplayString(sp.sub), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_327, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: ${sp.priceColor}`)
                      }, _toDisplayString(sp.price), 5 /* TEXT, STYLE */),
                      _createElementVNode("span", _hoisted_328, _toDisplayString(sp.priceLabel), 1 /* TEXT */)
                    ])
                  ])
                ], 8 /* PROPS */, _hoisted_319))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isReleases)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 7 }, [
            _createElementVNode("section", _hoisted_329, [
              (_openBlock(), _createElementBlock("svg", _hoisted_330, [...(_cache[58] || (_cache[58] = [
                _createElementVNode("path", { d: "M4 7h16v12H4z M4 7l8 6 8-6" }, null, -1 /* CACHED */)
              ]))])),
              _createElementVNode("div", _hoisted_331, [
                _cache[59] || (_cache[59] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15.5px","font-weight":"600"} }, "Invitations Amazon", -1 /* CACHED */)),
                _createElementVNode("p", _hoisted_332, _toDisplayString(_ctx.V.rl.amazonNote), 1 /* TEXT */)
              ])
            ]),
            (_ctx.V.rl.hasStatus)
              ? (_openBlock(), _createElementBlock("p", _hoisted_333, _toDisplayString(_ctx.V.rl.status), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            (_ctx.V.rl.hasSoon)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                  _cache[62] || (_cache[62] = _createElementVNode("h2", { style: {"flex":"none","margin":"6px 0 0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "À venir", -1 /* CACHED */)),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rl.soon || []), (rv, rv_i) => {
                    return (_openBlock(), _createElementBlock("article", {
                      key: rv_i,
                      class: "pkm-dark",
                      "aria-label": _ctx.A(rv.name),
                      style: {"flex":"none","display":"flex","flex-direction":"column","border":"1px solid var(--pkm-line-3)","border-radius":"22px","overflow":"hidden","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
                    }, [
                      _createElementVNode("button", {
                        type: "button",
                        onClick: rv.open,
                        "aria-label": _ctx.A(rv.sheetLabel),
                        style: _normalizeStyle(`position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; padding: 0; border: 0; background: ${rv.bg}; cursor: pointer`)
                      }, [
                        (rv.hasPhoto)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: rv.photo,
                              "data-broken": "1",
                              alt: "",
                              loading: "lazy",
                              style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                            }, null, 8 /* PROPS */, _hoisted_336))
                          : _createCommentVNode("v-if", true),
                        (rv.sealedArt)
                          ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                              _createElementVNode("img", {
                                src: rv.logo,
                                "data-broken": "1",
                                alt: "",
                                loading: "lazy",
                                style: {"position":"absolute","left":"20%","top":"18%","width":"60%","height":"44%","object-fit":"contain"}
                              }, null, 8 /* PROPS */, _hoisted_337),
                              _createElementVNode("span", _hoisted_338, _toDisplayString(rv.code), 1 /* TEXT */)
                            ], 64 /* STABLE_FRAGMENT */))
                          : _createCommentVNode("v-if", true),
                        _createElementVNode("span", {
                          style: _normalizeStyle(`position: absolute; left: 10px; top: 10px; padding: 3px 10px; border-radius: 999px; background: ${rv.tagBg}; color: var(--pkm-ink); font-size: 12px; font-weight: 800`)
                        }, _toDisplayString(rv.tag), 5 /* TEXT, STYLE */),
                        (rv.owned)
                          ? (_openBlock(), _createElementBlock("span", _hoisted_339, _toDisplayString(rv.qty), 1 /* TEXT */))
                          : _createCommentVNode("v-if", true)
                      ], 12 /* STYLE, PROPS */, _hoisted_335),
                      _createElementVNode("div", _hoisted_340, [
                        _createElementVNode("div", _hoisted_341, [
                          _createElementVNode("h3", _hoisted_342, _toDisplayString(rv.name), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_343, _toDisplayString(rv.type), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_344, _toDisplayString(rv.when), 1 /* TEXT */)
                        ]),
                        _createElementVNode("div", _hoisted_345, [
                          _createElementVNode("div", _hoisted_346, [
                            _cache[60] || (_cache[60] = _createElementVNode("span", { style: {"font-size":"11.5px","color":"var(--pkm-t3)"} }, "Prix de lancement", -1 /* CACHED */)),
                            (rv.hasMsrp)
                              ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                                  _createElementVNode("span", _hoisted_347, _toDisplayString(rv.msrp), 1 /* TEXT */),
                                  _createElementVNode("span", _hoisted_348, _toDisplayString(rv.msrpNote), 1 /* TEXT */)
                                ], 64 /* STABLE_FRAGMENT */))
                              : _createCommentVNode("v-if", true),
                            (rv.noMsrp)
                              ? (_openBlock(), _createElementBlock("span", _hoisted_349, "non communiqué"))
                              : _createCommentVNode("v-if", true)
                          ]),
                          _createElementVNode("div", _hoisted_350, [
                            _createElementVNode("span", _hoisted_351, _toDisplayString(rv.coteLabel), 1 /* TEXT */),
                            _createElementVNode("span", _hoisted_352, _toDisplayString(rv.cote), 1 /* TEXT */),
                            _createElementVNode("span", _hoisted_353, _toDisplayString(rv.coteNote), 1 /* TEXT */)
                          ])
                        ]),
                        _createElementVNode("div", _hoisted_354, [
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((rv.links || []), (lk, lk_i) => {
                            return (_openBlock(), _createElementBlock("a", {
                              key: lk_i,
                              href: lk.href,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              "aria-label": _ctx.A(lk.aria),
                              style: _normalizeStyle(`display: inline-flex; align-items: center; gap: 5px; height: 40px; padding: 0 13px; box-sizing: border-box; border-radius: 999px; border: 1px solid ${lk.bc}; background: ${lk.bg}; color: ${lk.fg}; font-size: 13.5px; font-weight: 700; text-decoration: none`)
                            }, [
                              _createTextVNode(_toDisplayString(lk.label), 1 /* TEXT */),
                              (_openBlock(), _createElementBlock("svg", _hoisted_356, [...(_cache[61] || (_cache[61] = [
                                _createElementVNode("path", { d: "M8 16L16 8 M9 8h7v7" }, null, -1 /* CACHED */)
                              ]))]))
                            ], 12 /* STYLE, PROPS */, _hoisted_355))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]),
                        _createElementVNode("div", _hoisted_357, [
                          _createElementVNode("button", {
                            type: "button",
                            onClick: rv.open,
                            style: {"height":"44px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                          }, "Fiche Dropicards", 8 /* PROPS */, _hoisted_358),
                          _createElementVNode("button", {
                            type: "button",
                            onClick: rv.alert,
                            "aria-pressed": _ctx.A(rv.alertOn),
                            style: _normalizeStyle(`height: 44px; border: 1px solid var(--pkm-line-2); border-radius: 999px; background: ${rv.alertBg}; color: ${rv.alertFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
                          }, _toDisplayString(rv.alertLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_359)
                        ])
                      ])
                    ], 8 /* PROPS */, _hoisted_334))
                  }), 128 /* KEYED_FRAGMENT */))
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true),
            (_ctx.V.rl.hasRecent)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                  _cache[65] || (_cache[65] = _createElementVNode("h2", { style: {"flex":"none","margin":"6px 0 0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Sorties récentes", -1 /* CACHED */)),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rl.recent || []), (rw, rw_i) => {
                    return (_openBlock(), _createElementBlock("article", {
                      key: rw_i,
                      class: "pkm-dark",
                      "aria-label": _ctx.A(rw.name),
                      style: {"flex":"none","display":"flex","flex-direction":"column","border":"1px solid var(--pkm-line-3)","border-radius":"22px","overflow":"hidden","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
                    }, [
                      _createElementVNode("button", {
                        type: "button",
                        onClick: rw.open,
                        "aria-label": _ctx.A(rw.sheetLabel),
                        style: _normalizeStyle(`position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; padding: 0; border: 0; background: ${rw.bg}; cursor: pointer`)
                      }, [
                        (rw.hasPhoto)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: rw.photo,
                              "data-broken": "1",
                              alt: "",
                              loading: "lazy",
                              style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                            }, null, 8 /* PROPS */, _hoisted_362))
                          : _createCommentVNode("v-if", true),
                        (rw.sealedArt)
                          ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                              _createElementVNode("img", {
                                src: rw.logo,
                                "data-broken": "1",
                                alt: "",
                                loading: "lazy",
                                style: {"position":"absolute","left":"20%","top":"18%","width":"60%","height":"44%","object-fit":"contain"}
                              }, null, 8 /* PROPS */, _hoisted_363),
                              _createElementVNode("span", _hoisted_364, _toDisplayString(rw.code), 1 /* TEXT */)
                            ], 64 /* STABLE_FRAGMENT */))
                          : _createCommentVNode("v-if", true),
                        _createElementVNode("span", {
                          style: _normalizeStyle(`position: absolute; left: 10px; top: 10px; padding: 3px 10px; border-radius: 999px; background: ${rw.tagBg}; color: var(--pkm-ink); font-size: 12px; font-weight: 800`)
                        }, _toDisplayString(rw.tag), 5 /* TEXT, STYLE */),
                        (rw.owned)
                          ? (_openBlock(), _createElementBlock("span", _hoisted_365, _toDisplayString(rw.qty), 1 /* TEXT */))
                          : _createCommentVNode("v-if", true)
                      ], 12 /* STYLE, PROPS */, _hoisted_361),
                      _createElementVNode("div", _hoisted_366, [
                        _createElementVNode("div", _hoisted_367, [
                          _createElementVNode("h3", _hoisted_368, _toDisplayString(rw.name), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_369, _toDisplayString(rw.type), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_370, _toDisplayString(rw.when), 1 /* TEXT */)
                        ]),
                        _createElementVNode("div", _hoisted_371, [
                          _createElementVNode("div", _hoisted_372, [
                            _cache[63] || (_cache[63] = _createElementVNode("span", { style: {"font-size":"11.5px","color":"var(--pkm-t3)"} }, "Prix de lancement", -1 /* CACHED */)),
                            (rw.hasMsrp)
                              ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                                  _createElementVNode("span", _hoisted_373, _toDisplayString(rw.msrp), 1 /* TEXT */),
                                  _createElementVNode("span", _hoisted_374, _toDisplayString(rw.msrpNote), 1 /* TEXT */)
                                ], 64 /* STABLE_FRAGMENT */))
                              : _createCommentVNode("v-if", true),
                            (rw.noMsrp)
                              ? (_openBlock(), _createElementBlock("span", _hoisted_375, "non communiqué"))
                              : _createCommentVNode("v-if", true)
                          ]),
                          _createElementVNode("div", _hoisted_376, [
                            _createElementVNode("span", _hoisted_377, _toDisplayString(rw.coteLabel), 1 /* TEXT */),
                            _createElementVNode("span", _hoisted_378, _toDisplayString(rw.cote), 1 /* TEXT */),
                            _createElementVNode("span", _hoisted_379, _toDisplayString(rw.coteNote), 1 /* TEXT */)
                          ])
                        ]),
                        _createElementVNode("div", _hoisted_380, [
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((rw.links || []), (lk, lk_i) => {
                            return (_openBlock(), _createElementBlock("a", {
                              key: lk_i,
                              href: lk.href,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              "aria-label": _ctx.A(lk.aria),
                              style: _normalizeStyle(`display: inline-flex; align-items: center; gap: 5px; height: 40px; padding: 0 13px; box-sizing: border-box; border-radius: 999px; border: 1px solid ${lk.bc}; background: ${lk.bg}; color: ${lk.fg}; font-size: 13.5px; font-weight: 700; text-decoration: none`)
                            }, [
                              _createTextVNode(_toDisplayString(lk.label), 1 /* TEXT */),
                              (_openBlock(), _createElementBlock("svg", _hoisted_382, [...(_cache[64] || (_cache[64] = [
                                _createElementVNode("path", { d: "M8 16L16 8 M9 8h7v7" }, null, -1 /* CACHED */)
                              ]))]))
                            ], 12 /* STYLE, PROPS */, _hoisted_381))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]),
                        _createElementVNode("div", _hoisted_383, [
                          _createElementVNode("button", {
                            type: "button",
                            onClick: rw.open,
                            style: {"height":"44px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                          }, "Fiche Dropicards", 8 /* PROPS */, _hoisted_384),
                          _createElementVNode("button", {
                            type: "button",
                            onClick: rw.alert,
                            "aria-pressed": _ctx.A(rw.alertOn),
                            style: _normalizeStyle(`height: 44px; border: 1px solid var(--pkm-line-2); border-radius: 999px; background: ${rw.alertBg}; color: ${rw.alertFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
                          }, _toDisplayString(rw.alertLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_385)
                        ])
                      ])
                    ], 8 /* PROPS */, _hoisted_360))
                  }), 128 /* KEYED_FRAGMENT */))
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("p", _hoisted_386, _toDisplayString(_ctx.V.rl.footer), 1 /* TEXT */)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isShop)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 8 }, [
            (_ctx.V.bq.found)
              ? (_openBlock(), _createElementBlock("section", {
                  key: 0,
                  "aria-label": _ctx.A(_ctx.V.bq.name),
                  style: {"flex":"none","display":"flex","flex-direction":"column","gap":"12px"}
                }, [
                  _createElementVNode("div", _hoisted_388, [
                    _createElementVNode("span", _hoisted_389, [
                      _createElementVNode("span", _hoisted_390, _toDisplayString(_ctx.V.bq.place), 1 /* TEXT */)
                    ]),
                    _createElementVNode("span", _hoisted_391, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; white-space: nowrap; color: ${_ctx.V.bq.color}`)
                      }, _toDisplayString(_ctx.V.bq.pct), 5 /* TEXT, STYLE */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`padding: 2px 9px; border-radius: 999px; background: ${_ctx.V.bq.tint}; color: ${_ctx.V.bq.color}; font-size: 11.5px; font-weight: 800`)
                      }, _toDisplayString(_ctx.V.bq.level), 5 /* TEXT, STYLE */)
                    ])
                  ]),
                  _createElementVNode("p", _hoisted_392, _toDisplayString(_ctx.V.bq.note), 1 /* TEXT */),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.bq.toggleWhy,
                    "aria-expanded": _ctx.A(_ctx.V.bq.why),
                    style: {"align-self":"flex-start","height":"40px","padding":"0 14px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"13.5px","font-weight":"700","cursor":"pointer"}
                  }, _toDisplayString(_ctx.V.bq.whyLabel), 9 /* TEXT, PROPS */, _hoisted_393),
                  (_ctx.V.bq.why)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_394, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.bq.reasons || []), (rr, rr_i) => {
                          return (_openBlock(), _createElementBlock("span", {
                            key: rr_i,
                            style: {"display":"flex","align-items":"baseline","gap":"10px","font-size":"13px","line-height":"1.4"}
                          }, [
                            _createElementVNode("span", {
                              style: _normalizeStyle(`flex: none; width: 34px; text-align: right; font-weight: 800; font-variant-numeric: tabular-nums; color: ${rr.color}`)
                            }, _toDisplayString(rr.sign), 5 /* TEXT, STYLE */),
                            _createElementVNode("span", _hoisted_395, _toDisplayString(rr.text), 1 /* TEXT */)
                          ]))
                        }), 128 /* KEYED_FRAGMENT */)),
                        _createElementVNode("span", _hoisted_396, _toDisplayString(_ctx.V.bq.total), 1 /* TEXT */)
                      ]))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.bq.hasHours)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_397, [
                        _createElementVNode("span", {
                          style: _normalizeStyle(`font-size: 13.5px; font-weight: 700; color: ${_ctx.V.bq.hoursColor}`)
                        }, _toDisplayString(_ctx.V.bq.hoursState), 5 /* TEXT, STYLE */),
                        _createElementVNode("span", _hoisted_398, _toDisplayString(_ctx.V.bq.hoursText), 1 /* TEXT */)
                      ]))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.bq.hasAddress)
                    ? (_openBlock(), _createElementBlock("p", _hoisted_399, _toDisplayString(_ctx.V.bq.address), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true),
                  _createElementVNode("div", _hoisted_400, [
                    _createElementVNode("a", {
                      href: _ctx.V.bq.route,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {"height":"46px","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","text-decoration":"none"}
                    }, "Itinéraire", 8 /* PROPS */, _hoisted_401),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.bq.toggleAlert,
                      "aria-pressed": _ctx.A(_ctx.V.bq.alertOn),
                      style: _normalizeStyle(`height: 46px; border: 1px solid var(--pkm-line-2); border-radius: 999px; background: ${_ctx.V.bq.alertBg}; color: ${_ctx.V.bq.alertFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
                    }, _toDisplayString(_ctx.V.bq.alertLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_402),
                    (_ctx.V.bq.hasSite)
                      ? (_openBlock(), _createElementBlock("a", {
                          key: 0,
                          href: _ctx.V.bq.site,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          "aria-label": _ctx.A(_ctx.V.bq.siteAria),
                          style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","box-sizing":"border-box","color":"var(--pkm-t1)","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","text-decoration":"none"}
                        }, _toDisplayString(_ctx.V.bq.siteLabel), 9 /* TEXT, PROPS */, _hoisted_403))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.bq.hasTel)
                      ? (_openBlock(), _createElementBlock("a", {
                          key: 1,
                          href: _ctx.V.bq.tel,
                          "aria-label": _ctx.A(_ctx.V.bq.telAria),
                          style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","box-sizing":"border-box","color":"var(--pkm-t1)","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","text-decoration":"none"}
                        }, _toDisplayString(_ctx.V.bq.telLabel), 9 /* TEXT, PROPS */, _hoisted_404))
                      : _createCommentVNode("v-if", true)
                  ]),
                  _createElementVNode("div", _hoisted_405, [
                    _createElementVNode("a", {
                      href: _ctx.V.bq.osm,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {"font-size":"12.5px","line-height":"2","color":"var(--pkm-link)"}
                    }, "Voir la fiche OpenStreetMap", 8 /* PROPS */, _hoisted_406),
                    _createElementVNode("a", {
                      href: _ctx.V.bq.report,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {"font-size":"12.5px","line-height":"2","color":"var(--pkm-link)"}
                    }, "Signaler une erreur", 8 /* PROPS */, _hoisted_407)
                  ])
                ], 8 /* PROPS */, _hoisted_387))
              : _createCommentVNode("v-if", true)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isProfile)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 9 }, [
            _createElementVNode("section", _hoisted_408, [
              _createElementVNode("span", _hoisted_409, [
                _createElementVNode("img", {
                  src: _ctx.V.pf.avatar,
                  alt: "",
                  style: _normalizeStyle(`display: block; width: 76px; height: 76px; box-sizing: border-box; border-radius: 38px; border: 3px solid ${_ctx.V.pf.ring}; object-fit: cover`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_410),
                (_openBlock(), _createElementBlock("svg", _hoisted_411, [
                  _createElementVNode("path", {
                    d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                    style: _normalizeStyle(`fill: var(--pkm-card-hi); stroke: ${_ctx.V.pf.tierColor}; stroke-width: 1.6; stroke-linejoin: round`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("path", {
                    d: _ctx.V.pf.tierSym,
                    style: _normalizeStyle(`fill: ${_ctx.V.pf.tierColor}; stroke: none`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_412)
                ]))
              ]),
              _createElementVNode("span", _hoisted_413, [
                _cache[66] || (_cache[66] = _createElementVNode("span", { style: {"font-family":"'Sora', sans-serif","font-size":"20px","font-weight":"700","letter-spacing":"-0.02em"} }, "Ton espace", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_414, _toDisplayString(_ctx.V.pf.since), 1 /* TEXT */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-size: 12.5px; font-weight: 700; color: ${_ctx.V.pf.tierColor}`)
                }, _toDisplayString(_ctx.V.pf.tierLine), 5 /* TEXT, STYLE */)
              ])
            ]),
            _createElementVNode("section", _hoisted_415, [
              _createElementVNode("div", _hoisted_416, [
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
                    }, null, 8 /* PROPS */, _hoisted_417)
                  ], 4 /* STYLE */))
                ], 4 /* STYLE */),
                _createElementVNode("span", _hoisted_418, [
                  _cache[67] || (_cache[67] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "Type de collectionneur", -1 /* CACHED */)),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: ${_ctx.V.pf.catColor}`)
                  }, _toDisplayString(_ctx.V.pf.catName), 5 /* TEXT, STYLE */)
                ])
              ]),
              _createElementVNode("div", _hoisted_419, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.pf.steps || []), (ps, ps_i) => {
                  return (_openBlock(), _createElementBlock("span", {
                    key: ps_i,
                    role: "listitem",
                    style: _normalizeStyle(`height: 34px; border-radius: 999px; border: 1px solid ${ps.bc}; background: ${ps.bg}; color: ${ps.fg}; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: ${ps.weight}`)
                  }, _toDisplayString(ps.name), 5 /* TEXT, STYLE */))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("p", _hoisted_420, _toDisplayString(_ctx.V.pf.catDesc), 1 /* TEXT */),
              _createElementVNode("span", _hoisted_421, [
                (_openBlock(), _createElementBlock("svg", _hoisted_422, [...(_cache[68] || (_cache[68] = [
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
                }, [...(_cache[69] || (_cache[69] = [
                  _createElementVNode("path", { d: "M3.5 17l6-6 4 4 7-7.5" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M15 7.5h5.5V13" }, null, -1 /* CACHED */)
                ]))], 4 /* STYLE */)),
                _createElementVNode("span", _hoisted_423, _toDisplayString(_ctx.V.pf.anticip), 1 /* TEXT */)
              ], 4 /* STYLE */),
              (_ctx.V.pf.hasDeclared)
                ? (_openBlock(), _createElementBlock("span", _hoisted_424, _toDisplayString(_ctx.V.pf.declared), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_425, [
              _cache[70] || (_cache[70] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Ce qui fixe ton profil", -1 /* CACHED */)),
              _cache[71] || (_cache[71] = _createElementVNode("p", { style: {"margin":"0 0 6px","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-t3)"} }, "Le plus haut des deux niveaux compte. Pas de calcul à date fixe : le profil suit ta collection.", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.pf.criteria || []), (cr, cr_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: cr_i,
                  style: _normalizeStyle(`display: flex; flex-direction: column; gap: 8px; padding: 12px 0; border-top: ${cr.border}`)
                }, [
                  _createElementVNode("div", _hoisted_426, [
                    _createElementVNode("span", _hoisted_427, [
                      _createElementVNode("span", _hoisted_428, _toDisplayString(cr.label), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_429, _toDisplayString(cr.value), 1 /* TEXT */)
                    ]),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`flex: none; padding: 3px 10px; border-radius: 999px; background: ${cr.levelTint}; color: ${cr.levelColor}; font-size: 12px; font-weight: 800`)
                    }, _toDisplayString(cr.level), 5 /* TEXT, STYLE */)
                  ]),
                  _createElementVNode("div", _hoisted_430, [
                    _createElementVNode("div", {
                      style: _normalizeStyle(`width: ${cr.barW}; height: 100%; border-radius: 4px; background: ${cr.barColor}`)
                    }, null, 4 /* STYLE */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: absolute; top: -3px; left: ${cr.tick}; width: 2px; height: 14px; margin-left: -1px; background: var(--pkm-t2)`)
                    }, null, 4 /* STYLE */)
                  ]),
                  _createElementVNode("div", _hoisted_431, [
                    _createElementVNode("span", _hoisted_432, _toDisplayString(cr.s0), 1 /* TEXT */),
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: absolute; left: ${cr.tick}; transform: translateX(-50%)`)
                    }, _toDisplayString(cr.s1), 5 /* TEXT, STYLE */),
                    _createElementVNode("span", _hoisted_433, _toDisplayString(cr.s2), 1 /* TEXT */)
                  ])
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_434, [
              _cache[73] || (_cache[73] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Ce que ça change pour toi", -1 /* CACHED */)),
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
                  }, [...(_cache[72] || (_cache[72] = [
                    _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                  ]))], 4 /* STYLE */)),
                  _createElementVNode("span", null, _toDisplayString(ap.text), 1 /* TEXT */)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("nav", _hoisted_435, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.goTiers,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_437, [
                  _createElementVNode("path", {
                    d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                    style: _normalizeStyle(`fill: ${_ctx.V.pf.tierColor}; fill-opacity: 0.16; stroke: ${_ctx.V.pf.tierColor}; stroke-width: 1.4; stroke-linejoin: round`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("path", {
                    d: _ctx.V.pf.tierSym,
                    style: _normalizeStyle(`fill: ${_ctx.V.pf.tierColor}; stroke: none`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_438)
                ])),
                _createElementVNode("span", _hoisted_439, [
                  _cache[74] || (_cache[74] = _createElementVNode("span", { style: {"font-weight":"600"} }, "Paliers et succès", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_440, "Palier actuel : " + _toDisplayString(_ctx.V.pf.tierName), 1 /* TEXT */)
                ]),
                (_openBlock(), _createElementBlock("svg", _hoisted_441, [...(_cache[75] || (_cache[75] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_436),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.goSales,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid var(--pkm-line)","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_443, [...(_cache[76] || (_cache[76] = [
                  _createElementVNode("path", { d: "M6 3h12v18l-3-2-3 2-3-2-3 2z" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M9 8h6" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M9 12h6" }, null, -1 /* CACHED */)
                ]))])),
                _cache[78] || (_cache[78] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                  _createElementVNode("span", { style: {"font-weight":"600"} }, "Ventes et marge"),
                  _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "Tes ventes faites ailleurs, frais déduits")
                ], -1 /* CACHED */)),
                (_openBlock(), _createElementBlock("svg", _hoisted_444, [...(_cache[77] || (_cache[77] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_442),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.goSettings,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid var(--pkm-line)","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_446, [...(_cache[79] || (_cache[79] = [
                  _createStaticVNode("<path d=\"M4 7h9\"></path><path d=\"M17 7h3\"></path><circle cx=\"15\" cy=\"7\" r=\"2\"></circle><path d=\"M4 17h3\"></path><path d=\"M11 17h9\"></path><circle cx=\"9\" cy=\"17\" r=\"2\"></circle>", 6)
                ]))])),
                _cache[81] || (_cache[81] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                  _createElementVNode("span", { style: {"font-weight":"600"} }, "Réglages"),
                  _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "Cote, sources, mode avancé")
                ], -1 /* CACHED */)),
                (_openBlock(), _createElementBlock("svg", _hoisted_447, [...(_cache[80] || (_cache[80] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_445),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.replayOnb,
                style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid var(--pkm-line)","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_449, [...(_cache[82] || (_cache[82] = [
                  _createElementVNode("path", { d: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M4.5 4.5v4h4" }, null, -1 /* CACHED */)
                ]))])),
                _cache[84] || (_cache[84] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                  _createElementVNode("span", { style: {"font-weight":"600"} }, "Revoir l’accueil"),
                  _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "Les 2 questions qui anticipent ton profil")
                ], -1 /* CACHED */)),
                (_openBlock(), _createElementBlock("svg", _hoisted_450, [...(_cache[83] || (_cache[83] = [
                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_448)
            ]),
            _cache[85] || (_cache[85] = _createElementVNode("p", { style: {"margin":"0","font-size":"11.5px","line-height":"1.5","color":"var(--pkm-t4)","text-align":"center"} }, "Application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isTiers)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 10 }, [
            _createElementVNode("section", {
              class: "pkm-dark",
              "aria-label": "Ton palier",
              style: _normalizeStyle(`flex: none; padding: 20px 16px 16px; border-radius: 26px; border: 1px solid var(--pkm-line-2); background: radial-gradient(100% 75% at 50% 0%, ${_ctx.V.tr.glow}, rgba(var(--pkm-shadow-rgb), 0) 66%), var(--pkm-card-hi); display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; color: var(--pkm-t1)`)
            }, [
              (_openBlock(), _createElementBlock("svg", _hoisted_451, [
                _createElementVNode("path", {
                  d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                  style: _normalizeStyle(`fill: ${_ctx.V.tr.color}; fill-opacity: 0.16; stroke: ${_ctx.V.tr.color}; stroke-width: 0.9; stroke-linejoin: round`)
                }, null, 4 /* STYLE */),
                _createElementVNode("path", {
                  d: _ctx.V.tr.sym,
                  style: _normalizeStyle(`fill: ${_ctx.V.tr.color}; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_452)
              ])),
              _cache[86] || (_cache[86] = _createElementVNode("span", { style: {"font-size":"13px","color":"var(--pkm-t3)"} }, "Ton palier", -1 /* CACHED */)),
              _createElementVNode("span", {
                style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 28px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: ${_ctx.V.tr.color}`)
              }, _toDisplayString(_ctx.V.tr.name), 5 /* TEXT, STYLE */),
              _createElementVNode("span", _hoisted_453, "Collection valorisée à " + _toDisplayString(_ctx.V.tr.value), 1 /* TEXT */),
              _createElementVNode("div", _hoisted_454, [
                _createElementVNode("div", {
                  style: _normalizeStyle(`width: ${_ctx.V.tr.barW}; height: 100%; border-radius: 5px; background: linear-gradient(90deg, ${_ctx.V.tr.color}, ${_ctx.V.tr.nextColor})`)
                }, null, 4 /* STYLE */)
              ]),
              _createElementVNode("span", _hoisted_455, _toDisplayString(_ctx.V.tr.next), 1 /* TEXT */)
            ], 4 /* STYLE */),
            _createElementVNode("section", _hoisted_456, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tr.ladder || []), (ld, ld_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ld_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 62px; padding: 6px 16px; border-top: ${ld.border}; background: ${ld.bg}; opacity: ${ld.op}`)
                }, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_457, [
                    _createElementVNode("path", {
                      d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                      style: _normalizeStyle(`fill: ${ld.color}; fill-opacity: 0.16; stroke: ${ld.color}; stroke-width: 1.3; stroke-linejoin: round`)
                    }, null, 4 /* STYLE */),
                    _createElementVNode("path", {
                      d: ld.sym,
                      style: _normalizeStyle(`fill: ${ld.color}; stroke: none`)
                    }, null, 12 /* STYLE, PROPS */, _hoisted_458)
                  ])),
                  _createElementVNode("span", _hoisted_459, [
                    _createElementVNode("span", _hoisted_460, _toDisplayString(ld.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_461, _toDisplayString(ld.min), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; font-size: 12.5px; font-weight: 700; color: ${ld.stateColor}`)
                  }, _toDisplayString(ld.state), 5 /* TEXT, STYLE */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_462, [
              _createElementVNode("div", _hoisted_463, [
                _cache[87] || (_cache[87] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Série en cours", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_464, _toDisplayString(_ctx.V.tr.streak), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_465, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tr.weeks || []), (wk, wk_i) => {
                  return (_openBlock(), _createElementBlock("span", {
                    key: wk_i,
                    style: _normalizeStyle(`flex: 1; height: ${wk.h}; border-radius: 6px; background: ${wk.bg}`)
                  }, null, 4 /* STYLE */))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _cache[88] || (_cache[88] = _createElementVNode("div", { style: {"display":"flex","justify-content":"space-between","font-size":"11.5px","color":"var(--pkm-t4)"} }, [
                _createElementVNode("span", null, "il y a 7 semaines"),
                _createElementVNode("span", null, "cette semaine")
              ], -1 /* CACHED */)),
              _createElementVNode("span", _hoisted_466, _toDisplayString(_ctx.V.tr.streakSub), 1 /* TEXT */)
            ]),
            _createElementVNode("section", _hoisted_467, [
              _createElementVNode("div", _hoisted_468, [
                _cache[89] || (_cache[89] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"} }, "Succès", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_469, _toDisplayString(_ctx.V.tr.achText), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_470, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tr.ach || []), (ac, ac_i) => {
                  return (_openBlock(), _createElementBlock("div", {
                    key: ac_i,
                    class: "pkm-dark",
                    style: {"display":"flex","flex-direction":"column","gap":"8px","padding":"12px","border-radius":"18px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","color":"var(--pkm-t1)"}
                  }, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`width: 34px; height: 34px; border-radius: 11px; background: ${ac.bg}; display: flex; align-items: center; justify-content: center`)
                    }, [
                      (ac.done)
                        ? (_openBlock(), _createElementBlock("svg", _hoisted_471, [...(_cache[90] || (_cache[90] = [
                            _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                          ]))]))
                        : _createCommentVNode("v-if", true),
                      (ac.todo)
                        ? (_openBlock(), _createElementBlock("svg", _hoisted_472, [...(_cache[91] || (_cache[91] = [
                            _createElementVNode("path", { d: "M12 7v5l3 2" }, null, -1 /* CACHED */),
                            _createElementVNode("circle", {
                              cx: "12",
                              cy: "12",
                              r: "8"
                            }, null, -1 /* CACHED */)
                          ]))]))
                        : _createCommentVNode("v-if", true)
                    ], 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_473, _toDisplayString(ac.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_474, _toDisplayString(ac.sub), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_475, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`display: block; width: ${ac.barW}; height: 100%; border-radius: 3px; background: ${ac.color}`)
                      }, null, 4 /* STYLE */)
                    ])
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _cache[92] || (_cache[92] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t4)","text-align":"center"} }, "Pas de quêtes ni de saisons : les paliers suivent seulement la valeur de ta collection, au prix du marché.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSettings)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 11 }, [
            _createElementVNode("section", _hoisted_476, [
              _cache[93] || (_cache[93] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Valoriser ma collection avec", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_477, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.valuations || []), (va, va_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: va_i,
                    type: "button",
                    onClick: va.pick,
                    "aria-pressed": _ctx.A(va.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${va.bc}; background: ${va.bg}; color: ${va.fg}; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(va.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_478))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("span", _hoisted_479, _toDisplayString(_ctx.V.set.valHelp), 1 /* TEXT */)
            ]),
            _createElementVNode("section", _hoisted_480, [
              _cache[94] || (_cache[94] = _createElementVNode("h2", { style: {"margin":"0 0 6px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Sources de prix", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.sources || []), (sc, sc_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: sc_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 54px; border-top: ${sc.border}`)
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; width: 8px; height: 8px; border-radius: 4px; background: ${sc.dot}`)
                  }, null, 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_481, [
                    _createElementVNode("span", _hoisted_482, _toDisplayString(sc.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_483, _toDisplayString(sc.sub), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_484, _toDisplayString(sc.state), 1 /* TEXT */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_485, [
              _createElementVNode("span", _hoisted_486, [
                (_openBlock(), _createElementBlock("svg", _hoisted_487, [...(_cache[95] || (_cache[95] = [
                  _createElementVNode("path", { d: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5" }, null, -1 /* CACHED */)
                ]))])),
                _cache[96] || (_cache[96] = _createTextVNode("MODE AVANCÉ", -1 /* CACHED */))
              ]),
              _createElementVNode("div", _hoisted_488, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.fan || []), (fn, fn_i) => {
                  return (_openBlock(), _createElementBlock("img", {
                    key: fn_i,
                    src: fn.img,
                    "data-fallback": fn.fallback,
                    alt: "",
                    style: _normalizeStyle(`position: absolute; top: ${fn.top}; left: ${fn.left}; width: 74px; height: 86px; border-radius: 8px 8px 0 0; object-fit: cover; object-position: top; box-shadow: 0 10px 22px rgba(var(--pkm-shadow-rgb), 0.35); transform: rotate(${fn.rot}); -webkit-mask-image: linear-gradient(180deg, #000 80%, transparent); mask-image: linear-gradient(180deg, #000 80%, transparent)`)
                  }, null, 12 /* STYLE, PROPS */, _hoisted_489))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _createElementVNode("span", _hoisted_490, _toDisplayString(_ctx.V.set.promoTitle), 1 /* TEXT */),
              _cache[97] || (_cache[97] = _createElementVNode("span", { style: {"font-size":"13.5px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Lots, associés, frais par plateforme, import et export. Tu peux revenir au mode simple à tout moment : rien n’est perdu.", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.toggleAdv,
                "aria-pressed": _ctx.A(_ctx.V.ui.adv),
                style: _normalizeStyle(`height: 48px; padding: 0 22px; border: 1px solid var(--pkm-line-2); border-radius: 999px; background: ${_ctx.V.set.ctaBg}; color: ${_ctx.V.set.ctaFg}; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer`)
              }, _toDisplayString(_ctx.V.set.cta), 13 /* TEXT, STYLE, PROPS */, _hoisted_491)
            ]),
            (_ctx.V.ui.adv)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                  _createElementVNode("section", _hoisted_492, [
                    _cache[98] || (_cache[98] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Frais par plateforme", -1 /* CACHED */)),
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.set.feesList || []), (fl, fl_i) => {
                      return (_openBlock(), _createElementBlock("div", {
                        key: fl_i,
                        style: _normalizeStyle(`display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 46px; border-top: ${fl.border}`)
                      }, [
                        _createElementVNode("span", _hoisted_493, _toDisplayString(fl.label), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_494, _toDisplayString(fl.rule), 1 /* TEXT */)
                      ], 4 /* STYLE */))
                    }), 128 /* KEYED_FRAGMENT */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goFees,
                      style: {"height":"44px","margin-top":"6px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                    }, "Modifier les frais", 8 /* PROPS */, _hoisted_495)
                  ]),
                  _createElementVNode("section", _hoisted_496, [
                    _cache[108] || (_cache[108] = _createElementVNode("h2", { style: {"margin":"0","padding":"16px 16px 6px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Outils avancés", -1 /* CACHED */)),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goLots,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_498, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_499, [...(_cache[99] || (_cache[99] = [
                          _createElementVNode("path", { d: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5" }, null, -1 /* CACHED */)
                        ]))]))
                      ]),
                      _createElementVNode("span", _hoisted_500, [
                        _cache[100] || (_cache[100] = _createElementVNode("span", { style: {"font-weight":"600"} }, "Lots", -1 /* CACHED */)),
                        _createElementVNode("span", _hoisted_501, _toDisplayString(_ctx.V.set.lotsText), 1 /* TEXT */)
                      ]),
                      (_openBlock(), _createElementBlock("svg", _hoisted_502, [...(_cache[101] || (_cache[101] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_497),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goTeam,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid var(--pkm-line)","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_504, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_505, [...(_cache[102] || (_cache[102] = [
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
                      _createElementVNode("span", _hoisted_506, [
                        _cache[103] || (_cache[103] = _createElementVNode("span", { style: {"font-weight":"600"} }, "Associés", -1 /* CACHED */)),
                        _createElementVNode("span", _hoisted_507, _toDisplayString(_ctx.V.set.teamText), 1 /* TEXT */)
                      ]),
                      (_openBlock(), _createElementBlock("svg", _hoisted_508, [...(_cache[104] || (_cache[104] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_503),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.goIO,
                      style: {"display":"flex","align-items":"center","gap":"12px","min-height":"60px","padding":"8px 16px","border":"0","border-top":"1px solid var(--pkm-line)","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_510, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_511, [...(_cache[105] || (_cache[105] = [
                          _createElementVNode("path", { d: "M7 4v13" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M3.5 13.5L7 17l3.5-3.5" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M17 20V7" }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M13.5 10.5L17 7l3.5 3.5" }, null, -1 /* CACHED */)
                        ]))]))
                      ]),
                      _cache[107] || (_cache[107] = _createElementVNode("span", { style: {"flex":"1","display":"flex","flex-direction":"column"} }, [
                        _createElementVNode("span", { style: {"font-weight":"600"} }, "Importer / exporter"),
                        _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "CSV, sans limite")
                      ], -1 /* CACHED */)),
                      (_openBlock(), _createElementBlock("svg", _hoisted_512, [...(_cache[106] || (_cache[106] = [
                        _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                      ]))]))
                    ], 8 /* PROPS */, _hoisted_509)
                  ])
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", _hoisted_513, [
              _cache[109] || (_cache[109] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Ma collection sur cet appareil", -1 /* CACHED */)),
              _createElementVNode("p", _hoisted_514, _toDisplayString(_ctx.V.set.dev.text), 1 /* TEXT */),
              _createElementVNode("div", _hoisted_515, [
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.set.dev.clear,
                  style: {"height":"44px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-red)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                }, "Vider ma collection", 8 /* PROPS */, _hoisted_516),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.set.dev.demo,
                  style: {"height":"44px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                }, "Remettre la démo", 8 /* PROPS */, _hoisted_517)
              ])
            ]),
            _createElementVNode("section", _hoisted_518, [
              _cache[110] || (_cache[110] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "À propos", -1 /* CACHED */)),
              _cache[111] || (_cache[111] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Dropicards est une application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company. Pokémon et les noms associés sont des marques de leurs propriétaires respectifs. Compagnons de l’accueil : sprites de Pokémon Noir et Blanc (© The Pokémon Company), via PokeAPI. Scan : lecture sur l’appareil avec Tesseract.js et son modèle français (licence Apache 2.0) ; aucune image n’est envoyée.", -1 /* CACHED */)),
              _cache[112] || (_cache[112] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","color":"var(--pkm-t4)"} }, "Démo · catalogue, scellé et prix réels (TCGdex, Cardmarket) · boutiques réelles (OpenStreetMap) · collection, ventes et partenaires de Territoire fictifs", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.replayOnb,
                style: {"height":"44px","margin-top":"4px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
              }, "Revoir l’accueil", 8 /* PROPS */, _hoisted_519)
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSales)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 12 }, [
            _createElementVNode("div", _hoisted_520, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.periods || []), (pr, pr_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: pr_i,
                  type: "button",
                  onClick: pr.pick,
                  "aria-pressed": _ctx.A(pr.on),
                  style: _normalizeStyle(`height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${pr.bc}; background: ${pr.bg}; color: ${pr.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(pr.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_521))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_522, [
              _createElementVNode("div", _hoisted_523, [
                _createElementVNode("div", _hoisted_524, [
                  _createElementVNode("span", _hoisted_525, "Marge nette · " + _toDisplayString(_ctx.V.salesV.periodLabel), 1 /* TEXT */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 30px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; color: ${_ctx.V.salesV.marginColor}`)
                  }, _toDisplayString(_ctx.V.salesV.margin), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("div", _hoisted_526, [
                  _createElementVNode("span", null, _toDisplayString(_ctx.V.salesV.count), 1 /* TEXT */),
                  _createElementVNode("span", null, [
                    _cache[113] || (_cache[113] = _createTextVNode("encaissé ", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_527, _toDisplayString(_ctx.V.salesV.ca), 1 /* TEXT */)
                  ])
                ])
              ]),
              _createElementVNode("div", _hoisted_528, [
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.salesV.barCost} 1 0px; min-width: 3px; background: var(--pkm-bar-cost); border-radius: 4px 0 0 4px`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.salesV.barFees} 1 0px; min-width: 3px; background: var(--pkm-bar-fees)`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.salesV.barMargin} 1 0px; min-width: 3px; background: var(--pkm-bar-margin); border-radius: 0 4px 4px 0`)
                }, null, 4 /* STYLE */)
              ]),
              _createElementVNode("div", _hoisted_529, [
                _createElementVNode("span", _hoisted_530, [
                  _cache[114] || (_cache[114] = _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"2px","background":"var(--pkm-bar-cost)","box-shadow":"inset 0 0 0 1px var(--pkm-bar-edge)"} }, null, -1 /* CACHED */)),
                  _createTextVNode("Coût d’achat " + _toDisplayString(_ctx.V.salesV.cost), 1 /* TEXT */)
                ]),
                _createElementVNode("span", _hoisted_531, [
                  _cache[115] || (_cache[115] = _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"2px","background":"var(--pkm-bar-fees)"} }, null, -1 /* CACHED */)),
                  _createTextVNode("Frais et port " + _toDisplayString(_ctx.V.salesV.fees), 1 /* TEXT */)
                ]),
                _cache[116] || (_cache[116] = _createElementVNode("span", { style: {"display":"flex","align-items":"center","gap":"6px"} }, [
                  _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"2px","background":"var(--pkm-bar-margin)"} }),
                  _createTextVNode("Marge nette")
                ], -1 /* CACHED */))
              ])
            ]),
            (_ctx.V.salesV.has)
              ? (_openBlock(), _createElementBlock("div", _hoisted_532, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.salesV.list || []), (sl, sl_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: sl_i,
                      type: "button",
                      onClick: sl.open,
                      style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 12px 14px; border: 0; border-top: ${sl.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                    }, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`position: relative; flex: none; width: calc(${sl.wk} * 40px); height: calc(${sl.hk} * 52px); outline: ${sl.ring}; outline-offset: -1.5px; border-radius: 8px; overflow: hidden; background: ${sl.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                      }, [
                        (sl.isCard)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: sl.img,
                              "data-fallback": sl.fallback,
                              alt: "",
                              style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                            }, null, 8 /* PROPS */, _hoisted_534))
                          : _createCommentVNode("v-if", true),
                        (sl.sealedArt)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 1,
                              src: sl.logo,
                              "data-broken": "1",
                              alt: "",
                              style: {"max-width":"34px","max-height":"24px","object-fit":"contain"}
                            }, null, 8 /* PROPS */, _hoisted_535))
                          : _createCommentVNode("v-if", true),
                        (sl.hasPhoto)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 2,
                              src: sl.photo,
                              "data-broken": "1",
                              alt: "",
                              loading: "lazy",
                              style: {"width":"100%","height":"100%","object-fit":"cover"}
                            }, null, 8 /* PROPS */, _hoisted_536))
                          : _createCommentVNode("v-if", true)
                      ], 4 /* STYLE */),
                      _createElementVNode("span", _hoisted_537, [
                        _createElementVNode("span", _hoisted_538, _toDisplayString(sl.name), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_539, [
                          _createTextVNode(_toDisplayString(sl.date), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_540, _toDisplayString(sl.platform), 1 /* TEXT */),
                          (sl.missing)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_541, "Port à renseigner"))
                            : _createCommentVNode("v-if", true)
                        ])
                      ]),
                      _createElementVNode("span", _hoisted_542, [
                        _createElementVNode("span", {
                          style: _normalizeStyle(`font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; color: ${sl.marginColor}`)
                        }, _toDisplayString(sl.margin), 5 /* TEXT, STYLE */),
                        _createElementVNode("span", _hoisted_543, _toDisplayString(sl.price), 1 /* TEXT */)
                      ])
                    ], 12 /* STYLE, PROPS */, _hoisted_533))
                  }), 128 /* KEYED_FRAGMENT */))
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.V.salesV.none)
              ? (_openBlock(), _createElementBlock("p", _hoisted_544, "Aucune vente sur cette période."))
              : _createCommentVNode("v-if", true),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.newSale,
              style: {"flex":"none","height":"52px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
            }, "Enregistrer une vente faite ailleurs", 8 /* PROPS */, _hoisted_545),
            _cache[117] || (_cache[117] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t4)"} }, "Dropicards ne vend rien pour toi. Tu notes ici tes ventes faites sur Vinted, Cardmarket, eBay ou en main propre pour connaître ta marge nette réelle.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isSale)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 13 }, [
            _createElementVNode("section", _hoisted_546, [
              _createElementVNode("div", _hoisted_547, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`position: relative; flex: none; width: calc(${_ctx.V.sale.wk} * 46px); height: calc(${_ctx.V.sale.hk} * 60px); outline: ${_ctx.V.sale.ring}; outline-offset: -1.5px; border-radius: 9px; overflow: hidden; background: ${_ctx.V.sale.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                }, [
                  (_ctx.V.sale.isCard)
                    ? (_openBlock(), _createElementBlock("img", {
                        key: 0,
                        src: _ctx.V.sale.img,
                        "data-fallback": _ctx.V.sale.fallback,
                        alt: "",
                        style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                      }, null, 8 /* PROPS */, _hoisted_548))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.sale.sealedArt)
                    ? (_openBlock(), _createElementBlock("img", {
                        key: 1,
                        src: _ctx.V.sale.logo,
                        "data-broken": "1",
                        alt: "",
                        style: {"max-width":"40px","max-height":"28px","object-fit":"contain"}
                      }, null, 8 /* PROPS */, _hoisted_549))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.sale.hasPhoto)
                    ? (_openBlock(), _createElementBlock("img", {
                        key: 2,
                        src: _ctx.V.sale.photo,
                        "data-broken": "1",
                        alt: "",
                        loading: "lazy",
                        style: {"width":"100%","height":"100%","object-fit":"cover"}
                      }, null, 8 /* PROPS */, _hoisted_550))
                    : _createCommentVNode("v-if", true)
                ], 4 /* STYLE */),
                _createElementVNode("span", _hoisted_551, [
                  _createElementVNode("span", _hoisted_552, _toDisplayString(_ctx.V.sale.name), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_553, _toDisplayString(_ctx.V.sale.meta), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("div", _hoisted_554, [
                _cache[118] || (_cache[118] = _createElementVNode("span", { style: {"font-size":"13px","color":"var(--pkm-t2)"} }, "Marge nette", -1 /* CACHED */)),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 42px; line-height: 1.05; font-weight: 700; letter-spacing: -0.035em; color: ${_ctx.V.sale.marginColor}`)
                }, _toDisplayString(_ctx.V.sale.margin), 5 /* TEXT, STYLE */),
                _createElementVNode("span", _hoisted_555, _toDisplayString(_ctx.V.sale.rateText), 1 /* TEXT */)
              ]),
              (_ctx.V.sale.missing)
                ? (_openBlock(), _createElementBlock("div", _hoisted_556, _toDisplayString(_ctx.V.sale.missingText), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("section", _hoisted_557, [
              _cache[124] || (_cache[124] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Décomposition", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_558, [
                _createElementVNode("div", _hoisted_559, [
                  _cache[119] || (_cache[119] = _createElementVNode("span", null, "Prix de vente", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_560, _toDisplayString(_ctx.V.sale.price), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_561, [
                  _createElementVNode("span", _hoisted_562, [
                    _createElementVNode("span", null, "Commission " + _toDisplayString(_ctx.V.sale.platform), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_563, _toDisplayString(_ctx.V.sale.feeRule), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_564, _toDisplayString(_ctx.V.sale.commission), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_565, [
                  _createElementVNode("span", _hoisted_566, [
                    _cache[120] || (_cache[120] = _createElementVNode("span", null, "Port et emballage à ta charge", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_567, _toDisplayString(_ctx.V.sale.portRule), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_568, _toDisplayString(_ctx.V.sale.port), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_569, [
                  _createElementVNode("span", _hoisted_570, [
                    _cache[121] || (_cache[121] = _createElementVNode("span", null, "Coût d’achat", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_571, _toDisplayString(_ctx.V.sale.costRule), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_572, _toDisplayString(_ctx.V.sale.cost), 1 /* TEXT */)
                ]),
                _cache[123] || (_cache[123] = _createElementVNode("div", { style: {"height":"1px","background":"var(--pkm-line)"} }, null, -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_573, [
                  _cache[122] || (_cache[122] = _createElementVNode("span", null, "Marge nette", -1 /* CACHED */)),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-variant-numeric: tabular-nums; color: ${_ctx.V.sale.marginColor}`)
                  }, _toDisplayString(_ctx.V.sale.margin), 5 /* TEXT, STYLE */)
                ])
              ]),
              _createElementVNode("div", _hoisted_574, [
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.sale.barCost} 1 0px; min-width: 3px; background: var(--pkm-bar-cost); border-radius: 4px 0 0 4px`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`flex: ${_ctx.V.sale.barFees} 1 0px; min-width: 3px; background: var(--pkm-bar-fees); border-radius: ${_ctx.V.sale.feesRadius}`)
                }, null, 4 /* STYLE */),
                _createElementVNode("div", {
                  style: _normalizeStyle(`display: ${_ctx.V.sale.marginDisplay}; flex: ${_ctx.V.sale.barMargin} 1 0px; min-width: 3px; background: var(--pkm-bar-margin); border-radius: 0 4px 4px 0`)
                }, null, 4 /* STYLE */)
              ]),
              _cache[125] || (_cache[125] = _createStaticVNode("<div style=\"display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;color:var(--pkm-t3);\"><span style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:8px;height:8px;border-radius:2px;background:var(--pkm-bar-cost);box-shadow:inset 0 0 0 1px var(--pkm-bar-edge);\"></span>Coût d’achat</span><span style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:8px;height:8px;border-radius:2px;background:var(--pkm-bar-fees);\"></span>Frais et port</span><span style=\"display:flex;align-items:center;gap:6px;\"><span style=\"width:8px;height:8px;border-radius:2px;background:var(--pkm-bar-margin);\"></span>Marge nette</span></div>", 1)),
              _createElementVNode("p", _hoisted_575, _toDisplayString(_ctx.V.sale.insight), 1 /* TEXT */)
            ]),
            (_ctx.V.ui.adv)
              ? (_openBlock(), _createElementBlock("div", _hoisted_576, [
                  _cache[126] || (_cache[126] = _createElementVNode("span", { style: {"color":"var(--pkm-t3)"} }, "Vendu par", -1 /* CACHED */)),
                  _createElementVNode("span", _hoisted_577, _toDisplayString(_ctx.V.sale.by), 1 /* TEXT */)
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.editSale,
              style: {"flex":"none","height":"52px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
            }, "Modifier la vente", 8 /* PROPS */, _hoisted_578)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isTerritory)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 14 }, [
            (_ctx.V.tx.hasNext)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 0,
                  class: "pkm-dark",
                  type: "button",
                  onClick: _ctx.V.tx.next.open,
                  "aria-label": _ctx.A(_ctx.V.tx.next.aria),
                  style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"10px 14px 10px 10px","border":"1px solid var(--pkm-line-3)","border-radius":"20px","background":"var(--pkm-card-hi)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; position: relative; width: 84px; height: 48px; border-radius: 11px; overflow: hidden; background: ${_ctx.V.tx.next.bg}; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                  }, [
                    (_ctx.V.tx.next.hasPhoto)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: _ctx.V.tx.next.photo,
                          "data-broken": "1",
                          alt: "",
                          style: {"position":"absolute","left":"0","top":"0","width":"100%","height":"100%","object-fit":"cover"}
                        }, null, 8 /* PROPS */, _hoisted_580))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.tx.next.sealedArt)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: _ctx.V.tx.next.logo,
                          "data-broken": "1",
                          alt: "",
                          style: {"position":"absolute","left":"10%","top":"12%","width":"80%","height":"76%","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_581))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_582, [
                    _createElementVNode("span", _hoisted_583, "Sortie " + _toDisplayString(_ctx.V.tx.next.days), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_584, _toDisplayString(_ctx.V.tx.next.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_585, _toDisplayString(_ctx.V.tx.next.sub), 1 /* TEXT */)
                  ]),
                  (_openBlock(), _createElementBlock("svg", _hoisted_586, [...(_cache[127] || (_cache[127] = [
                    _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))]))
                ], 8 /* PROPS */, _hoisted_579))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", _hoisted_587, [
              _cache[133] || (_cache[133] = _createElementVNode("div", { style: {"display":"flex","flex-direction":"column","gap":"2px"} }, [
                _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600","letter-spacing":"-0.01em"} }, "Boutiques autour de toi"),
                _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t4)"} }, "Vraies boutiques, d’après OpenStreetMap")
              ], -1 /* CACHED */)),
              (_ctx.V.tx.needPos)
                ? (_openBlock(), _createElementBlock("div", _hoisted_588, [
                    _createElementVNode("p", _hoisted_589, _toDisplayString(_ctx.V.tx.intro), 1 /* TEXT */),
                    (_ctx.V.tx.hasMsg)
                      ? (_openBlock(), _createElementBlock("p", _hoisted_590, _toDisplayString(_ctx.V.tx.msg), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("div", _hoisted_591, [
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.tx.locate,
                        style: {"height":"48px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"15px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","gap":"8px","cursor":"pointer"}
                      }, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_593, [...(_cache[128] || (_cache[128] = [
                          _createElementVNode("path", { d: "M12 3v3 M12 18v3 M3 12h3 M18 12h3 M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0 -8z" }, null, -1 /* CACHED */)
                        ]))])),
                        _cache[129] || (_cache[129] = _createTextVNode("Me localiser", -1 /* CACHED */))
                      ], 8 /* PROPS */, _hoisted_592),
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.tx.radar,
                        style: {"height":"48px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                      }, "Carte de France", 8 /* PROPS */, _hoisted_594)
                    ]),
                    _cache[130] || (_cache[130] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","line-height":"1.45","color":"var(--pkm-t3)"} }, "Ta position reste sur ton téléphone : arrondie à 100 m environ, elle n’est ni enregistrée ni envoyée.", -1 /* CACHED */))
                  ]))
                : _createCommentVNode("v-if", true),
              (_ctx.V.tx.loading)
                ? (_openBlock(), _createElementBlock("p", _hoisted_595, "Chargement des boutiques…"))
                : _createCommentVNode("v-if", true),
              (_ctx.V.tx.located)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                    _createElementVNode("div", _hoisted_596, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tx.prods || []), (tp2, tp2_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: tp2_i,
                          type: "button",
                          onClick: tp2.pick,
                          "aria-pressed": _ctx.A(tp2.on),
                          style: _normalizeStyle(`flex: none; height: 40px; padding: 0 15px; border-radius: 999px; border: 1px solid ${tp2.bc}; background: ${tp2.bg}; color: ${tp2.fg}; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer`)
                        }, _toDisplayString(tp2.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_597))
                      }), 128 /* KEYED_FRAGMENT */))
                    ]),
                    _createElementVNode("div", _hoisted_598, [
                      _createElementVNode("div", _hoisted_599, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tx.radii || []), (tk, tk_i) => {
                          return (_openBlock(), _createElementBlock("button", {
                            key: tk_i,
                            type: "button",
                            onClick: tk.pick,
                            "aria-pressed": _ctx.A(tk.on),
                            style: _normalizeStyle(`flex: none; height: 40px; padding: 0 11px; border-radius: 999px; border: 1px solid ${tk.bc}; background: ${tk.bg}; color: ${tk.fg}; font: inherit; font-size: 13px; font-weight: 600; white-space: nowrap; cursor: pointer`)
                          }, _toDisplayString(tk.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_600))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]),
                      _createElementVNode("div", _hoisted_601, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tx.sorts || []), (ts, ts_i) => {
                          return (_openBlock(), _createElementBlock("button", {
                            key: ts_i,
                            type: "button",
                            onClick: ts.pick,
                            "aria-pressed": _ctx.A(ts.on),
                            style: _normalizeStyle(`flex: none; height: 40px; padding: 0 11px; border-radius: 999px; border: 1px solid ${ts.bc}; background: ${ts.bg}; color: ${ts.fg}; font: inherit; font-size: 13px; font-weight: 600; white-space: nowrap; cursor: pointer`)
                          }, _toDisplayString(ts.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_602))
                        }), 128 /* KEYED_FRAGMENT */))
                      ])
                    ]),
                    _createElementVNode("div", _hoisted_603, [
                      (_openBlock(), _createElementBlock("svg", _hoisted_604, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tx.rings || []), (rg, rg_i) => {
                          return (_openBlock(), _createElementBlock(_Fragment, { key: rg_i }, [
                            _createElementVNode("circle", {
                              cx: "0",
                              cy: "0",
                              r: rg.r,
                              style: {"fill":"none","stroke":"rgba(var(--pkm-accent-rgb), 0.4)","stroke-width":"1","stroke-dasharray":"3 4"}
                            }, null, 8 /* PROPS */, _hoisted_605),
                            _createElementVNode("text", {
                              x: "3",
                              y: rg.ly,
                              style: {"fill":"var(--pkm-t3)","font-size":"9.5px","font-weight":"600","font-family":"'Plus Jakarta Sans', sans-serif"}
                            }, _toDisplayString(rg.label), 9 /* TEXT, PROPS */, _hoisted_606)
                          ], 64 /* STABLE_FRAGMENT */))
                        }), 128 /* KEYED_FRAGMENT */))
                      ])),
                      _cache[131] || (_cache[131] = _createElementVNode("span", {
                        "aria-hidden": "true",
                        style: {"position":"absolute","left":"50%","top":"4px","transform":"translateX(-50%)","font-size":"10px","font-weight":"800","color":"var(--pkm-t3)"}
                      }, "N", -1 /* CACHED */)),
                      _cache[132] || (_cache[132] = _createElementVNode("span", {
                        "aria-hidden": "true",
                        style: {"position":"absolute","left":"50%","top":"50%","width":"14px","height":"14px","margin":"-7px 0 0 -7px","border-radius":"7px","background":"var(--pkm-accent)","box-shadow":"0 0 0 3px rgba(var(--pkm-accent-rgb), 0.35)"}
                      }, null, -1 /* CACHED */)),
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tx.pins || []), (tpn, tpn_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: tpn_i,
                          type: "button",
                          onClick: tpn.open,
                          "aria-label": _ctx.A(tpn.label),
                          style: _normalizeStyle(`position: absolute; left: ${tpn.x}; top: ${tpn.y}; transform: translate(-50%, -50%); min-width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; font: inherit; cursor: pointer`)
                        }, [
                          _createElementVNode("span", {
                            style: _normalizeStyle(`flex: none; white-space: nowrap; height: 22px; box-sizing: border-box; padding: 0 6px; border-radius: 11px; border: 2px solid var(--pkm-ink); background: ${tpn.fill}; color: var(--pkm-ink); display: flex; align-items: center; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(var(--pkm-shadow-rgb), 0.45)`)
                          }, _toDisplayString(tpn.text), 5 /* TEXT, STYLE */)
                        ], 12 /* STYLE, PROPS */, _hoisted_607))
                      }), 128 /* KEYED_FRAGMENT */)),
                      _createElementVNode("button", {
                        class: "pkm-dark",
                        type: "button",
                        onClick: _ctx.V.tx.radar,
                        style: {"position":"absolute","right":"8px","bottom":"8px","height":"36px","padding":"0 12px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","background":"rgba(var(--pkm-ink-rgb), 0.82)","color":"var(--pkm-t1)","font":"inherit","font-size":"12.5px","font-weight":"700","cursor":"pointer"}
                      }, "Carte de France", 8 /* PROPS */, _hoisted_608)
                    ]),
                    _createElementVNode("span", _hoisted_609, _toDisplayString(_ctx.V.tx.count), 1 /* TEXT */),
                    (_ctx.V.tx.empty)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_610, [
                          _createElementVNode("p", _hoisted_611, _toDisplayString(_ctx.V.tx.emptyText), 1 /* TEXT */),
                          (_ctx.V.tx.canWiden)
                            ? (_openBlock(), _createElementBlock("button", {
                                key: 0,
                                type: "button",
                                onClick: _ctx.V.tx.widen,
                                style: {"height":"44px","padding":"0 18px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                              }, _toDisplayString(_ctx.V.tx.widenLabel), 9 /* TEXT, PROPS */, _hoisted_612))
                            : _createCommentVNode("v-if", true)
                        ]))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.tx.hasRows)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_613, [
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.tx.rows || []), (tw, tw_i) => {
                            return (_openBlock(), _createElementBlock("button", {
                              key: tw_i,
                              type: "button",
                              onClick: tw.open,
                              "aria-label": _ctx.A(tw.label),
                              style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 10px 14px; border: 0; border-top: ${tw.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                            }, [
                              _createElementVNode("span", _hoisted_615, [
                                _createElementVNode("span", _hoisted_616, _toDisplayString(tw.name), 1 /* TEXT */),
                                _createElementVNode("span", _hoisted_617, _toDisplayString(tw.sub), 1 /* TEXT */),
                                _createElementVNode("span", _hoisted_618, [
                                  _createElementVNode("span", _hoisted_619, _toDisplayString(tw.dist), 1 /* TEXT */),
                                  (tw.hasNow)
                                    ? (_openBlock(), _createElementBlock("span", {
                                        key: 0,
                                        style: _normalizeStyle(`font-weight: 700; color: ${tw.nowColor}`)
                                      }, _toDisplayString(tw.now), 5 /* TEXT, STYLE */))
                                    : _createCommentVNode("v-if", true)
                                ])
                              ]),
                              _createElementVNode("span", _hoisted_620, [
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; white-space: nowrap; color: ${tw.color}`)
                                }, _toDisplayString(tw.pct), 5 /* TEXT, STYLE */),
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${tw.tint}; color: ${tw.color}; font-size: 11px; font-weight: 800`)
                                }, _toDisplayString(tw.level), 5 /* TEXT, STYLE */)
                              ])
                            ], 12 /* STYLE, PROPS */, _hoisted_614))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]))
                      : _createCommentVNode("v-if", true)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true)
            ]),
            _cache[147] || (_cache[147] = _createElementVNode("section", {
              class: "pkm-dark",
              "aria-label": "Comment on estime la chance",
              style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card-2)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
            }, [
              _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "Comment on estime la chance ?"),
              _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t3)"} }, "C’est une estimation expliquée, jamais un stock réel : type de boutique (une boutique de cartes avant une grande surface), mention des cartes à collectionner sur sa fiche OpenStreetMap, produit recherché et calendrier des sorties. Chaque fiche détaille les points (« Pourquoi ? »). Les signalements des collectionneurs l’affineront quand un serveur existera.")
            ], -1 /* CACHED */)),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.tx.toggleDemo,
              "aria-expanded": _ctx.A(_ctx.V.tx.demoOpen),
              style: {"flex":"none","display":"flex","align-items":"center","gap":"10px","min-height":"52px","padding":"8px 14px","border":"1px dashed var(--pkm-line-4)","border-radius":"18px","background":"transparent","color":"inherit","font":"inherit","text-align":"left","cursor":"pointer"}
            }, [
              _cache[134] || (_cache[134] = _createElementVNode("span", { style: {"flex":"1","min-width":"0","display":"flex","flex-direction":"column","gap":"1px"} }, [
                _createElementVNode("span", { style: {"font-size":"14px","font-weight":"700"} }, "Démo · boutiques partenaires fictives"),
                _createElementVNode("span", { style: {"font-size":"12px","color":"var(--pkm-t3)"} }, "Ce que verrait un collectionneur avec des boutiques partenaires de Dropicards")
              ], -1 /* CACHED */)),
              _createElementVNode("span", _hoisted_622, _toDisplayString(_ctx.V.tx.demoLabel), 1 /* TEXT */)
            ], 8 /* PROPS */, _hoisted_621),
            _createElementVNode("button", {
              class: "pkm-dark",
              type: "button",
              onClick: _ctx.V.ter.radar,
              style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"12px 14px","border":"1px solid var(--pkm-line-teal)","border-radius":"20px","background":"radial-gradient(120% 140% at 0% 0%, rgba(var(--pkm-teal-rgb), 0.14), rgba(var(--pkm-teal-rgb), 0) 62%), var(--pkm-card-teal)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
            }, [
              _cache[138] || (_cache[138] = _createElementVNode("span", {
                "aria-hidden": "true",
                style: {"position":"relative","flex":"none","width":"46px","height":"46px","border-radius":"23px","background":"radial-gradient(circle, rgba(var(--pkm-teal-rgb), 0.22), rgba(var(--pkm-teal-rgb), 0.04) 70%)","box-shadow":"inset 0 0 0 1px rgba(var(--pkm-teal-rgb), 0.45)","overflow":"hidden"}
              }, [
                _createElementVNode("span", { style: {"position":"absolute","inset":"9px","border-radius":"50%","box-shadow":"inset 0 0 0 1px rgba(var(--pkm-teal-rgb), 0.4)"} }),
                _createElementVNode("span", {
                  class: "pkm-anim",
                  style: {"position":"absolute","inset":"0","border-radius":"50%","background":"conic-gradient(from 0deg, rgba(var(--pkm-teal-rgb), 0) 0deg, rgba(var(--pkm-teal-rgb), 0) 270deg, rgba(var(--pkm-teal-rgb), 0.55) 360deg)","animation":"pkmSpin 3s linear infinite"}
                }),
                _createElementVNode("span", { style: {"position":"absolute","left":"20px","top":"20px","width":"6px","height":"6px","border-radius":"3px","background":"var(--pkm-teal)"} })
              ], -1 /* CACHED */)),
              _createElementVNode("span", _hoisted_624, [
                _cache[135] || (_cache[135] = _createElementVNode("span", { style: {"font-size":"12px","font-weight":"700","color":"var(--pkm-teal)"} }, "Nouveau · carte de France", -1 /* CACHED */)),
                _cache[136] || (_cache[136] = _createElementVNode("span", { style: {"font-size":"15px","font-weight":"700"} }, "Radar des boutiques", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_625, _toDisplayString(_ctx.V.ter.radarSub), 1 /* TEXT */)
              ]),
              (_openBlock(), _createElementBlock("svg", _hoisted_626, [...(_cache[137] || (_cache[137] = [
                _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
              ]))]))
            ], 8 /* PROPS */, _hoisted_623),
            (_ctx.V.tx.demoOpen)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                  _createElementVNode("button", {
                    class: "pkm-dark",
                    type: "button",
                    onClick: _ctx.V.ter.release.open,
                    style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"12px 14px","border":"1px solid var(--pkm-line-3)","border-radius":"20px","background":"radial-gradient(120% 140% at 0% 0%, rgba(35, 118, 92, 0.34), rgba(35, 118, 92, 0) 62%), var(--pkm-card-hi)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                  }, [
                    _createElementVNode("span", _hoisted_628, [
                      _createElementVNode("img", {
                        src: _ctx.V.ter.release.logo,
                        "data-broken": "1",
                        alt: "",
                        style: {"max-width":"58px","max-height":"36px","object-fit":"contain"}
                      }, null, 8 /* PROPS */, _hoisted_629)
                    ]),
                    _createElementVNode("span", _hoisted_630, [
                      _createElementVNode("span", _hoisted_631, "Prochaine sortie · " + _toDisplayString(_ctx.V.ter.release.days), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_632, _toDisplayString(_ctx.V.ter.release.text), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_633, _toDisplayString(_ctx.V.ter.release.date) + " · " + _toDisplayString(_ctx.V.ter.release.note), 1 /* TEXT */)
                    ]),
                    (_openBlock(), _createElementBlock("svg", _hoisted_634, [...(_cache[139] || (_cache[139] = [
                      _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_627),
                  _createElementVNode("div", _hoisted_635, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.prods || []), (tp, tp_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: tp_i,
                        type: "button",
                        onClick: tp.pick,
                        "aria-pressed": _ctx.A(tp.on),
                        style: _normalizeStyle(`flex: none; height: 44px; padding: 0 16px; border-radius: 999px; border: 1px solid ${tp.bc}; background: ${tp.bg}; color: ${tp.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                      }, _toDisplayString(tp.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_636))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]),
                  _createElementVNode("section", _hoisted_637, [
                    (_openBlock(), _createElementBlock("svg", {
                      width: "100%",
                      height: "100%",
                      viewBox: "0 0 358 210",
                      role: "img",
                      "aria-label": _ctx.A(_ctx.V.ter.mapLabel),
                      style: {"position":"absolute","left":"0","top":"0","display":"block"}
                    }, [
                      _cache[140] || (_cache[140] = _createStaticVNode("<path d=\"M0 168 C 60 154, 112 184, 176 172 S 286 146, 358 164 L358 210 L0 210 Z\" style=\"fill:#11294A;stroke:none;\"></path><path d=\"M262 18 h66 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-66 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12 z\" style=\"fill:#11291F;stroke:none;\"></path><path d=\"M22 22 h54 a10 10 0 0 1 10 10 v22 a10 10 0 0 1 -10 10 h-54 a10 10 0 0 1 -10 -10 v-22 a10 10 0 0 1 10 -10 z\" style=\"fill:#11291F;stroke:none;\"></path><path d=\"M-10 74 L368 100\" style=\"fill:none;stroke:#1B2944;stroke-width:8;stroke-linecap:round;\"></path><path d=\"M-10 132 L368 124\" style=\"fill:none;stroke:#1B2944;stroke-width:6;stroke-linecap:round;\"></path><path d=\"M110 -10 L148 220\" style=\"fill:none;stroke:#1B2944;stroke-width:8;stroke-linecap:round;\"></path><path d=\"M238 -10 C 226 60, 262 120, 244 220\" style=\"fill:none;stroke:#1B2944;stroke-width:6;stroke-linecap:round;\"></path><path d=\"M30 200 L190 20\" style=\"fill:none;stroke:#172339;stroke-width:4;stroke-linecap:round;\"></path>", 8)),
                      _createElementVNode("ellipse", {
                        cx: "179",
                        cy: "105",
                        rx: _ctx.V.ter.ringRx,
                        ry: _ctx.V.ter.ringRy,
                        style: {"fill":"rgba(168, 182, 255, 0.06)","stroke":"rgba(168, 182, 255, 0.5)","stroke-width":"1.2","stroke-dasharray":"4 4"}
                      }, null, 8 /* PROPS */, _hoisted_639),
                      _cache[141] || (_cache[141] = _createElementVNode("circle", {
                        cx: "179",
                        cy: "105",
                        r: "7",
                        class: "pkm-anim",
                        style: {"fill":"rgba(61, 99, 255, 0.45)","transform-box":"fill-box","transform-origin":"center","animation":"pkmPing 2.4s ease-out infinite"}
                      }, null, -1 /* CACHED */)),
                      _cache[142] || (_cache[142] = _createElementVNode("circle", {
                        cx: "179",
                        cy: "105",
                        r: "6.5",
                        style: {"fill":"#3D63FF","stroke":"#FFFFFF","stroke-width":"2.5"}
                      }, null, -1 /* CACHED */))
                    ], 8 /* PROPS */, _hoisted_638)),
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.pins || []), (pn, pn_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: pn_i,
                        type: "button",
                        onClick: pn.open,
                        "aria-label": _ctx.A(pn.label),
                        style: _normalizeStyle(`position: absolute; left: ${pn.left}; top: ${pn.top}; width: 44px; height: 44px; padding: 0; border: 0; background: transparent; display: flex; align-items: center; justify-content: center; font: inherit; cursor: pointer`)
                      }, [
                        _createElementVNode("span", {
                          style: _normalizeStyle(`flex: none; white-space: nowrap; min-width: 42px; height: 22px; box-sizing: border-box; padding: 0 6px; border-radius: 11px; border: 2px solid var(--pkm-ink); background: ${pn.fill}; color: var(--pkm-ink); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; box-shadow: 0 4px 10px rgba(var(--pkm-shadow-rgb), 0.45)`)
                        }, _toDisplayString(pn.text), 5 /* TEXT, STYLE */)
                      ], 12 /* STYLE, PROPS */, _hoisted_640))
                    }), 128 /* KEYED_FRAGMENT */)),
                    _cache[143] || (_cache[143] = _createStaticVNode("<span class=\"pkm-dark\" aria-hidden=\"true\" style=\"position:absolute;left:10px;bottom:9px;display:flex;align-items:center;gap:10px;padding:4px 9px;border-radius:999px;background:rgba(var(--pkm-ink-rgb), 0.8);font-size:11px;font-weight:600;color:var(--pkm-t2);\"><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:var(--pkm-green);\"></span>Forte</span><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:var(--pkm-orange);\"></span>Moyenne</span><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:var(--pkm-gray);\"></span>Faible</span></span><span class=\"pkm-dark\" aria-hidden=\"true\" style=\"position:absolute;right:10px;top:9px;display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:rgba(var(--pkm-ink-rgb), 0.8);font-size:11px;font-weight:600;color:var(--pkm-t2);\"><span style=\"width:8px;height:8px;border-radius:4px;background:#3D63FF;box-shadow:0 0 0 2px #FFFFFF;\"></span>Toi · échelle non linéaire</span>", 2))
                  ]),
                  _createElementVNode("div", _hoisted_641, [
                    _createElementVNode("div", _hoisted_642, [
                      _cache[144] || (_cache[144] = _createElementVNode("span", { style: {"flex":"none","width":"74px","font-size":"12.5px","font-weight":"600","color":"var(--pkm-t3)"} }, "Probabilité", -1 /* CACHED */)),
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.probs || []), (tq, tq_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: tq_i,
                          type: "button",
                          onClick: tq.pick,
                          "aria-pressed": _ctx.A(tq.on),
                          style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${tq.bc}; background: ${tq.bg}; color: ${tq.fg}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer`)
                        }, _toDisplayString(tq.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_643))
                      }), 128 /* KEYED_FRAGMENT */))
                    ]),
                    _createElementVNode("div", _hoisted_644, [
                      _cache[145] || (_cache[145] = _createElementVNode("span", { style: {"flex":"none","width":"74px","font-size":"12.5px","font-weight":"600","color":"var(--pkm-t3)"} }, "Rayon", -1 /* CACHED */)),
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.radii || []), (tr2, tr2_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: tr2_i,
                          type: "button",
                          onClick: tr2.pick,
                          "aria-pressed": _ctx.A(tr2.on),
                          style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${tr2.bc}; background: ${tr2.bg}; color: ${tr2.fg}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer`)
                        }, _toDisplayString(tr2.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_645))
                      }), 128 /* KEYED_FRAGMENT */))
                    ])
                  ]),
                  _createElementVNode("span", _hoisted_646, _toDisplayString(_ctx.V.ter.count), 1 /* TEXT */),
                  (_ctx.V.ter.empty)
                    ? (_openBlock(), _createElementBlock("p", _hoisted_647, "Aucun magasin ne correspond : élargis le rayon ou baisse le seuil de probabilité."))
                    : _createCommentVNode("v-if", true),
                  _createElementVNode("div", _hoisted_648, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ter.list || []), (so2, so2_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: so2_i,
                        type: "button",
                        onClick: so2.open,
                        style: _normalizeStyle(`display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 0; border-top: ${so2.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                      }, [
                        _createElementVNode("span", _hoisted_650, [
                          (_openBlock(), _createElementBlock("svg", _hoisted_651, [
                            _createElementVNode("path", {
                              d: so2.icon
                            }, null, 8 /* PROPS */, _hoisted_652)
                          ]))
                        ]),
                        _createElementVNode("span", _hoisted_653, [
                          _createElementVNode("span", _hoisted_654, [
                            _createElementVNode("span", _hoisted_655, _toDisplayString(so2.name), 1 /* TEXT */),
                            (so2.partner)
                              ? (_openBlock(), _createElementBlock("span", _hoisted_656, "★ Partenaire Dropicards"))
                              : _createCommentVNode("v-if", true)
                          ]),
                          _createElementVNode("span", _hoisted_657, _toDisplayString(so2.kind) + " · " + _toDisplayString(so2.dist), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_658, _toDisplayString(so2.when), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_659, [
                            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((so2.chips || []), (ch, ch_i) => {
                              return (_openBlock(), _createElementBlock("span", {
                                key: ch_i,
                                style: {"display":"flex","align-items":"center","gap":"5px","padding":"2px 8px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","font-size":"11.5px","font-weight":"600","color":"var(--pkm-t2)"}
                              }, [
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`flex: none; width: 7px; height: 7px; border-radius: 4px; background: ${ch.color}`)
                                }, null, 4 /* STYLE */),
                                _createTextVNode(_toDisplayString(ch.name) + " · " + _toDisplayString(ch.prob), 1 /* TEXT */)
                              ]))
                            }), 128 /* KEYED_FRAGMENT */))
                          ]),
                          _createElementVNode("span", _hoisted_660, _toDisplayString(so2.src), 1 /* TEXT */)
                        ]),
                        _createElementVNode("span", _hoisted_661, [
                          _createElementVNode("span", {
                            style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 700; color: ${so2.color}`)
                          }, _toDisplayString(so2.prob), 5 /* TEXT, STYLE */),
                          _createElementVNode("span", {
                            style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${so2.tint}; color: ${so2.color}; font-size: 11px; font-weight: 700`)
                          }, _toDisplayString(so2.level), 5 /* TEXT, STYLE */)
                        ])
                      ], 12 /* STYLE, PROPS */, _hoisted_649))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]),
                  _cache[146] || (_cache[146] = _createElementVNode("section", {
                    class: "pkm-dark",
                    "aria-label": "Comment on estime la probabilité",
                    style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card-2)","display":"flex","flex-direction":"column","gap":"6px","color":"var(--pkm-t1)"}
                  }, [
                    _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"15px","font-weight":"600"} }, "Comment on estime la probabilité ?"),
                    _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Trois sources : l’annonce du magasin (boutiques partenaires Dropicards), les signalements des collectionneurs et l’historique des arrivages (jour de la semaine, délai après une sortie). C’est une estimation, pas une garantie de stock. Aucune donnée n’est récupérée sur les sites des enseignes.")
                  ], -1 /* CACHED */))
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true)
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isStore)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 15 }, [
            _createElementVNode("section", _hoisted_662, [
              _createElementVNode("div", _hoisted_663, [
                _createElementVNode("span", _hoisted_664, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_665, [
                    _createElementVNode("path", {
                      d: _ctx.V.store.icon
                    }, null, 8 /* PROPS */, _hoisted_666)
                  ]))
                ]),
                _createElementVNode("span", _hoisted_667, [
                  _createElementVNode("span", _hoisted_668, _toDisplayString(_ctx.V.store.open), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_669, _toDisplayString(_ctx.V.store.hours), 1 /* TEXT */),
                  (_ctx.V.store.partner)
                    ? (_openBlock(), _createElementBlock("span", _hoisted_670, "★ Partenaire Dropicards"))
                    : _createCommentVNode("v-if", true)
                ]),
                _createElementVNode("span", _hoisted_671, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: ${_ctx.V.store.color}`)
                  }, _toDisplayString(_ctx.V.store.prob), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${_ctx.V.store.tint}; color: ${_ctx.V.store.color}; font-size: 11.5px; font-weight: 700`)
                  }, _toDisplayString(_ctx.V.store.level), 5 /* TEXT, STYLE */)
                ])
              ]),
              _createElementVNode("p", _hoisted_672, _toDisplayString(_ctx.V.store.partnerNote), 1 /* TEXT */)
            ]),
            _createElementVNode("section", _hoisted_673, [
              _cache[148] || (_cache[148] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Prochains arrivages", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.store.arrivals || []), (ar, ar_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ar_i,
                  style: _normalizeStyle(`display: flex; gap: 12px; padding: 12px 0; border-top: ${ar.border}`)
                }, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: ar.openItem,
                    "aria-label": _ctx.A(ar.aria),
                    style: _normalizeStyle(`position: relative; flex: none; width: calc(${ar.wk} * 44px); height: calc(${ar.hk} * 58px); outline: ${ar.ring}; outline-offset: -1.5px; padding: 0; border: 0; border-radius: 8px; overflow: hidden; background: ${ar.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12); cursor: pointer`)
                  }, [
                    (ar.isCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: ar.img,
                          "data-fallback": ar.fallback,
                          alt: "",
                          style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                        }, null, 8 /* PROPS */, _hoisted_675))
                      : _createCommentVNode("v-if", true),
                    (ar.sealedArt)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: ar.logo,
                          "data-broken": "1",
                          alt: "",
                          style: {"max-width":"38px","max-height":"26px","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_676))
                      : _createCommentVNode("v-if", true),
                    (ar.hasPhoto)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 2,
                          src: ar.photo,
                          "data-broken": "1",
                          alt: "",
                          loading: "lazy",
                          style: {"width":"100%","height":"100%","object-fit":"cover"}
                        }, null, 8 /* PROPS */, _hoisted_677))
                      : _createCommentVNode("v-if", true)
                  ], 12 /* STYLE, PROPS */, _hoisted_674),
                  _createElementVNode("div", _hoisted_678, [
                    _createElementVNode("div", _hoisted_679, [
                      _createElementVNode("span", _hoisted_680, _toDisplayString(ar.name), 1 /* TEXT */),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`flex: none; font-size: 14.5px; font-weight: 800; color: ${ar.color}`)
                      }, _toDisplayString(ar.prob), 5 /* TEXT, STYLE */)
                    ]),
                    _createElementVNode("span", _hoisted_681, _toDisplayString(ar.when), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_682, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`display: block; width: ${ar.barW}; height: 100%; border-radius: 3px; background: ${ar.color}`)
                      }, null, 4 /* STYLE */)
                    ]),
                    _createElementVNode("span", _hoisted_683, [
                      _createElementVNode("span", {
                        style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${ar.tint}; color: ${ar.color}; font-size: 11px; font-weight: 700`)
                      }, _toDisplayString(ar.level), 5 /* TEXT, STYLE */),
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((ar.srcs || []), (sr2, sr2_i) => {
                        return (_openBlock(), _createElementBlock("span", {
                          key: sr2_i,
                          style: {"padding":"1px 8px","border-radius":"999px","border":"1px solid var(--pkm-line-2)","color":"var(--pkm-t2)","font-size":"11px","font-weight":"600"}
                        }, _toDisplayString(sr2.label), 1 /* TEXT */))
                      }), 128 /* KEYED_FRAGMENT */)),
                      _createElementVNode("span", _hoisted_684, _toDisplayString(ar.cote), 1 /* TEXT */)
                    ])
                  ])
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_685, [
              _cache[149] || (_cache[149] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Historique des arrivages", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.store.history || []), (hs, hs_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: hs_i,
                  style: _normalizeStyle(`display: flex; gap: 12px; align-items: baseline; min-height: 40px; padding-top: 8px; border-top: ${hs.border}`)
                }, [
                  _createElementVNode("span", _hoisted_686, _toDisplayString(hs.date), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_687, _toDisplayString(hs.text), 1 /* TEXT */)
                ], 4 /* STYLE */))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("div", _hoisted_688, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.store.toggleAlert,
                "aria-pressed": _ctx.A(_ctx.V.store.alertOn),
                style: _normalizeStyle(`height: 54px; border: 1px solid ${_ctx.V.store.alertBc}; border-radius: 999px; background: ${_ctx.V.store.alertBg}; color: ${_ctx.V.store.alertFg}; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer`)
              }, _toDisplayString(_ctx.V.store.alertLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_689),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.store.route,
                style: {"height":"54px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
              }, "Itinéraire", 8 /* PROPS */, _hoisted_690)
            ]),
            _cache[150] || (_cache[150] = _createElementVNode("p", { style: {"margin":"0","font-size":"12px","line-height":"1.5","color":"var(--pkm-t4)"} }, "Probabilité estimée, pas une garantie de stock. Magasins et arrivages de démonstration : noms et données fictifs.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isLots)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 16 }, [
            _cache[153] || (_cache[153] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Un lot, c’est plusieurs articles payés en un seul prix. Ce prix est réparti entre les articles pour calculer leur coût d’achat et ta plus-value.", -1 /* CACHED */)),
            _createElementVNode("section", _hoisted_691, [
              _createElementVNode("div", _hoisted_692, [
                _createElementVNode("div", _hoisted_693, [
                  _createElementVNode("h2", _hoisted_694, _toDisplayString(_ctx.V.lots.title), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_695, _toDisplayString(_ctx.V.lots.meta), 1 /* TEXT */)
                ]),
                _createElementVNode("div", _hoisted_696, [
                  _createElementVNode("span", _hoisted_697, _toDisplayString(_ctx.V.lots.total), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_698, _toDisplayString(_ctx.V.lots.count), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("div", _hoisted_699, [
                _cache[151] || (_cache[151] = _createElementVNode("span", { style: {"font-size":"13px","color":"var(--pkm-t3)"} }, "Répartir le prix du lot", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_700, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.lots.methods || []), (lm, lm_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: lm_i,
                      type: "button",
                      onClick: lm.pick,
                      "aria-pressed": _ctx.A(lm.on),
                      style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 10px; border-radius: 999px; border: 1px solid ${lm.bc}; background: ${lm.bg}; color: ${lm.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                    }, _toDisplayString(lm.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_701))
                  }), 128 /* KEYED_FRAGMENT */))
                ]),
                _createElementVNode("span", _hoisted_702, _toDisplayString(_ctx.V.lots.methodHelp), 1 /* TEXT */)
              ]),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.lots.lines || []), (ll, ll_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: ll_i,
                  style: {"display":"flex","align-items":"center","gap":"12px","min-height":"70px","border-top":"1px solid var(--pkm-line)"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`position: relative; flex: none; width: calc(${ll.wk} * 40px); height: calc(${ll.hk} * 52px); outline: ${ll.ring}; outline-offset: -1.5px; border-radius: 8px; overflow: hidden; background: ${ll.bg}; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                  }, [
                    (ll.isCard)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 0,
                          src: ll.img,
                          "data-fallback": ll.fallback,
                          alt: "",
                          style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                        }, null, 8 /* PROPS */, _hoisted_703))
                      : _createCommentVNode("v-if", true),
                    (ll.sealedArt)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 1,
                          src: ll.logo,
                          "data-broken": "1",
                          alt: "",
                          style: {"max-width":"34px","max-height":"24px","object-fit":"contain"}
                        }, null, 8 /* PROPS */, _hoisted_704))
                      : _createCommentVNode("v-if", true),
                    (ll.hasPhoto)
                      ? (_openBlock(), _createElementBlock("img", {
                          key: 2,
                          src: ll.photo,
                          "data-broken": "1",
                          alt: "",
                          loading: "lazy",
                          style: {"width":"100%","height":"100%","object-fit":"cover"}
                        }, null, 8 /* PROPS */, _hoisted_705))
                      : _createCommentVNode("v-if", true)
                  ], 4 /* STYLE */),
                  _createElementVNode("span", _hoisted_706, [
                    _createElementVNode("span", _hoisted_707, _toDisplayString(ll.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_708, _toDisplayString(ll.meta), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_709, [
                    _createElementVNode("span", _hoisted_710, _toDisplayString(ll.unitCost), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_711, _toDisplayString(ll.total), 1 /* TEXT */)
                  ])
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_712, [
              _cache[152] || (_cache[152] = _createElementVNode("h2", { style: {"margin":"0 0 4px","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Effet sur tes marges", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.lots.impacts || []), (im, im_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: im_i,
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 54px; border-top: ${im.border}`)
                }, [
                  _createElementVNode("span", _hoisted_713, [
                    _createElementVNode("span", _hoisted_714, _toDisplayString(im.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_715, _toDisplayString(im.sub), 1 /* TEXT */)
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
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 17 }, [
            _cache[157] || (_cache[157] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Appliqués automatiquement aux ventes que tu notes. Une vente déjà enregistrée garde ses frais : tu peux les corriger vente par vente.", -1 /* CACHED */)),
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.feesEdit || []), (fe, fe_i) => {
              return (_openBlock(), _createElementBlock("section", {
                key: fe_i,
                class: "pkm-dark",
                "aria-label": _ctx.A(fe.label),
                style: {"flex":"none","padding":"16px","border-radius":"22px","border":"1px solid var(--pkm-line)","background":"var(--pkm-card)","display":"flex","flex-direction":"column","gap":"10px","color":"var(--pkm-t1)"}
              }, [
                _createElementVNode("h2", _hoisted_717, _toDisplayString(fe.label), 1 /* TEXT */),
                _createElementVNode("div", _hoisted_718, [
                  _createElementVNode("label", _hoisted_719, [
                    _cache[154] || (_cache[154] = _createTextVNode("Commission (%)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-5",
                      class: "pkm-dark",
                      type: "text",
                      inputmode: "decimal",
                      value: fe.rate,
                      onInput: fe.onRate,
                      style: {"height":"46px","width":"100%","box-sizing":"border-box","padding":"0 12px","border":"1px solid var(--pkm-line-2)","border-radius":"14px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"15px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_720)
                  ]),
                  _createElementVNode("label", _hoisted_721, [
                    _cache[155] || (_cache[155] = _createTextVNode("Fixe par vente (€)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-6",
                      class: "pkm-dark",
                      type: "text",
                      inputmode: "decimal",
                      value: fe.fixed,
                      onInput: fe.onFixed,
                      style: {"height":"46px","width":"100%","box-sizing":"border-box","padding":"0 12px","border":"1px solid var(--pkm-line-2)","border-radius":"14px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"15px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_722)
                  ]),
                  _createElementVNode("label", _hoisted_723, [
                    _cache[156] || (_cache[156] = _createTextVNode("Port à ta charge (€)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-7",
                      class: "pkm-dark",
                      type: "text",
                      inputmode: "decimal",
                      value: fe.port,
                      onInput: fe.onPort,
                      style: {"height":"46px","width":"100%","box-sizing":"border-box","padding":"0 12px","border":"1px solid var(--pkm-line-2)","border-radius":"14px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"15px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_724)
                  ])
                ]),
                _createElementVNode("p", _hoisted_725, _toDisplayString(fe.example), 1 /* TEXT */)
              ], 8 /* PROPS */, _hoisted_716))
            }), 128 /* KEYED_FRAGMENT */)),
            _cache[158] || (_cache[158] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.45","color":"var(--pkm-orange)"} }, "Valeurs d’exemple, à vérifier selon ton statut (particulier ou professionnel) et les conditions de chaque plateforme.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isTeam)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 18 }, [
            _createElementVNode("section", _hoisted_726, [
              _cache[160] || (_cache[160] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Équipe", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.team.members || []), (m, m_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: m_i,
                  style: {"display":"flex","align-items":"center","gap":"12px"}
                }, [
                  _createElementVNode("span", {
                    style: _normalizeStyle(`flex: none; width: 42px; height: 42px; border-radius: 21px; background: ${m.avatarBg}; color: var(--pkm-ink); display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-weight: 700`)
                  }, _toDisplayString(m.initial), 5 /* TEXT, STYLE */),
                  _createElementVNode("span", _hoisted_727, [
                    _createElementVNode("span", _hoisted_728, _toDisplayString(m.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_729, _toDisplayString(m.role), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_730, [
                    _cache[159] || (_cache[159] = _createElementVNode("span", { style: {"font-size":"12px","color":"var(--pkm-t4)"} }, "Apports", -1 /* CACHED */)),
                    _createElementVNode("span", _hoisted_731, _toDisplayString(m.apport), 1 /* TEXT */)
                  ])
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_732, [
              _cache[161] || (_cache[161] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Partage de la marge nette", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_733, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.team.rules || []), (ru, ru_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: ru_i,
                    type: "button",
                    onClick: ru.pick,
                    "aria-pressed": _ctx.A(ru.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 8px; border-radius: 999px; border: 1px solid ${ru.bc}; background: ${ru.bg}; color: ${ru.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(ru.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_734))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.team.members || []), (m, m_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: m_i,
                  style: {"display":"flex","justify-content":"space-between","align-items":"center","gap":"12px","min-height":"42px"}
                }, [
                  _createElementVNode("span", _hoisted_735, [
                    _createElementVNode("span", _hoisted_736, _toDisplayString(m.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_737, _toDisplayString(m.shareLabel), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", {
                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: ${m.color}`)
                  }, _toDisplayString(m.amount), 5 /* TEXT, STYLE */)
                ]))
              }), 128 /* KEYED_FRAGMENT */)),
              _createElementVNode("p", _hoisted_738, _toDisplayString(_ctx.V.team.total), 1 /* TEXT */)
            ]),
            _cache[162] || (_cache[162] = _createElementVNode("p", { style: {"margin":"0","font-size":"13px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Chaque ajout et chaque vente indique l’associé qui l’a fait. Les apports sont les achats payés par chacun.", -1 /* CACHED */))
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true),
      (_ctx.V.ui.isIO)
        ? (_openBlock(), _createElementBlock(_Fragment, { key: 19 }, [
            _createElementVNode("section", _hoisted_739, [
              _cache[164] || (_cache[164] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Importer", -1 /* CACHED */)),
              _cache[165] || (_cache[165] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Un fichier CSV : ton tableur actuel, ou l’export d’une autre app de collection.", -1 /* CACHED */)),
              _createElementVNode("button", {
                class: "pkm-dark",
                type: "button",
                onClick: _ctx.V.demoImport,
                style: {"height":"52px","border":"1.5px dashed var(--pkm-line-4)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font":"inherit","font-size":"14.5px","font-weight":"600","cursor":"pointer"}
              }, "Choisir un fichier CSV", 8 /* PROPS */, _hoisted_740),
              _cache[166] || (_cache[166] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Colonnes reconnues automatiquement", -1 /* CACHED */)),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.io.mapping || []), (mp, mp_i) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: mp_i,
                  style: {"display":"flex","align-items":"center","gap":"10px","min-height":"40px","border-top":"1px solid var(--pkm-line)","font-size":"13.5px"}
                }, [
                  _createElementVNode("span", _hoisted_741, _toDisplayString(mp.from), 1 /* TEXT */),
                  (_openBlock(), _createElementBlock("svg", _hoisted_742, [...(_cache[163] || (_cache[163] = [
                    _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */),
                    _createElementVNode("path", { d: "M13 6l6 6-6 6" }, null, -1 /* CACHED */)
                  ]))])),
                  _createElementVNode("span", _hoisted_743, _toDisplayString(mp.to), 1 /* TEXT */)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("section", _hoisted_744, [
              _cache[167] || (_cache[167] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"17px","font-weight":"600"} }, "Exporter", -1 /* CACHED */)),
              _cache[168] || (_cache[168] = _createElementVNode("p", { style: {"margin":"0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t3)"} }, "Toute ta collection et ton historique, sans limite : ajouts, ventes, cotes et frais.", -1 /* CACHED */)),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.demoExport,
                style: {"height":"52px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
              }, "Exporter en CSV", 8 /* PROPS */, _hoisted_745),
              _createElementVNode("span", _hoisted_746, _toDisplayString(_ctx.V.io.exportInfo), 1 /* TEXT */)
            ])
          ], 64 /* STABLE_FRAGMENT */))
        : _createCommentVNode("v-if", true)
    ]),
    _createElementVNode("nav", _hoisted_747, [
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabHome,
        "aria-label": "Accueil",
        "aria-current": _ctx.A(_ctx.V.tab.homeCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.homeFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_749, [...(_cache[169] || (_cache[169] = [
          _createElementVNode("path", { d: "M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.homeDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_748),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabCollection,
        "aria-label": "Collection",
        "aria-current": _ctx.A(_ctx.V.tab.collCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.collFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_751, [...(_cache[170] || (_cache[170] = [
          _createElementVNode("path", { d: "M8.5 4.5h9a1.5 1.5 0 0 1 1.5 1.5v12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 7 18.5V6a1.5 1.5 0 0 1 1.5-1.5z" }, null, -1 /* CACHED */),
          _createElementVNode("path", { d: "M4.5 7.5v10.5a2 2 0 0 0 2 2" }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.collDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_750),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.openScan,
        "aria-label": "Scanner une carte ou un produit",
        class: "pkm-anim",
        style: {"justify-self":"center","width":"62px","height":"62px","margin-top":"-30px","padding":"0","border":"4px solid var(--pkm-scan-ring)","border-radius":"31px","background":"linear-gradient(160deg, var(--pkm-scan-1), var(--pkm-scan-3) 60%, var(--pkm-scan-2))","color":"var(--pkm-scan-fg)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer","animation":"pkmPulse 2.6s ease-in-out infinite"}
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_753, [...(_cache[171] || (_cache[171] = [
          _createElementVNode("path", { d: "M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.6-2.2h5.4L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" }, null, -1 /* CACHED */),
          _createElementVNode("circle", {
            cx: "12",
            cy: "12.8",
            r: "3.4"
          }, null, -1 /* CACHED */)
        ]))]))
      ], 8 /* PROPS */, _hoisted_752),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabMarket,
        "aria-label": "Marché",
        "aria-current": _ctx.A(_ctx.V.tab.mktCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.mktFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_755, [...(_cache[172] || (_cache[172] = [
          _createElementVNode("path", { d: "M4 19.5h16" }, null, -1 /* CACHED */),
          _createElementVNode("path", { d: "M5 15.5l4.5-4.5 3.5 3 6-6.5" }, null, -1 /* CACHED */),
          _createElementVNode("path", { d: "M15 7.5h4v4" }, null, -1 /* CACHED */)
        ]))])),
        _createElementVNode("span", {
          style: _normalizeStyle(`width: 5px; height: 5px; border-radius: 3px; background: ${_ctx.V.tab.mktDot}`)
        }, null, 4 /* STYLE */)
      ], 12 /* STYLE, PROPS */, _hoisted_754),
      _createElementVNode("button", {
        type: "button",
        onClick: _ctx.V.tabTerritory,
        "aria-label": "Territoire",
        "aria-current": _ctx.A(_ctx.V.tab.terCur),
        style: _normalizeStyle(`height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 0; border: 0; background: transparent; color: ${_ctx.V.tab.terFg}; cursor: pointer`)
      }, [
        (_openBlock(), _createElementBlock("svg", _hoisted_757, [...(_cache[173] || (_cache[173] = [
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
      ], 12 /* STYLE, PROPS */, _hoisted_756)
    ]),
    (_ctx.V.ui.isScan)
      ? (_openBlock(), _createElementBlock("section", _hoisted_758, [
          _cache[186] || (_cache[186] = _createElementVNode("div", {
            id: "pkm-scan-cam",
            "aria-hidden": "true",
            style: {"position":"absolute","inset":"0","overflow":"hidden"}
          }, null, -1 /* CACHED */)),
          _createElementVNode("input", {
            type: "file",
            id: "pkm-scan-photo",
            accept: "image/*",
            capture: "environment",
            tabindex: "-1",
            "aria-hidden": "true",
            onInput: _ctx.V.scan.onFile,
            style: {"position":"absolute","left":"0","top":"0","width":"1px","height":"1px","opacity":"0","pointer-events":"none"}
          }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_759),
          _createElementVNode("input", {
            type: "file",
            id: "pkm-scan-file",
            accept: "image/*",
            tabindex: "-1",
            "aria-hidden": "true",
            onInput: _ctx.V.scan.onFile,
            style: {"position":"absolute","left":"0","top":"0","width":"1px","height":"1px","opacity":"0","pointer-events":"none"}
          }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_760),
          _createElementVNode("div", _hoisted_761, [
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.scan.close,
              "aria-label": "Fermer le scan",
              style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid rgba(var(--pkm-hl-rgb), 0.16)","border-radius":"22px","background":"rgba(var(--pkm-ink-rgb), 0.66)","color":"var(--pkm-white)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
            }, [
              (_openBlock(), _createElementBlock("svg", _hoisted_763, [...(_cache[174] || (_cache[174] = [
                _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
              ]))]))
            ], 8 /* PROPS */, _hoisted_762),
            _createElementVNode("div", _hoisted_764, [
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.toCard,
                "aria-pressed": _ctx.A(_ctx.V.scan.modeCard),
                style: _normalizeStyle(`height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: ${_ctx.V.scan.cardBg}; color: ${_ctx.V.scan.cardFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
              }, "Carte", 12 /* STYLE, PROPS */, _hoisted_765),
              _createElementVNode("button", {
                type: "button",
                onClick: _ctx.V.scan.toSealed,
                "aria-pressed": _ctx.A(_ctx.V.scan.modeSealed),
                style: _normalizeStyle(`height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: ${_ctx.V.scan.sealedBg}; color: ${_ctx.V.scan.sealedFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
              }, "Scellé", 12 /* STYLE, PROPS */, _hoisted_766)
            ]),
            (_ctx.V.scan.hasTorch)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 0,
                  type: "button",
                  onClick: _ctx.V.scan.torch,
                  "aria-label": _ctx.A(_ctx.V.scan.torchLabel),
                  "aria-pressed": _ctx.A(_ctx.V.scan.torchOn),
                  style: _normalizeStyle(`flex: none; width: 44px; height: 44px; padding: 0; border: 1px solid rgba(var(--pkm-hl-rgb), 0.16); border-radius: 22px; background: ${_ctx.V.scan.torchBg}; color: ${_ctx.V.scan.torchFg}; display: flex; align-items: center; justify-content: center; cursor: pointer`)
                }, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_768, [...(_cache[175] || (_cache[175] = [
                    _createElementVNode("path", { d: "M13 3L5 13.5h6L10 21l8-10.5h-6z" }, null, -1 /* CACHED */)
                  ]))]))
                ], 12 /* STYLE, PROPS */, _hoisted_767))
              : _createCommentVNode("v-if", true),
            (_ctx.V.scan.noTorch)
              ? (_openBlock(), _createElementBlock("span", _hoisted_769))
              : _createCommentVNode("v-if", true)
          ]),
          (_ctx.V.scan.modeCard)
            ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                _createElementVNode("div", _hoisted_770, [
                  (_ctx.V.scan.showFrame)
                    ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                        _createElementVNode("span", _hoisted_771, _toDisplayString(_ctx.V.scan.hint), 1 /* TEXT */),
                        _createElementVNode("div", _hoisted_772, [
                          _cache[176] || (_cache[176] = _createElementVNode("span", {
                            "aria-hidden": "true",
                            style: {"position":"absolute","left":"-3px","top":"-3px","width":"38px","height":"38px","box-sizing":"border-box","border-left":"4px solid var(--pkm-accent)","border-top":"4px solid var(--pkm-accent)","border-radius":"18px 0 0 0"}
                          }, null, -1 /* CACHED */)),
                          _cache[177] || (_cache[177] = _createElementVNode("span", {
                            "aria-hidden": "true",
                            style: {"position":"absolute","right":"-3px","top":"-3px","width":"38px","height":"38px","box-sizing":"border-box","border-right":"4px solid var(--pkm-accent)","border-top":"4px solid var(--pkm-accent)","border-radius":"0 18px 0 0"}
                          }, null, -1 /* CACHED */)),
                          _cache[178] || (_cache[178] = _createElementVNode("span", {
                            "aria-hidden": "true",
                            style: {"position":"absolute","left":"-3px","bottom":"-3px","width":"38px","height":"38px","box-sizing":"border-box","border-left":"4px solid var(--pkm-accent)","border-bottom":"4px solid var(--pkm-accent)","border-radius":"0 0 0 18px"}
                          }, null, -1 /* CACHED */)),
                          _cache[179] || (_cache[179] = _createElementVNode("span", {
                            "aria-hidden": "true",
                            style: {"position":"absolute","right":"-3px","bottom":"-3px","width":"38px","height":"38px","box-sizing":"border-box","border-right":"4px solid var(--pkm-accent)","border-bottom":"4px solid var(--pkm-accent)","border-radius":"0 0 18px 0"}
                          }, null, -1 /* CACHED */)),
                          (_ctx.V.scan.reading)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_773))
                            : _createCommentVNode("v-if", true)
                        ])
                      ], 64 /* STABLE_FRAGMENT */))
                    : _createCommentVNode("v-if", true),
                  (_ctx.V.scan.hasPanel)
                    ? (_openBlock(), _createElementBlock("section", {
                        key: 1,
                        "aria-label": _ctx.A(_ctx.V.scan.panelTitle),
                        style: {"width":"100%","max-width":"360px","box-sizing":"border-box","padding":"18px 16px","border-radius":"22px","background":"var(--pkm-card-2)","border":"1px solid var(--pkm-line-2)","display":"flex","flex-direction":"column","gap":"12px"}
                      }, [
                        _createElementVNode("h2", _hoisted_775, _toDisplayString(_ctx.V.scan.panelTitle), 1 /* TEXT */),
                        _createElementVNode("p", _hoisted_776, _toDisplayString(_ctx.V.scan.panelText), 1 /* TEXT */),
                        (_ctx.V.scan.panelRetry)
                          ? (_openBlock(), _createElementBlock("button", {
                              key: 0,
                              type: "button",
                              onClick: _ctx.V.scan.retryCam,
                              style: {"height":"48px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                            }, "Réessayer", 8 /* PROPS */, _hoisted_777))
                          : _createCommentVNode("v-if", true),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.scan.takePhoto,
                          style: {"height":"48px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                        }, "Prendre une photo", 8 /* PROPS */, _hoisted_778),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.scan.importPhoto,
                          style: {"height":"48px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px","font-weight":"700","cursor":"pointer"}
                        }, "Importer une photo", 8 /* PROPS */, _hoisted_779),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.scan.search,
                          style: {"height":"48px","border":"0","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"15px","font-weight":"700","text-decoration":"underline","text-underline-offset":"3px","cursor":"pointer"}
                        }, "Rechercher une carte", 8 /* PROPS */, _hoisted_780)
                      ], 8 /* PROPS */, _hoisted_774))
                    : _createCommentVNode("v-if", true),
                  _createElementVNode("div", _hoisted_781, [
                    (_ctx.V.scan.hasStatus)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_782, [
                          _createElementVNode("span", {
                            "aria-hidden": "true",
                            style: _normalizeStyle(`flex: none; width: 8px; height: 8px; border-radius: 4px; background: ${_ctx.V.scan.dot}`)
                          }, null, 4 /* STYLE */),
                          _createElementVNode("span", _hoisted_783, _toDisplayString(_ctx.V.scan.status), 1 /* TEXT */)
                        ]))
                      : _createCommentVNode("v-if", true)
                  ])
                ]),
                (_ctx.V.scan.showFrame)
                  ? (_openBlock(), _createElementBlock("div", _hoisted_784, [
                      _createElementVNode("span", _hoisted_785, _toDisplayString(_ctx.V.scan.count), 1 /* TEXT */),
                      _createElementVNode("div", _hoisted_786, [
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.scan.importPhoto,
                          "aria-label": "Importer une photo",
                          style: {"justify-self":"start","width":"52px","height":"52px","padding":"0","border":"1px solid rgba(var(--pkm-hl-rgb), 0.18)","border-radius":"16px","background":"rgba(var(--pkm-ink-rgb), 0.66)","color":"var(--pkm-white)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                        }, [
                          (_openBlock(), _createElementBlock("svg", _hoisted_788, [...(_cache[180] || (_cache[180] = [
                            _createElementVNode("path", { d: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" }, null, -1 /* CACHED */),
                            _createElementVNode("path", { d: "M4 15.5l4.5-4.5 4 4 2.5-2.5 5 5" }, null, -1 /* CACHED */),
                            _createElementVNode("circle", {
                              cx: "15.5",
                              cy: "9",
                              r: "1.5"
                            }, null, -1 /* CACHED */)
                          ]))]))
                        ], 8 /* PROPS */, _hoisted_787),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.scan.shutter,
                          "aria-label": _ctx.A(_ctx.V.scan.shutterLabel),
                          "aria-disabled": _ctx.A(_ctx.V.scan.shutterOff),
                          style: _normalizeStyle(`width: 80px; height: 80px; padding: 6px; box-sizing: border-box; border: 4px solid var(--pkm-white); border-radius: 40px; background: rgba(var(--pkm-hl-rgb), 0.12); opacity: ${_ctx.V.scan.shutterOp}; cursor: pointer`)
                        }, [...(_cache[181] || (_cache[181] = [
                          _createElementVNode("span", { style: {"display":"block","width":"100%","height":"100%","border-radius":"50%","background":"var(--pkm-white)"} }, null, -1 /* CACHED */)
                        ]))], 12 /* STYLE, PROPS */, _hoisted_789),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.scan.search,
                          "aria-label": "Rechercher une carte",
                          style: {"justify-self":"end","width":"52px","height":"52px","padding":"0","border":"1px solid rgba(var(--pkm-hl-rgb), 0.18)","border-radius":"16px","background":"rgba(var(--pkm-ink-rgb), 0.66)","color":"var(--pkm-white)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                        }, [
                          (_openBlock(), _createElementBlock("svg", _hoisted_791, [...(_cache[182] || (_cache[182] = [
                            _createElementVNode("circle", {
                              cx: "11",
                              cy: "11",
                              r: "6.5"
                            }, null, -1 /* CACHED */),
                            _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
                          ]))]))
                        ], 8 /* PROPS */, _hoisted_790)
                      ])
                    ]))
                  : _createCommentVNode("v-if", true)
              ], 64 /* STABLE_FRAGMENT */))
            : _createCommentVNode("v-if", true),
          (_ctx.V.scan.modeSealed)
            ? (_openBlock(), _createElementBlock("div", _hoisted_792, [
                _createElementVNode("p", _hoisted_793, _toDisplayString(_ctx.V.scan.sealedIntro), 1 /* TEXT */),
                _createElementVNode("div", _hoisted_794, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_795, [...(_cache[183] || (_cache[183] = [
                    _createElementVNode("circle", {
                      cx: "11",
                      cy: "11",
                      r: "6.5"
                    }, null, -1 /* CACHED */),
                    _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
                  ]))])),
                  _createElementVNode("input", {
                    id: "pkm-champ-8",
                    type: "search",
                    "aria-label": "Chercher un produit scellé",
                    placeholder: "ETB, Display, Flammes…",
                    value: _ctx.V.scan.sq,
                    onInput: _ctx.V.scan.onSq,
                    style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px"}
                  }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_796)
                ]),
                _createElementVNode("span", _hoisted_797, _toDisplayString(_ctx.V.scan.sealedCount), 1 /* TEXT */),
                _createElementVNode("div", _hoisted_798, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.scan.sealedRows || []), (sp, sp_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: sp_i,
                      type: "button",
                      role: "listitem",
                      onClick: sp.pick,
                      style: {"flex":"none","display":"flex","align-items":"center","gap":"12px","padding":"8px","border-radius":"16px","border":"1px solid var(--pkm-line-2)","background":"var(--pkm-card-2)","color":"var(--pkm-t1)","font":"inherit","text-align":"left","cursor":"pointer"}
                    }, [
                      _createElementVNode("span", _hoisted_800, [
                        _createElementVNode("img", {
                          src: sp.pic,
                          "data-broken": "1",
                          alt: "",
                          loading: "lazy",
                          width: "96",
                          height: "54",
                          style: _normalizeStyle(`display: block; width: 100%; height: 100%; object-fit: ${sp.fit}`)
                        }, null, 12 /* STYLE, PROPS */, _hoisted_801)
                      ]),
                      _createElementVNode("span", _hoisted_802, [
                        _createElementVNode("span", _hoisted_803, _toDisplayString(sp.name), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_804, _toDisplayString(sp.sub), 1 /* TEXT */)
                      ]),
                      _createElementVNode("span", _hoisted_805, _toDisplayString(sp.cote), 1 /* TEXT */)
                    ], 8 /* PROPS */, _hoisted_799))
                  }), 128 /* KEYED_FRAGMENT */))
                ])
              ]))
            : _createCommentVNode("v-if", true),
          (_ctx.V.scan.picking)
            ? (_openBlock(), _createElementBlock("div", _hoisted_806, [
                _createElementVNode("button", {
                  type: "button",
                  "aria-label": "Revenir à la caméra",
                  onClick: _ctx.V.scan.retry,
                  style: {"flex":"1 1 auto","min-height":"44px","padding":"0","border":"0","background":"transparent","cursor":"pointer"}
                }, null, 8 /* PROPS */, _hoisted_807),
                _createElementVNode("section", _hoisted_808, [
                  _cache[184] || (_cache[184] = _createElementVNode("div", {
                    "aria-hidden": "true",
                    style: {"flex":"none","align-self":"center","width":"40px","height":"5px","border-radius":"3px","background":"var(--pkm-line-2)"}
                  }, null, -1 /* CACHED */)),
                  _cache[185] || (_cache[185] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"19px","font-weight":"600","color":"var(--pkm-t1)"} }, "C’est laquelle ?", -1 /* CACHED */)),
                  _createElementVNode("p", _hoisted_809, _toDisplayString(_ctx.V.scan.evText), 1 /* TEXT */),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.scan.cands || []), (sk, sk_i) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: sk_i,
                      type: "button",
                      onClick: sk.pick,
                      "aria-label": _ctx.A(sk.aria),
                      style: _normalizeStyle(`flex: none; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 18px; border: 1px solid ${sk.bc}; background: ${sk.bg}; color: var(--pkm-t1); font: inherit; text-align: left; cursor: pointer`)
                    }, [
                      _createElementVNode("img", {
                        src: sk.img,
                        "data-fallback": sk.fallback,
                        alt: "",
                        width: "60",
                        height: "84",
                        style: {"flex":"none","display":"block","width":"60px","height":"84px","border-radius":"6px","object-fit":"cover","background":"var(--pkm-img-bg)"}
                      }, null, 8 /* PROPS */, _hoisted_811),
                      _createElementVNode("span", _hoisted_812, [
                        (sk.best)
                          ? (_openBlock(), _createElementBlock("span", _hoisted_813, "Le plus probable"))
                          : _createCommentVNode("v-if", true),
                        _createElementVNode("span", _hoisted_814, _toDisplayString(sk.name), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_815, _toDisplayString(sk.sub), 1 /* TEXT */),
                        _createElementVNode("span", _hoisted_816, _toDisplayString(sk.cote), 1 /* TEXT */)
                      ]),
                      (sk.hasOwned)
                        ? (_openBlock(), _createElementBlock("span", _hoisted_817, _toDisplayString(sk.owned), 1 /* TEXT */))
                        : _createCommentVNode("v-if", true)
                    ], 12 /* STYLE, PROPS */, _hoisted_810))
                  }), 128 /* KEYED_FRAGMENT */)),
                  _createElementVNode("div", _hoisted_818, [
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.scan.none,
                      style: {"height":"48px","padding":"0 10px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                    }, "Aucune de ces cartes", 8 /* PROPS */, _hoisted_819),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.scan.retry,
                      style: {"height":"48px","padding":"0 10px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                    }, "Réessayer", 8 /* PROPS */, _hoisted_820)
                  ])
                ])
              ]))
            : _createCommentVNode("v-if", true)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.scanSheetOpen)
      ? (_openBlock(), _createElementBlock("div", _hoisted_821, [
          _createElementVNode("button", {
            type: "button",
            "aria-label": "Revenir au scan",
            onClick: _ctx.V.sr.close,
            style: {"flex":"1 1 auto","min-height":"44px","padding":"0","border":"0","background":"transparent","cursor":"pointer"}
          }, null, 8 /* PROPS */, _hoisted_822),
          _createElementVNode("section", _hoisted_823, [
            _cache[196] || (_cache[196] = _createElementVNode("div", {
              "aria-hidden": "true",
              style: {"flex":"none","align-self":"center","width":"40px","height":"5px","border-radius":"3px","background":"var(--pkm-line-2)"}
            }, null, -1 /* CACHED */)),
            _createElementVNode("div", _hoisted_824, [
              _createElementVNode("span", {
                style: _normalizeStyle(`position: relative; flex: none; width: calc(${_ctx.V.sr.wk} * 84px); height: calc(${_ctx.V.sr.hk} * 112px); outline: ${_ctx.V.sr.ring}; outline-offset: -1.5px; border-radius: 10px; overflow: hidden; background: ${_ctx.V.sr.bg}; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 22px rgba(var(--pkm-shadow-rgb), 0.45), inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
              }, [
                (_ctx.V.sr.isCard)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 0,
                      src: _ctx.V.sr.img,
                      "data-fallback": _ctx.V.sr.fallback,
                      alt: "",
                      style: {"width":"100%","height":"100%","object-fit":"cover","object-position":"top"}
                    }, null, 8 /* PROPS */, _hoisted_825))
                  : _createCommentVNode("v-if", true),
                (_ctx.V.sr.sealedArt)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 1,
                      src: _ctx.V.sr.logo,
                      "data-broken": "1",
                      alt: "",
                      style: {"max-width":"72px","max-height":"44px","object-fit":"contain"}
                    }, null, 8 /* PROPS */, _hoisted_826))
                  : _createCommentVNode("v-if", true),
                (_ctx.V.sr.hasPhoto)
                  ? (_openBlock(), _createElementBlock("img", {
                      key: 2,
                      src: _ctx.V.sr.photo,
                      "data-broken": "1",
                      alt: "",
                      loading: "lazy",
                      style: {"width":"100%","height":"100%","object-fit":"cover"}
                    }, null, 8 /* PROPS */, _hoisted_827))
                  : _createCommentVNode("v-if", true)
              ], 4 /* STYLE */),
              _createElementVNode("div", _hoisted_828, [
                _createElementVNode("span", {
                  style: _normalizeStyle(`padding: 2px 9px; border-radius: 999px; background: ${_ctx.V.sr.ownedBg}; color: ${_ctx.V.sr.ownedFg}; font-size: 11.5px; font-weight: 700`)
                }, _toDisplayString(_ctx.V.sr.ownedText), 5 /* TEXT, STYLE */),
                _createElementVNode("h2", _hoisted_829, _toDisplayString(_ctx.V.sr.name), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_830, _toDisplayString(_ctx.V.sr.sub), 1 /* TEXT */),
                _createElementVNode("span", _hoisted_831, _toDisplayString(_ctx.V.sr.conf), 1 /* TEXT */)
              ]),
              _createElementVNode("button", {
                class: "pkm-dark",
                type: "button",
                onClick: _ctx.V.sr.close,
                "aria-label": "Fermer",
                style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid var(--pkm-line)","border-radius":"22px","background":"var(--pkm-card)","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_833, [...(_cache[187] || (_cache[187] = [
                  _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_832)
            ]),
            _createElementVNode("section", _hoisted_834, [
              _createElementVNode("span", _hoisted_835, [
                _cache[188] || (_cache[188] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }, "Cote Dropicards", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_836, _toDisplayString(_ctx.V.sr.cote), 1 /* TEXT */)
              ]),
              _createElementVNode("span", _hoisted_837, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sr.srcs || []), (rs, rs_i) => {
                  return (_openBlock(), _createElementBlock("span", {
                    key: rs_i,
                    style: {"display":"flex","justify-content":"space-between","gap":"10px","font-size":"12px"}
                  }, [
                    _createElementVNode("span", _hoisted_838, _toDisplayString(rs.label) + " · " + _toDisplayString(rs.sub), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_839, _toDisplayString(rs.value), 1 /* TEXT */)
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _createElementVNode("div", _hoisted_840, [
              _cache[189] || (_cache[189] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Langue", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_841, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sr.langs || []), (lg, lg_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: lg_i,
                    type: "button",
                    onClick: lg.pick,
                    "aria-pressed": _ctx.A(lg.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; border-radius: 999px; border: 1px solid ${lg.bc}; background: ${lg.bg}; color: ${lg.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(lg.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_842))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _cache[190] || (_cache[190] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "État", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_843, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sr.conds || []), (cd, cd_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: cd_i,
                    type: "button",
                    onClick: cd.pick,
                    "aria-pressed": _ctx.A(cd.on),
                    style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${cd.bc}; background: ${cd.bg}; color: ${cd.fg}; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer`)
                  }, _toDisplayString(cd.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_844))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            _createElementVNode("div", _hoisted_845, [
              _createElementVNode("label", _hoisted_846, [
                _cache[191] || (_cache[191] = _createTextVNode("Prix payé (€) · facultatif", -1 /* CACHED */)),
                _createElementVNode("input", {
                  id: "pkm-champ-9",
                  class: "pkm-dark",
                  type: "text",
                  inputmode: "decimal",
                  placeholder: "0,00",
                  value: _ctx.V.sr.price,
                  onInput: _ctx.V.sr.onPrice,
                  style: {"height":"52px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid var(--pkm-line-2)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"19px","font-weight":"600"}
                }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_847)
              ]),
              _createElementVNode("div", _hoisted_848, [
                _cache[194] || (_cache[194] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Quantité", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_849, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sr.dec,
                    "aria-label": "Diminuer la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_851, [...(_cache[192] || (_cache[192] = [
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_850),
                  _createElementVNode("span", _hoisted_852, _toDisplayString(_ctx.V.sr.qty), 1 /* TEXT */),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sr.inc,
                    "aria-label": "Augmenter la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_854, [...(_cache[193] || (_cache[193] = [
                      _createElementVNode("path", { d: "M12 5v14" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_853)
                ])
              ])
            ]),
            _createElementVNode("span", _hoisted_855, _toDisplayString(_ctx.V.sr.priceHint), 1 /* TEXT */),
            _createElementVNode("section", _hoisted_856, [
              (_openBlock(), _createElementBlock("svg", _hoisted_857, [
                _createElementVNode("path", {
                  d: "M12 2l8.66 5v10L12 22l-8.66-5V7z",
                  style: _normalizeStyle(`fill: ${_ctx.V.sr.tierColor}; fill-opacity: 0.16; stroke: ${_ctx.V.sr.tierColor}; stroke-width: 1.3; stroke-linejoin: round`)
                }, null, 4 /* STYLE */),
                _createElementVNode("path", {
                  d: _ctx.V.sr.tierSym,
                  style: _normalizeStyle(`fill: ${_ctx.V.sr.tierColor}; stroke: none`)
                }, null, 12 /* STYLE, PROPS */, _hoisted_858)
              ])),
              _createElementVNode("span", _hoisted_859, [
                _cache[195] || (_cache[195] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t3)"} }, "Ta collection", -1 /* CACHED */)),
                _createElementVNode("span", _hoisted_860, _toDisplayString(_ctx.V.sr.valueLine), 1 /* TEXT */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-size: 12.5px; font-weight: 700; color: ${_ctx.V.sr.tierColor}`)
                }, _toDisplayString(_ctx.V.sr.tierLine), 5 /* TEXT, STYLE */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: ${_ctx.V.sr.profColor}`)
                }, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_861, [
                    _createElementVNode("path", {
                      d: _ctx.V.sr.profIcon
                    }, null, 8 /* PROPS */, _hoisted_862)
                  ])),
                  _createTextVNode(_toDisplayString(_ctx.V.sr.profLine), 1 /* TEXT */)
                ], 4 /* STYLE */)
              ])
            ]),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.sr.save,
              style: {"flex":"none","height":"54px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
            }, _toDisplayString(_ctx.V.sr.saveLabel), 9 /* TEXT, PROPS */, _hoisted_863),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.sr.wrong,
              style: {"flex":"none","height":"44px","margin-top":"-6px","border":"0","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
            }, "Ce n’est pas le bon article ?", 8 /* PROPS */, _hoisted_864)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.sheetOpen)
      ? (_openBlock(), _createElementBlock("div", _hoisted_865, [
          _createElementVNode("button", {
            type: "button",
            "aria-label": "Fermer la saisie",
            onClick: _ctx.V.closeSheet,
            style: {"flex":"1 1 auto","min-height":"44px","padding":"0","border":"0","background":"transparent","cursor":"pointer"}
          }, null, 8 /* PROPS */, _hoisted_866),
          _createElementVNode("section", _hoisted_867, [
            _cache[207] || (_cache[207] = _createElementVNode("div", {
              "aria-hidden": "true",
              style: {"flex":"none","align-self":"center","width":"40px","height":"5px","border-radius":"3px","background":"var(--pkm-line-2)"}
            }, null, -1 /* CACHED */)),
            _createElementVNode("div", _hoisted_868, [
              _createElementVNode("div", _hoisted_869, [
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.sh.toBuy,
                  "aria-pressed": _ctx.A(_ctx.V.sh.isBuy),
                  style: _normalizeStyle(`height: 44px; padding: 0 6px; border: 0; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; background: ${_ctx.V.sh.buyBg}; color: ${_ctx.V.sh.buyFg}`)
                }, "Ajout", 12 /* STYLE, PROPS */, _hoisted_870),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.sh.toSell,
                  "aria-pressed": _ctx.A(_ctx.V.sh.isSell),
                  style: _normalizeStyle(`height: 44px; padding: 0 6px; border: 0; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; background: ${_ctx.V.sh.sellBg}; color: ${_ctx.V.sh.sellFg}`)
                }, "Vente", 12 /* STYLE, PROPS */, _hoisted_871)
              ]),
              _createElementVNode("button", {
                class: "pkm-dark",
                type: "button",
                onClick: _ctx.V.closeSheet,
                "aria-label": "Fermer",
                style: {"flex":"none","width":"46px","height":"46px","padding":"0","border":"1px solid var(--pkm-line)","border-radius":"23px","background":"var(--pkm-card)","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_873, [...(_cache[197] || (_cache[197] = [
                  _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_872)
            ]),
            _createElementVNode("h2", _hoisted_874, _toDisplayString(_ctx.V.sh.title), 1 /* TEXT */),
            _createElementVNode("fieldset", _hoisted_875, [
              _cache[198] || (_cache[198] = _createElementVNode("legend", { style: {"padding":"0","margin-bottom":"8px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Article", -1 /* CACHED */)),
              _createElementVNode("div", _hoisted_876, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.products || []), (po, po_i) => {
                  return (_openBlock(), _createElementBlock("button", {
                    key: po_i,
                    type: "button",
                    onClick: po.pick,
                    "aria-pressed": _ctx.A(po.sel),
                    "aria-label": _ctx.A(po.label),
                    style: _normalizeStyle(`flex: none; width: calc(${po.wk} * 104px); display: flex; flex-direction: column; gap: 6px; padding: 6px 6px 8px; border-radius: 18px; border: 1px solid ${po.bc}; box-shadow: ${po.ring}; background: ${po.bg}; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                  }, [
                    _createElementVNode("span", {
                      style: _normalizeStyle(`position: relative; display: flex; align-items: center; justify-content: center; height: 78px; border-radius: 12px; overflow: hidden; background: ${po.art}; box-shadow: inset 0 0 0 1px rgba(var(--pkm-hl-rgb), 0.12)`)
                    }, [
                      (po.isCard)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 0,
                            src: po.img,
                            "data-fallback": po.fallback,
                            alt: "",
                            style: {"position":"relative","width":"58px","height":"68px","margin-top":"10px","border-radius":"4px 4px 0 0","object-fit":"cover","object-position":"top"}
                          }, null, 8 /* PROPS */, _hoisted_878))
                        : _createCommentVNode("v-if", true),
                      (po.sealedArt)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 1,
                            src: po.logo,
                            "data-broken": "1",
                            alt: "",
                            style: {"position":"relative","width":"80px","height":"40px","object-fit":"contain"}
                          }, null, 8 /* PROPS */, _hoisted_879))
                        : _createCommentVNode("v-if", true),
                      (po.hasPhoto)
                        ? (_openBlock(), _createElementBlock("img", {
                            key: 2,
                            src: po.photo,
                            "data-broken": "1",
                            alt: "",
                            loading: "lazy",
                            style: {"width":"100%","height":"100%","object-fit":"cover"}
                          }, null, 8 /* PROPS */, _hoisted_880))
                        : _createCommentVNode("v-if", true)
                    ], 4 /* STYLE */),
                    _createElementVNode("span", _hoisted_881, _toDisplayString(po.name), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_882, _toDisplayString(po.right), 1 /* TEXT */)
                  ], 12 /* STYLE, PROPS */, _hoisted_877))
                }), 128 /* KEYED_FRAGMENT */))
              ])
            ]),
            (_ctx.V.sh.showCopy)
              ? (_openBlock(), _createElementBlock("div", _hoisted_883, [
                  _cache[199] || (_cache[199] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Langue", -1 /* CACHED */)),
                  _createElementVNode("div", _hoisted_884, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.copyLangs || []), (cl, cl_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: cl_i,
                        type: "button",
                        onClick: cl.pick,
                        "aria-pressed": _ctx.A(cl.on),
                        style: _normalizeStyle(`flex: 1; height: 44px; border-radius: 999px; border: 1px solid ${cl.bc}; background: ${cl.bg}; color: ${cl.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                      }, _toDisplayString(cl.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_885))
                    }), 128 /* KEYED_FRAGMENT */))
                  ]),
                  _cache[200] || (_cache[200] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "État", -1 /* CACHED */)),
                  _createElementVNode("div", _hoisted_886, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.copyConds || []), (cc, cc_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: cc_i,
                        type: "button",
                        onClick: cc.pick,
                        "aria-pressed": _ctx.A(cc.on),
                        style: _normalizeStyle(`flex: 1; height: 44px; padding: 0 6px; border-radius: 999px; border: 1px solid ${cc.bc}; background: ${cc.bg}; color: ${cc.fg}; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer`)
                      }, _toDisplayString(cc.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_887))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_888, [
              _createElementVNode("label", _hoisted_889, [
                _createTextVNode(_toDisplayString(_ctx.V.sh.priceLabel), 1 /* TEXT */),
                _createElementVNode("input", {
                  id: "pkm-champ-10",
                  class: "pkm-dark",
                  type: "text",
                  inputmode: "decimal",
                  placeholder: "0,00",
                  value: _ctx.V.sh.price,
                  onInput: _ctx.V.sh.onPrice,
                  style: {"height":"52px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid var(--pkm-line-2)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"20px","font-weight":"600"}
                }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_890)
              ]),
              _createElementVNode("div", _hoisted_891, [
                _cache[203] || (_cache[203] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Quantité", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_892, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sh.dec,
                    "aria-label": "Diminuer la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_894, [...(_cache[201] || (_cache[201] = [
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_893),
                  _createElementVNode("span", _hoisted_895, _toDisplayString(_ctx.V.sh.qty), 1 /* TEXT */),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.sh.inc,
                    "aria-label": "Augmenter la quantité",
                    style: {"width":"44px","height":"50px","padding":"0","border":"0","background":"transparent","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_897, [...(_cache[202] || (_cache[202] = [
                      _createElementVNode("path", { d: "M12 5v14" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M5 12h14" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_896)
                ])
              ])
            ]),
            (_ctx.V.sh.hasPriceHint)
              ? (_openBlock(), _createElementBlock("span", _hoisted_898, _toDisplayString(_ctx.V.sh.priceHint), 1 /* TEXT */))
              : _createCommentVNode("v-if", true),
            (_ctx.V.sh.isSell)
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                  _createElementVNode("fieldset", _hoisted_899, [
                    _cache[204] || (_cache[204] = _createElementVNode("legend", { style: {"padding":"0","margin-bottom":"8px","font-size":"13px","font-weight":"600","color":"var(--pkm-t3)"} }, "Vendu sur", -1 /* CACHED */)),
                    _createElementVNode("div", _hoisted_900, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.platforms || []), (pl, pl_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: pl_i,
                          type: "button",
                          onClick: pl.pick,
                          "aria-pressed": _ctx.A(pl.sel),
                          style: _normalizeStyle(`height: 46px; padding: 0 8px; border-radius: 999px; border: 1px solid ${pl.bc}; box-shadow: ${pl.ring}; background: ${pl.bg}; color: ${pl.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                        }, _toDisplayString(pl.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_901))
                      }), 128 /* KEYED_FRAGMENT */))
                    ])
                  ]),
                  _createElementVNode("label", _hoisted_902, [
                    _cache[205] || (_cache[205] = _createTextVNode("Port et emballage à ta charge (€)", -1 /* CACHED */)),
                    _createElementVNode("input", {
                      id: "pkm-champ-11",
                      class: "pkm-dark",
                      type: "text",
                      inputmode: "decimal",
                      value: _ctx.V.sh.port,
                      onInput: _ctx.V.sh.onPort,
                      style: {"height":"48px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid var(--pkm-line-2)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"16px"}
                    }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_903),
                    _createElementVNode("span", _hoisted_904, _toDisplayString(_ctx.V.sh.portHint), 1 /* TEXT */)
                  ]),
                  (_ctx.V.ui.adv)
                    ? (_openBlock(), _createElementBlock("label", _hoisted_905, [
                        _cache[206] || (_cache[206] = _createTextVNode("Commission (€)", -1 /* CACHED */)),
                        _createElementVNode("input", {
                          id: "pkm-champ-12",
                          class: "pkm-dark",
                          type: "text",
                          inputmode: "decimal",
                          value: _ctx.V.sh.commission,
                          onInput: _ctx.V.sh.onCommission,
                          style: {"height":"48px","width":"100%","box-sizing":"border-box","padding":"0 14px","border":"1px solid var(--pkm-line-2)","border-radius":"16px","background":"var(--pkm-field)","color":"var(--pkm-t1)","font-family":"'Sora', sans-serif","font-size":"16px"}
                        }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_906),
                        _createElementVNode("span", _hoisted_907, _toDisplayString(_ctx.V.sh.commissionHint), 1 /* TEXT */)
                      ]))
                    : _createCommentVNode("v-if", true)
                ], 64 /* STABLE_FRAGMENT */))
              : _createCommentVNode("v-if", true),
            (_ctx.V.ui.adv)
              ? (_openBlock(), _createElementBlock("fieldset", _hoisted_908, [
                  _createElementVNode("legend", _hoisted_909, _toDisplayString(_ctx.V.sh.byLabel), 1 /* TEXT */),
                  _createElementVNode("div", _hoisted_910, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.people || []), (pp, pp_i) => {
                      return (_openBlock(), _createElementBlock("button", {
                        key: pp_i,
                        type: "button",
                        onClick: pp.pick,
                        "aria-pressed": _ctx.A(pp.sel),
                        style: _normalizeStyle(`height: 46px; padding: 0 8px; border-radius: 999px; border: 1px solid ${pp.bc}; box-shadow: ${pp.ring}; background: ${pp.bg}; color: ${pp.fg}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer`)
                      }, _toDisplayString(pp.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_911))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("section", {
              class: "pkm-dark",
              "aria-label": _ctx.A(_ctx.V.sh.previewTitle),
              style: {"flex":"none","padding":"14px 16px","border-radius":"20px","border":"1px solid var(--pkm-line-3)","background":"radial-gradient(120% 100% at 100% 0%, rgba(var(--pkm-glow-rgb), 0.2), rgba(var(--pkm-glow-rgb), 0) 60%), var(--pkm-card-hi)","display":"flex","flex-direction":"column","gap":"8px","color":"var(--pkm-t1)"}
            }, [
              _createElementVNode("div", _hoisted_913, [
                _createElementVNode("span", _hoisted_914, _toDisplayString(_ctx.V.sh.previewTitle), 1 /* TEXT */),
                _createElementVNode("span", {
                  style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.03em; color: ${_ctx.V.sh.bigColor}`)
                }, _toDisplayString(_ctx.V.sh.big), 5 /* TEXT, STYLE */)
              ]),
              _createElementVNode("div", _hoisted_915, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.sh.lines || []), (ln, ln_i) => {
                  return (_openBlock(), _createElementBlock("div", {
                    key: ln_i,
                    style: {"display":"flex","justify-content":"space-between","gap":"12px"}
                  }, [
                    _createElementVNode("span", null, _toDisplayString(ln.label), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_916, _toDisplayString(ln.value), 1 /* TEXT */)
                  ]))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              (_ctx.V.sh.hasError)
                ? (_openBlock(), _createElementBlock("div", _hoisted_917, _toDisplayString(_ctx.V.sh.error), 1 /* TEXT */))
                : _createCommentVNode("v-if", true)
            ], 8 /* PROPS */, _hoisted_912),
            _createElementVNode("button", {
              type: "button",
              onClick: _ctx.V.sh.save,
              disabled: _ctx.V.sh.disabled,
              style: _normalizeStyle(`flex: none; height: 54px; border: 0; border-radius: 999px; background: var(--pkm-accent); color: var(--pkm-on-accent); font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; opacity: ${_ctx.V.sh.saveOpacity}`)
            }, _toDisplayString(_ctx.V.sh.saveLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_918)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.onbOpen)
      ? (_openBlock(), _createElementBlock("section", _hoisted_919, [
          _createElementVNode("div", _hoisted_920, [
            _createElementVNode("span", _hoisted_921, [
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
              style: {"height":"44px","padding":"0 6px","border":"0","background":"transparent","color":"var(--pkm-t3)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
            }, "Passer", 8 /* PROPS */, _hoisted_922)
          ]),
          (_ctx.V.ob.is1)
            ? (_openBlock(), _createElementBlock("div", _hoisted_923, [
                _createElementVNode("div", _hoisted_924, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.fan || []), (fc, fc_i) => {
                    return (_openBlock(), _createElementBlock("img", {
                      key: fc_i,
                      src: fc.img,
                      "data-fallback": fc.fallback,
                      alt: "",
                      style: _normalizeStyle(`position: absolute; left: ${fc.left}; top: ${fc.top}; width: 104px; height: 121px; border-radius: 9px 9px 0 0; object-fit: cover; object-position: top; transform: rotate(${fc.rot}); box-shadow: 0 16px 30px rgba(var(--pkm-shadow-rgb), 0.5); -webkit-mask-image: linear-gradient(180deg, #000 80%, transparent); mask-image: linear-gradient(180deg, #000 80%, transparent)`)
                    }, null, 12 /* STYLE, PROPS */, _hoisted_925))
                  }), 128 /* KEYED_FRAGMENT */)),
                  _cache[208] || (_cache[208] = _createElementVNode("span", {
                    class: "pkm-dark",
                    style: {"position":"absolute","left":"50%","bottom":"8px","margin-left":"-88px","width":"176px","display":"flex","align-items":"center","justify-content":"center","gap":"8px","padding":"9px 0","border-radius":"999px","background":"rgba(var(--pkm-ink-rgb), 0.88)","border":"1px solid var(--pkm-line-3)","font-size":"13px","font-weight":"700","color":"var(--pkm-t1)"}
                  }, [
                    _createElementVNode("span", { style: {"width":"8px","height":"8px","border-radius":"4px","background":"var(--pkm-green)"} }),
                    _createTextVNode("Cote Dropicards 99,00 €")
                  ], -1 /* CACHED */))
                ]),
                _cache[215] || (_cache[215] = _createElementVNode("h1", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"28px","line-height":"1.15","font-weight":"700","letter-spacing":"-0.03em","text-align":"center"} }, "La vraie valeur de ta collection Pokémon", -1 /* CACHED */)),
                _cache[216] || (_cache[216] = _createElementVNode("p", { style: {"margin":"0","font-size":"15px","line-height":"1.5","color":"var(--pkm-t2)","text-align":"center"} }, "Scanne tes cartes et ton scellé. Dropicards compare Cardmarket, eBay et TCGplayer et te donne une cote claire, avec sa source et sa date.", -1 /* CACHED */)),
                _createElementVNode("div", _hoisted_926, [
                  _createElementVNode("div", _hoisted_927, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_928, [...(_cache[209] || (_cache[209] = [
                      _createElementVNode("path", { d: "M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.6-2.2h5.4L16.3 7h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" }, null, -1 /* CACHED */),
                      _createElementVNode("circle", {
                        cx: "12",
                        cy: "12.8",
                        r: "3.4"
                      }, null, -1 /* CACHED */)
                    ]))])),
                    _cache[210] || (_cache[210] = _createTextVNode("Scan en 2 secondes, cartes et scellé", -1 /* CACHED */))
                  ]),
                  _createElementVNode("div", _hoisted_929, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_930, [...(_cache[211] || (_cache[211] = [
                      _createElementVNode("path", { d: "M4 19.5h16" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M5 15.5l4.5-4.5 3.5 3 6-6.5" }, null, -1 /* CACHED */),
                      _createElementVNode("path", { d: "M15 7.5h4v4" }, null, -1 /* CACHED */)
                    ]))])),
                    _cache[212] || (_cache[212] = _createTextVNode("Prix comparés entre plusieurs sites", -1 /* CACHED */))
                  ]),
                  _createElementVNode("div", _hoisted_931, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_932, [...(_cache[213] || (_cache[213] = [
                      _createElementVNode("path", { d: "M12 2l8.66 5v10L12 22l-8.66-5V7z" }, null, -1 /* CACHED */)
                    ]))])),
                    _cache[214] || (_cache[214] = _createTextVNode("Des paliers selon la valeur de ta collection", -1 /* CACHED */))
                  ])
                ]),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.ob.next1,
                  style: {"height":"54px","margin-top":"4px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
                }, "Commencer", 8 /* PROPS */, _hoisted_933),
                _cache[217] || (_cache[217] = _createElementVNode("p", { style: {"margin":"0","font-size":"11.5px","line-height":"1.5","color":"var(--pkm-t4)","text-align":"center"} }, "Application indépendante, non affiliée à Nintendo, GAME FREAK ou The Pokémon Company.", -1 /* CACHED */))
              ]))
            : _createCommentVNode("v-if", true),
          (_ctx.V.ob.is2)
            ? (_openBlock(), _createElementBlock("div", _hoisted_934, [
                _cache[220] || (_cache[220] = _createElementVNode("h1", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"26px","line-height":"1.15","font-weight":"700","letter-spacing":"-0.03em"} }, "Faisons connaissance", -1 /* CACHED */)),
                _cache[221] || (_cache[221] = _createElementVNode("p", { style: {"margin":"-6px 0 0","font-size":"14px","line-height":"1.5","color":"var(--pkm-t3)"} }, "2 questions pour anticiper ton profil. Ensuite, il s’adapte tout seul à ta collection.", -1 /* CACHED */)),
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.questions || []), (qq, qq_i) => {
                  return (_openBlock(), _createElementBlock("fieldset", {
                    key: qq_i,
                    style: {"margin":"0","padding":"0","border":"0","min-width":"0"}
                  }, [
                    _createElementVNode("legend", _hoisted_935, _toDisplayString(qq.q), 1 /* TEXT */),
                    _createElementVNode("div", _hoisted_936, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((qq.opts || []), (oo, oo_i) => {
                        return (_openBlock(), _createElementBlock("button", {
                          key: oo_i,
                          type: "button",
                          onClick: oo.pick,
                          "aria-pressed": _ctx.A(oo.on),
                          style: _normalizeStyle(`min-height: 48px; padding: 6px 6px; border-radius: 14px; border: 1px solid ${oo.bc}; box-shadow: ${oo.ring}; background: ${oo.bg}; color: ${oo.fg}; font: inherit; font-size: 12.5px; font-weight: 600; line-height: 1.25; cursor: pointer`)
                        }, _toDisplayString(oo.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_937))
                      }), 128 /* KEYED_FRAGMENT */))
                    ])
                  ]))
                }), 128 /* KEYED_FRAGMENT */)),
                _createElementVNode("section", {
                  "aria-label": "Profil anticipé",
                  "aria-live": "polite",
                  style: _normalizeStyle(`display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; border-radius: 20px; border: 1px solid ${_ctx.V.ob.predEdge}; background: ${_ctx.V.ob.predTint}`)
                }, [
                  _createElementVNode("div", _hoisted_938, [
                    _createElementVNode("span", _hoisted_939, [
                      (_openBlock(), _createElementBlock("svg", {
                        width: "24",
                        height: "24",
                        viewBox: "0 0 24 24",
                        "aria-hidden": "true",
                        style: _normalizeStyle(`fill: none; stroke: ${_ctx.V.ob.predColor}; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round`)
                      }, [
                        _createElementVNode("path", {
                          d: _ctx.V.ob.predIcon
                        }, null, 8 /* PROPS */, _hoisted_940)
                      ], 4 /* STYLE */))
                    ]),
                    _createElementVNode("span", _hoisted_941, [
                      _cache[218] || (_cache[218] = _createElementVNode("span", { style: {"font-size":"12.5px","color":"var(--pkm-t2)"} }, "Profil anticipé", -1 /* CACHED */)),
                      _createElementVNode("span", {
                        style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 19px; font-weight: 700; color: ${_ctx.V.ob.predColor}`)
                      }, _toDisplayString(_ctx.V.ob.predName), 5 /* TEXT, STYLE */)
                    ])
                  ]),
                  _createElementVNode("div", _hoisted_942, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.ob.predSteps || []), (pq, pq_i) => {
                      return (_openBlock(), _createElementBlock("span", {
                        key: pq_i,
                        role: "listitem",
                        style: _normalizeStyle(`height: 32px; border-radius: 999px; border: 1px solid ${pq.bc}; background: ${pq.bg}; color: ${pq.fg}; display: flex; align-items: center; justify-content: center; font-size: 12.5px; font-weight: 700`)
                      }, _toDisplayString(pq.name), 5 /* TEXT, STYLE */))
                    }), 128 /* KEYED_FRAGMENT */))
                  ])
                ], 4 /* STYLE */),
                _createElementVNode("div", _hoisted_943, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.back,
                    "aria-label": "Étape précédente",
                    style: {"width":"54px","height":"54px","padding":"0","border":"1px solid var(--pkm-line-2)","border-radius":"27px","background":"transparent","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
                  }, [
                    (_openBlock(), _createElementBlock("svg", _hoisted_945, [...(_cache[219] || (_cache[219] = [
                      _createElementVNode("path", { d: "M15 5l-7 7 7 7" }, null, -1 /* CACHED */)
                    ]))]))
                  ], 8 /* PROPS */, _hoisted_944),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.next2,
                    style: {"height":"54px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
                  }, "Voir mon profil", 8 /* PROPS */, _hoisted_946)
                ])
              ]))
            : _createCommentVNode("v-if", true),
          (_ctx.V.ob.is3)
            ? (_openBlock(), _createElementBlock("div", _hoisted_947, [
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
                    }, null, 8 /* PROPS */, _hoisted_948)
                  ], 4 /* STYLE */))
                ], 4 /* STYLE */),
                _createElementVNode("div", _hoisted_949, [
                  _cache[222] || (_cache[222] = _createElementVNode("span", { style: {"font-size":"14px","color":"var(--pkm-t3)"} }, "Tu es plutôt", -1 /* CACHED */)),
                  _createElementVNode("h1", {
                    style: _normalizeStyle(`margin: 0; font-family: 'Sora', sans-serif; font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; color: ${_ctx.V.ob.predColor}`)
                  }, _toDisplayString(_ctx.V.ob.predName), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("p", _hoisted_950, _toDisplayString(_ctx.V.ob.predDesc), 1 /* TEXT */),
                _createElementVNode("section", _hoisted_951, [
                  _cache[224] || (_cache[224] = _createElementVNode("span", { style: {"font-size":"13px","font-weight":"700","color":"var(--pkm-t3)"} }, "Ce qu’on a préparé pour toi", -1 /* CACHED */)),
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
                      }, [...(_cache[223] || (_cache[223] = [
                        _createElementVNode("path", { d: "M5 12.5l4.5 4.5L19 7.5" }, null, -1 /* CACHED */)
                      ]))], 4 /* STYLE */)),
                      _createElementVNode("span", null, _toDisplayString(oa.text), 1 /* TEXT */)
                    ]))
                  }), 128 /* KEYED_FRAGMENT */))
                ]),
                _cache[225] || (_cache[225] = _createElementVNode("p", { style: {"margin":"0","font-size":"12.5px","line-height":"1.5","color":"var(--pkm-t3)","text-align":"center"} }, "Ensuite, ton profil s’adapte tout seul : il suit le nombre de tes cartes ultra rares et la valeur de ta collection.", -1 /* CACHED */)),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _ctx.V.ob.toScan,
                  style: {"height":"54px","border":"0","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font":"inherit","font-size":"16px","font-weight":"700","cursor":"pointer"}
                }, "Scanner ma première carte", 8 /* PROPS */, _hoisted_952),
                _createElementVNode("div", _hoisted_953, [
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.back,
                    style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                  }, "Modifier", 8 /* PROPS */, _hoisted_954),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: _ctx.V.ob.toHome,
                    style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"600","cursor":"pointer"}
                  }, "Aller à l’accueil", 8 /* PROPS */, _hoisted_955)
                ])
              ]))
            : _createCommentVNode("v-if", true)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.zoomOpen)
      ? (_openBlock(), _createElementBlock("div", {
          key: 8,
          class: "pkm-dark",
          id: "pkm-zoom",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": _ctx.A(_ctx.V.zoom.label),
          style: {"position":"absolute","inset":"0","z-index":"40","display":"flex","flex-direction":"column","align-items":"center","gap":"14px","padding":"70px 18px 28px","box-sizing":"border-box","background":"rgba(var(--pkm-deep-rgb), 0.95)","color":"var(--pkm-t1)"}
        }, [
          _createElementVNode("button", {
            class: "pkm-dark",
            type: "button",
            onClick: _ctx.V.zoom.close,
            "aria-label": "Fermer",
            style: {"position":"absolute","top":"14px","right":"14px","width":"44px","height":"44px","padding":"0","border":"1px solid var(--pkm-line-2)","border-radius":"22px","background":"var(--pkm-card)","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
          }, [
            (_openBlock(), _createElementBlock("svg", _hoisted_958, [...(_cache[226] || (_cache[226] = [
              _createElementVNode("path", { d: "M6 6l12 12 M18 6L6 18" }, null, -1 /* CACHED */)
            ]))]))
          ], 8 /* PROPS */, _hoisted_957),
          _createElementVNode("div", _hoisted_959, [
            _createElementVNode("img", {
              class: "pkm-dark",
              src: _ctx.V.zoom.img,
              "data-fallback": _ctx.V.zoom.fallback,
              alt: _ctx.V.zoom.name,
              onClick: _ctx.V.zoom.close,
              style: {"display":"block","max-width":"100%","max-height":"100%","width":"auto","height":"auto","border-radius":"4.8% / 3.4%","background":"var(--pkm-img-bg)","box-shadow":"0 24px 60px rgba(var(--pkm-shadow-rgb), 0.65)","cursor":"zoom-out","color":"var(--pkm-t1)"}
            }, null, 8 /* PROPS */, _hoisted_960)
          ]),
          _createElementVNode("span", _hoisted_961, [
            _createElementVNode("span", _hoisted_962, _toDisplayString(_ctx.V.zoom.name), 1 /* TEXT */),
            _createElementVNode("span", _hoisted_963, _toDisplayString(_ctx.V.zoom.sub), 1 /* TEXT */),
            _createElementVNode("span", _hoisted_964, _toDisplayString(_ctx.V.zoom.credit), 1 /* TEXT */)
          ])
        ], 8 /* PROPS */, _hoisted_956))
      : _createCommentVNode("v-if", true),
    (_ctx.V.hb.picking)
      ? (_openBlock(), _createElementBlock("div", _hoisted_965, [
          _createElementVNode("button", {
            type: "button",
            "aria-label": "Fermer le choix du compagnon",
            onClick: _ctx.V.hb.close,
            style: {"flex":"1 1 auto","min-height":"44px","padding":"0","border":"0","background":"transparent","cursor":"pointer"}
          }, null, 8 /* PROPS */, _hoisted_966),
          _createElementVNode("section", _hoisted_967, [
            _cache[230] || (_cache[230] = _createElementVNode("div", {
              "aria-hidden": "true",
              style: {"flex":"none","align-self":"center","width":"40px","height":"5px","border-radius":"3px","background":"var(--pkm-line-2)"}
            }, null, -1 /* CACHED */)),
            _createElementVNode("div", _hoisted_968, [
              _cache[228] || (_cache[228] = _createElementVNode("h2", { style: {"margin":"0","font-family":"'Sora', sans-serif","font-size":"18px","font-weight":"600"} }, "Choisis ton compagnon", -1 /* CACHED */)),
              _createElementVNode("button", {
                class: "pkm-dark",
                type: "button",
                onClick: _ctx.V.hb.close,
                "aria-label": "Fermer",
                style: {"flex":"none","width":"46px","height":"46px","padding":"0","border":"1px solid var(--pkm-line)","border-radius":"23px","background":"var(--pkm-card)","color":"var(--pkm-t1)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_970, [...(_cache[227] || (_cache[227] = [
                  _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_969)
            ]),
            _createElementVNode("div", _hoisted_971, [
              (_openBlock(), _createElementBlock("svg", _hoisted_972, [...(_cache[229] || (_cache[229] = [
                _createElementVNode("circle", {
                  cx: "11",
                  cy: "11",
                  r: "6.5"
                }, null, -1 /* CACHED */),
                _createElementVNode("path", { d: "M16 16l4.5 4.5" }, null, -1 /* CACHED */)
              ]))])),
              _createElementVNode("input", {
                id: "pkm-champ-13",
                type: "search",
                "aria-label": "Chercher un Pokémon",
                placeholder: "Pikachu, 133…",
                value: _ctx.V.hb.q,
                onInput: _ctx.V.hb.onQ,
                style: {"flex":"1","min-width":"0","height":"44px","padding":"0","border":"0","outline-offset":"4px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"15px"}
              }, null, 40 /* PROPS, NEED_HYDRATION */, _hoisted_973)
            ]),
            _createElementVNode("span", _hoisted_974, _toDisplayString(_ctx.V.hb.count), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_975, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.hb.list || []), (hbp, hbp_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: hbp_i,
                  type: "button",
                  onClick: hbp.pick,
                  "aria-pressed": _ctx.A(hbp.on),
                  "aria-label": _ctx.A(hbp.aria),
                  style: _normalizeStyle(`display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; padding: 6px 4px 10px; border-radius: 18px; border: 1px solid ${hbp.bc}; background: ${hbp.bg}; color: ${hbp.fg}; font: inherit; cursor: pointer`)
                }, [
                  _createElementVNode("img", {
                    src: hbp.src,
                    alt: "",
                    loading: "lazy",
                    width: "96",
                    height: "96",
                    style: {"display":"block","width":"96px","max-width":"100%","height":"auto","image-rendering":"pixelated"}
                  }, null, 8 /* PROPS */, _hoisted_977),
                  _createElementVNode("span", _hoisted_978, _toDisplayString(hbp.name), 1 /* TEXT */)
                ], 12 /* STYLE, PROPS */, _hoisted_976))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("p", _hoisted_979, _toDisplayString(_ctx.V.hb.credit), 1 /* TEXT */)
          ])
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.isRadar)
      ? (_openBlock(), _createElementBlock("section", _hoisted_980, [
          _cache[238] || (_cache[238] = _createElementVNode("div", {
            class: "pkm-dark",
            id: "pkm-radar-map",
            "aria-hidden": "true",
            style: {"position":"absolute","inset":"0","background":"radial-gradient(120% 80% at 50% 30%, #0E1A33, #05080F 70%)","color":"var(--pkm-t1)"}
          }, null, -1 /* CACHED */)),
          _createElementVNode("div", _hoisted_981, [
            _createElementVNode("div", _hoisted_982, [
              _createElementVNode("button", {
                class: "pkm-dark",
                type: "button",
                onClick: _ctx.V.rd.close,
                "aria-label": "Fermer le radar",
                style: {"flex":"none","width":"44px","height":"44px","padding":"0","border":"1px solid rgba(var(--pkm-hl-rgb), 0.14)","border-radius":"22px","background":"rgba(var(--pkm-ink-rgb), 0.86)","color":"var(--pkm-white)","display":"flex","align-items":"center","justify-content":"center","cursor":"pointer"}
              }, [
                (_openBlock(), _createElementBlock("svg", _hoisted_984, [...(_cache[231] || (_cache[231] = [
                  _createElementVNode("path", { d: "M6 6l12 12" }, null, -1 /* CACHED */),
                  _createElementVNode("path", { d: "M18 6L6 18" }, null, -1 /* CACHED */)
                ]))]))
              ], 8 /* PROPS */, _hoisted_983),
              _createElementVNode("nav", _hoisted_985, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rd.crumbs || []), (rc, rc_i) => {
                  return (_openBlock(), _createElementBlock(_Fragment, { key: rc_i }, [
                    (rc.sep)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_986, "›"))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("button", {
                      type: "button",
                      onClick: rc.go,
                      "aria-current": _ctx.A(rc.current),
                      style: _normalizeStyle(`flex: none; height: 36px; padding: 0 8px; border: 0; border-radius: 18px; background: transparent; color: ${rc.color}; font: inherit; font-size: 13.5px; font-weight: ${rc.weight}; white-space: nowrap; cursor: pointer`)
                    }, _toDisplayString(rc.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_987)
                  ], 64 /* STABLE_FRAGMENT */))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              (_ctx.V.rd.canMap)
                ? (_openBlock(), _createElementBlock("button", {
                    key: 0,
                    class: "pkm-dark",
                    type: "button",
                    onClick: _ctx.V.rd.toggleList,
                    "aria-pressed": _ctx.A(_ctx.V.rd.listMode),
                    style: {"flex":"none","height":"44px","padding":"0 14px","border":"1px solid rgba(var(--pkm-hl-rgb), 0.14)","border-radius":"22px","background":"rgba(var(--pkm-ink-rgb), 0.86)","color":"var(--pkm-t1)","font":"inherit","font-size":"13.5px","font-weight":"700","cursor":"pointer"}
                  }, _toDisplayString(_ctx.V.rd.listLabel), 9 /* TEXT, PROPS */, _hoisted_988))
                : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("div", _hoisted_989, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rd.prods || []), (rp, rp_i) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: rp_i,
                  type: "button",
                  onClick: rp.pick,
                  "aria-pressed": _ctx.A(rp.on),
                  style: _normalizeStyle(`flex: none; height: 36px; padding: 0 13px; border-radius: 999px; border: 1px solid ${rp.bc}; background: ${rp.bg2}; color: ${rp.fg}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer`)
                }, _toDisplayString(rp.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_990))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            (_ctx.V.rd.showLegend)
              ? (_openBlock(), _createElementBlock("span", _hoisted_991, [...(_cache[232] || (_cache[232] = [
                  _createStaticVNode("<span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:var(--pkm-green);\"></span>Forte</span><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:var(--pkm-orange);\"></span>Moyenne</span><span style=\"display:flex;align-items:center;gap:4px;\"><span style=\"width:8px;height:8px;border-radius:4px;background:var(--pkm-gray);\"></span>Faible</span>", 3)
                ]))]))
              : _createCommentVNode("v-if", true)
          ]),
          _createElementVNode("div", {
            class: "pkm-dark",
            style: _normalizeStyle(`position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; max-height: ${_ctx.V.rd.sheetMax}; display: flex; flex-direction: column; border-radius: 26px 26px 0 0; border-top: 1px solid var(--pkm-line-3); background: rgba(var(--pkm-app-rgb), 0.97); box-shadow: 0 -18px 40px rgba(var(--pkm-shadow-rgb), 0.5); color: var(--pkm-t1)`)
          }, [
            _createElementVNode("div", _hoisted_992, [
              (_ctx.V.rd.hasStore)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                    _createElementVNode("button", {
                      type: "button",
                      onClick: _ctx.V.rd.st.back,
                      style: {"align-self":"flex-start","height":"36px","padding":"0 12px 0 6px","border":"0","border-radius":"18px","background":"transparent","color":"var(--pkm-link)","font":"inherit","font-size":"13.5px","font-weight":"600","display":"flex","align-items":"center","gap":"2px","cursor":"pointer"}
                    }, [
                      (_openBlock(), _createElementBlock("svg", _hoisted_994, [...(_cache[233] || (_cache[233] = [
                        _createElementVNode("path", { d: "M15 5l-7 7 7 7" }, null, -1 /* CACHED */)
                      ]))])),
                      _cache[234] || (_cache[234] = _createTextVNode("Résultats", -1 /* CACHED */))
                    ], 8 /* PROPS */, _hoisted_993),
                    _createElementVNode("section", {
                      "aria-label": _ctx.A(_ctx.V.rd.st.name),
                      style: {"flex":"none","display":"flex","flex-direction":"column","gap":"12px"}
                    }, [
                      _createElementVNode("div", _hoisted_996, [
                        _createElementVNode("span", _hoisted_997, [
                          _createElementVNode("h2", _hoisted_998, _toDisplayString(_ctx.V.rd.st.name), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_999, _toDisplayString(_ctx.V.rd.st.kind), 1 /* TEXT */),
                          _createElementVNode("span", _hoisted_1000, _toDisplayString(_ctx.V.rd.st.place), 1 /* TEXT */)
                        ]),
                        _createElementVNode("span", _hoisted_1001, [
                          _createElementVNode("span", {
                            style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; white-space: nowrap; color: ${_ctx.V.rd.st.color}`)
                          }, _toDisplayString(_ctx.V.rd.st.pct), 5 /* TEXT, STYLE */),
                          _createElementVNode("span", {
                            style: _normalizeStyle(`padding: 2px 9px; border-radius: 999px; background: ${_ctx.V.rd.st.tint}; color: ${_ctx.V.rd.st.color}; font-size: 11.5px; font-weight: 800`)
                          }, _toDisplayString(_ctx.V.rd.st.level), 5 /* TEXT, STYLE */)
                        ])
                      ]),
                      _createElementVNode("p", _hoisted_1002, _toDisplayString(_ctx.V.rd.st.note), 1 /* TEXT */),
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.rd.st.toggleWhy,
                        "aria-expanded": _ctx.A(_ctx.V.rd.st.why),
                        style: {"align-self":"flex-start","height":"40px","padding":"0 14px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"13.5px","font-weight":"700","cursor":"pointer"}
                      }, _toDisplayString(_ctx.V.rd.st.whyLabel), 9 /* TEXT, PROPS */, _hoisted_1003),
                      (_ctx.V.rd.st.why)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_1004, [
                            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rd.st.reasons || []), (rr, rr_i) => {
                              return (_openBlock(), _createElementBlock("span", {
                                key: rr_i,
                                style: {"display":"flex","align-items":"baseline","gap":"10px","font-size":"13px","line-height":"1.4"}
                              }, [
                                _createElementVNode("span", {
                                  style: _normalizeStyle(`flex: none; width: 34px; text-align: right; font-weight: 800; font-variant-numeric: tabular-nums; color: ${rr.color}`)
                                }, _toDisplayString(rr.sign), 5 /* TEXT, STYLE */),
                                _createElementVNode("span", _hoisted_1005, _toDisplayString(rr.text), 1 /* TEXT */)
                              ]))
                            }), 128 /* KEYED_FRAGMENT */)),
                            _createElementVNode("span", _hoisted_1006, _toDisplayString(_ctx.V.rd.st.total), 1 /* TEXT */)
                          ]))
                        : _createCommentVNode("v-if", true),
                      (_ctx.V.rd.st.hasHours)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_1007, [
                            _createElementVNode("span", {
                              style: _normalizeStyle(`font-size: 13.5px; font-weight: 700; color: ${_ctx.V.rd.st.hoursColor}`)
                            }, _toDisplayString(_ctx.V.rd.st.hoursState), 5 /* TEXT, STYLE */),
                            _createElementVNode("span", _hoisted_1008, _toDisplayString(_ctx.V.rd.st.hoursText), 1 /* TEXT */)
                          ]))
                        : _createCommentVNode("v-if", true),
                      (_ctx.V.rd.st.hasAddress)
                        ? (_openBlock(), _createElementBlock("p", _hoisted_1009, _toDisplayString(_ctx.V.rd.st.address), 1 /* TEXT */))
                        : _createCommentVNode("v-if", true),
                      _createElementVNode("div", _hoisted_1010, [
                        _createElementVNode("a", {
                          href: _ctx.V.rd.st.route,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: {"height":"46px","border-radius":"999px","background":"var(--pkm-accent)","color":"var(--pkm-on-accent)","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","text-decoration":"none"}
                        }, "Itinéraire", 8 /* PROPS */, _hoisted_1011),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _ctx.V.rd.st.toggleAlert,
                          "aria-pressed": _ctx.A(_ctx.V.rd.st.alertOn),
                          style: _normalizeStyle(`height: 46px; border: 1px solid var(--pkm-line-2); border-radius: 999px; background: ${_ctx.V.rd.st.alertBg}; color: ${_ctx.V.rd.st.alertFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
                        }, _toDisplayString(_ctx.V.rd.st.alertLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_1012),
                        (_ctx.V.rd.st.hasSite)
                          ? (_openBlock(), _createElementBlock("a", {
                              key: 0,
                              href: _ctx.V.rd.st.site,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              "aria-label": _ctx.A(_ctx.V.rd.st.siteAria),
                              style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","box-sizing":"border-box","color":"var(--pkm-t1)","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","text-decoration":"none"}
                            }, _toDisplayString(_ctx.V.rd.st.siteLabel), 9 /* TEXT, PROPS */, _hoisted_1013))
                          : _createCommentVNode("v-if", true),
                        (_ctx.V.rd.st.hasTel)
                          ? (_openBlock(), _createElementBlock("a", {
                              key: 1,
                              href: _ctx.V.rd.st.tel,
                              "aria-label": _ctx.A(_ctx.V.rd.st.telAria),
                              style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","box-sizing":"border-box","color":"var(--pkm-t1)","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","text-decoration":"none"}
                            }, _toDisplayString(_ctx.V.rd.st.telLabel), 9 /* TEXT, PROPS */, _hoisted_1014))
                          : _createCommentVNode("v-if", true)
                      ]),
                      _createElementVNode("div", _hoisted_1015, [
                        _createElementVNode("a", {
                          href: _ctx.V.rd.st.osm,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: {"font-size":"12.5px","line-height":"2","color":"var(--pkm-link)"}
                        }, "Voir la fiche OpenStreetMap", 8 /* PROPS */, _hoisted_1016),
                        _createElementVNode("a", {
                          href: _ctx.V.rd.st.report,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          style: {"font-size":"12.5px","line-height":"2","color":"var(--pkm-link)"}
                        }, "Signaler une erreur", 8 /* PROPS */, _hoisted_1017)
                      ])
                    ], 8 /* PROPS */, _hoisted_995)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              (_ctx.V.rd.notStore)
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                    _createElementVNode("div", _hoisted_1018, [
                      _createElementVNode("h2", _hoisted_1019, _toDisplayString(_ctx.V.rd.title), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_1020, _toDisplayString(_ctx.V.rd.subtitle), 1 /* TEXT */)
                    ]),
                    (_ctx.V.rd.hasMsg)
                      ? (_openBlock(), _createElementBlock("p", _hoisted_1021, _toDisplayString(_ctx.V.rd.msg), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.rd.error)
                      ? (_openBlock(), _createElementBlock("button", {
                          key: 1,
                          type: "button",
                          onClick: _ctx.V.rd.retry,
                          style: {"height":"46px","border":"1px solid var(--pkm-line-2)","border-radius":"999px","background":"transparent","color":"var(--pkm-t1)","font":"inherit","font-size":"14px","font-weight":"700","cursor":"pointer"}
                        }, "Réessayer", 8 /* PROPS */, _hoisted_1022))
                      : _createCommentVNode("v-if", true),
                    _createElementVNode("div", _hoisted_1023, [
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.rd.scan,
                        disabled: _ctx.V.rd.noScan,
                        style: _normalizeStyle(`height: 48px; border: 0; border-radius: 999px; background: ${_ctx.V.rd.scanBg}; color: ${_ctx.V.rd.scanFg}; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer`)
                      }, _toDisplayString(_ctx.V.rd.scanLabel), 13 /* TEXT, STYLE, PROPS */, _hoisted_1024),
                      _createElementVNode("button", {
                        type: "button",
                        onClick: _ctx.V.rd.around,
                        "aria-pressed": _ctx.A(_ctx.V.rd.aroundOn),
                        style: {"height":"48px","border":"1px solid var(--pkm-line-teal)","border-radius":"999px","background":"rgba(var(--pkm-teal-rgb), 0.1)","color":"var(--pkm-teal)","font":"inherit","font-size":"14px","font-weight":"700","display":"flex","align-items":"center","justify-content":"center","gap":"6px","cursor":"pointer"}
                      }, [
                        (_openBlock(), _createElementBlock("svg", _hoisted_1026, [...(_cache[235] || (_cache[235] = [
                          _createElementVNode("circle", {
                            cx: "12",
                            cy: "12",
                            r: "3"
                          }, null, -1 /* CACHED */),
                          _createElementVNode("path", { d: "M12 2v3 M12 19v3 M2 12h3 M19 12h3" }, null, -1 /* CACHED */),
                          _createElementVNode("circle", {
                            cx: "12",
                            cy: "12",
                            r: "7"
                          }, null, -1 /* CACHED */)
                        ]))])),
                        _cache[236] || (_cache[236] = _createTextVNode("Autour de moi", -1 /* CACHED */))
                      ], 8 /* PROPS */, _hoisted_1025)
                    ]),
                    (_ctx.V.rd.hasRadii)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_1027, [
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rd.radii || []), (rk, rk_i) => {
                            return (_openBlock(), _createElementBlock("button", {
                              key: rk_i,
                              type: "button",
                              onClick: rk.pick,
                              "aria-pressed": _ctx.A(rk.on),
                              style: _normalizeStyle(`flex: 1; height: 40px; border-radius: 999px; border: 1px solid ${rk.bc}; background: ${rk.bg}; color: ${rk.fg}; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer`)
                            }, _toDisplayString(rk.label), 13 /* TEXT, STYLE, PROPS */, _hoisted_1028))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.rd.hasHint)
                      ? (_openBlock(), _createElementBlock("p", _hoisted_1029, _toDisplayString(_ctx.V.rd.hint), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.rd.empty)
                      ? (_openBlock(), _createElementBlock("p", _hoisted_1030, "Aucune boutique repérée ici : élargis le rayon ou choisis un autre secteur."))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.rd.hasResults)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 5 }, [
                          _createElementVNode("span", _hoisted_1031, _toDisplayString(_ctx.V.rd.resultsTitle), 1 /* TEXT */),
                          _createElementVNode("div", _hoisted_1032, [
                            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rd.results || []), (rs, rs_i) => {
                              return (_openBlock(), _createElementBlock("button", {
                                key: rs_i,
                                type: "button",
                                onClick: rs.open,
                                "aria-label": _ctx.A(rs.label),
                                style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 10px 14px; border: 0; border-top: ${rs.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                              }, [
                                _createElementVNode("span", _hoisted_1034, [
                                  _createElementVNode("span", _hoisted_1035, _toDisplayString(rs.name), 1 /* TEXT */),
                                  _createElementVNode("span", _hoisted_1036, _toDisplayString(rs.kind), 1 /* TEXT */),
                                  _createElementVNode("span", _hoisted_1037, _toDisplayString(rs.place), 1 /* TEXT */)
                                ]),
                                _createElementVNode("span", _hoisted_1038, [
                                  _createElementVNode("span", {
                                    style: _normalizeStyle(`font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: ${rs.color}`)
                                  }, _toDisplayString(rs.pct), 5 /* TEXT, STYLE */),
                                  _createElementVNode("span", {
                                    style: _normalizeStyle(`padding: 1px 8px; border-radius: 999px; background: ${rs.tint}; color: ${rs.color}; font-size: 11px; font-weight: 800`)
                                  }, _toDisplayString(rs.level), 5 /* TEXT, STYLE */)
                                ])
                              ], 12 /* STYLE, PROPS */, _hoisted_1033))
                            }), 128 /* KEYED_FRAGMENT */))
                          ])
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true),
                    (_ctx.V.rd.hasSectors)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 6 }, [
                          _createElementVNode("span", _hoisted_1039, _toDisplayString(_ctx.V.rd.sectorsTitle), 1 /* TEXT */),
                          _createElementVNode("div", _hoisted_1040, [
                            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList((_ctx.V.rd.sectors || []), (rg, rg_i) => {
                              return (_openBlock(), _createElementBlock("button", {
                                key: rg_i,
                                type: "button",
                                onClick: rg.open,
                                "aria-label": _ctx.A(rg.label),
                                style: _normalizeStyle(`display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 8px 14px; border: 0; border-top: ${rg.border}; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer`)
                              }, [
                                _createElementVNode("span", _hoisted_1042, _toDisplayString(rg.name), 1 /* TEXT */),
                                _createElementVNode("span", _hoisted_1043, _toDisplayString(rg.count), 1 /* TEXT */),
                                (_openBlock(), _createElementBlock("svg", _hoisted_1044, [...(_cache[237] || (_cache[237] = [
                                  _createElementVNode("path", { d: "M9 6l6 6-6 6" }, null, -1 /* CACHED */)
                                ]))]))
                              ], 12 /* STYLE, PROPS */, _hoisted_1041))
                            }), 128 /* KEYED_FRAGMENT */))
                          ])
                        ], 64 /* STABLE_FRAGMENT */))
                      : _createCommentVNode("v-if", true)
                  ], 64 /* STABLE_FRAGMENT */))
                : _createCommentVNode("v-if", true),
              _createElementVNode("p", _hoisted_1045, _toDisplayString(_ctx.V.rd.attribution) + " · Indice estimé selon le type de boutique, le produit recherché et le calendrier des sorties.", 1 /* TEXT */)
            ])
          ], 4 /* STYLE */)
        ]))
      : _createCommentVNode("v-if", true),
    (_ctx.V.ui.hasToast)
      ? (_openBlock(), _createElementBlock("div", {
          key: 11,
          class: "pkm-dark",
          role: "status",
          style: _normalizeStyle(`position: absolute; z-index: 50; left: 16px; right: 16px; bottom: ${_ctx.V.ui.toastBottom}; display: flex; align-items: center; gap: 10px; padding: 13px 14px; border-radius: 18px; border: 1px solid var(--pkm-line-3); background: var(--pkm-toast); color: var(--pkm-t1); font-size: 14px; font-weight: 600; box-shadow: 0 14px 30px rgba(var(--pkm-shadow-rgb), 0.45)`)
        }, [
          _createElementVNode("span", _hoisted_1046, [
            (_openBlock(), _createElementBlock("svg", _hoisted_1047, [...(_cache[239] || (_cache[239] = [
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
    reglages: { start: 'settings' }, ventes: { start: 'sales' }, bienvenue: { onb: '1' }, novice: { demo: 'novice' },
    extensions: { start: 'sets' }, scelle: { start: 'sealed' }, radar: { start: 'radar' }, sorties: { start: 'releases' } };
  const props = Object.assign({}, HASH[location.hash.slice(1)] || {});
  try {
    const q = new URLSearchParams(location.search);
    ['start', 'demo', 'onb', 'itemId', 'storeId', 'shopId', 'saleId', 'setId', 'tprod', 'tprob', 'adv'].forEach(k => { if (q.get(k)) props[k] = q.get(k); });
  } catch (e) { /* adresse sans paramètres */ }
  const inst = new Component(props);
  // Collection enregistrée sur l'appareil, sauf pour les liens de démonstration.
  DEVICE.enabled = !props.demo;
  if (DEVICE.enabled) inst.restoreSaved();
  // Défilement : chaque liste retrouve sa position au retour (extensions, grille, Marché…) ; les autres
  // écrans s'ouvrent en haut.
  const KEEP = ['home', 'collection', 'market', 'territory', 'sets', 'set', 'sealed', 'releases'];
  const scrollKey = s => s.screen + ':' + (s.screen === 'set' ? s.setId : '');
  const scrolls = {};
  let lastKey = scrollKey(inst.st());
  let zoomOpen = false;
  Vue.createApp({
    setup() {
      const V = Vue.shallowRef(inst.renderVals());
      inst.__rerender = () => {
        const main = document.querySelector('#app main');
        if (main) scrolls[lastKey] = main.scrollTop;
        V.value = inst.renderVals();
        const s = inst.st(), key = scrollKey(s);
        if (key !== lastKey) {
          lastKey = key;
          const top = KEEP.indexOf(s.screen) >= 0 ? scrolls[key] || 0 : 0;
          Vue.nextTick(() => { const m = document.querySelector('#app main'); if (m) m.scrollTop = top; });
        }
        // Zoom de la carte : le focus va sur « Fermer », puis revient sur la carte.
        Vue.nextTick(() => {
          const close = document.querySelector('#pkm-zoom button');
          if (close && !zoomOpen) close.focus();
          if (!close && zoomOpen) { const t = document.querySelector('#app button[aria-label^="Agrandir la carte"]'); if (t) t.focus(); }
          zoomOpen = !!close;
        });
      };
      const A = v => (v === true ? 'true' : v === false ? 'false' : v);
      return { V: V, A: A };
    },
    render: render
  }).mount('#app');
  inst.__changed = () => inst.scheduleSave();
  // Image qui ne charge plus. Photo ou logo du scellé : adresse notée, l'app affiche le visuel suivant.
  // Carte (ex. arrêt de pokemontcg.io) : visuel de secours, une fois par visuel.
  let brokenTimer = null;
  document.addEventListener('error', e => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG' || !t.dataset) return;
    if (t.dataset.broken) {
      const bad = t.getAttribute('src');
      if (bad && !BROKEN.has(bad)) { BROKEN.add(bad); clearTimeout(brokenTimer); brokenTimer = setTimeout(() => inst.__rerender(), 60); }
      return;
    }
    if (!t.dataset.fallback || t.dataset.fellBack === t.dataset.fallback) return;
    t.dataset.fellBack = t.dataset.fallback;
    const src = t.dataset.fallback.indexOf('drawn:') === 0 ? TCG.drawnFor(t.dataset.fallback.slice(6)) : t.dataset.fallback;
    if (!src) return;
    t.removeAttribute('srcset');
    t.src = src;
  }, true);
  // Échap ferme le zoom de la carte.
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && inst.st().zoom) inst.setState({ zoom: null }); });
  // Catalogue complet et catalogue scellé : chargés après le premier affichage.
  fetch('data/cards.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(doc => { TCG.load(doc); inst.setState({ tcg: TCG.rows.length }); })
    .catch(() => { TCG.status = 'error'; inst.setState({ tcg: -1 }); });
  fetch('data/sealed.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(doc => { SEALED.load(doc); inst.setState({ sealedN: SEALED.rows.length }); })
    .catch(() => { SEALED.status = 'error'; inst.setState({ sealedN: -1 }); });
  // Hors ligne et installation (hébergement uniquement ; refusé dans les pages claude.ai).
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
