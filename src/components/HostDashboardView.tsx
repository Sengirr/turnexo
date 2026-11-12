import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Home,
  Link2,
  Plus,
  QrCode,
  RefreshCw,
  Users,
  User,
  CheckCircle2,
  Clock,
  FileCode2,
  Printer,
  Globe,
  Settings,
  ArrowLeft,
  RotateCcw,
  Search,
  Filter,
  Download,
  LayoutGrid,
  List,
  MessageSquare,
  DollarSign,
  CheckCheck,
  Send,
  FileSpreadsheet,
  Camera,
  LogOut,
  Mail,
  Lock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Cleaner, CleaningTask, Property, Reservation, DEFAULT_IVI_CHECKLIST } from '../lib/icalParser';
import { SAMPLE_ICAL_SNIPPET } from '../lib/mockData';
import { HostAccount, isSupabaseConfigured, STRIPE_PAYMENT_LINKS, getStripePaymentLink } from '../lib/supabase';
import PrintableQrPosterModal from './PrintableQrPosterModal';
import PropertyCustomizerModal from './PropertyCustomizerModal';
import InvoicePrintModal from './InvoicePrintModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import FiscalProfileModal from './FiscalProfileModal';
import { CreditCard, ShieldCheck, FileText, Building2 } from 'lucide-react';
import {
  computeQuarterSummaries,
  DEFAULT_HOST_FISCAL_PROFILE,
  exportInvoicesToCsv,
  HostFiscalProfile,
  INITIAL_INVOICES,
  Invoice,
} from '../lib/invoice';
import { DASHBOARD_TRANSLATIONS, DashboardLanguage } from '../lib/dashboardTranslations';

const CHECKOUT_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'
];

const CHECKIN_HOURS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '19:00', '20:00'
];

interface Props {
  hostAccount?: HostAccount | null;
  onChangePlan?: (plan: HostAccount['plan']) => void;
  onActivateSubscription?: () => void;
  onLogout?: () => void;
  properties: Property[];
  cleaners: Cleaner[];
  reservations: Reservation[];
  tasks: CleaningTask[];
  invoices?: Invoice[];
  fiscalProfile?: HostFiscalProfile;
  onAddInvoice?: (inv: Invoice) => void;
  onUpdateFiscalProfile?: (prof: HostFiscalProfile) => void;
  onImportIcalText: (propertyId: string, icsText: string) => void;
  onSyncIcalUrl: (propertyId: string, url: string) => Promise<void>;
  onAssignCleaner: (taskId: string, cleanerId: string) => void;
  onApproveLateCheckout: (reservationId: string) => void;
  onApproveExtra?: (reservationId: string, extraId: string) => void;
  onOpenCleanerPreview: (cleanerId: string) => void;
  onOpenGuestPreview: (reservationId: string) => void;
  onAddProperty: (prop: Property) => void;
  onUpdateProperty: (prop: Property) => void;
  onDeleteProperty?: (id: string) => void;
  onAddCleaner?: (cleaner: Cleaner) => void;
  onDeleteCleaner?: (id: string) => void;
  onBackToLanding: () => void;
  onResetDemo: () => void;
}

type BackofficeSection = 'overview' | 'schedule' | 'invoices' | 'team' | 'billing';

