  // ——— Sons de la pièce et de l'évolution (2026-11-01, demande du porteur) ———
  // « Rajoute un son quand on lance la pièce » ; « propose-moi différents sons d'évolution » et « une musique lors de
  // l'évolution du Pokémon ». Tout est fabriqué dans le navigateur avec Web Audio : aucun fichier son, aucun service
  // extérieur, aucun son ni aucune mélodie repris d'un jeu ou d'un dessin animé (motifs originaux).
  // - Pièce : pichenette (clic et tintement métallique), petit reflet sonore à chaque demi-tour, de plus en plus
  //   espacé, puis la pièce touche la table (2,38 s), rebondit (2,64 s) et vibre en s'immobilisant (2,9 s), au rythme de
  //   l'animation pkmGmCoin (games.css).
  // - Évolution : 5 sons et 4 musiques au choix, calés sur l'animation de 7,2 s (8,2 s depuis le 2026-11-01 : la nouvelle forme reste 1 s de plus ; pkmEvoFrom et pkmEvoTo, games.css) :
  //   le Pokémon blanchit (0,72 s), les deux formes alternent de plus en plus vite (SFX_FLASH, 1,37 à 4,14 s), la
  //   nouvelle forme grandit (4,18 s) puis prend ses couleurs (4,8 s), et rebondit (5,3 à 6,2 s).
  //   Choix du porteur (2026-11-01) : la musique « Suspense et lumière » seule, sans son par-dessus
  //   (SFX_EVO_DEFAULT, SFX_MUSIC_DEFAULT). Les autres restent pour des essais : ?sonevo=… et ?musevo=… (numéro ou
  //   identifiant, 0 = aucun), le temps de la page seulement.
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
  // ——— PA du jour (2026-11-01, porteur : « un petit bruitage quand tu récupères tes PA tous les jours ») ———
  // Calé sur l'animation « Récupérer mes PA » (pa.js, paFly) : éclat au toucher, gouttes qui s'éparpillent, puis une
  // goutte arrive sur le solde toutes les 55 ms à partir de 1,27 s (n gouttes, 8 à 14) ; un petit son par goutte, de
  // plus en plus aigu, puis une note finale quand le solde est plein. 5 propositions ; ?sonpa=… pour en essayer.
  const sfxPaHits = n => Array.from({ length: n }, (_, i) => 1.27 + i * 0.055);
  // Vol des gouttes (0,35 à 1,27 s) : léger souffle qui monte vers le solde (ou petite montée rétro pour « arcade »).
  const sfxPaFlight = (ac, out, t0, retro) => {
    if (retro) { for (let i = 0; i < 8; i++) sfxTone(ac, out, 'square', sfxHz(-2 + i), t0 + 0.4 + i * 0.1, 0.03, 0.012, 0.002); return; }
    sfxHiss(ac, out, t0 + 0.35, 0.95, 0.03, 'bandpass', 1800, 6500, 2.5, 0.6);
  };
  const SFX_PA = [
    { id: 'cristaux', name: 'Cristaux qui tintent', desc: 'Un éclat scintillant, puis un tintement de cristal par goutte, qui monte la gamme, et un petit accord brillant.',
      play: (ac, out, t0, n) => {
        sfxPaFlight(ac, out, t0, false);
        sfxHiss(ac, out, t0, 0.35, 0.05, 'bandpass', 5000, 9000, 2, 0.01);
        sfxBell(ac, out, sfxHz(15), t0 + 0.01, 0.6, 0.06, [1, 2.0, 3.01], [1, 0.3, 0.1]);
        const sc = [3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29, 31, 34];
        sfxPaHits(n).forEach((t, i) => sfxBell(ac, out, sfxHz(sc[i % sc.length]), t0 + t, 0.45, 0.045, [1, 2.0, 3.01], [1, 0.25, 0.08]));
        const end = t0 + sfxPaHits(n)[n - 1] + 0.12;
        [15, 19, 22, 27].forEach((k, i) => sfxBell(ac, out, sfxHz(k), end + i * 0.04, 1.1, 0.05, [1, 2.0, 3.0], [1, 0.25, 0.1]));
      } },
    { id: 'gouttes', name: 'Gouttes d’aura', desc: 'Un « ploc » d’eau au toucher, puis de petites gouttes qui tombent une à une sur le solde, et un reflet d’eau à la fin.',
      play: (ac, out, t0, n) => {
        sfxPaFlight(ac, out, t0, false);
        const drop = (f, t, v) => { sfxTone(ac, out, 'sine', f * 1.6, t, 0.09, v, 0.002, f * 0.7); sfxTone(ac, out, 'sine', f * 2.4, t + 0.012, 0.05, v * 0.3, 0.002, f * 1.2); };
        drop(500, t0, 0.22);
        sfxPaHits(n).forEach((t, i) => drop(700 + i * 55, t0 + t, 0.12));
        const end = t0 + sfxPaHits(n)[n - 1] + 0.12;
        [0, 0.07, 0.15].forEach((d, i) => drop(1400 + i * 300, end + d, 0.1));
        sfxBell(ac, out, sfxHz(22), end + 0.15, 0.9, 0.035, [1, 2.0], [1, 0.2]);
      } },
    { id: 'bulles', name: 'Bulles douces', desc: 'Des bulles rondes qui éclosent une à une, comme la voix du didacticiel, puis une grappe de bulles à la fin.',
      play: (ac, out, t0, n) => {
        sfxPaFlight(ac, out, t0, false);
        const bub = (f, t, v) => sfxTone(ac, out, 'sine', f, t, 0.07, v, 0.004, f * 2.6);
        [0, 0.05, 0.11].forEach((d, i) => bub(300 + i * 90, t0 + d, 0.16));
        const pent = [0, 2, 4, 7, 9];
        sfxPaHits(n).forEach((t, i) => bub(sfxHz(-12 + 12 * Math.floor(i / 5) + pent[i % 5]), t0 + t, 0.13));
        const end = t0 + sfxPaHits(n)[n - 1] + 0.12;
        [0, 0.04, 0.08, 0.13, 0.19].forEach((d, i) => bub(sfxHz(7 + i * 2), end + d, 0.1));
      } },
    { id: 'arcade', name: 'Compteur arcade', desc: 'Un « bip » rétro par goutte, comme un compteur de points de jeu d’arcade qui défile, puis un petit jingle.',
      play: (ac, out, t0, n) => {
        sfxPaFlight(ac, out, t0, true);
        sfxTone(ac, out, 'square', sfxHz(3), t0, 0.06, 0.04, 0.002, sfxHz(15));
        sfxPaHits(n).forEach((t, i) => sfxTone(ac, out, 'square', sfxHz(10 + i), t0 + t, 0.035, 0.035, 0.002));
        const end = t0 + sfxPaHits(n)[n - 1] + 0.12;
        [[15, 0, 0.08], [19, 0.09, 0.08], [22, 0.18, 0.08], [27, 0.27, 0.35]].forEach(([k, d, l]) => { sfxTone(ac, out, 'square', sfxHz(k), end + d, l, 0.035, 0.003); sfxTone(ac, out, 'triangle', sfxHz(k - 24), end + d, l, 0.1, 0.003); });
      } },
    { id: 'aura', name: 'Souffle d’aura', desc: 'Un souffle feutré qui libère l’aura, de petits « fwip » qui filent vers le solde, puis une note chaude et douce.',
      play: (ac, out, t0, n) => {
        sfxPaFlight(ac, out, t0, false);
        sfxHiss(ac, out, t0, 0.6, 0.12, 'bandpass', 400, 3500, 1.5, 0.05);
        sfxPaHits(n).forEach((t, i) => { sfxHiss(ac, out, t0 + t - 0.05, 0.08, 0.06, 'bandpass', 1500 + i * 120, 4500 + i * 150, 3, 0.04); sfxBell(ac, out, sfxHz(3 + (i % 5) * 2), t0 + t, 0.35, 0.025, [1, 2.0], [1, 0.2]); });
        const end = t0 + sfxPaHits(n)[n - 1] + 0.1;
        sfxPad(ac, out, [-9, -5, -2, 3], end, 1.3, 0.03, 0.05);
        sfxSparkle(ac, out, end + 0.1, end + 1.1, 6, 0.025, 3000);
      } }
  ];
  // ——— Passage de grade (profile.js, pfGradeShow ; animation pkmGu*, games.css) ———
  // 2026-11-01, porteur : « propose-moi des sons pour le changement de grade, je veux des sons plus épiques ».
  // Calés sur l'animation : l'ancien emblème se charge (0 à 2,35 s), éclate (2,35 s, éclair blanc), le nouvel emblème
  // surgit (2,5 s), puis « Nouveau grade » et son nom (3,05 à 3,5 s), et l'emblème brille en boucle (3,9 s).
  // 6 propositions : le son d'origine (2026-10-22) et 5 plus épiques ; ?songrade=1 à 6 pour en essayer un.
  const SFX_GU_HIT = 2.35, SFX_GU_NEW = 2.5, SFX_GU_NAME = 3.05;
  // Montée filtrée (dent de scie qui s'ouvre et enfle jusqu'à at + dur, puis s'arrête net).
  function sfxRiser(ac, out, f0, f1, at, dur, vol, fc0, fc1) {
    const o = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + dur);
    fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(fc0 || 300, at); fl.frequency.exponentialRampToValueAtTime(fc1 || 4000, at + dur);
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + dur - 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.06);
    o.connect(fl); fl.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.1);
  }
  // Roulement de timbale qui accélère et enfle de from à to.
  function sfxRoll(ac, out, from, to, f, vol) {
    let t = from, i = 0;
    while (t < to) { const u = (t - from) / (to - from); sfxThump(ac, out, t, vol * (0.25 + 0.75 * u * u), f * 1.4, f * 0.8, 0.18); t += 0.22 - 0.18 * u; i++; }
    return i;
  }
  // Grand impact : coup très grave, souffle qui retombe, cymbale.
  function sfxImpact(ac, out, at, vol) {
    sfxThump(ac, out, at, vol, 90, 28, 1.1);
    sfxHiss(ac, out, at, 0.9, vol * 0.55, 'lowpass', 7000, 250, 0.7, 0.002);
    sfxCymbal(ac, out, at, vol * 0.22);
  }
  // Gong : partiels graves non harmoniques, longue résonance.
  const sfxGong = (ac, out, f, at, dur, vol) => sfxBell(ac, out, f, at, dur, vol, [1, 1.48, 2.0, 2.67, 3.52, 4.6], [1, 0.7, 0.5, 0.35, 0.22, 0.12]);
  const SFX_GRADE = [
    { id: 'origine', name: 'Son d’origine', desc: 'Le son actuel : une charge qui monte, un souffle à l’éclatement, puis un petit accord et des scintillements.',
      play: (ac, out, t0) => {
        sfxRiser(ac, out, 110, 440, t0, 2.3, 0.18, 400, 3200); sfxRiser(ac, out, 165, 660, t0, 2.3, 0.12, 400, 3200);
        sfxHiss(ac, out, t0 + SFX_GU_HIT, 0.6, 0.7, 'lowpass', 6000, 300, 0.7, 0.002);
        sfxThump(ac, out, t0 + SFX_GU_HIT, 0.9, 120, 45, 0.5);
        [[3, 0], [7, 0.09], [10, 0.18], [15, 0.27]].forEach(([k, dt]) => { sfxTone(ac, out, 'triangle', sfxHz(k), t0 + 2.55 + dt, 1.6 - dt, 0.22, 0.04); sfxTone(ac, out, 'sine', sfxHz(k + 12), t0 + 2.55 + dt, 0.9 - dt / 2, 0.06, 0.03); });
        [2093, 2637, 3136, 2349, 2794].forEach((f, i) => sfxTone(ac, out, 'sine', f, t0 + 3.3 + i * 0.11, 0.35, 0.05, 0.02));
      } },
    { id: 'couronnement', name: 'Couronnement royal', desc: 'Roulement de timbales et cordes en trémolo qui montent, coup de cymbale à l’éclatement, puis une fanfare de cuivres et un chœur, comme un sacre.',
      play: (ac, out, t0) => {
        sfxRoll(ac, out, t0, t0 + SFX_GU_HIT - 0.04, 70, 0.55);
        sfxStrings(ac, out, [-21, -14, -9], t0, SFX_GU_HIT + 0.05, 0.05, 2.2, 13);
        sfxRiser(ac, out, 147, 587, t0 + 0.6, 1.75, 0.07, 500, 5000);
        sfxImpact(ac, out, t0 + SFX_GU_HIT, 0.9);
        // Fanfare (motif original) : deux appels brefs, puis l'accord de ré majeur tenu, basse et chœur.
        [[0, 0.16, [-7, 0]], [0.2, 0.16, [-7, 0]], [0.42, 2.4, [-7, -3, 0, 5, 9]]].forEach(([d, l, ch]) => {
          ch.forEach(k => sfxBrass(ac, out, sfxHz(k), t0 + SFX_GU_NEW + d, l, 0.055));
          sfxThump(ac, out, t0 + SFX_GU_NEW + d, 0.5, 98, 50, 0.3);
        });
        sfxBrass(ac, out, sfxHz(-19), t0 + SFX_GU_NEW + 0.42, 2.4, 0.07);
        sfxChoir(ac, out, [-7, -3, 0, 5], t0 + SFX_GU_NEW + 0.42, 2.8, 0.035, 0.3);
        sfxCymbal(ac, out, t0 + SFX_GU_NEW + 0.42, 0.12);
        sfxSparkle(ac, out, t0 + 3.2, t0 + 4.6, 9, 0.03, 2600);
      } },
    { id: 'celeste', name: 'Ascension céleste', desc: 'Un chœur qui s’élève et des clochettes qui accélèrent, un grand coup de cloche à l’éclatement, puis une harpe qui monte vers un accord lumineux.',
      play: (ac, out, t0) => {
        sfxChoir(ac, out, [-12, -5, 0], t0, SFX_GU_HIT + 0.05, 0.05, 2.0);
        [0, 7, 12].forEach((k, i) => sfxRiser(ac, out, sfxHz(k - 24), sfxHz(k - 12), t0 + 0.3 + i * 0.15, 2.0 - i * 0.15, 0.03, 600, 6000));
        for (let i = 0, t = 0.2; t < SFX_GU_HIT - 0.05; i++) { sfxBell(ac, out, sfxHz(15 + (i % 4) * 3), t0 + t, 0.3, 0.02 + 0.02 * t / SFX_GU_HIT, [1, 2.0], [1, 0.3]); t += 0.3 - 0.24 * t / SFX_GU_HIT; }
        sfxHiss(ac, out, t0 + SFX_GU_HIT - 0.6, 0.62, 0.08, 'highpass', 1500, 9000, 0.7, 0.55);
        sfxThump(ac, out, t0 + SFX_GU_HIT, 0.85, 80, 30, 1.0);
        sfxBell(ac, out, sfxHz(-9), t0 + SFX_GU_HIT, 3.6, 0.22, [1, 2.0, 3.0, 4.2, 5.4], [1, 0.6, 0.4, 0.22, 0.12]);
        sfxHiss(ac, out, t0 + SFX_GU_HIT, 0.7, 0.35, 'lowpass', 8000, 400, 0.7, 0.002);
        [3, 7, 10, 15, 19, 22, 27, 31].forEach((k, i) => sfxPluck(ac, out, sfxHz(k), t0 + SFX_GU_NEW + i * 0.06, 1.2, 0.07));
        sfxChoir(ac, out, [-9, -5, -2, 3], t0 + SFX_GU_NEW + 0.3, 3.0, 0.04, 0.35);
        sfxPad(ac, out, [-21, -9, -2, 7], t0 + SFX_GU_NEW + 0.3, 3.0, 0.03, 0.3);
        sfxSparkle(ac, out, t0 + 3.0, t0 + 4.8, 12, 0.03, 3000);
      } },
    { id: 'trailer', name: 'Impact de bande-annonce', desc: 'Une tension de film qui monte en sifflant avec des tic-tac de plus en plus rapides, un silence, un énorme impact grave, puis des cuivres héroïques.',
      play: (ac, out, t0) => {
        sfxHiss(ac, out, t0, SFX_GU_HIT - 0.12, 0.16, 'bandpass', 200, 7000, 3, SFX_GU_HIT - 0.2);
        sfxRiser(ac, out, 55, 440, t0, SFX_GU_HIT - 0.12, 0.12, 200, 6000);
        sfxRiser(ac, out, 82, 660, t0 + 0.4, SFX_GU_HIT - 0.52, 0.07, 200, 6000);
        for (let t = 0.1; t < SFX_GU_HIT - 0.15;) { const u = t / SFX_GU_HIT; sfxHiss(ac, out, t0 + t, 0.025, 0.05 + 0.15 * u, 'highpass', 3500, 0, 1, 0.001); sfxThump(ac, out, t0 + t, 0.08 + 0.3 * u, 60, 40, 0.1); t += 0.3 - 0.25 * u; }
        sfxImpact(ac, out, t0 + SFX_GU_HIT, 1);
        sfxThump(ac, out, t0 + SFX_GU_HIT + 0.02, 0.6, 50, 22, 1.6);
        // « Braam » : grappe de cuivres graves qui gronde, puis l'appel héroïque (motif original) qui monte.
        [-33, -26, -21, -14].forEach(k => sfxBrass(ac, out, sfxHz(k), t0 + SFX_GU_HIT, 2.0, 0.06));
        [[-2, 0, 0.14], [3, 0.16, 0.14], [5, 0.32, 0.14], [10, 0.5, 1.8]].forEach(([k, d, l]) => { sfxBrass(ac, out, sfxHz(k), t0 + SFX_GU_NAME - 0.1 + d, l, 0.06); sfxBrass(ac, out, sfxHz(k - 12), t0 + SFX_GU_NAME - 0.1 + d, l, 0.04); });
        sfxStrings(ac, out, [-14, -2, 2, 5], t0 + SFX_GU_NAME + 0.4, 2.0, 0.035, 0.3);
        sfxThump(ac, out, t0 + SFX_GU_NAME + 0.4, 0.6, 90, 40, 0.5);
        sfxCymbal(ac, out, t0 + SFX_GU_NAME + 0.4, 0.15);
      } },
    { id: 'arcade', name: 'Victoire arcade épique', desc: 'Des arpèges 8 bits qui montent de plus en plus vite, une explosion rétro, puis une fanfare de jeu vidéo avec basse et batterie.',
      play: (ac, out, t0) => {
        const arp = [0, 4, 7, 12];
        for (let i = 0, t = 0; t < SFX_GU_HIT - 0.05; i++) { const u = t / SFX_GU_HIT; sfxTone(ac, out, 'square', sfxHz(-12 + Math.floor(u * 18) + arp[i % 4]), t0 + t, 0.05, 0.02 + 0.025 * u, 0.002); t += 0.11 - 0.07 * u; }
        sfxRiser(ac, out, sfxHz(-36), sfxHz(-24), t0, SFX_GU_HIT - 0.05, 0.08, 200, 1200);
        for (let i = 0; i < 6; i++) sfxHiss(ac, out, t0 + SFX_GU_HIT + i * 0.07, 0.09, 0.5 - i * 0.07, 'lowpass', 3000 - i * 400, 300, 0.7, 0.002);
        sfxTone(ac, out, 'square', 220, t0 + SFX_GU_HIT, 0.5, 0.06, 0.002, 40);
        // Fanfare 8 bits (motif original) : mélodie en carré, basse en triangle, caisse claire en souffle.
        const mel = [[7, 0, 0.12], [7, 0.13, 0.12], [7, 0.26, 0.12], [12, 0.39, 0.35], [10, 0.78, 0.12], [12, 0.91, 0.12], [16, 1.04, 0.12], [19, 1.17, 1.0]];
        mel.forEach(([k, d, l]) => { sfxTone(ac, out, 'square', sfxHz(k), t0 + SFX_GU_NEW + d, l, 0.05, 0.003); sfxTone(ac, out, 'square', sfxHz(k - 5), t0 + SFX_GU_NEW + d, l, 0.025, 0.003); });
        [[-24, 0], [-24, 0.39], [-26, 0.78], [-17, 1.17]].forEach(([k, d], i) => sfxTone(ac, out, 'triangle', sfxHz(k), t0 + SFX_GU_NEW + d, i === 3 ? 1.0 : 0.36, 0.2, 0.003));
        [0, 0.39, 0.78, 1.04, 1.17].forEach(d => sfxHiss(ac, out, t0 + SFX_GU_NEW + d, 0.08, 0.12, 'highpass', 2000, 0, 0.8, 0.001));
        for (let i = 0; i < 12; i++) sfxTone(ac, out, 'square', sfxHz(19 + [0, 4, 7, 12][i % 4]), t0 + SFX_GU_NEW + 1.2 + i * 0.06, 0.05, 0.015, 0.002);
      } },
    { id: 'tonnerre', name: 'Tonnerre et gloire', desc: 'Un orage qui gronde et un cœur qui bat de plus en plus vite, un coup de tonnerre et de gong à l’éclatement, puis cuivres, cordes et chœur ensemble.',
      play: (ac, out, t0) => {
        sfxHiss(ac, out, t0, SFX_GU_HIT, 0.7, 'lowpass', 140, 320, 1, 1.4);
        sfxHiss(ac, out, t0 + 0.9, 1.0, 0.35, 'lowpass', 300, 120, 0.8, 0.08);
        for (let t = 0.15; t < SFX_GU_HIT - 0.1;) { const u = t / SFX_GU_HIT; sfxThump(ac, out, t0 + t, 0.25 + 0.4 * u, 75, 40, 0.16); sfxThump(ac, out, t0 + t + 0.14 - 0.06 * u, 0.15 + 0.3 * u, 70, 40, 0.14); t += 0.62 - 0.42 * u; }
        sfxStrings(ac, out, [-22, -21], t0 + 0.5, SFX_GU_HIT - 0.45, 0.04, 1.6, 14);
        // Éclair : craquement sec et aigu, puis le tonnerre qui roule.
        sfxHiss(ac, out, t0 + SFX_GU_HIT, 0.12, 0.8, 'highpass', 2500, 0, 0.7, 0.001);
        sfxHiss(ac, out, t0 + SFX_GU_HIT + 0.05, 1.6, 0.5, 'lowpass', 2500, 90, 0.8, 0.01);
        sfxThump(ac, out, t0 + SFX_GU_HIT, 0.9, 80, 26, 1.3);
        sfxGong(ac, out, 98, t0 + SFX_GU_HIT, 3.8, 0.14);
        [-17, -10, -5, -1, 2].forEach(k => sfxBrass(ac, out, sfxHz(k), t0 + SFX_GU_NEW + 0.1, 2.6, 0.05));
        sfxStrings(ac, out, [-5, -1, 2, 7], t0 + SFX_GU_NEW + 0.1, 2.8, 0.03, 0.25);
        sfxChoir(ac, out, [-5, -1, 2], t0 + SFX_GU_NEW + 0.3, 2.6, 0.035, 0.4);
        [0, 0.25, 0.5].forEach(d => sfxThump(ac, out, t0 + SFX_GU_NEW + 0.1 + d, 0.55, 100, 50, 0.35));
        sfxSparkle(ac, out, t0 + 3.4, t0 + 4.8, 8, 0.03, 2800);
      } }
  ];
  // Choix du porteur (2026-11-01, « garde-moi ce son pour le passage de grade : grade-4-impact-de-bande-annonce ») :
  // « Impact de bande-annonce ». Les autres restent pour essai seulement (?songrade=1 à 6, 0 = aucun).
  const SFX_GRADE_DEFAULT = 'trailer';
  // ——— Ouverture du Booster PK (games.js, gmOpenBooster ; animation pkmGmShake, pkmGmCut, games.css) ———
  // 2026-11-01, porteur : « propose-moi aussi des bruits lorsque l'on ouvre le booster, des bruits d'ouverture ».
  // Calés sur l'animation : le booster tremble (0 à 0,7 s), les ciseaux arrivent (0,9 s) et coupent le haut,
  // la déchirure avance (1,0 à 1,5 s), la bande s'envole (1,5 s), le booster tombe (1,65 à 2,15 s), puis
  // le gain apparaît (2,15 s). n = rang du gain (1 = 30 PK … 5 = 500 PK, depuis le 2026-11-01 au soir) : l'air final grandit avec le gain.
  // 3 propositions simples ; ?sonbooster=1 à 3 pour en essayer une (0 = aucun).
  const SFX_BO_FLY = 1.5, SFX_BO_WIN = 2.15;
  // Version simple et douce (même jour, porteur : « trop agressif pour les oreilles, fais un bruit plus simple ») : plus de
  // ciseaux qui claquent ni de froissement aigu ; tout reste sous 2 500 Hz, sauf une petite note claire au gain.
  // Déchirure feutrée : souffle grave qui enfle et retombe, sans grésillement.
  const sfxSoftTear = (ac, out, at, dur, vol) => sfxHiss(ac, out, at, dur, vol, 'bandpass', 500, 1400, 0.9, dur * 0.55);
  // « Pop » rond : sinus qui descend vite, comme un bouchon.
  const sfxPop = (ac, out, at, vol) => sfxTone(ac, out, 'sine', 420, at, 0.12, vol, 0.004, 160);
  const SFX_BOOSTER = [
    { id: 'doux', name: 'Déchirure douce', desc: 'Une déchirure feutrée pendant que les ciseaux coupent, un « pop » rond quand le gain apparaît, puis une ou plusieurs petites notes selon le gain.',
      play: (ac, out, t0, n) => {
        sfxSoftTear(ac, out, t0 + 1.0, 0.55, 0.12);
        sfxPop(ac, out, t0 + SFX_BO_WIN, 0.35);
        const k = Math.max(1, Math.min(5, n || 1));
        [3, 7, 10, 15, 19].slice(0, Math.min(5, k + 1)).forEach((d, i) => sfxTone(ac, out, 'sine', sfxHz(d + 12), t0 + SFX_BO_WIN + 0.08 + i * 0.09, i === k ? 0.9 : 0.4, 0.06, 0.01));
      } },
    { id: 'pop', name: 'Simple pop', desc: 'Le plus discret : un léger souffle quand la bande s’envole, puis un « pop » et une seule note claire au gain.',
      play: (ac, out, t0) => {
        sfxHiss(ac, out, t0 + SFX_BO_FLY, 0.35, 0.06, 'lowpass', 1500, 600, 0.7, 0.15);
        sfxPop(ac, out, t0 + SFX_BO_WIN, 0.35);
        sfxTone(ac, out, 'sine', sfxHz(15), t0 + SFX_BO_WIN + 0.08, 0.7, 0.06, 0.01);
      } },
    { id: 'carillon', name: 'Petit carillon', desc: 'Une déchirure feutrée, puis un petit carillon de boîte à musique au gain, un peu plus long quand le gain est gros.',
      play: (ac, out, t0, n) => {
        sfxSoftTear(ac, out, t0 + 1.0, 0.55, 0.1);
        const k = Math.max(1, Math.min(5, n || 1));
        [3, 7, 10, 15, 19, 22].slice(0, k + 1).forEach((d, i) => sfxTone(ac, out, 'triangle', sfxHz(d), t0 + SFX_BO_WIN + i * 0.1, i === k ? 1.0 : 0.5, 0.08, 0.004));
      } }
  ];
  // Choix du porteur (2026-11-01, « ok pour booster-v2-1-dechirure-douce ») : « Déchirure douce » ; les autres pour essai
  // seulement (?sonbooster=1 à 3, 0 = aucun).
  const SFX_BOOSTER_DEFAULT = 'doux';
  // ——— Premier déblocage d'un Pokémon (pk.js, pkUnlockShow ; animation pkmUnl*, games.css, 4 s) ———
  // 2026-11-01, porteur : « lorsque l'on déverrouille pour la première fois un Pokémon, propose-moi un bruit ».
  // Calés sur l'animation : le cadenas tremble (0 à 0,7 s), l'anse s'ouvre (0,7 à 1,3 s), le cadenas éclate (1,3 à
  // 1,7 s) et le Pokémon jaillit (1,32 s, posé à 2 s), son nom apparaît (1,6 à 2 s). 5 propositions ; ?sondeblocage=1
  // à 5 pour en essayer une (0 = aucun).
  const SFX_UL_OPEN = 0.72, SFX_UL_CLICK = 1.29, SFX_UL_POP = 1.32, SFX_UL_NAME = 1.6;
  // Version douce (même jour, porteur : « dans ce thème-là », celui de « Déchirure douce » du booster) : souffle feutré,
  // « clic » et « pop » ronds, petites notes de sinus ou de boîte à musique ; tout reste sous 2 500 Hz sauf les notes.
  // Clic doux de l'anse : coup sourd bref, sans claquement aigu.
  const sfxSoftClick = (ac, out, at, vol) => { sfxTone(ac, out, 'sine', 320, at, 0.06, vol, 0.002, 180); sfxHiss(ac, out, at, 0.03, vol * 0.25, 'lowpass', 1800, 0, 0.7, 0.001); };
  // Petites notes (sinus) qui montent, la dernière tenue.
  const sfxSoftNotes = (ac, out, at, notes, gap, vol, type) => notes.forEach((d, i) => sfxTone(ac, out, type || 'sine', sfxHz(d), at + i * gap, i === notes.length - 1 ? 1.0 : 0.4, vol, 0.01));
  const SFX_UNLOCK = [
    { id: 'clic', name: 'Clic doux', desc: 'Un « clic » feutré quand l’anse s’ouvre, un « pop » rond à l’éclatement, puis trois petites notes douces qui montent.',
      play: (ac, out, t0) => {
        sfxSoftClick(ac, out, t0 + SFX_UL_CLICK - 0.06, 0.3);
        sfxPop(ac, out, t0 + SFX_UL_POP, 0.35);
        sfxSoftNotes(ac, out, t0 + SFX_UL_POP + 0.1, [15, 19, 22].map(x => x + 12), 0.1, 0.06);
      } },
    { id: 'souffle', name: 'Souffle et pop', desc: 'Un souffle feutré qui enfle pendant que le cadenas tremble, un « pop » rond, puis une seule note claire et douce.',
      play: (ac, out, t0) => {
        sfxSoftTear(ac, out, t0 + 0.1, 1.2, 0.09);
        sfxPop(ac, out, t0 + SFX_UL_POP, 0.35);
        sfxTone(ac, out, 'sine', sfxHz(27), t0 + SFX_UL_POP + 0.1, 1.1, 0.06, 0.01);
        sfxTone(ac, out, 'sine', sfxHz(15), t0 + SFX_UL_POP + 0.1, 1.1, 0.03, 0.02);
      } },
    { id: 'carillon', name: 'Petit carillon', desc: 'Un « clic » feutré, un « pop », puis un petit carillon de boîte à musique (le même esprit que celui du booster).',
      play: (ac, out, t0) => {
        sfxSoftClick(ac, out, t0 + SFX_UL_CLICK - 0.06, 0.28);
        sfxPop(ac, out, t0 + SFX_UL_POP, 0.3);
        sfxSoftNotes(ac, out, t0 + SFX_UL_POP + 0.08, [3, 7, 10, 15, 19], 0.1, 0.08, 'triangle');
      } },
    { id: 'bulle', name: 'Bulle qui éclate', desc: 'Une bulle qui gonfle doucement pendant que l’anse s’ouvre, puis éclate en « pop » et laisse deux notes rondes.',
      play: (ac, out, t0) => {
        sfxTone(ac, out, 'sine', 180, t0 + SFX_UL_OPEN, SFX_UL_POP - SFX_UL_OPEN, 0.07, 0.5, 520);
        sfxPop(ac, out, t0 + SFX_UL_POP, 0.38);
        sfxSoftNotes(ac, out, t0 + SFX_UL_POP + 0.1, [22, 27], 0.14, 0.06);
      } },
    { id: 'clochette', name: 'Clochette', desc: 'Un « clic » feutré, un « pop », puis une clochette douce qui sonne deux fois, comme une bonne nouvelle.',
      play: (ac, out, t0) => {
        sfxSoftClick(ac, out, t0 + SFX_UL_CLICK - 0.06, 0.28);
        sfxPop(ac, out, t0 + SFX_UL_POP, 0.3);
        [0.1, 0.32].forEach((d, i) => sfxBell(ac, out, sfxHz(i ? 22 : 19), t0 + SFX_UL_POP + d, 1.0, 0.05, [1, 2.0], [1, 0.15]));
      } }
  ];
  // Choix du porteur (2026-11-01, « ok pour deblocage-v2-5-clochette ») : « Clochette » ; les autres pour essai seulement
  // (?sondeblocage=1 à 5, 0 = aucun).
  const SFX_UNLOCK_DEFAULT = 'clochette';
  // Choix du porteur (2026-11-01, « pa-2-gouttes-d-aura, je prends celui-là ») : « Gouttes d'aura ». Les autres restent
  // pour essai seulement (?sonpa=1 à 5).
  const SFX_PA_DEFAULT = 'gouttes';

  // ——— Safari éclair : bonne et mauvaise réponse, perte de PK (safari.js ; 2026-11-13, porteur : « un bruit de
  // satisfaction pour dire bonne réponse et un bruit "décevant" pour une mauvaise réponse, propose-moi des bruits
  // différents ») ———
  // Sons très courts (0,1 à 0,4 s) : ils se suivent vite pendant la partie, surtout en Difficile. 5 paires au choix ;
  // ?sonsafari=1 à 5 pour en essayer une (0 = aucun).
  const SFX_SF = [
    { id: 'cloche', name: 'Clochette et bourdon', desc: 'Bonne réponse : deux notes de clochette qui montent (« ding-ding »). Erreur : un petit bourdon grave et bref (« bzz »).',
      ok: (ac, out, t0) => { sfxBell(ac, out, sfxHz(19), t0, 0.35, 0.07, [1, 2.0, 3.01], [1, 0.3, 0.1]); sfxBell(ac, out, sfxHz(26), t0 + 0.07, 0.4, 0.07, [1, 2.0, 3.01], [1, 0.3, 0.1]); },
      ko: (ac, out, t0) => { sfxTone(ac, out, 'sawtooth', 110, t0, 0.22, 0.05, 0.005, 92); sfxTone(ac, out, 'square', 116, t0, 0.22, 0.025, 0.005, 96); } },
    { id: 'bulle', name: 'Bulle et plouf', desc: 'Bonne réponse : une bulle qui éclôt vers l’aigu (« bloop »). Erreur : une bulle qui retombe dans l’eau (« bloup », vers le grave).',
      ok: (ac, out, t0) => { sfxTone(ac, out, 'sine', 380, t0, 0.1, 0.2, 0.004, 1150); sfxTone(ac, out, 'sine', 900, t0 + 0.08, 0.08, 0.08, 0.003, 1700); },
      ko: (ac, out, t0) => { sfxTone(ac, out, 'sine', 520, t0, 0.2, 0.2, 0.004, 150); sfxHiss(ac, out, t0 + 0.05, 0.14, 0.05, 'lowpass', 900, 300, 0.7, 0.01); } },
    { id: 'arcade', name: 'Arcade', desc: 'Bonne réponse : une pièce de jeu rétro (deux notes rapides qui montent). Erreur : deux « bips » graves qui descendent.',
      ok: (ac, out, t0) => { sfxTone(ac, out, 'square', sfxHz(14), t0, 0.06, 0.04, 0.002); sfxTone(ac, out, 'square', sfxHz(19), t0 + 0.06, 0.16, 0.04, 0.002); },
      ko: (ac, out, t0) => { sfxTone(ac, out, 'square', sfxHz(-14), t0, 0.1, 0.04, 0.002); sfxTone(ac, out, 'square', sfxHz(-19), t0 + 0.12, 0.16, 0.04, 0.002); } },
    { id: 'cristal', name: 'Cristal et trombone', desc: 'Bonne réponse : un petit arpège de cristal, brillant. Erreur : un « wouah-wouah » de trombone triste, très court.',
      ok: (ac, out, t0) => [15, 19, 22].forEach((k, i) => sfxBell(ac, out, sfxHz(k + 12), t0 + i * 0.045, 0.4, 0.05, [1, 2.0, 3.0], [1, 0.25, 0.1])),
      ko: (ac, out, t0) => { sfxTone(ac, out, 'triangle', sfxHz(-7), t0, 0.16, 0.16, 0.01, sfxHz(-8)); sfxTone(ac, out, 'triangle', sfxHz(-9), t0 + 0.17, 0.26, 0.16, 0.01, sfxHz(-12)); } },
    { id: 'pop', name: 'Pop et toc', desc: 'Bonne réponse : un « pop » rond et un petit tintement. Erreur : un « toc » sourd, comme sur du bois.',
      ok: (ac, out, t0) => { sfxPop(ac, out, t0, 0.35); sfxBell(ac, out, sfxHz(24), t0 + 0.05, 0.3, 0.05, [1, 2.0], [1, 0.2]); },
      ko: (ac, out, t0) => { sfxTone(ac, out, 'sine', 190, t0, 0.09, 0.35, 0.002, 120); sfxHiss(ac, out, t0, 0.05, 0.12, 'bandpass', 700, 400, 2, 0.001); } }
  ];
  // Défaut (en attendant le choix du porteur) : « Clochette et bourdon ».
  const SFX_SF_DEFAULT = 'cloche';
  // Perte de PK à la fin d'une partie (pa.js, pkFlyLoss) : des gouttes qui tombent de plus en plus grave, puis un coup
  // sourd et une petite note qui descend, au rythme des gemmes qui quittent le solde.
  const sfxLossPlay = (ac, out, t0) => {
    for (let i = 0; i < 6; i++) sfxTone(ac, out, 'sine', 1100 - i * 120, t0 + 0.12 + i * 0.12, 0.09, 0.12, 0.002, (1100 - i * 120) * 0.6);
    sfxTone(ac, out, 'sine', 140, t0 + 0.9, 0.3, 0.3, 0.004, 70);
    sfxTone(ac, out, 'triangle', sfxHz(-5), t0 + 0.95, 0.5, 0.08, 0.02, sfxHz(-10));
  };
  // Choix du porteur (2026-11-01, « c'est ok pour 0-reference-suspense-et-lumiere ») : la musique « Suspense et
  // lumière » seule, sans son d'évolution par-dessus.
  const SFX_EVO_DEFAULT = null, SFX_MUSIC_DEFAULT = 'suspense';
  // Volume de chaque son, réglé sur son rendu : sons autour de −24 dBFS en moyenne, musiques autour de −27 dBFS (un peu
  // en dessous du son), crêtes sous −3 dBFS.
  const SFX_GAIN = { coin: 1, cristal: 1.23, energie: 1.07, retro: 3.2, cosmique: 1.03, harpe: 1.7, fanfare: 0.82, suspense: 1.23, chiptune: 1.84, boite: 1.82,
    cordes: 1.4, piano: 1.24, choeur: 2.75, orchestre: 0.87, nuit: 1.55,
    // PA du jour : crête vers −6 dBFS (petit son de récompense, plus bref que l'évolution).
    'pa-cristaux': 3.1, 'pa-gouttes': 2.7, 'pa-bulles': 2.6, 'pa-arcade': 3.1, 'pa-aura': 2.6,
    // Passage de grade : crête vers −3 dBFS (moment fort, plus présent que les autres sons).
    'bo-doux': 1.1, 'bo-pop': 1.1, 'bo-carillon': 2.6,
    'ul-clic': 1.1, 'ul-souffle': 1.1, 'ul-carillon': 1.25, 'ul-bulle': 1, 'ul-clochette': 1.25,
    // Safari éclair (sons courts, crête vers −6 dBFS, réglés sur leur rendu) et perte de PK.
    'sf-cloche-ok': 3.3, 'sf-cloche-ko': 7.9, 'sf-bulle-ok': 2.6, 'sf-bulle-ko': 2.5, 'sf-arcade-ok': 9.3, 'sf-arcade-ko': 9.9,
    'sf-cristal-ok': 3.8, 'sf-cristal-ko': 2.2, 'sf-pop-ok': 1.45, 'sf-pop-ko': 1.6, loss: 1.26,
    'gr-origine': 0.55, 'gr-couronnement': 0.45, 'gr-celeste': 0.5, 'gr-trailer': 0.45, 'gr-arcade': 1.5, 'gr-tonnerre': 0.45 };
  const SFX_MUSIC_LEVEL = 0.75;

  // Choix en cours : celui du porteur ; ?sonevo= / ?musevo= (numéro dans la liste, identifiant, ou 0 pour aucun) pour un
  // essai, le temps de la page. Les essais gardés sur l'appareil avant le choix du porteur sont effacés.
  try { localStorage.removeItem('pkm-evo-sfx'); localStorage.removeItem('pkm-evo-music'); } catch (e) { /* stockage indisponible */ }
  const sfxPick = (param, key, list, def) => {
    let v = '';
    try { v = (new RegExp('[?&]' + param + '=([\\w-]+)').exec(location.search) || [])[1] || ''; } catch (e) { v = ''; }
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
  function sfxSchedule(ac, dest, kind, id, t0, n) {
    if (kind === 'coin') { sfxCoin(ac, sfxBus(ac, dest, SFX_GAIN.coin), t0); return true; }
    if (kind === 'loss') { sfxLossPlay(ac, sfxBus(ac, dest, SFX_GAIN.loss), t0); return true; }
    if (kind === 'sfok' || kind === 'sfko') {
      const it = SFX_SF.find(x => x.id === id), side = kind === 'sfok' ? 'ok' : 'ko';
      if (!it) return false;
      it[side](ac, sfxBus(ac, dest, SFX_GAIN['sf-' + id + '-' + side] || 1), t0);
      return true;
    }
    const item = (kind === 'music' ? SFX_MUSIC : kind === 'pa' ? SFX_PA : kind === 'grade' ? SFX_GRADE : kind === 'booster' ? SFX_BOOSTER : kind === 'unlock' ? SFX_UNLOCK : SFX_EVO).find(x => x.id === id);
    if (!item) return false;
    item.play(ac, sfxBus(ac, dest, (SFX_GAIN[kind === 'pa' ? 'pa-' + id : kind === 'grade' ? 'gr-' + id : kind === 'booster' ? 'bo-' + id : kind === 'unlock' ? 'ul-' + id : id] || 1) * (kind === 'music' ? SFX_MUSIC_LEVEL : 1)), t0, Math.max(1, Math.min(14, n || 12)));
    return true;
  }
  let sfxAc = null;
  const sfxCtx = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!sfxAc) sfxAc = new AC();
    if (sfxAc.state !== 'running' && sfxAc.state !== 'closed') { try { const p = sfxAc.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* refusé hors d'un toucher */ } }
    return sfxAc;
  };
  // Déverrouillage du son (2026-11-08) : depuis que les jeux passent par le serveur, le son part à la réponse du serveur,
  // hors du toucher, et Safari (iPhone) laisse alors l'audio muet. On ouvre donc l'audio à chaque toucher, tant qu'il
  // n'est pas actif (un son vide d'un échantillon suffit à l'ouvrir sur les anciens iPhone), puis on ne fait plus rien.
  const sfxUnlockAudio = () => {
    try {
      if (sfxMuted() || (sfxAc && sfxAc.state === 'running')) return;
      const ac = sfxCtx();
      if (!ac) return;
      const b = ac.createBuffer(1, 1, 22050), src = ac.createBufferSource();
      src.buffer = b; src.connect(ac.destination); src.start(0);
    } catch (e) { /* son indisponible */ }
  };
  try { ['touchend', 'pointerdown', 'keydown'].forEach(t => document.addEventListener(t, sfxUnlockAudio, { capture: true, passive: true })); } catch (e) { /* pas de document */ }
  const sfxProto = Component.prototype;
  // Lancer de la pièce (games.js, gmFlip) : appelé au toucher, ce qui autorise le son.
  sfxProto.sfxCoin = function () {
    try { if (sfxMuted()) return; const ac = sfxCtx(); if (ac) sfxSchedule(ac, ac.destination, 'coin', '', ac.currentTime + 0.02); } catch (e) { /* son indisponible */ }
  };
  // Évolution (pa.js, paFxRun) : le son et la musique choisis, ensemble.
  // PA du jour (pa.js, paClaim) : n gouttes qui volent vers le solde ; appelé au toucher de « Récupérer mes PA ».
  sfxProto.sfxPa = function (n) {
    try {
      if (sfxMuted()) return;
      const ac = sfxCtx(), x = sfxPick('sonpa', '', SFX_PA, SFX_PA_DEFAULT);
      if (ac && x) sfxSchedule(ac, ac.destination, 'pa', x.id, ac.currentTime + 0.02, n);
    } catch (e) { /* son indisponible */ }
  };
  // Ouverture du Booster PK (games.js, gmOpenBooster) : n = rang du gain (1 à 5) ; appelé au toucher.
  sfxProto.sfxBooster = function (n) {
    try {
      if (sfxMuted()) return;
      const ac = sfxCtx(), x = sfxPick('sonbooster', '', SFX_BOOSTER, SFX_BOOSTER_DEFAULT);
      if (ac && x) sfxSchedule(ac, ac.destination, 'booster', x.id, ac.currentTime + 0.02, n);
    } catch (e) { /* son indisponible */ }
  };
  // Premier déblocage d'un Pokémon (pk.js, pkUnlockShow) : appelé au toucher (bouton du Pokédex).
  sfxProto.sfxUnlock = function () {
    try {
      if (sfxMuted()) return;
      const ac = sfxCtx(), x = sfxPick('sondeblocage', '', SFX_UNLOCK, SFX_UNLOCK_DEFAULT);
      if (ac && x) sfxSchedule(ac, ac.destination, 'unlock', x.id, ac.currentTime + 0.02);
    } catch (e) { /* son indisponible */ }
  };
  // Passage de grade (profile.js, pfGradeShow) : le son choisi, au début de l'animation.
  sfxProto.sfxGrade = function () {
    try {
      if (sfxMuted()) return;
      const ac = sfxCtx(), x = sfxPick('songrade', '', SFX_GRADE, SFX_GRADE_DEFAULT);
      if (ac && x) sfxSchedule(ac, ac.destination, 'grade', x.id, ac.currentTime + 0.05);
    } catch (e) { /* son indisponible */ }
  };
  // Safari éclair : bonne réponse (ok = true) ou erreur, au toucher d'un Pokémon.
  sfxProto.sfxSafari = function (ok) {
    try {
      if (sfxMuted()) return;
      const ac = sfxCtx(), x = sfxPick('sonsafari', '', SFX_SF, SFX_SF_DEFAULT);
      if (ac && x) sfxSchedule(ac, ac.destination, ok ? 'sfok' : 'sfko', x.id, ac.currentTime + 0.005);
    } catch (e) { /* son indisponible */ }
  };
  // Perte de PK (pa.js, pkFlyLoss).
  sfxProto.sfxLoss = function () {
    try { if (sfxMuted()) return; const ac = sfxCtx(); if (ac) sfxSchedule(ac, ac.destination, 'loss', '', ac.currentTime + 0.02); } catch (e) { /* son indisponible */ }
  };
  // Petit « plop » quand on rallume les sons (Réglages › Sons) : au toucher, ce qui ouvre aussi l'audio.
  sfxProto.sfxPop = function () {
    try { const ac = sfxCtx(); if (ac) sfxPop(ac, sfxBus(ac, ac.destination, 0.9), ac.currentTime + 0.02, 0.5); } catch (e) { /* son indisponible */ }
  };
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
    list.forEach(([kind, id, n]) => sfxSchedule(ac, dest, kind, id, 0.05, n));
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
  sfxProto.sfxLists = function () { return { evo: SFX_EVO.map(x => ({ id: x.id, name: x.name, desc: x.desc })), music: SFX_MUSIC.map(x => ({ id: x.id, name: x.name, desc: x.desc })), evoDef: SFX_EVO_DEFAULT, musicDef: SFX_MUSIC_DEFAULT,
    pa: SFX_PA.map(x => ({ id: x.id, name: x.name, desc: x.desc })), paDef: SFX_PA_DEFAULT,
    grade: SFX_GRADE.map(x => ({ id: x.id, name: x.name, desc: x.desc })), gradeDef: SFX_GRADE_DEFAULT,
    booster: SFX_BOOSTER.map(x => ({ id: x.id, name: x.name, desc: x.desc })), boosterDef: SFX_BOOSTER_DEFAULT,
    unlock: SFX_UNLOCK.map(x => ({ id: x.id, name: x.name, desc: x.desc })), unlockDef: SFX_UNLOCK_DEFAULT,
    safari: SFX_SF.map(x => ({ id: x.id, name: x.name, desc: x.desc })), safariDef: SFX_SF_DEFAULT }; };
