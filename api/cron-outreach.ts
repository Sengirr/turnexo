import crypto from 'node:crypto';

/**
 * Serverless Function (/api/cron-outreach)
 * Envía automáticamente un lote diario (por defecto 6) de leads `pendiente`
 * desde `info@turnexo.app` usando Hostinger Mail API y los marca como `enviado` en Supabase.
 *
 * Acepta:
 * - POST desde /admin autenticado con token HMAC (ADMIN_PASSWORD)
 * - GET desde Vercel Cron (verificando CRON_SECRET si existe, o cabecera x-vercel-cron)
 *
 * Variables requeridas en Vercel:
 * - HOSTINGER_MAIL_API_KEY
 * - SUPABASE_URL (o VITE_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ADMIN_PASSWORD
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

function buildEmailBody(companyName: string): string {
  return [
    `Hola equipo de ${companyName},`,
    '',
    'Os escribo desde Turnexo. Trabajamos con propietarios de viviendas turísticas en la Costa del Sol para que no lleguen al cierre trimestral con extractos sueltos de Airbnb y Booking sin facturar.',
    '',
    'Con Turnexo suben el Excel/CSV de cobros de Airbnb o Booking y en 1 clic generan todas las facturas legales con IVA del 10% (simplificadas y completas) más el resumen trimestral listo para entregaros.',
    '',
    'Tienen un plan gratuito para 1 alojamiento por si queréis recomendarlo a algún cliente que os dé más guerra con la documentación. Si queréis probarlo o ver cómo funciona en 1 minuto, decidme y os paso acceso.',
    '',
    'Un saludo,',
    'Iván Álvarez',
    'Turnexo · https://turnexo.app',
  ].join('\n');
}

async function resolveMailboxId(mailApiKey: string): Promise<string | null> {
  if (process.env.HOSTINGER_MAILBOX_ID) {
    return process.env.HOSTINGER_MAILBOX_ID;
  }
  const resp = await fetch('https://api.mail.hostinger.com/api/v1/me', {
    headers: { Authorization: `Bearer ${mailApiKey}` },
  });
  if (!resp.ok) return null;
  const data = (await resp.json()) as any;
  return data?.data?.mailboxes?.[0]?.resourceId || null;
}

export default async function handler(req: any, res: any) {
  const adminSecret = process.env.ADMIN_PASSWORD || '';
  const cronSecret = process.env.CRON_SECRET || '';
  const authHeader = req.headers?.authorization as string | undefined;

  const isAdminPost = req.method === 'POST' && adminSecret && verifyAdminToken(authHeader, adminSecret);
  const isCronGet =
    req.method === 'GET' &&
    ((cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (!cronSecret && req.headers?.['x-vercel-cron'] === '1'));

  if (!isAdminPost && !isCronGet) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const mailApiKey = process.env.HOSTINGER_MAIL_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!mailApiKey) {
    res.status(503).json({ error: 'Falta configurar HOSTINGER_MAIL_API_KEY en Vercel' });
    return;
  }
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(503).json({ error: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const batchLimit = Math.min(20, Math.max(1, Number(body?.limit || process.env.OUTREACH_DAILY_LIMIT || 6)));

  const sbHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const mailboxId = await resolveMailboxId(mailApiKey);
    if (!mailboxId) {
      res.status(502).json({ error: 'No se pudo obtener el mailboxId de Hostinger Mail API' });
      return;
    }

    const leadsResp = await fetch(
      `${supabaseUrl}/rest/v1/outreach_leads?status=eq.pendiente&order=created_at.asc&limit=${batchLimit}`,
      { headers: sbHeaders }
    );
    if (!leadsResp.ok) {
      const errText = await leadsResp.text();
      res.status(502).json({ error: `Error leyendo leads pendientes: ${errText}` });
      return;
    }

    const pendingLeads = (await leadsResp.json()) as any[];
    if (pendingLeads.length === 0) {
      res.status(200).json({ ok: true, sentCount: 0, message: 'No hay leads pendientes.' });
      return;
    }

    const results: Array<{ email: string; ok: boolean; status: number }> = [];
    let sentCount = 0;

    for (const lead of pendingLeads) {
      const sendResp = await fetch(
        `https://api.mail.hostinger.com/api/v1/mailboxes/${encodeURIComponent(mailboxId)}/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mailApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: [lead.email],
            displayName: 'Iván Álvarez · Turnexo',
            subject: 'Facturas 10% IVA de Airbnb/Booking para vuestros clientes propietarios',
            text: buildEmailBody(lead.company_name),
          }),
        }
      );

      results.push({ email: lead.email, ok: sendResp.ok, status: sendResp.status });

      if (sendResp.ok) {
        sentCount += 1;
        await fetch(
          `${supabaseUrl}/rest/v1/outreach_leads?id=eq.${encodeURIComponent(lead.id)}`,
          {
            method: 'PATCH',
            headers: sbHeaders,
            body: JSON.stringify({
              status: 'enviado',
              sent_at: new Date().toISOString(),
            }),
          }
        );
      }
    }

    res.status(200).json({ ok: true, sentCount, results });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error ejecutando outreach' });
  }
}
