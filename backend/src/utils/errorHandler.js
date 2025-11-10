export function handleControllerError(res, error, fallbackMessage = 'Internal server error') {
  // eslint-disable-next-line no-console
  console.error(error);
  const status = error?.status || error?.statusCode || 500;
  const payload = error?.message
    ? { message: error.message }
    : { message: fallbackMessage };
  return res.status(status).json(payload);
}


