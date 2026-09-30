# Cómo subir paquetes y destinos (sin saber de código)

Viajes Waira tiene un **panel de administración** en:

## 👉 https://viajeswaira.com/admin

Ahí llenas formularios (nombre, precio, fotos, itinerario…), pulsas **Guardar** y en **1 o 2 minutos** el cambio
aparece en la página web. No tienes que tocar código. Funciona en computador y en celular. Es gratis.

---

## Primera vez: crear tu "llave" de acceso (5 minutos, solo una vez)

El panel guarda la información en GitHub (donde vive el sitio). Para entrar necesitas una llave personal:

1. Entra a GitHub con la cuenta dueña del sitio (**Tecnibrain**).
2. Abre este enlace: **https://github.com/settings/personal-access-tokens/new**
3. Llena así:
   - **Token name:** `Panel Viajes Waira`
   - **Expiration:** elige `Custom` y pon una fecha dentro de 1 año (o la opción más larga disponible).
   - **Repository access:** marca **Only select repositories** y elige **Tecnibrain/viajeswaira**.
   - **Permissions → Repository permissions → Contents:** cambia a **Read and write**.
4. Baja y pulsa **Generate token**. Copia la llave (empieza por `github_pat_…`).
   Guárdala en un lugar seguro (por ejemplo, tu gestor de contraseñas). **No la compartas con nadie.**
5. Abre **https://viajeswaira.com/admin** → pulsa **"Iniciar sesión con token de acceso"**
   (*Sign In Using Access Token*) → pega la llave → **Iniciar sesión**.

El navegador te recordará; no tendrás que pegarla cada vez.

> Para entrar desde el celular: en el computador, ya dentro del panel, usa la opción **"Iniciar sesión en el móvil"**
> (menú de tu cuenta, arriba a la derecha) y escanea el código QR con el celular.

> Si la llave vence, repite estos pasos y crea una nueva.

---

## Crear un paquete nuevo

1. En el panel, menú izquierdo → **Paquetes** → botón **Nuevo Paquete**.
2. Llena los campos (cada uno tiene una ayuda debajo):

| Campo | Qué poner | Ejemplo |
|---|---|---|
| Nombre del paquete | El título | `Eje Cafetero Mágico` |
| Destino | Elige de la lista | `Medellín (Colombia)` |
| Duración | Días y noches | `4 días / 3 noches` |
| Precio por persona (COP) | **Solo números**, sin puntos ni $ | `1350000` |
| Categoría | Elige una | `Naturaleza` |
| Descripción corta | 2 o 3 líneas | `Café, paisajes y pueblos coloridos…` |
| Foto principal | Arrastra una foto (opcional) | |
| Galería de fotos | Más fotos (opcional) | |
| Qué incluye | Pulsa **Agregar ítem** por cada cosa | `Hotel con desayuno` |
| Qué NO incluye | Igual | `Propinas` |
| Itinerario | Pulsa **Agregar día** por cada día, en orden | Título: `Llegada` / Actividades: `Traslado al hotel…` |
| Destacar en la página de inicio | Enciéndelo para que salga en el inicio | |
| Publicado | Encendido = se ve en la web | |
| Es información de ejemplo (DEMO) | **Apagado** para paquetes reales | |
| Orden | Número menor = aparece primero | `1` |

3. Pulsa **Guardar** (arriba a la derecha).
4. Espera 1–2 minutos y recarga **https://viajeswaira.com/paquetes**. ¡Listo!

El paquete aparece automáticamente en:
- La lista de **Paquetes** (con su filtro de categoría),
- La página del **destino** que elegiste,
- El formulario de **Reservas** (lista de paquetes),
- El **inicio**, si lo marcaste como destacado,
- El **sitemap** para Google.

Los botones **Reservar** y **WhatsApp** del paquete se crean solos con el nombre del paquete.

---

## Editar, ocultar o borrar

- **Editar:** Paquetes → toca el paquete → cambia lo que quieras → **Guardar**.
- **Ocultar temporalmente** (por ejemplo, sin cupos): apaga **Publicado** → Guardar. No se borra; puedes volver a encenderlo.
- **Borrar:** abre el paquete → menú **⋮** → **Eliminar**.
- **Cambiar un precio de temporada:** edita el número → Guardar.

---

## Crear un destino nuevo

Si vas a vender un paquete a un lugar que no está en la lista (por ejemplo, *Eje Cafetero*):

1. **Destinos → Nuevo Destino**.
2. Llena: nombre, ciudad, país, tipo (Nacional / Internacional), descripción, **foto principal**, imperdibles, precio desde y duración sugerida.
3. **Guardar**. Ya podrás elegirlo en el campo **Destino** de tus paquetes.

---

## Fotos: recomendaciones

- Usa fotos **propias** o con permiso de uso comercial (no descargues fotos de Google).
- Mejor **horizontales** (más anchas que altas).
- Puedes subirlas directamente desde el celular o la cámara: el panel las **reduce y optimiza solo**
  (formato WebP, máximo 1600 px) para que la página cargue rápido.

---

## Quitar los datos DEMO

Los 8 paquetes y 8 destinos actuales son de ejemplo y muestran la etiqueta **DEMO**. Cuando tengas los reales:

- Edita cada uno con la información real y apaga **"Es información de ejemplo (DEMO)"**, o
- Apaga **Publicado** / elimina los que no uses.

Cuando ya no quede nada de ejemplo, pídele al desarrollador que quite la franja superior
"Sitio en construcción…" (o se quita en `partials/header.html`, línea `demo-bar`).

---

## Preguntas frecuentes

**Guardé y no veo el cambio.** Espera 2 minutos y recarga la página (en el celular, desliza hacia abajo para recargar).
Si sigue igual, revisa en https://github.com/Tecnibrain/viajeswaira/actions que el último "Publicar en Cloudflare Pages" tenga ✅.

**Me equivoqué y borré algo.** Todo queda guardado en el historial de GitHub y se puede recuperar. Pide ayuda al desarrollador.

**¿Otra persona puede subir paquetes?** Sí: debe tener una cuenta de GitHub con acceso al repositorio
(GitHub → repositorio → Settings → Collaborators → Add people) y crear su propia llave con los pasos de arriba.

**¿Cuesta algo?** No. El panel (Sveltia CMS), GitHub y Cloudflare Pages son gratuitos para este uso.
