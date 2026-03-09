const env = require('./src/config/env');

module.exports = {
  development: {
    client: env.db.client,
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    pool: {
      min: 0,
      max: 10,
    },
  },
};
