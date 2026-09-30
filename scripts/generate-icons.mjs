/**
 * Genera og-image.jpg (1200x630), favicon-32.png, apple-touch-icon.png,
 * icon-192.png e icon-512.png a partir de los SVG de /public.
 * Requiere Playwright (solo para desarrollo): npx playwright o global.
 * Uso: NODE_PATH=$(npm root -g) node scripts/generate-icons.mjs
 */
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const pub = new URL('../public/', import.meta.url);
const logo = readFileSync(new URL('logo.svg', pub), 'utf8');
const hero = readFileSync(new URL('img/hero-2.svg', pub), 'base64');

const browser = await chromium.launch();
const page = await browser.newPage();

for (const size of [32, 180, 192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${logo}`);
  const name = { 32: 'favicon-32.png', 180: 'apple-touch-icon.png', 192: 'icon-192.png', 512: 'icon-512.png' }[size];
  await page.screenshot({ path: new URL(name, pub).pathname, omitBackground: size === 32 });
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Georgia,serif}
.bg{position:absolute;inset:0;background:url(data:image/svg+xml;base64,${hero}) center/cover}
.ov{position:absolute;inset:0;background:linear-gradient(100deg,rgba(10,30,36,.85),rgba(10,30,36,.25))}
.c{position:absolute;left:80px;top:150px;color:#fff;max-width:760px}
.b{display:flex;align-items:center;gap:18px;font-size:34px;margin-bottom:28px}.b svg{width:72px;height:72px}
h1{font-size:72px;line-height:1.05;margin:0 0 20px}h1 em{color:#ffc98a}
p{font:28px/1.4 system-ui,sans-serif;color:#dff1f3;margin:0}
</style><div class="bg"></div><div class="ov"></div><div class="c"><div class="b">${logo}<span>viajeswaira.com</span></div>
<h1>Descubre el mundo con <em>Viajes Waira</em></h1><p>Destinos, paquetes turísticos y viajes a la medida</p></div>`);
await page.screenshot({ path: new URL('og-image.jpg', pub).pathname, type: 'jpeg', quality: 85 });
await browser.close();
console.log('✔ Iconos y og-image.jpg generados');
