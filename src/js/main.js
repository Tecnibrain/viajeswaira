import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fontsource-variable/fraunces/wght.css';
import '../css/styles.css';
import { SITE, isConfigured } from '../config.js';
import { whatsappReady, whatsappUrl, whatsappDisplay } from './whatsapp.js';
import { esc, toast } from './ui.js';
import './cookies.js';

// Menú móvil
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
  nav.classList.toggle('open', !open);
  document.body.classList.toggle('nav-open', !open);
});

// Enlace activo
const here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
nav?.querySelectorAll('a').forEach((a) => {
  const href = a.getAttribute('href');
  const match = href === here || (href !== '/' && here.startsWith(href)) ||
    (here === '/destino' && href === '/destinos') || (here === '/paquete' && href === '/paquetes');
  if (match && !a.classList.contains('btn')) a.setAttribute('aria-current', 'page');
});

// Sombra del header al hacer scroll
const header = document.querySelector('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Datos de contacto (se editan en el panel /admin → Contacto). Lo vacío se oculta.
const cfgValue = (key) => {
  if (key === 'whatsapp') return whatsappReady() ? whatsappDisplay() : '';
  if (key === 'address') return [SITE.address, SITE.city].filter(isConfigured).join(', ');
  return SITE[key];
};
document.querySelectorAll('[data-cfg]').forEach((el) => {
  const key = el.dataset.cfg;
  const value = cfgValue(key);
  if (!isConfigured(value)) return (el.closest('li, p, [data-cfg-wrap]') || el).remove();
  if (key === 'email') el.innerHTML = `<a href="mailto:${esc(value)}">${esc(value)}</a>`;
  else if (key === 'phone') el.innerHTML = `<a href="tel:${esc(value.replace(/[^\d+]/g, ''))}">${esc(value)}</a>`;
  else if (key === 'whatsapp') el.innerHTML = `<a href="#" data-wa>${esc(value)}</a>`;
  else el.textContent = (el.dataset.prefix || '') + value;
});
document.querySelectorAll('[data-cfg-hours]').forEach((el) => {
  if (!SITE.hours.length) return (el.closest('li, [data-cfg-wrap]') || el).remove();
  el.innerHTML = SITE.hours.map((h) => `<li>${esc(h.days)}: ${esc(h.time)}</li>`).join('');
});
document.querySelectorAll('[data-legal]').forEach((el) => {
  const parts = [
    SITE.legalName && esc(SITE.legalName),
    SITE.nit && `NIT ${esc(SITE.nit)}`,
    SITE.rnt && `Registro Nacional de Turismo (RNT) ${esc(SITE.rnt)}`,
  ].filter(Boolean);
  if (!parts.length) return el.remove();
  el.innerHTML = parts.join(' · ');
});
const SOCIAL_ICONS = {
  instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2Zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6Zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z"/>',
  facebook: '<path d="M14 8V6.1c0-.9.2-1.3 1.6-1.3H18V1h-3.4C11 1 10 2.7 10 5.7V8H7.5v3.8H10V23h4V11.8h3.3L17.8 8Z"/>',
  tiktok: '<path d="M16.6 2h-3.4v13.5a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.3a6.4 6.4 0 1 0 5.4 6.3V8.8a7.6 7.6 0 0 0 4.4 1.4V6.8A4.4 4.4 0 0 1 16.6 2Z"/>',
};
document.querySelectorAll('[data-social]').forEach((el) => {
  const links = Object.entries(SITE.social).filter(([, url]) => /^https?:\/\//.test(url || ''));
  if (!links.length) return el.remove();
  el.innerHTML = links
    .map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${name}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">${SOCIAL_ICONS[name]}</svg></a>`)
    .join('');
});

// WhatsApp: cualquier elemento con [data-wa] (mensaje opcional en data-wa-msg)
function wireWhatsApp(root = document) {
  root.querySelectorAll('[data-wa]').forEach((el) => {
    if (whatsappReady()) {
      el.href = whatsappUrl(el.dataset.waMsg || SITE.whatsappDefaultMessage);
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-wa]');
  if (el && !whatsappReady()) {
    e.preventDefault();
    toast('WhatsApp aún no está configurado. Mientras tanto, usa el formulario de reservas o contacto.');
  }
});
wireWhatsApp();
window.addEventListener('waira:rendered', () => wireWhatsApp());

// FAQ / acordeones: solo uno abierto a la vez
document.querySelectorAll('.faq details').forEach((d) =>
  d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll('.faq details').forEach((o) => o !== d && (o.open = false));
  }),
);
