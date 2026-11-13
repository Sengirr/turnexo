import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  buildCleaningTasksFromReservations,
  CleaningTask,
  parseICalContent,
  Property,
  PropertyExtra,
  Reservation,
  shouldAutoSyncProperty,
} from './lib/icalParser';
import {
  INITIAL_CLEANERS,
  INITIAL_PROPERTIES,
  INITIAL_RESERVATIONS,
  INITIAL_TASK_OVERRIDES,
} from './lib/mockData';
import {
  DEFAULT_HOST_FISCAL_PROFILE,
  HostFiscalProfile,
  INITIAL_INVOICES,
  Invoice,
  isCorruptedOrMockInvoice,
  sanitizeInvoice,
} from './lib/invoice';
import HostDashboardView from './components/HostDashboardView';
import CleanerMagicView from './components/CleanerMagicView';
import GuestGuidePortalView from './components/GuestGuidePortalView';
import LandingPageView from './components/LandingPageView';
import AuthOnboardingView from './components/AuthOnboardingView';
import AdminMetricsView from './components/AdminMetricsView';
import LegalModal from './components/LegalModal';
import CookieBanner from './components/CookieBanner';
import { getStoredPromoCode, isCommunityPromoCode } from './lib/promo';
import {
  deleteCleanerFromSupabase,
  deletePropertyFromSupabase,
  HostAccount,
  isSupabaseConfigured,
  loadWorkspaceFromSupabase,
  subscribeToWorkspaceChanges,
  supabase,
  syncCleanerToSupabase,
  syncCleaningTaskToSupabase,
  syncHostToSupabase,
  syncPropertyToSupabase,
  syncReservationToSupabase,
} from './lib/supabase';

type RouteState =
  | { kind: 'landing' }
  | { kind: 'app' }
  | { kind: 'admin' }
  | { kind: 'cleaner'; token: string; fromApp?: boolean; fromLanding?: boolean }
  | { kind: 'guest'; slug: string; fromApp?: boolean; fromLanding?: boolean };

const STORAGE_KEYS = {
  host: 'turnexo_host_v2',
  properties: 'turnexo_properties_v2',
  cleaners: 'turnexo_cleaners_v2',
  reservations: 'turnexo_reservations_v2',
  taskOverrides: 'turnexo_tasks_v2',
  invoices: 'turnexo_invoices_v2',
  fiscalProfile: 'turnexo_fiscal_profile_v2',
};

