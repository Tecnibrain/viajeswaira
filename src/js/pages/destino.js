import '../main.js';
import { getDestino, destinos } from '../../data/destinos.js';
import { paquetesPorDestino } from '../../data/paquetes.js';
import { esc, paqueteCard, destinoCard, priceTag, setMeta, addJsonLd } from '../ui.js';
import { SITE } from '../../config.js';

const id = new URLSearchParams(location.search).get('id');
const d = getDestino(id);
const root = document.getElementById('detail');

if (!d) {
  root.innerHTML = `<section class="section"><div class="container center"><h1>Destino no encontrado</h1><p><a class="btn btn-primary" href="/destinos">Ver destinos</a></p></div></section>`;
} else {
  setMeta({ title: `${d.name}, ${d.country}`, description: d.description, path: `/destino?id=${d.id}` });
  const pkgs = paquetesPorDestino(d.id);
  const others = destinos.filter((x) => x.id !== d.id && x.region === d.region).slice(0, 3);
  const msg = `Hola ${SITE.name}, quiero información sobre viajes a ${d.name} (${d.country}).`;
  root.innerHTML = `
  <section class="detail-hero">
    <img src="${d.gallery[1] || d.image}" alt="${esc(d.name)}" width="1200" height="800" fetchpriority="high" />
    <div class="container">
      <p class="breadcrumb"><a href="/">Inicio</a> / <a href="/destinos">Destinos</a> / ${esc(d.name)}</p>
      <p class="eyebrow eyebrow-sand">${esc(d.city)} · ${esc(d.country)}</p>
      <h1>${esc(d.name)}</h1>
    </div>
  </section>
  <section class="section">
    <div class="container detail-layout">
      <div>
        <div class="block"><h2>Sobre el destino</h2><p>${esc(d.description)}</p></div>
        <div class="block"><h2>Imperdibles</h2><ul class="tags">${d.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>
        <div class="block"><h2>Galería</h2><div class="gallery">${d.gallery.map((g, i) => `<img src="${g}" alt="${esc(d.name)} ${i + 1}" width="600" height="400" loading="lazy" decoding="async" style="border-radius:10px;aspect-ratio:3/2;object-fit:cover" />`).join('')}</div></div>
        <div class="block"><h2>Paquetes a ${esc(d.name)}</h2>
          ${pkgs.length ? `<div class="grid grid-3">${pkgs.map(paqueteCard).join('')}</div>` : '<p class="muted">Pronto tendremos paquetes para este destino. Pide una cotización a la medida.</p>'}
        </div>
      </div>
      <aside class="sidebar-card">
        ${priceTag(d.priceFrom, d)}
        <ul class="facts">
          <li><span>País</span><span>${esc(d.country)}</span></li>
          <li><span>Ciudad</span><span>${esc(d.city)}</span></li>
          <li><span>Duración sugerida</span><span>${esc(d.duration)}</span></li>
          <li><span>Tipo</span><span>${d.region === 'nacional' ? 'Nacional' : 'Internacional'}</span></li>
        </ul>
        <a class="btn btn-accent" href="/reservas?destino=${d.id}">Planear viaje a ${esc(d.name)}</a>
        <a class="btn btn-wa" href="#" data-wa data-wa-msg="${esc(msg)}">Consultar por WhatsApp</a>
        <p class="small muted" style="margin-top:12px">Precio de referencia DEMO. Sujeto a fechas y disponibilidad.</p>
      </aside>
    </div>
  </section>
  ${others.length ? `<section class="section section-alt"><div class="container"><div class="section-head"><h2>Otros destinos</h2></div><div class="grid grid-3">${others.map(destinoCard).join('')}</div></div></section>` : ''}`;
  addJsonLd({
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${d.name}, ${d.country}`,
    description: d.description,
    image: SITE.url + d.image,
    url: `${SITE.url}/destino?id=${d.id}`,
  });
  window.dispatchEvent(new Event('waira:rendered'));
}
