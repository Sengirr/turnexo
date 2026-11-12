export interface PropertyVideo {
  id: string;
  title: string;
  category: 'checkin' | 'hometour' | 'appliance' | 'other';
  url: string;
}

export interface PropertyExtra {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: 'reserva' | 'noche' | 'día';
  icon: 'clock' | 'car' | 'baby' | 'sparkles' | 'dog';
  onlyWhenFreeNextDay?: boolean; // Si es true (ej. Late Check-out), solo se ofrece si el iCal ve que no entra nadie ese día
  active: boolean;
}

export interface Reservation {
  id: string;
  propertyId: string;
  source: 'Airbnb' | 'Booking' | 'Directo';
  guestName: string;
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  requestedExtras?: string[]; // IDs de PropertyExtra solicitados por el huésped
  approvedExtras?: string[];  // IDs de PropertyExtra aprobados por el anfitrión
  lateCheckoutRequested?: boolean;
  lateCheckoutApproved?: boolean;
  lateCheckoutTime?: string; // e.g., "17:00"
  lateCheckoutPaidAmount?: number;
  estimatedArrivalTime?: string; // e.g., "15:00"
  estimatedDepartureTime?: string; // e.g., "11:00"
  arrivalInstructionsConfirmed?: boolean;
  guestArrivedAt?: string;
}

export interface ChecklistItem {
  id: string;
  label: string; // 100 % en español y personalizable por piso
  category?: string;
  photoRequired?: boolean;
  completed: boolean;
  photos?: string[];
}

export interface PropertyCleaningItem {
  id: string;
  category: string;
  item: string;
  photoRequired: boolean;
}

export const DEFAULT_IVI_CHECKLIST: PropertyCleaningItem[] = [
  // --- COCINA ---
  { id: 'coc-1', category: 'Cocina', item: 'Nevera/Congelador (Sin escarcha)', photoRequired: true },
  { id: 'coc-2', category: 'Cocina', item: 'Cafetera/Hervidor', photoRequired: true },
  { id: 'coc-3', category: 'Cocina', item: 'Sartenes y Ollas', photoRequired: true },
  { id: 'coc-4', category: 'Cocina', item: 'Cajon Cubiertos', photoRequired: true },
  { id: 'coc-5', category: 'Cocina', item: 'Cajon Menaje', photoRequired: true },
  { id: 'coc-6', category: 'Cocina', item: 'Mueble Vasos/Copas Vino', photoRequired: true },
  { id: 'coc-7', category: 'Cocina', item: 'Mueble Platos', photoRequired: true },
  { id: 'coc-8', category: 'Cocina', item: 'Tostadora', photoRequired: false },
  { id: 'coc-9', category: 'Cocina', item: 'Horno', photoRequired: true },
  { id: 'coc-10', category: 'Cocina', item: 'Microondas', photoRequired: false },
  { id: 'coc-11', category: 'Cocina', item: 'Lavavajillas', photoRequired: false },
  { id: 'coc-12', category: 'Cocina', item: 'Bayetas+Estropajo+Trapo Cocina', photoRequired: false },
  { id: 'coc-13', category: 'Cocina', item: 'Productos limpieza+Bolsa Basura', photoRequired: true },
  { id: 'coc-14', category: 'Cocina', item: 'Dosificador Fairy lleno', photoRequired: false },

  // --- SALÓN ---
  { id: 'sal-1', category: 'Salón', item: 'Sofa', photoRequired: true },
  { id: 'sal-2', category: 'Salón', item: 'Colchon Sofa + protector', photoRequired: true },
  { id: 'sal-3', category: 'Salón', item: 'Wifi + Guia', photoRequired: false },

  // --- DORMITORIO ---
  { id: 'dor-1', category: 'Dormitorio', item: 'Cama con toallas', photoRequired: true },
  { id: 'dor-2', category: 'Dormitorio', item: 'Interior armario: Almohadas, Sabanas, Toallas y Nordico con funda', photoRequired: true },
  { id: 'dor-3', category: 'Dormitorio', item: 'Protector Colchon', photoRequired: false },
  { id: 'dor-4', category: 'Dormitorio', item: 'Cajones', photoRequired: false },
  { id: 'dor-5', category: 'Dormitorio', item: 'Cortinas y Persianas (Ver si funciona)', photoRequired: false },
  { id: 'dor-6', category: 'Dormitorio', item: 'Cuna + colchon', photoRequired: true },

  // --- BAÑO ---
  { id: 'ban-1', category: 'Baño', item: 'Lavabo + Espejo', photoRequired: false },
  { id: 'ban-2', category: 'Baño', item: 'WC + Papel', photoRequired: false },
  { id: 'ban-3', category: 'Baño', item: 'Railes Mampara', photoRequired: true },
  { id: 'ban-4', category: 'Baño', item: 'Botes jabon, gel y champu', photoRequired: false },
  { id: 'ban-5', category: 'Baño', item: 'Escobilla wc', photoRequired: false },
  { id: 'ban-6', category: 'Baño', item: 'Papelera bolsa', photoRequired: false },
  { id: 'ban-7', category: 'Baño', item: 'Secador', photoRequired: false },
  { id: 'ban-8', category: 'Baño', item: 'Plancha', photoRequired: false },
  { id: 'ban-9', category: 'Baño', item: 'Desague ducha', photoRequired: false },
  { id: 'ban-10', category: 'Baño', item: 'Lavadora (Cajón limpio y sin ropa dentro + pastilla)', photoRequired: false },

  // --- EXTRAS ---
  { id: 'ext-1', category: 'Extras', item: 'Fregona, cubo, escoba', photoRequired: true },
  { id: 'ext-2', category: 'Extras', item: 'Mopa', photoRequired: true },
  { id: 'ext-3', category: 'Extras', item: 'Mesa terraza y sillas', photoRequired: false },
  { id: 'ext-4', category: 'Extras', item: 'Tendedero', photoRequired: false },
  { id: 'ext-5', category: 'Extras', item: 'Luces y AC apagado', photoRequired: false },
  { id: 'ext-6', category: 'Extras', item: 'Mandos TV y AC (limpios)', photoRequired: true },
  { id: 'ext-7', category: 'Extras', item: 'Cajetin llave', photoRequired: true },
  { id: 'ext-8', category: 'Extras', item: 'Raixer', photoRequired: false },
];

