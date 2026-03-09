const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de Pedidos',
    version: '1.0.0',
    description:
      'API para criação, consulta, atualização, listagem e exclusão de pedidos e seus itens.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Ambiente de desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      OrderItemRequest: {
        type: 'object',
        properties: {
          idItem: {
            type: 'string',
            example: '1',
          },
          quantidadeItem: {
            type: 'integer',
            example: 2,
          },
          valorItem: {
            type: 'number',
            format: 'float',
            example: 10.5,
          },
        },
        required: ['idItem', 'quantidadeItem', 'valorItem'],
      },
      CreateOrderRequest: {
        type: 'object',
        properties: {
          numeroPedido: {
            type: 'string',
            example: '123',
          },
          valorTotal: {
            type: 'number',
            format: 'float',
            example: 21.0,
          },
          dataCriacao: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T12:00:00.000Z',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderItemRequest',
            },
          },
        },
        required: ['numeroPedido', 'valorTotal', 'dataCriacao', 'items'],
      },
      OrderItemResponse: {
        type: 'object',
        properties: {
          productId: {
            type: 'number',
            format: 'float',
            example: 2434,
          },
          quantity: {
            type: 'integer',
            example: 2,
          },
          price: {
            type: 'number',
            format: 'float',
            example: 10.5,
          },
        },
        required: ['productId', 'quantity', 'price'],
      },
      OrderResponse: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            example: '123',
          },
          value: {
            type: 'number',
            format: 'float',
            example: 21.0,
          },
          creationDate: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T12:00:00.000Z',
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/OrderItemResponse',
            },
          },
        },
        required: ['orderId', 'value', 'creationDate', 'items'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            example: 'admin',
          },
          password: {
            type: 'string',
            example: 'admin',
          },
        },
        required: ['username', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          tokenType: {
            type: 'string',
            example: 'Bearer',
          },
        },
        required: ['token', 'tokenType'],
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Verificar disponibilidade da API',
        tags: ['Health'],
        responses: {
          200: {
            description: 'API está saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Realizar login e obter token JWT',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          400: {
            description: 'Dados de login inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/order': {
      post: {
        summary: 'Criar um novo pedido',
        tags: ['Orders'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateOrderRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OrderResponse',
                },
              },
            },
          },
          400: {
            description: 'Erro de validação nos dados de entrada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          409: {
            description: 'Já existe um pedido com o mesmo número',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/order/list': {
      get: {
        summary: 'Listar pedidos',
        tags: ['Orders'],
        responses: {
          200: {
            description: 'Lista de pedidos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/OrderResponse',
                  },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/order/{numeroPedido}': {
      get: {
        summary: 'Buscar pedido por número',
        tags: ['Orders'],
        parameters: [
          {
            name: 'numeroPedido',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Número do pedido',
          },
        ],
        responses: {
          200: {
            description: 'Pedido encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OrderResponse',
                },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Atualizar um pedido existente',
        tags: ['Orders'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'numeroPedido',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Número do pedido a ser atualizado',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateOrderRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Pedido atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OrderResponse',
                },
              },
            },
          },
          400: {
            description: 'Erro de validação nos dados de entrada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Excluir um pedido',
        tags: ['Orders'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'numeroPedido',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Número do pedido a ser excluído',
          },
        ],
        responses: {
          204: {
            description: 'Pedido excluído com sucesso',
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
