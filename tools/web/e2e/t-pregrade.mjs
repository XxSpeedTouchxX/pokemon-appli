// Pré-gradation (2026-11-14, « go » du porteur, D1 à D6 ; docs/40 ; pregrade.js, pregrade-core.js).
// Le serveur est imité (page.route) : jamais le vrai serveur. Les photos sont dessinées dans la page (carte simulée
// posée sur un fond sombre), puis données au bouton « Importer une photo » : la caméra n'est pas nécessaire.
// 1. Accueil : rubrique « Pré-gradation » sous les boutiques, badge « Version Proto », compteur toujours visible.
// 2. Recto puis verso importés : analyse, note, 4 critères, notes PSA/PCA/CCC, « ça vaut le coup ? ».
// 3. Compteur gratuit : 1 tous les 3 jours (attente affichée ensuite, accueil compris).
// 4. Carte cherchée à la main, ajout à la collection avec l'état estimé, vraie note, « Mes pré-gradations ».
// 5. Photo sans carte : refus expliqué, compteur intact.
// 6. Premium : 100 par mois (99 après une analyse) ; app des stores : pas de mention de Premium.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
import fs from 'node:fs';
const FAKE = 'http://127.0.0.1:59996';
const Q = '&cloud=' + encodeURIComponent(FAKE) + '&cloudkey=test';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const KEY = 'pkm-collection-v1';
const UID = 'u-pg', EMAIL = 'grader@exemple.fr';
const TOKEN = 'h.' + Buffer.from(JSON.stringify({ sub: UID, email: EMAIL })).toString('base64url') + '.s';
const S = { premium: false };
async function fake(route) {
  const req = route.request(), url = new URL(req.url()), p = url.pathname;
  const send = (status, j) => route.fulfill({ status: status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(j) });
  if (p === '/rest/v1/rpc/game_state') {
    return send(200, { unlimited: false, admin_until: null, next_draw: '2026-11-22T19:00:00Z', shop_draw: {}, pk: 300, pa: 0, pk_earned: 300, pa_day: null, pa_streak: 0,
      pa_gain: 20, today: '2026-11-14', grade: 0, booster_last: null, coin_last: null, shared: false, unlocked: [], shop: {}, buddy: 25,
      premium: S.premium ? { on: true, plan: 'month', status: 'active', until: '2026-12-14T10:00:00Z', cancel: false, customer: true } : { on: false, plan: null, status: 'none', until: null, cancel: false, customer: false } });
  }
  if (p === '/rest/v1/profiles') return send(200, [{ pseudo: 'Grader', age_range: '15-25', starter: 25, news_optin: false, role: 'user', status: 'active' }]);
  if (p === '/auth/v1/token') return send(200, { access_token: TOKEN, refresh_token: 'r', expires_in: 3600, user: { id: UID, email: EMAIL } });
  if (p === '/auth/v1/user') return send(200, { id: UID, email: EMAIL, email_confirmed_at: '2026-11-09T10:00:00Z' });
  return send(200, []);
}
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
await ctx.route(FAKE + '/**', fake);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
const login = async () => {
  await page.evaluate(([k, tok, uid, email]) => {
    const d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.ligueTuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d));
    localStorage.setItem('pkm-pky-asked', '1');
    localStorage.setItem('pkm-cloud-session', JSON.stringify({ access_token: tok, refresh_token: 'r', expires_at: Date.now() + 3600e3, uid: uid, email: email, role: 'user', confirmed: true }));
  }, [KEY, TOKEN, UID, EMAIL]);
};
const vis = sel => page.locator(sel).first().isVisible().catch(() => false);
const txt = sel => page.locator(sel).first().innerText().catch(() => '');
const st = () => page.evaluate(() => window.__pkm.st());
const waitStep = (step, ms) => page.waitForFunction(s => window.__pkm && window.__pkm.st().pgStep === s, step, { timeout: ms || 20000 }).then(() => true).catch(() => false);

