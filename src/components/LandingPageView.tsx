import { useState, FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
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
  Mail,
} from 'lucide-react';
import HeroPhoneMockup from './HeroPhoneMockup';

interface Props {
  onNavigateToApp: (
    mode?: 'login' | 'register',
    plan?: 'plan_starter' | 'plan_pro' | 'plan_manager'
  ) => void;
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

  // Estado del Modal de Contacto integrado
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactUnits, setContactUnits] = useState('Más de 10 alojamientos');
  const [contactName, setContactName] = useState('');
  const [contactChannel, setContactChannel] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const openContactModal = (defaultUnits = '1 a 5 alojamientos') => {
    setContactUnits(defaultUnits);
    setContactSubmitted(false);
    setContactModalOpen(true);
  };

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem('turnexo_contact_leads_v1') || '[]');
      existing.unshift({
        id: `lead-${Date.now()}`,
        name: contactName.trim(),
        contact: contactChannel.trim(),
        units: contactUnits,
        message: contactMessage.trim(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('turnexo_contact_leads_v1', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setContactSubmitted(true);
  };

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

            <button
              type="button"
              onClick={() => openContactModal('Cabecera')}
              className="px-3.5 py-2 hover:text-[#141413] hover:bg-[#E8E4D9]/80 transition whitespace-nowrap"
            >
              Contacto
            </button>
          </nav>

          {/* Columna 3: Acceso Clientes + CTA Principal */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => onNavigateToApp('login')}
              className="hidden sm:inline-flex items-center text-sm font-semibold text-[#141413] hover:text-[#C85A32] px-3 py-2 transition whitespace-nowrap"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => onNavigateToApp('register')}
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
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openContactModal('Menú móvil');
                }}
                className="p-3 bg-[#E8E4D9] text-[#141413] border border-[#D5CFC0] text-left"
              >
                Contacto
              </button>
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
                  <strong>Cuadrante de limpieza sin grupos de WhatsApp:</strong> Tu limpiadora entra con un enlace móvil sin contraseñas, marca las tareas y sube fotos del alojamiento antes de cada check-in.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Guía digital interactiva para el huésped:</strong> Clave WiFi en un toque, vídeos cortos de electrodomésticos para evitar llamadas a deshoras y venta de extras (early check-in, late check-out, cunas o parking).
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
                  onClick={() => onNavigateToApp('register')}
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
                    Venta de Extras Personalizados
                  </p>
                  <p className="text-[#57554F]">
                    Ofrece Early Check-in, Late Check-out (si el iCal está libre), cuna de bebé, parking o mascotas. Cobras el 100% sin comisiones.
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
                  Tu equipo recibe las limpiezas automáticamente y tú compruebas con fotos que todo está listo<span className="-ml-[0.03em]">.</span>
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  Cada cambio en tu calendario de Airbnb o Booking actualiza al instante el enlace móvil de tu limpiadora. Ve qué alojamiento toca hoy, si hay entrada esa misma tarde y sube fotos al terminar.
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
                <span>Ver ejemplo real de la App de Limpiadora</span>
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
                Olvídate de perder tardes enteras al final del trimestre haciendo facturas una por una en Word o Excel. Turnexo calcula la base imponible y el 10% de IVA de cada reserva automáticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Facturas simplificadas y con NIF</p>
                <p className="text-[#57554F]">Numeración correlativa oficial con desglose de IVA al 10% y descarga en PDF.</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Exportación trimestral en Excel</p>
                <p className="text-[#57554F]">Libro Registro estructurado para que tu gestoría liquide el Modelo 303 en minutos.</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Varios propietarios (Multi-NIF)</p>
                <p className="text-[#57554F]">Configura distintos titulares y series si gestionas alojamientos de varios dueños.</p>
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

            <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono text-[11px]">
              <div className="bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2 text-white/90">
                <FileSpreadsheet size={15} className="text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-white truncate">Libro_IVA_3T.xlsx</p>
                  <p className="text-[10px] text-white/55 truncate">Excel para gestoría</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2 text-white/90">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-white truncate">28 Facturas PDF</p>
                  <p className="text-[10px] text-white/55 truncate">Serie F2026 correlativa</p>
                </div>
              </div>
            </div>
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
            Por qué los anfitriones dejan atrás el caos de WhatsApp y los programas caros<span className="-ml-[0.03em]">.</span>
          </h2>
          <p className="text-sm text-[#57554F] leading-relaxed">
            Ni perder horas cada semana coordinando todo a mano, ni pagar cuotas por alojamiento en herramientas pensadas para grandes hoteles.
          </p>
        </div>

        <div className="bg-[#FAF9F5] border border-[#D5CFC0] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5CFC0] bg-[#E8E4D9]/60 font-mono text-[11px] uppercase tracking-wider text-[#57554F]">
                <th className="py-4 px-5">Tarea del día a día</th>
                <th className="py-4 px-5 text-[#57554F]">A mano (WhatsApp y Excel)</th>
                <th className="py-4 px-5 text-[#57554F]">Software / PMS tradicional</th>
                <th className="py-4 px-5 bg-[#141413] text-[#F6F4EE] font-bold">Con Turnexo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD2]">
              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Coordinación de limpiezas
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Mensajes y capturas del calendario cada vez que entra o cambia una reserva
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Obliga a tu equipo a instalar apps, recordar claves y usar menús complejos
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Limpiezas actualizadas al instante en un enlace móvil sin contraseñas
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Revisión del alojamiento
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  A ciegas: te enteras de un olvido cuando llega el siguiente huésped
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Solo permite marcar «limpio», sin checklist visual por estancia
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Checklist por habitación y fotos de comprobación antes del check-in
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Llegada y dudas del huésped
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  PDFs que nadie lee y llamadas a deshoras por las llaves o la calefacción
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Formularios pesados sin vídeos del acceso ni del equipamiento
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Guía Digital en vídeo enviada por enlace antes de que el viajero salga de casa
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Venta de extras (Early/Late, cunas, parking)
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Se regalan por compromiso o se negocian uno por uno por WhatsApp
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Comisiones por venta o sin avisar automáticamente a la limpiadora
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Catálogo propio (Early/Late según calendario, cunas, parking) 100% íntegro para ti
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Facturas al 10% de IVA y gestoría
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Tardes enteras al final del trimestre pasando reservas a Word o Excel
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Módulos de contabilidad aparte con sobrecoste mensual
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#1F4E3D]">
                  ✓ Facturas oficiales en un clic y Libro Registro en Excel listo para el Modelo 303
                </td>
              </tr>

              <tr className="hover:bg-white transition">
                <td className="py-4 px-5 font-bold text-[#141413]">
                  Precio mensual
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  0 €, a cambio de tu tiempo libre y estar pendiente del teléfono
                </td>
                <td className="py-4 px-5 text-[#57554F]">
                  Cuota base más recargo o comisión por cada alojamiento añadido
                </td>
                <td className="py-4 px-5 bg-[#141413]/5 font-bold text-[#C85A32]">
                  Plan gratuito (1 alojamiento) · Hasta 5 alojamientos por 19 €/mes (tarifa plana)
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
            Empieza gratis. Paga solo cuando crezcas<span className="-ml-[0.03em]">.</span>
          </h2>
          <p className="text-sm text-[#57554F]">
            Con un solo extra vendido al mes (Early Check-in, Late Check-out o parking) la suscripción se paga sola.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {[
            {
              planKey: 'plan_starter' as const,
              name: 'Starter',
              units: '1 alojamiento',
              price: '0 €',
              note: '/ mes',
              summary:
                'Plan gratuito para probar Turnexo con 1 alojamiento real. Incluye la App de Limpiadora y la Guía Digital para tus viajeros.',
              highlight: false,
              cta: 'Empezar gratis (Sin tarjeta)',
              features: [
                'App de Limpiadora con checklist por habitación y fotos',
                'Guía Digital del Huésped con vídeos del alojamiento y check-in',
                'Catálogo de extras a tu medida (Early/Late Check-out, cuna, parking...)',
                'Sincronización iCal automática con Airbnb y Booking',
                'Fotos de comprobación guardadas 7 días',
                'Sello discreto "Creado con Turnexo" en la Guía',
              ],
            },
            {
              planKey: 'plan_pro' as const,
              name: 'Pro Fiscal',
              units: 'Hasta 5 alojamientos',
              price: '19 €',
              note: '/ mes (tarifa plana)',
              summary:
                'Todo el control operativo más facturación oficial al 10% de IVA y exportación trimestral en 1 clic para tu gestoría.',
              highlight: true,
              cta: 'Activar Plan Pro Fiscal',
              features: [
                'Todo lo incluido en Starter para hasta 5 alojamientos',
                'Facturas simplificadas y con NIF al 10% de IVA en 1 clic',
                'Libro Registro trimestral en Excel listo para el Modelo 303',
                'Soporte para varios propietarios (Multi-NIF)',
                'Historial fotográfico ilimitado ante reclamaciones',
                'Guía Digital 100% marca blanca (sin sello de Turnexo)',
              ],
            },
            {
              planKey: 'plan_manager' as const,
              name: 'Microgestora',
              units: 'Hasta 10 alojamientos',
              price: '39 €',
              note: '/ mes (tarifa plana)',
              summary:
                'Para gestores con varias limpiadoras y múltiples propietarios que necesitan coordinar todas las salidas sin líos.',
              highlight: false,
              cta: 'Activar Plan Microgestora',
              features: [
                'Todo lo incluido en Pro Fiscal para hasta 10 alojamientos',
                'Múltiples limpiadoras con asignación por alojamiento',
                'Control y resumen mensual de limpiezas por persona',
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
                onClick={() => onNavigateToApp('register', plan.planKey)}
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

        {/* Bloque horizontal para Gestoras de +10 alojamientos */}
        <div className="mt-8 bg-[#FAF9F5] border border-[#D5CFC0] p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                CARTERAS DE +10 ALOJAMIENTOS
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-[#141413]">
                ¿Gestionas más de 10 alojamientos?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#57554F]">
              Contamos con planes de tarifa plana para gestoras de 15, 30 o más alojamientos e importación inicial asistida sin coste.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openContactModal('Más de 10 alojamientos')}
            className="shrink-0 font-sans text-xs sm:text-sm font-bold text-[#141413] hover:text-[#C85A32] border border-[#141413] hover:border-[#C85A32] bg-white px-5 py-3 transition inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Consultar tarifa a medida</span>
            <ArrowUpRight size={15} />
          </button>
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
              Todo lo que necesitas saber antes de empezar<span className="-ml-[0.03em]">.</span>
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: '¿Cómo se conecta con mis anuncios de Airbnb y Booking?',
                a: 'Sin dar las contraseñas de tus cuentas. Solo copias el enlace de calendario iCal (.ics) que te dan Airbnb, Booking o Vrbo y lo pegas en Turnexo. En 30 segundos todas tus reservas y cambios quedan sincronizados automáticamente.',
              },
              {
                q: '¿Mis limpiadoras necesitan descargarse una app o crearse cuenta?',
                a: 'No. Cada limpiadora recibe un enlace privado y directo por WhatsApp. Al abrirlo en el navegador de su móvil ve qué alojamientos tienen salida hoy, si entra otro huésped esa misma tarde, marca el checklist por habitación y sube fotos con su cámara al terminar para que compruebes que todo está listo.',
              },
              {
                q: '¿Cómo recibe el huésped la Guía Digital del alojamiento? ¿Tiene que descargar algo?',
                a: 'Funciona directamente en el navegador de su móvil sin instalar nada. Le envías el enlace por WhatsApp o por el chat de Airbnb cuando confirma la reserva: así ve el alojamiento en vídeo antes de viajar, sigue el check-in paso a paso al llegar a la puerta y consulta vídeos cortos de la placa, calefacción o cafetera sin llamarte a deshoras.',
              },
              {
                q: '¿Cómo funciona la venta de extras (Early Check-in, Late Check-out, cuna o parking)?',
                a: 'Tú configuras qué extras ofrecer en cada alojamiento y el precio de cada uno. Para las entradas antes de hora o salidas tarde, Turnexo revisa tu calendario iCal y solo las ofrece si ese día está libre. Cuando apruebas un extra, el horario de tu limpiadora se actualiza solo y tú cobras el 100% del importe sin comisiones.',
              },
              {
                q: '¿Cómo funcionan las facturas con el 10% de IVA para mi gestoría?',
                a: 'Desde cada reserva generas la factura simplificada o con NIF con el 10% de IVA desglosado en un clic. Si gestionas alojamientos de varios propietarios, puedes configurar distintos titulares y series (Multi-NIF). Al acabar el trimestre, descargas el Libro Registro en Excel listo para que tu gestoría presente el Modelo 303 en minutos.',
              },
              {
                q: '¿Tengo permanencia o tengo que poner mi tarjeta de crédito para probar?',
                a: 'Cero permanencia y sin tarjeta de crédito para empezar. El plan Starter para 1 alojamiento es gratuito, y puedes cambiar de plan o cancelar en cualquier momento con un clic desde tu panel.',
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
              Pon tu primer alojamiento en piloto automático hoy mismo<span className="-ml-[0.03em]">.</span> Gratis<span className="-ml-[0.03em]">.</span>
            </h2>
            <p className="text-sm text-white/75 leading-relaxed">
              Conecta tu calendario iCal de Airbnb o Booking, comparte el enlace móvil con tu limpiadora y envía la Guía Digital en vídeo a tu próximo huésped antes de que viaje.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToApp('register')}
              className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans text-sm sm:text-base font-bold px-7 py-4 transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Probar 1 Alojamiento Gratis →</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER CORPORATIVO ESTRUCTURADO Y MODAL DE CONTACTO */}
      <footer className="border-t border-[#D5CFC0] bg-[#141413] text-[#F6F4EE] pt-14 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Columna 1: Marca + Contacto directo */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#C85A32] text-white flex items-center justify-center font-mono font-extrabold text-xs">
                TX
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Turnexo<span className="text-[#C85A32]">.</span>
              </span>
            </div>
            <p className="text-xs text-white/65 leading-relaxed max-w-sm">
              Coordinación de limpiezas por iCal, Guía Digital del Huésped en vídeo y facturación oficial al 10% de IVA lista para el Modelo 303 de tu gestoría.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => openContactModal('1 a 5 alojamientos')}
                className="bg-white/10 hover:bg-[#C85A32] text-white px-3.5 py-2 transition inline-flex items-center gap-1.5 font-bold"
              >
                <Mail size={13} />
                <span>Escribir a soporte / Contacto</span>
              </button>
              <a
                href="mailto:info@turnexo.app"
                className="text-white/60 hover:text-white transition underline underline-offset-4"
              >
                info@turnexo.app
              </a>
            </div>
          </div>

          {/* Columna 2: Producto y Ejemplos */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/45 font-bold">
              Producto y Ejemplos Reales
            </p>
            <ul className="space-y-2.5 text-white/75">
              <li>
                <a href="#modulos" className="hover:text-white transition">
                  Qué incluye Turnexo
                </a>
              </li>
              <li>
                <a href="#comparativa" className="hover:text-white transition">
                  Comparativa con WhatsApp y PMS
                </a>
              </li>
              <li>
                <a href="#precios" className="hover:text-white transition">
                  Precios y Plan Gratuito (1 alojamiento)
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  Preguntas frecuentes (FAQ)
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenGuestDemo}
                  className="text-[#C85A32] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Ver ejemplo de Guía del Huésped</span>
                  <ArrowUpRight size={13} />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCleanerDemo}
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Ver ejemplo de App de Limpiadora</span>
                  <ArrowUpRight size={13} />
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Acceso y Legal */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/45 font-bold">
              Cuenta y Legal
            </p>
            <ul className="space-y-2.5 text-white/75">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToApp('login')}
                  className="hover:text-white transition font-semibold"
                >
                  Iniciar sesión en mi cuenta
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToApp('register')}
                  className="text-[#C85A32] hover:underline font-bold"
                >
                  Crear cuenta gratis (1 alojamiento) →
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openContactModal('1 a 5 alojamientos')}
                  className="hover:text-white transition"
                >
                  Contacto y atención a gestoras
                </button>
              </li>
              {onOpenLegal && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('privacy')}
                      className="hover:text-white transition"
                    >
                      Política de Privacidad
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('terms')}
                      className="hover:text-white transition"
                    >
                      Términos de Servicio
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('legal')}
                      className="hover:text-white transition"
                    >
                      Aviso Legal y Cookies
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/40">
          <p>© {new Date().getFullYear()} Turnexo. Todos los derechos reservados.</p>
          <p>Compatible con calendarios iCal de Airbnb, Booking y Vrbo.</p>
        </div>
      </footer>

      {/* MODAL DE CONTACTO INTEGRADO (SIN DEPENDER DE CLIENTE DE CORREO EXTERNO) */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF9F5] border-2 border-[#141413] max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-[10px_10px_0px_#C85A32]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2DDD2] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                  CONTACTO DIRECTO · TURNEXO
                </span>
                <h3 className="text-xl font-extrabold text-[#141413] mt-0.5">
                  ¿En qué podemos ayudarte?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 border border-[#D5CFC0] bg-white flex items-center justify-center text-[#141413] hover:bg-[#141413] hover:text-white transition"
                aria-label="Cerrar contacto"
              >
                <X size={15} />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="space-y-4 py-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                  <p className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-[#1F4E3D]" />
                    <span>¡Mensaje recibido correctamente!</span>
                  </p>
                  <p className="text-[#57554F] leading-relaxed">
                    Hemos registrado tu consulta para <strong>{contactUnits}</strong> y te responderemos en menos de 24 horas a <strong>{contactChannel}</strong>.
                  </p>
                </div>
                <p className="text-xs text-[#57554F]">
                  También puedes escribirnos directamente cuando quieras a{' '}
                  <a href="mailto:info@turnexo.app" className="font-mono font-bold text-[#141413] underline">
                    info@turnexo.app
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="w-full bg-[#141413] text-white font-sans font-bold text-xs uppercase tracking-wider py-3.5"
                >
                  Cerrar ventana
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                    TU NOMBRE
                  </label>
                  <input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ej. Laura Gómez"
                    className="w-full bg-white border border-[#D5CFC0] px-3.5 py-2.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                      TU EMAIL O WHATSAPP
                    </label>
                    <input
                      required
                      value={contactChannel}
                      onChange={(e) => setContactChannel(e.target.value)}
                      placeholder="tu@email.com o +34 600..."
                      className="w-full bg-white border border-[#D5CFC0] px-3.5 py-2.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                      ALOJAMIENTOS QUE GESTIONAS
                    </label>
                    <select
                      value={contactUnits}
                      onChange={(e) => setContactUnits(e.target.value)}
                      className="w-full bg-white border border-[#D5CFC0] px-3 py-2.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                    >
                      <option value="1 alojamiento">1 alojamiento</option>
                      <option value="2 a 5 alojamientos">2 a 5 alojamientos</option>
                      <option value="6 a 10 alojamientos">6 a 10 alojamientos</option>
                      <option value="Más de 10 alojamientos">Más de 10 alojamientos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                    ¿QUÉ NECESITAS?
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Cuéntanos cuántos alojamientos tienes o cualquier duda sobre limpiezas, guías o facturación..."
                    className="w-full bg-white border border-[#D5CFC0] p-3.5 text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans font-bold text-sm py-3.5 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Enviar consulta</span>
                  <ArrowRight size={15} />
                </button>

                <p className="text-[11px] text-[#57554F] text-center">
                  O escríbenos directamente a{' '}
                  <a href="mailto:info@turnexo.app" className="font-mono font-bold text-[#141413] underline">
                    info@turnexo.app
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
