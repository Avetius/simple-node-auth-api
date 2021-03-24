exports.up = (knex) => knex.schema.createTable('client_profile', (t) => {
  t.increments('id').unsigned().primary();
  t.integer('user_id').notNullable().references('id').inTable('users')
    .onDelete('CASCADE');
  t.string('firstname').nullable();
  t.string('lastname').nullable();
  t.enum('prefix', ['Mr', 'Mrs', 'Ms', 'Dr', 'Jr']).nullable();
  t.dateTime('dob').nullable();
  t.string('avatar').nullable();
  t.string('background').nullable();
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('client_profile');
