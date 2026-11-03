import React from 'react';
import { Check, Sparkles, ShieldCheck, Zap, QrCode, Users } from 'lucide-react';

export default function SaaSPricingModal({ onClose }: { onClose: () => void }) {
  const plans = [
    {
      name: 'Plan Starter',
      price: '0 €',
      period: '/mes de por vida',
      subtitle: 'Para 1 Alojamiento Turístico',
      icon: QrCode,
      features: [
        'Guía Digital del Huésped completa (WiFi, códigos, vídeos, normas)',
        'Sincronización iCal automática con Airbnb y Booking',
        'Enlace móvil en español para 1 limpiadora (sin contraseñas)',
        'Catálogo de extras y venta de Late Check-out directa',
        'Con sello "Powered by Turnexo"',
      ],
      highlighted: false,
    },
    {
      name: 'Plan Pro',
      price: '29 €',
      period: '/mes tarifa plana total',
      subtitle: 'Hasta 4 Alojamientos (~7,25€/piso)',
      icon: Users,
      features: [
        'Hasta 4 alojamientos sincronizados por iCal',
        'Guías Digitales 100% personalizadas sin marca Turnexo',
        'Cuadrante automático de salidas y alertas de rotación',
        'Limpiadoras ilimitadas con checklist y fotos WebP',
        'Monetización de Late Check-out (0% comisión, 100% para ti)',
      ],
      highlighted: false,
    },
    {
      name: 'Plan Gestor',
      price: '49 €',
      period: '/mes tarifa plana total',
      subtitle: 'Hasta 8 Alojamientos (~6,12€/piso)',
      icon: Sparkles,
      features: [
        'Hasta 8 alojamientos turísticos incluidos',
        'Conexión total: reprogramación automática de turnos en 1 clic',
        'Liquidación de honorarios y exportación de nóminas/pagos en CSV',
        'Despacho de turnos por WhatsApp en un toque',
        'Soporte prioritario para anfitriones y superhosts',
      ],
      highlighted: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              <Zap size={13} />
              Módulos Independientes o Pack Completo
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Elige solo el módulo que necesites o combínalos
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Con un solo Late Check-out o extra que vendas desde tu Guía Digital ya has pagado todo el mes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2.5 py-1.5 rounded-lg"
          >
            Cerrar ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.name}
                className={`rounded-3xl p-6 border flex flex-col justify-between ${
                  p.highlighted
                    ? 'bg-slate-900 text-white border-indigo-500 shadow-xl scale-[1.02]'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Icon size={15} className={p.highlighted ? 'text-indigo-400' : 'text-indigo-600'} />
                      {p.name}
                    </span>
                    {p.highlighted && (
                      <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-4xl font-black">{p.price}</span>
                    <span className={`text-xs ${p.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                      {p.period}
                    </span>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        p.highlighted ? 'text-indigo-300' : 'text-indigo-600'
                      }`}
                    >
                      {p.subtitle}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {p.features.map((f, i) => (
                      <li key={i} className="text-xs flex items-start gap-2">
                        <Check
                          size={15}
                          className={`shrink-0 mt-0.5 ${
                            p.highlighted ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                        <span className={p.highlighted ? 'text-slate-200' : 'text-slate-700'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className={`mt-6 w-full py-3 rounded-2xl text-xs font-black transition ${
                    p.highlighted
                      ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Probar 14 días gratis
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <span className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            Sin permanencia ni soporte técnico complejo: pega tu enlace .ics de Airbnb o Booking y empieza en 1 minuto.
          </span>
        </div>
      </div>
    </div>
  );
}
