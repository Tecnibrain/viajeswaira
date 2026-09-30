import '../main.js';
import { paquetes } from '../../data/paquetes.js';
import { paqueteCard, esc } from '../ui.js';

const params = new URLSearchParams(location.search);
const list = document.getElementById('list');
const filters = document.getElementById('filters');
const cats = ['Todos', ...new Set(paquetes.map((p) => p.category))];
let cat = cats.includes(params.get('cat')) ? params.get('cat') : 'Todos';
const dest = params.get('destino');

filters.innerHTML = cats.map((c) => `<button class="filter-btn" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

function render() {
  const items = paquetes.filter((p) => (cat === 'Todos' || p.category === cat) && (!dest || p.destinationId === dest));
  list.innerHTML = items.length ? items.map(paqueteCard).join('') : '<p class="empty">No hay paquetes en esta categoría.</p>';
  filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
}
filters.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) { cat = b.dataset.cat; render(); }
});
render();
