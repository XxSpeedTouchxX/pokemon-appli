// Vidéo « PA du jour » (violet) à côté du gain de PK (jaune), même animation (2026-11-26, soir, porteur : « je veux que
// l'animation des PK soit pareille que l'animation des PA, mais avec une dominante jaune et non violette »).
// Usage : app servie en local (E2E_BASE), puis CHROMIUM=… node tools/brand/pkfly/make_compare.mjs
// Sortie : tools/brand/pkfly/pa-et-pk.mp4. Animations jouées 10 fois moins vite pendant la prise de vue, remises à la
// vraie vitesse dans la vidéo.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from '../../web/e2e/helpers.mjs';
const BASE = process.env.E2E_BASE || 'http://localhost:8799';
const OUT = fileURLToPath(new URL('.', import.meta.url)), TMP = OUT + 'tmpc/';
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const RATE = 0.1, FPS = 25, LEN = 2400, font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const browser = await launch();
for (const kind of ['pa', 'pk']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  const page = await ctx.newPage();
  await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1200);
  await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; d.paDay = '2026-01-01'; localStorage.setItem(k, JSON.stringify(d)); });
  await page.goto(BASE + '/?debug', { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__pkm.setState({ pk: 1250, toast: null }); window.__pkm.tab('market'); });
  await page.waitForTimeout(900);
  if (kind === 'pa') { await page.evaluate(() => window.__pkm.setState({ paClaim: true })); await page.waitForTimeout(900); }
  else await page.evaluate(() => { const g = document.createElement('div'); g.id = 'fakegain'; g.textContent = '+60 PK'; g.style.cssText = 'position:fixed;left:50%;top:470px;transform:translateX(-50%);z-index:60;padding:14px 26px;border-radius:18px;background:#1B2440;color:#FFD60A;font:800 30px system-ui;box-shadow:0 8px 30px rgba(0,0,0,.45)'; document.body.appendChild(g); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
  await page.evaluate(rate => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / rate, ...a); }, RATE);
  const dir = TMP + kind + '/'; mkdirSync(dir, { recursive: true });
  const frames = [], t0 = Date.now();
  if (kind === 'pa') await page.click('.pkm-pa-claim-btn');
  else await page.evaluate(() => window.__pkm.pkFlyGain('#fakegain', 60, 1250, 1310));
  let k = 0;
  while ((Date.now() - t0) * RATE < LEN) {
    const t = (Date.now() - t0) * RATE, f = dir + String(k++).padStart(4, '0') + '.png';
    await page.screenshot({ path: f, clip: { x: 0, y: 0, width: 390, height: 700 } });
    frames.push({ t, f });
  }
  const list = [];
  for (let t = 0; t < LEN; t += 1000 / FPS) {
    let best = frames[0];
    for (const fr of frames) if (Math.abs(fr.t - t) < Math.abs(best.t - t)) best = fr;
    list.push("file '" + best.f + "'\nduration " + (1 / FPS));
  }
  writeFileSync(dir + 'list.txt', list.join('\n') + '\n');
  const label = kind === 'pa' ? 'PA du jour (violet)' : 'Gain de PK (jaune)';
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', dir + 'list.txt',
    '-vf', `scale=320:-2,drawtext=fontfile=${font}:text='${label}':x=(w-text_w)/2:y=h-36:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6,fps=${FPS}`, '-an', TMP + kind + '.mp4']);
  await ctx.close();
}
await browser.close();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + 'pa.mp4', '-i', TMP + 'pk.mp4', '-filter_complex', '[0][1]hstack=inputs=2,tpad=stop_mode=clone:stop_duration=1[v]', '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + 'pa-et-pk.mp4']);
rmSync(TMP, { recursive: true, force: true });
console.log('vidéo écrite');
