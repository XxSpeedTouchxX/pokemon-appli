// H1, H4 : informations légales depuis À propos (3 rubriques) et « Règles des PK et PA » depuis « Mes PK » ; champs de
// l'éditeur à compléter. 2026-10-31 (porteur) : depuis « Mes PK », plus de bulles Mentions légales, Confidentialité,
// Conditions ; plus d'encadré « Pas un jeu d’argent » ni de « Lire le texte complet des règles ».
import { withFonts, launch, BASE as E2E, shot, ROOT } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); await withFonts(ctx);
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?start=settings', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('button:has-text("Informations légales et confidentialité")'); await page.waitForTimeout(400);
const sh = page.locator('section[aria-label="Informations légales"]');
ok('panneau ouvert : ' + await sh.locator('h2').innerText(), (await sh.locator('h2').innerText()) === 'Mentions légales');
const t1 = await sh.innerText();
ok('mentions : éditeur (micro-entreprise, adresse, téléphone), hébergeur, non-affiliation, SIRET 883 722 993 00051', /Nicolas Bouit, entrepreneur individuel/.test(t1) && /Fos-sur-Mer/.test(t1) && /\+33 7 83 55 66 09/.test(t1) && /contact@dropicards\.fr/.test(t1) && /293 B/.test(t1) && /OVH SAS/.test(t1) && !/Cloudflare/.test(t1) && /non affiliée à Nintendo, GAME FREAK ou The Pokémon Company/.test(t1) && /SIRET : 883 722 993 00051/.test(t1) && !/à compléter/.test(t1));
await page.screenshot({ path: shot('legal-mentions.png') });
const tabs = await sh.locator('[aria-label="Rubriques"] button').allInnerTexts();
ok('4 rubriques : ' + tabs.join(', '), tabs.map(t => t.trim()).join() === 'Mentions légales,Confidentialité,Utilisation,Vente (Premium)');
for (const [tab, title, re] of [['Confidentialité', 'Politique de confidentialité', /Brevo[\s\S]*Stripe[\s\S]*arrondie à environ 100 m[\s\S]*CNIL/], ['Utilisation', 'Conditions générales d’utilisation', /pas une plateforme de vente/], ['Vente (Premium)', 'Conditions générales de vente', /9,90 € par mois[\s\S]*24,90 € pour 3 mois[\s\S]*39,90 € pour 6 mois[\s\S]*69,90 € par an[\s\S]*renouvelé automatiquement[\s\S]*14 jours[\s\S]*médiateur/]]) {
  await sh.locator('[aria-label="Rubriques"] button:has-text("' + tab + '")').click(); await page.waitForTimeout(250);
  ok(tab + ' : « ' + title + ' », texte attendu', re.test(await sh.innerText()) && (await sh.locator('h2').innerText()) === title);
}
await page.screenshot({ path: shot('legal-pk.png') });
await sh.locator('button[aria-label="Fermer"]').click(); await page.waitForTimeout(700); // la fenêtre redescend d'abord (sheet.js, 2026-11-08)
ok('fermé', (await sh.count()) === 0);
await page.goto(E2E + '/', { waitUntil: 'load' }); await page.waitForTimeout(1200);
await page.click('header button[aria-label^="Mes PK"]'); await page.waitForTimeout(300);
await page.click('section[aria-label="Mes PK"] button:has-text("Règles des PK et PA")'); await page.waitForTimeout(300);
const rk = page.locator('section[aria-label="Informations légales"]');
ok('depuis « Mes PK » : « ' + (await rk.locator('h2').innerText()) + ' »', (await rk.locator('h2').innerText()) === 'Règles des PK et PA');
ok('sans bulles Mentions légales, Confidentialité, Conditions', (await rk.locator('[aria-label="Rubriques"]').count()) === 0);
const cards = await rk.locator('.pkm-rules-card').evaluateAll(els => els.map(e => e.getAttribute('aria-label')).join('|'));
ok('règles en images : ' + cards, cards === 'Gagner des PK|Booster PK|Pile ou face|Safari éclair|Délais selon le grade|Points d’Aura|PK shop' && (await rk.locator('.pkm-rules-row:not(.pkm-rules-th)').count()) === 6 && (await rk.locator('.pkm-rules-odds i').count()) === 5);
ok('plus de « Pas un jeu d’argent » ni de texte complet', (await rk.locator('details').count()) === 0 && !/Pas un jeu d’argent|Lire le texte complet/.test(await rk.innerText()));
await rk.screenshot({ path: shot('legal-regles.png') });
// Pages publiques (Stripe, Google Play, App Store) : mêmes textes que l'app.
for (const [f, re] of [['mentions-legales.html', /Nicolas Bouit, entrepreneur individuel[\s\S]*OVH SAS/], ['confidentialite.html', /Brevo[\s\S]*Stripe[\s\S]*CNIL/], ['cgu.html', /pas une plateforme de vente/], ['cgv.html', /69,90 € par an[\s\S]*Droit de rétractation/], ['supprimer-mon-compte.html', /Supprimer mon compte[\s\S]*sous 30 jours[\s\S]*10 ans/]]) {
  const r = await page.goto(E2E + '/' + f, { waitUntil: 'load' });
  ok('page publique ' + f + ' (' + r.status() + ')', r.status() === 200 && re.test(await page.locator('main').innerText()) && (await page.locator('nav[aria-label="Pages légales"] a').count()) === 4);
}
await page.goto(E2E + '/cgv.html'); await page.screenshot({ path: shot('legal-cgv-page.png'), fullPage: true });
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
