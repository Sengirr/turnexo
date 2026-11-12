import { Cleaner, Property, Reservation, CleaningTask, DEFAULT_IVI_CHECKLIST } from './icalParser';

export const INITIAL_CLEANERS: Cleaner[] = [
  {
    id: 'cl-1',
    name: 'María Carmen',
    phone: '+34 611 22 33 44',
    magicToken: 'maria-7f9a',
  },
  {
    id: 'cl-2',
    name: 'Laura Gómez',
    phone: '+34 699 88 77 66',
    magicToken: 'laura-3c2b',
  },
  {
    id: 'cl-3',
    name: 'Ana Belén',
    phone: '+34 655 44 33 22',
    magicToken: 'ana-9d1e',
  },
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Ático Vista Marina · Playa',
    slug: 'atico-vista-marina',
    address: 'Paseo Marítimo 42, 4ºA, 29602 Marbella',
    hostWhatsapp: '+34600112233',
    googleMapsUrl: 'https://maps.google.com/?q=Paseo+Maritimo+42+Marbella',
    airbnbIcalUrl: 'https://www.airbnb.es/calendar/ical/10293847.ics?s=a8f9d0e1',
    bookingIcalUrl: 'https://ical.booking.com/v1/export?t=99887766-abcd',
    defaultCleanerId: 'cl-1',
    cleaningFee: 45,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    lateCheckoutPrice: 35,
    lateCheckoutUntil: '17:00',
    wifiSsid: 'VistaMarina_5G',
    wifiPassword: 'PlayaSol2026!',
    doorCode: '4829#',
    intercomCode: '4ºA + Campana',
    checkInInstructions:
      'En el portal marca el 4ºA y pulsa la campana. Sube a la 4ª planta y en la cajetilla / cerradura junto a la puerta introduce el código para recoger las llaves.',
    checkOutInstructions:
      'Antes de las 11:00h, deja las llaves encima de la mesa del comedor, comprueba que el aire acondicionado y las luces están apagados y cierra la puerta dando un portazo suave.',
    departureChecklist: [
      'Apagar las luces',
      'Apagar AC',
      'Dejar las llaves encima de la mesa',
      'Tirar la basura',
    ],
    requireVideoToUnlockCodes: true,
    videos: [
      {
        id: 'vid-1',
        title: 'Acceso Vivienda · Cómo abrir el cajetín de llaves',
        category: 'checkin',
        url: 'https://www.youtube.com/watch?v=QfDf3DJVdMw',
      },
      {
        id: 'vid-1b',
        title: 'Acceso Parking Subterráneo (Planta -1)',
        category: 'checkin',
        url: 'https://www.youtube.com/watch?v=QfDf3DJVdMw',
      },
      {
        id: 'vid-2',
        title: 'Home Tour completo por el Ático y la Terraza',
        category: 'hometour',
        url: 'https://www.youtube.com/watch?v=M0PNnOe0do8',
      },
      {
        id: 'vid-3',
        title: 'Vitrocerámica: Encendido y Bloqueo infantil',
        category: 'appliance',
        url: 'https://www.youtube.com/watch?v=lVo8BU0aP6Q',
      },
      {
        id: 'vid-4',
        title: 'Aire Acondicionado: Mando a distancia y modos',
        category: 'appliance',
        url: 'https://www.youtube.com/watch?v=IsEaaEf6ALs',
      },
      {
        id: 'vid-5',
        title: 'Cafetera Nespresso: Uso y cápsulas',
        category: 'appliance',
        url: 'https://www.youtube.com/watch?v=1pwnhLu4G8s',
      },
    ],
    extras: [
      {
        id: 'ext-late',
        title: 'Late Check-out hasta las 17:00h',
        description: 'Disfruta del apartamento y la playa hasta por la tarde sin prisas.',
        price: 35,
        priceUnit: 'reserva',
        icon: 'clock',
        onlyWhenFreeNextDay: true,
        active: true,
      },
      {
        id: 'ext-parking',
        title: 'Plaza de Parking Privada en el edificio',
        description: 'Acceso con mando directo al ascensor de la planta 4.',
        price: 15,
        priceUnit: 'día',
        icon: 'car',
        onlyWhenFreeNextDay: false,
        active: true,
      },
      {
        id: 'ext-cuna',
        title: 'Cuna de viaje + Trona de bebé',
        description: 'Instalada con ropa de cama limpia antes de tu llegada.',
        price: 20,
        priceUnit: 'reserva',
        icon: 'baby',
        onlyWhenFreeNextDay: false,
        active: true,
      },
      {
        id: 'ext-pack',
        title: 'Pack Bienvenida / Cava Frío y Fruta',
        description: 'Botella de Cava Brut Nature en cubitera + cesta de fruta local.',
        price: 28,
        priceUnit: 'reserva',
        icon: 'sparkles',
        onlyWhenFreeNextDay: false,
        active: true,
      },
    ],
    houseRules: [
      'No fumar en el interior (permitido únicamente en la terraza exterior)',
      'Horas de descanso y silencio de 23:00 a 08:00',
      'Prohibidas fiestas, eventos o alojar a más personas de las reservadas',
      'Antes de salir, por favor deposita la basura en los contenedores frente al portal',
    ],
    appliancesGuide:
      'Aire acondicionado: mando blanco en la pared del salón (22ºC recomendado). Vitrocerámica: mantén pulsado el icono del candado 3 segundos para desbloquear. Lavadora: programa rápido diario de 30 min en la ruleta derecha.',
    localRecommendations: [
      'Chiringuito El Ancla (a 150m): el mejor espeto de sardinas y arroz caldoso.',
      'Supermercado Mercadona en Av. Ricardo Soriano 18 (abierto de 09:00 a 21:30).',
      'Farmacia 24h en Paseo Marítimo esquina C/ Virgen del Carmen.',
    ],
    customChecklist: JSON.parse(JSON.stringify(DEFAULT_IVI_CHECKLIST)),
    modulesEnabled: {
      cleanings: true,
      guestGuide: true,
    },
    lastSyncedAt: 'Hace 3 minutos',
  },
  {
    id: 'prop-2',
    name: 'Loft Centro Histórico · Catedral',
    slug: 'loft-centro-catedral',
    address: 'Calle Larios 14, 2ºB, 29005 Málaga',
    hostWhatsapp: '+34600112233',
    googleMapsUrl: 'https://maps.google.com/?q=Calle+Larios+14+Malaga',
    airbnbIcalUrl: 'https://www.airbnb.es/calendar/ical/55443322.ics?s=b1c2d3e4',
    bookingIcalUrl: 'https://ical.booking.com/v1/export?t=11223344-efgh',
    defaultCleanerId: 'cl-2',
    cleaningFee: 38,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    lateCheckoutPrice: 30,
    lateCheckoutUntil: '16:30',
    wifiSsid: 'LoftCatedral_Fibra',
    wifiPassword: 'MalagaCentro99',
    doorCode: '1904*',
    intercomCode: '202#',
    checkInInstructions:
      'Cajetín de llaves negro a la izquierda del portal. Sube a la 2ª planta puerta B.',
    checkOutInstructions:
      'Deja las llaves sobre la mesa de entrada, apaga luces y climatización y deposita la basura en los contenedores de la esquina.',
    departureChecklist: [
      'Apagar las luces',
      'Apagar AC',
      'Dejar las llaves encima de la mesa',
      'Tirar la basura',
    ],
    requireVideoToUnlockCodes: true,
    videos: [
      {
        id: 'vid-201',
        title: 'Dónde está el cajetín de llaves y cómo abrirlo',
        category: 'checkin',
        url: 'https://www.youtube.com/watch?v=QfDf3DJVdMw',
      },
      {
        id: 'vid-202',
        title: 'Home Tour del Alojamiento',
        category: 'hometour',
        url: 'https://www.youtube.com/watch?v=M0PNnOe0do8',
      },
      {
        id: 'vid-203',
        title: 'Aire Acondicionado y Climatización',
        category: 'appliance',
        url: 'https://www.youtube.com/watch?v=IsEaaEf6ALs',
      },
      {
        id: 'vid-204',
        title: 'Vitrocerámica: Encendido y Bloqueo',
        category: 'appliance',
        url: 'https://www.youtube.com/watch?v=lVo8BU0aP6Q',
      },
    ],
    extras: [
      {
        id: 'ext-late-2',
        title: 'Late Check-out hasta las 16:30h',
        description: 'Aprovecha tu último día en el centro sin cargar con maletas.',
        price: 30,
        priceUnit: 'reserva',
        icon: 'clock',
        onlyWhenFreeNextDay: true,
        active: true,
      },
      {
        id: 'ext-pet-2',
        title: 'Suplemento Mascota (con comedero y cama)',
        description: 'Tu mascota es bienvenida en el alojamiento.',
        price: 25,
        priceUnit: 'reserva',
        icon: 'dog',
        onlyWhenFreeNextDay: false,
        active: true,
      },
    ],
    houseRules: [
      'Prohibidas fiestas o despedidas de soltero/a',
      'Apagar el aire acondicionado al salir del apartamento',
      'Dejar las llaves dentro del cajetín exterior al hacer el check-out',
    ],
    appliancesGuide:
      'Cafetera Nespresso: cápsulas de cortesía junto al microondas. Termo eléctrico de 80L (esperar 15 min entre duchas largas).',
    localRecommendations: [
      'El Pimpi (a 4 min andando): vinos locales y tapas imprescindibles.',
      'Café Central en Plaza de la Constitución para desayunar.',
    ],
    customChecklist: JSON.parse(JSON.stringify(DEFAULT_IVI_CHECKLIST)),
    modulesEnabled: {
      cleanings: true,
      guestGuide: true,
    },
    lastSyncedAt: 'Hace 5 minutos',
  },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    propertyId: 'prop-1',
    source: 'Airbnb',
    guestName: 'Sophie Laurent (4 huéspedes)',
    checkIn: '2026-10-30',
    checkOut: '2026-11-03', // Sale el 3 y NO entra nadie -> Ofrece Late Check-out + todos los extras
    requestedExtras: [],
    lateCheckoutApproved: false,
  },
  {
    id: 'res-102',
    propertyId: 'prop-1',
    source: 'Booking',
    guestName: 'Markus Weber (2 huéspedes)',
    checkIn: '2026-11-05',
    checkOut: '2026-11-08', // Sale el 8 y entra otro el 8 -> 🔥 Rotación mismo día
    requestedExtras: [],
  },
  {
    id: 'res-103',
    propertyId: 'prop-1',
    source: 'Airbnb',
    guestName: 'Laura Gómez (Familia)',
    checkIn: '2026-11-08',
    checkOut: '2026-11-12',
    requestedExtras: [],
  },
  {
    id: 'res-201',
    propertyId: 'prop-2',
    source: 'Booking',
    guestName: 'James & Emily Carter',
    checkIn: '2026-10-31',
    checkOut: '2026-11-02', // 🔥 Sale HOY y entra otro HOY
    requestedExtras: [],
  },
  {
    id: 'res-202',
    propertyId: 'prop-2',
    source: 'Airbnb',
    guestName: 'Carlos Ruiz',
    checkIn: '2026-11-02',
    checkOut: '2026-11-06',
    requestedExtras: [],
  },
];

