  // ——— Sons de la pièce et de l'évolution (2026-11-01, demande du porteur) ———
  // « Rajoute un son quand on lance la pièce » ; « propose-moi différents sons d'évolution » et « une musique lors de
  // l'évolution du Pokémon ». Tout est fabriqué dans le navigateur avec Web Audio : aucun fichier son, aucun service
  // extérieur, aucun son ni aucune mélodie repris d'un jeu ou d'un dessin animé (motifs originaux).
  // - Pièce : pichenette (clic et tintement métallique), petit reflet sonore à chaque demi-tour, de plus en plus
  //   espacé, puis la pièce touche la table (2,38 s), rebondit (2,64 s) et vibre en s'immobilisant (2,9 s), au rythme de
  //   l'animation pkmGmCoin (games.css).
  // - Évolution : 5 sons et 4 musiques au choix, calés sur l'animation de 7,2 s (pkmEvoFrom et pkmEvoTo, games.css) :
  //   le Pokémon blanchit (0,72 s), les deux formes alternent de plus en plus vite (SFX_FLASH, 1,37 à 4,14 s), la
  //   nouvelle forme grandit (4,18 s) puis prend ses couleurs (4,8 s), et rebondit (5,3 à 6,2 s).
  //   Choix par défaut proposés (SFX_EVO_DEFAULT, SFX_MUSIC_DEFAULT), à confirmer par le porteur ; ?sonevo=… et
  //   ?musevo=… (numéro ou identifiant, 0 = aucun) pour en essayer d'autres, gardés sur l'appareil.
  // - Son coupé avec celui du didacticiel (clé pkm-tuto-sound), et jamais avec « mouvements réduits » (pas d'animation).
  // Ce module partage la portée des autres : ses noms commencent par SFX_ ou sfx.
  const SFX_FLASH = [1.368, 1.761, 2.068, 2.307, 2.493, 2.639, 2.754, 2.869, 2.984, 3.1, 3.215, 3.33, 3.445, 3.56, 3.676, 3.791, 3.906, 4.021, 4.136];
  const SFX_WHITE = 0.72, SFX_GROW = 4.18, SFX_REVEAL = 4.8, SFX_END = 7.2;
  // Hauteur d'une note : n demi-tons au-dessus du la 440 Hz.
  const sfxHz = n => 440 * Math.pow(2, n / 12);
  // Bruit blanc toujours identique (le même son à chaque fois), créé une fois par contexte audio.
  const sfxNoiseBuf = new WeakMap();
  const sfxNoise = ac => {
    let b = sfxNoiseBuf.get(ac);
    if (b) return b;
    b = ac.createBuffer(1, Math.round(ac.sampleRate * 2), ac.sampleRate);
    const d = b.getChannelData(0);
    let x = 12345;
    for (let i = 0; i < d.length; i++) { x = (x * 1103515245 + 12345) & 0x7fffffff; d[i] = x / 0x3fffffff - 1; }
    sfxNoiseBuf.set(ac, b);
    return b;
  };
  // Enveloppe : montée en a secondes jusqu'à vol, puis extinction jusqu'à at + dur (jamais de claquement).
  const sfxEnv = (g, at, a, vol, dur) => {
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), at + a);
    g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(a + 0.01, dur));
  };
  // Note simple (type d'onde, fréquence, glissement facultatif vers f1).
  function sfxTone(ac, out, type, f, at, dur, vol, a, f1) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, at);
    if (f1 && f1 !== f) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
    sfxEnv(g, at, a || 0.005, vol, dur);
    o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.05);
  }
  // Cloche ou métal : partiels non harmoniques qui s'éteignent d'autant plus vite qu'ils sont aigus.
  function sfxBell(ac, out, f, at, dur, vol, ratios, amps) {
    const r = ratios || [1, 2.76, 5.4, 8.93], m = amps || [1, 0.5, 0.25, 0.12];
    r.forEach((k, i) => sfxTone(ac, out, 'sine', f * k, at, dur / (1 + i * 0.7), vol * m[i], 0.002));
  }
  // Souffle filtré (clic, chuintement, vague) : bruit passé dans un filtre qui peut glisser de f0 à f1.
  function sfxHiss(ac, out, at, dur, vol, type, f0, f1, q, a) {
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = sfxNoise(ac); s.loop = true;
    fl.type = type || 'bandpass'; fl.Q.value = q || 1;
    fl.frequency.setValueAtTime(f0, at);
    if (f1 && f1 !== f0) fl.frequency.exponentialRampToValueAtTime(f1, at + dur);
    sfxEnv(g, at, a || 0.003, vol, dur);
    s.connect(fl); fl.connect(g); g.connect(out); s.start(at); s.stop(at + dur + 0.05);
  }
  // Corde pincée (harpe, boîte à musique) : triangle et partiel doublé, attaque nette.
  function sfxPluck(ac, out, f, at, dur, vol) {
    sfxTone(ac, out, 'triangle', f, at, dur, vol, 0.003);
    sfxTone(ac, out, 'sine', f * 2, at, dur * 0.5, vol * 0.35, 0.002);
  }
  // Cuivre (fanfare) : dent de scie dont le filtre s'ouvre à l'attaque.
  function sfxBrass(ac, out, f, at, dur, vol) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.004;
    fl.type = 'lowpass'; fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(f * 1.5, at); fl.frequency.exponentialRampToValueAtTime(f * 6, at + 0.08); fl.frequency.exponentialRampToValueAtTime(f * 3, at + dur);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.05);
    g.gain.setValueAtTime(vol, at + Math.max(0.06, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(out);
    o.start(at); o2.start(at); o.stop(at + dur + 0.05); o2.stop(at + dur + 0.05);
  }
  // Nappe (accord tenu) : sinus et triangles légèrement désaccordés, attaque et fin douces.
  function sfxPad(ac, out, notes, at, dur, vol, a) {
    notes.forEach(n => {
      [0.997, 1.003].forEach(k => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = sfxHz(n) * k;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + (a || 0.4));
        g.gain.setValueAtTime(vol, at + Math.max((a || 0.4) + 0.01, dur - 0.8)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.05);
      });
    });
  }
  // Coup sourd (cœur, timbale, grosse caisse) : sinus qui descend vite.
  const sfxThump = (ac, out, at, vol, f0, f1, dur) => sfxTone(ac, out, 'sine', f0 || 110, at, dur || 0.22, vol, 0.004, f1 || 45);
  // Petites étoiles : tintements aigus « au hasard », toujours les mêmes.
  function sfxSparkle(ac, out, from, to, n, vol, base) {
    for (let i = 0; i < n; i++) {
      const u = ((i * 7919) % 97) / 97, w = ((i * 104729) % 89) / 89;
      sfxBell(ac, out, (base || 2600) * (1 + w * 1.4), from + (to - from) * (i + u * 0.6) / n, 0.5, vol * (0.6 + 0.4 * w), [1, 2.4], [1, 0.3]);
    }
  }

  // Pizzicato (corde pincée d'orchestre) : dent de scie très filtrée, éteinte en un quart de seconde.
  function sfxPizz(ac, out, f, at, vol) {
    const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.value = f;
    fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(Math.min(6000, f * 4), at); fl.frequency.exponentialRampToValueAtTime(Math.max(200, f * 1.2), at + 0.25);
    sfxEnv(g, at, 0.004, vol, 0.3);
    o.connect(fl); fl.connect(g); g.connect(out); o.start(at); o.stop(at + 0.35);
  }
  // Cordes tenues (violons, violoncelles) : deux dents de scie désaccordées, filtrées, vibrato ; trem > 0 : trémolo.
  function sfxStrings(ac, out, notes, at, dur, vol, a, trem) {
    notes.forEach(n => {
      const f = sfxHz(n), fl = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), dep = ac.createGain();
      fl.type = 'lowpass'; fl.Q.value = 0.8; fl.frequency.value = Math.min(5200, f * 5);
      lfo.frequency.value = 5.3; dep.gain.value = f * 0.005; lfo.connect(dep);
      [0.997, 1.003].forEach(k => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * k; dep.connect(o.frequency); o.connect(fl); o.start(at); o.stop(at + dur + 0.05); });
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + (a || 0.15));
      g.gain.setValueAtTime(vol, at + Math.max((a || 0.15) + 0.01, dur - 0.35)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      if (trem) {
        const tr = ac.createGain(), tl = ac.createOscillator(), td = ac.createGain();
        tr.gain.value = 0.7; tl.frequency.value = trem; td.gain.value = 0.3; tl.connect(td); td.connect(tr.gain);
        fl.connect(tr); tr.connect(g); tl.start(at); tl.stop(at + dur + 0.05);
      } else fl.connect(g);
      g.connect(out); lfo.start(at); lfo.stop(at + dur + 0.05);
    });
  }
  // Piano : partiels harmoniques qui s'éteignent vite, petit coup de marteau.
  function sfxPiano(ac, out, f, at, dur, vol) {
    [1, 2, 3, 4].forEach((k, i) => sfxTone(ac, out, 'sine', f * k * (1 + i * 0.0008), at, dur / (1 + i * 0.8), vol * [1, 0.42, 0.18, 0.08][i], 0.003));
    sfxHiss(ac, out, at, 0.012, vol * 0.12, 'highpass', 2500, 0, 0.7, 0.001);
  }
  // Chœur « ah » : dents de scie désaccordées passées dans deux formants de la voyelle a.
  function sfxChoir(ac, out, notes, at, dur, vol, a) {
    notes.forEach(n => {
      const f = sfxHz(n), g = ac.createGain(), f1 = ac.createBiquadFilter(), f2 = ac.createBiquadFilter(), g2 = ac.createGain(), lfo = ac.createOscillator(), dep = ac.createGain();
      f1.type = 'bandpass'; f1.frequency.value = 730; f1.Q.value = 5;
      f2.type = 'bandpass'; f2.frequency.value = 1090; f2.Q.value = 6; g2.gain.value = 0.6;
      lfo.frequency.value = 4.8; dep.gain.value = f * 0.006; lfo.connect(dep);
      [0.996, 1, 1.004].forEach(k => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * k; dep.connect(o.frequency); o.connect(f1); o.connect(f2); o.start(at); o.stop(at + dur + 0.05); });
      f2.connect(g2); f1.connect(g); g2.connect(g);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + (a || 0.5));
      g.gain.setValueAtTime(vol, at + Math.max((a || 0.5) + 0.01, dur - 0.5)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      g.connect(out); lfo.start(at); lfo.stop(at + dur + 0.05);
    });
  }
  // Cymbale frappée : souffle aigu qui s'éteint lentement.
  const sfxCymbal = (ac, out, at, vol) => sfxHiss(ac, out, at, 2.2, vol, 'highpass', 5200, 0, 0.6, 0.002);
  // Grille commune aux variantes de « Suspense et lumière » (en temps de 0,48 s) : la mineur (4 temps), fa (2),
  // sol (2), mi majeur (2, tension), puis la majeur au 11e temps, quand la nouvelle forme apparaît.
  const SFX_PROG = [[0, 4, [-12, -9, -5]], [4, 2, [-16, -12, -9]], [6, 2, [-14, -10, -7]], [8, 2, [-17, -13, -10]]];
  const SFX_A_MAJ = [-12, -8, -5];

  // ——— Pièce ———
  function sfxCoin(ac, out, t0) {
    // Pichenette : clic du pouce et tintement de la pièce.
    sfxHiss(ac, out, t0, 0.02, 0.5, 'highpass', 3800, 0, 0.7, 0.001);
    sfxBell(ac, out, 2380, t0 + 0.004, 1.1, 0.24, [1, 2.71, 5.13, 8.3], [1, 0.42, 0.2, 0.09]);
    // En l'air : un reflet à chaque demi-tour (16), de plus en plus espacé ; le souffle de la pièce qui tourne.
    for (let i = 1; i <= 16; i++) {
      const u = i / 16, t = t0 + 2.3 * (1 - Math.pow(1 - u, 1.8));
      sfxBell(ac, out, 2380 * (i % 2 ? 1 : 1.012), t, 0.16, 0.05 * (1 - 0.45 * u), [1, 2.71], [1, 0.25]);
    }
    sfxHiss(ac, out, t0 + 0.02, 0.85, 0.035, 'bandpass', 5000, 7000, 3, 0.2);
    sfxHiss(ac, out, t0 + 0.85, 1.5, 0.03, 'bandpass', 7000, 4200, 3, 0.1);
    // Sur la table : choc, rebond, puis la pièce vibre de plus en plus vite et s'immobilise.
    const clink = (t, v) => { sfxHiss(ac, out, t, 0.015, v * 1.4, 'bandpass', 5200, 0, 1.2, 0.001); sfxBell(ac, out, 3150, t + 0.002, 0.45, v, [1, 2.43, 4.9], [1, 0.4, 0.15]); sfxThump(ac, out, t, v * 0.6, 240, 90, 0.07); };
    clink(t0 + 2.38, 0.3); clink(t0 + 2.64, 0.17);
    [2.9, 2.985, 3.045, 3.09, 3.122, 3.146, 3.164].forEach((t, i) => clink(t0 + t, 0.11 * Math.pow(0.78, i)));
  }

  // ——— Sons d'évolution (5 propositions) ———
  const SFX_EVO = [
    { id: 'cristal', name: 'Cristal magique', desc: 'Des clochettes de cristal à chaque éclair, de plus en plus aiguës, puis un grand accord scintillant quand la nouvelle forme apparaît.',
      play: (ac, out, t0) => {
        sfxHiss(ac, out, t0 + SFX_WHITE, SFX_GROW - SFX_WHITE, 0.03, 'bandpass', 6000, 9000, 2, 0.6);
        const scale = [3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24, 26, 27, 29, 31, 32, 34];
        SFX_FLASH.forEach((t, i) => sfxBell(ac, out, sfxHz(scale[i]), t0 + t, 0.9, 0.05 + 0.006 * i, [1, 2.0, 3.01], [1, 0.3, 0.12]));
        for (let i = 0; i < 10; i++) sfxBell(ac, out, sfxHz(15 + i * 2), t0 + SFX_GROW + i * 0.05, 0.6, 0.07, [1, 2], [1, 0.3]);
        [3, 10, 15, 19, 22, 27].forEach(n => sfxBell(ac, out, sfxHz(n), t0 + SFX_REVEAL, 2.4, 0.07, [1, 2.0, 3.0], [1, 0.25, 0.1]));
        sfxSparkle(ac, out, t0 + SFX_REVEAL + 0.2, t0 + 6.8, 14, 0.035, 2800);
      } },
    { id: 'energie', name: 'Charge d’énergie', desc: 'Une énergie grave qui monte et pulse avec les éclairs, un grand souffle, puis une détonation lumineuse.',
      play: (ac, out, t0) => {
        const a = t0 + SFX_WHITE, b = t0 + SFX_GROW;
        const fl = ac.createBiquadFilter(), g = ac.createGain(), pulse = ac.createGain();
        fl.type = 'lowpass'; fl.Q.value = 4; fl.frequency.setValueAtTime(200, a); fl.frequency.exponentialRampToValueAtTime(3800, b);
        g.gain.setValueAtTime(0.0001, a); g.gain.exponentialRampToValueAtTime(0.09, b - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, b + 0.25);
        // Pulsation à chaque éclair : le volume se creuse puis revient, en douceur (sans claquement).
        pulse.gain.setValueAtTime(1, a);
        SFX_FLASH.forEach(t => { pulse.gain.setTargetAtTime(0.35, t0 + t, 0.008); pulse.gain.setTargetAtTime(1, t0 + t + 0.035, 0.02); });
        [1, 1.007, 0.5].forEach(k => { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(80 * k, a); o.frequency.exponentialRampToValueAtTime(640 * k, b); o.connect(fl); o.start(a); o.stop(b + 0.3); });
        fl.connect(g); g.connect(pulse); pulse.connect(out);
        sfxHiss(ac, out, b - 0.2, 0.85, 0.16, 'bandpass', 300, 7000, 1.4, 0.6);
        sfxThump(ac, out, t0 + SFX_REVEAL, 0.5, 130, 38, 0.9);
        [0, 4, 7, 12].forEach(n => sfxBrass(ac, out, sfxHz(n - 12), t0 + SFX_REVEAL, 1.6, 0.05));
        sfxSparkle(ac, out, t0 + SFX_REVEAL + 0.1, t0 + 6.4, 9, 0.03, 2400);
      } },
    { id: 'retro', name: 'Rétro 8 bits', desc: 'Les bips d’une console d’autrefois qui grimpent à chaque éclair, puis une petite fanfare électronique.',
      play: (ac, out, t0) => {
        SFX_FLASH.forEach((t, i) => sfxTone(ac, out, 'square', sfxHz(-2 + Math.floor(i / 2) * 2 + (i % 2) * 5), t0 + t, 0.08, 0.05, 0.002));
        for (let i = 0; i < 12; i++) sfxTone(ac, out, 'square', sfxHz(3 + i * 2), t0 + SFX_GROW + i * 0.045, 0.05, 0.045, 0.002);
        [[3, 0, 0.13], [7, 0.15, 0.13], [10, 0.3, 0.13], [15, 0.45, 0.9]].forEach(([n, d, l]) => {
          sfxTone(ac, out, 'square', sfxHz(n), t0 + SFX_REVEAL + d, l, 0.06, 0.003);
          sfxTone(ac, out, 'triangle', sfxHz(n - 24), t0 + SFX_REVEAL + d, l, 0.12, 0.003);
        });
        sfxTone(ac, out, 'square', sfxHz(19), t0 + SFX_REVEAL + 1.45, 0.12, 0.05, 0.003);
        sfxTone(ac, out, 'square', sfxHz(22), t0 + SFX_REVEAL + 1.6, 0.6, 0.05, 0.003);
      } },
    { id: 'cosmique', name: 'Souffle cosmique', desc: 'Un souffle qui s’ouvre comme une galaxie, des battements de cœur à chaque éclair, puis un accord aérien.',
      play: (ac, out, t0) => {
        sfxHiss(ac, out, t0 + SFX_WHITE, SFX_GROW - SFX_WHITE + 0.6, 0.1, 'lowpass', 180, 5200, 3, 2.8);
        SFX_FLASH.forEach((t, i) => sfxThump(ac, out, t0 + t, 0.18 + 0.012 * i, 95, 42, 0.18));
        sfxHiss(ac, out, t0 + SFX_GROW, SFX_REVEAL - SFX_GROW + 0.05, 0.12, 'highpass', 2500, 7000, 0.8, 0.6);
        sfxThump(ac, out, t0 + SFX_REVEAL, 0.42, 90, 32, 1.1);
        sfxPad(ac, out, [-9, -2, 3, 7, 10], t0 + SFX_REVEAL, 2.3, 0.022, 0.15);
        sfxSparkle(ac, out, t0 + SFX_REVEAL + 0.3, t0 + 6.9, 10, 0.028, 3200);
      } },
    { id: 'harpe', name: 'Harpe féerique', desc: 'Une harpe qui monte note après note avec les éclairs, un glissando, puis un accord doux et des étoiles.',
      play: (ac, out, t0) => {
        const penta = [0, 2, 4, 7, 9];
        const note = i => 3 + 12 * Math.floor(i / 5) + penta[i % 5];
        SFX_FLASH.forEach((t, i) => sfxPluck(ac, out, sfxHz(note(i) - 12), t0 + t, 0.7, 0.09));
        for (let i = 0; i < 16; i++) sfxPluck(ac, out, sfxHz(note(i) - 12), t0 + SFX_GROW + i * 0.035, 0.6, 0.06);
        [-9, -5, -2, 3, 7, 10, 15].forEach((n, i) => sfxPluck(ac, out, sfxHz(n), t0 + SFX_REVEAL + i * 0.03, 2, 0.08));
        sfxSparkle(ac, out, t0 + SFX_REVEAL + 0.4, t0 + 6.9, 12, 0.03, 3000);
      } }
  ];

  // ——— Musiques d'évolution (4 propositions) ———
  // 125 battements par minute (0,48 s le temps) : la nouvelle forme apparaît sur le 11e temps (4,8 s).
  const SFX_BEAT = 0.48;
  const SFX_MUSIC = [
    { id: 'fanfare', name: 'Fanfare héroïque', desc: 'Timbales qui montent en puissance, cuivres en suspens, puis une fanfare triomphale quand la nouvelle forme apparaît.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT;
        for (let i = 0; i < 10; i++) sfxThump(ac, out, t0 + i * B, 0.18 + 0.025 * i, 100, 55, 0.35);
        for (let i = 0; i < 8; i++) sfxThump(ac, out, t0 + 8 * B + i * B / 4, 0.16 + 0.03 * i, 100, 55, 0.2);
        // Accords tenus : la mineur, fa, sol en suspens, sol.
        [[[-12, -9, -5], 0, 2], [[-16, -12, -7], 2, 2], [[-14, -9, -7], 4, 2], [[-14, -10, -7], 6, 4]].forEach(([ch, b, l]) => ch.forEach(n => sfxBrass(ac, out, sfxHz(n), t0 + b * B, l * B, 0.022)));
        // Fanfare (motif original) en do majeur.
        const R = t0 + 10 * B;
        [[3, 0, 0.5], [7, 0.5, 0.5], [10, 1, 0.5], [15, 1.5, 1.5], [14, 3, 0.5], [15, 3.5, 1.4]].forEach(([n, b, l]) => sfxBrass(ac, out, sfxHz(n), R + b * B, l * B, 0.05));
        [[[-9, -5, -2], 0, 3], [[-4, 0, 3], 3, 0.5], [[-9, -5, -2], 3.5, 1.4]].forEach(([ch, b, l]) => ch.forEach(n => sfxBrass(ac, out, sfxHz(n), R + b * B, l * B, 0.024)));
        sfxThump(ac, out, R, 0.42, 120, 45, 0.6); sfxHiss(ac, out, R, 1.4, 0.05, 'highpass', 6000, 0, 0.7, 0.005);
      } },
    { id: 'suspense', name: 'Suspense et lumière', desc: 'Des arpèges mystérieux en mineur qui s’accélèrent avec les éclairs, puis la musique s’éclaire en majeur quand la nouvelle forme apparaît.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, arp = [0, 3, 7, 12, 7, 3];
        for (let i = 0; i < 40; i++) {
          const t = i * B / 4, ch = i < 16 ? 0 : i < 24 ? -4 : i < 32 ? -2 : -1;
          sfxPluck(ac, out, sfxHz(ch + arp[i % 6] - 12), t0 + t, 0.32, 0.03 + 0.0012 * i);
        }
        for (let i = 0; i < 10; i++) sfxThump(ac, out, t0 + i * B, 0.12 + 0.02 * i, 70, 40, 0.2);
        sfxPad(ac, out, [-24, -12, -9], t0, 10 * B, 0.014, 1.2);
        sfxHiss(ac, out, t0 + 8 * B, 2 * B, 0.07, 'highpass', 1800, 8000, 0.8, 1.5 * B);
        // Éclaircie en la majeur : nappe, cloches (motif original), basse.
        const R = t0 + 10 * B;
        sfxPad(ac, out, [-12, -8, -5, 0, 4], R, 5 * B, 0.022, 0.08);
        [[12, 0, 1], [16, 1, 1], [19, 2, 1], [24, 3, 2]].forEach(([n, b, l]) => sfxBell(ac, out, sfxHz(n), R + b * B, l * B + 0.8, 0.06, [1, 2.0, 3.0], [1, 0.3, 0.1]));
        sfxThump(ac, out, R, 0.35, 90, 40, 0.7);
      } },
    { id: 'chiptune', name: 'Chiptune joyeuse', desc: 'Une musique de jeu vidéo d’autrefois, rythmée et entraînante, qui finit sur un petit air de victoire.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B;
        for (let i = 0; i < 20; i++) sfxHiss(ac, out, t0 + i * B / 2, 0.04, 0.05 + (i % 2 ? 0 : 0.02), 'highpass', 7000, 0, 0.7, 0.001);
        for (let i = 0; i < 10; i++) sfxThump(ac, out, t0 + i * B, 0.2, 150, 50, 0.12);
        const bass = [-21, -21, -14, -14, -17, -17, -19, -19, -14, -14];
        bass.forEach((n, i) => { sfxTone(ac, out, 'triangle', sfxHz(n), t0 + i * B, B * 0.45, 0.14, 0.003); sfxTone(ac, out, 'triangle', sfxHz(n + 12), t0 + i * B + B / 2, B * 0.4, 0.1, 0.003); });
        const lead = [3, 7, 10, 7, 5, 8, 12, 8, 7, 10, 14, 10, 10, 14, 17, 22];
        lead.forEach((n, i) => sfxTone(ac, out, 'square', sfxHz(n), t0 + 2 * B + i * B / 2, B * 0.42, 0.035, 0.003));
        [[15, 0, 0.5], [19, 0.5, 0.5], [22, 1, 0.5], [27, 1.5, 2]].forEach(([n, b, l]) => sfxTone(ac, out, 'square', sfxHz(n), R + b * B, l * B, 0.045, 0.003));
        [[-9, 0, 2], [-5, 2, 2]].forEach(([n, b, l]) => sfxTone(ac, out, 'triangle', sfxHz(n), R + b * B, l * B, 0.15, 0.003));
        for (let i = 0; i < 6; i++) sfxHiss(ac, out, R + i * B / 2, 0.05, 0.06, 'highpass', 7000, 0, 0.7, 0.001);
      } },
    { id: 'boite', name: 'Boîte à musique', desc: 'Une boîte à musique douce et un peu magique, qui s’illumine de clochettes quand la nouvelle forme apparaît.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B;
        const box = (n, t, v) => { sfxTone(ac, out, 'sine', sfxHz(n), t, 1.2, v, 0.002); sfxTone(ac, out, 'sine', sfxHz(n) * 3, t, 0.35, v * 0.3, 0.002); };
        const mel = [[15, 0], [19, 1], [22, 2], [20, 3], [19, 4], [17, 5], [15, 6], [14, 7], [12, 8], [14, 8.5], [15, 9], [17, 9.5]];
        mel.forEach(([n, b]) => box(n, t0 + b * B, 0.07));
        [3, 10, 8, 5, 3].forEach((n, i) => box(n - 12, t0 + i * 2 * B, 0.05));
        [[22, 0], [27, 1], [31, 2], [34, 3]].forEach(([n, b]) => box(n, R + b * B, 0.075));
        [3, 7, 10, 15].forEach(n => box(n - 12, R, 0.05));
        sfxSparkle(ac, out, R + 0.2, t0 + 6.9, 10, 0.03, 3400);
      } },
    // ——— Variantes de « Suspense et lumière » (2026-11-01, porteur : « propose-moi des sons dans le même thème ») ———
    // Même déroulé : mystère en la mineur pendant les éclairs (la, fa, sol, mi), puis éclaircie en la majeur quand la
    // nouvelle forme apparaît ; seul le timbre change.
    { id: 'cordes', name: 'Suspense et lumière · cordes', desc: 'Des cordes pincées qui tournent en mineur sur un trémolo de violons qui enfle, puis un grand accord de cordes en majeur et une mélodie de violon.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B;
        SFX_PROG.forEach(([b, l, ch], k) => {
          for (let i = 0; i < l * 2; i++) sfxPizz(ac, out, sfxHz(ch[i % 3] + (i % 6 >= 3 ? 12 : 0)), t0 + (b + i / 2) * B, 0.07 + 0.006 * (b * 2 + i));
          sfxStrings(ac, out, ch.map(n => n - 12), t0 + b * B, l * B + 0.2, 0.012 + 0.007 * k, 0.35, 9);
        });
        sfxHiss(ac, out, t0 + 8 * B, 2 * B, 0.05, 'highpass', 1500, 7000, 0.8, 1.6 * B);
        sfxStrings(ac, out, [-24].concat(SFX_A_MAJ, [0]), R, 2.4, 0.028, 0.1, 0);
        [[12, 0, 1], [16, 1, 1], [19, 2, 1], [24, 3, 2]].forEach(([n, b, l]) => sfxStrings(ac, out, [n], R + b * B, l * B + 0.3, 0.035, 0.06, 0));
        sfxThump(ac, out, R, 0.3, 80, 38, 0.8);
      } },
    { id: 'piano', name: 'Suspense et lumière · piano', desc: 'Un piano en mineur dont chaque note tombe sur un éclair, de plus en plus aiguë, puis un accord majeur égrené et une petite mélodie lumineuse.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B;
        SFX_PROG.forEach(([b, , ch]) => sfxPiano(ac, out, sfxHz(ch[0] - 12), t0 + b * B, 1.8, 0.09));
        [0, 1, 2, 1].forEach((j, i) => sfxPiano(ac, out, sfxHz(SFX_PROG[0][2][j]), t0 + 0.05 + i * B * 0.66, 0.9, 0.06));
        SFX_FLASH.forEach((t, i) => {
          const beat = t / B, ch = (SFX_PROG.filter(p => p[0] <= beat).pop() || SFX_PROG[0])[2];
          sfxPiano(ac, out, sfxHz(ch[i % 3] + 12 * Math.min(2, Math.floor(i / 6))), t0 + t, 0.9, 0.05 + 0.002 * i);
        });
        [-24, -12, -8, -5, 0, 4, 7, 12].forEach((n, i) => sfxPiano(ac, out, sfxHz(n), R + i * 0.04, 2.6, 0.06));
        [[16, 1], [19, 1.5], [24, 2], [28, 3]].forEach(([n, b]) => { sfxPiano(ac, out, sfxHz(n), R + b * B, 1.4, 0.05); sfxBell(ac, out, sfxHz(n), R + b * B, 1.2, 0.025, [1, 2.0], [1, 0.2]); });
      } },
    { id: 'choeur', name: 'Suspense et lumière · chœur céleste', desc: 'Un chœur grave et mystérieux qui monte accord après accord sur des battements de cœur, puis s’envole en majeur, aigu et lumineux.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B;
        SFX_PROG.forEach(([b, l, ch], k) => sfxChoir(ac, out, ch, t0 + b * B, l * B + 0.45, 0.024 + 0.008 * k, 0.45));
        for (let i = 0; i < 10; i++) sfxThump(ac, out, t0 + i * B, 0.04 + 0.008 * i, 70, 38, 0.2);
        sfxHiss(ac, out, t0 + 8 * B, 2 * B, 0.05, 'highpass', 1500, 7000, 0.8, 1.6 * B);
        sfxChoir(ac, out, SFX_A_MAJ.concat([0, 4, 7]), R, 2.4, 0.03, 0.2);
        [12, 16, 19, 24].forEach((n, i) => sfxBell(ac, out, sfxHz(n), R + 0.1 + i * 0.12, 1.4, 0.04, [1, 2.0, 3.0], [1, 0.3, 0.1]));
        sfxSparkle(ac, out, R + 0.5, t0 + 6.9, 8, 0.025, 3000);
      } },
    { id: 'orchestre', name: 'Suspense et lumière · orchestre', desc: 'Contrebasses obstinées, roulement de timbales qui s’accélère et cuivres en suspens, puis tout l’orchestre éclate en majeur avec une cymbale.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B;
        SFX_PROG.forEach(([b, l, ch]) => { for (let i = 0; i < l * 2; i++) sfxStrings(ac, out, [ch[0] - 12], t0 + (b + i / 2) * B, B * 0.42, 0.03 + 0.003 * (b * 2 + i), 0.02, 0); });
        for (let i = 0; i < 8; i++) sfxThump(ac, out, t0 + i * B, 0.14 + 0.02 * i, 95, 50, 0.3);
        for (let i = 0; i < 16; i++) sfxThump(ac, out, t0 + 8 * B + i * B / 8, 0.12 + 0.018 * i, 95, 50, 0.16);
        SFX_PROG[3][2].forEach(n => sfxBrass(ac, out, sfxHz(n), t0 + 8 * B, 2 * B, 0.02));
        [-24, -12, -8, -5].forEach(n => sfxBrass(ac, out, sfxHz(n), R, 2.2, 0.03));
        sfxStrings(ac, out, SFX_A_MAJ.concat([0, 4]), R, 2.4, 0.016, 0.06, 0);
        [[0, 0, 1], [4, 1, 1], [7, 2, 1], [12, 3, 2]].forEach(([n, b, l]) => sfxBrass(ac, out, sfxHz(n), R + b * B, l * B + 0.2, 0.045));
        sfxThump(ac, out, R, 0.45, 110, 40, 0.9); sfxCymbal(ac, out, R, 0.08);
      } },
    { id: 'nuit', name: 'Suspense et lumière · nuit étoilée', desc: 'Un synthétiseur en arpège qui s’ouvre peu à peu dans la nuit, une basse profonde, puis un grand accord électronique brillant et des étoiles.',
      play: (ac, out, t0) => {
        const B = SFX_BEAT, R = t0 + 10 * B, fl = ac.createBiquadFilter();
        fl.type = 'lowpass'; fl.Q.value = 7; fl.frequency.setValueAtTime(320, t0); fl.frequency.exponentialRampToValueAtTime(4200, R); fl.frequency.exponentialRampToValueAtTime(1800, R + 2.4);
        fl.connect(out);
        const pat = [0, 7, 12, 7];
        SFX_PROG.forEach(([b, l, ch]) => {
          for (let i = 0; i < l * 4; i++) sfxTone(ac, fl, 'square', sfxHz(ch[0] + pat[i % 4] + 12), t0 + (b + i / 4) * B, B * 0.22, 0.05, 0.003);
          sfxTone(ac, out, 'sine', sfxHz(ch[0] - 12), t0 + b * B, l * B, 0.12, 0.05);
        });
        sfxHiss(ac, out, t0 + 8 * B, 2 * B, 0.05, 'highpass', 1500, 7000, 0.8, 1.6 * B);
        SFX_A_MAJ.concat([0, 4]).forEach(n => [0.993, 1, 1.007].forEach(k => {
          const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
          o.type = 'sawtooth'; o.frequency.value = sfxHz(n) * k; lp.type = 'lowpass'; lp.frequency.value = 5000;
          g.gain.setValueAtTime(0.0001, R); g.gain.exponentialRampToValueAtTime(0.01, R + 0.05); g.gain.setValueAtTime(0.01, R + 1.8); g.gain.exponentialRampToValueAtTime(0.0001, R + 2.4);
          o.connect(lp); lp.connect(g); g.connect(out); o.start(R); o.stop(R + 2.45);
        }));
        for (let i = 0; i < 12; i++) sfxTone(ac, fl, 'square', sfxHz(SFX_A_MAJ[i % 3] + 24), R + i * B / 4, B * 0.2, 0.04 * (1 - i / 14), 0.003);
        sfxThump(ac, out, R, 0.35, 90, 36, 0.8);
        sfxSparkle(ac, out, R + 0.3, t0 + 6.9, 10, 0.03, 3200);
      } }
  ];
  // Choix par défaut proposés au porteur (à confirmer) : « Cristal magique » et « Suspense et lumière ».
  const SFX_EVO_DEFAULT = 'cristal', SFX_MUSIC_DEFAULT = 'suspense';
  // Volume de chaque son, réglé sur son rendu : sons autour de −24 dBFS en moyenne, musiques autour de −27 dBFS (un peu
  // en dessous du son), crêtes sous −3 dBFS.
  const SFX_GAIN = { coin: 1, cristal: 1.23, energie: 1.07, retro: 3.2, cosmique: 1.03, harpe: 1.7, fanfare: 0.82, suspense: 1.23, chiptune: 1.84, boite: 1.82,
    cordes: 1.4, piano: 1.24, choeur: 2.75, orchestre: 0.87, nuit: 1.55 };
  const SFX_MUSIC_LEVEL = 0.75;

  // Choix en cours : ?sonevo= / ?musevo= (numéro dans la liste, identifiant, ou 0 pour aucun), gardé sur l'appareil.
  const sfxPick = (param, key, list, def) => {
    let v = '';
    try {
      const m = new RegExp('[?&]' + param + '=([\\w-]+)').exec(location.search);
      if (m) { v = m[1]; localStorage.setItem(key, v); } else v = localStorage.getItem(key) || '';
    } catch (e) { v = ''; }
    if (v === '0' || v === 'aucun') return null;
    if (/^\d+$/.test(v) && list[Number(v) - 1]) return list[Number(v) - 1];
    return list.find(x => x.id === v) || list.find(x => x.id === def) || null;
  };
  const sfxMuted = () => { try { return localStorage.getItem('pkm-tuto-sound') === 'off'; } catch (e) { return false; } };
  // Sortie commune : gain du son, puis limiteur doux (aucune saturation, même si sons et musique se superposent).
  const sfxBus = (ac, dest, gain) => {
    const g = ac.createGain(), c = ac.createDynamicsCompressor();
    g.gain.value = gain;
    c.threshold.value = -6; c.knee.value = 6; c.ratio.value = 12; c.attack.value = 0.002; c.release.value = 0.15;
    g.connect(c); c.connect(dest);
    return g;
  };
  // Son et musique ensemble : un dernier limiteur, un peu plus bas, pour que leur somme ne sature pas.
  const sfxMaster = (ac, dest) => {
    const g = ac.createGain(), c = ac.createDynamicsCompressor();
    g.gain.value = 0.7;
    c.threshold.value = -5; c.knee.value = 3; c.ratio.value = 20; c.attack.value = 0.001; c.release.value = 0.2;
    g.connect(c); c.connect(dest);
    return g;
  };
  // Joue dans ac (temps réel ou hors ligne) : kind = 'coin', 'evo' ou 'music', id = identifiant de la liste.
  function sfxSchedule(ac, dest, kind, id, t0) {
    if (kind === 'coin') { sfxCoin(ac, sfxBus(ac, dest, SFX_GAIN.coin), t0); return true; }
    const item = (kind === 'music' ? SFX_MUSIC : SFX_EVO).find(x => x.id === id);
    if (!item) return false;
    item.play(ac, sfxBus(ac, dest, (SFX_GAIN[id] || 1) * (kind === 'music' ? SFX_MUSIC_LEVEL : 1)), t0);
    return true;
  }
  let sfxAc = null;
  const sfxCtx = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!sfxAc) sfxAc = new AC();
    if (sfxAc.state === 'suspended') sfxAc.resume();
    return sfxAc;
  };
  const sfxProto = Component.prototype;
  // Lancer de la pièce (games.js, gmFlip) : appelé au toucher, ce qui autorise le son.
  sfxProto.sfxCoin = function () {
    try { if (sfxMuted()) return; const ac = sfxCtx(); if (ac) sfxSchedule(ac, ac.destination, 'coin', '', ac.currentTime + 0.02); } catch (e) { /* son indisponible */ }
  };
  // Évolution (pa.js, paFxRun) : le son et la musique choisis, ensemble.
  sfxProto.sfxEvo = function () {
    try {
      if (sfxMuted()) return;
      const ac = sfxCtx();
      if (!ac) return;
      const t0 = ac.currentTime + 0.03, s = sfxPick('sonevo', 'pkm-evo-sfx', SFX_EVO, SFX_EVO_DEFAULT), m = sfxPick('musevo', 'pkm-evo-music', SFX_MUSIC, SFX_MUSIC_DEFAULT);
      const dest = s && m ? sfxMaster(ac, ac.destination) : ac.destination;
      if (s) sfxSchedule(ac, dest, 'evo', s.id, t0);
      if (m) sfxSchedule(ac, dest, 'music', m.id, t0);
    } catch (e) { /* son indisponible */ }
  };
  // Écoute hors ligne (échantillons envoyés au porteur, tests) : rendu en PCM 16 bits, en base64.
  sfxProto.sfxRender = function (list, secs) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, rate = 44100;
    const ac = new OAC(1, Math.round(rate * (secs || SFX_END + 0.6)), rate);
    const dest = list.length > 1 ? sfxMaster(ac, ac.destination) : ac.destination;
    list.forEach(([kind, id]) => sfxSchedule(ac, dest, kind, id, 0.05));
    return ac.startRendering().then(buf => {
      const d = buf.getChannelData(0), pcm = new Int16Array(d.length);
      let peak = 0, sum = 0;
      for (let i = 0; i < d.length; i++) { const v = Math.max(-1, Math.min(1, d[i])); pcm[i] = v * 32767; peak = Math.max(peak, Math.abs(v)); sum += v * v; }
      const bytes = new Uint8Array(pcm.buffer);
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return { rate: rate, b64: btoa(bin), peak: peak, rms: Math.sqrt(sum / d.length) };
    });
  };
  sfxProto.sfxLists = function () { return { evo: SFX_EVO.map(x => ({ id: x.id, name: x.name, desc: x.desc })), music: SFX_MUSIC.map(x => ({ id: x.id, name: x.name, desc: x.desc })), evoDef: SFX_EVO_DEFAULT, musicDef: SFX_MUSIC_DEFAULT }; };
