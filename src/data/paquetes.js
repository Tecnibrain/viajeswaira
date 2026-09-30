/**
 * CATÁLOGO DE PAQUETES
 * ------------------------------------------------------------
 * Los paquetes se editan desde el panel https://viajeswaira.com/admin
 * (o directamente en los archivos content/paquetes/*.json).
 * price: precio por persona en SITE.currency (ver src/config.js).
 */
import { toPaquetes } from './normalize.js';

const files = import.meta.glob('/content/paquetes/*.json', { eager: true, import: 'default' });

export const paquetes = toPaquetes(files);
export const getPaquete = (id) => paquetes.find((p) => p.id === id);
export const paquetesPorDestino = (destId) => paquetes.filter((p) => p.destinationId === destId);
