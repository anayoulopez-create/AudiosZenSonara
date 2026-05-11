import { json } from './_lib/http.js';

export default function handler(req, res) {
  const ok = Boolean(
    process.env.B2_ENDPOINT &&
    process.env.B2_REGION &&
    process.env.B2_BUCKET &&
    process.env.B2_KEY_ID &&
    process.env.B2_APPLICATION_KEY &&
    process.env.ADMIN_PASSWORD
  );
  return json(res, ok ? 200 : 500, { ok, message: ok ? 'Variables configuradas correctamente.' : 'Faltan variables de entorno.' });
}
