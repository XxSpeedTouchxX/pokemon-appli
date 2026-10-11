import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// Territoire réel : position, vraies boutiques, carte, fiche boutique, encadré démo.
import { readFileSync } from 'node:fs';
// Vraies données (copie servie de web/data/stores.json) : boutique la plus proche avec site, téléphone, horaires et adresse.
const DATA = JSON.parse(readFileSync(ROOT + 'web/data/stores.json', 'utf8'));
const F = Object.fromEntries(DATA.fields.map((f, i) => [f, i]));
const POS = { lat: 45.764, lon: 4.8357 };
const rad = d => d * Math.PI / 180;
const km = (a, b) => 2 * 6371 * Math.asin(Math.sqrt(Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2));
const FULL = 'adresse' in F ? DATA.stores.filter(r => r[F.site] && r[F.tel] && r[F.horaires] && r[F.adresse])
  .map(r => ({ r, d: km(POS, { lat: r[F.lat], lon: r[F.lon] }) })).sort((a, b) => a.d - b.d) : [];
console.log('boutiques avec toutes les coordonnées : ' + FULL.length + (FULL.length ? ' · la plus proche : ' + FULL[0].r[F.nom] + ' à ' + FULL[0].d.toFixed(2) + ' km' : ''));
const BASE = E2E + '/';
const browser = await launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l);
const errors = [];
const mk = async granted => {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }, granted ? { geolocation: { latitude: 45.764, longitude: 4.8357 }, permissions: ['geolocation'] } : {}));
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  return page;
};
// 1. Sans autorisation : bouton « Me localiser », rien n'est demandé tout seul.
{
  const page = await mk(false);
  // Refus simulé : le navigateur répond « refusé » après un court délai.
  await page.addInitScript(() => { navigator.geolocation.getCurrentPosition = (ok, ko) => setTimeout(() => ko({ code: 1, message: 'refus' }), 600); });
  await page.goto(BASE + '?today=2026-10-04#territoire', { waitUntil: 'load' }); await page.waitForTimeout(1200);
  ok('sans position : « Me localiser »', (await page.locator('button:has-text("Me localiser")').count()) === 1);
  ok('bandeau Prochaine sortie : ' + (await page.locator('button[aria-label^="Prochaine sortie"]').getAttribute('aria-label') || '').slice(0, 60), (await page.locator('button[aria-label^="Prochaine sortie"]').count()) === 1);
  ok('démo repliée : aucun « Partenaire Dropicards » visible', (await page.locator(':text-is("★ Partenaire Dropicards")').count()) === 0);
  await page.click('button:has-text("Me localiser")'); await page.waitForTimeout(400);
  ok('recherche en cours : ' + await page.locator('p[role="status"]').first().textContent(), /Recherche de ta position/.test(await page.locator('p[role="status"]').first().textContent()));
  await page.waitForTimeout(900);
  ok('position refusée : message', (await page.locator('text=Position refusée ou introuvable').count()) === 1);
  await page.screenshot({ path: shot('ter-1-sans-position.png') });
  await page.context().close();
}
// 2. Autorisation déjà donnée : position retrouvée seule, vraies boutiques.
const page = await mk(true);
await page.goto(BASE + '?today=2026-10-04#territoire', { waitUntil: 'load' }); await page.waitForTimeout(2500);
const rows = await page.$$eval('section[aria-label="Boutiques autour de toi"] button[aria-label]', b => b.map(x => x.getAttribute('aria-label')).filter(l => /km/.test(l) && !/^Prochaine/.test(l)));
ok('position retrouvée seule : ' + rows.length + ' lignes et pastilles', rows.length >= 10);
const listRows = await page.$$eval('section[aria-label="Boutiques autour de toi"] button[aria-label*="chance"]:not([style*="position: absolute"])', b => b.map(x => x.getAttribute('aria-label')));
const kms = listRows.map(l => parseFloat((l.match(/, ([\d,]+) km/) || [0, '99'])[1].replace(',', '.')));
ok('liste triée par distance : ' + kms.slice(0, 5).join(' ; '), kms.length >= 5 && kms.every((k, i) => i === 0 || k >= kms[i - 1]));
ok('compte : ' + await page.locator('section[aria-label="Boutiques autour de toi"] span:has-text("à moins de")').first().textContent(), /boutiques à moins de 5 km/.test(await page.locator('section[aria-label="Boutiques autour de toi"]').innerText()));
ok('ouverture lue dans les horaires', /Ouvert|Fermé/.test(await page.locator('section[aria-label="Boutiques autour de toi"]').innerText()));
ok('aucun « Partenaire Dropicards » hors démo', (await page.locator(':text-is("★ Partenaire Dropicards")').count()) === 0);
await page.screenshot({ path: shot('ter-2-liste.png') });
await page.evaluate(() => { document.querySelector('#app main').scrollTop = 520; }); await page.waitForTimeout(300);
await page.screenshot({ path: shot('ter-3-liste-bas.png') });
// Rayon et tri.
await page.click('[aria-label="Rayon autour de toi"] button:has-text("3 km")'); await page.waitForTimeout(400);
const n3 = (await page.locator('section[aria-label="Boutiques autour de toi"]').innerText()).match(/(\d+) boutiques à moins de 3 km/);
ok('rayon 3 km : ' + (n3 ? n3[1] : '?') + ' boutiques', !!n3);
await page.click('[aria-label="Ordre de la liste"] button:has-text("Meilleure chance")'); await page.waitForTimeout(400);
const pcts = await page.$$eval('section[aria-label="Boutiques autour de toi"] button[aria-label*="chance"]:not([style*="position: absolute"])', b => b.map(x => +(x.getAttribute('aria-label').match(/(\d+) %$/) || [0, 0])[1]));
ok('tri par chance : ' + pcts.slice(0, 5).join(' ; '), pcts.length > 2 && pcts.every((p, i) => i === 0 || p <= pcts[i - 1]));
await page.click('[aria-label="Ordre de la liste"] button:has-text("Plus proches")'); await page.click('[aria-label="Rayon autour de toi"] button:has-text("5 km")'); await page.waitForTimeout(400);
// Fiche d'une vraie boutique : la plus proche qui a site, téléphone, horaires et adresse sur OpenStreetMap.
ok('données : boutiques avec coordonnées', FULL.length > 0);
const best = FULL.length ? FULL[0].r : null;
if (best) { await page.goto(BASE + '?today=2026-10-04&start=shop&shopId=' + best[F.id], { waitUntil: 'load' }); await page.waitForTimeout(2500); }
else { await page.locator('section[aria-label="Boutiques autour de toi"] button[aria-label*="chance"]:not([style*="position: absolute"])').first().click(); await page.waitForTimeout(600); }
const shop = await page.locator('main').innerText();
ok('fiche : ' + (best ? best[F.nom] : '?') + ', chance et note', /%/.test(shop) && /pas un stock réel/.test(shop));
ok('fiche : horaires (' + (best ? best[F.horaires] : '') + ')', /Ouvert|Fermé|Horaires/.test(shop) && /lun\.|mar\.|mer\.|jeu\.|ven\.|sam\.|dim\.|24 h\/24|horaires OpenStreetMap/.test(shop));
ok('fiche : adresse (' + (best ? best[F.adresse] : '') + ')', !!best && shop.includes(best[F.adresse]));
const hrefs = await page.$$eval('main a', a => a.map(x => [x.textContent.trim(), x.getAttribute('href'), x.target, x.rel]));
const h = Object.fromEntries(hrefs.map(x => [x[0], x]));
ok('Itinéraire : ' + (h['Itinéraire'] || [])[1], /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=45\.\d+,4\.\d+$/.test((h['Itinéraire'] || [])[1]));
ok('Site : ' + (h['Site'] || [])[1], !!best && (h['Site'] || [])[1] === best[F.site]);
ok('Appeler : ' + (h['Appeler'] || [])[1], !!best && (h['Appeler'] || [])[1] === 'tel:' + best[F.tel].replace(/[^\d+]/g, ''));
ok('OpenStreetMap et « Signaler une erreur »', /openstreetmap\.org\/(node|way)\//.test((h['Voir la fiche OpenStreetMap'] || [])[1]) && /openstreetmap\.org\/note\/new#map=19\//.test((h['Signaler une erreur'] || [])[1]));
ok('liens externes : nouvel onglet', hrefs.filter(x => /^https/.test(x[1])).every(x => x[2] === '_blank' && /noopener/.test(x[3])));
ok('aucun badge partenaire sur la fiche', !/Partenaire Dropicards/.test(shop.replace('Dropicards n’a pas d’accord', '')));
await page.click('button:has-text("Pourquoi")'); await page.waitForTimeout(300);
ok('« Pourquoi ? » : détail des points', /Total \d+ points/.test(await page.locator('main').innerText()));
await page.click('button:has-text("Activer une alerte")'); await page.waitForTimeout(300);
ok('alerte : toast (rappel à l’ouverture, sans info de stock)', (await page.locator('text=Boutique suivie : rappel').count()) === 1);
await page.screenshot({ path: shot('ter-4-fiche.png') });
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(400);
ok('retour à Territoire', (await page.locator('section[aria-label="Boutiques autour de toi"]').count()) === 1);
// Enseigne sans site sur sa fiche OSM : site de l'enseigne.
const brandRow = page.locator('section[aria-label="Boutiques autour de toi"] button[aria-label*="chance"]:not([style*="position: absolute"])', { hasText: 'Auchan' }).first();
if (await brandRow.count()) {
  await brandRow.click(); await page.waitForTimeout(500);
  ok('enseigne : « Site de l’enseigne » → ' + await page.locator('a:has-text("Site de l’enseigne")').getAttribute('href'), (await page.locator('a:has-text("Site de l’enseigne")').getAttribute('href')) === 'https://www.auchan.fr/');
  await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(400);
}
// Encadré démo.
await page.click('button:has-text("Démo · boutiques partenaires fictives")'); await page.waitForTimeout(400);
ok('démo dépliée : partenaires visibles', (await page.locator(':text-is("★ Partenaire Dropicards")').count()) > 0);
await page.locator('button:has-text("Comptoir des Cartes")').first().click(); await page.waitForTimeout(500);
ok('magasin de démo titré « Démo · » : ' + (await page.locator('h1').first().textContent()), /^Démo · /.test(await page.locator('h1').first().textContent()));
const hs = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
ok('pas de défilement horizontal', !hs);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
