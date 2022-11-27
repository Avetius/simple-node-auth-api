import 'dotenv/config';
import Knex from 'knex';
import { Model } from 'objection';
import knexfile from '../../knexfile';

const knex = Knex(knexfile[process.env.NODE_ENV]);
Model.knex(knex);

export default knex;
