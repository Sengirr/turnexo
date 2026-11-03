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
  Star,
  CheckCircle2,
  X,
  Smartphone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  MessageSquare,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { parseICalContent } from '../lib/icalParser';

interface Props {
  onNavigateToApp: () => void;
  onOpenGuestDemo: () => void;
  onOpenCleanerDemo: () => void;
}

export default function LandingPageView({
  onNavigateToApp,
  onOpenGuestDemo,
  onOpenCleanerDemo,
}: Props) {
  const [units, setUnits] = useState(5);
  const [upsellAvg, setUpsellAvg] = useState(35);
  const monthlyGain = units * 2 * upsellAvg;

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
              <a href="#testimonios" className="hover:text-[#141413] transition">
                Testimonios
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
              className="bg-[#141413] hover:bg-[#2C2C29] text-[#F6F4EE] text-xs font-semibold uppercase tracking-wider px-5 py-3 transition flex items-center gap-2"
            >
              <span>Entrar al Panel</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO EDITORIAL + MAQUETA ARQUITECTÓNICA */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 border-b border-[#E2DDD2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8 pt-2">
            <div className="inline-flex items-center gap-2.5 border border-[#D5CFC0] bg-[#FAF9F5] px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[#57554F]">
              <span className="w-2 h-2 rounded-full bg-[#1F4E3D]" />
              <span>Compatible con Airbnb · Booking.com · Vrbo (.ics)</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-7xl leading-[1.03] tracking-tight text-[#141413]">
              Operativa de limpiezas y experiencia del huésped,{' '}
              <span className="italic text-[#C85A32]">en sincronía.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#57554F] leading-relaxed max-w-2xl font-normal">
              Dos módulos independientes diseñados para gestores y propietarios que no quieren perder tiempo en WhatsApp. Conecta el enlace iCal de tus anuncios para automatizar los turnos de tu personal de limpieza y ofrece una Guía Digital a medida con vídeos del alojamiento y venta de Late Check-out.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onNavigateToApp}
                className="bg-[#C85A32] hover:bg-[#B04A25] text-white text-sm font-semibold px-7 py-4 transition flex items-center gap-2.5 shadow-sm"
              >
                <span>Abrir Panel del Anfitrión</span>
                <ArrowUpRight size={17} />
              </button>

              <button
                type="button"
                onClick={onOpenGuestDemo}
                className="border border-[#141413] bg-transparent hover:bg-[#141413] hover:text-[#F6F4EE] text-[#141413] text-sm font-semibold px-6 py-4 transition"
              >
                Ver Guía Digital en Vivo (/g/...)
              </button>

              <button
                type="button"
                onClick={onOpenCleanerDemo}
                className="text-xs font-mono uppercase tracking-wider underline underline-offset-4 text-[#57554F] hover:text-[#141413] px-3 py-2"
              >
                Ver Vista Limpiadora (/c/...) →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#E2DDD2] max-w-xl">
              <div>
                <p className="font-mono text-2xl font-bold text-[#141413]">60 seg</p>
                <p className="text-xs text-[#57554F] mt-0.5">Puesta en marcha vía URL .ics</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#141413]">0 %</p>
                <p className="text-xs text-[#57554F] mt-0.5">Comisión sobre tus extras vendidos</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#1F4E3D]">100 %</p>
                <p className="text-xs text-[#57554F] mt-0.5">Personalizable por propiedad</p>
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
                <span>Vista Limpiadora (/c/)</span>
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
                <span>Vista Huésped (/g/)</span>
              </button>
            </div>

            {previewTab === 'cleaner' ? (
              <div className="bg-[#FAF9F5] border-2 border-[#141413] p-6 space-y-4 shadow-[6px_6px_0px_#141413]">
                <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold">
                      SIN CONTRASEÑAS · ACCESO DIRECTO
                    </span>
                    <h4 className="font-serif text-2xl text-[#141413] mt-0.5">
                      Parte de María Carmen
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold bg-[#1F4E3D] text-white px-2.5 py-1">
                    80 € Acumulados
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3.5 bg-white border-l-4 border-[#C85A32] border border-[#E2DDD2] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#C85A32] flex items-center gap-1">
                        <Flame size={13} /> ENTRADA HOY · ROTACIÓN 15:00H
                      </span>
                      <span className="font-mono font-bold bg-[#141413] text-white px-2 py-0.5 text-[11px]">
                        11:00 → 15:00
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#141413]">Loft Centro Catedral · 38 €</p>
                    <p className="text-[#57554F] text-[11px]">Checklist: 4/4 comprobados · 3 fotos enviadas</p>
                  </div>

                  <div className="p-3.5 bg-white border-l-4 border-[#1F4E3D] border border-[#E2DDD2] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#1F4E3D] flex items-center gap-1">
                        <Clock size={13} /> LATE CHECK-OUT APROBADO
                      </span>
                      <span className="font-mono font-bold bg-[#1F4E3D] text-white px-2 py-0.5 text-[11px]">
                        Entrar 17:00h
                      </span>
                    </div>
                    <p className="font-bold text-sm text-[#141413]">Ático Vista Marina · 45 €</p>
                    <p className="text-[#57554F] text-[11px]">La hora se retrasó automáticamente al aprobar el anfitrión</p>
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
                    <h3 className="font-serif text-2xl mt-0.5">Ático Vista Marina</h3>
                  </div>
                  <span className="font-mono text-xs bg-white/10 px-2.5 py-1 text-white/80">
                    ES · EN · FR
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                  <div className="bg-white/5 border border-white/10 p-3">
                    <span className="text-white/50 block text-[10px]">CÓDIGO PUERTA</span>
                    <span className="font-bold text-sm mt-0.5 text-white block">4829#</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3">
                    <span className="text-white/50 block text-[10px]">RED WIFI</span>
                    <span className="font-bold text-sm mt-0.5 text-white block truncate">VistaMarina_5G</span>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] text-[#141413] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#1F4E3D] font-bold flex items-center gap-1">
                      <Sparkles size={12} /> HUECO DETECTADO EN ICAL
                    </span>
                    <span className="font-mono font-bold text-sm">+35 €</span>
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

      {/* HERRAMIENTA INTERACTIVA (LEAD MAGNET): PROBADOR DE ICAL EN VIVO */}
      <section id="probar-ical" className="bg-[#1E1E1C] text-[#F6F4EE] border-b border-[#2C2C29] py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              HERRAMIENTA GRATUITA · PRUÉBALO EN 10 SEGUNDOS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
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
                  <span>Crear mi Panel con este iCal (14 Días Gratis)</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN DE MÓDULOS INDEPENDIENTES O COMBINADOS */}
      <section id="modulos" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-2xl space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            Arquitectura Modular
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#141413] leading-tight">
            Dos herramientas especializadas. Úsalas por separado o conéctalas.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bloque Módulo Guía */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#57554F]">
                  MÓDULO A · EXPERIENCIA & UPSELL
                </span>
                <span className="font-mono text-sm font-bold text-[#141413]">12 € / mes</span>
              </div>

              <h3 className="font-serif text-3xl text-[#141413]">
                Guía Digital del Huésped a Medida
              </h3>

              <p className="text-sm text-[#57554F] leading-relaxed">
                Sustituye los PDFs interminables y las llamadas a medianoche por una web móvil con estética de hotel boutique. Cada apartamento tiene su propio enlace y cartel QR imprimible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Video size={14} className="text-[#C85A32]" />
                    Vídeos y Home Tour
                  </p>
                  <p className="text-[#57554F]">
                    Inserta vídeos de cómo abrir el cajetín, usar la vitrocerámica o recorrer el piso.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C85A32]" />
                    Catálogo de Extras Propios
                  </p>
                  <p className="text-[#57554F]">
                    Configura Late Check-out, Parking, Cuna o Mascota. Lo cobras tú por Airbnb o Bizum.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Clock size={14} className="text-[#C85A32]" />
                    Horarios y Normas Editables
                  </p>
                  <p className="text-[#57554F]">
                    Cambia horas de entrada/salida, WiFi, códigos y recomendaciones en tiempo real.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <QrCode size={14} className="text-[#C85A32]" />
                    Cartel QR Listo para Imprimir
                  </p>
                  <p className="text-[#57554F]">
                    Genera una lámina PDF con los datos del WiFi y el código QR de cada propiedad.
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
                className="bg-[#141413] text-white text-xs font-semibold px-5 py-3"
              >
                Personalizar Guía en el Panel
              </button>
            </div>
          </div>

          {/* Bloque Módulo Limpiezas */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#57554F]">
                  MÓDULO B · OPERACIONES & LIMPIEZA
                </span>
                <span className="font-mono text-sm font-bold text-[#141413]">12 € / mes</span>
              </div>

              <h3 className="font-serif text-3xl text-[#141413]">
                Coordinación Automática de Limpiadoras vía iCal
              </h3>

              <p className="text-sm text-[#57554F] leading-relaxed">
                Lee cada 15 minutos los calendarios de Airbnb y Booking.com. Tu limpiadora entra desde un enlace directo en su móvil (sin usuarios ni contraseñas) y ve exactamente qué pisos salen hoy.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Flame size={14} className="text-[#C85A32]" />
                    Alerta de Rotación Mismo Día
                  </p>
                  <p className="text-[#57554F]">
                    Marca automáticamente como prioritarios los pisos donde entra otro huésped a las 15:00h.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1F4E3D]" />
                    Checklist + Fotos de Auditoría
                  </p>
                  <p className="text-[#57554F]">
                    Checklist personalizado por apartamento y subida de fotos reales desde la cámara del móvil.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#1F4E3D]" />
                    Sincronización con Late Check-out
                  </p>
                  <p className="text-[#57554F]">
                    Si apruebas un Late Check-out a un huésped, la hora de la limpiadora cambia sola en su móvil.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Users size={14} className="text-[#1F4E3D]" />
                    Liquidación Semanal y Roturas
                  </p>
                  <p className="text-[#57554F]">
                    Calcula el importe acumulado por limpiadora y recibe avisos de desperfectos al instante.
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
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141413] leading-tight">
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
                <th className="py-4 px-5 bg-[#141413] text-[#F6F4EE] font-bold">Turnexo (Módulo 1 + 2)</th>
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
                  ✓ Enlace web único (/c/token) sin contraseñas
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
                  Coste mensual
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  "Gratis" (pero pierdes 4h semanales y 150€ en extras)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  30 € a 60 € / mes
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#C85A32]">
                  Desde 9 €/mes (amortizado con 1 sola venta)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN DE PRUEBA SOCIAL Y TESTIMONIOS REALES */}
      <section id="testimonios" className="bg-[#FAF9F5] border-b border-[#E2DDD2] py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1F4E3D] font-bold">
              CASOS DE ÉXITO · ANFITRIONES EN ESPAÑA
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141413]">
              Superhosts y gestores que ya operan con Turnexo.
            </h2>
            <p className="text-xs sm:text-sm text-[#57554F]">
              Historias reales de anfitriones que redujeron sus llamadas y aumentaron su ticket medio por reserva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#D5CFC0] p-7 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#C85A32]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#141413] leading-relaxed italic font-serif">
                  "Llevo 6 apartamentos turísticos en Málaga capital. Los domingos por la tarde eran una pesadilla cuadrando cambios de sábanas. Ahora cada limpiadora tiene su enlace fijado en el móvil y no me llaman ni una sola vez para preguntar qué piso toca."
                </p>
              </div>

              <div className="border-t border-[#E2DDD2] pt-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#141413]">Carlos M.</p>
                  <p className="text-[11px] text-[#57554F]">Gestor de 6 pisos · Málaga</p>
                </div>
                <span className="font-mono text-[10px] uppercase bg-[#1F4E3D]/10 text-[#1F4E3D] font-bold px-2 py-0.5">
                  Pack Completo
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#D5CFC0] p-7 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#C85A32]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#141413] leading-relaxed italic font-serif">
                  "Solo el mes pasado ingresamos 245 € extras vendiendo Late Check-outs desde la Guía Digital en el ático de Marbella. Antes el huésped nos lo pedía por chat a última hora y se lo dábamos gratis por compromiso. Ahora lo piden por la guía y pagan contentos."
                </p>
              </div>

              <div className="border-t border-[#E2DDD2] pt-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#141413]">Elena & Marcos</p>
                  <p className="text-[11px] text-[#57554F]">Superhosts · Marbella</p>
                </div>
                <span className="font-mono text-[10px] uppercase bg-[#C85A32]/10 text-[#C85A32] font-bold px-2 py-0.5">
                  +245€ / mes
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#D5CFC0] p-7 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#C85A32]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#141413] leading-relaxed italic font-serif">
                  "El vídeo de cómo abrir el cajetín de llaves y el WiFi en QR en el recibidor nos ha quitado el 90% de los mensajes de bienvenida de huéspedes extranjeros. La guía en inglés y francés hace que se sientan como en un hotel de 5 estrellas."
                </p>
              </div>

              <div className="border-t border-[#E2DDD2] pt-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#141413]">Javier S.</p>
                  <p className="text-[11px] text-[#57554F]">Propietario · Madrid Centro</p>
                </div>
                <span className="font-mono text-[10px] uppercase bg-[#141413]/10 text-[#141413] font-bold px-2 py-0.5">
                  Solo Guía
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE RETORNO Y PRECIOS CLAROS */}
      <section id="retorno" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-[#141413] text-[#F6F4EE] p-8 sm:p-14">
          <div className="lg:col-span-7 space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32]">
              Retorno de Inversión Inmediato
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl leading-tight">
              Con un solo Late Check-out al mes, Turnexo te sale gratis.
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

          <div id="precios" className="lg:col-span-5 bg-[#FAF9F5] text-[#141413] p-8 space-y-6">
            <div className="border-b border-[#E2DDD2] pb-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#57554F]">
                INGRESO EXTRA ESTIMADO (2 VENTAS/MES POR PISO)
              </span>
              <p className="font-mono text-5xl font-bold text-[#1F4E3D] mt-2">
                +{monthlyGain} €<span className="text-base font-normal text-[#57554F]">/mes</span>
              </p>
              <p className="text-xs text-[#57554F] mt-1">
                +{monthlyGain * 12} € anuales íntegros para ti.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E2DDD2]">
                <span className="font-semibold">Módulo Suelto (Solo Guía o Solo Limpiezas)</span>
                <span className="font-mono font-bold">9 € / piso / mes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2DDD2]">
                <span className="font-semibold text-[#C85A32]">
                  Pack Completo (Guía + Limpiezas Conectadas)
                </span>
                <span className="font-mono font-bold text-[#C85A32]">14 € / piso / mes</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-semibold">Periodo de Prueba</span>
                <span className="font-mono font-bold text-[#1F4E3D]">14 Días Gratis</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToApp}
              className="w-full bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-mono uppercase tracking-wider font-bold py-4 transition"
            >
              Entrar al Panel de Gestión (/app) →
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN FAQ PARA SEO Y RESOLUCIÓN DE OBJECIONES */}
      <section id="faq" className="max-w-7xl mx-auto px-6 py-20 border-t border-[#E2DDD2]">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141413]">
              Todo lo que necesitas saber antes de empezar.
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-2">
              <h3 className="font-bold text-base text-[#141413]">
                ¿Cómo se conecta con mis anuncios de Airbnb y Booking?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                Sin contraseñas de tus cuentas. Solo copias el enlace público de exportación iCal (.ics) que te da Airbnb o Booking en la sección de calendarios y lo pegas en Turnexo. En 30 segundos todas tus reservas pasadas y futuras quedan sincronizadas automáticamente.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-2">
              <h3 className="font-bold text-base text-[#141413]">
                ¿Mis limpiadoras necesitan descargarse una app de la App Store o crearse cuenta?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                No. Cada limpiadora recibe su enlace mágico único (por ejemplo <code>/c/maria-7f9a</code>) por WhatsApp. Al abrirlo en el navegador de su teléfono ven su parte de trabajo del día, horas de check-in urgente, checklist en español y botón para tomar fotos de auditoría.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-2">
              <h3 className="font-bold text-base text-[#141413]">
                ¿Cómo funciona la venta de Late Check-out y cobro de extras?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                Turnexo detecta mediante el calendario iCal si el día de salida del huésped entra otra reserva o queda libre. Si queda libre, ofrece el Late Check-out hasta la tarde. Tú cobras el 100% del dinero directamente al huésped (por el centro de resoluciones de Airbnb, Bizum o tarjeta) sin que Turnexo te cobre ninguna comisión.
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-2">
              <h3 className="font-bold text-base text-[#141413]">
                ¿Puedo contratar solo la Guía Digital o solo la Operativa de Limpiezas?
              </h3>
              <p className="text-xs text-[#57554F] leading-relaxed">
                Sí. Los módulos son totalmente independientes. Si ya tienes resuelta la limpieza y solo quieres la Guía Digital con vídeos para huéspedes y venta de extras, contratas el Módulo 2 (9€/mes). Si solo necesitas el cuadrante de limpiezas por iCal, el Módulo 1 (9€/mes). O ambos conectados por 14€/mes.
              </p>
            </div>
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
            <button type="button" onClick={onNavigateToApp} className="text-[#C85A32] font-bold hover:underline">
              Panel /app
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
