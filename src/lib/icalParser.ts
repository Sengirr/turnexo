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
  completed: boolean;
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
  customChecklist: string[];
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

      const guestName =
        rawSummary
          .replace(/Reserved\s*-?\s*/i, '')
          .replace(/CLOSED\s*-\s*/i, '')
          .trim() || `Huésped ${source}`;

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
  const items = prop?.customChecklist?.length
    ? prop.customChecklist
    : [
        'Ventilar todas las estancias y revisar olores',
        'Cambiar sábanas y dejar 2 toallas por huésped',
        'Desinfectar baño, mampara y reponer papel/gel',
        'Revisar interior de nevera, microondas y cafetera',
        'Comprobar que no hay objetos olvidados ni roturas',
      ];

  return items.map((label, idx) => ({
    id: `chk-${idx + 1}`,
    label,
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
      photosUploaded: existing?.photosUploaded || [],
      checklist: existing?.checklist || createChecklistFromProperty(prop),
      incidents: existing?.incidents || [],
      fee: prop.cleaningFee,
    });
  }

  return tasks.sort((a, b) => a.date.localeCompare(b.date));
}
