-- ============================================================================
-- TURNEXO · ESQUEMA SQL MULTI-TENANT PARA SUPABASE
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. PERFIL DE ANFITRIÓN (SUSCRIPCIÓN Y MÓDULOS)
create table if not exists public.hosts (
  id text primary key,
  email text not null,
  full_name text,
  company_name text,
  whatsapp text,
  subscription_plan text not null default 'plan_starter' check (subscription_plan in ('plan_starter', 'plan_pro', 'plan_manager', 'module_cleanings', 'module_guide', 'pack_complete')),
  subscription_status text not null default 'trialing' check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- 2. PROPIEDADES / ALOJAMIENTOS
create table if not exists public.properties (
  id text primary key,
  host_id text not null default 'demo-host',
  name text not null,
  slug text not null unique,
  address text not null default '',
  host_whatsapp text not null default '',
  google_maps_url text not null default '',
  airbnb_ical_url text not null default '',
  booking_ical_url text not null default '',
  default_cleaner_id text,
  cleaning_fee numeric(10,2) not null default 40,
  check_in_time text not null default '15:00',
  check_out_time text not null default '11:00',
  late_checkout_price numeric(10,2) not null default 35,
  late_checkout_until text not null default '17:00',
  wifi_ssid text not null default '',
  wifi_password text not null default '',
  door_code text not null default '',
  intercom_code text not null default '',
  check_in_instructions text not null default '',
  check_out_instructions text not null default '',
  departure_checklist jsonb not null default '["Apagar las luces","Apagar AC","Dejar las llaves encima de la mesa","Tirar la basura"]'::jsonb,
  require_video_to_unlock_codes boolean not null default true,
  videos jsonb not null default '[]'::jsonb,
  extras jsonb not null default '[]'::jsonb,
  house_rules jsonb not null default '[]'::jsonb,
  appliances_guide text not null default '',
  local_recommendations jsonb not null default '[]'::jsonb,
  custom_checklist jsonb not null default '[]'::jsonb,
  modules_enabled jsonb not null default '{"cleanings": true, "guestGuide": true}'::jsonb,
  last_synced_at timestamptz default now(),
  created_at timestamptz not null default now()
);

-- 3. LIMPIADORAS (CON ENLACE MÁGICO ÚNICO /c/:magic_token)
create table if not exists public.cleaners (
  id text primary key,
  host_id text not null default 'demo-host',
  name text not null,
  phone text not null default '',
  magic_token text not null unique,
  created_at timestamptz not null default now()
);

-- 4. RESERVAS (SINCRONIZADAS POR ICAL BAJO DEMANDA CADA 30 MIN)
create table if not exists public.reservations (
  id text primary key,
  property_id text not null references public.properties(id) on delete cascade,
  source text not null default 'Airbnb',
  guest_name text not null default 'Huésped',
  check_in date not null,
  check_out date not null,
  requested_extras jsonb not null default '[]'::jsonb,
  approved_extras jsonb not null default '[]'::jsonb,
  late_checkout_requested boolean not null default false,
  late_checkout_approved boolean not null default false,
  late_checkout_time text,
  late_checkout_paid_amount numeric(10,2),
  estimated_arrival_time text,
  estimated_departure_time text,
  arrival_instructions_confirmed boolean not null default false,
  guest_arrived_at text,
  updated_at timestamptz not null default now()
);

alter table public.reservations add column if not exists approved_extras jsonb not null default '[]'::jsonb;

-- 5. TAREAS DE LIMPIEZA
create table if not exists public.cleaning_tasks (
  id text primary key,
  property_id text not null references public.properties(id) on delete cascade,
  reservation_id text not null references public.reservations(id) on delete cascade,
  date date not null,
  cleaner_id text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  photos_uploaded jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  incidents jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 6. ROW LEVEL SECURITY (RLS)
alter table public.hosts enable row level security;
alter table public.properties enable row level security;
alter table public.cleaners enable row level security;
alter table public.reservations enable row level security;
alter table public.cleaning_tasks enable row level security;

drop policy if exists "Public access hosts" on public.hosts;
create policy "Public access hosts" on public.hosts for all using (true) with check (true);

drop policy if exists "Public access properties" on public.properties;
create policy "Public access properties" on public.properties for all using (true) with check (true);

drop policy if exists "Public access cleaners" on public.cleaners;
create policy "Public access cleaners" on public.cleaners for all using (true) with check (true);

drop policy if exists "Public access reservations" on public.reservations;
create policy "Public access reservations" on public.reservations for all using (true) with check (true);

drop policy if exists "Public access cleaning_tasks" on public.cleaning_tasks;
create policy "Public access cleaning_tasks" on public.cleaning_tasks for all using (true) with check (true);

-- 7. TRIGGER AUTOMÁTICO: AL CREARSE UN USUARIO EN AUTH (GOOGLE O EMAIL), INSERTAR EN PUBLIC.HOSTS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.hosts (id, email, full_name, company_name, subscription_plan, subscription_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Anfitrión'),
    'Mis Alojamientos',
    coalesce(new.raw_user_meta_data->>'subscription_plan', 'plan_starter'),
    'trialing'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.hosts.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sincronizar usuarios que ya existan previamente en auth.users
insert into public.hosts (id, email, full_name, company_name, subscription_plan, subscription_status)
select 
  id, 
  coalesce(email, ''), 
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1), 'Anfitrión'),
  'Mis Alojamientos',
  coalesce(raw_user_meta_data->>'subscription_plan', 'plan_starter'),
  'trialing'
from auth.users
on conflict (id) do nothing;
