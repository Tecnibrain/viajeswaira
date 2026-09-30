import { SITE, isConfigured } from '../../config.js';
import { whatsappReady, whatsappUrl } from '../whatsapp.js';
import { esc, toast } from '../ui.js';

/** Validación accesible usando la API nativa del navegador */
export function validate(form) {
  let firstInvalid = null;
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    if (el.classList.contains('hp') || !el.willValidate) return;
    const err = el.closest('div')?.querySelector('.field-error');
    let msg = '';
    if (el.validity.valueMissing) msg = el.type === 'checkbox' ? 'Debes aceptar la política para continuar.' : 'Este campo es obligatorio.';
    else if (el.validity.typeMismatch) msg = 'Revisa el formato.';
    else if (el.validity.rangeUnderflow || el.validity.rangeOverflow) msg = `Ingresa un valor entre ${el.min} y ${el.max}.`;
    else if (el.dataset.minDate && el.value && el.value < el.dataset.minDate) msg = 'La fecha debe ser futura.';
    else if (el.type === 'tel' && el.value && el.value.replace(/\D/g, '').length < 7) msg = 'Ingresa un teléfono válido.';
    el.setAttribute('aria-invalid', String(Boolean(msg)));
    if (err) err.textContent = msg;
    if (msg && !firstInvalid) firstInvalid = el;
  });
  firstInvalid?.focus();
  return !firstInvalid;
}

/**
 * Envía el mensaje por WhatsApp o correo (mailto). Si el canal aún no está
 * configurado en src/config.js, muestra el resumen para copiarlo.
 */
export function deliver({ channel, subject, text, resultEl }) {
  if (channel === 'whatsapp' && whatsappReady()) {
    window.open(whatsappUrl(text), '_blank', 'noopener');
    resultEl.innerHTML = '<p class="notice">Abrimos WhatsApp con tu solicitud. Solo presiona “Enviar” en WhatsApp.</p>';
    return;
  }
  if (channel === 'email' && isConfigured(SITE.email)) {
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    resultEl.innerHTML = '<p class="notice">Abrimos tu aplicación de correo con la solicitud lista para enviar.</p>';
    return;
  }
  toast(channel === 'whatsapp' ? 'WhatsApp aún no está configurado.' : 'El correo aún no está configurado.');
  resultEl.innerHTML = `
    <p class="notice" style="margin-top:16px">El canal de ${channel === 'whatsapp' ? 'WhatsApp' : 'correo'} aún no está configurado. Copia este resumen y envíalo por el medio que prefieras:</p>
    <div class="summary-box">${esc(text)}</div>
    <p style="margin-top:10px"><button type="button" class="btn btn-outline btn-sm" data-copy>Copiar resumen</button></p>`;
  resultEl.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Resumen copiado.');
    } catch {
      toast('No se pudo copiar automáticamente. Selecciona el texto y cópialo.');
    }
  });
}
