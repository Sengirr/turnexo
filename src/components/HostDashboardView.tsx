import React, { useState } from 'react';
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
} from 'lucide-react';
import { Cleaner, CleaningTask, Property, Reservation } from '../lib/icalParser';
import { SAMPLE_ICAL_SNIPPET } from '../lib/mockData';
import { HostAccount, isSupabaseConfigured, STRIPE_PAYMENT_LINKS } from '../lib/supabase';
import PrintableQrPosterModal from './PrintableQrPosterModal';
import PropertyCustomizerModal from './PropertyCustomizerModal';
import { CreditCard, ShieldCheck, UserCheck } from 'lucide-react';

interface Props {
  hostAccount?: HostAccount | null;
  onChangePlan?: (plan: HostAccount['plan']) => void;
  onActivateSubscription?: () => void;
  onLogout?: () => void;
  properties: Property[];
  cleaners: Cleaner[];
  reservations: Reservation[];
  tasks: CleaningTask[];
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

type BackofficeSection = 'overview' | 'schedule' | 'guests' | 'team' | 'billing';

export default function HostDashboardView({
  hostAccount,
  onChangePlan,
  onActivateSubscription,
  onLogout,
  properties,
  cleaners,
  reservations,
  tasks,
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

  const urgentCount = tasks.filter((t) => t.sameDayCheckIn).length;
  const upsellRevenue = reservations.reduce(
    (sum, r) => sum + (r.lateCheckoutApproved ? r.lateCheckoutPaidAmount || 35 : 0),
    0
  );

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
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] flex flex-col lg:flex-row">
      {/* BARRA LATERAL IZQUIERDA ESTILO SOFTWARE PROFESIONAL */}
      <aside className="w-full lg:w-64 bg-[#141413] text-[#F6F4EE] shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#2C2C29]">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
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
                { id: 'overview', label: 'Propiedades & Guías', icon: Home },
                { id: 'schedule', label: 'Cuadrante Salidas iCal', icon: Calendar },
                { id: 'guests', label: 'Llegadas & Extras Huésped', icon: UserCheck },
                { id: 'team', label: 'Equipo de Limpieza', icon: Users },
                { id: 'billing', label: 'Facturación & Módulos', icon: CreditCard },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center gap-3 transition ${
                    active
                      ? 'bg-[#C85A32] text-white'
                      : 'text-white/65 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
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
                    <option value="pack_complete">Pack Completo (14€/mes)</option>
                    <option value="module_cleanings">Solo Limpiezas iCal (9€/mes)</option>
                    <option value="module_guide">Solo Guía Huésped (9€/mes)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-white/60 hover:text-white flex items-center gap-1.5 font-mono text-[11px]"
            >
              <ArrowLeft size={13} />
              Web Pública (/)
            </button>
            <div className="flex items-center gap-2">
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="font-mono text-[10px] uppercase text-[#C85A32] hover:underline"
                >
                  Salir
                </button>
              )}
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
              PROPIEDADES ACTIVAS (ICAL)
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-3xl font-bold text-[#141413]">
                0{properties.length}
              </span>
              <span className="font-mono text-[11px] text-[#1F4E3D] font-semibold">
                ● Sincronizadas
              </span>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F]">
              ROTACIONES MISMO DÍA
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
              INGRESOS LATE CHECK-OUT
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-mono text-3xl font-bold text-[#1F4E3D]">
                +{upsellRevenue} €
              </span>
              <span className="font-mono text-[11px] text-[#57554F]">
                0% comisión (Directo)
              </span>
            </div>
          </div>
        </div>

        {/* VISTA 1: PROPIEDADES Y PERSONALIZACIÓN DE GUÍA */}
        {section === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD2] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  GESTIÓN POR PROPIEDAD
                </span>
                <h1 className="font-serif text-3xl text-[#141413] mt-0.5">
                  Alojamientos, Guías Digitales y Enlaces iCal
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPropModal(true)}
                className="bg-[#141413] hover:bg-[#2C2C29] text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 flex items-center gap-2"
              >
                <Plus size={14} />
                Nueva Propiedad
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
                          <h2 className="font-serif text-2xl text-[#141413] mt-1">
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

                      {/* Estado de los 2 módulos en este piso */}
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

