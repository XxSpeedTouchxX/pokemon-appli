// Prix des styles PRO de l'avatar : les mêmes dans l'app (tools/web/avatar.js) et sur le serveur (014_avatar.sql).
import { readFileSync } from 'fs';
const js = readFileSync(new URL('../../web/avatar.js', import.meta.url), 'utf8'), sql = readFileSync(new URL('../014_avatar.sql', import.meta.url), 'utf8');
const cat = { AV_SKIN: 'skin', AV_EYES: 'eyes', AV_HAIR: 'hair', AV_HC: 'hc', AV_OUTFIT: 'outfit', AV_BG: 'bg' }, app = {};
for (const [k, c] of Object.entries(cat)) {
  const m = new RegExp('const ' + k + ' = ([\\s\\S]*?);\\n').exec(js)[1];
  for (const x of m.matchAll(/id: '([a-z0-9]+)'[^}]*?pa: (\d+)/g)) app[c + ':' + x[1]] = Number(x[2]);
  for (const x of m.matchAll(/\['([a-z0-9]+)', '[^']*', '#[0-9A-F]{6}'\]\)\.map\(\(\[id, label, c\]\) => \(\{ id: id, label: label, c: c, pa: (\d+)/g)) app[c + ':' + x[1]] = Number(x[2]);
}
// Listes compactes [id, libellé, couleur] suivies de « pa: N » (teints et couleurs de cheveux PRO).
for (const [k, c] of [['AV_SKIN', 'skin'], ['AV_HC', 'hc']]) {
  const m = new RegExp('const ' + k + ' = ([\\s\\S]*?);\\n').exec(js)[1], tail = /concat\(\[([\s\S]*?)\]\.map\([\s\S]*?pa: (\d+)/.exec(m);
  if (tail) for (const x of tail[1].matchAll(/\['([a-z0-9]+)'/g)) app[c + ':' + x[1]] = Number(tail[2]);
}
app['slot:2'] = Number(/AV_SLOT2 = \{[^}]*pa: (\d+)/.exec(js)[1]);
const srv = {}; for (const x of sql.matchAll(/\('([a-z0-9]+:[a-z0-9]+)', (\d+)\)/g)) srv[x[1]] = Number(x[2]);
const keys = [...new Set([...Object.keys(app), ...Object.keys(srv)])].sort(), bad = keys.filter(k => app[k] !== srv[k]);
console.log(keys.length + ' styles PRO comparés' + (bad.length ? ' · différences : ' + bad.map(k => k + ' app ' + app[k] + ' / serveur ' + srv[k]).join(', ') : ' · identiques'));
process.exit(bad.length || keys.length !== 21 ? 1 : 0);
