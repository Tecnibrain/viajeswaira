import { WHATSAPP_NUMBER, SITE, isConfigured } from '../config.js';

/** true cuando WHATSAPP_NUMBER (src/config.js) tiene un número válido */
export const whatsappReady = () => isConfigured(WHATSAPP_NUMBER) && /^\d{8,15}$/.test(WHATSAPP_NUMBER);

export const whatsappUrl = (message = SITE.whatsappDefaultMessage) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const whatsappDisplay = () => (whatsappReady() ? `+${WHATSAPP_NUMBER}` : WHATSAPP_NUMBER);
