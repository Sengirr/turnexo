import crypto from 'node:crypto';

/**
 * Serverless Function (/api/admin-auth)
 * Valida la contraseña de administrador en servidor usando ADMIN_PASSWORD (sin exponerla en el bundle).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.status(503).json({ error: 'ADMIN_PASSWORD no configurada en el servidor' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const candidate = typeof body.password === 'string' ? body.password.trim() : '';

  const expectedHash = crypto.createHash('sha256').update(expected, 'utf8').digest();
  const candidateHash = crypto.createHash('sha256').update(candidate, 'utf8').digest();

  if (!candidate || !crypto.timingSafeEqual(expectedHash, candidateHash)) {
    res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
    return;
  }

  res.status(200).json({ ok: true });
}
