import '../main.js';
import { destinos } from '../../data/destinos.js';
import { destinoCard } from '../ui.js';

const list = document.getElementById('list');
const q = document.getElementById('q');
const buttons = document.querySelectorAll('[data-filter]');
let region = new URLSearchParams(location.search).get('region') || 'todos';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function render() {
  const term = norm(q.value.trim());
  const items = destinos.filter(
    (d) => (region === 'todos' || d.region === region) && (!term || norm(`${d.name} ${d.city} ${d.country}`).includes(term)),
  );
  list.innerHTML = items.length ? items.map(destinoCard).join('') : '<p class="empty">No encontramos destinos con ese criterio.</p>';
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === region)));
}
buttons.forEach((b) => b.addEventListener('click', () => { region = b.dataset.filter; render(); }));
q.addEventListener('input', render);
render();
