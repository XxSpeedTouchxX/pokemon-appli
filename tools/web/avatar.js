  // ——— Mon avatar (2026-11-08, demande du porteur avec vidéo) ———
  // La photo personnelle est retirée de Mon profil : chacun compose son avatar, un dresseur dessiné par l'app (dessin
  // original, en SVG) avec son Pokémon préféré à ses côtés. Cinq rubriques, comme dans la vidéo du porteur :
  //   Préféré (Pokémon choisi parmi ceux débloqués dans le Pokédex, place et taille ; un 2ᵉ « coup de cœur » en PRO),
  //   Visage (teint, forme, yeux), Cheveux (coiffure, couleur), Style (tenue), Décor (fond).
  // Bouton « Aléatoire » ; aperçu en grand ; « Enregistrer mon avatar ».
  // Styles PRO (badge couronne) : ouverts avec l'abonnement Premium, ou débloqués pour toujours avec des PA (prix à
  // côté de chaque style). On peut essayer un style PRO dans l'aperçu ; l'enregistrer demande de le débloquer.
  // L'avatar enregistré (avatarCfg) est dessiné dans une image (avatarPng, 256 px) qui remplace l'illustration partout
  // (en-tête, profil, Ma progression) ; il est aussi gardé sur le serveur (014_avatar.sql : avatar_save vérifie les
  // styles débloqués, avatar_buy débite les PA) et affiché dans le classement.
  // Ce module partage la portée des autres : ses noms commencent par AV_ ou av.
  const AV_SKIN = [['s1', '#FFE2D1'], ['s2', '#F9D2B6'], ['s3', '#F1C09A'], ['s4', '#E3A77F'], ['s5', '#D18E62'], ['s6', '#B97548'], ['s7', '#9A5B34'], ['s8', '#7A4426'], ['s9', '#5C321C'], ['s10', '#3F2214']]
    .map(([id, c], i) => ({ id: id, label: 'Teint ' + (i + 1), c: c }))
    .concat([['lavande', 'Lavande', '#C9B6FF'], ['menthe', 'Menthe', '#A8EBC8'], ['ciel', 'Ciel', '#A9D8FF'], ['or', 'Or', '#FFD86B']].map(([id, label, c]) => ({ id: id, label: label, c: c, pa: 150 })));
  const AV_FACE = [{ id: 'rond', label: 'Rond' }, { id: 'ovale', label: 'Ovale' }, { id: 'carre', label: 'Carré' }];
  const AV_EYES = [{ id: 'grands', label: 'Grands yeux' }, { id: 'rieurs', label: 'Rieurs' }, { id: 'vifs', label: 'Déterminés' }, { id: 'etoiles', label: 'Étoilés', pa: 150 }];
  const AV_HAIR = [{ id: 'rase', label: 'Rasé' }, { id: 'court', label: 'Court' }, { id: 'meche', label: 'Mèche' }, { id: 'pics', label: 'En pics' },
    { id: 'milong', label: 'Mi-long' }, { id: 'long', label: 'Long' }, { id: 'boucles', label: 'Boucles' },
    { id: 'chignon', label: 'Chignon', pa: 200 }, { id: 'queue', label: 'Queue de cheval', pa: 200 }, { id: 'couettes', label: 'Couettes', pa: 200 }, { id: 'crete', label: 'Crête', pa: 200 }];
  const AV_HC = [['noir', 'Noir', '#25202E'], ['brun', 'Brun', '#4A2E1E'], ['chatain', 'Châtain', '#7A4A2A'], ['roux', 'Roux', '#C2562A'], ['blond', 'Blond', '#E8C26A'],
    ['platine', 'Platine', '#F2E6C8'], ['gris', 'Gris', '#9AA3B5'], ['blanc', 'Blanc', '#F3F6FC']].map(([id, label, c]) => ({ id: id, label: label, c: c }))
    .concat([['rose', 'Rose', '#FF7AC6'], ['bleu', 'Bleu électrique', '#3D8BFF'], ['vert', 'Vert', '#3BC48A'], ['violet', 'Violet', '#9B6BFF']].map(([id, label, c]) => ({ id: id, label: label, c: c, pa: 100 })));
  const AV_OUTFIT = [{ id: 'tshirt', label: 'T-shirt' }, { id: 'sweat', label: 'Sweat' }, { id: 'veste', label: 'Veste' }, { id: 'colroule', label: 'Col roulé' },
    { id: 'gilet', label: 'Gilet' }, { id: 'chemise', label: 'Chemise' },
    { id: 'aventurier', label: 'Aventurier', pa: 250 }, { id: 'maillot', label: 'Maillot éclair', pa: 250 }, { id: 'cape', label: 'Cape de Maître', pa: 250 }];
  const AV_BG = [{ id: 'type', label: 'Type du Pokémon' }, { id: 'violet', label: 'Violet', c: ['#9B85FF', '#4A22B8'] }, { id: 'nuit', label: 'Nuit', c: ['#2B3F7A', '#0B1120'] },
    { id: 'vert', label: 'Vert', c: ['#6EDDA8', '#1E7F5C'] }, { id: 'ciel', label: 'Ciel', c: ['#BDE6FF', '#3D8BFF'] }, { id: 'corail', label: 'Corail', c: ['#FFB59E', '#E5484D'] },
    { id: 'jaune', label: 'Jaune', c: ['#FFF0A0', '#F2A900'] },
    { id: 'etoiles', label: 'Étoiles', pa: 150 }, { id: 'holo', label: 'Holo', pa: 150 }, { id: 'aurore', label: 'Aurore', pa: 150 }, { id: 'volcan', label: 'Volcan', pa: 150 }];
  const AV_POS = [['right', 'À droite'], ['left', 'À gauche'], ['shoulder', 'Sur l’épaule'], ['above', 'Au-dessus'], ['front', 'Devant'], ['behind', 'Derrière']];
  const AV_SLOT2 = { id: 'slot:2', label: 'Coup de cœur', pa: 300 };
  // Catégorie → liste, clé de l'avatar, préfixe de l'identifiant d'un style PRO (le même que sur le serveur).
  const AV_CATS = { skin: [AV_SKIN, 'skin'], face: [AV_FACE, 'face'], eyes: [AV_EYES, 'eyes'], hair: [AV_HAIR, 'hair'], hc: [AV_HC, 'hc'], outfit: [AV_OUTFIT, 'outfit'], bg: [AV_BG, 'bg'] };
  const AV_DEF = { skin: 's3', face: 'rond', eyes: 'grands', hair: 'court', hc: 'brun', outfit: 'tshirt', bg: 'type', poke: 25, pos: 'right', size: 100, poke2: 0 };
  // Prix en PA de chaque style PRO (copiés dans 014_avatar.sql ; un test vérifie qu'ils sont identiques).
  const AV_PRICES = (() => { const o = {}; Object.keys(AV_CATS).forEach(k => AV_CATS[k][0].forEach(x => { if (x.pa) o[k + ':' + x.id] = x.pa; })); o[AV_SLOT2.id] = AV_SLOT2.pa; return o; })();
  const avFind = (k, id) => AV_CATS[k][0].find(x => x.id === id) || AV_CATS[k][0].find(x => x.id === AV_DEF[k]);

  // Teinte plus sombre ou plus claire d'une couleur (#RRGGBB).
  const avShade = (hex, f) => {
    const v = parseInt(hex.slice(1), 16), c = [v >> 16, (v >> 8) & 255, v & 255].map(x => Math.max(0, Math.min(255, Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f))));
    return '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');
  };
  const AV_INK = '#2A1E2E';
  // ——— Dessin du dresseur (viewBox 200 × 200, sans fond ni Pokémon) ———
  const avHairBack = (id, h) => {
    const d = avShade(h, -0.25);
    switch (id) {
      case 'milong': return '<path d="M44 100C40 54 66 30 100 30s60 24 56 70l4 44c-9 7-21 7-30 0l-2-34H72l-2 34c-9 7-21 7-30 0z" fill="' + h + '" stroke="' + d + '" stroke-width="2"/>';
      case 'long': return '<path d="M42 100C38 52 66 28 100 28s62 24 58 72l8 82c-14 8-30 8-42 0l-4-72H80l-4 72c-12 8-28 8-42 0z" fill="' + h + '" stroke="' + d + '" stroke-width="2"/>';
      case 'queue': return '<path d="M134 52c40 4 52 52 30 104-2-30-8-58-34-82z" fill="' + h + '" stroke="' + d + '" stroke-width="2"/><circle cx="136" cy="58" r="7" fill="#E5484D" stroke="' + AV_INK + '" stroke-width="2"/>';
      case 'couettes': return '<path d="M52 82c-30 6-36 46-18 74 4-24 12-42 26-54z" fill="' + h + '" stroke="' + d + '" stroke-width="2"/><path d="M148 82c30 6 36 46 18 74-4-24-12-42-26-54z" fill="' + h + '" stroke="' + d + '" stroke-width="2"/><circle cx="54" cy="88" r="6" fill="#FFD60A" stroke="' + AV_INK + '" stroke-width="2"/><circle cx="146" cy="88" r="6" fill="#FFD60A" stroke="' + AV_INK + '" stroke-width="2"/>';
      case 'chignon': return '<circle cx="100" cy="30" r="19" fill="' + h + '" stroke="' + d + '" stroke-width="2"/><path d="M86 26c8-6 20-6 28 0" fill="none" stroke="' + d + '" stroke-width="2.5" stroke-linecap="round"/>';
      default: return '';
    }
  };
  const avHairFront = (id, h) => {
    const d = avShade(h, -0.25), st = ' fill="' + h + '" stroke="' + d + '" stroke-width="2" stroke-linejoin="round"';
    switch (id) {
      case 'rase': return '<path d="M53 88C52 54 74 40 100 40s48 14 47 48c-8-16-24-24-47-24s-39 8-47 24z"' + st + '/>';
      case 'court': return '<path d="M50 94C46 56 70 34 100 34s54 22 50 60c-4-12-10-18-18-22-8 8-24 10-36 4-12 8-30 6-38-2-4 6-6 12-8 20z"' + st + '/>';
      case 'meche': return '<path d="M50 98C44 54 72 32 102 32s56 22 48 66c-4-14-8-20-14-24-16 4-40 2-62-6-8 6-16 16-24 30z"' + st + '/><path d="M74 68c22 2 42 16 52 34-14-10-32-16-56-16z"' + st + '/>';
      case 'pics': return '<path d="M48 94l4-34-12-10 22-4-2-18 20 12 12-20 12 18 18-16 2 20 22-6-6 18 18 6-10 10 4 24c-6-14-16-22-26-24l-10 12-10-14-12 14-10-14-10 12-8-10c-8 6-14 14-18 24z"' + st + '/>';
      case 'milong': case 'long': return '<path d="M52 96C48 60 70 40 100 40s52 20 48 56c-6-16-16-26-30-30-4 8-12 12-18 14 2-6 2-10 0-14-16 2-34 12-46 30z"' + st + '/>';
      case 'boucles': return '<ellipse cx="100" cy="62" rx="46" ry="26"' + st + '/>' + [[58, 80, 13], [62, 60, 15], [78, 45, 15], [100, 38, 16], [122, 45, 15], [138, 60, 15], [142, 80, 13]].map(([x, y, r]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + st + '/>').join('');
      case 'chignon': case 'queue': return '<path d="M52 94C48 58 72 40 100 40s52 18 48 54c-8-20-26-30-48-30s-40 10-48 30z"' + st + '/>';
      case 'couettes': return '<path d="M52 94C48 58 72 40 100 40s52 18 48 54c-6-14-14-22-24-26l-24 10-24-10c-10 4-18 12-24 26z"' + st + '/><path d="M100 46v20" stroke="' + d + '" stroke-width="2.5" stroke-linecap="round"/>';
      case 'crete': return '<path d="M55 88C54 58 74 44 100 44s46 14 45 44c-8-14-24-22-45-22s-37 8-45 22z" fill="' + d + '" opacity=".55"/><path d="M84 54c0-24 10-44 16-50 6 6 16 26 16 50z"' + st + '/>';
      default: return '';
    }
  };
  const avHead = (face, sk) => {
    const d = avShade(sk, -0.18), st = ' fill="' + sk + '" stroke="' + d + '" stroke-width="2"';
    const ears = '<circle cx="53" cy="100" r="9"' + st + '/><circle cx="147" cy="100" r="9"' + st + '/>';
    if (face === 'ovale') return ears + '<ellipse cx="100" cy="96" rx="44" ry="52"' + st + '/>';
    if (face === 'carre') return ears + '<rect x="55" y="46" width="90" height="98" rx="32"' + st + '/>';
    return ears + '<circle cx="100" cy="94" r="48"' + st + '/>';
  };
  const avEyes = (id, hc) => {
    const brow = avShade(hc, -0.15), bw = ' fill="none" stroke="' + brow + '" stroke-width="3.2" stroke-linecap="round"';
    const iris = (x, star) => '<ellipse cx="' + x + '" cy="102" rx="8" ry="10.5" fill="' + AV_INK + '"/>' + (star
      ? '<path d="M' + x + ' 95l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#FFD60A"/>'
      : '<circle cx="' + (x - 2.6) + '" cy="98" r="3" fill="#FFFFFF"/><circle cx="' + (x + 2.8) + '" cy="106" r="1.4" fill="#FFFFFF"/>');
    if (id === 'rieurs') return '<path d="M71 104q9-10 18 0M111 104q9-10 18 0" fill="none" stroke="' + AV_INK + '" stroke-width="3.6" stroke-linecap="round"/><path d="M70 86q10-5 18 0M112 86q8-5 18 0"' + bw + '/>';
    if (id === 'vifs') return iris(80) + iris(120) + '<path d="M68 86l20 5M132 86l-20 5"' + bw + '/>';
    return iris(80, id === 'etoiles') + iris(120, id === 'etoiles') + '<path d="M70 86q10-6 19-1M111 85q9-5 19 1"' + bw + '/>';
  };
  const avOutfit = (id, sk) => {
    const torso = c => '<path d="M28 200c0-30 22-48 50-52h44c28 4 50 22 50 52z" fill="' + c + '" stroke="' + AV_INK + '" stroke-width="2.4" stroke-linejoin="round"/>';
    const neck = '<path d="M86 128h28v24c-8 6-20 6-28 0z" fill="' + sk + '" stroke="' + avShade(sk, -0.18) + '" stroke-width="2"/>';
    switch (id) {
      case 'sweat': return '<path d="M60 150c8-16 72-16 80 0-20 12-60 12-80 0z" fill="#B8323A" stroke="' + AV_INK + '" stroke-width="2"/>' + neck + torso('#E5484D') + '<path d="M94 158l-2 20M106 158l2 20" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/><path d="M78 192h44" stroke="#B8323A" stroke-width="3" stroke-linecap="round"/>';
      case 'veste': return neck + torso('#2F3A56') + '<path d="M86 148l14 40 14-40z" fill="#F3F6FC"/><path d="M86 148l-10 12 20 32 4-4zM114 148l10 12-20 32-4-4z" fill="#1E2740" stroke="' + AV_INK + '" stroke-width="2" stroke-linejoin="round"/>';
      case 'colroule': return neck + torso('#F2A900') + '<rect x="82" y="138" width="36" height="18" rx="9" fill="#D98E00" stroke="' + AV_INK + '" stroke-width="2"/><path d="M84 145h32M84 150h32" stroke="#B87400" stroke-width="1.4"/>';
      case 'gilet': return neck + torso('#7A5CFF') + '<path d="M86 148l14 18 14-18" fill="#F3F6FC" stroke="' + AV_INK + '" stroke-width="2"/><path d="M100 166v34" stroke="' + AV_INK + '" stroke-width="2"/><circle cx="100" cy="176" r="2.6" fill="#FFFFFF"/><circle cx="100" cy="190" r="2.6" fill="#FFFFFF"/>';
      case 'chemise': return neck + torso('#F3F6FC') + '<path d="M84 146l10 18 6-12zM116 146l-10 18-6-12z" fill="#DDE3F0" stroke="' + AV_INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M100 156v44" stroke="#C9D3EA" stroke-width="2"/><circle cx="100" cy="170" r="2" fill="#9AA8C3"/><circle cx="100" cy="184" r="2" fill="#9AA8C3"/>';
      case 'aventurier': return neck + torso('#8A5A2B') + '<path d="M80 146c12 10 28 10 40 0l3 9c-14 10-32 10-46 0z" fill="#E5484D" stroke="' + AV_INK + '" stroke-width="2"/><path d="M112 156l9 26-13-5z" fill="#C93A40" stroke="' + AV_INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M60 170h18M122 170h18" stroke="#5E3B1A" stroke-width="3" stroke-linecap="round"/><rect x="66" y="176" width="14" height="10" rx="2" fill="#5E3B1A"/>';
      case 'maillot': return neck + torso('#FFD60A') + '<path d="M84 150q16 10 32 0" fill="none" stroke="' + AV_INK + '" stroke-width="3"/><path d="M106 160l-14 18h9l-6 18 16-22h-9l6-14z" fill="' + AV_INK + '"/><path d="M40 182l18-6M160 182l-18-6" stroke="' + AV_INK + '" stroke-width="3" stroke-linecap="round"/>';
      case 'cape': return '<path d="M22 200c8-38 34-54 62-56h32c28 2 54 18 62 56z" fill="#4A22B8" stroke="' + AV_INK + '" stroke-width="2.4"/>' + neck + '<path d="M60 200c4-24 20-40 40-40s36 16 40 40z" fill="#1B1F3A"/><path d="M72 138l12 12h32l12-12 4 16-28 8-28-8z" fill="#FFD60A" stroke="' + AV_INK + '" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="166" r="5" fill="#FF5BE1" stroke="' + AV_INK + '" stroke-width="2"/>';
      default: return neck + torso('#3D63FF') + '<path d="M84 150q16 12 32 0" fill="none" stroke="#2A48C4" stroke-width="4" stroke-linecap="round"/>';
    }
  };
  const avChar = c => {
    const sk = avFind('skin', c.skin).c, hc = avFind('hc', c.hc).c;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">'
      + avHairBack(c.hair, hc) + avOutfit(c.outfit, sk) + avHead(c.face, sk)
      + '<ellipse cx="72" cy="116" rx="8" ry="4.5" fill="#FF7A9A" opacity=".45"/><ellipse cx="128" cy="116" rx="8" ry="4.5" fill="#FF7A9A" opacity=".45"/>'
      + avEyes(c.eyes, hc)
      + '<path d="M92 120q8 9 16 0" fill="#7A2E3A" stroke="' + AV_INK + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
      + avHairFront(c.hair, hc) + '</svg>';
  };
  // Fond (200 × 200) : dégradé, ou décor PRO.
  const avBg = (c, typeColor) => {
    const b = avFind('bg', c.bg), g = (a, z) => '<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + z + '"/></radialGradient></defs><rect width="200" height="200" fill="url(#g)"/>';
    let inner;
    if (b.id === 'type') { const t = typeColor || '#3BC48A'; inner = g(avShade(t, 0.45), avShade(t, -0.15)); }
    else if (b.id === 'etoiles') inner = g('#2B3F7A', '#070B18') + [[24, 30, 2], [60, 18, 1.4], [150, 26, 2.2], [176, 60, 1.4], [32, 80, 1.4], [170, 120, 2], [20, 150, 1.6], [120, 14, 1.2], [90, 44, 1]].map(([x, y, r]) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#FFFFFF"/>').join('') + '<path d="M150 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFE46B"/>';
    else if (b.id === 'holo') inner = '<defs><linearGradient id="h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8AD8"/><stop offset=".25" stop-color="#8FD3FF"/><stop offset=".5" stop-color="#A8F0C8"/><stop offset=".75" stop-color="#FFE46B"/><stop offset="1" stop-color="#C9A6FF"/></linearGradient></defs><rect width="200" height="200" fill="url(#h)"/><path d="M-20 140L140 -20h40L-20 180z" fill="#FFFFFF" opacity=".35"/>';
    else if (b.id === 'aurore') inner = g('#1E3A5F', '#0B1120') + '<path d="M0 70c40-30 80 10 120-14s60-30 80-20v40c-30-6-50 20-90 26S30 96 0 110z" fill="#3BC48A" opacity=".55"/><path d="M0 40c50-10 90 20 140 0s50-10 60-6v24c-30 0-60 30-110 20S20 70 0 76z" fill="#9B6BFF" opacity=".45"/>';
    else if (b.id === 'volcan') inner = g('#FF9F1C', '#7A1A12') + '<path d="M0 200l40-70 20 18 30-48 26 40 24-26 60 86z" fill="#3A1410"/><path d="M84 104l6-14 8 16-4 24z" fill="#FFD60A"/><circle cx="40" cy="40" r="5" fill="#FFD60A" opacity=".8"/><circle cx="168" cy="54" r="4" fill="#FFB020" opacity=".8"/>';
    else inner = g(b.c[0], b.c[1]);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' + inner + '</svg>';
  };
  const avCache = new Map();
  const avUrl = svg => { let u = avCache.get(svg); if (!u) { u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); if (avCache.size > 400) avCache.clear(); avCache.set(svg, u); } return u; };
  // Place du Pokémon : centre (en % de l'avatar) et taille de base (en %).
  const AV_SPOT = { right: [80, 80, 40], left: [20, 80, 40], shoulder: [76, 63, 30], above: [50, 15, 28], front: [50, 86, 36], behind: [76, 52, 44] };
  const avOther = pos => (pos === 'left' ? 'right' : 'left');
  const avTypeColor = n => { const e = DEX[n]; return e && e.types && DEX_TYPE[e.types[0]] ? DEX_TYPE[e.types[0]] : ''; };
  // Avatar complet en calques (aperçu, classement) : fond, Pokémon derrière, dresseur, Pokémon devant.
  const avLayers = c => {
    const spot = (pos, n, k) => { if (!n || !DEX[n]) return null; const p = AV_SPOT[pos] || AV_SPOT.right, w = p[2] * (Number(c.size) || 100) / 100 * (k || 1);
      return { src: dexSprite(n, true), style: 'left: ' + (p[0] - w / 2).toFixed(1) + '%; top: ' + (p[1] - w / 2).toFixed(1) + '%; width: ' + w.toFixed(1) + '%; height: ' + w.toFixed(1) + '%', name: DEX[n].name }; };
    const p1 = spot(c.pos, c.poke), p2 = c.poke2 ? spot(c.pos === 'right' || c.pos === 'left' ? avOther(c.pos) : 'left', c.poke2, 0.85) : null;
    const behind = c.pos === 'behind';
    return { bg: avUrl(avBg(c, avTypeColor(c.poke))), char: avUrl(avChar(c)), back: behind ? p1 : null, front: behind ? null : p1, extra: p2, hasBack: behind && !!p1, hasFront: !behind && !!p1, hasExtra: !!p2 };
  };
  // Avatar enregistré en image (JPEG 256 px) : même ordre des calques ; sprites dessinés sans lissage (pixel art).
  const avLoad = src => new Promise((ok, ko) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = src; });
  const avCompose = async c => {
    const L = avLayers(c), N = 256, cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const x = cv.getContext('2d'), draw = async (src, r) => { const im = await avLoad(src); x.drawImage(im, r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : N, r ? r[2] : N); };
    const rect = p => { const m = /left: ([\d.-]+)%; top: ([\d.-]+)%; width: ([\d.]+)%/.exec(p.style); return [m[1] / 100 * N, m[2] / 100 * N, m[3] / 100 * N]; };
    const sprite = async p => { if (!p) return; x.imageSmoothingEnabled = false; try { await draw(p.src, rect(p)); } catch (e) { /* sprite indisponible */ } x.imageSmoothingEnabled = true; };
    await draw(L.bg); await sprite(L.back); await draw(L.char); await sprite(L.front); await sprite(L.extra);
    return cv.toDataURL('image/jpeg', 0.9);
  };
  // Configuration complète et valide (valeurs inconnues remplacées par celles par défaut).
  const avNorm = (c, s) => {
    const o = Object.assign({}, AV_DEF, c && typeof c === 'object' ? c : {});
    Object.keys(AV_CATS).forEach(k => { if (!AV_CATS[k][0].some(x => x.id === o[k])) o[k] = AV_DEF[k]; });
    if (!AV_POS.some(([k]) => k === o.pos)) o.pos = 'right';
    o.size = Math.max(60, Math.min(140, Math.round(Number(o.size) || 100)));
    const own = n => !!DEX[n] && (!s || dexOwn(s, n));
    if (!own(o.poke)) o.poke = s && own(s.buddy) ? s.buddy : (s && own(s.evo && s.evo.line && s.evo.line[0]) ? s.evo.line[0] : 25);
    if (!own(o.poke2) || o.poke2 === o.poke) o.poke2 = 0;
    return o;
  };
  // Styles PRO utilisés par une configuration, et ceux qui ne sont pas encore débloqués.
  const avProIds = c => { const ids = Object.keys(AV_CATS).map(k => k + ':' + c[k]).filter(id => AV_PRICES[id]); if (c.poke2) ids.push(AV_SLOT2.id); return ids; };

  const avProto = Component.prototype;
  avProto.avHas = function (id) { const s = this.st(); return !AV_PRICES[id] || (this.premOn && this.premOn()) || (Array.isArray(s.avOwned) && s.avOwned.indexOf(id) >= 0); };
  avProto.avOpen = function () {
    const s = this.st();
    this.setState({ avDraft: avNorm(s.avatarCfg, s), avTab: 'poke', avPick: 0, avLock: '' });
    this.push('avatar');
    this.avSync();
  };
  // Styles débloqués et avatar enregistrés sur le serveur.
  avProto.avSync = function () {
    if (typeof Cloud === 'undefined' || !Cloud.on() || !Cloud.signedIn()) return Promise.resolve(null);
    return Cloud.rpc('avatar_state').then(r => {
      if (!r) return null;
      const s = this.st(), patch = { avOwned: Array.isArray(r.owned) ? r.owned : [] };
      if (r.avatar && JSON.stringify(r.avatar) !== JSON.stringify(s.avatarCfg || null)) {
        patch.avatarCfg = avNorm(r.avatar, null);
        avCompose(patch.avatarCfg).then(png => this.setState({ avatarPng: png }), () => {});
      }
      this.setState(patch);
      return r;
    }, () => null);
  };
  avProto.avSet = function (patch) { this.setState({ avDraft: Object.assign({}, this.st().avDraft || AV_DEF, patch) }); };
  avProto.avRandom = function () {
    const s = this.st(), pick = (k) => { const l = AV_CATS[k][0].filter(x => this.avHas(k + ':' + x.id)); return l[Math.floor(Math.random() * l.length)].id; };
    const owned = DEX_DATA.filter(e => dexOwn(s, e.n)).map(e => e.n), d = s.avDraft || AV_DEF;
    const patch = {}; Object.keys(AV_CATS).forEach(k => { patch[k] = pick(k); });
    patch.poke = owned.length ? owned[Math.floor(Math.random() * owned.length)] : d.poke;
    patch.pos = AV_POS[Math.floor(Math.random() * 3)][0];
    this.avSet(patch); this.flash && this.flash();
  };
  // Achat d'un style PRO avec des PA (serveur quand le compte est connecté).
  avProto.avBuy = function (id) {
    const s = this.st(), price = AV_PRICES[id], pa = Number(s.pa) || 0;
    if (!price || this.avHas(id) || s.avBusy) return;
    if (pa < price) { this.setState({ toast: 'Il te manque ' + (price - pa).toLocaleString('fr-FR') + ' PA' }); return; }
    const done = (left) => {
      const owned = (Array.isArray(this.st().avOwned) ? this.st().avOwned : []).concat([id]);
      this.setState({ avOwned: owned, pa: left, avLock: '', avBusy: false, toast: 'Style débloqué pour toujours' });
      this.flash && this.flash();
    };
    if (typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn()) {
      this.setState({ avBusy: true });
      Cloud.rpc('avatar_buy', { item: id, req: Cloud.reqId() }).then(r => done(typeof gcPa === 'function' ? gcPa(this.st(), r.pa | 0) : (r.pa | 0)),
        e => { this.setState({ avBusy: false }); if (this.gcFail) this.gcFail(e); else this.setState({ toast: 'Achat impossible pour le moment' }); });
      return;
    }
    done(pa - price);
  };
  avProto.avSave = function () {
    const s = this.st(), c = avNorm(s.avDraft, s), lock = avProIds(c).find(id => !this.avHas(id));
    if (lock) { this.setState({ avLock: lock, avLockWhy: 'save' }); return; }
    this.setState({ avBusy: true });
    avCompose(c).then(png => {
      this.setState({ avatarCfg: c, avatarPng: png, avatarImg: '', avBusy: false, toast: 'Avatar enregistré' });
      this.flash && this.flash();
      if (typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn()) Cloud.rpc('avatar_save', { cfg: c }).catch(e => { if (this.gcFail) this.gcFail(e); });
      this.pop();
    }, () => this.setState({ avBusy: false, toast: 'L’avatar n’a pas pu être dessiné' }));
  };
  // L'avatar enregistré remplace l'illustration (et l'ancienne photo, retirée le 2026-11-08) partout.
  const avBaseImg = avProto.img;
  avProto.img = function () {
    const o = avBaseImg.call(this), p = this.state && this.state.avatarPng;
    return typeof p === 'string' && p.startsWith('data:image/') ? Object.assign({}, o, { avatar: p }) : Object.assign({}, o, { avatar: o.avatar });
  };

  // ——— Écran « Mon avatar » ———
  const AV_TABS = [['poke', 'Préféré', 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'], ['face', 'Visage', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 10h.01M15 10h.01M9 15c1.5 1.3 4.5 1.3 6 0'],
    ['hair', 'Cheveux', 'M6 9a6 6 0 0 1 12 0v3M6 9c2 2 6 2 8-2 1 3 3 4 4 5M6 9v6'], ['style', 'Style', 'M8 4l4 3 4-3 4 4-3 3v9H7v-9L4 8z'], ['bg', 'Décor', 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4']];
  avProto.vAvatar = function (s) {
    const d = avNorm(s.avDraft, s), tab = s.avTab || 'poke', prem = !!(this.premOn && this.premOn());
    const mini = patch => { const c = Object.assign({}, d, patch); return { bg: avUrl(avBg(c, avTypeColor(c.poke))), char: avUrl(avChar(c)) }; };
    const opt = (k, x, swatch) => {
      const id = k + ':' + x.id, pro = !!x.pa, has = this.avHas(id), on = d[k] === x.id, m = swatch ? null : mini({ [k]: x.id });
      return { label: x.label, on: on, pro: pro, lock: pro && !has, open: pro && has, price: pro && !has ? x.pa + ' PA' : '', swatch: swatch ? 'background: ' + x.c : '', isSwatch: !!swatch, notSwatch: !swatch,
        bg: m ? m.bg : '', char: m ? m.char : '', cls: 'pkm-av-opt' + (on ? ' pkm-av-on' : '') + (swatch ? ' pkm-av-sw' : ''),
        aria: x.label + (pro ? (has ? ' (PRO débloqué)' : ' (PRO, ' + x.pa + ' PA ou Premium)') : '') + (on ? ', choisi' : ''), pick: () => this.avSet({ [k]: x.id }) };
    };
    const L = avLayers(d), pend = avProIds(d).filter(id => !this.avHas(id));
    const pk = n => n && DEX[n] ? { n: n, name: DEX[n].name, icon: 'img/pokemon/icon/' + n + '.png' } : null;
    const owned = DEX_DATA.filter(e => dexOwn(s, e.n));
    const q = String(s.avQ || '').trim().toLowerCase();
    const lockId = s.avLock || '', lockCat = lockId.split(':')[0], lockItem = lockId === AV_SLOT2.id ? AV_SLOT2 : (AV_CATS[lockCat] ? AV_CATS[lockCat][0].find(x => x.id === lockId.split(':')[1]) : null);
    const pa = Number(s.pa) || 0, price = AV_PRICES[lockId] || 0;
    return {
      tabs: AV_TABS.map(([k, label, path]) => ({ label: label, path: path, on: tab === k, cls: 'pkm-av-tab' + (tab === k ? ' pkm-av-tab-on' : ''), pick: () => this.setState({ avTab: k }) })),
      isPoke: tab === 'poke', isFace: tab === 'face', isHair: tab === 'hair', isStyle: tab === 'style', isBg: tab === 'bg',
      prev: L, random: () => this.avRandom(), save: () => this.avSave(), busy: !!s.avBusy, saveLabel: s.avBusy ? 'Enregistrement…' : 'Enregistrer mon avatar',
      trial: pend.length > 0, trialText: 'Essai : ' + pend.length + ' style' + (pend.length > 1 ? 's' : '') + ' PRO à débloquer pour enregistrer',
      prem: prem, premTag: prem ? 'Premium : tous les styles PRO sont ouverts' : 'Styles PRO : ouverts avec Premium, ou à débloquer avec tes PA',
      skin: AV_SKIN.map(x => opt('skin', x, true)), face: AV_FACE.map(x => opt('face', x)), eyes: AV_EYES.map(x => opt('eyes', x)),
      hair: AV_HAIR.map(x => opt('hair', x)), hc: AV_HC.map(x => opt('hc', x, true)), outfit: AV_OUTFIT.map(x => opt('outfit', x)), bg: AV_BG.map(x => opt('bg', x)),
      poke: pk(d.poke) || { name: '', icon: '' }, poke2: pk(d.poke2) || { name: '', icon: '' }, hasPoke2: !!d.poke2, noPoke2: !d.poke2,
      pokeAria: 'Changer de Pokémon préféré' + (DEX[d.poke] ? ' : ' + DEX[d.poke].name : ''), poke2Aria: 'Changer de coup de cœur' + (DEX[d.poke2] ? ' : ' + DEX[d.poke2].name : ''), slot2Has: this.avHas(AV_SLOT2.id), slot2Price: AV_SLOT2.pa + ' PA',
      slot2Lock: !this.avHas(AV_SLOT2.id), slot2Open: () => this.avHas(AV_SLOT2.id) ? this.setState({ avPick: 2, avQ: '' }) : this.setState({ avLock: AV_SLOT2.id, avLockWhy: 'try' }),
      changePoke: () => this.setState({ avPick: 1, avQ: '' }), removePoke2: () => this.avSet({ poke2: 0 }),
      pos: AV_POS.map(([k, label]) => Object.assign({ label: label, on: d.pos === k, pick: () => this.avSet({ pos: k }) }, this.chip(d.pos === k))),
      size: d.size, sizeLabel: d.size + ' %', onSize: e => this.avSet({ size: Number(e.target.value) || 100 }),
      picker: {
        open: !!s.avPick, title: s.avPick === 2 ? 'Un autre coup de cœur ?' : 'Ton Pokémon préféré', sub: s.avPick === 2 ? 'Un Pokémon de plus à tes côtés.' : 'Parmi les Pokémon débloqués dans ton Pokédex.',
        close: () => this.setState({ avPick: 0 }), q: s.avQ || '', onQ: e => this.setState({ avQ: e.target.value }),
        items: owned.filter(e => !q || e.name.toLowerCase().indexOf(q) >= 0 || String(e.n) === q).map(e => ({ n: e.n, name: e.name, no: dexNo(e), icon: 'img/pokemon/icon/' + e.n + '.png',
          on: (s.avPick === 2 ? d.poke2 : d.poke) === e.n, cls: 'pkm-av-pk' + ((s.avPick === 2 ? d.poke2 : d.poke) === e.n ? ' pkm-av-on' : ''),
          pick: () => { this.avSet(s.avPick === 2 ? { poke2: e.n } : { poke: e.n }); this.setState({ avPick: 0 }); } })),
        count: owned.length + ' Pokémon débloqué' + (owned.length > 1 ? 's' : '') + ' · débloque les autres dans le Pokédex avec tes PA'
      },
      lock: {
        open: !!lockItem, name: lockItem ? lockItem.label : '', aria: 'Style PRO : ' + (lockItem ? lockItem.label : ''), price: price.toLocaleString('fr-FR') + ' PA', pa: pa.toLocaleString('fr-FR') + ' PA',
        why: s.avLockWhy === 'save' ? 'Ton avatar utilise ce style PRO : débloque-le pour enregistrer.' : 'Style PRO : ouvert avec l’abonnement Premium, ou débloqué pour toujours avec tes PA.',
        enough: pa >= price, short: pa >= price ? '' : 'Il te manque ' + (price - pa).toLocaleString('fr-FR') + ' PA', notEnough: pa < price,
        buy: () => this.avBuy(lockId), buyLabel: s.avBusy ? 'Déblocage…' : 'Débloquer pour ' + price.toLocaleString('fr-FR') + ' PA',
        prem: () => { this.setState({ avLock: '' }); if (this.premOpen) this.premOpen(); else this.setState({ premOpen: true }); },
        close: () => this.setState({ avLock: '' }),
        preview: lockItem && lockCat !== 'slot' ? (() => { const m = mini({ [lockCat]: lockItem.id }); return m; })() : L
      }
    };
  };
  // Bouton « Mon avatar » de Mon profil (à la place du choix d'une photo).
  const avBaseProfile = avProto.vProfile;
  avProto.vProfile = function (x) {
    const r = avBaseProfile.call(this, x);
    r.photo = Object.assign({}, r.photo || {}, { label: 'Modifier mon avatar', pick: () => this.avOpen(), has: false, remove: () => {} });
    return r;
  };
  const avBaseRender = avProto.renderVals;
  avProto.renderVals = function () {
    const s = this.st(), r = avBaseRender.call(this), ui = r.ui;
    ui.isAvatar = s.screen === 'avatar';
    r.av = ui.isAvatar ? this.vAvatar(s) : { tabs: [], skin: [], face: [], eyes: [], hair: [], hc: [], outfit: [], bg: [], pos: [], prev: {}, picker: { items: [] }, lock: { preview: {} } };
    if (ui.isAvatar) Object.assign(ui, { title: 'Mon avatar', subtitle: '', hasSubtitle: false, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
    return r;
  };
  const avBaseParent = avProto.parentOf;
  avProto.parentOf = function (sc) { return sc === 'avatar' ? 'profile' : avBaseParent.call(this, sc); };
  const avBaseSt = avProto.st;
  avProto.st = function () {
    const d = avBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'avatar') { d.screen = 'avatar'; d.stack = ['profile']; d.avDraft = avNorm(d.avatarCfg, d); }
    return d;
  };
  // Connexion : l'avatar et les styles achetés sont relus du serveur une fois par session (après l'état du jeu).
  const avBaseSync = avProto.gcSync;
  let avSynced = false;
  if (avBaseSync) avProto.gcSync = function () {
    const p = avBaseSync.call(this);
    if (!avSynced && typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn()) { avSynced = true; Promise.resolve(p).then(() => this.avSync()); }
    return p;
  };
  // Mini-avatar d'un autre joueur (classement) : calques de sa configuration.
  const avMini = cfg => { if (!cfg || typeof cfg !== 'object') return null; const L = avLayers(avNorm(cfg, null)); return { bg: L.bg, char: L.char, poke: L.front || L.back, pokeStyle: (L.front || L.back || {}).style || '', hasPoke: !!(L.front || L.back) }; };
