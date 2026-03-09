const request = require('supertest');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const env = require('../src/config/env');

jest.mock('../src/services/order.service');

const orderService = require('../src/services/order.service');

function createDomainOrder(overrides = {}) {
  return {
    orderId: '123',
    value: 100.5,
    creationDate: '2024-01-01T12:00:00.000Z',
    items: [
      {
        productId: 1,
        quantity: 2,
        price: 50.25,
      },
    ],
    ...overrides,
  };
}

function createRequestBody(overrides = {}) {
  return {
    numeroPedido: '123',
    valorTotal: 100.5,
    dataCriacao: '2024-01-01T12:00:00.000Z',
    items: [
      {
        idItem: '1',
        quantidadeItem: 2,
        valorItem: 50.25,
      },
    ],
    ...overrides,
  };
}
const authHeader = `Bearer ${jwt.sign({ sub: 'admin' }, env.auth.jwtSecret, {
  expiresIn: env.auth.jwtExpiresIn,
})}`;

describe('Rotas de autenticação', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  test('POST /auth/login deve retornar token JWT válido para credenciais corretas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('tokenType', 'Bearer');
    expect(typeof response.body.token).toBe('string');
  });

  test('POST /auth/login deve retornar 400 quando usuário ou senha não são enviados', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty(
      'message',
      'Usuário e senha são obrigatórios.',
    );
  });

  test('POST /auth/login deve retornar 401 para credenciais inválidas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'senha-incorreta' })
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Credenciais inválidas.');
  });
});

describe('Rotas /order', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /order deve criar pedido autenticado e retornar 201', async () => {
    const domainOrder = createDomainOrder();
    orderService.createOrder.mockResolvedValue(domainOrder);

    const response = await request(app)
      .post('/order')
      .set('Authorization', authHeader)
      .send(createRequestBody())
      .expect(201);

    expect(orderService.createOrder).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({
      orderId: '123',
      value: 100.5,
      creationDate: '2024-01-01T12:00:00.000Z',
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 50.25,
        },
      ],
    });
  });

  test('GET /order/:numeroPedido deve retornar pedido e 200', async () => {
    const domainOrder = createDomainOrder();
    orderService.getOrderById.mockResolvedValue(domainOrder);

    const response = await request(app).get('/order/123').expect(200);

    expect(orderService.getOrderById).toHaveBeenCalledWith('123');
    expect(response.body).toEqual({
      orderId: '123',
      value: 100.5,
      creationDate: '2024-01-01T12:00:00.000Z',
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 50.25,
        },
      ],
    });
  });

  test('GET /order/list deve retornar lista de pedidos e 200', async () => {
    const orders = [createDomainOrder({ orderId: '1' })];
    orderService.listOrders.mockResolvedValue(orders);

    const response = await request(app).get('/order/list').expect(200);

    expect(orderService.listOrders).toHaveBeenCalledTimes(1);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual({
      orderId: '1',
      value: 100.5,
      creationDate: '2024-01-01T12:00:00.000Z',
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 50.25,
        },
      ],
    });
  });

  test('PUT /order/:numeroPedido deve atualizar pedido autenticado e retornar 200', async () => {
    const updatedOrder = createDomainOrder({ value: 200 });
    orderService.updateOrder.mockResolvedValue(updatedOrder);

    const response = await request(app)
      .put('/order/123')
      .set('Authorization', authHeader)
      .send(createRequestBody({ valorTotal: 200 }))
      .expect(200);

    expect(orderService.updateOrder).toHaveBeenCalledWith(
      '123',
      expect.any(Object),
    );
    expect(response.body).toEqual({
      orderId: '123',
      value: 200,
      creationDate: '2024-01-01T12:00:00.000Z',
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 50.25,
        },
      ],
    });
  });

  test('DELETE /order/:numeroPedido deve remover pedido autenticado e retornar 204', async () => {
    orderService.deleteOrder.mockResolvedValue();

    await request(app)
      .delete('/order/123')
      .set('Authorization', authHeader)
      .expect(204);

    expect(orderService.deleteOrder).toHaveBeenCalledWith('123');
  });

  test('PUT /order/:numeroPedido deve retornar 400 quando numeroPedido do corpo for diferente do parâmetro', async () => {
    const error = new Error(
      'numeroPedido do corpo deve ser igual ao parâmetro da URL.',
    );
    error.statusCode = 400;
    orderService.updateOrder.mockRejectedValue(error);

    const response = await request(app)
      .put('/order/123')
      .set('Authorization', authHeader)
      .send(createRequestBody({ numeroPedido: '456' }))
      .expect(400);

    expect(response.body).toHaveProperty(
      'message',
      'numeroPedido do corpo deve ser igual ao parâmetro da URL.',
    );
  });

  test('GET /order/:numeroPedido deve retornar 404 quando serviço lançar erro de não encontrado', async () => {
    const error = new Error('Pedido não encontrado.');
    error.statusCode = 404;
    orderService.getOrderById.mockRejectedValue(error);

    const response = await request(app).get('/order/999').expect(404);

    expect(response.body).toHaveProperty('message', 'Pedido não encontrado.');
  });

  test('POST /order deve retornar 401 quando token não é enviado', async () => {
    const response = await request(app)
      .post('/order')
      .send(createRequestBody())
      .expect(401);

    expect(response.body).toHaveProperty(
      'message',
      'Token de autenticação não informado.',
    );
  });

  test('POST /order deve retornar 401 quando token é inválido', async () => {
    const response = await request(app)
      .post('/order')
      .set('Authorization', 'Bearer token-invalido')
      .send(createRequestBody())
      .expect(401);

    expect(response.body).toHaveProperty(
      'message',
      'Token inválido ou expirado.',
    );
  });
});
