/**
 * @param {import('knex')} knex
 */
exports.up = async (knex) => {
  await knex.schema.createTable('orders', (table) => {
    table.string('order_id').primary();
    table.decimal('value', 15, 2).notNullable();
    table.timestamp('creation_date', { useTz: true }).notNullable();
  });

  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table
      .string('order_id')
      .notNullable()
      .references('order_id')
      .inTable('orders')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.integer('product_id').notNullable();
    table.integer('quantity').notNullable();
    table.decimal('price', 15, 2).notNullable();
  });
};

/**
 * @param {import('knex')} knex
 */
exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
};
