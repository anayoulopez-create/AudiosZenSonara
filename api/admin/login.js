import { json, requireAdmin } from '../_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido.' });
  if (!requireAdmin(req, res)) return;
  return json(res, 200, { ok: true });
}
