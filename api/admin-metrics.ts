import crypto from 'node:crypto';

/**
 * Serverless Function (/api/admin-metrics)
 * Lee y actualiza métricas y cuentas reales de `hosts` y `properties` en Supabase
 * usando SUPABASE_SERVICE_ROLE_KEY. Protegido con token HMAC firmado con ADMIN_PASSWORD.
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

function getMonthlySpend(plan: string): number {
  if (plan === 'plan_manager') return 39;
  if (plan === 'plan_pro' || plan === 'pack_complete') return 19;
  return 0;
}

function normalizePlan(plan: string | null | undefined): 'plan_starter' | 'plan_pro' | 'plan_manager' {
  if (plan === 'plan_manager') return 'plan_manager';
  if (plan === 'plan_pro' || plan === 'pack_complete') return 'plan_pro';
  return 'plan_starter';
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
      const [hostsRes, propsRes, resvRes, tasksRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/hosts?select=*&order=created_at.desc`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/properties?select=id,host_id`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/reservations?select=id,property_id`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/cleaning_tasks?select=id,property_id`, { headers }),
      ]);

      if (!hostsRes.ok) {
        const errText = await hostsRes.text();
        res.status(hostsRes.status).json({ error: `Error leyendo hosts: ${errText}` });
        return;
      }

      const hosts = (await hostsRes.json()) as any[];
      const props = propsRes.ok ? ((await propsRes.json()) as any[]) : [];
      const reservations = resvRes.ok ? ((await resvRes.json()) as any[]) : [];
      const tasks = tasksRes.ok ? ((await tasksRes.json()) as any[]) : [];

      const propsCountByHost = new Map<string, number>();
      for (const p of props) {
        if (p.host_id) {
          propsCountByHost.set(p.host_id, (propsCountByHost.get(p.host_id) || 0) + 1);
        }
      }

      const users = hosts.map((h) => {
        const plan = normalizePlan(h.subscription_plan);
        const status: 'active' | 'trialing' | 'canceled' =
          h.subscription_status === 'canceled'
            ? 'canceled'
            : h.subscription_status === 'trialing'
            ? 'trialing'
            : 'active';
        const createdDate = h.created_at ? String(h.created_at).split('T')[0] : '';

        return {
          id: String(h.id),
          email: h.email || 'sin-email',
          fullName: h.full_name || 'Anfitrión',
          companyName: h.company_name || 'Mis Alojamientos',
          whatsapp: h.whatsapp || '—',
          plan,
          status,
          registeredAt: createdDate,
          propertiesCount: propsCountByHost.get(String(h.id)) || 0,
          monthlySpend: getMonthlySpend(plan),
          lastActiveAt: createdDate || 'Registrado',
        };
      });

      res.status(200).json({
        users,
        totals: {
          reservationsCount: reservations.length,
          cleaningTasksCount: tasks.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error cargando métricas' });
    }
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const hostId = typeof body.hostId === 'string' ? body.hostId.trim() : '';
      const plan = body.plan;
      const status = body.status;

      const allowedPlans = ['plan_starter', 'plan_pro', 'plan_manager'];
      const allowedStatuses = ['active', 'trialing', 'canceled'];
      if (!hostId || !allowedPlans.includes(plan) || !allowedStatuses.includes(status)) {
        res.status(400).json({ error: 'Parámetros inválidos (hostId, plan o status)' });
        return;
      }

      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/hosts?id=eq.${encodeURIComponent(hostId)}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify({
            subscription_plan: plan,
            subscription_status: status,
          }),
        }
      );

      if (!patchRes.ok) {
        const errText = await patchRes.text();
        res.status(patchRes.status).json({ error: `Error actualizando host: ${errText}` });
        return;
      }

      res.status(200).json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error actualizando usuario' });
    }
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
