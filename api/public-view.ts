/**
 * Serverless Function (/api/public-view)
 * Sirve y actualiza de forma segura los datos estrictamente necesarios para las vistas públicas
 * sin login (/g/:slug para huéspedes y /c/:token para limpiadoras), usando SUPABASE_SERVICE_ROLE_KEY.
 *
 * Esto permite eliminar por completo las políticas `to anon` abiertas en Supabase RLS.
 */

const GUEST_UPDATABLE_RESERVATION_FIELDS = [
  'requested_extras',
  'late_checkout_requested',
  'estimated_arrival_time',
  'estimated_departure_time',
  'arrival_instructions_confirmed',
  'guest_arrived_at',
] as const;

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return {
    supabaseUrl,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  };
}

export default async function handler(req: any, res: any) {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    res.status(503).json({ error: 'Supabase no configurado en el servidor' });
    return;
  }

  const { supabaseUrl, headers } = cfg;

  if (req.method === 'GET') {
    const type = typeof req.query?.type === 'string' ? req.query.type.trim() : '';

    if (type === 'guest') {
      const slug = typeof req.query?.slug === 'string' ? req.query.slug.trim() : '';
      if (!slug || slug.length > 120) {
        res.status(400).json({ error: 'Slug inválido' });
        return;
      }

      try {
        const propResp = await fetch(
          `${supabaseUrl}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
          { headers }
        );
        if (!propResp.ok) {
          res.status(502).json({ error: 'Error consultando propiedad' });
          return;
        }
        const props = (await propResp.json()) as any[];
        if (!Array.isArray(props) || props.length === 0) {
          res.status(404).json({ error: 'Alojamiento no encontrado' });
          return;
        }

        const property = props[0];
        const resvResp = await fetch(
          `${supabaseUrl}/rest/v1/reservations?property_id=eq.${encodeURIComponent(property.id)}&select=*&order=check_in.asc`,
          { headers }
        );
        const reservations = resvResp.ok ? ((await resvResp.json()) as any[]) : [];

        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({ properties: [property], reservations });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Error interno' });
      }
      return;
    }

    if (type === 'cleaner') {
      const token = typeof req.query?.token === 'string' ? req.query.token.trim() : '';
      if (!token || token.length > 120) {
        res.status(400).json({ error: 'Token inválido' });
        return;
      }

      try {
        const cleanerResp = await fetch(
          `${supabaseUrl}/rest/v1/cleaners?magic_token=eq.${encodeURIComponent(token)}&select=*&limit=1`,
          { headers }
        );
        if (!cleanerResp.ok) {
          res.status(502).json({ error: 'Error consultando limpiadora' });
          return;
        }
        const cleaners = (await cleanerResp.json()) as any[];
        if (!Array.isArray(cleaners) || cleaners.length === 0) {
          res.status(404).json({ error: 'Enlace de limpiadora no válido' });
          return;
        }

        const cleaner = cleaners[0];
        const propsResp = await fetch(
          `${supabaseUrl}/rest/v1/properties?host_id=eq.${encodeURIComponent(cleaner.host_id)}&select=*&order=created_at.asc`,
          { headers }
        );
        const properties = propsResp.ok ? ((await propsResp.json()) as any[]) : [];
        const propIds = properties.map((p) => p.id).filter(Boolean);

        let reservations: any[] = [];
        let tasks: any[] = [];
        if (propIds.length > 0) {
          const inList = propIds.map((id) => `"${String(id).replace(/"/g, '')}"`).join(',');
          const [resvResp, tasksResp] = await Promise.all([
            fetch(
              `${supabaseUrl}/rest/v1/reservations?property_id=in.(${encodeURIComponent(inList)})&select=*&order=check_in.asc`,
              { headers }
            ),
            fetch(
              `${supabaseUrl}/rest/v1/cleaning_tasks?property_id=in.(${encodeURIComponent(inList)})&select=*&order=date.asc`,
              { headers }
            ),
          ]);
          reservations = resvResp.ok ? ((await resvResp.json()) as any[]) : [];
          tasks = tasksResp.ok ? ((await tasksResp.json()) as any[]) : [];
        }

        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({ cleaners: [cleaner], properties, reservations, tasks });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Error interno' });
      }
      return;
    }

    res.status(400).json({ error: 'Parámetro type inválido (guest | cleaner)' });
    return;
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const action = body?.action;

    if (action === 'update_reservation') {
      const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
      const resData = body.reservation;
      if (!slug || !resData?.id) {
        res.status(400).json({ error: 'Faltan slug o reservation.id' });
        return;
      }

      try {
        // Verificar que la propiedad existe para ese slug
        const propResp = await fetch(
          `${supabaseUrl}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`,
          { headers }
        );
        const props = propResp.ok ? ((await propResp.json()) as any[]) : [];
        if (props.length === 0) {
          res.status(404).json({ error: 'Alojamiento no encontrado' });
          return;
        }
        const propertyId = props[0].id;

        // Verificar que la reserva pertenece a esa propiedad
        const existingResp = await fetch(
          `${supabaseUrl}/rest/v1/reservations?id=eq.${encodeURIComponent(resData.id)}&property_id=eq.${encodeURIComponent(propertyId)}&select=id&limit=1`,
          { headers }
        );
        const existing = existingResp.ok ? ((await existingResp.json()) as any[]) : [];
        if (existing.length === 0) {
          res.status(403).json({ error: 'Reserva no pertenece a este alojamiento' });
          return;
        }

        // Solo permitir campos editables por el huésped (nunca approved_extras ni late_checkout_approved)
        const patch: Record<string, any> = { updated_at: new Date().toISOString() };
        const fieldMap: Record<(typeof GUEST_UPDATABLE_RESERVATION_FIELDS)[number], string> = {
          requested_extras: 'requestedExtras',
          late_checkout_requested: 'lateCheckoutRequested',
          estimated_arrival_time: 'estimatedArrivalTime',
          estimated_departure_time: 'estimatedDepartureTime',
          arrival_instructions_confirmed: 'arrivalInstructionsConfirmed',
          guest_arrived_at: 'guestArrivedAt',
        };
        for (const dbCol of GUEST_UPDATABLE_RESERVATION_FIELDS) {
          const jsKey = fieldMap[dbCol];
          if (resData[jsKey] !== undefined) {
            patch[dbCol] = resData[jsKey];
          }
        }

        const updateResp = await fetch(
          `${supabaseUrl}/rest/v1/reservations?id=eq.${encodeURIComponent(resData.id)}&property_id=eq.${encodeURIComponent(propertyId)}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(patch),
          }
        );
        if (!updateResp.ok) {
          res.status(502).json({ error: 'Error actualizando reserva' });
          return;
        }
        res.status(200).json({ ok: true });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Error interno' });
      }
      return;
    }

    if (action === 'update_cleaning_task') {
      const token = typeof body.token === 'string' ? body.token.trim() : '';
      const task = body.task;
      if (!token || !task?.id || !task?.propertyId) {
        res.status(400).json({ error: 'Faltan token o datos de la tarea' });
        return;
      }

      try {
        // Verificar limpiadora por magic_token
        const cleanerResp = await fetch(
          `${supabaseUrl}/rest/v1/cleaners?magic_token=eq.${encodeURIComponent(token)}&select=id,host_id&limit=1`,
          { headers }
        );
        const cleaners = cleanerResp.ok ? ((await cleanerResp.json()) as any[]) : [];
        if (cleaners.length === 0) {
          res.status(403).json({ error: 'Token de limpiadora inválido' });
          return;
        }
        const cleaner = cleaners[0];

        // Verificar que la propiedad pertenece al mismo host_id de la limpiadora
        const propResp = await fetch(
          `${supabaseUrl}/rest/v1/properties?id=eq.${encodeURIComponent(task.propertyId)}&host_id=eq.${encodeURIComponent(cleaner.host_id)}&select=id&limit=1`,
          { headers }
        );
        const props = propResp.ok ? ((await propResp.json()) as any[]) : [];
        if (props.length === 0) {
          res.status(403).json({ error: 'Propiedad no autorizada para esta limpiadora' });
          return;
        }

        const allowedStatuses = ['pending', 'in_progress', 'completed'];
        const safeStatus = allowedStatuses.includes(task.status) ? task.status : 'pending';

        const upsertResp = await fetch(`${supabaseUrl}/rest/v1/cleaning_tasks`, {
          method: 'POST',
          headers: {
            ...headers,
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            id: task.id,
            property_id: task.propertyId,
            reservation_id: task.reservationId,
            date: task.date,
            cleaner_id: task.cleanerId || cleaner.id,
            status: safeStatus,
            photos_uploaded: Array.isArray(task.photosUploaded) ? task.photosUploaded : [],
            checklist: Array.isArray(task.checklist) ? task.checklist : [],
            incidents: Array.isArray(task.incidents) ? task.incidents : [],
            updated_at: new Date().toISOString(),
          }),
        });

        if (!upsertResp.ok) {
          res.status(502).json({ error: 'Error guardando tarea de limpieza' });
          return;
        }
        res.status(200).json({ ok: true });
      } catch (err: any) {
        res.status(500).json({ error: err?.message || 'Error interno' });
      }
      return;
    }

    res.status(400).json({ error: 'Acción no soportada' });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
