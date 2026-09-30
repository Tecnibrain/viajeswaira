# Pagos en línea (preparado, no activo)

El sitio **no cobra nada todavía**. El botón "Pagar en línea" de `/reservas` está
deshabilitado mientras `PAYMENTS.provider` sea `'none'` en `src/config.js`.

## Cómo activar una pasarela más adelante

1. Crea tu cuenta de comercio en la pasarela (Wompi, Mercado Pago, PayU o Stripe)
   y obtén las llaves de **pruebas (sandbox)** primero.
2. Crea la carpeta `functions/api/` en la raíz del proyecto y copia
   `docs/checkout.example.js` como `functions/api/checkout.js`
   (Cloudflare Pages Functions: plan Free incluye 100.000 solicitudes/día).
3. En Cloudflare → tu proyecto Pages → **Settings → Variables and Secrets**,
   agrega la llave PRIVADA como **Secret** (ej. `WOMPI_PRIVATE_KEY`,
   `MP_ACCESS_TOKEN`, `PAYU_API_KEY`, `STRIPE_SECRET_KEY`).
   **Nunca** la pongas en `src/config.js` ni en el repositorio.
4. En `src/config.js` cambia `PAYMENTS.provider` (y `publicKey` si la pasarela
   usa una llave pública).
5. Crea también un webhook (`functions/api/webhook.js`) para confirmar pagos
   con la firma que envía la pasarela.

| Pasarela     | Checkout alojado               | Llave secreta (variable de entorno) |
|--------------|--------------------------------|-------------------------------------|
| Wompi        | Web Checkout / Widget          | `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET` |
| Mercado Pago | Checkout Pro (preferencias)    | `MP_ACCESS_TOKEN`                   |
| PayU         | WebCheckout (firma MD5/SHA)    | `PAYU_API_KEY`, `PAYU_MERCHANT_ID`  |
| Stripe       | Checkout Sessions              | `STRIPE_SECRET_KEY`                 |
