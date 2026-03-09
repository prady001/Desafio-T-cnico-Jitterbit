function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const message =
    status >= 500
      ? 'Erro interno do servidor.'
      : err.message || 'Erro na requisição.';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;
