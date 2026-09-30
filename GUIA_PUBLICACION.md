# Guía de publicación — viajeswaira.com en Cloudflare Pages (GRATIS)

**Costo total: $0.** Lo único pagado es el dominio, que ya compraste en Namecheap y **sigue registrado en Namecheap**.

| Servicio | Proveedor | Costo |
|---|---|---|
| Dominio `viajeswaira.com` | Namecheap (ya pagado) | ya pagado |
| Hosting + CDN + deploy | Cloudflare Pages, plan **Free** | $0 |
| SSL / HTTPS | Cloudflare (Universal SSL, automático) | $0 |
| DNS | Cloudflare DNS, plan **Free** | $0 |
| Código fuente | GitHub, plan Free (repositorio privado permitido) | $0 |

> ⚠️ **No compres nada** en Namecheap ni en Cloudflare: ni hosting, ni "PremiumDNS", ni "PositiveSSL",
> ni el plan "Pro" de Cloudflare. Durante el proceso Cloudflare te ofrecerá planes: elige siempre **Free ($0)**.

---

## ⚠️ Antes de empezar: ¿hay que cambiar los nameservers? Sí, y te explico por qué

Pediste no cambiar los nameservers salvo que fuera realmente necesario. **En este caso sí lo es.**

**Por qué:** la documentación oficial de Cloudflare Pages indica que para usar un dominio raíz
(`viajeswaira.com`, sin `www`) en Pages, **el dominio debe ser una "zona" de tu cuenta de Cloudflare**, y para eso
los nameservers del dominio deben apuntar a Cloudflare. Solo los subdominios (`www.viajeswaira.com`) pueden
conectarse con un simple registro CNAME sin cambiar nameservers. Como quieres que funcione
`https://viajeswaira.com`, hay que cambiarlos.

**Qué implica (y qué NO implica):**

- ✅ El dominio **sigue registrado en Namecheap**. No es una transferencia: la renovación anual sigue en Namecheap.
- ✅ Es gratis (plan Free de Cloudflare) y reversible: puedes volver a "Namecheap BasicDNS" cuando quieras.
- ⚠️ Los registros DNS dejan de gestionarse en Namecheap ("Advanced DNS" queda inactivo) y pasan a gestionarse en
  el panel de Cloudflare → **DNS → Records**.
- ⚠️ Si usas o vas a usar **correo** con el dominio (Namecheap Private Email, Google Workspace, Zoho…), sus registros
  **MX/TXT** deben existir en Cloudflare (el paso 5 los importa automáticamente; revisa que estén).
  El reenvío de correo gratuito de Namecheap deja de funcionar con nameservers externos; la alternativa gratuita es
  **Cloudflare Email Routing** (Cloudflare → Email → Email Routing).
- ⏱️ La propagación suele tardar minutos u horas (máximo 24–48 h).

> **Plan B sin cambiar nameservers** (al final de esta guía): GitHub Pages Free con registros A en Namecheap.
> Funciona, pero Cloudflare Pages es más rápido, más completo (cabeceras de seguridad, vistas previas, rollback) y es tu
> primera opción. Recomendación: **Cloudflare Pages + cambio de nameservers**.

---

## 🚀 Ruta automática (recomendada): solo 3 cosas manuales

Casi todo está automatizado con **GitHub Actions** (gratis). Tú solo haces lo que exige iniciar sesión con **tu** cuenta:

### A. Crea tu cuenta de Cloudflare (2 min)
https://dash.cloudflare.com/sign-up → correo + contraseña → verifica el correo. Plan **Free**, sin tarjeta.

### B. Crea un token de API y pásalo a GitHub como secreto (5 min)
1. Cloudflare → ícono de perfil (arriba a la derecha) → **My Profile → API Tokens → Create Token** →
   **Create Custom Token → Get started**.
2. **Token name:** `github-viajeswaira`
3. **Permissions** (botón *+ Add more* para cada fila):

   | Tipo | Permiso | Nivel |
   |---|---|---|
   | Account | Cloudflare Pages | Edit |
   | Zone | Zone | Edit |
   | Zone | DNS | Edit |
   | Zone | Zone Settings | Edit |
   | Zone | Single Redirect | Edit |

