import React, { useState } from 'react';
import {
  Clock,
  Video,
  Sparkles,
  BookOpen,
  CheckSquare,
  Plus,
  Trash2,
  Save,
  ExternalLink,
} from 'lucide-react';
import { Cleaner, Property, PropertyExtra, PropertyVideo } from '../lib/icalParser';

interface Props {
  property: Property;
  cleaners?: Cleaner[];
  onSave: (updated: Property) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

type EditorTab = 'general' | 'videos' | 'extras' | 'rules' | 'checklist';

const CHECKOUT_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00'
];

const CHECKIN_HOURS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '19:00', '20:00'
];

const LATE_CHECKOUT_HOURS = [
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function PropertyCustomizerModal({
  property,
  cleaners = [],
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<Property>(() => JSON.parse(JSON.stringify(property)));
  const [tab, setTab] = useState<EditorTab>('general');

  // Campos temporales para añadir vídeos, extras, normas, recomendaciones y checklist
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState<PropertyVideo['category']>('checkin');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newApplianceTitle, setNewApplianceTitle] = useState('');
  const [newApplianceUrl, setNewApplianceUrl] = useState('');

  const [newExtraTitle, setNewExtraTitle] = useState('');
  const [newExtraDesc, setNewExtraDesc] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState(25);
  const [newExtraUnit, setNewExtraUnit] = useState<PropertyExtra['priceUnit']>('reserva');
  const [newExtraIcon, setNewExtraIcon] = useState<PropertyExtra['icon']>('sparkles');
  const [newExtraOnlyFree, setNewExtraOnlyFree] = useState(false);

  const [newRule, setNewRule] = useState('');
  const [newRec, setNewRec] = useState('');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newDepartureItem, setNewDepartureItem] = useState('');

  const arrivalVideos = (draft.videos || []).filter(
    (v) => v.category === 'checkin' || v.category === 'hometour'
  );
  const applianceVideos = (draft.videos || []).filter(
    (v) => v.category === 'appliance' || v.category === 'other'
  );

  const addVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    setDraft({
      ...draft,
      videos: [
        ...(draft.videos || []),
        {
          id: `vid-${Date.now()}`,
          title: newVideoTitle.trim(),
          category: newVideoCategory,
          url: newVideoUrl.trim(),
        },
      ],
    });
    setNewVideoTitle('');
    setNewVideoUrl('');
  };

  const addApplianceVideo = () => {
    if (!newApplianceTitle.trim() || !newApplianceUrl.trim()) return;
    setDraft({
      ...draft,
      videos: [
        ...(draft.videos || []),
        {
          id: `vid-${Date.now()}`,
          title: newApplianceTitle.trim(),
          category: 'appliance',
          url: newApplianceUrl.trim(),
        },
      ],
    });
    setNewApplianceTitle('');
    setNewApplianceUrl('');
  };

  const addExtra = () => {
    if (!newExtraTitle.trim()) return;
    setDraft({
      ...draft,
      extras: [
        ...(draft.extras || []),
        {
          id: `ext-${Date.now()}`,
          title: newExtraTitle.trim(),
          description: newExtraDesc.trim() || 'Solicítalo directamente desde tu guía.',
          price: Number(newExtraPrice) || 20,
          priceUnit: newExtraUnit,
          icon: newExtraIcon,
          onlyWhenFreeNextDay: newExtraOnlyFree,
          active: true,
        },
      ],
    });
    setNewExtraTitle('');
    setNewExtraDesc('');
    setNewExtraOnlyFree(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 shrink-0">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
              Editor Personalizable del Alojamiento
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-0.5">{draft.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2.5 py-1"
          >
            ✕
          </button>
        </div>

        {/* Pestañas del Editor */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0">
          {(
            [
              { id: 'general', label: 'Horarios, Acceso y WiFi', icon: Clock },
              { id: 'videos', label: `Vídeos de Llegada (${arrivalVideos.length})`, icon: Video },
              { id: 'rules', label: `Normas, Guía y Salida (${applianceVideos.length ? `${applianceVideos.length} vídeos` : 'Casa'})`, icon: BookOpen },
              { id: 'extras', label: `Extras y Upsell (${draft.extras?.length || 0})`, icon: Sparkles },
              { id: 'checklist', label: 'Checklist Limpieza', icon: CheckSquare },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                  tab === item.id
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5 text-xs">
          {tab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Alojamiento</label>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Anfitrión (Botón flotante)</label>
                  <input
                    value={draft.hostWhatsapp}
                    onChange={(e) => setDraft({ ...draft, hostWhatsapp: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dirección Completa</label>
                  <input
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Google Maps</label>
                  <input
                    value={draft.googleMapsUrl}
                    onChange={(e) => setDraft({ ...draft, googleMapsUrl: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL iCal Airbnb (.ics)</label>
                  <input
                    value={draft.airbnbIcalUrl}
                    onChange={(e) => setDraft({ ...draft, airbnbIcalUrl: e.target.value })}
                    placeholder="https://www.airbnb.es/calendar/ical/..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL iCal Booking (.ics)</label>
                  <input
                    value={draft.bookingIcalUrl}
                    onChange={(e) => setDraft({ ...draft, bookingIcalUrl: e.target.value })}
                    placeholder="https://ical.booking.com/v1/export..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Limpiadora Asignada por Defecto</label>
                  <select
                    value={draft.defaultCleanerId}
                    onChange={(e) => setDraft({ ...draft, defaultCleanerId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold bg-white"
                  >
                    {cleaners.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora Check-in</label>
                  <select
                    value={draft.checkInTime || '15:00'}
                    onChange={(e) => setDraft({ ...draft, checkInTime: e.target.value })}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  >
                    {draft.checkInTime && !CHECKIN_HOURS.includes(draft.checkInTime) && (
                      <option value={draft.checkInTime}>{draft.checkInTime}</option>
                    )}
                    {CHECKIN_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h} {h === '15:00' ? '(Estándar)' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 block mt-1">Llegada nuevo huésped</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora Check-out</label>
                  <select
                    value={draft.checkOutTime || '11:00'}
                    onChange={(e) => setDraft({ ...draft, checkOutTime: e.target.value })}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  >
                    {draft.checkOutTime && !CHECKOUT_HOURS.includes(draft.checkOutTime) && (
                      <option value={draft.checkOutTime}>{draft.checkOutTime}</option>
                    )}
                    {CHECKOUT_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h} {h === '11:00' ? '(Estándar)' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 block mt-1">Salida / inicio limpieza</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pago por limpieza (€) <span className="font-normal text-xs text-slate-400">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={draft.cleaningFee === 0 ? '' : draft.cleaningFee}
                    onChange={(e) => setDraft({ ...draft, cleaningFee: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Coste al personal (0 si sueldo fijo).</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre WiFi (SSID)</label>
                  <input
                    value={draft.wifiSsid}
                    onChange={(e) => setDraft({ ...draft, wifiSsid: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clave WiFi</label>
                  <input
                    value={draft.wifiPassword}
                    onChange={(e) => setDraft({ ...draft, wifiPassword: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Portero</label>
                  <input
                    value={draft.intercomCode || ''}
                    placeholder="Ej. 4ºA + Campana"
                    onChange={(e) => setDraft({ ...draft, intercomCode: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Buzón / Puerta</label>
                  <input
                    value={draft.doorCode}
                    onChange={(e) => setDraft({ ...draft, doorCode: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'videos' && (
            <div className="space-y-5">
              <p className="text-slate-500 text-xs">
                Gestiona los vídeos explicativos de la Guía Digital y la experiencia de llegada paso a paso del huésped.
              </p>

              {/* Experiencia de Llegada: Instrucciones y Seguridad de Códigos */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Experiencia de Llegada (Pestaña Check-in del Huésped)
                </span>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Instrucciones escritas de Entrada
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Introduce el código en el cajetín junto a la puerta principal..."
                    value={draft.checkInInstructions}
                    onChange={(e) => setDraft({ ...draft, checkInInstructions: e.target.value })}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Se muestran junto al vídeo de entrada en la pestaña «Llegada» de la guía del viajero.
                  </span>
                </div>

                <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-300 transition">
                  <input
                    type="checkbox"
                    checked={draft.requireVideoToUnlockCodes !== false}
                    onChange={(e) =>
                      setDraft({ ...draft, requireVideoToUnlockCodes: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Desbloquear códigos tras ver el vídeo</p>
                    <p className="text-[11px] text-slate-500">
                      Difumina los códigos del cajetín/cerradura en el móvil del huésped hasta que reproduzca el vídeo de entrada.
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Vídeos de Llegada y Bienvenida ({arrivalVideos.length})
                </span>
                {arrivalVideos.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600">
                        {v.category === 'checkin'
                          ? 'LLEGADA / ACCESO Y LLAVES'
                          : 'HOME TOUR (INICIO)'}
                      </span>
                      <p className="font-bold text-slate-900">{v.title}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">{v.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          videos: draft.videos.filter((item) => item.id !== v.id),
                        })
                      }
                      className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {arrivalVideos.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic">No hay vídeos de llegada configurados aún.</p>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="font-black text-slate-800">Añadir vídeo de Llegada o Bienvenida</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    placeholder="Título (ej. Cómo abrir el portal y cajetín)"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="sm:col-span-2 border border-slate-200 bg-white rounded-xl px-3 py-2"
                  />
                  <select
                    value={newVideoCategory}
                    onChange={(e) =>
                      setNewVideoCategory(e.target.value as PropertyVideo['category'])
                    }
                    className="border border-slate-200 bg-white rounded-xl px-3 py-2 font-bold"
                  >
                    <option value="checkin">Entrada / Llaves (Llegada)</option>
                    <option value="hometour">Home Tour (Inicio)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="URL de YouTube, Shorts o Drive (ej. https://www.youtube.com/watch?v=...)"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 font-mono"
                  />
                  <button
                    type="button"
                    onClick={addVideo}
                    className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <Plus size={14} /> Añadir
                  </button>
                </div>
              </div>

              {/* Banner informativo sobre electrodomésticos */}
              <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="text-base leading-none">💡</span>
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-bold">¿Tienes vídeos de electrodomésticos?</span> (Vitrocerámica, aire acondicionado, lavadora, termo...)
                  <p className="text-indigo-700 mt-0.5">
                    Se configuran en la pestaña{' '}
                    <button
                      type="button"
                      onClick={() => setTab('rules')}
                      className="underline font-bold text-indigo-900 hover:text-indigo-950"
                    >
                      «Normas, Guía y Salida»
                    </button>
                    , donde se muestran en la sección Guía de la casa del huésped.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'extras' && (
            <div className="space-y-4">
              <p className="text-slate-500 text-xs">
                Configura qué extras ofreces en este alojamiento (Late Check-out, Parking, Cuna, Trona, Pack Bienvenida...). El huésped los solicita desde su Guía Digital y tú los apruebas en 1 clic.
              </p>

              {/* Ajuste unificado del horario de Late Check-out */}
              <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Hora límite de Late Check-out</span>
                  <span className="text-slate-500 text-[11px]">Hora máxima de salida al aprobar el extra y nueva hora de limpieza.</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={draft.lateCheckoutUntil || '17:00'}
                    onChange={(e) => setDraft({ ...draft, lateCheckoutUntil: e.target.value })}
                    className="border border-slate-300 bg-white rounded-xl px-3 py-1.5 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
                  >
                    {draft.lateCheckoutUntil && !LATE_CHECKOUT_HOURS.includes(draft.lateCheckoutUntil) && (
                      <option value={draft.lateCheckoutUntil}>{draft.lateCheckoutUntil}</option>
                    )}
                    {LATE_CHECKOUT_HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h} {h === '17:00' ? '(Por la tarde)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {(draft.extras || []).map((ext) => (
                  <div
                    key={ext.id}
                    className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={ext.active}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            extras: draft.extras.map((item) =>
                              item.id === ext.id ? { ...item, active: e.target.checked } : item
                            ),
                          })
                        }
                        className="mt-1 h-4 w-4 rounded text-indigo-600"
                      />
                      <div>
                        <p className="font-black text-slate-900">
                          {ext.title} — <span className="text-emerald-600">{ext.price} € / {ext.priceUnit}</span>
                        </p>
                        <p className="text-slate-500">{ext.description}</p>
                        {ext.onlyWhenFreeNextDay && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            Inteligente: Solo se ofrece si no entra nadie ese día en el iCal
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          extras: draft.extras.filter((item) => item.id !== ext.id),
                        })
                      }
                      className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="font-black text-slate-800">Crear nuevo Extra / Upsell</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    placeholder="Nombre (ej. Plaza de Parking)"
                    value={newExtraTitle}
                    onChange={(e) => setNewExtraTitle(e.target.value)}
                    className="sm:col-span-2 border border-slate-200 bg-white rounded-xl px-3 py-2"
                  />
                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="€"
                      value={newExtraPrice}
                      onChange={(e) => setNewExtraPrice(Number(e.target.value))}
                      className="w-20 border border-slate-200 bg-white rounded-xl px-2.5 py-2 font-bold"
                    />
                    <select
                      value={newExtraUnit}
                      onChange={(e) =>
                        setNewExtraUnit(e.target.value as PropertyExtra['priceUnit'])
                      }
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-2 py-2 font-bold"
                    >
                      <option value="reserva">/ reserva</option>
                      <option value="día">/ día</option>
                      <option value="noche">/ noche</option>
                    </select>
                  </div>
                </div>
                <input
                  placeholder="Descripción breve para el huésped"
                  value={newExtraDesc}
                  onChange={(e) => setNewExtraDesc(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={newExtraOnlyFree}
                      onChange={(e) => setNewExtraOnlyFree(e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600"
                    />
                    <span>Ocultar automáticamente si ese día entran otros huéspedes (ej. Late Check-out)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addExtra}
                    className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    <Plus size={14} /> Añadir Extra
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'rules' && (
            <div className="space-y-4">
              {/* Guía de la Casa y Electrodomésticos */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Guía de la Casa y Electrodomésticos (Pestaña Guía del Huésped)
                </span>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Instrucciones escritas (Aire, Vitro, Lavadora, Termo...)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. El aire acondicionado se enciende con el mando blanco; la vitrocerámica tiene bloqueo de seguridad..."
                    value={draft.appliancesGuide}
                    onChange={(e) => setDraft({ ...draft, appliancesGuide: e.target.value })}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {/* Vídeos de Electrodomésticos */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <span className="font-bold text-slate-800 text-xs block">
                    Vídeos de Electrodomésticos y Uso ({applianceVideos.length})
                  </span>
                  {applianceVideos.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-purple-600">
                          ELECTRODOMÉSTICO / CASA
                        </span>
                        <p className="font-bold text-slate-900">{v.title}</p>
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-md">{v.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            videos: draft.videos.filter((item) => item.id !== v.id),
                          })
                        }
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {applianceVideos.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No hay vídeos de electrodomésticos aún.</p>
                  )}

                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
                    <p className="font-bold text-slate-800 text-xs">Añadir vídeo explicativo de electrodoméstico</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        placeholder="Título (ej. Encendido Vitrocerámica o Mando Aire)"
                        value={newApplianceTitle}
                        onChange={(e) => setNewApplianceTitle(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        placeholder="URL de YouTube, Shorts o Drive"
                        value={newApplianceUrl}
                        onChange={(e) => setNewApplianceUrl(e.target.value)}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addApplianceVideo}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus size={13} /> Añadir vídeo a la Guía
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Normas de la Casa</label>
                {draft.houseRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                    <span>• {rule}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          houseRules: draft.houseRules.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    placeholder="Nueva norma (ej. No fumar en todo el alojamiento)"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRule.trim()) return;
                      setDraft({ ...draft, houseRules: [...draft.houseRules, newRule.trim()] });
                      setNewRule('');
                    }}
                    className="bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Recomendaciones Locales (Restaurantes, Supermercados, Parking)
                </label>
                {draft.localRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                    <span>📍 {rec}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          localRecommendations: draft.localRecommendations.filter(
                            (_, idx) => idx !== i
                          ),
                        })
                      }
                      className="text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    placeholder="Nueva recomendación (ej. Supermercado Mercadona a 100m)"
                    value={newRec}
                    onChange={(e) => setNewRec(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRec.trim()) return;
                      setDraft({
                        ...draft,
                        localRecommendations: [...draft.localRecommendations, newRec.trim()],
                      });
                      setNewRec('');
                    }}
                    className="bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Experiencia de Salida (Pestaña Salida del Huésped)
                </span>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Instrucciones escritas de Salida
                  </label>
                  <textarea
                    rows={2}
                    value={draft.checkOutInstructions || ''}
                    placeholder="Ej. Dejar las llaves en la mesa del salón, apagar la climatización y luces..."
                    onChange={(e) => setDraft({ ...draft, checkOutInstructions: e.target.value })}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Se muestran en la pestaña «Salida» de la guía del viajero el día de su partida.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 text-xs">
                    Puntos de control para el huésped antes de salir
                  </label>
                {(draft.departureChecklist || [
                  'Apagar las luces',
                  'Apagar AC',
                  'Dejar las llaves encima de la mesa',
                  'Tirar la basura',
                ]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-orange-50/60 px-3 py-2 rounded-xl border border-orange-100">
                    <span>✓ {item}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const base = draft.departureChecklist || [
                          'Apagar las luces',
                          'Apagar AC',
                          'Dejar las llaves encima de la mesa',
                          'Tirar la basura',
                        ];
                        setDraft({
                          ...draft,
                          departureChecklist: base.filter((_, idx) => idx !== i),
                        });
                      }}
                      className="text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    placeholder="Nuevo recordatorio de salida (ej. Cerrar ventanas de la terraza)"
                    value={newDepartureItem}
                    onChange={(e) => setNewDepartureItem(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newDepartureItem.trim()) return;
                      const base = draft.departureChecklist || [
                        'Apagar las luces',
                        'Apagar AC',
                        'Dejar las llaves encima de la mesa',
                        'Tirar la basura',
                      ];
                      setDraft({
                        ...draft,
                        departureChecklist: [...base, newDepartureItem.trim()],
                      });
                      setNewDepartureItem('');
                    }}
                    className="bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl"
                  >
                    + Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {tab === 'checklist' && (
            <div className="space-y-3">
              <p className="text-slate-500">
                Personaliza las tareas exactas que tu limpiadora debe marcar al limpiar este apartamento:
              </p>
              {(draft.customChecklist || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2.5 rounded-xl">
                  <span className="font-medium text-slate-800">☑️ {item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        customChecklist: draft.customChecklist.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  placeholder="Nueva tarea de limpieza (ej. Revisar bombona de butano o limpiar barbacoa)"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCheckItem.trim()) return;
                    setDraft({
                      ...draft,
                      customChecklist: [...(draft.customChecklist || []), newCheckItem.trim()],
                    });
                    setNewCheckItem('');
                  }}
                  className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl"
                >
                  + Añadir Tarea
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie de guardado */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 shrink-0">
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(draft.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Eliminar</span>
              </button>
            )}
            <a
              href={`/g/${draft.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
            >
              <ExternalLink size={13} />
              <span>Ver Guía Huésped en Vivo</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Save size={15} />
              Guardar Cambios del Alojamiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