const DEMO_PROPERTY_IDS = new Set(INITIAL_PROPERTIES.map((p) => p.id));
const DEMO_CLEANER_IDS = new Set(INITIAL_CLEANERS.map((c) => c.id));
const DEMO_RESERVATION_IDS = new Set(INITIAL_RESERVATIONS.map((r) => r.id));
const DEMO_INVOICE_IDS = new Set(INITIAL_INVOICES.map((i) => i.id));

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function parseCurrentLocation(): RouteState {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  const isDemo = params.get('demo') === '1';

  // Si volvemos de OAuth de Google o enlace de confirmación de email con tokens en el hash o query
  if (
    hash.includes('access_token=') ||
    hash.includes('type=') ||
    params.get('code') !== null ||
    params.get('token') !== null
  ) {
    return { kind: 'app' };
  }

  if (path.startsWith('/admin') || params.get('admin') !== null) {
    return { kind: 'admin' };
  }
  if (path.startsWith('/c/')) {
    return { kind: 'cleaner', token: path.replace('/c/', '').trim(), fromLanding: isDemo };
  }
  if (path.startsWith('/g/')) {
    return { kind: 'guest', slug: path.replace('/g/', '').trim(), fromLanding: isDemo };
  }
  if (path.startsWith('/app')) {
    return { kind: 'app' };
  }
  if (params.get('cleaner')) {
    return { kind: 'cleaner', token: params.get('cleaner') || '', fromLanding: isDemo };
  }
  if (params.get('guide')) {
    return { kind: 'guest', slug: params.get('guide') || '', fromLanding: isDemo };
  }
  return { kind: 'landing' };
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => parseCurrentLocation());

  const [hostAccount, setHostAccount] = useState<HostAccount | null>(() =>
    loadStored<HostAccount | null>(STORAGE_KEYS.host, null)
  );
  const [properties, setProperties] = useState<Property[]>(() =>
    loadStored(STORAGE_KEYS.properties, INITIAL_PROPERTIES)
  );
  const [cleaners, setCleaners] = useState(() =>
    loadStored(STORAGE_KEYS.cleaners, INITIAL_CLEANERS)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const raw = loadStored<Reservation[]>(STORAGE_KEYS.reservations, INITIAL_RESERVATIONS);
    // Descartar reservas demo 'res-' si para la misma fecha y alojamiento ya existe una reserva de iCal
    const realCheckoutKeys = new Set(
      raw
        .filter((r) => !r.id.startsWith('res-'))
        .map((r) => `${r.propertyId}__${r.checkOut}`)
    );
    return raw.filter((r) => {
      if (r.id.startsWith('res-') && realCheckoutKeys.has(`${r.propertyId}__${r.checkOut}`)) {
        return false;
      }
      return true;
    });
  });
  const [taskOverrides, setTaskOverrides] = useState<CleaningTask[]>(() =>
    loadStored(STORAGE_KEYS.taskOverrides, INITIAL_TASK_OVERRIDES)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const stored = loadStored<Invoice[]>(STORAGE_KEYS.invoices, []);
    return stored
      .filter((inv) => !isCorruptedOrMockInvoice(inv))
      .map(sanitizeInvoice);
  });
  const [fiscalProfile, setFiscalProfile] = useState<HostFiscalProfile>(() =>
    loadStored(STORAGE_KEYS.fiscalProfile, DEFAULT_HOST_FISCAL_PROFILE)
  );

  const [selectedCleanerId, setSelectedCleanerId] = useState<string>(INITIAL_CLEANERS[0].id);
  const [selectedReservationId, setSelectedReservationId] = useState<string>(
    INITIAL_RESERVATIONS[0].id
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'legal' | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'register' | 'login'>('register');
  const [authInitialPlan, setAuthInitialPlan] = useState<'plan_starter' | 'plan_pro' | 'plan_manager'>('plan_starter');
  const [promoCode, setPromoCode] = useState<string | null>(() => getStoredPromoCode());

  // Detectar y aplicar promociones activas
  useEffect(() => {
    const code = getStoredPromoCode();
    if (code) {
      setPromoCode(code);
      if (hostAccount && isCommunityPromoCode(code) && hostAccount.specialAccess !== 'comunidad') {
        const updated = {
          ...hostAccount,
          specialAccess: 'comunidad' as const,
          promoCode: code,
        };
        setHostAccount(updated);
        syncHostToSupabase(updated);
      }
    } else {
      setPromoCode(null);
    }
  }, [hostAccount]);

  // Sincronización inicial y tiempo real con Supabase si está configurado en .env
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const restoreUserSession = async (user: any) => {
      if (!user) return;
      const meta = user.user_metadata || {};
      const storedHost = loadStored<HostAccount | null>(STORAGE_KEYS.host, null);

      let dbPlan: string | undefined;
      let dbStatus: string | undefined;
      let dbFullName: string | undefined;
      let dbCompany: string | undefined;

      try {
        if (supabase) {
          const { data: hostRow } = await supabase
            .from('hosts')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (hostRow) {
            dbPlan = hostRow.subscription_plan;
            dbStatus = hostRow.subscription_status;
            dbFullName = hostRow.full_name;
            dbCompany = hostRow.company_name;
          }
        }
      } catch (err) {
        console.warn('[Turnexo] Error leyendo host de Supabase:', err);
      }

      // El plan de Supabase (ej. actualizado por webhook de Stripe) tiene prioridad sobre localStorage
      const effectivePlan =
        dbPlan ||
        (storedHost?.plan && storedHost.plan !== 'plan_starter' ? storedHost.plan : null) ||
        meta.subscription_plan ||
        storedHost?.plan ||
        'plan_pro';

      const account: HostAccount = {
        id: user.id,
        email: user.email || storedHost?.email || 'usuario@gmail.com',
        fullName: dbFullName || storedHost?.fullName || meta.full_name || meta.name || user.email?.split('@')[0] || 'Anfitrión',
        companyName: dbCompany || storedHost?.companyName || meta.company_name || 'Mis Alojamientos',
        plan: effectivePlan,
        subscriptionStatus: (dbStatus === 'active' || dbStatus === 'trialing' ? dbStatus : storedHost?.subscriptionStatus || 'active') as HostAccount['subscriptionStatus'],
        trialEndsAt: storedHost?.trialEndsAt || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        specialAccess: storedHost?.specialAccess,
        promoCode: storedHost?.promoCode,
      };

      setHostAccount(account);
      localStorage.setItem(STORAGE_KEYS.host, JSON.stringify(account));
      syncHostToSupabase(account);
    };

    // Detectar retorno desde Stripe (?payment=success)
    if (window.location.search.includes('payment=success')) {
      showToast('¡Pago confirmado! Tu suscripción se ha activado.');
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Detectar si venimos de un login con OAuth (Google) o sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        restoreUserSession(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
        restoreUserSession(session.user);
      }
    });

    const fetchCloud = () => {
      loadWorkspaceFromSupabase().then((cloud) => {
        if (cloud.properties) {
          setProperties((prev) => {
            const cloudIds = new Set(cloud.properties!.map((p) => p.id));
            const localOnly = prev.filter((p) => !cloudIds.has(p.id) && !DEMO_PROPERTY_IDS.has(p.id));
            return [...cloud.properties!, ...localOnly];
          });
        }
        if (cloud.cleaners) {
          setCleaners((prev) => {
            const cloudIds = new Set(cloud.cleaners!.map((c) => c.id));
            const localOnly = prev.filter((c) => !cloudIds.has(c.id) && !DEMO_CLEANER_IDS.has(c.id));
            return [...cloud.cleaners!, ...localOnly];
          });
        }
        if (cloud.reservations) {
          setReservations((prev) => {
            const cloudIds = new Set(cloud.reservations!.map((r) => r.id));
            const localOnly = prev.filter((r) => !cloudIds.has(r.id) && !DEMO_RESERVATION_IDS.has(r.id));
            localOnly.forEach((r) => syncReservationToSupabase(r));
            return [...cloud.reservations!, ...localOnly];
          });
        }
        setInvoices((prev) => prev.filter((inv) => !DEMO_INVOICE_IDS.has(inv.id)));
        if (cloud.tasks && cloud.tasks.length > 0) {
          setTaskOverrides((prev) => {
            const prevMap = new Map(prev.map((t) => [t.id, t]));
            return cloud.tasks!.map((cloudTask) => {
              const local = prevMap.get(cloudTask.id);
              let localTimerStart: string | undefined = undefined;
              try {
                const saved = localStorage.getItem(`turnexo_task_timer_${cloudTask.id}`);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  if (parsed.startTime) localTimerStart = parsed.startTime;
                }
              } catch {}

              const mergedStartTime =
                cloudTask.startTime ||
                local?.startTime ||
                localTimerStart ||
                undefined;

              const mergedStatus =
                (local?.status === 'in_progress' || localTimerStart) && cloudTask.status !== 'completed'
                  ? 'in_progress'
                  : cloudTask.status;

              return {
                ...cloudTask,
                status: mergedStatus,
                startTime: mergedStartTime,
                endTime: cloudTask.endTime || local?.endTime,
                actualHours: cloudTask.actualHours || local?.actualHours,
              };
            });
          });
        }
      });
    };

    fetchCloud();
    const unsubscribe = subscribeToWorkspaceChanges(() => {
      fetchCloud();
    });

    return () => {
      subscription.unsubscribe();
      unsubscribe();
    };
  }, []);

  // Sincronizar con botones Atrás/Adelante del navegador
  useEffect(() => {
    const onPopState = () => setRoute(parseCurrentLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string, nextRoute: RouteState) => {
    window.history.pushState({}, '', path);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (hostAccount) {
      localStorage.setItem(STORAGE_KEYS.host, JSON.stringify(hostAccount));
    } else {
      localStorage.removeItem(STORAGE_KEYS.host);
    }
  }, [hostAccount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.properties, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cleaners, JSON.stringify(cleaners));
  }, [cleaners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.reservations, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.taskOverrides, JSON.stringify(taskOverrides));
  }, [taskOverrides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fiscalProfile, JSON.stringify(fiscalProfile));
  }, [fiscalProfile]);

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`Factura ${newInvoice.invoiceNumber} emitida correctamente.`);
  };

  const handleAddInvoices = (newInvoices: Invoice[]) => {
    setInvoices((prev) => [...newInvoices, ...prev]);
    showToast(`✓ ${newInvoices.length} facturas emitidas y registradas correctamente.`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    showToast('Factura eliminada.');
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );
    showToast(`✓ Datos fiscales de ${updatedInvoice.invoiceNumber} actualizados.`);
  };

  const handleClearAllInvoices = () => {
    setInvoices([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.invoices);
    } catch {}
    showToast('Todas las facturas han sido eliminadas.');
  };

  const handleKeepOnlyInvoices = (keepIds: string[]) => {
    setInvoices((prev) => prev.filter((inv) => keepIds.includes(inv.id)));
    showToast('Facturas no registradas eliminadas del listado.');
  };

  const handleUpdateFiscalProfile = (updatedProfile: HostFiscalProfile) => {
    setFiscalProfile(updatedProfile);
    showToast('Datos fiscales actualizados.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const tasks = useMemo(
    () => buildCleaningTasksFromReservations(properties, reservations, taskOverrides),
    [properties, reservations, taskOverrides]
  );

  const upsertTaskOverride = (updated: CleaningTask) => {
    setTaskOverrides((prev) => {
      const others = prev.filter((t) => t.id !== updated.id);
      return [...others, updated];
    });
    syncCleaningTaskToSupabase(updated);
  };

  const handleImportIcalText = (propertyId: string, icsText: string, silent = false) => {
    const parsed = parseICalContent(icsText, propertyId);
    if (parsed.length === 0) {
      if (!silent) showToast('No se encontraron eventos VEVENT en el calendario iCal.');
      return;
    }
    setReservations((prev) => {
      // Si el iCal trae reservas para este alojamiento, descartamos reservas demo que coincidan en fecha de salida
      const newCheckoutKeys = new Set(parsed.map((r) => `${r.propertyId}__${r.checkOut}`));
      const filteredPrev = prev.filter((r) => {
        if (r.propertyId === propertyId && r.id.startsWith('res-') && newCheckoutKeys.has(`${r.propertyId}__${r.checkOut}`)) {
          return false;
        }
        return true;
      });
      const existingIds = new Set(filteredPrev.map((r) => r.id));
      const newOnes = parsed.filter((r) => !existingIds.has(r.id));
      newOnes.forEach((r) => syncReservationToSupabase(r));
      return [...filteredPrev, ...newOnes];
    });
    if (!silent) {
      showToast(`${parsed.length} reservas procesadas del iCal.`);
    }
  };

  const handleAddDirectReservation = (res: Reservation) => {
    setReservations((prev) => [...prev, res]);
    syncReservationToSupabase(res);
    showToast('Reserva directa añadida. Limpieza creada en el cuadrante.');
  };

  const handleSyncIcalUrl = async (propertyId: string, url: string, silent = false) => {
    try {
      const res = await fetch(`/api/fetch-ical?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Error');
      const icsText = await res.text();
      handleImportIcalText(propertyId, icsText, silent);
      const now = Date.now();
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? {
                ...p,
                lastSyncedAt: 'Hace menos de 1 min (Caché 30m activa)',
                lastSyncedTimestamp: now,
              }
            : p
        )
      );
    } catch {
      if (!silent) {
        showToast('No se pudo descargar la URL iCal.');
      }
    }
  };

  // Sincronización bajo demanda al abrir (/app, /c/:token o /g/:slug) con caché de 30 minutos (0€ en Cron)
  useEffect(() => {
    if (route.kind === 'landing' || route.kind === 'admin') return;
    properties.forEach((prop) => {
      if (shouldAutoSyncProperty(prop)) {
        // Marcamos timestamp para evitar lecturas duplicadas durante los próximos 30 min
        const now = Date.now();
        setProperties((prev) =>
          prev.map((p) => (p.id === prop.id ? { ...p, lastSyncedTimestamp: now } : p))
        );
        if (prop.airbnbIcalUrl && !prop.airbnbIcalUrl.includes('10293847') && !prop.airbnbIcalUrl.includes('55443322')) {
          handleSyncIcalUrl(prop.id, prop.airbnbIcalUrl, true);
        }
        if (prop.bookingIcalUrl && !prop.bookingIcalUrl.includes('99887766') && !prop.bookingIcalUrl.includes('11223344')) {
          handleSyncIcalUrl(prop.id, prop.bookingIcalUrl, true);
        }
      }
    });
  }, [route.kind]);

  const handleAssignCleaner = (taskId: string, cleanerId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    upsertTaskOverride({ ...found, cleanerId });
    showToast('Limpiadora asignada.');
  };

  const handleUpdateTaskTimes = (taskId: string, scheduledCleaningTime: string, nextCheckInTime: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    upsertTaskOverride({ ...found, scheduledCleaningTime, nextCheckInTime });
    showToast('Horarios de limpieza actualizados.');
  };

  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    const targetItem = found.checklist.find((i) => i.id === itemId);
    if (!targetItem) return;

    // Si la tarea exige foto obligatoria y no tiene fotos subidas, no permitir marcarla manualmente
    if (
      targetItem.photoRequired &&
      (!targetItem.photos || targetItem.photos.length === 0) &&
      !targetItem.completed
    ) {
      showToast('📸 Esta tarea exige foto obligatoria. Sube la foto para marcarla.');
      return;
    }

    const updatedChecklist = found.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    upsertTaskOverride({ ...found, checklist: updatedChecklist });
  };

  const handleAddPhoto = (taskId: string, photoUrl: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    upsertTaskOverride({
      ...found,
      photosUploaded: [...found.photosUploaded, photoUrl],
    });
    showToast('Foto de verificación añadida.');
  };

  const handleAddItemPhoto = (taskId: string, itemId: string, photoUrl: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    const updatedChecklist = found.checklist.map((item) => {
      if (item.id === itemId) {
        const itemPhotos = item.photos || [];
        return {
          ...item,
          completed: true,
          photos: [...itemPhotos, photoUrl],
        };
      }
      return item;
    });
    upsertTaskOverride({
      ...found,
      photosUploaded: [...found.photosUploaded, photoUrl],
      checklist: updatedChecklist,
    });
    showToast('Foto vinculada a la tarea.');
  };

  const handleDeleteItemPhoto = (taskId: string, itemId: string, photoIndex: number) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    let deletedUrl = '';
    const updatedChecklist = found.checklist.map((item) => {
      if (item.id === itemId && item.photos) {
        deletedUrl = item.photos[photoIndex];
        const newPhotos = [...item.photos];
        newPhotos.splice(photoIndex, 1);
        return {
          ...item,
          photos: newPhotos,
          completed: item.photoRequired && newPhotos.length === 0 ? false : item.completed,
        };
      }
      return item;
    });
    upsertTaskOverride({
      ...found,
      photosUploaded: deletedUrl ? found.photosUploaded.filter((u) => u !== deletedUrl) : found.photosUploaded,
      checklist: updatedChecklist,
    });
  };

  const handleStartTask = (taskId: string, explicitStartTime?: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    let startIso = explicitStartTime || found.startTime;
    if (!startIso) {
      try {
        const saved = localStorage.getItem(`turnexo_task_timer_${taskId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.startTime) startIso = parsed.startTime;
        }
      } catch {}
    }
    if (!startIso) {
      startIso = new Date().toISOString();
    }
    try {
      localStorage.setItem(
        `turnexo_task_timer_${taskId}`,
        JSON.stringify({ startTime: startIso, status: 'in_progress' })
      );
    } catch {}

    upsertTaskOverride({
      ...found,
      status: 'in_progress',
      startTime: startIso,
    });
    showToast('Limpieza iniciada. Cronómetro en marcha.');
  };

  const handleCompleteTask = (taskId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    const now = new Date().toISOString();
    let startIso = found.startTime;
    if (!startIso) {
      try {
        const saved = localStorage.getItem(`turnexo_task_timer_${taskId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.startTime) startIso = parsed.startTime;
        }
      } catch {}
    }
    let actualHours = found.actualHours;
    if (startIso) {
      const diffMs = new Date(now).getTime() - new Date(startIso).getTime();
      actualHours = Math.max(0.01, Number((diffMs / 3600000).toFixed(2)));
    }
    try {
      localStorage.removeItem(`turnexo_task_timer_${taskId}`);
    } catch {}
    upsertTaskOverride({
      ...found,
      status: 'completed',
      endTime: now,
      actualHours: actualHours || 1.5,
    });
    showToast('Limpieza completada con éxito.');
  };

  const handleAddIncident = (taskId: string, text: string, photoUrl?: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    upsertTaskOverride({
      ...found,
      incidents: [
        ...found.incidents,
        {
          id: `inc-${Date.now()}`,
          text,
          photoUrl,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    });
    showToast('Incidencia enviada al anfitrión.');
  };

  const handleRequestExtra = (reservationId: string, extra: PropertyExtra) => {
    const isLateCheckout = Boolean(extra.onlyWhenFreeNextDay);
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== reservationId) return r;
        const currentExtras = r.requestedExtras || [];
        return {
          ...r,
          lateCheckoutRequested: isLateCheckout ? true : r.lateCheckoutRequested,
          requestedExtras: currentExtras.includes(extra.id)
            ? currentExtras
            : [...currentExtras, extra.id],
        };
      })
    );
    showToast(`Solicitud de "${extra.title}" registrada.`);
  };

  const handleApproveLateCheckout = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    const prop = properties.find((p) => p.id === res?.propertyId);
    if (!res || !prop) return;

    const updatedRes: Reservation = {
      ...res,
      lateCheckoutRequested: false,
      lateCheckoutApproved: true,
      lateCheckoutTime: prop.lateCheckoutUntil,
      lateCheckoutPaidAmount: prop.lateCheckoutPrice,
    };

    setReservations((prev) => prev.map((r) => (r.id === reservationId ? updatedRes : r)));
    syncReservationToSupabase(updatedRes);

    showToast(
      `Late Check-out concedido. Hora de limpieza cambiada a las ${prop.lateCheckoutUntil}h.`
    );
  };

  const handleApproveExtra = (reservationId: string, extraId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;
    const currentApproved = res.approvedExtras || [];
    const updatedRes: Reservation = {
      ...res,
      approvedExtras: currentApproved.includes(extraId)
        ? currentApproved
        : [...currentApproved, extraId],
    };
    setReservations((prev) => prev.map((r) => (r.id === reservationId ? updatedRes : r)));
    syncReservationToSupabase(updatedRes);
    showToast('Extra confirmado por el anfitrión.');
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (properties.length <= 1) {
      showToast('Debes mantener al menos un alojamiento.');
      return;
    }
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setReservations((prev) => prev.filter((r) => r.propertyId !== propertyId));
    setTaskOverrides((prev) => prev.filter((t) => t.propertyId !== propertyId));
    deletePropertyFromSupabase(propertyId);
    showToast('Propiedad eliminada.');
  };

  const handleDeleteCleaner = (cleanerId: string) => {
    if (cleaners.length <= 1) {
      showToast('Debes mantener al menos una limpiadora.');
      return;
    }
    setCleaners((prev) => prev.filter((c) => c.id !== cleanerId));
    deleteCleanerFromSupabase(cleanerId);
    showToast('Limpiadora eliminada.');
  };

  const handleUpdateReservation = (updated: Reservation, toast?: string) => {
    setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    syncReservationToSupabase(updated);
    if (toast) showToast(toast);
  };

  const handleReportGuestIncident = (propertyId: string, reservationId: string, text: string) => {
    const found = tasks.find(
      (t) => t.reservationId === reservationId || t.propertyId === propertyId
    );
    if (found) {
      upsertTaskOverride({
        ...found,
        incidents: [
          ...found.incidents,
          {
            id: `inc-guest-${Date.now()}`,
            text: `[Huésped] ${text}`,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      });
    }
    showToast('Incidencia del huésped registrada y enviada a soporte.');
  };

  const handleUpdateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setTaskOverrides((prev) => prev.filter((t) => t.propertyId !== updated.id));
    if (hostAccount) syncPropertyToSupabase(hostAccount.id, updated);
    showToast(`Propiedad "${updated.name}" actualizada.`);
  };

  const applyPlanToProperties = (plan: HostAccount['plan']) => {
    const cleanings = plan !== 'module_guide';
    const guestGuide = plan !== 'module_cleanings';
    setProperties((prev) =>
      prev.map((p) => ({
        ...p,
        modulesEnabled: { cleanings, guestGuide },
      }))
    );
  };

  const handleAuthSuccess = (account: HostAccount) => {
    setHostAccount(account);
    localStorage.setItem(STORAGE_KEYS.host, JSON.stringify(account));
    if (isSupabaseConfigured && !account.id.startsWith('demo')) {
      setProperties((prev) => prev.filter((p) => !DEMO_PROPERTY_IDS.has(p.id)));
      setCleaners((prev) => prev.filter((c) => !DEMO_CLEANER_IDS.has(c.id)));
      setReservations((prev) => prev.filter((r) => !DEMO_RESERVATION_IDS.has(r.id)));
      setInvoices((prev) => prev.filter((inv) => !DEMO_INVOICE_IDS.has(inv.id)));
    }
    applyPlanToProperties(account.plan);
    syncHostToSupabase(account);
    navigate('/app', { kind: 'app' });
    showToast(`Bienvenido a Turnexo, ${account.fullName}.`);
  };

  const handleChangePlan = async (plan: HostAccount['plan']) => {
    if (!hostAccount) return;
    const updated = { ...hostAccount, plan };
    setHostAccount(updated);
    localStorage.setItem(STORAGE_KEYS.host, JSON.stringify(updated));
    applyPlanToProperties(plan);
    syncHostToSupabase(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.updateUser({
          data: { subscription_plan: plan },
        });
      } catch (err) {
        console.warn('[Turnexo] Error actualizando plan en supabase auth metadata:', err);
      }
    }

    const label =
      plan === 'plan_starter'
        ? 'Starter (1 Alojamiento · 0 €/mes)'
        : plan === 'plan_pro'
        ? 'Pro Fiscal (Hasta 5 Alojamientos · 19 €/mes)'
        : plan === 'plan_manager'
        ? 'Microgestora (Hasta 10 Alojamientos · 39 €/mes)'
        : 'Pack Completo';
    showToast(`Plan actualizado a: ${label}`);
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEYS.host);
    localStorage.removeItem(STORAGE_KEYS.properties);
    localStorage.removeItem(STORAGE_KEYS.reservations);
    localStorage.removeItem(STORAGE_KEYS.taskOverrides);
    setProperties(INITIAL_PROPERTIES);
    setReservations(INITIAL_RESERVATIONS);
    setTaskOverrides([]);
    showToast('Datos restaurados.');
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#141413] text-[#F6F4EE] font-mono text-xs font-bold px-4 py-3 shadow-2xl flex items-center gap-2 border border-[#C85A32]">
          <CheckCircle2 size={15} className="text-[#C85A32] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {route.kind === 'landing' && (
        <LandingPageView
          hostAccount={hostAccount}
          promoCode={promoCode}
          onNavigateToApp={(mode = 'register', plan = 'plan_starter') => {
            setAuthInitialMode(mode);
            setAuthInitialPlan(plan);
            navigate('/app', { kind: 'app' });
          }}
          onOpenGuestDemo={() => {
            const prop = properties[0];
            window.open(`/g/${prop.slug}?demo=1`, '_blank');
          }}
          onOpenCleanerDemo={() => {
            const c = cleaners[0];
            window.open(`/c/${c.magicToken}?demo=1`, '_blank');
          }}
          onOpenLegal={(tab = 'privacy') => setLegalModalTab(tab)}
        />
      )}

      {route.kind === 'app' && !hostAccount && (
        <AuthOnboardingView
          initialMode={authInitialMode}
          initialPlan={authInitialPlan}
          initialPromoCode={promoCode}
          onSuccess={handleAuthSuccess}
          onBackToLanding={() => navigate('/', { kind: 'landing' })}
        />
      )}

      {route.kind === 'app' && hostAccount && (
        <HostDashboardView
          hostAccount={hostAccount}
          onChangePlan={handleChangePlan}
          onActivateSubscription={() => {
            setHostAccount({ ...hostAccount, subscriptionStatus: 'active' });
            showToast('Suscripción Stripe activada correctamente.');
          }}
          onLogout={async () => {
            try {
              if (isSupabaseConfigured && supabase) {
                await supabase.auth.signOut();
              }
            } catch (err) {
              console.error('Error signing out from Supabase:', err);
            }
            localStorage.removeItem(STORAGE_KEYS.host);
            setHostAccount(null);
            navigate('/', { kind: 'landing' });
            showToast('Sesión cerrada correctamente.');
          }}
          properties={properties}
          cleaners={cleaners}
          reservations={reservations}
          tasks={tasks}
          invoices={invoices}
          fiscalProfile={fiscalProfile}
          onAddInvoice={handleAddInvoice}
          onAddInvoices={handleAddInvoices}
          onUpdateInvoice={handleUpdateInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onClearAllInvoices={handleClearAllInvoices}
          onKeepOnlyInvoices={handleKeepOnlyInvoices}
          onUpdateFiscalProfile={handleUpdateFiscalProfile}
          onImportIcalText={handleImportIcalText}
          onAddDirectReservation={handleAddDirectReservation}
          onSyncIcalUrl={handleSyncIcalUrl}
          onAssignCleaner={handleAssignCleaner}
          onUpdateTaskTimes={handleUpdateTaskTimes}
          onApproveLateCheckout={handleApproveLateCheckout}
          onApproveExtra={handleApproveExtra}
          onOpenCleanerPreview={(cleanerId) => {
            const c = cleaners.find((item) => item.id === cleanerId) || cleaners[0];
            setSelectedCleanerId(c.id);
            navigate(`/c/${c.magicToken}`, {
              kind: 'cleaner',
              token: c.magicToken,
              fromApp: true,
            });
          }}
          onOpenGuestPreview={(reservationId) => {
            const r = reservations.find((item) => item.id === reservationId) || reservations[0];
            const p = properties.find((item) => item.id === r.propertyId) || properties[0];
            setSelectedReservationId(r.id);
            navigate(`/g/${p.slug}`, { kind: 'guest', slug: p.slug, fromApp: true });
          }}
          onAddProperty={(newProp) => {
            setProperties((prev) => [...prev, newProp]);
            if (hostAccount) syncPropertyToSupabase(hostAccount.id, newProp);
            showToast(`Propiedad "${newProp.name}" creada.`);
          }}
          onUpdateProperty={handleUpdateProperty}
          onDeleteProperty={handleDeleteProperty}
          onAddCleaner={(newCleaner) => {
            setCleaners((prev) => [...prev, newCleaner]);
            if (hostAccount) syncCleanerToSupabase(hostAccount.id, newCleaner);
            showToast(`Enlace mágico /c/${newCleaner.magicToken} creado para ${newCleaner.name}.`);
          }}
          onDeleteCleaner={handleDeleteCleaner}
          onBackToLanding={() => navigate('/', { kind: 'landing' })}
          onResetDemo={handleResetDemo}
        />
      )}

      {route.kind === 'cleaner' && (
        <CleanerMagicView
          cleaners={cleaners}
          selectedCleanerId={
            cleaners.find((c) => c.magicToken === route.token)?.id || selectedCleanerId
          }
          onSelectCleaner={(id) => {
            const c = cleaners.find((item) => item.id === id) || cleaners[0];
            setSelectedCleanerId(c.id);
            navigate(`/c/${c.magicToken}${route.fromLanding ? '?demo=1' : ''}`, {
              kind: 'cleaner',
              token: c.magicToken,
              fromApp: route.fromApp,
              fromLanding: route.fromLanding,
            });
          }}
          tasks={tasks}
          properties={properties}
          onToggleChecklistItem={handleToggleChecklistItem}
          onAddPhoto={handleAddPhoto}
          onAddItemPhoto={handleAddItemPhoto}
          onDeleteItemPhoto={handleDeleteItemPhoto}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
          onAddIncident={handleAddIncident}
          onBackToApp={() =>
            route.fromApp
              ? navigate('/app', { kind: 'app' })
              : navigate('/', { kind: 'landing' })
          }
        />
      )}

      {route.kind === 'guest' && (
        <GuestGuidePortalView
          activePropertySlug={route.slug}
          properties={properties}
          reservations={reservations}
          selectedReservationId={selectedReservationId}
          isWhiteLabel={hostAccount?.plan === 'plan_pro' || hostAccount?.plan === 'plan_manager'}
          onSelectReservation={(resId) => {
            const r = reservations.find((item) => item.id === resId);
            const p = properties.find((item) => item.id === r?.propertyId);
            setSelectedReservationId(resId);
            if (p) {
              navigate(`/g/${p.slug}${route.fromLanding ? '?demo=1' : ''}`, {
                kind: 'guest',
                slug: p.slug,
                fromApp: route.fromApp,
                fromLanding: route.fromLanding,
              });
            }
          }}
          onRequestExtra={handleRequestExtra}
          onUpdateReservation={handleUpdateReservation}
          onReportGuestIncident={handleReportGuestIncident}
          onBackToApp={() =>
            route.fromApp
              ? navigate('/app', { kind: 'app' })
              : navigate('/', { kind: 'landing' })
          }
        />
      )}

      {route.kind === 'admin' && (
        <AdminMetricsView
          onBackToApp={() => navigate('/app', { kind: 'app' })}
          onBackToLanding={() => navigate('/', { kind: 'landing' })}
        />
      )}

      {/* Banner de Cookies UE / AEPD */}
      {route.kind === 'landing' && (
        <CookieBanner onOpenLegal={() => setLegalModalTab('privacy')} />
      )}

      {/* Modal Legal (Privacidad / Términos / Aviso Legal) */}
      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}
    </>
  );
}
