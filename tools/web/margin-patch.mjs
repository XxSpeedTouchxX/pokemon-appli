// Vendre un exemplaire précis (B2, 2026-10-09) : correctif du calcul de marge de la maquette, appliqué par le build
// (build.mjs) et vérifié par les tests (test_margin.mjs) avec exactement le même texte.
// Une vente peut désigner l'ajout d'où vient l'exemplaire vendu (from = id de l'achat). Son coût est alors le prix
// unitaire de cet ajout (identification spécifique) au lieu du coût moyen pondéré ; sans « from », rien ne change.
// L'ajout doit précéder la vente ; sinon, ou s'il a disparu, la vente reprend le coût moyen. Ajout sans prix : coût
// inconnu, comme aujourd'hui.
export const MARGIN_PATCHES = [
  [
    `        const known = st.qty - st.unk;
        const pru = known > 0 ? st.cost / known : 0;
        const fromKnown = Math.min(v.qty, Math.max(0, known));`,
    `        const known = st.qty - st.unk;
        const sa = v.from ? s.purchases.find(a => a.id === v.from) : null, sk = sa ? sa.lines.findIndex(l => l.pid === v.pid) : -1;
        const sp = sk < 0 || !(sa.id in buys) ? undefined : (buys[sa.id] === null ? null : buys[sa.id][sk] / sa.lines[sk].qty);
        const pru = typeof sp === 'number' ? sp : (known > 0 ? st.cost / known : 0);
        const fromKnown = sp === null ? 0 : Math.min(v.qty, Math.max(0, known));`
  ],
  [
    `        st.cost = st.qty - st.unk <= 0 ? 0 : st.cost - cost;`,
    `        st.cost = st.qty - st.unk <= 0 ? 0 : Math.max(0, st.cost - cost);`
  ]
];
// Applique les correctifs à un texte ; chaque passage doit être trouvé une seule fois.
export function applyMarginPatches(src) {
  for (const [from, to] of MARGIN_PATCHES) {
    const n = src.split(from).length - 1;
    if (n !== 1) throw new Error('Correctif de marge : passage trouvé ' + n + ' fois');
    src = src.replace(from, to);
  }
  return src;
}
