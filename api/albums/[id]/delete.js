import { readCatalog, writeCatalog } from '../../_lib/catalog.js';
import { deleteObject } from '../../_lib/s3.js';
import { json, requireAdmin } from '../../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') return json(res, 405, { error: 'Método no permitido.' });
    if (!requireAdmin(req, res)) return;
    const { id } = req.query;
    const catalog = await readCatalog();
    const album = catalog.albums.find(a => String(a.id) === String(id));
    if (!album) return json(res, 404, { error: 'Álbum no encontrado.' });

    // Borrar carátula y todas las canciones de B2
    await deleteObject(album.coverKey);
    for (const track of album.tracks || []) await deleteObject(track.audioKey);

    catalog.albums = catalog.albums.filter(a => String(a.id) !== String(id));
    await writeCatalog(catalog);
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 500, { error: error.message || 'No se pudo borrar el álbum.' });
  }
}
