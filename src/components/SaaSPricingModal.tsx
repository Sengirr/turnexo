import React from 'react';
import { Check, Sparkles, ShieldCheck, Zap, QrCode, Users } from 'lucide-react';

export default function SaaSPricingModal({ onClose }: { onClose: () => void }) {
  const plans = [
    {
      name: 'Módulo Guía + Extras',
      price: '12 €',
      period: '/mes',
      subtitle: 'Solo Guía del Huésped (hasta 5 pisos)',
      icon: QrCode,
      features: [
        'Guía digital 100 % personalizable (horarios, WiFi, códigos, normas)',
        'Vídeos ilimitados de Check-in, Home Tour y electrodomésticos',
        'Catálogo de Extras (Late Check-out, Parking, Cuna, Mascota...)',
        'Cobro directo por ti en Airbnb o Bizum (0 % comisión)',
        'Generador de Cartel QR en PDF listo para imprimir',
      ],
      highlighted: false,
    },
    {
      name: 'Módulo Limpiezas iCal',
      price: '12 €',
      period: '/mes',
      subtitle: 'Solo Gestión de Limpiadoras (hasta 5 pisos)',
      icon: Users,
      features: [
        'Sincronización iCal automática con Airbnb, Booking y Vrbo',
        'Enlaces mágicos en español para limpiadoras (sin contraseñas)',
        'Aviso automático de rotación en el mismo día (🔥 ENTRADA HOY)',
        'Checklist personalizable por apartamento + Fotos de auditoría',
        'Cálculo automático de pagos semanales y reporte de roturas',
      ],
      highlighted: false,
    },
    {
      name: 'Pack Completo (Los 2)',
      price: '19 €',
      period: '/mes',
      subtitle: 'Guía Huésped + Limpiezas Conectadas',
      icon: Sparkles,
      features: [
        'Incluye los 2 módulos completos con 25 % de descuento',
        'Conexión inteligente: la Guía ofrece Late Check-out solo si el iCal ve que no entra nadie',
        'Al aprobar un Late Check-out en 1 clic, la hora de tu limpiadora cambia sola a las 17:00h',
        'Hasta 5 apartamentos incluidos (planes superiores para 15 o 30 pisos)',
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
