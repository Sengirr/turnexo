-- ============================================================================
-- TURNEXO · TABLA DE PROSPECCIÓN / CRM PARA PANEL /ADMIN
-- ============================================================================
-- Ejecutar una vez en Supabase SQL Editor.
-- Con RLS activado y sin políticas públicas: solo accesible desde /api/admin-outreach
-- usando SUPABASE_SERVICE_ROLE_KEY.
-- ============================================================================

create table if not exists public.outreach_leads (
  id text primary key,
  company_name text not null,
  email text not null unique,
  city text not null default '',
  segment text not null default 'asesoria' check (segment in ('asesoria', 'gestora', 'otro')),
  status text not null default 'pendiente' check (status in ('pendiente', 'enviado', 'respondido', 'registrado', 'descartado')),
  sent_at timestamptz,
  followup_sent_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.outreach_leads add column if not exists followup_sent_at timestamptz;
alter table public.outreach_leads enable row level security;
