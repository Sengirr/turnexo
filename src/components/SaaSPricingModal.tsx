import React from 'react';
import { Check, Sparkles, ShieldCheck, Zap, QrCode, Users, FileText } from 'lucide-react';

export default function SaaSPricingModal({ onClose }: { onClose: () => void }) {
  const plans = [
    {
      name: 'Plan Starter',
      price: '0 €',
      period: '/mes de por vida',
      subtitle: 'Para 1 Alojamiento Turístico',
      badge: '100% Gratis',
      icon: QrCode,
      features: [
        '1 Alojamiento turístico conectado',
        'Guía Digital del Huésped (WiFi, códigos de acceso, vídeos)',
        'Sincronización iCal automática con Airbnb y Booking',
        'Enlace móvil para tu personal de limpieza (sin contraseñas)',
        'Cartel QR listo para imprimir en la mesita',
        'Fotos de limpieza guardadas durante 7 días',
        'Con sello sutil "Powered by Turnexo"',
      ],
      highlighted: false,
      ctaText: 'Empezar Gratis sin Tarjeta',
    },
    {
      name: 'Plan Pro Fiscal',
      price: '19 €',
      period: '/mes tarifa plana total',
      subtitle: 'Hasta 5 Alojamientos (~3,80€/piso)',
      badge: '⭐ El más elegido · Ley IVA 10%',
      icon: FileText,
      features: [
        'Hasta 5 alojamientos turísticos',
        'Emisión ilimitada de Facturas Simplificadas (< 3.000 €)',
        'Cálculo automático de IVA 10% obligatorio (estancias < 30 días)',
        'Libro de IVA y resumen para el Modelo 303 de Hacienda (CSV/Excel)',
        'Guías Digitales 100% personalizadas SIN marca Turnexo',
        'Histórico fotográfico de auditoría de limpieza durante 1 año',
        'Alertas de rotación el mismo día y turnos por WhatsApp en 1 toque',
      ],
      highlighted: true,
      ctaText: 'Activar Plan Pro (14 días gratis)',
    },
    {
      name: 'Plan Pequeña Gestora',
      price: '39 €',
      period: '/mes tarifa plana total',
      subtitle: 'Hasta 10 Alojamientos (~3,90€/piso)',
      badge: 'Microgestores',
      icon: Users,
      features: [
        'Hasta 10 alojamientos turísticos incluidos',
        'Todo lo del Plan Pro Fiscal ilimitado',
        'Multi-serie de facturación por propietario / NIF',
        'Liquidación automática a personal de limpieza en CSV',
        'Despacho masivo de turnos por WhatsApp',
        'Soporte directo prioritario por WhatsApp',
      ],
      highlighted: false,
      ctaText: 'Probar Gestora 14 días gratis',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck size={14} />
              Adaptado a la nueva normativa de IVA 10% para estancias turísticas
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Planes simples para propietarios particulares y pequeñas gestoras
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Empieza 100% gratis con 1 piso. Activa el Plan Pro cuando necesites facturar legalmente con IVA 10% o gestionar varios alojamientos.
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
                className={`rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                  p.highlighted
                    ? 'bg-slate-900 text-white border-emerald-500 shadow-2xl ring-2 ring-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Icon size={16} className={p.highlighted ? 'text-emerald-400' : 'text-indigo-600'} />
                      {p.name}
                    </span>
                    {p.badge && (
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          p.highlighted
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {p.badge}
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
                        p.highlighted ? 'text-emerald-400' : 'text-slate-600'
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
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {p.ctaText}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <span className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            Sin permanencia ni configuraciones complejas. Emite facturas simplificadas legales al instante y exporta tu resumen para el Modelo 303 de Hacienda con 1 clic.
          </span>
        </div>
      </div>
    </div>
  );
}
