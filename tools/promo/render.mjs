// Rendu de la pub TikTok (tiktok-30ans.html) en MP4 1080 × 1920, 30 images/s, image par image.
// Lancer depuis la racine du dépôt :
//   CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs            → tools/promo/out/dropicards-tiktok-30ans.mp4
//   CHROMIUM=... node tools/promo/render.mjs --stills 1,4,9,13,18,24          → captures fixes aux secondes indiquées
import { launch } from '../web/e2e/helpers.mjs'; // playwright-core de tools/web
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, normalize } from 'node:path';
const ROOT = new URL('../../', import.meta.url).pathname, OUT = ROOT + 'tools/promo/out/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  try { const body = await readFile(join(ROOT, path)); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
await mkdir(OUT, { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('Erreur page :', e.message));
await page.goto(`http://localhost:${port}/tools/promo/tiktok-30ans.html?render=1`);
await page.evaluate(() => window.ready);
const stills = process.argv.indexOf('--stills');
if (stills > 0) {
  for (const s of process.argv[stills + 1].split(',').map(Number)) {
    await page.evaluate(t => window.render(t), s);
    await page.screenshot({ path: OUT + `still-${String(s).replace('.', '_')}.png` });
    console.log('still', s);
  }
} else {
  const FPS = 30, dur = await page.evaluate(() => window.DURATION), n = Math.round(dur * FPS), file = OUT + 'dropicards-tiktok-30ans.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 90 === 0) console.log(`${f}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('Écrit :', file);
}
await browser.close(); server.close();
