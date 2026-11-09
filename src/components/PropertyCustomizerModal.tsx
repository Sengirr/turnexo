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
  const [newVideoCategory, setNewVideoCategory] = useState<PropertyVideo['category']>('hometour');
  const [newVideoUrl, setNewVideoUrl] = useState('');

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
              { id: 'general', label: 'Horarios, WiFi y Módulos', icon: Clock },
              { id: 'videos', label: `Vídeos y Home Tour (${draft.videos?.length || 0})`, icon: Video },
              { id: 'extras', label: `Extras y Upsell (${draft.extras?.length || 0})`, icon: Sparkles },
              { id: 'rules', label: 'Normas y Guía Casa', icon: BookOpen },
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
              {/* Activación de los 2 módulos por separado */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-2.5">
                <p className="font-black text-indigo-950 uppercase tracking-wider text-[11px]">
                  Módulos activos en este alojamiento
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-indigo-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.modulesEnabled.cleanings}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          modulesEnabled: {
                            ...draft.modulesEnabled,
                            cleanings: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded text-indigo-600"
                    />
                    <div>
                      <p className="font-black text-slate-900">Módulo 1: Limpiezas por iCal</p>
                      <p className="text-[11px] text-slate-500">Turnos automáticos y fotos</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-indigo-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.modulesEnabled.guestGuide}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          modulesEnabled: {
                            ...draft.modulesEnabled,
                            guestGuide: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded text-indigo-600"
                    />
                    <div>
                      <p className="font-black text-slate-900">Módulo 2: Guía del Huésped + Extras</p>
                      <p className="text-[11px] text-slate-500">QR, vídeos, normas y Late Check-out</p>
                    </div>
                  </label>
                </div>
              </div>

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

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora Check-in</label>
                  <input
                    type="time"
                    value={draft.checkInTime}
                    onChange={(e) => setDraft({ ...draft, checkInTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora Check-out</label>
                  <input
                    type="time"
                    value={draft.checkOutTime}
                    onChange={(e) => setDraft({ ...draft, checkOutTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora Late Check-out</label>
                  <input
                    type="time"
                    value={draft.lateCheckoutUntil}
                    onChange={(e) => setDraft({ ...draft, lateCheckoutUntil: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio Late Out (€)</label>
                  <input
                    type="number"
                    value={draft.lateCheckoutPrice}
                    onChange={(e) =>
                      setDraft({ ...draft, lateCheckoutPrice: Number(e.target.value) })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarifa Limpieza (€)</label>
                  <input
                    type="number"
                    value={draft.cleaningFee}
                    onChange={(e) => setDraft({ ...draft, cleaningFee: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold"
                  />
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

              <div>
                <label className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.requireVideoToUnlockCodes !== false}
                    onChange={(e) =>
                      setDraft({ ...draft, requireVideoToUnlockCodes: e.target.checked })
                    }
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <div>
                    <p className="font-black text-slate-900">Desbloquear códigos tras ver vídeo</p>
                    <p className="text-[11px] text-slate-500">Difumina el código de buzón/portero hasta reproducir el vídeo</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Instrucciones de Entrada (Pestaña Llegada)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.checkInInstructions}
                    onChange={(e) => setDraft({ ...draft, checkInInstructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Instrucciones de Salida (Pestaña Salida)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.checkOutInstructions || ''}
                    placeholder="Ej. Dejar llaves en la mesa, apagar AC y luces..."
                    onChange={(e) => setDraft({ ...draft, checkOutInstructions: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'videos' && (
            <div className="space-y-4">
              <p className="text-slate-500">
                Añade vídeos de YouTube, Shorts, Google Drive o enlaces directos para explicar el Check-in paso a paso, enseñar el Home Tour del piso o cómo funcionan los electrodomésticos.
              </p>

              <div className="space-y-2">
                {(draft.videos || []).map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600">
                        {v.category === 'checkin'
                          ? 'LLEGADA / CHECK-IN'
                          : v.category === 'hometour'
                          ? 'HOME TOUR (INICIO)'
                          : 'GUÍA DE LA CASA / ELECTRODOMÉSTICOS'}
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
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <p className="font-black text-slate-800">Añadir nuevo vídeo a la Guía</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    placeholder="Título (ej. Acceso Vivienda / Vitrocerámica)"
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
                    <option value="appliance">Electrodomésticos (Guía)</option>
                    <option value="other">Otro (Guía)</option>
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
            </div>
          )}

          {tab === 'extras' && (
            <div className="space-y-4">
              <p className="text-slate-500">
                Configura qué extras ofreces en este apartamento (Late Check-out, Parking, Cuna, Trona, Pack Bienvenida...). El huésped los solicita desde la pestaña Extras y tú los apruebas en 1 clic.
              </p>

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
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guía rápida de Electrodomésticos (Aire, Vitro, Lavadora, Termo...)
                </label>
                <textarea
                  rows={3}
                  value={draft.appliancesGuide}
                  onChange={(e) => setDraft({ ...draft, appliancesGuide: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                />
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

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700">
                  Checklist de Salida del Huésped (Pestaña Salida · Antes de marcharte...)
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