4. **Account Resources:** Include → *tu cuenta*. **Zone Resources:** Include → **All zones from an account** → *tu cuenta*.
5. **Continue to summary → Create Token** → **copia el token** (solo se muestra una vez).
6. Copia también tu **Account ID**: Cloudflare → Account Home → menú **⋯** junto al nombre de la cuenta →
   *Copy account ID* (o aparece en la barra derecha de cualquier dominio / en la URL `dash.cloudflare.com/<ACCOUNT_ID>`).
7. GitHub → https://github.com/Tecnibrain/viajeswaira/settings/secrets/actions → **New repository secret**, dos veces:
   - Name `CLOUDFLARE_API_TOKEN` → Secret: *el token*
   - Name `CLOUDFLARE_ACCOUNT_ID` → Secret: *el Account ID*

   🔒 No pegues el token en el chat ni en ningún archivo: solo en los secretos de GitHub.

### Lo que hace la automatización (después de B)
- Workflow **"Configurar dominio en Cloudflare"** (`.github/workflows/setup-dominio.yml`): crea el proyecto
  Pages, agrega `viajeswaira.com` a Cloudflare (plan Free), crea los DNS `CNAME @` y `CNAME www` → `viajeswaira.pages.dev`
  (Proxied, TTL Auto), borra los registros de parking de Namecheap, conecta los dominios a Pages, activa HTTPS
  (Full strict, Always Use HTTPS, TLS 1.2) y la redirección `www → viajeswaira.com`. Al final **muestra los 2 nameservers**.
  Se ejecuta desde GitHub → **Actions → Configurar dominio en Cloudflare → Run workflow**.
- Workflow **"Publicar en Cloudflare Pages"** (`.github/workflows/deploy.yml`): en cada cambio hace el build y publica.

### C. Pon los 2 nameservers en Namecheap (2 min) — lo único que no se puede automatizar
Namecheap → **Domain List → Manage** (viajeswaira.com):
1. Pestaña **Advanced DNS** → si **DNSSEC** está activado, desactívalo.
2. Pestaña **Domain** → **NAMESERVERS** → cambia *Namecheap BasicDNS* por **Custom DNS** → escribe los 2 nameservers
   que mostró el workflow (tipo `xxxx.ns.cloudflare.com`) → **✓ verde**.

Cuando Cloudflare active el dominio (minutos a 24 h) y se emita el certificado, `https://viajeswaira.com` queda en línea.
Vuelve a ejecutar el workflow "Configurar dominio" para comprobar el estado.

---

## Ruta manual (alternativa, todo desde los paneles)

## PASO 1 — Revisa el código en GitHub (ya hecho por mí)

El proyecto ya está creado, compilado y probado, y está subido al repositorio
**https://github.com/Tecnibrain/viajeswaira**.

Configuración de compilación que usará Cloudflare:

| Campo | Valor |
|---|---|
| Framework preset | `Vite` (o `None`) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(vacío)* |
| Versión de Node | 22 (se toma del archivo `.node-version`) |

**Rama de producción:** Cloudflare publicará la rama que elijas como "Production branch". Lo recomendado es tener el
código en `main`. Si en GitHub el código está en otra rama, crea un Pull Request y fusiónalo a `main`
(o selecciona esa rama como Production branch en el Paso 3).

---

## PASO 2 — Crea tu cuenta gratuita de Cloudflare

1. Entra a **https://dash.cloudflare.com/sign-up**.
2. Escribe tu correo y una contraseña → **Sign up** (o "Crear cuenta").
3. Verifica tu correo con el enlace que te llega.
4. Recomendado: activa la verificación en dos pasos (tu perfil → **Authentication**).

No se pide tarjeta de crédito para el plan Free.

---

## PASO 3 — Crea el proyecto en Cloudflare Pages y conecta GitHub

1. En el panel de Cloudflare, menú izquierdo → **Workers & Pages** (en algunas cuentas aparece como
   **Compute → Workers & Pages**).
