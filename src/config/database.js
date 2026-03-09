const knex = require('knex');
const env = require('./env');

const connection = knex({
  client: env.db.client,
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  },
  pool: {
    min: 0,
    max: 10,
  },
});

module.exports = connection;
