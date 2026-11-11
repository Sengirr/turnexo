import { createClient } from '@supabase/supabase-js';
import { Cleaner, CleaningTask, Property, Reservation } from './icalParser';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface HostAccount {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  plan: 'module_cleanings' | 'module_guide' | 'pack_complete' | 'plan_starter' | 'plan_pro' | 'plan_manager' | string;
  subscriptionStatus?: 'trialing' | 'active';
  trialEndsAt: string;
}

export const STRIPE_PAYMENT_LINKS = {
  plan_starter: '',
  plan_pro: import.meta.env.VITE_STRIPE_LINK_PRO || 'https://buy.stripe.com/3cIdR93BBbWd2mb9yt5c400',
  plan_manager: import.meta.env.VITE_STRIPE_LINK_MANAGER || 'https://buy.stripe.com/6oU8wP8VV8K10e38up5c401',
  pack_complete: import.meta.env.VITE_STRIPE_LINK_PACK || 'https://buy.stripe.com/3cIdR93BBbWd2mb9yt5c400',
  module_cleanings: import.meta.env.VITE_STRIPE_LINK_CLEANINGS || '',
  module_guide: import.meta.env.VITE_STRIPE_LINK_GUIDE || '',
};

export const getStripePaymentLink = (plan: string): string => {
  try {
    const adminConfig = localStorage.getItem('turnexo_stripe_links_v1');
    if (adminConfig) {
      const parsed = JSON.parse(adminConfig);
      if (parsed[plan] && typeof parsed[plan] === 'string' && parsed[plan].startsWith('http')) {
        return parsed[plan];
      }
    }
  } catch {}

  const envLink = (STRIPE_PAYMENT_LINKS as Record<string, string>)[plan] || '';
  if (envLink && envLink.startsWith('http')) return envLink;
  return '';
};

/**
 * Carga propiedades, limpiadoras, reservas y tareas desde Supabase cuando está configurado.
 */
