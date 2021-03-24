import { Model } from 'objection';
import knex from '../base';

export const sn_display_fields = [
  'id',
  'provider',
  'provider_id',
  'profile_url',
  'display_name',
  'given_name',
  'middle_name',
  'family_name',
  'gender',
  'photos',
  'created_at',
  'updated_at',
];
export const sn_auth_fields = [
  ...sn_display_fields,
  'token',
  'refresh_token',
  'emails',
];

export class SocialNetworkAccount extends Model {
  static get tableName() { return 'sn_account'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        provider: {
          type: 'string',
          enum: ['facebook', 'google'],
        },
        provider_id: { type: 'string', minLength: 1, maxLength: 255 },
        profile_url: { type: 'string' },
        token: { type: 'string' },
        refresh_token: { type: 'string' },
        display_name: { type: 'string' },
        given_name: { type: 'string' },
        middle_name: { type: 'string' },
        family_name: { type: 'string' },
        gender: { type: 'string' },
        emails: { type: 'object' },
        photos: { type: 'object' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    const { User } = require('./user.mdl.js');

    return {
      user: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'sn_account.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

export default SocialNetworkAccount.bindKnex(knex);
