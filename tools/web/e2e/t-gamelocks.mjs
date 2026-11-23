// Déblocage de chaque jeu selon le grade (2026-11-23, porteur : « je suis grade Chasseur et j'ai accès à Safari éclair,
// qui n'est dispo qu'à partir du grade Collectionneur ; fais une vérification pour le déblocage de chaque jeu en fonction
// des grades »). Pour les 6 grades : Booster PK ouvert à tous (24, 20, 12, 8, 6, 4 h), pièce dès Chasseur (24, 12, 8, 6,
// 4 h), Safari éclair dès Collectionneur (24, 12, 6, 4 h). Puis les mêmes grades avec un compte « sans délai » (admin,
// mode Admin, liste du Safari) : le verrou du grade tient toujours, seule l'attente disparaît. Serveur : test_039.sql.
import { launch, BASE as E2E, shot } from './helpers.mjs';
const browser = await launch();
const res = []; const ok = (l, c) => res.push((c ? '✓ ' : '✗ ') + l); const errors = [];
const N = t => String(t).replace(/[\s  ]+/g, ' ').trim();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
await page.goto(E2E + '/?debug&start=market', { waitUntil: 'load' }); await page.waitForTimeout(1200);

const NAMES = ['Recrue', 'Chasseur', 'Collectionneur', 'Dresseur Pokémon', 'Maître Pokémon', 'Grand maître Pokémon'];
const BOOSTER = [24, 20, 12, 8, 6, 4], COIN = [0, 24, 12, 8, 6, 4], SAFARI = [0, 0, 24, 12, 6, 4];
const card = async name => { const sc = page.locator('main section[aria-label="' + name + '"]').first(); await sc.scrollIntoViewIfNeeded(); return N(await sc.innerText()); };
const atGrade = async (g, extra) => {
  await page.evaluate(v => localStorage.setItem('pkm-grade-force', v), String(g + 1));
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(900);
  await page.evaluate(x => window.__pkm.setState(Object.assign({ gradeUp: null, gameTab: 'pk', games: {} }, x)), extra || {});
  await page.waitForTimeout(250);
};

for (const [label, extra] of [['joueur', null], ['sans délai (admin, mode Admin, liste du Safari)', { sfFreeSrv: true, cloudGame: { unlimited: true } }]]) {
  const rows = [];
  for (let g = 0; g < 6; g++) {
    await atGrade(g, extra);
    const shown = await page.evaluate(() => window.__pkm.tierOf().cur.name);
    const b = await card('Booster PK'), c = await card('Pile ou face'), s = await card('Safari éclair');
    const bOk = new RegExp('toutes les ' + BOOSTER[g] + ' h').test(b) && /Ouvrir mon booster/.test(b);
    const cOk = COIN[g] ? new RegExp('toutes les ' + COIN[g] + ' h').test(c) && /Lancer la pièce/.test(c) : /🔒 Au grade Chasseur/.test(c);
    const sOk = SAFARI[g] ? (extra ? /Sans délai/.test(s) : new RegExp('toutes les ' + SAFARI[g] + ' h').test(s)) && /GO/.test(s) : /🔒 Au grade Collectionneur/.test(s);
    // Un jeu fermé ne s'ouvre pas : la fenêtre « Accès verrouillé » s'affiche à la place.
    let tapOk = true;
    if (!SAFARI[g]) {
      await page.locator('main section[aria-label="Safari éclair"] button.pkm-gm-go').click(); await page.waitForTimeout(350);
      const lw = page.locator('section[aria-label="Accès verrouillé"]');
      tapOk = (await page.locator('.pkm-sf').count()) === 0 && (await lw.count()) === 1 && /Collectionneur/.test(await lw.innerText());
      if (await lw.count()) { await lw.locator('button:has-text("Compris")').click(); await page.waitForTimeout(300); }
    }
    rows.push(NAMES[g] + ' ' + [bOk, cOk, sOk, tapOk].map(x => x ? 'o' : 'X').join(''));
    ok(label + ' · ' + NAMES[g] + ' (grade affiché : ' + shown + ') : Booster ' + BOOSTER[g] + ' h, pièce ' + (COIN[g] ? COIN[g] + ' h' : 'fermée') + ', Safari ' + (SAFARI[g] ? (extra ? 'sans délai' : SAFARI[g] + ' h') : 'fermé'),
      shown === NAMES[g] && bOk && cOk && sOk && tapOk);
  }
  console.log(label + ' : ' + rows.join(' | '));
}

// Le cas du porteur : grade Chasseur, compte admin « sans délai » → Safari fermé, fenêtre « Accès verrouillé ».
await atGrade(1, { sfFreeSrv: true, sfHours: 24, cloudGame: { unlimited: true } });
const s1 = await card('Safari éclair');
ok('Chasseur admin, serveur qui répond « 24 h » (ancien 027) : Safari toujours fermé', /🔒 Au grade Collectionneur/.test(s1) && await page.evaluate(() => window.__pkm.sfLocked()));
await page.locator('main section[aria-label="Safari éclair"]').screenshot({ path: shot('gamelocks-chasseur.png') });
// Grade de l'app Collectionneur, mais le serveur répond « fermé » (son grade est plus bas) : fermé aussi.
await atGrade(2, { sfHours: 0 });
ok('Collectionneur dans l’app, serveur « fermé » : Safari fermé', /🔒 Au grade Collectionneur/.test(await card('Safari éclair')));
// Collectionneur « sans délai » : partie jouée à l'instant, rejouable aussitôt ; joueur ordinaire : attente de 24 h.
await atGrade(2, { sfFreeSrv: true, games: { safariAt: new Date().toISOString() } });
ok('Collectionneur sans délai : rejouable aussitôt (GO)', /GO/.test(await card('Safari éclair')) && await page.evaluate(() => window.__pkm.sfWaitMs()) === 0);
await atGrade(2, { games: { safariAt: new Date().toISOString() } });
ok('Collectionneur ordinaire : « Tu dois attendre » après une partie', /Tu dois attendre 2[34] h/.test(await card('Safari éclair')));

await page.evaluate(() => localStorage.removeItem('pkm-grade-force'));
ok('aucune erreur JS', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));
console.log(res.join('\n'));
await browser.close();
if (res.some(r => r.startsWith('✗'))) process.exit(1);
