export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const mensaje = err.message || 'Error interno del servidor';

  console.error(`[${status}] ${mensaje}`);
  res.status(status).json({
    error: true,
    status,
    mensaje
  });
};
