/**
 * API del panel de administración de Viajes Waira (Cloudflare Pages Function, plan Free).
 *
 *  - El acceso se protege con usuario y contraseña (secreto ADMIN_USERS en Cloudflare,
 *    una línea por persona con el formato  usuario:contraseña ).
 *  - Los cambios se guardan como archivos JSON en GitHub (content/paquetes, content/destinos)
 *    usando el secreto CMS_GITHUB_TOKEN. Cada guardado es un commit, y GitHub Actions
 *    publica el sitio automáticamente en 1–2 minutos.
 *  - Ningún secreto se envía al navegador.
 *
 * Rutas (todas bajo /api/admin/):
 *   POST login  { user, password }  GET  me            POST logout
 *   GET  list?type=paquetes|destinos
 *   POST save   { type, id?, data, images:[{ path, base64 }] }
 *   POST delete { type, id }
 */

const DEFAULT_REPO = 'Tecnibrain/viajeswaira';
const DEFAULT_BRANCH = 'ccr-e5c74af5-vsp1td';
const FOLDERS = { paquetes: 'content/paquetes', destinos: 'content/destinos' };
const COOKIE = 'waira_admin';
const SESSION_DAYS = 30;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const enc = new TextEncoder();

// ---------------------------------------------------------------- utilidades
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

function bytesToBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const textToBase64 = (text) => bytesToBase64(enc.encode(text));
const base64ToText = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
const b64url = (bytes) => bytesToBase64(bytes).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const slugify = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

// ---------------------------------------------------------------- sesión
/** Lee ADMIN_USERS ("usuario:contraseña" por línea o separados por coma). ADMIN_PASSWORD = usuario "admin". */
function getUsers(env) {
  const users = new Map();
  for (const line of String(env.ADMIN_USERS || '').split(/[\n,]+/)) {
    const i = line.indexOf(':');
    if (i > 0) users.set(line.slice(0, i).trim().toLowerCase(), line.slice(i + 1).trim());
  }
  if (env.ADMIN_PASSWORD && !users.has('admin')) users.set('admin', String(env.ADMIN_PASSWORD));
  for (const [u, p] of users) if (!u || !p) users.delete(u);
  return users;
}

async function hmacKey(env) {
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(`waira|${env.ADMIN_USERS}|${env.ADMIN_PASSWORD}|${env.CMS_GITHUB_TOKEN}`));
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
const sign = async (env, payload) => b64url(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(env), enc.encode(payload))));

async function newSessionCookie(env, user) {
  const exp = String(Date.now() + SESSION_DAYS * 864e5);
  const value = `${user}.${exp}.${await sign(env, `${user}|${exp}`)}`;
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
}

/** Devuelve el usuario de la sesión, o null si no hay sesión válida */
async function sessionUser(env, request) {
  const cookie = (request.headers.get('Cookie') || '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!cookie) return null;
  const [user, exp, sig] = cookie.slice(COOKIE.length + 1).split('.');
  if (!user || !exp || !sig || Number(exp) < Date.now() || !getUsers(env).has(user)) return null;
  return safeEqual(sig, await sign(env, `${user}|${exp}`)) ? user : null;
}

const sha = async (text) => b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(String(text)))));

/** Comprueba usuario y contraseña; devuelve el usuario normalizado o null */
async function checkLogin(env, user, password) {
  const name = String(user || '').trim().toLowerCase();
  const expected = getUsers(env).get(name);
  // Se compara siempre (aunque el usuario no exista) para no revelar qué usuarios existen
  const ok = safeEqual(await sha(password || ''), await sha(expected ?? `\u0000${Math.random()}`));
  return ok && expected ? name : null;
}

