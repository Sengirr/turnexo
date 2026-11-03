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
  Play,
} from 'lucide-react';

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
              <a href="#modulos" className="hover:text-[#141413] transition">
                Módulos Independientes
              </a>
              <a href="#como-funciona" className="hover:text-[#141413] transition">
                Arquitectura iCal
              </a>
              <a href="#retorno" className="hover:text-[#141413] transition">
                Calculadora Upsell
              </a>
              <a href="#precios" className="hover:text-[#141413] transition">
                Tarifas
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

          {/* Vista Previa Editorial de las 2 piezas conectadas */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#141413] text-[#F6F4EE] p-6 border border-[#141413] space-y-5">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32]">
                    MÓDULO 01 · GUÍA DEL HUÉSPED
                  </span>
                  <h3 className="font-serif text-2xl mt-0.5">Ático Vista Marina · Marbella</h3>
                </div>
                <span className="font-mono text-xs bg-white/10 px-2.5 py-1">
                  turnexo.com/g/marina
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-white/5 border border-white/10 p-3">
                  <span className="text-white/50 block text-[10px]">CHECK-IN / PUERTA</span>
                  <span className="font-bold text-sm mt-1 block">15:00h · Cód. 4829#</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3">
                  <span className="text-white/50 block text-[10px]">RED WIFI</span>
                  <span className="font-bold text-sm mt-1 block">VistaMarina_5G</span>
                </div>
              </div>

              <div className="bg-[#FAF9F5] text-[#141413] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#1F4E3D] font-bold">
                    ● HUECO DETECTADO EN ICAL EL 03 NOV
                  </span>
                  <span className="font-mono font-bold text-sm">+35 €</span>
                </div>
                <p className="text-xs font-semibold">
                  Oferta automática al huésped: Late Check-out hasta las 17:00h
                </p>
                <p className="text-[11px] text-[#57554F]">
                  Solo se muestra en la guía cuando no entra ningún huésped ese día.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold">
                    MÓDULO 02 · ENLACE DE LA LIMPIADORA
                  </span>
                  <h4 className="font-bold text-base text-[#141413] mt-0.5">
                    María Carmen · Turnos de la semana
                  </h4>
                </div>
                <span className="font-mono text-[11px] bg-[#E8E4D9] px-2.5 py-1 font-semibold">
                  Sin contraseñas
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 bg-white border-l-4 border-[#C85A32] border border-[#E2DDD2]">
                  <div>
                    <span className="font-mono font-bold text-[#C85A32] block">
                      🔥 HOY 02 NOV · ROTACIÓN MISMO DÍA
                    </span>
                    <span className="font-semibold text-[#141413]">Loft Centro Catedral</span>
                  </div>
                  <span className="font-mono font-bold bg-[#141413] text-white px-2.5 py-1">
                    11:00 → 15:00
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white border-l-4 border-[#1F4E3D] border border-[#E2DDD2]">
                  <div>
                    <span className="font-mono font-bold text-[#1F4E3D] block">
                      ⏰ 03 NOV · LATE CHECK-OUT CONCEDIDO
                    </span>
                    <span className="font-semibold text-[#141413]">Ático Vista Marina</span>
                  </div>
                  <span className="font-mono font-bold bg-[#1F4E3D] text-white px-2.5 py-1">
                    Entrar 17:00h
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                <span className="font-semibold">Módulo Suelto (Guía o Limpiezas)</span>
                <span className="font-mono font-bold">12 € / mes</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E2DDD2]">
                <span className="font-semibold text-[#C85A32]">
                  Pack Completo (Guía + Limpiezas Conectadas)
                </span>
                <span className="font-mono font-bold text-[#C85A32]">19 € / mes</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-semibold">Plan Gestora (Hasta 25 alojamientos)</span>
                <span className="font-mono font-bold">49 € / mes</span>
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
    </div>
  );
}
