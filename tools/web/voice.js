  // ——— Voix du didacticiel (2026-10-28, demande du porteur) ———
  // Plusieurs voix au choix pour le starter qui parle dans le didacticiel (tuto.js). Toutes sont fabriquées dans le
  // navigateur avec Web Audio : aucun fichier son, aucun service extérieur, aucun son repris d'un jeu.
  // - voicePlay(ac, out, id, mon, ch, i) est appelé pour chaque caractère écrit (ch, à la position i de la phrase) ; la
  //   voix décide seule si elle joue : à chaque lettre, une lettre sur deux, ou au début de chaque syllabe (voyelle).
  //   Jamais sur les espaces ni la ponctuation. Quelques nœuds par son, arrêtés en moins de 150 ms, enveloppes de
  //   volume sans claquement, crête autour de −12 dBFS pour toutes les voix (VOICE_GAIN).
  // - Chaque starter a sa personnalité : Pikachu aigu et vif, Bulbizarre grave et posé, Salamèche plus brillant,
  //   Carapuce plus rond (VOICE_MON).
  // - « Voix parlée du téléphone » (tts) : la synthèse vocale française de l'appareil lit la phrase entière
  //   (voiceSpeak, voiceStop) ; voicePlay ne joue rien pour elle. Sur iPhone, la première lecture doit suivre un toucher.
  // Le tirage « au hasard » (hauteur de chaque lettre) est calculé à partir de la lettre : la même phrase sonne
  // toujours pareil.
  const VOICE_LIST = [
    { id: 'babil', name: 'Babillage façon Animal Crossing', desc: 'Un charabia chantant : chaque lettre devient une petite voyelle, comme un personnage qui marmonne gaiement.' },
    { id: 'cri', name: 'Petit cri de Pokémon', desc: 'Un pépiement mignon qui grimpe vers l’aigu à chaque syllabe, avec un léger trémolo.' },
    { id: 'retro', name: 'Bip rétro', desc: 'Le bip des jeux 8 bits : une note carrée, nette et régulière, une lettre sur deux.' },
    { id: 'bulles', name: 'Bulles douces', desc: 'De petites bulles rondes et feutrées, sur une gamme qui chante.' },
    { id: 'pokedex', name: 'Voix du Pokédex', desc: 'Une voix de robot métallique, presque monocorde, comme une encyclopédie électronique.' },
    { id: 'carillon', name: 'Carillon magique', desc: 'Des clochettes cristallines qui scintillent à chaque syllabe.' },
    { id: 'tts', name: 'Voix parlée du téléphone', desc: 'La voix française du téléphone lit vraiment la phrase ; le rendu dépend de l’appareil.', tts: true }
  ];
  // Voix par défaut : « Bulles douces », choisie par le porteur parmi les 7 propositions.
  const VOICE_DEFAULT = 'bulles'; // choisie par le porteur le 2026-10-28 (voix 4)
  // Personnalité de chaque starter : p hauteur, f formants (petite bouche = plus aigus), b brillance, v vivacité,
  // w forme d'onde du petit cri, t réglages de la voix parlée [hauteur, débit].
  const VOICE_MON = {
    1: { p: 0.76, f: 0.9, b: 0.8, v: 0.6, w: 'triangle', t: [0.8, 0.95] },
    4: { p: 1, f: 1.05, b: 1.15, v: 1, w: 'sawtooth', t: [1.1, 1.05] },
    7: { p: 0.92, f: 0.97, b: 0.9, v: 0.8, w: 'triangle', t: [1.2, 1] },
    25: { p: 1.3, f: 1.15, b: 1.1, v: 1.3, w: 'square', t: [1.6, 1.1] }
  };
  // Volume de chaque voix : crête entre −9 et −14 dBFS et même volume ressenti (moyenne sur 50 ms entre −20 et −27 dBFS),
  // mesurés sur la première phrase du didacticiel ; formes d'onde riches un peu baissées.
  const VOICE_GAIN = { babil: 0.68, cri: 0.37, retro: 0.175, bulles: 0.25, pokedex: 0.27, carillon: 0.25 };
  const VOICE_WAVE = { sine: 1, triangle: 0.72, square: 0.5, sawtooth: 0.72 };
  // Formants (F1, F2 en Hz) des voyelles françaises ; chaque lettre prend la voyelle de son nom (« bé », « èf », « ka »…).
  const VOICE_FORMANT = { a: [760, 1350], e: [400, 2000], è: [560, 1780], i: [290, 2250], o: [460, 880], u: [300, 1750], ou: [320, 800], eu: [420, 1450] };
  const VOICE_SAY = { a: 'a', b: 'e', c: 'e', d: 'e', e: 'eu', f: 'è', g: 'e', h: 'a', i: 'i', j: 'i', k: 'a', l: 'è', m: 'è', n: 'è', o: 'o',
    p: 'e', q: 'u', r: 'è', s: 'è', t: 'e', u: 'u', v: 'e', w: 'ou', x: 'i', y: 'i', z: 'è', é: 'e', è: 'è', ê: 'è', ë: 'è', œ: 'eu', æ: 'è' };
  const VOICE_PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
  const VOICE_LETTER = /[0-9A-Za-zÀ-ÿŒœÆæ]/;
  const VOICE_VOWEL = /[aeiouyàâäéèêëîïôöùûüÿœæ]/i;
  // Fil de la phrase en cours (remis à zéro quand i vaut 0) : caractère précédent, lettres et syllabes comptées.
  let voicePrev = '', voiceLetters = 0, voiceSylls = 0;

  const voiceSemi = n => Math.pow(2, n / 12);
  const voiceHash = (ch, i) => (Math.imul(ch.charCodeAt(0) + 31, 2654435761) ^ Math.imul(i + 7, 40503)) >>> 0;
  const voiceVowelOf = ch => {
    const c = ch.toLowerCase();
    if (VOICE_SAY[c]) return VOICE_SAY[c];
    const n = c.normalize ? c.normalize('NFD').replace(/[̀-ͯ]/g, '') : c;
    return VOICE_SAY[n] || 'a';
  };
  // Enveloppe « percussive » : montée rapide, puis descente jusqu'au silence à t + dur (pas de claquement).
  const voiceEnv = (g, t, peak, att, dur) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  };
  // Enveloppe « tenue » (voix de robot) : montée, palier, relâche courte.
  const voiceHold = (g, t, peak, att, dur, rel) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + att);
    g.gain.setValueAtTime(peak, t + dur - rel);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  };
  // Onde d'impulsion 8 bits (rapport cyclique 25 %), créée une fois par contexte audio.
  const voicePulses = new WeakMap();
  const voicePulse = ac => {
    let w = voicePulses.get(ac);
    if (w) return w;
    const n = 40, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    w = ac.createPeriodicWave(re, im);
    voicePulses.set(ac, w);
    return w;
  };
  const voiceEnd = (src, nodes) => { src.onended = () => { nodes.forEach(n => { try { n.disconnect(); } catch (e) { /* déjà débranché */ } }); }; };

  // Chaque voix : (ac, sortie, starter, lettre, position, syllabe ?, instant). Rien n'est joué si la voix saute la lettre.
  const VOICE_SYNTH = {
    // Babillage : une lettre sur deux devient une voyelle (source en dents de scie filtrée par deux formants), avec
    // une petite chute de hauteur par syllabe et une mélodie lente sur la phrase.
    babil: (ac, out, m, ch, i, syl, t) => {
      if (voiceLetters % 2 === 0) return;
      const v = VOICE_FORMANT[voiceVowelOf(ch)], h = voiceHash(ch, 0);
      const f0 = 190 * m.p * voiceSemi((h % 7) - 3 + 2.2 * Math.sin(i * 0.21));
      const o = ac.createOscillator(), b1 = ac.createBiquadFilter(), b2 = ac.createBiquadFilter(), g2 = ac.createGain(), g = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0 * (1 + 0.07 * m.v), t);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.94, t + 0.07);
      b1.type = 'bandpass'; b1.frequency.value = v[0] * m.f; b1.Q.value = 5;
      b2.type = 'bandpass'; b2.frequency.value = v[1] * m.f; b2.Q.value = 8;
      g2.gain.value = 0.7;
      o.connect(b1); o.connect(b2); b1.connect(g); b2.connect(g2); g2.connect(g); g.connect(out);
      voiceEnv(g, t, VOICE_GAIN.babil / Math.sqrt(m.p), 0.008, 0.08); // voix grave : moins d'harmoniques dans les formants
      voiceEnd(o, [o, b1, b2, g2, g]);
      o.start(t); o.stop(t + 0.09);
    },
    // Petit cri : à chaque syllabe, une note qui glisse vite vers l'aigu puis retombe un peu, avec un trémolo rapide.
    cri: (ac, out, m, ch, i, syl, t) => {
      if (!syl) return;
      const f = 540 * m.p * voiceSemi((voiceHash(ch, i) % 5) - 2);
      const o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), lp = ac.createBiquadFilter(), g = ac.createGain();
      o.type = m.w;
      o.frequency.setValueAtTime(f * 0.7, t);
      o.frequency.exponentialRampToValueAtTime(f * (1.4 + 0.12 * m.v), t + 0.03);
      o.frequency.exponentialRampToValueAtTime(f * 1.12, t + 0.11);
      lfo.frequency.value = 22 + 8 * m.v; lg.gain.value = f * 0.035;
      lfo.connect(lg); lg.connect(o.frequency);
      lp.type = 'lowpass'; lp.frequency.value = 2600 * m.b; lp.Q.value = 1.5;
      o.connect(lp); lp.connect(g); g.connect(out);
      voiceEnv(g, t, VOICE_GAIN.cri * (VOICE_WAVE[m.w] || 1), 0.006, 0.12);
      voiceEnd(o, [o, lfo, lg, lp, g]);
      o.start(t); lfo.start(t); o.stop(t + 0.13); lfo.stop(t + 0.13);
    },
    // Bip rétro : une impulsion carrée 8 bits, une lettre sur deux, presque à hauteur fixe (un demi-ton de jeu).
    retro: (ac, out, m, ch, i, syl, t) => {
      if (voiceLetters % 2 === 0) return;
      const f = 470 * m.p * (voiceHash(ch, 0) % 3 === 0 ? voiceSemi(1) : 1);
      const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
      o.setPeriodicWave(voicePulse(ac)); o.frequency.value = f;
      lp.type = 'lowpass'; lp.frequency.value = 3800 * m.b;
      o.connect(lp); lp.connect(g); g.connect(out);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(VOICE_GAIN.retro, t + 0.003);
      g.gain.setValueAtTime(VOICE_GAIN.retro, t + 0.038);
      g.gain.linearRampToValueAtTime(0, t + 0.05);
      voiceEnd(o, [o, lp, g]);
      o.start(t); o.stop(t + 0.055);
    },
    // Bulles douces : une sinusoïde qui monte très vite (le « plop » d'une bulle), notes d'une gamme pentatonique.
    bulles: (ac, out, m, ch, i, syl, t) => {
      if (voiceLetters % 2 === 0) return;
      const f = 360 * m.p * voiceSemi(VOICE_PENTA[voiceHash(ch, 0) % 6]);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * (1.7 + 0.15 * m.v), t + 0.05);
      o.connect(g); g.connect(out);
      voiceEnv(g, t, VOICE_GAIN.bulles, 0.005, 0.085);
      voiceEnd(o, [o, g]);
      o.start(t); o.stop(t + 0.095);
    },
    // Voix du Pokédex : onde carrée grave, modulée en anneau par une sinusoïde (timbre métallique), filtrée en bande,
    // sur trois hauteurs seulement ; son tenu puis coupé net, comme un robot.
    pokedex: (ac, out, m, ch, i, syl, t) => {
      if (voiceLetters % 2 === 0) return;
      const f = 130 * m.p * voiceSemi([0, 0, 3, 7][voiceHash(ch, 0) % 4]);
      const o = ac.createOscillator(), mod = ac.createOscillator(), rg = ac.createGain(), bp = ac.createBiquadFilter(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = f;
      mod.type = 'sine'; mod.frequency.value = 610 * m.f;
      rg.gain.value = 0; mod.connect(rg.gain);
      bp.type = 'bandpass'; bp.frequency.value = 1500 * m.b; bp.Q.value = 1.1;
      o.connect(rg); rg.connect(bp); bp.connect(g); g.connect(out);
      voiceHold(g, t, VOICE_GAIN.pokedex, 0.004, 0.058, 0.012);
      voiceEnd(o, [o, mod, rg, bp, g]);
      o.start(t); mod.start(t); o.stop(t + 0.065); mod.stop(t + 0.065);
    },
    // Carillon magique : clochette en synthèse FM (rapport 1:3,5), une note pentatonique aiguë par syllabe.
    carillon: (ac, out, m, ch, i, syl, t) => {
      if (!syl) return;
      const f = 700 * m.p * voiceSemi(VOICE_PENTA[(voiceSylls * 3 + voiceHash(ch, 0)) % 8]);
      const c = ac.createOscillator(), mod = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
      c.type = 'sine'; c.frequency.value = f;
      mod.type = 'sine'; mod.frequency.value = f * 3.5;
      mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.12);
      mod.connect(mg); mg.connect(c.frequency); c.connect(g); g.connect(out);
      voiceEnv(g, t, VOICE_GAIN.carillon, 0.003, 0.14);
      voiceEnd(c, [c, mod, mg, g]);
      c.start(t); mod.start(t); c.stop(t + 0.145); mod.stop(t + 0.145);
    }
  };

  // Son du caractère ch (position i) sur le contexte ac, branché sur out, avec la voix id et le starter mon.
  function voicePlay(ac, out, id, mon, ch, i) {
    try {
      if (!ac || !out || typeof ch !== 'string' || !ch) return;
      if (!i) { voicePrev = ''; voiceLetters = 0; voiceSylls = 0; }
      const prev = voicePrev;
      voicePrev = ch;
      if (!VOICE_LETTER.test(ch)) return;
      voiceLetters++;
      const digit = /[0-9]/.test(ch);
      const syl = digit ? !/[0-9]/.test(prev) : VOICE_VOWEL.test(ch) && !VOICE_VOWEL.test(prev);
      if (syl) voiceSylls++;
      const synth = VOICE_SYNTH[id];
      if (!synth) return;
      synth(ac, out, VOICE_MON[mon] || VOICE_MON[25], ch, i, syl, ac.currentTime + 0.002);
    } catch (e) { /* son indisponible */ }
  }

  // Voix parlée du téléphone : lit la phrase entière (la précédente est coupée). Rien si l'appareil ne sait pas faire.
  function voiceSpeak(text, mon) {
    try {
      const s = window.speechSynthesis, U = window.SpeechSynthesisUtterance;
      if (!s || !U || !text) return;
      s.cancel();
      const u = new U(String(text)), set = (VOICE_MON[mon] || VOICE_MON[25]).t;
      u.lang = 'fr-FR'; u.pitch = set[0]; u.rate = set[1]; u.volume = 1;
      const fr = (s.getVoices ? s.getVoices() : []).filter(v => /^fr([-_]|$)/i.test(v.lang || ''));
      const best = fr.find(v => /^fr[-_]FR/i.test(v.lang) && v.localService) || fr.find(v => /^fr[-_]FR/i.test(v.lang)) || fr[0];
      if (best) u.voice = best;
      s.speak(u);
    } catch (e) { /* synthèse vocale indisponible */ }
  }
  function voiceStop() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* rien */ }
  }
