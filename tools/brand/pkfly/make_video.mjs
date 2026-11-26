// Vidéo des 4 animations calmes de gain de PK (2026-11-26, porteur : « je ne veux plus voir toutes ces pièces qui
// partent dans tous les sens, propose-m'en d'autres sans les animations dans tous les sens »), en 2 × 2.
// Usage : app servie en local (E2E_BASE), puis node tools/brand/pkfly/make_video.mjs
// Sortie : tools/brand/pkfly/propositions.mp4. Les animations tournent 10 fois moins vite pendant la prise de vue
// (CDP Animation.setPlaybackRate, minuteries ralenties d'autant), puis la vidéo est remise à la vraie vitesse.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from '../../web/e2e/helpers.mjs';
const BASE = process.env.E2E_BASE || 'http://localhost:8799';
const OUT = fileURLToPath(new URL('.', import.meta.url)), TMP = OUT + 'tmp/';
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const NAMES = { 1: 'Compteur', 2: 'Une seule gemme', 3: 'Le gain s’envole', 4: 'Trait de lumière' };
const RATE = 0.1, FPS = 25, LEN = 2800; // durée filmée (ms de l'animation)
const browser = await launch();
for (const v of [1, 2, 3, 4]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  const page = await ctx.newPage();
  await page.goto(BASE + '/?debug&pkfly=' + v, { waitUntil: 'load' }); await page.waitForTimeout(1200);
  await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d)); });
  await page.goto(BASE + '/?debug&pkfly=' + v, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__pkm.setState({ pk: 1250, toast: null }); window.__pkm.tab('market'); });
  await page.waitForTimeout(900);
  // Gain affiché au milieu de l'écran, comme le résultat d'un jeu.
  await page.evaluate(() => {
    const g = document.createElement('div');
    g.id = 'fakegain'; g.textContent = '+60 PK';
    g.style.cssText = 'position:fixed;left:50%;top:470px;transform:translateX(-50%);z-index:60;padding:14px 26px;border-radius:18px;background:#1B2440;color:#FFD60A;font:800 30px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.45)';
    document.body.appendChild(g);
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
  await page.evaluate(rate => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / rate, ...a); }, RATE);
  const dir = TMP + 'v' + v + '/'; mkdirSync(dir, { recursive: true });
  const frames = [];
  const t0 = Date.now();
  await page.evaluate(() => window.__pkm.pkFlyGain('#fakegain', 60, 1250, 1310));
  let k = 0;
  while ((Date.now() - t0) * RATE < LEN) {
    const t = (Date.now() - t0) * RATE, f = dir + String(k++).padStart(4, '0') + '.png';
    await page.screenshot({ path: f, clip: { x: 0, y: 0, width: 390, height: 640 } });
    frames.push({ t, f });
  }
  // Une image toutes les 40 ms d'animation : la prise la plus proche.
  const list = [];
  for (let t = 0; t < LEN; t += 1000 / FPS) {
    let best = frames[0];
    for (const fr of frames) if (Math.abs(fr.t - t) < Math.abs(best.t - t)) best = fr;
    list.push("file '" + best.f + "'\nduration " + (1 / FPS));
  }
  const { writeFileSync } = await import('node:fs');
  writeFileSync(dir + 'list.txt', list.join('\n') + '\n');
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', dir + 'list.txt',
    '-vf', `scale=300:-2,drawtext=fontfile=${font}:text='${v} · ${NAMES[v]}':x=(w-text_w)/2:y=h-34:fontsize=17:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6,fps=${FPS}`,
    '-an', TMP + 'c' + v + '.mp4']);
  await ctx.close();
}
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + 'c1.mp4', '-i', TMP + 'c2.mp4', '-i', TMP + 'c3.mp4', '-i', TMP + 'c4.mp4',
  '-filter_complex', '[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0,tpad=stop_mode=clone:stop_duration=1[v]', '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + 'propositions.mp4']);
rmSync(TMP, { recursive: true, force: true });
console.log('vidéo écrite');
