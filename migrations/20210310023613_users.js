exports.up = (knex) => knex.schema.createTable('users', (t) => {
  t.increments('id').unsigned().primary();
  t.enum('role', ['superadmin', 'admin', 'partner', 'client']).notNullable().defaultTo('client');
  t.boolean('blocked').notNullable().defaultTo(false);
  t.boolean('block_reason').nullable();
  t.string('avatar').nullable();
  t.string('background').nullable();
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('deleted_at').nullable();
});

exports.down = (knex) => knex.schema.dropTable('users');
