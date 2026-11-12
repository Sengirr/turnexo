import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Home,
  Plus,
  Send,
  Calendar,
  ArrowLeft,
  ChevronRight,
  User,
  Sparkles,
  MapPin,
  Play,
  Square,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Cleaner, CleaningTask, Property, ChecklistItem } from '../lib/icalParser';
import { compressCleanerPhoto } from '../lib/imageCompressor';

interface Props {
  cleaners: Cleaner[];
  selectedCleanerId: string;
  onSelectCleaner: (id: string) => void;
  tasks: CleaningTask[];
  properties: Property[];
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onAddPhoto: (taskId: string, photoUrl: string) => void;
  onAddItemPhoto?: (taskId: string, itemId: string, photoUrl: string) => void;
  onDeleteItemPhoto?: (taskId: string, itemId: string, photoIndex: number) => void;
  onStartTask?: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAddIncident: (taskId: string, text: string, photoUrl?: string) => void;
  onBackToApp?: () => void;
}

export default function CleanerMagicView({
  cleaners,
  selectedCleanerId,
  onSelectCleaner,
  tasks,
  properties,
  onToggleChecklistItem,
  onAddPhoto,
  onAddItemPhoto,
  onDeleteItemPhoto,
  onStartTask,
  onCompleteTask,
  onAddIncident,
  onBackToApp,
}: Props) {
  const cleaner = cleaners.find((c) => c.id === selectedCleanerId) || cleaners[0];
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [incidentText, setIncidentText] = useState('');
  const [incidentPhoto, setIncidentPhoto] = useState<string | null>(null);
  const [isCompressingIncident, setIsCompressingIncident] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<Record<string, number>>({});
  const [filterMissing, setFilterMissing] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
  const timerRef = useRef<any>(null);

  // Tareas asignadas a esta limpiadora ordenadas cronológicamente por fecha
  const myTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.cleanerId === cleaner.id)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [tasks, cleaner.id]
  );
  const activeTask = myTasks.find((t) => t.id === activeTaskId);
  const completedCount = myTasks.filter((t) => t.status === 'completed').length;

  const getTaskSeconds = (task?: CleaningTask) => {
    if (!task) return 0;
    if (task.status === 'completed' && task.actualHours) {
      return Math.round(task.actualHours * 3600);
    }
    if (task.status === 'in_progress') {
      const startMs = task.startTime ? new Date(task.startTime).getTime() : 0;
      if (startMs > 0) {
        return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      }
    }
    return elapsedSeconds[task.id] || 0;
  };

  const formatTaskDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const today = new Date();
    const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowYMD = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    if (dateStr === todayYMD) return 'Hoy';
    if (dateStr === tomorrowYMD) return 'Mañana';

    const formatted = dateObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Formato de fecha en español idéntico a IVI ERP
  const todayFormatted = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const todayCapitalized = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Temporizador en vivo para tareas en progreso
  useEffect(() => {
    // Si alguna tarea está en_progress pero no tiene startTime, asegurar que se guarde
    myTasks.forEach((t) => {
      if (t.status === 'in_progress' && !t.startTime) {
        t.startTime = new Date().toISOString();
        if (onStartTask) onStartTask(t.id);
      }
    });

    const tick = () => {
      setElapsedSeconds(() => {
        const next: Record<string, number> = {};
        myTasks.forEach((t) => {
          if (t.status === 'in_progress') {
            const startMs = t.startTime ? new Date(t.startTime).getTime() : Date.now();
            next[t.id] = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          }
        });
        return next;
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [myTasks, onStartTask]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileChange = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await compressCleanerPhoto(file);
      onAddPhoto(taskId, dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onAddPhoto(taskId, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleStartCleaning = (task: CleaningTask) => {
    const nowIso = new Date().toISOString();
    task.status = 'in_progress';
    task.startTime = task.startTime || nowIso;
    if (onStartTask) {
      onStartTask(task.id);
    }
    setElapsedSeconds((prev) => ({ ...prev, [task.id]: 0 }));
  };

  const handleFinishCleaning = (task: CleaningTask) => {
    // Validación idéntica a IVI ERP: ¿Faltan tareas o fotos obligatorias?
    const pendingItems = task.checklist.filter((i) => !i.completed);
    const missingPhotoItems = task.checklist.filter(
      (i) => i.photoRequired && (!i.photos || i.photos.length === 0)
    );

    if (pendingItems.length > 0) {
      alert(`⚠️ Faltan ${pendingItems.length} tareas por completar en el checklist.`);
      setFilterMissing(true);
      return;
    }

    if (missingPhotoItems.length > 0) {
      alert(`📸 Hay ${missingPhotoItems.length} tarea(s) con foto obligatoria que aún no tienen foto subida. Sube la foto directamente en el item antes de finalizar.`);
      setFilterMissing(true);
      return;
    }

    if (confirm('¿Seguro que deseas finalizar esta limpieza?')) {
      onCompleteTask(task.id);
      setActiveTaskId(null);
    }
  };

  const handleItemFileChange = async (
    taskId: string,
    itemId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingItemId(itemId);
    try {
      let photoUrl = '';
      try {
        const { dataUrl } = await compressCleanerPhoto(file);
        photoUrl = dataUrl;
      } catch {
        photoUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      if (onAddItemPhoto) {
        onAddItemPhoto(taskId, itemId, photoUrl);
      }
    } catch (err) {
      console.error('Error subiendo foto de item:', err);
      alert('Error al procesar la foto');
    } finally {
      setUploadingItemId(null);
      e.target.value = '';
    }
  };

  const handleItemClick = (item: ChecklistItem) => {
    // Si exige foto obligatoria y no tiene fotos aún, abrir la cámara/subida en vez de marcarla
    if (item.photoRequired && (!item.photos || item.photos.length === 0)) {
      const inputEl = document.getElementById(`file-item-${item.id}`) as HTMLInputElement | null;
      if (inputEl) {
        inputEl.click();
      }
      return;
    }
    if (activeTask) {
      onToggleChecklistItem(activeTask.id, item.id);
    }
  };

  const handleIncidentPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingIncident(true);
    try {
      const { dataUrl } = await compressCleanerPhoto(file);
      setIncidentPhoto(dataUrl);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setIncidentPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingIncident(false);
      e.target.value = '';
    }
  };

  const handleSendIncident = (taskId: string) => {
    if (!incidentText.trim() && !incidentPhoto) return;
    onAddIncident(
      taskId,
      incidentText.trim() || 'Incidencia fotográfica',
      incidentPhoto || undefined
    );
    setIncidentText('');
    setIncidentPhoto(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 antialiased">
      {/* VISTA 1: DASHBOARD PRINCIPAL DE TAREAS (IVI ERP) */}
      {!activeTaskId && (
        <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
          {/* Header con saludo idéntico a IVI ERP */}
          <header className="space-y-1">
            <p className="text-[11px] font-black tracking-widest uppercase text-emerald-600">
              TURNEXO CLEANING APP
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hola, {cleaner.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm font-medium text-slate-500">{todayCapitalized}</p>
          </header>

          {/* Tarjeta de Progreso del Día */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tareas de Hoy
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {completedCount} <span className="text-slate-400 text-lg font-bold">/ {myTasks.length}</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={24} />
              </div>
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${myTasks.length > 0 ? (completedCount / myTasks.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Lista de Tareas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Alojamientos Asignados
              </h2>
              <span className="text-xs font-bold bg-slate-200/80 text-slate-700 px-2.5 py-0.5 rounded-full">
                {myTasks.length} {myTasks.length === 1 ? 'piso' : 'pisos'}
              </span>
            </div>

            {myTasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border-dashed border-2 border-slate-200 space-y-3">
                <Calendar size={40} className="mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">No hay tareas asignadas para hoy.</p>
                <p className="text-xs text-slate-400">
                  Cuando el anfitrión tenga una salida programada, aparecerá aquí automáticamente.
                </p>
              </div>
            ) : (
              myTasks.map((task) => {
                const prop = properties.find((p) => p.id === task.propertyId);
                const isCompleted = task.status === 'completed';
                const isInProgress = task.status === 'in_progress';
                const taskSeconds = getTaskSeconds(task);

                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    className={`rounded-3xl p-5 border transition-all cursor-pointer active:scale-[0.99] relative overflow-hidden ${
                      isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200 shadow-sm'
                        : isInProgress
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Icono de estado */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-600'
                            : isInProgress
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={24} />
                        ) : isInProgress ? (
                          <Clock size={24} className="animate-pulse" />
                        ) : (
                          <Home size={22} />
                        )}
                      </div>

                      {/* Info de la propiedad */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3
                              className={`text-base font-extrabold truncate ${
                                isCompleted ? 'text-emerald-950' : 'text-slate-900'
                              }`}
                            >
                              {prop?.name || 'Alojamiento'}
                            </h3>
                            {/* Badge PAX idéntico a IVI ERP (solo si se conoce) */}
                            {task.pax ? (
                              <span className="text-[11px] font-black bg-slate-900/5 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                <User size={10} strokeWidth={3} className="text-slate-400" />
                                {task.pax}
                              </span>
                            ) : null}
                          </div>

                          {/* Fecha de la limpieza prominente */}
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                              formatTaskDate(task.date) === 'Hoy'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                : 'bg-orange-50 text-orange-800 border border-orange-200/80'
                            }`}
                          >
                            <Calendar
                              size={12}
                              className={
                                formatTaskDate(task.date) === 'Hoy'
                                  ? 'text-emerald-600'
                                  : 'text-orange-600'
                              }
                            />
                            <span>{formatTaskDate(task.date)}</span>
                          </div>
                        </div>

                        {/* Fila de Horarios estilo IVI ERP */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {/* Salida */}
                          <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              task.lateCheckoutActive
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            <span className="text-[9px] uppercase font-black opacity-60">
                              {task.lateCheckoutActive ? 'LATE OUT' : 'SALIDA'}
                            </span>
                            <span>{task.scheduledCleaningTime}h</span>
                          </div>

                          <span className="text-slate-300 font-bold text-xs">→</span>

                          {/* Entrada */}
                          <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              task.sameDayCheckIn
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="text-[9px] uppercase font-black opacity-60">
                              ENTRADA
                            </span>
                            <span>{task.sameDayCheckIn ? `${task.nextCheckInTime}h` : '-'}</span>
                          </div>

                          {/* Badge de Rotación Misma Día */}
                          {task.sameDayCheckIn && (
                            <span className="text-[10px] font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Flame size={11} className="text-orange-600" /> MISMO DÍA
                            </span>
                          )}
                        </div>

                        {/* Indicador de estado */}
                        <div className="mt-2.5 flex items-center gap-2 text-xs">
                          {isCompleted ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 size={13} /> Limpieza finalizada
                            </span>
                          ) : isInProgress ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                              <Clock size={13} /> En progreso · {formatTimer(taskSeconds)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">
                              {task.checklist.filter((i) => i.completed).length}/
                              {task.checklist.length} tareas completadas
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={20} className="text-slate-300 shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: DETALLE DE TAREA / CHECKLIST OPERATIVO (IVI ERP TaskDetail) */}
      {activeTaskId && activeTask && (
        <div className="max-w-md mx-auto px-4 pt-4 space-y-5">
          {/* Botón Volver */}
          <button
            type="button"
            onClick={() => {
              setActiveTaskId(null);
              setFilterMissing(false);
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs transition"
          >
            <ArrowLeft size={16} />
            Volver a Tareas de Hoy
          </button>

          {/* Ficha del Alojamiento */}
          {(() => {
            const prop = properties.find((p) => p.id === activeTask.propertyId);
            const isCompleted = activeTask.status === 'completed';
            const isInProgress = activeTask.status === 'in_progress';
            const taskSeconds = getTaskSeconds(activeTask);

            // Agrupar items de checklist por categoría como en IVI ERP
            const categories = Array.from(
              new Set(activeTask.checklist.map((i) => i.category || 'General'))
            );

            return (
              <div className="space-y-5">
                {/* Cabecera del Alojamiento */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 border border-orange-200/80 text-[11px] font-black px-2.5 py-0.5 rounded-lg">
                          <Calendar size={12} className="text-orange-600" />
                          {formatTaskDate(activeTask.date)}
                        </span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          PARTE DE TRABAJO
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        {prop?.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        {prop?.address}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCompleted ? 'Completada' : isInProgress ? 'En Progreso' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Enlaces de ayuda y navegación */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                    {prop?.googleMapsUrl ? (
                      <a
                        href={prop.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                      >
                        <MapPin size={13} className="text-orange-600" />
                        Ver en Google Maps
                      </a>
                    ) : (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          prop?.address || prop?.name || ''
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                      >
                        <MapPin size={13} className="text-orange-600" />
                        Ver en Google Maps
                      </a>
                    )}
                  </div>

                  {/* Notas internas de recepción o limpieza asignadas a esta tarea */}
                  {activeTask.notes && (
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800 block">
                        Notas de Recepción:
                      </span>
                      <p className="leading-relaxed">{activeTask.notes}</p>
                    </div>
                  )}
                </div>

                {/* BARRA DE ACCIÓN Y CRONÓMETRO IDÉNTICA A IVI ERP */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                        ESTADO DE LA LIMPIEZA
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {isCompleted
                          ? 'Servicio Completado'
                          : isInProgress
                          ? `En Curso · ${formatTimer(taskSeconds)}`
                          : 'Listo para Iniciar'}
                      </span>
                    </div>

                    {isInProgress && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-mono text-sm font-black flex items-center gap-1.5 border border-emerald-200">
                        <Clock size={16} className="animate-spin text-emerald-600" />
                        {formatTimer(taskSeconds)}
                      </div>
                    )}
                  </div>

                  {/* Botones de Inicio / Parada */}
                  {!isCompleted && !isInProgress && (
                    <button
                      type="button"
                      onClick={() => handleStartCleaning(activeTask)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
                    >
                      <Play size={18} fill="currentColor" />
                      Iniciar Limpieza (Pulsar al entrar)
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      type="button"
                      onClick={() => handleFinishCleaning(activeTask)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
                    >
                      <CheckCircle2 size={18} />
                      Finalizar Limpieza y Salir
                    </button>
                  )}

                  {isCompleted && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Limpieza finalizada y registrada correctamente
                    </div>
                  )}
                </div>

                {/* CHECKLIST POR CATEGORÍAS (Cocina, Salón, Dormitorio, Baño, Extras) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        Protocolo de Limpieza & Fotos
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeTask.checklist.filter((i) => i.completed).length} de{' '}
                        {activeTask.checklist.length} tareas completadas
                      </p>
                    </div>

                    {/* Botón subir foto rápida */}
                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition">
                      <Camera size={14} />
                      <span>Subir Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(activeTask.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Galería de fotos subidas */}
                  {activeTask.photosUploaded.length > 0 && (
                    <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                      <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                        Fotos de Comprobación ({activeTask.photosUploaded.length})
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {activeTask.photosUploaded.map((url, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-2xl overflow-hidden border border-slate-200 relative group bg-slate-100"
                          >
                            <img
                              src={url}
                              alt={`Foto comprobación ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías de checklist */}
                  {categories.map((category) => {
                    const items = activeTask.checklist.filter(
                      (i) => (i.category || 'General') === category
                    );
                    const completedCatCount = items.filter((i) => i.completed).length;

                    return (
                      <div
                        key={category}
                        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
                      >
                        {/* Cabecera de Categoría */}
                        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                            {category}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            {completedCatCount}/{items.length}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-slate-100">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3.5 transition hover:bg-slate-50/80 ${
                                item.completed ? 'bg-slate-50/40 text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              <div
                                onClick={() => handleItemClick(item)}
                                className="flex items-start gap-3 cursor-pointer"
                              >
                                {/* Checkbox táctil */}
                                <div
                                  className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition ${
                                    item.completed
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : item.photoRequired &&
                                        (!item.photos || item.photos.length === 0)
                                      ? 'bg-amber-50/80 border-amber-300 text-amber-600'
                                      : 'bg-white border-slate-300'
                                  }`}
                                  title={
                                    item.photoRequired &&
                                    (!item.photos || item.photos.length === 0)
                                      ? 'Requiere subir foto para completarse'
                                      : ''
                                  }
                                >
                                  {item.completed ? (
                                    <CheckCircle2 size={14} />
                                  ) : item.photoRequired &&
                                    (!item.photos || item.photos.length === 0) ? (
                                    <Camera size={11} className="text-amber-600" />
                                  ) : null}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <span
                                    className={`text-xs font-bold leading-snug block ${
                                      item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                                    }`}
                                  >
                                    {item.label}
                                  </span>

                                  {item.photoRequired && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md mt-1">
                                      <Camera size={10} /> Foto obligatoria
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Zona de subida y visualización de fotos por item */}
                              {(item.photoRequired || (item.photos && item.photos.length > 0)) && (
                                <div
                                  className="mt-3 pl-8 flex flex-wrap items-center gap-2.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.photos?.map((photoUrl, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs"
                                    >
                                      <img
                                        src={photoUrl}
                                        alt={`Foto ${item.label}`}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                                        onClick={() =>
                                          setPreviewPhoto({ url: photoUrl, title: item.label })
                                        }
                                      />
                                      {onDeleteItemPhoto && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onDeleteItemPhoto(activeTask.id, item.id, pIdx)
                                          }
                                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition"
                                          title="Eliminar foto"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      )}
                                    </div>
                                  ))}

                                  <label
                                    className={`w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition shrink-0 ${
                                      uploadingItemId === item.id
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                        : item.photoRequired && (!item.photos || item.photos.length === 0)
                                        ? 'border-amber-300 hover:border-amber-400 bg-amber-50/50 text-amber-700'
                                        : 'border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-slate-400 hover:text-emerald-600'
                                    }`}
                                  >
                                    {uploadingItemId === item.id ? (
                                      <Clock size={18} className="animate-spin text-emerald-600" />
                                    ) : (
                                      <Camera size={18} />
                                    )}
                                    <span className="text-[9px] font-black uppercase mt-1">
                                      {uploadingItemId === item.id ? 'Subiendo' : 'Subir'}
                                    </span>
                                    <input
                                      id={`file-item-${item.id}`}
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      disabled={uploadingItemId !== null}
                                      onChange={(e) =>
                                        handleItemFileChange(activeTask.id, item.id, e)
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* REPORTE DE INCIDENCIAS */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Reportar Incidencia o Rotura
                  </h4>
                  <p className="text-xs text-slate-500">
                    Si falta algo, encuentras un desperfecto o necesitas reposición urgente, déjalo
                    aquí anotado y adjunta foto si es necesario.
                  </p>

                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={incidentText}
                        onChange={(e) => setIncidentText(e.target.value)}
                        placeholder="Ej: Faltan pastillas lavavajillas o bombilla fundida..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                      />

                      {/* Botón de Cámara para adjuntar foto a la incidencia */}
                      <label
                        className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition shrink-0 ${
                          incidentPhoto
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : 'bg-slate-50 border-slate-200 hover:border-emerald-500 text-slate-500 hover:text-emerald-600'
                        }`}
                        title="Hacer foto de la rotura / desperfecto"
                      >
                        {isCompressingIncident ? (
                          <Clock size={16} className="animate-spin text-emerald-600" />
                        ) : (
                          <Camera size={16} />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          disabled={isCompressingIncident}
                          onChange={handleIncidentPhotoChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleSendIncident(activeTask.id)}
                        disabled={!incidentText.trim() && !incidentPhoto}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shrink-0"
                      >
                        Enviar
                      </button>
                    </div>

                    {/* Previsualización de la foto seleccionada antes de enviar */}
                    {incidentPhoto && (
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <img
                            src={incidentPhoto}
                            alt="Foto incidencia previa"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setIncidentPhoto(null)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">
                          Foto adjunta lista para enviar
                        </span>
                      </div>
                    )}
                  </div>

                  {activeTask.incidents.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {activeTask.incidents.map((inc) => (
                        <div
                          key={inc.id}
                          className="text-xs bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-slate-800 font-medium leading-relaxed">
                              {inc.text}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {inc.createdAt}
                            </span>
                          </div>
                          {inc.photoUrl && (
                            <div
                              className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer bg-slate-100 hover:scale-105 transition shadow-2xs"
                              onClick={() =>
                                setPreviewPhoto({ url: inc.photoUrl!, title: inc.text })
                              }
                            >
                              <img
                                src={inc.photoUrl}
                                alt="Foto incidencia"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTÓN FLOTANTE / INFERIOR PARA FINALIZAR */}
                {!isCompleted && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleFinishCleaning(activeTask)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-4 rounded-3xl shadow-lg transition flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
                    >
                      <CheckCircle2 size={18} />
                      Finalizar Limpieza de este Alojamiento
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Lightbox / Modal de Previsualización de Foto a Pantalla Completa */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white pb-3 px-1">
              <span className="text-sm font-bold truncate text-slate-200">
                {previewPhoto.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
              >
                Cerrar ✕
              </button>
            </div>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
