import { Model } from 'objection';
import knex from '../base';

export const phone_display_fields = [
  'country_code',
  'number',
  'verified_phone',
];

export class Phone extends Model {
  static get tableName() { return 'phones'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        country_code: { type: 'string', minLength: 1, maxLength: 5 },
        number: { type: 'string', minLength: 5, maxLength: 25 },
        verified_phone: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    const { User } = require('./user.mdl');

    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'phones.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

export default Phone.bindKnex(knex);
