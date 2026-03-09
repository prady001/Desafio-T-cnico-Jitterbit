function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function ensureString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw createValidationError(
      `Campo ${fieldName} é obrigatório e deve ser uma string não vazia.`,
    );
  }

  return value.trim();
}

function ensureNumber(value, fieldName) {
  const numeric = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    throw createValidationError(
      `Campo ${fieldName} deve ser um número válido.`,
    );
  }

  return numeric;
}

function ensurePositiveInteger(value, fieldName) {
  const numeric = ensureNumber(value, fieldName);

  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw createValidationError(
      `Campo ${fieldName} deve ser um inteiro positivo.`,
    );
  }

  return numeric;
}

function ensureDateIsoString(value, fieldName) {
  const raw = typeof value === 'string' ? value : '';
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw createValidationError(
      `Campo ${fieldName} deve ser uma data válida no formato ISO.`,
    );
  }

  return date.toISOString();
}

function validateAndMapItemsFromRequest(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw createValidationError(
      'Lista de itens é obrigatória e deve conter ao menos um item.',
    );
  }

  return items.map((item, index) => {
    const prefix = `items[${index}]`;

    if (item == null || typeof item !== 'object') {
      throw createValidationError(`Item ${prefix} deve ser um objeto válido.`);
    }

    const productId = ensurePositiveInteger(item.idItem, `${prefix}.idItem`);
    const quantity = ensurePositiveInteger(
      item.quantidadeItem,
      `${prefix}.quantidadeItem`,
    );
    const price = ensureNumber(item.valorItem, `${prefix}.valorItem`);

    return {
      productId,
      quantity,
      price,
    };
  });
}

function fromRequestToDomain(body) {
  if (body == null || typeof body !== 'object') {
    throw createValidationError('Corpo da requisição deve ser um objeto JSON.');
  }

  const orderId = ensureString(body.numeroPedido, 'numeroPedido');
  const value = ensureNumber(body.valorTotal, 'valorTotal');
  const creationDate = ensureDateIsoString(body.dataCriacao, 'dataCriacao');
  const items = validateAndMapItemsFromRequest(body.items);

  return {
    orderId,
    value,
    creationDate,
    items,
  };
}

function mapItemRowToDomain(itemRow) {
  if (itemRow == null || typeof itemRow !== 'object') {
    throw createValidationError(
      'Registro de item inválido retornado do banco de dados.',
    );
  }

  const productId = ensurePositiveInteger(itemRow.product_id, 'product_id');
  const quantity = ensurePositiveInteger(itemRow.quantity, 'quantity');
  const price = ensureNumber(itemRow.price, 'price');

  return {
    productId,
    quantity,
    price,
  };
}

function fromDbToDomain(orderRow, itemRows) {
  if (orderRow == null || typeof orderRow !== 'object') {
    throw createValidationError(
      'Registro de pedido inválido retornado do banco de dados.',
    );
  }

  const orderId = ensureString(orderRow.order_id, 'order_id');
  const value = ensureNumber(orderRow.value, 'value');

  const creationRaw =
    orderRow.creation_date instanceof Date
      ? orderRow.creation_date.toISOString()
      : ensureDateIsoString(orderRow.creation_date, 'creation_date');

  const itemsArray = Array.isArray(itemRows) ? itemRows : [];
  const items = itemsArray.map(mapItemRowToDomain);

  return {
    orderId,
    value,
    creationDate: creationRaw,
    items,
  };
}

function fromDomainToResponse(order) {
  if (order == null || typeof order !== 'object') {
    throw createValidationError('Objeto de domínio do pedido é inválido.');
  }

  const orderId = ensureString(order.orderId, 'orderId');
  const value = ensureNumber(order.value, 'value');
  const creationDateIso = ensureDateIsoString(
    order.creationDate,
    'creationDate',
  );

  const itemsArray = Array.isArray(order.items) ? order.items : [];

  const items = itemsArray.map((item, index) => {
    const prefix = `items[${index}]`;

    if (item == null || typeof item !== 'object') {
      throw createValidationError(`Item de domínio ${prefix} é inválido.`);
    }

    const productId = ensurePositiveInteger(
      item.productId,
      `${prefix}.productId`,
    );
    const quantity = ensurePositiveInteger(item.quantity, `${prefix}.quantity`);
    const price = ensureNumber(item.price, `${prefix}.price`);

    return {
      idItem: String(productId),
      quantidadeItem: quantity,
      valorItem: price,
    };
  });

  return {
    numeroPedido: orderId,
    valorTotal: value,
    dataCriacao: creationDateIso,
    items,
  };
}

function fromDomainToDestinationResponse(order) {
  if (order == null || typeof order !== 'object') {
    throw createValidationError('Objeto de domínio do pedido é inválido.');
  }

  const orderId = ensureString(order.orderId, 'orderId');
  const value = ensureNumber(order.value, 'value');
  const creationDateIso = ensureDateIsoString(
    order.creationDate,
    'creationDate',
  );

  const itemsArray = Array.isArray(order.items) ? order.items : [];

  const items = itemsArray.map((item, index) => {
    const prefix = `items[${index}]`;

    if (item == null || typeof item !== 'object') {
      throw createValidationError(`Item de domínio ${prefix} é inválido.`);
    }

    const productId = ensurePositiveInteger(
      item.productId,
      `${prefix}.productId`,
    );
    const quantity = ensurePositiveInteger(item.quantity, `${prefix}.quantity`);
    const price = ensureNumber(item.price, `${prefix}.price`);

    return {
      productId,
      quantity,
      price,
    };
  });

  return {
    orderId,
    value,
    creationDate: creationDateIso,
    items,
  };
}

function fromDomainToPersistence(order) {
  if (order == null || typeof order !== 'object') {
    throw createValidationError(
      'Objeto de domínio do pedido é inválido para persistência.',
    );
  }

  const orderId = ensureString(order.orderId, 'orderId');
  const value = ensureNumber(order.value, 'value');
  const creationDateIso = ensureDateIsoString(
    order.creationDate,
    'creationDate',
  );

  const orderRow = {
    order_id: orderId,
    value,
    creation_date: new Date(creationDateIso),
  };

  const itemsArray = Array.isArray(order.items) ? order.items : [];

  const itemRows = itemsArray.map((item, index) => {
    const prefix = `items[${index}]`;

    if (item == null || typeof item !== 'object') {
      throw createValidationError(
        `Item de domínio ${prefix} é inválido para persistência.`,
      );
    }

    const productId = ensurePositiveInteger(
      item.productId,
      `${prefix}.productId`,
    );
    const quantity = ensurePositiveInteger(item.quantity, `${prefix}.quantity`);
    const price = ensureNumber(item.price, `${prefix}.price`);

    return {
      order_id: orderId,
      product_id: productId,
      quantity,
      price,
    };
  });

  return {
    orderRow,
    itemRows,
  };
}

const orderMapper = {
  fromRequestToDomain,
  fromDbToDomain,
  fromDomainToResponse,
  fromDomainToDestinationResponse,
  fromDomainToPersistence,
};

module.exports = orderMapper;