                    {/* Acciones del piso */}
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
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E2DDD2] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold">
                  SINCRONIZACIÓN EN TIEMPO REAL
                </span>
                <h2 className="font-serif text-2xl text-[#141413]">
                  Cuadrante de Salidas, Limpiezas y Late Check-out
                </h2>
              </div>
            </div>

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD2]">
                  {tasks.map((task) => {
                    const prop = properties.find((p) => p.id === task.propertyId);
                    const res = reservations.find((r) => r.id === task.reservationId);

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
                          {task.status === 'completed' ? (
                            <span className="text-[#1F4E3D] font-bold">
                              ✓ COMPLETADA ({task.photosUploaded.length} FOTOS)
                            </span>
                          ) : (
                            <span className="text-[#57554F]">
                              PENDIENTE ({task.photosUploaded.length} FOTOS)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 3: ENLACES DE LIMPIADORAS */}
        {(section === 'overview' || section === 'team') && (
          <div className="space-y-4 pt-4">
            <div className="border-b border-[#E2DDD2] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F] font-bold">
                ACCESO MÓVIL SIN CONTRASEÑAS
              </span>
              <h2 className="font-serif text-2xl text-[#141413]">
                Enlaces Directos para Personal de Limpieza
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cleaners.map((c) => {
                const cleanerUrl = `${window.location.origin}/c/${c.magicToken}`;
                return (
                  <div
                    key={c.id}
                    className="bg-[#FAF9F5] border border-[#D5CFC0] p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
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
                      <p className="text-xs text-[#57554F] mt-0.5">{c.phone}</p>
                      <p className="font-mono text-[11px] text-[#141413] bg-white border border-[#E2DDD2] px-2.5 py-2 mt-3 truncate">
                        {cleanerUrl}
                      </p>
                    </div>

                    <div className="flex gap-2 font-mono text-xs font-bold uppercase">
                      <button
                        type="button"
                        onClick={() => copyLink(cleanerUrl, c.id)}
                        className="flex-1 bg-white border border-[#141413] py-2.5 flex items-center justify-center gap-1.5 hover:bg-[#141413] hover:text-white transition"
                      >
                        {copiedId === c.id ? <Check size={13} /> : <Copy size={13} />}
                        {copiedId === c.id ? 'Copiado' : 'Copiar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const phoneClean = c.phone.replace(/[^0-9]/g, '');
                          const msg = `Hola ${c.name.split(' ')[0]}, aquí tienes tu enlace directo de limpiezas actualizado en tiempo real:\n👉 ${cleanerUrl}`;
                          window.open(
                            `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`,
                            '_blank'
                          );
                        }}
                        className="bg-[#1F4E3D] text-white px-3 py-2.5"
                      >
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCleanerPreview(c.id)}
                        className="bg-[#141413] text-white px-3.5 py-2.5"
                      >
                        Abrir
                      </button>
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
            <div className="border-b border-[#E2DDD2] pb-3 flex items-end justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  DATOS EN VIVO DESDE LA GUÍA DEL HUÉSPED (/g/:slug)
                </span>
                <h2 className="font-serif text-3xl text-[#141413]">
                  Horarios de Llegada/Salida, Confirmaciones y Extras Solicitados
                </h2>
              </div>
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
                    <th className="py-3.5 px-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DDD2]">
                  {reservations.map((res) => {
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
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => onOpenGuestPreview(res.id)}
                            className="bg-[#141413] text-white font-mono text-[10px] font-bold uppercase px-3 py-1.5"
                          >
                            Abrir Guía Huésped
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

        {/* VISTA 5: FACTURACIÓN SELF-SERVICE & ESTADO DE INFRAESTRUCTURA 0€ */}
        {section === 'billing' && (
          <div className="space-y-8">
            <div className="border-b border-[#E2DDD2] pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                SUSCRIPCIÓN SELF-SERVICE SIN PERMANENCIA
              </span>
              <h2 className="font-serif text-3xl text-[#141413]">
                Facturación, Módulos Contratados y Nube
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resumen de Suscripción Actual */}
              <div className="lg:col-span-2 bg-[#141413] text-[#F6F4EE] p-7 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/15 pb-5">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] block">
                      PLAN ACTIVO EN TU CUENTA
                    </span>
                    <h3 className="font-serif text-3xl mt-1">
                      {hostAccount?.plan === 'module_cleanings'
                        ? 'Solo Módulo 1 · Limpiezas iCal (9€/piso)'
                        : hostAccount?.plan === 'module_guide'
                        ? 'Solo Módulo 2 · Guía del Huésped (9€/piso)'
                        : 'Pack Completo Turnexo · Módulo 1 + 2 (14€/piso)'}
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
                      {properties.length *
                        (hostAccount?.plan === 'pack_complete' || !hostAccount?.plan ? 14 : 9)}{' '}
                      €
                    </span>
                    <span className="block text-[10px] text-white/50">
                      / mes ({properties.length} alojamientos)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  {(
                    [
                      {
                        id: 'pack_complete',
                        title: 'Pack Completo',
                        price: '14 € / piso',
                        desc: 'Limpiezas iCal + Guía Huésped conectadas',
                      },
                      {
                        id: 'module_cleanings',
                        title: 'Solo Limpiezas',
                        price: '9 € / piso',
                        desc: 'Solo cuadrante iCal y app limpiadoras',
                      },
                      {
                        id: 'module_guide',
                        title: 'Solo Guía Huésped',
                        price: '9 € / piso',
                        desc: 'Solo portal huésped y venta de extras',
                      },
                    ] as const
                  ).map((p) => {
                    const isCurrent = (hostAccount?.plan || 'pack_complete') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onChangePlan?.(p.id)}
                        className={`p-4 text-left border transition ${
                          isCurrent
                            ? 'border-[#C85A32] bg-[#1E1E1C]'
                            : 'border-white/15 hover:border-white/40'
                        }`}
                      >
                        <span className="text-[10px] uppercase text-[#C85A32] font-bold block">
                          {p.price}
                        </span>
                        <span className="font-bold text-white block mt-1">{p.title}</span>
                        <span className="text-[11px] text-white/55 font-sans block mt-1">
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-white/60">
                    El cobro se ajusta automáticamente según el número de alojamientos activos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const planKey = hostAccount?.plan || 'pack_complete';
                      const stripeUrl = STRIPE_PAYMENT_LINKS[planKey];
                      if (stripeUrl) {
                        window.open(stripeUrl, '_blank');
                      } else {
                        onActivateSubscription?.();
                      }
                    }}
                    className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3 transition"
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
                <h3 className="font-serif text-2xl text-[#141413]">
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
              <h3 className="font-serif text-2xl text-[#141413]">
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
              <h3 className="font-serif text-2xl text-[#141413]">Nueva Propiedad</h3>
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
    </div>
  );
}
