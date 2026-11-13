import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import {
  computeSaasMetrics,
  exportUsersToCsv,
  SaasUser,
} from '../lib/saasMetrics';
import { isSupabaseConfigured } from '../lib/supabase';
import { SEED_PROPIETARIOS } from '../data/seedPropietarios';

interface Props {
  onBackToApp: () => void;
  onBackToLanding: () => void;
}

const SESSION_AUTH_KEY = 'turnexo_admin_auth_v1';
const SESSION_TOKEN_KEY = 'turnexo_admin_token_v1';

export default function AdminMetricsView({ onBackToApp, onBackToLanding }: Props) {
  // Autenticación de Administrador en memoria de sesión (se borra al cerrar la pestaña)
  const [adminToken, setAdminToken] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_TOKEN_KEY) || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true' && Boolean(sessionStorage.getItem(SESSION_TOKEN_KEY));
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Modal para cambiar contraseña de admin
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [passChangedMsg, setPassChangedMsg] = useState(false);

  const [users, setUsers] = useState<SaasUser[]>([]);
  const [platformTotals, setPlatformTotals] = useState<{ reservationsCount: number; cleaningTasksCount: number }>({
    reservationsCount: 0,
    cleaningTasksCount: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // CRM de Prospección (outreach_leads en Supabase)
  type OutreachStatus = 'pendiente' | 'enviado' | 'respondido' | 'registrado' | 'descartado';
  type OutreachSegment = 'asesoria' | 'gestora' | 'propietario' | 'otro';
  interface OutreachLead {
    id: string;
    company_name: string;
    email: string;
    city: string;
    segment: OutreachSegment;
    status: OutreachStatus;
    sent_at: string | null;
    notes: string;
  }
  const [leads, setLeads] = useState<OutreachLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadFilter, setLeadFilter] = useState<'all' | OutreachStatus>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | OutreachSegment>('all');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCity, setNewLeadCity] = useState('Málaga');
  const [newLeadSegment, setNewLeadSegment] = useState<OutreachSegment>('asesoria');
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachSendMsg, setOutreachSendMsg] = useState<string | null>(null);

  const fetchOutreachLeads = useCallback(async (tokenToUse: string) => {
    if (!tokenToUse) return;
    setLoadingLeads(true);
    try {
      const resp = await fetch('/api/admin-outreach', {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setLeads(Array.isArray(data.leads) ? data.leads : []);
      }
    } catch {
      // Silencioso si aún no se ha creado la tabla outreach_leads
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !newLeadCompany.trim() || !newLeadEmail.trim()) return;
    const resp = await fetch('/api/admin-outreach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        company_name: newLeadCompany.trim(),
        email: newLeadEmail.trim(),
        city: newLeadCity.trim(),
        segment: newLeadSegment,
      }),
    });
    if (resp.ok) {
      setNewLeadCompany('');
      setNewLeadEmail('');
      fetchOutreachLeads(adminToken);
    } else {
      const err = await resp.json().catch(() => ({}));
      setMetricsError(err?.error || 'Ejecuta supabase/outreach_leads.sql en Supabase para guardar leads.');
    }
  };

  const SEED_ASESORIAS = [
    { company_name: 'Asesoría Torremolinos S.L.', email: 'asetorre@asesoriatorremolinos.es', city: 'Torremolinos', segment: 'asesoria' },
    { company_name: 'Asesoramientos Maresol', email: 'info@asesoramientosmaresol.com', city: 'Torremolinos', segment: 'asesoria' },
    { company_name: 'Gestoría Administrativa Torremolinos', email: 'gestorremolinos@hotmail.com', city: 'Torremolinos', segment: 'asesoria' },
    { company_name: 'BCM Asesores', email: 'consultas@bcmasesor.es', city: 'Benalmádena', segment: 'asesoria' },
    { company_name: 'Fortes & Rodríguez Asesores', email: 'info@fortesyrodriguez.es', city: 'Benalmádena', segment: 'asesoria' },
    { company_name: 'Asesoría Benamiel', email: 'abenamiel@gmail.com', city: 'Benalmádena', segment: 'asesoria' },
    { company_name: 'Asesoría Elisa Vázquez', email: 'elisavf@asesoriaelisavazquez.com', city: 'Benalmádena', segment: 'asesoria' },
    { company_name: 'Abogados Tributarios', email: 'at@abogadostributarios.es', city: 'Málaga', segment: 'asesoria' },
    { company_name: 'Asesoramiento Farotru y Asociados', email: 'fiscalrasociados@gmail.com', city: 'Málaga', segment: 'asesoria' },
    { company_name: 'Málaga Asesores', email: 'info@malagaasesores.es', city: 'Málaga', segment: 'asesoria' },
    { company_name: 'Asesoría Fiscal Málaga SL', email: 'info@asesoriafiscalmalaga.es', city: 'Málaga', segment: 'asesoria' },
    { company_name: 'Te Hago La Renta', email: 'info@tehagolarenta.com', city: 'Málaga', segment: 'asesoria' },
    { company_name: 'Asesoría Fiscal Marbella', email: 'info@asesoriafiscalmarbella.es', city: 'Marbella', segment: 'asesoria' },
    { company_name: 'Asesoría Geconte', email: 'info@asesoriageconte.com', city: 'Marbella', segment: 'asesoria' },
    { company_name: 'MERAC Abogados & Asesores Fiscales', email: 'info@merac.es', city: 'Marbella', segment: 'asesoria' },
    { company_name: 'P-60 Asesoría Fiscal y Contable', email: 'info@p-60.com', city: 'Fuengirola', segment: 'asesoria' },
    { company_name: 'BC Asesoría', email: 'info@bcasesoria.com', city: 'Fuengirola', segment: 'asesoria' },
    { company_name: 'Activa Asesores', email: 'info@activa-asesores.com', city: 'Fuengirola', segment: 'asesoria' },
    { company_name: 'Asesoría COFIMA', email: 'cofima@asesoriacofima.es', city: 'Fuengirola', segment: 'asesoria' },
    { company_name: 'Aventis Asesores', email: 'info@aventisasesores.com', city: 'Fuengirola', segment: 'asesoria' },
    { company_name: 'Aspiazu Asesores', email: 'info@aspiazuasesores.com', city: 'Fuengirola', segment: 'asesoria' },
    { company_name: 'Two Asesores', email: 'info@twoasesores.com', city: 'Estepona', segment: 'asesoria' },
    { company_name: 'Asesoramos', email: 'info@ar-asesoramos.es', city: 'Estepona', segment: 'asesoria' },
    { company_name: 'AFIGEST Gestión Empresarial', email: 'info@afg-asesoria.com', city: 'Estepona', segment: 'asesoria' },
    { company_name: 'Tu Asesoría Fiscal Málaga', email: 'info@tuasesoriafiscalmalaga.es', city: 'Mijas', segment: 'asesoria' },
    { company_name: 'Asesoría Gedofu', email: 'info@gedofu.es', city: 'Mijas', segment: 'asesoria' },
    { company_name: 'Way to Live Asesoría', email: 'contabilidad@waytolive.es', city: 'Mijas', segment: 'asesoria' },
    { company_name: 'Domínguez Asesoría', email: 'nerja@dominguezasesoria.es', city: 'Nerja', segment: 'asesoria' },
    { company_name: 'Asesoría Sur', email: 'info@asesoriasur.com', city: 'Vélez-Málaga', segment: 'asesoria' },
    { company_name: 'Asesoría LAFIS', email: 'info@lafis-asesores.es', city: 'Málaga', segment: 'asesoria' },
    { company_name: 'Gascón Medina Asesores', email: 'info@gasconmedinaasesores.com', city: 'Benidorm', segment: 'asesoria' },
    { company_name: 'Gestoría Ballesteros', email: 'info@gestoriaballesteros.es', city: 'Benidorm', segment: 'asesoria' },
    { company_name: 'Morales & Zaragoza Asesoría', email: 'info@moraleszaragoza.com', city: 'Benidorm', segment: 'asesoria' },
    { company_name: 'Asesoría Miguel Ángel García', email: 'info@asesoriamiguelangel.com', city: 'Benidorm', segment: 'asesoria' },
    { company_name: 'AGS Asesoría y Consultoría', email: 'ags@agsasesoria.com', city: 'Benidorm', segment: 'asesoria' },
    { company_name: 'Neofin Asesores', email: 'info@neofin.es', city: 'Benidorm', segment: 'asesoria' },
    { company_name: 'TributaLey (Asesoría NG)', email: 'info@asesoriang.com', city: 'Valencia', segment: 'asesoria' },
    { company_name: 'Confialia Asesores', email: 'info@confialia.com', city: 'Palma de Mallorca', segment: 'asesoria' },
    { company_name: 'Ibinova Asesores', email: 'info@ibinovaasesores.es', city: 'Ibiza', segment: 'asesoria' },
    { company_name: 'Asesores del Aljarafe', email: 'info@asesoresdelaljarafe.com', city: 'Sevilla', segment: 'asesoria' },
    { company_name: 'Zamorano Cruz Asesores', email: 'info@zamoranocruz.com', city: 'Sevilla', segment: 'asesoria' },
  ];

  const missingSeedLeads = SEED_ASESORIAS.filter(
    (seed) => !leads.some((l) => l.email.toLowerCase() === seed.email.toLowerCase())
  );

  const missingPropietarios = SEED_PROPIETARIOS.filter(
    (seed) => !leads.some((l) => l.email.toLowerCase() === seed.email.toLowerCase())
  );

  const seedLeadBatch = async (batch: Array<{ company_name: string; email: string; city: string; segment: OutreachSegment }>) => {
    if (!adminToken || batch.length === 0) return;
    const resp = await fetch('/api/admin-outreach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ leads: batch }),
    });
    if (resp.ok) {
      fetchOutreachLeads(adminToken);
    } else {
      const err = await resp.json().catch(() => ({}));
      setMetricsError(err?.error || 'Ejecuta supabase/outreach_leads.sql en Supabase para importar la lista.');
    }
  };

  const handleSeedMalagaLeads = () =>
    seedLeadBatch(
      (missingSeedLeads.length > 0 ? missingSeedLeads : SEED_ASESORIAS).map((l) => ({
        ...l,
        segment: 'asesoria' as const,
      }))
    );

  const handleSeedPropietarios = () =>
    seedLeadBatch(missingPropietarios.length > 0 ? missingPropietarios : SEED_PROPIETARIOS);

  const handleUpdateLeadStatus = async (id: string, status: OutreachStatus) => {
    if (!adminToken) return;
    const resp = await fetch('/api/admin-outreach', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id, status }),
    });
    if (resp.ok) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status, sent_at: status === 'enviado' && !l.sent_at ? new Date().toISOString() : l.sent_at }
            : l
        )
      );
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!adminToken) return;
    const resp = await fetch(`/api/admin-outreach?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (resp.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleSendOutreachBatch = async () => {
    if (!adminToken) return;
    setSendingOutreach(true);
    setOutreachSendMsg(null);
    setMetricsError(null);
    try {
      const resp = await fetch('/api/cron-outreach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ limit: 15 }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setMetricsError(data?.error || 'Error enviando lote de emails.');
        return;
      }
      setOutreachSendMsg(`Lote completado: ${data.sentCount || 0} emails enviados desde info@turnexo.app.`);
      fetchOutreachLeads(adminToken);
    } catch {
      setMetricsError('No se pudo conectar con /api/cron-outreach.');
    } finally {
      setSendingOutreach(false);
    }
  };

  const fetchRealMetrics = useCallback(async (tokenToUse: string) => {
    if (!tokenToUse) return;
    setLoadingMetrics(true);
    setMetricsError(null);
    try {
      const resp = await fetch('/api/admin-metrics', {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      if (resp.status === 401) {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        sessionStorage.removeItem(SESSION_TOKEN_KEY);
        setIsAuthenticated(false);
        setAdminToken('');
        setAuthError('Sesión de administrador expirada. Vuelve a introducir la contraseña.');
        return;
      }
      const data = await resp.json();
      if (!resp.ok) {
        setMetricsError(data?.error || 'Error al cargar datos de Supabase.');
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
      if (data.totals) {
        setPlatformTotals({
          reservationsCount: Number(data.totals.reservationsCount || 0),
          cleaningTasksCount: Number(data.totals.cleaningTasksCount || 0),
        });
      }
    } catch {
      setMetricsError('No se pudo conectar con /api/admin-metrics.');
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchRealMetrics(adminToken);
      fetchOutreachLeads(adminToken);
    }
  }, [isAuthenticated, adminToken, fetchRealMetrics, fetchOutreachLeads]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const resp = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.token) {
        sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
        sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
        setAdminToken(data.token);
        setIsAuthenticated(true);
        setPasswordInput('');
      } else if (resp.status === 503) {
        setAuthError('Falta configurar ADMIN_PASSWORD en las variables de entorno de Vercel.');
      } else {
        setAuthError('Contraseña incorrecta. Acceso restringido al fundador.');
      }
    } catch {
      setAuthError('No se pudo verificar la contraseña con el servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    setAdminToken('');
    setIsAuthenticated(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Por seguridad, actualiza la variable ADMIN_PASSWORD directamente en Vercel → Environment Variables.');
    setShowChangePassModal(false);
    setNewAdminPass('');
  };

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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddUserModal(false);
  };

  const handleTogglePlan = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target || !adminToken) return;

    const nextPlan: 'plan_starter' | 'plan_pro' | 'plan_manager' =
      target.plan === 'plan_starter'
        ? 'plan_pro'
        : target.plan === 'plan_pro'
        ? 'plan_manager'
        : 'plan_starter';
    const nextSpend = nextPlan === 'plan_manager' ? 39 : nextPlan === 'plan_pro' ? 19 : 0;

    setUpdatingUserId(userId);
    try {
      const resp = await fetch('/api/admin-metrics', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          hostId: userId,
          plan: nextPlan,
          status: 'active',
        }),
      });
      if (resp.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, plan: nextPlan, monthlySpend: nextSpend, status: 'active' } : u
          )
        );
      } else {
        const err = await resp.json().catch(() => ({}));
        setMetricsError(err?.error || 'No se pudo actualizar el plan en Supabase.');
      }
    } catch {
      setMetricsError('Error de red al actualizar el plan.');
    } finally {
      setUpdatingUserId(null);
    }
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
            Datos en tiempo real de Supabase: {users.length} anfitriones · {platformTotals.reservationsCount} reservas · {platformTotals.cleaningTasksCount} limpiezas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchRealMetrics(adminToken)}
            disabled={loadingMetrics}
            className="px-3 py-2 text-xs font-mono font-bold uppercase text-[#141413] bg-white border border-[#D5CFC0] hover:bg-[#FAF9F5] flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={loadingMetrics ? 'animate-spin' : ''} />
            <span>{loadingMetrics ? 'Cargando...' : 'Actualizar'}</span>
          </button>
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
        {metricsError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-xs font-medium flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <span>{metricsError}</span>
          </div>
        )}
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
                onClick={() => fetchRealMetrics(adminToken)}
                disabled={loadingMetrics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-mono font-bold uppercase transition disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingMetrics ? 'animate-spin' : ''} />
                <span>{loadingMetrics ? 'Sincronizando...' : 'Actualizar'}</span>
              </button>
              <button
                type="button"
                onClick={() => exportUsersToCsv(users)}
                disabled={users.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F4E3D] hover:bg-[#163A2D] text-white text-xs font-mono font-bold uppercase transition disabled:opacity-50"
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

        {/* CRM DE PROSPECCIÓN Y CONTROL DE EMAILS */}
        <div className="bg-white border border-[#E2DDD2] p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#C85A32]">
                OUTREACH CRM · CONTROL DE CAPTACIÓN
              </span>
              <h3 className="text-base font-bold text-[#141413]">
                Prospección CRM ({leads.filter((l) => segmentFilter === 'all' || l.segment === segmentFilter).length})
              </h3>
              <p className="text-xs text-[#57554F]">
                Lleva el control de a quién has contactado desde <code className="font-mono">info@turnexo.app</code> (plantilla propia por segmento).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {missingSeedLeads.length > 0 && (
                <button
                  type="button"
                  onClick={handleSeedMalagaLeads}
                  className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#B24D28] text-white text-xs font-mono font-bold uppercase transition"
                >
                  + Cargar {missingSeedLeads.length} Asesorías
                </button>
              )}
              {missingPropietarios.length > 0 && (
                <button
                  type="button"
                  onClick={handleSeedPropietarios}
                  className="px-3 py-1.5 bg-[#1F4E3D] hover:bg-[#163A2D] text-white text-xs font-mono font-bold uppercase transition"
                >
                  + Cargar {missingPropietarios.length} Propietarios (OpenRTA)
                </button>
              )}
              {leads.some((l) => l.status === 'pendiente') && (
                <button
                  type="button"
                  onClick={handleSendOutreachBatch}
                  disabled={sendingOutreach}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F4E3D] hover:bg-[#163A2D] text-white text-xs font-mono font-bold uppercase transition disabled:opacity-50"
                >
                  <Mail size={13} />
                  <span>{sendingOutreach ? 'Enviando...' : 'Enviar 15 pendientes'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => fetchOutreachLeads(adminToken)}
                disabled={loadingLeads}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141413] hover:bg-[#2C2C29] text-white text-xs font-mono font-bold uppercase transition disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingLeads ? 'animate-spin' : ''} />
                <span>Refrescar</span>
              </button>
            </div>
          </div>

          {outreachSendMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 text-xs font-medium">
              {outreachSendMsg}
            </div>
          )}

          {/* Filtro por segmento */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'asesoria', label: 'Asesorías' },
                { id: 'propietario', label: 'Propietarios VUT' },
                { id: 'gestora', label: 'Gestoras' },
              ] as const
            ).map((seg) => {
              const count =
                seg.id === 'all' ? leads.length : leads.filter((l) => l.segment === seg.id).length;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setSegmentFilter(seg.id)}
                  className={`px-3 py-1.5 border font-mono text-[11px] font-bold uppercase transition ${
                    segmentFilter === seg.id
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-[#FAF9F5] text-[#57554F] border-[#E2DDD2] hover:text-[#141413]'
                  }`}
                >
                  {seg.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Resumen rápido de estados */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            {(['pendiente', 'enviado', 'respondido', 'registrado', 'descartado'] as const).map((st) => {
              const count = leads
                .filter((l) => segmentFilter === 'all' || l.segment === segmentFilter)
                .filter((l) => l.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setLeadFilter((prev) => (prev === st ? 'all' : st))}
                  className={`p-2.5 border text-left transition ${
                    leadFilter === st
                      ? 'border-[#141413] bg-[#FAF9F5]'
                      : 'border-[#E2DDD2] bg-white hover:bg-[#FAF9F5]'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase text-[#57554F] block">{st}</span>
                  <span className="text-lg font-black font-mono text-[#141413]">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Añadir lead manual */}
          <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <input
              type="text"
              value={newLeadCompany}
              onChange={(e) => setNewLeadCompany(e.target.value)}
              placeholder="Nombre asesoría o alojamiento"
              className="px-3 py-2 border border-[#D5CFC0] bg-white text-[#141413]"
              required
            />
            <input
              type="email"
              value={newLeadEmail}
              onChange={(e) => setNewLeadEmail(e.target.value)}
              placeholder="email@ejemplo.es"
              className="px-3 py-2 border border-[#D5CFC0] bg-white text-[#141413]"
              required
            />
            <input
              type="text"
              value={newLeadCity}
              onChange={(e) => setNewLeadCity(e.target.value)}
              placeholder="Ciudad (ej. Málaga)"
              className="px-3 py-2 border border-[#D5CFC0] bg-white text-[#141413]"
            />
            <select
              value={newLeadSegment}
              onChange={(e) => setNewLeadSegment(e.target.value as any)}
              className="px-3 py-2 border border-[#D5CFC0] bg-white text-[#141413]"
            >
              <option value="asesoria">Asesoría Fiscal</option>
              <option value="propietario">Propietario VUT</option>
              <option value="gestora">Gestora</option>
              <option value="otro">Otro</option>
            </select>
            <button
              type="submit"
              className="px-3 py-2 bg-[#141413] hover:bg-[#2C2C29] text-white font-mono font-bold uppercase transition"
            >
              + Añadir Lead
            </button>
          </form>

          {/* Tabla de leads */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E2DDD2] text-[10px] font-mono uppercase tracking-wider text-[#57554F]">
                  <th className="py-2 pr-3">Empresa / Alojamiento</th>
                  <th className="py-2 px-3">Segmento</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Ciudad</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3">Enviado</th>
                  <th className="py-2 pl-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE3]">
                {leads
                  .filter((l) => segmentFilter === 'all' || l.segment === segmentFilter)
                  .filter((l) => leadFilter === 'all' || l.status === leadFilter)
                  .map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#FAF9F5]">
                      <td className="py-2.5 pr-3 font-semibold text-[#141413]">{lead.company_name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            lead.segment === 'propietario'
                              ? 'bg-[#1F4E3D]/10 text-[#1F4E3D]'
                              : lead.segment === 'asesoria'
                              ? 'bg-[#C85A32]/10 text-[#C85A32]'
                              : 'bg-[#E8E4D9] text-[#57554F]'
                          }`}
                        >
                          {lead.segment}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#57554F]">{lead.email}</td>
                      <td className="py-2.5 px-3 text-[#57554F]">{lead.city || '—'}</td>
                      <td className="py-2.5 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as OutreachStatus)}
                          className="px-2 py-1 border border-[#D5CFC0] bg-white text-[11px] font-mono font-bold uppercase"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="enviado">Enviado</option>
                          <option value="respondido">Respondido</option>
                          <option value="registrado">Registrado</option>
                          <option value="descartado">Descartado</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#57554F]">
                        {lead.sent_at ? new Date(lead.sent_at).toLocaleDateString('es-ES') : '—'}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-[11px] font-mono text-red-600 hover:underline"
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-[#57554F]">
                      Aún no hay leads guardados. Ejecuta <code className="font-mono">supabase/outreach_leads.sql</code> en Supabase y pulsa <strong>+ Cargar 12 Asesorías</strong>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