// ---------------------------------------------------------------- GitHub
function github(env) {
  const api = env.GITHUB_API || 'https://api.github.com';
  const repo = env.CMS_REPO || DEFAULT_REPO;
  const branch = env.CMS_BRANCH || DEFAULT_BRANCH;
  async function call(method, path, body) {
    const res = await fetch(`${api}/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${env.CMS_GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'viajeswaira-admin',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 300)}`);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  return { branch, call };
}

async function listFiles(gh, folder) {
  try {
    const files = await gh.call('GET', `/contents/${folder}?ref=${encodeURIComponent(gh.branch)}`);
    return files.filter((f) => f.type === 'file' && f.name.endsWith('.json'));
  } catch (e) {
    if (e.status === 404) return [];
    throw e;
  }
}

async function listItems(gh, type) {
  const files = await listFiles(gh, FOLDERS[type]);
  return Promise.all(
    files.map(async (f) => {
      const blob = await gh.call('GET', `/git/blobs/${f.sha}`);
      return { id: f.name.replace(/\.json$/, ''), data: JSON.parse(base64ToText(blob.content)) };
    }),
  );
}

/** Crea UN solo commit con varios archivos (y borrados). Reintenta si la rama avanzó. */
async function commitFiles(gh, message, files, deletes = []) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = await gh.call('GET', `/git/ref/heads/${gh.branch}`);
    const parent = ref.object.sha;
    const parentCommit = await gh.call('GET', `/git/commits/${parent}`);
    const tree = [];
    for (const f of files) {
      const blob = await gh.call('POST', '/git/blobs', { content: f.base64, encoding: 'base64' });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    for (const path of deletes) tree.push({ path, mode: '100644', type: 'blob', sha: null });
    const newTree = await gh.call('POST', '/git/trees', { base_tree: parentCommit.tree.sha, tree });
    const commit = await gh.call('POST', '/git/commits', { message, tree: newTree.sha, parents: [parent] });
    try {
      await gh.call('PATCH', `/git/refs/heads/${gh.branch}`, { sha: commit.sha });
      return commit.sha;
    } catch (e) {
      if (e.status !== 422 || attempt === 2) throw e; // 422 = la rama cambió mientras tanto
    }
  }
}

// ---------------------------------------------------------------- validación de datos
const str = (v, max = 2000) => String(v ?? '').trim().slice(0, max);
const int = (v) => Math.max(0, Math.round(Number(String(v ?? '').replace(/[^\d.-]/g, '')) || 0));
const bool = (v) => v === true || v === 'true';
const strList = (v, max = 300) => (Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, 60) : []);
const imgPath = (v) => {
  const s = str(v, 300);
  return /^\/img\/[a-z0-9/_.-]+\.(webp|jpe?g|png|svg)$/i.test(s) ? s : '';
};
const imgList = (v) => (Array.isArray(v) ? v.map(imgPath).filter(Boolean).slice(0, 30) : []);

const SCHEMAS = {
  paquetes: (d) => ({
    title: str(d.title, 120),
    destinationId: slugify(d.destinationId),
    duration: str(d.duration, 60),
    price: int(d.price),
    category: str(d.category, 40) || 'Playa',
    description: str(d.description, 600),
    image: imgPath(d.image),
    gallery: imgList(d.gallery),
    includes: strList(d.includes),
    excludes: strList(d.excludes),
    itinerary: (Array.isArray(d.itinerary) ? d.itinerary : [])
      .map((s) => ({ title: str(s?.title, 120), text: str(s?.text, 1500) }))
      .filter((s) => s.title || s.text)
      .slice(0, 60),
    featured: bool(d.featured),
    published: d.published === undefined ? true : bool(d.published),
    demo: bool(d.demo),
    order: int(d.order ?? 50),
  }),
  destinos: (d) => ({
    name: str(d.name, 80),
    city: str(d.city, 80),
    country: str(d.country, 80),
    region: d.region === 'internacional' ? 'internacional' : 'nacional',
    description: str(d.description, 800),
    image: imgPath(d.image),
    gallery: imgList(d.gallery),
    highlights: strList(d.highlights, 120),
    priceFrom: int(d.priceFrom),
    duration: str(d.duration, 60),
    published: d.published === undefined ? true : bool(d.published),
    demo: bool(d.demo),
    order: int(d.order ?? 50),
  }),
};
const REQUIRED = { paquetes: ['title', 'destinationId'], destinos: ['name', 'country'] };
const LABEL = { paquetes: 'paquete', destinos: 'destino' };

