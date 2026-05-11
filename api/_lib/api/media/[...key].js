import { getObject } from '../_lib/s3.js';

export default async function handler(req, res) {
  try {
    const parts = req.query.key;
    const key = Array.isArray(parts) ? parts.join('/') : String(parts || '');
    if (!key || key.includes('..')) {
      res.statusCode = 400;
      return res.end('Key inválida');
    }
    const file = await getObject(key);
    res.statusCode = 200;
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (file.contentType.startsWith('audio/')) {
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Accept-Ranges', 'bytes');
    }
    res.end(file.body);
  } catch (error) {
    res.statusCode = 404;
    res.end('Archivo no encontrado');
  }
}
