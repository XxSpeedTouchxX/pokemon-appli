  // ——— Mon avatar (2026-11-08, demande du porteur avec vidéo) ———
  // La photo personnelle est retirée de Mon profil : chacun compose son avatar, un dresseur dessiné par l'app (dessin
  // original, en SVG) avec son Pokémon préféré à ses côtés. Cinq rubriques, comme dans la vidéo du porteur :
  //   Préféré (Pokémon, place et taille),
  //   Visage (teint, forme, yeux), Cheveux (coiffure, couleur), Style (tenue), Décor (fond).
  // Aperçu en grand ; « Enregistrer mon avatar ». Bouton « Aléatoire » retiré le 2026-11-10 (porteur).
  // Refonte du 2026-11-10 (porteur : « c'est trop copié-collé, 2 lignes : ton avatar (Cheveux, Visage, Style, Décor) et
  // ton Pokémon, avec des accessoires, la version shiny, et le Pokémon déplaçable n'importe où sur l'avatar ») :
  //   - ligne « Ton avatar » : Cheveux, Visage, Style, Décor ; ligne « Ton Pokémon » : Pokémon, Accessoire, Shiny ;
  //   - le Pokémon se fait glisser du doigt n'importe où dans l'aperçu (px, py : centre en % de l'avatar), devant ou
  //     derrière le dresseur ; l'accessoire aussi (ax, ay : décalage, asz : taille) ;
  //   - accessoires dessinés pour Dropicards (lunettes de soleil, casquette de dresseur, couronne, nœud, chapeau de fête,
  //     écharpe) ; version shiny (sprites web/img/pokemon/shiny/, tools/sprites/fetch_shiny.py) ;
  //   - 3 interfaces proposées (?avui=1 « Studio », 2 « Carte de dresseur », 3 « Plein écran ») ; choix du porteur le
  //     2026-11-10 au soir : 2 « Carte de dresseur ».
  //   Prix PRO proposés, à confirmer : shiny 300 PA ; couronne 150 PA ; nœud, chapeau de fête, écharpe 100 PA ;
  //   lunettes et casquette gratuites (serveur : 021_avatar_v2.sql).
  // v3 (2026-11-10 au soir, porteur) : « Enregistrer mon avatar » figé en bas ; avatar de départ cheveux noirs en pics
  //   sur fond jaune, sans Pokémon, déjà dans la bulle du profil et l'en-tête ; Pokémon d'avatar à part du Pokédex,
  //   débloqués avec des PA (25, 50, 100 selon la forme ; légendaires 300 ; Kyogre, Groudon, Rayquaza 500 ; méga 200,
  //   à confirmer), version shiny proposée pour le Pokémon choisi, au double du prix ; « coup de cœur » retiré ;
  //   accessoire sur le Pokémon ou sur moi, pincé à deux doigts sans limite de taille ; 13 cadres animés (Décor).
  //   Serveur : 022_avatar_v3.sql.
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
  // Accessoires du Pokémon (2026-11-10) : dessins originaux. w : largeur (part de la largeur du Pokémon), cx, cy : centre
  // (part de sa boîte, depuis son coin haut gauche ; cy < 0 = au-dessus de la tête), vb : largeur et hauteur du dessin.
  const AV_ACC = [
    { id: 'aucun', label: 'Aucun' },
    { id: 'lunettes', label: 'Lunettes de soleil', pcx: 50, pcy: 52, pw: 40, w: 0.62, cx: 0.5, cy: 0.28, vb: [100, 34],
      svg: '<path d="M4 6h92v6l-4 1c-2 14-10 19-22 19-11 0-17-6-19-15h-2c-2 9-8 15-19 15-12 0-20-5-22-19l-4-1z" fill="#14121C" stroke="#000" stroke-width="2" stroke-linejoin="round"/><path d="M14 13c2 6 6 9 11 10M60 13c2 6 6 9 11 10" stroke="#8FD3FF" stroke-width="3" stroke-linecap="round" opacity=".8"/>' },
    { id: 'casquette', label: 'Casquette de dresseur', pcx: 50, pcy: 26, pw: 58, w: 0.8, cx: 0.5, cy: 0.03, vb: [100, 62],
      svg: '<path d="M14 44C14 18 30 4 52 4s36 14 36 40z" fill="#E5484D" stroke="#2A1E2E" stroke-width="3" stroke-linejoin="round"/><path d="M38 44c0-20 6-34 14-38 8 4 14 18 14 38z" fill="#FFFFFF" stroke="#2A1E2E" stroke-width="2.5" stroke-linejoin="round"/><path d="M54 14l-8 13h6l-4 11 10-15h-6l4-9z" fill="#FFD60A" stroke="#2A1E2E" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 44h80c8 0 12 4 12 8s-4 6-10 6H18C8 58 4 50 6 44z" fill="#C93A40" stroke="#2A1E2E" stroke-width="3" stroke-linejoin="round"/>' },
    { id: 'couronne', label: 'Couronne', pa: 150, pcx: 50, pcy: 16, pw: 36, w: 0.5, cx: 0.5, cy: -0.06, vb: [100, 64],
      svg: '<path d="M8 22l20 16L50 6l22 32 20-16-6 38H14z" fill="#FFD60A" stroke="#7A4A00" stroke-width="3.5" stroke-linejoin="round"/><rect x="14" y="52" width="72" height="9" rx="3" fill="#FFB000" stroke="#7A4A00" stroke-width="3"/><circle cx="50" cy="40" r="6" fill="#E5484D" stroke="#7A4A00" stroke-width="2.5"/><circle cx="8" cy="20" r="5" fill="#FFF3A6" stroke="#7A4A00" stroke-width="2.5"/><circle cx="50" cy="6" r="5" fill="#FFF3A6" stroke="#7A4A00" stroke-width="2.5"/><circle cx="92" cy="20" r="5" fill="#FFF3A6" stroke="#7A4A00" stroke-width="2.5"/>' },
    { id: 'noeud', label: 'Nœud', pa: 100, pcx: 68, pcy: 26, pw: 22, w: 0.38, cx: 0.78, cy: 0.06, vb: [100, 60],
      svg: '<path d="M50 30C38 10 8 2 6 18c-2 14 26 22 44 12zM50 30c12-20 42-28 44-12 2 14-26 22-44 12z" fill="#FF7AC6" stroke="#8A1E5A" stroke-width="3.5" stroke-linejoin="round"/><path d="M44 34l-12 22 12-4 6 6zM56 34l12 22-12-4-6 6z" fill="#FF5BB0" stroke="#8A1E5A" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="30" r="8" fill="#FFB3DF" stroke="#8A1E5A" stroke-width="3"/>' },
    { id: 'fete', label: 'Chapeau de fête', pa: 100, pcx: 57, pcy: 10, pw: 22, w: 0.3, cx: 0.55, cy: -0.16, vb: [60, 84],
      svg: '<path d="M30 10L6 78h48z" fill="#5EC8F0" stroke="#163A66" stroke-width="3.5" stroke-linejoin="round"/><path d="M22 34l18 6M15 54l30 8" stroke="#FFD60A" stroke-width="6" stroke-linecap="round"/><circle cx="30" cy="9" r="8" fill="#FF7AC6" stroke="#163A66" stroke-width="3"/><path d="M6 78h48" stroke="#163A66" stroke-width="4" stroke-linecap="round"/>' },
    { id: 'echarpe', label: 'Écharpe', pa: 100, pcx: 50, pcy: 76, pw: 46, w: 0.66, cx: 0.5, cy: 0.62, vb: [100, 52],
      svg: '<path d="M6 12c28 10 60 10 88 0l2 14c-30 12-62 12-92 0z" fill="#E5484D" stroke="#6E1408" stroke-width="3" stroke-linejoin="round"/><path d="M64 22l4 26 14-4-4-24z" fill="#C93A40" stroke="#6E1408" stroke-width="3" stroke-linejoin="round"/><path d="M20 18v8M36 21v8M52 22v8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".7"/>' }
  ];
  // Cadres autour de l'avatar (2026-11-10, porteur : « des bords animés arc-en-ciel, vert tempête comme Rayquaza, bleu
  // vague comme Kyogre, rouge lave comme Groudon… propose-moi plein de cadres sympa ») : dessinés en CSS (avatar.css,
  // classes pkm-fr-*), animés, autour de l'aperçu, de la bulle du profil et de l'en-tête. Prix proposés, à confirmer.
  const AV_FRAMES = [{ id: 'aucun', label: 'Sans cadre' }, { id: 'dore', label: 'Doré' },
    { id: 'arcenciel', label: 'Arc-en-ciel', pa: 150 }, { id: 'tempete', label: 'Tempête émeraude', pa: 250 }, { id: 'vague', label: 'Vague océane', pa: 250 },
    { id: 'lave', label: 'Lave volcanique', pa: 250 }, { id: 'galaxie', label: 'Galaxie', pa: 150 }, { id: 'eclair', label: 'Éclair', pa: 150 },
    { id: 'glace', label: 'Glace', pa: 150 }, { id: 'neon', label: 'Néon', pa: 150 }, { id: 'brume', label: 'Brume spectrale', pa: 150 },
    { id: 'sakura', label: 'Fleurs de cerisier', pa: 150 }, { id: 'holo', label: 'Holographique', pa: 200 }];
  // Pokémon de l'avatar (2026-11-10, porteur) : à part du Pokédex, débloqués ici avec des PA. 1re forme 25 PA, 2e 50 PA,
  // 3e 100 PA ; légendaires 300 PA ; Kyogre, Groudon, Rayquaza 500 PA ; méga-évolutions 200 PA (proposé, à confirmer).
  // Version shiny : le double du prix du Pokémon, une fois le Pokémon débloqué. Premium n'ouvre pas les Pokémon (défaut à
  // confirmer). Serveur : 022_avatar_v3.sql (mêmes règles, calculées depuis game_pokemon).
  const AV_LEG = [144, 145, 146, 150, 151, 380, 381];
  const avPokePrice = n => { const e = DEX[n]; if (!e) return 0; if (n === 382 || n === 383 || n === 384) return 500; if (AV_LEG.indexOf(n) >= 0) return 300; if (e.mega) return 200;
    let k = 1, x = e; while (x && x.from && DEX[x.from] && k < 4) { k++; x = DEX[x.from]; } return k >= 3 ? 100 : k === 2 ? 50 : 25; };
  const AV_POS = [['right', 'À droite'], ['left', 'À gauche'], ['shoulder', 'Sur l’épaule'], ['above', 'Au-dessus'], ['front', 'Devant'], ['behind', 'Derrière']];
  // Catégorie → liste, clé de l'avatar, préfixe de l'identifiant d'un style PRO (le même que sur le serveur).
  const AV_CATS = { skin: [AV_SKIN, 'skin'], face: [AV_FACE, 'face'], eyes: [AV_EYES, 'eyes'], hair: [AV_HAIR, 'hair'], hc: [AV_HC, 'hc'], outfit: [AV_OUTFIT, 'outfit'], bg: [AV_BG, 'bg'], acc: [AV_ACC, 'acc'], frame: [AV_FRAMES, 'frame'] };
  // Avatar de départ (2026-11-10, porteur) : cheveux noirs en pics, fond jaune, sans Pokémon (à débloquer).
  const AV_DEF = { skin: 's3', face: 'rond', eyes: 'grands', hair: 'pics', hc: 'noir', outfit: 'tshirt', bg: 'jaune', poke: 0, pos: 'right', size: 100,
    acc: 'aucun', aon: 'poke', shiny: false, px: null, py: null, ax: 0, ay: 0, asz: 100, frame: 'aucun' };
  // Prix en PA de chaque style PRO (copiés dans 014_avatar.sql ; un test vérifie qu'ils sont identiques).
  const AV_PRICES = (() => { const o = {}; Object.keys(AV_CATS).forEach(k => AV_CATS[k][0].forEach(x => { if (x.pa) o[k + ':' + x.id] = x.pa; })); return o; })();
  // Prix d'un élément : style PRO, Pokémon d'avatar (« poke:n ») ou sa version shiny (« shiny:n », le double).
  const avPrice = id => { const m = /^(poke|shiny):(\d+)$/.exec(id || ''); if (m) return avPokePrice(Number(m[2])) * (m[1] === 'shiny' ? 2 : 1); return AV_PRICES[id] || 0; };
  const avLabel = id => { const m = /^(poke|shiny):(\d+)$/.exec(id || ''); if (m) return (m[1] === 'shiny' ? 'Shiny · ' : '') + (DEX[Number(m[2])] ? DEX[Number(m[2])].name : 'Pokémon');
    const k = String(id).split(':')[0], x = AV_CATS[k] ? AV_CATS[k][0].find(y => y.id === String(id).split(':')[1]) : null; return x ? x.label : ''; };
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
  // Avatar complet en calques (aperçu, classement) : fond, Pokémon derrière, dresseur, Pokémon devant, son accessoire.
  // Le Pokémon est placé par son centre (px, py, en % de l'avatar) quand il a été glissé, sinon à sa place prédéfinie.
  const avSprite = (n, shiny) => (shiny ? 'img/pokemon/shiny/' + n + '.png' : dexSprite(n, true));
  const avBox = (l, t, w, h) => ({ l: l, t: t, w: w, h: h, style: 'left: ' + l.toFixed(1) + '%; top: ' + t.toFixed(1) + '%; width: ' + w.toFixed(1) + '%; height: ' + h.toFixed(1) + '%' });
  const avAccSvg = a => avUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + a.vb[0] + ' ' + a.vb[1] + '">' + a.svg + '</svg>');
  const avLayers = c => {
    const free = c.px != null && c.py != null, n = c.poke;
    let p1 = null;
    if (n && DEX[n]) { const p = AV_SPOT[c.pos] || AV_SPOT.right, w = (free ? 40 : p[2]) * (Number(c.size) || 100) / 100, cx = free ? c.px : p[0], cy = free ? c.py : p[1];
      p1 = Object.assign(avBox(cx - w / 2, cy - w / 2, w, w), { src: avSprite(n, c.shiny), name: DEX[n].name, n: n }); }
    const behind = c.pos === 'behind';
    // Accessoire (2026-11-10, v3) : sur le Pokémon (d'après la boîte de son sprite) ou sur le dresseur ; décalage (ax, ay,
    // en % de l'avatar) et taille (asz, en %, sans limite : pincée à deux doigts).
    let acc = null;
    const a = AV_ACC.find(x => x.id === c.acc), onPoke = c.aon !== 'perso' && p1 && DEX[n] && DEX[n].box;
    if (a && a.svg) {
      const z = (Number(c.asz) || 100) / 100;
      let w, cx, cy;
      if (onPoke) { const [x0, y0, x1, y1] = DEX[n].box, u = p1.w / 96, bw = (x1 - x0) * u, bh = (y1 - y0) * u; w = a.w * bw * z; cx = p1.l + x0 * u + a.cx * bw; cy = p1.t + y0 * u + a.cy * bh; }
      else { w = a.pw * z; cx = a.pcx; cy = a.pcy; }
      const h = w * a.vb[1] / a.vb[0];
      cx += Number(c.ax) || 0; cy += Number(c.ay) || 0;
      acc = Object.assign(avBox(cx - w / 2, cy - h / 2, w, h), { src: avAccSvg(a), onPoke: !!onPoke });
    }
    const accBack = !!(acc && acc.onPoke && behind), accMid = !!(acc && !acc.onPoke), accFront = !!(acc && acc.onPoke && !behind);
    return { bg: avUrl(avBg(c, avTypeColor(c.poke))), char: avUrl(avChar(c)), back: behind ? p1 : null, front: behind ? null : p1, hasBack: behind && !!p1, hasFront: !behind && !!p1, hasExtra: false, extra: null,
      acc: acc, hasAccBack: accBack, hasAccMid: accMid, hasAccFront: accFront };
  };
  // Avatar enregistré en image (JPEG 256 px) : même ordre des calques ; sprites dessinés sans lissage (pixel art).
  const avLoad = src => new Promise((ok, ko) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = src; });
  const avCompose = async c => {
    const L = avLayers(c), N = 256, cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const x = cv.getContext('2d'), draw = async (src, r) => { const im = await avLoad(src); x.drawImage(im, r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : N, r ? r[3] : N); };
    const rect = p => [p.l / 100 * N, p.t / 100 * N, p.w / 100 * N, p.h / 100 * N];
    const sprite = async (p, smooth) => { if (!p) return; x.imageSmoothingEnabled = !!smooth; try { await draw(p.src, rect(p)); } catch (e) { /* image indisponible */ } x.imageSmoothingEnabled = true; };
    await draw(L.bg); await sprite(L.back); if (L.hasAccBack) await sprite(L.acc, true); await draw(L.char); if (L.hasAccMid) await sprite(L.acc, true); await sprite(L.front); if (L.hasAccFront) await sprite(L.acc, true);
    return cv.toDataURL('image/jpeg', 0.9);
  };
  // Configuration complète et valide (valeurs inconnues remplacées par celles par défaut).
  const avNorm = (c, s) => {
    const o = Object.assign({}, AV_DEF, c && typeof c === 'object' ? c : {});
    Object.keys(AV_CATS).forEach(k => { if (!AV_CATS[k][0].some(x => x.id === o[k])) o[k] = AV_DEF[k]; });
    if (!AV_POS.some(([k]) => k === o.pos)) o.pos = 'right';
    o.size = Math.max(60, Math.min(140, Math.round(Number(o.size) || 100)));
    const num = (v, a, b) => (v == null || v === '' || !isFinite(Number(v)) ? null : Math.max(a, Math.min(b, Math.round(Number(v)))));
    o.px = num(o.px, -10, 110); o.py = num(o.py, -10, 110); if (o.px == null || o.py == null) { o.px = null; o.py = null; }
    o.ax = num(o.ax, -400, 400) || 0; o.ay = num(o.ay, -400, 400) || 0; o.asz = num(o.asz, 5, 5000) || 100; o.shiny = o.shiny === true;
    if (o.aon !== 'perso') o.aon = 'poke';
    // Pokémon de l'avatar : n'importe lequel des 171 (essai) ; l'enregistrer demande de l'avoir débloqué ici (avProIds).
    if (!DEX[o.poke]) o.poke = 0;
    if (!o.poke) o.shiny = false;
    delete o.poke2;
    return o;
  };
  // Styles PRO utilisés par une configuration, et ceux qui ne sont pas encore débloqués.
  const avProIds = c => { const ids = Object.keys(AV_CATS).map(k => k + ':' + c[k]).filter(id => AV_PRICES[id]); if (c.poke) ids.push('poke:' + c.poke); if (c.poke && c.shiny) ids.push('shiny:' + c.poke); return ids; };

  const avProto = Component.prototype;
  avProto.avHas = function (id) { const s = this.st(), mine = Array.isArray(s.avOwned) && s.avOwned.indexOf(id) >= 0; if (!avPrice(id) || mine) return true; return !/^(poke|shiny):/.test(id) && !!(this.premOn && this.premOn()); };
  avProto.avOpen = function () {
    const s = this.st();
    this.setState({ avDraft: avNorm(s.avatarCfg, s), avTab: 'hair', avPick: 0, avLock: '' });
    this.push('avatar');
    this.avSync();
  };
  // Styles débloqués et avatar enregistrés sur le serveur.
  avProto.avSync = function () {
    if (typeof Cloud === 'undefined' || !Cloud.on() || !Cloud.signedIn()) return Promise.resolve(null);
    return Cloud.rpc('avatar_state').then(r => {
      if (!r) return null;
      const s = this.st(), patch = { avOwned: Array.isArray(r.owned) ? r.owned : [] };
      if (r.avatar && Object.keys(r.avatar).some(k => JSON.stringify(r.avatar[k]) !== JSON.stringify((s.avatarCfg || {})[k]))) {
        // Serveur sans 021 ou 022 : il ne garde pas encore tout (place, accessoire, shiny, cadre) ; ceux de l'appareil restent.
        patch.avatarCfg = avNorm(Object.assign({}, s.avatarCfg || {}, r.avatar), null);
        avCompose(patch.avatarCfg).then(png => this.setState({ avatarPng: png }), () => {});
      }
      this.setState(patch);
      return r;
    }, () => null);
  };
  avProto.avSet = function (patch) { this.setState({ avDraft: Object.assign({}, this.st().avDraft || AV_DEF, patch) }); };
  // Achat d'un style PRO avec des PA (serveur quand le compte est connecté).
  avProto.avBuy = function (id) {
    const s = this.st(), price = avPrice(id), pa = Number(s.pa) || 0;
    if (!price || this.avHas(id) || s.avBusy) return;
    const sm = /^shiny:(\d+)$/.exec(id);
    if (sm && !this.avHas('poke:' + sm[1])) { this.setState({ avLock: 'poke:' + sm[1], avLockWhy: 'shiny' }); return; }
    if (pa < price) { this.setState({ toast: 'Il te manque ' + (price - pa).toLocaleString('fr-FR') + ' PA' }); return; }
    const done = (left) => {
      const owned = (Array.isArray(this.st().avOwned) ? this.st().avOwned : []).concat([id]);
      this.setState({ avOwned: owned, pa: left, avLock: '', avBusy: false, toast: /^poke:/.test(id) ? avLabel(id) + ' débloqué pour ton avatar' : /^shiny:/.test(id) ? 'Version shiny débloquée' : 'Style débloqué pour toujours' });
      this.flash && this.flash();
    };
    if (typeof Cloud !== 'undefined' && Cloud.on() && Cloud.signedIn()) {
      this.setState({ avBusy: true });
      Cloud.rpc('avatar_buy', { item: id, req: Cloud.reqId() }).then(r => done(typeof gcPa === 'function' ? gcPa(this.st(), r.pa | 0) : (r.pa | 0)),
        e => {
          this.setState({ avBusy: false });
          // Serveur sans 022 : les Pokémon d'avatar, leurs shiny et les cadres n'y existent pas encore.
          if (/Style inconnu/.test(String(e && e.message))) { this.setState({ toast: typeof myAdmin === 'function' && myAdmin() ? 'Installe tools/supabase/install_011_a_022.sql dans Supabase Studio' : 'Bientôt disponible' }); return; }
          if (this.gcFail) this.gcFail(e); else this.setState({ toast: 'Achat impossible pour le moment' });
        });
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
  // Sans avatar enregistré (2026-11-10, porteur : « l'avatar sera directement mis dans la bulle du profil du joueur ») :
  // l'avatar de départ (cheveux noirs en pics, fond jaune), ou celui choisi sans Pokémon, dessiné en une seule image.
  const avFlat = c => { const inner = svg => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    return avUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' + inner(avBg(c, avTypeColor(c.poke))) + inner(avChar(c)) + '</svg>'); };
  const avBaseImg = avProto.img;
  avProto.img = function () {
    const o = avBaseImg.call(this), st = this.state || {}, p = st.avatarPng;
    if (typeof p === 'string' && p.startsWith('data:image/')) return Object.assign({}, o, { avatar: p });
    return Object.assign({}, o, { avatar: avFlat(avNorm(st.avatarCfg, null)) });
  };
  // Cadre animé de l'avatar enregistré (en-tête, bulle de Mon profil).
  avProto.avFrameCls = function () { const c = (this.state || {}).avatarCfg, f = c && AV_FRAMES.some(x => x.id === c.frame) ? c.frame : 'aucun'; return f === 'aucun' ? '' : 'pkm-fr pkm-fr-' + f; };

  // ——— Écran « Mon avatar » ———
  // Deux lignes de rubriques (2026-11-10, porteur) : « Ton avatar » puis « Ton Pokémon ».
  const AV_ROW1 = [['hair', 'Cheveux', 'M6 9a6 6 0 0 1 12 0v3M6 9c2 2 6 2 8-2 1 3 3 4 4 5M6 9v6'], ['face', 'Visage', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 10h.01M15 10h.01M9 15c1.5 1.3 4.5 1.3 6 0'],
    ['style', 'Style', 'M8 4l4 3 4-3 4 4-3 3v9H7v-9L4 8z'], ['bg', 'Décor', 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4']];
  const AV_ROW2 = [['poke', 'Pokémon', 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'], ['acc', 'Accessoire', 'M3 14c0-4 4-7 9-7s9 3 9 7M3 14h18M7 14v-2M17 14v-2'],
    ['shiny', 'Shiny', 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z']];
  const AV_TABS = AV_ROW1.concat(AV_ROW2);
  // Interfaces proposées (2026-11-10) : 1 « Studio », 2 « Carte de dresseur » (choisie), 3 « Plein écran » (?avui=).
  // Choix du porteur (2026-11-10, soir) : 2 « Carte de dresseur ». Les autres restent pour essai (?avui=1 ou 3, sans
  // mémoire : la carte de dresseur revient à l'ouverture suivante).
  const avUi = () => { try { const m = /[?&]avui=([123])\b/.exec(location.search); if (m) return Number(m[1]); } catch (e) { /* adresse sans paramètres */ } return 2; };
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
    const q = String(s.avQ || '').trim().toLowerCase();
    const lockId = s.avLock || '', lockCat = lockId.split(':')[0], isPk = lockCat === 'poke' || lockCat === 'shiny';
    const lockItem = lockId && avPrice(lockId) ? { label: avLabel(lockId) } : null;
    const pa = Number(s.pa) || 0, price = avPrice(lockId);
    const pkPrice = d.poke ? avPokePrice(d.poke) : 0, pkHas = !d.poke || this.avHas('poke:' + d.poke), shHas = !d.poke || this.avHas('shiny:' + d.poke);
    const accPick = x => { const o = opt('acc', x, false); o.icon = x.svg ? avAccSvg(x) : ''; o.hasIcon = !!x.svg; o.none = !x.svg; o.cls = 'pkm-av-opt pkm-av-accopt' + (o.on ? ' pkm-av-on' : ''); return o; };
    const frameOpt = x => { const o = opt('frame', x, true); o.cls = 'pkm-av-opt pkm-av-fropt' + (o.on ? ' pkm-av-on' : ''); o.frCls = 'pkm-av-frdot pkm-fr pkm-fr-' + x.id; return o; };
    const scaleAcc = k => this.avSet({ asz: Math.max(5, Math.round((Number(d.asz) || 100) * k)) });
    return {
      tabs: AV_TABS.map(([k, label, path]) => ({ label: label, path: path, on: tab === k, cls: 'pkm-av-tab' + (tab === k ? ' pkm-av-tab-on' : ''), pick: () => this.setState({ avTab: k }) })),
      row1: AV_ROW1.map(([k, label, path]) => ({ label: label, path: path, on: tab === k, cls: 'pkm-av-tab' + (tab === k ? ' pkm-av-tab-on' : ''), pick: () => this.setState({ avTab: k }) })),
      row2: AV_ROW2.map(([k, label, path]) => ({ label: label, path: path, on: tab === k, cls: 'pkm-av-tab pkm-av-tab2' + (tab === k ? ' pkm-av-tab-on' : '') + (k === 'shiny' && d.shiny ? ' pkm-av-tab-shiny' : ''), pick: () => this.setState({ avTab: k }) })),
      uiCls: 'pkm-av-ui pkm-av-ui' + avUi(), prevCls: 'pkm-av-prev' + (tab === 'acc' ? ' pkm-av-drag-acc' : ' pkm-av-drag-poke'),
      frameCls: 'pkm-av-frwrap pkm-fr pkm-fr-' + d.frame,
      dragHint: tab === 'acc' ? (d.acc !== 'aucun' ? 'Glisse l’accessoire · pince pour le grossir' : '') : d.poke ? 'Fais glisser ton Pokémon où tu veux' : '',
      isPoke: tab === 'poke', isFace: tab === 'face', isHair: tab === 'hair', isStyle: tab === 'style', isBg: tab === 'bg', isAcc: tab === 'acc', isShiny: tab === 'shiny',
      prev: L, save: () => this.avSave(), busy: !!s.avBusy, saveLabel: s.avBusy ? 'Enregistrement…' : 'Enregistrer mon avatar',
      trial: pend.length > 0, trialText: 'Essai : ' + pend.length + ' élément' + (pend.length > 1 ? 's' : '') + ' à débloquer pour enregistrer',
      prem: prem, premTag: prem ? 'Premium : tous les styles PRO sont ouverts' : 'Styles PRO : ouverts avec Premium, ou à débloquer avec tes PA',
      skin: AV_SKIN.map(x => opt('skin', x, true)), face: AV_FACE.map(x => opt('face', x)), eyes: AV_EYES.map(x => opt('eyes', x)),
      hair: AV_HAIR.map(x => opt('hair', x)), hc: AV_HC.map(x => opt('hc', x, true)), outfit: AV_OUTFIT.map(x => opt('outfit', x)), bg: AV_BG.map(x => opt('bg', x)),
      frames: AV_FRAMES.map(frameOpt),
      // Pokémon de l'avatar (2026-11-10, v3) : un seul, à débloquer ici ; version shiny proposée à côté.
      hasPoke: !!d.poke, noPoke: !d.poke, poke: pk(d.poke) || { name: '', icon: '' },
      pokeAria: d.poke ? 'Changer de Pokémon : ' + DEX[d.poke].name : 'Choisir mon Pokémon', changePoke: () => this.setState({ avPick: 1, avQ: '' }),
      pokeLock: !!d.poke && !pkHas, pokePrice: pkPrice + ' PA', unlockPoke: () => this.setState({ avLock: 'poke:' + d.poke, avLockWhy: 'try' }),
      removePoke: () => this.avSet({ poke: 0, shiny: false }),
      shinyOffer: !!d.poke, shinyImg: d.poke ? avSprite(d.poke, true) : '', shinyName: d.poke ? DEX[d.poke].name + ' shiny' : '', shinyPrice: (pkPrice * 2) + ' PA', shinyLock: !shHas, shinyOwned: !!d.poke && shHas,
      shinyLabel: d.shiny ? 'Version shiny choisie' : shHas ? 'Mettre la version shiny' : 'Le double du prix',
      shinyGo: () => { if (!d.poke) return; if (shHas) this.avSet({ shiny: !d.shiny }); else this.setState({ avLock: pkHas ? 'shiny:' + d.poke : 'poke:' + d.poke, avLockWhy: pkHas ? 'try' : 'shiny' }); },
      layer: [['right', 'Devant moi'], ['behind', 'Derrière moi']].map(([k, label]) => { const on = k === 'behind' ? d.pos === 'behind' : d.pos !== 'behind'; return Object.assign({ label: label, on: on, pick: () => this.avSet({ pos: k }) }, this.chip(on)); }),
      moved: d.px != null, resetPlace: () => this.avSet({ px: null, py: null }),
      // Accessoire (v3) : sur le Pokémon ou sur moi ; taille sans limite (pincée, molette, boutons − et +).
      acc: AV_ACC.map(accPick), accOn: d.acc !== 'aucun',
      aon: [['poke', 'Sur mon Pokémon'], ['perso', 'Sur moi']].map(([k, label]) => Object.assign({ label: label, on: d.aon === k, pick: () => this.avSet({ aon: k, ax: 0, ay: 0 }) }, this.chip(d.aon === k))),
      accSizeLabel: d.asz + ' %', accBigger: () => scaleAcc(1.15), accSmaller: () => scaleAcc(1 / 1.15),
      accMoved: !!(d.ax || d.ay || d.asz !== 100), resetAcc: () => this.avSet({ ax: 0, ay: 0, asz: 100 }),
      shinyCards: [false, true].map(v => ({ label: v ? 'Shiny' : 'Normal', on: d.shiny === v, img: d.poke ? avSprite(d.poke, v) : '', cls: 'pkm-av-shc' + (d.shiny === v ? ' pkm-av-on' : '') + (v ? ' pkm-av-shc-s' : ''),
        lock: v && !shHas, price: (pkPrice * 2) + ' PA', aria: (v ? 'Version shiny' : 'Version normale') + (DEX[d.poke] ? ' de ' + DEX[d.poke].name : '') + (d.shiny === v ? ', choisie' : ''), pick: () => this.avSet({ shiny: v }) })),
      size: d.size, sizeLabel: d.size + ' %', onSize: e => this.avSet({ size: Number(e.target.value) || 100 }),
      picker: {
        open: !!s.avPick, title: 'Ton Pokémon d’avatar', sub: 'À débloquer ici avec tes PA, à part du Pokédex : 1re forme 25 PA, 2e 50 PA, 3e 100 PA, légendaires 300 PA (Kyogre, Groudon, Rayquaza 500 PA).',
        close: () => this.setState({ avPick: 0 }), q: s.avQ || '', onQ: e => this.setState({ avQ: e.target.value }),
        items: DEX_DATA.filter(e => !q || e.name.toLowerCase().indexOf(q) >= 0 || String(e.n) === q).map(e => { const has = this.avHas('poke:' + e.n);
          return { n: e.n, name: e.name, no: has ? 'Débloqué' : avPokePrice(e.n) + ' PA', icon: 'img/pokemon/icon/' + e.n + '.png', on: d.poke === e.n,
            cls: 'pkm-av-pk' + (d.poke === e.n ? ' pkm-av-on' : '') + (has ? ' pkm-av-pk-own' : ''), pick: () => { this.avSet({ poke: e.n, shiny: false }); this.setState({ avPick: 0 }); } }; }),
        count: (Array.isArray(s.avOwned) ? s.avOwned.filter(x => /^poke:/.test(x)).length : 0) + ' Pokémon d’avatar débloqué(s) sur 171 · tu peux essayer n’importe lequel avant de le débloquer'
      },
      lock: {
        open: !!lockItem, name: lockItem ? lockItem.label : '', aria: (isPk ? 'À débloquer : ' : 'Style PRO : ') + (lockItem ? lockItem.label : ''), price: price.toLocaleString('fr-FR') + ' PA', pa: pa.toLocaleString('fr-FR') + ' PA',
        why: s.avLockWhy === 'shiny' ? 'Débloque d’abord ce Pokémon pour ton avatar, puis sa version shiny.' : isPk ? (s.avLockWhy === 'save' ? 'Ton avatar utilise ce Pokémon : débloque-le pour enregistrer.' : 'Pokémon d’avatar, à part du Pokédex : débloqué pour toujours avec tes PA.')
          : s.avLockWhy === 'save' ? 'Ton avatar utilise ce style PRO : débloque-le pour enregistrer.' : 'Style PRO : ouvert avec l’abonnement Premium, ou débloqué pour toujours avec tes PA.',
        enough: pa >= price, short: pa >= price ? '' : 'Il te manque ' + (price - pa).toLocaleString('fr-FR') + ' PA', notEnough: pa < price,
        buy: () => this.avBuy(lockId), buyLabel: s.avBusy ? 'Déblocage…' : 'Débloquer pour ' + price.toLocaleString('fr-FR') + ' PA',
        isPk: isPk, notPk: !isPk, pkImg: isPk ? avSprite(Number(lockId.split(':')[1]), lockCat === 'shiny') : '',
        showPrem: !isPk, prem: () => { this.setState({ avLock: '' }); if (this.premOpen) this.premOpen(); else this.setState({ premOpen: true }); },
        close: () => this.setState({ avLock: '' }),
        preview: lockItem && !isPk && lockCat !== 'acc' && lockCat !== 'frame' ? mini({ [lockCat]: lockId.split(':')[1] }) : L
      }
    };
  };
  // Glisser le Pokémon (ou son accessoire, rubrique « Accessoire ») du doigt dans l'aperçu (2026-11-10, porteur : « tu
  // pourras le déplacer n'importe où sur l'écran de ton avatar »). Pendant le geste, l'image suit le doigt ; au lâcher,
  // la place est gardée dans le brouillon (px, py ou ax, ay). Un seul écouteur pour tout le document.
  // Pincer ou écarter deux doigts sur l'accessoire (rubrique « Accessoire ») change sa taille, sans limite (2026-11-10,
  // porteur) ; la molette de la souris aussi.
  let avDragOn = false;
  const avDragInit = self => {
    if (avDragOn || typeof document === 'undefined') return;
    avDragOn = true;
    let g = null, pinch = null;
    const pts = new Map();
    const accMode = () => { const s = self.st(), d = avNorm(s.avDraft, s); return (s.avTab || 'hair') === 'acc' && d.acc !== 'aucun' ? d : null; };
    document.addEventListener('pointerdown', ev => {
      const box = ev.target && ev.target.closest && ev.target.closest('.pkm-av-prev');
      if (!box) return;
      pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      const s = self.st(), d = avNorm(s.avDraft, s), am = accMode();
      // Deux doigts sur l'aperçu, rubrique « Accessoire » : pincée.
      if (pts.size === 2 && am) {
        const [a, b] = [...pts.values()], img = box.querySelector('.pkm-av-acc');
        if (g) { g.box.classList.remove('pkm-av-dragging'); g = null; }
        pinch = { box: box, img: img, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, asz: Number(am.asz) || 100, w0: img ? img.getBoundingClientRect().width : 0 };
        ev.preventDefault(); return;
      }
      if (pts.size > 1) return;
      const img = box.querySelector(am ? '.pkm-av-acc' : '.pkm-av-pk-main');
      if (!img) return;
      const r = box.getBoundingClientRect(), L = avLayers(d), base = am ? L.acc : (L.front || L.back);
      if (!base) return;
      ev.preventDefault();
      g = { box: box, img: img, r: r, acc: !!am, d: d, base: base, orig: base, accL: L.acc, x0: ev.clientX, y0: ev.clientY, id: ev.pointerId };
      try { box.setPointerCapture(ev.pointerId); } catch (e) { /* capture indisponible */ }
      box.classList.add('pkm-av-dragging');
      // Un appui ailleurs dans l'aperçu : le Pokémon vient sous le doigt.
      if (!am && ev.target !== img) { g.base = Object.assign({}, base, { l: (ev.clientX - r.left) / r.width * 100 - base.w / 2, t: (ev.clientY - r.top) / r.height * 100 - base.h / 2 }); g.jump = true; avDragPaint(g, 0, 0); }
    }, { passive: false });
    document.addEventListener('pointermove', ev => {
      if (pts.has(ev.pointerId)) pts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (pinch && pts.size >= 2) {
        ev.preventDefault();
        const [a, b] = [...pts.values()], k = (Math.hypot(a.x - b.x, a.y - b.y) || 1) / pinch.d0;
        pinch.k = k;
        if (pinch.img) pinch.img.style.transform = 'scale(' + k.toFixed(3) + ')';
        return;
      }
      if (!g || ev.pointerId !== g.id) return;
      ev.preventDefault(); avDragPaint(g, (ev.clientX - g.x0) / g.r.width * 100, (ev.clientY - g.y0) / g.r.height * 100);
    }, { passive: false });
    const end = ev => {
      if (ev) pts.delete(ev.pointerId);
      if (pinch) {
        if (pts.size < 2) { const p = pinch; pinch = null; if (p.img) p.img.style.transform = ''; if (p.k && Math.abs(p.k - 1) > 0.01) self.avSet({ asz: Math.max(5, Math.round(p.asz * p.k)) }); }
        return;
      }
      if (!g || (ev && ev.pointerId !== g.id)) return;
      const k = g; g = null; k.box.classList.remove('pkm-av-dragging');
      const dx = ev ? (ev.clientX - k.x0) / k.r.width * 100 : 0, dy = ev ? (ev.clientY - k.y0) / k.r.height * 100 : 0;
      if (!k.jump && Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      if (k.acc) self.avSet({ ax: Math.round((k.d.ax || 0) + dx), ay: Math.round((k.d.ay || 0) + dy) });
      else self.avSet({ px: Math.round(k.base.l + k.base.w / 2 + dx), py: Math.round(k.base.t + k.base.h / 2 + dy) });
    };
    document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
    // Molette (ordinateur) : taille de l'accessoire.
    document.addEventListener('wheel', ev => {
      const box = ev.target && ev.target.closest && ev.target.closest('.pkm-av-prev'), am = box && accMode();
      if (!am) return;
      ev.preventDefault();
      self.avSet({ asz: Math.max(5, Math.round((Number(am.asz) || 100) * Math.exp(-ev.deltaY * 0.0015))) });
    }, { passive: false });
  };
  const avDragPaint = (g, dx, dy) => {
    const l = g.base.l + dx, t = g.base.t + dy;
    g.img.style.left = l.toFixed(1) + '%'; g.img.style.top = t.toFixed(1) + '%';
    // L'accessoire posé sur le Pokémon le suit pendant qu'il est glissé.
    if (!g.acc) { const a = g.box.querySelector('.pkm-av-acc'), A = g.accL; if (a && A && A.onPoke) { a.style.left = (A.l + l - g.orig.l).toFixed(1) + '%'; a.style.top = (A.t + t - g.orig.t).toFixed(1) + '%'; } }
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
    const fr = this.avFrameCls(); ui.hhMeCls = 'pkm-hh-me' + (fr ? ' ' + fr : ''); ui.pfPhotoCls = 'pkm-pf-photo' + (fr ? ' ' + fr : '');
    r.av = ui.isAvatar ? this.vAvatar(s) : { tabs: [], row1: [], row2: [], skin: [], face: [], eyes: [], hair: [], hc: [], outfit: [], bg: [], acc: [], aon: [], frames: [], layer: [], shinyCards: [], prev: {}, picker: { items: [] }, lock: { preview: {} } };
    if (ui.isAvatar) avDragInit(this);
    if (ui.isAvatar) Object.assign(ui, { title: 'Mon avatar', subtitle: '', hasSubtitle: false, hasSubRow: false, headerHome: false, headerBig: false, headerDetail: true });
    return r;
  };
  const avBaseParent = avProto.parentOf;
  avProto.parentOf = function (sc) { return sc === 'avatar' ? 'profile' : avBaseParent.call(this, sc); };
  const avBaseSt = avProto.st;
  avProto.st = function () {
    const d = avBaseSt.call(this), p = this.props || {};
    if (!(this.state && this.state.screen) && p.start === 'avatar') { d.screen = 'avatar'; d.stack = ['profile']; if (!d.avDraft) d.avDraft = avNorm(d.avatarCfg, d); }
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
  const avMini = cfg => { if (!cfg || typeof cfg !== 'object') return null; const L = avLayers(avNorm(cfg, null)); return { bg: L.bg, char: L.char, poke: L.front || L.back, pokeStyle: (L.front || L.back || {}).style || '', hasPoke: !!(L.front || L.back), acc: L.acc || {}, accStyle: (L.acc || {}).style || '', hasAcc: !!L.acc }; };
