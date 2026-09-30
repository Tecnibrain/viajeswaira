/**
 * Panel de administración de Viajes Waira.
 * Interfaz sencilla para crear, editar, ocultar y eliminar paquetes y destinos.
 * Guarda a través de /api/admin/* (Cloudflare Pages Functions).
 */
const app = document.getElementById('app');
const topbar = document.querySelector('.topbar');
const toastEl = document.querySelector('.toast');

const CATEGORIES = ['Playa', 'Playa y cultura', 'Naturaleza', 'Aventura', 'Ciudad', 'Luna de miel', 'Familiar', 'Internacional', 'Europa', 'Cruceros'];

const FORMS = {
  paquetes: {
    singular: 'paquete',
    title: 'title',
    sections: [
      {
        title: 'Información principal',
        fields: [
          { name: 'title', label: 'Nombre del paquete', type: 'text', required: true, hint: 'Ej: Cartagena Colonial y Caribe' },
          { name: 'destinationId', label: 'Destino', type: 'destino', required: true, hint: '¿No está? Créalo primero en la pestaña «Destinos».' },
          { name: 'duration', label: 'Duración', type: 'text', hint: 'Ej: 4 días / 3 noches', half: true },
          { name: 'price', label: 'Precio por persona', type: 'money', hint: 'Escribe solo números.', half: true },
          { name: 'category', label: 'Categoría', type: 'select', options: CATEGORIES },
          { name: 'description', label: 'Descripción corta', type: 'textarea', hint: '2 o 3 líneas. Aparece en la tarjeta del paquete.' },
        ],
      },
      {
        title: 'Fotos',
        fields: [
          { name: 'image', label: 'Foto principal', type: 'image', hint: 'Opcional. Si no subes una, se usa la foto del destino.' },
          { name: 'gallery', label: 'Galería', type: 'images', hint: 'Opcional. Puedes elegir varias fotos a la vez.' },
        ],
      },
      {
        title: 'Qué incluye',
        fields: [
          { name: 'includes', label: 'Incluye', type: 'strings', placeholder: 'Ej: Hotel con desayuno', addLabel: 'Agregar lo que incluye' },
          { name: 'excludes', label: 'No incluye', type: 'strings', placeholder: 'Ej: Propinas', addLabel: 'Agregar lo que NO incluye' },
        ],
      },
      { title: 'Itinerario', fields: [{ name: 'itinerary', label: 'Día a día', type: 'days' }] },
      {
        title: 'Opciones',
        fields: [
          { name: 'published', label: 'Publicado', type: 'bool', hint: 'Si lo apagas, el paquete se oculta de la página (no se borra).' },
          { name: 'featured', label: 'Destacar en la página de inicio', type: 'bool', hint: 'En el inicio se muestran los 3 primeros destacados.' },
          { name: 'demo', label: 'Es información de ejemplo (DEMO)', type: 'bool', hint: 'Apágalo cuando el precio y los datos sean reales.' },
          { name: 'order', label: 'Orden', type: 'number', hint: 'Los números más bajos aparecen primero.' },
        ],
      },
    ],
    blank: () => ({ title: '', destinationId: '', duration: '', price: 0, category: 'Playa', description: '', image: '', gallery: [], includes: [''], excludes: [''], itinerary: [{ title: '', text: '' }], featured: false, published: true, demo: false, order: 50 }),
  },
  destinos: {
    singular: 'destino',
    title: 'name',
    sections: [
      {
        title: 'Información principal',
        fields: [
          { name: 'name', label: 'Nombre del destino', type: 'text', required: true, hint: 'Ej: Cartagena' },
          { name: 'city', label: 'Ciudad', type: 'text', half: true, hint: 'Ej: Cartagena de Indias' },
          { name: 'country', label: 'País', type: 'text', required: true, half: true, hint: 'Ej: Colombia' },
          { name: 'region', label: 'Tipo', type: 'select', options: [{ value: 'nacional', label: 'Nacional' }, { value: 'internacional', label: 'Internacional' }] },
          { name: 'description', label: 'Descripción', type: 'textarea' },
          { name: 'priceFrom', label: 'Precio desde, por persona', type: 'money', half: true },
          { name: 'duration', label: 'Duración sugerida', type: 'text', half: true, hint: 'Ej: 4 días / 3 noches' },
        ],
      },
      {
        title: 'Fotos',
        fields: [
          { name: 'image', label: 'Foto principal', type: 'image', hint: 'Recomendado horizontal (más ancha que alta).' },
          { name: 'gallery', label: 'Galería', type: 'images' },
        ],
      },
      { title: 'Imperdibles', fields: [{ name: 'highlights', label: 'Lugares o actividades imperdibles', type: 'strings', placeholder: 'Ej: Ciudad amurallada', addLabel: 'Agregar imperdible' }] },
      {
        title: 'Opciones',
        fields: [
          { name: 'published', label: 'Publicado', type: 'bool', hint: 'Si lo apagas, el destino se oculta de la página.' },
          { name: 'demo', label: 'Es información de ejemplo (DEMO)', type: 'bool' },
          { name: 'order', label: 'Orden', type: 'number', hint: 'Los números más bajos aparecen primero.' },
        ],
      },
    ],
    blank: () => ({ name: '', city: '', country: 'Colombia', region: 'nacional', description: '', image: '', gallery: [], highlights: [''], priceFrom: 0, duration: '', published: true, demo: false, order: 50 }),
  },
};

