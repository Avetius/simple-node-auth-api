import { Model } from 'objection';
import knex from '../base';

export const client_display_fields = [
  'firstname',
  'lastname',
  'prefix',
  'dob',
  'avatar',
  'background',
  'created_at',
];

export class Client extends Model {
  static get tableName() { return 'client_profile'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        firstname: { type: 'string', minLength: 1, maxLength: 255 },
        lastname: { type: 'string', minLength: 1, maxLength: 255 },
        prefix: {
          type: 'string',
          enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Jr'],
        },
        dob: { type: 'string', format: 'date-time' },
        avatar: { type: 'string', minLength: 1, maxLength: 255 },
        background: { type: 'string', minLength: 1, maxLength: 255 },
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
          from: 'client_profile.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

export default Client.bindKnex(knex);
