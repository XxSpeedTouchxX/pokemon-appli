  // ——— PA (points d'Aura) : calcul pur du gain du jour (testé par tools/web/test_pa.mjs) ———
  // Règle du porteur (confirmée le 2026-11-01, après un essai « toutes les 24 h » le même jour) : les PA sont
  // disponibles chaque jour dès minuit ; récupérés chaque jour, la série monte (+20, +30, +40, +50, puis +70 ; gains du
  // 2026-11-02) ; un jour entier sans les récupérer, la série reprend à +30 PA (palier J2).
  const PaCore = (function () {
    const GAIN = [20, 30, 40, 50, 70];
    const DAY = 86400000;
    const gainOf = s => GAIN[Math.min(s, GAIN.length) - 1];
    // Gain du jour : null si déjà récupéré aujourd'hui ; sinon la nouvelle série et le gain.
    const next = (lastDay, streak, today) => {
      if (lastDay === today) return null;
      if (!lastDay) return { streak: 1, gain: GAIN[0] };
      const gap = Math.round((Date.parse(today) - Date.parse(lastDay)) / DAY);
      if (gap <= 0) return null;
      const s = gap === 1 ? Math.max(1, streak || 0) + 1 : 2;
      return { streak: s, gain: gainOf(s) };
    };
    // Gain de demain si les PA sont récupérés demain.
    const tomorrow = streak => gainOf((streak || 0) + 1);
    // Jour suivant (AAAA-MM-JJ).
    const nextDay = day => new Date(Date.parse(day) + DAY).toISOString().slice(0, 10);
    return { GAIN: GAIN, next: next, tomorrow: tomorrow, nextDay: nextDay };
  })();
