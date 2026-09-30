import { defineConfig } from 'vite';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SITE } from './src/config.js';
import { destinos } from './src/data/destinos.js';
import { paquetes } from './src/data/paquetes.js';

const root = import.meta.dirname;

// Páginas del sitio (cada una es un .html estático)
const PAGES = ['index', 'destinos', 'destino', 'paquetes', 'paquete', 'nosotros', 'contacto', 'reservas', '404'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function renderHead(attrs) {
  const title = attrs.title ? `${attrs.title} | ${SITE.name}` : `${SITE.name} | Agencia de viajes y paquetes turísticos`;
  const description = attrs.description || SITE.description;
  const url = SITE.url + (attrs.path || '/');
  const image = `${SITE.url}/og-image.jpg`;
  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="keywords" content="${esc(SITE.keywords)}" />
    ${attrs.noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow, max-image-preview:large" />'}
    <link rel="canonical" href="${url}" />
    <meta name="theme-color" content="${SITE.colors.primary}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SITE.name)}" />
    <meta property="og:locale" content="${SITE.locale}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <style>:root{${Object.entries(SITE.colors)
      .map(([k, v]) => `--c-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
      .join(';')}}</style>
    <script type="application/ld+json">${JSON.stringify(schemaOrg())}</script>`;
}

function schemaOrg() {
  const sameAs = Object.values(SITE.social).filter((v) => v.startsWith('http'));
  const org = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.svg`,
    image: `${SITE.url}/og-image.jpg`,
    description: SITE.description,
    areaServed: 'CO',
  };
  if (sameAs.length) org.sameAs = sameAs;
  if (SITE.email.includes('@')) org.email = SITE.email;
  if (/\d/.test(SITE.phone)) org.telephone = SITE.phone;
  return org;
}

function partial(name) {
  return readFileSync(resolve(root, 'partials', `${name}.html`), 'utf8');
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ['/', '1.0'],
    ['/destinos', '0.9'],
    ['/paquetes', '0.9'],
    ['/reservas', '0.8'],
    ['/nosotros', '0.6'],
    ['/contacto', '0.7'],
    ...destinos.map((d) => [`/destino?id=${d.id}`, '0.7']),
    ...paquetes.map((p) => [`/paquete?id=${p.id}`, '0.7']),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(([u, p]) => `  <url><loc>${SITE.url}${u.replace(/&/g, '&amp;')}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`)
  .join('\n')}
</urlset>
`;
}

// Sirve /destinos -> destinos.html en dev/preview (igual que Cloudflare Pages)
function cleanUrls(req, _res, next) {
  const [path, query] = req.url.split('?');
  if (path !== '/' && !path.includes('.') && existsSync(resolve(root, `${path.slice(1)}.html`))) {
    req.url = `${path}.html${query ? '?' + query : ''}`;
  }
  next();
}

function wairaPlugin() {
  return {
    name: 'viajes-waira',
    configureServer(server) {
      server.middlewares.use(cleanUrls);
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const [path] = req.url.split('?');
        if (path !== '/' && !path.includes('.') && existsSync(resolve(root, 'dist', `${path.slice(1)}.html`))) {
          req.url = req.url.replace(path, `${path}.html`);
        }
        next();
      });
    },
    transformIndexHtml(html) {
      return html
        .replace(/<!--#head(.*?)-->/s, (_, a) => {
          const attrs = {};
          for (const m of a.matchAll(/(\w+)="([^"]*)"/g)) attrs[m[1]] = m[2];
          if (/\bnoindex\b/.test(a)) attrs.noindex = true;
          return renderHead(attrs);
        })
        .replace('<!--#header-->', partial('header'))
        .replace('<!--#footer-->', partial('footer'))
        .replaceAll('%SITE_NAME%', SITE.name)
        .replaceAll('%YEAR%', String(new Date().getFullYear()));
    },
    closeBundle() {
      if (existsSync(resolve(root, 'dist'))) {
        writeFileSync(resolve(root, 'dist', 'sitemap.xml'), sitemap());
      }
    },
  };
}

export default defineConfig({
  plugins: [wairaPlugin()],
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((p) => [p, resolve(root, `${p}.html`)])),
    },
  },
});
