// Vidéo des 4 animations d'ouverture (2026-11-26, porteur : « propose-moi des animations du booster à l'ouverture de
// l'appli, même durée, et mets sur le booster le logo Dropicards avec le D et la carte »), en 2 × 2.
// Usage : app servie en local (E2E_BASE), puis CHROMIUM=… node tools/brand/intro/make_video.mjs
// Sortie : tools/brand/intro/propositions.mp4. Images calées sur le temps de l'animation (CSS mises en pause, puis
// avancées de 40 ms en 40 ms), donc fluides quelle que soit la machine.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from '../../web/e2e/helpers.mjs';
const BASE = process.env.E2E_BASE || 'http://localhost:8799';
const OUT = fileURLToPath(new URL('.', import.meta.url)), TMP = OUT + 'tmp/';
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const NAMES = { 1: 'Déchirure', 2: 'La carte sort', 3: 'Holo', 4: 'Coupé en deux' };
const browser = await launch();
// ONLY=2 : une seule variante, en grand (sortie ouverture-2.mp4).
const ONLY = process.env.ONLY ? [Number(process.env.ONLY)] : [1, 2, 3, 4];
for (const v of ONLY) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  // Le filet de sécurité de l'intro (4,5 s) la cacherait pendant la prise de vue image par image : il est neutralisé.
  await page.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => (ms === 4500 || ms === 5300 || ms === 7300 ? 0 : st(f, ms, ...a)); });
  await page.goto(BASE + '/?intro=1&introvis=' + v, { waitUntil: 'commit' });
  // Booster d'abord figé pendant le chargement (pi-hold, 2026-11-27) : la prise de vue commence avec l'ouverture.
  await page.waitForSelector('#pkm-intro.pi-full', { state: 'attached', timeout: 6000 });
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  await page.waitForTimeout(2500);
  // ONLY : la découpe, la sortie de la carte et son reflet aussi au ralenti (× 4, de 0,85 s à 2,8 s), ajoutée après la vidéo à vitesse réelle ;
  // filmée d'abord, car la fin de l'intro (3,5 s) la retire de la page.
  if (ONLY.length === 1) {
    const sd = TMP + 's' + v + '/'; mkdirSync(sd, { recursive: true });
    let j = 0;
    for (let t = 850; t <= 2800; t += 10) {
      await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); try { a.currentTime = t; } catch (e) { /* rien */ } }), t);
      await page.screenshot({ path: sd + String(j++).padStart(3, '0') + '.png' });
    }
  }
  const dir = TMP + 'v' + v + '/'; mkdirSync(dir, { recursive: true });
  let k = 0;
  // L'app saute les 0,3 premières secondes de l'ouverture (booster déjà resté figé pendant le chargement, 2026-11-27).
  for (let t = ONLY.length === 1 ? 300 : 0; t <= 4300; t += 40) {
    await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); try { a.currentTime = t; } catch (e) { /* rien */ } }), t);
    await page.screenshot({ path: dir + String(k++).padStart(3, '0') + '.png' });
  }
  await page.close();
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '25', '-i', dir + '%03d.png',
    '-vf', `scale=300:-2,drawtext=fontfile=${font}:text='${v} · ${NAMES[v]}':x=(w-text_w)/2:y=h-40:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6,fps=25`,
    '-an', TMP + 'c' + v + '.mp4']);
}
await browser.close();
if (ONLY.length === 1) {
  const v = ONLY[0], font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '25', '-i', TMP + 's' + v + '/%03d.png',
    '-vf', `scale=300:-2,drawtext=fontfile=${font}:text='Ralenti × 4':x=(w-text_w)/2:y=h-40:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6,fps=25`,
    '-an', TMP + 'r' + v + '.mp4']);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + 'c' + v + '.mp4', '-i', TMP + 'r' + v + '.mp4',
    '-filter_complex', '[0]tpad=stop_mode=clone:stop_duration=0.6[a];[a][1]concat=n=2:v=1:a=0,tpad=stop_mode=clone:stop_duration=0.6[v]', '-map', '[v]',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + 'ouverture-' + v + '.mp4']);
  rmSync(TMP, { recursive: true, force: true });
  console.log('vidéo écrite');
  process.exit(0);
}
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + 'c1.mp4', '-i', TMP + 'c2.mp4', '-i', TMP + 'c3.mp4', '-i', TMP + 'c4.mp4',
  '-filter_complex', '[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0,tpad=stop_mode=clone:stop_duration=1[v]', '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + 'propositions.mp4']);
rmSync(TMP, { recursive: true, force: true });
console.log('vidéo écrite');
