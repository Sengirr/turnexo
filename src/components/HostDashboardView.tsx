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
} from 'lucide-react';
import { Cleaner, CleaningTask, Property, Reservation } from '../lib/icalParser';
import { SAMPLE_ICAL_SNIPPET } from '../lib/mockData';
import { HostAccount, isSupabaseConfigured, STRIPE_PAYMENT_LINKS } from '../lib/supabase';
import PrintableQrPosterModal from './PrintableQrPosterModal';
import PropertyCustomizerModal from './PropertyCustomizerModal';
import InvoicePrintModal from './InvoicePrintModal';
import CreateInvoiceModal from './CreateInvoiceModal';
import FiscalProfileModal from './FiscalProfileModal';
import { CreditCard, ShieldCheck, UserCheck, FileText, Building2 } from 'lucide-react';
import {
  computeQuarterSummaries,
  DEFAULT_HOST_FISCAL_PROFILE,
  exportInvoicesToCsv,
  HostFiscalProfile,
  INITIAL_INVOICES,
  Invoice,
} from '../lib/invoice';

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

type BackofficeSection = 'overview' | 'schedule' | 'guests' | 'invoices' | 'team' | 'billing';

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
  const [newPropWhatsapp, setNewPropWhatsapp] = useState('+34 600 00 00 00');
  const [newPropWifiSsid, setNewPropWifiSsid] = useState('');
  const [newPropWifiPass, setNewPropWifiPass] = useState('');
  const [newPropDoorCode, setNewPropDoorCode] = useState('');
  const [newPropIcal, setNewPropIcal] = useState('');

  const copyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtros y modos de visualización avanzados
  const [scheduleView, setScheduleView] = useState<'table' | 'timeline'>('table');
  const [schedulePropertyFilter, setSchedulePropertyFilter] = useState('all');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | 'urgent' | 'late' | 'completed' | 'pending'>('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [guestPropertyFilter, setGuestPropertyFilter] = useState('all');
  const [copiedSettlementCleanerId, setCopiedSettlementCleanerId] = useState<string | null>(null);
  const [isAnnualBilling, setIsAnnualBilling] = useState(true);
  const [showStripeNoticeModal, setShowStripeNoticeModal] = useState(false);

  const maxAllowedProperties =
    hostAccount?.plan === 'plan_manager'
      ? 10
      : hostAccount?.plan === 'plan_pro'
      ? 5
      : 1;

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
      ['Fecha', 'Alojamiento', 'Huesped', 'Canal', 'Hora Limpieza', 'Tarifa EUR', 'Estado', 'Fotos'],
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

  // Enviar guía del huésped por WhatsApp
  const sendGuestGuideWhatsApp = (res: Reservation) => {
    const prop = properties.find((p) => p.id === res.propertyId);
    if (!prop) return;
    const guideUrl = `${window.location.origin}/g/${prop.slug}`;
    const msg = `¡Hola ${res.guestName.split(' ')[0]}! Te damos la bienvenida a ${prop.name}.\n` +
      `📱 Aquí tienes tu Guía Digital con los vídeos para entrar, clave del WiFi, instrucciones y solicitud de extras:\n` +
      `👉 ${guideUrl}\n\n` +
      `¡Que disfrutes mucho de tu estancia!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;
    const id = `prop-${Date.now()}`;
    const slug = newPropName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    onAddProperty({
      id,
      name: newPropName.trim(),
      slug: slug || id,
      address: newPropAddress.trim() || 'Dirección del apartamento',
      hostWhatsapp: newPropWhatsapp.trim() || '+34600000000',
      googleMapsUrl: 'https://maps.google.com',
      airbnbIcalUrl: newPropIcal.trim() || 'https://www.airbnb.es/calendar/ical/nuevo.ics',
      bookingIcalUrl: '',
      defaultCleanerId: cleaners[0].id,
      cleaningFee: 40,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      lateCheckoutPrice: 35,
      lateCheckoutUntil: '17:00',
      wifiSsid: newPropWifiSsid.trim() || 'WiFi_Apartamento',
      wifiPassword: newPropWifiPass.trim() || 'Clave1234',
      doorCode: newPropDoorCode.trim() || '1234#',
      checkInInstructions: 'Introduce el código en el cajetín junto a la puerta principal.',
      videos: [
        {
          id: `vid-${Date.now()}`,
          title: 'Cómo entrar al apartamento y recoger las llaves',
          category: 'checkin',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      ],
      extras: [
        {
          id: `ext-${Date.now()}`,
          title: 'Late Check-out hasta las 17:00h',
          description: 'Salida por la tarde sin prisas.',
          price: 35,
          priceUnit: 'reserva',
          icon: 'clock',
          onlyWhenFreeNextDay: true,
          active: true,
        },
      ],
      houseRules: ['No fumar', 'Respetar el descanso de los vecinos a partir de las 23:00h'],
      appliancesGuide:
        'Aire acondicionado con mando en el salón. Cafetera de cápsulas disponible.',
      localRecommendations: ['Supermercado a 100 metros en la misma calle.'],
      customChecklist: [
        'Ventilar todas las estancias',
        'Cambiar sábanas y toallas',
        'Desinfectar baño y cocina',
        'Revisar que no quedan objetos olvidados',
      ],
      modulesEnabled: {
        cleanings: true,
        guestGuide: true,
      },
      lastSyncedAt: 'Justo ahora',
    });

    setNewPropName('');
    setNewPropAddress('');
    setNewPropWifiSsid('');
    setNewPropWifiPass('');
    setNewPropDoorCode('');
    setNewPropIcal('');
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
              ? 'Alojamientos'
              : section === 'schedule' || section === 'team'
              ? 'Limpiezas & Equipo'
              : section === 'guests'
              ? 'Guía del Huésped'
              : section === 'invoices'
              ? 'Facturación'
              : 'Plan & Ajustes'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white p-2 rounded-lg border border-rose-800/40 transition"
              title="Cerrar sesión"
            >
              <LogOut size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 transition"
          >
            {mobileMenuOpen ? 'Cerrar ✕' : 'Menú ☰'}
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
                  Panel de Control
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {(
              [
                { id: 'overview', label: 'Mis Alojamientos', icon: Home },
                { id: 'schedule', label: 'Limpiezas & Equipo', icon: Calendar },
                { id: 'guests', label: 'Guía del Huésped', icon: UserCheck },
                { id: 'invoices', label: 'Facturas & IVA 10%', icon: FileText, badge: 'IVA 10%' },
                { id: 'billing', label: 'Plan & Suscripción', icon: CreditCard },
              ] as const
            ).map((item) => {
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
                  {'badge' in item && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
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
                <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold shrink-0 rounded-full border border-emerald-500/30">
                  14d Trial
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-700/70 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Plan activo:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSection('billing');
                    setMobileMenuOpen(false);
                  }}
                  className="font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition"
                  title="Gestionar plan y suscripción"
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
                <span>Cerrar sesión</span>
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
              Alojamientos Activos (iCal)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                0{properties.length}
                <span className="text-base font-normal text-slate-400"> / {maxAllowedProperties}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                ● Sincronizados
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2 hover:border-slate-300 transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Limpiezas Hoy
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-orange-600 tracking-tight">
                0{urgentCount}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">
                Prioridad 11:00 → 15:00
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-2 hover:border-slate-300 transition">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Ingresos Extras & Upsell
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                +{upsellRevenue} €
              </span>
              <span className="text-xs font-medium text-slate-500">
                0% comisión (100% tuyo)
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
                  Gestión por Alojamiento
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                  Alojamientos, Guías Digitales y Enlaces iCal
                </h1>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowIcalModal(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm"
                >
                  <RefreshCw size={14} className="text-orange-600" />
                  <span>Sincronizar iCal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPropModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm"
                >
                  <Plus size={15} />
                  <span>Nuevo Alojamiento</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {properties.map((prop) => {
                const cleaner = cleaners.find((c) => c.id === prop.defaultCleanerId);
                const propReservations = reservations.filter((r) => r.propertyId === prop.id);
                const publicGuideUrl = `${window.location.origin}/g/${prop.slug}`;

                return (
                  <div
                    key={prop.id}
                    className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 inline-flex items-center gap-1.5">
                              ● iCal Conectado
                            </span>
                            <span className="text-slate-400 text-xs">·</span>
                            <span className="text-xs text-slate-500">{prop.lastSyncedAt}</span>
                          </div>
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
                            {prop.name}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">{prop.address}</p>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                            Horario base
                          </span>
                          <span className="font-semibold text-slate-800 bg-slate-100 rounded-md px-2 py-0.5 inline-block mt-1">
                            IN {prop.checkInTime} · OUT {prop.checkOutTime}
                          </span>
                        </div>
                      </div>

                      {/* Estado de los módulos en este alojamiento */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                            Módulo Limpiezas
                          </span>
                          <span className="font-semibold text-slate-900 mt-1 block">
                            {prop.modulesEnabled.cleanings
                              ? `Activo · ${cleaner?.name}`
                              : 'Desactivado'}
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                            Módulo Guía Huésped
                          </span>
                          <span className="font-semibold text-slate-900 mt-1 block">
                            {prop.modulesEnabled.guestGuide
                              ? `${prop.videos?.length || 0} vídeos · ${
                                  prop.extras?.filter((e) => e.active).length || 0
                                } extras`
                              : 'Desactivado'}
                          </span>
                        </div>
                      </div>

                      {/* URL pública de la Guía del Huésped */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="truncate min-w-0 flex-1">
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                            URL de la Guía (QR y Bienvenida)
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
                            {copiedId === `guide-${prop.id}` ? '✓ Copiado' : 'Copiar URL'}
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
                              ? '✓ Plantilla Copiada'
                              : 'Plantilla WhatsApp'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Acciones del alojamiento */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50/70 border-t border-slate-100 p-3 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setCustomizingProperty(prop)}
                        className="bg-slate-900 hover:bg-slate-800 text-white py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <Settings size={13} className="text-orange-400" />
                        <span>Personalizar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          propReservations[0] && onOpenGuestPreview(propReservations[0].id)
                        }
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <ExternalLink size={13} />
                        <span>Ver Guía</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cleaner && onOpenCleanerPreview(cleaner.id)}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <Users size={13} />
                        <span>App Limpieza</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQrModalProperty(prop)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition font-semibold"
                      >
                        <Printer size={13} />
                        <span>Cartel QR</span>
                      </button>
                    </div>
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
                  Operativa de Salidas y Limpiezas
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                  {cleaningsSubTab === 'schedule'
                    ? 'Cuadrante de Salidas, Limpiezas y Late Check-out'
                    : 'Personal de Limpieza, Enlaces Móviles y Tarifas'}
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
                  <span>Cuadrante ({filteredTasks.length})</span>
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
                  <span>Equipo ({cleaners.length})</span>
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
                      <span>Timeline Semanal (Gantt)</span>
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
                                  Tarifa: <strong className="text-slate-900">{prop?.cleaningFee || 40} €</strong>
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
            )}
          </div>
        )}
      </div>
    )}

        {/* VISTA 4: HUÉSPEDES, HORARIOS PREVISTOS & EXTRAS SOLICITADOS */}
        {section === 'guests' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-full inline-block">
                  Datos en vivo desde la Guía del Huésped (/g/:slug)
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                  Horarios de Llegada/Salida, Confirmaciones y Extras
                </h2>
              </div>
            </div>

            {/* Barra de Filtros Huéspedes */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar huésped por nombre..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={guestPropertyFilter}
                onChange={(e) => setGuestPropertyFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los alojamientos ({properties.length})</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Huésped / Canal</th>
                    <th className="py-3.5 px-4">Alojamiento</th>
                    <th className="py-3.5 px-4">Hora Llegada / Salida</th>
                    <th className="py-3.5 px-4">Extras Solicitados</th>
                    <th className="py-3.5 px-4">Estado Guía</th>
                    <th className="py-3.5 px-5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations
                    .filter((r) => {
                      if (guestPropertyFilter !== 'all' && r.propertyId !== guestPropertyFilter) return false;
                      if (guestSearch.trim()) {
                        const q = guestSearch.toLowerCase();
                        const prop = properties.find((p) => p.id === r.propertyId);
                        if (!r.guestName.toLowerCase().includes(q) && !prop?.name.toLowerCase().includes(q)) return false;
                      }
                      return true;
                    })
                    .map((res) => {
                    const prop = properties.find((p) => p.id === res.propertyId);
                    const reqCount = (res.requestedExtras || []).length;

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-900 block">{res.guestName}</span>
                          <span className="text-xs text-slate-500">
                            {res.source} · {res.checkIn} → {res.checkOut}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-800">
                          {prop?.name}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="block text-slate-800">
                            In: <strong>{res.estimatedArrivalTime || prop?.checkInTime || '15:00'}h</strong>
                          </span>
                          <span className="block text-slate-500">
                            Out:{' '}
                            <strong>
                              {res.lateCheckoutApproved
                                ? `${prop?.lateCheckoutUntil}h (Late)`
                                : `${res.estimatedDepartureTime || prop?.checkOutTime || '11:00'}h`}
                            </strong>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <div className="space-y-1.5">
                            {res.lateCheckoutApproved ? (
                              <span className="inline-block px-2.5 py-0.5 font-semibold text-xs rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ✓ Late Check-out activo
                              </span>
                            ) : res.lateCheckoutRequested ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 font-semibold text-xs rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                                  Late Check-out pedido
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onApproveLateCheckout(res.id)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-2.5 py-0.5 text-xs rounded-md shadow-sm transition"
                                >
                                  Aprobar
                                </button>
                              </div>
                            ) : null}

                            {(res.requestedExtras || []).map((extraId) => {
                              const ext = prop?.extras?.find((e) => e.id === extraId);
                              const isApproved = res.approvedExtras?.includes(extraId);
                              if (!ext || ext.onlyWhenFreeNextDay) return null;
                              return (
                                <div key={extraId} className="flex items-center gap-1.5 pt-0.5">
                                  <span
                                    className={`px-2 py-0.5 font-semibold text-xs rounded-md ${
                                      isApproved
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    }`}
                                  >
                                    {ext.title} ({ext.price}€) {isApproved ? '✓' : ''}
                                  </span>
                                  {!isApproved && onApproveExtra && (
                                    <button
                                      type="button"
                                      onClick={() => onApproveExtra(res.id, extraId)}
                                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-2 py-0.5 text-xs rounded-md shadow-sm transition"
                                    >
                                      Aprobar
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {!res.lateCheckoutApproved &&
                              !res.lateCheckoutRequested &&
                              reqCount === 0 && (
                                <span className="text-slate-400">Ninguno aún</span>
                              )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs space-y-1">
                          {res.guestArrivedAt ? (
                            <span className="block text-emerald-700 font-semibold">
                              ✓ Llegó a las {res.guestArrivedAt}
                            </span>
                          ) : res.arrivalInstructionsConfirmed ? (
                            <span className="block text-slate-800 font-medium">
                              ✓ Instrucciones leídas
                            </span>
                          ) : (
                            <span className="block text-slate-400">Pendiente de lectura</span>
                          )}
                        </td>
                        <td className="py-4 px-5 space-y-1.5 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => onOpenGuestPreview(res.id)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition text-center shadow-sm"
                          >
                            Abrir Guía
                          </button>
                          <button
                            type="button"
                            onClick={() => sendGuestGuideWhatsApp(res)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-sm"
                            title="Enviar enlace directo de la guía por WhatsApp al huésped"
                          >
                            <Send size={11} />
                            <span>WhatsApp Guía</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA FISCAL: FACTURAS A HUÉSPEDES & IVA 10% (MODELO 303) */}
        {section === 'invoices' && (
          <div className="space-y-8">
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
                  Facturación y Plan de Suscripción
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
                      {hostAccount?.subscriptionStatus === 'active'
                        ? 'Suscripción Activa (Stripe Billing)'
                        : `Periodo de prueba gratuito activo hasta el ${hostAccount?.trialEndsAt || 'próximo mes'}`}
                    </p>
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
                        const stripeUrl = (STRIPE_PAYMENT_LINKS as Record<string, string>)[planKey] || STRIPE_PAYMENT_LINKS.plan_pro;
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
                        : `Activar ${hostAccount?.plan === 'plan_manager' ? 'Microgestora' : 'Pro Fiscal'} en Stripe Checkout →`}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProperty}
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Nuevo Alojamiento</h3>
              <button
                type="button"
                onClick={() => setShowNewPropModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <input
              required
              placeholder="Nombre del alojamiento (ej. Ático Malasaña)"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              placeholder="Dirección completa"
              value={newPropAddress}
              onChange={(e) => setNewPropAddress(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              placeholder="WhatsApp del anfitrión (+34...)"
              value={newPropWhatsapp}
              onChange={(e) => setNewPropWhatsapp(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              placeholder="URL iCal de Airbnb o Booking (.ics)"
              value={newPropIcal}
              onChange={(e) => setNewPropIcal(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                placeholder="Red WiFi"
                value={newPropWifiSsid}
                onChange={(e) => setNewPropWifiSsid(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                placeholder="Clave WiFi"
                value={newPropWifiPass}
                onChange={(e) => setNewPropWifiPass(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <input
              placeholder="Código Puerta / Cajetín de Llaves"
              value={newPropDoorCode}
              onChange={(e) => setNewPropDoorCode(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-sm mt-2"
            >
              Crear Alojamiento
            </button>
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
            onUpdateProperty(updated);
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
                  <div key={item.id} className="flex items-center gap-2 text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item.label}</span>
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

      {/* Modal Aviso Enlace Stripe No Configurado */}
      {showStripeNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold text-lg">
                  💳
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Enlace de Stripe pendiente</h3>
                  <p className="text-xs text-slate-500">Configuración de cobro para suscripciones reales</p>
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

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Aún no has vinculado tu <strong>Enlace de Pago de Stripe (Payment Link)</strong> para el plan {hostAccount?.plan === 'plan_manager' ? 'Microgestora' : 'Pro Fiscal'}.
              </p>
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2.5 text-slate-700">
                <span className="font-bold text-slate-900 block text-xs">¿Cómo configurarlo en 2 minutos?</span>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600">
                  <li>Inicia sesión en tu cuenta de <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold underline">Stripe Dashboard ↗</a>.</li>
                  <li>Ve a <strong>Enlaces de Pago</strong> y crea uno recurrente para <em>Pro Fiscal (19€/mes)</em> o <em>Microgestora (39€/mes)</em>.</li>
                  <li>Copia la URL (ej: <code>https://buy.stripe.com/...</code>) y añádela a tu archivo <code>.env</code>:
                    <pre className="mt-1.5 p-2.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] overflow-x-auto font-mono">
{`VITE_STRIPE_LINK_PRO=https://buy.stripe.com/...
VITE_STRIPE_LINK_MANAGER=https://buy.stripe.com/...`}
                    </pre>
                  </li>
                </ol>
              </div>
              <p className="text-[11px] text-slate-400">
                Mientras lo configuras, puedes seguir probando todas las funciones en tu periodo de prueba activo de 14 días.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStripeNoticeModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
