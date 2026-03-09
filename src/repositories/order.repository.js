const db = require('../config/database');
const orderMapper = require('../mappers/order.mapper');

async function findById(orderId) {
  const orderRow = await db('orders').where({ order_id: orderId }).first();

  if (!orderRow) {
    return null;
  }

  const itemRows = await db('order_items')
    .where({ order_id: orderId })
    .orderBy('id', 'asc');

  return orderMapper.fromDbToDomain(orderRow, itemRows);
}

async function listAll() {
  const orderRows = await db('orders').orderBy('creation_date', 'desc');

  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((order) => order.order_id);

  const itemRows = await db('order_items')
    .whereIn('order_id', orderIds)
    .orderBy(['order_id', 'id']);

  const itemsByOrderId = itemRows.reduce((acc, item) => {
    const key = item.order_id;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});

  return orderRows.map((orderRow) => {
    const relatedItems = itemsByOrderId[orderRow.order_id] || [];
    return orderMapper.fromDbToDomain(orderRow, relatedItems);
  });
}

async function create(order) {
  const { orderRow, itemRows } = orderMapper.fromDomainToPersistence(order);

  return db.transaction(async (trx) => {
    await trx('orders').insert(orderRow);

    if (itemRows.length > 0) {
      await trx('order_items').insert(itemRows);
    }

    const savedOrderRow = await trx('orders')
      .where({ order_id: orderRow.order_id })
      .first();

    const savedItemRows = await trx('order_items')
      .where({ order_id: orderRow.order_id })
      .orderBy('id', 'asc');

    return orderMapper.fromDbToDomain(savedOrderRow, savedItemRows);
  });
}

async function update(orderId, order) {
  const { orderRow, itemRows } = orderMapper.fromDomainToPersistence(order);

  return db.transaction(async (trx) => {
    const updatedCount = await trx('orders')
      .where({ order_id: orderId })
      .update({
        value: orderRow.value,
        creation_date: orderRow.creation_date,
      });

    if (updatedCount === 0) {
      return null;
    }

    await trx('order_items').where({ order_id: orderId }).del();

    if (itemRows.length > 0) {
      const rowsToInsert = itemRows.map((itemRow) => ({
        ...itemRow,
        order_id: orderId,
      }));

      await trx('order_items').insert(rowsToInsert);
    }

    const savedOrderRow = await trx('orders')
      .where({ order_id: orderId })
      .first();

    const savedItemRows = await trx('order_items')
      .where({ order_id: orderId })
      .orderBy('id', 'asc');

    return orderMapper.fromDbToDomain(savedOrderRow, savedItemRows);
  });
}

async function remove(orderId) {
  const deletedCount = await db('orders').where({ order_id: orderId }).del();
  return deletedCount > 0;
}

const orderRepository = {
  findById,
  listAll,
  create,
  update,
  remove,
};

module.exports = orderRepository;
