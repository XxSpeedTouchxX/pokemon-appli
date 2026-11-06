// Produit tools/supabase/004_jeu.sql depuis 004_jeu.template.sql : liste des Pokémon (tools/sprites/dex.json : forme
// précédente, méga-évolution) et leurs prix en PA (PA_PRICES de tools/web/pk.js, fixés par le porteur le 2026-11-01).
// Lancer après chaque changement de prix : node tools/supabase/gen_game.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..', '..');
const pk = readFileSync(join(ROOT, 'tools/web/pk.js'), 'utf8');
const m = /const PA_PRICES = (\{[^}]+\});/.exec(pk);
if (!m) throw new Error('PA_PRICES introuvable dans pk.js');
const prices = Function('return ' + m[1])();
const dex = JSON.parse(readFileSync(join(ROOT, 'tools/sprites/dex.json'), 'utf8')).dex;
const rows = dex.map(e => {
  const p = prices[e.n];
  if (p === undefined) throw new Error('Prix manquant pour le Pokémon ' + e.n);
  return '(' + [e.n, e.from || 0, e.mega ? 'true' : 'false', p].join(', ') + ')';
});
if (rows.length !== 171) throw new Error('171 Pokémon attendus, ' + rows.length + ' trouvés');
const sql = 'insert into public.game_pokemon (n, from_n, mega, price_pa) values\n  ' + rows.join(',\n  ') +
  '\non conflict (n) do update set from_n = excluded.from_n, mega = excluded.mega, price_pa = excluded.price_pa;';
const tpl = readFileSync(join(HERE, '004_jeu.template.sql'), 'utf8');
if (!tpl.includes('-- @POKEMON@')) throw new Error('Repère -- @POKEMON@ absent');
writeFileSync(join(HERE, '004_jeu.sql'), tpl.replace('-- @POKEMON@', sql));
console.log('004_jeu.sql : ' + rows.length + ' Pokémon, ' + rows.reduce((a, r) => a + Number(r.split(', ')[3].replace(')', '')), 0) + ' PA au total');
