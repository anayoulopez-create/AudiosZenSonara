export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function requireAdmin(req, res) {
  const expected = process.env.ADMIN_PASSWORD;
  const given = req.headers['x-admin-password'];
  if (!expected) {
    json(res, 500, { error: 'Falta ADMIN_PASSWORD en las variables de entorno.' });
    return false;
  }
  if (!given || String(given) !== String(expected)) {
    json(res, 401, { error: 'Contraseña incorrecta.' });
    return false;
  }
  return true;
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf-8') || '{}';
  return JSON.parse(raw);
}
