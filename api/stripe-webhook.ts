import crypto from 'node:crypto';

/**
 * Vercel Serverless Function (/api/stripe-webhook)
 * Recibe eventos de Stripe (checkout.session.completed, customer.subscription.deleted)
 * y actualiza automáticamente el plan del anfitrión en la tabla `hosts` de Supabase.
 *
 * Variables de entorno requeridas en Vercel:
 * - STRIPE_WEBHOOK_SECRET (whsec_...)
 * - SUPABASE_URL (o VITE_SUPABASE_URL)
 * - SUPABASE_SERVICE_ROLE_KEY (clave service_role de Supabase para saltar RLS)
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, item) => {
    const [k, v] = item.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const timestamp = parts['t'];
  const v1 = parts['v1'];
  if (!timestamp || !v1) return false;

  // Tolerancia estándar de 5 minutos para evitar ataques de replay
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (Number.isNaN(ageSeconds) || ageSeconds > 300) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(v1, 'hex');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

function resolvePlanFromSession(session: any): 'plan_pro' | 'plan_manager' {
  const metaPlan = session?.metadata?.plan;
  if (metaPlan === 'plan_pro' || metaPlan === 'plan_manager') {
    return metaPlan;
  }

  const proLinkId = process.env.STRIPE_PAYMENT_LINK_ID_PRO;
  const managerLinkId = process.env.STRIPE_PAYMENT_LINK_ID_MANAGER;
  if (managerLinkId && session?.payment_link === managerLinkId) return 'plan_manager';
  if (proLinkId && session?.payment_link === proLinkId) return 'plan_pro';

  // Fallback por importe cobrado (en céntimos):
  // Pro: 19€/mes (1900) o 190€/año (19000) -> si es >= 39000 o == 3900 es Microgestora;
  // mejor distinguir por tramos: 3900 (39€) o >= 30000 (390€) = plan_manager; 1900 (19€) o 19000 (190€) = plan_pro
  const amount = Number(session?.amount_total || 0);
  if (amount === 3900 || amount >= 30000) {
    return 'plan_manager';
  }
  return 'plan_pro';
}

async function updateHostPlanInSupabase(
  filter: { hostId?: string; email?: string },
  plan: string,
  status: 'active' | 'trialing'
): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Stripe Webhook] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Vercel');
    return false;
  }

  const queryParam = filter.hostId
    ? `id=eq.${encodeURIComponent(filter.hostId)}`
    : filter.email
    ? `email=eq.${encodeURIComponent(filter.email.toLowerCase())}`
    : null;

  if (!queryParam) return false;

  const response = await fetch(`${supabaseUrl}/rest/v1/hosts?${queryParam}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      subscription_plan: plan,
      subscription_status: status,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Stripe Webhook] Error actualizando Supabase:', response.status, errText);
    return false;
  }
  return true;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sigHeader = req.headers?.['stripe-signature'];
  if (!webhookSecret || !sigHeader || typeof sigHeader !== 'string') {
    res.status(400).json({ error: 'Falta STRIPE_WEBHOOK_SECRET o cabecera stripe-signature' });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    if (!verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
      res.status(400).json({ error: 'Firma de Stripe inválida' });
      return;
    }

    const event = JSON.parse(rawBody);

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      const hostId = session?.client_reference_id || session?.metadata?.host_id;
      const email = session?.customer_details?.email || session?.customer_email;
      const targetPlan = resolvePlanFromSession(session);

      await updateHostPlanInSupabase({ hostId, email }, targetPlan, 'active');
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data?.object;
      const hostId = sub?.metadata?.host_id;
      const email = sub?.metadata?.email;
      if (hostId || email) {
        await updateHostPlanInSupabase({ hostId, email }, 'plan_starter', 'active');
      }
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook] Error procesando evento:', err);
    res.status(500).json({ error: err?.message || 'Error interno en webhook' });
  }
}
