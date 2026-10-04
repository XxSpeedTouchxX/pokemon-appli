  // ——— Scan : calculs purs (testés par tools/web/test_scan.mjs) ———
  // Texte lu par l'OCR en bas (numéro) et en haut (nom) de la carte → cartes du catalogue (cards.json),
  // règle d'arrêt de la lecture continue, cadre de l'écran en pixels de la vidéo, préparation des bandes.
  const ScanCore = (function () {
    // Bandes lues, en fractions du cadre de la carte ; cap : hauteur des majuscules (pour l'agrandissement).
    // Le numéro est en bas à gauche depuis Épée et Bouclier, en bas à droite avant : toute la largeur.
    // Bandes larges en hauteur : la carte n'est jamais parfaitement dans le cadre.
    const BANDS = {
      name: { x0: 0.03, x1: 0.97, y0: 0, y1: 0.125, cap: 0.028, px: 36, min: 0.6, max: 2 },
      num: { x0: 0.02, x1: 0.98, y0: 0.86, y1: 1, cap: 0.0145, px: 36, min: 1, max: 3.5 }
    };
    // Promos : le préfixe imprimé (« SWSH123 », « SVP 045 ») remplace le total.
    const PROMO = { swshp: 'SWSH', smp: 'SM', xyp: 'XY', bwp: 'BW', hgssp: 'HGSS', dpp: 'DP', svp: 'SVP', mep: 'MEP' };
    // Numéros imprimés sur 3 chiffres (« 001/202 ») depuis Épée et Bouclier.
    const PADDED_FROM = '2020-02-07';
    // Confusions de l'OCR : lettre lue dans une suite de chiffres, chiffre lu dans un préfixe (TG, GG, SV…).
    const DIGIT = { O: '0', Q: '0', D: '0', U: '0', I: '1', L: '1', '|': '1', '!': '1', J: '1', Z: '2', S: '5', $: '5', G: '6', B: '8', T: '7' };
    const LETTER = { 0: 'O', 1: 'I', 2: 'Z', 5: 'S', 6: 'G', 7: 'T', 8: 'B' };
    const LANGS = ['FR', 'EN', 'DE', 'IT', 'ES', 'PT'];

    // Sans accents ni casse ni ponctuation ; décorations retirées (★ ◇ δ).
    const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ').trim();
    // Squelette pour comparer des noms lus : sans espaces, chiffres et paires de lettres souvent confondus.
    const skel = t => fold(t).replace(/ /g, '').replace(/rn/g, 'm').replace(/vv/g, 'w')
      .replace(/[015826]/g, c => ({ 0: 'o', 1: 'l', 5: 's', 8: 'b', 2: 'z', 6: 'g' })[c]);
    // Mentions qui accompagnent le nom sans en faire partie pour la comparaison de base.
    const SUFFIX = /(^| )(ex|gx|v|vmax|vstar|v union|break|prime|lv x|legend|star|tera|turbo)$/;
    const base = f => { let b = f.replace(/^(mega|m) /, ''); for (let k = 0; k < 2; k++) b = b.replace(SUFFIX, '').trim(); return b; };

    // Distance d'édition (Levenshtein), deux lignes.
    function lev(a, b) {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      let prev = new Array(b.length + 1), cur = new Array(b.length + 1);
      for (let j = 0; j <= b.length; j++) prev[j] = j;
      for (let i = 1; i <= a.length; i++) {
        cur[0] = i;
        for (let j = 1; j <= b.length; j++) {
          const c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        }
        const t = prev; prev = cur; cur = t;
      }
      return prev[b.length];
    }
    const ratio = (a, b) => (a.length || b.length ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0);
    // Ressemblance d'un nom lu (squelette s, base sb) et d'un nom du catalogue (n.s, n.b) : de 0 à 1.
    const simTo = (s, sb, n) => Math.max(ratio(s, n.s), sb && n.b ? 0.95 * ratio(sb, n.b) : 0);
    const trigrams = s => { const out = new Set(), t = '  ' + s + ' '; for (let i = 0; i + 3 <= t.length; i++) out.add(t.slice(i, i + 3)); return out; };

    // ——— Index du catalogue (une fois, à la première ouverture du scan) ———
    // doc : cards.json ({ fields, cards, sets }). Clés : « préfixe|numéro|total » (123/191, TG05/TG30),
    // promos « SWSH|123 », numéros seuls, totals → extensions, noms (squelettes et trigrammes).
    function index(doc) {
      const F = {};
      doc.fields.forEach((k, i) => { F[k] = i; });
      const rows = doc.cards, sets = doc.sets;
      const add = (m, k, v) => { const l = m.get(k); if (l) { if (l[l.length - 1] !== v) l.push(v); } else m.set(k, [v]); };
      const parts = rows.map(r => /^([A-Z]*)(\d+)$/.exec(String(r[F.num] || '')));
      const sub = new Map(), prefixes = new Set();
      parts.forEach((m, i) => { if (m && m[1]) { add(sub, rows[i][F.set] + '|' + m[1], i); prefixes.add(m[1]); } });
      Object.keys(PROMO).forEach(s => prefixes.add(PROMO[s]));
      const byKey = new Map(), byPromo = new Map(), byNum = new Map(), setsByTotal = new Map(), totals = new Set(), bySet = new Map();
      const names = [], nameAt = new Map(), rowName = new Int32Array(rows.length), tri = new Map();
      // Numéro et total imprimés de chaque carte (« |123 », « |191 », « TG|5 », « TG|30 ») : indices partiels.
      const rowN = new Array(rows.length).fill(''), rowT = new Array(rows.length).fill('');
      rows.forEach((r, i) => {
        const set = r[F.set], m = parts[i], f = fold(r[F.name]);
        let k = nameAt.get(f);
        if (k === undefined) {
          k = names.length; nameAt.set(f, k);
          const n = { f: f, s: skel(f), b: skel(base(f)), rows: [] };
          names.push(n);
          trigrams(n.s).forEach(t => add(tri, t, k));
        }
        rowName[i] = k; names[k].rows.push(i);
        add(bySet, set, i);
        if (!m) return;
        const pre = m[1], n = +m[2];
        add(byNum, pre + '|' + n, i);
        rowN[i] = pre + '|' + n;
        if (PROMO[set]) { add(byPromo, PROMO[set] + '|' + n, i); return; }
        const T = pre ? (sub.get(set + '|' + pre) || []).length : +((sets[set] || [])[4]) || 0;
        if (!T) return;
        rowT[i] = pre + '|' + T;
        add(byKey, pre + '|' + n + '|' + T, i);
        add(setsByTotal, pre + '|' + T, set);
        totals.add(pre + '|' + T);
      });
      const date = {};
      Object.keys(sets).forEach(s => { date[s] = sets[s][2] || ''; });
      return { F: F, rows: rows, sets: sets, date: date, byKey: byKey, byPromo: byPromo, byNum: byNum, setsByTotal: setsByTotal,
        totals: totals, bySet: bySet, names: names, rowName: rowName, rowN: rowN, rowT: rowT, tri: tri, prefixes: prefixes };
    }

    // ——— Lecture du numéro ———
    // Suite de chiffres avec confusions corrigées (O→0, I→1, S→5…) ; null si ce n'est pas un nombre.
    function digits(t) {
      let s = '', subs = 0;
      for (const c of t) {
        if (c >= '0' && c <= '9') s += c;
        else if (DIGIT[c]) { s += DIGIT[c]; subs++; } else return null;
      }
      return s && subs * 2 <= s.length ? { s: s, subs: subs } : null;
    }
    // « TG05 », « T605 » (6 lu pour G), « SWSH123 », « 123 » → { pre, s, subs }.
    function splitPre(tok, known) {
      for (let k = Math.min(4, tok.length - 1); k >= 1; k--) {
        const head = tok.slice(0, k), fixed = head.replace(/[0-9]/g, c => LETTER[c] || c);
        if (!/^[A-Z]+$/.test(fixed) || !known.has(fixed)) continue;
        const d = digits(tok.slice(k));
        if (d) return { pre: fixed, s: d.s, subs: d.subs + [...head].filter((c, i) => c !== fixed[i]).length };
      }
      const d = digits(tok);
      return d ? { pre: '', s: d.s, subs: d.subs } : null;
    }
    // Fin d'un mot avant « / » : le plus long suffixe lisible comme numéro (« HSSPFR238 » → 238, « XTG05 » → TG05).
    const tail = (L, known) => {
      for (let k = Math.min(L.length, 8); k >= 1; k--) { const p = splitPre(L.slice(-k), known); if (p && p.s.length <= 3) return p; }
      return null;
    };
    // Début d'un mot après « / » : le plus long préfixe lisible comme total (« 191★ », « TG30 », « 0912024 » → 091).
    const head = (R, known) => {
      for (let k = Math.min(R.length, 7); k >= 1; k--) { const p = splitPre(R.slice(0, k), known); if (p && p.s.length <= 3) return p; }
      return null;
    };
    const PROMOS = Object.keys(PROMO).map(k => PROMO[k]);
    // Texte de la bande du bas → indices : paires numéro/total, promos, totaux seuls, numéros seuls, langue.
    // L'OCR colle souvent les mots (« GSSPFR123/191 ») : on lit la fin du mot avant la barre et le début après.
    // q : confiance de 0 à 1 (corrections et coupures la font baisser).
    function parseNumber(text, idx) {
      const known = (idx && idx.prefixes) || new Set(['TG', 'GG', 'SV', 'RC', 'H'].concat(PROMOS));
      const out = { pairs: [], promos: [], totals: [], nums: [], lang: null };
      const T = String(text || '').toUpperCase().replace(/[⁄∕／\\]/g, '/').replace(/\s*\/\s*/g, '/');
      const toks = T.split(/[^A-Z0-9/|!$]+/).filter(Boolean);
      const addPair = (a, b, q, from) => {
        if (!a || !b || (b.pre && a.pre && b.pre !== a.pre)) return false;
        const n = +a.s, t = +b.s, pre = a.pre || b.pre;
        if (!(n >= 1 && n <= 999 && t >= 2 && t <= 999)) return false;
        // pad : numéro imprimé sur 3 chiffres (« 045 ») ; inconnu au-delà de 99 et pour les sous-séries.
        out.pairs.push({ pre: pre, n: n, T: t, s: a.s, ts: b.s, q: q * Math.max(0.5, 1 - 0.05 * (a.subs + b.subs)),
          pad: pre || n >= 100 ? null : a.s.length === 3, from: from });
        return true;
      };
      toks.forEach(tok => {
        if (LANGS.indexOf(tok) >= 0) { if (!out.lang) out.lang = tok; return; }
        // Langue collée au numéro (« SSPFR123/191 », « SVPFR045 »).
        const lg = /(FR|EN|DE|IT|ES|PT)(?=[0-9OIL]{2,3}(\/|$))/.exec(tok);
        if (lg && !out.lang) out.lang = lg[1];
        const sl = tok.lastIndexOf('/');
        if (sl >= 0) {
          const L = tok.slice(0, sl), R = tok.slice(sl + 1), a = L ? tail(L, known) : null, b = R ? head(R, known) : null;
          if (a && b) addPair(a, b, 1, 'slash');
          else if (!L && b) out.totals.push({ pre: b.pre, T: +b.s, q: 0.8 });
          return;
        }
        // Promos : « SWSH123 », « SM45 », « SVP FR 045 » (même collé : « GSVPFR045 ») ; « SWH045 » pour SWSH.
        const pm = /([A-Z0-9]*?)([A-Z]{2,6})([0-9OIL]{2,3})$/.exec(tok);
        if (pm) {
          const letters = pm[2].replace(/(FR|EN|DE|IT|ES|PT)$/, ''), d = digits(pm[3]);
          const exact = PROMOS.find(p => letters.slice(-p.length) === p);
          const fuzzy = exact || PROMOS.find(p => p.length === 4 && [3, 4, 5].some(k => letters.length >= k && lev(letters.slice(-k), p) <= 1));
          if (fuzzy && d && +d.s > 0) { out.promos.push({ pre: fuzzy, n: +d.s, s: d.s, q: (exact ? 1 : 0.85) * Math.max(0.5, 1 - 0.05 * d.subs) }); return; }
        }
        const spr = splitPre(tok, known);
        if (spr && spr.pre && PROMOS.indexOf(spr.pre) >= 0 && spr.s.length <= 3 && +spr.s > 0) { out.promos.push({ pre: spr.pre, n: +spr.s, s: spr.s, q: Math.max(0.5, 1 - 0.05 * spr.subs) }); return; }
        // « SVP » ou « MEP » seul : le numéro suit (« SVP EN 045 »).
        const fixed = tok.replace(/[0-9]/g, c => LETTER[c] || c);
        if (/(SVP|MEP)$/.test(fixed)) { out.promoNext = fixed.slice(-3); return; }
        if (out.promoNext) {
          const d = digits(tok);
          if (d && d.s.length === 3 && +d.s > 0) { out.promos.push({ pre: out.promoNext, n: +d.s, s: d.s, q: 0.95 }); out.promoNext = null; return; }
        }
        // Fin du mot en chiffres : « / » perdu ou lu comme 1, 7, I, L (« 1231191 », « 123191 »), pas une année (« ©2024 »).
        const run = ((/[0-9|!LI]+$/.exec(tok) || [''])[0]).replace(/^[|!LI]+/, ''), d = digits(run);
        if (d && d.s.length >= 4 && d.s.length <= 7 && !/^(19|20)\d\d$/.test(d.s)) {
          let found = false;
          for (let p = 1; p <= 3; p++) {
            const mid = run[p], R = run.slice(p + 1), R0 = run.slice(p), a = splitPre(run.slice(0, p), known);
            if ('/|LI!17'.indexOf(mid) >= 0 && R.length >= 2 && R.length <= 3) found = addPair(a, splitPre(R, known), mid === '1' || mid === '7' ? 0.75 : 0.85, 'lost') || found;
            if (R0.length >= 2 && R0.length <= 3) found = addPair(a, splitPre(R0, known), 0.6, 'lost') || found;
          }
          if (found) return;
        }
        // Numéro seul sur 3 chiffres (« 045 ») : indice faible, utile avec le nom.
        if (d && d.s.length === 3 && d.s[0] === '0' && +d.s > 0) out.nums.push({ pre: '', n: +d.s, q: 0.5, pad: true });
      });
      delete out.promoNext;
      // Une même paire lue plusieurs fois : la meilleure confiance.
      const seen = new Map();
      out.pairs.forEach(p => { const k = p.pre + '|' + p.n + '|' + p.T, o = seen.get(k); if (!o || o.q < p.q) seen.set(k, p); });
      out.pairs = [...seen.values()].sort((a, b) => b.q - a.q);
      return out;
    }

    // ——— Lecture du nom ———
    // Mentions en tête de ligne (stade, type de carte) et fin « Évolution de … » retirées ; PV et nombres retirés.
    const LEAD = /^(de base|base|basic|niveau [12]|niveau|stage [12]|stage|dresseur|trainer|supporter|objet|item|stade|stadium|outil pokemon|pokemon tool|outil)( |$)/;
    const TAIL = /(^| )(evolution de|evolue de|evolves from|evolue|evolution)( .*)?$/;
    // Texte de la bande du haut → morceaux de 1 à 6 mots consécutifs à comparer aux noms du catalogue (24 au plus).
    // k : mots du morceau ; K : mots de sa ligne (un morceau plus court que sa ligne est un peu pénalisé,
    // pour préférer « Dracaufeu ex » à « Dracaufeu » quand les deux mots sont lus).
    function parseName(text) {
      const out = new Map();
      String(text || '').split(/\n+/).forEach(line => {
        let f = fold(line).replace(TAIL, '');
        for (let k = 0; k < 2; k++) f = f.replace(LEAD, '');
        const w = f.split(' ').filter(t => t && !/\d/.test(t) && t !== 'pv' && t !== 'hp');
        for (let a = 0; a < w.length; a++) {
          for (let b = a + 1; b <= Math.min(w.length, a + 6); b++) {
            const t = w.slice(a, b).join(' '), o = out.get(t), K = Math.min(w.length, 6);
            if (t.replace(/ /g, '').length >= 3 && (!o || K - (b - a) < o.K - o.k)) out.set(t, { t: t, k: b - a, K: K });
          }
        }
      });
      return [...out.values()].sort((a, b) => b.t.length - a.t.length).slice(0, 24);
    }

    // ——— Rapprochement ———
    // read : { num, name } (texte des deux bandes). Résultat : indices lus et cartes classées (5 au plus).
    // Score : numéro et nom à parts égales ; nom seul plafonné à 0,5 (jamais d'arrêt automatique).
    function match(idx, read) {
      const num = parseNumber(read && read.num, idx);
      const W = parseName(read && read.name).map(w => ({ t: w.t, s: skel(w.t), b: skel(base(w.t)), pen: Math.min(0.12, 0.04 * (w.K - w.k)) }));
      const simName = n => { let best = 0; for (const w of W) best = Math.max(best, simTo(w.s, w.b, n) - w.pen); return Math.max(0, best); };
      const nameEvOf = i => simName(idx.names[idx.rowName[i]]);
      const cand = new Map(), put = (i, ev, pad) => { const c = cand.get(i); if (!c || c.numEv < ev) cand.set(i, { i: i, numEv: ev, pad: pad }); };
      let numText = null;
      num.pairs.forEach(p => {
        const rows = idx.byKey.get(p.pre + '|' + p.n + '|' + p.T);
        if (rows) { rows.forEach(i => put(i, p.q, p.pad)); if (!numText) numText = p.pre + p.s + '/' + p.pre + p.ts; } else if (p.from === 'slash') {
          // Paire lue avec sa barre mais inconnue du catalogue : total et numéro gardés comme indices faibles.
          num.totals.push({ pre: p.pre, T: p.T, q: p.q * 0.5 });
          num.nums.push({ pre: p.pre, n: p.n, q: p.q * 0.5, pad: p.pad });
        }
      });
      num.promos.forEach(p => {
        const rows = idx.byPromo.get(p.pre + '|' + p.n);
        if (rows) { rows.forEach(i => put(i, p.q, null)); if (!numText) numText = p.pre + (p.pre.length === 3 ? ' ' : '') + p.s; }
      });
      if (W.length) {
        num.totals.forEach(t => (idx.setsByTotal.get(t.pre + '|' + t.T) || []).forEach(s => {
          (idx.bySet.get(s) || []).forEach(i => { if (nameEvOf(i) >= 0.6) put(i, 0.55 * t.q, null); });
        }));
        num.nums.forEach(t => (idx.byNum.get(t.pre + '|' + t.n) || []).forEach(i => { if (nameEvOf(i) >= 0.6) put(i, 0.4 * t.q, t.pad); }));
        // Noms proches (trigrammes, puis distance d'édition). Numéro absent ou faible : tous ceux à 0,72 et plus ;
        // numéro sûr : seulement un nom presque exact (utile si le numéro a été mal lu), 6 éditions au plus.
        let maxNum = 0;
        cand.forEach(c => { maxNum = Math.max(maxNum, c.numEv); });
        const votes = new Map(), floor = maxNum < 0.8 ? 0.72 : 0.85;
        W.forEach(w => trigrams(w.s).forEach(t => (idx.tri.get(t) || []).forEach(k => votes.set(k, (votes.get(k) || 0) + 1))));
        [...votes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).forEach(([k]) => {
          const n = idx.names[k];
          if (simName(n) < floor) return;
          const rows = maxNum < 0.8 ? n.rows : n.rows.slice().sort((a, b) => (idx.date[idx.rows[b][idx.F.set]] || '').localeCompare(idx.date[idx.rows[a][idx.F.set]] || '')).slice(0, 6);
          rows.forEach(i => { if (!cand.has(i)) cand.set(i, { i: i, numEv: 0, pad: null }); });
        });
      }
      // Paire lue avec sa barre mais dont une moitié est fausse (« 123/197 » pour 123/191) : une carte retenue par son
      // nom qui a le même numéro (ou le même total) reçoit un indice partiel.
      const readN = new Map(), readT = new Map();
      num.pairs.forEach(p => {
        if (p.from !== 'slash') return;
        readN.set(p.pre + '|' + p.n, Math.max(readN.get(p.pre + '|' + p.n) || 0, p.q));
        readT.set(p.pre + '|' + p.T, Math.max(readT.get(p.pre + '|' + p.T) || 0, p.q));
      });
      if (readN.size) cand.forEach(c => {
        const qn = readN.get(idx.rowN[c.i]), qt = readT.get(idx.rowT[c.i]);
        if (qn) c.numEv = Math.max(c.numEv, 0.6 * qn);
        else if (qt) c.numEv = Math.max(c.numEv, 0.5 * qt);
      });
      const F = idx.F, list = [];
      cand.forEach(c => {
        const r = idx.rows[c.i], set = r[F.set], d = idx.date[set] || '';
        const nameEv = W.length ? nameEvOf(c.i) : 0;
        let score;
        if (c.numEv > 0) {
          const padOk = c.pad === null || c.pad === undefined ? 0 : (c.pad === (d >= PADDED_FROM) ? 0.03 : 0);
          score = 0.5 * c.numEv + 0.5 * nameEv + padOk;
        } else {
          const rec = Math.max(0, Math.min(1, ((+d.slice(0, 4) || 1999) - 1999) / 27));
          score = Math.min(0.5, 0.45 * nameEv + 0.05 * rec);
        }
        list.push({ i: c.i, id: r[F.id], score: Math.round(score * 1000) / 1000, numEv: c.numEv, nameEv: Math.round(nameEv * 1000) / 1000, date: d });
      });
      list.sort((a, b) => b.score - a.score || b.numEv - a.numEv || (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      const top = [], ids = new Set();
      for (const c of list) { if (!ids.has(c.id)) { ids.add(c.id); top.push(c); } if (top.length === 5) break; }
      // Moins de 3 cartes et un nom sûr : les autres éditions du même nom, des plus récentes aux plus anciennes.
      if (top.length && top.length < 3 && top[0].nameEv >= 0.7) {
        idx.names[idx.rowName[top[0].i]].rows.map(i => ({ i: i, id: idx.rows[i][F.id], date: idx.date[idx.rows[i][F.set]] || '' }))
          .filter(c => !ids.has(c.id)).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3 - top.length)
          .forEach(c => { ids.add(c.id); top.push({ i: c.i, id: c.id, score: Math.round(top[0].score * 500) / 1000, numEv: 0, nameEv: top[0].nameEv, date: c.date }); });
      }
      // Indices affichés : numéro reconnu, nom de la carte en tête s'il a bien été lu, langue imprimée.
      const name = top.length && top[0].nameEv >= 0.6 ? idx.rows[top[0].i][F.name] : null;
      return { ev: { num: numText, name: name, lang: num.lang }, cands: top };
    }

    // ——— Lecture continue : quand s'arrêter ———
    // frames : résultats successifs (cands), le plus récent en dernier. Les indices s'additionnent sur les
    // 8 dernières lectures (poids 0,8 par lecture d'écart).
    //  - « auto » : carte nettement en tête (numéro et nom), déjà en tête à la lecture précédente ou très sûre ;
    //  - « ask » : après 6 lectures, assez d'indices pour proposer ;
    //  - « wait » : continuer.
    function decide(frames) {
      const last = frames.slice(-8), acc = new Map();
      last.forEach((f, k) => { const w = Math.pow(0.8, last.length - 1 - k); f.forEach(c => acc.set(c.id, (acc.get(c.id) || 0) + c.score * w)); });
      const order = [...acc.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
      const cur = frames[frames.length - 1] || [], top = cur[0], second = cur[1];
      const prev = frames.length > 1 ? frames[frames.length - 2][0] : null;
      if (top && top.score >= 0.85 && top.numEv >= 0.85 && top.nameEv >= 0.7 && (!second || top.score - second.score >= 0.12)
        && ((prev && prev.id === top.id) || top.score >= 0.93)) {
        return { state: 'auto', ids: [top.id].concat(order.filter(id => id !== top.id)).slice(0, 3) };
      }
      if (frames.length >= 6 && order.length && acc.get(order[0]) >= 1.2) return { state: 'ask', ids: order.slice(0, 3) };
      return { state: 'wait', ids: order.slice(0, 3) };
    }

    // ——— Géométrie ———
    // Cadre affiché (r, relatif à la vidéo à l'écran el) → rectangle dans les pixels de la vidéo v,
    // pour une vidéo affichée en « object-fit: cover ».
    function coverMap(el, v, r) {
      const s = Math.max(el.w / v.w, el.h / v.h), ox = (el.w - v.w * s) / 2, oy = (el.h - v.h * s) / 2;
      const x0 = Math.max(0, (r.x - ox) / s), y0 = Math.max(0, (r.y - oy) / s);
      const x1 = Math.min(v.w, (r.x + r.w - ox) / s), y1 = Math.min(v.h, (r.y + r.h - oy) / s);
      return { sx: x0, sy: y0, sw: Math.max(0, x1 - x0), sh: Math.max(0, y1 - y0) };
    }
    // Bande d'une carte (rect : rectangle de la carte dans l'image) et agrandissement pour ~36 px par caractère.
    function bandRect(rect, kind) {
      const b = BANDS[kind], h = rect.sh;
      return { x: rect.sx + rect.sw * b.x0, y: rect.sy + h * b.y0, w: rect.sw * (b.x1 - b.x0), h: h * (b.y1 - b.y0),
        scale: Math.max(b.min, Math.min(b.max, b.px / Math.max(1, b.cap * h))) };
    }

    // ——— Préparation d'une bande ———
    // img : { data (RGBA), width, height }. Niveaux de gris, contraste étiré (1 % – 99 %), inversion si le
    // texte est clair sur fond sombre (plus de 55 % de pixels sombres, seuil d'Otsu) ; opts.invert force le choix.
    function prep(img, opts) {
      const o = opts || {}, n = img.width * img.height, src = img.data, g = new Uint8Array(n), hist = new Uint32Array(256);
      for (let i = 0, j = 0; i < n; i++, j += 4) { const y = (299 * src[j] + 587 * src[j + 1] + 114 * src[j + 2]) / 1000 | 0; g[i] = y; hist[y]++; }
      let lo = 0, hi = 255, c = 0;
      for (; lo < 255 && (c += hist[lo]) < n * 0.01; lo++);
      c = 0;
      for (; hi > 0 && (c += hist[hi]) < n * 0.01; hi--);
      if (hi - lo < 16) { lo = 0; hi = 255; }
      // Seuil d'Otsu.
      let sum = 0, sumB = 0, wB = 0, best = -1, t = 128;
      for (let v = 0; v < 256; v++) sum += v * hist[v];
      for (let v = 0; v < 256; v++) {
        wB += hist[v];
        if (!wB) continue;
        const wF = n - wB;
        if (!wF) break;
        sumB += v * hist[v];
        const mB = sumB / wB, mF = (sum - sumB) / wF, between = wB * wF * (mB - mF) * (mB - mF);
        if (between > best) { best = between; t = v; }
      }
      let darkN = 0;
      for (let v = 0; v <= t; v++) darkN += hist[v];
      const dark = n ? darkN / n : 0, invert = typeof o.invert === 'boolean' ? o.invert : dark > 0.55;
      const out = new Uint8ClampedArray(n * 4), k = 255 / (hi - lo);
      for (let i = 0, j = 0; i < n; i++, j += 4) {
        let v = (g[i] - lo) * k;
        v = v < 0 ? 0 : v > 255 ? 255 : v;
        if (invert) v = 255 - v;
        out[j] = out[j + 1] = out[j + 2] = v; out[j + 3] = 255;
      }
      return { data: out, width: img.width, height: img.height, inverted: invert, dark: Math.round(dark * 100) / 100 };
    }

    return { BANDS: BANDS, fold: fold, skel: skel, lev: lev, index: index, parseNumber: parseNumber, parseName: parseName,
      match: match, decide: decide, coverMap: coverMap, bandRect: bandRect, prep: prep };
  })();
