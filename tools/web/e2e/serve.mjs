// Petit serveur statique pour les tests : sert web/ sur un port (127.0.0.1), types de fichiers courants.
// Comme le nginx de dropicards.fr (2026-11-01) : pas de type pour « .mjs » (envoyé en application/octet-stream) et
// « nosniff » ; un module « .mjs » ne se charge donc pas ici non plus (la carte du Radar restait noire sur le téléphone).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.txt': 'text/plain', '.gz': 'application/gzip' };
export function serve(dir, port) {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(dir, p));
    if (!file.startsWith(normalize(dir))) { res.writeHead(403); res.end(); return; }
    try { const body = await readFile(file); res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }); res.end(body); }
    catch (e) { res.writeHead(404); res.end('introuvable'); }
  });
  return new Promise(ok => server.listen(port, '127.0.0.1', () => ok(server)));
}
