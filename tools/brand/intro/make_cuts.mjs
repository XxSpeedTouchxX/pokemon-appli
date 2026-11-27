// Vidéo des 4 ouvertures du booster proposées pour l'animation d'entrée (2026-11-27, porteur : « je n'aime toujours pas
// l'animation d'ouverture de booster, propose-m'en plusieurs avec une ouverture différente et une coupe nette
// satisfaisante »), en 2 × 2 : d'abord à vitesse réelle, puis la coupe au ralenti × 4.
// Usage : app servie en local (E2E_BASE), puis CHROMIUM=… node tools/brand/intro/make_cuts.mjs
// Sortie : tools/brand/intro/propositions-coupe.mp4. Avec MODE=carte : les 4 sorties de la carte après l'ouverture
// « Languette » (2026-11-27, porteur : « directement une forme de carte qui sorte du booster »), propositions-carte.mp4. Images calées sur le temps de l'animation (CSS mises en pause, puis
// avancées pas à pas), donc fluides quelle que soit la machine.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from '../../web/e2e/helpers.mjs';
const BASE = process.env.E2E_BASE || 'http://localhost:8799';
const OUT = fileURLToPath(new URL('.', import.meta.url)), TMP = OUT + 'tmpc/';
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const CARTE = process.env.MODE === 'carte';
const NAMES = CARTE ? { 1: 'Glisse et se pose', 2: 'Tourbillon', 3: 'Bond', 4: 'Lévitation holo' } : { 1: 'Ciseaux', 2: 'Sabre', 3: 'Bouchon', 4: 'Languette' };
const URL_OF = k => BASE + (CARTE ? '/?intro=1&introvis=2&introcut=4&introcarte=' : '/?intro=1&introvis=2&introcut=') + k;
const SLOW = CARTE ? [900, 2800] : [450, 1550];
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const browser = await launch();
const clip = async (page, dir, from, to, step) => {
  mkdirSync(dir, { recursive: true });
  let k = 0;
  for (let t = from; t <= to; t += step) {
    await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); try { a.currentTime = t; } catch (e) { /* rien */ } }), t);
    await page.screenshot({ path: dir + String(k++).padStart(3, '0') + '.png' });
  }
};
const enc = (dir, label, out) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '25', '-i', dir + '%03d.png',
  '-vf', `scale=300:-2,drawtext=fontfile=${font}:text='${label}':x=(w-text_w)/2:y=h-40:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6,fps=25`,
  '-an', out]);
for (const k of [1, 2, 3, 4]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  // Le filet de sécurité de l'intro (4,5 s) la cacherait pendant la prise de vue image par image : il est neutralisé.
  await page.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => (ms === 4500 || ms === 5300 || ms === 7300 ? 0 : st(f, ms, ...a)); });
  await page.goto(URL_OF(k), { waitUntil: 'commit' });
  // Booster d'abord figé pendant le chargement (pi-hold, 2026-11-27) : la prise de vue commence avec l'ouverture.
  await page.waitForSelector('#pkm-intro.pi-full', { state: 'attached', timeout: 6000 });
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  await page.waitForTimeout(2500);
  // Ralenti d'abord : la fin de l'intro (3,5 s) la retire de la page.
  await clip(page, TMP + 's' + k + '/', SLOW[0], SLOW[1], 10);
  await clip(page, TMP + 'v' + k + '/', 0, 4300, 40);
  await page.close();
  enc(TMP + 'v' + k + '/', `${k} · ${NAMES[k]}`, TMP + 'c' + k + '.mp4');
  enc(TMP + 's' + k + '/', `${k} · ${NAMES[k]} · ralenti × 4`, TMP + 'r' + k + '.mp4');
}
await browser.close();
const grid = (p, out) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + p + '1.mp4', '-i', TMP + p + '2.mp4', '-i', TMP + p + '3.mp4', '-i', TMP + p + '4.mp4',
  '-filter_complex', '[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0,tpad=stop_mode=clone:stop_duration=0.6[v]', '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out]);
grid('c', TMP + 'gc.mp4'); grid('r', TMP + 'gr.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + 'gc.mp4', '-i', TMP + 'gr.mp4', '-filter_complex', '[0][1]concat=n=2:v=1:a=0[v]', '-map', '[v]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + (CARTE ? 'propositions-carte.mp4' : 'propositions-coupe.mp4')]);
rmSync(TMP, { recursive: true, force: true });
console.log('vidéo écrite');
