// api/admin/upload.js
// Recibe el archivo en Vercel y lo sube a B2 desde el servidor.
// Sustituye completamente a presign.js — el navegador ya no toca B2 directamente.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = { api: { bodyParser: false } };   // necesario para leer el stream raw

const s3 = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

/** Lee el body raw de la request como Buffer */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // Autenticación
  const pass = req.headers['x-admin-password'];
  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // La key y el contentType vienen como query params
    const { key, contentType } = req.query;

    if (!key)         return res.status(400).json({ error: 'Falta el parámetro key' });
    if (!contentType) return res.status(400).json({ error: 'Falta el parámetro contentType' });

    const body = await readBody(req);

    await s3.send(new PutObjectCommand({
      Bucket:      process.env.B2_BUCKET,
      Key:         key,
      Body:        body,
      ContentType: contentType,
    }));

    return res.status(200).json({ ok: true, key });
  } catch (err) {
    console.error('[upload] Error:', err);
    return res.status(500).json({ error: err.message || 'Error interno al subir el archivo' });
  }
}
