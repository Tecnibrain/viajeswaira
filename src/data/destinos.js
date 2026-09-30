/**
 * CATÁLOGO DE DESTINOS
 * ------------------------------------------------------------
 * Los destinos se editan desde el panel https://viajeswaira.com/admin
 * (o directamente en los archivos content/destinos/*.json).
 * Los datos marcados como demo: true se muestran con la etiqueta DEMO.
 */
import { toDestinos } from './normalize.js';

const files = import.meta.glob('/content/destinos/*.json', { eager: true, import: 'default' });

export const destinos = toDestinos(files);
export const getDestino = (id) => destinos.find((d) => d.id === id);
