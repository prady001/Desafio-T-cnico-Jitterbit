const jwt = require('jsonwebtoken');
const env = require('../config/env');

function extractTokenFromHeader(authorizationHeader) {
  if (!authorizationHeader) {
    const error = new Error('Token de autenticação não informado.');
    error.statusCode = 401;
    throw error;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Formato de token inválido.');
    error.statusCode = 401;
    throw error;
  }

  return token;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.auth.jwtSecret);
  } catch {
    const error = new Error('Token inválido ou expirado.');
    error.statusCode = 401;
    throw error;
  }
}

function authMiddleware(req, _res, next) {
  const authorizationHeader = req.headers.authorization;

  const token = extractTokenFromHeader(authorizationHeader);
  const payload = verifyToken(token);

  req.user = payload;

  next();
}

module.exports = authMiddleware;
