import React, { useState } from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface Props {
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'legal';
}

export default function LegalModal({ onClose, initialTab = 'privacy' }: Props) {
  const [tab, setTab] = useState<'privacy' | 'terms' | 'legal'>(initialTab);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] border border-[#141413] max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2DDD2] pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#C85A32]" />
            <h2 className="font-bold text-lg text-[#141413]">Avisos Legales · Turnexo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E8E4D9] flex items-center justify-center text-[#141413] hover:bg-[#141413] hover:text-white transition"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex gap-2 border-b border-[#E2DDD2] pb-3 shrink-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => setTab('privacy')}
            className={`px-3 py-1.5 font-bold uppercase transition ${
              tab === 'privacy' ? 'bg-[#141413] text-white' : 'text-[#57554F] hover:text-[#141413]'
            }`}
          >
            Privacidad
          </button>
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`px-3 py-1.5 font-bold uppercase transition ${
              tab === 'terms' ? 'bg-[#141413] text-white' : 'text-[#57554F] hover:text-[#141413]'
            }`}
          >
            Términos de Servicio
          </button>
          <button
            type="button"
            onClick={() => setTab('legal')}
            className={`px-3 py-1.5 font-bold uppercase transition ${
              tab === 'legal' ? 'bg-[#141413] text-white' : 'text-[#57554F] hover:text-[#141413]'
            }`}
          >
            Aviso Legal & Cookies
          </button>
        </div>

        <div className="overflow-y-auto flex-1 text-xs text-[#57554F] space-y-4 pr-1 leading-relaxed">
          {tab === 'privacy' && (
            <>
              <h3 className="font-bold text-sm text-[#141413]">1. Responsable del Tratamiento</h3>
              <p>
                Turnexo opera como plataforma SaaS de software para la gestión de alojamientos turísticos. No comercializamos ni cedemos datos a terceros con fines publicitarios.
              </p>

              <h3 className="font-bold text-sm text-[#141413]">2. Datos que tratamos</h3>
              <p>
                Tratamos únicamente los datos necesarios para la prestación del servicio: nombre, correo de registro, identificadores anónimos de reservas sincronizadas mediante iCal público (.ics) y fotografías de auditoría de limpieza subidas voluntariamente por los usuarios autorizados.
              </p>

              <h3 className="font-bold text-sm text-[#141413]">3. Sin almacenamiento de datos bancarios</h3>
              <p>
                Las suscripciones de los anfitriones se procesan de forma cifrada y segura a través de Stripe Inc. Turnexo nunca almacena números de tarjeta ni datos bancarios.
              </p>
            </>
          )}

          {tab === 'terms' && (
            <>
              <h3 className="font-bold text-sm text-[#141413]">1. Objeto del Servicio</h3>
              <p>
                Turnexo proporciona herramientas de sincronización de calendarios bajo demanda y generación de guías interactivas para huéspedes. El usuario es responsable de la veracidad de los datos introducidos sobre sus alojamientos.
              </p>

              <h3 className="font-bold text-sm text-[#141413]">2. Periodo de Prueba y Cancelación</h3>
              <p>
                Todos los planes incluyen 14 días de prueba gratuita. El usuario puede cancelar su suscripción en cualquier momento sin permanencia ni penalización.
              </p>

              <h3 className="font-bold text-sm text-[#141413]">3. Cobro de Extras</h3>
              <p>
                Turnexo no es intermediario de pagos entre huéspedes y anfitriones; el anfitrión cobra directamente sus servicios extras a través de los canales de su elección con 0% de comisión por parte de Turnexo.
              </p>
            </>
          )}

          {tab === 'legal' && (
            <>
              <h3 className="font-bold text-sm text-[#141413]">1. Titularidad del Sitio Web</h3>
              <p>
                Plataforma tecnológica Turnexo. Para cualquier consulta legal o técnica, puede contactarse a través del canal oficial hola@turnexo.com.
              </p>

              <h3 className="font-bold text-sm text-[#141413]">2. Política de Cookies</h3>
              <p>
                Este sitio web utiliza cookies técnicas estrictamente necesarias para el inicio de sesión y la conservación de la sesión segura del panel. No utilizamos cookies de rastreo publicitario invasivas de terceros.
              </p>
            </>
          )}
        </div>

        <div className="border-t border-[#E2DDD2] pt-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#141413] text-white font-mono text-xs font-bold uppercase px-5 py-2.5"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
