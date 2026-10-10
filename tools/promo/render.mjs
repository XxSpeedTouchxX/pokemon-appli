// Rendu d'une pub (page HTML de tools/promo) en MP4 1080 × 1920, 30 images/s, image par image.
// Lancer depuis la racine du dépôt :
//   CHROMIUM=/opt/pw-browsers/chromium node tools/promo/render.mjs --page tiktok-v3.html [--audio musique.mp3] [--out nom]
//   … --stills 1,4,9          → images fixes aux secondes indiquées (contrôle)
// Les prises de l'app (tools/promo/takes/*.mp4, workflow promo-takes.yml) sont d'abord extraites dans out/play/<prise>/.
// Avec --audio : la musique est ajoutée depuis son début, coupée à la durée de la pub avec un fondu de 0,45 s ; une
// version muette est toujours écrite à côté (pour poser le son officiel dans TikTok, calé sur le même début).
import { launch } from '../web/e2e/helpers.mjs'; // playwright-core de tools/web
import { createServer } from 'node:http';
import { readFile, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname, PROMO = ROOT + 'tools/promo/', OUT = PROMO + 'out/';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAGE = arg('page', 'tiktok-v3.html'), AUDIO = arg('audio', ''), NAME = arg('out', PAGE.replace(/\.html$/, '')), STILLS = arg('stills', '');
const TYPES = { '.jpg': 'image/jpeg', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  try { const body = await readFile(join(ROOT, path)); res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
await mkdir(OUT, { recursive: true });

// Prises de l'app : une image par fichier, numérotées depuis 0.
if (existsSync(PROMO + 'takes')) {
  for (const f of (await readdir(PROMO + 'takes')).filter(f => f.endsWith('.mp4'))) {
    const dir = OUT + 'play/' + f.replace(/\.mp4$/, '') + '/';
    await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true });
    const x = spawnSync('ffmpeg', ['-loglevel', 'error', '-i', PROMO + 'takes/' + f, '-q:v', '2', '-start_number', '0', dir + '%04d.jpg'], { stdio: 'inherit' });
    if (x.status !== 0) throw new Error('Prise illisible : ' + f);
  }
}

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('Erreur page :', e.message));
await page.goto(`http://localhost:${port}/tools/promo/${PAGE}?render=1`);
await page.evaluate(() => window.ready);
if (STILLS) {
  for (const s of STILLS.split(',').map(Number)) {
    await page.evaluate(t => window.render(t), s);
    await page.screenshot({ path: OUT + `still-${String(s).replace('.', '_')}.png` });
  }
  console.log('Images fixes :', STILLS);
} else {
  const FPS = 30, dur = await page.evaluate(() => window.DURATION), n = Math.round(dur * FPS);
  const mute = OUT + NAME + (AUDIO ? '-muet' : '') + '.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', mute], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 94 });
    if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`${f}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('Écrit :', mute);
  if (AUDIO) {
    const withSound = OUT + NAME + '.mp4', fade = 0.45;
    const x = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mute, '-i', AUDIO, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      '-af', `atrim=0:${dur},afade=t=out:st=${(dur - fade).toFixed(3)}:d=${fade},asetpts=N/SR/TB`, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', withSound], { stdio: 'inherit' });
    console.log(x.status === 0 ? 'Écrit : ' + withSound : 'Ajout du son en échec');
  }
}
await browser.close(); server.close();