2. Botón **Create** (o *Create application*) → pestaña **Pages** → **Connect to Git** / *Import an existing Git repository*.
   - Importante: elige la opción de **Pages**, no la de "Workers".
3. Elige **GitHub** → **Connect GitHub**. Se abre GitHub:
   - Instala la app "Cloudflare Workers and Pages" en la cuenta/organización **Tecnibrain**.
   - Puedes darle acceso solo al repositorio **viajeswaira** (*Only select repositories*).
4. De vuelta en Cloudflare, selecciona el repositorio **viajeswaira** → **Begin setup**.
5. Completa:
   - **Project name:** `viajeswaira` (tu sitio temporal será `https://viajeswaira.pages.dev`;
     si el nombre está ocupado, Cloudflare te dará otro similar, anótalo).
   - **Production branch:** `main` (o la rama donde esté el código).
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. **Save and Deploy**. Espera 1–2 minutos.
7. Abre `https://viajeswaira.pages.dev` (o el nombre que te asignó) y verifica que la página funciona.

A partir de ahora cada cambio que se suba a la rama de producción se publica solo.

---

## PASO 4 — (Preparación en Namecheap) Revisa DNSSEC y anota tus registros actuales

1. Entra a **https://www.namecheap.com** → **Sign In**.
2. Menú **Account → Domain List** → junto a `viajeswaira.com` pulsa **Manage**.
3. Pestaña **Advanced DNS**:
   - Busca la sección **DNSSEC**. Si está **activado, desactívalo** ahora (si no, el dominio puede dejar de
     resolver al cambiar de nameservers). Si está apagado, no hagas nada.
   - Toma una captura de pantalla de la tabla **Host Records** y de **Mail Settings** (por si tienes correo configurado).

---

## PASO 5 — Agrega viajeswaira.com a Cloudflare (plan Free)

1. En Cloudflare, menú izquierdo → **Account Home** (o *Websites* / *Domains*) → **Onboard a domain** / **Add a domain**.
2. Escribe `viajeswaira.com` → deja marcada la opción **Quick scan for DNS records** → **Continue**.
3. Elige el plan **Free** ($0) → **Continue**. (No elijas Pro ni Business.)
4. Cloudflare muestra los registros DNS que encontró. **Revisa y borra** los registros de "parking" de Namecheap si
   aparecen, porque chocarían con tu sitio:
   - `CNAME  www  →  parkingpage.namecheap.com` → **Delete**
   - Cualquier `A @` apuntando a IPs de Namecheap (p. ej. del "URL Redirect Record" / parking) → **Delete**
   - Mantén los registros de correo (**MX**, y **TXT** de SPF/DKIM/verificación) si usas correo con el dominio.
5. **Continue**. Cloudflare te mostrará **dos nameservers** asignados a tu cuenta, parecidos a:
   ```
   xxxx.ns.cloudflare.com
   yyyy.ns.cloudflare.com
   ```
   Cópialos **exactamente** como aparecen en TU pantalla (los nombres cambian por cuenta; no uses estos de ejemplo).

---

## PASO 6 — Cambia los nameservers en Namecheap

1. Namecheap → **Account → Domain List** → **Manage** en `viajeswaira.com`.
2. En la pestaña **Domain**, busca la sección **NAMESERVERS**.
3. En el menú desplegable, cambia **Namecheap BasicDNS** por **Custom DNS**.
4. Escribe los dos nameservers de Cloudflare (uno por línea):
   - Nameserver 1: `xxxx.ns.cloudflare.com` *(el tuyo)*
   - Nameserver 2: `yyyy.ns.cloudflare.com` *(el tuyo)*
5. Pulsa el **✓ verde** para guardar.
6. Vuelve a Cloudflare y pulsa **Check nameservers** / *Done, check nameservers*.
7. Cuando el dominio aparezca como **Active** (recibirás un correo de Cloudflare), sigue con el Paso 7.
   Normalmente tarda de 5 minutos a unas horas; como máximo 24–48 h.

---

## PASO 7 — Conecta viajeswaira.com y www al proyecto Pages

