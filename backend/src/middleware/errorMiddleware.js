export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
}

export function errorHandler(err, _req, res, _next) {
  // Log error dengan detail untuk debugging (jangan expose ke client)
  console.error('Error:', {
    message: err?.message,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    status: err?.status || err?.statusCode
  });

  // Jangan expose error details ke client untuk security
  const status = err?.status || err?.statusCode || 500;
  const message = status === 500 
    ? 'Internal server error' 
    : (err?.message || 'Terjadi kesalahan pada server');
  
  res.status(status).json({ message });
}