export default function HostDashboardView({
  hostAccount,
  onChangePlan,
  onActivateSubscription,
  onLogout,
  properties,
  cleaners,
  reservations,
  tasks,
  invoices,
  fiscalProfile,
  onAddInvoice,
  onUpdateFiscalProfile,
  onImportIcalText,
  onSyncIcalUrl,
  onAssignCleaner,
  onApproveLateCheckout,
  onApproveExtra,
  onOpenCleanerPreview,
  onOpenGuestPreview,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onAddCleaner,
  onDeleteCleaner,
  onBackToLanding,
  onResetDemo,
}: Props) {
  const [section, setSection] = useState<BackofficeSection>('overview');
  const [cleaningsSubTab, setCleaningsSubTab] = useState<'schedule' | 'team'>('schedule');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newCleanerName, setNewCleanerName] = useState('');
  const [newCleanerPhone, setNewCleanerPhone] = useState('+34 ');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showIcalModal, setShowIcalModal] = useState(false);
  const [targetPropertyId, setTargetPropertyId] = useState(properties[0]?.id || 'prop-1');
  const [icsInput, setIcsInput] = useState(SAMPLE_ICAL_SNIPPET);
  const [liveIcalUrl, setLiveIcalUrl] = useState('');
  const [syncingUrl, setSyncingUrl] = useState(false);
  const [showNewPropModal, setShowNewPropModal] = useState(false);
  const [qrModalProperty, setQrModalProperty] = useState<Property | null>(null);
  const [customizingProperty, setCustomizingProperty] = useState<Property | null>(null);
  const [inspectingTaskPhotos, setInspectingTaskPhotos] = useState<CleaningTask | null>(null);

  // Estados de Facturación & IVA 10%
  const currentMonth = new Date().getMonth() + 1;
  const initialQ: '1T' | '2T' | '3T' | '4T' =
    currentMonth <= 3 ? '1T' : currentMonth <= 6 ? '2T' : currentMonth <= 9 ? '3T' : '4T';
  const [selectedQuarter, setSelectedQuarter] = useState<'1T' | '2T' | '3T' | '4T'>(initialQ);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [preselectedResIdForInvoice, setPreselectedResIdForInvoice] = useState<string | undefined>(undefined);
  const [showFiscalProfileModal, setShowFiscalProfileModal] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoicePropertyFilter, setInvoicePropertyFilter] = useState('all');

  const allInvoices = invoices || INITIAL_INVOICES;
  const currentFiscalProfile = fiscalProfile || DEFAULT_HOST_FISCAL_PROFILE;

  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropWhatsapp, setNewPropWhatsapp] = useState('');
  const [newPropWifiSsid, setNewPropWifiSsid] = useState('');
  const [newPropWifiPass, setNewPropWifiPass] = useState('');
  const [newPropDoorCode, setNewPropDoorCode] = useState('');
  const [newPropIcal, setNewPropIcal] = useState('');
  const [newPropCheckIn, setNewPropCheckIn] = useState('15:00');
  const [newPropCheckOut, setNewPropCheckOut] = useState('11:00');
  const [newPropCleaningFee, setNewPropCleaningFee] = useState<number | ''>('');
  const [newPropCleanerId, setNewPropCleanerId] = useState('');

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Idioma del Panel de Control (por defecto en inglés a petición del anfitrión, conmutador ES / EN)
  const [lang, setLang] = useState<DashboardLanguage>(() => {
    try {
      const saved = localStorage.getItem('turnexo_dashboard_lang');
      if (saved === 'es' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });
  const t = DASHBOARD_TRANSLATIONS[lang] || DASHBOARD_TRANSLATIONS.en;

  // Filtros y modos de visualización avanzados (Cuadrante por Días, Tabla o Timeline como en IVI ERP)
  const [scheduleView, setScheduleView] = useState<'list' | 'table' | 'timeline'>('list');
  const [schedulePropertyFilter, setSchedulePropertyFilter] = useState('all');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | 'urgent' | 'late' | 'completed' | 'pending'>('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [copiedSettlementCleanerId, setCopiedSettlementCleanerId] = useState<string | null>(null);
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);
  const [showStripeNoticeModal, setShowStripeNoticeModal] = useState(false);
  const [planLimitReason, setPlanLimitReason] = useState<{
    title: string;
    desc: string;
    targetPlan: 'plan_pro' | 'plan_manager';
  } | null>(null);

  const rawPlan = hostAccount?.plan || 'plan_starter';
  const isManager = rawPlan === 'plan_manager';
  const isPro = rawPlan === 'plan_pro';
  const isStarter = !isPro && !isManager;
  const currentPlan = isManager ? 'plan_manager' : isPro ? 'plan_pro' : 'plan_starter';

  const isCommunityVip = Boolean(
    hostAccount?.specialAccess === 'comunidad' ||
    (hostAccount?.promoCode && /comunidad|anfitriones|iva|whatsapp|beta/i.test(hostAccount.promoCode))
  );
  const hasFiscalAccess = isPro || isManager || isCommunityVip;

  const maxAllowedProperties = isManager ? 10 : isPro ? 5 : 1;
  const maxAllowedCleaners = isManager ? 99 : isPro ? 2 : 1;

  const isSubscriptionActive = hostAccount?.subscriptionStatus === 'active';
  const trialDaysRemaining = useMemo(() => {
    if (!hostAccount?.trialEndsAt) return 14;
    const diff = new Date(hostAccount.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [hostAccount?.trialEndsAt]);

  const handleOpenNewPropModal = () => {
    if (properties.length >= maxAllowedProperties) {
      setPlanLimitReason({
        title: 'Has alcanzado el límite de alojamientos',
        desc: isStarter
          ? `El Plan Starter incluye 1 alojamiento gratuito (actualmente tienes ${properties.length} alojamientos registrados). Para gestionar hasta 5 alojamientos con sincronización iCal y facturación fiscal, actualiza a Pro Fiscal.`
          : `Tu plan permite hasta ${maxAllowedProperties} alojamientos. Para ampliar tu cartera hasta 10 alojamientos, actualiza al Plan Microgestora.`,
        targetPlan: isStarter ? 'plan_pro' : 'plan_manager',
      });
      return;
    }
    setShowNewPropModal(true);
  };

  const urgentCount = tasks.filter((t) => t.sameDayCheckIn).length;
  const upsellRevenue = reservations.reduce(
    (sum, r) => sum + (r.lateCheckoutApproved ? r.lateCheckoutPaidAmount || 35 : 0),
    0
  );

  // Filtro reactivo del cuadrante de salidas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (schedulePropertyFilter !== 'all' && task.propertyId !== schedulePropertyFilter) return false;
      const prop = properties.find((p) => p.id === task.propertyId);
      const res = reservations.find((r) => r.id === task.reservationId);
      const cleaner = cleaners.find((c) => c.id === task.cleanerId);

      if (scheduleStatusFilter === 'urgent' && !task.sameDayCheckIn) return false;
      if (scheduleStatusFilter === 'late' && !task.lateCheckoutActive && !res?.lateCheckoutRequested) return false;
      if (scheduleStatusFilter === 'completed' && task.status !== 'completed') return false;
      if (scheduleStatusFilter === 'pending' && task.status === 'completed') return false;

      if (scheduleSearch.trim()) {
        const q = scheduleSearch.toLowerCase();
        const matchProp = prop?.name.toLowerCase().includes(q);
        const matchGuest = res?.guestName.toLowerCase().includes(q);
        const matchCleaner = cleaner?.name.toLowerCase().includes(q);
        if (!matchProp && !matchGuest && !matchCleaner) return false;
      }
      return true;
    });
  }, [tasks, schedulePropertyFilter, scheduleStatusFilter, scheduleSearch, properties, reservations, cleaners]);

  // Enviar parte de limpieza por WhatsApp al personal de limpieza
  const sendTaskWhatsApp = (task: CleaningTask) => {
    const cleaner = cleaners.find((c) => c.id === task.cleanerId);
    const prop = properties.find((p) => p.id === task.propertyId);
    if (!cleaner || !prop) return;
    const phoneClean = cleaner.phone.replace(/[^0-9]/g, '');
    const cleanerUrl = `${window.location.origin}/c/${cleaner.magicToken}`;
    const msg = `Hola ${cleaner.name.split(' ')[0]}!\n` +
      `📋 *Limpieza Programada - ${task.date}*\n` +
      `🏠 *Alojamiento:* ${prop.name}\n` +
      `📍 *Dirección:* ${prop.address}\n` +
      `⏰ *Hora limpieza:* ${task.scheduledCleaningTime}h\n` +
      (task.sameDayCheckIn ? `🔥 *URGENTE:* Entrada nuevo huésped hoy a las ${task.nextCheckInTime}h\n` : '') +
      `🔑 *Código cajetín:* ${prop.doorCode}\n` +
      `👉 *Tu enlace directo y checklist:* ${cleanerUrl}`;
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Copiar resumen de liquidación financiera para pago
  const copyCleanerSettlement = (cleaner: Cleaner) => {
    const cleanerTasks = tasks.filter((t) => t.cleanerId === cleaner.id);
    const totalFee = cleanerTasks.reduce((sum, t) => {
      const prop = properties.find((p) => p.id === t.propertyId);
      return sum + (prop?.cleaningFee || 40);
    }, 0);
    const lines = [
      `📋 LIQUIDACIÓN DE LIMPIEZAS · TURNEXO`,
      `Personal: ${cleaner.name} (${cleaner.phone})`,
      `Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`,
      `Total servicios: ${cleanerTasks.length}`,
      `Total devengado: ${totalFee} €`,
      ``,
      `DETALLE DE LIMPIEZAS:`,
      ...cleanerTasks.map((t, idx) => {
        const p = properties.find((prop) => prop.id === t.propertyId);
        const res = reservations.find((r) => r.id === t.reservationId);
        return `${idx + 1}. [${t.date}] ${p?.name || 'Alojamiento'} - ${p?.cleaningFee || 40} € (${t.status === 'completed' ? 'Completada ✓' : 'Pendiente'}) [Huésped: ${res?.guestName || 'Reserva'}]`;
      }),
      ``,
      `Transferencia / Bizum pendiente: ${totalFee} €`
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedSettlementCleanerId(cleaner.id);
    setTimeout(() => setCopiedSettlementCleanerId(null), 2500);
  };

  // Descargar liquidación en CSV para contabilidad
  const downloadCleanerSettlementCsv = (cleaner: Cleaner) => {
    const cleanerTasks = tasks.filter((t) => t.cleanerId === cleaner.id);
    const rows = [
      ['Fecha', 'Alojamiento', 'Huesped', 'Canal', 'Hora Limpieza', 'Pago Limpiadora EUR', 'Estado', 'Fotos'],
      ...cleanerTasks.map((t) => {
        const p = properties.find((prop) => prop.id === t.propertyId);
        const res = reservations.find((r) => r.id === t.reservationId);
        return [
          t.date,
          `"${p?.name || ''}"`,
          `"${res?.guestName || ''}"`,
          res?.source || 'iCal',
          `${t.scheduledCleaningTime}h`,
          p?.cleaningFee || 40,
          t.status,
          t.photosUploaded.length,
        ];
      }),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `turnexo_liquidacion_${cleaner.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (properties.length >= maxAllowedProperties) {
      handleOpenNewPropModal();
      return;
    }
    if (!newPropName.trim()) return;
    const id = `prop-${Date.now()}`;
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const baseSlug = newPropName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = baseSlug ? `${baseSlug}-${uniqueSuffix}` : `prop-${uniqueSuffix}`;

    onAddProperty({
      id,
      name: newPropName.trim(),
      slug: slug || id,
      address: newPropAddress.trim() || 'Dirección no indicada',
      hostWhatsapp: newPropWhatsapp.trim() || '+34 600 00 00 00',
      googleMapsUrl: 'https://maps.google.com',
      airbnbIcalUrl: newPropIcal.trim(),
      bookingIcalUrl: '',
      defaultCleanerId: newPropCleanerId || (cleaners[0]?.id || 'cl-1'),
      cleaningFee: newPropCleaningFee === '' ? 0 : Number(newPropCleaningFee),
      checkInTime: newPropCheckIn || '15:00',
      checkOutTime: newPropCheckOut || '11:00',
      lateCheckoutPrice: 35,
      lateCheckoutUntil: '17:00',
      wifiSsid: newPropWifiSsid.trim(),
      wifiPassword: newPropWifiPass.trim(),
      doorCode: newPropDoorCode.trim(),
      checkInInstructions: 'Introduce el código en el cajetín junto a la puerta principal.',
      videos: [
        {
          id: `vid-${Date.now()}-1`,
          title: 'Cómo entrar al alojamiento y recoger las llaves',
          category: 'checkin',
          url: 'https://www.youtube.com/watch?v=QfDf3DJVdMw',
        },
        {
          id: `vid-${Date.now()}-2`,
          title: 'Home Tour del Alojamiento',
          category: 'hometour',
          url: 'https://www.youtube.com/watch?v=M0PNnOe0do8',
        },
        {
          id: `vid-${Date.now()}-3`,
          title: 'Mando del Aire Acondicionado',
          category: 'appliance',
          url: 'https://www.youtube.com/watch?v=IsEaaEf6ALs',
        },
        {
          id: `vid-${Date.now()}-4`,
          title: 'Vitrocerámica y Cocina',
          category: 'appliance',
          url: 'https://www.youtube.com/watch?v=lVo8BU0aP6Q',
        },
      ],
      extras: [
        {
          id: `ext-${Date.now()}`,
          title: 'Late Check-out hasta las 17:00h',
          description: 'Salida por la tarde sin prisas sujeta a disponibilidad.',
          price: 35,
          priceUnit: 'reserva',
          icon: 'clock',
          onlyWhenFreeNextDay: true,
          active: true,
        },
      ],
      houseRules: ['No fumar dentro del alojamiento', 'Respetar el descanso de los vecinos a partir de las 23:00h'],
      appliancesGuide:
        'Aire acondicionado con mando en el salón. Cafetera de cápsulas disponible.',
      localRecommendations: ['Supermercado y farmacia a menos de 200 metros.'],
      customChecklist: JSON.parse(JSON.stringify(DEFAULT_IVI_CHECKLIST)),
      departureChecklist: [
        'Apagar luces y climatización',
        'Tirar la basura en los contenedores',
        'Dejar las llaves en el cajetín o sobre la mesa',
        'Cerrar bien las ventanas y la puerta principal',
      ],
      requireVideoToUnlockCodes: true,
      lastSyncedAt: 'Sin sincronizar aún',
      modulesEnabled: {
        cleanings: true,
        guestGuide: true,
      },
    });

    setNewPropName('');
    setNewPropAddress('');
    setNewPropWhatsapp('');
    setNewPropIcal('');
    setNewPropWifiSsid('');
    setNewPropWifiPass('');
    setNewPropDoorCode('');
    setNewPropCheckIn('15:00');
    setNewPropCheckOut('11:00');
    setNewPropCleaningFee('');
    setNewPropCleanerId('');
    setShowNewPropModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row overflow-x-hidden font-sans">
      {/* BARRA SUPERIOR PARA MÓVIL */}
      <div className="lg:hidden bg-slate-900 text-slate-100 px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            TX
          </div>
          <span className="font-bold text-base tracking-tight text-white">Turnexo</span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
            {section === 'overview'
              ? t.nav.overview
              : section === 'schedule' || section === 'team'
              ? t.nav.schedule
              : section === 'invoices'
              ? t.nav.invoices
              : t.nav.billing}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de idioma ES / EN móvil */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => {
                setLang('es');
                try { localStorage.setItem('turnexo_dashboard_lang', 'es'); } catch {}
              }}
              className={`px-2 py-0.5 rounded transition ${
                lang === 'es' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => {
                setLang('en');
                try { localStorage.setItem('turnexo_dashboard_lang', 'en'); } catch {}
              }}
              className={`px-2 py-0.5 rounded transition ${
                lang === 'en' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white p-2 rounded-lg border border-rose-800/40 transition"
              title={t.nav.logout}
            >
              <LogOut size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
          >
            {mobileMenuOpen ? t.nav.close : t.nav.menu}
          </button>
        </div>
      </div>

      {/* BARRA LATERAL IZQUIERDA MODERNA */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-64 bg-slate-900 text-slate-200 shrink-0 flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800`}
      >
        <div className="p-6 space-y-7">
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                TX
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block leading-none text-white">
                  Turnexo
                </span>
                <span className="text-xs text-orange-400 font-medium tracking-wide">
                  {t.nav.controlPanel}
                </span>
              </div>
            </div>

            {/* Selector de idioma ES / EN Desktop */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setLang('es');
                  try { localStorage.setItem('turnexo_dashboard_lang', 'es'); } catch {}
                }}
                className={`px-2 py-0.5 rounded transition ${
                  lang === 'es' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Cambiar a Español"
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => {
                  setLang('en');
                  try { localStorage.setItem('turnexo_dashboard_lang', 'en'); } catch {}
                }}
                className={`px-2 py-0.5 rounded transition ${
                  lang === 'en' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                EN
              </button>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'overview' as const, label: t.nav.overview, icon: Home },
              { id: 'schedule' as const, label: t.nav.schedule, icon: Calendar },
              {
                id: 'invoices' as const,
                label: t.nav.invoices,
                icon: FileText,
                badge: isCommunityVip && isStarter ? 'COMUNIDAD' : isStarter ? 'PRO' : undefined,
              },
              { id: 'billing' as const, label: t.nav.billing, icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;
              const active = section === item.id || (item.id === 'schedule' && section === 'team');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition ${
                    active
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {'badge' in item && item.badge && (
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                        item.id === 'invoices' && isStarter && !isCommunityVip
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800 space-y-4 text-xs">
          {hostAccount && (
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate min-w-0">
                  <span className="font-bold text-white text-xs block truncate">
                    {hostAccount.fullName || 'Anfitrión'}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate" title={hostAccount.email}>
                    {hostAccount.email || (hostAccount.companyName && hostAccount.companyName !== 'Mis Alojamientos' ? hostAccount.companyName : '')}
                  </span>
                </div>
                {isSubscriptionActive ? (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold shrink-0 rounded-full border border-emerald-500/30">
                    {t.nav.activeSubscription}
                  </span>
                ) : isStarter ? (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-slate-700/80 text-slate-300 font-bold shrink-0 rounded-full border border-slate-600">
                    {t.nav.freePlan}
                  </span>
                ) : trialDaysRemaining > 0 ? (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold shrink-0 rounded-full border border-emerald-500/30">
                    {lang === 'en' ? `Trial (${trialDaysRemaining}d)` : `Prueba (${trialDaysRemaining}d)`}
                  </span>
                ) : (
                  <span className="text-[10px] uppercase px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold shrink-0 rounded-full border border-rose-500/30">
                    {lang === 'en' ? 'Trial Expired' : 'Prueba Caducada'}
                  </span>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-700/70 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{lang === 'en' ? 'Active plan:' : 'Plan activo:'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSection('billing');
                    setMobileMenuOpen(false);
                  }}
                  className="font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition"
                  title={lang === 'en' ? 'Manage plan and subscription' : 'Gestionar plan y suscripción'}
                >
                  <span>
                    {hostAccount.plan === 'plan_manager'
                      ? 'Microgestora (10)'
                      : hostAccount.plan === 'plan_pro'
                      ? 'Pro Fiscal (5)'
                      : 'Starter (1)'}
                  </span>
                  <span className="text-[10px]">⚙</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-1">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/50 rounded-xl flex items-center gap-2.5 transition"
              >
                <LogOut size={14} className="text-rose-400" />
                <span>{t.nav.logout}</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Franja de Métricas Operativas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2 hover:border-slate-300 transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {lang === 'en' ? 'Active Properties (iCal)' : 'Alojamientos Activos (iCal)'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {properties.length}
                <span className="text-base font-normal text-slate-400"> / {maxAllowedProperties}</span>
              </span>
              {properties.filter((p) => Boolean(p.airbnbIcalUrl?.trim() || p.bookingIcalUrl?.trim())).length > 0 ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                  ● {properties.filter((p) => Boolean(p.airbnbIcalUrl?.trim() || p.bookingIcalUrl?.trim())).length === properties.length
                    ? (lang === 'en' ? 'Synced' : 'Sincronizados')
                    : `${properties.filter((p) => Boolean(p.airbnbIcalUrl?.trim() || p.bookingIcalUrl?.trim())).length} iCal`}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                  ○ {lang === 'en' ? 'Manual mode' : 'Modo manual'}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2 hover:border-slate-300 transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {lang === 'en' ? "Today's Cleanings" : 'Limpiezas Hoy'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-orange-600 tracking-tight">
                {urgentCount}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2 hover:border-slate-300 transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {lang === 'en' ? 'Extra Revenue' : 'Ingresos por Extras'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                {upsellRevenue} €
              </span>
            </div>
          </div>
        </div>

        {/* VISTA 1: ALOJAMIENTOS Y PERSONALIZACIÓN DE GUÍA */}
        {section === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {t.overview.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                  {t.overview.title}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.overview.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowIcalModal(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm"
                >
                  <RefreshCw size={14} className="text-orange-600" />
                  <span>{lang === 'en' ? 'Sync iCal' : 'Sincronizar iCal'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewPropModal}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>{t.overview.newPropertyBtn}</span>
                </button>
              </div>
            </div>

            {properties.length > maxAllowedProperties && (
              <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">
                      Límite de alojamientos superado ({properties.length} / {maxAllowedProperties})
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Tu plan {isStarter ? 'Starter gratuito' : 'actual'} incluye {maxAllowedProperties} alojamiento{maxAllowedProperties > 1 ? 's' : ''}. Los alojamientos que superan el cupo se encuentran en pausa. Actualiza tu suscripción para desbloquearlos y sincronizar sus calendarios.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlanLimitReason({
                      title: 'Desbloquea todos tus alojamientos',
                      desc: `Tienes ${properties.length} alojamientos registrados y tu plan actual solo permite ${maxAllowedProperties}. Actualiza a Pro Fiscal para gestionarlos todos sin interrupciones.`,
                      targetPlan: isStarter ? 'plan_pro' : 'plan_manager',
                    });
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm shrink-0 whitespace-nowrap"
                >
                  Actualizar a Pro Fiscal
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {properties.map((prop, idx) => {
                const isPaused = idx >= maxAllowedProperties;
                const cleaner = cleaners.find((c) => c.id === prop.defaultCleanerId);
                const propReservations = reservations.filter((r) => r.propertyId === prop.id);
                const publicGuideUrl = `${window.location.origin}/g/${prop.slug}`;
                const hasIcalConnected = Boolean(
                  (prop.airbnbIcalUrl && prop.airbnbIcalUrl.trim().length > 0) ||
                  (prop.bookingIcalUrl && prop.bookingIcalUrl.trim().length > 0)
                );

                return (
                  <div
                    key={prop.id}
                    className={`border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition ${
                      isPaused
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            {isPaused ? (
                              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                                <Lock size={12} /> {lang === 'en' ? 'Paused by plan limit' : 'Pausado por límite de plan'}
                              </span>
                            ) : hasIcalConnected ? (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                                ● {lang === 'en' ? 'iCal Connected' : 'iCal Conectado'}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                                ○ {lang === 'en' ? 'No iCal' : 'Sin iCal'}
                              </span>
                            )}
                            <span className="text-slate-400 text-xs">·</span>
                            <span className="text-xs text-slate-500">
                              {isPaused
                                ? (lang === 'en' ? 'Requires Pro Fiscal' : 'Requiere Pro Fiscal')
                                : hasIcalConnected
                                ? (prop.lastSyncedAt || (lang === 'en' ? 'Synced' : 'Sincronizado'))
                                : (lang === 'en' ? 'Manual mode' : 'Sin sincronizar')}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
                            {prop.name}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">{prop.address}</p>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                            {t.overview.baseSchedule}
                          </span>
                          <span className="font-semibold text-slate-800 bg-slate-100 rounded-md px-2 py-0.5 inline-block mt-1">
                            IN {prop.checkInTime} · OUT {prop.checkOutTime}
                          </span>
                        </div>
                      </div>

                      {/* Resumen operativo de este alojamiento */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                            {t.overview.cleaningStaff}
                          </span>
                          <span className="font-semibold text-slate-900 mt-1 block truncate">
                            {cleaner?.name || t.overview.noCleaner}
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                            {t.overview.guestGuide}
                          </span>
                          <span className="font-semibold text-slate-900 mt-1 block truncate">
                            {prop.videos?.length || 0} {t.overview.videosCount} · {prop.extras?.filter((e) => e.active).length || 0} {t.overview.extrasCount}
                          </span>
                        </div>
                      </div>

                      {/* URL pública de la Guía del Huésped */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="truncate min-w-0 flex-1">
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                            {t.overview.guideUrlLabel}
                          </span>
                          <span className="font-mono text-xs text-slate-700 truncate block mt-0.5">
                            {publicGuideUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyLink(publicGuideUrl, `guide-${prop.id}`)}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                          >
                            {copiedId === `guide-${prop.id}` ? `✓ ${t.overview.copied}` : t.overview.copyUrl}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const tpl = `🇪🇸 ¡Hola! Aquí tienes la guía interactiva de tu alojamiento (${prop.name}) con el vídeo paso a paso para entrar, los códigos de acceso y el WiFi:\n👉 ${publicGuideUrl}\n\n🇬🇧 Hi! Here is your interactive guest guide (${prop.name}) with the step-by-step check-in video, door codes and WiFi:\n👉 ${publicGuideUrl}`;
                              copyLink(tpl, `tpl-${prop.id}`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                          >
                            {copiedId === `tpl-${prop.id}`
                              ? `✓ ${t.overview.copied}`
                              : t.overview.whatsappTemplate}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Acciones del alojamiento */}
                    {isPaused ? (
                      <div className="bg-amber-50 border-t border-amber-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-amber-900 font-medium">
                          <Lock size={14} className="text-amber-700 shrink-0" />
                          <span>Alojamiento en pausa ({idx + 1} de {maxAllowedProperties} permitidos en {isStarter ? 'Starter' : 'tu plan'}).</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {onDeleteProperty && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar ${prop.name} para mantenerte dentro de tu cupo?`)) {
                                  onDeleteProperty(prop.id);
                                }
                              }}
                              className="text-slate-500 hover:text-red-600 font-semibold px-2 py-1 transition"
                            >
                              Eliminar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPlanLimitReason({
                                title: 'Activa este alojamiento',
                                desc: `El Plan Starter incluye 1 alojamiento gratuito. Para reactivar "${prop.name}" y sincronizar sus limpiezas con Airbnb o Booking, actualiza al Plan Pro Fiscal.`,
                                targetPlan: 'plan_pro',
                              });
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs"
                          >
                            Activar con Pro Fiscal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/70 border-t border-slate-100 p-3 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setCustomizingProperty(prop)}
                          className="bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                        >
                          <Settings size={13} className="text-orange-400" />
                          <span>{t.overview.customizeBtn}</span>
                        </button>

                        <a
                          href={`/g/${prop.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition text-xs font-medium"
                        >
                          <ExternalLink size={13} />
                          <span>{t.overview.viewGuideBtn}</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setQrModalProperty(prop)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition font-semibold"
                        >
                          <Printer size={13} />
                          <span>{t.overview.qrPosterBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 2: OPERATIVA DE SALIDAS, LIMPIEZAS Y EQUIPO */}
        {(section === 'schedule' || section === 'team') && (
          <div className="space-y-6 pt-1">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  {t.schedule.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                  {cleaningsSubTab === 'schedule'
                    ? (lang === 'en' ? 'Check-outs, Cleaning Turns & Late Check-out' : 'Cuadrante de Salidas, Limpiezas y Late Check-out')
                    : (lang === 'en' ? 'Cleaning Staff, Magic Mobile Links & Rates' : 'Personal de Limpieza, Enlaces Móviles y Tarifas')}
                </h2>
              </div>

              {/* Sub-pestañas: Cuadrante vs Equipo */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCleaningsSubTab('schedule')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition ${
                    cleaningsSubTab === 'schedule'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={14} className="text-orange-600" />
                  <span>{t.schedule.tabSchedule} ({filteredTasks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCleaningsSubTab('team')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 transition ${
                    cleaningsSubTab === 'team'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} className="text-emerald-600" />
                  <span>{t.schedule.tabTeam} ({cleaners.length})</span>
                </button>
              </div>
            </div>

            {cleaningsSubTab === 'schedule' ? (
              <div className="space-y-4">
                {/* Botones de Cambio de Vista: Tabla vs Timeline Semanal */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setScheduleView('list')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        scheduleView === 'list'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Calendar size={14} className="text-orange-600" />
                      <span>Cuadrante por Días</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleView('table')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        scheduleView === 'table'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List size={14} />
                      <span>Vista Tabla</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleView('timeline')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                        scheduleView === 'timeline'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid size={14} />
                      <span>Matriz Semanal</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Filtros y Búsqueda */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    {/* Buscador */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={scheduleSearch}
                        onChange={(e) => setScheduleSearch(e.target.value)}
                        placeholder="Buscar por huésped, alojamiento o limpiadora..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                      {scheduleSearch && (
                        <button
                          type="button"
                          onClick={() => setScheduleSearch('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filtro Propiedad */}
                    <select
                      value={schedulePropertyFilter}
                      onChange={(e) => setSchedulePropertyFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      <option value="all">Todos los alojamientos ({properties.length})</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Estado */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'all', label: 'Todos' },
                        { id: 'urgent', label: '🔥 Mismo Día' },
                        { id: 'late', label: '⏱ Late Out' },
                        { id: 'pending', label: '⏳ Pendientes' },
                        { id: 'completed', label: '✓ Hechas' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setScheduleStatusFilter(st.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                          scheduleStatusFilter === st.id
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Renderizado de Vista: Tabla o Timeline */}
                {filteredTasks.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-sm">
                    <p className="font-bold text-sm text-slate-900">No hay tareas que coincidan con los filtros</p>
                    <p className="text-xs text-slate-500">Prueba a limpiar la búsqueda o cambiar el filtro de estado.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleSearch('');
                        setSchedulePropertyFilter('all');
                        setScheduleStatusFilter('all');
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 underline pt-2"
                    >
                      Restablecer filtros
                    </button>
                  </div>
                ) : scheduleView === 'list' ? (
                  /* VISTA CUADRANTE POR DÍAS (ESTILO IVI ERP DailyCleaningListView) */
                  <div className="space-y-6">
                    {Array.from(new Set(filteredTasks.map((t) => t.date))).sort().map((dateStr) => {
                      const dayTasks = filteredTasks.filter((t) => t.date === dateStr);
                      const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                      const [y, m, d] = dateStr.split('-');
                      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                      const formattedDate = dateObj.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      });
                      const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

                      return (
                        <div key={dateStr} className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                          {/* Cabecera del Día */}
                          <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Calendar size={16} className={isToday ? "text-emerald-600" : "text-slate-400"} />
                              <span className="text-sm font-extrabold text-slate-900">
                                {isToday ? `Hoy · ${capitalizedDate}` : capitalizedDate}
                              </span>
                              {isToday && (
                                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  Hoy
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-extrabold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-xs">
                              {dayTasks.length} {dayTasks.length === 1 ? 'limpieza' : 'limpiezas'}
                            </span>
                          </div>

                          {/* Lista de Limpiezas del Día */}
                          <div className="divide-y divide-slate-100">
                            {dayTasks.map((task) => {
                              const prop = properties.find((p) => p.id === task.propertyId);
                              const res = reservations.find((r) => r.id === task.reservationId);
                              const cleaner = cleaners.find((c) => c.id === task.cleanerId);
                              const isCompleted = task.status === 'completed';
                              const isInProgress = task.status === 'in_progress';

                              return (
                                <div key={task.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition space-y-3.5">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    {/* Alojamiento, PAX y Huésped */}
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                          isCompleted
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : isInProgress
                                            ? 'bg-amber-100 text-amber-700 animate-pulse'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}
                                      >
                                        {isCompleted ? <CheckCircle2 size={20} /> : <Home size={18} />}
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-base font-extrabold text-slate-900">
                                            {prop?.name}
                                          </span>
                                          <span className="text-[11px] font-black bg-slate-900/5 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <User size={10} strokeWidth={3} className="text-slate-400" />
                                            {task.pax || 4}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                          <span>
                                            Salida:{' '}
                                            <button
                                              type="button"
                                              onClick={() => res && onOpenGuestPreview(res.id)}
                                              className="font-bold text-slate-800 hover:text-orange-600 underline underline-offset-2"
                                            >
                                              {res?.guestName || 'Huésped'}
                                            </button>
                                          </span>
                                          <span className="text-[11px] font-mono text-slate-400">
                                            [{res?.source || 'iCal'}]
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Badge de Estado estilo IVI ERP */}
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                                          isCompleted
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : isInProgress
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <>
                                            <CheckCircle2 size={13} />
                                            Completada
                                          </>
                                        ) : isInProgress ? (
                                          <>
                                            <Clock size={13} className="animate-spin" />
                                            En Progreso
                                          </>
                                        ) : (
                                          <>
                                            <Clock size={13} />
                                            Pendiente
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Fila Operativa (Horarios, Asignación, Duración y Acciones) */}
                                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100/80">
                                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                      {/* Horarios Salida -> Entrada */}
                                      <div className="flex items-center gap-1.5 bg-slate-100/90 px-3 py-1.5 rounded-xl font-bold">
                                        <span
                                          className={`text-[10px] uppercase font-black ${
                                            task.lateCheckoutActive ? 'text-amber-800' : 'text-rose-700'
                                          }`}
                                        >
                                          {task.lateCheckoutActive ? 'LATE OUT' : 'SALIDA'}
                                        </span>
                                        <span className="text-slate-900">{task.scheduledCleaningTime}h</span>
                                        <span className="text-slate-400 px-0.5">→</span>
                                        <span className="text-[10px] uppercase font-black text-emerald-700">
                                          ENTRADA
                                        </span>
                                        <span className="text-slate-900">
                                          {task.sameDayCheckIn ? `${task.nextCheckInTime}h` : '-'}
                                        </span>
                                      </div>

                                      {/* Rotación mismo día */}
                                      {task.sameDayCheckIn && (
                                        <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1">
                                          <Flame size={12} className="text-orange-600" /> ROTACIÓN MISMO DÍA
                                        </span>
                                      )}

                                      {/* Late Checkout Badge / Acción si solicitado */}
                                      {res?.lateCheckoutRequested && !task.lateCheckoutActive && (
                                        <button
                                          type="button"
                                          onClick={() => res && onApproveLateCheckout(res.id)}
                                          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3 py-1 rounded-xl text-xs transition shadow-xs"
                                        >
                                          Aprobar Late Out (+{prop?.lateCheckoutPrice}€)
                                        </button>
                                      )}

                                      {/* Selector de Limpiadora Asignada */}
                                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
                                        <User size={13} className="text-slate-400" />
                                        <select
                                          value={task.cleanerId}
                                          onChange={(e) => onAssignCleaner(task.id, e.target.value)}
                                          className="bg-transparent font-bold text-slate-800 text-xs outline-none cursor-pointer"
                                        >
                                          {cleaners.map((c) => (
                                            <option key={c.id} value={c.id}>
                                              {c.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Horas estipuladas */}
                                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-xl text-xs font-bold">
                                        1.5h
                                      </span>

                                      {/* Fotos de Comprobación */}
                                      {task.photosUploaded.length > 0 ? (
                                        <button
                                          type="button"
                                          onClick={() => setInspectingTaskPhotos(task)}
                                          className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded-xl font-bold transition"
                                        >
                                          <Camera size={13} />
                                          <span>{task.photosUploaded.length} fotos subidas</span>
                                        </button>
                                      ) : (
                                        <span className="text-slate-400 text-xs font-medium px-2 py-1">
                                          0 fotos
                                        </span>
                                      )}
                                    </div>

                                    {/* Acciones Rápidas: WhatsApp y Factura 10% */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPreselectedResIdForInvoice(task.reservationId);
                                          setShowCreateInvoiceModal(true);
                                        }}
                                        className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
                                        title="Emitir Factura Simplificada con IVA 10%"
                                      >
                                        <FileText size={12} className="text-emerald-600" />
                                        <span>Factura 10%</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => sendTaskWhatsApp(task)}
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
                                        title="Enviar enlace mágico con checklist por WhatsApp"
                                      >
                                        <Send size={12} />
                                        <span>WhatsApp</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : scheduleView === 'table' ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            <th className="py-3.5 px-4">Fecha Salida</th>
                            <th className="py-3.5 px-4">Alojamiento</th>
                            <th className="py-3.5 px-4">Huésped / Canal</th>
                            <th className="py-3.5 px-4">Estado Rotación & Late Check-out</th>
                            <th className="py-3.5 px-4">Hora Limpieza</th>
                            <th className="py-3.5 px-4">Asignación</th>
                            <th className="py-3.5 px-4">Comprobación</th>
                            <th className="py-3.5 px-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTasks.map((task) => {
                            const prop = properties.find((p) => p.id === task.propertyId);
                            const res = reservations.find((r) => r.id === task.reservationId);
                            const cleaner = cleaners.find((c) => c.id === task.cleanerId);

                            return (
                              <tr key={task.id} className="hover:bg-slate-50/60 transition">
                                <td className="py-4 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                  {task.date}
                                </td>
                                <td className="py-4 px-4 font-bold text-slate-900">{prop?.name}</td>
                                <td className="py-4 px-4">
                                  <button
                                    type="button"
                                    onClick={() => res && onOpenGuestPreview(res.id)}
                                    className="font-semibold text-slate-900 hover:text-orange-600 underline underline-offset-2 flex items-center gap-1"
                                  >
                                    <span>{res?.guestName}</span>
                                    <span className="font-mono text-[11px] text-slate-400">
                                      [{res?.source}]
                                    </span>
                                  </button>
                                </td>
                                <td className="py-4 px-4 text-xs">
                                  {task.sameDayCheckIn ? (
                                    <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 font-bold px-2.5 py-1 rounded-full">
                                      <Flame size={13} />
                                      ENTRADA HOY ({task.nextCheckInTime}H)
                                    </span>
                                  ) : task.lateCheckoutActive ? (
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-full">
                                      <CheckCircle2 size={13} />
                                      LATE CHECK-OUT HASTA {task.scheduledCleaningTime}H (+{prop?.lateCheckoutPrice}€)
                                    </span>
                                  ) : res?.lateCheckoutRequested ? (
                                    <div className="flex items-center gap-2">
                                      <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2.5 py-1 rounded-full">
                                        SOLICITADO POR HUÉSPED
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => res && onApproveLateCheckout(res.id)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1 rounded-lg text-xs"
                                      >
                                        Aprobar ({prop?.lateCheckoutUntil}H)
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-500">
                                      <span>Tarde libre</span>
                                      <button
                                        type="button"
                                        onClick={() => res && onApproveLateCheckout(res.id)}
                                        className="text-orange-600 hover:text-orange-700 font-semibold underline"
                                      >
                                        Conceder Late Check-out
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-4 font-mono font-bold">
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs ${
                                      task.lateCheckoutActive
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    {task.scheduledCleaningTime}h
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  <select
                                    value={task.cleanerId}
                                    onChange={(e) => onAssignCleaner(task.id, e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 text-xs"
                                  >
                                    {cleaners.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-4 px-4 text-xs">
                                  {task.photosUploaded.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => setInspectingTaskPhotos(task)}
                                      className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-semibold transition"
                                      title="Ver comprobación de fotos y checklist"
                                    >
                                      <Camera size={13} />
                                      <span>✓ {task.photosUploaded.length} FOTOS</span>
                                    </button>
                                  ) : task.status === 'completed' ? (
                                    <span className="text-emerald-700 font-semibold">
                                      ✓ COMPLETADA
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium">
                                      PENDIENTE
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPreselectedResIdForInvoice(task.reservationId);
                                        setShowCreateInvoiceModal(true);
                                      }}
                                      title="Emitir Factura Simplificada con IVA 10%"
                                      className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-medium transition shadow-xs"
                                    >
                                      <FileText size={12} className="text-emerald-600" />
                                      <span>Factura 10%</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => sendTaskWhatsApp(task)}
                                      title="Enviar detalles de la limpieza por WhatsApp al personal"
                                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
                                    >
                                      <Send size={12} />
                                      <span>WhatsApp</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
            ) : (
              /* Vista Timeline Semanal / Gantt */
              <div className="space-y-4">
                {Array.from(new Set(filteredTasks.map((t) => t.date))).sort().map((dateStr) => {
                  const dayTasks = filteredTasks.filter((t) => t.date === dateStr);
                  return (
                    <div key={dateStr} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-orange-600" />
                          <span className="text-xs font-bold text-slate-900">
                            Fecha de Salida: {dateStr}
                          </span>
                        </div>
                        <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
                          {dayTasks.length} {dayTasks.length === 1 ? 'Limpieza' : 'Limpiezas'}
                        </span>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dayTasks.map((task) => {
                          const prop = properties.find((p) => p.id === task.propertyId);
                          const res = reservations.find((r) => r.id === task.reservationId);
                          const cleaner = cleaners.find((c) => c.id === task.cleanerId);

                          return (
                            <div
                              key={task.id}
                              className={`p-4 border bg-white rounded-xl space-y-3 transition hover:shadow-sm ${
                                task.sameDayCheckIn
                                  ? 'border-l-4 border-l-orange-500 border-slate-200'
                                  : task.lateCheckoutActive
                                  ? 'border-l-4 border-l-emerald-600 border-slate-200'
                                  : 'border-slate-200/80'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-sm text-slate-900 block">
                                    {prop?.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    Huésped saliente: <strong className="text-slate-800">{res?.guestName}</strong> [{res?.source}]
                                  </span>
                                </div>
                                <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                                  {task.scheduledCleaningTime}h
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {task.sameDayCheckIn && (
                                  <span className="bg-orange-50 text-orange-700 border border-orange-200/70 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Flame size={12} /> ENTRADA HOY {task.nextCheckInTime}h
                                  </span>
                                )}
                                {task.lateCheckoutActive && (
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md">
                                    ✓ Late Check-out activo
                                  </span>
                                )}
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-xs font-medium">
                                  Personal: <strong className="text-slate-900">{cleaner?.name}</strong>
                                </span>
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-xs font-medium">
                                  Pago limpiadora: <strong className="text-slate-900">{prop?.cleaningFee ?? 0} €</strong>
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                <span>
                                  {task.photosUploaded.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => setInspectingTaskPhotos(task)}
                                      className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                                      title="Ver fotos y checklist"
                                    >
                                      <Camera size={13} />
                                      <span>✓ Verificada ({task.photosUploaded.length} fotos)</span>
                                    </button>
                                  ) : task.status === 'completed' ? (
                                    <strong className="text-emerald-700 font-semibold">✓ Completada (0 fotos)</strong>
                                  ) : (
                                    <span className="text-slate-400">⏳ Pendiente de realización</span>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => sendTaskWhatsApp(task)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                                >
                                  <Send size={11} />
                                  <span>Despacho WhatsApp</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Sub-pestaña: Equipo de Limpiadoras y Liquidaciones */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Total devengado equipo:{' '}
                <strong className="text-slate-900 text-base font-bold ml-1">
                  {tasks.reduce((sum, t) => {
                    const p = properties.find((prop) => prop.id === t.propertyId);
                    return sum + (p?.cleaningFee || 40);
                  }, 0)}{' '}
                  €
                </strong>
              </span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full font-semibold">
                ✓ Enlaces móviles directos sin contraseñas ni descargas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cleaners.map((c) => {
                const cleanerUrl = `${window.location.origin}/c/${c.magicToken}`;
                const cleanerTasks = tasks.filter((t) => t.cleanerId === c.id);
                const completedCount = cleanerTasks.filter((t) => t.status === 'completed').length;
                const totalAccrued = cleanerTasks.reduce((sum, t) => {
                  const p = properties.find((prop) => prop.id === t.propertyId);
                  return sum + (p?.cleaningFee || 40);
                }, 0);

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-900">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                            Activa
                          </span>
                          {onDeleteCleaner && cleaners.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteCleaner(c.id)}
                              className="text-slate-400 hover:text-rose-600 text-xs px-1 transition"
                              title="Eliminar limpiadora"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{c.phone}</p>

                      {/* Tarjeta de métricas devengadas */}
                      <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Servicios asignados:</span>
                          <strong className="text-slate-900">{cleanerTasks.length} ({completedCount} hechos)</strong>
                        </div>
                        <div className="flex justify-between text-slate-600 border-t border-slate-200/60 pt-1.5">
                          <span>Total devengado:</span>
                          <strong className="text-emerald-700 text-sm font-bold">{totalAccrued} €</strong>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200/70 px-3 py-2 rounded-lg truncate">
                        {cleanerUrl}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copyCleanerSettlement(c)}
                          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-2 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
                          title="Copiar desglose completo para pago vía Bizum o transferencia"
                        >
                          {copiedSettlementCleanerId === c.id ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedSettlementCleanerId === c.id ? '¡Copiado!' : 'Liquidación'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadCleanerSettlementCsv(c)}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl flex items-center justify-center transition shadow-sm"
                          title="Descargar liquidación en CSV"
                        >
                          <Download size={14} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const phoneClean = c.phone.replace(/[^0-9]/g, '');
                            const msg = `Hola ${c.name.split(' ')[0]}, aquí tienes tu enlace directo de limpiezas Turnexo actualizado en tiempo real con tus limpiezas asignadas:\n👉 ${cleanerUrl}`;
                            window.open(
                              `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`,
                              '_blank'
                            );
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
                        >
                          <Send size={12} />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCleanerPreview(c.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs transition shadow-sm"
                        >
                          Abrir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {onAddCleaner && (
              cleaners.length >= maxAllowedCleaners ? (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-amber-900 font-medium">
                    <Users size={18} className="text-amber-700 shrink-0" />
                    <span>
                      Has alcanzado el límite de personal ({cleaners.length}/{maxAllowedCleaners}) de tu plan {isStarter ? 'Starter' : 'Pro Fiscal'}.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanLimitReason({
                        title: 'Equipo de limpieza múltiple',
                        desc: isStarter
                          ? 'El Plan Starter incluye 1 limpiador/a. Actualiza a Pro Fiscal (hasta 2) o Microgestora para coordinar un equipo sin límite.'
                          : 'Para coordinar un equipo más amplio con liquidaciones individuales y control por persona, actualiza a Microgestora.',
                        targetPlan: isStarter ? 'plan_pro' : 'plan_manager',
                      });
                    }}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap"
                  >
                    Actualizar Plan
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCleanerName.trim()) return;
                    const slugToken = `${newCleanerName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '')
                      .slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`;
                    onAddCleaner({
                      id: `cl-${Date.now()}`,
                      name: newCleanerName.trim(),
                      phone: newCleanerPhone.trim() || '+34 600 00 00 00',
                      magicToken: slugToken,
                    });
                    setNewCleanerName('');
                    setNewCleanerPhone('+34 ');
                  }}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center"
                >
                  <input
                    placeholder="Nombre de la nueva limpiadora (ej. Rocío Díaz)"
                    value={newCleanerName}
                    onChange={(e) => setNewCleanerName(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    placeholder="Teléfono (+34...)"
                    value={newCleanerPhone}
                    onChange={(e) => setNewCleanerPhone(e.target.value)}
                    className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shrink-0 transition shadow-sm"
                  >
                    + Crear Enlace /c/
                  </button>
                </form>
              )
            )}
          </div>
        )}
      </div>
    )}



        {/* VISTA FISCAL: FACTURAS A HUÉSPEDES & IVA 10% (MODELO 303) */}
        {section === 'invoices' && !hasFiscalAccess && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
                <FileSpreadsheet size={32} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100/70 border border-orange-200 px-3 py-1 rounded-full">
                  Exclusivo Plan Pro Fiscal & Microgestora
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Módulo Fiscal & Facturación Oficial (IVA 10%)
                </h2>
                <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
                  Automatiza la emisión legal de Facturas Simplificadas a viajeros de Airbnb o Booking y descarga el <strong>Libro Registro en Excel</strong> para tu gestoría en 1 solo clic, listo para rellenar el Modelo 303.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs block">Facturas Simplificadas</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Numeración legal correlativa y desglose del 10% de IVA sin necesidad de pedir el DNI al viajero.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs block">Modelo 303 en 1 Clic</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Cálculo automático de bases imponibles y cuotas de IVA para enviárselo directamente a tu gestor.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-1.5">
                  <span className="font-bold text-slate-900 text-xs block">Multi-NIF & Sociedades</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Configura tus datos fiscales o los de varios propietarios según cada alojamiento.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const stripeUrl = getStripePaymentLink('plan_pro', isAnnualBilling);
                    if (stripeUrl && stripeUrl.startsWith('http')) {
                      window.open(stripeUrl, '_blank');
                    } else {
                      setSection('billing');
                    }
                  }}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  <span>Activar Plan Pro Fiscal ({isAnnualBilling ? '15 €/mes' : '19 €/mes'})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSection('billing')}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-3.5 rounded-xl transition"
                >
                  Ver comparativa de planes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA FISCAL: FACTURAS A HUÉSPEDES & IVA 10% (MODELO 303) */}
        {section === 'invoices' && hasFiscalAccess && (
          <div className="space-y-8">
            {isCommunityVip && isStarter && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    VIP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold uppercase tracking-wide text-emerald-900 text-xs">
                        Pase Exclusivo Comunidad de Anfitriones
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        Cortesía Activa
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Tienes acceso completo al <strong>Módulo Fiscal Oficial (IVA 10%)</strong>: emisión de facturas simplificadas y descarga del Libro Registro para tu gestoría / Modelo 303 sin coste adicional.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                    Régimen Fiscal Alojamientos Turísticos
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    IVA 10% obligatorio &lt; 30 días
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  Facturas a Huéspedes & Libro de IVA
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Emisión legal de Facturas Simplificadas (&lt; 3.000 € sin DNI obligatorio) y resumen para el Modelo 303 de Hacienda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFiscalProfileModal(true)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Building2 size={15} className="text-slate-500" />
                  <span>Mis Datos Fiscales</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedResIdForInvoice(undefined);
                    setShowCreateInvoiceModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>+ Emitir Factura</span>
                </button>
              </div>
            </div>

            {/* AVISO LEGAL Y TRANQUILIDAD CONTABLE */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-sm">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1.5 text-xs">
                <h3 className="font-bold text-emerald-950 text-sm">
                  ¿Por qué puedes emitir Factura Simplificada sin pedir DNI al viajero?
                </h3>
                <p className="text-emerald-900 leading-relaxed">
                  Conforme al <strong>Artículo 4.2.f del Real Decreto 1619/2012</strong>, en los servicios de hospedaje y alojamiento turístico se permite emitir <strong>Factura Simplificada hasta 3.000 €</strong> (IVA incluido). No estás obligado a solicitar el NIF ni el domicilio del huésped salvo que se trate de una empresa o autónomo que lo solicite para deducirse el gasto.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium text-emerald-800">
                  <span>✓ 100% Válido ante la AEAT</span>
                  <span>✓ Serie correlativa {currentFiscalProfile.simplifiedSeriesPrefix}-XXX</span>
                  <span>✓ Cálculo automático del 10% de IVA</span>
                </div>
              </div>
            </div>

            {/* RESUMEN TRIMESTRAL PARA EL MODELO 303 DE HACIENDA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                    Liquidación Tributaria
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Resumen Trimestral para Hacienda (Modelo 303)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(['1T', '2T', '3T', '4T'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuarter(q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedQuarter === q
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                    >
                      {q}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const qInvoices = allInvoices.filter(
                        (inv) =>
                          inv.status === 'issued' &&
                          inv.issueDate.startsWith(String(new Date().getFullYear()))
                      );
                      exportInvoicesToCsv(qInvoices, `libro_iva_turnexo_${selectedQuarter}.csv`);
                    }}
                    className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-sm"
                    title="Descargar libro de facturas para tu gestoría"
                  >
                    <Download size={13} />
                    <span>Descargar CSV Gestor</span>
                  </button>
                </div>
              </div>

              {/* Tarjetas de Métricas del Trimestre */}
              {(() => {
                const summaries = computeQuarterSummaries(allInvoices);
                const currentSummary = summaries.find((s) => s.quarter === selectedQuarter) || summaries[0];
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-xs uppercase text-slate-500 font-semibold block">
                        Facturas Emitidas ({selectedQuarter})
                      </span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {currentSummary.totalInvoices}
                      </span>
                      <span className="text-xs text-slate-500">Operaciones registradas</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-xs uppercase text-slate-500 font-semibold block">
                        Base Imponible Total
                      </span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {currentSummary.totalBase.toFixed(2)} €
                      </span>
                      <span className="text-xs text-slate-500">Casilla [01] Modelo 303</span>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80">
                      <span className="text-xs uppercase text-emerald-800 font-bold block">
                        Cuota IVA Devengado (10%)
                      </span>
                      <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                        {currentSummary.totalVat.toFixed(2)} €
                      </span>
                      <span className="text-xs text-emerald-700">Casilla [03] a ingresar</span>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl text-white shadow-sm">
                      <span className="text-xs uppercase text-slate-300 font-semibold block">
                        Total Facturado ({selectedQuarter})
                      </span>
                      <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                        {currentSummary.totalAmount.toFixed(2)} €
                      </span>
                      <span className="text-xs text-slate-400">IVA incluido</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* TABLA DE FACTURAS EMITIDAS */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por factura o huésped..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="pl-8 pr-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl w-60 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <select
                    value={invoicePropertyFilter}
                    onChange={(e) => setInvoicePropertyFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Todos los alojamientos ({properties.length})</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  Mostrando {allInvoices.length} facturas registradas
                </span>
              </div>

              {allInvoices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      No tienes facturas emitidas todavía
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Conecta tus salidas del calendario iCal o emite tu primera factura simplificada con IVA del 10% para cumplir con la normativa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    + Emitir Mi Primera Factura
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-5">Nº Factura</th>
                        <th className="py-3 px-4">Fecha Emisión</th>
                        <th className="py-3 px-4">Alojamiento</th>
                        <th className="py-3 px-4">Huésped / Cliente</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4 text-right">Base Imponible</th>
                        <th className="py-3 px-4 text-right">IVA (10%)</th>
                        <th className="py-3 px-4 text-right">Total Factura</th>
                        <th className="py-3 px-5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allInvoices
                        .filter((inv) => {
                          if (
                            invoicePropertyFilter !== 'all' &&
                            inv.propertyId !== invoicePropertyFilter
                          )
                            return false;
                          if (invoiceSearch.trim()) {
                            const q = invoiceSearch.toLowerCase();
                            const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
                            const matchGuest = inv.guestName.toLowerCase().includes(q);
                            if (!matchNum && !matchGuest) return false;
                          }
                          return true;
                        })
                        .map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              {inv.issueDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block">
                                {inv.propertyName}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {inv.stayStartDate} al {inv.stayEndDate} ({inv.nights} noches)
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">
                                {inv.guestName}
                              </span>
                              {inv.guestFiscalId ? (
                                <span className="text-[11px] font-mono text-slate-500">
                                  NIF: {inv.guestFiscalId}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">
                                  Simplificada (RD 1619/2012)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[11px]">
                              {inv.isSimplified ? (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                                  Simplificada
                                </span>
                              ) : (
                                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                                  Completa
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                              {inv.baseAmount.toFixed(2)} €
                            </td>
                            <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                              +{inv.vatAmount.toFixed(2)} €
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                              {inv.totalAmount.toFixed(2)} €
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-sm"
                              >
                                <Printer size={12} />
                                <span>Ver / PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA 5: FACTURACIÓN SELF-SERVICE & PLAN */}
        {section === 'billing' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-full inline-block">
                  Planes transparentes sin permanencia
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  Tu Suscripción
                </h2>
              </div>

              {/* Selector Mensual / Anual con descuento */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsAnnualBilling(false)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                    !isAnnualBilling
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pago Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnualBilling(true)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition ${
                    isAnnualBilling
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pago Anual</span>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-md font-extrabold">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resumen de Suscripción Actual */}
              <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-3xl p-7 space-y-6 shadow-xl border border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full inline-block">
                      Plan activo en tu cuenta
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5">
                      {hostAccount?.plan === 'plan_starter'
                        ? 'Starter · 1 Alojamiento (0€ Gratis)'
                        : hostAccount?.plan === 'plan_manager'
                        ? `Microgestora · Hasta 10 Alojamientos (${isAnnualBilling ? '31€/mes · 372€/año' : '39€/mes'})`
                        : `Pro Fiscal · Hasta 5 Alojamientos (${isAnnualBilling ? '15€/mes · 180€/año' : '19€/mes'})`}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Estado:{' '}
                      {isSubscriptionActive
                        ? 'Suscripción Activa (Stripe Billing)'
                        : isStarter
                        ? isCommunityVip
                          ? 'Plan Starter con Pase Especial de Comunidad (Módulo Fiscal IVA 10% activo de cortesía)'
                          : 'Plan Starter 100% gratuito (1 alojamiento sin límite de tiempo)'
                        : trialDaysRemaining > 0
                        ? `Periodo de prueba gratuito (${trialDaysRemaining} días restantes hasta el ${hostAccount?.trialEndsAt || 'final del ciclo'})`
                        : `Periodo de prueba finalizado el ${hostAccount?.trialEndsAt}. Suscríbete para continuar con este plan.`}
                    </p>
                    {isCommunityVip && isStarter && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                        <span>Pase Comunidad Activo · Módulo Fiscal IVA 10% Incluido</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-white">
                      {hostAccount?.plan === 'plan_starter'
                        ? '0'
                        : hostAccount?.plan === 'plan_manager'
                        ? (isAnnualBilling ? '31' : '39')
                        : (isAnnualBilling ? '15' : '19')}{' '}
                      €
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      / mes ({isAnnualBilling ? 'pago anual · 2 meses gratis' : 'facturación mensual'})
                    </span>
                  </div>
                </div>

                {/* Quota de Alojamientos del Plan */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Alojamientos utilizados en tu cuenta:</span>
                    <span className="font-bold text-white">
                      {properties.length} / {maxAllowedProperties} alojamientos
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        properties.length >= maxAllowedProperties ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (properties.length / Math.max(1, maxAllowedProperties)) * 100)}%`,
                      }}
                    />
                  </div>
                  {properties.length >= maxAllowedProperties && hostAccount?.plan !== 'plan_manager' && (
                    <p className="text-xs text-amber-300 pt-1">
                      ⚠️ Has alcanzado el límite de tu plan ({properties.length}/{maxAllowedProperties} alojamientos). Selecciona un plan superior para sincronizar más propiedades.
                    </p>
                  )}
                </div>

                {/* Comparador interactivo de los 3 planes oficiales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                  {(
                    [
                      {
                        id: 'plan_starter',
                        title: 'Starter',
                        limit: '1 Alojamiento',
                        price: '0 €',
                        period: '/ mes',
                        saving: '100% gratis',
                        desc: 'Para probar Turnexo con 1 alojamiento real sin tarjeta.',
                      },
                      {
                        id: 'plan_pro',
                        title: 'Pro Fiscal',
                        limit: 'Hasta 5 Alojamientos',
                        price: isAnnualBilling ? '15 €' : '19 €',
                        period: isAnnualBilling ? '/ mes (180€/año)' : '/ mes',
                        saving: isAnnualBilling ? 'Ahorras 48€ (2 meses gratis)' : 'Más elegido',
                        desc: 'Facturas IVA 10%, Modelo 303 en 1 clic y soporte Multi-NIF.',
                      },
                      {
                        id: 'plan_manager',
                        title: 'Microgestora',
                        limit: 'Hasta 10 Alojamientos',
                        price: isAnnualBilling ? '31 €' : '39 €',
                        period: isAnnualBilling ? '/ mes (372€/año)' : '/ mes',
                        saving: isAnnualBilling ? 'Ahorras 96€ (2 meses gratis)' : 'Para gestores',
                        desc: 'Múltiples limpiadoras, liquidaciones por persona y soporte directo.',
                      },
                    ] as const
                  ).map((p) => {
                    const isCurrent = (hostAccount?.plan || 'plan_starter') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onChangePlan?.(p.id)}
                        className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between ${
                          isCurrent
                            ? 'border-orange-500 bg-white/[0.06] ring-2 ring-orange-500 shadow-md'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-800/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[11px] font-bold text-emerald-400">
                              {p.saving}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 bg-orange-600 text-white font-bold rounded-full">
                                Activo
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-white text-sm block">{p.title}</span>
                          <span className="text-xs text-orange-400 font-semibold block mt-0.5">
                            {p.limit}
                          </span>
                          <div className="mt-2.5">
                            <span className="text-xl font-black text-white">{p.price}</span>
                            <span className="text-[11px] text-slate-400 block">{p.period}</span>
                          </div>
                          <span className="text-xs text-slate-300 block mt-2.5 leading-relaxed">
                            {p.desc}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-700/60 text-center">
                          <span
                            className={`block py-2 text-xs font-bold rounded-xl transition ${
                              isCurrent
                                ? 'bg-slate-700/60 text-white'
                                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                            }`}
                          >
                            {isCurrent ? '✓ Plan Actual' : 'Seleccionar'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    Sin permanencia. Cancela o cambia de plan en cualquier momento desde tu panel.
                  </p>
                  {hostAccount?.plan === 'plan_starter' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
                        ✓ Plan Starter 100% Gratuito Activo
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const planKey = hostAccount?.plan || 'plan_pro';
                        const stripeUrl = getStripePaymentLink(planKey, isAnnualBilling) || getStripePaymentLink('plan_pro', isAnnualBilling);
                        if (stripeUrl && stripeUrl.startsWith('http')) {
                          window.open(stripeUrl, '_blank');
                        } else {
                          setShowStripeNoticeModal(true);
                        }
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2"
                    >
                      {hostAccount?.subscriptionStatus === 'active'
                        ? '✓ Suscripción Stripe Activa'
                        : `Activar ${hostAccount?.plan === 'plan_manager' ? 'Microgestora' : 'Pro Fiscal'} (${isAnnualBilling ? 'Pago Anual -20%' : 'Mensual'}) en Stripe Checkout →`}
                    </button>
                  )}
                </div>
              </div>

              {/* Seguridad, Garantía y Soporte */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Garantía y Seguridad Turnexo
                </span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Facturación 100% Segura
                </h3>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="bg-slate-50 rounded-xl border border-slate-200/60 p-3.5">
                    <strong className="text-slate-900 block text-xs font-semibold mb-0.5">
                      ✓ Pasarela Oficial Stripe
                    </strong>
                    Tus pagos y suscripciones se gestionan con cifrado bancario SSL de 256 bits. Turnexo nunca almacena los datos de tu tarjeta.
                  </li>
                  <li className="bg-slate-50 rounded-xl border border-slate-200/60 p-3.5">
                    <strong className="text-slate-900 block text-xs font-semibold mb-0.5">
                      ✓ Sin permanencia ni penalizaciones
                    </strong>
                    Cancela o cambia de plan con 1 solo clic en cualquier momento sin necesidad de llamar ni tramitar bajas.
                  </li>
                  <li className="bg-slate-50 rounded-xl border border-slate-200/60 p-3.5">
                    <strong className="text-slate-900 block text-xs font-semibold mb-0.5">
                      ✓ Facturas oficiales con IVA desglosado
                    </strong>
                    Recibe automáticamente la factura correspondiente a tu suscripción lista para desgravar en tu contabilidad.
                  </li>
                  <li className="bg-slate-50 rounded-xl border border-slate-200/60 p-3.5">
                    <strong className="text-slate-900 block text-xs font-semibold mb-0.5">
                      ✓ Soporte al anfitrión
                    </strong>
                    ¿Dudas con tu plan o configuración? Escríbenos directamente a <a href="mailto:info@turnexo.app" className="text-orange-600 font-semibold underline">info@turnexo.app</a>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Sincronizar URL iCal real */}
      {showIcalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Sincronizar Calendario iCal (.ics)
              </h3>
              <button
                type="button"
                onClick={() => setShowIcalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alojamiento de destino
              </label>
              <select
                value={targetPropertyId}
                onChange={(e) => setTargetPropertyId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-orange-50/50 border border-orange-200/60 rounded-2xl p-4 space-y-2.5">
              <label className="block text-xs font-bold text-orange-800">
                Opción A · Pegar URL .ics directa de Airbnb o Booking
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={liveIcalUrl}
                  onChange={(e) => setLiveIcalUrl(e.target.value)}
                  placeholder="https://www.airbnb.es/calendar/ical/....ics"
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  disabled={syncingUrl || !liveIcalUrl.trim()}
                  onClick={async () => {
                    setSyncingUrl(true);
                    await onSyncIcalUrl(targetPropertyId, liveIcalUrl.trim());
                    setSyncingUrl(false);
                    setShowIcalModal(false);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition shadow-sm"
                >
                  {syncingUrl ? '...' : 'Sincronizar'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Opción B · Contenido .ics de prueba
              </label>
              <textarea
                rows={5}
                value={icsInput}
                onChange={(e) => setIcsInput(e.target.value)}
                className="w-full font-mono text-xs bg-slate-900 text-slate-100 rounded-xl p-3 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIcalModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onImportIcalText(targetPropertyId, icsInput);
                  setShowIcalModal(false);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                Importar Reservas iCal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Propiedad */}
      {showNewPropModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateProperty}
            className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Cabecera */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center font-bold text-lg">
                  🏠
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">
                    Añadir Nuevo Alojamiento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ficha base para coordinar limpiezas y generar la Guía Digital del Huésped.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPropModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Bloque 1: Datos Generales */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Información del Alojamiento
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre del Alojamiento <span className="text-orange-600">*</span>
                  </label>
                  <input
                    required
                    placeholder="ej. Ático Centro Histórico - Catedral"
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Dirección completa
                    </label>
                    <input
                      placeholder="ej. Calle Larios 12, 3ºB, Málaga"
                      value={newPropAddress}
                      onChange={(e) => setNewPropAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      WhatsApp de contacto para el huésped
                    </label>
                    <input
                      placeholder="ej. +34 612 345 678"
                      value={newPropWhatsapp}
                      onChange={(e) => setNewPropWhatsapp(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-2xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 2: Operativa de Limpieza y Horarios */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                2. Horarios y Operativa de Limpiezas
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hora salida (Check-out)
                  </label>
                  <select
                    value={newPropCheckOut || '11:00'}
                    onChange={(e) => setNewPropCheckOut(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-bold shadow-2xs"
                  >
                    {newPropCheckOut && !CHECKOUT_HOURS.includes(newPropCheckOut) && (
                      <option value={newPropCheckOut}>{newPropCheckOut}</option>
                    )}
                    {CHECKOUT_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h} {h === '11:00' ? '(Estándar)' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Inicio de la limpieza</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hora entrada (Check-in)
                  </label>
                  <select
                    value={newPropCheckIn || '15:00'}
                    onChange={(e) => setNewPropCheckIn(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-bold shadow-2xs"
                  >
                    {newPropCheckIn && !CHECKIN_HOURS.includes(newPropCheckIn) && (
                      <option value={newPropCheckIn}>{newPropCheckIn}</option>
                    )}
                    {CHECKIN_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h} {h === '15:00' ? '(Estándar)' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Llegada nuevo huésped</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pago por limpieza (€) <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={newPropCleaningFee}
                    onChange={(e) => setNewPropCleaningFee(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono text-center shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Coste al personal (0 si sueldo fijo)</span>
                </div>
              </div>

              <div className="pt-1 text-xs">
                <label className="block font-semibold text-slate-700 mb-1">
                  Limpiadora habitual asignada
                </label>
                <select
                  value={newPropCleanerId}
                  onChange={(e) => setNewPropCleanerId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-2xs"
                >
                  {cleaners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bloque 3: Acceso y WiFi */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                3. Acceso y WiFi (Para la Guía Digital del Huésped)
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Puerta / Cajetín de Llaves
                  </label>
                  <input
                    placeholder="ej. 1234# o C-5842"
                    value={newPropDoorCode}
                    onChange={(e) => setNewPropDoorCode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Se mostrará al huésped tras confirmar las instrucciones de llegada.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre de la Red WiFi
                    </label>
                    <input
                      placeholder="ej. WiFi_Centro_5G"
                      value={newPropWifiSsid}
                      onChange={(e) => setNewPropWifiSsid(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Contraseña WiFi
                    </label>
                    <input
                      placeholder="ej. ClaveSegura2026"
                      value={newPropWifiPass}
                      onChange={(e) => setNewPropWifiPass(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs shadow-2xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 4: Sincronización iCal */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-900 uppercase tracking-wider">
                  4. Enlace iCal de Airbnb o Booking (.ics)
                </label>
                <span className="text-[11px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full font-medium">
                  Opcional
                </span>
              </div>
              <input
                placeholder="https://www.airbnb.es/calendar/ical/....ics"
                value={newPropIcal}
                onChange={(e) => setNewPropIcal(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Si no tienes el enlace iCal a mano, puedes dejarlo en blanco y pegarlo en cualquier momento pulsando en <em>"Sincronizar iCal"</em>.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewPropModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-7 py-3 rounded-xl transition shadow-sm text-center"
              >
                Crear Alojamiento →
              </button>
            </div>
          </form>
        </div>
      )}

      {qrModalProperty && (
        <PrintableQrPosterModal
          property={qrModalProperty}
          onClose={() => setQrModalProperty(null)}
        />
      )}

      {customizingProperty && (
        <PropertyCustomizerModal
          property={customizingProperty}
          cleaners={cleaners}
          language={lang}
          onClose={() => setCustomizingProperty(null)}
          onDelete={
            onDeleteProperty
              ? (id) => {
                  onDeleteProperty(id);
                  setCustomizingProperty(null);
                }
              : undefined
          }
          onSave={(updated) => {
            const hasIcal = Boolean(updated.airbnbIcalUrl?.trim() || updated.bookingIcalUrl?.trim());
            const finalUpdated: Property = {
              ...updated,
              airbnbIcalUrl: updated.airbnbIcalUrl?.trim() || '',
              bookingIcalUrl: updated.bookingIcalUrl?.trim() || '',
              lastSyncedAt: hasIcal ? (updated.lastSyncedAt || 'Sincronizado') : 'Sin sincronizar',
            };
            onUpdateProperty(finalUpdated);
            setCustomizingProperty(null);
          }}
        />
      )}

      {/* MODAL IMPRESIÓN Y DESCARGA PDF FACTURA */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* MODAL EMISIÓN DE FACTURA */}
      {showCreateInvoiceModal && (
        <CreateInvoiceModal
          properties={properties}
          reservations={reservations}
          existingInvoices={allInvoices}
          fiscalProfile={currentFiscalProfile}
          initialReservationId={preselectedResIdForInvoice}
          onSaveInvoice={(inv) => {
            onAddInvoice?.(inv);
          }}
          onClose={() => {
            setShowCreateInvoiceModal(false);
            setPreselectedResIdForInvoice(undefined);
          }}
        />
      )}

      {/* MODAL PERFIL FISCAL ANFITRIÓN */}
      {showFiscalProfileModal && (
        <FiscalProfileModal
          profile={currentFiscalProfile}
          onSave={(updated) => {
            onUpdateFiscalProfile?.(updated);
          }}
          onClose={() => setShowFiscalProfileModal(false)}
        />
      )}

      {/* MODAL COMPROBACIÓN DE FOTOS Y CHECKLIST DE LIMPIEZA */}
      {inspectingTaskPhotos && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block">
                  Comprobación en tiempo real
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1.5">
                  {properties.find((p) => p.id === inspectingTaskPhotos.propertyId)?.name || 'Alojamiento'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fecha salida: {inspectingTaskPhotos.date} · Limpiadora:{' '}
                  <strong className="text-slate-800">{cleaners.find((c) => c.id === inspectingTaskPhotos.cleanerId)?.name || 'Sin asignar'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingTaskPhotos(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Estado del Checklist */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Checklist verificado por la limpiadora
                </span>
                <span>
                  {inspectingTaskPhotos.checklist.filter((c) => c.completed).length} /{' '}
                  {inspectingTaskPhotos.checklist.length} tareas
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {inspectingTaskPhotos.checklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <div className="truncate">
                        {item.category && item.category !== 'General' && (
                          <span className="text-[10px] text-slate-400 font-medium mr-1.5 uppercase tracking-wide">
                            [{item.category}]
                          </span>
                        )}
                        <span className="font-medium text-slate-900">{item.label}</span>
                      </div>
                    </div>
                    {item.photoRequired && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Camera size={10} /> Foto
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Galería de fotos subidas por la limpiadora */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Fotos tomadas con la cámara ({inspectingTaskPhotos.photosUploaded.length})</span>
                <span className="text-slate-500 font-normal text-xs">Comprobación antes de la llegada del huésped</span>
              </div>
              {inspectingTaskPhotos.photosUploaded.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-6 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
                  Aún no se han subido fotos para esta limpieza.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {inspectingTaskPhotos.photosUploaded.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-video sm:aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`Foto verificación ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        Ampliar foto ↗
                      </div>
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                        Habitación {idx + 1}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Todo comprobado: el alojamiento está impecable para el nuevo huésped</span>
              </span>
              <button
                type="button"
                onClick={() => setInspectingTaskPhotos(null)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-sm"
              >
                Conforme y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Atención al Cliente: Activación de Plan */}
      {showStripeNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Suscripción {hostAccount?.plan === 'plan_manager' ? 'Microgestora' : 'Pro Fiscal'}
                  </h3>
                  <p className="text-xs text-slate-500">Periodo de prueba gratuito activo (14 días)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStripeNoticeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>
                Actualmente dispones de acceso completo a todas las herramientas durante tus <strong>14 días de prueba</strong>.
              </p>
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2 text-slate-700">
                <span className="font-bold text-slate-900 block text-xs">¿Deseas activar tu suscripción ahora?</span>
                <p className="text-xs text-slate-600">
                  Para formalizar tu cuenta de forma anticipada o domiciliar el pago con tu gestora, nuestro equipo te lo habilitará de inmediato:
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={`https://wa.me/34600000000?text=${encodeURIComponent(`Hola, soy ${hostAccount?.fullName || 'anfitrión'} (${hostAccount?.email}). Quiero activar mi suscripción al Plan ${hostAccount?.plan === 'plan_manager' ? 'Microgestora' : 'Pro Fiscal'} en Turnexo.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Send size={13} />
                    <span>Solicitar por WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:info@turnexo.app?subject=${encodeURIComponent(`Activación Plan ${hostAccount?.plan === 'plan_manager' ? 'Microgestora' : 'Pro Fiscal'} - ${hostAccount?.fullName || 'Turnexo'}`)}&body=${encodeURIComponent(`Hola, quiero activar mi suscripción en Turnexo con el email: ${hostAccount?.email}`)}`}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Mail size={13} />
                    <span>Email a info@turnexo.app</span>
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Recuerda que no se realizará ningún cargo automático hasta que decidas activar formalmente tu suscripción.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStripeNoticeModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Seguir disfrutando de la prueba
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PAYWALL DE CONTROL DE LÍMITES DE PLAN */}
      {planLimitReason && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full inline-block">
                    Plan {isStarter ? 'Starter' : 'Pro Fiscal'}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-1">
                    {planLimitReason.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlanLimitReason(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {planLimitReason.desc}
            </p>

            {/* Tarjeta del plan recomendado */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Recomendado</span>
                  <h4 className="text-lg font-black mt-0.5">
                    {planLimitReason.targetPlan === 'plan_pro' ? 'Plan Pro Fiscal' : 'Plan Microgestora'}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">
                    {planLimitReason.targetPlan === 'plan_pro'
                      ? isAnnualBilling ? '15 €' : '19 €'
                      : isAnnualBilling ? '31 €' : '39 €'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ mes (tarifa plana)</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                {planLimitReason.targetPlan === 'plan_pro' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Hasta 5 alojamientos con iCal automático</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Facturación oficial IVA 10% y Modelo 303 en Excel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Guía Digital 100% marca blanca (sin sello Turnexo)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Historial ilimitado de fotos de limpieza</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Hasta 10 alojamientos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Múltiples limpiadoras con liquidaciones desglosadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Todo lo incluido en Pro Fiscal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Soporte prioritario directo</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selector de facturación mensual / anual */}
            <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
              <span className="font-semibold text-slate-700">Facturación anual (-20% de descuento)</span>
              <button
                type="button"
                onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isAnnualBilling ? 'bg-orange-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnualBilling ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Acciones */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const stripeUrl = getStripePaymentLink(planLimitReason.targetPlan, isAnnualBilling);
                  if (stripeUrl && stripeUrl.startsWith('http')) {
                    window.open(stripeUrl, '_blank');
                  } else {
                    setSection('billing');
                    setPlanLimitReason(null);
                  }
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>Actualizar Plan con Stripe</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSection('billing');
                  setPlanLimitReason(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 px-4 rounded-xl transition"
              >
                Ver todos los planes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
