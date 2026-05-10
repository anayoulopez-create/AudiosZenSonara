import { readCatalog, writeCatalog } from '../_lib/catalog.js';
import { json, readJson, requireAdmin } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido.' });
    if (!requireAdmin(req, res)) return;
    const body = await readJson(req);
    const title = String(body.title || '').trim();
    const year = String(body.year || '').trim();
    const coverKey = String(body.coverKey || '').trim();
    const tracks = Array.isArray(body.tracks) ? body.tracks : [];

    if (!title) return json(res, 400, { error: 'Falta título del álbum.' });
    if (!coverKey) return json(res, 400, { error: 'Falta carátula del álbum.' });
    if (!tracks.length) return json(res, 400, { error: 'No hay canciones en el álbum.' });

    const album = {
      id: String(body.id || `album-${Date.now()}`),
      title,
      year,
      coverKey,
      createdAt: new Date().toISOString(),
      tracks: tracks.map((track, index) => ({
        id: String(track.id || `${Date.now()}-${index}`),
        title: String(track.title || `Canción ${index + 1}`).trim(),
        audioKey: String(track.audioKey || '').trim(),
        duration: track.duration || null
      })).filter(track => track.audioKey)
    };

    const catalog = await readCatalog();
    catalog.albums.unshift(album);
    await writeCatalog(catalog);
    return json(res, 201, { album });
  } catch (error) {
    return json(res, 500, { error: error.message || 'No se pudo guardar el álbum.' });
  }
}
