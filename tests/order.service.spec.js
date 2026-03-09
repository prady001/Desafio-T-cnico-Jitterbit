const orderService = require('../src/services/order.service');
const orderRepository = require('../src/repositories/order.repository');
const orderMapper = require('../src/mappers/order.mapper');

jest.mock('../src/repositories/order.repository');
jest.mock('../src/mappers/order.mapper', () => ({
  fromRequestToDomain: jest.fn(),
}));

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

describe('order.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    test('deve criar um pedido quando não existir pedido com o mesmo ID', async () => {
      const requestBody = createRequestBody();
      const domainOrder = createDomainOrder();

      orderMapper.fromRequestToDomain.mockReturnValue(domainOrder);
      orderRepository.findById.mockResolvedValue(null);
      orderRepository.create.mockResolvedValue(domainOrder);

      const result = await orderService.createOrder(requestBody);

      expect(orderMapper.fromRequestToDomain).toHaveBeenCalledWith(requestBody);
      expect(orderRepository.findById).toHaveBeenCalledWith(domainOrder.orderId);
      expect(orderRepository.create).toHaveBeenCalledWith(domainOrder);
      expect(result).toBe(domainOrder);
    });

    test('deve lançar erro 409 quando já existir pedido com o mesmo ID', async () => {
      const requestBody = createRequestBody();
      const domainOrder = createDomainOrder();

      orderMapper.fromRequestToDomain.mockReturnValue(domainOrder);
      orderRepository.findById.mockResolvedValue(createDomainOrder());

      await expect(orderService.createOrder(requestBody)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  describe('getOrderById', () => {
    test('deve retornar pedido quando encontrado', async () => {
      const domainOrder = createDomainOrder();
      orderRepository.findById.mockResolvedValue(domainOrder);

      const result = await orderService.getOrderById('123');

      expect(orderRepository.findById).toHaveBeenCalledWith('123');
      expect(result).toBe(domainOrder);
    });

    test('deve lançar erro 404 quando pedido não for encontrado', async () => {
      orderRepository.findById.mockResolvedValue(null);

      await expect(orderService.getOrderById('999')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Pedido não encontrado.',
      });
    });
  });

  describe('listOrders', () => {
    test('deve retornar lista de pedidos', async () => {
      const orders = [createDomainOrder({ orderId: '1' })];
      orderRepository.listAll.mockResolvedValue(orders);

      const result = await orderService.listOrders();

      expect(orderRepository.listAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(orders);
    });
  });

  describe('updateOrder', () => {
    test('deve lançar erro 400 quando numeroPedido do corpo for diferente do parâmetro', async () => {
      const requestBody = createRequestBody({ numeroPedido: '456' });
      const domainOrder = createDomainOrder({ orderId: '456' });

      orderMapper.fromRequestToDomain.mockReturnValue(domainOrder);

      await expect(
        orderService.updateOrder('123', requestBody),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'numeroPedido do corpo deve ser igual ao parâmetro da URL.',
      });

      expect(orderRepository.update).not.toHaveBeenCalled();
    });

    test('deve atualizar pedido quando IDs coincidirem e pedido existir', async () => {
      const requestBody = createRequestBody();
      const domainOrder = createDomainOrder();
      const updatedOrder = createDomainOrder({ value: 200 });

      orderMapper.fromRequestToDomain.mockReturnValue(domainOrder);
      orderRepository.update.mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrder('123', requestBody);

      expect(orderMapper.fromRequestToDomain).toHaveBeenCalledWith(requestBody);
      expect(orderRepository.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          orderId: '123',
        }),
      );
      expect(result).toBe(updatedOrder);
    });

    test('deve lançar erro 404 quando pedido a ser atualizado não existir', async () => {
      const requestBody = createRequestBody();
      const domainOrder = createDomainOrder();

      orderMapper.fromRequestToDomain.mockReturnValue(domainOrder);
      orderRepository.update.mockResolvedValue(null);

      await expect(
        orderService.updateOrder('123', requestBody),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Pedido não encontrado para atualização.',
      });
    });
  });

  describe('deleteOrder', () => {
    test('deve remover pedido quando existir', async () => {
      orderRepository.remove.mockResolvedValue(true);

      await orderService.deleteOrder('123');

      expect(orderRepository.remove).toHaveBeenCalledWith('123');
    });

    test('deve lançar erro 404 quando pedido a ser removido não existir', async () => {
      orderRepository.remove.mockResolvedValue(false);

      await expect(orderService.deleteOrder('999')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Pedido não encontrado para exclusão.',
      });
    });
  });
});

