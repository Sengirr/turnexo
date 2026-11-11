import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Building,
  ArrowUpRight,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowLeft,
  Mail,
  Phone,
  Database,
  Plus,
  Lock,
  KeyRound,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import {
  computeSaasMetrics,
  exportUsersToCsv,
  INITIAL_SAAS_USERS,
  SaasUser,
} from '../lib/saasMetrics';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  onBackToApp: () => void;
  onBackToLanding: () => void;
}

const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'turnexo2026!';
const SESSION_AUTH_KEY = 'turnexo_admin_auth_v1';
const STORED_PASSWORD_KEY = 'turnexo_admin_custom_password_v1';

export default function AdminMetricsView({ onBackToApp, onBackToLanding }: Props) {
  // Autenticación de Administrador en memoria de sesión (se borra al cerrar la pestaña)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Modal para cambiar contraseña de admin
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [passChangedMsg, setPassChangedMsg] = useState(false);

  const getActivePassword = () => {
    return localStorage.getItem(STORED_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const validPassword = getActivePassword();
    if (passwordInput.trim() === validPassword) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      setAuthError('Contraseña incorrecta. Acceso restringido al fundador.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setIsAuthenticated(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPass.trim().length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    localStorage.setItem(STORED_PASSWORD_KEY, newAdminPass.trim());
    setPassChangedMsg(true);
    setTimeout(() => {
      setPassChangedMsg(false);
      setShowChangePassModal(false);
      setNewAdminPass('');
    }, 2000);
  };

  const [users, setUsers] = useState<SaasUser[]>(() => {
    try {
      const stored = localStorage.getItem('turnexo_saas_users_v2');
      return stored ? JSON.parse(stored) : INITIAL_SAAS_USERS;
    } catch {
      return INITIAL_SAAS_USERS;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'pro' | 'manager'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Nuevo usuario simulado
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('+34 ');
  const [newPlan, setNewPlan] = useState<'plan_starter' | 'plan_pro' | 'plan_manager'>('plan_pro');
  const [newPropsCount, setNewPropsCount] = useState(2);

  // Configuración de Enlaces de Pago de Stripe (Fundador)
  const [stripeProLink, setStripeProLink] = useState(() => {
    try {
      const stored = localStorage.getItem('turnexo_stripe_links_v1');
      if (stored) return JSON.parse(stored).plan_pro || '';
    } catch {}
    return import.meta.env.VITE_STRIPE_LINK_PRO || 'https://buy.stripe.com/3cIdR93BBbWd2mb9yt5c400';
  });

  const [stripeManagerLink, setStripeManagerLink] = useState(() => {
    try {
      const stored = localStorage.getItem('turnexo_stripe_links_v1');
      if (stored) return JSON.parse(stored).plan_manager || '';
    } catch {}
    return import.meta.env.VITE_STRIPE_LINK_MANAGER || 'https://buy.stripe.com/6oU8wP8VV8K10e38up5c401';
  });

  const [stripeProYearlyLink, setStripeProYearlyLink] = useState(() => {
    try {
      const stored = localStorage.getItem('turnexo_stripe_links_v1');
      if (stored) return JSON.parse(stored).plan_pro_yearly || '';
    } catch {}
    return import.meta.env.VITE_STRIPE_LINK_PRO_YEARLY || 'https://buy.stripe.com/fZubJ16NNd0hgd1bGB5c402';
  });

  const [stripeManagerYearlyLink, setStripeManagerYearlyLink] = useState(() => {
    try {
      const stored = localStorage.getItem('turnexo_stripe_links_v1');
      if (stored) return JSON.parse(stored).plan_manager_yearly || '';
    } catch {}
    return import.meta.env.VITE_STRIPE_LINK_MANAGER_YEARLY || 'https://buy.stripe.com/00w14nc875xP0e311X5c403';
  });

  const [stripeSavedMsg, setStripeSavedMsg] = useState(false);

  const handleSaveStripeLinks = (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      plan_pro: stripeProLink.trim(),
      plan_manager: stripeManagerLink.trim(),
      plan_pro_yearly: stripeProYearlyLink.trim(),
      plan_manager_yearly: stripeManagerYearlyLink.trim(),
    };
    localStorage.setItem('turnexo_stripe_links_v1', JSON.stringify(config));
    setStripeSavedMsg(true);
    setTimeout(() => setStripeSavedMsg(false), 2500);
  };

  const metrics = computeSaasMetrics(users);

  const saveUsers = (updated: SaasUser[]) => {
    setUsers(updated);
    localStorage.setItem('turnexo_saas_users_v2', JSON.stringify(updated));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const spendMap = {
      plan_starter: 0,
      plan_pro: 19,
      plan_manager: 39,
    };

    const newUser: SaasUser = {
      id: `user-${Date.now()}`,
      email: newEmail.trim(),
      fullName: newName.trim() || 'Nuevo Anfitrión',
      companyName: newCompany.trim() || 'Apartamentos Turísticos',
      whatsapp: newWhatsapp.trim(),
      plan: newPlan,
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      propertiesCount: newPropsCount,
      monthlySpend: spendMap[newPlan],
      lastActiveAt: 'Justo ahora',
    };

    saveUsers([newUser, ...users]);
    setShowAddUserModal(false);
    setNewEmail('');
    setNewName('');
    setNewCompany('');
  };

  const handleTogglePlan = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id !== userId) return u;
      if (u.plan === 'plan_starter') {
        return { ...u, plan: 'plan_pro' as const, monthlySpend: 19, status: 'active' as const };
      }
      if (u.plan === 'plan_pro') {
        return { ...u, plan: 'plan_manager' as const, monthlySpend: 39, status: 'active' as const };
      }
      return { ...u, plan: 'plan_starter' as const, monthlySpend: 0, status: 'active' as const };
    });
    saveUsers(updated);
  };

  const filteredUsers = users.filter((u) => {
    if (planFilter === 'starter' && u.plan !== 'plan_starter') return false;
    if (planFilter === 'pro' && u.plan !== 'plan_pro') return false;
    if (planFilter === 'manager' && u.plan !== 'plan_manager') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchComp = u.companyName.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchComp) return false;
    }
    return true;
  });

  // SI NO ESTÁ AUTENTICADO: PANTALLA DE BLOQUEO DE ALTA SEGURIDAD
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141413] text-[#F6F4EE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1E1E1C] border border-[#2C2C29] rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Lock size={26} />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-red-400 font-bold">
                ÁREA PRIVADA CONFIDENCIAL
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                Panel del Fundador Turnexo
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Introduce tu contraseña maestra para acceder a las métricas del negocio y directorio de usuarios.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full bg-[#141413] border border-[#2C2C29] focus:border-red-500/60 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none transition"
                  required
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-slate-200 text-slate-900 text-xs font-mono font-bold uppercase rounded-xl transition shadow-lg"
            >
              Desbloquear Acceso Seguro
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <button
              type="button"
              onClick={onBackToLanding}
              className="hover:text-white transition"
            >
              ← Volver a la web
            </button>
            <span className="font-mono text-[10px]">Turnexo Security Guard</span>
          </div>
        </div>
      </div>
    );
  }

  // SI ESTÁ AUTENTICADO: VISTA DEL PANEL
  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#141413] p-4 sm:p-8 space-y-8 font-sans">
      {/* BARRA SUPERIOR / HEADER */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DDD2] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] bg-[#C85A32]/10 font-bold px-2.5 py-0.5">
              OWNER BACKOFFICE
            </span>
            <span className="text-xs text-[#57554F] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sesión de Administrador Autenticada
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141413] mt-1">
            Turnexo Founder Dashboard
          </h1>
          <p className="text-xs text-[#57554F] mt-0.5">
            Monitor confidencial de captación, MRR, conversión de planes y usuarios registrados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowChangePassModal(true)}
            className="px-3 py-2 text-xs font-mono font-bold uppercase text-[#57554F] hover:text-[#141413] bg-white border border-[#D5CFC0] hover:bg-[#FAF9F5] flex items-center gap-1.5 transition"
          >
            <KeyRound size={13} />
            <span>Cambiar Contraseña</span>
          </button>
          <button
            type="button"
            onClick={onBackToApp}
            className="px-3.5 py-2 text-xs font-mono font-bold uppercase text-[#57554F] hover:text-[#141413] bg-white border border-[#D5CFC0] hover:bg-[#FAF9F5] transition"
          >
            Ir a mi cuenta
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase transition shadow-sm rounded-none"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión Admin</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* TARJETAS DE KPIS PRINCIPALES (MRR, ARR, USUARIOS, ALOJAMIENTOS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR */}
          <div className="bg-white border border-[#E2DDD2] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                MRR (Ingresos Mensuales)
              </span>
              <DollarSign size={16} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#141413] font-mono">
                {metrics.mrr} €
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Recurrente
              </span>
            </div>
            <p className="text-[11px] text-[#57554F]">
              Ingresos mensuales de {metrics.payingUsers} anfitriones de pago
            </p>
          </div>

          {/* ARR */}
          <div className="bg-white border border-[#E2DDD2] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                ARR Proyectado
              </span>
              <TrendingUp size={16} className="text-[#C85A32]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#141413] font-mono">
                {metrics.arr.toLocaleString('es-ES')} €
              </span>
              <span className="text-[11px] font-mono text-slate-400">/año</span>
            </div>
            <p className="text-[11px] text-[#57554F]">
              Proyección anual (MRR × 12 meses)
            </p>
          </div>

          {/* TOTAL ANFITRIONES */}
          <div className="bg-white border border-[#E2DDD2] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                Anfitriones Registrados
              </span>
              <Users size={16} className="text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#141413] font-mono">
                {metrics.totalUsers}
              </span>
              <span className="text-[11px] font-bold text-slate-600">
                ({metrics.freeUsers} Free · {metrics.payingUsers} Pro)
              </span>
            </div>
            <p className="text-[11px] text-[#57554F]">
              {metrics.conversionRate}% tasa de conversión a pago
            </p>
          </div>

          {/* TOTAL ALOJAMIENTOS */}
          <div className="bg-white border border-[#E2DDD2] p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                Alojamientos Conectados
              </span>
              <Building size={16} className="text-[#1F4E3D]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#141413] font-mono">
                {metrics.totalProperties}
              </span>
              <span className="text-[11px] font-mono text-slate-400">conectados</span>
            </div>
            <p className="text-[11px] text-[#57554F]">
              Media de {(metrics.totalProperties / Math.max(1, metrics.totalUsers)).toFixed(1)} alojamientos por cuenta
            </p>
          </div>
        </div>

        {/* DISTRIBUCIÓN DE PLANES */}
        <div className="bg-white border border-[#E2DDD2] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#57554F] font-bold">
                ESTRUCTURA DE INGRESOS
              </span>
              <h3 className="text-base font-bold text-[#141413]">
                Distribución de Usuarios por Plan
              </h3>
            </div>
            <span className="text-xs text-[#57554F] font-mono">
              ARPU de pago: <strong>{metrics.arpu} € / anfitrión</strong>
            </span>
          </div>

          {/* Barra Visual */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(metrics.freeUsers / metrics.totalUsers) * 100}%` }}
              className="bg-slate-400 h-full"
              title={`Starter Free: ${metrics.freeUsers}`}
            />
            <div
              style={{
                width: `${
                  (users.filter((u) => u.plan === 'plan_pro').length / metrics.totalUsers) * 100
                }%`,
              }}
              className="bg-emerald-500 h-full"
              title="Pro Fiscal (19€)"
            />
            <div
              style={{
                width: `${
                  (users.filter((u) => u.plan === 'plan_manager').length / metrics.totalUsers) * 100
                }%`,
              }}
              className="bg-indigo-600 h-full"
              title="Gestora (39€)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Plan Starter (0 €)</p>
                <p className="text-slate-500 text-[11px]">
                  {metrics.freeUsers} anfitriones · Viralidad QR & Guías
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">Plan Pro Fiscal (19 €)</p>
                <p className="text-emerald-800 text-[11px]">
                  {users.filter((u) => u.plan === 'plan_pro').length} anfitriones · IVA 10% obligatorio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="w-3 h-3 rounded-full bg-indigo-600 shrink-0" />
              <div>
                <p className="font-bold text-indigo-950">Plan Gestora (39 €)</p>
                <p className="text-indigo-800 text-[11px]">
                  {users.filter((u) => u.plan === 'plan_manager').length} gestoras · Hasta 10 alojamientos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA DE USUARIOS / ANFITRIONES REGISTRADOS */}
        <div className="bg-white border border-[#E2DDD2] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DDD2] pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#57554F] font-bold">
                BASE DE DATOS CONFIDENCIAL
              </span>
              <h3 className="text-base font-bold text-[#141413]">
                Anfitriones Registrados ({filteredUsers.length})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-mono font-bold uppercase transition"
              >
                <Plus size={13} />
                <span>+ Añadir Usuario</span>
              </button>
              <button
                type="button"
                onClick={() => exportUsersToCsv(users)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F4E3D] hover:bg-[#163A2D] text-white text-xs font-mono font-bold uppercase transition"
                title="Exportar base de datos a Excel / CSV"
              >
                <Download size={13} />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Filtros de búsqueda */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57554F]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D5CFC0] w-64 focus:outline-none"
                />
              </div>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="py-1.5 px-3 text-xs bg-white border border-[#D5CFC0]"
              >
                <option value="all">Todos los planes</option>
                <option value="starter">Plan Starter (0 €)</option>
                <option value="pro">Plan Pro Fiscal (19 €)</option>
                <option value="manager">Plan Gestora (39 €)</option>
              </select>
            </div>

            <span className="font-mono text-xs text-[#57554F]">
              Total en base de datos: {users.length} cuentas
            </span>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto border border-[#E2DDD2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E2DDD2] font-mono text-[10px] text-[#57554F] uppercase">
                  <th className="py-3 px-4">Anfitrión / Email</th>
                  <th className="py-3 px-4">WhatsApp Directo</th>
                  <th className="py-3 px-4">Plan Actual</th>
                  <th className="py-3 px-4 text-center">Alojamientos</th>
                  <th className="py-3 px-4 text-right">Cuota Mensual</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Alta / Actividad</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD2]">
                {filteredUsers.map((u) => {
                  const phoneClean = u.whatsapp.replace(/[^0-9]/g, '');
                  return (
                    <tr key={u.id} className="hover:bg-[#FAF9F5] transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#141413] block">{u.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-500 block">{u.email}</span>
                        <span className="text-[10px] text-slate-400">{u.companyName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {u.whatsapp ? (
                          <a
                            href={`https://wa.me/${phoneClean}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                          >
                            <Phone size={12} />
                            <span>{u.whatsapp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No indicado</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        {u.plan === 'plan_starter' && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                            Starter (0 €)
                          </span>
                        )}
                        {u.plan === 'plan_pro' && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                            Pro Fiscal (19 €)
                          </span>
                        )}
                        {u.plan === 'plan_manager' && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold border border-indigo-200">
                            Gestora (39 €)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {u.propertiesCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        {u.monthlySpend} €/mes
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        ) : u.status === 'trialing' ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Prueba 14d
                          </span>
                        ) : (
                          <span className="text-slate-400">Cancelado</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-600 block text-[11px]">
                          {u.registeredAt}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {u.lastActiveAt}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleTogglePlan(u.id)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold uppercase transition"
                          title="Alternar entre Free / Pro / Gestor para este usuario"
                        >
                          Cambiar Plan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONFIGURACIÓN DE PASARELA STRIPE CHECKOUT (FUNDADOR) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                💳
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Enlaces de Pago de Stripe (Payment Links)
                </h4>
                <p className="text-xs text-slate-500">
                  Configura aquí las URLs a las que se redirige a los anfitriones al contratar un plan.
                </p>
              </div>
            </div>
            <a
              href="https://dashboard.stripe.com/payment-links"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
            >
              Abrir Stripe Dashboard ↗
            </a>
          </div>

          <form onSubmit={handleSaveStripeLinks} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Enlace Pro Fiscal · Mensual (19€/mes)
                </label>
                <input
                  type="url"
                  placeholder="https://buy.stripe.com/..."
                  value={stripeProLink}
                  onChange={(e) => setStripeProLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Enlace Pro Fiscal · Anual -20% (180€/año)
                </label>
                <input
                  type="url"
                  placeholder="https://buy.stripe.com/..."
                  value={stripeProYearlyLink}
                  onChange={(e) => setStripeProYearlyLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Enlace Microgestora · Mensual (39€/mes)
                </label>
                <input
                  type="url"
                  placeholder="https://buy.stripe.com/..."
                  value={stripeManagerLink}
                  onChange={(e) => setStripeManagerLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Enlace Microgestora · Anual -20% (372€/año)
                </label>
                <input
                  type="url"
                  placeholder="https://buy.stripe.com/..."
                  value={stripeManagerYearlyLink}
                  onChange={(e) => setStripeManagerYearlyLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {stripeSavedMsg ? (
                <span className="text-xs text-emerald-600 font-bold">
                  ✓ Enlaces de Stripe guardados correctamente.
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  * Si dejas un enlace vacío, el panel de clientes mostrará un botón de contacto directo con soporte.
                </span>
              )}
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
              >
                Guardar Enlaces
              </button>
            </div>
          </form>
        </div>

        {/* CENTRO DE CONEXIÓN NUBE & SUPABASE */}
        <div className="bg-[#141413] text-[#F6F4EE] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  Estado de Infraestructura y Base de Datos
                </h4>
                <p className="text-xs text-white/50">
                  Cómo se almacenan los anfitriones y sincronizaciones en Turnexo.
                </p>
              </div>
            </div>

            <span
              className={`font-mono text-xs font-bold px-3 py-1 rounded-full ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isSupabaseConfigured ? '● Supabase Conectado en Producción' : '○ Modo Autónomo LocalStorage'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-white/70">
            <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="text-white block font-semibold">
                ¿Dónde se guardan cuando un anfitrión se registra?
              </strong>
              <p className="leading-relaxed">
                Cuando conectas tus claves en el archivo <code className="text-emerald-400">.env</code> (
                <code className="text-slate-300">VITE_SUPABASE_URL</code> y{' '}
                <code className="text-slate-300">VITE_SUPABASE_ANON_KEY</code>), cada registro se guarda automáticamente en tu tabla PostgreSQL{' '}
                <code className="text-emerald-400">hosts</code> de Supabase y en la autenticación de usuarios.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-xl bg-white/5 border border-white/10">
              <strong className="text-white block font-semibold">
                Coste de Servidor del MicroSaaS
              </strong>
              <p className="leading-relaxed">
                Gracias a la compresión WebP automática de fotos y el sistema de sincronización iCal bajo demanda con caché de 30 minutos, puedes tener hasta <strong>500 alojamientos sin pagar ni 1 euro</strong> de servidor ni base de datos en los planes gratuitos de Vercel y Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CAMBIAR CONTRASEÑA ADMIN */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Cambiar Contraseña de Fundador
                </h3>
                <p className="text-xs text-slate-500">
                  Establece tu nueva clave secreta para entrar a /admin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nueva Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  placeholder="Tu nueva clave segura"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  required
                />
              </div>

              {passChangedMsg && (
                <p className="text-xs text-emerald-700 font-bold">
                  ✓ Contraseña actualizada correctamente.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA AÑADIR USUARIO MANUALMENTE */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Registrar Nuevo Anfitrión
                </h3>
                <p className="text-xs text-slate-500">
                  Añade un cliente manualmente a tu base de datos MicroSaaS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Laura González"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="laura@apartamentos.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Empresa / Alojamientos</label>
                <input
                  type="text"
                  placeholder="Marbella Stays"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  placeholder="+34 600 00 00 00"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="plan_starter">Starter (0 €)</option>
                    <option value="plan_pro">Pro Fiscal (19 €)</option>
                    <option value="plan_manager">Gestora (39 €)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nº Alojamientos</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newPropsCount}
                    onChange={(e) => setNewPropsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md"
                >
                  Guardar Anfitrión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
