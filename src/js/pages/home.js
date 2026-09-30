import '../main.js';
import { destinos } from '../../data/destinos.js';
import { paquetes } from '../../data/paquetes.js';
import { destinoCard, paqueteCard, addJsonLd } from '../ui.js';

document.getElementById('featured-destinos').innerHTML = destinos.slice(0, 4).map(destinoCard).join('');
document.getElementById('featured-paquetes').innerHTML = paquetes.filter((p) => p.featured).slice(0, 3).map(paqueteCard).join('');

addJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [...document.querySelectorAll('.faq details')].map((d) => ({
    '@type': 'Question',
    name: d.querySelector('summary').textContent.trim(),
    acceptedAnswer: { '@type': 'Answer', text: d.querySelector('p').textContent.trim() },
  })),
});
window.dispatchEvent(new Event('waira:rendered'));
