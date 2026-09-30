/**
 * ============================================================
 *  CONFIGURACIÓN CENTRAL — VIAJES WAIRA
 * ============================================================
 *  - Los DATOS DE CONTACTO (WhatsApp, correo, teléfono, dirección,
 *    horarios, redes sociales, razón social, NIT, RNT) se editan desde
 *    el panel https://viajeswaira.com/admin → pestaña «Contacto»
 *    (archivo content/sitio/contacto.json).
 *  - Aquí quedan los datos fijos del sitio (nombre, dominio, colores…).
 *  - Los campos vacíos simplemente no se muestran en la web.
 *  - NUNCA pongas aquí contraseñas, API keys privadas ni tokens:
 *    este archivo se publica en internet.
 * ============================================================
 */
import contacto from '../content/sitio/contacto.json';

export const PLACEHOLDER = '';
export const WHATSAPP_PLACEHOLDER = '';

// Número de WhatsApp (solo dígitos con indicativo, ej. 573001234567). Se edita en el panel.
export const WHATSAPP_NUMBER = String(contacto.whatsapp || '').replace(/\D/g, '');

export const SITE = {
  name: 'Viajes Waira',
  legalName: contacto.legalName || '',
  nit: contacto.nit || '',
  slogan: 'Descubre el mundo con Viajes Waira',
  tagline: 'Aventura · Natural · Descubre',
  domain: 'viajeswaira.com',
  url: 'https://viajeswaira.com',
  description:
    'Viajes Waira, agencia de viajes: planes y hoteles en San Andrés, Santa Marta, La Guajira, Amazonas, Punta Cana, Cancún, Panamá y más. Aliados de On Vacation, con asesoría personalizada.',
  keywords:
    'agencia de viajes, paquetes turísticos, planes todo incluido, On Vacation, San Andrés, Santa Marta, La Guajira, Amazonas, Coveñas, Girardot, Guatapé, Medellín, Cancún, Punta Cana, Santo Domingo, Panamá, Europa, Viajes Waira',
  locale: 'es_CO',
  lang: 'es',
  currency: 'COP',

  email: contacto.email || '',
  phone: contacto.phone || '',
  address: contacto.address || '',
  city: contacto.city || '',
  country: contacto.country || '',
  hours: (contacto.hours || []).filter((h) => h.days && h.time),
  // Registro Nacional de Turismo (si aplica)
  rnt: contacto.rnt || '',

  social: {
    instagram: contacto.instagram || '',
    facebook: contacto.facebook || '',
    tiktok: contacto.tiktok || '',
  },

  // Colores de marca (se aplican en todo el sitio al hacer el build)
  colors: {
    primary: '#1b5e43', // verde Waira (logo)
    primaryDark: '#134631',
    accent: '#1a9fb0', // turquesa (logo)
    accentDark: '#147f8d',
    sand: '#c8b28c', // arena (logo)
    dark: '#123a2c',
    light: '#f7f3ee', // crema (fondo del logo)
  },

  // Mensaje por defecto al abrir WhatsApp
  whatsappDefaultMessage: 'Hola Viajes Waira, quiero información para planear un viaje.',
};

// Pagos: deja 'none' hasta integrar una pasarela real.
// Opciones preparadas: 'none' | 'wompi' | 'mercadopago' | 'payu' | 'stripe'
export const PAYMENTS = {
  provider: 'none',
  // Solo claves PÚBLICAS van en el frontend. Las privadas, en variables
  // de entorno de Cloudflare (Pages Functions), NUNCA en este archivo.
  publicKey: '',
  // Endpoint serverless (Cloudflare Pages Functions) que creará la
  // transacción de forma segura. Ver src/payments/README.md
  checkoutEndpoint: '/api/checkout',
};

export const isConfigured = (value) => Boolean(value && String(value).trim()) && !/POR CONFIGURAR/.test(value);
