// Aide commune des tests navigateur (tools/web/e2e) : navigateur, adresse de la démo, réseau coupé vers l'extérieur.
// CHROMIUM : chemin d'un Chromium déjà installé (sinon celui de « npx playwright-core install chromium ») ;
// E2E_BASE : adresse de la démo servie (run.mjs la sert sur un port libre).
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const BASE = (process.env.E2E_BASE || 'http://localhost:8765').replace(/\/$/, '');
export const OUT = fileURLToPath(new URL('./out/', import.meta.url));
mkdirSync(OUT, { recursive: true });
export const shot = name => OUT + name;
export const launch = (opts = {}) => chromium.launch(Object.assign({}, opts, process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}));
// Polices : servies avec la démo (web/fonts). Cartes du Radar, CDN TCGdex et pokemontcg.io coupés : résultats
// identiques partout (le bac à sable n'y a pas accès, la CI si).
export const withFonts = async ctx => { await ctx.route(/openfreemap|tcgdex|pokemontcg|fonts\.googleapis|fonts\.gstatic/, r => r.abort()); };
// Les 5 cartes de démo reprises de TCGdex, servies depuis leurs copies locales (captures fidèles).
const DEMO = { 'sv08/238': 'card-pikachu-ex', 'me02.5/272': 'card-mega-meganium-ex', 'sm9/162': 'card-pikachu-zekrom-gx', 'me02.5/288': 'card-favianos-ex', '30th/155': 'card-jirachi-ex' };
export const withDemoCards = async ctx => {
  await ctx.route(/assets\.tcgdex\.net/, r => {
    const m = r.request().url().match(/\/(sv08\/238|me02\.5\/272|sm9\/162|me02\.5\/288|30th\/155)\//);
    if (!m) return r.abort();
    r.fulfill({ contentType: 'image/webp', body: readFileSync(ROOT + 'web/img/' + DEMO[m[1]] + '.webp') });
  });
};
// PK : les trois compagnons payants débloqués (Kyogre, Groudon, Rayquaza).
export const unlockPaid = async page => {
  await page.evaluate(() => { const k = 'pkm-collection-v1', d = JSON.parse(localStorage.getItem(k)); d.pkOwn = [382, 383, 384]; localStorage.setItem(k, JSON.stringify(d)); });
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1500);
};
