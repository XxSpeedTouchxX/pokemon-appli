// Contraste des textes (thème v6) : pour chaque texte visible, pire contraste avec les fonds réels qu'il
// recouvre (couleurs et dégradés des éléments parents composés jusqu'au fond de l'app). Textes sur photo ignorés.
import { unlockPaid, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const BASE = process.env.BASE || E2E + '/';
const QS = process.env.QS || '';
const browser = await launch();
const stub = (w, h, c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`;
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, geolocation: { latitude: 45.764, longitude: 4.8357 }, permissions: ['geolocation'] });
await ctx.route('https://assets.tcgdex.net/**', r => r.fulfill({ contentType: 'image/svg+xml', body: stub(300, 300, '#8EC5FC') }));
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg/, r => r.abort());
// PA du jour (2026-10-28) : ils ne sont plus crédités à l'ouverture ; tant qu'ils attendent, un message reste affiché
// en bas de l'écran. Ici, ils sont marqués comme déjà récupérés aujourd'hui (date de l'adresse ou du jour), sauf avec
// « e2epa=1 » dans l'adresse (états « PA du jour à récupérer » et « Tes PA du jour », jamais récupérés).
await ctx.addInitScript(() => {
  try {
    const k = 'pkm-collection-v1', raw = localStorage.getItem(k); if (!raw) return;
    const d = JSON.parse(raw), q = new URLSearchParams(location.search), t = q.get('today'), n = new Date();
    if (q.get('e2epa') === '1') { d.paDay = ''; d.paStreak = 0; } else {
      const a = d.admin || {};
      d.paDay = /^\d{4}-\d{2}-\d{2}$/.test(t || '') ? t : a.on && /^\d{4}-\d{2}-\d{2}$/.test(a.today || '') ? a.today : n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
      d.paStreak = Math.max(1, Number(d.paStreak) || 0);
    }
    localStorage.setItem(k, JSON.stringify(d));
  } catch (e) { /* stockage indisponible */ }
});
const page = await ctx.newPage();
// Pokédex (2026-10-28) : le compagnon de l'accueil ouvre l'onglet Jeux sur le Pokédex ; un Pokémon se choisit depuis
// « Tous les Pokémon » (recherche, grille), puis sa fiche.
const dexPick = async (name) => {
  await page.click('button[aria-label^="Compagnon"]'); await page.waitForSelector('section[aria-label="Pokédex"]', { timeout: 10000 }); await page.waitForTimeout(700);
  // Sans starter, le Pokédex propose d'abord les 4 starters : Pikachu (compagnon par défaut).
  const st = page.locator('[aria-label="Starters"] button[aria-label="Choisir Pikachu comme starter"]');
  if (await st.count()) { await st.click(); await page.waitForTimeout(900); }
  await page.click('.pkm-dex-all'); await page.waitForSelector('section[aria-label="Mon Pokédex"]'); await page.waitForTimeout(300);
  await page.fill('section[aria-label="Mon Pokédex"] input[aria-label="Chercher un Pokémon"]', name); await page.waitForTimeout(300);
  await page.locator('section[aria-label="Mon Pokédex"] button[aria-label*=", n° "]').first().click(); await page.waitForTimeout(700);
};
// BUDDY=Kyogre (ou Groudon, Rayquaza) : compagnon choisi d'abord, donc thème appliqué à tous les écrans.
if (process.env.BUDDY) {
  await page.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1500); await unlockPaid(page);
  await dexPick(process.env.BUDDY);
  const act = page.locator('section[aria-label="Fiche du Pokémon"] .pkm-dex-act-btn');
  if (/Choisir comme compagnon/.test(await act.textContent())) await act.click();
  await page.waitForTimeout(800);
  console.log('thème : ' + await page.evaluate(() => document.documentElement.className));
}
const audit = () => page.evaluate(() => {
  const parse = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (top, bot) => { const a = top.a + bot.a * (1 - top.a); if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }; const mix = k => (top[k] * top.a + bot[k] * bot.a * (1 - top.a)) / a; return { r: mix('r'), g: mix('g'), b: mix('b'), a: a }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  // Fonds possibles derrière un élément (du plus haut au plus bas), composés de bas en haut.
  const backs = el => {
    const layers = [];
    // Un fond opaque (couleur, ou dégradé linéaire du dessous aux couleurs opaques) cache ceux des parents ; les
    // dégradés translucides posés dessus sont alors composés sur lui (et non sur les parents).
    const split = bi => { const out = []; let depth = 0, start = 0; for (let i = 0; i < bi.length; i++) { const ch = bi[i]; if (ch === '(') depth++; else if (ch === ')') depth--; else if (ch === ',' && depth === 0) { out.push(bi.slice(start, i)); start = i + 1; } } out.push(bi.slice(start)); return out; };
    const stopsOf = g => [...g.matchAll(/rgba?\([^)]*\)/g)].map(m => parse(m[0]));
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e), bi = cs.backgroundImage, bc = parse(cs.backgroundColor);
      let opaque = !!(bc && bc.a === 1);
      if (bi && bi !== 'none') {
        if (/url\(/.test(bi)) return null;
        const parts = split(bi), bottom = stopsOf(parts[parts.length - 1]);
        if (/^\s*(repeating-)?linear-gradient/.test(parts[parts.length - 1]) && bottom.length && bottom.every(c => c.a === 1)) {
          const upper = parts.slice(0, -1).flatMap(stopsOf);
          if (upper.length) layers.push(upper.concat([{ r: 0, g: 0, b: 0, a: 0 }]));
          layers.push(bottom);
          opaque = true;
        } else {
          layers.push(stopsOf(bi));
          if (bc && bc.a > 0) layers.push([bc]); // la couleur de fond est peinte sous le dégradé
        }
      } else if (bc && bc.a > 0) layers.push([bc]);
      if (opaque) break;
      if (e.tagName === 'IMG') return null;
    }
    let cands = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let i = layers.length - 1; i >= 0; i--) {
      const next = [];
      for (const c of cands) for (const s of layers[i]) next.push(over(s, c));
      const seen = new Set();
      cands = next.filter(c => { const k = [c.r, c.g, c.b].map(Math.round).join(','); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 40);
    }
    return cands;
  };
  // Texte posé sur une image (photo, carte) : ignoré.
  const onImage = el => { const r = el.getBoundingClientRect(); return [...document.querySelectorAll('#app img')].some(i => { const q = i.getBoundingClientRect(); return q.width > 30 && r.left >= q.left - 1 && r.right <= q.right + 1 && r.top >= q.top - 1 && r.bottom <= q.bottom + 1 && i.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING; }); };
  const out = [];
  const walker = document.createTreeWalker(document.querySelector('#app'), NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement, r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if (el.closest('svg') || el.closest('[aria-hidden="true"]') && el.closest('section[aria-label="Carte des magasins"]')) continue;
    // Visible (pas recouvert par la barre du bas ou une fiche).
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + Math.min(6, r.width / 2))), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const hit = document.elementFromPoint(x, y);
    if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) continue;
    if (onImage(el)) continue;
    let fg = parse(cs.color); if (!fg) continue;
    const bgs = backs(el); if (!bgs) continue;
    let op = 1; for (let e = el; e && e.id !== 'app'; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    let worst = 99, worstBg = null;
    for (const b of bgs) { const f = over({ r: fg.r, g: fg.g, b: fg.b, a: fg.a * op }, b); const k = ratio(f, b); if (k < worst) { worst = k; worstBg = b; } }
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (worst < need) out.push({ text: n.textContent.trim().slice(0, 40), ratio: +worst.toFixed(2), need: need, color: cs.color, bg: worstBg && [worstBg.r, worstBg.g, worstBg.b].map(Math.round).join(',') });
  }
  return out;
});
const screens = [['accueil', ''], ['collection', '?start=collection'], ['recherche', '?start=search'], ['jeux', '?start=market'], ['fiche-etb', '?start=item&itemId=p2'], ['fiche-carte', '?start=item&itemId=k1'],
  ['territoire', '?start=territory'], ['magasin', '?start=store&storeId=s2'], ['scelle', '?start=sealed'], ['profil', '?start=profile'], ['paliers', '?start=tiers'], ['reglages', '?start=settings'],
  ['ventes', '?start=sales'], ['extensions', '?start=sets'], ['extension', '?start=set&setId=sv08'], ['scan', '?start=scan'], ['bienvenue', '?onb=1'], ['novice', '?demo=novice'], ['avance', '?adv=1&start=profile'], ['sorties', '?today=2026-10-04&start=releases'], ['boutique', '?start=shop&shopId=' + (process.env.SHOP || '')]];
let total = 0;
const report = [];
for (const [name, url] of screens) {
  await page.goto('about:blank'); await page.goto(BASE + url + (QS ? (url.includes('?') ? '&' : '?') + QS : ''), { waitUntil: 'load' }); await page.waitForTimeout(1100);
  const h = await page.evaluate(() => { const m = document.querySelector('#app main'); return m ? m.scrollHeight - m.clientHeight : 0; });
  const seen = new Set();
  for (let y = 0; y <= Math.min(h, 4200); y += 600) {
    await page.evaluate(y => { const m = document.querySelector('#app main'); if (m) m.scrollTop = y; }, y);
    await page.waitForTimeout(150);
    for (const f of await audit()) { const k = f.text + f.color; if (!seen.has(k)) { seen.add(k); report.push(name + ' · « ' + f.text + ' » ' + f.ratio + ' < ' + f.need + ' (texte ' + f.color + ' sur ' + f.bg + ')'); total++; } }
  }
}
// États ouverts : fiches, scan, Radar, zoom, toast ; nombre d'éléments floutés.
const states = {
  'fiche Ajouter': async () => { await page.goto(BASE + '?start=item&itemId=k1'); await page.waitForTimeout(900); await page.click('button:has-text("Ajouter")'); },
  'résultat du scan': async () => { await page.goto(BASE + '?start=scan'); await page.waitForTimeout(900); await page.click('button:has-text("Scellé")'); await page.click('[aria-label="Produits scellés"] button'); },
  'toast': async () => { await page.goto(BASE + '?start=scan'); await page.waitForTimeout(900); await page.click('button:has-text("Scellé")'); await page.click('[aria-label="Produits scellés"] button'); await page.click('button:has-text("Ajouter à ma collection")'); },
  'scan : onglet Scellé': async () => { await page.goto(BASE + '?start=scan'); await page.waitForTimeout(900); await page.click('button:has-text("Scellé")'); await page.waitForTimeout(400); },
  'scan : carte reconnue (photo importée)': async () => { await page.goto(BASE + '?start=scan'); await page.waitForTimeout(900); await page.setInputFiles('#pkm-scan-file', ROOT + 'tools/web/e2e/files/photo-tg05.jpg'); await page.waitForSelector('section[aria-label="C’est laquelle ?"], section[aria-label="Résultat du scan"]', { timeout: 60000 }); await page.waitForTimeout(300); },
  'zoom': async () => { await page.goto(BASE + '?start=item&itemId=k1'); await page.waitForTimeout(900); await page.click('button[aria-label^="Agrandir la carte"]'); },
  'radar': async () => { await page.goto(BASE + '#radar'); await page.waitForTimeout(3500); },
  'recherche de l’accueil': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(1500); await page.fill('input[aria-label="Rechercher dans le catalogue"]', 'pika'); await page.waitForTimeout(800); },
  'Mes PK': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(1500); await page.click('header button[aria-label^="Mes PK"]'); await page.waitForTimeout(500); },
  // Déblocage en PA dans le Pokédex : fiche d'un légendaire à thème verrouillé, bouton « Débloquer · 3 000 PA ».
  'déblocage d’un compagnon (Pokédex)': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(1500); const t = await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)), n = [382, 383, 384].find(v => v !== d.buddy); d.pkOwn = (d.pkOwn || []).filter(v => v !== n); d.pa = 5000; localStorage.setItem(k, JSON.stringify(d)); return { 382: 'kyogre', 383: 'groudon', 384: 'rayquaza' }[n]; }); await page.reload(); await page.waitForTimeout(1500); await dexPick(t); await page.locator('section[aria-label="Fiche du Pokémon"]').scrollIntoViewIfNeeded(); await page.waitForTimeout(400); },
  // Méga-évolution : Florizarre débloqué, méga touchée sur la route, « Méga-évoluer · 2 500 PA » puis la confirmation.
  'méga-évolution (nouvelle forme et félicitations)': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(1500); await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pkOwn = [...new Set((d.pkOwn || []).concat([1, 2, 3]))]; d.megas = []; d.pa = 5000; localStorage.setItem(k, JSON.stringify(d)); }); await page.reload(); await page.waitForTimeout(1500); await dexPick('florizarre'); await page.click('[aria-label="Route d’évolution"] button[aria-label*="méga-évolution"]'); await page.waitForTimeout(400); await page.click('section[aria-label="Fiche du Pokémon"] .pkm-dex-act-btn'); await page.waitForTimeout(5600); },
  'Fiche d’un grade': async () => { await page.goto(BASE + '?today=2026-10-04&start=tiers'); await page.waitForTimeout(1200); await page.click('button[aria-label="Voir le grade Dresseur Pokémon et ses avantages"]'); await page.waitForTimeout(800); },
  'Territoire, bulle d’infos': async () => { await page.goto(BASE + '?today=2026-10-04#territoire'); await page.waitForTimeout(1500); const l = page.locator('button:has-text("Me localiser")').first(); if (await l.count()) await l.click(); await page.waitForSelector('button[aria-label^="Plus d’infos sur"]', { timeout: 20000 }); await page.locator('button[aria-label^="Plus d’infos sur"]').first().click(); await page.waitForTimeout(400); },
  'Territoire, galerie et menu des vues': async () => { await page.goto(BASE + '?today=2026-10-04#territoire'); await page.waitForTimeout(1500); const l = page.locator('button:has-text("Me localiser")').first(); if (await l.count()) await l.click(); await page.waitForSelector('button[aria-label^="Plus d’infos sur"]', { timeout: 20000 }); await page.click('section[aria-label="Boutiques autour de toi"] button[aria-haspopup]'); await page.waitForTimeout(300); await page.click('[aria-label="Choisir la vue"] button:has-text("Galerie")'); await page.waitForTimeout(300); await page.click('section[aria-label="Boutiques autour de toi"] button[aria-haspopup]'); await page.waitForTimeout(300); },
  'Marché, galerie': async () => { await page.goto(BASE + '?today=2026-10-04&start=search'); await page.waitForTimeout(1500); await page.click('main button[aria-haspopup]'); await page.waitForTimeout(200); await page.click('[aria-label="Choisir la vue"] button:has-text("Galerie")'); await page.waitForTimeout(500); },
  'Marché, compacte': async () => { await page.goto(BASE + '?today=2026-10-04&start=search'); await page.waitForTimeout(1500); await page.click('main button[aria-haspopup]'); await page.waitForTimeout(200); await page.click('[aria-label="Choisir la vue"] button:has-text("Compacte")'); await page.waitForTimeout(500); },
  'Panneau Admin': async () => { await page.goto(BASE + '?today=2026-10-04&start=settings'); await page.waitForTimeout(1000); await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.admin = Object.assign(d.admin || {}, { on: true, hash: 'x', salt: 'y' }); localStorage.setItem(k, JSON.stringify(d)); }); await page.reload(); await page.waitForTimeout(1000); for (let i = 0; i < 7; i++) await page.click('button[aria-label^="Version "]'); await page.waitForTimeout(400); },
  'Code Admin': async () => { await page.goto(BASE + '?today=2026-10-04&start=settings'); await page.waitForTimeout(600); await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.admin = Object.assign(d.admin || {}, { on: false }); localStorage.setItem(k, JSON.stringify(d)); }); await page.reload(); await page.waitForTimeout(1000); for (let i = 0; i < 7; i++) await page.click('button[aria-label^="Version "]'); await page.waitForTimeout(400); },
  // Le compagnon de l'accueil ouvre le Pokédex (onglet Jeux) ; « Tous les Pokémon » ouvre la liste.
  'Pokédex (depuis le compagnon)': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(1500); await page.click('button[aria-label^="Compagnon"]'); await page.waitForSelector('section[aria-label="Pokédex"]', { timeout: 10000 }); await page.waitForTimeout(900); },
  'Mon Pokédex (liste)': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(1500); await page.click('button[aria-label^="Compagnon"]'); await page.waitForSelector('section[aria-label="Pokédex"]', { timeout: 10000 }); await page.waitForTimeout(700); await page.click('.pkm-dex-all'); await page.waitForTimeout(500); },
  // PA du jour pas encore récupérés : message, pastille « 1 » (« ! » jusqu’au 2026-10-29) sur le solde, puis la fiche « Tes PA du jour ».
  'PA du jour à récupérer': async () => { await page.goto(BASE + '?today=2026-10-04&e2epa=1'); await page.waitForTimeout(1500); },
  'PA dispo aujourd’hui': async () => { await page.goto(BASE + '?today=2026-10-04&e2epa=1'); await page.waitForTimeout(1500); await page.click('header button[aria-label^="Mes points d’Aura"]'); await page.waitForSelector('section[aria-label="PA dispo aujourd’hui"]'); await page.waitForTimeout(400); },
  'radar de l’accueil': async () => { await page.goto(BASE + '?today=2026-10-04'); await page.waitForTimeout(3000); await page.click('section[aria-label="Boutiques près de toi"] button[aria-label*="Radar des boutiques"]'); await page.waitForTimeout(3500); },
  'sorties du Marché': async () => { await page.goto(BASE + '?start=search'); await page.waitForTimeout(900); await page.click('[aria-label="Filtre du marché"] button:has-text("Sorties")'); }
};
const blurs = [];
for (const [name, act] of Object.entries(states)) {
  await page.goto('about:blank'); await act(); await page.waitForTimeout(500);
  for (const f of await audit()) { report.push(name + ' · « ' + f.text + ' » ' + f.ratio + ' < ' + f.need + ' (texte ' + f.color + ' sur ' + f.bg + ')'); total++; }
  blurs.push(name + ' ' + await page.evaluate(() => [...document.querySelectorAll('#app *')].filter(e => { const s = getComputedStyle(e); return (s.backdropFilter && s.backdropFilter !== 'none') && e.getBoundingClientRect().width > 0; }).length));
}
console.log('éléments floutés : ' + blurs.join(' · '));
console.log(report.join('\n'));
console.log(total + ' texte(s) sous le seuil de contraste');
console.log(total === 0 ? '✓ contraste suffisant partout (4,5:1 et plus)' : '✗ ' + total + ' texte(s) sous le seuil de contraste');
await browser.close();
