// Vidéo des 4 animations « Choisir comme compagnon » (2026-11-20, porteur : « une petite animation de 2 s pour
// montrer le Pokémon qui est OK comme compagnon, propose-moi des choses »), côte à côte, pour choisir.
// Usage : app servie en local (E2E_BASE), puis CHROMIUM=… node tools/brand/compfx/make_video.mjs
// Sortie : tools/brand/compfx/propositions.mp4 (et propositions.gif).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { unlockPaid, launch } from '../../web/e2e/helpers.mjs';
const BASE = process.env.E2E_BASE || 'http://localhost:8799';
const OUT = fileURLToPath(new URL('.', import.meta.url)), TMP = OUT + 'tmp/';
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const browser = await launch();
const NAMES = { 1: 'Saut de joie', 2: 'Halo d’amitié', 3: 'Cœurs', 4: 'Direction l’accueil' };
const clips = [];
for (const v of [1, 2, 3, 4]) {
  const URL = BASE + '/?today=2026-10-04&debug&compvis=' + v;
  // Préparation sans vidéo (compte, starter, Salamèche débloqué), puis une page filmée.
  const prep = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await prep.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  const pp = await prep.newPage();
  await pp.goto(URL, { waitUntil: 'load' }); await pp.waitForTimeout(800);
  await pp.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k) || '{}'); d.tuto = 'done'; d.onb = 0; localStorage.setItem(k, JSON.stringify(d)); });
  await unlockPaid(pp);
  await pp.goto(URL, { waitUntil: 'load' }); await pp.waitForTimeout(1200);
  await pp.evaluate(() => window.__pkm.dexOpen(1)); await pp.waitForTimeout(1200);
  await pp.click('[aria-label="Starters"] button[aria-label="Choisir Bulbizarre comme starter"]'); await pp.waitForTimeout(500);
  await pp.evaluate(() => { const p = window.__pkm, s = p.st(); p.setState({ pkOwn: Array.from(new Set((s.pkOwn || []).concat([4]))), toast: null }); });
  await pp.waitForTimeout(600);
  const storage = await prep.storageState(); await prep.close();
  // Images calées sur le temps de l'animation (et non filmées) : les 4 propositions partent ensemble, à 25 images/s.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, storageState: storage });
  await ctx.route(/fonts\.(googleapis|gstatic)|openfreemap|tcgdex|pokemontcg|scrydex/, r => r.abort());
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(1500);
  await page.evaluate(() => window.__pkm.dexOpen(4)); await page.waitForTimeout(1500);
  const act = page.locator('section[aria-label="Fiche du Pokémon"] .pkm-dex-act-btn');
  await act.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  const dir = TMP + 'v' + v + '/'; mkdirSync(dir, { recursive: true });
  let k = 0;
  const snap = async () => page.screenshot({ path: dir + String(k++).padStart(3, '0') + '.png', clip: { x: 0, y: 120, width: 390, height: 600 } });
  for (let i = 0; i < 10; i++) await snap(); // 0,4 s avant l'appui
  // L'animation reste à l'écran pendant les prises de vue (elle est retirée au bout de 2 s dans l'app).
  await page.evaluate(() => { const rm = Element.prototype.remove; Element.prototype.remove = function () { if (this.classList && this.classList.contains('pkm-cmp')) return; return rm.call(this); }; });
  await act.click();
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));
  for (let t = 0; t < 2000; t += 40) {
    await page.evaluate(t => document.getAnimations().forEach(a => { try { a.currentTime = t; } catch (e) { /* rien */ } }), t);
    await snap();
  }
  await page.evaluate(() => { const el = document.querySelector('.pkm-cmp'); if (el) el.style.display = 'none'; document.querySelectorAll('.pkm-cmp-home').forEach(b => b.classList.remove('pkm-cmp-home')); });
  for (let i = 0; i < 12; i++) await snap(); // 0,5 s après
  await ctx.close();
  clips.push({ v, dir });
}
await browser.close();
// Chaque clip : 3 s à partir de l'appui, recadré sur le milieu de l'écran, titre en haut ; puis 2 × 2.
const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
for (const c of clips) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '25', '-i', c.dir + '%03d.png',
    '-vf', `scale=300:-2,drawtext=fontfile=${font}:text='${c.v} · ${NAMES[c.v].replace(/’/g, '’')}':x=(w-text_w)/2:y=10:fontsize=17:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=6,fps=25`,
    '-an', TMP + 'c' + c.v + '.mp4']);
}
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP + 'c1.mp4', '-i', TMP + 'c2.mp4', '-i', TMP + 'c3.mp4', '-i', TMP + 'c4.mp4',
  '-filter_complex', '[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[v]', '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT + 'propositions.mp4']);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', OUT + 'propositions.mp4', '-vf', 'fps=15,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse', OUT + 'propositions.gif']);
rmSync(TMP, { recursive: true, force: true });
console.log('vidéo écrite');
