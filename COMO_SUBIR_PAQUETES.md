# Cómo subir paquetes y destinos (sin saber de código)

Viajes Waira tiene su propio **panel de administración**:

## 👉 https://viajeswaira.com/admin

Entras con **tu usuario y contraseña**, ves la lista de paquetes y usas botones:
**＋ Agregar · ✏️ Editar · ⧉ Duplicar · 🙈 Ocultar · 🗑 Eliminar**.
Guardas y en **1 o 2 minutos** el cambio aparece en la página. Funciona en computador y celular. Es gratis.

---

## Uso diario

### Agregar un paquete
1. Abre **viajeswaira.com/admin** y escribe tu **usuario** y **contraseña**.
2. Pulsa **＋ Agregar paquete**.
3. Llena el formulario (cada campo tiene un ejemplo debajo):
   - **Nombre**, **Destino** (se elige de una lista), **Duración** y **Precio** (solo números; se pone con puntos solo).
   - **Categoría** y **Descripción corta**.
   - **Fotos:** pulsa *📷 Subir foto*. Puedes tomarla con el celular o elegirla de la galería.
     El panel la **reduce y optimiza sola**.
   - **Qué incluye / No incluye:** escribe un ítem y pulsa *＋ Agregar* para el siguiente.
   - **Itinerario:** un bloque por día (*＋ Agregar día*). El número de día se pone solo;
     con ↑ ↓ cambias el orden.
   - **Opciones:** *Publicado*, *Destacar en el inicio*, *DEMO* (apágalo si la información es real).
4. Pulsa **💾 Guardar**. Verás: *"Guardado. La página se actualizará en 1–2 minutos."*

> 💡 **Truco:** para un paquete parecido a otro, usa **⧉ Duplicar** y solo cambia lo necesario.

### Editar, ocultar o eliminar
- **✏️ Editar:** cambia lo que quieras → **Guardar**.
- **🙈 Ocultar:** lo quita de la página sin borrarlo (por ejemplo, cuando no hay cupos). **👁 Publicar** lo vuelve a mostrar.
- **🗑 Eliminar:** lo borra (pide confirmación).

### Destinos
Pestaña **📍 Destinos**, mismos botones. Si vas a vender un paquete a un lugar nuevo, crea primero el destino.
Un destino que tiene paquetes no se puede eliminar (el panel te avisa).

### ☎️ Datos de contacto
Pestaña **☎️ Contacto**: WhatsApp, correo, teléfono, dirección, horarios, redes sociales (Instagram, Facebook, TikTok),
razón social, NIT y Registro Nacional de Turismo (RNT). Cambia lo que necesites y pulsa **Guardar**.
Los campos que dejes **vacíos no aparecen** en la página. Si borras el WhatsApp, se ocultan los botones de WhatsApp.

### ¿Qué pasa al guardar?
El paquete aparece solo en: la lista de **Paquetes**, la página de su **destino**, el formulario de **Reservas**,
el **inicio** (si es destacado) y en Google (sitemap). Sus botones **Reservar** y **WhatsApp** se crean solos.

---

## Activación (una sola vez, ~5 minutos)

El panel necesita dos "secretos" guardados en GitHub. **Nadie más los ve** y no quedan en el código.

> La llave del paso 1 es solo para que el panel pueda guardar en GitHub (GitHub no permite usar usuario y contraseña para eso).
> Se crea **una vez** y nadie la vuelve a usar. Para entrar al panel se usa **usuario y contraseña**.

### 1. Crea la llave para que el panel guarde los cambios
1. Entra a GitHub con la cuenta **Tecnibrain** y abre: **https://github.com/settings/personal-access-tokens/new**
2. Llena:
   - **Token name:** `Panel Viajes Waira`
   - **Expiration:** la fecha más lejana que permita (anótala para renovarla).
   - **Repository access:** **Only select repositories** → **Tecnibrain/viajeswaira**
   - **Permissions** → **+ Add permissions** → **Contents** → **Read and write**
     (⚠️ **no** elijas *Administration*). Al confirmar debe decir: *Contents: Read and write* y *Metadata: Read-only*.
3. **Generate token** y copia la llave (empieza por `github_pat_…`).

### 2. Guarda los dos secretos
Abre **https://github.com/Tecnibrain/viajeswaira/settings/secrets/actions** → **New repository secret**, dos veces:

| Name | Secret |
|---|---|
| `CMS_GITHUB_TOKEN` | la llave del paso 1 |
| `ADMIN_USERS` | los usuarios del panel, uno por línea, con el formato `usuario:contraseña` |

Ejemplo del secreto `ADMIN_USERS` (una persona por línea; contraseñas de mínimo 12 caracteres):

```
david:Waira-Viajes-2026!Cafe
maria:Playa-Tayrona-2026*Sol
```

### 3. Avísale al desarrollador (o publica de nuevo)
Se activa en la siguiente publicación. Para hacerlo tú: GitHub → **Actions** → **Publicar en Cloudflare Pages** → **Run workflow**.

---

## Preguntas frecuentes

**Agregar una persona, quitarla u olvidé una contraseña.** Edita el secreto `ADMIN_USERS` en GitHub
(paso 2, botón *Update*): agrega, cambia o borra su línea, y vuelve a publicar (paso 3).
Al cambiarlo, se cierran las sesiones abiertas.

**¿Varias personas pueden usar el panel?** Sí, cada una con su propio usuario. En el historial de GitHub
queda registrado quién hizo cada cambio (por ejemplo, *Panel (maria): actualiza paquete…*).

**Sale "La llave de GitHub del panel venció".** Repite el paso 1 (nueva llave), actualiza `CMS_GITHUB_TOKEN` y vuelve a publicar.

**Guardé y no veo el cambio.** Espera 2 minutos y recarga la página. Si sigue igual, revisa en
https://github.com/Tecnibrain/viajeswaira/actions que el último "Publicar en Cloudflare Pages" tenga ✅.

**Me equivoqué y borré algo.** Todo queda en el historial de GitHub y se puede recuperar. Pide ayuda al desarrollador.

**¿Cuesta algo?** No. El panel funciona dentro de Cloudflare Pages (plan gratuito).