export async function loadWorkspaceFromSupabase(): Promise<{
  properties: Property[] | null;
  cleaners: Cleaner[] | null;
  reservations: Reservation[] | null;
  tasks: CleaningTask[] | null;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return { properties: null, cleaners: null, reservations: null, tasks: null };
  }

  try {
    const [propsRes, cleanersRes, resvRes, tasksRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: true }),
      supabase.from('cleaners').select('*').order('created_at', { ascending: true }),
      supabase.from('reservations').select('*').order('check_in', { ascending: true }),
      supabase.from('cleaning_tasks').select('*').order('date', { ascending: true }),
    ]);

    const properties: Property[] | null =
      propsRes.data && propsRes.data.length > 0
        ? propsRes.data.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            address: row.address || '',
            hostWhatsapp: row.host_whatsapp || '',
            googleMapsUrl: row.google_maps_url || '',
            airbnbIcalUrl: row.airbnb_ical_url || '',
            bookingIcalUrl: row.booking_ical_url || '',
            defaultCleanerId: row.default_cleaner_id || '',
            cleaningFee: Number(row.cleaning_fee) || 40,
            checkInTime: row.check_in_time || '15:00',
            checkOutTime: row.check_out_time || '11:00',
            lateCheckoutPrice: Number(row.late_checkout_price) || 35,
            lateCheckoutUntil: row.late_checkout_until || '17:00',
            wifiSsid: row.wifi_ssid || '',
            wifiPassword: row.wifi_password || '',
            doorCode: row.door_code || '',
            intercomCode: row.intercom_code || '',
            checkInInstructions: row.check_in_instructions || '',
            checkOutInstructions: row.check_out_instructions || '',
            departureChecklist: row.departure_checklist || [],
            requireVideoToUnlockCodes: row.require_video_to_unlock_codes !== false,
            videos: row.videos || [],
            extras: row.extras || [],
            houseRules: row.house_rules || [],
            appliancesGuide: row.appliances_guide || '',
            localRecommendations: row.local_recommendations || [],
            customChecklist: row.custom_checklist || [],
            modulesEnabled: row.modules_enabled || { cleanings: true, guestGuide: true },
            lastSyncedAt: row.last_synced_at
              ? new Date(row.last_synced_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Sincronizado',
            lastSyncedTimestamp: row.last_synced_at
              ? new Date(row.last_synced_at).getTime()
              : undefined,
          }))
        : null;

    const cleaners: Cleaner[] | null =
      cleanersRes.data && cleanersRes.data.length > 0
        ? cleanersRes.data.map((row: any) => ({
            id: row.id,
            name: row.name,
            phone: row.phone || '',
            magicToken: row.magic_token,
          }))
        : null;

    const reservations: Reservation[] | null =
      resvRes.data && resvRes.data.length > 0
        ? resvRes.data.map((row: any) => ({
            id: row.id,
            propertyId: row.property_id,
            source: row.source || 'Airbnb',
            guestName: row.guest_name || 'Huésped',
            checkIn: row.check_in,
            checkOut: row.check_out,
            requestedExtras: row.requested_extras || [],
            approvedExtras: row.approved_extras || [],
            lateCheckoutRequested: Boolean(row.late_checkout_requested),
            lateCheckoutApproved: Boolean(row.late_checkout_approved),
            lateCheckoutTime: row.late_checkout_time || undefined,
            lateCheckoutPaidAmount: row.late_checkout_paid_amount
              ? Number(row.late_checkout_paid_amount)
              : undefined,
            estimatedArrivalTime: row.estimated_arrival_time || undefined,
            estimatedDepartureTime: row.estimated_departure_time || undefined,
            arrivalInstructionsConfirmed: Boolean(row.arrival_instructions_confirmed),
            guestArrivedAt: row.guest_arrived_at || undefined,
          }))
        : null;

    const tasks: CleaningTask[] | null =
      tasksRes.data && tasksRes.data.length > 0
        ? tasksRes.data.map((row: any) => ({
            id: row.id,
            propertyId: row.property_id,
            reservationId: row.reservation_id,
            date: row.date,
            cleanerId: row.cleaner_id || '',
            sameDayCheckIn: false,
            nextCheckInTime: '15:00',
            scheduledCleaningTime: '11:00',
            lateCheckoutActive: false,
            status: row.status || 'pending',
            photosUploaded: row.photos_uploaded || [],
            checklist: row.checklist || [],
            incidents: row.incidents || [],
            fee: 40,
          }))
        : null;

    return { properties, cleaners, reservations, tasks };
  } catch (err) {
    console.warn('[Turnexo Supabase Load] Fallback a datos locales:', err);
    return { properties: null, cleaners: null, reservations: null, tasks: null };
  }
}

/**
 * Sincroniza una propiedad modificada con Supabase si las variables VITE_SUPABASE_* están activas.
 */
export async function syncPropertyToSupabase(hostId: string, prop: Property): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.from('properties').upsert({
      id: prop.id,
      host_id: hostId,
      name: prop.name,
      slug: prop.slug,
      address: prop.address,
      host_whatsapp: prop.hostWhatsapp,
      google_maps_url: prop.googleMapsUrl,
      airbnb_ical_url: prop.airbnbIcalUrl,
      booking_ical_url: prop.bookingIcalUrl,
      default_cleaner_id: prop.defaultCleanerId,
      cleaning_fee: prop.cleaningFee,
      check_in_time: prop.checkInTime,
      check_out_time: prop.checkOutTime,
      late_checkout_price: prop.lateCheckoutPrice,
      late_checkout_until: prop.lateCheckoutUntil,
      wifi_ssid: prop.wifiSsid,
      wifi_password: prop.wifiPassword,
      door_code: prop.doorCode,
      intercom_code: prop.intercomCode || '',
      check_in_instructions: prop.checkInInstructions,
      check_out_instructions: prop.checkOutInstructions || '',
      departure_checklist: prop.departureChecklist || [],
      require_video_to_unlock_codes: prop.requireVideoToUnlockCodes !== false,
      videos: prop.videos || [],
      extras: prop.extras || [],
      house_rules: prop.houseRules || [],
      appliances_guide: prop.appliancesGuide || '',
      local_recommendations: prop.localRecommendations || [],
      custom_checklist: prop.customChecklist || [],
      modules_enabled: prop.modulesEnabled,
      last_synced_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error guardando propiedad:', err);
  }
}

