const { v4: uuid } = require('uuid');

exports.up = (knex) => knex.schema.createTable('users', (t) => {
  t.increments('id').unsigned().primary();
  t.string('email').nullable().unique();
  t.string('login').nullable().unique();
  t.string('phone').nullable().unique();
  t.enum('role', ['superadmin', 'admin', 'partner', 'client']).notNullable().defaultTo('client');
  t.string('password').nullable();
  t.boolean('blocked').notNullable().defaultTo(false);
  t.boolean('block_reason').nullable();
  t.boolean('verified_email').notNullable().defaultTo(false);
  t.boolean('verified_phone').notNullable().defaultTo(false);
  t.string('email_verification_token').notNullable().defaultTo(uuid());
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('deleted_at').nullable();
});

exports.down = (knex) => knex.schema.dropTable('users');
