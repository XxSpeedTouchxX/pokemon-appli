  // ——— PA (points d'Aura) : calcul pur du gain du jour (testé par tools/web/test_pa.mjs) ———
  // Règle du porteur (confirmée le 2026-11-01, après un essai « toutes les 24 h » le même jour) : les PA sont
  // disponibles chaque jour dès minuit ; récupérés chaque jour, la série monte (+20, +30, +40, +50, puis +70 ; gains du
  // 2026-11-02) ; un jour entier sans les récupérer, la série reprend à +30 PA (palier J2).
  // Paliers du 2026-11-09 (porteur) : +20, +30, +40, +50, +60, +70, puis +80 PA chaque jour (le maximum) ; une boîte
  // mystère offerte à chaque série de 7 jours d'affilée (7e, 14e, 21e… jour) ; un jour sans les récupérer : retour au
  // palier J3 (+40 PA) et la série de 7 jours recommence ; deux jours ou plus : retour au palier J1 (+20 PA).
  const PaCore = (function () {
    const GAIN = [20, 30, 40, 50, 60, 70, 80];
    const DAY = 86400000;
    const gainOf = s => GAIN[Math.min(Math.max(s, 1), GAIN.length) - 1];
    // Gain du jour : null si déjà récupéré aujourd'hui ; sinon le palier (streak), le gain, la série de jours d'affilée
    // (run) et la boîte offerte (gift, tous les 7 jours d'affilée).
    const next = (lastDay, streak, today, run) => {
      if (lastDay === today) return null;
      if (!lastDay) return { streak: 1, gain: GAIN[0], run: 1, gift: false };
      const gap = Math.round((Date.parse(today) - Date.parse(lastDay)) / DAY);
      if (gap <= 0) return null;
      const st = gap === 1 ? Math.min(Math.max(1, streak || 0) + 1, GAIN.length) : gap === 2 ? Math.max(1, Math.min(streak || 1, 3)) : 1;
      const r = gap === 1 ? Math.max(1, run || 1) + 1 : 1;
      return { streak: st, gain: gainOf(st), run: r, gift: r % 7 === 0 };
    };
    // Gain de demain si les PA sont récupérés demain.
    const tomorrow = streak => gainOf((streak || 0) + 1);
    // Jour suivant (AAAA-MM-JJ).
    const nextDay = day => new Date(Date.parse(day) + DAY).toISOString().slice(0, 10);
    return { GAIN: GAIN, next: next, tomorrow: tomorrow, nextDay: nextDay };
  })();