export const INITIAL_TASK_OVERRIDES: CleaningTask[] = [
  {
    id: 'task-res-201',
    propertyId: 'prop-2',
    reservationId: 'res-201',
    date: '2026-11-02',
    cleanerId: 'cl-2',
    sameDayCheckIn: true,
    nextCheckInTime: '15:00',
    scheduledCleaningTime: '11:00',
    lateCheckoutActive: false,
    status: 'completed',
    photosUploaded: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
    ],
    checklist: [
      { id: 'chk-1', label: 'Cambiar ropa de cama y toallas limpias', completed: true },
      { id: 'chk-2', label: 'Desinfectar baño completo y reponer amenities', completed: true },
      { id: 'chk-3', label: 'Revisar menaje de cocina y microondas', completed: true },
      { id: 'chk-4', label: 'Comprobar llaves en cajetín 1904*', completed: true },
    ],
    incidents: [],
    fee: 40,
  },
];

export const SAMPLE_ICAL_SNIPPET = `BEGIN:VCALENDAR
PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
VERSION:2.0
BEGIN:VEVENT
DTEND;VALUE=DATE:20261115
DTSTART;VALUE=DATE:20261112
UID:airbnb-demo-991@airbnb.com
SUMMARY:Reserved - Henrik Lindqvist (Airbnb)
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20261119
DTSTART;VALUE=DATE:20261115
UID:booking-demo-992@booking.com
SUMMARY:CLOSED - Claire Dubois (Booking)
END:VEVENT
END:VCALENDAR`;
