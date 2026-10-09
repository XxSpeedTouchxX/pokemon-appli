// Tests navigateur de la démo : sert web/, lance chaque suite (une par fichier), résume ✓ et ✗.
// Lancer : npm run e2e (toutes) ou npm run e2e -- edit value (certaines). Échec si une suite a un ✗ ou plante.
// Captures dans tools/web/e2e/out/ (non suivi par git).
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
const HERE = fileURLToPath(new URL('./', import.meta.url)), WEB = fileURLToPath(new URL('../../../web/', import.meta.url));
const PORT = Number(process.env.E2E_PORT || 8790);
const all = readdirSync(HERE).filter(f => /^t-.*\.mjs$/.test(f)).map(f => f.slice(2, -4)).sort();
const pick = process.argv.slice(2).length ? process.argv.slice(2) : all;
const server = await serve(WEB, PORT);
const env = Object.assign({}, process.env, { E2E_BASE: 'http://localhost:' + PORT });
let failed = 0;
const t0 = Date.now();
for (const name of pick) {
  const out = await new Promise(done => {
    let text = '';
    const ch = spawn(process.execPath, [HERE + 't-' + name + '.mjs'], { env: env, cwd: HERE });
    const kill = setTimeout(() => ch.kill('SIGKILL'), 10 * 60 * 1000);
    ch.stdout.on('data', d => { text += d; }); ch.stderr.on('data', d => { text += d; });
    ch.on('close', code => { clearTimeout(kill); done({ text: text, code: code }); });
  });
  const lines = out.text.split('\n'), ok = lines.filter(l => l.indexOf('✓') >= 0).length;
  const ko = lines.filter(l => l.indexOf('✗') >= 0 || /^ERREURS :|^Erreurs :|sous le seuil de contraste/.test(l) && !/^0 texte/.test(l)).length;
  const bad = ko > 0 || out.code !== 0 || ok === 0;
  if (bad) failed++;
  console.log((bad ? '✗ ' : '✓ ') + name + ' : ' + ok + ' ✓, ' + ko + ' ✗' + (out.code ? ' (code ' + out.code + ')' : ''));
  if (bad) console.log(out.text.split('\n').filter(l => /✗|Error|ERREURS|Erreurs/.test(l)).slice(0, 8).map(l => '    ' + l).join('\n'));
}
server.close();
console.log((failed ? failed + ' suite(s) en échec' : 'Toutes les suites passent') + ' · ' + Math.round((Date.now() - t0) / 1000) + ' s');
process.exit(failed ? 1 : 0);