export function normalizeCleaningChecklist(rawList?: (string | PropertyCleaningItem)[]): PropertyCleaningItem[] {
  if (!rawList || rawList.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_IVI_CHECKLIST));
  }
  return rawList.map((raw, idx) => {
    if (typeof raw === 'string') {
      return {
        id: `chk-${idx + 1}`,
        category: 'General',
        item: raw,
        photoRequired: false,
      };
    }
    return {
      id: raw.id || `chk-${idx + 1}`,
      category: raw.category || 'General',
      item: raw.item || '',
      photoRequired: Boolean(raw.photoRequired),
    };
  });
}

export interface CleaningIncident {
  id: string;
  text: string;
  photoUrl?: string;
  createdAt: string;
}

export interface CleaningTask {
  id: string;
  propertyId: string;
  reservationId: string;
  date: string; // YYYY-MM-DD (matches checkOut)
  cleanerId: string;
  sameDayCheckIn: boolean; // true if another reservation starts on `date`
  nextCheckInTime: string; // default "15:00"
  scheduledCleaningTime: string; // default "11:00", or "17:00" if late checkout approved!
  lateCheckoutActive: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  photosUploaded: string[];
  checklist: ChecklistItem[];
  incidents: CleaningIncident[];
  fee: number;
  startTime?: string;
  endTime?: string;
  actualHours?: number;
  pax?: number;
  notes?: string;
  isDeepCleaning?: boolean;
  isBagPrepared?: boolean;
}

export interface Cleaner {
  id: string;
  name: string;
  phone: string;
  magicToken: string;
}

export interface Property {
  id: string;
  name: string;
  slug: string;
  address: string;
  hostWhatsapp: string;
  googleMapsUrl: string;
  airbnbIcalUrl: string;
  bookingIcalUrl: string;
  defaultCleanerId: string;
  cleaningFee: number;
  checkInTime: string;
  checkOutTime: string;
  lateCheckoutPrice: number;
  lateCheckoutUntil: string;
  wifiSsid: string;
  wifiPassword: string;
  doorCode: string;
  intercomCode?: string;
  checkInInstructions: string;
  checkOutInstructions?: string;
  departureChecklist?: string[];
  requireVideoToUnlockCodes?: boolean;
  videos: PropertyVideo[];
  extras: PropertyExtra[];
  houseRules: string[];
  appliancesGuide: string;
  localRecommendations: string[];
  customChecklist: PropertyCleaningItem[];
  modulesEnabled: {
    cleanings: boolean;
    guestGuide: boolean;
  };
  lastSyncedAt: string;
  lastSyncedTimestamp?: number;
}

export const ICAL_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos de caché para coste 0€

/**
 * Devuelve true solo si el alojamiento tiene URLs iCal reales configuradas
 * y han pasado más de 30 minutos desde la última lectura bajo demanda.
 */
export function shouldAutoSyncProperty(prop: Property, now = Date.now()): boolean {
  const hasRealUrl =
    (prop.airbnbIcalUrl && prop.airbnbIcalUrl.startsWith('http')) ||
    (prop.bookingIcalUrl && prop.bookingIcalUrl.startsWith('http'));
  if (!hasRealUrl) return false;
  if (!prop.lastSyncedTimestamp) return true;
  return now - prop.lastSyncedTimestamp > ICAL_CACHE_TTL_MS;
}

/**
 * Parsea contenido real de un archivo iCal (.ics) de Airbnb o Booking.com
 * y devuelve reservas normalizadas.
 */