1. Cloudflare → **Workers & Pages** → proyecto **viajeswaira** → pestaña **Custom domains**.
2. **Set up a custom domain** → escribe `viajeswaira.com` → **Continue** → **Activate domain**.
3. Repite: **Set up a custom domain** → `www.viajeswaira.com` → **Continue** → **Activate domain**.

Como el dominio ya es una zona de tu cuenta, Cloudflare **crea los registros DNS automáticamente**.
Verifica en Cloudflare → `viajeswaira.com` → **DNS → Records** que existan exactamente estos:

| Tipo | Nombre | Valor (contenido) | TTL | Proxy |
|---|---|---|---|---|
| CNAME | `viajeswaira.com` (`@`) | `viajeswaira.pages.dev` | Auto | **Proxied** (nube naranja) |
| CNAME | `www` | `viajeswaira.pages.dev` | Auto | **Proxied** (nube naranja) |

> Si tu proyecto recibió otro nombre (p. ej. `viajeswaira-abc.pages.dev`), el valor será ese.
> El CNAME en la raíz (`@`) es válido en Cloudflare gracias al "CNAME flattening" (gratis).
> Si los creas tú a mano, **primero** agrega el dominio en *Custom domains* del proyecto; un CNAME creado solo
> en DNS sin asociarlo al proyecto da error 522.

Registros en Namecheap: **ninguno**. Con nameservers de Cloudflare, Namecheap ya no usa sus registros DNS;
todo se gestiona en Cloudflare.

---

## PASO 8 — Activa HTTPS (gratis y automático)

1. El certificado SSL de `viajeswaira.com` y `www` lo emite Cloudflare automáticamente al activar los dominios
   en el Paso 7. En *Custom domains* el estado pasará de **Initializing / Pending** a **Active** (de minutos a ~1 h).
2. Cloudflare → `viajeswaira.com` → **SSL/TLS**:
   - **Overview → modo de cifrado:** **Full (strict)** (para Pages también sirve *Full*; no uses *Flexible*).
   - **Edge Certificates → Always Use HTTPS:** **On**.
   - **Edge Certificates → Automatic HTTPS Rewrites:** **On**.
   - **Edge Certificates → Minimum TLS Version:** `TLS 1.2`.
3. No compres ningún certificado: el **Universal SSL** gratuito es suficiente.

---

## PASO 9 — Redirige www → viajeswaira.com (recomendado para SEO)

1. Cloudflare → `viajeswaira.com` → **Rules** → **Redirect Rules** (o *Rules → Overview → Create rule → Redirect Rule*).
2. Usa la plantilla **"Redirect from WWW to Root"** si aparece; si no, crea la regla manualmente:
   - **Rule name:** `www a raiz`
   - **If incoming requests match… → Custom filter expression:** Field `Hostname`, Operator `equals`,
     Value `www.viajeswaira.com`
   - **Then → URL redirect:** Type **Dynamic**, Expression:
     `concat("https://viajeswaira.com", http.request.uri.path)`
   - **Status code:** `301` — marca **Preserve query string**.
3. **Deploy**. (El plan Free incluye reglas de redirección gratis.)

---

## PASO 10 — Verifica que todo funciona

1. Abre **https://viajeswaira.com** → debe cargar la página con el candado 🔒.
2. Abre **http://viajeswaira.com** → debe redirigir a `https://`.
3. Abre **https://www.viajeswaira.com** → debe redirigir a `https://viajeswaira.com`.
4. Prueba en el celular (datos móviles, no Wi‑Fi) para descartar caché.
5. Revisa estas URLs:
   - https://viajeswaira.com/destinos
   - https://viajeswaira.com/paquete?id=cartagena-colonial-y-caribe
   - https://viajeswaira.com/reservas
   - https://viajeswaira.com/sitemap.xml
   - https://viajeswaira.com/robots.txt
6. Herramientas gratuitas:
   - Propagación DNS: https://dnschecker.org → `viajeswaira.com`, tipo `NS` (deben salir los de Cloudflare).
   - Certificado: https://www.ssllabs.com/ssltest/ → `viajeswaira.com`.
   - Rendimiento (Core Web Vitals): https://pagespeed.web.dev → `https://viajeswaira.com`.
   - Cabeceras de seguridad: https://securityheaders.com → `https://viajeswaira.com`.
   - Desde una terminal: `nslookup -type=ns viajeswaira.com` y `curl -I https://viajeswaira.com`.

