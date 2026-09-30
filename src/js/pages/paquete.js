import '../main.js';
import { getPaquete, paquetes } from '../../data/paquetes.js';
import { getDestino } from '../../data/destinos.js';
import { esc, priceTag, operatorTag, paqueteCard, setMeta, addJsonLd } from '../ui.js';
import { SITE } from '../../config.js';

const id = new URLSearchParams(location.search).get('id');
const p = getPaquete(id);
const root = document.getElementById('detail');

if (!p) {
  root.innerHTML = `<section class="section"><div class="container center"><h1>Paquete no encontrado</h1><p><a class="btn btn-primary" href="/paquetes">Ver paquetes</a></p></div></section>`;
} else {
  const d = getDestino(p.destinationId) || { id: '', name: '', country: '', image: '/img/hero.svg', gallery: ['/img/hero.svg'] };
  const gallery = p.gallery.length ? p.gallery : d.gallery;
  setMeta({ title: p.title, description: p.description, path: `/paquete?id=${p.id}` });
  const msg = `Hola ${SITE.name}, quiero cotizar el plan "${p.title}"${p.duration ? ` (${p.duration})` : ''}.`;
  const list = (items, cls) => `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  const related = paquetes.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  root.innerHTML = `
  <section class="detail-hero">
    <img src="${p.image || d.gallery[2] || d.image}" alt="${esc(p.title)}" width="1200" height="800" fetchpriority="high" />
    <div class="container">
      <p class="breadcrumb"><a href="/">Inicio</a> / <a href="/paquetes">Paquetes</a> / ${esc(p.title)}</p>
      <p class="eyebrow eyebrow-sand">${esc(p.category)} · ${esc(d.name)}, ${esc(d.country)}</p>
      <h1>${esc(p.title)}</h1>
    </div>
  </section>
  <section class="section">
    <div class="container detail-layout">
      <div>
        ${p.demo ? '<p class="notice">Paquete de demostración: precio, itinerario e inclusiones son ejemplos y no constituyen una oferta real.</p>' : ''}
        <div class="block"><h2>Descripción</h2><p>${esc(p.description)}</p></div>
        ${p.includes.length || p.excludes.length ? `<div class="block ${p.includes.length && p.excludes.length ? 'two-col' : ''}">
          ${p.includes.length ? `<div><h2>Incluye</h2>${list(p.includes, 'check-list')}</div>` : ''}
          ${p.excludes.length ? `<div><h2>No incluye</h2>${list(p.excludes, 'x-list')}</div>` : ''}
        </div>` : ''}
        ${p.services.length ? `<div class="block"><h2>Servicios del hotel</h2><ul class="tags">${p.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}
        ${p.facts.length ? `<div class="block"><h2>Datos útiles</h2><dl class="facts-list">${p.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl></div>` : ''}
        ${p.itinerary.length ? `<div class="block"><h2>Itinerario</h2><ol class="timeline">${p.itinerary
          .map((s) => `<li data-day="${s.day}"><h3>Día ${s.day}: ${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`)
          .join('')}</ol></div>` : ''}
        <div class="block"><h2>Galería</h2><div class="gallery">${gallery
          .map((g, i) => `<button type="button" data-src="${g}" aria-label="Ampliar imagen ${i + 1}"><img src="${g}" alt="${esc(d.name)} ${i + 1}" width="600" height="400" loading="lazy" decoding="async" /></button>`)
          .join('')}</div></div>
      </div>
      <aside class="sidebar-card">
        ${priceTag(p.price, p, 'Precio')}
        <ul class="facts">
          <li><span>Destino</span><span><a href="/destino?id=${d.id}">${esc(d.name)}</a></span></li>
          ${p.duration ? `<li><span>Duración</span><span>${esc(p.duration)}</span></li>` : ''}
          <li><span>Categoría</span><span>${esc(p.category)}</span></li>
          ${p.operator ? `<li><span>Operador</span><span>${esc(p.operator)}</span></li>` : ''}
        </ul>
        <a class="btn btn-accent" href="/reservas?paquete=${p.id}">${p.price ? 'Reservar' : 'Solicitar cotización'}</a>
        <a class="btn btn-wa" href="#" data-wa data-wa-msg="${esc(msg)}">Cotizar por WhatsApp</a>
        <p class="small muted" style="margin-top:12px">Sujeto a disponibilidad. El precio final se confirma con tu asesor.</p>
      </aside>
    </div>
  </section>
  ${related.length ? `<section class="section section-alt"><div class="container"><div class="section-head"><h2>También te puede interesar</h2></div><div class="grid grid-3">${related.map(paqueteCard).join('')}</div></div></section>` : ''}`;

  // Galería con lightbox
  const lb = document.getElementById('lightbox');
  root.querySelector('.gallery').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-src]');
    if (!b || !lb.showModal) return;
    lb.querySelector('img').src = b.dataset.src;
    lb.querySelector('img').alt = b.querySelector('img').alt;
    lb.showModal();
  });
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'BUTTON') lb.close(); });

  addJsonLd({
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: p.title,
    description: p.description,
    image: SITE.url + (p.image || d.image),
    url: `${SITE.url}/paquete?id=${p.id}`,
    touristType: p.category,
    itinerary: { '@type': 'ItemList', itemListElement: p.itinerary.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: `Día ${s.day}: ${s.title}` })) },
    provider: { '@type': 'TravelAgency', name: SITE.name, url: SITE.url },
  });
  window.dispatchEvent(new Event('waira:rendered'));
}
