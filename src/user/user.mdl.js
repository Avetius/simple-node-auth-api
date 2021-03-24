import { Model } from 'objection';
import knex from '../base';

export const user_display_fields = [
  'id',
  'role',
  'blocked',
  'block_reason',
  'avatar',
  'background',
  'created_at',
  'updated_at',
  'deleted_at',
];

export class User extends Model {
  static get tableName() { return 'users'; }

  static get modelPaths() { return [__dirname]; }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        role: {
          type: 'string',
          enum: ['superadmin', 'admin', 'partner', 'client'],
        },
        blocked: { type: 'boolean' },
        block_reason: { type: 'string' },
        avatar: { type: 'string' },
        background: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    const { Login } = require('./login.mdl');
    const { Phone } = require('./phone.mdl');
    const { Client } = require('./client.mdl');
    const { Partner } = require('./partner.mdl');
    const { SocialNetworkAccount } = require('./sn_acc.mdl');

    return {
      login: {
        relation: Model.HasOneRelation,
        modelClass: Login,
        join: {
          from: 'users.id',
          to: 'logins.user_id',
        },
      },
      phones: {
        relation: Model.HasManyRelation,
        modelClass: Phone,
        join: {
          from: 'users.id',
          to: 'phones.user_id',
        },
      },
      social_networks: {
        relation: Model.HasManyRelation,
        modelClass: SocialNetworkAccount,
        join: {
          from: 'users.id',
          to: 'sn_account.user_id',
        },
      },
      client_profile: {
        relation: Model.HasManyRelation,
        modelClass: Client,
        join: {
          from: 'users.id',
          to: 'client_profile.user_id',
        },
      },
      partner_profile: {
        relation: Model.HasManyRelation,
        modelClass: Partner,
        join: {
          from: 'users.id',
          to: 'partner_profile.user_id',
        },
      },
    };
  }

  static get modifiers() {
    const { login_display_fields } = require('./login.mdl');
    const { phone_display_fields } = require('./phone.mdl');
    const { client_display_fields } = require('./client.mdl');
    const { partner_display_fields } = require('./partner.mdl');
    const { sn_display_fields } = require('./sn_acc.mdl');

    return {
      authSelects(query) {
        query.select(user_display_fields)
          .orderBy('id')
          .withGraphFetched('login', (loginBuilder) => {
            loginBuilder.select(login_display_fields);
          })
          .withGraphFetched('phones', (phoneBuilder) => {
            phoneBuilder.select(phone_display_fields);
          })
          .withGraphFetched('client_profile', (clientBuilder) => {
            clientBuilder.select(client_display_fields);
          })
          .withGraphFetched('partner_profile', (partnerBuilder) => {
            partnerBuilder.select(partner_display_fields);
          })
          .withGraphFetched('social_networks', (snBuilder) => {
            snBuilder.select(sn_display_fields);
          })
          .where({
            blocked: false,
            deleted_at: null,
          });
      },
      filterGender(query, gender) {
        query.where('gender', gender);
      },
    };
  }
}

export default User.bindKnex(knex);
