import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { HostAccount, isSupabaseConfigured, supabase } from '../lib/supabase';

interface Props {
  onSuccess: (account: HostAccount) => void;
  onBackToLanding: () => void;
  initialMode?: 'register' | 'login';
}

export default function AuthOnboardingView({
  onSuccess,
  onBackToLanding,
  initialMode = 'register',
}: Props) {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [selectedPlan, setSelectedPlan] = useState<HostAccount['plan']>('plan_starter');

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('+34 ');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (mode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                company_name: companyName.trim(),
                whatsapp: whatsapp.trim(),
                subscription_plan: selectedPlan,
              },
            },
          });
          if (error) throw error;
          const userId = data.user?.id || `host-${Date.now()}`;
          onSuccess({
            id: userId,
            email: email.trim(),
            fullName: fullName.trim() || 'Anfitrión',
            companyName: companyName.trim() || 'Mis Alojamientos',
            plan: selectedPlan,
            trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          });
          return;
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;
          const meta = data.user?.user_metadata || {};
          onSuccess({
            id: data.user?.id || 'host-1',
            email: data.user?.email || email.trim(),
            fullName: meta.full_name || 'Anfitrión',
            companyName: meta.company_name || 'Mis Alojamientos',
            plan: meta.subscription_plan || 'pack_complete',
            trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          });
          return;
        }
      }

      // Modo Autónomo Instantáneo (mientras no se hayan pegado las claves de Supabase en .env)
      onSuccess({
        id: `host-${Date.now()}`,
        email: email.trim() || 'info@turnexo.com',
        fullName: fullName.trim() || email.split('@')[0] || 'Anfitrión Turnexo',
        companyName: companyName.trim() || 'Mis Alojamientos',
        plan: selectedPlan,
        trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al autenticar. Comprueba tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] flex flex-col">
      {/* Cabecera */}
      <header className="border-b border-[#D5CFC0] bg-[#FAF9F5] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#57554F] hover:text-[#141413] font-bold"
          >
            <ArrowLeft size={14} />
            Volver a Turnexo
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-bold text-xs">
              TX
            </div>
            <span className="font-bold text-base tracking-tight">Turnexo</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] border border-[#C85A32]/40 px-2 py-0.5">
              ACCESO ANFITRIONES
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Columna Izquierda: Selección de Plan */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              PASO 1 · ELIGE TU PLAN DE ACCESO
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] mt-2">
              Empieza gratis con 1 alojamiento. Crece cuando lo necesites<span className="-ml-[0.03em]">.</span>
            </h1>
            <p className="text-sm text-[#57554F] mt-2 leading-relaxed">
              Sin tarjeta de crédito ni permanencia. Puedes cambiar de plan en un clic desde tu panel cuando añadas más alojamientos o necesites emitir facturas con el 10% de IVA.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Opción 1: Plan Starter (1 Alojamiento Gratis) */}
            <div
              onClick={() => setSelectedPlan('plan_starter')}
              className={`p-5 border-2 cursor-pointer transition ${
                selectedPlan === 'plan_starter'
                  ? 'border-[#141413] bg-[#141413] text-[#F6F4EE] shadow-xl'
                  : 'border-[#D5CFC0] bg-[#FAF9F5] hover:border-[#141413]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border shrink-0 ${
                      selectedPlan === 'plan_starter'
                        ? 'bg-[#1F4E3D] border-[#1F4E3D] text-white'
                        : 'border-[#141413]'
                    }`}
                  >
                    {selectedPlan === 'plan_starter' && <Check size={14} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#1F4E3D] text-white font-bold">
                        PLAN GRATUITO · 1 ALOJAMIENTO
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        SIN TARJETA DE CRÉDITO
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Starter · 1 Alojamiento
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'plan_starter' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      App de Limpiadora con checklist por habitación y fotos, Guía Digital del Huésped con vídeos del alojamiento, catálogo de extras y sincronización iCal con Airbnb y Booking.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold text-[#1F4E3D]">0 €</span>
                  <span className="block text-[10px] opacity-60">/ mes</span>
                </div>
              </div>
            </div>

            {/* Opción 2: Plan Pro Fiscal (Hasta 5 Alojamientos - 19€/mes) */}
            <div
              onClick={() => setSelectedPlan('plan_pro')}
              className={`p-5 border-2 cursor-pointer transition ${
                selectedPlan === 'plan_pro'
                  ? 'border-[#141413] bg-[#141413] text-[#F6F4EE] shadow-xl'
                  : 'border-[#D5CFC0] bg-[#FAF9F5] hover:border-[#141413]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border shrink-0 ${
                      selectedPlan === 'plan_pro'
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'border-[#141413]'
                    }`}
                  >
                    {selectedPlan === 'plan_pro' && <Check size={14} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#C85A32] text-white font-bold">
                        MÁS ELEGIDO · IVA 10% + MODELO 303
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        HASTA 5 ALOJAMIENTOS
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Pro Fiscal · Hasta 5 Alojamientos
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'plan_pro' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Facturas simplificadas y con NIF al 10% de IVA en un clic, Libro Registro trimestral en Excel para el Modelo 303, soporte para varios propietarios (Multi-NIF) y Guía Digital 100% marca blanca.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">19 €</span>
                  <span className="block text-[10px] opacity-60">/ mes (tarifa plana)</span>
                </div>
              </div>
            </div>

            {/* Opción 3: Plan Microgestora (Hasta 10 Alojamientos - 39€/mes) */}
            <div
              onClick={() => setSelectedPlan('plan_manager')}
              className={`p-5 border-2 cursor-pointer transition ${
                selectedPlan === 'plan_manager'
                  ? 'border-[#141413] bg-[#141413] text-[#F6F4EE] shadow-xl'
                  : 'border-[#D5CFC0] bg-[#FAF9F5] hover:border-[#141413]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border shrink-0 ${
                      selectedPlan === 'plan_manager'
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'border-[#141413]'
                    }`}
                  >
                    {selectedPlan === 'plan_manager' && <Check size={14} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#C85A32] text-white font-bold">
                        GESTORAS Y MULTIPROPIETARIO
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        HASTA 10 ALOJAMIENTOS
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Microgestora · Hasta 10 Alojamientos
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'plan_manager' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Todo lo incluido en Pro Fiscal para hasta 10 alojamientos, múltiples limpiadoras con asignación por alojamiento, resumen mensual de limpiezas por persona y soporte prioritario.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">39 €</span>
                  <span className="block text-[10px] opacity-60">/ mes (tarifa plana)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Registro / Login */}
        <div className="lg:col-span-5 bg-[#FAF9F5] border-2 border-[#141413] p-7 space-y-6 shadow-[8px_8px_0px_#141413]">
          <div className="grid grid-cols-2 border border-[#D5CFC0] bg-[#F6F4EE] p-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 font-bold uppercase transition ${
                mode === 'register' ? 'bg-[#141413] text-white' : 'text-[#57554F]'
              }`}
            >
              Crear Cuenta Gratis
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 font-bold uppercase transition ${
                mode === 'login' ? 'bg-[#141413] text-white' : 'text-[#57554F]'
              }`}
            >
              Iniciar Sesión
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                    TU NOMBRE COMPLETO
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]"
                    />
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full bg-white border border-[#D5CFC0] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                      EMPRESA O MARCA (OPCIONAL)
                    </label>
                    <div className="relative">
                      <Layers
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]"
                      />
                      <input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej. Málaga Suites"
                        className="w-full bg-white border border-[#D5CFC0] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#141413]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                      WHATSAPP DE CONTACTO
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]"
                      />
                      <input
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+34 600 00 00 00"
                        className="w-full bg-white border border-[#D5CFC0] pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:border-[#141413]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                EMAIL PROFESIONAL
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white border border-[#D5CFC0] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#D5CFC0] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#141413]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="bg-[#F6F4EE] border border-[#D5CFC0] p-3 font-mono text-[11px] flex items-center justify-between">
                <span className="text-[#57554F]">PLAN SELECCIONADO:</span>
                <span className="font-bold text-[#141413]">
                  {selectedPlan === 'plan_starter'
                    ? 'Starter · 1 Alojamiento (0 €/mes)'
                    : selectedPlan === 'plan_pro'
                    ? 'Pro Fiscal · Hasta 5 (19 €/mes)'
                    : 'Microgestora · Hasta 10 (39 €/mes)'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans text-sm font-bold py-4 flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>
                {loading
                  ? 'Accediendo a tu cuenta...'
                  : mode === 'register'
                  ? 'Crear Cuenta Gratis'
                  : 'Entrar a mi Panel'}
              </span>
              <ArrowRight size={15} />
            </button>
          </form>

          <p className="text-[11px] text-[#57554F] text-center leading-relaxed">
            Sin permanencia ni tarjeta de crédito para empezar. Podrás añadir o quitar alojamientos cuando quieras.
          </p>
        </div>
      </div>
    </div>
  );
}
