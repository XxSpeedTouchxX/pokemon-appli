// Tests de la couche de thème (tools/web/theme.mjs) : node --test tools/web/test_theme.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOKENS, RULES, V6_LIGHT, V6_DARK, themeTemplate, themeScript, cssVars, v6Css, usedTokens } from './theme.mjs';

const RULE = (g, c, to, o) => [g, c, to, o || {}];

test('couleur du gabarit remplacée par sa variable, transparence gardée', () => {
  const rules = [RULE('bg', '#111A2C', 'var(--pkm-card)', { surface: true }), RULE('*', 'rgb(0, 0, 0)', 'rgb:shadow'), RULE('fg', '#F3F6FC', 'var(--pkm-t1)')];
  const r = themeTemplate('<div style="background: #111a2c; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35); color: #F3F6FC">x</div>', rules);
  assert.deepEqual(r.missing, []);
  assert.equal(r.tpl, '<div class="pkm-dark" style="background: var(--pkm-card); box-shadow: 0 2px 4px rgba(var(--pkm-shadow-rgb), 0.35); color: var(--pkm-t1)">x</div>');
  assert.equal(r.surfaces, 1);
  assert.equal(r.replaced, 3);
});

test('surface : classe ajoutée à la classe existante', () => {
  const r = themeTemplate('<span class="pkm-anim" style="background: #111A2C">x</span>', [RULE('bg', '#111A2C', 'var(--pkm-card)', { surface: true })]);
  assert.match(r.tpl, /class="pkm-anim pkm-dark"/);
});

test('contexte et fond de la même balise départagent une couleur à deux rôles', () => {
  const rules = [
    RULE('bg', '#A8B6FF', 'var(--pkm-accent)'),
    RULE('fg', '#0B1120', 'var(--pkm-on-accent)', { bg: 'var(--pkm-accent)', n: 1 }),
    RULE('fg', '#0B1120', 'var(--pkm-ink)'),
    RULE('bg', '#0B1120', 'var(--pkm-app)', { ctx: /class="pkm-root"/, n: 1 })
  ];
  const r = themeTemplate('<div class="pkm-root" style="background: #0B1120"><button style="color: #0B1120; background: #A8B6FF">a</button><span style="background: #F5B14C; color: #0B1120">b</span></div>',
    rules.concat([RULE('bg', '#F5B14C', 'var(--pkm-orange)')]));
  assert.deepEqual(r.wrong, []);
  assert.match(r.tpl, /color: var\(--pkm-on-accent\); background: var\(--pkm-accent\)/);
  assert.match(r.tpl, /background: var\(--pkm-orange\); color: var\(--pkm-ink\)/);
  assert.match(r.tpl, /class="pkm-root" style="background: var\(--pkm-app\)"/);
});

