export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
}

export function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Terjadi kesalahan pada server';
  res.status(status).json({ message });
}


