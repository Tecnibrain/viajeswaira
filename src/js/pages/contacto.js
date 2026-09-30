import '../main.js';
import { validate, deliver } from './forms.js';
import { SITE } from '../../config.js';

const form = document.getElementById('contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (form.website.value) return; // honeypot anti-spam
  if (!validate(form)) return;
  const f = Object.fromEntries(new FormData(form));
  const text = `Hola ${SITE.name}, les escribo desde el sitio web.\n\nNombre: ${f.nombre}\nCorreo: ${f.correo}\nAsunto: ${f.asunto || '-'}\n\n${f.mensaje}`;
  deliver({ channel: e.submitter?.dataset.channel || 'whatsapp', subject: f.asunto || 'Contacto desde viajeswaira.com', text, resultEl: document.getElementById('c-result') });
});
