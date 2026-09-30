/**
 * ============================================================
 *  CONFIGURACIÓN CENTRAL — VIAJES WAIRA
 * ============================================================
 *  Este es el ÚNICO archivo que necesitas editar para cambiar
 *  los datos del negocio. Todo el sitio lee de aquí.
 *
 *  - Los valores "[POR CONFIGURAR]" se muestran tal cual en la
 *    web hasta que los reemplaces.
 *  - WHATSAPP_NUMBER: solo dígitos, con indicativo de país y sin
 *    "+", espacios ni guiones. Ejemplo Colombia: '573001234567'.
 *  - NUNCA pongas aquí contraseñas, API keys privadas ni tokens:
 *    este archivo se publica en internet.
 * ============================================================
 */

export const PLACEHOLDER = '[POR CONFIGURAR]';
export const WHATSAPP_PLACEHOLDER = '[WHATSAPP POR CONFIGURAR]';

// Número de WhatsApp: ÚNICO lugar donde se define.
export const WHATSAPP_NUMBER = WHATSAPP_PLACEHOLDER;

export const SITE = {
  name: 'Viajes Waira',
  legalName: PLACEHOLDER,
  slogan: 'Descubre el mundo con Viajes Waira',
  domain: 'viajeswaira.com',
  url: 'https://viajeswaira.com',
  description:
    'Viajes Waira, agencia de viajes: paquetes turísticos, destinos nacionales e internacionales, planes a la medida y asesoría personalizada para tus vacaciones.',
  keywords:
    'agencia de viajes, paquetes turísticos, viajes, vacaciones, Cartagena, San Andrés, Santa Marta, Medellín, Cancún, Punta Cana, Madrid, París, Viajes Waira',
  locale: 'es_CO',
  lang: 'es',
  currency: 'COP',

  email: PLACEHOLDER,
  phone: PLACEHOLDER,
  address: PLACEHOLDER,
  city: PLACEHOLDER,
  country: PLACEHOLDER,
  hours: [
    { days: 'Lunes a viernes', time: PLACEHOLDER },
    { days: 'Sábados', time: PLACEHOLDER },
    { days: 'Domingos y festivos', time: PLACEHOLDER },
  ],
  // Registro Nacional de Turismo u otro registro legal (si aplica)
  rnt: PLACEHOLDER,

  social: {
    instagram: PLACEHOLDER, // ej: 'https://instagram.com/viajeswaira'
    facebook: PLACEHOLDER, // ej: 'https://facebook.com/viajeswaira'
    tiktok: PLACEHOLDER, // ej: 'https://tiktok.com/@viajeswaira'
  },

  // Colores de marca (se aplican en todo el sitio al hacer el build)
  colors: {
    primary: '#0e7c86', // turquesa
    primaryDark: '#0a5c64',
    accent: '#f28c28', // atardecer
    accentDark: '#d4700f',
    dark: '#10252b',
    light: '#f6f9f9',
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

export const isConfigured = (value) =>
  Boolean(value) && value !== PLACEHOLDER && value !== WHATSAPP_PLACEHOLDER;
