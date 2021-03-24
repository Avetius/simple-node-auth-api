const { v4: uuid } = require('uuid');

exports.up = (knex) => knex.schema.createTable('logins', (t) => {
  t.increments('id').unsigned().primary();
  t.integer('user_id').notNullable().references('id').inTable('users')
    .onDelete('CASCADE');
  t.string('email').nullable().unique();
  t.string('login').nullable().unique();
  t.string('password').nullable();
  t.string('email_verification_token').notNullable().defaultTo(uuid());
  t.boolean('verified_email').notNullable().defaultTo(false);
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('logins');
