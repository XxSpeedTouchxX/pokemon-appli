  // ——— PA (points d'Aura) : calcul pur du gain (testé par tools/web/test_pa.mjs) ———
  // Depuis le 2026-11-01 (porteur : « l'obtention des PA se gagne toutes les 24 h au lieu de chaque jour, mais il faut se
  // connecter au moins une fois 24 h après avoir récupéré ses PA, sinon on redescend à 15 PA ») : le calcul se fait à
  // l'heure près, à partir de l'instant de la dernière récupération (lastAt, en millisecondes) :
  // - avant 24 h : rien à récupérer ;
  // - entre 24 h et 48 h : PA à récupérer, la série continue (+10, +15, +20, +25, puis +30) ;
  // - après 48 h (PA pas récupérés dans les 24 h où ils attendaient) : la série reprend à +15 PA (2e palier).
  const PaCore = (function () {
    const GAIN = [10, 15, 20, 25, 30];
    const H24 = 86400000;
    const gainOf = s => GAIN[Math.min(s, GAIN.length) - 1];
    // Gain à récupérer maintenant : null s'il faut encore attendre ; sinon la nouvelle série et le gain.
    const next = (lastAt, streak, now) => {
      if (!(lastAt > 0)) return { streak: 1, gain: GAIN[0] };
      const gap = now - lastAt;
      if (!(gap >= H24)) return null;
      const s = gap < 2 * H24 ? Math.max(1, streak || 0) + 1 : 2;
      return { streak: s, gain: gainOf(s) };
    };
    // Gain suivant si les PA sont récupérés à temps.
    const tomorrow = streak => gainOf((streak || 0) + 1);
    // Instant où les prochains PA seront prêts, et limite pour les récupérer sans perdre la série.
    const readyAt = lastAt => (lastAt > 0 ? lastAt + H24 : 0);
    const keepUntil = lastAt => (lastAt > 0 ? lastAt + 2 * H24 : 0);
    return { GAIN: GAIN, H24: H24, next: next, tomorrow: tomorrow, readyAt: readyAt, keepUntil: keepUntil };
  })();
