import { WHATSAPP_NUMBER, SITE, isConfigured } from '../config.js';

/** true cuando WHATSAPP_NUMBER (src/config.js) tiene un número válido */
export const whatsappReady = () => isConfigured(WHATSAPP_NUMBER) && /^\d{8,15}$/.test(WHATSAPP_NUMBER);

export const whatsappUrl = (message = SITE.whatsappDefaultMessage) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

/** Formato legible: +57 311 754 4635 (Colombia) o +<número> para otros países */
export const whatsappDisplay = () => {
  if (!whatsappReady()) return WHATSAPP_NUMBER;
  const m = WHATSAPP_NUMBER.match(/^57(\d{3})(\d{3})(\d{4})$/);
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : `+${WHATSAPP_NUMBER}`;
};