export async function syncHostToSupabase(account: HostAccount): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('hosts').upsert({
      id: account.id,
      email: account.email,
      full_name: account.fullName,
      company_name: account.companyName,
      subscription_plan: account.plan,
      subscription_status: account.subscriptionStatus || 'trialing',
    });
    if (error) {
      console.error('[Turnexo Supabase Sync] Error guardando host:', error);
    }
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error guardando host:', err);
  }
}

export async function syncReservationToSupabase(res: Reservation): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  const basePayload = {
    id: res.id,
    property_id: res.propertyId,
    source: res.source,
    guest_name: res.guestName,
    check_in: res.checkIn,
    check_out: res.checkOut,
    requested_extras: res.requestedExtras || [],
    late_checkout_requested: Boolean(res.lateCheckoutRequested),
    late_checkout_approved: Boolean(res.lateCheckoutApproved),
    late_checkout_time: res.lateCheckoutTime || null,
    late_checkout_paid_amount: res.lateCheckoutPaidAmount || null,
    estimated_arrival_time: res.estimatedArrivalTime || null,
    estimated_departure_time: res.estimatedDepartureTime || null,
    arrival_instructions_confirmed: Boolean(res.arrivalInstructionsConfirmed),
    guest_arrived_at: res.guestArrivedAt || null,
    updated_at: new Date().toISOString(),
  };

  try {
    await supabase.from('reservations').upsert({
      ...basePayload,
      approved_extras: res.approvedExtras || [],
    });
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error guardando reserva:', err);
  }
}

export async function syncCleaningTaskToSupabase(task: CleaningTask): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.from('cleaning_tasks').upsert({
      id: task.id,
      property_id: task.propertyId,
      reservation_id: task.reservationId,
      date: task.date,
      cleaner_id: task.cleanerId,
      status: task.status,
      photos_uploaded: task.photosUploaded,
      checklist: task.checklist,
      incidents: task.incidents,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error guardando tarea:', err);
  }
}

export async function syncCleanerToSupabase(hostId: string, cleaner: Cleaner): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.from('cleaners').upsert({
      id: cleaner.id,
      host_id: hostId,
      name: cleaner.name,
      phone: cleaner.phone,
      magic_token: cleaner.magicToken,
    });
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error guardando limpiadora:', err);
  }
}

export async function deletePropertyFromSupabase(propertyId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.from('properties').delete().eq('id', propertyId);
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error eliminando propiedad:', err);
  }
}

export async function deleteCleanerFromSupabase(cleanerId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    await supabase.from('cleaners').delete().eq('id', cleanerId);
  } catch (err) {
    console.warn('[Turnexo Supabase Sync] Error eliminando limpiadora:', err);
  }
}

export async function pushFullWorkspaceToSupabase(
  hostId: string,
  properties: Property[],
  cleaners: Cleaner[],
  reservations: Reservation[],
  tasks: CleaningTask[]
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { ok: false, error: 'Supabase no está configurado en .env' };
  }
  try {
    for (const c of cleaners) {
      await syncCleanerToSupabase(hostId, c);
    }
    for (const p of properties) {
      await syncPropertyToSupabase(hostId, p);
    }
    for (const r of reservations) {
      await syncReservationToSupabase(r);
    }
    for (const t of tasks) {
      await syncCleaningTaskToSupabase(t);
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Error al sincronizar con Supabase' };
  }
}

export function subscribeToWorkspaceChanges(onUpdate: () => void): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};
  const channel = supabase
    .channel('turnexo-realtime-workspace')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_tasks' }, () => onUpdate())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cleaners' }, () => onUpdate())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
