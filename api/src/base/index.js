import 'dotenv/config';
import Knex from 'knex';
import { Model } from 'objection';

console.log('>>>>>>>>>BASE/INDEX.JS<<<<<<<<<<');
const knex = Knex({
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
});
Model.knex(knex);

export default knex;
