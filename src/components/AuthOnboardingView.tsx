import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { HostAccount, isSupabaseConfigured, supabase } from '../lib/supabase';

interface Props {
  onSuccess: (account: HostAccount) => void;
  onBackToLanding: () => void;
}

export default function AuthOnboardingView({ onSuccess, onBackToLanding }: Props) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [selectedPlan, setSelectedPlan] = useState<HostAccount['plan']>('pack_complete');

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
        email: email.trim() || 'hola@turnexo.com',
        fullName: fullName.trim() || email.split('@')[0] || 'Anfitrión Turnexo',
        companyName: companyName.trim() || 'Costa Sol Apartments',
        plan: selectedPlan,
        trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al autenticar. Comprueba tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = (plan: HostAccount['plan'] = 'pack_complete') => {
    onSuccess({
      id: 'demo-host',
      email: 'demo@turnexo.com',
      fullName: 'Iván · Demo Host',
      companyName: 'Marbella & Málaga Stays',
      plan,
      trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    });
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
            Volver a turnexo.com
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#141413] text-[#F6F4EE] flex items-center justify-center font-mono font-bold text-xs">
              TX
            </div>
            <span className="font-bold text-base tracking-tight">Turnexo</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] border border-[#C85A32]/40 px-2 py-0.5">
              SELF-SERVICE ONBOARDING
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Columna Izquierda: Selección de Módulos (1, 2 o Ambos) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C85A32] font-bold">
              PASO 1 · ELIGE QUÉ MÓDULOS QUIERES ACTIVAR
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] mt-2">
              Contrata un solo módulo o conecta los dos.
            </h1>
            <p className="text-sm text-[#57554F] mt-2 leading-relaxed">
              14 días de prueba gratuita sin compromiso. Puedes activar o desactivar cada módulo por alojamiento en cualquier momento desde tu panel.
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
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border ${
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
                        1 PISO GRATIS DE POR VIDA
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        SIN TARJETA DE CRÉDITO
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Plan Starter (1 Alojamiento Turístico)
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'plan_starter' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Guía Digital del Huésped completa (Wi-Fi, códigos, vídeos, normas), enlace iCal con Airbnb y Booking, y enlace móvil para 1 limpiadora con checklist.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold text-[#1F4E3D]">0 €</span>
                  <span className="block text-[10px] opacity-60">/ mes de por vida</span>
                </div>
              </div>
            </div>

            {/* Opción 2: Plan Pro (Hasta 4 Pisos - 29€/mes) */}
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
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border ${
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
                        TARIFA PLANA · 7,25€/PISO
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        HASTA 4 ALOJAMIENTOS
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Plan Pro (Hasta 4 Alojamientos)
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'plan_pro' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Tarifa plana fija sin sustos mensuales. Todo incluido: Guías 100% personalizadas sin marca Turnexo, cuadrante iCal, limpiadoras ilimitadas y cobro de late check-outs sin comisiones.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">29 €</span>
                  <span className="block text-[10px] opacity-60">/ mes total</span>
                </div>
              </div>
            </div>

            {/* Opción 3: Plan Gestor (Hasta 8 Pisos - 49€/mes) */}
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
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border ${
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
                        MÁS ELEGIDO POR SUPERHOSTS
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        HASTA 8 ALOJAMIENTOS (6,12€/PISO)
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Plan Gestor (Hasta 8 Alojamientos)
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'plan_manager' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Para anfitriones profesionales y gestoras boutique. Incluye liquidaciones de honorarios para limpiadoras con exportación CSV y despacho por WhatsApp.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">49 €</span>
                  <span className="block text-[10px] opacity-60">/ mes total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acceso directo 1 clic para probar sin rellenar formulario */}
          <div className="bg-[#FAF9F5] border border-[#D5CFC0] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C85A32] font-bold block">
                ¿QUIERES PROBAR EL PANEL DIRECTAMENTE?
              </span>
              <p className="text-xs text-[#57554F]">
                Entra con los 2 pisos de ejemplo (Marbella y Málaga) con el plan que tienes seleccionado arriba.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInstantDemo(selectedPlan)}
              className="bg-[#1F4E3D] hover:bg-[#163A2D] text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 shrink-0 flex items-center gap-1.5 transition"
            >
              <KeyRound size={13} />
              Entrar en Modo Demo →
            </button>
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
              Crear Cuenta (14d Gratis)
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 font-bold uppercase transition ${
                mode === 'login' ? 'bg-[#141413] text-white' : 'text-[#57554F]'
              }`}
            >
              Ya tengo cuenta
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
                  {selectedPlan === 'pack_complete'
                    ? 'Pack Completo (14€/mes)'
                    : selectedPlan === 'module_cleanings'
                    ? 'Solo Limpiezas (9€/mes)'
                    : 'Solo Guía Huésped (9€/mes)'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#B04A25] text-white font-mono text-xs font-bold uppercase tracking-wider py-4 flex items-center justify-center gap-2 transition shadow-md"
            >
              <span>
                {loading
                  ? 'Creando tu espacio...'
                  : mode === 'register'
                  ? 'Empezar Prueba Gratis de 14 Días'
                  : 'Entrar a mi Panel (/app)'}
              </span>
              <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-[11px] text-[#57554F] text-center leading-relaxed">
            Sin permanencia. No se realiza ningún cargo hoy. Podrás añadir o quitar pisos cuando quieras.
          </p>
        </div>
      </div>
    </div>
  );
}