export function parseICalContent(
  icsText: string,
  propertyId: string,
  defaultSource: 'Airbnb' | 'Booking' = 'Airbnb'
): Reservation[] {
  const reservations: Reservation[] = [];
  const blocks = icsText.split('BEGIN:VEVENT').slice(1);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0] || '';
    const dtStartMatch = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})/);
    const dtEndMatch = block.match(/DTEND(?:;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})/);
    const summaryMatch = block.match(/SUMMARY:(.+)/);
    const uidMatch = block.match(/UID:(.+)/);

    if (dtStartMatch && dtEndMatch) {
      const checkIn = `${dtStartMatch[1]}-${dtStartMatch[2]}-${dtStartMatch[3]}`;
      const checkOut = `${dtEndMatch[1]}-${dtEndMatch[2]}-${dtEndMatch[3]}`;
      const rawSummary = (summaryMatch?.[1] || 'Reserva').trim();

      let source: 'Airbnb' | 'Booking' | 'Directo' = defaultSource;
      if (rawSummary.toLowerCase().includes('booking') || rawSummary.toLowerCase().includes('closed')) {
        source = 'Booking';
      } else if (rawSummary.toLowerCase().includes('airbnb') || rawSummary.toLowerCase().includes('reserved')) {
        source = 'Airbnb';
      }

      let guestName =
        rawSummary
          .replace(/Reserved\s*-?\s*/i, '')
          .replace(/CLOSED\s*-\s*/i, '')
          .replace(/Airbnb\s*\(Not available\)/i, 'No disponible')
          .replace(/\(Not available\)/i, 'No disponible')
          .replace(/^Not available$/i, 'No disponible')
          .trim();

      if (!guestName || guestName.toLowerCase() === 'airbnb' || guestName.toLowerCase() === 'booking') {
        guestName = `Huésped ${source}`;
      }

      reservations.push({
        id: uidMatch?.[1]?.trim() || `ical-${propertyId}-${i}-${checkIn}`,
        propertyId,
        source,
        guestName,
        checkIn,
        checkOut,
        requestedExtras: [],
      });
    }
  }

  return reservations.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

export function createChecklistFromProperty(prop?: Property): ChecklistItem[] {
  const items = normalizeCleaningChecklist(prop?.customChecklist);
  return items.map((it, idx) => ({
    id: it.id || `chk-${idx + 1}`,
    label: it.item,
    category: it.category || 'General',
    photoRequired: Boolean(it.photoRequired),
    completed: false,
  }));
}

/**
 * A partir de las reservas de los pisos, calcula automáticamente las tareas de limpieza,
 * detecta si hay entrada el mismo día (🔥 Urgente) y ajusta la hora si el anfitrión aprobó Late Check-out.
 */
export function buildCleaningTasksFromReservations(
  properties: Property[],
  reservations: Reservation[],
  existingTasks: CleaningTask[]
): CleaningTask[] {
  const tasks: CleaningTask[] = [];

  for (const res of reservations) {
    const prop = properties.find((p) => p.id === res.propertyId);
    if (!prop || !prop.modulesEnabled.cleanings) continue;

    // ¿Entra otro huésped el mismo día que sale este?
    const sameDayCheckIn = reservations.some(
      (other) => other.id !== res.id && other.propertyId === res.propertyId && other.checkIn === res.checkOut
    );

    const existing = existingTasks.find((t) => t.reservationId === res.id);
    const lateCheckoutActive = Boolean(res.lateCheckoutApproved && !sameDayCheckIn);
    const scheduledCleaningTime = lateCheckoutActive
      ? res.lateCheckoutTime || prop.lateCheckoutUntil
      : prop.checkOutTime;

    // Solo asignar pax si viene especificado o se deduce del nombre del huésped
    let pax = existing?.pax;
    if (!pax && res.guestName) {
      const match = res.guestName.match(/(\d+)\s*(?:huésped(?:es)?|persona(?:s)?|pax|guests?)/i);
      if (match) {
        pax = parseInt(match[1], 10);
      }
    }

    tasks.push({
      id: existing?.id || `task-${res.id}`,
      propertyId: prop.id,
      reservationId: res.id,
      date: res.checkOut,
      cleanerId: existing?.cleanerId || prop.defaultCleanerId,
      sameDayCheckIn,
      nextCheckInTime: prop.checkInTime,
      scheduledCleaningTime,
      lateCheckoutActive,
      status: existing?.status || 'pending',
      startTime:
        existing?.startTime ||
        (existing?.status === 'in_progress' ? new Date().toISOString() : undefined),
      endTime: existing?.endTime,
      actualHours: existing?.actualHours,
      notes: existing?.notes,
      isDeepCleaning: existing?.isDeepCleaning,
      isBagPrepared: existing?.isBagPrepared,
      photosUploaded: existing?.photosUploaded || [],
      checklist: existing?.checklist || createChecklistFromProperty(prop),
      incidents: existing?.incidents || [],
      fee: prop.cleaningFee,
      pax,
    });
  }

  return tasks.sort((a, b) => a.date.localeCompare(b.date));
}