// Photo simulée : carte (bord jaune régulier, illustration, cadre de texte) ou verso (bord bleu), posée sur un fond sombre.
const photo = async (kind, file) => {
  const b64 = await page.evaluate(kind => {
    const W = 1200, H = 1600, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#23262d'; g.fillRect(0, 0, W, H);
    if (kind === 'none') { g.fillStyle = '#2a2d35'; g.fillRect(200, 300, 300, 200); return c.toDataURL('image/png').split(',')[1]; }
    const cw = 760, ch = Math.round(cw * 88 / 63), x = (W - cw) / 2, y = (H - ch) / 2, r = cw * 0.045, b = cw * 0.05;
    g.save(); g.translate(W / 2, H / 2); g.rotate(0.01); g.translate(-W / 2, -H / 2);
    g.beginPath(); g.roundRect(x, y, cw, ch, r); g.clip();
    if (kind === 'front') {
      g.fillStyle = '#F2C94C'; g.fillRect(x, y, cw, ch);
      g.fillStyle = '#B9C3CF'; g.fillRect(x + b, y + b, cw - 2 * b, ch - 2 * b);
      const gr = g.createLinearGradient(0, y + b, 0, y + ch * 0.55); gr.addColorStop(0, '#5DA9E9'); gr.addColorStop(1, '#2F6E3B');
      g.fillStyle = gr; g.fillRect(x + b + 20, y + b + 70, cw - 2 * b - 40, ch * 0.42);
      g.fillStyle = '#E8D9A8'; g.beginPath(); g.arc(W / 2, y + b + 70 + ch * 0.21, 120, 0, 7); g.fill();
      g.fillStyle = '#B0A890'; g.fillRect(x + b + 20, y + ch * 0.6, cw - 2 * b - 40, ch * 0.32);
      g.fillStyle = '#3A3A3A'; for (let i = 0; i < 6; i++) g.fillRect(x + b + 40, y + ch * 0.63 + i * 40, cw - 2 * b - 120 - (i % 2) * 120, 12);
      g.fillStyle = '#2A2A2A'; g.font = 'bold 42px sans-serif'; g.fillText('Carte d’essai', x + b + 30, y + b + 50);
    } else {
      g.fillStyle = '#1F4FA8'; g.fillRect(x, y, cw, ch);
      const gr = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, cw * 0.55); gr.addColorStop(0, '#7FB2FF'); gr.addColorStop(0.5, '#2C64C9'); gr.addColorStop(1, '#173B80');
      g.fillStyle = gr; g.fillRect(x + b, y + b, cw - 2 * b, ch - 2 * b);
      g.fillStyle = '#D33'; g.beginPath(); g.arc(W / 2, H / 2, 90, Math.PI, 0); g.fill(); g.fillStyle = '#E6E6E6'; g.beginPath(); g.arc(W / 2, H / 2, 90, 0, Math.PI); g.fill();
    }
    g.restore();
    return c.toDataURL('image/png').split(',')[1];
  }, kind);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  return file;
};
const F_FRONT = shot('pg-front.png'), F_BACK = shot('pg-back.png'), F_NONE = shot('pg-none.png');

