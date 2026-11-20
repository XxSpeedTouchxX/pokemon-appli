// Icônes proposées pour la barre du bas (2026-11-20, porteur : « le logo “Toutes les séries” plus clair, en superposant
// deux cartes l'une sur l'autre légèrement décalées, propose-moi des visuels ; pareil pour “Le coin des dresseurs”, il
// n'est pas clair »). Traits 1,8 sur 24 × 24, comme les autres icônes de la barre. Utilisées par build.mjs (app, essai
// ?servis=1 à 4 et ?coinvis=5 à 8) et make_planche.mjs (planche).
const ST = 'fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round';
const svg = (cls, inner) => `<svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true" class="${cls}" style="${ST}">${inner}</svg>`;
// Carte de devant qui cache la carte de derrière (masque : la carte de derrière s'arrête net au bord de celle de devant).
const hide = (id, front) => `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"></rect>${front}</mask></defs>`;

export const SERIES = [
  { n: 1, name: 'Deux cartes décalées', svg: id => svg('pkm-ser-ico pkm-ser-ico-1',
    hide(id, '<rect x="2.6" y="5.6" width="13.8" height="16.8" rx="3" fill="#000" stroke="none"></rect>')
    + `<rect x="9" y="2.8" width="11.2" height="14.4" rx="2" mask="url(#${id})"></rect><rect x="4" y="7" width="11" height="14" rx="2"></rect>`
    + '<rect x="6.6" y="9.6" width="5.8" height="4.6" rx="0.8"></rect><path d="M6.6 17.2h5.8"></path>') },
  // Choisie par le porteur le 2026-11-20 (« le 2 mais sans le cœur au milieu, juste les cartes en éventail ») : icône
  // de l'onglet par défaut.
  { n: 2, name: 'Cartes en éventail', svg: id => svg('pkm-ser-ico pkm-ser-ico-2',
    hide(id, '<rect x="3.6" y="4.6" width="12.8" height="16.8" rx="3" fill="#000" stroke="none" transform="rotate(-10 10 20)"></rect>')
    + `<g mask="url(#${id})"><rect x="9.4" y="3.2" width="10.6" height="14.4" rx="2" transform="rotate(12 14.7 17.6)"></rect></g>`
    + '<rect x="4.4" y="5.6" width="11.2" height="15" rx="2" transform="rotate(-10 10 20)"></rect>') },
  { n: 3, name: 'Carte pleine devant', svg: id => svg('pkm-ser-ico pkm-ser-ico-3',
    hide(id, '<rect x="2.6" y="5.6" width="13.8" height="16.8" rx="3" fill="#000" stroke="none"></rect>')
    + `<rect x="9" y="2.8" width="11.2" height="14.4" rx="2" mask="url(#${id})"></rect>`
    + '<rect x="4" y="7" width="11" height="14" rx="2" style="fill: currentColor; fill-opacity: 0.28"></rect><rect x="6.6" y="9.6" width="5.8" height="4.6" rx="0.8"></rect>') },
  { n: 4, name: 'Cartes et étoile (rare)', svg: id => svg('pkm-ser-ico pkm-ser-ico-4',
    hide(id, '<rect x="2.6" y="5.6" width="13.8" height="16.8" rx="3" fill="#000" stroke="none"></rect>')
    + `<rect x="9" y="2.8" width="11.2" height="14.4" rx="2" mask="url(#${id})"></rect><rect x="4" y="7" width="11" height="14" rx="2"></rect>`
    + '<path d="M9.5 10.2l1.05 2.15 2.35.34-1.7 1.66.4 2.35-2.1-1.1-2.1 1.1.4-2.35-1.7-1.66 2.35-.34z" style="stroke-width: 1.4"></path>') }
];

