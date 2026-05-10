import { getObject, putObject } from './s3.js';

export const CATALOG_KEY = 'sonara/catalog.json';

const defaults = {
  version: 2,
  updatedAt: null,
  profile: {
    alias: 'SONARA',
    bio: 'Archivo musical privado, visual y persistente.',
    avatarKey: null,
    bannerKey: null,
    backgroundKey: null
  },
  albums: []
};

export async function readCatalog() {
  try {
    const file = await getObject(CATALOG_KEY);
    const parsed = JSON.parse(file.body.toString('utf-8'));
    return {
      ...defaults,
      ...parsed,
      profile: { ...defaults.profile, ...(parsed.profile || {}) },
      albums: Array.isArray(parsed.albums) ? parsed.albums : []
    };
  } catch {
    return { ...defaults, profile: { ...defaults.profile }, albums: [] };
  }
}

export async function writeCatalog(catalog) {
  const clean = {
    version: 2,
    updatedAt: new Date().toISOString(),
    profile: catalog.profile || defaults.profile,
    albums: Array.isArray(catalog.albums) ? catalog.albums : []
  };
  await putObject(CATALOG_KEY, Buffer.from(JSON.stringify(clean, null, 2), 'utf-8'), 'application/json; charset=utf-8');
  return clean;
}

export function publicCatalog(catalog) {
  return {
    profile: catalog.profile,
    albums: catalog.albums.map(album => ({
      id: album.id,
      title: album.title,
      year: album.year,
      coverKey: album.coverKey,
      createdAt: album.createdAt,
      tracks: (album.tracks || []).map(track => ({
        id: track.id,
        title: track.title,
        audioKey: track.audioKey,
        duration: track.duration || null
      }))
    }))
  };
}
