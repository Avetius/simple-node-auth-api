exports.up = (knex) => knex.schema.createTable('sn_account', (t) => {
  t.increments('id').unsigned().primary();
  t.integer('user_id').nullable().references('id').inTable('users');
  t.enum('provider', ['facebook', 'google']).notNullable();
  t.string('provider_id').notNullable().unique();
  t.string('profile_url').nullable();
  t.string('token').notNullable().unique();
  t.string('refresh_token').nullable();
  t.string('display_name').nullable();
  t.string('given_name').nullable();
  t.string('middle_name').nullable();
  t.string('family_name').nullable();
  t.string('gender').nullable();
  t.jsonb('emails').nullable();
  t.jsonb('photos').nullable();
  t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('sn_account');
