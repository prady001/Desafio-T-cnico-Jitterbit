const orderMapper = require('../src/mappers/order.mapper');

function createValidRequestBody(overrides = {}) {
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

describe('order.mapper', () => {
  describe('fromRequestToDomain', () => {
    test('deve mapear um payload válido para o domínio', () => {
      const body = createValidRequestBody();

      const result = orderMapper.fromRequestToDomain(body);

      expect(result).toEqual({
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

    test('deve lançar erro de validação quando numeroPedido é inválido', () => {
      const body = createValidRequestBody({ numeroPedido: '' });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/numeroPedido/);
      }
    });

    test('deve lançar erro 400 quando lista de items é vazia', () => {
      const body = createValidRequestBody({ items: [] });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/Lista de itens é obrigatória/);
      }
    });

    test('deve lançar erro 400 quando items não é um array', () => {
      const body = createValidRequestBody({ items: 'não-array' });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/Lista de itens é obrigatória/);
      }
    });

    test('deve lançar erro 400 quando item não é um objeto', () => {
      const body = createValidRequestBody({ items: [null] });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/deve ser um objeto válido/);
      }
    });

    test('deve lançar erro 400 quando idItem não é numérico', () => {
      const body = createValidRequestBody({
        items: [
          {
            idItem: 'abc',
            quantidadeItem: 2,
            valorItem: 50.25,
          },
        ],
      });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/idItem/);
      }
    });
  });

  describe('fromDbToDomain', () => {
    test('deve mapear registros do banco para o domínio', () => {
      const orderRow = {
        order_id: '123',
        value: 100.5,
        creation_date: new Date('2024-01-01T12:00:00.000Z'),
      };

      const itemRows = [
        {
          order_id: '123',
          product_id: 1,
          quantity: 2,
          price: 50.25,
        },
      ];

      const result = orderMapper.fromDbToDomain(orderRow, itemRows);

      expect(result.orderId).toBe('123');
      expect(result.value).toBe(100.5);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        productId: 1,
        quantity: 2,
        price: 50.25,
      });
    });
  });

  describe('fromDomainToResponse', () => {
    test('deve mapear domínio para payload de resposta', () => {
      const domainOrder = {
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
      };

      const result = orderMapper.fromDomainToResponse(domainOrder);

      expect(result).toEqual({
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
      });
    });
  });

  describe('fromDomainToPersistence', () => {
    test('deve mapear domínio para estruturas de persistência', () => {
      const domainOrder = {
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
      };

      const result = orderMapper.fromDomainToPersistence(domainOrder);

      expect(result.orderRow).toMatchObject({
        order_id: '123',
        value: 100.5,
      });

      expect(result.itemRows).toHaveLength(1);
      expect(result.itemRows[0]).toMatchObject({
        order_id: '123',
        product_id: 1,
        quantity: 2,
        price: 50.25,
      });
    });
  });

  describe('fromDomainToDestinationResponse', () => {
    test('deve mapear domínio para payload de resposta no formato de destino', () => {
      const domainOrder = {
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
      };

      const result = orderMapper.fromDomainToDestinationResponse(domainOrder);

      expect(result).toEqual({
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
  });

  describe('validações de entrada', () => {
    test('deve lançar erro 400 quando item não possui idItem', () => {
      const body = createValidRequestBody({
        items: [
          {
            quantidadeItem: 2,
            valorItem: 50.25,
          },
        ],
      });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/idItem/);
      }
    });

    test('deve lançar erro 400 quando valorTotal é inválido', () => {
      const body = createValidRequestBody({ valorTotal: 'não-numérico' });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/valorTotal/);
      }
    });

    test('deve lançar erro 400 quando dataCriacao é inválida', () => {
      const body = createValidRequestBody({ dataCriacao: 'data inválida' });

      try {
        orderMapper.fromRequestToDomain(body);
        throw new Error('Deveria ter lançado erro de validação.');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(400);
        expect(error.message).toMatch(/dataCriacao/);
      }
    });

    test('deve lançar erro 400 quando quantidadeItem é menor ou igual a zero', () => {
      const invalidQuantities = [0, -1];

      for (const quantidadeItem of invalidQuantities) {
        const body = createValidRequestBody({
          items: [
            {
              idItem: '1',
              quantidadeItem,
              valorItem: 50.25,
            },
          ],
        });

        try {
          orderMapper.fromRequestToDomain(body);
          throw new Error('Deveria ter lançado erro de validação.');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.statusCode).toBe(400);
          expect(error.message).toMatch(/quantidadeItem/);
        }
      }
    });
  });
});
