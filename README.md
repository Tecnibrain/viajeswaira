# Viajes Waira — sitio web

Sitio web oficial de **Viajes Waira** (https://viajeswaira.com).
Es un sitio 100 % estático (HTML5 + CSS3 + JavaScript, compilado con Vite) pensado para
publicarse **gratis** en **Cloudflare Pages (plan Free)**. No necesita servidor, base de datos
ni hosting de pago.

> 📘 **Guía para publicarlo paso a paso (Cloudflare + Namecheap):** [GUIA_PUBLICACION.md](GUIA_PUBLICACION.md)
>
> 🧳 **Subir paquetes y destinos sin código (panel https://viajeswaira.com/admin):** [COMO_SUBIR_PAQUETES.md](COMO_SUBIR_PAQUETES.md)

## Páginas

| Ruta | Contenido |
|------|-----------|
| `/` | Home: hero, destinos y paquetes destacados, experiencias, beneficios, testimonios DEMO, FAQ, contacto |
| `/destinos` | Catálogo de destinos con buscador y filtro nacional/internacional |
| `/destino?id=cartagena` | Detalle de destino |
| `/paquetes` | Catálogo de paquetes con filtro por categoría |
| `/paquete?id=paris-ciudad-luz` | Detalle de paquete: incluye, no incluye, itinerario, galería, reservar, WhatsApp |
| `/nosotros` | Historia, misión, visión, valores |
| `/contacto` | Datos de contacto y formulario (WhatsApp / correo) |
| `/reservas` | Formulario de reserva (WhatsApp / correo). Botón de pago preparado, desactivado |

## Dónde cambiar cada cosa

| Qué quieres cambiar | Archivo |
|---|---|
| Nombre, dominio, **WhatsApp**, correo, teléfono, dirección, horarios, Instagram, Facebook, TikTok, **colores** | `src/config.js` |
| Destinos (texto, precio, imágenes) | Panel **/admin** → Destinos (archivos `content/destinos/*.json`) |
| Paquetes (precio, incluye, itinerario…) | Panel **/admin** → Paquetes (archivos `content/paquetes/*.json`) |
| Campos del panel de administración | `public/admin/config.yml` |
| Textos de Home / Nosotros / FAQ | `index.html`, `nosotros.html` |
| Menú y pie de página | `partials/header.html`, `partials/footer.html` |
| Estilos | `src/css/styles.css` |
| Imágenes | `public/img/` |
| Pasarela de pagos (futuro) | `src/payments/` + `src/payments/README.md` |

### Configurar WhatsApp
En `src/config.js`:
```js
export const WHATSAPP_NUMBER = '573001234567'; // indicativo + número, solo dígitos
```
Mientras siga en `'[WHATSAPP POR CONFIGURAR]'`, los botones de WhatsApp muestran un aviso
y los formularios muestran un resumen para copiar.

### Datos DEMO
Todos los precios, paquetes, itinerarios y testimonios son **de demostración** y se muestran con
la etiqueta **DEMO**. Para publicar datos reales, edítalos en el panel **/admin** y apaga "Es información de ejemplo (DEMO)".
Cuando ya no haya datos DEMO, elimina la barra superior (`.demo-bar`) en `partials/header.html`.

### Reemplazar las ilustraciones por fotos reales
Las imágenes actuales son ilustraciones SVG propias y livianas (sin derechos de terceros).
Para usar fotos:
1. Exporta cada foto en **.webp**, 1200×800 px, < 200 KB (p. ej. con https://squoosh.app, gratis).
2. Guárdala en `public/img/` (ej. `public/img/cartagena.webp`).
3. O, más fácil, súbelas desde el panel **/admin** (se optimizan solas).
4. Usa solo fotos propias o con licencia que permita uso comercial.

## Desarrollo local

Requisitos: Node.js 20 o superior.

```bash
npm install        # instala dependencias
npm run dev        # servidor local en http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # prueba el build en http://localhost:4173
```

## Qué incluye

- **SEO**: `title`, `meta description`, `canonical`, Open Graph, Twitter Card, `sitemap.xml`
  (se genera automáticamente en el build), `robots.txt`, Schema.org (`TravelAgency`, `FAQPage`,
  `TouristDestination`, `TouristTrip`), favicon, manifest.
- **Rendimiento**: sin frameworks pesados (~5 KB JS gzip por página), imágenes SVG livianas con
  `loading="lazy"` y dimensiones fijas (sin saltos de diseño), fuentes auto-alojadas con subconjuntos,
  CSS minificado, caché larga para `/assets/*` (`public/_headers`).
- **Seguridad**: cabeceras HTTP (CSP, HSTS, X-Frame-Options…) en `public/_headers`. Sin claves,
  contraseñas ni tokens en el código. Formularios con honeypot anti-spam. Los datos del formulario no
  se guardan en ningún servidor.
- **Responsive**: probado en 390 px (iPhone/Android), tablet y escritorio.

## Mantenimiento

- Cada `git push` a la rama principal publica automáticamente en Cloudflare Pages (1–2 min).
- Cada rama o Pull Request obtiene una URL de vista previa gratuita (`*.pages.dev`).
- Si algo sale mal: Cloudflare → Workers & Pages → proyecto → **Deployments** → en un despliegue
  anterior, **⋯ → Rollback**.
- Plan Free de Cloudflare Pages: 500 builds/mes, sitios ilimitados, ancho de banda ilimitado.
- Regenerar ilustraciones: `npm run images`. Logos e iconos: `python3 scripts/process-logos.py` (desde `brand/`). Imagen para redes: `node scripts/generate-og.mjs`.
- Renueva el dominio en Namecheap cada año (es lo único que se paga).
