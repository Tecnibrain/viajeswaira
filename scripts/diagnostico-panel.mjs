/**
 * Diagnóstico del panel /admin en producción (solo lectura).
 * Inicia sesión con el primer usuario de ADMIN_USERS y prueba cada sección.
 * Nunca imprime contraseñas ni cookies.
 */
const BASE = process.env.SITE_URL || 'https://viajeswaira.com';
const line = String(process.env.ADMIN_USERS || '').split(/[\n,]+/).find((l) => l.includes(':'));
const [user, ...rest] = line ? line.split(':') : ['admin', process.env.ADMIN_PASSWORD || ''];
const password = rest.join(':').trim();
const log = (...a) => console.log(...a);

log('```');
const js = await fetch(`${BASE}/admin/admin.js`, { cache: 'no-store' });
const jsText = await js.text();
log(`admin.js: HTTP ${js.status} · cache-control="${js.headers.get('cache-control')}" · incluye pestaña Contacto: ${jsText.includes('FORMS.sitio')}`);
const html = await (await fetch(`${BASE}/admin/`)).text();
log(`admin/index.html incluye botón Contacto: ${html.includes('data-tab="sitio"')}`);

const H = { 'Content-Type': 'application/json', 'X-Waira-Admin': '1', Origin: BASE };
const login = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: H, body: JSON.stringify({ user: user.trim(), password }) });
log(`login (${user.trim()}): HTTP ${login.status} ${login.ok ? '' : (await login.text()).slice(0, 150)}`);
const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
for (const type of ['paquetes', 'destinos', 'sitio']) {
  const r = await fetch(`${BASE}/api/admin/list?type=${type}`, { headers: { Cookie: cookie } });
  const body = await r.text();
  let info = body.slice(0, 200);
  try {
    const j = JSON.parse(body);
    if (j.items) info = `${j.items.length} elemento(s): ${j.items.map((i) => i.id).join(', ').slice(0, 150)}`;
    if (type === 'sitio' && j.items?.[0]) info += ` · campos: ${Object.keys(j.items[0].data).join(', ')}`;
  } catch {}
  log(`list ${type}: HTTP ${r.status} · ${info}`);
}
log('```');
