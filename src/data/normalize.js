/**
 * Convierte los archivos de content/ (editados desde el panel /admin)
 * en listas ordenadas. El nombre del archivo es el identificador (id).
 * Se usa tanto en el navegador como en el build (sitemap).
 */
const idFromPath = (path) => path.split('/').pop().replace(/\.json$/, '');
const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.title || a.name).localeCompare(String(b.title || b.name), 'es');

export function toDestinos(files) {
  return Object.entries(files)
    .map(([path, d]) => {
      const gallery = (d.gallery || []).filter(Boolean);
      const image = d.image || gallery[0] || '/img/hero.svg';
      return {
        ...d,
        id: idFromPath(path),
        image,
        gallery: gallery.length ? gallery : [image],
        highlights: (d.highlights || []).filter(Boolean),
        priceFrom: Number(d.priceFrom) || 0,
        demo: d.demo !== false,
      };
    })
    .filter((d) => d.published !== false)
    .sort(byOrder);
}

export function toPaquetes(files) {
  return Object.entries(files)
    .map(([path, p]) => ({
      ...p,
      id: idFromPath(path),
      price: Number(p.price) || 0,
      image: p.image || '',
      gallery: (p.gallery || []).filter(Boolean),
      includes: (p.includes || []).filter(Boolean),
      excludes: (p.excludes || []).filter(Boolean),
      itinerary: (p.itinerary || []).map((s, i) => ({ day: i + 1, title: s.title || `Día ${i + 1}`, text: s.text || '' })),
      featured: Boolean(p.featured),
      demo: p.demo !== false,
    }))
    .filter((p) => p.published !== false)
    .sort(byOrder);
}
