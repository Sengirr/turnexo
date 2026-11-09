import { useState } from 'react';
import {
  Check,
  Camera,
  Flame,
  KeyRound,
  Play,
  BookOpen,
  Clock,
  ArrowUpRight,
  Wifi,
  Battery,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface HeroPhoneMockupProps {
  onOpenCleanerDemo?: () => void;
  onOpenGuestDemo?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export default function HeroPhoneMockup({
  onOpenCleanerDemo,
  onOpenGuestDemo,
}: HeroPhoneMockupProps) {
  const [activeRole, setActiveRole] = useState<'cleaner' | 'guest'>('cleaner');

  // Estado interactivo Vista Limpiadora
  const [tasks, setTasks] = useState<ChecklistItem[]>([
    { id: 'sabanas', label: 'Sábanas cambiadas', checked: true },
    { id: 'bano', label: 'Baño desinfectado', checked: true },
    { id: 'amenities', label: 'Reposición amenities', checked: false },
    { id: 'llaves', label: 'Llaves en cajetín', checked: true },
  ]);
  const [photosCount, setPhotosCount] = useState(3);
  const [photoFeedback, setPhotoFeedback] = useState(false);

  // Estado interactivo Vista Huésped
  const [wifiCopied, setWifiCopied] = useState(false);
  const [selectedGuideItem, setSelectedGuideItem] = useState<string | null>(null);
  const [lateCheckoutBooked, setLateCheckoutBooked] = useState(false);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handlePhotoUploadSim = () => {
    setPhotosCount((prev) => (prev < 6 ? prev + 1 : 3));
    setPhotoFeedback(true);
    setTimeout(() => setPhotoFeedback(false), 1800);
  };

  const handleCopyWifi = () => {
    setWifiCopied(true);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('LoftCentro_2026').catch(() => {});
    }
    setTimeout(() => setWifiCopied(false), 2200);
  };

  const handleOpenFullDemo = () => {
    if (activeRole === 'cleaner') {
      if (onOpenCleanerDemo) {
        onOpenCleanerDemo();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/demo/limpiadora';
      }
    } else {
      if (onOpenGuestDemo) {
        onOpenGuestDemo();
      } else if (typeof window !== 'undefined') {
        window.location.href = '/demo/huesped';
      }
    }
  };

  const completedTasksCount = tasks.filter((t) => t.checked).length;

  return (
    <div className="w-full max-w-[370px] mx-auto flex flex-col items-center space-y-4 select-none">
      {/* 1. SELECTOR SUPERIOR DE ROLES (2 PESTAÑAS) */}
      <div
        role="tablist"
        aria-label="Cambiar vista del teléfono"
        className="w-full grid grid-cols-2 gap-1.5 p-1.5 bg-[#E8E4D9] border border-[#D5CFC0] rounded-2xl shadow-inner"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeRole === 'cleaner'}
          onClick={() => setActiveRole('cleaner')}
          className={`py-2.5 px-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeRole === 'cleaner'
              ? 'bg-[#141413] text-white shadow-md scale-[1.01]'
              : 'text-[#57554F] hover:text-[#141413]'
          }`}
        >
          <span>📱 Vista Limpiadora</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeRole === 'guest'}
          onClick={() => setActiveRole('guest')}
          className={`py-2.5 px-3 rounded-xl font-sans text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeRole === 'guest'
              ? 'bg-[#C85A32] text-white shadow-md scale-[1.01]'
              : 'text-[#57554F] hover:text-[#141413]'
          }`}
        >
          <span>✨ Vista Huésped</span>
        </button>
      </div>

      {/* 2. MARCO REALISTA DE SMARTPHONE (ESTILO IPHONE) */}
      <div className="relative w-full rounded-[2.5rem] border-[8px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-black/15">
        {/* Barra de estado superior + Dynamic Island / Notch sutil */}
        <div
          className={`px-6 pt-2.5 pb-2 flex items-center justify-between text-[11px] font-sans font-semibold transition-colors ${
            activeRole === 'cleaner'
              ? 'bg-[#FAF9F5] text-slate-800'
              : 'bg-[#141413] text-white'
          }`}
        >
          <span>09:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto flex items-center justify-end pr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi size={12} />
            <Battery size={14} />
          </div>
        </div>

        {/* PANTALLA INTERNA DEL TELÉFONO */}
        {activeRole === 'cleaner' ? (
          /* ================= A) VISTA LIMPIADORA ================= */
          <div className="bg-[#FAF9F5] text-[#141413] px-4 pt-2 pb-4 space-y-3.5 min-h-[465px] flex flex-col justify-between">
            <div className="space-y-3">
              {/* Encabezado móvil */}
              <div className="flex items-center justify-between gap-2 border-b border-[#E2DDD2] pb-2.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F4E3D] font-bold block">
                    Parte de hoy · Sin contraseñas
                  </span>
                  <h3 className="text-sm font-extrabold text-[#141413]">
                    Turnos de María Carmen
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#1F4E3D] text-white px-2.5 py-1 rounded-full whitespace-nowrap">
                  2 de 3 completadas
                </span>
              </div>

              {/* Tarjeta de alojamiento */}
              <div className="bg-white rounded-2xl border border-[#E2DDD2] p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[#C85A32]">
                      <Flame size={12} /> Rotación urgente
                    </span>
                    <h4 className="font-extrabold text-sm text-[#141413]">
                      Loft Centro Catedral
                    </h4>
                  </div>
                  <span className="font-mono text-[11px] font-bold bg-[#141413] text-white px-2.5 py-1 rounded-lg whitespace-nowrap">
                    11:00 → 15:00
                  </span>
                </div>

                {/* Checklist interactivo clicable */}
                <div className="space-y-1.5 pt-1 border-t border-[#F0EDE6]">
                  <div className="flex items-center justify-between text-[11px] text-[#57554F] pb-0.5">
                    <span className="font-semibold text-[#141413]">
                      Checklist obligatorio (haz clic):
                    </span>
                    <span className="font-mono font-bold text-[#1F4E3D]">
                      {completedTasksCount}/{tasks.length}
                    </span>
                  </div>

                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                        task.checked
                          ? 'bg-emerald-50/70 border-emerald-200 text-[#141413]'
                          : 'bg-[#FAF9F5] border-[#E2DDD2] text-[#57554F] hover:border-[#141413]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-md flex items-center justify-center transition ${
                            task.checked
                              ? 'bg-[#1F4E3D] text-white'
                              : 'border border-slate-400 bg-white'
                          }`}
                        >
                          {task.checked && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className={task.checked ? 'line-through opacity-75' : ''}>
                          {task.label}
                        </span>
                      </div>
                      {task.checked && (
                        <span className="text-[10px] font-mono text-[#1F4E3D] font-bold">
                          Hecho
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Botón simulado de subida de fotos */}
                <button
                  type="button"
                  onClick={handlePhotoUploadSim}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#141413] hover:bg-[#2C2C29] active:scale-[0.99] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Camera size={14} className="text-[#C85A32]" />
                  <span>
                    {photoFeedback
                      ? '✓ Foto añadida a la auditoría'
                      : `📸 Subir fotos de auditoría (${photosCount} subidas)`}
                  </span>
                </button>
              </div>
            </div>

            {/* Banner inferior del teléfono */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#1F4E3D]/10 border border-[#1F4E3D]/25 text-[#1F4E3D] text-[11px] font-semibold flex items-center justify-center gap-1.5 text-center">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>0 audios de WhatsApp · Todo sincronizado por iCal</span>
              </div>
              <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto" />
            </div>
          </div>
        ) : (
          /* ================= B) VISTA HUÉSPED ================= */
          <div className="bg-[#141413] text-[#F6F4EE] px-4 pt-2 pb-4 space-y-3.5 min-h-[465px] flex flex-col justify-between">
            <div className="space-y-3">
              {/* Encabezado móvil */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C85A32] font-bold block">
                    Mini-Web del Alojamiento
                  </span>
                  <h3 className="text-sm font-extrabold text-white">
                    Guía de Bienvenida · Loft Centro
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                  ES · EN · FR
                </span>
              </div>

              {/* Botón destacado de acción rápida: Copiar clave WiFi */}
              <button
                type="button"
                onClick={handleCopyWifi}
                className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  wifiCopied
                    ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shrink-0">
                    <KeyRound size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">
                      {wifiCopied ? '✓ Clave WiFi copiada al portapapeles' : '🔑 Copiar clave WiFi'}
                    </p>
                    <p className="text-[10px] text-white/60 font-mono">
                      Red: LoftCentro_5G · Toque rápido
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-white/10">
                  {wifiCopied ? 'Copiado' : 'Copiar'}
                </span>
              </button>

              {/* Botones de acceso rápido */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                  Accesos directos en vídeo (1 toque):
                </p>

                {[
                  {
                    id: 'checkin',
                    title: 'Vídeo Check-in en portal',
                    sub: 'Código entrada 4829# y cajetín paso a paso (0:45s)',
                    icon: Play,
                  },
                  {
                    id: 'vitro',
                    title: 'Cómo usar la vitrocerámica',
                    sub: 'Desbloqueo táctil y encendido rápido (0:20s)',
                    icon: Play,
                  },
                  {
                    id: 'normas',
                    title: 'Normas de la casa',
                    sub: 'Silencio 23:00h, reciclaje y recogida de llaves',
                    icon: BookOpen,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedGuideItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setSelectedGuideItem(isSelected ? null : item.id)
                      }
                      className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-white/15 border-[#C85A32]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-white/10 text-[#C85A32] flex items-center justify-center shrink-0">
                          <Icon size={12} />
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-white/60 truncate">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#C85A32] font-bold shrink-0">
                        {isSelected ? 'Viendo' : 'Ver →'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tarjeta monetizable de extra: Late Check-out */}
              <div className="bg-[#FAF9F5] text-[#141413] p-3 rounded-2xl space-y-2 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-[#1F4E3D]">
                    <Clock size={11} /> Extra disponible hoy
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#C85A32]">
                    +35 €
                  </span>
                </div>
                <p className="text-xs font-bold leading-snug">
                  Late Check-out disponible hasta las 17:00h (+35 €)
                </p>
                <button
                  type="button"
                  onClick={() => setLateCheckoutBooked(!lateCheckoutBooked)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    lateCheckoutBooked
                      ? 'bg-[#1F4E3D] text-white'
                      : 'bg-[#C85A32] hover:bg-[#B04A25] text-white'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>
                    {lateCheckoutBooked
                      ? '✓ Salida a las 17:00h solicitada'
                      : 'Reservar salida tarde'}
                  </span>
                </button>
              </div>
            </div>

            <div className="w-28 h-1 bg-white/25 rounded-full mx-auto mt-1" />
          </div>
        )}
      </div>

      {/* 3. ACCIONES EXTERNAS DEBAJO DEL MÓVIL */}
      <div className="w-full bg-[#FAF9F5] border border-[#D5CFC0] rounded-2xl px-4 py-3 flex flex-col items-center text-center space-y-1 shadow-xs">
        <button
          type="button"
          onClick={handleOpenFullDemo}
          className="font-sans text-xs sm:text-sm font-bold text-[#141413] hover:text-[#C85A32] transition inline-flex items-center gap-1.5 group"
        >
          <span>Abrir demo real en pantalla completa</span>
          <ArrowUpRight
            size={15}
            className="text-[#C85A32] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </button>
        <p className="text-[11px] text-[#57554F]">
          Pruébalo sin registro ni descargas
        </p>
      </div>
    </div>
  );
}
