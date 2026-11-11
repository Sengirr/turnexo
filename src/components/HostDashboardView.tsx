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
  const [section, setSection] = useState<BackofficeSection>('schedule');
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
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] flex flex-col lg:flex-row overflow-x-hidden">
      {/* BARRA SUPERIOR PARA MÓVIL */}
      <div className="lg:hidden bg-[#141413] text-[#F6F4EE] px-4 py-3 border-b border-[#2C2C29] flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C85A32] text-white flex items-center justify-center font-mono font-bold text-xs">
            TX
          </div>
          <span className="font-bold text-sm tracking-tight">Turnexo</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-xs text-white/80 font-medium truncate max-w-[140px]">
            {section === 'schedule'
              ? 'Limpiezas'
              : section === 'guests'
              ? 'Guías'
              : section === 'invoices'
              ? 'Facturas'
              : section === 'overview'
              ? 'Alojamientos'
              : section === 'team'
              ? 'Equipo'
              : 'Plan'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 hover:text-white p-1.5 border border-rose-800/50"
              title="Cerrar sesión"
            >
              <LogOut size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold px-3 py-1.5 flex items-center gap-1.5 border border-white/20"
          >
            {mobileMenuOpen ? 'Cerrar ✕' : 'Menú ☰'}
          </button>
        </div>
      </div>

      {/* BARRA LATERAL IZQUIERDA ESTILO SOFTWARE PROFESIONAL */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-64 bg-[#141413] text-[#F6F4EE] shrink-0 flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2C2C29]`}
      >
        <div className="p-6 space-y-8">
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#C85A32] text-white flex items-center justify-center font-mono font-bold text-xs">
                TX
              </div>
              <div>
                <span className="font-bold text-base tracking-tight block leading-none">
                  Turnexo
                </span>
                <span className="font-mono text-[10px] text-white/45 uppercase tracking-wider">
                  HOST WORKSPACE
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {(
              [
                { id: 'schedule', label: 'Limpiezas & Salidas', icon: Calendar },
                { id: 'guests', label: 'Guía del Huésped', icon: UserCheck },
                { id: 'invoices', label: 'Facturas & IVA 10%', icon: FileText, badge: 'IVA 10%' },
                { id: 'overview', label: 'Mis Alojamientos', icon: Home },
                { id: 'team', label: 'Equipo de Limpieza', icon: Users },
                { id: 'billing', label: 'Plan & Suscripción', icon: CreditCard },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition ${
                    active
                      ? 'bg-[#C85A32] text-white'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </div>
                  {'badge' in item && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-6 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              ACCIONES RÁPIDAS
            </p>
            <button
              type="button"
              onClick={() => {
                setPreselectedResIdForInvoice(undefined);
                setShowCreateInvoiceModal(true);
              }}
              className="w-full text-left px-3 py-2 text-xs font-mono text-emerald-300 hover:text-white bg-emerald-950/40 border border-emerald-800/40 hover:bg-emerald-900/60 flex items-center gap-2 transition"
            >
              <FileText size={13} className="text-emerald-400" />
              <span>+ Emitir Factura 10%</span>
            </button>
            <button
              type="button"
              onClick={() => setShowIcalModal(true)}
              className="w-full text-left px-3 py-2 text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-2 transition"
            >
              <RefreshCw size={13} className="text-[#C85A32]" />
              <span>Sincronizar URL .ics</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewPropModal(true)}
              className="w-full text-left px-3 py-2 text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-2 transition"
            >
              <Plus size={13} className="text-[#C85A32]" />
              <span>Añadir Propiedad</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 space-y-4 text-xs">
          {hostAccount && (
            <div className="bg-white/5 border border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white truncate">{hostAccount.fullName}</span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#1F4E3D] text-white">
                  14d Trial
                </span>
              </div>
              <p className="font-mono text-[10px] text-white/50 truncate">
                {hostAccount.companyName}
              </p>
              {onChangePlan && (
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-white/40 mb-1">
                    MÓDULO CONTRATADO:
                  </label>
                  <select
                    value={hostAccount.plan}
                    onChange={(e) => onChangePlan(e.target.value as HostAccount['plan'])}
                    className="w-full bg-[#141413] border border-white/20 text-white font-mono text-[10px] px-2 py-1.5 focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="plan_starter">Starter (1 Alojamiento · 0€)</option>
                    <option value="plan_pro">Pro Fiscal (Hasta 5 Alojamientos · 19€/mes)</option>
                    <option value="plan_manager">Microgestora (Hasta 10 Alojamientos · 39€/mes)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-xs font-mono text-rose-300 hover:text-white bg-rose-950/40 border border-rose-800/40 hover:bg-rose-900/60 flex items-center gap-2 transition"
              >
                <LogOut size={13} className="text-rose-400" />
                <span>Cerrar sesión</span>
              </button>
            )}

            <div className="flex items-center justify-between text-white/60 text-[11px] font-mono">
              <button
                type="button"
                onClick={onBackToLanding}
                className="hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                Web Pública (/)
              </button>

              <button
                type="button"
                onClick={onResetDemo}
                title="Restaurar datos iniciales"
                className="text-white/40 hover:text-white p-1"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Franja de Métricas Operativas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#D5CFC0] border border-[#D5CFC0]">
          <div className="bg-[#FAF9F5] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F]">
              ALOJAMIENTOS ACTIVOS (ICAL)
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-3xl font-bold text-[#141413]">
                0{properties.length}
                <span className="text-sm font-normal text-[#57554F]"> / {maxAllowedProperties}</span>
              </span>
              <span className="font-mono text-[11px] text-[#1F4E3D] font-semibold">
                ● Sincronizados
              </span>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F]">
              ROTACIONES HOY (MISMO DÍA)
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-3xl font-bold text-[#C85A32]">
                0{urgentCount}
              </span>
              <span className="font-mono text-[11px] text-[#57554F]">
                Prioridad 11:00 → 15:00
              </span>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F]">
              INGRESOS EXTRAS & LATE CHECK-OUT
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-3xl font-bold text-[#1F4E3D]">
                +{upsellRevenue} €
              </span>
              <span className="font-mono text-[11px] text-[#57554F]">
                0% comisión (100% tuyo)
              </span>
            </div>
          </div>
        </div>

        {/* VISTA 1: ALOJAMIENTOS Y PERSONALIZACIÓN DE GUÍA */}
        {section === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD2] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  GESTIÓN POR ALOJAMIENTO
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141413] mt-0.5">
                  Alojamientos, Guías Digitales y Enlaces iCal
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPropModal(true)}
                className="bg-[#141413] hover:bg-[#2C2C29] text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2"
              >
                <Plus size={14} />
                Nuevo Alojamiento
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {properties.map((prop) => {
                const cleaner = cleaners.find((c) => c.id === prop.defaultCleanerId);
                const propReservations = reservations.filter((r) => r.propertyId === prop.id);
                const publicGuideUrl = `${window.location.origin}/g/${prop.slug}`;

                return (
                  <div
                    key={prop.id}
                    className="bg-[#FAF9F5] border border-[#D5CFC0] flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3 border-b border-[#E2DDD2] pb-4">
                        <div>
                          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                            <span className="text-[#1F4E3D] font-bold">● ICAL CONECTADO</span>
                            <span className="text-[#57554F]">·</span>
                            <span className="text-[#57554F]">{prop.lastSyncedAt}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413] mt-1">
                            {prop.name}
                          </h2>
                          <p className="text-xs text-[#57554F]">{prop.address}</p>
                        </div>

                        <div className="text-right font-mono text-xs">
                          <span className="text-[10px] text-[#57554F] uppercase block">
                            HORARIO BASE
                          </span>
                          <span className="font-bold text-[#141413]">
                            IN {prop.checkInTime} · OUT {prop.checkOutTime}
                          </span>
                        </div>
                      </div>

                      {/* Estado de los módulos en este alojamiento */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-white border border-[#E2DDD2] p-3">
                          <span className="text-[10px] text-[#57554F] uppercase block">
                            MÓDULO LIMPIEZAS
                          </span>
                          <span className="font-bold text-[#141413] mt-0.5 block">
                            {prop.modulesEnabled.cleanings
                              ? `Activo · ${cleaner?.name}`
                              : 'Desactivado'}
                          </span>
                        </div>
                        <div className="bg-white border border-[#E2DDD2] p-3">
                          <span className="text-[10px] text-[#57554F] uppercase block">
                            MÓDULO GUÍA HUÉSPED
                          </span>
                          <span className="font-bold text-[#141413] mt-0.5 block">
                            {prop.modulesEnabled.guestGuide
                              ? `${prop.videos?.length || 0} vídeos · ${
                                  prop.extras?.filter((e) => e.active).length || 0
                                } extras`
                              : 'Desactivado'}
                          </span>
                        </div>
                      </div>

                      {/* URL pública de la Guía del Huésped */}
                      <div className="bg-white border border-[#E2DDD2] p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="truncate">
                          <span className="font-mono text-[10px] uppercase text-[#57554F] block">
                            URL PÚBLICA DE LA GUÍA (QR Y MENSAJE DE BIENVENIDA)
                          </span>
                          <span className="font-mono text-xs text-[#141413]">
                            {publicGuideUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyLink(publicGuideUrl, `guide-${prop.id}`)}
                            className="border border-[#D5CFC0] px-2.5 py-1.5 font-mono text-[11px] font-bold hover:bg-[#F6F4EE]"
                          >
                            {copiedId === `guide-${prop.id}` ? 'COPIADO' : 'COPIAR URL'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const tpl = `🇪🇸 ¡Hola! Aquí tienes la guía interactiva de tu alojamiento (${prop.name}) con el vídeo paso a paso para entrar, los códigos de acceso y el WiFi:\n👉 ${publicGuideUrl}\n\n🇬🇧 Hi! Here is your interactive guest guide (${prop.name}) with the step-by-step check-in video, door codes and WiFi:\n👉 ${publicGuideUrl}`;
                              copyLink(tpl, `tpl-${prop.id}`);
                            }}
                            className="bg-[#1F4E3D] text-white px-2.5 py-1.5 font-mono text-[11px] font-bold hover:bg-[#163A2D]"
                          >
                            {copiedId === `tpl-${prop.id}`
                              ? '✓ PLANTILLA COPIADA'
                              : 'PLANTILLA AIRBNB/BOOKING'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Acciones del alojamiento */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#D5CFC0] border-t border-[#D5CFC0] font-mono text-[11px] font-bold uppercase">
                      <button
                        type="button"
                        onClick={() => setCustomizingProperty(prop)}
                        className="bg-[#141413] hover:bg-[#2C2C29] text-white py-3.5 px-3 flex items-center justify-center gap-1.5 transition"
                      >
                        <Settings size={13} className="text-[#C85A32]" />
                        <span>Personalizar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          propReservations[0] && onOpenGuestPreview(propReservations[0].id)
                        }
                        className="bg-[#FAF9F5] hover:bg-white text-[#141413] py-3.5 px-3 flex items-center justify-center gap-1.5 transition"
                      >
                        <ExternalLink size={13} />
                        <span>Ver Guía</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cleaner && onOpenCleanerPreview(cleaner.id)}
                        className="bg-[#FAF9F5] hover:bg-white text-[#141413] py-3.5 px-3 flex items-center justify-center gap-1.5 transition"
                      >
                        <Users size={13} />
                        <span>App Limpieza</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQrModalProperty(prop)}
                        className="bg-[#FAF9F5] hover:bg-white text-[#1F4E3D] py-3.5 px-3 flex items-center justify-center gap-1.5 transition"
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

        {/* VISTA 2: CUADRANTE DE SALIDAS Y APROBACIÓN DE LATE CHECK-OUT */}
        {(section === 'overview' || section === 'schedule') && (
          <div className="space-y-4 pt-4">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD2] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold">
                  SINCRONIZACIÓN EN TIEMPO REAL · ICAL AIRBNB & BOOKING
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
                  Cuadrante de Salidas, Limpiezas y Late Check-out
                </h2>
              </div>

              {/* Botones de Cambio de Vista: Tabla vs Timeline Semanal */}
              <div className="flex items-center gap-1 bg-[#E8E4D9] p-1 border border-[#D5CFC0]">
                <button
                  type="button"
                  onClick={() => setScheduleView('table')}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition ${
                    scheduleView === 'table'
                      ? 'bg-[#141413] text-white shadow-sm'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  <List size={13} />
                  <span>Vista Tabla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView('timeline')}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition ${
                    scheduleView === 'timeline'
                      ? 'bg-[#141413] text-white shadow-sm'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Timeline Semanal (Gantt)</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                {/* Buscador */}
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-[#57554F]" />
                  <input
                    type="text"
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    placeholder="Buscar por huésped, alojamiento o personal de limpieza..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D5CFC0] text-xs font-medium text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  {scheduleSearch && (
                    <button
                      type="button"
                      onClick={() => setScheduleSearch('')}
                      className="absolute right-2 top-2 text-[#57554F] hover:text-[#141413] text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtro Propiedad */}
                <select
                  value={schedulePropertyFilter}
                  onChange={(e) => setSchedulePropertyFilter(e.target.value)}
                  className="bg-white border border-[#D5CFC0] px-3 py-1.5 font-semibold text-[#141413] text-xs"
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
              <div className="flex flex-wrap items-center gap-1">
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
                    className={`px-2.5 py-1 text-[11px] font-mono font-bold transition ${
                      scheduleStatusFilter === st.id
                        ? 'bg-[#C85A32] text-white'
                        : 'bg-white border border-[#D5CFC0] text-[#57554F] hover:text-[#141413]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Renderizado de Vista: Tabla o Timeline */}
            {filteredTasks.length === 0 ? (
              <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-10 text-center space-y-2">
                <p className="font-bold text-sm text-[#141413]">No hay tareas que coincidan con los filtros</p>
                <p className="text-xs text-[#57554F]">Prueba a limpiar la búsqueda o cambiar el filtro de estado.</p>
                <button
                  type="button"
                  onClick={() => {
                    setScheduleSearch('');
                    setSchedulePropertyFilter('all');
                    setScheduleStatusFilter('all');
                  }}
                  className="font-mono text-xs uppercase font-bold text-[#C85A32] underline pt-2"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : scheduleView === 'table' ? (
              <div className="bg-[#FAF9F5] border border-[#D5CFC0] overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D5CFC0] bg-[#E8E4D9]/50 font-mono text-[10px] text-[#57554F] uppercase tracking-wider">
                      <th className="py-3.5 px-4">Fecha Salida</th>
                      <th className="py-3.5 px-4">Propiedad</th>
                      <th className="py-3.5 px-4">Huésped / Canal</th>
                      <th className="py-3.5 px-4">Estado Rotación & Late Check-out</th>
                      <th className="py-3.5 px-4">Hora Limpieza</th>
                      <th className="py-3.5 px-4">Asignación</th>
                      <th className="py-3.5 px-4">Verificación</th>
                      <th className="py-3.5 px-4 text-right">Despacho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DDD2]">
                    {filteredTasks.map((task) => {
                      const prop = properties.find((p) => p.id === task.propertyId);
                      const res = reservations.find((r) => r.id === task.reservationId);
                      const cleaner = cleaners.find((c) => c.id === task.cleanerId);

                      return (
                        <tr key={task.id} className="hover:bg-white transition">
                          <td className="py-4 px-4 font-mono font-bold text-[#141413] whitespace-nowrap">
                            {task.date}
                          </td>
                          <td className="py-4 px-4 font-bold text-[#141413]">{prop?.name}</td>
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => res && onOpenGuestPreview(res.id)}
                              className="font-semibold text-[#141413] hover:text-[#C85A32] underline underline-offset-2 flex items-center gap-1"
                            >
                              <span>{res?.guestName}</span>
                              <span className="font-mono text-[10px] text-[#57554F]">
                                [{res?.source}]
                              </span>
                            </button>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px]">
                            {task.sameDayCheckIn ? (
                              <span className="inline-flex items-center gap-1.5 bg-[#C85A32]/15 text-[#C85A32] font-bold px-2.5 py-1">
                                <Flame size={12} />
                                ENTRADA HOY ({task.nextCheckInTime}H)
                              </span>
                            ) : task.lateCheckoutActive ? (
                              <span className="inline-flex items-center gap-1.5 bg-[#1F4E3D] text-white font-bold px-2.5 py-1">
                                <CheckCircle2 size={12} />
                                LATE CHECK-OUT HASTA {task.scheduledCleaningTime}H (+
                                {prop?.lateCheckoutPrice}€)
                              </span>
                            ) : res?.lateCheckoutRequested ? (
                              <div className="flex items-center gap-2">
                                <span className="bg-amber-200 text-[#141413] font-bold px-2.5 py-1">
                                  SOLICITADO POR HUÉSPED
                                </span>
                                <button
                                  type="button"
                                  onClick={() => res && onApproveLateCheckout(res.id)}
                                  className="bg-[#141413] text-white font-bold px-3 py-1 hover:bg-[#2C2C29]"
                                >
                                  APROBAR ({prop?.lateCheckoutUntil}H)
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[#57554F]">Tarde libre</span>
                                <button
                                  type="button"
                                  onClick={() => res && onApproveLateCheckout(res.id)}
                                  className="text-[#C85A32] font-bold underline"
                                >
                                  Conceder Late Check-out
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold">
                            <span
                              className={`px-2.5 py-1 ${
                                task.lateCheckoutActive
                                  ? 'bg-[#1F4E3D] text-white'
                                  : 'bg-[#E8E4D9] text-[#141413]'
                              }`}
                            >
                              {task.scheduledCleaningTime}h
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={task.cleanerId}
                              onChange={(e) => onAssignCleaner(task.id, e.target.value)}
                              className="bg-white border border-[#D5CFC0] px-2.5 py-1.5 font-semibold text-[#141413]"
                            >
                              {cleaners.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px]">
                            {task.photosUploaded.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => setInspectingTaskPhotos(task)}
                                className="inline-flex items-center gap-1.5 text-[#1F4E3D] hover:text-[#141413] font-bold underline underline-offset-2"
                                title="Ver comprobación de fotos y checklist"
                              >
                                <Camera size={13} />
                                <span>✓ FOTOS COMPROBADAS ({task.photosUploaded.length})</span>
                              </button>
                            ) : task.status === 'completed' ? (
                              <span className="text-[#1F4E3D] font-bold">
                                ✓ COMPLETADA (0 FOTOS)
                              </span>
                            ) : (
                              <span className="text-[#57554F]">
                                PENDIENTE ({task.photosUploaded.length} FOTOS)
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
                                className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-2 py-1 font-mono text-[10px] font-bold uppercase transition"
                              >
                                <FileText size={11} className="text-emerald-600" />
                                <span>Factura 10%</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => sendTaskWhatsApp(task)}
                                title="Enviar detalles de la limpieza por WhatsApp al personal"
                                className="inline-flex items-center gap-1 bg-[#1F4E3D] hover:bg-[#163A2D] text-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition"
                              >
                                <Send size={11} />
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
            ) : (
              /* Vista Timeline Semanal / Gantt */
              <div className="space-y-4">
                {Array.from(new Set(filteredTasks.map((t) => t.date))).sort().map((dateStr) => {
                  const dayTasks = filteredTasks.filter((t) => t.date === dateStr);
                  return (
                    <div key={dateStr} className="bg-[#FAF9F5] border border-[#D5CFC0]">
                      <div className="bg-[#E8E4D9] px-4 py-2 border-b border-[#D5CFC0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#C85A32]" />
                          <span className="font-mono text-xs font-bold text-[#141413] uppercase">
                            Fecha de Salida: {dateStr}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] uppercase bg-white border border-[#D5CFC0] px-2 py-0.5 font-bold text-[#57554F]">
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
                              className={`p-4 border bg-white space-y-3 ${
                                task.sameDayCheckIn
                                  ? 'border-l-4 border-l-[#C85A32] border-[#D5CFC0]'
                                  : task.lateCheckoutActive
                                  ? 'border-l-4 border-l-[#1F4E3D] border-[#D5CFC0]'
                                  : 'border-[#D5CFC0]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-sm text-[#141413] block">
                                    {prop?.name}
                                  </span>
                                  <span className="text-xs text-[#57554F]">
                                    Huésped saliente: <strong>{res?.guestName}</strong> [{res?.source}]
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-bold bg-[#141413] text-white px-2 py-1">
                                  {task.scheduledCleaningTime}h
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                                {task.sameDayCheckIn && (
                                  <span className="bg-[#C85A32]/15 text-[#C85A32] font-bold px-2 py-0.5 flex items-center gap-1">
                                    <Flame size={11} /> ENTRADA HOY {task.nextCheckInTime}h
                                  </span>
                                )}
                                {task.lateCheckoutActive && (
                                  <span className="bg-[#1F4E3D] text-white font-bold px-2 py-0.5">
                                    ✓ LATE CHECK-OUT ACTIVO
                                  </span>
                                )}
                                <span className="bg-[#FAF9F5] border border-[#E2DDD2] text-[#57554F] px-2 py-0.5">
                                  Personal: <strong>{cleaner?.name}</strong>
                                </span>
                                <span className="bg-[#FAF9F5] border border-[#E2DDD2] text-[#57554F] px-2 py-0.5">
                                  Tarifa: <strong>{prop?.cleaningFee || 40} €</strong>
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#E2DDD2]">
                                <span className="font-mono text-[10px] text-[#57554F]">
                                  {task.photosUploaded.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => setInspectingTaskPhotos(task)}
                                      className="inline-flex items-center gap-1 text-[#1F4E3D] font-bold hover:underline"
                                      title="Ver fotos y checklist"
                                    >
                                      <Camera size={11} />
                                      <span>✓ Verificada ({task.photosUploaded.length} fotos)</span>
                                    </button>
                                  ) : task.status === 'completed' ? (
                                    <strong className="text-[#1F4E3D]">✓ Completada (0 fotos)</strong>
                                  ) : (
                                    '⏳ Pendiente de realización'
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => sendTaskWhatsApp(task)}
                                  className="bg-[#1F4E3D] hover:bg-[#163A2D] text-white font-mono text-[10px] uppercase font-bold px-2.5 py-1 flex items-center gap-1"
                                >
                                  <Send size={10} />
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
        )}

        {/* VISTA 3: ENLACES Y LIQUIDACIONES DE LIMPIADORAS */}
        {(section === 'overview' || section === 'team') && (
          <div className="space-y-6 pt-4">
            <div className="border-b border-[#E2DDD2] pb-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F] font-bold">
                  GESTIÓN DEL EQUIPO & LIQUIDACIÓN DE PAGOS
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
                  Personal de Limpieza, Enlaces Móviles y Tarifas Devengadas
                </h2>
              </div>
              <div className="font-mono text-xs text-[#57554F] bg-[#FAF9F5] border border-[#D5CFC0] px-3 py-1.5">
                Total devengado equipo:{' '}
                <strong className="text-[#141413]">
                  {tasks.reduce((sum, t) => {
                    const p = properties.find((prop) => prop.id === t.propertyId);
                    return sum + (p?.cleaningFee || 40);
                  }, 0)}{' '}
                  €
                </strong>
              </div>
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
                    className="bg-[#FAF9F5] border border-[#D5CFC0] p-5 flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-[#141413]">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] uppercase bg-[#E8E4D9] px-2 py-0.5 font-bold">
                            ACTIVA
                          </span>
                          {onDeleteCleaner && cleaners.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteCleaner(c.id)}
                              className="text-rose-500 hover:text-rose-700 text-xs px-1"
                              title="Eliminar limpiadora"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[#57554F]">{c.phone}</p>

                      {/* Tarjeta de métricas devengadas */}
                      <div className="bg-white border border-[#E2DDD2] p-3 space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-[#57554F] text-[11px]">
                          <span>Servicios asignados:</span>
                          <strong className="text-[#141413]">{cleanerTasks.length} ({completedCount} hechos)</strong>
                        </div>
                        <div className="flex justify-between text-[#57554F] text-[11px] border-t border-[#E2DDD2] pt-1">
                          <span>Total devengado:</span>
                          <strong className="text-[#1F4E3D] text-sm font-bold">{totalAccrued} €</strong>
                        </div>
                      </div>

                      <p className="font-mono text-[11px] text-[#141413] bg-white border border-[#E2DDD2] px-2.5 py-1.5 truncate">
                        {cleanerUrl}
                      </p>
                    </div>

                    <div className="space-y-2 font-mono text-xs font-bold uppercase">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copyCleanerSettlement(c)}
                          className="flex-1 bg-white border border-[#141413] py-2 flex items-center justify-center gap-1.5 hover:bg-[#141413] hover:text-white transition text-[11px]"
                          title="Copiar desglose completo para pago vía Bizum o transferencia"
                        >
                          {copiedSettlementCleanerId === c.id ? <CheckCheck size={13} className="text-[#1F4E3D]" /> : <Copy size={13} />}
                          <span>{copiedSettlementCleanerId === c.id ? '¡Copiado!' : 'Liquidación'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadCleanerSettlementCsv(c)}
                          className="bg-white border border-[#141413] px-3 py-2 flex items-center justify-center hover:bg-[#141413] hover:text-white transition"
                          title="Descargar liquidación en CSV"
                        >
                          <Download size={13} />
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
                          className="flex-1 bg-[#1F4E3D] hover:bg-[#163A2D] text-white py-2 flex items-center justify-center gap-1.5 transition text-[11px]"
                        >
                          <Send size={12} />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCleanerPreview(c.id)}
                          className="bg-[#141413] hover:bg-[#2C2C29] text-white px-4 py-2 text-[11px]"
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
                className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 flex flex-col sm:flex-row gap-2 items-center"
              >
                <input
                  placeholder="Nombre de la nueva limpiadora (ej. Rocío Díaz)"
                  value={newCleanerName}
                  onChange={(e) => setNewCleanerName(e.target.value)}
                  className="flex-1 w-full bg-white border border-[#D5CFC0] px-3 py-2 text-xs"
                />
                <input
                  placeholder="Teléfono (+34...)"
                  value={newCleanerPhone}
                  onChange={(e) => setNewCleanerPhone(e.target.value)}
                  className="w-full sm:w-48 bg-white border border-[#D5CFC0] px-3 py-2 text-xs font-mono"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#141413] text-white font-mono text-xs font-bold uppercase px-4 py-2 shrink-0"
                >
                  + Crear Enlace /c/
                </button>
              </form>
            )}
          </div>
        )}

        {/* VISTA 4: HUÉSPEDES, HORARIOS PREVISTOS & EXTRAS SOLICITADOS */}
        {section === 'guests' && (
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD2] pb-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  DATOS EN VIVO DESDE LA GUÍA DEL HUÉSPED (/g/:slug)
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
                  Horarios de Llegada/Salida, Confirmaciones y Extras Solicitados
                </h2>
              </div>
            </div>

            {/* Barra de Filtros Huéspedes */}
            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-2.5 top-2.5 text-[#57554F]" />
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder="Buscar huésped por nombre..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D5CFC0] text-xs font-medium text-[#141413] focus:outline-none focus:border-[#141413]"
                />
              </div>

              <select
                value={guestPropertyFilter}
                onChange={(e) => setGuestPropertyFilter(e.target.value)}
                className="bg-white border border-[#D5CFC0] px-3 py-1.5 font-semibold text-[#141413] text-xs"
              >
                <option value="all">Todos los alojamientos ({properties.length})</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#FAF9F5] border border-[#D5CFC0] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D5CFC0] bg-[#F6F4EE] font-mono text-[10px] uppercase tracking-wider text-[#57554F]">
                    <th className="py-3.5 px-4">Huésped / Canal</th>
                    <th className="py-3.5 px-4">Alojamiento</th>
                    <th className="py-3.5 px-4">Hora Llegada / Salida</th>
                    <th className="py-3.5 px-4">Extras Solicitados</th>
                    <th className="py-3.5 px-4">Estado Guía</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD2]">
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
                      <tr key={res.id} className="hover:bg-white transition">
                        <td className="py-4 px-4">
                          <span className="font-bold text-[#141413] block">{res.guestName}</span>
                          <span className="font-mono text-[10px] uppercase text-[#57554F]">
                            {res.source} · {res.checkIn} → {res.checkOut}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-[#141413]">
                          {prop?.name}
                        </td>
                        <td className="py-4 px-4 font-mono">
                          <span className="block text-[#141413]">
                            In: <strong>{res.estimatedArrivalTime || prop?.checkInTime || '15:00'}h</strong>
                          </span>
                          <span className="block text-[#57554F]">
                            Out:{' '}
                            <strong>
                              {res.lateCheckoutApproved
                                ? `${prop?.lateCheckoutUntil}h (Late)`
                                : `${res.estimatedDepartureTime || prop?.checkOutTime || '11:00'}h`}
                            </strong>
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div className="space-y-1">
                            {res.lateCheckoutApproved ? (
                              <span className="inline-block px-2 py-0.5 font-bold uppercase bg-[#1F4E3D] text-white">
                                ✓ LATE CHECK-OUT ACTIVO
                              </span>
                            ) : res.lateCheckoutRequested ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  LATE CHECK-OUT PEDIDO
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onApproveLateCheckout(res.id)}
                                  className="bg-[#141413] text-white font-bold px-2 py-0.5 text-[10px] hover:bg-[#2C2C29]"
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
                                    className={`px-2 py-0.5 font-bold uppercase ${
                                      isApproved
                                        ? 'bg-[#1F4E3D] text-white'
                                        : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                    }`}
                                  >
                                    {ext.title} ({ext.price}€) {isApproved ? '✓' : ''}
                                  </span>
                                  {!isApproved && onApproveExtra && (
                                    <button
                                      type="button"
                                      onClick={() => onApproveExtra(res.id, extraId)}
                                      className="bg-[#141413] text-white font-bold px-2 py-0.5 text-[10px] hover:bg-[#2C2C29]"
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
                                <span className="text-[#57554F]">Ninguno aún</span>
                              )}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] space-y-1">
                          {res.guestArrivedAt ? (
                            <span className="block text-[#1F4E3D] font-bold">
                              ✓ Llegó a las {res.guestArrivedAt}
                            </span>
                          ) : res.arrivalInstructionsConfirmed ? (
                            <span className="block text-[#141413] font-semibold">
                              ✓ Instrucciones leídas
                            </span>
                          ) : (
                            <span className="block text-[#57554F]">Pendiente de lectura</span>
                          )}
                        </td>
                        <td className="py-4 px-4 space-y-1.5 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => onOpenGuestPreview(res.id)}
                            className="w-full bg-[#141413] hover:bg-[#2C2C29] text-white font-mono text-[10px] font-bold uppercase px-3 py-1.5 transition text-center"
                          >
                            Abrir Guía
                          </button>
                          <button
                            type="button"
                            onClick={() => sendGuestGuideWhatsApp(res)}
                            className="w-full bg-[#1F4E3D] hover:bg-[#163A2D] text-white font-mono text-[10px] font-bold uppercase px-3 py-1.5 flex items-center justify-center gap-1 transition"
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
            <div className="border-b border-[#E2DDD2] pb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                    RÉGIMEN FISCAL ALOJAMIENTOS TURÍSTICOS
                  </span>
                  <span className="text-xs text-[#57554F] font-semibold">
                    IVA 10% Obligatorio &lt; 30 días
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413] mt-1">
                  Facturas a Huéspedes & Libro de IVA
                </h2>
                <p className="text-xs text-[#57554F] mt-0.5">
                  Emisión legal de Facturas Simplificadas (&lt; 3.000 € sin DNI obligatorio) y resumen para el Modelo 303 de Hacienda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFiscalProfileModal(true)}
                  className="bg-white hover:bg-[#FAF9F5] border border-[#D5CFC0] text-[#141413] px-3.5 py-2 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition"
                >
                  <Building2 size={14} className="text-[#57554F]" />
                  <span>Mis Datos Fiscales</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedResIdForInvoice(undefined);
                    setShowCreateInvoiceModal(true);
                  }}
                  className="bg-[#141413] hover:bg-[#2C2C29] text-white px-4 py-2 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus size={14} className="text-emerald-400" />
                  <span>+ Emitir Factura</span>
                </button>
              </div>
            </div>

            {/* AVISO LEGAL Y TRANQUILIDAD CONTABLE */}
            <div className="bg-emerald-50 border border-emerald-200/90 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-emerald-950 text-sm">
                  ¿Por qué puedes emitir Factura Simplificada sin pedir DNI al viajero?
                </h3>
                <p className="text-emerald-900 leading-relaxed">
                  Conforme al <strong>Artículo 4.2.f del Real Decreto 1619/2012</strong>, en los servicios de hospedaje y alojamiento turístico se permite emitir <strong>Factura Simplificada hasta 3.000 €</strong> (IVA incluido). No estás obligado a solicitar el NIF ni el domicilio del huésped salvo que se trate de una empresa o autónomo que lo solicite para deducirse el gasto.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-emerald-800">
                  <span>✓ 100% Válido ante la AEAT</span>
                  <span>✓ Serie correlativa {currentFiscalProfile.simplifiedSeriesPrefix}-XXX</span>
                  <span>✓ Cálculo automático del 10% de IVA</span>
                </div>
              </div>
            </div>

            {/* RESUMEN TRIMESTRAL PARA EL MODELO 303 DE HACIENDA */}
            <div className="bg-white border border-[#E2DDD2] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DDD2] pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#57554F] font-bold">
                    LIQUIDACIÓN TRIBUTARIA
                  </span>
                  <h3 className="text-base font-bold text-[#141413]">
                    Resumen Trimestral para Hacienda (Modelo 303)
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(['1T', '2T', '3T', '4T'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuarter(q)}
                      className={`px-3 py-1.5 font-mono text-xs font-bold transition ${
                        selectedQuarter === q
                          ? 'bg-[#141413] text-white shadow-sm'
                          : 'bg-[#FAF9F5] text-[#57554F] border border-[#D5CFC0] hover:bg-white'
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
                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F4E3D] hover:bg-[#163A2D] text-white text-xs font-mono font-bold uppercase transition"
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
                    <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD2]">
                      <span className="font-mono text-[10px] uppercase text-[#57554F] font-semibold block">
                        Facturas Emitidas ({selectedQuarter})
                      </span>
                      <span className="text-2xl font-extrabold text-[#141413] font-mono mt-1 block">
                        {currentSummary.totalInvoices}
                      </span>
                      <span className="text-[10px] text-[#57554F]">Operaciones registradas</span>
                    </div>

                    <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD2]">
                      <span className="font-mono text-[10px] uppercase text-[#57554F] font-semibold block">
                        Base Imponible Total
                      </span>
                      <span className="text-2xl font-extrabold text-[#141413] font-mono mt-1 block">
                        {currentSummary.totalBase.toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-[#57554F]">Casilla [01] Modelo 303</span>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200">
                      <span className="font-mono text-[10px] uppercase text-emerald-800 font-bold block">
                        Cuota IVA Devengado (10%)
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-900 font-mono mt-1 block">
                        {currentSummary.totalVat.toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-emerald-700">Casilla [03] a ingresar</span>
                    </div>

                    <div className="p-4 bg-[#141413] text-white">
                      <span className="font-mono text-[10px] uppercase text-white/50 font-semibold block">
                        Total Facturado ({selectedQuarter})
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
                        {currentSummary.totalAmount.toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-white/60">IVA incluido</span>
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
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]" />
                    <input
                      type="text"
                      placeholder="Buscar por factura o huésped..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D5CFC0] w-60 focus:outline-none"
                    />
                  </div>

                  <select
                    value={invoicePropertyFilter}
                    onChange={(e) => setInvoicePropertyFilter(e.target.value)}
                    className="py-1.5 px-3 text-xs bg-white border border-[#D5CFC0]"
                  >
                    <option value="all">Todos los alojamientos ({properties.length})</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="font-mono text-xs text-[#57554F]">
                  Mostrando {allInvoices.length} facturas registradas
                </span>
              </div>

              {allInvoices.length === 0 ? (
                <div className="bg-white border border-[#E2DDD2] p-12 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#141413]">
                      No tienes facturas emitidas todavía
                    </h3>
                    <p className="text-xs text-[#57554F] max-w-md mx-auto mt-1">
                      Conecta tus salidas del calendario iCal o emite tu primera factura simplificada con IVA del 10% para cumplir con la normativa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(true)}
                    className="bg-[#141413] hover:bg-[#2C2C29] text-white px-5 py-2.5 text-xs font-mono font-bold uppercase transition"
                  >
                    + Emitir Mi Primera Factura
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-[#E2DDD2] overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F5] border-b border-[#E2DDD2] font-mono text-[10px] text-[#57554F] uppercase">
                        <th className="py-3 px-4">Nº Factura</th>
                        <th className="py-3 px-4">Fecha Emisión</th>
                        <th className="py-3 px-4">Alojamiento</th>
                        <th className="py-3 px-4">Huésped / Cliente</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4 text-right">Base Imponible</th>
                        <th className="py-3 px-4 text-right">IVA (10%)</th>
                        <th className="py-3 px-4 text-right">Total Factura</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD2]">
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
                          <tr key={inv.id} className="hover:bg-[#FAF9F5] transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#141413]">
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                {inv.invoiceNumber}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              {inv.issueDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-[#141413] block">
                                {inv.propertyName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {inv.stayStartDate} al {inv.stayEndDate} ({inv.nights} noches)
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-[#141413] block">
                                {inv.guestName}
                              </span>
                              {inv.guestFiscalId ? (
                                <span className="text-[10px] font-mono text-slate-500">
                                  NIF: {inv.guestFiscalId}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  Simplificada (RD 1619/2012)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px]">
                              {inv.isSimplified ? (
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                  Simplificada
                                </span>
                              ) : (
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
                                  Completa
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                              {inv.baseAmount.toFixed(2)} €
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                              +{inv.vatAmount.toFixed(2)} €
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-[#141413]">
                              {inv.totalAmount.toFixed(2)} €
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="inline-flex items-center gap-1 bg-[#141413] hover:bg-[#2C2C29] text-white px-2.5 py-1 text-[11px] font-mono font-bold uppercase transition"
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

        {/* VISTA 5: FACTURACIÓN SELF-SERVICE & ESTADO DE INFRAESTRUCTURA 0€ */}
        {section === 'billing' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD2] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  PLANES TRANSPARENTES SIN PERMANENCIA
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413] mt-0.5">
                  Facturación, Plan de Suscripción y Nube
                </h2>
              </div>

              {/* Selector Mensual / Anual con descuento */}
              <div className="flex items-center gap-2 bg-[#E8E4D9] p-1 border border-[#D5CFC0]">
                <button
                  type="button"
                  onClick={() => setIsAnnualBilling(false)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition ${
                    !isAnnualBilling
                      ? 'bg-[#141413] text-white shadow-sm'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  Pago Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnualBilling(true)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition ${
                    isAnnualBilling
                      ? 'bg-[#C85A32] text-white shadow-sm'
                      : 'text-[#57554F] hover:text-[#141413]'
                  }`}
                >
                  <span>Pago Anual</span>
                  <span className="bg-emerald-500 text-slate-950 text-[9px] px-1 py-0.2 rounded font-black font-mono">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resumen de Suscripción Actual */}
              <div className="lg:col-span-2 bg-[#141413] text-[#F6F4EE] p-7 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/15 pb-5">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] block">
                      PLAN ACTIVO EN TU CUENTA
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                      {hostAccount?.plan === 'plan_starter'
                        ? 'Starter · 1 Alojamiento (0€ Gratis)'
                        : hostAccount?.plan === 'plan_manager'
                        ? `Microgestora · Hasta 10 Alojamientos (${isAnnualBilling ? '31€/mes · 372€/año' : '39€/mes'})`
                        : `Pro Fiscal · Hasta 5 Alojamientos (${isAnnualBilling ? '15€/mes · 180€/año' : '19€/mes'})`}
                    </h3>
                    <p className="text-xs text-white/65 mt-1">
                      Estado:{' '}
                      {hostAccount?.subscriptionStatus === 'active'
                        ? 'Suscripción Activa (Stripe Billing)'
                        : `Periodo de prueba gratuito activo hasta el ${hostAccount?.trialEndsAt || 'próximo mes'}`}
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-3xl font-bold text-white">
                      {hostAccount?.plan === 'plan_starter'
                        ? '0'
                        : hostAccount?.plan === 'plan_manager'
                        ? (isAnnualBilling ? '31' : '39')
                        : (isAnnualBilling ? '15' : '19')}{' '}
                      €
                    </span>
                    <span className="block text-[10px] text-white/50">
                      / mes ({isAnnualBilling ? 'pago anual · 2 meses gratis' : 'facturación mensual'})
                    </span>
                  </div>
                </div>

                {/* Quota de Alojamientos del Plan */}
                <div className="bg-white/5 border border-white/10 p-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-white/60">Alojamientos utilizados en tu cuenta:</span>
                    <span className="font-bold text-white">
                      {properties.length} / {maxAllowedProperties} alojamientos
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        properties.length >= maxAllowedProperties ? 'bg-[#C85A32]' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (properties.length / Math.max(1, maxAllowedProperties)) * 100)}%`,
                      }}
                    />
                  </div>
                  {properties.length >= maxAllowedProperties && hostAccount?.plan !== 'plan_manager' && (
                    <p className="text-[11px] text-amber-300 pt-1">
                      ⚠️ Has alcanzado el límite de tu plan ({properties.length}/{maxAllowedProperties} alojamientos). Selecciona un plan superior para sincronizar más propiedades.
                    </p>
                  )}
                </div>

                {/* Comparador interactivo de los 3 planes oficiales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
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
                        className={`p-4 text-left border transition flex flex-col justify-between ${
                          isCurrent
                            ? 'border-[#C85A32] bg-[#1E1E1C] ring-1 ring-[#C85A32]'
                            : 'border-white/15 hover:border-white/40 bg-white/[0.02]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-400">
                              {p.saving}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#C85A32] text-white font-bold">
                                ACTIVO
                              </span>
                            )}
                          </div>
                          <span className="font-extrabold text-white text-sm block">{p.title}</span>
                          <span className="text-[11px] text-[#C85A32] font-bold block mt-0.5">
                            {p.limit}
                          </span>
                          <div className="mt-2">
                            <span className="text-xl font-black text-white">{p.price}</span>
                            <span className="text-[10px] text-white/50 block">{p.period}</span>
                          </div>
                          <span className="text-[11px] text-white/60 font-sans block mt-2 leading-relaxed">
                            {p.desc}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 text-center">
                          <span
                            className={`block py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                              isCurrent
                                ? 'bg-white/10 text-white'
                                : 'bg-[#C85A32] hover:bg-[#B04A25] text-white'
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
                  <p className="text-xs text-white/60">
                    Sin permanencia. Cancela o cambia de plan en cualquier momento desde tu panel.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const planKey = hostAccount?.plan || 'plan_pro';
                      const stripeUrl = (STRIPE_PAYMENT_LINKS as Record<string, string>)[planKey] || STRIPE_PAYMENT_LINKS.plan_pro || STRIPE_PAYMENT_LINKS.pack_complete;
                      if (stripeUrl) {
                        window.open(stripeUrl, '_blank');
                      } else {
                        onActivateSubscription?.();
                      }
                    }}
                    className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 transition shadow-md"
                  >
                    {hostAccount?.subscriptionStatus === 'active'
                      ? '✓ Suscripción Stripe Activa'
                      : 'Activar Suscripción en Stripe Checkout →'}
                  </button>
                </div>
              </div>

              {/* Estado de Optimización Coste 0€ */}
              <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} /> ARQUITECTURA COSTE 0€ ACTIVA
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
                  Consumo de Servidor Optimizado
                </h3>
                <ul className="space-y-3 text-xs text-[#57554F]">
                  <li className="bg-white border border-[#E2DDD2] p-3">
                    <strong className="text-[#141413] block font-mono text-[11px]">
                      ✓ VÍDEOS EN YOUTUBE / DRIVE (0 GB)
                    </strong>
                    Los vídeos de llegada y Home Tour se reproducen por embed sin consumir almacenamiento ni ancho de banda.
                  </li>
                  <li className="bg-white border border-[#E2DDD2] p-3">
                    <strong className="text-[#141413] block font-mono text-[11px]">
                      ✓ FOTOS WEBP COMPRIMIDAS (~50 KB)
                    </strong>
                    Las fotos subidas por las limpiadoras se comprimen en su móvil antes de enviarse (+16.000 fotos en 1 GB gratis).
                  </li>
                  <li className="bg-white border border-[#E2DDD2] p-3">
                    <strong className="text-[#141413] block font-mono text-[11px]">
                      ✓ ICAL BAJO DEMANDA (CACHÉ 30 MIN)
                    </strong>
                    Sin Cron nocturno: solo sincroniza cuando alguien abre la app y han pasado +30 min.
                  </li>
                  <li className="bg-white border border-[#E2DDD2] p-3">
                    <strong className="text-[#141413] block font-mono text-[11px]">
                      ESTADO BASE DE DATOS:{' '}
                      {isSupabaseConfigured ? 'CONECTADA A SUPABASE' : 'MODO LOCAL + ESQUEMA SQL LISTO'}
                    </strong>
                    El esquema completo está en <code>supabase/schema.sql</code>.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Sincronizar URL iCal real */}
      {showIcalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#141413] max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
                Sincronizar Calendario iCal (.ics)
              </h3>
              <button
                type="button"
                onClick={() => setShowIcalModal(false)}
                className="font-mono text-xs font-bold text-[#57554F]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase font-bold text-[#57554F] mb-1">
                Propiedad destino
              </label>
              <select
                value={targetPropertyId}
                onChange={(e) => setTargetPropertyId(e.target.value)}
                className="w-full bg-white border border-[#D5CFC0] px-3 py-2 text-xs font-bold"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-[#D5CFC0] p-4 space-y-2">
              <label className="block font-mono text-[10px] uppercase font-bold text-[#C85A32]">
                Opción A · Pegar URL .ics real de Airbnb o Booking
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={liveIcalUrl}
                  onChange={(e) => setLiveIcalUrl(e.target.value)}
                  placeholder="https://www.airbnb.es/calendar/ical/....ics"
                  className="flex-1 text-xs border border-[#D5CFC0] px-3 py-2 font-mono"
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
                  className="bg-[#C85A32] text-white font-mono text-xs font-bold uppercase px-4 py-2 shrink-0"
                >
                  {syncingUrl ? '...' : 'Sincronizar'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase font-bold text-[#57554F]">
                Opción B · Contenido .ics de prueba
              </label>
              <textarea
                rows={6}
                value={icsInput}
                onChange={(e) => setIcsInput(e.target.value)}
                className="w-full font-mono text-[11px] bg-[#141413] text-[#F6F4EE] p-3"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onImportIcalText(targetPropertyId, icsInput);
                  setShowIcalModal(false);
                }}
                className="bg-[#141413] text-white font-mono text-xs font-bold uppercase px-5 py-2.5"
              >
                Importar Reservas iCal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Propiedad */}
      {showNewPropModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProperty}
            className="bg-[#FAF9F5] border border-[#141413] max-w-md w-full p-6 space-y-3.5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">Nueva Propiedad</h3>
              <button
                type="button"
                onClick={() => setShowNewPropModal(false)}
                className="font-mono text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <input
              required
              placeholder="Nombre del alojamiento"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="w-full text-xs bg-white border border-[#D5CFC0] px-3 py-2.5"
            />
            <input
              placeholder="Dirección completa"
              value={newPropAddress}
              onChange={(e) => setNewPropAddress(e.target.value)}
              className="w-full text-xs bg-white border border-[#D5CFC0] px-3 py-2.5"
            />
            <input
              placeholder="WhatsApp del anfitrión (+34...)"
              value={newPropWhatsapp}
              onChange={(e) => setNewPropWhatsapp(e.target.value)}
              className="w-full text-xs bg-white border border-[#D5CFC0] px-3 py-2.5"
            />
            <input
              placeholder="URL iCal de Airbnb (.ics)"
              value={newPropIcal}
              onChange={(e) => setNewPropIcal(e.target.value)}
              className="w-full text-xs bg-white border border-[#D5CFC0] px-3 py-2.5 font-mono"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Red WiFi"
                value={newPropWifiSsid}
                onChange={(e) => setNewPropWifiSsid(e.target.value)}
                className="text-xs bg-white border border-[#D5CFC0] px-3 py-2.5"
              />
              <input
                placeholder="Clave WiFi"
                value={newPropWifiPass}
                onChange={(e) => setNewPropWifiPass(e.target.value)}
                className="text-xs bg-white border border-[#D5CFC0] px-3 py-2.5"
              />
            </div>
            <input
              placeholder="Código Puerta / Cajetín"
              value={newPropDoorCode}
              onChange={(e) => setNewPropDoorCode(e.target.value)}
              className="w-full text-xs bg-white border border-[#D5CFC0] px-3 py-2.5"
            />

            <button
              type="submit"
              className="w-full bg-[#141413] text-white font-mono text-xs font-bold uppercase py-3.5"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF9F5] border-2 border-[#141413] max-w-2xl w-full p-6 space-y-5 shadow-[8px_8px_0px_#141413] my-8 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#E2DDD2] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#1F4E3D] bg-[#1F4E3D]/10 px-2 py-0.5">
                  COMPROBACIÓN DE FOTOS Y CHECKLIST EN TIEMPO REAL
                </span>
                <h3 className="text-xl font-black text-[#141413] mt-1">
                  {properties.find((p) => p.id === inspectingTaskPhotos.propertyId)?.name || 'Alojamiento'}
                </h3>
                <p className="font-mono text-xs text-[#57554F] mt-0.5">
                  Fecha salida: {inspectingTaskPhotos.date} · Limpiadora:{' '}
                  <strong>{cleaners.find((c) => c.id === inspectingTaskPhotos.cleanerId)?.name || 'Sin asignar'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingTaskPhotos(null)}
                className="text-xs font-mono font-bold text-[#57554F] hover:text-[#141413] p-1.5"
              >
                ✕ CERRAR
              </button>
            </div>

            {/* Estado del Checklist */}
            <div className="bg-white border border-[#E2DDD2] p-4 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-[#1F4E3D]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Checklist Comprobado por la Limpiadora
                </span>
                <span>
                  {inspectingTaskPhotos.checklist.filter((c) => c.completed).length} /{' '}
                  {inspectingTaskPhotos.checklist.length} tareas
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {inspectingTaskPhotos.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-[#141413] bg-[#FAF9F5] p-2 border border-[#E2DDD2]">
                    <span className="text-[#1F4E3D] font-bold">✓</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Galería de fotos subidas por la limpiadora */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-bold text-[#141413]">
                <span>Fotos Tomadas con la Cámara ({inspectingTaskPhotos.photosUploaded.length})</span>
                <span className="text-[#57554F] font-normal text-[11px]">Comprobación antes de la llegada del huésped</span>
              </div>
              {inspectingTaskPhotos.photosUploaded.length === 0 ? (
                <p className="text-xs text-[#57554F] italic p-4 bg-white border border-[#E2DDD2] text-center">
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
                      className="group relative block aspect-video sm:aspect-square bg-slate-900 overflow-hidden border border-[#D5CFC0] shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`Foto verificación ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-[11px] font-bold">
                        Ampliar foto ↗
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5">
                        Habitación {idx + 1}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2DDD2]">
              <span className="font-mono text-xs text-[#1F4E3D] font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Todo comprobado: el alojamiento está impecable para el nuevo huésped</span>
              </span>
              <button
                type="button"
                onClick={() => setInspectingTaskPhotos(null)}
                className="w-full sm:w-auto bg-[#141413] hover:bg-[#2C2C29] text-white font-mono text-xs uppercase font-bold px-6 py-2.5 transition"
              >
                Conforme y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