test('couleur sans règle et règle mal appliquée signalées', () => {
  const r = themeTemplate('<p style="color: #123456">x</p><p style="color: #F3F6FC">y</p>', [RULE('fg', '#F3F6FC', 'var(--pkm-t1)', { n: 2 })]);
  assert.equal(r.missing.length, 1);
  assert.match(r.missing[0], /^fg\|#123456/);
  assert.equal(r.wrong.length, 1);
  assert.match(r.wrong[0], /1 au lieu de 2/);
});

test('couleurs gardées : masques et « keep »', () => {
  const r = themeTemplate('<div style="mask-image: linear-gradient(90deg, #000 80%, transparent)">x</div>', [RULE('mask', '#000', 'keep')]);
  assert.deepEqual(r.missing, []);
  assert.match(r.tpl, /#000 80%/);
});

test('logique : chaînes des méthodes remplacées, méthodes gardées intactes, retouches exactes', () => {
  const js = "\n  chip(on) {\n    return { bg: on ? '#26345A' : 'transparent', bc: on ? '#3A4A75' : '#2A3A5C', fg: on ? '#FFFFFF' : '#C9D3EA' };\n  }"
    + "\n  flag(lang) {\n    return '#0055A4';\n  }"
    + "\n  probLevel(n) {\n    return n > 1 ? { color: '#3DDC84', tint: 'rgba(61, 220, 132, 0.16)' } : { color: '#9AA8C3' };\n  }";
  const r = themeScript(js);
  assert.deepEqual(r.missing, []);
  assert.deepEqual(r.wrong, []);
  assert.match(r.js, /bg: on \? 'var\(--pkm-chip-on-bg\)' : 'var\(--pkm-chip-bg\)'/);
  assert.match(r.js, /fg: on \? 'var\(--pkm-chip-on-fg\)' : 'var\(--pkm-chip-fg\)'/);
  assert.match(r.js, /return '#0055A4'/);
  assert.match(r.js, /tint: 'rgba\(var\(--pkm-green-rgb\), 0\.16\)'/);
  assert.match(r.js, /color: 'var\(--pkm-gray\)'/);
});

test('logique : couleur sans correspondance ou hors méthode signalée', () => {
  const r = themeScript("const X = '#ABCDEF';\n  vHome(x) {\n    return { c: '#123456' };\n  }");
  assert.equal(r.missing.length, 2);
});

test('variables : toutes celles des règles existent, valeurs classiques au format CSS', () => {
  RULES.forEach(([, , to]) => {
    if (to === 'keep') return;
    const name = to.startsWith('rgb:') ? to.slice(4) + '-rgb' : to.match(/^var\(--pkm-([\w-]+)\)$/)[1];
    assert.ok(name in TOKENS, 'variable inconnue : ' + name);
  });
  Object.entries(TOKENS).forEach(([k, v]) => {
    if (k.endsWith('-rgb')) assert.match(v, /^\d{1,3}, \d{1,3}, \d{1,3}$/, k);
    else assert.match(v, /^(#[0-9A-F]{6}|transparent|0\.\d+)$/, k);
  });
  assert.match(cssVars(), /^:root \{ --pkm-app: #0B1120; .* \}$/);
});

test('modules de l’app : chaque variable utilisée existe', () => {
  for (const f of ['catalog.js', 'sealed.js', 'radar.js']) {
    const unknown = usedTokens(readFileSync(new URL('./' + f, import.meta.url), 'utf8')).filter(n => !(n in TOKENS));
    assert.deepEqual(unknown, [], f);
  }
});

test('thème v6 : variables connues, ton sombre complet, classique en retrait', () => {
  [V6_LIGHT, V6_DARK].forEach(o => Object.keys(o).forEach(k => assert.ok(k in TOKENS, 'variable v6 inconnue : ' + k)));
  const css = v6Css(), light = css.match(/\.pkm-root \{([^}]*)\}/)[1], dark = css.match(/\.pkm-dark \{([^}]*)\}/)[1];
  // Toute variable du ton clair est redéfinie par le ton sombre (une surface n'hérite jamais du fond jaune).
  for (const k of Object.keys(V6_LIGHT)) assert.ok(dark.includes('--pkm-' + k + ':'), 'ton sombre sans ' + k);
  assert.match(light, /--pkm-t1: #0B1120;/);
  assert.match(dark, /--pkm-t1: #F5F7FC;/);
  assert.match(css, /^html:not\(\.pkm-classic\) \.pkm-root/);
});

test('surface sans couleur de texte : elle déclare la sienne', () => {
  const rules = [RULE('bg', '#111A2C', 'var(--pkm-card)', { surface: true })];
  assert.match(themeTemplate('<div style="background: #111A2C">x</div>', rules).tpl, /background: var\(--pkm-card\); color: var\(--pkm-t1\)"/);
  assert.match(themeTemplate('<button style="background: #111A2C; color: inherit">x</button>', rules).tpl, /color: var\(--pkm-t1\)"/);
  assert.match(themeTemplate('<p style="background: #111A2C; color: {{ x.fg }}">x</p>', rules).tpl, /color: \{\{ x\.fg \}\}"/);
});

test('logique : une méthode d’une ligne ne recouvre pas la suivante', () => {
  const js = "\n  profRules() { return { ur: [3, 10], val: [1000, 5000] }; }\n  cats() {\n    return { regular: { color: '#A8B6FF', tint: 'rgba(168, 182, 255, 0.12)' } };\n  }";
  const r = themeScript(js);
  assert.deepEqual(r.missing, []);
  assert.match(r.js, /color: 'var\(--pkm-regular\)', tint: 'rgba\(var\(--pkm-regular-rgb\), 0\.12\)'/);
});
