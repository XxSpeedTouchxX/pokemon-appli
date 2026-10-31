import { launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
// Page Sorties : sections, liens des enseignes, alerte, entrées, date réelle.
const BASE = E2E + '/';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const stub = (w, h, c) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${c}"/></svg>`;
await ctx.route('https://assets.tcgdex.net/**', r => r.fulfill({ contentType: 'image/svg+xml', body: stub(300, 120, '#F5C542') }));
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|pokemontcg/, r => r.abort());
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l);
const titles = () => page.$$eval('main article h3', h => h.map(x => x.textContent.trim()));
await page.goto(BASE + '?today=2026-10-04#sorties', { waitUntil: 'load' }); await page.waitForTimeout(1300);
const h2 = await page.$$eval('main h2', h => h.map(x => x.textContent.trim()));
ok('sections : ' + h2.join(' | '), h2.includes('Invitations Amazon') && h2.indexOf('À venir') < h2.indexOf('Sorties récentes'));
const t = await titles();
ok(t.length + ' produits, premier à venir : ' + t[0], t.length >= 10 && /Deck Combat/.test(t[0]));
const tags = await page.$$eval('main article button > span:nth-of-type(1)', s => s.map(x => x.textContent.trim()).filter(x => /jours|Sorti|Demain|Aujourd/.test(x)));
ok('pastilles : ' + tags.slice(0, 3).join(' · ') + ' … ' + tags.slice(-2).join(' · '), /Dans 26 jours/.test(tags[0]));
const links = await page.$$eval('main article a', as => as.map(a => ({ href: a.href, target: a.target, rel: a.rel, text: a.textContent.trim() })));
const etb = await page.$$eval('main article', arts => { const a = arts.find(x => /Coffret Dresseur d’élite 30ᵉ/.test(x.querySelector('h3').textContent)); return a ? [...a.querySelectorAll('a')].map(l => l.href) : []; });
ok('ETB 30ᵉ : fiche Amazon ' + (etb[0] || ''), etb[0] === 'https://www.amazon.fr/dp/B0H8SVJL9F');
ok('ETB 30ᵉ : eBay, Fnac, Cultura, Micromania', etb.length === 5 && /ebay\.fr\/sch/.test(etb[1]) && /fnac\.com\/SearchResult/.test(etb[2]) && /cultura\.com\/search/.test(etb[3]) && /micromania\.fr/.test(etb[4]));
ok(links.length + ' liens : aucun paramètre d’affiliation ni de pistage', links.length > 40 && links.every(l => !/[?&](tag|ref|aff|utm_[a-z]+|affiliate|campid)=/i.test(l.href)));
ok('liens : nouvel onglet, noopener noreferrer', links.every(l => l.target === '_blank' && /noopener/.test(l.rel) && /noreferrer/.test(l.rel)));
const upc = await page.$$eval('main article', arts => { const a = arts.find(x => /Ultra-Premium/.test(x.querySelector('h3').textContent)); return a ? a.innerText : ''; });
ok('UPC : prix de lancement 229,99 € à 239,99 € et source', /229,99\s€ à 239,99\s€/.test(upc) && /boostacote/.test(upc));
ok('UPC : précommandes Cardmarket, pas de cote avant la sortie', /Précommandes Cardmarket/.test(upc) && !/Cote Cardmarket/.test(upc));
ok('UPC : recherche Amazon (pas d’ASIN connu)', /Amazon/.test(upc));
// Alerte.
await page.locator('main article').first().locator('button:has-text("Me prévenir")').click();
await page.waitForTimeout(300);
ok('alerte : toast (rappel à l’ouverture de l’app)', (await page.locator('text=Alerte enregistrée : tu seras prévenu').count()) > 0);
await page.waitForTimeout(500);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('pkm-collection-v1') || '{}').alerts || {});
ok('alerte enregistrée : ' + Object.keys(saved).filter(k => k.startsWith('rel:')).join(', '), Object.keys(saved).some(k => k.startsWith('rel:')));
await page.screenshot({ path: shot('sorties-1.png') });
await page.evaluate(() => { document.querySelector('#app main').scrollTop = 1500; }); await page.waitForTimeout(300);
await page.screenshot({ path: shot('sorties-2.png') });
// Retour : l'accueil (2026-10-11 : le Marché est devenu Jeux).
await page.click('button[aria-label="Retour"]'); await page.waitForTimeout(400);
ok('retour vers l’accueil', (await page.locator('section[aria-label="Valeur de ma collection"]').count()) > 0);
// Entrées.
await page.goto(BASE + '?today=2026-10-04', { waitUntil: 'load' }); await page.waitForTimeout(1200);
// « Toutes les sorties » seulement à côté de « Prochaines sorties » (2026-10-31, porteur).
ok('« Sorties récentes » sans « Toutes les sorties »', (await page.locator('section[aria-label="Sorties récentes"] button:has-text("Toutes les sorties")').count()) === 0);
await page.click('section[aria-label="Prochaines sorties"] button:has-text("Toutes les sorties")'); await page.waitForTimeout(400);
ok('Accueil → Sorties', (await page.locator('text=Invitations Amazon').count()) > 0);
await page.goto(BASE + '?today=2026-10-04&start=search', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button:has-text("Sorties · Pokémon 30 ans")'); await page.waitForTimeout(400);
ok('Marché → Sorties', (await page.locator('text=Invitations Amazon').count()) > 0);
await page.goto(BASE + '?today=2026-10-04&start=territory', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button[aria-label^="Prochaine sortie"]'); await page.waitForTimeout(400);
ok('Territoire → Sorties', (await page.locator('text=Invitations Amazon').count()) > 0);
// Date réelle : après le 6 novembre, Règne Delta est sorti et l'UPC a une cote.
await page.goto('about:blank'); await page.goto(BASE + '?today=2026-11-07#sorties', { waitUntil: 'load' }); await page.waitForTimeout(1300);
const recent = await page.$$eval('main article', arts => arts.map(a => a.innerText));
ok('07/11 : Règne Delta dans les sorties récentes', recent.some(x => /Règne Delta/.test(x) && /Sorti le 06\/11/.test(x)));
ok('07/11 : UPC avec cote Cardmarket', recent.some(x => /Ultra-Premium/.test(x) && /Cote Cardmarket/.test(x)));
const hs = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
ok('pas de défilement horizontal', !hs);
console.log(res.join('\n'));
console.log(errors.length ? 'Erreurs : ' + errors.join(' | ') : 'aucune erreur');
await browser.close();