// 1. Accueil.
await page.goto(E2E + '/?start=home' + Q, { waitUntil: 'load' }); await page.waitForTimeout(800);
await login();
await page.goto(E2E + '/?start=home&debug' + Q, { waitUntil: 'load' });
await page.waitForFunction(() => window.__pkm && window.__pkm.pgQuota, null, { timeout: 15000 });
await page.waitForTimeout(1200);
const home = page.locator('section[aria-label="Pré-gradation"]');
await home.scrollIntoViewIfNeeded().catch(() => {});
ok('accueil : rubrique « Pré-gradation »', await home.isVisible().catch(() => false));
ok('accueil : badge « Version Proto »', /Version Proto/.test(await home.innerText().catch(() => '')));
ok('accueil : logo de la loupe (L1)', await page.locator('section[aria-label="Pré-gradation"] img[src$="pregrade.svg"]').count() > 0);
const order = await page.evaluate(() => { const a = [...document.querySelectorAll('section[aria-label]')].map(e => e.getAttribute('aria-label')); return [a.indexOf('Boutiques près de toi'), a.indexOf('Pré-gradation')]; });
ok('accueil : la rubrique est sous les boutiques (' + order.join(' < ') + ')', order[0] >= 0 && order[1] === order[0] + 1);
const homeTxt = await home.innerText().catch(() => '');
ok('accueil : compteur « 1 pré-gradation disponible »', /1 pré-gradation disponible/.test(homeTxt));
ok('accueil : rythme et offre Premium « 1 tous les 3 jours · 100 par mois avec Premium »', /1 tous les 3 jours · 100 par mois avec Premium/.test(homeTxt));
await home.screenshot({ path: shot('pregrade-home.png') }).catch(() => {});

// 2. Recto puis verso.
await page.locator('section[aria-label="Pré-gradation"] .pkm-pgh-btn').click();
ok('« Pré-grader une carte » ouvre l’écran au recto', await waitStep('front', 5000) && (await st()).screen === 'pregrade');
ok('écran : compteur en haut', /1 pré-gradation disponible/.test(await txt('.pkm-pgd-counter')));
ok('écran : 4 contrôles de la photo', await page.locator('.pkm-pgd-ck').count() === 4);
await photo('front', F_FRONT); await photo('back', F_BACK); await photo('none', F_NONE);
// Photo sans carte : refusée, rien de consommé.
await page.setInputFiles('#pkm-pgd-file', F_NONE);
await page.waitForFunction(() => /introuvable|bords/.test(window.__pkm.st().pgMsg || ''), null, { timeout: 8000 }).catch(() => {});
ok('photo sans carte : refus expliqué (« ' + ((await st()).pgMsg || '').slice(0, 40) + '… »)', /introuvable|bords/.test((await st()).pgMsg || '') && (await st()).pgStep === 'front');
await page.setInputFiles('#pkm-pgd-file', F_FRONT);
ok('recto importé : passage au verso', await waitStep('back', 10000));
ok('verso : étape « Recto » cochée', /✓/.test(await txt('.pkm-pgd-stp-done')));
await page.setInputFiles('#pkm-pgd-file', F_BACK);
ok('verso importé : analyse', await waitStep('analyse', 10000) || (await st()).pgStep === 'result');
ok('analyse terminée : résultat', await waitStep('result', 25000));
await page.waitForTimeout(500);
const s1 = await st(), e1 = (s1.pgHist || [])[0] || {};
ok('note entre 1 et 10 (' + e1.grade + ', fiabilité ' + e1.rel + ')', e1.grade >= 1 && e1.grade <= 10 && ['bonne', 'moyenne', 'faible'].includes(e1.rel));
ok('carte simulée bien notée (note ≥ 7)', e1.grade >= 7);
ok('critères : centrage, coins, bords, surface', await page.locator('.pkm-pgd-critbox').count() === 4);
const coTxt = await page.locator('section[aria-label="Notes probables par entreprise"]').innerText().catch(() => '');
ok('notes par entreprise : PSA, PCA et CCC avec leurs barèmes', await page.locator('.pkm-pgd-co').count() === 3 && /PSA/.test(coTxt) && /PCA/.test(coTxt) && /CCC/.test(coTxt));
ok('barème PSA écrit comme le porteur (ex. « Gem Mint », « Mint », « Near Mint »)', /Gem Mint|Mint|Near Mint|Excellent/.test(coTxt));
ok('repères sur la photo : recto et verso', await page.locator('section[aria-label="Où sont les défauts"] .pkm-pgd-seg').count() === 2 && await vis('.pkm-pgd-defimg img'));
ok('4 coins agrandis', await page.locator('.pkm-pgd-zoom').count() === 4);
ok('mention « pas une gradation officielle »', /pas une gradation officielle/.test(await txt('.pkm-pgd-legal')));

