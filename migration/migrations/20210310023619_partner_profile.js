exports.up = (knex) => knex.schema.createTable('partner_profile', (t) => {
  t.increments('id').unsigned().primary();
  t.integer('user_id').nullable().references('id').inTable('users')
    .onDelete('CASCADE');
  t.string('company_name').nullable();
  t.string('address1').nullable();
  t.string('address2').nullable();
  t.string('phone').nullable().unique();
  t.string('logo').nullable();
  t.string('background').nullable();
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('partner_profile');
