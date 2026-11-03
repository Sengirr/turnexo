import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface Props {
  onOpenLegal: () => void;
}

export default function CookieBanner({ onOpenLegal }: Props) {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('turnexo_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('turnexo_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 bg-[#141413] text-[#F6F4EE] border border-white/20 p-4 shadow-2xl flex flex-col gap-3 font-sans text-xs">
      <div className="flex items-start gap-2.5">
        <ShieldCheck size={18} className="text-[#C85A32] shrink-0 mt-0.5" />
        <p className="text-white/80 leading-relaxed">
          Utilizamos cookies técnicas para garantizar el funcionamiento seguro de la plataforma. Puedes consultar los detalles en nuestra{' '}
          <button
            type="button"
            onClick={onOpenLegal}
            className="text-[#C85A32] underline hover:text-white"
          >
            política de privacidad
          </button>.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 font-mono text-[11px]">
        <button
          type="button"
          onClick={handleAccept}
          className="bg-[#C85A32] hover:bg-[#B04A25] text-white px-4 py-2 font-bold uppercase transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
