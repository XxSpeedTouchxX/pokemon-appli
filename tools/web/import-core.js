  // ——— Import d'un tableur : calculs purs (testés par tools/web/test_import.mjs) ; 2026-10-09, C1 ———
  // Fichier CSV (export Dropicards, tableur personnel, autre application) → lignes normalisées → articles du catalogue.
  // Séparateur deviné (« ; », « , », tabulation), guillemets, BOM ; colonnes reconnues par leur titre (français ou
  // anglais) ; rapprochement par extension et numéro, sinon par l'index du scan (numéro et nom), sinon produit scellé
  // par son nom. Chaque ligne finit « reconnue », « à vérifier » (3 propositions) ou « non reconnue ».
  const ImportCore = (function () {
    const fold = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    // CSV : séparateur le plus fréquent hors guillemets sur la première ligne ; lignes vides retirées.
    function parse(text) {
      const src = String(text || '').replace(/^﻿/, '');
      const first = src.split(/\r?\n/)[0] || '';
      let sep = ';', best = -1;
      [';', ',', '\t'].forEach(c => { let n = 0, q = false; for (const ch of first) { if (ch === '"') q = !q; else if (ch === c && !q) n++; } if (n > best) { best = n; sep = c; } });
      const rows = [];
      let row = [], cell = '', q = false;
      for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (q) {
          if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch;
        } else if (ch === '"' && cell === '') q = true;
        else if (ch === sep) { row.push(cell); cell = ''; }
        else if (ch === '\n' || ch === '\r') { if (ch === '\r' && src[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
        else cell += ch;
      }
      if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
      const clean = rows.map(r => r.map(c => c.trim())).filter(r => r.some(c => c !== ''));
      return { sep: sep, head: clean[0] || [], rows: clean.slice(1) };
    }

    // Champs attendus et titres de colonnes reconnus (comparés sans accents ni casse).
    const FIELDS = [
      ['name', 'Nom', ['article', 'nom', 'nom de la carte', 'carte', 'name', 'card', 'card name', 'produit', 'product', 'pokemon']],
      ['set', 'Extension', ['extension', 'serie', 'set', 'set name', 'edition', 'expansion', 'bloc']],
      ['num', 'Numéro', ['numero', 'num', 'no', 'n', 'number', 'card number', 'n carte', 'numero de carte', 'collector number']],
      ['detail', 'Détail', ['detail', 'details', 'description', 'info']],
      ['qty', 'Quantité', ['quantite', 'qte', 'qty', 'quantity', 'nombre', 'nb', 'count', 'exemplaires']],
      ['price', 'Prix payé', ['prix paye', 'prix paye e', 'prix d achat', 'prix achat', 'prix', 'purchase price', 'price paid', 'cost', 'cout', 'paid']],
      ['lang', 'Langue', ['langue', 'language', 'lang', 'langage']],
      ['cond', 'État', ['etat', 'condition', 'cond', 'state', 'qualite']],
      ['date', 'Date', ['date', 'date d achat', 'date achat', 'purchase date', 'ajoute le', 'added']],
      ['type', 'Type', ['type', 'categorie', 'category', 'kind']]
    ];
    function guess(head) {
      const map = {}, used = new Set(), h = head.map(fold);
      FIELDS.forEach(([k, , names]) => {
        let at = h.findIndex((t, i) => !used.has(i) && names.indexOf(t) >= 0);
        if (at < 0) at = h.findIndex((t, i) => !used.has(i) && t && names.some(n => n.length > 3 && t.indexOf(n) === 0));
        map[k] = at;
        if (at >= 0) used.add(at);
      });
      return map;
    }

    // Valeurs : montants à la française ou à l'anglaise, langue, état, date.
    function money(t) {
      let s = String(t || '').replace(/[€$£\s  ]/g, '');
      if (!s) return null;
      if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); else s = s.replace(/,/g, '');
      const n = Number(s);
      return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
    }
    function lang(t) {
      const f = fold(t);
      if (!f) return '';
      if (/^(en|eng|anglais|english|us|uk)$/.test(f) || f.indexOf('angl') === 0 || f.indexOf('engl') === 0) return 'EN';
      if (/^(jp|ja|jap|japonais|japanese)$/.test(f) || f.indexOf('japan') === 0 || f.indexOf('japo') === 0) return 'JP';
      if (/^(fr|fra|francais|french)$/.test(f) || f.indexOf('fran') === 0 || f.indexOf('fren') === 0) return 'FR';
      return '';
    }
    function cond(t, sealed) {
      const f = fold(t);
      if (sealed) return /abim|damag|dent|cabos|ouvert/.test(f) ? 'AB' : 'SO';
      if (!f) return '';
      // Six états depuis le 2026-10-22 : Mint, Near Mint, Excellent, Good, Played, Poor.
      if (/^(m|mt|mint|gem mint|neuf|parfait)$/.test(f)) return 'MT';
      if (/^(nm|near mint|comme neuf|excellent plus)$/.test(f) || f.indexOf('near') === 0 || f.indexOf('mint') === 0) return 'NM';
      if (/^(ex|exc|excellent|lp|light played|lightly played|tres bon|tb)$/.test(f) || f.indexOf('excel') === 0 || f.indexOf('light') === 0) return 'EX';
      if (/^(gd|good|bon|b|mp|moderately played)$/.test(f) || f.indexOf('moder') === 0) return 'GD';
      if (/^(po|poor|dmg|damaged|abime|abimee|mauvais|mauvais etat)$/.test(f) || /poor|damag|abim/.test(f)) return 'PO';
      if (/^(pl|hp|played|heavily played|joue|jouee)$/.test(f) || /play|jou/.test(f)) return 'PL';
      if (/scelle|sealed|neuf sous blister/.test(f)) return 'NM';
      return '';
    }
    function date(t) {
      const s = String(t || '').trim();
      let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
      if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
      m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/.exec(s);
      if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; return y + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0'); }
      return '';
    }
    const SEALED_WORDS = /\b(etb|elite trainer|coffret|display|booster box|bundle|tin|pokebox|blister|tripack|tri pack|upc|ultra premium|collection premium|mini tin|portfolio|booster)\b/;
    // Numéro imprimé trouvé dans un texte (« 199/165 », « TG05/TG30 », « SWSH045 »).
    const NUM_IN = /\b([A-Z]{0,4}\s?\d{1,3}\s?\/\s?[A-Z]{0,4}\s?\d{1,3})\b|\b((?:SWSH|SVP|SM|XY|BW|MEP)\s?\d{1,3})\b/i;
    function norm(cells, map) {
      const get = k => (map[k] >= 0 && map[k] < cells.length ? cells[map[k]] : '');
      const name = get('name'), detail = get('detail'), type = fold(get('type'));
      let num = get('num');
      if (!num) { const m = NUM_IN.exec(detail) || NUM_IN.exec(name); if (m) num = (m[1] || m[2]).replace(/\s/g, ''); }
      const sealed = /scelle|sealed|produit/.test(type) || (!/carte|card/.test(type) && SEALED_WORDS.test(fold(name)));
      const q = parseInt(String(get('qty')).replace(/[^\d]/g, ''), 10);
      return {
        name: name.replace(NUM_IN, '').trim() || name, num: num, set: get('set') || (detail.split(' · ').length > 1 ? detail : ''),
        qty: q >= 1 && q <= 999 ? q : 1, price: money(get('price')), lang: lang(get('lang')), cond: cond(get('cond'), sealed),
        date: date(get('date')), sealed: sealed, raw: cells.filter(Boolean).join(' · ')
      };
    }

    // ——— Rapprochement ———
    const ratio = (a, b) => { if (!a || !b) return 0; if (a === b) return 1; const L = Math.max(a.length, b.length); return 1 - ScanCore.lev(a, b) / L; };
    const nameSim = (a, b) => { const x = fold(a), y = fold(b); if (!x || !y) return 0; if (x === y) return 1; if ((' ' + y + ' ').indexOf(' ' + x + ' ') >= 0 || (' ' + x + ' ').indexOf(' ' + y + ' ') >= 0) return 0.9; return ratio(x, y); };
    const numKey = t => { const m = /^([A-Z]*)\s*0*(\d+)/.exec(String(t || '').toUpperCase().replace(/\s/g, '')); return m ? m[1] + '|' + m[2] : ''; };
    // Extension désignée : code (« sv03 »), nom exact, ou nom contenu dans le texte (le plus long l'emporte).
    function setOf(text, idx) {
      const f = fold(text);
      if (!f) return '';
      const codes = Object.keys(idx.sets);
      const code = codes.find(c => fold(c).replace(/ /g, '') === f.replace(/ /g, ''));
      if (code) return code;
      let best = '', len = 0;
      codes.forEach(c => { const n = fold(idx.sets[c][0]); if (n && (n === f || (n.length > 3 && (' ' + f + ' ').indexOf(' ' + n + ' ') >= 0)) && n.length > len) { best = c; len = n.length; } });
      return best;
    }
    // r : ligne normalisée ; idx : index du scan (ScanCore.index) ; sealed : [{ id, name }].
    function match(r, idx, sealed) {
      const out = new Map(), F = idx.F;
      const put = (id, sc) => { if (!out.has(id) || out.get(id) < sc) out.set(id, sc); };
      if (!r.sealed && idx) {
        const set = setOf(r.set, idx), nk = numKey(String(r.num).split('/')[0]);
        if (set) (idx.bySet.get(set) || []).forEach(i => {
          const row = idx.rows[i], numOk = nk && numKey(row[F.num]) === nk, ns = r.name ? nameSim(r.name, row[F.name]) : 0;
          const sc = numOk ? (r.name ? 0.55 + 0.45 * ns : 0.9) : (ns >= 0.85 ? 0.6 * ns : 0);
          if (sc >= 0.5) put(row[F.id], sc);
        });
        if (!out.size || Math.max(...out.values()) < 0.85) {
          const m = ScanCore.match(idx, { num: r.num, name: r.name });
          m.cands.forEach(c => { const row = idx.rows[c.i]; put(c.id, Math.min(0.95, c.score + (set && row[F.set] === set ? 0.25 : 0) + (r.name && fold(row[F.name]) === fold(r.name) && c.numEv > 0 ? 0.05 : 0))); });
        }
      }
      if (r.sealed || !out.size) (sealed || []).forEach(p => { const sc = nameSim(r.name, p.name); if (sc >= 0.6) put(p.id, r.sealed ? sc : sc * 0.8); });
      const list = [...out.entries()].sort((a, b) => b[1] - a[1]);
      if (!list.length) return { state: 'none', ids: [], score: 0 };
      const top = list[0][1], second = list[1] ? list[1][1] : 0;
      return { state: top >= 0.85 && top - second >= 0.1 ? 'ok' : 'ask', ids: list.slice(0, 3).map(x => x[0]), score: Math.round(top * 1000) / 1000 };
    }

    return { FIELDS: FIELDS, fold: fold, parse: parse, guess: guess, money: money, lang: lang, cond: cond, date: date, norm: norm, setOf: setOf, match: match };
  })();
