import crypto from 'node:crypto';

/**
 * Serverless Function (/api/admin-outreach)
 * CRM / Prospección de emails salientes en Supabase (`outreach_leads`).
 * Protegido con token HMAC firmado con ADMIN_PASSWORD.
 */

function verifyAdminToken(authHeader: string | undefined, secret: string): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  const adminSecret = process.env.ADMIN_PASSWORD;
  if (!adminSecret) {
    res.status(503).json({ error: 'ADMIN_PASSWORD no configurada en el servidor' });
    return;
  }

  if (!verifyAdminToken(req.headers?.authorization, adminSecret)) {
    res.status(401).json({ error: 'Sesión de administrador expirada o no autorizada' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(503).json({ error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel' });
    return;
  }

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    try {
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/outreach_leads?select=*&order=created_at.desc`,
        { headers }
      );
      if (!resp.ok) {
        const errText = await resp.text();
        res.status(502).json({ error: `Error leyendo outreach_leads (${resp.status}): ${errText}` });
        return;
      }
      const leads = await resp.json();
      res.status(200).json({ leads });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error cargando prospección' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const items = Array.isArray(body.leads) ? body.leads : [body];

      const payload = items
        .filter((item: any) => item?.email && item?.company_name)
        .map((item: any) => ({
          id: item.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          company_name: String(item.company_name).trim(),
          email: String(item.email).trim().toLowerCase(),
          city: String(item.city || '').trim(),
          segment: ['asesoria', 'gestora', 'otro'].includes(item.segment) ? item.segment : 'asesoria',
          status: ['pendiente', 'enviado', 'respondido', 'registrado', 'descartado'].includes(item.status)
            ? item.status
            : 'pendiente',
          sent_at: item.sent_at || null,
          notes: String(item.notes || '').trim(),
        }));

      if (payload.length === 0) {
        res.status(400).json({ error: 'Faltan company_name o email' });
        return;
      }

      const resp = await fetch(
        `${supabaseUrl}/rest/v1/outreach_leads?on_conflict=email`,
        {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=representation' },
          body: JSON.stringify(payload),
        }
      );

      if (!resp.ok) {
        const errText = await resp.text();
        res.status(502).json({ error: `Error guardando leads (${resp.status}): ${errText}` });
        return;
      }
      const created = await resp.json();
      res.status(200).json({ ok: true, created });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error creando lead' });
    }
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const id = typeof body.id === 'string' ? body.id.trim() : '';
      if (!id) {
        res.status(400).json({ error: 'Falta id del lead' });
        return;
      }

      const updates: Record<string, any> = {};
      if (['pendiente', 'enviado', 'respondido', 'registrado', 'descartado'].includes(body.status)) {
        updates.status = body.status;
        if (body.status === 'enviado' && !body.sent_at) {
          updates.sent_at = new Date().toISOString();
        }
      }
      if (typeof body.notes === 'string') {
        updates.notes = body.notes;
      }
      if (body.sent_at) {
        updates.sent_at = body.sent_at;
      }

      const resp = await fetch(
        `${supabaseUrl}/rest/v1/outreach_leads?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify(updates),
        }
      );

      if (!resp.ok) {
        const errText = await resp.text();
        res.status(502).json({ error: `Error actualizando lead (${resp.status}): ${errText}` });
        return;
      }
      const updated = await resp.json();
      res.status(200).json({ ok: true, lead: updated?.[0] || null });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error actualizando lead' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      const id = typeof req.query?.id === 'string' ? req.query.id.trim() : '';
      if (!id) {
        res.status(400).json({ error: 'Falta id' });
        return;
      }
      const resp = await fetch(
        `${supabaseUrl}/rest/v1/outreach_leads?id=eq.${encodeURIComponent(id)}`,
        { method: 'DELETE', headers }
      );
      if (!resp.ok) {
        const errText = await resp.text();
        res.status(502).json({ error: `Error borrando lead (${resp.status}): ${errText}` });
        return;
      }
      res.status(200).json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error borrando lead' });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
