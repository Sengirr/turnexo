import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Home,
  Plus,
  Send,
  Wallet,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { Cleaner, CleaningTask, Property } from '../lib/icalParser';
import { compressCleanerPhoto } from '../lib/imageCompressor';

interface Props {
  cleaners: Cleaner[];
  selectedCleanerId: string;
  onSelectCleaner: (id: string) => void;
  tasks: CleaningTask[];
  properties: Property[];
  onToggleChecklistItem: (taskId: string, itemId: string) => void;
  onAddPhoto: (taskId: string, photoUrl: string) => void;
  onCompleteTask: (taskId: string) => void;
  onAddIncident: (taskId: string, text: string) => void;
  onBackToApp?: () => void;
}

const SAMPLE_CLEAN_PHOTOS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
];

export default function CleanerMagicView({
  cleaners,
  selectedCleanerId,
  onSelectCleaner,
  tasks,
  properties,
  onToggleChecklistItem,
  onAddPhoto,
  onCompleteTask,
  onAddIncident,
  onBackToApp,
}: Props) {
  const cleaner = cleaners.find((c) => c.id === selectedCleanerId) || cleaners[0];
  const [incidentDrafts, setIncidentDrafts] = useState<Record<string, string>>({});

  const myTasks = tasks.filter((task) => task.cleanerId === cleaner.id);
  const totalEarned = myTasks.reduce((acc, task) => acc + task.fee, 0);

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

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] pb-20">
      {/* Barra discreta de previsualización solo cuando se abre como demo */}
      {onBackToApp && (
        <div className="bg-[#141413] text-[#F6F4EE] border-b border-white/10 px-4 py-2.5 text-xs">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#C85A32] hover:underline font-bold"
            >
              <ArrowLeft size={14} />
              Volver a Turnexo
            </button>

            <select
              value={cleaner.id}
              onChange={(e) => onSelectCleaner(e.target.value)}
              className="bg-white/10 border border-white/20 text-white px-2.5 py-1 text-[11px] font-mono"
            >
              {cleaners.map((c) => (
                <option key={c.id} value={c.id} className="text-black">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Cabecera Operativa Móvil */}
        <div className="bg-[#141413] text-[#F6F4EE] px-6 pt-10 pb-8 border-b border-[#2C2C29]">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C85A32]">
            TURNEXO OPERACIONES · /c/{cleaner.magicToken}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">
            Hola, {cleaner.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            Parte de limpiezas actualizado en tiempo real
          </p>

          <div className="mt-6 bg-[#1E1E1C] border border-white/15 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1F4E3D] text-white flex items-center justify-center">
                <Wallet size={17} />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 block">
                  ACUMULADO SEMANAL
                </span>
                <span className="text-sm font-bold text-white">
                  {myTasks.length} servicios asignados
                </span>
              </div>
            </div>
            <span className="font-mono text-2xl font-bold text-white">{totalEarned} €</span>
          </div>
        </div>

        {/* Lista de Tareas */}
        <div className="px-4 pt-6 space-y-6">
          {myTasks.map((task) => {
            const prop = properties.find((p) => p.id === task.propertyId);
            if (!prop) return null;

            const allChecked = task.checklist.every((c) => c.completed);
            const hasEnoughPhotos = task.photosUploaded.length >= 1;

            return (
              <div
                key={task.id}
                className={`bg-[#FAF9F5] border-2 ${
                  task.sameDayCheckIn ? 'border-[#C85A32]' : 'border-[#D5CFC0]'
                }`}
              >
                {/* Franja de prioridad */}
                {task.sameDayCheckIn ? (
                  <div className="bg-[#C85A32] text-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Flame size={14} />
                      ENTRADA HOY · PRIORIDAD
                    </span>
                    <span>CHECK-IN {task.nextCheckInTime}H</span>
                  </div>
                ) : task.lateCheckoutActive ? (
                  <div className="bg-[#1F4E3D] text-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      LATE CHECK-OUT CONCEDIDO · ENTRAR A LAS {task.scheduledCleaningTime}H
                    </span>
                  </div>
                ) : (
                  <div className="bg-[#E8E4D9] text-[#57554F] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>SALIDA ESTÁNDAR · SIN ENTRADA HOY</span>
                    <span>+{task.fee} €</span>
                  </div>
                )}

                <div className="p-5 space-y-5">
                  <div className="flex items-start justify-between gap-2 border-b border-[#E2DDD2] pb-4">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#C85A32]">
                        <Calendar size={13} />
                        <span>{task.date}</span>
                      </div>
                      <h2 className="text-lg font-bold text-[#141413] mt-1 flex items-center gap-1.5">
                        <Home size={16} className="text-[#57554F] shrink-0" />
                        {prop.name}
                      </h2>
                      <p className="text-xs text-[#57554F] mt-0.5">{prop.address}</p>
                    </div>
                    <span className="font-mono text-xs font-bold bg-[#141413] text-white px-3 py-1.5 shrink-0">
                      {task.scheduledCleaningTime}h
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="bg-white border border-[#E2DDD2] p-4 space-y-2.5">
                    <p className="font-mono text-[10px] font-bold text-[#57554F] uppercase tracking-wider">
                      PROTOCOLO DE REVISIÓN
                    </p>
                    {task.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-2.5 py-1 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => onToggleChecklistItem(task.id, item.id)}
                          className="mt-0.5 h-4 w-4 accent-[#141413]"
                        />
                        <span
                          className={`text-xs leading-snug ${
                            item.completed
                              ? 'line-through text-[#57554F]/60'
                              : 'text-[#141413] font-medium'
                          }`}
                        >
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Fotos de comprobación */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#57554F] uppercase tracking-wider">
                        FOTOS DE VERIFICACIÓN ({task.photosUploaded.length})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase text-white bg-[#141413] hover:bg-[#2C2C29] px-3 py-1.5 transition">
                          <Camera size={13} />
                          <span>Cámara / Galería</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleFileChange(task.id, e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextImg =
                              SAMPLE_CLEAN_PHOTOS[
                                task.photosUploaded.length % SAMPLE_CLEAN_PHOTOS.length
                              ];
                            onAddPhoto(task.id, nextImg);
                          }}
                          className="font-mono text-[11px] font-bold border border-[#D5CFC0] bg-white px-2.5 py-1.5"
                        >
                          + Demo
                        </button>
                      </div>
                    </div>

                    {task.photosUploaded.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {task.photosUploaded.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt="Verificación"
                            className="h-20 w-full object-cover border border-[#D5CFC0]"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Incidencias */}
                  <div className="border-t border-[#E2DDD2] pt-4 space-y-2">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#57554F] flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-[#C85A32]" />
                      COMUNICAR DESPERFECTO O ROTURA
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={incidentDrafts[task.id] || ''}
                        onChange={(e) =>
                          setIncidentDrafts({ ...incidentDrafts, [task.id]: e.target.value })
                        }
                        placeholder="Ej: Vaso roto, mancha en sofá..."
                        className="flex-1 text-xs bg-white border border-[#D5CFC0] px-3 py-2 focus:outline-none focus:border-[#141413]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const txt = (incidentDrafts[task.id] || '').trim();
                          if (!txt) return;
                          onAddIncident(task.id, txt);
                          setIncidentDrafts({ ...incidentDrafts, [task.id]: '' });
                        }}
                        className="bg-[#C85A32] text-white font-mono text-xs font-bold uppercase px-3.5 py-2 flex items-center gap-1 shrink-0"
                      >
                        <Plus size={13} />
                        Enviar
                      </button>
                    </div>

                    {task.incidents.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {task.incidents.map((inc) => (
                          <div
                            key={inc.id}
                            className="text-xs bg-white border-l-2 border-[#C85A32] px-3 py-1.5 font-medium"
                          >
                            {inc.text}{' '}
                            <span className="font-mono text-[10px] text-[#57554F]">
                              ({inc.createdAt})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completar */}
                  {task.status === 'completed' ? (
                    <div className="w-full bg-[#1F4E3D] text-white font-mono text-xs font-bold uppercase tracking-wider py-3.5 flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} />
                      LIMPIEZA REGISTRADA CORRECTAMENTE
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onCompleteTask(task.id)}
                      className={`w-full font-mono text-xs font-bold uppercase tracking-wider py-4 flex items-center justify-center gap-2 transition ${
                        allChecked && hasEnoughPhotos
                          ? 'bg-[#1F4E3D] text-white'
                          : 'bg-[#141413] hover:bg-[#2C2C29] text-white'
                      }`}
                    >
                      <Send size={14} />
                      FINALIZAR Y ENVIAR REPORTE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
