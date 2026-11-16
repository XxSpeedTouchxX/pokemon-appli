// App toujours à la verticale (2026-11-16, porteur) : sur un téléphone tourné à l'horizontale, l'écran « Remets ton
// téléphone droit » cache l'app ; jamais sur ordinateur, jamais quand le clavier rétrécit la fenêtre d'un téléphone droit.
const { launch, BASE: E2E, shot } = await import('./helpers.mjs');
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ABORT = /fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/;
const lockOn = page => page.evaluate(() => document.documentElement.classList.contains('pkm-landscape') && getComputedStyle(document.querySelector('.pkm-rotlock')).display === 'flex');

// A. Téléphone : droit, puis tourné, puis remis droit (même page, état gardé).
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.route(ABORT, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  const cdp = await ctx.newCDPSession(page);
  const metrics = (w, h, type, angle) => cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true, screenWidth: w, screenHeight: h, screenOrientation: { type: type, angle: angle } });
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
  ok('téléphone droit : app visible', !(await lockOn(page)));
  await page.evaluate(() => window.__pkm.setState({ screen: 'market', stack: [] })); await page.waitForTimeout(500);
  await metrics(844, 390, 'landscapePrimary', 90); await page.waitForTimeout(600);
  ok('téléphone tourné : écran « Remets ton téléphone droit »', await lockOn(page));
  const t = await page.locator('.pkm-rotlock').innerText();
  ok('texte : « Dropicards s’utilise à la verticale » (' + t.replace(/\s+/g, ' ') + ')', /Dropicards s’utilise à la verticale/.test(t) && /Remets ton téléphone droit/.test(t));
  const box = await page.locator('.pkm-rotlock').boundingBox();
  ok('écran plein (844 × 390)', box && box.width >= 843 && box.height >= 389);
  { const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' }); (await import('node:fs')).writeFileSync(shot('orient-paysage.png'), Buffer.from(data, 'base64')); }
  await metrics(844, 390, 'landscapeSecondary', 270); await page.waitForTimeout(400);
  ok('tourné de l’autre côté : toujours caché', await lockOn(page));
  await metrics(390, 844, 'portraitPrimary', 0); await page.waitForTimeout(600);
  ok('remis droit : app visible, écran gardé (Jeux)', !(await lockOn(page)) && (await page.evaluate(() => window.__pkm.st().screen)) === 'market');
  // Clavier d'Android : fenêtre plus large que haute, téléphone toujours droit.
  await metrics(390, 330, 'portraitPrimary', 0); await page.waitForTimeout(400);
  ok('clavier ouvert (fenêtre basse, téléphone droit) : app visible', !(await lockOn(page)));
  await ctx.close();
}
// B. Ordinateur à l'horizontale : jamais caché.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.route(ABORT, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(E2E + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1000);
  ok('ordinateur : app visible', !(await lockOn(page)));
  await ctx.close();
}

await browser.close();
ok('aucune erreur de page (' + errors.slice(0, 3).join(' | ') + ')', errors.length === 0);
console.log(res.join('\n'));
const bad = res.filter(r => r.startsWith('✗')).length;
console.log(bad ? bad + ' échec(s)' : 'OK : ' + res.length + ' vérifications');
process.exit(bad ? 1 : 0);
