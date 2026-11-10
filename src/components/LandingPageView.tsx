import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Clock,
  Users,
  Video,
  ShieldCheck,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  ChevronDown,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';
import HeroPhoneMockup from './HeroPhoneMockup';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado del acordeón de FAQ
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413]">
      {/* NAVBAR SAAS DIRECTA Y LIMPIA (SIN DROPDOWNS QUE TAPEN EL HERO) */}
      <header className="sticky top-0 z-50 bg-[#F6F4EE]/95 backdrop-blur-md border-b border-[#E2DDD2]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* Columna 1: Identidad de Marca */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group">
            <div className="w-8 h-8 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-extrabold text-xs tracking-tighter group-hover:bg-[#C85A32] transition-colors">
              TX
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#141413]">
              Turnexo<span className="text-[#C85A32]">.</span>
            </span>
          </a>

          {/* Columna 2: Navegación Directa a las 4 secciones de la página */}
          <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-[#57554F] whitespace-nowrap">
            <a
              href="#modulos"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              Qué incluye
            </a>

            <a
              href="#comparativa"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              Comparativa
            </a>

            <a
              href="#precios"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              Precios
            </a>

            <a
              href="#faq"
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              FAQ
            </a>
          </nav>

          {/* Columna 3: Acceso Clientes + CTA Principal */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="hidden sm:inline-flex items-center text-sm font-semibold text-[#141413] hover:text-[#C85A32] px-3 py-2 transition whitespace-nowrap"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={onNavigateToApp}
              className="bg-[#C85A32] hover:bg-[#B04A25] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 transition flex items-center gap-2 shadow-xs whitespace-nowrap"
            >
              <span>Probar 1 Alojamiento Gratis</span>
              <ArrowUpRight size={15} className="shrink-0" />
            </button>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 border border-[#141413] bg-white text-[#141413]"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X size={18} /> : <Layers size={18} />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF9F5] border-t-2 border-[#141413] px-6 py-6 space-y-4 shadow-2xl">
            <div className="grid grid-cols-2 gap-3 text-sm font-bold text-[#141413]">
              <a
                href="#modulos"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                Qué incluye
              </a>
              <a
                href="#comparativa"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                Comparativa
              </a>
              <a
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                Precios (1 Gratis)
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border border-[#D5CFC0]"
              >
                FAQ
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToApp();
              }}
              className="w-full bg-[#141413] text-white font-sans text-xs font-bold uppercase py-3.5"
            >
              Iniciar sesión / Crear cuenta gratis →
            </button>
          </div>
        )}
      </header>

      {/* SECCIÓN 1: HERO EDITORIAL + MAQUETA INTERACTIVA DE 3 PESTAÑAS */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-20 border-b border-[#E2DDD2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-7 pt-2">
            <div className="inline-flex items-center gap-2.5 border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-emerald-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>LISTO PARA EL NUEVO MARCO FISCAL: FACTURAS SIMPLIFICADAS Y MODELO 303</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#141413]">
              El día a día de tus alojamientos.{' '}
              <span className="text-[#C85A32] block sm:inline">
                Sin llamadas, sin WhatsApps y sin líos con el IVA.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#57554F] leading-relaxed max-w-2xl font-normal">
              Conecta el calendario de tus anuncios en 30 segundos. Turnexo se encarga de coordinar a tu equipo de limpieza, resolver las dudas de tus viajeros y preparar los libros contables para tu gestoría.
            </p>

            {/* 3 puntos con check (valor operativo) */}
            <ul className="space-y-3 max-w-2xl text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Cuadrante de limpieza sin grupos de WhatsApp:</strong> Tu limpiadora entra con un enlace móvil sin contraseñas, marca las tareas y sube fotos del piso antes de cada check-in.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Guía digital interactiva para el huésped:</strong> Clave WiFi en un toque, vídeos cortos de electrodomésticos para evitar llamadas a deshoras y venta directa de late check-out.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Facturación e IVA del 10% en un solo clic:</strong> Convierte tus reservas de Airbnb y Booking en facturas oficiales y exporta el libro trimestral en Excel listo para el Modelo 303.
                </span>
              </li>
            </ul>

            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="bg-[#C85A32] hover:bg-[#B04A25] text-white text-sm sm:text-base font-bold px-7 py-4 transition flex items-center gap-2 shadow-md group"
                >
                  <span>Probar 1 Alojamiento Gratis →</span>
                </button>
              </div>

              <p className="text-xs font-mono text-[#57554F] flex items-center gap-1.5 pt-1">
                <span className="text-[#1F4E3D] font-bold">✓</span>
                <span>Plan Gratuito para 1 alojamiento · Sin tarjeta de crédito ni permanencia</span>
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
                <p className="text-xs text-[#57554F] mt-0.5">Guías interactivas para el viajero</p>
              </div>
            </div>
          </div>

          {/* Mockup Realista de Smartphone Interactivo (Vista Limpiadora / Vista Huésped) */}
          <div className="lg:col-span-5">
            <HeroPhoneMockup
              onOpenCleanerDemo={onOpenCleanerDemo}
              onOpenGuestDemo={onOpenGuestDemo}
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: LOS 3 MOTORES (PROBLEMA QUE RESUELVE + BENEFICIOS REALES EN UN SOLO LUGAR) */}
      <section id="modulos" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-3xl space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            QUÉ HACE TURNEXO POR TI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] leading-tight tracking-tight">
            Las 3 tareas que más tiempo te quitan cada semana, automatizadas en una sola plataforma.
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            Sin curva de aprendizaje ni instalaciones para tus huéspedes o tu limpiadora. Todo funciona con enlaces web directos desde el primer minuto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MOTOR 1: EXPERIENCIA DEL HUÉSPED */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold whitespace-nowrap">
                  01 · EXPERIENCIA DEL HUÉSPED
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2.5 py-0.5 whitespace-nowrap">
                  Sin apps ni descargas
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  Todo tu alojamiento explicado en vídeo antes de que el huésped llegue a la puerta<span className="-ml-[0.03em]">.</span>
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  Le mandas un enlace por WhatsApp o por el chat de Airbnb en cuanto confirma la reserva. Desde su móvil resuelve el check-in, consulta cómo funcionan los aparatos de la casa y contrata extras sin llamarte.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Video size={14} className="text-[#C85A32]" />
                    Vídeo Home Tour
                  </p>
                  <p className="text-[#57554F]">
                    Un recorrido visual por las estancias para que conozca el alojamiento por dentro antes de viajar.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    Llegada y llaves paso a paso
                  </p>
                  <p className="text-[#57554F]">
                    Vídeo desde la calle hasta el portal y código de apertura del cajetín o cerradura digital.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C85A32]" />
                    Manual en vídeo de equipamiento
                  </p>
                  <p className="text-[#57554F]">
                    Clips de 15 segundos para aire acondicionado, placa, calefacción o cafetera que evitan llamadas nocturnas.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#1F4E3D]" />
                    Ingresos extra por Late Check-out
                  </p>
                  <p className="text-[#57554F]">
                    Si el calendario está libre esa tarde, permite contratar la salida a las 17:00h (+35 € íntegros para ti).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenGuestDemo}
                className="text-xs sm:text-sm font-sans font-bold text-[#C85A32] hover:text-[#B04A25] inline-flex items-center gap-1.5 group"
              >
                <span>Ver ejemplo real de Guía del Huésped</span>
                <ArrowUpRight
                  size={15}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* MOTOR 2: OPERATIVA DE LIMPIEZA */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-7">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#1F4E3D] font-bold whitespace-nowrap">
                  02 · OPERATIVA DE LIMPIEZA
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2.5 py-0.5 whitespace-nowrap">
                  Acceso móvil sin contraseñas
                </span>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  Tus limpiadoras saben qué día hay salida sin que tengas que escribirles por WhatsApp<span className="-ml-[0.03em]">.</span>
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  Cada cambio en tu calendario de Airbnb o Booking actualiza automáticamente la agenda móvil de tu equipo. Saben qué alojamiento toca hoy, a qué hora entra el siguiente viajero y qué tareas deben marcar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Users size={14} className="text-[#1F4E3D]" />
                    Agenda conectada por iCal
                  </p>
                  <p className="text-[#57554F]">
                    Las nuevas reservas, modificaciones o cancelaciones se reflejan en su teléfono al instante.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    Checklist por habitación
                  </p>
                  <p className="text-[#57554F]">
                    Puntos de control claros para dormitorio, baño, cocina y reposición de básicos en cada salida.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1F4E3D]" />
                    Fotos de comprobación
                  </p>
                  <p className="text-[#57554F]">
                    Recibe las fotos del alojamiento recién limpio en tu panel antes de que entre el siguiente huésped.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Flame size={14} className="text-[#C85A32]" />
                    Aviso de rotación en el día
                  </p>
                  <p className="text-[#57554F]">
                    Marca como prioritarias las salidas de las 11:00h que tienen nueva entrada esa misma tarde.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenCleanerDemo}
                className="text-xs sm:text-sm font-sans font-bold text-[#1F4E3D] hover:text-[#16382B] inline-flex items-center gap-1.5 group"
              >
                <span>Ver ejemplo real del enlace de Limpiadora</span>
                <ArrowUpRight
                  size={15}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>

        {/* MOTOR 3: FACTURACIÓN Y GESTORÍA */}
        <div className="mt-8 bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-800 font-bold whitespace-nowrap">
                03 · FACTURACIÓN Y GESTORÍA
              </span>
              <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 whitespace-nowrap">
                IVA 10% · Modelo 303
              </span>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                De reservas de Airbnb y Booking a facturas oficiales listas para tu gestor en un clic<span className="-ml-[0.03em]">.</span>
              </h3>
              <p className="text-sm text-[#57554F] leading-relaxed">
                Olvídate de pasar tardes enteras al final del trimestre picando estancias a mano en una hoja de cálculo. Turnexo desglosa la base imponible y el 10% de IVA de cada reserva automáticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Facturas simplificadas y completas</p>
                <p className="text-[#57554F]">Numeración correlativa oficial con desglose de IVA al 10% y descarga en PDF.</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Exportación trimestral en Excel</p>
                <p className="text-[#57554F]">Libro Registro estructurado para que tu asesoría liquide el Modelo 303 en minutos.</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Soporte Multi-NIF</p>
                <p className="text-[#57554F]">Configura distintos titulares y series si gestionas alojamientos de varios propietarios.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#141413] text-[#F6F4EE] p-6 border border-[#2C2C29] space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3 font-mono">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                RESUMEN TRIMESTRAL · LIBRO IVA
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                MODELO 303 LISTO
              </span>
            </div>

            <div className="space-y-2 bg-white/5 p-3.5 border border-white/10 font-mono text-xs">
              <div className="flex justify-between text-white/70">
                <span>Facturas emitidas (Airbnb + Booking):</span>
                <span className="font-bold text-white">28 facturas</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Base imponible acumulada:</span>
                <span className="font-bold text-white">11.420,00 €</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold border-t border-white/10 pt-2">
                <span>IVA repercutido al 10% (Casilla 07):</span>
                <span>1.142,00 €</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToApp}
              className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans font-semibold text-sm py-3.5 px-5 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FileSpreadsheet size={16} />
              <span>Probar Facturación e IVA en el Panel →</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: COMPARATIVA DIRECTA (WHATSAPP/EXCEL VS SOFTWARE TRADICIONAL VS TURNEXO) */}
      <section id="comparativa" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            COMPARATIVA DIRECTA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141413] leading-tight tracking-tight">
            ¿Por qué los anfitriones cambian el grupo de WhatsApp y el Excel por Turnexo?
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            Todo lo que antes hacías a mano entre llamadas, PDFs y hojas de cálculo, centralizado en piloto automático.
          </p>
        </div>

        <div className="bg-[#FAF9F5] border border-[#D5CFC0] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC0] bg-[#E8E4D9]/60 font-mono text-[11px] uppercase tracking-wider text-[#57554F]">
                <th className="py-4 px-5">Necesidad diaria</th>
                <th className="py-4 px-5 text-[#57554F]">Excel + Grupos WhatsApp</th>
                <th className="py-4 px-5 text-[#57554F]">PMS Tradicional Complejo</th>
                <th className="py-4 px-5 bg-[#141413] text-[#F6F4EE] font-bold">Turnexo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD2]">
              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Comunicación con tu limpiadora
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Audios y mensajes constantes cada vez que entra o cambia una reserva
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Obliga a la limpiadora a crear cuenta y bajar una app compleja
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ 0 WhatsApps: enlace móvil directo sin contraseñas sincronizado por iCal
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Comprobar que el alojamiento está limpio
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  A ciegas (te enteras cuando el nuevo huésped llega y se queja)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Solo marca "limpio" sin pruebas visuales por habitación
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Checklist por estancia y fotos reales que revisas desde tu móvil
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Bienvenida, Check-in y Electrodomésticos
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  PDFs largos que nadie lee y llamadas a las 23:30h desde la calle
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Formularios pesados sin Vídeo Home Tour ni vídeo-guías
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Mini-Web enviada por link antes de llegar con vídeos de todo el alojamiento
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Venta de Late Check-out (+35 €)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  0 € (se regala por compromiso si el huésped pregunta)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  No cruza la disponibilidad con el horario de la limpiadora
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Lo ofrece solo si la tarde está libre y avisa a la limpiadora automáticamente
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Facturas IVA 10% y Modelo 303 Gestoría
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Facturas a mano en Word/Excel al final de cada trimestre
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Módulos contables caros pensados para grandes hoteles
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Facturas con IVA 10% en 1 clic y descarga de Libro Excel para tu gestor
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Coste mensual
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  "Gratis" (a cambio de perder horas cada semana)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  30 € a 80 € / mes cobrando comisión por cada alojamiento
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#C85A32]">
                  1 alojamiento Gratis · Hasta 5 alojamientos: 19 €/mes (tarifa plana total)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 4: PRECIOS CLAROS + GARANTÍAS DE RIESGO CERO INTEGRADAS */}
      <section id="precios" className="max-w-7xl mx-auto px-6 py-24 border-b border-[#E2DDD2]">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-semibold">
            PRECIOS · TARIFA PLANA, NO POR ALOJAMIENTO
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
              note: '/ mes',
              summary:
                'Plan gratuito para 1 alojamiento. Enlace móvil de limpiadora, Mini-Web del alojamiento para enviar por link al huésped y retención de fotos a 7 días.',
              highlight: false,
              cta: 'Empezar gratis (Sin tarjeta)',
              features: [
                'Cleaning App con checklist por estancia y fotos',
                'Mini-Web del alojamiento (Guest App) con Vídeo Home Tour y vídeos',
                'Venta automática de Late Check-out (+35 €)',
                'Sincronización iCal con Airbnb y Booking',
                'Fotos de auditoría guardadas 7 días',
                'Sello discreto "Creado con Turnexo" en la Mini-Web',
              ],
            },
            {
              name: 'Pro Fiscal',
              units: 'Hasta 5 alojamientos',
              price: '19 €',
              note: '/ mes (tarifa plana)',
              summary:
                'Todo el control operativo + facturación con IVA del 10% y exportación trimestral en 1 clic para tu gestoría.',
              highlight: true,
              cta: 'Activar Plan Pro Fiscal',
              features: [
                'Todo lo incluido en Starter para hasta 5 alojamientos',
                'Facturas simplificadas y completas con IVA 10% en 1 clic',
                'Libro de IVA trimestral en Excel listo para Modelo 303',
                'Historial fotográfico ilimitado ante reclamaciones',
                'Mini-Web del alojamiento 100% marca blanca (sin sello Turnexo)',
              ],
            },
            {
              name: 'Microgestora',
              units: 'Hasta 10 alojamientos',
              price: '39 €',
              note: '/ mes (tarifa plana)',
              summary:
                'Para gestores con varias limpiadoras y rotación frecuente que necesitan control de pagos y auditoría multi-equipo.',
              highlight: false,
              cta: 'Activar Plan Microgestora',
              features: [
                'Todo lo incluido en Pro Fiscal para hasta 10 alojamientos',
                'Múltiples limpiadoras con asignación por alojamiento',
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
                <div className="flex items-baseline gap-2 flex-wrap font-sans">
                  <span className="text-5xl font-extrabold tracking-tight whitespace-nowrap">{plan.price}</span>
                  <span className={`text-sm font-medium whitespace-nowrap ${plan.highlight ? 'text-white/70' : 'text-[#57554F]'}`}>
                    {plan.note}
                  </span>
                </div>
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
                className={`w-full font-sans font-semibold text-sm py-3.5 transition flex items-center justify-center gap-2 ${
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

        {/* Tira de Garantías integrada directamente bajo Precios (sin crear otra sección extra) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-10 border-t border-[#E2DDD2]">
          {[
            {
              icon: ShieldCheck,
              title: 'Sin dar contraseñas de Airbnb',
              desc: 'Solo pegas el enlace público iCal (.ics). Tus cuentas no se tocan.',
            },
            {
              icon: Check,
              title: 'Sin tarjeta de crédito',
              desc: 'El plan de 1 alojamiento es gratuito sin límite de tiempo.',
            },
            {
              icon: Clock,
              title: 'Listo en 5 minutos',
              desc: 'Pegas el iCal, subes tus vídeos y compartes los links al instante.',
            },
            {
              icon: FileSpreadsheet,
              title: 'Sin permanencia',
              desc: 'Exporta tus facturas y datos en Excel/CSV cuando quieras.',
            },
          ].map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-[#1F4E3D] shrink-0" />
                  <h3 className="font-bold text-xs text-[#141413]">{g.title}</h3>
                </div>
                <p className="text-[11px] text-[#57554F] leading-relaxed">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN 5: FAQ + CIERRE FINAL */}
      <section id="faq" className="max-w-7xl mx-auto px-6 py-20">
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
                a: 'Sin contraseñas de tus cuentas. Solo copias el enlace público de exportación iCal (.ics) que te da Airbnb o Booking en la sección de calendarios y lo pegas en Turnexo. En 30 segundos todas tus reservas quedan sincronizadas automáticamente.',
              },
              {
                q: '¿Mis limpiadoras necesitan descargarse una app de la App Store o crearse cuenta?',
                a: 'No. Cada limpiadora recibe un enlace seguro y directo por WhatsApp. Al abrirlo en el navegador de su teléfono ve su parte de trabajo del día, horas de check-in urgente, checklist en español y botón para tomar fotos de auditoría sin necesidad de usuario ni contraseña.',
              },
              {
                q: '¿Cómo recibe el huésped la Mini-Web del alojamiento con el Vídeo Home Tour, el check-in y las vídeo-guías?',
                a: 'No hace falta ni esperar a que escaneen un QR en el salón: puedes enviarle el link directo de la Mini-Web del alojamiento por WhatsApp o en el mensaje de bienvenida de Airbnb antes de que llegue. Así ve cómo es el alojamiento en vídeo por el camino, sigue el vídeo de check-in paso a paso cuando está en la entrada y consulta cómo usar la vitrocerámica o el aire acondicionado sin llamarte a deshoras.',
              },
              {
                q: '¿Cómo compruebo que la limpiadora ha terminado y que el alojamiento está limpio?',
                a: 'Tu personal de limpieza accede con su enlace móvil directo. Sigue el checklist de tareas de cada estancia y toma fotos obligatorias con la cámara de su móvil al terminar. Las fotos se sincronizan al instante en tu panel de anfitrión para que verifiques desde tu sofá que todo está impecable antes del siguiente check-in.',
              },
              {
                q: '¿Cómo funcionan las facturas con IVA del 10% para mi gestoría?',
                a: 'Desde cada reserva generas la factura simplificada o completa con el 10% de IVA desglosado en 1 clic. Al acabar el trimestre, descargas el Libro de IVA en Excel para enviárselo a tu gestoría y que presenten el Modelo 303 sin que tengas que hacer facturas a mano.',
              },
              {
                q: '¿Tengo permanencia o tengo que poner mi tarjeta de crédito para probar?',
                a: 'Cero permanencia y cero tarjetas para empezar. El plan Starter para 1 alojamiento es gratuito, y puedes subir o bajar de plan con un solo clic desde tu panel.',
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

      {/* SECCIÓN FINAL DE CIERRE DE CONVERSIÓN (BOTTOM CTA BANNER) */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#141413] text-[#F6F4EE] border-2 border-[#141413] p-8 sm:p-14 shadow-[10px_10px_0px_#C85A32] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              EMPIEZA EN MENOS DE 5 MINUTOS · SIN TARJETA
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Pon tu primer alojamiento en piloto automático hoy mismo. Gratis.
            </h2>
            <p className="text-sm text-white/75 leading-relaxed">
              Conecta tu enlace iCal de Airbnb o Booking, comparte el enlace móvil con tu limpiadora y envía la Mini-Web en vídeo a tu próximo huésped antes de que aterrice.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={onNavigateToApp}
              className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans text-sm sm:text-base font-bold px-7 py-4 transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Probar 1 Alojamiento Gratis →</span>
            </button>
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