const state = { tab: 'paquetes', data: { paquetes: [], destinos: [] }, search: '', editing: null, pending: new Map() };

// ------------------------------------------------------------------ utilidades
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (n) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(n) || 0);
const norm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const slug = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'foto';
const clone = (o) => JSON.parse(JSON.stringify(o));
const imgSrc = (path) => (state.pending.get(path)?.url || path || '/img/hero.svg');

let toastTimer;
function toast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.classList.toggle('error', isError);
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), isError ? 7000 : 5000);
}

async function api(path, body) {
  const res = await fetch(`/api/admin/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json', 'X-Waira-Admin': '1' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({ error: 'Respuesta inesperada del servidor.' }));
  if (res.status === 401 && path !== 'login') {
    renderLogin('Tu sesión se cerró. Vuelve a ingresar.');
    throw new Error('auth');
  }
  if (!res.ok) throw new Error(data.error || 'Error inesperado.');
  return data;
}

// ------------------------------------------------------------------ inicio / login
async function start() {
  try {
    const res = await fetch('/api/admin/me', { credentials: 'same-origin' });
    if (res.status === 503) return renderMessage((await res.json()).error);
    if (!res.ok) return renderLogin();
    await loadAll();
  } catch {
    renderMessage('No fue posible conectar con el panel. Revisa tu conexión a internet.');
  }
}

function renderMessage(msg) {
  topbar.hidden = true;
  app.innerHTML = `<div class="login"><img src="/img/brand/logo-horizontal.webp" alt="Viajes Waira" /><p>${esc(msg)}</p></div>`;
}

function renderLogin(message = '') {
  topbar.hidden = true;
  app.innerHTML = `
    <form class="login" id="login">
      <img src="/img/brand/logo-horizontal.webp" alt="Viajes Waira" />
      <h1>Panel de administración</h1>
      <p>Ingresa la contraseña para administrar paquetes y destinos.</p>
      <label class="hp" for="pw" hidden>Contraseña</label>
      <input type="password" id="pw" autocomplete="current-password" placeholder="Contraseña" required autofocus />
      <button class="btn btn-primary" type="submit">Entrar</button>
      <p class="error" role="alert">${esc(message)}</p>
    </form>`;
  const form = document.getElementById('login');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    try {
      await api('login', { password: form.pw.value });
      await loadAll();
    } catch (err) {
      form.querySelector('.error').textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

async function loadAll() {
  app.innerHTML = '<p class="loading">Cargando información…</p>';
  const [p, d] = await Promise.all([api('list?type=paquetes'), api('list?type=destinos')]);
  state.data.paquetes = p.items;
  state.data.destinos = d.items;
  topbar.hidden = false;
  renderList();
}

// ------------------------------------------------------------------ lista
const sortItems = (items, key) =>
  [...items].sort((a, b) => (a.data.order ?? 50) - (b.data.order ?? 50) || String(a.data[key]).localeCompare(String(b.data[key]), 'es'));
const destinoById = (id) => state.data.destinos.find((d) => d.id === id);

function renderList() {
  state.editing = null;
  document.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === state.tab)));
  const cfg = FORMS[state.tab];
  const term = norm(state.search).trim();
  const items = sortItems(state.data[state.tab], cfg.title).filter((it) => !term || norm(Object.values(it.data).join(' ')).includes(term));

  const rows = items
    .map((it) => {
      const d = it.data;
      const dest = state.tab === 'paquetes' ? destinoById(d.destinationId) : null;
      const photo = d.image || d.gallery?.[0] || dest?.data.image || dest?.data.gallery?.[0];
      const sub = state.tab === 'paquetes'
        ? `${esc(dest ? dest.data.name : '⚠️ destino no encontrado')} · ${esc(d.duration || 'sin duración')}`
        : `${esc(d.city || '')}${d.city ? ', ' : ''}${esc(d.country)} · ${d.region === 'internacional' ? 'Internacional' : 'Nacional'}`;
      const price = state.tab === 'paquetes' ? d.price : d.priceFrom;
      return `
      <article class="item">
        <img src="${esc(imgSrc(photo))}" alt="" loading="lazy" />
        <div>
          <h2>${esc(d[cfg.title])}</h2>
          <p>${sub}</p>
          <p class="price">${state.tab === 'destinos' ? 'Desde ' : ''}$ ${money(price)}</p>
          <div class="chips">
            ${d.published === false ? '<span class="chip chip-hidden">OCULTO</span>' : '<span class="chip">PUBLICADO</span>'}
            ${d.demo ? '<span class="chip chip-demo">DEMO</span>' : ''}
            ${d.featured ? '<span class="chip chip-star">★ DESTACADO</span>' : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary btn-small" data-action="edit" data-id="${esc(it.id)}">✏️ Editar</button>
          <button class="btn btn-outline btn-small" data-action="duplicate" data-id="${esc(it.id)}">⧉ Duplicar</button>
          <button class="btn btn-outline btn-small" data-action="toggle" data-id="${esc(it.id)}">${d.published === false ? '👁 Publicar' : '🙈 Ocultar'}</button>
          <button class="btn btn-danger btn-small" data-action="delete" data-id="${esc(it.id)}">🗑 Eliminar</button>
        </div>
      </article>`;
    })
    .join('');

  app.innerHTML = `
    <div class="list-head">
      <h1>${state.tab === 'paquetes' ? 'Paquetes' : 'Destinos'} <small style="color:var(--muted);font-size:1rem">(${state.data[state.tab].length})</small></h1>
      <div class="list-tools">
        <input type="search" id="search" placeholder="Buscar…" value="${esc(state.search)}" />
        <button class="btn btn-primary" data-action="new">＋ Agregar ${cfg.singular}</button>
      </div>
    </div>
    <p class="help">💡 Los cambios aparecen en la página web <b>1 o 2 minutos</b> después de guardar.
      ${state.tab === 'paquetes' ? 'Consejo: usa <b>Duplicar</b> para crear un paquete parecido a uno existente.' : 'Cada paquete pertenece a un destino.'}</p>
    <div class="items">${rows || `<p class="empty">No hay ${state.tab} ${state.search ? 'que coincidan con la búsqueda' : 'todavía'}.</p>`}</div>`;

  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    state.search = search.value;
    const pos = search.selectionStart;
    renderList();
    const s = document.getElementById('search');
    s.focus();
    s.setSelectionRange(pos, pos);
  });
}

// ------------------------------------------------------------------ formulario
function openForm(id, { duplicate = false } = {}) {
  const cfg = FORMS[state.tab];
  const item = id ? state.data[state.tab].find((it) => it.id === id) : null;
  const data = Object.assign(cfg.blank(), item ? clone(item.data) : {});
  if (duplicate) data[cfg.title] = `${data[cfg.title]} (copia)`;
  for (const key of ['includes', 'excludes', 'highlights']) if (key in data && !data[key].length) data[key] = [''];
  if ('itinerary' in data && !data.itinerary.length) data.itinerary = [{ title: '', text: '' }];
  state.editing = { id: duplicate ? null : id, data, isNew: !item || duplicate };
  renderForm();
  window.scrollTo(0, 0);
}

function fieldHtml(f, data) {
  const v = data[f.name];
  const hint = f.hint ? `<p class="hint">${esc(f.hint)}</p>` : '';
  const req = f.required ? ' <span class="req">*</span>' : '';
  const label = `<label for="f-${f.name}">${esc(f.label)}${req}</label>`;
  switch (f.type) {
    case 'text':
      return `<div class="field">${label}<input type="text" id="f-${f.name}" data-field="${f.name}" value="${esc(v)}" ${f.required ? 'required' : ''} />${hint}</div>`;
    case 'number':
      return `<div class="field">${label}<input type="text" inputmode="numeric" id="f-${f.name}" data-field="${f.name}" data-kind="int" value="${esc(v ?? '')}" style="max-width:140px" />${hint}</div>`;
    case 'money':
      return `<div class="field">${label}<div class="money"><span>$</span><input type="text" inputmode="numeric" id="f-${f.name}" data-field="${f.name}" data-kind="money" value="${v ? money(v) : ''}" placeholder="0" /></div><p class="hint">${esc(f.hint || 'Pesos colombianos (COP).')}</p></div>`;
    case 'textarea':
      return `<div class="field">${label}<textarea id="f-${f.name}" data-field="${f.name}">${esc(v)}</textarea>${hint}</div>`;
    case 'select': {
      const opts = f.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
      if (v && !opts.some((o) => o.value === v)) opts.push({ value: v, label: v });
      return `<div class="field">${label}<select id="f-${f.name}" data-field="${f.name}">${opts.map((o) => `<option value="${esc(o.value)}" ${o.value === v ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>${hint}</div>`;
    }
    case 'destino': {
      const opts = sortItems(state.data.destinos, 'name').map((d) => `<option value="${esc(d.id)}" ${d.id === v ? 'selected' : ''}>${esc(d.data.name)} (${esc(d.data.country)})</option>`);
      return `<div class="field">${label}<select id="f-${f.name}" data-field="${f.name}" required><option value="">— Elige un destino —</option>${opts.join('')}</select>${hint}</div>`;
    }
    case 'bool':
      return `<label class="switch"><input type="checkbox" data-field="${f.name}" data-kind="bool" ${v ? 'checked' : ''} /><div><b>${esc(f.label)}</b>${f.hint ? `<span>${esc(f.hint)}</span>` : ''}</div></label>`;
    case 'strings':
      return `<div class="field"><span class="label">${esc(f.label)}</span><div class="rows">${(v || [])
        .map(
          (s, i) => `<div class="row"><input type="text" data-field="${f.name}" data-index="${i}" value="${esc(s)}" placeholder="${esc(f.placeholder || '')}" aria-label="${esc(f.label)} ${i + 1}" />
            <button type="button" class="icon-btn danger" data-action="remove" data-field="${f.name}" data-index="${i}" aria-label="Quitar">✕</button></div>`,
        )
        .join('')}</div><button type="button" class="btn btn-outline btn-small add" data-action="add" data-field="${f.name}">＋ ${esc(f.addLabel || 'Agregar')}</button></div>`;
    case 'days':
      return `<div class="field"><div class="rows">${(v || [])
        .map(
          (d, i, arr) => `<div class="day">
            <div class="day-head"><span class="day-num">Día ${i + 1}</span><span class="spacer"></span>
              <button type="button" class="icon-btn" data-action="up" data-field="${f.name}" data-index="${i}" aria-label="Subir" ${i === 0 ? 'disabled' : ''}>↑</button>
              <button type="button" class="icon-btn" data-action="down" data-field="${f.name}" data-index="${i}" aria-label="Bajar" ${i === arr.length - 1 ? 'disabled' : ''}>↓</button>
              <button type="button" class="icon-btn danger" data-action="remove" data-field="${f.name}" data-index="${i}" aria-label="Quitar día">✕</button></div>
            <input type="text" data-field="${f.name}" data-index="${i}" data-sub="title" value="${esc(d.title)}" placeholder="Título del día. Ej: Llegada a Cartagena" />
            <textarea data-field="${f.name}" data-index="${i}" data-sub="text" placeholder="¿Qué se hace este día?">${esc(d.text)}</textarea>
          </div>`,
        )
        .join('')}</div><button type="button" class="btn btn-outline btn-small add" data-action="add" data-field="${f.name}">＋ Agregar día</button></div>`;
    case 'image':
      return `<div class="field"><span class="label">${esc(f.label)}</span><div class="single-photo">${
        v
          ? `<div class="photo"><img src="${esc(imgSrc(v))}" alt="" /><div class="tools"><button type="button" data-action="remove-photo" data-field="${f.name}" aria-label="Quitar foto">✕</button></div></div>`
          : `<label class="upload">📷 Subir foto<small>Desde tu celular o computador</small><input type="file" accept="image/*" data-upload="${f.name}" /></label>`
      }</div>${hint}</div>`;
    case 'images':
      return `<div class="field"><span class="label">${esc(f.label)}</span><div class="photos">${(v || [])
        .map(
          (p, i, arr) => `<div class="photo"><img src="${esc(imgSrc(p))}" alt="" /><div class="tools">
            ${i > 0 ? `<button type="button" data-action="up" data-field="${f.name}" data-index="${i}" aria-label="Mover antes">←</button>` : ''}
            ${i < arr.length - 1 ? `<button type="button" data-action="down" data-field="${f.name}" data-index="${i}" aria-label="Mover después">→</button>` : ''}
            <button type="button" data-action="remove" data-field="${f.name}" data-index="${i}" aria-label="Quitar foto">✕</button></div></div>`,
        )
        .join('')}<label class="upload">＋ Agregar fotos<small>Puedes elegir varias</small><input type="file" accept="image/*" multiple data-upload="${f.name}" /></label></div>${hint}</div>`;
    default:
      return '';
  }
}

function renderForm() {
  const cfg = FORMS[state.tab];
  const { data, isNew } = state.editing;
  const sections = cfg.sections
    .map((s) => {
      const html = [];
      for (let i = 0; i < s.fields.length; i++) {
        const f = s.fields[i];
        if (f.half && s.fields[i + 1]?.half) {
          html.push(`<div class="grid2">${fieldHtml(f, data)}${fieldHtml(s.fields[i + 1], data)}</div>`);
          i++;
        } else html.push(fieldHtml(f, data));
      }
      return `<section class="section"><h2>${esc(s.title)}</h2>${html.join('')}</section>`;
    })
    .join('');
  app.innerHTML = `
    <form class="form" id="edit" novalidate>
      <h1>${isNew ? `Nuevo ${cfg.singular}` : `Editar ${cfg.singular}`}</h1>
      <p>Los campos con <span class="req">*</span> son obligatorios. Al terminar pulsa <b>Guardar</b>.</p>
      ${sections}
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">💾 Guardar</button>
        <button class="btn btn-outline" type="button" data-action="cancel">Cancelar</button>
      </div>
    </form>`;
}

function readInput(el) {
  const { data } = state.editing;
  const { field, index, sub, kind } = el.dataset;
  let value = el.type === 'checkbox' ? el.checked : el.value;
  if (kind === 'money' || kind === 'int') {
    const n = Number(String(value).replace(/\D/g, '')) || 0;
    value = n;
    if (kind === 'money') {
      const formatted = n ? money(n) : '';
      if (el.value !== formatted) el.value = formatted;
    }
  }
  if (index === undefined) data[field] = value;
  else if (sub) data[field][Number(index)][sub] = value;
  else data[field][Number(index)] = value;
}

// Reduce y comprime la foto en el navegador (máx. 1600 px, WebP o JPEG)
async function processImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('No se pudo leer la imagen. Prueba con una foto JPG o PNG.'));
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    let blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.82));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    const stamp = new Date().toISOString().slice(0, 10);
    const rand = Math.random().toString(36).slice(2, 7);
    const path = `/img/uploads/${stamp}-${slug(file.name.replace(/\.[^.]+$/, ''))}-${rand}.${ext}`;
    state.pending.set(path, { base64, url: URL.createObjectURL(blob) });
    return path;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function save(form) {
  const cfg = FORMS[state.tab];
  const { data, id } = state.editing;
  // Limpia filas vacías
  for (const key of ['includes', 'excludes', 'highlights']) if (Array.isArray(data[key])) data[key] = data[key].map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(data.itinerary)) data.itinerary = data.itinerary.filter((d) => d.title.trim() || d.text.trim());

  const missing = cfg.sections.flatMap((s) => s.fields).filter((f) => f.required && !String(data[f.name] || '').trim());
  if (missing.length) {
    toast(`Completa: ${missing.map((f) => f.label).join(', ')}`, true);
    document.getElementById(`f-${missing[0].name}`)?.focus();
    return;
  }
  const used = [data.image, ...(data.gallery || [])].filter((p) => state.pending.has(p));
  const images = used.map((path) => ({ path, base64: state.pending.get(path).base64 }));

  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = images.length ? `Subiendo ${images.length} foto(s) y guardando…` : 'Guardando…';
  try {
    const res = await api('save', { type: state.tab, id, data, images });
    const list = state.data[state.tab];
    const existing = list.find((it) => it.id === res.id);
    if (existing) existing.data = clone(data);
    else list.push({ id: res.id, data: clone(data) });
    toast('✅ Guardado. La página web se actualizará en 1–2 minutos.');
    renderList();
  } catch (err) {
    if (err.message !== 'auth') toast(err.message, true);
    btn.disabled = false;
    btn.textContent = '💾 Guardar';
  }
}

