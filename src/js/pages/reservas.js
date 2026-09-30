import '../main.js';
import { destinos, getDestino } from '../../data/destinos.js';
import { paquetes, getPaquete } from '../../data/paquetes.js';
import { validate, deliver } from './forms.js';
import { esc, formatPrice } from '../ui.js';
import { SITE } from '../../config.js';
import { paymentsEnabled, startCheckout } from '../../payments/index.js';

const form = document.getElementById('booking-form');
const selDest = document.getElementById('r-destino');
const selPkg = document.getElementById('r-paquete');
const estimate = document.getElementById('r-estimate');
const params = new URLSearchParams(location.search);

selDest.innerHTML = '<option value="">Selecciona un destino</option>' +
  destinos.map((d) => `<option value="${d.id}">${esc(d.name)} (${esc(d.country)})</option>`).join('') +
  '<option value="otro">Otro destino / a la medida</option>';

function fillPackages(destId, selected) {
  const list = paquetes.filter((p) => !destId || destId === 'otro' || p.destinationId === destId);
  selPkg.innerHTML = '<option value="">Sin paquete / a la medida</option>' +
    list.map((p) => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.title)}${p.duration ? ` · ${esc(p.duration)}` : ''}</option>`).join('');
}

function updateEstimate() {
  const p = getPaquete(selPkg.value);
  const n = Number(form.viajeros.value) || 0;
  if (p && p.price > 0 && n > 0) {
    estimate.hidden = false;
    estimate.textContent = `Valor de referencia: ${formatPrice(p.price)} x ${n} viajero(s) = ${formatPrice(p.price * n)}. El precio real se confirma con tu asesor.`;
  } else estimate.hidden = true;
}

// Preselección desde /reservas?paquete=... o ?destino=...
const pre = getPaquete(params.get('paquete'));
const preDest = pre ? pre.destinationId : getDestino(params.get('destino'))?.id || '';
selDest.value = preDest;
fillPackages(preDest, pre?.id);

selDest.addEventListener('change', () => { fillPackages(selDest.value); updateEstimate(); });
selPkg.addEventListener('change', () => {
  const p = getPaquete(selPkg.value);
  if (p) selDest.value = p.destinationId;
  updateEstimate();
});
form.viajeros.addEventListener('input', updateEstimate);
updateEstimate();

// Fecha mínima: mañana
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
form.fecha.min = tomorrow;
form.fecha.dataset.minDate = tomorrow;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (form.website.value) return; // honeypot anti-spam
  if (!validate(form)) return;
  const f = Object.fromEntries(new FormData(form));
  const d = getDestino(f.destino);
  const p = getPaquete(f.paquete);
  const text = [
    `Hola ${SITE.name}, quiero solicitar una reserva:`,
    '',
    `Nombre: ${f.nombre} ${f.apellido}`,
    `Correo: ${f.correo}`,
    `Teléfono: ${f.telefono}`,
    `Viajeros: ${f.viajeros}`,
    `Destino: ${d ? `${d.name} (${d.country})` : 'Otro / a la medida'}`,
    `Paquete: ${p ? `${p.title}${p.duration ? ` (${p.duration})` : ''}` : 'A la medida'}`,
    `Fecha estimada: ${f.fecha}`,
    `Comentarios: ${f.comentarios || '-'}`,
  ].join('\n');
  deliver({
    channel: e.submitter?.dataset.channel || 'whatsapp',
    subject: `Solicitud de reserva - ${f.nombre} ${f.apellido}`,
    text,
    resultEl: document.getElementById('r-result'),
  });
});

// Pagos en línea: se activa al configurar PAYMENTS en src/config.js
const payBtn = document.getElementById('pay-btn');
if (paymentsEnabled()) {
  payBtn.disabled = false;
  payBtn.textContent = 'Pagar en línea';
  payBtn.addEventListener('click', async () => {
    if (!validate(form)) return;
    const p = getPaquete(selPkg.value);
    if (!p) return alert('Selecciona un paquete para pagar en línea.');
    await startCheckout({ packageId: p.id, travelers: Number(form.viajeros.value), customer: { name: `${form.nombre.value} ${form.apellido.value}`, email: form.correo.value, phone: form.telefono.value } });
  });
}
