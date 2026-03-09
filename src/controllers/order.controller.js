const orderService = require('../services/order.service');
const orderMapper = require('../mappers/order.mapper');

function wrapAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const create = wrapAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  const response = orderMapper.fromDomainToDestinationResponse(order);

  res.status(201).json(response);
});

const getById = wrapAsync(async (req, res) => {
  const { numeroPedido } = req.params;

  const order = await orderService.getOrderById(numeroPedido);
  const response = orderMapper.fromDomainToDestinationResponse(order);

  res.status(200).json(response);
});

const list = wrapAsync(async (req, res) => {
  const orders = await orderService.listOrders();
  const response = orders.map((order) =>
    orderMapper.fromDomainToDestinationResponse(order),
  );

  res.status(200).json(response);
});

const update = wrapAsync(async (req, res) => {
  const { numeroPedido } = req.params;

  const order = await orderService.updateOrder(numeroPedido, req.body);
  const response = orderMapper.fromDomainToDestinationResponse(order);

  res.status(200).json(response);
});

const remove = wrapAsync(async (req, res) => {
  const { numeroPedido } = req.params;

  await orderService.deleteOrder(numeroPedido);

  res.status(204).send();
});

const orderController = {
  create,
  getById,
  list,
  update,
  remove,
};

module.exports = orderController;