// 3. Compteur gratuit consommé.
ok('compteur : « Prochaine pré-gradation dans 3 j … »', /Prochaine pré-gradation dans (3 j|2 j 23 h)/.test(await txt('.pkm-pgd-counter')));
ok('date de la dernière pré-gradation enregistrée', s1.pgLast > 0);

// 4. Carte cherchée à la main, ajout, vraie note.
const unknown = await vis('section[aria-label="C’est laquelle ?"]');
ok('carte non reconnue : « C’est laquelle ? » avec la recherche', unknown && await vis('.pkm-pgd-q input'));
await page.fill('.pkm-pgd-q input', 'Pikachu'); await page.waitForTimeout(600);
const nFound = await page.locator('section[aria-label="C’est laquelle ?"] .pkm-pgd-cand').count();
ok('recherche « Pikachu » : des cartes proposées (' + nFound + ')', nFound > 0);
await page.locator('section[aria-label="C’est laquelle ?"] .pkm-pgd-cand').last().click(); await page.waitForTimeout(500);
const s2 = await st(), e2 = s2.pgHist[0];
ok('carte choisie : enregistrée dans la pré-gradation', !!e2.id && !(await vis('section[aria-label="C’est laquelle ?"]')));
ok('« Ça vaut le coup ? » : onglets PSA, PCA, CCC', await page.locator('section[aria-label="Ça vaut le coup de la grader ?"] .pkm-pgd-seg').count() === 3);
const worthTxt = await page.locator('section[aria-label="Ça vaut le coup de la grader ?"]').innerText().catch(() => '');
ok('« Ça vaut le coup ? » : valeurs et verdict, ou cote absente expliquée', /Valeur brute|Pas encore de cote/.test(worthTxt));
if (/Valeur brute/.test(worthTxt)) {
  await page.fill('.pkm-pgd-fee-in input', '25'); await page.locator('.pkm-pgd-fee-in input').blur(); await page.waitForTimeout(300);
  ok('coût de gradation saisi : gardé (25 €)', ((await st()).pgCost || {}).PSA === 25);
}
const recBefore = await page.evaluate(() => (window.__pkm.st().purchases || []).length);
const addBtn = page.locator('.pkm-pgd-btn', { hasText: 'Ajouter à ma collection en' });
ok('bouton « Ajouter à ma collection en <état estimé> »', await addBtn.isVisible().catch(() => false));
await addBtn.click().catch(() => {}); await page.waitForTimeout(600);
const recAfter = await page.evaluate(() => (window.__pkm.st().purchases || []).length);
ok('ajout : un exemplaire de plus dans la collection (' + recBefore + ' → ' + recAfter + ')', recAfter === recBefore + 1);
await page.evaluate(() => window.__pkm.setState({ toast: null }));
await page.locator('.pkm-pgd-real').click(); await page.waitForTimeout(300);
ok('vraie note : barème PSA proposé (10 à 1)', await page.locator('.pkm-pgd-note').count() === 10);
await page.locator('.pkm-pgd-note', { hasText: /^9$/ }).first().click(); await page.waitForTimeout(300);
const real = ((await st()).pgHist[0] || {}).real;
ok('vraie note enregistrée : PSA 9', real && real.co === 'PSA' && real.key === '9');
await page.locator('.pkm-pgd-real').click(); await page.waitForTimeout(200);
await page.evaluate(() => window.__pkm.setState({ pgReal: true, pgRealCo: 'CCC' })); await page.waitForTimeout(200);
const cccNotes = await page.locator('.pkm-pgd-note').allInnerTexts();
ok('barème CCC du porteur : 10 Black Label, 10 Gold Label, 10, 9,5 … 1 (' + cccNotes.length + ')', cccNotes[0] === '10 Black Label' && cccNotes[1] === '10 Gold Label' && cccNotes.includes('9,5') && cccNotes[cccNotes.length - 1] === '1');
await page.evaluate(() => window.__pkm.setState({ pgReal: false }));
await page.screenshot({ path: shot('pregrade-result.png') });
await page.locator('.pkm-pgd-histbtn').click(); await page.waitForTimeout(300);
ok('« Mes pré-gradations (1) » : la liste', (await st()).pgStep === 'hist' && await page.locator('.pkm-pgd-hrow').count() === 1);
ok('liste : vraie note affichée', /Vraie note : PSA 9/.test(await txt('.pkm-pgd-hrow')));
// Retour à l'accueil : compteur d'attente, dernière pré-gradation.
await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(500);
const homeTxt2 = await page.locator('section[aria-label="Pré-gradation"]').innerText().catch(() => '');
ok('accueil : attente affichée et dernière pré-gradation', /Prochaine pré-gradation dans/.test(homeTxt2) && /probable/.test(homeTxt2));
// Sans pré-gradation disponible : l'écran s'ouvre sur l'explication, pas sur la caméra.
await page.locator('section[aria-label="Pré-gradation"] .pkm-pgh-btn').click(); await page.waitForTimeout(400);
ok('compteur à zéro : pas de nouvelle analyse possible', (await st()).pgStep === 'intro' && await vis('.pkm-pgd-wait'));