export const COIN = [
  { n: 5, name: 'Deux dresseurs qui échangent', svg: () => svg('pkm-coin-ico pkm-coin-ico-5',
    '<rect x="9.2" y="2.6" width="5.6" height="7.6" rx="1.1"></rect><circle cx="5" cy="11.6" r="2.2"></circle><path d="M1.6 20.8a3.5 3.5 0 0 1 6.8 0"></path>'
    + '<circle cx="19" cy="11.6" r="2.2"></circle><path d="M15.6 20.8a3.5 3.5 0 0 1 6.8 0"></path><path d="M9.2 15.6h5.6M10.7 14.1l-1.5 1.5 1.5 1.5M13.3 14.1l1.5 1.5-1.5 1.5"></path>') },
  { n: 6, name: 'Casquette de dresseur', svg: () => svg('pkm-coin-ico pkm-coin-ico-6',
    '<path d="M3.6 15.2a8.4 8 0 0 1 16.8 0z"></path><path d="M12 7.2v8"></path><path d="M12 15.2h8.1a2.3 2.3 0 0 1 0 4.6H12"></path><path d="M3.6 15.2v1.4a3.2 3.2 0 0 0 3.2 3.2H12"></path><circle cx="12" cy="6.4" r="0.6" style="fill: currentColor"></circle>') },
  { n: 7, name: 'Vitrine de dresseur', svg: () => svg('pkm-coin-ico pkm-coin-ico-7',
    '<path d="M3 8.4l1.9-4.6h14.2L21 8.4"></path><path d="M3 8.4a2.25 2.25 0 0 0 4.5 0a2.25 2.25 0 0 0 4.5 0a2.25 2.25 0 0 0 4.5 0a2.25 2.25 0 0 0 4.5 0"></path>'
    + '<path d="M4.6 11.4v9.2h14.8v-9.2"></path><rect x="9.4" y="12.6" width="5.2" height="6.6" rx="0.8"></rect>') },
  { n: 8, name: 'Bulle et carte', svg: () => svg('pkm-coin-ico pkm-coin-ico-8',
    '<path d="M5 3.8h14a2.2 2.2 0 0 1 2.2 2.2v9a2.2 2.2 0 0 1-2.2 2.2h-6.6L7.8 21v-3.8H5A2.2 2.2 0 0 1 2.8 15V6A2.2 2.2 0 0 1 5 3.8z"></path>'
    + '<rect x="9.6" y="6.6" width="4.8" height="6.8" rx="0.8"></rect><path d="M17.4 7.4v2.6M16.1 8.7h2.6" style="stroke-width: 1.5"></path>') },
  // 2ᵉ série (2026-11-20, porteur : « plus axé sur la communauté, on voit des profils de gens, par exemple le 1 mais
  // sans leur casquette ») : ?coinvis=9 à 12.
  { n: 9, name: 'Deux dresseurs', svg: () => svg('pkm-coin-ico pkm-coin-ico-9',
    '<circle cx="9" cy="8.4" r="3.3"></circle><path d="M3.2 20.4v-.6a5 5 0 0 1 5-5h1.6a5 5 0 0 1 5 5v.6"></path>'
    + '<circle cx="17" cy="7.4" r="2.5"></circle><path d="M16.2 12.6h1.2a4.2 4.2 0 0 1 4.2 4.2v.8"></path>') },
  { n: 10, name: 'Groupe de dresseurs', svg: () => svg('pkm-coin-ico pkm-coin-ico-10',
    '<circle cx="12" cy="8.6" r="3"></circle><path d="M6.6 20.4v-.4a4.6 4.6 0 0 1 4.6-4.6h1.6a4.6 4.6 0 0 1 4.6 4.6v.4"></path>'
    + '<circle cx="5" cy="7.8" r="2.1"></circle><path d="M1.6 16.4v-.2a3.4 3.4 0 0 1 3.4-3.4h1.2"></path>'
    + '<circle cx="19" cy="7.8" r="2.1"></circle><path d="M22.4 16.4v-.2a3.4 3.4 0 0 0-3.4-3.4h-1.2"></path>') },
  { n: 11, name: 'Dresseurs qui discutent', svg: () => svg('pkm-coin-ico pkm-coin-ico-11',
    '<path d="M8.6 2.6h6.8a1.8 1.8 0 0 1 1.8 1.8v2.8a1.8 1.8 0 0 1-1.8 1.8h-2.2L12 10.6 10.8 9h-2.2a1.8 1.8 0 0 1-1.8-1.8V4.4a1.8 1.8 0 0 1 1.8-1.8z"></path>'
    + '<path d="M9.9 5.8h.01M12 5.8h.01M14.1 5.8h.01"></path>'
    + '<circle cx="6" cy="13.2" r="2.3"></circle><path d="M2.4 21.2a3.6 3.6 0 0 1 7.2 0"></path>'
    + '<circle cx="18" cy="13.2" r="2.3"></circle><path d="M14.4 21.2a3.6 3.6 0 0 1 7.2 0"></path>') },
  { n: 12, name: 'Profils de dresseurs', svg: () => svg('pkm-coin-ico pkm-coin-ico-12',
    hide('pkm-coin-m12', '<rect x="1.9" y="7.3" width="14.4" height="14.8" rx="3.2" fill="#000" stroke="none"></rect>')
    + '<g mask="url(#pkm-coin-m12)"><rect x="8.6" y="2.6" width="12.8" height="12.8" rx="2.4"></rect><circle cx="17.6" cy="6.8" r="1.7"></circle><path d="M14.6 12.4a3 3 0 0 1 6 0"></path></g>'
    + '<rect x="2.8" y="8.2" width="12.6" height="13" rx="2.4"></rect><circle cx="9.1" cy="13" r="2.1"></circle><path d="M5.6 19.4a3.5 3.5 0 0 1 7 0"></path>') }
];
