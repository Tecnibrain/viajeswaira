/**
 * PLANTILLA — Cloudflare Pages Function para iniciar un pago.
 * Copiar a functions/api/checkout.js cuando se active una pasarela.
 * Las claves se leen de env (Secrets de Cloudflare), NUNCA del código.
 */
import { getPaquete } from '../../src/data/paquetes.js';

export async function onRequestPost({ request, env }) {
  const { provider, packageId, travelers, customer } = await request.json();
  const pkg = getPaquete(packageId);
  const qty = Math.min(Math.max(parseInt(travelers, 10) || 1, 1), 50);
  if (!pkg || pkg.demo) return Response.json({ error: 'Paquete no disponible para pago' }, { status: 400 });

  const amount = pkg.price * qty; // el monto SIEMPRE se calcula en el servidor
  const reference = `WAIRA-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  switch (provider) {
    case 'stripe': {
      // Ejemplo con la API REST de Stripe Checkout Sessions
      const body = new URLSearchParams({
        mode: 'payment',
        success_url: 'https://viajeswaira.com/reservas?pago=ok',
        cancel_url: 'https://viajeswaira.com/reservas?pago=cancelado',
        'line_items[0][quantity]': String(qty),
        'line_items[0][price_data][currency]': 'cop',
        'line_items[0][price_data][unit_amount]': String(pkg.price * 100),
        'line_items[0][price_data][product_data][name]': pkg.title,
        customer_email: customer?.email || '',
        client_reference_id: reference,
      });
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const s = await r.json();
      return Response.json({ redirectUrl: s.url, reference });
    }
    // case 'wompi':        crear firma de integridad con env.WOMPI_INTEGRITY_SECRET y devolver URL de Web Checkout
    // case 'mercadopago':  crear preferencia con env.MP_ACCESS_TOKEN y devolver init_point
    // case 'payu':         firmar con env.PAYU_API_KEY y devolver URL/formulario de WebCheckout
    default:
      return Response.json({ error: 'Pasarela no implementada', amount, reference }, { status: 501 });
  }
}
