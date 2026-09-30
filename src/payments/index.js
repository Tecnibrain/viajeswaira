/**
 * ARQUITECTURA DE PAGOS (preparada, NO activa)
 * ------------------------------------------------------------
 * Flujo seguro recomendado para cualquier pasarela:
 *   1. El navegador llama a PAYMENTS.checkoutEndpoint (una Cloudflare
 *      Pages Function, gratuita) con { packageId, travelers, customer }.
 *   2. La Function (servidor) recalcula el precio desde el catálogo,
 *      usa la CLAVE PRIVADA guardada como variable de entorno secreta
 *      en Cloudflare y crea la transacción / firma de integridad.
 *   3. La Function devuelve { redirectUrl } o los datos públicos del
 *      widget y el navegador redirige al checkout de la pasarela.
 *   4. La pasarela notifica el resultado a un webhook (otra Function).
 *
 * Nunca se calcula el monto final ni se firma en el navegador.
 * Ver src/payments/README.md
 */
import { PAYMENTS } from '../config.js';
import wompi from './providers/wompi.js';
import mercadopago from './providers/mercadopago.js';
import payu from './providers/payu.js';
import stripe from './providers/stripe.js';

const PROVIDERS = { wompi, mercadopago, payu, stripe };

export const paymentsEnabled = () => PAYMENTS.provider !== 'none' && Boolean(PROVIDERS[PAYMENTS.provider]);

/** @param {{packageId:string, travelers:number, customer:{name:string,email:string,phone:string}}} order */
export async function startCheckout(order) {
  const provider = PROVIDERS[PAYMENTS.provider];
  if (!provider) throw new Error('Pasarela de pago no configurada');
  const res = await fetch(PAYMENTS.checkoutEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: PAYMENTS.provider, ...order }),
  });
  if (!res.ok) throw new Error('No fue posible iniciar el pago');
  const session = await res.json();
  return provider.redirect(session);
}
