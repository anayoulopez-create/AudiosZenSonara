import { readCatalog, publicCatalog } from './_lib/catalog.js';
import { json } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido.' });
  const catalog = await readCatalog();
  return json(res, 200, publicCatalog(catalog));
}
