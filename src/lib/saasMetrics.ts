import { HostAccount, isSupabaseConfigured, supabase } from './supabase';

export interface SaasUser {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  whatsapp: string;
  plan: 'plan_starter' | 'plan_pro' | 'plan_manager';
  status: 'active' | 'trialing' | 'canceled';
  registeredAt: string;
  propertiesCount: number;
  monthlySpend: number; // 0, 19, 39
  lastActiveAt: string;
}

export interface SaasMetrics {
  totalUsers: number;
  freeUsers: number;
  payingUsers: number;
  mrr: number; // Monthly Recurring Revenue (€)
  arr: number; // Annual Recurring Revenue (€)
  totalProperties: number;
  conversionRate: number; // % de Free a Paid
  arpu: number; // Average Revenue Per User (€)
}

export const INITIAL_SAAS_USERS: SaasUser[] = [
  {
    id: 'user-001',
    email: 'carlos.m@costasol.es',
    fullName: 'Carlos Mendizábal',
    companyName: 'Costa Sol Apartments',
    whatsapp: '+34 600 11 22 33',
    plan: 'plan_pro',
    status: 'active',
    registeredAt: '2026-10-15',
    propertiesCount: 3,
    monthlySpend: 19,
    lastActiveAt: 'Hoy a las 14:20',
  },
  {
    id: 'user-002',
    email: 'marina.playa@gmail.com',
    fullName: 'Marina Valero',
    companyName: 'Ático Marina',
    whatsapp: '+34 655 44 33 22',
    plan: 'plan_starter',
    status: 'active',
    registeredAt: '2026-10-28',
    propertiesCount: 1,
    monthlySpend: 0,
    lastActiveAt: 'Ayer',
  },
  {
    id: 'user-003',
    email: 'gestiones.alberto@surstays.com',
    fullName: 'Alberto Rivas',
    companyName: 'SurStays Gestora SL',
    whatsapp: '+34 688 99 00 11',
    plan: 'plan_manager',
    status: 'active',
    registeredAt: '2026-10-02',
    propertiesCount: 8,
    monthlySpend: 39,
    lastActiveAt: 'Hoy a las 11:45',
  },
  {
    id: 'user-004',
    email: 'elena.rural@holidays.es',
    fullName: 'Elena Fuentes',
    companyName: 'Casas Ronda',
    whatsapp: '+34 611 77 88 99',
    plan: 'plan_pro',
    status: 'trialing',
    registeredAt: '2026-11-04',
    propertiesCount: 2,
    monthlySpend: 19,
    lastActiveAt: 'Hace 2 horas',
  },
  {
    id: 'user-005',
    email: 'pedro.host@outlook.com',
    fullName: 'Pedro Morales',
    companyName: 'Studio Centro',
    whatsapp: '+34 677 33 22 11',
    plan: 'plan_starter',
    status: 'active',
    registeredAt: '2026-11-07',
    propertiesCount: 1,
    monthlySpend: 0,
    lastActiveAt: 'Hoy a las 09:10',
  },
];

export function computeSaasMetrics(users: SaasUser[]): SaasMetrics {
  const totalUsers = users.length;
  const payingUsers = users.filter((u) => u.monthlySpend > 0 && u.status !== 'canceled').length;
  const freeUsers = totalUsers - payingUsers;
  const mrr = users.reduce((sum, u) => (u.status !== 'canceled' ? sum + u.monthlySpend : sum), 0);
  const arr = mrr * 12;
  const totalProperties = users.reduce((sum, u) => sum + u.propertiesCount, 0);
  const conversionRate = totalUsers > 0 ? Math.round((payingUsers / totalUsers) * 100) : 0;
  const arpu = payingUsers > 0 ? Math.round((mrr / payingUsers) * 100) / 100 : 0;

  return {
    totalUsers,
    freeUsers,
    payingUsers,
    mrr,
    arr,
    totalProperties,
    conversionRate,
    arpu,
  };
}

export function exportUsersToCsv(users: SaasUser[], fileName = 'usuarios_turnexo.csv'): void {
  const headers = [
    'ID',
    'Nombre',
    'Email',
    'Empresa',
    'WhatsApp',
    'Plan',
    'Gasto Mensual (€)',
    'Nº Alojamientos',
    'Estado',
    'Fecha Registro',
    'Última Actividad',
  ];

  const rows = users.map((u) => [
    u.id,
    `"${u.fullName.replace(/"/g, '""')}"`,
    u.email,
    `"${u.companyName.replace(/"/g, '""')}"`,
    u.whatsapp,
    u.plan,
    u.monthlySpend,
    u.propertiesCount,
    u.status,
    u.registeredAt,
    u.lastActiveAt,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
