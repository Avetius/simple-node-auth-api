import { Model } from 'objection';
import knex from '../base';

export const login_display_fields = [
  'email',
  'login',
  'verified_email',
  'created_at',
];

export const login_fields = [
  ...login_display_fields,
  'password',
  'email_verification_token',
];

export class Login extends Model {
  static get tableName() { return 'logins'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        email: { type: 'string', minLength: 5, maxLength: 255 },
        login: { type: 'string', minLength: 5, maxLength: 255 },
        password: { type: 'string', minLength: 7, maxLength: 255 },
        email_verification_token: { type: 'string' },
        verified_email: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: 'string', format: 'date-time' },
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
          from: 'logins.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

export default Login.bindKnex(knex);
