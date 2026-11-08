// Carte gradée (2026-11-01, porteur) : à l'ajout d'une carte, « Carte gradée » Non / Oui, entreprise (PCA, CCC, PSA)
// et note ; valeur = cote Cardmarket × coefficient de la note ; dans le classeur, une carte à part pour la note, avec
// le logo de l'entreprise et la note ; « Tout afficher › Gradées » ; fiche : logo et note dans « État de ma carte ».
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const num = t => Number(N(t).replace(/[^\d,]/g, '').replace(',', '.'));
const ID = 'sv08-238'; // Pikachu-ex, Étincelles Déferlantes
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
await page.goto(E2E + '/?today=2026-10-31&debug', { waitUntil: 'load' }); await page.waitForTimeout(2000);
await page.evaluate(() => window.__pkm.resetCollection('empty')); await page.waitForTimeout(500);
// Un exemplaire non gradé, puis un PSA 10.
const add = async graded => {
  await page.evaluate(id => window.__pkm.fiOpen(id), ID); await page.waitForTimeout(700);
  await page.click('section.pkm-fi button.pkm-fi-main'); await page.waitForTimeout(300);
  const SH = 'section[aria-label="Saisie"]';
  if (graded) await graded(SH);
  await page.locator(SH + ' button:has-text("Ajouter à ma collection"), ' + SH + ' button:has-text("Ajouter un exemplaire")').last().click(); await page.waitForTimeout(500);
  await page.locator('section.pkm-fi button[aria-label="Fermer"]').click(); await page.waitForTimeout(700); // la fiche redescend d'abord (sheet.js)
};
const SH = 'section[aria-label="Saisie"]';
await add(null);
let nm = 0, psa = 0, coteNM = 0;
await add(async SH => {
  const yn = page.locator(SH + ' [aria-label="Carte gradée"] button');
  ok('rubrique « Carte gradée » : ' + (await yn.allInnerTexts()).join(' / ') + ', Non par défaut', (await yn.allInnerTexts()).join(',') === 'Non,Oui' && (await yn.nth(0).getAttribute('aria-pressed')) === 'true');
  coteNM = num((await page.locator(SH).innerText()).match(/Valeur Cardmarket à l’unité[^\n]*\n?\s*([\d\s  ]+,\d\d)/)[1]);
  await yn.nth(1).click(); await page.waitForTimeout(200);
  const cos = page.locator(SH + ' [aria-label="Entreprise de gradation"] button');
  ok('entreprises : ' + (await cos.evaluateAll(b => b.map(x => x.getAttribute('aria-label')))).join(', '), (await cos.count()) === 3);
  ok('logos chargés', (await cos.locator('img').evaluateAll(im => im.every(i => i.complete && i.naturalWidth > 0))));
  ok('l’état (Mint à Poor) disparaît : la note le remplace', (await page.locator('[aria-label="État de l’exemplaire"]').count()) === 0);
  await cos.filter({ has: page.locator('img') }).nth(1).click(); await page.waitForTimeout(150); // CCC
  const notes = page.locator(SH + ' [aria-label="Note de la carte"] button');
  ok('notes CCC : ' + (await notes.allInnerTexts()).map(N).join(' | '), (await notes.allInnerTexts()).map(N).join('|') === '10 Black Label|10 Gold Label|10|9,5|9|8|7|6');
  await cos.nth(2).click(); await page.waitForTimeout(150); // PSA
  ok('notes PSA : ' + (await notes.allInnerTexts()).map(N).join(' | '), (await notes.allInnerTexts()).map(N).join('|') === '10|9|8|7|6');
  await notes.nth(0).click(); await page.waitForTimeout(200);
  const t = await page.locator(SH).innerText();
  const unit = num(t.match(/Valeur Cardmarket à l’unité[^\n]*\n?\s*([\d\s  ]+,\d\d)/)[1]);
  ok('valeur PSA 10 : ' + unit + ' € = cote ' + coteNM + ' × 3,5', Math.abs(unit - Math.round(coteNM * 3.5 * 100) / 100) < 0.02 && /PSA 10/.test(t));
  ok('note d’estimation : « ' + N(await page.locator(SH + ' .pkm-gr-note').innerText()).slice(0, 70) + '… »', /PSA 10 : environ/.test(await page.locator(SH + ' .pkm-gr-note').innerText()));
  await page.screenshot({ path: shot('graded-add.png') });
});
const line = await page.evaluate(() => window.__pkm.st().purchases.slice(-1)[0].lines[0]);
ok('ligne enregistrée : ' + JSON.stringify(line), line.gr === 'PSA-10' && line.pid === 'sv08-238');
// Classeur : deux cartes, dont une avec le logo PSA et la note 10.
await page.goto(E2E + '/?today=2026-10-31&start=home', { waitUntil: 'load' }); await page.waitForTimeout(2000);
const tiles = page.locator('section[aria-label="Mon classeur"] [role="tabpanel"] button[aria-label^="Pikachu-ex"]');
const labels = await tiles.evaluateAll(b => b.map(x => x.getAttribute('aria-label')));
ok('classeur : ' + labels.length + ' cartes Pikachu-ex (gradée à part) · ' + labels.map(l => l.split(', cote')[0]).join(' / '), labels.length === 2 && labels.some(l => /gradée PSA 10/.test(l)) && labels.some(l => !/gradée/.test(l)));
const badge = tiles.filter({ has: page.locator('.pkm-gr-badge') });
ok('pastille sur la carte gradée : logo PSA et « ' + N(await badge.locator('.pkm-gr-badge b').innerText()) + ' »', (await badge.count()) === 1 && N(await badge.locator('.pkm-gr-badge b').innerText()) === '10'
  && (await badge.locator('.pkm-gr-badge img').evaluate(i => i.complete && i.naturalWidth > 0 && /psa/.test(i.src))));
