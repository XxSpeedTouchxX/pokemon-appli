// Icônes et écrans de démarrage des apps iOS et Android, icône et image de présentation de Google Play (2026-11-07,
// « go » du porteur ; docs/23 §4 travail 4). Même dessin que les icônes du site (make_icons.mjs) : le monogramme
// « D » + carte « O » (web/img/brand/monogram.svg) sur le jaune de la marque, rendu net par Chromium.
//   - iOS : AppIcon 1024 × 1024 sans transparence (exigence d'Apple), écran de démarrage 2732 × 2732 ;
//   - Android : icônes classiques et rondes, icône adaptative (avant-plan dans la zone sûre, fond jaune), écrans de
//     démarrage de chaque densité (mêmes tailles que ceux créés par Capacitor) ;
//   - Google Play : icône 512 × 512 et image de présentation 1024 × 500 (docs/29-fiches-stores/).
// Usage : CHROMIUM=/chemin/vers/chromium node tools/brand/app/make_store_assets.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const req = createRequire(ROOT + 'tools/web/package.json');
const { chromium } = req('playwright-core');
const YELLOW = '#FFD60A', INK = '#111111';
const mono = readFileSync(ROOT + 'web/img/brand/monogram.svg', 'utf8').replace(/<title>.*?<\/title>/, '');
const logo = readFileSync(ROOT + 'web/img/brand/dropicards.svg', 'utf8').replace(/<title>.*?<\/title>/, '');
const RES = ROOT + 'mobile/android/app/src/main/res/';
const IOS = ROOT + 'mobile/ios/App/App/Assets.xcassets/';
const STORE = ROOT + 'docs/29-fiches-stores/';
mkdirSync(STORE, { recursive: true });

// Monogramme centré dans un carré de 512 : part = place occupée (largeur et hauteur).
const monoIn = part => {
  const box = mono.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number), k = Math.min(512 * part / box[2], 512 * part / box[3]);
  const w = box[2] * k, h = box[3] * k;
  return mono.replace(/<svg[^>]*>/, `<svg x="${(512 - w) / 2}" y="${(512 - h) / 2}" width="${w}" height="${h}" viewBox="${box.join(' ')}">`);
};
const html = (w, h, body, vb = '0 0 512 512') => `<!doctype html><html><body style="margin:0;background:transparent">
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${body}</svg></body></html>`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const tab = await browser.newPage();
const render = async (w, h, body, opaque, vb) => {
  await tab.setViewportSize({ width: w, height: h });
  await tab.setContent(html(w, h, body, vb));
  return tab.screenshot({ omitBackground: !opaque, type: 'png' });
};
const full = `<rect width="512" height="512" fill="${YELLOW}"/>`;
const rounded = `<rect x="20" y="20" width="472" height="472" rx="112" fill="${YELLOW}" stroke="${INK}" stroke-width="24"/>`;
const round = `<circle cx="256" cy="256" r="240" fill="${YELLOW}" stroke="${INK}" stroke-width="20"/>`;
const out = [];
const save = (path, buf) => { writeFileSync(path, buf); out.push(path.replace(ROOT, '')); };

// iOS : icône sans transparence (fond jaune plein, le système arrondit), écran de démarrage.
save(IOS + 'AppIcon.appiconset/AppIcon-512@2x.png', await render(1024, 1024, full + monoIn(0.9), true));
const splash = (w, h) => {
  // Monogramme au centre, à 28 % du petit côté, sur le jaune (le reste de l'écran aussi en jaune).
  const s = Math.min(w, h) * 0.28;
  return `<rect width="${w}" height="${h}" fill="${YELLOW}"/><svg x="${(w - s) / 2}" y="${(h - s) / 2}" width="${s}" height="${s}" viewBox="0 0 512 512">${monoIn(1)}</svg>`;
};
for (const f of readdirSync(IOS + 'Splash.imageset').filter(f => f.endsWith('.png'))) save(IOS + 'Splash.imageset/' + f, await render(2732, 2732, splash(2732, 2732), true, '0 0 2732 2732'));

// Android : icônes de chaque densité (48 dp ; avant-plan adaptatif 108 dp, monogramme dans la zone sûre de 66 dp).
const DENS = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(DENS)) {
  save(RES + 'mipmap-' + d + '/ic_launcher.png', await render(48 * k, 48 * k, rounded + monoIn(0.86), false));
  save(RES + 'mipmap-' + d + '/ic_launcher_round.png', await render(48 * k, 48 * k, round + monoIn(0.78), false));
  save(RES + 'mipmap-' + d + '/ic_launcher_foreground.png', await render(108 * k, 108 * k, monoIn(0.56), false));
}
writeFileSync(RES + 'values/ic_launcher_background.xml', `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${YELLOW}</color>\n</resources>\n`);
// Écrans de démarrage Android : mêmes tailles que les fichiers de Capacitor.
const sizeOf = p => { const b = readFileSync(p); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
for (const dir of readdirSync(RES).filter(x => /^drawable/.test(x))) {
  const p = RES + dir + '/splash.png';
  let wh;
  try { wh = sizeOf(p); } catch (e) { continue; }
  save(p, await render(wh[0], wh[1], splash(wh[0], wh[1]), true, '0 0 ' + wh[0] + ' ' + wh[1]));
}

// Google Play : icône 512 et image de présentation 1024 × 500 (logo Dropicards sur le jaune, phrase de l'app).
save(STORE + 'play-icone-512.png', await render(512, 512, full + monoIn(0.9), true));
const lb = logo.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number), lw = 760, lh = lw * lb[3] / lb[2];
const feature = `<rect width="1024" height="500" fill="${YELLOW}"/>
<svg x="${(1024 - lw) / 2}" y="${150 - lh / 2}" width="${lw}" height="${lh}" viewBox="${lb.join(' ')}">${logo.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</svg>
<text x="512" y="370" text-anchor="middle" font-family="system-ui, sans-serif" font-size="44" font-weight="800" fill="${INK}">La vraie valeur de ta collection</text>
<text x="512" y="425" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" font-weight="600" fill="${INK}">Cartes et scellé au prix du marché, chaque jour</text>`;
save(STORE + 'play-presentation-1024x500.png', await render(1024, 500, feature, true, '0 0 1024 500'));
await browser.close();
console.log('Icônes et écrans : ' + out.length + ' fichiers');
