const createApp = require('./app');
const env = require('./config/env');
const db = require('./config/database');

const app = createApp();
const port = env.port;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor iniciado na porta ${port}`);
});

function handleShutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`Recebido sinal ${signal}. Encerrando servidor...`);

  db.destroy()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
