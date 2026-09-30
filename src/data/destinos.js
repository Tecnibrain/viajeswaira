/**
 * CATÁLOGO DE DESTINOS — DATOS DEMO
 * ------------------------------------------------------------
 * Todos los precios y duraciones son de DEMOSTRACIÓN y NO
 * corresponden a tarifas reales de Viajes Waira.
 * Para publicar datos reales: edita cada objeto y pon demo: false.
 *
 * image: ruta dentro de /public. Reemplaza las ilustraciones .svg por
 * fotos reales (.webp 1200x800 recomendado) cuando las tengas.
 */
export const destinos = [
  {
    id: 'cartagena',
    name: 'Cartagena',
    city: 'Cartagena de Indias',
    country: 'Colombia',
    region: 'nacional',
    image: '/img/cartagena.svg',
    gallery: ['/img/cartagena.svg', '/img/cartagena-2.svg', '/img/cartagena-3.svg'],
    description:
      'Ciudad amurallada, calles coloniales llenas de color, atardeceres frente al mar Caribe y excursiones a las Islas del Rosario.',
    highlights: ['Ciudad amurallada', 'Islas del Rosario', 'Barrio Getsemaní', 'Castillo de San Felipe'],
    priceFrom: 1200000,
    duration: '4 días / 3 noches',
    demo: true,
  },
  {
    id: 'san-andres',
    name: 'San Andrés',
    city: 'San Andrés',
    country: 'Colombia',
    region: 'nacional',
    image: '/img/san-andres.svg',
    gallery: ['/img/san-andres.svg', '/img/san-andres-2.svg', '/img/san-andres-3.svg'],
    description:
      'El mar de los siete colores: playas de arena blanca, snorkel, Johnny Cay y el ambiente relajado del Caribe insular.',
    highlights: ['Johnny Cay', 'Acuario y Haynes Cay', 'Hoyo Soplador', 'Vuelta a la isla'],
    priceFrom: 1500000,
    duration: '5 días / 4 noches',
    demo: true,
  },
  {
    id: 'santa-marta',
    name: 'Santa Marta',
    city: 'Santa Marta',
    country: 'Colombia',
    region: 'nacional',
    image: '/img/santa-marta.svg',
    gallery: ['/img/santa-marta.svg', '/img/santa-marta-2.svg', '/img/santa-marta-3.svg'],
    description:
      'Donde la Sierra Nevada se encuentra con el mar: Parque Tayrona, Minca, Taganga y playas vírgenes.',
    highlights: ['Parque Tayrona', 'Minca', 'Taganga', 'Rodadero'],
    priceFrom: 1100000,
    duration: '4 días / 3 noches',
    demo: true,
  },
  {
    id: 'medellin',
    name: 'Medellín',
    city: 'Medellín',
    country: 'Colombia',
    region: 'nacional',
    image: '/img/medellin.svg',
    gallery: ['/img/medellin.svg', '/img/medellin-2.svg', '/img/medellin-3.svg'],
    description:
      'La ciudad de la eterna primavera: innovación, metrocable, Comuna 13, gastronomía y escapadas a Guatapé.',
    highlights: ['Comuna 13', 'Metrocable', 'Guatapé y El Peñol', 'Pueblito Paisa'],
    priceFrom: 950000,
    duration: '4 días / 3 noches',
    demo: true,
  },
  {
    id: 'cancun',
    name: 'Cancún',
    city: 'Cancún',
    country: 'México',
    region: 'internacional',
    image: '/img/cancun.svg',
    gallery: ['/img/cancun.svg', '/img/cancun-2.svg', '/img/cancun-3.svg'],
    description:
      'Playas turquesa del Caribe mexicano, cenotes, zonas arqueológicas mayas y resorts todo incluido.',
    highlights: ['Zona hotelera', 'Isla Mujeres', 'Cenotes', 'Chichén Itzá'],
    priceFrom: 3900000,
    duration: '6 días / 5 noches',
    demo: true,
  },
  {
    id: 'punta-cana',
    name: 'Punta Cana',
    city: 'Punta Cana',
    country: 'República Dominicana',
    region: 'internacional',
    image: '/img/punta-cana.svg',
    gallery: ['/img/punta-cana.svg', '/img/punta-cana-2.svg', '/img/punta-cana-3.svg'],
    description:
      'Palmeras, arena blanca y aguas cálidas. Ideal para lunas de miel y descanso en plan todo incluido.',
    highlights: ['Playa Bávaro', 'Isla Saona', 'Hoyo Azul', 'Resorts todo incluido'],
    priceFrom: 4200000,
    duration: '6 días / 5 noches',
    demo: true,
  },
  {
    id: 'madrid',
    name: 'Madrid',
    city: 'Madrid',
    country: 'España',
    region: 'internacional',
    image: '/img/madrid.svg',
    gallery: ['/img/madrid.svg', '/img/madrid-2.svg', '/img/madrid-3.svg'],
    description:
      'Arte, historia y tapas: Museo del Prado, Palacio Real, Parque del Retiro y la vida nocturna madrileña.',
    highlights: ['Museo del Prado', 'Palacio Real', 'Parque del Retiro', 'Excursión a Toledo'],
    priceFrom: 6500000,
    duration: '8 días / 7 noches',
    demo: true,
  },
  {
    id: 'paris',
    name: 'París',
    city: 'París',
    country: 'Francia',
    region: 'internacional',
    image: '/img/paris.svg',
    gallery: ['/img/paris.svg', '/img/paris-2.svg', '/img/paris-3.svg'],
    description:
      'La Ciudad Luz: Torre Eiffel, Louvre, paseos por el Sena, Montmartre y la mejor pastelería del mundo.',
    highlights: ['Torre Eiffel', 'Museo del Louvre', 'Crucero por el Sena', 'Montmartre'],
    priceFrom: 7200000,
    duration: '8 días / 7 noches',
    demo: true,
  },
];

export const getDestino = (id) => destinos.find((d) => d.id === id);