// Gardé après fermeture de l'app : compteur et liste.
await page.waitForTimeout(600);
await page.goto(E2E + '/?start=home&debug' + Q, { waitUntil: 'load' });
await page.waitForFunction(() => window.__pkm && window.__pkm.pgQuota, null, { timeout: 15000 }); await page.waitForTimeout(800);
const kept = await st();
ok('après rechargement : attente gardée et « Mes pré-gradations » conservée', /Prochaine pré-gradation dans/.test(await page.evaluate(() => window.__pkm.pgQuota().text)) && (kept.pgHist || []).length === 1 && ((kept.pgHist[0] || {}).real || {}).key === '9');

// 6. Premium : 100 par mois.
S.premium = true;
await page.goto(E2E + '/?start=pregrade&debug' + Q, { waitUntil: 'load' });
await page.waitForFunction(() => window.__pkm && window.__pkm.premOn && window.__pkm.premOn(), null, { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(800);
ok('Premium : « 100 pré-gradations restantes ce mois-ci (sur 100) »', /100 pré-gradations restantes ce mois-ci \(sur 100\)/.test(await txt('.pkm-pgd-counter')));
ok('Premium : plus de mention « avec Premium »', !/avec Premium/.test(await txt('.pkm-pgd-counter')));
await page.evaluate(() => window.__pkm.pgStart()); await page.waitForTimeout(300);
await page.setInputFiles('#pkm-pgd-file', F_FRONT); await waitStep('back', 10000);
await page.setInputFiles('#pkm-pgd-file', F_BACK); await waitStep('result', 25000);
ok('Premium : 99 restantes après une analyse', /99 pré-gradations restantes/.test(await txt('.pkm-pgd-counter')));
const pm = await st();
ok('Premium : mois et nombre enregistrés', /^\d{4}-\d{2}$/.test(pm.pgMonth || '') && pm.pgUsed === 1);
// App des stores, compte gratuit : rythme seul.
S.premium = false;
await page.goto(E2E + '/?start=home&debug&store=1' + Q, { waitUntil: 'load' });
await page.waitForFunction(() => window.__pkm && window.__pkm.pgQuota, null, { timeout: 15000 }); await page.waitForTimeout(800);
const up = await page.evaluate(() => window.__pkm.pgQuota().upsell);
ok('app des stores : « 1 tous les 3 jours », sans Premium', up === '1 tous les 3 jours');

ok('aucune erreur de page', errors.length === 0);
if (errors.length) console.log('Erreurs : ' + errors.slice(0, 5).join(' | '));
console.log(res.join('\n'));
await browser.close();
