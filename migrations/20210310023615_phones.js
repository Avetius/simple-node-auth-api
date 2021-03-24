exports.up = (knex) => knex.schema.createTable('phones', (t) => {
  t.increments('id').unsigned().primary();
  t.integer('user_id').notNullable().references('id').inTable('users')
    .onDelete('CASCADE');
  t.string('country_code').notNullable();
  t.string('number').notNullable();
  t.boolean('verified_phone').notNullable().defaultTo(false);
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('phones');
