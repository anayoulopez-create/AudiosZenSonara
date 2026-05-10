import { signedPutUrl } from '../_lib/s3.js';
import { json, readJson, requireAdmin } from '../_lib/http.js';

function safeKey(key) {
  const value = String(key || '');
  if (!value.startsWith('sonara/')) throw new Error('Key inválida.');
  if (value.includes('..')) throw new Error('Key inválida.');
  return value;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido.' });
    if (!requireAdmin(req, res)) return;
    const body = await readJson(req);
    const key = safeKey(body.key);
    const contentType = body.contentType || 'application/octet-stream';
    const url = await signedPutUrl(key, contentType);
    return json(res, 200, { url, key });
  } catch (error) {
    return json(res, 400, { error: error.message || 'No se pudo generar la URL de subida.' });
  }
}
