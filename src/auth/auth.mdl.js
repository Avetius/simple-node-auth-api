import { Model } from 'objection';
import knex from '../base';

export const client_fields = [
  'id',
  'email',
  'login',
  'phone',
  'blocked',
  'block_reason',
  'verified_email',
  'verified_phone',
  'created_at',
  'updated_at',
];

export const admin_fields = [
  ...client_fields, 'role',
];

export const auth_fields = [
  ...admin_fields, 'password',
];

export class Users extends Model {
  static get tableName() { return 'users'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', minLength: 5, maxLength: 255 },
        login: { type: 'string', minLength: 5, maxLength: 255 },
        phone: { type: 'string', minLength: 5, maxLength: 255 },
        role: {
          type: 'string',
          enum: ['superadmin', 'admin', 'partner', 'client'],
        },
        password: { type: 'string', minLength: 7, maxLength: 255 },
        blocked: { type: 'boolean' },
        block_reason: { type: 'string' },
        verified_email: { type: 'boolean' },
        verified_phone: { type: 'boolean' },
        email_verification_token: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  // This object defines the relations to other models.
  // static get relationMappings() {
  //   const { profile } = require('./profile.model');

  //   return {
  //     profile: {
  //       relation: Model.HasManyRelation,
  //       modelClass: Availability,
  //       join: {
  //         from: 'users.id',
  //         to: 'profile.user_id',
  //       },
  //     },
  //   };
  // }
}

export default Users.bindKnex(knex);
