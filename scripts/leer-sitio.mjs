/**
 * Lee un sitio web público y muestra su texto (solo lectura), para usarlo como referencia.
 * Uso: node scripts/leer-sitio.mjs https://ejemplo.com [maxPaginas]
 */
const start = new URL(process.argv[2]);
const max = Number(process.argv[3] || 40);
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
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ViajesWairaBot/1.0)' }, redirect: 'follow' });
    const html = await res.text();
    console.log(`\n==================== ${url} (HTTP ${res.status})`);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    if (title) console.log(`TÍTULO: ${title}`);
    console.log(text(html).slice(0, 6000));
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
console.log(`\nPáginas leídas: ${seen.size}. Pendientes sin leer: ${queue.length}`);
