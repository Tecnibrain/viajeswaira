import '../main.js';
import { paquetes } from '../../data/paquetes.js';
import { destinos } from '../../data/destinos.js';
import { paqueteCard, esc } from '../ui.js';

const params = new URLSearchParams(location.search);
const list = document.getElementById('list');
const filters = document.getElementById('filters');
const cats = ['Todos', ...new Set(paquetes.map((p) => p.category))];
let cat = cats.includes(params.get('cat')) ? params.get('cat') : 'Todos';
let dest = params.get('destino') || '';
const destSel = document.getElementById('dest-filter');
const withPkgs = destinos.filter((d) => paquetes.some((p) => p.destinationId === d.id));
destSel.innerHTML += withPkgs.map((d) => `<option value="${esc(d.id)}">${esc(d.name)} (${esc(d.country)})</option>`).join('');
destSel.value = dest;
destSel.addEventListener('change', () => { dest = destSel.value; render(); });

filters.innerHTML = cats.map((c) => `<button class="filter-btn" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

function render() {
  const items = paquetes.filter((p) => (cat === 'Todos' || p.category === cat) && (!dest || p.destinationId === dest));
  list.innerHTML = items.length ? items.map(paqueteCard).join('') : '<p class="empty">No hay planes con estos filtros.</p>';
  filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
}
filters.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) { cat = b.dataset.cat; render(); }
});
render();
