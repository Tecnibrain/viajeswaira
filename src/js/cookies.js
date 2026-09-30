/**
 * Aviso de cookies y preferencias.
 * Hoy el sitio solo usa almacenamiento técnico necesario (no hay publicidad ni analítica).
 * Si en el futuro se agrega analítica (p. ej. Google Analytics), cárgala SOLO cuando
 * window.wairaCookies.analytics === true, o escuchando el evento 'waira:cookies'.
 */
const KEY = 'waira-cookies-v1';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}
function save(prefs) {
  const value = { necessary: true, analytics: Boolean(prefs.analytics), date: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* modo privado: se vuelve a preguntar en la próxima visita */
  }
  window.wairaCookies = value;
  window.dispatchEvent(new CustomEvent('waira:cookies', { detail: value }));
}

function banner(showSettings = false) {
  document.querySelector('.cookie-banner')?.remove();
  const current = read() || { analytics: false };
  const el = document.createElement('div');
  el.className = 'cookie-banner';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', 'Aviso de cookies');
  el.innerHTML = `
    <div class="cookie-text">
      <strong>🍪 Usamos cookies</strong>
      <p>Usamos cookies y almacenamiento local necesarios para que el sitio funcione. Con tu permiso, podríamos usar cookies de análisis para mejorar la página.
      Más información en nuestra <a href="/privacidad#cookies">Política de privacidad y cookies</a>.</p>
      <div class="cookie-settings" ${showSettings ? '' : 'hidden'}>
        <label><input type="checkbox" checked disabled /> <span><b>Necesarias</b> — imprescindibles para el funcionamiento. Siempre activas.</span></label>
        <label><input type="checkbox" data-cookie="analytics" ${current.analytics ? 'checked' : ''} /> <span><b>Análisis</b> — estadísticas anónimas de visitas.</span></label>
      </div>
    </div>
    <div class="cookie-actions">
      <button type="button" class="btn btn-primary btn-sm" data-cookie-action="accept">Aceptar todas</button>
      <button type="button" class="btn btn-outline btn-sm" data-cookie-action="reject">Solo necesarias</button>
      <button type="button" class="btn btn-outline btn-sm" data-cookie-action="${showSettings ? 'save' : 'settings'}">${showSettings ? 'Guardar selección' : 'Configurar'}</button>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', (e) => {
    const action = e.target.closest('[data-cookie-action]')?.dataset.cookieAction;
    if (!action) return;
    if (action === 'settings') return banner(true);
    if (action === 'accept') save({ analytics: true });
    if (action === 'reject') save({ analytics: false });
    if (action === 'save') save({ analytics: el.querySelector('[data-cookie="analytics"]').checked });
    el.remove();
  });
}

const stored = read();
window.wairaCookies = stored || { necessary: true, analytics: false };
if (!stored) banner();
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-cookie-settings]')) banner(true);
});
