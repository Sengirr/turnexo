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
} from './lib/invoice';
import HostDashboardView from './components/HostDashboardView';
import CleanerMagicView from './components/CleanerMagicView';
import GuestGuidePortalView from './components/GuestGuidePortalView';
import LandingPageView from './components/LandingPageView';
import AuthOnboardingView from './components/AuthOnboardingView';
import AdminMetricsView from './components/AdminMetricsView';
import LegalModal from './components/LegalModal';
import CookieBanner from './components/CookieBanner';
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
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    loadStored(STORAGE_KEYS.reservations, INITIAL_RESERVATIONS)
  );
  const [taskOverrides, setTaskOverrides] = useState<CleaningTask[]>(() =>
    loadStored(STORAGE_KEYS.taskOverrides, INITIAL_TASK_OVERRIDES)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadStored(STORAGE_KEYS.invoices, INITIAL_INVOICES)
  );
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

  // Sincronización inicial y tiempo real con Supabase si está configurado en .env
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Detectar si venimos de un login con OAuth (Google)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !hostAccount) {
        const meta = session.user.user_metadata || {};
        const account: HostAccount = {
          id: session.user.id,
          email: session.user.email || 'usuario@gmail.com',
          fullName: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Anfitrión',
          companyName: meta.company_name || 'Mis Alojamientos',
          plan: meta.subscription_plan || 'plan_starter',
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        };
        handleAuthSuccess(account);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !hostAccount) {
        const meta = session.user.user_metadata || {};
        const account: HostAccount = {
          id: session.user.id,
          email: session.user.email || 'usuario@gmail.com',
          fullName: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Anfitrión',
          companyName: meta.company_name || 'Mis Alojamientos',
          plan: meta.subscription_plan || 'plan_starter',
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        };
        handleAuthSuccess(account);
      }
    });

    const fetchCloud = () => {
      loadWorkspaceFromSupabase().then((cloud) => {
        if (cloud.properties && cloud.properties.length > 0) setProperties(cloud.properties);
        if (cloud.cleaners && cloud.cleaners.length > 0) setCleaners(cloud.cleaners);
        if (cloud.reservations && cloud.reservations.length > 0) setReservations(cloud.reservations);
        if (cloud.tasks && cloud.tasks.length > 0) setTaskOverrides(cloud.tasks);
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

  const handleImportIcalText = (propertyId: string, icsText: string) => {
    const parsed = parseICalContent(icsText, propertyId);
    if (parsed.length === 0) {
      showToast('No se encontraron eventos VEVENT en el calendario iCal.');
      return;
    }
    setReservations((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const newOnes = parsed.filter((r) => !existingIds.has(r.id));
      return [...prev, ...newOnes];
    });
    showToast(`${parsed.length} reservas procesadas del iCal.`);
  };

  const handleSyncIcalUrl = async (propertyId: string, url: string, silent = false) => {
    try {
      const res = await fetch(`/api/fetch-ical?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Error');
      const icsText = await res.text();
      handleImportIcalText(propertyId, icsText);
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
    if (route.kind === 'landing') return;
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

  const handleToggleChecklistItem = (taskId: string, itemId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
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

  const handleCompleteTask = (taskId: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    upsertTaskOverride({ ...found, status: 'completed' });
    showToast('Limpieza registrada como completada.');
  };

  const handleAddIncident = (taskId: string, text: string) => {
    const found = tasks.find((t) => t.id === taskId);
    if (!found) return;
    upsertTaskOverride({
      ...found,
      incidents: [
        ...found.incidents,
        {
          id: `inc-${Date.now()}`,
          text,
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
    applyPlanToProperties(account.plan);
    syncHostToSupabase(account);
    navigate('/app', { kind: 'app' });
    showToast(`Bienvenido a Turnexo, ${account.fullName}.`);
  };

  const handleChangePlan = (plan: HostAccount['plan']) => {
    if (!hostAccount) return;
    const updated = { ...hostAccount, plan };
    setHostAccount(updated);
    applyPlanToProperties(plan);
    syncHostToSupabase(updated);
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
          onUpdateFiscalProfile={handleUpdateFiscalProfile}
          onImportIcalText={handleImportIcalText}
          onSyncIcalUrl={handleSyncIcalUrl}
          onAssignCleaner={handleAssignCleaner}
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
