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
            {/* Opción Pack Completo */}
            <div
              onClick={() => setSelectedPlan('pack_complete')}
              className={`p-5 border-2 cursor-pointer transition ${
                selectedPlan === 'pack_complete'
                  ? 'border-[#141413] bg-[#141413] text-[#F6F4EE] shadow-xl'
                  : 'border-[#D5CFC0] bg-[#FAF9F5] hover:border-[#141413]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border ${
                      selectedPlan === 'pack_complete'
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'border-[#141413]'
                    }`}
                  >
                    {selectedPlan === 'pack_complete' && <Check size={14} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#C85A32] text-white font-bold">
                        MÁS ELEGIDO · AHORRA 4€/PISO
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-70">
                        MÓDULO 1 + MÓDULO 2 CONECTADOS
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
                      Pack Completo Turnexo (Limpiezas iCal + Guía Huésped)
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'pack_complete' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Sincronización total: cuando un huésped pide Late Check-out desde su guía y lo apruebas en 1 clic, la hora de entrada de la limpiadora se retrasa automáticamente.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">14 €</span>
                  <span className="block text-[10px] opacity-60">/ piso / mes</span>
                </div>
              </div>
            </div>

            {/* Opción Solo Módulo 1: Limpiezas */}
            <div
              onClick={() => setSelectedPlan('module_cleanings')}
              className={`p-5 border-2 cursor-pointer transition ${
                selectedPlan === 'module_cleanings'
                  ? 'border-[#141413] bg-[#141413] text-[#F6F4EE] shadow-xl'
                  : 'border-[#D5CFC0] bg-[#FAF9F5] hover:border-[#141413]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border ${
                      selectedPlan === 'module_cleanings'
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'border-[#141413]'
                    }`}
                  >
                    {selectedPlan === 'module_cleanings' && <Check size={14} />}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] font-bold flex items-center gap-1.5">
                      <Calendar size={12} /> SOLO MÓDULO 1 · OPERATIVA DE LIMPIEZA
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                      Módulo Limpiezas Automáticas por iCal
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'module_cleanings' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Lectura de Airbnb y Booking, alerta de rotación el mismo día, enlace móvil en español (/c/token) para cada limpiadora, checklist por piso y fotos WebP.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">9 €</span>
                  <span className="block text-[10px] opacity-60">/ piso / mes</span>
                </div>
              </div>
            </div>

            {/* Opción Solo Módulo 2: Guía del Huésped */}
            <div
              onClick={() => setSelectedPlan('module_guide')}
              className={`p-5 border-2 cursor-pointer transition ${
                selectedPlan === 'module_guide'
                  ? 'border-[#141413] bg-[#141413] text-[#F6F4EE] shadow-xl'
                  : 'border-[#D5CFC0] bg-[#FAF9F5] hover:border-[#141413]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-6 h-6 mt-0.5 flex items-center justify-center border ${
                      selectedPlan === 'module_guide'
                        ? 'bg-[#C85A32] border-[#C85A32] text-white'
                        : 'border-[#141413]'
                    }`}
                  >
                    {selectedPlan === 'module_guide' && <Check size={14} />}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#1F4E3D] font-bold flex items-center gap-1.5">
                      <Sparkles size={12} /> SOLO MÓDULO 2 · EXPERIENCIA & UPSELLING
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                      Módulo Guía Digital del Huésped + Extras
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        selectedPlan === 'module_guide' ? 'text-white/75' : 'text-[#57554F]'
                      }`}
                    >
                      Portal móvil multi-idioma (ES/EN/FR) con vídeos de llegada paso a paso, desbloqueo de código de buzón/portero, WiFi, checklist de salida y venta de Late Check-out y extras.
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-2xl font-bold">9 €</span>
                  <span className="block text-[10px] opacity-60">/ piso / mes</span>
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
