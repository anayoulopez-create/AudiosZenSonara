import { readCatalog, writeCatalog } from '../_lib/catalog.js';
import { deleteObject } from '../_lib/s3.js';
import { json, readJson, requireAdmin } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'PUT') return json(res, 405, { error: 'Método no permitido.' });
    if (!requireAdmin(req, res)) return;
    const body = await readJson(req);
    const catalog = await readCatalog();
    const old = catalog.profile || {};
    const next = { ...old };

    for (const field of ['alias', 'bio']) {
      if (body[field] !== undefined) next[field] = String(body[field] || '').trim();
    }

    for (const field of ['avatarKey', 'bannerKey', 'backgroundKey']) {
      if (body[field] !== undefined && body[field] !== old[field]) {
        if (old[field]) await deleteObject(old[field]);
        next[field] = body[field] || null;
      }
    }

    catalog.profile = next;
    await writeCatalog(catalog);
    return json(res, 200, { profile: next });
  } catch (error) {
    return json(res, 500, { error: error.message || 'No se pudo actualizar el perfil.' });
  }
}
