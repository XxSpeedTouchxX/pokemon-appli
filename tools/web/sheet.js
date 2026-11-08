  // ——— Fenêtres d'infos qui montent du bas et redescendent (2026-11-08, demande du porteur) ———
  // Comme « Mon Pokédex » : chaque fenêtre en bas d'écran (classe pkm-sheet : Mes PK, Mes PA, règles des PK et PA,
  // informations légales, fiche d'une carte, modification d'un ajout, import, compagnon, panneau Admin, résultat du
  // scan…) monte du bas à l'ouverture (sheet.css) et redescend à la fermeture, pendant que le voile s'efface.
  // La fermeture est prise ici pour toutes ces fenêtres : un bouton « Fermer… » (ou data-sheet-close) touché dans la
  // fenêtre ou sur son voile fait d'abord glisser la fenêtre vers le bas, puis le même bouton est rejoué pour la fermer
  // vraiment. Rien de tout cela si le téléphone demande moins d'animations. Mon profil (une page) n'est pas concerné.
  let sheetPass = false;
  const sheetOf = b => b.closest('.pkm-sheet') || (b.parentElement && Array.from(b.parentElement.children).find(c => c.classList && c.classList.contains('pkm-sheet'))) || null;
  const sheetIsClose = b => b.hasAttribute('data-sheet-close') || /^Fermer/.test((b.getAttribute('aria-label') || '').trim()) || (b.textContent || '').trim() === 'Fermer';
  const sheetSlideDown = (sh, done) => {
    const ease = 'cubic-bezier(0.32, 0.72, 0, 1)', ov = sh.parentElement;
    sh.dataset.closing = '1';
    sh.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(105%)' }], { duration: 380, easing: ease, fill: 'forwards' });
    if (ov && ov !== document.body) {
      const bg = getComputedStyle(ov).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') ov.animate([{ backgroundColor: bg }, { backgroundColor: 'rgba(3, 6, 14, 0)' }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
      Array.from(ov.children).forEach(c => { if (c !== sh && c.tagName === 'BUTTON' && getComputedStyle(c).backgroundColor !== 'rgba(0, 0, 0, 0)') c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: 'ease-out', fill: 'forwards' }); });
    }
    setTimeout(() => {
      done();
      // Si la fenêtre est toujours là (le bouton ne la fermait pas), on la remet en place.
      setTimeout(() => { if (sh.isConnected) { sh.getAnimations().forEach(a => { if (a instanceof CSSAnimation) return; a.cancel(); }); if (ov) ov.getAnimations().forEach(a => { if (!(a instanceof CSSAnimation)) a.cancel(); }); Array.from((ov && ov.children) || []).forEach(c => c.getAnimations && c.getAnimations().forEach(a => { if (!(a instanceof CSSAnimation)) a.cancel(); })); } delete sh.dataset.closing; }, 60);
    }, 340);
  };
  try {
    document.addEventListener('click', e => {
      if (sheetPass) return;
      const b = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!b || !sheetIsClose(b)) return;
      const sh = sheetOf(b);
      if (!sh || !sh.animate || navStill()) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if (sh.dataset.closing) return;
      sheetSlideDown(sh, () => { sheetPass = true; try { b.click(); } finally { sheetPass = false; } });
    }, true);
  } catch (e) { /* pas de document */ }