ok('pas de bulle d’état sur la carte gradée', (await badge.locator('.pkm-cond-ico').count()) === 0);
const vs = await tiles.evaluateAll(b => b.map(x => x.getAttribute('aria-label').match(/cote ([^.]*)/)[1]));
const vG = num(vs[labels.findIndex(l => /gradée/.test(l))]), vR = num(vs[labels.findIndex(l => !/gradée/.test(l))]);
ok('valeurs : PSA 10 ' + vG + ' €, non gradée ' + vR + ' €', Math.abs(vG - vR * 3.5) < 0.05);
const head = num(await page.locator('section[aria-label="Mon classeur"]').locator('text=/€/').first().innerText().catch(() => '0'));
await page.locator('section[aria-label="Mon classeur"]').scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
await page.screenshot({ path: shot('graded-binder.png') });
// Tout afficher › Gradées
await page.click('section[aria-label="Mon classeur"] button:has-text("Tout afficher")'); await page.waitForTimeout(600);
const chips = await page.locator('button:has-text("Gradées")').first().innerText();
ok('Tout afficher : « ' + N(chips) + ' »', /Gradées \(1\)/.test(N(chips)));
await page.locator('button:has-text("Gradées")').first().click(); await page.waitForTimeout(300);
ok('filtre Gradées : la carte PSA 10 avec sa pastille', (await page.locator('.pkm-hf-tile .pkm-gr-badge').count()) === 1);
await page.screenshot({ path: shot('graded-full.png') });
await page.goBack().catch(() => {}); await page.waitForTimeout(300);
// Fiche : « État de ma carte » montre la note.
await page.evaluate(id => window.__pkm.fiOpen(id), ID); await page.waitForTimeout(800);
const et = await page.locator('section.pkm-fi .pkm-fi-etat').allInnerTexts();
ok('fiche : ' + et.map(N).join(' / '), et.length === 2 && et.some(t => /PSA 10/.test(t)) && et.some(t => /Near Mint/.test(t)));
ok('fiche : logo PSA dans l’état gradé', (await page.locator('section.pkm-fi .pkm-fi-etat-gr img').evaluate(i => /psa/.test(i.src) && i.naturalWidth > 0)));
ok('aucune erreur JS', errors.length === 0);
console.log(res.join('\n')); if (errors.length) console.log('Erreurs :', errors);
await browser.close();
