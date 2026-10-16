  // ——— Fonds animés (K2) et micro-animations (K3) ; 2026-10-09 ———
  // K2 : décor CSS derrière l'app (fx.css), choisi selon l'écran et le compagnon : reflet holo et étincelles (accueil),
  // gemmes (Marché, fiches), ondes radar (Territoire), bulles, braises ou orage (Kyogre, Groudon, Rayquaza). Réglages ›
  // « Fonds animés » : Animés (par défaut), Calmes, Sans ; enregistré sur l'appareil. Pause quand l'app est cachée.
  // K3 : petites animations au bon moment : cartes qui jaillissent à l'ajout, pluie de gemmes depuis le compteur de PK,
  // étoiles pour un nouveau palier ou un compagnon débloqué. Rien si l'appareil demande moins d'animations.
  // Ce module partage la portée des autres : ses noms commencent par FX_ ou fx.
  const FX_MODES = [['auto', 'Animés'], ['calm', 'Calmes'], ['off', 'Sans']];
  const FX_THEME = { sea: 'bubbles', lava: 'embers', storm: 'storm' };
  const FX_SCREEN = { market: 'gems', sets: 'gems', set: 'gems', sealed: 'gems', item: 'gems', releases: 'gems', territory: 'radar', store: 'radar', scan: '' };
  const fxProto = Component.prototype;
  let fxCur = '', fxReady = false;
  const fxHtml = () => (typeof document !== 'undefined' ? document.documentElement : null);
  const fxSet = cls => {
    const h = fxHtml();
    if (!h || cls === fxCur) return;
    fxCur.split(' ').filter(Boolean).forEach(c => h.classList.remove(c));
    cls.split(' ').filter(Boolean).forEach(c => h.classList.add(c));
    fxCur = cls;
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { const h = fxHtml(); if (h) h.classList.toggle('pkm-fx-paused', document.hidden); });
    setTimeout(() => { fxReady = true; }, 1500); // pas de micro-animation pour les gains du lancement
  }
  const fxQuiet = () => {
    const h = fxHtml();
    return !h || h.classList.contains('pkm-calm') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  // Gerbe de 10 éléments depuis un point de l'écran ; retirée après l'animation.
  function fxBurst(kind, x, y) {
    if (!fxReady || fxQuiet() || typeof document === 'undefined') return;
    const b = document.createElement('div');
    b.className = 'pkm-burst pkm-burst-' + kind;
    b.setAttribute('aria-hidden', 'true');
    b.style.left = Math.round(x) + 'px'; b.style.top = Math.round(y) + 'px';
    for (let k = 0; k < 10; k++) {
      const i = document.createElement('i'), a = (k / 10) * Math.PI * 2 + (kind === 'gem' ? 0.3 : 0), r = 46 + (k % 3) * 22;
      i.style.setProperty('--bx', Math.round(Math.cos(a) * r) + 'px');
      i.style.setProperty('--by', Math.round(Math.sin(a) * r - (kind === 'card' ? 40 : 0)) + 'px');
      i.style.setProperty('--br', ((k % 2 ? 1 : -1) * (90 + k * 25)) + 'deg');
      i.style.animationDelay = (k % 4) * 40 + 'ms';
      b.appendChild(i);
    }
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 1500);
  }
  const fxCenter = el => { const r = el && el.getBoundingClientRect(); return r && r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null; };
  const fxUnits = s => (s.purchases || []).reduce((t, a) => t + a.lines.reduce((u, l) => u + (l.qty || 0), 0), 0);

  const fxBaseSet = fxProto.setState;
  fxProto.setState = function (patch) {
    const before = this.state || {};
    const out = fxBaseSet.call(this, patch);
    const after = this.state || {};
    if (!fxReady || typeof window === 'undefined') return out;
    const W = window.innerWidth, H = window.innerHeight;
    // Après le rendu : positions des éléments à jour.
    const later = f => (window.requestAnimationFrame ? window.requestAnimationFrame(() => setTimeout(f, 0)) : setTimeout(f, 16));
    if (after.purchases !== before.purchases && fxUnits(after) > fxUnits(before)) later(() => fxBurst('card', W / 2, H - 150));
    if ((after.pk || 0) > (before.pk || 0)) later(() => { const c = fxCenter(document.querySelector('header button[aria-label^="Mes PK"]')); fxBurst('gem', c ? c[0] : W - 80, c ? c[1] : 40); });
    const unlocked = Array.isArray(after.pkOwn) && Array.isArray(before.pkOwn) && after.pkOwn.length > before.pkOwn.length;
    const tier = typeof after.toast === 'string' && after.toast !== before.toast && /grade/.test(after.toast);
    if (unlocked || tier) later(() => {
      fxBurst('star', W / 2, H * 0.45);
      const t = document.querySelector('div[role="status"]');
      if (t && !fxQuiet()) { t.classList.add('pkm-halo'); setTimeout(() => t.classList.remove('pkm-halo'), 2000); }
    });
    return out;
  };

  // Décor du moment, et choix dans les Réglages.
  const fxBaseRender = fxProto.renderVals;
  fxProto.renderVals = function () {
    const r = fxBaseRender.call(this), s = this.st(), mode = FX_MODES.some(m => m[0] === s.bgFx) ? s.bgFx : 'auto';
    const theme = HOME_THEMES[s.buddy] ? FX_THEME[HOME_THEMES[s.buddy].key] : '';
    const scene = s.screen === 'scan' ? '' : theme || (s.screen in FX_SCREEN ? FX_SCREEN[s.screen] : 'holo');
    fxSet(mode === 'off' || !scene ? '' : 'pkm-fx-on pkm-fx-' + scene + (mode === 'calm' ? ' pkm-fx-calm' : ''));
    if (r.set) {
      r.set.fx = {
        modes: FX_MODES.map(([k, label]) => Object.assign({ label: label, on: mode === k, pick: () => this.setState({ bgFx: k }) }, this.chip(mode === k))),
        help: { auto: 'Reflet holo sur l’accueil, gemmes dans le Marché, ondes radar dans Territoire ; bulles, braises ou orage avec Kyogre, Groudon et Rayquaza.', calm: 'Mêmes décors, deux fois plus lents et plus discrets.', off: 'Fond fixe, sans décor animé.' }[mode]
          + ' Toujours arrêtés si ton téléphone demande moins d’animations.'
      };
    }
    return r;
  };