// ------------------------------------------------------------------ eventos
document.addEventListener('click', async (e) => {
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    if (state.editing && !confirm('¿Salir sin guardar los cambios?')) return;
    state.tab = tab.dataset.tab;
    state.search = '';
    return renderList();
  }
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id, field } = btn.dataset;
  const index = Number(btn.dataset.index);
  const list = state.editing?.data[field];

  switch (action) {
    case 'logout':
      await fetch('/api/admin/logout', { method: 'POST', headers: { 'X-Waira-Admin': '1' } });
      return renderLogin();
    case 'new':
      return openForm(null);
    case 'edit':
      return openForm(id);
    case 'duplicate':
      return openForm(id, { duplicate: true });
    case 'cancel':
      return renderList();
    case 'toggle':
    case 'delete': {
      const item = state.data[state.tab].find((it) => it.id === id);
      const name = item.data[FORMS[state.tab].title];
      if (action === 'delete') {
        if (state.tab === 'destinos') {
          const used = state.data.paquetes.filter((p) => p.data.destinationId === id);
          if (used.length) return toast(`No se puede eliminar: ${used.length} paquete(s) usan este destino. Cámbialos o elimínalos primero.`, true);
        }
        if (!confirm(`¿Eliminar «${name}»? Esta acción no se puede deshacer desde el panel.\n\nSi solo quieres quitarlo de la página por un tiempo, usa «Ocultar».`)) return;
      }
      btn.disabled = true;
      try {
        if (action === 'delete') {
          await api('delete', { type: state.tab, id });
          state.data[state.tab] = state.data[state.tab].filter((it) => it.id !== id);
          toast(`🗑 «${name}» eliminado. La página se actualizará en 1–2 minutos.`);
        } else {
          const data = clone(item.data);
          data.published = data.published === false;
          await api('save', { type: state.tab, id, data, images: [] });
          item.data = data;
          toast(data.published ? `👁 «${name}» ahora está publicado.` : `🙈 «${name}» quedó oculto.`);
        }
        renderList();
      } catch (err) {
        if (err.message !== 'auth') toast(err.message, true);
        btn.disabled = false;
      }
      return;
    }
    case 'add':
      list.push(field === 'itinerary' ? { title: '', text: '' } : '');
      renderForm();
      setTimeout(() => {
        const inputs = app.querySelectorAll(`[data-field="${field}"][data-index="${list.length - 1}"]`);
        inputs[0]?.focus();
      });
      return;
    case 'remove':
      list.splice(index, 1);
      return renderForm();
    case 'up':
    case 'down': {
      const j = action === 'up' ? index - 1 : index + 1;
      [list[index], list[j]] = [list[j], list[index]];
      return renderForm();
    }
    case 'remove-photo':
      state.editing.data[field] = '';
      return renderForm();
  }
});

document.addEventListener('input', (e) => {
  if (state.editing && e.target.dataset.field && !e.target.dataset.upload) readInput(e.target);
});
document.addEventListener('change', async (e) => {
  const input = e.target;
  if (state.editing && input.dataset.field && input.type === 'checkbox') readInput(input);
  if (state.editing && input.tagName === 'SELECT') readInput(input);
  if (!input.dataset.upload || !input.files.length) return;
  const field = input.dataset.upload;
  const label = input.closest('.upload');
  label.firstChild.textContent = '⏳ Procesando…';
  try {
    for (const file of [...input.files].slice(0, 20)) {
      const path = await processImage(file);
      if (Array.isArray(state.editing.data[field])) state.editing.data[field].push(path);
      else state.editing.data[field] = path;
    }
  } catch (err) {
    toast(err.message, true);
  }
  renderForm();
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'edit') {
    e.preventDefault();
    save(e.target);
  }
});
window.addEventListener('beforeunload', (e) => {
  if (state.editing) e.preventDefault();
});

start();
