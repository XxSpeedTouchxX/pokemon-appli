// Avantages du DropiPass fermés sans abonnement (2026-11-15, porteur : « tout ce qui est compris dans le DropiPass ne doit
// pas être dispo pour les gens qui ne l'ont pas pris », avec le même message que le Radar : atteindre tel grade ou prendre
// le DropiPass). Fenêtre « Accès verrouillé » pour : scans du jour épuisés (grade suivant + DropiPass), classeur plein
// (grade suivant + DropiPass), pré-gradation gratuite utilisée (DropiPass seulement). Avec le DropiPass, rien n'est fermé.
// Achats fermés aux joueurs (NOBUY) : pas de bouton, mais « Le DropiPass arrive très bientôt : … ».
// L'historique complet est vérifié dans t-fihist.mjs, le Radar dans t-locks.mjs.
process.env.E2E_GRADE = '0';
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const LW = 'section[aria-label="Accès verrouillé"]';
const open = async prem => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  if (prem) await ctx.addInitScript(() => { try { localStorage.setItem('pkm-premium-force', '1'); } catch (e) { /* rien */ } });
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  return [ctx, page];
};
const lockText = async page => (await page.locator(LW).isVisible()) ? (await page.locator(LW).innerText()).replace(/\s+/g, ' ') : '';
const close = async page => { await page.locator(LW + ' button:has-text("Compris")').click(); await page.waitForTimeout(300); };
{
  const [ctx, page] = await open(false);
  // 1. Scans : les 5 scans du jour de la Recrue utilisés, sans scans bonus.
  await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__pkm.scanCount(); window.__pkm.setState({ scanBonus: 0 }); });
  await page.evaluate(() => window.__pkm.openScan()); await page.waitForTimeout(600);
  let t = await lockText(page);
  ok('scans épuisés : fenêtre au lieu du scanner (« ' + t.slice(0, 150) + ' »)', /Tes 5 scans du jour sont utilisés\. Atteins le grade « Chasseur » pour avoir 10 scans par jour\./.test(t)
    && /Ou prends le DropiPass : tes scans sont illimités/.test(t) && /Découvrir le DropiPass/.test(t) && /Voir le grade Chasseur/.test(t)
    && (await page.evaluate(() => window.__pkm.st().screen)) !== 'scan');
  await page.screenshot({ path: shot('dplock-scan.png') });
  await close(page);
  // Avec 20 scans bonus à prendre : le scanner s'ouvre (le compteur « +20 » suffit).
  await page.evaluate(() => window.__pkm.setState({ scanBonus: 20 }));
  await page.evaluate(() => window.__pkm.openScan()); await page.waitForTimeout(600);
  ok('scans épuisés mais 20 scans bonus : le scanner s’ouvre, sans fenêtre', (await page.evaluate(() => window.__pkm.st().screen)) === 'scan' && !(await page.locator(LW).isVisible()));
  await page.evaluate(() => { window.__pkm.setState({ scanBonus: 0 }); window.__pkm.pop(); }); await page.waitForTimeout(600);

  // 2. Pré-gradation réservée au DropiPass (2026-11-20, porteur : plus de pré-gradation gratuite).
  await page.evaluate(() => window.__pkm.pgStart()); await page.waitForTimeout(500);
  t = await lockText(page);
  ok('pré-gradation sans DropiPass : fenêtre (« ' + t.slice(0, 160) + ' »)', /La pré-gradation est réservée au DropiPass/.test(t)
    && /Avec le DropiPass, tu as 60 pré-gradations par mois/.test(t) && /Découvrir le DropiPass/.test(t) && !/Voir le grade/.test(t) && !/Condition/.test(t)
    && (await page.locator(LW + ' img[src="img/brand/pregrade.svg"]').count()) === 1);
  await page.screenshot({ path: shot('dplock-pg.png') });
  await close(page);
  // 2 bis. Calendrier JCC réservé au DropiPass (2026-11-20, porteur) : frise floutée, voile, même fenêtre.
  await page.evaluate(() => window.__pkm.setState({ screen: 'coin', stack: [], coinTab: 'cal' })); await page.waitForTimeout(1500);
  const calVeil = page.locator('section[aria-label="Frise du JCC Pokémon"] .pkm-lock-veil');
  ok('calendrier sans DropiPass : voile « Réservé au DropiPass »', (await calVeil.count()) === 1 && /Réservé au DropiPass/.test(await calVeil.innerText()));
  ok('calendrier : frise floutée', /blur/.test(await page.locator('section[aria-label="Frise du JCC Pokémon"] .pkm-cal-strip').evaluate(e => getComputedStyle(e).filter).catch(() => '')));
  await page.screenshot({ path: shot('dplock-cal-veil.png') });
  await calVeil.click(); await page.waitForTimeout(500);
  t = await lockText(page);
  ok('calendrier : fenêtre (« ' + t.slice(0, 140) + ' »)', /Le calendrier JCC est réservé au DropiPass/.test(t) && /Avec le DropiPass, tu as tout le calendrier JCC/.test(t)
    && (await page.locator(LW + ' img[src="img/brand/calendrier.svg"]').count()) === 1);
  await page.screenshot({ path: shot('dplock-cal.png') });
  await close(page);
  await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(600);

  // 3. Classeur plein au grade Recrue (9 items scellés) : grade suivant + DropiPass.
  const room = await page.evaluate(() => { const i = window.__pkm, s = i.st(), p = i.catalog().find(x => x.type === 'sealed'); const r = i.binderRoom(s, p.id, 500); if (r) i.setState({ shopLock: r }); return !!r; });
  await page.waitForTimeout(400);
  t = await lockText(page);
  ok('classeur plein : grade suivant et DropiPass (« ' + t.slice(0, 160) + ' »)', room && /Ton classeur est plein/.test(t) && /Ou prends le DropiPass : ton classeur devient illimité/.test(t) && /Voir le grade/.test(t));
  await close(page);

  // 4. Achats fermés aux joueurs (NOBUY, compte non admin) : pas de bouton, l'avantage reste annoncé.
  await page.evaluate(() => { window.__pkm.buyLocked = () => true; window.__pkm.dpLock('pg', { wait: '2 j 23 h' }); }); await page.waitForTimeout(400);
  t = await lockText(page);
  ok('achats fermés : « Le DropiPass arrive très bientôt » sans bouton', /Le DropiPass arrive très bientôt : 60 pré-gradations par mois y seront incluses/.test(t) && !/Découvrir le DropiPass/.test(t));
  await close(page);
  // Radar dans le même cas.
  await page.evaluate(() => window.__pkm.openRadar()); await page.waitForTimeout(400);
  t = await lockText(page);
  ok('achats fermés : Radar « Le DropiPass arrive très bientôt : le Radar des boutiques y sera inclus »', /arrive très bientôt : le Radar des boutiques y sera inclus/.test(t) && !/Découvrir le DropiPass/.test(t));
  await close(page);
  await ctx.close();
}
{
  // 5. Avec le DropiPass : scanner ouvert malgré 5 scans, pré-gradation lancée, classeur sans limite, Radar ouvert.
  const [ctx, page] = await open(true);
  await page.evaluate(() => { for (let i = 0; i < 5; i++) window.__pkm.scanCount(); window.__pkm.setState({ scanBonus: 0, pgLast: Date.now() - 3600e3 }); });
  await page.evaluate(() => window.__pkm.openScan()); await page.waitForTimeout(600);
  ok('DropiPass : scanner ouvert (scans illimités)', (await page.evaluate(() => window.__pkm.st().screen)) === 'scan' && !(await page.locator(LW).isVisible()));
  await page.evaluate(() => window.__pkm.pop()); await page.waitForTimeout(600);
  const pg = await page.evaluate(() => window.__pkm.pgQuota());
  ok('DropiPass : 60 pré-gradations par mois (' + pg.text + ')', pg.mode === 'premium' && pg.left > 0);
  ok('DropiPass : classeur sans limite', await page.evaluate(() => { const i = window.__pkm, p = i.catalog().find(x => x.type === 'sealed'); return i.binderRoom(i.st(), p.id, 500) === null; }));
  ok('DropiPass : Radar ouvert', await page.evaluate(() => window.__pkm.radarLockMin() === -1));
  await page.evaluate(() => window.__pkm.setState({ screen: 'coin', stack: [], coinTab: 'cal' })); await page.waitForTimeout(1500);
  ok('DropiPass : calendrier JCC sans voile', (await page.locator('section[aria-label="Frise du JCC Pokémon"]').count()) === 1 && (await page.locator('section[aria-label="Frise du JCC Pokémon"] .pkm-lock-veil').count()) === 0);
  await page.evaluate(() => window.__pkm.setState({ screen: 'home', stack: [] })); await page.waitForTimeout(500);
  await ctx.close();
}
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
