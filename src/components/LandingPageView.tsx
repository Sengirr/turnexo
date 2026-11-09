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
  Smartphone,
  ExternalLink,
  ChevronDown,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';

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
  // Estado del menú SaaS superior (mega-menu y móvil)
  const [openDropdown, setOpenDropdown] = useState<'product' | 'demos' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado del acordeón de FAQ
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Selector interactivo de vista previa en el Hero (3 motores)
  const [previewTab, setPreviewTab] = useState<'cleaner' | 'guest' | 'invoice'>('cleaner');

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413]">
      {/* NAVBAR SAAS B2B CON MEGA-MENÚ DE PRODUCTO Y SELECTOR DE DEMOS EN VIVO */}
      <header
        className="sticky top-0 z-50 bg-[#F6F4EE]/95 backdrop-blur-md border-b border-[#E2DDD2]"
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* Columna 1: Identidad de Marca (1 sola línea limpia) */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group">
            <div className="w-8 h-8 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-extrabold text-xs tracking-tighter group-hover:bg-[#C85A32] transition-colors">
              TX
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#141413]">
              Turnexo<span className="text-[#C85A32]">.</span>
            </span>
          </a>

          {/* Columna 2: Navegación Central SaaS (Directa a las secciones clave) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-[#57554F] whitespace-nowrap">
            {/* Dropdown 1: Producto (Mega-Menu) */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('product')}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'product' ? null : 'product')}
                className={`px-3.5 py-2 rounded-none flex items-center gap-1.5 font-semibold whitespace-nowrap transition ${
                  openDropdown === 'product'
                    ? 'bg-[#141413] text-[#F6F4EE]'
                    : 'text-[#141413] hover:bg-[#E8E4D9]/80'
                }`}
              >
                <span>Producto</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-150 ${
                    openDropdown === 'product' ? 'rotate-180 text-[#C85A32]' : 'text-[#57554F]'
                  }`}
                />
              </button>

              {openDropdown === 'product' && (
                <div className="absolute left-0 top-full pt-2 w-[520px] z-50 whitespace-normal">
                  <div className="bg-[#FAF9F5] border-2 border-[#141413] shadow-[8px_8px_0px_#141413] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F] font-bold">
                        LOS 3 MOTORES DE TURNEXO
                      </span>
                      <a
                        href="#modulos"
                        onClick={() => setOpenDropdown(null)}
                        className="font-mono text-[10px] uppercase font-bold text-[#C85A32] hover:underline"
                      >
                        Ver detalle completo →
                      </a>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      <a
                        href="#modulos"
                        onClick={() => setOpenDropdown(null)}
                        className="group p-3.5 bg-white border border-[#E2DDD2] hover:border-[#141413] transition flex items-start gap-3.5"
                      >
                        <div className="w-9 h-9 bg-[#1F4E3D] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Smartphone size={17} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#141413] group-hover:text-[#1F4E3D]">
                              Cleaning App (Sin contraseñas)
                            </span>
                            <span className="font-mono text-[9px] uppercase font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-1.5 py-0.5">
                              0 WhatsApps
                            </span>
                          </div>
                          <p className="text-xs text-[#57554F] font-normal leading-relaxed">
                            Turnos automáticos por iCal, checklist por estancia y fotos en tiempo real para comprobar que todo está impecable.
                          </p>
                        </div>
                      </a>

                      <a
                        href="#modulos"
                        onClick={() => setOpenDropdown(null)}
                        className="group p-3.5 bg-white border border-[#E2DDD2] hover:border-[#141413] transition flex items-start gap-3.5"
                      >
                        <div className="w-9 h-9 bg-[#C85A32] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Video size={17} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#141413] group-hover:text-[#C85A32]">
                              Guest App · Mini-Web del Alojamiento
                            </span>
                            <span className="font-mono text-[9px] uppercase font-bold bg-[#C85A32]/10 text-[#C85A32] px-1.5 py-0.5">
                              Envío por Link
                            </span>
                          </div>
                          <p className="text-xs text-[#57554F] font-normal leading-relaxed">
                            Envíala antes de llegar con Vídeo Home Tour, check-in paso a paso en vídeo, guías de electrodomésticos y Late Check-out (+35 €).
                          </p>
                        </div>
                      </a>

                      <a
                        href="#modulos"
                        onClick={() => setOpenDropdown(null)}
                        className="group p-3.5 bg-white border border-[#E2DDD2] hover:border-[#141413] transition flex items-start gap-3.5"
                      >
                        <div className="w-9 h-9 bg-[#141413] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FileSpreadsheet size={17} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#141413]">
                              Facturación IVA 10% y Modelo 303
                            </span>
                            <span className="font-mono text-[9px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5">
                              1 Clic Gestoría
                            </span>
                          </div>
                          <p className="text-xs text-[#57554F] font-normal leading-relaxed">
                            Emite facturas simplificadas u ordinarias con IVA del 10% y exporta el Libro trimestral en Excel para tu gestor.
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown 2: Demos Interactivas en Vivo */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('demos')}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'demos' ? null : 'demos')}
                className={`px-3.5 py-2 flex items-center gap-2 font-semibold whitespace-nowrap transition ${
                  openDropdown === 'demos'
                    ? 'bg-[#141413] text-[#F6F4EE]'
                    : 'text-[#141413] hover:bg-[#E8E4D9]/80'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <span>Demos en vivo</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-150 shrink-0 ${
                    openDropdown === 'demos' ? 'rotate-180 text-[#C85A32]' : 'text-[#57554F]'
                  }`}
                />
              </button>

              {openDropdown === 'demos' && (
                <div className="absolute left-0 top-full pt-2 w-80 z-50 whitespace-normal">
                  <div className="bg-[#FAF9F5] border-2 border-[#141413] shadow-[8px_8px_0px_#141413] p-4 space-y-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F] font-bold block px-1">
                      PRUEBA LAS APPS SIN REGISTRARTE
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        onOpenGuestDemo();
                      }}
                      className="w-full text-left p-3 bg-white border border-[#E2DDD2] hover:border-[#C85A32] transition flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-xs text-[#141413] group-hover:text-[#C85A32]">
                          Mini-Web del Huésped
                        </p>
                        <p className="text-[11px] text-[#57554F] font-normal">
                          Vídeo Home Tour, check-in y extras
                        </p>
                      </div>
                      <ExternalLink size={14} className="text-[#C85A32] shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        onOpenCleanerDemo();
                      }}
                      className="w-full text-left p-3 bg-white border border-[#E2DDD2] hover:border-[#1F4E3D] transition flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-bold text-xs text-[#141413] group-hover:text-[#1F4E3D]">
                          App Móvil de Limpiadora
                        </p>
                        <p className="text-[11px] text-[#57554F] font-normal">
                          Turnos, checklist y subida de fotos
                        </p>
                      </div>
                      <ExternalLink size={14} className="text-[#1F4E3D] shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>

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

          {/* Columna 3: Acceso Clientes + CTA Principal (1 sola línea sin saltos) */}
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
          <div className="lg:hidden bg-[#FAF9F5] border-t-2 border-[#141413] px-6 py-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#57554F] font-bold block">
                MÓDULOS DE LA PLATAFORMA
              </span>
              <a
                href="#modulos"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 bg-white border border-[#D5CFC0] text-xs font-bold text-[#141413]"
              >
                🧹 Cleaning App · Turnos iCal, checklist y fotos
              </a>
              <a
                href="#modulos"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 bg-white border border-[#D5CFC0] text-xs font-bold text-[#141413]"
              >
                📱 Guest App · Mini-Web del alojamiento con vídeos
              </a>
              <a
                href="#modulos"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 bg-white border border-[#D5CFC0] text-xs font-bold text-[#141413]"
              >
                🧾 Facturación IVA 10% y Libro Excel Modelo 303
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGuestDemo();
                }}
                className="p-2.5 bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#C85A32] font-mono text-[11px] font-bold uppercase text-center"
              >
                Demo Mini-Web →
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCleanerDemo();
                }}
                className="p-2.5 bg-[#1F4E3D]/10 border border-[#1F4E3D]/30 text-[#1F4E3D] font-mono text-[11px] font-bold uppercase text-center"
              >
                Demo Limpiadora →
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E2DDD2] text-xs font-bold text-[#57554F]">
              <a href="#comparativa" onClick={() => setMobileMenuOpen(false)}>
                Comparativa
              </a>
              <a href="#precios" onClick={() => setMobileMenuOpen(false)}>
                Precios (1 Gratis)
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToApp();
              }}
              className="w-full bg-[#141413] text-white font-mono text-xs font-bold uppercase py-3.5"
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
              Controla tus limpiezas<span className="-ml-[0.03em]">,</span> la Mini-Web de tu alojamiento y tus facturas de IVA.{' '}
              <span className="text-[#C85A32]">En piloto automático.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#57554F] leading-relaxed max-w-2xl font-normal">
              Turnexo se conecta por iCal a tus anuncios de Airbnb y Booking y elimina el trabajo manual de cada reserva:
            </p>

            {/* 3 beneficios escaneables (uno por motor) */}
            <ul className="space-y-3 max-w-2xl text-sm sm:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Limpiezas sin WhatsApp (Cleaning App):</strong> tu limpiadora ve sus turnos en su enlace móvil, sigue el checklist y sube fotos para comprobar que todo está impecable.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Mini-Web del alojamiento (Guest App):</strong> envíala por link antes de que lleguen con Vídeo Home Tour, vídeos de check-in, guías de electrodomésticos y venta de Late Check-out.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#1F4E3D] shrink-0 mt-0.5" />
                <span className="text-[#141413]">
                  <strong>Facturas con IVA en 1 clic:</strong> y descarga del Libro trimestral en Excel listo para que tu gestoría presente el Modelo 303.
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
                  <span>Probar 1 Alojamiento Gratis (Sin tarjeta)</span>
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

          {/* Vista Previa Interactiva con Toggle de los 3 Motores: Cleaner / Guest / Facturas IVA */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#E8E4D9] border border-[#D5CFC0] rounded-none font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setPreviewTab('cleaner')}
                className={`py-2 px-1.5 font-bold uppercase transition flex items-center justify-center gap-1 ${
                  previewTab === 'cleaner'
                    ? 'bg-[#141413] text-white shadow-md'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                <Smartphone size={13} />
                <span>Limpiadora</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('guest')}
                className={`py-2 px-1.5 font-bold uppercase transition flex items-center justify-center gap-1 ${
                  previewTab === 'guest'
                    ? 'bg-[#C85A32] text-white shadow-md'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                <Sparkles size={13} />
                <span>Mini-Web</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('invoice')}
                className={`py-2 px-1.5 font-bold uppercase transition flex items-center justify-center gap-1 ${
                  previewTab === 'invoice'
                    ? 'bg-[#1F4E3D] text-white shadow-md'
                    : 'text-[#57554F] hover:text-[#141413]'
                }`}
              >
                <FileSpreadsheet size={13} />
                <span>IVA 10%</span>
              </button>
            </div>

            {previewTab === 'cleaner' && (
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
                  className="w-full bg-[#141413] hover:bg-[#2C2C29] text-white font-sans text-xs sm:text-sm font-semibold py-3 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Abrir App Limpiadora Completa</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            )}

            {previewTab === 'guest' && (
              <div className="bg-[#141413] text-[#F6F4EE] p-6 border-2 border-[#141413] space-y-4 shadow-[6px_6px_0px_#C85A32]">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
                      MINI-WEB DEL ALOJAMIENTO · ENVÍALA POR LINK ANTES DE LLEGAR
                    </span>
                    <h3 className="text-xl font-bold mt-0.5">Ático Vista Marina</h3>
                  </div>
                  <span className="font-mono text-xs bg-white/10 px-2.5 py-1 text-white/80">
                    ES · EN · FR
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-xs shrink-0">▶</span>
                      <div>
                        <p className="font-bold text-white text-xs">Vídeo Home Tour</p>
                        <p className="text-[10px] text-white/60">El huésped ve cómo es el alojamiento desde su móvil antes de llegar</p>
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
                    El huésped lo solicita en 1 toque desde la Mini-Web. Tú lo cobras íntegro sin intermediarios.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenGuestDemo}
                  className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans text-xs sm:text-sm font-semibold py-3 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Ver Guía Digital en Vivo</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            )}

            {previewTab === 'invoice' && (
              <div className="bg-[#FAF9F5] border-2 border-[#141413] p-6 space-y-4 shadow-[6px_6px_0px_#1F4E3D]">
                <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold">
                      FACTURACIÓN IVA 10% · MODELO 303 GESTORÍA
                    </span>
                    <h4 className="text-xl font-bold text-[#141413] mt-0.5">
                      Factura #F-2026-0042
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1">
                    IVA 10% Desglosado
                  </span>
                </div>

                <div className="bg-white border border-[#D5CFC0] p-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between items-center border-b border-[#E2DDD2] pb-2">
                    <span className="text-[#57554F]">Reserva sincronizada:</span>
                    <span className="font-bold text-[#141413]">Thomas Müller (Airbnb · 4 noches)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#57554F]">Base Imponible Alojamiento:</span>
                    <span className="font-bold text-[#141413]">400,00 €</span>
                  </div>
                  <div className="flex justify-between items-center text-[#1F4E3D]">
                    <span className="font-bold">Cuota IVA Hospedaje (10%):</span>
                    <span className="font-bold">+40,00 €</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#141413] pt-2 text-sm">
                    <span className="font-bold text-[#141413]">TOTAL FACTURA OFICIAL:</span>
                    <span className="font-extrabold text-[#141413]">440,00 €</span>
                  </div>
                </div>

                <div className="p-3 bg-[#1F4E3D]/10 border border-[#1F4E3D]/30 text-[#1F4E3D] text-[11px] font-mono flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Al cerrar el trimestre, descargas el Libro Excel para que tu gestoría presente el Modelo 303 sin picar facturas a mano.</span>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToApp}
                  className="w-full bg-[#1F4E3D] hover:bg-[#16382B] text-white font-sans text-xs sm:text-sm font-semibold py-3 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Probar Facturación y Libro IVA en el Panel</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BARRA FINA DE COMPATIBILIDAD UNIVERSAL */}
      <section className="bg-[#FAF9F5] border-b border-[#E2DDD2] py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#57554F] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#1F4E3D]" />
            <span>Compatible con cualquier calendario iCal (.ics) sin cambiar de plataforma ni dar contraseñas:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs font-bold">
            {[
              { name: 'Airbnb', tag: 'iCal Sync' },
              { name: 'Booking.com', tag: 'iCal Sync' },
              { name: 'Vrbo', tag: 'iCal Sync' },
              { name: 'Smoobu / Lodgify', tag: 'Compatible' },
              { name: 'AvaiBook', tag: 'Compatible' },
              { name: 'Libro IVA AEAT', tag: 'Modelo 303' },
            ].map((p) => (
              <div
                key={p.name}
                className="bg-white border border-[#D5CFC0] px-3 py-1.5 flex items-center gap-2"
              >
                <span className="text-[#141413]">{p.name}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#E8E4D9] text-[#57554F]">
                  {p.tag}
                </span>
              </div>
            ))}
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
          {/* MOTOR 1: GUEST APP (MINI-WEB DEL ALOJAMIENTO) */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
                  01 · GUEST APP (MINI-WEB DEL ALOJAMIENTO)
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                  Envío por Link antes de llegar
                </span>
              </div>

              {/* Lo que te ahorras */}
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-xs text-rose-950 leading-relaxed">
                <strong className="font-mono uppercase text-[10px] text-rose-700 block mb-0.5">
                  ❌ Lo que te ahorras desde el primer día:
                </strong>
                Llamadas a las 23:30h porque el huésped no encuentra la entrada o el cajetín de llaves, mensajes preguntando cómo encender la vitrocerámica o el aire acondicionado, y salidas a las 11:00h sin monetizar.
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  Una Mini-Web exclusiva de tu alojamiento con Vídeo Home Tour, Check-in en vídeo, electrodomésticos y extras.
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  Mucho más que un simple código QR: le envías el enlace por WhatsApp o por el chat de Airbnb antes de que llegue al alojamiento. Sin descargar nada, ve cómo es el alojamiento en vídeo por el camino, entra sin llamarte y compra Late Check-out en 1 toque.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Video size={14} className="text-[#C85A32]" />
                    Vídeo Home Tour antes de llegar
                  </p>
                  <p className="text-[#57554F]">
                    El huésped abre el link antes de viajar y ve un recorrido en vídeo por cada estancia del alojamiento.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    Vídeos de Check-in Paso a Paso
                  </p>
                  <p className="text-[#57554F]">
                    Muestra cómo encontrar la entrada y abrir el cajetín de llaves cuando está en la calle.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#C85A32]" />
                    Vídeo-Guías de Electrodomésticos
                  </p>
                  <p className="text-[#57554F]">
                    Vídeos cortos de 15 seg para la vitrocerámica, aire acondicionado o termo para que no te llamen de noche.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#1F4E3D]" />
                    Venta de Late Check-out (+35 €)
                  </p>
                  <p className="text-[#57554F]">
                    Si la tarde queda libre en el iCal, la Mini-Web ofrece salir a las 17:00h. Cobras el 100% sin comisiones.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenGuestDemo}
                className="text-xs sm:text-sm font-sans font-semibold text-[#C85A32] hover:underline"
              >
                Ver Guía Digital en Vivo →
              </button>
              <button
                type="button"
                onClick={onNavigateToApp}
                className="bg-[#141413] hover:bg-[#2C2C29] text-white text-xs sm:text-sm font-sans font-semibold px-5 py-3 transition"
              >
                Crear Guía Huésped Gratis
              </button>
            </div>
          </div>

          {/* MOTOR 2: CLEANING APP SIN CONTRASEÑAS */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-8 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#1F4E3D] font-bold">
                  02 · CLEANING APP SIN CONTRASEÑAS
                </span>
                <span className="font-mono text-xs font-bold bg-[#1F4E3D]/10 text-[#1F4E3D] px-2 py-0.5">
                  Cero WhatsApps · Fotos en vivo
                </span>
              </div>

              {/* Lo que te ahorras */}
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-xs text-rose-950 leading-relaxed">
                <strong className="font-mono uppercase text-[10px] text-rose-700 block mb-0.5">
                  ❌ Lo que te ahorras desde el primer día:
                </strong>
                Audios eternos por WhatsApp cada domingo para avisar de qué días hay salida, olvidos ante reservas de última hora y la incertidumbre de no saber si el alojamiento ha quedado limpio antes del check-in.
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                  Ahorra toda la comunicación con tu limpiadora y comprueba con fotos que todo esté impecable.
                </h3>
                <p className="text-sm text-[#57554F] leading-relaxed">
                  Tu limpiadora entra desde su enlace directo en el navegador del móvil (sin instalar apps ni recordar contraseñas). Ve sus turnos actualizados según tu calendario iCal, marca el checklist y sube fotos al terminar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Users size={14} className="text-[#1F4E3D]" />
                    Turnos Sincronizados por iCal
                  </p>
                  <p className="text-[#57554F]">
                    Si entra una reserva nueva o una cancelación en Airbnb/Booking, su cuadrante se actualiza solo al instante.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#1F4E3D]" />
                    Checklist por Estancia
                  </p>
                  <p className="text-[#57554F]">
                    Sábanas cambiadas, baño desinfectado, toallas y amenities repuestos. Nada queda a la improvisación.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#1F4E3D]" />
                    Auditoría Fotográfica en tu Móvil
                  </p>
                  <p className="text-[#57554F]">
                    Revisa las fotos reales de la limpieza desde tu sofá antes de que entre el siguiente huésped.
                  </p>
                </div>

                <div className="border border-[#E2DDD2] bg-white p-4 space-y-1">
                  <p className="font-bold text-[#141413] flex items-center gap-1.5">
                    <Flame size={14} className="text-[#C85A32]" />
                    Alerta 🔥 ENTRADA HOY
                  </p>
                  <p className="text-[#57554F]">
                    Destaca en rojo las rotaciones urgentes del mismo día (salida 11:00h → entrada 15:00h) automáticamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2DDD2]">
              <button
                type="button"
                onClick={onOpenCleanerDemo}
                className="text-xs sm:text-sm font-sans font-semibold text-[#1F4E3D] hover:underline"
              >
                Abrir App de la Limpiadora →
              </button>
              <button
                type="button"
                onClick={onNavigateToApp}
                className="bg-[#141413] hover:bg-[#2C2C29] text-white text-xs sm:text-sm font-sans font-semibold px-5 py-3 transition"
              >
                Automatizar Limpiezas
              </button>
            </div>
          </div>
        </div>

        {/* MOTOR 3: FACTURACIÓN IVA 10% Y LIBRO EXCEL PARA GESTORÍA */}
        <div className="mt-8 bg-[#FAF9F5] border-2 border-[#141413] p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-[6px_6px_0px_#141413]">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DDD2] pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-800 font-bold">
                03 · FACTURACIÓN IVA 10% Y EXPORTACIÓN MODELO 303
              </span>
              <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5">
                Listo para tu Gestoría en 1 Clic
              </span>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200/80 text-xs text-rose-950 leading-relaxed">
              <strong className="font-mono uppercase text-[10px] text-rose-700 block mb-0.5">
                ❌ Lo que te ahorras desde el primer día:
              </strong>
              Perder tardes enteras al final de cada trimestre creando facturas una por una en Word o Excel con el 10% de IVA para enviárselas a tu gestor.
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight leading-tight">
                Genera las facturas de tus estancias con el 10% de IVA y envíaselas a tu gestor en 1 clic.
              </h3>
              <p className="text-sm text-[#57554F] leading-relaxed">
                Turnexo convierte cada reserva sincronizada de Airbnb y Booking en su factura simplificada o completa con el 10% de IVA desglosado. Al cerrar el trimestre, descargas el Libro de IVA en Excel listo para que tu asesoría presente el Modelo 303 en 2 minutos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Facturas en 1 Clic</p>
                <p className="text-[#57554F]">Numeración correlativa oficial, desglose automático base + 10% IVA y descarga en PDF.</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Libro Excel Modelo 303</p>
                <p className="text-[#57554F]">Archivo trimestral estructurado que tu gestoría importa sin picar datos a mano.</p>
              </div>
              <div className="bg-white border border-[#E2DDD2] p-3.5 space-y-1">
                <p className="font-bold text-[#141413]">Multi-NIF por Alojamiento</p>
                <p className="text-[#57554F]">Separa series y titulares si gestionas alojamientos de distintos propietarios.</p>
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
              className="bg-[#C85A32] hover:bg-[#B04A25] text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider px-7 py-4 transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>Probar 1 Alojamiento Gratis</span>
              <ArrowUpRight size={17} />
            </button>
            <button
              type="button"
              onClick={onOpenGuestDemo}
              className="border border-white/30 hover:border-white text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-4 transition text-center"
            >
              Ver Demo en Vivo
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
