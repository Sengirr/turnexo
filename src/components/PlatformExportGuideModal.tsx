import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  X,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export type GuideTopic = 'csv' | 'ical';
export type PlatformType = 'airbnb' | 'booking';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: GuideTopic;
  defaultPlatform?: PlatformType;
}

/**
 * Guía interactiva paso a paso para descargar CSV/Excel o conseguir el enlace iCal de Airbnb y Booking
 */
export default function PlatformExportGuideModal({
  isOpen,
  onClose,
  defaultTopic = 'csv',
  defaultPlatform = 'airbnb',
}: ModalProps) {
  const [topic, setTopic] = useState<GuideTopic>(defaultTopic);
  const [platform, setPlatform] = useState<PlatformType>(defaultPlatform);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200 border border-slate-200/80">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                <HelpCircle size={11} />
                Guía Oficial Paso a Paso
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                ¿Cómo obtener tus archivos de Airbnb y Booking?
              </h2>
              <p className="text-xs text-slate-500">
                Instrucciones con enlaces directos para descargar reservas o conectar tu calendario en 1 minuto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
            title="Cerrar guía"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selector de Tema Principal: Excel/CSV vs Calendario iCal */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTopic('csv')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              topic === 'csv'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={15} className={topic === 'csv' ? 'text-emerald-600' : ''} />
            <span>Descargar Reservas (Excel / CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setTopic('ical')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              topic === 'ical'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={15} className={topic === 'ical' ? 'text-orange-600' : ''} />
            <span>Enlace Calendario (iCal .ics)</span>
          </button>
        </div>

        {/* Selector de Plataforma: Airbnb vs Booking */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlatform('airbnb')}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              platform === 'airbnb'
                ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF385C]" />
            <span>Airbnb</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('booking')}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              platform === 'booking'
                ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#003580]" />
            <span>Booking.com</span>
          </button>
        </div>

        {/* Contenido según selección */}
        {topic === 'csv' ? (
          platform === 'airbnb' ? (
            <AirbnbCsvInstructions />
          ) : (
            <BookingCsvInstructions />
          )
        ) : platform === 'airbnb' ? (
          <AirbnbIcalInstructions />
        ) : (
          <BookingIcalInstructions />
        )}

        {/* Pie de modal */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Turnexo es compatible con los archivos originales sin modificarlos.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            Entendido, volver
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente Guía Inline para el Modal de Subida de Reservas CSV
// -------------------------------------------------------------
export function PlatformCsvGuideInline() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>('airbnb');

  return (
    <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-indigo-50/70 transition"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            ?
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-950 block">
              ¿No sabes dónde descargar este archivo en Airbnb o Booking?
            </span>
            <span className="text-[11px] text-indigo-700 block">
              Pulsa aquí para ver los 4 sencillos pasos con enlaces directos
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
          {open ? 'Ocultar guía ▲' : 'Ver cómo sacarlo ▼'}
        </span>
      </button>

      {open && (
        <div className="p-4 pt-1 border-t border-indigo-100/70 bg-white space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPlatform('airbnb')}
              className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                platform === 'airbnb'
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-extrabold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF385C]" />
              <span>Airbnb (CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => setPlatform('booking')}
              className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                platform === 'booking'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 font-extrabold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#003580]" />
              <span>Booking.com (Excel / CSV)</span>
            </button>
          </div>

          {platform === 'airbnb' ? <AirbnbCsvInstructions compact /> : <BookingCsvInstructions compact />}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Componente Guía Inline para el Modal de iCal
// -------------------------------------------------------------
export function PlatformIcalGuideInline() {
  const [platform, setPlatform] = useState<PlatformType>('airbnb');

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-orange-600" />
          ¿Dónde encontrar el enlace iCal en tu plataforma?
        </span>
        <div className="flex items-center gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setPlatform('airbnb')}
            className={`px-2.5 py-1 rounded-lg transition ${
              platform === 'airbnb'
                ? 'bg-rose-100 text-rose-800 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Airbnb
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setPlatform('booking')}
            className={`px-2.5 py-1 rounded-lg transition ${
              platform === 'booking'
                ? 'bg-blue-100 text-blue-800 font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Booking
          </button>
        </div>
      </div>

      {platform === 'airbnb' ? <AirbnbIcalInstructions compact /> : <BookingIcalInstructions compact />}
    </div>
  );
}

// -------------------------------------------------------------
// INSTRUCCIONES ESPECÍFICAS: AIRBNB CSV
// -------------------------------------------------------------
function AirbnbCsvInstructions({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-3.5 text-xs">
      <div className="flex items-center justify-between bg-rose-50/70 border border-rose-200/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-rose-950">Sección: Panel de Ingresos de Airbnb</span>
        </div>
        <a
          href="https://www.airbnb.es/users/transaction_history"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF385C] hover:bg-[#e03150] text-white rounded-xl font-bold transition shadow-2xs"
        >
          <span>Abrir Ingresos en Airbnb</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            1
          </span>
          <div className="text-slate-700 leading-relaxed">
            Inicia sesión en Airbnb <strong>desde un ordenador / navegador web</strong> (la app móvil no permite exportar) en <strong>Modo Anfitrión</strong> y entra en <strong>Menú (≡) → Ingresos</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            2
          </span>
          <div className="text-slate-700 leading-relaxed">
            En el menú de la izquierda, entra en <strong>«Cobros recibidos»</strong> (o en <strong>«Informes»</strong> para bajar resúmenes mensuales o anuales).
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            3
          </span>
          <div className="text-slate-700 leading-relaxed">
            Filtra por el rango de fechas del trimestre a facturar y pulsa en <strong>«Exportar CSV»</strong> (en la parte superior del listado) para descargar el archivo <code>.csv</code>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            4
          </span>
          <div className="text-slate-700 leading-relaxed">
            Sube ese archivo directamente aquí en Turnexo. Se emitirán automáticamente todas tus facturas correlativas con su base e IVA del 10%.
          </div>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] leading-relaxed">
        <strong>💡 Nota importante:</strong> Airbnb trasladó la exportación de reservas al panel de <strong>Ingresos</strong>. Si gestionas varios alojamientos, Turnexo filtrará automáticamente solo las reservas de tus pisos registrados.
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// INSTRUCCIONES ESPECÍFICAS: BOOKING EXCEL / CSV
// -------------------------------------------------------------
function BookingCsvInstructions({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-3.5 text-xs">
      <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-blue-950">Sección: Extranet de Booking</span>
        </div>
        <a
          href="https://admin.booking.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#003580] hover:bg-[#00224f] text-white rounded-xl font-bold transition shadow-2xs"
        >
          <span>Abrir Extranet de Booking</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            1
          </span>
          <div className="text-slate-700 leading-relaxed">
            Accede a <strong>admin.booking.com</strong> y en el menú superior pulsa en la pestaña <strong>«Reservas»</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            2
          </span>
          <div className="text-slate-700 leading-relaxed">
            En los filtros, selecciona criterio <strong>«Fecha de salida»</strong> (check-out), indica el rango de fechas del trimestre (<em>Desde / Hasta</em>) y pulsa el botón <strong>«Mostrar»</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            3
          </span>
          <div className="text-slate-700 leading-relaxed">
            Arriba a la derecha de la tabla de resultados, haz clic en <strong>«Descargar»</strong> (o <em>«Exportar»</em>) para descargar el archivo Excel oficial (<code>.xls</code> o <code>.xlsx</code>).
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            4
          </span>
          <div className="text-slate-700 leading-relaxed">
            Sube el Excel descargado directamente aquí en Turnexo sin abrirlo ni convertirlo a CSV.
          </div>
        </div>
      </div>

      <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-950 text-[11px] leading-relaxed">
        <strong>✨ 100% compatible con Excel nativo:</strong> Turnexo lee directamente los archivos oficiales de Booking <code>.xls</code> y <code>.xlsx</code> sin requerir conversión previa a CSV.
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// INSTRUCCIONES ESPECÍFICAS: AIRBNB iCAL (.ICS)
// -------------------------------------------------------------
function AirbnbIcalInstructions({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-3.5 text-xs">
      <div className="flex items-center justify-between bg-rose-50/70 border border-rose-200/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-rose-950">Sección: Calendario de Airbnb</span>
        </div>
        <a
          href="https://www.airbnb.es/hosting/calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF385C] hover:bg-[#e03150] text-white rounded-xl font-bold transition shadow-2xs"
        >
          <span>Abrir Calendario Airbnb</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            1
          </span>
          <div className="text-slate-700 leading-relaxed">
            Entra en tu cuenta de anfitrión en Airbnb (preferiblemente desde navegador web) y ve a la pestaña <strong>«Calendario»</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            2
          </span>
          <div className="text-slate-700 leading-relaxed">
            Selecciona tu alojamiento y, en el panel derecho de configuración, haz clic en <strong>«Disponibilidad»</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            3
          </span>
          <div className="text-slate-700 leading-relaxed">
            Baja hasta el final a la sección <strong>«Sincronización del calendario»</strong> / <strong>«Conectar calendarios»</strong> y pulsa en <strong>«Conectar con otro sitio web»</strong> (o <em>Exportar calendario</em>).
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            4
          </span>
          <div className="text-slate-700 leading-relaxed">
            Verás la URL de tu calendario (empieza por <code>https://www.airbnb.es/calendar/ical/...</code> y termina en <code>.ics</code>). Pulsa <strong>«Copiar enlace»</strong> y pégalo aquí en Turnexo.
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// INSTRUCCIONES ESPECÍFICAS: BOOKING iCAL (.ICS)
// -------------------------------------------------------------
function BookingIcalInstructions({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-3.5 text-xs">
      <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-blue-950">Sección: Tarifas y disponibilidad en Booking</span>
        </div>
        <a
          href="https://admin.booking.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#003580] hover:bg-[#00224f] text-white rounded-xl font-bold transition shadow-2xs"
        >
          <span>Ir a Booking Extranet</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            1
          </span>
          <div className="text-slate-700 leading-relaxed">
            Inicia sesión en la <strong>Extranet de Booking</strong> (admin.booking.com).
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            2
          </span>
          <div className="text-slate-700 leading-relaxed">
            En el menú superior, pulsa en <strong>«Tarifas y disponibilidad»</strong> (o <em>«Calendario y precios»</em>) y entra en <strong>«Sincronizar calendarios»</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            3
          </span>
          <div className="text-slate-700 leading-relaxed">
            Si ya tienes conexiones creadas verás directamente el botón <strong>«Exportar calendario»</strong>. Si es la primera vez, haz clic en <strong>«Añadir conexión de calendario»</strong>.
          </div>
        </div>

        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200/70">
          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
            4
          </span>
          <div className="text-slate-700 leading-relaxed">
            <strong>Truco importante:</strong> Primero Booking te pedirá pegar un enlace para <em>importar</em>. Si solo quieres obtener tu enlace de Booking, pulsa abajo en <strong>«Saltar este paso»</strong> (u <em>Omitir</em>) para pasar al bloque <strong>«Exportar calendario»</strong>, dale un nombre (ej. <em>Turnexo</em>), copia la URL <code>https://ical.booking.com/...</code> y pégala aquí.
          </div>
        </div>
      </div>
    </div>
  );
}
