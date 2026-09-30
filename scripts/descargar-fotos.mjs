/**
 * Descarga las fotos de los hoteles y destinos desde el portal de On Vacation
 * (Viajes Waira es vendedor autorizado), las optimiza a WebP (máx. 1600 px)
 * y las guarda en public/img/onvacation/<tipo>/<id>/N.webp.
 * Genera public/img/onvacation/manifest.json con las rutas por elemento.
 *
 * Uso (en GitHub Actions): node scripts/descargar-fotos.mjs [maxFotos]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const MAX = Number(process.argv[2] || 6);
const src = JSON.parse(readFileSync(new URL('./fotos-origen.json', import.meta.url)));
const OUT = new URL('../public/img/onvacation/', import.meta.url);
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; ViajesWairaBot/1.0; vendedor autorizado On Vacation)' };

const pages = new Map();
for (const url of new Set(src.map((s) => s.url))) {
  try {
    const html = await (await fetch(url, { headers: UA, signal: AbortSignal.timeout(25000) })).text();
    const found = [];
    const add = (u) => {
      try {
        const abs = new URL(u.trim().split(' ')[0], url);
        if (!/wp-content\/uploads/.test(abs.pathname) || !/\.(jpe?g|png|webp)$/i.test(abs.pathname)) return;
        // Versión original (sin sufijo -300x200 de WordPress)
        abs.pathname = abs.pathname.replace(/-\d{2,4}x\d{2,4}(?=\.(jpe?g|png|webp)$)/i, '').replace(/-scaled(?=\.)/, '');
        if (!found.includes(abs.href)) found.push(abs.href);
      } catch {}
    };
    for (const m of html.matchAll(/(?:src|data-src|data-lazy-src|href)=["']([^"']+)["']/gi)) add(m[1]);
    for (const m of html.matchAll(/(?:srcset|data-srcset)=["']([^"']+)["']/gi)) m[1].split(',').forEach(add);
    for (const m of html.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) add(m[1]);
    pages.set(url, found);
    console.log(`✔ ${url}: ${found.length} imágenes`);
  } catch (e) {
    console.log(`✖ ${url}: ${e.message}`);
    pages.set(url, []);
  }
}

// Quita imágenes repetidas en muchas páginas (menú, logos, íconos)
const freq = new Map();
for (const list of pages.values()) for (const u of new Set(list)) freq.set(u, (freq.get(u) || 0) + 1);
const common = (u) => freq.get(u) > Math.max(3, pages.size * 0.15) || /logo|icon|favicon|whatsapp|flag|bandera|sello|vigilado|supertransporte|aerocivil|sic-|pse|visa|master|payment|pago|app-?store|google-?play/i.test(u);

const manifest = { paquetes: {}, destinos: {} };
const cache = new Map();
for (const s of src) {
  const dir = new URL(`${s.tipo}/${s.id}/`, OUT);
  mkdirSync(dir, { recursive: true });
  const saved = [];
  for (const u of pages.get(s.url) || []) {
    if (saved.length >= MAX) break;
    if (common(u)) continue;
    try {
      let buf = cache.get(u);
      if (!buf) {
        const res = await fetch(u, { headers: UA, signal: AbortSignal.timeout(30000) });
        if (!res.ok) continue;
        buf = Buffer.from(await res.arrayBuffer());
        cache.set(u, buf);
      }
      const meta = await sharp(buf).metadata();
      if ((meta.width || 0) < 600 || (meta.height || 0) < 350) continue; // descarta miniaturas e íconos
      const n = saved.length + 1;
      await sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(new URL(`${n}.webp`, dir).pathname);
      saved.push(`/img/onvacation/${s.tipo}/${s.id}/${n}.webp`);
    } catch (e) {
      console.log(`  (omitida ${u}: ${e.message})`);
    }
  }
  manifest[s.tipo][s.id] = saved;
  console.log(`${s.tipo}/${s.id}: ${saved.length} fotos`);
}
writeFileSync(new URL('manifest.json', OUT), JSON.stringify(manifest, null, 1) + '\n');
console.log('Listo.');
