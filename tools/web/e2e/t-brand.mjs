import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// Identité Dropicards : logo de l'en-tête, titre, manifeste, icônes, plus aucun « PKM » visible.
const BASE = E2E + '/';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
for (const [w, h] of [[390, 844], [360, 740]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  const logo = page.locator('header img[alt="Dropicards"]');
  ok(w + ' : logo dans l’en-tête', (await logo.count()) === 1 && await logo.evaluate(i => i.complete && i.naturalWidth > 0));
  const box = await logo.boundingBox(), pk = await page.locator('header button[aria-label^="Mes PK"]').boundingBox(), av = await page.locator('header button').last().boundingBox();
  ok(w + ' : en-tête sans chevauchement (PK ' + Math.round(pk.x) + '–' + Math.round(pk.x + pk.width) + ' < logo ' + Math.round(box.x) + '–' + Math.round(box.x + box.width) + ' < avatar ' + Math.round(av.x) + ')', pk.x + pk.width <= box.x && box.x + box.width <= av.x && av.x + av.width <= w);
  ok(w + ' : plus de pastille « FR »', !/FR|Marché/.test(await page.locator('header').innerText()));
  if (w === 390) {
    ok('titre : ' + await page.title(), await page.title() === 'Dropicards');
    const man = await page.evaluate(() => fetch('manifest.webmanifest').then(r => r.json()));
    ok('manifeste : ' + man.name + ' / ' + man.short_name, man.short_name === 'Dropicards' && man.icons.some(i => i.purpose === 'maskable'));
    for (const f of ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'img/brand/dropicards-header.png', 'img/brand/dropicards.svg', 'img/brand/dropicards-dark.svg'])
      ok('servi : ' + f, await page.evaluate(u => fetch(u).then(r => r.ok), f));
    const links = await page.$$eval('link[rel="icon"], link[rel="apple-touch-icon"]', ls => ls.map(l => l.getAttribute('href')));
    // Adresses suivies de l'empreinte du fichier (?v=…, 2026-10-29) : le téléphone reprend la nouvelle icône.
    ok('icônes de la page : ' + links.join(', '), links.map(h => h.split('?')[0]).join() === 'icons/favicon-32.png,icons/icon-192.png,icons/apple-touch-icon.png' && links.every(h => /\?v=[0-9a-f]{8}$/.test(h)));
    const sizes = await page.evaluate(() => Promise.all(['icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'].map(u => new Promise(ok => { const i = new Image(); i.onload = () => ok(i.naturalWidth + '×' + i.naturalHeight); i.onerror = () => ok('erreur'); i.src = u; }))));
    ok('tailles des icônes : ' + sizes.join(', '), sizes.join() === '512×512,512×512,180×180,32×32');
    // Plus aucun « PKM » visible sur les écrans principaux.
    const screens = ['', '#collection', '#marche', '#territoire', '#sorties', '#scelle', '#profil', '#reglages', '#paliers', '#ventes', '#bienvenue', '?start=item&itemId=k1', '?start=item&itemId=p2', '?start=store&storeId=s2'];
    const seen = [];
    for (const sc of screens) {
      await page.goto('about:blank'); await page.goto(BASE + (sc.startsWith('?') ? sc : sc ? '?today=2026-10-04' + sc : '?today=2026-10-04'), { waitUntil: 'load' }); await page.waitForTimeout(900);
      const t = await page.locator('#app').innerText();
      if (/\bPKM\b/.test(t)) seen.push(sc || 'accueil');
    }
    ok('aucun « PKM » visible (' + screens.length + ' écrans)' + (seen.length ? ' : ' + seen.join(', ') : ''), seen.length === 0);
  }
  ok(w + ' : pas de défilement horizontal', !(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  if (w === 390) await page.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }), await page.waitForTimeout(1200), await page.screenshot({ path: shot('brand-accueil.png') });
  await ctx.close();
}
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
