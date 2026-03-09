const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 3000,
  db: {
    client: 'pg',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'orders',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'changeme-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
};

module.exports = env;
