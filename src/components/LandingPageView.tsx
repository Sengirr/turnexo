import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Clock,
  QrCode,
  Users,
  Video,
  Calendar,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  FileSpreadsheet,
  MessageSquare,
  HelpCircle,
  Copy,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { parseICalContent } from '../lib/icalParser';

interface Props {
  onNavigateToApp: () => void;
  onOpenGuestDemo: () => void;
  onOpenCleanerDemo: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms' | 'legal') => void;
}

export default function LandingPageView({
  onNavigateToApp,
  onOpenGuestDemo,
  onOpenCleanerDemo,
  onOpenLegal,
}: Props) {
  const [units, setUnits] = useState(3);
  const [upsellAvg, setUpsellAvg] = useState(35);
  const monthlyGain = units * 2 * upsellAvg;
  // Tramos cerrados (Tarifa plana por volumen)
  const getFlatPlanCost = (numUnits: number) => {
    if (numUnits <= 1) return 0;
    if (numUnits <= 5) return 19;
    return 39;
  };
  const platformCost = getFlatPlanCost(units);
  const netProfit = monthlyGain - platformCost;
  const hoursSaved = units * 6;

  // Estado del simulador de flujo en vivo
  const [simStep, setSimStep] = useState<1 | 2 | 3 | 4>(1);

  // Estado del acordeón de FAQ
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Estado del probador de iCal interactivo
  const [testerUrl, setTesterUrl] = useState('');
  const [testingIcal, setTestingIcal] = useState(false);
  const [testResult, setTestResult] = useState<{
    totalReservations: number;
    sameDayTurns: number;
    guestNames: string[];
  } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Selector interactivo de vista previa
  const [previewTab, setPreviewTab] = useState<'cleaner' | 'guest'>('cleaner');

  const handleRunIcalTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testerUrl.trim()) return;
    setTestingIcal(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch(`/api/fetch-ical?url=${encodeURIComponent(testerUrl.trim())}`);
      if (!res.ok) throw new Error('No se pudo descargar el calendario. Comprueba que la URL es pública.');
      const icsText = await res.text();
      const parsed = parseICalContent(icsText, 'preview-prop');
      if (parsed.length === 0) {
        throw new Error('No se encontraron reservas en el archivo iCal (.ics).');
      }

      // Contar rotaciones el mismo día
      let sameDayCount = 0;
      for (const r of parsed) {
        if (parsed.some((other) => other.id !== r.id && other.checkIn === r.checkOut)) {
          sameDayCount++;
        }
      }

      setTestResult({
        totalReservations: parsed.length,
        sameDayTurns: Math.ceil(sameDayCount / 2),
        guestNames: parsed.slice(0, 3).map((r) => r.guestName),
      });
    } catch (err: any) {
      setTestError(err?.message || 'Error al conectar con la URL iCal. Verifica el enlace.');
    } finally {
      setTestingIcal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413]">
      {/* Navegación Editorial Limpia */}
      <header className="sticky top-0 z-40 bg-[#F6F4EE]/90 backdrop-blur-md border-b border-[#E2DDD2]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-bold text-xs tracking-tighter">
                TX
              </div>
              <span className="font-bold text-xl tracking-tight text-[#141413]">
                Turnexo<span className="text-[#C85A32]">.</span>
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#57554F]">
              <a href="#probar-ical" className="hover:text-[#141413] transition font-bold text-[#C85A32]">
                ⚡ Probar mi iCal
              </a>
              <a href="#modulos" className="hover:text-[#141413] transition">
                Módulos
              </a>
              <a href="#comparativa" className="hover:text-[#141413] transition">
                Comparativa
              </a>
              <a href="#garantias" className="hover:text-[#141413] transition">
                Garantías
              </a>
              <a href="#precios" className="hover:text-[#141413] transition">
                Tarifas
              </a>
              <a href="#faq" className="hover:text-[#141413] transition">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="text-sm font-semibold text-[#141413] hover:text-[#C85A32] px-3 py-2 transition"
            >
              Acceso Clientes
            </button>
            <button
              type="button"
              onClick={onNavigateToApp}
              className="bg-[#C85A32] hover:bg-[#B04A25] text-white text-xs font-semibold uppercase tracking-wider px-5 py-3 transition flex items-center gap-2 shadow-sm"
            >
              <span>Probar 1 Piso Gratis</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO EDITORIAL + MAQUETA ARQUITECTÓNICA */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 border-b border-[#E2DDD2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8 pt-2">
            <div className="inline-flex items-center gap-2.5 border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>LISTO PARA EL NUEVO MARCO FISCAL: FACTURAS SIMPLIFICADAS Y MODELO 303</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#141413]">
              Controla tus limpiezas, manuales QR y facturas de IVA.{' '}
              <span className="text-[#C85A32]">En piloto automático.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#57554F] leading-relaxed max-w-2xl font-normal">
              Turnexo se conecta al calendario de Airbnb y Booking y hace el trabajo repetitivo por ti:
            </p>

            {/* 3 beneficios escaneables (uno por producto) */}
            <ul className="space-y-3 max-w-2xl text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Limpiezas sin WhatsApp:</strong> tu limpiadora ve sus turnos en el móvil y te envía fotos del checklist antes de cada entrada.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Huéspedes sin llamadas:</strong> manual QR con vídeo del piso, del check-in y de los electrodomésticos. Y vende Late Check-out.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Facturas con IVA en 1 clic:</strong> y el libro trimestral en Excel listo para que tu gestoría presente el Modelo 303.
                </span>
              </li>
            </ul>

            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="bg-[#C85A32] hover:bg-[#B04A25] text-white text-sm sm:text-base font-bold px-7 py-4 transition flex items-center gap-2.5 shadow-md group"
                >
                  <span>Probar 1 Piso Gratis (Sin tarjeta)</span>
                  <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={onOpenGuestDemo}
                  className="border-2 border-[#141413] bg-transparent hover:bg-[#141413] hover:text-[#F6F4EE] text-[#141413] text-sm sm:text-base font-bold px-6 py-4 transition flex items-center gap-2"
                >
                  <span>Ver Demo en Vivo</span>
                </button>
              </div>

              <p className="text-xs font-mono text-[#57554F] flex items-center gap-1.5 pt-1">
                <span className="text-[#1F4E3D] font-bold">✓</span>
                <span>Plan Gratuito para 1 alojamiento · Sin tarjeta de crédito ni compromiso</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E2DDD2] max-w-xl">
              <div>
                <p className="font-mono text-2xl font-bold text-[#141413]">60 seg</p>
                <p className="text-xs text-[#57554F] mt-0.5">Sincronización automática iCal</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-emerald-700">1 clic</p>
                <p className="text-xs text-[#57554F] mt-0.5">Exportación oficial para tu gestoría</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#1F4E3D]">100 %</p>
                <p className="text-xs text-[#57554F] mt-0.5">Guías personalizables</p>
              </div>
            </div>
          </div>

          {/* Vista Previa Interactiva con Toggle Cleaner / Guest */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-1.5 p-1 bg-[#E8E4D9] border border-[#D5CFC0] rounded-none font-mono text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab('cleaner')}
                className={`flex-1 py-2 font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  previewTab === 'cleaner'
                    ? 'bg-[#141413] text-white shadow-md'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                <Smartphone size={14} />
                <span>Vista Limpiadora</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('guest')}
                className={`flex-1 py-2 font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  previewTab === 'guest'
                    ? 'bg-[#C85A32] text-white shadow-md'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                <Sparkles size={14} />
                <span>Vista Huésped</span>
              </button>
            </div>

            {previewTab === 'cleaner' ? (
              <div className="bg-[#FAF9F5] border-2 border-[#141413] p-6 space-y-4 shadow-[6px_6px_0px_#141413]">
                <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold">
                      SIN CONTRASEÑAS · ACCESO DIRECTO MÓVIL
                    </span>
                    <h4 className="text-xl font-bold text-[#141413] mt-0.5">
                      Parte de María Carmen
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold bg-[#1F4E3D] text-white px-2.5 py-1">
                    2 de 3 Limpiezas completadas
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 bg-white border-l-4 border-[#C85A32] border border-[#E2DDD2] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#C85A32] flex items-center gap-1">
                        <Flame size={13} /> ENTRADA HOY · ROTACIÓN 15:00H
                      </span>
                      <span className="font-mono font-bold bg-[#141413] text-white px-2 py-0.5 text-[11px]">
                        11:00 → 15:00
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#141413]">Loft Centro Catedral · 38 €</p>

                    {/* Checklist y fotos comprobadas */}
                    <div className="bg-[#FAF9F5] p-2.5 border border-[#E2DDD2] space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-[#1F4E3D] font-bold">
                        <span>✓ Checklist: 4/4 completadas</span>
                        <span>📸 3 fotos subidas</span>
                      </div>
                      <p className="text-[10px] text-[#57554F]">
                        Sábanas cambiadas · Baño desinfectado · Salón ordenado · Llaves en cajetín
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#1F4E3D] font-bold">
                      <CheckCircle2 size={13} />
                      <span>Comprobado por ti desde el móvil: Todo impecable</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1F4E3D]/10 border border-[#1F4E3D]/30 text-[#1F4E3D] text-[11px] font-mono flex items-center gap-2">
                    <Sparkles size={14} className="shrink-0" />
                    <span>0 llamadas ni audios de WhatsApp: ella ve sus turnos y tú ves sus fotos.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenCleanerDemo}
                  className="w-full bg-[#141413] hover:bg-[#2C2C29] text-white font-mono text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Abrir App Limpiadora Completa</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            ) : (
              <div className="bg-[#141413] text-[#F6F4EE] p-6 border-2 border-[#141413] space-y-4 shadow-[6px_6px_0px_#C85A32]">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                      PORTAL BOUTIQUE DEL HUÉSPED
                    </span>
                    <h3 className="text-xl font-bold mt-0.5">Ático Vista Marina</h3>
                  </div>
                  <span className="font-mono text-xs bg-white/10 px-2.5 py-1 text-white/80">
                    ES · EN · FR
                  </span>
                </div>

                {/* Bloque de vídeos destacados en la preview */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs shrink-0">▶</span>
                      <div>
                        <p className="font-bold text-white text-xs">Vídeo Home Tour</p>
                        <p className="text-[10px] text-white/60">Recorrido del piso antes de llegar</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/50">1:15 min</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white/5 border border-white/10 text-[11px]">
                      <span className="text-[#C85A32] font-bold block">▶ VÍDEO CHECK-IN</span>
                      <span className="text-white/70 text-[10px] block mt-0.5">Apertura portal y cajetín</span>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 text-[11px]">
                      <span className="text-emerald-400 font-bold block">▶ VÍDEO ELECTROD.</span>
                      <span className="text-white/70 text-[10px] block mt-0.5">Vitro, Clima y Termo</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="bg-white/5 border border-white/10 p-2.5">
                    <span className="text-white/50 block text-[9px]">CÓDIGO PUERTA</span>
                    <span className="font-bold text-xs mt-0.5 text-white block">4829#</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-2.5">
                    <span className="text-white/50 block text-[9px]">RED WIFI (1 TOQUE)</span>
                    <span className="font-bold text-xs mt-0.5 text-white block truncate">VistaMarina_5G</span>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] text-[#141413] p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#1F4E3D] font-bold flex items-center gap-1">
                      <Sparkles size={12} /> CROSS-SELLING AUTOMÁTICO
                    </span>
                    <span className="font-mono font-bold text-sm text-[#C85A32]">+35 € netos</span>
                  </div>
                  <p className="text-xs font-bold">Late Check-out hasta las 17:00h</p>
                  <p className="text-[11px] text-[#57554F] leading-tight">
                    El huésped lo solicita en 1 toque. Tú lo cobras íntegro sin intermediarios.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenGuestDemo}
                  className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-mono text-xs font-bold uppercase tracking-wider py-3 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Abrir Guía del Huésped Completa</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN DE DOLORES REALES VS BENEFICIOS TURNEXO */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-[#E2DDD2]">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
            PROBLEMAS REALES · SOLUCIÓN DEFINITIVA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight leading-tight">
            Los 3 dolores que quitan tiempo y dinero a los anfitriones... y cómo Turnexo los elimina.
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            Menos mensajes en WhatsApp, cero retrasos en entradas y cumplimiento fiscal automático con la nueva ley del IVA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* DOLOR 1: LIMPIEZAS */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 bg-[#141413] text-white flex items-center justify-center font-mono font-bold text-xs">
                  01
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-[#C85A32] bg-[#C85A32]/10 px-2 py-0.5">
                  OPERATIVA CON TU LIMPIADORA
                </span>
              </div>

              {/* El dolor */}
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-700 block">
                  ❌ El dolor diario
                </span>
                <p className="text-xs text-rose-950 font-medium leading-relaxed">
                  "¿A qué hora entras hoy?", audios eternos en WhatsApp para cuadrar turnos y la incertidumbre de no saber si el apartamento ha quedado impecable hasta que llega la queja del huésped.
                </p>
              </div>

              {/* El beneficio */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">
                  ✓ La solución Turnexo
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  Ahorra toda la comunicación con tu limpiadora. Ella ve sus turnos en su enlace móvil sin contraseñas, sigue el checklist de cada estancia y sube fotos de auditoría. Tú compruebas desde tu móvil que todo está impecable antes de la entrada.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2DDD2] font-mono text-[11px] text-[#1F4E3D] font-bold">
              → 0 WhatsApps cruzados y tranquilidad total antes del check-in
            </div>
          </div>

          {/* DOLOR 2: ATENCIÓN AL HUÉSPED */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 bg-[#141413] text-white flex items-center justify-center font-mono font-bold text-xs">
                  02
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5">
                  ATENCIÓN AL HUÉSPED (GUEST APP)
                </span>
              </div>

              {/* El dolor */}
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-700 block">
                  ❌ El dolor diario
                </span>
                <p className="text-xs text-rose-950 font-medium leading-relaxed">
                  Huéspedes llamando a las 23:30h perdidos en el portal, sin encontrar el cajetín de llaves, sin saber usar la vitrocerámica o sin entender el mando del aire acondicionado. Y salidas a las 11:00h sin monetizar.
                </p>
              </div>

              {/* El beneficio */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">
                  ✓ La solución Turnexo
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  Guest App con Vídeo Home Tour para ver el piso antes de llegar, vídeos de check-in paso a paso, y vídeo-guías de electrodomésticos para resolver dudas al instante. Además, vende Late Check-out automático (+35 € netos directo a tu cuenta).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2DDD2] font-mono text-[11px] text-[#1F4E3D] font-bold">
              → Cero llamadas a medianoche y +35 € a +70 € extra por reserva
            </div>
          </div>

          {/* DOLOR 3: FACTURACIÓN & IVA 10% */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 bg-[#141413] text-white flex items-center justify-center font-mono font-bold text-xs">
                  03
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5">
                  NUEVA LEY IVA 10%
                </span>
              </div>

              {/* El dolor */}
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-700 block">
                  ❌ El dolor diario
                </span>
                <p className="text-xs text-rose-950 font-medium leading-relaxed">
                  La nueva obligación de emitir facturas con el 10% de IVA. Hacerlas a mano en Word es lentísimo y enviar extractos desordenados al gestor genera errores y horas perdidas al cierre de cada trimestre.
                </p>
              </div>

              {/* El beneficio */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 block">
                  ✓ La solución Turnexo
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  Generas cada factura legal con IVA del 10% en 1 clic. Al acabar el trimestre, descargas el Libro de IVA en Excel listo para que tu gestor presente el Modelo 303 en 2 minutos sin complicaciones.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2DDD2] font-mono text-[11px] text-[#1F4E3D] font-bold">
              → Todo ordenado y listo para tu gestoría en 5 segundos
            </div>
          </div>
        </div>
      </section>

      {/* HERRAMIENTA INTERACTIVA (LEAD MAGNET): PROBADOR DE ICAL EN VIVO */}
      <section id="probar-ical" className="bg-[#1E1E1C] text-[#F6F4EE] border-b border-[#2C2C29] py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              HERRAMIENTA GRATUITA · PRUÉBALO EN 10 SEGUNDOS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Comprueba cuántas rotaciones y euros estás perdiendo en tu calendario.
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl mx-auto">
              Pega la URL de exportación iCal (.ics) de tu anuncio en Airbnb o Booking. Analizaremos tus próximas reservas sin tocar nada de tu cuenta.
            </p>
          </div>

          <form onSubmit={handleRunIcalTest} className="bg-[#141413] border border-white/20 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={testerUrl}
                onChange={(e) => setTesterUrl(e.target.value)}
                placeholder="Pega aquí tu URL iCal (ej: https://www.airbnb.es/calendar/ical/...ics)"
                className="flex-1 bg-[#1E1E1C] border border-white/25 px-4 py-3.5 text-xs text-white placeholder-white/40 font-mono focus:outline-none focus:border-[#C85A32]"
              />
              <button
                type="submit"
                disabled={testingIcal}
                className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition shrink-0 flex items-center justify-center gap-2"
              >
                {testingIcal ? (
                  <span>Analizando calendario...</span>
                ) : (
                  <>
                    <span>Analizar mi iCal Gratis</span>
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/50 font-mono">
              <span>🔒 100% Privado. No guardamos tus datos hasta que creas una cuenta.</span>
              <button
                type="button"
                onClick={() =>
                  setTesterUrl(
                    'https://raw.githubusercontent.com/Sengirr/turnexo/main/public/manifest.json'
                  )
                }
                className="text-[#C85A32] hover:underline"
              >
                ¿No tienes el enlace a mano? Probar con demo →
              </button>
            </div>
          </form>

          {testError && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <X size={15} className="shrink-0 text-rose-400" />
              <span>{testError}</span>
            </div>
          )}

          {testResult && (
            <div className="bg-[#FAF9F5] text-[#141413] border-2 border-[#C85A32] p-6 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#D5CFC0] pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-[#1F4E3D] font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> ANÁLISIS COMPLETADO CON ÉXITO
                </span>
                <span className="font-mono text-xs bg-[#141413] text-white px-3 py-1 font-bold">
                  {testResult.totalReservations} Reservas Encontradas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-[#D5CFC0]">
                  <span className="font-mono text-[10px] uppercase text-[#57554F] block">ROTACIONES MISMO DÍA</span>
                  <span className="font-mono text-2xl font-bold text-[#C85A32] mt-1 block">
                    {testResult.sameDayTurns} entradas urgentes
                  </span>
                  <span className="text-[11px] text-[#57554F]">Tu limpiadora debe entrar a las 11:00</span>
                </div>

                <div className="p-3 bg-white border border-[#D5CFC0]">
                  <span className="font-mono text-[10px] uppercase text-[#57554F] block">POTENCIAL LATE CHECK-OUT</span>
                  <span className="font-mono text-2xl font-bold text-[#1F4E3D] mt-1 block">
                    +{testResult.totalReservations * 35} €
                  </span>
                  <span className="text-[11px] text-[#57554F]">En huecos que antes quedaban libres</span>
                </div>

                <div className="p-3 bg-white border border-[#D5CFC0]">
                  <span className="font-mono text-[10px] uppercase text-[#57554F] block">TIEMPO EN WHATSAPP</span>
                  <span className="font-mono text-2xl font-bold text-[#141413] mt-1 block">0 min</span>
                  <span className="text-[11px] text-[#57554F]">Sincronización automática</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[#57554F]">
                  Conecta este calendario con tu panel para generar el enlace móvil de tu limpiadora.
                </p>
                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="w-full sm:w-auto bg-[#141413] hover:bg-[#2C2C29] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-3 flex items-center justify-center gap-2"
                >
                  <span>Crear mi Panel con este iCal (Gratis)</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SIMULADOR INTERACTIVO DE FLUJO OPERATIVO */}
      <section id="simulador" className="bg-[#FAF9F5] border-b border-[#E2DDD2] py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold flex items-center justify-center gap-1.5">
              <Zap size={14} /> SIMULADOR EN VIVO · CÓMO FUNCIONA TURNEXO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight">
              De la reserva al cobro del extra, sin cruzar un solo WhatsApp.
            </h2>
            <p className="text-sm text-[#57554F]">
              Haz clic en cada paso para ver cómo la información fluye en tiempo real entre el calendario, tu personal de limpieza y el huésped.
            </p>
          </div>

          {/* Selector de Pasos del Flujo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#E8E4D9] p-1.5 border border-[#D5CFC0]">
            {(
              [
                { step: 1, num: '01', title: 'Reserva iCal Recibida', desc: 'Airbnb / Booking' },
                { step: 2, num: '02', title: 'Cuadrante Limpiadora', desc: 'Enlace móvil directo' },
                { step: 3, num: '03', title: 'Upsell Late Check-out', desc: 'Guía digital QR' },
                { step: 4, num: '04', title: 'Sincronización Total', desc: '+35€ y hora retrasada' },
              ] as const
            ).map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => setSimStep(item.step)}
                className={`p-3.5 text-left transition ${
                  simStep === item.step
                    ? 'bg-[#141413] text-[#F6F4EE] shadow-md'
                    : 'bg-transparent text-[#57554F] hover:bg-white/50'
                }`}
              >
                <span className={`font-mono text-[10px] uppercase font-bold block ${
                  simStep === item.step ? 'text-[#C85A32]' : 'text-[#57554F]'
                }`}>
                  PASO {item.num}
                </span>
                <span className="font-bold text-xs sm:text-sm block mt-0.5">
                  {item.title}
                </span>
                <span className="font-mono text-[11px] opacity-70 block mt-0.5">
                  {item.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Tarjeta Visual Interactiva del Paso Seleccionado */}
          <div className="bg-white border-2 border-[#141413] p-6 sm:p-10 shadow-[8px_8px_0px_#141413] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              {simStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-[#141413] text-white px-2.5 py-1 font-bold">
                    PASO 1 · DETECCIÓN AUTOMÁTICA
                  </span>
                  <h3 className="text-2xl font-bold text-[#141413]">
                    Entrada de reserva por calendario iCal
                  </h3>
                  <p className="text-sm text-[#57554F] leading-relaxed">
                    Airbnb o Booking confirman la reserva de un huésped. Turnexo la detecta silenciosamente sin necesidad de contraseñas de tus plataformas.
                  </p>
                  <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#E2DDD2] pb-2">
                      <span className="text-[#57554F]">Huésped detectado:</span>
                      <strong className="text-[#141413]">Thomas Müller (Airbnb · #HM891)</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#E2DDD2] pb-2">
                      <span className="text-[#57554F]">Estancia:</span>
                      <strong className="text-[#141413]">24 Oct (15:00h) → 27 Oct (11:00h)</strong>
                    </div>
                    <div className="flex justify-between text-[#1F4E3D] font-bold">
                      <span>Detección de rotación:</span>
                      <span>Tarde libre el 27 Oct (Sin entrada siguiente)</span>
                    </div>
                  </div>
                </div>
              )}

              {simStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-[#1F4E3D] text-white px-2.5 py-1 font-bold">
                    PASO 2 · ASIGNACIÓN INMEDIATA
                  </span>
                  <h3 className="text-2xl font-bold text-[#141413]">
                    El turno aparece en el móvil de tu limpiadora
                  </h3>
                  <p className="text-sm text-[#57554F] leading-relaxed">
                    María Carmen abre su enlace único en el navegador de su teléfono. Ve la hora asignada, el checklist del piso y el botón para subir fotos de auditoría al terminar.
                  </p>
                  <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#E2DDD2] pb-2">
                      <span className="text-[#57554F]">Personal asignado:</span>
                      <strong className="text-[#141413]">María Carmen (+34 611 22 33 44)</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#E2DDD2] pb-2">
                      <span className="text-[#57554F]">Horario programado:</span>
                      <strong className="text-[#141413]">11:00h (Salida del huésped)</strong>
                    </div>
                    <div className="flex justify-between text-[#141413]">
                      <span>Checklist de tareas:</span>
                      <span>4 tareas cargadas automáticamente</span>
                    </div>
                  </div>
                </div>
              )}

              {simStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-[#C85A32] text-white px-2.5 py-1 font-bold">
                    PASO 3 · OFERTA INTELIGENTE
                  </span>
                  <h3 className="text-2xl font-bold text-[#141413]">
                    El huésped solicita Late Check-out desde su Guía
                  </h3>
                  <p className="text-sm text-[#57554F] leading-relaxed">
                    Al ver que su vuelo sale por la tarde, Thomas abre la Guía Digital. El sistema detecta que el piso no tiene entrada ese día y le ofrece quedarse hasta las 17:00h por 35€.
                  </p>
                  <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#E2DDD2] pb-2">
                      <span className="text-[#57554F]">Suplemento solicitado:</span>
                      <strong className="text-[#C85A32] text-sm">+35 € (Salida hasta las 17:00h)</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#E2DDD2] pb-2">
                      <span className="text-[#57554F]">Método de cobro:</span>
                      <strong className="text-[#141413]">Directo anfitrión (Bizum / Airbnb)</strong>
                    </div>
                    <div className="flex justify-between text-[#1F4E3D] font-bold">
                      <span>Comisión Turnexo:</span>
                      <span>0 % (100% íntegro para ti)</span>
                    </div>
                  </div>
                </div>
              )}

              {simStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-[#141413] text-white px-2.5 py-1 font-bold">
                    PASO 4 · MAGIA OPERATIVA
                  </span>
                  <h3 className="text-2xl font-bold text-[#141413]">
                    Reprogramación automática y cero mensajes
                  </h3>
                  <p className="text-sm text-[#57554F] leading-relaxed">
                    Tú apruebas la solicitud con 1 clic en tu panel. Al instante, la hora de entrada de María Carmen cambia en su enlace móvil a las 17:00h. Sin cruzar una sola llamada ni mensaje de WhatsApp.
                  </p>
                  <div className="bg-[#1F4E3D]/10 border border-[#1F4E3D]/30 p-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#1F4E3D]/20 pb-2">
                      <span className="text-[#1F4E3D] font-bold">Nuevo turno de limpieza:</span>
                      <strong className="text-[#1F4E3D]">17:00h (Actualizado en vivo)</strong>
                    </div>
                    <div className="flex justify-between border-b border-[#1F4E3D]/20 pb-2">
                      <span className="text-[#141413]">Ingreso extra para ti:</span>
                      <strong className="text-[#1F4E3D] text-sm font-bold">+35 € netos</strong>
                    </div>
                    <div className="flex justify-between text-[#141413]">
                      <span>Tiempo invertido en WhatsApp:</span>
                      <strong>0 segundos</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSimStep((prev) => (prev === 4 ? 1 : ((prev + 1) as any)))}
                  className="bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-mono uppercase font-bold px-5 py-3 transition flex items-center gap-2"
                >
                  <span>{simStep === 4 ? 'Volver al Paso 1' : 'Ver Siguiente Paso'}</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="text-xs font-mono uppercase font-bold text-[#C85A32] hover:underline"
                >
                  Probar con mis alojamientos →
                </button>
              </div>
            </div>

            {/* Simulación Gráfica de la Pantalla */}
            <div className="lg:col-span-6 bg-[#141413] text-[#F6F4EE] p-6 border border-[#2C2C29] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] text-white/50 ml-2">turnexo-live-sync</span>
                </div>
                <span className="font-mono text-[10px] text-[#C85A32] uppercase font-bold">
                  {simStep === 1 && 'ical_ingest.sync'}
                  {simStep === 2 && 'cleaner_dispatch.view'}
                  {simStep === 3 && 'guest_guide_upsell.request'}
                  {simStep === 4 && 'realtime_reschedule.done'}
                </span>
              </div>

              {simStep === 1 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[#C85A32] text-[10px] font-bold block">EVENTO ICAL CAPTURADO</span>
                    <p className="font-bold text-white text-sm">UID: airbnb-res-HM891@turnexo</p>
                    <p className="text-white/60 text-[11px]">SUMMARY: Thomas Müller (Reserva Confirmada)</p>
                    <p className="text-white/60 text-[11px]">DTSTART: 20261024T150000Z · DTEND: 20261027T110000Z</p>
                  </div>
                  <div className="p-3 bg-[#1F4E3D]/30 border border-[#1F4E3D]/50 text-emerald-300 text-[11px]">
                    ✓ El algoritmo verifica el calendario: No hay entrada el 27 Oct por la tarde. El alojamiento queda marcado como apto para venta de Late Check-out.
                  </div>
                </div>
              )}

              {simStep === 2 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[#FAF9F5] text-[#141413] p-4 border border-[#D5CFC0] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs uppercase text-[#1F4E3D]">Vista Limpiadora Móvil</span>
                      <span className="bg-[#141413] text-white px-2 py-0.5 text-[10px]">11:00h</span>
                    </div>
                    <p className="font-bold text-sm">Ático Vista Marina · 45 €</p>
                    <p className="text-[11px] text-[#57554F]">Cajetín: 4829# · Thomas Müller sale a las 11:00h</p>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    María Carmen lo consulta en su teléfono móvil sin instalar nada. Su enlace está activo y actualizado.
                  </p>
                </div>
              )}

              {simStep === 3 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[#FAF9F5] text-[#141413] p-4 border-2 border-[#C85A32] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#C85A32] flex items-center gap-1">
                        <Sparkles size={12} /> Oferta Especial para Thomas
                      </span>
                      <span className="font-bold text-sm text-[#141413]">+35 €</span>
                    </div>
                    <p className="font-bold text-sm">¿Tu vuelo sale tarde? Quédate hasta las 17:00h</p>
                    <p className="text-[11px] text-[#57554F]">
                      Disfruta la mañana en la playa y dúchate con calma antes de salir al aeropuerto.
                    </p>
                    <div className="pt-1">
                      <span className="inline-block bg-[#C85A32] text-white px-3 py-1 font-bold text-[10px] uppercase">
                        ✓ Solicitado por el huésped
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {simStep === 4 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-[#1F4E3D] text-white p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                      ✓ HORARIO RETRASADO AUTOMÁTICAMENTE
                    </span>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-base">Ático Vista Marina</p>
                      <span className="bg-white text-[#1F4E3D] px-2.5 py-1 font-bold text-xs">
                        NUEVA HORA: 17:00h
                      </span>
                    </div>
                    <p className="text-white/80 text-[11px]">
                      María Carmen ve su turno aplazado a las 17:00h. Huésped feliz y anfitrión con +35€ en cuenta.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE MÓDULOS INDEPENDIENTES O COMBINADOS */}
      <section id="modulos" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-3xl space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            Arquitectura Modular Especializada
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] leading-tight tracking-tight">
            Las dos herramientas clave que resuelven tu día a día como anfitrión.
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            Guest App para una experiencia en vídeo y cross-selling, y Cleaning App para eliminar la comunicación con tu limpiadora y auditar la limpieza con fotos. Úsalas juntas o por separado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bloque Módulo Guía */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
                  MÓDULO 1 · GUEST APP BOUTIQUE
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                  1 Piso Gratis · Pro desde 19€/mes
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#C85A32] font-bold block">
                  CERO LLAMADAS A DESHORAS · CROSS-SELLING DIRECTO
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  Vídeo Home Tour, Check-in en vídeo, guías de electrodomésticos y venta de extras.
                </h3>
              </div>

              <p className="text-sm text-[#57554F] leading-relaxed">
                Elimina las preguntas repetitivas a medianoche sobre cómo abrir el portal, cómo encender la vitrocerámica o cuál es la clave del WiFi. Y monetiza cada tarde libre de tu calendario sin comisiones. Todo en un portal web inmediato sin que el viajero tenga que descargar nada.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Video size={14} className="text-[#C85A32]" />
                    Vídeo Home Tour de Bienvenida
                  </p>
                  <p className="text-[#57554F]">
                    El huésped ve un vídeo completo del apartamento antes de llegar: ubica cada estancia y disfruta de una bienvenida premium.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    Vídeos de Check-in Paso a Paso
                  </p>
                  <p className="text-[#57554F]">
                    Muestra exactamente cómo abrir el portal y el cajetín de llaves, con desbloqueo inteligente tras reproducir el vídeo.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C85A32]" />
                    Vídeo-Guías de Electrodomésticos
                  </p>
                  <p className="text-[#57554F]">
                    Vídeos cortos para la vitrocerámica, aire acondicionado o termo. El huésped lo resuelve en 15 segundos sin llamarte a las 23:30h.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#1F4E3D]" />
                    Venta de Late Check-out (+35 €)
                  </p>
                  <p className="text-[#57554F]">
                    Si la tarde queda libre en el iCal, ofrece quedarse hasta las 17:00h. Cobrado 100% íntegro directo a ti sin comisiones.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1 sm:col-span-2">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <QrCode size={14} className="text-[#C85A32]" />
                    WiFi en 1 Toque y Cartel QR para Enmarcar
                  </p>
                  <p className="text-[#57554F]">
                    Botón copiar clave, conexión por código QR y generador de lámina PDF elegante para poner en la mesita del recibidor.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenGuestDemo}
                className="text-xs font-mono uppercase tracking-wider font-bold text-[#C85A32] hover:underline"
              >
                Ver Guía de Ejemplo en Vivo →
              </button>
              <button
                type="button"
                onClick={onNavigateToApp}
                className="bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-semibold px-5 py-3 transition"
              >
                Crear Guía Gratis
              </button>
            </div>
          </div>

          {/* Bloque Módulo Limpiezas */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#57554F]">
                  MÓDULO 2 · CLEANING APP SIN CONTRASEÑAS
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                  1 Piso Gratis · Pro desde 19€/mes
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#1F4E3D] font-bold block">
                  CERO WHATSAPPS · AUDITORÍA CON FOTOS
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  Ahorra toda la comunicación con tu limpiadora y comprueba que todo esté impecable.
                </h3>
              </div>

              <p className="text-sm text-[#57554F] leading-relaxed">
                Tu limpiadora entra desde un enlace directo en el navegador de su teléfono (sin apps ni contraseñas que olvidar). Sigue el checklist específico de cada piso y sube fotos reales de auditoría antes de que entre el siguiente huésped.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Users size={14} className="text-[#1F4E3D]" />
                    Ahorra toda la comunicación por WhatsApp
                  </p>
                  <p className="text-[#57554F]">
                    Se acabaron los mensajes de "¿a qué hora entro?". Ella ve sus turnos sincronizados en tiempo real según el iCal de Airbnb y Booking.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    Checklist Habitación por Habitación
                  </p>
                  <p className="text-[#57554F]">
                    Sábanas cambiadas, toallas limpias, desinfección de baño y reposición de amenities. Tareas claras para no dejar nada al azar.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1F4E3D]" />
                    Comprueba las Fotos desde tu Móvil
                  </p>
                  <p className="text-[#57554F]">
                    La limpiadora toma fotos con la cámara al terminar. Tú compruebas desde tu móvil que todo está impecable antes de la entrada.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Flame size={14} className="text-[#C85A32]" />
                    Alerta 🔥 ENTRADA HOY (Rotaciones)
                  </p>
                  <p className="text-[#57554F]">
                    Marca en rojo las salidas a las 11:00h que tienen entrada a las 15:00h para priorizar la limpieza sin necesidad de llamarla.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1 sm:col-span-2">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1F4E3D]" />
                    Prueba Indiscutible ante Reclamaciones de Airbnb
                  </p>
                  <p className="text-[#57554F]">
                    Registro fotográfico con fecha y hora de la limpieza como prueba contundente ante cualquier disputa o reclamación injustificada.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenCleanerDemo}
                className="text-xs font-mono uppercase tracking-wider font-bold text-[#1F4E3D] hover:underline"
              >
                Abrir App de la Limpiadora →
              </button>
              <button
                type="button"
                onClick={onNavigateToApp}
                className="bg-[#141413] text-white text-xs font-semibold px-5 py-3"
              >
                Gestionar Turnos en el Panel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE COMPARATIVA DIRECTA: TURNEXO VS WHATSAPP/EXCEL VS HERRAMIENTAS AMERICANAS */}
      <section id="comparativa" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            COMPARATIVA DIRECTA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] leading-tight tracking-tight">
            ¿Por qué los anfitriones abandonan las hojas de cálculo y WhatsApp?
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            Coordinar limpiezas manualmente cuesta horas cada semana y genera confusiones con cancelaciones de última hora.
          </p>
        </div>

        <div className="bg-[#FAF9F5] border border-[#D5CFC0] overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC0] bg-[#E8E4D9]/60 font-mono text-[11px] uppercase tracking-wider text-[#57554F]">
                <th className="py-4 px-5">Característica / Necesidad</th>
                <th className="py-4 px-5 text-[#57554F]">Excel + Grupos WhatsApp</th>
                <th className="py-4 px-5 text-[#57554F]">Software Tradicional en Inglés</th>
                <th className="py-4 px-5 bg-[#141413] text-[#F6F4EE] font-bold">Turnexo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD2]">
              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Sincronización con Airbnb y Booking
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Manual cada día (riesgo de no enterarte de reservas tardías)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Compleja (requiere cuenta Channel Manager costosa)
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ 100% Automática vía URL .ics en 30 seg
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Acceso para el personal de limpieza
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Mensajes de texto que se pierden en el chat
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Obliga a la limpiadora a crear cuenta y bajar app en inglés
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Enlace web directo al móvil sin contraseñas
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Alerta de Rotación Mismo Día
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Debes recordarlo tú y llamar para avisar
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  A veces configurable con coste extra
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Insignia 🔥 ENTRADA HOY automática
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Monetización de Late Check-out
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  0 € (se regala de palabra si el huésped pregunta)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  No conecta la salida del huésped con el cuadrante
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Ofrece el extra solo si el día está libre (+35€)
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Vídeo Home Tour y Guías de Electrodomésticos
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Textos largos o PDFs de 20 páginas que el huésped no lee
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Formatos rígidos sin soporte para YouTube o Shorts
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Vídeo Home Tour, check-in y guías de vitro/clima/termo
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Auditoría fotográfica de limpieza
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  A ciegas (te enteras cuando el nuevo huésped se queja)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  No incluye fotos de comprobación en tiempo real
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Checklist por estancia y fotos que revisas desde tu móvil
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Vídeos de llegada paso a paso
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Vídeos pesados enviados por WhatsApp que caducan
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Formatos complejos con reproductores externos
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Reproductor integrado para YouTube, Shorts y Drive
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Facturación IVA 10% y Modelo 303 Hacienda
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Facturas a mano en Word/Excel y enviar extractos desordenados al gestor
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Módulos ERP complejos que requieren parametrización costosa
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Facturas oficiales en 1 clic y descarga de Libro de IVA listo para tu gestoría
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Coste mensual
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  "Gratis" (pero pierdes 4h semanales y 150€ en extras)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  30 € a 60 € / mes
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#C85A32]">
                  1 piso 100% Gratis · Hasta 5 pisos: 19 €/mes (tarifa plana)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* GARANTÍAS DE RIESGO CERO (CONFIANZA REAL Y TRANSPARENCIA TÉCNICA) */}
      <section id="garantias" className="bg-[#FAF9F5] border-b border-[#E2DDD2] py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1F4E3D] font-bold">
              PRUÉBALO SIN RIESGO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight">
              Empezar no te cuesta nada. Ni dinero, ni contraseñas, ni permanencia.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: 'No pedimos tu contraseña de Airbnb',
                desc: 'Solo el enlace público del calendario (iCal). Tu cuenta de Airbnb o Booking no se toca.',
              },
              {
                icon: Check,
                title: 'Sin tarjeta de crédito',
                desc: 'El plan de 1 alojamiento es gratuito. Solo pagas si añades más pisos o activas facturación.',
              },
              {
                icon: Clock,
                title: 'Funcionando en 5 minutos',
                desc: 'Pegas el iCal, rellenas WiFi y códigos, y ya tienes el enlace para tu limpiadora y el QR para el huésped.',
              },
              {
                icon: FileSpreadsheet,
                title: 'Tus datos son tuyos',
                desc: 'Exporta reservas, limpiezas y facturas en CSV cuando quieras. Cancelas con un clic.',
              },
            ].map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.title} className="bg-white border border-[#D5CFC0] p-6 space-y-2 shadow-sm">
                  <Icon size={20} className="text-[#1F4E3D]" />
                  <h3 className="font-bold text-sm text-[#141413]">{g.title}</h3>
                  <p className="text-xs text-[#57554F] leading-relaxed">{g.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRECIOS CLAROS: 3 PLANES DE TARIFA PLANA */}
      <section id="precios" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            PRECIOS · TARIFA PLANA, NO POR PISO
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight">
            Empieza gratis. Paga solo cuando crezcas.
          </h2>
          <p className="text-sm text-[#57554F]">
            Un solo Late Check-out al mes (+35 €) ya cubre el plan Pro Fiscal completo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {[
            {
              name: 'Starter',
              units: '1 alojamiento',
              price: '0 €',
              note: '/mes',
              summary:
                'Plan gratuito para 1 alojamiento. Enlace móvil de limpiadora, Guía del huésped con cartel QR y retención de fotos a 7 días.',
              highlight: false,
              cta: 'Empezar gratis (Sin tarjeta)',
              features: [
                'Cleaning App con checklist por estancia y fotos',
                'Guest App con Vídeo Home Tour y guías en vídeo',
                'Venta automática de Late Check-out (+35 €)',
                'Sincronización iCal con Airbnb y Booking',
                'Fotos de auditoría guardadas 7 días',
                'Sello discreto "Creado con Turnexo" en la guía',
              ],
            },
            {
              name: 'Pro Fiscal',
              units: 'Hasta 5 alojamientos',
              price: '19 €',
              note: '/mes en total (tarifa plana)',
              summary:
                'Todo el control operativo + facturación con IVA del 10% y exportación trimestral en 1 clic para tu gestoría.',
              highlight: true,
              cta: 'Activar Plan Pro Fiscal',
              features: [
                'Todo lo incluido en Starter para hasta 5 pisos',
                'Facturas simplificadas y completas con IVA 10% en 1 clic',
                'Libro de IVA trimestral en Excel listo para Modelo 303',
                'Historial fotográfico ilimitado ante reclamaciones',
                'Guía del huésped 100% marca blanca (sin sello Turnexo)',
              ],
            },
            {
              name: 'Microgestora',
              units: 'Hasta 10 alojamientos',
              price: '39 €',
              note: '/mes en total (tarifa plana)',
              summary:
                'Para gestores con varias limpiadoras y rotación frecuente que necesitan control de pagos y auditoría multi-equipo.',
              highlight: false,
              cta: 'Activar Plan Microgestora',
              features: [
                'Todo lo incluido en Pro Fiscal para hasta 10 pisos',
                'Múltiples limpiadoras con asignación por apartamento',
                'Control y liquidación mensual de pagos de limpieza',
                'Soporte prioritario directo',
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-8 flex flex-col justify-between space-y-6 ${
                plan.highlight
                  ? 'bg-[#141413] text-[#F6F4EE] border-2 border-[#141413] shadow-[8px_8px_0px_#C85A32]'
                  : 'bg-[#FAF9F5] text-[#141413] border border-[#D5CFC0]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="font-mono text-[10px] uppercase font-bold bg-[#C85A32] text-white px-2 py-0.5">
                      Más elegido
                    </span>
                  )}
                </div>
                <p className={`text-xs font-mono uppercase ${plan.highlight ? 'text-white/60' : 'text-[#57554F]'}`}>
                  {plan.units}
                </p>
                <p className="font-mono">
                  <span className="text-5xl font-extrabold">{plan.price}</span>{' '}
                  <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-[#57554F]'}`}>{plan.note}</span>
                </p>
                <p className={`text-xs leading-relaxed ${plan.highlight ? 'text-white/75' : 'text-[#57554F]'}`}>
                  {plan.summary}
                </p>
                <ul className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-current/10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-[#C85A32]' : 'text-[#1F4E3D]'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={onNavigateToApp}
                className={`w-full font-mono uppercase tracking-wider font-bold text-xs py-4 transition flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-[#C85A32] hover:bg-[#B04A25] text-white shadow-md'
                    : 'bg-[#141413] hover:bg-[#2C2C29] text-white'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#57554F] mt-8">
          ¿Gestionas más de 10 alojamientos? Tarifa plana de 59 €/mes o configuración a medida desde tu panel.
        </p>
      </section>

      {/* CALCULADORA INTERACTIVA DE RETORNO */}
      <section id="retorno" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#141413] text-[#F6F4EE] p-8 sm:p-14">
          <div className="lg:col-span-7 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32]">
              Calculadora de Retorno Inmediato
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Calcula cuánto ganas en Late Check-outs y cuánto tiempo ahorras al mes.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-xl">
              Cuando un huésped tiene su vuelo por la tarde y ve en la Guía Digital que su apartamento no tiene entradas ese día, solicita quedarse hasta las 17:00h sin dudarlo. Tú lo cobras directamente por Airbnb o Bizum sin intermediarios.
            </p>

            <div className="space-y-5 pt-2 max-w-lg">
              <div>
                <div className="flex justify-between text-xs font-mono uppercase mb-2">
                  <span className="text-white/70">Propiedades gestionadas</span>
                  <span className="font-bold text-white">{units} alojamientos</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full accent-[#C85A32]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono uppercase mb-2">
                  <span className="text-white/70">Importe por Late Check-out / Extra</span>
                  <span className="font-bold text-white">{upsellAvg} €</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={60}
                  step={5}
                  value={upsellAvg}
                  onChange={(e) => setUpsellAvg(Number(e.target.value))}
                  className="w-full accent-[#C85A32]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FAF9F5] text-[#141413] p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#E2DDD2] pb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#57554F] block">
                  BENEFICIO NETO ESTIMADO TRAS COSTE DE TURNEXO
                </span>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#C85A32] text-white">
                  {units === 1 ? 'Plan 100% Gratis' : `Tarifa Plana ${platformCost} €/mes`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="font-mono text-5xl font-extrabold text-[#1F4E3D]">
                  +{netProfit} €<span className="text-base font-normal text-[#57554F]">/mes</span>
                </p>
                <span className="font-mono text-xs font-bold uppercase bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                  {platformCost === 0 ? 'Coste 0 € · 100% Neto' : `+${Math.round((monthlyGain / platformCost) * 100)}% ROI`}
                </span>
              </div>
              <p className="text-xs text-[#57554F]">
                +{(netProfit * 12).toLocaleString()} € de beneficio extra anual neto para tu negocio.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-white border border-[#E2DDD2] p-3">
                <span className="text-[10px] text-[#57554F] uppercase block">INGRESOS EXTRAS BRUTOS</span>
                <span className="font-bold text-sm text-[#141413] mt-0.5 block">+{monthlyGain} €/mes</span>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3">
                <span className="text-[10px] text-[#57554F] uppercase block">TIEMPO AHORRADO</span>
                <span className="font-bold text-sm text-[#C85A32] mt-0.5 block">~{hoursSaved} h/mes</span>
              </div>
            </div>

            {/* Tramos Cerrados de Tarifa Plana */}
            <div className="space-y-2 text-xs">
              <div className={`flex justify-between py-2 border-b border-[#E2DDD2] px-2 ${units === 1 ? 'bg-[#1F4E3D]/10 font-bold' : ''}`}>
                <span className="font-semibold">1 Alojamiento</span>
                <span className="font-mono font-bold text-[#1F4E3D]">0 € Plan Gratuito</span>
              </div>
              <div className={`flex justify-between py-2 border-b border-[#E2DDD2] px-2 ${units >= 2 && units <= 5 ? 'bg-emerald-500/10 font-bold' : ''}`}>
                <span className="font-semibold text-[#141413]">Hasta 5 Alojamientos (Pro Fiscal)</span>
                <span className="font-mono font-bold text-emerald-800">19 € / mes (tarifa plana total)</span>
              </div>
              <div className={`flex justify-between py-2 border-b border-[#E2DDD2] px-2 ${units >= 6 && units <= 10 ? 'bg-[#C85A32]/10 font-bold' : ''}`}>
                <span className="font-semibold text-[#C85A32]">Hasta 10 Alojamientos (Microgestoras)</span>
                <span className="font-mono font-bold text-[#C85A32]">39 € / mes (tarifa plana total)</span>
              </div>
              <div className={`flex justify-between py-2 px-2 ${units > 10 ? 'bg-[#141413]/10 font-bold' : ''}`}>
                <span className="font-semibold text-[#57554F]">Más de 10 Alojamientos</span>
                <span className="font-mono font-bold text-[#57554F]">59 € / mes (tarifa plana total)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToApp}
              className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white text-xs font-mono uppercase tracking-wider font-bold py-4 transition flex items-center justify-center gap-2 shadow-md group"
            >
              <span>Crear mi primer manual gratis (Sin tarjeta)</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN FAQ INTERACTIVA PARA SEO Y RESOLUCIÓN DE OBJECIONES */}
      <section id="faq" className="max-w-7xl mx-auto px-6 py-20 border-t border-[#E2DDD2]">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] tracking-tight">
              Todo lo que necesitas saber antes de empezar.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Cómo se conecta con mis anuncios de Airbnb y Booking?',
                a: 'Sin contraseñas de tus cuentas. Solo copias el enlace público de exportación iCal (.ics) que te da Airbnb o Booking en la sección de calendarios y lo pegas en Turnexo. En 30 segundos todas tus reservas pasadas y futuras quedan sincronizadas automáticamente.',
              },
              {
                q: '¿Mis limpiadoras necesitan descargarse una app de la App Store o crearse cuenta?',
                a: 'No. Cada limpiadora recibe un enlace seguro y directo por WhatsApp. Al abrirlo en el navegador de su teléfono ve su parte de trabajo del día, horas de check-in urgente, checklist en español y botón para tomar fotos de auditoría sin necesidad de usuario ni contraseña.',
              },
              {
                q: '¿Cómo funciona la venta de Late Check-out y cobro de extras?',
                a: 'Turnexo detecta mediante el calendario iCal si el día de salida del huésped entra otra reserva o queda libre. Si queda libre, ofrece el Late Check-out hasta la tarde. Tú cobras el 100% del dinero directamente al huésped (por el centro de resoluciones de Airbnb, Bizum o tarjeta) sin que Turnexo te cobre ninguna comisión.',
              },
              {
                q: '¿Cómo funcionan los planes y tarifas? ¿Hay plan gratuito?',
                a: 'El Plan Gratuito (Starter) está diseñado para anfitriones de 1 alojamiento (con marca de agua discreta y retención de fotos de auditoría a 7 días). Para anfitriones de hasta 5 alojamientos que necesitan facturación oficial con IVA del 10% y exportación para su gestor, el Plan Pro Fiscal cuesta 19 €/mes (tarifa plana total, no por piso). Y para pequeñas gestoras de hasta 10 alojamientos, el Plan Microgestora cuesta 39 €/mes.',
              },
              {
                q: '¿Cómo funcionan el Vídeo Home Tour y las vídeo-guías de electrodomésticos?',
                a: 'Al dar de alta tu piso en el panel, solo pegas los enlaces de tus vídeos (de YouTube, Shorts o Google Drive) para el Home Tour, el acceso al portal o el uso de la vitrocerámica y el aire acondicionado. En la Guía del Huésped se reproducen directamente sin descargas ni esperas, eliminando las dudas repetitivas a deshoras.',
              },
              {
                q: '¿Cómo compruebo que la limpiadora ha terminado y que el piso está limpio?',
                a: 'Tu personal de limpieza accede con su enlace móvil directo. Sigue el checklist de tareas de cada habitación y toma fotos obligatorias con la cámara de su móvil al terminar. Las fotos se sincronizan al instante en tu panel de anfitrión para que verifiques desde tu sofá que todo está impecable antes del siguiente check-in.',
              },
              {
                q: '¿Tengo permanencia o tengo que poner mi tarjeta de crédito para probar?',
                a: 'Cero permanencia y cero tarjetas para empezar. Puedes usar el plan gratuito indefinidamente o probar los módulos con tus alojamientos reales sin compromiso. Cancelas o cambias de plan con un solo clic desde tu panel.',
              },
            ].map((faqItem, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#FAF9F5] border border-[#D5CFC0] transition overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 font-bold text-sm sm:text-base text-[#141413] flex items-center justify-between gap-4"
                  >
                    <span>{faqItem.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#C85A32] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#57554F] leading-relaxed border-t border-[#E2DDD2]/60 animate-in fade-in duration-200">
                      {faqItem.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO Y ENLACES */}
      <footer className="border-t border-[#D5CFC0] bg-[#141413] text-[#F6F4EE] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono text-white/60">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#C85A32] text-white flex items-center justify-center font-bold text-[10px]">
              TX
            </div>
            <span className="font-bold text-white text-sm">Turnexo</span>
            <span>· Plataforma para Alojamientos Vacacionales</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#modulos" className="hover:text-white transition">Módulos</a>
            <a href="#precios" className="hover:text-white transition">Precios</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            {onOpenLegal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition"
                >
                  Privacidad
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition"
                >
                  Términos
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal('legal')}
                  className="hover:text-white transition"
                >
                  Aviso Legal
                </button>
              </>
            )}
            <button type="button" onClick={onNavigateToApp} className="text-[#C85A32] font-bold hover:underline">
              Acceder al Panel
            </button>
          </div>
        </div>
        <p className="text-center font-mono text-[10px] text-white/35 mt-8">
          © {new Date().getFullYear()} Turnexo. Todos los derechos reservados. Optimizado para Airbnb, Booking y Vrbo.
        </p>
      </footer>
    </div>
  );
}
