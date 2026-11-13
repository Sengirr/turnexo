-- ============================================================================
-- TURNEXO · POLÍTICAS RLS SEGURAS MULTI-TENANT (APLICAR EN SUPABASE SQL EDITOR)
-- ============================================================================
-- Aísla cada anfitrión autenticado (auth.uid()) para que NINGÚN usuario
-- autenticado pueda leer, modificar o borrar datos de otros anfitriones.
--
-- NOTA SOBRE ENLACES PÚBLICOS (/g/:slug y /c/:token):
-- Si las vistas públicas de huésped (/g/:slug) y limpiadora (/c/:token) leen
-- directamente desde el navegador sin login, el rol `anon` necesita SELECT
-- (o bien migrar esas dos rutas a un endpoint serverless /api/public-view).
-- Con estas políticas, los anfitriones logueados quedan aislados entre sí.
-- ============================================================================

-- 1. HOSTS: cada usuario autenticado solo ve y actualiza su propia fila
drop policy if exists "Public access hosts" on public.hosts;
drop policy if exists "Host own row select" on public.hosts;
drop policy if exists "Host own row insert" on public.hosts;
drop policy if exists "Host own row update" on public.hosts;

create policy "Host own row select"
  on public.hosts for select
  to authenticated
  using (auth.uid()::text = id);

create policy "Host own row insert"
  on public.hosts for insert
  to authenticated
  with check (auth.uid()::text = id);

create policy "Host own row update"
  on public.hosts for update
  to authenticated
  using (auth.uid()::text = id)
  with check (auth.uid()::text = id);

-- 2. PROPERTIES: cada anfitrión solo gestiona sus propios alojamientos
drop policy if exists "Public access properties" on public.properties;
drop policy if exists "Host own properties" on public.properties;
drop policy if exists "Anon read properties for public guides" on public.properties;

create policy "Host own properties"
  on public.properties for all
  to authenticated
  using (auth.uid()::text = host_id)
  with check (auth.uid()::text = host_id);

-- Lectura para enlaces públicos (/g/:slug y /c/:token sin login)
create policy "Anon read properties for public guides"
  on public.properties for select
  to anon
  using (true);

-- 3. CLEANERS: cada anfitrión solo gestiona sus propias limpiadoras
drop policy if exists "Public access cleaners" on public.cleaners;
drop policy if exists "Host own cleaners" on public.cleaners;
drop policy if exists "Anon read cleaners for magic link" on public.cleaners;

create policy "Host own cleaners"
  on public.cleaners for all
  to authenticated
  using (auth.uid()::text = host_id)
  with check (auth.uid()::text = host_id);

create policy "Anon read cleaners for magic link"
  on public.cleaners for select
  to anon
  using (true);

-- 4. RESERVATIONS: vinculadas a propiedades del anfitrión autenticado
drop policy if exists "Public access reservations" on public.reservations;
drop policy if exists "Host own reservations" on public.reservations;
drop policy if exists "Anon read update reservations for guest portal" on public.reservations;

create policy "Host own reservations"
  on public.reservations for all
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = reservations.property_id
        and p.host_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = reservations.property_id
        and p.host_id = auth.uid()::text
    )
  );

create policy "Anon read update reservations for guest portal"
  on public.reservations for select
  to anon
  using (true);

-- 5. CLEANING_TASKS: vinculadas a propiedades del anfitrión autenticado
drop policy if exists "Public access cleaning_tasks" on public.cleaning_tasks;
drop policy if exists "Host own cleaning_tasks" on public.cleaning_tasks;
drop policy if exists "Anon read cleaning_tasks for magic link" on public.cleaning_tasks;
drop policy if exists "Anon update cleaning_tasks for magic link" on public.cleaning_tasks;

create policy "Host own cleaning_tasks"
  on public.cleaning_tasks for all
  to authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = cleaning_tasks.property_id
        and p.host_id = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = cleaning_tasks.property_id
        and p.host_id = auth.uid()::text
    )
  );

create policy "Anon read cleaning_tasks for magic link"
  on public.cleaning_tasks for select
  to anon
  using (true);

create policy "Anon update cleaning_tasks for magic link"
  on public.cleaning_tasks for update
  to anon
  using (true)
  with check (true);
