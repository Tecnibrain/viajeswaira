import { SITE } from '../config.js';
import { getDestino } from '../data/destinos.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: SITE.currency, maximumFractionDigits: 0 });
export const formatPrice = (n) => fmt.format(n);

export const demoBadge = (item) => (item.demo ? '<span class="badge-demo" title="Dato de demostración">DEMO</span>' : '');

export function priceTag(value, item, label = 'Desde') {
  return `<p class="price"><small>${label}</small> <strong>${formatPrice(value)}</strong> ${demoBadge(item)}<small class="per">por persona</small></p>`;
}

const img = (src, alt, eager = false) =>
  `<img src="${esc(src)}" alt="${esc(alt)}" width="600" height="400" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`;

export function destinoCard(d) {
  return `
  <article class="card">
    <a class="card-media" href="/destino?id=${d.id}" tabindex="-1" aria-hidden="true">${img(d.image, `${d.name}, ${d.country}`)}
      <span class="chip">${esc(d.region === 'nacional' ? 'Nacional' : 'Internacional')}</span></a>
    <div class="card-body">
      <p class="eyebrow">${esc(d.city)} · ${esc(d.country)}</p>
      <h3><a href="/destino?id=${d.id}">${esc(d.name)}</a></h3>
      <p class="card-text">${esc(d.description)}</p>
      <p class="meta"><span>🕒 ${esc(d.duration)}</span></p>
      ${priceTag(d.priceFrom, d)}
      <a class="btn btn-primary btn-block" href="/destino?id=${d.id}">Ver destino</a>
    </div>
  </article>`;
}

export function paqueteCard(p) {
  const d = getDestino(p.destinationId) || { name: '', country: '', image: '/img/hero.svg', gallery: [] };
  return `
  <article class="card">
    <a class="card-media" href="/paquete?id=${p.id}" tabindex="-1" aria-hidden="true">${img(p.image || d.gallery[1] || d.image, p.title)}
      <span class="chip">${esc(p.category)}</span></a>
    <div class="card-body">
      <p class="eyebrow">${esc(d.name)}, ${esc(d.country)}</p>
      <h3><a href="/paquete?id=${p.id}">${esc(p.title)}</a></h3>
      <p class="card-text">${esc(p.description)}</p>
      <p class="meta"><span>🕒 ${esc(p.duration)}</span></p>
      ${priceTag(p.price, p, 'Precio')}
      <div class="card-actions">
        <a class="btn btn-primary" href="/paquete?id=${p.id}">Ver paquete</a>
        <a class="btn btn-outline" href="/reservas?paquete=${p.id}">Reservar</a>
      </div>
    </div>
  </article>`;
}

let toastTimer;
export function toast(message) {
  const el = document.querySelector('.toast');
  if (!el) return alert(message);
  el.textContent = message;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => (el.hidden = true), 300);
  }, 4500);
}

/** Actualiza título, descripción y canonical en páginas de detalle */
export function setMeta({ title, description, path }) {
  document.title = `${title} | ${SITE.name}`;
  const set = (sel, attr, val) => document.querySelector(sel)?.setAttribute(attr, val);
  set('meta[name="description"]', 'content', description);
  set('meta[property="og:title"]', 'content', document.title);
  set('meta[property="og:description"]', 'content', description);
  set('meta[property="og:url"]', 'content', SITE.url + path);
  set('link[rel="canonical"]', 'href', SITE.url + path);
}

export function addJsonLd(obj) {
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}