// ---------------------------------------------------------------- manejadores
async function handleSave(env, body, user) {
  const { type } = body;
  if (!FOLDERS[type]) return json({ error: 'Tipo no válido.' }, 400);
  const data = SCHEMAS[type](body.data || {});
  const missing = REQUIRED[type].filter((k) => !data[k]);
  if (missing.length) return json({ error: `Faltan campos obligatorios: ${missing.join(', ')}` }, 400);

  const gh = github(env);
  const existing = new Set((await listFiles(gh, FOLDERS[type])).map((f) => f.name.replace(/\.json$/, '')));
  let id = body.id ? slugify(body.id) : '';
  if (!id || !existing.has(id)) {
    // Elemento nuevo: id a partir del nombre, sin repetir
    const base = slugify(data.title || data.name);
    id = base;
    for (let n = 2; existing.has(id); n++) id = `${base}-${n}`;
  }

  const files = [];
  for (const img of Array.isArray(body.images) ? body.images.slice(0, 20) : []) {
    const path = imgPath(img.path);
    if (!path.startsWith('/img/uploads/') || typeof img.base64 !== 'string') continue;
    if (img.base64.length * 0.75 > MAX_IMAGE_BYTES) return json({ error: 'Una de las fotos es demasiado grande.' }, 413);
    // Solo se suben las fotos que realmente se usan en el formulario
    if (![data.image, ...data.gallery].includes(path)) continue;
    files.push({ path: `public${path}`, base64: img.base64 });
  }
  files.push({ path: `${FOLDERS[type]}/${id}.json`, base64: textToBase64(JSON.stringify(data, null, 2) + '\n') });

  const name = data.title || data.name;
  await commitFiles(gh, `Panel (${user}): ${existing.has(id) ? 'actualiza' : 'crea'} ${LABEL[type]} «${name}»`, files);
  return json({ ok: true, id });
}

async function handleDelete(env, body, user) {
  const { type } = body;
  const id = slugify(body.id);
  if (!FOLDERS[type] || !body.id) return json({ error: 'Datos no válidos.' }, 400);
  const gh = github(env);
  const exists = (await listFiles(gh, FOLDERS[type])).some((f) => f.name === `${id}.json`);
  if (!exists) return json({ ok: true });
  await commitFiles(gh, `Panel (${user}): elimina ${LABEL[type]} «${id}»`, [], [`${FOLDERS[type]}/${id}.json`]);
  return json({ ok: true });
}

function friendlyError(e) {
  if (e.status === 401 || e.status === 403)
    return json({ error: 'La llave de GitHub del panel venció o no tiene permisos. Hay que renovarla (ver COMO_SUBIR_PAQUETES.md).' }, 502);
  if (e.status === 404) return json({ error: 'No se encontró el repositorio o la rama configurada.' }, 502);
  return json({ error: 'No se pudo guardar. Intenta de nuevo en un momento.', detail: String(e.message).slice(0, 200) }, 502);
}

export async function onRequest({ request, env, params }) {
  const route = (params.path || []).join('/');
  const method = request.method;

  if (!getUsers(env).size || !env.CMS_GITHUB_TOKEN) {
    return json({ error: 'El panel aún no está activado: faltan los secretos ADMIN_USERS y CMS_GITHUB_TOKEN.' }, 503);
  }
  // Protección CSRF: las escrituras deben venir del propio panel
  if (method !== 'GET') {
    const origin = request.headers.get('Origin');
    if (request.headers.get('X-Waira-Admin') !== '1' || (origin && new URL(origin).host !== new URL(request.url).host)) {
      return json({ error: 'Solicitud no permitida.' }, 403);
    }
  }

  try {
    if (route === 'login' && method === 'POST') {
      const { user, password } = await request.json().catch(() => ({}));
      const name = await checkLogin(env, user, password);
      if (!name) {
        await new Promise((r) => setTimeout(r, 1200)); // frena intentos repetidos
        return json({ error: 'Usuario o contraseña incorrectos.' }, 401);
      }
      return json({ ok: true, user: name }, 200, { 'Set-Cookie': await newSessionCookie(env, name) });
    }
    if (route === 'logout') {
      return json({ ok: true }, 200, { 'Set-Cookie': `${COOKIE}=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0` });
    }

    const user = await sessionUser(env, request);
    if (!user) return json({ error: 'Sesión cerrada. Vuelve a ingresar.' }, 401);

    if (route === 'me' && method === 'GET') return json({ ok: true, user });
    if (route === 'list' && method === 'GET') {
      const type = new URL(request.url).searchParams.get('type');
      if (!FOLDERS[type]) return json({ error: 'Tipo no válido.' }, 400);
      return json({ items: await listItems(github(env), type) });
    }
    if (route === 'save' && method === 'POST') return await handleSave(env, await request.json(), user);
    if (route === 'delete' && method === 'POST') return await handleDelete(env, await request.json(), user);
    return json({ error: 'Ruta no encontrada.' }, 404);
  } catch (e) {
    return friendlyError(e);
  }
}
