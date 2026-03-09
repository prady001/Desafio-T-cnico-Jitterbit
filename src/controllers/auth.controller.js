const jwt = require('jsonwebtoken');
const env = require('../config/env');

function login(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      const error = new Error('Usuário e senha são obrigatórios.');
      error.statusCode = 400;
      throw error;
    }

    if (username !== 'admin' || password !== 'admin') {
      const error = new Error('Credenciais inválidas.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ sub: username }, env.auth.jwtSecret, {
      expiresIn: env.auth.jwtExpiresIn,
    });

    res.status(200).json({
      token,
      tokenType: 'Bearer',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
};
