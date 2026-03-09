const orderRepository = require('../repositories/order.repository');
const orderMapper = require('../mappers/order.mapper');

function createNotFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function createConflictError(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

async function createOrder(payload) {
  const domainOrder = orderMapper.fromRequestToDomain(payload);

  const existingOrder = await orderRepository.findById(domainOrder.orderId);

  if (existingOrder) {
    throw createConflictError(
      `Já existe um pedido com o número ${domainOrder.orderId}.`,
    );
  }

  return orderRepository.create(domainOrder);
}

async function getOrderById(orderId) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw createNotFoundError('Pedido não encontrado.');
  }

  return order;
}

async function listOrders() {
  return orderRepository.listAll();
}

async function updateOrder(orderId, payload) {
  const domainOrder = orderMapper.fromRequestToDomain(payload);

  if (domainOrder.orderId !== orderId) {
    throw createValidationError(
      'numeroPedido do corpo deve ser igual ao parâmetro da URL.',
    );
  }

  const mergedOrder = {
    ...domainOrder,
    orderId,
  };

  const updatedOrder = await orderRepository.update(orderId, mergedOrder);

  if (!updatedOrder) {
    throw createNotFoundError('Pedido não encontrado para atualização.');
  }

  return updatedOrder;
}

async function deleteOrder(orderId) {
  const deleted = await orderRepository.remove(orderId);

  if (!deleted) {
    throw createNotFoundError('Pedido não encontrado para exclusão.');
  }
}

const orderService = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
};

module.exports = orderService;
