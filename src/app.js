const express = require('express');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middlewares/error-handler');
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');
const swaggerDocument = require('./docs/swagger');

function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/auth', authRoutes);

  app.use('/order', orderRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