**Si algo falla:**
- *"DNS_PROBE_FINISHED_NXDOMAIN"* o no carga: la propagación aún no termina (espera) o DNSSEC seguía activo en Namecheap.
- *Error 522*: el dominio no está agregado en **Custom domains** del proyecto Pages (Paso 7).
- *Aparece la página de parking de Namecheap*: quedó un registro de parking en Cloudflare DNS; bórralo (Paso 5.4).
- *"Too many redirects"*: el modo SSL está en *Flexible*; cámbialo a **Full (strict)**.

---

## PASO 11 — Da de alta el sitio en Google (gratis)

1. Entra a **https://search.google.com/search-console** → **Add property** → tipo **Domain** → `viajeswaira.com`.
2. Google te da un registro **TXT**. Agrégalo en Cloudflare → **DNS → Records → Add record**:

   | Tipo | Nombre | Valor | TTL | Proxy |
   |---|---|---|---|---|
   | TXT | `@` | `google-site-verification=…` (el que te dé Google) | Auto | *(no aplica, DNS only)* |

3. **Verify** → luego en **Sitemaps** envía: `https://viajeswaira.com/sitemap.xml`.
4. Opcional: crea tu **Perfil de Empresa en Google** (Google Business Profile) cuando tengas dirección real.

---

## PASO 12 — Completa tus datos reales

Edita `src/config.js` en GitHub (clic en el archivo → ícono del lápiz → **Commit changes**) y reemplaza:

- `WHATSAPP_NUMBER` → p. ej. `'573001234567'` (indicativo + número, solo dígitos)
- `email`, `phone`, `address`, `hours`, `rnt`
- `social.instagram`, `social.facebook`, `social.tiktok` (URL completas `https://…`)
- `colors` si quieres ajustar la marca

Al guardar el cambio en la rama de producción, Cloudflare vuelve a publicar solo en 1–2 minutos.

---

## Plan B — Sin cambiar nameservers (GitHub Pages Free)

Úsalo solo si decides **no** cambiar los nameservers. Requisitos: el repositorio debe ser **público** (GitHub Pages
gratis no publica repositorios privados en cuentas Free) y un workflow de GitHub Actions que haga `npm run build` y
publique `dist/` (puedo agregarlo si eliges esta opción).

Registros en Namecheap → **Domain List → Manage → Advanced DNS → Host Records → Add New Record**
(borra antes el `CNAME www → parkingpage.namecheap.com` y el `URL Redirect Record` de parking):

| Tipo | Host | Valor | TTL |
|---|---|---|---|
| A Record | `@` | `185.199.108.153` | Automatic |
| A Record | `@` | `185.199.109.153` | Automatic |
| A Record | `@` | `185.199.110.153` | Automatic |
| A Record | `@` | `185.199.111.153` | Automatic |
| CNAME Record | `www` | `tecnibrain.github.io.` | Automatic |

Luego en GitHub → repositorio → **Settings → Pages → Custom domain:** `viajeswaira.com` → **Save**, y marca
**Enforce HTTPS** cuando esté disponible. (En GitHub Pages los archivos `_headers` y `_redirects` no se aplican.)

---

## Mantenimiento

- **Publicar cambios:** edita y sube a la rama de producción → Cloudflare publica solo.
- **Vista previa:** cualquier otra rama genera una URL `https://<rama>.viajeswaira.pages.dev` para revisar antes.
- **Volver atrás:** Workers & Pages → viajeswaira → **Deployments** → despliegue anterior → **⋯ → Rollback to this deployment**.
- **Límites del plan Free de Pages:** 500 builds al mes, ancho de banda ilimitado; de sobra para este sitio.
- **Renovación del dominio:** en Namecheap (activa *Auto-Renew* para no perderlo). Es el único pago.
- **Pagos en línea (futuro):** ver `src/payments/README.md`. Las claves privadas se guardan como *Secrets* en
  Cloudflare, nunca en el código.
