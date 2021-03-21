// Update with your config settings.
require('dotenv').config();

module.exports = {

  development: {
    client: process.env.DB_type,
    connection: {
      host: process.env.DB_host,
      database: process.env.DB_name,
      user: process.env.DB_user,
      password: process.env.DB_pass,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  staging: {
    client: process.env.DB_type,
    connection: {
      host: process.env.DB_host,
      database: process.env.DB_name,
      user: process.env.DB_user,
      password: process.env.DB_pass,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: process.env.DB_type,
    connection: {
      host: process.env.DB_host,
      database: process.env.DB_name,
      user: process.env.DB_user,
      password: process.env.DB_pass,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

};
