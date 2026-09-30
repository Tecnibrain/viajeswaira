/**
 * Adaptador Mercado Pago (plantilla, sin claves).
 * La sesión de pago la crea el servidor (Cloudflare Pages Function) y
 * devuelve { redirectUrl }. Aquí solo se redirige al checkout alojado.
 */
export default {
  name: 'Mercado Pago',
  redirect(session) {
    if (!session?.redirectUrl) throw new Error('Mercado Pago: respuesta sin redirectUrl');
    window.location.assign(session.redirectUrl);
  },
};
