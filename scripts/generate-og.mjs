/**
 * Genera public/og-image.jpg (1200x630), la imagen que se ve al compartir
 * el sitio en WhatsApp, Facebook, etc. Usa el logo de marca.
 * Requiere Playwright (solo en desarrollo). Uso: node scripts/generate-og.mjs
 */
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const pub = new URL('../public/', import.meta.url);
const logo = readFileSync(new URL('img/brand/logo-horizontal.png', pub), 'base64');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(`<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f7f3ee;font-family:system-ui,sans-serif}
.w{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px}
img{width:900px}
p{margin:0;font-size:30px;color:#1b5e43;letter-spacing:.02em}
.b{position:absolute;left:0;right:0;bottom:0;height:18px;background:linear-gradient(90deg,#1b5e43,#1a9fb0,#c8b28c)}
</style><div class="w"><img src="data:image/png;base64,${logo}"><p>Destinos · Paquetes turísticos · Viajes a la medida · viajeswaira.com</p></div><div class="b"></div>`);
await page.screenshot({ path: new URL('og-image.jpg', pub).pathname, type: 'jpeg', quality: 88 });
await browser.close();
console.log('✔ og-image.jpg generado');
