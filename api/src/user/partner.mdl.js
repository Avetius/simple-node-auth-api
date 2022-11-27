import { Model } from 'objection';
import knex from '../base';

export const partner_display_fields = [
  'company_name',
  'address1',
  'address2',
  'phone',
  'logo',
  'background',
  'created_at',
];

export class Partner extends Model {
  static get tableName() { return 'partner_profile'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        company_name: { type: 'string', minLength: 1, maxLength: 255 },
        address1: { type: 'string', minLength: 1, maxLength: 255 },
        address2: { type: 'string', minLength: 1, maxLength: 255 },
        phone: { type: 'string', minLength: 1, maxLength: 255 },
        logo: { type: 'string', minLength: 1, maxLength: 255 },
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
          from: 'partner_profile.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

export default Partner.bindKnex(knex);
