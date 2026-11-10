import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
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
  initialPlan?: 'plan_starter' | 'plan_pro' | 'plan_manager';
}

export default function AuthOnboardingView({
  onSuccess,
  onBackToLanding,
  initialMode = 'register',
  initialPlan = 'plan_starter',
}: Props) {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [selectedPlan, setSelectedPlan] = useState<HostAccount['plan']>(initialPlan);

  const [fullName, setFullName] = useState('');
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
            companyName: 'Mis Alojamientos',
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
            plan: meta.subscription_plan || 'plan_starter',
            trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          });
          return;
        }
      }

      // Modo Autónomo Instantáneo
      onSuccess({
        id: `host-${Date.now()}`,
        email: email.trim() || 'info@turnexo.com',
        fullName: fullName.trim() || email.split('@')[0] || 'Anfitrión Turnexo',
        companyName: 'Mis Alojamientos',
        plan: selectedPlan,
        trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al autenticar. Comprueba tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      key: 'plan_starter' as const,
      name: 'Starter',
      price: '0 €/mes',
      units: '1 alojamiento',
    },
    {
      key: 'plan_pro' as const,
      name: 'Pro Fiscal',
      price: '19 €/mes',
      units: 'Hasta 5 · IVA 10%',
    },
    {
      key: 'plan_manager' as const,
      name: 'Microgestora',
      price: '39 €/mes',
      units: 'Hasta 10 aloj.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] flex flex-col justify-between">
      {/* Cabecera idéntica a la Landing Page */}
      <header className="border-b border-[#E2DDD2] bg-[#F6F4EE]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-extrabold text-xs tracking-tighter group-hover:bg-[#C85A32] transition-colors">
              TX
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#141413]">
              Turnexo<span className="text-[#C85A32]">.</span>
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-[#57554F] hidden sm:inline">
              {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="font-bold text-[#141413] hover:text-[#C85A32] border border-[#D5CFC0] bg-white px-4 py-2 transition"
            >
              {mode === 'login' ? 'Crear cuenta gratis' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </header>

      {/* Tarjeta Centrada de Login o Registro */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#FAF9F5] border-2 border-[#141413] p-7 sm:p-9 space-y-6 shadow-[8px_8px_0px_#C85A32]">
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold">
              {mode === 'login' ? 'ACCESO ANFITRIONES' : 'EMPIEZA SIN TARJETA DE CRÉDITO'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141413]">
              {mode === 'login' ? 'Iniciar sesión' : 'Crea tu cuenta en Turnexo'}
            </h1>
            <p className="text-xs text-[#57554F] leading-relaxed">
              {mode === 'login'
                ? 'Accede al panel de tus alojamientos, limpiezas y facturación.'
                : 'Configura tu primer alojamiento en menos de 2 minutos. Sin permanencia.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Selector compacto de plan solo en modo Registro */}
            {mode === 'register' && (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1.5">
                  PLAN ELEGIDO (PUEDES CAMBIARLO CUANDO QUIERAS)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p) => {
                    const active = selectedPlan === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setSelectedPlan(p.key)}
                        className={`p-2.5 text-left border transition flex flex-col justify-between ${
                          active
                            ? 'bg-[#141413] text-white border-[#141413]'
                            : 'bg-white text-[#141413] border-[#D5CFC0] hover:border-[#141413]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate">{p.name}</span>
                          {active && <Check size={12} className="text-[#C85A32] shrink-0" />}
                        </div>
                        <span
                          className={`font-mono text-xs font-extrabold mt-1 ${
                            active ? 'text-[#C85A32]' : 'text-[#1F4E3D]'
                          }`}
                        >
                          {p.price}
                        </span>
                        <span
                          className={`text-[10px] truncate mt-0.5 ${
                            active ? 'text-white/70' : 'text-[#57554F]'
                          }`}
                        >
                          {p.units}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                    TU NOMBRE
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
            )}

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#57554F] mb-1">
                EMAIL
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-sans text-sm font-bold py-3.5 flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>
                {loading
                  ? 'Accediendo a tu cuenta...'
                  : mode === 'register'
                  ? 'Crear cuenta y entrar al panel'
                  : 'Entrar a mi cuenta'}
              </span>
              <ArrowRight size={15} />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E2DDD2] text-center text-xs text-[#57554F]">
            {mode === 'login' ? (
              <p>
                ¿Aún no tienes cuenta en Turnexo?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('register');
                  }}
                  className="font-bold text-[#141413] hover:text-[#C85A32] underline underline-offset-4"
                >
                  Crear cuenta gratis
                </button>
              </p>
            ) : (
              <p>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('login');
                  }}
                  className="font-bold text-[#141413] hover:text-[#C85A32] underline underline-offset-4"
                >
                  Iniciar sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Pie mínimo */}
      <footer className="py-5 px-6 text-center font-mono text-[11px] text-[#57554F]">
        <button
          type="button"
          onClick={onBackToLanding}
          className="hover:text-[#141413] transition underline underline-offset-4"
        >
          ← Volver a la página de inicio
        </button>
      </footer>
    </div>
  );
}
