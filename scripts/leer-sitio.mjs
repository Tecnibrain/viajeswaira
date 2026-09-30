/**
 * Lee un sitio web público y muestra su texto (solo lectura), para usarlo como referencia.
 * Uso: node scripts/leer-sitio.mjs https://ejemplo.com [maxPaginas]
 */
const start = new URL(process.argv[2]);
const max = Number(process.argv[3] || 40);
const skip = process.argv[4] ? new RegExp(process.argv[4], 'i') : null; // rutas a omitir en la salida
const pages = [];
const seen = new Set();
const queue = [start.href];
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '–').replace(/&#36;/g, '$').replace(/&[a-z#0-9]+;/gi, ' ')
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
    .filter((l, i, a) => a.indexOf(l) === i)
    .join('\n');
while (queue.length && seen.size < max) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ViajesWairaBot/1.0)' }, redirect: 'follow' });
    const html = await res.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    pages.push({ url, status: res.status, title, lines: text(html).split('\n') });
    for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
      try {
        const u = new URL(m[1], url);
        u.hash = ''; u.search = '';
        if (u.host === start.host && !/\.(jpe?g|png|webp|gif|svg|pdf|css|js|xml|ico)$/i.test(u.pathname) && !/wp-(json|admin|login)|feed|xmlrpc|carrito|cart|checkout|mi-cuenta|account/i.test(u.pathname)) {
          if (!seen.has(u.href) && !queue.includes(u.href)) queue.push(u.href);
        }
      } catch {}
    }
  } catch (e) {
    console.log(`\n==================== ${url} ERROR ${e.message}`);
  }
}
// Quita líneas repetidas en muchas páginas (menú, pie de página)
const freq = new Map();
for (const p of pages) for (const l of new Set(p.lines)) freq.set(l, (freq.get(l) || 0) + 1);
const common = new Set([...freq].filter(([, n]) => pages.length > 4 && n > pages.length * 0.4).map(([l]) => l));
for (const p of pages) {
  if (skip && skip.test(new URL(p.url).pathname)) continue;
  console.log(`\n==================== ${p.url} (HTTP ${p.status})`);
  if (p.title) console.log(`TÍTULO: ${p.title}`);
  console.log(p.lines.filter((l) => !common.has(l)).join('\n').slice(0, 5000));
}
console.log(`\nPáginas leídas: ${seen.size}. Pendientes sin leer: ${queue.length}`);
