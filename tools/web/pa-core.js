  // ——— PA (points d'Aura) : calcul pur du gain du jour (testé par tools/web/test_pa.mjs) ———
  const PaCore = (function () {
    const GAIN = [10, 15, 20, 25, 30];
    const DAY = 86400000;
    // Gain du jour : null si déjà compté aujourd'hui ; sinon la nouvelle série et le gain.
    const next = (lastDay, streak, today) => {
      if (lastDay === today) return null;
      if (!lastDay) return { streak: 1, gain: GAIN[0] };
      const gap = Math.round((Date.parse(today) - Date.parse(lastDay)) / DAY);
      if (gap <= 0) return null;
      const s = gap === 1 ? Math.max(1, streak || 0) + 1 : 2;
      return { streak: s, gain: GAIN[Math.min(s, GAIN.length) - 1] };
    };
    // Gain de demain si l'app est ouverte demain.
    const tomorrow = streak => GAIN[Math.min((streak || 0) + 1, GAIN.length) - 1];
    return { GAIN: GAIN, next: next, tomorrow: tomorrow };
  })();
